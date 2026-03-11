'use client';

import React, { useState, useEffect } from 'react';
import {
    Box, 
    Typography, 
    Button, 
    TextField, 
    Stack, 
    Card,
    Paper,
    Divider,
    IconButton,
    alpha,
    Avatar,
    InputAdornment,
    MenuItem,
    Chip,
    Grid,
} from '@mui/material';
import { 
    Add as AddIcon, 
    SchemaOutlined as SubCategoryIcon,
    DeleteOutline as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    LayersOutlined as CategoryIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function SellerSubcategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            toast.error('Failed to load data');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !categoryId) return;

        setLoading(true);
        try {
            await api.post('/categories/subcategory', { name, categoryId: parseInt(categoryId) });
            toast.success('Subcategory added successfully');
            setName('');
            fetchCategories(); 
        } catch (err: any) {
            toast.error(err.message || 'Failed to add subcategory');
        } finally {
            setLoading(false);
        }
    };

    const allSubcategories = categories.flatMap(cat =>
        (cat.SubCategories || []).map((sub: any) => ({
            ...sub,
            categoryName: cat.name,
            categoryColor: cat.color || '#0C831F'
        }))
    );

    const filteredSubcategories = allSubcategories.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ p: 1, maxWidth: 1200, mx: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#1e293b' }}>Subcategories</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                        Refine your {allSubcategories.length} product classifications
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', position: 'sticky', top: 24 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: '#1e293b' }}>New Classification</Typography>
                        <form onSubmit={handleCreate}>
                            <Stack spacing={2.5}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Parent Collection"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { 
                                            bgcolor: 'white',
                                            borderRadius: 3,
                                            fontWeight: 600
                                        } 
                                    }}
                                >
                                    <MenuItem value="" disabled>Choose Category</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id.toString()} sx={{ fontWeight: 600 }}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    fullWidth
                                    label="Subcategory Name"
                                    placeholder="e.g. Exotic Vegetables"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { 
                                            bgcolor: 'white',
                                            borderRadius: 3,
                                            fontWeight: 600
                                        } 
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !categoryId}
                                    fullWidth
                                    startIcon={<AddIcon />}
                                    sx={{ 
                                        py: 2, 
                                        borderRadius: 3, 
                                        fontWeight: 900, 
                                        fontSize: '0.95rem',
                                        boxShadow: '0 8px 20px rgba(12, 131, 31, 0.15)',
                                        textTransform: 'none',
                                        mt: 1
                                    }}
                                >
                                    {loading ? 'Adding...' : 'Add Subcategory'}
                                </Button>
                            </Stack>
                        </form>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', overflow: 'hidden', bgcolor: 'white' }}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="Search subcategories or parent categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.disabled', mr: 1 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { 
                                        borderRadius: 4, 
                                        bgcolor: '#f8fafc',
                                        px: 2,
                                        '& fieldset': { border: 'none' },
                                        fontWeight: 600
                                    }
                                }}
                            />
                            <IconButton sx={{ bgcolor: '#f8fafc', borderRadius: 3 }}>
                                <FilterIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </IconButton>
                        </Box>
                        
                        <Box sx={{ minHeight: 400 }}>
                            {filteredSubcategories.map((sub, index) => (
                                <Box key={index}>
                                    <Box sx={{ 
                                        px: 4, 
                                        py: 2.5, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: alpha('#f8fafc', 0.8) }
                                    }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Avatar sx={{ 
                                                width: 48, 
                                                height: 48, 
                                                bgcolor: alpha('#3b82f6', 0.08), 
                                                color: '#3b82f6', 
                                                borderRadius: 3.5,
                                                border: '1px solid',
                                                borderColor: alpha('#3b82f6', 0.1)
                                            }}>
                                                <SubCategoryIcon sx={{ fontSize: 24 }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                                    {sub.name}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <Chip 
                                                        icon={<CategoryIcon sx={{ fontSize: '12px !important' }} />}
                                                        label={sub.categoryName} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 20, 
                                                            fontSize: '0.65rem', 
                                                            fontWeight: 900, 
                                                            bgcolor: alpha(sub.categoryColor, 0.08),
                                                            color: sub.categoryColor,
                                                            border: 'none'
                                                        }} 
                                                    />
                                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled', mx: 0.5 }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {sub.status || 'Active'}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                        
                                        <IconButton size="small" color="error" sx={{ opacity: 0.3, '&:hover': { opacity: 1, bgcolor: alpha('#ef4444', 0.05) } }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    {index < filteredSubcategories.length - 1 && <Divider sx={{ borderStyle: 'solid', borderColor: '#f8fafc', mx: 4 }} />}
                                </Box>
                            ))}
                            
                            {filteredSubcategories.length === 0 && (
                                <Box sx={{ py: 12, textAlign: 'center', px: 4 }}>
                                    <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#f1f5f9', color: 'text.disabled' }}>
                                        <SearchIcon sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 800 }}>No subcategories found</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1, fontWeight: 600 }}>Try refining your search or add a new subcategory.</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
