# MANUAL METODOLÓGICO, ARQUITECTURA TÉCNICA Y SISTEMA UX/UI
## Vista del Facilitador / Consultor Técnico en EmprendeApp PWA

---

## 1. Ficha Técnica y Resumen Ejecutivo

| Parámetro | Detalle |
| :--- | :--- |
| **Módulo** | Módulo de Gestión de Cohortes, Auditoría y Mesa Técnica del Facilitador |
| **Aplicación** | EmprendeApp PWA (Offline-First) |
| **Audiencia** | Consultores de Negocios, Facilitadores de Campo y Coordinadores de Proyecto |
| **Entorno Objetivo** | Pantallas de Escritorio, Laptops y Tablets (Resoluciones de 1024px a 1920px+) |
| **Tecnologías Clave** | Vue 3.4+ (`<script setup>`, Composition API), Pinia con persistencia asíncrona, Tailwind CSS, Firebase Firestore v10 modular, IndexedDB (`idb`) |
| **Módulos Auditados** | Sesión 1 a Sesión 8 (Especialización interactiva para Sesión 6: Costeo y Sesión 7: Capital Semilla) |
| **Autenticación** | Acceso de facilitador verificado (Whitelist: `josenavarretedr@gmail.com`) |

### Propósito del Documento
Este manual detalla integralmente la arquitectura de información, los patrones de interfaz (UI), la experiencia de usuario (UX), los flujos de interacción y las leyes matemáticas y metodológicas que rigen la **Vista del Facilitador** en EmprendeApp.

A diferencia del módulo de los participantes (diseñado con enfoque *Mobile-First* para teléfonos de gama baja en campo), la vista del facilitador está concebida como una **estación de trabajo de alta densidad informativa (Desktop/Widescreen)** que permite:
1. Supervisar en tiempo real el semáforo pedagógico de cohorte.
2. Auditar, corregir y editar directamente los insumos de costeo (*"La Casera vs. El Plato"*) y el presupuesto de capital semilla.
3. Evaluar el cumplimiento presupuestario mediante switches interactivos de financiamiento.
4. Formalizar textos con Google Gemini inyectando contexto numérico real.
5. Gestionar la movilidad de participantes entre cohortes con auditoría inmutable y eliminación segura.

---

## 2. Mapa de Navegación y Arquitectura de Información

```mermaid
flowchart TD
    subgraph Auth ["Autenticación"]
        L[Login Facilitador] -->|Email Autorizado| S{Verificación Whitelist}
        S -->|josenavarretedr@gmail.com| D[Tablero de Control / Cohortes]
        S -->|No autorizado| ERR[Acceso Denegado]
    end

    subgraph Dashboard ["Pantalla Principal: Tablero y Semáforo"]
        D --> H1[Selector de Cohorte Activa]
        D --> H2[Configurador de Techo de Capital Semilla]
        D --> K1[Tarjetas de Métricas de Aula]
        D --> T1[Barra de Filtros y Búsqueda]
        D --> M1[Semáforo Denso S1 a S8]
        D --> ACT[Acciones por Fila: Plan / Mover / Eliminar]
    end

    subgraph Modals ["Modales de Soporte Operativo"]
        ACT -->|Clic en Mover| M_TRF[TransferCohortModal.vue<br/>Traslado con Trazabilidad]
        ACT -->|Clic en Eliminar| M_DEL[DeleteParticipantModal.vue<br/>Confirmación y Purga Atómica]
        ACT -->|Clic en Plan| M_EXP[ExportConfirmationModal.vue<br/>Descarga Word .docx]
        D -->|Clic en Exportar Cohorte| M_ZIP[ExportProgressModal.vue<br/>Compilación Masiva ZIP]
        D -->|Clic en Importar| M_IMP[ImportParticipantsModal.vue<br/>Carga Masiva Excel/CSV]
        D -->|Clic en Nuevo| M_NEW[NewParticipantModal.vue<br/>Alta Rápida de Emprendedor]
    end

    subgraph Review ["Cajón de Auditoría Rápida (ReviewDrawer.vue)"]
        M1 -->|Clic en Celda S1 a S8| RD{Sesión Seleccionada}
        RD -->|S1, S2, S3, S4, S5, S8| QUAL[Vistas Cualitativas<br/>Canvas, Identidad, Estrategia]
        RD -->|S6: Costeo Directo| S6_REV[FacilitatorCostingReview.vue<br/>Matriz Widescreen, Recetas y Badges]
        RD -->|S7: Capital Semilla| S7_REV[FacilitatorInvestmentReview.vue<br/>Matriz Densa, Switches y Techos]
        
        QUAL & S6_REV & S7_REV --> AI[✨ Formalización Asistida Gemini]
        QUAL & S6_REV & S7_REV --> DRAFT[💾 Guardar Borrador]
        QUAL & S6_REV & S7_REV --> APPR[✓ Aprobar Sesión y Desbloquear Gatekeeper]
    end
```

