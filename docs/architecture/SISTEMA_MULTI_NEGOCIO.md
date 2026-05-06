# 📋 SISTEMA MULTI-NEGOCIO WALLA - DOCUMENTACIÓN COMPLETA

## 🎯 RESUMEN DE LA IMPLEMENTACIÓN

Se ha actualizado completamente el sistema de autenticación de Walla para soportar **múltiples negocios por usuario**, eliminando la limitación anterior de 1 usuario = 1 negocio.

## 🏗️ NUEVA ARQUITECTURA

### 1. ESTRUCTURA DE DATOS ACTUALIZADA

#### Collection: `users` (Perfil básico del usuario)

```javascript
{
  uid: "usuario123",
  email: "juan@email.com",
  nombre: "Juan",
  apellidos: "Pérez",
  fechaRegistro: Timestamp,
  activo: true,
  configuracion: {
    theme: "light",
    notifications: true
  }
  // ❌ ELIMINADO: businessId, businessName, rol
}
```

#### SubCollection: `users/{uid}/businesses` (Relación usuario-negocio)

```javascript
{
  businessId: "RESTAURANTE-A1B2C3D4",
  businessName: "Restaurante El Buen Sabor",
  rol: "gerente", // o "empleado"
  permissions: {
    verIngresos: true,
    verEgresos: true,
    crearMovimientos: true,
    editarMovimientos: false,
    verReportes: false
  },
  departamento: "Administración",
  fechaIngreso: Timestamp,
  activo: true,
  esPrincipal: true, // Negocio por defecto
  estadoInvitacion: "aceptada" // "pendiente", "aceptada", "rechazada"
}
```

#### Collection: `businesses` (Sin cambios)

```javascript
{
  id: "RESTAURANTE-A1B2C3D4",
  nombre: "Restaurante El Buen Sabor",
  tipo: "restaurante",
  gerenteId: "usuario123", // Creador original
  fechaCreacion: Timestamp,
  activo: true,
  configuracion: { ... }
}
```

### 2. STORES ACTUALIZADOS

#### `authStore.js` (Sin cambios mayores)

- Maneja autenticación Firebase
- Gestiona sesiones en localStorage
- Controla estado de autenticación

#### `userStore.js` (Completamente renovado)

```javascript
state: {
  userProfile: null,        // Perfil básico del usuario
  userBusinesses: [],       // ✅ NUEVO: Array de negocios
  currentBusiness: null,    // ✅ NUEVO: Negocio seleccionado
  isLoading: false,
  error: null
}

getters: {
  isManager,               // Si es gerente en algún negocio
  isEmployee,              // Si es empleado en algún negocio
  currentPermissions,      // Permisos del negocio actual
  primaryBusiness,         // Negocio principal
  hasBusinesses           // Si tiene al menos un negocio
}

actions: {
  loadUserProfile(),       // Carga perfil + negocios
  loadUserBusinesses(),    // ✅ NUEVO: Carga negocios del usuario
  switchBusiness(),        // ✅ NUEVO: Cambia negocio activo
  addBusinessToUser()      // ✅ NUEVO: Agrega relación usuario-negocio
}
```

#### `businessStore.js` (Sin cambios mayores)

- Maneja datos de negocios individuales
- Carga empleados por negocio
- Gestiona operaciones CRUD de negocios

### 3. FLUJOS DE NAVEGACIÓN

```mermaid
graph TD
    A[Login] --> B[Cargar perfil + negocios]
    B --> C{¿Cuántos negocios?}
    C -->|0 negocios| D[/onboarding]
    C -->|1 negocio| E[/business/{id}/dashboard]
    C -->|2+ negocios| F[/select-business]
    F --> G[Seleccionar negocio]
    G --> E
    D --> H[Crear negocio]
    H --> E
```

### 4. RUTAS IMPLEMENTADAS

```javascript
// Nuevas rutas principales
"/onboarding"; // Crear primer negocio o negocio adicional
"/select-business"; // Selector para usuarios multi-negocio
"/business/{id}/dashboard"; // Dashboard del negocio seleccionado

// Rutas legacy (mantenidas por compatibilidad)
"/waiting-assignment"; // Para empleados sin asignación
"/setup/business/{id}"; // Configuración inicial de negocio
```

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### ✅ Archivos Creados

- `src/views/business/BusinessSelector.vue` - Selector de negocios
- `src/views/onboarding/BusinessOnboarding.vue` - Onboarding de negocios
- `src/utils/createDemoData.js` - Script para datos de prueba

### 🔄 Archivos Modificados

- `src/stores/useUserStore.js` - Completamente renovado
- `src/views/auth/Login.vue` - Nueva lógica de redirección
- `src/views/business/Dashboard.vue` - Adaptado a multi-negocio
- `src/router/index.js` - Nuevas rutas agregadas
- `src/components/LayoutCmpts/Header.vue` - Corregido para Pinia
- `src/components/Auth/BtnLogout.vue` - Corregido para Pinia

## 🎮 CASOS DE USO SOPORTADOS

### Caso 1: Usuario Nuevo (Sin negocios)

1. Login exitoso
2. Sistema detecta 0 negocios
3. Redirige a `/onboarding`
4. Usuario crea su primer negocio
5. Redirige al dashboard del negocio creado

