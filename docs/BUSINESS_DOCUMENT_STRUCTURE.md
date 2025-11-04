# 📁 Estructura del Documento Business en Firestore

## 🏗️ Arquitectura Completa

### 📍 Path Base

```
businesses/{businessId}
```

---

## 📄 Documento Principal: `businesses/{businessId}`

### Campos del documento raíz:

```javascript
{
  // ===== INFORMACIÓN BÁSICA =====
  name: string,                    // Nombre del negocio
  ownerId: string,                 // UID del propietario (Firebase Auth)
  createdAt: timestamp,            // Fecha de creación
  updatedAt: timestamp,            // Última actualización

  // ===== INFORMACIÓN DE CONTACTO =====
  contactInfo: {
    email: string,                 // Email de contacto del negocio
    phone: string,                 // Teléfono (formato: +57 300 123 4567)
    address: {
      street: string,              // Calle y número
      city: string,                // Ciudad
      state: string,               // Departamento/Estado
      country: string,             // País (código ISO: "CO", "MX", etc.)
      zipCode: string              // Código postal
    },
    website: string,               // Sitio web (opcional)
    socialMedia: {
      facebook: string,            // URL perfil Facebook
      instagram: string,           // Usuario Instagram (@username)
      twitter: string,             // Usuario Twitter (@username)
      linkedin: string             // URL perfil LinkedIn
    }
  },

  // ===== CONFIGURACIÓN DE NEGOCIO =====
  businessType: string,            // Tipo: "retail", "service", "restaurant", etc.
  currency: string,                // Código ISO: "COP", "USD", "MXN", etc.
  timezone: string,                // Zona horaria: "America/Bogota"

  // ===== SUSCRIPCIÓN Y CARACTERÍSTICAS =====
  subscription: {
    plan: string,                  // "free", "basic", "premium", "enterprise"
    status: string,                // "active", "trial", "expired", "cancelled"
    startDate: timestamp,          // Inicio de la suscripción
    endDate: timestamp,            // Fecha de vencimiento
    renewalDate: timestamp,        // Próxima renovación
    paymentMethod: string          // "card", "bank_transfer", "cash", etc.
  },

  features: [                      // Array de características habilitadas
    "inventory",                   // Gestión de inventario
    "sales",                       // Punto de venta
    "expenses",                    // Gestión de gastos
    "reports",                     // Reportes avanzados
    "multi_user",                  // Múltiples usuarios
    "advanced_analytics"           // Analytics premium
  ],

  // ===== CONFIGURACIÓN OPERATIVA =====
  autoClosureEnabled: boolean,     // Cierre automático activado
  autoClosureTime: string,         // Hora del cierre (formato: "23:00")
  taxRate: number,                 // Tasa de impuesto (ej: 0.19 = 19%)

  // ===== USUARIOS Y ROLES =====
  members: {                       // Objeto con UIDs como keys
    [uid]: {
      role: string,                // "owner", "admin", "manager", "cashier"
      addedAt: timestamp,          // Cuándo fue agregado
      permissions: array           // ["sales", "inventory", "reports"]
    }
  },

  // ===== METADATOS =====
  isActive: boolean,               // Negocio activo/inactivo
  deleted: boolean,                // Soft delete flag
  deletedAt: timestamp,            // Fecha de eliminación (si aplica)
  version: number                  // Versión del schema (para migraciones)
}
```

---

## 📂 Subcolección: `settings/`

### Path: `businesses/{businessId}/settings/{documentId}`

Almacena todas las configuraciones del negocio de forma modular.

### 🎯 Documento: `settings/onboarding`

```javascript
{
  // ===== TOURS COMPLETADOS POR USUARIO =====
  completedTours: {
    [uid]: [                       // Array de IDs de tours completados
      "dashboard-tour",
      "inventory-tour",
      "sales-tour"
    ]
  },

  // ===== TRACKING DE INICIOS =====
  tourStarts: [                    // Array de objetos de tracking
    {
      tourId: string,              // ID del tour
      userId: string,              // UID del usuario
      businessId: string,          // ID del negocio
      startedAt: string            // ISO timestamp
    }
  ],

  // ===== METADATOS =====
  lastTourCompleted: {
    tourId: string,
    userId: string,
    businessId: string,
    completedAt: string            // ISO timestamp
  },

  createdAt: string,               // ISO timestamp
  updatedAt: string,               // ISO timestamp
  lastUpdated: string              // ISO timestamp (deprecated, usar updatedAt)
}
```

