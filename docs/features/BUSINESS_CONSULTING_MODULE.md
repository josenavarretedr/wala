# 🏢 Módulo de Asesoría de Negocios (BusinessConsulting)

**Última actualización:** Mayo 2026 — Refactorización Visual e Integración Trazable de Ciclos
**Versión:** 2.0.0
**Estado:** ✅ Activo y Verificado en Producción

---

## 📋 Descripción General

El módulo **BusinessConsulting (Asesoría WALA)** es una herramienta estratégica diseñada para evaluar, estructurar y potenciar la madurez de gestión de las empresas registradas en la plataforma WALA. A través de un diagnóstico multidimensional (7 áreas clave × 3 indicadores por área), el sistema permite a los asesores técnicos guiar a los microempresarios mediante una ruta clara de crecimiento estructurada en múltiples ciclos evolutivos.

El módulo destaca por su **segregación de roles (Client-facing vs. Admin-facing)** y una experiencia de usuario premium fundamentada en micro-animaciones fluidas, visualizaciones interactivas de gráficos SVG/CSS y una arquitectura de datos trazable en tiempo real soportada por Firebase/Firestore y Pinia.

---

## 🏗️ Arquitectura del Sistema

El módulo se compone de una estructura en capas sumamente desacoplada:

```mermaid
graph TD
    A[Vista Cliente: /business/:id/consulting] --> B[ConsultingDashboard.vue]
    C[Vista Admin: /admin/users/:id] --> B
    B -->|Muestra Rúbricas e Historial| D(ResumenPerformanceMatriz.vue)
    B -->|Despliega Wizard de Evaluación| E(PerformanceMatrix.vue)
    E -->|Interactúa y Actualiza| F[performanceStore.js (Pinia)]
    F -->|Lectura/Escritura Realtime| G[(Firestore: businesses/{id}/consulting/dossier)]
```

### Componentes y Ubicaciones Clave

