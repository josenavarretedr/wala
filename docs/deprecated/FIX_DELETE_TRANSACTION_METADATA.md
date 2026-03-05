>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# 🔧 Corrección: Actualización de Metadata y DailySummary al Eliminar Transacciones

## 📋 Problemas Identificados

**Fecha:** 2 de diciembre de 2025

### Problema 1: Metadata del Cliente No Se Actualizaba Correctamente

**Descripción:**
Al eliminar una transacción tipo `income` o `payment`, la metadata del cliente (`totalPurchases`, `transactionCount`) no se actualizaba correctamente porque:

1. `updateClientMetadata()` se llamaba **ANTES** de eliminar la transacción en Firestore
2. La función consulta Firestore para recalcular: `where('clientId', '==', clientId)`
3. Como la transacción aún existía, se incluía en el cálculo
4. El usuario tenía que esperar a que se recargue la metadata para ver los valores correctos

**Impacto:**

- ❌ `totalPurchases` incluía la transacción eliminada
- ❌ `transactionCount` contaba la transacción eliminada
- ❌ UI mostraba datos incorrectos hasta recargar

### Problema 2: DailySummary No Se Recalculaba al Eliminar

**Descripción:**
La Firebase Function `onTransactionWrite.js` ignoraba las eliminaciones:

```javascript
// ❌ ANTES
if (!after) {
  console.log("⏭️ Transaction deleted, skipping streak update");
  return null; // Se saltaba el recálculo
}
```

**Impacto:**

- ❌ Los totales del día no se actualizaban
- ❌ El balance diario era incorrecto
- ❌ El dashboard mostraba datos obsoletos

---

## ✅ Soluciones Implementadas

### Solución 1: Cambiar Orden de Operaciones en `deleteIncomeTransaction()`

**Archivo:** `src/stores/transaction/transactionStore.js`

**ANTES:**

```javascript
// 3. ACTUALIZAR METADATA DEL CLIENTE
if (
  transactionToDelete.clientId &&
  transactionToDelete.clientId !== ANONYMOUS_CLIENT_ID
) {
  await clientStore.updateClientMetadata(transactionToDelete.clientId);
}

// 4. ELIMINAR LA TRANSACCIÓN
await deleteTransactionByID(transactionToDelete.uuid);
```

**DESPUÉS:**

```javascript
// 3. ELIMINAR LA TRANSACCIÓN (ANTES de actualizar metadata)
await deleteTransactionByID(transactionToDelete.uuid);
console.log(`  🗑️ Transacción eliminada de Firestore`);

// 4. ACTUALIZAR METADATA DEL CLIENTE (DESPUÉS de eliminar para que el recálculo sea correcto)
if (
  transactionToDelete.clientId &&
  transactionToDelete.clientId !== ANONYMOUS_CLIENT_ID
) {
  console.log(
    `  👤 Actualizando metadata del cliente ${transactionToDelete.clientId}`
  );
  await clientStore.updateClientMetadata(transactionToDelete.clientId);
}
```

**Beneficios:**

- ✅ La transacción se elimina primero de Firestore
- ✅ `updateClientMetadata()` consulta sin incluir la transacción eliminada
- ✅ Los valores son correctos inmediatamente
- ✅ No se requiere recarga manual

---

### Solución 2: Cambiar Orden en `deletePaymentTransaction()`

**Archivo:** `src/stores/transaction/transactionStore.js`

**ANTES:**

```javascript
// 5. ACTUALIZAR METADATA DEL CLIENTE
await clientStore.updateClientMetadata(originalTransaction.clientId);

// 6. ELIMINAR TRANSACCIÓN PAYMENT
await deleteTransactionByID(transactionToDelete.uuid);
```

**DESPUÉS:**

