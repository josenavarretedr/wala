# 🧠 CONTEXT.md — Archivo Maestro del Proyecto Wala

> **Lee este archivo SIEMPRE al inicio de cada sesión.**
> Es la fuente de verdad rápida del proyecto. Para detalles profundos, consulta [`docs/README.md`](docs/README.md).

**Última actualización:** Mayo 2026 (reorganización de /docs por features)
**Dominio:** [wala.lat](https://wala.lat)
**Firebase Project ID:** `wala-lat`

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Framework** | Vue 3 (Composition API + Options API) | ^3.5 |
| **State Management** | Pinia | ^2.2 |
| **Routing** | Vue Router 4 | ^4.4 |
| **Build Tool** | Vite 5 | ^5.4 |
| **CSS** | TailwindCSS 3 | ^3.4 |
| **Backend** | Firebase (Firestore, Auth, Functions, Storage, Hosting) | ^11.0 |
| **Error Tracking** | Sentry (`@sentry/vue`) | ^10.34 |
| **Analytics** | Firebase Analytics (GA4) | Integrado |
| **Charts** | Chart.js | ^4.5 |
| **Icons** | Flaticon UIcons + Iconoir + Boxicons | Múltiples |
| **Dates** | date-fns | ^4.1 |
| **Drag & Drop** | vuedraggable | ^4.1 |
| **Onboarding** | Driver.js | ^1.3 |
| **AI** | OpenAI (Grok para guiones) | ^6.22 |
| **Search** | Algolia (autocomplete) | ^5.18 |
| **Payments** | MercadoPago (Checkout API + Yape) | Cloud Functions |
| **Image Processing** | html2canvas + jimp | Capture + resize |
| **IDs** | uuid v4 | ^11.1 |

### Comandos principales

```bash
npm run dev              # Servidor de desarrollo (Vite)
npm run build            # Build producción → /dist
npm run deploy           # Build + deploy hosting
npm run deploy:functions # Deploy solo Cloud Functions
npm run deploy:full      # Build + deploy todo
npm run emulators:start  # Firebase Emulators (Auth:9099, Functions:5001, Firestore:8080)
```

### Alias de importación

```javascript
// vite.config.js → '@' = './src'
import { useAuthStore } from '@/stores/authStore'
```

---

## 2. Arquitectura

### 2.1 Estructura de carpetas

```
src/
├── analytics/           # Tracking GA4
├── assets/              # CSS (dashboard.css, onboarding.css), imágenes, logos
├── components/          # 33 carpetas de componentes por feature
│   ├── ui/              # Componentes reutilizables (PremiumBadge, FeatureGate, etc.)
│   ├── Transactions/    # UI de transacciones
│   ├── Inventory/       # UI de inventario
│   └── ...
├── composables/         # 46 composables (lógica reutilizable)
├── config/              # Configuraciones
├── constants/           # Constantes (commerceConstants, overheadTaxonomy)
├── layouts/             # 5 layouts (Main, Auth, Default, Dashboard, Facilitator)
├── router/              # Router con guards de auth/rol/feature
├── services/            # Servicios externos
├── stores/              # 17 Pinia stores + 3 subdirectorios
│   ├── AccountsBalanceApp/
│   ├── Inventory/
│   └── transaction/
├── types/               # Tipos
├── utils/               # Utilidades
└── views/               # 22 carpetas de vistas por módulo

docs/                    # Documentación organizada por feature
├── README.md            # Índice maestro
├── DOC_MAINTENANCE_CHECKLIST.md
├── architecture/        # Arquitectura, multi-negocio, Firestore schema
├── stores/              # API de cada store Pinia (20 archivos)
├── transactions/        # Transacciones, apertura/cierre de caja (9 archivos)
├── inventory/           # Inventario, stock, materiales (9 archivos)
├── subscriptions/       # Suscripciones Free/Pro/Max, pagos, webhooks (6 archivos)
├── juntos/              # Módulo Juntos: programas, asesorías (5 archivos)
├── comercial/           # CRM comercial (1 archivo)
├── features/            # Features independientes (8 archivos)
├── ui/                  # Componentes UI, animaciones, onboarding (8 archivos)
├── firebase/            # Cloud Functions, Sentry, Analytics (6 archivos)
└── deprecated/          # Archivos obsoletos (37+ archivos)
```

### 2.2 Decisiones arquitectónicas clave

1. **Multi-negocio**: Un usuario puede ser dueño de múltiples negocios. El `businessId` se obtiene de la URL (`/business/:businessId/...`). `BusinessStore` es la fuente de verdad para datos del negocio activo.

2. **Stores vs Composables**: Los stores Pinia manejan estado global reactivo. Los composables manejan lógica reutilizable y operaciones Firestore directas. Algunos módulos usan "Composable Stores" (no Pinia, exportados como función).

3. **Wizard Pattern (Flow Stores)**: Features complejas como apertura/cierre de caja, transacciones e inventario usan stores de flujo con steps (wizard). Ejemplo: `transactionFlowStore`, `accountBalanceFlowStore`, `addStockFlowStore`.

4. **Suscripciones frontend-only**: El sistema de planes (Free/Pro/Max) es controlado desde el frontend como "efecto placebo". No usa Custom Claims. `isPremium` es un getter umbrella que retorna `true` para pro, premium y max.

5. **Roles de usuario**:
   - `business_owner` → Accede a rutas `/business/:id/...`
   - `facilitator` → Accede a rutas `/programs/...` (layout `FacilitatorLayout`)
   - `empleado` → Accede con permisos limitados dentro del negocio
   - Admin → Emails hardcoded en router guard

6. **Colección Comercial plana**: El CRM opera sobre `comercial/` como colección top-level sin dependencias de `businesses/` ni `users/`.

7. **Trazabilidad**: Operaciones críticas se registran con `useTraceability()` (tags, severity, component).

### 2.3 Firestore — Colecciones principales

```
businesses/{businessId}                      → Negocio (perfil, suscripción, features, usage)
businesses/{businessId}/transactions/        → Ingresos, gastos, transferencias
businesses/{businessId}/products/            → Inventario
businesses/{businessId}/clients/             → Clientes
businesses/{businessId}/expenses/            → Gastos detallados
businesses/{businessId}/cashEvents/          → Aperturas y cierres de caja
businesses/{businessId}/dailySummaries/      → Resumen diario financiero
businesses/{businessId}/traceability/        → Logs de auditoría

users/{userId}                               → Perfil, rol, negocios asociados
programs/{programId}                         → Programas del módulo Juntos
programs/{programId}/activities/             → Sesiones, asesorías, eventos
programs/{programId}/consultingDossiers/     → Expedientes de consultoría

comercial/settings                           → Config CRM (zonas, metas, campañas)
comercial/{recordId}                         → Leads y registros operativos
```

### 2.4 Layouts y flujo de navegación

```
/ → Home (redirección inteligente según estado de auth)
├── /auth/login, /auth/register              → AuthLayout
├── /onboarding                              → MainLayout (sin negocio)
├── /select-business                         → MainLayout (selector multi-negocio)
├── /business/:businessId/                   → MainLayout
│   ├── dashboard, income, expenses, sales
│   ├── inventory/..., clients/..., quotes/...
│   ├── plans, premium, streak
│   ├── programs/:programId/...              → Módulo Juntos (participante)
│   └── testing/...
├── /programs/                               → FacilitatorLayout
│   └── :programId/... (actividades, asesorías, expedientes)
├── /admin/...                               → MainLayout (admin hardcoded)
├── /guiones/...                             → Gestión de guiones IA
├── /sesiones/...                            → Cuadernillos interactivos
└── /profile, /notifications, /security
```

---

## 3. Roadmap / Features Pendientes

> Consulta la documentación completa y actualizada en: [`docs/README.md`](docs/README.md)

### Features activas documentadas

- ✅ Sistema multi-negocio (auth + business store)
- ✅ Transacciones (ingresos, gastos, transferencias, cotizaciones)
- ✅ Inventario completo (stock, conteo, composición, costeo)
- ✅ Sistema de apertura/cierre de caja modular
- ✅ Clientes con historial y métricas
- ✅ Suscripciones Free/Pro/Max
- ✅ MercadoPago + Yape (Cloud Functions)
- ✅ Módulo Juntos (programas, actividades, asesorías, expedientes)
- ✅ CRM Comercial (pipeline Kanban, KPIs semanales)
- ✅ Sistema de racha (streak) y gamificación
- ✅ Guiones de video con IA (Grok)
- ✅ Compartir imagen (html2canvas + Web Share API)
- ✅ Analytics GA4 + Sentry
- ✅ Onboarding con Driver.js
- ✅ Sistema de adjuntos (imágenes + PDFs con procesamiento backend)

### TODOs y deuda técnica conocida

- ⚠️ `showUpgradeModal()` en `useSubscription.js` usa `confirm()` nativo → implementar modal UI real
- ⚠️ `cashClosureStore.js` podría ser duplicado de `cashEventStore.js` → verificar y consolidar
- ⚠️ `useSavingsStore.js` sin uso activo en componentes → evaluar eliminación
- ⚠️ 40+ composables sin documentación individual → documentación progresiva
- ⚠️ Integración de pagos real pendiente (actualmente MercadoPago, falta completar flujo Yape)
- ⚠️ Sistema de notificaciones para expiración de suscripciones → no implementado

---

## 4. Reglas de Código

### 4.1 Convenciones de nombres

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| **Componentes Vue** | PascalCase | `PremiumBadge.vue`, `ClientDetails.vue` |
| **Composables** | camelCase con prefijo `use` | `useSubscription.js`, `useInventory.js` |
| **Stores Pinia** | camelCase con sufijo `Store` | `businessStore.js`, `authStore.js` |
| **Vistas** | PascalCase por feature/carpeta | `views/Inventory/ProductDetails.vue` |
| **Constantes** | UPPER_SNAKE_CASE | `DEFAULT_ZONAS`, `METAS_SEMANALES_DEFAULT` |
| **Rutas** | kebab-case | `/business/:businessId/accounts-balance` |
| **Colecciones Firestore** | camelCase | `businesses`, `cashEvents`, `dailySummaries` |
| **Campos Firestore** | camelCase | `businessName`, `statusPipeline`, `createdAt` |
| **CSS** | TailwindCSS utilities | Clases de Tailwind directamente en templates |

### 4.2 Patrones obligatorios

#### Stores Pinia

```javascript
// Composition API (preferido para nuevos stores)
export const useMyStore = defineStore('myStore', () => {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters como computed
  const processedData = computed(() => /* ... */)

  // Actions como funciones async
  async function loadData() { /* ... */ }

  return { data, loading, error, processedData, loadData }
})
```

#### Composables

```javascript
// Siempre exportar como función nombrada
export function useMyComposable() {
  // Lógica reutilizable
  return { /* API pública */ }
}
```

#### Firestore — Timestamps

```javascript
// Siempre usar serverTimestamp() para persistencia
import { serverTimestamp, Timestamp } from 'firebase/firestore'

// En writes a Firestore:
createdAt: serverTimestamp()
updatedAt: serverTimestamp()

// Para timestamps locales optimistas:
createdAt: Timestamp.now()
```

#### Error handling

```javascript
// Patrón estándar en actions de stores
async function myAction() {
  try {
    loading.value = true
    error.value = null
    // ... lógica
  } catch (err) {
    error.value = err.message
    console.error('❌ [contexto] Error:', err)
    throw err
  } finally {
    loading.value = false
  }
}
```

### 4.3 Qué NO hacer

- ❌ **No** crear archivos `.md` sueltos en la raíz del proyecto → van a `/docs/` o `/docs/deprecated/`
- ❌ **No** hardcodear businessId → siempre leer de `businessStore.getBusinessId` o `route.params.businessId`
- ❌ **No** usar `alert()` para feedback → usar el sistema de toast global (`useToast`)
- ❌ **No** crear subcollections innecesarias → preferir campos en el documento padre
- ❌ **No** mezclar Composition API con Options API en el mismo store (elegir uno)
- ❌ **No** omitir `loading` y `error` en stores → siempre manejar los 3 estados
- ❌ **No** ignorar la documentación → actualizar `/docs` después de cada feature (ver [`docs/DOC_MAINTENANCE_CHECKLIST.md`](docs/DOC_MAINTENANCE_CHECKLIST.md))

### 4.4 Estructura de un componente Vue

```vue
<template>
  <!-- Template con TailwindCSS -->
</template>

<script setup>
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBusinessStore } from '@/stores/businessStore'

// 2. Props y emits
const props = defineProps({ /* ... */ })
const emit = defineEmits(['update', 'close'])

// 3. Stores y composables
const businessStore = useBusinessStore()
const router = useRouter()

// 4. State reactivo
const loading = ref(false)

// 5. Computed
const businessId = computed(() => businessStore.getBusinessId)

// 6. Methods
async function handleSubmit() { /* ... */ }

// 7. Lifecycle
onMounted(() => { /* ... */ })
</script>
```

---

## 5. Historial de Cambios / Sesiones

> Últimas 10 sesiones de trabajo con el agente IA (más recientes primero):

### Mayo 2026

| Fecha | Sesión | Cambios clave |
|-------|--------|---------------|
| 6 May | Auditoría docs | Clasificación 76 docs, auditoría veracidad suscripciones (9 discrepancias corregidas), creación docs CRM + Consulting, checklist mantenimiento, movimiento de 12 MDs huérfanos |
| 5 May | Simplificar QuickEntry | "Visita en frío" como default, eliminar Campaña/Cohorte del modal, input telefónico internacional (+51 Peru default) |
| 4 May | Recoloring Logo | Asset "Wala BLANCO.png" → "Wala Origin.png" con color #E35336 |
| 4 May | Pipeline CRM | Integración `vuedraggable` para Kanban, toast global, formato WhatsApp internacional, sync drag-drop |
| 4 May | Admin Comercial | Migración a colección `comercial` plana (top-level), refactor `useComercial.js` y `commerceStore.js` |

### Abril 2026

| Fecha | Sesión | Cambios clave |
|-------|--------|---------------|
| 17 Abr | Debug Yape | Diagnóstico "Pago rechazado" en `processYapePayment` |
| 17 Abr | Admin Users | Dashboard `/admin/users` con gestión de suscripciones y programas |

### Marzo 2026

| Fecha | Sesión | Cambios clave |
|-------|--------|---------------|
| 22 Mar | Inventario | Optimización InventoryCount.vue, campo `minStock`, integración ProductStockAlert → InventoryCount |

---

## 6. Referencias rápidas

| Recurso | Path |
|---------|------|
| Documentación completa | [`docs/README.md`](docs/README.md) |
| Checklist cierre de tickets | [`docs/DOC_MAINTENANCE_CHECKLIST.md`](docs/DOC_MAINTENANCE_CHECKLIST.md) |
| Estructura Firestore | [`docs/architecture/BUSINESS_DOCUMENT_STRUCTURE.md`](docs/architecture/BUSINESS_DOCUMENT_STRUCTURE.md) |
| Sistema de suscripciones | [`docs/subscriptions/SISTEMA_SUSCRIPCIONES_PREMIUM.md`](docs/subscriptions/SISTEMA_SUSCRIPCIONES_PREMIUM.md) |
| CRM Comercial | [`docs/comercial/SISTEMA_COMERCIAL_CRM.md`](docs/comercial/SISTEMA_COMERCIAL_CRM.md) |
| Expedientes consultoría | [`docs/juntos/CONSULTING_DOSSIER_STORE.md`](docs/juntos/CONSULTING_DOSSIER_STORE.md) |
| Módulo Juntos | [`docs/juntos/MODULO_JUNTOS_RESUMEN.md`](docs/juntos/MODULO_JUNTOS_RESUMEN.md) |
| Inventario | [`docs/inventory/`](docs/inventory/) |
| Transacciones | [`docs/transactions/`](docs/transactions/) |
| Cloud Functions | [`docs/firebase/`](docs/firebase/) |
| Stores Pinia | [`docs/stores/`](docs/stores/) |
| Reglas Firestore | [`firestore.rules`](firestore.rules) |
| Índices Firestore | [`firestore.indexes.json`](firestore.indexes.json) |
| Cloud Functions code | [`functions/index.js`](functions/index.js) |
