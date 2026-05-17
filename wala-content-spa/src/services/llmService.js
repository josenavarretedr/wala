export async function generateScript(promptData) {
  const { system, context, user } = promptData;
  const apiKey = import.meta.env.VITE_XAI_API_KEY;
  const model = import.meta.env.VITE_GROK_MODEL || 'grok-3-mini';

  if (!apiKey) {
    throw new Error('No se encontró la clave de API VITE_XAI_API_KEY en las variables de entorno.');
  }

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      response_format: { type: 'json_object' },  // fuerza JSON válido
      messages: [
        {
          role: 'system',
          content: system + '\n\n---\n\n## RUTAS MAESTRAS (referencia):\n' + context
        },
        {
          role: 'user',
          content: user
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error en API de xAI (Grok): ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('El modelo Grok no devolvió un JSON válido. Respuesta cruda: ' + raw);
  }
}