```javascript
// 5. ELIMINAR TRANSACCIÓN PAYMENT (ANTES de actualizar metadata)
await deleteTransactionByID(transactionToDelete.uuid);
console.log(`  🗑️ Payment eliminado de Firestore`);

// 6. ACTUALIZAR METADATA DEL CLIENTE (DESPUÉS de eliminar)
if (
  originalTransaction.clientId &&
  originalTransaction.clientId !== ANONYMOUS_CLIENT_ID
) {
  console.log(
    `  👤 Actualizando metadata del cliente ${originalTransaction.clientId}`
  );
  await clientStore.updateClientMetadata(originalTransaction.clientId);
}
```

---

### Solución 3: Procesar Eliminaciones en `onTransactionWrite.js`

**Archivo:** `functions/src/AccountsBalance/onTransactionWrite.js`

**ANTES:**

```javascript
// ✅ IGNORAR: Eliminaciones
if (!after) {
  console.log("⏭️ Transaction deleted, skipping streak update");
  return null;
}
```

**DESPUÉS:**

```javascript
// ✅ PROCESAR: Eliminaciones (necesario para recalcular dailySummary)
if (!after && before) {
  console.log("🗑️ Transaction deleted, recalculating dailySummary...");

  if (!before.createdAt) {
    console.warn(
      `⚠️  Deleted transaction ${txId} missing createdAt, skipping aggregation`
    );
    return null;
  }

  // Obtener timezone del negocio
  const businessDoc = await db.doc(`businesses/${businessId}`).get();
  const tz = (businessDoc.exists && businessDoc.data().timezone) || DEFAULT_TZ;

  if (!businessDoc.exists) {
    console.log(
      `⚠️  Business ${businessId} no longer exists, skipping aggregation`
    );
    return null;
  }

  const day = dayFromTimestamp(before.createdAt, tz);
  console.log(`📅 Recalculating day: ${day} (tz: ${tz}) after deletion`);

  // Recalcular agregados del día
  const agg = await getDayAggregates(db, businessId, day, tz);
  console.log(`📊 Day aggregates recalculated after deletion`);

  // Actualizar dailySummary
  await upsertDailySummary(db, businessId, day, {
    ...agg,
    lastUpdated: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Daily summary updated for ${day} after deletion`);

  // No actualizar racha en eliminaciones
  return null;
}

// Si no hay after ni before, es un evento inválido
if (!after) {
  console.warn(
    "⚠️ Transaction write event without after or before data, skipping"
  );
  return null;
}
```

**Beneficios:**

- ✅ La Cloud Function ahora procesa eliminaciones
- ✅ Se recalculan todos los agregados del día (`getDayAggregates`)
- ✅ Se actualiza `dailySummary` con los valores correctos
- ✅ El dashboard muestra totales actualizados inmediatamente
- ✅ No se actualiza la racha en eliminaciones (decisión de diseño)

---

## 🔄 Flujo Corregido: Eliminar Venta (Income)

### Antes (Incorrecto)

```
1. Revertir stock ✅
2. Eliminar payments asociados ✅
3. ❌ Actualizar metadata cliente (transacción aún existe en Firestore)
4. Eliminar transacción
   └─> Trigger onTransactionWrite: ❌ Ignora eliminación
```

### Después (Correcto)

```
1. Revertir stock ✅
2. Eliminar payments asociados ✅
3. ✅ Eliminar transacción de Firestore
   └─> Trigger onTransactionWrite:
       ├─> Detecta eliminación (before existe, after no)
       ├─> Recalcula getDayAggregates(day)
       └─> Actualiza dailySummary con nuevos totales ✅
4. ✅ Actualizar metadata cliente (consulta sin la transacción)
   └─> Recalcula totalPurchases, transactionCount correctamente
```

---

## 🔄 Flujo Corregido: Eliminar Pago (Payment)

### Antes (Incorrecto)

```
1. Obtener venta original ✅
2. Recalcular balance ✅
3. Actualizar venta original ✅
4. ❌ Actualizar metadata cliente (payment aún existe)
5. Eliminar payment
   └─> Trigger onTransactionWrite: ❌ Ignora eliminación
