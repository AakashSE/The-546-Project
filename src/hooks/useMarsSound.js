"use client";
import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from "../context/AudioContext"; // Import Context

export default function useMarsSound(filePath) {
    const { playGlobalSound } = useAudio();

    const playSound = useCallback(() => {
        if (playGlobalSound) {
            playGlobalSound(filePath);
        }
    }, [playGlobalSound, filePath]);

    // Stop is tricky with "fire and forget" global sound. 
    // We'd need to return the SourceNode if we want to stop it. 
    // For SFX (clicks), stopping is rarely needed. 
    // If needed, we can expand playGlobalSound to return a canceller.
    const stopSound = useCallback(() => {
        // Placeholder implementation
        // Most SFX don't need manual stopping.
    }, []);

    return { playSound, stopSound };
}