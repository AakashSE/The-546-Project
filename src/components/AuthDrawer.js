"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import useMarsSound from "../hooks/useMarsSound";
import useTypingAudio from "../hooks/useTypingAudio"; // NEW HOOK

import useCloseAudio from "../hooks/useCloseAudio"; // NEW HOOK

export default function AuthDrawer() {
    const { isAuthOpen, closeAuth, login, signup, loginWithGoogle } = useAuth();
    const [mode, setMode] = useState("login");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    // --- UPDATED AUDIO ---
    const { playSound: playOpen } = useMarsSound("/assets/Mars_Audio.mp3");
    const { playType } = useTypingAudio();
    const { playSound: playSuccess } = useMarsSound("/assets/AcquireAsset.mp3");
    // const { playSound: playClose } = useMarsSound("/assets/Close.mp3"); // REMOVED
    const { playClose } = useCloseAudio(); // REPLACED
    const { playSound: playError } = useMarsSound("/assets/Error.mp3"); // Assuming error sound exists or use close

    useEffect(() => {
        if (isAuthOpen) {
            playOpen();
            setError(null);
            setEmail("");
            setPassword("");
            setFullName("");
        }
    }, [isAuthOpen, playOpen]);

    const handleGoogleAuth = async () => {
        try {
            await loginWithGoogle();
            // No need to playSuccess() here as it redirects
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (mode === "login") {
                await login(email, password);
                playSuccess();
            } else {
                await signup(email, password, fullName);
                playSuccess();
                alert("Identity Record Created. Check comms (email) for verification if required.");
                setMode("login");
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
            // playError(); 
        } finally {
            setIsLoading(false);
        }
    };

    // Close Handler
    const handleAbort = () => {
        playClose();
        closeAuth();
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[6000] transition-opacity duration-500
                  ${isAuthOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
                onClick={handleAbort}
            />

            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0a0a0a] border-l border-[#C1440E]/30 z-[6001] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col
                  ${isAuthOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                {/* HEADER */}
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-[#C1440E] font-mono text-sm uppercase tracking-[0.2em] animate-pulse">
                        // Identity Protocol
                    </h2>
                    <button
                        onClick={handleAbort}
                        className="text-white/40 hover:text-white uppercase text-[10px] tracking-widest cursor-pointer"
                    >
                        [ Abort ]
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 p-8 flex flex-col justify-center gap-8">

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">
                            {mode === "login" ? "Clearance Check" : "New Registration"}
                        </h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">
                            {mode === "login" ? "Verify your bio-signature." : "Apply for colony citizenship."}
                        </p>
                    </div>

                    {/* ERROR DISPLAY */}
                    {error && (
                        <div className="p-4 bg-red-900/20 border border-red-500 text-red-500 text-xs font-mono">
                            ERROR: {error}
                        </div>
                    )}

                    {/* MANUAL FORM */}
                    <div className="flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={handleGoogleAuth}
                            className="w-full h-12 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Continue with Google
                        </button>

                        <div className="flex items-center gap-4 text-[10px] text-white/20 uppercase tracking-widest">
                            <div className="h-px bg-white/10 flex-1"></div>
                            OR
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="space-y-4">
                                {mode === "signup" && (
                                    <input
                                        type="text"
                                        placeholder="OPERATIVE NAME"
                                        value={fullName}
                                        onChange={(e) => { setFullName(e.target.value); e.target.setCustomValidity(''); }}
                                        onKeyDown={() => playType()}
                                        className="w-full bg-black/50 border-b border-white/20 py-3 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#C1440E] transition-colors uppercase tracking-widest"
                                        required
                                        title={fullName ? "" : "OPERATIVE IDENTITY REQUIRED"}
                                        onInvalid={(e) => e.target.setCustomValidity('OPERATIVE IDENTITY REQUIRED')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                )}
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest text-white/50">Frequency ID (Email)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); e.target.setCustomValidity(''); }}
                                        onKeyDown={() => playType()}
                                        className="w-full bg-black/50 border border-white/20 p-3 text-xs text-[#C1440E] font-mono focus:border-[#C1440E] focus:outline-none transition-colors"
                                        placeholder="USER@MARS.CO"
                                        required
                                        title={email ? "" : "FREQUENCY ID (EMAIL) REQUIRED"}
                                        onInvalid={(e) => e.target.setCustomValidity('FREQUENCY ID (EMAIL) REQUIRED')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest text-white/50">Security Key</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); e.target.setCustomValidity(''); }}
                                        onKeyDown={() => playType()}
                                        className="w-full bg-black/50 border border-white/20 p-3 text-xs text-[#C1440E] font-mono focus:border-[#C1440E] focus:outline-none transition-colors"
                                        placeholder="••••••••"
                                        required
                                        title={password ? "" : "SECURITY KEY REQUIRED"}
                                        onInvalid={(e) => e.target.setCustomValidity('SECURITY KEY REQUIRED')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-white text-black hover:bg-[#C1440E] hover:text-white transition-all font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center relative disabled:opacity-50"
                            >
                                {isLoading ? "AUTHENTICATING..." : (mode === "login" ? "GRANT ACCESS" : "INITIATE CITIZENSHIP")}
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={() => setMode(mode === "login" ? "signup" : "login")}
                            className="text-center text-[9px] uppercase tracking-widest text-white/40 hover:text-[#C1440E] transition-colors"
                        >
                            {mode === "login" ? "New to the colony? Initialize here." : "Already a citizen? Access Uplink."}
                        </button>

                    </div>
                </div>

                <div className="p-4 border-t border-white/10 text-[8px] text-white/20 font-mono text-center uppercase tracking-[0.3em]">
                    Secured by Mars-Net Encryption
                </div>
            </div>
        </>
    );
}