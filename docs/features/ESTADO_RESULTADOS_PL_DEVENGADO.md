# 📊 Estado de Resultados (P&L) y Costo de Ventas Devengado

**Última actualización:** Mayo 2026
**Módulo:** Consultoría y Asesoría Financiera
**Ruta en la App:** `/business/:businessId/income-statement` (vinculado a la micro-app **"Resultados"** en `MicroApps.vue`)

---

## 💡 1. Filosofía Financiera: El Principio de Devengado y Asociación

El error más común en los emprendedores al medir su rentabilidad es restar el dinero total gastado en compras de materiales (Flujo de Caja) directamente de sus ingresos del mes. 

En Wala, el **Estado de Resultados** implementa el riguroso **Principio de Devengado y Asociación** (Matching Principle):

> *“Solo se pueden restar los costos de los insumos y materiales correspondientes a los productos que efectivamente se vendieron en ese mismo período.”*

### El Ejemplo Didáctico de la Tela:
*   En **Mayo**, un confeccionista vende **300 polos** con un costo de materiales de **S/ 6,500**.
*   Ese mismo mes, compra rollos de tela adicionales por **S/ 2,000** para stock/almacén futuro.
*   Su egreso físico total de caja es de **S/ 8,500**.
*   **En el P&L de Mayo**: Solo se restan los **S/ 6,500** correspondientes a los polos vendidos. Su utilidad bruta refleja su margen real de fabricación.
*   **En el Balance General**: Los **S/ 2,000** en tela sobrante no son un gasto; se guardan en el inventario como un **Activo**. Pasarán al P&L únicamente en el mes futuro en el que esas prendas confeccionadas se vendan.

---

## 🛠️ 2. Arquitectura de Implementación Técnica

La solución está construida de forma modular en 3 capas del frontend de Wala:

```
[ Capa de Datos: Firestore ]
      │  Cada transacción se almacena enriquecida con `statementLine` contable.
      ▼
[ Capa de Lógica: Pinia & Composables ]
      │  `useInventoryStore` aporta las fichas técnicas y costos de producción.
      │  `useTransaction` aporta el rango histórico de ingresos y egresos.
      ▼
[ Capa de Interfaz: IncomeStatementView ]
      │  Cruza ventas reales con el coste de catálogo en tiempo real.
      └── Renderiza desglose didáctico por producto e iconografía premium.
```

---

## 🗄️ 3. Clasificación Contable Automática

