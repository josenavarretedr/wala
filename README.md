# Vue 3 + Vite + Firebase + Tailwind CSS Template

## Configuración del Proyecto

### Dependencias

El proyecto incluye las siguientes dependencias principales:

- `@flaticon/flaticon-uicons`: Iconos de Flaticon.
- `dotenv`: Manejo de variables de entorno.
- `firebase`: Integración con Firebase.
- `uuid`: Generación de UUIDs.
- `vue`: Framework de Vue.js.

### Dependencias de Desarrollo

- `@vitejs/plugin-vue`: Plugin de Vite para Vue.
- `autoprefixer`: Autoprefijado de CSS.
- `postcss`: Herramienta para transformar CSS.
- `tailwindcss`: Framework de CSS.
- `vite`: Herramienta de construcción rápida.

### Scripts

- `dev`: Inicia el servidor de desarrollo de Vite.
- `build`: Construye el proyecto para producción.
- `preview`: Previsualiza la construcción de producción.

### Configuración de Variables de Entorno

El proyecto utiliza un archivo `.env` para configurar las variables de entorno necesarias para Firebase. Asegúrate de crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

### Configuración de Firebase

El archivo [`src/firebaseInit.js`](src/firebaseInit.js) contiene la configuración para inicializar Firebase y conectar a los emuladores de Firestore, Authentication y Storage cuando se ejecuta en un entorno local.

### Estilos

El proyecto utiliza Tailwind CSS para los estilos. Los estilos base, componentes y utilidades de Tailwind se importan en [`src/style.css`](src/style.css).

### Recomendaciones de Extensiones de VSCode

Se recomienda instalar la extensión `Vue.volar` para una mejor experiencia de desarrollo en Vue. Esta recomendación está configurada en el archivo [`.vscode/extensions.json`](.vscode/extensions.json).

## Instrucciones para Iniciar el Proyecto

1. Clona el repositorio.
2. Instala las dependencias con `npm install`.
3. Configura las variables de entorno en el archivo `.env`.
4. Inicia el servidor de desarrollo con `npm run dev`.

¡Y eso es todo! Ahora deberías estar listo para comenzar a desarrollar con este template de Vue 3 y Vite.
