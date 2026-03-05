# `clientStore.js` — Documentación del Store de Clientes

**Archivo:** `src/stores/clientStore.js`
**Store ID:** `clientStore`
**Tipo:** Pinia Store (Composition API)
**Módulo:** Clientes

---

## Descripción General

El `useClientStore` gestiona la lista de clientes del negocio activo. Implementa:

- Carga y caché local de clientes desde Firestore
- Cliente anónimo para transacciones sin cliente identificado
- Selección/deselección de cliente activo
- Búsqueda local y metadata de clientes

**Nota:** La lógica de operaciones CRUD del cliente la maneja el composable `useClients` — el store es la capa de estado reactivo.

---

## State

| Propiedad        | Tipo                | Descripción                           |
| ---------------- | ------------------- | ------------------------------------- |
| `clients`        | `Ref<Array>`        | Lista de clientes activos del negocio |
| `loading`        | `Ref<Boolean>`      | Indicador de carga                    |
| `error`          | `Ref<String\|null>` | Último error                          |
| `selectedClient` | `Ref<Object\|null>` | Cliente actualmente seleccionado      |

---

## Getters

| Getter            | Retorna             | Descripción                              |
| ----------------- | ------------------- | ---------------------------------------- |
| `activeClients`   | `Array`             | Clientes con `isActive === true`         |
| `anonymousClient` | `Object\|undefined` | Cliente con `id === ANONYMOUS_CLIENT_ID` |

---

## Actions

### `initializeAnonymousClient()`

**Descripción:** Inicializa o crea el cliente anónimo en Firestore si no existe.

### `fetchClients()`

**Descripción:** Carga todos los clientes activos del negocio activo desde Firestore. Actualiza `clients`.

### `createClient(clientData)`

**Descripción:** Crea un nuevo cliente en Firestore y lo agrega al state local.
**Parámetros:** `clientData` — Object con `name`, `phone`, etc.

### `updateClient(clientId, updatedData)`

**Descripción:** Actualiza datos de un cliente en Firestore y en el state local.

### `searchClients(query)`

**Descripción:** Búsqueda local de clientes por nombre/término.
**Parámetros:** `query` — String de búsqueda.
**Retorna:** Array de clientes coincidentes.

### `updateClientMetadata(clientId)`

**Descripción:** Actualiza metadata del cliente (última transacción, total gastado).

### `selectClient(client)`

**Descripción:** Establece `selectedClient` con el cliente proporcionado.

### `clearSelectedClient()`

**Descripción:** Limpia `selectedClient`.

### `deactivateClient(clientId)`

**Descripción:** Soft-delete del cliente (marca `isActive: false`).

### `cleanup()`

**Descripción:** Limpia el state del store (clientes y selección).

---

## Uso en Componentes

- `StepAttachClient.vue` — usa el store directamente para selección de cliente en transacciones

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Store verificado como activo en producción.
