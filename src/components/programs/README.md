# 📁 Componentes del Módulo "Juntos"

## 🎯 Descripción

Esta carpeta contiene componentes reutilizables para el módulo de Programas de Acompañamiento Empresarial "Juntos".

---

## 📦 Componentes Disponibles

### 1. **ProgramFormInput.vue**

Input de texto reutilizable con validación y estilos consistentes.

**Props:**

- `id` (String, requerido): ID único del input
- `label` (String): Etiqueta del campo
- `modelValue` (String|Number): Valor del input (v-model)
- `type` (String): Tipo de input (default: 'text')
- `placeholder` (String): Texto de ayuda
- `required` (Boolean): Si el campo es obligatorio
- `disabled` (Boolean): Si el campo está deshabilitado
- `hint` (String): Texto de ayuda debajo del input
- `error` (String): Mensaje de error a mostrar

**Uso:**

```vue
<ProgramFormInput
  id="program-name"
  v-model="formData.name"
  label="Nombre del Programa"
  placeholder="Ej: Fortalecimiento Empresarial 2025"
  required
  hint="Nombre descriptivo que identifique el programa"
  :error="errors.name"
/>
```

---

### 2. **ProgramFormTextarea.vue**

Textarea reutilizable para descripciones largas.

**Props:**

- `id` (String, requerido): ID único del textarea
- `label` (String): Etiqueta del campo
- `modelValue` (String): Valor del textarea (v-model)
- `placeholder` (String): Texto de ayuda
- `required` (Boolean): Si el campo es obligatorio
- `disabled` (Boolean): Si el campo está deshabilitado
- `rows` (Number): Número de filas visibles (default: 4)
- `hint` (String): Texto de ayuda
- `error` (String): Mensaje de error

**Uso:**

```vue
<ProgramFormTextarea
  id="program-description"
  v-model="formData.description"
  label="Descripción"
  placeholder="Describe los objetivos del programa..."
  required
  :rows="5"
  hint="Proporciona una descripción detallada"
  :error="errors.description"
/>
```

---

### 3. **ProgramFormDatePicker.vue**

Selector de fechas con validación de rangos.

**Props:**

- `id` (String, requerido): ID único del input
- `label` (String): Etiqueta del campo
- `modelValue` (String): Fecha en formato YYYY-MM-DD (v-model)
- `required` (Boolean): Si el campo es obligatorio
- `disabled` (Boolean): Si el campo está deshabilitado
- `min` (String): Fecha mínima permitida (YYYY-MM-DD)
- `max` (String): Fecha máxima permitida (YYYY-MM-DD)
- `hint` (String): Texto de ayuda
- `error` (String): Mensaje de error

**Uso:**

```vue
<ProgramFormDatePicker
  id="program-start-date"
  v-model="formData.startDate"
  label="Fecha de Inicio"
  required
  :min="todayDate"
  hint="Inicio del programa"
  :error="errors.startDate"
/>
```

---

### 4. **ProgramFormPhaseManager.vue**

Gestor interactivo de fases del programa (agregar, editar, eliminar).

**Props:**

- `modelValue` (Array): Array de strings con los nombres de las fases

**Eventos:**

- `update:modelValue`: Emitido cuando cambia el array de fases

**Características:**

- Agregar nuevas fases
- Editar fases existentes
- Eliminar fases (mínimo 1)
- Numeración automática
- Animaciones de entrada/salida

**Uso:**

```vue
<ProgramFormPhaseManager v-model="formData.phases" />

<script setup>
const formData = ref({
  phases: ["baseline", "training", "implementation", "evaluation"],
});
</script>
```

---

### 5. **ProgramCard.vue**

Card visual para mostrar información resumida de un programa.

**Props:**

- `program` (Object, requerido): Objeto del programa con estructura:
  ```javascript
  {
    id: 'program-id',
    name: 'Nombre del Programa',
    organizationName: 'ONG Name',
    description: 'Descripción...',
    metadata: {
      duration: '6 meses',
      startDate: Timestamp,
      endDate: Timestamp,
      phases: ['fase1', 'fase2']
    },
    membership: {
      joinedAt: Timestamp,
      status: 'active'
    }
  }
  ```

**Eventos:**

- `click`: Emitido al hacer clic en el card

**Uso:**

```vue
<ProgramCard
  v-for="program in programs"
  :key="program.id"
  :program="program"
  @click="goToProgram(program.id)"
/>
```

---

## 🎨 Paleta de Colores

Los componentes usan la siguiente paleta de colores consistente con el módulo "Juntos":

- **Primary (Teal)**: `bg-teal-600`, `text-teal-600`, `border-teal-500`
- **Secondary (Blue)**: `bg-blue-600`, `text-blue-600`
- **Success (Green)**: `text-green-600`, `bg-green-50`
- **Error (Red)**: `text-red-600`, `bg-red-50`, `border-red-300`
- **Neutral (Gray)**: `bg-gray-50`, `text-gray-600`, `border-gray-200`

---

## 📝 Convenciones de Código

### Estructura de Props

Todos los componentes siguen estas convenciones:

1. **Props requeridos primero** (id, modelValue, program)
2. **Props opcionales después** (label, placeholder, hint)
3. **Props booleanos** (required, disabled)
4. **Valores por defecto claros**

### Emisión de Eventos

- Usar `update:modelValue` para v-model
- Eventos descriptivos: `click`, `submit`, `cancel`
- Nombres en camelCase

### Estilos

- Usar Tailwind CSS
- Evitar CSS personalizado excepto para animaciones
- Mantener consistencia en espaciado (px-4, py-3, gap-3)
- Bordes redondeados: `rounded-xl` para cards, `rounded-lg` para inputs

---

## 🔧 Uso en Vistas

### Importación

```vue
<script setup>
import ProgramFormInput from "@/components/programs/ProgramFormInput.vue";
import ProgramFormTextarea from "@/components/programs/ProgramFormTextarea.vue";
import ProgramFormDatePicker from "@/components/programs/ProgramFormDatePicker.vue";
import ProgramFormPhaseManager from "@/components/programs/ProgramFormPhaseManager.vue";
import ProgramCard from "@/components/programs/ProgramCard.vue";
</script>
```

### Ejemplo Completo

Ver: [`src/views/business/programs/CreateProgram.vue`](../../views/business/programs/CreateProgram.vue)

---

## 🚀 Futuras Mejoras

- [ ] Agregar componente `ProgramFormSelect` para dropdowns
- [ ] Agregar validación asíncrona en inputs
- [ ] Crear `ProgramFormChipInput` para tags
- [ ] Implementar `ProgramMetricsCard` para métricas
- [ ] Agregar soporte para carga de imágenes del programa
- [ ] Crear wizard multi-paso para creación de programas complejos

---

## 📚 Documentación Relacionada

- [Vista CreateProgram](../../views/business/programs/CreateProgram.vue)
- [Composable usePrograms](../../composables/usePrograms.js)
- [Store programStore](../../stores/programStore.js)
- [Firestore Rules](../../../firestore.rules)

---

**Última actualización:** 16 de diciembre de 2025
