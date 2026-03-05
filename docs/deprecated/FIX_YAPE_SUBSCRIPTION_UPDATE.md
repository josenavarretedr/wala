>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# 🔧 FIX: Actualización de Suscripción con Yape

## Problema Identificado

Los pagos con Yape **no estaban actualizando correctamente** la suscripción del business en Firestore. El sistema guardaba datos, pero la estructura era inconsistente con los pagos con tarjeta.

## Causa Raíz

### 1. Estructura de Datos Inconsistente

**yapeService.js (ANTES):**

```javascript
const subscriptionData = {
  status: "active",
  plan: planType, // ❌ Diferente de tarjetas
  planName: plan.name, // ❌ Campo extra innecesario
  amount: plan.amount,
  paymentMethod: "yape",
  paymentId: payment.id.toString(),
  externalReference: externalReference,
  activatedAt: now, // ❌ Debería ser startDate
  expiresAt: expiresAt, // ❌ Debería ser endDate
  autoRenew: false,
  lastPaymentDate: now, // ❌ Campo innecesario
  lastPaymentStatus: payment.status, // ❌ Campo innecesario
  updatedAt: now,
};

await businessRef.update({
  subscription: subscriptionData,
  isPremium: true, // ❌ Campo inconsistente
  updatedAt: now,
});
```

**paymentService.js (CORRECTO):**

```javascript
const subscriptionData = {
  plan: "premium", // ✅ Siempre 'premium'
  planType: planType, // ✅ Tipo específico
  status: "active",
  amount: plan.amount,
  currency: plan.currency,
  paymentMethod: "mercadopago",
  transactionId: payment.id.toString(),
  startDate: now, // ✅ Fecha de inicio
  endDate: endDate, // ✅ Fecha de fin
  autoRenew: false,
  externalReference: externalReference,
  updatedAt: now,
};

await admin.firestore().collection("businesses").doc(businessId).update({
  subscription: subscriptionData, // ✅ Solo actualiza subscription
  updatedAt: now,
});
```

### 2. Colección Incorrecta en webhookHandler.js

```javascript
// ❌ ANTES (webhookHandler.js)
const businessRef = db.collection("business").doc(businessId);

// ✅ DESPUÉS
const businessRef = db.collection("businesses").doc(businessId);
```

La colección se llama **`businesses`** (plural), no `business` (singular).

### 3. Falta de Registro en Historial

El yapeService.js **no estaba creando** el registro en la subcolección `subscriptions` para mantener un historial de pagos.

---

## Solución Implementada

### ✅ Cambios en yapeService.js

```javascript
async function activateYapeSubscription(
  businessId,
  planType,
  payment,
  externalReference
) {
  try {
    const plan = PLANS[planType];
    const db = admin.firestore();
    const now = Timestamp.now();

    // Calcular fecha de expiración
    let endDate = null;
    if (plan.durationDays) {
      const endDateTime = new Date();
      endDateTime.setDate(endDateTime.getDate() + plan.durationDays);
      endDate = Timestamp.fromDate(endDateTime);
    }

    // ✅ Estructura idéntica a paymentService.js
    const subscriptionData = {
      plan: "premium",
      planType: planType,
      status: "active",
      amount: plan.amount,
      currency: "PEN",
      paymentMethod: "yape",
      transactionId: payment.id.toString(),
      startDate: now,
      endDate: endDate,
      autoRenew: false,
      externalReference: externalReference,
      updatedAt: now,
    };

    // ✅ Actualizar documento del negocio
    await db.collection("businesses").doc(businessId).update({
      subscription: subscriptionData,
      updatedAt: now,
    });

    // ✅ Crear registro en subcolección de historial
    await db
      .collection("businesses")
      .doc(businessId)
      .collection("subscriptions")
      .add({
        planType: planType,
        amount: plan.amount,
        currency: "PEN",
        status: "approved",
        mpPaymentId: payment.id.toString(),
        mpStatus: payment.status,
        mpStatusDetail: payment.status_detail,
        externalReference: externalReference,
        paymentMethodId: "yape",
        createdAt: now,
        metadata: {
          phoneNumber: payment.metadata?.phone_number || null,
          payerEmail: payment.payer?.email || null,
        },
      });

    console.log("✅ Suscripción activada:", {
      businessId,
      planType,
      endDate: endDate ? endDate.toDate() : "LIFETIME",
    });

    return subscriptionData;
  } catch (error) {
    console.error("❌ Error activando suscripción:", error);
    throw error;
  }
}
```

### ✅ Cambios en webhookHandler.js

```javascript
// Corrección de nombre de colección
const businessRef = db.collection("businesses").doc(businessId); // ✅ Plural
```

---

## Estructura de Datos Unificada

### Documento: `businesses/{businessId}`

```javascript
{
  subscription: {
    plan: 'premium',              // Siempre 'premium'
    planType: 'test',             // test | monthly | yearly | lifetime
    status: 'active',             // active | expired | cancelled
    amount: 5.00,                 // Monto pagado
    currency: 'PEN',              // Moneda
    paymentMethod: 'yape',        // yape | mercadopago
    transactionId: '123456789',   // ID del pago en Mercado Pago
    startDate: Timestamp,         // Fecha de inicio
    endDate: Timestamp,           // Fecha de fin (null para lifetime)
    autoRenew: false,             // Renovación automática
    externalReference: 'business_ABC_test_1234567890',
    updatedAt: Timestamp
  },
  updatedAt: Timestamp
}
```

