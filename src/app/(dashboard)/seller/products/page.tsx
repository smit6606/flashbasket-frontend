'use client';

import React, { useEffect, useState } from 'react';
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
    Tooltip,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    DeleteOutline as DeleteIcon,
    MoreVert as MoreIcon,
    Inventory2Outlined as ProductIcon,
    Visibility as VisibleIcon,
    VisibilityOff as HiddenIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

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
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/seller/products');
            setProducts(response.data);
        } catch (err) {
            console.error('Failed to fetch products', err);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.put(`/seller/product/${id}`, { status: newStatus });
            toast.success(`Product is now ${newStatus}`);
            fetchProducts();
        } catch (err: any) {
            toast.error('Failed to update status');
        }
    };

    const deleteProduct = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/seller/product/${id}`);
            toast.success('Product removed successfully');
            fetchProducts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete product');
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'productName',
            headerName: 'Product',
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%', py: 1 }}>
                    <Avatar
                        variant="rounded"
                        src={params.row.images?.[0] || ''}
                        sx={{ 
                            width: 52, 
                            height: 52, 
                            bgcolor: '#f8fafc', 
                            p: 0.5,
                            border: '1px solid #f1f5f9',
                            '& img': { objectFit: 'contain' }
                        }}
                    >
                        <ProductIcon sx={{ color: 'text.secondary' }} />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                fontWeight: 900, 
                                color: params.row.status === 'inactive' ? 'text.disabled' : 'text.primary',
                                textTransform: 'capitalize',
                                lineClamp: 1,
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {params.row.productName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {params.row.unit}
                        </Typography>
                    </Box>
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
                    <Tooltip title={params.row.status === 'active' ? "Hide from Users" : "Show to Users"}>
                        <IconButton 
                            size="small" 
                            onClick={() => toggleStatus(params.row.id, params.row.status)}
                            sx={{ color: params.row.status === 'active' ? 'primary.main' : 'text.disabled' }}
                        >
                            {params.row.status === 'active' ? <VisibleIcon fontSize="small" /> : <HiddenIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Product">
                        <IconButton size="small" onClick={() => router.push(`/seller/products/edit/${params.row.id}`)} sx={{ color: 'info.main' }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                        <IconButton size="small" onClick={() => deleteProduct(params.row.id)} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ];

    const filteredProducts = products.filter(p =>
        p.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ p: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={3} sx={{ mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Product Catalog</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                        {products.length} Products in your inventory
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/seller/products/add')}
                    sx={{ px: 4, py: 1.5, borderRadius: 4, fontWeight: 900, boxShadow: '0 8px 24px rgba(12, 131, 31, 0.2)' }}
                >
                    Add New Product
                </Button>
            </Stack>

            <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #f8fafc' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search products by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                        }}
                    />
                </Box>
                <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={filteredProducts}
                        columns={columns}
                        loading={loading}
                        disableRowSelectionOnClick
                        rowHeight={70}
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
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid #f8fafc',
                            },
                        }}
                    />
                </Box>
            </Card>
        </Box>
    );
}
