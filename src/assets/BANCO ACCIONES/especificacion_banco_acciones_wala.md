# Especificación Técnica — Banco de Acciones WALA

**Versión 1.0 | Mayo 2026**
**Clasificación:** Documento interno — Equipo WALA / Referencia para generación de contenido metodológico

---

## 1. Propósito del documento

Este documento define la lógica, estructura y criterios para generar el **Banco de Acciones WALA**: la librería de microacciones asociadas a cada uno de los 21 indicadores de la Rúbrica de Diagnóstico del Método WALA.

El documento está redactado para dos usos simultáneos:

- **Uso operativo para el asesor:** guía para seleccionar y asignar acciones del banco al plan de acción de cada emprendedor, según el nivel diagnosticado.
- **Uso de referencia para sistemas de IA:** especificación estructurada que permite a un LLM generar, completar o expandir el banco de acciones con coherencia metodológica.

---

## 2. Marco metodológico de referencia

El Banco de Acciones se apoya en tres pilares del Método WALA:

### 2.1 La Rúbrica de Diagnóstico

Cada indicador del Método WALA tiene una escala de 4 niveles:

| Nivel | Descripción operativa |
|---|---|
| **0** | No lo hace o no entiende de qué se trata |
| **1** | Tiene noción, pero lo hace de manera muy débil, improvisada o esporádica |
| **2** | Lo entiende bien y ya hace algo, pero todavía no lo aplica de forma completa o consistente |
| **3** | Lo aplica de manera clara, frecuente y demostrable en su negocio |

La puntuación se asigna sobre **comportamiento observable**, no sobre intención declarada. Si el emprendedor entiende el concepto pero no puede demostrar que lo aplica con regularidad, el puntaje no es 3.

### 2.2 El principio de focalización

El Método trabaja por ciclos. En cada ciclo se seleccionan **3 áreas críticas** por acuerdo informado entre el asesor y el emprendedor. Dentro de cada área, el plan de acción contempla **máximo 3 acciones**.

Esto establece el techo de carga del emprendedor en cualquier ciclo: **9 acciones activas como máximo** (3 áreas × 3 acciones).

El banco no se entrega completo al emprendedor. El asesor selecciona del banco las acciones apropiadas según:
- El nivel diagnosticado del indicador
- La capacidad real del emprendedor
- El contexto del negocio (sector, etapa, recursos)

### 2.3 La plataforma WALA como infraestructura de trazabilidad

La plataforma WALA centraliza ingresos, gastos, inventario, clientes y flujo de caja. Cada acción del banco que involucra registro, seguimiento o cálculo tiene a **WALA como el lugar donde eso ocurre**.

Esto cumple dos funciones:
1. **Para el emprendedor:** convierte el uso de la plataforma en un hábito funcional, no en una tarea adicional.
2. **Para el asesor y el programa:** cada acción completada genera un dato verificable en el expediente de seguimiento, convirtiendo el cumplimiento del plan en evidencia trazable.

---

## 3. Estructura del Banco de Acciones

### 3.1 Dimensiones de organización

El banco está organizado en tres dimensiones simultáneas:

| Dimensión | Descripción |
|---|---|
| **Por indicador** | Cada uno de los 21 indicadores tiene su propio set de acciones, independiente de los demás |
| **Por tramo de nivel** | Las acciones se agrupan en tres tramos: 0→1, 1→2, 2→3. Las acciones de cada tramo son distintas y apropiadas para ese salto específico |
| **Por tipo de frecuencia** | Cada acción está tipificada como: única vez, semanal o mensual |

### 3.2 Estructura de cada acción

Cada acción del banco tiene exactamente cuatro campos:

```
| # | Acción | Frecuencia | Dónde se registra en WALA |
```

