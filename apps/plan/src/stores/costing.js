import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCostingModule, saveCostingModule } from '@/services/db/indexedDB';
import { listenParticipantCostingModule } from '@/services/db/firestore';
import { enqueueMutation } from '@/services/sync/syncQueue';
import { useCostingCalculator } from '@/composables/useCostingCalculator';
import { useAuthStore } from './auth';

export const useCostingStore = defineStore('costing', () => {
  const calc = useCostingCalculator();

  const participantId = ref(null);
  const currency = ref('PEN');
  const products = ref([]);
  const activeProductId = ref(null);
  const seedCapitalInvestmentPlan = ref({
    seedCapitalCeiling: 3000.0,
    totalBusinessInvestment: 0.0,
    allocatedTotal: 0.0,
    allocatedSeedCapital: 0.0,
    remainingBudget: 3000.0,
    isBudgetCompliant: true,
    investmentItems: [],
    audit: null
  });

  // Estado para escucha en tiempo real y notificaciones de mesa técnica
  const activeCostingListenerDni = ref(null);
  let unsubParticipantCosting = null;
  const facilitatorUpdateNotice = ref(null);

  const serviceLaborSettings = ref({
    desiredMonthlySalary: 1200,
    daysWorkedPerMonth: 25,
    hoursWorkedPerDay: 8,
    monthlyHoursWorked: 200,
    costPerMinute: 0.10,
    isConfigured: false
  });

  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref(null);

  // --- COMPUTEDS ---

  const activeProduct = computed(() => {
    if (!products.value.length) return null;
    return products.value.find((p) => p.productId === activeProductId.value) || products.value[0];
  });

  const totalProductsCount = computed(() => products.value.length);
  const canAddMoreProducts = computed(() => products.value.length < 5);

  const isBudgetCompliant = computed(() => seedCapitalInvestmentPlan.value.isBudgetCompliant);
  const allocatedTotal = computed(() => seedCapitalInvestmentPlan.value.allocatedTotal);
  const allocatedSeedCapital = computed(() => seedCapitalInvestmentPlan.value.allocatedSeedCapital ?? seedCapitalInvestmentPlan.value.allocatedTotal);
  const totalBusinessInvestment = computed(() => seedCapitalInvestmentPlan.value.totalBusinessInvestment ?? seedCapitalInvestmentPlan.value.allocatedTotal);
  const remainingBudget = computed(() => seedCapitalInvestmentPlan.value.remainingBudget);
  const seedCapitalCeiling = computed(() => seedCapitalInvestmentPlan.value.seedCapitalCeiling);
  const investmentItems = computed(() => seedCapitalInvestmentPlan.value.investmentItems || []);
  const ownContribution = computed(() => Math.max(0, (totalBusinessInvestment.value || 0) - (allocatedSeedCapital.value || 0)));

  const rubroAItems = computed(() => {
    return (seedCapitalInvestmentPlan.value.investmentItems || []).filter(
      (i) => i.rubro === 'rubro_a' || (!i.rubro && (i.category === 'Maquinaria y Equipo' || i.category === 'Herramientas'))
    );
  });

  const rubroBItems = computed(() => {
    return (seedCapitalInvestmentPlan.value.investmentItems || []).filter(
      (i) => i.rubro === 'rubro_b' || (i.isAutoDerivedFromS6 && !i.isLaborContribution) || (!i.rubro && i.category === 'Insumos y Capital de Trabajo')
    );
  });

  const rubroCItems = computed(() => {
    return (seedCapitalInvestmentPlan.value.investmentItems || []).filter(
      (i) => i.rubro === 'rubro_c' || i.isLaborContribution || (!i.rubro && (i.category === 'Acondicionamiento y Otros' || i.category === 'Mano de Obra Propia'))
    );
  });

  const rubrosBreakdown = computed(() => {
    return calc.computeSeedCapitalPlan({
      items: seedCapitalInvestmentPlan.value.investmentItems || [],
      ceiling: seedCapitalCeiling.value
    }).rubros;
  });

  // --- HELPERS INTERNOS ---

  function resolveDefaultNature() {
    try {
      const authStore = useAuthStore();
      const nature = authStore.currentParticipant?.businessBasicInfo?.businessNature;
      if (nature && ['produccion', 'servicio', 'comercio'].includes(nature)) {
        return nature;
      }
    } catch (e) {
      // Si authStore no está inicializado aún
    }
    return 'produccion';
  }

  function resetProductCostingData(prod, newNature) {
    if (!prod) return;
    const nature = newNature || prod.businessNature || 'produccion';
    prod.businessNature = nature;

    // 1. Limpiar ingredientes de receta (modo Producción)
    prod.ingredients = [];

    // 2. Limpiar insumos y configuración de servicio (modo Servicio)
    prod.serviceConfig = {
      durationMinutes: 0,
      costPerMinute: serviceLaborSettings.value?.costPerMinute || 0.10,
      supplies: []
    };

    // 3. Limpiar compras de comercio, flete y empaque (modo Comercio)
    prod.commerceConfig = {
      purchasePresentation: '',
      unitsPerPackage: 1,
      packagePurchasePrice: 0,
      freightExpense: 0,
      totalItemsInTrip: 0,
      packagingCostPerUnit: 0,
      baseUnitCost: 0,
      unitFreightCost: 0,
      directCostComercial: 0
    };

    // 4. Limpiar configuración de tanda / lote
    prod.batchConfig = {
      batchSize: 1,
      batchUnit: 'unidades',
      productionFrequency: 'semanal'
    };

    // 5. Limpiar comercialización (precio y volumen)
    prod.commercialization = {
      currentSalePrice: 0,
      estimatedMonthlySalesVolume: 0
    };

    // 6. Limpiar resumen financiero
    prod.financialSummary = {
      totalBatchDirectCost: 0,
      directCostPerUnit: 0,
      salePrice: 0,
      grossProfitPerUnit: 0,
      grossMarginPercentage: 0,
      monthlyGrossProfitEstimate: 0
    };

    // 7. Renombrar si tenía nombre de demo o placeholder genérico previo
    const defaultPlaceholders = [
      'Hamburguesa Royal',
      'Producto Principal',
      'Producto 1',
      'Producto 2',
      'Producto 3',
      'Producto 4',
      'Producto 5',
      'Nuevo Producto',
      'Nuevo Producto Elaborado',
      'Nuevo Servicio',
      'Nuevo Producto Comercial'
    ];
    if (!prod.productName || defaultPlaceholders.includes(prod.productName.trim())) {
      if (nature === 'servicio') {
        prod.productName = 'Nuevo Servicio';
      } else if (nature === 'comercio') {
        prod.productName = 'Nuevo Producto Comercial';
      } else {
        prod.productName = 'Nuevo Producto Elaborado';
      }
    }
  }

  async function syncBackToSession1(nature) {
    if (!['produccion', 'servicio', 'comercio'].includes(nature)) return;
    try {
      const authStore = useAuthStore();
      if (authStore.currentParticipant?.businessBasicInfo) {
        authStore.currentParticipant.businessBasicInfo.businessNature = nature;
      }
      if (participantId.value) {
        const { getParticipant, saveParticipant } = await import('@/services/db/indexedDB');
        const part = await getParticipant(participantId.value);
        if (part) {
          if (!part.businessBasicInfo) part.businessBasicInfo = {};
          part.businessBasicInfo.businessNature = nature;
          await saveParticipant(part);
        }
      }
      const { useSessionStore } = await import('./sessions');
      const sessionStore = useSessionStore();
      if (sessionStore.formAnswersMap && sessionStore.formAnswersMap[1]) {
        sessionStore.formAnswersMap[1].businessNature = nature;
      }
    } catch (e) {
      console.warn('[CostingStore] No se pudo sincronizar naturaleza hacia Sesión 1:', e);
    }
  }

  function createPolymorphicProduct({
    productId = `PROD-${Date.now()}`,
    productName = '',
    businessNature = null,
    salePrice = null,
    estimatedMonthlySalesVolume = 0,
    batchConfig = null,
    serviceConfig = null,
    commerceConfig = null,
    ingredients = []
  } = {}) {
    const nature = businessNature || resolveDefaultNature();
    const defaultPrice = salePrice !== null && salePrice !== undefined
      ? calc.parseStrictNumber(salePrice, 0)
      : 0;

    let defaultName = productName.trim();
    if (!defaultName) {
      if (nature === 'servicio') defaultName = 'Nuevo Servicio';
      else if (nature === 'comercio') defaultName = 'Nuevo Producto Comercial';
      else defaultName = 'Nuevo Producto Elaborado';
    }

    return {
      productId,
      productName: defaultName,
      businessNature: nature,
      batchConfig: {
        batchSize: 1,
        batchUnit: 'unidades',
        productionFrequency: 'semanal',
        batchesPerMonth: batchConfig?.batchesPerMonth || calc.calculateBatchesPerMonth(batchConfig?.productionFrequency || 'semanal'),
        ...(batchConfig || {})
      },
      serviceConfig: {
        durationMinutes: 0,
        costPerMinute: serviceLaborSettings.value?.costPerMinute || 0.10,
        supplies: Array.isArray(serviceConfig?.supplies) ? serviceConfig.supplies.map((s) => ({ ...s })) : [],
        ...(serviceConfig || {})
      },
      commerceConfig: {
        purchasePresentation: '',
        unitsPerPackage: 1,
        packagePurchasePrice: 0,
        freightExpense: 0,
        totalItemsInTrip: 0,
        packagingCostPerUnit: 0,
        baseUnitCost: 0,
        unitFreightCost: 0,
        directCostComercial: 0,
        ...(commerceConfig || {})
      },
      ingredients: Array.isArray(ingredients) ? ingredients.map((i) => ({ ...i })) : [],
      commercialization: {
        currentSalePrice: defaultPrice,
        estimatedMonthlySalesVolume,
        targetCoverageWeeks: 4
      },
      financialSummary: {
        totalBatchDirectCost: 0,
        directCostPerUnit: 0,
        salePrice: defaultPrice,
        grossProfitPerUnit: 0,
        grossMarginPercentage: 0,
        monthlyGrossProfitEstimate: 0
      }
    };
  }

  function recalculateProduct(product) {
    if (!product) return;
    if (!product.businessNature) {
      product.businessNature = 'produccion';
    }

    if (!product.batchConfig) {
      product.batchConfig = { batchSize: 1, batchUnit: 'unidades', productionFrequency: 'semanal' };
    }
    if (!product.serviceConfig) {
      product.serviceConfig = { durationMinutes: 0, costPerMinute: 0.18, supplies: [] };
    }
    if (!product.commerceConfig) {
      product.commerceConfig = {
        purchasePresentation: '',
        unitsPerPackage: 1,
        packagePurchasePrice: 0,
        freightExpense: 0,
        totalItemsInTrip: 0,
        packagingCostPerUnit: 0,
        baseUnitCost: 0,
        unitFreightCost: 0,
        directCostComercial: 0
      };
    }
    if (!product.commercialization) {
      product.commercialization = { currentSalePrice: 0, estimatedMonthlySalesVolume: 0 };
    }

    const salePrice = calc.parseStrictNumber(product.commercialization?.currentSalePrice, 0);
    const volume = calc.parseStrictNumber(product.commercialization?.estimatedMonthlySalesVolume, 0);

    if (product.businessNature === 'produccion') {
      const batchSize = calc.parseStrictNumber(product.batchConfig?.batchSize, 1);

      // Recalcular cada ingrediente
      if (Array.isArray(product.ingredients)) {
        for (const ing of product.ingredients) {
          ing.automatedMath = calc.computeIngredientMath({
            quantityUsed: ing.recipeConsumption?.quantityUsed,
            packageCost: ing.marketPurchase?.packageCost,
            quantityInPackage: ing.marketPurchase?.quantityInPackage,
            batchSize,
            recipeUnit: ing.recipeConsumption?.unit,
            packageUnit: ing.marketPurchase?.packageUnit || ing.recipeConsumption?.unit
          });
          if (ing.recipeConsumption?.unit) {
            ing.automatedMath.leftoverUnit = ing.recipeConsumption.unit;
          }
        }
      }

      // Recalcular resumen financiero del lote
      const prodFin = calc.computeProductFinancials({
        ingredients: product.ingredients || [],
        batchSize,
        salePrice,
        estimatedMonthlySalesVolume: volume
      });

      product.financialSummary = {
        ...prodFin,
        salePrice
      };
    } else if (product.businessNature === 'servicio') {
      const durationMinutes = calc.parseStrictNumber(product.serviceConfig?.durationMinutes, 0);
      const costPerMinute = calc.parseStrictNumber(product.serviceConfig?.costPerMinute, 0.18);

      // Recalcular cada insumo de servicio
      if (Array.isArray(product.serviceConfig?.supplies)) {
        for (const sup of product.serviceConfig.supplies) {
          sup.unitCost = calc.calculateSupplyUnitCost(sup);
        }
      }

      const servFin = calc.computeServiceFinancials({
        durationMinutes,
        costPerMinute,
        supplies: product.serviceConfig?.supplies || [],
        salePrice,
        estimatedMonthlySalesVolume: volume
      });

      product.financialSummary = {
        totalBatchDirectCost: 0,
        ...servFin
      };
    } else if (product.businessNature === 'comercio') {
      const packagePurchasePrice = calc.parseStrictNumber(product.commerceConfig?.packagePurchasePrice, 0);
      const unitsPerPackage = calc.parseStrictNumber(product.commerceConfig?.unitsPerPackage, 1);
      const freightExpense = calc.parseStrictNumber(product.commerceConfig?.freightExpense, 0);
      const totalItemsInTrip = calc.parseStrictNumber(product.commerceConfig?.totalItemsInTrip, 0);
      const packagingCostPerUnit = calc.parseStrictNumber(product.commerceConfig?.packagingCostPerUnit, 0);

      const commFin = calc.computeCommerceFinancials({
        packagePurchasePrice,
        unitsPerPackage,
        freightExpense,
        totalItemsInTrip,
        packagingCostPerUnit,
        salePrice,
        estimatedMonthlySalesVolume: volume
      });

      product.commerceConfig.baseUnitCost = commFin.baseUnitCost;
      product.commerceConfig.unitFreightCost = commFin.unitFreightCost;
      product.commerceConfig.directCostComercial = commFin.directCostPerUnit;

      product.financialSummary = {
        totalBatchDirectCost: 0,
        ...commFin
      };
    }
  }

  function recalculateSeedCapital() {
    const items = seedCapitalInvestmentPlan.value.investmentItems || [];
    for (const item of items) {
      item.totalPrice = calc.calculateInvestmentItemTotal(item.quantity, item.unitPriceEstimated);
      if (item.financedBySeedCapital === undefined) {
        item.financedBySeedCapital = true;
      }
      if (!item.source) {
        item.source = item.financedBySeedCapital ? 'capital_semilla' : 'propio';
      }
    }
    const evaluated = calc.computeSeedCapitalPlan({
      items,
      ceiling: seedCapitalInvestmentPlan.value.seedCapitalCeiling
    });
    seedCapitalInvestmentPlan.value.totalBusinessInvestment = evaluated.totalBusinessInvestment;
    seedCapitalInvestmentPlan.value.allocatedTotal = evaluated.allocatedTotal;
    seedCapitalInvestmentPlan.value.allocatedSeedCapital = evaluated.allocatedSeedCapital;
    seedCapitalInvestmentPlan.value.remainingBudget = evaluated.remainingBudget;
    seedCapitalInvestmentPlan.value.isBudgetCompliant = evaluated.isBudgetCompliant;
  }

  async function persistState() {
    if (!participantId.value) return;
    try {
      isSaving.value = true;
      const now = new Date().toISOString();
      const cleanData = {
        participantId: String(participantId.value),
        currency: currency.value || 'PEN',
        products: JSON.parse(JSON.stringify(products.value)),
        serviceLaborSettings: JSON.parse(JSON.stringify(serviceLaborSettings.value)),
        seedCapitalInvestmentPlan: JSON.parse(JSON.stringify(seedCapitalInvestmentPlan.value)),
        updatedAt: now
      };

      await saveCostingModule(cleanData);

      // Encolar en cola de sincronización offline
      await enqueueMutation({
        collection: 'costing_module',
        docId: String(participantId.value),
        action: 'SET',
        payload: cleanData
      });
    } catch (err) {
      console.error('[CostingStore] Error al persistir módulo de costeo en IndexedDB:', err);
    } finally {
      isSaving.value = false;
    }
  }

  // --- DATOS INICIALES DEMO CHICLAYO (docs/schema.json) ---
  function getDemoChiclayoData(pId) {
    return {
      participantId: String(pId),
      currency: 'PEN',
      products: [
        {
          productId: 'PROD-001',
          productName: 'Hamburguesa Royal',
          businessNature: 'produccion',
          batchConfig: {
            batchSize: 30,
            batchUnit: 'unidad',
            productionFrequency: 'semanal'
          },
          serviceConfig: {
            durationMinutes: 30,
            costPerMinute: 0.18,
            supplies: []
          },
          commerceConfig: {
            purchasePresentation: 'Docena',
            unitsPerPackage: 12,
            packagePurchasePrice: 60.0,
            freightExpense: 0,
            totalItemsInTrip: 0,
            packagingCostPerUnit: 0.2,
            baseUnitCost: 5.0,
            unitFreightCost: 0,
            directCostComercial: 5.2
          },
          commercialization: {
            currentSalePrice: 7.0,
            estimatedMonthlySalesVolume: 120
          },
          ingredients: [
            {
              ingredientId: 'ING-01',
              name: 'Huevos frescos',
              recipeConsumption: {
                quantityUsed: 30.0,
                unit: 'unidades'
              },
              marketPurchase: {
                packageUnitName: 'jaba',
                quantityInPackage: 32.0,
                packageCost: 12.0
              },
              automatedMath: {
                unitCostFromMarket: 0.375,
                costIncurredInBatch: 11.25,
                unitCostPerProduct: 0.375,
                leftoverQuantityInStock: 2.0,
                leftoverUnit: 'unidades'
              }
            },
            {
              ingredientId: 'ING-02',
              name: 'Pan para hamburguesa',
              recipeConsumption: {
                quantityUsed: 30.0,
                unit: 'unidades'
              },
              marketPurchase: {
                packageUnitName: 'paquete',
                quantityInPackage: 20.0,
                packageCost: 6.0
              },
              automatedMath: {
                unitCostFromMarket: 0.3,
                costIncurredInBatch: 9.0,
                unitCostPerProduct: 0.3,
                leftoverQuantityInStock: 10.0,
                leftoverUnit: 'unidades'
              }
            },
            {
              ingredientId: 'ING-03',
              name: 'Carne molida especial',
              recipeConsumption: {
                quantityUsed: 3.0,
                unit: 'kg'
              },
              marketPurchase: {
                packageUnitName: 'kilo',
                quantityInPackage: 1.0,
                packageCost: 18.0
              },
              automatedMath: {
                unitCostFromMarket: 18.0,
                costIncurredInBatch: 54.0,
                unitCostPerProduct: 1.8,
                leftoverQuantityInStock: 0.0,
                leftoverUnit: 'kg'
              }
            }
          ],
          financialSummary: {
            totalBatchDirectCost: 74.25,
            directCostPerUnit: 2.475,
            grossProfitPerUnit: 4.525,
            grossMarginPercentage: 64.64,
            monthlyGrossProfitEstimate: 543.0
          }
        }
      ],
      seedCapitalInvestmentPlan: {
        seedCapitalCeiling: 3000.0,
        totalBusinessInvestment: 3850.0,
        allocatedTotal: 2850.0,
        allocatedSeedCapital: 2850.0,
        remainingBudget: 150.0,
        isBudgetCompliant: true,
        investmentItems: [
          {
            itemId: 'INV-01',
            category: 'Maquinaria y Equipo',
            description: 'Plancha freidora a gas de 3 quemadores en acero inoxidable',
            quantity: 1,
            unitPriceEstimated: 1400.0,
            totalPrice: 1400.0,
            priority: 'alta',
            financedBySeedCapital: true,
            source: 'capital_semilla'
          },
          {
            itemId: 'INV-02',
            category: 'Insumos y Capital de Trabajo',
            description: 'Stock inicial de carnes, panes, aceites y empaques compostables',
            quantity: 1,
            unitPriceEstimated: 1450.0,
            totalPrice: 1450.0,
            priority: 'alta',
            financedBySeedCapital: true,
            source: 'capital_semilla'
          },
          {
            itemId: 'INV-03',
            category: 'Herramientas',
            description: 'Juego de espátulas, cuchillos y tablas de picar sanitarias',
            quantity: 1,
            unitPriceEstimated: 1000.0,
            totalPrice: 1000.0,
            priority: 'media',
            financedBySeedCapital: false,
            source: 'propio'
          }
        ]
      }
    };
  }

  function getDefaultEmptyData(pId, explicitNature = null) {
    const nature = explicitNature || resolveDefaultNature();
    const defaultProduct = createPolymorphicProduct({
      productId: `PROD-${Date.now()}`,
      businessNature: nature
    });
    resetProductCostingData(defaultProduct, nature);
    recalculateProduct(defaultProduct);

    return {
      participantId: String(pId),
      currency: 'PEN',
      products: [defaultProduct],
      seedCapitalInvestmentPlan: {
        seedCapitalCeiling: 3000.0,
        totalBusinessInvestment: 0.0,
        allocatedTotal: 0.0,
        allocatedSeedCapital: 0.0,
        remainingBudget: 3000.0,
        isBudgetCompliant: true,
        investmentItems: []
      }
    };
  }

  // --- CARGA E HIDRATACIÓN ---

  async function loadCostingData(targetParticipantId) {
    if (!targetParticipantId) return;
    participantId.value = String(targetParticipantId);
    isLoading.value = true;
    error.value = null;

    try {
      let saved = await getCostingModule(participantId.value);
      const s1Nature = resolveDefaultNature();

      if (!saved || !saved.products || saved.products.length === 0) {
        if (participantId.value === '45892134' && s1Nature === 'produccion') {
          saved = getDemoChiclayoData(participantId.value);
        } else {
          saved = getDefaultEmptyData(participantId.value, s1Nature);
        }
        await saveCostingModule(saved);
      } else {
        // Si ya existían datos guardados en IndexedDB:
        // Sincronizar el producto principal con la modalidad de Sesión 1
        if (saved.products.length > 0 && s1Nature) {
          const primary = saved.products[0];
          const isDemoOrPlaceholder = primary.productName === 'Hamburguesa Royal' || primary.productId === 'PROD-001';
          if (primary.businessNature !== s1Nature && (isDemoOrPlaceholder || s1Nature !== 'produccion')) {
            resetProductCostingData(primary, s1Nature);
            await saveCostingModule(saved);
          }
        }
      }

      currency.value = saved.currency || 'PEN';
      products.value = saved.products || [];

      // Recalcular todos los productos para garantizar consistencia
      for (const prod of products.value) {
        recalculateProduct(prod);
      }

      if (saved.serviceLaborSettings) {
        serviceLaborSettings.value = {
          desiredMonthlySalary: calc.parseStrictNumber(saved.serviceLaborSettings.desiredMonthlySalary, 1200),
          daysWorkedPerMonth: calc.parseStrictNumber(saved.serviceLaborSettings.daysWorkedPerMonth, 25),
          hoursWorkedPerDay: calc.parseStrictNumber(saved.serviceLaborSettings.hoursWorkedPerDay, 8),
          monthlyHoursWorked: calc.parseStrictNumber(saved.serviceLaborSettings.monthlyHoursWorked, 200),
          costPerMinute: calc.parseStrictNumber(saved.serviceLaborSettings.costPerMinute, 0.10),
          isConfigured: !!saved.serviceLaborSettings.isConfigured
        };
      } else {
        const authStore = useAuthStore();
        const partSettings = authStore.currentParticipant?.businessBasicInfo?.serviceLaborSettings;
        if (partSettings) {
          serviceLaborSettings.value = { ...partSettings };
        }
      }

      // Sincronizar techo de capital semilla de la cohorte del participante
      const authStore = useAuthStore();
      let cohortCeiling = 3000;
      const participantCohortId = authStore.currentParticipant?.cohortId;
      if (participantCohortId && authStore.resolveParticipantCohortCeiling) {
        cohortCeiling = await authStore.resolveParticipantCohortCeiling(participantCohortId);
      } else if (saved.seedCapitalInvestmentPlan?.seedCapitalCeiling) {
        cohortCeiling = calc.parseStrictNumber(saved.seedCapitalInvestmentPlan.seedCapitalCeiling, 3000);
      }

      if (saved.seedCapitalInvestmentPlan) {
        seedCapitalInvestmentPlan.value = {
          seedCapitalCeiling: cohortCeiling,
          totalBusinessInvestment: calc.parseStrictNumber(saved.seedCapitalInvestmentPlan.totalBusinessInvestment, 0),
          allocatedTotal: calc.parseStrictNumber(saved.seedCapitalInvestmentPlan.allocatedTotal, 0),
          allocatedSeedCapital: calc.parseStrictNumber(saved.seedCapitalInvestmentPlan.allocatedSeedCapital ?? saved.seedCapitalInvestmentPlan.allocatedTotal, 0),
          remainingBudget: calc.parseStrictNumber(saved.seedCapitalInvestmentPlan.remainingBudget, cohortCeiling),
          isBudgetCompliant: saved.seedCapitalInvestmentPlan.isBudgetCompliant ?? true,
          investmentItems: saved.seedCapitalInvestmentPlan.investmentItems || [],
          audit: saved.seedCapitalInvestmentPlan.audit || null
        };
        recalculateSeedCapital();
      } else {
        seedCapitalInvestmentPlan.value.seedCapitalCeiling = cohortCeiling;
        seedCapitalInvestmentPlan.value.audit = null;
        recalculateSeedCapital();
      }

      if (products.value.length > 0) {
        activeProductId.value = products.value[0].productId;
      }
    } catch (err) {
      console.error('[CostingStore] Error al cargar módulo de costeo:', err);
      error.value = 'No se pudo cargar la información de costos.';
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Inicia escucha en tiempo real del módulo de costeo e inversión en Firestore.
   * Si el facilitador realiza un cambio en Sesión 6 o Sesión 7, la mutación se refleja
   * de forma reactiva instantánea en Pinia y se persiste en IndexedDB para disponibilidad offline.
   */
  function startParticipantCostingListener(dni) {
    if (!dni || activeCostingListenerDni.value === String(dni)) return;
    if (unsubParticipantCosting) {
      unsubParticipantCosting();
      unsubParticipantCosting = null;
    }

    activeCostingListenerDni.value = String(dni);

    unsubParticipantCosting = listenParticipantCostingModule(
      dni,
      async (remoteDoc) => {
        if (!remoteDoc) return;

        let hasChanges = false;
        let cohortCeiling = seedCapitalCeiling.value || 3000;
        try {
          const authStore = useAuthStore();
          const participantCohortId = authStore.currentParticipant?.cohortId;
          if (participantCohortId && authStore.resolveParticipantCohortCeiling) {
            cohortCeiling = await authStore.resolveParticipantCohortCeiling(participantCohortId);
          }
        } catch (e) {
          // Si authStore aún no está listo
        }

        // 1. Sincronizar productos si vienen en el snapshot remoto
        if (Array.isArray(remoteDoc.products) && remoteDoc.products.length > 0) {
          products.value = remoteDoc.products;
          for (const prod of products.value) {
            recalculateProduct(prod);
          }
          hasChanges = true;
        }

        // 2. Sincronizar serviceLaborSettings si viene
        if (remoteDoc.serviceLaborSettings) {
          serviceLaborSettings.value = {
            desiredMonthlySalary: calc.parseStrictNumber(remoteDoc.serviceLaborSettings.desiredMonthlySalary, 1200),
            daysWorkedPerMonth: calc.parseStrictNumber(remoteDoc.serviceLaborSettings.daysWorkedPerMonth, 25),
            hoursWorkedPerDay: calc.parseStrictNumber(remoteDoc.serviceLaborSettings.hoursWorkedPerDay, 8),
            monthlyHoursWorked: calc.parseStrictNumber(remoteDoc.serviceLaborSettings.monthlyHoursWorked, 200),
            costPerMinute: calc.parseStrictNumber(remoteDoc.serviceLaborSettings.costPerMinute, 0.10),
            isConfigured: !!remoteDoc.serviceLaborSettings.isConfigured
          };
          hasChanges = true;
        }

        // 3. Sincronizar seedCapitalInvestmentPlan (Sesión 7)
        if (remoteDoc.seedCapitalInvestmentPlan) {
          const remotePlan = remoteDoc.seedCapitalInvestmentPlan;
          const targetCeiling = calc.parseStrictNumber(remotePlan.seedCapitalCeiling, cohortCeiling);

          seedCapitalInvestmentPlan.value = {
            seedCapitalCeiling: targetCeiling,
            totalBusinessInvestment: calc.parseStrictNumber(remotePlan.totalBusinessInvestment, 0),
            allocatedTotal: calc.parseStrictNumber(remotePlan.allocatedTotal, 0),
            allocatedSeedCapital: calc.parseStrictNumber(remotePlan.allocatedSeedCapital ?? remotePlan.allocatedTotal, 0),
            remainingBudget: calc.parseStrictNumber(remotePlan.remainingBudget, targetCeiling),
            isBudgetCompliant: remotePlan.isBudgetCompliant ?? true,
            investmentItems: Array.isArray(remotePlan.investmentItems) ? remotePlan.investmentItems : [],
            audit: remotePlan.audit || null
          };

          recalculateSeedCapital();
          hasChanges = true;

          // Notificación amigable al usuario si fue modificado por el facilitador
          if (remotePlan.audit?.lastModifiedBy?.role === 'facilitator') {
            facilitatorUpdateNotice.value = {
              message: remotePlan.audit.reviewStatus === 'aprobado'
                ? '¡Tu presupuesto ha sido aprobado por el facilitador!'
                : 'El facilitador ha ajustado tu presupuesto en la mesa técnica.',
              author: remotePlan.audit.lastModifiedBy.displayName || remotePlan.audit.lastModifiedBy.email || 'Facilitador',
              timestamp: remotePlan.audit.lastModifiedAt || new Date().toISOString(),
              status: remotePlan.audit.reviewStatus
            };
          }
        }

        // 4. Persistir en IndexedDB local para garantizar coherencia offline
        if (hasChanges) {
          try {
            const cleanData = {
              participantId: String(dni),
              currency: currency.value || 'PEN',
              products: JSON.parse(JSON.stringify(products.value)),
              serviceLaborSettings: JSON.parse(JSON.stringify(serviceLaborSettings.value)),
              seedCapitalInvestmentPlan: JSON.parse(JSON.stringify(seedCapitalInvestmentPlan.value)),
              updatedAt: remoteDoc.updatedAt || new Date().toISOString()
            };
            await saveCostingModule(cleanData);
          } catch (dbErr) {
            console.warn('[CostingStore] Error persistiendo snapshot remoto en IndexedDB:', dbErr);
          }
        }
      },
      (err) => {
        console.warn('[CostingStore] Error en listener en tiempo real de costing_module:', err);
      }
    );
  }

  function stopParticipantCostingListener() {
    if (unsubParticipantCosting) {
      unsubParticipantCosting();
      unsubParticipantCosting = null;
    }
    activeCostingListenerDni.value = null;
  }


  // --- ACCIONES DE PRODUCTOS ---

  async function addProduct(productName = '') {
    if (products.value.length >= 5) {
      return { success: false, message: 'Se permite registrar hasta 5 productos principales.' };
    }

    const defaultNature = resolveDefaultNature();
    const newProdNumber = products.value.length + 1;

    const newProd = createPolymorphicProduct({
      productId: `PROD-${Date.now()}`,
      productName: productName.trim() || `Producto ${newProdNumber}`,
      businessNature: defaultNature,
      salePrice: 0,
      estimatedMonthlySalesVolume: 0
    });

    resetProductCostingData(newProd, defaultNature);
    recalculateProduct(newProd);
    products.value.push(newProd);
    activeProductId.value = newProd.productId;

    await persistState();
    return { success: true, product: newProd };
  }

  async function setProductNature(prodId, nature) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod || !['produccion', 'servicio', 'comercio'].includes(nature)) return;

    // AUTOMÁTICAMENTE BORRAR LOS DATOS PREVIOS DEL MÓDULO DE COSTEO PARA ESTE PRODUCTO
    resetProductCostingData(prod, nature);
    recalculateProduct(prod);

    // Sincronización bidireccional con Sesión 1 si es el producto principal
    const isPrimary = products.value.length > 0 && products.value[0].productId === prodId;
    if (isPrimary) {
      await syncBackToSession1(nature);
    }

    await persistState();
  }

  async function applyBusinessNatureFromS1(nature) {
    if (!['produccion', 'servicio', 'comercio'].includes(nature)) return;

    if (!products.value || products.value.length === 0) {
      const authStore = useAuthStore();
      const targetId = participantId.value || authStore.currentParticipant?.dni;
      if (targetId) {
        await loadCostingData(targetId);
      }
    }

    if (products.value && products.value.length > 0) {
      let anyChanged = false;
      for (const prod of products.value) {
        if (prod.businessNature !== nature) {
          resetProductCostingData(prod, nature);
          recalculateProduct(prod);
          anyChanged = true;
        }
      }
      if (anyChanged) {
        await persistState();
      }
    } else {
      const defaultProduct = createPolymorphicProduct({
        productId: `PROD-${Date.now()}`,
        businessNature: nature
      });
      resetProductCostingData(defaultProduct, nature);
      recalculateProduct(defaultProduct);
      products.value = [defaultProduct];
      activeProductId.value = defaultProduct.productId;
      await persistState();
    }
  }

  async function updateServiceLaborSettings(settings = {}) {
    const salary = Math.max(0, calc.parseStrictNumber(settings.desiredMonthlySalary, 1200));
    const days = Math.max(1, Math.min(31, calc.parseStrictNumber(settings.daysWorkedPerMonth, 25)));
    const dailyHours = Math.max(1, Math.min(24, calc.parseStrictNumber(settings.hoursWorkedPerDay, 8)));
    const totalHours = days * dailyHours;
    const costPerMin = calc.calculateLaborCostPerMinute({
      desiredMonthlySalary: salary,
      daysWorkedPerMonth: days,
      hoursWorkedPerDay: dailyHours
    });

    serviceLaborSettings.value = {
      desiredMonthlySalary: salary,
      daysWorkedPerMonth: days,
      hoursWorkedPerDay: dailyHours,
      monthlyHoursWorked: totalHours,
      costPerMinute: costPerMin,
      isConfigured: true
    };

    // Actualizar todos los productos de servicio existentes con el nuevo costo por minuto
    for (const prod of products.value) {
      if (prod.businessNature === 'servicio') {
        if (!prod.serviceConfig) prod.serviceConfig = {};
        prod.serviceConfig.costPerMinute = costPerMin;
        recalculateProduct(prod);
      }
    }

    // Persistir en participante para disponibilidad offline
    try {
      const authStore = useAuthStore();
      if (authStore.currentParticipant) {
        if (!authStore.currentParticipant.businessBasicInfo) {
          authStore.currentParticipant.businessBasicInfo = {};
        }
        authStore.currentParticipant.businessBasicInfo.serviceLaborSettings = {
          ...serviceLaborSettings.value
        };
        const { saveParticipant } = await import('@/services/db/indexedDB');
        await saveParticipant(authStore.currentParticipant);
      }
    } catch (e) {
      console.warn('[CostingStore] Error persistiendo serviceLaborSettings en participante:', e);
    }

    await persistState();
    return { success: true, serviceLaborSettings: serviceLaborSettings.value };
  }

  async function updateProductCommerce(prodId, config) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod) return;

    if (!prod.commerceConfig) prod.commerceConfig = {};

    if (config.productName !== undefined) prod.productName = config.productName;
    if (config.purchasePresentation !== undefined) prod.commerceConfig.purchasePresentation = config.purchasePresentation;
    if (config.unitsPerPackage !== undefined) {
      prod.commerceConfig.unitsPerPackage = Math.max(1, calc.parseStrictNumber(config.unitsPerPackage, 1));
    }
    if (config.packagePurchasePrice !== undefined) {
      prod.commerceConfig.packagePurchasePrice = Math.max(0, calc.parseStrictNumber(config.packagePurchasePrice, 0));
    }
    if (config.freightExpense !== undefined) {
      prod.commerceConfig.freightExpense = Math.max(0, calc.parseStrictNumber(config.freightExpense, 0));
    }
    if (config.totalItemsInTrip !== undefined) {
      prod.commerceConfig.totalItemsInTrip = Math.max(0, calc.parseStrictNumber(config.totalItemsInTrip, 0));
    }
    if (config.packagingCostPerUnit !== undefined) {
      prod.commerceConfig.packagingCostPerUnit = Math.max(0, calc.parseStrictNumber(config.packagingCostPerUnit, 0));
    }

    if (config.currentSalePrice !== undefined) {
      prod.commercialization.currentSalePrice = Math.max(0, calc.parseStrictNumber(config.currentSalePrice, 0));
    }
    if (config.estimatedMonthlySalesVolume !== undefined) {
      prod.commercialization.estimatedMonthlySalesVolume = Math.max(
        0,
        calc.parseStrictNumber(config.estimatedMonthlySalesVolume, 0)
      );
    }

    recalculateProduct(prod);
    await persistState();
  }

  async function updateProductService(prodId, config) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod) return;

    if (!prod.serviceConfig) prod.serviceConfig = {};

    if (config.productName !== undefined) prod.productName = config.productName;
    if (config.durationMinutes !== undefined) {
      prod.serviceConfig.durationMinutes = Math.max(1, calc.parseStrictNumber(config.durationMinutes, 1));
    }
    if (config.costPerMinute !== undefined) {
      prod.serviceConfig.costPerMinute = Math.max(0, calc.parseStrictNumber(config.costPerMinute, 0.18));
    }

    if (config.currentSalePrice !== undefined) {
      prod.commercialization.currentSalePrice = Math.max(0, calc.parseStrictNumber(config.currentSalePrice, 0));
    }
    if (config.estimatedMonthlySalesVolume !== undefined) {
      prod.commercialization.estimatedMonthlySalesVolume = Math.max(
        0,
        calc.parseStrictNumber(config.estimatedMonthlySalesVolume, 0)
      );
    }

    recalculateProduct(prod);
    await persistState();
  }

  async function addServiceSupply(prodId, supplyData) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod) return { success: false, message: 'Producto no encontrado.' };

    if (!prod.serviceConfig) prod.serviceConfig = { durationMinutes: 45, costPerMinute: 0.18, supplies: [] };
    if (!Array.isArray(prod.serviceConfig.supplies)) prod.serviceConfig.supplies = [];

    const supplyType = supplyData.supplyType || 'single_use';
    const packageCost = Math.max(0, calc.parseStrictNumber(supplyData.packageCost, 0));
    const unitsInPackage = Math.max(1, calc.parseStrictNumber(supplyData.unitsInPackage, 1));
    const clientsYield = Math.max(1, calc.parseStrictNumber(supplyData.clientsYield, 1));

    const newSupply = {
      id: `SUP-${Date.now()}`,
      name: supplyData.name?.trim() || 'Insumo de Servicio',
      supplyType,
      packageCost,
      unitsInPackage,
      clientsYield,
      unitCost: calc.calculateSupplyUnitCost({ supplyType, packageCost, unitsInPackage, clientsYield })
    };

    prod.serviceConfig.supplies.push(newSupply);
    recalculateProduct(prod);
    await persistState();
    return { success: true, supply: newSupply };
  }

  async function updateServiceSupply(prodId, supplyId, updateData) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod || !prod.serviceConfig?.supplies) return;

    const sup = prod.serviceConfig.supplies.find((s) => s.id === supplyId);
    if (!sup) return;

    if (updateData.name !== undefined) sup.name = updateData.name.trim();
    if (updateData.supplyType !== undefined) sup.supplyType = updateData.supplyType;
    if (updateData.packageCost !== undefined) {
      sup.packageCost = Math.max(0, calc.parseStrictNumber(updateData.packageCost, 0));
    }
    if (updateData.unitsInPackage !== undefined) {
      sup.unitsInPackage = Math.max(1, calc.parseStrictNumber(updateData.unitsInPackage, 1));
    }
    if (updateData.clientsYield !== undefined) {
      sup.clientsYield = Math.max(1, calc.parseStrictNumber(updateData.clientsYield, 1));
    }

    sup.unitCost = calc.calculateSupplyUnitCost(sup);
    recalculateProduct(prod);
    await persistState();
  }

  async function removeServiceSupply(prodId, supplyId) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod || !prod.serviceConfig?.supplies) return;

    prod.serviceConfig.supplies = prod.serviceConfig.supplies.filter((s) => s.id !== supplyId);
    recalculateProduct(prod);
    await persistState();
  }

  async function updateProductBatch(prodId, config) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod) return;

    if (config.productName !== undefined) prod.productName = config.productName;

    if (config.batchSize !== undefined) {
      prod.batchConfig.batchSize = Math.max(1, Math.round(calc.parseStrictNumber(config.batchSize, 1)));
    }
    if (config.batchUnit !== undefined) {
      prod.batchConfig.batchUnit = config.batchUnit || 'unidades';
    }
    if (config.productionFrequency !== undefined) {
      prod.batchConfig.productionFrequency = config.productionFrequency;
      prod.batchConfig.batchesPerMonth = config.batchesPerMonth !== undefined
        ? calc.parseStrictNumber(config.batchesPerMonth, calc.calculateBatchesPerMonth(config.productionFrequency))
        : calc.calculateBatchesPerMonth(config.productionFrequency);
    } else if (config.batchesPerMonth !== undefined) {
      prod.batchConfig.batchesPerMonth = Math.max(1, calc.parseStrictNumber(config.batchesPerMonth, 4));
    }

    if (config.targetCoverageWeeks !== undefined) {
      prod.commercialization.targetCoverageWeeks = Math.max(1, calc.parseStrictNumber(config.targetCoverageWeeks, 4));
    }

    if (config.currentSalePrice !== undefined) {
      prod.commercialization.currentSalePrice = Math.max(0, calc.parseStrictNumber(config.currentSalePrice, 0));
    }
    if (config.estimatedMonthlySalesVolume !== undefined) {
      prod.commercialization.estimatedMonthlySalesVolume = Math.max(
        0,
        calc.parseStrictNumber(config.estimatedMonthlySalesVolume, 0)
      );
    }

    recalculateProduct(prod);
    await persistState();
  }

  async function removeProduct(prodId) {
    if (products.value.length <= 1) {
      return { success: false, message: 'Debes mantener al menos un producto registrado.' };
    }

    products.value = products.value.filter((p) => p.productId !== prodId);
    if (activeProductId.value === prodId) {
      activeProductId.value = products.value[0]?.productId || null;
    }

    await persistState();
    return { success: true };
  }

  function setActiveProduct(prodId) {
    if (products.value.some((p) => p.productId === prodId)) {
      activeProductId.value = prodId;
    }
  }

  // --- ACCIONES DE INGREDIENTES ---

  async function addIngredient(prodId, ingredientData) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod) return { success: false, message: 'Producto no encontrado.' };

    const batchSize = calc.parseStrictNumber(prod.batchConfig?.batchSize, 1);
    const quantityUsed = calc.parseStrictNumber(ingredientData.quantityUsed, 1);
    const packageCost = calc.parseStrictNumber(ingredientData.packageCost, 0);
    const quantityInPackage = calc.parseStrictNumber(ingredientData.quantityInPackage, 1);
    const unit = ingredientData.unit || 'unidades';
    const packageUnit = ingredientData.packageUnit || unit;

    const automatedMath = calc.computeIngredientMath({
      quantityUsed,
      packageCost,
      quantityInPackage,
      batchSize,
      recipeUnit: unit,
      packageUnit
    });
    automatedMath.leftoverUnit = unit;

    const newIngredient = {
      ingredientId: `ING-${Date.now()}`,
      name: ingredientData.name?.trim() || 'Nuevo Insumo',
      recipeConsumption: {
        quantityUsed,
        unit
      },
      marketPurchase: {
        packageUnitName: ingredientData.packageUnitName || 'paquete',
        packageUnit,
        quantityInPackage,
        packageCost
      },
      automatedMath
    };

    if (!prod.ingredients) prod.ingredients = [];
    prod.ingredients.push(newIngredient);

    recalculateProduct(prod);
    await persistState();
    return { success: true, ingredient: newIngredient };
  }

  async function updateIngredient(prodId, ingredientId, updateData) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod) return;

    const ing = prod.ingredients?.find((i) => i.ingredientId === ingredientId);
    if (!ing) return;

    if (updateData.name !== undefined) ing.name = updateData.name.trim();

    if (updateData.quantityUsed !== undefined) {
      ing.recipeConsumption.quantityUsed = Math.max(0.001, calc.parseStrictNumber(updateData.quantityUsed, 1));
    }
    if (updateData.unit !== undefined) {
      ing.recipeConsumption.unit = updateData.unit;
    }

    if (updateData.packageUnitName !== undefined) {
      ing.marketPurchase.packageUnitName = updateData.packageUnitName;
    }
    if (updateData.packageUnit !== undefined) {
      ing.marketPurchase.packageUnit = updateData.packageUnit;
    }
    if (updateData.quantityInPackage !== undefined) {
      ing.marketPurchase.quantityInPackage = Math.max(0.001, calc.parseStrictNumber(updateData.quantityInPackage, 1));
    }
    if (updateData.packageCost !== undefined) {
      ing.marketPurchase.packageCost = Math.max(0, calc.parseStrictNumber(updateData.packageCost, 0));
    }

    recalculateProduct(prod);
    await persistState();
  }

  async function removeIngredient(prodId, ingredientId) {
    const prod = products.value.find((p) => p.productId === prodId);
    if (!prod || !prod.ingredients) return;

    prod.ingredients = prod.ingredients.filter((i) => i.ingredientId !== ingredientId);
    recalculateProduct(prod);
    await persistState();
  }

  // --- ACCIONES DE CAPITAL SEMILLA (SESIÓN 7) ---

  async function setSeedCapitalCeiling(amount) {
    const ceiling = Math.max(0, calc.parseStrictNumber(amount, 3000));
    seedCapitalInvestmentPlan.value.seedCapitalCeiling = ceiling;
    recalculateSeedCapital();
    await persistState();
  }

  async function addInvestmentItem(itemData) {
    const quantity = Math.max(1, Math.round(calc.parseStrictNumber(itemData.quantity, 1)));
    const unitPriceEstimated = Math.max(0, calc.parseStrictNumber(itemData.unitPriceEstimated, 0));
    const totalPrice = calc.calculateInvestmentItemTotal(quantity, unitPriceEstimated);
    const financedBySeedCapital = itemData.financedBySeedCapital !== false;
    const source = itemData.source || (financedBySeedCapital ? 'capital_semilla' : 'propio');

    const rubro = itemData.rubro || (
      itemData.category === 'Insumos y Capital de Trabajo'
        ? 'rubro_b'
        : (itemData.category === 'Maquinaria y Equipo' || itemData.category === 'Herramientas'
          ? 'rubro_a'
          : 'rubro_c')
    );

    const newItem = {
      itemId: `INV-${Date.now()}`,
      category: itemData.category || 'Maquinaria y Equipo',
      rubro,
      description: itemData.description?.trim() || 'Ítem de inversión',
      quantity,
      unit: itemData.unit || 'unidad',
      unitPriceEstimated,
      totalPrice,
      priority: itemData.priority || 'alta',
      financedBySeedCapital,
      source,
      isAutoDerivedFromS6: !!itemData.isAutoDerivedFromS6,
      isLaborContribution: !!itemData.isLaborContribution
    };

    if (!seedCapitalInvestmentPlan.value.investmentItems) {
      seedCapitalInvestmentPlan.value.investmentItems = [];
    }

    seedCapitalInvestmentPlan.value.investmentItems.push(newItem);
    recalculateSeedCapital();
    await persistState();
    return { success: true, item: newItem };
  }

  async function updateInvestmentItem(itemId, updateData) {
    const items = seedCapitalInvestmentPlan.value.investmentItems || [];
    const item = items.find((i) => i.itemId === itemId);
    if (!item) return;

    if (updateData.category !== undefined) item.category = updateData.category;
    if (updateData.rubro !== undefined) item.rubro = updateData.rubro;
    if (updateData.description !== undefined) item.description = updateData.description.trim();
    if (updateData.priority !== undefined) item.priority = updateData.priority;

    if (updateData.quantity !== undefined) {
      item.quantity = Math.max(1, Math.round(calc.parseStrictNumber(updateData.quantity, 1)));
    }
    if (updateData.unitPriceEstimated !== undefined) {
      item.unitPriceEstimated = Math.max(0, calc.parseStrictNumber(updateData.unitPriceEstimated, 0));
    }

    if (updateData.financedBySeedCapital !== undefined) {
      item.financedBySeedCapital = !!updateData.financedBySeedCapital;
      item.source = item.financedBySeedCapital ? 'capital_semilla' : 'propio';
    }
    if (updateData.source !== undefined) {
      item.source = updateData.source;
      item.financedBySeedCapital = item.source === 'capital_semilla';
    }

    item.totalPrice = calc.calculateInvestmentItemTotal(item.quantity, item.unitPriceEstimated);

    recalculateSeedCapital();
    await persistState();
  }

  async function toggleItemFinancing(itemId, financed = null) {
    if (!seedCapitalInvestmentPlan.value.investmentItems) return;
    const item = seedCapitalInvestmentPlan.value.investmentItems.find((i) => i.itemId === itemId);
    if (!item) return;

    // Si es aporte propio de mano de obra, nunca puede cargarse a la donación
    if (item.isLaborContribution) {
      item.financedBySeedCapital = false;
      item.source = 'propio';
      recalculateSeedCapital();
      await persistState();
      return;
    }

    const nextVal = financed !== null ? !!financed : !item.financedBySeedCapital;
    item.financedBySeedCapital = nextVal;
    item.source = nextVal ? 'capital_semilla' : 'propio';

    recalculateSeedCapital();
    await persistState();
  }

  async function syncWorkingCapitalToInvestmentPlan() {
    if (!seedCapitalInvestmentPlan.value.investmentItems) {
      seedCapitalInvestmentPlan.value.investmentItems = [];
    }

    const workingCapRequirements = calc.getMonthlyWorkingCapitalRequirements({
      products: products.value,
      serviceLaborSettings: serviceLaborSettings.value
    });

    const nature = resolveDefaultNature();
    const laborValue = calc.calculateProjectedMonthlyLaborValue({
      businessNature: nature,
      serviceLaborSettings: serviceLaborSettings.value,
      products: products.value
    });

    // Separar ítems manuales (Rubro A y acondicionamiento manual de Rubro C)
    const existingItems = seedCapitalInvestmentPlan.value.investmentItems;
    const manualItems = existingItems.filter((i) => !i.isAutoDerivedFromS6 && !i.isLaborContribution);

    // Recordar decisiones de financiamiento previas para insumos derivados
    const prevAutoFinancingMap = new Map();
    for (const item of existingItems) {
      if (item.isAutoDerivedFromS6 && item.itemId) {
        prevAutoFinancingMap.set(item.itemId, item.financedBySeedCapital);
      }
    }

    // Actualizar o generar ítems de Rubro B
    const updatedRubroBItems = workingCapRequirements.map((req) => {
      const prevFinanced = prevAutoFinancingMap.get(req.itemId);
      const financed = prevFinanced !== undefined ? prevFinanced : req.financedBySeedCapital;
      return {
        ...req,
        financedBySeedCapital: financed,
        source: financed ? 'capital_semilla' : 'propio'
      };
    });

    // Ítem de Mano de Obra Propia en Rubro C (aporte propio)
    const laborItem = {
      itemId: `LABOR-CONTRIB-${participantId.value || 'PART'}`,
      category: 'Mano de Obra Propia',
      rubro: 'rubro_c',
      description: 'Mano de obra y dedicación del emprendedor (1 mes de arranque)',
      quantity: 1,
      unit: 'mes',
      unitPriceEstimated: laborValue,
      totalPrice: laborValue,
      priority: 'media',
      financedBySeedCapital: false,
      source: 'propio',
      isAutoDerivedFromS6: true,
      isLaborContribution: true
    };

    seedCapitalInvestmentPlan.value.investmentItems = [
      ...manualItems,
      ...updatedRubroBItems,
      laborItem
    ];

    recalculateSeedCapital();
    await persistState();

    return {
      success: true,
      rubroBCount: updatedRubroBItems.length,
      laborValue
    };
  }

  async function removeInvestmentItem(itemId) {
    if (!seedCapitalInvestmentPlan.value.investmentItems) return;
    seedCapitalInvestmentPlan.value.investmentItems = seedCapitalInvestmentPlan.value.investmentItems.filter(
      (i) => i.itemId !== itemId
    );
    recalculateSeedCapital();
    await persistState();
  }

  return {
    participantId,
    currency,
    products,
    activeProductId,
    activeProduct,
    totalProductsCount,
    canAddMoreProducts,
    seedCapitalInvestmentPlan,
    seedCapitalCeiling,
    totalBusinessInvestment,
    allocatedTotal,
    allocatedSeedCapital,
    remainingBudget,
    isBudgetCompliant,
    investmentItems,
    rubroAItems,
    rubroBItems,
    rubroCItems,
    ownContribution,
    rubrosBreakdown,
    isLoading,
    isSaving,
    error,
    loadCostingData,
    addProduct,
    setProductNature,
    resetProductCostingData,
    applyBusinessNatureFromS1,
    serviceLaborSettings,
    updateServiceLaborSettings,
    updateProductBatch,
    updateProductCommerce,
    updateProductService,
    addServiceSupply,
    updateServiceSupply,
    removeServiceSupply,
    removeProduct,
    setActiveProduct,
    addIngredient,
    updateIngredient,
    removeIngredient,
    setSeedCapitalCeiling,
    addInvestmentItem,
    updateInvestmentItem,
    removeInvestmentItem,
    toggleItemFinancing,
    syncWorkingCapitalToInvestmentPlan,
    startParticipantCostingListener,
    stopParticipantCostingListener,
    facilitatorUpdateNotice
  };
});

