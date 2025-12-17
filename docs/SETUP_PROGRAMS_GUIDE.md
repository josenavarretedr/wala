# 🚀 Guía de Setup del Módulo "Juntos"

## 📋 Descripción

Esta guía te ayudará a ejecutar el script de setup para poblar Firebase Firestore con datos de prueba del módulo "Juntos" (Programas de Acompañamiento Empresarial).

---

## ✅ Pre-requisitos

Antes de ejecutar el script, asegúrate de tener:

- ✅ **Node.js** instalado (versión 14 o superior)
- ✅ **Firebase CLI** instalado (`npm install -g firebase-tools`)
- ✅ **Service Account Key** descargado y guardado como `wala-lat-firebase-adminsdk.json`
- ✅ **Business existente** en Firestore con tu usuario como gerente
- ✅ Dependencias instaladas en `/functions`:

```bash
cd functions
npm install firebase-admin
```

---

## 📥 Obtener Service Account Key

Si aún no tienes el archivo `wala-lat-firebase-adminsdk.json`:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "wala"
3. Click en ⚙️ **Project Settings** (esquina superior izquierda)
4. Pestaña **Service Accounts**
5. Click en **Generate New Private Key**
6. Guarda el archivo descargado como `wala-lat-firebase-adminsdk.json` en la carpeta `functions/`

⚠️ **IMPORTANTE:** Este archivo contiene credenciales sensibles. **NUNCA lo subas a Git**. Ya está incluido en `.gitignore`.

---

## 🚀 Ejecutar el Script

### Paso 1: Navegar a la carpeta functions

```bash
cd functions
```

### Paso 2: Ejecutar el script

```bash
node scripts/setupProgramsDemo.js
```

### Paso 3: Verificar el output

Deberías ver algo como:

```
══════════════════════════════════════════════════════════════════
🚀 INICIANDO SETUP DEL MÓDULO JUNTOS
══════════════════════════════════════════════════════════════════

✅ Firebase Admin inicializado correctamente
📋 PASO 1: Creando programa de prueba...
✅ Programa creado: DEMO-CARE-2025
  📝 Nombre: Fortalecimiento Empresarial - Demo
  🏢 Organización: CARE Perú

🎫 PASO 2: Creando códigos de invitación...
✅ Código creado: PRUEBA2025
  🔑 Hash: 8f3a5b2c1d9e4f7a...
  📊 Usos: 100
  📅 Expira: 31/12/2025

👤 PASO 3: Agregando facilitador...
✅ Facilitador agregado: d4RY5u8MGA7EOvWfLlWMRzZPBawI
  📧 Email: josenavarretedr@gmail.com

🏪 PASO 4: Validando negocio existente...
✅ Business encontrado: CAFETERIA-dc64ed74
✅ Usuario es gerente. Puede unirse a programas.

══════════════════════════════════════════════════════════════════
🎉 SETUP COMPLETADO EXITOSAMENTE
══════════════════════════════════════════════════════════════════
```

---

## 🧪 Probar el Flujo en la App

Ahora que los datos están creados:

1. **Inicia sesión** en la app con tu cuenta (josenavarretedr@gmail.com)
2. **Selecciona el negocio** CAFETERIA-dc64ed74
3. Ve al **sidebar** y haz clic en **"Juntos" 🤝**
4. Deberías ver la pantalla vacía (sin programas activos)
5. Haz clic en **"Unirme a un Programa"**
6. Ingresa el código: **PRUEBA2025**
7. Deberías ver un mensaje de éxito
8. El programa "Fortalecimiento Empresarial - Demo" aparecerá en la lista
9. Haz clic para ver el detalle del programa

---

## 🎫 Códigos Disponibles

El script crea 3 códigos de invitación:

| Código       | Usos Máximos | Expiración | Uso Recomendado    |
| ------------ | ------------ | ---------- | ------------------ |
| `PRUEBA2025` | 100          | 31/12/2025 | Testing principal  |
| `DEMO2025`   | 50           | 31/12/2025 | Demos con clientes |
| `CARE2025`   | Ilimitado    | Nunca      | Producción         |

---

## 🔐 Desplegar Reglas de Firestore

**⚠️ CRÍTICO:** Las reglas de seguridad de Firestore DEBEN estar desplegadas para que el módulo funcione correctamente.

### Verificar que la regla temporal está comentada

