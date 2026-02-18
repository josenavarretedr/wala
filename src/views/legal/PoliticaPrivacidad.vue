<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-4xl mx-auto">
      <!-- Botón de volver -->
      <button
        @click="goBack"
        class="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span class="font-medium">Volver</span>
      </button>

      <!-- Contenedor principal -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Header -->
        <div
          class="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12 text-center"
        >
          <h1 class="text-3xl font-bold text-white mb-4">
            POLÍTICAS DE PRIVACIDAD Y PROTECCIÓN DE DATOS DE WALA.LAT
          </h1>
          <p class="text-blue-100 text-sm mt-2">
            Última actualización: enero 2026
          </p>
        </div>

        <!-- Contenido -->
        <div class="px-8 py-10 space-y-8">
          <!-- Sección 1: INTRODUCCIÓN -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >1</span
              >
              INTRODUCCIÓN
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>NEW COOPERATION S.A.C.</strong> (en adelante,
                "Proveedor"), con RUC N° 20614634805 y domicilio en Mza. C Lote.
                16 Urb. Santa Lila, Chiclayo, Chiclayo, Lambayeque – Perú, está
                comprometido con la protección de su privacidad y datos
                personales. Esta Política de Privacidad explica cómo tratamos,
                recopilamos, utilizamos, divulgamos, transferimos y almacenamos
                su información personal al utilizar nuestros servicios, incluida
                nuestra plataforma web (SAAS) para gestión de gastos
                empresariales y demás servicios tecnológicos que ofrecemos, de
                acuerdo a la Ley N° 29733, su reglamento, y demás normas
                sustitutorias o conexas (en adelante, las "Normas de Datos
                Personales").
              </p>
              <p>
                El Proveedor actuará como Encargado de Tratamiento de Datos
                Personales cuando como consecuencia de los Servicios prestados a
                sus clientes, realiza el tratamiento de datos personales de
                Titulares de Datos Personales (en adelante, "Titulares"). Cuando
                el Proveedor realice el tratamiento directo de datos personales
                de los Titulares, el Proveedor actuará como Titular del Banco de
                Datos Personales.
              </p>
              <p>
                A través de la aceptación de esta Política de Privacidad, usted
                otorga su consentimiento, libre, previo, informado, expreso e
                inequívoco al tratamiento de sus datos personales, en las
                condiciones aquí expuestas.
              </p>
            </div>
          </section>

          <!-- Sección 2: INFORMACIÓN QUE RECOPILAMOS -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >2</span
              >
              INFORMACIÓN QUE RECOPILAMOS
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p><strong>2.1. Información recopilada:</strong></p>
              <p>
                Para utilizar nuestros servicios, recopilamos determinados datos
                de carácter personal que usted nos proporciona directamente o a
                través de terceros, incluyendo:
              </p>

              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>
                  Información de identificación personal (nombre, correo
                  electrónico).
                </li>
                <li>Información de la empresa (razón social, RUC).</li>
                <li>
                  Credenciales de acceso a su cuenta (correo electrónico).
                </li>
                <li>
                  Información sobre empleados o representantes autorizados
                  (nombre, correo electrónico, cargo, rol de rendidor, aprobador
                  o administrador).
                </li>
                <li>
                  Información contenida en reportes de gastos y otros documentos
                  que usted cargue o genere en nuestra plataforma.
                </li>
              </ul>

              <p>
                <strong>2.2. Información recopilada automáticamente:</strong>
              </p>
              <p>
                También recopilamos automáticamente cierta información cuando
                utiliza nuestros servicios:
              </p>

              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>Datos de uso y rendimiento del servicio.</li>
                <li>
                  Información del dispositivo (dirección IP, tipo de navegador,
                  sistema operativo).
                </li>
                <li>Cookies y tecnologías similares.</li>
                <li>Registros de acceso y actividad en la plataforma.</li>
                <li>
                  Datos estadísticos sobre el funcionamiento y uso del Servicio.
                </li>
              </ul>
            </div>
          </section>

          <!-- Sección 3: FINALIDAD DEL TRATAMIENTO -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >3</span
              >
              FINALIDAD DEL TRATAMIENTO DE DATOS
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                Sus datos personales serán tratados para las siguientes
                finalidades:
              </p>

              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar, mantener y mejorar nuestros servicios.</li>
                <li>Procesar transacciones y gestionar su cuenta.</li>
                <li>Autenticar su acceso a la plataforma.</li>
                <li>Atender sus consultas y brindarle soporte técnico.</li>
                <li>Enviarle comunicaciones relacionadas con el servicio.</li>
                <li>Cumplir con nuestras obligaciones contractuales.</li>
                <li>
                  Proteger la seguridad e integridad de nuestra plataforma.
                </li>
                <li>
                  Realizar análisis estadísticos y de mejora del servicio.
                </li>
                <li>Cumplir con requisitos legales y reglamentarios.</li>
                <li>
                  Proporcionar al cliente acceso a ofertas especiales de
                  productos y promociones.
                </li>
              </ul>

              <p>
                Se utilizan los servicios de empresas que implican decisiones
                automatizadas o sin intervención humana, para la finalidad de
                Reconocimiento Óptico de Caracteres, desglose de información de
                un documento y su interpretación, almacenar datos en la nube, y
                recuperar tasas de cambio.
              </p>
            </div>
          </section>

          <!-- Sección 4: BASE LEGAL -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >4</span
              >
              BASE LEGAL PARA EL TRATAMIENTO
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                Tratamos sus datos personales en base a las siguientes bases
                legales:
              </p>

              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>
                  La ejecución del contrato de servicios entre usted y el
                  Proveedor.
                </li>
                <li>
                  El consentimiento que usted nos ha otorgado aceptando la
                  presente Política.
                </li>
                <li>
                  El cumplimiento de obligaciones legales que nos corresponden.
                </li>
              </ul>
            </div>
          </section>

          <!-- Sección 5: CONFIDENCIALIDAD Y SEGURIDAD -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >5</span
              >
              CONFIDENCIALIDAD Y SEGURIDAD
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p><strong>5.1. Medidas de seguridad</strong></p>
              <p>
                Implementamos medidas técnicas y organizativas apropiadas para
                proteger sus datos personales contra el procesamiento no
                autorizado o ilegal, así como contra la pérdida, destrucción o
                daño accidental. Con el fin salvaguardar los derechos de los
                Titulares, el Proveedor establece medidas de seguridad que
                incluyen un documento de seguridad, designación de un Oficial de
                Protección de Datos Personales (OPD) y un protocolo de
                incidentes de seguridad.
              </p>

              <p><strong>5.2. Confidencialidad</strong></p>
              <p>
                Mantenemos la confidencialidad de su información y limitamos el
                acceso a sus datos personales a aquellos empleados, contratistas
                y terceros que necesitan conocer dicha información para procesar
                los datos en nuestro nombre, de acuerdo con las Normas de Datos
                Personales.
              </p>
            </div>
          </section>

          <!-- Sección 6: ALMACENAMIENTO Y CONSERVACIÓN -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >6</span
              >
              ALMACENAMIENTO Y CONSERVACIÓN DE DATOS
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                Conservamos sus datos personales durante el tiempo necesario
                para cumplir con las finalidades para las que fueron
                recopilados, incluido el cumplimiento de requisitos legales,
                fiscales o de información.
              </p>
              <p>
                Una vez resuelto o terminado el contrato, el Proveedor eliminará
                todos los datos almacenados durante la vigencia de este, de
                acuerdo con las Normas de Datos Personales.
              </p>
            </div>
          </section>

          <!-- Sección 7: TRANSFERENCIA DE DATOS -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >7</span
              >
              TRANSFERENCIA DE DATOS PERSONALES
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong
                  >7.1. Transferencia de datos personales a terceros</strong
                >
              </p>
              <p>
                No compartimos su información personal con terceros, excepto en
                las siguientes circunstancias:
              </p>

              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>Cuando contamos con su consentimiento expreso.</li>
                <li>
                  Con proveedores de servicios que nos ayudan a prestar nuestros
                  servicios.
                </li>
                <li>
                  Cuando sea necesario para cumplir con una obligación legal.
                </li>
                <li>
                  En caso de reorganización, fusión, venta o transferencia de
                  nuestro negocio.
                </li>
              </ul>

              <p>
                Los terceros a los cuales se podrá transferir o encargar el
                tratamiento de datos personales son:
              </p>

              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Google Cloud Platform:</strong> Infraestructura
                  tecnológica y almacenamiento en la nube.
                </li>
                <li>
                  <strong>APIS.NET:</strong> Validación de información de RUC,
                  DNI y Tipo de Cambio.
                </li>
                <li>
                  <strong>a9t9 software GmbH:</strong> Procesamiento y
                  conversión de imágenes.
                </li>
                <li>
                  <strong>OpenAI OpCo, LLC:</strong> Servicios de inteligencia
                  artificial.
                </li>
                <li>
                  <strong>Gemini AI de Google LLC:</strong> Servicios de
                  inteligencia artificial.
                </li>
              </ul>

              <p><strong>7.2. Análisis estadísticos</strong></p>
              <p>
                El Proveedor podrá hacer públicos los análisis para la
                implementación del Servicio; no obstante, los análisis del
                servicio no incorporarán detalle alguno de los datos personales
                de los Titulares o información que de alguna manera pueda servir
                para identificar al Usuario.
              </p>
            </div>
          </section>

          <!-- Sección 8: DERECHOS DE LOS TITULARES -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >8</span
              >
              DERECHOS DE LOS TITULARES DE DATOS
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                Los Titulares cuentan con los derechos que le ha conferido la
                Constitución y las Normas de Datos Personales, como los de
                información, acceso, actualizar, cancelar, oponerse, inclusión,
                tratamiento objetivo, portabilidad, rectificar y solicitar la
                supresión de los datos personales suministrados.
              </p>
              <p>
                El ejercicio de los derechos se lleva a cabo mediante solicitud
                dirigida al Proveedor, la misma que debe contener:
              </p>

              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>Nombres y apellidos del Titular y acreditación de estos</li>
                <li>Petición concreta que da lugar a la solicitud</li>
                <li>Domicilio o dirección electrónica para notificaciones</li>
                <li>Fecha y firma del solicitante</li>
                <li>Documentos que sustenten la petición, de ser el caso</li>
              </ul>
            </div>
          </section>

          <!-- Sección 9: COOKIES -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >9</span
              >
              COOKIES Y TECNOLOGÍAS SIMILARES
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                Utilizamos cookies y tecnologías similares para mejorar su
                experiencia y analizar el tráfico. Puede gestionar sus
                preferencias de cookies a través de la configuración de su
                navegador. Cualquier tratamiento de datos personales que se
                realice a partir de cookies estará en cumplimiento con la
                presente Política y las Normas de Datos Personales.
              </p>
            </div>
          </section>

          <!-- Sección 10: MODIFICACIONES -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >10</span
              >
              MODIFICACIONES A LA POLÍTICA DE PRIVACIDAD
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                Nos reservamos el derecho de modificar esta Política de
                Privacidad en cualquier momento. Le notificaremos sobre cambios
                materiales mediante un aviso destacado en nuestro sitio web o
                enviándole un correo electrónico directamente.
              </p>
            </div>
          </section>

          <!-- Sección 11: LEY APLICABLE -->
          <section class="border-l-4 border-blue-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold"
                >11</span
              >
              LEGISLACIÓN APLICABLE Y JURISDICCIÓN
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                Esta Política de Privacidad se rige por las leyes peruanas,
                específicamente por las Normas de Datos personales. Cualquier
                controversia relacionada con esta Política de Privacidad estará
                sujeta a la jurisdicción y competencia exclusiva de los jueces y
                tribunales de la corte superior de justicia de Lima.
              </p>
            </div>
          </section>

          <!-- Footer -->
          <div class="pt-8 border-t border-gray-200">
            <p class="text-center text-sm text-gray-500">
              © 2026 NEW COOPERATION S.A.C. Todos los derechos reservados.
            </p>
            <p class="text-center text-xs text-gray-400 mt-2">
              Este documento ha sido elaborado en cumplimiento de la Ley N°
              29733 - Ley de Protección de Datos Personales del Perú
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
