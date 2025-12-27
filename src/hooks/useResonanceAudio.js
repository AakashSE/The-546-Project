import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

/**
 * useResonanceAudio
 * Centralized High-Performance Audio Engine for tactile UI feedback.
 * Uses Web Audio API for zero-latency playback and pitch randomization.
 */
export default function useResonanceAudio() {
    const { playGlobalSound } = useAudio();

    const assets = {
        tick: null,
        resonance: "/assets/TargetSound.mp3",
        click: "/assets/ColourClick.mp3",
        hiss: "/assets/Docking.mp3"
    };

    const playResonance = useCallback((type = "tick", volume = 0.5, randomizePitch = true) => {
        if (!playGlobalSound) return;

        const url = assets[type];
        if (!url) return;

        // Subtle pitch variance for natural tactile feel
        const playbackRate = randomizePitch ? (0.95 + Math.random() * 0.1) : 1.0;

        playGlobalSound(url, { volume, playbackRate });
    }, [playGlobalSound]);

    return { playResonance };
}