Abre [`firestore.rules`](../firestore.rules) y verifica que al final esté comentado:

```javascript
// ⚠️ REGLA TEMPORAL DE DESARROLLO - COMENTADA PARA PRODUCCIÓN
// match /{document=**} {
//   allow read, write: if true;
// }
```

### Desplegar las reglas

```bash
firebase deploy --only firestore:rules
```

Deberías ver:

```
✔  Deploy complete!
```

---

## 🔍 Validación Post-Setup

Verifica manualmente en [Firebase Console](https://console.firebase.google.com/) que:

### 1. Collection Programs existe

```
Firestore Database → programs → DEMO-CARE-2025
```

Campos esperados:

- `name`: "Fortalecimiento Empresarial - Demo"
- `organizationName`: "CARE Perú"
- `isActive`: true
- `createdAt`: timestamp

### 2. Subcollection Invites

```
programs → DEMO-CARE-2025 → invites
```

Deberías ver 3 documentos:

- `invite-prueba2025`
- `invite-demo2025`
- `invite-care2025`

### 3. Subcollection Staff

```
programs → DEMO-CARE-2025 → staff → d4RY5u8MGA7EOvWfLlWMRzZPBawI
```

Campos esperados:

- `role`: "facilitator"
- `permissions.canCreateAssessments`: true

---

## 🐛 Troubleshooting

### Error: "Cannot find module '../wala-lat-firebase-adminsdk.json'"

**Solución:** El archivo Service Account no existe. Descárgalo siguiendo los pasos en "Obtener Service Account Key".

### Error: "Business CAFETERIA-dc64ed74 no existe"

**Solución:**

1. Ve a Firebase Console → Firestore
2. Busca en `businesses` tu negocio
3. Verifica que el ID coincida con el esperado
4. Si es diferente, edita el script `setupProgramsDemo.js` línea 52:
   ```javascript
   businessId: "TU_BUSINESS_ID_REAL";
   ```

### Error: "Usuario NO es gerente"

**Solución:**

1. Ve a Firebase Console → Firestore
2. Navega a: `users/{tu_uid}/businesses/{businessId}`
3. Verifica que el campo `rol` sea `"gerente"`
4. Si no lo es, edítalo manualmente o crea un nuevo negocio donde seas gerente

### Error: "Permission denied" al ejecutar Cloud Function

**Solución:** Las reglas de Firestore no están desplegadas. Ejecuta:

```bash
firebase deploy --only firestore:rules
```

### El código "PRUEBA2025" dice "Código inválido"

**Solución:** El hash SHA-256 puede no coincidir. Verifica en Firestore Console:

```
programs → DEMO-CARE-2025 → invites → invite-prueba2025 → codeHash
```

Debería ser: `sha256("PRUEBA2025")`

Puedes regenerarlo en Node.js:

```javascript
const crypto = require("crypto");
const hash = crypto.createHash("sha256").update("PRUEBA2025").digest("hex");
console.log(hash);
```

---

## 🗑️ Limpiar Datos de Prueba

Si necesitas empezar desde cero:

### Opción A: Manualmente en Firebase Console

1. Ve a Firestore Database
2. Elimina: `programs/DEMO-CARE-2025` (eliminará subcollections automáticamente)
3. Vuelve a ejecutar el script

### Opción B: Script de limpieza (crear si es necesario)

```javascript
// functions/scripts/cleanupDemo.js
const admin = require("firebase-admin");
const serviceAccount = require("../wala-lat-firebase-adminsdk.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function cleanup() {
  await db.collection("programs").doc("DEMO-CARE-2025").delete();
  console.log("✅ Datos de prueba eliminados");
  process.exit(0);
}

cleanup();
```

```bash
node scripts/cleanupDemo.js
```

---

## 📚 Recursos Adicionales

- [Documentación del Módulo Juntos](./MODULO_JUNTOS_RESUMEN.md)
- [Firestore Rules](../firestore.rules)
- [Cloud Function: joinProgramByCode](../functions/index.js)
- [Frontend Store: programStore](../src/stores/programStore.js)

---

## ❓ Soporte

Si encuentras problemas:

1. Revisa los logs del script
2. Verifica las reglas de Firestore están desplegadas
3. Confirma que tu usuario es gerente del business
4. Revisa la consola de Firebase Console para errores de permisos

---

**¡Listo! 🎉 Ahora puedes probar el módulo "Juntos" end-to-end.**
