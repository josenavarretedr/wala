# Firebase Functions - Sistema de Cierre Automático

## 📋 Descripción General

Este módulo contiene las Cloud Functions que manejan el sistema de cierre automático de caja y cálculos financieros del negocio. Toda la infraestructura está diseñada para ser consistente con los stores y composables del frontend.

## 🏗️ Arquitectura e Infraestructura

### Consistencia con Frontend

Las functions siguen los mismos patrones que:

- **useTransaction.js** - Manejo de transacciones
- **transactionStore.js** - Estructura de datos de transacciones
- **useCashClosure.js** - Lógica de cierre de caja
- **accountsBalanceStore.js** - Cálculos financieros y balance

### Principios de Diseño

1. **UUIDs Consistentes**: Todas las transacciones usan UUIDs generados con `uuid` v4
2. **Estructura de Datos Uniforme**: Mismos campos y tipos que en el frontend
3. **Trazabilidad**: Metadata completa en todas las operaciones
4. **Logging Detallado**: Logs exhaustivos para debugging y auditoría
5. **Manejo de Errores**: Try-catch con registro en Firestore

## 📂 Estructura de Archivos

```
functions/
├── src/
│   ├── AccountsBalance/
│   │   ├── onTransactionWrite.js       # Trigger: Actualiza resúmenes diarios
│   │   ├── lazyCloseIfNeeded.js        # Callable: Cierre lazy-open
│   │   ├── scheduledAutoClose.js       # Scheduled: Cierre programado diario
│   │   ├── testScheduledAutoClose.js   # HTTP: Testing de cierre automático
│   │   ├── sharedComputed.js           # Helpers: Cálculos financieros
│   │   └── sharedStreak.js             # Helpers: Manejo de rachas
│   ├── Helpers/
│   │   └── time.js                     # Utilidades de fecha/hora con Luxon
│   └── index.js                        # Exporta todas las functions
├── package.json
└── README.md                           # Este archivo
```

## 🔧 Functions Disponibles

### 1. `onTransactionWrite` (Trigger)

**Tipo**: Document Trigger  
**Ruta**: `businesses/{businessId}/transactions/{txId}`  
**Eventos**: create, update, delete

**Descripción**:
Trigger automático que se ejecuta cuando cambia cualquier transacción. Recalcula los agregados del día y actualiza el resumen diario.

**Flujo**:

1. Detecta cambio en transacción
2. Obtiene timezone del negocio
3. Calcula día de la transacción
4. Obtiene agregados (ingresos, egresos, flags)
5. Actualiza `dailySummaries/{day}`

**Uso**:
Se ejecuta automáticamente. No requiere llamada manual.

---

### 2. `lazyCloseIfNeeded` (Callable)

**Tipo**: Callable Function  
**Endpoint**: `lazyCloseIfNeeded`

**Parámetros**:

```javascript
{
  businessId: string; // ID del negocio
}
```

**Respuesta**:

```javascript
{
  closed: boolean,        // Si se creó cierre
  mode?: 'lazyOpen',     // Modo de cierre
  day?: string,          // Día cerrado (yyyy-LL-dd)
  closureId?: string,    // UUID de la transacción
  reason?: string        // Razón si no se cerró
}
```

**Descripción**:
Función callable que cierra el día anterior si quedó abierto sin cierre. Se ejecuta al hacer una apertura nueva (lazy-open).

**Flujo**:

1. Valida autenticación y businessId
2. Calcula día anterior según timezone
3. Verifica si tiene apertura sin cierre
4. Crea transacción de cierre con UUID
5. Actualiza dailySummary
6. Rompe racha de días consecutivos

**Cuándo se usa**:

- Cuando un usuario inicia una nueva apertura
- El frontend la llama desde `useCashClosure.createOpening()`

**Ejemplo de llamada (Frontend)**:

```javascript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const lazyClose = httpsCallable(functions, "lazyCloseIfNeeded");

const result = await lazyClose({ businessId: "abc123" });
console.log(result.data); // { closed: true, mode: 'lazyOpen', ... }
```

---

### 3. `scheduledAutoClose` (Scheduled)

**Tipo**: Scheduled Function  
**Schedule**: `5 0 * * *` (Diariamente a las 00:05)  
**Timezone**: America/Lima

**Descripción**:
Función programada que se ejecuta automáticamente cada día a medianoche. Procesa todos los negocios y cierra días pendientes.

