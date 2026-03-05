# 🔥 Sistema de Racha Unificado - Implementación Completa

## 📋 Resumen de Cambios

Se ha implementado exitosamente el sistema de racha unificado con las siguientes mejoras:

### ✅ **Backend (Firebase Functions)**

1. **`streakManager.js` - Sistema Único de Racha**

   - ✅ Logs condicionales (`IS_DEV`) para debugging
   - ✅ Función `updateStreakContextualizada()` como fuente única de verdad
   - ✅ Política fija `autoClosePolicy: 'lenient'` (valorar esfuerzo)
   - ✅ Exporta helpers: `isActiveDay`, `wasCopilotClosed`, `daysBetweenYmd`

2. **`scheduledAutoClose.js`**

   - ✅ Ya integrado con `updateStreakContextualizada()`
   - ✅ No requiere cambios (sistema correcto)

3. **`lazyCloseIfNeeded.js`**

   - ✅ Migrado de `breakStreak` a `updateStreakContextualizada()`
   - ✅ Usa política `lenient`

4. **`onTransactionWrite.js`**

   - ✅ Actualiza racha cuando día está completo (`hasOpening && hasTxn && hasClosure`)
   - ✅ Usa política `lenient`

5. **`sharedStreak.js`**
   - ✅ **ELIMINADO** (lógica unificada en `streakManager.js`)

---

### ✅ **Frontend (Vue 3)**

1. **`StreakWidget.vue`**

   - ✅ Visualización de `copilotAssistedSessions`
   - ✅ Mantiene navegación con `goToStreakView()`
   - ✅ Estados de día (Apertura, Transacciones, Cierre)

2. **`useStreakRisk.js` (Composable)**

   - ✅ Calcula nivel de riesgo de pérdida de racha
   - ✅ Niveles: `none`, `safe`, `medium`, `high`, `critical`
   - ✅ Retorna: `riskLevel`, `daysRemaining`, `message`, `color`, `icon`

3. **`StreakRiskBanner.vue` (Componente)**
   - ✅ Banner de alerta de riesgo
   - ✅ Colores dinámicos según nivel
   - ✅ Botón CTA "Registrar venta" (crítico/alto)

---

## 🚀 Cómo Usar el Sistema

### **1. En el Backend (Functions)**

#### Actualizar racha después de cerrar día:

```javascript
const { updateStreakContextualizada } = require("../Streak/streakManager");

await updateStreakContextualizada({
  db,
  businessId: "abc123",
  day: "2025-01-15",
  summary: dailySummaryDoc, // Objeto con hasOpening, hasTxn, hasClosure, isAutoClosed
  tz: "America/Lima",
  autoClosePolicy: "lenient", // Siempre valorar esfuerzo
});
```

#### Recalcular ritmo manualmente (opcional):

```javascript
const { recalcRhythmAndMode } = require("../Streak/streakManager");

await recalcRhythmAndMode(db, businessId, "America/Lima");
```

---

### **2. En el Frontend (Vue)**

#### **A) Integrar Banner de Riesgo en Dashboard**

```vue
<template>
  <div class="dashboard-container p-4 sm:p-6">
    <!-- ✨ Banner de riesgo de racha -->
    <StreakRiskBanner
      v-if="streakData"
      :risk="streakRisk"
      :streak-data="streakData"
      :show-details="true"
      :show-action-button="true"
      @take-action="handleTakeAction"
    />

    <!-- Resto del dashboard -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StreakWidget />
      <!-- Otros widgets -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { doc, onSnapshot } from "firebase/firestore";
import { useRoute, useRouter } from "vue-router";
import { db } from "@/firebaseInit";
import StreakRiskBanner from "@/components/Dashboard/StreakRiskBanner.vue";
import StreakWidget from "@/components/Dashboard/StreakWidget.vue";
import { useStreakRisk } from "@/composables/useStreakRisk";

const route = useRoute();
const router = useRouter();
const businessId = route.params.businessId;

const streakData = ref(null);

// Usar composable de riesgo
const streakRisk = useStreakRisk(streakData);

// Cargar datos del streak en tiempo real
onMounted(() => {
  const businessRef = doc(db, "businesses", businessId);
  onSnapshot(businessRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      streakData.value = data.streak || null;
    }
  });
});

const handleTakeAction = () => {
  // Navegar a crear transacción de ingreso
  router.push({
    name: "NewTransaction",
    params: { businessId },
    query: { type: "income" },
  });
};
</script>
```

