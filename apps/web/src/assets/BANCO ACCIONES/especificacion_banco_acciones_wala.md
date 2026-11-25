# Especificación Técnica — Banco de Acciones WALA

**Versión 3.0 | Noviembre 2026**
**Clasificación:** Documento interno — Equipo WALA / Referencia metodológica, técnica y para generación de contenido con LLM

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

## 6. Relación entre acciones, expediente y estados oficiales

El expediente de seguimiento del Método WALA (`businesses/{businessId}/consulting/dossier`) organiza el plan de acción por ciclos (`ciclo1`, `ciclo2`, `ciclo3` en `actionPlansByCycle` + `activeCycleKey`) y registra cada acción en tres estados oficiales:

| Estado UI | Código en Firestore | Descripción y regla de seguimiento |
|---|---|---|
| **Completada** | `completed` | El emprendedor realizó la acción y existe evidencia en WALA o bitácora |
| **En proceso / Pendiente** | `in_progress` *(legacy: `incomplete`)* | Acción activa del ciclo aún en ejecución; debe tener seguimiento semanal |
| **No realizada** | `not_done` | El emprendedor no la realizó en el ciclo; el asesor identifica el obstáculo y ajusta para el siguiente ciclo |

La verificación sigue un **modelo híbrido**: cuando la acción está conectada a una métrica o configuración real de WALA (`useActionEvidence.js`), la plataforma muestra evidencia automática en vivo y sugiere marcarla como completada, pero la confirmación final permanece bajo criterio del asesor o del emprendedor.

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

Al redactar el campo "Dónde se registra en WALA", usar exclusivamente los siguientes módulos y secciones existentes en la plataforma:

| Módulo / Sección | Ruta en WALA (`/business/:businessId/...`) | Qué centraliza y cómo sincroniza con el BA |
|---|---|---|
| **Módulo de ingresos** | `basicAccountingRecordsBook?type=income` | Registro de ventas (al contado y al crédito) y entradas de dinero |
| **Módulo de gastos** | `basicAccountingRecordsBook?type=expense` | Insumos (`materials`), salarios del equipo (dueño, familiares y personal en `labor`: `preset=owner_salary`, `preset=family_salary`), gastos generales (`overhead`) y **Retiro personal del dueño** (`owner_draw`, `preset=owner_draw`) |
| **Módulo de inventario** | `inventory` *(y subrutas `product/:id/costing/*`)* | Control de stock, `minStock`/`safetyStock`, filtro rápido bajo stock / sin movimiento >14d / cobertura de costeo, mermas y bajas con resumen mensual no monetario, y MOD conectado al valor hora del dueño |
| **Módulo de clientes** | `clients` y `accounts-receivable` | Canal de origen (`originChannel`), rentabilidad por origen, promociones (`promoMilestones`), cobranzas con fecha prometida, aging (`<30d`/`>30d`), recordatorio WhatsApp y castigo incobrable no monetario |
| **Módulo de proveedores** | `suppliers` y `accounts-payable` | Directorio con confiabilidad (`incidentsCount`), comparador de cotizaciones (`purchaseQuotes`), incidencias/devoluciones híbridas (`supplierIncidents`) y cuentas por pagar |
| **Balance de cuentas** | `accounts-balance` | Flujo real de caja/banco (excluyendo ajustes no monetarios), calendario de pagos fijos mensuales (`recurringPayments`) y proyección de liquidez próximos 7 días |
| **Reporte mensual / P&L** | `income-statement` y `expenses` | Estado de Resultados devengado (incluyendo `inventory_shrinkage` y `opex_bad_debt`, alerta de cuentas vencidas >30d, tarjeta `owner_draw` y bloque **Proyectado vs. Real**) |
| **Perfil del negocio** | `business-info` (`settings/businessProfile`) | Meta salarial, salario del dueño, horas semanales, valor por hora, canal principal de promoción, umbral de 2 cotizaciones y meta del ciclo |
| **Expediente de seguimiento** | `consulting` (`consulting/dossier`) | Planes de acción por ciclo (`ciclo1`/`ciclo2`/`ciclo3`), bitácoras del emprendedor, notas del asesor y conclusiones de revisión |

> **Nota sobre Costeo y Planificación:** El costeo unitario por producto (materiales directos, mano de obra directa MOD y costos indirectos CIF) vive dentro del **Módulo de inventario** (`inventory`), no en el módulo de gastos. Asimismo, las proyecciones semanales/mensuales de ventas y caja sin módulo independiente se documentan en el **Expediente de seguimiento** y se contrastan contra `income-statement` y `accounts-balance`.

---

## 11. Sincronía Operativa — Los 4 Arquetipos de Acción

En código (`apps/web/src/config/actionBankMeta.js` y `apps/web/src/utils/actionBankLoader.js`), cada fila parseada recibe un `actionKey` (`${indicador}_${tramo}_${numero}`) y se clasifica en uno de 4 arquetipos que determinan la experiencia interactiva dentro del Plan de Acción 1-a-1:

| Arquetipo (`actionType`) | Frecuencia típica | Experiencia en WALA |
|---|---|---|
| **`config`** | Única vez / por ciclo | Input inline en la tarjeta conectado a `settings/businessProfile` (ej. `ownerSalaryAmount`, `ownerHourlyRate`, `primaryPromoChannel`, `purchaseQuoteThreshold`, `cycleMainGoal`) o acceso directo a Inventario/Costeo |
| **`habit`** | Semanal / por evento | Botón de deep-link directo al flujo con preselección (`?type=expense&preset=owner_draw`, `?preset=owner_salary`, etc.) + badge automático de frecuencia/registros reales en los últimos 7–30 días |
| **`note`** | Única vez / semanal | Bitácora interactiva dentro de la tarjeta (`entrepreneurNote` y `advisorNote`) con pregunta guía específica guardada en `consulting/dossier` |
| **`review`** | Semanal / mensual | Botón hacia el reporte real (`income-statement`, `expenses`, `accounts-receivable`, `clients`, `inventory`) + campo para documentar la decisión o hallazgo del período |

---

## 12. Nota final para el asesor

El Banco de Acciones no reemplaza el criterio del asesor: lo potencia. Las acciones están diseñadas para ser adaptables al contexto del emprendedor. Si una acción del banco no aplica al sector del emprendedor (por ejemplo, acciones de inventario para un negocio de servicios), el asesor debe elegir la acción alternativa del tramo que sí aplique, o formular una variación que respete la lógica del tramo.

El criterio final siempre es: **¿esta acción, en esta frecuencia, con este emprendedor, va a generar un cambio real de comportamiento en las próximas semanas?** Si la respuesta es no, hay que cambiar la acción, no el indicador.

---

*Método WALA — Especificación Técnica del Banco de Acciones v3.0*
*WALA Asesoría · José Navarrete · 2026*
*Referencia técnica de implementación: `docs/features/SINCRONIA_BANCO_ACCIONES_WALA.md`.*
