<template>
  <div class="admin-users-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="title-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fill-rule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clip-rule="evenodd"
              />
            </svg>
            Panel de Negocios
          </h1>
          <p class="page-subtitle">
            Administra suscripciones y programas de todos los negocios en Wala.
          </p>
        </div>
        <div class="header-actions">
          <div class="stats-chips">
            <span class="chip chip-total"
              >{{ businessList.length }} negocios</span
            >
            <span class="chip chip-pro">{{ proCount }} Pro/Max</span>
            <span class="chip chip-free">{{ freeCount }} Free</span>
          </div>
          <button @click="fetchData" :disabled="loading" class="btn-refresh">
            <svg
              v-if="loading"
              class="spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ loading ? "Cargando..." : "Actualizar" }}
          </button>
        </div>
      </div>

      <!-- Search y filtros -->
      <div class="search-row">
        <div class="search-box">
          <svg
            class="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="Buscar negocio..."
          />
        </div>
        <div class="filter-tabs">
          <button
            v-for="f in filters"
            :key="f.key"
            @click="activeFilter = f.key"
            :class="['filter-tab', activeFilter === f.key && 'active']"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-bar">
      <svg
        class="h-5 w-5 text-red-400 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading && !businessList.length" class="loading-state">
      <div v-for="n in 5" :key="n" class="skeleton-row">
        <div class="skeleton-avatar" />
        <div class="skeleton-content">
          <div class="skeleton-line w-48" />
          <div class="skeleton-line w-32 short" />
        </div>
        <div class="skeleton-badge" />
        <div class="skeleton-badge" />
      </div>
    </div>

    <!-- Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-name">Negocio</th>
            <th class="th-sub">Suscripción</th>
            <th class="th-prog">Programas</th>
            <th class="th-date">Registro</th>
            <th class="th-actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredBusinesses.length === 0">
            <td colspan="5" class="empty-state">
              <svg
                class="empty-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p>No se encontraron negocios</p>
            </td>
          </tr>
          <tr
            v-for="biz in filteredBusinesses"
            :key="biz.businessId"
            class="data-row"
          >
            <!-- Nombre -->
            <td class="td-name">
              <div class="business-info">
                <div
                  class="business-avatar"
                  :style="{ background: getAvatarGradient(biz.businessName) }"
                >
                  {{ biz.businessName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="business-name">{{ biz.businessName }}</div>
                  <div class="business-id">
                    {{ biz.businessId.slice(0, 8) }}...
                  </div>
                </div>
              </div>
            </td>

            <!-- Suscripción -->
            <td class="td-sub">
              <button
                @click="openSubscriptionModal(biz)"
                class="plan-badge-btn"
                :class="getPlanClass(biz.subscription.plan)"
              >
                <span class="plan-icon">{{
                  getPlanIcon(biz.subscription.plan)
                }}</span>
                <span class="plan-name">{{
                  biz.subscription.plan.toUpperCase()
                }}</span>
                <svg
                  class="edit-hint"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <div v-if="biz.subscription.endDate" class="sub-expiry">
                Vence: {{ formatDate(biz.subscription.endDate) }}
              </div>
            </td>

            <!-- Programas -->
            <td class="td-prog">
              <div class="programs-cell">
                <div v-if="biz.programs.length === 0" class="no-programs">
                  Sin programas
                </div>
                <template v-else>
                  <span
                    v-for="(progId, i) in biz.programs.slice(0, 2)"
                    :key="i"
                    class="program-tag"
                    :title="getProgramName(progId)"
                  >
                    {{ getProgramName(progId) }}
                  </span>
                  <span v-if="biz.programs.length > 2" class="program-tag more"
                    >+{{ biz.programs.length - 2 }}</span
                  >
                </template>
                <button
                  @click="openProgramModal(biz)"
                  class="add-program-btn"
                  title="Inscribir a programa"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </td>

            <!-- Fecha -->
            <td class="td-date">{{ formatDate(biz.createdAt) }}</td>

            <!-- Acciones -->
            <td class="td-actions">
              <div class="action-buttons">
                <button
                  @click="openSubscriptionModal(biz)"
                  class="action-btn"
                  title="Editar suscripción"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </button>
                <button
                  @click="openProgramModal(biz)"
                  class="action-btn"
                  title="Inscribir a programa"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══════════════════════════════════════════════════
    MODAL: Editar Suscripción
    ═══════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="subModal.open"
        class="modal-overlay"
        @click.self="subModal.open = false"
      >
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Editar Suscripción</h2>
              <p class="modal-subtitle">
                {{ subModal.business?.businessName }}
              </p>
            </div>
            <button @click="subModal.open = false" class="modal-close">
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Selector de plan -->
            <label class="field-label">Plan</label>
            <div class="plan-selector">
              <button
                v-for="p in plans"
                :key="p.value"
                @click="
                  subForm.plan = p.value;
                  if (p.value === 'free')
                    subForm.allowUnlimitedPaidPlan = false;
                "
                :class="[
                  'plan-option',
                  subForm.plan === p.value && 'selected',
                  p.colorClass,
                ]"
              >
                <span class="plan-option-icon">{{ p.icon }}</span>
                <span class="plan-option-name">{{ p.label }}</span>
              </button>
            </div>

            <!-- Estado -->
            <label class="field-label">Estado</label>
            <select v-model="subForm.status" class="field-select">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <!-- Fecha de fin -->
            <label class="field-label">
              Fecha de vencimiento
              <span class="field-hint"
                >(obligatoria para planes pagos, salvo override explícito)</span
              >
            </label>
            <input v-model="subForm.endDate" type="date" class="field-input" />

            <label v-if="isPaidPlan(subForm.plan)" class="checkbox-row">
              <input
                v-model="subForm.allowUnlimitedPaidPlan"
                type="checkbox"
                class="field-checkbox"
              />
              <span
                >Permitir plan pago sin fecha de vencimiento (override
                admin)</span
              >
            </label>

            <p
              v-if="
                isPaidPlan(subForm.plan) &&
                !subForm.endDate &&
                !subForm.allowUnlimitedPaidPlan
              "
              class="field-error"
            >
              Debes definir una fecha de vencimiento o activar el override
              explícito.
            </p>

            <p
              v-if="
                isPaidPlan(subForm.plan) &&
                subForm.allowUnlimitedPaidPlan &&
                !subForm.endDate
              "
              class="field-warning"
            >
              Este cambio dejará la suscripción pagada sin vencimiento hasta
              nueva edición manual.
            </p>

            <!-- Info actual -->
            <div class="current-info">
              <div class="info-row">
                <span class="info-label">Plan actual:</span>
                <span
                  :class="[
                    'info-value',
                    getPlanClass(subModal.business?.subscription?.plan),
                  ]"
                >
                  {{ subModal.business?.subscription?.plan?.toUpperCase() }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Vence:</span>
                <span class="info-value">{{
                  formatDate(subModal.business?.subscription?.endDate) || "—"
                }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="subModal.open = false" class="btn-secondary">
              Cancelar
            </button>
            <button
              @click="submitSubscription"
              :disabled="subModal.saving"
              class="btn-primary"
            >
              <svg
                v-if="subModal.saving"
                class="spin h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ subModal.saving ? "Guardando..." : "Actualizar plan" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════════════════════════════════════════════
    MODAL: Inscribir a Programa
    ═══════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="progModal.open"
        class="modal-overlay"
        @click.self="progModal.open = false"
      >
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Inscribir a Programa</h2>
              <p class="modal-subtitle">
                {{ progModal.business?.businessName }}
              </p>
            </div>
            <button @click="progModal.open = false" class="modal-close">
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Programas actuales -->
            <div v-if="progModal.business?.programs?.length" class="mb-5">
              <label class="field-label">Programas actuales</label>
              <div class="current-programs">
                <span
                  v-for="progId in progModal.business.programs"
                  :key="progId"
                  class="program-tag-lg"
                >
                  {{ getProgramName(progId) }}
                </span>
              </div>
            </div>

            <!-- Selector de programa -->
            <label class="field-label">Seleccionar programa</label>
            <div v-if="programList.length === 0" class="empty-programs">
              <p>No hay programas activos disponibles.</p>
            </div>
            <div v-else class="program-list">
              <button
                v-for="prog in availablePrograms"
                :key="prog.programId"
                @click="progForm.programId = prog.programId"
                :class="[
                  'program-option',
                  progForm.programId === prog.programId && 'selected',
                ]"
              >
                <div class="program-option-header">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-2 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span class="font-semibold text-gray-900">{{
                    prog.name
                  }}</span>
                </div>
                <p class="program-option-org">{{ prog.organizationName }}</p>
                <p v-if="prog.endDate" class="program-option-date">
                  Termina: {{ formatDate(prog.endDate) }}
                </p>
              </button>
              <div v-if="availablePrograms.length === 0" class="empty-programs">
                <p>
                  El negocio ya está inscrito en todos los programas
                  disponibles.
                </p>
              </div>
            </div>

            <!-- Warning / nota -->
            <div v-if="progForm.programId" class="modal-note">
              <svg
                class="h-4 w-4 text-amber-500 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                >Si el negocio está en plan Free, su suscripción se actualizará
                automáticamente a <strong>Pro</strong> hasta la fecha de fin del
                programa.</span
              >
            </div>
          </div>

          <div class="modal-footer">
            <button @click="progModal.open = false" class="btn-secondary">
              Cancelar
            </button>
            <button
              @click="submitEnroll"
              :disabled="progModal.saving || !progForm.programId"
              class="btn-primary green"
            >
              <svg
                v-if="progModal.saving"
                class="spin h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ progModal.saving ? "Inscribiendo..." : "Inscribir negocio" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast simple -->
    <Teleport to="body">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useAdmin } from "@/composables/useAdmin";

