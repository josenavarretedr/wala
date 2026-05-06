# Mapa de Implementación de Analytics - WALA

## Arquitectura Identificada

### Composables Clave

- `useCashEvent.js` - Gestión de apertura/cierre de día
- `useTransaction.js` - CRUD de transacciones
- `useDailySummary.js` - Lectura de resúmenes diarios
- `useTransactionFlow.js` - Flujo wizard de transacciones

### Stores Clave

- `cashEventStore.js` - Store para apertura/cierre (línea 21: performCashEvent)
- `transactionStore.js` - Store para transacciones (línea 88: addTransaction)
- `transactionFlowStore.js` - (por explorar)

### Firebase Functions Clave

- `scheduledAutoClose.js` - Auto-cierre diario a las 23:59
- `streakManager.js` - Gestión de racha (updateStreakContextualizada)
- `autoOpening.js` - Auto-apertura de día

---

## Mapa de Eventos por Archivo

### 🟥 EVENTOS MANUALES (Frontend)

#### 1. `day_opened` (Manual)

**Archivo**: `src/stores/cashEventStore.js`
**Función**: `performCashEvent(type='opening')`
**Línea aproximada**: ~170
**Momento**: Después de `createCashEvent()` y `registerCashEventTransaction()` exitoso
**Condición**: `type === 'opening'`

**Parámetros a enviar**:

```javascript
{
  business_id: businessId,
  user_id: Firebase.auth.currentUser.uid,
  day_id: dayString, // formato 'yyyy-MM-dd'
  source: 'copilot',
  days_since_last_valid_transaction: calcular desde dailySummary previo
}
```

---

#### 2. `transaction_started`

**Archivo**: `src/stores/transaction/transactionFlowStore.js` (por confirmar)
**Función**: Inicio del flujo (cuando currentStep = 0 o primer paso)
**Momento**: Al abrir el modal/wizard de agregar transacción

**Parámetros**:

```javascript
{
  business_id: businessId,
  day_id: dayString,
  ui_surface: 'add_transaction_modal' | 'quick_action' | 'dashboard'
}
```

---

#### 3. `transaction_created`

**Archivo**: `src/stores/transaction/transactionStore.js`
**Función**: `addTransaction()`
**Línea aproximada**: ~88 (después de createTransaction exitoso)
**Condición**: ⚠️ **SOLO si `type === 'income' || type === 'expense'`**

**Parámetros**:

```javascript
{
  business_id: businessId,
  day_id: dayString,
  transaction_type: 'income' | 'expense', // NO 'transfer'
  amount: transactionToAdd.value.amount,
  account: 'cash' | 'bank',
  source: 'copilot',
  is_first_transaction_of_day: verificar en dailySummary
}
```

❌ **NO disparar para**:

- `type === 'transfer'`
- `type === 'opening'`
- `type === 'closure'`
- `type === 'adjustment'`

---

#### 4. `transaction_abandoned`

**Archivo**: `src/stores/transaction/transactionFlowStore.js` o componentes del wizard
**Momento**: Cuando el usuario:

- Cierra el modal sin completar
- Presiona "Cancelar"
- Sale del flujo antes del paso final

**Parámetros**:

```javascript
{
  business_id: businessId,
  day_id: dayString,
  step: currentStepName, // ej: 'CashOrBank', 'AddIncomeOrExpense'
  reason: 'user_cancelled' | 'modal_closed' | null
}
```

---

#### 5. `day_closed` (Manual)

**Archivo**: `src/stores/cashEventStore.js`
**Función**: `performCashEvent(type='closure')`
**Línea aproximada**: ~170
**Momento**: Después de `createCashEvent()` exitoso
**Condición**: `type === 'closure'`

**Parámetros**:

```javascript
{
  business_id: businessId,
  day_id: dayString,
  source: 'copilot',
  transactions_count: contar desde dailySummary,
  net_result: 'positive' | 'negative' | 'zero' // desde operational.result
}
```

---

#### 6. `summary_viewed`

**Archivo**: Vista/componente donde se muestra el resumen (Dashboard, AccountBalanceAppWrapper, etc.)
**Momento**: Al cargar/mostrar el resumen del día

**Parámetros**:

