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
    Chip,
    Button,
    Paper,
    Switch,
    LinearProgress,
    Divider,
    Avatar,
} from '@mui/material';
import {
    LocalShippingOutlined as DeliveryIcon,
    AccountBalanceWalletOutlined as EarningsIcon,
    TwoWheelerOutlined as MotoIcon,
    ListAltOutlined as TaskIcon,
    NotificationsActiveOutlined as AlertIcon,
    CheckCircleOutline as AcceptIcon,
    FiberManualRecord as DotIcon,
    MyLocationOutlined as LocationIcon,
    DoneAll as CompletedIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import LoadingButton from '@/components/mui/LoadingButton';

export default function DeliveryDashboard() {
    const socket = useSocket();
    const [isOnDuty, setIsOnDuty] = useState(true);
    const [availableOrders, setAvailableOrders] = useState<any[]>([]);
    const [activeTrips, setActiveTrips] = useState<any[]>([]);
    const [pastOrders, setPastOrders] = useState<any[]>([]);
    const [fetchingAvailable, setFetchingAvailable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

    const fetchPartnerOrders = async () => {
        try {
            const response = await api.get('/orders/partner');
            const all = response.data || [];
            setActiveTrips(all.filter((o: any) => !['completed', 'delivered', 'cancelled'].includes(o.status)));
            setPastOrders(all.filter((o: any) => o.status === 'completed' || o.status === 'delivered'));
        } catch (err: any) {
            console.error('Failed to fetch partner orders', err);
        }
    };

    const fetchAvailableRequests = async () => {
        if (!isOnDuty) { setAvailableOrders([]); return; }
        try {
            setFetchingAvailable(true);
            const response = await api.get('/delivery/available');
            setAvailableOrders(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch available orders', err);
        } finally {
            setFetchingAvailable(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchPartnerOrders(), fetchAvailableRequests()]);
            setLoading(false);
        };
        init();
    }, [isOnDuty]);

    useEffect(() => {
        if (!socket) return;
        socket.on('order_accepted', (data: any) => {
            setAvailableOrders(prev => prev.filter(o => o.id !== data.orderId));
        });
        socket.on('new_order_broadcast', () => {
            fetchAvailableRequests();
        });
        return () => {
            socket.off('order_accepted');
            socket.off('new_order_broadcast');
        };
    }, [socket, isOnDuty]);

    const handleAcceptOrder = async (orderId: number) => {
        try {
            setActionLoading(prev => ({ ...prev, [orderId]: true }));
            await api.patch(`/delivery/${orderId}/accept`, {});
            toast.success('🏍️ Trip Accepted! Drive safely.');
            setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
            fetchPartnerOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to accept order');
            fetchAvailableRequests();
        } finally {
            setActionLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const todayEarnings = pastOrders.filter(o => {
        const d = new Date(o.updatedAt);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }).length * 40;

    const stats = [
        { label: 'Active Trips', value: activeTrips.length.toString(), icon: <MotoIcon />, color: '#2196f3', bgcolor: alpha('#2196f3', 0.1) },
        { label: "Today's Earnings", value: `₹${todayEarnings}`, icon: <EarningsIcon />, color: '#0C831F', bgcolor: alpha('#0C831F', 0.1) },
        { label: 'Total Completed', value: pastOrders.length.toString(), icon: <CompletedIcon />, color: '#9c27b0', bgcolor: alpha('#9c27b0', 0.1) },
        { label: 'Available Near You', value: availableOrders.length.toString(), icon: <AlertIcon />, color: '#ff9800', bgcolor: alpha('#ff9800', 0.1) },
    ];

    if (loading) return <Box sx={{ p: 4 }}><LinearProgress color="success" sx={{ borderRadius: 4 }} /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 5 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>
                        Flash Fleet Hub
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mt: 0.5 }}>
                        Real-time delivery management & marketplace
                    </Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 1, px: 3, borderRadius: 10, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isOnDuty ? '#22c55e' : '#94a3b8', boxShadow: isOnDuty ? '0 0 0 3px rgba(34,197,94,0.2)' : 'none', transition: 'all 0.3s' }} />
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: isOnDuty ? '#0C831F' : 'text.disabled', letterSpacing: '0.05em' }}>
                        {isOnDuty ? 'On Duty' : 'Offline'}
                    </Typography>
                    <Switch checked={isOnDuty} onChange={() => setIsOnDuty(!isOnDuty)} color="success" size="small" />
                </Paper>
            </Stack>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {stats.map((card, index) => (
                    <Grid size={{ xs: 6, md: 3 }} key={index}>
                        <Card elevation={0} sx={{ borderRadius: 5, border: '1px solid #f1f5f9', transition: 'all 0.2s', '&:hover': { boxShadow: '0 10px 30px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: card.bgcolor, color: card.color, display: 'inline-flex', mb: 2 }}>
                                    {card.icon}
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.08em' }}>{card.label}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>{card.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Marketplace Section */}
            <Box sx={{ mb: 6 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
                            🛒 Marketplace
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Available deliveries in your city — accept to start earning
                        </Typography>
                    </Box>
                    <Button size="small" onClick={fetchAvailableRequests} disabled={fetchingAvailable || !isOnDuty}
                        sx={{ fontWeight: 800, color: 'primary.main', bgcolor: alpha('#0C831F', 0.06), borderRadius: 3, px: 2 }}>
                        {fetchingAvailable ? 'Refreshing...' : '↻ Refresh'}
                    </Button>
                </Stack>

                {!isOnDuty ? (
                    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 6, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.disabled' }}>Go online to see available orders</Typography>
                    </Paper>
                ) : availableOrders.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 6, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                        <AlertIcon sx={{ fontSize: 36, color: 'text.disabled', opacity: 0.3, mb: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.secondary' }}>Searching for orders in your city...</Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>Pull to refresh or wait for a new order notification</Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {availableOrders.map((order) => (
                            <Grid size={{ xs: 12, md: 6 }} key={order.id}>
                                <Card elevation={0} sx={{ borderRadius: 6, border: '2px solid #0C831F', overflow: 'hidden', transition: 'all 0.2s', '&:hover': { boxShadow: '0 10px 40px rgba(12,131,31,0.12)', transform: 'translateY(-2px)' } }}>
                                    <Box sx={{ p: 3, bgcolor: alpha('#0C831F', 0.04), display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: alpha('#0C831F', 0.1) }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#0C831F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>New Request</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>#{order.orderNumber}</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Payout</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0C831F' }}>₹40</Typography>
                                        </Box>
                                    </Box>
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={2} sx={{ mb: 3 }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <DotIcon sx={{ fontSize: 14, color: '#0C831F', mt: 0.5, flexShrink: 0 }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>PICKUP</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.Seller?.shop_name || 'Partner Store'}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{order.Seller?.address}</Typography>
                                                </Box>
                                            </Box>
                                            <Divider sx={{ ml: 3, borderStyle: 'dashed' }} />
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <LocationIcon sx={{ fontSize: 14, color: '#2196f3', mt: 0.5, flexShrink: 0 }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>DROP OFF</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>Customer · {order.city}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typeof order.deliveryAddress === 'string' ? order.deliveryAddress : order.deliveryAddress?.address || JSON.stringify(order.deliveryAddress)}</Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                        <LoadingButton
                                            variant="contained"
                                            color="success"
                                            fullWidth
                                            onClick={() => handleAcceptOrder(order.id)}
                                            loading={actionLoading[order.id]}
                                            loadingText="Accepting..."
                                            sx={{ fontWeight: 900, borderRadius: 3, py: 1.5, bgcolor: '#0C831F', fontSize: '0.9rem' }}
                                        >
                                            ✓ Accept Trip
                                        </LoadingButton>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* My Current Deliveries (Quick View) */}
            {activeTrips.length > 0 && (
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
                                🏍️ My Active Trips
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Orders you have accepted — go to Active Trips to manage them
                            </Typography>
                        </Box>
                        <Chip label={`${activeTrips.length} Active`} color="primary" size="small" sx={{ fontWeight: 900, bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', border: 'none' }} variant="outlined" />
                    </Stack>
                    <Stack spacing={2}>
                        {activeTrips.map((order) => (
                            <Paper key={order.id} elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 900 }}>#{order.orderNumber}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{order.Seller?.shop_name} → Customer</Typography>
                                </Box>
                                <Chip label={order.status.replace(/-/g, ' ').toUpperCase()} size="small" sx={{ fontWeight: 900, bgcolor: '#f1f5f9' }} />
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
