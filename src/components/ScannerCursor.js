"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion';
import useResonanceAudio from '../hooks/useResonanceAudio';

/**
 * ScannerCursor Component - "The Resonance Prism"
 * An advanced, multi-segment kinetic cursor featuring internal parallax
 * and a sophisticated lens-array hover transition.
 */
export default function ScannerCursor() {
    const { playResonance } = useResonanceAudio();
    const [mounted, setMounted] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // ... (rest of physics)
    // CORE PHYSICS (Central Anchor)
    const coreSpring = { damping: 40, stiffness: 400, mass: 0.8 };
    const coreX = useSpring(cursorX, coreSpring);
    const coreY = useSpring(cursorY, coreSpring);

    // PARALLAX PHYSICS (Lagging Lateral Shards)
    const lateralSpring = { damping: 30, stiffness: 150, mass: 1.2 };
    const latX = useSpring(cursorX, lateralSpring);
    const latY = useSpring(cursorY, lateralSpring);

    // VELOCITY & DIRECTION
    const xVel = useVelocity(cursorX);
    const yVel = useVelocity(cursorY);
    const velocity = useTransform([xVel, yVel], ([x, y]) => Math.sqrt(x * x + y * y));
    const smoothVel = useSpring(velocity, { damping: 60, stiffness: 300 });

    // ROTATION (Aligns to movement vector)
    const rotation = useTransform([xVel, yVel], ([x, y]) => {
        if (Math.abs(x) < 2 && Math.abs(y) < 2) return 0;
        return (Math.atan2(y, x) * 180) / Math.PI + 90;
    });

    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            const isClickable = target.tagName === 'BUTTON' || target.tagName === 'A' ||
                target.closest('button') || target.closest('a') ||
                target.classList.contains('cursor-pointer');

            if (isClickable && !isHovering) {
                playResonance("tick", 0.2); // Soft tick on target lock
            }
            setIsHovering(isClickable);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);
        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY, isVisible, isHovering, playResonance]);


    // GEOMETRY MORPHING
    // Normal: Three parallel segments (Parallax active)
    // High Speed: Merged tapering streak
    const needleScaleY = useTransform(smoothVel, [0, 2500], [1, 2.5]);
    const shardOpacity = useTransform(smoothVel, [500, 2000], [0.8, 0]);
    const shardSpread = useTransform(smoothVel, [0, 500], [6, 2]);
    const shardOffset = useTransform(shardSpread, (s) => -s);

    if (!mounted || !isVisible) return null;

    return (
        <div className="fixed top-0 left-0 pointer-events-none z-[9999]" style={{ mixBlendMode: 'difference' }}>

            {/* LATERIAL SHARDS (Lagging Layer) */}
            <motion.div
                style={{
                    x: latX,
                    y: latY,
                    translateX: "-50%",
                    translateY: "-50%",
                    rotate: rotation,
                    opacity: isHovering ? 0 : 1
                }}
            >
                <div className="relative flex items-center justify-center">
                    {/* Left Shard */}
                    <motion.div
                        className="absolute w-[1.5px] h-3 bg-white/60"
                        style={{ x: shardOffset, opacity: shardOpacity }}
                    />
                    {/* Right Shard */}
                    <motion.div
                        className="absolute w-[1.5px] h-3 bg-white/60"
                        style={{ x: shardSpread, opacity: shardOpacity }}
                    />
                </div>
            </motion.div>

            {/* CORE NEEDLE (Anchor Layer) */}
            <motion.div
                style={{
                    x: coreX,
                    y: coreY,
                    translateX: "-50%",
                    translateY: "-50%",
                    rotate: rotation,
                }}
            >
                <div className="relative flex items-center justify-center">

                    {/* The Needle */}
                    <motion.div
                        className="w-[2px] h-5 bg-white origin-center"
                        style={{ scaleY: needleScaleY }}
                        animate={{
                            height: isHovering ? 10 : 20, // Slightly shrink on hover
                            opacity: isHovering ? 0.5 : 1 // Fade slightly on hover
                        }}
                    />

                    {/* QUANTUM HALO (Hover State Circular Aperture) */}
                    <svg width="80" height="80" viewBox="-40 -40 80 80" className="absolute overflow-visible">
                        {/* Outer Expanding Ring */}
                        <motion.circle
                            r="28"
                            fill="none"
                            stroke="white"
                            strokeWidth="0.5"
                            strokeDasharray="4 4"
                            animate={{
                                opacity: isHovering ? 0.4 : 0,
                                scale: isHovering ? 1 : 0.6,
                                rotate: isHovering ? 90 : 0
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />

                        {/* Inner Solid Ring (The Aperture) */}
                        <motion.circle
                            r="22"
                            fill="none"
                            stroke="white"
                            strokeWidth="1"
                            animate={{
                                opacity: isHovering ? 0.8 : 0,
                                scale: isHovering ? 1 : 0.8,
                                pathLength: isHovering ? 1 : 0
                            }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                        />

                        {/* Axis Points (North, South, East, West) */}
                        {[0, 90, 180, 270].map((rot) => (
                            <motion.rect
                                key={rot}
                                width="1"
                                height="4"
                                fill="white"
                                style={{ rotate: rot, y: -22, originY: "22px" }}
                                animate={{
                                    opacity: isHovering ? 1 : 0,
                                    scaleY: isHovering ? 1 : 0
                                }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            />
                        ))}

                        {/* Central Target Point (White) */}
                        <motion.circle
                            r="1"
                            fill="white"
                            animate={{
                                scale: isHovering ? [1, 2, 1] : 0,
                                opacity: isHovering ? 0.8 : 0
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </svg>

                </div>
            </motion.div>

            {/* Subtle Aura */}
            <motion.div
                className="absolute w-16 h-16 bg-white/5 blur-2xl rounded-full"
                animate={{
                    opacity: isHovering ? 0.8 : 0,
                    scale: isHovering ? 1.5 : 1
                }}
                style={{ x: coreX, y: coreY, translateX: "-50%", translateY: "-50%" }}
            />
        </div>
    );
}
