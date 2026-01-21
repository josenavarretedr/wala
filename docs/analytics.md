# Documentación de Analytics - WALA

## Introducción

Este documento describe la implementación completa de Google Analytics 4 (GA4) mediante Firebase Analytics en el proyecto WALA. El sistema de tracking está diseñado para medir la **disciplina financiera real** de los usuarios, no solo el uso de la aplicación.

---

## Arquitectura

### Stack Tecnológico

- **Analytics**: Firebase Analytics (Web SDK)
- **Backend**: Firebase Admin SDK (para eventos automáticos)
- **Identidad**: Firebase Auth (userId = auth.uid)
- **Contexto de negocio**: businessId (Firestore)

### Principios de Diseño

1. **Separación Clara**:
   - `source: 'manual'` = Acción humana (usuario)
   - `source: 'automatic'` = Acción del sistema (auto-apertura, auto-cierre, racha)
2. **No Duplicación**: Event IDs determinísticos en Functions
3. **Transacciones Válidas**: Solo income/expense cuentan para racha (NO transfers)
4. **Entornos**: NO enviar eventos en dev/emulators
5. **Extensibilidad**: Fácil agregar nuevos eventos sin tocar lógica core

---

## Eventos Implementados

### 🟥 Eventos Manuales (Frontend)

#### 1. `day_opened`

**Descripción**: Usuario abre manualmente el día contable.

**Cuándo se dispara**: Después de crear exitosamente un evento de apertura tipo 'opening' con source='copilot'.

**Archivo**: `src/stores/cashEventStore.js`  
**Función**: `performCashEvent(type='opening')`  
**Línea**: ~170

**Parámetros**:

```javascript
{
  business_id: string,          // ID del negocio
  user_id: string,              // Firebase Auth UID
  day_id: string,               // 'yyyy-MM-dd'
  source: 'manual',            // Acción del usuario
  days_since_last_valid_transaction: number | null
}
```

**Validación en GA4**:

- Verificar que `source === 'manual'`
- `day_id` debe ser fecha válida
- Solo se dispara UNA vez por día por negocio

---

#### 2. `transaction_started`

**Descripción**: Usuario inicia el flujo de crear una transacción.

**Cuándo se dispara**: Al abrir el modal/wizard de agregar transacción.

**Archivo**: Pendiente de implementar en componentes de UI  
**Sugerencia**: `src/components/TransactionWizard.vue` o similar

**Parámetros**:

```javascript
{
  business_id: string,
  day_id: string,
  ui_surface: string            // 'add_transaction_modal' | 'quick_action' | 'dashboard'
}
```

**Estado**: ⚠️ **Pendiente** - Requiere identificar componente exacto del wizard

---

#### 3. `transaction_created`

**Descripción**: Usuario crea exitosamente una transacción válida (income o expense).

**Cuándo se dispara**: Después de guardar la transacción en Firestore, **SOLO si type === 'income' || type === 'expense'**.

**Archivo**: `src/stores/transaction/transactionStore.js`  
**Función**: `addTransaction()`  
**Línea**: ~420

**Parámetros**:

```javascript
{
  business_id: string,
  day_id: string,
  transaction_type: 'income' | 'expense',  // NO 'transfer'
  amount: number,
  account: 'cash' | 'bank',
  source: 'manual',
  is_first_transaction_of_day: boolean
}
```

**Validación en GA4**:

- `transaction_type` NUNCA debe ser 'transfer', 'opening', 'closure', 'adjustment'
- `is_first_transaction_of_day` se calcula desde dailySummary.hasTxn

---

#### 4. `transaction_abandoned`

**Descripción**: Usuario abandona el flujo de crear transacción sin completarlo.

**Cuándo se dispara**: Al cerrar el modal, cancelar, o salir del wizard antes del paso final.

**Archivo**: Pendiente de implementar  
**Sugerencia**: Hook de cierre de modal o componente del wizard

**Parámetros**:

```javascript
{
  business_id: string,
  day_id: string,
  step: string,                 // Nombre del paso donde abandonó
  reason: string | null         // 'user_cancelled' | 'modal_closed' | null
}
```

**Estado**: ⚠️ **Pendiente** - Requiere implementar en componentes de UI