#### **B) Usar el Composable directamente**

```vue
<script setup>
import { ref, computed } from "vue";
import { useStreakRisk } from "@/composables/useStreakRisk";

const streakData = ref({
  current: 5,
  max: 15,
  lastActiveDay: "2025-01-15",
  allowedGap: 5,
  copilotAssistedSessions: 2,
});

const { riskLevel, daysRemaining, message, color, icon } =
  useStreakRisk(streakData);

const showWarning = computed(() => {
  return riskLevel.value === "high" || riskLevel.value === "critical";
});
</script>

<template>
  <div v-if="showWarning" :class="`alert-${color}`">
    {{ icon }} {{ message }}
  </div>
</template>
```

---

## 📊 Estructura de Datos en Firestore

### **Documento del Negocio**

```javascript
businesses/{businessId}
└── streak: {
      mode: 'auto',                    // 'auto' | 'daily' | 'eventual'
      current: 5,                      // Racha actual
      max: 15,                         // Racha máxima histórica
      lastActiveDay: "2025-01-15",    // Último día que contó
      medianGap: 1.5,                 // Brecha mediana entre días activos
      allowedGap: 5,                  // Brecha permitida (medianGap * 1.5)
      copilotAssistedSessions: 3,     // Días cerrados por copilot
      lastUpdated: Timestamp
    }
```

### **DailySummary de cada día**

```javascript
businesses/{businessId}/dailySummaries/{yyyy-LL-dd}
└── {
      day: "2025-01-15",
      hasOpening: true,
      hasTxn: true,              // ✅ Define "día activo"
      hasClosure: true,
      isAutoClosed: false,       // ✅ Define "copilot closed"
      autoCloseReason: null,     // 'scheduled' | 'lazyOpen' | null
      closureId: "uuid-123",
      totals: { income: 500, expense: 300, ... },
      // ... más datos financieros
    }
```

---

## 🎯 Reglas de Negocio

### **¿Cuándo se actualiza la racha?**

La racha se actualiza cuando:

1. ✅ `hasOpening: true` (día tiene apertura)
2. ✅ `hasTxn: true` (día tiene transacciones reales)
3. ✅ `hasClosure: true` (día está cerrado, manual o automático)

**Momento de actualización:** Al cerrar el día (trigger: `onTransactionWrite` o `scheduledAutoClose` o `lazyCloseIfNeeded`)

### **¿Qué es un "día activo"?**

Un día es activo cuando `hasTxn === true`, lo cual sucede cuando hay:

- ✅ Transacciones de `income` (que no sean `opening_adjustment`)
- ✅ Transacciones de `expense` (que no sean `closure_adjustment`)

NO cuentan como días activos:

- ❌ Solo transferencias (`transfer`)
- ❌ Solo ajustes (`adjustment`)
- ❌ Solo apertura/cierre (`opening`/`closure`)

### **Política de Cierre Automático**

- **`autoClosePolicy: 'lenient'`** (por defecto)

  - ✅ Días cerrados por copilot **SÍ** cuentan para la racha
  - ✅ Se valora el esfuerzo del usuario (apertura + transacciones)
  - ✅ `copilotAssistedSessions` es solo un contador estadístico

- **`autoClosePolicy: 'strict'`** (no implementado, para futuro)
  - ❌ Días cerrados por copilot **NO** cuentan para la racha
  - Solo días cerrados manualmente incrementan la racha

---

## 🧪 Escenarios de Prueba

### **Escenario 1: Día Completo Manual**

