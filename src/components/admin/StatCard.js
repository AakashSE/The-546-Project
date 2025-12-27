"use client";
import React from 'react';

export default function StatCard({ title, value, icon, trend }) {
    return (
        <div className="p-6 bg-white/5 border border-white/10 relative overflow-hidden group hover:border-[#C1440E]/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-4xl text-white">{icon}</span>
            </div>

            <h3 className="text-[10px] uppercase tracking-widest text-[#C1440E] mb-2 font-bold">
                {title}
            </h3>

            <div className="text-3xl font-black text-white tracking-tight mb-2">
                {value}
            </div>

            {trend && (
                <div className="text-[9px] text-white/40 font-mono">
                    <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
                        {trend > 0 ? "+" : ""}{trend}%
                    </span>
                    {" "} FROM LAST SOL
                </div>
            )}
        </div>
    );
}
