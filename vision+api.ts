
import { ExpoResponse } from 'expo-router/server';

const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, features } = body;

    if (!imageBase64) {
      return Response.json({ error: 'Missing imageBase64' }, { status: 400 });
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }

    const response = await fetch(`${GOOGLE_VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageBase64,
            },
            features: features || [{ type: 'TEXT_DETECTION' }, { type: 'LABEL_DETECTION' }, { type: 'OBJECT_LOCALIZATION' }, { type: 'FACE_DETECTION' }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Vision API Error:', data);
      return Response.json({ error: data.error?.message || 'Google Vision API request failed' }, { status: response.status });
    }

    return Response.json(data);

  } catch (error) {
    console.error('Vision API Handler Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
