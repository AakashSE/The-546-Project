"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabase/client';
import StatCard from '../../components/admin/StatCard';
import SalesChart from '../../components/admin/SalesChart';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0
    });
    const [chartData, setChartData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Fetch Orders
            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, total_amount, status, created_at, user_id')
                .order('created_at', { ascending: false });

            if (orders) {
                const totalRev = orders.reduce((acc, order) => acc + (parseFloat(order.total_amount) || 0), 0);
                const pending = orders.filter(o => o.status === 'pending').length;

                setStats({
                    totalRevenue: totalRev,
                    totalOrders: orders.length,
                    pendingOrders: pending
                });
                setRecentOrders(orders.slice(0, 5));

                // Process Data for Chart
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"
                }).reverse();

                // Group orders by date (simplified)
                const salesByDate = orders.reduce((acc, order) => {
                    const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' });
                    acc[date] = (acc[date] || 0) + (parseFloat(order.total_amount) || 0);
                    return acc;
                }, {});

                // Map to chart format (if no real data, pass empty array to let generic dummy data take over)
                // Actually, let's mix real data if available, or just pass empty if total is 0
                if (orders.length > 0) {
                    const realChartData = last7Days.map(date => ({
                        date,
                        value: salesByDate[date] || 0
                    }));
                    setChartData(realChartData);
                } else {
                    setChartData([]); // Triggers simulation
                }
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <div className="text-xs uppercase tracking-widest text-white/50 animate-pulse">Loading Telemetry...</div>;

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Command Overview</h2>
                <p className="text-xs text-white/50 font-mono uppercase tracking-widest">System Status: OPERATIONAL</p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon="₹"
                    trend={12}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon="📦"
                    trend={5}
                />
                <StatCard
                    title="Pending Dispatch"
                    value={stats.pendingOrders}
                    icon="⏳"
                // No trend for now
                />
            </div>

            {/* ANALYTICS CHART */}
            <SalesChart data={chartData} />

            {/* RECENT ACTIVITY */}
            <div className="border border-white/10 bg-white/5">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">Recent Transmissions</h3>
                    <Link href="/admin/orders" className="text-[10px] text-[#C1440E] uppercase hover:text-white transition-colors">
                        View All Transmissions &rarr;
                    </Link>
                </div>

                <div className="divide-y divide-white/10">
                    {recentOrders.map(order => (
                        <div key={order.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                            <div>
                                <div className="text-xs font-bold text-white mb-1">
                                    {order.id.slice(0, 8)}...
                                </div>
                                <div className="text-[10px] text-white/40 uppercase font-mono">
                                    {new Date(order.created_at).toLocaleDateString()} // {order.status}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-[#C1440E]">
                                    ₹{parseFloat(order.total_amount).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    {recentOrders.length === 0 && (
                        <div className="p-8 text-center text-[10px] text-white/30 uppercase tracking-widest">
                            No data found in sector.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
