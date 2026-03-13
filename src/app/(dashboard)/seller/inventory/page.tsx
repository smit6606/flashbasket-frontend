'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Stack,
    Card,
    Avatar,
    IconButton,
    TextField,
    InputAdornment,
    alpha,
    Tooltip,
    Grid,
    LinearProgress,
    Chip,
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
    Inventory2Outlined as ProductIcon,
    WarningAmberOutlined as LowStockIcon,
    FilterList as FilterIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

export default function SellerInventoryPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([
        { field: 'stock', sort: 'asc' }, // Default show low stock first
    ]);

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (paginationModel.page + 1).toString(),
                limit: paginationModel.pageSize.toString(),
                search: searchQuery,
                sortBy: sortModel[0]?.field || 'stock',
                sortOrder: sortModel[0]?.sort || 'asc',
            });

            const response = await api.get(`/seller/products?${params.toString()}`);
            setProducts(response.data.items || []);
            setTotalItems(response.data.totalItems || 0);
        } catch (err) {
            console.error('Failed to fetch inventory', err);
            toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    }, [paginationModel, sortModel, searchQuery]);

    // Unified Fetch Logic with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInventory();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    }, [paginationModel.page, paginationModel.pageSize, sortModel, searchQuery, fetchInventory]);

    const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
        Promise.resolve().then(() => {
            setPaginationModel(prev => {
                if (JSON.stringify(prev) === JSON.stringify(newModel)) return prev;
                return newModel;
            });
        });
    }, []);

    const handleSortModelChange = useCallback((newModel: GridSortModel) => {
        Promise.resolve().then(() => {
            setSortModel(prev => {
                if (JSON.stringify(prev) === JSON.stringify(newModel)) return prev;
                return newModel;
            });
        });
    }, []);

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
                                color: '#1e293b',
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
                            {params.row.Category?.name}
                        </Typography>
                    </Stack>
                </Stack>
            ),
        },
        {
            field: 'stock',
            headerName: 'Current Stock',
            width: 180,
            renderCell: (params: GridRenderCellParams) => {
                const stock = params.row.stock;
                const isLow = stock < 10;
                return (
                    <Box sx={{ width: '100%', pr: 4 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: isLow ? 'error.main' : 'text.primary' }}>
                                {stock} {params.row.unit}
                            </Typography>
                            {isLow && <LowStockIcon sx={{ fontSize: 14, color: 'error.main' }} />}
                        </Stack>
                        <LinearProgress 
                            variant="determinate" 
                            value={Math.min((stock / 50) * 100, 100)} 
                            sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: isLow ? '#ef4444' : '#0C831F'
                                }
                            }}
                        />
                    </Box>
                );
            }
        },
        {
            field: 'price',
            headerName: 'Value (Rate)',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    ₹{params.row.price}
                </Typography>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.row.stock === 0 ? 'Out of Stock' : (params.row.stock < 10 ? 'Low Stock' : 'Healthy')}
                    size="small"
                    sx={{
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        fontSize: '0.6rem',
                        bgcolor: params.row.stock === 0 ? alpha('#ef4444', 0.1) : (params.row.stock < 10 ? alpha('#f59e0b', 0.1) : alpha('#0C831F', 0.1)),
                        color: params.row.stock === 0 ? '#ef4444' : (params.row.stock < 10 ? '#f59e0b' : '#0C831F'),
                        borderRadius: 2
                    }}
                />
            ),
        }
    ], []);

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
                    No Inventory Data
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, maxWidth: 300, mx: 'auto', mt: 1 }}>
                    {searchQuery 
                        ? "We couldn't find any inventory items matching your filter. Try adjusting your search."
                        : "You don't have any products in your inventory yet. Add products to track their stock."}
                </Typography>
            </Box>
        </Stack>
    );

    const lowStockCount = products.filter(p => p.stock < 10 && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#1e293b' }}>Inventory Insights</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>Track stock movements and prevent out-of-stock scenarios.</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid #f1f5f9', bgcolor: alpha('#ef4444', 0.02) }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: alpha('#ef4444', 0.1) }}>
                                <TrendingDownIcon sx={{ color: '#ef4444' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#ef4444' }}>{outOfStockCount}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Out of Stock</Typography>
                            </Box>
                        </Stack>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid #f1f5f9', bgcolor: alpha('#f59e0b', 0.02) }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: alpha('#f59e0b', 0.1) }}>
                                <LowStockIcon sx={{ color: '#f59e0b' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#f59e0b' }}>{lowStockCount}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Low Stock Alert</Typography>
                            </Box>
                        </Stack>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 3, borderRadius: 6, border: '1px solid #f1f5f9', bgcolor: alpha('#0C831F', 0.02) }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: alpha('#0C831F', 0.1) }}>
                                <ProductIcon sx={{ color: '#0C831F' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0C831F' }}>{totalItems}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Total SKUs</Typography>
                            </Box>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #f8fafc', display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Filter by product name, category or SKU..."
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
                    <IconButton sx={{ bgcolor: '#f8fafc', borderRadius: 3 }}>
                        <FilterIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </IconButton>
                </Box>
                <Box sx={{ height: 600, width: '100%' }}>
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
        </Box>
    );
}
