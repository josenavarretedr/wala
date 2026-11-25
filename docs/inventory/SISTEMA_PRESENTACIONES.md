# 📦 Sistema de Presentaciones, Venta a Granel, Costo Promedio y Descuentos

**Última actualización:** Noviembre 2026  
**Módulos vinculados:** Inventario (`EditProductGeneralInfo`, `EditProductEconomicInfo`), Compras (`AddStock`, `StepAddExpenseDetails`), Ventas (`StepAddIncomeDetails`), Detalles de Gastos (`ExpenseDetails`), Costeo y Reversión Atómica (`deleteSale`).

---

## 🎯 1. Visión General y Filosofía de Diseño

El sistema de **Presentaciones y Multi-Empaque** de Wala resuelve la dualidad entre **cómo se almacena físicamente la mercadería** y **cómo se comercializa** (mayorista, minorista, por bultos o a granel).

### La Regla de Diseño Central
Para mantener la integridad contable, el inventario y la compatibilidad con más de 20 módulos existentes:

| Dimensión | Unidad de Medida | Campos en Base de Datos |
| :--- | :--- | :--- |
| **Inventario Físico** (Stock, Kardex, Recetas, CPP) | **Unidad Mínima Indivisible (UMI)** | `product.stock`, `product.cost`, `stockLog.quantity`, `stockLog.quantityDeducted` |
| **Dinero en la Transacción** (Precio, Costo, Totales) | **Por Presentación Comercial** | `item.quantity`, `item.price` (neto), `item.cost`, `item.costStructure`, `material.cost` |
| **Puente y Auditoría** | Ambas | `conversionFactor`, `baseQuantity`, `baseUnitCost`, `presentationId`, `presentationName`, `listPrice` |

---

## 🏗️ 2. Modelo de Datos en Firestore

### 2.1 Producto (`businesses/{businessId}/products/{productId}`)

```javascript
{
  description: "ARROZ EXTRA SUPERIOR",
  unit: "kg",                         // UNIDAD BASE (la más pequeña en que se vende)
  stock: 162.5,                       // Stock físico en almacén (en kg)
  cost: 3.60,                         // Costo Promedio Ponderado (CPP) por kg
  price: 4.50,                        // Precio de la presentación base (x1 kg)
  trackStock: true,
  costMethod: "weighted_average",

  hasPresentations: true,
  presentations: [
    {
      id: "pres_base",
      name: "KILO",
      factor: 1,                      // 1 kg
      price: 4.50,                    // S/ 4.50 / kg
      minMarginPct: null,             // Hereda el margen del negocio
      usage: ["buy", "sell"],
      isBase: true,
      isActive: true,
      allowSellByAmount: true         // Permite venta a granel por dinero ("S/ 5 de arroz")
    },
    {
      id: "pres_saco",
      name: "SACO X 50 KG",
      factor: 50,                     // 50 kg
      price: 200.00,                  // S/ 4.00 / kg (descuento por volumen)
      minMarginPct: 5,                // Margen mínimo mayorista (5%)
      usage: ["buy", "sell"],
      isBase: false,
      isActive: true,
      sku: "7751234567890"
    }
  ]
}
```

### 2.2 Política de Precios del Negocio (`businesses/{businessId}/settings/config`)

```javascript
pricing: {
  minMarginPct: 20,              // Margen bruto mínimo objetivo
  belowFloorAction: "warn",      // 'warn' (aviso) | 'require_manager' (candado gerente) | 'block'
  allowBelowCost: false          // Bloquea ventas con precio inferior al costo
}
```

---

## 🧮 3. Lógica Matemática y Financiera (`presentationMath.js`)

Todas las operaciones críticas se encapsulan en funciones puras testeables:

### 3.1 Costo Promedio Ponderado (CPP)
$$\text{Nuevo Costo} = \frac{(\text{Stock Actual} \times \text{Costo Actual}) + (\text{Cantidad Entrante UMI} \times \text{Costo Unitario Entrante})}{\text{Stock Actual} + \text{Cantidad Entrante UMI}}$$
* Si `Stock Actual <= 0` o el costo era nulo, se adopta directamente el costo entrante.
* Las devoluciones (`return`) y conteos de ajuste (`count`) no alteran el CPP.

### 3.2 Venta a Granel por Dinero ("S/ 5 de arroz")
$$\text{Cantidad} = \text{roundStock}\left(\frac{\text{Monto}}{\text{Precio Unitario}}\right)$$
$$\text{Precio Ajustado} = \frac{\text{Monto}}{\text{Cantidad}}$$
Garantiza que $\text{Cantidad} \times \text{Precio Ajustado}$ cuadre al centavo exacto con el dinero recibido.

### 3.3 Precio Piso y Evaluación de Margen
$$\text{Costo Presentación} = \text{Costo Base} \times \text{Factor}$$
$$\text{Precio Piso} = \frac{\text{Costo Presentación}}{1 - \frac{\text{Margen Mínimo}}{100}}$$

* **Verde (Saludable):** $\text{Precio} \ge \text{Precio Piso}$.
* **Ámbar (Bajo Piso):** $\text{Costo Presentación} \le \text{Precio} < \text{Precio Piso}$.
* **Rojo (Bajo Costo):** $\text{Precio} < \text{Costo Presentación}$.

---

## 🔄 4. Ciclo de Operaciones y UX

