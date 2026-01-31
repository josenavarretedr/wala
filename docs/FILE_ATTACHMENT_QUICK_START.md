# 🚀 File Attachment System - Setup Rápido

## ✅ Implementación Completada

Sistema completo de subida de archivos (imágenes + PDFs) con procesamiento automático en backend.

---

## 📦 Archivos Creados

### Frontend (Vue)

```
src/
  stores/
    ✅ fileStore.js                    → Estado global de uploads

  composables/
    ✅ useFileUpload.js                → Lógica de subida/validación

  components/
    files/
      ✅ FileAttachButton.vue          → Botón reusable de upload
      ✅ FilePreview.vue               → Preview de archivos
    programs/
      ✅ ActivityParticipationForm.vue → Ejemplo de uso completo
```

### Backend (Cloud Functions)

```
functions/
  ✅ package.json                      → Agregado sharp@^0.33.2

  src/Storage/
    ✅ processFileUpload.js            → Function de procesamiento

  ✅ index.js                          → Exporta processFileUpload
```

### Configuración

```
✅ storage.rules                       → Reglas de seguridad Storage
✅ firebase.json                       → Configuración actualizada
```

### Documentación

```
docs/
  ✅ FILE_ATTACHMENT_GUIDE.md          → Guía completa del sistema
  ✅ FILE_ATTACHMENT_QUICK_START.md    → Este archivo
```

---

## 🔧 Pasos de Instalación

### 1. Instalar Dependencias

```bash
# En el directorio de functions
cd functions
npm install
```

Esto instalará **sharp** que es necesario para procesar imágenes.

### 2. Deploy de Reglas de Seguridad

```bash
# Desde la raíz del proyecto
firebase deploy --only storage
```

Esto desplegará las reglas de seguridad de Storage que validan:

- Tamaño máximo: 5MB
- Tipos permitidos: JPG, PNG, HEIC, WEBP, PDF
- Solo el dueño puede subir/leer/eliminar

### 3. Deploy de Cloud Function

```bash
firebase deploy --only functions:processFileUpload
```

Esto desplegará la función que:

- Genera previews de imágenes (resize a 1280px max)
- Convierte HEIC/HEIF a JPG
- Extrae metadata (dimensiones, tamaño, formato)
- Actualiza Firestore con URLs

### 4. Verificar Deployment

```bash
# Ver funciones desplegadas
firebase functions:list

# Debería aparecer:
# processFileUpload (Storage Trigger)
```

---

## 🎯 Uso Básico

### Opción 1: Componente Simple

```vue
<template>
  <FileAttachButton
    v-model="photoUrl"
    button-text="📷 Subir foto"
    @uploaded="handleUploaded"
  />
</template>

<script setup>
import FileAttachButton from "@/components/files/FileAttachButton.vue";
import { ref } from "vue";

const photoUrl = ref(null);

function handleUploaded(result) {
  console.log("Foto subida:", result.urls.original);
  // result.urls.original ya está en photoUrl por v-model
}
</script>
```

### Opción 2: Componente Completo (Participations)

```vue
<template>
  <ActivityParticipationForm
    :program-id="programId"
    :activity-id="activityId"
    :activity="activity"
    @success="handleSuccess"
  />
</template>

<script setup>
import ActivityParticipationForm from "@/components/programs/ActivityParticipationForm.vue";
// El componente ya incluye FileAttachButton integrado
</script>
```

---

## 🧪 Testing

### Test Local con Emuladores

1. **Iniciar emuladores:**

```bash
firebase emulators:start
```

2. **Configurar en tu código (opcional):**

```javascript
// firebaseInit.js
if (location.hostname === "localhost") {
  connectStorageEmulator(storage, "localhost", 9199);
  connectFunctionsEmulator(functions, "localhost", 5001);
}
```

3. **Subir un archivo de prueba** desde la UI

4. **Verificar logs:**

```bash
# En otra terminal
firebase emulators:logs
```

