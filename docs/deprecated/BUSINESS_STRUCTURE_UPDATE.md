>  DEPRECATED  Movido a `/docs/deprecated/` en Marzo 2026.
> Razón: Registro histórico puntual (corrección, migración o fix completado). La funcionalidad actual puede diferir.

---

# 🔄 Actualización de Estructura Business - Resumen de Cambios

**Fecha**: 2 de noviembre de 2025  
**Versión**: 2.0

## 📋 Resumen de Cambios

Se ha actualizado la estructura de datos de la colección `businesses` para seguir las mejores prácticas de Firestore y mejorar la escalabilidad del sistema.

---

## 🏗️ Nueva Estructura

### Path Base (sin cambios)

```
businesses/{businessId}
```

### Documento Principal - Campos Agregados

#### 🆕 Campo `contactInfo`

```javascript
contactInfo: {
  email: string,
  phone: string,
  address: {
    street: string,
    city: string,
    state: string,
    country: string,      // ISO code: 'CO', 'PE', 'MX', etc.
    zipCode: string
  },
  website: string,
  socialMedia: {
    facebook: string,
    instagram: string,
    twitter: string,
    linkedin: string
  }
}
```

#### ✨ Campos de Metadatos

```javascript
isActive: boolean,      // Estado activo/inactivo
deleted: boolean,       // Soft delete flag
updatedAt: timestamp,   // Última actualización
version: number         // Versión del schema (para migraciones)
```

### 🆕 Subcolección `settings/`

Reemplaza el campo `onboarding` del documento principal.

```
businesses/{businessId}/settings/{documentId}
```

#### 1. `settings/onboarding`

