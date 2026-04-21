<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <header
      class="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur"
    >
      <div
        class="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wide text-teal-700"
          >
            Sesion 1
          </p>
          <h1 class="text-lg font-bold text-slate-900 md:text-xl">
            Cuadernillo interactivo de costeo
          </h1>
        </div>

        <button
          type="button"
          class="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
          @click="activarValidacion"
        >
          Validar campos
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-6">
      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
      >
        <h2 class="text-2xl font-black text-slate-900 md:text-3xl">
          Cuadernillo de Trabajo WALA
        </h2>
        <p class="mt-2 text-sm text-slate-600 md:text-base">
          ¿Cuanto te cuesta realmente lo que vendes? · Costeo
        </p>

        <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SesionField
            id="emprendedor"
            label="Nombre del emprendedor"
            placeholder="Escribe tu nombre"
            v-model="form.emprendedor"
            :error="mostrarError('emprendedor')"
            required
          />
          <SesionField
            id="negocio"
            label="Nombre del negocio"
            placeholder="Escribe el nombre de tu negocio"
            v-model="form.negocio"
            :error="mostrarError('negocio')"
            required
          />
          <SesionField
            id="fecha"
            type="date"
            label="Fecha"
            v-model="form.fecha"
            :error="mostrarError('fecha')"
            required
          />
        </div>

        <div class="mt-6">
          <SesionCallout type="info" title="Como usar este cuadernillo">
            <p>
              Este cuadernillo esta disenado para acompanarte durante la sesion
              y para que puedas volver a el cuando necesites revisar tus numeros
              con mas calma.
            </p>
            <p class="mt-3 flex items-center gap-2">
              <Book class="h-4 w-4" />
              Las secciones de lectura te ayudan a entender el concepto.
            </p>
            <p class="mt-2 flex items-center gap-2">
              <EditPencil class="h-4 w-4" />
              Las secciones de ejercicio son para que aterrices todo en tu
              propio negocio.
            </p>
          </SesionCallout>
        </div>
      </section>

      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
      >
        <h2 class="text-xl font-black text-slate-900 md:text-2xl">
          PARTE 1 · Entender el costo real
        </h2>

        <SesionSectionTitle mode="read" title="¿Por que este tema importa?" />
        <SesionImagePlaceholder
          :src="costos1Image"
          alt="Emprendedora revisando sus ventas del dia con una expresion de duda, mientras sostiene dinero en una mano y una libreta de cuentas en la otra"
        />
        <div class="space-y-3 text-slate-700">
          <p>
            Muchos negocios venden todos los dias, pero aun asi no logran
            crecer.
          </p>
          <p>
            ¿Por que pasa eso? Porque una cosa es vender y otra muy distinta es
            ganar. Puedes tener clientes, movimiento y dinero entrando, pero si
            no sabes cuanto te cuesta realmente lo que vendes, entonces no sabes
            si tu negocio esta avanzando o simplemente sobreviviendo.
          </p>
        </div>
        <div class="mt-4">
          <SesionCallout type="tip" title="Para recordar">
            <p>No todo lo que se vende deja ganancia.</p>
          </SesionCallout>
        </div>

        <!-- <SesionSectionTitle mode="read" title="La pregunta que cambia todo" />
        <SesionImagePlaceholder
          alt="Emprendedor observando una hoja con numeros y haciendose la pregunta de cuanto le cuesta realmente producir lo que vende"
        />
        <div class="space-y-3 text-slate-700">
          <p>
            En esta parte del Metodo WALA trabajamos una pregunta simple, pero
            poderosa:
          </p>
          <blockquote
            class="rounded-xl border-l-4 border-teal-500 bg-teal-50 px-4 py-3 font-semibold text-teal-900"
          >
            ¿Cuanto te cuesta realmente lo que vendes?
          </blockquote>
          <p>
            No cuanto crees. No cuanto te parece. No cuanto mas o menos. Sino
            cuanto cuesta de verdad, sumando todas las partes que hacen posible
            esa venta.
          </p>
          <p>
            Cuando un emprendedor responde bien esta pregunta, deja de poner
            precios por intuicion y empieza a decidir con claridad.
          </p>
        </div> -->

        <SesionSectionTitle mode="read" title="Las capas del costo" />
        <SesionImagePlaceholder
          :src="costos2Image"
          alt="Ilustracion de una cebolla dividida en cuatro capas de colores, cada una representando una parte diferente del costo de un producto o servicio"
        />
        <p class="mb-3 text-slate-700">
          El costo real de un producto o servicio no tiene una sola parte. Tiene
          varias capas. Algunas se ven rapido y otras casi siempre se olvidan.
        </p>

        <div class="overflow-x-auto rounded-2xl border border-slate-200">
          <table class="min-w-full">
            <thead class="bg-slate-100">
              <tr>
                <th
                  class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Capa
                </th>
                <th
                  class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Nombre simple
                </th>
                <th
                  class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Que significa
                </th>
              </tr>
            </thead>
            <tbody class="text-sm text-slate-700">
              <tr class="border-t border-slate-200">
                <td class="px-3 py-2">
                  <span
                    class="inline-block h-3 w-3 rounded-full bg-yellow-400"
                  ></span>
                  Capa 1
                </td>
                <td class="px-3 py-2">Materiales</td>
                <td class="px-3 py-2">
                  Lo que compras para producir o entregar
                </td>
              </tr>
              <tr class="border-t border-slate-200">
                <td class="px-3 py-2">
                  <span
                    class="inline-block h-3 w-3 rounded-full bg-emerald-500"
                  ></span>
                  Capa 2
                </td>
                <td class="px-3 py-2">Tu trabajo</td>
                <td class="px-3 py-2">
                  El valor de tu tiempo o del trabajo realizado
                </td>
              </tr>
              <tr class="border-t border-slate-200">
                <td class="px-3 py-2">
                  <span
                    class="inline-block h-3 w-3 rounded-full border border-slate-400 bg-white"
                  ></span>
                  Capa 3
                </td>
                <td class="px-3 py-2">Invisibles</td>
                <td class="px-3 py-2">
                  Gastos pequenos o dificiles de ver por unidad
                </td>
              </tr>
              <tr class="border-t border-slate-200">
                <td class="px-3 py-2">
                  <span
                    class="inline-block h-3 w-3 rounded-full bg-red-500"
                  ></span>
                  Capa 4
                </td>
                <td class="px-3 py-2">Gastos fijos</td>
                <td class="px-3 py-2">Lo que pagas aunque no vendas nada</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4">
          <SesionCallout type="tip" title="Idea clave">
            <p>
              Tu costo real no es solo la materia prima. Tambien incluye tu
              tiempo y los gastos que sostienen tu negocio.
            </p>
          </SesionCallout>
        </div>

        <SesionSectionTitle mode="read" title="Capa 1 · Materiales directos" />
        <SesionImagePlaceholder
          :src="costos3Image"
          alt="Materiales de trabajo organizados sobre una mesa: telas, carnes, vegetales, envases, hilos, esmaltes y otros insumos"
        />

        <div class="space-y-3 text-slate-700">
          <p>
            Los materiales directos son todos los insumos que se usan
            directamente para producir o entregar lo que vendes.
          </p>
          <p class="font-semibold text-slate-800">Ejemplos:</p>
          <ul class="list-disc space-y-1 pl-5">
            <li>Si vendes comida: pollo, arroz, aceite, verduras, envases.</li>
            <li>Si confeccionas ropa: tela, hilo, cierres, botones, bolsas.</li>
            <li>Si haces manicure: esmalte, lima, algodon, removedor.</li>
            <li>Si vendes postres: harina, azucar, mantequilla, toppings.</li>
          </ul>
        </div>

        <div class="mt-4">
          <SesionCallout type="tip" title="Pregunta guia">
            <p>
              ¿Que cosas se consumen directamente cada vez que vendo una unidad?
            </p>
          </SesionCallout>
        </div>

        <SesionSectionTitle mode="exercise" title="Identifica tus materiales" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SesionField
            id="producto-analizar"
            label="El producto o servicio que voy a analizar"
            placeholder="Ejemplo: torta de chocolate"
            v-model="form.productoAnalizado"
            :error="mostrarError('productoAnalizado')"
            required
          />
          <SesionField
            id="unidad-calculo"
            label="La unidad que voy a calcular"
            placeholder="Ejemplo: 1 unidad / 1 docena / 1 servicio"
            v-model="form.unidadCalculo"
            :error="mostrarError('unidadCalculo')"
            required
          />
        </div>

        <p class="mt-5 mb-3 text-sm font-semibold text-slate-800">
          ¿Que materiales uso para hacerlo o entregarlo?
        </p>
        <SesionDynamicTable
          v-model="materialesRows"
          :columns="materialesColumns"
          :min-rows="1"
          add-label="Agregar material"
        />
        <p class="mt-3 text-sm font-semibold text-slate-800">
          Total de materiales: {{ currency(totalMateriales) }}
        </p>

        <SesionSectionTitle
          mode="read"
          title="Capa 2 · Tu trabajo tambien cuesta"
        />
        <SesionImagePlaceholder
          alt="Emprendedora elaborando un producto con sus manos mientras al costado aparece un reloj, simbolizando que su tiempo tiene valor"
          :src="costos4Image"
        />
        <div class="space-y-3 text-slate-700">
          <p>
            Uno de los errores mas comunes en los pequenos negocios es no contar
            el propio trabajo como parte del costo.
          </p>
          <p>
            Si tu preparas, cocinas, disenas, coses, atiendes, limpias, entregas
            o produces, entonces tu tiempo forma parte del costo real.
          </p>
          <p>
            Aunque todavia no te pagues un sueldo fijo, tu trabajo tiene valor.
            Si no lo calculas, el negocio puede parecer rentable solo porque tu
            estas absorbiendo el costo con tu esfuerzo.
          </p>
        </div>
        <div class="mt-4">
          <SesionCallout type="tip" title="Para recordar">
            <p>
              Si trabajas y no lo cuentas, el negocio se ve mas rentable de lo
              que realmente es.
            </p>
          </SesionCallout>
        </div>

        <SesionSectionTitle
          mode="exercise"
          title="Calcula el valor de tu tiempo"
        />
        <fieldset>
          <legend class="text-sm font-semibold text-slate-800">
            ¿Quien realiza este producto o servicio?
          </legend>
          <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            <label
              v-for="option in quienRealizaOptions"
              :key="option.value"
              class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <input
                type="radio"
                :value="option.value"
                v-model="form.quienRealiza"
                class="h-4 w-4 accent-teal-600"
              />
              {{ option.label }}
            </label>
          </div>
        </fieldset>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SesionField
            id="horas"
            type="number"
            min="0"
            step="1"
            label="Horas por unidad"
            v-model="form.tiempoHoras"
          />
          <SesionField
            id="minutos"
            type="number"
            min="0"
            step="1"
            label="Minutos por unidad"
            v-model="form.tiempoMinutos"
          />
          <SesionField
            id="valor-hora"
            type="number"
            min="0"
            step="0.01"
            label="Valor de una hora de trabajo (S/)"
            v-model="form.valorHora"
            :error="mostrarError('valorHora')"
          />
        </div>

        <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Haz tu calculo aqui
          </p>
          <pre
            class="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"
          >
