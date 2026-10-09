# Método WALA
## Sistema de Seguimiento y Acompañamiento para Programas de Asesoría Empresarial

**Documento técnico metodológico — Versión ejecutiva**
**Autor:** José Navarrete · WALA Asesoría
**Clasificación:** Uso interno — Equipo de asesores / Marco de implementación

---

## Tabla de contenidos

1. [Propósito del documento](#1-propósito-del-documento)
2. [Problema que resuelve el Método WALA](#2-problema-que-resuelve-el-método-wala)
3. [Fundamentos metodológicos](#3-fundamentos-metodológicos)
4. [Arquitectura del sistema](#4-arquitectura-del-sistema)
5. [Flujo de implementación por fase](#5-flujo-de-implementación-por-fase)
6. [Las 7 áreas de evaluación del negocio](#6-las-7-áreas-de-evaluación-del-negocio)
7. [Los 3 ciclos de trabajo](#7-los-3-ciclos-de-trabajo)
8. [Rol del asesor en el sistema](#8-rol-del-asesor-en-el-sistema)
9. [Trazabilidad e indicadores de impacto](#9-trazabilidad-e-indicadores-de-impacto)
10. [Instrumentos de implementación](#10-instrumentos-de-implementación)
11. [Glosario técnico](#11-glosario-técnico)

---

## 1. Propósito del documento

Este documento describe el **Método WALA**: el sistema estructurado de seguimiento y acompañamiento empresarial desarrollado por WALA Asesoría para la implementación de programas de fortalecimiento a microemprendedores.

El documento cumple tres funciones simultáneas:

- **Marco operativo** para los asesores que implementan el sistema: define el flujo de trabajo, los instrumentos a utilizar y los criterios de decisión en cada fase.
- **Documento de sistematización metodológica**: formaliza la lógica de intervención de forma que pueda ser auditada, replicada y escalada por organizaciones implementadoras o financiadores.
- **Fuente de referencia estructurada**: está redactado de forma que pueda ser interpretado directamente por sistemas de inteligencia artificial (LLM) para automatizar o asistir procesos operativos dentro de la plataforma WALA.

> **Nota sobre alcance:** Este documento es la versión ejecutiva del marco metodológico. Los instrumentos de aplicación detallados (fichas, plantillas, matrices) se encuentran en los anexos referenciados al final de cada sección.

---

## 2. Problema que resuelve el Método WALA

Los programas de asesoría a microemprendedores enfrentan de forma recurrente tres tensiones operativas:

### 2.1 Diagnóstico sin continuidad
La mayoría de los programas realizan una evaluación inicial del negocio pero no cuentan con un sistema que conecte ese diagnóstico con las acciones concretas del emprendedor ni con la evolución medible a lo largo del tiempo.

### 2.2 Acompañamiento sin evidencia
El trabajo del asesor depende de su criterio personal y no queda documentado de forma estructurada. Esto impide la rendición de cuentas ante financiadores, la transferencia de casos entre asesores y la generación de datos agregados sobre el portafolio.

### 2.3 Capacitación desconectada de la realidad del negocio
Los contenidos formativos suelen ser genéricos. No están calibrados por las áreas específicas donde el emprendedor tiene mayor déficit, lo que reduce significativamente su impacto.

### 2.4 Lo que el Método WALA resuelve

| Problema identificado | Solución metodológica |
|---|---|
| Diagnóstico sin continuidad | Matriz de evaluación aplicada en 4 momentos del programa |
| Acompañamiento sin evidencia | Expediente de seguimiento por emprendedor con trazabilidad de cada sesión |
| Capacitación genérica | Plan de acción individualizado derivado del diagnóstico en las 3 áreas críticas |
| Sin datos de impacto | Comparativa de puntajes pre/post como indicador de cambio verificable |

---

## 3. Fundamentos metodológicos

### 3.1 Base conceptual

El Método WALA integra principios de tres tradiciones de desarrollo empresarial:

**Diagnóstico por competencias aplicadas:** La evaluación no mide conocimiento teórico sino comportamiento observable del emprendedor en su negocio. La escala de valoración (0–3) está diseñada para reflejar el nivel de aplicación real, no la intención declarada. Este enfoque es consistente con la metodología **SIYB (Start and Improve Your Business)** de la Organización Internacional del Trabajo (OIT), referencia técnica reconocida para programas de fortalecimiento a microempresas en América Latina.

**Acompañamiento basado en ciclos:** El sistema no opera como una intervención lineal (diagnóstico → capacitación → cierre) sino como un proceso iterativo. Cada ciclo produce un plan de acción, una implementación observada y una nueva evaluación. Esto permite ajustar la intervención en tiempo real y documentar la trayectoria de aprendizaje del emprendedor.

**Herramienta digital como infraestructura de trazabilidad:** WALA (la plataforma) no es el programa de asesoría. Es la infraestructura que permite registrar, visualizar y reportar el proceso de acompañamiento con datos verificables. La metodología puede existir sin la herramienta, pero la herramienta potencia la metodología al centralizar la información y reducir la carga operativa del asesor.

### 3.2 Principio de focalización

El Método WALA aplica el principio de **intervención focalizada**: en lugar de intentar mejorar todas las áreas del negocio simultáneamente, cada ciclo concentra el trabajo en las **3 áreas críticas** identificadas en el diagnóstico. Este principio reconoce que:

- El emprendedor de microempresa tiene capacidad de atención y tiempo limitados.
- Un cambio de comportamiento sostenible requiere repetición y refuerzo en áreas específicas.
- El impacto es más demostrable cuando se concentra en variables concretas y medibles.

### 3.3 Principio de participación informada

Las áreas críticas no se definen únicamente por el puntaje más bajo en la matriz. Se definen por la intersección de dos fuentes:

1. **Datos objetivos:** los resultados de la evaluación de las 7 áreas.
2. **Datos cualitativos:** lo que el propio emprendedor manifiesta como sus puntos de dificultad o sus áreas de interés prioritario.

Esto garantiza que el plan de acción tenga adherencia real: el emprendedor trabaja en algo que él mismo reconoce como importante para su negocio.

---

## 4. Arquitectura del sistema

El Método WALA se estructura en **4 componentes interdependientes**:

```
COMPONENTE 1          COMPONENTE 2          COMPONENTE 3          COMPONENTE 4
Diagnóstico           Plan de acción        Seguimiento           Trazabilidad
──────────────        ──────────────        ──────────────        ──────────────
Matriz de 21          3 áreas críticas      Revisión sesión       Expediente por
indicadores en        + acciones            a sesión del          emprendedor con
7 áreas               concretas por         cumplimiento del      puntajes pre/post
                      área                  plan                  y registro de
Escala 0–3                                                        cada ciclo
                      Frecuencia:           Estado de cada
4 momentos de         diaria /              acción:               Reportable a
medición              semanal /             completada /          financiadores y
                      única vez             en proceso /          organizaciones
                                            no realizada          implementadoras
```

Estos 4 componentes operan de forma secuencial dentro de cada ciclo y de forma acumulativa a lo largo del programa completo.

---

## 5. Flujo de implementación por fase

El programa completo se desarrolla en **7 sesiones distribuidas en 3 ciclos**, más una sesión inicial de diagnóstico.

### Visión general del flujo

```
SESIÓN 0          CICLO 1                    CICLO 2                    CICLO 3
──────────        ───────────────────────    ───────────────────────    ───────────────────────
Diagnóstico       Sesión 1         Sesión 2  Sesión 3         Sesión 4  Sesión 5         Sesión 6
inicial           Educativa +      Segui-    Nuevo plan       Segui-    Plan final        Segui-
                  Plan C1          miento    + ajuste C2      miento    + cierre C3       miento
                                   C1                         C2                          C3 +
                                                                                          Evaluación
                                                                                          final
```

### 5.1 Sesión 0 — Diagnóstico inicial

**Objetivo:** Establecer la línea de base del negocio.

**Actividades del asesor:**
1. Aplicar la ficha de datos generales del emprendedor y del negocio.
2. Aplicar la Matriz de Evaluación de Desempeño Empresarial (21 indicadores / 7 áreas).
3. Registrar el puntaje pre-intervención en el Expediente de Seguimiento.
4. Identificar, en diálogo con el emprendedor, las 3 áreas críticas prioritarias.
5. Documentar lo que el emprendedor manifiesta sobre sus propias dificultades.

**Output de la sesión:** Expediente iniciado con puntajes de línea de base y 3 áreas críticas identificadas.

**Instrumento:** *Ver Anexo A — Expediente de Seguimiento WALA (Sección 1: Diagnóstico inicial y Sección 2: Áreas críticas)*

---

### 5.2 Ciclo 1 — Sesión educativa y primer plan de acción

**Sesión 1A — Educativa + plan**

**Objetivo:** Que el emprendedor comprenda por qué esas 3 áreas son críticas para su negocio y se comprometa con un plan de acción concreto.

**Actividades del asesor:**
1. Presentar los resultados del diagnóstico en lenguaje simple (no técnico).
2. Explicar, con ejemplos del propio sector del emprendedor, el impacto de no atender cada área crítica.
3. Co-construir el plan de acción: definir junto al emprendedor las acciones concretas, su frecuencia y la forma de verificarlas.
4. Registrar el plan en el Expediente de Seguimiento.

> **Principio clave:** El asesor propone las acciones basándose en su criterio técnico, pero el emprendedor las valida y las acepta como propias. Un plan impuesto tiene menor adherencia que un plan acordado.

**Output:** Plan de acción del Ciclo 1 con 3 áreas × hasta 3 acciones cada una, con frecuencia definida.

**Sesión 1B — Seguimiento**

**Objetivo:** Verificar el cumplimiento del plan y registrar la evidencia.

**Actividades del asesor:**
1. Revisar acción por acción el estado de cumplimiento (completada / en proceso / no realizada).
2. Registrar observaciones por cada acción.
3. Identificar obstáculos y ajustar si es necesario.
4. Documentar conclusiones y compromisos para el siguiente ciclo.

**Output:** Tabla de seguimiento completada. Conclusiones del Ciclo 1 registradas en el Expediente.

**Instrumento:** *Ver Anexo A — Expediente de Seguimiento WALA (Ciclo 1)*

---

### 5.3 Ciclos 2 y 3 — Continuidad y ajuste

La estructura de los Ciclos 2 y 3 replica la del Ciclo 1 con una diferencia clave: **las áreas prioritarias pueden ajustarse** en función del avance observado.

**Criterios de ajuste de áreas entre ciclos:**

| Situación observada | Decisión metodológica |
|---|---|
| Área crítica con avance claro (puntaje subió 1+ punto) | Puede mantenerse con acciones de consolidación o liberarse para incorporar otra área |
| Área crítica sin avance (acciones no realizadas) | Mantener. Rediseñar las acciones para reducir la barrera de implementación |
| Nueva área que el emprendedor identifica como urgente | Puede incorporarse si hay justificación concreta |
| Área que mejoró pero es sistémica (ej: registros) | Mantener como hábito aunque el puntaje haya mejorado |

**Output del Ciclo 3:** Evaluación post-intervención completa. Comparativa de puntajes en las 7 áreas. Conclusiones del programa.

**Instrumento:** *Ver Anexo A — Expediente de Seguimiento WALA (Ciclos 2 y 3 / Sección 3: Evaluación final)*

---

## 6. Las 7 áreas de evaluación del negocio

La Matriz de Evaluación está organizada en 7 áreas que cubren las competencias empresariales fundamentales para la gestión sostenible de una microempresa. Cada área contiene 3 indicadores evaluados en escala 0–3.

### Escala de valoración

| Puntaje | Descripción |
|---|---|
| **0** | Sin conocimiento ni aplicación |
| **1** | Cierto conocimiento pero aplicación mínima o inconsistente |
| **2** | Mucho conocimiento pero aplicación parcial |
| **3** | Aplica el conocimiento de forma consistente en su negocio |

**Puntaje máximo por área:** 9 puntos (3 indicadores × 3 puntos)
**Puntaje máximo total:** 63 puntos (7 áreas × 9 puntos)

### Descripción de las 7 áreas

**Área 1 — Negocios y familia**
Evalúa la separación entre las finanzas del negocio y las finanzas personales del emprendedor. Es la base de cualquier gestión financiera sostenible. Un negocio sin separación financiera no puede medir su rentabilidad real.

*Indicadores: pago de salario al dueño / pago de salario a familiares colaboradores / no retiro de dinero sin control*

---

**Área 2 — Marketing**
Evalúa el conocimiento del mercado y del cliente, y la capacidad del emprendedor para comunicar y posicionar su oferta. Incluye la fijación estratégica de precios basada en costeo real.

*Indicadores: conocimiento del cliente y sus necesidades / promoción del negocio / comercialización competitiva basada en costeo y margen*

---

**Área 3 — Compras**
Evalúa la gestión de proveedores y el proceso de compra. Un mal manejo de compras impacta directamente en el costo del producto y en la disponibilidad de stock.

*Indicadores: cotización de múltiples proveedores / verificación de bienes en la entrega / planificación del volumen de compras*

---

**Área 4 — Control de stock**
Evalúa la capacidad del emprendedor para mantener un inventario actualizado y tomar decisiones de reposición basadas en datos reales, no en estimaciones.

*Indicadores: registro de stock actualizado / renovación regular de stock / gestión del sobre/sub-stock y productos defectuosos*

---

**Área 5 — Costeo**
Evalúa si el emprendedor calcula correctamente el costo real de lo que produce o vende, incluyendo materiales directos, mano de obra y costos indirectos. El costeo incorrecto es la causa más común de que un negocio aparentemente activo opere en pérdida.

*Indicadores: cálculo de costos de materiales directos / cálculo de mano de obra directa / cálculo de costos indirectos*

---

**Área 6 — Mantenimiento de registros**
Evalúa si el emprendedor lleva registros actualizados de sus operaciones: ventas, clientes, ingresos y resultados. Sin registros no hay posibilidad de gestión basada en datos.

*Indicadores: libros de registro actualizados / registro de cuentas de clientes / cálculo regular de ganancias y pérdidas*

---

**Área 7 — Planificación**
Evalúa la capacidad del emprendedor para proyectar, anticipar y ajustar. Es el área de mayor nivel de madurez empresarial: requiere que las otras 6 áreas tengan un nivel mínimo de desarrollo.

*Indicadores: proyección de ventas y costos / planificación del flujo de caja / seguimiento y ajuste del plan de negocio*

> **Instrumento de evaluación:** *Ver Anexo A — Expediente de Seguimiento WALA (Sección 1) y Anexo B — Matriz de Evaluación de Desempeño Empresarial (tabla completa de los 21 indicadores)*

---

## 7. Los 3 ciclos de trabajo

### Lógica de progresión entre ciclos

Los 3 ciclos no son repeticiones del mismo proceso. Cada ciclo tiene un énfasis diferente en la relación entre el asesor y el emprendedor:

| Ciclo | Énfasis | Rol del asesor | Rol del emprendedor |
|---|---|---|---|
| **Ciclo 1** | Comprensión y arranque | Explica, motiva, co-diseña el plan | Escucha, valida, se compromete |
| **Ciclo 2** | Ajuste y consolidación | Verifica, corrige, refuerza | Implementa, reporta, ajusta |
| **Ciclo 3** | Autonomía y cierre | Acompaña, evalúa, proyecta | Lidera, demuestra, concluye |

Esta progresión es intencional: el objetivo del programa no es crear dependencia del asesor sino desarrollar la capacidad del emprendedor para gestionar su negocio de forma autónoma con el apoyo de WALA como herramienta permanente.

### Criterio de cierre del programa

Al finalizar el Ciclo 3, el emprendedor debe poder responder afirmativamente a las siguientes preguntas:

- ¿Sé cuánto gana realmente mi negocio?
- ¿Tengo registros actualizados de mis operaciones?
- ¿Sé qué tengo que hacer la próxima semana para mejorar mi negocio?

Si el emprendedor no puede responder estas preguntas con datos concretos, el programa no ha cumplido su objetivo de fondo.

---

## 8. Rol del asesor en el sistema

### 8.1 Lo que el asesor hace

El asesor en el Método WALA cumple cuatro funciones diferenciadas:

**Diagnóstico:** Aplica la matriz de evaluación con criterio técnico. No es una encuesta de percepción del emprendedor — es una valoración observacional del asesor sobre el comportamiento real del negocio.

**Educación contextualizada:** Diseña y ejecuta la sesión educativa sobre las áreas críticas usando ejemplos del propio sector y realidad del emprendedor. No dicta una clase genérica — explica por qué ese problema específico afecta a ese negocio específico.

**Co-diseño del plan de acción:** Traduce el diagnóstico en acciones concretas, realizables y verificables. El nivel de dificultad de las acciones debe ser calibrado a la capacidad real del emprendedor: acciones demasiado complejas no se implementan.

**Registro y trazabilidad:** Completa el Expediente de Seguimiento en cada sesión. Esto no es burocracia — es la evidencia que permite demostrar el impacto del programa con datos verificables.

### 8.2 Lo que el asesor no hace

- No toma decisiones de negocio por el emprendedor.
- No evalúa áreas fuera de las 7 definidas en la matriz sin documentarlo.
- No salta fases del ciclo (no puede pasar al Ciclo 2 sin cerrar el seguimiento del Ciclo 1).
- No modifica el plan de acción durante el período de implementación sin registrar el cambio y su justificación.

### 8.3 Perfil requerido del asesor

Para implementar el Método WALA, el asesor debe tener:

- Conocimiento operativo de las 7 áreas de gestión empresarial evaluadas.
- Capacidad para traducir conceptos financieros y administrativos a lenguaje cotidiano.
- Habilidad para facilitar conversaciones que combinen datos objetivos con la percepción del emprendedor.
- Disciplina de registro: el sistema solo funciona si el Expediente se completa en cada sesión, no de memoria al final del programa.

---

## 9. Trazabilidad e indicadores de impacto

### 9.1 Por qué la trazabilidad es central en el Método WALA

El Método WALA está diseñado para que el impacto del programa sea **demostrable, no solo perceptible**. Esto responde a dos necesidades simultáneas:

- **Interna:** El asesor y WALA Asesoría necesitan saber qué está funcionando y qué no para mejorar la metodología.
- **Externa:** Los financiadores y organizaciones implementadoras necesitan evidencia verificable del cambio generado en los emprendedores atendidos.

### 9.2 Indicadores de proceso (por emprendedor)

Estos indicadores miden la calidad de la implementación del programa:

| Indicador | Cómo se mide | Fuente |
|---|---|---|
| Sesiones completadas | Número de sesiones registradas en el Expediente | Expediente de Seguimiento |
| Tasa de cumplimiento del plan | % de acciones completadas sobre el total comprometido | Tabla de seguimiento por ciclo |
| Áreas atendidas | Número y tipo de áreas trabajadas a lo largo de los 3 ciclos | Expediente de Seguimiento |
| Continuidad del emprendedor | Emprendedor que completó los 3 ciclos vs. los que abandonaron | Registro del programa |

### 9.3 Indicadores de resultado (por emprendedor)

Estos indicadores miden el cambio real en las capacidades del emprendedor:

| Indicador | Cómo se mide | Fuente |
|---|---|---|
| Variación de puntaje total | Puntaje Post C3 − Puntaje Pre × 100 / 63 | Expediente — Sección 3 |
| Variación por área crítica | Puntaje Post C3 − Puntaje Pre por cada área trabajada | Expediente — Sección 3 |
| Número de indicadores en nivel 3 | Indicadores con puntaje máximo al cierre vs. al inicio | Matriz de evaluación |
| Áreas que superaron el umbral medio | Áreas con puntaje ≥ 5 / 9 al cierre del programa | Expediente — Sección 3 |

### 9.4 Indicadores de impacto agregado (por portafolio)

Cuando el sistema opera con múltiples emprendedores, los datos del Expediente permiten generar indicadores de portafolio:

- Promedio de variación de puntaje total por cohorte.
- Áreas con mayor y menor mejora en el portafolio (para ajustar la metodología).
- Tasa de emprendedores que alcanzan autonomía operativa (puntaje total ≥ 42 / 63 al cierre).
- Distribución sectorial de las áreas críticas más frecuentes.

> **Nota para implementación:** La plataforma WALA centraliza automáticamente los datos del Expediente de Seguimiento y genera los reportes de proceso y resultado sin carga adicional para el asesor. Los datos del portafolio están disponibles en tiempo real desde el panel de gestión del programa.

---

## 10. Instrumentos de implementación

El Método WALA opera con dos instrumentos principales. Ambos están diseñados para funcionar de forma integrada: el Expediente de Seguimiento referencia la Matriz de Evaluación en cada momento de aplicación.

### Anexo A — Expediente de Seguimiento WALA

**Descripción:** Documento maestro por emprendedor. Registra el ciclo de vida completo del programa: datos generales, diagnóstico inicial, áreas críticas identificadas, planes de acción por ciclo, seguimiento sesión a sesión y evaluación final comparativa.

**Estructura:**
- Portada con datos del negocio, asesor, programa y timeline del recorrido
- Sección 1: Diagnóstico inicial — Matriz completa con columnas Pre / Post C1 / Post C2 / Post C3
- Sección 2: Áreas críticas identificadas — 3 tarjetas con área, puntaje, indicador más débil y justificación
- Ciclo 1: Sesión educativa + plan de acción + tabla de seguimiento + conclusiones
- Ciclo 2: Plan ajustado + seguimiento + conclusiones
- Ciclo 3: Plan final + seguimiento final
- Sección 3: Evaluación final — Comparativa por área en 4 momentos + campos de cierre

**Formato disponible:** Digital interactivo (HTML) / Editable (Word .docx)

---

### Anexo B — Matriz de Evaluación de Desempeño Empresarial

**Descripción:** Instrumento de diagnóstico con los 21 indicadores distribuidos en 7 áreas. Se aplica en hasta 4 momentos del programa (Pre / Post C1 / Post C2 / Post C3). La versión completa incluye la tabla de indicadores con su descripción, criterios de valoración por nivel (0–3) y espacio de registro.

**Tabla resumen de indicadores:**

| Área | Cód. | Indicador |
|---|---|---|
| 1. Negocios y familia | 1.1 | Se paga un salario |
| | 1.2 | Paga salario a familiares trabajadores |
| | 1.3 | No retira dinero de la empresa sin control |
| 2. Marketing | 2.1 | Conoce a sus clientes, necesidades y oportunidades de mercado |
| | 2.2 | Promueve el negocio y sus productos |
| | 2.3 | Comercializa productos de forma competitiva (basado en costeo y margen) |
| 3. Compras | 3.1 | Recolecta cotizaciones de varios proveedores |
| | 3.2 | Verifica bienes en la entrega y maneja devoluciones correctamente |
| | 3.3 | Planifica el volumen de compras según necesidades del negocio |
| 4. Control de stock | 4.1 | Mantiene registros de stock actualizados y comprensibles |
| | 4.2 | Hace regularmente renovación de stock |
| | 4.3 | Evita sobre/sub-stock y no conserva productos defectuosos |
| 5. Costeo | 5.1 | Calcula costos de materiales directos |
| | 5.2 | Calcula costos de mano de obra directa |
| | 5.3 | Calcula costos indirectos (luz, alquiler, transporte, etc.) |
| 6. Mantenimiento de registros | 6.1 | Mantiene libros de registro actualizados y comprensibles |
| | 6.2 | Mantiene registro de cuentas de clientes |
| | 6.3 | Calcula ganancias y pérdidas regularmente |
| 7. Planificación | 7.1 | Proyecta ventas y costos |
| | 7.2 | Planifica el flujo de caja |
| | 7.3 | Sigue y ajusta el plan de negocio regularmente |

**Escala:** 0 = sin conocimiento · 1 = conocimiento mínimo · 2 = mucho conocimiento, poca aplicación · 3 = aplica el conocimiento

**Formato disponible:** Integrado en el Expediente de Seguimiento (Sección 1) / Formato independiente disponible en la plataforma WALA

---

## 11. Glosario técnico

Este glosario está diseñado para uso interno del equipo de asesores y para referencia de sistemas de IA que procesen este documento.

| Término técnico | Definición operativa en el Método WALA |
|---|---|
| **Área crítica** | Una de las 7 áreas de evaluación identificada como prioritaria para trabajar en el programa, seleccionada por la combinación de puntaje bajo en la matriz y manifestación del emprendedor |
| **Ciclo** | Unidad de trabajo del programa compuesta por una sesión de plan y una sesión de seguimiento. El programa tiene 3 ciclos |
| **Expediente de Seguimiento** | Documento maestro por emprendedor que registra todo el proceso del programa: diagnóstico, planes, seguimiento y evaluación final |
| **Indicador de desempeño** | Comportamiento empresarial observable y evaluable en escala 0–3 dentro de una de las 7 áreas de la matriz |
| **Línea de base** | Puntaje obtenido en la aplicación de la matriz antes del inicio de cualquier intervención (Sesión 0) |
| **Matriz de evaluación** | Instrumento de diagnóstico con 21 indicadores en 7 áreas, evaluados en escala 0–3 por el asesor en hasta 4 momentos del programa |
| **Plan de acción** | Conjunto de acciones concretas (máximo 3 por área crítica) con frecuencia definida, acordadas entre el asesor y el emprendedor al inicio de cada ciclo |
| **Puntaje Post C[n]** | Puntaje obtenido en la reaplicación de la matriz al cierre del Ciclo n (C1, C2 o C3) |
| **Puntaje Pre** | Sinónimo de línea de base. Puntaje de la Sesión 0 |
| **Sesión educativa** | Primera sesión de cada ciclo. El asesor explica la importancia de las áreas críticas y co-diseña el plan de acción con el emprendedor |
| **Sesión de seguimiento** | Segunda sesión de cada ciclo. El asesor verifica el cumplimiento del plan y registra el estado de cada acción |
| **Tasa de cumplimiento** | Porcentaje de acciones comprometidas en el plan que fueron completadas al momento de la sesión de seguimiento |
| **Trazabilidad** | Capacidad del sistema para demostrar, con registros verificables, el proceso seguido y el cambio producido en cada emprendedor atendido |
| **Umbral de autonomía** | Puntaje total ≥ 42 / 63 al cierre del programa. Indica que el emprendedor tiene capacidades suficientes para gestionar su negocio con apoyo de WALA como herramienta, sin necesidad de acompañamiento intensivo |

---

## Notas de implementación para asesores

> Las siguientes notas sintetizan los criterios de decisión más frecuentes en la implementación del sistema. Están redactadas como referencia rápida, no como reemplazo de la guía completa.

**Sobre el diagnóstico:** La matriz la completa el asesor, no el emprendedor. Es una valoración técnica, no una encuesta de autopercepción. Si el emprendedor dice que hace algo pero no puede mostrar evidencia concreta, el puntaje no es 3.

**Sobre la selección de áreas críticas:** Si hay empate en puntajes bajos, priorizar las áreas que el emprendedor identifica como problemáticas. La adherencia al plan depende de que el emprendedor vea el problema como real.

**Sobre el plan de acción:** Las acciones deben ser realizables en el período entre sesiones. Si una acción requiere más de 30 minutos de trabajo adicional al día, probablemente es demasiado compleja para este contexto.

**Sobre el seguimiento:** Una acción "en proceso" sin fecha de cierre definida equivale a una acción no realizada para efectos del registro. Siempre acordar un nuevo plazo concreto.

**Sobre el Expediente:** Se completa en la sesión, no después. Los datos completados de memoria 48 horas después pierden precisión y valor como evidencia.

---

*Método WALA — Documento técnico metodológico v1.0*
*WALA Asesoría · José Navarrete · 2025*
*Este documento está estructurado para ser procesado por sistemas LLM. Los campos entre corchetes `[como este]` indican variables que deben ser completadas por el asesor o el sistema en contexto de implementación.*
