'use client';

import React, { useEffect, useState, use } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Stack,
    Button,
    IconButton,
    Card,
    Divider,
    Chip,
    alpha,
    Paper,
    Breadcrumbs,
    Link as MuiLink,
    Skeleton,
    Avatar,
    Rating,
    CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    NavigateNext as NextIcon,
    ShoppingCartOutlined as CartIcon,
    LocalShippingOutlined as DeliveryIcon,
    VerifiedUserOutlined as WarrantyIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Storefront as StoreIcon,
    Favorite as FavoriteFilledIcon,
    FavoriteBorder as WishlistIcon,
    Share as ShareIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavourites } from '@/context/FavouriteContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import LoadingButton from '@/components/mui/LoadingButton';
import { GridSkeleton } from '@/components/mui/SkeletonLoaders';

interface Product {
    id: number;
    productName: string;
    description: string;
    price: string;
    originalPrice?: string | number;
    discountPercent?: number;
    finalPrice?: string | number;
    stock: number;
    unit: string;
    images: string[];
    Seller: {
        id: number;
        shop_name: string;
    };
    Category: {
        name: string;
    };
    avgRating?: string | number;
    totalRatings?: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const { refreshCart, getItemFromCart, addToCart, updateQuantity } = useCart();
    const { isFavourite, toggleFavourite } = useFavourites();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [userRating, setUserRating] = useState<number | null>(null);
    const [isEditingRating, setIsEditingRating] = useState(false);

    const cartItem = getItemFromCart(product?.id || 0);

    const fetchUserRating = async (productId: number) => {
        if (!user) return;
        try {
            const response = await api.get(`/reviews/product/${productId}`);
            const myReview = response.data.find((r: any) => r.userId === user.id);
            if (myReview) {
                setUserRating(myReview.rating);
            }
        } catch (err) {
            console.error('Failed to fetch user rating', err);
        }
    };

    const handleShare = () => {
        if (!product) return;
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: product.productName, url }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleFavourite = () => {
        if (!user) {
            toast.info('Please login to add items to favourites');
            return;
        }
        if (!product) return;
        toggleFavourite(product.id);
    };