---

#### 5. `day_closed`

**Descripción**: Usuario cierra manualmente el día contable.

**Cuándo se dispara**: Después de crear exitosamente un evento de cierre tipo 'closure' con source='manual'.

**Archivo**: `src/stores/cashEventStore.js`  
**Función**: `performCashEvent(type='closure')`  
**Línea**: ~170

**Parámetros**:

```javascript
{
  business_id: string,
  day_id: string,
  source: 'manual',
  transactions_count: number,   // Solo income/expense
  net_result: 'positive' | 'negative' | 'zero'
}
```

**Cálculo de net_result**:

```javascript
const netTotal = expectedBalances.cash + expectedBalances.bank;
if (netTotal > 0) return "positive";
if (netTotal < 0) return "negative";
return "zero";
```

---

#### 6. `summary_viewed`

**Descripción**: Usuario visualiza el resumen del día.

**Cuándo se dispara**: Al cargar/mostrar el resumen del día (dashboard, vista de cuentas).

**Archivo**: Pendiente de implementar  
**Sugerencia**: `src/views/AccountsBalanceApp/AccountBalanceAppWrapper.vue`

**Parámetros**:

```javascript
{
  business_id: string,
  day_id: string,
  transactions_count: number,
  net_result: 'positive' | 'negative' | 'zero',
  streak_length: number | null  // Desde business.streak.current
}
```

**Estado**: ⚠️ **Pendiente** - Requiere implementar en vistas de resumen

---

### 🟧 Eventos Automáticos (Backend - Firebase Functions)

#### 1. `day_opened` (Automático)

**Descripción**: El sistema abre automáticamente el día cuando no existe apertura.

**Cuándo se dispara**: Después de ejecutar `executeAutoOpening()` exitosamente.

**Archivo**: `functions/src/AccountsBalance/autoOpening.js`  
**Función**: `executeAutoOpening()`  
**Línea**: ~395

**Parámetros**:

```javascript
{
  business_id: string,
  day_id: string,
  source: 'automatic'           // Siempre automático
}
```

**Prevención de duplicados**:

- Event ID: `${businessId}:${dayId}:day_opened:automatic`
- Se guarda en `businesses/{businessId}/analyticsEvents/{eventId}`

---

#### 2. `day_closed` (Automático)

**Descripción**: El sistema cierra automáticamente el día a las 23:59.

**Cuándo se dispara**: Después de crear la transacción de cierre automático en `scheduledAutoClose`.

**Archivo**: `functions/src/AccountsBalance/scheduledAutoClose.js`  
**Función**: Dentro del loop principal  
**Línea**: ~290

**Parámetros**:

```javascript
{
  business_id: string,
  day_id: string,
  source: 'automatic',
  transactions_count: number,
  net_result: 'positive' | 'negative' | 'zero'
}
```

**Trigger**: Cloud Scheduler (Pub/Sub) - Cron: `59 23 * * *` (Lima timezone)

---

#### 3. `streak_extended`

**Descripción**: La racha del usuario se incrementa por actividad consecutiva.

**Cuándo se dispara**: Cuando `updateStreakContextualizada()` detecta que newCurrent > current.

**Archivo**: `functions/src/Streak/streakManager.js`  
**Función**: `updateStreakContextualizada()`  
**Línea**: ~376

**Parámetros**:

```javascript
{
  business_id: string,
  day_id: string,
  streak_length: number,        // Nueva longitud de racha
  days_since_last_valid_transaction: number,
  trigger: 'transaction'
}
```

**Condiciones para incrementar racha**:

- Día tiene apertura (`hasOpening: true`)
- Día tiene transacción válida (`hasTxn: true`)
- Gap entre días activos ≤ `allowedGap`

---

#### 4. `streak_broken`

**Descripción**: La racha se rompe por inactividad prolongada.

**Cuándo se dispara**: Cuando el gap entre días activos excede `allowedGap`.

**Archivo**: `functions/src/Streak/streakManager.js`  
**Función**: `updateStreakContextualizada()`  
**Línea**: ~345

**Parámetros**:

```javascript
{
  business_id: string,
  day_id: string,
  previous_streak_length: number,
  days_without_transaction: number,  // Gap que rompió la racha
  reason: 'inactivity'
}
```

