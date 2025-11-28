# Sistema de Gestión de Clientes

## 📋 Descripción General

Sistema completo para gestionar clientes con CRUD completo, búsqueda inteligente, visualización de estadísticas, historial de transacciones y gráficos analíticos.

## 🎯 Características Principales

### 1. **Dashboard de Clientes** (`/business/:businessId/clients`)

- ✅ Lista de todos los clientes activos (datos frescos en cada carga)
- ✅ Búsqueda en memoria por nombre (sin acentos, case-insensitive)
- ✅ Botón "Nuevo Cliente" con modal de creación
- ✅ Estadísticas generales:
  - Total de clientes
  - Clientes con deuda
  - Total de ventas
  - Total por cobrar
- ✅ Tarjetas de cliente con:
  - Nombre clickeable hacia WhatsApp
  - Teléfono clickeable hacia WhatsApp
  - DNI (si existe)
  - Total comprado
  - Saldo pendiente
  - Cantidad de transacciones
  - Última compra
  - Botones de acción rápida (Editar/Eliminar)

### 2. **Detalle del Cliente** (`/business/:businessId/clients/:clientId`)

#### **Tab: Resumen**

- 📊 Tarjetas con estadísticas financieras:
  - Total comprado (con contador de transacciones)
  - Total pagado (con porcentaje)
  - Saldo pendiente (con porcentaje)
- 📈 Barra de progreso visual del estado de pagos

#### **Tab: Transacciones**

- 📜 Historial completo de transacciones del cliente (límite 100)
- 🔗 Enlaces directos a detalles de cada transacción
- 💰 Información de montos (total, pagado, pendiente)
- 📦 Lista de productos por transacción
- 🏷️ Badges de tipo y estado de pago

#### **Tab: Estadísticas**

- 📊 **Gráfico de Compras por Mes** (últimos 12 meses)
  - Visualización con barras
  - Montos mensuales
  - Contador de transacciones
- 🏆 **Top 5 Productos Más Comprados**
  - Ordenado por monto total generado
  - Muestra cantidad y monto
  - Barras de progreso comparativas

### 3. **CRUD Completo**

#### **Crear Cliente** (Modal)

- ✅ Nombre (requerido)
- ✅ Teléfono (opcional, formato: 9 dígitos)
- ✅ DNI (opcional, formato: 8 dígitos numéricos)
- ✅ Validación en tiempo real
- ✅ Generación automática de UUID

#### **Editar Cliente** (Modal)

- ✅ Pre-poblado con datos actuales
- ✅ Detección de cambios (botón disabled si no hay cambios)
- ✅ Validación en tiempo real
- ✅ Actualización de timestamps automática

#### **Eliminar Cliente**

- ✅ Eliminación lógica (isActive: false)
- ✅ Confirmación antes de eliminar
- ✅ No permite eliminar cliente anónimo
- ✅ Actualización automática de la lista

## 🗂️ Estructura de Archivos

```
src/
├── composables/
│   └── useClients.js                      # Lógica de clientes y CRUD
├── views/
│   └── Clients/
│       ├── ClientsDashboard.vue           # Vista principal
│       └── ClientDetails.vue              # Vista de detalle con acciones
├── components/
│   └── Clients/
│       ├── ListAllClients.vue             # Lista con buscador y acciones
│       ├── ClientCard.vue                 # Tarjeta de cliente con DNI
│       ├── ClientStats.vue                # Estadísticas financieras
│       ├── ClientTransactionsList.vue     # Historial de transacciones
│       ├── CreateClientModal.vue          # Modal para crear cliente
│       └── EditClientModal.vue            # Modal para editar cliente
└── router/
    └── index.js                           # Rutas configuradas
```

## 🔧 Composables

### `useClients()`

**Funcionalidades:**

- `fetchAllClients()` - Obtener todos los clientes (sin caché, datos frescos)
- `createClient(clientData)` - Crear nuevo cliente con validación
- `updateClient(clientId, updates)` - Actualizar datos del cliente
- `deleteClient(clientId)` - Eliminación lógica (isActive: false)
- `filteredClients` - Clientes filtrados por búsqueda en memoria
- `clientsStats` - Estadísticas generales

**Retorna:**

```javascript
{
  clients, // Array de clientes
    loading, // Estado de carga
    error, // Errores
    searchQuery, // Query de búsqueda
    filteredClients, // Clientes filtrados
    clientsStats, // Estadísticas
    fetchAllClients, // Función para cargar todos
    createClient, // Función para crear
    updateClient, // Función para actualizar
    deleteClient; // Función para eliminar
}
```

### `useClientDetails(clientId)`

