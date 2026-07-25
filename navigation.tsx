
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { VoiceManager } from '../src/features/voice/VoiceManager';
import { LocationService } from '../src/features/navigation/LocationService';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

export default function NavigationScreen() {
    const [step, setStep] = useState<string>('Input'); // Input, Navigating
    const [destination, setDestination] = useState('');
    const [directions, setDirections] = useState<any>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const init = async () => {
            VoiceManager.speak('Navigation opened. Where would you like to go? Double tap the microphone button to speak.');
            await LocationService.requestPermissions();
        };
        init();
    }, []);

    const handleVoiceInput = async () => {
        setIsListening(true);
        // Wait for "Listening" to finish before recording to avoid audio bleed
        await VoiceManager.speakPromise("Listening...");
        try {
            const result = await VoiceManager.startListening();
            setIsListening(false);
            if (result) {
                // Filter out self-captured words if any still slip through
                const cleanResult = result.replace(/listening/gi, '').trim();

                if (cleanResult.length > 0) {
                    setDestination(cleanResult);
                    VoiceManager.speak(`I heard ${cleanResult}. Searching for directions.`);
                    setTimeout(() => {
                        startNavigation(cleanResult);
                    }, 1500);
                } else {
                    VoiceManager.speak("I didn't hear a destination. Please try again.");
                }
            } else {
                VoiceManager.speak("I didn't catch that. Please try again.");
            }
        } catch (e) {
            setIsListening(false);
            VoiceManager.speak("Error listening. Please use the text input.");
        }
    };

    const startNavigation = async (targetDest?: string) => {
        const target = targetDest || destination;
        if (!target) {
            VoiceManager.speak('Please enter a destination.');
            return;
        }

        setLoading(true);
        VoiceManager.speak(`Getting directions to ${target}...`);

        const currentLocation = await LocationService.getCurrentLocation();
        if (!currentLocation) {
            setLoading(false);
            return;
        }

        const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
        const result = await LocationService.getTurnByTurnDirections(origin, target);

        if (result && result.steps) {
            setDirections(result);
            setStep('Navigating');
            setCurrentStepIndex(0);

            // Speak summary + first step
            const summary = `Found route. ${result.distance.text}, ${result.duration.text}.`;
            const firstStep = result.steps[0].html_instructions;
            VoiceManager.speak(`${summary} Start: ${firstStep}`);
        } else {
            VoiceManager.speak('Could not find directions. Please try again.');
        }
        setLoading(false);
    };

    const handleNextStep = () => {
        if (!directions) return;
        if (currentStepIndex < directions.steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            const instruction = directions.steps[nextIndex].html_instructions;
            VoiceManager.speak(instruction);
        } else {
            VoiceManager.speak("You have arrived at your destination.");
        }
    };

    const handlePreviousStep = () => {
        if (!directions) return;
        if (currentStepIndex > 0) {
            const prevIndex = currentStepIndex - 1;
            setCurrentStepIndex(prevIndex);
            const instruction = directions.steps[prevIndex].html_instructions;
            VoiceManager.speak(instruction);
        } else {
            VoiceManager.speak("This is the start of the route.");
        }
    };

    const repeatInstruction = () => {
        if (directions && directions.steps[currentStepIndex]) {
            VoiceManager.speak(directions.steps[currentStepIndex].html_instructions);
        }
    };

    return (
        <View style={styles.container}>
            {step === 'Input' ? (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Where to?</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Starbucks"
                        placeholderTextColor="#64748B"
                        value={destination}
                        onChangeText={setDestination}
                        accessible={true}
                        accessibilityLabel="Destination Input"
                    />

                    <TouchableOpacity
                        style={styles.micButton}
                        onPress={handleVoiceInput}
                        accessible={true}
                        accessibilityLabel="Speak Destination"
                        accessibilityHint="Double tap to speak your destination"
                    >
                        {isListening ? (
                            <ActivityIndicator color="#F0F9FF" size="large" />
                        ) : (
                            <MaterialIcons name="mic" size={48} color="#F0F9FF" />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.micLabel}>{isListening ? 'Listening...' : 'Tap for Voice'}</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => startNavigation()}
                        accessible={true}
                        accessibilityLabel="Start Navigation"
                        accessibilityRole="button"
                    >
                        {loading ? <ActivityIndicator color="#1E293B" /> : <Text style={styles.btnText}>Start Walking</Text>}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.navContainer}>
                    <Text style={styles.navHeader} accessibilityRole="header">Step {currentStepIndex + 1} of {directions?.steps?.length}</Text>
                    <View style={styles.instructionBox}>
                        <Text style={styles.instructionText}>
                            {directions?.steps[currentStepIndex]?.html_instructions}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleNextStep}
                        accessible={true}
                        accessibilityLabel="Next Step"
                        accessibilityHint="Double tap for next instruction"
                    >
                        <Text style={styles.btnText}>Next Step</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <TouchableOpacity
                            style={[styles.smallButton, { backgroundColor: '#334155' }]}
                            onPress={handlePreviousStep}
                            accessible={true}
                            accessibilityLabel="Previous Step"
                        >
                            <Text style={styles.smallBtnText}>Previous</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.smallButton, { backgroundColor: '#3B82F6' }]}
                            onPress={repeatInstruction}
                            accessible={true}
                            accessibilityLabel="Repeat Instruction"
                        >
                            <Text style={styles.smallBtnText}>Repeat</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.stopButton, { marginTop: 30 }]}
                        onPress={() => {
                            setStep('Input');
                            setDirections(null);
                        }}
                        accessible={true}
                        accessibilityLabel="Stop Navigation"
                    >
                        <Text style={[styles.btnText, { color: '#F87171' }]}>Stop Navigation</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
    inputContainer: { flex: 1, justifyContent: 'center' },
    navContainer: { flex: 1, paddingTop: 40 },
    label: { color: '#F1F5F9', fontSize: 24, marginBottom: 16, fontWeight: 'bold', textAlign: 'center' },
    input: {
        backgroundColor: '#1E293B',
        color: '#F8FAFC',
        fontSize: 24,
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#475569',
        textAlign: 'center'
    },
    micButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F43F5E', // Rose 500
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
        shadowColor: "#F43F5E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8
    },
    micLabel: {
        color: '#94A3B8',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32
    },
    button: {
        backgroundColor: '#FBBF24', // Amber 400
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#FBBF24",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    stopButton: {
        backgroundColor: '#1E293B',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F87171' // Red border for stop
    },
    btnText: {
        color: '#0F172A', // Dark Slate Text
        fontSize: 22,
        fontWeight: 'bold'
    },
    navHeader: {
        color: '#FBBF24',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24
    },
    instructionBox: {
        backgroundColor: '#1E293B',
        padding: 32,
        borderRadius: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#334155',
        minHeight: 200,
        justifyContent: 'center'
    },
    instructionText: {
        color: '#F8FAFC',
        fontSize: 26,
        textAlign: 'center',
        lineHeight: 36
    },
    smallButton: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        flex: 0.48,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    smallBtnText: {
        color: '#F8FAFC',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