---

## 3. Experiencia de Usuario (UX) del Tablero Principal

La vista principal (`CohortTableView.vue` y `CohortTrafficLight.vue`) concentra todas las herramientas necesarias para la gestión del aula en una sola interfaz sin paginaciones innecesarias.

### 3.1. Barra Superior Institucional
* **Selector Rápido de Cohorte:** Dropdown persistente en `localStorage` (`emprendeapp_facilitator_cohort`). Permite alternar instantáneamente entre cohortes territoriales (ej. *OIT-CHICLAYO-01*, *ACNUR-LIMA-02*, *COHORTE-LOCAL-OFFLINE*).
* **Techo Dinámico de Capital Semilla:** Botón destacado con fondo esmeralda que muestra el fondo asignado a la cohorte (ej. `🌱 Fondo: S/ 3,000.00`). Al hacer clic, abre un modal ágil para actualizar el techo, impactando de inmediato en los cálculos de la Sesión 7.
* **Perfil del Consultor:** Muestra el facilitador activo y botón de cierre de sesión seguro.

### 3.2. Tarjetas de Métricas Rápidas (KPIs de Aula)
Ubicadas en la parte superior para diagnóstico inmediato:
1. **Participantes Activos:** Total de emprendedores inscritos en la cohorte seleccionada.
2. **Por Revisar (IA):** Contador de módulos donde el participante ya completó su formulario y la propuesta técnica de Gemini está a la espera del visto bueno del facilitador. Destacado con anillo amarillo parpadeante si es mayor a cero.
3. **Planes Concluidos:** Cantidad de participantes con las 8 sesiones aprobadas (100% de la ruta).
4. **Avance Promedio del Aula:** Barra de progreso porcentual del grupo para identificar rezagos colectivos.

### 3.3. Sistema de Filtros y Búsqueda Reactiva
* **Búsqueda en Vivo:** Filtra en tiempo real por DNI, nombres, apellidos o nombre comercial del negocio.
* **Foco de Sesión:** Permite aislar una columna específica (ej. *"Solo S6: Costeo"* o *"Solo S7: Inversión"*), expandiendo la visibilidad de esa sesión para revisiones temáticas intensivas.
* **Filtro por Estado Pedagógico:**
  * `Todos los participantes`
  * `🟨 Pendientes de revisión` (Prioridad de atención)
  * `⏳ Rezagados (≤ 1 módulo completado)`
  * `🟩 Concluidos (8 de 8 sesiones)`

---

## 4. El Semáforo Pedagógico de Aula (`CohortTrafficLight.vue`)

### 4.1. Código Semafórico de Celdas
Cada intersección entre un participante y una sesión (S1 a S8) se renderiza mediante un botón táctil con retroalimentación visual estandarizada:

