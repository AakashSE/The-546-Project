"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from LocalStorage on start (so they don't lose items on refresh)
    useEffect(() => {
        const savedCart = localStorage.getItem("mars-cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save to LocalStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem("mars-cart", JSON.stringify(cart));
    }, [cart]);

    // ACTION: Add Item
    const addToCart = (product, color, price) => {
        const newItem = {
            ...product,
            selectedColor: color,
            uniqueId: `${product.id}-${color.colorName}-${Date.now()}`, // Unique ID for every addition
        };

        setCart((prev) => [...prev, newItem]);
        // setIsCartOpen(true); // Disable auto-open for less intrusive UX
    };

    // ACTION: Remove Item
    const removeFromCart = (uniqueId) => {
        setCart((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
    };

    // ACTION: Toggle Drawer
    const toggleCart = () => setIsCartOpen((prev) => !prev);

    // ACTION: Clear Cart
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("mars-cart");
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                isCartOpen,
                addToCart,
                removeFromCart,
                toggleCart,
                setIsCartOpen,
                clearCart // NEW
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

// Hook to use the cart easily in other files
export function useCart() {
    return useContext(CartContext);
}