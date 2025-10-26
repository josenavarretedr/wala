# Sistema de Gastos Recurrentes

## 📋 Resumen

Sistema implementado para gestionar gastos recurrentes con historial de uso, similar al sistema de inventory/products. Permite buscar, crear y registrar gastos con seguimiento completo de metadata y logs.

## 🎯 Objetivos Implementados

1. ✅ Búsqueda asíncrona de gastos existentes
2. ✅ Creación automática de nuevos gastos
3. ✅ Registro de logs por cada uso del gasto
4. ✅ Metadata calculada (total gastado, frecuencia, última vez usado)
5. ✅ Integración con sistema de transacciones
6. ✅ Trazabilidad completa de operaciones

## 📁 Archivos Modificados/Creados

### Nuevos Archivos

- `src/components/transactionFlow/SearchExpenseAsync.vue` - Componente de búsqueda asíncrona

### Archivos Modificados

- `src/composables/useExpenses.js` - Composable con nuevas funciones
- `src/stores/expensesStore.js` - Store refactorizado
- `src/stores/transaction/transactionStore.js` - Integración con expenses
- `src/components/transactionFlow/StepAddExpenseDetails.vue` - UI actualizada

## 🏗️ Estructura de Datos

### Documento Expense Individual

```javascript
{
  uuid: string,              // UUID generado con uuid v4
  description: string,       // Descripción del gasto
  category: string,          // 'materials' | 'labor' | 'overhead'
  subcategory: string | null,
  createdAt: timestamp,
  updatedAt: timestamp,
  logs: [                    // Array de logs (no subcolección)
    {
      logId: string,         // UUID del log
      amount: number,
      date: timestamp,
      transactionRef: string, // UUID de la transacción
      account: string,       // 'cash' | 'bank'
      notes: string | null,
      createdAt: timestamp
    }
  ],
  metadata: {
    totalSpent: number,      // Suma de todos los logs
    occurrences: number,     // Cantidad de veces usado
    lastUsedAt: timestamp,   // Última fecha de uso
    averageAmount: number    // Promedio de gastos
  }
}
```

### Path de Firestore

```
businesses/{businessId}/expenses/{expenseId}
```

## 🔧 Funciones Principales

### useExpenses.js

#### Nuevas Funciones

1. **searchExpensesByDescription(searchTerm)**

   - Busca expenses por descripción (case-insensitive)
   - Filtrado local en memoria
   - Retorna array de expenses coincidentes

2. **createExpenseWithLog(expenseData, logData)**

   - Crea nuevo expense con primer log
   - Genera UUID automáticamente
   - Inicializa metadata
   - Retorna expenseId

3. **addLogToExpense(expenseId, logData)**

   - Agrega log a expense existente
   - Usa arrayUnion de Firestore
   - Actualiza updatedAt

4. **updateExpenseMetadata(expenseId)**

   - Recalcula metadata basado en logs
   - Actualiza totalSpent, occurrences, averageAmount
   - Encuentra última fecha de uso

5. **getExpenseById(expenseId)**

   - Obtiene expense específico
   - Retorna null si no existe

6. **getAllExpensesWithMetadata()**
   - Obtiene todos los expenses
   - Incluye metadata calculada

#### Funciones Legacy (mantenidas por compatibilidad)

- `createExpense()`
- `getAllExpenses()`
- `updateExpense()`
- `deleteExpenseByID()`
- `deleteExpenseByTransactionRef()`

### expensesStore.js

#### Nuevas Funciones Wrapper

1. **searchExpenses(searchTerm)**

   - Wrapper para searchExpensesByDescription

2. **loadExpensesWithMetadata()**

   - Carga expenses en store local
   - Incluye metadata

3. **getExpense(expenseId)**
   - Wrapper para getExpenseById

## 🎨 Componentes

### SearchExpenseAsync.vue

Componente de búsqueda similar a SearchProductAsync.vue

**Características:**

- Búsqueda con debounce (120ms)
- Filtrado por descripción
- Normalización de texto (sin acentos)
- Muestra últimos 5 resultados
- Opción inline para crear nuevo gasto
- Badge de categoría
- Información de última vez usado y frecuencia

**Eventos Emitidos:**

```javascript
emit("update:expenseToAdd", {
  description: string,
  oldOrNewExpense: "new" | "old",
  selectedExpenseId: string | null,
  category: string | null,
  subcategory: string | null,
  metadata:
    {
      lastUsedAt: timestamp,
      totalSpent: number,
      occurrences: number,
    } | null,
});
```

### StepAddExpenseDetails.vue

**Cambios Implementados:**

1. Reemplazado input manual por SearchExpenseAsync
2. Agregado display de gasto seleccionado con metadata
3. Botón para limpiar selección
4. Badge indicando si es nuevo o recurrente
5. Muestra información de uso (total gastado, frecuencia)

**Nuevas Variables Reactivas:**

- `expenseType: ref('new' | 'old')`
- `selectedExpenseId: ref(string | null)`
- `selectedExpenseMetadata: ref(object | null)`

**Nuevas Funciones:**

- `handleExpenseSelected(expenseData)` - Maneja selección de gasto
- `clearExpenseSelection()` - Limpia selección actual

## 🔄 Flujo de Transacción

