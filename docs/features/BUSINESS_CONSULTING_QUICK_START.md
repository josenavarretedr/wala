# 🚀 Guía de Inicio Rápido: Asesoría WALA (BusinessConsulting)

**Última actualización:** Mayo 2026 — Lanzamiento de Interfaz Unificada y Resumen Secuencial
**Versión:** 1.0.0
**Estado:** ✅ Activo e Implementado

---

## 📖 Introducción a Asesoría WALA

El **Módulo de Asesoría WALA** es el centro de aceleración para los microempresarios registrados en la plataforma. A través de este módulo, un asesor o consultor técnico evalúa periódicamente al negocio, define las 3 áreas críticas que necesitan atención inmediata, y co-crea un **Plan de Acción** estructurado para asegurar un crecimiento sostenido.

Esta guía presenta de forma interactiva y ejecutiva cómo opera la nueva interfaz premium de la plataforma, unificada bajo el color de identidad **WALA Coral (`#E35336`)** y estructurada mediante el patrón **Clean Flat Design**.

---

## 🗺️ Estructura de la Pestaña Resumen (Visual Flow)

La pestaña de **Resumen** ha sido completamente rediseñada para actuar como el panel de control táctico del emprendedor. En lugar de campos de texto aislados, se renderiza la siguiente secuencia interactiva de componentes:

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│ 📈 1. NIVEL DE MADUREZ ACTUAL (ActualLevelCard.vue)                │
│    - Indica el nivel: Aprendiz, Emprendedor, Gerente o Empresario │
│    - Rastra los momentos de diagnóstico registrados               │
│                                                                   │
└─────────────────────────────────┬─────────────────────────────────┘
                                  ↓
┌─────────────────────────────────┴─────────────────────────────────┐
│                                                                   │
│ ⚠️ 2. ÁREAS CRÍTICAS PRIORIZADAS (CriticalAreasSelected.vue)        │
│    - Muestra las 3 áreas clave que requieren enfoque urgente      │
│    - Muestra puntuación promedio y justificación técnica           │
│                                                                   │
└─────────────────────────────────┬─────────────────────────────────┘
                                  ↓
┌─────────────────────────────────┴─────────────────────────────────┐
│                                                                   │
│ 📅 3. PLAN DE ACCIÓN - PENDIENTES (ActionPlanView.vue :onlyPending)│
│    - Lista compacta y limpia exclusivamente de tareas pendientes  │
│    - Permite al usuario tachar tareas directo en tiempo real      │
│    - Muestra barra de avance y banner "¡Todo al día!" al terminar │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 👩‍💼 Guía de Operación para Emprendedores

Como dueño de negocio, el módulo te ofrece un mapa claro sin complicaciones:

1. **Revisa tu madurez:** Entra a la pestaña **Resumen** o **Desempeño** para ver tu nivel de madurez y el diagnóstico en formato radial/barras interactivas elaborado por tu consultor.
2. **Identifica tus prioridades:** Observa tus **3 Áreas Críticas**. Estas representan las columnas débiles identificadas en tu gestión (por ejemplo: *Control de Stock* o *Costeo*).
3. **Ejecuta y marca tareas:** En la sección **Plan de Acción (Pendientes)** verás tus tareas asignadas. 
   * Haz clic en el checkbox de cualquier tarea que hayas terminado.
   * La barra de progreso superior avanzará automáticamente en tono coral `#E35336`.
   * En cuanto marques la última tarea como completada, se desplegará el banner premium **"¡Todo al día! 🎉 Felicidades por tu disciplina, mantén tu negocio en marcha."**, y el listado de pendientes se despejará para darte paz mental.

---

## 👨‍🏫 Guía de Operación para Consultores (Administradores)

Cuando accedes al expediente de un cliente con un correo administrador (configurado en `ADMIN_EMAILS`), la interfaz desbloquea herramientas de edición masiva:

### Paso 1: Evaluar Desempeño
1. Dirígete a la pestaña **Desempeño**.
2. Haz clic en **"Agregar o Guardar Desempeño"** para abrir el **Wizard Asistente**.
3. Selecciona el momento a calificar (*Inicial*, *Ciclo 1*, *Ciclo 2*, o *Final*).
4. Elige un área a evaluar y califica cada uno de sus 3 indicadores de **0 a 3** usando los botones semánticos interactivos.
5. **Muy Importante:** Añade justificaciones o evidencias observadas en la **Caja de Comentarios** de cada indicador para mantener la trazabilidad.
6. Presiona **Guardar y Finalizar**. El gráfico radial SVG de madurez se recalculará instantáneamente.

