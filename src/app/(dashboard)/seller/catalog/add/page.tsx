'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    MenuItem,
    Stack,
    InputAdornment,
    Divider,
    IconButton,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    CloudUpload as UploadIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        originalPrice: '',
        discountPercent: '0',
        price: '', // finalPrice
        stock: '',
        unit: 'kg',
        categoryId: '',
        subCategoryId: '',
    });

    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    // Derived state for the subcategories dropdown based on selected category
    const activeSubcategories = Array.isArray(categories) 
        ? (categories.find(c => c.id.toString() === formData.categoryId)?.SubCategories || [])
        : [];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories?limit=100'); // Get more for dropdown
                setCategories(res.data.items || []);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Auto-calculate final price if originalPrice or discountPercent changes
            if (name === 'originalPrice' || name === 'discountPercent') {
                const op = parseFloat(name === 'originalPrice' ? value : prev.originalPrice) || 0;
                const dp = parseFloat(name === 'discountPercent' ? value : prev.discountPercent) || 0;
                const final = op - (op * dp / 100);
                newData.price = final.toFixed(2);
            }
            
            return newData;
        });
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImages((prev) => [...prev, ...filesArray]);

            const urls = filesArray.map((file) => URL.createObjectURL(file));
            setImageUrls((prev) => [...prev, ...urls]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImageUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value) {
                    submitData.append(key, value);
                }
            });

            images.forEach((image) => {
                submitData.append('images', image);
            });

            await api.post('/seller/products', submitData);
            toast.success('Product Added');
            router.push('/seller/catalog');
        } catch (err: any) {
            toast.error(err.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 1, maxWidth: 1000, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={() => router.back()} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <BackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Add New Product</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Create a new listing in your catalog</Typography>
                </Box>
            </Stack>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 3, mb: 4 }}>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Basic Information</Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="product-name"
                                            label="Product Name"
                                            name="productName"
                                            value={formData.productName}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="product-description"
                                            multiline
                                            rows={4}
                                            label="Description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            required
                                            id="product-category"
                                            label="Category"
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleCategoryChange}
                                        >
                                            {categories.map((category) => (
                                                <MenuItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            required
                                            id="product-subcategory"
                                            label="Subcategory"
                                            name="subCategoryId"
                                            value={formData.subCategoryId}
                                            onChange={handleChange}
                                            disabled={!formData.categoryId || activeSubcategories.length === 0}
                                        >
                                            {activeSubcategories.length === 0 ? (
                                                <MenuItem value="" disabled>No Subs</MenuItem>
                                            ) : (
                                                activeSubcategories.map((sub: any) => (
                                                    <MenuItem key={sub.id} value={sub.id.toString()}>
                                                        {sub.name}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            required
                                            label="Unit"
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="kg">Kilogram (kg)</MenuItem>
                                            <MenuItem value="g">Gram (g)</MenuItem>
                                            <MenuItem value="l">Liter (L)</MenuItem>
                                            <MenuItem value="ml">Milliliter (ml)</MenuItem>
                                            <MenuItem value="piece">Piece</MenuItem>
                                            <MenuItem value="dozen">Dozen</MenuItem>
                                            <MenuItem value="pack">Pack</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 3 }}>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Pricing & Inventory</Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="product-original-price"
                                            type="number"
                                            label="Original Price"
                                            name="originalPrice"
                                            value={formData.originalPrice}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="product-discount"
                                            type="number"
                                            label="Discount (%)"
                                            name="discountPercent"
                                            value={formData.discountPercent}
                                            onChange={handleChange}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            disabled
                                            id="product-final-price"
                                            label="Final Price"
                                            value={formData.price}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                            }}
                                            helperText="Calculated automatically"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="product-stock"
                                            type="number"
                                            label="Stock Quantity"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 3, mb: 4 }}>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Product Images</Typography>

                                <Box
                                    component="label"
                                    htmlFor="image-upload"
                                    sx={{
                                        display: 'block',
                                        width: '100%',
                                        p: 4,
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        bgcolor: '#f8fafc',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: '#f1f5f9', borderColor: 'primary.main' }
                                    }}
                                >
                                    <input
                                        id="image-upload"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                    <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Click to upload images</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>JPEG, PNG, WEBP (Max 5MB)</Typography>
                                </Box>

                                {imageUrls.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', mb: 1, display: 'block' }}>Preview</Typography>
                                        <Grid container spacing={1}>
                                            {imageUrls.map((url, i) => (
                                                <Grid size={{ xs: 4 }} key={i}>
                                                    <Box sx={{ position: 'relative', paddingTop: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                        <img src={url} alt={`Preview ${i}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => { e.preventDefault(); removeImage(i); }}
                                                            sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', padding: 0.5, '&:hover': { bgcolor: 'white' } }}
                                                        >
                                                            <CloseIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ py: 2, borderRadius: 3, fontWeight: 900, boxShadow: '0 8px 24px rgba(12, 131, 31, 0.2)' }}
                        >
                            {loading ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CircularProgress size={20} color="inherit" />
                                    <Typography variant="body2" sx={{ fontWeight: 900 }}>Publishing...</Typography>
                                </Stack>
                            ) : 'Publish Product'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
}
