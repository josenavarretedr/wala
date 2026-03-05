>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# Corrección de Decimales en Operaciones Matemáticas

## 📋 Problema Identificado

Al realizar cierres de caja con decimales, el sistema mostraba valores con múltiples decimales erróneos (ej: `886.31999999`) en lugar de redondear correctamente a 2 decimales.

### Causa Raíz

JavaScript utiliza punto flotante (IEEE 754) para representar números, lo que causa errores de precisión en operaciones matemáticas con decimales. Por ejemplo:

```javascript
0.1 + 0.2 = 0.30000000000000004  // ❌ Error de precisión
```

Al acumular múltiples operaciones (sumas, restas, multiplicaciones) estos errores se propagan y resultan en valores como `886.31999999`.

## 🔧 Solución Implementada

### 1. Creación de Utilidades Matemáticas (`mathUtils.js`)

Se creó un módulo de utilidades en `src/utils/mathUtils.js` que proporciona funciones matemáticas con redondeo automático a 2 decimales:

**Funciones disponibles:**

- `round2(value)` - Redondea un valor a 2 decimales
- `addMoney(...values)` - Suma múltiples valores con redondeo
- `subtractMoney(a, b)` - Resta dos valores con redondeo
- `multiplyMoney(a, b)` - Multiplica dos valores con redondeo
- `parseMoneyFloat(value)` - Parsea y redondea un string/número
- `sumTransactions(transactions)` - Suma un array de transacciones con redondeo

### 2. Archivos Actualizados

#### Stores Modificados:

1. **`cashClosureStore.js`**

   - ✅ `calculateExpectedBalances()` - Usa `addMoney()` para acumular balances
   - ✅ `setrealBalance()` - Usa `parseMoneyFloat()` para parsear entrada
   - ✅ `calculateDifferences()` - Usa `subtractMoney()` para diferencias
   - ✅ `createAdjustmentTransaction()` - Usa `round2()` para valores absolutos

2. **`cashEventStore.js`**

   - ✅ `calcularSaldoInicial()` - Usa `round2()` para saldos iniciales
   - ✅ `calculateExpectedBalancesFromTransactions()` - Usa `addMoney()` para acumulaciones
   - ✅ `setRealBalance()` - Usa `parseMoneyFloat()` para entrada
   - ✅ `calculateDifferences()` - Usa `subtractMoney()` para diferencias
   - ✅ `createAdjustmentTransaction()` - Usa `round2()` para valores absolutos

3. **`transactionStore.js`**

   - ✅ `getTransactionToAddTotal()` - Usa `multiplyMoney()` y `addMoney()` para calcular totales
   - ✅ `setExpenseAmount()` - Usa `parseMoneyFloat()` para parsear montos

4. **`accountsBalanceStore.js`** (Crítico - Store principal de cálculos financieros)
   - ✅ Todos los computed de ingresos usan `sumTransactions()`
   - ✅ Todos los computed de egresos usan `sumTransactions()`
   - ✅ Todas las transferencias usan `sumTransactions()`
   - ✅ Todos los ajustes usan `sumTransactions()` y `subtractMoney()`
   - ✅ Efectos de transferencias usan `subtractMoney()`
   - ✅ Saldos iniciales usan `round2()` y `addMoney()`
   - ✅ Balances esperados usan `addMoney()`
   - ✅ Saldos actuales usan `addMoney()`
   - ✅ Resultados operacionales usan `subtractMoney()`

#### Composables Modificados:

5. **`newData.js`**
   - ✅ Usa `parseMoneyFloat()` para parsear `quantity` y `price`

#### 🔥 Backend - Firebase Functions Modificadas:

6. **`functions/src/AccountsBalance/sharedComputed.js`** (⚠️ CRÍTICO)

   - ✅ `getDayAggregates()` - Función principal de agregados diarios
   - ✅ Parseo de amounts usa `parseMoneyNumber()`
   - ✅ Todas las acumulaciones de ingresos usan `addMoney()`
   - ✅ Todas las acumulaciones de egresos usan `addMoney()`
   - ✅ Todas las transferencias usan `addMoney()`
   - ✅ Todos los ajustes usan `addMoney()` y `subtractMoney()`
   - ✅ Efectos de transferencias usan `subtractMoney()`
   - ✅ Totales de ajustes usan `addMoney()`
   - ✅ Saldos iniciales usan `round2()` y `addMoney()`
   - ✅ Balances esperados usan `addMoney()`
   - ✅ Saldos actuales usan `addMoney()`
   - ✅ Resultados operacionales usan `subtractMoney()`
   - ✅ Flujos netos usan `addMoney()`

