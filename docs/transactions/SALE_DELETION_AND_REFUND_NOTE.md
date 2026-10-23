# 🔄 Eliminación de Ventas y Notas de Devolución (`deleteSale`)

**Última actualización:** Octubre 2026
**Versión:** 1.0.0
**Estado:** ✅ Activo

---

## 📋 Descripción General

El sistema de eliminación y reversión de ventas (`type: 'income'`) opera a través de la Cloud Function transaccional **`deleteSale`** (`apps/functions/src/Transaction/deleteSale.js`, región `southamerica-east1`) con una **política contable dual** determinada automáticamente según el estado de apertura/cierre del día de la venta (`saleDay`) y del día actual (`today`):

1. **Modo A — `DIRECT_DELETE` (Venta del Día Abierto Actual):**
   - **Condición:** `saleDay === today` y el día actual **no** tiene cierre de caja (`!saleDayClosed && !todayHasClosure`).
   - **Efecto en Caja:** Se elimina físicamente el documento de la venta (`income`), sus cobros posteriores (`type: 'payment'`) y sus gastos de delivery vinculados (`type: 'expense'`). Se recalcula el `dailySummary` del día actual restando el efectivo y banco/digital que habían ingresado.
   - **Efecto en Inventario y Capital:** Se restaura el stock exacto descontado (`quantityDeducted`) en productos simples, variantes (`variantCombos` + `stockSummary`), materiales de composición (`materialStockLogs`) y empaques (`packagingItemsAndStockLogs`), eliminando los documentos `stockLog` originales en la subcolección `businesses/{businessId}/products/{productId}/stockLog/{logId}`.
   - **Efecto en Cliente:** Se recalcula `totalPurchases`, `pendingBalance`, `transactionCount`, `lastPurchase` y estadísticas del cliente.

2. **Modo B — `REFUND_NOTE` / Nota de Devolución (Venta de un Día Cerrado):**
   - **Condición:** `saleDay < today` o `saleDayClosed === true`.
   - **Precondición de Caja Abierta Hoy:** Para emitir una Nota de Devolución que mueve efectivo/banco e inventario en el día actual (`today`), **el día de hoy debe tener apertura de caja activa (`todayHasOpening === true`) y no debe estar cerrado (`todayHasClosure === false`)**.
     - Si hoy no tiene apertura → bloquea con código `TODAY_NOT_OPENED`.
     - Si hoy ya fue cerrado → bloquea con código `TODAY_ALREADY_CLOSED`.
   - **Inmutabilidad del Día Cerrado:** La venta original en `saleDay` **no se elimina**, preservando el cuadre histórico de ese cierre. Se actualiza con:
     - `status: 'refunded'`
     - `paymentStatus: 'refunded'`
     - `balance: 0`
     - `refundTransactionId`, `refundedAt`, `refundedBy`, `refundReason`
   - **Impacto en Flujo de Caja Hoy (`type: 'refund'`):** Se crea una nueva transacción `type: 'refund'` con fecha de hoy (`Timestamp.now()`) referenciando `relatedTransactionId: saleUuid`. Registra la salida real de dinero (`cashOut`, `bankOut`, `amount = totalPaid`) según los pagos efectivamente cobrados (deduplicando `sale.payments[]` y documentos `type: 'payment'`), más `cancelledBalance` por cualquier saldo a crédito anulado.
   - **Impacto en Inventario y Capital Hoy (`stockLog` `type: 'return'`):** Se reincorpora el stock a productos, variantes, materiales y empaques, y se crean nuevos documentos `stockLog` con `type: 'return'`, `transactionId: refundUuid`, `relatedSaleId: saleUuid`, dejando trazabilidad en el kardex del día de hoy y recomponiendo el capital valorizado (`stock * cost`).
   - **Impacto en Cliente y Cuentas por Cobrar:** Las ventas con `status: 'refunded'` o `paymentStatus: 'refunded'` se excluyen de `totalPurchases`, `pendingBalance`, `transactionCount`, `topProducts`, `purchasesByMonth` y del módulo de Cuentas por Cobrar (`useAccountsReceivable.js`).

---

## 🧭 Flujo de Decisión Contable

```
Usuario solicita eliminar/anular venta (saleUuid)
                      │
                      ▼
     ¿La venta ya tiene status === 'refunded'?
          ├── Sí ──► Bloquear (ALREADY_REFUNDED)
          └── No
               │
               ▼
  ¿saleDay === today Y el día actual sigue abierto?
     ├── Sí ──► MODO A: DIRECT_DELETE (Eliminación física en el día abierto)
     └── No (Venta de día anterior o día ya cerrado)
          │
          ▼
     ¿El día actual (today) tiene Apertura activa?
          ├── No ──► Bloquear (TODAY_NOT_OPENED)
          └── Sí
               │
               ▼
     ¿El día actual (today) ya tiene Cierre registrado?
          ├── Sí ──► Bloquear (TODAY_ALREADY_CLOSED)
          └── No ──► MODO B: REFUND_NOTE (Nota de Devolución en la caja de HOY)
```

---

## 🗄️ Estructura Firestore

### 1. Transacción `type: 'refund'` (Nota de Devolución)
Ruta: `businesses/{businessId}/transactions/{refundUuid}`