**Flujo**:

1. Se ejecuta automáticamente a las 00:05
2. Obtiene todos los negocios activos
3. Para cada negocio:
   - Calcula día anterior
   - Obtiene agregados del día
   - Si está abierto sin cierre → crea cierre automático
   - Si está completo → incrementa racha
4. Guarda resumen de ejecución en Firestore

**Casos de uso**:

- **Día abierto sin cierre**: Crea cierre automático y rompe racha
- **Día completo**: Incrementa racha de días consecutivos
- **Día sin apertura**: No hace nada

**Configuración**:

```javascript
{
  schedule: '5 0 * * *',     // Cron expression
  timeZone: 'America/Lima',  // Timezone
  retryCount: 3,             // Reintentos
  memory: '256MiB',          // Memoria
  timeoutSeconds: 540        // Timeout (9 min)
}
```

**Logs**:
Toda ejecución se registra en:

- Cloud Functions logs (Google Cloud Console)
- `scheduled_executions` collection (Firestore)
- `system_logs` collection (errores por negocio)

---

### 4. `testScheduledAutoClose` (HTTP)

**Tipo**: HTTP Request  
**Método**: GET  
**Endpoint**: `https://[region]-[project].cloudfunctions.net/testScheduledAutoClose`

**Query Params**:

```
?businessId=abc123  // Opcional: testear solo un negocio
```

**Respuesta**:

```javascript
{
  success: boolean,
  summary: {
    total: number,           // Total de negocios
    autoClosed: number,      // Cierres creados
    streakIncreased: number, // Rachas incrementadas
    noAction: number         // Sin acción
  },
  results: [
    {
      businessId: string,
      day: string,
      timezone: string,
      action: 'auto-closed' | 'streak-increased' | 'none',
      transactionId: string | null,
      aggregates: { ... },
      timestamp: string
    }
  ],
  timestamp: string
}
```

**Descripción**:
Función HTTP para testing manual del cierre automático. Simula el comportamiento de `scheduledAutoClose` con logs detallados.

**Uso**:

```bash
# Testear todos los negocios
curl https://[region]-[project].cloudfunctions.net/testScheduledAutoClose

# Testear un negocio específico
curl "https://[region]-[project].cloudfunctions.net/testScheduledAutoClose?businessId=abc123"
```

---

## 🛠️ Helpers Compartidos

### `sharedComputed.js`

Funciones para cálculos financieros (equivalente a `accountsBalanceStore.js`).

#### `getDayAggregates(db, businessId, day, tz)`

Calcula los agregados financieros de un día específico.

**Retorna**:

```javascript
{
  hasOpening: boolean,     // Si existe apertura
  hasClosure: boolean,     // Si existe cierre
  hasTxn: boolean,         // Si hay transacciones operativas
  totals: {
    income: number,        // Total ingresos
    expense: number,       // Total egresos
    net: number           // Resultado neto (income - expense)
  }
}
```

**Tipos de transacciones reconocidas**:

- `opening`: Apertura de caja
- `closure`: Cierre de caja
- `income`: Ingreso (venta)
- `expense`: Egreso (gasto)
- `transfer`: Transferencia entre cuentas

#### `upsertDailySummary(db, businessId, day, patch)`

Inserta o actualiza el resumen diario (merge operation).

**Parámetros**:

- `db`: Instancia de Firestore
- `businessId`: ID del negocio
- `day`: Día en formato `yyyy-LL-dd`
- `patch`: Objeto con datos a actualizar

**Estructura del documento `dailySummary`**:

```javascript
{
  day: string,              // yyyy-LL-dd
  hasOpening: boolean,
  hasClosure: boolean,
  hasTxn: boolean,
  totals: {
    income: number,
    expense: number,
    net: number
  },
  isAutoClosed: boolean,    // Si fue cierre automático
  closureId: string,        // UUID de la transacción de cierre
  autoCloseReason: string,  // 'scheduled' | 'lazyOpen'
  completedAt: Timestamp,
  lastUpdated: Timestamp
}
```

---

### `sharedStreak.js`

Funciones para manejar rachas de días consecutivos.

#### `breakStreak(db, businessId)`

Rompe la racha de días consecutivos. Se ejecuta cuando se cierra automáticamente.

**Estructura del documento `streak`**:

