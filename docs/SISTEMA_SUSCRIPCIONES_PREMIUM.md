# 🔐 Sistema de Suscripciones Premium/Free - Documentación Completa

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de Datos en Firestore](#estructura-de-datos-en-firestore)
4. [Componentes Creados](#componentes-creados)
5. [API y Uso](#api-y-uso)
6. [Ejemplos de Implementación](#ejemplos-de-implementación)
7. [Testing y Verificación](#testing-y-verificación)
8. [Migración de Datos](#migración-de-datos)

---

## 📖 Introducción

Este sistema permite implementar un modelo **freemium** (Free vs Premium) a nivel de **negocio**, no de usuario. Esto significa que:

- ✅ **Un negocio** puede tener plan Free o Premium
- ✅ **Todos los usuarios** de ese negocio (gerente + empleados) comparten el mismo plan
- ✅ Las **features** se habilitan/deshabilitan según el plan del negocio
- ✅ El control es desde el **frontend** ("efecto placebo")
- ✅ No requiere Custom Claims de Firebase

---

## 🏗️ Arquitectura del Sistema

### Flujo de Datos

```
┌─────────────────┐
│  Firestore DB   │ ← Almacena subscription, features, usage
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ businessStore   │ ← Getters: isPremium, hasFeature, limits
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│useSubscription()│ ← Composable para componentes
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Componentes   │ ← FeatureGate, PremiumBadge
└─────────────────┘
```

### Componentes del Sistema

| Archivo              | Tipo       | Descripción                                    |
| -------------------- | ---------- | ---------------------------------------------- |
| `useSubscription.js` | Composable | API principal para verificar planes y features |
| `businessStore.js`   | Store      | Gestiona estado de suscripción y features      |
| `PremiumBadge.vue`   | Componente | Badge visual del plan actual                   |
| `FeatureGate.vue`    | Componente | Bloquea/desbloquea contenido según feature     |
| `PlansView.vue`      | Vista      | Página de comparación y upgrade de planes      |
| `router/index.js`    | Router     | Guard para verificar features en rutas         |

---

## 💾 Estructura de Datos en Firestore

### Documento `businesses/{businessId}`

```javascript
{
  // Datos existentes del negocio
  id: "business-uuid",
  nombre: "Mi Negocio",
  tipo: "restaurante",
  gerenteId: "user-uid",
  // ... otros campos ...

  // ✨ NUEVOS CAMPOS: Suscripción
  subscription: {
    plan: "free",              // "free" | "premium" | "trial"
    status: "active",          // "active" | "inactive" | "expired"
    startDate: Timestamp,      // Fecha de inicio
    endDate: Timestamp | null, // null para free, fecha para premium/trial
    trialUsed: false,          // Si ya usó el período de prueba

    // Metadata de pago (opcional)
    paymentMethod: null,
    lastPaymentDate: null,
    autoRenew: false,

    // Auditoría
    updatedAt: Timestamp,
    updatedBy: "user-uid"
  },

  // ✨ NUEVOS CAMPOS: Features habilitadas (cache)
  features: {
    maxEmployees: 3,           // free: 3, premium: 999999
    maxProducts: 100,          // free: 100, premium: 999999
    advancedReports: false,
    multiLocation: false,
    apiAccess: false,
    prioritySupport: false,
    customBranding: false,
    aiClassification: false,
    exportData: false
  },

  // ✨ NUEVOS CAMPOS: Stats de uso
  usage: {
    employeeCount: 2,
    productCount: 45,
    lastUpdated: Timestamp
  }
}
```

### Planes Disponibles

#### 🆓 Plan Free

```javascript
{
  maxEmployees: 3,
  maxProducts: 100,
  advancedReports: false,
  multiLocation: false,
  apiAccess: false,
  prioritySupport: false,
  customBranding: false,
  aiClassification: false,
  exportData: false
}
```

#### 👑 Plan Premium

```javascript
{
  maxEmployees: 999999, // "unlimited"
  maxProducts: 999999,
  advancedReports: true,
  multiLocation: true,
  apiAccess: true,
  prioritySupport: true,
  customBranding: true,
  aiClassification: true,
  exportData: true
}
```

---

## 🧩 Componentes Creados

### 1. `useSubscription()` - Composable Principal

**Ubicación:** `src/composables/useSubscription.js`

**API Pública:**

```javascript
const {
  // Estado reactivo
  isPremium, // computed<boolean>
  isFree, // computed<boolean>
  isTrialActive, // computed<boolean>
  subscription, // computed<object>
  limits, // computed<object>
  daysRemaining, // computed<number|null>
  planInfo, // computed<object>
  shouldShowExpirationWarning, // computed<boolean>

  // Verificación de acceso
  hasAccess, // (featureName: string) => boolean
  checkLimit, // (resourceType: string) => boolean
  canAddEmployee, // computed<boolean>
  canAddProduct, // computed<boolean>

  // Acciones
  requireFeature, // (featureName: string, showModal?: boolean) => boolean
  requireLimit, // (resourceType: string, showModal?: boolean) => boolean
  showUpgradeModal, // (featureName: string, customMessage?: string) => void
  goToPlans, // () => void
} = useSubscription();
```

**Ejemplo de Uso:**

```javascript
import { useSubscription } from "@/composables/useSubscription";

export default {
  setup() {
    const { isPremium, hasAccess, requireFeature, limits } = useSubscription();

    const handleExportData = () => {
      // Verificar y bloquear si no tiene acceso
      if (!requireFeature("exportData")) {
        return; // Se mostró modal automáticamente
      }

      // Continuar con exportación...
      console.log("Exportando datos...");
    };

    return {
      isPremium,
      hasAccess,
      limits,
      handleExportData,
    };
  },
};
```

---

### 2. `<PremiumBadge />` - Badge Visual

**Ubicación:** `src/components/ui/PremiumBadge.vue`

**Props:**

| Prop        | Tipo    | Default | Descripción                                    |
| ----------- | ------- | ------- | ---------------------------------------------- |
| `clickable` | Boolean | `true`  | Si el badge navega a planes al hacer click     |
| `showDays`  | Boolean | `false` | Si muestra días restantes en planes temporales |
| `size`      | String  | `'md'`  | Tamaño del badge (`'sm'`, `'md'`, `'lg'`)      |

**Eventos:**

| Evento  | Payload    | Descripción                        |
| ------- | ---------- | ---------------------------------- |
| `click` | `planInfo` | Emitido al hacer click en el badge |

**Ejemplo de Uso:**

```vue
<template>
  <div>
    <!-- Badge simple -->
    <PremiumBadge />

    <!-- Badge no clickeable -->
    <PremiumBadge :clickable="false" />

    <!-- Badge con días restantes -->
    <PremiumBadge :show-days="true" />

    <!-- Badge con evento personalizado -->
    <PremiumBadge @click="handleBadgeClick" />
  </div>
</template>

<script setup>
import PremiumBadge from "@/components/ui/PremiumBadge.vue";

const handleBadgeClick = (planInfo) => {
  console.log("Plan actual:", planInfo.name);
};
</script>
```

---

### 3. `<FeatureGate />` - Control de Acceso

**Ubicación:** `src/components/ui/FeatureGate.vue`

**Props:**

| Prop                | Tipo    | Default      | Descripción                                     |
| ------------------- | ------- | ------------ | ----------------------------------------------- |
| `feature`           | String  | **required** | Feature requerida para desbloquear              |
| `title`             | String  | `null`       | Título personalizado cuando está bloqueado      |
| `description`       | String  | `null`       | Descripción personalizada cuando está bloqueado |
| `showUpgradeButton` | Boolean | `true`       | Si muestra botón de upgrade                     |
| `size`              | String  | `'md'`       | Tamaño del contenedor bloqueado                 |

**Slots:**

| Slot      | Descripción                              |
| --------- | ---------------------------------------- |
| `default` | Contenido que se muestra si tiene acceso |
| `locked`  | UI personalizada cuando está bloqueado   |
| `actions` | Botones de acción personalizados         |

**Eventos:**

| Evento          | Payload       | Descripción                             |
| --------------- | ------------- | --------------------------------------- |
| `blocked`       | `featureName` | Emitido cuando el acceso está bloqueado |
| `upgrade-click` | `featureName` | Emitido al hacer click en upgrade       |

**Ejemplo de Uso:**

```vue
<template>
  <div>
    <!-- Uso básico -->
    <FeatureGate feature="advancedReports">
      <AdvancedReportsPanel />
    </FeatureGate>

    <!-- Con personalización -->
    <FeatureGate
      feature="aiClassification"
      title="Clasificación con IA"
      description="Usa Grok para clasificar productos automáticamente"
      @blocked="handleBlocked"
    >
      <AIClassificationPanel />
    </FeatureGate>

    <!-- Con UI bloqueada personalizada -->
    <FeatureGate feature="exportData">
      <template #default>
        <ExportPanel />
      </template>

      <template #locked>
        <div class="custom-lock-screen">
          <h3>¡Exporta tus datos!</h3>
          <p>Desbloquea esta función con Premium</p>
        </div>
      </template>
    </FeatureGate>

    <!-- Sin botón de upgrade (solo mostrar bloqueado) -->
    <FeatureGate feature="apiAccess" :show-upgrade-button="false">
      <APIDocumentation />
    </FeatureGate>
  </div>
</template>

<script setup>
const handleBlocked = (featureName) => {
  console.log("Feature bloqueada:", featureName);
};
</script>
```

---

### 4. `businessStore` - Getters y Actions

**Ubicación:** `src/stores/businessStore.js`

**Nuevos Getters:**

```javascript
// Estado de suscripción
subscription; // Objeto completo de suscripción
isPremium; // boolean - Si tiene plan premium activo
isFree; // boolean - Si tiene plan free
isTrialActive; // boolean - Si está en período de prueba activo
subscriptionDaysRemaining; // number|null - Días restantes

// Verificación de features
hasFeature(featureName); // boolean - Verifica si tiene acceso a una feature

// Verificación de límites
canAddEmployee; // boolean - Si puede agregar más empleados
canAddProduct; // boolean - Si puede agregar más productos
limits; // object - Límites actuales de uso
```

**Nuevas Actions:**

```javascript
// Gestión de features
getFeaturesForPlan(plan); // Obtiene features para un plan
refreshBusinessFeatures(businessId); // Actualiza features del negocio

// Gestión de uso
updateUsageStats(businessId, stats); // Actualiza estadísticas de uso

// Gestión de suscripciones
getDefaultSubscription(); // Obtiene suscripción por defecto (free)
getDefaultUsageStats(); // Obtiene stats de uso por defecto
updateSubscriptionPlan(businessId, newPlan, userId); // Actualiza plan
```

**Ejemplo de Uso:**

```javascript
import { useBusinessStore } from "@/stores/businessStore";

const businessStore = useBusinessStore();

// Verificar si es premium
if (businessStore.isPremium) {
  console.log("Negocio tiene plan Premium");
}

// Verificar feature específica
if (businessStore.hasFeature("advancedReports")) {
  console.log("Puede ver reportes avanzados");
}

// Verificar límites
console.log("Límites actuales:", businessStore.limits);
// {
//   employees: { current: 2, max: 3, available: 1 },
//   products: { current: 45, max: 100, available: 55 }
// }

// Actualizar plan (por ejemplo, en un checkout)
await businessStore.updateSubscriptionPlan(
  "business-id",
  "premium",
  "user-uid"
);
```

---

## 📝 Ejemplos de Implementación

### Ejemplo 1: Vista con Múltiples Features Bloqueadas

```vue
<template>
  <div class="inventory-dashboard">
    <!-- Header con badge de plan -->
    <div class="header">
      <h1>Dashboard de Inventario</h1>
      <PremiumBadge :show-days="true" />
    </div>

    <!-- Feature 1: Clasificación con IA (Premium) -->
    <FeatureGate
      feature="aiClassification"
      title="Clasificación Inteligente"
      description="Deja que la IA clasifique tus productos automáticamente"
    >
      <AIClassificationPanel />
    </FeatureGate>

    <!-- Feature 2: Reportes Avanzados (Premium) -->
    <FeatureGate feature="advancedReports">
      <AdvancedReportsSection />
    </FeatureGate>

    <!-- Feature 3: Exportación de Datos (Premium) -->
    <button @click="handleExport" class="btn-export">
      📊 Exportar Inventario
    </button>

    <!-- Lista básica de productos (siempre visible) -->
    <ProductsList />
  </div>
</template>

<script setup>
import { useSubscription } from "@/composables/useSubscription";
import PremiumBadge from "@/components/ui/PremiumBadge.vue";
import FeatureGate from "@/components/ui/FeatureGate.vue";

const { requireFeature } = useSubscription();

const handleExport = () => {
  if (!requireFeature("exportData")) {
    return; // Modal se muestra automáticamente
  }

  // Continuar con exportación
  console.log("Exportando datos...");
};
</script>
```

---

### Ejemplo 2: Verificar Límites Antes de Agregar

```vue
<template>
  <div class="add-product-form">
    <h2>Agregar Nuevo Producto</h2>

    <!-- Mostrar límite actual -->
    <div class="limit-warning" v-if="showLimitWarning">
      ⚠️ Has usado {{ limits.products.current }} de
      {{ limits.products.max }} productos
      <span v-if="limits.products.available <= 10">
        (solo {{ limits.products.available }} disponibles)
      </span>
    </div>

    <form @submit.prevent="handleSubmit">
      <input v-model="productName" placeholder="Nombre del producto" />
      <!-- más campos... -->

      <button type="submit" :disabled="!canAdd">
        {{ canAdd ? "Agregar Producto" : "Límite Alcanzado" }}
      </button>
    </form>

    <!-- Botón de upgrade si alcanzó límite -->
    <div v-if="!canAdd" class="upgrade-prompt">
      <p>Has alcanzado el límite de productos del plan gratuito</p>
      <button @click="goToPlans" class="btn-premium">
        👑 Actualizar a Premium
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useSubscription } from "@/composables/useSubscription";

const productName = ref("");

const { canAddProduct, limits, requireLimit, goToPlans } = useSubscription();

const canAdd = computed(() => canAddProduct.value);

const showLimitWarning = computed(() => {
  return limits.value.products.available <= 20;
});

const handleSubmit = () => {
  // Verificar límite antes de agregar
  if (!requireLimit("product")) {
    return; // Modal se mostró automáticamente
  }

  // Continuar agregando producto
  console.log("Agregando producto:", productName.value);
  // await inventoryStore.addProduct(...)
};
</script>
```

---

### Ejemplo 3: Ruta Protegida con Feature

```javascript
// En router/index.js

{
  path: 'reports/advanced',
  name: 'AdvancedReports',
  component: () => import('@/views/Reports/AdvancedReports.vue'),
  meta: {
    requiresAuth: true,
    requiresFeature: 'advancedReports', // ✨ Feature requerida
    title: 'Reportes Avanzados'
  }
},
{
  path: 'inventory/ai-classify',
  name: 'AIClassification',
  component: () => import('@/views/Inventory/AIClassification.vue'),
  meta: {
    requiresAuth: true,
    requiresFeature: 'aiClassification', // ✨ Feature requerida
    title: 'Clasificación con IA'
  }
}
```

Si el usuario intenta acceder y no tiene la feature, el router lo redirige automáticamente a `/business/:id/plans?feature=advancedReports`.

---

### Ejemplo 4: Inicializar Negocio con Plan Free

```javascript
// En el onboarding o creación de negocio

import { useBusinessStore } from "@/stores/businessStore";

const businessStore = useBusinessStore();

const createNewBusiness = async () => {
  const businessData = {
    nombre: "Mi Nuevo Negocio",
    tipo: "tienda",
    gerenteId: "user-uid",

    // ✨ Inicializar con plan free
    subscription: businessStore.getDefaultSubscription(),
    features: businessStore.getFeaturesForPlan("free"),
    usage: businessStore.getDefaultUsageStats(),
  };

  await businessStore.createBusiness(businessData);
};
```

---

## 🧪 Testing y Verificación

### Verificar Instalación

1. **Verificar que los archivos existen:**

```bash
# Composable
ls src/composables/useSubscription.js

# Componentes UI
ls src/components/ui/PremiumBadge.vue
ls src/components/ui/FeatureGate.vue

# Vista de planes
ls src/views/Plans/PlansView.vue
```

2. **Verificar que el store se actualizó:**

```bash
# Buscar nuevos getters en businessStore
grep -n "isPremium\|hasFeature\|canAddEmployee" src/stores/businessStore.js
```

3. **Verificar que el router tiene la ruta:**

```bash
# Buscar ruta de planes
grep -n "plans" src/router/index.js
```

---

### Test Manual en Consola del Navegador

1. **Abrir la consola en el navegador**

2. **Acceder al store:**

```javascript
// En Vue DevTools o consola
const businessStore =
  window.$app.config.globalProperties.$pinia._s.get("business");

// Ver estado de suscripción
console.log("Plan:", businessStore.subscription);
console.log("Es Premium:", businessStore.isPremium);
console.log("Features:", businessStore.business?.features);
console.log("Límites:", businessStore.limits);
```

3. **Cambiar plan manualmente (para testing):**

```javascript
// Actualizar a Premium
await businessStore.updateSubscriptionPlan(
  businessStore.getBusinessId,
  "premium",
  "test-user"
);

// Recargar página y verificar cambios
```

---

### Test de Features

Crea un componente de testing:

```vue
<!-- src/views/Testing/SubscriptionTest.vue -->
<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">🧪 Test de Suscripciones</h1>

    <!-- Estado actual -->
    <div class="mb-6 p-4 bg-gray-100 rounded">
      <h2 class="font-bold mb-2">Estado Actual:</h2>
      <p>Plan: {{ planInfo.name }} {{ planInfo.badge }}</p>
      <p>Es Premium: {{ isPremium }}</p>
      <p>Es Free: {{ isFree }}</p>
      <p>Días restantes: {{ daysRemaining }}</p>
    </div>

    <!-- Test de features -->
    <div class="mb-6">
      <h2 class="font-bold mb-2">Features:</h2>
      <div class="space-y-2">
        <div v-for="feature in testFeatures" :key="feature">
          <label class="flex items-center gap-2">
            <input type="checkbox" :checked="hasAccess(feature)" disabled />
            <span>{{ feature }}</span>
            <span v-if="hasAccess(feature)" class="text-green-500">✓</span>
            <span v-else class="text-red-500">✗</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Test de límites -->
    <div class="mb-6">
      <h2 class="font-bold mb-2">Límites:</h2>
      <p>
        Empleados: {{ limits.employees.current }} / {{ limits.employees.max }}
      </p>
      <p>
        Productos: {{ limits.products.current }} / {{ limits.products.max }}
      </p>
      <p>Puede agregar empleado: {{ canAddEmployee }}</p>
      <p>Puede agregar producto: {{ canAddProduct }}</p>
    </div>

    <!-- Acciones -->
    <div class="space-x-4">
      <button @click="goToPlans" class="btn-primary">Ver Planes</button>
      <button @click="testFeature" class="btn-secondary">
        Test Feature Bloqueada
      </button>
    </div>

    <!-- Test visual de componentes -->
    <div class="mt-8">
      <h2 class="font-bold mb-4">Componentes Visuales:</h2>

      <div class="mb-4">
        <h3>PremiumBadge:</h3>
        <PremiumBadge :show-days="true" />
      </div>

      <div class="mb-4">
        <h3>FeatureGate (advancedReports):</h3>
        <FeatureGate feature="advancedReports">
          <div class="p-4 bg-green-100">
            ✅ Contenido desbloqueado - Reportes Avanzados
          </div>
        </FeatureGate>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSubscription } from "@/composables/useSubscription";
import PremiumBadge from "@/components/ui/PremiumBadge.vue";
import FeatureGate from "@/components/ui/FeatureGate.vue";

const {
  isPremium,
  isFree,
  planInfo,
  daysRemaining,
  hasAccess,
  limits,
  canAddEmployee,
  canAddProduct,
  requireFeature,
  goToPlans,
} = useSubscription();

const testFeatures = [
  "advancedReports",
  "aiClassification",
  "exportData",
  "multiLocation",
  "apiAccess",
  "prioritySupport",
];

const testFeature = () => {
  requireFeature("advancedReports");
};
</script>
```

Agregar ruta de testing:

```javascript
// En router/index.js
{
  path: 'testing/subscription',
  name: 'SubscriptionTest',
  component: () => import('@/views/Testing/SubscriptionTest.vue'),
  meta: { title: 'Test Suscripciones' }
}
```

---

## 🔄 Migración de Datos

### Script para Migrar Negocios Existentes

Si ya tienes negocios en Firestore, debes agregarles los campos de suscripción:

```javascript
// scripts/migratBusinesses.js
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";

async function migrateBusinesses() {
  console.log("🔄 Iniciando migración de negocios...");

  const businessesRef = collection(db, "businesses");
  const snapshot = await getDocs(businessesRef);

  let count = 0;

  for (const businessDoc of snapshot.docs) {
    const businessData = businessDoc.data();

    // Verificar si ya tiene subscription
    if (businessData.subscription) {
      console.log(`⏭️ Negocio ${businessDoc.id} ya migrado`);
      continue;
    }

    // Agregar campos de suscripción
    const updates = {
      subscription: {
        plan: "free",
        status: "active",
        startDate: new Date(),
        endDate: null,
        trialUsed: false,
        paymentMethod: null,
        lastPaymentDate: null,
        autoRenew: false,
        updatedAt: new Date(),
        updatedBy: businessData.gerenteId,
      },
      features: {
        maxEmployees: 3,
        maxProducts: 100,
        advancedReports: false,
        multiLocation: false,
        apiAccess: false,
        prioritySupport: false,
        customBranding: false,
        aiClassification: false,
        exportData: false,
      },
      usage: {
        employeeCount: 1, // Estimar o contar
        productCount: 0, // Estimar o contar
        lastUpdated: new Date(),
      },
    };

    await updateDoc(doc(db, "businesses", businessDoc.id), updates);
    count++;
    console.log(`✅ Migrado: ${businessData.nombre}`);
  }

  console.log(`🎉 Migración completada: ${count} negocios actualizados`);
}

// Ejecutar
migrateBusinesses().catch(console.error);
```

### Ejecutar Migración Manualmente

Puedes ejecutar esto desde la consola del navegador en una página autenticada:

```javascript
// 1. Copiar el script en la consola
// 2. Ejecutar manualmente en cada negocio:

const businessStore =
  window.$app.config.globalProperties.$pinia._s.get("business");

// Para el negocio actual
await businessStore.refreshBusinessFeatures(businessStore.getBusinessId);
```

---

## 📚 Resumen de Features Disponibles

| Feature               | Nombre Técnico     | Plan Free | Plan Premium |
| --------------------- | ------------------ | --------- | ------------ |
| Número de empleados   | `maxEmployees`     | 3         | ∞            |
| Número de productos   | `maxProducts`      | 100       | ∞            |
| Reportes básicos      | siempre            | ✅        | ✅           |
| Reportes avanzados    | `advancedReports`  | ❌        | ✅           |
| Clasificación IA      | `aiClassification` | ❌        | ✅           |
| Exportar datos        | `exportData`       | ❌        | ✅           |
| Múltiples ubicaciones | `multiLocation`    | ❌        | ✅           |
| Acceso a API          | `apiAccess`        | ❌        | ✅           |
| Soporte prioritario   | `prioritySupport`  | ❌        | ✅           |
| Marca personalizada   | `customBranding`   | ❌        | ✅           |

---

## 🚀 Próximos Pasos

1. ✅ **Migrar negocios existentes** (ejecutar script de migración)
2. ✅ **Crear página de testing** para verificar funcionalidad
3. ✅ **Agregar FeatureGates** en vistas existentes
4. ✅ **Implementar verificación de límites** en forms de agregar
5. ⚠️ **Integrar sistema de pagos real** (Stripe, PayPal, etc.)
6. ⚠️ **Crear sistema de notificaciones** para expiración
7. ⚠️ **Implementar analytics** para trackear uso de features

---

## 🐛 Troubleshooting

### Problema: El badge no se actualiza después de cambiar de plan

**Solución:** Recargar el negocio:

```javascript
await businessStore.loadBusiness(businessId);
```

### Problema: Features no se aplican después de upgrade

**Solución:** Refrescar features manualmente:

```javascript
await businessStore.refreshBusinessFeatures(businessId);
```

### Problema: El router no redirige a planes cuando falta feature

**Solución:** Verificar que la ruta tiene `requiresFeature` en meta:

```javascript
meta: {
  requiresAuth: true,
  requiresFeature: 'advancedReports' // ✅ Agregar esto
}
```

---

## 📞 Soporte

Para preguntas o problemas:

- Revisar los logs en consola (buscar prefijos `[useSubscription]`, `[FeatureGate]`, etc.)
- Verificar que el negocio tiene los campos `subscription`, `features` y `usage`
- Usar la vista de testing para diagnosticar

---

**Última actualización:** 2 de noviembre de 2025  
**Versión:** 1.0.0
