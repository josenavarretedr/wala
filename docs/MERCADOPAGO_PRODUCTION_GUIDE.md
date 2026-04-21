# 🚀 GUÍA DE DEPLOYMENT A PRODUCCIÓN - MERCADO PAGO

## ✅ CREDENCIALES CONFIGURADAS

> Tener credenciales cargadas no garantiza que Yape esté habilitado para cobrar.
> Antes de probar pagos con Yape, valida que el `MP_ACCESS_TOKEN` vea `yape` en `payment_methods/search` para `site_id=MPE`.

### 🔑 Producción

- **Public Key**: `APP_USR-168b04ae-9119-48e7-91bd-dc6a046acbfd`
- **Access Token**: `APP_USR-6078108162612691-012223-2e0e981864dc529290cbf88fdad8eeb2-1105396361`
- **Client ID**: `6078108162612691`
- **Client Secret**: `6opY02x8wFdxWWOHTJVU14mAEXcvOXav`

### 🧪 Test (para desarrollo local)

- **Public Key**: `TEST-d9db5058-7d42-47a5-a224-9a283c925466`
- **Access Token**: `TEST-6078108162612691-012223-23945092f601ffcbc51f95731a1da2d8-1105396361`

---

## 📁 ARCHIVOS MODIFICADOS

### ✅ Frontend

- ✅ `src/composables/useMercadoPago.js` - Ahora usa `VITE_MP_PUBLIC_KEY` de variables de entorno
- ✅ `.env.production` - Credenciales de producción
- ✅ `.env.development` - Credenciales TEST para desarrollo local

### ✅ Backend

- ✅ `functions/.env` - **Credenciales de PRODUCCIÓN** (para deploy)
- ✅ `functions/.env.local` - Credenciales TEST para desarrollo local (NO se sube a Git)

---

## 🔄 CÓMO FUNCIONA

### 🏠 Desarrollo Local (con emuladores)

```bash
# El backend usa functions/.env.local (credenciales TEST)
firebase emulators:start

# El frontend usa .env.development (credenciales TEST)
npm run dev
```

### 🌐 Producción (desplegado)

```bash
# El backend usa functions/.env (credenciales PRODUCCIÓN)
firebase deploy --only functions

# El frontend usa .env.production (credenciales PRODUCCIÓN)
npm run build
```

---

## 🚀 PASOS PARA DEPLOYMENT

### 1️⃣ Verificar Configuración Local

Antes de desplegar, asegúrate de que todo funciona en local con credenciales TEST:

```bash
# Terminal 1: Iniciar emuladores
cd functions
firebase emulators:start

# Terminal 2: Iniciar frontend
npm run dev
```

Prueba un pago con tarjeta TEST:

- **Tarjeta**: `5031 7557 3453 0604` (Mastercard)
- **Nombre**: `APRO`
- **DNI**: `123456789`
- **CVV**: `123`
- **Vencimiento**: `11/30`

---

### 2️⃣ Deploy del Backend (Firebase Functions)

```bash
cd functions

# Instalar dependencias
npm install --production

# Deploy
firebase deploy --only functions:payments
```

**Importante**: El archivo `functions/.env` tiene las credenciales de PRODUCCIÓN, así que el deploy usará esas.

Verifica el deploy:

```bash
# Ver logs
firebase functions:log --only payments

# Ver URL de la function
firebase functions:list
```

Tu endpoint estará en:

```
https://southamerica-east1-wala-lat.cloudfunctions.net/payments
```

---

### 3️⃣ Deploy del Frontend

```bash
# Build para producción (usa .env.production automáticamente)
npm run build

# Deploy a Firebase Hosting
firebase deploy --only hosting
```

O si usas otro servicio de hosting, sube la carpeta `dist/`.

---

### 4️⃣ Configurar Webhook en Mercado Pago

