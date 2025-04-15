import type { NextApiRequest, NextApiResponse } from 'next';
import { getWeatherByCoordinates } from '@/lib/climaService';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { lat, lon, days } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude e longitude são obrigatórias" });
    }

    try {
        const numDays = days ? Number(days) : 7;

        if (isNaN(numDays)) {
            return res.status(400).json({ error: "Número de dias inválido" });
        }

        const latitude = parseFloat(lat.toString());
        const longitude = parseFloat(lon.toString());

        const data = await getWeatherByCoordinates(latitude, longitude, numDays);

        if (!data) {
            return res.status(500).json({ error: "Erro ao buscar previsão" });
        }

        res.status(200).json({
            cidade: data.city.name,
            pais: data.city.country,
            timezone: data.city.timezone,
            previsao: data.list.map((dia: any) => ({
                data: dia.dt,
                temperatura: {
                    minima: dia.temp.min,
                    maxima: dia.temp.max,
                },
                sensacao: dia.feels_like.day,
                descricao: dia.weather[0].description,
                icone: dia.weather[0].icon,
                umidade: dia.humidity,
                vento: dia.speed,
                nascerDoSol: new Date(dia.sunrise * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                porDoSol: new Date(dia.sunset * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            }))
        });
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
}

export default handler;
