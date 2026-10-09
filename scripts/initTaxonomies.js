/**
 * Script para inicializar taxonomías base
 * Ejecutar con: node initTaxonomies.js (desde carpeta scripts)
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountFile = existsSync(join(__dirname, '../apps/functions/wala-lat-firebase-adminsdk.json'))
  ? join(__dirname, '../apps/functions/wala-lat-firebase-adminsdk.json')
  : join(__dirname, '../functions/wala-lat-firebase-adminsdk.json');

const serviceAccount = JSON.parse(
  readFileSync(serviceAccountFile, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Taxonomías base predefinidas
const TAXONOMIES = {
  ferreteria: {
    industry: "ferreteria",
    version: "1.3",
    categories: {
      "Eléctricos": {
        "Tomas e Interruptores": [
          "Tomacorrientes",
          "Interruptores",
          "Enchufes",
          "Adaptadores",
          "Extensiones"
        ],
        "Iluminación": [
          "Focos LED",
          "Lámparas",
          "Reflectores"
        ],
        "Cables y Conductores": [
          "Cable mellizo",
          "Cable vulcanizado",
          "Cable coaxial"
        ],
        "Protección Eléctrica": [
          "Fusibles",
          "Llaves termomagnéticas"
        ],
        "Conectividad y Accesorios": [
          "Conectores coaxiales",
          "Divisores coaxiales",
          "Cinta aislante"
        ]
      },

      "Fijaciones": {
        "Clavos": [
          "Clavo 1\"",
          "Clavo 1 1/2\"",
          "Clavo 2\"",
          "Clavo 2 1/2\"",
          "Clavo 3\"",
          "Clavo 3 1/2\"",
          "Clavo 5\"",
          "Clavos acero",
          "Clavo calamina con jebe"
        ],
        "Pernos": [
          "Pernos 1/4",
          "Pernos 5/16",
          "Pernos 3/8",
          "Pernos 7/16",
          "Pernos 1/2",
          "Pernos 5/8",
          "Pernos (stove bolt)"
        ],
        "Tuercas y Arandelas": [
          "Tuercas (ej. 5/8)"
        ],
        "Remaches": [
          "Remaches 1/8"
        ],
        "Alambres": [
          "Alambre"
        ]
      },

      "Seguridad y Cerrajería": {
        "Candados": [
          "Candados (varios tamaños)"
        ],
        "Cadenas": [
          "Cadena fierro",
          "Cadena para motosierra"
        ],
        "Herrajes de Puerta": [
          "Picaportes"
        ],
        "Precintos": [
          "Precintos de seguridad"
        ]
      },

      "Herramientas": {
        "Herramientas Manuales": [
          "Martillos",
          "Llaves mixtas",
          "Prensa para madera",
          "Tarraja macho",
          "Embudo (uso general)"
        ],
        "Herramientas Eléctricas": [
          "Taladro inalámbrico"
        ],
        "Medición": [
          "Winchas"
        ],
        "Accesorios y Consumibles": [
          "Brocas HSS",
          "Brocas pequeñas (semillas)",
          "Limas",
          "Lijas",
          "Escobillas para moladora",
          "Discos / lijas para moladora"
        ],
        "Almacenamiento": [
          "Caja porta herramientas"
        ]
      },

      "Jardinería y Agroinsumos": {
        "Poda y Corte": [
          "Tijeras de poda"
        ],
        "Amarre y Cuerdas": [
          "Rafia",
          "Soguilla",
          "Estopa"
        ],
        "Agroquímicos": [
          "Insecticidas (ej. Sevin)",
          "Veterinarios básicos (ej. Neguvet)"
        ]
      },

      "Repuestos y Mantenimiento de Motores": {
        "Sistema de Combustible": [
          "Filtro de gasolina",
          "Manguerilla gasolina",
          "Tapa de tanque",
          "Filtro de tanque"
        ],
        "Encendido": [
          "Bobina",
          "Chupón de bujía"
        ],
        "Arranque": [
          "Manija arrancador",
          "Soguilla arrancador"
        ],
        "Transmisión y Corte": [
          "Piñón",
          "Cadena Oregon (motosierra)"
        ],
        "Lubricación": [
          "Bomba de aceite",
          "Aceite 2T (cojín/medida)"
        ],
        "Ruedas y Transporte": [
          "Llanta carretilla"
        ],
        "Accesorios Taller": [
          "Embudo (taller)",
          "Lagartos batería",
          "Anillos de presión",
          "Válvulas"
        ],
        "Consumibles y Soldadura": [
          "Soldadura bronce"
        ]
      },

      "Construcción Ligera": {
        "Impermeabilización": [
          "Brea"
        ],
        "Mallas y Refuerzos": [
          "Malla (varias medidas)"
        ],
        "Plásticos y Coberturas": [
          "Plástico",
          "Plástico transparente"
        ],
        "Maderas": [
          "Plancha madera (tarrajeo)"
        ],
        "Metales y Tubería": [
          "Caño bronce"
        ],
        "Sacos y Empaque": [
          "Yute"
        ],
        "Aislantes y Protección": [
          "Tecnopor (terocal)"
        ],
        "Soldadura": [
          "Varilla soldadura (acero)"
        ]
      },

      "Pinturas y Químicos": {
        "Pinturas": [
          "Esmaltes",
          "Pintura gloss"
        ],
        "Diluyentes": [
          "Thinner 105",
          "Thinner 305",
          "Thinner acrílico"
        ],
        "Químicos Varios": [
          "Sevin",
          "Neguvet"
        ]
      },

      "Seguridad y EPP": {
        "Protección Visual": [
          "Lentes"
        ]
      },

      "Suministros Generales": {
        "Cintas y Adhesivos": [
          "Cinta de embalaje",
          "Cinta aislante"
        ],
        "Limpieza y Trapos": [
          "Franela"
        ],
        "Misceláneos": [
          "Encendedores"
        ]
      },

      "Pesca": {
        "Anzuelos y Accesorios": [
          "Anzuelo",
          "Caja anzuelo (ej. N13)"
        ],
        "Líneas y Nylon": [
          "Nylon 25mm",
          "Nylon 35mm",
          "Nylon 40mm"
        ]
      }
    },

    brands: [
      { "name": "TRUPER", "occurrences": 0 },
      { "name": "3M", "occurrences": 0 },
      { "name": "OREGON", "occurrences": 0 },
      { "name": "PRETUL", "occurrences": 0 },
      { "name": "CRAFTOP", "occurrences": 0 },
      { "name": "C&A", "occurrences": 0 },
      { "name": "AFRICANO", "occurrences": 0 },
      { "name": "SIN MARCA", "occurrences": 0 },
      { "name": "NO APLICA", "occurrences": 0 }
    ],

    models: [
      { "name": "MS 660", "occurrences": 0 },
      { "name": "MS 5800", "occurrences": 0 },
      { "name": "13HP", "occurrences": 0 },
      { "name": "25MM", "occurrences": 0 },
      { "name": "35MM", "occurrences": 0 },
      { "name": "40MM", "occurrences": 0 },
      { "name": "N13", "occurrences": 0 }
    ],

    rules: [
      {
        "match": "(foco|focos|led|l[aá]mpara|reflector)",
        "category": "Eléctricos",
        "subcategory": "Iluminación",
        "auto": true
      },
      {
        "match": "(tomacorriente|interruptor|enchufe|adaptador|extensi[oó]n)",
        "category": "Eléctricos",
        "subcategory": "Tomas e Interruptores",
        "auto": true
      },
      {
        "match": "(fusible|termomagn[eé]tica|breaker)",
        "category": "Eléctricos",
        "subcategory": "Protección Eléctrica",
        "auto": true
      },
      {
        "match": "(cable|mellizo|vulcanizado|coaxial|conector\\s?coaxial|divisor)",
        "category": "Eléctricos",
        "subcategory": "Cables y Conductores",
        "auto": true
      },

      {
        "match": "(clavo|clavos)",
        "category": "Fijaciones",
        "subcategory": "Clavos",
        "auto": true
      },
      {
        "match": "(perno|pernos|stove\\s?bolt)",
        "category": "Fijaciones",
        "subcategory": "Pernos",
        "auto": true
      },
      {
        "match": "(tuerca|arandela)",
        "category": "Fijaciones",
        "subcategory": "Tuercas y Arandelas",
        "auto": true
      },
      {
        "match": "(remache|remaches)",
        "category": "Fijaciones",
        "subcategory": "Remaches",
        "auto": true
      },
      {
        "match": "(alambre)",
        "category": "Fijaciones",
        "subcategory": "Alambres",
        "auto": true
      },

      {
        "match": "(candado|candados)",
        "category": "Seguridad y Cerrajería",
        "subcategory": "Candados",
        "auto": true
      },
      {
        "match": "(cadena|cadenas)",
        "category": "Seguridad y Cerrajería",
        "subcategory": "Cadenas",
        "auto": true
      },
      {
        "match": "(picaporte|picaportes)",
        "category": "Seguridad y Cerrajería",
        "subcategory": "Herrajes de Puerta",
        "auto": true
      },
      {
        "match": "(precinto|precintos)",
        "category": "Seguridad y Cerrajería",
        "subcategory": "Precintos",
        "auto": true
      },

      {
        "match": "(taladro|wincha|lima|lijas?|brocas?|tarraja|prensa|martillo|caja\\s?porta)",
        "category": "Herramientas",
        "subcategory": "Herramientas Manuales",
        "auto": true
      },

      {
        "match": "(tijera\\s?poda|poda|rafia|soga|soguilla|estopa)",
        "category": "Jardinería y Agroinsumos",
        "subcategory": "Amarre y Cuerdas",
        "auto": true
      },
      {
        "match": "(sevin|neguvet|insecticida|veterinario)",
        "category": "Jardinería y Agroinsumos",
        "subcategory": "Agroquímicos",
        "auto": true
      },

      {
        "match": "(motosierra|ms\\s?660|ms\\s?5800|filtro\\s?gasolina|bobina|chup[oó]n|manguerilla|arrancador|piñ[oó]n|bomba\\s?aceite|aceite\\s?2t|llanta\\s?carretilla|lagartos\\s?bater[ií]a|anillos\\s?presi[oó]n|v[aá]lvulas?)",
        "category": "Repuestos y Mantenimiento de Motores",
        "subcategory": "Accesorios Taller",
        "auto": true
      },

      {
        "match": "(brea|malla|pl[aá]stico|yute|varilla\\s?soldadura|soldadura|ca[nñ]o\\s?bronce|plancha\\s?madera)",
        "category": "Construcción Ligera",
        "subcategory": "Plásticos y Coberturas",
        "auto": true
      },
      {
        "match": "(terocal|tecnopor)",
        "category": "Construcción Ligera",
        "subcategory": "Aislantes y Protección",
        "auto": true
      },

      {
        "match": "(esmalte|pintura|thinner|diluyente|gloss)",
        "category": "Pinturas y Químicos",
        "subcategory": "Diluyentes",
        "auto": true
      },

      {
        "match": "(lentes?)",
        "category": "Seguridad y EPP",
        "subcategory": "Protección Visual",
        "auto": true
      },

      {
        "match": "(cinta\\s?de\\s?embalaje|embalaje)",
        "category": "Suministros Generales",
        "subcategory": "Cintas y Adhesivos",
        "auto": true
      },
      {
        "match": "(cinta\\s?aislante|aislante)",
        "category": "Eléctricos",
        "subcategory": "Conectividad y Accesorios",
        "auto": true
      },

      {
        "match": "(anzuelo|anzuelos|caja\\s?anzuelo|n13)",
        "category": "Pesca",
        "subcategory": "Anzuelos y Accesorios",
        "auto": true
      },
      {
        "match": "(nylon\\s?(25|35|40)mm|nylon)",
        "category": "Pesca",
        "subcategory": "Líneas y Nylon",
        "auto": true
      }
    ],

    stats: {
      totalProducts: 0,
      totalBusinesses: 0,
      avgConfidence: 0,
      lastTrainingAt: null
    }
  },

  reposteria: {
    industry: 'reposteria',
    version: '1.0',
    categories: {
      "Insumos": {
        "Harinas": ["Harina de Trigo", "Harina Integral", "Harina de Maíz"],
        "Azúcares y Edulcorantes": ["Azúcar Blanca", "Azúcar Morena", "Azúcar Impalpable"],
        "Lácteos": ["Mantequilla", "Leche", "Crema", "Queso Crema"],
        "Esencias y Saborizantes": ["Vainilla", "Esencias", "Colorantes"]
      },
      "Decoración": {
        "Fondant y Coberturas": ["Fondant", "Glaseado", "Chocolate"],
        "Sprinkles y Toppings": ["Chispas", "Perlas", "Confites"]
      },
      "Utensilios": {
        "Moldes y Cortadores": ["Moldes", "Cortadores", "Aros"],
        "Herramientas": ["Batidores", "Espátulas", "Rodillos", "Mangas Pasteleras"]
      },
      "Otros": {
        "Varios": null
      }
    },
    brands: [
      { name: "NICOLINI", occurrences: 0 },
      { name: "FLEISCHMANN", occurrences: 0 },
      { name: "ALICORP", occurrences: 0 }
    ],
    rules: [],
    stats: {
      totalProducts: 0,
      totalBusinesses: 0,
      avgConfidence: 0,
      lastTrainingAt: null
    }
  },

  libreria: {
    industry: 'libreria',
    version: '1.0',
    categories: {
      "Escritura": {
        "Lápices y Portaminas": ["Lápices de Grafito", "Portaminas", "Minas"],
        "Bolígrafos y Plumas": ["Bolígrafos", "Plumas", "Marcadores"]
      },
      "Arte": {
        "Pinturas": ["Acuarelas", "Témperas", "Acrílicos"],
        "Dibujo": ["Carboncillos", "Pasteles", "Crayones"]
      },
      "Escolar": {
        "Cuadernos y Blocks": ["Cuadernos", "Blocks", "Hojas"],
        "Útiles": ["Gomas", "Sacapuntas", "Reglas", "Tijeras"]
      },
      "Oficina": {
        "Archivadores": ["Folders", "Archivadores", "Biblioratos"],
        "Adhesivos": ["Goma", "Silicona", "Cinta"]
      },
      "Otros": {
        "Varios": null
      }
    },
    brands: [
      { name: "FABER CASTELL", occurrences: 0 },
      { name: "PILOT", occurrences: 0 },
      { name: "BIC", occurrences: 0 },
      { name: "ARTESCO", occurrences: 0 }
    ],
    rules: [],
    stats: {
      totalProducts: 0,
      totalBusinesses: 0,
      avgConfidence: 0,
      lastTrainingAt: null
    }
  }
};

async function initializeTaxonomies() {
  console.log('🚀 Inicializando taxonomías base...\n');

  try {
    for (const [industry, data] of Object.entries(TAXONOMIES)) {
      console.log(`📚 Creando taxonomía para: ${industry}`);

      const docRef = db
        .collection('wala_global')
        .doc('taxonomies')
        .collection(industry)
        .doc('main');

      await docRef.set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const categoriesCount = Object.keys(data.categories).length;
      const brandsCount = data.brands.length;

      console.log(`   ✅ ${categoriesCount} categorías principales`);
      console.log(`   ✅ ${brandsCount} marcas comunes`);
      console.log(`   ✅ Taxonomía guardada en: wala_global/taxonomies/${industry}/main\n`);
    }

    console.log('✅ Todas las taxonomías han sido inicializadas correctamente\n');
    console.log('📋 Siguiente paso:');
    console.log('   1. Verificar en Firebase Console: Firestore → wala_global → taxonomies');
    console.log('   2. Desplegar Cloud Functions: firebase deploy --only functions');
    console.log('   3. Crear un nuevo producto para probar la clasificación\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error inicializando taxonomías:', error);
    process.exit(1);
  }
}

// Ejecutar
initializeTaxonomies();
