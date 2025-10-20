# Diagrama: Flujo de Cierres Automáticos Unificados

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vue.js)                             │
│                                                                   │
│  NavigationBtnsAccountsBalance.vue                              │
│  ├─ finalizarRegistro()                                         │
│  ├─ accountsBalanceStore.buildClosureTransaction()              │
│  └─ transactionStore.addTransaction()                           │
│                                                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Estructura Base
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              accountsBalanceStore.js                             │
│                                                                   │
│  buildClosureTransaction({                                       │
│    openingUuid,                                                  │
│    realCashBalance,                                              │
│    realBankBalance,                                              │
│    generateUUID                                                  │
│  })                                                              │
│                                                                   │
│  Retorna: Estructura completa de cierre ✨                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Misma estructura
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND (Firebase Functions)                       │
│                                                                   │
│  ┌───────────────────────────────────────────────────┐          │
│  │  scheduledAutoClose.js (Diario 23:59)            │          │
│  │  ├─ Escanea todos los negocios                    │          │
│  │  ├─ Detecta días abiertos sin cierre              │          │
│  │  └─ Crea cierre con estructura completa ✓        │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                   │
│  ┌───────────────────────────────────────────────────┐          │
│  │  lazyCloseIfNeeded.js (Al abrir nuevo día)       │          │
│  │  ├─ Usuario intenta abrir nuevo día               │          │
│  │  ├─ Detecta día anterior sin cierre               │          │
│  │  └─ Crea cierre con estructura completa ✓        │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Estructura de Datos Unificada

### Transacción de Cierre

```javascript
{
  // ===== IDENTIFICACIÓN =====
  uuid: "550e8400-e29b-41d4-a716-446655440000",
  type: "closure",
  description: "Cierre automático programado", // o "Cierre de caja" (manual)
  source: "copilot",
  copilotMode: "scheduled" | "lazyOpen" | "manual",
  openingReference: "uuid-de-apertura",

  // ===== SALDOS INICIALES (DE LA APERTURA) =====
  initialCashBalance: 500.00,
  initialBankBalance: 1200.00,

  // ===== MOVIMIENTOS DEL DÍA =====
  totalIngresos: 3500.00,
  totalEgresos: 800.00,
  ingresosCash: 2000.00,
  ingresosBank: 1500.00,
  egresosCash: 500.00,
  egresosBank: 300.00,

  // ===== BALANCES ESPERADOS =====
  expectedCashBalance: 2000.00,  // inicial + ingresos - egresos + transferencias
  expectedBankBalance: 2400.00,

  // ===== BALANCES REALES =====
  realCashBalance: 2000.00,  // Manual: conteo real | Auto: = esperado
  realBankBalance: 2400.00,

  // ===== CAMPOS COMPATIBLES (LEGACY) =====
  totalCash: 2000.00,
  totalBank: 2400.00,
  cashAmount: 2000.00,
  bankAmount: 2400.00,

  // ===== DIFERENCIAS =====
  cashDifference: 0,  // Manual: puede tener diferencias | Auto: siempre 0
  bankDifference: 0,

  // ===== ESTRUCTURA ESTÁNDAR =====
  items: [],
  itemsAndStockLogs: [],
  amount: 0,

  // ===== METADATA =====
  metadata: {
    day: "2025-10-19",
    triggerType: "scheduled_auto_close" | "lazy_open",
    autoGenerated: true,
    executionTime: "2025-10-19T23:59:10.000Z",
    hasTransactions: true
  },

  createdAt: Timestamp
}
```

---

## 🔄 Flujo de Cierre Automático

### 1️⃣ Scheduled Auto Close (23:59 diario)

