import { ref, computed, watch } from "vue";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebaseInit";
import { resolveActionMeta } from "@/config/actionBankMeta";

/**
 * Composable de evidencia híbrida para el Plan de Acción WALA 1-a-1.
 * Realiza una sola carga ligera por negocio (perfil financiero, transacciones recientes 30d,
 * productos, proveedores, clientes, cotizaciones, incidencias, proyecciones y pagos fijos)
 * y evalúa reglas automáticas por acción.
 */
export function useActionEvidence(businessIdRef) {
  const loadingEvidence = ref(false);
  const businessProfile = ref({});
  const recentTransactions = ref([]);
  const products = ref([]);
  const suppliers = ref([]);
  const suppliersCount = ref(0);
  const clients = ref([]);
  const purchaseQuotes = ref([]);
  const supplierIncidents = ref([]);
  const projections = ref([]);
  const recurringPayments = ref([]);
  const loadedForBusinessId = ref(null);

  const loadEvidenceData = async (force = false) => {
    const bId =
      typeof businessIdRef === "function"
        ? businessIdRef()
        : businessIdRef?.value ?? businessIdRef;

    if (!bId) return;
    if (!force && loadedForBusinessId.value === bId) return;

    loadingEvidence.value = true;
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startTs = Timestamp.fromDate(thirtyDaysAgo);

      const profilePromise = getDoc(
        doc(db, "businesses", bId, "settings", "businessProfile")
      ).catch(() => null);

      const txPromise = getDocs(
        query(
          collection(db, "businesses", bId, "transactions"),
          where("createdAt", ">=", startTs)
        )
      ).catch(() => null);

      const productsPromise = getDocs(
        collection(db, "businesses", bId, "products")
      ).catch(() => null);

      const suppliersPromise = getDocs(
        collection(db, "businesses", bId, "suppliers")
      ).catch(() => null);

      const clientsPromise = getDocs(
        collection(db, "businesses", bId, "clients")
      ).catch(() => null);

      const quotesPromise = getDocs(
        collection(db, "businesses", bId, "purchaseQuotes")
      ).catch(() => null);

      const incidentsPromise = getDocs(
        collection(db, "businesses", bId, "supplierIncidents")
      ).catch(() => null);

      const projectionsPromise = getDocs(
        collection(db, "businesses", bId, "projections")
      ).catch(() => null);

      const recurringPromise = getDocs(
        collection(db, "businesses", bId, "recurringPayments")
      ).catch(() => null);

      const [
        profileSnap,
        txSnap,
        prodSnap,
        supSnap,
        cliSnap,
        quotesSnap,
        incSnap,
        projSnap,
        recSnap,
      ] = await Promise.all([
        profilePromise,
        txPromise,
        productsPromise,
        suppliersPromise,
        clientsPromise,
        quotesPromise,
        incidentsPromise,
        projectionsPromise,
        recurringPromise,
      ]);

      businessProfile.value =
        profileSnap && profileSnap.exists() ? profileSnap.data() : {};

      recentTransactions.value = txSnap
        ? txSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        : [];

      products.value = prodSnap
        ? prodSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        : [];

      suppliers.value = supSnap
        ? supSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        : [];
      suppliersCount.value = suppliers.value.length;

      clients.value = cliSnap
        ? cliSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        : [];

      purchaseQuotes.value = quotesSnap
        ? quotesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        : [];

      supplierIncidents.value = incSnap
        ? incSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        : [];

      projections.value = projSnap
        ? projSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        : [];

      recurringPayments.value = recSnap
        ? recSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        : [];

      loadedForBusinessId.value = bId;
    } catch (error) {
      console.error("Error cargando evidencia automática de WALA:", error);
    } finally {
      loadingEvidence.value = false;
    }
  };

  const refreshEvidence = () => loadEvidenceData(true);

  /**
   * Guarda un parámetro de configuración única en businesses/{businessId}/settings/businessProfile
   */
  const saveProfileConfigField = async (fieldKey, value, extraFields = {}) => {
    const bId =
      typeof businessIdRef === "function"
        ? businessIdRef()
        : businessIdRef?.value ?? businessIdRef;
    if (!bId || !fieldKey) return false;

    const payload = {
      [fieldKey]: value,
      ...extraFields,
      updatedAt: new Date(),
    };

    const profileRef = doc(db, "businesses", bId, "settings", "businessProfile");
    await setDoc(profileRef, payload, { merge: true });

    businessProfile.value = {
      ...businessProfile.value,
      ...payload,
    };
    return true;
  };

  const toDateSafe = (ts) => {
    if (!ts) return null;
    if (typeof ts.toDate === "function") return ts.toDate();
    const parsed = new Date(ts);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const isWithinDays = (tx, days) => {
    const d = toDateSafe(tx.createdAt);
    if (!d) return false;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return d.getTime() >= cutoff;
  };

  const isNonOperationalTx = (tx) =>
    tx.isNonCash === true ||
    tx.account === "non_cash" ||
    ["adjustment", "inventory_loss", "bad_debt"].includes(tx.category);

  const weeklyConsistencyDays = computed(() => {
    const daySet = new Set();
    (recentTransactions.value || []).forEach((tx) => {
      if (!isWithinDays(tx, 7) || isNonOperationalTx(tx)) return;
      const d = toDateSafe(tx.createdAt);
      if (d) {
        daySet.add(d.toISOString().slice(0, 10));
      }
    });
    return daySet.size;
  });

  /**
   * Evalúa la regla de evidencia automática de una acción
   */
  const getEvidenceForAction = (action) => {
    if (!action) {
      return {
        hasEvidence: false,
        badgeText: "",
        badgeColor: "gray",
        suggestedCompleted: false,
      };
    }

    const meta =
      action.evidenceRule && action.actionType
        ? action
        : resolveActionMeta(action.indicatorKey, action.tranche, action);

    const rule = meta.evidenceRule;
    if (!rule) {
      return {
        hasEvidence: false,
        badgeText: "",
        badgeColor: "gray",
        suggestedCompleted: false,
      };
    }

    const profile = businessProfile.value || {};
    const txs = recentTransactions.value || [];

    switch (rule.type) {
      case "profile_field_set": {
        const val = profile[rule.field];
        const isSet =
          val !== null &&
          val !== undefined &&
          val !== "" &&
          (typeof val !== "number" || val > 0);
        if (!isSet) {
          return {
            hasEvidence: true,
            badgeText: "Aún sin configurar en WALA",
            badgeColor: "gray",
            suggestedCompleted: false,
          };
        }
        const formatted =
          typeof val === "number"
            ? rule.field === "ownerHourlyRate"
              ? `S/ ${val.toFixed(2)}/hr`
              : `S/ ${val.toFixed(2)}`
            : String(val);
        return {
          hasEvidence: true,
          badgeText: `Configurado en WALA: ${formatted}`,
          badgeColor: "emerald",
          suggestedCompleted: true,
        };
      }

      case "tx_subcategory_count": {
        const days = rule.period === "week" ? 7 : 30;
        const matches = txs.filter((tx) => {
          if (tx.type !== "expense") return false;
          if (!isWithinDays(tx, days)) return false;
          if (rule.subcategory === "personal_withdrawal") {
            return (
              tx.category === "owner_draw" ||
              tx.subcategory === "personal_withdrawal"
            );
          }
          return tx.subcategory === rule.subcategory;
        });
        const total = matches.reduce((s, t) => s + Number(t.amount || 0), 0);
        const minCount = rule.minCount || 1;
        const periodLabel = rule.period === "week" ? "Esta semana" : "Últimos 30 días";

        if (matches.length === 0) {
          return {
            hasEvidence: true,
            badgeText: `${periodLabel}: 0 registros`,
            badgeColor: "amber",
            suggestedCompleted: false,
          };
        }

        return {
          hasEvidence: true,
          badgeText: `${periodLabel}: ${matches.length} registro${
            matches.length > 1 ? "s" : ""
          } (S/ ${total.toFixed(2)})`,
          badgeColor: matches.length >= minCount ? "emerald" : "blue",
          suggestedCompleted: matches.length >= minCount,
        };
      }

      case "tx_count_week": {
        const matches = txs.filter(
          (tx) =>
            isWithinDays(tx, 7) &&
            (!rule.txType || tx.type === rule.txType) &&
            !isNonOperationalTx(tx)
        );
        const minCount = rule.minCount || 1;
        return {
          hasEvidence: true,
          badgeText: `Esta semana: ${matches.length} registro${
            matches.length === 1 ? "" : "s"
          }`,
          badgeColor: matches.length >= minCount ? "emerald" : "amber",
          suggestedCompleted: matches.length >= minCount,
        };
      }

      case "tx_days_week": {
        const daySet = new Set();
        txs.forEach((tx) => {
          if (!isWithinDays(tx, 7) || isNonOperationalTx(tx)) return;
          if (rule.txType && rule.txType !== "both" && tx.type !== rule.txType) {
            return;
          }
          const d = toDateSafe(tx.createdAt);
          if (d) {
            daySet.add(d.toISOString().slice(0, 10));
          }
        });
        const minDays = rule.minDays || 3;
        return {
          hasEvidence: true,
          badgeText: `Esta semana: ${daySet.size} día${
            daySet.size === 1 ? "" : "s"
          } con registros`,
          badgeColor: daySet.size >= minDays ? "emerald" : "blue",
          suggestedCompleted: daySet.size >= minDays,
        };
      }

      case "credit_sales_tracked": {
        const creditTxs = txs.filter(
          (tx) =>
            tx.type === "income" &&
            (tx.paymentStatus === "pending" || tx.paymentStatus === "partial")
        );
        return {
          hasEvidence: true,
          badgeText:
            creditTxs.length > 0
              ? `Créditos activos (30d): ${creditTxs.length}`
              : "Sin ventas al crédito registradas (30d)",
          badgeColor: creditTxs.length > 0 ? "emerald" : "gray",
          suggestedCompleted: creditTxs.length >= (rule.minCount || 1),
        };
      }

      case "receivables_with_due_date": {
        const activeCredits = txs.filter(
          (tx) =>
            tx.type === "income" &&
            tx.paymentStatus !== "written_off" &&
            (tx.paymentStatus === "pending" || tx.paymentStatus === "partial")
        );
        const withDueOrNote = activeCredits.filter(
          (tx) => Boolean(tx.promisedPaymentDate) || Boolean(tx.receivableNote)
        );
        const minCount = rule.minCount || 1;
        return {
          hasEvidence: true,
          badgeText:
            withDueOrNote.length > 0
              ? `${withDueOrNote.length} cuenta(s) con fecha o seguimiento`
              : activeCredits.length > 0
                ? `${activeCredits.length} crédito(s) sin fecha prometida`
                : "Sin créditos activos pendientes (30d)",
          badgeColor: withDueOrNote.length >= minCount ? "emerald" : "amber",
          suggestedCompleted: withDueOrNote.length >= minCount,
        };
      }

      case "waste_logs_month": {
        const wasteTxs = txs.filter(
          (tx) => tx.category === "inventory_loss" && isWithinDays(tx, 30)
        );
        const minCount = rule.minCount || 1;
        const totalLoss = wasteTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
        return {
          hasEvidence: true,
          badgeText:
            wasteTxs.length > 0
              ? `Mermas 30d: ${wasteTxs.length} registro(s) (S/ ${totalLoss.toFixed(2)})`
              : "Sin mermas ni faltantes registrados (30d)",
          badgeColor: wasteTxs.length >= minCount ? "emerald" : "blue",
          suggestedCompleted: wasteTxs.length >= minCount,
        };
      }

      case "clients_with_origin_week": {
        const withOrigin = clients.value.filter(
          (c) => Boolean(c.originChannel && String(c.originChannel).trim())
        );
        const minCount = rule.minCount || 1;
        return {
          hasEvidence: true,
          badgeText: `${withOrigin.length} cliente(s) con canal de origen`,
          badgeColor: withOrigin.length >= minCount ? "emerald" : "amber",
          suggestedCompleted: withOrigin.length >= minCount,
        };
      }

      case "inventory_products_count": {
        const count = products.value.length;
        const minCount = rule.minCount || 5;
        return {
          hasEvidence: true,
          badgeText: `Inventario: ${count} producto${count === 1 ? "" : "s"}`,
          badgeColor: count >= minCount ? "emerald" : "blue",
          suggestedCompleted: count >= minCount,
        };
      }

      case "inventory_stock_logs_recent": {
        const recentUpdates = products.value.filter((p) => {
          const d = toDateSafe(p.lastSaleAt || p.updatedAt);
          return d && Date.now() - d.getTime() <= 30 * 24 * 60 * 60 * 1000;
        });
        return {
          hasEvidence: true,
          badgeText: `${recentUpdates.length} producto(s) con movimiento reciente`,
          badgeColor: recentUpdates.length > 0 ? "emerald" : "blue",
          suggestedCompleted: recentUpdates.length >= (rule.minCount || 1),
        };
      }

      case "inventory_min_stock_count": {
        const withMin = products.value.filter(
          (p) => Number(p.minStock || 0) > 0 || Number(p.safetyStock || 0) > 0
        ).length;
        const minCount = rule.minCount || 3;
        return {
          hasEvidence: true,
          badgeText: `${withMin} producto${
            withMin === 1 ? "" : "s"
          } con stock mínimo`,
          badgeColor: withMin >= minCount ? "emerald" : "amber",
          suggestedCompleted: withMin >= minCount,
        };
      }

      case "product_costed_count": {
        const costed = products.value.filter((p) => {
          const cs = p.costStructure || {};
          return (
            Number(cs.materials || 0) > 0 ||
            Number(cs.mod || 0) > 0 ||
            Number(cs.labor || 0) > 0 ||
            Number(cs.cif || 0) > 0 ||
            Number(cs.total || 0) > 0 ||
            Number(p.cost || 0) > 0
          );
        }).length;
        const minCount = rule.minCount || 1;
        return {
          hasEvidence: true,
          badgeText: `${costed} producto${costed === 1 ? "" : "s"} costeado${
            costed === 1 ? "" : "s"
          }`,
          badgeColor: costed >= minCount ? "emerald" : "amber",
          suggestedCompleted: costed >= minCount,
        };
      }

      case "products_full_costed_ratio": {
        const costables = products.value.filter(
          (p) => (p.type || "MERCH") !== "RAW_MATERIAL"
        );
        const costed = costables.filter((p) => {
          const cs = p.costStructure || {};
          return (
            Number(cs.materials || 0) > 0 ||
            Number(cs.mod || 0) > 0 ||
            Number(cs.labor || 0) > 0 ||
            Number(cs.cif || 0) > 0 ||
            Number(cs.total || 0) > 0 ||
            Number(p.cost || 0) > 0
          );
        }).length;
        const ratio = costables.length > 0 ? costed / costables.length : 0;
        const minRatio = rule.minRatio || 0.8;
        const pct = Math.round(ratio * 100);
        return {
          hasEvidence: true,
          badgeText: `Cobertura costeo: ${costed}/${costables.length} (${pct}%)`,
          badgeColor: ratio >= minRatio ? "emerald" : "amber",
          suggestedCompleted: costables.length > 0 && ratio >= minRatio,
        };
      }

      case "suppliers_count": {
        const minCount = rule.minCount || 3;
        return {
          hasEvidence: true,
          badgeText: `${suppliersCount.value} proveedor${
            suppliersCount.value === 1 ? "" : "es"
          } registrado${suppliersCount.value === 1 ? "" : "s"}`,
          badgeColor: suppliersCount.value >= minCount ? "emerald" : "blue",
          suggestedCompleted: suppliersCount.value >= minCount,
        };
      }

      case "purchase_quotes_month": {
        const recentQuotes = purchaseQuotes.value.filter((q) => {
          const d = toDateSafe(q.createdAt);
          return !d || Date.now() - d.getTime() <= 30 * 24 * 60 * 60 * 1000;
        });
        const minCount = rule.minCount || 1;
        return {
          hasEvidence: true,
          badgeText: `${recentQuotes.length} cotización(es) comparada(s) (30d)`,
          badgeColor: recentQuotes.length >= minCount ? "emerald" : "amber",
          suggestedCompleted: recentQuotes.length >= minCount,
        };
      }

      case "supplier_incidents_tracked": {
        const supWithIncidents = suppliers.value.filter(
          (s) => Number(s.incidentsCount || 0) > 0
        ).length;
        const total = Math.max(supplierIncidents.value.length, supWithIncidents);
        return {
          hasEvidence: true,
          badgeText:
            total > 0
              ? `${total} incidencia(s) / devolución(es) registradas`
              : "Control de incidencias de proveedores activo",
          badgeColor: total > 0 ? "emerald" : "blue",
          suggestedCompleted: supplierIncidents.value.length >= (rule.minCount || 1),
        };
      }

      case "projection_created_period": {
        const now = new Date();
        const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const hasCurrent = projections.value.some((p) => p.periodKey === periodKey || p.id === periodKey);
        const hasAny = projections.value.length > 0;
        return {
          hasEvidence: true,
          badgeText: hasCurrent
            ? `Proyección ${periodKey} definida en P&L`
            : hasAny
              ? `${projections.value.length} proyección(es) guardada(s)`
              : `Sin proyección definida para ${periodKey}`,
          badgeColor: hasCurrent ? "emerald" : "amber",
          suggestedCompleted: hasCurrent,
        };
      }

      case "recurring_payments_count": {
        const count = recurringPayments.value.length;
        const minCount = rule.minCount || 1;
        return {
          hasEvidence: true,
          badgeText: `${count} pago(s) fijo(s) programado(s)`,
          badgeColor: count >= minCount ? "emerald" : "amber",
          suggestedCompleted: count >= minCount,
        };
      }

      case "note_filled": {
        const hasNote =
          typeof action.entrepreneurNote === "string" &&
          action.entrepreneurNote.trim().length > 0;
        if (!hasNote) {
          return {
            hasEvidence: false,
            badgeText: "",
            badgeColor: "gray",
            suggestedCompleted: false,
          };
        }
        return {
          hasEvidence: true,
          badgeText: "Evidencia anotada en bitácora",
          badgeColor: "emerald",
          suggestedCompleted: false,
        };
      }

      default:
        return {
          hasEvidence: false,
          badgeText: "",
          badgeColor: "gray",
          suggestedCompleted: false,
        };
    }
  };

  watch(
    () =>
      typeof businessIdRef === "function"
        ? businessIdRef()
        : businessIdRef?.value,
    (newId) => {
      if (newId) {
        loadEvidenceData();
      }
    },
    { immediate: true }
  );

  return {
    loadingEvidence,
    businessProfile,
    recentTransactions,
    products,
    suppliersCount,
    weeklyConsistencyDays,
    loadEvidenceData,
    refreshEvidence,
    saveProfileConfigField,
    getEvidenceForAction,
  };
}
