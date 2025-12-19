import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Simulator = ({ pollutants }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [multipliers, setMultipliers] = useState({
        traffic: 1.0,
        industrial: 1.0,
        power: 1.0,
        biomass: 1.0
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSliderChange = (source, value) => {
        setMultipliers(prev => ({ ...prev, [source]: parseFloat(value) }));
    };

    // Debounce simulation
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(async () => {
            if (!pollutants) return;

            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/simulate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pollutants: pollutants,
                        multipliers: multipliers
                    })
                });
                const data = await response.json();
                setResult(data);
            } catch (error) {
                console.error("Simulation failed:", error);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [multipliers, pollutants, isOpen]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="animate-slide-up"
                style={{
                    marginTop: '24px',
                    width: '100%',
                    padding: '16px',
                    background: '#2F4A61',
                    color: '#FFF',
                    borderRadius: '16px',
                    border: 'none',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    maxWidth: '300px'
                }}
            >
                <span>🎛️</span> Try "God Mode" Simulator
            </button>
        );
    }

    return (
        <div style={{
            marginTop: '24px',
            background: '#F9F9F8',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(0,0,0,0.05)',
            maxWidth: '350px' // Slightly wider
        }} className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#2F4A61', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    What-If Simulator
                </h3>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#BCB9AC' }}
                >
                    ×
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(multipliers).map(([source, value]) => (
                    <div key={source}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#6F6558' }}>
                            <span style={{ textTransform: 'capitalize' }}>{source}</span>
                            <span>{Math.round(value * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={value}
                            onChange={(e) => handleSliderChange(source, e.target.value)}
                            style={{
                                width: '100%',
                                accentColor: '#2F4A61',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#BCB9AC', fontSize: '12px' }}>Simulating...</div>
                ) : result?.aqi !== undefined ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#BCB9AC', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Projected AQI
                        </div>
                        <div style={{ fontSize: '32px', fontFamily: "'Instrument Serif', serif", color: result.color }}>
                            {result.aqi}
                        </div>
                        {result.improvement > 0 ? (
                            <div style={{ fontSize: '12px', color: '#5F8396', marginTop: '4px' }}>
                                ▼ {result.improvement}% improvement
                            </div>
                        ) : result.improvement < 0 ? (
                            <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>
                                ▲ {Math.abs(result.improvement)}% worse
                            </div>
                        ) : (
                            <div style={{ fontSize: '12px', color: '#BCB9AC', marginTop: '4px' }}>
                                No change
                            </div>
                        )}
                        <div style={{ fontSize: '12px', color: '#6F6558', marginTop: '8px' }}>
                            {result.risk}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#BCB9AC', fontSize: '12px' }}>Adjust sliders to simulate</div>
                )}
            </div>
        </div>
    );
};

export default Simulator;
