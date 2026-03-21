'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    alpha,
    Button,
    Paper,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    NotificationsActiveOutlined as AlertIcon,
    FiberManualRecord as DotIcon,
    MyLocationOutlined as LocationIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import LoadingButton from '@/components/mui/LoadingButton';

export default function AvailableDeliveries() {
    const socket = useSocket();
    const [availableOrders, setAvailableOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

    const fetchAvailable = async () => {
        try {
            setFetching(true);
            const response = await api.get('/delivery/available');
            setAvailableOrders(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch available orders', err);
        } finally {
            setFetching(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailable();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('order_accepted', (data: any) => {
            setAvailableOrders(prev => prev.filter(o => o.id !== data.orderId));
        });
        socket.on('new_order_broadcast', () => {
            fetchAvailable();
        });
        return () => {
            socket.off('order_accepted');
            socket.off('new_order_broadcast');
        };
    }, [socket]);

    const handleAcceptOrder = async (orderId: number) => {
        try {
            setActionLoading(prev => ({ ...prev, [orderId]: true }));
            await api.patch(`/delivery/${orderId}/accept`, {});
            toast.success('🏍️ Trip Accepted! Drive safely.');
            setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to accept order');
            fetchAvailable();
        } finally {
            setActionLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress color="success" /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b' }}>Available Deliveries</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>
                    Accept new available requests to start earning.
                </Typography>
            </Box>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    variant="outlined" 
                    onClick={fetchAvailable} 
                    disabled={fetching}
                    sx={{ borderRadius: 3, fontWeight: 800 }}
                >
                    {fetching ? 'Refreshing...' : '↻ Refresh Available'}
                </Button>
            </Box>

            {availableOrders.length === 0 ? (
                <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 8, bgcolor: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                    <AlertIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.2, mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1 }}>No Available Requests</Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>We'll notify you when new orders arrive in your city.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {availableOrders.map((order) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={order.id}>
                            <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { boxShadow: '0 20px 40px rgba(0,0,0,0.06)', transform: 'translateY(-4px)' } }}>
                                <Box sx={{ p: 3, bgcolor: alpha('#0C831F', 0.05), borderBottom: '1px solid #f1f5f9' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#0C831F', textTransform: 'uppercase' }}>Payout</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0C831F' }}>₹40</Typography>
                                        </Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a' }}>#{order.orderNumber}</Typography>
                                    </Stack>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2.5} sx={{ mb: 4 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <DotIcon sx={{ fontSize: 16, color: '#0C831F', mt: 0.5 }} />
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>PICKUP</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.Seller?.shop_name || 'Marketplace Store'}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{order.Seller?.address}</Typography>
                                            </Box>
                                        </Box>
                                        <Divider sx={{ borderStyle: 'dashed' }} />
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <LocationIcon sx={{ fontSize: 16, color: '#2196f3', mt: 0.5 }} />
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>DELIVERY</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>Customer ({order.city})</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                                                    {typeof order.deliveryAddress === 'string' ? order.deliveryAddress : order.deliveryAddress?.address}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                    <LoadingButton
                                        variant="contained"
                                        color="success"
                                        fullWidth
                                        loading={actionLoading[order.id]}
                                        onClick={() => handleAcceptOrder(order.id)}
                                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 900, bgcolor: '#0C831F' }}
                                    >
                                        Accept & Start Trip
                                    </LoadingButton>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