const {
  loading,
  error,
  businessList,
  programList,
  loadAllBusinesses,
  loadAllPrograms,
  updateSubscription,
  enrollBusinessInProgram,
} = useAdmin();

// ─── Search & Filters ────────────────────────────────────────────────────────
const searchQuery = ref("");
const activeFilter = ref("all");

const filters = [
  { key: "all", label: "Todos" },
  { key: "free", label: "Free" },
  { key: "pro", label: "Pro" },
  { key: "max", label: "Max" },
  { key: "programs", label: "Con programa" },
];

const filteredBusinesses = computed(() => {
  let list = businessList.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (b) =>
        b.businessName.toLowerCase().includes(q) || b.businessId.includes(q),
    );
  }
  if (activeFilter.value === "free")
    list = list.filter((b) => b.subscription.plan === "free");
  else if (activeFilter.value === "pro")
    list = list.filter((b) => b.subscription.plan === "pro");
  else if (activeFilter.value === "max")
    list = list.filter(
      (b) => b.subscription.plan === "max" || b.subscription.plan === "premium",
    );
  else if (activeFilter.value === "programs")
    list = list.filter((b) => b.programs.length > 0);
  return list;
});

const proCount = computed(
  () =>
    businessList.value.filter((b) =>
      ["pro", "max", "premium"].includes(b.subscription?.plan),
    ).length,
);
const freeCount = computed(
  () =>
    businessList.value.filter(
      (b) => b.subscription?.plan === "free" || !b.subscription?.plan,
    ).length,
);

