import React from 'react';

// --- Cigarette Calculator ---
export const CigaretteCalculator = ({ pollutants }) => {
    const pm25 = pollutants?.["PM2.5"] || 0;
    // Berkley Earth Rule of Thumb: 22 ug/m3 of PM2.5 for 24 hours == 1 cigarette
    const cigarettes = (pm25 / 22).toFixed(1);

    // Determine color/severity
    let severityColor = '#5F8396'; // Blue/Neutral
    let message = "Clean air, keep breathing.";

    if (cigarettes > 0.5) { severityColor = '#6F6558'; message = "Not great, but okay."; }
    if (cigarettes > 2.0) { severityColor = '#D97706'; message = "Passive smoking levels."; }
    if (cigarettes > 5.0) { severityColor = '#DC2626'; message = "Serious health risk."; }

    return (
        <div className="animate-slide-up" style={{
            marginTop: '32px',
            padding: '24px',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.05)',
            maxWidth: '300px'
        }}>
            <div style={{ fontSize: '12px', color: '#BCB9AC', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                24h Exposure Equivalent
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '48px', fontFamily: "'Instrument Serif', serif", color: '#242527' }}>
                    {cigarettes}
                </span>
                <span style={{ fontSize: '16px', color: '#6F6558' }}>cigarettes</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '13px', color: severityColor, fontWeight: 500 }}>
                {message}
            </div>
        </div>
    );
};

// --- Smart Scheduler ---
export const SmartScheduler = ({ forecast }) => {
    if (!forecast || forecast.length < 5) return null;

    // Find best 3-hour window in the next 12 hours
    let bestWindow = null;
    let minAvgAQI = Infinity;

    // Look ahead next 12 hours (or length of forecast)
    const limit = Math.min(12, forecast.length - 3);

    for (let i = 0; i < limit; i++) {
        const slice = forecast.slice(i, i + 3);
        const avgAQI = slice.reduce((sum, item) => sum + item.aqi, 0) / 3;

        if (avgAQI < minAvgAQI) {
            minAvgAQI = avgAQI;
            bestWindow = {
                start: slice[0].time, // "08 PM" string? Need to check format
                end: slice[2].time,
                aqi: Math.round(avgAQI)
            };
        }
    }

    if (!bestWindow) return null;

    return (
        <div style={{ width: '100%', maxWidth: '500px', marginTop: '40px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#BCB9AC', textTransform: 'uppercase' }}>
                    Smart Scheduler
                </span>
                <span style={{ fontSize: '18px' }}>🏃</span>
            </div>

            <div style={{
                background: '#F9F9F8',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(0,0,0,0.04)'
            }}>
                <div>
                    <div style={{ fontSize: '14px', color: '#6F6558', marginBottom: '4px' }}>
                        Best time for outdoor activity
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#242527', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {bestWindow.start} — {bestWindow.end}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#BCB9AC' }}>Avg AQI</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: '#5F8396' }}>{bestWindow.aqi}</div>
                </div>
            </div>
        </div>
    );
};