```javascript
{
  completedTours: {
    [uid]: ["dashboard-tour", "inventory-tour", ...]
  },
  tourStarts: [
    { tourId, userId, businessId, startedAt }
  ],
  lastTourCompleted: { tourId, userId, businessId, completedAt },
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

#### 2. `settings/config`

```javascript
{
  workingHours: {
    monday: { open, close, isOpen },
    // ... otros días
  },
  notifications: {
    email: boolean,
    push: boolean,
    lowStock: boolean,
    dailyReport: boolean
  },
  display: {
    theme: string,         // 'light', 'dark', 'auto'
    language: string,      // 'es', 'en', 'pt'
    dateFormat: string,
    currencyFormat: string
  },
  updatedAt: timestamp
}
```

#### 3. `settings/integrations`

```javascript
{
  payment: {
    stripe: { enabled, apiKey, webhookSecret },
    paypal: { enabled, clientId, clientSecret }
  },
  accounting: {
    quickbooks: { enabled, accessToken, refreshToken }
  },
  shipping: {
    fedex: { enabled, accountNumber }
  },
  updatedAt: timestamp
}
```

#### 4. `settings/customization`

```javascript
{
  branding: {
    logo: string (URL),
    favicon: string (URL),
    primaryColor: string (hex),
    secondaryColor: string (hex),
    accentColor: string (hex)
  },
  invoice: {
    template: string,      // 'modern', 'classic', 'minimal'
    footer: string,
    notes: string
  },
  receipt: {
    header: string,
    footer: string,
    showLogo: boolean
  },
  updatedAt: timestamp
}
```

---

## 📝 Archivos Modificados

### 1. `src/stores/businessStore.js`

- ✅ Agregado campo `contactInfo` en `createBusiness()`
- ✅ Agregados metadatos: `isActive`, `deleted`, `updatedAt`, `version`
- ✅ Creación automática de subcolección `settings/` con 4 documentos:
  - `onboarding`
  - `config`
  - `integrations`
  - `customization`

### 2. `src/composables/useBusiness.js`

- ✅ Cambiado `collection(db, "business")` → `collection(db, "businesses")`
- ✅ Cambiado `doc(db, 'business', id)` → `doc(db, 'businesses', id)`
- ✅ Agregado campo `contactInfo` en `createBusiness()`
- ✅ Creación de subcolección `settings/` al crear negocio

### 3. `src/composables/useOnboarding.js`

- ✅ Actualizado path de:

  ```javascript
  // ANTES
  doc(db, "business", businessId);

  // AHORA
  doc(db, "businesses", businessId, "settings", "onboarding");
  ```

- ✅ Eliminada navegación `data.onboarding?.` (acceso directo a campos)
- ✅ 4 funciones actualizadas:
  - `hasCompletedTour()`
  - `markTourCompleted()`
  - `trackTourStart()`
  - `getUserTourStats()`

### 4. Documentación

- ✅ `docs/BUSINESS_DOCUMENT_STRUCTURE.md` - Actualizado con `businesses/`
- ✅ `docs/SISTEMA_ONBOARDING.md` - Actualizado para reflejar subcolección `settings/`

---

## 🔑 Ventajas de la Nueva Estructura

### ✅ Escalabilidad

- Fácil agregar nuevas configuraciones en `settings/` sin modificar documento principal
- No hay límite de tamaño del documento principal

### ✅ Rendimiento

- Lecturas específicas: solo cargas los datos que necesitas
- Menor consumo de operaciones de lectura/escritura
- Mejor uso de caché de Firestore

### ✅ Seguridad

- Permisos granulares por subcolección
- Separación clara entre datos públicos y sensibles
- Configuraciones sensibles en `settings/integrations`

### ✅ Organización

- Código más limpio y mantenible
- Estructura lógica y predecible
- Fácil depuración y testing

### ✅ Costos

- Optimización de lecturas/escrituras
- Caché más eficiente
- Menor tráfico de red

---

## 🔄 Migración de Datos Existentes

Si tienes negocios con la estructura antigua, ejecuta este script:

```javascript
import {
  getDocs,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { db } from "@/firebaseInit";

async function migrateBusinessStructure() {
  console.log("🔄 Iniciando migración de estructura de negocios...");

  const businessesSnapshot = await getDocs(collection(db, "businesses"));
  let migrated = 0;

  for (const businessDoc of businessesSnapshot.docs) {
    const businessId = businessDoc.id;
    const businessData = businessDoc.data();

    console.log(`📦 Migrando negocio: ${businessId} - ${businessData.nombre}`);

    // 1. Agregar contactInfo si no existe
    if (!businessData.contactInfo) {
      await updateDoc(doc(db, "businesses", businessId), {
        contactInfo: {
          email: businessData.email || "",
          phone: businessData.telefono || "",
          address: {
            street: businessData.direccion || "",
            city: "",
            state: "",
            country: "PE",
            zipCode: "",
          },
          website: "",
          socialMedia: {},
        },
        isActive: businessData.activo !== false,
        deleted: false,
        updatedAt: new Date(),
        version: 2,
      });
    }

    // 2. Migrar onboarding a settings/onboarding si existe
    if (businessData.onboarding) {
      const onboardingRef = doc(
        db,
        "businesses",
        businessId,
        "settings",
        "onboarding"
      );
      const onboardingSnap = await getDoc(onboardingRef);

      if (!onboardingSnap.exists()) {
        await setDoc(onboardingRef, {
          ...businessData.onboarding,
          migratedAt: new Date().toISOString(),
        });

        // Eliminar campo del documento principal
        await updateDoc(doc(db, "businesses", businessId), {
          onboarding: deleteField(),
        });

        console.log(`  ✅ Onboarding migrado a settings/`);
      }
    }

    // 3. Crear settings/config si no existe
    const configRef = doc(db, "businesses", businessId, "settings", "config");
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      await setDoc(configRef, {
        workingHours: {
          monday: { open: "08:00", close: "18:00", isOpen: true },
          tuesday: { open: "08:00", close: "18:00", isOpen: true },
          wednesday: { open: "08:00", close: "18:00", isOpen: true },
          thursday: { open: "08:00", close: "18:00", isOpen: true },
          friday: { open: "08:00", close: "18:00", isOpen: true },
          saturday: { open: "09:00", close: "14:00", isOpen: true },
          sunday: { open: "00:00", close: "00:00", isOpen: false },
        },
        notifications: {
          email: true,
          push: true,
          lowStock: true,
          dailyReport: false,
        },
        display: {
          theme: "auto",
          language: "es",
          dateFormat: "DD/MM/YYYY",
          currencyFormat: "$1,000.00",
        },
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      console.log(`  ✅ Config creado en settings/`);
    }

    // 4. Crear settings/integrations si no existe
    const integrationsRef = doc(
      db,
      "businesses",
      businessId,
      "settings",
      "integrations"
    );
    const integrationsSnap = await getDoc(integrationsRef);

    if (!integrationsSnap.exists()) {
      await setDoc(integrationsRef, {
        payment: {},
        accounting: {},
        shipping: {},
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      console.log(`  ✅ Integrations creado en settings/`);
    }

    // 5. Crear settings/customization si no existe
    const customizationRef = doc(
      db,
      "businesses",
      businessId,
      "settings",
      "customization"
    );
    const customizationSnap = await getDoc(customizationRef);

    if (!customizationSnap.exists()) {
      await setDoc(customizationRef, {
        branding: {
          logo: "",
          favicon: "",
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
          accentColor: "#F59E0B",
        },
        invoice: {
          template: "modern",
          footer: "",
          notes: "",
        },
        receipt: {
          header: businessData.nombre || "Mi Negocio",
          footer: "Gracias por su compra",
          showLogo: false,
        },
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      console.log(`  ✅ Customization creado en settings/`);
    }

    migrated++;
    console.log(`✅ Negocio ${businessId} migrado exitosamente\n`);
  }

  console.log(`🎉 Migración completada: ${migrated} negocios procesados`);
}

// Ejecutar migración
// migrateBusinessStructure().catch(console.error);
```

---

## 🧪 Testing

Después de la migración, verifica:

1. ✅ Todos los tours de onboarding funcionan correctamente
2. ✅ La creación de nuevos negocios incluye `contactInfo` y `settings/`
3. ✅ Los negocios existentes tienen la estructura actualizada
4. ✅ No hay referencias a la estructura antigua en el código

---

## 📚 Referencias

- [BUSINESS_DOCUMENT_STRUCTURE.md](./BUSINESS_DOCUMENT_STRUCTURE.md) - Documentación completa
- [SISTEMA_ONBOARDING.md](./SISTEMA_ONBOARDING.md) - Sistema de tours
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**Mantenedor**: Equipo de Desarrollo Wala  
**Última actualización**: 2 de noviembre de 2025