// ─── Plans config ────────────────────────────────────────────────────────────
const plans = [
  { value: "free", label: "Free", icon: "🆓", colorClass: "plan-free" },
  { value: "pro", label: "Pro", icon: "⚡", colorClass: "plan-pro" },
  { value: "max", label: "Max", icon: "👑", colorClass: "plan-max" },
];

// ─── Subscription Modal ───────────────────────────────────────────────────────
const subModal = reactive({ open: false, business: null, saving: false });
const subForm = reactive({
  plan: "free",
  status: "active",
  endDate: "",
  allowUnlimitedPaidPlan: false,
});

const isPaidPlan = (plan) => ["pro", "max", "premium"].includes(plan);

function openSubscriptionModal(biz) {
  subModal.business = biz;
  subForm.plan = biz.subscription?.plan || "free";
  subForm.status = biz.subscription?.status || "active";
  subForm.endDate = biz.subscription?.endDate
    ? biz.subscription.endDate.slice(0, 10)
    : "";
  subForm.allowUnlimitedPaidPlan = isPaidPlan(subForm.plan) && !subForm.endDate;
  subModal.open = true;
}

async function submitSubscription() {
  if (
    isPaidPlan(subForm.plan) &&
    !subForm.endDate &&
    !subForm.allowUnlimitedPaidPlan
  ) {
    showToast(
      "❌ Los planes pagos requieren fecha de vencimiento o override explícito.",
      "error",
    );
    return;
  }

  subModal.saving = true;
  try {
    await updateSubscription(subModal.business.businessId, {
      plan: subForm.plan,
      status: subForm.status,
      endDate: subForm.endDate || null,
      allowUnlimitedPaidPlan: subForm.allowUnlimitedPaidPlan,
    });
    showToast("✅ Suscripción actualizada correctamente", "success");
    subModal.open = false;
  } catch (e) {
    showToast(`❌ ${e.message}`, "error");
  } finally {
    subModal.saving = false;
  }
}

