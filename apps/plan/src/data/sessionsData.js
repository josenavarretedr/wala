/**
 * Base de Contenidos Estáticos (Data Fixture) para EmprendeApp
 * Estructura de las 8 sesiones según docs/PRD.md y docs/schema.json
 */

export const SESSIONS_DATA = [
  {
    id: 1,
    code: 'S1',
    sessionCode: 'S1_IDENTIDAD_NEGOCIO',
    title: 'Identidad del Negocio',
    shortDesc: 'Datos del titular, nombre comercial, rubro y antecedentes.',
    icon: '🏪',
    microlearning: [
      {
        id: 'S1_M1',
        title: 'El Nombre y la Marca de tu Negocio',
        badge: 'Concepto Clave',
        content: 'Un buen nombre comercial debe ser fácil de recordar, pronunciar y relacionar con lo que vendes. No tiene que ser idéntico a tu razón social ni a tu nombre personal.',
        tip: 'Evita nombres muy largos o difíciles de deletrear en redes sociales.'
      },
      {
        id: 'S1_M2',
        title: 'Definiendo tu Rubro y Actividad',
        badge: 'Sector Comercial',
        content: 'El rubro especifica la industria general (ej. Gastronomía, Confección textil, Belleza), mientras que la actividad o subsector detalla lo que realmente preparas o comercializas (ej. Hamburguesas artesanales, Polos de algodón).',
        tip: 'Ser específico te ayudará a calcular mejor tus costos e identificar a tus competidores directos.'
      },
      {
        id: 'S1_M3',
        title: 'Ubicación y Estado de Operación',
        badge: 'Operación Real',
        content: 'Tanto si tu negocio opera desde tu hogar, en un puesto de mercado o de manera itinerante, tener clara la dirección y si está "en marcha" o es una "nueva idea" permite dimensionar el capital semilla necesario.',
        tip: 'Los comités de evaluación valoran mucho los negocios que ya demuestran meses de funcionamiento real.'
      }
    ],
    quiz: [
      {
        id: 'Q1_01',
        question: '¿El nombre comercial de tu negocio debe ser obligatoriamente igual a tu nombre completo de DNI?',
        correctOption: 'F',
        explanation: 'Falso. El nombre comercial es la marca visible hacia tus clientes y puede ser creativo y distintivo, mientras que tu nombre completo figura como titular legal o persona natural.'
      },
      {
        id: 'Q1_02',
        question: '¿Definir con precisión el subsector comercial facilita saber con exactitud qué insumos y maquinarias cotizar?',
        correctOption: 'V',
        explanation: 'Verdadero. Conocer con claridad qué producto específico vendes te permite calcular tus costos e insumos exactos sin desperdiciar presupuesto.'
      },
      {
        id: 'Q1_03',
        question: '¿Un negocio que funciona desde casa no califica para presentar un plan de negocios formal?',
        correctOption: 'F',
        explanation: 'Falso. La gran mayoría de emprendimientos nacen en el hogar o bajo modalidad virtual. Lo importante es demostrar orden, calidad y proyección de ventas.'
      }
    ],
    formFields: [
      { id: 'firstName', label: 'Nombres del Titular', type: 'text', required: true, placeholder: 'Ej: María' },
      { id: 'lastName', label: 'Apellidos del Titular', type: 'text', required: true, placeholder: 'Ej: Flores Pérez' },
      { id: 'commercialName', label: 'Nombre Comercial del Emprendimiento', type: 'text', required: true, placeholder: 'Ej: Sabor Criollo de María' },
      {
        id: 'businessNature',
        label: 'Naturaleza o Modelo Operativo Principal',
        type: 'business_nature',
        required: true,
        options: ['produccion', 'servicio', 'comercio'],
        placeholder: 'Selecciona cómo opera tu negocio'
      },
      {
        id: 'sector',
        label: 'Rubro / Sector Principal',
        type: 'select',
        required: true,
        options: [
          'Gastronomía y Alimentos',
          'Confección Textil y Calzado',
          'Comercio Minorista / Bodega',
          'Belleza y Cuidado Personal',
          'Servicios Técnicos y Reparaciones',
          'Artesanía y Manualidades',
          'Otro Rubro'
        ]
      },
      { id: 'subSector', label: 'Actividad Específica', type: 'text', required: true, placeholder: 'Ej: Comida rápida / Hamburguesas y jugos' },
      {
        id: 'operatingStatus',
        label: 'Estado Actual del Negocio',
        type: 'select',
        required: true,
        options: [
          'En marcha (ya vendo y opero)',
          'Idea de negocio (por iniciar)',
          'Reactivación de negocio previo'
        ]
      },
      { id: 'address', label: 'Dirección o Punto de Venta', type: 'text', required: true, placeholder: 'Ej: Av. México 450, Distrito' },
      {
        id: 'businessStory',
        label: 'Historia y Motivación del Negocio',
        type: 'textarea',
        required: true,
        placeholder: 'Cuéntanos brevemente cómo nació tu negocio, qué experiencia tienes y por qué decidiste emprender en este rubro.'
      }
    ]
  },
  {
    id: 2,
    code: 'S2',
    sessionCode: 'S2_PLANEAMIENTO_ESTRATEGICO',
    title: 'Planeamiento Estratégico',
    shortDesc: 'Visión a 3 años, Misión actual y Objetivos a corto plazo.',
    icon: '🎯',
    microlearning: [
      {
        id: 'S2_M1',
        title: 'Misión: ¿Qué Haces Hoy y Para Quién?',
        badge: 'El Presente',
        content: 'La misión describe la razón de existir de tu negocio en el presente: qué producto o servicio ofreces, a qué clientes atiendes y qué beneficio especial les proporcionas cada día.',
        tip: 'Responde a 3 preguntas: ¿Qué hago? ¿A quién ayudo? ¿Qué problema resuelvo hoy?'
      },
      {
        id: 'S2_M2',
        title: 'Visión: ¿Dónde Quieres Estar en 3 Años?',
        badge: 'El Futuro',
        content: 'La visión es el sueño realista de crecimiento para tu emprendimiento en un horizonte de 3 años: expandir tu local, contratar personal, comprar maquinaria o llegar a nuevos distritos.',
        tip: 'Una visión poderosa te orienta hacia dónde invertir tus utilidades y el capital semilla.'
      },
      {
        id: 'S2_M3',
        title: 'Objetivos: Metas Claras y Medibles',
        badge: 'Acción Concreta',
        content: 'Los objetivos deben ser alcanzables en el corto plazo (de 3 a 6 meses). No digas solo "vender más"; di "vender 50 platos semanales" o "adquirir una congeladora para triplicar mi stock".',
        tip: 'Si una meta tiene número y fecha, es mucho más fácil de cumplir.'
      }
    ],
    quiz: [
      {
        id: 'Q2_01',
        question: '¿La misión de un negocio describe lo que la empresa hace actualmente en el día a día para sus clientes?',
        correctOption: 'V',
        explanation: 'Verdadero. La misión se enfoca en el presente: qué producto ofreces, a quién atiendes y cuál es tu valor agregado hoy.'
      },
      {
        id: 'Q2_02',
        question: '¿La misión es el lugar donde debes describir tus sueños a 10 años, como abrir 20 sucursales?',
        correctOption: 'F',
        explanation: 'Falso. Proyectar el negocio a largo plazo corresponde a la Visión; la misión describe lo que haces hoy.'
      },
      {
        id: 'Q2_03',
        question: '¿Un buen objetivo a corto plazo debe ser concreto y medible (ej: vender 40 unidades a la semana)?',
        correctOption: 'V',
        explanation: 'Verdadero. Los objetivos medibles te permiten verificar si tu plan está funcionando y ajustar precios o ventas.'
      }
    ],
    formFields: [
      {
        id: 'mision',
        label: 'Misión del Negocio',
        type: 'textarea',
        required: true,
        placeholder: 'Describe qué preparas o vendes, a quiénes beneficias y qué hace especial a tu servicio en el día a día.'
      },
      {
        id: 'vision',
        label: 'Visión a 3 Años',
        type: 'textarea',
        required: true,
        placeholder: '¿Dónde y cómo ves a tu negocio en 3 años? (Ej: equipos nuevos, local propio, nuevos clientes).'
      },
      {
        id: 'objetivos',
        label: 'Objetivos a Corto Plazo (3 a 6 meses)',
        type: 'textarea',
        required: true,
        placeholder: 'Escribe 2 o 3 metas con números (Ej: aumentar mis ventas a 80 unidades mensuales, comprar una vitrina exhibidora).'
      }
    ]
  },
  {
    id: 3,
    code: 'S3',
    sessionCode: 'S3_CLIENTE_PROPUESTA_VALOR',
    title: 'Cliente y Propuesta de Valor',
    shortDesc: 'Segmento objetivo, necesidad a resolver y factor diferenciador.',
    icon: '👥',
    microlearning: [
      {
        id: 'S3_M1',
        title: 'Tu Cliente Ideal (Segmento de Mercado)',
        badge: '¿Quién te compra?',
        content: 'No puedes venderle "a todo el mundo". Tu cliente ideal tiene hábitos y necesidades particulares: trabajadores que almuerzan apurados, madres de familia que buscan opciones nutritivas, o jóvenes que compran por redes.',
        tip: 'Cuanto mejor conozcas la rutina de tu cliente, más fácil será convencerlo.'
      },
      {
        id: 'S3_M2',
        title: 'El Problema o Dolor que Resuelves',
        badge: 'La Necesidad',
        content: 'La gente no compra productos; compra soluciones. Compran comida rápida para ahorrar tiempo, ropa para abrigarse con estilo, o arreglos de calzado para no gastar en zapatos nuevos.',
        tip: 'Identifica claramente qué incomodidad le quitas a tu cliente.'
      },
      {
        id: 'S3_M3',
        title: 'Propuesta de Valor (Tu Toque Especial)',
        badge: 'Diferenciación',
        content: '¿Por qué te comprarían a ti en lugar de a la tienda de la esquina? Puede ser tu sabor casero, tu rapidez de entrega, tus precios justos o tu atención cálida y personalizada.',
        tip: 'Tu propuesta de valor es la promesa que nunca debes romper.'
      }
    ],
    quiz: [
      {
        id: 'Q3_01',
        question: '¿Intentar venderle "a todo el mundo" es la mejor estrategia para un pequeño negocio con presupuesto limitado?',
        correctOption: 'F',
        explanation: 'Falso. Es mejor enfocarse en un grupo específico de clientes cuyas necesidades conozcas muy bien.'
      },
      {
        id: 'Q3_02',
        question: '¿La propuesta de valor es la razón principal por la cual un cliente te elige a ti antes que a tu competencia?',
        correctOption: 'V',
        explanation: 'Verdadero. Tu propuesta de valor destaca lo que te hace único y preferido por tu clientela.'
      },
      {
        id: 'Q3_03',
        question: '¿Entender los problemas o apuros de tu cliente te permite fijar precios y promociones más efectivas?',
        correctOption: 'V',
        explanation: 'Verdadero. Al resolver un dolor real, el cliente percibe mayor valor en lo que ofreces.'
      }
    ],
    formFields: [
      {
        id: 'targetCustomer',
        label: '¿Quién es tu cliente principal?',
        type: 'textarea',
        required: true,
        placeholder: 'Describe a tus clientes habituales: edad, ocupación, zona donde viven o trabajan y con qué frecuencia te compran.'
      },
      {
        id: 'problemSolved',
        label: '¿Qué problema o necesidad le resuelves?',
        type: 'textarea',
        required: true,
        placeholder: 'Ej: Falta de tiempo para cocinar almuerzos caseros, prendas a medida con entrega rápida, etc.'
      },
      {
        id: 'valueProposition',
        label: '¿Qué hace único a tu producto o servicio frente a la competencia?',
        type: 'textarea',
        required: true,
        placeholder: 'Detalla tu ventaja: recetas tradicionales, porciones generosas, empaques ecológicos o atención personalizada.'
      }
    ]
  },
  {
    id: 4,
    code: 'S4',
    sessionCode: 'S4_ESTRATEGIA_COMERCIAL',
    title: 'Estrategia Comercial (4P)',
    shortDesc: 'Producto, Precio, Plaza (canales de venta) y Promoción.',
    icon: '📣',
    microlearning: [
      {
        id: 'S4_M1',
        title: 'Las 4P del Marketing para Emprendedores',
        badge: 'Estrategia',
        content: 'Las 4P te ayudan a organizar cómo vendes: Producto (qué ofreces con calidad), Precio (que cubra tus costos y dé ganancia), Plaza (dónde entregas) y Promoción (cómo te conocen).',
        tip: 'Una buena combinación de las 4P garantiza ventas constantes.'
      }
    ],
    quiz: [
      {
        id: 'Q4_01',
        question: '¿La "Plaza" en mercadeo se refiere únicamente a vender en una plaza física municipal?',
        correctOption: 'F',
        explanation: 'Falso. Plaza abarca todos los canales por donde llega el producto al cliente, incluyendo delivery, redes sociales y puestos de venta.'
      },
      {
        id: 'Q4_02',
        question: '¿La promoción consiste solo en bajar los precios y regalar productos?',
        correctOption: 'F',
        explanation: 'Falso. La promoción es comunicar el valor de tu negocio mediante letreros, boca a boca, estados de WhatsApp y degustaciones.'
      },
      {
        id: 'Q4_03',
        question: '¿Definir tus canales de venta te ayuda a saber cuánto gastarás en empaques o transporte?',
        correctOption: 'V',
        explanation: 'Verdadero. Vender por delivery implica costos de empaque y movilidad diferentes a vender en un puesto fijo.'
      }
    ],
    formFields: [
      { id: 'productStrategy', label: 'Estrategia de Producto y Presentación', type: 'textarea', required: true, placeholder: 'Variedades, tamaños y presentación del producto.' },
      { id: 'pricingStrategy', label: 'Estrategia de Precio y Percepción', type: 'textarea', required: true, placeholder: 'Cómo fijas tu precio y cómo lo percibe el cliente.' },
      { id: 'placementStrategy', label: 'Plaza y Canales de Distribución', type: 'textarea', required: true, placeholder: 'Canales: venta directa, pedidos por WhatsApp, ferias, etc.' },
      { id: 'promotionStrategy', label: 'Plan de Promoción y Difusión', type: 'textarea', required: true, placeholder: 'Cómo consigues clientes y das a conocer tus ofertas.' }
    ]
  },
  {
    id: 5,
    code: 'S5',
    sessionCode: 'S5_MODELO_NEGOCIO_CANVAS',
    title: 'Modelo de Negocio (Canvas)',
    shortDesc: 'Mapeo integral de los 9 bloques clave adaptado a móvil.',
    icon: '🧩',
    microlearning: [
      {
        id: 'S5_M1',
        title: 'Las 4 Grandes Áreas de tu Negocio',
        badge: 'Estructura Visual',
        content: 'El Lienzo Canvas organiza tu emprendimiento en 4 pilares fáciles de entender: tu Oferta (lo que vendes), tu Mercado (a quién y cómo llegas), tus Operaciones (cómo lo produces a diario) y tus Finanzas (costos vs. ingresos).',
        tip: 'Ver las 4 áreas juntas te ayuda a detectar si algo falta antes de invertir tu capital.'
      },
      {
        id: 'S5_M2',
        title: 'Los 9 Bloques Interconectados',
        badge: 'Visión Global',
        content: 'Cada área se desglosa en bloques prácticos: Propuesta de valor, Clientes, Canales, Relación, Actividades, Recursos, Socios, Costos e Ingresos. Ningún bloque trabaja solo; todos se apoyan entre sí.',
        tip: 'Por ejemplo, tus canales de entrega determinan si necesitas comprar una moto o contratar un servicio de delivery.'
      },
      {
        id: 'S5_M3',
        title: 'Precarga Inteligente: Menos Escritura',
        badge: 'Ahorro de Tiempo',
        content: 'Tu esfuerzo anterior rinde frutos: la Propuesta de Valor y los Clientes que definiste en la Sesión 3, así como los Canales de la Sesión 4, se cargan automáticamente en tu lienzo. Solo revísalos, ajústalos o confírmalos.',
        tip: 'Si deseas cambiar algo que escribiste antes, puedes editarlo directamente en el bloque.'
      }
    ],
    quiz: [
      {
        id: 'Q5_01',
        question: '¿Los "Socios Clave" en el Canvas pueden ser proveedores de confianza que te dan insumos a buen precio o familiares que te apoyan en el reparto?',
        correctOption: 'V',
        explanation: 'Verdadero. Proveedores confiables y aliados comunitarios o familiares son pilares indispensables para la estabilidad de tu negocio.'
      },
      {
        id: 'Q5_02',
        question: '¿El Lienzo Canvas solo sirve para grandes empresas y no para pequeños negocios independientes?',
        correctOption: 'F',
        explanation: 'Falso. El Canvas es especialmente útil para emprendedores porque condensa en una sola vista cómo funciona todo el negocio sin enredos técnicos.'
      },
      {
        id: 'Q5_03',
        question: '¿Tus actividades clave son aquellas tareas indispensables sin las cuales tu producto o servicio no se podría entregar?',
        correctOption: 'V',
        explanation: 'Verdadero. Son las acciones diarias esenciales como comprar insumos frescos, cocinar, controlar calidad y atender a la clientela.'
      }
    ],
    formFields: [
      { id: 'valueProposition', label: '1. Propuesta de Valor', type: 'textarea', required: true, placeholder: 'Qué ofreces de especial y por qué te eligen.' },
      { id: 'customerSegments', label: '2. Segmento de Clientes', type: 'textarea', required: true, placeholder: 'A quiénes ayudas y quiénes te compran.' },
      { id: 'channels', label: '3. Canales de Venta y Entrega', type: 'textarea', required: true, placeholder: 'Cómo se enteran, compran y reciben tu producto.' },
      { id: 'customerRelationships', label: '4. Relación con Clientes', type: 'textarea', required: true, placeholder: 'Cómo tratas y fidelizas a tus compradores.' },
      { id: 'keyActivities', label: '5. Actividades Clave', type: 'textarea', required: true, placeholder: 'Tareas indispensables que realizas a diario.' },
      { id: 'keyResources', label: '6. Recursos Clave', type: 'textarea', required: true, placeholder: 'Máquinas, equipos y conocimientos vitales.' },
      { id: 'keyPartners', label: '7. Socios y Aliados Clave', type: 'textarea', required: true, placeholder: 'Proveedores de confianza y aliados del barrio.' },
      { id: 'costStructure', label: '8. Estructura de Costos', type: 'textarea', required: true, placeholder: 'Principales gastos para producir y operar.' },
      { id: 'revenueStreams', label: '9. Fuentes de Ingresos', type: 'textarea', required: true, placeholder: 'Productos que vendes y formas de pago aceptadas.' }
    ]
  },
  {
    id: 6,
    code: 'S6',
    sessionCode: 'S6_COSTEO_UNITARIO_DIRECTO',
    title: 'Costeo Directo: "La Casera vs. El Plato"',
    shortDesc: 'Insumos directos, compras por volumen y consumo por tanda.',
    icon: '⚖️',
    microlearning: [
      {
        id: 'S6_M1',
        title: 'Producción: La Casera vs. El Plato',
        badge: 'Tandas y Recetas',
        content: 'En el mercado compras por paquetes o kilos (La Casera), pero para preparar tu producto usas solo una porción (El Plato). Nunca confundas el gasto total de compra con el costo real consumido por lote.',
        tip: 'La diferencia entre lo que compras y lo que usas te deja insumos en stock para futuras tandas.'
      },
      {
        id: 'S6_M2',
        title: 'Servicios: El Minutero',
        badge: 'Tiempo e Insumos',
        content: 'En servicios, tu tiempo vale dinero. Multiplica los minutos dedicados al servicio por el costo de tu tiempo (S/ 0.18/min = S/ 10.80/h). Suma los descartables de uso único y la porción que rinde cada frasco o tinte.',
        tip: 'Dividir el precio de un frasco entre las clientas que rinde te da el costo exacto por atención.'
      },
      {
        id: 'S6_M3',
        title: 'Comercio: El Mayorista',
        badge: 'Reventa y Flete',
        content: 'Al revender mercadería comprada por bulto, caja o fardo, divide el precio pagado entre las unidades contenidas para hallar el costo base. No olvides sumar el flete prorrateado y la bolsa de empaque.',
        tip: 'El flete y el empaque reducen tu ganancia si no los incluyes en tu costo directo comercial.'
      }
    ],
    quiz: [
      {
        id: 'Q6_01',
        question: '¿Si compras un paquete de 20 panes a S/ 6.00 y usas 10 en la tanda, el costo consumido de pan es S/ 3.00?',
        correctOption: 'V',
        explanation: 'Verdadero. Cada pan cuesta S/ 0.30, por lo que 10 panes usados representan S/ 3.00 de costo directo.'
      },
      {
        id: 'Q6_02',
        question: '¿El margen de ganancia bruta es la diferencia entre el precio de venta y el costo directo por unidad?',
        correctOption: 'V',
        explanation: 'Verdadero. Margen bruto = Precio de venta - Costo unitario directo.'
      },
      {
        id: 'Q6_03',
        question: '¿Los insumos sobrantes que quedan en bodega no tienen ningún valor para las siguientes tandas?',
        correctOption: 'F',
        explanation: 'Falso. Es inventario disponible que reduce los gastos de compra en tus próximas producciones.'
      }
    ],
    formFields: [
      { id: 'costingNotes', label: 'Observaciones de Costeo Directo', type: 'textarea', required: false, placeholder: 'Anotaciones sobre proveedores del mercado mayorista y precios.' }
    ]
  },
  {
    id: 7,
    code: 'S7',
    sessionCode: 'S7_INVERSION_CAPITAL_SEMILLA',
    title: 'Inversión y Capital Semilla',
    shortDesc: 'Requerimientos de compra y validación estricta del tope.',
    icon: '💰',
    microlearning: [
      {
        id: 'S7_M1',
        title: 'Presupuestando el Capital Semilla',
        badge: 'Inversión Inteligente',
        content: 'El capital semilla debe destinarse prioritariamente a activos productivos (maquinaria, herramientas) e insumos iniciales que multipliquen tus ventas, respetando siempre el monto tope aprobado.',
        tip: 'Cotiza siempre con al menos dos proveedores para conseguir el mejor rendimiento de tu presupuesto.'
      }
    ],
    quiz: [
      {
        id: 'Q7_01',
        question: '¿Puedes presupuestar un total mayor al tope de capital semilla asignado por el programa?',
        correctOption: 'F',
        explanation: 'Falso. La suma de todas las compras debe ser estrictamente menor o igual al tope presupuestal fijado.'
      },
      {
        id: 'Q7_02',
        question: '¿Comprar una máquina que duplique tu velocidad de producción es una inversión productiva prioritaria?',
        correctOption: 'V',
        explanation: 'Verdadero. La maquinaria duradera aumenta la capacidad de tu negocio y genera mayores ingresos sostenibles.'
      },
      {
        id: 'Q7_03',
        question: '¿El presupuesto debe incluir la cantidad y el precio unitario estimado de cada ítem a adquirir?',
        correctOption: 'V',
        explanation: 'Verdadero. El comité evaluador exige detalle exacto de cotización por cada bien solicitado.'
      }
    ],
    formFields: [
      { id: 'investmentRationale', label: 'Justificación del Presupuesto Solicitado', type: 'textarea', required: true, placeholder: 'Explica cómo los equipos e insumos solicitados impulsarán el crecimiento de tus ventas.' }
    ]
  },
  {
    id: 8,
    code: 'S8',
    sessionCode: 'S8_CONSOLIDACION_CIERRE',
    title: 'Consolidación y Cierre',
    shortDesc: 'Revisión final, resumen ejecutivo y carpeta para comité.',
    icon: '🏆',
    microlearning: [
      {
        id: 'S8_M1',
        title: 'Cierre del Plan de Negocios',
        badge: 'Meta Cumplida',
        content: 'Has completado los 8 módulos. Tu plan de negocios consolidado contiene tu historia, estrategia, análisis de clientes, costeo unitario y presupuesto de inversión listo para ser presentado al comité de capital semilla.',
        tip: 'Revisa cada módulo con tu facilitador antes de generar el documento final.'
      }
    ],
    quiz: [
      {
        id: 'Q8_01',
        question: '¿El plan de negocios final servirá para que el comité evaluador determine la asignación del capital semilla?',
        correctOption: 'V',
        explanation: 'Verdadero. Es el documento formal que respalda tu postulación y demuestra la viabilidad de tu emprendimiento.'
      },
      {
        id: 'Q8_02',
        question: '¿Puedes modificar las respuestas guardadas antes de la aprobación final del consultor?',
        correctOption: 'V',
        explanation: 'Verdadero. Siempre puedes repasar y afinar tus respuestas para asegurar la máxima calidad de tu expediente.'
      },
      {
        id: 'Q8_03',
        question: '¿Completar los 8 módulos te brinda una guía clara para gestionar tu negocio de forma ordenada en el futuro?',
        correctOption: 'V',
        explanation: 'Verdadero. El aprendizaje y los cálculos estructurados te servirán durante toda la vida de tu negocio.'
      }
    ],
    formFields: [
      { id: 'finalCommitment', label: 'Compromiso del Emprendedor', type: 'textarea', required: true, placeholder: 'Escribe tu compromiso personal para sacar adelante tu negocio con el capital semilla otorgado.' }
    ]
  }
];

