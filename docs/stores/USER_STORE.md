# `useUserStore.js` — Documentación del Store de Usuario

**Archivo:** `src/stores/useUserStore.js`
**Store ID:** `user`
**Tipo:** Pinia Store (Options API)
**Módulo:** Perfil de Usuario y Multi-negocio

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [State](#state)
3. [Getters](#getters)
4. [Actions](#actions)
5. [Uso en Componentes](#uso-en-componentes)

---

## Descripción General

El `useUserStore` gestiona el perfil del usuario autenticado y sus relaciones con negocios. Implementa la arquitectura **multi-negocio**:

- Un usuario puede pertenecer a múltiples negocios con distintos roles
- Mantiene el negocio actualmente seleccionado (`currentBusiness`)
- Permite cambiar de negocio activo en runtime

### LocalStorage Keys

```javascript
STORAGE_KEYS = {
  PROFILE: "walla_profile",
  BUSINESSES: "walla_businesses",
  CURRENT_BUSINESS: "walla_current_business",
};
```

---

## State

| Propiedad         | Tipo           | Valor Inicial | Descripción                                       |
| ----------------- | -------------- | ------------- | ------------------------------------------------- |
| `userProfile`     | `Object\|null` | `null`        | Perfil completo del usuario (nombre, email, etc.) |
| `userBusinesses`  | `Array`        | `[]`          | Lista de negocios del usuario con sus roles       |
| `currentBusiness` | `Object\|null` | `null`        | Negocio seleccionado actualmente                  |
| `isLoading`       | `Boolean`      | `false`       | Indicador de carga                                |
| `error`           | `String\|null` | `null`        | Último error                                      |

### Estructura de un negocio en `userBusinesses`

```javascript
{
  businessId: String,
  rol: 'gerente' | 'empleado',
  esPrincipal: Boolean,
  permissions: {
    canCreateTransaction: Boolean,
    canDeleteTransaction: Boolean,
    canViewReports: Boolean,
    // ...
  },
  programs: Array  // Programas/organizaciones asociadas
}
```

---

## Getters

| Getter                       | Retorna        | Descripción                                         |
| ---------------------------- | -------------- | --------------------------------------------------- |
| `isManager`                  | `Boolean`      | `true` si es gerente en al menos 1 negocio          |
| `isEmployee`                 | `Boolean`      | `true` si es empleado en al menos 1 negocio         |
| `currentPermissions`         | `Object`       | Permisos del negocio activo                         |
| `hasPermission(permission)`  | `Boolean`      | Verifica permiso específico en negocio activo       |
| `primaryBusiness`            | `Object`       | Negocio marcado como principal (o el primero)       |
| `isCurrentBusinessManager`   | `Boolean`      | Es gerente en el negocio activo                     |
| `getCurrentBusinessRole`     | `String\|null` | Rol en el negocio activo                            |
| `hasBusinesses`              | `Boolean`      | Tiene al menos un negocio                           |
| `currentBusinessProgramName` | `String`       | Nombre de la organización del programa más reciente |

---

## Actions

### `loadUserProfile(uid)`

**Descripción:** Carga el perfil del usuario desde Firestore.
**Parámetros:** `uid` — String (UID de Firebase Auth)

---

### `loadUserBusinesses(uid)`

**Descripción:** Carga la lista completa de negocios del usuario.
**Parámetros:** `uid` — String

---

### `switchBusiness(businessId)`

**Descripción:** Cambia el negocio activo de forma sincrónica.
**Parámetros:** `businessId` — String

---

### `setCurrentBusiness(businessId)`

**Descripción:** Alias async de `switchBusiness` para compatibilidad con el router.
**Parámetros:** `businessId` — String

---

### `addBusinessToUser(uid, businessData)`

**Descripción:** Agrega un negocio al perfil del usuario en Firestore.

---

### `createUserProfile(userData)`

**Descripción:** Crea el perfil del usuario en Firestore durante el registro.

---

### `updateUserProfile(updates)`

**Descripción:** Actualiza campos del perfil del usuario autenticado.

---

## Uso en Componentes

`useUserStore()` es usado en:

`BusinessSelectorModal.vue`, `NavigationBtnBusinessOnboarding.vue`, `MicroApps.vue`, `JoinProgramModalFacilitator.vue`, `JoinProgramModal.vue`, `CreateProgram.vue`, `ProgramsHub.vue` (view), `FacilitatorLayout.vue`, `MainLayout.vue`, `ProfileDropdown.vue`, `SidebarContent.vue`, `Login.vue`, `Register.vue`, `WaitingAssignment.vue`, `BusinessInfo.vue`, `BusinessSelector.vue`, `BusinessSetup.vue`, `Dashboard.vue`, `BusinessOnboarding.vue`, `Profile.vue`.

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Store verificado como activo y crítico en producción.