// ─── Program Modal ─────────────────────────────────────────────────────────────
const progModal = reactive({ open: false, business: null, saving: false });
const progForm = reactive({ programId: "" });

const availablePrograms = computed(() => {
  if (!progModal.business) return [];
  const enrolledIds = progModal.business.programs || [];
  return programList.value.filter((p) => !enrolledIds.includes(p.programId));
});

function openProgramModal(biz) {
  progModal.business = biz;
  progForm.programId = "";
  progModal.open = true;
}

async function submitEnroll() {
  if (!progForm.programId) return;
  progModal.saving = true;
  try {
    const result = await enrollBusinessInProgram(
      progModal.business.businessId,
      progForm.programId,
    );
    showToast(`✅ ${result.message}`, "success");
    progModal.open = false;
  } catch (e) {
    showToast(`❌ ${e.message || error.value}`, "error");
  } finally {
    progModal.saving = false;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getProgramName = (programId) => {
  const prog = programList.value.find((p) => p.programId === programId);
  return prog ? prog.name : programId.slice(0, 8) + "...";
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

const getPlanClass = (plan) => {
  if (plan === "max" || plan === "premium") return "plan-max";
  if (plan === "pro") return "plan-pro";
  return "plan-free";
};

const getPlanIcon = (plan) => {
  if (plan === "max" || plan === "premium") return "👑";
  if (plan === "pro") return "⚡";
  return "🆓";
};

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];
const getAvatarGradient = (name) =>
  GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];

// ─── Toast ─────────────────────────────────────────────────────────────────────
const toast = reactive({ show: false, message: "", type: "success" });
let toastTimer = null;
function showToast(message, type = "success") {
  clearTimeout(toastTimer);
  toast.message = message;
  toast.type = type;
  toast.show = true;
  toastTimer = setTimeout(() => {
    toast.show = false;
  }, 3500);
}

// ─── Init ──────────────────────────────────────────────────────────────────────
const fetchData = async () => {
  await Promise.all([loadAllBusinesses(), loadAllPrograms()]);
};

onMounted(fetchData);
</script>

<style scoped>
/* ── Page Layout ─────────────────────────────── */
.admin-users-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: "Inter", "Segoe UI", sans-serif;
}

