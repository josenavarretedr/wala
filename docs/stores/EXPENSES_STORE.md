# `expensesStore.js` — Documentación del Store de Gastos

**Archivo:** `src/stores/expensesStore.js`
**Tipo:** Composable Store (no Pinia, exportado como función)
**Módulo:** Gastos

---

## ⚠️ Nota Importante

Este store es un **composable-style store** (no usa `defineStore`). Define variables **module-level** reactivas accesibles vía `useExpensesStore()`. Delega la lógica Firestore al composable `useExpenses`.

---

## State (Module-Level)

| Variable          | Tipo          | Descripción              |
| ----------------- | ------------- | ------------------------ |
| `expensesInStore` | `Ref<Array>`  | Lista de gastos cargados |
| `expenseToAdd`    | `Ref<Object>` | Gasto en construcción    |

### Estructura de `expenseToAdd`

```javascript
{
  uuid: null,
  description: null,
  cost: null,
  createdAt: null,
  account: null,       // 'cash' | 'bank'
  category1: null,
  category2: null,
  category3: null,
  transactionRef: null // Referencia a la transacción padre
}
```

---

## Actions

### Nuevas funciones

| Action                       | Parámetros | Descripción                              |
| ---------------------------- | ---------- | ---------------------------------------- |
| `searchExpenses(searchTerm)` | String     | Busca gastos por descripción             |
| `loadExpensesWithMetadata()` | —          | Carga gastos con sus metadatos completos |
| `getExpense(expenseId)`      | String     | Obtiene un gasto por ID                  |

### Funciones legacy (compatibilidad)

| Action                                               | Descripción                                 |
| ---------------------------------------------------- | ------------------------------------------- |
| `addExpense()`                                       | Crea el gasto desde `expenseToAdd`          |
| `getExpenses()`                                      | Carga todos los gastos del negocio          |
| `modifyExpense(expenseId, data)`                     | Actualiza un gasto                          |
| `modifyExpenseToAddDescription(desc)`                | Actualiza la descripción en `expenseToAdd`  |
| `modifyExpenseToAddCost(cost)`                       | Actualiza el costo en `expenseToAdd`        |
| `modifyExpenseToAddAccount(account)`                 | Actualiza la cuenta en `expenseToAdd`       |
| `deleteOneExpenseByID(expenseId)`                    | Elimina un gasto por ID                     |
| `deleteExpenseByTransactionRefStore(transactionRef)` | Elimina gasto por referencia de transacción |
| `resetExpenseToAdd()`                                | Resetea `expenseToAdd` a valores iniciales  |

---

## Uso en Componentes

`StepAddExpenseDetails.vue` — usa `useExpensesStore()` directamente.

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