### Caso 2: Usuario con Un Solo Negocio

1. Login exitoso
2. Sistema detecta 1 negocio
3. Establece automáticamente como negocio actual
4. Redirige directamente al dashboard

### Caso 3: Usuario Multi-negocio

1. Login exitoso
2. Sistema detecta 2+ negocios
3. Redirige a `/select-business`
4. Usuario selecciona negocio deseado
5. Redirige al dashboard del negocio seleccionado

### Caso 4: Gerente que Agrega Nuevo Negocio

1. Desde dashboard → Botón "Crear nuevo negocio"
2. Redirige a `/onboarding?mode=create`
3. Completa formulario de nuevo negocio
4. Se agrega a su lista de negocios
5. Redirige al dashboard del nuevo negocio

### Caso 5: Empleado Invitado a Negocio

1. Gerente invita empleado (proceso manual/futuro)
2. Se crea entrada en `users/{uid}/businesses`
3. Empleado hace login
4. Sistema detecta nuevo negocio en su lista
5. Acceso normal según permisos

## 🔐 SISTEMA DE PERMISOS

### Permisos por Rol

```javascript
MANAGER_PERMISSIONS = {
  verIngresos: true,
  verEgresos: true,
  crearMovimientos: true,
  editarMovimientos: true,
  verReportes: true,
  gestionarEmpleados: true,
  configurarNegocio: true,
};

EMPLOYEE_PERMISSIONS = {
  verIngresos: true,
  verEgresos: false,
  crearMovimientos: true,
  editarMovimientos: false,
  verReportes: false,
  gestionarEmpleados: false,
  configurarNegocio: false,
};
```

### Verificación de Permisos

```javascript
// En componentes Vue
const hasPermission = (permission) => {
  if (userStore.isCurrentBusinessManager) return true;
  return userStore.currentPermissions?.[permission] || false;
};
```

## 💾 PERSISTENCIA DE DATOS

### LocalStorage

```javascript
STORAGE_KEYS = {
  PROFILE: "walla_profile", // Perfil básico del usuario
  BUSINESSES: "walla_businesses", // Lista de negocios del usuario
  CURRENT_BUSINESS: "walla_current_business", // Negocio actualmente seleccionado
};
```

### Restauración de Sesión

1. Al iniciar la app, se restaura desde localStorage
2. Se verifica validez de la sesión (24 horas)
3. Se sincroniza con Firebase si es necesario
4. Se establece negocio actual basado en última selección

## 🧪 DATOS DE PRUEBA

### Usuarios Demo Recomendados

```javascript
// Gerente con múltiples negocios
{
  email: "gerente@walla.app",
  password: "Gerente123!",
  negocios: ["RESTAURANTE-ABC123", "TIENDA-DEF456"]
}

// Empleado con un solo negocio
{
  email: "empleado@walla.app",
  password: "Empleado123!",
  negocios: ["RESTAURANTE-ABC123"]
}

// Usuario nuevo (sin negocios)
{
  email: "nuevo@walla.app",
  password: "Nuevo123!",
  negocios: []
}
```

## 🔄 MIGRACIÓN DE DATOS EXISTENTES

### Para usuarios con el sistema anterior:

1. Los datos existentes en `users` collection seguirán funcionando
2. Las rutas legacy (`/waiting-assignment`, `/setup/business/{id}`) se mantienen
3. Se recomienda migrar gradualmente a la nueva estructura
4. Script de migración puede crear automáticamente las subcollections

## 🚀 BENEFICIOS DEL NUEVO SISTEMA

### ✅ Flexibilidad Total

- Un usuario puede ser gerente de un negocio y empleado de otro
- Soporte nativo para múltiples fuentes de ingresos
- Fácil cambio entre negocios sin cerrar sesión

### ✅ Escalabilidad

- No hay límite en la cantidad de negocios por usuario
- Estructura preparada para funciones futuras (invitaciones, etc.)
- Separación clara entre perfil de usuario y datos de negocio

### ✅ Experiencia de Usuario

- Flujo intuitivo basado en cantidad de negocios
- Selección visual de negocios para usuarios multi-negocio
- Onboarding guiado para nuevos usuarios

### ✅ Mantenibilidad

- Código más modular y reutilizable
- Stores bien estructurados con responsabilidades claras
- Fácil testing de flujos individuales

## 🛠️ PRÓXIMOS PASOS RECOMENDADOS

1. **Implementar sistema de invitaciones**: Permitir a gerentes invitar empleados
2. **Dashboard unificado**: Vista que muestre resumen de todos los negocios
3. **Notificaciones**: Sistema de notificaciones por negocio
4. **Reportes cruzados**: Comparación entre múltiples negocios
5. **Roles avanzados**: Supervisor, Contador, etc.

## 🔗 REFERENCIAS TÉCNICAS

- **Vue 3 Composition API**: Para reactividad
- **Pinia**: Para gestión de estado global
- **Firebase Firestore**: Para persistencia de datos
- **Vue Router**: Para navegación y guards
- **Tailwind CSS**: Para estilos responsive

---

**Nota**: Este sistema mantiene compatibilidad con la implementación anterior mientras introduce la nueva funcionalidad multi-negocio.


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

