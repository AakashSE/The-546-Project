import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // Fallback or use host
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOrderEmail = async (order, items, userEmail) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("EMAIL_USER or EMAIL_PASS not set. Skipping email.");
        return;
    }

    const total = order.total_amount.toLocaleString("en-IN");
    const dateObj = new Date();
    const date = dateObj.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();

    // Extract metadata from order
    const shipping = order.shipping_address || {};
    const extras = shipping.extras || { priority: false, insurance: false };

    // Calculate Costs
    const subtotal = items.reduce((acc, item) => acc + (item.price_at_purchase || 0), 0);
    const priorityCost = extras.priority ? 499 : 0;
    const insuranceCost = extras.insurance ? 299 : 0;

    // Logistics Logic
    const transitId = `TR-${Math.floor(100 + Math.random() * 900)}${order.id.slice(0, 1).toUpperCase()}`;
    const arrivalDays = extras.priority ? 20 : 48;
    const arrivalDate = new Date(dateObj.getTime() + (arrivalDays * 24 * 60 * 60 * 1000))
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    const payloadMass = (items.length * 0.85).toFixed(2);

    const siteUrl = "https://the-546-project.vercel.app";

    // HTML TEMPLATE
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
            
            body { 
                background-color: #000105; 
                color: #e0e0e0; 
                font-family: 'Courier New', Courier, monospace;
                margin: 0; 
                padding: 0; 
                -webkit-font-smoothing: antialiased;
            }
            .wrapper {
                width: 100%;
                background-color: #000105;
                padding: 40px 0;
            }
            .container { 
                max-width: 650px; 
                margin: 0 auto; 
                background-color: #02040a; 
                border: 1px solid rgba(255,255,255,0.05); 
                box-shadow: 0 40px 100px rgba(0,0,0,0.5);
            }
            
            /* HEADER */
            .header { 
                padding: 50px 20px; 
                text-align: center; 
                background: linear-gradient(180deg, #050810 0%, #02040a 100%);
                border-bottom: 1px solid rgba(0, 255, 255, 0.2);
                position: relative;
            }
            .logo-text { 
                color: #C1440E; 
                font-size: 24px; 
                font-weight: bold; 
                letter-spacing: 8px; 
                text-transform: uppercase; 
                margin-bottom: 8px;
                display: block;
            }
            .sub-logo {
                color: rgba(0, 255, 255, 0.5);
                font-size: 10px;
                letter-spacing: 4px;
                text-transform: uppercase;
                font-family: 'Share Tech Mono', monospace;
            }

            /* HUD BAR */
            .hud-bar {
                background: rgba(0, 255, 255, 0.03);
                border-top: 1px solid rgba(0, 255, 255, 0.05);
                border-bottom: 1px solid rgba(0, 255, 255, 0.05);
                padding: 12px 30px;
                display: flex;
                justify-content: space-between;
                font-family: 'Share Tech Mono', monospace;
                font-size: 10px;
                color: rgba(255,255,255,0.4);
                letter-spacing: 2px;
            }

            /* CONTENT */
            .content { padding: 40px 40px; }
            
            .transmission-header {
                font-family: 'Share Tech Mono', monospace;
                color: #00FFFF;
                font-size: 11px;
                letter-spacing: 3px;
                margin-bottom: 30px;
                display: block;
                border-left: 2px solid #00FFFF;
                padding-left: 15px;
            }

            .greeting {
                font-size: 16px;
                font-weight: bold;
                letter-spacing: 2px;
                color: #fff;
                margin-bottom: 15px;
            }

            .main-text {
                color: #8892b0;
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 35px;
            }

            /* LOGISTICS GRID */
            .logistics-grid {
                display: table;
                width: 100%;
                margin-bottom: 40px;
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(255,255,255,0.05);
            }
            .logistics-cell {
                display: table-cell;
                padding: 20px;
                border-right: 1px solid rgba(255,255,255,0.05);
                width: 33.33%;
            }
            .logistics-label {
                font-size: 8px;
                color: rgba(255,255,255,0.3);
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 8px;
                display: block;
            }
            .logistics-value {
                font-family: 'Share Tech Mono', monospace;
                font-size: 13px;
                color: #00FFFF;
                text-transform: uppercase;
            }

            /* DROP ZONE */
            .section-header {
                font-size: 9px;
                color: #C1440E;
                text-transform: uppercase;
                letter-spacing: 3px;
                margin-bottom: 15px;
                font-weight: bold;
                border-bottom: 1px solid rgba(193, 68, 14, 0.2);
                padding-bottom: 5px;
            }

            .drop-zone {
                background: rgba(193, 68, 14, 0.03);
                padding: 20px;
                margin-bottom: 40px;
                border-left: 1px solid #C1440E;
            }
            .address-text {
                font-size: 13px;
                color: #ccd6f6;
                line-height: 1.6;
                letter-spacing: 1px;
                text-transform: uppercase;
            }

            /* TABLE */
            .table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 40px;
            }
            .table th { 
                text-align: left; 
                padding: 12px 10px; 
                border-bottom: 1px solid rgba(255,255,255,0.1); 
                color: rgba(255,255,255,0.3); 
                font-size: 9px; 
                text-transform: uppercase; 
                letter-spacing: 2px; 
            }
            .table td { 
                padding: 20px 10px; 
                border-bottom: 1px solid rgba(255,255,255,0.03); 
                color: #fff; 
                font-size: 13px;
                vertical-align: middle;
            }
            .item-manifest {
                font-weight: bold;
                letter-spacing: 1px;
                color: #e6f1ff;
                display: block;
                margin-bottom: 4px;
            }
            .item-spec {
                font-size: 10px;
                color: #8892b0;
                letter-spacing: 1px;
                text-transform: uppercase;
            }

            /* FINANCIALS */
            .financials {
                margin-left: auto;
                width: 250px;
                font-family: 'Share Tech Mono', monospace;
            }
            .fin-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                font-size: 12px;
            }
            .fin-label { color: rgba(255,255,255,0.4); }
            .fin-value { color: #fff; }
            .total-row {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(0, 255, 255, 0.2);
                font-size: 18px;
                font-weight: bold;
                color: #C1440E;
            }

            /* BUTTON */
            .btn-wrap { 
                text-align: center; 
                margin-top: 50px;
            }
            .action-btn { 
                display: inline-block; 
                background: transparent;
                border: 1px solid #00FFFF;
                color: #00FFFF; 
                padding: 18px 40px; 
                text-decoration: none; 
                font-weight: bold; 
                text-transform: uppercase; 
                font-size: 11px;
                letter-spacing: 3px;
                font-family: 'Share Tech Mono', monospace;
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
            }

            /* FOOTER */
            .footer { 
                padding: 40px; 
                text-align: center; 
                font-size: 10px; 
                color: rgba(255,255,255,0.2); 
                background-color: #010206;
                border-top: 1px solid rgba(255,255,255,0.05); 
                letter-spacing: 2px;
                line-height: 2;
            }
            .footer strong { color: rgba(255,255,255,0.4); }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <span class="logo-text">THE 546 PROJECT</span>
                    <span class="sub-logo">ORBITAL LOGISTICS & SUPPLY Chain</span>
                </div>

                <div class="hud-bar">
                    <span>REF: ${order.id.slice(0, 8).toUpperCase()}</span>
                    <span>${date}</span>
                </div>
                
                <div class="content">
                    <span class="transmission-header">:: INCOMING ENCRYPTED PAYLOAD ::</span>

                    <div class="greeting">UPLINK CONFIRMED, OPERATIVE.</div>
                    
                    <div class="main-text">
                        Your requisition has been processed through the Jezero Command Center. 
                        Asset transport is currently being queued for atmospheric exit. 
                        Logistics telemetry follows.
                    </div>

                    <div class="logistics-grid">
                        <div class="logistics-cell">
                            <span class="logistics-label">Transit ID</span>
                            <span class="logistics-value">${transitId}</span>
                        </div>
                        <div class="logistics-cell">
                            <span class="logistics-label">Est. Arrival</span>
                            <span class="logistics-value">${arrivalDate}</span>
                        </div>
                        <div class="logistics-cell" style="border-right: none;">
                            <span class="logistics-label">Payload Mass</span>
                            <span class="logistics-value">${payloadMass} KG</span>
                        </div>
                    </div>

                    <div class="section-header">Target Drop Zone</div>
                    <div class="drop-zone">
                        <div class="address-text">
                            <strong>${shipping.name || 'UNSPECIFIED OPERATIVE'}</strong><br>
                            ${shipping.address || 'COORDINATES CLASSIFIED'}<br>
                            ${shipping.country || 'TERRA-PRIME'}
                        </div>
                    </div>

                    <div class="section-header">Asset Manifest</div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th width="70%">IDENTIFIER</th>
                                <th width="30%" style="text-align: right;">VALUATION</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                            <tr>
                                <td>
                                    <span class="item-manifest">${item.product_name.toUpperCase()}</span>
                                    <span class="item-spec">SECTOR ${Math.floor(Math.random() * 9)} // ${item.selected_color || 'STD'} // SIZE ${item.selected_size}</span>
                                </td>
                                <td style="text-align: right; font-family: 'Share Tech Mono', monospace;">
                                    ₹${(item.price_at_purchase || 0).toLocaleString("en-IN")}
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="financials">
                        <div class="fin-row">
                            <span class="fin-label">SUBTOTAL</span>
                            <span class="fin-value">₹${subtotal.toLocaleString("en-IN")}</span>
                        </div>
                        <div class="fin-row">
                            <span class="fin-label">LOGISTICS (${extras.priority ? 'PRIORITY' : 'STANDARD'})</span>
                            <span class="fin-value">₹${priorityCost.toLocaleString("en-IN")}</span>
                        </div>
                        <div class="fin-row">
                            <span class="fin-label">PROTECTION (INSURANCE)</span>
                            <span class="fin-value">₹${insuranceCost.toLocaleString("en-IN")}</span>
                        </div>
                        <div class="fin-row total-row">
                            <span>TOTAL</span>
                            <span>₹${total}</span>
                        </div>
                    </div>

                    <div class="btn-wrap">
                        <a href="${siteUrl}/account" class="action-btn">ACCESS MISSION LOG</a>
                    </div>
                </div>

                <div class="footer">
                    <strong>THE 546 PROJECT // JEZERO CRATER // SECTOR 7G</strong><br>
                    SECURE TRANSMISSION PROTOCOL 894-B<br>
                    DO NOT SHARE COORDINATES // STAY VIGILANT
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"The 546 Command" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `[UPLINK] ORDER CONFIRMED: #${order.id.slice(0, 6).toUpperCase()}`,
            html: html,
        });
        console.log("Email uplink successful.");
    } catch (error) {
        console.error("Email uplink failed:", error);
    }
};
