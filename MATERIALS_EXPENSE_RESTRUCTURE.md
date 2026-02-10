# Reestructura de Materials Expenses

## Cambios Implementados

### 1. Nueva Estructura de Documentos

#### ANTES (Documento único consolidado):

```
businesses/{businessId}/expenses/
  └─ materials-expense-2026
      ├─ logs: [
      │   { amount: 500, materialItems: [...] },
      │   { amount: 300, materialItems: [...] }
      │ ]
      └─ metadata: { totalSpent: 800, ... }
```

#### AHORA (Documento separado por compra):

```
businesses/{businessId}/expenses/
  ├─ expense-uuid-abc123 (Compra 1)
  │   ├─ description: "Compra insumos Metro"
  │   ├─ category: "materials"
  │   ├─ bucket: "DIRECT_MATERIAL"
  │   ├─ amount: 500
  │   ├─ date: Timestamp
  │   ├─ account: "cash"
  │   ├─ transactionRef: "transactions/xyz"
  │   ├─ materialItems: [
  │   │   { productId, description, quantity, cost, stockLogId }
  │   │ ]
  │   ├─ productIds: ["prod-123", "prod-456"] // ✨ Para búsquedas indexadas
  │   └─ metadata: { totalItems: 15, uniqueProducts: 2 }
  │
  └─ expense-uuid-def456 (Compra 2)
      └─ ...
```

---

### 2. Nueva Colección: Purchase Logs

Cada producto ahora tiene su historial de compras:

```
businesses/{businessId}/products/
  └─ prod-harina-123/
      ├─ (datos del producto)
      └─ purchaseLogs/
          ├─ log-uuid-1
          │   ├─ date: Timestamp
          │   ├─ quantity: 10
          │   ├─ cost: 5.50
          │   ├─ unit: "kg"
          │   ├─ total: 55.00
          │   ├─ expenseRef: "businesses/.../expenses/exp-abc"
          │   ├─ account: "cash"
          │   └─ transactionRef: "businesses/.../transactions/txn-xyz"
          │
          └─ log-uuid-2
              └─ ...
```

**Ventajas:**

- 📊 Historial de precios por producto
- 🔍 Análisis de costos en el tiempo
- 📈 Detección de variaciones de precio
- 🛒 Rastreo de proveedores (futuro)

---

### 3. Indexación para Búsquedas Rápidas

Campo `productIds[]` permite queries eficientes:

```javascript
// Todas las compras que incluyen "Harina"
db.collection("expenses")
  .where("category", "==", "materials")
  .where("productIds", "array-contains", "prod-harina-123");

// Compras en rango de fechas
db.collection("expenses")
  .where("category", "==", "materials")
  .where("date", ">=", startDate)
  .where("date", "<=", endDate)
  .orderBy("date", "desc");

// Total gastado en el mes (calcular en cliente)
const snapshot = await query.get();
const total = snapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
```

---

## Archivos Modificados

### 1. `src/composables/useExpenses.js`

**Función `createExpenseWithLog` - Nueva lógica para materials:**

```javascript
if (expenseData.category === "materials") {
  // Estructura sin logs[], datos directamente en el documento
  const expenseDoc = {
    uuid: expenseId,
    description: expenseData.description,
    category: "materials",
    bucket: expenseData.bucket, // DIRECT_MATERIAL o COGS_RESALE
    amount: logData.amount,
    date: logData.date,
    account: logData.account,
    transactionRef: logData.transactionRef,
    materialItems: cleanedMaterialItems,
    productIds: productIds, // 🔑 Para búsquedas
    metadata: {
      totalItems,
      uniqueProducts,
    },
    createdAt: now,
    updatedAt: now,
  };

  // Crear purchaseLogs para cada producto
  await createPurchaseLogs(
    businessId,
    cleanedMaterialItems,
    expenseId,
    logData,
  );
}
```

**Nueva función `createPurchaseLogs`:**

- Crea un documento por cada producto comprado en `products/{productId}/purchaseLogs/{logId}`
- Vincula al expense mediante `expenseRef`
- Permite historial de compras por producto

### 2. `src/stores/transaction/transactionStore.js`

**Antes (líneas 230-278):**

```javascript
// ❌ Lógica ELIMINADA
const MATERIALS_EXPENSE_ID = `materials-expense-${currentYear}`;
const existingExpense = await getExpenseById(MATERIALS_EXPENSE_ID);

if (existingExpense) {
  await addLogToExpense(MATERIALS_EXPENSE_ID, logData);
} else {
  await createExpenseWithLog(expenseData, logData);
}
```

**Ahora:**

```javascript
// ✅ Crear expense individual por cada compra
const expenseData = {
  uuid: uuidv4(), // UUID único
  description: transactionToAdd.value.description || "Compra de materiales",
  category: "materials",
  bucket: transactionToAdd.value.bucket, // Ya clasificado en StepAddExpenseDetails
};

expenseId = await createExpenseWithLog(expenseData, logData);
```

---

## Migración de Datos Existentes

**Decisión:** Opción C - Empezar de cero

