import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

export default function useCloseAudio() {
    const { playGlobalSound } = useAudio();

    const playClose = useCallback(() => {
        if (!playGlobalSound) return;

        // Randomize Pitch for Realism (0.95 to 1.05)
        const playbackRate = 0.95 + Math.random() * 0.1;
        const volume = 0.8;

        playGlobalSound("/assets/Close.mp3", { volume, playbackRate });
    }, [playGlobalSound]);

    return { playClose };
}
