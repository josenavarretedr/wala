# 💳 Mercado Pago - Tarjetas de Prueba (Perú)

## Credenciales de Prueba

- **Public Key:** `TEST-d9db5058-7d42-47a5-a224-9a283c925466`
- **Access Token:** `TEST-6078108162612691-012223-23945092f601ffcbc51f95731a1da2d8-1105396361`

## Tarjetas de Crédito de Prueba

| Tarjeta          | Número              | CVV  | Vencimiento |
| ---------------- | ------------------- | ---- | ----------- |
| Mastercard       | 5031 7557 3453 0604 | 123  | 11/30       |
| Visa             | 4009 1753 3280 6176 | 123  | 11/30       |
| American Express | 3711 803032 57522   | 1234 | 11/30       |

## Simular Estados de Pago

Completa el **nombre del titular** con estos valores para simular diferentes respuestas:

| Nombre | Estado   | Descripción                      | Documento |
| ------ | -------- | -------------------------------- | --------- |
| APRO   | approved | Pago aprobado                    | 123456789 |
| OTHE   | rejected | Rechazado por error general      | 123456789 |
| CONT   | pending  | Pendiente de pago                | -         |
| CALL   | rejected | Rechazado - validación requerida | -         |
| FUND   | rejected | Fondos insuficientes             | -         |
| SECU   | rejected | CVV inválido                     | -         |
| EXPI   | rejected | Fecha de vencimiento inválida    | -         |
| FORM   | rejected | Error en formulario              | -         |

## Ejemplo de Uso

```javascript
// Para aprobar un pago de prueba:
cardholderName: "APRO";
identificationNumber: "123456789";
```

## Flujo de Prueba

1. Abre la página de Premium en el navegador
2. Selecciona un plan (Mensual, Anual o Lifetime)
3. Click en "Continuar al Pago"
4. En el formulario de Mercado Pago:
   - **Tarjeta:** Usa cualquiera de las tarjetas de arriba
   - **Nombre del titular:** `APRO` (para aprobar) u otro estado
   - **Documento:** `123456789` (para APRO y OTHE)
   - **CVV:** El correspondiente a la tarjeta
   - **Vencimiento:** 11/30
5. Verifica el console.log en el backend
6. Verifica el modal de éxito en el frontend
7. Verifica la actualización en Firestore

## Referencias

- [Documentación oficial Mercado Pago](https://www.mercadopago.com.pe/developers/es/docs/checkout-bricks/payment-brick/test-cards)
