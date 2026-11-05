# Product Requirements Document (PRD)

**Nombre del Producto (Provisional):** EmprendeApp / PlanSeed PWA  
**Versión:** 1.0  
**Estado:** Borrador Aprobado para Benchmarking y Diseño Técnico  

---

## 1. Resumen Ejecutivo y Problema

### 1.1. Contexto del Problema
En programas de medios de vida y empleabilidad para población vulnerable financiados por la cooperación internacional y ONGs, la formulación de planes de negocio suele realizarse en cuadernillos físicos durante talleres presenciales.

Esto genera dos fallas críticas:
* **Fricción pedagógica:** Dificultad para trasladar conceptos teóricos y numéricos (costeo unitario, compras por mayor vs. recetas) a un formato estructurado.
* **Cuello de botella operativo:** Al finalizar las capacitaciones, el consultor asume manualmente la transcripción, redacción formal y cuadratura financiera de decenas de planes para los comités de capital semilla.

### 1.2. Propósito de la Solución
Desarrollar una Progressive Web App (PWA) móvil, liviana y con capacidad offline-first, estructurada como un micro-LMS progresivo de 8 sesiones. Cada sesión combina microaprendizaje, un quiz autoevaluable con retroalimentación inmediata, y formularios guiados que capturan los insumos del plan de negocio. Una capa de IA asiste en la redacción formal de los textos y en el cálculo de costos, sujeta a la validación del consultor antes de emitir el documento final.

---

## 2. Perfiles de Usuario y Roles

| Rol | Función Principal | Capacidades Clave |
|---|---|---|
| **Emprendedor (Participante)** | Usuario de campo | Ingreso simple con DNI/cédula, visualización de módulos secuenciales, resolución de quizzes, llenado de formularios guiados, trabajo offline con sincronización automática. |
| **Consultor / Facilitador** | Docente y supervisor | Tablero semáforo en tiempo real (progreso de aula), revisión de respuestas, ajuste y aprobación del texto generado por IA, control de calidad numérico. |
| **Administrador / ONG** | Gestor institucional | Configuración de cohortes/grupos, parametrización del tope de capital semilla (monto máximo asignable), exportación de reportes consolidados y planes finales. |

---

## 3. Arquitectura del Flujo Pedagógico (Módulos 1 a 8)

El acceso es secuencial. Para desbloquear la Sesión $N+1$, el usuario debe:
1. Revisar el contenido de microaprendizaje.
2. Aprobar el Quiz de Validación (preguntas V/F con retroalimentación correctiva instantánea y reintentos ilimitados).
3. Completar los campos requeridos del formulario de la sesión.

```text
[ Micro-Learning ] ──> [ Quiz V/F (Auto-corrección) ] ──> [ Formulario Guiado ] ──> [ Desbloqueo Siguiente Sesión ]
                                                                   │
                                                                   ▼
                                                       [ Refinamiento IA + Revisión ]
```

### Estructura Detallada por Sesión

| Sesión | Tema | Contenido / Formulario | Entregable para el Plan de Negocios |
|---|---|---|---|
| **S1** | Identidad del Negocio | Datos del titular, DNI, nombre comercial, rubro, ubicación/dirección, antecedentes del negocio. | Resumen de datos generales y perfil del titular. |
| **S2** | Planeamiento Estratégico | Visión (¿dónde te ves en 3 años?), Misión (¿qué haces, para quién y cómo?), Objetivos (metas a corto plazo). | Declaración estratégica formal. |
| **S3** | Cliente y Propuesta de Valor | ¿Quién te compra? ¿Qué necesidad o problema resuelves? ¿Qué hace especial a tu producto/servicio? | Segmento de clientes y propuesta de valor detallada. |
| **S4** | Estrategia Comercial (4P) | Producto (características), Precio (percepción), Plaza (canal de venta física/digital), Promoción (cómo se difunde). | Plan de mercadeo y comercialización. |
| **S5** | Modelo de Negocio (Canvas) | Mapeo rápido de los 9 bloques en tarjetas simplificadas (Socios, Actividades, Recursos, Canales, etc.). | Lienzo Canvas estructurado. |
| **S6** | Costeo Unitario Directo | Registro de hasta 5 productos principales bajo la lógica "La Casera vs. El Plato" (insumos directos, compras por volumen y consumo por tanda). | Estructura de costos directos, margen bruto y precio de venta. |
| **S7** | Inversión y Capital Semilla | Lista de requerimientos de compra (maquinarias, equipos, herramientas, insumos). Validación contra el tope presupuestal fijado. | Presupuesto de inversión justificado para financiamiento. |
| **S8** | Consolidación y Cierre | Revisión final del emprendedor, generación de resumen ejecutivo consolidado. | Carpeta lista para exportación y presentación al comité. |

