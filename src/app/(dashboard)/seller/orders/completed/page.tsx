'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    LinearProgress,
    TextField,
    InputAdornment,
    Paper,
    Divider,
    Chip,
    alpha,
    TablePagination,
    Button,
} from '@mui/material';
import {
    ReceiptLongOutlined as OrderIcon,
    PlaceOutlined as AddressIcon,
    ScheduleOutlined as TimeIcon,
    CheckCircle as DoneIcon,
    Inventory2Outlined as ProductIcon,
    Search as SearchIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { formatPhoneForDisplay } from '@/lib/phoneUtils';

interface Order {
    id: number;
    orderNumber: string;
    totalAmount: string;
    status: string;
    deliveryAddress: string;
    createdAt: string;
    Products: {
        productName: string;
        OrderItem: {
            quantity: number;
            price: string;
        };
    }[];
    DeliveryPartner?: {
        name: string;
        phone: string;
    };
}

export default function SellerCompletedOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
                search: searchQuery,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            const response = await api.get(`/orders/seller/completed?${params.toString()}`);
            setOrders(response.data.items || []);
            setTotalItems(response.data.totalItems || 0);
        } catch (err) {
            console.error('Failed to fetch completed orders', err);
            toast.error('Failed to load completed orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(timer);
    }, [page, rowsPerPage, searchQuery]);

    const getStatusLabel = (status: string) => {
        if (status === 'delivered') return 'Delivered';
        if (status === 'completed') return 'Completed';
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
    };

    if (loading && orders.length === 0) return <Box sx={{ p: 4 }}><LinearProgress /></Box>;

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Completed Orders</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>Review your successfully fulfilled store orders and history.</Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 6 }}>
                <TextField
                    placeholder="Search Order Number or Address..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: '16px', bgcolor: 'white', fontWeight: 600 }
                    }}
                />
            </Stack>

            <Grid container spacing={4}>
                {orders.length === 0 && !loading ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: '32px', bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                            <DoneIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 3 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary' }}>No completed orders found</Typography>
                        </Paper>
                    </Grid>
                ) : (
                    orders.map((order) => {
                        return (
                            <Grid size={{ xs: 12 }} key={order.id}>
                                <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', transition: 'all 0.3s', '&:hover': { boxShadow: '0 20px 60px rgba(0,0,0,0.04)' } }}>
                                    <Box sx={{ p: 4, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                                        <Stack direction="row" spacing={6} divider={<Divider orientation="vertical" flexItem />}>
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Order No.</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900 }}>{order.orderNumber}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Total Amount</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{order.totalAmount}</Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Chip
                                                label={getStatusLabel(order.status)}
                                                sx={{
                                                    fontWeight: 900,
                                                    borderRadius: 3,
                                                    bgcolor: alpha('#0C831F', 0.1),
                                                    color: '#0C831F',
                                                    px: 1
                                                }}
                                            />
                                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <DoneIcon fontSize="small" /> SUCCESSFUL
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    <CardContent sx={{ p: 4 }}>
                                        <Grid container spacing={6}>
                                            <Grid size={{ xs: 12, lg: 8 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, textTransform: 'uppercase', color: 'text.secondary' }}>Item Details</Typography>
                                                <Stack spacing={2}>
                                                    {order.Products?.map((prod, i) => (
                                                        <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: '12px', bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                                                    <ProductIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                                </Box>
                                                                <Typography variant="body1" sx={{ fontWeight: 800 }}>{prod.productName}</Typography>
                                                            </Stack>
                                                            <Stack direction="row" spacing={4} alignItems="center">
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Qty: {prod.OrderItem.quantity}</Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 900 }}>₹{prod.OrderItem.price}</Typography>
                                                            </Stack>
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12, lg: 4 }}>
                                                <Box sx={{ height: '100%', borderLeft: { lg: '1px solid #f1f5f9' }, pl: { lg: 6 } }}>
                                                    <Box sx={{ mb: 4 }}>
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                            <AddressIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary' }}>Delivered To</Typography>
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.6 }}>{order.deliveryAddress}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                            <TimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary' }}>Completion Date</Typography>
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(order.createdAt).toLocaleString()}</Typography>
                                                    </Box>
                                                    {order.DeliveryPartner && (
                                                        <Box sx={{ mt: 4, p: 2, borderRadius: 3, bgcolor: alpha('#0C831F', 0.05), border: '1px solid', borderColor: alpha('#0C831F', 0.1) }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#0C831F', display: 'block', mb: 1 }}>Fulfilled By</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 900 }}>{order.DeliveryPartner.name}</Typography>
                                                            <Button size="small" startIcon={<PhoneIcon />} sx={{ fontWeight: 800, p: 0, minWidth: 0, color: '#0C831F' }}>{formatPhoneForDisplay(order.DeliveryPartner.phone)}</Button>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>

            {/* Pagination Controls */}
            <Paper elevation={0} sx={{ mt: 4, borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <TablePagination
                    component="div"
                    count={totalItems}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </Paper>
        </Box>
    );
}