```

### Después (Correcto)

```
1. Obtener venta original ✅
2. Recalcular balance ✅
3. Actualizar venta original ✅
4. ✅ Eliminar payment de Firestore
   └─> Trigger onTransactionWrite:
       ├─> Detecta eliminación
       ├─> Recalcula getDayAggregates(day)
       └─> Actualiza dailySummary ✅
5. ✅ Actualizar metadata cliente (consulta sin el payment)
   └─> Recalcula pendingBalance, totalPurchases correctamente
```

---

## 📊 Impacto en DailySummary

### Qué se recalcula al eliminar una transacción:

```javascript
const agg = await getDayAggregates(db, businessId, day, tz);

// Estructura recalculada:
{
  // Totales por tipo
  totalIncome: number,        // ✅ Suma de todas las ventas restantes
  totalExpense: number,       // ✅ Suma de todos los gastos restantes
  totalTransfer: number,      // ✅ Suma de transferencias restantes

  // Totales por cuenta
  cashIncome: number,
  cashExpense: number,
  bankIncome: number,
  bankExpense: number,
  yapeIncome: number,
  yapeExpense: number,
  plinIncome: number,
  plinExpense: number,

  // Balance
  netCashFlow: number,        // ✅ Recalculado sin la transacción

  // Flags
  hasOpening: boolean,
  hasClosure: boolean,
  hasTxn: boolean,            // ✅ Puede cambiar a false si era la única

  // Timestamps
  lastUpdated: Timestamp.now() // ✅ Actualizado
}
```

---

## 🧪 Casos de Prueba

### Test 1: Eliminar Venta con Cliente

```javascript
// SETUP
Cliente: Juan Pérez (clientId: 'client-1')
Venta 1: S/ 100 (uuid: 'sale-1')
Venta 2: S/ 50 (uuid: 'sale-2')

// ESTADO INICIAL
totalPurchases: 150
transactionCount: 2

// ACCIÓN
Eliminar Venta 1 (S/ 100)

// RESULTADO ESPERADO
✅ totalPurchases: 50 (150 - 100)
✅ transactionCount: 1 (2 - 1)
✅ dailySummary.totalIncome reducido en 100
✅ Sin necesidad de recargar
```

### Test 2: Eliminar Último Payment

```javascript
// SETUP
Venta: S/ 100
Payment 1: S/ 50
Payment 2: S/ 30

// ESTADO INICIAL
totalPaid: 80
balance: 20
paymentStatus: 'partial'

// ACCIÓN
Eliminar Payment 2 (S/ 30)

// RESULTADO ESPERADO
✅ totalPaid: 50 (80 - 30)
✅ balance: 50 (100 - 50)
✅ paymentStatus: 'partial'
✅ Cliente: pendingBalance actualizado correctamente
✅ dailySummary recalculado
```

### Test 3: Eliminar Única Transacción del Día

```javascript
// SETUP
Día: 2025-12-02
Transacciones:
  - Opening: S/ 100
  - Income: S/ 50 (única transacción no-opening/closure)
  - Closure: S/ 150

// ESTADO INICIAL
dailySummary: {
  hasTxn: true,
  totalIncome: 50
}

// ACCIÓN
Eliminar Income (S/ 50)

// RESULTADO ESPERADO
✅ dailySummary.hasTxn: false
✅ dailySummary.totalIncome: 0
✅ Streak no afectada (eliminaciones no modifican racha)
```

---

## 📝 Logs de Consola Mejorados

### Eliminar Income (Venta)

```
🗑️ [DELETE INCOME] Iniciando eliminación de venta: sale-123
  📦 Revirtiendo stock para producto prod-1, stockLog log-1
  ✅ Stock revertido: 10 + 5 = 15
  🔗 Eliminando 0 pagos asociados
  🗑️ Transacción eliminada de Firestore
  👤 Actualizando metadata del cliente client-1
