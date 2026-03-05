# 📚 Documentación — Wala

**Última actualización:** Marzo 2026 — Auditoría completa de código fuente
**Versión del proyecto:** Producción activa
**Framework:** Vue 3 + Pinia + Firebase/Firestore

---

## Stores

### Stores principales (Pinia / Composition API)

| Archivo                                                                | Store ID                 | Descripción                                           | Estado            |
| ---------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------- | ----------------- |
| [AUTH_STORE.md](AUTH_STORE.md)                                         | `auth`                   | Autenticación, sesión, localStorage, Google Auth      | ✅ Activo         |
| [BUSINESS_STORE.md](BUSINESS_STORE.md)                                 | `business`               | Negocio activo, empleados, suscripciones, permisos    | ✅ Activo         |
| [USER_STORE.md](USER_STORE.md)                                         | `user`                   | Perfil de usuario, multi-negocio, roles               | ✅ Activo         |
| [ACTIVITIES_STORE.md](ACTIVITIES_STORE.md)                             | `activities`             | Actividades y participaciones (módulo Juntos)         | ✅ Activo         |
| [PROGRAM_STORE.md](PROGRAM_STORE.md)                                   | `program`                | Programas (módulo Juntos)                             | ✅ Activo         |
| [GUIONES_STORE.md](GUIONES_STORE.md)                                   | `guiones`                | Videos y guiones de contenido                         | ✅ Activo         |
| [CLIENT_STORE.md](CLIENT_STORE.md)                                     | `clientStore`            | Clientes del negocio                                  | ✅ Activo         |
| [FILE_STORE.md](FILE_STORE.md)                                         | `file`                   | Uploads y adjuntos de archivos                        | ✅ Activo         |
| [PRODUCT_COSTING_STORE.md](PRODUCT_COSTING_STORE.md)                   | `productCosting`         | Costeo de producción (materiales, MOD, CIF, overhead) | ✅ Activo         |
| [BUSINESS_ONBOARDING_FLOW_STORE.md](BUSINESS_ONBOARDING_FLOW_STORE.md) | `businessOnboardingFlow` | Wizard de creación de negocio                         | ✅ Activo         |
| [SAVINGS_STORE.md](SAVINGS_STORE.md)                                   | `savings`                | Ahorros de usuario                                    | ⚠️ Sin uso activo |

### Stores de Inventario

| Archivo                                              | Store ID                                                  | Descripción                                         | Estado    |
| ---------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------- | --------- |
| [INVENTORY_STORE.md](INVENTORY_STORE.md)             | —                                                         | Productos y stock del inventario                    | ✅ Activo |
| [INVENTORY_FLOW_STORES.md](INVENTORY_FLOW_STORES.md) | `addStockFlow` / `removeStockFlow` / `inventoryCountFlow` | Wizards de adición, remoción y conteo de stock      | ✅ Activo |
| [PRODUCT_METRICS_STORE.md](PRODUCT_METRICS_STORE.md) | `productMetrics`                                          | Métricas de rotación, rentabilidad y valor de stock | ✅ Activo |

### Stores de Balance y Caja

| Archivo                                                          | Store ID             | Descripción                                | Estado    |
| ---------------------------------------------------------------- | -------------------- | ------------------------------------------ | --------- |
| [ACCOUNTS_BALANCE_STORE.md](ACCOUNTS_BALANCE_STORE.md)           | `accountsBalance`    | Cálculos financieros, DailySummary, saldos | ✅ Activo |
| [ACCOUNTS_BALANCE_FLOW_STORE.md](ACCOUNTS_BALANCE_FLOW_STORE.md) | `accountBalanceFlow` | Wizard de apertura y cierre de caja        | ✅ Activo |
| [CASH_EVENT_STORE.md](CASH_EVENT_STORE.md)                       | —                    | Eventos de caja (apertura/cierre diario)   | ✅ Activo |

### Stores de Transacciones

