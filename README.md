# Weather App

Este é um projeto de previsão do tempo criado utilizando **Next.js**, **React** e **TypeScript (TSX)**. Ele consome a **API da OpenWeather** para fornecer detalhes sobre o clima e **suporta busca por localização atual e busca por cidade** com o auxílio da **API de Autocomplete do Google Places**.

## Funcionalidades

- **Previsão do Tempo**: O aplicativo permite consultar a previsão do tempo para uma cidade ou coordenadas geográficas.
- **Busca por Localização Atual**: O app utiliza a API do navegador para obter a localização atual do usuário e mostrar a previsão do tempo.
- **Busca por Cidade**: Também é possível buscar a previsão do tempo pelo nome da cidade, e o sistema irá retornar os detalhes climáticos para os próximos dias.

## Tecnologias Utilizadas

- **Next.js**: Para renderização do lado do servidor (SSR) e renderização estática.
- **React**: Para construir interfaces de usuário interativas.
- **TypeScript (TSX)**: Para evitar erros comuns de tipagem.
- **Axios**: Para realizar requisições HTTP para consumir as APIs externas (OpenWeather e Google Places).
- **OpenWeather API**: Fornece os dados da previsão do tempo.
- **Google Places API**: Usada para busca de locais e sugestões de cidades.

## Como Rodar o Projeto Localmente

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/404Gui/weather-app.git
