import jsPDF from "jspdf";

// Helper to load image
const loadImage = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

export const generateTicket = async (order, orderItems) => {
    const width = 210;
    const height = 90;

    // --- LATEST LUXURY PALETTE ---
    const COLORS = {
        BLACK: "#020202",
        WHITE: "#FFFFFF",
        GREY_DARK: "#111111",
        GREY_MID: "#333333",
        GREY_LIGHT: "#666666",
        ORANGE: "#C1440E" // The Mars Brand Color
    };

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [width, height]
    });

    // 1. VOID BACKGROUND
    doc.setFillColor(COLORS.BLACK);
    doc.rect(0, 0, width, height, "F");

    // 2. ARTISTIC BACKGROUND (Planetary Arcs)
    doc.setDrawColor(COLORS.GREY_DARK);
    doc.setLineWidth(0.3);

    // Big concentric arcs representing orbit paths
    const cx = width * 0.7;
    const cy = height * 1.2;

    for (let r = 40; r < 200; r += 15) {
        doc.circle(cx, cy, r, "S");
    }

    // Faint grid overlay (very subtle)
    doc.setDrawColor(COLORS.GREY_MID);
    doc.setLineWidth(0.05);
    for (let i = 0; i < width; i += 20) doc.line(i, 0, i, height);
    for (let i = 0; i < height; i += 20) doc.line(0, i, width, i);


    // 3. MAIN LOGO (Async Load)
    try {
        const logoData = await loadImage("/assets/Logo.svg");
        if (logoData) {
            // Place Logo prominently on top left
            // Aspect ratio 425x100 -> 4.25
            const logoW = 50;
            const logoH = logoW / 4.25;
            doc.addImage(logoData, 'PNG', 10, 10, logoW, logoH);
        } else {
            // Fallback text if logo fails
            doc.setFont("courier", "bold");
            doc.setFontSize(24);
            doc.setTextColor(COLORS.ORANGE);
            doc.text("THE 546 PROJECT", 10, 20);
        }
    } catch (e) {
        console.error("Logo Load Fail", e);
    }

    // 4. PRECIOSITY BORDER (Minimalist corners)
    doc.setDrawColor(COLORS.ORANGE);
    doc.setLineWidth(0.5);
    const m = 6; // margin
    const c = 3; // corner len
    // TL
    doc.line(m, m + c, m, m); doc.line(m, m, m + c, m);
    // TR
    doc.line(width - m - c, m, width - m, m); doc.line(width - m, m, width - m, m + c);
    // BR
    doc.line(width - m, height - m - c, width - m, height - m); doc.line(width - m, height - m, width - m - c, height - m);
    // BL
    doc.line(m + c, height - m, m, height - m); doc.line(m, height - m, m, height - m - c);


    // 5. TYPOGRAPHY - "NEAT" ARRANGEMENT (Grid System)
    // We use a strict 3-column layout
    // Col 1: Recipient (Starts x=10)
    // Col 2: Mission Data (Starts x=70)
    // Col 3: Items (Starts x=130)

    const rowStart = 45;
    const col1 = 12;
    const col2 = 70;
    const col3 = 130;

    // --- COLUMN 1: IDENTITY ---
    doc.setFont("courier", "normal");
    doc.setTextColor(COLORS.GREY_LIGHT);
    doc.setFontSize(6);
    doc.text("AUTHORIZED RECIPIENT", col1, rowStart);

    doc.setFont("courier", "bold");
    doc.setTextColor(COLORS.WHITE);
    doc.setFontSize(11);
    const name = (order?.shipping_address?.fullName || "COLONIST").toUpperCase();
    doc.text(name, col1, rowStart + 5);

    // Order ID below name
    doc.setTextColor(COLORS.ORANGE);
    doc.setFontSize(7);
    doc.text(`ID: ${order.id.slice(0, 8).toUpperCase()}`, col1, rowStart + 12);

    // Status Stamp
    doc.setDrawColor(COLORS.WHITE);
    doc.setLineWidth(0.2);
    doc.rect(col1, rowStart + 20, 20, 6);
    doc.setTextColor(COLORS.WHITE);
    doc.setFontSize(5);
    doc.text("CLEARED FOR TRANSIT", col1 + 10, rowStart + 24, { align: "center" });


    // --- COLUMN 2: MISSION DATA ---
    doc.setTextColor(COLORS.GREY_LIGHT);
    doc.setFontSize(6);
    doc.text("DESTINATION", col2, rowStart);
    doc.setTextColor(COLORS.WHITE);
    doc.setFontSize(9);
    doc.text("JEZERO CRATER", col2, rowStart + 5);
    doc.setFontSize(7);
    doc.setTextColor(COLORS.GREY_LIGHT);
    doc.text("SECTOR 7-G", col2, rowStart + 9);

    doc.setTextColor(COLORS.GREY_LIGHT);
    doc.setFontSize(6);
    doc.text("DATE OF ISSUE", col2, rowStart + 18);
    doc.setTextColor(COLORS.WHITE);
    doc.setFontSize(9);
    doc.text(new Date(order.created_at).toLocaleDateString().toUpperCase(), col2, rowStart + 23);


    // --- COLUMN 3: PAYLOAD MANIFEST ---
    doc.setTextColor(COLORS.ORANGE);
    doc.setFontSize(7);
    doc.text("PAYLOAD CONTENTS", col3, rowStart);

    let itemY = rowStart + 5;
    orderItems.slice(0, 4).forEach(item => {
        doc.setTextColor(COLORS.WHITE);
        doc.setFontSize(8);
        doc.text(`[${item.quantity}] ${item.product_name.toUpperCase()}`, col3, itemY);

        // Subtext (Variant)
        if (item.selected_color || item.selected_size) {
            doc.setTextColor(COLORS.GREY_LIGHT);
            doc.setFontSize(5);
            doc.text(`${item.selected_color || ''} ${item.selected_size || ''}`.trim().toUpperCase(), col3 + 5, itemY + 3);
            itemY += 7;
        } else {
            itemY += 5;
        }
    });

    // Total Cost
    doc.setFontSize(14);
    doc.setTextColor(COLORS.ORANGE);
    doc.text(`TOTAL: ${order.total_amount}`, width - 20, height - 10, { align: "right" });


    // 6. RIGHT SIDE BARCODE STRIP (Vertical)
    const cw = 15; // strip width
    const stripX = width - cw;

    // Background for strip
    doc.setFillColor(COLORS.GREY_DARK);
    doc.rect(stripX, 0, cw, height, "F");

    // Vertical Text
    doc.setTextColor(COLORS.WHITE);
    doc.setFontSize(8);
    doc.text("BOARDING PASS", stripX + 6, height / 2, { angle: 90, align: "center" }); // Centered vertically

    // Bottom Barcode (Simulated lines)
    doc.setFillColor(COLORS.WHITE);
    for (let i = 0; i < 10; i++) {
        const h = Math.random() * 8 + 2;
        const y = height - 20 + i * 1.5;
        if (y < height - 5) doc.rect(stripX + 4, y, 7, 0.8, "F");
    }


    // SAVE
    doc.save(`MARS_TOKEN_${order.id.slice(0, 8)}.pdf`);
};
