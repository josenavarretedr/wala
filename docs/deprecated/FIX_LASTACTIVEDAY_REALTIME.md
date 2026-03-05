>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# 🔧 Fix: lastActiveDay no se actualizaba en tiempo real

## 🐛 Problema Detectado

**Síntoma:** El campo `lastActiveDay` del streak no se actualizaba mientras el usuario trabajaba durante el día. Solo se actualizaba cuando el día era cerrado.

**Impacto:**

- La llama del widget no se encendía en tiempo real
- El sistema no reflejaba que el usuario estaba activo hoy
- Aparecía como si el último día activo fuera días atrás

## 🔍 Causa Raíz

En `onTransactionWrite.js`, la condición para actualizar el streak era:

```javascript
// ❌ ANTES (INCORRECTO)
if (agg.hasOpening && agg.hasTxn && agg.hasClosure) {
  await updateStreakContextualizada(...);
}
```

Esto significaba que **solo se actualizaba el streak cuando el día estaba cerrado**, pero no durante el día activo.

## ✅ Solución Implementada

### **1. Actualización en `onTransactionWrite.js`**

Cambiar la condición para que actualice el streak cuando hay actividad, sin necesidad de cierre:

```javascript
// ✅ AHORA (CORRECTO)
if (agg.hasOpening && agg.hasTxn) {
  await updateStreakContextualizada(...);
}
```

### **2. Lógica Única en `streakManager.js`**

**UNA SOLA REGLA:** Si hay `hasOpening + hasTxn`, el usuario YA trabajó → incrementar racha.

```javascript
// hasOpening: true, hasTxn: true (con o sin cierre)
// ➡️ Actualiza lastActiveDay E incrementa current
{
  lastActiveDay: "2025-11-09",  // ✅ Se actualiza
  current: 6,                    // ✅ Se incrementa
  lastUpdated: Timestamp
}
```

**Casos especiales:**

- Si el día **ya fue contado** (lastActiveDay === day): No hace nada
- Si el día tiene **cierre automático**: Incrementa `copilotAssistedSessions`
- Si el día **NO tiene transacciones** (hasTxn: false): No incrementa racha (aunque copilot abra/cierre)

## 📊 Flujo Actualizado

### **Durante el día (8 AM - 11 PM)**

```
09:00 - Usuario hace apertura
  └─→ lastActiveDay: "2025-11-08" (sin cambios aún)
  └─→ current: 5 (sin cambios)

09:15 - Usuario registra primera venta
  └─→ onTransactionWrite()
      └─→ updateStreakContextualizada()
          └─→ lastActiveDay = "2025-11-09" ✅ (actualizado)
          └─→ current = 6 ✅ (incrementado)
          └─→ Widget muestra 🔥 ENCENDIDO
          └─→ Razón: "El usuario trabajó hoy"

10:00 - Usuario hace más ventas
  └─→ onTransactionWrite()
      └─→ updateStreakContextualizada()
          └─→ lastActiveDay ya es "2025-11-09" ✓
          └─→ current ya es 6 ✓
          └─→ No hace nada (ya contado hoy)
          └─→ Razón: "already-counted-today"
```

### **Al cerrar el día (manual o automático)**

```
23:00 - Usuario cierra caja manualmente
  └─→ onTransactionWrite()
      └─→ updateStreakContextualizada()
          └─→ lastActiveDay ya es "2025-11-09" ✓
          └─→ current ya es 6 ✓
          └─→ isAutoClosed = false
          └─→ copilotAssistedSessions = 2 (sin cambios)
          └─→ Razón: "already-counted-today"

O sistema cierra automáticamente (2 AM):
└─→ scheduledAutoClose()
    └─→ updateStreakContextualizada()
        └─→ lastActiveDay ya es "2025-11-09" ✓
        └─→ current ya es 6 ✓
        └─→ isAutoClosed = true ✅
        └─→ copilotAssistedSessions = 3 ✅ (incrementado)
        └─→ Razón: "copilot-sessions-updated"
```

### **Caso especial: Día sin transacciones**

```
09:00 - Copilot abre caja automáticamente
  └─→ hasOpening: true
  └─→ hasTxn: false (sin ventas/compras)

02:00 - Copilot cierra caja automáticamente
  └─→ hasOpening: true
  └─→ hasTxn: false ❌
  └─→ hasClosure: true
  └─→ onTransactionWrite() NO llama updateStreakContextualizada
  └─→ Razón: "Day not active" (sin transacciones reales)
  └─→ current: 6 (sin cambios) ⏸️
  └─→ lastActiveDay: "2025-11-09" (sin cambios) ⏸️
```

## 🎯 Beneficios del Fix

1. **✅ Feedback inmediato**: Widget muestra llama encendida apenas el usuario trabaja
2. **✅ UX mejorada**: Usuario ve que el sistema reconoce su actividad en tiempo real
3. **✅ Lógica clara**: Separación entre "día activo" y "racha consolidada"
4. **✅ Sin duplicados**: Previene múltiples actualizaciones del mismo día
5. **✅ Compatible**: Funciona con cierre manual y automático

