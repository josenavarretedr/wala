# 🏢 Módulo de Asesoría de Negocios (BusinessConsulting)

**Última actualización:** Mayo 2026 — Rediseño de Resumen, Plan de Acción Filtrado y Unificación de Color de Marca
**Versión:** 2.1.0
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
    B -->|Visualiza Resumen Estructurado| H[Pestaña Resumen]
    H --> H1[ActualLevelCard.vue]
    H --> H2[CriticalAreasSelected.vue]
    H --> H3[ActionPlanView.vue:onlyPending]
    E -->|Interactúa y Actualiza| F[performanceStore.js Pinia]
    F -->|Lectura/Escritura Realtime| G[(Firestore: businesses/{id}/consulting/dossier)]
```

### Componentes y Ubicaciones Clave

| Componente / Archivo | Propósito | Ruta en el Proyecto |
| :--- | :--- | :--- |
| `ConsultingDashboard.vue` | Contenedor principal del Dashboard. Administra la navegación por pestañas (Resumen, Desempeño, Áreas Críticas, Plan de Acción) y valida los privilegios de administrador. | [ConsultingDashboard.vue](file:///c:/Users/User/Proyectos/wala/src/views/Consulting/ConsultingDashboard.vue) |
| `ItemsConsulting.vue` | Barra de pestañas de navegación horizontal para escritorio y vertical para dispositivos móviles. | [ItemsConsulting.vue](file:///c:/Users/User/Proyectos/wala/src/components/consulting/ItemsConsulting.vue) |
| `ActualLevelCard.vue` | Componente premium que visualiza de manera atractiva el nivel de madurez alcanzado, los momentos evaluados y el historial de evaluaciones. | [ActualLevelCard.vue](file:///c:/Users/User/Proyectos/wala/src/components/consulting/ActualLevelCard.vue) |
| `CriticalAreasSelected.vue` | Renderiza las 3 áreas críticas priorizadas con sus puntuaciones. Si no hay áreas seleccionadas, muestra una tarjeta de estado vacío (Empty State). | [CriticalAreasSelected.vue](file:///c:/Users/User/Proyectos/wala/src/components/consulting/CriticalAreasSelected.vue) |
| `CriticalAreasSelect.vue` | Wizard interactivo para que el consultor priorice y seleccione las 3 áreas críticas más relevantes en el momento actual del negocio. | [CriticalAreasSelect.vue](file:///c:/Users/User/Proyectos/wala/src/components/consulting/CriticalAreasSelect.vue) |
| `ActionPlanView.vue` | Muestra las tareas del Plan de Acción agrupadas por área empresarial, con barra de progreso, checkboxes reactivos y capacidad de filtrado exclusivo de pendientes (`onlyPending`). | [ActionPlanView.vue](file:///c:/Users/User/Proyectos/wala/src/components/consulting/ActionPlanView.vue) |
| `ActionPlanCreate.vue` | Interfaz interactiva de creación de tareas del Plan de Acción basada en las áreas críticas priorizadas de la empresa. | [ActionPlanCreate.vue](file:///c:/Users/User/Proyectos/wala/src/components/consulting/ActionPlanCreate.vue) |
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
  * Visualización consultiva de las 4 pestañas de Asesoría.
  * El **Resumen** ejecutivo muestra de manera secuencial y estructurada el nivel actual del negocio (`ActualLevelCard`), sus 3 áreas críticas priorizadas (`CriticalAreasSelected`) y los próximos compromisos pendientes de su plan de acción (`ActionPlanView` con `:onlyPending="true"`), promoviendo la concentración en los objetivos inmediatos sin distracciones.
  * Acceso al historial analítico de todos los ciclos de madurez registrados en la pestaña de Desempeño. No se permite invocar los Wizards de evaluación o creación de planes.

### 2. Vista de Administrador/Asesor (Escritura y Asesoramiento)
* **Ruta de acceso:** `/admin/users/:businessId` (proveniente del directorio administrativo de usuarios).
* **Permisos:** Restringido a correos con privilegios explícitos configurados en el array `ADMIN_EMAILS` (ej: `josenavarretedr@gmail.com`, `admin@wala.lat`).
* **Comportamiento:**
  * **Configuración del Expediente:** Capacidad de inicializar diagnósticos e invocar los wizards interactivos de evaluación y priorización.
  * **Asistente de Desempeño:** Habilita el botón **"Agregar o Guardar Desempeño"**, el cual despliega el Wizard interactivo (`PerformanceMatrix`) a pantalla completa para calificar al negocio.
  * **Gestión de Planes y Áreas:** Habilita la creación y actualización del Plan de Acción y la priorización de Áreas Críticas a través de sus respectivos modales y botones dedicados.
  * **Directorio de Retorno:** Añade una barra superior informativa que identifica al negocio evaluado y a su dueño, permitiendo regresar limpiamente al directorio de administración de usuarios.

---

## 💾 Estructura y Modelo de Datos en Firestore

Toda la información del expediente se consolida en un único documento centralizado por negocio para maximizar la eficiencia en lecturas.

### Path: `businesses/{businessId}/consulting/dossier`

```typescript
interface ConsultingDossier {
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

