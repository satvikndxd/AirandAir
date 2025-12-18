import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell, LineChart, Line, ReferenceLine } from 'recharts';

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

// Prediction vs Actual - minimal comparison
export const PredictionComparison = ({ actual, predicted }) => {
    if (!predicted) return null;

    const diff = predicted - actual;
    const diffPercent = ((diff / actual) * 100).toFixed(1);

    const data = [
        { name: 'Live', value: actual },
        { name: 'ML', value: predicted },
    ];

    return (
        <div style={{
            marginTop: '32px',
            padding: '24px',
            background: `linear-gradient(135deg, rgba(95,131,150,0.05), rgba(47,74,97,0.03))`,
            borderRadius: '12px',
            border: `1px solid rgba(188,185,172,0.3)`,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <span style={{
                        fontSize: '11px',
                        color: colors.earth,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}>
                        ML Prediction
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '8px' }}>
                        <span style={{
                            fontSize: '48px',
                            fontWeight: '300',
                            color: colors.navy,
                            letterSpacing: '-2px',
                            lineHeight: '1',
                        }}>
                            {predicted}
                        </span>
                        <span style={{
                            fontSize: '14px',
                            color: diff > 0 ? colors.earth : colors.steel,
                        }}>
                            {diff > 0 ? '↑' : '↓'} {Math.abs(diffPercent)}% from live
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: colors.sage }}>LIVE</span>
                    <div style={{ fontSize: '24px', color: colors.ink, fontWeight: '500' }}>{actual}</div>
                </div>
            </div>

            {/* Visual comparison bar */}
            <div style={{ position: 'relative', height: '8px', background: 'rgba(188,185,172,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute',
                    height: '100%',
                    width: `${(actual / Math.max(actual, predicted)) * 100}%`,
                    background: colors.steel,
                    borderRadius: '4px',
                }} />
                <div style={{
                    position: 'absolute',
                    height: '100%',
                    left: `${(predicted / Math.max(actual, predicted)) * 100}%`,
                    width: '2px',
                    background: colors.navy,
                    transform: 'translateX(-50%)',
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '10px', color: colors.sage }}>Live measurement</span>
                <span style={{ fontSize: '10px', color: colors.sage }}>ML prediction</span>
            </div>
        </div>
    );
};

// Historical Trend Line
export const TrendChart = ({ history }) => {
    if (!history || history.length < 2) return null;

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
                Recent Trend
            </span>
            <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={history} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.steel} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={colors.steel} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.sage, fontSize: 10 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip content={<MinimalTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="aqi"
                        stroke={colors.steel}
                        strokeWidth={2}
                        fill="url(#areaGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: colors.navy }}
                    />
                </AreaChart>
            </ResponsiveContainer>
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