Tiempo usado por unidad × valor de mi hora = costo de mi trabajo</pre
          >
          <p class="mt-3 text-sm font-semibold text-slate-800">
            Costo de mi trabajo por unidad: {{ currency(costoTrabajo) }}
          </p>
        </div>

        <SesionSectionTitle mode="read" title="Capa 3 · Costos invisibles" />
        <SesionImagePlaceholder
          alt="Pequenos gastos alrededor de un producto terminado: bolsa, etiqueta, cinta, gas, detergente, delivery y desgaste de herramientas"
          :src="costos5Image"
        />

        <div class="space-y-3 text-slate-700">
          <p>
            Ademas de los materiales principales, existen gastos que casi
            siempre se escapan del calculo. Son pequenos, parecen secundarios o
            no sabemos como asignarlos.
          </p>
          <p>Pero si afectan el resultado final.</p>
          <ul class="list-disc space-y-1 pl-5">
            <li>Pegamento</li>
            <li>Hilos</li>
            <li>Clavos</li>
            <li>Gas</li>
            <li>Aceite para maquinas</li>
            <li>Delivery</li>
            <li>Cinta</li>
            <li>Comisiones</li>
          </ul>
        </div>

        <div class="mt-4">
          <SesionCallout type="tip" title="Pregunta guia">
            <p>
              ¿Que otros gastos aparecen para poder entregar esta venta, aunque
              no sean lo principal?
            </p>
          </SesionCallout>
        </div>

        <SesionSectionTitle
          mode="exercise"
          title="Anota tus costos invisibles"
        />
        <SesionDynamicTable
          v-model="invisiblesRows"
          :columns="invisiblesColumns"
          :min-rows="1"
          add-label="Agregar costo invisible"
        />
        <p class="mt-3 text-sm font-semibold text-slate-800">
          Total de costos invisibles: {{ currency(totalInvisibles) }}
        </p>

        <SesionSectionTitle mode="read" title="Capa 4 · Gastos fijos" />
        <SesionImagePlaceholder
          alt="Recibos de luz, alquiler, internet, celular y transporte colocados al lado de una caja y una libreta de cuentas"
          :src="costos6Image"
        />

        <div class="space-y-3 text-slate-700">
          <p>
            Los gastos fijos son los que el negocio tiene que pagar incluso si
            ese dia no vende nada.
          </p>
          <p class="font-semibold text-slate-800">Por ejemplo:</p>
          <ul class="list-disc space-y-1 pl-5">
            <li>Luz</li>
            <li>Alquiler</li>
            <li>Internet</li>
            <li>Transporte</li>
            <li>Celular</li>
            <li>Sueldo de apoyo</li>
            <li>Herramientas</li>
            <li>Mantenimiento del local</li>
          </ul>
          <p>
            Estos gastos no pertenecen a una sola venta, pero si sostienen todo
            el funcionamiento del negocio. Por eso, una parte de ellos tambien
            debe entrar en el costo de cada unidad.
          </p>
        </div>

        <div class="mt-4">
          <SesionCallout type="tip" title="Idea clave">
            <p>
              Lo que sostiene el negocio tambien debe aparecer en tus numeros.
            </p>
          </SesionCallout>
        </div>

        <SesionSectionTitle
          mode="exercise"
          title="Registra tus gastos fijos mensuales"
        />
        <SesionDynamicTable
          v-model="gastosFijosRows"
          :columns="gastosFijosColumns"
          :min-rows="1"
          add-label="Agregar gasto fijo"
        />

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm font-semibold text-slate-800">
              Total de gastos fijos al mes
            </p>
            <p class="mt-1 text-lg font-black text-slate-900">
              {{ currency(totalGastosFijos) }}
            </p>
          </div>

          <SesionField
            id="unidades-mes"
            type="number"
            min="1"
            step="1"
            label="¿Cuantas unidades haces o vendes al mes?"
            v-model="form.unidadesMes"
            :error="mostrarError('unidadesMes')"
            required
          />
        </div>

        <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Haz tu calculo aqui
          </p>
          <pre
            class="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"
          >
