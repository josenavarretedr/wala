# `businessOnboardingFlowStore.js` — Documentación del Store de Onboarding

**Archivo:** `src/stores/businessOnboardingFlowStore.js`
**Store ID:** `businessOnboardingFlow`
**Tipo:** Pinia Store (Composition API)
**Módulo:** Onboarding — Creación de Negocio

---

## Descripción General

El `useBusinessOnboardingFlowStore` gestiona el flujo wizard de creación de un nuevo negocio. Implementa un sistema de pasos con validación por step.

---

## State

| Propiedad                | Tipo           | Descripción                          |
| ------------------------ | -------------- | ------------------------------------ |
| `currentStepIndex`       | `Ref<Number>`  | Índice del paso actual (0-based)     |
| `isFlowActive`           | `Ref<Boolean>` | Si el wizard está activo             |
| `businessOnboardingData` | `Ref<Object>`  | Datos del formulario en construcción |
| `steps`                  | `Array`        | Configuración estática de los pasos  |

### Datos del formulario

```javascript
businessOnboardingData = {
  nombre: "",
  industry: "",
  businessType: "",
  descripcion: "",
};
```

### Configuración de pasos

| Paso | Componente                    | Validación                        |
| ---- | ----------------------------- | --------------------------------- |
| 0    | `StepBusinessName.vue`        | `nombre.trim().length > 0`        |
| 1    | `StepIndustry.vue`            | `industry !== ''`                 |
| 2    | `StepBusinessType.vue`        | `businessType !== ''`             |
| 3    | `StepBusinessDescription.vue` | `descripcion.trim().length >= 10` |

---

## Getters (Computed)

| Getter              | Retorna   | Descripción                                                |
| ------------------- | --------- | ---------------------------------------------------------- |
| `currentStepConfig` | `Object`  | Configuración del paso actual (componente, label, isValid) |
| `totalSteps`        | `Number`  | Total de pasos (4)                                         |
| `isFirstStep`       | `Boolean` | Si es el primer paso                                       |
| `isLastStep`        | `Boolean` | Si es el último paso                                       |
| `canGoNext`         | `Boolean` | Si puede avanzar (paso actual válido)                      |
| `isCreateMode`      | `Boolean` | Modo creación (vs edición)                                 |

---

## Actions

| Action                      | Descripción                                             |
| --------------------------- | ------------------------------------------------------- |
| `startFlow()`               | Inicia el wizard, resetea datos y activa `isFlowActive` |
| `nextStep()`                | Avanza al siguiente paso (requiere validación)          |
| `previousStep()`            | Retrocede al paso anterior                              |
| `goToStep(index)`           | Navega a un paso específico                             |
| `cancelFlow()`              | Cancela el wizard y redirige                            |
| `resetFormData()`           | Limpia los datos del formulario                         |
| `updateField(field, value)` | Actualiza un campo del formulario                       |
| `getValidationError()`      | Retorna el mensaje de error del paso actual             |

---

## Uso en Componentes

- `StepBusinessName.vue`
- `StepIndustry.vue`
- `StepBusinessType.vue`
- `StepBusinessDescription.vue`
- `NavigationBtnBusinessOnboarding.vue`
- `Header.vue`
- `BusinessOnboarding.vue` (vista)

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
