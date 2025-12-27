"use client";
import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import useMarsSound from "../../hooks/useMarsSound";
import useTypingAudio from "../../hooks/useTypingAudio"; // NEW
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Stars } from "@react-three/drei";
import Radar from "../../components/Radar";
import gsap from "gsap";

export default function CommsPage() {
    const { playType } = useTypingAudio(); // REPLACED
    const { playSound: playSend } = useMarsSound("/assets/AcquireAsset.mp3");

    const [form, setForm] = useState({ id: "", message: "" });
    const [status, setStatus] = useState("idle"); // idle, encrypting, connecting, uploading, success
    const [logs, setLogs] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const logsContainerRef = useRef(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (text) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status !== "idle") return;

        playSend();
        setStatus("encrypting");
        addLog("INITIATING HANDSHAKE...");

        // Sequence: Encrypting -> Connecting -> Uploading -> Success

        // 1. Encrypting
        setTimeout(() => {
            addLog("ENCRYPTING MESSAGE PAYLOAD...");
            // Simulate 'scrambling' effect could go here
        }, 1000);

        // 2. Connecting
        setTimeout(() => {
            setStatus("connecting");
            addLog("SEARCHING FOR SATELLITE LINK...");
            addLog("ALIGNING RADAR DISH...");
        }, 2500);

        // 3. Uploading
        setTimeout(() => {
            setStatus("uploading");
            addLog("UPLINK ESTABLISHED. BEGINNING PACKET TRANSFER.");

            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    finishUpload();
                }
                setUploadProgress(Math.floor(progress));
            }, 200);
        }, 4500);
    };

    const finishUpload = () => {
        setStatus("success");
        addLog("TRANSMISSION COMPLETE. RESPONSE AWAITING.");
        setForm({ id: "", message: "" });
        setTimeout(() => {
            setStatus("idle");
            setLogs([]);
            setUploadProgress(0);
        }, 5000); // Reset after 5 seconds of success
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-courier cursor-none flex flex-col relative overflow-x-hidden">
            <Header theme="dark" />



            {/* BACKGROUND RADAR VISUALIZATION */}
            <div className="fixed inset-0 z-0 pointer-events-none">

                <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Radar />
                    {/* Add OrbitControls but restrict zoom to keep UI stable */}
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* UI OVERLAY */}
            <main className="flex-1 flex flex-col justify-start pt-32 md:pt-48 px-8 md:px-32 relative z-10 pointer-events-none min-h-screen">


                <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center pointer-events-auto">

                    {/* LEFT: FORM INTERFACE */}
                    <div className={`transition-opacity duration-500 ${status === 'idle' ? 'opacity-100' : 'opacity-20 blur-sm'}`}>
                        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-2 text-white">
                            Establish Uplink
                        </h1>
                        <p className="text-xs font-mono text-[#C1440E] uppercase tracking-[0.3em] mb-12 animate-pulse">
                            // Secure Channel Open
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                            {/* ID INPUT */}
                            <div className="flex flex-col gap-2 group">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 group-focus-within:text-[#C1440E] transition-colors font-mono">
                                    Identifier (Email)
                                </label>
                                <input
                                    type="email"
                                    value={form.id}
                                    onChange={(e) => { setForm({ ...form, id: e.target.value }); e.target.setCustomValidity(''); }}
                                    onKeyDown={(e) => playType(e)}
                                    className="bg-black/50 border border-white/20 p-4 text-xl font-mono uppercase tracking-widest text-white placeholder-white/20 focus:border-[#C1440E] focus:outline-none transition-all backdrop-blur-md"
                                    placeholder="ENTER ID..."
                                    required
                                    title={form.id ? "" : "IDENTIFIER REQUIRED"}
                                    onInvalid={(e) => e.target.setCustomValidity('IDENTIFIER REQUIRED')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                    disabled={status !== 'idle'}
                                />
                            </div>

                            {/* MESSAGE INPUT */}
                            <div className="flex flex-col gap-2 group">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 group-focus-within:text-[#C1440E] transition-colors font-mono">
                                    Transmission Data
                                </label>
                                <textarea
                                    rows="4"
                                    value={form.message}
                                    onChange={(e) => { setForm({ ...form, message: e.target.value }); e.target.setCustomValidity(''); }}
                                    onKeyDown={(e) => playType(e)}
                                    className="bg-black/50 border border-white/20 p-4 text-xl font-mono uppercase tracking-widest text-white placeholder-white/20 focus:border-[#C1440E] focus:outline-none transition-all resize-none leading-relaxed backdrop-blur-md"
                                    placeholder="ENTER MESSAGE..."
                                    required
                                    title={form.message ? "" : "TRANSMISSION DATA REQUIRED"}
                                    onInvalid={(e) => e.target.setCustomValidity('TRANSMISSION DATA REQUIRED')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                    disabled={status !== 'idle'}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status !== 'idle'}
                                className="mt-4 px-12 py-4 border border-[#C1440E] text-[#C1440E] font-mono font-bold uppercase tracking-[0.2em] hover:bg-[#C1440E] hover:text-white transition-all self-start disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'idle' ? 'Initialise Sequence' : 'Processing...'}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: TERMINAL / STATUS DISPLAY */}
                    <div className="h-[400px] border border-white/10 bg-black/80 backdrop-blur-sm p-6 flex flex-col font-mono text-sm relative overflow-hidden">

                        {/* DECORATIVE CORNERS */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#C1440E]"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#C1440E]"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#C1440E]"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#C1440E]"></div>

                        {/* HEADER */}
                        <div className="border-b border-white/10 pb-2 mb-4 flex justify-between items-end">
                            <span className="text-[#C1440E] tracking-widest uppercase">SYS.LOG</span>
                            <span className="text-gray-600 text-[10px]">V.2.0.4</span>
                        </div>

                        {/* LOGS OUTPUT */}
                        <div
                            ref={logsContainerRef}
                            className="flex-1 overflow-y-auto space-y-2 text-gray-400 font-mono text-xs scrollbar-hide"
                        >
                            {logs.length === 0 && (
                                <div className="text-gray-700 italic text-center mt-20">WAITING FOR INPUT...</div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="border-l-2 border-[#C1440E]/50 pl-2">
                                    {log}
                                </div>
                            ))}
                        </div>

                        {/* PROGRESS BAR (Only visible during uploading) */}
                        {status === 'uploading' && (
                            <div className="mt-4">
                                <div className="flex justify-between text-[#C1440E] text-[10px] mb-1">
                                    <span>UPLOADING PACKETS</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-900">
                                    <div
                                        className="h-full bg-[#C1440E] transition-all duration-200"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* COMPLETED MESSAGE */}
                        {status === 'success' && (
                            <div className="mt-4 text-[#C1440E] text-center border border-[#C1440E] py-2 animate-pulse">
                                TRANSMISSION SUCCESSFUL
                            </div>
                        )}

                    </div>

                </div>
            </main>
            <Footer />
        </div>

    );
}