**Tolerancia de Racha** (desde `streakManager.js`):

- `MIN_ALLOWED_GAP = 5` días
- `MAX_ALLOWED_GAP = 14` días
- Fórmula dinámica: `allowedGap = Math.round(medianGap * 1.5)`

---

## Reglas de Negocio Críticas

### Transacción Válida para Racha

✅ **Cuenta para racha**:

- `type === 'income'`
- `type === 'expense'`

❌ **NO cuenta para racha**:

- `type === 'transfer'`
- `type === 'adjustment'`
- `type === 'opening'`
- `type === 'closure'`

**Implementación**:

```javascript
// Frontend: src/analytics/index.js
export function isValidTransactionForStreak(type) {
  return type === "income" || type === "expense";
}
```

---

### Día Activo

Un día es considerado **activo** cuando:

- `dailySummary.hasTxn === true`

Esto se calcula automáticamente en las Cloud Functions (`onTransactionWrite.js`) y significa que hubo al menos 1 transacción válida (income o expense, NO transfer).

---

### Racha (Streak)

**Incremento de Racha**:

1. Debe existir apertura del día (`hasOpening: true`)
2. Debe existir al menos 1 transacción válida (`hasTxn: true`)
3. El gap desde el último día activo debe ser ≤ `allowedGap`

**Ruptura de Racha**:

- Ocurre cuando el gap entre días activos > `allowedGap`
- El cierre automático NO rompe la racha si hubo transacciones
- La racha se resetea a 0 cuando se rompe

**Tolerancia**:

- Mínimo: 5 días
- Máximo: 14 días
- Se calcula dinámicamente según el ritmo del usuario (`medianGap * 1.5`)

---

## Configuración de Firebase Analytics

### Frontend (Web SDK)

**Archivo**: `src/analytics/index.js`

**Inicialización**:

```javascript
import { getAnalytics } from "firebase/analytics";
import appFirebase from "@/firebaseInit";

const analytics = getAnalytics(appFirebase);
```

**Condiciones**:

- Solo se inicializa si `window.location.hostname !== 'localhost'`
- En desarrollo se logea a consola sin enviar eventos reales

---

### Backend (Admin SDK)

**Archivo**: `functions/src/Helpers/analyticsHelper.js`

**Event ID Determinístico**:

```javascript
const eventId = `${businessId}:${dayId}:${eventName}:${source}`;
```

**Prevención de Duplicados**:

1. Generar event ID
2. Verificar si existe en `businesses/{businessId}/analyticsEvents/{eventId}`
3. Si existe → saltar
4. Si no existe → registrar y enviar

**Condiciones**:

- No enviar si `process.env.FUNCTIONS_EMULATOR === 'true'`

---

## Configuración del Usuario

### Setear User ID

**Cuándo**: Inmediatamente después de login exitoso

**Archivo**: `src/stores/authStore.js`  
**Función**: `login()`

```javascript
import { setAnalyticsUserId } from "@/analytics";

// Después de login exitoso
setAnalyticsUserId(); // Automáticamente usa auth.currentUser.uid
```

---

### Setear Business ID como User Property

**Recomendación**: Agregar en el momento en que el usuario selecciona/cambia de negocio.

```javascript
import { setAnalyticsUserProperties } from "@/analytics";

setAnalyticsUserProperties({
  business_id: currentBusinessId,
  plan: "free" | "premium",
  // Otras propiedades relevantes
});
```

**Estado**: ⚠️ **Pendiente** - Implementar cuando se selecciona negocio

---

## Validación en Producción

### Dashboard de GA4

1. **DebugView** (primeros días):

   - Habilitar debug mode en navegador
   - Verificar que eventos lleguen correctamente
   - Validar parámetros

2. **Eventos en Tiempo Real**:

   - Ir a GA4 → Realtime → Events
   - Verificar nombres de eventos
   - Validar parámetros custom

3. **Análisis de Eventos**:
   - GA4 → Events
   - Verificar count por evento
   - Crear conversiones para eventos clave

---

### Eventos Clave a Monitorear

