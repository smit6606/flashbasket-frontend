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
    CircularProgress,
    useMediaQuery,
    alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Add as AddIcon,
    Favorite as FavoriteFilledIcon,
    FavoriteBorder as FavoriteIcon,
    Remove as RemoveIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavourites } from '@/context/FavouriteContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: {
        id: number;
        productName: string;
        price: string;
        originalPrice?: string | number;
        discountPercent?: number;
        finalPrice?: string | number;
        stock: number;
        images: string[];
        unit?: string;
        sellerId?: number;
        Seller?: {
            id: number;
            shop_name: string;
        };
        avgRating?: string | number;
        totalRatings?: number;
    };
}

const StyledCard = styled(motion.create(Card))(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    cursor: 'pointer',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    backgroundColor: '#fff',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        '& .card-image': {
            transform: 'scale(1.1) rotate(2deg)',
        },
        '&:hover .action-buttons': {
            opacity: 1,
        },
    },
}));

const ImageContainer = styled(Box)({
    position: 'relative',
    height: '220px',
    width: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const ActionButtons = styled(Stack)({
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    opacity: 0,
    transition: 'all 0.3s ease',
});

export default function ProductCard({ product }: ProductCardProps) {
    const { user } = useAuth();
    const { refreshCart, getItemFromCart, addToCart, updateQuantity } = useCart();
    const { isFavourite, toggleFavourite } = useFavourites();
    const router = useRouter();
    const [updating, setUpdating] = React.useState(false);
    const isBelow375 = useMediaQuery('(max-width:375px)');

    const cartItem = getItemFromCart(product.id);
    const isFav = isFavourite(product.id);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setUpdating(true);
        try {
            await addToCart(product, 1);
        } catch (err: any) {
            toast.error(err.message || 'Failed to add to cart');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateQuantity = async (e: React.MouseEvent, newQuantity: number) => {
        e.stopPropagation();
        setUpdating(true);
        try {
            await updateQuantity(product.id, newQuantity, cartItem?.id);
        } catch (err: any) {
            toast.error('Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/products/${product.id}`;
        if (navigator.share) {
            navigator.share({
                title: product.productName,
                url: url
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied!');
        }
    };

    const handleFavourite = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavourite(product.id);
    };

    const finalPrice = Number(product.finalPrice || product.price);
    const originalPrice = Number(product.originalPrice || finalPrice);
    const discountPercent = product.discountPercent || 0;
    const discountAmount = originalPrice - finalPrice;

    const getStableProductImage = (name: string, id: number) => {
        const lowerName = name.toLowerCase();
        
        // Keyword based high-quality static images
        if (lowerName.includes('apple') || lowerName.includes('fruit')) return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bccb?w=400';
        if (lowerName.includes('milk') || lowerName.includes('dairy')) return 'https://images.unsplash.com/photo-1563636619-e910ef2a844b?w=400';
        if (lowerName.includes('bread') || lowerName.includes('bakery')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400';
        if (lowerName.includes('drink') || lowerName.includes('cola') || lowerName.includes('soda')) return 'https://images.unsplash.com/photo-1581009146145-b5ef03a74e7f?w=400';
        if (lowerName.includes('shampoo') || lowerName.includes('soap') || lowerName.includes('beauty')) return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400';
        if (lowerName.includes('chips') || lowerName.includes('snack')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400';
        if (lowerName.includes('veg') || lowerName.includes('tomato') || lowerName.includes('onion')) return 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400';
        if (lowerName.includes('egg')) return 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?w=400';
        if (lowerName.includes('choco')) return 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400';

        // Deterministic fallback based on ID
        const fallbacks = [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
            'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400',
            'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
            'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400'
        ];
        return fallbacks[id % fallbacks.length];
    };

    return (
        <StyledCard 
            onClick={() => router.push(`/products/${product.id}`)}
            whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <ImageContainer sx={{ p: isBelow375 ? 1 : 2 }}>
                {discountPercent > 0 && (
                    <Box sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        bgcolor: '#0C831F',
                        color: 'white', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: '0 0 12px 0',
                        zIndex: 12,
                        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.7rem' }}>
                            {discountPercent}% OFF
                        </Typography>
                    </Box>
                )}
                <CardMedia
                    component="img"
                    image={product.images?.[0] || getStableProductImage(product.productName, product.id)}
                    alt={product.productName}
                    className="card-image"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)',
                    }}
                />
                
                <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 11 }}>
                    <IconButton
                        onClick={handleFavourite}
                        size="small"
                        sx={{
                            bgcolor: isFav ? '#fee2e2' : 'rgba(255,255,255,0.9)',
                            color: isFav ? '#ef4444' : '#64748b',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            '&:hover': {
                                bgcolor: isFav ? '#fecaca' : '#fff',
                                color: isFav ? '#dc2626' : 'primary.main',
                                transform: 'scale(1.1)',
                            },
                        }}
                    >
                        {isFav ? <FavoriteFilledIcon fontSize="small" /> : <FavoriteIcon fontSize="small" />}
                    </IconButton>
                </Box>

                <ActionButtons className="action-buttons" spacing={1}>
                    <IconButton
                        onClick={handleShare}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.9)',
                            color: '#64748b',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            '&:hover': { bgcolor: '#fff', color: 'primary.main' }
                        }}
                    >
                        <ShareIcon fontSize="small" />
                    </IconButton>
                </ActionButtons>

                <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
                    <Chip
                        label="11 MINS"
                        size="small"
                        icon={<Typography component="span" sx={{ fontSize: '10px', ml: 1 }}>⚡</Typography>}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(4px)',
                            color: '#0C831F',
                            fontWeight: 900,
                            fontSize: '0.65rem',
                            height: 22,
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                        }}
                    />
                </Box>
            </ImageContainer>

            <CardContent sx={{ p: isBelow375 ? 1.5 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {!isBelow375 && (
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: 'text.secondary', 
                        fontWeight: 700, 
                        display: 'block', 
                        mb: 0.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}
                >
                    {product.Seller?.shop_name || 'FlashStore'}
                </Typography>
                )}
                
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: isBelow375 ? '0.75rem' : '0.9rem',
                        lineHeight: 1.3,
                        color: '#1e293b',
                        mb: isBelow375 ? 0.5 : 1,
                        height: isBelow375 ? 32 : 40,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {product.productName}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: isBelow375 ? 1 : 2 }}>
                    <Rating 
                        value={typeof product.avgRating === 'string' ? parseFloat(product.avgRating) : (product.avgRating || 0)} 
                        precision={0.1} 
                        size="small" 
                        readOnly 
                        sx={{ fontSize: isBelow375 ? '0.7rem' : '0.85rem' }} 
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: isBelow375 ? '0.65rem' : '0.75rem' }}>
                        ({parseInt(String(product.totalRatings || 0))})
                    </Typography>
                </Stack>

                <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ mb: isBelow375 ? 1 : 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                            <Box sx={{ 
                                bgcolor: '#0C831F', 
                                color: 'white', 
                                px: 1, 
                                py: 0.2, 
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: '0 2px 4px rgba(12, 131, 31, 0.2)'
                            }}>
                                <Typography sx={{ fontWeight: 900, fontSize: isBelow375 ? '0.9rem' : '1.05rem' }}>
                                    ₹{finalPrice}
                                </Typography>
                            </Box>
                            {discountPercent > 0 && (
                                <Typography sx={{ 
                                    fontSize: isBelow375 ? '0.8rem' : '0.95rem', 
                                    color: '#94a3b8', 
                                    textDecoration: 'line-through', 
                                    fontWeight: 700 
                                }}>
                                    ₹{originalPrice}
                                </Typography>
                            )}
                        </Stack>
                        
                        {discountPercent > 0 && (
                            <Typography variant="caption" sx={{ color: '#0C831F', fontWeight: 900, fontSize: '0.8rem', display: 'block', mb: 0.5 }}>
                                ₹{discountAmount.toFixed(0)} OFF
                            </Typography>
                        )}

                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                            {product.unit || 'per unit'}
                        </Typography>
                    </Box>

                    {cartItem ? (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            bgcolor: '#0C831F',
                            borderRadius: isBelow375 ? '10px' : '12px',
                            height: isBelow375 ? 30 : 38,
                            p: 0.5,
                            boxShadow: '0 4px 12px rgba(12, 131, 31, 0.15)',
                        }} onClick={e => e.stopPropagation()}>
                            <IconButton 
                                size="small" 
                                onClick={e => handleUpdateQuantity(e, cartItem.quantity - 1)}
                                disabled={updating}
                                sx={{ color: '#fff', width: 32, height: 32 }}
                            >
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem', width: 24, textAlign: 'center' }}>
                                {updating ? <CircularProgress size={16} color="inherit" thickness={6} /> : cartItem.quantity}
                            </Typography>
                            <IconButton 
                                size="small" 
                                onClick={e => handleUpdateQuantity(e, cartItem.quantity + 1)}
                                disabled={updating}
                                sx={{ color: '#fff', width: 32, height: 32 }}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Button
                            variant="outlined"
                            fullWidth
                            disabled={product.stock <= 0 || updating}
                            onClick={handleAddToCart}
                            sx={{
                                border: '1.5px solid #0C831F',
                                color: '#0C831F',
                                fontWeight: 900,
                                borderRadius: '10px',
                                textTransform: 'none',
                                py: isBelow375 ? 0.3 : 0.8,
                                minHeight: isBelow375 ? 30 : 38,
                                fontSize: isBelow375 ? '0.8rem' : '0.875rem',
                                '&:hover': {
                                    bgcolor: '#0C831F',
                                    color: '#fff',
                                    border: '1.5px solid #0C831F',
                                },
                            }}
                        >
                            {updating ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CircularProgress size={16} color="inherit" thickness={6} />
                                    <Typography variant="caption" sx={{ fontWeight: 900 }}>Adding...</Typography>
                                </Stack>
                            ) : 'Add'}
                        </Button>
                    )}
                </Box>
            </CardContent>
        </StyledCard>
    );
}