| Estado | Color y Apariencia | Significado Metodológico | Interacción al Clic |
| :--- | :--- | :--- | :--- |
| **Aprobado** | 🟩 Fondo esmeralda suave, texto verde oscuro (`✓`) | La sesión fue auditada y validada por el consultor. Cumple 100% de requisitos. | Abre el cajón de auditoría en modo de consulta o reedición técnica. |
| **Pendiente de Revisión** | 🟨 Fondo ámbar brillante, borde amarillo, **animación de pulso continuo (`⚠️`)** | El participante completó el quiz y envió su formulario. La IA procesó la propuesta y espera visto bueno. | Abre el cajón con foco inmediato en las notas técnicas y botones de aprobación. |
| **En Curso** | 🟦 Fondo azul pálido, borde azul claro (`✏️`) | El participante se encuentra respondiendo preguntas o avanzando en la sesión. | Permite al facilitador ver borradores preliminares para asistencia pedagógica. |
| **Bloqueado** | ⬜ Fondo grisáceo neutro (`🔒`) | Sesión inaccesible por el motor de gatekeeping (no ha completado la sesión previa). | Bloqueado si no hay datos; accesible si hay respuestas previas guardadas. |

### 4.2. Columnas Fijas (Sticky Columns)
Para evitar que el facilitador pierda el contexto del participante en pantallas anchas:
* **Columna DNI:** Fijada a la izquierda (`sticky left-0`).
* **Columna Nombre y Apellidos:** Fijada a la izquierda (`sticky left-28`), mostrando:
  * Nombres completos en negrita.
  * Teléfono de contacto con icono directo.
  * **Badge de Trazabilidad `⇄ Trasladado (N)`:** Aparece si el participante proviene de otra cohorte. Al hacer clic, abre directamente el historial cronológico de traslados.
* **Columna Acciones:** Fijada a la derecha (`sticky right-0`, `min-w-[240px]`), garantizando acceso instantáneo a los botones operativos sin desplazarse.

### 4.3. Acciones por Fila de Participante
1. **`📥 Plan`:** Descarga individual del Plan de Negocios en formato Word (`.docx`). Si el participante tiene sesiones sin aprobar, despliega una advertencia preventiva consultando si desea exportar con borradores.
2. **`🔄 Mover`:** Dispara el modal de traslado entre cohortes.
3. **`🗑️ Eliminar`:** Abre el modal de confirmación crítica de eliminación.

---

## 5. Modal de Transferencia entre Cohortes (`TransferCohortModal.vue`)

Permite mover participantes entre cohortes territoriales preservando el 100% de su progreso pedagógico y generando una cadena inmutable de auditoría.

