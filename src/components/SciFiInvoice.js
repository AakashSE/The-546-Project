import React, { forwardRef } from 'react';
import Image from 'next/image';

const SciFiInvoice = forwardRef(({ order, user }, ref) => {
    if (!order) return null;

    // Helper: Random ID Gen for fluff
    const randomHex = () => Math.floor(Math.random() * 16777215).toString(16).toUpperCase();

    // Parse Address
    let shipping = {};
    try {
        shipping = typeof order.shipping_address === 'string'
            ? JSON.parse(order.shipping_address)
            : order.shipping_address || {};
    } catch (e) {
        shipping = {};
    }

    // Path Logic: Use "Flat Lay.png" for invoice consistency
    const getFlatLayParam = (url) => {
        if (!url) return null;
        return url.substring(0, url.lastIndexOf('/')) + '/Flat Lay.png';
    };

    return (
        <div ref={ref} className="w-[1123px] h-[1587px] bg-[#020202] text-white relative overflow-hidden flex flex-col font-sans">

            {/* STYLES FOR SCANLINES & FONTS */}
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Outfit:wght@300;400;600;900&display=swap');
                .font-brand { font-family: 'Outfit', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }
                .scanline {
                    background: linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.02) 50%);
                    background-size: 100% 4px;
                }
            `}</style>

            {/* --- LAYERS: BACKGROUND VISUALS --- */}
            <div className="absolute inset-0 scanline opacity-40 pointer-events-none" />

            {/* Base Grid */}
            <div className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
                    backgroundSize: '80px 80px'
                }}
            />

            {/* Giant Distant Mars Glyph */}
            <div className="absolute -left-[300px] -bottom-[200px] w-[900px] h-[900px] opacity-[0.03] pointer-events-none select-none">
                <Image src="/assets/Logo.svg" alt="" fill className="object-contain invert brightness-50" />
            </div>

            {/* Side Margins (Rulers) */}
            <div className="absolute top-0 bottom-0 left-0 w-12 border-r border-white/10 flex flex-col justify-between py-12 items-center text-[7px] text-white/20 font-mono tracking-tighter">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <span className="opacity-50">{1600 - (i * 40)}</span>
                        <div className="w-4 h-[1px] bg-white/20" />
                    </div>
                ))}
            </div>

            {/* --- CONTENT LAYER --- */}
            <div className="pl-24 pr-20 py-20 h-full flex flex-col relative z-10">

                {/* HEADER SECTION */}
                <div className="flex justify-between items-start mb-20 border-b border-white/10 pb-12">
                    <div className="space-y-6">
                        {/* Logo: Fixed Aspect Ratio for 425x100 SVG */}
                        <div className="w-[340px] h-[80px] relative">
                            <Image src="/assets/Logo.svg" alt="Mars Logo" fill className="object-contain object-left invert brightness-200" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-0.5 w-12 bg-[#C1440E]" />
                            <h1 className="font-brand text-5xl font-black uppercase tracking-[0.1em] text-white">
                                Supply Manifest
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-6">
                        <div className="text-right">
                            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C1440E] mb-2 font-inter">Reference Authorization</div>
                            <div className="text-4xl font-brand font-black tracking-widest text-[#00FFFF] drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                                {order.id.slice(0, 10).toUpperCase()}
                            </div>
                        </div>
                        <div className="flex gap-6 text-[9px] font-mono uppercase text-white/40 border-t border-white/5 pt-4">
                            <div className="flex flex-col items-end">
                                <span className="text-white/20">Solar Cycle</span>
                                <span className="text-white">{new Date(order.created_at).toLocaleDateString().toUpperCase()}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-white/20">Relay Node</span>
                                <span className="text-white">SECTOR_7G_{randomHex()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SCHEMATIC DATA GRID */}
                <div className="grid grid-cols-2 gap-12 mb-20">
                    {/* Origin Section */}
                    <div className="relative group">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-[#C1440E]/30" />
                        <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#C1440E] mb-3">Origin Node [A1]</div>
                        <h3 className="font-brand text-2xl font-black uppercase text-white/90 mb-4">Mars Headquarters</h3>
                        <div className="space-y-2 text-xs font-inter text-white/50 uppercase leading-relaxed tracking-widest">
                            <p className="flex justify-between"><span>Region:</span> <span className="text-white">Tharsis Montes</span></p>
                            <p className="flex justify-between"><span>Quadrant:</span> <span className="text-white">Delta Prime</span></p>
                            <p className="flex justify-between"><span>Atmosphere:</span> <span className="text-white">Pressurized</span></p>
                            <p className="flex justify-between"><span>Uplink:</span> <span className="text-[#C1440E]">SECURE_ALPHA</span></p>
                        </div>
                    </div>

                    {/* Destination Section */}
                    <div className="relative group">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-[#00FFFF]/30" />
                        <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#00FFFF] mb-3">Recipient Node [B2]</div>
                        <h3 className="font-brand text-2xl font-black uppercase text-white/90 mb-4">
                            {shipping.fullName || user?.user_metadata?.full_name || "Terran Operative"}
                        </h3>
                        <div className="space-y-2 text-xs font-inter text-white/50 uppercase leading-relaxed tracking-widest">
                            <p className="flex justify-between"><span>Sector:</span> <span className="text-white">{shipping.address_line1 || "Unknown"}</span></p>
                            <p className="flex justify-between"><span>Zone:</span> <span className="text-white">{shipping.city || "Grid 404"} // {shipping.zip_code}</span></p>
                            <p className="flex justify-between"><span>Planet:</span> <span className="text-white">{shipping.country || "Earth"}</span></p>
                            <p className="flex justify-between"><span>Status:</span> <span className="text-[#00FFFF]">TRANSIT_READY</span></p>
                        </div>
                    </div>
                </div>

                {/* TABLE HEADER */}
                <div className="flex items-center bg-white/[0.03] border-y border-white/10 py-4 mb-6 px-4">
                    <div className="w-24 text-[9px] font-black uppercase tracking-widest text-white/30">Asset</div>
                    <div className="flex-1 text-[9px] font-black uppercase tracking-widest text-[#00FFFF] pl-8">Manifest Designation</div>
                    <div className="w-28 text-center text-[9px] font-black uppercase tracking-widest text-white/30">Spec</div>
                    <div className="w-20 text-center text-[9px] font-black uppercase tracking-widest text-white/30">Qty</div>
                    <div className="w-40 text-right text-[9px] font-black uppercase tracking-widest text-white/30">Valuation</div>
                </div>

                {/* ASSET LIST */}
                <div className="flex-1 space-y-4">
                    {order.order_items.map((item, i) => (
                        <div key={i} className="flex items-center bg-white/[0.02] border border-white/5 h-32 px-4 transition-all hover:bg-white/[0.05]">
                            <div className="w-24 h-24 relative bg-black border border-white/10 rounded-sm">
                                {item.image_url && (
                                    <Image
                                        src={getFlatLayParam(item.image_url)}
                                        alt={item.product_name}
                                        fill
                                        className="object-contain p-2 mix-blend-screen opacity-90"
                                    />
                                )}
                            </div>
                            <div className="flex-1 pl-8">
                                <span className="font-brand text-2xl font-black uppercase tracking-tighter text-white">
                                    {item.product_name}
                                </span>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="text-[8px] font-bold bg-white/10 px-2 py-0.5 text-white/60 tracking-widest uppercase">CAT: LUXURY_CORE</div>
                                    <div className="text-[8px] font-bold bg-[#C1440E]/20 px-2 py-0.5 text-[#C1440E] tracking-widest uppercase">ID: {randomHex()}</div>
                                </div>
                            </div>
                            <div className="w-28 flex justify-center">
                                <div className="text-[10px] font-bold text-[#00FFFF] border border-[#00FFFF]/30 px-3 py-1 bg-[#00FFFF]/5 rounded-sm">
                                    {item.selected_color || "STANDARD"}
                                </div>
                            </div>
                            <div className="w-20 text-center font-brand font-black text-2xl text-white/80">
                                {item.quantity}
                            </div>
                            <div className="w-40 text-right font-brand font-black text-3xl tracking-tighter text-white">
                                ₹{((item.price_at_purchase || item.price || 0) * item.quantity).toLocaleString()}
                            </div>
                        </div>
                    ))}

                    {/* Filling the space if few items */}
                    <div className="h-full border-l border-dashed border-white/10 ml-12 opacity-50" />
                </div>

                {/* TOTALS & AUTHENTICATION */}
                <div className="mt-auto border-t border-white/10 pt-16 grid grid-cols-2 items-end">
                    {/* Authentication Stamp */}
                    <div className="relative">
                        <div className="w-64 h-64 border-2 border-[#C1440E]/30 rounded-full flex flex-col items-center justify-center -rotate-12 opacity-40">
                            <div className="text-[10px] uppercase font-bold text-[#C1440E] tracking-[0.5em] mb-2">Authenticated</div>
                            <div className="font-brand text-3xl font-black uppercase text-white tracking-widest">Mars Ops</div>
                            <div className="w-32 h-[1px] bg-white/20 my-2" />
                            <div className="text-[8px] font-mono text-white/50 tracking-widest">VERIFIED_HASH_{randomHex()}</div>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end pb-8">
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.5em]">
                                Clearance Level 5 // Cmdr. Shepard // ID: N7-SITE-MARS
                            </p>
                        </div>
                    </div>

                    {/* Totals Frame */}
                    <div className="bg-white/[0.04] p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-[#00FFFF]/50" />
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                                <span>Sub-Manifest Value (74%)</span>
                                <span className="text-white">₹{(parseFloat(order.total_amount) * 0.74).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                                <span>Transit Taxation (26%)</span>
                                <span className="text-white">₹{(parseFloat(order.total_amount) * 0.26).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-8 border-t border-white/20">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00FFFF]">Total Transfer</span>
                                <span className="text-[8px] font-mono text-white/30 uppercase mt-1">Currency: Credits [INR]</span>
                            </div>
                            <span className="text-[64px] font-brand font-black tracking-tighter text-white">
                                ₹{parseFloat(order.total_amount).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-between items-center text-[8px] font-mono text-white/20 uppercase tracking-[0.5em]">
                    <span>The 546 Project // Terminal: {randomHex()}</span>
                    <span>Mars Colony I // Jezero District Logistics</span>
                </div>
            </div>
        </div>
    );
});

SciFiInvoice.displayName = "SciFiInvoice";
export default SciFiInvoice;

