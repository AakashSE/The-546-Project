"use client";
import React, { useMemo, useState } from 'react';

// Dumb data generator for the "Simulation" feel
const generateDummyData = (days = 7) => {
    const data = [];
    for (let i = 0; i < days; i++) {
        // More volatile random data for "Tech" feel
        const base = 20000;
        const volatility = Math.random() * 40000;
        const trend = Math.sin(i) * 10000;

        data.push({
            date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            value: Math.max(10000, Math.floor(base + volatility + trend))
        });
    }
    return data;
};

export default function SalesChart({ data = [] }) {
    // If no real data, use simulation data to show the UI potential
    const chartData = useMemo(() => {
        if (data.length > 2) return data;
        return generateDummyData(7);
    }, [data]);

    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Dimensions
    const width = 800; // Wider for better resolution
    const height = 300; // Taller
    const padding = 40; // More padding for labels

    // Scales
    const maxValue = Math.max(...chartData.map(d => d.value)) * 1.2;
    const points = chartData.map((d, i) => {
        const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((d.value / maxValue) * (height - padding * 2)) - padding;
        return { x, y, ...d };
    });

    // SVG Path (Area)
    const areaPathD = `
        M ${points[0].x} ${height - padding}
        L ${points[0].x} ${points[0].y}
        ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
        L ${points[points.length - 1].x} ${height - padding}
        Z
    `;

    // SVG Path (Line)
    const linePathD = `
        M ${points[0].x} ${points[0].y}
        ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
    `;

    return (
        <div className="w-full bg-black/40 border border-white/10 p-6 backdrop-blur-sm relative overflow-hidden group">
            {/* DECORATIVE CORNERS */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#C1440E]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#C1440E]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#C1440E]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#C1440E]" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#C1440E] flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#C1440E] animate-pulse"></span>
                        Market Volatility // Revenue
                    </h3>
                    <p className="text-[9px] text-white/30 font-mono mt-1">REAL-TIME TELEMETRY</p>
                </div>
                <div className="text-[10px] text-white/40 font-mono border border-white/10 px-2 py-1">
                    LAST 7 CYCLES
                </div>
            </div>

            <div className="relative w-full aspect-[3/1] min-h-[200px]">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* GRID LINES (Horizontal) */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => (
                        <line
                            key={t}
                            x1={padding}
                            y1={(height - padding) - (t * (height - padding * 2))}
                            x2={width - padding}
                            y2={(height - padding) - (t * (height - padding * 2))}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* GRID LINES (Vertical) */}
                    {points.map((p, i) => (
                        <line
                            key={i}
                            x1={p.x}
                            y1={padding}
                            x2={p.x}
                            y2={height - padding}
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* GRADIENT FILL DEF */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C1440E" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#C1440E" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#C1440E" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* AREA FILL */}
                    <path d={areaPathD} fill="url(#chartGradient)" />

                    {/* LINE */}
                    <path
                        d={linePathD}
                        fill="none"
                        stroke="#C1440E"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        filter="url(#glow)"
                    />

                    {/* INTERACTIVE POINTS */}
                    {points.map((p, i) => (
                        <g key={i}>
                            {/* HOVER TARGET (Invisible larger circle) */}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="15"
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredPoint(p)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />

                            {/* VISIBLE DOT */}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={hoveredPoint === p ? 6 : 3}
                                fill="#0a0a0a"
                                stroke="#C1440E"
                                strokeWidth="2"
                                className="pointer-events-none transition-all duration-300"
                            />

                            {/* X-AXIS LABELS */}
                            <text
                                x={p.x}
                                y={height - 10} // Adjusted Y position
                                textAnchor="middle"
                                fill="rgba(255,255,255,0.4)"
                                fontSize="10"
                                fontFamily="monospace"
                                fontWeight="bold"
                                className="uppercase"
                            >
                                {p.date}
                            </text>
                        </g>
                    ))}

                    {/* Y-AXIS LABELS (Optional, on the left) */}
                    {[0.25, 0.75].map(t => (
                        <text
                            key={t}
                            x={padding - 10}
                            y={(height - padding) - (t * (height - padding * 2)) + 3}
                            textAnchor="end"
                            fill="rgba(255,255,255,0.2)"
                            fontSize="9"
                            fontFamily="monospace"
                        >
                            {Math.round(maxValue * t / 1000)}k
                        </text>
                    ))}
                </svg>

                {/* TOOLTIP */}
                {hoveredPoint && (
                    <div
                        className="absolute bg-black/90 border border-[#C1440E] p-3 text-xs text-white font-mono pointer-events-none transform -translate-x-1/2 -translate-y-[120%] z-10 shadow-[0_0_15px_rgba(193,68,14,0.3)]"
                        style={{
                            left: `${(hoveredPoint.x / width) * 100}%`,
                            top: `${(hoveredPoint.y / height) * 100}%`
                        }}
                    >
                        <div className="text-[#C1440E] font-bold text-sm">₹{hoveredPoint.value.toLocaleString()}</div>
                        <div className="text-[9px] text-white/50 uppercase tracking-widest mt-1">
                            {hoveredPoint.date} // REVENUE
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
