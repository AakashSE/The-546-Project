"use client";
import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
    const router = useRouter();
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Added 'direction' param (default "next")
    const navigateWithTransition = async (path, playSoundFunc, direction = "next") => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        if (playSoundFunc) playSoundFunc();

        // Pass direction to the Curtain
        if (typeof window !== "undefined" && window.raiseCurtain) {
            await window.raiseCurtain(direction);
        }

        router.push(path);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 1000);
    };

    return (
        <TransitionContext.Provider value={{ navigateWithTransition }}>
            {children}
        </TransitionContext.Provider>
    );
}

export function useTransition() {
    return useContext(TransitionContext);
}