| Archivo                                                | Store ID          | Descripción                                                            | Estado            |
| ------------------------------------------------------ | ----------------- | ---------------------------------------------------------------------- | ----------------- |
| [TRANSACTION_STORE.md](TRANSACTION_STORE.md)           | —                 | Core de transacciones (ingresos, gastos, transferencias, cotizaciones) | ✅ Activo crítico |
| [TRANSACTION_FLOW_STORE.md](TRANSACTION_FLOW_STORE.md) | `transactionFlow` | Wizard de creación de transacciones                                    | ✅ Activo         |
| [EXPENSES_STORE.md](EXPENSES_STORE.md)                 | —                 | Store de gastos individuales                                           | ✅ Activo         |

---

## Módulos / Funcionalidades

| Archivo                                                                            | Descripción                                                  | Estado    |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------- |
| [MODULO_JUNTOS_RESUMEN.md](MODULO_JUNTOS_RESUMEN.md)                               | Resumen completo del módulo Juntos (Programas + Actividades) | ✅ Activo |
| [MODULO_JUNTOS_DEPLOYMENT.md](MODULO_JUNTOS_DEPLOYMENT.md)                         | Guía de despliegue del módulo Juntos                         | ✅ Activo |
| [SETUP_PROGRAMS_GUIDE.md](SETUP_PROGRAMS_GUIDE.md)                                 | Guía de configuración de Programas                           | ✅ Activo |
| [SISTEMA_CLIENTES.md](SISTEMA_CLIENTES.md)                                         | Sistema de gestión de clientes                               | ✅ Activo |
| [SISTEMA_ONBOARDING.md](SISTEMA_ONBOARDING.md)                                     | Sistema de onboarding de nuevos negocios                     | ✅ Activo |
| [SISTEMA_MULTI_NEGOCIO.md](SISTEMA_MULTI_NEGOCIO.md)                               | Arquitectura multi-negocio                                   | ✅ Activo |
| [SISTEMA_SUSCRIPCIONES_PREMIUM.md](SISTEMA_SUSCRIPCIONES_PREMIUM.md)               | Sistema de planes Free/Premium/Trial                         | ✅ Activo |
| [SISTEMA_PAGOS_PARCIALES_IMPLEMENTADO.md](SISTEMA_PAGOS_PARCIALES_IMPLEMENTADO.md) | Pagos parciales en transacciones                             | ✅ Activo |
| [SISTEMA_TRAZABILIDAD_IMPLEMENTADO.md](SISTEMA_TRAZABILIDAD_IMPLEMENTADO.md)       | Sistema de trazabilidad de operaciones                       | ✅ Activo |
| [SISTEMA_REGISTRO_ACTUALIZADO.md](SISTEMA_REGISTRO_ACTUALIZADO.md)                 | Sistema de registros contables básicos                       | ✅ Activo |
| [SISTEMA_APERTURA_CIERRE_MODULAR.md](SISTEMA_APERTURA_CIERRE_MODULAR.md)           | Sistema modular de apertura y cierre de caja                 | ✅ Activo |
| [LAZY_CLOSE_INTEGRATION.md](LAZY_CLOSE_INTEGRATION.md)                             | Cierre automático de caja pendiente (Cloud Function)         | ✅ Activo |
| [REALTIME_DAILYSUMMARY_LISTENER.md](REALTIME_DAILYSUMMARY_LISTENER.md)             | Listener en tiempo real del resumen diario                   | ✅ Activo |
| [GUIONES_SYSTEM_README.md](GUIONES_SYSTEM_README.md)                               | Sistema de guiones y videos de contenido                     | ✅ Activo |

---

## Inventario

