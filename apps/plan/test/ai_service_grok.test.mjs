import assert from 'assert';
import { refineBusinessText } from '../src/services/api/aiService.js';

console.log('--- Probando Servicio de IA Grok (aiService.js) ---');

// 1. Prueba de validación de contenido mínimo
console.log('1. Validación de contenido vacío:');
const emptyResult = await refineBusinessText({
  rawInput: '',
  consultantNotes: '',
  fieldKey: 'mision'
});
assert.strictEqual(emptyResult.error, 'INVALID_INPUT', 'Debe rechazar inputs completamente vacíos');
console.log('✅ Validación de entrada vacía correcta.');

// 2. Prueba de detección de modo offline
console.log('2. Validación de modo offline:');
const origDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, 'onLine');
Object.defineProperty(globalThis.navigator, 'onLine', { value: false, configurable: true });
const offlineResult = await refineBusinessText({
  rawInput: 'Vendo pasteles',
  fieldKey: 'mision'
});
assert.strictEqual(offlineResult.error, 'OFFLINE', 'Debe detectar inmediatamente modo offline');
console.log('✅ Detección offline correcta.');

// Restaurar navigator online
if (origDescriptor) {
  Object.defineProperty(globalThis.navigator, 'onLine', origDescriptor);
} else {
  Object.defineProperty(globalThis.navigator, 'onLine', { value: true, configurable: true });
}

// 3. Prueba de llamada con mock fetch para Grok API
console.log('3. Simulación de llamada exitosa a xAI Grok:');
const originalFetch = globalThis.fetch;
let capturedPayload = null;
let capturedHeaders = null;

globalThis.fetch = async (url, options) => {
  capturedPayload = JSON.parse(options.body);
  capturedHeaders = options.headers;
  return {
    ok: true,
    status: 200,
    json: async () => ({
      choices: [
        {
          message: {
            content: '**Misión:**\n\n"Ofrecer productos de pastelería artesanal de alta calidad con estándares de inocuidad."'
          }
        }
      ]
    })
  };
};

process.env.VITE_XAI_API_KEY = 'test-key-123';
process.env.VITE_XAI_MODEL = 'grok-4.20-non-reasoning';

const successResult = await refineBusinessText({
  rawInput: 'hago tortas ricas en mi casa',
  consultantNotes: 'enfocar en estándares sanitarios y pastelería fina',
  fieldKey: 'mision',
  businessName: 'Dulce Hogar',
  sector: 'Gastronomía',
  businessNature: 'produccion'
});

assert.strictEqual(successResult.success, true, 'Debe ser exitoso');
assert.strictEqual(successResult.provider, 'Grok', 'Proveedor debe ser Grok');
assert.strictEqual(successResult.model, 'grok-4.20-non-reasoning', 'Modelo debe coincidir');
// Debe limpiar encabezados residuales y comillas
assert.strictEqual(
  successResult.refinedText,
  'Ofrecer productos de pastelería artesanal de alta calidad con estándares de inocuidad.',
  'Debe haber limpiado encabezados "**Misión:**" y comillas envolventes'
);
assert.strictEqual(capturedHeaders['Authorization'], 'Bearer test-key-123', 'Header Bearer debe estar presente');
assert.strictEqual(capturedPayload.messages.length, 2, 'Debe enviar mensajes de system y user');
console.log('✅ Simulación y sanitización de respuesta de Grok correcta.');

// 4. Prueba de error de autenticación (401)
console.log('4. Manejo de error 401 de Grok:');
globalThis.fetch = async () => ({
  ok: false,
  status: 401,
  statusText: 'Unauthorized',
  json: async () => ({ error: { message: 'Invalid API Key' } })
});

const authErrorResult = await refineBusinessText({
  rawInput: 'texto de prueba',
  fieldKey: 'vision'
});
assert.strictEqual(authErrorResult.error, 'API_ERROR', 'Debe retornar error de API');
assert.ok(authErrorResult.message.includes('inválida o expirada'), 'Mensaje amigable en español');
console.log('✅ Control de error 401 verificado.');

// Restaurar entorno
globalThis.fetch = originalFetch;

console.log('\n🎉 ¡TODAS LAS PRUEBAS DE aiService (Grok) PASARON EXITOSAMENTE!');
