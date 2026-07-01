# Tareas - Clasificación de Socios y Corrección Conceptual de Acopio

- [x] Modificar `supplierStore.js` para incluir la propiedad `isPartner` en la creación de proveedores.
- [x] Modificar `AcopioWizard.vue` para marcar a los nuevos socios con `isPartner: true` y filtrar la búsqueda de socios en base a esto.
- [x] Crear el componente `CardSupplier.vue` con diseño minimalista y badges de estado.
- [x] Reemplazar el código inline de la tarjeta de proveedores en `SuppliersDashboard.vue` con `CardSupplier.vue`.
- [x] Modificar `SupplierDetails.vue` para mostrar el badge "Socio de Acopio" en la cabecera.
- [x] Modificar `StepAttachSupplier.vue` para renderizar el badge "Socio" en el autocompletado del flujo general de egresos.
- [x] Corregir el flujo de acopio para que no auto-liquide ni registre salida de caja/banco al registrar el egreso inicial (cambios en `paymentCalculator.js`, `accountsBalanceStore.js` y `transactionStore.js`).
- [x] Corregir la función en la nube `sharedComputed.js` del backend para que no sume los egresos con pagos vacíos (acopios) en `egresosCash` ni `egresosBank` de la base de datos Firestore.
- [x] Corregir el componente visual `CardStandard.vue` para que muestre `-S/ 0.00` (salida real) y `de S/ X.XX` (monto total) en transacciones de egreso pendientes.
- [x] Corregir el componente `ResumenDay.vue` para que calcule de forma correcta el total de salidas operacionales a crédito (retornando 0 si el pago está vacío).
- [x] Evitar la doble contabilidad (double counting) de abonos/pagos posteriores registrados el mismo día en `sharedComputed.js`, `accountsBalanceStore.js` y `ResumenDay.vue` distinguiendo el pago inicial de abonos posteriores mediante la fecha/hora.
- [x] Verificar el flujo completo y compilar para validar que todo funcione sin errores.
