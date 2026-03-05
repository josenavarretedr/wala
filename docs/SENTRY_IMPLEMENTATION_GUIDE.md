# 🛡️ Guía de Uso de Sentry en Walla

## ✅ Implementación Completada

### Características instaladas:

1. **Captura automática de errores de Vue** ✅
2. **Captura de errores de navegación (Vue Router)** ✅
3. **Widget de feedback para usuarios** ✅
4. **Session Replay (grabación de sesiones)** ✅
5. **Integración con Pinia (captura de estado)** ✅
6. **Captura de errores en operaciones de autenticación** ✅
7. **Identificación de usuarios en errores** ✅
8. **Breadcrumbs (rastro de acciones del usuario)** ✅
9. **Filtrado de errores conocidos** ✅
10. **Variables de entorno para producción/desarrollo** ✅

---

## 📁 Archivos Creados/Modificados

### Archivos principales:

- \`src/main.js\` - Configuración de Sentry
- \`src/stores/authStore.js\` - Integración en autenticación
- \`src/utils/sentryHelpers.js\` - Utilidades de Sentry
- \`src/composables/useSentry.js\` - Composable para componentes
- \`.env.production\` - Variables de entorno de producción
- \`.env.development\` - Variables de entorno de desarrollo

---

## 🚀 Cómo Usar Sentry en tu Código

### 1. En componentes Vue

\`\`\`vue

<script setup>
import { useSentry } from '@/composables/useSentry'

const { trackError, trackEvent } = useSentry()

const handleSubmit = async () => {
  try {
    trackEvent('Usuario envía formulario', 'form', { formName: 'contacto' })
    
    await submitForm()
    
  } catch (error) {
    trackError(error, 'Error al enviar formulario', {
      tags: { form: 'contacto' }
    })
  }
}
</script>

\`\`\`

### 2. En stores (Pinia)

\`\`\`javascript
import { withSentryCapture, addBreadcrumb } from '@/utils/sentryHelpers'

const fetchProducts = async () => {
addBreadcrumb('Cargando productos', 'products')

const result = await withSentryCapture(
() => supabase.from('products').select('\*'),
'products.fetch'
)

return result
}
\`\`\`

### 3. Establecer usuario actual

\`\`\`javascript
import { setSentryUser } from '@/utils/sentryHelpers'

// Cuando el usuario inicia sesión
setSentryUser({
uid: '12345',
email: 'user@example.com',
displayName: 'Juan Pérez'
})

// Cuando cierra sesión
setSentryUser(null)
\`\`\`

### 4. Establecer contexto del negocio

\`\`\`javascript
import { setSentryBusiness } from '@/utils/sentryHelpers'

// Cuando se selecciona un negocio
setSentryBusiness({
id: 'abc123',
name: 'Mi Tienda',
type: 'retail'
})
\`\`\`

---

## 🧪 Cómo Probar que Funciona

### 1. Widget de Feedback

- Busca el botón en la **esquina inferior derecha** de tu app
- Haz clic y envía un reporte de prueba
- Ve a Sentry Dashboard → **User Feedback**

### 2. Captura de Errores

- Usa el botón de prueba temporal en \`App.vue\` (elimínalo después)
- O lanza un error desde la consola del navegador:
  \`\`\`javascript
  throw new Error('Test de Sentry')
  \`\`\`
- Ve a Sentry Dashboard → **Issues**

### 3. Session Replay

- Cuando ocurra un error, ve a Sentry Dashboard → **Replays**
- Podrás ver los últimos 30 segundos antes del error

---

## ⚙️ Configuración de Producción

### Antes de desplegar:

1. **Actualiza las variables de entorno** en \`.env.production\`:
   \`\`\`env
   VITE_APP_VERSION=1.0.0 # Actualiza con cada release
   \`\`\`

2. **Ajusta las tasas de muestreo** si tienes muchos usuarios:
   \`\`\`javascript
   // En main.js
   tracesSampleRate: 0.3, // 30% de transacciones (ya configurado)
   replaysSessionSampleRate: 0.05, // 5% de sesiones (opcional)
   \`\`\`

3. **Elimina el botón de prueba** de \`App.vue\`

4. **Activa filtrado de datos sensibles**:
   \`\`\`javascript
   // En main.js
   Sentry.replayIntegration({
   maskAllText: true, // ⚠️ Oculta texto en producción
   blockAllMedia: true,
   })
   \`\`\`

---

## 🎯 Dashboard de Sentry

### Dónde ver los datos:

| Sección           | URL                           | Qué ver                 |
| ----------------- | ----------------------------- | ----------------------- |
| **Issues**        | https://sentry.io/issues      | Errores capturados      |
| **User Feedback** | https://sentry.io/feedback    | Reportes de usuarios    |
| **Replays**       | https://sentry.io/replays     | Grabaciones de sesiones |
| **Performance**   | https://sentry.io/performance | Rendimiento de la app   |

---

## 🔧 Utilidades Disponibles

### En \`sentryHelpers.js\`:

| Función                 | Descripción                 | Uso                             |
| ----------------------- | --------------------------- | ------------------------------- |
| \`withSentryCapture()\` | Envuelve llamadas API       | Captura errores automáticamente |
| \`setSentryUser()\`     | Identifica usuario actual   | Asocia errores con usuarios     |
| \`setSentryBusiness()\` | Establece negocio actual    | Agrega contexto de negocio      |
| \`addBreadcrumb()\`     | Registra acción del usuario | Rastrea pasos antes de error    |
| \`captureError()\`      | Captura error manualmente   | Para try/catch personalizados   |
| \`captureMessage()\`    | Envía mensaje informativo   | Alertas no críticas             |

### En \`useSentry.js\` (composable):

| Función            | Descripción                 | Uso en componentes              |
| ------------------ | --------------------------- | ------------------------------- |
| \`trackError()\`   | Captura errores             | Manejo de errores en UI         |
| \`trackEvent()\`   | Registra eventos            | Analytics de acciones           |
| \`sendMessage()\`  | Envía mensajes              | Avisos informativos             |
| \`wrapApiCall()\`  | Envuelve llamadas API       | Igual que \`withSentryCapture\` |
| \`setUser()\`      | Establece usuario           | Cuando cambia el usuario        |
| \`setBusiness()\`  | Establece negocio           | Cuando cambia el negocio        |
| \`sendFeedback()\` | Envía feedback programático | UI personalizada                |

---

## 📊 Mejores Prácticas

### ✅ Haz esto:

1. **Establece el usuario** al iniciar sesión y al restaurar sesión
2. **Agrega breadcrumbs** en acciones importantes del usuario
3. **Usa tags descriptivos** para categorizar errores
4. **Filtra errores conocidos** que no son importantes
5. **Actualiza la versión** en cada release

### ❌ Evita esto:

1. **No captures errores ya manejados** (duplicados)
2. **No envíes información sensible** (contraseñas, tokens)
3. **No uses \`console.error\`** sin capturar en Sentry
4. **No olvides limpiar el usuario** al cerrar sesión
5. **No dejes \`tracesSampleRate: 1.0\`** en producción con muchos usuarios

---

## 🚨 Errores Comunes

### El widget no aparece:

- Verifica que \`autoInject: true\` esté en la configuración
- Revisa la consola del navegador por errores
- Limpia la caché de Vite: \`npm run dev\` (con caché limpia)

### Los errores no llegan a Sentry:

- Verifica el DSN en la configuración
- Revisa que no esté en la lista \`ignoreErrors\`
- Verifica la conexión a internet
- Revisa la consola: con \`debug: true\` verás todos los eventos

### El usuario no se identifica:

- Asegúrate de llamar \`setSentryUser()\` después del login
- Verifica que se llame \`setSentryUser(null)\` en el logout

---

## 📞 Soporte

- **Documentación oficial**: https://docs.sentry.io/platforms/javascript/guides/vue/
- **Dashboard de Sentry**: https://sentry.io/
- **Archivo de configuración**: \`src/main.js\`

---

## 🎉 ¡Todo Listo!

Tu aplicación ahora tiene un sistema completo de monitoreo de errores. Sentry capturará automáticamente:

- ✅ Errores de Vue
- ✅ Errores de Router
- ✅ Errores en llamadas API
- ✅ Promesas rechazadas no capturadas
- ✅ Errores de autenticación
- ✅ Feedback de usuarios

**Elimina el botón de prueba de \`App.vue\` cuando termines de probar.**


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

