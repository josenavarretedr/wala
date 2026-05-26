# 📚 Documentación — Wala

**Última actualización:** Mayo 2026 — Reorganización por features
**Versión del proyecto:** Producción activa
**Framework:** Vue 3 + Pinia + Firebase/Firestore

---

## 📂 Estructura de Documentación

```
docs/
├── README.md                        ← Este archivo (índice maestro)
├── DOC_MAINTENANCE_CHECKLIST.md     ← Checklist de cierre de tickets
├── architecture/                    ← Arquitectura y decisiones de diseño
├── stores/                          ← Documentación técnica de stores Pinia
├── transactions/                    ← Transacciones, apertura/cierre de caja
├── inventory/                       ← Inventario, stock, materiales, costeo
├── subscriptions/                   ← Suscripciones, pagos, webhooks
├── juntos/                          ← Módulo Juntos (programas, asesorías)
├── comercial/                       ← CRM Comercial (pipeline, KPIs)
├── features/                        ← Features independientes
├── ui/                              ← Componentes UI, animaciones, onboarding
├── firebase/                        ← Firebase, Cloud Functions, analytics
└── deprecated/                      ← Archivos obsoletos / históricos
```

---

## 🏗️ architecture/ — Arquitectura y Diseño

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [ARQUITECTURA_COHERENTE.md](architecture/ARQUITECTURA_COHERENTE.md) | Principios de arquitectura, separación de stores | ✅ Activo |
| [SISTEMA_MULTI_NEGOCIO.md](architecture/SISTEMA_MULTI_NEGOCIO.md) | Arquitectura multi-negocio (1 usuario → N negocios) | ✅ Activo |
| [SISTEMA_REGISTRO_ACTUALIZADO.md](architecture/SISTEMA_REGISTRO_ACTUALIZADO.md) | Sistema de registro multi-negocio | ✅ Activo |
| [BUSINESS_DOCUMENT_STRUCTURE.md](architecture/BUSINESS_DOCUMENT_STRUCTURE.md) | Estructura del documento Business en Firestore | ✅ Activo |
| [DASHBOARD_IMPLEMENTADO.md](architecture/DASHBOARD_IMPLEMENTADO.md) | Layout y dashboard empresarial | ✅ Activo |

---

## 🗄️ stores/ — Stores Pinia

### Stores principales

| Archivo | Store ID | Descripción | Estado |
|---------|----------|-------------|--------|
| [AUTH_STORE.md](stores/AUTH_STORE.md) | `auth` | Autenticación, sesión, Google Auth | ✅ Activo |
| [BUSINESS_STORE.md](stores/BUSINESS_STORE.md) | `business` | Negocio activo, suscripciones, permisos | ✅ Activo |
| [USER_STORE.md](stores/USER_STORE.md) | `user` | Perfil de usuario, multi-negocio, roles | ✅ Activo |
| [ACTIVITIES_STORE.md](stores/ACTIVITIES_STORE.md) | `activities` | Actividades y participaciones (Juntos) | ✅ Activo |
| [PROGRAM_STORE.md](stores/PROGRAM_STORE.md) | `program` | Programas del módulo Juntos | ✅ Activo |
| [GUIONES_STORE.md](stores/GUIONES_STORE.md) | `guiones` | Videos y guiones de contenido | ✅ Activo |
| [CLIENT_STORE.md](stores/CLIENT_STORE.md) | `clientStore` | Clientes del negocio | ✅ Activo |
| [FILE_STORE.md](stores/FILE_STORE.md) | `file` | Uploads y adjuntos de archivos | ✅ Activo |
| [PRODUCT_COSTING_STORE.md](stores/PRODUCT_COSTING_STORE.md) | `productCosting` | Costeo de producción | ✅ Activo |
| [BUSINESS_ONBOARDING_FLOW_STORE.md](stores/BUSINESS_ONBOARDING_FLOW_STORE.md) | `businessOnboardingFlow` | Wizard de creación de negocio | ✅ Activo |
| [SAVINGS_STORE.md](stores/SAVINGS_STORE.md) | `savings` | Ahorros de usuario | ⚠️ Sin uso |

### Stores de Inventario

