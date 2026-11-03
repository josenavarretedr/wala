# 🌟 Wala — Monorepo de Gestión y Crecimiento Empresarial

> Plataforma integral de gestión financiera, inventario, ventas, acopio agropecuario y consultoría para micro y pequeñas empresas en Latinoamérica.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![NPM Workspaces](https://img.shields.io/badge/Monorepo-npm%20workspaces-blue.svg)](https://docs.npmjs.com/cli/using-npm/workspaces)
[![Firebase](https://img.shields.io/badge/Backend-Firebase%20Gen2-orange.svg)](https://firebase.google.com/)
[![Vue 3](https://img.shields.io/badge/Frontend-Vue%203.5-emerald.svg)](https://vuejs.org/)
[![Remotion](https://img.shields.io/badge/Video-Remotion%204.0-purple.svg)](https://www.remotion.dev/)

---

## 📌 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Arquitectura del Monorepo](#-arquitectura-del-monorepo)
- [Módulos Funcionales Principales](#-módulos-funcionales-principales)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts de Desarrollo](#-scripts-de-desarrollo)
- [Emuladores y Entorno Local](#-emuladores-y-entorno-local)
- [Despliegue y Hosting](#-despliegue-y-hosting)
- [Documentación Adicional](#-documentación-adicional)

---

## 🚀 Visión General

**Wala** es un ecosistema digital diseñado para cerrar la brecha de digitalización y gestión de las micro y pequeñas empresas (MYPEs) y asociaciones agropecuarias en América Latina. La plataforma abarca desde el control financiero diario en el punto de venta hasta la generación automatizada de piezas de video publicitario, asistencia mediante modelos de IA y asesoría empresarial estructurada.

---

## 🏛 Arquitectura del Monorepo

El repositorio está organizado como un **Monorepo gestionado con NPM Workspaces**:

```
wala/
├── apps/
│   ├── web/               # 🌐 Aplicación principal de usuario (Vue 3.5 + Vite + Pinia + Tailwind)
│   ├── content/           # 📝 Generador y configurador de guiones IA (React 18 + Zustand + Vite)
│   ├── video/             # 🎬 Wala Motion Suite: Renderizado de video (Remotion 4.0 + React 19 + TS)
│   └── functions/         # ⚡ Backend serverless (Firebase Cloud Functions v2, Node 20, Express)
├── packages/
│   └── shared-types/      # 📦 Modelos, constantes y tipos compartidos entre apps
├── docs/                  # 📚 Documentación técnica exhaustiva organizada por features
├── scripts/               # 🛠️ Scripts utilitarios (taxonomías, migraciones)
├── firestore.rules        # 🔒 Reglas de seguridad de Firestore
├── firestore.indexes.json # ⚡ Índices compuestos de Firestore
├── storage.rules          # 🗄️ Reglas de seguridad de Firebase Storage
├── firebase.json          # ⚙️ Configuración de Hosting, Functions y Emuladores
└── package.json           # 📋 Raíz del Monorepo y orquestación de comandos
```

### Detalle de Aplicaciones

| Workspace | Tecnologías | Propósito | Despliegue / Salida |
|-----------|-------------|-----------|---------------------|
| **`apps/web`** | Vue 3.5, Pinia, Vue Router 4, Tailwind CSS 3, Vite 5, Sentry, Chart.js | Plataforma central para dueños de negocio, colaboradores y facilitadores. | Firebase Hosting (`site: wala-lat`) |
| **`apps/content`** | React 18, Zustand, Tailwind CSS, Lucide React, Vite 5 | SPA para creación, validación pedagógica y biblioteca de guiones formativos con IA. | Firebase Hosting (`site: wala-content`) |
| **`apps/video`** | Remotion 4.0, React 19, TypeScript, Zod | Suite de diseño en movimiento y generación programática de video publicitario/educativo. | Remotion Studio / MP4 bundle |
| **`apps/functions`** | Node 20, Firebase Functions v2, Express, Puppeteer, Resend, Mercado Pago | Lógica transaccional backend, cierres automáticos, webhooks, clasificación IA e imágenes. | Google Cloud Platform (`southamerica-east1` / `us-central1`) |
| **`packages/shared-types`**| ECMAScript Modules | Constantes maestras, taxonomías y esquemas compartidos entre web, video y functions. | Importado internamente como paquete |

---

## 💼 Módulos Funcionales Principales

### 1. Gestión Financiera y Caja Diaria
- **Apertura y Cierre Modular de Caja:** Flujo guiado (*wizard*) para registro de arqueo inicial y balance final.
- **Lazy Auto-Close:** Cierre automático y continuo de días pasados no cerrados (hasta 30 días de lookback) sin interrumpir la operación del negocio.
- **Scheduled Auto-Close:** Cierre diario programado mediante Cloud Scheduler a nivel regional.
- **Conciliación en Tiempo Real:** Cálculo automático de balance diario (`dailySummaries`) mediante listeners y Cloud Functions.
- **Estado de Resultados Devengado (P&L):** Visión financiera basada en principio contable de devengado (`income-statement`) y costo de ventas sincronizado.

### 2. Transacciones y Reversión Segura
- **Punto de Venta e Ingresos:** Registro de ventas al contado, transferencias, cuentas por cobrar y cotizaciones.
- **Reversión Atómica (`deleteSale`):** Eliminación controlada de ventas erróneas con restauración transaccional de existencias en inventario, ajuste en balances diarios y emisión de notas de devolución (`refund`).

### 3. Inventario y Costeo
- **Control de Stock y Alertas:** Control de existencias mínimas, valorización de inventario y alertas preventivas.
- **Costeo de Producto:** Estructura modular de costeo (materia prima, mano de obra directa, CIF, empaque y overhead).
- **Conteo y Ajuste Físico:** Flujo para conciliación periódica de existencias con justificación de mermas o desajustes.

### 4. Wala Coop y Sistema de Acopios
- **Centros de Acopio y Cooperativas:** Gestión especializada de recepción de productos agrícolas y materias primas provenientes de socios o productores.
- **Liquidaciones y Pagos:** Registro de pesaje, precio unitario pactado, retenciones, estado de liquidación y seguimiento de pagos pendientes.

### 5. Proveedores y Cuentas por Pagar
- **Directorio de Proveedores:** Base de datos de proveedores comerciales con datos de contacto y condiciones de crédito.
- **Cuentas por Pagar (`accounts-payable`):** Registro de obligaciones financieras comerciales, calendario de vencimientos y pagos parciales.

### 6. CRM Comercial y Gestión de Clientes
- **Pipeline Kanban:** Embudo comercial drag-and-drop con sincronización en tiempo real.
- **Comunicación Integrada:** Formateo telefónico internacional y conexión directa con un clic hacia WhatsApp.

### 7. Módulo Juntos & Consultoría
- **Programas de Acompañamiento:** Plataforma de soporte para facilitadores y consultores de negocios.
- **Expedientes de Consultoría (`consultingDossiers`):** Diagnóstico empresarial de áreas críticas, formulación de planes de acción y seguimiento de hitos.

### 8. Wala Motion & Generación de Contenido con IA
- **Wala Motion Suite (`apps/video`):** Escenas parametrizadas para bodegas, ferreterías, cooperativas agrícolas, LowerThirds personalizables y animación tipográfica cinética.
- **Generador de Guiones (`apps/content`):** Algoritmo de estructuración de guiones de venta y educación basados en los bancos de aprendizaje de Wala y modelos de lenguaje (Grok / OpenAI).

---

## 🛠 Requisitos Previos

- **Node.js:** Versión `20.x` recomendada (mínimo `18.x`).
- **NPM:** Versión `10.x` o superior (con soporte nativo de `workspaces`).
- **Firebase CLI:** Instalado globalmente:
  ```bash
  npm install -g firebase-tools
  ```
- **Java Runtime Environment (JRE):** Requerido únicamente para ejecutar los emuladores locales de Firestore y Firebase Suite.

---

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-organizacion/wala.git
   cd wala
   ```

2. **Instalar todas las dependencias del monorepo:**
   ```bash
   npm install
   ```
   *(Este comando resuelve e instala de forma centralizada todas las dependencias de raíz, `apps/*` y `packages/*`).*

3. **Configurar variables de entorno:**
   Crea los archivos `.env` en cada una de las aplicaciones siguiendo sus respectivos ejemplos:
   - `apps/web/.env` (ver `apps/web/.env.example`)
   - `apps/content/.env`
   - `apps/functions/.env`

---

## 🔐 Variables de Entorno

### `apps/web/.env`
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=wala-lat.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wala-lat
VITE_FIREBASE_STORAGE_BUCKET=wala-lat.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_XAI_API_KEY=xai-tu_api_key       # Generación de guiones IA (opcional en cliente)
RESEND_API_KEY=re_tu_api_key          # Emails transaccionales
```

### `apps/functions/.env`
```env
MERCADOPAGO_ACCESS_TOKEN=tu_token_mercadopago
XAI_API_KEY=xai-tu_api_key_backend
OPENAI_API_KEY=sk-tu_api_key_openai
RESEND_API_KEY=re_tu_api_key_backend
```

---

## ⚡ Scripts de Desarrollo

Todos los comandos se pueden ejecutar desde la **raíz del proyecto**:

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo de la web principal (`apps/web` en puerto 5173). |
| `npm run dev:web` | Alias explícito para iniciar `apps/web`. |
| `npm run dev:content` | Inicia la SPA de generación de guiones (`apps/content`). |
| `npm run dev:video` | Abre el **Remotion Studio** interactivo para previsualizar y editar videos. |
| `npm run build` | Compila `apps/web` y `apps/content` para producción. |
| `npm run build:all` | Compila todos los workspaces que posean script de build. |
| `npm run build:web` | Compila únicamente la aplicación web. |
| `npm run build:content` | Compila únicamente el generador de contenido. |
| `npm run build:video` | Genera el bundle de Remotion. |
| `npm run preview:web` | Previsualiza el build de `apps/web` localmente. |
| `npm run preview:content`| Previsualiza el build de `apps/content` localmente. |
| `npm run emulators:start`| Inicia los emuladores de Firebase con importación/exportación automática de datos. |
| `npm run emulators:export`| Exporta el estado actual de los emuladores a `./emulator-data`. |
| `npm run deploy` | Compila la web y despliega únicamente el Hosting de Firebase. |
| `npm run deploy:functions`| Despliega únicamente las Cloud Functions. |
| `npm run deploy:full` | Compila todo y ejecuta un deploy integral de Firebase. |
| `npm run migrate:guiones`| Ejecuta script de migración de guiones a Firestore. |

---

## 🧪 Emuladores y Entorno Local

Para desarrollar sin afectar la base de datos de producción:

```bash
# Iniciar la suite de emuladores con persistencia local
npm run emulators:start
```

Puertos predeterminados configurados en [`firebase.json`](firebase.json):
* **Auth Emulator:** `http://localhost:9099`
* **Firestore Emulator:** `http://localhost:8080`
* **Cloud Functions:** `http://localhost:5001`
* **Hosting Local:** `http://localhost:5000`
* **Emulator UI Dashboard:** `http://localhost:4000`

---

## 🚢 Despliegue y Hosting

La infraestructura de hosting está dividida en dos sitios sobre el mismo proyecto Firebase (`wala-lat`):

1. **Plataforma Web Principal:**
   - **Target / Site:** `wala-lat`
   - **Directorio de compilación:** `apps/web/dist`
   - **URL pública:** [https://wala.lat](https://wala.lat)
2. **Generador de Contenido:**
   - **Target / Site:** `wala-content`
   - **Directorio de compilación:** `apps/content/dist`

Para desplegar solo un sitio específico:
```bash
# Desplegar hosting web principal
firebase deploy --only hosting:wala-lat

# Desplegar hosting de contenido
firebase deploy --only hosting:wala-content

# Desplegar Cloud Functions
firebase deploy --only functions
```

---

## 📖 Documentación Adicional

Para adentrarte en las especificaciones técnicas y de arquitectura, consulta:

- **[CONTEXT.md](CONTEXT.md):** Archivo maestro de referencia rápida para desarrollo y agentes de IA.
- **[docs/README.md](docs/README.md):** Índice general de la documentación técnica.
- **[docs/architecture/](docs/architecture/):** Arquitectura multi-negocio, esquema Firestore y decisiones de diseño.
- **[docs/stores/](docs/stores/):** Catálogo y contratos de la totalidad de stores Pinia.
- **[docs/transactions/](docs/transactions/):** Cierre de caja modular, lazy auto-close y reversión de ventas.
- **[docs/inventory/](docs/inventory/):** Flujos de stock, costeo y sistema de acopios.
- **[docs/comercial/](docs/comercial/):** Manual técnico del CRM comercial.
- **[docs/juntos/](docs/juntos/):** Guías operativas del programa de consultoría empresarial.