  // Áreas Críticas Priorizadas (Máximo 3)
  criticalAreas: Array<{
    areaKey: string;            // ej: "negocioFamilia"
    score: number;              // Promedio de desempeño actual en esa área
    justification?: string;     // Comentario de justificación del consultor
  }>;

  // Plan de Acción Estructurado
  actionPlan: Array<{
    id: string;                 // UID único de la tarea
    areaKey: string;            // ej: "marketing"
    indicatorKey?: string;      // ej: "2.3"
    actionText: string;         // Descripción de la tarea de mejora
    frequency: string;          // ej: "Semanal" | "Diario" | "Mensual"
    walaSection?: string;       // Sección vinculada (ej: "comercial", "inventario")
    status: 'pending' | 'completed'; // Estado de la tarea
    createdAt?: Timestamp;
  }>;
}

interface MomentEvaluation {
  scores: Record<string, number>;     // Clave del indicador (ej: "1.1") -> Nivel (0 a 3)
  comments: Record<string, string>;   // Clave del indicador -> Observación/Evidencia
}
```

> [!NOTE]
> Cuando se guarda o actualiza la asesoría de un negocio, el sistema marca el flag `hasConsulting: true` en el documento raíz del negocio (`businesses/{businessId}`) para habilitar indexación rápida y filtros avanzados en el listado general de clientes y negocios.

---

## 🎨 Identidad de Marca WALA (Paleta Coral #E35336)

Con el fin de consolidar una experiencia de usuario altamente representativa y uniforme, se ha erradicado el uso de colores genéricos de Tailwind (como `teal-600`) para dar total protagonismo al color oficial de WALA **`#E35336`** (Coral/Naranja de Marca):

* **Botones e Interacciones Principales:** Los botones de envío, botones activos del wizard, y elementos interactivos clave usan la clase `bg-[#E35336]` con transiciones hacia un hover en contraste oscuro `hover:bg-[#c2412b]`.
* **Focos y Anillos de Input:** Los bordes activos y focos de accesibilidad de elementos de formulario usan `focus:border-[#E35336] focus:ring-[#E35336]`.
* **Textos Destacados y Enlaces:** Títulos principales de componentes y estados activos en pestañas usan `text-[#E35336]`.
* **Opacidades de Destaque:** Para fondos y badges secundarios se emplean opacidades estilizadas como `bg-[#E35336]/10 text-[#E35336]`, logrando un equilibrio cromático sin contaminar visualmente la pantalla.
* **Spinners de Carga:** Los estados de procesamiento en red muestran un spinner animado uniforme en color `#E35336`.

*Nota: Se conserva intencionalmente la escala cromática de la pestaña de Desempeño (Matriz de Calificaciones) ya que los colores Verde, Amarillo y Rojo responden a un estándar de semaforización cualitativa internacional para el nivel de madurez diagnóstica de la empresa.*

---

## 📐 Simplificación Estética y Enfoque Clean Flat Design

Se han eliminado los bordes dobles, sombras densas y gradientes exagerados para favorecer una arquitectura de componentes plana, espaciosa y minimalista:

* **Eliminación de Bordes Anidados (Clutter):** Se retiró el borde rígido que envolvía a todo el plan de acción, liberando a las tarjetas individuales para respirar en un espacio unificado. Los bloques temáticos ahora se separan visualmente mediante sutiles separaciones `border-slate-100`.
* **Diseño Plano de Progreso:** La barra de progreso de tareas completadas se ha simplificado a un fondo liso coral `#E35336` acompañado de una base de contraste tenue, eliminando gradientes azul-verdosos que no correspondían a la paleta de la aplicación.
* **Tarjetas Estilizadas con Hover Dinámico:** Las tareas del plan de acción se presentan en tarjetas limpias con un borde gris ultra-suave. Al colocar el cursor sobre ellas, se activa una micro-animación que ilumina delicadamente el borde en `#E35336` y proyecta una sombra leve para invitar al clic.
* **Banner de Logro Completo ("¡Todo al día!"):** En caso de que el cliente haya completado todas sus tareas pendientes, el componente `ActionPlanView` reemplaza la grilla vacía por una tarjeta premium de celebración que felicita al usuario por su disciplina, animando a mantener su excelente desempeño.

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

---