### Subcolección: `businesses/{businessId}/subscriptions/{docId}`

```javascript
{
  planType: 'test',
  amount: 5.00,
  currency: 'PEN',
  status: 'approved',             // approved | rejected | pending
  mpPaymentId: '123456789',
  mpStatus: 'approved',
  mpStatusDetail: 'accredited',
  externalReference: 'business_ABC_test_1234567890',
  paymentMethodId: 'yape',        // yape | master | visa | etc
  createdAt: Timestamp,
  metadata: {
    phoneNumber: '987654321',     // Solo para Yape
    payerEmail: 'user@email.com',
    cardLastFourDigits: '1234'    // Solo para tarjetas
  }
}
```

---

## Comparación ANTES vs DESPUÉS

### Yape Payment (ANTES)

```javascript
// ❌ Estructura inconsistente
businesses/{businessId}
{
  subscription: {
    status: 'active',
    plan: 'test',                    // ❌ Inconsistente
    planName: 'Premium Prueba',      // ❌ Redundante
    activatedAt: Timestamp,          // ❌ Debería ser startDate
    expiresAt: Timestamp,            // ❌ Debería ser endDate
    lastPaymentDate: Timestamp,      // ❌ Innecesario
  },
  isPremium: true                    // ❌ Campo extra
}

// ❌ No había historial en subscriptions
```

### Yape Payment (DESPUÉS)

```javascript
// ✅ Estructura unificada
businesses/{businessId}
{
  subscription: {
    plan: 'premium',                 // ✅ Consistente
    planType: 'test',                // ✅ Tipo específico
    status: 'active',
    amount: 5.00,
    currency: 'PEN',
    paymentMethod: 'yape',
    transactionId: '123456789',
    startDate: Timestamp,            // ✅ Consistente
    endDate: Timestamp,              // ✅ Consistente
    autoRenew: false,
    externalReference: 'business_ABC_test_1234567890',
    updatedAt: Timestamp
  },
  updatedAt: Timestamp
}

// ✅ Historial guardado en subscriptions
businesses/{businessId}/subscriptions/{docId}
{
  planType: 'test',
  amount: 5.00,
  mpPaymentId: '123456789',
  paymentMethodId: 'yape',
  metadata: { phoneNumber: '987654321' }
}
```

---

## Testing

### 1. Probar Pago con Yape (Local)

```bash
# Iniciar emulators
firebase emulators:start

# Hacer pago de prueba
# Plan: Prueba (S/ 5)
# Celular: 111111111
# OTP: 123456
```

### 2. Verificar en Firestore

**Verificar documento principal:**

```javascript
// businesses/{businessId}
{
  subscription: {
    plan: 'premium',
    planType: 'test',
    status: 'active',
    amount: 5.00,
    currency: 'PEN',
    paymentMethod: 'yape',
    startDate: Timestamp(ahora),
    endDate: Timestamp(+7 días)
  }
}
```

**Verificar historial:**

```javascript
// businesses/{businessId}/subscriptions/{docId}
{
  planType: 'test',
  amount: 5.00,
  status: 'approved',
  paymentMethodId: 'yape'
}
```

### 3. Comparar con Pago con Tarjeta

Ambos métodos de pago ahora generan **exactamente la misma estructura**, solo cambia:

- `paymentMethod`: `'yape'` vs `'mercadopago'`
- `paymentMethodId`: `'yape'` vs `'master'`/`'visa'`
- `metadata`: `phoneNumber` (Yape) vs `cardLastFourDigits` (Tarjetas)

---

## Archivos Modificados

- ✅ [functions/src/Payments/yapeService.js](../functions/src/Payments/yapeService.js)
  - Función `activateYapeSubscription()` completamente reescrita
  - Estructura de datos unificada con `paymentService.js`
  - Agregado registro en subcolección `subscriptions`
- ✅ [functions/src/Payments/webhookHandler.js](../functions/src/Payments/webhookHandler.js)
  - Corrección de colección: `business` → `businesses`

---

## Beneficios

1. ✅ **Consistencia**: Misma estructura para todos los métodos de pago
2. ✅ **Historial**: Se guarda cada pago en subcolección `subscriptions`
3. ✅ **Debugging**: Más fácil rastrear y debuggear problemas
4. ✅ **Escalabilidad**: Fácil agregar nuevos métodos de pago
5. ✅ **Mantenimiento**: Código más limpio y fácil de mantener

---

## Próximos Pasos

1. ✅ Desplegar a producción: `firebase deploy --only functions:payments`
2. ✅ Probar pago con Yape en producción (S/ 5)
3. ✅ Verificar que `subscription` se actualice correctamente
4. ✅ Verificar que aparezca en historial `subscriptions`
5. ✅ Comparar resultado con pago con tarjeta

---

**Fecha:** 25 de enero de 2026  
**Estado:** ✅ Corregido y listo para deployment