```javascript
{
  current: 0,                    // Racha actual reseteada
  max: number,                   // Racha máxima (se mantiene)
  lastCompletedDay: string,      // yyyy-LL-dd
  copilotDays: number,          // Días cerrados por copilot
  brokenAt: string              // ISO timestamp
}
```

#### `incStreakIfConsecutive(db, businessId, day, tz)`

Incrementa la racha si el día es consecutivo al anterior.

**Lógica**:

- Si el día anterior es consecutivo → incrementa racha
- Si no es consecutivo → reinicia racha a 1
- Siempre actualiza el máximo si se supera

---

### `time.js` (Helpers)

Utilidades de fecha/hora usando Luxon.

**Funciones disponibles**:

```javascript
// Fecha actual en timezone
nowIn(tz = 'America/Lima'): DateTime

// Inicio/fin de día
startOfDay(dayStr, tz): Date
endOfDay(dayStr, tz): Date

// Strings de fecha
todayStr(tz): string          // yyyy-LL-dd
yesterdayStr(tz): string      // yyyy-LL-dd

// Operaciones
dayMinus(dayStr, n, tz): string
dayFromTimestamp(timestamp, tz): string

// Rangos para queries Firestore
dateRangeForDay(dayStr, tz): { start: Date, end: Date }
```

---

## 🔐 Estructura de Datos

### Transacción de Cierre Automático

```javascript
{
  uuid: string,                // UUID v4 generado con uuid library
  type: 'closure',
  description: string,         // 'Cierre automático programado' | 'Cierre automático (lazy-open)'
  source: 'copilot',          // Indica que fue automático
  copilotMode: string,        // 'scheduled' | 'lazyOpen' | 'test'
  account: 'cash',            // Cuenta por defecto
  amount: 0,                  // Siempre 0 para cierres automáticos
  metadata: {
    day: string,              // yyyy-LL-dd
    triggerType: string,      // Tipo de trigger
    autoGenerated: true,      // Flag de auto-generación
    executionTime: string,    // ISO timestamp
    aggregates: {             // Datos del día
      totalIncome: number,
      totalExpense: number,
      netResult: number,
      hasTransactions: boolean
    }
  },
  createdAt: Timestamp        // serverTimestamp()
}
```

### Resumen Diario (dailySummary)

```javascript
{
  day: '2025-10-13',          // yyyy-LL-dd
  hasOpening: true,
  hasClosure: true,
  hasTxn: true,
  totals: {
    income: 1500.00,
    expense: 500.00,
    net: 1000.00
  },
  isAutoClosed: true,         // Si fue cierre automático
  closureId: 'uuid-here',     // UUID de la transacción
  autoCloseReason: 'scheduled',
  completedAt: Timestamp,
  lastUpdated: Timestamp
}
```

### Racha (streak)

```javascript
{
  current: 5,                 // Racha actual
  max: 15,                    // Racha máxima histórica
  lastCompletedDay: '2025-10-13',
  copilotDays: 3,            // Días cerrados por copilot
  brokenAt: '2025-10-14T00:05:00.000Z',  // Opcional
  updatedAt: '2025-10-14T00:05:00.000Z'
}
```

---

## 🚀 Deployment

### Instalar Dependencias

```bash
cd functions
npm install
```

### Deploy Individual

```bash
# Deploy una función específica
firebase deploy --only functions:onTransactionWrite
firebase deploy --only functions:lazyCloseIfNeeded
firebase deploy --only functions:scheduledAutoClose
firebase deploy --only functions:testScheduledAutoClose
```

### Deploy Todas

```bash
firebase deploy --only functions
```

### Testing Local (Emulators)

```bash
# Iniciar emuladores
firebase emulators:start

# La función scheduledAutoClose NO se ejecutará automáticamente en emulators
# Usar testScheduledAutoClose para testing manual:
curl "http://localhost:5001/[project-id]/[region]/testScheduledAutoClose"
```

---

## 📊 Logs y Monitoreo

### Ver Logs en Tiempo Real

```bash
firebase functions:log --only scheduledAutoClose
```

### Ver en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Seleccionar proyecto
3. Ir a **Cloud Functions** → **Logs**
4. Filtrar por nombre de función

### Logs en Firestore

**Ejecuciones programadas**:

