import React, { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';

const GlobeView = ({ selectedLocation, onLocationSelect }) => {
    const globeEl = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = React.useState({ width: 500, height: 500 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight || 500
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        // Resize observer for more robust resizing
        const observer = new ResizeObserver(updateDimensions);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.2;
            globeEl.current.pointOfView({ altitude: 2.5 });
        }
    }, []);

    const handleInteraction = () => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;
        }
    };

    const handleGlobeClick = ({ lat, lng }) => {
        onLocationSelect({ lat, lng, name: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°` });
    };

    const markerData = selectedLocation ? [{
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        size: 0.3,
        color: '#2F4A61'
    }] : [];

    return (
        <div
            ref={containerRef}
            onMouseDown={handleInteraction}
            onTouchStart={handleInteraction}
            style={{
                width: '100%',
                height: '500px', // Fixed height container
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                filter: 'saturate(0.3) contrast(1.1)',
                opacity: 0.9,
                cursor: 'grab',
            }}
        >
            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundColor="rgba(0,0,0,0)"
                atmosphereColor="#5F8396"
                atmosphereAltitude={0.15}
                onGlobeClick={handleGlobeClick}
                pointsData={markerData}
                pointAltitude="size"
                pointColor="color"
                pointRadius={0.4}
                animateIn={true}
            />
        </div>
    );
};

export default GlobeView;
