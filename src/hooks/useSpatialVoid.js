import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

/**
 * useSpatialVoid
 * Creates a low-frequency ambient hum that pans in 3D space.
 */
export default function useSpatialVoid() {
    const { isMuted, audioContext } = useAudio();
    const sourceRef = useRef(null);
    const pannerRef = useRef(null);
    const gainRef = useRef(null);
    const isPlaying = useRef(false);

    useEffect(() => {
        if (!audioContext) return;

        const setupSpatialGraph = async () => {
            // 1. Create Panner
            const panner = audioContext.createPanner();
            panner.panningModel = 'equalpower';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1;
            panner.maxDistance = 10000;
            panner.rolloffFactor = 1;
            panner.coneInnerAngle = 360;
            panner.coneOuterAngle = 0;
            panner.coneOuterGain = 0;
            panner.positionX.value = 0;
            panner.positionY.value = 0;
            panner.positionZ.value = 1;

            // 2. Create Gain for subtle volume
            const gain = audioContext.createGain();
            gain.gain.value = 0.2; // Very subtle void hum

            // 3. Chain: Source -> Panner -> Gain -> Destination
            panner.connect(gain);
            gain.connect(audioContext.destination);

            pannerRef.current = panner;
            gainRef.current = gain;

            // 4. Load Void Hum (Reusing Mars_Audio or a different one)
            try {
                const response = await fetch("/assets/Mars_Audio.mp3");
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.loop = true;
                source.connect(panner);

                if (!isMuted) {
                    source.start(0);
                    isPlaying.current = true;
                }
                sourceRef.current = source;
            } catch (e) {
                console.warn("Spatial Void Hum failed to load", e);
            }
        };

        if (audioContext.state === 'suspended') {
            const resume = () => {
                audioContext.resume().then(() => {
                    if (!isPlaying.current) setupSpatialGraph();
                    window.removeEventListener('click', resume);
                });
            };
            window.addEventListener('click', resume);
        } else {
            setupSpatialGraph();
        }

        return () => {
            if (sourceRef.current) {
                try { sourceRef.current.stop(); } catch (e) { }
            }
        };
    }, [audioContext, isMuted]);

    const updatePan = useCallback((x, y) => {
        if (pannerRef.current && audioContext) {
            // Map -1 to 1 to a reasonable spatial range
            const time = audioContext.currentTime;
            pannerRef.current.positionX.setTargetAtTime(x * 5, time, 0.1);
            pannerRef.current.positionY.setTargetAtTime(y * 5, time, 0.1);
        }
    }, [audioContext]);

    const setVolume = useCallback((v) => {
        if (gainRef.current && audioContext) {
            gainRef.current.gain.setTargetAtTime(v, audioContext.currentTime, 0.1);
        }
    }, [audioContext]);

    return { updatePan, setVolume };
}
