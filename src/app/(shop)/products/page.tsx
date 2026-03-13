'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Box,
    Typography,
    Container,
    Grid,
    Stack,
    Card,
    CardContent,
    alpha,
    Paper,
    Skeleton,
    IconButton,
    InputBase,
    Divider,
    Button,
    Chip,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    ShoppingCart as CartIcon,
    Star as StarIcon,
    Sort as SortIcon,
    CategoryOutlined as CategoryIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-toastify';
import ProductCard from '@/components/mui/ProductCard';

interface Product {
    id: number;
    productName: string;
    description: string;
    price: number;
    images: string[];
    Category?: { name: string };
    Seller?: { shop_name: string };
}

function SearchResults() {
    const searchParams = useSearchParams();
    const q = searchParams.get('search') || '';
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    
    // Filters
    const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchData();
    }, [q]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                api.get(`/products/search?q=${q}&limit=50`),
                api.get('/categories?limit=50')
            ]);
            setProducts(prodRes.data.items || []);
            setCategories(catRes.data.items || []);
        } catch (err) {
            console.error('SEARCH ERROR:', err);
            toast.error('Failed to load search results');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
        const matchesCategory = selectedCategory === 'all' || p.Category?.name === selectedCategory;
        return matchesPrice && matchesCategory;
    }).sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0; // newest
    });

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <Grid container spacing={4}>
                {/* Filters Sidebar */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', position: 'sticky', top: 100 }}>
                        <Stack spacing={4}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FilterIcon sx={{ color: 'primary.main' }} /> Filters
                                </Typography>
                                <Divider />
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Price Range (₹)</Typography>
                                <Slider
                                    value={priceRange}
                                    onChange={(_, val) => setPriceRange(val as number[])}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={5000}
                                    sx={{ color: 'primary.main' }}
                                />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>₹{priceRange[0]}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>₹{priceRange[1]}</Typography>
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Category</Typography>
                                <Stack spacing={1}>
                                    <Button 
                                        onClick={() => setSelectedCategory('all')}
                                        sx={{ 
                                            justifyContent: 'flex-start', 
                                            fontWeight: 800, 
                                            borderRadius: '12px', 
                                            bgcolor: selectedCategory === 'all' ? alpha('#0C831F', 0.1) : 'transparent',
                                            color: selectedCategory === 'all' ? 'primary.main' : 'text.secondary',
                                            '&:hover': { bgcolor: alpha('#0C831F', 0.1) }
                                        }}
                                    >
                                        All Categories
                                    </Button>
                                    {categories.map(cat => (
                                        <Button 
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.name)}
                                            sx={{ 
                                                justifyContent: 'flex-start', 
                                                fontWeight: 800, 
                                                borderRadius: '12px', 
                                                bgcolor: selectedCategory === cat.name ? alpha('#0C831F', 0.1) : 'transparent',
                                                color: selectedCategory === cat.name ? 'primary.main' : 'text.secondary',
                                                '&:hover': { bgcolor: alpha('#0C831F', 0.1) }
                                            }}
                                        >
                                            {cat.name}
                                        </Button>
                                    ))}
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Sort By</Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        sx={{ borderRadius: '12px', fontWeight: 800 }}
                                    >
                                        <MenuItem value="newest" sx={{ fontWeight: 600 }}>Newest First</MenuItem>
                                        <MenuItem value="price-low" sx={{ fontWeight: 600 }}>Price: Low to High</MenuItem>
                                        <MenuItem value="price-high" sx={{ fontWeight: 600 }}>Price: High to Low</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Results List */}
                <Grid size={{ xs: 12, md: 9 }}>
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                                {q ? `Results for "${q}"` : 'All Products'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mt: 0.5 }}>
                                Found {filteredProducts.length} items matching your criteria
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 6 }} />
                                </Grid>
                            ))
                        ) : filteredProducts.length === 0 ? (
                            <Grid size={{ xs: 12 }}>
                                <Paper elevation={0} sx={{ py: 15, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.secondary', mb: 1 }}>No items found</Typography>
                                    <Typography variant="body1" sx={{ color: 'text.disabled', fontWeight: 800 }}>Try adjusting your filters or search query.</Typography>
                                </Paper>
                            </Grid>
                        ) : (
                            filteredProducts.map((product: any) => (
                                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={product.id}>
                                    <ProductCard product={product} />
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<Box sx={{ py: 10, textAlign: 'center' }}><Skeleton variant="text" width={200} /><Skeleton variant="rectangular" height={400} /></Box>}>
            <SearchResults />
        </Suspense>
    );
}