### Test en Producción

1. Sube un archivo pequeño (< 1MB)
2. Verifica que aparece barra de progreso
3. Espera a que diga "Procesando..."
4. Debe mostrar preview cuando termine
5. Verifica logs de la función:

```bash
firebase functions:log --only processFileUpload --limit 20
```

---

## 📊 Estructura de Datos

### Firestore: `files/{fileId}`

```javascript
{
  fileId: "uuid-v4",
  ownerUid: "user123",
  tenantId: "business456",
  status: "ready",
  urls: {
    original: "https://storage.googleapis.com/...",
    preview: "https://storage.googleapis.com/..."
  },
  meta: {
    width: 1920,
    height: 1080,
    size: 234567,
    uploadedAt: Timestamp,
    processedAt: Timestamp
  }
}
```

### Storage Paths

```
uploads/tmp/{tenantId}/{uid}/{timestamp-fileId}/original
uploads/tmp/{tenantId}/{uid}/{timestamp-fileId}/preview
```

---

## ⚡ Flujo Completo

```
1. Usuario selecciona archivo
   ↓
2. Validación (tipo, tamaño)
   ↓
3. Upload a Storage con progress tracking
   ↓
4. Crear doc en Firestore (status: uploading)
   ↓
5. Cloud Function se dispara automáticamente
   ↓
6. Procesa imagen (resize, preview)
   ↓
7. Actualiza Firestore (status: ready, URLs)
   ↓
8. Frontend detecta cambio y muestra preview
   ↓
9. Usuario continúa con el formulario
   ↓
10. Se guarda URL en la entidad (participation, etc.)
```

---

## 🐛 Troubleshooting Común

### "Formato no permitido"

- Verificar extensión del archivo
- Solo: JPG, PNG, HEIC, WEBP, PDF

### "El archivo es muy grande"

- Máximo 5MB
- Comprimir imagen antes de subir

### Se sube pero no se procesa

- Verificar que la función está desplegada
- Ver logs: `firebase functions:log --only processFileUpload`
- Verificar que sharp está instalado en functions

### Error de permisos

- Verificar que storage.rules está desplegado
- Usuario debe estar autenticado
- Verificar businessId en businessStore

---

## 📚 Documentación Completa

Ver [FILE_ATTACHMENT_GUIDE.md](./FILE_ATTACHMENT_GUIDE.md) para:

- Arquitectura detallada
- API completa de componentes
- Ejemplos avanzados
- Troubleshooting extenso
- Roadmap de mejoras

---

## ✨ Próximos Pasos (Opcionales)

### Mejora 1: Firestore Rules

Agregar reglas de seguridad para la colección `files`:

```javascript
// firestore.rules
match /files/{fileId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
                && request.resource.data.ownerUid == request.auth.uid;
  allow update, delete: if request.auth != null
                        && resource.data.ownerUid == request.auth.uid;
}
```

### Mejora 2: Cleanup de Archivos Temporales

Scheduled Function para borrar archivos antiguos en `tmp/`:

```javascript
// Ejecutar diariamente
exports.cleanupTempFiles = onSchedule("every day 02:00", async () => {
  // Borrar archivos en tmp/ con más de 7 días
});
```

### Mejora 3: Mover a Path Final

Callable Function para mover archivos de temporal a final:

```javascript
exports.moveFileToFinal = onCall(async (request) => {
  const { fileId, entityType, entityId } = request.data;
  // Mover de tmp/ a uploads/{tenant}/{entityType}/{entityId}/
});
```

---

## 🎉 ¡Listo!

El sistema está completamente funcional. Solo necesitas:

1. ✅ `npm install` en functions
2. ✅ Deploy storage rules
3. ✅ Deploy Cloud Function
4. ✅ Usar `<FileAttachButton>` en tus componentes

**Cualquier duda:** Revisar [FILE_ATTACHMENT_GUIDE.md](./FILE_ATTACHMENT_GUIDE.md)
