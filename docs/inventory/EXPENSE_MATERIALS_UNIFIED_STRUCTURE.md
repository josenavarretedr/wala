# 📦 Estructura Unificada de Expenses para Materials

## 🎯 Objetivo

Implementar una estructura híbrida escalable donde **todas las compras de materiales del año se consolidan en un único expense** con múltiples logs, manteniendo la consistencia con otros tipos de gastos (labor, overhead).

---

## 🔄 Cambios Implementados

### 1. **`transactionStore.js` - Gestión Unificada de Materials**

#### ❌ Antes (Problemático)

```javascript
// Cada compra creaba un nuevo expense separado
if (transactionToAdd.value.category === "materials") {
  transactionToAdd.value.description = "COMPRA DE MATERIALES/INSUMOS";

  const expenseData = {
    description: transactionToAdd.value.description,
    category: "materials",
  };

  // Crea NUEVO expense cada vez ❌
  expenseId = await createExpenseWithLog(expenseData, logData);
}
```

**Problema**: 30 compras/mes = 30 expenses separados = difícil análisis

---

#### ✅ Ahora (Solución)

```javascript
if (transactionToAdd.value.category === "materials") {
  // Calcular total desde materialItems
  const materialTotal = (transactionToAdd.value.materialItems || []).reduce(
    (sum, material) => {
      return sum + (material.cost || 0) * (material.quantity || 0);
    },
    0
  );
  transactionToAdd.value.amount = materialTotal;

  // ✅ USAR EXPENSE ÚNICO CON ID FIJO PARA EL AÑO
  const currentYear = new Date().getFullYear();
  const MATERIALS_EXPENSE_ID = `materials-expense-${currentYear}`;

  // Preparar log data con materialItems incluidos
  const logData = {
    amount: transactionToAdd.value.amount,
    date: new Date(),
    transactionRef: transactionToAdd.value.uuid,
    account: transactionToAdd.value.account,
    notes: transactionToAdd.value.notes || null,

    // Incluir materialItems con totalCost calculado
    materialItems: transactionToAdd.value.materialItems.map((item) => ({
      ...item,
      totalCost: (item.cost || 0) * (item.quantity || 0),
    })),
  };

  // Buscar si ya existe el expense de materials de este año
  const existingExpense = await getExpenseById(MATERIALS_EXPENSE_ID);

  if (existingExpense) {
    // ✅ Agregar log al expense existente
    await addLogToExpense(MATERIALS_EXPENSE_ID, logData);
    await updateExpenseMetadata(MATERIALS_EXPENSE_ID);

    transactionToAdd.value.expenseId = MATERIALS_EXPENSE_ID;
    transactionToAdd.value.oldOrNewExpense = "old";

    console.log(
      `✅ Log agregado a expense de materials del año ${currentYear}`
    );
  } else {
    // ✅ Crear nuevo expense de materials para el año
    const expenseData = {
      uuid: MATERIALS_EXPENSE_ID, // ID fijo predecible
      description: "COMPRAS DE MATERIALES/INSUMOS",
      category: "materials",
      subcategory: null,
    };

    await createExpenseWithLog(expenseData, logData);

    transactionToAdd.value.expenseId = MATERIALS_EXPENSE_ID;
    transactionToAdd.value.oldOrNewExpense = "new";

    console.log(
      `✅ Nuevo expense de materials creado para el año ${currentYear}`
    );
  }
}
```

**Beneficios**:

- ✅ 1 expense por año (ej: `materials-expense-2025`)
- ✅ Múltiples logs dentro del mismo expense
- ✅ Consistencia con labor/overhead
- ✅ Escalable hasta 365 compras/año

---

### 2. **`useExpenses.js` - Soporte para MaterialItems en Logs**

#### Cambio 1: `createExpenseWithLog()` - Aceptar UUID personalizado

```javascript
const createExpenseWithLog = async (expenseData, logData) => {
  // ✅ Si se proporciona un UUID específico (como para materials), usarlo
  const expenseId = expenseData.uuid || uuidv4();

  const firstLog = {
    amount: logData.amount,
    date: logData.date,
    transactionRef: logData.transactionRef,
    account: logData.account,
    notes: logData.notes || null,
    logId: uuidv4(),
    createdAt: nowDate,
  };

  // ✅ Si el log incluye materialItems, agregarlos
  if (logData.materialItems && logData.materialItems.length > 0) {
    firstLog.materialItems = logData.materialItems;
  }

  // ... crear expense con metadata inicial

  // ✅ Si es expense de materials, agregar metadata extendida inicial
  if (expenseData.category === "materials" && logData.materialItems) {
    const items = logData.materialItems;

    expenseDoc.metadata.totalItems = items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    expenseDoc.metadata.uniqueProducts = new Set(
      items.map((item) => item.productId).filter(Boolean)
    ).size;

    // Top products inicial
    expenseDoc.metadata.topProducts = items.map((item) => ({
      productId: item.productId,
      description: item.description,
      totalQuantity: item.quantity || 0,
      totalSpent: item.totalCost || 0,
      occurrences: 1,
    }));
  }
};
```

