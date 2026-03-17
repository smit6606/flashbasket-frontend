'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Stack,
    Card,
    Avatar,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    alpha,
    Menu,
    MenuItem,
    Button,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSortModel,
    GridPaginationModel,
} from '@mui/x-data-grid';
import {
    Search as SearchIcon,
    DeleteOutline as DeleteIcon,
    Inventory2Outlined as ProductIcon,
    FilterList as FilterIcon,
    StorefrontOutlined as SellerIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import ConfirmDialog from '@/components/mui/ConfirmDialog';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const isMounted = React.useRef(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([
        { field: 'createdAt', sort: 'desc' },
    ]);

    const [statusFilter, setStatusFilter] = useState('all');
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    // Confirm Dialog States
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (paginationModel.page + 1).toString(),
                limit: paginationModel.pageSize.toString(),
                search: searchQuery,
                status: statusFilter === 'all' ? '' : statusFilter,
                sortBy: sortModel[0]?.field || 'createdAt',
                sortOrder: sortModel[0]?.sort || 'desc',
            });

            const response = await api.get(`/products/admin?${params.toString()}`);
            setProducts(response.data.items || []);
            setTotalItems(response.data.totalItems || 0);
        } catch (err: any) {
            console.error('Failed to fetch products', err);
            toast.error(err.response?.data?.message || err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [paginationModel, sortModel, searchQuery, statusFilter]);

    // Track mount status
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Unified Fetch Logic with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    }, [paginationModel.page, paginationModel.pageSize, sortModel, searchQuery, statusFilter, fetchProducts]);

    const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
        if (!isMounted.current) return;
        setPaginationModel(prev => {
            if (prev.page === newModel.page && prev.pageSize === newModel.pageSize) return prev;
            return newModel;
        });
    }, []);

    const handleSortModelChange = useCallback((newModel: GridSortModel) => {
        if (!isMounted.current) return;
        setSortModel(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newModel)) return prev;
            return newModel;
        });
    }, []);

    const handleUpdateStatus = useCallback(async (id: number, status: string) => {
        try {
            setLoading(true);
            await api.patch(`/products/${id}`, { status });
            toast.success(`Product is now ${status}`);
            fetchProducts();
        } catch (err) {
            toast.error('Failed to update product status');
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);

    const handleDeleteClick = useCallback((id: number) => {
        setSelectedProductId(id);
        setDeleteOpen(true);
    }, []);

    const handleConfirmDelete = async () => {
        if (!selectedProductId) return;
        try {
            setIsDeleting(true);
            await api.delete(`/products/${selectedProductId}`);
            toast.success('Product deleted successfully');
            setDeleteOpen(false);
            fetchProducts();
        } catch (err: any) {
            toast.error('Failed to delete product');
        } finally {
            setIsDeleting(false);
            setSelectedProductId(null);
        }
    };

    const columns: GridColDef[] = useMemo(() => [
        {
            field: 'productName',
            headerName: 'Product',
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Stack 
                    direction="row" 
                    spacing={2.5} 
                    alignItems="center" 
                    sx={{ 
                        height: '100%', 
                        width: '100%', 
                        py: 0.5 
                    }}
                >
                    <Avatar
                        variant="rounded"
                        src={params.row.images?.[0] || ''}
                        sx={{ 
                            width: 64, 
                            height: 64, 
                            bgcolor: '#f8fafc', 
                            p: 0.5,
                            border: '1px solid #f1f5f9',
                            borderRadius: 3,
                            flexShrink: 0,
                            '& img': { objectFit: 'contain' }
                        }}
                    >
                        <ProductIcon sx={{ color: 'text.secondary' }} />
                    </Avatar>
                    <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1, justifyContent: 'center' }}>
                        <Typography 
                            variant="subtitle2" 
                            sx={{ 
                                fontWeight: 900, 
                                color: params.row.status === 'hidden' ? 'text.disabled' : '#1e293b',
                                lineHeight: 1.4,
                                textTransform: 'capitalize',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {params.row.productName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {params.row.Category?.name} • {params.row.SubCategory?.name}
                        </Typography>
                    </Stack>
                </Stack>
            ),
        },
        {
            field: 'seller',
            headerName: 'Seller',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                    <SellerIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            {params.row.Seller?.shop_name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                            {params.row.Seller?.email}
                        </Typography>
                    </Box>
                </Stack>
            ),
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', height: '100%' }}>
                    ₹{params.row.price}
                </Typography>
            ),
        },
        {
            field: 'stock',
            headerName: 'Stock',
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 800,
                            color: params.row.stock < 10 ? 'error.main' : 'text.primary',
                        }}
                    >
                        {params.row.stock} {params.row.unit}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params: GridRenderCellParams) => {
                const colors: any = {
                    active: { bg: alpha('#0C831F', 0.1), text: '#0C831F' },
                    pending: { bg: alpha('#f59e0b', 0.1), text: '#f59e0b' },
                    rejected: { bg: alpha('#ef4444', 0.1), text: '#ef4444' },
                    hidden: { bg: alpha('#64748b', 0.1), text: '#64748b' },
                    'out-of-stock': { bg: alpha('#ef4444', 0.1), text: '#ef4444' }
                };
                const color = colors[params.row.status] || { bg: '#f1f5f9', text: 'text.secondary' };
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Chip
                            label={params.row.status}
                            size="small"
                            sx={{
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                fontSize: '0.65rem',
                                bgcolor: color.bg,
                                color: color.text,
                                borderRadius: 1.5
                            }}
                        />
                    </Box>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 280,
            sortable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%', height: '100%', alignItems: 'center' }}>
                    {params.row.status === 'pending' && (
                        <>
                            <Button 
                                size="small" 
                                variant="contained" 
                                color="success" 
                                disableElevation
                                onClick={() => handleUpdateStatus(params.row.id, 'active')}
                                sx={{ borderRadius: 2, fontWeight: 900, fontSize: '0.65rem', textTransform: 'none' }}
                            >
                                Approve
                            </Button>
                            <Button 
                                size="small" 
                                variant="outlined" 
                                color="error" 
                                onClick={() => handleUpdateStatus(params.row.id, 'rejected')}
                                sx={{ borderRadius: 2, fontWeight: 900, fontSize: '0.65rem', textTransform: 'none' }}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    
                    {params.row.status === 'active' && (
                        <Button 
                            size="small" 
                            variant="outlined" 
                            color="warning" 
                            onClick={() => handleUpdateStatus(params.row.id, 'hidden')}
                            sx={{ borderRadius: 2, fontWeight: 900, fontSize: '0.65rem', textTransform: 'none' }}
                        >
                            Hide Item
                        </Button>
                    )}

                    {params.row.status === 'hidden' && (
                        <Button 
                            size="small" 
                            variant="outlined" 
                            color="info" 
                            onClick={() => handleUpdateStatus(params.row.id, 'active')}
                            sx={{ borderRadius: 2, fontWeight: 900, fontSize: '0.65rem', textTransform: 'none' }}
                        >
                            Show Item
                        </Button>
                    )}

                    <IconButton size="small" onClick={() => handleDeleteClick(params.row.id)} sx={{ color: 'error.main', opacity: 0.5, '&:hover': { opacity: 1 } }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            ),
        },
    ], [handleUpdateStatus, handleDeleteClick]);

    const CustomNoRowsOverlay = () => (
        <Stack height="100%" alignItems="center" justifyContent="center" spacing={2}>
            <Box 
                sx={{ 
                    p: 3, 
                    borderRadius: '50%', 
                    bgcolor: alpha('#f1f5f9', 0.5),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ProductIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
            </Box>
            <Box textAlign="center">
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>
                    No Global Items Found
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, maxWidth: 300, mx: 'auto', mt: 1 }}>
                    {searchQuery 
                        ? "We couldn't find any marketplace items matching your search. Try broadening your terms."
                        : "There are currently no products available from any sellers in the marketplace."}
                </Typography>
            </Box>
        </Stack>
    );

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Global Catalog</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>
                    Monitoring {totalItems} items across all marketplace sellers.
                </Typography>
            </Box>

            <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #f8fafc', display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by product name, description, or seller..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3, bgcolor: '#f8fafc' }
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
                        sx: { p: 1.5, width: 220, borderRadius: 4, mt: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }
                    }}
                >
                    <Typography variant="overline" sx={{ fontWeight: 900, ml: 1, color: 'text.disabled' }}>Filter Status</Typography>
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <MenuItem 
                            onClick={() => { setStatusFilter('all'); setFilterAnchorEl(null); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
                            selected={statusFilter === 'all'}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            All Products
                        </MenuItem>
                        <MenuItem 
                            onClick={() => { setStatusFilter('active'); setFilterAnchorEl(null); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
                            selected={statusFilter === 'active'}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            Active Only
                        </MenuItem>
                        <MenuItem 
                            onClick={() => { setStatusFilter('pending'); setFilterAnchorEl(null); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
                            selected={statusFilter === 'pending'}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            Pending Approval
                        </MenuItem>
                        <MenuItem 
                            onClick={() => { setStatusFilter('hidden'); setFilterAnchorEl(null); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
                            selected={statusFilter === 'hidden'}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            Hidden Items
                        </MenuItem>
                        <MenuItem 
                            onClick={() => { setStatusFilter('rejected'); setFilterAnchorEl(null); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
                            selected={statusFilter === 'rejected'}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            Rejected Items
                        </MenuItem>
                    </Stack>
                </Menu>

                <Box sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={products}
                        columns={columns}
                        loading={loading}
                        rowCount={totalItems}
                        paginationMode="server"
                        sortingMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={handlePaginationModelChange}
                        sortModel={sortModel}
                        onSortModelChange={handleSortModelChange}
                        disableRowSelectionOnClick
                        rowHeight={92}
                        pageSizeOptions={[10, 25, 50]}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: '#f8fafc',
                                color: 'text.secondary',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem',
                                letterSpacing: '0.1em',
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                '&:focus': { outline: 'none' }
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid #f8fafc',
                            },
                            '& .MuiDataGrid-overlay': {
                                bgcolor: 'transparent'
                            }
                        }}
                        slots={{
                            noRowsOverlay: CustomNoRowsOverlay
                        }}
                    />
                </Box>
            </Card>

            <ConfirmDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                message="Are you sure you want to permanently delete this product from the marketplace? This action cannot be undone."
                confirmText="Yes, Delete Product"
                cancelText="No, Keep It"
                type="danger"
                loading={isDeleting}
            />
        </Box>
    );
}
