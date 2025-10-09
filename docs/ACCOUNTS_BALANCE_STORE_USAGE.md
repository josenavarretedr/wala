# Guía de Uso del AccountsBalanceStore

## Descripción General

El `accountsBalanceStore` es un store centralizado que maneja toda la lógica financiera de la aplicación. Actúa como el "motor de cálculos" equivalente a un flujo de caja empresarial.

## Características Principales

- ✅ **Reutilizable**: Se puede usar en cualquier componente
- ✅ **Consistente**: Los cálculos son siempre los mismos
- ✅ **Completo**: Incluye todos los tipos de cálculos financieros
- ✅ **Flexible**: Solo necesitas pasar las transacciones
- ✅ **Reactivo**: Todos los cálculos se actualizan automáticamente

## Uso Básico

### 1. Importar y configurar

```javascript
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";

const accountsBalanceStore = useAccountsBalanceStore();

// Configurar con transacciones del día
accountsBalanceStore.setTransactions(transactionsArray);
```

### 2. Acceder a los cálculos

```javascript
// Ingresos y egresos
const ventas = accountsBalanceStore.totalIngresos;
const gastos = accountsBalanceStore.totalEgresos;
const ventasEfectivo = accountsBalanceStore.ingresosCash;
const ventasDigital = accountsBalanceStore.ingresosBank;

// Saldos
const saldoInicial = accountsBalanceStore.saldoInicial;
const saldoActual = accountsBalanceStore.saldoActual;
const saldoEfectivo = accountsBalanceStore.saldoActualCash;
const saldoDigital = accountsBalanceStore.saldoActualBank;

// Resultado operacional (KPI principal)
const gananciaDia = accountsBalanceStore.resultadoOperacional;

// Transferencias
const totalTransfers = accountsBalanceStore.totalTransferencias;
const cashToBank = accountsBalanceStore.transferenciasSalidaCash;
const bankToCash = accountsBalanceStore.transferenciasSalidaBank;
const efectoNetoCash = accountsBalanceStore.efectoTransferenciasEnCash;

// Flujo neto (operacional + transferencias)
const flujoFinalCash = accountsBalanceStore.flujoNetoCash;
const flujoFinalBank = accountsBalanceStore.flujoNetoBank;

// Ajustes por descuadres
const ajustes = accountsBalanceStore.totalAjustes;
```

### 3. Resumen completo

```javascript
const resumen = accountsBalanceStore.financialSummary;

console.log("Resumen financiero:", resumen);
// Contiene todos los valores calculados en un objeto
```

## Casos de Uso

### Para ResumenDay.vue

```javascript
// Antes (lógica duplicada)
const totalIngresos = computed(() => {
  return transactions.value
    .filter((tx) => tx.type === "income" && tx.category !== "adjustment")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
});

// Después (usando store)
const totalIngresos = computed(() => accountsBalanceStore.totalIngresos);
```

### Para AccountBalanceAppClose.vue

```javascript
// Configurar store con transacciones del día
accountsBalanceStore.setTransactions(dayTransactions);

// Usar balances esperados para el cierre
const expectedCash = accountsBalanceStore.expectedFinalCash;
const expectedBank = accountsBalanceStore.expectedFinalBank;

// Calcular diferencias
const cashDifference = accountsBalanceStore.calculateDifference(
  realCashCount,
  expectedCash
);
```

### Para manejo de transferencias

```javascript
// Configurar store con transacciones que incluyen transferencias
const transactionsWithTransfers = [
  { type: "income", account: "cash", amount: 100 },
  { type: "transfer", fromAccount: "cash", toAccount: "bank", amount: 50 },
  { type: "expense", account: "bank", amount: 20 },
];

accountsBalanceStore.setTransactions(transactionsWithTransfers);

// Analizar el efecto de las transferencias
const efectoCash = accountsBalanceStore.efectoTransferenciasEnCash; // -50
const efectoBank = accountsBalanceStore.efectoTransferenciasEnBank; // +50

// Saldos finales considerando transferencias
const saldoFinalCash = accountsBalanceStore.saldoActualCash; // saldo inicial + ingresos - egresos - transferencias salida
const saldoFinalBank = accountsBalanceStore.saldoActualBank; // saldo inicial + ingresos - egresos + transferencias entrada

// Flujo neto por cuenta (operacional + transferencias)
const flujoNetoCash = accountsBalanceStore.flujoNetoCash;
const flujoNetoBank = accountsBalanceStore.flujoNetoBank;
```