```javascript
{
  uuid: "refund-uuid",
  id: "refund-uuid",
  type: "refund",
  category: "sale_refund",
  subcategory: "closed_day_reversal",
  description: "Nota de devolución (Venta #104): Cliente devolvió producto",
  relatedTransactionId: "original-sale-uuid",
  relatedTransactionNumber: 104,
  originalSaleDay: "2026-10-20",
  originalSaleAmount: 450,
  amount: 450,            // Dinero total efectivamente devuelto (cashOut + bankOut + detractionOut)
  cashOut: 250,           // Efectivo que sale de caja hoy
  bankOut: 200,           // Dinero que sale de Banco/Yape/Plin hoy
  detractionOut: 0,       // Dinero que se revierte de la cuenta de Detracciones (SPOT) hoy
  isSubjectToDetraction: false,
  cancelledBalance: 0,    // Deuda a crédito anulada (si era venta parcial o a crédito)
  account: "mixed",       // 'cash' | 'bank' | 'mixed'
  clientId: "client-uuid",
  clientName: "Juan Pérez",
  items: [...],           // Snapshot de los ítems devueltos
  returnStockLogs: [      // Referencias a los stockLogs type='return' creados hoy
    { productId: "prod-1", stockLogId: "log-uuid", quantity: 1, variantId: null }
  ],
  reason: "Cliente devolvió producto",
  createdBy: "user-uid",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. Campos añadidos a la Venta Original (`type: 'income'`) en Modo `REFUND_NOTE`
Ruta: `businesses/{businessId}/transactions/{saleUuid}`

```javascript
{
  status: "refunded",
  paymentStatus: "refunded",
  balance: 0,
  refundTransactionId: "refund-uuid",
  refundedAt: Timestamp,
  refundedBy: "user-uid",
  refundReason: "Cliente devolvió producto",
  updatedAt: Timestamp
}
```

### 3. Nuevo `stockLog` en Subcolección (`type: 'return'`)
Ruta: `businesses/{businessId}/products/{productId}/stockLog/{stockLogUuid}`

- Además, `createStockLog` (`useInventory.js`) ahora persiste siempre `quantityDeducted` en cada salida de inventario para evitar inflar el stock al revertir ventas que se realizaron con stock insuficiente.

---

## 🔌 API Pública

### Cloud Function: `deleteSale` (`southamerica-east1`)

**Request (`data`):**
```javascript
{
  businessId: string,
  saleUuid: string,
  reason?: string,
  dryRun?: boolean // true = solo previsualización de modo e impacto; false = ejecuta transacción
}
```

**Response (`data`):**
```javascript
{
  ok: true,
  dryRun: boolean,
  mode: 'DIRECT_DELETE' | 'REFUND_NOTE' | 'BLOCKED',
  canExecute: boolean,
  blockReason: null | 'TODAY_NOT_OPENED' | 'TODAY_ALREADY_CLOSED' | 'ALREADY_REFUNDED',
  saleUuid: string,
  refundTransactionId: string | null,
  saleDay: 'yyyy-LL-dd',
  today: 'yyyy-LL-dd',
  impact: {
    saleUuid: string,
    saleAmount: number,
    money: {
      cashOut: number,
      bankOut: number,
      detractionOut: number,
      totalPaidOut: number,
      cancelledBalance: number,
      linkedPaymentsCount: number,
      linkedDeliveryExpensesCount: number
    },
    inventory: {
      itemsCount: number,
      totalCapitalRestored: number,
      items: [
        {
          productId: string,
          description: string,
          unit: string,
          currentStock: number,
          quantityToRestore: number,
          resultingStock: number,
          unitCost: number,
          capitalRestored: number,
          variants: [...]
        }
      ]
    },
    client: {
      clientId: string,
      clientName: string,
      cancelledReceivable: number,
      purchaseAmountReversed: number
    } | null
  }
}
```

### Composable Frontend: `useSaleDeletion()` (`apps/web/src/composables/useSaleDeletion.js`)

- `previewSaleDeletion({ businessId, saleUuid, reason })` → llama `deleteSale` con `dryRun: true`.
- `executeSaleDeletion({ businessId, saleUuid, reason })` → llama `deleteSale` con `dryRun: false`.
- `mapBlockReason(blockReason)` → devuelve `{ title, message, canOpenCashRegister }`.

---

## 🧪 Pruebas Unitarias

Las funciones puras del planificador (`determineDeletionMode`, `collectStockRefs`, `resolveRestoreQuantity`, `aggregateProductDeltas`, `applyDeltasToProduct`, `summarizeMoney`) cuentan con suite de pruebas automatizadas:

```bash
npm --prefix apps/functions test
```

---

## 📝 Changelog

### [Octubre 2026 - Implementación inicial de `deleteSale` y Notas de Devolución]
- Creada Cloud Function transaccional `deleteSale` (`apps/functions/src/Transaction/deleteSale.js`) y planificador puro (`planner.js` + `planner.test.js`).
- Corregida lectura de `stockLog` desde la subcolección `businesses/{businessId}/products/{productId}/stockLog/{logId}` y soporte completo de variantes (`variantCombos`), materiales de composición y empaques.
- Añadido `quantityDeducted` en `useInventory.js -> createStockLog` para evitar inflación de stock en ventas con stock insuficiente.
- Añadido soporte para `type: 'refund'` en `sharedComputed.js`, `accountsBalanceStore.js`, `ResumenDay.vue`, `CardStandard.vue` y `RefundDetails.vue`.
- Excluidas ventas `status: 'refunded'` de `updateClientMetadata`, `useClients.js`, `paymentCalculator.js` y `useAccountsReceivable.js`.
