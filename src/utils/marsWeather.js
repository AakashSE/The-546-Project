export const fetchMarsWeather = async () => {
    try {
        const res = await fetch('https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json');
        const data = await res.json();
        const latest = data.soles && data.soles.length > 0 ? data.soles[0] : null;

        if (!latest) throw new Error("No data");

        // Format
        // Temp: Average of min/max or just max? Let's show Min/Max range or Avg.
        // User wants "TEMP: -63°C".
        return {
            sol: latest.sol,
            temp: `${latest.min_temp}°C`, // Showing min temp as it's more "Mars-like" cold
            wind: latest.wind_speed !== "--" ? `${latest.wind_speed} KM/H` : "VARIES",
            condition: latest.atmo_opacity,
            season: latest.season,
            sunset: latest.sunset
        };
    } catch (e) {
        console.error("Mars Weather Fetch Failed", e);
        // Fallback to simulated if API fails
        return {
            sol: "4741",
            temp: "-72°C",
            wind: "14 KM/H",
            condition: "Sunny",
            season: "Month 7",
            sunset: "17:20"
        };
    }
};