7. **`functions/src/Helpers/mathUtils.js`** (Nuevo)
   - ✅ Módulo de utilidades matemáticas para backend
   - ✅ Compatible con Node.js/CommonJS

## 📊 Impacto de los Cambios

### Antes:

```javascript
// Acumulación de errores
let balance = 0;
balance += 100.1; // 100.10
balance += 200.2; // 300.30000000000004
balance += 586.02; // 886.3200000000001
// Resultado: 886.31999999 ❌
```

### Después:

```javascript
// Con redondeo automático
let balance = 0;
balance = addMoney(balance, 100.1); // 100.10
balance = addMoney(balance, 200.2); // 300.30
balance = addMoney(balance, 586.02); // 886.32
// Resultado: 886.32 ✅
```

## 🎯 Beneficios

1. **Precisión Garantizada**: Todos los valores monetarios siempre tienen exactamente 2 decimales
2. **Consistencia**: Todas las operaciones matemáticas del sistema usan el mismo mecanismo
3. **Mantenibilidad**: Fácil de entender y mantener - las funciones tienen nombres claros
4. **Escalabilidad**: Si en el futuro necesitas cambiar la precisión (ej: 3 decimales), solo modificas `mathUtils.js`
5. **Prevención de Errores**: Elimina los errores de punto flotante en todos los cálculos financieros

## ✅ Áreas Afectadas

### Frontend (Vue.js):

- ✅ Cierre de caja
- ✅ Apertura de caja
- ✅ Balance de cuentas
- ✅ Cálculo de transacciones
- ✅ Ajustes financieros
- ✅ Transferencias entre cuentas
- ✅ Resultados operacionales
- ✅ Saldos esperados y reales

### Backend (Firebase Functions):

- ✅ Agregados diarios (`getDayAggregates`)
- ✅ Resúmenes diarios (`dailySummaries`)
- ✅ Cierres automáticos programados
- ✅ Cálculos de balances en el servidor
- ✅ Validaciones de transacciones

## 🔍 Testing Recomendado

Probar los siguientes escenarios:

1. Realizar un cierre de caja con valores decimales (ej: 886.32)
2. Verificar que el efectivo final muestre exactamente 2 decimales
3. Realizar múltiples transacciones con decimales y verificar el balance
4. Crear ajustes y verificar que los montos sean exactos
5. Realizar transferencias con decimales

## 📝 Notas Técnicas

- El redondeo usa `Math.round((value + Number.EPSILON) * 100) / 100` para mayor precisión
- `Number.EPSILON` es el valor más pequeño en JavaScript y ayuda a compensar errores de redondeo
- Todas las funciones manejan valores `null`, `undefined` o `NaN` retornando `0`
- Las funciones aceptan múltiples argumentos para facilitar cálculos complejos

## 🚀 Uso en Código Nuevo

### Frontend (Vue.js):

Cuando agregues nuevos cálculos matemáticos con dinero, **siempre** importa y usa las funciones de `@/utils/mathUtils.js`:

```javascript
import {
  round2,
  addMoney,
  subtractMoney,
  multiplyMoney,
  parseMoneyFloat,
} from "@/utils/mathUtils";

// ✅ Correcto
const total = addMoney(subtotal, tax, shipping);
const profit = subtractMoney(revenue, costs);
const itemTotal = multiplyMoney(price, quantity);

// ❌ Evitar
const total = subtotal + tax + shipping; // Puede causar 123.45999999
const profit = revenue - costs; // Puede causar errores de precisión
const itemTotal = price * quantity; // Puede causar decimales incorrectos
```

### Backend (Firebase Functions):

Cuando trabajes en funciones de Firebase, usa `../Helpers/mathUtils`:

```javascript
const {
  round2,
  addMoney,
  subtractMoney,
  parseMoneyNumber,
} = require("../Helpers/mathUtils");

// ✅ Correcto
const amount = parseMoneyNumber(tx.amount || 0);
const total = addMoney(cash, bank);
const difference = subtractMoney(real, expected);

// ❌ Evitar
const amount = Number(tx.amount || 0); // Sin redondeo
const total = cash + bank; // Puede causar decimales erróneos
const difference = real - expected; // Sin redondeo
```

---

**Fecha de Implementación**: 14 de octubre de 2025  
**Archivos Modificados**:

- Frontend: 6 archivos (5 stores + 1 composable + 1 utilidad)
- Backend: 2 archivos (1 función + 1 utilidad)
- **Total**: 8 archivos + 2 utilidades nuevas

**Impacto**: Frontend Y Backend completamente sincronizados con redondeo a 2 decimales
