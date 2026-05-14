# Integración de Lazy Close - Documentación Completa

**Fecha:** Mayo 2026 (Actualización Multi-Día)  
**Estado:** ✅ Implementado y Optimizado

---

## 🎯 Objetivo

Garantizar la continuidad financiera del negocio cerrando automáticamente TODOS los días que hayan quedado abiertos sin cierre manual. Esta operación se conoce como "Lazy Close" y se dispara bajo demanda cuando el usuario interactúa con la pantalla de apertura de caja.

---

## 🔄 Flujo Multi-Día en Cadena

A diferencia del diseño inicial que solo revisaba el día inmediatamente anterior (ayer), la versión actual implementa un sistema de **cierre en cadena** que puede procesar brechas de múltiples días consecutivos de inactividad.

```
Usuario interactúa con App de Balances
         ↓
checkLazyClose() en AccountBalanceAppWrapper
    ├─ ensureBusinessId()
    ├─ httpsCallable(functions, "lazyCloseIfNeeded")
    └─ Llama a Cloud Function
         ↓
Cloud Function lazyCloseIfNeeded (Multi-Día)
    ├─ Valida autenticación y businessId
    ├─ Obtiene timezone del negocio
    ├─ Bucle hacia atrás (hasta 30 días de lookback):
    │    ├─ Lee dailySummary de cada día
    │    ├─ Si !summary -> Skip (sin actividad)
    │    ├─ Si hasOpening && !hasClosure -> Añadir a pendingDays
    │    └─ Si hasClosure -> BREAK (cadena interrumpida por un día cerrado)
    │
    ├─ Invertir orden cronológico (más antiguo primero) 🔄
    │
    ├─ Para cada día pendiente:
    │    ├─ Obtener agregados finales del día (getDayAggregates)
    │    ├─ Crear transacción de cierre (UUID coincidente con ID)
    │    │  └─ Asigna balances y totales acumulados por onTransactionWrite
    │    ├─ Actualizar dailySummary con completedAt y closureId
    │    └─ Actualizar Racha con streakManager (autoClosePolicy: lenient)
    │
    └─ Retorna resumen de días cerrados:
         └─ { closed: true, mode: 'lazyOpen', daysCount, closedDays[] }
```

### 💡 ¿Por qué cierre cronológico invertido?
Los saldos iniciales de cada día dependen matemáticamente del saldo final del día anterior. Al cerrar en orden cronológico (lunes → martes → miércoles), aseguramos que el saldo acumulado fluye correctamente a través de la historia del negocio hasta el día actual.

---

## 🛠️ Implementación Técnica

### Cloud Function (`lazyCloseIfNeeded.js`)

La función principal ahora itera sobre un `MAX_LOOKBACK_DAYS = 30` y delega el guardado del cierre a una subfunción optimizada `createClosureForDay`.

#### Estructura del Cierre Creado:
*   **UUID**: Identificador único persistido tanto en la colección `transactions` como en el campo `closureId` del resumen diario.
*   **Tipo**: `closure`
*   **Source / Mode**: `copilot` / `lazyOpen`
*   **createdAt**: Se establece forzadamente al final del día correspondiente (23:59:59) para que el orden de transacciones dentro de Firestore se mantenga consistente con la fecha lógica del negocio, no con la ejecución real de la cloud function.
*   **Ajustes**: Se asume `0` de diferencia dado que no hubo conteo de efectivo real por parte del usuario.

---

## 📈 Manejo de Racha (Streak)

La integración con el módulo de gamificación utiliza el `streakManager` invocando `updateStreakContextualizada`.
Se utiliza la política `autoClosePolicy: 'lenient'`. El sistema no castiga la racha por el mero hecho de que el cierre se haya automatizado, siempre y cuando el usuario haya registrado ventas o movimientos durante el día activo (independiente del cierre).

---

## ✅ Reglas de Integridad

1.  **Skip por Inactividad**: Si no existe un `dailySummary` para una fecha en el bucle de búsqueda, significa que el negocio no tuvo apertura ni transacciones ese día. El algoritmo pasa de largo sin crear aperturas ni cierres innecesarios.
2.  **Cortafuegos de Búsqueda**: Tan pronto como la búsqueda encuentra un día que ya cuenta con un cierre formal (`hasClosure: true`), el ciclo se detiene inmediatamente para evitar consumir recursos de lectura en la historia antigua del negocio que ya está consolidada.
3.  **Persistencia en Auditoría**: Cada cierre automatizado se registra en `traceability_logs` bajo el tipo de operación `auto_close` con toda la data financiera congelada del momento para auditorías posteriores.
