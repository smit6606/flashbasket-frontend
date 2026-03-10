'use client';

import React, { useEffect, useState, use } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Breadcrumbs,
    Link as MuiLink,
    Stack,
    Skeleton,
    Paper,
    alpha,
    Button,
} from '@mui/material';
import {
    NavigateNext as NextIcon,
    ShoppingBagOutlined as BagIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/mui/ProductCard';

interface Product {
    id: number;
    productName: string;
    price: string;
    images: string[];
    unit: string;
    Seller: {
        id: number;
        shop_name: string;
    };
}

interface Category {
    id: number;
    name: string;
    description: string;
}

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsRes, categoryRes] = await Promise.all([
                    api.get(`/products/category/${id}`),
                    api.get(`/categories/${id}`)
                ]);
                setProducts(productsRes.data);
                setCategory(categoryRes.data);
            } catch (err) {
                console.error('Failed to fetch category data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <Skeleton variant="text" width="20%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="40%" height={60} sx={{ mb: 6 }} />
            <Grid container spacing={3}>
                {[...Array(10)].map((_, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }} key={i}>
                        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 6 }} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator={<NextIcon fontSize="small" />}
                sx={{ mb: 4 }}
            >
                <MuiLink component={Link} underline="hover" color="inherit" href="/" sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Home</MuiLink>
                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>{category?.name || 'Category'}</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 8 }}>
                <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: '#1e293b' }}>
                    {category?.name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {products.length} premium {products.length === 1 ? 'item' : 'items'} available
                </Typography>
            </Box>

            {products.length === 0 ? (
                <Paper elevation={0} sx={{ py: 15, textAlign: 'center', borderRadius: 10, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                    <Box sx={{ mb: 3 }}>
                        <BagIcon sx={{ fontSize: 80, color: 'text.disabled', opacity: 0.3 }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.secondary', mb: 2 }}>No products in this category yet</Typography>
                    <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 700, mb: 4 }}>We are currently updating our stock for {category?.name}.</Typography>
                    <Button variant="contained" component={Link} href="/" sx={{ borderRadius: 4, px: 6, py: 1.5, fontWeight: 900 }}>Check Other Categories</Button>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    {products.map((product) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }} key={product.id}>
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
