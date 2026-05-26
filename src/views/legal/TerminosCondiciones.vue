<template>
  <div
    class="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-display relative overflow-hidden"
  >
    <!-- Ambient blurs -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
      <div class="absolute top-10 left-10 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-30"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-emerald-50 rounded-full filter blur-3xl opacity-20"></div>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Botón de volver -->
      <button
        @click="goBack"
        class="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-100 rounded-full text-sm font-semibold text-gray-600 hover:text-gray-900 shadow-sm transition-all duration-300 hover:-translate-x-1 cursor-pointer"
      >
        <svg
          class="w-4 h-4 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Volver</span>
      </button>

      <!-- Contenedor principal -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.06)] p-8 sm:p-12 md:p-16 relative overflow-hidden">
        <!-- Header -->
        <div class="text-center pb-10 border-b border-gray-100 mb-10">
          <span
            class="inline-block px-4 py-1.5 bg-emerald-50 border border-emerald-100/60 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4"
          >
            Términos de Uso
          </span>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight uppercase">
            Condiciones Generales de Adhesión y Uso de WALA
          </h1>
          <p class="text-gray-400 text-sm mt-3 font-semibold">
            Última actualización: enero 2026
          </p>
        </div>

        <!-- Contenido -->
        <div class="space-y-12">
          <!-- Introducción -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                Las presentes Condiciones Generales de Uso de la Plataforma de
                Wala (en adelante, las "Condiciones de Uso") regulan la relación
                contractual entre
                <strong>NEW COOPERATION S.A.C.</strong> debidamente identificada
                con RUC No. 20614634805, con domicilio para estos efectos en
                Mza. C Lote. 16 Urb. Santa Lila, Chiclayo, Chiclayo, Lambayeque,
                Perú, (en adelante, "Wala") y los Clientes que acceden y
                utilizan la plataforma digital de Wala, accesible a través del
                sitio web https://wala.lat ("Plataforma" o "Plataforma Wala")
                para solicitar, acceder y usar la Plataforma tipo Software as a
                Service (el "Servicio") que permite la gestión digital integral
                de actividades empresariales, incluyendo, de manera enunciativa
                mas no limitativa:
              </p>
              <ul class="list-none space-y-2 ml-4">
                <li>
                  <strong>a)</strong> El registro, organización y análisis de
                  ingresos y egresos, incluyendo transacciones diarias,
                  categorización de movimientos, cálculo de utilidades y
                  visualización de flujo de caja simplificado.
                </li>
                <li>
                  <strong>b)</strong> La administración y control de
                  inventarios, incluyendo registro de productos, actualización
                  de stock, valorización básica, identificación de productos de
                  mayor rotación y alertas de reposición.
                </li>
                <li>
                  <strong>c)</strong> La gestión de clientes y proveedores,
                  incluyendo almacenamiento de datos básicos de contacto,
                  historial de operaciones comerciales, cuentas por cobrar y
                  cuentas por pagar.
                </li>
                <li>
                  <strong>d)</strong> El registro de actividades operativas del
                  negocio, tales como ventas, compras, obligaciones pendientes,
                  recordatorios y reportes internos.
                </li>
                <li>
                  <strong>e)</strong> La generación de indicadores básicos de
                  desempeño empresarial, proyecciones simples y reportes
                  visuales orientados a facilitar la toma de decisiones
                  financieras y operativas.
                </li>
              </ul>
              <p>
                El Servicio podrá incorporar funcionalidades adicionales de
                acompañamiento digital, recomendaciones automatizadas,
                contenidos educativos contextualizados y otras herramientas
                empresariales que Wala implemente progresivamente bajo su modelo
                freemium o de suscripción.
              </p>
              <p>
                El Servicio constituye una herramienta tecnológica de apoyo a la
                gestión empresarial y no reemplaza asesoría contable,
                tributaria, financiera o legal profesional.
              </p>
              <p>
                El Uso de la Plataforma por parte de los Clientes está sujeto a
                su acuerdo y aceptación de estas Condiciones de Uso junto con la
                Política de Privacidad de Wala, que se puede encontrar en
                https://wala.lat/politicas-de-privacidad ("Política de
                Privacidad") y todas las demás políticas y principios que rigen
                Wala.
              </p>
            </div>
          </section>

          <!-- Cláusula Primera -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >1</span
              >
              CLÁUSULA PRIMERA: NATURALEZA JURÍDICA
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>1.1.</strong> El Cliente entiende y reconoce que estas
                Condiciones de Uso y Política de Privacidad tienen la naturaleza
                legal de un contrato y acepta que la aceptación vinculará al
                Cliente a sus términos y condiciones. En consecuencia,
                recomendamos que el Cliente imprima una copia de estos
                documentos para referencia futura.
              </p>

              <p>
                <strong>1.2.</strong> El Cliente declara haber leído y
                comprendido todas las condiciones establecidas en la Política de
                Privacidad y en las presentes Condiciones de Uso y declara su
                conformidad y aceptación en el momento de registrarse y hacer
                uso de la Plataforma.
              </p>

              <p>
                <strong>1.3.</strong> En ese sentido, el Servicio se entenderá
                iniciado con la aceptación de las presentes Condiciones de Uso
                mediante su click al checkbox de aceptación de las Condiciones
                de Uso.
              </p>
            </div>
          </section>

          <!-- Cláusula Segunda -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >2</span
              >
              CLÁUSULA SEGUNDA: DEFINICIONES
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>2.1.</strong> Los términos utilizados en estas
                Condiciones de Uso tendrán los significados que se indican a
                continuación:
              </p>

              <ul class="list-disc list-inside space-y-2 ml-4 text-gray-600">
                <li>
                  <strong>Cliente:</strong> Una persona física o jurídica que se
                  registra, y usa la Plataforma de Wala con el fin de gestionar
                  sus gastos empresariales.
                </li>
                <li>
                  <strong>Legislación de Datos Personales:</strong> Ley de
                  Protección de Datos Personales, Ley No. 29733, y su reglamento
                  aprobado por Decreto Supremo 016-2024-JUS.
                </li>
                <li>
                  <strong>Plataforma de Wala:</strong> Una plataforma virtual
                  accesible a través de la web (disponible en https://wala.lat)
                  a través de la cual los Clientes pueden gestionar sus gastos
                  empresariales.
                </li>
                <li>
                  <strong>Política de Privacidad:</strong> Es la Política de
                  Privacidad de la Plataforma Wala disponible en
                  https://wala.lat/politicas-de-privacidad.
                </li>
                <li>
                  <strong>Servicio:</strong> La Plataforma en modalidad SaaS
                  empleada para gestionar gastos empresariales.
                </li>
              </ul>
            </div>
          </section>

          <!-- Cláusula Tercera -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >3</span
              >
              CLÁUSULA TERCERA: CONTRAPRESTACIÓN POR EL USO DE LA PLATAFORMA
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>3.1.</strong> La contraprestación de los servicios es
                equivalente a la oferta de contrato en línea completada. Los
                precios son precios netos mensuales en soles y sin IGV. La
                facturación del Servicio se realizará con periodicidad mensual,
                anual o, en casos muy especiales, de una sola vez para
                suscripciones de por vida.
              </p>

              <p>
                <strong>3.2.</strong> Salvo que se indique expresamente lo
                contrario, las tarifas se expresan en soles peruanos (PEN), no
                incluyen el Impuesto General a las Ventas (IGV) ni otros
                tributos aplicables.
              </p>

              <p>
                <strong>3.3.</strong> La tarifa base mensual será calculada
                conforme a los términos de la propuesta comercial o al plan
                seleccionado por el Cliente a través de la plataforma digital de
                Wala.
              </p>
            </div>
          </section>

          <!-- Cláusula Cuarta -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >4</span
              >
              CLÁUSULA CUARTA: PROPIEDAD INTELECTUAL
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>4.1.</strong> Wala es y será dueño exclusivo y retendrá
                todo derecho, título e interés sobre la marca y Plataforma y el
                contenido y/o cualquier otro elemento insertado en la Plataforma
                de acuerdo con las normas de propiedad intelectual e industrial.
              </p>

              <p>
                <strong>4.2.</strong> El Cliente reconoce que el objeto de las
                Condiciones de Uso es la prestación de los servicios
                tecnológicos, por lo que las presentes Condiciones de Uso no
                implican ni tendrán como resultado el otorgamiento de derecho ni
                licencia alguna sobre la propiedad intelectual.
              </p>
            </div>
          </section>

          <!-- Cláusula Quinta -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >5</span
              >
              CLÁUSULA QUINTA: CONFIDENCIALIDAD
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>5.1.</strong> Las Partes reconocen que, durante la
                relación contractual, podrán tener acceso a información
                confidencial y estratégica.
              </p>

              <p>
                <strong>5.2.</strong> La Información Confidencial incluye, sin
                limitarse a: especificaciones técnicas, configuraciones de
                software, modelos de negocio, metodologías, precios, manuales,
                estructuras de base de datos, credenciales de acceso,
                algoritmos, estrategias comerciales, documentación técnica,
                información financiera, comercial y estratégica.
              </p>
            </div>
          </section>

          <!-- Cláusula Sexta -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >6</span
              >
              CLÁUSULA SEXTA: USO – OBLIGACIONES DEL CLIENTE
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p><strong>6.1.</strong> El Cliente se obliga a:</p>

              <ul class="list-disc list-inside space-y-2 ml-4 text-gray-600">
                <li>
                  Abstenerse de copiar total o parcialmente los elementos
                  técnicos, visuales o funcionales de las Plataformas.
                </li>
                <li>
                  Abstenerse de publicar, entregar o transmitir cualquier
                  contenido que infrinja derechos de propiedad intelectual.
                </li>
                <li>
                  Impedir el uso no autorizado del Servicio o cualquier elemento
                  dentro del Servicio brindado por Wala.
                </li>
                <li>
                  Brindar información veraz, actualizada y oportuna para la
                  provisión del Servicio.
                </li>
              </ul>
            </div>
          </section>

          <!-- Cláusula Séptima -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >7</span
              >
              CLÁUSULA SÉPTIMA: PROTECCIÓN Y TRATAMIENTO DE DATOS PERSONALES
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>7.1.</strong> En el marco de la prestación de los
                Servicios, el Cliente podrá proporcionar a Wala datos personales
                sobre los cuales Wala actuará en calidad de Encargado de
                Tratamiento, conforme a la Legislación de Datos Personales.
              </p>

              <p>
                <strong>7.2.</strong> Wala se compromete a tratar los Datos
                Personales únicamente para los fines permitidos por las
                Condiciones de Uso e implementar medidas técnicas y
                organizativas de seguridad adecuadas.
              </p>
            </div>
          </section>

          <!-- Cláusula Octava -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >8</span
              >
              CLÁUSULA OCTAVA: RESPONSABILIDAD
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>8.1.</strong> El Cliente reconoce y acepta que el acceso
                y uso del Servicio se realiza bajo su exclusiva responsabilidad.
              </p>

              <p>
                <strong>8.2.</strong> Wala brindará el Servicio de manera
                diligente y conforme a estándares razonables del sector. No
                obstante, Wala no garantiza que el Servicio esté completamente
                libre de errores, interrupciones ocasionales o fallos técnicos.
              </p>

              <p>
                <strong>8.3.</strong> La responsabilidad total de Wala frente al
                Cliente no excederá en ningún caso el monto efectivamente pagado
                por el Cliente por el Servicio en el mes anterior al hecho
                generador del reclamo.
              </p>
            </div>
          </section>

          <!-- Cláusula Novena -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >9</span
              >
              CLÁUSULA NOVENA: RESOLUCIÓN
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>9.1.</strong> Ante un incumplimiento, las Partes podrán
                resolver el presente Contrato en cualquier momento, únicamente
                debiendo cursar comunicación escrita a la otra parte, si
                habiéndose notificado el incumplimiento, este no fuera subsanado
                dentro de un plazo de treinta (30) días.
              </p>

              <p>
                <strong>9.2.</strong> Una vez resuelto el contrato, el Cliente
                está obligado a eliminar sin que se le solicite cualquier
                reproducción del software proporcionado y del código de Wala.
              </p>
            </div>
          </section>

          <!-- Cláusula Décima -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >10</span
              >
              CLÁUSULA DÉCIMA: CESIÓN
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>10.1.</strong> El Cliente no podrá ceder sus derechos y
                obligaciones en virtud de estas Condiciones de uso sin el
                consentimiento previo por escrito de Wala. Wala podrá ceder, sin
                necesidad de obtener el consentimiento previo del Cliente,
                mediante una simple notificación.
              </p>
            </div>
          </section>

          <!-- Cláusula Undécima -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >11</span
              >
              CLÁUSULA UNDÉCIMA: ACUERDO INTEGRAL
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>11.1.</strong> Las presentes Condiciones de Uso
                constituyen la manifestación íntegra de la voluntad de las
                partes y reemplaza cualquier propuesta, negociación,
                comunicación, entendimiento o acuerdo previo relacionado con el
                objeto de este.
              </p>
            </div>
          </section>

          <!-- Cláusula Duodécima -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >12</span
              >
              CLÁUSULA DUODÉCIMA: DISPOSICIÓN GENERAL
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>12.1.</strong> Estas Condiciones de uso pueden ser
                modificadas de vez en cuando. Si se producen cambios
                significativos, le informaremos por los medios de comunicación
                disponibles y proporcionaremos un período de tiempo razonable
                para revisar dichos cambios.
              </p>
            </div>
          </section>

          <!-- Cláusula Decimotercera -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >13</span
              >
              CLÁUSULA DECIMOTERCERA: LEY APLICABLE Y JURISDICCIÓN
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>13.1.</strong> Estas Condiciones de uso se regirán e
                interpretarán exclusivamente de acuerdo con las leyes de Lima,
                Perú.
              </p>

              <p>
                <strong>13.2.</strong> Las Partes se comprometen a tratar de
                resolver el conflicto de manera amistosa. Cuando este
                procedimiento no tenga éxito, las Partes podrán presentar
                cualquier reclamación ante los Tribunales de Lima, Cercado.
              </p>
            </div>
          </section>

          <!-- Cláusula Decimocuarta -->
          <section class="border-l-2 border-emerald-200/80 pl-6 sm:pl-8">
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3.5"
            >
              <span
                class="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50 font-bold text-sm shrink-0 shadow-sm"
                >14</span
              >
              CLÁUSULA DECIMOCUARTA: ACEPTACIÓN
            </h2>
            <div class="text-gray-600 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                <strong>14.1.</strong> Al aceptar las presentes Condiciones de
                Uso, el Cliente declara tener capacidad jurídica y reconoce
                expresa e inequívocamente haber leído, entendido y aceptado
                íntegramente sus condiciones generales.
              </p>
            </div>
          </section>

          <!-- Footer -->
          <div class="pt-10 border-t border-gray-100 text-center space-y-2 mt-12">
            <p class="text-sm text-gray-500 font-medium">
              © 2026 NEW COOPERATION S.A.C. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>
