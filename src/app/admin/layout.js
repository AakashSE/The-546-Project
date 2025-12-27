"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminBackground from '../../components/admin/AdminBackground';

export default function AdminLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            if (!user) return; // Wait for user

            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data?.role === 'admin') {
                setIsAdmin(true);
            } else {
                router.push('/'); // Redirect unauthorized
            }
            setIsChecking(false);
        };

        if (!loading) {
            if (!user) {
                router.push('/');
            } else {
                checkRole();
            }
        }
    }, [user, loading, router]);

    if (loading || isChecking) {
        return (
            <div className="w-full h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-mono gap-4">
                <div className="w-16 h-16 border border-[#C1440E] border-t-transparent rounded-full animate-spin" />
                <div className="text-xs uppercase tracking-[0.3em] text-[#C1440E] animate-pulse">
                    Verifying Clearance...
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen text-white font-mono flex relative">
            <AdminBackground />
            <div className="z-10 relative flex w-full">
                <AdminSidebar />
                <main className="flex-1 ml-64 p-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
