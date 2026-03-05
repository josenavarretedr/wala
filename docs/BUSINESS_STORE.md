# `businessStore.js` — Documentación del Store de Negocios

**Archivo:** `src/stores/businessStore.js`
**Store ID:** `business`
**Tipo:** Pinia Store (Options API)
**Módulo:** Gestión de Negocios, Empleados y Suscripciones

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [State](#state)
3. [Getters](#getters)
4. [Actions](#actions)
5. [Uso en Componentes](#uso-en-componentes)

---

## Descripción General

El `businessStore` es el store central para gestionar el negocio actualmente cargado. Es responsable de:

- Cargar y persistir los datos del negocio desde Firestore
- Gestionar empleados (alta, baja, búsqueda)
- Exponer información de suscripción (Free / Premium / Trial)
- Controlar permisos del usuario actual dentro del negocio
- Verificar límites de uso (productos, empleados)

Es uno de los stores **más usados en toda la aplicación**.

---

## State

| Propiedad                | Tipo           | Valor Inicial | Descripción                                      |
| ------------------------ | -------------- | ------------- | ------------------------------------------------ |
| `business`               | `Object\|null` | `null`        | Datos completos del negocio activo               |
| `employees`              | `Array`        | `[]`          | Lista de empleados del negocio                   |
| `businessList`           | `Array`        | `[]`          | Lista de negocios (para búsquedas admin)         |
| `currentUserRole`        | `String\|null` | `null`        | Rol del usuario actual (`gerente` \| `empleado`) |
| `currentUserPermissions` | `Object`       | `{}`          | Permisos específicos del usuario actual          |
| `isLoading`              | `Boolean`      | `false`       | Indicador de carga                               |
| `error`                  | `String\|null` | `null`        | Último error                                     |

---

## Getters

### Datos básicos

| Getter                    | Retorna        | Descripción                      |
| ------------------------- | -------------- | -------------------------------- |
| `getBusinessId`           | `String\|null` | ID del negocio activo            |
| `getBusinessName`         | `String\|null` | Nombre del negocio               |
| `getBusinessType`         | `String\|null` | Tipo de negocio                  |
| `isBusinessOwner(userId)` | `Boolean`      | Verifica si el userId es gerente |
| `getEmployeeCount`        | `Number`       | Cantidad de empleados            |
| `hasEmployees`            | `Boolean`      | Si tiene al menos 1 empleado     |

### Roles y permisos

| Getter                      | Retorna        | Descripción                 |
| --------------------------- | -------------- | --------------------------- |
| `getCurrentUserRole`        | `String\|null` | Rol del usuario actual      |
| `getCurrentUserPermissions` | `Object`       | Permisos del usuario actual |
| `isCurrentUserManager`      | `Boolean`      | `true` si rol es `gerente`  |
| `isCurrentUserEmployee`     | `Boolean`      | `true` si rol es `empleado` |
| `hasPermission(permission)` | `Boolean`      | Verifica permiso específico |

### Suscripción y features

| Getter                      | Retorna        | Descripción                         |
| --------------------------- | -------------- | ----------------------------------- |
| `subscription`              | `Object`       | Objeto de suscripción del negocio   |
| `isPremium`                 | `Boolean`      | Plan `premium` y status `active`    |
| `isFree`                    | `Boolean`      | Sin suscripción o plan `free`       |
| `isTrialActive`             | `Boolean`      | En período de prueba activo         |
| `subscriptionDaysRemaining` | `Number\|null` | Días restantes de suscripción       |
| `hasFeature(featureName)`   | `Boolean`      | Verifica feature específica         |
| `canAddEmployee`            | `Boolean`      | No ha alcanzado límite de empleados |
| `canAddProduct`             | `Boolean`      | No ha alcanzado límite de productos |
| `limits`                    | `Object`       | Objeto con límites actuales de uso  |

---

## Actions

### `loadBusiness(businessId, userBusiness?)`

**Descripción:** Carga el negocio desde Firestore.
**Parámetros:**

- `businessId` — String requerido
- `userBusiness` — Object opcional (datos pre-cargados)

---

### `clearCurrentBusiness()`

**Descripción:** Limpia el negocio activo del state.

---

### `createBusiness(businessData)`

**Descripción:** Crea un nuevo negocio en Firestore.
**Parámetros:** `businessData` — Object con datos del negocio.

---

### `searchBusinessByName(nombre)`

**Descripción:** Busca negocios por nombre en Firestore.

---

### `loadEmployees(businessId)`

**Descripción:** Carga los empleados activos del negocio.

---

### `loadBusinessWithSettings(businessId)`

**Descripción:** Carga el negocio junto con sus colecciones de settings (config, onboarding, integrations, customization) en paralelo.

---

### `updateBusiness(businessId, data)`

**Descripción:** Actualiza campos del negocio en Firestore.

---

### `addEmployee(employeeData)`

**Descripción:** Agrega un empleado al negocio activo.

---

### `removeEmployee(employeeUid)`

**Descripción:** Elimina un empleado del negocio.

---

### `refreshBusinessFeatures(businessId)`

**Descripción:** Refresca el objeto de features/suscripción desde Firestore.

---

### `updateUsageStats(businessId, stats)`

**Descripción:** Actualiza estadísticas de uso (productCount, employeeCount).

---

### `updateSubscriptionPlan(businessId, newPlan, userId)`

**Descripción:** Cambia el plan de suscripción del negocio.
**Parámetros:**

- `businessId` — String
- `newPlan` — `'free'` | `'premium'` | `'trial'`
- `userId` — String

---

### `deleteBusiness(businessId)` / `hardDeleteBusiness(businessId)`

**Descripción:** Soft-delete y hard-delete de un negocio.

---

### Utilidades

| Action                            | Descripción                                   |
| --------------------------------- | --------------------------------------------- |
| `clearBusinessData()`             | Limpia `business` y `employees`               |
| `setCurrentBusiness(business)`    | Establece el negocio activo directamente      |
| `getFeaturesForPlan(plan)`        | Retorna el objeto de features según el plan   |
| `getDefaultSubscription(userId?)` | Retorna estructura de suscripción por defecto |
| `getDefaultUsageStats()`          | Retorna estructura de usage por defecto       |

---

## Uso en Componentes

Componentes que usan `useBusinessStore()`:

`Header.vue`, `SidebarContent.vue`, `DashboardRedirect.vue`, `BusinessSelectorModal.vue`, `NavigationBtnBusinessOnboarding.vue`, `ListAllProducts.vue`, `StepAddExpenseDetails.vue`, `StepAttachClient.vue`, `StepExpenseType.vue`, `StepAddQuotePreview.vue`, `QuoteDetails.vue`, `QuotesPanel.vue`, `ActivityParticipationForm.vue`, `ClasificationTest.vue`, `RecordsDetails.vue` (vista), `BusinessInfo.vue`, `BusinessSelector.vue`, `BusinessSetup.vue`, `Dashboard.vue`, `PlansView.vue`, `CashApp.vue`, `Premium.vue`, `MainLayout.vue`.

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Store verificado como activo y crítico en producción.
