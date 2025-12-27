export const getPlanetaryDistance = () => {
    // Simplified Keplerian Elements for Earth and Mars (J2000 epoch)
    const date = new Date();
    const j2000 = new Date('2000-01-01T12:00:00Z');
    const d = (date - j2000) / (1000 * 60 * 60 * 24); // Days since J2000

    // Earth
    const M_e = (357.529 + 0.98560028 * d) % 360; // Mean Anomaly
    const L_e = (280.466 + 0.98564736 * d) % 360; // Mean Longitude
    const r_e = 1.00014061 * (1 - 0.01671 * Math.cos(toRadians(M_e))); // Radius (AU)
    const l_e = L_e + 1.915 * Math.sin(toRadians(M_e)) + 0.020 * Math.sin(toRadians(2 * M_e)); // Ecliptic Longitude

    // Mars
    const M_m = (19.412 + 0.52402078 * d) % 360;
    const L_m = (355.453 + 0.52403818 * d) % 360;
    const r_m = 1.52366231 * (1 - 0.09340 * Math.cos(toRadians(M_m)));
    const l_m = L_m + 10.691 * Math.sin(toRadians(M_m)) + 0.623 * Math.sin(toRadians(2 * M_m));

    // Distance in AU using Law of Cosines (approx assuming same plane for simple UI)
    const dist_au = Math.sqrt(Math.pow(r_e, 2) + Math.pow(r_m, 2) - 2 * r_e * r_m * Math.cos(toRadians(l_m - l_e)));

    // Convert to KM (1 AU = 149,597,870.7 km)
    const dist_km = dist_au * 149597870.7;

    return {
        au: dist_au.toFixed(4),
        km: Math.round(dist_km),
        formatted: Math.round(dist_km).toLocaleString('en-US') + " KM"
    };
};

function toRadians(deg) {
    return deg * (Math.PI / 180);
}

export const ASIAN_COUNTRIES = [
    { name: "India", code: "IN", phone: "+91" },
    { name: "Japan", code: "JP", phone: "+81" },
    { name: "Thailand", code: "TH", phone: "+66" },
    { name: "Bangladesh", code: "BD", phone: "+880" },
    { name: "Sri Lanka", code: "LK", phone: "+94" },
    { name: "Malaysia", code: "MY", phone: "+60" },
    { name: "Philippines", code: "PH", phone: "+63" },
    { name: "Pakistan", code: "PK", phone: "+92" }
];
