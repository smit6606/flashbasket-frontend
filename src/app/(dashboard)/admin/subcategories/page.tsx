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
    Menu,
    TablePagination,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { 
    Add as AddIcon, 
    SchemaOutlined as SubCategoryIcon,
    DeleteOutline as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    LayersOutlined as CategoryIcon,
    Sort as SortIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AdminSubcategoriesPage() {
    // Data states
    const [categories, setCategories] = useState<any[]>([]); 
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);

    // Form states
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Filter/Sort/Pagination states
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // UI states
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    const fetchDropdownData = async () => {
        try {
            const res = await api.get('/categories?limit=100'); 
            setCategories(res.data.items || []);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const fetchSubcategories = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                search: searchQuery,
                sortBy: sortBy,
                sortOrder: sortOrder,
                status: statusFilter === 'all' ? '' : statusFilter,
                categoryId: categoryFilter === 'all' ? '' : categoryFilter,
            });

            const res = await api.get(`/categories/subcategories?${params.toString()}`);
            setSubcategories(res.data.items || []);
            setTotalItems(res.data.totalItems || 0);
        } catch (err) {
            toast.error('Failed to load subcategories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdownData();
    }, []);

    // Unified Fetch Logic with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubcategories();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    }, [page, rowsPerPage, sortBy, sortOrder, statusFilter, categoryFilter, searchQuery]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !categoryId) return;

        setActionLoading(true);
        try {
            await api.post('/categories/subcategory', { name, categoryId: parseInt(categoryId) });
            toast.success('Subcategory added successfully');
            setName('');
            fetchSubcategories(); 
        } catch (err: any) {
            toast.error(err.message || 'Failed to add subcategory');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure? This will delete the subcategory for all users.')) return;
        try {
            await api.delete(`/categories/subcategory/${id}`);
            toast.success('Subcategory deleted');
            fetchSubcategories();
        } catch (err) {
            toast.error('Failed to delete subcategory');
        }
    };

    const handleUpdateSubCategory = async (id: number, data: any) => {
        try {
            setActionLoading(true);
            await api.patch(`/categories/subcategory/${id}`, data);
            toast.success('Subcategory updated');
            fetchSubcategories();
        } catch (err) {
            toast.error('Failed to update subcategory');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <Box sx={{ p: 1, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Global Subcategories</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>Define detailed sub-collections for a more granular catalog.</Typography>
            </Box>

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
                                    disabled={actionLoading}
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
                                    {actionLoading ? 'Adding...' : 'Add Subcategory'}
                                </Button>
                            </Stack>
                        </form>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', overflow: 'hidden', bgcolor: 'white' }}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    placeholder="Search mapping collections..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
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
                                <IconButton 
                                    onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                                    sx={{ 
                                        bgcolor: categoryFilter !== 'all' || statusFilter !== 'all' ? alpha('#0C831F', 0.1) : '#f8fafc', 
                                        borderRadius: 3,
                                        color: categoryFilter !== 'all' || statusFilter !== 'all' ? '#0C831F' : 'text.secondary'
                                    }}
                                >
                                    <FilterIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Stack>
                        </Box>

                        <Menu
                            anchorEl={filterAnchorEl}
                            open={Boolean(filterAnchorEl)}
                            onClose={() => setFilterAnchorEl(null)}
                            PaperProps={{
                                sx: { p: 2, width: 250, borderRadius: 4, mt: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }
                            }}
                        >
                            <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Filter by</Typography>
                            <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
                                <InputLabel>Parent Category</InputLabel>
                                <Select
                                    label="Parent Category"
                                    value={categoryFilter}
                                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
                                    sx={{ borderRadius: 3, fontWeight: 700 }}
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id.toString()} sx={{ fontWeight: 600 }}>{cat.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    label="Status"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                    sx={{ borderRadius: 3, fontWeight: 700 }}
                                >
                                    <MenuItem value="all">Any Status</MenuItem>
                                    <MenuItem value="active">Active Only</MenuItem>
                                    <MenuItem value="inactive">Inactive Only</MenuItem>
                                </Select>
                            </FormControl>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Sort by</Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                {[
                                    { label: 'Name', field: 'name' },
                                    { label: 'Parent Collection', field: 'category' },
                                    { label: 'Created Date', field: 'createdAt' }
                                ].map((s) => (
                                    <Button
                                        key={s.field}
                                        onClick={() => handleSort(s.field)}
                                        size="small"
                                        startIcon={<SortIcon sx={{ transform: sortBy === s.field && sortOrder === 'desc' ? 'scaleY(-1)' : 'none' }} />}
                                        sx={{ 
                                            justifyContent: 'flex-start', 
                                            fontWeight: 700, 
                                            color: sortBy === s.field ? 'primary.main' : 'text.secondary',
                                            bgcolor: sortBy === s.field ? alpha('#0C831F', 0.05) : 'transparent',
                                            '&:hover': { bgcolor: alpha('#0C831F', 0.1) }
                                        }}
                                    >
                                        {s.label}
                                    </Button>
                                ))}
                            </Stack>
                        </Menu>
                        
                        <Box sx={{ minHeight: 400, position: 'relative' }}>
                            {(loading || actionLoading) && (
                                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>Processing...</Typography>
                                </Box>
                            )}

                            {subcategories.map((sub, index) => (
                                <Box key={sub.id}>
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
                                                bgcolor: (sub.status === 'inactive') ? alpha('#64748b', 0.1) : alpha('#3b82f6', 0.08), 
                                                color: (sub.status === 'inactive') ? '#64748b' : '#3b82f6',
                                                borderRadius: 3.5,
                                                border: '1px solid',
                                                borderColor: (sub.status === 'inactive') ? alpha('#64748b', 0.1) : alpha('#3b82f6', 0.1)
                                            }}>
                                                <SubCategoryIcon sx={{ fontSize: 24 }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: sub.status === 'inactive' ? 'text.disabled' : '#1e293b' }}>
                                                    {sub.name}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <Chip 
                                                        icon={<CategoryIcon sx={{ fontSize: '12px !important' }} />}
                                                        label={sub.Category?.name || 'Uncategorized'} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 20, 
                                                            fontSize: '0.65rem', 
                                                            fontWeight: 900, 
                                                            bgcolor: alpha('#0C831F', 0.08),
                                                            color: '#0C831F',
                                                            border: 'none'
                                                        }} 
                                                    />
                                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled', mx: 0.5 }} />
                                                    <Chip 
                                                        label={(sub.status || 'active').toUpperCase()} 
                                                        size="small"
                                                        sx={{ 
                                                            height: 18,
                                                            fontSize: '0.6rem',
                                                            fontWeight: 900,
                                                            bgcolor: sub.status === 'inactive' ? alpha('#ef4444', 0.1) : alpha('#0C831F', 0.1),
                                                            color: sub.status === 'inactive' ? '#ef4444' : '#0C831F',
                                                            borderRadius: 1.5
                                                        }}
                                                    />
                                                </Stack>
                                            </Box>
                                        </Stack>
                                        
                                        <Stack direction="row" spacing={1}>
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                color={sub.status === 'inactive' ? 'success' : 'warning'}
                                                onClick={() => handleUpdateSubCategory(sub.id, { status: sub.status === 'inactive' ? 'active' : 'inactive' })}
                                                sx={{ borderRadius: 2, fontWeight: 900, fontSize: '0.7rem', textTransform: 'none' }}
                                            >
                                                {sub.status === 'inactive' ? 'Activate' : 'Hide / Inactivate'}
                                            </Button>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(sub.id)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, bgcolor: alpha('#ef4444', 0.05) } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                    {index < subcategories.length - 1 && <Divider sx={{ borderStyle: 'solid', borderColor: '#f8fafc', mx: 4 }} />}
                                </Box>
                            ))}
                        </Box>

                        <TablePagination
                            component="div"
                            count={totalItems}
                            page={page}
                            onPageChange={(e, p) => setPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            sx={{ borderTop: '1px solid #f1f5f9' }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
