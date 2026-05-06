# 📝 Instrucción de Cierre — Mantenimiento de Documentación

> **Uso:** Añadir esta instrucción al final de cada ticket/feature completado.
> **Responsable:** Agente IA o desarrollador que cierra el ticket.

---

## Checklist de Cierre de Documentación

Al finalizar cualquier **feature**, **bug fix** o **refactor**, ejecutar estos pasos:

### 1. Identificar docs afectados

```bash
# Buscar en /docs los archivos que mencionan los stores/composables/vistas modificados
grep -rl "nombreDelArchivoModificado" docs/
```

Archivos comunes por área:

| Área modificada | Carpeta de docs | Archivos clave |
|----------------|----------------|----------------|
| Stores Pinia | `docs/stores/` | `{STORE_NAME}_STORE.md` |
| Composables | Doc del módulo al que pertenece | Buscar en la carpeta correspondiente |
| Transacciones | `docs/transactions/` | `TRANSACTION_DELETION_INTEGRITY.md`, `SISTEMA_APERTURA_CIERRE_MODULAR.md` |
| Inventario | `docs/inventory/` | `SISTEMA_*.md` (stock, conteo, remoción) |
| Suscripciones | `docs/subscriptions/` | `SISTEMA_SUSCRIPCIONES_PREMIUM.md`, `WEBHOOK_*.md` |
| Firebase/Functions | `docs/firebase/` | `FIREBASE_FUNCTIONS_REFACTOR.md`, `analytics.md` |
| Módulo Juntos | `docs/juntos/` | `MODULO_JUNTOS_RESUMEN.md`, `CONSULTING_DOSSIER_STORE.md` |
| CRM Comercial | `docs/comercial/` | `SISTEMA_COMERCIAL_CRM.md` |
| Features indep. | `docs/features/` | Clientes, Streak, Share, Guiones, Adjuntos |
| UI / Componentes | `docs/ui/` | Animaciones, Loaders, Onboarding |
| Arquitectura | `docs/architecture/` | Multi-negocio, Firestore structure |

### 2. Actualizar documentación existente

Para cada doc afectado:

- [ ] Actualizar **API pública** si cambió (nuevos params, returns, exports)
- [ ] Actualizar **estructura Firestore** si cambió (nuevos campos, colecciones)
- [ ] Actualizar **tabla de features/planes** si cambió (nuevos límites, permisos)
- [ ] Agregar entrada de **changelog** al final del doc:

```markdown
## Changelog

### [Fecha - Descripción corta]
- Cambio 1
- Cambio 2
```

### 3. Crear documentación nueva si aplica

| Criterio | Acción |
|----------|--------|
| Nuevo store Pinia > 100 líneas | Crear `docs/{STORE_NAME}.md` |
| Nuevo composable crítico > 150 líneas | Documentar en doc del módulo |
| Nuevo módulo/sistema completo | Crear `docs/SISTEMA_{NOMBRE}.md` |
| Nueva colección Firestore | Documentar en `BUSINESS_DOCUMENT_STRUCTURE.md` o doc propio |

Plantilla mínima para docs nuevos:

```markdown
# Nombre del Módulo

**Última actualización:** [Fecha]
**Versión:** 1.0.0
**Estado:** ✅ Activo

## Descripción General
## Estructura Firestore (si aplica)
## API Pública
## Ejemplo de Uso
## Changelog
```

### 4. Verificar `docs/README.md`

- [ ] Si agregaste un doc nuevo → añadir fila en la tabla correspondiente del README
- [ ] Si moviste un doc a deprecated → actualizar sección Deprecated
- [ ] Si eliminaste un doc → remover de las tablas

### 5. Ubicación de archivos

| Tipo de doc | Ubicación correcta |
|-------------|-------------------|
| Docs activos y vigentes | `/docs/` |
| Docs obsoletos / históricos | `/docs/deprecated/` |
| Summaries de implementación one-off | `/docs/deprecated/` |
| README del proyecto | Raíz `/README.md` |

> ⚠️ **NUNCA** dejar archivos `.md` de implementación sueltos en la raíz del proyecto.

---

## Ejemplo de aplicación

### Ticket: "Agregar campo `shareLimit` a planes de suscripción"

1. **Docs afectados**: `SISTEMA_SUSCRIPCIONES_PREMIUM.md`
2. **Cambios necesarios**:
   - Agregar `shareLimit` a la tabla de features por plan
   - Actualizar los objetos de `getFeaturesForPlan()` en la sección de planes
   - Agregar entrada al changelog
3. **README**: No requiere cambio (doc ya existe)
4. **Resultado**: Doc actualizado, changelog con fecha

---

_Creado: Mayo 2026 — Auditoría de Documentación Wala_
