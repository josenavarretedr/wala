import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useAuthStore } from "./authStore";
import { useToast } from "@/composables/useToast";

export const AREAS_CONFIG = [
  {
    id: 1,
    name: "Negocios y familia",
    key: "negocioFamilia",
    icon: "Home",
    indicators: [
      {
        key: "1.1",
        title: "Se paga un salario",
        evaluates: "Si el emprendedor distingue entre ser dueño del negocio y ser trabajador dentro del negocio.",
        levels: [
          { value: 0, text: "No se paga nada; toma dinero del negocio según necesidad personal" },
          { value: 1, text: "Sabe que debería pagarse, pero solo retira cuando “hay un sobrante”" },
          { value: 2, text: "Tiene definido un monto de pago propio, pero no lo cumple de manera estable" },
          { value: 3, text: "Se paga un monto fijo y reconocible como salario del dueño, con una frecuencia clara" }
        ],
        questions: [
          "Cuando el negocio genera dinero, ¿cómo decides cuánto puedes usar para ti?",
          "En un mes normal, ¿sueles separar algo para pagarte como dueño?",
          "¿Ese monto ya lo tienes pensado o depende de cómo venga la semana?",
          "La última vez que te pagaste a ti mismo, ¿cómo lo hiciste?"
        ],
        signals: [
          "Si responde “yo saco lo que necesito”, está entre 0 y 1.",
          "Si menciona un monto fijo pero no una rutina clara, probablemente está en 2.",
          "Si puede decir monto, frecuencia y mostrar registro, está en 3."
        ]
      },
      {
        key: "1.2",
        title: "Paga salario a familiares que trabajan en el negocio",
        evaluates: "Si el negocio reconoce el trabajo de los familiares como un costo real y no como ayuda invisible.",
        levels: [
          { value: 0, text: "Los familiares trabajan sin pago definido" },
          { value: 1, text: "A veces reciben algo, pero no existe acuerdo claro ni monto fijo" },
          { value: 2, text: "Hay un monto pensado o una compensación frecuente, pero no constante ni registrada" },
          { value: 3, text: "Los familiares que trabajan reciben un pago claro, periódico y reconocible como gasto del negocio" }
        ],
        questions: [
          "¿Quiénes de tu familia te apoyan hoy dentro del negocio?",
          "Cuando ellos participan, ¿cómo manejan ese tema del pago?",
          "¿Han acordado algún monto o normalmente lo resuelven sobre la marcha?",
          "¿Cómo sabes si ese apoyo familiar te está costando o no al negocio?"
        ],
        signals: [
          "“Me ayudan nomás” indica 0.",
          "“A veces les doy algo” indica 1.",
          "Si existe acuerdo verbal pero no hábito ni registro, indica 2.",
          "Si se reconoce como costo periódico del negocio, indica 3."
        ]
      },
      {
        key: "1.3",
        title: "No retira dinero de la empresa sin control",
        evaluates: "Si existe disciplina para no mezclar caja personal con caja del negocio.",
        levels: [
          { value: 0, text: "Retira dinero del negocio sin control ni registro" },
          { value: 1, text: "A veces anota o recuerda los retiros, pero no siempre" },
          { value: 2, text: "Registra retiros, pero todavía mezcla gastos personales y del negocio" },
          { value: 3, text: "Todo retiro personal está controlado, registrado y diferenciado del dinero del negocio" }
        ],
        questions: [
          "Cuando surge un gasto personal urgente, ¿cómo haces si la plata está en la caja del negocio?",
          "¿Tienes alguna forma de anotar lo que sale para ti o para tu casa?",
          "¿Qué pasa después con ese dinero: lo consideras pago, préstamo o simplemente salida?",
          "Hoy, ¿podrías identificar cuánto dinero de la caja fue para ti este mes?"
        ],
        signals: [
          "Si el emprendedor normaliza sacar dinero sin anotarlo, es 0.",
          "Si dice “a veces me acuerdo” o “lo tengo en mente”, es 1.",
          "Si ya distingue retiros pero aún mezcla fondos, es 2.",
          "Si existe separación y trazabilidad, es 3."
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Marketing",
    key: "marketing",
    icon: "Megaphone",
    indicators: [
      {
        key: "2.1",
        title: "Conoce a sus clientes, necesidades y oportunidades de mercado",
        evaluates: "Si el emprendedor entiende a quién le vende, qué problema resuelve y dónde hay oportunidades reales.",
        levels: [
          { value: 0, text: "No identifica con claridad a su cliente ni sus necesidades" },
          { value: 1, text: "Tiene una idea general del cliente, pero muy superficial" },
          { value: 2, text: "Conoce bien a su cliente principal, aunque no usa ese conocimiento de forma estratégica" },
          { value: 3, text: "Describe con claridad a su cliente, sus necesidades y ajusta decisiones en función de ello" }
        ],
        questions: [
          "Cuéntame, ¿quién es la persona que más te compra hoy?",
          "¿Qué busca exactamente cuando te compra a ti y no a otro?",
          "¿Qué problema le ayudas a resolver o qué le haces más fácil?",
          "Últimamente, ¿has notado algún cambio en lo que tus clientes te están pidiendo?"
        ],
        signals: [
          "Respuestas genéricas como “vendo para todos” indican 0.",
          "Si identifica un tipo de cliente sin mucha profundidad, indica 1.",
          "Si conoce muy bien al cliente pero no lo traduce a acciones, indica 2.",
          "Si adapta oferta, mensaje o producto según lo que detecta, indica 3."
        ]
      },
      {
        key: "2.2",
        title: "Promueve el negocio y sus productos",
        evaluates: "Si realiza acciones intencionales para generar visibilidad y atraer ventas.",
        levels: [
          { value: 0, text: "No promueve el negocio de manera intencional" },
          { value: 1, text: "Hace promoción esporádica o improvisada" },
          { value: 2, text: "Tiene canales de promoción activos, pero sin consistencia ni seguimiento" },
          { value: 3, text: "Promueve con frecuencia, claridad y cierta noción de qué canal le funciona mejor" }
        ],
        questions: [
          "Cuando quieres vender más, ¿qué sueles hacer para moverte y atraer clientes?",
          "¿Cómo se enteran hoy las personas de que existes?",
          "¿Hay algún canal que te traiga más consultas o ventas?",
          "En el último mes, ¿qué hiciste para mostrar tu producto o servicio?"
        ],
        signals: [
          "Si depende solo del paso de la gente o del azar, es 0.",
          "Si publica o promociona de vez en cuando, es 1.",
          "Si ya tiene canal activo pero sin frecuencia ni aprendizaje, es 2.",
          "Si sabe qué hace, dónde lo hace y qué resultado trae, es 3."
        ]
      },
      {
        key: "2.3",
        title: "Comercializa productos de forma competitiva (basado en costeo y margen)",
        evaluates: "Si fija precios con criterio económico y no solo por intuición o copia del mercado.",
        levels: [
          { value: 0, text: "Define precios sin base clara, por intuición o copiando a otros" },
          { value: 1, text: "Sabe que debería calcular mejor, pero aún no lo hace correctamente" },
          { value: 2, text: "Calcula parte de sus costos y usa eso para poner precio, pero de forma incompleta" },
          { value: 3, text: "Define precios considerando costo total y margen deseado, y puede explicarlo" }
        ],
        questions: [
          "¿Cómo decides hoy el precio de lo que vendes?",
          "Cuando suben tus costos, ¿cómo ajustas tu precio?",
          "¿Tu precio sale de un cálculo tuyo o más bien de mirar cuánto cobra la competencia?",
          "¿Cómo sabes que ese precio realmente te deja ganancia?"
        ],
        signals: [
          "“Cobro parecido a los demás” sin cálculo es 0.",
          "Si reconoce que no lo tiene claro, pero entiende el problema, es 1.",
          "Si calcula materiales o parte del costo, es 2.",
          "Si explica costo total + margen, es 3."
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Compras",
    key: "compras",
    icon: "Cart",
    indicators: [
      {
        key: "3.1",
        title: "Recolecta cotizaciones de varios proveedores",
        evaluates: "Si compara antes de comprar y no depende de un solo proveedor por costumbre.",
        levels: [
          { value: 0, text: "Compra siempre al mismo proveedor sin comparar" },
          { value: 1, text: "Compara de vez en cuando, pero no como práctica habitual" },
          { value: 2, text: "Compara en algunas compras relevantes, aunque no de forma sistemática" },
          { value: 3, text: "Compara regularmente varias opciones antes de decidir compras importantes" }
        ],
        questions: [
          "Cuando necesitas comprar mercadería o insumos, ¿cómo eliges a quién comprarle?",
          "¿Normalmente revisas más de una opción o ya tienes un proveedor fijo?",
          "¿Qué cosas comparas antes de comprar: precio, calidad, tiempo, crédito?",
          "La última compra importante que hiciste, ¿cómo la decidiste?"
        ],
        signals: [
          "Si nunca compara, es 0.",
          "Si compara solo por casualidad, es 1.",
          "Si lo hace en compras grandes, es 2.",
          "Si existe hábito de comparación con criterios claros, es 3."
        ]
      },
      {
        key: "3.2",
        title: "Verifica bienes en la entrega y maneja devoluciones correctamente",
        evaluates: "Si revisa lo recibido y sabe actuar cuando hay errores o fallas.",
        levels: [
          { value: 0, text: "Recibe sin revisar y no maneja devoluciones" },
          { value: 1, text: "Revisa algunas veces, pero sin rutina ni criterio claro" },
          { value: 2, text: "Revisa con frecuencia, aunque no siempre documenta o formaliza reclamos" },
          { value: 3, text: "Verifica sistemáticamente y sabe gestionar reclamos o devoluciones cuando corresponde" }
        ],
        questions: [
          "Cuando te entregan mercadería, ¿qué cosas revisas normalmente?",
          "¿Te ha pasado que llegue algo incompleto, dañado o distinto a lo pedido?",
          "En esos casos, ¿qué sueles hacer?",
          "¿Hay algún paso que siempre sigues antes de guardar lo que llega?"
        ],
        signals: [
          "Si recibe y guarda sin revisar, es 0.",
          "Si revisa “a veces”, es 1.",
          "Si ya revisa casi siempre pero sin proceso sólido, es 2.",
          "Si tiene una rutina clara y puede contar un reclamo reciente, es 3."
        ]
      },
      {
        key: "3.3",
        title: "Planifica el volumen de compras según necesidades del negocio",
        evaluates: "Si compra en función de demanda y stock, no solo por impulso o urgencia.",
        levels: [
          { value: 0, text: "Compra solo cuando falta producto o cuando aparece dinero disponible" },
          { value: 1, text: "Tiene una idea aproximada de cuánto comprar, pero no lo calcula" },
          { value: 2, text: "Usa alguna referencia para comprar, aunque todavía sin una planificación consistente" },
          { value: 3, text: "Planifica cantidades en función de ventas, stock y período próximo" }
        ],
        questions: [
          "¿Cómo decides cuánto comprar en cada reposición?",
          "¿Te basas más en experiencia, en lo que recuerdas vender o en algún registro?",
          "¿Te ha pasado comprar de más o quedarte corto? ¿Qué ocurrió ahí?",
          "Antes de comprar, ¿revisas cuánto te queda y cuánto esperas vender?"
        ],
        signals: [
          "Compra reactiva pura: 0.",
          "Cálculo “más o menos”: 1.",
          "Ya usa alguna referencia parcial: 2.",
          "Compra conectando stock + ventas esperadas: 3."
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Control de stock",
    key: "controlStock",
    icon: "Archive",
    indicators: [
      {
        key: "4.1",
        title: "Mantiene registros de stock actualizados y comprensibles",
        evaluates: "Si sabe qué tiene, cuánto tiene y si esa información está realmente actualizada.",
        levels: [
          { value: 0, text: "No lleva registro de stock" },
          { value: 1, text: "Tiene registros incompletos, confusos o desactualizados" },
          { value: 2, text: "Lleva registro, pero no siempre coincide con la realidad actual" },
          { value: 3, text: "Tiene registro actualizado, claro y usable para decidir" }
        ],
        questions: [
          "Si ahora mismo hubiera que saber qué productos tienes y cuántos quedan, ¿cómo lo revisarías?",
          "¿Lo manejas más por memoria o tienes algún registro?",
          "¿Cada cuánto haces ese control?",
          "Cuando revisas tu stock físico, ¿suele coincidir con lo que tienes anotado?"
        ],
        signals: [
          "Memoria sin soporte: 0.",
          "Registro viejo o poco claro: 1.",
          "Registro útil pero con desfases: 2.",
          "Registro al día y confiable: 3."
        ]
      },
      {
        key: "4.2",
        title: "Hace regularmente renovación de stock",
        evaluates: "Si repone con anticipación razonable y evita quiebres de stock.",
        levels: [
          { value: 0, text: "Repone solo cuando el producto ya se terminó" },
          { value: 1, text: "Repone con algo de anticipación, pero sin criterio definido" },
          { value: 2, text: "Tiene una práctica de reposición más o menos estable, aunque todavía imprecisa" },
          { value: 3, text: "Repone regularmente con un criterio claro de stock mínimo o punto de reposición" }
        ],
        questions: [
          "¿Cómo te das cuenta de que ya toca volver a comprar?",
          "¿Esperas a que se acabe o te adelantas un poco?",
          "¿Hay productos que se te agotan más seguido de lo que quisieras?",
          "¿Tienes alguna cantidad mínima que te sirva como alerta para reponer?"
        ],
        signals: [
          "Si espera al quiebre, es 0.",
          "Si se adelanta sin método, es 1.",
          "Si ya tiene cierta rutina informal, es 2.",
          "Si maneja stock mínimo o criterio numérico, es 3."
        ]
      },
      {
        key: "4.3",
        title: "Evita sobre/sub-stock y no conserva productos defectuosos",
        evaluates: "Si controla exceso, escasez y calidad del inventario.",
        levels: [
          { value: 0, text: "Mantiene exceso, faltantes frecuentes o productos defectuosos sin control" },
          { value: 1, text: "Detecta el problema, pero no actúa de manera constante" },
          { value: 2, text: "Corrige parte del problema, aunque todavía de forma reactiva" },
          { value: 3, text: "Revisa y corrige de forma periódica para evitar acumulación, faltantes y deterioro" }
        ],
        questions: [
          "¿Hay productos que se te quedan mucho tiempo sin salir?",
          "¿Te ha pasado perder ventas por no tener justo lo que el cliente buscaba?",
          "¿Qué haces cuando notas productos dañados, vencidos o que ya no rotan?",
          "¿Revisas tu stock con alguna frecuencia para detectar esas situaciones?"
        ],
        signals: [
          "Si conviven productos dañados o quiebres sin atención, es 0.",
          "Si solo se da cuenta, pero no corrige, es 1.",
          "Si corrige cuando explota el problema, es 2.",
          "Si revisa y previene, es 3."
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Costeo",
    key: "costeo",
    icon: "Coins",
    indicators: [
      {
        key: "5.1",
        title: "Calcula costos de materiales directos",
        evaluates: "Si conoce cuánto le cuestan los materiales o insumos que entran directamente en su producto o servicio.",
        levels: [
          { value: 0, text: "No sabe cuánto cuestan los materiales por producto o servicio" },
          { value: 1, text: "Tiene una idea aproximada, pero sin cálculo formal" },
          { value: 2, text: "Calcula materiales en algunos productos, pero no en toda su oferta o no lo actualiza" },
          { value: 3, text: "Calcula con claridad y puede decir cuánto cuestan los materiales por unidad" }
        ],
        questions: [
          "Si tomamos tu producto principal, ¿cuánto te cuesta hacerlo solo en materiales?",
          "¿Ese cálculo lo tienes anotado o lo manejas de memoria?",
          "Cuando sube el precio de un insumo, ¿cómo te enteras de cuánto cambia tu costo?",
          "¿Has hecho ese cálculo para todos tus productos o solo para algunos?"
        ],
        signals: [
          "Si no puede desagregar materiales, es 0.",
          "Si responde con aproximaciones muy vagas, es 1.",
          "Si calcula algunos productos o lo hace parcialmente, es 2.",
          "Si tiene costo directo por unidad y actualizado, es 3."
        ]
      },
      {
        key: "5.2",
        title: "Calcula costos de mano de obra directa",
        evaluates: "Si incorpora el tiempo de trabajo humano dentro del costo real.",
        levels: [
          { value: 0, text: "No considera la mano de obra en el costo" },
          { value: 1, text: "Reconoce que debería incluirla, pero no sabe cómo hacerlo" },
          { value: 2, text: "Incluye parte de la mano de obra, pero no toda o no con criterio consistente" },
          { value: 3, text: "Incluye el tiempo de trabajo relevante en el costo del producto o servicio" }
        ],
        questions: [
          "Para producir o atender eso que vendes, ¿cuánto tiempo de trabajo te toma realmente?",
          "¿Ese tiempo lo consideras dentro del costo o no lo estás tomando en cuenta?",
          "Si participa otra persona, ¿también lo sumas al cálculo?",
          "¿Cómo conviertes ese tiempo en un monto de dinero?"
        ],
        signals: [
          "Si cree que su tiempo no cuenta, es 0.",
          "Si entiende el concepto pero no sabe aplicarlo, es 1.",
          "Si incorpora salarios ajenos pero no el suyo o lo hace a medias, es 2.",
          "Si convierte tiempo en costo con lógica clara, es 3."
        ]
      },
      {
        key: "5.3",
        title: "Calcula costos indirectos (luz, alquiler, transporte, etc.)",
        evaluates: "Si considera los gastos que no entran de forma directa al producto, pero sí sostienen la operación.",
        levels: [
          { value: 0, text: "No incluye costos indirectos en sus cálculos" },
          { value: 1, text: "Sabe que existen, pero no sabe cómo incorporarirlos" },
          { value: 2, text: "Los reconoce a nivel negocio, pero no los distribuye bien a sus productos o servicios" },
          { value: 3, text: "Los incorpora con un criterio concreto dentro del costo total" }
        ],
        questions: [
          "Además de materiales y trabajo, ¿qué otros gastos necesitas cubrir para que el negocio funcione?",
          "¿Luz, alquiler, transporte o internet los consideras cuando calculas tu precio?",
          "¿Cómo repartes esos gastos entre lo que vendes?",
          "Si vendieras más o menos este mes, ¿eso cambiaría tu forma de distribuir esos costos?"
        ],
        signals: [
          "Si dice “eso no entra al costo”, es 0.",
          "Si reconoce el problema pero no sabe resolverlo, es 1.",
          "Si lo mira a nivel general, pero no por producto, es 2.",
          "Si tiene criterio de asignación, es 3."
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Mantenimiento de registros",
    key: "registros",
    icon: "Book",
    indicators: [
      {
        key: "6.1",
        title: "Mantiene libros de registro actualizados y comprensibles",
        evaluates: "Si registra operaciones del negocio de una manera ordenada y útil para decidir.",
        levels: [
          { value: 0, text: "No lleva registros del negocio" },
          { value: 1, text: "Lleva apuntes parciales, desordenados o difíciles de leer" },
          { value: 2, text: "Tiene registro relativamente útil, pero no lo actualiza con constancia" },
          { value: 3, text: "Mantiene registros claros, actualizados y comprensibles" }
        ],
        questions: [
          "¿Dónde anotas hoy las ventas o movimientos del negocio?",
          "¿Eso lo registras todos los días o solo cuando te das un tiempo?",
          "Si mañana alguien revisara tus apuntes, ¿entendería cómo va el negocio?",
          "¿Qué tan al día sientes que está tu registro hoy?"
        ],
        signals: [
          "Ausencia total de registro: 0.",
          "Registro caótico o incompleto: 1.",
          "Registro funcional pero irregular: 2.",
          "Registro continuo y claro: 3."
        ]
      },
      {
        key: "6.2",
        title: "Mantiene registro de cuentas de clientes",
        evaluates: "Si controla quién le debe, cuánto le debe y desde cuándo.",
        levels: [
          { value: 0, text: "No registra deudas de clientes" },
          { value: 1, text: "Registra algunas cuentas, pero de forma incompleta o informal" },
          { value: 2, text: "Lleva un control, aunque no siempre actualizado" },
          { value: 3, text: "Tiene registro claro, actualizado y recuperable de cuentas por cobrar" }
        ],
        questions: [
          "Cuando un cliente te queda debiendo, ¿cómo haces seguimiento a eso?",
          "¿Tienes una lista clara de quién te debe y cuánto?",
          "¿Cómo recuerdas las fechas o compromisos de pago?",
          "Si ahora te preguntaran cuánto tienes por cobrar, ¿podrías responderlo rápido?"
        ],
        signals: [
          "Crédito de palabra sin control: 0.",
          "Apuntes sueltos o memoria parcial: 1.",
          "Registro existente pero atrasado: 2.",
          "Control actualizado por cliente y monto: 3."
        ]
      },
      {
        key: "6.3",
        title: "Calcula ganancias y pérdidas regularmente",
        evaluates: "Si conoce el resultado real del negocio más allá del movimiento de caja.",
        levels: [
          { value: 0, text: "No calcula si gana o pierde" },
          { value: 1, text: "Lo calcula rara vez o solo cuando algo anda mal" },
          { value: 2, text: "Lo calcula con cierta frecuencia, pero de forma incompleta" },
          { value: 3, text: "Calcula ganancias y pérdidas con frecuencia definida y usando datos suficientes" }
        ],
        questions: [
          "Cuando termina una semana o un mes, ¿cómo sabes si realmente ganaste o solo moviste plata?",
          "¿Tienes alguna forma de sacar tu resultado del período?",
          "¿Cada cuánto haces ese cálculo?",
          "La última vez que lo revisaste, ¿qué descubriste?"
        ],
        signals: [
          "Si confunde vender con ganar, es 0.",
          "Si solo revisa cuando hay crisis, es 1.",
          "Si ya calcula, pero sin incluir todo, es 2.",
          "Si tiene frecuencia y criterio, es 3."
        ]
      }
    ]
  },
  {
    id: 7,
    name: "Planificación",
    key: "planificacion",
    icon: "Calendar",
    indicators: [
      {
        key: "7.1",
        title: "Proyecta ventas y costos",
        evaluates: "Si mira hacia adelante y estima lo que va a vender y gastar.",
        levels: [
          { value: 0, text: "No hace proyecciones" },
          { value: 1, text: "Tiene expectativas informales, pero no las escribe ni calcula" },
          { value: 2, text: "Hace proyecciones parciales o poco estructuradas" },
          { value: 3, text: "Proyecta ventas y costos de manera concreta para el siguiente período" }
        ],
        questions: [
          "Cuando empieza un nuevo mes o una nueva semana, ¿te haces una idea de cuánto quisieras vender?",
          "¿También calculas cuánto vas a necesitar gastar para lograrlo?",
          "¿Eso lo dejas por escrito en algún lado o lo manejas mentalmente?",
          "¿En qué te basas para proyectar: historial, temporadas, campañas, pedidos?"
        ],
        signals: [
          "Opera solo al día: 0.",
          "Proyección mental sin forma: 1.",
          "Proyección con algo de estructura, pero incompleta: 2.",
          "Proyección escrita o claramente formulada: 3."
        ]
      },
      {
        key: "7.2",
        title: "Planifica el flujo de caja",
        evaluates: "Si anticipa entradas y salidas de dinero para evitar ahogos de liquidez.",
        levels: [
          { value: 0, text: "No planifica entradas y salidas de efectivo" },
          { value: 1, text: "Entiende el concepto, pero no lo aplica en su negocio" },
          { value: 2, text: "Hace una planificación ocasional o muy básica" },
          { value: 3, text: "Proyecta y revisa regularmente el flujo de caja" }
        ],
        questions: [
          "Mirando las próximas semanas, ¿sueles anticipar cuándo entra y cuándo sale dinero?",
          "¿Alguna vez te has quedado corto de caja aun teniendo ventas?",
          "¿Tienes alguna forma de prever pagos, compras y cobros antes de que lleguen?",
          "Si te preguntaran hoy cómo viene tu caja para el próximo mes, ¿qué podrías responder?"
        ],
        signals: [
          "Si vive apagando incendios de caja, es 0.",
          "Si conoce el concepto pero no lo usa, es 1.",
          "Si lo hace ocasionalmente o de forma muy básica, es 2.",
          "Si ya proyecta entradas y salidas con rutina, es 3."
        ]
      },
      {
        key: "7.3",
        title: "Sigue y ajusta el plan de negocio regularmente",
        evaluates: "Si revisa su rumbo y corrige decisiones en función de resultados reales.",
        levels: [
          { value: 0, text: "No tiene plan o no revisa ninguno" },
          { value: 1, text: "Tiene ideas o un plan antiguo, pero no lo usa para decidir" },
          { value: 2, text: "Revisa su rumbo algunas veces, sobre todo cuando hay problemas" },
          { value: 3, text: "Revisa su plan periódicamente y hace ajustes concretos según resultados" }
        ],
        questions: [
          "¿Tienes claro qué estás buscando lograr con tu negocio en los próximos meses?",
          "¿Eso lo revisas de vez en cuando o lo dejas correr hasta que aparezca un problema?",
          "Cuando algo no sale como esperabas, ¿cómo decides qué cambiar?",
          "¿Recuerdas una decisión reciente que hayas ajustado por lo que venías observando en el negocio?"
        ],
        signals: [
          "Sin plan ni revisión: 0.",
          "Plan decorativo o idea no utilizada: 1.",
          "Revisión reactiva: 2.",
          "Revisión periódica con ajustes visibles: 3."
        ]
      }
    ]
  }
];

export const usePerformanceStore = defineStore("performance", () => {
  const activeMoment = ref(null);
  const activeArea = ref(null);
  const activeIndicatorIndex = ref(0);
  const evaluations = ref({
    inicial: { scores: {}, comments: {} },
    ciclo1: { scores: {}, comments: {} },
    ciclo2: { scores: {}, comments: {} },
    final: { scores: {}, comments: {} }
  });
  const loading = ref(false);
  const saving = ref(false);

  const authStore = useAuthStore();
  const toast = useToast();

  // Writable computed properties for direct backward-compatible binding
  const diagnosticScores = computed({
    get: () => {
      if (!activeMoment.value) return {};
      if (!evaluations.value[activeMoment.value]) {
        evaluations.value[activeMoment.value] = { scores: {}, comments: {} };
      }
      return evaluations.value[activeMoment.value].scores || {};
    },
    set: (val) => {
      if (!activeMoment.value) return;
      if (!evaluations.value[activeMoment.value]) {
        evaluations.value[activeMoment.value] = { scores: {}, comments: {} };
      }
      evaluations.value[activeMoment.value].scores = val;
    }
  });

  const diagnosticComments = computed({
    get: () => {
      if (!activeMoment.value) return {};
      if (!evaluations.value[activeMoment.value]) {
        evaluations.value[activeMoment.value] = { scores: {}, comments: {} };
      }
      return evaluations.value[activeMoment.value].comments || {};
    },
    set: (val) => {
      if (!activeMoment.value) return;
      if (!evaluations.value[activeMoment.value]) {
        evaluations.value[activeMoment.value] = { scores: {}, comments: {} };
      }
      evaluations.value[activeMoment.value].comments = val;
    }
  });

  // Getters
  const currentArea = computed(() => {
    if (activeArea.value === null) return null;
    return AREAS_CONFIG.find((a) => a.id === activeArea.value) || null;
  });

  const currentIndicator = computed(() => {
    if (!currentArea.value) return null;
    return currentArea.value.indicators[activeIndicatorIndex.value] || null;
  });

  const areaProgress = computed(() => {
    const progress = {};
    AREAS_CONFIG.forEach((area) => {
      let completedCount = 0;
      area.indicators.forEach((indicator) => {
        const score = diagnosticScores.value[indicator.key];
        if (score !== undefined && score !== null) {
          completedCount++;
        }
      });
      progress[area.id] = completedCount;
    });
    return progress;
  });

  const areaAverage = computed(() => {
    const averages = {};
    AREAS_CONFIG.forEach((area) => {
      let total = 0;
      let count = 0;
      area.indicators.forEach((indicator) => {
        const score = diagnosticScores.value[indicator.key];
        if (score !== undefined && score !== null) {
          total += score;
          count++;
        }
      });
      averages[area.id] = count > 0 ? (total / count).toFixed(1) : null;
    });
    return averages;
  });

  // Actions
  const loadScores = async (businessId) => {
    if (!businessId) return;
    loading.value = true;
    try {
      const docRef = doc(db, "businesses", businessId, "consulting", "dossier");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.evaluations) {
          evaluations.value = {
            inicial: { scores: {}, comments: {}, ...data.evaluations.inicial },
            ciclo1: { scores: {}, comments: {}, ...data.evaluations.ciclo1 },
            ciclo2: { scores: {}, comments: {}, ...data.evaluations.ciclo2 },
            final: { scores: {}, comments: {}, ...data.evaluations.final }
          };
        } else {
          evaluations.value = {
            inicial: { scores: {}, comments: {} },
            ciclo1: { scores: {}, comments: {} },
            ciclo2: { scores: {}, comments: {} },
            final: { scores: {}, comments: {} }
          };
          if (data.diagnosticScores) {
            evaluations.value.inicial.scores = data.diagnosticScores;
          }
        }
      } else {
        evaluations.value = {
          inicial: { scores: {}, comments: {} },
          ciclo1: { scores: {}, comments: {} },
          ciclo2: { scores: {}, comments: {} },
          final: { scores: {}, comments: {} }
        };
      }
    } catch (error) {
      console.error("Error al cargar puntajes de madurez:", error);
      toast.error("No se pudieron cargar los puntajes de madurez");
    } finally {
      loading.value = false;
    }
  };

  const saveScoresForArea = async (businessId) => {
    if (!businessId || !activeMoment.value) return;
    saving.value = true;
    try {
      const docRef = doc(db, "businesses", businessId, "consulting", "dossier");
      
      const payload = {
        evaluations: evaluations.value,
        updatedAt: new Date(),
        updatedBy: authStore.user?.uid || "admin",
      };

      if (activeMoment.value === "inicial") {
        payload.diagnosticScores = evaluations.value.inicial.scores;
      }

      await setDoc(docRef, payload, { merge: true });

      // Sincronizar hasConsulting en el negocio principal
      const bizRef = doc(db, "businesses", businessId);
      await setDoc(
        bizRef,
        {
          hasConsulting: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      toast.success(`Desempeño del área "${currentArea.value?.name}" guardado con éxito`);
    } catch (error) {
      console.error("Error al guardar desempeño del área:", error);
      toast.error("Error al guardar el desempeño del área");
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const setScore = (indicatorKey, value) => {
    diagnosticScores.value[indicatorKey] = value;
  };

  const setComment = (indicatorKey, value) => {
    diagnosticComments.value[indicatorKey] = value;
  };

  const resetFlow = () => {
    activeArea.value = null;
    activeIndicatorIndex.value = 0;
  };

  return {
    // State
    activeMoment,
    activeArea,
    activeIndicatorIndex,
    evaluations,
    diagnosticScores,
    diagnosticComments,
    loading,
    saving,

    // Getters
    currentArea,
    currentIndicator,
    areaProgress,
    areaAverage,

    // Actions
    loadScores,
    saveScoresForArea,
    setScore,
    setComment,
    resetFlow,
  };
});
