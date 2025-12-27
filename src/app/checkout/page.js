"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber"; // FIXED
import { PerspectiveCamera, Stars } from "@react-three/drei"; // FIXED
import Image from "next/image";
import dynamic from "next/dynamic";
const TransitCanvas = dynamic(() => import("../../components/Checkout/TransitCanvas"), { ssr: false });
import NoiseOverlay from "../../components/NoiseOverlay";
import { useRouter } from "next/navigation"; // NEW
import Header from "../../components/Header";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext"; // NEW
import { supabase } from "../../utils/supabase/client"; // NEW
import useMarsSound from "../../hooks/useMarsSound";
import useTypingAudio from "../../hooks/useTypingAudio"; // NEW HOOK
import { useTransition } from "../../context/TransitionContext"; // NEW
import PlanetaryScanner from "../../components/PlanetaryScanner";
import { getPlanetaryDistance, ASIAN_COUNTRIES } from "../../utils/orbital";
import Footer from "../../components/Footer";



// --- TRANSIT VELOCITY SHADER MOVED TO TransitCanvas.js ---

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const router = useRouter();
    const { navigateWithTransition } = useTransition(); // NEW
    const { user, openAuth } = useAuth();
    // Audio
    // const { playSound: playType } = useMarsSound("/assets/Typing.mp3"); // REMOVED
    const { playType } = useTypingAudio(); // REPLACED
    const { playSound: playSwitch } = useMarsSound("/assets/ColourClick.mp3");
    const { playSound: playIgnition } = useMarsSound("/assets/Ignition.mp3");
    const { playSound: playSuccess } = useMarsSound("/assets/Success.mp3");
    const { playSound: playError } = useMarsSound("/assets/Error.mp3"); // New sound context if possible, or reuse

    const [isLaunching, setIsLaunching] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanDirection, setScanDirection] = useState(1); // 1 = Forward (Add), -1 = Backward (Delete)

    // LOGISTICS STATE
    const [distanceData, setDistanceData] = useState({ formatted: "CALCULATING...", au: "0" });
    const [addressVerified, setAddressVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // START ADDRESS LOGIC
    const [addresses, setAddresses] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        address_line1: '',
        city: '',
        zip_code: '',
        country: 'IN' // Default to India
    });

    const isFormValid = Object.values(formData).every(val => val && val.trim() !== '');
    const isCartReady = cart.length > 0;
    const canLaunch = isFormValid && isCartReady;

    const [extras, setExtras] = useState({ priority: false, insurance: false });
    const [costs, setCosts] = useState({ priority: 499, insurance: 299 });
    const [transitId, setTransitId] = useState("TR-88X"); // Static initial for hydration

    // INIT
    useEffect(() => {
        // Real-time Distance
        setDistanceData(getPlanetaryDistance());
        // Random Transit ID on client only
        setTransitId(`TR-${Math.floor(Math.random() * 1000)}X`);

        if (user) {
            // Fetch Addresses
            const fetchAddresses = async () => {
                const { data } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_default', { ascending: false });

                if (data && data.length > 0) {
                    setAddresses(data);
                    const defaultAddr = data[0];
                    setFormData({
                        name: user.user_metadata?.full_name || '',
                        address_line1: defaultAddr.address_line1,
                        city: defaultAddr.city,
                        zip_code: defaultAddr.zip_code,
                        country: defaultAddr.country || 'IN'
                    });
                    // Trigger validation for default address
                    if (defaultAddr.zip_code) validateZip(defaultAddr.zip_code, defaultAddr.country || 'IN');
                } else {
                    setFormData(prev => ({ ...prev, name: user.user_metadata?.full_name || '' }));
                }
            };
            fetchAddresses();

            // Dynamic Preload for Seamless Climax
            router.prefetch('/checkout/success');
            router.prefetch('/checkout/cancel');

            // Fetch Shipping Config
            const fetchConfig = async () => {
                const { data } = await supabase.from('app_config').select('*');
                if (data) {
                    const newCosts = { ...costs };
                    data.forEach(item => {
                        if (item.key === 'shipping_priority') newCosts.priority = Number(item.value);
                        if (item.key === 'shipping_insurance') newCosts.insurance = Number(item.value);
                    });
                    setCosts(newCosts);
                }
            };
            fetchConfig();
        }
    }, [user]);

    const handleAddressSelect = (e) => {
        const selectedId = e.target.value;
        if (!selectedId) return;
        const addr = addresses.find(a => a.id === selectedId);
        if (addr) {
            setFormData({
                ...formData,
                address_line1: addr.address_line1,
                city: addr.city,
                zip_code: addr.zip_code,
                country: addr.country || 'IN'
            });
            playSwitch();
            validateZip(addr.zip_code, addr.country || 'IN');
        }
    };

    const handleFormChange = (e) => {
        let { name, value } = e.target;

        // 1. Force Uppercase
        value = value.toUpperCase();
        e.target.setCustomValidity(''); // CLEAR VALIDITY

        // REMOVED: Zip Code Length Restriction as per user request for international support

        // Determine Scan Direction (Adding or Removing text)
        const currentLength = formData[name] ? formData[name].length : 0;
        const newLength = value.length;
        if (newLength !== currentLength) {
            setScanDirection(newLength > currentLength ? 1 : -1);
        }

        const newData = { ...formData, [name]: value };
        setFormData(newData);
        handleInput();

        // Trigger Validation on Change for Country OR Zip Code
        if (name === 'country' || name === 'zip_code') {
            const countryToUse = name === 'country' ? value : newData.country;
            const zipToUse = name === 'zip_code' ? value : newData.zip_code;
            validateZip(zipToUse, countryToUse);
        }
    };

    const validateZip = async (zip, currentCountry) => {
        if (!zip || zip.length < 3) return; // Min length check only
        setIsVerifying(true);
        setAddressVerified(false);

        // 1. Try Current Country First
        if (await checkZipForCountry(zip, currentCountry)) return;

        // 2. If invalid, linear scan other Asian sectors (Auto-Detect Country)
        for (const c of ASIAN_COUNTRIES) {
            if (c.code === currentCountry) continue; // Already checked
            if (await checkZipForCountry(zip, c.code)) return; // Found match
        }

        // If loop finishes with no match
        setIsVerifying(false);
        setAddressVerified(false);
        playError();
    };

    // Helper: Returns true if valid and state updated
    const checkZipForCountry = async (zip, countryCode) => {
        try {
            // SPECIAL LOGIC FOR INDIA (District Level preferred over Locality)
            if (countryCode === 'IN') {
                const res = await fetch(`https://api.postalpincode.in/pincode/${zip}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data[0] && data[0].Status === 'Success') {
                        const details = data[0].PostOffice[0];
                        // User prefers City/District name (e.g. Salem) over Locality (Meyyanur)
                        // District is usually the best proxy for City in this API
                        const cityName = details.District || details.Division || details.Region || details.Name;

                        setAddressVerified(true);
                        setFormData(prev => ({
                            ...prev,
                            country: 'IN',
                            city: cityName.toUpperCase()
                        }));
                        if (countryCode !== formData.country) playSuccess();
                        setIsVerifying(false);
                        return true;
                    }
                }
            } else {
                // ROW (Rest of World) - Zippopotam
                const res = await fetch(`https://api.zippopotam.us/${countryCode}/${zip}`);
                if (res.ok) {
                    const data = await res.json();

                    setAddressVerified(true);
                    setFormData(prev => ({
                        ...prev,
                        country: countryCode,
                        city: data.places && data.places[0] ? data.places[0]['place name'].toUpperCase() : prev.city
                    }));

                    if (countryCode !== formData.country) playSuccess();
                    setIsVerifying(false);
                    return true;
                }
            }
        } catch (e) {
            // Ignore fetch errors during scan
        }
        return false;
    };

    const handleZipBlur = () => {
        validateZip(formData.zip_code, formData.country);
    };

    const toggleExtra = (type) => {
        playSwitch();
        setExtras(prev => ({ ...prev, [type]: !prev[type] }));
    };
    // END ADDRESS LOGIC

    // Form handlers
    const handleInput = () => {
        // playType(); // MOVED TO KEYDOWN for lower latency
        setIsScanning(true);
        // Stop scanning after delay
        setTimeout(() => setIsScanning(false), 500);
    };

    const cartTotal = cart.reduce((acc, item) => {
        const priceString = String(item.price || "0");
        const priceNumber = parseInt(priceString.replace(/[^\d]/g, "")) || 0;
        return acc + priceNumber;
    }, 0);

    const finalTotal = cartTotal + (extras.priority ? costs.priority : 0) + (extras.insurance ? costs.insurance : 0);
    const formattedTotal = finalTotal.toLocaleString("en-IN");

    // CHECKOUT LOGIC
    const handlePayment = async (e) => {
        e.preventDefault();

        // 1. Validation
        if (!user) {
            alert("IDENTITY REQUIRED. PLEASE LOGIN.");
            openAuth();
            return;
        }

        if (!addressVerified) {
            alert("COORDINATE MISMATCH. UNABLE TO VERIFY LANDING ZONE. PLEASE CHECK ZIP CODE.");
            return;
        }

        setIsLaunching(true);
        playIgnition();

        try {
            // 2. Create Order on Server
            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: finalTotal,
                    currency: 'INR',
                    receipt: `rcpt_${Date.now()}`,
                    notes: {
                        priority_shipping: extras.priority,
                        shipping_insurance: extras.insurance,
                        priority_cost: extras.priority ? costs.priority : 0,
                        insurance_cost: extras.insurance ? costs.insurance : 0
                    }
                })
            });

            const order = await res.json();
            if (!order.id) throw new Error("Order Creation Failed");

            // 3. Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "THE 546 PROJECT",
                description: `Supply Drop ${extras.priority ? '[PRIORITY]' : ''}`,
                image: "/assets/MarsLogo.svg", // Ensure this exists or use a URL
                order_id: order.id,
                handler: async function (response) {
                    playSuccess();
                    // 4. Verify Payment
                    const verifyRes = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            cartItems: cart, // Using context cart
                            userId: user.id,
                            totalAmount: finalTotal,
                            shippingAddress: {
                                name: formData.name,
                                address: `${formData.address_line1}, ${formData.city}, ${formData.zip_code}`,
                                country: formData.country,
                                extras: extras
                            }
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        clearCart();
                        // Clear Splash for Success
                        setIsLaunching(false);
                        // CINEMATIC TRANSITION
                        navigateWithTransition('/checkout/success', playSuccess);
                    } else {
                        alert("VERIFICATION FAILED. SECURITY ALERT.");
                        setIsLaunching(false);
                    }
                },
                prefill: {
                    name: formData.name || "Operative",
                    email: user.email,
                    contact: "9999999999"
                },
                theme: {
                    color: "#C1440E"
                },
                modal: {
                    ondismiss: function () {
                        setIsLaunching(false);
                        // CINEMATIC TRANSITION (Cancel)
                        navigateWithTransition('/checkout/cancel', playError);
                    }
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                const reason = response?.error?.description || "Gateway Interrupted";
                console.warn("TRANSFER_ABORTED:", reason);
                setIsLaunching(false);

                // Ensure we navigate even if transition state is locked
                const destination = `/checkout/cancel?reason=${encodeURIComponent(reason)}`;
                try {
                    navigateWithTransition(destination, playError);
                } catch (e) {
                    router.push(destination);
                }
            });
            rzp1.open();

        } catch (error) {
            console.error(error);
            alert("SYSTEM MALFUNCTION: " + error.message);
            setIsLaunching(false);
        }
    };

    return (
        <div className="relative w-full min-h-screen bg-[#020205] text-white overflow-hidden font-mono">
            <NoiseOverlay />
            {/* Load Razorpay Script */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>

            {/* Dynamic Preload Web API: Speculation Rules for Instant Climax */}
            <script
                type="speculationrules"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        prerender: [
                            {
                                source: "list",
                                urls: ["/checkout/success", "/checkout/cancel"]
                            }
                        ]
                    })
                }}
            />

            {/* R3F BACKGROUND LAYER */}
            {/* R3F BACKGROUND LAYER */}
            <TransitCanvas isScanning={isScanning} isLaunching={isLaunching} scanDirection={scanDirection} />

            {/* UI LAYER */}
            <div className={`relative z-10 w-full h-full min-h-screen transition-opacity duration-1000 ${isLaunching ? "opacity-0" : "opacity-100"}`}>
                <Header theme="dark" />

                <main className="pt-24 pb-32 px-8 w-full max-w-[1400px] mx-auto flex gap-8">

                    {/* LEFT MAIN AREA (60%): Form + Data Grid */}
                    <div className="w-[60%] flex flex-col gap-8">

                        {/* 1. IDENTITY FORM (Full Width) */}
                        <div className="w-full bg-[#050505]/20 backdrop-blur-xl border border-white/10 p-6 shadow-2xl relative overflow-hidden group rounded-lg">




                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-3 h-3 bg-cyan-500 animate-pulse" />
                                <h2 className="text-xl font-bold tracking-[0.2em] text-cyan-500">SECURE CHANNEL // 894</h2>
                            </div>

                            {/* ADDRESS SELECTOR OVERLAY */}
                            {addresses.length > 0 && (
                                <div className="mb-6 relative z-20">
                                    <label className="text-[10px] uppercase tracking-widest text-[#555] block mb-2">Stored Coordinates</label>
                                    <select
                                        onChange={handleAddressSelect}
                                        className="w-full bg-cyan-900/10 border border-cyan-500/30 text-cyan-500 py-2 px-4 uppercase text-xs font-bold tracking-widest focus:outline-none hover:bg-cyan-500/10 transition-colors"
                                    >
                                        <option value="">-- Select Drop Zone --</option>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.address_line1} {addr.is_default ? '(DEFAULT)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <form id="launch-form" onSubmit={handlePayment} className="flex flex-col gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-[#555]">Identity Encrypted</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        onKeyDown={(e) => playType(e)}
                                        required
                                        title={formData.name ? "" : "OPERATIVE IDENTITY REQUIRED"}
                                        onInvalid={(e) => e.target.setCustomValidity('OPERATIVE IDENTITY REQUIRED')}
                                        onInput={(e) => e.target.setCustomValidity('')}
                                        placeholder="COMMANDER NAME"
                                        className="w-full bg-transparent border-b border-white/20 py-4 text-lg text-white font-bold tracking-widest focus:border-cyan-500 focus:outline-none transition-colors placeholder:text-white/10 uppercase"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-1/3 space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#555]">Sector (Country)</label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleFormChange}
                                            className="w-full bg-transparent border-b border-white/20 py-4 text-lg font-bold text-white tracking-widest focus:border-cyan-500 focus:outline-none transition-colors uppercase appearance-none"
                                        >
                                            {ASIAN_COUNTRIES.map(c => (
                                                <option key={c.code} value={c.code} className="bg-black text-sm font-normal">{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#555]">Drop Coordinates</label>
                                        <input
                                            name="address_line1"
                                            value={formData.address_line1}
                                            onChange={handleFormChange}
                                            onKeyDown={(e) => playType(e)}
                                            required
                                            title={formData.address_line1 ? "" : "DROP ZONE COORDINATES REQUIRED"}
                                            onInvalid={(e) => e.target.setCustomValidity('DROP ZONE COORDINATES REQUIRED')}
                                            onInput={(e) => e.target.setCustomValidity('')}
                                            placeholder="STREET / BUILDING"
                                            className="w-full bg-transparent border-b border-white/20 py-4 text-lg text-white font-bold tracking-widest focus:border-cyan-500 focus:outline-none transition-colors placeholder:text-white/10 uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#555]">Grid Ref (City)</label>
                                        <div className="relative">
                                            <input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleFormChange}
                                                onKeyDown={(e) => playType(e)}
                                                required
                                                title={formData.city ? "" : "SECTOR IDENTIFIER REQUIRED"}
                                                onInvalid={(e) => e.target.setCustomValidity('SECTOR IDENTIFIER REQUIRED')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                placeholder="AUTO-DETECTING..."
                                                className="w-full bg-transparent border-b border-white/20 py-4 text-sm text-white tracking-widest focus:border-cyan-500 focus:outline-none transition-colors placeholder:text-white/10 uppercase"
                                            />
                                            {isVerifying && <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-cyan-500 animate-pulse">SCANNING...</div>}
                                        </div>
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#555]">Zip Lock</label>
                                        <div className="relative">
                                            <input
                                                name="zip_code"
                                                value={formData.zip_code}
                                                onChange={handleFormChange}
                                                onKeyDown={(e) => playType(e)}
                                                onBlur={handleZipBlur}
                                                required
                                                title={formData.zip_code ? "" : "ZONE CODE REQUIRED"}
                                                onInvalid={(e) => e.target.setCustomValidity('ZONE CODE REQUIRED')}
                                                onInput={(e) => e.target.setCustomValidity('')}
                                                placeholder="00000"
                                                className={`w-full bg-transparent border-b py-4 text-sm tracking-widest focus:outline-none transition-colors placeholder:text-white/10 uppercase ${addressVerified ? 'border-green-500 text-green-500' : 'border-white/20 text-white'}`}
                                            />
                                            {addressVerified && (
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-green-500">✓</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SWITCHES */}
                                <div className="flex gap-8 mt-4 pt-4 border-t border-white/10">
                                    <label className="flex items-center gap-3 cursor-pointer group/switch select-none">
                                        <div className={`w-10 h-10 border border-white/30 flex items-center justify-center transition-colors ${extras.priority ? 'border-cyan-500' : 'group-hover/switch:border-cyan-500'}`}>
                                            <input type="checkbox" className="hidden" checked={extras.priority} onChange={() => toggleExtra('priority')} />
                                            <div className={`w-6 h-6 bg-cyan-500 transition-opacity shadow-[0_0_10px_#00FFFF] ${extras.priority ? 'opacity-100' : 'opacity-0'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] uppercase tracking-widest transition-colors ${extras.priority ? 'text-white' : 'text-white/50'}`}>Priority</span>
                                            <span className="text-[9px] text-cyan-500 font-bold">+₹{costs.priority}</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group/switch select-none">
                                        <div className={`w-10 h-10 border border-white/30 flex items-center justify-center transition-colors ${extras.insurance ? 'border-cyan-500' : 'group-hover/switch:border-cyan-500'}`}>
                                            <input type="checkbox" className="hidden" checked={extras.insurance} onChange={() => toggleExtra('insurance')} />
                                            <div className={`w-6 h-6 bg-cyan-500 transition-opacity shadow-[0_0_10px_#00FFFF] ${extras.insurance ? 'opacity-100' : 'opacity-0'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] uppercase tracking-widest transition-colors ${extras.insurance ? 'text-white' : 'text-white/50'}`}>Insurance</span>
                                            <span className="text-[9px] text-cyan-500 font-bold">+₹{costs.insurance}</span>
                                        </div>
                                    </label>
                                </div>
                            </form>
                        </div>

                        {/* 2. DATA GRID (Manifest) - Full Width now */}
                        <div className="w-full">

                            {/* BLOCK A: MANIFEST */}
                            <div className="bg-[#050505]/20 backdrop-blur-xl border border-white/10 p-6 shadow-2xl relative overflow-hidden group flex flex-col h-[260px] rounded-lg">


                                {/* MODULE 1: MANIFEST (Items) */}
                                <div className="flex flex-col h-[210px]">
                                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/5">
                                        <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-500 font-mono">
                                            Cargo Manifest
                                        </h3>
                                        <span className="text-[10px] font-mono text-white/30">SECURE_LOAD</span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-2">
                                        {cart.map((item, i) => (
                                            <div key={i} className="flex gap-4 group/item">
                                                <div className="w-16 h-20 bg-white/5 relative flex-shrink-0 border border-white/5 group-hover/item:border-cyan-500/30 transition-colors">
                                                    <Image
                                                        src={item.image || item.selectedColor?.images?.front}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover opacity-70 group-hover/item:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-between w-full">
                                                    <div>
                                                        <div className="text-sm font-bold uppercase text-white tracking-wider">{item.name}</div>
                                                        <div className="text-xs text-cyan-500 uppercase mt-1">{item.colorName}</div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="text-xs text-white/40 uppercase">SIZE {item.size}</div>
                                                            <div className="text-xs text-white font-bold">₹{item.price?.toLocaleString('en-IN') || "0"}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1 mt-3 pt-2 border-t border-white/5">
                                                        <div className="flex justify-between text-[9px] text-white/40 font-mono tracking-wider">
                                                            <span>MASS</span>
                                                            <span className="text-white">0.85 KG</span>
                                                        </div>
                                                        <div className="flex justify-between text-[9px] text-white/40 font-mono tracking-wider">
                                                            <span>COMPOSITION</span>
                                                            <span className="text-white">100% COTTON</span>
                                                        </div>
                                                        <div className="flex justify-between text-[9px] text-white/40 font-mono tracking-wider">
                                                            <span>ORIGIN</span>
                                                            <span className="text-cyan-500">SECTOR 7</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] uppercase tracking-widest text-white/20 font-mono mt-2">
                                                        ID: {i + 101}92X
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* RIGHT SIDEBAR (40%): Globe Header + Launch Button */}
                    <div className="w-[40%] flex flex-col justify-end gap-5 pb-2">
                        <div className="flex-1 min-h-[250px] flex items-center justify-center relative border border-white/5 bg-white/5 rounded-lg overflow-hidden group/globe">
                            {/* HUD OVERLAY */}
                            <div className="absolute inset-0 z-20 pointer-events-none">
                                {/* Grid Pattern */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                                {/* Corner Brackets */}
                                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20 transition-all duration-500 group-hover/globe:border-cyan-500/50" />
                                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/20 transition-all duration-500 group-hover/globe:border-cyan-500/50" />
                                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/20 transition-all duration-500 group-hover/globe:border-cyan-500/50" />
                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20 transition-all duration-500 group-hover/globe:border-cyan-500/50" />

                                {/* Status Text */}
                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500/80 rounded-full animate-pulse" />
                                    <span className="text-[9px] text-green-500/80 font-mono tracking-widest uppercase">LIVE SAT-FEED</span>
                                </div>

                                {/* Coords */}
                                <div className="absolute bottom-4 right-4 text-[9px] text-white/30 font-mono tracking-widest uppercase">
                                    TARGET: TERRA-PRIME
                                </div>


                            </div>

                            <div className="absolute inset-0 z-10">
                                <Canvas gl={{ alpha: true }}>
                                    <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                                    <ambientLight intensity={0.8} />
                                    <group scale={[0.8, 0.8, 0.8]}>
                                        <PlanetaryScanner isScanning={isScanning} scanDirection={scanDirection} />
                                    </group>
                                    <Stars radius={50} depth={20} count={1000} factor={2} saturation={0} fade speed={1} />
                                </Canvas>
                            </div>
                        </div>

                        {/* TELEMETRY MOVED HERE */}
                        <div className="bg-[#050505]/20 backdrop-blur-xl border border-white/10 p-6 shadow-2xl relative overflow-hidden group rounded-lg">
                            {/* Scanning Grid Background */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                            <h3 className="relative z-10 text-xs uppercase tracking-[0.2em] text-white/40 mb-4 font-mono flex items-center gap-2">
                                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                                TELEMETRY // LOGISTICS
                            </h3>

                            <div className="relative z-10 space-y-3 font-mono text-xs uppercase tracking-wider">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-white/30">Origins</span>
                                    <span className="text-[#C1440E]">MARS COLONY I</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-white/30">Distance</span>
                                    <span className="text-white text-right">{distanceData.formatted}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-white/30">Transit ID</span>
                                    <span className="text-white text-right">{transitId}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-white/30">Payload Mass</span>
                                    <span className="text-white text-right">{cart.length * 0.85} KG</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-white/30">Atmosphere</span>
                                    <span className="text-cyan-500 text-right">PRESSURIZED</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-white/30">Radiation</span>
                                    <span className="text-cyan-500 text-right">SHIELDED</span>
                                </div>

                                {/* ARRIVAL DATE HIGHLIGHT */}
                                <div className="pt-2 mt-2 border-t border-white/10">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-white/40 text-[9px]">EST. ARRIVAL</span>
                                            <span className="text-cyan-500 font-bold text-sm">
                                                {new Date(Date.now() + (extras.priority ? 1814400000 : 4233600000)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-white/30 text-[9px]">{extras.priority ? "PRIORITY" : "STANDARD"}</span>
                                            <span className="text-[#C1440E] text-[9px]">SOL {extras.priority ? "20" : "48"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LAUNCH MODULE */}
                        <div className="w-full bg-[#050505]/20 backdrop-blur-xl border border-white/10 p-6 shadow-2xl relative overflow-hidden group rounded-lg">
                            <div className="relative z-10">
                                {/* Totals Grid */}
                                <div className="grid grid-cols-2 gap-y-2 text-xs uppercase tracking-wider mb-6 text-white/50">
                                    <span>Subtotal</span>
                                    <span className="text-right text-white">₹{cartTotal.toLocaleString("en-IN")}</span>

                                    {extras.priority && (
                                        <>
                                            <span className="text-cyan-500">Priority</span>
                                            <span className="text-right text-cyan-500">+₹{costs.priority}</span>
                                        </>
                                    )}
                                    {extras.insurance && (
                                        <>
                                            <span className="text-cyan-500">Insurance</span>
                                            <span className="text-right text-cyan-500">+₹{costs.insurance}</span>
                                        </>
                                    )}

                                    <div className="col-span-2 h-[1px] bg-white/10 my-2" />

                                    <span className="text-cyan-500 font-bold self-center">Fuel Cost</span>
                                    <span className="text-right text-2xl font-bold text-white tracking-tighter">
                                        ₹{formattedTotal}
                                    </span>
                                </div>
                                {/* LAUNCH BUTTON */}
                                <button
                                    onClick={() => document.getElementById("launch-form").requestSubmit()}
                                    disabled={!canLaunch}
                                    className={`group relative w-full h-16 border border-cyan-500/30 text-cyan-500 overflow-hidden transition-all duration-300 
                                        ${canLaunch
                                            ? "bg-cyan-950/30 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] active:scale-95 cursor-pointer"
                                            : "bg-gray-900/50 opacity-50 cursor-not-allowed grayscale"
                                        }`}
                                >
                                    {/* Reactor Core Glow (Replaces Zebra Scan) - Only when Valid */}
                                    {canLaunch && (
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute inset-0 bg-cyan-500/10" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                                        </div>
                                    )}

                                    {/* HUD Elements: Sharp Corner Brackets */}
                                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/50 group-hover:border-cyan-400 transition-colors" />
                                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/50 group-hover:border-cyan-400 transition-colors" />

                                    {/* Text Layer (Bottom) */}
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-cyan-500 transition-colors duration-300">
                                        {/* STATE 1: IDLE / INVALID */}
                                        <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300 ${canLaunch ? "group-hover:scale-150 group-hover:opacity-0" : ""}`}>
                                            <div className={`w-1.5 h-1.5 bg-cyan-500 rounded-full ${canLaunch ? "animate-pulse shadow-[0_0_5px_cyan]" : "opacity-30"}`} />
                                            <span className="font-mono text-xs tracking-[0.3em] font-bold">
                                                {!isCartReady ? "CARGO EMPTY" : (isFormValid ? "SYSTEM READY" : "AWAITING DATA")}
                                            </span>
                                            <div className={`w-1.5 h-1.5 bg-cyan-500 rounded-full ${canLaunch ? "animate-pulse shadow-[0_0_5px_cyan]" : "opacity-30"}`} />
                                        </div>

                                        {/* STATE 2: HOVER (Valid Only) */}
                                        {canLaunch && (
                                            <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                                                <span className="font-mono font-bold text-lg tracking-[0.2em] uppercase whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-[shake_0.5s_infinite]">
                                                    ENGAGE THRUSTERS
                                                </span>
                                            </div>
                                        )}
                                    </div>



                                </button>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div >

            {/* LIFTOFF OVERLAY (Speed Lines) */}
            {
                isLaunching && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <div className="absolute inset-0 bg-white animate-flash-bang" />
                        <h1 className="relative z-10 text-9xl font-black text-black tracking-tighter scale-150 animate-shake">
                            HVY-LIFT
                        </h1>
                    </div>
                )
            }

            <style jsx>{`
                @keyframes scan-down {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan-down {
                    animation: scan-down 3s linear infinite;
                }
                 @keyframes flash-bang {
                    0% { opacity: 0; }
                    5% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-flash-bang {
                    animation: flash-bang 2s forwards;
                }
                @keyframes scroll-hazard {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 0; }
                }


            `}</style>
        </div >
    );
}
