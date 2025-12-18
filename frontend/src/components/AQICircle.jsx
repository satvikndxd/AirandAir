import React from 'react';

const AQICircle = ({ aqi, status }) => {
    // Calculate arc progress (0-300 AQI maps to 0-100% of arc)
    const maxAqi = 300;
    const progress = Math.min(aqi, maxAqi) / maxAqi;

    // SVG Arc math
    const radius = 120;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * 0.75; // 270 degree arc
    const dashOffset = arcLength - (progress * arcLength);

    // Dynamic color based on AQI
    let strokeColor = "#10b981"; // Green
    if (aqi > 50) strokeColor = "#84cc16"; // Lime
    if (aqi > 100) strokeColor = "#eab308"; // Yellow
    if (aqi > 150) strokeColor = "#f97316"; // Orange
    if (aqi > 200) strokeColor = "#ef4444"; // Red

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg
                width="280"
                height="280"
                viewBox="0 0 280 280"
                className="transform rotate-[135deg]"
            >
                {/* Background Track */}
                <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    fill="none"
                    stroke="rgba(200, 200, 200, 0.3)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${arcLength} ${circumference}`}
                />
                {/* Progress Arc */}
                <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
                    className="drop-shadow-lg"
                />
            </svg>

            {/* Center Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-7xl font-bold tracking-tight" style={{ color: strokeColor }}>
                    {Math.round(aqi)}
                </span>
                <span className="text-sm font-medium uppercase tracking-widest text-gray-500 mt-1">
                    AQI
                </span>
                <span
                    className="mt-3 px-4 py-1.5 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: `${strokeColor}20`, color: strokeColor }}
                >
                    {status}
                </span>
            </div>
        </div>
    );
};

export default AQICircle;
