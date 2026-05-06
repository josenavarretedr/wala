# `productCostingStore.js` — Documentación del Store de Costeo de Productos

**Archivo:** `src/stores/productCostingStore.js`
**Store ID:** `productCosting`
**Tipo:** Pinia Store (Composition API)
**Módulo:** Costeo de Productos (CIF, MOD, Materiales, Overhead)

---

## Descripción General

El `useProductCostingStore` gestiona el cálculo de costos de producción para un producto. Implementa los 4 componentes del costo:

- **Materiales** — Costo de materiales directos por artículo
- **MOD** — Mano de Obra Directa por artículo
- **CIF** — Costos Indirectos de Fabricación por artículo
- **Overhead** — Gastos Generales por artículo

Además gestiona la **composición de materiales** del producto.

---

## State

| Propiedad              | Tipo                | Descripción                            |
| ---------------------- | ------------------- | -------------------------------------- |
| `currentProductId`     | `Ref<String\|null>` | ID del producto actualmente en costeo  |
| `costs`                | `Ref<Object>`       | Objeto con los 4 tipos de costo        |
| `materialsComposition` | `Ref<Object>`       | Composición de materiales del producto |

### Estructura de `costs`

```javascript
{
  materials: null,  // Costo de materiales por artículo
  mod: null,        // Costo MOD por artículo
  cif: null,        // Costo CIF por artículo
  overhead: null    // Gastos generales por artículo
}
```

### Estructura de `materialsComposition`

```javascript
{
  items: [],             // [{productId, description, quantity, unit, costPerUnit, subtotal}]
  totalCost: 0,          // Suma calculada de subtotales
  hasChanges: false,     // Si hay cambios sin guardar
  loadedFromFirestore: false,
  originalData: []       // Copia original para comparación
}
```

---

## Getters (Computed)

| Getter                  | Retorna        | Descripción                                      |
| ----------------------- | -------------- | ------------------------------------------------ |
| `hasMaterialsCost`      | `Boolean`      | Si hay costo de materiales guardado              |
| `hasMODCost`            | `Boolean`      | Si hay costo MOD guardado                        |
| `hasCIFCost`            | `Boolean`      | Si hay costo CIF guardado                        |
| `hasOverheadCost`       | `Boolean`      | Si hay costo de overhead guardado                |
| `totalCost`             | `Number\|null` | Suma de todos los costos disponibles             |
| `hasAnyCost`            | `Boolean`      | Si hay al menos 1 costo guardado                 |
| `materialsWithCost`     | `Array`        | Materiales de la composición con costo calculado |
| `materialsCostProgress` | `Object`       | Progreso de materiales sin/con costo             |
| `materialsWithoutCost`  | `Array`        | Materiales sin precio unitario definido          |
| `hasUnsavedChanges`     | `Boolean`      | Si `materialsComposition.hasChanges` es true     |

---

## Actions

### Inicialización

#### `initializeProduct(productId)`

**Descripción:** Inicializa el store para un producto específico. Carga costos existentes desde Firestore.

---

### Actualización de costos

| Action                      | Descripción                        |
| --------------------------- | ---------------------------------- |
| `updateMaterialsCost(cost)` | Actualiza el costo de materiales   |
| `updateMODCost(cost)`       | Actualiza el costo de mano de obra |
| `updateCIFCost(cost)`       | Actualiza el costo CIF             |
| `updateOverheadCost(cost)`  | Actualiza el costo de overhead     |
| `resetCosts()`              | Limpia todos los costos            |

### Persistencia

#### `saveCosts()`

**Descripción:** Guarda todos los costos en Firestore para el `currentProductId`.

#### `getCostByType(type)`

**Descripción:** Retorna el costo de un tipo específico.
**Parámetros:** `type` — `'materials'` | `'mod'` | `'cif'` | `'overhead'`

---

### Composición de materiales

| Action                                         | Descripción                                        |
| ---------------------------------------------- | -------------------------------------------------- |
| `loadComposition(productId)`                   | Carga la composición de materiales desde Firestore |
| `addMaterialToComposition(material)`           | Agrega un material a la composición                |
| `updateMaterialQuantity(materialId, quantity)` | Actualiza la cantidad de un material               |
| `removeMaterial(materialId)`                   | Elimina un material de la composición              |
| `calculateTotalCost()`                         | Recalcula el `totalCost` de la composición         |
| `resetComposition()`                           | Limpia la composición                              |
| `hasMaterialsWithoutCost()`                    | Verifica si algún material no tiene precio         |

---

## Uso en Componentes

`CostsMaterials.vue`, `CostsMOD.vue`, `CostsCIF.vue`, `CostsOverhead.vue`, `ProductCosting.vue`

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