### Caso 1: Gasto Nuevo

1. Usuario busca "nuevo gasto"
2. No encuentra coincidencias
3. Selecciona "Registrar nuevo gasto: nuevo gasto"
4. `expenseType` = 'new'
5. `selectedExpenseId` = null
6. Usuario completa amount y categoría
7. Al crear transacción:
   - Se llama `createExpenseWithLog()`
   - Se crea documento expense con primer log
   - Se registra transacción con expenseId

### Caso 2: Gasto Existente

1. Usuario busca "alquiler"
2. Encuentra expense existente
3. Selecciona de la lista
4. `expenseType` = 'old'
5. `selectedExpenseId` = UUID del expense
6. Se cargan categoría y metadata
7. Usuario completa amount
8. Al crear transacción:
   - Se llama `addLogToExpense()`
   - Se agrega nuevo log al array
   - Se llama `updateExpenseMetadata()`
   - Se registra transacción con expenseId

## 🔐 Integración con transactionStore.js

### Nuevos Campos en transactionToAdd

```javascript
{
  // ... campos existentes
  expenseId: null,           // ID del expense individual
  oldOrNewExpense: null,     // 'new' | 'old'
}
```

### Bloque else if (type === 'expense')

```javascript
if (oldOrNewExpense === "old" && expenseId) {
  // Expense existente: agregar log
  await addLogToExpense(expenseId, logData);
  await updateExpenseMetadata(expenseId);
} else {
  // Expense nuevo: crear con log
  expenseId = await createExpenseWithLog(expenseData, logData);
  transactionToAdd.value.expenseId = expenseId;
}
```

### Trazabilidad

Se registra en relatedEntities:

```javascript
{
  type: 'expense',
  id: expenseId,
  relationship: 'generates_expense_log',
  impact: 'medium',
  metadata: {
    isNew: oldOrNewExpense === 'new',
    category: category,
    amount: amount
  }
}
```

## ✅ Validaciones Implementadas

1. **Búsqueda:**

   - Normalización de texto (sin acentos)
   - Case-insensitive
   - Debounce para evitar búsquedas excesivas

2. **Selección:**

   - Verificación de descripción no vacía
   - Validación de categoría seleccionada
   - Validación de amount > 0
   - Validación de saldo disponible

3. **Creación:**
   - UUID único para cada expense
   - Timestamp automático
   - Metadata inicializada correctamente

## 📊 Metadata Calculada

### Algoritmo de Cálculo

```javascript
totalSpent = logs.reduce((sum, log) => sum + log.amount, 0);
occurrences = logs.length;
averageAmount = totalSpent / occurrences;
lastUsedAt = max(logs.map((log) => log.date));
```

### Actualización

- Se actualiza después de agregar cada log
- Cálculo basado en todos los logs del array
- Usa transacciones de Firestore para consistencia

## 🎯 Casos de Uso

### 1. Alquiler Mensual

- Primera vez: crea expense "Alquiler local"
- Mes 2: busca "alquiler", encuentra existente, agrega log
- Mes 3: busca "alquiler", ve metadata (2 veces, S/ 3000 total)

### 2. Materiales Variables

- Compra 1: "Compra de cemento" - S/ 150
- Compra 2: busca "cemento", agrega S/ 200
- Metadata muestra: promedio S/ 175, 2 veces

### 3. Servicios Básicos

- Luz enero: crea "Luz"
- Luz febrero: busca "luz", agrega nuevo monto
- Puede ver historial completo y promedio

## 🔍 Diferencias con Sistema de Inventory

| Característica      | Inventory            | Expenses     |
| ------------------- | -------------------- | ------------ |
| Tracking de stock   | ✅ Sí                | ❌ No        |
| Precio variable     | ❌ No                | ✅ Sí (logs) |
| Metadata calculada  | ❌ No                | ✅ Sí        |
| Logs como array     | ❌ No (subcolección) | ✅ Sí        |
| Auto-categorización | ❌ No                | 🔜 IA futura |

## 🚀 Mejoras Futuras

1. **Auto-categorización con IA**

   - Usar API de IA para sugerir categorías
   - Basado en descripción del gasto

2. **Análisis de Patrones**

   - Detectar gastos recurrentes mensuales
   - Alertas de gastos inusuales

3. **Predicción de Gastos**

   - Basado en historial
   - Sugerencias de presupuesto

4. **Exportación de Reportes**
   - Por categoría
   - Por período
   - Con gráficos

## 📝 Notas Importantes

- ✅ No se creó script de migración (sistema nuevo)
- ✅ Backward compatibility mantenida
- ✅ Logs como array (no subcolección) para mejor performance
- ✅ Validación de duplicados por descripción similar
- ✅ Trazabilidad completa de operaciones
- ✅ Sin impacto en transacciones existentes

## 🧪 Testing Recomendado

1. Crear gasto nuevo
2. Buscar y usar gasto existente
3. Verificar metadata actualizada
4. Confirmar trazabilidad en Firestore
5. Validar límites de saldo
6. Probar en móvil (debounce, UX)

## 📞 Contacto

Para dudas o mejoras, consultar con el equipo de desarrollo.

---

**Fecha de Implementación:** 26 de octubre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Implementado y listo para testing
