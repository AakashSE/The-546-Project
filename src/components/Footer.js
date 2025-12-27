"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import OrbitalRadar from "./OrbitalRadar"; // NEW IMPORT
import useMarsSound from "../hooks/useMarsSound";
import useTypingAudio from "../hooks/useTypingAudio"; // NEW HOOK
import { fetchMarsWeather } from "../utils/marsWeather";

// --- 1. THE CLASSIFIED DATABASE ---
const DATABASE = {
  // ACQUISITION
  "New Arrivals": {
    title: "New Arrivals // Supply Drop 404",
    body: "Latest shipment received from Earth-Mars Transit Loop. Featuring the new 'Red Dust' collection designed for high-particulate environments. Inventory status: PROCESSING."
  },
  "Restocks": {
    title: "Resupply Manifest",
    body: "Critical essentials replenished. Nano-Weave polos and Standard Issue trousers are back in stock at Sector 7 distribution nodes. Priority access granted to Tier-1 colonists."
  },
  "Archives": {
    title: "Deep Storage // Legacy Tech",
    body: "Accessing discontinued patterns and prototype garments from the First Landing era. These items are strictly for museum display or authorized collectors. Clearance code required."
  },
  "Field Kits": {
    title: "Standard EVA Loadouts",
    body: "Pre-bundled equipment sets for rover excursions. Includes: 1x Utility Cargo, 1x Thermal Layer, and 1x Oxygen Filtration Scarf. Survival rating: 98%."
  },
  "Standard Issue": {
    title: "Colony Uniform Code",
    body: "The baseline attire for daily habitat life. Mandatory for all personnel during working hours (0600-1800 SOL). Durable, recyclable, and compliant with United Mars Regulations."
  },

  // INTELLIGENCE
  "Mission Brief": {
    title: "Project Ares // Overview",
    body: "Our mission is to engineer the first generation of interplanetary luxury. We do not just clothe the body; we armor the human spirit against the void. Elevate. Survive. Conquer."
  },
  "Technology": {
    title: "Fabrication Specs",
    body: "Our textiles utilize Graphene-infused wool and Aerogel mesh. Self-healing micro-structures ensure tears seal within minutes. Radiation shielding comes standard on all outerwear."
  },
  "Material Science": {
    title: "Matter Synthesis",
    body: "We do not import fabrics; we grow them. Using hydroponic cotton labs in Jezero Crater, we cultivate fibers 40% stronger than Earth variants due to lower gravity growth conditions."
  },
  "The Foundry": {
    title: "Manufacturing Hub",
    body: "Located beneath the Tharsis Plateau, The Foundry is an automated production facility run by AI loom-bots. Zero defects. Zero waste. 100% Precision."
  },
  "Directives": {
    title: "Command Protocols",
    body: "Directive 1: Quality above all. Directive 2: Function is beauty. Directive 3: Waste nothing. All personnel must adhere to these core tenets or face ration reduction."
  },

  // LOGISTICS
  "Order Status": {
    title: "Tracking Uplink",
    body: "Enter your encrypted Order ID to triangulate your package. Note: Solar flares may cause telemetry delays of up to 4 minutes. Your asset is currently in: ORBITAL DECAY."
  },
  "Bio-Metric Sizing": {
    title: "Fit Calibration",
    body: "Do not guess. Use our Bio-Scanner to map your exact dimensions. Our garments are cut to micro-millimeter precision. Improper fit may compromise thermal seal integrity."
  },
  "Shipping Protocols": {
    title: "Transit Logistics",
    body: "Inter-colony shipping via Mag-Lev Train: 2 Sols. Earth-to-Mars Transit: 6-8 Months. All packages are vacuum-sealed and sterilized upon arrival to prevent contamination."
  },
  "Returns": {
    title: "Asset Recovery Protocol",
    body: "Due to strict bio-hazard controls, items exposed to the Martian surface cannot be returned to the general supply. Defective units must be incinerated. Credits will be refunded upon video proof of destruction."
  },
  "Mars Treaty": {
    title: "Legal Framework",
    body: "By wearing this garment, you agree to the 2042 Ares Accord. The 546 Project is not liable for exposure to vacuum, solar radiation, or sentient dust storms. Jurisdiction: International Space Law."
  },
  "Priority Uplink": {
    title: "Rapid Deployment // Fast Track",
    body: "Priority payload status. Bypasses standard Deimos customs queue. Direct orbital insertion vector assigned. Delivery window reduced by almost a month. Authorized for medical and command personnel."
  },
  "Hull Insurance": {
    title: "Hull Integrity Assurance",
    body: "Compensatory protocol for lost or damaged cargo. Covers micrometeoroid impact, atmospheric entry burn, and unauthorized rover interception. Guaranteed unit replacement."
  }
};

