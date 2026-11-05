import assert from 'node:assert/strict';
import {
  buildBusinessPlanDocxDocument,
  resolveFieldText,
  sanitizeFilename,
  generatePlanFilename
} from '../src/services/export/docxBuilder.js';
import { Packer } from 'docx';
import JSZip from 'jszip';

console.log('--- INICIANDO SUITE DE PRUEBAS DE EXPORTACIÓN INSTITUCIONAL (.DOCX / .ZIP) ---');

// ============================================================================
// 1. PRUEBAS DE REGLA DE FALLBACK DE TEXTO CUALITATIVO
// ============================================================================
console.log('\n1. Verificando regla de fallback cualitativo (Aprobado > IA > Crudo > Placeholder)...');

// Caso A: Aprobado formal prevalece
const fieldWithApproved = {
  rawInput: { text: 'Mi texto original del emprendedor' },
  aiRefinement: { refinedText: 'Propuesta técnica elaborada por IA' },
  consultantReview: { finalApprovedText: 'Texto final validado por el consultor', status: 'aprobado' }
};
assert.equal(
  resolveFieldText(fieldWithApproved),
  'Texto final validado por el consultor',
  'Debe retornar el texto aprobado por el consultor si existe'
);

// Caso B: Si no hay aprobado, toma la propuesta de IA
const fieldWithAiOnly = {
  rawInput: { text: 'Mi texto original del emprendedor' },
  aiRefinement: { refinedText: 'Propuesta técnica elaborada por IA' },
  consultantReview: { finalApprovedText: null, status: 'pendiente_revision' }
};
assert.equal(
  resolveFieldText(fieldWithAiOnly),
  'Propuesta técnica elaborada por IA',
  'Debe retornar la propuesta IA si no hay texto aprobado'
);

// Caso C: Si no hay IA, toma el texto crudo del emprendedor
const fieldWithRawOnly = {
  rawInput: { text: 'Mi texto original del emprendedor' },
  aiRefinement: null,
  consultantReview: { finalApprovedText: null, status: 'borrador' }
};
assert.equal(
  resolveFieldText(fieldWithRawOnly),
  'Mi texto original del emprendedor',
  'Debe retornar el texto crudo si no hay IA ni aprobación'
);

// Caso D: Si todo está vacío, retorna el placeholder formal
const fieldEmpty = {
  rawInput: { text: '' },
  aiRefinement: null,
  consultantReview: null
};
assert.equal(
  resolveFieldText(fieldEmpty),
  '[Texto pendiente de formulación]',
  'Debe retornar [Texto pendiente de formulación] si todos los campos están vacíos'
);
assert.equal(
  resolveFieldText(null),
  '[Texto pendiente de formulación]',
  'Debe manejar null de forma segura'
);

console.log('✓ Pruebas de fallback cualitativo aprobadas exitosamente.');

// ============================================================================
// 2. PRUEBAS DE SANITIZACIÓN DE NOMBRES DE ARCHIVO
// ============================================================================
console.log('\n2. Verificando sanitización de nombres de archivo...');

const sampleDni = '45892134';
const sampleBusinessName = 'Sabor Criollo & Café / Delicias de María!';
const generatedFilename = generatePlanFilename(sampleDni, sampleBusinessName);

assert.ok(
  !generatedFilename.includes('&') && !generatedFilename.includes('/') && !generatedFilename.includes('!'),
  'El nombre de archivo generado no debe contener caracteres prohibidos por el OS'
);
assert.ok(
  generatedFilename.startsWith('Plan_Negocio_45892134_'),
  'El nombre debe iniciar con el prefijo canónico Plan_Negocio_[DNI]_'
);
assert.ok(
  generatedFilename.endsWith('.docx'),
  'El nombre debe terminar con la extensión .docx'
);

console.log(`✓ Nombre generado sanitizado: ${generatedFilename}`);

// ============================================================================
// 3. PRUEBA DE CONSTRUCCIÓN Y COMPILACIÓN COMPLETA DE DOCUMENTO WORD
// ============================================================================
console.log('\n3. Verificando compilación del documento Word (.docx) con las 8 secciones y Canvas...');