Total de gastos fijos mensuales ÷ cantidad de unidades al mes = gasto fijo por unidad</pre
          >
          <p class="mt-3 text-sm font-semibold text-slate-800">
            Mi gasto fijo por unidad es: {{ currency(gastoFijoPorUnidad) }}
          </p>
        </div>

        <!-- <SesionSectionTitle
          mode="read"
          title="Como repartir un gasto mensual"
        />
        <SesionImagePlaceholder
          alt="Emprendedor dividiendo un recibo mensual entre varios productos iguales dibujados en fila"
        />

        <div class="space-y-3 text-slate-700">
          <p>
            Esta es una de las partes mas importantes del costeo. Si un gasto
            corresponde a todo el mes, no se lo cargas completo a una sola
            venta.
          </p>
          <p>
            Lo divides entre la cantidad de unidades que produces o vendes en
            ese mismo periodo.
          </p>
          <p class="font-semibold text-slate-800">Ejemplo:</p>
          <ul class="list-disc space-y-1 pl-5">
            <li>Luz mensual: S/100</li>
            <li>Produccion mensual: 200 empanadas</li>
          </ul>
          <pre
            class="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"
          >
S/100 ÷ 200 = S/0.50</pre
          >
          <p>Eso significa que cada empanada carga S/0.50 de luz.</p>
        </div>

        <div class="mt-4">
          <SesionCallout type="tip" title="Regla practica">
            <p>
              Si un gasto sirve para todo el mes, repartelo entre todo lo que
              produces o vendes en el mes.
            </p>
          </SesionCallout>
        </div> -->
      </section>

      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
      >
        <h2 class="text-xl font-black text-slate-900 md:text-2xl">
          PARTE 2 · Mi ficha del costo real
        </h2>

        <SesionSectionTitle mode="exercise" title="Ficha principal de costeo" />
        <SesionImagePlaceholder
          alt="Hoja de trabajo con secciones claras para completar materiales, trabajo, invisibles, gastos fijos, costo total y precio actual"
          :src="costos7Image"
          orientation="vertical"
        />

        <SesionCallout type="exercise" title="Instruccion">
          <p>
            Ahora reune todo en una sola ficha. Aqui vas a convertir datos
            sueltos en un numero real.
          </p>
        </SesionCallout>

        <div class="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SesionField
            id="precio-actual"
            type="number"
            min="0"
            step="0.01"
            label="Precio actual de venta (S/)"
            v-model="form.precioActual"
            :error="mostrarError('precioActual')"
            required
          />

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm font-semibold text-slate-700">¿Gano o pierdo?</p>
            <p
              class="mt-1 text-lg font-black"
              :class="estadoCostoTotal.className"
            >
              {{ estadoCostoTotal.label }}
            </p>
          </div>
        </div>

        <div class="mt-5">
          <SesionCostSummary :totals="summaryTotals" />
        </div>

        <SesionSectionTitle mode="exercise" title="Desglose final" />
        <div
          class="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
        >
          <p>
            1. Materiales directos:
            <strong>{{ currency(totalMateriales) }}</strong>
          </p>
          <p>
            2. Mi trabajo / mano de obra:
            <strong>{{ currency(costoTrabajo) }}</strong>
          </p>
          <p>
            3. Costos invisibles:
            <strong>{{ currency(totalInvisibles) }}</strong>
          </p>
          <p>
            4. Gastos fijos por unidad:
            <strong>{{ currency(gastoFijoPorUnidad) }}</strong>
          </p>
          <p class="pt-2 text-base font-bold text-slate-900">
            Mi costo total real es: {{ currency(costoTotalReal) }}
          </p>
          <p>
            El precio que cobro hoy es:
            <strong>{{ currency(precioActual) }}</strong>
          </p>
          <p>
            La diferencia entre ambos es:
            <strong>{{ currency(diferencia) }}</strong>
          </p>
          <p>
            Con este calculo, hoy mi producto o servicio esta:
            <strong class="ml-1">{{ estadoCostoTotal.label }}</strong>
          </p>
        </div>

        <!-- <SesionSectionTitle mode="exercise" title="Lo que descubri" />
        <SesionImagePlaceholder
          alt="Emprendedor comparando dos cifras grandes en una hoja: lo que pensaba que costaba y lo que realmente cuesta"
        />

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SesionField
            id="pensaba-costo"
            type="number"
            min="0"
            step="0.01"
            label="Antes pensaba que costaba"
            v-model="form.precioPensaba"
          />
          <SesionField
            id="real-costo"
            type="number"
            min="0"
            step="0.01"
            label="Ahora veo que realmente cuesta"
            v-model="form.precioReal"
          />
          <SesionField
            id="sorprendio"
            label="Lo que mas me sorprendio"
            multiline
            :rows="3"
            v-model="form.loQueDescubri"
            class="md:col-span-2"
          />
          <SesionField
            id="olvidaba"
            label="La parte del costo que mas estaba olvidando era"
            multiline
            :rows="3"
            v-model="form.parteOlvidada"
            class="md:col-span-2"
          />
        </div> -->
      </section>

      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
      >
        <h2 class="text-xl font-black text-slate-900 md:text-2xl">
          PARTE 3 · Precio minimo
        </h2>

        <SesionSectionTitle mode="read" title="¿Que es el precio minimo?" />
        <SesionImagePlaceholder
          alt="Producto apoyado sobre una linea roja en el suelo, representando el limite por debajo del cual el negocio pierde"
          :src="costos8Image"
        />

        <div class="space-y-3 text-slate-700">
          <p>
            El precio minimo es el precio por debajo del cual tu negocio pierde
            dinero.
          </p>
          <p>
            No es necesariamente el mejor precio. No es el precio mas alto. Es
            el limite que no deberias bajar si quieres proteger tu negocio.
          </p>
        </div>

        <div class="mt-4">
          <SesionCallout type="tip" title="Para recordar">
            <p>
              El precio minimo no te dice cuanto cobrar siempre. Te dice desde
              donde ya no deberias bajar.
            </p>
          </SesionCallout>
        </div>

        <SesionSectionTitle mode="read" title="Formula simple" />
        <!-- <SesionImagePlaceholder
          alt="Formula de precio minimo escrita en una pizarra junto a una calculadora"
        /> -->

        <div class="space-y-3 text-slate-700">
          <p>Puedes calcularlo asi:</p>
          <pre
            class="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"
          >
