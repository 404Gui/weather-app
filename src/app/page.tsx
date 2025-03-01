"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { MapPin, Thermometer, Droplet, Wind, Sunrise, Sunset } from "lucide-react";
import { MdMyLocation } from 'react-icons/md';
import moment from "moment-timezone";
import "moment/locale/pt-br";
import { AutoComplete, Input } from "antd";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

moment.locale("pt-br");

declare global {
    interface Window {
        cityClock: NodeJS.Timeout;
    }
}

interface DiaPrevisao {
    data: number;
    icone: string;
    descricao: string;
    temperatura: {
        maxima: string;
        minima: string;
    };
    umidade: string;
    vento: string;
    porDoSol: string;
    nascerDoSol: string;
    sensacao: string;
}

interface WeatherData {
    cidade: string;
    pais: string;
    timezone: number;
    previsao: DiaPrevisao[];
}

export default function Clima() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState("");
    const [cityTime, setCityTime] = useState<string>("");
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [suggestions, setSuggestions] = useState<{ name: string; lat: string; lon: string }[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);


    const fetchSuggestions = async (input: string) => {
        if (input.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/places/autocomplete?input=${encodeURIComponent(input)}`);
            const data = await res.json();
            console.log("Esses saos os dados", data)

            if (data.length > 0) {
                setSuggestions(data);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Erro ao buscar sugestões:", error);
        }
    };

    const handleSelect = (cityName: string) => {
        setCity(cityName);
        setSuggestions([]);
    };

    const atualizarRelogio = (timezoneOffset: number) => {
        clearInterval(window.cityClock);

        window.cityClock = setInterval(() => {

            const time = moment.utc().add(timezoneOffset, 'seconds');
            console.log("UTC:", moment.utc().format("HH:mm:ss"), "Offset:", timezoneOffset, "CityTime:", time.format("HH:mm:ss"));
            setCityTime(time.format("HH:mm:ss"));
        }, 1000);
    };

    useEffect(() => {
        return () => clearInterval(window.cityClock);
    }, []);


    const buscarClima = async (selectedCity: string) => {
        try {
            const response = await fetch(`${API_URL}/weather/city?city=${selectedCity}`);
            const data = await response.json();

            if (response.ok) {
                setWeather(data);
                setError("");

                const timezoneOffset = data.timezone;
                atualizarRelogio(timezoneOffset);
            } else {
                setError(data.error || "Erro ao buscar dados");
            }
        } catch (err) {
            setError("Erro ao conectar ao servidor");
            console.log(err);
        }
    };

    const buscarPorLocalizacao = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    try {
                        const response = await fetch(`${API_URL}/weather/coordinates?lat=${lat}&lon=${lon}`);
                        const data = await response.json();

                        if (response.ok) {
                            setWeather(data);
                            setError("");

                            const timezoneOffset = data.timezone;
                            atualizarRelogio(timezoneOffset);
                        } else {
                            setError(data.error || "Erro ao buscar dados");
                        }
                    } catch (err) {
                        setError("Erro ao conectar ao servidor.");
                        console.log(err);
                    }
                },
                (error) => {
                    setError("Erro ao obter localização: " + error.message);
                }
            );
        } else {
            setError("Geolocalização não é suportada pelo seu navegador.");
        }
    };

    return (
        <div className={styles.container}>
            <header className={`${styles.initialScreen} ${weather ? styles.withWeather : ""}`}>
                <div className={styles.searchContainer}>
                    <motion.div
                        className={`${styles.searchWrapper} ${weather ? styles.withWeather : ""}`}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        <AutoComplete
                            options={suggestions.map((s) => ({
                                value: s.name,
                                label: (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px" }}>
                                        <MdMyLocation style={{ color: "#1890ff" }} />
                                        <span>{s.name}</span>
                                    </div>
                                ),
                            }))}
                            onSelect={(value) => {
                                setCity(value);
                                buscarClima(value);
                            }}
                            onSearch={fetchSuggestions}
                            value={city}
                            onChange={setCity}
                            placeholder="Digite o nome da cidade"
                            className={styles.input}
                        >
                            <Input />
                        </AutoComplete>
                        <button onClick={buscarPorLocalizacao} className={styles.locationButton}>
                            <MdMyLocation />
                            <span>Usar localização</span>
                        </button>
                    </motion.div>

                    {error && (
                        <p className={styles.errorMessage}>{error}</p>
                    )}
                </div>
            </header>
            {weather && (
                <motion.div className={styles.weatherContainer}
                    key={weather.cidade}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}>
                    <section className={styles.cityAndMapPin}>
                        <h2 className={styles.city}>
                            <MapPin></MapPin>
                            {weather.cidade}, {weather.pais}
                        </h2>
                        <h3 className={styles.todayTitle} style={{}}>Hoje, <span>{cityTime}</span></h3>
                    </section>
                    <motion.div className={styles.todayWeather}
                    >
                        <div className={styles.todayInfosWrapper}>
                            <span className={styles.todayAndIconTempSec}>
                                <span className={styles.todayAndIconTemp}>
                                    <Thermometer color="#ff5733" />
                                    <p className={styles.todayTemp}>{weather.previsao[0].temperatura.maxima}°C</p>
                                </span>
                                <span className={styles.todayDetails}>Sensação térmica: {weather.previsao[0].sensacao}°C</span>
                            </span>
                        </div>
                        <section>
                            <Image
                                src={`https://openweathermap.org/img/wn/${weather.previsao[0].icone}@2x.png`}
                                alt={weather.previsao[0].descricao}
                                width={100}
                                height={100}
                                className={styles.todayIcon}
                                priority
                            />
                            <p className={styles.todayDescription}>{weather.previsao[0].descricao}</p>
                        </section>

                        <ul className={styles.detailsList}>
                            <li data-tooltip="Nascer do Sol">
                                <Sunrise size={17} color="#f4a261" style={{ marginRight: 4 }} />
                                {weather.previsao[0].nascerDoSol}
                            </li>
                            <li data-tooltip="Pôr do Sol">
                                <Sunset size={20} color="#e76f51" style={{ marginRight: 4 }} />
                                {weather.previsao[0].porDoSol}
                            </li>
                            <li data-tooltip="Velocidade do Vento">
                                <Wind size={20} color="#00b4d8" style={{ marginRight: 4 }} />
                                {weather.previsao[0].vento} m/s
                            </li>
                            <li data-tooltip="Umidade do Ar">
                                <Droplet size={20} color="#0077b6" style={{ marginRight: 4, fill: "#0077b6" }} />
                                {weather.previsao[0].umidade} %
                            </li>
                        </ul>
                    </motion.div>


                    <div className={styles.forecastContainer}>
                        <p className={styles.nextDays}>Próximos dias:</p>
                        <motion.div className={styles.forecastList}>
                            {weather.previsao.slice(1).map((dia, index) => (
                                <motion.div
                                    key={index}
                                    className={styles.forecastCard}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <p className={styles.date}>{new Date(dia.data * 1000).toLocaleDateString()}</p>
                                    <img
                                        src={`https://openweathermap.org/img/wn/${dia.icone}@2x.png`}
                                        alt={dia.descricao}
                                        className={styles.weatherIcon}
                                    />
                                    <p className={styles.description}>{dia.descricao}</p>
                                    <span>
                                        <strong>{dia.temperatura.maxima}°C</strong> | {dia.temperatura.minima}°C
                                    </span>

                                    {hoveredIndex === index && (
                                        <motion.div
                                            className={styles.detailsContainer}
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className={styles.details}>
                                                <Thermometer className={styles.detailIcon} style={{ color: "#ff5733" }} />
                                                <span>Sensação térmica: {dia.sensacao}°C</span>
                                            </div>
                                            <div className={styles.details}>
                                                <Droplet className={styles.detailIcon} style={{ color: "#0077b6" }} />
                                                <span>Umidade: {dia.umidade}%</span>
                                            </div>
                                            <div className={styles.details}>
                                                <Wind className={styles.detailIcon} style={{ color: "#00b4d8" }} />
                                                <span>Vento: {dia.vento} m/s</span>
                                            </div>
                                            <div className={styles.details}>
                                                <Sunset className={styles.detailIcon} style={{ color: "#e76f51" }} />
                                                <span>Nascer do Sol: {dia.nascerDoSol}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                </motion.div>
            )}
        </div>
    );
}
