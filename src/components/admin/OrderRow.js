"use client";
import React, { useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { generateTicket } from '../../utils/generateTicket';
import Image from 'next/image';

const STATUS_COLORS = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    paid: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
    shipped: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    delivered: 'bg-green-500/10 text-green-500 border-green-500/30',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
};

export default function OrderRow({ order, refreshData }) {
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        if (!confirm(`Update status to ${newStatus.toUpperCase()}?`)) return;
        setUpdating(true);

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', order.id);

        if (error) {
            alert('Status update failed');
        } else {
            refreshData();
        }
        setUpdating(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors">
            <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6 pb-6 border-b border-white/10">

                {/* INFO */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white uppercase tracking-widest">
                            {order.id.slice(0, 8)}...
                        </span>
                        <div className={`px-2 py-0.5 text-[9px] uppercase font-bold border rounded-full ${STATUS_COLORS[order.status] || 'text-white border-white/30'}`}>
                            {order.status}
                        </div>
                    </div>
                    <div className="text-[10px] text-white/40 uppercase font-mono">
                        {new Date(order.created_at).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase font-mono">
                        User: {order.user_id ? order.user_id.slice(0, 8) + '...' : 'GUEST'}
                    </div>
                </div>

                {/* SHIPPING INFO */}
                <div className="text-right">

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => generateTicket(order, order.order_items || [])}
                            className="px-2 py-1 text-[8px] uppercase font-bold border border-[#C1440E] text-[#C1440E] hover:bg-[#C1440E] hover:text-black transition-all"
                        >
                            PRINT TOKEN
                        </button>
                        {['pending', 'paid', 'shipped', 'delivered'].map((s) => (
                            <button
                                key={s}
                                disabled={updating || order.status === s}
                                onClick={() => handleStatusChange(s)}
                                className={`px-2 py-1 text-[8px] uppercase font-bold border transition-all
                                    ${order.status === s
                                        ? 'bg-white text-black border-white cursor-default'
                                        : 'text-white/30 border-white/10 hover:border-white/50 hover:text-white'
                                    }
                                `}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* DETAILS */}
            <div className="grid gap-4">
                {/* ADDRESS */}
                <div className="p-3 bg-black/30 text-[10px] font-mono text-white/70">
                    <span className="text-[#C1440E]">DESTINATION:</span> {JSON.stringify(order.shipping_address)}
                </div>

                {/* ITEMS */}
                <div className="space-y-2">
                    {order.order_items && order.order_items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-black/20 p-2">
                            <div className="w-8 h-8 relative bg-white/5">
                                {item.image_url && <Image src={item.image_url} alt="img" fill className="object-cover" />}
                            </div>
                            <div className="flex-1 text-xs">
                                <span className="text-white font-bold">{item.product_name}</span>
                                <span className="text-white/40 ml-2">x{item.quantity}</span>
                                <span className="text-[#C1440E] ml-2 text-[10px] uppercase">[{item.selected_color} / {item.selected_size || 'STD'}]</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-right text-lg font-bold text-[#C1440E]">
                    TOTAL: ₹{parseFloat(order.total_amount).toLocaleString()}
                </div>
            </div>
        </div>
    );
}