### 🔧 Documento: `settings/config`

```javascript
{
  // ===== CONFIGURACIONES GENERALES =====
  workingHours: {
    monday: { open: "08:00", close: "18:00", isOpen: true },
    tuesday: { open: "08:00", close: "18:00", isOpen: true },
    wednesday: { open: "08:00", close: "18:00", isOpen: true },
    thursday: { open: "08:00", close: "18:00", isOpen: true },
    friday: { open: "08:00", close: "18:00", isOpen: true },
    saturday: { open: "09:00", close: "14:00", isOpen: true },
    sunday: { open: "00:00", close: "00:00", isOpen: false }
  },

  notifications: {
    email: boolean,                // Notificaciones por email
    push: boolean,                 // Notificaciones push
    lowStock: boolean,             // Alertas de stock bajo
    dailyReport: boolean           // Reporte diario automático
  },

  display: {
    theme: string,                 // "light", "dark", "auto"
    language: string,              // "es", "en", "pt"
    dateFormat: string,            // "DD/MM/YYYY", "MM/DD/YYYY"
    currencyFormat: string         // "$1,000.00", "1.000,00 $"
  },

  updatedAt: timestamp
}
```

### 🔗 Documento: `settings/integrations`

```javascript
{
  // ===== INTEGRACIONES DE TERCEROS =====
  payment: {
    stripe: {
      enabled: boolean,
      apiKey: string,              // Encriptado
      webhookSecret: string        // Encriptado
    },
    paypal: {
      enabled: boolean,
      clientId: string,            // Encriptado
      clientSecret: string         // Encriptado
    }
  },

  accounting: {
    quickbooks: {
      enabled: boolean,
      accessToken: string,         // Encriptado
      refreshToken: string         // Encriptado
    }
  },

  shipping: {
    fedex: {
      enabled: boolean,
      accountNumber: string
    }
  },

  updatedAt: timestamp
}
```

### 🎨 Documento: `settings/customization`

```javascript
{
  // ===== PERSONALIZACIÓN DE INTERFAZ =====
  branding: {
    logo: string,                  // URL del logo
    favicon: string,               // URL del favicon
    primaryColor: string,          // Hex: "#3B82F6"
    secondaryColor: string,        // Hex: "#10B981"
    accentColor: string            // Hex: "#F59E0B"
  },

  invoice: {
    template: string,              // "modern", "classic", "minimal"
    footer: string,                // Texto personalizado del pie
    notes: string                  // Notas por defecto
  },

  receipt: {
    header: string,                // Encabezado del recibo
    footer: string,                // Pie del recibo
    showLogo: boolean              // Mostrar logo en recibo
  },

  updatedAt: timestamp
}
```

---

## 🔐 Reglas de Seguridad Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Función helper: verificar si el usuario es miembro
    function isMember(businessId) {
      return request.auth != null
        && get(/databases/$(database)/documents/businesses/$(businessId)).data.members[request.auth.uid] != null;
    }

    // Función helper: verificar si el usuario es owner
    function isOwner(businessId) {
      return request.auth != null
        && get(/databases/$(database)/documents/businesses/$(businessId)).data.ownerId == request.auth.uid;
    }

    // Documento principal de negocio
    match /businesses/{businessId} {
      // Lectura: solo miembros del negocio
      allow read: if isMember(businessId);

      // Escritura: solo owner puede modificar
      allow update, delete: if isOwner(businessId);

      // Creación: usuario autenticado puede crear su negocio
      allow create: if request.auth != null
        && request.resource.data.ownerId == request.auth.uid;

      // Subcolección settings
      match /settings/{documentId} {
        // Lectura: todos los miembros
        allow read: if isMember(businessId);

        // onboarding: cualquier miembro puede escribir
        allow write: if documentId == 'onboarding' && isMember(businessId);

        // config, integrations, customization: solo owner
        allow write: if documentId in ['config', 'integrations', 'customization']
          && isOwner(businessId);
      }
    }
  }
}
```

---

## 📊 Ejemplos de Uso

### Leer documento principal

```javascript
const businessRef = doc(db, "businesses", businessId);
const docSnap = await getDoc(businessRef);
const businessData = docSnap.data();
```

### Actualizar contactInfo

```javascript
const businessRef = doc(db, "businesses", businessId);
await updateDoc(businessRef, {
  "contactInfo.email": "nuevo@email.com",
  "contactInfo.phone": "+57 300 123 4567",
  updatedAt: serverTimestamp(),
});
```

### Leer configuración de onboarding

```javascript
const onboardingRef = doc(db, "businesses", businessId, "settings", "onboarding");
const onboardingSnap = await getDoc(onboardingRef);
const onboardingData = onboardingSnap.data();
```

### Actualizar configuración de notificaciones

```javascript
const configRef = doc(db, "businesses", businessId, "settings", "config");
await updateDoc(configRef, {
  "notifications.email": true,
  "notifications.lowStock": true,
  updatedAt: serverTimestamp(),
});
```

### Crear nuevo negocio con estructura completa

```javascript
const businessRef = doc(collection(db, "businesses"));
const businessId = businessRef.id;

