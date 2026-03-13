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
import {
    NavigateNext as NextIcon,
    ShoppingCartOutlined as CartIcon,
    LocalShippingOutlined as DeliveryIcon,
    VerifiedUserOutlined as WarrantyIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Storefront as StoreIcon,
    FavoriteBorder as WishlistIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface Product {
    id: number;
    productName: string;
    description: string;
    price: string;
    discountPrice?: string;
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
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
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
            } catch (err) {
                console.error('Failed to fetch product', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCart = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setAddingToCart(true);
        try {
            await api.post('/cart/add', {
                productId: product?.id,
                sellerId: product?.Seller?.id,
                price: product?.price,
                quantity: quantity
            });
            await refreshCart();
            toast.success('Product Added');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Grid container spacing={8}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 8 }} />
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" width={100} height={100} sx={{ borderRadius: 4 }} />)}
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton width="40%" height={30} sx={{ mb: 2 }} />
                    <Skeleton width="80%" height={60} sx={{ mb: 2 }} />
                    <Skeleton width="30%" height={40} sx={{ mb: 4 }} />
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 4, mb: 4 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 4 }} />
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
            <Breadcrumbs separator={<NextIcon fontSize="small" />} sx={{ mb: 4 }}>
                <MuiLink component={Link} underline="hover" color="inherit" href="/" sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Home</MuiLink>
                <MuiLink component={Link} underline="hover" color="inherit" href={`/categories/${product.Category?.name}`} sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>{product.Category?.name}</MuiLink>
                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>{product.productName}</Typography>
            </Breadcrumbs>

            <Grid container spacing={8}>
                {/* Left Gallery */}
                <Grid size={{ xs: 12, md: 6.5 }}>
                    <Box sx={{ position: 'sticky', top: 100 }}>
                        <Paper elevation={0} sx={{
                            borderRadius: '32px',
                            overflow: 'hidden',
                            bgcolor: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            p: 6,
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 500
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
                    </Box>
                </Grid>

                {/* Right Info */}
                <Grid size={{ xs: 12, md: 5.5 }}>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Chip
                                label={product.Category?.name}
                                size="small"
                                sx={{ fontWeight: 900, bgcolor: alpha('#0C831F', 0.1), color: '#0C831F', borderRadius: 2 }}
                            />
                            <Stack direction="row" spacing={1}>
                                <IconButton size="small" sx={{ border: '1px solid #f1f5f9' }}><WishlistIcon fontSize="small" /></IconButton>
                                <IconButton size="small" sx={{ border: '1px solid #f1f5f9' }}><ShareIcon fontSize="small" /></IconButton>
                            </Stack>
                        </Stack>

                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: '#1e293b' }}>
                            {product.productName}
                        </Typography>

                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700, mb: 3 }}>
                            {product.unit}
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                ₹{product.price}
                            </Typography>
                            <Typography variant="h5" sx={{ textDecoration: 'line-through', color: 'text.disabled', fontWeight: 700, opacity: 0.6 }}>
                                ₹{Number(product.price) + 40}
                            </Typography>
                            <Chip label="SPECIAL PRICE" size="small" sx={{ fontWeight: 900, bgcolor: '#ffeded', color: '#ff4d4d', borderRadius: 2 }} />
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

                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: 'white',
                                    borderRadius: '16px',
                                    p: 0.5,
                                    border: '1.5px solid #0C831F',
                                    opacity: product.stock <= 0 ? 0.5 : 1,
                                    pointerEvents: product.stock <= 0 ? 'none' : 'auto'
                                }}>
                                    <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{ color: 'primary.main' }}><RemoveIcon /></IconButton>
                                    <Typography variant="h6" sx={{ px: 4, fontWeight: 900 }}>{quantity}</Typography>
                                    <IconButton size="small" onClick={() => setQuantity(quantity + 1)} sx={{ color: 'primary.main' }}><AddIcon /></IconButton>
                                </Box>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={product.stock <= 0 || addingToCart}
                                    startIcon={product.stock > 0 && !addingToCart ? <CartIcon /> : null}
                                    onClick={addToCart}
                                    sx={{
                                        borderRadius: '16px',
                                        py: 2,
                                        fontWeight: 900,
                                        fontSize: '1.1rem',
                                        bgcolor: (product.stock <= 0 || addingToCart) ? '#e2e8f0' : 'primary.main',
                                        color: (product.stock <= 0 || addingToCart) ? 'text.disabled' : 'white',
                                        boxShadow: product.stock > 0 && !addingToCart ? '0 12px 24px rgba(12, 131, 31, 0.25)' : 'none',
                                        '&:hover': { bgcolor: (product.stock <= 0 || addingToCart) ? '#e2e8f0' : 'primary.dark' }
                                    }}
                                >
                                    {addingToCart ? (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <CircularProgress size={20} color="inherit" />
                                            <Typography variant="body1" sx={{ fontWeight: 900 }}>Adding...</Typography>
                                        </Stack>
                                    ) : (product.stock <= 0 ? 'Out of Stock' : 'Add to Cart')}
                                </Button>
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
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}
