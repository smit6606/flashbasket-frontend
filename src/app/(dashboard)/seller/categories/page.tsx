'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    Grid,
    Menu, 
    MenuItem, 
    TablePagination,
    FormControl,
    Select,
} from '@mui/material';
import { 
    Add as AddIcon, 
    CategoryOutlined as CategoryIcon,
    DeleteOutline as DeleteIcon,
    Search as SearchIcon,
    ArrowForwardIos as ArrowIcon,
    FilterList as FilterIcon,
    Sort as SortIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function SellerCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination & Filter States
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                search: searchQuery,
                status: statusFilter === 'all' ? '' : statusFilter,
                sortBy: sortBy,
                sortOrder: sortOrder,
            });
            const res = await api.get(`/categories?${params.toString()}`);
            setCategories(res.data.items || []);
            setTotalItems(res.data.totalItems || 0);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchQuery, statusFilter, sortBy, sortOrder]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories();
        }, searchQuery ? 500 : 0);
        return () => clearTimeout(timer);
    }, [fetchCategories]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setActionLoading(true);
        try {
            await api.post('/categories', { name, icon: 'CategoryIcon' });
            toast.success('Category added successfully');
            setName('');
            fetchCategories();
        } catch (err: any) {
            toast.error(err.message || 'Failed to add category');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure? This will delete all subcategories and products in this category.')) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Category deleted');
            fetchCategories();
        } catch (err) {
            toast.error('Failed to delete category');
        }
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#1e293b' }}>Categories</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                        Manage {totalItems} product collections
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', position: 'sticky', top: 24 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: '#1e293b' }}>Quick Add</Typography>
                        <form onSubmit={handleCreate}>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Collection Name"
                                    placeholder="e.g. Fresh Vegetables"
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
                                        textTransform: 'none'
                                    }}
                                >
                                    {actionLoading ? 'Processing...' : 'Create Category'}
                                </Button>
                            </Stack>
                        </form>
                        
                        <Box sx={{ mt: 4, p: 2, bgcolor: alpha('#0C831F', 0.05), borderRadius: 3, border: '1px solid', borderColor: alpha('#0C831F', 0.1) }}>
                            <Typography variant="caption" sx={{ color: '#0C831F', fontWeight: 800 }}>
                                Pro Tip: Keep category names short and clear for better customer navigation.
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', overflow: 'hidden', bgcolor: 'white' }}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    placeholder="Search all categories..."
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
                                    sx={{ bgcolor: statusFilter !== 'all' ? alpha('#0C831F', 0.1) : '#f8fafc', borderRadius: 3 }}
                                >
                                    <FilterIcon sx={{ color: statusFilter !== 'all' ? '#0C831F' : 'text.secondary', fontSize: 20 }} />
                                </IconButton>
                            </Stack>
                        </Box>

                        <Menu
                            anchorEl={filterAnchorEl}
                            open={Boolean(filterAnchorEl)}
                            onClose={() => setFilterAnchorEl(null)}
                            PaperProps={{
                                sx: { p: 2, width: 220, borderRadius: 4, mt: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }
                            }}
                        >
                            <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Status</Typography>
                            <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                    sx={{ borderRadius: 3, fontWeight: 700 }}
                                >
                                    <MenuItem value="all">Any Status</MenuItem>
                                    <MenuItem value="active">Active Only</MenuItem>
                                    <MenuItem value="inactive">Inactive Only</MenuItem>
                                </Select>
                            </FormControl>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Sort by</Typography>
                            <Stack spacing={0.5} sx={{ mt: 1 }}>
                                {[
                                    { label: 'Name', field: 'name' },
                                    { label: 'Created Date', field: 'createdAt' }
                                ].map((s) => (
                                    <Button
                                        key={s.field}
                                        size="small"
                                        onClick={() => handleSort(s.field)}
                                        startIcon={<SortIcon sx={{ transform: sortBy === s.field && sortOrder === 'desc' ? 'scaleY(-1)' : 'none', fontSize: 18 }} />}
                                        sx={{ 
                                            justifyContent: 'flex-start', 
                                            fontWeight: 700, 
                                            textTransform: 'none',
                                            color: sortBy === s.field ? 'primary.main' : 'text.secondary',
                                            bgcolor: sortBy === s.field ? alpha('#0C831F', 0.05) : 'transparent'
                                        }}
                                    >
                                        {s.label}
                                    </Button>
                                ))}
                            </Stack>
                        </Menu>
                        
                        <Box sx={{ minHeight: 400, position: 'relative' }}>
                            {loading && (
                                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.5)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="button" sx={{ fontWeight: 900, color: 'primary.main' }}>Refreshing...</Typography>
                                </Box>
                            )}

                            {categories.map((cat, index) => (
                                <Box key={cat.id}>
                                    <Box sx={{ 
                                        px: 4, 
                                        py: 2.5, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        transition: 'all 0.2s',
                                        '&:hover': { 
                                            bgcolor: alpha('#f8fafc', 0.8),
                                            '& .arrow-icon': { transform: 'translateX(4px)', opacity: 1 }
                                        }
                                    }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Avatar sx={{ 
                                                width: 48, 
                                                height: 48, 
                                                bgcolor: alpha('#0C831F', 0.08), 
                                                color: '#0C831F', 
                                                borderRadius: 3.5,
                                                border: '1px solid',
                                                borderColor: alpha('#0C831F', 0.1)
                                            }}>
                                                <CategoryIcon sx={{ fontSize: 24 }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1e293b' }}>
                                                    {cat.name}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <Box sx={{ 
                                                        width: 6, 
                                                        height: 6, 
                                                        borderRadius: '50%', 
                                                        bgcolor: cat.status === 'inactive' ? '#94a3b8' : '#0C831F' 
                                                    }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {cat.status || 'Active'}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                        
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => handleDelete(cat.id)}
                                                sx={{ opacity: 0.3, '&:hover': { opacity: 1, bgcolor: alpha('#ef4444', 0.05) } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                            <ArrowIcon className="arrow-icon" sx={{ fontSize: 14, color: 'text.disabled', opacity: 0, transition: 'all 0.2s', ml: 1 }} />
                                        </Stack>
                                    </Box>
                                    {index < categories.length - 1 && <Divider sx={{ borderStyle: 'solid', borderColor: '#f8fafc', mx: 4 }} />}
                                </Box>
                            ))}
                            
                            {!loading && categories.length === 0 && (
                                <Box sx={{ py: 12, textAlign: 'center', px: 4 }}>
                                    <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#f1f5f9', color: 'text.disabled' }}>
                                        <SearchIcon sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 800 }}>No categories found</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1, fontWeight: 600 }}>Try adjusting your search query or add a new category.</Typography>
                                </Box>
                            )}
                        </Box>

                        <TablePagination
                            component="div"
                            count={totalItems}
                            page={page}
                            onPageChange={handlePageChange}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            sx={{
                                borderTop: '1px solid #f1f5f9',
                                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    color: 'text.secondary'
                                }
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
