import axios from "axios";

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast/daily";

export const getWeatherByCity = async (city: string, days: number = 7) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: city,
                cnt: days,
                appid: API_KEY,
                units: "metric",
                lang: "pt"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        return null;
    }
};

export const getWeatherByCoordinates = async (lat: number, lon: number, days: number = 7) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                lat: lat,
                lon: lon,
                cnt: days,
                appid: API_KEY,
                units: "metric",
                lang: "pt"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        return null;
    }
};