| Archivo | Store ID | Descripción | Estado |
|---------|----------|-------------|--------|
| [INVENTORY_STORE.md](stores/INVENTORY_STORE.md) | — | Productos y stock | ✅ Activo |
| [INVENTORY_FLOW_STORES.md](stores/INVENTORY_FLOW_STORES.md) | `addStockFlow` / `removeStockFlow` / `inventoryCountFlow` | Wizards de stock | ✅ Activo |
| [PRODUCT_METRICS_STORE.md](stores/PRODUCT_METRICS_STORE.md) | `productMetrics` | Métricas de rotación y rentabilidad | ✅ Activo |

### Stores de Balance y Caja

| Archivo | Store ID | Descripción | Estado |
|---------|----------|-------------|--------|
| [ACCOUNTS_BALANCE_STORE.md](stores/ACCOUNTS_BALANCE_STORE.md) | `accountsBalance` | Cálculos financieros, DailySummary | ✅ Activo |
| [ACCOUNTS_BALANCE_FLOW_STORE.md](stores/ACCOUNTS_BALANCE_FLOW_STORE.md) | `accountBalanceFlow` | Wizard apertura/cierre de caja | ✅ Activo |
| [CASH_EVENT_STORE.md](stores/CASH_EVENT_STORE.md) | — | Eventos de caja | ✅ Activo |

### Stores de Transacciones

| Archivo | Store ID | Descripción | Estado |
|---------|----------|-------------|--------|
| [TRANSACTION_STORE.md](stores/TRANSACTION_STORE.md) | — | Core de transacciones | ✅ Activo |
| [TRANSACTION_FLOW_STORE.md](stores/TRANSACTION_FLOW_STORE.md) | `transactionFlow` | Wizard de transacciones | ✅ Activo |
| [EXPENSES_STORE.md](stores/EXPENSES_STORE.md) | — | Store de gastos | ✅ Activo |

---

## 💰 transactions/ — Transacciones y Finanzas

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [SISTEMA_APERTURA_CIERRE_MODULAR.md](transactions/SISTEMA_APERTURA_CIERRE_MODULAR.md) | Sistema modular de apertura y cierre de caja | ✅ Activo |
| [CLOSURE_TRANSACTION_UNIFIED_STRUCTURE.md](transactions/CLOSURE_TRANSACTION_UNIFIED_STRUCTURE.md) | Estructura de transacciones de cierre | ✅ Activo |
| [OPENING_TRANSACTION_UNIFIED_STRUCTURE.md](transactions/OPENING_TRANSACTION_UNIFIED_STRUCTURE.md) | Estructura de transacciones de apertura | ✅ Activo |
| [TRANSACTION_DELETION_INTEGRITY.md](transactions/TRANSACTION_DELETION_INTEGRITY.md) | Integridad al eliminar transacciones | ✅ Activo |
| [DELETE_TRANSACTION_MODAL_IMPLEMENTATION.md](transactions/DELETE_TRANSACTION_MODAL_IMPLEMENTATION.md) | Modal de eliminación | ✅ Activo |
| [SISTEMA_PAGOS_PARCIALES_IMPLEMENTADO.md](transactions/SISTEMA_PAGOS_PARCIALES_IMPLEMENTADO.md) | Pagos parciales en transacciones | ✅ Activo |
| [ACCOUNTS_BALANCE_STORE_USAGE.md](transactions/ACCOUNTS_BALANCE_STORE_USAGE.md) | Guía de uso del balance | ✅ Activo |
| [LAZY_CLOSE_INTEGRATION.md](transactions/LAZY_CLOSE_INTEGRATION.md) | Cierre automático multi-día (Cloud Function) | ✅ Activo |
| [OPTIMIZED_AUTOMATED_CLOSURES.md](transactions/OPTIMIZED_AUTOMATED_CLOSURES.md) | Cierre diario automático programado optimizado | ✅ Activo |
| [REALTIME_DAILYSUMMARY_LISTENER.md](transactions/REALTIME_DAILYSUMMARY_LISTENER.md) | Listener en tiempo real del resumen diario | ✅ Activo |

---