✅ [DELETE INCOME] Venta eliminada exitosamente
```

### Eliminar Payment

```
🗑️ [DELETE PAYMENT] Iniciando eliminación de pago: payment-456
  📝 Venta original encontrada: sale-123
  🔄 Payments actualizados: 2 → 1
  💰 Estado recalculado: { paymentStatus: 'partial', totalPaid: 50, balance: 50 }
  🗑️ Payment eliminado de Firestore
  👤 Actualizando metadata del cliente client-1
✅ [DELETE PAYMENT] Pago eliminado exitosamente
```

### Cloud Function (onTransactionWrite)

```
📝 Transaction write detected: sale-123 in business biz-1
🗑️ Transaction deleted, recalculating dailySummary...
📅 Recalculating day: 2025-12-02 (tz: America/Lima) after deletion
📊 Day aggregates recalculated after deletion
✅ Daily summary updated for 2025-12-02 after deletion
```

---

## 🎯 Beneficios de la Corrección

### Integridad de Datos

- ✅ **Consistencia inmediata:** Metadata correcta sin esperar recarga
- ✅ **DailySummary actualizado:** Totales reflejan eliminaciones
- ✅ **Sin datos fantasma:** No quedan referencias a transacciones eliminadas

### Experiencia de Usuario

- ✅ **Feedback instantáneo:** UI muestra valores correctos inmediatamente
- ✅ **Dashboard preciso:** Totales del día actualizados automáticamente
- ✅ **Confiabilidad:** No hay discrepancias entre frontend y backend

### Mantenibilidad

- ✅ **Logs claros:** Cada paso documentado en consola
- ✅ **Trazabilidad:** Se puede seguir el flujo completo
- ✅ **Debug fácil:** Identificar problemas rápidamente

---

## ⚠️ Consideraciones Importantes

### 1. Orden de Operaciones es Crítico

```javascript
// ❌ MAL - Actualizar antes de eliminar
await updateClientMetadata(clientId); // Consulta incluye transacción
await deleteTransaction(txId); // Transacción aún existe en consulta

// ✅ BIEN - Eliminar antes de actualizar
await deleteTransaction(txId); // Transacción eliminada
await updateClientMetadata(clientId); // Consulta sin transacción
```

### 2. Cloud Functions Asíncronas

- La actualización de `dailySummary` es asíncrona (Cloud Function)
- Puede tomar 1-3 segundos en ejecutarse
- El frontend debe refrescar datos después de eliminar

### 3. Transacciones Anidadas

- Al eliminar income, también se eliminan payments asociados
- Cada eliminación dispara su propio `onTransactionWrite`
- Los recálculos se hacen múltiples veces pero llegan al mismo resultado

---

## 🚀 Mejoras Futuras Sugeridas

### 1. Batch Updates

```javascript
// Eliminar múltiples transacciones en una sola operación
const batch = writeBatch(db);
relatedPayments.forEach((payment) => {
  batch.delete(doc(db, "transactions", payment.uuid));
});
await batch.commit();
```

### 2. Actualización Optimista en Frontend

```javascript
// Actualizar UI inmediatamente sin esperar Cloud Function
clientStore.clients[index].totalPurchases -= transactionAmount;
clientStore.clients[index].transactionCount -= 1;
```

### 3. Cache de DailySummary

```javascript
// Cachear dailySummary en el frontend para evitar recargas
const cachedSummary = await getCachedDailySummary(day);
if (!cachedSummary.stale) {
  return cachedSummary.data;
}
```

---

## 📚 Archivos Modificados

1. ✅ `src/stores/transaction/transactionStore.js`

   - `deleteIncomeTransaction()` - Orden corregido
   - `deletePaymentTransaction()` - Orden corregido

2. ✅ `functions/src/AccountsBalance/onTransactionWrite.js`
   - Procesa eliminaciones para recalcular dailySummary
   - Logs mejorados

---

**Implementado por:** GitHub Copilot  
**Fecha:** 2 de diciembre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Producción
