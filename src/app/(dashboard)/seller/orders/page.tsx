'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    alpha,
    Divider,
    Button,
    IconButton,
    Tooltip,
    Paper,
} from '@mui/material';
import {
    ReceiptLongOutlined as OrderIcon,
    TimelineOutlined as StatusIcon,
    PlaceOutlined as AddressIcon,
    ScheduleOutlined as TimeIcon,
    LocalShippingOutlined as ShippingIcon,
    CheckCircleOutline as CheckIcon,
    CancelOutlined as CancelIcon,
    Inventory2Outlined as ProductIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

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
}

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/seller');
            setOrders(response.data);
        } catch (err) {
            console.error('Failed to fetch orders', err);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { color: '#ff9800', label: 'Pending', icon: <StatusIcon fontSize="small" /> };
            case 'confirmed': return { color: '#2196f3', label: 'Confirmed', icon: <CheckIcon fontSize="small" /> };
            case 'preparing': return { color: '#9c27b0', label: 'Preparing', icon: <StatusIcon fontSize="small" /> };
            case 'out-for-delivery': return { color: '#03a9f4', label: 'Out for Delivery', icon: <ShippingIcon fontSize="small" /> };
            case 'delivered': return { color: '#0C831F', label: 'Delivered', icon: <CheckIcon fontSize="small" /> };
            case 'cancelled': return { color: '#ef5350', label: 'Cancelled', icon: <CancelIcon fontSize="small" /> };
            default: return { color: '#747d8c', label: status, icon: <StatusIcon fontSize="small" /> };
        }
    };

    if (loading) return <Box sx={{ p: 4 }}><Typography variant="h6" sx={{ fontWeight: 800 }}>Loading orders...</Typography></Box>;

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Active Orders</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                    {orders.length} ACTIVE REQUESTS TO MANAGE
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {orders.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 8, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                            <OrderIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 3 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary' }}>No active orders found</Typography>
                        </Paper>
                    </Grid>
                ) : (
                    orders.map((order) => {
                        const config = getStatusConfig(order.status);
                        return (
                            <Grid size={{ xs: 12 }} key={order.id}>
                                <Card elevation={0} sx={{ borderRadius: 8, border: '1px solid #f1f5f9', overflow: 'hidden', transition: 'all 0.3s', '&:hover': { boxShadow: '0 20px 60px rgba(0,0,0,0.04)' } }}>
                                    <Box sx={{ p: 4, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                                        <Stack direction="row" spacing={6} divider={<Divider orientation="vertical" flexItem />}>
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Order No.</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900 }}>{order.orderNumber}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Items</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900 }}>{order.Products?.length || 0}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Total Amount</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{order.totalAmount}</Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Chip
                                                icon={config.icon}
                                                label={config.label}
                                                sx={{
                                                    fontWeight: 900,
                                                    borderRadius: 3,
                                                    bgcolor: alpha(config.color, 0.1),
                                                    color: config.color,
                                                    px: 1,
                                                    '& .MuiChip-icon': { color: 'inherit' }
                                                }}
                                            />
                                            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                                                <Select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value as string)}
                                                    sx={{
                                                        borderRadius: 3,
                                                        fontWeight: 800,
                                                        fontSize: '0.8rem',
                                                        bgcolor: 'white'
                                                    }}
                                                >
                                                    <MenuItem value="pending">Pending</MenuItem>
                                                    <MenuItem value="confirmed">Confirm Order</MenuItem>
                                                    <MenuItem value="preparing">Start Preparing</MenuItem>
                                                    <MenuItem value="out-for-delivery">Ship Order</MenuItem>
                                                    <MenuItem value="delivered">Mark Delivered</MenuItem>
                                                    <MenuItem value="cancelled">Cancel Order</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Stack>
                                    </Box>

                                    <CardContent sx={{ p: 4 }}>
                                        <Grid container spacing={6}>
                                            <Grid size={{ xs: 12, lg: 8 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, textTransform: 'uppercase', color: 'text.secondary' }}>Order Details</Typography>
                                                <Stack spacing={2}>
                                                    {order.Products?.map((prod, i) => (
                                                        <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary' }}>Delivery Address</Typography>
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.6 }}>{order.deliveryAddress}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                            <TimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary' }}>Order Placed</Typography>
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(order.createdAt).toLocaleString()}</Typography>
                                                    </Box>
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
        </Box>
    );
}