PRECIO MINIMO = Costo Total Real + Ganancia minima que quieres</pre
          >
          <p>O si prefieres pensarlo en porcentaje:</p>
          <pre
            class="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"
          >
PRECIO MINIMO = Costo Total Real × (1 + porcentaje de ganancia)</pre
          >
          <p class="font-semibold text-slate-800">Ejemplo:</p>
          <ul class="list-disc space-y-1 pl-5">
            <li>Costo total real: S/8</li>
            <li>Ganancia deseada: 30%</li>
          </ul>
          <pre
            class="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"
          >
S/8 × 1.30 = S/10.40</pre
          >
          <p>
            Entonces, vender por debajo de S/10.40 seria una mala decision para
            ese producto.
          </p>
        </div>

        <SesionSectionTitle mode="exercise" title="Calcula tu precio minimo" />
        <p class="mb-3 text-sm font-semibold text-slate-800">
          Mi costo total real es: {{ currency(costoTotalReal) }}
        </p>

        <fieldset>
          <legend class="text-sm font-semibold text-slate-800">
            La ganancia minima que quiero obtener es:
          </legend>
          <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-5">
            <label
              v-for="option in gananciaOptions"
              :key="option.value"
              class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              <input
                type="radio"
                :value="option.value"
                v-model="form.gananciaOption"
                class="h-4 w-4 accent-teal-600"
              />
              {{ option.label }}
            </label>
          </div>
        </fieldset>

        <div class="mt-4" v-if="form.gananciaOption === 'otro'">
          <SesionField
            id="ganancia-otro"
            type="number"
            min="0"
            step="0.01"
            label="Otro porcentaje de ganancia"
            placeholder="Ejemplo: 35"
            v-model="form.gananciaOtro"
          />
        </div>

        <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Haz tu calculo aqui
          </p>
          <pre
            class="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"
          >
