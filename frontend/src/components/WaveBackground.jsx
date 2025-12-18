import React from 'react';

const WaveBackground = () => {
    return (
        <div className="absolute inset-x-0 bottom-0 h-[60%] z-0 opacity-60 pointer-events-none">
            <svg
                className="w-full h-full"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a2d2ff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#cdb4db" stopOpacity="1" />
                    </linearGradient>
                </defs>
                <path
                    fill="url(#gradient)"
                    fillOpacity="0.4"
                    d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ></path>
            </svg>
        </div>
    );
};

export default WaveBackground;
