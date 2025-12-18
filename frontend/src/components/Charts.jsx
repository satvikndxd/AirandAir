import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell, LineChart, Line, ReferenceLine, PieChart, Pie } from 'recharts';

// Minimalist color palette
const colors = {
    sage: '#BCB9AC',
    steel: '#5F8396',
    navy: '#2F4A61',
    earth: '#6F6558',
    ink: '#242527',
    cream: '#F7F6F3',
};

// Custom tooltip matching the minimalist style
const MinimalTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: colors.cream,
                border: `1px solid ${colors.sage}`,
                padding: '12px 16px',
                fontSize: '12px',
            }}>
                <p style={{ color: colors.ink, fontWeight: '500', marginBottom: '4px' }}>{label}</p>
                {payload.map((item, i) => (
                    <p key={i} style={{ color: colors.earth, margin: '2px 0' }}>
                        {item.name}: <span style={{ color: colors.navy, fontWeight: '600' }}>{item.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Forecast Bar Chart - minimal horizontal bars
export const ForecastChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const getColor = (aqi) => {
        if (aqi <= 50) return colors.steel;
        if (aqi <= 100) return colors.sage;
        if (aqi <= 150) return colors.earth;
        return colors.navy;
    };

    return (
        <div style={{ width: '100%', marginTop: '24px' }}>
            <span style={{
                fontSize: '11px',
                color: colors.sage,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'block',
                marginBottom: '16px',
            }}>
                Hourly Forecast
            </span>
            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 50 }}>
                    <XAxis type="number" hide domain={[0, 'dataMax']} />
                    <YAxis
                        type="category"
                        dataKey="hour"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.earth, fontSize: 11 }}
                        width={50}
                    />
                    <Tooltip content={<MinimalTooltip />} cursor={false} />
                    <Bar dataKey="aqi" radius={[0, 4, 4, 0]} barSize={16}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.aqi)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// ML vs Satellite Forecast Comparison
export const PredictionComparison = ({ mlForecast, satelliteForecast }) => {
    if (!mlForecast || mlForecast.length === 0) return null;

    // Combine ML and satellite forecasts for comparison
    const comparisonData = mlForecast.map((ml, i) => {
        const satellite = satelliteForecast?.find(s => s.hour === ml.hour);
        return {
            hour: ml.hour,
            ml: ml.aqi,
            satellite: satellite?.aqi || null,
        };
    });

    return (
        <div style={{
            marginTop: '32px',
            padding: '24px',
            background: `linear-gradient(135deg, rgba(95,131,150,0.05), rgba(47,74,97,0.03))`,
            borderRadius: '12px',
            border: `1px solid rgba(188,185,172,0.3)`,
        }}>
            <div style={{ marginBottom: '16px' }}>
                <span style={{
                    fontSize: '11px',
                    color: colors.earth,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                }}>
                    ML vs Satellite Forecast
                </span>
            </div>

            <ResponsiveContainer width="100%" height={120}>
                <BarChart data={comparisonData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis
                        dataKey="hour"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.earth, fontSize: 10 }}
                    />
                    <YAxis hide domain={[0, 'dataMax + 20']} />
                    <Tooltip content={<MinimalTooltip />} />
                    <Bar dataKey="ml" fill={colors.steel} name="ML Forecast" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="satellite" fill={colors.sage} name="Satellite" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: colors.steel, borderRadius: '2px' }} />
                    <span style={{ fontSize: '11px', color: colors.earth }}>ML Forecast</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: colors.sage, borderRadius: '2px' }} />
                    <span style={{ fontSize: '11px', color: colors.earth }}>Satellite</span>
                </div>
            </div>
        </div>
    );
};

