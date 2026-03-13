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
    Chip,
} from '@mui/material';
import {
    NavigateNext as NextIcon,
    ShoppingBagOutlined as BagIcon,
    FilterList as FilterIcon,
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
    stock: number;
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
    SubCategories?: { id: number; name: string }[];
}

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [selectedSubId, setSelectedSubId] = useState<number | null>(null);

    const fetchCategoryData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/categories/${id}`);
            setCategory(res.data);
            // Initially load all products for this category
            const prodRes = await api.get(`/products?categoryId=${id}&limit=50`);
            setProducts(prodRes.data.items || []);
        } catch (err) {
            console.error('Failed to fetch category data', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsBySub = async (subId: number | null) => {
        try {
            setProductsLoading(true);
            setSelectedSubId(subId);
            const endpoint = subId 
                ? `/products?categoryId=${id}&subCategoryId=${subId}&limit=50`
                : `/products?categoryId=${id}&limit=50`;
            const res = await api.get(endpoint);
            setProducts(res.data.items || []);
        } catch (err) {
            console.error('Failed to fetch filtered products', err);
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategoryData();
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

            <Box sx={{ mb: 6 }}>
                <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: '#1e293b' }}>
                    {category?.name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700, mb: 4 }}>
                    {products.length} premium {products.length === 1 ? 'item' : 'items'} available
                </Typography>

                {/* Subcategory Filter Chips */}
                {category?.SubCategories && category.SubCategories.length > 0 && (
                    <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 2, '::-webkit-scrollbar': { display: 'none' } }}>
                        <Chip
                            icon={<FilterIcon sx={{ fontSize: '18px !important' }} />}
                            label="All Items"
                            onClick={() => fetchProductsBySub(null)}
                            sx={{
                                fontWeight: 800,
                                px: 1,
                                bgcolor: selectedSubId === null ? 'primary.main' : 'white',
                                color: selectedSubId === null ? 'white' : 'text.primary',
                                border: '1px solid',
                                borderColor: selectedSubId === null ? 'primary.main' : '#e2e8f0',
                                '&:hover': { bgcolor: selectedSubId === null ? 'primary.main' : alpha('#0C831F', 0.05) }
                            }}
                        />
                        {category.SubCategories.map((sub) => (
                            <Chip
                                key={sub.id}
                                label={sub.name}
                                onClick={() => fetchProductsBySub(sub.id)}
                                sx={{
                                    fontWeight: 800,
                                    px: 2,
                                    bgcolor: selectedSubId === sub.id ? 'primary.main' : 'white',
                                    color: selectedSubId === sub.id ? 'white' : 'text.primary',
                                    border: '1px solid',
                                    borderColor: selectedSubId === sub.id ? 'primary.main' : '#e2e8f0',
                                    '&:hover': { bgcolor: selectedSubId === sub.id ? 'primary.main' : alpha('#0C831F', 0.05) }
                                }}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            {productsLoading ? (
                <Grid container spacing={4}>
                    {[...Array(5)].map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }} key={i}>
                            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 6 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : products.length === 0 ? (
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
