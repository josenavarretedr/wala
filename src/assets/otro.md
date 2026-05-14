
$ cat <<'DOCEOF' > /home/user/banco_acciones_wala.md
# Banco de Acciones WALA
## Sistema de microhábitos graduados por nivel para los 21 indicadores del Método WALA

**Versión 1.0 | Mayo 2026**
**Autor:** José Navarrete · WALA Asesoría
**Clasificación:** Herramienta de consulta para asesores

---

## Propósito del documento

Este banco es una librería estructurada de acciones que el asesor consulta después del diagnóstico, una vez que las áreas críticas han sido seleccionadas en acuerdo informado con el emprendedor. No es una lista de tareas para entregar al emprendedor: es el menú técnico del asesor para co-diseñar el plan de acción de cada ciclo.

**Regla de uso:** Máximo 3 áreas críticas por ciclo × hasta 3 acciones por área = 9 acciones por plan. El asesor selecciona las acciones más adecuadas al contexto del emprendedor, no todas las del banco.

**Lógica de niveles:**

| Tramo | Objetivo de la acción |
|---|---|
| **0 → 1** | Instalar conciencia y hacer visible el problema por primera vez |
| **1 → 2** | Construir una rutina mínima verificable |
| **2 → 3** | Generar consistencia y cerrar el loop de aprendizaje |

**Integración con WALA:** Toda acción que involucra registro, cálculo o seguimiento tiene a la plataforma WALA como el lugar donde ocurre. Esto convierte cada acción completada en evidencia trazable del programa, verificable por el asesor en sesión y reportable ante financiadores institucionales.

---

## Área 1 — Negocios y familia

### 1.1 Se paga un salario

**Qué evalúa:** Si el emprendedor distingue entre ser dueño del negocio y ser trabajador dentro del negocio.

#### Nivel 0 → 1 *(No se paga nada / retira según necesidad)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Anotar en WALA todo retiro de dinero que hizo del negocio para uso personal esta semana, sin filtro ni justificación. Solo registrar. | Semanal | Módulo de gastos — categoría "Retiro del dueño" |
| B | Escribir en WALA cuánto necesitaría ganar como persona para cubrir sus gastos básicos del mes. | Única vez | Campo de meta de salario del dueño en el expediente |
| C | Conversar con el asesor sobre la diferencia entre "sacar lo que sobre" y "pagarme como dueño del negocio". | Única vez | Nota de sesión en el expediente de seguimiento |

#### Nivel 1 → 2 *(Sabe que debería pagarse, pero solo retira cuando "hay sobrante")*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Definir un monto fijo de salario del dueño para este ciclo y registrarlo en WALA antes de cualquier otro gasto de la semana. | Única vez | Campo de salario del dueño en el perfil del negocio |
| B | Registrar en WALA cada vez que se paga: fecha y monto. | Semanal | Módulo de gastos — categoría "Salario del dueño" |
| C | Revisar al inicio de cada semana en WALA si la semana anterior se pagó. Si no, anotar el motivo. | Semanal | Nota de seguimiento en el expediente del ciclo |

#### Nivel 2 → 3 *(Tiene monto definido pero no lo cumple de forma estable)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Al cierre del mes, revisar en WALA cuántas semanas se pagó y cuántas no. Identificar el patrón. | Mensual | Historial de gastos — categoría "Salario del dueño" |
| B | Si el negocio no alcanzó para pagarse alguna semana, registrarlo en WALA con la causa concreta. | Semanal (cuando aplica) | Nota en el módulo de seguimiento del ciclo |
| C | Ajustar el monto de salario si el obstáculo fue que el negocio no llegaba. Un monto menor que sí se ejecuta vale más que uno ideal que nunca ocurre. Actualizar el dato en WALA. | Única vez (por ciclo) | Campo de salario del dueño — actualización |

---

### 1.2 Paga salario a familiares que trabajan en el negocio

**Qué evalúa:** Si el negocio reconoce el trabajo de los familiares como un costo real y no como ayuda invisible.

#### Nivel 0 → 1 *(Familiares trabajan sin pago definido)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Identificar en WALA qué familiares participan en el negocio y qué tareas realizan. | Única vez | Perfil del negocio — campo de colaboradores |
| B | Estimar cuántas horas semanales trabaja cada familiar en el negocio y anotarlo en WALA. | Única vez | Nota en el expediente de seguimiento |
| C | Conversar con el asesor sobre por qué el trabajo familiar es un costo real aunque no se pague con dinero. | Única vez | Nota de sesión en el expediente |

#### Nivel 1 → 2 *(A veces reciben algo, pero sin acuerdo ni monto fijo)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Definir un monto o compensación para cada familiar que trabaja regularmente en el negocio y registrarlo en WALA. | Única vez | Módulo de gastos — categoría "Salario a familiares" |
| B | Registrar en WALA cada pago o compensación entregada a familiares: fecha, quién y cuánto. | Semanal | Módulo de gastos — categoría "Salario a familiares" |
| C | Al cierre de la semana, verificar en WALA si se cumplió el acuerdo de pago con cada familiar. | Semanal | Historial de gastos por categoría |

