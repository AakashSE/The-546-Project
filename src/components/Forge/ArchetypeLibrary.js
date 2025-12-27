import * as THREE from 'three';

// Configuration
const SIZE = 512; // Resolution of the silhouette texture

export const Archetypes = {
    CREW_TEE: 'crew_tee',
    POLO: 'polo',
    FORMAL_PANT: 'formal_pant',
    TRACK_PANT: 'track_pant',
    SHIRT: 'shirt',
    SHORTS: 'shorts'
};

/**
 * Draws a specific archetype onto a canvas and returns the Point Data.
 * Returns an array of [x, y, z] coordinates for every white pixel.
 * 
 * Z-DEPTH MAPPING:
 * - RED Channel (#FF0000) = Base Depth (Body)
 * - YELLOW Channel (#FFFF00) = Boosted Depth (Collar, Waistband, details)
 */
export const generateArchetypePoints = (type, pointCount = 10000) => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    // 1. Reset background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // 2. Default fill logic setup
    // Base Body = RED (#FF0000)
    // Structure Pop = YELLOW (#FFFF00)

    // Helper to center drawing
    const cx = SIZE / 2;
    const cy = SIZE / 2;

    // Common configurations
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    switch (type) {
        case Archetypes.POLO:
            // --- POLO: PRESERVED ROUND 64 (DENSE SCATTER) ---
            const pShoulderW = 92;
            const pBodyW = 90;
            const pNeckY = cy - 135;
            const pShoulderY = cy - 125;
            const pHemY = cy + 145;
            const rSleeveLen = 68;
            const rSleeveDrop = 70;
            const lSleeveLen = 85;
            const lSleeveDrop = 75;
            const pSleeveWidth = 38;

            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(cx - 50, pNeckY);
            ctx.lineTo(cx + 50, pNeckY);
            ctx.lineTo(cx + pShoulderW, pShoulderY);
            const rSleeveEndX = cx + pShoulderW + rSleeveLen - 5;
            const rSleeveEndY = pShoulderY + rSleeveDrop;
            ctx.lineTo(rSleeveEndX, rSleeveEndY);
            const rSleeveBottomX = rSleeveEndX - 10;
            const rSleeveBottomY = rSleeveEndY + pSleeveWidth;
            ctx.lineTo(rSleeveBottomX, rSleeveBottomY);
            const rArmpitY = pShoulderY + 80;
            ctx.lineTo(cx + pBodyW, rArmpitY);
            ctx.lineTo(cx + pBodyW, pHemY);
            ctx.lineTo(cx - pBodyW, pHemY);
            const lArmpitY = pShoulderY + 75;
            ctx.lineTo(cx - pBodyW, lArmpitY);
            const lSleeveEndX = cx - pShoulderW - lSleeveLen + 5;
            const lSleeveEndY = pShoulderY + lSleeveDrop;
            const lSleeveBottomX = lSleeveEndX + 10;
            const lSleeveBottomY = lSleeveEndY + pSleeveWidth;
            ctx.lineTo(lSleeveBottomX, lSleeveBottomY);
            ctx.lineTo(lSleeveEndX, lSleeveEndY);
            ctx.lineTo(cx - pShoulderW, pShoulderY);
            ctx.lineTo(cx - 50, pNeckY);
            ctx.fill();

            // Structures
            ctx.fillStyle = '#FFFF00';
            ctx.save(); ctx.translate(rSleeveEndX, rSleeveEndY); ctx.rotate(Math.PI / 4); ctx.fillRect(-2, 0, 10, pSleeveWidth); ctx.restore();
            ctx.save(); ctx.translate(lSleeveEndX, lSleeveEndY); ctx.rotate(-Math.PI / 5); ctx.fillRect(-2, 0, 10, pSleeveWidth); ctx.restore();
            ctx.fillRect(cx - pBodyW, pHemY - 8, pBodyW * 2, 8);

            // Collar
            ctx.fillStyle = '#FF0000';
            const standTop = pNeckY - 2;
            ctx.beginPath();
            ctx.moveTo(cx - 50, pNeckY); ctx.lineTo(cx - 50, standTop); ctx.lineTo(cx + 50, standTop); ctx.lineTo(cx + 50, pNeckY); ctx.fill();
            ctx.fillStyle = '#FFFF00';
            const collarPointY = pNeckY + 45; const collarOutX = 65;
            ctx.beginPath(); ctx.moveTo(cx, pNeckY + 25); ctx.lineTo(cx - 40, pNeckY - 10); ctx.lineTo(cx - collarOutX, collarPointY); ctx.lineTo(cx - 30, collarPointY); ctx.lineTo(cx, pNeckY + 25);
            ctx.moveTo(cx, pNeckY + 25); ctx.lineTo(cx + 40, pNeckY - 10); ctx.lineTo(cx + collarOutX, collarPointY); ctx.lineTo(cx + 30, collarPointY); ctx.lineTo(cx, pNeckY + 25); ctx.fill();
            const pW = 34; const pH = 70; const pTop = pNeckY + 25; ctx.fillRect(cx - pW / 2, pTop, pW, pH);
            ctx.lineWidth = 1.5; ctx.strokeStyle = 'black'; ctx.lineJoin = 'miter';
            ctx.beginPath(); ctx.moveTo(cx - 40, pNeckY - 10); ctx.lineTo(cx - collarOutX, collarPointY); ctx.lineTo(cx - 30, collarPointY); ctx.lineTo(cx, pNeckY + 25); ctx.lineTo(cx + 30, collarPointY); ctx.lineTo(cx + collarOutX, collarPointY); ctx.lineTo(cx + 40, pNeckY - 10); ctx.stroke();
            ctx.strokeRect(cx - pW / 2, pTop, pW, pH); ctx.fillStyle = 'black'; ctx.beginPath(); ctx.rect(cx - 3, pTop + 15, 6, 1.5); ctx.arc(cx, pTop + 45, 2.5, 0, Math.PI * 2); ctx.fill();

            // POLO Scatter
            ctx.fillStyle = '#FF0000';
            const waistSteps = 120; const waistH = pHemY - lArmpitY; const wStep = waistH / waistSteps; let wy = pHemY;
            for (let i = 0; i < waistSteps; i++) { wy -= wStep; const offset = (Math.random() - 0.5) * 8; ctx.beginPath(); ctx.arc(cx - pBodyW + offset, wy, 1.5, 0, Math.PI * 2); ctx.fill(); }
            const sSteps = 90; const dx = (cx - pBodyW) - lSleeveBottomX; const dy = lArmpitY - lSleeveBottomY;
            for (let i = 0; i < sSteps; i++) { const t = i / sSteps; const sx = lSleeveBottomX + dx * t; const sy = lSleeveBottomY + dy * t; const offset = (Math.random() - 0.5) * 6; ctx.beginPath(); ctx.arc(sx + offset, sy + offset, 1.4, 0, Math.PI * 2); ctx.fill(); }
            break;

        case Archetypes.CREW_TEE:
            // --- CREW TEE: TRIMMED (ROUND 70) ---
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            const neckRadius = 45;
            const cShoulderY = cy - 130;
            // Base Body
            ctx.moveTo(cx + neckRadius, cShoulderY);
            ctx.lineTo(cx + 80, cy - 120);
            ctx.lineTo(cx + 170, cy - 50);
            ctx.lineTo(cx + 155, cy - 10);
            ctx.lineTo(cx + 90, cy - 30);
            ctx.lineTo(cx + 90, cy + 140);
            ctx.lineTo(cx - 90, cy + 140);
            ctx.lineTo(cx - 90, cy - 30);
            ctx.lineTo(cx - 155, cy - 10);
            ctx.lineTo(cx - 170, cy - 50);
            ctx.lineTo(cx - 80, cy - 120);
            ctx.lineTo(cx - neckRadius, cShoulderY);
            ctx.quadraticCurveTo(cx, cy - 80, cx + neckRadius, cShoulderY);
            ctx.fill();

            // Neck Structure
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 6;
            ctx.beginPath();
            // ROUND 70: Trimmed Arc
            // Standard: 0 to Math.PI (3 o'clock to 9 o'clock)
            // Trimmed: 0.4 to Math.PI - 0.4 (Shortens the tips)
            ctx.arc(cx, cShoulderY - 5, neckRadius + 2, 0.4, Math.PI - 0.4, false);
            ctx.stroke();

            // 3D HEM (Yellow Pop)
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(cx - 90, cy + 132, 180, 8);

            // VOID MASK (Center) - Kept for safety
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(cx, cShoulderY - 10, neckRadius - 2, 0, Math.PI * 2);
            ctx.fill();
            break;

        case Archetypes.FORMAL_PANT:
            // --- FORMAL PANT: 3D LEG HEMS (ROUND 65) ---
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(cx - 75, cy - 150);
            ctx.lineTo(cx + 75, cy - 150);
            ctx.lineTo(cx + 70, cy);
            ctx.lineTo(cx + 60, cy + 160);
            ctx.lineTo(cx + 15, cy + 160);
            ctx.lineTo(cx, cy - 70);
            ctx.lineTo(cx - 15, cy + 160);
            ctx.lineTo(cx - 60, cy + 160);
            ctx.lineTo(cx - 70, cy);
            ctx.lineTo(cx - 75, cy - 150);
            ctx.fill();
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(cx - 76, cy - 150, 152, 25); // Waistband

            // 3D Leg Hems
            ctx.fillRect(cx - 60, cy + 152, 45, 8); // Left Leg bottom
            ctx.fillRect(cx + 15, cy + 152, 45, 8); // Right Leg bottom

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 150); ctx.lineTo(cx, cy - 70);
            ctx.stroke();
            break;

        case Archetypes.TRACK_PANT:
            // --- TRACK PANT: 3D LEG HEMS (ROUND 65) ---
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(cx - 80, cy - 150);
            ctx.lineTo(cx + 80, cy - 150);
            ctx.quadraticCurveTo(cx + 95, cy, cx + 55, cy + 180);
            ctx.lineTo(cx + 15, cy + 180);
            ctx.lineTo(cx, cy - 50);
            ctx.lineTo(cx - 15, cy + 180);
            ctx.lineTo(cx - 55, cy + 180);
            ctx.quadraticCurveTo(cx - 95, cy, cx - 80, cy - 150);
            ctx.fill();
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(cx - 82, cy - 150, 164, 30); // Waistband

            // 3D Leg Cuffs (Thicker for track pant)
            ctx.fillRect(cx - 55, cy + 172, 40, 8); // Left
            ctx.fillRect(cx + 15, cy + 172, 40, 8); // Right
            break;

        case Archetypes.SHORTS:
            // --- SHORTS: 3D LEG HEMS (ROUND 65) ---
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(cx - 85, cy - 130);
            ctx.lineTo(cx + 85, cy - 130);
            ctx.lineTo(cx + 95, cy + 80);
            ctx.lineTo(cx + 10, cy + 80);
            ctx.lineTo(cx, cy - 20);
            ctx.lineTo(cx - 10, cy + 80);
            ctx.lineTo(cx - 95, cy + 80);
            ctx.lineTo(cx - 85, cy - 130);
            ctx.fill();
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(cx - 87, cy - 130, 174, 25); // Waistband

            // 3D Leg Hems
            ctx.fillRect(cx - 95, cy + 72, 85, 8); // Left
            ctx.fillRect(cx + 10, cy + 72, 85, 8); // Right
            break;

        case Archetypes.SHIRT:
            // --- SHIRT: EXTENDED SLEEVES & 3D DETAILS (ROUND 65) ---
            const sShoulderW = 75; // Extended from 65
            const sBodyW = 85;
            const sNeckY = cy - 130;
            const sShoulderY = cy - 120;

            const shirtSleeveLen = 130; // Longer sleeves
            const shirtSleeveDrop = 60;

            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(cx - 40, sNeckY);
            ctx.lineTo(cx - sShoulderW, sShoulderY);

            // Left Sleeve (Extended)
            const slSleeveEndX = cx - sShoulderW - shirtSleeveLen;
            const slSleeveEndY = sShoulderY + shirtSleeveDrop;
            ctx.lineTo(slSleeveEndX, slSleeveEndY);
            ctx.lineTo(slSleeveEndX + 15, slSleeveEndY + 40); // Cuff width
            ctx.lineTo(cx - sBodyW, cy - 30); // Armpit

            // Left Body
            ctx.lineTo(cx - sBodyW + 5, cy + 150);

            // Bottom Curve
            ctx.quadraticCurveTo(cx, cy + 170, cx + sBodyW - 5, cy + 150);

            // Right Body
            ctx.lineTo(cx + sBodyW, cy - 30);

            // Right Sleeve (Extended)
            const srSleeveEndX = cx + sShoulderW + shirtSleeveLen;
            const srSleeveEndY = sShoulderY + shirtSleeveDrop;
            ctx.lineTo(srSleeveEndX + 15, srSleeveEndY + 40); // Cuff bottom (flipped logic for rough shape)
            ctx.lineTo(srSleeveEndX, srSleeveEndY);

            ctx.lineTo(cx + sShoulderW, sShoulderY);
            ctx.lineTo(cx + 40, sNeckY);
            ctx.fill();

            // Collar Structure
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.moveTo(cx, sNeckY + 10);
            ctx.lineTo(cx - 45, sNeckY + 25);
            ctx.lineTo(cx - 35, sNeckY - 10);
            ctx.lineTo(cx, sNeckY - 5);
            ctx.lineTo(cx + 35, sNeckY - 10);
            ctx.lineTo(cx + 45, sNeckY + 25);
            ctx.lineTo(cx, sNeckY + 10);
            ctx.fill();

            // Placket
            ctx.fillRect(cx - 10, sNeckY - 5, 20, (cy + 150) - (sNeckY - 5));

            // ROUND 65: 3D CUFFS (Yellow)
            const cuffH = 25;
            // Left Cuff
            ctx.save();
            ctx.translate(slSleeveEndX, slSleeveEndY);
            ctx.rotate(-Math.PI / 6);
            ctx.fillRect(0, 0, 15, 30); // Simple block cuff
            ctx.restore();

            // Right Cuff
            ctx.save();
            ctx.translate(srSleeveEndX, srSleeveEndY);
            ctx.rotate(Math.PI / 6);
            ctx.fillRect(-15, 0, 15, 30);
            ctx.restore();

            // ROUND 65: 3D HEM (Yellow - Bottom)
            // Approximate bottom position ~ cy+160
            ctx.fillRect(cx - sBodyW + 5, cy + 150, (sBodyW - 5) * 2, 8);

            // Outlines & Buttons
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, sNeckY + 10); ctx.lineTo(cx - 45, sNeckY + 25); ctx.lineTo(cx - 35, sNeckY - 10);
            ctx.moveTo(cx, sNeckY + 10); ctx.lineTo(cx + 45, sNeckY + 25); ctx.lineTo(cx + 35, sNeckY - 10);
            ctx.stroke();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(cx, sNeckY + 40, 2, 0, Math.PI * 2);
            ctx.arc(cx, sNeckY + 70, 2, 0, Math.PI * 2);
            ctx.arc(cx, sNeckY + 100, 2, 0, Math.PI * 2);
            ctx.fill();
            break;
    }

    // --- PIXEL SAMPLING ---
    const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
    const data = imgData.data;
    const validPixels = [];
    for (let y = 0; y < SIZE; y += 2) {
        for (let x = 0; x < SIZE; x += 2) {
            const index = (y * SIZE + x) * 4;
            // Check brightness (Red channel > 50)
            if (data[index] > 50) {
                // Encode Z-Depth from Green Channel (0-255 -> 0.0-1.0)
                const zBoost = data[index + 1] / 255.0;
                validPixels.push({ x, y, zBoost });
            }
        }
    }

    // --- 3D POINT GENERATION ---
    if (validPixels.length === 0) return new Float32Array(pointCount * 3);

    const output = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
        const pixel = validPixels[Math.floor(Math.random() * validPixels.length)];

        const wx = (pixel.x / SIZE - 0.5) * 10;
        const wy = -(pixel.y / SIZE - 0.5) * 10;
        const xNorm = wx / 5.0;

        // Z-AXIS ROTATION BIAS
        let zBase;
        if (type === Archetypes.POLO) {
            const bias = -0.15;
            zBase = Math.cos((xNorm - bias) * Math.PI * 0.45) * 2.5;
        } else {
            // Apply slight rotation to Shirt too? Maybe safer to keep default.
            zBase = Math.cos(xNorm * Math.PI * 0.45) * 2.5;
        }

        const zLayer = pixel.zBoost * 0.5;
        const thickness = (Math.random() - 0.5) * 0.5;

        output[i * 3] = wx;
        output[i * 3 + 1] = wy;
        output[i * 3 + 2] = zBase + zLayer + thickness;
    }

    return output;
}
