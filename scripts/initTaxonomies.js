/**
 * Script para inicializar taxonomías base
 * Ejecutar con: node initTaxonomies.js (desde carpeta scripts)
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../functions/wala-lat-firebase-adminsdk.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Taxonomías base predefinidas
const TAXONOMIES = {
  ferreteria: {
    industry: 'ferreteria',
    version: '1.0',
    categories: {
      "Herramientas": {
        "Herramientas Manuales": ["Martillos", "Destornilladores", "Llaves", "Alicates", "Tenazas"],
        "Herramientas Eléctricas": ["Taladros", "Lijadoras", "Sierras", "Amoladoras"],
        "Medición": ["Winchas", "Niveles", "Escuadras"]
      },
      "Ferretería": {
        "Fijaciones": ["Tornillos", "Pernos", "Clavos", "Tuercas", "Arandelas"],
        "Candados y Seguridad": ["Candados", "Cadenas", "Cerraduras"],
        "Herrajes": ["Bisagras", "Picaportes", "Manijas", "Correderas"]
      },
      "Materiales": {
        "Pintura": ["Esmaltes", "Thinner", "Selladores", "Barnices"],
        "Plásticos": ["Mangueras", "Tubos", "Láminas", "Cables"],
        "Construcción": ["Cemento", "Fierro", "Alambre", "Arena"]
      },
      "Eléctricos": {
        "Instalación": ["Tomacorrientes", "Interruptores", "Cajas", "Conduit"],
        "Iluminación": ["Focos", "Reflectores", "Lámparas"]
      },
      "Otros": {
        "Varios": null
      }
    },
    brands: [
      { name: "TRUPER", occurrences: 0 },
      { name: "STANLEY", occurrences: 0 },
      { name: "DEWALT", occurrences: 0 },
      { name: "MAKITA", occurrences: 0 },
      { name: "3M", occurrences: 0 },
      { name: "BOSCH", occurrences: 0 }
    ],
    rules: [],
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
