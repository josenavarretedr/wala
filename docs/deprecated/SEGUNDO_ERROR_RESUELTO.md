>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# 🔧 Segundo Problema Resuelto: Cannot read properties of undefined (reading 'length')

## ❌ **Error Identificado**

```
Cannot read properties of undefined (reading 'length')
    at index.js:301:39
```

## 🔍 **Causa del Problema**

El error se originaba por **inconsistencia en el uso de stores**:

### Problema Principal:

- **Router** (`src/router/index.js`) intentaba acceder a `businessStore.userBusinesses.length`
- **MainLayout** y **DashboardRedirect** también usaban `businessStore` para propiedades que no existían
- La propiedad `userBusinesses` realmente está en `useUserStore`, no en `useBusinessStore`

### Problema Arquitectural:

- **`useBusinessStore`**: Maneja datos específicos de UN negocio (employees, business data)
- **`useUserStore`**: Maneja la relación usuario-negocios (`userBusinesses`, `currentBusiness`)
- Los componentes estaban mezclando ambos stores incorrectamente

## ✅ **Solución Implementada**

### 1. **Router Corregido** (`src/router/index.js`)

```javascript
// ❌ ANTES - Incorrecto
import { useBusinessStore } from "@/stores/businessStore"
const businessStore = useBusinessStore()
if (!businessStore.userBusinesses.length) { ... }

// ✅ DESPUÉS - Correcto
import { useUserStore } from "@/stores/useUserStore"
const userStore = useUserStore()
if (!userStore.userBusinesses || userStore.userBusinesses.length === 0) { ... }
```

### 2. **MainLayout Actualizado** (`src/layouts/MainLayout.vue`)

```javascript
// ❌ ANTES - Incorrecto
import { useBusinessStore } from "@/stores/businessStore";
const businessStore = useBusinessStore();
currentBusiness: businessStore.activeBusiness;

// ✅ DESPUÉS - Correcto
import { useUserStore } from "@/stores/useUserStore";
const userStore = useUserStore();
currentBusiness: userStore.currentBusiness;
```

### 3. **DashboardRedirect Corregido** (`src/views/dashboard/DashboardRedirect.vue`)

```javascript
// ❌ ANTES - Incorrecto
const business = computed(() => businessStore.activeBusiness);
const isManager = computed(() => businessStore.isManager);
hasPermission: businessStore.hasPermission(permission);

// ✅ DESPUÉS - Correcto
const business = computed(() => userStore.currentBusiness);
const isManager = computed(() => userStore.currentBusiness?.rol === "gerente");
hasPermission: userStore.currentBusiness?.permissions?.[permission] === true;
```

### 4. **MainLayout Recreado**

- El archivo `MainLayout.vue` había sido eliminado accidentalmente
- Fue completamente recreado con la arquitectura correcta
- Ahora usa `useUserStore` y `useAuthStore` consistentemente

## 🏗️ **Arquitectura Clarificada**

### **useAuthStore**

- ✅ **Propósito**: Estado de autenticación del usuario
- ✅ **Exports**: `user`, `isAuthenticated`, `login()`, `logout()`

### **useUserStore**

- ✅ **Propósito**: Perfil del usuario y relación con negocios
- ✅ **Exports**: `userProfile`, `userBusinesses`, `currentBusiness`
- ✅ **Métodos**: `loadUserBusinesses()`, `setCurrentBusiness()`

### **useBusinessStore** (Limitado)

- ✅ **Propósito**: Datos específicos de UN negocio individual
- ✅ **Exports**: `business`, `employees`, gestión interna del negocio
- ❌ **NO maneja**: Relaciones usuario-negocio (eso es responsabilidad de userStore)

## 📊 **Cambios Específicos Realizados**

### **Router Guards**

- ✅ Corregido para usar `userStore.userBusinesses`
- ✅ Actualizado `business.id` → `business.businessId`
- ✅ Métodos de verificación usando `userStore.currentBusiness`

### **MainLayout**

- ✅ Recreado desde cero con arquitectura correcta
- ✅ Navegación basada en `userStore.currentBusiness.permissions`
- ✅ Sidebar funcional con acceso por roles

### **DashboardRedirect**

- ✅ Todas las referencias actualizadas a `userStore`
- ✅ Verificación de permisos corregida
- ✅ Carga de datos de usuario apropiada

## 🎯 **Resultado Final**

### ✅ **Estado Actual**

- ✅ Router funcionando sin errores
- ✅ MainLayout renderizando correctamente
- ✅ Dashboard accesible y funcional
- ✅ Sistema de autenticación estable
- ✅ Navegación por permisos operativa
- ✅ Relaciones usuario-negocio funcionando

### 🚀 **Servidor**

- **URL**: http://localhost:5174/
- **Estado**: ✅ Funcionando sin errores
- **Hot Reload**: ✅ Activo

## 🔧 **Lecciones Aprendidas**

1. **Separación Clara de Responsabilidades**:

   - `authStore` → Estado de autenticación
   - `userStore` → Perfil y relaciones del usuario
   - `businessStore` → Datos específicos de negocio

2. **Consistencia de Propiedades**:

   - Usar `businessId` (no `id`) para identificadores
   - Usar `currentBusiness` (no `activeBusiness`) para negocio actual
   - Verificar que las propiedades existan antes de usar `.length`

3. **Manejo de Estados Undefined**:

   - Siempre verificar `if (!array || array.length === 0)`
   - Usar optional chaining: `object?.property?.subproperty`

4. **Debugging Sistemático**:
   - Identificar qué store maneja qué responsabilidad
   - Verificar que las importaciones coincidan con la funcionalidad esperada

## 🎉 **Sistema Completamente Funcional**

Con estos cambios, el sistema ahora tiene:

- ✅ **Arquitectura de stores consistente**
- ✅ **Router guards robustos**
- ✅ **Layout principal funcional**
- ✅ **Dashboard interactivo**
- ✅ **Sistema de permisos operativo**
- ✅ **Manejo multi-negocio estable**

**¡Todos los errores TypeError solucionados!** 🚀
