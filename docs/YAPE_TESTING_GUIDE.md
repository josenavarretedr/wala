# 📱 Guía de Testing - Yape Payment

## 🎯 Resumen

Esta guía describe cómo probar la integración de pagos con **Yape** usando Checkout API de Mercado Pago.

---

## 🧪 TARJETAS DE PRUEBA YAPE

Para probar la integración de Yape **sin usar dinero real**, usa los siguientes números de celular y OTP:

### ✅ Pagos Aprobados

| Celular   | OTP    | Estado esperado |
| --------- | ------ | --------------- |
| 111111111 | 123456 | `approved` ✅   |

### ❌ Pagos Rechazados

| Celular   | OTP    | Estado esperado                        | Error                          |
| --------- | ------ | -------------------------------------- | ------------------------------ |
| 111111112 | 123456 | `cc_rejected_call_for_authorize`       | Debe autorizar el pago en app  |
| 111111113 | 123456 | `cc_rejected_insufficient_amount`      | Saldo insuficiente             |
| 111111114 | 123456 | `cc_rejected_other_reason`             | Pago rechazado (razón general) |
| 111111115 | 123456 | `cc_rejected_card_type_not_allowed`    | Método de pago no permitido    |
| 111111116 | 123456 | `cc_rejected_max_attempts`             | Excediste intentos máximos     |
| 111111117 | 123456 | `cc_rejected_bad_filled_security_code` | Código OTP inválido            |
| 111111118 | 123456 | `cc_rejected_form_error`               | Error en formulario            |

---

## 🔄 FLUJO DE PRUEBA COMPLETO

### 1️⃣ Iniciar Emuladores Locales

```bash
# Terminal 1: Backend
cd functions
firebase emulators:start

# Terminal 2: Frontend
npm run dev
```

### 2️⃣ Navegar a Premium

1. Abre http://localhost:5173
2. Inicia sesión
3. Ve a tu negocio
4. Click en **Premium** en el menú

### 3️⃣ Seleccionar Plan y Método de Pago

Planes disponibles:

- 🧪 **Prueba**: S/ 5 (7 días) - Recomendado para testing en producción
- 📅 **Mensual**: S/ 27 (30 días)
- 🔥 **Anual**: S/ 200 (365 días) - Más Popular
- ⭐ **Lifetime**: S/ 400 (De por vida)

1. Selecciona el plan **Prueba (S/ 5)** para testing
2. Click en **"Continuar al Pago"**
3. En el modal, selecciona el tab **📱 Yape**

### 4️⃣ Probar Pago Exitoso

**Datos a ingresar:**

```
Número de celular: 111111111
Código OTP: 123456
```

**Resultado esperado:**

- ✅ Pago procesado correctamente
- ✅ Modal de éxito mostrado
- ✅ Suscripción activada en Firestore
- ✅ Console log en backend: `🎉 PAGO YAPE PROCESADO CORRECTAMENTE`
- ✅ Plan: "Premium Prueba", Monto: S/ 5.00
- ✅ Expiración en 7 días

### 5️⃣ Probar Rechazo por Saldo Insuficiente

**Datos a ingresar:**

```
Número de celular: 111111113
Código OTP: 123456
```

**Resultado esperado:**

- ❌ Error: "Saldo insuficiente en tu cuenta Yape"
- ❌ No se crea suscripción

### 6️⃣ Probar OTP Inválido

**Datos a ingresar:**

```
Número de celular: 111111117
Código OTP: 123456
```

**Resultado esperado:**

- ❌ Error: "Código OTP inválido"
- ❌ No se crea suscripción

---

## 🔍 VERIFICACIÓN DE LOGS

### Frontend (Navegador)

Abre DevTools → Console y busca:

**Al generar token:**

```
🔐 Generando token Yape...
✅ Token Yape generado: 45d013f72bf42717a1625...
```

**Al procesar pago:**

```
📱 Iniciando pago con Yape...
💳 Procesando pago Yape...
✅ Pago Yape completado: {paymentId: "123456", status: "approved"}
```

### Backend (Firebase Functions)

En la terminal de emuladores, busca:

**Cuando llega la solicitud:**

