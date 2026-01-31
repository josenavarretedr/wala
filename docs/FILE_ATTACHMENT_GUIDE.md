# 📎 File Attachment System - Guía Completa

Sistema completo de subida y gestión de archivos (imágenes + PDFs) para Wala, con procesamiento automático en backend (resize, preview, conversión HEIC).

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Uso Básico](#uso-básico)
4. [Estructura de Datos](#estructura-de-datos)
5. [Componentes](#componentes)
6. [Cloud Functions](#cloud-functions)
7. [Seguridad](#seguridad)
8. [Troubleshooting](#troubleshooting)

---

## Descripción General

### ¿Qué hace este sistema?

- ✅ Sube archivos a Firebase Storage (imágenes y PDFs)
- ✅ Genera previews optimizados automáticamente
- ✅ Convierte HEIC/HEIF a JPG
- ✅ Tracking en tiempo real del progreso
- ✅ Manejo de errores con notificaciones al usuario
- ✅ Auditoría completa en Firestore

### Características

- **Modo temporal**: Sube archivos antes de asociarlos a una entidad
- **Validación automática**: Tipo y tamaño de archivo
- **Procesamiento backend**: Resize, preview, conversión
- **UI/UX completa**: Barra de progreso, preview, eliminar
- **Multi-tenant**: Aislamiento por negocio

---

## Arquitectura

### Flujo Completo

```
Usuario selecciona archivo
      ↓
FileAttachButton valida (tipo, tamaño)
      ↓
Upload a Storage (path temporal)
      ↓
Crear doc en Firestore (status: uploading)
      ↓
Progress tracking en fileStore
      ↓
Cloud Function procesa (resize, preview)
      ↓
Actualiza Firestore (status: ready, URLs)
      ↓
Componente detecta cambio y emite evento
      ↓
Componente padre guarda URL en su entidad
```

### Componentes del Sistema

```
Frontend:
  - fileStore.js          → Estado global de uploads
  - useFileUpload.js      → Lógica de subida/validación
  - FileAttachButton.vue  → Botón reusable
  - FilePreview.vue       → Preview de archivo subido

Backend:
  - processFileUpload.js  → Cloud Function (onFinalize trigger)

Firebase:
  - storage.rules         → Seguridad de Storage
  - Firestore: files/     → Metadata de archivos
  - Storage: uploads/tmp/ → Archivos temporales
```

---

## Uso Básico

### 1. Importar el componente

```vue
<script setup>
import FileAttachButton from "@/components/files/FileAttachButton.vue";
import { ref } from "vue";

const photoEvidence = ref(null); // URL del archivo
</script>

<template>
  <div>
    <FileAttachButton
      v-model="photoEvidence"
      button-text="Subir foto de evidencia"
      @uploaded="handleUploaded"
      @error="handleError"
    />
  </div>
</template>
```

### 2. Manejar eventos

```javascript
function handleUploaded(result) {
  console.log("✅ Archivo subido:", result);
  // result = {
  //   fileId: "abc123",
  //   urls: {
  //     original: "https://...",
  //     preview: "https://..."
  //   },
  //   metadata: { width, height, size, ... }
  // }

  // Guardar URL en tu entidad
  participation.value.responses.photoEvidence = result.urls.original;
}

function handleError(errorMessage) {
  console.error("❌ Error:", errorMessage);
}
```

### 3. Uso en formularios (ejemplo: Participación de Actividad)

```vue
<template>
  <form @submit.prevent="submitParticipation">
    <!-- Respuestas de texto -->
    <input v-model="responses.question1" placeholder="Respuesta 1" />
    <input v-model="responses.question2" placeholder="Respuesta 2" />

    <!-- Adjuntar foto -->
    <FileAttachButton
      v-model="responses.photoEvidence"
      button-text="📷 Adjuntar foto"
      @uploaded="onPhotoUploaded"
    />

    <button type="submit">Enviar participación</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "@/composables/useToast";

const responses = ref({
  question1: "",
  question2: "",
  photoEvidence: null, // URL se guardará aquí
});

function onPhotoUploaded(result) {
  console.log("Foto subida, URL guardada en responses.photoEvidence");
}

async function submitParticipation() {
  // responses.photoEvidence ya tiene la URL
  await saveParticipation(responses.value);
}
</script>
```

---

## Estructura de Datos

### Firestore: `files/{fileId}`

```javascript
{
  fileId: "abc-123-def",
  ownerUid: "user123",
  tenantId: "business456",

  // Entidad asociada (null si es temporal)
  entity: null,  // O { type: "participation", id: "part789" }

  // Metadata del archivo
  contentType: "image/jpeg",
  fileName: "evidencia.jpg",
  size: 1234567,

  // Estado del procesamiento
  status: "ready", // uploading | processing | ready | error | deleted

  // Paths en Storage
  storage: {
    originalPath: "uploads/tmp/tenant123/user123/1234-abc/original",
    previewPath: "uploads/tmp/tenant123/user123/1234-abc/preview"
  },

  // URLs públicas
  urls: {
    original: "https://storage.googleapis.com/...",
    preview: "https://storage.googleapis.com/..."
  },

  // Metadata adicional (generada por backend)
  meta: {
    width: 1920,
    height: 1080,
    format: "jpeg",
    uploadedAt: Timestamp,
    processedAt: Timestamp
  },

  // Error (si falló)
  error: null  // O { code: "...", messageUser: "..." }
}
```

### Storage Paths

#### Temporal (antes de asociar a entidad)

```
uploads/tmp/{tenantId}/{uid}/{timestamp-fileId}/original
uploads/tmp/{tenantId}/{uid}/{timestamp-fileId}/preview
```

#### Final (cuando se asocia a entidad - FUTURO)

```
uploads/{tenantId}/{entityType}/{entityId}/{fileId}/original
uploads/{tenantId}/{entityType}/{entityId}/{fileId}/preview
```

---

## Componentes

### FileAttachButton.vue

Botón reusable para subir archivos.

**Props:**

```javascript
{
  buttonText: String,      // Texto del botón (default: "Adjuntar archivo")
  modelValue: String,      // URL del archivo (v-model)
  disabled: Boolean,       // Deshabilitar botón
  showHelp: Boolean        // Mostrar mensaje de ayuda
}
```

**Events:**

```javascript
emit("update:modelValue", url); // v-model
emit("uploaded", { fileId, urls, metadata });
emit("deleted", fileId);
emit("error", errorMessage);
```

**Ejemplo:**

```vue
<FileAttachButton
  v-model="fileUrl"
  button-text="📎 Adjuntar evidencia"
  :disabled="loading"
  @uploaded="handleUpload"
/>
```

---

### FilePreview.vue

Componente para mostrar un archivo ya subido (con opción de eliminar).

**Props:**

```javascript
{
  fileUrl: String,         // URL original (required)
  previewUrl: String,      // URL preview (opcional)
  fileName: String,        // Nombre del archivo
  fileSize: Number,        // Tamaño en bytes
  contentType: String,     // Tipo MIME
  showDelete: Boolean,     // Mostrar botón eliminar
  showInfo: Boolean        // Mostrar info del archivo
}
```

**Events:**

```javascript
emit("delete"); // Cuando se hace clic en eliminar
```

**Ejemplo:**

```vue
<FilePreview
  :file-url="participation.responses.photoEvidence"
  file-name="evidencia.jpg"
  :file-size="1234567"
  content-type="image/jpeg"
  @delete="deletePhoto"
/>
```

---

## Cloud Functions

### processFileUpload

**Trigger:** `onObjectFinalized` en Storage  
**Path:** `uploads/tmp/**\/original`  
**Región:** `southamerica-east1`

**Qué hace:**

1. Detecta cuando se sube un archivo a Storage
2. Extrae metadata del path (fileId, tenantId, uid)
3. Determina tipo de archivo (imagen, PDF, HEIC)
4. **Si es imagen:**
   - Descarga archivo temporal
   - Procesa con Sharp (resize, rotate según EXIF)
   - Genera preview optimizado (max 1280px, quality 80)
   - Sube preview a Storage
   - Actualiza Firestore con URLs y metadata
5. **Si es PDF:**
   - Solo extrae metadata
   - Actualiza Firestore con URL
6. **Si falla:**
   - Marca documento como error
   - Guarda mensaje de error

**Configuración:**

```javascript
const CONFIG = {
  preview: {
    maxWidth: 1280,
    maxHeight: 1280,
    quality: 80,
    format: "jpeg",
  },
};
```

---

## Seguridad

### Storage Rules (`storage.rules`)

**Path temporal:**

```
uploads/tmp/{tenantId}/{uid}/{fileFolder}/{fileName}
```

- ✅ **Read:** Solo el dueño (uid)
- ✅ **Write:** Solo el dueño + validación de archivo
- ✅ **Delete:** Solo el dueño

**Validaciones:**

- Tamaño máximo: 5MB
- Tipos permitidos: JPG, PNG, HEIC, WEBP, PDF

**Firestore Rules (recomendado agregar):**

```javascript
match /files/{fileId} {
  allow read: if request.auth != null
              && (resource.data.ownerUid == request.auth.uid
                  || resource.data.tenantId == request.auth.token.businessId);

  allow create: if request.auth != null
                && request.resource.data.ownerUid == request.auth.uid;

  allow update, delete: if request.auth != null
                        && resource.data.ownerUid == request.auth.uid;
}
```

---

## Troubleshooting

### El archivo no se sube

**Síntomas:** Al seleccionar archivo, no pasa nada

**Soluciones:**

1. Verificar que el usuario esté autenticado
2. Verificar que hay un negocio seleccionado (`businessStore.getBusinessId`)
3. Revisar consola del navegador para errores
4. Verificar que el archivo cumple con validaciones (tamaño, tipo)

---

### El archivo se sube pero no se procesa

**Síntomas:** Progreso llega a 100% pero se queda en "Procesando..."

**Soluciones:**

1. Verificar que la Cloud Function `processFileUpload` esté desplegada
2. Revisar logs de Firebase Functions:
   ```bash
   firebase functions:log --only processFileUpload
   ```
3. Verificar que Sharp está instalado en functions:
   ```bash
   cd functions
   npm install sharp
   ```
4. Verificar que el documento en Firestore existe (`files/{fileId}`)

---

### Error: "Formato no permitido"

**Causa:** El archivo no cumple con tipos permitidos

**Solución:**

- Verificar extensión: JPG, PNG, HEIC, WEBP, PDF
- Verificar MIME type correcto
- Si es HEIC desde iPhone, asegurarse que Sharp lo soporte

---

### Error: "El archivo es muy grande"

**Causa:** Excede 5MB

**Solución:**

- Comprimir imagen antes de subir
- O modificar `FILE_CONSTRAINTS.maxSizeMB` en `useFileUpload.js`
- Y modificar `storage.rules` para permitir tamaño mayor

---

### La preview no se muestra

**Síntomas:** El archivo se sube pero no hay preview

**Soluciones:**

1. Verificar que Cloud Function generó el preview:
   - Revisar `urls.preview` en Firestore
2. Verificar logs de la función
3. Para PDFs, no hay preview (es normal)

---

### Error de permisos en Storage

**Síntomas:** "Permission denied" al subir

**Soluciones:**

1. Verificar que `storage.rules` está desplegado:
   ```bash
   firebase deploy --only storage
   ```
2. Verificar autenticación del usuario
3. Revisar que el path coincide con las reglas

---

## Instalación y Deployment

### 1. Instalar dependencias

```bash
# En el proyecto principal
npm install

# En functions
cd functions
npm install sharp
```

### 2. Deploy de reglas y functions

```bash
# Deploy Storage rules
firebase deploy --only storage

# Deploy Cloud Function
firebase deploy --only functions:processFileUpload
```

### 3. Verificar deployment

```bash
# Ver funciones desplegadas
firebase functions:list

# Ver logs
firebase functions:log
```

---

## Ejemplos Completos

### Ejemplo 1: Activity Participation (tu caso de uso)

```vue
<template>
  <div class="activity-form">
    <h2>Actividad: {{ activity.title }}</h2>

    <!-- Respuestas -->
    <div v-for="question in activity.questions" :key="question.id">
      <label>{{ question.text }}</label>
      <input v-model="responses[question.id]" />
    </div>

    <!-- Foto de evidencia -->
    <div class="mt-4">
      <label>Foto de evidencia</label>
      <FileAttachButton
        v-model="responses.photoEvidence"
        button-text="📷 Subir foto"
        @uploaded="onPhotoUploaded"
      />
    </div>

    <button @click="submitParticipation">Enviar</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import FileAttachButton from "@/components/files/FileAttachButton.vue";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  programId: String,
  activityId: String,
});

const authStore = useAuthStore();
const toast = useToast();

const responses = ref({
  question1: "",
  question2: "",
  photoEvidence: null, // URL se guardará aquí automáticamente
});

function onPhotoUploaded(result) {
  console.log("✅ Foto subida:", result.urls.original);
  // No hace falta hacer nada, v-model ya lo guardó en responses.photoEvidence
}

async function submitParticipation() {
  try {
    const participationData = {
      programId: props.programId,
      activityId: props.activityId,
      userId: authStore.user.uid,
      responses: responses.value,
      submittedAt: new Date(),
    };

    await setDoc(
      doc(
        db,
        "programs",
        props.programId,
        "participations",
        authStore.user.uid,
      ),
      participationData,
    );

    toast.success("Participación enviada correctamente");
  } catch (error) {
    console.error("Error:", error);
    toast.error("Error al enviar participación");
  }
}
</script>
```

---

### Ejemplo 2: Ver participaciones con fotos

```vue
<template>
  <div class="participation-list">
    <div v-for="participation in participations" :key="participation.id">
      <h3>{{ participation.userName }}</h3>

      <!-- Respuestas -->
      <div>
        <p>
          <strong>Respuesta 1:</strong> {{ participation.responses.question1 }}
        </p>
        <p>
          <strong>Respuesta 2:</strong> {{ participation.responses.question2 }}
        </p>
      </div>

      <!-- Foto de evidencia (si existe) -->
      <div v-if="participation.responses.photoEvidence">
        <p><strong>Evidencia:</strong></p>
        <FilePreview
          :file-url="participation.responses.photoEvidence"
          file-name="evidencia.jpg"
          :show-delete="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import FilePreview from "@/components/files/FilePreview.vue";
// ... resto del código
</script>
```

---

## Próximas Mejoras (Roadmap)

### Fase 2: Paths Finales

- [ ] Mover archivos de `tmp/` a paths finales cuando se asocien a entidad
- [ ] Callable Function para mover archivos
- [ ] Cleanup automático de archivos temporales antiguos

### Fase 3: Avanzado

- [ ] Múltiples archivos por entidad
- [ ] Compresión adicional para móviles
- [ ] Soporte para videos
- [ ] Watermarking automático
- [ ] OCR para extraer texto de imágenes

---

## Soporte

Para preguntas o issues:

1. Revisar esta documentación
2. Revisar logs de Firebase Functions
3. Revisar consola del navegador
4. Contactar al equipo de desarrollo

---

**Última actualización:** 29 de enero de 2026  
**Versión:** 1.0.0
