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
    Drawer,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    ShoppingCart as CartIcon,
    Star as StarIcon,
    Sort as SortIcon,
    CategoryOutlined as CategoryIcon,
    HighlightOff as HighlightOffIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-toastify';
import ProductCard from '@/components/mui/ProductCard';
import { GridSkeleton } from '@/components/mui/SkeletonLoaders';

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
    const catParam = searchParams.get('category') || 'all';
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    
    // Filters State
    const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
    const [selectedCategory, setSelectedCategory] = useState(catParam);
    const [sortBy, setSortBy] = useState('newest');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch products based on search query, category and sorting
                const params: any = { search: q, limit: 100 };
                if (selectedCategory !== 'all') {
                    params.category = selectedCategory;
                }
                
                // Add sorting parameters
                if (sortBy === 'price-low') {
                    params.sortBy = 'price';
                    params.sortOrder = 'ASC';
                } else if (sortBy === 'price-high') {
                    params.sortBy = 'price';
                    params.sortOrder = 'DESC';
                } else {
                    params.sortBy = 'id';
                    params.sortOrder = 'DESC';
                }
                
                const productsRes = await api.get('/products', params);
                setProducts(productsRes.data.items || []);

                // Fetch categories for filter
                const categoriesRes = await api.get('/categories');
                setCategories(categoriesRes.data.items || []);
            } catch (err) {
                console.error('Failed to fetch product data', err);
                toast.error('Could not load products');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [q, selectedCategory, sortBy]);

    const filterContent = (
        <Stack spacing={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon sx={{ color: 'primary.main' }} /> Filters
                </Typography>
                {/* Close icon for mobile drawer only */}
                <IconButton sx={{ display: { md: 'none' } }} onClick={() => setMobileFiltersOpen(false)}>
                    <HighlightOffIcon />
                </IconButton>
            </Box>
            <Divider />

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
                        onClick={() => { setSelectedCategory('all'); setMobileFiltersOpen(false); }}
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
                            onClick={() => { setSelectedCategory(cat.name); setMobileFiltersOpen(false); }}
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
    );

    const filteredProducts = products.filter(p => {
        const price = Number(p.price);
        const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
        // Note: Category check is already handled server-side, 
        // but we keep this as a safe client-side backup
        const matchesCategory = selectedCategory === 'all' || p.Category?.name === selectedCategory;
        return matchesPrice && matchesCategory;
    });

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
            <Grid container spacing={{ xs: 2, md: 4 }}>
                {/* Desktop Filters Sidebar */}
                <Grid size={{ xs: 0, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', position: 'sticky', top: 100 }}>
                        {filterContent}
                    </Paper>
                </Grid>

                {/* Mobile Filters Drawer */}
                <Drawer
                    anchor="left"
                    open={mobileFiltersOpen}
                    onClose={() => setMobileFiltersOpen(false)}
                    PaperProps={{
                        sx: { width: 300, p: 3, borderRadius: '0 24px 24px 0' }
                    }}
                >
                    {filterContent}
                </Drawer>

                {/* Results List */}
                <Grid size={{ xs: 12, md: 9 }}>
                    <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                                {q ? `Results for "${q}"` : 'All Products'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mt: 0.5 }}>
                                Found {filteredProducts.length} items matching your criteria
                            </Typography>
                        </Box>

                        {/* Mobile Filter Toggle */}
                        <Button
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={() => setMobileFiltersOpen(true)}
                            sx={{ display: { md: 'none' }, borderRadius: '12px', fontWeight: 800, color: 'text.primary', borderColor: '#e2e8f0' }}
                        >
                            Filters
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        {loading ? (
                            <GridSkeleton count={12} type="product" />
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
