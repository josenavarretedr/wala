/* eslint-disable */


async function callGrok({ apiKey, model, prompt }) {
  const { OpenAI } = require("openai");

  // DEBUG: Verificar la API key recibida
  console.log(`🔍 callGrok recibió API key - Longitud: ${apiKey ? apiKey.length : 0}, Primeros 15: ${apiKey ? apiKey.substring(0, 15) : 'undefined'}, Últimos 10: ${apiKey ? apiKey.substring(apiKey.length - 10) : 'undefined'}`);

  // Inicializa el cliente de OpenAI con la base URL de xAI

  const client = new OpenAI({
    apiKey: apiKey, // Usa variables de entorno
    baseURL: "https://api.x.ai/v1", // Endpoint de xAI
  });


  const response = await client.chat.completions.create({
    model,
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  const content = response.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(content); // Intenta parsear la respuesta como JSON
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
    return { error: "La respuesta no es un JSON válido", content };
  }
}

module.exports = { callGrok };
