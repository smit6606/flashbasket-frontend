'use client';

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    Box,
    Paper,
    Stack,
    Button,
    Skeleton,
    alpha,
} from '@mui/material';
import {
    Favorite as HeartIcon,
    ShoppingBagOutlined as BagIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import ProductCard from '@/components/mui/ProductCard';
import Link from 'next/link';

import { useFavourites } from '@/context/FavouriteContext';

export default function FavouritesPage() {
    const { favouriteIds } = useFavourites();
    const [favourites, setFavourites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavourites = async () => {
        try {
            setLoading(true);
            const response = await api.get('/favourites/my');
            setFavourites(response.data || []);
        } catch (error) {
            console.error('Failed to fetch favourites', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavourites();
    }, []);

    // Filter local favourites based on IDs from context for "Live Update"
    const visibleFavourites = favourites.filter(fav => favouriteIds.includes(fav.productId));

    return (
        <Container maxWidth="xl" sx={{ py: 8 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 2 }}>
                    Wishlist
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>
                    You have {visibleFavourites.length} items in your wishlist
                </Typography>
            </Box>

            {loading ? (
                <Grid container spacing={4}>
                    {[...Array(8)].map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }} key={i}>
                            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 5 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : visibleFavourites.length === 0 ? (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        py: 15, 
                        textAlign: 'center', 
                        bgcolor: '#f8fafc', 
                        borderRadius: '48px', 
                        border: '2px dashed #e2e8f0' 
                    }}
                >
                    <Box sx={{ mb: 4 }}>
                        <HeartIcon sx={{ fontSize: 100, color: '#CBD5E1', opacity: 0.5 }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 2 }}>
                        Your wishlist is empty
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700, mb: 4, maxWidth: 500, mx: 'auto' }}>
                        Start adding items you love to your favourites!
                    </Typography>
                    <Button 
                        component={Link} 
                        href="/" 
                        variant="contained" 
                        size="large"
                        startIcon={<BagIcon />}
                        sx={{ 
                            borderRadius: '16px', 
                            px: 6, 
                            py: 2, 
                            fontWeight: 900,
                            bgcolor: '#0C831F',
                            '&:hover': { bgcolor: '#096a18' }
                        }}
                    >
                        Explore Products
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    {visibleFavourites.map((fav) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }} key={fav.id}>
                            <ProductCard product={fav.Product} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