```
┌────────────────────────────────────────────────────────────────────────┐
│  ⇄ Transferir Participante de Cohorte                                  │
├────────────────────────────────────────────────────────────────────────┤
│  [ Pestaña 1: Realizar Traslado ]    [ Pestaña 2: Historial (2) ]      │
├────────────────────────────────────────────────────────────────────────┤
│  Emprendedora: María Flores (DNI 45892134) - Confecciones María        │
│                                                                        │
│  Cohorte Origen:                      Cohorte Destino:                 │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│  │ ACNUR-LIMA-02           │   ───>   │ OIT-CHICLAYO-01             │  │
│  │ Techo: S/ 2,000.00      │          │ Techo: S/ 3,000.00          │  │
│  └─────────────────────────┘          └─────────────────────────────┘  │
│                                                                        │
│  Motivo del Traslado:                                                  │
│  [ Reubicación territorial o cambio de domicilio                   ▼ ] │
│                                                                        │
│  Observaciones y Justificación Técnica:                                │
│  [ Traslado de taller textil a Chiclayo por motivo familiar...       ] │
│                                                                        │
│  [ Cancelar ]                               [ ⇄ Confirmar Traslado ]   │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.1. Reglas Técnicas y Transaccionales
* **Transacción Atómica en Firestore (`writeBatch`):**
  * Modifica `participants/{dni}` actualizando `cohortId: toCohortId`.
  * Migra los **8 documentos de sesión** (`session_progress/{dni}_S1` a `S8`) a la nueva cohorte, evitando participantes huérfanos en los semáforos.
  * Registra la auditoría en `cohort_transfers/{transferId}` y añade el evento a `cohortHistory` dentro del documento del participante.
  * Si el participante ya tenía formulado su presupuesto en la Sesión 7, sincroniza el nuevo techo de capital semilla (`seedCapitalCeiling`).
* **Soporte Offline-First:** Actualiza inmediatamente las tablas locales de `indexedDB.js` (`participants` y `session_progress`).
* **Pestaña de Historial de Trazabilidad:** Muestra una línea de tiempo cronológica con traslados anteriores, facilitador responsable, fechas exactas y variaciones de techo financiero.

---

## 6. Modal de Eliminación Segura (`DeleteParticipantModal.vue`)

Garantiza que la eliminación de un participante sea un acto consciente, explícito y auditado, evitando pérdidas accidentales de información.

```
┌────────────────────────────────────────────────────────────────────────┐
│  🗑️ Eliminar Participante de la Cohorte                                │
├────────────────────────────────────────────────────────────────────────┤
│  Cohorte activa: OIT-CHICLAYO-01                                       │
│                                                                        │
│  ┌─ Resumen del Emprendedor ─────────────────────────────────────────┐ │
│  │ Juan Pérez (DNI: 12345678)                                        │ │
│  │ Negocio: Panadería Juanito                                        │ │
│  │ Avance Pedagógico: 3 de 8 módulos completados                     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ⚠️ Advertencia Crítica:                                               │
│  Esta acción eliminará al participante de la cohorte actual junto con  │
│  sus registros de sesiones, costeo y borradores de plan de negocios.   │
│                                                                        │
│  [ Cancelar ]                              [ 🗑️ Sí, eliminar participante ]
└────────────────────────────────────────────────────────────────────────┘
```

### 6.1. Acciones de Purga y Contingencia
* **Purga Atómica en Firestore:** Elimina en lote `participants/{dni}`, `session_progress/{dni}_S1..S8`, `costing_module/{dni}` y las 8 secciones de `business_plan_sections`.
* **Registro de Auditoría:** Escribe un documento en `cohort_deletions/{deletionId}` registrando el facilitador responsable (`josenavarretedr@gmail.com`), fecha y motivo técnico.
* **Capa de Contingencia Resiliente:** El componente contiene lógica de fallback directo a Firestore/IndexedDB en caso de que una pestaña antigua del navegador mantenga en memoria una versión desactualizada del store de Pinia.

---

## 7. Cajón de Auditoría Rápida (`ReviewDrawer.vue`)

El cajón deslizante es el corazón operativo del facilitador para auditar el trabajo pedagógico y técnico de cada participante.

### 7.1. Ancho Adaptativo por Sesión
* **Sesiones Cualitativas (S1, S2, S3, S4, S5, S8):** Configurado con `max-w-3xl` (ancho óptimo de lectura para textos largos, visión, misión, propuesta de valor y modelo Canvas).
* **Sesiones Analíticas Complejas (S6 Costeo y S7 Inversión):** Se expande automáticamente a **`max-w-6xl`** (ancho extendido de escritorio), permitiendo visualizar matrices de costeo, tablas de recetas y switches presupuestarios sin hacinamiento visual.

### 7.2. Controles Globales de Auditoría
* **Navegación Secuencial:** Botones `◀ Anterior` y `Siguiente ▶` para auditar participantes consecutivos de la cohorte sin cerrar el cajón.
* **Botón "💾 Guardar Borrador":** Guarda las correcciones numéricas o notas técnicas en Firestore manteniendo la sesión en estado `pendiente_revision`.
* **Botón "✓ Aprobar Sesión":** Valida oficialmente la sesión, cambia el estado a `completado` (Verde en el semáforo) y desbloquea automáticamente la Sesión $N+1$ para el participante en su dispositivo móvil.

---

## 8. Módulo Interactivo de Costeo (Sesión 6 - `FacilitatorCostingReview.vue`)

Implementa la misma lógica pedagógica que el participante (*"La Casera vs. El Plato"*), pero adaptada para edición ágil en pantalla ancha.

### 8.1. Matriz Operativa de 4 Columnas
En la cabecera de cada producto, el facilitador puede editar directamente:
1. **Tamaño de Tanda (`batchSize`):** Cuántas unidades rinde una preparación (ej. *12 porciones*).
2. **Frecuencia de Producción:** Selector (Diario, Interdiario, Semanal, Quincenal, Mensual) con cálculo automático de tandas mensuales.
3. **Precio de Venta Sugerido:** Precio al consumidor final en Soles (S/).
4. **Ventas Mensuales Estimadas:** Volumen de comercialización proyectado.

### 8.2. Badges Metodológicos de 2 Niveles
Cada insumo registrado se presenta mediante el componente unificado `IngredientRow.vue`, que muestra:
* **Insignia Ámbar (Receta / Tanda):**
  $$\text{Consumo en Tanda} = \text{quantityUsed} \quad \text{y} \quad \text{Consumo Unitario} = \frac{\text{quantityUsed}}{\text{batchSize}}$$
* **Insignia Azul (Mercado / La Casera):**
  $$\text{Presentación Comercial} = \text{packageUnitName} \quad \text{y} \quad \text{Costo Unitario Mercado} = \frac{\text{packageCost}}{\text{quantityInPackage}}$$
* **Insignia Verde Esmeralda (Costo Directo Unitario):**
  $$\text{Costo en el Plato} = \frac{\text{quantityUsed} \times \text{unitCostFromMarket}}{\text{batchSize}}$$
* **Desglose Didáctico Progresivo (`ℹ️`):** Acordeón colapsable con la explicación aritmética paso a paso y el cálculo de **remanente en stock** (capital de trabajo inmovilizado).

### 8.3. Gestión In-Situ de Insumos y Polimorfismo
* **Botón `+ Agregar Insumo`:** Abre la hoja reutilizable `AddIngredientSheet.vue` para seleccionar insumos predefinidos o registrar nuevos.
* **Polimorfismo de Negocio:**
  * **Producción:** Lotes, ingredientes, conversión de unidades (kg, gr, L, ml) y remanentes.
  * **Servicios ("El Minutero"):** Editor de costo por minuto según sueldo deseado, días trabajados y horas/día, más suministros descartables y frascos rendidores.
  * **Comercio ("El Mayorista"):** Bultos de reventa, flete prorrateado por viaje y costo unitario de empaque.

---

## 9. Módulo Interactivo de Inversión (Sesión 7 - `FacilitatorInvestmentReview.vue`)

Transformado en una **matriz operativa densa** con **switches táctiles de financiamiento** para evaluar la viabilidad del subsidio de Capital Semilla.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🌱 PLAN DE INVERSIÓN Y CAPITAL SEMILLA (Sesión 7)                      [ ✓ Presupuesto Conforme ]    │
│  Techo Oficial: S/ 3,000.00 | Subsidio Solicitado: S/ 2,450.00 (82%) | Saldo Disponible: S/ 550.00     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Todos los Rubros (5) ]  [ Rubro A: Equipos (2) ]  [ Rubro B: Insumos S6 (2) ]  [ Rubro C: Propio (1) ] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  #  │ Rubro   │ Descripción             │ Cantidad │ P. Unit (S/) │ Total (S/) │ Fuente Financiamiento     │
│ ───┼─────────┼─────────────────────────┼──────────┼──────────────┼────────────┼───────────────────────────│
│  1  │ Rubro A │ Batidora Industrial 10L │  1 unid  │   2,000.00   │  2,000.00  │ [  (•) 🌱 Semilla  ]     │
│  2  │ Rubro A │ Horno Convector 4 Band. │  1 unid  │   1,500.00   │  1,500.00  │ [  (•) 👤 Propio   ]     │
│  3  │ Rubro B │ Harina y Huevos (S6)    │  1 mes   │     450.00   │    450.00  │ [  (•) 🌱 Semilla  ]     │
│  4  │ Rubro C │ Mano de Obra Propia     │  1 mes   │   1,200.00   │  1,200.00  │ 🔒 Aporte Propio (Fijo)   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Subtotales:                                                                                           │
│  Rubro A: Semilla S/ 2,000.00 | Propio S/ 1,500.00      Rubro B: Semilla S/ 450.00                     │
│  Rubro C: Propio S/ 1,200.00                            TOTAL INVERSIÓN: S/ 5,150.00                   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 9.1. Dashboard de Techo Presupuestal
* **Evaluación en Tiempo Real:** Calcula instantáneamente si la suma de los ítems con switch en `Capital Semilla` respeta el techo de la cohorte.
* **Badge Dinámico de Cumplimiento:**
  * `✓ Presupuesto Conforme`: Cuando $\text{allocatedSeedCapital} \le \text{seedCapitalCeiling}$.
  * `⚠️ Sobregirado en S/ [Monto]`: En rojo pulsante cuando excede el techo permitido.
* **Barra de Progreso Semántica:** Se colorea en verde hasta el 90%, ámbar entre 90% y 100%, y rojo brillante al sobregirar.

### 9.2. Edición In-Line en la Matriz Densa
* **Edición Directa:** El facilitador puede tipear directamente sobre la descripción, la cantidad, la unidad de medida y el precio unitario estimado.
* **Recálculo Reactivo:** Al modificar cualquier valor, se recalculan en tiempo real:
  $$\text{totalPrice} = \text{quantity} \times \text{unitPriceEstimated}$$
  $$\text{allocatedSeedCapital} = \sum_{i \in \text{Financiados}} \text{totalPrice}_i$$
  $$\text{ownContribution} = \sum_{j \notin \text{Financiados}} \text{totalPrice}_j$$
  $$\text{remainingBudget} = \text{seedCapitalCeiling} - \text{allocatedSeedCapital}$$

### 9.3. Switch Táctil de Financiamiento
* **Mano de Obra Propia (Rubro C):** Protegida permanentemente con badge `🔒 Aporte Propio (Fijado)`. La contrapartida de dedicación del participante no puede cobrarse con dinero del donante.
* **Demás Ítems (Rubro A, B y adecuaciones):** Switch accesible:
  * **ON (Verde Esmeralda):** Asignado a `🌱 Semilla`.
  * **OFF (Ámbar / Pizarra):** Reasignado a `👤 Propio` (contrapartida).
  * Permite al consultor *"jugar"* con la asignación en vivo frente al emprendedor hasta calzar el presupuesto en el techo exacto de la cohorte.

---

## 10. Capa de Asistencia con Inteligencia Artificial (Gemini Dual-State)

Para evitar que el participante pierda su voz original y al mismo tiempo entregar un plan técnicamente impecable a los cooperantes, el sistema utiliza un modelo de **Tres Estados de Información**:

```
[ Texto Original del Participante ] ──> (rawInput)
                │
                ▼