---

#### Cambio 2: `addLogToExpense()` - Agregar materialItems al log

```javascript
const addLogToExpense = async (expenseId, logData) => {
  const logWithId = {
    amount: logData.amount,
    date: logData.date,
    transactionRef: logData.transactionRef,
    account: logData.account,
    notes: logData.notes || null,
    logId: uuidv4(),
    createdAt: nowDate,
  };

  // ✅ Si el log incluye materialItems, agregarlos
  if (logData.materialItems && logData.materialItems.length > 0) {
    logWithId.materialItems = logData.materialItems;
  }

  await updateDoc(expenseRef, {
    logs: arrayUnion(logWithId),
    updatedAt: serverTimestamp(),
  });
};
```

---

#### Cambio 3: `updateExpenseMetadata()` - Calcular metadata extendida para materials

```javascript
const updateExpenseMetadata = async (expenseId) => {
  // ... calcular metadata básica ...

  // ✅ Si es expense de materials, calcular metadata extendida
  if (expenseData.category === "materials") {
    const allMaterialItems = logs.flatMap((log) => log.materialItems || []);

    // Total de items comprados
    metadata.totalItems = allMaterialItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    // Productos únicos
    const uniqueProductIds = new Set(
      allMaterialItems.map((item) => item.productId).filter(Boolean)
    );
    metadata.uniqueProducts = uniqueProductIds.size;

    // Top 5 productos más comprados (por gasto total)
    const productStats = {};
    allMaterialItems.forEach((item) => {
      if (!item.productId) return;

      if (!productStats[item.productId]) {
        productStats[item.productId] = {
          productId: item.productId,
          description: item.description,
          totalQuantity: 0,
          totalSpent: 0,
          occurrences: 0,
        };
      }

      productStats[item.productId].totalQuantity += item.quantity || 0;
      productStats[item.productId].totalSpent += item.totalCost || 0;
      productStats[item.productId].occurrences += 1;
    });

    metadata.topProducts = Object.values(productStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }
};
```

---

## 📊 Estructura de Datos Final

### Collection: `expenses/materials-expense-2025`

```javascript
{
  uuid: "materials-expense-2025",
  description: "COMPRAS DE MATERIALES/INSUMOS",
  category: "materials",
  subcategory: null,
  createdAt: Timestamp,
  updatedAt: Timestamp,

  // ============================================
  // LOGS: Una entrada por cada transacción de compra
  // ============================================
  logs: [
    {
      logId: "log-001",
      amount: 250.50,
      date: Date,
      transactionRef: "trans-abc123",
      account: "cash",
      notes: "Compra semanal de insumos",
      createdAt: Date,

      // Array de items comprados en esta transacción
      materialItems: [
        {
          uuid: "item-001",
          productId: "prod-tornillo-001",
          description: "Tornillo 1/2\"",
          quantity: 50,
          unit: "uni",
          cost: 2.50,
          totalCost: 125.00,
          stockLogId: "stock-log-001",
          oldOrNewProduct: "old"
        },
        {
          uuid: "item-002",
          productId: "prod-cable-001",
          description: "Cable eléctrico 2.5mm",
          quantity: 10,
          unit: "m",
          cost: 12.55,
          totalCost: 125.50,
          stockLogId: "stock-log-002",
          oldOrNewProduct: "old"
        }
      ]
    },

    {
      logId: "log-002",
      amount: 180.00,
      date: Date,
      transactionRef: "trans-def456",
      account: "bank",
      notes: null,
      createdAt: Date,

      materialItems: [
        {
          uuid: "item-003",
          productId: "prod-cable-001", // Mismo producto, nueva compra
          description: "Cable eléctrico 2.5mm",
          quantity: 15,
          unit: "m",
          cost: 12.00, // Precio diferente en esta compra
          totalCost: 180.00,
          stockLogId: "stock-log-003",
          oldOrNewProduct: "old"
        }
      ]
    }
    // ... más logs ...
  ],

  // ============================================
  // METADATA AGREGADA (calculada automáticamente)
  // ============================================
  metadata: {
    // Básica (para todos los expenses)
    totalSpent: 430.50,
    occurrences: 2,
    lastUsedAt: Date,
    averageAmount: 215.25,

    // Extendida (solo para materials)
    totalItems: 75, // Suma de todas las cantidades
    uniqueProducts: 2, // Productos únicos comprados

    // Top 5 productos más comprados (por gasto total)
    topProducts: [
      {
        productId: "prod-cable-001",
        description: "Cable eléctrico 2.5mm",
        totalQuantity: 25,
        totalSpent: 305.50,
        occurrences: 2
      },
      {
        productId: "prod-tornillo-001",
        description: "Tornillo 1/2\"",
        totalQuantity: 50,
        totalSpent: 125.00,
        occurrences: 1
      }
    ]
  }
}
```

