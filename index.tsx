import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { VoiceManager } from '../src/features/voice/VoiceManager';
import { MaterialIcons } from '@expo/vector-icons';
// Note: LinearGradient Not installed, simulating with View

const { width } = Dimensions.get('window');
// 2 columns, spacing of 16px
const CARD_SPACING = 16;
const CARD_WIDTH = (width - (CARD_SPACING * 3)) / 2;

export default function HomeScreen() {
    const router = useRouter();
    const [greeting, setGreeting] = useState('Welcome');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const features = [
        { id: '1', title: 'Read Text', route: '/vision/read', hint: 'Read printed text', icon: 'menu-book', color: '#60A5FA' }, // Blue
        { id: '2', title: 'Describe', route: '/vision/describe', hint: 'Describe objects', icon: 'image-search', color: '#A78BFA' }, // Purple
        { id: '7', title: 'Currency', route: '/vision/currency', hint: 'Identify money', icon: 'attach-money', color: '#10B981' }, // Emerald
        { id: '6', title: 'Faces', route: '/vision/face', hint: 'Detect people', icon: 'face', color: '#F472B6' }, // Pink
        { id: '5', title: 'Products', route: '/barcode', hint: 'Scan barcode', icon: 'qr-code-scanner', color: '#34D399' }, // Green
        { id: '3', title: 'Navigate', route: '/navigation', hint: 'Walking directions', icon: 'directions-walk', color: '#FBBF24' }, // Amber
    ];

    const handlePress = (feature: any) => {
        VoiceManager.speak(`Opening ${feature.title}`);
        if (feature.id === '1') {
            router.push('/vision?mode=TEXT');
        } else if (feature.id === '2') {
            router.push('/vision?mode=LABEL');
        } else if (feature.id === '7') {
            router.push('/vision?mode=CURRENCY');
        } else if (feature.id === '6') {
            router.push('/vision?mode=FACE');
        } else if (feature.id === '5') {
            router.push('/barcode');
        } else if (feature.id === '3') {
            router.push('/navigation');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.dateText}>{new Date().toDateString()}</Text>
                    <Text style={styles.greetingText}>{greeting}, User</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn} accessibilityLabel="Profile">
                    <MaterialIcons name="person" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Main Grid content */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {features.map((feature) => (
                        <TouchableOpacity
                            key={feature.id}
                            style={styles.card}
                            activeOpacity={0.7}
                            onPress={() => handlePress(feature)}
                            accessible={true}
                            accessibilityLabel={feature.title}
                            accessibilityHint={feature.hint}
                        >
                            {/* Icon Circle */}
                            <View style={[styles.iconCircle, { backgroundColor: `${feature.color}20` }]}>
                                <MaterialIcons name={feature.icon as any} size={32} color={feature.color} />
                            </View>

                            {/* Text Content */}
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{feature.title}</Text>
                                <Text style={styles.cardHint} numberOfLines={1}>{feature.hint}</Text>
                            </View>

                            {/* Toggle Switch Simulation (Visual only, to match ref image style) */}
                            <View style={styles.toggleSimulation}>
                                <View style={[styles.toggleKnob, { backgroundColor: feature.color }]} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Slate 900
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    dateText: {
        color: '#94A3B8', // Slate 400
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    greetingText: {
        color: '#F8FAFC', // Slate 50
        fontSize: 28,
        fontWeight: 'bold',
    },
    profileBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1E293B', // Slate 800
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    scrollContent: {
        paddingHorizontal: CARD_SPACING,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.3, // Vertical Card
        backgroundColor: '#1E293B', // Slate 800
        borderRadius: 24,
        padding: 16,
        marginBottom: CARD_SPACING,
        justifyContent: 'space-between',
        // Smooth shadowing
        borderWidth: 1,
        borderColor: '#334155', // Slate 700 (Subtle border)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: '#F8FAFC',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardHint: {
        color: '#94A3B8',
        fontSize: 12,
    },
    toggleSimulation: {
        width: 40,
        height: 20,
        backgroundColor: '#334155',
        borderRadius: 10,
        alignSelf: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleKnob: {
        width: 16,
        height: 16,
        borderRadius: 8,
        alignSelf: 'flex-end' // "On" state
    }
});