### 4.1 Compras Directas de Inventario (`AddStock.vue`, `StepAddStockQuantity.vue` & `AddStockFlow.js`)
1. El usuario selecciona la presentación comprada (ej: 2 Sacos x 50 kg a S/ 180 c/u).
2. Se muestra en vivo el equivalente base: $+100 \text{ kg}$ a $\text{S/ } 3.60/\text{kg}$.
3. El previsualizador calcula el nuevo CPP proyectado en vivo antes de confirmar.
4. **Sincronización Determinista, Cache & Toast UX:**
   - Al confirmar, `transactionStore.addTransaction({ awaitRemote: true })` espera la escritura atómica de inventario y transacción en Firestore mediante `useOptimisticSync`.
   - Se invalida el caché en memoria vía `useProductCache().removeFromCache(productId)` tanto al confirmar como al recargar `ProductDetails.vue`.
   - Se emite notificación visual inmediata con `useToast().success(...)` renderizada por `ToastNotification.vue`.
   - Al navegar a `ProductDetails.vue`, el stock y CPP actualizados se muestran al instante sin necesidad de recarga manual (F5).

### 4.2 Compras de Materiales desde Flujo de Egresos (`StepAddExpenseDetails.vue`, `StepAddExpensePreview.vue` & `ExpenseDetails.vue`)
1. `SearchProductForExpenseAsync.vue` extrae `hasPresentations` y `presentations` del producto seleccionado.
2. Si el material tiene múltiples presentaciones habilitadas para compra (`usage: ['buy']`), `StepAddExpenseDetails.vue` despliega pills selectores de presentación (ej. `Caja x24`, `Unidad`).
3. Al ingresar cantidad y costo de la presentación:
   - Se calcula en tiempo real la equivalencia en unidad base (`baseQuantity = quantity * factor`) y el costo base entrante (`baseUnitCost = cost / factor`).
   - `addMaterialItemsToInventoryForPurchase` registra el ingreso en almacén en unidad base y recalcula el CPP automáticamente.
4. En **Previsualización y Detalles Históricos (`StepAddExpensePreview.vue`, `ExpenseDetails.vue`, `PaymentDetails.vue`)**, los materiales muestran el nombre de presentación, su equivalente en unidad base (`= 48 uni`) y el costo base unitario desglosado.
5. Al eliminar un egreso de materiales (`deleteMaterialExpenseTransaction`), el fallback usa `baseQuantity` para revertir exactamente el stock en unidad base.

### 4.3 Ventas (`StepAddIncomeDetails.vue` & `transactionStore.js`)
1. Al seleccionar el producto, se despliegan sus presentaciones disponibles.
2. El stock se desglosa amigablemente (ej: *"Quedan 3 Sacos + 12.5 kg"*).
3. **Precio Inalterable y Botón Sutil `"Dscto %"`:**
   - Para productos existentes del catálogo, el campo principal de **Precio (S/)** permanece en modo `readonly` con indicador visual de bloqueo (`🔒`), evitando ediciones accidentales por teclado.
   - Mediante el botón sutil **`Dscto %`**, el usuario despliega el panel de **Descuento de Línea / Precio Negociado**, pudiendo aplicar descuento por porcentaje (`%`), monto fijo (`S/`) o precio pactado directo.
   - Incluye acceso rápido para **Quitar** el descuento y restablecer al precio de lista oficial.
4. **Semáforo de Margen (`MarginGuard.vue`):** Audita en caliente si el precio resultante respeta el margen mínimo configurado.
5. Al agregar el ítem:
   - `quantity` guarda las unidades de presentación vendidas.
   - `baseQuantity` guarda las unidades base reales a descontar.
   - `quantityForStock` deduce en unidades base considerando disponibilidad física.
   - Las recetas de productos elaborados (`processCompositionStockLogs`) consumen insumos proporcionales a `baseQuantity`.

### 4.4 Configuración en Edición de Producto (`EditProductGeneralInfo.vue` & `EditProductEconomicInfo.vue`)
* **Información General (`EditProductGeneralInfo.vue`):** Define la unidad base e incluye una tarjeta resumen de **Presentaciones / Empaques** con las presentaciones activas, factores y precios de venta, además de un enlace directo a *Información Económica*.
* **Información Económica (`EditProductEconomicInfo.vue` + `PresentationsEditor.vue`):** La vista hidrata `unit`, `hasPresentations` y `presentations`, permitiendo gestionar nombres, factores y precios por presentación, y realizando copia profunda de `originalData` para garantizar la detección de cambios y persistencia en Firestore.

### 4.5 Reversión Atómica de Ventas (`deleteSale.js`)
* Al anular una venta o emitir nota de devolución (`refund`), la Cloud Function `deleteSale` restaura el inventario basándose en `quantityDeducted` (que ya está registrado en unidades base) o en el respaldo defensivo `matchedItem.baseQuantity`.

---

## 📋 5. Pendientes Registrados para Siguientes Iteraciones

| Código | Descripción |
| :--- | :--- |
| **TODO(D7)** | Descuento global sobre el total de la venta (prorrateo sobre `itemsTotal` y afectación de `dailySummaries`). |
| **P2** | Presentaciones con factores decimales o unidades imperiales (ej: Saco de 100 lb = 45.36 kg). |
| **P3** | Precisión de stock a 3 decimales (1 gramo / 1 ml) para balanzas de alta precisión. |
| **P4** | Reporte de merma de fraccionamiento (diferencia entre compra por sacos y venta al menudeo). |
| **P5** | Combos y kits de productos mixtos (Bill of Materials comercial). |
