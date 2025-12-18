import React, { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SearchBar = ({ onLocationSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    const searchPlaces = async (searchQuery) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/search/${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data.success) {
                setResults(data.results);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchPlaces(value), 300);
    };

    const handleSelect = (place) => {
        onLocationSelect({
            lat: place.lat,
            lng: place.lng,
            name: place.name.split(',')[0] + (place.country ? `, ${place.country}` : '')
        });
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative', width: '280px' }}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => results.length > 0 && setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                placeholder="Search location"
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #BCB9AC',
                    color: '#242527',
                    fontSize: '14px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    outline: 'none',
                    textAlign: 'center',
                    letterSpacing: '0.5px',
                }}
            />

            {isOpen && results.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '320px',
                    background: '#F7F6F3',
                    border: '1px solid #BCB9AC',
                    overflow: 'hidden',
                    zIndex: 1000,
                }}>
                    {results.map((place, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelect(place)}
                            style={{
                                padding: '16px 20px',
                                cursor: 'pointer',
                                borderBottom: index < results.length - 1 ? '1px solid rgba(188,185,172,0.3)' : 'none',
                                transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(95,131,150,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{
                                fontSize: '14px',
                                color: '#242527',
                                fontWeight: '500',
                                marginBottom: '4px',
                            }}>
                                {place.name.split(',')[0]}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#6F6558',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {place.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