```
1. Cloud Scheduler activa función
   │
   ├─ 2. Para cada negocio activo:
   │     │
   │     ├─ 3. Calcular día anterior (tz-aware)
   │     │
   │     ├─ 4. Obtener agregados del día (getDayAggregates)
   │     │     ├─ opening: { uuid, realCashBalance, realBankBalance, ... }
   │     │     ├─ totals: { totalIngresos, totalEgresos, ... }
   │     │     ├─ operational: { resultadoOperacional, ... }
   │     │     └─ flags: { hasOpening, hasClosure, hasTxn }
   │     │
   │     ├─ 5. ¿Tiene apertura pero NO cierre?
   │     │     │
   │     │     SÍ ─┐
   │     │         │
   │     │         ├─ 6. Construir closureTransaction (estructura completa)
   │     │         │     ├─ Extraer: openingData, totals, operational
   │     │         │     ├─ realBalance = expectedBalance (sin conteo)
   │     │         │     └─ differences = 0
   │     │         │
   │     │         ├─ 7. Guardar en Firestore
   │     │         │     └─ businesses/{id}/transactions/{uuid}
   │     │         │
   │     │         ├─ 8. Recalcular agregados (con nuevo cierre)
   │     │         │
   │     │         ├─ 9. Actualizar dailySummary
   │     │         │     └─ businesses/{id}/dailySummaries/{day}
   │     │         │
   │     │         ├─ 10. Romper racha (breakStreak)
   │     │         │
   │     │         └─ 11. Log en traceability_logs ✅
   │     │               └─ businesses/{id}/traceability_logs
   │     │
   │     NO ──┐
   │           │
   │           └─ ℹ️  No action needed
   │
   └─ 12. Resumen de ejecución
         └─ Guardar en scheduledExecutions
```

### 2️⃣ Lazy Open (Al abrir nuevo día)

```
1. Usuario intenta abrir nuevo día
   │
   ├─ 2. Frontend llama: lazyCloseIfNeeded({ businessId })
   │
   ├─ 3. Validar autenticación
   │
   ├─ 4. Calcular día anterior (tz-aware)
   │
   ├─ 5. Obtener agregados del día
   │
   ├─ 6. ¿Tiene apertura pero NO cierre?
   │     │
   │     SÍ ─┐
   │         │
   │         ├─ 7. Construir closureTransaction (estructura completa)
   │         │     ├─ Igual a scheduled
   │         │     └─ copilotMode: 'lazyOpen'
   │         │
   │         ├─ 8. Guardar en Firestore
   │         │
   │         ├─ 9. Recalcular agregados
   │         │
   │         ├─ 10. Actualizar dailySummary
   │         │
   │         ├─ 11. Romper racha
   │         │
   │         ├─ 12. Log en traceability_logs ✅
   │         │
   │         └─ 13. Retornar: { closed: true, day, closureId }
   │
   │     NO ──┐
   │           │
   │           └─ Retornar: { closed: false, reason: 'no_missing_closure' }
   │
   └─ Frontend continúa con apertura del nuevo día
```

---

## 🗄️ Estructura de Datos en Firestore

### Colecciones Principales

```
businesses/
  {businessId}/

    transactions/  ← Todas las transacciones
      {uuid}/
        type: "opening" | "closure" | "income" | "expense" | "transfer"
        copilotMode: "manual" | "scheduled" | "lazyOpen"
        ...estructura completa de cierre...

    dailySummaries/  ← Resúmenes diarios
      {YYYY-MM-DD}/
        hasOpening: boolean
        hasClosure: boolean
        isAutoClosed: boolean  ← Flag importante
        closureId: string
        autoCloseReason: "scheduled" | "lazyOpen"
        ...todos los agregados financieros...

    traceability_logs/  ← Sistema unificado de logs ✅
      {auto-id}/
        operationType: "auto_close"
        entityType: "transaction"
        entityId: string (uuid del cierre)
        operation: "scheduled_closure" | "lazy_open_closure"
        day: "YYYY-MM-DD"
        triggerType: "scheduled_auto_close" | "lazy_open"
        autoGenerated: true
        financialData: { ...resumen financiero... }
        executedAt: Timestamp
        timestamp: Timestamp

scheduledExecutions/  ← Logs de ejecuciones programadas
  {auto-id}/
    type: "auto_close"
    results: { total, processed, autoClosed, ... }
    success: boolean
    executedAt: Timestamp
```

---

## ✅ Validación de Consistencia

### Checklist de Estructura