const SOCIAL_LINKS = [
  { name: "Instagram", url: "https://www.instagram.com/_sky_2_sea_/" },
  { name: "Twitter", url: "https://x.com/Mars_SE2" },
  { name: "Comms", url: "mailto:aakashse@gmail.com" }
];

export default function Footer() {
  const { playSound: playClick } = useMarsSound("/assets/FooterOptions.mp3");
  const { playType } = useTypingAudio(); // REPLACED: Web Audio API
  // const { playSound: playType } = useMarsSound("/assets/Typing.mp3"); // REMOVED // NEW: Typing Sound
  const { playSound: playFooterOpt } = useMarsSound("/assets/FooterOptions.mp3");

  const [email, setEmail] = useState("");
  const [news, setNews] = useState([]); // NEW STATE
  const [selectedFile, setSelectedFile] = useState(null);

  // NEWS FETCH
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles?search=Mars&limit=10');
        const data = await res.json();
        if (data.results) setNews(data.results);
      } catch (e) {
        console.error("News Uplink Failed", e);
      }
    };
    fetchNews();
  }, []);

  // LANDSCAPE CANVAS LOGIC
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight;

    // Resizing
    const resize = () => {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);

    // Asset Setup (Sun, Mountains)
    // We draw procedural landscape scrolling LEFT
    let offset = 0;
    const speed = 0.5;

    const drawMountains = (ctx, hOffset, color, speedVal) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, height);

      // Generate visible peaks based on scroll offset
      // We simulate infinite noise by calling a pseudo-noise 
      const spacing = 100;
      const totalPoints = Math.ceil(width / spacing) + 2;

      // Starting X should account for scroll
      const globalX = offset * speedVal;
      const startIdx = Math.floor(globalX / spacing);
      const shiftX = -(globalX % spacing);

      for (let i = 0; i < totalPoints; i++) {
        const idx = startIdx + i;
        // Simple deterministic noise
        const noise = (Math.sin(idx * 0.5) + Math.cos(idx * 0.3) * 0.5 + Math.sin(idx * 0.1) * 2.0);
        // Normalize roughly -2 to 2? No, clamp
        const peakH = 50 + Math.abs(noise * 30); // 20 to 80 px high peaks

        ctx.lineTo((i * spacing) + shiftX, height - peakH - hOffset);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. STARS BACKGROUND (Slow Parallax)
      // Draw static stars for now, or slow moving
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.5 + offset * 0.1) % width; // Golden angle dist
        const y = (i * 33.3) % (height * 0.6); // Top 60% only
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        ctx.fillRect(Math.abs(x), y, 1, 1);
      }

      // 2. SUN/MOON (Removed per user request)
      // The pulsing logo acts as the sun.


      // 3. MOUNTAINS (Back Layer - Slower)
      drawMountains(ctx, 40, '#111111', 0.2); // Very dark grey

      // 4. MOUNTAINS (Mid Layer - Faster)
      drawMountains(ctx, 10, '#0a0a0a', 0.5); // Almost black

      // 5. GROUND LINE (Foreground)
      // We draw a thicker ground to give the rover a clear path
      const groundHeight = 80;
      ctx.fillStyle = '#020202'; // Match footer bg
      ctx.fillRect(0, height - groundHeight, width, groundHeight);

      // Add a subtle horizon line
      ctx.beginPath();
      ctx.moveTo(0, height - groundHeight);
      ctx.lineTo(width, height - groundHeight);
      ctx.strokeStyle = '#111';
      ctx.stroke();

      offset += speed;
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);



  // TELEMETRY
  const [telemetryIndex, setTelemetryIndex] = useState(0);
  const [telemetryData, setTelemetryData] = useState([
    "SYSTEM: ALL GREEN", "LOC: JEZERO CRATER", "UPLINK: INITIALIZING..."
  ]);

  useEffect(() => {
    // Fetch Real Weather
    const getWeather = async () => {
      const data = await fetchMarsWeather();
      setTelemetryData([
        "SYSTEM: ONLINE",
        "LOC: JEZERO CRATER",
        `SOL: ${data.sol}`,
        `TEMP: ${data.temp}`,
        `WIND: ${data.wind}`,
        `SEASON: ${data.season.toUpperCase()}`,
        `SUNSET: ${data.sunset}`
      ]);
    };
    getWeather();

    const interval = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % 6); // Approx length
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    playClick();
    alert("TRANSMISSION RECEIVED. WELCOME TO THE COLONY.");
    setEmail("");
  };

  // --- OPEN FILE HANDLER ---
  const openFile = (key) => {
    playFooterOpt();
    setSelectedFile(DATABASE[key] || { title: "ENCRYPTED", body: "Data corrupted or classified." });
  };

  const footerLinks = [
    {
      title: "Acquisition",
      links: [
        { label: "New Arrivals", type: "modal", key: "New Arrivals" },
        { label: "Restocks", type: "modal", key: "Restocks" },
        { label: "Archives", type: "modal", key: "Archives" },
        { label: "Field Kits", type: "modal", key: "Field Kits" },
        { label: "Standard Issue", type: "modal", key: "Standard Issue" }
      ]
    },
    {
      title: "Intelligence",
      links: [
        { label: "Mission Brief", type: "modal", key: "Mission Brief" },
        { label: "Technology", type: "modal", key: "Technology" },
        { label: "Material Science", type: "modal", key: "Material Science" },
        { label: "The Foundry", type: "modal", key: "The Foundry" },
        { label: "Directives", type: "modal", key: "Directives" }
      ]
    },
    {
      title: "Logistics",
      links: [
        { label: "Order Status", type: "modal", key: "Order Status" },
        { label: "Bio-Metric Sizing", type: "modal", key: "Bio-Metric Sizing" },
        { label: "Shipping Protocols", type: "modal", key: "Shipping Protocols" },
        { label: "Priority Uplink", type: "modal", key: "Priority Uplink" },
        { label: "Hull Insurance", type: "modal", key: "Hull Insurance" },
        { label: "Refund & Access", type: "href", href: "/legal/refund" }, // REAL LINK
        { label: "Terms & Operations", type: "href", href: "/legal/terms" }, // REAL LINK
        { label: "Privacy Protocol", type: "href", href: "/legal/privacy" } // REAL LINK
      ]
    }
  ];

  return (
    <>
      {/* ... (Modal Logic Remains Same) ... */}
      {selectedFile && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedFile(null)} />
          <div className="relative bg-[#050505] border border-white/20 w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200 cursor-auto">
            {/* ... (Modal Content) ... */}
            <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-[#C1440E] font-mono text-sm uppercase tracking-[0.2em] mb-1">
                  // {selectedFile.title}
                </h2>
                <p className="text-[9px] text-white/40 uppercase tracking-widest">
                  Classified Document
                </p>
              </div>
              <button onClick={() => setSelectedFile(null)} aria-label="Close Classified Document" className="text-white/40 hover:text-[#C1440E] text-xl font-mono">[X]</button>
            </div>
            <p className="text-white/80 font-mono text-xs leading-relaxed uppercase tracking-wide">{selectedFile.body}</p>
            <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-[8px] text-white/30 uppercase tracking-[0.2em]">
              <span>Auth: CMDR. SHEPARD</span>
              <span className="animate-pulse">Status: READ ONLY</span>
            </div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#C1440E]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#C1440E]" />
          </div>
        </div>
      )}

      {/* ... (Footer Structure) ... */}
      <footer className="w-full bg-[#020202] text-white pt-20 pb-12 px-8 md:px-16 border-t border-white/10 relative overflow-hidden z-10">

        {/* ... (Ticker & Canvas & Rover remain same) ... */}
        {/* RE-INSERTING PREVIOUS JSX STRUCTURE TO MATCH CONTEXT */}
        <div className="absolute top-0 left-0 w-full h-8 border-b border-white/10 flex items-center overflow-hidden px-4 text-[10px] font-mono tracking-widest text-[#C1440E] z-20 bg-[#020202]/50 backdrop-blur-sm">
          <div className="animate-marquee w-full">
            {news.length > 0 ? (
              news.map((item, i) => (
                <span key={i} className="mx-8"><span className="text-white/30 mr-2">[{new Date(item.published_at).toLocaleDateString()}]</span>{item.title.toUpperCase()} <span className="text-white/30 ml-2">///</span></span>
              ))
            ) : (
              <span>:: ESTABLISHING DEEP SPACE NETWORK LINK... :: SCANNING FOR MARS NEWS FEEDS... ::</span>
            )}
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-60" />
          <div className="absolute bottom-[80px] left-0 w-full h-12 z-10 pointer-events-none">
            <div className="w-[120%] flex animate-rover-drive-slow relative">
              <div className="relative w-24 h-12 text-[#C1440E] opacity-90">
                {/* Rover SVG */}
                <div className="absolute bottom-2 left-full -translate-x-2 w-64 h-32 bg-gradient-to-r from-[#C1440E]/10 to-transparent origin-bottom-left" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)', maskImage: 'linear-gradient(to right, black, transparent)' }} />
                <div className="absolute bottom-2 left-full w-full h-[1px] bg-[#C1440E]/50 animate-pulse origin-left" style={{ transform: 'rotate(-5deg)' }} />
                <svg viewBox="0 0 60 30" fill="currentColor">
                  <path d="M10,15 L15,10 H40 L45,15 H50 V20 H5 V15 H10 Z" />
                  <path d="M40,10 L35,6 H20 L15,10 H40 Z" opacity="0.7" />
                  <circle cx="12" cy="22" r="5" /> <circle cx="12" cy="22" r="2" fill="black" opacity="0.6" />
                  <circle cx="48" cy="22" r="5" /> <circle cx="48" cy="22" r="2" fill="black" opacity="0.6" />
                  <path d="M12,22 L20,15" stroke="currentColor" strokeWidth="1.5" /> <path d="M48,22 L40,15" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="15" y="18" width="30" height="2" rx="1" opacity="0.8" />
                  <rect x="42" y="5" width="4" height="2" /> <path d="M44,7 V10" stroke="currentColor" strokeWidth="1" /> <path d="M10,10 V5" stroke="currentColor" strokeWidth="0.5" />
                </svg>
                <div className="absolute bottom-0 right-full flex gap-2 opacity-40"><div className="w-1.5 h-1.5 bg-[#C1440E] rounded-full animate-ping" /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto relative z-10 w-full">
          <div className="flex flex-col xl:flex-row justify-between items-start gap-16 xl:gap-24">
            {/* Brand & Comms... */}
            <div className="flex flex-col gap-8 max-w-xs">
              <Link href="/" className="group relative block w-fit" onClick={playClick}>
                <div className="absolute inset-0 bg-[#C1440E] blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-1000 scale-150 animate-pulse" />
                <div className="relative w-48 h-16 md:w-64 md:h-20 transition-transform duration-500 group-hover:scale-105">
                  <Image src="/assets/Logo.svg" alt="M★RS" fill className="object-contain" />
                </div>
              </Link>
              <div className="text-[9px] uppercase tracking-widest text-[#C1440E] font-mono leading-relaxed border-l-2 border-[#C1440E]/50 pl-4">
                <p>Colony Approved.</p>
                <p className="text-white/40">Engineered for survival.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-16 md:gap-20 flex-1">
              <div className="flex flex-col gap-6 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-[#C1440E] animate-pulse" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C1440E] font-mono">Secure Uplink</h4>
                </div>
                <form onSubmit={handleJoin} className="flex flex-col gap-4 bg-white/5 p-4 border border-white/10 rounded-sm relative overflow-hidden group">
                  {/* ... Form ... */}
                  <div className="absolute top-0 right-0 p-1"><div className="w-1 h-1 bg-white/20 rounded-full" /></div>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#C1440E] font-mono text-xs">{'>'}</span>
                    <input
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        e.target.setCustomValidity('');
                      }}
                      title={email ? "" : "FREQUENCY ID (EMAIL) REQUIRED"}
                      onInvalid={(e) => e.target.setCustomValidity('FREQUENCY ID (EMAIL) REQUIRED')}
                      onKeyDown={(e) => playType(e)}
                      placeholder="ENTER_ID"
                      aria-label="Email Address for Transmission"
                      className="w-full bg-transparent border-b border-white/20 py-2 pl-4 text-xs text-[#C1440E] font-mono tracking-widest placeholder:text-white/30 focus:border-[#C1440E] focus:outline-none transition-colors uppercase"
                      required
                    />
                  </div>
                  <button type="submit" aria-label="Transmit Data" className="text-[9px] uppercase tracking-widest bg-[#C1440E]/10 hover:bg-[#C1440E] text-[#C1440E] hover:text-black py-2 text-center transition-all duration-300 font-bold border border-[#C1440E]/50">Transmit Data</button>
                </form>
              </div>

              {/* DYNAMIC NAV LINKS - RENDER LOGIC UPDATED */}
              {footerLinks.map((section) => (
                <div key={section.title} className="flex flex-col gap-4 min-w-[140px]">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C1440E] border-b border-[#C1440E]/30 pb-2 mb-2 w-fit">
                    {section.title}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        {link.type === 'href' ? (
                          <Link
                            href={link.href}
                            className="text-[10px] uppercase tracking-widest text-[#C1440E] hover:text-white transition-all text-left group flex items-center gap-2"
                          >
                            <span className="w-0 group-hover:w-2 h-[1px] bg-white transition-all duration-300" />
                            {link.label}
                          </Link>
                        ) : (
                          <button
                            onClick={() => openFile(link.key)}
                            className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-all text-left group flex items-center gap-2"
                          >
                            <span className="w-0 group-hover:w-2 h-[1px] bg-[#C1440E] transition-all duration-300" />
                            {link.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="hidden lg:block w-72 h-56 border border-[#C1440E]/30 bg-[#000] relative overflow-hidden group">
              <OrbitalRadar />
            </div>
          </div>
          {/* ... Bottom Bar ... */}

          {/* BOTTOM */}
          <div className="mt-24 flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-t border-white/10 pt-8">
            <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-white/30 font-mono">
              <span className="text-white font-bold">© 2050 The 546 Project | Aakash SE</span>

              <span className="text-[#C1440E]">//</span>
              <span className="text-[#C1440E] animate-pulse">{telemetryData[telemetryIndex]}</span>
            </div>

            <div className="flex gap-6">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target={social.name === "Comms" ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.name}`}
                  className="text-[9px] uppercase tracking-widest font-bold text-white/50 hover:text-[#C1440E] transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes rover-drive-slow {
             0% { transform: translateX(-5vw); }
             100% { transform: translateX(105vw); }
          }
          .animate-rover-drive-slow {
             animation: rover-drive-slow 50s linear infinite;
          }
           @keyframes scan-beam {
             0%, 100% { opacity: 0.3; transform: translateY(-50%) rotate(0deg); }
             50% { opacity: 0.6; transform: translateY(-50%) rotate(-5deg); }
          }
          .animate-scan-beam {
             animation: scan-beam 2s ease-in-out infinite;
          }
        `}</style>
      </footer >
    </>
  );
}