/**
 * Composable con funciones puras y reactivas para cálculos de costos directos
 * ("La Casera vs. El Plato") y presupuesto de Capital Semilla.
 *
 * Evita errores de redondeo de punto flotante respetando las especificaciones
 * de docs/schema.json y docs/PRD.md.
 */

export function useCostingCalculator() {
  /**
   * Redondeo numérico seguro para evitar anomalías de punto flotante (ej. 0.1 + 0.2)
   */
  function roundDecimals(val, decimals = 2) {
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  /**
   * Formatea un número a moneda peruana (por defecto Soles: S/ 0.00)
   */
  function formatMoney(amount, currency = 'S/') {
    const num = Number(amount);
    if (isNaN(num) || !isFinite(num)) return `${currency} 0.00`;
    return `${currency} ${num.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  /**
   * Formatea un porcentaje (ej. 64.64 -> '64.6%')
   */
  function formatPercent(value, decimals = 1) {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return '0.0%';
    return `${roundDecimals(num, decimals).toFixed(decimals)}%`;
  }

  /**
   * Valida si un valor es un número estrictamente mayor que cero
   */
  function isValidPositiveNumber(val) {
    const num = Number(val);
    return typeof num === 'number' && !isNaN(num) && isFinite(num) && num > 0;
  }

  /**
   * Convierte un valor de input a número seguro con fallback
   */
  function parseStrictNumber(val, defaultVal = 0) {
    if (val === '' || val === null || val === undefined) return defaultVal;
    const num = Number(val);
    return isNaN(num) || !isFinite(num) ? defaultVal : num;
  }

  /**
   * Calcula el costo unitario de compra en el mercado (La Casera)
   * unitCostFromMarket = packageCost / quantityInPackage
   */
  function calculateUnitCostFromMarket(packageCost, quantityInPackage) {
    const cost = parseStrictNumber(packageCost);
    const qty = parseStrictNumber(quantityInPackage);
    if (qty <= 0 || cost < 0) return 0;
    return roundDecimals(cost / qty, 3);
  }

  /**
   * Calcula el costo consumido en la tanda de producción (El Plato)
   * costIncurredInBatch = quantityUsed * unitCostFromMarket
   */
  function calculateCostIncurred(quantityUsed, unitCostFromMarket) {
    const used = parseStrictNumber(quantityUsed);
    const unitCost = parseStrictNumber(unitCostFromMarket);
    if (used <= 0 || unitCost <= 0) return 0;
    return roundDecimals(used * unitCost, 2);
  }

  /**
   * Obtiene el factor multiplicador para convertir de una unidad a otra
   * (ej. 250 gr a kg -> factor 0.001; 500 ml a L -> factor 0.001)
   */
  function getUnitConversionFactor(fromUnit, toUnit) {
    if (!fromUnit || !toUnit) return 1;
    const f = String(fromUnit).toLowerCase().trim();
    const t = String(toUnit).toLowerCase().trim();
    if (f === t) return 1;

    // Gramos a Kilos
    if ((f === 'gr' || f === 'g' || f === 'gramos') && (t === 'kg' || t === 'kilos' || t === 'kilo')) return 0.001;
    // Kilos a Gramos
    if ((f === 'kg' || f === 'kilos' || f === 'kilo') && (t === 'gr' || t === 'g' || t === 'gramos')) return 1000;

    // Mililitros a Litros
    if ((f === 'ml' || f === 'mililitros') && (t === 'l' || t === 'litros' || t === 'litro')) return 0.001;
    // Litros a Mililitros
    if ((f === 'l' || f === 'litros' || f === 'litro') && (t === 'ml' || t === 'mililitros')) return 1000;

    return 1;
  }

  /**
   * Calcula el insumo sobrante que queda en stock para próximas tandas
   * leftoverStock = quantityInPackage - (quantityUsed % quantityInPackage)
   * (con salvaguarda cuando el residuo es 0 para indicar 0 sobrante)
   */
  function calculateLeftoverStock(quantityUsed, quantityInPackage) {
    const used = parseStrictNumber(quantityUsed);
    const pkg = parseStrictNumber(quantityInPackage);
    if (used <= 0 || pkg <= 0) return 0;

    const remainder = roundDecimals(used % pkg, 4);
    if (remainder === 0) return 0;
    return roundDecimals(pkg - remainder, 3);
  }

  /**
   * Calcula las métricas automáticas completas para un ingrediente individual
   * Soportando opcionalmente conversión matemática de unidades (ej. gr en receta vs kg en compra)
   */
  function computeIngredientMath({
    quantityUsed,
    packageCost,
    quantityInPackage,
    batchSize = 1,
    recipeUnit = null,
    packageUnit = null
  }) {
    const factor = getUnitConversionFactor(recipeUnit, packageUnit);
    const usedInPkgUnit = parseStrictNumber(quantityUsed) * factor;
    const unitCostFromMarket = calculateUnitCostFromMarket(packageCost, quantityInPackage);
    const costIncurredInBatch = calculateCostIncurred(usedInPkgUnit, unitCostFromMarket);
    const safeBatchSize = parseStrictNumber(batchSize, 1) > 0 ? parseStrictNumber(batchSize, 1) : 1;
    const unitCostPerProduct = roundDecimals(costIncurredInBatch / safeBatchSize, 3);
    const leftoverQuantityInPkgUnit = calculateLeftoverStock(usedInPkgUnit, quantityInPackage);
    const leftoverQuantityInStock = factor !== 1 && factor > 0
      ? roundDecimals(leftoverQuantityInPkgUnit / factor, 2)
      : leftoverQuantityInPkgUnit;

    return {
      unitCostFromMarket,
      costIncurredInBatch,
      unitCostPerProduct,
      leftoverQuantityInStock,
      conversionFactor: factor
    };
  }

  /**
   * Calcula el costo directo total de la tanda sumando todos los insumos
   */
  function calculateTotalBatchDirectCost(ingredients = []) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) return 0;
    const total = ingredients.reduce((acc, ing) => {
      const cost = ing.automatedMath?.costIncurredInBatch ?? 0;
      return acc + parseStrictNumber(cost);
    }, 0);
    return roundDecimals(total, 2);
  }

  /**
   * Calcula el costo unitario por producto terminado
   * directCostPerUnit = sum(costIncurredInBatch) / batchSize
   */
  function calculateDirectCostPerUnit(totalBatchDirectCost, batchSize) {
    const total = parseStrictNumber(totalBatchDirectCost);
    const size = parseStrictNumber(batchSize);
    if (size <= 0 || total < 0) return 0;
    return roundDecimals(total / size, 3);
  }

  /**
   * Calcula la ganancia bruta por unidad
   * grossProfitPerUnit = salePrice - directCostPerUnit
   */
  function calculateGrossProfit(salePrice, directCostPerUnit) {
    const price = parseStrictNumber(salePrice);
    const cost = parseStrictNumber(directCostPerUnit);
    return roundDecimals(price - cost, 3);
  }

  /**
   * Calcula el margen bruto porcentual
   * grossMarginPercentage = (grossProfitPerUnit / salePrice) * 100
   */
  function calculateGrossMargin(salePrice, grossProfitPerUnit) {
    const price = parseStrictNumber(salePrice);
    const profit = parseStrictNumber(grossProfitPerUnit);
    if (price <= 0) return 0;
    return roundDecimals((profit / price) * 100, 2);
  }

  /**
   * Calcula el resumen financiero integral de un producto
   */
  function computeProductFinancials({
    ingredients = [],
    batchSize = 1,
    salePrice = 0,
    estimatedMonthlySalesVolume = 0
  }) {
    const totalBatchDirectCost = calculateTotalBatchDirectCost(ingredients);
    const directCostPerUnit = calculateDirectCostPerUnit(totalBatchDirectCost, batchSize);
    const grossProfitPerUnit = calculateGrossProfit(salePrice, directCostPerUnit);
    const grossMarginPercentage = calculateGrossMargin(salePrice, grossProfitPerUnit);

    const monthlyUnits = parseStrictNumber(estimatedMonthlySalesVolume);
    const monthlyGrossProfitEstimate = monthlyUnits > 0
      ? roundDecimals(grossProfitPerUnit * monthlyUnits, 2)
      : roundDecimals(grossProfitPerUnit * (parseStrictNumber(batchSize, 1) * 4), 2);

    return {
      totalBatchDirectCost,
      directCostPerUnit,
      grossProfitPerUnit,
      grossMarginPercentage,
      monthlyGrossProfitEstimate
    };
  }

  /**
   * Calcula el costo unitario base de compra mayorista
   * costoUnitarioBase = packagePurchasePrice / unitsPerPackage
   */
  function calculateBaseUnitCost(packagePurchasePrice, unitsPerPackage) {
    const cost = parseStrictNumber(packagePurchasePrice);
    const units = parseStrictNumber(unitsPerPackage, 1);
    if (units <= 0 || cost < 0) return 0;
    return roundDecimals(cost / units, 3);
  }

  /**
   * Calcula el flete o pasaje unitario prorrateado por artículo traído
   * fleteUnitario = freightExpense / totalItemsInTrip
   */
  function calculateUnitFreightCost(freightExpense, totalItemsInTrip) {
    const freight = parseStrictNumber(freightExpense, 0);
    const items = parseStrictNumber(totalItemsInTrip, 0);
    if (items <= 0 || freight <= 0) return 0;
    return roundDecimals(freight / items, 3);
  }

  /**
   * Calcula el costo directo comercial total
   * costoDirectoComercial = costoUnitarioBase + fleteUnitario + empaqueUnitario
   */
  function calculateDirectCommercialCost(baseUnitCost, unitFreightCost = 0, packagingCostPerUnit = 0) {
    const base = parseStrictNumber(baseUnitCost, 0);
    const freight = parseStrictNumber(unitFreightCost, 0);
    const pkg = parseStrictNumber(packagingCostPerUnit, 0);
    return roundDecimals(base + freight + pkg, 3);
  }

  /**
   * Calcula las métricas financieras para un producto bajo modalidad Comercio / Reventa ("El Mayorista")
   */
  function computeCommerceFinancials({
    packagePurchasePrice = 0,
    unitsPerPackage = 1,
    freightExpense = 0,
    totalItemsInTrip = 0,
    packagingCostPerUnit = 0,
    salePrice = 0,
    estimatedMonthlySalesVolume = 0
  }) {
    const baseUnitCost = calculateBaseUnitCost(packagePurchasePrice, unitsPerPackage);
    const unitFreightCost = calculateUnitFreightCost(freightExpense, totalItemsInTrip);
    const safePackaging = parseStrictNumber(packagingCostPerUnit, 0);
    const directCostPerUnit = calculateDirectCommercialCost(baseUnitCost, unitFreightCost, safePackaging);
    const safeSalePrice = parseStrictNumber(salePrice, 0);
    const grossProfitPerUnit = calculateGrossProfit(safeSalePrice, directCostPerUnit);
    const grossMarginPercentage = calculateGrossMargin(safeSalePrice, grossProfitPerUnit);

    const monthlyUnits = parseStrictNumber(estimatedMonthlySalesVolume, 0);
    const monthlyGrossProfitEstimate = monthlyUnits > 0
      ? roundDecimals(grossProfitPerUnit * monthlyUnits, 2)
      : 0;

    return {
      baseUnitCost,
      unitFreightCost,
      packagingCostPerUnit: safePackaging,
      directCostPerUnit,
      salePrice: safeSalePrice,
      grossProfitPerUnit,
      grossMarginPercentage,
      monthlyGrossProfitEstimate
    };
  }

  /**
   * Calcula el costo por minuto derivado del sueldo mensual deseado y jornada laboral
   * totalMonthlyHours = daysWorkedPerMonth * hoursWorkedPerDay
   * totalMonthlyMinutes = totalMonthlyHours * 60
   * costPerMinute = desiredMonthlySalary / totalMonthlyMinutes
   */
  function calculateLaborCostPerMinute({
    desiredMonthlySalary = 0,
    daysWorkedPerMonth = 25,
    hoursWorkedPerDay = 8,
    monthlyHoursWorked = null
  } = {}) {
    const salary = parseStrictNumber(desiredMonthlySalary, 0);
    const days = parseStrictNumber(daysWorkedPerMonth, 25);
    const dailyHours = parseStrictNumber(hoursWorkedPerDay, 8);
    const totalHours = monthlyHoursWorked !== null && monthlyHoursWorked !== undefined && Number(monthlyHoursWorked) > 0
      ? parseStrictNumber(monthlyHoursWorked, 200)
      : Math.max(1, days * dailyHours);

    const totalMinutes = totalHours * 60;
    if (totalMinutes <= 0 || salary <= 0) return 0;
    return roundDecimals(salary / totalMinutes, 3);
  }

  /**
   * Calcula el costo del tiempo de atención para servicios ("El Minutero")
   * timeCost = durationMinutes * costPerMinute (por defecto S/ 0.18/min = S/ 10.80/h)
   */
  function calculateTimeCost(durationMinutes, costPerMinute = 0.18) {
    const mins = parseStrictNumber(durationMinutes, 0);
    const costMin = parseStrictNumber(costPerMinute, 0.18);
    if (mins <= 0 || costMin <= 0) return 0;
    return roundDecimals(mins * costMin, 2);
  }

  /**
   * Calcula el costo por atención de un insumo de servicio:
   * - Uso único / Descartable: packageCost / unitsInPackage
   * - Frasco rendidor: packageCost / clientsYield
   */
  function calculateSupplyUnitCost(supply) {
    if (!supply) return 0;
    const cost = parseStrictNumber(supply.packageCost, 0);
    if (cost <= 0) return 0;

    if (supply.supplyType === 'bottle_yield') {
      const yieldCount = parseStrictNumber(supply.clientsYield, 1);
      return yieldCount > 0 ? roundDecimals(cost / yieldCount, 3) : 0;
    }

    // Default: 'single_use' (descartable)
    const units = parseStrictNumber(supply.unitsInPackage, 1);
    return units > 0 ? roundDecimals(cost / units, 3) : 0;
  }

  /**
   * Calcula el costo directo total de todos los insumos de un servicio
   */
  function calculateTotalServiceSuppliesCost(supplies = []) {
    if (!Array.isArray(supplies) || supplies.length === 0) return 0;
    const total = supplies.reduce((acc, sup) => {
      const unitCost = sup.unitCost !== undefined ? parseStrictNumber(sup.unitCost) : calculateSupplyUnitCost(sup);
      return acc + unitCost;
    }, 0);
    return roundDecimals(total, 3);
  }

  /**
   * Calcula las métricas financieras para un servicio ("El Minutero")
   */
  function computeServiceFinancials({
    durationMinutes = 0,
    costPerMinute = 0.18,
    supplies = [],
    salePrice = 0,
    estimatedMonthlySalesVolume = 0
  }) {
    const timeCost = calculateTimeCost(durationMinutes, costPerMinute);
    const suppliesCost = calculateTotalServiceSuppliesCost(supplies);
    const directCostPerUnit = roundDecimals(timeCost + suppliesCost, 3);
    const safeSalePrice = parseStrictNumber(salePrice, 0);
    const grossProfitPerUnit = calculateGrossProfit(safeSalePrice, directCostPerUnit);
    const grossMarginPercentage = calculateGrossMargin(safeSalePrice, grossProfitPerUnit);

    const monthlyUnits = parseStrictNumber(estimatedMonthlySalesVolume, 0);
    const monthlyGrossProfitEstimate = monthlyUnits > 0
      ? roundDecimals(grossProfitPerUnit * monthlyUnits, 2)
      : 0;

    return {
      timeCost,
      suppliesCost,
      directCostPerUnit,
      salePrice: safeSalePrice,
      grossProfitPerUnit,
      grossMarginPercentage,
      monthlyGrossProfitEstimate
    };
  }

  /**
   * Calcula el total de un ítem de inversión
   * totalPrice = quantity * unitPriceEstimated
   */
  function calculateInvestmentItemTotal(quantity, unitPriceEstimated) {
    const qty = parseStrictNumber(quantity);
    const price = parseStrictNumber(unitPriceEstimated);
    if (qty <= 0 || price < 0) return 0;
    return roundDecimals(qty * price, 2);
  }

  /**
   * Constante de multiplicadores automáticos para normalización de tandas a frecuencias mensuales
   */
  const FREQUENCY_BATCHES_PER_MONTH = {
    diario: 24,
    interdiario: 12,
    semanal: 4,
    quincenal: 2,
    mensual: 1
  };

  /**
   * Calcula el multiplicador de tandas por mes según la frecuencia de producción
   */
  function calculateBatchesPerMonth(frequency) {
    if (!frequency) return 4;
    const norm = String(frequency).toLowerCase().trim();
    return FREQUENCY_BATCHES_PER_MONTH[norm] || 4;
  }

  /**
   * Calcula los insumos consolidados de arranque requeridos para 1 mes de operación
   * Traduce el consumo de tanda ("El Plato") a compras comerciales de mercado ("La Casera")
   */
  function getMonthlyWorkingCapitalRequirements({ products = [], serviceLaborSettings = {}, targetCoverageWeeks = 4 } = {}) {
    const items = [];

    if (!Array.isArray(products) || products.length === 0) return items;

    for (const prod of products) {
      const nature = prod.businessNature || 'produccion';

      // 1. Modalidad Producción / Gastronomía ("La Casera vs. El Plato")
      if (nature === 'produccion') {
        const batches = parseStrictNumber(prod.batchConfig?.batchesPerMonth, 0) > 0
          ? parseStrictNumber(prod.batchConfig?.batchesPerMonth)
          : calculateBatchesPerMonth(prod.batchConfig?.productionFrequency || 'semanal');

        const ingredients = Array.isArray(prod.ingredients) ? prod.ingredients : [];

        for (let idx = 0; idx < ingredients.length; idx++) {
          const ing = ingredients[idx];
          const usedPerBatch = parseStrictNumber(ing.recipeConsumption?.quantityUsed, 0);
          const monthlyQtyConsumed = roundDecimals(usedPerBatch * batches, 3);
          const qtyInPackage = parseStrictNumber(ing.marketPurchase?.quantityInPackage, 1);
          const packageCost = parseStrictNumber(ing.marketPurchase?.packageCost, 0);
          const packageUnit = ing.marketPurchase?.packageUnitName || 'paquete';

          const packagesToBuy = qtyInPackage > 0 && monthlyQtyConsumed > 0
            ? Math.ceil(roundDecimals(monthlyQtyConsumed / qtyInPackage, 4))
            : (monthlyQtyConsumed > 0 ? 1 : 0);

          const requiredBudget = roundDecimals(packagesToBuy * packageCost, 2);

          if (packagesToBuy > 0) {
            items.push({
              itemId: `WORKING-CAP-${prod.productId}-${ing.ingredientId || idx}`,
              productId: prod.productId,
              productName: prod.productName,
              ingredientId: ing.ingredientId || `ING-${idx}`,
              category: 'Insumos y Capital de Trabajo',
              rubro: 'rubro_b',
              description: `${ing.name || 'Insumo'} (${packagesToBuy} ${packageUnit} para ${batches} tandas/mes)`,
              quantity: packagesToBuy,
              unit: packageUnit,
              unitPriceEstimated: packageCost,
              totalPrice: requiredBudget,
              monthlyQuantityConsumed: monthlyQtyConsumed,
              consumptionUnit: ing.recipeConsumption?.unit || 'unidades',
              priority: 'alta',
              financedBySeedCapital: true,
              source: 'capital_semilla',
              isAutoDerivedFromS6: true,
              isLaborContribution: false,
              methodology: 'produccion',
              ingredientName: ing.name || 'Insumo',
              usedPerBatch,
              batchesPerMonth: batches,
              batchSize: parseStrictNumber(prod.batchConfig?.batchSize, 1),
              batchUnit: prod.batchConfig?.batchUnit || 'unidades',
              packageQuantity: qtyInPackage,
              packageUnit,
              packageCost
            });
          }
        }
      }

      // 2. Modalidad Servicios / Estilismo ("El Minutero")
      else if (nature === 'servicio') {
        const monthlyVolume = parseStrictNumber(prod.commercialization?.estimatedMonthlySalesVolume, 0) > 0
          ? parseStrictNumber(prod.commercialization?.estimatedMonthlySalesVolume)
          : 40; // Volumen base mensual de atenciones

        const supplies = Array.isArray(prod.serviceConfig?.supplies) ? prod.serviceConfig.supplies : [];

        for (let idx = 0; idx < supplies.length; idx++) {
          const sup = supplies[idx];
          const cost = parseStrictNumber(sup.packageCost, 0);
          let packagesToBuy = 1;

          if (sup.supplyType === 'bottle_yield') {
            const yieldCount = parseStrictNumber(sup.clientsYield, 1);
            packagesToBuy = yieldCount > 0 && monthlyVolume > 0
              ? Math.ceil(monthlyVolume / yieldCount)
              : 1;
          } else {
            const unitsInPkg = parseStrictNumber(sup.unitsInPackage, 1);
            packagesToBuy = unitsInPkg > 0 && monthlyVolume > 0
              ? Math.ceil(monthlyVolume / unitsInPkg)
              : 1;
          }

          const requiredBudget = roundDecimals(packagesToBuy * cost, 2);
          const isBottle = sup.supplyType === 'bottle_yield';

          items.push({
            itemId: `WORKING-CAP-${prod.productId}-${sup.id || idx}`,
            productId: prod.productId,
            productName: prod.productName,
            supplyId: sup.id || `SUP-${idx}`,
            category: 'Insumos y Capital de Trabajo',
            rubro: 'rubro_b',
            description: `${sup.name || 'Suministro'} (${packagesToBuy} ${isBottle ? 'frasco(s)' : 'paquete(s)'} para ~${monthlyVolume} clientes/mes)`,
            quantity: packagesToBuy,
            unit: isBottle ? 'frascos' : 'paquetes',
            unitPriceEstimated: cost,
            totalPrice: requiredBudget,
            priority: 'alta',
            financedBySeedCapital: true,
            source: 'capital_semilla',
            isAutoDerivedFromS6: true,
            isLaborContribution: false,
            methodology: 'servicio',
            supplyName: sup.name || 'Suministro',
            supplyType: sup.supplyType || 'single_use',
            clientsYield: sup.supplyType === 'bottle_yield' ? parseStrictNumber(sup.clientsYield, 1) : null,
            unitsInPackage: sup.supplyType === 'single_use' ? parseStrictNumber(sup.unitsInPackage, 1) : null,
            monthlyVolume,
            packageCost: cost
          });
        }
      }

      // 3. Modalidad Comercio / Reventa ("El Mayorista")
      else if (nature === 'comercio') {
        const monthlyVolume = parseStrictNumber(prod.commercialization?.estimatedMonthlySalesVolume, 0) > 0
          ? parseStrictNumber(prod.commercialization?.estimatedMonthlySalesVolume)
          : 20;

        const unitsPerPkg = parseStrictNumber(prod.commerceConfig?.unitsPerPackage, 1);
        const packagesToBuy = unitsPerPkg > 0 && monthlyVolume > 0
          ? Math.ceil(monthlyVolume / unitsPerPkg)
          : 1;

        const packagePrice = parseStrictNumber(prod.commerceConfig?.packagePurchasePrice, 0);
        const freightPerPkg = roundDecimals(parseStrictNumber(prod.commerceConfig?.unitFreightCost, 0) * unitsPerPkg, 2);
        const packagingPerPkg = roundDecimals(parseStrictNumber(prod.commerceConfig?.packagingCostPerUnit, 0) * unitsPerPkg, 2);
        const unitCostWithProrate = roundDecimals(packagePrice + freightPerPkg + packagingPerPkg, 2);
        const requiredBudget = roundDecimals(packagesToBuy * unitCostWithProrate, 2);
        const pres = prod.commerceConfig?.purchasePresentation || 'bulto/caja';

        items.push({
          itemId: `WORKING-CAP-${prod.productId}-COMMERCE`,
          productId: prod.productId,
          productName: prod.productName,
          category: 'Insumos y Capital de Trabajo',
          rubro: 'rubro_b',
          description: `Mercadería inicial de ${prod.productName} (${packagesToBuy} ${pres} de ${unitsPerPkg} un. inc. flete y empaque)`,
          quantity: packagesToBuy,
          unit: pres,
          unitPriceEstimated: unitCostWithProrate,
          totalPrice: requiredBudget,
          priority: 'alta',
          financedBySeedCapital: true,
          source: 'capital_semilla',
          isAutoDerivedFromS6: true,
          isLaborContribution: false,
          methodology: 'comercio',
          purchasePresentation: pres,
          unitsPerPackage: unitsPerPkg,
          monthlyVolume,
          packagePurchasePrice: packagePrice,
          unitFreightCost: parseStrictNumber(prod.commerceConfig?.unitFreightCost, 0),
          packagingCostPerUnit: parseStrictNumber(prod.commerceConfig?.packagingCostPerUnit, 0),
          unitCostWithProrate
        });
      }
    }

    return items;
  }

  /**
   * Calcula la proyección de capacidad operativa (producción, atenciones o ventas)
   * y las ventas brutas mensuales estimadas para cada producto según su metodología.
   */
  function computeMonthlyProductionAndSalesProjection(products = [], serviceLaborSettings = {}) {
    if (!Array.isArray(products) || products.length === 0) {
      return {
        products: [],
        totalMonthlySalesEstimate: 0,
        totalMonthlyUnits: 0
      };
    }

    let totalMonthlySalesEstimate = 0;
    let totalMonthlyUnits = 0;

    const projections = products.map((prod) => {
      const nature = prod.businessNature || 'produccion';
      const salePrice = parseStrictNumber(
        prod.commercialization?.currentSalePrice ||
        prod.financialSummary?.salePrice ||
        prod.salePrice,
        0
      );

      if (nature === 'produccion') {
        const batchSize = Math.max(1, parseStrictNumber(prod.batchConfig?.batchSize, 1));
        const batchUnit = prod.batchConfig?.batchUnit || 'unidades';
        const frequency = prod.batchConfig?.productionFrequency || 'semanal';
        const batchesPerMonth = parseStrictNumber(prod.batchConfig?.batchesPerMonth, 0) > 0
          ? parseStrictNumber(prod.batchConfig?.batchesPerMonth)
          : calculateBatchesPerMonth(frequency);

        const monthlyUnitsProduced = roundDecimals(batchSize * batchesPerMonth, 0);
        const monthlySalesEstimate = roundDecimals(monthlyUnitsProduced * salePrice, 2);

        totalMonthlyUnits += monthlyUnitsProduced;
        totalMonthlySalesEstimate += monthlySalesEstimate;

        return {
          productId: prod.productId,
          productName: prod.productName || 'Producto en Producción',
          businessNature: 'produccion',
          methodologyLabel: 'Producción ("La Casera vs. El Plato")',
          batchSize,
          batchUnit,
          frequency,
          batchesPerMonth,
          capacityDescription: `${batchSize} ${batchUnit}/tanda × ${batchesPerMonth} tandas/mes`,
          monthlyVolume: monthlyUnitsProduced,
          volumeUnit: batchUnit,
          salePrice,
          monthlySalesEstimate
        };
      } else if (nature === 'servicio') {
        const monthlyClients = parseStrictNumber(prod.commercialization?.estimatedMonthlySalesVolume, 0) > 0
          ? parseStrictNumber(prod.commercialization?.estimatedMonthlySalesVolume)
          : 40;
        const durationMinutes = parseStrictNumber(prod.serviceConfig?.durationMinutes, 30);
        const monthlySalesEstimate = roundDecimals(monthlyClients * salePrice, 2);

        totalMonthlyUnits += monthlyClients;
        totalMonthlySalesEstimate += monthlySalesEstimate;

        return {
          productId: prod.productId,
          productName: prod.productName || 'Servicio de Atención',
          businessNature: 'servicio',
          methodologyLabel: 'Servicios ("El Minutero")',
          batchSize: 1,
          batchUnit: 'atención',
          frequency: 'mensual',
          batchesPerMonth: monthlyClients,
          capacityDescription: `Atención de ${durationMinutes} min (~${monthlyClients} clientes/mes)`,
          monthlyVolume: monthlyClients,
          volumeUnit: 'atenciones',
          salePrice,
          monthlySalesEstimate
        };
      } else {
        // comercio
        const monthlyUnits = parseStrictNumber(prod.commercialization?.estimatedMonthlySalesVolume, 0) > 0
          ? parseStrictNumber(prod.commercialization?.estimatedMonthlySalesVolume)
          : 20;
        const pres = prod.commerceConfig?.purchasePresentation || 'bulto/caja';
        const unitsPerPkg = parseStrictNumber(prod.commerceConfig?.unitsPerPackage, 1);
        const monthlySalesEstimate = roundDecimals(monthlyUnits * salePrice, 2);

        totalMonthlyUnits += monthlyUnits;
        totalMonthlySalesEstimate += monthlySalesEstimate;

        return {
          productId: prod.productId,
          productName: prod.productName || 'Artículo de Comercio',
          businessNature: 'comercio',
          methodologyLabel: 'Comercio ("El Mayorista")',
          batchSize: unitsPerPkg,
          batchUnit: 'unidades',
          frequency: 'mensual',
          batchesPerMonth: Math.ceil(monthlyUnits / unitsPerPkg),
          capacityDescription: `Venta estimada de ${monthlyUnits} u. (${pres} de ${unitsPerPkg} u.)`,
          monthlyVolume: monthlyUnits,
          volumeUnit: 'unidades',
          salePrice,
          monthlySalesEstimate
        };
      }
    });

    return {
      products: projections,
      totalMonthlySalesEstimate: roundDecimals(totalMonthlySalesEstimate, 2),
      totalMonthlyUnits
    };
  }

  /**
   * Genera la memoria estructurada de cálculo mensual de insumos, suministros y mercadería
   * justificando cada compra del Rubro B en función de la metodología correspondiente.
   */
  function getWorkingCapitalBreakdownMemory({ products = [], serviceLaborSettings = {} } = {}) {
    const rawReqs = getMonthlyWorkingCapitalRequirements({ products, serviceLaborSettings });

    return rawReqs.map((item) => {
      let formulaText = '';
      let consumptionText = '';
      let packagePresentationText = `${item.quantity} ${item.unit}`;

      if (item.methodology === 'produccion') {
        const used = item.usedPerBatch ?? 0;
        const tandas = item.batchesPerMonth ?? 4;
        const totalConsumed = item.monthlyQuantityConsumed ?? (used * tandas);
        const pkgContent = item.packageQuantity ?? 1;
        consumptionText = `${used} ${item.consumptionUnit || 'un.'}/tanda × ${tandas} tandas = ${totalConsumed} ${item.consumptionUnit || 'un.'}/mes`;
        formulaText = `Consumo mensual (${totalConsumed} ${item.consumptionUnit || 'un.'}) ÷ Empaque (${pkgContent} ${item.consumptionUnit || 'un.'}) = ${item.quantity} ${item.unit}`;
      } else if (item.methodology === 'servicio') {
        const vol = item.monthlyVolume ?? 40;
        if (item.supplyType === 'bottle_yield') {
          const y = item.clientsYield || 1;
          consumptionText = `Rinde ${y} clientes/frasco para ~${vol} atenciones/mes`;
          formulaText = `${vol} atenciones ÷ Rendimiento de ${y} clientes = ${item.quantity} frasco(s)`;
        } else {
          const u = item.unitsInPackage || 1;
          consumptionText = `${u} un./paquete para ~${vol} atenciones/mes`;
          formulaText = `${vol} atenciones ÷ Contenido de ${u} un. = ${item.quantity} paquete(s)`;
        }
      } else if (item.methodology === 'comercio') {
        const vol = item.monthlyVolume ?? 20;
        const u = item.unitsPerPackage || 1;
        consumptionText = `Venta mensual proyectada: ${vol} unidades (${u} un. por ${item.purchasePresentation || 'bulto'})`;
        formulaText = `${vol} unidades ÷ ${u} un./bulto = ${item.quantity} ${item.unit} (inc. flete y empaque prorrateado)`;
      }

      return {
        ...item,
        consumptionText,
        formulaText,
        packagePresentationText
      };
    });
  }

  /**
   * Calcula la valorización mensual del tiempo y dedicación del emprendedor (Mano de Obra Propia)
   */
  function calculateProjectedMonthlyLaborValue({ businessNature = 'produccion', serviceLaborSettings = {}, products = [] } = {}) {
    if (serviceLaborSettings && parseStrictNumber(serviceLaborSettings.desiredMonthlySalary, 0) > 0) {
      return roundDecimals(parseStrictNumber(serviceLaborSettings.desiredMonthlySalary), 2);
    }

    if (businessNature === 'servicio' && Array.isArray(products) && products.length > 0) {
      let sumLabor = 0;
      for (const p of products) {
        if (p.businessNature === 'servicio') {
          const mins = parseStrictNumber(p.serviceConfig?.durationMinutes, 0);
          const costMin = parseStrictNumber(p.serviceConfig?.costPerMinute, 0.10);
          const vol = parseStrictNumber(p.commercialization?.estimatedMonthlySalesVolume, 0) || 40;
          sumLabor += mins * costMin * vol;
        }
      }
      if (sumLabor > 0) return roundDecimals(sumLabor, 2);
    }

    return 1200.0; // Sueldo mínimo / referencial de mercado
  }

  /**
   * Evalúa el plan de inversión y presupuesto de capital semilla con desglose homogéneo en 3 Rubros:
   * - Rubro A: Maquinaria, Herramientas y Equipos
   * - Rubro B: Capital de Trabajo / Insumos Iniciales
   * - Rubro C: Acondicionamiento y Mano de Obra Propia
   */
  function computeSeedCapitalPlan({ items = [], ceiling = 3000 }) {
    const safeCeiling = parseStrictNumber(ceiling, 3000);

    let rubroASeed = 0;
    let rubroAOwn = 0;
    let rubroBSeed = 0;
    let rubroBOwn = 0;
    let rubroCSeed = 0;
    let rubroCOwn = 0;

    let totalBusinessInvestment = 0;
    let allocatedSeedCapital = 0;

    for (const item of items || []) {
      const price = parseStrictNumber(item.totalPrice, 0);
      const isFinanced = item.financedBySeedCapital !== false; // por defecto true

      totalBusinessInvestment += price;
      if (isFinanced) {
        allocatedSeedCapital += price;
      }

      // Clasificación por Rubro
      const r = item.rubro || (
        item.category === 'Insumos y Capital de Trabajo'
          ? 'rubro_b'
          : (item.category === 'Maquinaria y Equipo' || item.category === 'Herramientas'
            ? 'rubro_a'
            : 'rubro_c')
      );

      if (r === 'rubro_a') {
        if (isFinanced) rubroASeed += price;
        else rubroAOwn += price;
      } else if (r === 'rubro_b') {
        if (isFinanced) rubroBSeed += price;
        else rubroBOwn += price;
      } else {
        if (isFinanced) rubroCSeed += price;
        else rubroCOwn += price;
      }
    }

    totalBusinessInvestment = roundDecimals(totalBusinessInvestment, 2);
    allocatedSeedCapital = roundDecimals(allocatedSeedCapital, 2);
    const ownContribution = roundDecimals(Math.max(0, totalBusinessInvestment - allocatedSeedCapital), 2);
    const remainingBudget = roundDecimals(safeCeiling - allocatedSeedCapital, 2);
    const isBudgetCompliant = allocatedSeedCapital <= safeCeiling;

    return {
      seedCapitalCeiling: safeCeiling,
      totalBusinessInvestment,
      allocatedTotal: allocatedSeedCapital, // Compatibilidad con schema.json
      allocatedSeedCapital,
      ownContribution,
      remainingBudget,
      isBudgetCompliant,
      rubros: {
        rubroA: {
          label: 'Maquinaria, Herramientas y Equipos',
          seedCapital: roundDecimals(rubroASeed, 2),
          seed: roundDecimals(rubroASeed, 2),
          ownContribution: roundDecimals(rubroAOwn, 2),
          own: roundDecimals(rubroAOwn, 2),
          total: roundDecimals(rubroASeed + rubroAOwn, 2)
        },
        rubroB: {
          label: 'Capital de Trabajo / Insumos Iniciales',
          seedCapital: roundDecimals(rubroBSeed, 2),
          seed: roundDecimals(rubroBSeed, 2),
          ownContribution: roundDecimals(rubroBOwn, 2),
          own: roundDecimals(rubroBOwn, 2),
          total: roundDecimals(rubroBSeed + rubroBOwn, 2)
        },
        rubroC: {
          label: 'Acondicionamiento y Mano de Obra Propia',
          seedCapital: roundDecimals(rubroCSeed, 2),
          seed: roundDecimals(rubroCSeed, 2),
          ownContribution: roundDecimals(rubroCOwn, 2),
          own: roundDecimals(rubroCOwn, 2),
          total: roundDecimals(rubroCSeed + rubroCOwn, 2)
        }
      }
    };
  }

  return {
    FREQUENCY_BATCHES_PER_MONTH,
    calculateBatchesPerMonth,
    roundDecimals,
    formatMoney,
    formatPercent,
    isValidPositiveNumber,
    parseStrictNumber,
    calculateUnitCostFromMarket,
    calculateCostIncurred,
    calculateLeftoverStock,
    computeIngredientMath,
    calculateTotalBatchDirectCost,
    calculateDirectCostPerUnit,
    calculateGrossProfit,
    calculateGrossMargin,
    computeProductFinancials,
    calculateBaseUnitCost,
    calculateUnitFreightCost,
    calculateDirectCommercialCost,
    computeCommerceFinancials,
    calculateTimeCost,
    calculateLaborCostPerMinute,
    calculateSupplyUnitCost,
    calculateTotalServiceSuppliesCost,
    computeServiceFinancials,
    calculateInvestmentItemTotal,
    getMonthlyWorkingCapitalRequirements,
    computeMonthlyProductionAndSalesProjection,
    getWorkingCapitalBreakdownMemory,
    calculateProjectedMonthlyLaborValue,
    computeSeedCapitalPlan,
    getUnitConversionFactor
  };
}

