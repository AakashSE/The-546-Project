"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase/client';
import Image from 'next/image';

export default function AdminInventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    // New Product State
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: 'apparel',
        description: '',
        stock_status: 'in_stock',
        images: { front: '', back: '' }
    });

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setProducts(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from('products')
            .insert({
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                category: newProduct.category,
                description: newProduct.description,
                stock_status: newProduct.stock_status,
                images: newProduct.images
            })
            .select()
            .single();

        if (!error && data) {
            setProducts([data, ...products]);
            setIsAdding(false);
            setNewProduct({ name: '', price: '', category: 'apparel', description: '', stock_status: 'in_stock', images: { front: '', back: '' } });
        } else {
            alert("Error adding product: " + (error?.message || "Unknown error"));
        }
    };

    const updateStock = async (id, status) => {
        setUpdatingId(id);
        const { error } = await supabase
            .from('products')
            .update({ stock_status: status })
            .eq('id', id);

        if (!error) {
            setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_status: status } : p));
        }
        setUpdatingId(null);
    };

    if (loading) return <div className="text-white/50 animate-pulse uppercase tracking-widest text-xs">Loading Inventory...</div>;

    return (
        <div className="space-y-8 relative">

            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Armory Inventory</h2>
                    <p className="text-xs text-white/50 font-mono uppercase tracking-widest">
                        Manage asset availability and specifications.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-[#C1440E] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors text-xs"
                >
                    + Add Protocol
                </button>
            </div>

            {/* TABLE */}
            <div className="border border-white/10 bg-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-[#C1440E]">
                            <th className="p-4">Asset Detail</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Valuation</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 relative bg-white/5 border border-white/10 overflow-hidden rounded-sm shrink-0">
                                            {product.images?.front ? (
                                                <Image src={product.images.front} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-white/30">NO IMG</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm uppercase">{product.name}</div>
                                            <div className="text-[9px] text-white/40 max-w-[200px] truncate">{product.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-xs font-mono uppercase text-white/70">{product.category}</td>
                                <td className="p-4 text-xs font-mono font-bold text-white">₹{product.price}</td>
                                <td className="p-4">
                                    <select
                                        value={product.stock_status || 'in_stock'}
                                        onChange={(e) => updateStock(product.id, e.target.value)}
                                        className="bg-black/50 border border-white/20 text-[10px] text-white uppercase p-1 outline-none focus:border-[#C1440E]"
                                        disabled={updatingId === product.id}
                                    >
                                        <option value="in_stock">In Stock</option>
                                        <option value="out_of_stock">Out of Stock</option>
                                        <option value="pre_order">Pre-Order</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    <button className="text-[10px] text-white/30 hover:text-[#C1440E] uppercase tracking-wider">
                                        [EDIT]
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-white/30 text-xs uppercase tracking-widest">
                                    No Assets Found in Database
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD PRODUCT SLIDE-OVER */}
            {isAdding && (
                <>
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsAdding(false)} />
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/20 z-50 p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <h3 className="text-xl font-bold uppercase tracking-widest text-[#C1440E] mb-8 border-b border-white/10 pb-4">
                            New Asset Protocol
                        </h3>

                        <form onSubmit={handleAddProduct} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/50">Asset Name</label>
                                <input
                                    className="w-full bg-black/50 border border-white/20 p-3 text-sm text-white focus:border-[#C1440E] outline-none"
                                    placeholder="e.g. TASER TROUSERS"
                                    value={newProduct.name}
                                    onChange={e => { setNewProduct({ ...newProduct, name: e.target.value }); e.target.setCustomValidity(''); }}
                                    required
                                    title={newProduct.name ? "" : "ASSET NAME REQUIRED"}
                                    onInvalid={(e) => e.target.setCustomValidity('ASSET NAME REQUIRED')}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/50">Price (INR)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/50 border border-white/20 p-3 text-sm text-white focus:border-[#C1440E] outline-none"
                                        placeholder="0.00"
                                        value={newProduct.price}
                                        onChange={e => { setNewProduct({ ...newProduct, price: e.target.value }); e.target.setCustomValidity(''); }}
                                        required
                                        title={newProduct.price ? "" : "ASSET VALUATION REQUIRED"}
                                        onInvalid={(e) => e.target.setCustomValidity('ASSET VALUATION REQUIRED')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/50">Category</label>
                                    <select
                                        className="w-full bg-black/50 border border-white/20 p-3 text-sm text-white focus:border-[#C1440E] outline-none"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option value="apparel">Apparel</option>
                                        <option value="accessories">Accessories</option>
                                        <option value="survival_gear">Survival Gear</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/50">Description</label>
                                <textarea
                                    className="w-full bg-black/50 border border-white/20 p-3 text-sm text-white focus:border-[#C1440E] outline-none h-24 resize-none"
                                    placeholder="Technical specifications..."
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/50">Image URL (Front)</label>
                                <input
                                    className="w-full bg-black/50 border border-white/20 p-3 text-sm text-white focus:border-[#C1440E] outline-none"
                                    placeholder="https://..."
                                    value={newProduct.images.front}
                                    onChange={e => setNewProduct({ ...newProduct, images: { ...newProduct.images, front: e.target.value } })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/50">Image URL (Back) - Optional</label>
                                <input
                                    className="w-full bg-black/50 border border-white/20 p-3 text-sm text-white focus:border-[#C1440E] outline-none"
                                    placeholder="https://..."
                                    value={newProduct.images.back}
                                    onChange={e => setNewProduct({ ...newProduct, images: { ...newProduct.images, back: e.target.value } })}
                                />
                            </div>

                            <div className="pt-8 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-3 border border-white/20 text-white/50 uppercase tracking-widest text-xs hover:text-white hover:border-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-[#C1440E] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
                                >
                                    Initialize Asset
                                </button>
                            </div>

                        </form>
                    </div>
                </>
            )}

        </div>
    );
}
