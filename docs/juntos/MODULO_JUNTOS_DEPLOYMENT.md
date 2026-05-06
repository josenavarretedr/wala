# 🚀 MÓDULO "JUNTOS" - GUÍA DE DEPLOYMENT

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha implementado exitosamente el módulo "Juntos" para programas de acompañamiento empresarial.

---

## 📁 ARCHIVOS CREADOS

### **Backend (Cloud Functions)**

- ✅ `functions/src/Programs/joinProgramByCode.js` - Cloud Function para unirse a programas
- ✅ `functions/index.js` - Exportación de la función (modificado)

### **Frontend (Stores y Composables)**

- ✅ `src/stores/programStore.js` - Pinia store para gestión de programas
- ✅ `src/composables/usePrograms.js` - Composable para interactuar con programas

### **Frontend (Vistas)**

- ✅ `src/views/business/programs/ProgramsHub.vue` - Vista principal (lista de programas)
- ✅ `src/views/business/programs/JoinProgramModal.vue` - Modal para unirse por código
- ✅ `src/views/business/programs/ProgramDetail.vue` - Vista de detalle de programa

### **Configuración**

- ✅ `src/router/index.js` - Rutas agregadas (modificado)
- ✅ `src/layouts/MainLayout.vue` - Ícono "Juntos" agregado (modificado)
- ✅ `firestore.rules` - Reglas de seguridad actualizadas (modificado)

---

## 🔧 PASOS DE DEPLOYMENT

### **1. Instalar dependencias (si es necesario)**

```bash
cd functions
npm install
```

### **2. Deploy Cloud Functions**

```bash
# Desde la raíz del proyecto
firebase deploy --only functions:joinProgramByCode
```

### **3. Deploy Reglas de Firestore**

```bash
firebase deploy --only firestore:rules
```

### **4. Verificar Frontend**

El frontend ya está listo. Solo necesitas:

```bash
npm run dev
```

---

## 🗄️ ESTRUCTURA DE DATOS FIRESTORE

### **Crear un Programa de Prueba**

Desde la consola de Firebase, crea un documento en `/programs`:

```javascript
// /programs/PROGRAMA-TEST-001
{
  id: "PROGRAMA-TEST-001",
  name: "Programa de Prueba CARE",
  organizationName: "CARE Perú",
  description: "Programa de acompañamiento empresarial para emprendedores",
  isActive: true,
  createdAt: [Timestamp actual],
  createdBy: "admin-uid"
}
```

### **Crear un Código de Invitación**

Crea un documento en `/programs/PROGRAMA-TEST-001/invites`:

```javascript
// /programs/PROGRAMA-TEST-001/invites/invite-001
{
  code: "PRUEBA2025",
  codeHash: "a3d5f8b2c1e9...",  // SHA-256 de "PRUEBA2025"
  maxUses: 10,
  currentUses: 0,
  expiresAt: [Timestamp del 31/12/2025],
  isActive: true
}
```

Para generar el `codeHash`, usa este código en Node.js:

```javascript
const crypto = require("crypto");
const code = "PRUEBA2025";
const hash = crypto.createHash("sha256").update(code).digest("hex");
console.log(hash);
```

### **Crear un Staff (Facilitador) - Opcional**

```javascript
// /programs/PROGRAMA-TEST-001/staff/{uid-del-facilitador}
{
  role: "facilitator",
  addedAt: [Timestamp actual],
  permissions: {}
}
```

---

## 🧪 TESTING

### **Flujo de Testing Completo**

1. **Login como Gerente**

   - Inicia sesión con un usuario que tenga rol "gerente" en un negocio

2. **Acceder al Módulo Juntos**

   - En el sidebar, haz clic en el ícono "Juntos" (icono de grupos)

3. **Unirse a un Programa**

   - Haz clic en "Unirme a un Programa"
   - Ingresa el código: `PRUEBA2025`
   - Haz clic en "Unirme"

4. **Verificar en Firestore**

   - Debe crearse: `/programs/PROGRAMA-TEST-001/memberships/{businessId}`
   - Debe crearse: `/users/{uid}/programs/PROGRAMA-TEST-001`

5. **Ver Detalle del Programa**

   - Haz clic en la tarjeta del programa
   - Verifica que se muestre la información correcta

6. **Salir del Programa (Opt-out)**
   - En el detalle del programa, haz clic en "Salir del Programa"
   - Confirma la acción
   - Verifica que el status cambie a "left"

### **Casos de Error a Probar**

1. **Código Inválido**

   - Intenta unirte con código: `INVALIDO123`
   - Debe mostrar: "Código de invitación inválido o inactivo"