```
1. Usuario abre caja (hasOpening: true)
2. Usuario registra ventas/compras (hasTxn: true)
3. Usuario cierra caja manualmente (hasClosure: true, isAutoClosed: false)

➡️ Racha incrementa: current++
➡️ copilotAssistedSessions: sin cambios
```

### **Escenario 2: Día con Cierre Automático Programado**

```
1. Usuario abre caja
2. Usuario registra ventas/compras
3. Sistema cierra automáticamente a las 2 AM (isAutoClosed: true, autoCloseReason: 'scheduled')

➡️ Racha incrementa: current++ (política lenient)
➡️ copilotAssistedSessions++
```

### **Escenario 3: Día con Cierre Lazy (al abrir nuevo día)**

```
1. Usuario olvida cerrar día anterior
2. Usuario abre nuevo día → sistema cierra anterior (isAutoClosed: true, autoCloseReason: 'lazyOpen')

➡️ Racha incrementa: current++ (política lenient)
➡️ copilotAssistedSessions++
```

### **Escenario 4: Día sin Transacciones**

```
1. Usuario abre caja
2. NO registra transacciones (hasTxn: false)
3. Sistema cierra automáticamente

➡️ NO incrementa racha (no es día activo)
➡️ copilotAssistedSessions: sin cambios
```

### **Escenario 5: Brecha Larga**

```
1. Usuario tiene racha de 5 días
2. Usuario no usa la app por 10 días (allowedGap = 5)
3. Usuario abre y registra venta el día 11

➡️ Racha reinicia: current = 1
➡️ Razón: brecha (10 días) > brecha permitida (5 días)
```

---

## 🐛 Debugging

### **Logs en Development**

En ambiente de desarrollo (`FUNCTIONS_EMULATOR=true`), verás logs detallados:

```
🔥 [STREAK] Actualizando racha - Business: abc123, Día: 2025-01-15
📋 [STREAK] DailySummary: { hasOpening: true, hasTxn: true, hasClosure: true, isAutoClosed: true }
🎯 [STREAK] Decisión: { día: '2025-01-15', esActivo: true, cerradoPorCopilot: true, ... }
🟢 [STREAK] Gap: 1 días (permitido: 5)
🟢 [STREAK] Nueva racha: 6
✅ [STREAK] GUARDADO - Business: abc123 { current: 6, max: 15, copilotAssisted: 3 }
```

### **Logs en Production**

En producción, solo se muestran logs críticos:

```
✅ [STREAK] GUARDADO - Business: abc123 { current: 6, max: 15, copilotAssisted: 3 }
```

---

## 📝 Próximos Pasos (Opcional)

1. **Tests Unitarios**

   - Crear tests para `updateStreakContextualizada()`
   - Validar escenarios edge case

2. **Dashboard de Racha**

   - Vista detallada de historial de racha
   - Gráfico de progreso temporal
   - Badges/logros por milestones

3. **Notificaciones Push**

   - Alertas de riesgo de pérdida de racha
   - Felicitaciones por milestones

4. **Gamificación**
   - Sistema de badges
   - Ranking entre negocios (si aplica)
   - Rewards por rachas largas

---

## ✅ Checklist de Implementación

- [x] Actualizar `streakManager.js` con logs mejorados
- [x] Actualizar `scheduledAutoClose.js` (ya estaba correcto)
- [x] Actualizar `lazyCloseIfNeeded.js`
- [x] Actualizar `onTransactionWrite.js`
- [x] Eliminar `sharedStreak.js`
- [x] Actualizar `StreakWidget.vue`
- [x] Crear `useStreakRisk.js`
- [x] Crear `StreakRiskBanner.vue`
- [x] Documentar sistema completo

---

## 🎉 ¡Implementación Completa!

El sistema de racha está completamente funcional y listo para usar. Todos los cambios son retrocompatibles y no requieren migración de datos.

**Filosofía del sistema:**

> **"Valorar el esfuerzo del usuario, no la perfección en los rituales rutinarios"**

El copilot es un asistente que ayuda a mantener la consistencia, no un juez que penaliza olvidos menores.


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