| Archivo                                                                          | Descripción                                    | Estado    |
| -------------------------------------------------------------------------------- | ---------------------------------------------- | --------- |
| [SISTEMA_ADICION_STOCK.md](SISTEMA_ADICION_STOCK.md)                             | Flujo de adición de stock                      | ✅ Activo |
| [SISTEMA_REMOCION_STOCK.md](SISTEMA_REMOCION_STOCK.md)                           | Flujo de remoción de stock                     | ✅ Activo |
| [SISTEMA_CONTEO_INVENTARIO.md](SISTEMA_CONTEO_INVENTARIO.md)                     | Flujo de conteo físico de inventario           | ✅ Activo |
| [SISTEMA_VENTA_STOCK_INSUFICIENTE.md](SISTEMA_VENTA_STOCK_INSUFICIENTE.md)       | Manejo de ventas con stock insuficiente        | ✅ Activo |
| [DIAGRAMA_STOCK_INSUFICIENTE.md](DIAGRAMA_STOCK_INSUFICIENTE.md)                 | Diagrama del flujo de stock insuficiente       | ✅ Activo |
| [INVENTORY_PRODUCT_DETAILS.md](INVENTORY_PRODUCT_DETAILS.md)                     | Detalles de productos en inventario            | ✅ Activo |
| [INTEGRACION_PRODUCTS_MATERIALS.md](INTEGRACION_PRODUCTS_MATERIALS.md)           | Integración productos-materiales (composición) | ✅ Activo |
| [EXPENSE_MATERIALS_UNIFIED_STRUCTURE.md](EXPENSE_MATERIALS_UNIFIED_STRUCTURE.md) | Estructura unificada de gastos de materiales   | ✅ Activo |
| [SISTEMA_GASTOS_RECURRENTES.md](SISTEMA_GASTOS_RECURRENTES.md)                   | Sistema de gastos recurrentes                  | ✅ Activo |

---

## Transacciones y Finanzas

| Archivo                                                                                  | Descripción                                       | Estado    |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------- | --------- |
| [CLOSURE_TRANSACTION_UNIFIED_STRUCTURE.md](CLOSURE_TRANSACTION_UNIFIED_STRUCTURE.md)     | Estructura unificada de transacciones de cierre   | ✅ Activo |
| [OPENING_TRANSACTION_UNIFIED_STRUCTURE.md](OPENING_TRANSACTION_UNIFIED_STRUCTURE.md)     | Estructura unificada de transacciones de apertura | ✅ Activo |
| [TRANSACTION_DELETION_INTEGRITY.md](TRANSACTION_DELETION_INTEGRITY.md)                   | Integridad al eliminar transacciones              | ✅ Activo |
| [DELETE_TRANSACTION_MODAL_IMPLEMENTATION.md](DELETE_TRANSACTION_MODAL_IMPLEMENTATION.md) | Modal de eliminación de transacciones             | ✅ Activo |
| [ACCOUNTS_BALANCE_STORE_USAGE.md](ACCOUNTS_BALANCE_STORE_USAGE.md)                       | Guía de uso del AccountsBalanceStore              | ✅ Activo |

---

## Guías Técnicas

| Archivo                                                                | Descripción                                      | Estado    |
| ---------------------------------------------------------------------- | ------------------------------------------------ | --------- |
| [FILE_ATTACHMENT_GUIDE.md](FILE_ATTACHMENT_GUIDE.md)                   | Guía completa de adjuntos de archivos            | ✅ Activo |
| [FILE_ATTACHMENT_QUICK_START.md](FILE_ATTACHMENT_QUICK_START.md)       | Quick start de adjuntos de archivos              | ✅ Activo |
| [FULL_SCREEN_LOADER_USAGE.md](FULL_SCREEN_LOADER_USAGE.md)             | Uso del loader de pantalla completa              | ✅ Activo |
| [PROGRESS_INDICATOR_USAGE.md](PROGRESS_INDICATOR_USAGE.md)             | Uso del indicador de progreso                    | ✅ Activo |
| [BACK_BTN_USAGE.md](BACK_BTN_USAGE.md)                                 | Uso del componente BackBtn                       | ✅ Activo |
| [CLOSE_BTN_USAGE.md](CLOSE_BTN_USAGE.md)                               | Uso del componente CloseBtn                      | ✅ Activo |
| [ANIMATIONS_GUIDE.md](ANIMATIONS_GUIDE.md)                             | Guía de animaciones y transiciones               | ✅ Activo |
| [LOADER_SPINNERS_VISIBLE.md](LOADER_SPINNERS_VISIBLE.md)               | Spinners y loaders visibles                      | ✅ Activo |
| [SENTRY_IMPLEMENTATION_GUIDE.md](SENTRY_IMPLEMENTATION_GUIDE.md)       | Integración con Sentry para monitoreo de errores | ✅ Activo |
| [MERCADOPAGO_PRODUCTION_GUIDE.md](MERCADOPAGO_PRODUCTION_GUIDE.md)     | Guía de producción MercadoPago                   | ✅ Activo |
| [YAPE_TESTING_GUIDE.md](YAPE_TESTING_GUIDE.md)                         | Guía de pruebas Yape                             | ✅ Activo |
| [FIREBASE_FUNCTIONS_REFACTOR.md](FIREBASE_FUNCTIONS_REFACTOR.md)       | Refactorización de Cloud Functions               | ✅ Activo |
| [WEBHOOK_IMPLEMENTATION_SUMMARY.md](WEBHOOK_IMPLEMENTATION_SUMMARY.md) | Implementación de webhooks                       | ✅ Activo |
| [WEBHOOK_LOCAL_TESTING.md](WEBHOOK_LOCAL_TESTING.md)                   | Testing local de webhooks                        | ✅ Activo |
| [VERIFICACION_SUSCRIPCIONES.md](VERIFICACION_SUSCRIPCIONES.md)         | Verificación de suscripciones                    | ✅ Activo |
| [BUSINESS_DOCUMENT_STRUCTURE.md](BUSINESS_DOCUMENT_STRUCTURE.md)       | Estructura de documentos de negocio en Firestore | ✅ Activo |
| [ARQUITECTURA_COHERENTE.md](ARQUITECTURA_COHERENTE.md)                 | Principios de arquitectura del proyecto          | ✅ Activo |