**Campo 1 — Número (#):**
Identificador ordinal dentro del tramo (1, 2, 3). No es un ranking de importancia. El asesor puede seleccionar cualquier combinación.

**Campo 2 — Acción:**
Descripción de la acción en segunda persona, lenguaje directo, sin tecnicismos. La acción debe:
- Ser ejecutable por el emprendedor sin depender del asesor
- Tener un tiempo de ejecución razonable (máximo 30 minutos diarios en contexto de microempresa)
- Ser verificable de forma objetiva (no depende de la autoevaluación del emprendedor)
- Estar redactada en lenguaje cotidiano, cercano al vocabulario del microemprendedor latinoamericano

**Campo 3 — Frecuencia:**
Uno de tres valores posibles:
- **Única vez:** Se ejecuta una sola vez durante el ciclo. Generalmente instala una condición base (abrir una categoría, definir un monto, establecer un criterio).
- **Semanal:** Se repite cada semana durante el ciclo. Construye el hábito mediante repetición.
- **Mensual:** Se ejecuta una vez al mes. Verifica que el hábito semanal generó resultado, o consolida una visión de período.

**Campo 4 — Dónde se registra en WALA:**
Especifica el módulo o sección de la plataforma donde queda el registro de la acción. Puede ser:
- Un módulo funcional (ej: "Módulo de ingresos y gastos")
- Un campo específico (ej: "Campo de salario del dueño en el perfil del negocio")
- El expediente de seguimiento (ej: "Nota de sesión en el expediente del ciclo")
- Un reporte generado automáticamente (ej: "Reporte mensual de ganancias y pérdidas")

---

## 4. Lógica de los tramos por nivel

La lógica de qué tipo de acción corresponde a cada tramo es consistente en todos los indicadores:

### Tramo 0 → 1: Instalación de conciencia

El emprendedor en nivel 0 no aplica el comportamiento ni tiene una rutina mínima. Las acciones de este tramo no exigen consistencia: exigen **primer contacto con la práctica**.

Características de las acciones 0→1:
- Son de baja exigencia y alta tolerancia al error
- Priorizan el registro de la realidad actual, sin juzgarla
- Incluyen al menos una acción de conversación o reflexión con el asesor
- Introducen el uso básico de WALA como herramienta de registro
- No exigen comprensión profunda del concepto, solo acción observable

Preguntas que guían la generación de acciones 0→1:
> ¿Qué es lo mínimo que este emprendedor podría hacer esta semana para tener su primer contacto con este comportamiento? ¿Qué acción única instalaría la base sobre la cual construir?

### Tramo 1 → 2: Instalación de rutina mínima

El emprendedor en nivel 1 tiene noción pero no constancia. Las acciones de este tramo construyen **el hábito mediante repetición verificable**.

Características de las acciones 1→2:
- Son de frecuencia semanal como eje central
- Piden que el emprendedor haga algo específico, en un momento específico, con una forma específica de dejarlo registrado
- Introducen WALA como el lugar natural donde esa acción se realiza o documenta
- El criterio de cumplimiento es binario: lo hizo o no lo hizo, con evidencia visible

Preguntas que guían la generación de acciones 1→2:
> ¿Qué rutina semanal, si se ejecuta 4 semanas seguidas, elevaría el nivel de este indicador? ¿Cómo se ve esa rutina en WALA?

### Tramo 2 → 3: Consolidación y cierre del loop

El emprendedor en nivel 2 ya lo hace, pero de forma incompleta o inconsistente. Las acciones de este tramo **cierran el loop de aprendizaje**: conectan la acción con su resultado y generan ajuste consciente.

Características de las acciones 2→3:
- Incluyen acciones de revisión y análisis, no solo de registro
- Introducen la comparación temporal (esta semana vs. la anterior, este mes vs. el anterior)
- Piden que el emprendedor tome decisiones basadas en lo que registra en WALA
- El criterio de cumplimiento no es solo "lo hizo" sino "lo hizo y puede explicar qué descubrió"

Preguntas que guían la generación de acciones 2→3:
> ¿Qué necesita hacer el emprendedor para que este comportamiento sea demostrable, consistente y generador de decisiones? ¿Dónde en WALA queda la evidencia de eso?

---

## 5. Criterios de calidad de cada acción

Antes de incluir una acción en el banco, debe pasar los siguientes filtros:

### 5.1 Filtro de ejecutabilidad
> ¿Puede el emprendedor realizar esta acción sin depender de que el asesor esté presente?

Si la respuesta es no, la acción debe reformularse para que sea autónoma.

### 5.2 Filtro de verificabilidad
> ¿Puede el asesor comprobar en la siguiente sesión si esta acción fue realizada, usando evidencia objetiva?

La evidencia puede ser: registro en WALA, cuaderno físico, captura de pantalla, relato operativo con detalles concretos, o documento. No puede ser "me acuerdo que lo hice".

### 5.3 Filtro de proporcionalidad
> ¿Es el esfuerzo requerido proporcional a la capacidad real de un microemprendedor con tiempo limitado?

Ninguna acción debe requerir más de 30 minutos diarios adicionales de trabajo. Si lo requiere, debe fragmentarse en una versión mínima viable.

### 5.4 Filtro de coherencia con la plataforma
> ¿Tiene esta acción un punto de aterrizaje natural en WALA?

Si la acción no conecta con ningún módulo de la plataforma, debe revisarse si pertenece al banco o si es una acción de asesoría pura (que va al expediente de seguimiento como nota de sesión).

### 5.5 Filtro de lenguaje
> ¿Está redactada en lenguaje cotidiano, sin tecnicismos, comprensible para un emprendedor sin formación financiera formal?

Palabras técnicas a evitar en la redacción de acciones: "costeo", "indicador", "KPI", "margen bruto", "activo circulante", "flujo de caja proyectado". Equivalentes permitidos: "cuánto te cuesta hacerlo", "cuánto te quedó de ganancia", "cuánto dinero entra y sale".

---

## 6. Relación entre acciones y el expediente de seguimiento

El expediente de seguimiento del Método WALA registra el estado de cada acción del plan en tres estados posibles:

| Estado | Descripción |
|---|---|
| **Completada** | El emprendedor realizó la acción y puede mostrar evidencia |
| **En proceso** | El emprendedor comenzó pero no la completó; debe acordarse un nuevo plazo concreto |
| **No realizada** | El emprendedor no la realizó; el asesor debe identificar el obstáculo y rediseñar la acción si es necesario |

Una acción "en proceso" sin fecha de cierre definida equivale a una acción no realizada para efectos del registro. El asesor debe siempre acordar un plazo concreto.

---

## 7. Reglas de selección para el plan de acción

Cuando el asesor usa el banco para construir el plan de acción del ciclo, aplica las siguientes reglas:

1. **Identifica el nivel actual del indicador** según el diagnóstico registrado en el expediente.
2. **Selecciona acciones del tramo correspondiente** (nivel actual → nivel siguiente). No se mezclan acciones de tramos distintos en el mismo ciclo, a menos que el asesor tenga justificación concreta.
3. **Selecciona máximo 3 acciones por indicador activo** en el plan. Si hay más opciones, el asesor elige las que mejor se ajustan al sector, etapa y capacidad del emprendedor.
4. **Verifica que el total del plan no supere 9 acciones activas** (3 áreas críticas × 3 acciones por área). Si supera ese techo, el asesor debe priorizar.
5. **Registra las acciones seleccionadas en el expediente** con frecuencia definida, forma de verificación y módulo de WALA correspondiente.

---

## 8. Instrucción para generación fragmentada por área

Este banco se genera por área. Cada área del Método WALA contiene 3 indicadores, y cada indicador contiene 3 tramos de 3 acciones cada uno (9 acciones por indicador, 27 por área).

Para generar el banco de acciones de un área específica, se debe:

1. Leer los criterios de niveles 0, 1, 2 y 3 de cada indicador desde la **Rúbrica de Diagnóstico WALA**.
2. Identificar qué comportamiento exacto distingue cada nivel del siguiente.
3. Aplicar la lógica de tramo descrita en la Sección 4:
   - 0→1: primer contacto con la práctica
   - 1→2: rutina mínima repetible y verificable
   - 2→3: cierre del loop de aprendizaje con base en datos
4. Redactar cada acción con los 4 campos de la Sección 3.2, verificando que pase los 5 filtros de la Sección 5.
5. Identificar el módulo de WALA correspondiente para cada acción, considerando que la plataforma centraliza: ingresos, gastos, inventario, clientes, flujo de caja y expediente de seguimiento.

### Formato de salida esperado por indicador

```markdown
## Indicador [X.X] — [Nombre del indicador]

### Nivel 0 → 1

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| 1 | [Acción en segunda persona, lenguaje cotidiano] | [Única vez / Semanal / Mensual] | [Módulo o sección de WALA] |
| 2 | [Acción en segunda persona, lenguaje cotidiano] | [Única vez / Semanal / Mensual] | [Módulo o sección de WALA] |
| 3 | [Acción en segunda persona, lenguaje cotidiano] | [Única vez / Semanal / Mensual] | [Módulo o sección de WALA] |

### Nivel 1 → 2

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| 1 | [Acción en segunda persona, lenguaje cotidiano] | [Única vez / Semanal / Mensual] | [Módulo o sección de WALA] |
| 2 | [Acción en segunda persona, lenguaje cotidiano] | [Única vez / Semanal / Mensual] | [Módulo o sección de WALA] |
| 3 | [Acción en segunda persona, lenguaje cotidiano] | [Única vez / Semanal / Mensual] | [Módulo o sección de WALA] |

### Nivel 2 → 3

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| 1 | [Acción en segunda persona, lenguaje cotidiano] | [Única vez / Semanal / Mensual] | [Módulo o sección de WALA] |
| 2 | [Acción en segunda persona, lenguaje cotidiano] | [Única vez / Semanal / Mensual] | [Módulo o sección de WALA] |
| 3 | [Acción en segunda persona, lenguaje cotidiano] | [Única vez / Semanal / Mensual] | [Módulo o sección de WALA] |
```

---

## 9. Las 7 áreas y sus 21 indicadores (índice de referencia)

| Área | Código | Indicador |
|---|---|---|
| **1. Negocios y familia** | 1.1 | Se paga un salario |
| | 1.2 | Paga salario a familiares que trabajan en el negocio |
| | 1.3 | No retira dinero de la empresa sin control |
| **2. Marketing** | 2.1 | Conoce a sus clientes, necesidades y oportunidades de mercado |
| | 2.2 | Promueve el negocio y sus productos |
| | 2.3 | Comercializa productos de forma competitiva (basado en costeo y margen) |
| **3. Compras** | 3.1 | Recolecta cotizaciones de varios proveedores |
| | 3.2 | Verifica bienes en la entrega y maneja devoluciones correctamente |
| | 3.3 | Planifica el volumen de compras según necesidades del negocio |
| **4. Control de stock** | 4.1 | Mantiene registros de stock actualizados y comprensibles |
| | 4.2 | Hace regularmente renovación de stock |
| | 4.3 | Evita sobre/sub-stock y no conserva productos defectuosos |
| **5. Costeo** | 5.1 | Calcula costos de materiales directos |
| | 5.2 | Calcula costos de mano de obra directa |
| | 5.3 | Calcula costos indirectos (luz, alquiler, transporte, etc.) |
| **6. Mantenimiento de registros** | 6.1 | Mantiene libros de registro actualizados y comprensibles |
| | 6.2 | Mantiene registro de cuentas de clientes |
| | 6.3 | Calcula ganancias y pérdidas regularmente |
| **7. Planificación** | 7.1 | Proyecta ventas y costos |
| | 7.2 | Planifica el flujo de caja |
| | 7.3 | Sigue y ajusta el plan de negocio regularmente |

---

## 10. Módulos de WALA disponibles para referencia

Al redactar el campo "Dónde se registra en WALA", usar exclusivamente los siguientes módulos y secciones:

| Módulo / Sección | Qué centraliza |
|---|---|
| **Módulo de ingresos** | Registro de ventas y entradas de dinero al negocio |
| **Módulo de gastos** | Registro de egresos, categorizados por tipo |
| **Módulo de inventario** | Control de stock, productos, cantidades y estado |
| **Módulo de clientes** | Registro de clientes, origen, cuentas por cobrar |
| **Módulo de flujo de caja** | Proyección y revisión de entradas y salidas de efectivo |
| **Dashboard de resultado** | Vista automática de resultados del período (semanal/mensual) |
| **Reporte mensual** | Comparativa de períodos, ganancias y pérdidas |
| **Expediente de seguimiento** | Registro de planes, acciones, notas de sesión y conclusiones de ciclo |
| **Perfil del negocio** | Datos base del negocio: salario del dueño, categorías propias, canal principal |

---

## 11. Nota final para el asesor

El Banco de Acciones no reemplaza el criterio del asesor: lo potencia. Las acciones están diseñadas para ser adaptables al contexto del emprendedor. Si una acción del banco no aplica al sector del emprendedor (por ejemplo, acciones de inventario para un negocio de servicios), el asesor debe elegir la acción alternativa del tramo que sí aplique, o formular una variación que respete la lógica del tramo.

El criterio final siempre es: **¿esta acción, en esta frecuencia, con este emprendedor, va a generar un cambio real de comportamiento en las próximas semanas?** Si la respuesta es no, hay que cambiar la acción, no el indicador.

---

*Método WALA — Especificación Técnica del Banco de Acciones v1.0*
*WALA Asesoría · José Navarrete · 2026*
*Este documento está estructurado para ser procesado por sistemas LLM. Los campos entre corchetes indican variables que deben completarse en contexto de generación.*
