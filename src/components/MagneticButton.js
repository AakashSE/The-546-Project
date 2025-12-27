"use client";
import React, { useRef, useState } from "react";
import gsap from "gsap";
import useResonanceAudio from "../hooks/useResonanceAudio";

export default function MagneticButton({ children, className, onClick, ...props }) {
  const buttonRef = useRef(null);
  const textRef = useRef(null);
  const { playResonance } = useResonanceAudio();
  const [isEngaged, setIsEngaged] = useState(false);

  const handleMouseEnter = () => {
    playResonance("tick", 0.3); // High-frequency engagement tick
    setIsEngaged(true);
  };

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();

    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    gsap.to(buttonRef.current, {
      x: x * 0.5,
      y: y * 1.0, // Increased magnetic pull for "Luxury Weight"
      duration: 0.6,
      ease: "power3.out",
    });

    gsap.to(textRef.current, {
      x: x * 0.15,
      y: y * 0.2,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  const handleMouseLeave = () => {
    setIsEngaged(false);
    gsap.to([buttonRef.current, textRef.current], {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: "elastic.out(1.1, 0.4)", // Snappier return
    });
  };

  const handleClick = (e) => {
    // playResonance("resonance", 0.6); // REMOVED: Conflict with main action
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}

      className={className || "relative bg-black text-white px-10 py-5 uppercase tracking-[0.2em] text-sm overflow-hidden group hover:bg-[#C1440E] transition-colors duration-300"}
      {...props}
    >
      <span ref={textRef} className="relative z-10 block pointer-events-none">
        {children}
      </span>
    </button>
  );
}