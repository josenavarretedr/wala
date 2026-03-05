>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# 🔧 Implementación de Unificación UUID/ID

**Fecha:** 28 de octubre de 2025  
**Estado:** ✅ COMPLETADO

## 📋 Problema Identificado

Se detectó una inconsistencia en el uso de identificadores entre las transacciones y el `dailySummary`:

### Antes:

- **Transacciones**: Usaban `uuid` como identificador principal
- **dailySummary.openingData**: Guardaba `id` (no coincidía con `uuid`)
- **Resultado**: Los IDs no coincidían entre documentos relacionados

### Ejemplo del problema:

```javascript
// Transaction document
{
  uuid: "abc-123-def-456",
  id: "diferente-id-789", // ❌ No coincidía con uuid
  type: "opening"
}

// dailySummary document
{
  openingData: {
    id: "diferente-id-789" // ❌ No referencia correcta al uuid de la transacción
  }
}
```

## ✅ Solución Implementada

**Principio Unificado:**

- ✅ `uuid` es el identificador único primario
- ✅ `id` siempre debe ser igual a `uuid` (para compatibilidad)
- ✅ En Firestore, el documento se crea con `uuid` como document ID

## 📁 Archivos Modificados

### Frontend (src/composables/)

#### 1. **useDailySummary.js**

```javascript
// ✅ Estructura actualizada en comentarios
* - openingData: { uuid, id, realCashBalance, realBankBalance, totalBalance }
* - closureId: uuid del cierre (si existe)

// ✅ Nuevas funciones agregadas
const getOpeningUuid = (summary) => {
  return getNestedValue(summary, 'openingData.uuid', null);
};

const getClosureUuid = (summary) => {
  return getNestedValue(summary, 'closureId', null);
};
```

#### 2. **useTransaction.js**

```javascript
const createTransaction = async (transaction) => {
  // ✅ Validar que uuid existe
  if (!transaction.uuid) {
    throw new Error("Transaction must have a uuid");
  }

  // ✅ Establecer id = uuid para consistencia
  transaction.id = transaction.uuid;

  const transactionRef = doc(
    db,
    "businesses",
    businessId,
    "transactions",
    transaction.uuid
  );

  await setDoc(transactionRef, {
    ...transaction,
    id: transaction.uuid, // Garantizar consistencia
    createdAt: serverTimestamp(),
  });
};
```

#### 3. **useCashEvent.js**

```javascript
const createCashEvent = async (cashEventData) => {
  // ✅ Validar uuid
  if (!cashEventData.uuid) {
    throw new Error("Cash event must have a uuid");
  }

  // ✅ Establecer id = uuid
  cashEventData.id = cashEventData.uuid;

  const ref = doc(
    db,
    `businesses/${businessId}/cashEvents`,
    cashEventData.uuid
  );
  await setDoc(ref, {
    ...cashEventData,
    id: cashEventData.uuid,
    createdAt: serverTimestamp(),
  });
};
```

#### 4. **useCashClosure.js**

```javascript
const createCashClosure = async (cashClosureData) => {
  // ✅ Validar uuid
  if (!cashClosureData.uuid) {
    throw new Error("Cash closure must have a uuid");
  }

  // ✅ Establecer id = uuid
  cashClosureData.id = cashClosureData.uuid;

  const cashClosureRef = doc(
    db,
    `businesses/${businessId}/cashClosures`,
    cashClosureData.uuid
  );
  await setDoc(cashClosureRef, {
    ...cashClosureData,
    id: cashClosureData.uuid,
    createdAt: serverTimestamp(),
  });
};
```

### Backend (functions/src/AccountsBalance/)

#### 5. **sharedComputed.js**

```javascript
// ✅ Normalizar transacciones al cargar
txSnap.forEach((doc) => {
  const data = doc.data();
  allTransactions.push({
    ...data,
    uuid: data.uuid || doc.id, // Priorizar uuid del documento
    id: data.uuid || doc.id, // Mantener id igual a uuid
  });
});

// ✅ Estructura de openingData actualizada
openingData: openingTransaction
  ? {
      uuid: openingTransaction.uuid, // ✅ UUID principal
      id: openingTransaction.uuid, // ✅ Mantener id por compatibilidad
      realCashBalance: saldoInicialCash,
      realBankBalance: saldoInicialBank,
      totalBalance: saldoInicial,
    }
  : null,
  // ✅ Logs actualizados para usar uuid
  console.log(`  ✓ Opening found: ${tx.uuid}`);
console.log(`  ✓ Closure found: ${tx.uuid}`);
console.log(`  💰 Income: ${amount} [${account}] (${tx.uuid})`);
```

**Documentación actualizada:**

```javascript
/**
 * openingData: {
 *   uuid: string,  // ✅ UUID de la transacción de apertura
 *   id: string,    // ✅ Igual a uuid (compatibilidad)
 *   realCashBalance: number,
 *   realBankBalance: number,
 *   totalBalance: number
 * } | null,
 *
 * closureId: string,  // ✅ UUID de la transacción de cierre
 */
```

#### 6. **autoOpening.js**

