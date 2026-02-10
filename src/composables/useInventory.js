// useInventory.js

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  Timestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import appFirebase, { functions } from "@/firebaseInit";
import { httpsCallable } from "firebase/functions";

import { ensureBusinessId } from "@/composables/useBusinessUtils";
import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(appFirebase);

export function useInventory() {
  const createItem = async (item, type = 'MERCH') => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede crear item sin businessId activo');
        return null;
      }

      // const productRef = doc(db, 'business', businessId, 'products', item.uuid);
      let trackStock = false;

      if (type === 'MERCH' || type === 'RAW_MATERIAL') {
        trackStock = true;
      }

      const productRef = doc(collection(db, `businesses/${businessId}/products`), item.uuid);
      const itemDescriptionNormalized = item.description.trim().toUpperCase();
      await setDoc(productRef, {
        description: itemDescriptionNormalized,
        price: item.price,
        cost: null,
        stock: item.quantity || 0,
        createdAt: serverTimestamp(),
        unit: item.unit || 'uni',
        type,
        trackStock,
      });
      console.log('BusinessId', businessId);
      console.log("Item created successfully", item);
    } catch (error) {
      console.error("Error creating item: ", error);
      throw error;
    }
  };

  /**
   * Crea un nuevo producto en el inventario con validaciones completas
   * @param {Object} productData - Datos del producto
   * @param {string} productData.description - Nombre del producto (obligatorio)
   * @param {number} productData.price - Precio de venta
   * @param {number} productData.cost - Costo de compra
   * @param {string} productData.unit - Unidad de medida (default: 'uni')
   * @param {string} productData.type - Tipo: MERCH, PRODUCT, RAW_MATERIAL, SERVICE (default: 'MERCH')
   * @param {boolean} productData.trackStock - Controlar stock (default: según tipo)
   * @returns {Promise<string>} UUID del producto creado
   */
  const createProduct = async (productData) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        throw new Error('No se puede crear producto sin businessId activo');
      }

      // Validaciones
      if (!productData.description || productData.description.trim() === '') {
        throw new Error('La descripción del producto es obligatoria');
      }

      // Validar que al menos precio o costo esté presente
      // Para RAW_MATERIAL, el costo es obligatorio
      if (productData.type === 'RAW_MATERIAL') {
        if (!productData.cost || productData.cost <= 0) {
          throw new Error('El costo es obligatorio para materias primas/insumos');
        }
      } else {
        if (!productData.price && !productData.cost) {
          throw new Error('Debes especificar al menos el precio de venta o el costo del producto');
        }
      }

      // Generar UUID para el nuevo producto
      const productId = uuidv4();

      // Determinar trackStock según el tipo
      let trackStock = productData.trackStock ?? false;
      if (productData.type === 'MERCH' || productData.type === 'RAW_MATERIAL') {
        trackStock = true; // Siempre controlar stock para mercadería e insumos
      } else if (productData.type === 'SERVICE') {
        trackStock = false; // Servicios nunca tienen stock
      }

      // Preparar datos del producto
      const productRef = doc(db, `businesses/${businessId}/products`, productId);
      const productPayload = {
        description: productData.description.trim().toUpperCase(),
        price: productData.price !== undefined && productData.price !== null ? Number(productData.price) : 0,
        cost: productData.cost !== undefined && productData.cost !== null ? Number(productData.cost) : 0,
        stock: 0, // Stock inicial siempre es 0 (se añade después con addStock)
        unit: productData.unit || 'uni',
        type: productData.type || 'MERCH',
        trackStock,
        stockLog: [], // Historial de stock vacío al crear
        createdAt: serverTimestamp(),
      };

      // 🆕 Si viene clasificación del form, incluirla
      if (productData.classification && productData.classification.category) {
        productPayload.classification = {
          ...productData.classification,
          classifiedAt: serverTimestamp(),
          classifiedBy: 'user',
          humanReviewed: true
        };
        productPayload.needsReview = false;
      }

      // Crear producto en Firestore
      await setDoc(productRef, productPayload);

      console.log('✅ Producto creado exitosamente:', {
        id: productId,
        description: productPayload.description,
        type: productPayload.type,
        trackStock: productPayload.trackStock,
        price: productPayload.price,
        cost: productPayload.cost,
        hasClassification: !!productPayload.classification
      });

      return productId;

    } catch (error) {
      console.error('❌ Error creando producto:', error);
      throw error;
    }
  };

  const createService = async (serviceData) => {
    return await createProduct({
      ...serviceData,
      type: 'SERVICE',
      trackStock: false,
    });
  }



  const createStockLog = async (item, typeStockLog = 'sell') => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede crear stock log sin businessId activo');
        return null;
      }

      const stockLog = {
        uuid: uuidv4(),
        quantity: item.quantity,
        type: typeStockLog,
      };

      // Siempre registrar cost y price para todos los movimientos
      // Esto permite tener histórico completo y análisis de rentabilidad

      // Registrar cost (costo del producto)
      if (item.cost !== undefined && item.cost !== null) {
        stockLog.cost = Number(item.cost);
      }

      // Registrar price (precio de venta/transacción)
      if (item.price !== undefined && item.price !== null) {
        stockLog.price = Number(item.price);
      }

      // Agregar referencia a la transacción si existe
      if (item.transactionId) {
        stockLog.transactionId = item.transactionId;
      }

      // Para conteos de inventario, agregar campos adicionales
      if (typeStockLog === 'count') {
        if (item.physicalStock !== undefined && item.physicalStock !== null) {
          stockLog.physicalStock = Number(item.physicalStock);
        }
        if (item.digitalStock !== undefined && item.digitalStock !== null) {
          stockLog.digitalStock = Number(item.digitalStock);
        }
        if (item.difference !== undefined && item.difference !== null) {
          stockLog.difference = Number(item.difference);
        }
        if (item.adjustmentType) {
          stockLog.adjustmentType = item.adjustmentType;
        }
      }

      const productRef = doc(db, `businesses/${businessId}/products`, item.uuid);

      // Verificar si el producto existe antes de actualizar
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        // ✅ CREACIÓN AUTOMÁTICA DE PRODUCTO NUEVO
        if (item.oldOrNewProduct === 'new') {
          console.log('🆕 Producto nuevo detectado, creando automáticamente:', {
            productId: item.uuid,
            description: item.description,
            type: typeStockLog
          });

          // Crear el producto antes de registrar el stockLog
          const productPayload = {
            description: (item.description || '').trim().toUpperCase(),
            price: item.price !== undefined && item.price !== null ? Number(item.price) : 0,
            cost: item.cost !== undefined && item.cost !== null ? Number(item.cost) : 0,
            stock: 0, // Stock inicial es 0, se ajustará con el stockLog
            unit: item.unit || 'uni',
            type: item.productType || 'MERCH',
            trackStock: item.trackStock !== undefined ? item.trackStock : true,
            stockLog: [],
            createdAt: serverTimestamp(),
          };

          await setDoc(productRef, productPayload);

          console.log('✅ Producto creado exitosamente antes del stockLog:', {
            id: item.uuid,
            description: productPayload.description,
            trackStock: productPayload.trackStock
          });
        } else {
          // ❌ ERROR: Producto marcado como "old" pero no existe
          console.error('❌ Error: El producto no existe en Firestore', {
            productId: item.uuid,
            businessId,
            productDescription: item.description || 'N/A',
            typeStockLog,
            oldOrNewProduct: item.oldOrNewProduct,
            itemData: item
          });
          throw new Error(
            `El producto "${item.description || item.uuid}" no existe en Firestore.\n` +
            `ID: ${item.uuid}\n` +
            `Business: ${businessId}\n` +
            `Marcado como: ${item.oldOrNewProduct || 'desconocido'}\n\n` +
            `Posibles causas:\n` +
            `1. El producto fue marcado como "old" pero nunca fue creado\n` +
            `2. El producto fue eliminado previamente\n` +
            `3. Error en la sincronización de datos\n\n` +
            `Solución: Verifica que el producto exista antes de crear stock logs, ` +
            `o márcalo como "new" si es la primera vez que se usa.`
          );
        }
      }

      await updateDoc(productRef, {
        stockLog: arrayUnion({ ...stockLog, createdAt: new Date() }),
      });

      // Pasar quantityForStock si existe para ajustar el stock correctamente
      await updateStock(productRef, stockLog, item.quantityForStock);

      console.log('✅ Stock log created successfully:', {
        uuid: stockLog.uuid,
        type: typeStockLog,
        quantity: item.quantity,
        cost: stockLog.cost,
        price: stockLog.price,
        transactionId: stockLog.transactionId,
        ...(typeStockLog === 'count' && {
          physicalStock: stockLog.physicalStock,
          digitalStock: stockLog.digitalStock,
          difference: stockLog.difference,
          adjustmentType: stockLog.adjustmentType
        })
      });

      return stockLog.uuid;

    } catch (error) {
      console.error('Error creating stock log: ', error);
      throw error;
    }
  };

  const deleteStockLog = async (transactionDataById) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede eliminar stock log sin businessId activo');
        return null;
      }


      for (const pair of transactionDataById[0].itemsAndStockLogs) {
        const itemUuid = pair.itemUuid;
        const stockLogUuid = pair.stockLogUuid;

        const itemRef = doc(db, `businesses/${businessId}/products`, itemUuid);
        const itemDoc = await getDoc(itemRef);
        if (!itemDoc.exists()) {
          throw new Error(`Item with UUID ${itemUuid} does not exist`);
        }

        const itemData = itemDoc.data();

        const stockLog = itemData.stockLog.find(log => log.uuid == stockLogUuid);
        stockLog.type = 'return';

        const updatedStockLog = itemData.stockLog.filter(log => log.uuid !== stockLogUuid);

        await updateDoc(itemRef, {
          stockLog: updatedStockLog
        });

        await updateStock(itemRef, stockLog);
      }

    } catch (error) {
      console.error('Error deleting stock log: ', error);
      throw error;
    }
  };

  const updateStock = async (productRef, stockLog, quantityForStock = undefined) => {
    try {
      const itemDoc = await getDoc(productRef);
      const itemData = itemDoc.data();

      let newStock = null;
      const updateData = {};

      if (stockLog.type === 'sell' || stockLog.type === 'waste') {
        // Usar quantityForStock si está disponible (venta con stock insuficiente)
        // De lo contrario, usar la cantidad del stockLog
        const quantityToDeduct = quantityForStock !== undefined ? quantityForStock : stockLog.quantity;

        // Si la cantidad a deducir es mayor al stock, solo deducir lo disponible
        if (quantityToDeduct > itemData.stock) {
          newStock = 0; // Stock no puede ser negativo
          console.log('⚠️ Cantidad a deducir mayor al stock disponible:', {
            cantidadSolicitada: stockLog.quantity,
            cantidadADeducir: quantityToDeduct,
            stockDisponible: itemData.stock,
            stockFinal: 0
          });
        } else {
          newStock = itemData.stock - quantityToDeduct;
        }
      }

      if (stockLog.type === 'buy' || stockLog.type === 'return') {
        newStock = itemData.stock + stockLog.quantity;

        // Si es una compra y viene un nuevo costo, actualizarlo
        if (stockLog.type === 'buy' && stockLog.cost !== undefined && stockLog.cost !== null) {
          updateData.cost = Number(stockLog.cost);
          console.log(`💰 Actualizando costo del producto a: S/ ${stockLog.cost}`);
        }
      }

      // Manejo especial para conteo de inventario (type: 'count')
      if (stockLog.type === 'count') {
        // Para conteos, el stock se establece directamente al valor físico contado
        if (stockLog.physicalStock === undefined || stockLog.physicalStock === null) {
          console.error('❌ Error: physicalStock es undefined o null', stockLog);
          throw new Error('physicalStock no puede ser undefined o null en un conteo de inventario');
        }

        newStock = Number(stockLog.physicalStock);
        console.log(`📊 Ajuste por conteo de inventario:`, {
          stockAnterior: itemData.stock,
          stockFisico: newStock,
          diferencia: stockLog.difference,
          tipoAjuste: stockLog.adjustmentType
        });
      }

      // Validar que newStock no sea null o undefined antes de actualizar
      if (newStock === null || newStock === undefined) {
        console.error('❌ Error: newStock es null o undefined', {
          type: stockLog.type,
          stockLog
        });
        throw new Error(`No se pudo calcular el nuevo stock para el tipo: ${stockLog.type}`);
      }

      // Actualizar stock (siempre)
      updateData.stock = Number(newStock);

      await updateDoc(productRef, updateData);
      console.log('✅ Stock updated successfully:', newStock);

      if (updateData.cost !== undefined) {
        console.log(`✅ Stock y costo actualizados: ${newStock} unidades, S/ ${updateData.cost}`);
      }
    } catch (error) {
      console.error('❌ Error updating stock: ', error);
      throw error;
    }
  };

  const getAllItemsInInventory = async () => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede obtener inventario sin businessId activo');
        return [];
      }

      const querySnapshot = await getDocs(collection(db, 'businesses', businessId, 'products'));
      if (querySnapshot.empty) return [];

      return querySnapshot.docs.map(doc => ({
        uuid: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching items: ", error);
      throw error;
    }
  };

  const getProductById = async (productId) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede obtener producto sin businessId activo');
        return null;
      }

      const productRef = doc(db, 'businesses', businessId, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        console.warn(`Producto con ID ${productId} no encontrado`);
        return null;
      }

      return {
        uuid: productDoc.id,
        ...productDoc.data(),
      };
    } catch (error) {
      console.error("Error fetching product: ", error);
      throw error;
    }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede actualizar producto sin businessId activo');
        return null;
      }

      const productRef = doc(db, 'businesses', businessId, 'products', productId);

      // Verificar si el producto existe
      const productDoc = await getDoc(productRef);
      if (!productDoc.exists()) {
        throw new Error(`Producto con ID ${productId} no existe`);
      }

      // Preparar datos de actualización
      const updatePayload = {};

      // Normalizar descripción si existe
      if (updatedData.description !== undefined) {
        updatePayload.description = updatedData.description.trim().toUpperCase();
      }

      // Actualizar precio si existe
      if (updatedData.price !== undefined && updatedData.price !== null) {
        updatePayload.price = Number(updatedData.price);
      }

      // Actualizar costo si existe
      if (updatedData.cost !== undefined && updatedData.cost !== null) {
        updatePayload.cost = Number(updatedData.cost);
      }

      // Actualizar unidad si existe
      if (updatedData.unit !== undefined) {
        updatePayload.unit = updatedData.unit;
      }

      // Actualizar tipo si existe
      if (updatedData.type !== undefined) {
        updatePayload.type = updatedData.type;
      }

      // Actualizar trackStock si existe
      if (updatedData.trackStock !== undefined) {
        updatePayload.trackStock = Boolean(updatedData.trackStock);
      }

      // Actualizar costStructure si existe (completo o campos específicos)
      if (updatedData.costStructure !== undefined) {
        // Si se pasa el objeto completo
        updatePayload.costStructure = updatedData.costStructure;
      } else {
        // Si se usan campos específicos con dot notation
        if (updatedData['costStructure.materials'] !== undefined) {
          updatePayload['costStructure.materials'] = Number(updatedData['costStructure.materials']);
        }
        if (updatedData['costStructure.materialsHistory'] !== undefined) {
          updatePayload['costStructure.materialsHistory'] = updatedData['costStructure.materialsHistory'];
        }
        if (updatedData['costStructure.mod'] !== undefined) {
          updatePayload['costStructure.mod'] = Number(updatedData['costStructure.mod']);
        }
        if (updatedData['costStructure.cif'] !== undefined) {
          updatePayload['costStructure.cif'] = Number(updatedData['costStructure.cif']);
        }
        if (updatedData['costStructure.overhead'] !== undefined) {
          updatePayload['costStructure.overhead'] = Number(updatedData['costStructure.overhead']);
        }
      }

      // Agregar timestamp de actualización
      updatePayload.updatedAt = serverTimestamp();

      await updateDoc(productRef, updatePayload);

      console.log('✅ Product updated successfully:', productId);
      console.log('📦 Update payload:', JSON.stringify(updatePayload, null, 2));
      return { success: true, productId, updatedFields: updatePayload };

    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  };

  /**
   * 🤖 Clasificar producto usando IA (llamada a Cloud Function)
   * @param {string|Object} descriptionOrData - Descripción del producto o { description, type, businessId }
   * @returns {Promise<Object>} Clasificación sugerida
   */
  const classifyProduct = async (descriptionOrData) => {
    try {
      const businessId = ensureBusinessId();

      // Si se pasa solo string, construir objeto
      const data = typeof descriptionOrData === 'string'
        ? { description: descriptionOrData, businessId }
        : { ...descriptionOrData, businessId };

      const classifyFn = httpsCallable(functions, 'classifyProductRequest');
      const result = await classifyFn(data);
      return result.data;
    } catch (error) {
      console.error('Error clasificando producto:', error);
      throw error;
    }
  };

  /**
   * 📝 Corregir una clasificación existente
   * @param {string} productId 
   * @param {Object} newClassification 
   */
  const correctClassification = async (productId, newClassification) => {
    try {
      const businessId = ensureBusinessId();
      const productRef = doc(db, `businesses/${businessId}/products`, productId);

      const updateData = {
        'classification': {
          ...newClassification,
          humanReviewed: true,
          humanCorrectedAt: serverTimestamp(),
          source: 'manual'
        },
        'needsReview': false,
        'updatedAt': serverTimestamp()
      };

      await updateDoc(productRef, updateData);

      console.log('✅ Clasificación corregida:', productId);
    } catch (error) {
      console.error('Error corrigiendo clasificación:', error);
      throw error;
    }
  };

  /**
   * 📋 Obtener productos sin clasificar o pendientes de revisión
   * @returns {Promise<Array>} Lista de productos
   */
  const getUnclassifiedProducts = async () => {
    try {
      const businessId = ensureBusinessId();
      const productsRef = collection(db, `businesses/${businessId}/products`);

      const q = query(
        productsRef,
        where('needsReview', '==', true),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo productos sin clasificar:', error);
      return [];
    }
  };

  /**
   * Normaliza una descripción para matching consistente
   * @param {string} description - Descripción a normalizar
   * @returns {string} Descripción normalizada
   */
  const normalizeDescription = (description) => {
    if (!description) return '';

    return description
      .toString()
      .toUpperCase()
      .trim()
      // Remover tildes
      .replace(/[ÁÀÄÂ]/g, 'A')
      .replace(/[ÉÈËÊ]/g, 'E')
      .replace(/[ÍÌÏÎ]/g, 'I')
      .replace(/[ÓÒÖÔ]/g, 'O')
      .replace(/[ÚÙÜÛ]/g, 'U')
      .replace(/Ñ/g, 'N')
      // Remover caracteres especiales excepto espacios y números
      .replace(/[^A-Z0-9\s]/g, ' ')
      // Normalizar espacios múltiples
      .replace(/\s+/g, ' ')
      .trim();
  };

  /**
   * 📚 Carga taxonomía local del negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise<Object>} Taxonomía local o estructura vacía
   */
  const loadLocalTaxonomy = async (businessId) => {
    try {
      if (!businessId) {
        businessId = ensureBusinessId();
      }

      const taxonomyRef = doc(db, 'businesses', businessId, 'settings', 'taxonomies');
      const taxonomySnap = await getDoc(taxonomyRef);

      if (taxonomySnap.exists()) {
        console.log('✅ Taxonomía local cargada para:', businessId);
        return taxonomySnap.data();
      } else {
        console.log('ℹ️ No existe taxonomía local, creando estructura vacía');
        // Crear estructura vacía inicial
        const emptyTaxonomy = {
          customCategories: [],
          customBrands: [],
          customPresentations: [],
          rules: [], // 🆕 Rules locales del negocio
          stats: {
            totalCustomItems: 0,
            customCategories: 0,
            customBrands: 0,
            avgConfidence: 0,
            lastUpdate: serverTimestamp()
          }
        };
        await setDoc(taxonomyRef, emptyTaxonomy);
        return emptyTaxonomy;
      }
    } catch (error) {
      console.error('❌ Error cargando taxonomía local:', error);
      return {
        customCategories: [],
        customBrands: [],
        customPresentations: [],
        rules: [],
        stats: {}
      };
    }
  };

  /**
   * 🌍 Actualiza taxonomía global (confidence >= 0.8)
   * - Agrega término a categories si no existe
   * - Crea regla automática si confidence >= 0.85
   * - Agrega marca a brands[] si es nueva
   * - Actualiza stats
   * @param {Object} classification - Clasificación de IA
   * @param {string} userInput - Descripción original del usuario
   * @param {number} confidence - Nivel de confianza
   * @param {string} industry - Industria del negocio
   */
  const updateGlobalTaxonomy = async (classification, userInput, confidence, industry) => {
    try {
      if (!industry) {
        console.warn('⚠️ No industry provided for global taxonomy update');
        return;
      }

      const taxonomyRef = doc(db, 'wala_global', 'taxonomies', industry, 'main');
      const taxonomySnap = await getDoc(taxonomyRef);

      let taxonomyData = taxonomySnap.exists() ? taxonomySnap.data() : {
        categories: {},
        brands: [],
        presentations: [],
        rules: [],
        stats: {
          totalProducts: 0,
          llmUsed: 0,
          localMatches: 0,
          rulesMatches: 0,
          totalLearnings: 0,
          manualCorrections: 0,
          avgConfidence: 0,
          lastLearningAt: null
        }
      };

      let hasChanges = false;

      // 1. Actualizar categorías
      if (classification.category) {
        if (!taxonomyData.categories[classification.category]) {
          taxonomyData.categories[classification.category] = {};
          hasChanges = true;
        }

        if (classification.subcategory) {
          if (!taxonomyData.categories[classification.category][classification.subcategory]) {
            taxonomyData.categories[classification.category][classification.subcategory] = [];
            hasChanges = true;
          }

          if (classification.subsubcategory) {
            const items = taxonomyData.categories[classification.category][classification.subcategory];
            if (!items.includes(classification.subsubcategory)) {
              items.push(classification.subsubcategory);
              hasChanges = true;
            }
          }
        }
      }

      // 2. Agregar marca si es nueva
      if (classification.brand) {
        if (!taxonomyData.brands) taxonomyData.brands = [];
        if (!taxonomyData.brands.includes(classification.brand)) {
          taxonomyData.brands.push(classification.brand);
          hasChanges = true;
        }
      }

      // 3. Agregar presentación si es nueva
      if (classification.presentation) {
        if (!taxonomyData.presentations) taxonomyData.presentations = [];
        if (!taxonomyData.presentations.includes(classification.presentation)) {
          taxonomyData.presentations.push(classification.presentation);
          hasChanges = true;
        }
      }

      // 4. Crear regla automática si confidence >= 0.8 (antes era 0.85)
      if (confidence >= 0.8) {
        await createAutoRule(industry, userInput, classification, confidence, taxonomyData);
        hasChanges = true;
      }

      // 5. Actualizar estadísticas
      if (!taxonomyData.stats) {
        taxonomyData.stats = {
          totalProducts: 0,
          llmUsed: 0,
          localMatches: 0,
          rulesMatches: 0,
          totalLearnings: 0,
          manualCorrections: 0,
          avgConfidence: 0,
          lastLearningAt: null
        };
      }

      taxonomyData.stats.totalLearnings = (taxonomyData.stats.totalLearnings || 0) + 1;
      taxonomyData.stats.lastLearningAt = serverTimestamp();

      // Actualizar promedio de confianza
      const currentAvg = taxonomyData.stats.avgConfidence || 0;
      const currentCount = taxonomyData.stats.totalLearnings || 1;
      taxonomyData.stats.avgConfidence = ((currentAvg * (currentCount - 1)) + confidence) / currentCount;

      if (hasChanges) {
        await setDoc(taxonomyRef, taxonomyData, { merge: true });
        console.log('🌍 ✅ TAXONOMÍA GLOBAL ACTUALIZADA:', {
          industry,
          category: classification.category,
          subcategory: classification.subcategory,
          confidence,
          totalLearnings: taxonomyData.stats.totalLearnings,
          totalRules: taxonomyData.rules?.length || 0,
          ruleCreated: confidence >= 0.85
        });
      } else {
        console.log('ℹ️ Taxonomía global sin cambios');
      }

      return taxonomyData;
    } catch (error) {
      console.error('❌ Error actualizando taxonomía global:', error);
      throw error;
    }
  };

  /**
   * 🏪 Actualiza taxonomía local del negocio (confidence < 0.8)
   * - Estructura: { customCategories: [], customBrands: [], customPresentations: [], stats: {} }
   * @param {string} businessId - ID del negocio
   * @param {Object} classification - Clasificación de IA o manual
   * @param {string} userInput - Descripción original del usuario
   * @param {number} confidence - Nivel de confianza
   */
  const updateLocalTaxonomy = async (businessId, classification, userInput, confidence) => {
    try {
      if (!businessId) {
        businessId = ensureBusinessId();
      }

      const taxonomyRef = doc(db, 'businesses', businessId, 'settings', 'taxonomies');
      const taxonomySnap = await getDoc(taxonomyRef);

      console.log(`📊 Actualizando taxonomía local - Confidence: ${confidence}, Source: ${classification.source}`);

      let taxonomyData = taxonomySnap.exists() ? taxonomySnap.data() : {
        customCategories: [],
        customBrands: [],
        customPresentations: [],
        rules: [], // 🆕 Rules locales
        stats: {
          totalCustomItems: 0,
          customCategories: 0,
          customBrands: 0,
          avgConfidence: 0,
          lastUpdate: null
        }
      };

      let hasChanges = false;

      // 1. Agregar categoría personalizada si no existe
      if (classification.category) {
        const categoryExists = taxonomyData.customCategories.some(cat =>
          cat.category === classification.category &&
          cat.subcategory === classification.subcategory
        );

        if (!categoryExists) {
          const categoryEntry = {
            category: classification.category,
            subcategory: classification.subcategory || null,
            items: classification.subsubcategory ? [classification.subsubcategory] : [],
            createdBy: 'user',
            createdAt: new Date(),
            source: classification.source || 'manual',
            confidence: confidence,
            originalInput: userInput
          };

          taxonomyData.customCategories.push(categoryEntry);
          hasChanges = true;
        } else if (classification.subsubcategory) {
          // Agregar item a categoría existente
          const category = taxonomyData.customCategories.find(cat =>
            cat.category === classification.category &&
            cat.subcategory === classification.subcategory
          );

          if (category && !category.items.includes(classification.subsubcategory)) {
            category.items.push(classification.subsubcategory);
            hasChanges = true;
          }
        }
      }

      // 2. Agregar marca personalizada
      if (classification.brand) {
        if (!taxonomyData.customBrands.includes(classification.brand)) {
          taxonomyData.customBrands.push(classification.brand);
          hasChanges = true;
        }
      }

      // 3. Agregar presentación personalizada
      if (classification.presentation) {
        if (!taxonomyData.customPresentations.includes(classification.presentation)) {
          taxonomyData.customPresentations.push(classification.presentation);
          hasChanges = true;
        }
      }

      // 4. Crear rule local si confidence >= 0.5 (más permisivo que global que usa 0.85)
      if (confidence >= 0.5) {
        const ruleAdded = await createLocalRule(businessId, userInput, classification, confidence, taxonomyData);
        if (ruleAdded) {
          hasChanges = true;
          console.log('✅ Rule local creada, marcando cambios para guardar');
        }
      }

      // 5. Actualizar estadísticas
      if (hasChanges) {
        taxonomyData.stats.totalCustomItems = (taxonomyData.stats.totalCustomItems || 0) + 1;
        taxonomyData.stats.customCategories = taxonomyData.customCategories.length;
        taxonomyData.stats.customBrands = taxonomyData.customBrands.length;
        taxonomyData.stats.lastUpdate = serverTimestamp();

        // Actualizar promedio de confianza
        const currentAvg = taxonomyData.stats.avgConfidence || 0;
        const currentCount = taxonomyData.stats.totalCustomItems || 1;
        taxonomyData.stats.avgConfidence = ((currentAvg * (currentCount - 1)) + confidence) / currentCount;

        await setDoc(taxonomyRef, taxonomyData, { merge: true });

        console.log('🏪 ✅ TAXONOMÍA LOCAL ACTUALIZADA:', {
          businessId,
          category: classification.category,
          subcategory: classification.subcategory,
          confidence,
          totalCustomItems: taxonomyData.stats.totalCustomItems,
          totalCategories: taxonomyData.customCategories.length,
          totalRules: taxonomyData.rules?.length || 0
        });
      } else {
        console.log('ℹ️ Taxonomía local sin cambios');
      }

      return taxonomyData;
    } catch (error) {
      console.error('❌ Error actualizando taxonomía local:', error);
      throw error;
    }
  };

  /**
   * 🔧 Crea regla automática en taxonomía global
   * - Normaliza el input del usuario
   * - Genera patrón regex flexible
   * - Agrega a array rules[]
   * @param {string} industry - Industria
   * @param {string} userInput - Descripción original
   * @param {Object} classification - Clasificación resultante
   * @param {number} confidence - Nivel de confianza
   * @param {Object} taxonomyData - Datos actuales de taxonomía (opcional, para evitar re-fetch)
   */
  const createAutoRule = async (industry, userInput, classification, confidence, taxonomyData = null) => {
    try {
      const normalized = normalizeDescription(userInput);

      // Lista de palabras a ignorar (marcas comunes, medidas, tipos)
      const stopwords = ['SOL', 'SIKA', 'CEMEX', 'TIPO', 'PORTLAND', 'KG', 'MT', 'CM', 'MM', 'LT', 'GL', 'UN', 'UNI', 'UNIDAD', 'PACK', 'CAJA'];
      const numbersRegex = /^\d+\.?\d*$/;

      // Extraer solo palabras clave (ignorar stopwords, números y palabras muy cortas)
      const keywords = normalized
        .split(' ')
        .filter(word => {
          return word.length > 2 &&
            !stopwords.includes(word) &&
            !numbersRegex.test(word);
        })
        .slice(0, 2); // Tomar máximo 2 palabras clave

      // Si no hay keywords válidas, usar la primera palabra significativa
      if (keywords.length === 0) {
        keywords.push(normalized.split(' ').find(w => w.length > 2) || normalized);
      }

      // Generar patrón con alternancia (|) para mayor flexibilidad
      const pattern = keywords
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');

      console.log('🌍 Pattern global generado:', {
        original: userInput,
        normalized,
        keywords,
        pattern: `(${pattern})`
      });

      const rule = {
        match: `(${pattern})`,
        category: classification.category,
        subcategory: classification.subcategory || null,
        subsubcategory: classification.subsubcategory || null,
        brand: classification.brand || null,
        presentation: classification.presentation || null,
        auto: true,
        confidence: confidence,
        createdAt: new Date(),
        timesUsed: 0,
        originalInput: userInput
      };

      const taxonomyRef = doc(db, 'wala_global', 'taxonomies', industry, 'main');

      // Si ya tenemos taxonomyData, usarla; si no, hacer fetch
      if (!taxonomyData) {
        const taxonomySnap = await getDoc(taxonomyRef);
        taxonomyData = taxonomySnap.exists() ? taxonomySnap.data() : { rules: [] };
      }

      if (!taxonomyData.rules) {
        taxonomyData.rules = [];
      }

      // Verificar que no exista una regla similar
      const ruleExists = taxonomyData.rules.some(r => r.match === rule.match);

      if (!ruleExists) {
        taxonomyData.rules.push(rule);

        console.log('🎯 Regla automática agregada al array:', {
          pattern: rule.match,
          category: classification.category,
          confidence,
          totalRules: taxonomyData.rules.length
        });
      } else {
        console.log('ℹ️ Regla ya existe:', rule.match);
      }

    } catch (error) {
      console.error('❌ Error creando regla automática:', error);
    }
  };

  /**
   * 🏪 Crea regla LOCAL en taxonomía del negocio
   * - Similar a createAutoRule pero guarda en taxonomía local
   * - Se usa cuando confidence < 0.8
   * @param {string} businessId - ID del negocio
   * @param {string} userInput - Descripción original
   * @param {Object} classification - Clasificación resultante
   * @param {number} confidence - Nivel de confianza
   * @param {Object} taxonomyData - Datos actuales de taxonomía local (opcional)
   */
  const createLocalRule = async (businessId, userInput, classification, confidence, taxonomyData = null) => {
    try {
      if (!businessId) businessId = ensureBusinessId();

      const normalized = normalizeDescription(userInput);

      // Lista de palabras a ignorar (marcas comunes, medidas, tipos)
      const stopwords = ['SOL', 'SIKA', 'CEMEX', 'TIPO', 'PORTLAND', 'KG', 'MT', 'CM', 'MM', 'LT', 'GL', 'UN', 'UNI', 'UNIDAD', 'PACK', 'CAJA'];
      const numbersRegex = /^\d+\.?\d*$/;

      // Extraer solo palabras clave (ignorar stopwords, números y palabras muy cortas)
      const keywords = normalized
        .split(' ')
        .filter(word => {
          return word.length > 2 &&
            !stopwords.includes(word) &&
            !numbersRegex.test(word);
        })
        .slice(0, 2); // Tomar máximo 2 palabras clave

      // Si no hay keywords válidas, usar la primera palabra significativa
      if (keywords.length === 0) {
        keywords.push(normalized.split(' ').find(w => w.length > 2) || normalized);
      }

      // Generar patrón con alternancia (|) para mayor flexibilidad
      const pattern = keywords
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');

      console.log('🎯 Pattern generado:', {
        original: userInput,
        normalized,
        keywords,
        pattern: `(${pattern})`
      });

      const rule = {
        match: `(${pattern})`,
        category: classification.category,
        subcategory: classification.subcategory || null,
        subsubcategory: classification.subsubcategory || null,
        brand: classification.brand || null,
        presentation: classification.presentation || null,
        auto: true,
        confidence: confidence,
        createdAt: new Date(),
        timesUsed: 0,
        originalInput: userInput,
        source: 'local'
      };

      const taxonomyRef = doc(db, 'businesses', businessId, 'settings', 'taxonomies');

      // Si ya tenemos taxonomyData, usarla; si no, hacer fetch
      if (!taxonomyData) {
        const taxonomySnap = await getDoc(taxonomyRef);
        taxonomyData = taxonomySnap.exists() ? taxonomySnap.data() : { rules: [] };
      }

      if (!taxonomyData.rules) {
        taxonomyData.rules = [];
      }

      // Verificar que no exista una regla similar
      const ruleExists = taxonomyData.rules.some(r => r.match === rule.match);

      if (!ruleExists) {
        taxonomyData.rules.push(rule);

        console.log('🏪 Rule local agregada al array:', {
          pattern: rule.match,
          category: classification.category,
          confidence,
          totalLocalRules: taxonomyData.rules.length
        });
        return true; // Rule agregada
      } else {
        console.log('ℹ️ Rule local ya existe:', rule.match);
        return false; // Rule ya existía
      }

    } catch (error) {
      console.error('❌ Error creando rule local:', error);
      return false;
    }
  };

  /**
   * 🎯 Actualiza taxonomía global o local según confianza
   * @param {Object} classification - Clasificación de IA o manual
   * @param {string} userInput - Descripción original del usuario
   * @param {boolean} isAccepted - Si el usuario aceptó o editó
   * @param {string} businessId - ID del negocio
   * @param {string} industry - Industria del negocio
   * @returns {Promise<Object>} Resultado de la actualización
   */
  const updateTaxonomyFromClassification = async (classification, userInput, isAccepted = true, businessId = null, industry = null) => {
    try {
      if (!businessId) businessId = ensureBusinessId();

      const confidence = classification.confidence || 0;
      const source = classification.source || 'unknown';

      console.log('🔍 updateTaxonomyFromClassification DEBUG:', {
        confidence,
        source,
        isAccepted,
        hasIndustry: !!industry,
        conditionCheck: {
          'llm + high': source === 'llm' && confidence >= 0.8 && isAccepted,
          'llm + low': source === 'llm' && confidence < 0.8 && isAccepted,
          'manual': source === 'manual' || !isAccepted,
          'local_match': source === 'local_match' || source === 'rules'
        }
      });

      let result = {
        updated: false,
        type: null,
        message: ''
      };

      // LÓGICA DE ACTUALIZACIÓN
      if (source === 'llm' && confidence >= 0.8 && isAccepted) {
        // ✅ Alta confianza + aceptada → Taxonomía global
        await updateGlobalTaxonomy(classification, userInput, confidence, industry);
        result = {
          updated: true,
          type: 'global',
          message: '✅ Taxonomía global actualizada - Ayudará a otros usuarios'
        };

        // Si confidence >= 0.85, también se creó una regla automática
        if (confidence >= 0.85) {
          result.message += ' (Regla automática creada)';
        }

      } else if (source === 'llm' && confidence < 0.8 && isAccepted) {
        // ⚠️ Baja confianza pero aceptada → Taxonomía local
        await updateLocalTaxonomy(businessId, classification, userInput, confidence);
        result = {
          updated: true,
          type: 'local',
          message: '✅ Guardado en taxonomía local de tu negocio'
        };

      } else if (source === 'manual' || !isAccepted) {
        // ✋ Clasificación manual o editada → Taxonomía local con confidence 1.0
        await updateLocalTaxonomy(businessId, classification, userInput, 1.0);
        result = {
          updated: true,
          type: 'local',
          message: '✅ Categoría personalizada guardada'
        };

      } else if (source === 'local_match' || source === 'rules') {
        // 🎯 Coincidencia local o regla → No actualizar taxonomía
        result = {
          updated: false,
          type: 'none',
          message: '✅ Clasificación aplicada'
        };
      }

      console.log('📊 Taxonomía actualizada:', result);
      return result;

    } catch (error) {
      console.error('❌ Error actualizando taxonomía:', error);
      return {
        updated: false,
        type: 'error',
        message: '❌ Error al actualizar taxonomía'
      };
    }
  };

  /**
   * Obtiene productos candidatos para composición (con trackStock = true)
   * @param {string} excludeProductId - ID del producto a excluir (evitar recursión)
   * @returns {Promise<Array>} - Array de productos
   */
  const getMaterialCandidates = async (excludeProductId = null) => {
    try {
      const businessId = ensureBusinessId();
      if (!businessId) {
        throw new Error('No se puede obtener materiales sin businessId activo');
      }

      const productsRef = collection(db, `businesses/${businessId}/products`);
      const q = query(productsRef, where('trackStock', '==', true));

      const snapshot = await getDocs(q);
      const products = [];

      snapshot.forEach((doc) => {
        const productId = doc.id;

        // Excluir el producto actual
        if (excludeProductId && productId === excludeProductId) {
          return;
        }

        products.push({
          productId,
          ...doc.data()
        });
      });

      console.log(`📦 ${products.length} materiales candidatos obtenidos`);
      return products;

    } catch (error) {
      console.error('❌ Error obteniendo materiales candidatos:', error);
      throw error;
    }
  };

  /**
   * Obtiene solo el costo de un producto específico
   * @param {string} productId - ID del producto
   * @returns {Promise<number|null>} - Costo del producto o null
   */
  const getProductCostById = async (productId) => {
    try {
      const businessId = ensureBusinessId();
      if (!businessId) {
        throw new Error('No se puede obtener costo sin businessId activo');
      }

      const productRef = doc(db, `businesses/${businessId}/products`, productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        console.warn('⚠️ Producto no encontrado:', productId);
        return null;
      }

      const cost = productSnap.data().cost || null;
      return cost;

    } catch (error) {
      console.error('❌ Error obteniendo costo del producto:', error);
      return null;
    }
  };

  /**
   * Guarda la composición de materiales de un producto
   * @param {string} productId - ID del producto
   * @param {Array} composition - Array de materiales
   * @param {number} totalCost - Costo total calculado
   * @returns {Promise<boolean>} - true si se guardó exitosamente
   */
  const saveProductComposition = async (productId, composition, totalCost) => {
    try {
      const businessId = ensureBusinessId();
      if (!businessId) {
        throw new Error('No se puede guardar composición sin businessId activo');
      }

      const productRef = doc(db, `businesses/${businessId}/products`, productId);

      // Verificar que el producto existe
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) {
        throw new Error('Producto no encontrado');
      }

      const currentData = productSnap.data();
      const currentCostStructure = currentData.costStructure || {};

      // Crear entrada de historial
      // Nota: serverTimestamp() NO se puede usar dentro de arrays, usar Timestamp.now()
      const historyEntry = {
        date: Timestamp.now(),
        value: totalCost,
        reason: currentCostStructure.materials ? 'update' : 'initial'
      };

      // Preparar el historial actualizado
      const currentHistory = currentCostStructure.materialsHistory || [];
      const updatedHistory = [...currentHistory, historyEntry];

      // Actualizar el producto
      await updateDoc(productRef, {
        composition: composition,
        'costStructure.materials': totalCost,
        'costStructure.materialsHistory': updatedHistory
      });

      console.log('💾 Composición guardada exitosamente:', {
        productId,
        totalCost,
        materialsCount: composition.length
      });

      return true;

    } catch (error) {
      console.error('❌ Error guardando composición:', error);
      throw error;
    }
  };

  /**
   * Valida una composición antes de guardar
   * @param {Array} composition - Array de materiales a validar
   * @returns {Object} - { valid: boolean, errors: Array }
   */
  const validateComposition = (composition) => {
    const errors = [];

    if (!composition || composition.length === 0) {
      errors.push('La composición debe tener al menos un material');
      return { valid: false, errors };
    }

    composition.forEach((material, index) => {
      // Validar productId
      if (!material.productId) {
        errors.push(`Material ${index + 1}: productId es obligatorio`);
      }

      // Validar quantity
      if (!material.quantity || material.quantity <= 0) {
        errors.push(`Material ${index + 1}: La cantidad debe ser mayor a 0`);
      }

      // Validar que quantity tenga máximo 2 decimales
      if (material.quantity) {
        const decimals = (material.quantity.toString().split('.')[1] || '').length;
        if (decimals > 2) {
          errors.push(`Material ${index + 1}: La cantidad debe tener máximo 2 decimales`);
        }
      }

      // Validar unit
      if (!material.unit) {
        errors.push(`Material ${index + 1}: La unidad es obligatoria`);
      }
    });

    const valid = errors.length === 0;

    if (!valid) {
      console.warn('⚠️ Validación de composición fallida:', errors);
    }

    return { valid, errors };
  };

  return {
    createItem,
    createProduct,
    createService,
    createStockLog,
    deleteStockLog,
    getAllItemsInInventory,
    getProductById,
    updateProduct,
    // 🆕 Métodos de clasificación IA
    classifyProduct,
    correctClassification,
    getUnclassifiedProducts,
    // 🆕 Métodos de taxonomía
    loadLocalTaxonomy,
    updateGlobalTaxonomy,
    updateLocalTaxonomy,
    createAutoRule,
    createLocalRule,
    updateTaxonomyFromClassification,
    normalizeDescription,
    // 🆕 Métodos de composición de materiales
    getMaterialCandidates,
    getProductCostById,
    saveProductComposition,
    validateComposition
  };
}