```
📱 Procesando pago Yape: {
  businessId: 'BODEGA-xxx',
  planType: 'monthly',
  phoneNumber: '111XXX111',
  userId: 'abc123'
}
```

**Cuando se crea el pago:**

```
💳 Creando pago Yape: {
  businessId: 'BODEGA-xxx',
  planType: 'monthly',
  amount: 27,
  phoneNumber: '111XXX111'
}
```

**Al aprobar:**

```
🎉 PAGO YAPE PROCESADO CORRECTAMENTE: {
  paymentId: 1234567890,
  businessId: 'BODEGA-xxx',
  planType: 'monthly',
  amount: 27
}
```

---

## 📊 VERIFICACIÓN EN FIRESTORE

Después de un pago exitoso, verifica en Firebase Console:

**Ruta:** `businesses/{businessId}`

**Campos actualizados:**

```javascript
{
  isPremium: true,
  subscription: {
    status: "active",
    plan: "monthly",
    planName: "Premium Mensual",
    amount: 27,
    paymentMethod: "yape",
    paymentId: "1234567890",
    externalReference: "business_BODEGA-xxx_yape_monthly_1234567890",
    activatedAt: Timestamp,
    expiresAt: Timestamp, // null si es lifetime
    autoRenew: false,
    lastPaymentDate: Timestamp,
    lastPaymentStatus: "approved",
    updatedAt: Timestamp
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Error: "SDK de Mercado Pago no cargado"

**Causa:** El script de Mercado Pago no se cargó correctamente.

**Solución:**

1. Verifica que `index.html` tiene el script:
   ```html
   <script src="https://sdk.mercadopago.com/js/v2"></script>
   ```
2. Recarga la página con Ctrl+F5

### Error: "Usuario no autenticado"

**Causa:** El token de Firebase Auth expiró.

**Solución:**

1. Cierra sesión
2. Vuelve a iniciar sesión

### Error: "Token de Yape inválido"

**Causa:** El OTP o número de celular es incorrecto.

**Solución:**

- Verifica que el número tenga exactamente 9 dígitos
- Verifica que el OTP tenga exactamente 6 dígitos
- Usa uno de los números de prueba de la tabla

### Pago aprobado pero suscripción no se activa

**Causa:** Error al actualizar Firestore.

**Solución:**

1. Verifica logs del backend
2. Revisa permisos de Firestore
3. Verifica que el `businessId` existe en Firestore

---

## ✅ CHECKLIST DE TESTING

Antes de marcar como completo, verifica:

- [ ] ✅ Pago exitoso con 111111111
- [ ] ❌ Rechazo por saldo insuficiente (111111113)
- [ ] ❌ Rechazo por OTP inválido (111111117)
- [ ] ❌ Rechazo por exceso de intentos (111111116)
- [ ] ✅ Modal de éxito se muestra correctamente
- [ ] ✅ Modal de error se muestra con mensaje apropiado
- [ ] ✅ Suscripción se crea en Firestore
- [ ] ✅ Campo `isPremium` se actualiza a `true`
- [ ] ✅ Logs en backend sin errores
- [ ] ✅ Tabs de pago (Tarjeta/Yape) funcionan correctamente
- [ ] ✅ Validaciones de formulario (9 dígitos celular, 6 dígitos OTP)

---

## 🚀 PRÓXIMOS PASOS

Una vez que todos los tests pasen:

1. **Deploy a producción:**

   ```bash
   npm run deploy:functions
   npm run deploy
   ```

2. **Probar con Yape real:**

   - Usa tu propio número de celular
   - Genera OTP real en la app Yape
   - Prueba con el plan más económico (S/ 27)

3. **Monitorear:**
   - Revisa logs en Firebase Console
   - Verifica pagos en Mercado Pago Dashboard

---

## 📚 REFERENCIAS

- [Documentación oficial de Yape - Mercado Pago](https://www.mercadopago.com.pe/developers/es/docs/checkout-api-payments/integration-configuration/yape)
- [Tarjetas de prueba Perú](https://www.mercadopago.com.pe/developers/es/docs/checkout-api-payments/additional-content/your-integrations/test/cards)
- [Guía de producción](./MERCADOPAGO_PRODUCTION_GUIDE.md)


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