## 📦 inventory/ — Inventario y Stock

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [SISTEMA_ADICION_STOCK.md](inventory/SISTEMA_ADICION_STOCK.md) | Flujo de adición de stock | ✅ Activo |
| [SISTEMA_REMOCION_STOCK.md](inventory/SISTEMA_REMOCION_STOCK.md) | Flujo de remoción de stock | ✅ Activo |
| [SISTEMA_CONTEO_INVENTARIO.md](inventory/SISTEMA_CONTEO_INVENTARIO.md) | Conteo físico de inventario | ✅ Activo |
| [SISTEMA_VENTA_STOCK_INSUFICIENTE.md](inventory/SISTEMA_VENTA_STOCK_INSUFICIENTE.md) | Ventas con stock insuficiente | ✅ Activo |
| [DIAGRAMA_STOCK_INSUFICIENTE.md](inventory/DIAGRAMA_STOCK_INSUFICIENTE.md) | Diagrama del flujo de stock | ✅ Activo |
| [INVENTORY_PRODUCT_DETAILS.md](inventory/INVENTORY_PRODUCT_DETAILS.md) | Detalles de producto | ✅ Activo |
| [INTEGRACION_PRODUCTS_MATERIALS.md](inventory/INTEGRACION_PRODUCTS_MATERIALS.md) | Integración productos-materiales | ✅ Activo |
| [EXPENSE_MATERIALS_UNIFIED_STRUCTURE.md](inventory/EXPENSE_MATERIALS_UNIFIED_STRUCTURE.md) | Estructura de gastos de materiales | ✅ Activo |
| [SISTEMA_GASTOS_RECURRENTES.md](inventory/SISTEMA_GASTOS_RECURRENTES.md) | Sistema de gastos recurrentes | ✅ Activo |

---

## 💳 subscriptions/ — Suscripciones y Pagos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [SISTEMA_SUSCRIPCIONES_PREMIUM.md](subscriptions/SISTEMA_SUSCRIPCIONES_PREMIUM.md) | Sistema Free/Pro/Max completo | ✅ Activo |
| [VERIFICACION_SUSCRIPCIONES.md](subscriptions/VERIFICACION_SUSCRIPCIONES.md) | Verificación de suscripciones | ✅ Activo |
| [MERCADOPAGO_PRODUCTION_GUIDE.md](subscriptions/MERCADOPAGO_PRODUCTION_GUIDE.md) | Guía de producción MercadoPago | ✅ Activo |
| [YAPE_TESTING_GUIDE.md](subscriptions/YAPE_TESTING_GUIDE.md) | Guía de pruebas Yape | ✅ Activo |
| [WEBHOOK_IMPLEMENTATION_SUMMARY.md](subscriptions/WEBHOOK_IMPLEMENTATION_SUMMARY.md) | Implementación de webhooks | ✅ Activo |
| [WEBHOOK_LOCAL_TESTING.md](subscriptions/WEBHOOK_LOCAL_TESTING.md) | Testing local de webhooks | ✅ Activo |

---

## 🤝 juntos/ — Módulo Juntos (Programas)

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [MODULO_JUNTOS_RESUMEN.md](juntos/MODULO_JUNTOS_RESUMEN.md) | Resumen completo del módulo | ✅ Activo |
| [MODULO_JUNTOS_DEPLOYMENT.md](juntos/MODULO_JUNTOS_DEPLOYMENT.md) | Guía de despliegue | ✅ Activo |
| [SETUP_PROGRAMS_GUIDE.md](juntos/SETUP_PROGRAMS_GUIDE.md) | Setup de datos de prueba | ✅ Activo |
| [ACTIVIDAD_PARTICIPACION_REFACTOR_MARZO_2026.md](juntos/ACTIVIDAD_PARTICIPACION_REFACTOR_MARZO_2026.md) | Refactor Formulario→Actividad | ✅ Activo |
| [CONSULTING_DOSSIER_STORE.md](juntos/CONSULTING_DOSSIER_STORE.md) | Expedientes de consultoría | ✅ Activo |

---

## 📊 comercial/ — CRM Comercial

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [SISTEMA_COMERCIAL_CRM.md](comercial/SISTEMA_COMERCIAL_CRM.md) | Pipeline, KPIs, leads, WhatsApp | ✅ Activo |

---