**Funcionalidades:**

- `initialize()` - Inicializar datos del cliente
- `fetchClient()` - Obtener datos del cliente
- `fetchClientTransactions()` - Obtener transacciones
- `getWhatsAppLink(phone, message)` - Generar link de WhatsApp

**Retorna:**

```javascript
{
  client, // Datos del cliente
    transactions, // Transacciones del cliente
    loading, // Estado de carga
    error, // Errores
    financialStats, // Estadísticas financieras
    topProducts, // Top 5 productos
    purchasesByMonth, // Compras por mes (12 meses)
    getWhatsAppLink, // Función para link de WhatsApp
    initialize; // Función inicializadora
}
```

## 🔗 Integración con WhatsApp

Los nombres y teléfonos son clickeables y redirigen a WhatsApp con el formato:

```
https://wa.me/51999999999?text=Hola%20Juan%20Pérez!
```

## 📊 Estructura de Datos de Cliente

```typescript
{
  uuid: string,              // ID único
  name: string,              // Nombre completo (requerido)
  phone: string|null,        // Teléfono opcional (9 dígitos)
  dni: string|null,          // DNI opcional (8 dígitos)
  isActive: boolean,         // Cliente activo
  totalPurchases: number,    // Suma total de compras
  pendingBalance: number,    // Deuda pendiente
  transactionCount: number,  // Cantidad de transacciones
  lastPurchase: Timestamp,   // Fecha de última compra
  businessId: string,        // ID del negocio
  createdAt: Timestamp,      // Fecha de creación
  updatedAt: Timestamp       // Última actualización
}
```

## 🎨 Características de UX/UI

### **Animaciones**

- ✨ Fade-in al cambiar de tab
- 🎭 Hover effects en tarjetas
- 📊 Animación de barras de progreso
- 🌊 Efecto shimmer en barra de pagos

### **Responsive Design**

- 📱 Mobile-first approach
- 🖥️ Adaptación automática para desktop
- 📐 Grid flexible según espacio disponible

### **Estados Visuales**

- ⏳ Loading states con spinners
- 🎯 Empty states informativos
- ❌ Error states con mensajes claros
- ✅ Success states con feedback visual

## 🚀 Navegación

```
Home
  └─ ClientsDashboard (/business/:businessId/clients)
       └─ ClientDetails (/business/:businessId/clients/:clientId)
            ├─ Tab: Resumen
            ├─ Tab: Transacciones
            │    └─ Link a RecordDetails (/business/:businessId/records/:registerId)
            └─ Tab: Estadísticas
```

## 📝 Notas Técnicas

1. **Sin Caché**: El sistema NO usa caché. Cada vez que se monta el componente, se cargan los datos frescos desde Firestore para mantener sincronización con otras vistas (ej: AccountsReceivable).

2. **Búsqueda en Memoria**: La búsqueda se realiza en memoria después de cargar todos los clientes (limit 200). Normaliza texto para búsqueda sin acentos y case-insensitive.

3. **Cliente Anónimo**: Se excluye automáticamente el cliente con `uuid: 'anonymous-client'` de las listas.

4. **Cálculos en Tiempo Real**: Todas las estadísticas se calculan reactivamente basándose en los datos más recientes.

5. **Lazy Loading**: Las vistas se cargan de forma diferida con `Suspense`.

6. **CRUD Sincrónico**: Cada operación de crear/editar/eliminar recarga automáticamente la lista completa para reflejar cambios al instante.

7. **Validaciones**:
   - Nombre: requerido, mínimo 2 caracteres
   - Teléfono: opcional, formato libre (recomendado 9 dígitos)
   - DNI: opcional, solo números, máximo 8 dígitos

## 🔮 Futuras Mejoras Sugeridas

- [ ] Edición de datos del cliente
- [ ] Eliminación lógica de clientes
- [ ] Exportar datos a PDF/Excel
- [ ] Filtros avanzados (por deuda, por actividad)
- [ ] Envío de recordatorios de pago por WhatsApp
- [ ] Notas internas por cliente
- [ ] Historial de cambios

## 🐛 Debugging

Para verificar el funcionamiento:

1. Abrir DevTools de Vue
2. Revisar el composable `useClients`
3. Verificar que las queries de Firestore traen datos
4. Comprobar que `businessId` está disponible

Console logs útiles:

```javascript
console.log("Clientes:", clients.value);
console.log("Stats:", clientsStats.value);
console.log("Transacciones:", transactions.value);
```

---

**Creado:** 25 de noviembre de 2025
**Versión:** 1.0.0
**Estado:** ✅ Completado y funcional