---

## 📈 Ventajas de la Estructura

### ✅ **1. Escalabilidad**

- 1 expense por año con hasta 365 logs (1 compra/día) = **Manejable**
- Firestore soporta documentos de hasta 1MB
- Estimación: 365 logs × ~2KB/log = **730KB < 1MB** ✅

### ✅ **2. Consistencia**

```javascript
// LABOR/OVERHEAD: 1 expense → múltiples logs ✅
{
  description: "Sueldo administrador",
  logs: [/* 12 logs/año */]
}

// MATERIALS: 1 expense → múltiples logs ✅
{
  description: "COMPRAS DE MATERIALES/INSUMOS",
  logs: [/* 30-365 logs/año */]
}
```

### ✅ **3. Análisis Granular**

```javascript
// ¿Cuánto gasté en cables este año?
expense.metadata.topProducts.find((p) => p.description.includes("Cable"))
  ?.totalSpent;
// → 305.50

// ¿Cuántas compras de materiales hice?
expense.metadata.occurrences;
// → 2

// ¿Cuál es mi producto más comprado?
expense.metadata.topProducts[0];
// → { productId: "prod-cable-001", totalSpent: 305.50 }
```

### ✅ **4. Performance**

- **1 lectura** para obtener todas las compras del año
- Metadata pre-calculada → reportes rápidos
- No necesitas consultar 100 documentos separados

---

## 🔍 Casos de Uso

### Caso 1: Primera compra de materials del año

```javascript
// Usuario hace su primera compra de materials el 1 de enero de 2025

// Sistema verifica: ¿Existe materials-expense-2025?
const existingExpense = await getExpenseById("materials-expense-2025");
// → null

// Crear nuevo expense con primer log
const expenseData = {
  uuid: "materials-expense-2025", // ID fijo
  description: "COMPRAS DE MATERIALES/INSUMOS",
  category: "materials",
};

await createExpenseWithLog(expenseData, logData);
// ✅ Expense creado con 1 log
```

---

### Caso 2: Compra adicional de materials

```javascript
// Usuario hace su segunda compra el 15 de enero de 2025

// Sistema verifica: ¿Existe materials-expense-2025?
const existingExpense = await getExpenseById("materials-expense-2025");
// → { uuid: 'materials-expense-2025', logs: [log1] }

// Agregar nuevo log al expense existente
await addLogToExpense("materials-expense-2025", logData);
await updateExpenseMetadata("materials-expense-2025");
// ✅ Log agregado, metadata actualizada
```

---

### Caso 3: Análisis de compras del año

```javascript
// Obtener expense de materials del año actual
const materialsExpense = await getExpenseById(
  `materials-expense-${new Date().getFullYear()}`
);

// Análisis disponible:
console.log("Total gastado:", materialsExpense.metadata.totalSpent);
console.log("Cantidad de compras:", materialsExpense.metadata.occurrences);
console.log("Productos únicos:", materialsExpense.metadata.uniqueProducts);
console.log("Top producto:", materialsExpense.metadata.topProducts[0]);

// Detalle de cada compra
materialsExpense.logs.forEach((log) => {
  console.log("Compra:", log.date, "- Monto:", log.amount);
  console.log("Items:", log.materialItems.length);
});
```

---

## 🎯 Próximos Pasos

### Mejoras Opcionales (Futuro)

1. **Categorización de Productos**

   - Agregar `productCategory` y `productSubcategory` a cada item
   - Ejemplo: `{ productCategory: "Ferretería", productSubcategory: "Tornillos" }`
   - Permite análisis: "¿Cuánto gasté en ferretería este año?"

2. **Análisis por Proveedor**

   - Agregar campo `supplier` a cada log
   - Metadata extendida: `topSuppliers`

3. **Expense por Trimestre/Semestre**

   - Si el volumen de compras es muy alto (> 500/año)
   - ID: `materials-expense-2025-Q1`, `materials-expense-2025-Q2`, etc.

4. **Reportes Automáticos**
   - Cloud Function para generar reportes mensuales
   - Email con top productos, gastos, tendencias

---

## ✅ Resumen

| Aspecto           | Antes                | Ahora                     |
| ----------------- | -------------------- | ------------------------- |
| **Structure**     | 1 compra = 1 expense | 1 año = 1 expense         |
| **Logs**          | 1 log por expense    | N logs en 1 expense       |
| **Análisis**      | Difícil (100+ docs)  | Fácil (1 doc)             |
| **Metadata**      | Básica               | Extendida (topProducts)   |
| **Escalabilidad** | ❌ 100+ expenses     | ✅ 1 expense con 365 logs |
| **Performance**   | ❌ 100+ reads        | ✅ 1 read                 |
| **Consistencia**  | ❌ Diferente a labor | ✅ Igual que labor        |

---

## 📝 Fecha de Implementación

**16 de noviembre de 2025**


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