const mockParticipant = {
  dni: '45892134',
  cohortId: 'OIT-CHICLAYO-01',
  personalInfo: {
    firstName: 'María',
    lastName: 'Flores Pérez',
    phone: '+51 987 654 321',
    gender: 'Femenino',
    location: {
      department: 'Lambayeque',
      province: 'Chiclayo',
      district: 'José Leonardo Ortiz',
      address: 'Av. México 450'
    }
  },
  businessBasicInfo: {
    commercialName: 'Sabor Criollo de María',
    sector: 'Gastronomía y Alimentos',
    subSector: 'Hamburguesas y comida rápida',
    businessNature: 'produccion',
    operatingStatus: 'En marcha'
  }
};

const mockCosting = {
  currency: 'PEN',
  products: [
    {
      productId: 'PROD-01',
      productName: 'Hamburguesa Royal Casera',
      businessNature: 'produccion',
      financialSummary: {
        totalBatchDirectCost: 74.25,
        directCostPerUnit: 2.475,
        grossProfitPerUnit: 4.525,
        grossMarginPercentage: 64.64
      },
      commercialization: {
        currentSalePrice: 7.00
      }
    },
    {
      productId: 'PROD-02',
      productName: 'Jugo Especial Mixto 500ml',
      businessNature: 'produccion',
      financialSummary: {
        totalBatchDirectCost: 25.00,
        directCostPerUnit: 2.50,
        grossProfitPerUnit: 3.50,
        grossMarginPercentage: 58.33
      },
      commercialization: {
        currentSalePrice: 6.00
      }
    }
  ],
  seedCapitalInvestmentPlan: {
    seedCapitalCeiling: 3000.0,
    totalBusinessInvestment: 4100.0,
    allocatedTotal: 2850.0,
    allocatedSeedCapital: 2850.0,
    remainingBudget: 150.0,
    isBudgetCompliant: true,
    investmentItems: [
      {
        itemId: 'INV-01',
        category: 'Maquinaria y Equipo',
        rubro: 'rubro_a',
        description: 'Plancha freidora a gas de 3 quemadores acero inoxidable',
        quantity: 1,
        unitPriceEstimated: 1400.0,
        totalPrice: 1400.0,
        financedBySeedCapital: true
      },
      {
        itemId: 'INV-02',
        category: 'Insumos y Capital de Trabajo',
        rubro: 'rubro_b',
        description: 'Harina, carnes, panes y condimentos para 1 mes (12 tandas)',
        quantity: 1,
        unitPriceEstimated: 1450.0,
        totalPrice: 1450.0,
        financedBySeedCapital: true
      },
      {
        itemId: 'INV-03',
        category: 'Mano de Obra Propia',
        rubro: 'rubro_c',
        description: 'Dedicación y mano de obra del emprendedor durante el arranque',
        quantity: 1,
        unitPriceEstimated: 1250.0,
        totalPrice: 1250.0,
        financedBySeedCapital: false
      }
    ]
  }
};

