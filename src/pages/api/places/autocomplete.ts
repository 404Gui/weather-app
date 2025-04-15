import type { NextApiRequest, NextApiResponse } from "next";

const getPlacesAutocomplete = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const input = req.query.input as string;

        if (!input) {
            res.status(400).json({ error: "O parâmetro 'input' é obrigatório." });
            return;
        }

        const API_KEY = process.env.GOOGLE_API_KEY;
        const API_URL = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${API_KEY}&language=pt-BR`;

        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.status !== "OK") {
            res.status(400).json({ error: "Erro ao buscar sugestões", details: data });
            return;
        }

        const suggestions = data.predictions.map((place: any) => ({
            name: place.description,
        }));

        res.json(suggestions);
    } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        res.status(500).json({ error: "Erro ao buscar sugestões." });
    }
};

export default getPlacesAutocomplete;
