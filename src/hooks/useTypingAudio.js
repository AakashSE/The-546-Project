import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

export default function useTypingAudio() {
    const { playGlobalSound } = useAudio();

    const playType = useCallback((e) => {
        if (!playGlobalSound) return;

        // If an event is passed, check for empty value + non-entry keys
        if (e && e.target) {
            const value = e.target.value;
            const key = e.key;

            // List of keys to stay silent on if the input is empty
            const silentIfEmpty = [
                "Backspace", "Delete",
                "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
                "Home", "End", "PageUp", "PageDown",
                "Shift", "Control", "Alt", "CapsLock", "Escape", "Tab"
            ];

            if (value === "" && silentIfEmpty.includes(key)) {
                return;
            }
        }

        // Randomize Pitch for Realism (0.9 to 1.1)
        const playbackRate = 0.9 + Math.random() * 0.2;
        // Add slight Gain variation
        const volume = 0.5 + Math.random() * 0.2;

        playGlobalSound("/assets/Typing.mp3", { volume, playbackRate });
    }, [playGlobalSound]);

    return { playType };
}