Costo total real × (1 + porcentaje de ganancia) = precio minimo</pre
          >
          <p class="mt-3 text-sm text-slate-700">
            Mi precio minimo es: <strong>{{ currency(precioMinimo) }}</strong>
          </p>
          <p class="text-sm text-slate-700">
            Mi precio actual es: <strong>{{ currency(precioActual) }}</strong>
          </p>
          <p class="text-sm text-slate-700">
            Al compararlos, descubro que:
            <strong>{{ comparacionPrecio }}</strong>
          </p>
        </div>

        <SesionSectionTitle mode="exercise" title="Si mi precio no alcanza" />
        <SesionImagePlaceholder
          alt="Emprendedora observando tres caminos posibles en una ilustracion: subir precio, bajar costos o mejorar propuesta"
          :src="costos9Image"
        />

        <p class="mb-3 text-slate-700">
          Si descubres que tu precio actual no cubre tu costo real, no significa
          que tu negocio no sirve. Significa que necesitas corregir algo con
          urgencia.
        </p>

        <fieldset>
          <legend class="text-sm font-semibold text-slate-800">
            ¿Que podrias revisar?
          </legend>
          <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            <label
              v-for="option in revisarOptions"
              :key="option"
              class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                :value="option"
                v-model="seleccionesRevisar"
                class="h-4 w-4 rounded accent-teal-600"
              />
              {{ option }}
            </label>
          </div>
        </fieldset>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SesionField
            id="revisar-primero"
            label="Lo primero que deberia revisar en mi negocio es"
            v-model="form.revisarPrimero"
            multiline
            :rows="3"
          />
          <SesionField
            id="porque-entiendo"
            label="Porque hoy entiendo que"
            v-model="form.porqueEntiendo"
            multiline
            :rows="3"
          />
        </div>
      </section>

      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
      >
        <h2 class="text-xl font-black text-slate-900 md:text-2xl">
          PARTE 4 · Aplicacion a mi negocio
        </h2>

        <SesionSectionTitle mode="exercise" title="Mi producto principal" />
        <SesionImagePlaceholder
          alt="Emprendedor sosteniendo el producto que mas vende, mientras otros productos aparecen desenfocados al fondo"
          :src="costos10Image"
        />

        <SesionCallout type="exercise" title="Enfoque">
          <p>
            No necesitas costear todo tu negocio al mismo tiempo. Empieza por lo
            mas importante: lo que mas vendes.
          </p>
        </SesionCallout>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SesionField
            id="producto-principal"
            label="El producto o servicio que mas vendo es"
            v-model="form.productoPrincipal"
          />
          <SesionField
            id="mejora-costeo"
            label="Si ordeno bien el costeo de este producto, mi negocio puede mejorar en"
            v-model="form.mejoraCosteo"
            multiline
            :rows="3"
          />
        </div>

        <fieldset class="mt-4">
          <legend class="text-sm font-semibold text-slate-800">
            Lo elegi porque:
          </legend>
          <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            <label
              v-for="option in motivoProductoOptions"
              :key="option"
              class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                :value="option"
                v-model="motivoProductoSeleccion"
                class="h-4 w-4 rounded accent-teal-600"
              />
              {{ option }}
            </label>
          </div>
        </fieldset>

        <SesionSectionTitle
          mode="exercise"
          title="Revision de errores comunes"
        />
        <SesionImagePlaceholder
          alt="Lista de chequeo con errores comunes de costeo marcados en una libreta de trabajo"
        />

        <p class="mb-3 text-slate-700">
          Marca los errores que crees que has cometido hasta hoy:
        </p>

        <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
          <label
            v-for="option in erroresOptions"
            :key="option"
            class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              :value="option"
              v-model="erroresSeleccionados"
              class="h-4 w-4 rounded accent-teal-600"
            />
            {{ option }}
          </label>
        </div>

        <div class="mt-4">
          <SesionField
            id="error-mas"
            label="El error que hoy mas me afecta es"
            v-model="form.errorMasAfecta"
            multiline
            :rows="3"
          />
        </div>

        <SesionSectionTitle
          mode="exercise"
          title="Mi compromiso de esta semana"
        />
        <SesionImagePlaceholder
          alt="Mano escribiendo una decision concreta en un cuaderno, con gesto firme de compromiso"
        />

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SesionField
            id="accion-semana"
            label="La accion concreta que voy a hacer esta semana es"
            v-model="form.accionSemana"
            multiline
            :rows="3"
          />
          <SesionField
            id="dia-accion"
            type="date"
            label="La voy a hacer el dia"
            v-model="form.diaAccion"
          />
          <SesionField
            id="porque-accion"
            class="md:col-span-2"
            label="Y esta vez si la voy a hacer porque entendi que"
            v-model="form.porQueAccion"
            multiline
            :rows="3"
          />
        </div>

        <SesionSectionTitle
          mode="exercise"
          title="Tarea de la Semana · Costeo"
        />
        <SesionImagePlaceholder
          alt="Emprendedor completando una ficha de costos en su negocio, con calculadora, boletas y productos alrededor"
        />

        <SesionCallout type="exercise" title="Objetivo de la tarea">
          <p>
            Esta tarea te ayuda a convertir lo aprendido en una decision real
            para tu negocio.
          </p>
        </SesionCallout>

        <ol class="mt-4 list-decimal space-y-1 pl-5 text-slate-700">
          <li>Elige el producto o servicio que mas vendes.</li>
          <li>Anota sus materiales reales.</li>
          <li>Ponle valor a tu tiempo.</li>
          <li>Suma los costos invisibles.</li>
          <li>Divide tus gastos fijos entre tus unidades.</li>
          <li>Calcula tu costo total real.</li>
          <li>Comparalo con tu precio actual.</li>
          <li>Calcula tu precio minimo.</li>
        </ol>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SesionField
            id="producto-elegido"
            label="Mi producto elegido sera"
            v-model="form.productoElegido"
          />
          <SesionField
            id="fecha-tarea"
            type="date"
            label="La fecha en que hare esta tarea sera"
            v-model="form.fechaTarea"
          />
          <SesionField
            id="reunir-antes"
            label="Lo que necesito reunir antes de empezar"
            v-model="form.reunirAntes"
            multiline
            :rows="3"
          />
        </div>
      </section>

      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
      >
        <h2 class="text-xl font-black text-slate-900 md:text-2xl">
          RESUMEN PERSONAL
        </h2>
        <SesionImagePlaceholder
          alt="Emprendedor sosteniendo su cuadernillo terminado con expresion de mayor claridad y seguridad sobre su negocio"
        />

        <SesionCallout type="info" title="Antes de cerrar este cuadernillo">
          <p>Resume aqui lo mas importante que te llevas.</p>
        </SesionCallout>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SesionField
            id="resumen-producto"
            label="Mi producto o servicio analizado fue"
            v-model="form.resumenProducto"
          />
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
          >
            <p>
              Mi costo total real es:
              <strong>{{ currency(costoTotalReal) }}</strong>
            </p>
            <p class="mt-1">
              Mi precio actual es: <strong>{{ currency(precioActual) }}</strong>
            </p>
            <p class="mt-1">
              Mi precio minimo es: <strong>{{ currency(precioMinimo) }}</strong>
            </p>
          </div>
          <SesionField
            id="resumen-entendi"
            class="md:col-span-2"
            label="Lo mas importante que entendi hoy fue"
            v-model="form.resumenEntendi"
            multiline
            :rows="3"
          />
          <SesionField
            id="resumen-decision"
            class="md:col-span-2"
            label="La decision que debo tomar ahora en mi negocio es"
            v-model="form.resumenDecision"
            multiline
            :rows="3"
          />
        </div>

        <blockquote
          class="mt-6 rounded-xl border-l-4 border-slate-800 bg-slate-100 px-4 py-3 text-sm text-slate-700"
        >
          Un negocio que no conoce su costo real puede vender mucho y seguir en
          confusion. Un negocio que si conoce sus numeros puede decidir con
          claridad.
        </blockquote>

        <p class="mt-4 text-xs text-slate-500">
          Cuadernillo de Trabajo · Metodo WALA · Jose Navarrete · 2026
        </p>
        <p class="text-xs text-slate-500">
          Basado en el Area 5: Costeo del Sistema de Seguimiento Empresarial
          WALA
        </p>
      </section>

      <section
        v-if="showValidationPanel"
        class="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm md:p-6"
      >
        <SesionCallout
          type="warning"
          title="Hay campos pendientes antes de cerrar la sesion"
        >
          <ul class="list-disc space-y-1 pl-5">
            <li v-for="(message, key) in validationErrors" :key="key">
              {{ message }}
            </li>
          </ul>
        </SesionCallout>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { Book, EditPencil } from "@iconoir/vue";
