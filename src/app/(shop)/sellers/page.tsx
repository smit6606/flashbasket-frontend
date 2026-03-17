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
    IconButton,
    InputBase,
    Slider,
    Divider,
} from '@mui/material';
import CustomTooltip from '@/components/common/CustomTooltip';
import {
    Storefront as StoreIcon,
    MyLocation as LocationIcon,
    Search as SearchIcon,
    ArrowForward as ArrowIcon,
    Verified as VerifiedIcon,
    DirectionsRun as DeliveryIcon,
    Place as PlaceIcon,
    Close as ClearIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Seller {
    id: number;
    shop_name: string;
    shop_description: string;
    profileImage: string;
    latitude: number;
    longitude: number;
    distance?: number;
    address?: string;
    pincode?: string;
    city?: string;
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
    const [locationMode, setLocationMode] = useState<'gps' | 'text' | 'all'>('all');
    
    // Search states
    const [nameQuery, setNameQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

    const fetchSellers = async (params: any = {}) => {
        try {
            setSearching(true);
            const queryParams = new URLSearchParams();
            
            if (params.lat && params.lng) {
                queryParams.append('lat', params.lat);
                queryParams.append('lng', params.lng);
                queryParams.append('distance', params.dist || distance);
            }
            
            if (params.query) queryParams.append('query', params.query);
            if (params.pincode) queryParams.append('pincode', params.pincode);

            const endpoint = queryParams.toString() ? `/sellers/nearby?${queryParams.toString()}` : '/sellers';
            const response = await api.get(endpoint);
            setSellers(response.data);
            
            if (queryParams.toString()) {
                toast.success(`Found ${response.data.length} stores based on your search`);
            }
        } catch (err) {
            console.error('Failed to fetch sellers', err);
            toast.error('Could not load local shops');
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    const handleGpsSearch = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setSearching(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setGpsCoords({ lat: latitude, lng: longitude });
                setLocationMode('gps');
                setLocationQuery(''); // Clear text search if using GPS
                fetchSellers({ lat: latitude, lng: longitude, dist: distance });
            },
            (error) => {
                console.error('Location error:', error);
                toast.error('Access to location denied. Use pincode or city search.');
                setSearching(false);
            }
        );
    };

    const handleTextSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!locationQuery.trim()) {
            toast.warn('Please enter a pincode or area name');
            return;
        }

        setLocationMode('text');
        setGpsCoords(null); // Clear GPS if using text search
        
        // Check if query is numeric (pincode)
        const isPincode = /^\d+$/.test(locationQuery.trim());
        fetchSellers({ 
            [isPincode ? 'pincode' : 'query']: locationQuery.trim() 
        });
    };

    const handleReset = () => {
        setLocationMode('all');
        setLocationQuery('');
        setGpsCoords(null);
        setNameQuery('');
        fetchSellers();
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const filteredSellers = sellers.filter((s) => 
        s.shop_name.toLowerCase().includes(nameQuery.toLowerCase())
    );

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
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600, mb: 6, maxWidth: 800, mx: 'auto' }}>
                    FlashBasket connects you with local neighborhood stores. 
                    Search by <span style={{ color: '#0C831F' }}>GPS</span>, <span style={{ color: '#3b82f6' }}>Pincode</span>, or <span style={{ color: '#f59e0b' }}>City name</span> to find partners ready to serve you.
                </Typography>

                {/* Enhanced Universal Search Paper */}
                <Paper elevation={0} sx={{ 
                    maxWidth: 1000, 
                    mx: 'auto', 
                    p: 1.5, 
                    borderRadius: 8, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center', 
                    gap: 2,
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.06)',
                    bgcolor: 'white'
                }}>
                    {/* Store Name Filter */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, px: 2, gap: 1.5, width: '100%' }}>
                        <SearchIcon sx={{ color: 'primary.main', opacity: 0.6 }} />
                        <InputBase 
                            fullWidth 
                            placeholder="Store Name..."
                            value={nameQuery}
                            onChange={(e) => setNameQuery(e.target.value)}
                            sx={{ fontWeight: 800, fontSize: '0.9rem' }}
                        />
                        {nameQuery && (
                            <IconButton size="small" onClick={() => setNameQuery('')}>
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

                    {/* Location Input (Pincode/Area) */}
                    <Box component="form" onSubmit={handleTextSearch} sx={{ display: 'flex', alignItems: 'center', flexGrow: 1.5, px: 2, gap: 1.5, width: '100%' }}>
                        <PlaceIcon sx={{ color: 'secondary.main', opacity: 0.6 }} />
                        <InputBase 
                            fullWidth 
                            placeholder="Pincode or City..."
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            sx={{ fontWeight: 800, fontSize: '0.9rem' }}
                        />
                        {locationQuery && (
                            <IconButton size="small" onClick={() => { setLocationQuery(''); if(locationMode === 'text') handleReset(); }}>
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        )}
                        <Button 
                            type="submit"
                            variant="text" 
                            disabled={!locationQuery}
                            sx={{ fontWeight: 900, color: 'secondary.main', minWidth: 'auto' }}
                        >
                            Apply
                        </Button>
                    </Box>

                    {/* Radius Slider (Only for GPS) */}
                    {gpsCoords && (
                        <Box sx={{ px: 3, minWidth: 150, textAlign: 'left', borderLeft: '1px solid #f1f5f9' }}>
                             <Typography variant="caption" sx={{ fontWeight: 900, mb: 0.5, display: 'block', color: 'primary.main' }}>Radius: {distance}km</Typography>
                             <Slider 
                                size="small"
                                value={distance}
                                onChange={(_, val) => setDistance(val as number)}
                                onChangeCommitted={() => fetchSellers({ lat: gpsCoords.lat, lng: gpsCoords.lng, dist: distance })}
                                min={1}
                                max={50}
                                sx={{ color: 'primary.main' }}
                             />
                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
                        <CustomTooltip title="Reset all filters">
                            <Button 
                                variant="outlined" 
                                onClick={handleReset}
                                sx={{ borderRadius: 4, fontWeight: 900, minWidth: 100 }}
                            >
                                All
                            </Button>
                        </CustomTooltip>
                        
                        <Button 
                            variant="contained" 
                            startIcon={<LocationIcon />}
                            onClick={handleGpsSearch}
                            disabled={searching}
                            sx={{ 
                                borderRadius: 4, 
                                px: 3, 
                                fontWeight: 900, 
                                bgcolor: '#0C831F',
                                boxShadow: '0 8px 20px rgba(12, 131, 31, 0.2)',
                                '&:hover': { bgcolor: '#0a6e1a' },
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {searching && locationMode === 'gps' ? 'Locating...' : 'Use GPS'}
                        </Button>
                    </Stack>
                </Paper>
            </Box>

            <Divider sx={{ mb: 8, opacity: 0.5 }} />

            {/* Results Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                        {locationMode === 'gps' ? 'Local Partners (Nearby)' : 
                         locationMode === 'text' ? `Results for "${locationQuery}"` : 
                         'All Marketplace Stores'}
                    </Typography>
                    {nameQuery && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 800, mt: 0.5 }}>
                            Filtering by name: "{nameQuery}"
                        </Typography>
                    )}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {filteredSellers.length} STORES AVAILABLE
                </Typography>
            </Stack>

            {/* Results Grid */}
            <Grid container spacing={4}>
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 8 }} />
                        </Grid>
                    ))
                ) : filteredSellers.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ py: 15, textAlign: 'center', borderRadius: 10, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                           <StoreIcon sx={{ fontSize: 80, color: 'text.disabled', opacity: 0.3, mb: 3 }} />
                           <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.secondary' }}>No stores found</Typography>
                           <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 700, mt: 1 }}>Try refining your search radius or changing criteria.</Typography>
                           <Button variant="contained" onClick={handleReset} sx={{ mt: 4, borderRadius: 3, fontWeight: 900, px: 4 }}>Show All Stores</Button>
                        </Paper>
                    </Grid>
                ) : (
                    filteredSellers.map((seller: Seller) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={seller.id}>
                            <Card 
                                component={Link}
                                href={`/sellers/${seller.id}`}
                                elevation={0} 
                                sx={{ 
                                    borderRadius: 9, 
                                    border: '1px solid #f1f5f9',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textDecoration: 'none',
                                    overflow: 'hidden',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&:hover': {
                                        transform: 'translateY(-12px)',
                                        boxShadow: '0 40px 80px rgba(0,0,0,0.08)',
                                        borderColor: 'primary.main',
                                        '& .seller-image': { transform: 'scale(1.08)' }
                                    }
                                }}
                            >
                                <Box sx={{ height: 230, overflow: 'hidden', position: 'relative' }}>
                                    {seller.profileImage ? (
                                        <Box 
                                            component="img"
                                            src={seller.profileImage} 
                                            alt={seller.shop_name}
                                            className="seller-image"
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }}
                                        />
                                    ) : (
                                        <Box sx={{ width: '100%', height: '100%', bgcolor: alpha('#0C831F', 0.05), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <StoreIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.4 }} />
                                        </Box>
                                    )}
                                    
                                    {/* Badges */}
                                    <Stack spacing={1} sx={{ position: 'absolute', top: 20, left: 20 }}>
                                        <Box sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.95)', 
                                            backdropFilter: 'blur(10px)',
                                            px: 1.5, 
                                            py: 0.8, 
                                            borderRadius: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                        }}>
                                            <VerifiedIcon sx={{ color: '#0C831F', fontSize: 14 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#0C831F', letterSpacing: '0.05em' }}>FLASH PARTNER</Typography>
                                        </Box>
                                    </Stack>

                                    {/* Distance Badge */}
                                    {seller.distance !== undefined && (
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            bottom: 20, 
                                            right: 20, 
                                            bgcolor: '#0f172a', 
                                            color: 'white',
                                            px: 2, 
                                            py: 0.8, 
                                            borderRadius: 2.5,
                                            fontWeight: 900,
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}>
                                            <PlaceIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                                            {seller.distance < 1 ? 'Under 1 km' : `${seller.distance.toFixed(1)} km`}
                                        </Box>
                                    )}
                                </Box>

                                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, textTransform: 'capitalize', color: '#1e293b' }}>
                                        {seller.shop_name}
                                    </Typography>
                                    
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, display: 'block', mb: 2, textTransform: 'uppercase' }}>
                                        {seller.city || 'Local Area'} • {seller.pincode || 'Marketplace'}
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 4, height: 42, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {seller.shop_description || STORE_DESCRIPTIONS[seller.id % STORE_DESCRIPTIONS.length]}
                                    </Typography>

                                    <Box sx={{ mt: 'auto', pt: 3, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <DeliveryIcon sx={{ color: '#0C831F', fontSize: 18, opacity: 0.8 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#0C831F' }}>FAST DELIVERY</Typography>
                                        </Stack>
                                        <IconButton sx={{ bgcolor: alpha('#0C831F', 0.05), color: '#0C831F', '&:hover': { bgcolor: '#0C831F', color: 'white' } }}>
                                            <ArrowIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
}