### Para nuevos componentes

```javascript
// Dashboard financiero
const financialWidget = () => {
  accountsBalanceStore.setTransactions(todayTransactions);

  return {
    ventasDelDia: accountsBalanceStore.totalIngresos,
    gastosDelDia: accountsBalanceStore.totalEgresos,
    utilidadOperacional: accountsBalanceStore.resultadoOperacional,
    liquidezTotal: accountsBalanceStore.saldoActual,
  };
};
```

## Funciones Utilitarias

### calculateDifference

```javascript
// Para calcular diferencias en arqueos
const diferencia = accountsBalanceStore.calculateDifference(
  valorReal, // Lo que realmente tienes
  valorEsperado // Lo que debería haber según el sistema
);
```

### isSignificantDifference

```javascript
// Para validar si una diferencia es importante
const esSignificativo =
  accountsBalanceStore.isSignificantDifference(diferencia);
if (esSignificativo) {
  // Crear transacción de ajuste
}
```

## Tipos de Cálculos Disponibles

### Ingresos (Ventas)

- `totalIngresos`: Total de ventas del período
- `ingresosCash`: Ventas en efectivo
- `ingresosBank`: Ventas digitales (Yape/Plin)

### Egresos (Gastos)

- `totalEgresos`: Total de gastos operativos
- `egresosCash`: Gastos en efectivo
- `egresosBank`: Gastos digitales

### Transferencias

- `totalTransferencias`: Total de transferencias realizadas
- `transferenciasSalidaCash`: Dinero que sale del efectivo (cash -> bank)
- `transferenciasEntradaCash`: Dinero que entra al efectivo (bank -> cash)
- `transferenciasSalidaBank`: Dinero que sale del banco (bank -> cash)
- `transferenciasEntradaBank`: Dinero que entra al banco (cash -> bank)
- `efectoTransferenciasEnCash`: Efecto neto en efectivo (entrada - salida)
- `efectoTransferenciasEnBank`: Efecto neto en banco (entrada - salida)

### Ajustes

- `ajustesAperturaCash/Bank`: Correcciones al abrir
- `ajustesCierreCash/Bank`: Correcciones al cerrar
- `totalAjustes`: Todas las correcciones

### Saldos

- `saldoInicial`: Dinero al inicio del día
- `saldoActual`: Dinero actual (incluye ajustes y transferencias)
- `expectedFinalCash/Bank`: Lo que debería haber

### Resultados

- `resultadoOperacional`: Ventas - Gastos (KPI principal, sin transferencias)
- `resultadoOperacionalCash/Bank`: Por tipo de cuenta (sin transferencias)
- `flujoNetoCash/Bank`: Resultado operacional + efecto transferencias

## Validaciones

```javascript
// Verificar estado del store
if (accountsBalanceStore.hasOpening) {
  // Hay apertura configurada
}

if (accountsBalanceStore.hasActivity) {
  // Hay movimientos en el día
}

if (accountsBalanceStore.hasTransactions) {
  // Hay transacciones cargadas
}
```

## Reset y Actualización

```javascript
// Limpiar todo
accountsBalanceStore.reset();

// Solo actualizar transacciones
accountsBalanceStore.updateTransactions(newTransactions);

// Configurar apertura específica
accountsBalanceStore.setOpening(openingTransaction);
```

## Ventajas del Store Centralizado

1. **Consistencia**: Todos los componentes usan la misma lógica
2. **Mantenimiento**: Un solo lugar para cambiar cálculos
3. **Testing**: Fácil de probar la lógica de negocio
4. **Performance**: Cálculos optimizados y reactivos
5. **Escalabilidad**: Fácil agregar nuevos tipos de cálculos

## Migración de Componentes Existentes

1. Importar el store
2. Configurar con `setTransactions()`
3. Reemplazar computed locales con properties del store
4. Eliminar lógica duplicada del componente
5. Probar que todo funciona igual

Esta aproximación convierte el store en el "cerebro financiero" de la aplicación, manteniendo toda la lógica de cálculos centralizada y reutilizable.