import SesionCallout from "@/components/sesiones/SesionCallout.vue";
import SesionCostSummary from "@/components/sesiones/SesionCostSummary.vue";
import SesionDynamicTable from "@/components/sesiones/SesionDynamicTable.vue";
import SesionField from "@/components/sesiones/SesionField.vue";
import SesionImagePlaceholder from "@/components/sesiones/SesionImagePlaceholder.vue";
import SesionSectionTitle from "@/components/sesiones/SesionSectionTitle.vue";
import costos1Image from "@/assets/sesiones/costos/costos1.png";
import costos2Image from "@/assets/sesiones/costos/costos2.png";
import costos3Image from "@/assets/sesiones/costos/costos31.png";
import costos4Image from "@/assets/sesiones/costos/costos4.png";
import costos5Image from "@/assets/sesiones/costos/costos5.png";
import costos6Image from "@/assets/sesiones/costos/costos6.png";
import costos7Image from "@/assets/sesiones/costos/costos7.png";
import costos8Image from "@/assets/sesiones/costos/costos8.png";
import costos9Image from "@/assets/sesiones/costos/costos9.png";
import costos10Image from "@/assets/sesiones/costos/costos10.png";

const createRows = (count, keys) => {
  return Array.from({ length: count }, () =>
    keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {}),
  );
};