## 📊 Módulo Analítico: Gráfico y Resumen de Desempeño

El componente `ResumenPerformanceMatriz.vue` provee la pieza visual clave del módulo, diseñada bajo rigurosos criterios de estética moderna y experiencia de usuario.

### 🎨 Color Scheme y Rango de Madurez (Tailwind Semantic Rules)
Para asegurar sobriedad y profesionalismo corporativo, el módulo descarta los degradados llamativos y unifica las representaciones de madurez mediante una paleta de colores planos sofisticados y complementarios:

| Nivel | Rango de Puntuación | Color Tailwind | Icono Vectorial | Significado Cualitativo |
| :--- | :---: | :--- | :---: | :--- |
| **Aprendiz** | `0.0 – 0.4` | `rose-500` / `rose-50` | `Leaf` | Fase inicial: Prácticas informales, reactivas y sin control operativo. |
| **Emprendedor** | `0.5 – 1.4` | `amber-500` / `amber-50` | `Rocket` | Fase de tracción: Estructuras básicas bajo esfuerzo y soporte meramente individual. |
| **Gerente** | `1.5 – 2.4` | `emerald-500` / `emerald-50` | `Group` | Fase de control: Delegación funcional, registros estables y control del día a día. |
| **Empresario** | `2.5 – 3.0` | `indigo-500` / `indigo-50` | `BrightCrown` | Fase estratégica: Decisiones guiadas por datos e indicadores integrados. |

---

## 📝 Notas Técnicas y Buenas Prácticas de Mantenimiento

1. **Reactive Array Updates en Firestore:** Para asegurar la reactividad instantánea del plan de acción y evitar desincronizaciones entre el panel de administración y el de usuario, los estados de las tareas se actualizan directamente en Firestore utilizando `updateDoc` sobre el array de objetos, refrescando automáticamente la suscripción del cliente.
2. **Prop de Restricción `onlyPending`:** El prop `:onlyPending="true"` en `ActionPlanView.vue` filtra de manera dinámica en el *computed* local los elementos cuyo estado no sea `'completed'`. Esto permite reutilizar el componente en la pestaña completa de "Plan de Acción" (donde se muestran todas las tareas) y en el "Resumen" (donde solo se muestran las pendientes).
3. **Control del Estado Vacío (Empty State):** Cuando `criticalAreas` está vacío, `CriticalAreasSelected.vue` renderiza un contenedor optimizado que invita al usuario a consultar a su asesor. Para administradores, añade un botón directo con el color `#E35336` que redirige o despliega el editor de áreas críticas.

---

## Changelog

### [v2.1.0] - Mayo 2026
* **Unificación Cromática Oficial WALA (#E35336):** Migración completa del color de destaque, spinners, e interacciones del módulo de `teal-600` a `#E35336` (con hover en `#c2412b` y alta legibilidad de contraste).
* **Nueva Estructura de Resumen Ejecutivo:** Reorganización total de la pestaña de Resumen. Se eliminaron las cajas genéricas de texto y se integraron de forma interactiva y secuencial:
  1. `ActualLevelCard.vue`
  2. `CriticalAreasSelected.vue`
  3. `ActionPlanView.vue` en modo de pendientes exclusivas (`:onlyPending="true"`).
* **Diseño Plano de Tareas (Bordes Suprimidos):** Se eliminaron los bordes anidados y cajas rígidas en el plan de acción, rediseñando las tarjetas individuales con hover de iluminación sutil y transiciones de sombra.
* **Banner de Cumplimiento:** Incorporación del estado "¡Todo al día!" mediante un banner premium que felicita visualmente al microempresario al concluir sus tareas pendientes.
* **Soporte de Esquema Estructurado:** Actualización en la documentación de Firestore para reflejar el uso del array reactivo `actionPlan` y las áreas críticas priorizadas.

### [v2.0.0] - Mayo 2026
* **Estructura Multi-Momento:** Refactorizado el almacenamiento en Firestore de `diagnosticScores` hacia un mapa flexible por momentos (`inicial`, `ciclo1`, `ciclo2`, `final`) en `performanceStore.js`.
* **Wizard Modular:** Implementada la selección de momento inicial en el Wizard para dar trazabilidad completa a los avances del negocio.
* **Componente Analítico Avanzado:** Diseñado desde cero `ResumenPerformanceMatriz.vue` sustituyendo el uso de gráficos pesados por un gráfico analítico híbrido SVG/CSS ultra-rápido, interactivo y con soporte de filtros por áreas.
* **Tooltip y Leyendas Premium:** Reemplazados los tooltips tradicionales por overlays de glassmorphism blanco con descriptores de negocio dinámicos e iconos semánticos planos. Rediseñada la guía de niveles en grid 2x2 con barras de acento de color.
