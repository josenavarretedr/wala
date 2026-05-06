# `fileStore.js` — Documentación del Store de Archivos

**Archivo:** `src/stores/fileStore.js`
**Store ID:** `file`
**Tipo:** Pinia Store (Composition API)
**Módulo:** Adjuntos de Archivos

---

## Descripción General

El `useFileStore` gestiona el estado global de los uploads de archivos en la aplicación. Trabaja en conjunto con el composable `useFileUpload` que maneja la lógica de subida a Firebase Storage.

---

## State

| Propiedad       | Tipo          | Descripción                                                         |
| --------------- | ------------- | ------------------------------------------------------------------- |
| `uploads`       | `Ref<Object>` | Map de uploads activos: `fileId → { progress, status, error, url }` |
| `uploadHistory` | `Ref<Array>`  | Historial de archivos subidos (últimos 20)                          |

### Estructura de un upload activo

```javascript
{
  fileId: String,
  progress: Number,       // 0-100
  status: String,         // 'uploading' | 'processing' | 'ready' | 'error'
  error: String | null,
  url: String | null,     // URL final del archivo
  previewUrl: String | null,
  metadata: {
    fileName: String,
    contentType: String,
    size: Number,
    startedAt: Number     // timestamp
  }
}
```

---

## Actions

| Action                                  | Parámetros              | Descripción                                   |
| --------------------------------------- | ----------------------- | --------------------------------------------- |
| `startUpload(fileId, metadata?)`        | String, Object          | Inicia el tracking de un nuevo upload         |
| `updateProgress(fileId, progress)`      | String, Number          | Actualiza el % de progreso                    |
| `markAsProcessing(fileId)`              | String                  | Cambia status a `'processing'`                |
| `markAsReady(fileId, url, previewUrl?)` | String, String, String? | Marca como completado con URL final           |
| `markAsError(fileId, error)`            | String, String          | Marca como fallido                            |
| `removeUpload(fileId)`                  | String                  | Elimina del map de uploads activos            |
| `clearCompleted()`                      | —                       | Elimina todos los uploads en estado `'ready'` |
| `getUploadStatus(fileId)`               | String                  | Retorna el estado actual del upload           |
| `$reset()`                              | —                       | Resetea el store a su estado inicial          |

---

## Uso en Componentes

- `FileAttachButton.vue` — usa `useFileStore` junto con el composable `useFileUpload`

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
