'use client';

import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Button,
    Chip,
    IconButton,
    Rating,
    Stack,
    alpha,
} from '@mui/material';
import {
    Add as AddIcon,
    FavoriteBorder as FavoriteIcon,
    ShoppingBagOutlined as BagIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

interface ProductCardProps {
    product: {
        id: number;
        productName: string;
        price: string;
        images: string[];
        unit?: string;
        sellerId?: number;
        Seller?: {
            id: number;
            shop_name: string;
        };
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const { user } = useAuth();
    const router = useRouter();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            router.push('/login');
            return;
        }
        try {
            await api.post('/cart/add', {
                productId: product.id,
                sellerId: product.sellerId || product.Seller?.id,
                price: product.price,
                quantity: 1,
            });
            toast.success(`${product.productName} added to cart`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to add to cart');
        }
    };

    return (
        <Card
            onClick={() => router.push(`/products/${product.id}`)}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                    '& .add-button': {
                        opacity: 1,
                        transform: 'scale(1)',
                    },
                    '& .image-overlay': {
                        opacity: 1,
                    }
                },
            }}
        >
            {/* Badge/Tags */}
            <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                    label="Fast Delivery"
                    size="small"
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(4px)',
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        color: 'primary.main',
                        border: '1px solid',
                        borderColor: 'primary.light',
                        height: 20
                    }}
                />
            </Box>

            {/* Wishlist Button */}
            <IconButton
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(4px)',
                    '&:hover': { bgcolor: 'white', color: 'error.main' }
                }}
                size="small"
            >
                <FavoriteIcon fontSize="small" />
            </IconButton>

            {/* Image Container */}
            <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden', bgcolor: '#f8fafc' }}>
                <CardMedia
                    component="img"
                    image={product.images?.[0] || 'https://placehold.co/400x400?text=No+Image'}
                    alt={product.productName}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 3,
                        transition: 'transform 0.5s ease',
                        '.MuiCard-root:hover &': {
                            transform: 'scale(1.1)',
                        }
                    }}
                />
                <Box
                    className="image-overlay"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: alpha('#000', 0.02),
                        opacity: 0,
                        transition: 'opacity 0.3s'
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 2.5, pt: 2 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.65rem', tracking: '0.1em' }}>
                    {product.Seller?.shop_name || 'Flash Store'}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 800,
                        lineHeight: 1.3,
                        mb: 1,
                        height: 48,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontSize: '0.95rem'
                    }}
                >
                    {product.productName}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Rating value={4.5} precision={0.5} size="small" readOnly />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>(24)</Typography>
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', display: 'flex', alignItems: 'baseline' }}>
                            ₹{product.price}
                            <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary', fontWeight: 700 }}>
                                {product.unit ? `/ ${product.unit}` : ''}
                            </Typography>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through', opacity: 0.6, fontWeight: 700 }}>
                            ₹{Number(product.price) + 40}
                        </Typography>
                    </Box>

                    <Button
                        className="add-button"
                        variant="contained"
                        onClick={handleAddToCart}
                        size="medium"
                        sx={{
                            minWidth: 44,
                            width: 44,
                            height: 44,
                            p: 0,
                            borderRadius: 3,
                            bgcolor: 'primary.main',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(12, 131, 31, 0.2)',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'scale(1.05)',
                            },
                            opacity: { xs: 1, md: 0.8 },
                            transform: { xs: 'none', md: 'scale(0.95)' },
                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                    >
                        <AddIcon />
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