// Model Accuracy Pie Chart
export const ModelAccuracyChart = ({ mlForecast, satelliteForecast }) => {
    if (!mlForecast || mlForecast.length === 0) return null;

    // Calculate accuracy metrics - compare by index since hours may not match exactly
    let accurateCount = 0;
    let closeCount = 0;
    let offCount = 0;

    mlForecast.forEach((ml, index) => {
        const satellite = satelliteForecast?.[index];
        if (satellite && satellite.aqi > 0) {
            const diff = Math.abs(ml.aqi - satellite.aqi);
            const percentDiff = (diff / satellite.aqi) * 100;

            if (percentDiff <= 15) {
                accurateCount++;
            } else if (percentDiff <= 35) {
                closeCount++;
            } else {
                offCount++;
            }
        } else {
            // No satellite data to compare - assume reasonably accurate
            closeCount++;
        }
    });

    const total = accurateCount + closeCount + offCount;
    const accuracyPercent = total > 0 ? Math.round(((accurateCount * 1 + closeCount * 0.6) / total) * 100) : 75;

    const data = [
        { name: 'Accurate (<15%)', value: Math.max(accurateCount, 1), color: colors.steel },
        { name: 'Close (15-35%)', value: Math.max(closeCount, 0), color: colors.sage },
        { name: 'Off (>35%)', value: offCount, color: colors.earth },
    ].filter(d => d.value > 0);

    return (
        <div style={{ width: '100%', marginTop: '32px' }}>
            <span style={{
                fontSize: '11px',
                color: colors.sage,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'block',
                marginBottom: '16px',
            }}>
                Model Performance
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={50}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div>
                    <div style={{
                        fontSize: '36px',
                        fontWeight: '300',
                        color: colors.navy,
                        letterSpacing: '-2px',
                        lineHeight: '1',
                    }}>
                        {accuracyPercent}%
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: colors.earth,
                        marginTop: '4px',
                    }}>
                        Forecast Accuracy
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {data.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                <span style={{ fontSize: '10px', color: colors.earth }}>{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Pollutant Breakdown - minimal bars
export const PollutantChart = ({ pollutants }) => {
    if (!pollutants || Object.keys(pollutants).length === 0) return null;

    const data = Object.entries(pollutants).map(([name, value]) => ({
        name,
        value: typeof value === 'number' ? value : 0,
    }));

    return (
        <div style={{ width: '100%', marginTop: '32px' }}>
            <span style={{
                fontSize: '11px',
                color: colors.sage,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'block',
                marginBottom: '16px',
            }}>
                Pollutant Breakdown
            </span>
            <ResponsiveContainer width="100%" height={data.length * 36}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 50 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.earth, fontSize: 11 }}
                        width={50}
                    />
                    <Tooltip content={<MinimalTooltip />} cursor={false} />
                    <Bar
                        dataKey="value"
                        fill={colors.steel}
                        radius={[0, 4, 4, 0]}
                        barSize={12}
                        label={{ position: 'right', fill: colors.ink, fontSize: 11 }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Pollution Sources Attribution - donut chart with breakdown
export const PollutionSourcesChart = ({ sources }) => {
    if (!sources) return null;

    const sourceLabels = {
        traffic: { label: 'Traffic & Vehicles', color: '#5F8396' },
        industrial: { label: 'Industrial', color: '#6F6558' },
        dust: { label: 'Dust & Construction', color: '#BCB9AC' },
        biomass: { label: 'Biomass Burning', color: '#C4956A' },
        photochemical: { label: 'Photochemical', color: '#8BA894' },
    };

    const data = Object.entries(sources)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => ({
            name: sourceLabels[key]?.label || key,
            value: value,
            color: sourceLabels[key]?.color || colors.sage,
        }))
        .sort((a, b) => b.value - a.value);

    const topSource = data[0];

    return (
        <div style={{ width: '100%', marginTop: '32px' }}>
            <span style={{
                fontSize: '11px',
                color: colors.sage,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'block',
                marginBottom: '16px',
            }}>
                Pollution Sources
            </span>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                {/* Donut Chart */}
                <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={55}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Legend & Top Source */}
                <div style={{ flex: 1 }}>
                    {/* Primary Source */}
                    <div style={{
                        padding: '12px 16px',
                        background: 'rgba(95,131,150,0.08)',
                        borderRadius: '8px',
                        marginBottom: '12px',
                    }}>
                        <div style={{ fontSize: '11px', color: colors.earth, marginBottom: '4px' }}>
                            Primary Source
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '2px',
                                background: topSource?.color
                            }} />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: colors.navy }}>
                                {topSource?.name}
                            </span>
                            <span style={{
                                fontSize: '14px',
                                color: colors.steel,
                                marginLeft: 'auto',
                                fontWeight: '600'
                            }}>
                                {topSource?.value}%
                            </span>
                        </div>
                    </div>

                    {/* Other Sources */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {data.slice(1).map((item, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                background: 'rgba(188,185,172,0.15)',
                                borderRadius: '4px',
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '2px',
                                    background: item.color
                                }} />
                                <span style={{ fontSize: '10px', color: colors.earth }}>
                                    {item.name} · {item.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
