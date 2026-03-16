'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { MyLocation as LocateIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const containerStyle = {
    width: '100%',
    height: '350px'
};

const defaultCenter = {
    lat: 21.1702,
    lng: 72.8311
};

interface GoogleMapPickerProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

export default function GoogleMapPicker({ onLocationSelect }: GoogleMapPickerProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || '',
        libraries: ['places'] as any
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState(defaultCenter);
    const [markerPos, setMarkerPos] = useState(defaultCenter);
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

    const getAddressFromCoords = async (lat: number, lng: number) => {
        const geocoder = new google.maps.Geocoder();
        try {
            const response = await geocoder.geocode({ location: { lat, lng } });
            if (response.results[0]) {
                return response.results[0].formatted_address;
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        return '';
    };

    const handleMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            setMarkerPos({ lat: newLat, lng: newLng });
            const address = await getAddressFromCoords(newLat, newLng);
            onLocationSelect({ lat: newLat, lng: newLng, address });
        }
    };

    const onLoad = useCallback((m: google.maps.Map) => {
        setMap(m);
    }, []);

    const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
        searchBoxRef.current = ref;
    };

    const onPlacesChanged = async () => {
        const places = searchBoxRef.current?.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            const location = place.geometry?.location;
            if (location) {
                const newPos = { lat: location.lat(), lng: location.lng() };
                setCenter(newPos);
                setMarkerPos(newPos);
                onLocationSelect({ 
                    lat: newPos.lat, 
                    lng: newPos.lng, 
                    address: place.formatted_address || '' 
                });
            }
        }
    };

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const newPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCenter(newPos);
                setMarkerPos(newPos);
                const address = await getAddressFromCoords(newPos.lat, newPos.lng);
                onLocationSelect({ lat: newPos.lat, lng: newPos.lng, address });
            }, (error) => {
                console.error("Geolocation error:", error);
            });
        }
    };

    if (!apiKey) {
        return (
            <Box sx={{ height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff1f2', border: '1px dashed #f43f5e', borderRadius: 4, p: 4, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#e11d48', fontWeight: 900, mb: 1 }}>Maps Configuration Error</Typography>
                <Typography variant="body2" sx={{ color: '#9f1239', fontWeight: 600, mb: 2 }}>
                    <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> is missing in <code>.env.local</code>.
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Please add your key and restart the dev server.
                </Typography>
            </Box>
        );
    }

    if (loadError) {
        return (
            <Box sx={{ height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff1f2', border: '1px dashed #f43f5e', borderRadius: 4, p: 4, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#e11d48', fontWeight: 900, mb: 1 }}>Google Maps Error</Typography>
                <Typography variant="body2" sx={{ color: '#9f1239', fontWeight: 600 }}>
                    {loadError.message.includes('ApiProjectMapError') 
                        ? "The project associated with this key was not found or the API is not enabled." 
                        : "Failed to load Google Maps. Please check your key and billing."}
                </Typography>
                <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary', fontSize: '10px' }}>
                    {loadError.message}
                </Typography>
            </Box>
        );
    }

    if (!isLoaded) return (
        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9' }}>
            <CircularProgress size={24} />
        </Box>
    );

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            <Box sx={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1, width: '90%', maxWidth: 400 }}>
                <StandaloneSearchBox
                    onLoad={onSearchBoxLoad}
                    onPlacesChanged={onPlacesChanged}
                >
                    <input
                        type="text"
                        placeholder="Search for your building, area or street..."
                        style={{
                            boxSizing: `border-box`,
                            border: `none`,
                            width: `100%`,
                            height: `45px`,
                            padding: `0 12px`,
                            borderRadius: `12px`,
                            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.1)`,
                            fontSize: `14px`,
                            outline: `none`,
                            textOverflow: `ellipses`,
                            fontWeight: 600
                        }}
                    />
                </StandaloneSearchBox>
            </Box>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                onLoad={onLoad}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                        {
                            "featureType": "poi",
                            "elementType": "labels",
                            "stylers": [{ "visibility": "off" }]
                        }
                    ]
                }}
            >
                <Marker
                    position={markerPos}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                    animation={google.maps.Animation.DROP}
                />
            </GoogleMap>

            <Button
                variant="contained"
                startIcon={<LocateIcon />}
                onClick={handleLocateMe}
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 900,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#f8fafc' }
                }}
            >
                Locate Me
            </Button>
            
            {/* Drivers Overlay */}
            <Box sx={{ position: 'absolute', bottom: 20, left: 20, bgcolor: 'rgba(255,255,255,0.95)', px: 2, py: 1.2, borderRadius: 2.5, boxShadow: '0 8px 16px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#0C831F', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <motion.span 
                        animate={{ opacity: [1, 0.4, 1] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '8px' }}
                    >🟢</motion.span> 
                    {Math.floor(Math.random() * (12 - 4 + 1) + 4)} Flash Drivers Nearby
                </Typography>
            </Box>
        </Box>
    );
}
