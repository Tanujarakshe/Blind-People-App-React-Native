import { ExpoResponse } from 'expo-router/server'; // Keep import if needed for type, but use Response.json for runtime safety

const GOOGLE_SPEECH_API_URL = 'https://speech.googleapis.com/v1/speech:recognize';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { audioBase64, encoding } = body;

        if (!audioBase64) {
            return Response.json({ error: 'Missing audioBase64' }, { status: 400 });
        }

        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

        if (!apiKey) {
            return Response.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
        }

        const response = await fetch(`${GOOGLE_SPEECH_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                config: {
                    encoding: encoding || 'LINEAR16', // Default to LINEAR16 if not provided
                    sampleRateHertz: 16000,
                    languageCode: 'en-US',
                },
                audio: {
                    content: audioBase64,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Google Speech API Error:', JSON.stringify(data, null, 2));
            return Response.json({ error: data.error?.message || 'Google Speech API request failed' }, { status: response.status });
        }

        return Response.json(data);

    } catch (error) {
        console.error('Speech API Handler Error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