| Evento                 | Métrica Clave                        | Objetivo             |
| ---------------------- | ------------------------------------ | -------------------- |
| `day_opened` (copilot) | Usuarios que abren día manualmente   | Disciplina diaria    |
| `transaction_created`  | Transacciones válidas por día        | Actividad real       |
| `day_closed` (copilot) | Usuarios que cierran día manualmente | Disciplina de cierre |
| `streak_extended`      | Longitud de racha promedio           | Compromiso sostenido |
| `streak_broken`        | Tasa de ruptura de racha             | Puntos de abandono   |

---

### Preguntas que el Sistema Puede Responder

1. **¿Quién entra en el ritual diario?**

   - Filtrar `day_opened` con `source: copilot`
   - Contar usuarios únicos por día

2. **¿Quién mantiene racha?**

   - Analizar `streak_extended`
   - Ver distribución de `streak_length`

3. **¿Cuándo y por qué se rompe la racha?**

   - `streak_broken` con `days_without_transaction`
   - Agrupar por rangos de gap

4. **¿Cuándo un usuario se vuelve "serio"?**

   - Usuarios con `streak_length >= 7`
   - Correlación con `net_result: positive`

5. **¿Qué impacto tiene el auto-cierre?**
   - Comparar `day_closed` con `source: automatic` vs `manual`
   - Ver efecto en racha

---

## Próximos Pasos

### Implementaciones Pendientes

1. ✅ **Wrapper centralizado de analytics** → Completado
2. ✅ **Tracking de apertura/cierre manual** → Completado
3. ✅ **Tracking de transacciones** → Completado
4. ⚠️ **Tracking de transaction_started** → Pendiente (identificar componente UI)
5. ⚠️ **Tracking de transaction_abandoned** → Pendiente (hook de cierre de modal)
6. ⚠️ **Tracking de summary_viewed** → Pendiente (implementar en vistas)
7. ✅ **Tracking de eventos automáticos (backend)** → Completado
8. ✅ **Tracking de racha (backend)** → Completado
9. ⚠️ **Setear businessId como user property** → Pendiente

---

### Mejoras Futuras

1. **Measurement Protocol**:

   - Configurar envío directo de eventos desde Functions a GA4
   - Requiere Measurement ID y API Secret

2. **Eventos Adicionales**:

   - `client_created` - Crear cliente
   - `payment_partial` - Pago parcial registrado
   - `inventory_updated` - Actualización de inventario
   - `report_generated` - Generación de reportes

3. **Dashboards Custom**:

   - Looker Studio con métricas de disciplina financiera
   - Reportes automatizados semanales

4. **A/B Testing**:
   - Usar Firebase Remote Config + Analytics
   - Probar variaciones de flujos

---

## Debugging

### Logs en Desarrollo

**Frontend**:

```javascript
// En src/analytics/index.js
// Modo desarrollo logea eventos sin enviar:
📊 [DEV] Analytics event: transaction_created { ... }
```

**Backend**:

```javascript
// En functions/src/Helpers/analyticsHelper.js
// Emuladores logean eventos:
📊 [EMULATOR] Analytics event: day_opened { ... }
```

---

### Verificar Eventos en Firestore

Los eventos del backend se guardan en:

```
businesses/{businessId}/analyticsEvents/{eventId}
```

Estructura:

```javascript
{
  eventName: 'day_opened',
  params: { ... },
  sentAt: Timestamp,
  eventId: '...'
}
```

Esto permite:

1. Auditar eventos enviados
2. Prevenir duplicados
3. Re-enviar eventos si es necesario

---

## Referencias

- [Firebase Analytics Web](https://firebase.google.com/docs/analytics/get-started?platform=web)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)

---

## Changelog

**2026-01-20**:

- ✅ Implementación inicial de analytics
- ✅ Eventos manuales en frontend (apertura, cierre, transacciones)
- ✅ Eventos automáticos en backend (auto-apertura, auto-cierre)
- ✅ Tracking de racha (extensión y ruptura)
- ✅ Seteo de userId en login
- ✅ Documentación completa

**Pendientes**:

- ⚠️ Eventos de UI (transaction_started, transaction_abandoned, summary_viewed)
- ⚠️ Seteo de businessId como user property
- ⚠️ Configuración de Measurement Protocol para envío directo desde Functions
