interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
}

interface GeminiModelsResponse {
  models: GeminiModel[];
}

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY missing');
    return;
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = (await response.json()) as GeminiModelsResponse;
    const modelNames = data.models?.map((m: GeminiModel) => m.name.replace('models/', '')) || [];
    console.log('Available models:', modelNames);
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