1. Ve a [Mercado Pago Webhooks](https://www.mercadopago.com.pe/developers/panel/webhooks)
2. Click en **"Crear webhook"**
3. Configuración:
   - **URL**: `https://southamerica-east1-wala-lat.cloudfunctions.net/payments/webhook`
   - **Eventos**: Selecciona `payment`
   - **Modo**: **Producción** ✅
4. Guarda el **Secret** generado (lo necesitarás para validar firmas)

---

### 5️⃣ Probar en Producción

**⚠️ IMPORTANTE**: Haz una prueba con un pago REAL de bajo monto antes de lanzar al público.

1. Abre tu sitio en producción
2. Navega a la página Premium
3. Selecciona el plan **Mensual (S/ 27)**
4. **Usa tu propia tarjeta de crédito/débito**
5. Completa el pago

**Verifica**:

- ✅ Pago procesado en [Mercado Pago → Ventas](https://www.mercadopago.com.pe/activities)
- ✅ Suscripción creada en Firestore (`businesses/{businessId}/subscriptions/`)
- ✅ Modal de éxito mostrado
- ✅ Logs en Firebase Functions (webhook recibido)

---

## 🔧 TROUBLESHOOTING

### ❌ Error: `yape_not_enabled_for_collector`

**Causa**: El `MP_ACCESS_TOKEN` del backend no tiene Yape habilitado para la cuenta/aplicación cobradora en Perú.

**Validación rápida (recomendada antes de pruebas):**

```bash
curl -H "Authorization: Bearer TU_MP_ACCESS_TOKEN" \
  "https://api.mercadopago.com/v1/payment_methods/search?site_id=MPE"
```

Si en `results` no aparece `id: yape`, ese token no podrá cobrar Yape (aunque el frontend genere token Yape correctamente).

**Chequeo de frontend (Public Key):**

```bash
curl "https://api.mercadopago.com/v1/payment_methods?public_key=TU_PUBLIC_KEY"
```

Debes ver `yape` activo en ambos lados (Public Key y Access Token) para que el flujo completo funcione.

**Solución**:

1. Habilitar Yape en la aplicación/cuenta correcta en Mercado Pago Developers.
2. Regenerar/usar credenciales de la misma aplicación (pareja Public Key + Access Token).
3. Reiniciar emuladores o redeploy de Functions para tomar el nuevo entorno.

### ❌ Error: "Invalid access token"

**Causa**: Las credenciales no están correctamente configuradas.

**Solución**:

```bash
# Verificar que functions/.env tiene las credenciales de producción
cat functions/.env | grep MP_
```

### ❌ Error: "CORS policy"

**Causa**: El frontend en producción no puede llamar a las functions.

**Solución**: Verifica que `VITE_FUNCTIONS_URL` en `.env.production` apunta a:

```
https://southamerica-east1-wala-lat.cloudfunctions.net
```

### ❌ Webhook no se recibe

**Causa**: La URL del webhook no está configurada en Mercado Pago.

**Solución**: Configurar webhook según el Paso 4️⃣.

---

## 🔐 SEGURIDAD

### ⚠️ NO SUBIR CREDENCIALES A GIT

Asegúrate de que `.gitignore` incluye:

```
.env
.env.local
.env.*.local
functions/.env
functions/.env.local
```

### ✅ Validar Firma del Webhook (Recomendado)

Edita `functions/src/Payments/webhookHandler.js`:

```javascript
const crypto = require("crypto");

const WEBHOOK_SECRET = "TU_SECRET_DEL_WEBHOOK"; // Del paso 4

function validateSignature(req) {
  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];
  const dataID = req.query["data.id"];

  const parts = xSignature.split(",");
  let ts, hash;

  parts.forEach((part) => {
    const [key, value] = part.split("=");
    if (key === "ts") ts = value;
    if (key === "v1") hash = value;
  });

  const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  hmac.update(manifest);
  const sha = hmac.digest("hex");

  return sha === hash;
}
```

---

## 📊 MONITOREO

### Firebase Console

- **Logs**: https://console.firebase.google.com/project/wala-lat/functions/logs
- **Firestore**: https://console.firebase.google.com/project/wala-lat/firestore

### Mercado Pago Dashboard

- **Ventas**: https://www.mercadopago.com.pe/activities
- **Webhooks**: https://www.mercadopago.com.pe/developers/panel/webhooks

---

## 🔔 CONFIGURAR WEBHOOKS EN PRODUCCIÓN

### 1. Obtener URL del Webhook

Tu URL de webhook en producción es:

```
https://southamerica-east1-wala-lat.cloudfunctions.net/payments/webhook
```

### 2. Configurar en Mercado Pago Dashboard

1. Ve a https://www.mercadopago.com.pe/developers/panel/webhooks
2. Asegúrate de estar en modo **PRODUCCIÓN** (toggle arriba a la derecha)
3. Clic en "Crear webhook"
4. Configura:
   - **URL**: `https://southamerica-east1-wala-lat.cloudfunctions.net/payments/webhook`
   - **Eventos**:
     - ✅ `payment.created`
     - ✅ `payment.updated`
5. Guarda
6. **IMPORTANTE**: Copia el **Secret** que aparece

### 3. Agregar Secret a Firebase

```bash
# Configurar el secret como variable de entorno
firebase functions:config:set mercadopago.webhook_secret="TU_SECRET_AQUI"

# Desplegar functions para aplicar cambios
firebase deploy --only functions:payments
```

O agrega a `functions/.env`:

```bash
MP_WEBHOOK_SECRET=tu_webhook_secret_aqui
```

### 4. Verificar Funcionamiento

Después de hacer un pago de prueba, verifica:

1. **Logs en Firebase**: Busca mensajes con "📬 Webhook recibido"
2. **Colección `webhookEvents`**: Debe tener el evento guardado
3. **Documento `business`**: Debe actualizarse con `premium: true`

---

## ✅ CHECKLIST FINAL

Antes de lanzar:

- [ ] ✅ Credenciales de producción en `functions/.env`
- [ ] ✅ Public Key en `.env.production`
- [ ] ✅ Functions desplegadas (`firebase deploy --only functions:payments`)
- [ ] ✅ Frontend desplegado (`firebase deploy --only hosting`)
- [ ] ✅ Webhook configurado en Mercado Pago (modo Producción)
- [ ] ✅ MP_WEBHOOK_SECRET configurado en Firebase
- [ ] ✅ Pago de prueba con plan TEST (S/ 5) completado exitosamente
- [ ] ✅ Webhook recibido y procesado correctamente
- [ ] ✅ Suscripción verificada en Firestore
- [ ] ✅ Logs verificados sin errores
- [ ] ✅ Modal de éxito funcionando
- [ ] ✅ Email de confirmación de Mercado Pago recibido

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Una vez completado el checklist, tu sistema de pagos está listo para recibir pagos reales.

**Soporte**: Si tienes problemas, revisa los logs en Firebase Console o contacta a soporte de Mercado Pago.

---

## Changelog

### [Auditoría - Marzo 2026]

- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.
