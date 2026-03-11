'use client';

import React, { useState, useEffect, use } from 'react';
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
    IconButton,
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

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        price: '',
        stock: '',
        unit: 'kg',
        categoryId: '',
        subCategoryId: '',
        status: 'active'
    });

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImageUrls, setNewImageUrls] = useState<string[]>([]);

    const activeSubcategories = categories.find(c => c.id.toString() === formData.categoryId)?.SubCategories || [];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    api.get('/categories'),
                    api.get(`/products/${id}`)
                ]);
                
                setCategories(catRes.data);
                
                const p = prodRes.data;
                setFormData({
                    productName: p.productName,
                    description: p.description,
                    price: p.price.toString(),
                    stock: p.stock.toString(),
                    unit: p.unit,
                    categoryId: p.categoryId?.toString() || '',
                    subCategoryId: p.subCategoryId?.toString() || '',
                    status: p.status || 'active'
                });
                setExistingImages(p.images || []);
            } catch (err) {
                console.error('Failed to load data', err);
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setNewImages((prev) => [...prev, ...filesArray]);
            const urls = filesArray.map((file) => URL.createObjectURL(file));
            setNewImageUrls((prev) => [...prev, ...urls]);
        }
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setNewImageUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value) submitData.append(key, value);
            });

            // Re-append existing images that weren't deleted
            existingImages.forEach(img => {
                submitData.append('existingImages', img);
            });

            newImages.forEach((image) => {
                submitData.append('images', image);
            });

            await api.put(`/seller/product/${id}`, submitData);
            toast.success('Product updated successfully!');
            router.push('/seller/products');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update product');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 1, maxWidth: 1000, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={() => router.back()} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <BackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Edit Product</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Update listing details and inventory</Typography>
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
                                        <TextField fullWidth required label="Product Name" name="productName" value={formData.productName} onChange={handleChange} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField fullWidth required multiline rows={4} label="Description" name="description" value={formData.description} onChange={handleChange} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField fullWidth select required label="Category" name="categoryId" value={formData.categoryId} onChange={handleCategoryChange}>
                                            {categories.map((category) => (
                                                <MenuItem key={category.id} value={category.id.toString()}>{category.name}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField fullWidth select required label="Subcategory" name="subCategoryId" value={formData.subCategoryId} onChange={handleChange} disabled={!formData.categoryId || activeSubcategories.length === 0}>
                                            {activeSubcategories.map((sub: any) => (
                                                <MenuItem key={sub.id} value={sub.id.toString()}>{sub.name}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField fullWidth select required label="Status" name="status" value={formData.status} onChange={handleChange}>
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="inactive">Inactive</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 3 }}>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Pricing & Inventory</Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth required type="number" label="Price" name="price" value={formData.price} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth required type="number" label="Stock Quantity" name="stock" value={formData.stock} onChange={handleChange} />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 3, mb: 4 }}>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Product Images</Typography>
                                
                                <Grid container spacing={1} sx={{ mb: 3 }}>
                                    {existingImages.map((url, i) => (
                                        <Grid size={{ xs: 4 }} key={i}>
                                            <Box sx={{ position: 'relative', paddingTop: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <img src={url} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <IconButton size="small" onClick={() => removeExistingImage(i)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', padding: 0.5 }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                                            </Box>
                                        </Grid>
                                    ))}
                                    {newImageUrls.map((url, i) => (
                                        <Grid size={{ xs: 4 }} key={i}>
                                            <Box sx={{ position: 'relative', paddingTop: '100%', borderRadius: 2, overflow: 'hidden', border: '2px solid #0C831F' }}>
                                                <img src={url} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <IconButton size="small" onClick={() => removeNewImage(i)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', padding: 0.5 }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Box component="label" sx={{ display: 'block', width: '100%', p: 3, border: '2px dashed #cbd5e1', borderRadius: 4, textAlign: 'center', cursor: 'pointer', bgcolor: '#f8fafc' }}>
                                    <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                    <UploadIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Add More Images</Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        <Button type="submit" fullWidth variant="contained" disabled={submitting} sx={{ py: 2, borderRadius: 3, fontWeight: 900 }}>
                            {submitting ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
}
