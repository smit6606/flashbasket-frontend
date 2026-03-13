'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Chip, 
    CircularProgress, 
    Button, 
    alpha, 
    TextField, 
    InputAdornment, 
    MenuItem, 
    Select, 
    FormControl, 
    Stack, 
    Avatar,
    TablePagination,
    IconButton,
    Menu,
    Divider
} from '@mui/material';
import { 
    Search as SearchIcon, 
    Storefront as StoreIcon,
    FilterList as FilterIcon,
    Sort as SortIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

export default function AdminSellers() {
    const [sellers, setSellers] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    // Search/Pagination/Sort States
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [statusFilter, setStatusFilter] = useState('all');

    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    const fetchSellers = async () => {
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

            const response = await api.get(`/admin/sellers?${params.toString()}`);
            setSellers(response.data.items || []);
            setTotalItems(response.data.totalItems || 0);
        } catch (error) {
            toast.error('Failed to load sellers');
        } finally {
            setLoading(false);
        }
    };

    // Unified Fetch Logic with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSellers();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    }, [page, rowsPerPage, sortBy, sortOrder, statusFilter, searchQuery]);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await api.patch(`/admin/seller/${id}/status`, { status });
            toast.success(`Seller status updated to ${status}`);
            fetchSellers();
        } catch (error) {
            toast.error('Failed to update status');
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
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Manage Sellers</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>Review store registrations and manage operational permissions.</Typography>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <TextField
                    placeholder="Search stores, owners, or emails..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 4, bgcolor: 'white', fontWeight: 600 }
                    }}
                />
                <IconButton 
                    onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                    sx={{ bgcolor: statusFilter !== 'all' ? alpha('#0C831F', 0.1) : 'white', borderRadius: 3, border: '1px solid #e2e8f0' }}
                >
                    <FilterIcon sx={{ color: statusFilter !== 'all' ? '#0C831F' : 'text.secondary', fontSize: 20 }} />
                </IconButton>
            </Stack>

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
                        <MenuItem value="pending">Pending Only</MenuItem>
                        <MenuItem value="suspended">Suspended Only</MenuItem>
                    </Select>
                </FormControl>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Sort by</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                    {[
                        { label: 'Store Name', field: 'shop_name' },
                        { label: 'Join Date', field: 'createdAt' }
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

            <TableContainer component={Card} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                {loading && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress size={40} thickness={4} />
                    </Box>
                )}
                <Table>
                    <TableHead sx={{ bgcolor: alpha('#0C831F', 0.03) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Shop Details</TableCell>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Owner Info</TableCell>
                            <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sellers.map((seller) => (
                            <TableRow key={seller.id} sx={{ '&:hover': { bgcolor: alpha('#f8fafc', 0.5) } }}>
                                <TableCell>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar 
                                            src={seller.shop_image} 
                                            sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: '#f1f5f9' }}
                                        >
                                            <StoreIcon sx={{ color: 'text.disabled' }} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1e293b' }}>{seller.shop_name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ID: #{seller.id}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{seller.owner_name || seller.user_name}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{seller.email}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={seller.status ? seller.status.toUpperCase() : (seller.isActive ? 'ACTIVE' : 'INACTIVE')} 
                                        size="small" 
                                        sx={{ 
                                            fontWeight: 900, 
                                            borderRadius: 2,
                                            fontSize: '0.65rem',
                                            bgcolor: (seller.status || (seller.isActive ? 'active' : 'inactive')) === 'active' ? alpha('#0C831F', 0.1) : (seller.status === 'suspended' ? alpha('#ef4444', 0.1) : alpha('#f59e0b', 0.1)),
                                            color: (seller.status || (seller.isActive ? 'active' : 'inactive')) === 'active' ? '#0C831F' : (seller.status === 'suspended' ? '#ef4444' : '#f59e0b'),
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        {(seller.status || (seller.isActive ? 'active' : 'inactive')) !== 'active' && (
                                            <Button 
                                                variant="contained" 
                                                color="success" 
                                                size="small"
                                                onClick={() => handleStatusUpdate(seller.id, 'active')} 
                                                sx={{ px: 2, borderRadius: 2, fontWeight: 900, fontSize: '0.7rem' }}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        {(seller.status || (seller.isActive ? 'active' : 'suspended')) !== 'suspended' && (
                                            <Button 
                                                variant="outlined" 
                                                color="error" 
                                                size="small"
                                                onClick={() => handleStatusUpdate(seller.id, 'suspended')} 
                                                sx={{ px: 2, borderRadius: 2, fontWeight: 900, fontSize: '0.7rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                            >
                                                Suspend
                                            </Button>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                {!loading && sellers.length === 0 && (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#f1f5f9', color: 'text.disabled' }}>
                            <SearchIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>No sellers found</Typography>
                        <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>Try adjusting your search or filters.</Typography>
                    </Box>
                )}

                <TablePagination
                    component="div"
                    count={totalItems}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    sx={{ borderTop: '1px solid #e2e8f0' }}
                />
            </TableContainer>
        </Box>
    );
}