```javascript
// Collection: scheduled_executions
{
  type: 'auto_close',
  results: { ... },
  duration: 1234,
  timestamp: Timestamp,
  success: true
}
```

**Errores por negocio**:

```javascript
// Collection: system_logs
{
  type: 'scheduled_auto_close_error',
  businessId: 'abc123',
  error: 'Error message',
  stack: 'Stack trace',
  timestamp: Timestamp
}
```

---

## 🧪 Testing

### Test Manual con HTTP Function

```bash
# Testear todos los negocios
curl https://us-central1-[project-id].cloudfunctions.net/testScheduledAutoClose

# Testear un negocio específico
curl "https://us-central1-[project-id].cloudfunctions.net/testScheduledAutoClose?businessId=abc123"
```

### Test con Firebase CLI

```bash
# Llamar función callable
firebase functions:shell
> lazyCloseIfNeeded({businessId: 'abc123'})
```

### Test de Triggers

Los triggers se ejecutan automáticamente al modificar documentos:

```javascript
// En el frontend o Firestore console
await setDoc(doc(db, "businesses/abc123/transactions/xyz"), {
  type: "income",
  amount: 100,
  // ... otros campos
});
// onTransactionWrite se ejecutará automáticamente
```

---

## 🔧 Configuración de Cloud Scheduler

Para que `scheduledAutoClose` se ejecute automáticamente en producción:

1. Ir a [Cloud Scheduler](https://console.cloud.google.com/cloudscheduler)
2. La función se auto-registra en el primer deploy
3. Verificar que el schedule esté configurado: `5 0 * * *`
4. Verificar timezone: `America/Lima`

**Nota**: En emulators, Cloud Scheduler no funciona. Usar `testScheduledAutoClose` para testing.

---

## ⚠️ Consideraciones Importantes

### UUIDs Consistentes

- **Siempre usar `uuid` v4** para generar IDs de transacciones
- NO usar `doc().id` de Firestore (solo para testing)
- Consistente con `useTransaction.js` del frontend

### Timezone

- Siempre pasar timezone del negocio a funciones de tiempo
- Default: `America/Lima` (UTC-5)
- Almacenar en `businesses/{id}.timezone`

### Manejo de Errores

- Siempre usar try-catch en loops de negocios
- No fallar toda la ejecución por un negocio
- Registrar errores en `system_logs`

### Performance

- `scheduledAutoClose` tiene timeout de 9 minutos
- Procesa negocios secuencialmente (no paralelo)
- Si hay muchos negocios (>100), considerar batching

### Costos

- Cada ejecución programada cuenta como invocación
- Triggers cuentan por cada documento modificado
- Ver [Firebase Pricing](https://firebase.google.com/pricing)

---

## 📚 Referencias

### Frontend Relacionado

- `src/composables/useTransaction.js` - Creación de transacciones
- `src/stores/transaction/transactionStore.js` - Estado de transacciones
- `src/stores/AccountsBalanceApp/accountsBalanceStore.js` - Cálculos financieros
- `src/composables/useCashClosure.js` - Lógica de cierre

### Firebase Docs

- [Cloud Functions v2](https://firebase.google.com/docs/functions)
- [Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)
- [Callable Functions](https://firebase.google.com/docs/functions/callable)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)

### Librerías

- [uuid](https://www.npmjs.com/package/uuid) - Generación de UUIDs
- [Luxon](https://moment.github.io/luxon/) - Manejo de fechas/timezones
- [Firebase Admin](https://firebase.google.com/docs/admin/setup) - SDK de admin

---

## 🤝 Contribución

Al agregar nuevas functions:

1. ✅ Seguir la estructura de datos del frontend
2. ✅ Usar UUID v4 para IDs
3. ✅ Agregar logs detallados
4. ✅ Manejar errores apropiadamente
5. ✅ Agregar metadata de trazabilidad
6. ✅ Documentar en este README
7. ✅ Exportar en `index.js`

---

## 📝 Changelog

### 2025-10-14

- ✨ Migración completa a UUID v4 consistente
- 📝 Documentación exhaustiva de infraestructura
- 🔧 Mejoras en logs y trazabilidad
- 🏗️ Refactorización para consistencia con frontend
- 🐛 Correcciones en manejo de errores
- 📊 Agregado de metadata completa en transacciones

---

## 📧 Soporte

Para preguntas o issues, contactar al equipo de desarrollo o crear un issue en el repositorio.
