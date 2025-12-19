import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import GlobeView from './GlobeView';
import { ForecastChart, PredictionComparison, ModelAccuracyChart, PollutantChart, PollutionSourcesChart } from './Charts';
import { CigaretteCalculator, SmartScheduler } from './Widgets';
import Simulator from './Simulator';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AQIDashboard = () => {
    const [selectedLocation, setSelectedLocation] = useState({ lat: 28.6139, lng: 77.2090, name: 'New Delhi' });
    const [locationData, setLocationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());
    const [history, setHistory] = useState([]);

    const fetchLocationAQI = async (lat, lng, showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/aqi/${lat}/${lng}`);
            const result = await response.json();
            setLocationData(result);

            // Add to history for trend chart
            if (result.aqi) {
                setHistory(prev => {
                    const newEntry = {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        aqi: result.aqi,
                        predicted: result.ml_forecast && result.ml_forecast.length > 0 ? result.ml_forecast[0].aqi : null
                    };
                    // Keep last 10 entries
                    const updated = [...prev, newEntry].slice(-10);
                    return updated;
                });
            }
        } catch (error) {
            console.error('Failed to fetch AQI:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        setHistory([]); // Reset history for new location
        fetchLocationAQI(location.lat, location.lng);
    };

    // Get user's current location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Try to get location name from reverse geocoding
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                            { headers: { 'User-Agent': 'AirZen-App/1.0' } }
                        );
                        const data = await response.json();
                        const name = data.address?.city || data.address?.town || data.address?.village || 'Your Location';

                        setSelectedLocation({ lat: latitude, lng: longitude, name });
                    } catch {
                        setSelectedLocation({ lat: latitude, lng: longitude, name: 'Your Location' });
                    }

                    fetchLocationAQI(latitude, longitude);
                },
                (error) => {
                    console.log('Geolocation denied, using default location');
                    fetchLocationAQI(selectedLocation.lat, selectedLocation.lng);
                },
                { timeout: 5000 }
            );
        } else {
            fetchLocationAQI(selectedLocation.lat, selectedLocation.lng);
        }
    }, []);

    // Auto-refresh interval - every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLocationAQI(selectedLocation.lat, selectedLocation.lng, false);
        }, 120000); // 2 minutes
        return () => clearInterval(interval);
    }, [selectedLocation.lat, selectedLocation.lng]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getHealthMessage = (aqi) => {
        if (aqi <= 50) return { short: 'Breathe easy', long: 'The air is clean. A perfect day to be outside.' };
        if (aqi <= 100) return { short: 'Stay aware', long: 'Air quality is acceptable. Sensitive individuals should take note.' };
        if (aqi <= 150) return { short: 'Take care', long: 'Consider reducing prolonged outdoor activities.' };
        return { short: 'Stay inside', long: 'Air quality is concerning. Limit exposure.' };
    };

    const aqi = locationData?.aqi || 0;
    const message = getHealthMessage(aqi);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F7F6F3',
            position: 'relative',
        }}>
            {/* Subtle grid background */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(188,185,172,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(188,185,172,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
                pointerEvents: 'none',
            }} />

            {/* Floating abstract shape */}
            <div className="animate-float" style={{
                position: 'fixed',
                top: '15%',
                right: '8%',
                width: '300px',
                height: '300px',
                borderRadius: '47% 53% 61% 39% / 45% 51% 49% 55%',
                background: 'linear-gradient(135deg, rgba(95,131,150,0.08), rgba(47,74,97,0.05))',
                filter: 'blur(1px)',
                pointerEvents: 'none',
            }} />

            {/* Top bar */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px 48px',
                zIndex: 100,
                background: 'rgba(247,246,243,0.8)',
                backdropFilter: 'blur(20px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: aqi <= 50 ? '#5F8396' : aqi <= 100 ? '#BCB9AC' : aqi <= 150 ? '#6F6558' : '#242527',
                    }} />
                    <span style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: '20px',
                        color: '#242527',
                        letterSpacing: '-0.5px',
                    }}>
                        air
                    </span>
                </div>

                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <SearchBar onLocationSelect={handleLocationSelect} />
                </div>

                <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '13px',
                    color: '#6F6558',
                    letterSpacing: '0.5px',
                }}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </header>

            {/* Main content */}
            <main className="dashboard-grid" style={{ paddingTop: '100px' }}>
                {/* Left side - Typography focused */}
                <div className="left-panel animate-slide-up">
                    {/* Location */}
                    <div className="animate-slide-up" style={{ marginBottom: '16px' }}>
                        <span style={{
                            fontSize: '12px',
                            color: '#5F8396',
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            fontWeight: '500',
                        }}>
                            Currently viewing
                        </span>
                    </div>

                    <h1 className="animate-slide-up" style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: 'clamp(48px, 8vw, 120px)',
                        fontWeight: '400',
                        color: '#242527',
                        lineHeight: '0.95',
                        marginBottom: '32px',
                        letterSpacing: '-3px',
                    }}>
                        {selectedLocation.name.split(',')[0]}
                    </h1>

                    {/* AQI Display */}
                    {!loading && locationData && (
                        <div className="animate-slide-up" style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '16px',
                            marginBottom: '48px',
                        }}>
                            <span style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: '140px',
                                fontWeight: '300',
                                color: '#2F4A61',
                                lineHeight: '1',
                                letterSpacing: '-8px',
                            }}>
                                {Math.round(aqi)}
                            </span>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                paddingBottom: '20px',
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    color: '#6F6558',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                }}>
                                    AQI
                                </span>
                                <span style={{
                                    fontSize: '13px',
                                    color: '#BCB9AC',
                                    marginTop: '4px',
                                }}>
                                    {locationData.risk_level}
                                </span>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div style={{
                            fontSize: '80px',
                            color: '#BCB9AC',
                            fontWeight: '300',
                            marginBottom: '48px',
                        }}>
                            ···
                        </div>
                    )}

                    {/* Message */}
                    <div className="animate-slide-up" style={{ maxWidth: '400px' }}>
                        <p style={{
                            fontFamily: "'Instrument Serif', serif",
                            fontSize: '28px',
                            fontStyle: 'italic',
                            color: '#5F8396',
                            marginBottom: '16px',
                            lineHeight: '1.3',
                        }}>
                            "{message.short}"
                        </p>
                        <p style={{
                            fontSize: '15px',
                            color: '#6F6558',
                            lineHeight: '1.7',
                        }}>
                            {message.long}
                        </p>
                    </div>

                    {/* Pollutants - minimal */}
                    {locationData?.pollutants && Object.keys(locationData.pollutants).length > 0 && (
                        <div className="animate-slide-up" style={{
                            marginTop: '64px',
                            display: 'flex',
                            gap: '48px',
                        }}>
                            {Object.entries(locationData.pollutants).slice(0, 3).map(([key, value]) => (
                                <div key={key}>
                                    <span style={{
                                        fontSize: '11px',
                                        color: '#BCB9AC',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        display: 'block',
                                        marginBottom: '8px',
                                    }}>
                                        {key}
                                    </span>
                                    <span style={{
                                        fontSize: '32px',
                                        fontWeight: '500',
                                        color: '#2F4A61',
                                        letterSpacing: '-1px',
                                    }}>
                                        {typeof value === 'number' ? Math.round(value) : value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ML Forecast & API Forecast */}
                    {locationData && (
                        <div className="animate-slide-up" style={{ marginTop: '48px' }}>
                            {/* ML Forecast - Next 3 hours */}
                            {locationData.ml_forecast && locationData.ml_forecast.length > 0 && (
                                <div style={{ marginBottom: '32px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '16px',
                                    }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: '#5F8396',
                                            animation: 'pulse-slow 2s infinite',
                                        }} />
                                        <span style={{
                                            fontSize: '11px',
                                            color: '#5F8396',
                                            textTransform: 'uppercase',
                                            letterSpacing: '2px',
                                            fontWeight: '600',
                                        }}>
                                            ML Forecast
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {locationData.ml_forecast.map((f, i) => (
                                            <div key={i} style={{
                                                padding: '12px 16px',
                                                background: 'rgba(95,131,150,0.12)',
                                                borderRadius: '6px',
                                                textAlign: 'center',
                                                border: '1px solid rgba(95,131,150,0.2)',
                                            }}>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#5F8396',
                                                    marginBottom: '4px',
                                                }}>
                                                    {f.hour}
                                                </div>
                                                <div style={{
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    color: '#2F4A61',
                                                }}>
                                                    {f.aqi}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Satellite Forecast - Next 6 hours */}
                            {locationData.forecast && locationData.forecast.length > 0 && (
                                <div>
                                    <span style={{
                                        fontSize: '11px',
                                        color: '#BCB9AC',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        display: 'block',
                                        marginBottom: '16px',
                                    }}>
                                        Satellite Forecast
                                    </span>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {locationData.forecast.slice(0, 6).map((f, i) => (
                                            <div key={i} style={{
                                                padding: '12px 16px',
                                                background: 'rgba(188,185,172,0.15)',
                                                borderRadius: '6px',
                                                textAlign: 'center',
                                            }}>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#6F6558',
                                                    marginBottom: '4px',
                                                }}>
                                                    {f.hour}
                                                </div>
                                                <div style={{
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    color: '#2F4A61',
                                                }}>
                                                    {f.aqi}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Widgets - Only show if data is available */}
                    {locationData && (
                        <>
                            <CigaretteCalculator pollutants={locationData.pollutants} />
                            <Simulator pollutants={locationData.pollutants} />
                        </>
                    )}

                    {/* Source */}
                    {locationData?.source && (
                        <div className="animate-slide-up" style={{
                            marginTop: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: locationData.source.includes('Live') ? '#5F8396' : '#BCB9AC',
                            }} />
                            <span style={{
                                fontSize: '12px',
                                color: '#6F6558',
                                letterSpacing: '0.5px',
                            }}>
                                {locationData.source} • Updated {locationData.last_updated || 'now'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right side - Globe */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}>
                    {/* Vertical line */}
                    <div className="vertical-divider" />

                    <div className="right-panel">
                        {/* Globe Container - Fixed circular spot */}
                        <div className="globe-container">
                            <div style={{
                                width: '120%', // Slightly larger to fill edges if needed
                                height: '120%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <GlobeView
                                    selectedLocation={selectedLocation}
                                    onLocationSelect={handleLocationSelect}
                                />
                            </div>
                        </div>

                        {/* Coordinates */}
                        <div style={{
                            marginTop: '24px',
                            textAlign: 'center',
                        }}>
                            <span style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: '11px',
                                color: '#BCB9AC',
                                letterSpacing: '3px',
                            }}>
                                {selectedLocation.lat.toFixed(4)}° N · {Math.abs(selectedLocation.lng).toFixed(4)}° {selectedLocation.lng >= 0 ? 'E' : 'W'}
                            </span>
                        </div>


                        {/* Charts Section */}
                        {locationData && (
                            <div style={{
                                width: '100%',
                                maxWidth: '500px',
                                paddingBottom: '80px',
                            }}>
                                {/* ML vs Satellite Forecast */}
                                <PredictionComparison
                                    mlForecast={locationData.ml_forecast}
                                    satelliteForecast={locationData.forecast}
                                />


                                {/* Model Accuracy Chart */}
                                <ModelAccuracyChart
                                    mlForecast={locationData.ml_forecast}
                                    satelliteForecast={locationData.forecast}
                                />

                                {/* Forecast Chart */}
                                {locationData.forecast && locationData.forecast.length > 0 && (
                                    <ForecastChart data={locationData.forecast} />
                                )}

                                {/* Pollutant Breakdown */}
                                <PollutantChart pollutants={locationData.pollutants} />

                                {/* Pollution Sources Attribution */}
                                <PollutionSourcesChart sources={locationData.pollution_sources} />

                                <SmartScheduler forecast={locationData.forecast} />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom accent */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, 
            #BCB9AC 0%, 
            #5F8396 25%, 
            #2F4A61 50%, 
            #6F6558 75%, 
            #242527 100%
        )`,
            }} />
        </div>
    );
};

export default AQIDashboard;
