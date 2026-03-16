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
    Grid,
    MenuItem,
    Select,
    FormControl,
    TablePagination,
    Menu,
    Chip,
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
import ConfirmDialog from '@/components/mui/ConfirmDialog';

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Search/Pagination/Sort States
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [statusFilter, setStatusFilter] = useState('all');

    // Confirm Dialog States
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                search: searchQuery,
                sortBy: sortBy,
                sortOrder: sortOrder,
                status: statusFilter === 'all' ? '' : statusFilter,
            });

            const res = await api.get(`/categories?${params.toString()}`);
            setCategories(res.data.items || []);
            setTotalItems(res.data.totalItems || 0);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Unified Fetch Logic with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    }, [page, rowsPerPage, sortBy, sortOrder, statusFilter, searchQuery]);

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

    const handleDeleteClick = (id: number) => {
        setSelectedCatId(id);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCatId) return;
        try {
            setIsDeleting(true);
            await api.delete(`/categories/${selectedCatId}`);
            toast.success('Category deleted');
            setDeleteOpen(false);
            fetchCategories();
        } catch (err: any) {
            toast.error('Failed to delete category');
        } finally {
            setIsDeleting(false);
            setSelectedCatId(null);
        }
    };

    const handleUpdateCategory = async (id: number, data: any) => {
        try {
            setActionLoading(true);
            await api.patch(`/categories/${id}`, data);
            toast.success('Category updated');
            fetchCategories();
        } catch (err) {
            toast.error('Failed to update category');
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
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Global Categories</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>Define the primary collections for the entire marketplace.</Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', position: 'sticky', top: 24 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: '#1e293b' }}>Add Category</Typography>
                        <form onSubmit={handleCreate}>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Category Name"
                                    placeholder="e.g. Organic Dairy"
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
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', overflow: 'hidden', bgcolor: 'white' }}>
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 2 }}>
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
                                sx={{ bgcolor: statusFilter !== 'all' ? alpha('#0C831F', 0.1) : '#f8fafc', borderRadius: 3 }}
                            >
                                <FilterIcon sx={{ color: statusFilter !== 'all' ? '#0C831F' : 'text.secondary', fontSize: 20 }} />
                            </IconButton>
                        </Box>

                        <Menu
                            anchorEl={filterAnchorEl}
                            open={Boolean(filterAnchorEl)}
                            onClose={() => setFilterAnchorEl(null)}
                            PaperProps={{
                                sx: { p: 2, width: 220, borderRadius: 4, mt: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }
                            }}
                        >
                            <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Filter by Status</Typography>
                            <FormControl fullWidth size="small" sx={{ mt: 1, mb: 1 }}>
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
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Sort by</Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                {[
                                    { label: 'Name', field: 'name' },
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
                                        }
                                    }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Avatar sx={{ 
                                                width: 48, 
                                                height: 48, 
                                                bgcolor: (cat.status === 'inactive') ? alpha('#64748b', 0.1) : alpha('#0C831F', 0.08), 
                                                color: (cat.status === 'inactive') ? '#64748b' : '#0C831F', 
                                                borderRadius: 3.5,
                                                border: '1px solid',
                                                borderColor: (cat.status === 'inactive') ? alpha('#64748b', 0.1) : alpha('#0C831F', 0.1)
                                            }}>
                                                <CategoryIcon sx={{ fontSize: 24 }} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: (cat.status === 'inactive') ? 'text.disabled' : '#1e293b' }}>
                                                    {cat.name}
                                                </Typography>
                                                <Chip 
                                                    label={(cat.status || 'active').toUpperCase()} 
                                                    size="small"
                                                    sx={{ 
                                                        height: 18,
                                                        fontSize: '0.6rem',
                                                        fontWeight: 900,
                                                        bgcolor: (cat.status === 'inactive') ? alpha('#ef4444', 0.1) : alpha('#0C831F', 0.1),
                                                        color: (cat.status === 'inactive') ? '#ef4444' : '#0C831F',
                                                        borderRadius: 1.5,
                                                        mt: 0.5
                                                    }}
                                                />
                                            </Box>
                                        </Stack>
                                        
                                        <Stack direction="row" spacing={1}>
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                color={cat.status === 'inactive' ? 'success' : 'warning'}
                                                onClick={() => handleUpdateCategory(cat.id, { status: cat.status === 'inactive' ? 'active' : 'inactive' })}
                                                sx={{ borderRadius: 2, fontWeight: 900, fontSize: '0.7rem', textTransform: 'none' }}
                                            >
                                                {cat.status === 'inactive' ? 'Activate' : 'Hide / Inactivate'}
                                            </Button>
                                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(cat.id)} sx={{ '&:hover': { bgcolor: alpha('#ef4444', 0.05) } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
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
                                    <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1, fontWeight: 600 }}>Try adjusting your search or filters.</Typography>
                                </Box>
                            )}
                        </Box>

                        <TablePagination
                            component="div"
                            count={totalItems}
                            page={page}
                            onPageChange={(e, p) => setPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
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

            <ConfirmDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                message="Are you sure you want to permanently delete this category? This will remove all associated subcategories and marketplace products. This action cannot be undone."
                confirmText="Yes, Delete Everything"
                cancelText="No, Keep It"
                type="danger"
                loading={isDeleting}
            />
        </Box>
    );
}