- ❌ NO migrar datos de `materials-expense-2026`
- ✅ Nuevas compras usan estructura nueva
- ⚠️ Documento legacy puede eliminarse manualmente o quedar para referencia

---

## Validación de Implementación

### Checklist de Testing:

- [ ] Crear compra de materials (categoría "materials")
- [ ] Verificar que se cree expense en `expenses/{uuid}` (no en `materials-expense-2026`)
- [ ] Verificar campo `productIds[]` contiene IDs de productos
- [ ] Verificar campo `bucket` es `DIRECT_MATERIAL` (FOOD_PRODUCTION) o `COGS_RESALE` (RETAIL)
- [ ] Verificar purchaseLogs creados en `products/{productId}/purchaseLogs/`
- [ ] Verificar `expenseRef` en purchaseLogs apunta al expense correcto
- [ ] Verificar `stockLogs` apunta al nuevo expense (no a materials-expense-2026)
- [ ] Buscar expense por productId usando `productIds` array-contains

### Query de Prueba:

```javascript
// En Firebase Console o código
const expensesRef = collection(db, "businesses/{businessId}/expenses");

// 1. Ver todas las compras de materials
const q1 = query(expensesRef, where("category", "==", "materials"));
const snapshot1 = await getDocs(q1);
console.log(
  "Compras de materials:",
  snapshot1.docs.map((d) => d.id),
);

// 2. Ver compras que incluyen un producto específico
const q2 = query(
  expensesRef,
  where("category", "==", "materials"),
  where("productIds", "array-contains", "prod-harina-123"),
);
const snapshot2 = await getDocs(q2);
console.log(
  "Compras con Harina:",
  snapshot2.docs.map((d) => d.data()),
);

// 3. Ver purchase logs de un producto
const logsRef = collection(
  db,
  "businesses/{businessId}/products/prod-harina-123/purchaseLogs",
);
const snapshot3 = await getDocs(logsRef);
console.log(
  "Historial de compras:",
  snapshot3.docs.map((d) => d.data()),
);
```

---

## Notas Técnicas

### Campos Importantes:

| Campo                     | Tipo      | Descripción                                            |
| ------------------------- | --------- | ------------------------------------------------------ |
| `uuid`                    | string    | ID único del expense                                   |
| `description`             | string    | Descripción del gasto (ej: "Compra insumos Metro")     |
| `category`                | string    | Siempre "materials"                                    |
| `bucket`                  | string    | `DIRECT_MATERIAL` o `COGS_RESALE` (según businessType) |
| `amount`                  | number    | Total de la compra (suma de materialItems)             |
| `date`                    | Timestamp | Fecha de la compra                                     |
| `account`                 | string    | "cash" o "bank"                                        |
| `transactionRef`          | string    | Referencia a la transacción                            |
| `materialItems`           | array     | Items comprados con detalles                           |
| `productIds`              | array     | IDs de productos (para indexación) ⭐                  |
| `metadata.totalItems`     | number    | Total de items comprados                               |
| `metadata.uniqueProducts` | number    | Productos únicos en la compra                          |

### Diferencias con Labor/Overhead:

| Aspecto       | Materials                           | Labor/Overhead                               |
| ------------- | ----------------------------------- | -------------------------------------------- |
| Estructura    | Sin `logs[]`, datos en root         | Con `logs[]` array                           |
| Reutilización | Cada compra = nuevo doc             | Gastos repetidos = agregar log               |
| Búsqueda      | Por `productIds[]`                  | Por `description`                            |
| Metadata      | `totalItems`, `uniqueProducts`      | `totalSpent`, `occurrences`, `averageAmount` |
| PurchaseLogs  | Sí (en `products/.../purchaseLogs`) | No                                           |

---

## Próximos Pasos

1. ✅ **Testing completo** - Crear compra y verificar estructura
2. 🔄 **Actualizar UI** - Mostrar compras separadas en lugar de logs consolidados
3. 🔄 **Implementar búsquedas** - Queries por productId, fecha, bucket
4. 🔄 **Análisis de costos** - Dashboard con purchase logs históricos
5. ⏳ **Borrado de transacciones** - Eliminar purchaseLogs cuando se borra expense
6. ⏳ **Migración opcional** - Script para convertir materials-expense-2026 a docs separados

---

## Beneficios de la Nueva Estructura

### Para el Usuario:

- ✅ **Compras independientes**: Cada compra tiene su propia identidad
- ✅ **Búsquedas rápidas**: Encontrar compras por producto
- ✅ **Historial detallado**: Ver evolución de precios por producto
- ✅ **Mejor organización**: Compras separadas en lugar de logs consolidados

### Para el Sistema:

- ✅ **Queries eficientes**: Indexación por `productIds[]`
- ✅ **Escalabilidad**: No hay límite de logs en un solo documento
- ✅ **Trazabilidad**: PurchaseLogs vinculan productos → expenses → transactions
- ✅ **Consistencia**: Misma estructura para labor/overhead/materials

---

**Fecha de Implementación**: 10 de febrero de 2026  
**Estado**: ✅ Implementado, pendiente de testing