| Campo                    | Manual    | Scheduled  | LazyOpen   | Requerido |
| ------------------------ | --------- | ---------- | ---------- | --------- |
| `uuid`                   | ✅        | ✅         | ✅         | ✅        |
| `type: 'closure'`        | ✅        | ✅         | ✅         | ✅        |
| `openingReference`       | ✅        | ✅         | ✅         | ✅        |
| `initialCashBalance`     | ✅        | ✅         | ✅         | ✅        |
| `initialBankBalance`     | ✅        | ✅         | ✅         | ✅        |
| `totalIngresos`          | ✅        | ✅         | ✅         | ✅        |
| `totalEgresos`           | ✅        | ✅         | ✅         | ✅        |
| `ingresosCash`           | ✅        | ✅         | ✅         | ✅        |
| `ingresosBank`           | ✅        | ✅         | ✅         | ✅        |
| `egresosCash`            | ✅        | ✅         | ✅         | ✅        |
| `egresosBank`            | ✅        | ✅         | ✅         | ✅        |
| `expectedCashBalance`    | ✅        | ✅         | ✅         | ✅        |
| `expectedBankBalance`    | ✅        | ✅         | ✅         | ✅        |
| `realCashBalance`        | Conteo    | = esperado | = esperado | ✅        |
| `realBankBalance`        | Conteo    | = esperado | = esperado | ✅        |
| `cashDifference`         | Calculado | 0          | 0          | ✅        |
| `bankDifference`         | Calculado | 0          | 0          | ✅        |
| `copilotMode`            | manual    | scheduled  | lazyOpen   | ✅        |
| `metadata.autoGenerated` | false     | true       | true       | ✅        |

---

## 🎯 Diferencias Entre Tipos de Cierre

### Manual (Usuario)

```javascript
{
  copilotMode: 'manual',
  realCashBalance: 1950.00,    // Conteo real del usuario
  realBankBalance: 2380.00,    // Conteo real del usuario
  cashDifference: -50.00,      // Diferencia detectada
  bankDifference: -20.00,      // Diferencia detectada
  metadata: {
    autoGenerated: false,
    triggerType: 'manual_closure'
  }
}
```

### Scheduled (23:59 automático)

```javascript
{
  copilotMode: 'scheduled',
  realCashBalance: 2000.00,    // = expectedCashBalance
  realBankBalance: 2400.00,    // = expectedBankBalance
  cashDifference: 0,           // Sin diferencias
  bankDifference: 0,           // Sin diferencias
  metadata: {
    autoGenerated: true,
    triggerType: 'scheduled_auto_close',
    executionTime: '2025-10-19T23:59:10.000Z'
  }
}
```

### LazyOpen (Al abrir día siguiente)

```javascript
{
  copilotMode: 'lazyOpen',
  realCashBalance: 2000.00,    // = expectedCashBalance
  realBankBalance: 2400.00,    // = expectedBankBalance
  cashDifference: 0,           // Sin diferencias
  bankDifference: 0,           // Sin diferencias
  metadata: {
    autoGenerated: true,
    triggerType: 'lazy_open',
    previousDay: '2025-10-18'
  }
}
```

---

## 📈 Beneficios de la Unificación

### 1. **Consultas Simplificadas**

```javascript
// Obtener todos los cierres (manuales y automáticos)
const closures = await db
  .collection("businesses/{id}/transactions")
  .where("type", "==", "closure")
  .get();

// Filtrar solo automáticos
const autoClosed = closures.docs.filter(
  (doc) => doc.data().metadata?.autoGenerated === true
);

// Filtrar solo manuales
const manualClosed = closures.docs.filter(
  (doc) => doc.data().copilotMode === "manual"
);
```

### 2. **Reportes Financieros Consistentes**

```javascript
// Calcular totales del mes (incluye todos los tipos)
closures.forEach((closure) => {
  const data = closure.data();
  totalIngresos += data.totalIngresos;
  totalEgresos += data.totalEgresos;
  // Misma estructura para todos ✅
});
```

### 3. **Análisis de IA Mejorado**

```javascript
// traceabilityCore.js puede analizar todo igual
const patterns = await analyzeClosurePatterns({
  allClosures, // No importa el tipo
  period: "month",
});
```

---

**Resultado:** Sistema 100% consistente y mantenible ✨