| Componente / Archivo | Propósito | Ruta en el Proyecto |
| :--- | :--- | :--- |
| `ConsultingDashboard.vue` | Contenedor principal del Dashboard. Administra la navegación por pestañas, realiza validaciones de roles/permisos y maneja el estado de edición textual. | [ConsultingDashboard.vue](file:///c:/Users/User/Proyectos/wala/src/views/Consulting/ConsultingDashboard.vue) |
| `PerformanceMatrix.vue` | Asistente interactivo en formato de Wizard. Guía al asesor técnico en la selección del momento, área clave e indicadores para calificar con rúbricas detalladas. | [PerformanceMatrix.vue](file:///c:/Users/User/Proyectos/wala/src/components/consulting/PerformanceMatrix.vue) |
| `ResumenPerformanceMatriz.vue` | Módulo analítico que renderiza el gráfico interactivo SVG/CSS, filtros interactivos de áreas, tooltip flotante premium y acordeón de comentarios históricos. | [ResumenPerformanceMatriz.vue](file:///c:/Users/User/Proyectos/wala/src/components/consulting/ResumenPerformanceMatriz.vue) |
| `performanceStore.js` | Store de Pinia. Contiene la configuración estática de rúbricas y preguntas, maneja los estados reactivos del flujo de evaluación y coordina la persistencia de datos. | [performanceStore.js](file:///c:/Users/User/Proyectos/wala/src/stores/performanceStore.js) |

---

## 👥 Modos de Acceso y Segregación de Roles

El sistema cuenta con un control de accesos estricto en función de los perfiles de usuario:

### 1. Vista de Cliente (Lectura Exclusiva)
* **Ruta de acceso:** `/business/:businessId/consulting`
* **Permisos:** Cualquier emprendedor autenticado propietario o miembro de su negocio.
* **Comportamiento:**
  * Visualización consultiva de las 4 pestañas.
  * El resumen, áreas críticas y plan de acción se presentan como textos informativos formateados en tarjetas estilizadas.
  * Acceso al historial analítico de todos los ciclos de madurez registrados. No se permite invocar el Wizard de evaluación.

### 2. Vista de Administrador/Asesor (Escritura y Evaluación)
* **Ruta de acceso:** `/admin/users/:businessId` (proveniente del directorio administrativo de usuarios).
* **Permisos:** Restringido a correos con privilegios explícitos configurados en el array `ADMIN_EMAILS` (ej: `josenavarretedr@gmail.com`, `admin@wala.lat`).
* **Comportamiento:**
  * **Edición Textual Dinámica:** Los bloques de *Resumen*, *Áreas Críticas* y *Plan de Acción* se transforman automáticamente en áreas de texto (`textarea`) editables con guardado directo y feedback inmediato mediante toast notifications.
  * **Asistente de Desempeño:** Habilita el botón **"Agregar o Guardar Desempeño"**, el cual despliega el Wizard interactivo a pantalla completa para calificar al negocio.
  * **Directorio de Retorno:** Añade una barra superior informativa que identifica al negocio evaluado y a su dueño, permitiendo regresar limpiamente al directorio de administración de usuarios.

---

## 💾 Estructura y Modelo de Datos en Firestore

Toda la información del expediente se consolida en un único documento centralizado por negocio para maximizar la eficiencia en lecturas.

### Path: `businesses/{businessId}/consulting/dossier`

```typescript
interface ConsultingDossier {
  // Diagnósticos Textuales
  resumenText: string;          // Resumen global del expediente
  madurezText: string;          // Estado general de madurez
  areasCriticasText: string;    // Oportunidades de mejora identificadas
  planAccionText: string;       // Estrategia de crecimiento
  
  // Auditoría básica
  updatedAt: Timestamp;
  updatedBy: string;            // UID del usuario o 'admin'
  
  // Registro retrocompatible (Copia de la evaluación inicial)
  diagnosticScores?: Record<string, number>; 
  
  // Evaluaciones por momentos de control
  evaluations: {
    inicial: MomentEvaluation;
    ciclo1: MomentEvaluation;
    ciclo2: MomentEvaluation;
    final: MomentEvaluation;
  };
}

interface MomentEvaluation {
  scores: Record<string, number>;     // Clave del indicador (ej: "1.1") -> Nivel (0 a 3)
  comments: Record<string, string>;   // Clave del indicador -> Observación/Evidencia
}
```

> [!NOTE]
> Cuando se guarda o actualiza la asesoría de un negocio, el sistema marca el flag `hasConsulting: true` en el documento raíz del negocio (`businesses/{businessId}`) para habilitar indexación rápida y filtros avanzados en el listado general de clientes y negocios.

---

## 📊 Matriz de Evaluación (Rúbrica de 7 Áreas)

El modelo de madurez WALA evalúa **7 dimensiones críticas**, compuestas por **3 indicadores específicos** cada una. Cada indicador califica el desempeño en un rango discreto de **0 a 3**, detallando además preguntas guía de entrevista y señales observables para el asesor.

### 📝 Estructura de Áreas e Indicadores

1. **Negocios y familia** (`negocioFamilia`)
   * **1.1 Se paga un salario:** Evalúa la separación financiera entre ser dueño y ser trabajador.
   * **1.2 Paga salario a familiares:** Mide la visibilidad del costo real del apoyo familiar.
   * **1.3 No retira dinero sin control:** Analiza la disciplina de caja para evitar mezclar fondos personales.
2. **Marketing** (`marketing`)
   * **2.1 Conoce a sus clientes:** Analiza el entendimiento de las necesidades reales del mercado.
   * **2.2 Promueve el negocio:** Evalúa la proactividad comercial e intencionalidad de visibilidad.
   * **2.3 Comercializa competitivamente:** Revisa si la fijación de precios considera costos y márgenes de forma rigurosa.
3. **Compras** (`compras`)
   * **3.1 Recolecta cotizaciones:** Mide el hábito de comparar antes de realizar adquisiciones.
   * **3.2 Verifica bienes en entrega:** Analiza la revisión de mercancía recibida y reclamos.
   * **3.3 Planifica volumen de compras:** Evalúa el cálculo del volumen de compra según stock y ventas.
4. **Control de stock** (`controlStock`)
   * **4.1 Mantiene registros actualizados:** Revisa el uso de soportes físicos o digitales de stock.
   * **4.2 Renovación de stock regular:** Analiza la anticipación a quiebres de inventario.
   * **4.3 Evita sobre/sub-stock:** Evalúa la depuración de merma e inventarios inactivos.
5. **Costeo** (`costeo`)
   * **5.1 Calcula costos de materiales directos:** Mide la exactitud en el costo directo por producto.
   * **5.2 Calcula mano de obra directa:** Analiza la incorporación del costo del tiempo humano.
   * **5.3 Calcula costos indirectos:** Revisa la distribución de alquiler, luz, transporte, etc.
6. **Mantenimiento de registros** (`registros`)
   * **6.1 Libros de registro actualizados:** Evalúa la constancia en el registro diario de transacciones.
   * **6.2 Registro de cuentas de clientes:** Mide el control sobre saldos por cobrar y créditos otorgados.
   * **6.3 Calcula ganancias/pérdidas:** Analiza la comprensión real de la utilidad neta.
7. **Planificación** (`planificacion`)
   * **7.1 Proyecta ventas y costos:** Evalúa la previsión del rendimiento para el siguiente periodo.
   * **7.2 Planifica el flujo de caja:** Mide la anticipación de ingresos y egresos de liquidez.
   * **7.3 Sigue y ajusta el plan de negocio:** Revisa la toma de decisiones basada en registros históricos.

---

## 🔄 El Asistente de Diagnóstico (Wizard Flow)

El componente `PerformanceMatrix.vue` se comporta como un flujo de procesos altamente usable diseñado para dispositivos móviles y de escritorio. 

```
  ┌──────────────────────────────────────────────────────────┐
  │ Paso 0: Selección de Momento (Inicial, Ciclos 1/2, Final) │
  └────────────────────────────┬─────────────────────────────┘
                               ↓
  ┌──────────────────────────────────────────────────────────┐
  │ Paso 1: Selección de Área (De las 7 áreas clave)          │
  └────────────────────────────┬─────────────────────────────┘
                               ↓
  ┌──────────────────────────────────────────────────────────┐
  │ Paso 2: Rúbrica e Indicadores (3 indicadores por área)   │
  │   - Puntuación 0-3 con botones interactivos               │
  │   - Preguntas y alertas visibles                         │
  │   - Cuadro de comentarios de evidencia                   │
  └────────────────────────────┬─────────────────────────────┘
                               ↓
  ┌──────────────────────────────────────────────────────────┐
  │ Paso 3: Resumen de Área y Guardado en Firestore          │
  └──────────────────────────────────────────────────────────┘
```

### Características Clave del Wizard
* **Indicador de Progreso:** Una barra superior dinámica marca el porcentaje de avance dentro del área actual (33.3%, 66.6%, 100%).
* **Caja de Evidencias (Trazabilidad):** Cada indicador cuenta con un campo de texto para que el asesor redacte anotaciones y justifique la calificación otorgada.
* **Cierre Inteligente:** Incluye un botón de cierre que regresa limpiamente a la vista previa del dashboard, reseteando de forma segura el flujo interno de Pinia para evitar colisiones de estado.

---

## 📊 Módulo Analítico: Gráfico y Resumen de Desempeño

El componente `ResumenPerformanceMatriz.vue` provee la pieza visual clave del módulo, diseñada bajo rigurosos criterios de estética moderna y experiencia de usuario.

### 🎨 Color Scheme y Rango de Madurez (Tailwind Semantic Rules)
Para asegurar sobriedad y profesionalismo corporativo, el módulo descarta los degradados llamativos y unifica las representaciones de madurez mediante una paleta de colores planos sofisticados y complementarios basados en el color primario de WALA:

| Nivel | Rango de Puntuación | Color Tailwind | Icono Vectorial | Significado Cualitativo |
| :--- | :---: | :--- | :---: | :--- |
| **Aprendiz** | `0.0 – 0.4` | `rose-500` / `rose-50` | `Leaf` | Fase inicial: Prácticas informales, reactivas y sin control operativo. |
| **Emprendedor** | `0.5 – 1.4` | `amber-500` / `amber-50` | `Rocket` | Fase de tracción: Estructuras básicas bajo esfuerzo y soporte meramente individual. |
| **Gerente** | `1.5 – 2.4` | `emerald-500` / `emerald-50` | `Group` | Fase de control: Delegación funcional, registros estables y control del día a día. |
| **Empresario** | `2.5 – 3.0` | `indigo-500` / `indigo-50` | `BrightCrown` | Fase estratégica: Decisiones guiadas por datos e indicadores integrados. |

### 📈 Gráfico de Barras SVG/CSS Interactivo
* **Filtros Dinámicos (Clickable Badges):** Los usuarios pueden activar o desactivar áreas del gráfico interactuando con badges superiores. El gráfico redistribuye sus columnas en tiempo real utilizando transiciones suaves de CSS.
* **Bandas de Fondo del Nivel de Madurez:** La grilla de fondo del gráfico muestra bandas horizontales coloreadas con opacidades sumamente tenues (`rose-500/[0.03]`, etc.) para delimitar visualmente el nivel alcanzado sin entorpecer la lectura de las barras.
* **Columnas del Gráfico:** Renderizadas mediante CSS flexible, las columnas se alzan proporcionalmente y cuentan con sombras sutiles que combinan con su color semántico (`shadow-emerald-500/10`, etc.).

### 🪟 Tooltip Premium Glassmórfico Flotante
Al colocar el cursor (o presionar en móviles) sobre cualquier columna de barra:
* Se despliega una tarjeta flotante construida con **Glassmorphism blanco** (`bg-white/80 backdrop-blur-md border border-white/30 text-slate-900 shadow-xl shadow-slate-200/50`).
* Inyecta de forma dinámica la información correspondiente:
  * El promedio real del área (`0.0` a `3.0`).
  * Un badge representativo del nivel de madurez alcanzado, integrando el icono vectorial semántico (`Leaf`, `Rocket`, `Group` o `BrightCrown`).
  * La **descripción cualitativa dinámica** basada en el puntaje, explicando de forma clara la situación comercial del negocio en esa área.

### 📜 Acordeón de Comentarios e Historial de Evidencias
Al final del componente se dispone un acordeón interactivo que lista únicamente los indicadores que poseen comentarios de respaldo registrados por el asesor. Muestra la clave del indicador (ej: `1.1`), el título y el testimonio del asesor en texto cursiva, actuando como una valiosa bitácora de trazabilidad.

---

## 🎨 Leyenda Modernizada (2x2 Grid Legend)

Para evitar explicaciones densas y optimizar el espacio en pantallas pequeñas, la guía de niveles del `ConsultingDashboard.vue` se rediseñó por completo hacia una cuadrícula de 2x2.

* **Estructura Visual:** Cada tarjeta de nivel cuenta con un contenedor redondeado, un fondo suave, un icono vectorial semántico de `@iconoir/vue` y una **barra de acento de color lateral izquierda** sumamente limpia que actúa como ancla visual con el color del gráfico.
* **Efectos de Micro-interacción:** Las tarjetas poseen transiciones al hacer hover (`hover:shadow-md hover:scale-[1.01]`) que hacen sentir vivo el dashboard.

---

## 📝 Notas Técnicas y Buenas Prácticas de Mantenimiento

1. **Gestión de Carga Dinámica:** El store de Pinia sincroniza automáticamente las rúbricas y carga todos los ciclos completados en el mounting del dashboard. Para renderizar múltiples gráficos simultáneamente (Diagnóstico Inicial vs. Ciclos), el componente iterador `<ResumenPerformanceMatriz>` recibe los parámetros directamente como props: `<ResumenPerformanceMatriz :momentId="moment" :scores="evaluations[moment].scores" />`.
2. **Soporte ESM de Iconos:** Al integrar iconos desde `@iconoir/vue`, evitar nombres no soportados en la versión actual de la librería (como `Sprout`). Utilizar la correspondencia robusta: `Leaf` (Aprendiz), `Rocket` (Emprendedor), `Group` (Gerente) y `BrightCrown` (Empresario).
3. **Consistencia Tipográfica:** Todos los componentes del módulo de Asesoría consumen estrictamente la fuente `"Outfit", "Inter", sans-serif` a través de la clase utilitaria `font-display` y sus variaciones de peso tipográfico extra-negritas para garantizar uniformidad visual de alta gama.

---

## Changelog

### [v2.0.0 - Mayo 2026]
* **Estructura Multi-Momento:** Refactorizado el almacenamiento en Firestore de `diagnosticScores` hacia un mapa flexible por momentos (`inicial`, `ciclo1`, `ciclo2`, `final`) en `performanceStore.js`.
* **Wizard Modular:** Implementada la selección de momento inicial en el Wizard para dar trazabilidad completa a los avances del negocio.
* **Componente Analítico Avanzado:** Diseñado desde cero `ResumenPerformanceMatriz.vue` sustituyendo el uso de gráficos pesados por un gráfico analítico híbrido SVG/CSS ultra-rápido, interactivo y con soporte de filtros por áreas.
* **Tooltip y Leyendas Premium:** Reemplazados los tooltips tradicionales por overlays de glassmorphism blanco con descriptores de negocio dinámicos e iconos semánticos planos. Rediseñada la guía de niveles en grid 2x2 con barras de acento de color.
* **Auditoría de Build:** Completada la validación de empaquetado mediante Rollup exitosamente, garantizando cero errores sintácticos o de importación.