const mockPlanSections = {
  s1_identidad_negocio: {
    fields: {
      businessStory: {
        rawInput: { text: 'Inicié vendiendo desayunos en una carretilla hace 2 años para sostener a mi familia.' }
      }
    }
  },
  s2_planeamiento_estrategico: {
    fields: {
      mision: {
        consultantReview: { finalApprovedText: 'Brindar comida rápida nutritiva y accesible con altos estándares sanitarios.', status: 'aprobado' }
      },
      vision: {
        aiRefinement: { refinedText: 'Contar con un local formal establecido con servicio de delivery propio para 2029.' }
      },
      objetivos: {
        rawInput: { text: '1. Vender 250 hamburguesas al mes. 2. Aumentar ingresos en 35%.' }
      }
    }
  },
  s3_cliente_propuesta_valor: {
    fields: {
      targetCustomer: { rawInput: { text: 'Trabajadores y comerciantes de José Leonardo Ortiz.' } },
      problemSolved: { rawInput: { text: 'Comida rápida limpia y sabrosa sin largas esperas.' } },
      valueProposition: { consultantReview: { finalApprovedText: 'Hamburguesas con pan recién horneado y salsas artesanales a precio popular.', status: 'aprobado' } }
    }
  },
  s4_estrategia_comercial: {
    fields: {
      productStrategy: { rawInput: { text: 'Combos con papas fritas y cremas variadas.' } },
      pricingStrategy: { rawInput: { text: 'Precios populares de S/ 7.00 que cubren costos y dejan 64% de margen.' } },
      placementStrategy: { rawInput: { text: 'Puesto fijo y pedidos por WhatsApp para entrega en la zona.' } },
      promotionStrategy: { rawInput: { text: 'Letrero luminoso, volantes en el mercado y promociones los viernes.' } }
    }
  },
  s5_modelo_negocio_canvas: {
    canvasModel: {
      valueProposition: { text: 'Hamburguesas artesanales con panes recién horneados y salsas caseras exclusivas.' },
      customerSegments: { text: 'Trabajadores del mercado local y vecinos de la zona.' },
      channels: { text: 'Puesto de venta físico y pedidos por WhatsApp con delivery directo.' },
      customerRelationships: { text: 'Atención cálida, rapidez en el despacho y promociones frecuentes.' },
      keyActivities: { text: 'Compra diaria de insumos frescos, preparación higiénica de alimentos.' },
      keyResources: { text: 'Plancha freidora a gas, congeladora y capital de trabajo.' },
      keyPartners: { text: 'Proveedores mayoristas de carnes y panadería aliada del sector.' },
      costStructure: { text: 'Insumos frescos directos, gas doméstico y envases.' },
      revenueStreams: { text: 'Venta de hamburguesas y combos, cobro en efectivo y Yape/Plin.' }
    }
  },
  s6_costeo_directo_recetas: {
    fields: {
      costingNotes: { rawInput: { text: 'Compras semanales en el mercado mayorista Moshoqueque.' } }
    }
  },
  s7_presupuesto_capital_semilla: {
    fields: {
      investmentRationale: {
        consultantReview: { finalApprovedText: 'La plancha de 3 quemadores triplicará la capacidad de cocción diaria.', status: 'aprobado' }
      }
    }
  },
  s8_evaluacion_integral_cierre: {
    fields: {
      finalCommitment: {
        rawInput: { text: 'Me comprometo a dedicar 8 horas diarias y llevar registro diario de ingresos y gastos.' }
      }
    }
  }
};

const doc = buildBusinessPlanDocxDocument(mockParticipant, mockCosting, mockPlanSections);

assert.ok(doc, 'El documento debe instanciarse correctamente');

// Generar Buffer DOCX
const docxBuffer = await Packer.toBuffer(doc);

assert.ok(docxBuffer instanceof Buffer || docxBuffer instanceof Uint8Array, 'El resultado debe ser un Buffer válido');
assert.ok(docxBuffer.length > 5000, `El tamaño del DOCX generado (${docxBuffer.length} bytes) debe ser mayor a 5KB`);

// Validar cabecera mágica PK (ZIP file format)
const magicZipHeader = docxBuffer.slice(0, 4);
assert.equal(magicZipHeader[0], 0x50, 'Byte 0 debe ser P');
assert.equal(magicZipHeader[1], 0x4B, 'Byte 1 debe ser K');
assert.equal(magicZipHeader[2], 0x03, 'Byte 2 debe ser 0x03');
assert.equal(magicZipHeader[3], 0x04, 'Byte 3 debe ser 0x04');

console.log(`✓ Archivo DOCX compilado exitosamente. Tamaño: ${docxBuffer.length} bytes (Estructura ZIP/DOCX válida).`);

// ============================================================================
// 4. PRUEBA DE EMPAQUETADO EN LOTE (.ZIP) CON JSZIP
// ============================================================================
console.log('\n4. Verificando empaquetado en lote de cohorte (.zip)...');

const zip = new JSZip();
zip.file(generatedFilename, docxBuffer);
zip.file('Plan_Negocio_12345678_Bodega_San_Jose.docx', docxBuffer);

const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
assert.ok(zipBuffer.length > 5000, 'El ZIP generado debe contener los documentos');

// Leer de nuevo el zip para verificar contenido
const unzipped = await JSZip.loadAsync(zipBuffer);
const fileNames = Object.keys(unzipped.files);

assert.equal(fileNames.length, 2, 'El ZIP debe contener exactamente 2 planes compilados');
assert.ok(fileNames.includes(generatedFilename), `El ZIP debe contener ${generatedFilename}`);
assert.ok(fileNames.includes('Plan_Negocio_12345678_Bodega_San_Jose.docx'), 'El ZIP debe contener el segundo plan');

console.log(`✓ Archivo ZIP de cohorte validado con éxito. Archivos contenidos: ${fileNames.join(', ')}`);

console.log('\n=============================================================');
console.log('🎉 TODAS LAS PRUEBAS DE LA FASE 7 PASARON SATISFACTORIAMENTE (4/4)');
console.log('=============================================================');
