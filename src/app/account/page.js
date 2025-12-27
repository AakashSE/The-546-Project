"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SciFiInvoice from "../../components/SciFiInvoice";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabase/client";
import EmptyState from "../../components/EmptyState";

export default function AccountPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
            return;
        }

        if (user) {
            fetchOrders();
        }
    }, [user, authLoading]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    created_at,
                    total_amount,
                    status,
                    shipping_address,
                    order_items (
                        product_name,
                        quantity,
                        selected_color,
                        price:price_at_purchase,
                        image_url
                    )

                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error("Error fetching orders:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    // INVOICE LOGIC
    const invoiceRef = useRef(null);
    const [downloadingOrderId, setDownloadingOrderId] = useState(null);
    // Use a separate state for the invoice data to ensure it renders before capture
    const [invoiceData, setInvoiceData] = useState(null);

    const handleDownloadInvoice = async (order) => {
        setDownloadingOrderId(order.id);
        setInvoiceData(order);

        // Wait for render
        setTimeout(async () => {
            const element = invoiceRef.current;
            if (!element) return;

            try {
                const canvas = await html2canvas(element, {
                    backgroundColor: "#000000",
                    scale: 4, // 4x scale for extreme precision
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    imageTimeout: 15000
                });
                const imgData = canvas.toDataURL('image/png', 1.0);

                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

                pdf.save(`MARS_MANIFEST_${order.id.slice(0, 8)}.pdf`);
            } catch (err) {
                console.error("Invoice Gen Failed", err);
                alert("MANIFEST GENERATION FAILED");
            }
            setDownloadingOrderId(null);
            setInvoiceData(null);
        }, 500);
    };

    // ADDRESS LOGIC
    const [addresses, setAddresses] = useState([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null); // New state for editing
    const [newAddress, setNewAddress] = useState({ full_name: '', address_line1: '', city: '', zip_code: '' });

    const fetchAddresses = async () => {
        const { data } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: true });
        setAddresses(data || []);
    };

    // PROFILE EDIT LOGIC
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState("");

    const startEditingProfile = () => {
        setProfileName(user?.user_metadata?.full_name || "");
        setIsEditingProfile(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: { full_name: profileName }
            });

            if (error) throw error;
            setIsEditingProfile(false);
            // Optional: User feedback or Toast could go here
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("UPDATE FAILED");
        }
    };

    // ... existing save/edit/delete handlers ...

    const handleSetDefault = async (id) => {
        // Optimistic update
        setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));

        // 1. Reset all
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);

        // 2. Set new default
        const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);

        if (!error) {
            fetchAddresses();
        } else {
            alert("FAILED TO SET DEFAULT SECTOR");
            fetchAddresses(); // Revert
        }
    };

    // ... inside render ...
    addresses.map(addr => (
        <div key={addr.id} className={`group/addr relative text-xs border-l-2 ${addr.is_default ? 'border-yellow-500 bg-yellow-500/5' : 'border-cyan-500'} pl-3 pr-24 py-2 hover:bg-white/5 transition-colors`}>
            <div className="flex items-center gap-2 mb-1">
                <div className="font-bold text-white">{addr.address_line1}</div>
                {addr.is_default && <span className="text-[9px] bg-yellow-500 text-black px-1 font-bold">DEFAULT</span>}
            </div>
            <div className="text-white/50">{addr.city} // {addr.zip_code}</div>

            {/* Action Buttons */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/addr:opacity-100 flex gap-2 transition-opacity bg-black/80 p-1 rounded backdrop-blur-sm z-10">
                {!addr.is_default && (
                    <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[9px] uppercase font-bold text-yellow-500 hover:text-white px-2 py-1 border border-yellow-500/30 hover:border-yellow-500"
                    >
                        Set Def
                    </button>
                )}
                <button
                    onClick={() => handleEditAddress(addr)}
                    className="text-[9px] uppercase font-bold text-cyan-500 hover:text-white px-2 py-1 border border-cyan-500/30 hover:border-cyan-500"
                >
                    Edit
                </button>
                <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-[9px] uppercase font-bold text-red-500 hover:text-white px-2 py-1 border border-red-500/30 hover:border-red-500"
                >
                    Del
                </button>
            </div>
        </div>
    ))

    const handleSaveAddress = async (e) => {
        e.preventDefault();

        let error;
        if (editingAddressId) {
            // Update existing
            const { error: updateError } = await supabase
                .from('addresses')
                .update({ ...newAddress })
                .eq('id', editingAddressId)
                .eq('user_id', user.id);
            error = updateError;
        } else {
            // Insert new
            const { error: insertError } = await supabase
                .from('addresses')
                .insert([{ user_id: user.id, ...newAddress }]);
            error = insertError;
        }

        if (!error) {
            setIsAddingAddress(false);
            setEditingAddressId(null);
            setNewAddress({ full_name: '', address_line1: '', city: '', zip_code: '' });
            fetchAddresses();
        } else {
            alert("COORDINATE UPDATE FAILED");
            console.error(error);
        }
    };

    const handleEditAddress = (addr) => {
        setNewAddress({
            full_name: addr.full_name || '',
            address_line1: addr.address_line1 || '',
            city: addr.city || '',
            zip_code: addr.zip_code || ''
        });
        setEditingAddressId(addr.id);
        setIsAddingAddress(true);
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm("Confirm sector deletion?")) return;

        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (!error) {
            fetchAddresses();
        } else {
            alert("DELETION FAILED");
        }
    };

    const cancelEdit = () => {
        setIsAddingAddress(false);
        setEditingAddressId(null);
        setNewAddress({ full_name: '', address_line1: '', city: '', zip_code: '' });
    };

    // RANK LOGIC
    const getRank = () => {
        const count = orders.length;
        if (count > 5) return { title: "Commander", color: "text-[#C1440E]", icon: "★" };
        if (count > 0) return { title: "Colonist", color: "text-cyan-500", icon: "●" };
        return { title: "Civilian", color: "text-white/50", icon: "○" };
    };
    const rank = getRank();

    if (authLoading || loading) {
        return (
            <div className="w-full h-screen bg-[#050505] flex items-center justify-center text-white font-mono">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs uppercase tracking-[0.2em] animate-pulse">Accessing Secure Archives...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-cyan-500/30">
            <Header theme="dark" />

            <main className="pt-32 px-6 md:px-12 max-w-7xl mx-auto pb-24">

                {/* PROFILE HEADER */}
                <div className="flex flex-col md:flex-row items-end justify-between border-b border-white/10 pb-8 mb-12 gap-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                            Command Center
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-[#888] tracking-[0.1em]">
                            <span className="text-cyan-500">OPERATIVE_ID:</span>
                            <span>{user?.id?.slice(0, 8).toUpperCase()}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-cyan-500">CLASS:</span>
                            <span className={`font-bold ${rank.color}`}>{rank.title}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/'); }}
                        className="px-6 py-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        Abort Session
                    </button>
                </div>

                {/* DASHBOARD GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">

                    {/* LEFT: PROFILE DATA */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Details Card */}
                        <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500 opacity-50" />

                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs uppercase tracking-widest text-cyan-500">Operative Details</h3>
                                {!isEditingProfile && (
                                    <button
                                        onClick={startEditingProfile}
                                        className="text-[9px] font-bold uppercase text-white/50 hover:text-cyan-500 transition-colors"
                                    >
                                        [ EDIT ID ]
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase block mb-1">Full Name</label>
                                    {isEditingProfile ? (
                                        <form onSubmit={handleUpdateProfile} className="flex gap-2 animate-in fade-in">
                                            <input
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                className="flex-1 bg-black/50 border border-white/20 p-1 px-2 text-sm font-bold text-white focus:border-cyan-500 outline-none"
                                                autoFocus
                                            />
                                            <button
                                                type="submit"
                                                className="px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold uppercase hover:bg-white transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingProfile(false)}
                                                className="px-2 py-1 border border-white/20 text-white/50 text-[10px] font-bold uppercase hover:text-white"
                                            >
                                                X
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="text-lg font-bold">{user?.user_metadata?.full_name || "Unknown"}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase block mb-1">Comms Frequency</label>
                                    <div className="text-lg font-bold">{user?.email}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase block mb-1">Clearance Level</label>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase rounded-full">
                                        <span className={rank.color}>{rank.icon}</span>
                                        {rank.title} Clearance
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drop Coordinates */}
                        <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm relative group">
                            <h3 className="text-xs uppercase tracking-widest text-cyan-500 mb-6">Drop Coordinates</h3>

                            {/* Address List */}
                            <div className="space-y-4 mb-6">
                                {addresses.length === 0 ? (
                                    <p className="text-xs text-white/70 leading-relaxed italic opacity-50">
                                        "No default sector coordinates established."
                                    </p>
                                ) : (
                                    addresses.map(addr => (
                                        <div key={addr.id} className="group/addr relative text-xs border-l-2 border-cyan-500 pl-3 pr-24 py-2 hover:bg-white/5 transition-colors">
                                            <div className="font-bold text-white mb-1">{addr.address_line1}</div>
                                            <div className="text-white/50">{addr.city} // {addr.zip_code}</div>

                                            {/* Action Buttons */}
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/addr:opacity-100 flex gap-2 transition-opacity bg-black/80 p-1 rounded backdrop-blur-sm">
                                                <button
                                                    onClick={() => handleEditAddress(addr)}
                                                    className="text-[9px] uppercase font-bold text-cyan-500 hover:text-white px-2 py-1 border border-cyan-500/30 hover:border-cyan-500"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                    className="text-[9px] uppercase font-bold text-red-500 hover:text-white px-2 py-1 border border-red-500/30 hover:border-red-500"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add/Edit Address Logic */}
                            {isAddingAddress ? (
                                <form onSubmit={handleSaveAddress} className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="text-[10px] text-cyan-500 font-bold uppercase mb-1">
                                        {editingAddressId ? 'Update Sector' : 'New Sector'}
                                    </div>
                                    <input
                                        required
                                        title={newAddress.address_line1 ? "" : "SECTOR COORDINATES REQUIRED"}
                                        onInvalid={(e) => e.target.setCustomValidity('SECTOR COORDINATES REQUIRED')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                        placeholder="Sector / Street"
                                        value={newAddress.address_line1}
                                        onChange={e => { setNewAddress({ ...newAddress, address_line1: e.target.value }); e.target.setCustomValidity(''); }}
                                        className="w-full bg-black/50 border border-white/20 p-2 text-xs text-white focus:border-cyan-500 outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            required
                                            title={newAddress.city ? "" : "GRID/CITY REQUIRED"}
                                            onInvalid={(e) => e.target.setCustomValidity('GRID/CITY REQUIRED')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            placeholder="City"
                                            value={newAddress.city}
                                            onChange={e => { setNewAddress({ ...newAddress, city: e.target.value }); e.target.setCustomValidity(''); }}
                                            className="w-full bg-black/50 border border-white/20 p-2 text-xs text-white focus:border-cyan-500 outline-none"
                                        />
                                        <input
                                            required
                                            title={newAddress.zip_code ? "" : "ZONE CODE REQUIRED"}
                                            onInvalid={(e) => e.target.setCustomValidity('ZONE CODE REQUIRED')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            placeholder="Zip"
                                            value={newAddress.zip_code}
                                            onChange={e => { setNewAddress({ ...newAddress, zip_code: e.target.value }); e.target.setCustomValidity(''); }}
                                            className="w-20 bg-black/50 border border-white/20 p-2 text-xs text-white focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 py-2 bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors">
                                            {editingAddressId ? 'Update Grid' : 'Save Grid'}
                                        </button>
                                        <button onClick={cancelEdit} type="button" className="px-3 py-2 border border-white/20 text-[10px] font-bold uppercase hover:bg-white/10">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => {
                                        setEditingAddressId(null);
                                        setNewAddress({ full_name: '', address_line1: '', city: '', zip_code: '' });
                                        setIsAddingAddress(true);
                                    }}
                                    className="text-[10px] uppercase font-bold border-b border-cyan-500 text-cyan-500 pb-0.5 hover:text-white hover:border-white transition-colors"
                                >
                                    + Establish Safehouse
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: MISSION LOG (ORDERS) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs uppercase tracking-widest text-cyan-500">Mission Log ({orders.length})</h3>
                            <div className="h-[1px] flex-1 bg-white/10 ml-4" />
                        </div>

                        {orders.length === 0 ? (
                            <EmptyState type="search" message="NO MISSIONS RECORDED" />
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="border border-white/10 bg-black/50 hover:bg-white/5 transition-colors p-6 group">

                                        {/* Order Header */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-white/40 uppercase">Mission ID</div>
                                                <div className="font-mono text-xs text-white/70">{order.id.slice(0, 8)}...</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-white/40 uppercase">Date</div>
                                                <div className="font-mono text-xs text-white/70">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-white/40 uppercase">Total</div>
                                                <div className="font-bold text-cyan-500">₹{parseFloat(order.total_amount).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border 
                                                    ${order.status === 'paid' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'}
                                                `}>
                                                    {order.status || 'Pending'}
                                                </span>
                                                <button
                                                    onClick={() => handleDownloadInvoice(order)}
                                                    disabled={downloadingOrderId === order.id}
                                                    className={`ml-2 px-3 py-1 text-[10px] uppercase font-bold tracking-wider border transition-all duration-300 relative overflow-hidden group/btn
                                                        ${downloadingOrderId === order.id ? 'border-white/10 text-white/50 bg-white/5 cursor-wait' : 'border-cyan-500 text-black bg-cyan-500 hover:bg-white hover:text-black hover:border-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'}
                                                    `}
                                                >
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        {downloadingOrderId === order.id ? (
                                                            <>
                                                                <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" />
                                                                GENERATING...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-lg leading-none">⫸</span>
                                                                DOWNLOAD MANIFEST
                                                            </>
                                                        )}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-4">
                                            {order.order_items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 relative flex-shrink-0">
                                                        {item.image_url && (
                                                            <Image
                                                                src={item.image_url}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-cover opacity-70 grayscale group-hover:grayscale-0 transition-all"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold uppercase text-white/90">{item.product_name}</div>
                                                        <div className="text-[10px] text-white/50 uppercase">
                                                            Variant: {item.selected_color} <span className="mx-2">//</span> QTY: {item.quantity}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                            }
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div >
                {/* HIDDEN INVOICE RENDERER */}
                < div className="absolute left-[-9999px] top-0" >
                    <SciFiInvoice ref={invoiceRef} order={invoiceData} user={user} />
                </div >
            </main >
        </div >
    );
}