export const SESSION_6_NATURE_CONFIG = {
  produccion: {
    title: 'Costeo Directo: "La Casera vs. El Plato"',
    shortDesc: 'Insumos directos, compras por volumen y consumo por tanda.'
  },
  servicio: {
    title: 'Costeo de Servicios: "El Minutero"',
    shortDesc: 'Valor de tu tiempo por minuto, descartables y frascos rendidores.'
  },
  comercio: {
    title: 'Costeo Comercial: "El Mayorista"',
    shortDesc: 'Compra al por mayor en bultos, flete prorrateado y empaque.'
  }
};

/**
 * Retorna el título dinámico de una sesión, adaptando la Sesión 6 a la naturaleza del negocio.
 * @param {Object|number} session - Objeto de sesión o número de sesión
 * @param {string} [businessNature='produccion'] - Naturaleza del negocio ('produccion', 'servicio', 'comercio')
 * @returns {string} Título adaptado
 */
export function getSessionTitle(session, businessNature = 'produccion') {
  if (!session) return '';
  const sessionId = typeof session === 'object' ? session.id : Number(session);
  if (sessionId === 6) {
    const config = SESSION_6_NATURE_CONFIG[businessNature] || SESSION_6_NATURE_CONFIG.produccion;
    return config.title;
  }
  return typeof session === 'object' ? (session.title || '') : '';
}

/**
 * Retorna la descripción corta dinámica de una sesión, adaptando la Sesión 6 a la naturaleza del negocio.
 * @param {Object|number} session - Objeto de sesión o número de sesión
 * @param {string} [businessNature='produccion'] - Naturaleza del negocio ('produccion', 'servicio', 'comercio')
 * @returns {string} Descripción corta adaptada
 */
export function getSessionShortDesc(session, businessNature = 'produccion') {
  if (!session) return '';
  const sessionId = typeof session === 'object' ? session.id : Number(session);
  if (sessionId === 6) {
    const config = SESSION_6_NATURE_CONFIG[businessNature] || SESSION_6_NATURE_CONFIG.produccion;
    return config.shortDesc;
  }
  return typeof session === 'object' ? (session.shortDesc || '') : '';
}
