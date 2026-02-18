# 🎬 Sistema de Gestión de Guiones

Sistema completo para crear y gestionar guiones de video para redes sociales usando Inteligencia Artificial (Grok).

## 📋 Índice

- [Características](#características)
- [Configuración](#configuración)
- [Estructura de Rutas](#estructura-de-rutas)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Migración de JSONs Existentes](#migración-de-jsons-existentes)
- [Estructura de Datos](#estructura-de-datos)

---

## ✨ Características

### 🤖 Generación con IA

- **Proceso en 4 pasos**: Datos iniciales → Preguntas IA → Preview → Guardado
- **Ping-pong con IA**: La IA hace preguntas de aclaración para generar guiones más precisos
- **Validación automática**: Verifica la estructura de los guiones generados

### 📊 Dashboard Completo

- **Vista responsiva**: Tabla en desktop (>lg), cards en mobile (<lg)
- **Filtros múltiples**: Por tema, sector, fase del funnel, estado
- **Búsqueda en tiempo real**: En tema, subtema, caption

### ✏️ Editor de Guiones

- **Edición granular**: Cada sección del guion es editable (hook, micro-hooks, desarrollo, cierre)
- **Campos de gestión**: Estado (GRABANDO/EDITANDO/PUBLICADO), duración, tipo de contenido
- **Comentarios**: Espacio para observaciones y pendientes por video

### 🗂️ Organización

- **Un video = Un documento**: Cada video es independiente en Firestore
- **Metadata completa**: Hooks, caption, notas de producción, métricas esperadas

---

## ⚙️ Configuración

### 1. Variables de Entorno

Agrega en tu archivo `.env`:

```bash
# API Key de Grok (xAI)
VITE_XAI_API_KEY=xai-tu-api-key-aqui
```

### 2. Firestore Rules

Asegúrate de tener estas reglas en Firestore:

```javascript
match /marketing/guiones/videos/{videoId} {
  allow read, write: if request.auth != null;
}
```

### 3. Instalar OpenAI SDK

El SDK de OpenAI se usa para conectar con Grok (xAI):

```bash
npm install openai
```

---

## 🛣️ Estructura de Rutas

```
/guiones                          → Landing page (2 botones: Crear / Dashboard)
/guiones/crear                    → Flujo de creación con IA
/guiones/dashboard                → Lista de todos los videos
/guiones/dashboard/:videoId       → Detalle y edición de un video
```

---

## 🔄 Flujo de Trabajo

### 1. Crear Guiones

#### Paso 1: Formulario Inicial

```
- Tema del contenido
- Sectores objetivo (selección múltiple con autocompletado)
- Total de videos a generar
- Distribución Voz A/Voz B (opcional, automático si se deja vacío)
- Fase del funnel (Atracción/Consideración/Conversión)
```

#### Paso 2: Preguntas de la IA

```
La IA analiza tu input y genera preguntas de aclaración personalizadas
Ejemplos:
- ¿Cuáles son los principales errores que observas en estos sectores?
- ¿Qué casos reales recientes puedes compartir?
- ¿Qué propuesta de valor quieres destacar?
```

#### Paso 3: Preview

```
Muestra todos los guiones generados:
- Resumen general (tema, sectores, estrategia)
- Lista expandible de cada video
- Opciones: Confirmar, Regenerar, Volver atrás
```

#### Paso 4: Confirmación

```
Guarda todos los videos en Firestore
Redirige al Dashboard o permite crear más guiones
```

### 2. Gestionar en Dashboard

**Filtros disponibles:**

- Búsqueda de texto
- Tema
- Sector
- Estado (GRABANDO/EDITANDO/PUBLICADO)

**Acciones:**

- Click en video → Ir a detalle
- Botón eliminar

### 3. Editar un Video

**Campos editables:**

- Estado del video
- Duración estimada
- Tipo de contenido (STORYTELLING/ENTREVISTA/EXPLICACION)
- Comentarios/Observaciones
- **Editor completo del guion**:
  - Hook inicial
  - Micro-hook #1, #2, #3
  - Desarrollo 1, 2
  - Micro acción
  - Cierre

**Información de solo lectura:**

- Metadata (estructura, propuesta de valor, razón de estructura)
- Hooks (texto, visual, audio, estrategia)
- Caption
- Notas de producción
- Métricas esperadas

---

## 📦 Migración de JSONs Existentes

### Ejecutar Migración

```bash
npm run migrate:guiones
```

### ¿Qué hace el script?

1. Lee todos los archivos `.json` de `/src/assets/guiones/`
2. Valida la estructura de cada archivo
3. Extrae cada video del JSON
4. Agrega metadata complementaria (tema, sectores, estrategia)
5. Guarda cada video como documento independiente en Firestore
6. Genera reporte detallado del proceso

### Estructura Esperada del JSON

```json
{
  "meta_analisis": {
    "tema": "...",
    "sectores": ["..."],
    "estrategia_aplicada": "...",
    "propuesta_valor_central": "..."
  },
  "generacion": {
    "tema": "...",
    "fase_funnel": "atraccion",
    "total_videos": 5,
    "distribucion": { "voz_a": 3, "voz_b": 2 }
  },
  "videos": [
    {
      "numero": 1,
      "voz": "A",
      "subtema": "...",
      "hooks": { ... },
      "guion_completo": { ... },
      "caption": "...",
      "notas_produccion": { ... },
      "metricas_esperadas": { ... }
    }
  ]
}
```

Ver `ordenRegistro.json` y `guiones_flujo_caja.json` como ejemplos completos.

---

## 🗄️ Estructura de Datos

### Firestore Collection Path

```
marketing/guiones/videos/{videoId}
```

### Documento de Video (Firebase)

```javascript
{
  // Identificación
  id: "flujo-de-caja_fiado-que-rompe-ciclo_1",

  // Metadata del conjunto
  tema: "Flujo de caja - Ciclo de abastecimiento",
  sectores: ["Bodega", "Ferretería"],
  fase_funnel: "atraccion",
  estrategia_aplicada: "...",
  propuesta_valor_central: "...",

  // Datos del video individual
  numero: 1,
  voz: "A",
  estructura_usada: "Caso Real + Lección",
  razon_estructura: "...",
  propuesta_valor_enfocada: "...",
  duracion_estimada: "50s",
  subtema: "Fiado que rompe el ciclo de abastecimiento",
  sector_ejemplo: "Bodega",

  // Hooks
  hooks: {
    texto_visible: "...",
    visual: "...",
    audio_trending: "...",
    estrategia_hook: "..."
  },

  // Micro-hooks
  micro_hooks: [
    {
      numero: 1,
      timestamp: "[6-9s]",
      categoria: "validacion",
      texto: "...",
      objetivo: "..."
    }
  ],

  // Storytelling
  storytelling_causal: {
    validacion: "...",
    palabras_causales_usadas: ["PERO", "POR LO TANTO", ...],
    flujo: "..."
  },

  // Guion completo
  guion_completo: {
    hook: "[0-5s] ...",
    microhook_1: "[6-9s] ...",
    desarrollo_1: "[10-24s] ...",
    microhook_2: "[25-28s] ...",
    desarrollo_2: "[29-39s] ...",
    microhook_3: "[40-42s] ...",
    micro_accion: "[43-48s] ...",
    cierre: "[49-50s] ..."
  },

  // Micro acción
  micro_accion: {
    descripcion: "...",
    tiempo_estimado: "5 minutos",
    nivel_esfuerzo: "muy bajo",
    objetivo_psicologico: "...",
    mencion_wala: "Sutil",
    funcionalidad_wala_relacionada: "...",
    validacion: "..."
  },

  // Caption para redes
  caption: "...",

  // Notas de producción
  notas_produccion: {
    locacion_sugerida: "...",
    props_necesarios: "...",
    tono_voz: "...",
    momento_del_dia: "..."
  },

  // Métricas esperadas
  metricas_esperadas: {
    objetivo_principal: "...",
    tipo_interaccion: "...",
    audiencia_target: "...",
    retencion_esperada: "..."
  },

  // Campos de gestión
  estado: "GRABANDO",  // GRABANDO | EDITANDO | PUBLICADO
  tipo_contenido: "STORYTELLING",  // STORYTELLING | ENTREVISTA | EXPLICACION
  comentarios: "Pendiente ajustar hook inicial",

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🎯 Casos de Uso

### Ejemplo 1: Crear Guiones para Bodegueros

1. Ir a `/guiones/crear`
2. Completar formulario:
   - **Tema**: "Control de inventario"
   - **Sectores**: Bodega, Minimarket
   - **Total videos**: 5
   - **Distribución**: Automática
3. Responder preguntas de IA:
   - "Errores comunes: No registran mermas ni productos vencidos"
   - "Caso reciente: Bodeguero con $2,000 en productos vencidos sin registrar"
4. Preview de 5 guiones generados
5. Confirmar y guardar

### Ejemplo 2: Gestionar Videos en Producción

1. Ir a `/guiones/dashboard`
2. Filtrar por:
   - **Estado**: GRABANDO
   - **Sector**: Bodega
3. Click en video específico
4. Cambiar estado a "EDITANDO"
5. Agregar comentario: "Pendiente edición de caption final"
6. Guardar

### Ejemplo 3: Editar Guion Antes de Grabar

1. Ir a detalle del video
2. Scroll a "Editor de Guion"
3. Ajustar el hook inicial:
   - Antes: "¿Te pasa esto?"
   - Después: "¿Te suena familiar esto?"
4. Modificar micro-acción
5. Guardar cambios

---

## 📝 Notas Importantes

### Sobre la IA

- Usa Grok (xAI) con SDK de OpenAI
- Ejecuta desde el cliente (modo `dangerouslyAllowBrowser: true`)
- **Recomendación para producción**: Mover a Cloud Function

### Sobre Firestore

- **1 video = 1 documento** (no arrays de videos)
- IDs generados automáticamente: `{tema}_{subtema}_{numero}`
- Los sectores se guardan como array para soportar filtrado con `array-contains`

### Sobre el Prompt Maestro

- Ubicado en `/src/assets/guiones/promptGuion.md`
- Contiene toda la lógica de voces narrativas, estructuras, y ejemplos
- Se carga dinámicamente en cada consulta a la IA

---

## 🚀 Próximas Mejoras

- [ ] Exportar guiones a PDF
- [ ] Compartir guiones vía link público
- [ ] Analytics de videos publicados (views, engagement)
- [ ] Integración con plataformas de video (TikTok API)
- [ ] Templates adicionales de contenido
- [ ] Duplicar guiones para variaciones rápidas

---

## 👤 Autor

**Sistema creado para WALA**  
Gestión de contenido para marketing de atracción en redes sociales.

---

## 📄 Licencia

Propietario - Solo uso interno de WALA
