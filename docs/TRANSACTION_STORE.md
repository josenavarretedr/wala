# `transactionStore.js` — Documentación del Store de Transacciones

**Archivo:** `src/stores/transaction/transactionStore.js`
**Tipo:** Composable Store (no Pinia, exportado como función)
**Módulo:** Core — Transacciones, Ingresos, Gastos, Transferencias y Cotizaciones

---

## ⚠️ Nota Importante

Este store es un **composable-style store** (no usa `defineStore` de Pinia). Define variables **module-level** (reactivas globales) accesibles vía `useTransactionStore()`.

Es el **store más usado en toda la aplicación** — prácticamente todos los flujos de transacción lo consumen.

---

## Dependencias

Delega operaciones a:

- `useTransaccion` — CRUD de transacciones en Firestore
- `useInventory` — gestión de stockLogs
- `useExpenses` — gestión de gastos
- `useTraceability` — registro de trazabilidad
- `useOptimisticSync` — actualizaciones optimistas (Fase 3)
- `useProductCache` — caché de productos
- `useDailySummary` — resumen diario

---

## State (Module-Level)

| Variable                      | Tipo                | Descripción                                                    |
| ----------------------------- | ------------------- | -------------------------------------------------------------- |
| `status`                      | `Ref<String\|null>` | Estado de la última operación (`null`, `'success'`, `'error'`) |
| `transactionsInStore`         | `Ref<Array>`        | Lista de transacciones cargadas                                |
| `currentStepOfAddTransaction` | `Ref<Number>`       | Paso actual del wizard de creación                             |
| `transactionToAdd`            | `Ref<Object>`       | Objeto de la transacción en construcción                       |
| `itemToAddInTransaction`      | `Ref<Object>`       | Item/producto siendo agregado a la transacción                 |
| `itemToAddInExpenseMaterial`  | `Ref<Object>`       | Material siendo agregado a un gasto                            |

### Estructura de `transactionToAdd`

```javascript
{
  uuid: null,
  type: null,             // 'income' | 'expense' | 'transfer'
  account: null,          // 'cash' | 'bank'
  items: [],              // Productos vendidos
  itemsAndStockLogs: [],  // Relación item ↔ stockLog (incluye materiales en composición)
  payments: [],           // Array de pagos (pagos parciales)
  paymentStatus: 'completed', // 'pending' | 'partial' | 'completed'
  totalPaid: 0,
  balance: 0,
  clientId: null,
  clientName: 'Cliente Anónimo',
  description: null,      // Para gastos
  category: null,
  subcategory: null,
  amount: 0,
  materialItems: [],      // Materiales comprados en gasto tipo 'materials'
  paylabor: null,         // Clasificación contable MOD
  overheadUsage: null,    // Clasificación overhead
  bucket: null,           // Clasificación contable
  splits: null,           // Para overhead MIXED
  fromAccount: null,      // Para transferencias
  toAccount: null,        // Para transferencias
}
```

---

## Actions

### Creación de Transacciones

#### `addTransaction()`

**Descripción:** Crea una transacción completa (ingreso o gasto) incluyendo stockLogs, trazabilidad y actualización de inventario.
**Efectos secundarios:** Crea en Firestore, actualiza inventario, registra trazabilidad, actualiza analytics/streak.

#### `saveSystemTransaction(transaction)`

**Descripción:** Guarda una transacción de sistema (apertura/cierre) directamente en Firestore.

#### `addQuote(quoteData)`

**Descripción:** Crea una cotización y la guarda en Firestore.

#### `getNextQuoteNumber()`

**Descripción:** Obtiene el siguiente número de cotización disponible.

---

### Lectura de Transacciones

| Action                                     | Descripción                                             |
| ------------------------------------------ | ------------------------------------------------------- |
| `getTransactions()`                        | Carga todas las transacciones del negocio               |
| `getTransactionsToday()`                   | Carga transacciones del día actual                      |
| `getTransactionsByDayStore(dayString)`     | Carga transacciones de un día específico (`YYYY-MM-DD`) |
| `fetchPendingTransactions()`               | Carga transacciones con pagos parciales pendientes      |
| `getLastClosures(limit?)`                  | Obtiene las últimas N transacciones de cierre           |
| `getOneTransactionDataByID(transactionId)` | Busca una transacción por ID en el store                |

---

### Filtros de Transacciones (del store)

