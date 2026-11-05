import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  PageOrientation,
  HeadingLevel,
  BorderStyle,
  ShadingType
} from 'docx';

/**
 * Paleta Institucional y Constantes de Estilo
 */
const COLORS = {
  PRIMARY: '1E3A8A', // Azul corporativo institucional
  SECONDARY: '0284C7', // Azul cian complementario
  DARK_TEXT: '0F172A', // Texto oscuro slate-900
  MUTED_TEXT: '475569', // Texto secundario slate-600
  LIGHT_BG: 'F8FAFC', // Fondo gris tenue slate-50
  HEADER_BG: 'F1F5F9', // Fondo de encabezados slate-100
  BORDER_COLOR: 'CBD5E1', // Borde slate-300
  SUCCESS: '15803D', // Verde institucional
  WARNING: 'B45309' // Ámbar advertencia
};

const FONT_FAMILY = 'Calibri';

// Márgenes de 2.5 cm en twips (1 cm = 567 twips)
const MARGIN_2_5_CM = 1418;

/**
 * Sanitiza texto para evitar caracteres de control inválidos en el XML de Word
 */
function cleanXmlString(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Resuelve el texto cualitativo bajo la regla estricta de fallback:
 * finalApprovedText || aiRefinement || rawInput || "[Texto pendiente de formulación]"
 *
 * @param {Object|string} field - Objeto de campo cualitativo o cadena de texto
 * @returns {string} Texto final resuelto
 */
export function resolveFieldText(field) {
  if (!field) return '[Texto pendiente de formulación]';
  if (typeof field === 'string') {
    const cleaned = cleanXmlString(field);
    return cleaned || '[Texto pendiente de formulación]';
  }

  // 1. Aprobado formal por el consultor
  const approved = field.consultantReview?.finalApprovedText || field.finalApprovedText;
  if (approved && typeof approved === 'string' && cleanXmlString(approved)) {
    return cleanXmlString(approved);
  }

  // 2. Propuesta refinada por la IA
  const ai = field.aiRefinement?.refinedText || (typeof field.aiRefinement === 'string' ? field.aiRefinement : null);
  if (ai && typeof ai === 'string' && cleanXmlString(ai)) {
    return cleanXmlString(ai);
  }

  // 3. Texto crudo original ingresado por el emprendedor
  const raw = field.rawInput?.text || (typeof field.rawInput === 'string' ? field.rawInput : null);
  if (raw && typeof raw === 'string' && cleanXmlString(raw)) {
    return cleanXmlString(raw);
  }

  return '[Texto pendiente de formulación]';
}

/**
 * Formatea valores numéricos como moneda en Soles (PEN)
 */
function formatMoney(amount) {
  const num = Number(amount || 0);
  return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Crea un párrafo estándar con tipografía y espaciado consistente
 */
function createParagraph(text, options = {}) {
  const {
    bold = false,
    size = 22, // 11pt
    color = COLORS.DARK_TEXT,
    align = AlignmentType.LEFT,
    spaceBefore = 80,
    spaceAfter = 80,
    italic = false
  } = options;

  return new Paragraph({
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter, line: 276 },
    children: [
      new TextRun({
        text: cleanXmlString(text),
        font: FONT_FAMILY,
        bold,
        italic,
        size,
        color
      })
    ]
  });
}

/**
 * Crea un encabezado de Sección de Nivel 1 (H1) con estilo institucional
 */
function createSectionH1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text: cleanXmlString(title),
        font: FONT_FAMILY,
        bold: true,
        size: 28, // 14pt
        color: COLORS.PRIMARY
      })
    ]
  });
}

/**
 * Crea un encabezado de Sección de Nivel 2 (H2)
 */
function createSectionH2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: cleanXmlString(title),
        font: FONT_FAMILY,
        bold: true,
        size: 24, // 12pt
        color: COLORS.DARK_TEXT
      })
    ]
  });
}

/**
 * Bordes de celda sutiles
 */
const DEFAULT_CELL_BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR }
};

/**
 * Crea una celda de tabla formateada
 */
function createCell(content, options = {}) {
  const {
    bold = false,
    header = false,
    shadingColor = header ? COLORS.HEADER_BG : null,
    widthPercent = null,
    colSpan = 1,
    rowSpan = 1,
    align = AlignmentType.LEFT,
    size = 20, // 10pt
    textColor = header ? COLORS.PRIMARY : COLORS.DARK_TEXT
  } = options;

  const children = Array.isArray(content)
    ? content
    : [
      new Paragraph({
        alignment: align,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: cleanXmlString(content),
            font: FONT_FAMILY,
            bold: bold || header,
            size,
            color: textColor
          })
        ]
      })
    ];

  const cellConfig = {
    children,
    borders: DEFAULT_CELL_BORDERS,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    columnSpan: colSpan,
    rowSpan
  };

  if (shadingColor) {
    cellConfig.shading = {
      fill: shadingColor,
      type: ShadingType.CLEAR
    };
  }

  if (widthPercent) {
    cellConfig.width = { size: widthPercent, type: WidthType.PERCENTAGE };
  }

  return new TableCell(cellConfig);
}

/**
 * Construye el objeto declarativo del documento Word (.docx)
 *
 * @param {Object} participantData - Metadatos del participante y negocio
 * @param {Object} costingData - Datos de costeo S6 e inversión S7
 * @param {Object} planSections - Secciones cualitativas S1 a S8
 * @returns {Document} Documento docx listo para empacar
 */
