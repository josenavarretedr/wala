# `authStore.js` — Documentación del Store de Autenticación

**Archivo:** `src/stores/authStore.js`
**Store ID:** `auth`
**Tipo:** Pinia Store (Composition API)
**Módulo:** Autenticación y Sesión

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Dependencias e Imports](#dependencias-e-imports)
3. [State](#state)
4. [Getters (Computed)](#getters-computed)
5. [Actions](#actions)
6. [Uso en Componentes](#uso-en-componentes)

---

## Descripción General

El `authStore` gestiona el estado de autenticación del usuario en Wala. Es responsable de:

- Manejar login, registro y logout (email/password y Google)
- Persistir la sesión en `localStorage` con validación de 24 horas
- Verificar y restaurar sesiones al reabrir la app
- Integrar reportes de errores con Sentry y eventos de Analytics

Este store **delega la lógica Firebase al composable `useAuth`**, actuando como capa de estado reactivo.

---

## Dependencias e Imports

| Dependencia     | Uso                                                    |
| --------------- | ------------------------------------------------------ |
| `useAuth`       | Composable con lógica Firebase (login, registro, etc.) |
| `useRouter`     | Redirección post-logout                                |
| `sentryHelpers` | Captura de errores y tracking de usuario               |
| `analytics`     | Identificación de usuario en Analytics                 |

---

## State

| Propiedad     | Tipo           | Valor Inicial | Descripción                                       |
| ------------- | -------------- | ------------- | ------------------------------------------------- |
| `user`        | `Object\|null` | `null`        | Datos del usuario autenticado de Firebase         |
| `isLoading`   | `Boolean`      | `false`       | Indicador de operación en progreso                |
| `error`       | `String\|null` | `null`        | Mensaje de error de la última operación           |
| `lastSession` | `Object\|null` | `null`        | Metadatos de la sesión (`{ timestamp, userUid }`) |

### LocalStorage Keys

```javascript
STORAGE_KEYS = {
  USER: "wala_user",
  SESSION: "wala_session",
  BUSINESS: "wala_current_business",
};
```

---

## Getters (Computed)

| Getter            | Retorna   | Descripción                                 |
| ----------------- | --------- | ------------------------------------------- |
| `isAuthenticated` | `Boolean` | `true` si `user.value` no es null           |
| `hasValidSession` | `Boolean` | `true` si la sesión tiene menos de 24 horas |

---

## Actions

### `login(email, password)`

**Descripción:** Autentica al usuario con email y contraseña.
**Parámetros:**

- `email` — String
- `password` — String

**Efectos:** Actualiza `user`, guarda en localStorage, configura Sentry y Analytics.
**Retorna:** `userData` object o lanza error.

---

### `register(email, password, displayName)`

**Descripción:** Registra un nuevo usuario.
**Parámetros:**

- `email` — String
- `password` — String
- `displayName` — String

**Efectos:** Idénticos a `login` tras el registro.

---

### `loginWithGoogle()`

**Descripción:** Autenticación OAuth con Google.
**Parámetros:** Ninguno.
**Efectos:** Idénticos a `login`.

---

### `logout()`

**Descripción:** Cierra la sesión del usuario.
**Efectos:** Limpia `user`, limpia localStorage, limpia usuario en Sentry, redirige a `/auth/login`.

---

### `checkUser()`

**Descripción:** Verifica el usuario actual con Firebase Auth.
**Efectos:** Si existe usuario activo → sincroniza. Si no → limpia estado y localStorage.
**Retorna:** `userData` o `null`.

---

### `restoreSession()`

**Descripción:** Intenta restaurar una sesión al iniciar la app (combinando localStorage + Firebase).
**Flujo:**

1. Verifica localStorage — si hay sesión válida (`< 24h`)
2. Verifica con Firebase que el UID coincida
3. Si hay inconsistencia → limpia todo
4. Si no hay localStorage → consulta solo Firebase

**Retorna:** `userData` o `null`.

---

### Utilidades de estado (internas)

| Action              | Descripción                           |
| ------------------- | ------------------------------------- |
| `setUser(userData)` | Establece `user` y `lastSession`      |
| `clearUser()`       | Limpia `user` y `lastSession`         |
| `setLoading(bool)`  | Actualiza `isLoading`                 |
| `setError(msg)`     | Actualiza `error`                     |
| `clearError()`      | Limpia `error`                        |
| `clearStorage()`    | Elimina las 3 claves del localStorage |

---

## Uso en Componentes

El `authStore` es usado directamente en:

| Componente                            | Acciones / Estado usados              |
| ------------------------------------- | ------------------------------------- |
| `Login.vue`                           | `login()`, `isLoading`, `error`       |
| `Register.vue`                        | `register()`, `isLoading`             |
| `BtnLogout.vue`                       | `logout()`                            |
| `Step1Auth.vue`                       | `login()`, `register()`               |
| `DashboardRedirect.vue`               | `isAuthenticated`, `restoreSession()` |
| `Header.vue`                          | `user`, `isAuthenticated`             |
| `FacilitatorLayout.vue`               | `user`, `isAuthenticated`             |
| `MainLayout.vue`                      | `isAuthenticated`                     |
| `ProfileDropdown.vue`                 | `user`, `logout()`                    |
| `NavigationBtnBusinessOnboarding.vue` | `user`                                |
| Las vistas de `business/`             | `user`, `isAuthenticated`             |
| Las vistas de `facilitator/`          | `user`                                |

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Store verificado como activo y ampliamente usado en producción.