Para automatizar el mapeo de transacciones, creamos un motor de clasificación en caliente en el archivo [statementLineClassifier.js](file:///c:/Users/User/Proyectos/wala/src/utils/statementLineClassifier.js) y lo integramos en la persistencia del [transactionStore.js](file:///c:/Users/User/Proyectos/wala/src/stores/transaction/transactionStore.js).

Cada transacción posee el campo contable `statementLine`, que toma valores estandarizados:
*   `sales_revenue`: Ventas brutas por productos o servicios (Ingresos).
*   `cogs_materials`: Costos directos de insumos/materiales (Egresos).
*   `cogs_labor`: Mano de obra directa a destajo (Egresos).
*   `cogs_cif`: Costos indirectos de producción (Egresos / Prorrateos).
*   `opex_fixed`: Gastos de operación fijos (alquiler, luz comercial, sueldos base).
*   `opex_sales`: Gastos de ventas (publicidad Meta/Google, comisiones e insumos de envío).
*   `depreciation`: Reserva contable por desgaste de maquinaria.
*   `financial`: Intereses de préstamos bancarios y comisiones de pasarela POS.
*   `tax`: Pago de impuestos fiscales (SUNAT).

### 🛵 1. Comisión de Plataformas de Delivery (Rappi, PedidosYa)
Cuando el usuario registra una venta a través de canales de venta de delivery que involucran comisiones (ej. Rappi/PedidosYa), el controlador en `transactionStore.js` crea de forma automatizada una **transacción de egreso enlazada** (`type: 'expense'`) bajo el concepto de comisión de plataforma. 
*   Esta transacción de egreso enlazada se clasifica explícitamente con `statementLine: 'opex_sales'`.
*   Esto garantiza que el P&L acumule la comisión de forma rigurosa y directa bajo la línea de **Gastos de Ventas**.

### 📦 2. Costo de Envases y Empaques (Packaging)
Cuando se concreta un pedido por canal `DELIVERY` o `TAKEAWAY` que consume empaques (calculados en base a `deliveryConfig.packaging` del producto):
*   El costo de los empaques se registra bajo la propiedad `packagingCost` de la transacción de ingreso.
*   **En el P&L**: El informe contable en caliente extrae de forma dinámica `packagingCost` de cada venta y lo suma directamente bajo la línea **Gastos de Ventas (`opex_sales`)**.
*   **En el Desglose**: En el acordeón de desgloses de Gastos de Ventas, cada concepto de empaque consumido se lista de forma virtual indicando el detalle de la venta asociada para dar transparencia absoluta al costo logístico.

---

## 🔄 4. Cálculo del Costo de Ventas en Base a lo Vendido

En la vista [IncomeStatementView.vue](file:///c:/Users/User/Proyectos/wala/src/views/Expenses/IncomeStatementView.vue), en lugar de sumar los egresos brutos en el mes para el cálculo de costeos, el sistema realiza un **cruces dinámico en tiempo real con la base de datos de inventario**:

### Algoritmo de Cálculo (`lines` Computada):
1.  Se cargan en paralelo las transacciones del período seleccionado y el catálogo completo de productos del inventario (`inventoryStore.getItemsInInventory()`).
2.  Para cada transacción de tipo `income` (venta), se extrae su arreglo de `items` vendidos.
3.  Para cada producto de venta (`item`), se localiza su ficha técnica en el inventario para obtener la propiedad `costStructure` (gestionada en `productCostingStore.js`):
    *   **Costo de Materiales**: `product.costStructure.materials`
    *   **Mano de Obra Directa (MOD)**: `product.costStructure.mod`
    *   **Costo Indirecto (CIF)**: `product.costStructure.cif`
4.  Se realiza la multiplicación:
    $$\text{Costo de Materiales Real} = \sum (\text{Cantidad Vendida} \times \text{Materiales Unitario})$$
5.  **Fallback de Seguridad**: Si un producto no tiene cargada la ficha técnica de costeos en Wala, el sistema utiliza el costo unitario fallback registrado en el producto general (`product.cost`) o el costo de venta registrado al facturar (`item.costPerUnit`), evitando que el P&L asuma costes en cero y falsas rentabilidades.

---

## 🎨 5. Diseño Premium e Interfaz de Usuario (UI)

La interfaz en [IncomeStatementView.vue](file:///c:/Users/User/Proyectos/wala/src/views/Expenses/IncomeStatementView.vue) incorpora altos estándares visuales (Tailwind CSS adaptado, HSL borders, degradados y micro-animaciones) y las siguientes funcionalidades de consultoría:

### 1. Iconografía Premium Didáctica
Cada línea de la estructura contable incorpora un componente de icono premium importado de `@iconoir/vue` con colores específicos HSL:
*   `(+) VENTAS TOTALES` $\rightarrow$ `GraphUp` (verde esmeralda, representa el ingreso).
*   `(-) Costo de Ventas` $\rightarrow$ `GraphDown` (rojo, representa costos directos).
*   `(=) GANANCIA BRUTA` $\rightarrow$ `Coins` (ámbar, primer termómetro de salud).
*   `(-) Gastos de Operación` $\rightarrow$ `Package` (índigo, fijos y estructura).
*   `(-) Gastos de Ventas` $\rightarrow$ `Megaphone` (rosa, publicidad, envíos y envases).
*   `(-) Depreciación` $\rightarrow$ `Settings` (gris, reserva por desgaste).
*   `(=) GANANCIA OPERATIVA` $\rightarrow$ `Coins` (índigo, salud de la operación).
*   `(-) Gastos Financieros` $\rightarrow$ `Safe` (azul, intereses y POS).
*   `(=) UTILIDAD ANTES DE IMPUESTOS` $\rightarrow$ `Coins` (gris, base imponible).
*   `(-) Impuesto a la Renta` $\rightarrow$ `Page` (naranja, tributación).
*   `(=) GANANCIA NETA` $\rightarrow$ `BrightCrown` (amarillo, con micro-animación pulsante, premio mayor).

### 2. Acordeón de Desglose de Insumos Vendidos
Al hacer clic en la línea **Costo de Ventas (Materiales/Operación Directa)**, se despliega un panel interactivo que contiene:
*   **Detalle por Producto Vendido**: Lista cada artículo comercializado indicando las cantidades y el costo de materiales unitario de la ficha.
*   **Tarjeta Comparativa de Devengado**: Muestra en paralelo:
    *   *Costo de Insumos de Ventas (P&L)*: Resta real contable sobre lo vendido.
    *   *Compras Físicas del Mes (Flujo de Caja)*: Egresos en caliente por compras de insumos para stock.
*   **Mensaje Explicativo**: Aporta paz mental contable al usuario explicando por qué el saldo del banco (flujo físico de egresos) difiere de la ganancia real contable, y cómo se resguarda el stock en forma de **Activo** para el futuro.
