"use client";
import React from 'react';

export default function MarsLogo({ className = "" }) {
    return (
        <svg
            viewBox="0 0 320 60"
            fill="currentColor"
            className={`text-[#C1440E] ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* 
              CONCEPT: "NARRATIVE GLYPHS - HIGH FIDELITY" 
              Detailed negative space carving to tell the story of Mars colonization.
            */}

            {/* --- LETTER M: "THE PIONEER" (Detailed Astronaut & Terrain) --- */}
            <g transform="translate(0,0)">
                {/* Exterior Letter Shape */}
                <path d="M0,60 V10 Q0,0 15,0 H20 Q30,0 32.5,15 L35,25 L37.5,15 Q40,0 50,0 H55 Q70,0 70,10 V60 H50 V30 L42,45 H28 L20,30 V60 H0 Z" />

                {/* NEGATIVE SPACE: Astronaut HUD & Suit */}
                <g fill="#000">
                    {/* Helmet Outline */}
                    <path d="M20,50 Q20,32 35,32 Q50,32 50,50 L48,52 H22 Z" />
                    {/* Visor Glint */}
                    <path d="M25,40 Q35,35 45,40 Q40,45 38,42" fill="none" stroke="#000" strokeWidth="1.5" />
                    {/* Suit Collar / Shoulders */}
                    <path d="M15,60 Q15,42 35,42 Q55,42 55,60 H48 Q48,48 35,48 Q22,48 22,60 Z" />
                    {/* Horizon Line / Terrain in Visor */}
                    <path d="M22,45 Q35,42 48,45 V50 H22 Z" opacity="0.6" />
                    {/* Distant Star */}
                    <path d="M15,15 L17,17 L15,19 L13,17 Z" />
                    <circle cx="55" cy="12" r="1.5" />
                </g>
            </g>


            {/* --- LETTER A: "THE ASCENT" (Rocket Launch & Plumes) --- */}
            <g transform="translate(80,0)">
                {/* A Shape */}
                <path d="M0,60 L20,0 H50 L70,60 H50 L45,45 H25 L20,60 H0 Z" />

                {/* NEGATIVE SPACE: Rocket */}
                <g fill="#000">
                    {/* The Beam / Plume - Jagged for thrust */}
                    <path d="M35,60 L28,45 L33,22 L37,22 L42,45 L35,60 Z" />
                    {/* Rocket Body */}
                    <path d="M33,22 L35,12 L37,22 H33 Z" />
                    {/* Side Boosters */}
                    <rect x="31" y="18" width="1.5" height="4" rx="0.5" />
                    <rect x="37.5" y="18" width="1.5" height="4" rx="0.5" />
                    {/* Launch Pad Base details */}
                    <rect x="25" y="55" width="20" height="5" opacity="0.5" />
                    <circle cx="35" cy="10" r="1" /> {/* Nose cone light */}
                </g>
            </g>


            {/* --- LETTER R: "THE ORBIT" (Detailed Planet System) --- */}
            <g transform="translate(155,0)">
                {/* R Shape */}
                <path d="M0,60 V0 H40 Q70,0 70,25 Q70,40 50,45 L70,60 H45 L30,45 H20 V60 H0 Z" />

                {/* NEGATIVE SPACE: Planet */}
                <g fill="#000">
                    {/* Planet Body */}
                    <circle cx="35" cy="25" r="9" />
                    {/* Rings - Main */}
                    <path d="M12,32 Q35,45 58,18 L55,16 Q35,40 15,29 Z" />
                    {/* Rings - Inner Shadow/Gap */}
                    <path d="M18,30 Q35,38 52,20" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.5" />
                    {/* Moon */}
                    <circle cx="55" cy="35" r="2.5" />
                    <path d="M12,12 L14,14 L12,16 L10,14 Z" /> {/* Star */}
                </g>
            </g>


            {/* --- LETTER S: "THE GALAXY" (Spiral Arms & Black Hole) --- */}
            <g transform="translate(230,0)">
                {/* S Shape */}
                <path d="M70,45 Q70,60 40,60 H15 Q0,60 0,45 Q0,35 15,30 L45,25 Q50,23 50,15 Q50,10 40,10 H20 Q10,10 10,20 H-10 Q-10,0 20,0 H50 Q70,0 70,15 Q70,25 55,30 L25,35 Q20,37 20,45 Q20,50 30,50 H55 Q65,50 65,40 H85 Z" />

                {/* NEGATIVE SPACE: Galaxy */}
                <g fill="#000" transform="translate(35,30) scale(0.65)">
                    {/* Central Black Hole / Core */}
                    <circle cx="0" cy="0" r="4" />
                    {/* Spiral Arms - Swirling */}
                    <path d="M0,0 Q15,-15 25,0 Q30,10 20,20" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
                    <path d="M0,0 Q-15,15 -25,0 Q-30,-10 -20,-20" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />

                    {/* Accretion Disk debris */}
                    <circle cx="18" cy="-5" r="1.5" />
                    <circle cx="-12" cy="18" r="1.5" />
                    <circle cx="8" cy="15" r="1" />
                    <circle cx="-15" cy="-8" r="1" />
                </g>
            </g>

        </svg>
    );
}
