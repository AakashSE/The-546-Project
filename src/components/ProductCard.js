"use client";
import React from 'react';
// Note: We removed 'Link' because we are handling navigation manually now
import useMarsSound from '../hooks/useMarsSound';
import LiquidImage from './LiquidImage';
import { useTransition } from '../context/TransitionContext'; // <--- 1. Import

export default function ProductCard({ product }) {
  // Sound 1: Hover
  const { playSound: playHover, stopSound: stopHover } = useMarsSound("/assets/Mars_Audio.mp3");

  // Sound 2: Transition Click
  const { playSound: playClick } = useMarsSound("/assets/FromHomePageToSpecificProduct.mp3");

  // Navigation Logic
  const { navigateWithTransition } = useTransition(); // <--- 2. Get function

  const handleClick = () => {
    // 3. Trigger the Seamless Sequence
    // Pass the path AND the sound function
    navigateWithTransition(`/product/${product.id}`, playClick);
  };

  return (
    <div
      onClick={handleClick} // <--- 4. Manual Click
      className="group relative flex flex-col items-center cursor-pointer" // Added cursor-pointer
      onMouseEnter={playHover}
      onMouseLeave={stopHover}
    >

      {/* 1. Image Container */}
      <div className="w-full h-[500px] bg-[#f4f4f4] relative overflow-hidden mb-4">
        <LiquidImage src={product.defaultImage} />
      </div>

      {/* 2. Product Details */}
      <div className="text-center space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-widest">{product.name}</h3>
        <p className="text-xs text-gray-500 font-courier">{product.category}</p>
        <p className="text-sm font-bold mt-2">{product.price}</p>
      </div>

    </div>
  );
}