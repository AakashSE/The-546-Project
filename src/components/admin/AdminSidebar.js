"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const router = useRouter();

    const links = [
        { name: 'Overview', path: '/admin', icon: '⊞' },
        { name: 'Orders', path: '/admin/orders', icon: '☰' },
        { name: 'Inventory', path: '/admin/inventory', icon: '◈' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <aside className="w-64 border-r border-white/10 bg-black/90 h-screen flex flex-col fixed left-0 top-0 z-50">
            <div className="p-8 border-b border-white/10">
                <Link href="/" className="block">
                    <h1 className="text-xl font-bold tracking-[0.2em] text-white">
                        546 <span className="text-[#C1440E]">ADMIN</span>
                    </h1>
                    <div className="text-[9px] text-white/40 uppercase tracking-widest mt-1">
                        Secure Uplink // 894
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-6 space-y-4">
                {links.map((link) => {
                    const isActive = pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            href={link.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-sm transition-all group relative overflow-hidden
                                ${isActive ? 'bg-[#C1440E]/10 text-white border border-[#C1440E]/30' : 'text-white/50 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 h-full w-[2px] bg-[#C1440E]" />
                            )}
                            <span className="text-lg font-mono">{link.icon}</span>
                            <span className="text-xs uppercase tracking-widest font-bold">
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-white/5 rounded-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest text-[#C1440E]">System Online</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full py-3 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                    Terminate Session
                </button>
            </div>
        </aside>
    );
}
