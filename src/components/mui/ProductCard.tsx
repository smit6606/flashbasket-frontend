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
} from '@mui/material';
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

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    cursor: 'pointer',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    backgroundColor: '#fff',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        borderColor: theme.palette.primary.main,
        '& .card-image': {
            transform: 'scale(1.08)',
        },
        '& .action-buttons': {
            opacity: 1,
            transform: 'translateX(0)',
        },
    },
}));

const ImageContainer = styled(Box)({
    position: 'relative',
    paddingTop: '100%',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
});

const ActionButtons = styled(Stack)({
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    opacity: 0,
    transform: 'translateX(10px)',
    transition: 'all 0.3s ease',
});

export default function ProductCard({ product }: ProductCardProps) {
    const { user } = useAuth();
    const { refreshCart, getItemFromCart, addToCart, updateQuantity } = useCart();
    const { isFavourite, toggleFavourite } = useFavourites();
    const router = useRouter();
    const [updating, setUpdating] = React.useState(false);

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

    const getRealisticDiscount = (id: number, price: number) => {
        // Pseudo-random discount based on ID to remain stable across renders
        const seed = id * 1337;
        const discountPercentage = ((seed % 26) + 5) / 100; // 5% to 30%
        const discountAmount = price * discountPercentage;
        // Round to nearest 5 or 10 for realism
        return Math.max(10, Math.round(discountAmount / 5) * 5);
    };

    const discountAmount = getRealisticDiscount(product.id, Number(product.price));
    const originalPrice = Number(product.price) + discountAmount;

    return (
        <StyledCard onClick={() => router.push(`/products/${product.id}`)}>
            <ImageContainer sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                {Math.round((discountAmount/originalPrice)*100) > 0 && (
                    <Box sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        bgcolor: '#0C831F', 
                        color: 'white', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: '0 0 8px 0',
                        zIndex: 12,
                        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.65rem' }}>
                            {Math.floor((discountAmount/originalPrice)*100)}% OFF
                        </Typography>
                    </Box>
                )}
                <CardMedia
                    component="img"
                    image={product.images?.[0] || 'https://placehold.co/400x400?text=Product'}
                    alt={product.productName}
                    className="card-image"
                    sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
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

            <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
                
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        color: '#1e293b',
                        mb: 1,
                        height: 40,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {product.productName}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                    <Rating 
                        value={typeof product.avgRating === 'string' ? parseFloat(product.avgRating) : (product.avgRating || 0)} 
                        precision={0.1} 
                        size="small" 
                        readOnly 
                        sx={{ fontSize: '0.85rem' }} 
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        ({parseInt(String(product.totalRatings || 0))})
                    </Typography>
                </Stack>

                <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0C831F' }}>
                                    ₹{product.price}
                                </Typography>
                                <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                                    ₹{originalPrice}
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                {product.unit || 'per unit'}
                            </Typography>
                        </Box>
                    </Box>

                    {cartItem ? (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            bgcolor: '#0C831F',
                            borderRadius: '12px',
                            height: 38,
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
                            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem' }}>
                                {updating ? <CircularProgress size={16} color="inherit" /> : cartItem.quantity}
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
                                borderRadius: '12px',
                                textTransform: 'none',
                                py: 0.8,
                                '&:hover': {
                                    bgcolor: '#0C831F',
                                    color: '#fff',
                                    border: '1.5px solid #0C831F',
                                },
                            }}
                        >
                            {updating ? <CircularProgress size={20} color="inherit" /> : 'Add'}
                        </Button>
                    )}
                </Box>
            </CardContent>
        </StyledCard>
    );
}
