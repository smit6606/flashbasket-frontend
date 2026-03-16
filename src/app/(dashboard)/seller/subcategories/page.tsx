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
import debounce from 'lodash/debounce';
import ConfirmDialog from '@/components/mui/ConfirmDialog';

export default function SellerSubcategoriesPage() {
    // Data states
    const [categories, setCategories] = useState<any[]>([]); // For dropdown
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

    // Confirm Dialog States
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // UI states
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    const fetchDropdownData = async () => {
        try {
            const res = await api.get('/categories?limit=100'); // Get all for dropdown
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

    // Initial fetch
    useEffect(() => {
        fetchDropdownData();
    }, []);

    // Fetch on filter change
    useEffect(() => {
        fetchSubcategories();
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

    const handleDeleteClick = (id: number) => {
        setSelectedSubId(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSubId) return;
        try {
            setIsDeleting(true);
            await api.delete(`/categories/subcategory/${selectedSubId}`);
            toast.success('Subcategory deleted');
            setConfirmOpen(false);
            fetchSubcategories();
        } catch (err) {
            toast.error('Failed to delete subcategory');
        } finally {
            setIsDeleting(false);
            setSelectedSubId(null);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(0);
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
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#1e293b' }}>Subcategories</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                        Manage product classifications for your store
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
                                    disabled={actionLoading || !categoryId}
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
                        {/* Search and Filters Header */}
                        <Box sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    placeholder="Search subcategories..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
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

                            {/* Applied Filters Mini Chips */}
                            {(categoryFilter !== 'all' || statusFilter !== 'all') && (
                                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                    {categoryFilter !== 'all' && (
                                        <Chip 
                                            label={`Category: ${categories.find(c => c.id.toString() === categoryFilter)?.name}`} 
                                            size="small" 
                                            onDelete={() => setCategoryFilter('all')}
                                            sx={{ fontWeight: 700 }}
                                        />
                                    )}
                                    {statusFilter !== 'all' && (
                                        <Chip 
                                            label={`Status: ${statusFilter}`} 
                                            size="small" 
                                            onDelete={() => setStatusFilter('all')}
                                            sx={{ fontWeight: 700 }}
                                        />
                                    )}
                                </Stack>
                            )}
                        </Box>

                        {/* Filter Menu */}
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
                                    { label: 'Created Date', field: 'createdAt' },
                                    { label: 'Status', field: 'status' }
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
                            {loading && (
                                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>Updating...</Typography>
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
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {sub.status || 'Active'}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                        
                                        <IconButton 
                                            size="small" 
                                            color="error" 
                                            onClick={() => handleDeleteClick(sub.id)}
                                            sx={{ opacity: 0.3, '&:hover': { opacity: 1, bgcolor: alpha('#ef4444', 0.05) } }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    {index < subcategories.length - 1 && <Divider sx={{ borderStyle: 'solid', borderColor: '#f8fafc', mx: 4 }} />}
                                </Box>
                            ))}
                            
                            {!loading && subcategories.length === 0 && (
                                <Box sx={{ py: 12, textAlign: 'center', px: 4 }}>
                                    <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#f1f5f9', color: 'text.disabled' }}>
                                        <SearchIcon sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 800 }}>No subcategories found</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1, fontWeight: 600 }}>Try adjusting your filters or search query.</Typography>
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

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Subcategory"
                message="Are you sure you want to delete this subcategory? This action will remove it from all associated products."
                confirmText="Yes, Delete Subcategory"
                cancelText="No, Keep It"
                type="danger"
                loading={isDeleting}
            />
        </Box>
    );
}
