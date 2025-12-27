import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

export default function useClickAudio() {
    const { playGlobalSound } = useAudio();

    const playClick = useCallback(() => {
        if (!playGlobalSound) return;

        // Randomize Pitch for Realism (0.98 to 1.02) - Very Subtle
        const playbackRate = 0.98 + Math.random() * 0.04;
        const volume = 0.6;

        playGlobalSound("/assets/Click.mp3", { volume, playbackRate });
    }, [playGlobalSound]);

    return { playClick };
}