export function buildBusinessPlanDocxDocument(participantData = {}, costingData = {}, planSections = {}) {
  const personal = participantData.personalInfo || {};
  const business = participantData.businessBasicInfo || {};
  const cohortId = participantData.cohortId || 'COHORTE-ACTIVA';
  const fullName = `${personal.firstName || ''} ${personal.lastName || ''}`.trim() || 'Emprendedor(a)';
  const commercialName = business.commercialName || 'Emprendimiento Sin Nombre';
  const dni = participantData.dni || 'Sin DNI';
  const currentDateStr = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Acceso a secciones por clave o por número de sesión
  const bySession = planSections.bySession || {};
  const s1 = planSections['s1_identidad_negocio'] || bySession[1] || {};
  const s2 = planSections['s2_planeamiento_estrategico'] || bySession[2] || {};
  const s3 = planSections['s3_cliente_propuesta_valor'] || bySession[3] || {};
  const s4 = planSections['s4_estrategia_comercial'] || bySession[4] || {};
  const s5 = planSections['s5_modelo_negocio_canvas'] || bySession[5] || {};
  const s6 = planSections['s6_costeo_directo_recetas'] || bySession[6] || {};
  const s7 = planSections['s7_presupuesto_capital_semilla'] || bySession[7] || {};
  const s8 = planSections['s8_evaluacion_integral_cierre'] || bySession[8] || {};

  const s1Fields = s1.fields || {};
  const s2Fields = s2.fields || {};
  const s3Fields = s3.fields || {};
  const s4Fields = s4.fields || {};
  const s5Fields = s5.fields || {};
  const s6Fields = s6.fields || {};
  const s7Fields = s7.fields || {};
  const s8Fields = s8.fields || {};

  // =========================================================================
  // 1. SECCIÓN PRINCIPAL (VERTICAL / A4 PORTRAIT)
  // =========================================================================
  const portraitChildren = [];

  // --- CABECERA INSTITUCIONAL ---
  portraitChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 60 },
      children: [
        new TextRun({
          text: `PROGRAMA DE MEDIOS DE VIDA & CAPITAL SEMILLA — COHORTE ${cleanXmlString(cohortId).toUpperCase()}`,
          font: FONT_FAMILY,
          bold: true,
          size: 20,
          color: COLORS.MUTED_TEXT
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 180 },
      children: [
        new TextRun({
          text: 'PLAN DE NEGOCIOS Y SOLICITUD DE CAPITAL SEMILLA',
          font: FONT_FAMILY,
          bold: true,
          size: 36, // 18pt
          color: COLORS.PRIMARY
        })
      ]
    })
  );

  // Tabla Ficha Técnica de Portada
  portraitChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell('Nombre del Emprendimiento:', { bold: true, widthPercent: 30, shadingColor: COLORS.HEADER_BG }),
            createCell(commercialName, { widthPercent: 70, bold: true })
          ]
        }),
        new TableRow({
          children: [
            createCell('Emprendedor(a) Titular:', { bold: true, widthPercent: 30, shadingColor: COLORS.HEADER_BG }),
            createCell(fullName, { widthPercent: 70 })
          ]
        }),
        new TableRow({
          children: [
            createCell('DNI / Cédula de Identidad:', { bold: true, widthPercent: 30, shadingColor: COLORS.HEADER_BG }),
            createCell(dni, { widthPercent: 70 })
          ]
        }),
        new TableRow({
          children: [
            createCell('Cohorte / Grupo:', { bold: true, widthPercent: 30, shadingColor: COLORS.HEADER_BG }),
            createCell(cohortId, { widthPercent: 70 })
          ]
        }),
        new TableRow({
          children: [
            createCell('Fecha de Emisión Oficial:', { bold: true, widthPercent: 30, shadingColor: COLORS.HEADER_BG }),
            createCell(currentDateStr, { widthPercent: 70 })
          ]
        })
      ]
    }),
    createParagraph('', { spaceAfter: 180 })
  );

  // --- SECCIÓN 1: INFORMACIÓN GENERAL E IDENTIDAD DEL NEGOCIO ---
  portraitChildren.push(
    createSectionH1('1. Información General e Identidad del Negocio'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell('Rubro / Sector:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(business.sector || 'Gastronomía y Alimentos', { widthPercent: 25 }),
            createCell('Naturaleza Operativa:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(capitalize(business.businessNature || 'produccion'), { widthPercent: 25, bold: true })
          ]
        }),
        new TableRow({
          children: [
            createCell('Actividad Específica:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(business.subSector || 'No especificada', { widthPercent: 25 }),
            createCell('Estado de Operación:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(business.operatingStatus || 'En marcha', { widthPercent: 25 })
          ]
        }),
        new TableRow({
          children: [
            createCell('Ubicación / Dirección:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(personal.address || personal.location?.address || 'Punto de venta local', { widthPercent: 25 }),
            createCell('Teléfono de Contacto:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(personal.phone || 'No registrado', { widthPercent: 25 })
          ]
        })
      ]
    }),
    createParagraph('', { spaceAfter: 80 }),
    createSectionH2('Historia y Motivación del Emprendimiento:'),
    createParagraph(resolveFieldText(s1Fields.businessStory), { italic: true }),
    createParagraph('', { spaceAfter: 140 })
  );

  // --- SECCIÓN 2: PLANEAMIENTO ESTRATÉGICO ---
  portraitChildren.push(
    createSectionH1('2. Planeamiento Estratégico'),
    createSectionH2('2.1. Misión del Negocio (Propósito Actual)'),
    createParagraph(resolveFieldText(s2Fields.mision)),
    createSectionH2('2.2. Visión a 3 Años (Horizonte de Crecimiento)'),
    createParagraph(resolveFieldText(s2Fields.vision)),
    createSectionH2('2.3. Objetivos a Corto Plazo (3 a 6 meses)'),
    createParagraph(resolveFieldText(s2Fields.objetivos)),
    createParagraph('', { spaceAfter: 140 })
  );

  // --- SECCIÓN 3: DESCRIPCIÓN DEL MODELO DE NEGOCIO ---
  const narrativeModelText = s3Fields.valueProposition
    ? `El modelo de negocio de ${commercialName} se basa en ofrecer ${resolveFieldText(s3Fields.valueProposition).toLowerCase()}, articulando canales directos de distribución y atención personalizada para garantizar sostenibilidad y rentabilidad.`
    : resolveFieldText(s5Fields.valueProposition);

  portraitChildren.push(
    createSectionH1('3. Descripción del Modelo de Negocio'),
    createParagraph(narrativeModelText),
    createParagraph('', { spaceAfter: 140 })
  );

  // --- SECCIÓN 4: ANÁLISIS DE MERCADO Y PROPUESTA DE VALOR ---
  portraitChildren.push(
    createSectionH1('4. Análisis de Mercado y Propuesta de Valor'),
    createSectionH2('4.1. Segmento de Clientes Objetivo'),
    createParagraph(resolveFieldText(s3Fields.targetCustomer)),
    createSectionH2('4.2. Necesidad o Problema Atendido'),
    createParagraph(resolveFieldText(s3Fields.problemSolved)),
    createSectionH2('4.3. Propuesta de Valor y Ventajas Diferenciales'),
    createParagraph(resolveFieldText(s3Fields.valueProposition)),
    createParagraph('', { spaceAfter: 140 })
  );

  // --- SECCIÓN 5: ESTRATEGIA COMERCIAL (LAS 4P) ---
  portraitChildren.push(
    createSectionH1('5. Estrategia Comercial (Las 4P)'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell('Eje Estratégico', { header: true, widthPercent: 25 }),
            createCell('Detalle y Acciones Concretas', { header: true, widthPercent: 75 })
          ]
        }),
        new TableRow({
          children: [
            createCell('Producto / Servicio', { bold: true, widthPercent: 25 }),
            createCell(resolveFieldText(s4Fields.productStrategy), { widthPercent: 75 })
          ]
        }),
        new TableRow({
          children: [
            createCell('Precio y Percepción', { bold: true, widthPercent: 25 }),
            createCell(resolveFieldText(s4Fields.pricingStrategy), { widthPercent: 75 })
          ]
        }),
        new TableRow({
          children: [
            createCell('Plaza (Canales de Venta)', { bold: true, widthPercent: 25 }),
            createCell(resolveFieldText(s4Fields.placementStrategy), { widthPercent: 75 })
          ]
        }),
        new TableRow({
          children: [
            createCell('Promoción y Difusión', { bold: true, widthPercent: 25 }),
            createCell(resolveFieldText(s4Fields.promotionStrategy), { widthPercent: 75 })
          ]
        })
      ]
    }),
    createParagraph('', { spaceAfter: 160 })
  );

  // --- SECCIÓN 6: ANÁLISIS FINANCIERO Y FICHA DE COSTEO ---
  const products = Array.isArray(costingData.products) ? costingData.products : [];
  const costingRows = [
    new TableRow({
      children: [
        createCell('Producto / Servicio', { header: true, widthPercent: 28 }),
        createCell('Modalidad', { header: true, widthPercent: 18, align: AlignmentType.CENTER }),
        createCell('Costo Unit.', { header: true, widthPercent: 14, align: AlignmentType.RIGHT }),
        createCell('Precio Venta', { header: true, widthPercent: 14, align: AlignmentType.RIGHT }),
        createCell('Ganancia', { header: true, widthPercent: 13, align: AlignmentType.RIGHT }),
        createCell('Margen %', { header: true, widthPercent: 13, align: AlignmentType.RIGHT })
      ]
    })
  ];

  if (products.length === 0) {
    costingRows.push(
      new TableRow({
        children: [
          createCell('No se registraron productos en la Sesión 6.', { colSpan: 6, italic: true })
        ]
      })
    );
  } else {
    for (const p of products) {
      const summary = p.financialSummary || {};
      const directCost = summary.directCostPerUnit || 0;
      const salePrice = p.commercialization?.currentSalePrice || p.salePrice || 0;
      const profit = summary.grossProfitPerUnit || Math.max(0, salePrice - directCost);
      const margin = summary.grossMarginPercentage || (salePrice > 0 ? (profit / salePrice) * 100 : 0);

      costingRows.push(
        new TableRow({
          children: [
            createCell(p.productName || 'Producto', { bold: true, widthPercent: 28 }),
            createCell(capitalize(p.businessNature || business.businessNature || 'produccion'), {
              widthPercent: 18,
              align: AlignmentType.CENTER
            }),
            createCell(formatMoney(directCost), { widthPercent: 14, align: AlignmentType.RIGHT }),
            createCell(formatMoney(salePrice), { widthPercent: 14, align: AlignmentType.RIGHT, bold: true }),
            createCell(formatMoney(profit), { widthPercent: 13, align: AlignmentType.RIGHT }),
            createCell(`${Number(margin).toFixed(1)}%`, {
              widthPercent: 13,
              align: AlignmentType.RIGHT,
              bold: true,
              textColor: margin >= 30 ? COLORS.SUCCESS : COLORS.DARK_TEXT
            })
          ]
        })
      );
    }
  }

  portraitChildren.push(
    createSectionH1('6. Análisis Financiero y Ficha de Costeo Directo'),
    createSectionH2('6.1. Resumen Consolidado de Márgenes y Precios de Venta'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: costingRows
    }),
    createParagraph('', { spaceAfter: 120 }),
    createSectionH2('6.2. Fichas Técnicas de Costeo Directo por Producto / Servicio')
  );

  if (products.length === 0) {
    portraitChildren.push(
      createParagraph('No se registraron productos detallados en la Sesión 6.', { italic: true, spaceAfter: 120 })
    );
  } else {
    for (const [pIdx, p] of products.entries()) {
      const pNature = p.businessNature || business.businessNature || 'produccion';
      const summary = p.financialSummary || {};
      const directCost = summary.directCostPerUnit || 0;
      const salePrice = p.commercialization?.currentSalePrice || p.salePrice || 0;
      const profit = summary.grossProfitPerUnit || Math.max(0, salePrice - directCost);
      const margin = summary.grossMarginPercentage || (salePrice > 0 ? (profit / salePrice) * 100 : 0);

      // CASO A: PRODUCCIÓN ("La Casera vs. El Plato")
      if (pNature === 'produccion') {
        const batchConfig = p.batchConfig || {};
        const batchSize = Number(batchConfig.batchSize || 1);
        const batchUnit = batchConfig.batchUnit || 'unidades';
        const frequency = batchConfig.productionFrequency || 'semanal';
        const batchesPerMonth = Number(batchConfig.batchesPerMonth || 4);
        const ingredients = Array.isArray(p.ingredients) ? p.ingredients : [];

        portraitChildren.push(
          createParagraph(
            `Ficha Técnica ${pIdx + 1}: ${p.productName || 'Producto'} — Modalidad Producción ("La Casera vs. El Plato")`,
            { bold: true, color: COLORS.PRIMARY, spaceBefore: 60, spaceAfter: 30 }
          ),
          createParagraph(
            `Parámetros de Tanda: ${batchSize} ${batchUnit} por lote | Frecuencia: ${capitalize(frequency)} (${batchesPerMonth} tandas/mes) | Costo Directo Total de Tanda: ${formatMoney(summary.totalBatchDirectCost || 0)}`,
            { italic: true, spaceAfter: 50 }
          )
        );

        const ingTableRows = [
          new TableRow({
            children: [
              createCell('Insumo / Ingrediente', { header: true, widthPercent: 24 }),
              createCell('Compra Comercial ("La Casera")', { header: true, widthPercent: 26 }),
              createCell('Consumo Tanda ("El Plato")', { header: true, widthPercent: 18 }),
              createCell('Costo Tanda', { header: true, widthPercent: 11, align: AlignmentType.RIGHT }),
              createCell('Costo/Porción', { header: true, widthPercent: 10, align: AlignmentType.RIGHT }),
              createCell('Remanente', { header: true, widthPercent: 11, align: AlignmentType.RIGHT })
            ]
          })
        ];

        if (ingredients.length === 0) {
          ingTableRows.push(
            new TableRow({
              children: [
                createCell('No se detallaron insumos para esta receta.', { colSpan: 6, italic: true })
              ]
            })
          );
        } else {
          for (const ing of ingredients) {
            const mkt = ing.marketPurchase || {};
            const rec = ing.recipeConsumption || {};
            const math = ing.automatedMath || {};

            const mktDesc = `${mkt.packageUnitName || 'paquete'} (${mkt.quantityInPackage || 1} ${rec.unit || 'u.'}) a ${formatMoney(mkt.packageCost || 0)}`;
            const recDesc = `${rec.quantityUsed || 0} ${rec.unit || 'u.'}`;

            ingTableRows.push(
              new TableRow({
                children: [
                  createCell(ing.name || 'Insumo', { bold: true, widthPercent: 24 }),
                  createCell(mktDesc, { widthPercent: 26, size: 18 }),
                  createCell(recDesc, { widthPercent: 18, size: 18 }),
                  createCell(formatMoney(math.costIncurredInBatch || 0), { widthPercent: 11, align: AlignmentType.RIGHT }),
                  createCell(formatMoney(math.unitCostPerProduct || 0), { widthPercent: 10, align: AlignmentType.RIGHT }),
                  createCell(`${math.leftoverQuantityInStock ?? 0} ${rec.unit || 'u.'}`, { widthPercent: 11, align: AlignmentType.RIGHT, size: 18 })
                ]
              })
            );
          }

          // Fila Subtotal Tanda
          ingTableRows.push(
            new TableRow({
              children: [
                createCell('COSTO DIRECTO TOTAL DE LA TANDA', { colSpan: 3, bold: true, shadingColor: COLORS.HEADER_BG }),
                createCell(formatMoney(summary.totalBatchDirectCost || 0), { bold: true, align: AlignmentType.RIGHT, shadingColor: COLORS.HEADER_BG }),
                createCell(formatMoney(directCost), { bold: true, align: AlignmentType.RIGHT, shadingColor: COLORS.HEADER_BG }),
                createCell('-', { align: AlignmentType.CENTER, shadingColor: COLORS.HEADER_BG })
              ]
            })
          );
        }

        portraitChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: ingTableRows
          }),
          createParagraph(
            `Rentabilidad Unitaria: Costo Unitario ${formatMoney(directCost)} | Precio Venta ${formatMoney(salePrice)} | Ganancia ${formatMoney(profit)} | Margen Bruto ${Number(margin).toFixed(1)}%`,
            { bold: true, spaceBefore: 30, spaceAfter: 100 }
          )
        );
      }

      // CASO B: SERVICIOS ("El Minutero")
      else if (pNature === 'servicio') {
        const sConf = p.serviceConfig || {};
        const labor = costingData.serviceLaborSettings || {};
        const costPerMin = Number(sConf.costPerMinute || labor.costPerMinute || 0.10);
        const duration = Number(sConf.durationMinutes || 30);
        const timeCost = Number(summary.timeCost || (duration * costPerMin));
        const supplies = Array.isArray(sConf.supplies) ? sConf.supplies : [];

        portraitChildren.push(
          createParagraph(
            `Ficha Técnica ${pIdx + 1}: ${p.productName || 'Servicio'} — Modalidad Servicios ("El Minutero")`,
            { bold: true, color: COLORS.PRIMARY, spaceBefore: 60, spaceAfter: 30 }
          ),
          createParagraph(
            `Estructura Operativa: Duración ${duration} min | Costo por Minuto: ${formatMoney(costPerMin)}/min | Costo Tiempo Mano de Obra: ${formatMoney(timeCost)}`,
            { italic: true, spaceAfter: 50 }
          )
        );

        const servTableRows = [
          new TableRow({
            children: [
              createCell('Suministro / Insumo', { header: true, widthPercent: 32 }),
              createCell('Tipo / Presentación Comercial', { header: true, widthPercent: 28 }),
              createCell('Rendimiento por Empaque', { header: true, widthPercent: 22 }),
              createCell('Costo por Servicio', { header: true, widthPercent: 18, align: AlignmentType.RIGHT })
            ]
          })
        ];

        if (supplies.length === 0) {
          servTableRows.push(
            new TableRow({
              children: [
                createCell('No se registraron suministros adicionales para este servicio.', { colSpan: 4, italic: true })
              ]
            })
          );
        } else {
          for (const sup of supplies) {
            const isBottle = sup.supplyType === 'bottle_yield';
            const typeLabel = isBottle ? 'Frasco Rendidor' : 'Descartable';
            const presDesc = `${typeLabel} (${formatMoney(sup.packageCost || 0)})`;
            const yieldDesc = isBottle ? `Rinde ${sup.clientsYield || 1} clientes` : `${sup.unitsInPackage || 1} un./paquete`;

            servTableRows.push(
              new TableRow({
                children: [
                  createCell(sup.name || 'Suministro', { bold: true, widthPercent: 32 }),
                  createCell(presDesc, { widthPercent: 28, size: 18 }),
                  createCell(yieldDesc, { widthPercent: 22, size: 18 }),
                  createCell(formatMoney(sup.unitCost || 0), { widthPercent: 18, align: AlignmentType.RIGHT })
                ]
              })
            );
          }
        }

        servTableRows.push(
          new TableRow({
            children: [
              createCell('COSTO DE TIEMPO (MANO DE OBRA)', { colSpan: 3, bold: true }),
              createCell(formatMoney(timeCost), { bold: true, align: AlignmentType.RIGHT })
            ]
          }),
          new TableRow({
            children: [
              createCell('COSTO DIRECTO TOTAL POR SERVICIO', { colSpan: 3, bold: true, shadingColor: COLORS.HEADER_BG }),
              createCell(formatMoney(directCost), { bold: true, align: AlignmentType.RIGHT, shadingColor: COLORS.HEADER_BG })
            ]
          })
        );

        portraitChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: servTableRows
          }),
          createParagraph(
            `Rentabilidad Unitaria: Costo Unitario ${formatMoney(directCost)} | Precio Servicio ${formatMoney(salePrice)} | Ganancia ${formatMoney(profit)} | Margen Bruto ${Number(margin).toFixed(1)}%`,
            { bold: true, spaceBefore: 30, spaceAfter: 100 }
          )
        );
      }

      // CASO C: COMERCIO ("El Mayorista")
      else {
        const cConf = p.commerceConfig || {};
        const pres = cConf.purchasePresentation || 'Bulto';
        const unitsPerPkg = Number(cConf.unitsPerPackage || 1);
        const pkgPrice = Number(cConf.packagePurchasePrice || 0);
        const freightExpense = Number(cConf.freightExpense || 0);
        const totalItemsTrip = Number(cConf.totalItemsInTrip || 1);
        const pkgCostUnit = Number(cConf.packagingCostPerUnit || 0);

        const baseUnit = summary.baseUnitCost || (unitsPerPkg > 0 ? pkgPrice / unitsPerPkg : 0);
        const freightUnit = summary.unitFreightCost || (totalItemsTrip > 0 ? freightExpense / totalItemsTrip : 0);

        portraitChildren.push(
          createParagraph(
            `Ficha Técnica ${pIdx + 1}: ${p.productName || 'Artículo'} — Modalidad Comercio ("El Mayorista")`,
            { bold: true, color: COLORS.PRIMARY, spaceBefore: 60, spaceAfter: 30 }
          ),
          createParagraph(
            `Compra Mayorista: ${pres} de ${unitsPerPkg} unidades a ${formatMoney(pkgPrice)} | Costo Base: ${formatMoney(baseUnit)}/u.`,
            { italic: true, spaceAfter: 50 }
          )
        );

        const commTableRows = [
          new TableRow({
            children: [
              createCell('Componente de Costo Comercial', { header: true, widthPercent: 50 }),
              createCell('Detalle / Prorrateo', { header: true, widthPercent: 30 }),
              createCell('Costo Unitario', { header: true, widthPercent: 20, align: AlignmentType.RIGHT })
            ]
          }),
          new TableRow({
            children: [
              createCell('Entrada A: Costo Base Mayorista', { bold: true, widthPercent: 50 }),
              createCell(`${formatMoney(pkgPrice)} ÷ ${unitsPerPkg} unidades`, { widthPercent: 30, size: 18 }),
              createCell(formatMoney(baseUnit), { widthPercent: 20, align: AlignmentType.RIGHT })
            ]
          }),
          new TableRow({
            children: [
              createCell('Entrada B: Flete Comercial Prorrateado', { bold: true, widthPercent: 50 }),
              createCell(`Viaje ${formatMoney(freightExpense)} ÷ ${totalItemsTrip} artículos`, { widthPercent: 30, size: 18 }),
              createCell(formatMoney(freightUnit), { widthPercent: 20, align: AlignmentType.RIGHT })
            ]
          }),
          new TableRow({
            children: [
              createCell('Entrada C: Empaque y Entrega al Cliente', { bold: true, widthPercent: 50 }),
              createCell('Bolsa / Envoltura unitaria', { widthPercent: 30, size: 18 }),
              createCell(formatMoney(pkgCostUnit), { widthPercent: 20, align: AlignmentType.RIGHT })
            ]
          }),
          new TableRow({
            children: [
              createCell('COSTO DIRECTO COMERCIAL TOTAL', { colSpan: 2, bold: true, shadingColor: COLORS.HEADER_BG }),
              createCell(formatMoney(directCost), { bold: true, align: AlignmentType.RIGHT, shadingColor: COLORS.HEADER_BG })
            ]
          })
        ];

        portraitChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: commTableRows
          }),
          createParagraph(
            `Rentabilidad Comercial: Costo Comercial ${formatMoney(directCost)} | Precio Venta ${formatMoney(salePrice)} | Ganancia ${formatMoney(profit)} | Margen Bruto ${Number(margin).toFixed(1)}%`,
            { bold: true, spaceBefore: 30, spaceAfter: 100 }
          )
        );
      }
    }
  }

  if (s6Fields.costingNotes) {
    portraitChildren.push(
      createParagraph('', { spaceBefore: 40 }),
      createParagraph(`Observaciones de Costeo: ${resolveFieldText(s6Fields.costingNotes)}`, { italic: true })
    );
  }
  portraitChildren.push(createParagraph('', { spaceAfter: 160 }));

  // --- SECCIÓN 7: PLAN DE PRODUCCIÓN, INVERSIÓN Y CAPITAL SEMILLA ---
  const seedPlan = costingData.seedCapitalInvestmentPlan || {};
  const allItems = Array.isArray(seedPlan.investmentItems) ? seedPlan.investmentItems : [];
  const ceiling = Number(seedPlan.seedCapitalCeiling || 3000);

  // Clasificar en los 3 Rubros oficiales
  const rubroA = allItems.filter(
    (i) => i.rubro === 'rubro_a' || (!i.rubro && (i.category === 'Maquinaria y Equipo' || i.category === 'Herramientas'))
  );
  const rubroB = allItems.filter(
    (i) => i.rubro === 'rubro_b' || (i.isAutoDerivedFromS6 && !i.isLaborContribution) || (!i.rubro && i.category === 'Insumos y Capital de Trabajo')
  );
  const rubroC = allItems.filter(
    (i) => i.rubro === 'rubro_c' || i.isLaborContribution || (!i.rubro && (i.category === 'Acondicionamiento y Otros' || i.category === 'Mano de Obra Propia'))
  );

  let totalInvestment = 0;
  let totalSeedCapital = 0;
  let totalOwn = 0;

  const investmentRows = [
    new TableRow({
      children: [
        createCell('Ítem / Descripción', { header: true, widthPercent: 32 }),
        createCell('Rubro / Tipo', { header: true, widthPercent: 15 }),
        createCell('Cant.', { header: true, widthPercent: 8, align: AlignmentType.CENTER }),
        createCell('P. Unitario', { header: true, widthPercent: 11, align: AlignmentType.RIGHT }),
        createCell('Total', { header: true, widthPercent: 11, align: AlignmentType.RIGHT }),
        createCell('Capital Semilla', { header: true, widthPercent: 11, align: AlignmentType.RIGHT }),
        createCell('Aporte Propio', { header: true, widthPercent: 12, align: AlignmentType.RIGHT })
      ]
    })
  ];

  function appendRubroRows(rubroTitle, items) {
    investmentRows.push(
      new TableRow({
        children: [
          createCell(rubroTitle, {
            colSpan: 7,
            bold: true,
            shadingColor: COLORS.HEADER_BG,
            textColor: COLORS.PRIMARY
          })
        ]
      })
    );

    if (items.length === 0) {
      investmentRows.push(
        new TableRow({
          children: [
            createCell('Sin ítems presupuestados en este rubro.', { colSpan: 7, italic: true })
          ]
        })
      );
      return;
    }

    for (const it of items) {
      const qty = Number(it.quantity || 1);
      const unitPrice = Number(it.unitPriceEstimated || it.unitPrice || 0);
      const rowTotal = Number(it.totalPrice || (qty * unitPrice));
      const isFinanced = !!it.financedBySeedCapital;

      const seedAmount = isFinanced ? rowTotal : 0;
      const ownAmount = isFinanced ? 0 : rowTotal;

      totalInvestment += rowTotal;
      totalSeedCapital += seedAmount;
      totalOwn += ownAmount;

      investmentRows.push(
        new TableRow({
          children: [
            createCell(it.description || 'Ítem de inversión', { widthPercent: 32 }),
            createCell(it.category || 'General', { widthPercent: 15, size: 18 }),
            createCell(String(qty), { widthPercent: 8, align: AlignmentType.CENTER }),
            createCell(formatMoney(unitPrice), { widthPercent: 11, align: AlignmentType.RIGHT }),
            createCell(formatMoney(rowTotal), { widthPercent: 11, align: AlignmentType.RIGHT, bold: true }),
            createCell(formatMoney(seedAmount), { widthPercent: 11, align: AlignmentType.RIGHT }),
            createCell(formatMoney(ownAmount), { widthPercent: 12, align: AlignmentType.RIGHT })
          ]
        })
      );
    }
  }

  appendRubroRows('RUBRO A: MAQUINARIA, HERRAMIENTAS Y EQUIPOS', rubroA);
  appendRubroRows('RUBRO B: CAPITAL DE TRABAJO E INSUMOS DE ARRANQUE (1 MES)', rubroB);
  appendRubroRows('RUBRO C: ACONDICIONAMIENTO Y MANO DE OBRA PROPIA', rubroC);

  // Fila de Totales
  const isCompliant = totalSeedCapital <= ceiling;
  investmentRows.push(
    new TableRow({
      children: [
        createCell('TOTALES CONSOLIDADOS DEL PLAN DE INVERSIÓN', {
          colSpan: 4,
          bold: true,
          shadingColor: COLORS.HEADER_BG
        }),
        createCell(formatMoney(totalInvestment), {
          bold: true,
          align: AlignmentType.RIGHT,
          shadingColor: COLORS.HEADER_BG
        }),
        createCell(formatMoney(totalSeedCapital), {
          bold: true,
          align: AlignmentType.RIGHT,
          shadingColor: COLORS.HEADER_BG,
          textColor: isCompliant ? COLORS.SUCCESS : COLORS.WARNING
        }),
        createCell(formatMoney(totalOwn), {
          bold: true,
          align: AlignmentType.RIGHT,
          shadingColor: COLORS.HEADER_BG
        })
      ]
    })
  );

  // 7.2. Capacidad Operativa y Ventas Mensuales Estimadas
  const monthlyProjections = costingData.monthlyProductionAndSales?.products || [];
  const totalSalesEstimate = costingData.monthlyProductionAndSales?.totalMonthlySalesEstimate || 0;

  const projectionRows = [
    new TableRow({
      children: [
        createCell('Producto / Servicio', { header: true, widthPercent: 26 }),
        createCell('Modalidad', { header: true, widthPercent: 16, align: AlignmentType.CENTER }),
        createCell('Capacidad Operativa Base', { header: true, widthPercent: 26 }),
        createCell('Volumen / Mes', { header: true, widthPercent: 12, align: AlignmentType.CENTER }),
        createCell('P. Venta', { header: true, widthPercent: 10, align: AlignmentType.RIGHT }),
        createCell('Venta Est./Mes', { header: true, widthPercent: 10, align: AlignmentType.RIGHT })
      ]
    })
  ];

  if (monthlyProjections.length === 0) {
    projectionRows.push(
      new TableRow({
        children: [
          createCell('No se registraron productos para la proyección mensual de ventas.', { colSpan: 6, italic: true })
        ]
      })
    );
  } else {
    for (const proj of monthlyProjections) {
      projectionRows.push(
        new TableRow({
          children: [
            createCell(proj.productName || 'Producto', { bold: true, widthPercent: 26 }),
            createCell(capitalize(proj.businessNature || 'produccion'), { widthPercent: 16, align: AlignmentType.CENTER, size: 18 }),
            createCell(proj.capacityDescription || 'Operación mensual estándar', { widthPercent: 26, size: 18 }),
            createCell(`${proj.monthlyVolume} ${proj.volumeUnit || 'u.'}`, { widthPercent: 12, align: AlignmentType.CENTER, bold: true }),
            createCell(formatMoney(proj.salePrice), { widthPercent: 10, align: AlignmentType.RIGHT }),
            createCell(formatMoney(proj.monthlySalesEstimate), { widthPercent: 10, align: AlignmentType.RIGHT, bold: true })
          ]
        })
      );
    }

    projectionRows.push(
      new TableRow({
        children: [
          createCell('VENTAS BRUTAS MENSUALES ESTIMADAS TOTALES', { colSpan: 5, bold: true, shadingColor: COLORS.HEADER_BG }),
          createCell(formatMoney(totalSalesEstimate), { bold: true, align: AlignmentType.RIGHT, shadingColor: COLORS.HEADER_BG, textColor: COLORS.PRIMARY })
        ]
      })
    );
  }

  // 7.3. Memoria de Cálculo de Insumos (Rubro B)
  const workingCapMemory = costingData.workingCapitalMemory || [];

  const memoryRows = [
    new TableRow({
      children: [
        createCell('Insumo / Suministro', { header: true, widthPercent: 22 }),
        createCell('Producto Asociado', { header: true, widthPercent: 18 }),
        createCell('Consumo Operativo Mensual', { header: true, widthPercent: 26 }),
        createCell('Compra Comercial', { header: true, widthPercent: 14, align: AlignmentType.CENTER }),
        createCell('P. Paquete', { header: true, widthPercent: 10, align: AlignmentType.RIGHT }),
        createCell('Subtotal (1 Mes)', { header: true, widthPercent: 10, align: AlignmentType.RIGHT })
      ]
    })
  ];

  if (workingCapMemory.length === 0) {
    memoryRows.push(
      new TableRow({
        children: [
          createCell('No se derivaron insumos de capital de trabajo desde la Sesión 6.', { colSpan: 6, italic: true })
        ]
      })
    );
  } else {
    let totalCapTrabajo1Mes = 0;
    for (const mem of workingCapMemory) {
      totalCapTrabajo1Mes += Number(mem.totalPrice || 0);
      memoryRows.push(
        new TableRow({
          children: [
            createCell(mem.ingredientName || mem.supplyName || mem.description || 'Insumo', { bold: true, widthPercent: 22 }),
            createCell(mem.productName || 'General', { widthPercent: 18, size: 18 }),
            createCell(mem.consumptionText || mem.formulaText || 'Consumo mensual', { widthPercent: 26, size: 18 }),
            createCell(mem.packagePresentationText || `${mem.quantity} ${mem.unit}`, { widthPercent: 14, align: AlignmentType.CENTER, bold: true, size: 18 }),
            createCell(formatMoney(mem.unitPriceEstimated || 0), { widthPercent: 10, align: AlignmentType.RIGHT }),
            createCell(formatMoney(mem.totalPrice || 0), { widthPercent: 10, align: AlignmentType.RIGHT, bold: true })
          ]
        })
      );
    }

    memoryRows.push(
      new TableRow({
        children: [
          createCell('TOTAL REQUERIMIENTO MENSUAL DE INSUMOS (RUBRO B)', { colSpan: 5, bold: true, shadingColor: COLORS.HEADER_BG }),
          createCell(formatMoney(totalCapTrabajo1Mes), { bold: true, align: AlignmentType.RIGHT, shadingColor: COLORS.HEADER_BG, textColor: COLORS.PRIMARY })
        ]
      })
    );
  }

  portraitChildren.push(
    createSectionH1('7. Plan de Producción, Inversión y Capital Semilla'),
    createSectionH2('7.1. Justificación de la Inversión Solicitada'),
    createParagraph(resolveFieldText(s7Fields.investmentRationale)),
    createParagraph('', { spaceAfter: 60 }),
    createSectionH2('7.2. Capacidad Operativa y Ventas Mensuales Estimadas'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: projectionRows
    }),
    createParagraph('', { spaceBefore: 40, spaceAfter: 80 }),
    createSectionH2('7.3. Memoria de Cálculo del Requerimiento Mensual de Insumos (Capital de Trabajo - Rubro B)'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: memoryRows
    }),
    createParagraph('', { spaceBefore: 40, spaceAfter: 80 }),
    createSectionH2('7.4. Presupuesto Detallado por Rubros Oficiales (Rubros A, B y C)'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: investmentRows
    }),
    createParagraph('', { spaceBefore: 60 }),
    createParagraph(
      `Estado del Fondo: Subsidio solicitado ${formatMoney(totalSeedCapital)} de un tope máximo de ${formatMoney(ceiling)}. ` +
      (isCompliant
        ? '✓ Conforme: La solicitud no supera el techo financiero aprobado.'
        : '⚠️ Alerta: El monto solicitado excede el techo del fondo y requerirá ajuste antes de desembolso.'),
      { bold: true, color: isCompliant ? COLORS.SUCCESS : COLORS.WARNING }
    ),
    createParagraph('', { spaceBefore: 80, spaceAfter: 40 }),
    createSectionH2('7.5. Dictamen y Trazabilidad de la Mesa Técnica'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell('Facilitador / Auditor:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(seedPlan.audit?.lastModifiedBy?.displayName || seedPlan.audit?.lastModifiedBy?.email || 'Mesa Técnica del Facilitador', { widthPercent: 25 }),
            createCell('Estado de Revisión:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(seedPlan.audit?.reviewStatus === 'aprobado' ? 'Aprobado y Conforme' : 'Borrador / Pendiente', {
              widthPercent: 25,
              bold: true,
              textColor: seedPlan.audit?.reviewStatus === 'aprobado' ? COLORS.SUCCESS : COLORS.WARNING
            })
          ]
        }),
        new TableRow({
          children: [
            createCell('Fecha de Validación:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(seedPlan.audit?.lastModifiedAt
              ? new Date(seedPlan.audit.lastModifiedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
              : currentDateStr, { widthPercent: 25 }),
            createCell('Techo Oficial Asignado:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(formatMoney(ceiling), { widthPercent: 25, bold: true })
          ]
        }),
        new TableRow({
          children: [
            createCell('Dictamen Técnico:', { bold: true, widthPercent: 25, shadingColor: COLORS.HEADER_BG }),
            createCell(
              cleanXmlString(seedPlan.audit?.changeSummary || (isCompliant ? 'Presupuesto conforme y validado con los lineamientos del fondo semilla.' : 'Requiere ajuste presupuestal.')),
              { widthPercent: 75, colSpan: 3, italic: true }
            )
          ]
        })
      ]
    }),
    createParagraph('', { spaceAfter: 160 })
  );

  // --- SECCIÓN 8: COMPROMISO DE EJECUCIÓN Y SOSTENIBILIDAD ---
  portraitChildren.push(
    createSectionH1('8. Compromiso de Ejecución y Sostenibilidad'),
    createParagraph(
      'Por medio del presente documento, declaro bajo juramento que toda la información consignada en este Plan de Negocios es fidedigna y refleja las proyecciones y capacidades operativas reales de mi emprendimiento. Me comprometo a destinar los fondos del Capital Semilla única y exclusivamente a los rubros y bienes detallados en el presente expediente, facilitando el seguimiento y asistencia técnica correspondiente.'
    ),
    createParagraph('', { spaceAfter: 40 }),
    createSectionH2('Compromiso Personal del Emprendedor(a):'),
    createParagraph(resolveFieldText(s8Fields.finalCommitment), { italic: true }),
    createParagraph('', { spaceAfter: 200 }),
    // Espacio para firma formal
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell(
              [
                createParagraph('_____________________________________________', { align: AlignmentType.CENTER, bold: true }),
                createParagraph(`Firma del Emprendedor(a): ${fullName}`, { align: AlignmentType.CENTER, bold: true }),
                createParagraph(`DNI / Cédula: ${dni}`, { align: AlignmentType.CENTER }),
                createParagraph(`Fecha: ${currentDateStr}`, { align: AlignmentType.CENTER, size: 18, color: COLORS.MUTED_TEXT })
              ],
              { widthPercent: 50 }
            ),
            createCell(
              [
                createParagraph('_____________________________________________', { align: AlignmentType.CENTER, bold: true }),
                createParagraph(`Visto Bueno: ${seedPlan.audit?.lastModifiedBy?.displayName || seedPlan.audit?.lastModifiedBy?.email || 'Consultor / Facilitador'}`, { align: AlignmentType.CENTER, bold: true }),
                createParagraph(`Rol: Consultor / Auditor Técnico de Negocios`, { align: AlignmentType.CENTER, size: 18 }),
                createParagraph(`Cohorte: ${cohortId} | Dictamen: ${seedPlan.audit?.reviewStatus === 'aprobado' ? 'Aprobado' : 'Borrador'}`, { align: AlignmentType.CENTER, size: 18 }),
                createParagraph(`Fecha: ${seedPlan.audit?.lastModifiedAt ? new Date(seedPlan.audit.lastModifiedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : currentDateStr}`, { align: AlignmentType.CENTER, size: 18, color: COLORS.MUTED_TEXT })
              ],
              { widthPercent: 50 }
            )
          ]
        })
      ]
    })
  );

  // =========================================================================
  // 2. SECCIÓN HORIZONTAL (ANEXO 1: LIENZO CANVAS / LANDSCAPE)
  // =========================================================================
  const landscapeChildren = [];

  landscapeChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({
          text: 'ANEXO 1: LIENZO DE MODELO DE NEGOCIO (CANVAS)',
          font: FONT_FAMILY,
          bold: true,
          size: 28, // 14pt
          color: COLORS.PRIMARY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 180 },
      children: [
        new TextRun({
          text: `Emprendimiento: ${commercialName} | Titular: ${fullName} (DNI: ${dni}) | Cohorte: ${cohortId}`,
          font: FONT_FAMILY,
          bold: true,
          size: 20,
          color: COLORS.MUTED_TEXT
        })
      ]
    })
  );

  // Obtener los 9 bloques del Canvas
  const canvasModel = planSections.canvas || s5.canvasModel || {};
  function getCanvasBlockText(key, defaultField = null) {
    const block = canvasModel[key];
    if (block?.text && cleanXmlString(block.text)) return cleanXmlString(block.text);
    if (defaultField && cleanXmlString(defaultField)) return cleanXmlString(defaultField);
    return '[Bloque Canvas pendiente de formulación]';
  }

  const canvasPartners = getCanvasBlockText('keyPartners', s5Fields.keyPartners);
  const canvasActivities = getCanvasBlockText('keyActivities', s5Fields.keyActivities);
  const canvasResources = getCanvasBlockText('keyResources', s5Fields.keyResources);
  const canvasValueProp = getCanvasBlockText('valueProposition', s3Fields.valueProposition || s5Fields.valueProposition);
  const canvasRelationships = getCanvasBlockText('customerRelationships', s5Fields.customerRelationships);
  const canvasChannels = getCanvasBlockText('channels', s4Fields.placementStrategy || s5Fields.channels);
  const canvasCustomers = getCanvasBlockText('customerSegments', s3Fields.targetCustomer || s5Fields.customerSegments);
  const canvasCostStructure = getCanvasBlockText('costStructure', s5Fields.costStructure);
  const canvasRevenueStreams = getCanvasBlockText('revenueStreams', s5Fields.revenueStreams);

  function createBlockParagraphs(title, icon, content) {
    return [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: `${icon} ${title}`.toUpperCase(),
            font: FONT_FAMILY,
            bold: true,
            size: 19,
            color: COLORS.PRIMARY
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 20, after: 40 },
        children: [
          new TextRun({
            text: cleanXmlString(content),
            font: FONT_FAMILY,
            size: 18,
            color: COLORS.DARK_TEXT
          })
        ]
      })
    ];
  }

  // Matriz formal de 9 bloques en 3 filas
  const canvasTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Fila 1 (Socios, Actividades, Propuesta de Valor, Relaciones, Segmentos)
      new TableRow({
        children: [
          createCell(createBlockParagraphs('1. Socios Clave', '🏢', canvasPartners), {
            rowSpan: 2,
            widthPercent: 20,
            shadingColor: COLORS.LIGHT_BG
          }),
          createCell(createBlockParagraphs('2. Actividades Clave', '⚡', canvasActivities), {
            widthPercent: 20
          }),
          createCell(createBlockParagraphs('3. Propuesta de Valor', '💎', canvasValueProp), {
            rowSpan: 2,
            widthPercent: 20,
            shadingColor: COLORS.HEADER_BG
          }),
          createCell(createBlockParagraphs('4. Relación con Clientes', '🤝', canvasRelationships), {
            widthPercent: 20
          }),
          createCell(createBlockParagraphs('5. Segmentos de Clientes', '👥', canvasCustomers), {
            rowSpan: 2,
            widthPercent: 20,
            shadingColor: COLORS.LIGHT_BG
          })
        ]
      }),
      // Fila 2 (Recursos Clave, Canales)
      new TableRow({
        children: [
          createCell(createBlockParagraphs('6. Recursos Clave', '🍳', canvasResources), {
            widthPercent: 20
          }),
          createCell(createBlockParagraphs('7. Canales de Distribución', '🛵', canvasChannels), {
            widthPercent: 20
          })
        ]
      }),
      // Fila 3 (Estructura de Costos, Fuentes de Ingresos)
      new TableRow({
        children: [
          createCell(createBlockParagraphs('8. Estructura de Costos', '📉', canvasCostStructure), {
            colSpan: 2,
            widthPercent: 50,
            shadingColor: COLORS.LIGHT_BG
          }),
          createCell(createBlockParagraphs('9. Fuentes de Ingresos', '💰', canvasRevenueStreams), {
            colSpan: 3,
            widthPercent: 50,
            shadingColor: COLORS.LIGHT_BG
          })
        ]
      })
    ]
  });

  landscapeChildren.push(canvasTable);

  // =========================================================================
  // RETORNAR DOCUMENTO COMPLETO CON AMBAS SECCIONES
  // =========================================================================
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_2_5_CM,
              bottom: MARGIN_2_5_CM,
              left: MARGIN_2_5_CM,
              right: MARGIN_2_5_CM
            }
          }
        },
        children: portraitChildren
      },
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE
            },
            margin: {
              top: MARGIN_2_5_CM,
              bottom: MARGIN_2_5_CM,
              left: MARGIN_2_5_CM,
              right: MARGIN_2_5_CM
            }
          }
        },
        children: landscapeChildren
      }
    ]
  });
}

