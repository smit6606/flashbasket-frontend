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

    const deleteProduct = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product removed successfully');
            fetchProducts();
        } catch (err) {
            toast.error('Failed to delete product');
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'productName',
            headerName: 'Product',
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                    <Avatar
                        variant="rounded"
                        src={params.row.images?.[0] || ''}
                        sx={{ width: 45, height: 45, bgcolor: '#f1f5f9', p: 0.5 }}
                    >
                        <ProductIcon sx={{ color: 'text.secondary' }} />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{params.row.productName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{params.row.unit}</Typography>
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
            headerName: '',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" sx={{ height: '100%', width: '100%' }}>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => router.push(`/seller/products/edit/${params.row.id}`)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => deleteProduct(params.row.id)}>
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