// 1. Crear documento principal
await setDoc(businessRef, {
  name: "Mi Negocio",
  ownerId: authStore.user.uid,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  contactInfo: {
    email: "contacto@minegocio.com",
    phone: "+57 300 123 4567",
    address: {
      street: "Calle 123 #45-67",
      city: "Bogotá",
      state: "Cundinamarca",
      country: "CO",
      zipCode: "110111",
    },
    website: "",
    socialMedia: {},
  },
  businessType: "retail",
  currency: "COP",
  timezone: "America/Bogota",
  subscription: {
    plan: "free",
    status: "trial",
    startDate: serverTimestamp(),
  },
  features: ["inventory", "sales"],
  members: {
    [authStore.user.uid]: {
      role: "owner",
      addedAt: serverTimestamp(),
      permissions: ["all"],
    },
  },
  isActive: true,
  deleted: false,
  version: 1,
});

// 2. Crear settings/onboarding
const onboardingRef = doc(db, "businesses", businessId, "settings", "onboarding");
await setDoc(onboardingRef, {
  completedTours: {},
  tourStarts: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// 3. Crear settings/config
const configRef = doc(db, "businesses", businessId, "settings", "config");
await setDoc(configRef, {
  workingHours: {
    /* ... */
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
  updatedAt: serverTimestamp(),
});
```

---

## 🚀 Ventajas de esta Estructura

### ✅ **Escalabilidad**

- Fácil agregar nuevos documentos en `settings/` sin afectar el documento principal
- Permite crecimiento sin límites de tamaño de documento

### ✅ **Rendimiento**

- Lecturas específicas: no cargas todo el documento business innecesariamente
- Menor consumo de operaciones de lectura

### ✅ **Seguridad**

- Permisos granulares por subcolección
- Separación clara entre datos sensibles y públicos

### ✅ **Mantenibilidad**

- Código más limpio y organizado
- Fácil depuración y testing

### ✅ **Costos**

- Optimización de lecturas/escrituras
- Caché más eficiente

---

## 📝 Notas Importantes

1. **Consistencia de nombres**: Usar siempre `business` (singular), no `businesses`
2. **Timestamps**: Preferir `serverTimestamp()` sobre `new Date()` para evitar problemas de zona horaria
3. **Soft deletes**: Nunca eliminar documentos, usar flag `deleted: true`
4. **Validación**: Siempre validar existencia de documentos antes de leer/escribir
5. **Migraciones**: Usar campo `version` para gestionar cambios de schema

---

## 🔄 Migración desde Estructura Antigua

Si tienes datos en la estructura antigua (`businesses/{id}.onboarding`), ejecuta esta migración:

```javascript
// Script de migración
async function migrateOnboardingToSubcollection() {
  const businessesSnapshot = await getDocs(collection(db, "businesses"));

  for (const businessDoc of businessesSnapshot.docs) {
    const businessData = businessDoc.data();
    const onboardingData = businessData.onboarding;

    if (onboardingData) {
      // 1. Crear documento en settings/onboarding
      const onboardingRef = doc(
        db,
        "businesses",
        businessDoc.id,
        "settings",
        "onboarding"
      );
      await setDoc(onboardingRef, {
        ...onboardingData,
        migratedAt: new Date().toISOString(),
      });

      // 2. Eliminar campo del documento principal
      await updateDoc(doc(db, "businesses", businessDoc.id), {
        onboarding: deleteField(),
      });

      console.log(`✅ Migrado: ${businessDoc.id}`);
    }
  }

  console.log("🎉 Migración completada");
}
```

---

**Última actualización**: 2024-01-XX  
**Versión del schema**: 2.0  
**Mantenedor**: Equipo de Desarrollo Wala
