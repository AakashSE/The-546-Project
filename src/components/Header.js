"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import useMarsSound from "../hooks/useMarsSound";
import { useAudio } from "../context/AudioContext";
import { useTransition } from "../context/TransitionContext"; // NEW
import { fetchMarsWeather } from "../utils/marsWeather";

export default function Header({ theme = "light" }) {
  const { cart, toggleCart } = useCart();
  const { user, openAuth } = useAuth();

  const [telemetryIndex, setTelemetryIndex] = useState(0);
  const [telemetryData, setTelemetryData] = useState([
    "TEMP: CALCULATING...",
    "SOL: ....",
    "WIND: SCANNING..."
  ]);

  useEffect(() => {
    // 1. Fetch Real Data
    const getWeather = async () => {
      const data = await fetchMarsWeather();
      setTelemetryData([
        `TEMP: ${data.temp}`,
        `SOL: ${data.sol}`,
        `WIND: ${data.wind}`,
        `cond: ${data.condition.toUpperCase()}`
      ]);
    };
    getWeather();

    // 2. Data Rotation
    const interval = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % 4); // We have 4 items now
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { navigateWithTransition } = useTransition(); // HOOK

  const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");
  const { playSound: playMenu } = useMarsSound("/assets/Mars_Audio.mp3");
  const { playSound: playLogo } = useMarsSound("/assets/HomePageLogo.mp3");
  const { playGlobalSound } = useAudio();



  useEffect(() => {
    const handleScroll = () => {
      // Only set isScrolled to true if we are definitely not at the top
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    // Removed Orbital Menu toggle
  };

  const counterRef = React.useRef(null);

  useEffect(() => {
    if (cart.length > 0) {
      gsap.fromTo(counterRef.current,
        { scale: 1.6, filter: "brightness(3) saturate(1.5)", rotation: 15 },
        { scale: 1, filter: "brightness(1) saturate(1)", rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" }
      );
    }
  }, [cart.length]);

  const shard1Ref = React.useRef(null);
  const shard2Ref = React.useRef(null);
  const shard3Ref = React.useRef(null);
  const aegisRingRef = React.useRef(null);

  React.useLayoutEffect(() => {
    // UI logic for menu icon removed
    return () => { };
  }, []);

  const handleHover = (isHover) => {
    if (isMenuOpen) return;
    if (isHover) {
      // COOLING VENT SLIDE
      gsap.to(shard1Ref.current, { x: -8, duration: 0.4, ease: "back.out(2)" });
      gsap.to(shard2Ref.current, { x: 8, duration: 0.4, ease: "back.out(2)" });
      gsap.to(shard3Ref.current, { x: -8, duration: 0.4, ease: "back.out(2)" });
      gsap.to(aegisRingRef.current, { scale: 1.2, opacity: 0.8, duration: 0.4 });
    } else {
      // REGAIN COLUMN
      gsap.to([shard1Ref.current, shard2Ref.current, shard3Ref.current], { x: 0, duration: 0.6, ease: "power4.out" });
      gsap.to(aegisRingRef.current, { scale: 1, opacity: 0.4, duration: 0.6 });
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();

    // If already at homepage, do nothing
    if (pathname === "/") return;

    setIsScrolled(false);
    // Use Global Transition ("back" direction for returning home)
    navigateWithTransition("/", playLogo, "back");
  };

  const isDarkMode = theme === "dark" || isScrolled;
  const textColor = isDarkMode ? "text-white" : "text-black";
  const mutedTextColor = isDarkMode ? "text-white/40" : "text-black/40";
  const counterBg = isDarkMode ? "bg-white/20 text-white" : "bg-black/10 text-black/50";

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[200] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isScrolled
            ? "py-4 bg-[#050505]/80 backdrop-blur-md border-b border-white/10 shadow-sm"
            : "py-8 bg-transparent border-b border-transparent shadow-none"
          }
        `}
      >
        <div className="px-8 md:px-16 flex justify-between items-center relative max-w-[1920px] mx-auto w-full">

          {/* LEFT: LOGO & BACK */}
          <div className="flex items-center gap-6 z-20">


            <a href="/" onClick={handleLogoClick} aria-label="Mars Luxury Shop Home" className="group relative flex items-center justify-center cursor-pointer">
              <div className="absolute inset-0 bg-[#C1440E] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full scale-150" />
              <div className="relative w-28 h-8 md:w-32 md:h-10 transition-transform duration-300 group-hover:scale-105">
                <Image src="/assets/Logo.svg" alt="The 546 Project" fill className="object-contain" priority />
              </div>
            </a>
          </div>

          {/* CENTER: TELEMETRY - ROTATING VITAL STATS */}
          <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-4 text-[9px] uppercase tracking-widest font-mono pointer-events-none ${mutedTextColor}`}>
            <span className="text-[#C1440E] opacity-50">//</span>
            <div className="min-w-[120px] text-center overflow-hidden h-4 flex items-center justify-center">
              {telemetryData[telemetryIndex]}
            </div>
            <span className="text-[#C1440E] opacity-50">//</span>
          </div>

          {/* RIGHT: COMMAND CLUSTER */}
          <div className="flex items-center gap-8 z-20">

            {/* 1. ACCESS / LOGIN BUTTON */}
            {user ? (
              <a
                href="/account"
                onClick={(e) => { e.preventDefault(); navigateWithTransition("/account", playClick); }}
                className={`hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] group cursor-pointer ${textColor}`}
              >
                <div className="w-2 h-2 bg-[#C1440E] rounded-full animate-pulse" />
                <span className="relative">
                  ID: {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  <span className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[#C1440E] origin-right transition-transform duration-500 ease-out scale-x-0 group-hover:scale-x-100 group-hover:origin-left`} />
                </span>
              </a>
            ) : (
              <button
                onClick={() => { playClick(); openAuth(); }}
                aria-label="Access Account"
                className={`hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] group cursor-pointer ${textColor}`}
              >
                <span className="relative hover:text-[#C1440E] transition-colors">
                  ACCESS
                </span>
              </button>
            )}

            {/* 2. MANIFEST (Cart) */}
            <button
              onClick={() => { playClick(); toggleCart(); }}
              aria-label="Toggle Manifest"
              className={`flex items-center gap-4 text-xs font-bold uppercase tracking-[0.15em] group cursor-pointer ${textColor}`}
            >
              <span className="relative hidden md:inline transition-colors group-hover:text-[#C1440E]">
                Manifest
              </span>

              {/* DYNAMIC TUMBLER COUNTER */}
              <ManifestCounter count={cart.length} isDarkMode={isDarkMode} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

// Sub-component for the Tumbler Animation
function ManifestCounter({ count, isDarkMode }) {
  const [displayCount, setDisplayCount] = useState(count);
  const containerRef = React.useRef(null);
  const numberRef = React.useRef(null);
  const bracketLeftRef = React.useRef(null);
  const bracketRightRef = React.useRef(null);

  // Sync initial state
  useEffect(() => {
    setDisplayCount(count);
  }, []);

  // Handle Count Change Animation
  useEffect(() => {
    if (count === displayCount) return;

    const tl = gsap.timeline();

    // 1. "Unlock" / Expand Brackets
    tl.to([bracketLeftRef.current, bracketRightRef.current], {
      x: (i) => i === 0 ? -4 : 4, // Move out
      opacity: 1,
      duration: 0.2,
      ease: "power2.out"
    }, 0);

    // 2. Roll OUT old number (Upwards)
    tl.to(numberRef.current, {
      y: -15,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    }, 0);

    // 3. Swap Number & Roll IN (From Below)
    tl.call(() => setDisplayCount(count));
    tl.fromTo(numberRef.current,
      { y: 15, opacity: 0, color: "#C1440E" }, // Start orange for the "hot" update
      { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" },
      ">" // Append after previous
    );

    // 4. Settle Color (back to normal) & Retract Brackets
    tl.to(numberRef.current, {
      color: isDarkMode ? "#ffffff" : "#000000",
      duration: 0.4
    }, "<+=0.2");

    tl.to([bracketLeftRef.current, bracketRightRef.current], {
      x: 0,
      opacity: 0.5,
      duration: 0.4,
      ease: "power2.out"
    }, "<");

  }, [count, isDarkMode]);

  const borderColor = isDarkMode ? "border-white" : "border-black";
  const userTextColor = isDarkMode ? "text-white" : "text-black";

  return (
    <div ref={containerRef} className="relative w-10 h-10 flex items-center justify-center">
      {/* Left Bracket */}
      <div
        ref={bracketLeftRef}
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-6 border-l border-t border-b ${borderColor} opacity-50`}
      />

      {/* The Rolling Number */}
      <div className="overflow-hidden h-full w-full flex items-center justify-center">
        <span ref={numberRef} className={`text-sm font-black ${userTextColor}`}>
          {displayCount.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Right Bracket */}
      <div
        ref={bracketRightRef}
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-6 border-r border-t border-b ${borderColor} opacity-50`}
      />
    </div>
  );
}