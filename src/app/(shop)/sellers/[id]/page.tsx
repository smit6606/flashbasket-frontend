'use client';

import React, { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import {
    Box,
    Typography,
    Container,
    Grid,
    Stack,
    Button,
    Card,
    CardContent,
    IconButton,
    Chip,
    alpha,
    Paper,
    Skeleton,
    Avatar,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    Storefront as StoreIcon,
    MyLocation as LocationIcon,
    Verified as VerifiedIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    ShoppingBagOutlined as BagIcon,
    Star as StarIcon,
    ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface Product {
    id: number;
    productName: string;
    price: string;
    stock: number;
    images: string[];
    unit: string;
}

interface Seller {
    id: number;
    shop_name: string;
    shop_description: string;
    shop_image: string;
    shop_address: string;
    latitude?: number;
    longitude?: number;
}

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const { refreshCart, getItemFromCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [seller, setSeller] = useState<Seller | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const addToCart = async (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push('/login');
            return;
        }

        setUpdatingId(product.id);
        try {
            await api.post('/cart/add', {
                productId: product.id,
                sellerId: seller?.id,
                price: product.price,
                quantity: 1
            });
            await refreshCart();
            toast.success(`${product.productName} added to cart!`);
        } catch (error: any) {
            console.error('Failed to add to cart', error);
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleUpdateQuantity = async (e: React.MouseEvent, productId: number, cartItemId: number, newQuantity: number) => {
        e.preventDefault();
        e.stopPropagation();

        setUpdatingId(productId);
        try {
            if (newQuantity <= 0) {
                await api.delete('/cart/remove', { cartItemId });
                toast.info('Item Removed');
            } else {
                await api.put('/cart/update', { cartItemId, quantity: newQuantity });
            }
            await refreshCart();
        } catch (err: any) {
            toast.error('Failed to update quantity');
        } finally {
            setUpdatingId(null);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [sellerRes, productsRes] = await Promise.all([
                    api.get(`/sellers/${id}`),
                    api.get(`/products?sellerId=${id}&limit=50`)
                ]);
                setSeller(sellerRes.data);
                setProducts(productsRes.data.items || []);
            } catch (err) {
                console.error('Failed to fetch seller data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 8, mb: 6 }} />
            <Grid container spacing={4}>
                {[...Array(8)].map((_, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 6 }} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );

    if (!seller) return (
        <Container sx={{ py: 20, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Seller Not Found</Typography>
            <Button variant="contained" component={Link} href="/" startIcon={<BackIcon />} sx={{ borderRadius: 4 }}>
                Back to Marketplace
            </Button>
        </Container>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Seller Header Section */}
            <Paper elevation={0} sx={{
                position: 'relative',
                height: 350,
                borderRadius: '40px',
                overflow: 'hidden',
                mb: 8,
                bgcolor: '#0f172a'
            }}>
                {seller.shop_image ? (
                    <img
                        src={seller.shop_image}
                        alt={seller.shop_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
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
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#0C831F', 0.1) }}>
                        <StoreIcon sx={{ fontSize: 100, color: 'primary.main', opacity: 0.2 }} />
                    </Box>
                )}

                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: { xs: 4, md: 6 },
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
                }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                        <Box>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
                                    {seller.shop_name}
                                </Typography>
                                <Chip
                                    icon={<VerifiedIcon sx={{ color: '#4cc9f0 !important' }} />}
                                    label="VERIFIED STORE"
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 900, border: '1px solid rgba(255,255,255,0.2)' }}
                                />
                            </Stack>
                            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, maxWidth: 600, mb: 3 }}>
                                {seller.shop_description || 'Serving high-quality products with lightning-fast delivery to your doorstep.'}
                            </Typography>
                            <Stack direction="row" spacing={3} sx={{ color: 'white' }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <LocationIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{seller.shop_address || 'Nearby Location'}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <StarIcon sx={{ color: '#ffb703', fontSize: 18 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>4.9 Rating</Typography>
                                </Stack>
                            </Stack>
                        </Box>

                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontWeight: 900,
                                borderRadius: '16px',
                                bgcolor: 'white',
                                color: 'black',
                                '&:hover': { bgcolor: alpha('#ffffff', 0.9) }
                            }}
                        >
                            Follow Store
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            {/* products Section */}
            <Box sx={{ mb: 10 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Available items</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mt: 1 }}>
                            Fresh stock from {seller.shop_name}
                        </Typography>
                    </Box>
                    <Chip
                        label={`${products.length} Products`}
                        sx={{ fontWeight: 900, bgcolor: '#f1f5f9', p: 2 }}
                    />
                </Stack>

                {products.length === 0 ? (
                    <Card elevation={0} sx={{ py: 10, textAlign: 'center', borderRadius: '32px', border: '2px dashed #e2e8f0', bgcolor: '#f8fafc' }}>
                        <BagIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>This store hasn't listed any products yet.</Typography>
                        <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 700, mt: 1, textTransform: 'uppercase' }}>Check back later for fresh updates</Typography>
                    </Card>
                ) : (
                    <Grid container spacing={4}>
                        {products.map((product) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id}>
                                <Card
                                    component={Link}
                                    href={`/products/${product.id}`}
                                    elevation={0}
                                    sx={{
                                        borderRadius: '24px',
                                        border: '1px solid #f1f5f9',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                                            borderColor: 'primary.main',
                                        }
                                    }}
                                >
                                    <Box sx={{ p: 2 }}>
                                        <Box sx={{
                                            height: 200,
                                            borderRadius: '16px',
                                            bgcolor: '#f8fafc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            p: 3,
                                            position: 'relative'
                                        }}>
                                            <img
                                                src={product.images && product.images[0] ? product.images[0] : 'https://placehold.co/400x400?text=FlashBasket'}
                                                alt={product.productName}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'contain',
                                                    filter: product.stock <= 0 ? 'grayscale(1)' : 'none',
                                                    opacity: product.stock <= 0 ? 0.5 : 1
                                                }}
                                            />
                                            {product.stock <= 0 && (
                                                <Chip 
                                                    label="OUT OF STOCK" 
                                                    size="small"
                                                    color="error"
                                                    sx={{ position: 'absolute', fontWeight: 900, fontSize: '0.6rem' }}
                                                />
                                            )}
                                        </Box>

                                        <Box sx={{ p: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5, lineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {product.productName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 2 }}>
                                                {product.unit}
                                            </Typography>

                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="h5" sx={{ fontWeight: 900, opacity: product.stock <= 0 ? 0.3 : 1 }}>
                                                    ₹{product.price}
                                                </Typography>
                                            {(() => {
                                                const cartItem = getItemFromCart(product.id);
                                                const isUpdating = updatingId === product.id;

                                                if (cartItem) {
                                                    return (
                                                        <Box 
                                                            sx={{ 
                                                                mt: 2,
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                justifyContent: 'space-between',
                                                                bgcolor: 'primary.main',
                                                                borderRadius: '12px',
                                                                height: 48,
                                                                overflow: 'hidden',
                                                                boxShadow: '0 8px 16px rgba(12, 131, 31, 0.2)',
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={(e) => handleUpdateQuantity(e, product.id, cartItem.id!, cartItem.quantity! - 1)}
                                                                disabled={isUpdating}
                                                                sx={{ color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                                                            >
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>
                                                            
                                                            <Box sx={{ color: 'white', fontWeight: 900, fontSize: '1rem' }}>
                                                                {isUpdating ? <CircularProgress size={16} color="inherit" /> : cartItem.quantity}
                                                            </Box>

                                                            <IconButton 
                                                                size="small" 
                                                                onClick={(e) => handleUpdateQuantity(e, product.id, cartItem.id!, cartItem.quantity! + 1)}
                                                                disabled={isUpdating}
                                                                sx={{ color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    );
                                                }

                                                return (
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        onClick={(e) => addToCart(e, product)}
                                                        disabled={product.stock <= 0 || isUpdating}
                                                        startIcon={isUpdating ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                                                        sx={{
                                                            mt: 2,
                                                            borderRadius: '12px',
                                                            py: 1.2,
                                                            fontWeight: 900,
                                                            bgcolor: (product.stock <= 0 || isUpdating) ? '#f1f5f9' : 'primary.main',
                                                            color: (product.stock <= 0 || isUpdating) ? 'text.disabled' : 'white',
                                                            '&:hover': { bgcolor: (product.stock <= 0 || isUpdating) ? '#f1f5f9' : 'primary.dark' }
                                                        }}
                                                    >
                                                        {isUpdating ? 'Processing...' : (product.stock <= 0 ? 'Out of Stock' : 'Add to Cart')}
                                                    </Button>
                                                );
                                            })()}
                                            </Stack>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
}
