import { useLocalSearchParams } from 'expo-router';
import { VisionCamera } from '../src/features/vision/VisionCamera';

export default function VisionScreen() {
    const { mode } = useLocalSearchParams<{ mode: 'TEXT' | 'LABEL' | 'FACE' }>();
    return <VisionCamera initialMode={mode || 'TEXT'} />;
}