## ⚡ features/ — Features Independientes

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [BUSINESS_CONSULTING_MODULE.md](features/BUSINESS_CONSULTING_MODULE.md) | Módulo de Asesoría de Negocios | ✅ Activo |
| [BUSINESS_CONSULTING_QUICK_START.md](features/BUSINESS_CONSULTING_QUICK_START.md) | Guía de Inicio Rápido de Asesoría | ✅ Activo |
| [ESTADO_RESULTADOS_PL_DEVENGADO.md](features/ESTADO_RESULTADOS_PL_DEVENGADO.md) | Estado de Resultados (P&L) y Costo de Ventas Devengado | ✅ Activo |
| [SISTEMA_CLIENTES.md](features/SISTEMA_CLIENTES.md) | Gestión de clientes | ✅ Activo |
| [SISTEMA_TRAZABILIDAD_IMPLEMENTADO.md](features/SISTEMA_TRAZABILIDAD_IMPLEMENTADO.md) | Sistema de trazabilidad | ✅ Activo |
| [STREAK_SYSTEM_IMPLEMENTATION.md](features/STREAK_SYSTEM_IMPLEMENTATION.md) | Sistema de racha (streak) | ✅ Activo |
| [SHARE_IMAGE_SYSTEM.md](features/SHARE_IMAGE_SYSTEM.md) | Compartir imagen completo | ✅ Activo |
| [SHARE_IMAGE_IMPLEMENTATION_SUMMARY.md](features/SHARE_IMAGE_IMPLEMENTATION_SUMMARY.md) | Resumen compartir imagen | ✅ Activo |
| [GUIONES_SYSTEM_README.md](features/GUIONES_SYSTEM_README.md) | Guiones de video IA | ✅ Activo |
| [FILE_ATTACHMENT_GUIDE.md](features/FILE_ATTACHMENT_GUIDE.md) | Guía completa adjuntos | ✅ Activo |
| [FILE_ATTACHMENT_QUICK_START.md](features/FILE_ATTACHMENT_QUICK_START.md) | Quick start adjuntos | ✅ Activo |

---

## 🎨 ui/ — Componentes UI y Guías Visuales

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [SISTEMA_ONBOARDING.md](ui/SISTEMA_ONBOARDING.md) | Sistema de onboarding Driver.js | ✅ Activo |
| [ONBOARDING_VISUAL_UPGRADE.md](ui/ONBOARDING_VISUAL_UPGRADE.md) | Mejoras visuales onboarding | ✅ Activo |
| [ANIMATIONS_GUIDE.md](ui/ANIMATIONS_GUIDE.md) | Guía de animaciones y transiciones | ✅ Activo |
| [BACK_BTN_USAGE.md](ui/BACK_BTN_USAGE.md) | Componente BackBtn | ✅ Activo |
| [CLOSE_BTN_USAGE.md](ui/CLOSE_BTN_USAGE.md) | Componente CloseBtn | ✅ Activo |
| [FULL_SCREEN_LOADER_USAGE.md](ui/FULL_SCREEN_LOADER_USAGE.md) | Loader pantalla completa | ✅ Activo |
| [LOADER_SPINNERS_VISIBLE.md](ui/LOADER_SPINNERS_VISIBLE.md) | Spinners y loaders visibles | ✅ Activo |
| [PROGRESS_INDICATOR_USAGE.md](ui/PROGRESS_INDICATOR_USAGE.md) | Indicador de progreso | ✅ Activo |

---

## 🔥 firebase/ — Firebase, Analytics y Monitoring

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [analytics.md](firebase/analytics.md) | Sistema de analytics GA4 | ✅ Activo |
| [ANALYTICS_IMPLEMENTATION_MAP.md](firebase/ANALYTICS_IMPLEMENTATION_MAP.md) | Mapa de implementación analytics | ✅ Activo |
| [FIREBASE_FUNCTIONS_REFACTOR.md](firebase/FIREBASE_FUNCTIONS_REFACTOR.md) | Refactor Cloud Functions | ✅ Activo |
| [FIRESTORE_SETUP_INSTRUCTIONS.md](firebase/FIRESTORE_SETUP_INSTRUCTIONS.md) | Instrucciones setup Firestore | ✅ Activo |
| [QUICK_START_FUNCTIONS.md](firebase/QUICK_START_FUNCTIONS.md) | Quick start Cloud Functions | ✅ Activo |
| [SENTRY_IMPLEMENTATION_GUIDE.md](firebase/SENTRY_IMPLEMENTATION_GUIDE.md) | Integración Sentry | ✅ Activo |

---

## 🗃️ deprecated/ — Archivos Obsoletos

> Archivos de funcionalidades eliminadas, migraciones completadas, y correcciones históricas.

Contiene 37+ archivos históricos. No consultar para implementaciones actuales.

---

## Sin Documentación Activa

| Elemento | Archivo en código | Razón |
|----------|-------------------|-------|
| `cashClosureStore.js` | `src/stores/cashClosureStore.js` | Posible duplicado de `cashEventStore.js` |
| `useSavingsStore.js` | `src/stores/useSavingsStore.js` | Sin uso en componentes |
| 40+ composables | `src/composables/` | Documentación en progreso |

---

_Generado en: Auditoría Wala — Mayo 2026_
