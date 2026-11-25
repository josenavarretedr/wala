import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/firebaseInit";
import { round2 } from "@/utils/mathUtils";

export const WASTE_REASON_LABELS = {
  damaged: "Producto dañado",
  expired: "Vencido / Malogrado",
  obsolete: "Sin rotación",
  loss: "Pérdida / Robo",
  count_shortage: "Faltante en conteo físico",
};

/**
 * Crea un asiento de gasto NO MONETARIO en businesses/{businessId}/transactions.
 * Nunca afecta saldos de Caja/Banco (isNonCash: true, account: 'non_cash'),
 * pero sí impacta en el Estado de Resultados (IncomeStatementView).
 */
export async function recordInventoryLossTx({
  businessId,
  productId,
  productDescription,
  quantity,
  unit = "uni",
  unitCost = 0,
  wasteReason = "loss",
  notes = null,
}) {
  if (!businessId || !productId) return null;
  const amount = round2(Math.abs(Number(quantity || 0)) * Number(unitCost || 0));
  if (!(amount > 0)) return null;

  const txId = uuidv4();
  const reasonLabel = WASTE_REASON_LABELS[wasteReason] || "Merma de inventario";

  await setDoc(doc(db, "businesses", businessId, "transactions", txId), {
    uuid: txId,
    type: "expense",
    isNonCash: true,
    account: "non_cash",
    category: "inventory_loss",
    subcategory: wasteReason,
    statementLine: "inventory_shrinkage",
    amount,
    description: `Merma (${reasonLabel}): ${productDescription} (${quantity} ${unit})`,
    productId,
    quantity: Number(quantity || 0),
    notes: notes || null,
    createdAt: serverTimestamp(),
  });

  return { txId, amount };
}

/**
 * Crea un asiento NO MONETARIO de castigo por cuenta incobrable en el P&L.
 */
export async function recordBadDebtTx({
  businessId,
  relatedTransactionId,
  clientId = null,
  clientName = "Cliente",
  amount,
  reason = "Cuenta incobrable > 30 días",
}) {
  const cleanAmount = round2(Number(amount || 0));
  if (!businessId || !(cleanAmount > 0)) return null;

  const txId = uuidv4();
  await setDoc(doc(db, "businesses", businessId, "transactions", txId), {
    uuid: txId,
    type: "expense",
    isNonCash: true,
    account: "non_cash",
    category: "bad_debt",
    subcategory: "written_off_receivable",
    statementLine: "opex_bad_debt",
    amount: cleanAmount,
    description: `Incobrable castigado: ${clientName}`,
    relatedTransactionId: relatedTransactionId || null,
    clientId: clientId || null,
    notes: reason,
    createdAt: serverTimestamp(),
  });

  return { txId, amount: cleanAmount };
}