/**
 * Compila y genera el archivo .docx como Blob (Navegador) o Buffer (Node)
 *
 * @param {Object} participantData
 * @param {Object} costingData
 * @param {Object} planSections
 * @returns {Promise<Blob|Buffer>}
 */
export async function buildBusinessPlanDocx(participantData, costingData, planSections) {
  const doc = buildBusinessPlanDocxDocument(participantData, costingData, planSections);

  // Si estamos en entorno navegador, generar Blob
  if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
    return await Packer.toBlob(doc);
  }

  // Si estamos en Node.js (pruebas unitarias), generar Buffer
  return await Packer.toBuffer(doc);
}

/**
 * Sanitiza nombres de archivo para compatibilidad en sistemas operativos
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'documento';
  return String(filename)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
    .replace(/[^a-zA-Z0-9_\-.]/g, '_') // Reemplazar caracteres especiales y espacios
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Genera el nombre estandarizado de archivo: Plan_Negocio_[DNI]_[NombreNegocio].docx
 */
export function generatePlanFilename(dni, commercialName) {
  const cleanDni = sanitizeFilename(dni || 'SINDNI');
  const cleanBusiness = sanitizeFilename(commercialName || 'Emprendimiento');
  return `Plan_Negocio_${cleanDni}_${cleanBusiness}.docx`;
}

function capitalize(str) {
  if (!str) return '';
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}
