"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const AudioContext = createContext();

export function AudioProvider({ children }) {
    // Default to sound ON, or load from storage
    const [isMuted, setIsMuted] = useState(false);
    const [isAmbienceAllowed, setAmbienceAllowed] = useState(false); // RESTORED STATE
    const audioCtxRef = React.useRef(null);
    const soundBank = React.useRef(new Map()); // Cache for decoded buffers
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const storedMute = localStorage.getItem("mars_audio_muted");
        if (storedMute) {
            setIsMuted(JSON.parse(storedMute));
        }

        // Allow Ambience if visitor has already entered the site (Preloader bypassed)
        if (typeof window !== 'undefined' && sessionStorage.getItem('mars_visited')) {
            setAmbienceAllowed(true);
        }

        // Init Audio Context
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
            audioCtxRef.current = new Ctx();
            setIsReady(true);
        }

        // Cleanup
        return () => {
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    const toggleMute = () => {
        setIsMuted((prev) => {
            const newState = !prev;
            localStorage.setItem("mars_audio_muted", JSON.stringify(newState));

            // Suspend/Resume context based on mute?
            // Actually better to just block playback logic, keep context running for latency.
            if (audioCtxRef.current) {
                if (newState) audioCtxRef.current.suspend();
                else audioCtxRef.current.resume();
            }
            return newState;
        });
    };

    const loadSound = async (url) => {
        if (!audioCtxRef.current) return null;
        if (soundBank.current.has(url)) return soundBank.current.get(url);

        try {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
            soundBank.current.set(url, audioBuffer);
            return audioBuffer;
        } catch (e) {
            console.error("Audio Load Error:", url, e);
            return null;
        }
    };

    const playGlobalSound = React.useCallback(async (filePath, options = {}) => {
        if (isMuted || !audioCtxRef.current) return;

        // Auto-resume if suspended (Autoplay policy)
        if (audioCtxRef.current.state === 'suspended') {
            try { await audioCtxRef.current.resume(); } catch (e) { }
        }

        const defaults = { volume: 0.5, playbackRate: 1.0, loop: false };
        const settings = { ...defaults, ...options };

        let buffer = soundBank.current.get(filePath);
        if (!buffer) {
            buffer = await loadSound(filePath);
        }

        if (buffer) {
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.loop = settings.loop;
            source.playbackRate.value = settings.playbackRate;

            // Create Gain Node for volume control per sound
            const gainNode = audioCtxRef.current.createGain();
            gainNode.gain.value = settings.volume;

            source.connect(gainNode);
            gainNode.connect(audioCtxRef.current.destination);

            source.start(0);
        }
    }, [isMuted]);

    // Preload Logic (Optional)
    const preloadSounds = (urls) => {
        urls.forEach(url => loadSound(url));
    };

    return (
        <AudioContext.Provider value={{
            isMuted,
            toggleMute,
            playGlobalSound,
            preloadSounds,
            audioContext: audioCtxRef.current,
            isAmbienceAllowed, // RESTORED
            setAmbienceAllowed // RESTORED
        }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    return useContext(AudioContext);
}