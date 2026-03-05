>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# 🏗️ REFACTORIZACIÓN ARQUITECTURA AUTH - COMPOSABLES COMO ÚNICA CAPA FIREBASE

## 📋 Resumen de la Refactorización

Se ha refactorizado completamente la arquitectura de autenticación para seguir el patrón **Composables = Firebase + Stores = Estado Reactivo**.

---

## 🎯 Objetivos Alcanzados

### ✅ Separación Clara de Responsabilidades

- **Composables**: Única capa que conecta con Firebase
- **Stores**: Solo estado reactivo y persistencia localStorage
- **Componentes**: Solo lógica de flujo y UI

### ✅ Eliminación de Duplicación

- Removida toda lógica Firebase de los stores
- Centralizadas todas las traducciones de errores
- Unificados los patrones de autenticación

### ✅ Mantenibilidad Mejorada

- Un solo lugar para cambios de Firebase
- Stores más simples y predecibles
- Composables reutilizables en toda la app

---

## 🔧 Archivos Refactorizados

### 1. `src/composables/useAuth.js`

**Función**: Única capa Firebase Auth
**Cambios**:

- ✅ Manejo completo de autenticación Firebase
- ✅ Traducciones de errores centralizadas
- ✅ Validaciones y logging consistente
- ✅ Métodos para login, registro, logout, y verificación

**Métodos disponibles**:

```javascript
const {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  getCurrentUser,
  checkAuthState,
  onAuthChange,
} = useAuth();
```

### 2. `src/stores/authStore.js`

**Función**: Solo estado reactivo y localStorage
**Cambios**:

- ✅ Eliminada toda lógica Firebase directa
- ✅ Usa `useAuth()` composable para operaciones Firebase
- ✅ Mantiene solo estado reactivo y persistencia
- ✅ Simplificado con Composition API

**Estado disponible**:

```javascript
const {
  user, // Usuario actual
  isLoading, // Estado de carga
  error, // Errores de autenticación
  isAuthenticated, // Usuario logueado
  hasValidSession, // Sesión válida
} = useAuthStore();
```

### 3. `src/views/auth/Login.vue`

**Función**: UI y flujo de login
**Cambios**:

- ✅ Usa solo `authStore` (que internamente usa composables)
- ✅ Eliminadas importaciones Firebase directas
- ✅ Lógica de flujo post-login simplificada

### 4. `src/views/auth/Register.vue`

**Función**: UI y flujo de registro
**Cambios**:

- ✅ Usa solo `authStore` (que internamente usa composables)
- ✅ Eliminadas importaciones Firebase directas
- ✅ Comentarios clarificados

---

## 🔄 Flujo de Autenticación Refactorizado

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   COMPONENTE    │───▶│      STORE       │───▶│   COMPOSABLE    │
│                 │    │  (Estado React.) │    │  (Firebase)     │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • UI Logic      │    │ • user ref()     │    │ • signIn()      │
│ • Flow Control  │    │ • isLoading      │    │ • createUser()  │
│ • Error Display │    │ • localStorage   │    │ • signOut()     │
│ • Navigation    │    │ • Computed State │    │ • Error Trans.  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🚀 Beneficios de la Nueva Arquitectura

### 📦 Para Composables

- **Single Source of Truth** para Firebase
- **Reutilizable** en cualquier componente
- **Testeable** de forma aislada
- **Mantenible** en un solo lugar

### 🏪 Para Stores

- **Simples y predecibles** - solo estado
- **Sin efectos secundarios** Firebase
- **Fácil debugging** del estado
- **Persistencia** localStorage centralizada

### 🎨 Para Componentes

- **Enfoque en UI** y experiencia de usuario
- **Lógica de flujo** clara y simple
- **Sin preocupación** por detalles Firebase
- **Código limpio** y mantenible

---

## 📋 Checklist de Implementación

### ✅ Completado

- [x] Refactorizar `useAuth.js` composable
- [x] Refactorizar `authStore.js` store
- [x] Actualizar `Login.vue` componente
- [x] Actualizar `Register.vue` componente
- [x] Verificar inicialización en `main.js`
- [x] Crear documentación de refactorización

### 🔄 Pendiente para el Futuro

- [ ] Aplicar mismo patrón a `businessStore.js`
- [ ] Crear `useBusiness.js` composable
- [ ] Aplicar patrón a otros stores que usen Firebase
- [ ] Crear tests unitarios para composables
- [ ] Documentar patrones para nuevos desarrolladores

---

## 🎯 Próximos Pasos Recomendados

1. **Probar la funcionalidad** refactorizada
2. **Aplicar mismo patrón** a otros stores
3. **Crear composables** para Firestore (businesses, users, etc.)
4. **Documentar patrones** para el equipo
5. **Implementar tests** para composables

---

## 🔍 Como Usar la Nueva Arquitectura

### En Componentes:

```javascript
// ✅ CORRECTO - Solo usar stores
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
await authStore.login(email, password);
```

### En Stores:

```javascript
// ✅ CORRECTO - Solo usar composables para Firebase
import { useAuth } from "@/composables/useAuth";

const authComposable = useAuth();
const userData = await authComposable.loginWithEmail(email, password);
```

### NO hacer:

```javascript
// ❌ INCORRECTO - Firebase directo en componentes
import { signInWithEmailAndPassword } from "firebase/auth";

// ❌ INCORRECTO - Firebase directo en stores sin composables
import { auth } from "@/firebaseInit";
```

---

## 🎉 Resultado Final

**Arquitectura limpia, mantenible y escalable** donde cada capa tiene una responsabilidad específica y clara, facilitando el desarrollo y mantenimiento futuro del sistema de autenticación de Walla.