#### Nivel 2 → 3 *(Hay monto pensado pero no es constante ni registrado)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Al cierre del mes, revisar en WALA si el pago a familiares fue consistente. Identificar semanas donde no se cumplió. | Mensual | Historial de gastos — categoría "Salario a familiares" |
| B | Comparar en WALA el costo total de familiares este mes versus el mes anterior para confirmar que el gasto está bajo control. | Mensual | Reporte mensual de gastos por categoría |
| C | Formalizar el acuerdo de pago con cada familiar colaborador y registrar el monto acordado como gasto fijo en el perfil del negocio en WALA. | Única vez (por ciclo) | Perfil del negocio — gastos fijos recurrentes |

---

### 1.3 No retira dinero de la empresa sin control

**Qué evalúa:** Si existe disciplina para no mezclar caja personal con caja del negocio.

#### Nivel 0 → 1 *(Retira dinero sin control ni registro)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Esta semana, antes de sacar cualquier dinero del negocio para uso personal, anotarlo primero en WALA. Aunque sea después, pero anotarlo. | Semanal | Módulo de gastos — categoría "Retiro personal" |
| B | Al final de la semana, revisar en WALA cuánto salió del negocio para gastos personales. Solo mirar el número. | Semanal | Historial de gastos — categoría "Retiro personal" |
| C | Conversar con el asesor sobre qué pasaría si al final del mes no se pudiera saber cuánto dinero fue del negocio y cuánto fue personal. | Única vez | Nota de sesión en el expediente |

#### Nivel 1 → 2 *(A veces anota o recuerda los retiros, pero no siempre)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Registrar en WALA todo retiro personal en el momento en que ocurre, no al final del día. | Semanal | Módulo de gastos — categoría "Retiro personal" |
| B | Al cierre de la semana, revisar en WALA si hubo retiros personales sin registrar. Si los recuerda, agregarlos. | Semanal | Historial de gastos — revisión de consistencia |
| C | Establecer un monto máximo semanal de retiro personal y registrarlo en WALA como límite de referencia. | Única vez | Campo de límite de retiro personal en el expediente |

#### Nivel 2 → 3 *(Registra retiros pero aún mezcla gastos personales y del negocio)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Revisar en WALA al cierre del mes si algún gasto categorizado como "negocio" fue en realidad personal. Corregirlo. | Mensual | Historial de gastos — revisión de categorías |
| B | Al cierre del mes, calcular en WALA el total de retiros personales y compararlo con el salario del dueño definido. ¿Coinciden? | Mensual | Módulo de gastos — comparativa entre categorías |
| C | Si los retiros personales superaron el salario definido, registrar en WALA la diferencia y la causa. Ajustar el plan para el siguiente ciclo. | Mensual (cuando aplica) | Nota de ajuste en el expediente del ciclo |

---

## Área 2 — Marketing

### 2.1 Conoce a sus clientes, necesidades y oportunidades de mercado

**Qué evalúa:** Si el emprendedor entiende a quién le vende, qué problema resuelve y dónde hay oportunidades reales.

#### Nivel 0 → 1 *(No identifica con claridad a su cliente ni sus necesidades)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Describir en WALA con una oración quién es la persona que más le compra hoy: edad aproximada, qué hace, por qué le compra. | Única vez | Perfil del negocio — campo de cliente principal |
| B | Esta semana, preguntarle a 2 clientes reales por qué le compran a él y no a otro. Anotar las respuestas en WALA. | Única vez | Nota de sesión en el expediente |
| C | Listar en WALA los 3 productos o servicios que más vende. | Única vez | Módulo de inventario o catálogo del negocio |

#### Nivel 1 → 2 *(Tiene idea general del cliente pero muy superficial)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Al registrar una venta en WALA, anotar qué tipo de cliente fue: nuevo, recurrente, referido. | Semanal | Módulo de clientes — campo de tipo de cliente |
| B | Al cierre de la semana, identificar en WALA cuál fue el producto más vendido y a qué tipo de cliente. | Semanal | Reporte semanal de ventas por producto |
| C | Identificar y registrar en WALA una necesidad nueva que un cliente mencionó esta semana. | Semanal | Nota de observación de mercado en el expediente |

#### Nivel 2 → 3 *(Conoce bien al cliente pero no lo usa estratégicamente)*

| # | Acción | Frecuencia | Dónde se registra en WALA |
|---|---|---|---|
| A | Al cierre del mes, revisar en WALA qué producto vendió más y qué tipo de cliente lo compró. Decidir una acción concreta basada en ese dato. | Mensual | Reporte mensual de ventas por cliente y producto |
| B | Registrar en WALA si ajustó algún producto, precio o mensaje este ciclo en función de lo que observó en sus clientes. | Mensual | Nota de decisión estratégica en el expediente del ciclo |
| C | Comparar en WALA la proporción de clientes nuevos vs. recurrentes este mes versus el mes anterior. | Mensual | Reporte de clientes por tipo y período |

---
