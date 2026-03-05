# `productMetricsStore.js` — Documentación del Store de Métricas de Producto

**Archivo:** `src/stores/Inventory/productMetricsStore.js`
**Store ID:** `productMetrics`
**Tipo:** Pinia Store (Composition API)
**Módulo:** Inventario — Métricas y Análisis de Productos

---

## Descripción General

El `useProductMetricsStore` es un store de **utilidades de cálculo** para métricas avanzadas de productos. No tiene state propio — expone exclusivamente funciones de cálculo que reciben los datos como parámetros.

Métricas que calcula:

- Última actualización del producto
- Rotación de inventario (días promedio entre ventas)
- Balance de unidades (últimos 30 días vs histórico)
- Valor total en stock
- Estado de rentabilidad y margen de venta

---

## State

Este store **no tiene state**. Todas las funciones son utilitarias que reciben datos externos.

---

## Actions / Funciones

### `getLastUpdate(stockLog)`

**Descripción:** Obtiene la última actualización del producto.
**Parámetros:** `stockLog` — Array de movimientos de stock ordenados por fecha DESC.
**Retorna:**

```javascript
{
  date: Date | null,
  type: String,              // tipo del último movimiento
  formattedDate: String,     // "15 mar 2026, 10:30"
  relativeTime: String       // "hace 2 días"
}
```

---

### `getRotationDays(stockLog)`

**Descripción:** Calcula los días promedio entre ventas (rotación de inventario).
**Parámetros:** `stockLog` — Array de movimientos.
**Retorna:**

```javascript
{
  days: Number | null,       // Días promedio entre ventas
  label: String,             // "Alta rotación" | "Media" | "Baja" | etc.
  color: String,
  bgClass: String
}
```

---

### `getUnitBalance(stockLog)`

**Descripción:** Calcula el balance de unidades:

- Ventas de los últimos 30 días
- Compras de los últimos 30 días
- Histórico total

**Retorna:** `{ last30Days: { sold, bought }, total: { sold, bought } }`

---

### `getStockValue(product)`

**Descripción:** Calcula el valor total del stock en dinero.
**Parámetros:** `product` — Object con `stock` y `price` / `costPrice`.
**Retorna:** `{ value: Number, currency: 'PEN' }`

---

### `getProfitabilityStatus(product)`

**Descripción:** Evalúa la rentabilidad del producto basándose en sus costos y precio de venta.
**Retorna:**

```javascript
{
  label: String,    // "Alta rentabilidad" | "Media" | "Baja" | etc.
  color: String,
  bgClass: String,
  icon: String,
  description: String
}
```

---

### `getSaleMarginStatus(margin)`

**Descripción:** Evalúa el estado del margen de venta.
**Parámetros:** `margin` — Number (porcentaje de margen).
**Retorna:** Mismo formato que `getProfitabilityStatus`.

---

## Uso en Componentes

- `ProductBalanceCard.vue`
- `ProductEconomicInfo.vue`
- `ProductHeader.vue`
- `ProductMetricsCard.vue`

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