const form = reactive({
  emprendedor: "",
  negocio: "",
  fecha: "",
  productoAnalizado: "",
  unidadCalculo: "",
  quienRealiza: "yo",
  tiempoHoras: "",
  tiempoMinutos: "",
  valorHora: "",
  unidadesMes: "",
  precioActual: "",
  gananciaOption: "30",
  gananciaOtro: "",
  precioPensaba: "",
  precioReal: "",
  loQueDescubri: "",
  parteOlvidada: "",
  revisarPrimero: "",
  porqueEntiendo: "",
  productoPrincipal: "",
  mejoraCosteo: "",
  errorMasAfecta: "",
  accionSemana: "",
  diaAccion: "",
  porQueAccion: "",
  productoElegido: "",
  fechaTarea: "",
  reunirAntes: "",
  resumenProducto: "",
  resumenEntendi: "",
  resumenDecision: "",
});

const materialesRows = ref(createRows(3, ["material", "cantidad", "costo"]));
const invisiblesRows = ref(
  createRows(3, ["gastoInvisible", "comoParticipa", "costoUnidad"]),
);
const gastosFijosRows = ref(createRows(3, ["gastoFijo", "monto"]));

const seleccionesRevisar = ref([]);
const motivoProductoSeleccion = ref([]);
const erroresSeleccionados = ref([]);
const validationTriggered = ref(false);

const quienRealizaOptions = [
  { value: "yo", label: "Yo mismo/a" },
  { value: "otra", label: "Otra persona" },
  { value: "ambos", label: "Ambos" },
];

const gananciaOptions = [
  { value: "10", label: "10%" },
  { value: "20", label: "20%" },
  { value: "30", label: "30%" },
  { value: "40", label: "40%" },
  { value: "otro", label: "Otro" },
];

const revisarOptions = [
  "Mi precio",
  "Mis materiales",
  "Mis proveedores",
  "Mi desperdicio",
  "El valor de mi tiempo",
  "Mi volumen de ventas",
  "Mi presentacion o valor percibido",
  "Otro",
];

const motivoProductoOptions = [
  "Es el que mas se vende",
  "Es el que mas me piden",
  "Es el que mas dudas me genera",
  "Es el que mas tiempo me toma",
  "Otro",
];

const erroresOptions = [
  "Solo calculaba materiales",
  "No contaba mi tiempo",
  "No consideraba los gastos pequenos",
  "No repartia mis gastos mensuales entre unidades",
  "Ponia precios por intuicion",
  "Ponia precios mirando a la competencia",
  "Bajaba precios para vender sin saber si perdia",
  "Otro",
];

const materialesColumns = [
  {
    key: "material",
    label: "Material / insumo",
    type: "text",
    placeholder: "Ejemplo: harina",
  },
  {
    key: "cantidad",
    label: "Cantidad que uso",
    type: "text",
    placeholder: "Ejemplo: 1 kg",
  },
  { key: "costo", label: "Costo (S/)", type: "number", placeholder: "0.00" },
];

const invisiblesColumns = [
  {
    key: "gastoInvisible",
    label: "Gasto invisible",
    type: "text",
    placeholder: "Ejemplo: bolsa",
  },
  {
    key: "comoParticipa",
    label: "¿Como participa?",
    type: "text",
    placeholder: "Ejemplo: empaque final",
  },
  {
    key: "costoUnidad",
    label: "Costo por unidad (S/)",
    type: "number",
    placeholder: "0.00",
  },
];

