# Integración de Lazy Close - Documentación Completa

**Fecha:** 19 de octubre de 2025  
**Estado:** ✅ Configuración completa - Debugging en progreso

---

## 🎯 Objetivo

Llamar automáticamente a la Cloud Function `lazyCloseIfNeeded` cuando el usuario entra a `AccountBalanceAppWrapper` para verificar si el día anterior quedó sin cerrar y cerrarlo automáticamente.

---

## ✅ Cambios Implementados

### 1. **firebaseInit.js** - Configuración de Functions

```javascript
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const functions = getFunctions(appFirebase, "us-central1");

if (window.location.hostname === "localhost") {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
  connectStorageEmulator(storage, "localhost", 9199);
  connectFunctionsEmulator(functions, "localhost", 5001); // ⭐ Nuevo
  console.log("🔌 Emuladores conectados: Firestore, Auth, Storage, Functions");
}

export { db, auth, storage, functions }; // ⭐ functions exportado
```

### 2. **AccountBalanceAppWrapper.vue** - Llamada a la Función

```javascript
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebaseInit";
import { useAuth } from "@/composables/useAuth";

const { getCurrentUser } = useAuth();

onMounted(async () => {
  // 1. Esperar autenticación
  const user = await getCurrentUser();
  if (!user) return;

  // 2. Delay para token
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 3. Llamar a lazyCloseIfNeeded
  await checkLazyClose();

  // 4. Cargar transacciones
  await transactionStore.getTransactionsToday();

  // 5. Verificar apertura
  hasOpeningTransaction.value = transactionStore.transactionsInStore.value.some(
    (tx) => tx.type === "opening"
  );
});

const checkLazyClose = async () => {
  const businessId = ensureBusinessId();
  const currentUser = auth.currentUser;

  if (!currentUser) return;

  // Refresh del token
  await currentUser.getIdToken(true);

  // Llamar función callable
  const lazyCloseIfNeeded = httpsCallable(functions, "lazyCloseIfNeeded");
  const result = await lazyCloseIfNeeded({ businessId });

  const { data } = result;

  if (data.closed) {
    console.log("🤖 Cierre automático ejecutado:", data);
    await transactionStore.getTransactionsToday(); // Recargar
  } else {
    console.log("ℹ️ No se requiere cierre automático:", data);
  }
};
```

---

## 🔄 Flujo Completo

```
Usuario entra a /accounts-balance-app
         ↓
AccountBalanceAppWrapper.vue monta
         ↓
onMounted se ejecuta
         ↓
1. getCurrentUser() → Espera autenticación
         ↓
2. Delay 100ms → Asegura token disponible
         ↓
3. checkLazyClose()
   ├─ ensureBusinessId()
   ├─ auth.currentUser verificado
   ├─ getIdToken(true) → Refresh forzado
   ├─ httpsCallable(functions, "lazyCloseIfNeeded")
   └─ Llama a Cloud Function
         ↓
Cloud Function lazyCloseIfNeeded
   ├─ Valida autenticación (context.auth)
   ├─ Valida businessId
   ├─ Obtiene timezone del negocio
   ├─ Calcula día anterior
   ├─ Obtiene agregados del día (getDayAggregates)
   ├─ Verifica: ¿hasOpening && !hasClosure?
   │
   ├─ SÍ → Crear cierre automático
   │   ├─ Genera UUID
   │   ├─ Calcula timestamp del final del día anterior
   │   ├─ Crea transacción de cierre
   │   ├─ Actualiza dailySummary
   │   ├─ Rompe racha (breakStreak)
   │   └─ Retorna { closed: true, mode: 'lazyOpen', ... }
   │
   └─ NO → Retorna { closed: false, reason: 'no_missing_closure' }
         ↓
Frontend procesa respuesta
   ├─ Si closed: true → Recarga transacciones
   └─ Continúa con flujo normal
```

---

## 🐛 Debugging Actual

### Error 500 - Internal Server Error

**Estado:** La función se llama correctamente pero falla internamente.

**URL:** `http://localhost:5001/wala-lat/us-central1/lazyCloseIfNeeded`

**Logs de consola:**

```
✅ auth.currentUser existe: josenavarretedr@gmail.com
🔑 Token ID refrescado exitosamente
🔧 Usando instancia de functions desde firebaseInit
🔐 Llamando a lazyCloseIfNeeded...
❌ POST http://localhost:5001/.../lazyCloseIfNeeded 500 (Internal Server Error)
❌ Error en lazy close: FirebaseError: INTERNAL
   Código: functions/internal
   Mensaje: INTERNAL
```

### Posibles Causas

1. **Error en luxon/time.js**

   - `yesterdayStr(tz)` puede estar fallando
   - `endOfDay(day, tz)` puede estar fallando

2. **Error en Firestore**

   - No está usando el emulador de Firestore
   - Error al obtener el documento del negocio

3. **Error en getDayAggregates**
   - Falla al calcular agregados
   - Error en queries de Firestore

### Próximos Pasos

1. ✅ Verificar que el emulador de Firestore esté corriendo
2. ✅ Ver logs del emulador de Functions (en la terminal)
3. ⏳ Agregar más logging a la función si es necesario
4. ⏳ Verificar que el negocio `FARMACIA-4b8cf708` existe en Firestore emulador

---

## 📝 Notas Importantes

- **Emuladores:** Asegúrate de que todos los emuladores estén corriendo:

  ```bash
  firebase emulators:start
  ```

- **Puertos:**

  - Functions: `localhost:5001`
  - Firestore: `localhost:8080`
  - Auth: `localhost:9099`
  - Storage: `localhost:9199`

- **Debugging:**
  - Los logs de Functions aparecen en la terminal donde corren los emuladores
  - Busca líneas que empiecen con el emoji del log de la función

---

## ✅ Checklist

- [x] Import de Functions en firebaseInit.js
- [x] Configuración de emulador de Functions
- [x] Export de functions desde firebaseInit.js
- [x] Import de functions en AccountBalanceAppWrapper.vue
- [x] Implementación de checkLazyClose()
- [x] Manejo de autenticación con useAuth
- [x] Refresh de token antes de llamar
- [x] Logs detallados para debugging
- [x] La función se llama correctamente
- [ ] La función se ejecuta sin errores 500
- [ ] El cierre automático funciona correctamente
- [ ] Las transacciones se recargan después del cierre

---

**Estado Final:** Configuración correcta, esperando fix del error 500 en la Cloud Function.