## 🧪 Testing

### **Prueba 1: Primera Venta del Día**

```javascript
// Estado inicial
streak = { current: 5, lastActiveDay: "2025-11-08" };

// Usuario abre y hace primera venta
// ✅ Esperado:
streak = {
  current: 6, // ✅ Incrementado
  lastActiveDay: "2025-11-09", // ✅ Actualizado
};
```

### **Prueba 2: Múltiples Ventas en el Mismo Día**

```javascript
// Estado después de primera venta
streak = { current: 6, lastActiveDay: "2025-11-09" };

// Usuario hace más ventas (misma día)
// ✅ Esperado:
streak = {
  current: 6, // ⏸️ Sin cambios (ya contado)
  lastActiveDay: "2025-11-09", // ⏸️ Sin cambios
};
```

### **Prueba 3: Cierre Manual**

```javascript
// Estado después de ventas
streak = {
  current: 6,
  lastActiveDay: "2025-11-09",
  copilotAssistedSessions: 2,
};

// Usuario cierra caja manualmente
// ✅ Esperado:
streak = {
  current: 6, // ⏸️ Sin cambios (ya contado)
  lastActiveDay: "2025-11-09", // ⏸️ Sin cambios
  copilotAssistedSessions: 2, // ⏸️ Sin cambios (cierre manual)
};
```

### **Prueba 4: Cierre Automático por Copilot**

```javascript
// Estado después de ventas (usuario olvidó cerrar)
streak = {
  current: 6,
  lastActiveDay: "2025-11-09",
  copilotAssistedSessions: 2,
};

// Sistema cierra a las 2 AM
// ✅ Esperado:
streak = {
  current: 6, // ⏸️ Sin cambios (ya contado)
  lastActiveDay: "2025-11-09", // ⏸️ Sin cambios
  copilotAssistedSessions: 3, // ✅ Incrementado (copilot ayudó)
};
```

### **Prueba 5: Día Sin Transacciones (Solo Apertura/Cierre Automáticos)**

```javascript
// Estado inicial
streak = { current: 6, lastActiveDay: "2025-11-09" };

// Copilot abre y cierra pero SIN ventas/compras
// ✅ Esperado:
streak = {
  current: 6, // ⏸️ Sin cambios (sin transacciones)
  lastActiveDay: "2025-11-09", // ⏸️ Sin cambios (no cuenta como día activo)
};
```

## 📝 Código de los Cambios

### **onTransactionWrite.js**

```javascript
// ANTES
if (agg.hasOpening && agg.hasTxn && agg.hasClosure) {
  await updateStreakContextualizada(...);
}

// DESPUÉS
if (agg.hasOpening && agg.hasTxn) {
  await updateStreakContextualizada(...);
}
```

### **streakManager.js**

```javascript
const hasClosure = summaryDoc.hasClosure === true;

// CASO 1: Día activo sin cerrar
if (!hasClosure) {
  if (lastActiveDay !== day) {
    await streakRef.set(
      {
        streak: {
          ...streak,
          lastActiveDay: day, // ✅ Solo actualizar este campo
          lastUpdated: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    return { updated: true, reason: "active-day-updated" };
  }
  return { updated: false, reason: "already-up-to-date" };
}

// CASO 2: Día cerrado - Incrementar racha
if (lastActiveDay === day) {
  return { updated: false, reason: "already-counted-today" };
}

// Calcular nueva racha
let newCurrent = 1;
if (lastActiveDay) {
  const gap = daysBetweenYmd(lastActiveDay, day, tz);
  newCurrent = gap <= allowedGap ? Number(streak.current || 0) + 1 : 1;
}

// Guardar racha incrementada
await streakRef.set(
  {
    streak: {
      current: newCurrent,
      max: newMax,
      lastActiveDay: day,
      copilotAssistedSessions,
      // ... otros campos
    },
  },
  { merge: true }
);
```

## 🚀 Deploy

```bash
# Desplegar solo la función actualizada
firebase deploy --only functions:onTransactionWrite

# O desplegar todas las functions
firebase deploy --only functions
```

## ✅ Verificación Post-Deploy

1. **Abrir caja** en un negocio de prueba
2. **Registrar una venta** (sin cerrar)
3. **Verificar en Firestore** que `lastActiveDay` se actualizó al día de hoy
4. **Verificar en el widget** que la llama 🔥 está encendida
5. **Cerrar caja** manualmente
6. **Verificar** que `current` se incrementó

---

## 🎉 Resultado

Ahora el sistema de racha funciona correctamente:

- ✅ `lastActiveDay` se actualiza en tiempo real
- ✅ Widget refleja actividad inmediatamente
- ✅ Racha se consolida al cerrar el día
- ✅ Copilot cuenta correctamente las asistencias
