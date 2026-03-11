'use client';

import React, { useState, useEffect } from 'react';
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
    Button,
    Select,
    MenuItem,
    FormControl,
    Stack,
    CircularProgress,
    alpha,
    Divider
} from '@mui/material';
import { 
    AssignmentInd as AssignIcon, 
    LocalShipping as DispatchIcon,
    CheckCircle as DoneIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, partnersRes] = await Promise.all([
                api.get('/admin/orders'),
                api.get('/admin/partners')
            ]);
            setOrders(ordersRes.data || []);
            setPartners(partnersRes.data || []);
        } catch (error: any) {
            console.error('ADMIN DATA FETCH ERROR:', error);
            toast.error(error.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignDelivery = async (orderId: number, partnerId: number | '') => {
        if (!partnerId) return;
        try {
            await api.put('/admin/assign-delivery', { orderId, partnerId });
            toast.success('Delivery boy assigned successfully!');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to assign delivery boy');
        }
    };

    const handleDispatch = async (orderId: number) => {
        try {
            await api.put(`/admin/dispatch-order/${orderId}`, {});
            toast.success('Order dispatched back to seller!');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to dispatch order');
        }
    };

    const handleCancel = async (orderId: number) => {
        if(!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await api.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
            toast.warn('Order Cancelled');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel order');
        }
    }

    const getStatusChip = (status: string) => {
        const configs: any = {
            'pending': { color: 'warning', label: 'Order Placed' },
            'preparing': { color: 'info', label: 'Seller Preparing' },
            'awaiting-assignment': { color: 'secondary', label: 'Waiting for Admin' },
            'assigned': { color: 'primary', label: 'Driver Assigned' },
            'accepted-by-partner': { color: 'success', label: 'Driver Committed' },
            'ready-to-ship': { color: 'info', label: 'Ready for Dispatch' },
            'shipped': { color: 'primary', label: 'In Transit' },
            'out-for-delivery': { color: 'warning', label: 'Out for Delivery' },
            'arrived': { color: 'secondary', label: 'Arrived at User' },
            'delivered': { color: 'success', label: 'Delivered' },
            'completed': { color: 'success', label: 'Completed' },
            'cancelled': { color: 'error', label: 'Cancelled' }
        };
        const config = configs[status] || { color: 'default', label: status };
        return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 900, borderRadius: 2 }} />;
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.dark' }}>
                    Logistics Control
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Manage delivery assignments and monitor platform-wide order movement.
                </Typography>
            </Box>

            <TableContainer component={Card} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha('#0C831F', 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Order</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Store</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>Logistics Actions</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Admin</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600 }}>
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : orders.map((order) => {
                            const isFinal = ['delivered', 'completed', 'cancelled'].includes(order.status);

                            return (
                                <TableRow key={order.id} sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{order.orderNumber}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                            {order.User?.user_name} • {new Date(order.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.Seller?.shop_name || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusChip(order.status)}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                            {/* Step 1: Assignment */}
                                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                                <Select
                                                    displayEmpty
                                                    value={order.deliveryPartnerId || ''}
                                                    onChange={(e) => handleAssignDelivery(order.id, e.target.value as number)}
                                                    disabled={isFinal}
                                                    sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}
                                                >
                                                    <MenuItem value="" disabled><em>Select Driver</em></MenuItem>
                                                    {partners.map(p => (
                                                        <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                                            {p.name} {p.isAvailable ? '🟢' : '🔴'}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            {/* Step 2: Dispatch to Seller */}
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="secondary"
                                                onClick={() => handleDispatch(order.id)}
                                                disabled={order.status !== 'accepted-by-partner'}
                                                startIcon={<DispatchIcon />}
                                                sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none' }}
                                            >
                                                Send to Seller
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right">
                                        {!isFinal && (
                                            <Button 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleCancel(order.id)}
                                                sx={{ fontWeight: 800 }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        {isFinal && (
                                            <Typography variant="caption" sx={{ color: order.status === 'cancelled' ? 'error.main' : 'success.main', fontWeight: 900 }}>
                                                {order.status.toUpperCase()}
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
