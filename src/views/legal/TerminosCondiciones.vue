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
          class="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center"
        >
          <h1 class="text-3xl font-bold text-white mb-4">
            CONDICIONES GENERALES DE ADHESIÓN Y USO DE LA PLATAFORMA WALA
          </h1>
          <p class="text-green-100 text-sm mt-2">
            Última actualización: enero 2026
          </p>
        </div>

        <!-- Contenido -->
        <div class="px-8 py-10 space-y-8">
          <!-- Introducción -->
          <section class="border-l-4 border-green-500 pl-6">
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >1</span
              >
              CLÁUSULA PRIMERA: NATURALEZA JURÍDICA
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >2</span
              >
              CLÁUSULA SEGUNDA: DEFINICIONES
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>2.1.</strong> Los términos utilizados en estas
                Condiciones de Uso tendrán los significados que se indican a
                continuación:
              </p>

              <ul class="list-disc list-inside space-y-2 ml-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >3</span
              >
              CLÁUSULA TERCERA: CONTRAPRESTACIÓN POR EL USO DE LA PLATAFORMA
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >4</span
              >
              CLÁUSULA CUARTA: PROPIEDAD INTELECTUAL
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >5</span
              >
              CLÁUSULA QUINTA: CONFIDENCIALIDAD
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >6</span
              >
              CLÁUSULA SEXTA: USO – OBLIGACIONES DEL CLIENTE
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p><strong>6.1.</strong> El Cliente se obliga a:</p>

              <ul class="list-disc list-inside space-y-2 ml-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >7</span
              >
              CLÁUSULA SÉPTIMA: PROTECCIÓN Y TRATAMIENTO DE DATOS PERSONALES
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >8</span
              >
              CLÁUSULA OCTAVA: RESPONSABILIDAD
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >9</span
              >
              CLÁUSULA NOVENA: RESOLUCIÓN
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >10</span
              >
              CLÁUSULA DÉCIMA: CESIÓN
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >11</span
              >
              CLÁUSULA UNDÉCIMA: ACUERDO INTEGRAL
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >12</span
              >
              CLÁUSULA DUODÉCIMA: DISPOSICIÓN GENERAL
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >13</span
              >
              CLÁUSULA DECIMOTERCERA: LEY APLICABLE Y JURISDICCIÓN
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
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
          <section class="border-l-4 border-green-500 pl-6">
            <h2
              class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"
            >
              <span
                class="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-bold"
                >14</span
              >
              CLÁUSULA DECIMOCUARTA: ACEPTACIÓN
            </h2>
            <div class="text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>14.1.</strong> Al aceptar las presentes Condiciones de
                Uso, el Cliente declara tener capacidad jurídica y reconoce
                expresa e inequívocamente haber leído, entendido y aceptado
                íntegramente sus condiciones generales.
              </p>
            </div>
          </section>

          <!-- Footer -->
          <div class="pt-8 border-t border-gray-200">
            <p class="text-center text-sm text-gray-500">
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
