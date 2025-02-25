"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { MapPin, Thermometer, Droplet, Wind, Sunrise, Sunset } from "lucide-react";
import { FaSearch, FaMapMarkerAlt  } from 'react-icons/fa';
import moment from "moment-timezone";
import "moment/locale/pt-br";
import {Input} from "antd";
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


    const buscarClima = async () => {
        try {
            const response = await fetch(`${API_URL}/weather/city?city=${city}`);
            const data = await response.json();

            if (response.ok) {
                setWeather(data);
                setError("");

                const timezoneOffset = data.timezone
                atualizarRelogio(timezoneOffset)
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
            <div className={`${styles.initialScreen} ${weather ? styles.withWeather: ""}`}>
                <div className={styles.searchContainer}>
                    <div className={styles.searchWrapper}>
                        <Input
                            type="text"
                            placeholder="Digite o nome da cidade"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={styles.input}
                        />
                        <button
                            onClick={buscarClima}
                            className={styles.button}
                        >
                            <FaSearch />
                            <span>Buscar</span>
                        </button>
                        <button
                            onClick={buscarPorLocalizacao}
                            className={styles.locationButton}
                        >
                            <FaMapMarkerAlt />
                            <span>Usar localização</span>
                        </button>
                    </div>
                    {error && (
                        <p className={styles.errorMessage}>{error}</p>
                    )}
                </div>
            </div>
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
                                    <Thermometer color="#ff5733"/>
                                    <p className={styles.todayTemp}>{weather.previsao[0].temperatura.maxima}°C</p>
                                </span>
                                <span className={styles.todayDetails}>Sensação térmica: {weather.previsao[0].sensacao}°C</span>
                            </span> 
                        </div>
                        <section>
                            <img
                                src={`https://openweathermap.org/img/wn/${weather.previsao[0].icone}@2x.png`}
                                alt={weather.previsao[0].descricao}
                                className={styles.todayIcon}
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

                    <motion.div className={styles.forecastList}>
                        {weather.previsao.slice(1).map((dia, index) => (
                            <div key={index} className={styles.forecastCard}>
                            <p className={styles.date}>
                                {moment.unix(dia.data).format("dddd, DD/MM")}
                            </p>
                            <img
                                src={`https://openweathermap.org/img/wn/${dia.icone}@2x.png`}
                                alt={dia.descricao}
                                className={styles.weatherIcon}
                            />
                            <p className={styles.description}>{dia.descricao}</p>
                        
                            <div className={styles.details}>
                                <Thermometer className={styles.detailIcon} style={{ color: "#ff5733" }} /> 
                                <span>
                                    <strong>{dia.temperatura.maxima}°C</strong> | {dia.temperatura.minima}°C
                                </span>
                            </div>
                        
                            <div className={styles.details}>
                                <Droplet className={styles.detailIcon} style={{ color: "#0077b6" }} />
                                <span>{dia.umidade}%</span>
                            </div>
                        
                            <div className={styles.details}>
                                <Wind className={styles.detailIcon} style={{ color: "#00b4d8" }} />
                                <span>{dia.vento} m/s</span>
                            </div>
                        
                            <div className={styles.details}>
                                <Sunset className={styles.detailIcon} style={{ color: "#e76f51" }} />
                                <span>{dia.nascerDoSol}</span>
                            </div>
                        </div>
                        
                        ))}
                    </motion.div>


                </motion.div>
            )}            
        </div>
    );
}
