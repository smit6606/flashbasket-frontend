'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Stack,
    Button,
    Card,
    CardContent,
    alpha,
    Paper,
    Skeleton,
    Avatar,
    IconButton,
    InputBase,
    Slider,
    Divider,
} from '@mui/material';
import {
    Storefront as StoreIcon,
    MyLocation as LocationIcon,
    Search as SearchIcon,
    ArrowForward as ArrowIcon,
    Verified as VerifiedIcon,
    DirectionsRun as DeliveryIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Seller {
    id: number;
    shop_name: string;
    shop_description: string;
    shop_image: string;
    latitude: number;
    longitude: number;
    distance?: number;
    address?: string;
}

const STORE_DESCRIPTIONS = [
    'Your neighborhood hub for farm-fresh organic produce and daily premium bakery essentials.',
    'Specializing in imported gourmet goods, exotic spices, and the finest local dairy products.',
    'The quickest stop for your everyday household needs with a heavy focus on quality meats.',
    'A curated selection of international snacks, fresh beverages, and rapid daily necessities.',
    'Your trusted local supplier of freshly harvested vegetables and wholesome whole grains.',
];

export default function SellersPage() {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [distance, setDistance] = useState(10);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    const fetchSellers = async (lat?: number, lng?: number, dist = distance) => {
        try {
            setSearching(true);
            const endpoint = (lat && lng) ? `/sellers/nearby?lat=${lat}&lng=${lng}&distance=${dist}` : '/sellers';
            const response = await api.get(endpoint);
            setSellers(response.data);
            if (lat && lng) {
                toast.success(`Found ${response.data.length} shops within ${dist}km`);
            }
        } catch (err) {
            console.error('Failed to fetch sellers', err);
            toast.error('Could not load local shops');
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setSearching(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                fetchSellers(latitude, longitude, distance);
            },
            (error) => {
                console.error('Location error:', error);
                toast.error('Access to location denied. Showing all stores.');
                fetchSellers();
            }
        );
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            {/* Hero / Header Section */}
            <Box sx={{ mb: 10, textAlign: 'center' }}>
                <Typography variant="h1" sx={{ 
                    fontWeight: 900, 
                    mb: 2, 
                    letterSpacing: '-0.03em', 
                    fontSize: { xs: '2.5rem', md: '4rem' } 
                }}>
                    Shops <span style={{ color: '#0C831F' }}>Near You</span>
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600, mb: 6, maxWidth: 700, mx: 'auto' }}>
                    FlashBasket connects you with local neighborhood stores for lightning-fast deliveries. 
                    Enable location to see stores that can serve you in minutes.
                </Typography>

                {/* Search Bar / Geolocation Trigger */}
                <Paper elevation={0} sx={{ 
                    maxWidth: 800, 
                    mx: 'auto', 
                    p: 1, 
                    borderRadius: 6, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                    bgcolor: 'white'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, px: 3, gap: 2 }}>
                        <LocationIcon color="primary" />
                        <InputBase 
                            fullWidth 
                            placeholder={location ? `Active View: Stores within ${distance}km` : "Detect current location to find nearby stores..."}
                            readOnly
                            sx={{ fontWeight: 800, fontSize: '1rem' }}
                        />
                    </Box>
                    <Box sx={{ px: 4, display: { xs: 'none', md: 'block' }, borderLeft: '1px solid #f1f5f9' }}>
                         <Typography variant="caption" sx={{ fontWeight: 900, mb: 0.5, display: 'block' }}>Search Radius</Typography>
                         <Slider 
                            size="small"
                            value={distance}
                            onChange={(_, val) => setDistance(val as number)}
                            onChangeCommitted={() => location && fetchSellers(location.lat, location.lng, distance)}
                            min={1}
                            max={50}
                            valueLabelDisplay="auto"
                            sx={{ width: 120, color: 'primary.main' }}
                         />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="outlined" 
                            size="large" 
                            onClick={() => {
                                setLocation(null);
                                setDistance(10);
                                fetchSellers();
                            }}
                            disabled={searching}
                            sx={{ 
                                borderRadius: 5, 
                                px: 4, 
                                py: 1.5, 
                                fontWeight: 900,
                                borderWidth: 2,
                                '&:hover': { borderWidth: 2 }
                            }}
                        >
                            All Stores
                        </Button>
                        <Button 
                            variant="contained" 
                            size="large" 
                            onClick={handleGetLocation}
                            disabled={searching}
                            sx={{ 
                                borderRadius: 5, 
                                px: 4, 
                                py: 1.5, 
                                fontWeight: 900,
                                boxShadow: '0 8px 20px rgba(12, 131, 31, 0.2)'
                            }}
                        >
                            {searching ? 'Detecting...' : 'Find Stores'}
                        </Button>
                    </Box>
                </Paper>
            </Box>

            <Divider sx={{ mb: 8, opacity: 0.5 }} />

            {/* Results Grid */}
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-0.02em' }}>
                {location ? 'Local Partners' : 'All Marketplace Stores'}
            </Typography>

            <Grid container spacing={4}>
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 8 }} />
                        </Grid>
                    ))
                ) : sellers.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ py: 15, textAlign: 'center', borderRadius: 10, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                           <StoreIcon sx={{ fontSize: 80, color: 'text.disabled', opacity: 0.3, mb: 3 }} />
                           <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.secondary' }}>No stores found in this area</Typography>
                           <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 700, mt: 1 }}>Try increasing your search radius or check back later.</Typography>
                        </Paper>
                    </Grid>
                ) : (
                    sellers.map((seller) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={seller.id}>
                            <Card 
                                component={Link}
                                href={`/sellers/${seller.id}`}
                                elevation={0} 
                                sx={{ 
                                    borderRadius: 8, 
                                    border: '1px solid #f1f5f9',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textDecoration: 'none',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: 'translateY(-12px)',
                                        boxShadow: '0 30px 60px rgba(0,0,0,0.08)',
                                        borderColor: 'primary.main',
                                        '& .seller-image': { transform: 'scale(1.1)' }
                                    }
                                }}
                            >
                                <Box sx={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                                    {seller.shop_image ? (
                                        <img 
                                            src={seller.shop_image} 
                                            alt={seller.shop_name}
                                            className="seller-image"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
                                        />
                                    ) : seller.latitude && seller.longitude ? (
                                        <iframe
                                            width="100%"
                                            height="200%"
                                            style={{ border: 0, marginTop: '-30%', pointerEvents: 'none', filter: 'contrast(1.1) saturate(1.2)' }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={`https://maps.google.com/maps?q=${seller.latitude},${seller.longitude}&z=16&output=embed`}
                                            title={seller.shop_name}
                                        ></iframe>
                                    ) : (
                                        <Box sx={{ width: '100%', height: '100%', bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <StoreIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                                        </Box>
                                    )}
                                    <Box sx={{ 
                                        position: 'absolute', 
                                        top: 20, 
                                        left: 20, 
                                        bgcolor: 'rgba(255,255,255,0.9)', 
                                        backdropFilter: 'blur(10px)',
                                        px: 2, 
                                        py: 1, 
                                        borderRadius: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <VerifiedIcon sx={{ color: '#0C831F', fontSize: 16 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#0C831F' }}>FLASH PARTNER</Typography>
                                    </Box>
                                    {seller.distance !== undefined && (
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            bottom: 20, 
                                            right: 20, 
                                            bgcolor: '#0f172a', 
                                            color: 'white',
                                            px: 2, 
                                            py: 1, 
                                            borderRadius: 3,
                                            fontWeight: 900,
                                            fontSize: '0.75rem'
                                        }}>
                                            {seller.distance.toFixed(1)} km away
                                        </Box>
                                    )}
                                </Box>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.01em', textTransform: 'capitalize' }}>
                                        {seller.shop_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 4, height: 40, overflow: 'hidden' }}>
                                        {seller.shop_description || STORE_DESCRIPTIONS[seller.id % STORE_DESCRIPTIONS.length]}
                                    </Typography>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 3, borderTop: '1px solid #f8fafc' }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <DeliveryIcon sx={{ color: '#0C831F', fontSize: 18 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>PREMIUM DELIVERY</Typography>
                                        </Stack>
                                        <IconButton sx={{ bgcolor: '#f8fafc', color: 'primary.main', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                                            <ArrowIcon />
                                        </IconButton>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
}