### Paso 2: Priorizar Áreas Críticas
1. En la pestaña **Resumen** (o en la de **Áreas Críticas**), haz clic en **"Definir Áreas"** (o **"Definir Áreas Críticas"** en el estado vacío).
2. Selecciona exactamente **3 áreas** del listado que requieran atención inmediata según tu diagnóstico.
3. Agrega comentarios orientativos para cada área seleccionada y guarda los cambios.

### Paso 3: Construir el Plan de Acción
1. Navega a la pestaña **Plan de Acción**.
2. Haz clic en **"Crear Tareas de Plan de Acción"** para abrir el asistente de creación.
3. Escribe las tareas específicas de mejora orientadas a mitigar las 3 áreas críticas priorizadas.
4. Asigna frecuencias (*Diario*, *Semanal*, *Quincenal*, *Mensual* o *Única*) y vincula opcionalmente a un módulo del software WALA (por ejemplo: si la tarea es "Anotar transacciones diarias", vincúlala a la sección *comercial* o *caja*).
5. Guarda las tareas. Estas se añadirán automáticamente al plan de acción y se mostrarán en tiempo real en la pantalla de inicio del microempresario.

---

## 💻 Referencia Técnica para Desarrolladores

Para mantener y extender el módulo, considera los siguientes puntos clave:

### 🧩 Integración de Componentes en Resumen (Código Fuente)

En [ConsultingDashboard.vue](file:///c:/Users/User/Proyectos/wala/src/views/Consulting/ConsultingDashboard.vue#L155-L281), la pestaña `resumen` renderiza:

```html
<!-- Actual Level -->
<ActualLevelCard
  :businessName="businessName"
  :registeredMoments="registeredMoments"
  :evaluations="performanceStore.evaluations"
/>

<!-- Critical Areas -->
<CriticalAreasSelected
  v-if="dossierCriticalAreas && dossierCriticalAreas.length === 3"
  :criticalAreas="dossierCriticalAreas"
/>

<!-- Pending Action Plan -->
<ActionPlanView
  :businessId="businessId"
  :isAdminMode="isAdminMode"
  :onlyPending="true"
  @create-plan="showActionPlanWizard = true"
/>
```

### 🧬 Comportamiento del Prop `onlyPending` en `ActionPlanView.vue`

El componente [ActionPlanView.vue](file:///c:/Users/User/Proyectos/wala/src/components/consulting/ActionPlanView.vue) utiliza el prop `onlyPending` para filtrar reactivamente la lista de acciones leídas desde Firestore:

```javascript
const filteredActions = computed(() => {
  if (props.onlyPending) {
    return actionsList.value.filter(action => action.status === 'pending');
  }
  return actionsList.value;
});
```

### 🎨 Paleta de Estilos Oficial WALA (#E35336)
Todos los componentes del módulo de asesoría deben respetar el sistema de colores unificados:
* **Fondo Destaque:** `bg-[#E35336]`
* **Hover de Interacción:** `hover:bg-[#c2412b]`
* **Textos de Contraste:** `text-[#8b2413]` / `text-[#E35336]`
* **Opacidades Tenues:** `bg-[#E35336]/10` (ideal para badges y banners informativos)

---

## 🛠️ Preguntas Frecuentes (Troubleshooting)

#### ❓ ¿Por qué no veo mis cambios en tiempo real al marcar una tarea?
El componente de Plan de Acción utiliza `onSnapshot` de Firestore para escuchar los cambios en el documento `businesses/{businessId}/consulting/dossier`. Asegúrate de tener conexión a red activa. El store de Pinia se mantendrá perfectamente sincronizado de manera reactiva.

#### ❓ ¿Por qué un usuario no ve el botón de "Definir Áreas" o "Agregar Desempeño"?
Estas herramientas están protegidas por privilegios de administración. Solo los usuarios cuyos correos electrónicos estén registrados dentro del arreglo `ADMIN_EMAILS` en la configuración de la aplicación pueden ver e interactuar con los modales de creación.

#### ❓ ¿Por qué se conservan colores verdes/rojos en la Matriz de Desempeño?
Se decidió conservar el esquema semántico del gráfico interactivo (`ResumenPerformanceMatriz.vue`) para respetar la semaforización de madurez cualitativa (Aprendiz = Rojo, Empresario = Indigo, etc.). Sin embargo, todos los controles generales (botones, pestañas, loaders y barras de progreso del plan) se han unificado firmemente al color WALA Coral (`#E35336`).
