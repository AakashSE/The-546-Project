"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase/client';
import OrderRow from '../../../components/admin/OrderRow';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .order('created_at', { ascending: false });

        if (data) setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return <div className="text-white/50 animate-pulse uppercase tracking-widest text-xs">Loading Orders...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Transmission Log</h2>
                    <p className="text-xs text-white/50 font-mono uppercase tracking-widest">
                        Manage supply drops and shipment statuses.
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="text-[10px] uppercase font-bold text-cyan-500 hover:text-white transition-colors"
                >
                    Refresh Data ↻
                </button>
            </div>

            <div className="grid gap-6">
                {orders.map(order => (
                    <OrderRow key={order.id} order={order} refreshData={fetchOrders} />
                ))}
            </div>

            {orders.length === 0 && (
                <div className="py-20 text-center text-white/30 uppercase tracking-widest text-sm">
                    No orders in database.
                </div>
            )}
        </div>
    );
}