    const submitRating = async (newRating: number | null) => {
        if (!user || !product || !newRating) return;
        try {
            await api.post('/reviews', {
                productId: product.id,
                rating: newRating,
                comment: "Rated via listing"
            });
            // Instant feedback without toast
            const response = await api.get(`/products/${id}`);
            setProduct(response.data);
            setUserRating(newRating);
        } catch (err: any) {
            console.error('Failed to submit rating', err);
        }
    };

    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
                if (response.data.images && response.data.images.length > 0) {
                    setMainImage(response.data.images[0]);
                }
                fetchUserRating(Number(id));
            } catch (err) {
                console.error('Failed to fetch product', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCartHandler = async () => {
        if (!product) return;
        setUpdating(true);
        try {
            await addToCart(product, quantity);
            toast.success('Product Added');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add to cart');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateQuantity = async (newQuantity: number) => {
        if (!product) return;
        setUpdating(true);
        try {
            await updateQuantity(product.id, newQuantity, cartItem?.id);
            if (newQuantity <= 0) toast.info('Item Removed');
        } catch (err: any) {
            toast.error('Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <GridSkeleton count={1} type="product" />
            {/* Extended detail skeleton */}
            <Grid container spacing={8} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 8 }} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton width="40%" height={30} sx={{ mb: 2 }} />
                    <Skeleton width="80%" height={60} sx={{ mb: 2 }} />
                    <Skeleton width="30%" height={40} sx={{ mb: 4 }} />
                    <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4, mb: 4 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1.5 }} />
                </Grid>
            </Grid>
        </Container>
    );

    if (!product) return (
        <Container sx={{ py: 20, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Product Not Found</Typography>
            <Button variant="contained" component={Link} href="/" sx={{ borderRadius: '16px', fontWeight: 900, px: 4 }}>Go Back Home</Button>
        </Container>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={8}>
                {/* Left Gallery */}
                <Grid size={{ xs: 12, md: 6.5 }}>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: 'sticky', top: 100 }}
                    >
                        <Paper elevation={0} sx={{
                            borderRadius: '32px',
                            overflow: 'hidden',
                            bgcolor: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            p: { xs: 2, md: 6 },
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: { xs: 300, md: 500 }
                        }}>
                            <img
                                src={mainImage || 'https://placehold.co/800x800?text=No+Image'}
                                alt={product.productName}
                                style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: 400 }}
                            />
                        </Paper>

                        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
                            {product.images?.map((img, i) => (
                                <Box
                                    key={i}
                                    onMouseEnter={() => setMainImage(img)}
                                    sx={{
                                        minWidth: 100,
                                        width: 100,
                                        height: 100,
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: '2px solid',
                                        borderColor: mainImage === img ? 'primary.main' : 'transparent',
                                        p: 1,
                                        bgcolor: 'white',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </Box>
                            ))}
                        </Stack>
                    </motion.div>
                </Grid>

                {/* Right Info */}
                <Grid size={{ xs: 12, md: 5.5 }}>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Chip
                                label={product.Category?.name}
                                size="small"
                                sx={{ fontWeight: 900, bgcolor: alpha('#0C831F', 0.1), color: '#0C831F', borderRadius: 2 }}
                            />
                            <Stack direction="row" spacing={1}>
                                <IconButton 
                                    onClick={handleFavourite}
                                    sx={{ 
                                        border: '1px solid #f1f5f9',
                                        color: product && isFavourite(product.id) ? 'error.main' : 'inherit'
                                    }}
                                >
                                    {product && isFavourite(product.id) ? <FavoriteFilledIcon fontSize="small" /> : <WishlistIcon fontSize="small" />}
                                </IconButton>
                                <IconButton 
                                    onClick={handleShare}
                                    sx={{ border: '1px solid #f1f5f9' }}
                                >
                                    <ShareIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Stack>

                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: '#1e293b', fontSize: { xs: '1.75rem', md: '3rem' } }}>
                            {product.productName}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                bgcolor: '#0C831F', 
                                color: 'white', 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1.5,
                                gap: 0.5
                            }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                                    {Number(product.avgRating || 0).toFixed(1)}
                                </Typography>
                                <StarIcon sx={{ fontSize: 14 }} />
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                                {product.totalRatings || 0} Ratings
                            </Typography>
                        </Stack>

                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700, mb: 3 }}>
                            {product.unit}
                        </Typography>

                        <Stack spacing={1.5} sx={{ mb: 4 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ 
                                    bgcolor: '#0C831F', 
                                    color: 'white', 
                                    px: 2, 
                                    py: 0.8, 
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 12px rgba(12, 131, 31, 0.2)'
                                }}>
                                    <Typography variant="h3" sx={{ fontWeight: 900 }}>
                                        ₹{product.finalPrice || product.price}
                                    </Typography>
                                </Box>
                                {(product.discountPercent || 0) > 0 && (
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Typography variant="h5" sx={{ textDecoration: 'line-through', color: 'text.disabled', fontWeight: 700, opacity: 0.6 }}>
                                            ₹{product.originalPrice || product.price}
                                        </Typography>
                                        <Typography sx={{ color: '#0C831F', fontWeight: 900, fontSize: '1.1rem' }}>
                                            {product.discountPercent}% OFF
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                            {(product.discountPercent || 0) > 0 && (
                                <Typography variant="h6" sx={{ color: '#0C831F', fontWeight: 900, letterSpacing: '0.02em' }}>
                                    You save ₹{(Number(product.originalPrice || product.price) - Number(product.finalPrice || product.price)).toFixed(0)}
                                </Typography>
                            )}
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                (Inclusive of all taxes)
                            </Typography>
                        </Stack>

                        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9', mb: 6 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 2, display: 'block' }}>Store Profile</Typography>
                            <Stack direction="row" spacing={2} alignItems="center" component={Link} href={`/sellers/${product.Seller?.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}><StoreIcon /></Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{product.Seller?.shop_name}</Typography>
                                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        Visit Store <NextIcon sx={{ fontSize: 12 }} />
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        <Box sx={{ mb: 6 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2 }}>Description</Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontWeight: 600 }}>
                                {product.description || "Freshly sourced high-quality item delivered right to your doorstep. Experience the FlashBasket quality promise today."}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 6, p: 3, bgcolor: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                    {isEditingRating ? 'Update your rating' : 'Your Rating'}
                                </Typography>
                                {userRating && !isEditingRating && (
                                    <Button 
                                        size="small" 
                                        onClick={() => setIsEditingRating(true)}
                                        sx={{ fontWeight: 800, textTransform: 'none' }}
                                    >
                                        Edit Rating
                                    </Button>
                                )}
                            </Stack>
                            
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Rating 
                                    value={userRating} 
                                    readOnly={!!userRating && !isEditingRating}
                                    onChange={(_, val) => {
                                        setUserRating(val);
                                        setIsEditingRating(true); // Keep editing until submit
                                    }}
                                />
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                                    {userRating ? (isEditingRating ? 'Submit your change' : 'You already rated this') : 'Share your experience!'}
                                </Typography>
                            </Stack>

                            {isEditingRating && userRating && (
                                <LoadingButton
                                    variant="contained"
                                    size="small"
                                    loading={loading}
                                    loadingText="Submitting..."
                                    onClick={async () => {
                                        await submitRating(userRating);
                                        setIsEditingRating(false);
                                    }}
                                    sx={{ mt: 2, borderRadius: 2, fontWeight: 900 }}
                                >
                                    Submit Rating
                                </LoadingButton>
                            )}
                        </Box>

                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', width: '100%' }}>
                                {cartItem ? (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        bgcolor: 'primary.main',
                                        borderRadius: '16px',
                                        p: 1,
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 12px 24px rgba(12, 131, 31, 0.2)'
                                    }}>
                                        <IconButton 
                                            onClick={() => handleUpdateQuantity(cartItem.quantity - 1)} 
                                            disabled={updating}
                                            sx={{ color: 'white' }}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>
                                            {updating ? <CircularProgress size={24} color="inherit" /> : cartItem.quantity}
                                        </Typography>
                                        <IconButton 
                                            onClick={() => handleUpdateQuantity(cartItem.quantity + 1)} 
                                            disabled={updating}
                                            sx={{ color: 'white' }}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <LoadingButton
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        loading={updating}
                                        loadingText="Adding..."
                                        disabled={product.stock <= 0}
                                        startIcon={product.stock > 0 && !updating ? <CartIcon /> : null}
                                        onClick={addToCartHandler}
                                        sx={{
                                            borderRadius: '16px',
                                            py: 2,
                                            fontWeight: 900,
                                            fontSize: '1.1rem',
                                            bgcolor: 'primary.main',
                                            boxShadow: product.stock > 0 ? '0 12px 24px rgba(12, 131, 31, 0.25)' : 'none',
                                        }}
                                    >
                                        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </LoadingButton>
                                )}
                            </Box>

                            <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: alpha('#0C831F', 0.1), color: '#0C831F', width: 44, height: 44 }}><DeliveryIcon fontSize="small" /></Avatar>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>DELIVERY</Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>10-15 Mins</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800', width: 44, height: 44 }}><WarrantyIcon fontSize="small" /></Avatar>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>GUARANTEE</Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>100% Quality</Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Stack>
                    </motion.div>
                </Grid>
            </Grid>
        </Container>
    );
}
