# 📸 Sistema de Compartir Imagen - wala.lat

Sistema completo para capturar componentes Vue como imágenes y compartirlas vía Web Share API o descarga directa, con marca de agua "Powered by wala.lat".

## 📋 Tabla de Contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Uso Básico](#uso-básico)
- [Props del Componente](#props-del-componente)
- [Ejemplos Avanzados](#ejemplos-avanzados)
- [Composables Disponibles](#composables-disponibles)
- [Personalización](#personalización)
- [Tracking y Analytics](#tracking-y-analytics)
- [Troubleshooting](#troubleshooting)

## ✨ Características

- ✅ Captura de componentes Vue como imagen PNG
- ✅ Web Share API para móviles (WhatsApp, Telegram, etc.)
- ✅ Descarga directa para desktop
- ✅ Marca de agua automática "Powered by wala.lat"
- ✅ Loader integrado durante el proceso
- ✅ Toast notifications para feedback
- ✅ Firebase Analytics tracking
- ✅ Responsive (botón adapta texto/icono)
- ✅ Modificaciones pre-captura (ocultar/mostrar elementos)
- ✅ Optimización automática de tamaño
- ✅ Alta calidad (2x scale por defecto)

## 📦 Instalación

La dependencia `html2canvas` ya está instalada. Los archivos creados son:

```
src/
├── components/
│   └── ShareButton.vue         # Componente principal
├── composables/
│   ├── useImageCapture.js      # Captura con html2canvas
│   ├── useWebShare.js          # Web Share API + fallback
│   └── useShareTracking.js     # Firebase Analytics
└── utils/
    └── imageProcessor.js       # Procesamiento de canvas
```

## 🚀 Uso Básico

### Ejemplo Simple

```vue
<template>
  <div ref="comprobanteRef" class="bg-white p-6 rounded-lg">
    <h2>Comprobante de Venta #12345</h2>
    <p>Total: $1,250.00</p>
    <p>Fecha: 18/01/2026</p>

    <!-- Botón de compartir -->
    <ShareButton
      :target-ref="comprobanteRef"
      file-name="comprobante-venta.png"
      component-type="comprobante-venta"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ShareButton from "@/components/ShareButton.vue";

const comprobanteRef = ref(null);
</script>
```

### Resultado

- **Móvil**: Abre el diálogo nativo para compartir (WhatsApp, Telegram, Email, etc.)
- **Desktop**: Descarga automática del archivo PNG

## 🎛️ Props del Componente

### ShareButton.vue

| Prop                | Tipo      | Default                  | Descripción                                          |
| ------------------- | --------- | ------------------------ | ---------------------------------------------------- |
| `targetRef`         | `Object`  | **Requerido**            | Ref del elemento a capturar                          |
| `fileName`          | `String`  | `'comprobante-wala.png'` | Nombre del archivo generado                          |
| `shareTitle`        | `String`  | `'Comprobante'`          | Título para Web Share API                            |
| `shareText`         | `String`  | `'Powered by wala.lat'`  | Texto para Web Share API                             |
| `componentType`     | `String`  | `'generic'`              | Tipo para analytics tracking                         |
| `watermarkPosition` | `String`  | `'bottom'`               | Posición marca de agua (`'top'` \| `'bottom'`)       |
| `modifications`     | `Object`  | `{}`                     | Modificaciones pre-captura                           |
| `disableWatermark`  | `Boolean` | `false`                  | Desactivar marca de agua                             |
| `buttonText`        | `String`  | `'Compartir'`            | Texto del botón                                      |
| `variant`           | `String`  | `'primary'`              | Estilo (`'primary'` \| `'secondary'` \| `'outline'`) |
| `size`              | `String`  | `'md'`                   | Tamaño (`'sm'` \| `'md'` \| `'lg'`)                  |

### Events Emitidos

| Event            | Payload                                        | Descripción                        |
| ---------------- | ---------------------------------------------- | ---------------------------------- |
| `share-start`    | -                                              | Se inicia el proceso               |
| `share-success`  | `{ method, fileSize, captureTime, totalTime }` | Compartido exitosamente            |
| `share-error`    | `{ stage, error }`                             | Error durante el proceso           |
| `share-complete` | -                                              | Proceso finalizado (éxito o error) |

## 📚 Ejemplos Avanzados

### Con Modificaciones Pre-Captura

```vue
<template>
  <div ref="ticketRef" class="ticket">
    <h2>Ticket de Venta</h2>

    <!-- Este botón NO aparecerá en la imagen -->
    <button class="edit-button">Editar</button>

    <!-- Este mensaje SÍ aparecerá en la imagen -->
    <p class="share-message" style="display: none">¡Gracias por tu compra!</p>

    <ShareButton
      :target-ref="ticketRef"
      file-name="ticket.png"
      component-type="ticket-venta"
      :modifications="{
        hideElements: ['.edit-button'],
        showElements: ['.share-message'],
      }"
    />
  </div>
</template>
```

### Con Event Listeners

```vue
<template>
  <ShareButton
    :target-ref="elementRef"
    @share-start="onShareStart"
    @share-success="onShareSuccess"
    @share-error="onShareError"
    @share-complete="onShareComplete"
  />
</template>

<script setup>
const onShareStart = () => {
  console.log("🔄 Iniciando compartir...");
};

const onShareSuccess = ({ method, fileSize, totalTime }) => {
  console.log("✅ Compartido vía:", method);
  console.log("📊 Tamaño:", fileSize, "bytes");
  console.log("⏱️ Tiempo:", totalTime, "ms");
};

const onShareError = ({ stage, error }) => {
  console.error("❌ Error en:", stage, error);
};

const onShareComplete = () => {
  console.log("🏁 Proceso finalizado");
};
</script>
```

### Diferentes Variantes de Botón

```vue
<template>
  <!-- Botón primario (azul) -->
  <ShareButton :target-ref="ref1" variant="primary" size="lg" />

  <!-- Botón secundario (gris) -->
  <ShareButton :target-ref="ref2" variant="secondary" size="md" />

  <!-- Botón outline -->
  <ShareButton
    :target-ref="ref3"
    variant="outline"
    size="sm"
    button-text="Descargar"
  />
</template>
```

### Sin Marca de Agua

```vue
<ShareButton
  :target-ref="elementRef"
  :disable-watermark="true"
  component-type="internal-report"
/>
```

## 🔧 Composables Disponibles

### useImageCapture

Para uso independiente del componente:

```js
import { useImageCapture } from "@/composables/useImageCapture";

const { captureElement, isCapturing, captureError } = useImageCapture();

// Capturar elemento
const blob = await captureElement(elementRef.value, {
  watermarkPosition: "bottom",
  quality: 0.95,
  scale: 2,
});
```

### useWebShare

Para compartir archivos manualmente:

```js
import { useWebShare } from "@/composables/useWebShare";

const { shareImage, downloadImage, isWebShareSupported, isMobile } =
  useWebShare();

// Compartir blob
await shareImage(blob, {
  fileName: "imagen.png",
  title: "Mi Imagen",
  text: "Compartiendo desde wala.lat",
});
```

### useShareTracking

Para tracking personalizado:

```js
import { useShareTracking } from "@/composables/useShareTracking";

const { trackShareSuccess, trackShareError } = useShareTracking();

// Track evento personalizado
await trackShareSuccess({
  componentType: "custom-component",
  shareMethod: "webshare",
  fileSize: 12345,
});
```

## 🎨 Personalización

### Modificaciones Pre-Captura Avanzadas

```vue
<ShareButton
  :target-ref="elementRef"
  :modifications="{
    hideElements: ['.no-print', '[data-hide-on-share]'],
    showElements: ['.show-on-share'],
    styleChanges: {
      '.price': { fontSize: '24px', color: '#10b981' },
      '.title': { fontWeight: '700' },
    },
  }"
/>
```

### Personalizar Marca de Agua

Edita [src/utils/imageProcessor.js](src/utils/imageProcessor.js) en la función `addWatermark()`:

```js
// Cambiar altura del footer
const watermarkHeight = 100; // Default: 80

// Cambiar colores
ctx.fillStyle = "#6366f1"; // Color del texto "wala.lat"

// Cambiar tamaño del logo
const logoSize = 50; // Default: 40
```

### Estructura para Futuras Personalizaciones

El sistema está diseñado para agregar personalizaciones por tipo de componente:

```js
// Futuro: en useImageCapture.js
const componentModifications = {
  "comprobante-venta": {
    hideElements: [".edit-btn", ".delete-btn"],
    showElements: [".qr-code"],
    styleChanges: { ".total": { fontSize: "28px" } },
  },
  "ticket-cobro": {
    hideElements: [".internal-notes"],
    watermarkPosition: "top",
  },
};

// Aplicar automáticamente según componentType
const mods = componentModifications[componentType] || {};
```

## 📊 Tracking y Analytics

### Eventos Registrados en Firebase Analytics

| Evento              | Datos Incluidos                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `share_attempt`     | `component_type`, `file_name`, `user_id`                                                 |
| `share_success`     | `component_type`, `share_method`, `file_size_kb`, `total_time_ms`, `platform`, `browser` |
| `share_error`       | `component_type`, `error_type`, `stage`, `error_message`                                 |
| `share_cancelled`   | `component_type`, `stage`                                                                |
| `share_performance` | `capture_time_ms`, `processing_time_ms`, `total_time_ms`, `file_size_kb`                 |

### Ver Analytics en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar proyecto
3. Analytics → Events
4. Filtrar por: `share_*`

## 🐛 Troubleshooting

### El botón no captura nada

**Problema**: `targetRef` no está definido o es `null`

**Solución**:

```vue
<script setup>
// ✅ Correcto
const elementRef = ref(null);

// ❌ Incorrecto
const elementRef = null;
</script>
```

### La imagen se ve borrosa

**Problema**: Scale muy bajo

**Solución**: El componente usa `scale: 2` por defecto. Si necesitas más calidad:

```js
// En useImageCapture, modificar:
scale: 3; // Más calidad, más peso
```

### Marca de agua no aparece

**Problema**: Logo no se encuentra

**Solución**: Asegúrate de que existe `/public/logoWala2.png`

### Web Share no funciona en desktop

**Comportamiento esperado**: Web Share API solo está disponible en móviles (generalmente). En desktop usa descarga automática.

### Error de CORS con imágenes

**Problema**: Imágenes externas bloquean captura

**Solución**:

```js
// Las imágenes deben tener CORS habilitado
// O usar imágenes del mismo dominio
```

### El proceso es muy lento

**Causas**:

- Elemento muy grande
- Muchas imágenes
- Scale muy alto

**Soluciones**:

```js
// 1. Reducir scale
scale: 1;

// 2. Optimizar elemento antes de capturar
// 3. Ocultar elementos innecesarios con modifications
```

## 🎯 Mejores Prácticas

### 1. Nombrar archivos descriptivamente

```js
// ✅ Bueno
file-name="comprobante-venta-12345.png"

// ❌ Malo
file-name="img.png"
```

### 2. Usar componentType para analytics

```js
// ✅ Específico
component-type="ticket-venta-producto"

// ❌ Genérico
component-type="ticket"
```

### 3. Manejar errores

```vue
<ShareButton @share-error="handleError" />

<script setup>
const handleError = ({ stage, error }) => {
  // Reportar a sistema de monitoreo
  console.error("Share error:", stage, error);
};
</script>
```

### 4. Optimizar elementos grandes

```vue
<!-- Si el elemento es muy grande, considera dividirlo -->
<ShareButton
  :modifications="{
    hideElements: ['.optional-section'],
  }"
/>
```

## 📝 Notas Importantes

1. **Autenticación**: El tracking requiere usuario autenticado. Si no hay usuario, se registra como "anonymous"

2. **Permisos**: Web Share API requiere contexto HTTPS (excepto localhost)

3. **Tamaño**: Las imágenes se optimizan automáticamente a máx. 1200x2000px

4. **Calidad**: Se usa PNG con calidad 0.95 por defecto (configurable)

5. **Marca de agua**: Se agrega durante la captura, no es visible en el DOM

## 🔄 Actualizaciones Futuras

### Roadmap

- [ ] Soporte para múltiples formatos (JPEG, WebP)
- [ ] Editor de imagen antes de compartir
- [ ] Templates de marca de agua personalizables
- [ ] Modo batch (compartir múltiples capturas)
- [ ] Integración con Cloud Storage (guardar en Firebase)
- [ ] Historial de compartidos por usuario
- [ ] QR code automático en marca de agua

---

## 📞 Soporte

Para dudas o problemas:

- Revisar esta documentación
- Consultar logs en consola (buscar emojis: 📸 ✅ ❌)
- Verificar Firebase Analytics para tracking

**Fecha de implementación**: 18 de enero de 2026  
**Versión**: 1.0.0  
**Dominio**: wala.lat


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