/* ── Header ──────────────────────────────────── */
.page-header {
  margin-bottom: 1.5rem;
}
.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}
.page-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}
.title-icon {
  width: 2rem;
  height: 2rem;
  color: #4f46e5;
}
.page-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.stats-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.chip {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.chip-total {
  background: #e0e7ff;
  color: #3730a3;
}
.chip-pro {
  background: #ede9fe;
  color: #6d28d9;
}
.chip-free {
  background: #f3f4f6;
  color: #374151;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  border-radius: 0.75rem;
  background: #4f46e5;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;
}
.btn-refresh:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-1px);
}
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Search & Filters ────────────────────────── */
.search-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.search-box {
  position: relative;
  flex: 0 0 280px;
}
.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.1rem;
  height: 1.1rem;
  color: #9ca3af;
}
.search-input {
  width: 100%;
  padding: 0.55rem 0.75rem 0.55rem 2.25rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus {
  border-color: #6366f1;
}

.filter-tabs {
  display: flex;
  gap: 0.25rem;
}
.filter-tab {
  padding: 0.4rem 0.9rem;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: 1.5px solid #e5e7eb;
  color: #6b7280;
  transition: all 0.15s;
}
.filter-tab:hover {
  border-color: #6366f1;
  color: #4f46e5;
}
.filter-tab.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

/* ── Error ───────────────────────────────────── */
.error-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* ── Loading Skeleton ────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border-radius: 0.875rem;
  border: 1px solid #f3f4f6;
  animation: pulse 1.5s ease-in-out infinite;
}
.skeleton-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  flex-shrink: 0;
}
.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.skeleton-line {
  height: 0.875rem;
  border-radius: 0.4rem;
  background: #e5e7eb;
}
.skeleton-line.w-48 {
  width: 12rem;
}
.skeleton-line.w-32 {
  width: 8rem;
}
.skeleton-line.short {
  height: 0.7rem;
}
.skeleton-badge {
  width: 5rem;
  height: 1.5rem;
  border-radius: 999px;
  background: #e5e7eb;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ── Table ───────────────────────────────────── */
.table-container {
  background: #fff;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.07);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  padding: 0.875rem 1.25rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.th-name {
  width: 30%;
}
.th-sub {
  width: 22%;
}
.th-prog {
  width: 22%;
}
.th-date {
  width: 14%;
}
.th-actions {
  width: 12%;
}

.data-row {
  transition: background 0.12s;
}
.data-row:hover {
  background: #f9fafb;
}
.data-row td {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

/* ── Business cell ───────────────────────────── */
.business-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.business-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 0.875rem;
  flex-shrink: 0;
}
.business-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}
.business-id {
  color: #9ca3af;
  font-size: 0.75rem;
  font-family: monospace;
}

/* ── Plan badges ─────────────────────────────── */
.plan-badge-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.15s;
}
.plan-badge-btn:hover .edit-hint {
  opacity: 1;
}
.edit-hint {
  width: 0.85rem;
  height: 0.85rem;
  opacity: 0;
  transition: opacity 0.15s;
}
.plan-icon {
  font-size: 0.85rem;
}
.plan-free {
  background: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
}
.plan-pro {
  background: #ede9fe;
  color: #5b21b6;
  border-color: #c4b5fd;
}
.plan-max {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
}

.sub-expiry {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.3rem;
}

/* ── Programs cell ───────────────────────────── */
.programs-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.no-programs {
  font-size: 0.75rem;
  color: #d1d5db;
  font-style: italic;
}
.program-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 0.4rem;
  background: #d1fae5;
  color: #065f46;
  font-size: 0.7rem;
  font-weight: 600;
  max-width: 8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.program-tag.more {
  background: #e5e7eb;
  color: #6b7280;
}
.add-program-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.4rem;
  background: #f0fdf4;
  border: 1.5px dashed #86efac;
  color: #16a34a;
  cursor: pointer;
  transition: all 0.15s;
}
.add-program-btn:hover {
  background: #d1fae5;
  border-color: #22c55e;
}

/* ── Action buttons ──────────────────────────── */
.action-buttons {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn:hover {
  background: #e0e7ff;
  color: #4f46e5;
}

/* ── Empty state ─────────────────────────────── */
.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  color: #9ca3af;
}
.empty-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 0.75rem;
  opacity: 0.5;
}

