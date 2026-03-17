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
    Paper,
    Switch,
    LinearProgress,
} from '@mui/material';
import {
    AccountBalanceWalletOutlined as EarningsIcon,
    TwoWheelerOutlined as MotoIcon,
    NotificationsActiveOutlined as AlertIcon,
    DoneAll as CompletedIcon,
    StorefrontOutlined as StoreIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';

export default function DeliveryDashboard() {
    const socket = useSocket();
    const [isOnDuty, setIsOnDuty] = useState(true);
    const [stats, setStats] = useState({
        activeCount: 0,
        completedCount: 0,
        availableCount: 0,
        todayEarnings: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [ordersRes, availableRes] = await Promise.all([
                api.get('/orders/partner'),
                api.get('/delivery/available')
            ]);

            const allOrders = ordersRes.data || [];
            const available = availableRes.data || [];

            const active = allOrders.filter((o: any) => 
                ['Assigned', 'Accepted-By-Partner', 'Shipped', 'Out-for-Delivery', 'Arrived'].includes(o.status)
            );
            const completed = allOrders.filter((o: any) => 
                ['Completed', 'Delivered'].includes(o.status)
            );

            const today = new Date().toDateString();
            const todayCompleted = completed.filter((o: any) => 
                new Date(o.updatedAt).toDateString() === today
            );

            setStats({
                activeCount: active.length,
                completedCount: completed.length,
                availableCount: available.length,
                todayEarnings: todayCompleted.length * 40
            });
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('order_update', fetchData);
        socket.on('new_order_broadcast', fetchData);
        return () => {
            socket.off('order_update');
            socket.off('new_order_broadcast');
        };
    }, [socket]);

    if (loading) return <Box sx={{ p: 4 }}><LinearProgress color="success" /></Box>;

    const statCards = [
        { label: 'Active Trips', value: stats.activeCount, icon: <MotoIcon />, color: '#2196f3' },
        { label: "Today's Revenue", value: `₹${stats.todayEarnings}`, icon: <EarningsIcon />, color: '#0C831F' },
        { label: 'Total Completed', value: stats.completedCount, icon: <CompletedIcon />, color: '#8b5cf6' },
        { label: 'Marketplace', value: stats.availableCount, icon: <AlertIcon />, color: '#ff9800' },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                        Fleet Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>
                        Welcome back! Here is a summary of your delivery operations.
                    </Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 1.5, px: 3, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: isOnDuty ? '#22c55e' : '#94a3b8' }} />
                    <Typography variant="button" sx={{ fontWeight: 900, color: isOnDuty ? '#0C831F' : 'text.disabled' }}>
                        {isOnDuty ? 'On Duty' : 'Offline'}
                    </Typography>
                    <Switch checked={isOnDuty} onChange={() => setIsOnDuty(!isOnDuty)} color="success" />
                </Paper>
            </Stack>

            <Grid container spacing={4} sx={{ mb: 6 }}>
                {statCards.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(0,0,0,0.05)' } }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ p: 2, borderRadius: 4, bgcolor: alpha(card.color, 0.1), color: card.color, display: 'inline-flex', mb: 2 }}>
                                    {card.icon}
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900, mt: 1 }}>{card.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card elevation={0} sx={{ p: 4, borderRadius: 8, bgcolor: '#1e293b', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>Marketplace Integrity</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 500, fontWeight: 500 }}>
                                Your performance affects your priority in the marketplace. Maintain a high completion rate to unlock premium deliveries.
                            </Typography>
                            <Stack direction="row" spacing={3}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>98%</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Success Rate</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>4.9</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Avg Rating</Typography>
                                </Box>
                            </Stack>
                        </Stack>
                        <StoreIcon sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 180, opacity: 0.05 }} />
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 4, borderRadius: 8, border: '1px solid #e2e8f0', height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Help & Safety</Typography>
                        <Stack spacing={2}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: '#fffcf5', borderColor: '#fef3c7' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e' }}>Safety First</Typography>
                                <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>Always wear your helmet while riding.</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: '#f0fdf4', borderColor: '#dcfce7' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>Need Help?</Typography>
                                <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600 }}>Contact support at 1800-FLASH</Typography>
                            </Paper>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