[ Inyección de Contexto Numérico Real S6 y S7 ]
                │
                ▼
[ Asistente Gemini Serverless ]      ──> (aiRefinement) ──> Estado: 'pendiente_revision'
                │
                ▼
[ Edición y Visto Bueno del Consultor]──> (finalApprovedText) ──> Estado: 'aprobado'
```

### 10.1. Inyección de Contexto Numérico Enriquecido
En las sesiones 6 y 7, el botón **"✨ Formalizar con Asistente (Gemini)"** no envía texto aislado; inyecta programáticamente las métricas actualizadas calculadas en la mesa técnica:
* **Para Sesión 6:**
  > *"Producto 'Queque de Plátano' (produccion): Costo Directo Unitario = S/ 1.45, Precio Venta = S/ 4.00, Margen Bruto = 63.8% (S/ 2.55 por unidad), Ganancia Bruta Mensual Est. = S/ 1,224.00."*
* **Para Sesión 7:**
  > *"Inversión Total del Negocio = S/ 5,150.00, Subsidio Capital Semilla Solicitado = S/ 2,450.00 (Tope S/ 3,000.00), Aporte Propio Contrapartida = S/ 2,700.00, Saldo Disponible = S/ 550.00. Rubro A (Equipos): 2 ítems. Rubro B (Insumos S6): 2 ítems. Rubro C (Mano de Obra): 1 ítem. Cumplimiento: Conforme."*

Esto asegura que la redacción generada por la IA coincida al 100% con los números del presupuesto final.

---

## 11. Sistema de Diseño UI y Guía de Estilos (Tailwind CSS)

### 11.1. Paleta de Colores Institucional
* **Primario (Acciones & Navegación):** Azul PlanSeed (`bg-blue-600`, `hover:bg-blue-700`, `text-blue-900`).
* **Conformidad Presupuestal y Aprobaciones:** Esmeralda (`bg-emerald-500/20`, `text-emerald-300`, `bg-emerald-600`).
* **Revisiones Pendientes y Contrapartida:** Ámbar cálido (`bg-amber-100`, `text-amber-900`, `border-amber-300`).
* **Alertas Críticas y Sobregiros:** Carmesí / Rosa peligro (`bg-rose-50`, `text-rose-700`, `bg-rose-600`).
* **Rubros Específicos:**
  * Rubro A (Equipos): Púrpura / Morado (`bg-purple-100`, `text-purple-900`).
  * Rubro B (Insumos S6): Verde esmeralda (`bg-emerald-100`, `text-emerald-900`).
  * Rubro C (Contrapartida): Índigo corporativo (`bg-indigo-100`, `text-indigo-900`).

### 11.2. Tipografía y Jerarquía Numérica
* **Cifras Monetarias y Cantidades:** Fuente monoespaciada (`font-mono font-bold`), facilitando la comparación tabular vertical de números decimales.
* **Etiquetas y Metadatos:** Texto en mayúsculas compactas con tracking ampliado (`text-[10px] uppercase font-bold tracking-wider`).
* **Campos de Entrada en Pantalla Ancha:** Altura mínima accesible de interacción de 36px a 44px, con bordes de contraste suave (`border-slate-200`) que se iluminan al foco (`focus:ring-2 focus:ring-blue-500`).

---

## 12. Verificación y Pruebas Automatizadas

La estabilidad de la vista del facilitador se encuentra respaldada por suites de pruebas automatizadas ejecutadas con Node.js nativo en la carpeta `/test`:

| Archivo de Prueba | Casos Validados | Cobertura |
| :--- | :--- | :---: |
| [`test/facilitator_investment_interactive.test.mjs`](file:///c:/Users/User/Proyectos/plan-seed/test/facilitator_investment_interactive.test.mjs) | • Detección de sobregiro presupuestal inicial<br>• Conmutación de switches Capital Semilla vs. Propio<br>• Edición in-line de precios y cantidades<br>• Alta de nuevos ítems de inversión<br>• Bloqueo inmutable de mano de obra propia | **100% (5/5)** |
| [`test/facilitator_costing_interactive.test.mjs`](file:///c:/Users/User/Proyectos/plan-seed/test/facilitator_costing_interactive.test.mjs) | • Paridad de fórmulas "La Casera vs. El Plato"<br>• Remanente en despensa y costo de lote<br>• Recálculo por cambio de tamaño de tanda y precio<br>• Modalidades Servicios ("El Minutero") y Comercio ("El Mayorista") | **100% (3/3)** |
| [`test/cohort_delete_participant.test.mjs`](file:///c:/Users/User/Proyectos/plan-seed/test/cohort_delete_participant.test.mjs) | • Purga de arreglo de participantes en tiempo real<br>• Limpieza de las 8 sesiones asociadas en memoria<br>• Cierre automático de ReviewDrawer si estaba activo<br>• Validación de 18 rutas atómicas y registro `del_*` | **100% (4/4)** |
| [`test/cohort_transfer_traceability.test.mjs`](file:///c:/Users/User/Proyectos/plan-seed/test/cohort_transfer_traceability.test.mjs) | • Trazabilidad en `cohortHistory` inmutable<br>• Migración íntegra de las 8 sesiones a nueva cohorte<br>• Múltiples transferencias sucesivas<br>• Reconciliación con nuevo techo financiero | **100% (3/3)** |