```javascript
const openingTransaction = {
  // === IDENTIFICACIÓN ===
  uuid: openingUuid, // ✅ UUID principal
  id: openingUuid, // ✅ id = uuid para consistencia total
  type: "opening",
  // ...

  // === REFERENCIAS ===
  openingReference: null,
  lastClosureReference: lastClosure.uuid || lastClosure.id, // ✅ Usar uuid del cierre
  previousClosureReference: lastClosure.uuid || lastClosure.id,

  // === METADATA ===
  metadata: {
    previousClosureId: lastClosure.uuid || lastClosure.id, // ✅ Usar uuid
    // ...
  },
};

// ✅ Logs de trazabilidad
await db.collection(`businesses/${businessId}/traceability_logs`).add({
  entityId: openingUuid, // ✅ Usar uuid
  openingTransactionId: openingUuid,
  previousClosureId: lastClosure.uuid || lastClosure.id,
  // ...
});
```

#### 7. **lazyCloseIfNeeded.js**

```javascript
const closureTransaction = {
  // === IDENTIFICACIÓN ===
  uuid: closureUuid, // ✅ UUID principal
  id: closureUuid, // ✅ id = uuid para consistencia
  type: "closure",
  openingReference: openingData.uuid || openingData.id, // ✅ Usar uuid de apertura
  // ...
};

// ✅ Actualizar dailySummary con UUID
await upsertDailySummary(db, businessId, day, {
  ...updatedAgg,
  hasClosure: true,
  isAutoClosed: true,
  closureId: closureUuid, // ✅ Guardar UUID
  // ...
});

// ✅ Logs de trazabilidad
await db.collection(`businesses/${businessId}/traceability_logs`).add({
  entityId: closureUuid, // ✅ Usar uuid
  closureTransactionId: closureUuid,
  // ...
});
```

#### 8. **scheduledAutoClose.js**

```javascript
const closureTransaction = {
  uuid: closureUuid,
  id: closureUuid, // ✅ id = uuid para consistencia
  type: "closure",
  openingReference: openingData.uuid || openingData.id, // ✅ Usar uuid de apertura
  // ...
};
```

## 🔍 Validación

Para verificar que la implementación es correcta:

### 1. **Verificar coincidencia de UUIDs**

```javascript
// En dailySummary
const summary = await getTodayDailySummary();
const openingUuid = summary.openingData.uuid;

// En transactions
const transaction = await getTransactionByID(openingUuid);
console.assert(transaction.uuid === openingUuid, "UUIDs deben coincidir");
console.assert(transaction.id === openingUuid, "ID debe ser igual a UUID");
```

### 2. **Verificar estructura de dailySummary**

```javascript
{
  openingData: {
    uuid: "abc-123-def-456",  // ✅ UUID de la transacción
    id: "abc-123-def-456",    // ✅ Igual a uuid
    realCashBalance: 1000,
    realBankBalance: 2000,
    totalBalance: 3000
  },
  closureId: "xyz-789-ghi-012"  // ✅ UUID de la transacción de cierre
}
```

### 3. **Verificar referencias cruzadas**

```javascript
// La referencia del cierre debe apuntar al uuid de la apertura
const closure = await getTransactionByID(summary.closureId);
console.assert(
  closure.openingReference === summary.openingData.uuid,
  "Closure debe referenciar opening por UUID"
);
```

## 📊 Impacto

### ✅ Beneficios:

1. **Consistencia Total**: Todos los documentos usan el mismo identificador
2. **Trazabilidad Mejorada**: Referencias cruzadas siempre correctas
3. **Compatibilidad**: Mantiene `id` para código legacy
4. **Logs Precisos**: Todos los logs usan `uuid` consistentemente

### ⚠️ Consideraciones:

- Los documentos antiguos pueden tener `id` diferente de `uuid`
- Las nuevas transacciones siempre tendrán `id === uuid`
- El código maneja ambos casos con `||` (ej: `lastClosure.uuid || lastClosure.id`)

## 🎯 Siguiente Pasos

1. ✅ **Implementación completada** en todos los archivos críticos
2. 🔄 **Migración de datos antiguos** (opcional):
   - Script para actualizar documentos existentes donde `id !== uuid`
   - Actualizar `dailySummary` históricos con el campo `uuid` en `openingData`
3. 📝 **Documentación de API**: Actualizar docs para reflejar la nueva estructura
4. 🧪 **Tests de integración**: Verificar flujo completo opening → transactions → closure → dailySummary

## 🔗 Referencias

- **Documentación relacionada:**

  - `SISTEMA_APERTURA_CIERRE_MODULAR.md` - Sistema de apertura/cierre
  - `MIGRACION_DAILYSUMMARY_COMPLETADA.md` - Migración a dailySummary
  - `SISTEMA_TRAZABILIDAD_IMPLEMENTADO.md` - Sistema de logs

- **Archivos actualizados:**
  - Frontend: `useDailySummary.js`, `useTransaction.js`, `useCashEvent.js`, `useCashClosure.js`
  - Backend: `sharedComputed.js`, `autoOpening.js`, `lazyCloseIfNeeded.js`, `scheduledAutoClose.js`

---

**✨ La unificación UUID/ID está completa y lista para deployment.**
