# 🧠 CONTEXT.md — Archivo Maestro del Proyecto Wala

> **Lee este archivo SIEMPRE al inicio de cada sesión.**  
> Es la fuente de verdad rápida, técnica y operativa del proyecto. Para especificaciones exhaustivas por módulo, consulta [`docs/README.md`](docs/README.md).

**Última actualización:** Noviembre 2026 (Monorepo Workspaces + Wala Coop/Acopios + Remotion Motion Suite + P&L Devengado + Reversión Segura de Ventas)  
**Dominio Web:** [wala.lat](https://wala.lat) | **Hosting Contenido:** `wala-content`  
**Firebase Project ID:** `wala-lat`  
**Arquitectura:** Monorepo con `npm workspaces` (`apps/*`, `packages/*`)

---

## 1. Stack Tecnológico por Workspace

### 1.1 `apps/web` (Plataforma Principal SaaS / ERP)

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Framework** | Vue 3 (Composition API preferida) | ^3.5.12 | Frontend interactivo para dueños, colaboradores y facilitadores |
| **State Management** | Pinia | ^2.2.6 | Estado reactivo global y wizard flows |
| **Routing** | Vue Router 4 | ^4.4.5 | Enrutamiento con guards de autenticación, rol y permisos |
| **Build Tool** | Vite 5 | ^5.4.10 | Bundler de desarrollo y compilación |
| **CSS** | TailwindCSS 3 | ^3.4.15 | Sistema de utilidades y diseño visual responsive |
| **Error Tracking** | Sentry (`@sentry/vue`) | ^10.34.0 | Monitoreo y reporte de excepciones en producción |
| **Analytics** | Firebase Analytics (GA4) | SDK v11 | Telemetría y eventos de usuario |
| **Charts** | Chart.js | ^4.5.1 | Visualizaciones de balances, ventas y rentabilidad |
| **Icons** | Flaticon UIcons, Iconoir, Boxicons | Múltiples | Iconografía de UI y categorías |
| **Dates** | date-fns | ^4.1.0 | Aritmética y formateo de fechas y calendarios |
| **Drag & Drop** | vuedraggable | ^4.1.0 | Kanban del pipeline de CRM comercial |
| **Onboarding** | Driver.js | ^1.3.6 | Tours guiados interactivos para usuarios nuevos |
| **Image Processing** | html2canvas + jimp | ^1.4.1 / ^1.6.1 | Captura de comprobantes y redimensionamiento |

### 1.2 `apps/content` (Estudio de Guiones y Contenido Educativo)

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Framework** | React 18 | ^18.3.1 | SPA para diseño y banco de guiones educativos |
| **State** | Zustand | ^4.5.5 | Gestión de estado ligera para el configurador |
| **Icons** | Lucide React | ^0.395.0 | Iconos minimalistas para la suite de contenido |
| **AI Prompting** | Prompt Maestro V10 + Rutas Wala v3 | Interno | Generación asistida de guiones de venta y capacitación |
| **Build Tool** | Vite 5 | ^5.3.1 | Bundling de la SPA |

### 1.3 `apps/video` (Wala Motion Suite — Video Programático)

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Video Engine** | Remotion | 4.0.534 | Renderizado de video publicitario y educativo mediante código |
| **Framework** | React 19 + TypeScript | 19.3.0 / ^5.9.3 | Componentes de escena tipados estrictamente |
| **Validación** | Zod | 4.5.4 | Esquemas de tipado y props para Remotion Studio |
| **Composiciones** | Vertical 9:16 (1080x1920) & HUDs | 60 fps | Spots para bodegas, ferreterías, cooperativas y LowerThirds |

### 1.4 `apps/functions` (Backend Serverless)

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Runtime** | Node.js | 20.x | Entorno de ejecución serverless en Google Cloud |
| **Framework** | Firebase Functions Gen2 + Express 5 | ^4.9.0 / ^5.2.1 | Triggers Firestore, Scheduled tasks y API REST |
| **Fechas & Timezones**| Luxon | ^3.7.2 | Manejo de zonas horarias de LATAM (cierre de caja) |
| **Server-side Render**| Puppeteer-core + @sparticuz/chromium| ^24.36 / ^131 | Renderizado headless de resúmenes e imágenes en backend |
| **Pagos** | Mercado Pago SDK | ^2.12.0 | Checkout API, cobros y webhooks de suscripciones y Yape |
| **Emails** | Resend SDK | ^6.9.3 | Correos transaccionales de onboarding y streak alerts |
| **AI Engine** | OpenAI SDK (Proxy Grok/xAI + GPT) | ^6.3.0 | Clasificación en 3 capas de inventario y gastos |
| **Manipulación** | Sharp | ^0.33.2 | Optimización y compresión de archivos multimedia |

### 1.5 Comandos Principales del Monorepo

```bash
# Desarrollo local
npm run dev              # Inicia apps/web (puerto 5173)
npm run dev:web          # Alias explícito de apps/web
npm run dev:content      # Inicia apps/content (puerto 5173 o siguiente)
npm run dev:video        # Abre Remotion Studio para edición de video

# Compilación y builds
npm run build            # Compila apps/web y apps/content
npm run build:all        # Compila todos los workspaces
npm run build:web        # Compila apps/web -> apps/web/dist
npm run build:content    # Compila apps/content -> apps/content/dist
npm run build:video      # Bundle de producción de Remotion

# Emuladores locales de Firebase
npm run emulators:start  # Inicia emuladores (Auth:9099, Firestore:8080, Functions:5001, Hosting:5000)
npm run emulators:export # Guarda el estado de pruebas en ./emulator-data

# Despliegue
npm run deploy           # Compila web y sube hosting
npm run deploy:functions # Despliega solo Cloud Functions
npm run deploy:full      # Compila y despliega Hosting, Functions, Rules e Indexes

# Migraciones y scripts utilitarios
npm run migrate:guiones  # Migración de guiones a Firestore
node scripts/initTaxonomies.js # Inicialización de taxonomías de industrias
```

---

## 2. Arquitectura del Proyecto

### 2.1 Estructura del Monorepo

```
wala/
├── apps/
│   ├── web/                         # Aplicación Vue 3 principal
│   │   ├── src/
│   │   │   ├── analytics/           # Tracking GA4
│   │   │   ├── assets/              # Estilos globales, imágenes y logos de marca
│   │   │   ├── components/          # Componentes organizados por dominio funcional
│   │   │   ├── composables/         # 45+ composables de lógica reactiva
│   │   │   ├── config/              # Configuración de servicios externos y Firebase
│   │   │   ├── constants/           # Constantes de negocio y taxonomías
│   │   │   ├── layouts/             # MainLayout, AuthLayout, FacilitatorLayout, etc.
│   │   │   ├── router/              # Router central con guards de autenticación/rol
│   │   │   ├── services/            # Clientes de API y librerías terceras
│   │   │   ├── stores/              # Stores globales Pinia y wizards de flujo
│   │   │   │   ├── AccountsBalanceApp/ # Stores de balance y cierre de caja
│   │   │   │   ├── Inventory/          # Stores de stock, conteo y métricas
│   │   │   │   └── transaction/        # Stores del core transaccional
│   │   │   ├── types/               # Definiciones y esquemas
│   │   │   └── views/               # 27 módulos de vistas organizados por feature
│   │   └── vite.config.js           # Alias '@' apunta a apps/web/src
│   │
│   ├── content/                     # SPA React 18 para guiones pedagógicos con IA
│   │   └── src/
│   │       ├── assets/bancos/       # Bancos de aprendizaje (Costeo, Stock, Compras, etc.)
│   │       ├── assets/prompts/      # Prompt Maestro V10 y Rutas Wala v3
│   │       ├── components/          # Configurador por pasos, visualizador y biblioteca
│   │       ├── services/            # Parsers, LLM client y validadores de coherencia
│   │       └── store/               # Stores de Zustand (configurador, biblioteca, toast)
│   │
│   ├── video/                       # Suite de video programático con Remotion
│   │   └── src/
│   │       ├── AgricultorVsCooperativa/ # Video explicativo vertical (1080x1920)
│   │       ├── WalaMotion/          # Sistema visual: Bodegas, Ferreterías, HUDs, Triads
│   │       ├── LowerThird/          # Generador de tercios inferiores animados
│   │       ├── Root.tsx             # Registro maestro de composiciones Remotion
│   │       └── tokens.ts            # Tokens de color, tipografía y animación
│   │
│   └── functions/                   # Cloud Functions v2 en Node 20
│       ├── src/
│       │   ├── AccountsBalance/     # scheduledAutoClose, lazyCloseIfNeeded, onTransactionWrite
│       │   ├── Transaction/         # deleteSale (reversión atómica), processTransactionBackground
│       │   ├── Inventory/           # Clasificación de productos IA en 3 capas
│       │   ├── Expense/             # Clasificación de gastos IA en 3 capas
│       │   ├── Payments/            # Endpoints Mercado Pago, Checkout y webhooks
│       │   ├── AI/                  # Proxy seguro para Grok/xAI
│       │   ├── Onboarding/          # Secuencias de bienvenida y emails vía Resend
│       │   ├── Programs/            # Lógica de enrolamiento en programas Juntos
│       │   ├── Storage/             # Procesamiento y compresión de archivos
│       │   ├── Share/               # Renderizado serverless de comprobantes con Puppeteer
│       │   └── Subscriptions/       # Control de expiración de trials
│       └── index.js                 # Exportación de triggers y endpoints HTTP
│
├── packages/
│   └── shared-types/                # Constantes y tipos comunes importables
│
├── docs/                            # Documentación viva clasificada por dominios
│   ├── README.md                    # Índice general de documentación
│   ├── DOC_MAINTENANCE_CHECKLIST.md # Protocolo obligatorio de actualización documental
│   ├── architecture/                # Multi-negocio, esquema Firestore, P&L devengado
│   ├── stores/                      # Documentación detallada de stores Pinia
│   ├── transactions/                # Cierre modular, reversión de venta, daily summaries
│   ├── inventory/                   # Stock, conteo físico, acopios agrícolas, mermas
│   ├── subscriptions/               # Planes Free/Pro/Max, pasarelas de pago
│   ├── juntos/                      # Programas, actividades y expedientes de consultoría
│   ├── comercial/                   # CRM comercial sobre colección plana
│   ├── features/                    # Trazabilidad, clientes, proveedores, streak, guiones
│   ├── ui/                          # Componentes de diseño, modales, animaciones
│   ├── firebase/                    # Functions, Analytics, Sentry y emuladores
│   └── deprecated/                  # Archivos históricos obsoletos
│
├── scripts/                         # Utilidades (taxonomías, migraciones)
├── firestore.rules                  # Reglas de seguridad declarativas de Firestore
├── firestore.indexes.json           # Índices compuestos
└── firebase.json                    # Hosting multi-sitio (wala-lat, wala-content) y funciones
```

---

### 2.2 Decisiones Arquitectónicas Clave

1. **Multi-Negocio con Segmentación por URL:** Un usuario autenticado puede poseer o administrar múltiples negocios. La ruta activa `/business/:businessId/...` determina el contexto. [`useBusinessStore`](apps/web/src/stores/businessStore.js) es la fuente canónica de verdad sobre el estado del negocio actual.
2. **Monorepo Desacoplado:** La plataforma Web (Vue), el generador pedagógico (React) y la suite de video (Remotion) están formalmente separados en `apps/` pero comparten la infraestructura de backend y modelos comunes.
3. **Stores Pinia vs. Composables:** 
   - Los stores Pinia gestionan el estado reactivo global persistente o compartido entre componentes.
   - Los composables encapsulan llamadas a colecciones de Firestore, cálculos matemáticos y reactividad local.
4. **Patrón Wizard (Flow Stores):** Los flujos transaccionales de alta complejidad utilizan stores de pasos secuenciales para preservar el borrador y validar inputs antes de commitear a Firestore:
   - `transactionFlowStore.js` (registro de transacciones compuestas).
   - `accountsBalanceFlowStore.js` (apertura y cierre guiado de caja).
   - `AddStockFlow.js` / `RemoveStockFlow.js` / `InventoryCountFlow.js` (movimientos de inventario).
   - `actionPlanFlowStore.js` / `criticalAreasFlowStore.js` (consultoría empresarial).
5. **Cierre de Caja Dual (Scheduled + Lazy):**
   - **Scheduled:** Tarea programada en Cloud Functions que analiza negocios activos a medianoche y genera el balance si no hubo cierre manual.
   - **Lazy Close:** Al ingresar a la aplicación, `lazyCloseIfNeeded` reconcilia en cadena hasta 30 días pasados con saldo desfasado, garantizando continuidad contable.
6. **Reversión Atómica de Ventas (`deleteSale`):** La eliminación de ventas no se realiza con un simple `deleteDoc`. Se ejecuta mediante la Cloud Function transaccional `deleteSale`, que:
   - Repone las existencias físicas de los productos involucrados.
   - Descuenta el monto en el `dailySummary` correspondiente.
   - Emite una transacción de tipo `refund` para dejar trazabilidad contable inmutable.
7. **Estado de Resultados Devengado (P&L):** Además del flujo de caja (cobrado/pagado), la plataforma soporta contabilidad por devengado (`/income-statement`), congelando la estructura de costos al momento de cada venta para calcular con exactitud el Costo de Ventas (COGS) y el Margen Bruto real.
8. **Módulo Wala Coop & Acopios:** Soporte nativo para centros de acopio agrícola y cooperativas de productores. Registra recepciones de producto en bruto, pesaje, precio pactado, liquidaciones parciales y cuentas pendientes con socios.
9. **Cuentas por Pagar y Proveedores:** Módulo dedicado (`/suppliers` y `/accounts-payable`) para registrar obligaciones comerciales diferidas, fechas de vencimiento y pagos fraccionados.
10. **Suscripciones Frontend-Gated con Respaldo Cloud:** El acceso a características Premium/Pro se evalúa en frontend mediante getters de `useSubscription` y `businessStore`. Las Cloud Functions auditan periódicamente la caducidad de periodos de prueba (`checkTrialExpiration`).
11. **CRM Comercial Plano:** El módulo comercial opera sobre la colección raíz `comercial/` para máxima velocidad e independencia del esquema jerárquico de negocios.
12. **Emails Transaccionales Automatizados:** Cloud Functions dispara secuencias de bienvenida y advertencias de racha mediante la API de Resend.

---

### 2.3 Estructura de Colecciones en Firestore

```
businesses/{businessId}
├── transactions/{txId}          # Ingresos, gastos, transferencias y notas de devolución (refunds)
├── products/{productId}          # Catálogo, precios, existencias, recetas y alertas de stock
├── clients/{clientId}            # Directorio de clientes con historial de compras
├── suppliers/{supplierId}        # Proveedores comerciales y condiciones crediticias
├── accountsPayable/{debtId}      # Cuentas por pagar comerciales y calendario de pagos
├── acopios/{acopioId}            # Acopio agrícola: productor, peso, precio y liquidación
├── expenses/{expenseId}          # Gastos operativos clasificados por taxonomía
├── cashEvents/{eventId}          # Aperturas y cierres físicos de caja (arqueo inicial/final)
├── dailySummaries/{YYYY-MM-DD}   # Resumen financiero diario acumulado (conciliación)
├── employees/{employeeId}        # Permisos y asignación de colaboradores del negocio
├── invitations/{token}           # Enlaces seguros para invitación de colaboradores
└── traceability/{logId}          # Auditoría de operaciones críticas (useTraceability)

users/{userId}                    # Perfil de usuario, rol global y array de businesses vinculados
programs/{programId}              # Programas de aceleración y capacitación (Juntos)
├── activities/{activityId}       # Sesiones formativas, talleres y asistencias
└── consultingDossiers/{dossierId}# Diagnóstico de negocio, áreas críticas y plan de acción

comercial/settings                # Parámetros del CRM: zonas geográficas, metas y cohortes
comercial/{recordId}              # Leads y estado del pipeline de ventas

guiones/{guionId}                 # Biblioteca compartida de guiones de video generados con IA
taxonomies/{taxonomyId}           # Taxonomías oficiales de industrias y gastos
```

---

### 2.4 Layouts y Enrutamiento en `apps/web`

```
/
├── /auth/login, /auth/register             → AuthLayout (acceso público para invitados)
├── /invite/:token                          → AuthLayout (registro/unión por invitación)
├── /legal/terminos-condiciones             → DefaultLayout (documentos legales)
├── /onboarding                             → MainLayout (wizard de creación del primer negocio)
├── /select-business                        → MainLayout (selector multi-negocio para gerentes)
│
├── /business/:businessId/                  → MainLayout (panel de operaciones del negocio)
│   ├── dashboard                           → Resumen ejecutivo de métricas
│   ├── basicAccountingRecordsBook          → Libro de registros contables unificado
│   ├── income, expenses, transfers, sales  → Libros de movimientos transaccionales
│   ├── reports, reports/financial          → Balance general y reportes de caja
│   ├── accounts-balance                    → Apertura, cierre y estado de caja diaria
│   ├── accounts, accounts-receivable       → Cuentas por cobrar
│   ├── accounts-payable, suppliers         → Proveedores y cuentas por pagar
│   ├── income-statement                    → Estado de Resultados Devengado (P&L)
│   ├── inventory                           → Catálogo de stock, valorización y mermas
│   ├── acopio                              → Recepción de acopios y liquidaciones (Wala Coop)
│   ├── clients                             → Gestión de clientes y recurrencia
│   ├── employees                           → Colaboradores y permisos asignados
│   ├── quotes, orders                      → Cotizaciones y órdenes de pedido
│   ├── streak                              → Sistema de gamificación y racha operativa
│   ├── pro, plans                          → Gestión de planes de suscripción
│   └── programs/:programId/...             → Participación en programa Juntos
│
├── /programs/                              → FacilitatorLayout (rol consultor/facilitador)
│   ├── :programId/activities               → Gestión de sesiones y asistencias
│   ├── :programId/participants             → Directorio de negocios asesorados
│   ├── :programId/consultings              → Expedientes de diagnóstico y consultoría
│   └── :programId/reports                  → Reportes de impacto del programa
│
├── /admin/commercial                       → MainLayout (administración del CRM de ventas)
├── /admin/users                            → MainLayout (control global de suscripciones)
├── /guiones/...                            → MainLayout (editor de guiones formativos)
└── /sesiones/...                           → MainLayout (cuadernillos interactivos de capacitación)
```

---

## 3. Catálogo de Stores Pinia (`apps/web/src/stores`)

| Store | Archivo | Responsabilidad Principal |
|-------|---------|---------------------------|
| `auth` | `authStore.js` | Autenticación en Firebase, inicio con Google, estado de sesión reactivo. |
| `user` | `useUserStore.js` | Datos del usuario logueado, lista de negocios (`businessesIds`), rol activo. |
| `business` | `businessStore.js` | Negocio seleccionado, perfil comercial, límites del plan y configuración. |
| `transaction` | `transaction/transactionStore.js` | CRUD transaccional, cálculos de totales y cobro en ventas. |
| `transactionFlow` | `transaction/transactionFlowStore.js` | Wizard guiado para registro de ventas, medios de pago y clientes. |
| `accountsBalance` | `AccountsBalanceApp/accountsBalanceStore.js` | Conciliación de caja diaria, listener en tiempo real a `dailySummaries`. |
| `accountBalanceFlow` | `AccountsBalanceApp/accountsBalanceFlowStore.js` | Flujo paso a paso para apertura y cierre de caja. |
| `inventory` | `inventoryStore.js` | Existencias de productos, alertas de stock mínimo y valorización. |
| `addStockFlow` | `Inventory/AddStockFlow.js` | Asistente de recepción de mercadería y compras. |
| `removeStockFlow` | `Inventory/RemoveStockFlow.js` | Asistente de salida de inventario por consumo o merma. |
| `inventoryCountFlow` | `Inventory/InventoryCountFlow.js` | Asistente de conteo físico periódico y ajuste de inventario. |
| `productMetrics` | `Inventory/productMetricsStore.js` | Análisis de rotación, producto estrella y margen unitario. |
| `productCosting` | `productCostingStore.js` | Estructura modular de costeo de fabricación (materia prima, MOD, CIF). |
| `acopio` | `acopioStore.js` | Acopios agropecuarios, control de pesaje y liquidaciones a productores. |
| `supplier` | `supplierStore.js` | Directorio de proveedores comerciales y pagos adeudados. |
| `employee` | `employeeStore.js` | Colaboradores, asignación de roles y permisos del negocio. |
| `invitation` | `invitationStore.js` | Generación y validación de tokens de invitación segura. |
| `client` | `clientStore.js` | Cartera de clientes y estadísticas de compra. |
| `commerce` | `commerceStore.js` | CRM comercial sobre `comercial/` (Kanban, zonas, metas). |
| `program` | `programStore.js` | Estructura de programas Juntos, fases y cohortes. |
| `activities` | `activitiesStore.js` | Actividades formativas y control de asistencia de participantes. |
| `consultingDossier` | `consultingDossierStore.js` | Expedientes de consultoría empresarial para facilitadores. |
| `consultingApp` | `consultingAppStore.js` | Vista del expediente desde el lado del emprendedor asesorado. |
| `actionPlanFlow` | `actionPlanFlowStore.js` | Asistente de estructuración de planes de acción de consultoría. |
| `criticalAreasFlow`| `criticalAreasFlowStore.js` | Wizard de evaluación y ponderación de áreas críticas. |
| `adminConsultingV2`| `adminBusinessConsultingStoreV2.js` | Panel avanzado de analítica de consultoría para administradores. |
| `performance` | `performanceStore.js` | Métricas agregadas y KPIs de desempeño empresarial. |
| `expenses` | `expensesStore.js` | Categorización de gastos y deducciones operativas. |
| `file` | `fileStore.js` | Carga, validación y optimización de adjuntos en Storage. |
| `guiones` | `guionesStore.js` | Creación y almacenamiento de guiones de video en Firestore. |

---

## 4. Catálogo de Cloud Functions (`apps/functions`)

| Función Exportada | Trigger / Tipo | Dominio | Propósito |
|-------------------|----------------|---------|-----------|
| `scheduledAutoClose` | Cloud Scheduler (diario) | Finanzas | Cierre automático masivo de cajas sin cerrar en negocios activos. |
| `lazyCloseIfNeeded` | Callable HTTPS | Finanzas | Cierre perezoso en cadena al entrar el usuario si pasaron días sin cierre. |
| `onTransactionWrite` | Firestore Trigger (`write`) | Finanzas | Recálculo asíncrono de acumulados en `dailySummaries`. |
| `processTransactionBackground` | Firestore Trigger | Finanzas | Desacople de operaciones pesadas tras registrar transacciones. |
| `deleteSale` | Callable HTTPS | Transacciones | Reversión atómica de ventas, reposición de inventario y nota `refund`. |
| `classifyProductRequest` | Callable HTTPS | Inventario AI | Clasificación inteligente de productos con modelo de 3 capas. |
| `onProductCorrected` | Firestore Trigger | Inventario AI | Aprendizaje automático y refinamiento cuando el usuario corrige una clase. |
| `classifyExpenseOnCreate` | Firestore Trigger | Gastos AI | Clasificación automática de gastos según taxonomía oficial. |
| `onBusinessCreated` | Firestore Trigger | Negocio | Detección de industria por inferencia y setup de taxonomías. |
| `generateInitialTaxonomies` | Callable HTTPS | Taxonomías | Generación programada de árboles de categorías estándar. |
| `joinProgramByCode` | Callable HTTPS | Programas | Enrolamiento seguro de un negocio a un programa Juntos vía código. |
| `processFileUpload` | Storage Trigger | Storage | Procesamiento, compresión y validación de vouchers y adjuntos. |
| `renderToImageV2` | Callable HTTPS (Gen2) | Compartir | Renderizado headless con Puppeteer para compartir resúmenes visuales. |
| `payments` | HTTPS Express API | Pagos | Endpoint para cobros con Mercado Pago y recepción de webhooks. |
| `grokProxy` | Callable HTTPS | IA / Contenido | Proxy backend seguro para llamadas a Grok (xAI) evitando CORS. |
| `onBusinessCreatedOnboarding` | Firestore Trigger | Onboarding | Envío de correo de bienvenida al registrar un nuevo negocio (Resend). |
| `onStreakUpdated` | Firestore Trigger | Gamificación | Alerta por email al alcanzar o poner en riesgo la racha operativa. |
| `adminGetAllBusinesses` | Callable HTTPS | Admin | Listado global paginado de negocios para el panel de administración. |
| `adminUpdateSubscription` | Callable HTTPS | Admin | Asignación y cambio forzado de plan de suscripción desde panel admin. |
| `checkTrialExpiration` | Scheduled Cron | Suscripciones | Degradación automática a plan Free al cumplirse el periodo de prueba. |

---

## 5. Reglas de Código y Buenas Prácticas

### 5.1 Nomenclatura y Convenciones

- **Componentes Vue (`apps/web`):** PascalCase estricto (`TransactionModal.vue`, `AcopioReceipt.vue`).
- **Componentes React (`apps/content` & `apps/video`):** PascalCase (`ScriptCard.jsx`, `AgricultorVideo.tsx`).
- **Stores Pinia:** camelCase con sufijo `Store` (`acopioStore.js`, `supplierStore.js`).
- **Composables:** camelCase con prefijo `use` (`useSubscription.js`, `useInventory.js`).
- **Colecciones Firestore:** camelCase en plural (`businesses`, `cashEvents`, `suppliers`, `acopios`).
- **Campos Firestore:** camelCase estricto (`businessId`, `finalAmount`, `createdAt`).

### 5.2 Reglas Críticas (Qué NO Hacer)

1. ❌ **No usar rutas relativas o asumir `src/` en la raíz:** La aplicación web vive exclusivamente en `apps/web/src/`.
2. ❌ **No saltarse la reversión atómica de ventas:** Nunca borrar documentos de ventas directamente con `deleteDoc`. Siempre invocar la Cloud Function `deleteSale`.
3. ❌ **No hardcodear el `businessId`:** Siempre debe obtenerse de `businessStore.getBusinessId` o de `route.params.businessId`.
4. ❌ **No crear archivos Markdown sueltos en la raíz:** Toda nueva documentación debe alojarse bajo `docs/{categoria}/` y ser referenciada en `docs/README.md`.
5. ❌ **No mezclar `Date.now()` sin timestamp de servidor:** Las escrituras a Firestore deben usar `serverTimestamp()` para evitar desfases de horario local.
6. ❌ **No omitir el manejo de los 3 estados en stores y vistas:** Toda operación asíncrona debe reflejar `loading`, `error` y `data`.

---

## 6. Historial de Sesiones y Hitos Recientes

### Noviembre 2026
- **Auditoría e Integración Total de Documentación:** Actualización completa de `README.md` y `CONTEXT.md` alineada a la realidad del Monorepo con NPM Workspaces.
- **Clasificación Contable y Costeo Devengado:** Expansión de clasificación de líneas de balance, congelamiento de estructura de costo por producto y fortalecimiento de autorización en reversión de ventas.
- **Limpieza de Raíz y Scripts:** Eliminación de scripts heredados obsoletos y reestructuración de exports en emuladores locales.

### Octubre 2026
- **Migración a Monorepo NPM Workspaces:** Desacoplamiento de la raíz hacia `apps/web`, `apps/content`, `apps/video`, `apps/functions` y `packages/shared-types`.
- **Wala Motion Suite (Remotion):** Lanzamiento de composiciones programáticas de video 9:16 (Bodegas, Ferreterías, Cooperativas) con tipado Zod y React 19.
- **Reversión de Ventas y Notas de Devolución:** Implementación de Cloud Function `deleteSale` con reincorporación transaccional de existencias y comprobantes `refund`.
- **Módulo de Acopios Agropecuarios (Wala Coop):** Registro de acopios, pesaje, precio de compra a productores y liquidaciones pendientes.

### Agosto – Septiembre 2026
- **Proveedores y Cuentas por Pagar:** Vistas y stores dedicados para pasivos comerciales y calendario de vencimientos.
- **Valorización Integral de Inventario:** Cálculo de costo promedio ponderado y margen de contribución por producto.

### Mayo 2026
- **Reorganización Estructural de `/docs`:** Clasificación en 11 categorías temáticas y checklist formal de mantenimiento documental.
- **Auto-Close Escalable:** Reescritura de `scheduledAutoClose` con `collectionGroup` y soporte para `lazyCloseIfNeeded` en cadena (hasta 30 días).

---

## 7. Enlaces y Referencias de Consulta Rápida

| Recurso | Ruta en el Repositorio |
|---------|------------------------|
| Índice Maestro de Documentación | [`docs/README.md`](docs/README.md) |
| Checklist de Mantenimiento de Docs | [`docs/DOC_MAINTENANCE_CHECKLIST.md`](docs/DOC_MAINTENANCE_CHECKLIST.md) |
| Arquitectura Multi-Negocio | [`docs/architecture/SISTEMA_MULTI_NEGOCIO.md`](docs/architecture/SISTEMA_MULTI_NEGOCIO.md) |
| Estructura del Documento Business | [`docs/architecture/BUSINESS_DOCUMENT_STRUCTURE.md`](docs/architecture/BUSINESS_DOCUMENT_STRUCTURE.md) |
| P&L y Costo de Ventas Devengado | [`docs/features/ESTADO_RESULTADOS_PL_DEVENGADO.md`](docs/features/ESTADO_RESULTADOS_PL_DEVENGADO.md) |
| Reversión de Ventas y Notas Refund | [`docs/transactions/SALE_DELETION_AND_REFUND_NOTE.md`](docs/transactions/SALE_DELETION_AND_REFUND_NOTE.md) |
| Sistema Integral de Acopios | [`docs/inventory/SISTEMA_ACOPIOS.md`](docs/inventory/SISTEMA_ACOPIOS.md) |
| Sistema de Cierre de Caja Modular | [`docs/transactions/SISTEMA_APERTURA_CIERRE_MODULAR.md`](docs/transactions/SISTEMA_APERTURA_CIERRE_MODULAR.md) |
| Sistema de Suscripciones y Pagos | [`docs/subscriptions/SISTEMA_SUSCRIPCIONES_PREMIUM.md`](docs/subscriptions/SISTEMA_SUSCRIPCIONES_PREMIUM.md) |
| CRM Comercial | [`docs/comercial/SISTEMA_COMERCIAL_CRM.md`](docs/comercial/SISTEMA_COMERCIAL_CRM.md) |
| Módulo Juntos y Expedientes | [`docs/juntos/MODULO_JUNTOS_RESUMEN.md`](docs/juntos/MODULO_JUNTOS_RESUMEN.md) |
| Configuración de Firebase y Hosting | [`firebase.json`](firebase.json) |
| Reglas de Seguridad de Firestore | [`firestore.rules`](firestore.rules) |
| Índices de Base de Datos | [`firestore.indexes.json`](firestore.indexes.json) |
| Código de Cloud Functions | [`apps/functions/index.js`](apps/functions/index.js) |
| Router Principal Web | [`apps/web/src/router/index.js`](apps/web/src/router/index.js) |
