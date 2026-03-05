# `guionesStore.js` — Documentación del Store de Guiones

**Archivo:** `src/stores/guionesStore.js`
**Store ID:** `guiones`
**Tipo:** Pinia Store (Composition API)
**Módulo:** Guiones — Sistema de Videos / Contenido

---

## Descripción General

El `useGuionesStore` gestiona el sistema de producción de video y guiones. Permite cargar, filtrar, crear, editar y eliminar videos con sus guiones asociados. Los datos se persisten en Firestore vía `guionesService`.

---

## State

| Propiedad       | Tipo                | Descripción                                                   |
| --------------- | ------------------- | ------------------------------------------------------------- |
| `videos`        | `Ref<Array>`        | Lista completa de videos/guiones                              |
| `currentVideo`  | `Ref<Object\|null>` | Video actualmente en edición/visualización                    |
| `loading`       | `Ref<Boolean>`      | Indicador de carga                                            |
| `error`         | `Ref<String\|null>` | Último error                                                  |
| `filterOptions` | `Ref<Object>`       | Opciones disponibles para filtros (temas, rutas, tipos, etc.) |
| `activeFilters` | `Ref<Object>`       | Filtros activos actualmente                                   |

### Filtros disponibles

```javascript
filterOptions = {
  temas: [], // Cargados dinámicamente desde Firestore
  rutas: ["tecnica", "viral", "amplia"],
  tipos: ["educativo", "practico"],
  narrativas: ["directa", "estructurada"],
  estados: ["GRABANDO", "EDITANDO", "PUBLICADO"],
};
```

---

## Getters (Computed)

| Getter           | Descripción                                                   |
| ---------------- | ------------------------------------------------------------- |
| `videosFiltered` | Lista de videos filtrada aplicando `activeFilters`            |
| `videosPorVoz`   | `{ vozA: Number, vozB: Number }` — cantidad de videos por voz |

---

## Actions

### `loadVideos(filters?)`

**Descripción:** Carga todos los videos desde Firestore, opcionalmente con filtros.
**Parámetros:** `filters` — Object opcional con criterios de filtrado.

### `loadFilterOptions()`

**Descripción:** Carga las opciones de filtros disponibles desde Firestore.

### `loadVideo(videoId)`

**Descripción:** Carga un video específico por ID y lo establece como `currentVideo`.

### `saveVideoToStore(videoData)`

**Descripción:** Crea o actualiza un video en Firestore.

### `saveVideosFromIA(jsonData)`

**Descripción:** Importa múltiples videos desde un JSON generado por IA.

### `updateVideoInStore(videoId, updates)`

**Descripción:** Actualiza campos específicos de un video existente.

### `deleteVideoFromStore(videoId)`

**Descripción:** Elimina un video de Firestore y lo remueve del state local.

### `setFilters(filters)`

**Descripción:** Actualiza `activeFilters` con los filtros proporcionados.

### `clearFilters()`

**Descripción:** Limpia todos los filtros activos.

### `resetStore()`

**Descripción:** Resetea el store a su estado inicial.

---

## Uso en Componentes

`useGuionesStore()` es usado en:

- `CrearGuion.vue`
- `DashboardGuiones.vue`
- `DetalleVideo.vue`
- `GuionesLanding.vue`

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Store verificado como activo en el módulo Guiones.