| Action                               | Descripción                        |
| ------------------------------------ | ---------------------------------- |
| `getAllIncomeTransactionsInStore()`  | Filtra ingresos del store          |
| `getAllExpenseTransactionsInStore()` | Filtra gastos del store            |
| `getAllCashTransactionsInStore()`    | Filtra transacciones en efectivo   |
| `getAllBankTransactionsInStore()`    | Filtra transacciones bancarias     |
| `hasCajaDiaria`                      | Computed: si hay transacciones hoy |
| `hasClosureToday`                    | Computed: si hay cierre hoy        |

---

### Modificadores de `transactionToAdd`

| Action                                                   | Parámetro                 | Descripción                      |
| -------------------------------------------------------- | ------------------------- | -------------------------------- |
| `modifyTransactionToAddType(type)`                       | `'income'` \| `'expense'` | Cambia el tipo                   |
| `modifyTransactionExpenseDescriptionAndCost(desc, cost)` | String, Number            | Actualiza descripción y monto    |
| `modifyTransactionToAddAccount(account)`                 | `'cash'` \| `'bank'`      | Cambia la cuenta                 |
| `setExpenseDescription(desc)`                            | String                    | Establece descripción del gasto  |
| `setExpenseAmount(amount)`                               | Number                    | Establece monto del gasto        |
| `setExpenseCategory(category)`                           | String                    | Establece categoría del gasto    |
| `setTransferFromAccount(account)`                        | `'cash'` \| `'bank'`      | Cuenta origen de transferencia   |
| `setTransferToAccount(account)`                          | `'cash'` \| `'bank'`      | Cuenta destino de transferencia  |
| `setClientInfo(clientId, clientName)`                    | String, String            | Vincula cliente a la transacción |
| `setBucket(bucket)`                                      | String                    | Clasificación contable principal |
| `setSplits(splits)`                                      | Array                     | Splits para overhead MIXED       |
| `setPayLabor(type)`                                      | String                    | Tipo de mano de obra             |
| `setOverheadUsage(usage)`                                | String                    | Tipo de uso de overhead          |

---

### Wizard Navigation

| Action                       | Descripción                         |
| ---------------------------- | ----------------------------------- |
| `nextStepToAddTransaction()` | Avanza al siguiente paso del wizard |
| `prevStepToAddTransaction()` | Retrocede al paso anterior          |
| `getSteps()`                 | Retorna la configuración de pasos   |
| `totalSteps`                 | Total de pasos del wizard           |

---

### Gestión de Items

| Action                                       | Descripción                                 |
| -------------------------------------------- | ------------------------------------------- |
| `modifyItemToAddInTransaction(product)`      | Modifica el item actual en construcción     |
| `modifyItemToAddInExpenseMaterial(material)` | Modifica el material actual en construcción |
| `addItemToTransaction()`                     | Agrega el item actual al array `items`      |
| `addMaterialItemToExpense()`                 | Agrega el material al array `materialItems` |
| `removeItemToTransaction(index)`             | Elimina un item por índice                  |
| `removeMaterialItemFromExpense(index)`       | Elimina un material por índice              |
| `resetItemToAddInTransaction()`              | Resetea `itemToAddInTransaction`            |
| `resetItemToAddInExpenseMaterial()`          | Resetea `itemToAddInExpenseMaterial`        |

---

### Pagos (Pagos Parciales)

| Action                                                         | Descripción                                   |
| -------------------------------------------------------------- | --------------------------------------------- |
| `addPayment(paymentData)`                                      | Agrega un pago al array `payments`            |
| `setPaymentInfo(info)`                                         | Establece info de pago                        |
| `createPaymentTransaction(transactionId, paymentData)`         | Registra un pago en una transacción existente |
| `deletePaymentFromIncomeTransaction(transactionId, paymentId)` | Elimina un pago                               |

---

### Otras Operaciones

| Action                                          | Descripción                                        |
| ----------------------------------------------- | -------------------------------------------------- |
| `modifyTransaction(transactionId, updatedData)` | Actualiza una transacción existente                |
| `deleteOneTransactionByID(transactionId)`       | Elimina una transacción por ID                     |
| `resetTransactionToAdd()`                       | Resetea `transactionToAdd` a sus valores iniciales |
| `resetTransactionInStore()`                     | Vacía `transactionsInStore`                        |
| `isTransactionFromToday(transaction)`           | Verifica si una transacción es de hoy              |

---

## Uso en Componentes

Ampliamente usado en prácticamente todos los componentes de flujo de transacciones, historial y dashboard. Ver el mapa de Vue → Store para la lista completa.

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Store verificado como el más usado en producción (presente en 35+ componentes).