2. **Usuario No Gerente**

   - Login con un usuario empleado
   - Intenta unirse a un programa
   - Debe mostrar: "Solo los gerentes pueden unir el negocio a programas"

3. **Ya Afiliado**

   - Intenta unirte al mismo programa dos veces
   - Debe mostrar: "Tu negocio ya está participando en el programa"

4. **Código Expirado**
   - Crea un invite con `expiresAt` en el pasado
   - Intenta unirte
   - Debe mostrar: "El código de invitación expiró el..."

---

## 🔒 VALIDACIONES DE SEGURIDAD

### **✅ Verificar que ONGs NO puedan acceder a datos financieros**

1. Crea un usuario staff (facilitador)
2. Intenta leer desde consola de Firebase:

   - `/businesses/{businessId}/transactions/{txId}` ❌ Debe fallar
   - `/businesses/{businessId}/products/{productId}` ❌ Debe fallar
   - `/businesses/{businessId}/clients/{clientId}` ❌ Debe fallar

3. Sí debe poder leer:
   - `/programs/{programId}/memberships/{businessId}` ✅
   - `/programs/{programId}/memberships/{businessId}/assessments/{assessmentId}` ✅

### **✅ Verificar opt-out funcional**

1. Como usuario participante, actualiza:

   ```javascript
   // /programs/{programId}/memberships/{businessId}
   {
     status: "left",
     leftAt: [Timestamp actual]
   }
   ```

2. Debe permitirse (regla de Firestore permite esta operación)

---

## 📊 QUERIES IMPORTANTES

### **Ver programas de un usuario**

```javascript
const q = query(
  collection(db, "users", uid, "programs"),
  where("status", "==", "active"),
  where("businessId", "==", businessId)
);
```

### **Ver membresías de un programa**

```javascript
const q = query(
  collection(db, "programs", programId, "memberships"),
  where("status", "==", "active")
);
```

### **Ver evaluaciones de un negocio**

```javascript
const q = query(
  collection(
    db,
    "programs",
    programId,
    "memberships",
    businessId,
    "assessments"
  ),
  orderBy("submittedAt", "desc")
);
```

---

## ⚠️ NOTAS IMPORTANTES

### **Reglas de Firestore Temporales**

En `firestore.rules` hay una regla temporal al final:

```javascript
match /{document=**} {
  allow read, write: if true;
}
```

**⚠️ ESTA REGLA DEBE REMOVERSE EN PRODUCCIÓN** para activar las reglas de seguridad específicas del módulo Juntos.

### **Permisos de Roles**

- ✅ **Gerentes**: Pueden unir negocios a programas
- ❌ **Empleados**: Solo pueden ver programas, no unirse

### **Privacidad de Datos**

- ✅ ONGs/Facilitadores pueden ver: Evaluaciones y progreso
- ❌ ONGs/Facilitadores NO pueden ver: Transacciones, ventas, gastos, clientes

---

## 🎨 CARACTERÍSTICAS IMPLEMENTADAS

### **MVP Completado**

✅ Sistema de invitación por código
✅ Validación de permisos (solo gerentes)
✅ Opt-out (salirse del programa)
✅ Vista de programas activos
✅ Detalle de programa con tabs
✅ Protección de datos financieros
✅ Índice en `/users` para queries eficientes
✅ Cloud Function con validaciones robustas
✅ UI responsive y moderna

### **Pendientes para Versiones Futuras**

⏳ Sistema de evaluaciones (formularios MESUN/OIT)
⏳ Dashboard para facilitadores
⏳ Exportación de reportes (CSV/PDF)
⏳ Notificaciones de eventos del programa
⏳ Múltiples roles de staff (program_admin, facilitator)

---

## 🐛 TROUBLESHOOTING

### **Error: "functions is not defined"**

Verifica que en `src/firebase.js` estés exportando `functions`:

```javascript
import { getFunctions } from "firebase/functions";

export const functions = getFunctions(app, "southamerica-east1");
```

### **Error: "No se puede leer 'hasActiveProgram' de undefined"**

Asegúrate de que `useProgramStore` esté importado en `MainLayout.vue`:

```javascript
import { useProgramStore } from "@/stores/programStore";
```

### **Error en Cloud Function: "Cannot read property 'uid' of undefined"**

El usuario no está autenticado. Verifica que `context.auth` exista antes de llamar a la función.

---

## 📞 CONTACTO Y SOPORTE

Para dudas sobre la implementación:

- Revisar logs de Cloud Functions: `firebase functions:log`
- Revisar consola del navegador (F12) para errores de frontend
- Verificar reglas de Firestore en Firebase Console

---

**Implementado el: 16 de diciembre de 2025**
**Versión: MVP 1.0**


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

