# 📊 Instrucciones de Configuración de Firestore para Sistema de Clasificación IA

## 🔧 ÍNDICES COMPUESTOS NECESARIOS

**IMPORTANTE:** Crear estos índices en Firebase Console antes de desplegar las Cloud Functions.

### 1. Índice para productos sin clasificar

```
Collection: businesses/{businessId}/products
Fields:
  - needsReview (Ascending)
  - createdAt (Descending)
```

### 2. Índice para productos por fuente de clasificación

```
Collection: businesses/{businessId}/products
Fields:
  - classification.source (Ascending)
  - createdAt (Descending)
```

### 3. Índice para productos por industria y confianza

```
Collection: businesses/{businessId}/products
Fields:
  - classification.confidence (Ascending)
  - createdAt (Descending)
```

---

## 📁 ESTRUCTURA DE COLECCIONES A CREAR

### 1. Colección Global de Taxonomías

**Crear manualmente en Firestore Console:**

```
wala_global/
  └── taxonomies/
      └── ferreteria (documento)
      └── reposteria (documento)
      └── libreria (documento)
      └── otro (documento)
```

**Estructura inicial de cada documento (ejemplo ferreteria):**

```javascript
{
  industry: "ferreteria",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  version: "1.0",
  rules: [],  // Se llenará con generateInitialTaxonomies
  brands: [], // Se llenará con generateInitialTaxonomies
  categories: {}, // Se llenará con generateInitialTaxonomies
  stats: {
    totalProducts: 0,
    totalBusinesses: 0,
    avgConfidence: 0,
    lastTrainingAt: null
  }
}
```

### 2. Colección de Caché de Clasificaciones

**Crear en Firestore Console:**

```
wala_global/
  └── classifications_cache/ (colección)
```

**Configurar TTL (Time To Live):**

- En Firebase Console → Firestore → TTL Policies
- Colección: `wala_global/classifications_cache`
- Campo: `expiresAt`
- Duración: 30 días

### 3. Colección de Métricas

**Crear en Firestore Console:**

```
wala_global/
  └── metrics/ (colección)
```

---

## 🔐 REGLAS DE SEGURIDAD DE FIRESTORE

**Agregar estas reglas en Firebase Console → Firestore → Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Reglas existentes...

    // 🆕 Taxonomías globales (solo lectura para usuarios, escritura para Cloud Functions)
    match /wala_global/taxonomies/{industry} {
      allow read: if request.auth != null;
      allow write: if false; // Solo Cloud Functions pueden escribir
    }

    // 🆕 Caché de clasificaciones (solo lectura para usuarios)
    match /wala_global/classifications_cache/{cacheKey} {
      allow read: if request.auth != null;
      allow write: if false; // Solo Cloud Functions pueden escribir
    }

    // 🆕 Métricas (solo lectura para admins)
    match /wala_global/metrics/{date} {
      allow read: if request.auth != null; // Ajustar según necesites
      allow write: if false; // Solo Cloud Functions pueden escribir
    }

    // 🆕 Productos con clasificación
    match /businesses/{businessId}/products/{productId} {
      allow read: if request.auth != null &&
                     (resource.data.owner == request.auth.uid ||
                      request.auth.uid in resource.data.collaborators);
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                       (resource.data.owner == request.auth.uid ||
                        request.auth.uid in resource.data.collaborators);
      allow delete: if request.auth != null && resource.data.owner == request.auth.uid;
    }

    // 🆕 Taxonomías personalizadas por negocio
    match /businesses/{businessId}/customTaxonomies/{ruleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      (get(/databases/$(database)/documents/businesses/$(businessId)).data.owner == request.auth.uid);
    }
  }
}
```

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [ ] Crear índices compuestos (3 índices)
- [ ] Crear colección `wala_global/taxonomies/`
- [ ] Crear documentos iniciales: ferreteria, reposteria, libreria, otro
- [ ] Crear colección `wala_global/classifications_cache/`
- [ ] Configurar TTL en classifications_cache (30 días)
- [ ] Crear colección `wala_global/metrics/`
- [ ] Actualizar reglas de seguridad de Firestore
- [ ] Verificar permisos de Cloud Functions para escribir en wala_global

---

## 🚀 SIGUIENTE PASO

Después de completar esta configuración manual en Firebase Console:

1. Ejecutar script `initTaxonomies.js` para generar taxonomías base
2. Desplegar Cloud Functions
3. Verificar que todo funcione correctamente
