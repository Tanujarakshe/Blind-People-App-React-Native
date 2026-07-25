import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { VoiceManager } from '../src/features/voice/VoiceManager';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';

export default function Layout() {
    const [loaded] = useFonts({
        // Load custom accessible fonts if needed
    });

    useEffect(() => {
        // Announce app start
        try {
            VoiceManager.speak('Welcome to VisionMate. Swipe right to open menu.');
        } catch (e) {
            console.error("Voice output failed on startup", e);
        }
    }, []);

    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#FFF',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 24 },
            contentStyle: { backgroundColor: '#000' }
        }}>
            <Stack.Screen name="index" options={{ title: 'VisionMate Home', headerShown: false }} />
            <Stack.Screen name="vision" options={{ title: 'Vision Mode' }} />
            <Stack.Screen name="barcode" options={{ title: 'Scanner' }} />
            <Stack.Screen name="navigation" options={{ title: 'Navigation' }} />
        </Stack>
    );
}
