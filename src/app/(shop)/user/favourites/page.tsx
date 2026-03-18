'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Box, Paper, alpha, Button } from '@mui/material';
import { Favorite as FavoriteIcon, ShoppingBag as ShopIcon } from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/mui/ProductCard';
import { GridSkeleton } from '@/components/mui/SkeletonLoaders';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function FavouritesPage() {
    const { token, user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [favourites, setFavourites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!token) {
            router.push('/login?callbackUrl=/user/favourites');
            return;
        }

        const fetchFavourites = async () => {
            try {
                const response = await api.get('/user/favourites/my');
                // The backend returns an array of Favourite objects, each containing a Product object.
                // We extract the products to pass them to ProductCard.
                const products = response.data.map((fav: any) => fav.Product).filter((p: any) => p !== null);
                setFavourites(products);
            } catch (err) {
                console.error('Failed to fetch favourites', err);
                toast.error('Could not load your favourites');
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, [token, authLoading, router]);

    if (authLoading || loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <GridSkeleton count={8} type="product" />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FavoriteIcon sx={{ fontSize: '1em', color: '#ef4444' }} /> My <span style={{ color: '#0C831F' }}>Favourites</span>
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    A curated collection of items you love.
                </Typography>
            </Box>

            {favourites.length === 0 ? (
                <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 10, bgcolor: alpha('#0C831F', 0.03), border: '2px dashed #e2e8f0' }}>
                    <Box sx={{ mb: 3 }}>
                        <FavoriteIcon sx={{ fontSize: 80, color: alpha('#ef4444', 0.1) }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary', mb: 4 }}>
                        Your wishlist is currently empty.
                    </Typography>
                    <Button 
                        variant="contained" 
                        component={Link} 
                        href="/products"
                        startIcon={<ShopIcon />}
                        sx={{ bgcolor: '#0C831F', fontWeight: 900, px: 6, py: 2, borderRadius: 5, '&:hover': { bgcolor: '#0a6d1a' } }}
                    >
                        Explore Products
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {favourites.map((product) => (
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }} key={product.id}>
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
