# 📊 Sistema Comercial (CRM) — Documentación

**Última actualización:** 6 de mayo de 2026
**Versión:** 1.0.0
**Estado:** ✅ Activo

---

## 📋 Descripción General

Módulo CRM para gestión comercial de leads, pipeline de ventas y KPIs semanales. Opera sobre una **colección top-level `comercial`** en Firestore sin dependencias de `businesses/` ni `users/`.

### Arquitectura

```
┌─────────────────────────┐
│      Firestore          │
│  comercial/settings     │ → Configuración global (zonas, metas, campañas)
│  comercial/{recordId}   │ → Registros operativos (leads, visitas, cierres)
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│    useComercial.js       │ → Composable: CRUD directo a Firestore + KPIs
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│    commerceStore.js      │ → Store Pinia: estado reactivo + filtros + getters
└───────────┬─────────────┘
            ↓
┌──────────────────────────────────────────┐
│ AdminCommercialDashboard / PipelineLeads │ → Vistas
│ QuickEntryModal / CommercialKPIs         │
└──────────────────────────────────────────┘
```

### Componentes del Sistema

| Archivo | Tipo | Ubicación |
|---------|------|-----------|
| `useComercial.js` | Composable | `src/composables/useComercial.js` |
| `commerceStore.js` | Store Pinia (Composition API) | `src/stores/commerceStore.js` |
| `commerceConstants.js` | Constantes | `src/constants/commerceConstants.js` |

---

## 💾 Estructura Firestore

### `comercial/settings`

```javascript
{
  docType: 'settings',
  activeZones: ['Lima Norte', 'Lima Sur', ...],
  activeSectors: ['Retail', 'Servicios', ...],
  metasSemanales: {
    visitasTarget: 30,
    tasaAgendamientoMin: 40,
    cierresTarget: 5,
    cajaTarget: 2000
  },
  whatsappTemplates: {
    pitch: "Hola [Nombre], soy de Wala...",
    seguimiento48h: "...",
    cierre: "..."
  },
  campanas: [],
  cohortes: [],
  updatedAt: Timestamp
}
```

### `comercial/{recordId}`

```javascript
{
  docType: 'record',
  eventType: 'visita' | 'diagnostico' | 'cierre' | 'seguimiento',
  statusPipeline: 'tarjeta_entregada' | 'agendado' | 'diagnosticado' | 'en_seguimiento' | 'cerrado_advisory' | 'cerrado_wala' | 'descartado',
  businessName: 'Mi Negocio',
  contactName: 'Juan Pérez',
  contactPhone: '+51999888777',
  zona: 'Lima Norte',
  sector: 'Retail',
  resultado: 'agendado' | 'no_interesado' | ...,
  monto: 225,
  fechaEvento: Timestamp,
  notas: '...',
  // Opcionales
  fechaAgendada: Timestamp | null,
  tipoCierre: 'advisory' | 'wala' | null,
  tipoSeguimiento: string | null,
  areasCriticas: ['Finanzas', 'Marketing'],
  mensajeWhatsapp: '...',
  cohorte: string | null,
  campana: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🧩 API del Composable `useComercial.js`

### Settings

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `fetchSettings()` | — | `Promise<Object>` | Carga config o retorna defaults |
| `saveSettings(data)` | `Object` | `Promise<void>` | Merge en `comercial/settings` |

### Records (CRUD)

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `fetchRecords(filters?)` | `{ statusPipeline?, zona?, cohorte? }` | `Promise<Object[]>` | Records filtrados, orden desc por fecha |
| `createRecord(data)` | `Object` | `Promise<string>` recordId | Crea nuevo record |
| `updateRecord(recordId, data)` | `string, Object` | `Promise<void>` | Update parcial |
| `deleteRecord(recordId)` | `string` | `Promise<void>` | Eliminación hard |

### KPIs y Utilidades

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getKPIsWeekly(records, metas)` | `Object[], Object` | `Object` KPIs | Cálculo client-side de la semana lunes→ahora |
| `buildWhatsappMessage(record, templates)` | `Object, Object` | `string` | Genera mensaje WhatsApp según eventType |

### KPIs retornados por `getKPIsWeekly()`

```javascript
{
  visitasTotal, agendados, tasaAgendamiento,
  diagnosticosTotal,
  cierresAdvisory, cierresWala, totalCierres, tasaCierre,
  cajaAdvisory, cajaWala, cajaTotal,  // Advisory=225, Wala=49
  alertas: ['⚠️ ...']
}
```

---

## 🏪 API del Store `commerceStore.js`

**Store ID:** `commerce`
**Tipo:** Pinia Store (Composition API)

### State

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `settings` | `Object \| null` | Config desde `comercial/settings` |
| `records` | `Object[]` | Registros operativos |
| `loading` | `boolean` | Flag de carga |
| `error` | `string \| null` | Último error |
| `filters` | `Object` | Filtros activos client-side |

### Getters

| Getter | Tipo | Descripción |
|--------|------|-------------|
| `disponibleZones` | `string[]` | Zonas activas |
| `disponibleSectors` | `string[]` | Sectores activos |
| `metasSemanales` | `Object` | Metas de la semana |
| `whatsappTemplates` | `Object` | Templates de WhatsApp |
| `campanas` | `Object[]` | Campañas activas |
| `cohortes` | `Object[]` | Cohortes activas |
| `filteredRecords` | `Object[]` | Records con filtros client-side aplicados |
| `recordsByStatus` | `Object` | Records agrupados por statusPipeline (Kanban) |
| `kpisWeekly` | `Object` | KPIs de la semana calculados sobre todos los records |
| `alertas` | `string[]` | Alertas derivadas de KPIs |

### Actions

| Action | Parámetros | Descripción |
|--------|------------|-------------|
| `initialize()` | — | Carga settings + records en paralelo |
| `fetchSettings()` | — | Solo settings |
| `updateSettings(data)` | `Object` | Merge settings |
| `fetchRecords(filters?)` | `Object` | Con filtros Firestore |
| `addRecord(data)` | `Object` | Crea y recarga |
| `editRecord(recordId, data)` | `string, Object` | Update optimista |
| `setRecordStatus(recordId, status)` | `string, string` | Shortcut para mover en pipeline |
| `removeRecord(recordId)` | `string` | Elimina y filtra local |
| `setFilters(filters)` | `Object` | Merge filtros |
| `clearFilters()` | — | Reset filtros |

---

## Pipeline Kanban — Columnas

| Status | Etiqueta UI |
|--------|-------------|
| `tarjeta_entregada` | Tarjeta Entregada |
| `agendado` | Agendado |
| `diagnosticado` | Diagnosticado |
| `en_seguimiento` | En Seguimiento |
| `cerrado_advisory` | Cerrado (Advisory) |
| `cerrado_wala` | Cerrado (Wala) |
| `descartado` | Descartado |

---

## Changelog

### [v1.0.0 - Mayo 2026]
- Creación inicial del documento basado en auditoría de código fuente.
- Documentados: `useComercial.js`, `commerceStore.js`, estructura Firestore.
