export async function generateScript(promptData) {
  const { system, context, user } = promptData;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('No se encontró la clave de API VITE_GEMINI_API_KEY en las variables de entorno.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: user
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: system + '\n\n---\n\n## RUTAS MAESTRAS (referencia):\n' + context
          }
        ]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 8000
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error en API de Gemini: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
    throw new Error('La API de Gemini no devolvió ningún candidato de respuesta válido.');
  }
  
  const raw = data.candidates[0].content.parts[0].text;

  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('El modelo Gemini no devolvió un JSON válido. Respuesta cruda: ' + raw);
  }
}