---

## Analytics y Performance

| Archivo                                                                        | Descripción                            | Estado    |
| ------------------------------------------------------------------------------ | -------------------------------------- | --------- |
| [analytics.md](analytics.md)                                                   | Sistema de analytics                   | ✅ Activo |
| [ANALYTICS_IMPLEMENTATION_MAP.md](ANALYTICS_IMPLEMENTATION_MAP.md)             | Mapa de implementación de analytics    | ✅ Activo |
| [STREAK_SYSTEM_IMPLEMENTATION.md](STREAK_SYSTEM_IMPLEMENTATION.md)             | Sistema de streak (días activos)       | ✅ Activo |
| [SHARE_IMAGE_SYSTEM.md](SHARE_IMAGE_SYSTEM.md)                                 | Sistema de compartir imágenes          | ✅ Activo |
| [SHARE_IMAGE_IMPLEMENTATION_SUMMARY.md](SHARE_IMAGE_IMPLEMENTATION_SUMMARY.md) | Resumen de implementación de compartir | ✅ Activo |
| [ONBOARDING_VISUAL_UPGRADE.md](ONBOARDING_VISUAL_UPGRADE.md)                   | Mejoras visuales del onboarding        | ✅ Activo |
| [DASHBOARD_IMPLEMENTADO.md](DASHBOARD_IMPLEMENTADO.md)                         | Dashboard implementado                 | ✅ Activo |

---

## Deprecated

> Los archivos obsoletos (funcionalidades eliminadas o reemplazadas) están en [`/docs/deprecated/`](deprecated/).

Contiene 27 archivos de:

- Correcciones de bugs resueltos
- Migraciones completadas
- Refactorizaciones documentadas como historial
- Versiones anteriores de funcionalidades redocumentadas

---

## Stores Sin Documentación Activa

> A continuación se listan elementos del código que existen pero **no tienen documentación en `/docs`**:

| Elemento              | Archivo                          | Razón                                                                     |
| --------------------- | -------------------------------- | ------------------------------------------------------------------------- |
| `cashClosureStore.js` | `src/stores/cashClosureStore.js` | Funcionalidad cubierta por `cashEventStore.js` — posible duplicado/legacy |
| `useSavingsStore.js`  | `src/stores/useSavingsStore.js`  | Sin uso en componentes — ver [SAVINGS_STORE.md](SAVINGS_STORE.md)         |
| Composables sin doc   | `src/composables/`               | 40+ composables — documentación en progreso                               |

---

_Generado en: Auditoría Wala — Marzo 2026_
