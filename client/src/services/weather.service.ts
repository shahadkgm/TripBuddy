import axios from 'axios';

// Using Open-Meteo for weather (no API key needed) 
// and Nominatim for geocoding (no API key needed)

export interface WeatherData {
    city: string;
    temp: number;
    description: string;
    icon: string;
    uvIndex: number;
    date: string;
}

export const weatherService = {
    async getLatLong(city: string) {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`);
        if (response.data && response.data.length > 0) {
            return {
                lat: response.data[0].lat,
                lon: response.data[0].lon,
                display_name: response.data[0].display_name.split(',')[0]
            };
        }
        throw new Error("Location not found");
    },

    async getWeather(city: string): Promise<WeatherData> {
        const coords = await this.getLatLong(city);
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&daily=uv_index_max&timezone=auto`);

        const code = response.data.current.weather_code;
        const weatherMapping: Record<number, { desc: string, icon: string }> = {
            0: { desc: "Clear sky", icon: "Sun" },
            1: { desc: "Mainly clear", icon: "Sun" },
            2: { desc: "Partly cloudy", icon: "CloudSun" },
            3: { desc: "Overcast", icon: "Cloud" },
            45: { desc: "Foggy", icon: "CloudFog" },
            48: { desc: "Depositing rime fog", icon: "CloudFog" },
            51: { desc: "Light drizzle", icon: "CloudDrizzle" },
            61: { desc: "Slight rain", icon: "CloudRain" },
            80: { desc: "Rain showers", icon: "CloudRain" },
            95: { desc: "Thunderstorm", icon: "CloudLightning" },
        };

        const weather = weatherMapping[code] || { desc: "Sunny and Warm", icon: "Sun" };

        return {
            city: coords.display_name,
            temp: Math.round(response.data.current.temperature_2m),
            description: weather.desc,
            icon: weather.icon,
            uvIndex: response.data.daily.uv_index_max[0],
            date: new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
        };
    }
};