/* ── Modal ───────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal-card {
  background: #fff;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 32rem;
  box-shadow: 0 20px 60px rgb(0 0 0 / 0.2);
  overflow: hidden;
  animation: slideUp 0.2s ease;
}
@keyframes slideUp {
  from {
    transform: translateY(24px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}
.modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.2rem;
}
.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}
.modal-close {
  padding: 0.35rem;
  border-radius: 0.5rem;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s;
}
.modal-close:hover {
  background: #e5e7eb;
}
.modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}

/* ── Form fields ─────────────────────────────── */
.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.4rem;
}
.field-hint {
  font-weight: 400;
  color: #9ca3af;
  font-size: 0.75rem;
}
.field-select,
.field-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.65rem;
  font-size: 0.875rem;
  color: #111827;
  outline: none;
  transition: border-color 0.15s;
  background: #fff;
}
.field-select:focus,
.field-input:focus {
  border-color: #6366f1;
}
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.82rem;
  color: #374151;
}
.field-checkbox {
  width: 0.95rem;
  height: 0.95rem;
  accent-color: #4f46e5;
}
.field-error {
  margin: 0;
  font-size: 0.78rem;
  color: #b91c1c;
}
.field-warning {
  margin: 0;
  font-size: 0.78rem;
  color: #92400e;
}

/* ── Plan selector ───────────────────────────── */
.plan-selector {
  display: flex;
  gap: 0.5rem;
}
.plan-option {
  flex: 1;
  padding: 0.6rem 0.5rem;
  border-radius: 0.75rem;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.plan-option-icon {
  font-size: 1.25rem;
}
.plan-option-name {
  font-size: 0.75rem;
  font-weight: 700;
}
.plan-option.plan-free.selected {
  border-color: #6b7280;
  background: #f9fafb;
}
.plan-option.plan-pro.selected {
  border-color: #7c3aed;
  background: #ede9fe;
}
.plan-option.plan-max.selected {
  border-color: #d97706;
  background: #fef3c7;
}
.plan-option:not(.selected):hover {
  border-color: #6366f1;
  background: #f5f3ff;
}

/* ── Current info ────────────────────────────── */
.current-info {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}
.info-label {
  color: #6b7280;
}
.info-value {
  font-weight: 600;
  color: #111827;
}

/* ── Program list ────────────────────────────── */
.program-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 16rem;
  overflow-y: auto;
}
.program-option {
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  text-align: left;
  background: #fff;
  transition: all 0.15s;
}
.program-option:hover {
  border-color: #6366f1;
  background: #f5f3ff;
}
.program-option.selected {
  border-color: #059669;
  background: #f0fdf4;
}
.program-option-header {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}
.program-option-org {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.15rem;
  padding-left: 1.5rem;
}
.program-option-date {
  font-size: 0.7rem;
  color: #9ca3af;
  padding-left: 1.5rem;
}
.current-programs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.program-tag-lg {
  padding: 0.3rem 0.7rem;
  border-radius: 0.5rem;
  background: #d1fae5;
  color: #065f46;
  font-size: 0.8rem;
  font-weight: 600;
}
.empty-programs {
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
  padding: 1rem;
}
.modal-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  font-size: 0.8rem;
  color: #78350f;
  line-height: 1.5;
}

/* ── Buttons ─────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.4rem;
  border-radius: 0.75rem;
  background: #4f46e5;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-primary.green {
  background: #059669;
}
.btn-primary.green:hover:not(:disabled) {
  background: #047857;
}
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.2rem;
  border-radius: 0.75rem;
  background: #f9fafb;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary:hover {
  background: #f3f4f6;
}

/* ── Toast ───────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.12);
  z-index: 100;
  animation: fadeInUp 0.25s ease;
}
.toast.success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}
.toast.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
@keyframes fadeInUp {
  from {
    transform: translateX(-50%) translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
