"use client";
import React, { useEffect, useRef } from "react";
import { useAudio } from "../context/AudioContext";

export default function AudioAmbience() {
    const { isMuted, isAmbienceAllowed, audioContext, preloadSounds } = useAudio();
    // No local ref for context, use the one from provider
    // const audioCtxRef = useRef(null); 
    const sourceRef = useRef(null);
    const filterRef = useRef(null);
    const gainRef = useRef(null);
    const isPlaying = useRef(false);
    const isGraphSetup = useRef(false);

    // Preload Core SFX on mount
    useEffect(() => {
        if (preloadSounds) {
            preloadSounds([
                "/assets/ColourClick.mp3",
                "/assets/HomePageLogo.mp3",
                "/assets/Mars_Audio.mp3"
            ]);
        }
    }, [preloadSounds]);

    // Initialize Audio Graph (Nodes only)
    useEffect(() => {
        if (!audioContext || isGraphSetup.current) return;

        // Create Nodes using shared context
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 20000;
        filter.Q.value = 1;

        const gain = audioContext.createGain();
        gain.gain.value = 0.5;

        // Connect Chain: Filter -> Gain -> Destination
        filter.connect(gain);
        gain.connect(audioContext.destination);

        filterRef.current = filter;
        gainRef.current = gain;
        isGraphSetup.current = true;

        // No close() needed, context is owned by Provider
    }, [audioContext]);

    // Handle Playback & Scroll
    useEffect(() => {
        if (!audioContext || !isGraphSetup.current) return;

        // LOADING AND PLAYING
        const loadAndPlay = async () => {
            if (isMuted || !isAmbienceAllowed) {
                if (audioContext.state === 'running') audioContext.suspend();
                return;
            }

            // Resume context if suspended
            if (audioContext.state === 'suspended') {
                try {
                    await audioContext.resume();
                } catch (e) {
                    // Can fail if no user interaction yet
                }
            }

            // If already playing, just ensure context is running
            if (isPlaying.current) {
                // If we paused source, we might need to recreate it?
                // Web Audio sources are one-shot. If we fetched and started, it loops.
                // Just resume context.
                return;
            }

            try {
                // Attempt to fetch from soundbank if exposed? 
                // Ambience is large, might not want to keep in memory forever if not playing?
                // But for smoothness, let's load.
                const response = await fetch("/assets/Mars_Audio.mp3");
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.loop = true;

                // Connect to Filter (Head of our chain)
                source.connect(filterRef.current);
                source.start(0);

                sourceRef.current = source;
                isPlaying.current = true;
            } catch (e) {
                console.error("Ambience Load Failed:", e);
            }
        };

        // SCROLL HANDLING
        const handleScroll = () => {
            if (!filterRef.current || !audioContext) return;

            const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
            const scrollY = window.scrollY;
            const progress = scrollMax > 0 ? Math.min(1, Math.max(0, scrollY / scrollMax)) : 0;

            const minFreq = 200;
            const maxFreq = 20000;
            const targetFreq = maxFreq - (progress * (maxFreq - minFreq));

            filterRef.current.frequency.setTargetAtTime(targetFreq, audioContext.currentTime, 0.1);
        };

        // GLOBAL RESUME HANDLER
        const handleInteraction = () => {
            if (audioContext && audioContext.state === 'suspended' && isAmbienceAllowed && !isMuted) {
                audioContext.resume().then(() => {
                    if (!isPlaying.current) loadAndPlay();
                });
            }
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("click", handleInteraction);
        window.addEventListener("keydown", handleInteraction);

        // Trigger Play/Mute logic
        loadAndPlay();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("keydown", handleInteraction);
            if (sourceRef.current) {
                try { sourceRef.current.stop(); } catch (e) { }
                sourceRef.current = null;
                isPlaying.current = false;
            }
        };
    }, [isMuted, isAmbienceAllowed]);

    return null; // Headless component
}
