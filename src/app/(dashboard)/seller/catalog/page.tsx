'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
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
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSortModel,
    GridPaginationModel,
} from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    DeleteOutline as DeleteIcon,
    Inventory2Outlined as ProductIcon,
    Visibility as VisibleIcon,
    VisibilityOff as HiddenIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import ConfirmDialog from '@/components/mui/ConfirmDialog';
import CustomTooltip from '@/components/common/CustomTooltip';

interface Product {
    id: number;
    productName: string;
    price: string;
    stock: number;
    unit: string;
    status: string;
    images: string[];
}

export default function SellerProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const isMounted = React.useRef(false);

    const [statusFilter, setStatusFilter] = useState('all');
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    // States for Server-side
    const [searchQuery, setSearchQuery] = useState('');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([
        { field: 'createdAt', sort: 'desc' },
    ]);

    // Confirm Dialog States
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
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

            const response = await api.get(`/seller/products?${params.toString()}`);
            setProducts(response.data.items || []);
            setTotalItems(response.data.totalItems || 0);
        } catch (err) {
            console.error('Failed to fetch products', err);
            toast.error('Failed to load products');
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

        return () => {
            clearTimeout(timer);
        };
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

    const toggleStatus = useCallback(async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.put(`/seller/product/${id}`, { status: newStatus });
            toast.success(newStatus === 'active' ? 'Product Visible' : 'Product Hidden');
            fetchProducts();
        } catch (err: any) {
            toast.error('Failed to update status');
        }
    }, [fetchProducts]);

    const handleDeleteClick = useCallback((id: number) => {
        setProductToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            setIsDeleting(true);
            await api.delete(`/seller/product/${productToDelete}`);
            toast.success('Product Deleted');
            setDeleteDialogOpen(false);
            fetchProducts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete product');
        } finally {
            setIsDeleting(false);
            setProductToDelete(null);
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
                            bgcolor: '#f8fafc',                             p: 0.5,
                             border: '1px solid #f1f5f9',
                             borderRadius: '12px',
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
                                color: params.row.status === 'inactive' ? 'text.disabled' : '#1e293b',
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {params.row.unit}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            ),
        },
        {
            field: 'stock',
            headerName: 'Inventory',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 800,
                            color: params.row.stock < 10 ? 'error.main' : 'text.primary',
                            bgcolor: params.row.stock < 10 ? alpha('#ef5350', 0.1) : 'transparent',
                            px: 1,
                            borderRadius: 1
                        }}
                    >
                        {params.row.stock} in stock
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', height: '100%' }}>
                    ₹{params.row.price}
                </Typography>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Chip
                        label={params.row.status}
                        size="small"
                        sx={{
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            fontSize: '0.65rem',
                            bgcolor: params.row.status === 'active' ? alpha('#0C831F', 0.1) : '#f1f5f9',
                            color: params.row.status === 'active' ? '#0C831F' : 'text.secondary',
                            borderRadius: 2
                        }}
                    />
                </Box>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center" sx={{ height: '100%', width: '100%' }}>
                    <CustomTooltip title={params.row.status === 'active' ? "Hide from Users" : "Show to Users"}>
                        <IconButton 
                            size="small" 
                            onClick={() => toggleStatus(params.row.id, params.row.status)}
                            sx={{ color: params.row.status === 'active' ? 'primary.main' : 'text.disabled' }}
                        >
                            {params.row.status === 'active' ? <VisibleIcon fontSize="small" /> : <HiddenIcon fontSize="small" />}
                        </IconButton>
                    </CustomTooltip>
                    <CustomTooltip title="Edit Product">
                        <IconButton size="small" onClick={() => router.push(`/seller/catalog/edit/${params.row.id}`)} sx={{ color: 'info.main' }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </CustomTooltip>
                    <CustomTooltip title="Delete Product">
                        <IconButton size="small" onClick={() => handleDeleteClick(params.row.id)} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </CustomTooltip>
                </Stack>
            ),
        },
    ], [router, toggleStatus, handleDeleteClick]);

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
                    No Products Found
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, maxWidth: 300, mx: 'auto', mt: 1 }}>
                    {searchQuery 
                        ? "We couldn't find any products matching your search query. Try different keywords."
                        : "Your catalog is currently empty. Start by adding your first product to the store."}
                </Typography>
                {!searchQuery && (
                    <Button
                        variant="text"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/seller/catalog/add')}
                        sx={{ mt: 2, fontWeight: 900, color: 'primary.main', '&:hover': { bgcolor: alpha('#0C831F', 0.05) } }}
                    >
                        Add First Product
                    </Button>
                )}
            </Box>
        </Stack>
    );

    return (
        <Box sx={{ p: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={3} sx={{ mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Product Catalog</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                        Manage your {totalItems} store products
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/seller/catalog/add')}
                    sx={{ px: 4, py: 1.5, borderRadius: '16px', fontWeight: 900, boxShadow: '0 8px 24px rgba(12, 131, 31, 0.2)' }}
                >
                    Add New Product
                </Button>
            </Stack>

            <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #f8fafc', display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search products by name or description..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '14px', bgcolor: '#f8fafc' }
                        }}
                    />
                    <IconButton 
                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                        sx={{ bgcolor: statusFilter !== 'all' ? alpha('#0C831F', 0.1) : '#f8fafc', borderRadius: '14px' }}
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
                            onClick={() => { setStatusFilter('inactive'); setFilterAnchorEl(null); setPaginationModel(prev => ({ ...prev, page: 0 })); }}
                            selected={statusFilter === 'inactive'}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            Inactive Only
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
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone and will remove the product from all customer carts."
                confirmText="Yes, Delete Product"
                cancelText="No, Keep It"
                type="danger"
                loading={isDeleting}
            />
        </Box>
    );
}
