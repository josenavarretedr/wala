>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# 🚨 SOLUCIÓN DE PROBLEMAS: "Error al cargar negocio: El negocio no existe"

## 🔍 DIAGNÓSTICO DEL PROBLEMA

El error **"El negocio no existe"** ocurre cuando hay **inconsistencias de datos** entre:

- `users/{uid}/businesses` (relaciones usuario-negocio)
- `businesses` (datos principales de negocios)

### Causa típica:

- Existen relaciones en `users/{uid}/businesses` que apuntan a IDs de negocios que **NO existen** en la collection `businesses`

## 🔧 SOLUCIÓN RÁPIDA (RECOMENDADA)

### Paso 1: Abrir consola del navegador

1. Abre el navegador en `http://localhost:5175`
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**

### Paso 2: Ejecutar script de diagnóstico

Pega este código en la consola y presiona Enter:

```javascript
// Copiar y pegar en la consola
fetch("/src/utils/quickFix.js")
  .then((r) => r.text())
  .then((code) => eval(code));
```

### Paso 3: Seguir las instrucciones

El script te mostrará:

- ✅ Negocios válidos
- ❌ Negocios inválidos (causan el error)
- 🔧 Función para limpiar automáticamente

### Paso 4: Limpiar datos inconsistentes

Si el script detecta problemas, ejecuta:

```javascript
cleanInvalidBusinesses("tu-user-id");
```

### Paso 5: Recargar y probar

1. Recarga la página (`Ctrl + F5`)
2. Vuelve a hacer login
3. El error debería estar solucionado

## 🛠️ SOLUCIÓN MANUAL (ALTERNATIVA)

### Opción A: Limpiar desde Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Firestore Database**
4. Navega a `users/{tu-uid}/businesses`
5. Elimina manualmente las relaciones que apuntan a negocios inexistentes

### Opción B: Recrear datos demo

1. Elimina todos los documentos en `users/{tu-uid}/businesses`
2. Ejecuta el script de datos demo actualizado:

```javascript
import { createDemoData } from "@/utils/createDemoData";
await createDemoData();
```

## 🔍 VERIFICAR LA SOLUCIÓN

Después de aplicar cualquier solución:

1. **Verificar en consola del navegador:**

```javascript
// Debe mostrar solo negocios válidos
checkUserData();
```

2. **Probar el flujo de login:**
   - Login → Debe redireccionar correctamente
   - No debe aparecer el error "El negocio no existe"

## 🚀 PREVENIR PROBLEMAS FUTUROS

### Validación automática activada

El sistema ahora incluye **validación automática** que:

- ✅ Verifica que los negocios existan antes de cargarlos
- ⚠️ Ignora relaciones inválidas automáticamente
- 📝 Muestra advertencias en consola sobre inconsistencias

### Mejores prácticas:

1. **No eliminar** documentos de `businesses` sin eliminar las relaciones correspondientes
2. **Usar las funciones del sistema** para crear/eliminar negocios
3. **Verificar datos** después de cambios manuales en Firebase

## 📋 DATOS DE PRUEBA RECOMENDADOS

Para testing, usa el script actualizado de datos demo:

```javascript
// En la consola del navegador
import { createDemoData } from "@/utils/createDemoData";

// Cambiar el DEMO_USER_ID por tu UID real
await createDemoData();
```

Esto creará:

- ✅ 3 negocios consistentes
- ✅ Relaciones usuario-negocio válidas
- ✅ Datos de ejemplo para testing

## 🔗 ARCHIVOS RELACIONADOS

- `src/utils/quickFix.js` - Script de diagnóstico rápido
- `src/utils/businessDiagnostics.js` - Diagnóstico avanzado
- `src/utils/createDemoData.js` - Datos de prueba
- `src/stores/useUserStore.js` - Validación automática
- `src/stores/businessStore.js` - Manejo de errores mejorado

---

**💡 Tip**: Si el problema persiste después de seguir estos pasos, revisa la consola del navegador para más detalles sobre el error específico.