```javascript
{
  business_id: businessId,
  day_id: dayString,
  transactions_count: summary.totals count,
  net_result: calcular desde totals.net,
  streak_length: obtener desde business.streak.current (si existe)
}
```

---

### 🟧 EVENTOS AUTOMÁTICOS (Backend - Firebase Functions)

#### 1. `day_opened` (Automático)

**Archivo**: `functions/src/AccountsBalance/autoOpening.js`
**Función**: `executeAutoOpening()`
**Momento**: Después de crear la transacción de opening automática

**Parámetros**:

```javascript
{
  business_id: businessId,
  day_id: day,
  source: 'automatic'
}
```

---

#### 2. `day_closed` (Automático)

**Archivo**: `functions/src/AccountsBalance/scheduledAutoClose.js`
**Función**: Dentro del loop de procesamiento de negocios
**Línea aproximada**: ~200 (después de crear closureTransaction)
**Momento**: Después de `closureRef.set()` exitoso

**Parámetros**:

```javascript
{
  business_id: businessId,
  day_id: day,
  source: 'automatic',
  transactions_count: summary.totals count,
  net_result: calcular desde operational.result
}
```

---

#### 3. `streak_extended`

**Archivo**: `functions/src/Streak/streakManager.js`
**Función**: `updateStreakContextualizada()`
**Línea aproximada**: ~320 (cuando newCurrent > current)
**Momento**: Cuando se incrementa la racha

**Parámetros**:

```javascript
{
  business_id: businessId,
  streak_length: newCurrent,
  days_since_last_valid_transaction: daysBetween(lastActiveDay, day),
  trigger: 'transaction'
}
```

---

#### 4. `streak_broken`

**Archivo**: `functions/src/Streak/streakManager.js`
**Función**: `updateStreakContextualizada()`
**Línea aproximada**: ~360 (cuando gap > allowedGap)
**Momento**: Cuando se detecta que el gap excede lo permitido

**Parámetros**:

```javascript
{
  business_id: businessId,
  previous_streak_length: current,
  days_without_transaction: gap,
  reason: 'inactivity'
}
```

---

## Reglas de Negocio Críticas

### ⚠️ Validación de Transacción Válida

Solo cuentan para racha:

- ✅ `type === 'income'`
- ✅ `type === 'expense'`
- ❌ `type === 'transfer'` NO cuenta
- ❌ `type === 'adjustment'` NO cuenta
- ❌ `type === 'opening'` NO cuenta
- ❌ `type === 'closure'` NO cuenta

### ⚠️ Tolerancia de Racha

Según `streakManager.js`:

- `MIN_ALLOWED_GAP = 5` días
- `MAX_ALLOWED_GAP = 14` días
- Se calcula dinámicamente según el `medianGap` del usuario
- Fórmula: `allowedGap = Math.round(medianGap * 1.5)`

### ⚠️ Día Activo

Un día es activo cuando:

- `dailySummary.hasTxn === true`
- Esto significa que hubo al menos 1 transacción de income o expense (NO transfer, NO adjustment)

---

## Configuración de Firebase Analytics

**SDK**: Firebase Analytics (Web)
**Configuración actual**: `src/firebaseInit.js`
**Measurement ID**: Obtener de Firebase Console
**Emuladores**: No enviar eventos cuando `window.location.hostname === 'localhost'`

---

## Event ID Determinístico (Backend)

Para evitar duplicados en Functions:

```javascript
const eventId = `${businessId}:${dayId}:${eventName}:${source}`;
// Guardar en /businesses/{businessId}/analyticsEvents/{eventId}
// Validar existencia antes de enviar
```

---

## Próximos Pasos

1. ✅ Crear wrapper centralizado `/src/analytics/index.js`
2. ✅ Implementar tracking en `cashEventStore.js` (apertura/cierre manual)
3. ✅ Implementar tracking en `transactionStore.js` (transacciones)
4. ✅ Implementar tracking en componentes de flujo (abandoned)
5. ✅ Implementar tracking en vistas de resumen (summary_viewed)
6. ✅ Implementar tracking en `autoOpening.js` (apertura automática)
7. ✅ Implementar tracking en `scheduledAutoClose.js` (cierre automático)
8. ✅ Implementar tracking en `streakManager.js` (racha)
9. ✅ Documentar en `/docs/analytics.md`


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