---

## 4. Requerimientos Funcionales Específicos

### 4.1. Autenticación y Acceso
* **Identificador único:** Acceso mediante Documento Nacional de Identidad (DNI) o Cédula de Identidad, pre-registrado en la base de datos de la cohorte.
* **Sin barreras de contraseñas:** Ingreso directo por número de documento para minimizar pérdidas de claves y fricción en aula.

### 4.2. Conectividad y Resiliencia Offline (PWA)
* **Almacenamiento Local (IndexedDB):** La aplicación debe almacenar en caché la estructura de las 8 sesiones, los quizzes y los borradores de respuestas.
* **Sincronización en Segundo Plano:** Detección de conectividad para enviar los datos al servidor cuando haya señal de datos o conexión Wi-Fi, sin bloquear la navegación del usuario.

### 4.3. Motor de Costeo: "La Casera vs. El Plato" (Sesión 6)
Para evitar la confusión matemática entre compras al por mayor y consumo unitario:
* El usuario define la **Tanda de Producción** (ej. 30 unidades).
* Para cada insumo, registra dos factores:
  * **Consumo de la Tanda:** Cantidad utilizada para producir ese lote (ej. 30 panes).
  * **Compra en Mercado:** Cómo lo adquiere comercialmente (ej. paquete de 20 panes a S/ 6.00).
* **Cálculo automático:** El sistema calcula el costo por unidad de insumo, el costo total por tanda, el costo unitario de producción y el margen frente al precio de venta ingresado.

### 4.4. Módulo de Inversión (Sesión 7)
* **Parametrización del Tope:** El facilitador o la ONG define el monto máximo financiable (ej. S/ 3,000.00).
* **Categorización libre:** El usuario agrega ítems (maquinaria, insumos iniciales, herramientas) con cantidad y precio unitario estimado.
* **Validador dinámico:** Barra de progreso visual que alerta si la suma total excede el presupuesto máximo permitido por las bases del fondo.

### 4.5. Capa de Inteligencia Artificial (Copiloto de Redacción)
* **Transformación de Lenguaje:** La IA recibe las respuestas espontáneas o coloquiales del emprendedor y las traduce al lenguaje técnico-formal exigido por los comités evaluadores, conservando strictly el sentido y los datos originales.
* **Vista de Doble Entrada (Borrador vs. Propuesta IA):** El sistema mantiene visibles tanto las palabras originales del usuario como la versión refinada.
* **Flujo de Supervisión:** La versión refinada por IA entra en estado `Pendiente de Revisión`. El consultor puede editarla, aprobarla o revertirla desde su panel antes de la consolidación final.

---

## 5. Requerimientos No Funcionales

* **Rendimiento:** Carga inicial en dispositivos móviles de gama baja en menos de 3 segundos bajo redes 3G (bundle ultra ligero, assets optimizados).
* **Diseño UI/UX:** Enfoque Mobile-First, botones de toque amplio (mínimo 48px), tipografía legible y alto contraste.
* **Exportación:** Motor de compilación en el backend que reúna los módulos aprobados y genere un archivo Word (`.docx`) y PDF estandarizado según la plantilla oficial requerida por la ONG contratante.
