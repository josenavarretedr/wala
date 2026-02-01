/* eslint-disable */
/**
 * Función para inicializar taxonomías base
 * Solo debe ejecutarse UNA VEZ durante la configuración inicial
 * Endpoint público temporal para setup
 */

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Asegurar que admin está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

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

exports.initializeTaxonomies = onRequest(
  {
    region: 'southamerica-east1'
  },
  (req, res) => {
    console.log('🚀 initializeTaxonomies llamada - Método:', req.method);

    cors(req, res, async () => {
      console.log('✅ CORS configurado');

      const db = admin.firestore();
      const results = [];

      try {
        console.log('📚 Iniciando creación de taxonomías...');

        for (const [industry, data] of Object.entries(TAXONOMIES)) {
          console.log(`🔍 Procesando industria: ${industry}`);

          const docRef = db
            .collection('wala_global')
            .doc('taxonomies')
            .collection(industry)
            .doc('main');

          // Verificar si ya existe
          const existing = await docRef.get();
          if (existing.exists) {
            console.log(`⏭️  ${industry} ya existe, saltando...`);
            results.push({
              industry,
              status: 'skipped',
              message: 'La taxonomía ya existe',
              categoriesCount: Object.keys(data.categories).length
            });
            continue;
          }

          // Crear taxonomía
          await docRef.set({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          console.log(`✅ ${industry} creada exitosamente`);

          results.push({
            industry,
            status: 'created',
            categoriesCount: Object.keys(data.categories).length,
            brandsCount: data.brands.length,
            path: `wala_global/taxonomies/${industry}/main`
          });
        }

        console.log('🎉 Todas las taxonomías procesadas');

        res.status(200).json({
          success: true,
          message: 'Taxonomías inicializadas correctamente',
          results
        });

      } catch (error) {
        console.error('❌ Error inicializando taxonomías:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }
);
