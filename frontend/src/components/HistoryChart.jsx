import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HistoryChart = ({ data }) => {
    const latest = data.length > 0 ? data[data.length - 1].aqi : 0;

    let strokeColor = "#10b981";
    if (latest > 100) strokeColor = "#eab308";
    if (latest > 150) strokeColor = "#ef4444";

    return (
        <div className="w-full h-[180px]">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                <i className="fa-solid fa-chart-area mr-2 text-emerald-400"></i>
                Live Trend
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="time"
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            fontSize: '12px',
                            color: '#fff'
                        }}
                        cursor={{ stroke: strokeColor, strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="aqi"
                        stroke={strokeColor}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAqi)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HistoryChart;