const gastosFijosColumns = [
  {
    key: "gastoFijo",
    label: "Gasto fijo mensual",
    type: "text",
    placeholder: "Ejemplo: alquiler",
  },
  { key: "monto", label: "Monto (S/)", type: "number", placeholder: "0.00" },
];

const toNumber = (value) => {
  const normalized = String(value ?? "")
    .replace(",", ".")
    .trim();
  const result = Number(normalized);
  return Number.isFinite(result) ? result : 0;
};

const sumByKey = (rows, key) =>
  rows.reduce((acc, row) => acc + toNumber(row[key]), 0);

const totalMateriales = computed(() => sumByKey(materialesRows.value, "costo"));
const totalInvisibles = computed(() =>
  sumByKey(invisiblesRows.value, "costoUnidad"),
);
const totalGastosFijos = computed(() =>
  sumByKey(gastosFijosRows.value, "monto"),
);

const costoTrabajo = computed(() => {
  const horas = toNumber(form.tiempoHoras);
  const minutos = toNumber(form.tiempoMinutos);
  const valorHora = toNumber(form.valorHora);
  const horasTotales = horas + minutos / 60;
  return horasTotales * valorHora;
});

const gastoFijoPorUnidad = computed(() => {
  const unidades = toNumber(form.unidadesMes);
  if (unidades <= 0) return 0;
  return totalGastosFijos.value / unidades;
});

const costoTotalReal = computed(() => {
  return (
    totalMateriales.value +
    costoTrabajo.value +
    totalInvisibles.value +
    gastoFijoPorUnidad.value
  );
});

const precioActual = computed(() => toNumber(form.precioActual));
const diferencia = computed(() => precioActual.value - costoTotalReal.value);

const margenGanancia = computed(() => {
  if (form.gananciaOption === "otro") return toNumber(form.gananciaOtro);
  return toNumber(form.gananciaOption);
});

const precioMinimo = computed(
  () => costoTotalReal.value * (1 + margenGanancia.value / 100),
);

const comparacionPrecio = computed(() => {
  if (precioActual.value > precioMinimo.value)
    return "Estoy por encima de mi precio minimo";
  if (precioActual.value < precioMinimo.value)
    return "Estoy por debajo de mi precio minimo";
  if (precioActual.value === 0 && precioMinimo.value === 0)
    return "Necesito revisar mejor mis datos";
  return "Estoy muy cerca";
});

const estadoCostoTotal = computed(() => {
  if (diferencia.value > 0) {
    return { label: "Dejando ganancia", className: "text-green-700" };
  }

  if (diferencia.value < 0) {
    return { label: "Dejando perdida", className: "text-red-700" };
  }

  return { label: "En empate", className: "text-slate-700" };
});

const validationErrors = computed(() => {
  const errors = {};

  if (!form.emprendedor.trim())
    errors.emprendedor = "Completa el nombre del emprendedor.";
  if (!form.negocio.trim()) errors.negocio = "Completa el nombre del negocio.";
  if (!form.fecha) errors.fecha = "Selecciona una fecha.";
  if (!form.productoAnalizado.trim())
    errors.productoAnalizado = "Completa el producto o servicio a analizar.";
  if (!form.unidadCalculo.trim())
    errors.unidadCalculo = "Completa la unidad de calculo.";
  if (toNumber(form.valorHora) <= 0)
    errors.valorHora = "Ingresa un valor de hora mayor a 0.";
  if (toNumber(form.unidadesMes) <= 0)
    errors.unidadesMes = "Ingresa unidades al mes mayores a 0.";
  if (toNumber(form.precioActual) <= 0)
    errors.precioActual = "Ingresa un precio actual mayor a 0.";

  const materialConCosto = materialesRows.value.some(
    (row) => toNumber(row.costo) > 0,
  );
  const invisibleConCosto = invisiblesRows.value.some(
    (row) => toNumber(row.costoUnidad) > 0,
  );
  const fijoConMonto = gastosFijosRows.value.some(
    (row) => toNumber(row.monto) > 0,
  );

  if (!materialConCosto)
    errors.materiales = "Agrega al menos un material con costo mayor a 0.";
  if (!invisibleConCosto)
    errors.invisibles = "Agrega al menos un costo invisible mayor a 0.";
  if (!fijoConMonto)
    errors.gastosFijos = "Agrega al menos un gasto fijo mensual mayor a 0.";

  return errors;
});

const showValidationPanel = computed(
  () =>
    validationTriggered.value && Object.keys(validationErrors.value).length > 0,
);

const activarValidacion = () => {
  validationTriggered.value = true;
};

const mostrarError = (key) => {
  if (!validationTriggered.value) return "";
  return validationErrors.value[key] || "";
};

const summaryTotals = computed(() => ({
  materiales: totalMateriales.value,
  trabajo: costoTrabajo.value,
  invisibles: totalInvisibles.value,
  gastoFijoUnidad: gastoFijoPorUnidad.value,
  costoTotal: costoTotalReal.value,
  precioActual: precioActual.value,
  diferencia: diferencia.value,
  precioMinimo: precioMinimo.value,
}));

const currency = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  return `S/ ${amount.toFixed(2)}`;
};
</script>
