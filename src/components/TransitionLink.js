"use client";
import React from 'react';
import { useTransition } from '../context/TransitionContext';
import { usePathname } from 'next/navigation';
import useMarsSound from '../hooks/useMarsSound';

export default function TransitionLink({ href, children, className, onClick, ...props }) {
    const { navigateWithTransition } = useTransition();
    const pathname = usePathname();
    const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");

    const handleClick = (e) => {
        if (onClick) onClick(e);
        e.preventDefault();

        // If specifically disabled or just hashtag
        if (!href || href === "#") return;

        // If already on page, do nothing? Or maybe just scroll top?
        // Ideally we re-transition for effect if user wants, but typically no.
        if (pathname === href) return;

        navigateWithTransition(href, playClick, "next");
    };

    return (
        <a href={href} onClick={handleClick} className={className} {...props}>
            {children}
        </a>
    );
}
