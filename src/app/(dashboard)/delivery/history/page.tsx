'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    Avatar,
    LinearProgress,
    Card,
    CardContent,
    Grid,
    alpha,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    LocationOn as MapIcon,
    AccessTime as TimeIcon,
    CurrencyRupee as RupeeIcon,
    LocalShipping as DeliveryIcon,
    EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function DeliveryHistoryPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/orders/partner');
                const completed = (response.data || []).filter(
                    (o: any) => o.status === 'completed' || o.status === 'delivered'
                );
                setOrders(completed);
            } catch (err: any) {
                toast.error('Failed to load delivery history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const totalEarnings = orders.length * 40;
    const todayOrders = orders.filter(o => new Date(o.updatedAt).toDateString() === new Date().toDateString());
    const thisWeekOrders = orders.filter(o => {
        const d = new Date(o.updatedAt);
        const now = new Date();
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return d >= weekAgo;
    });

    if (loading) return <Box sx={{ p: 4 }}><LinearProgress color="success" sx={{ borderRadius: 4 }} /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>
                    Past Deliveries
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mt: 0.5 }}>
                    Your completed delivery history and earnings breakdown
                </Typography>
            </Box>

            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                {[
                    { label: 'Total Deliveries', value: orders.length, icon: <DeliveryIcon />, color: '#0C831F' },
                    { label: 'Today', value: todayOrders.length, icon: <CheckIcon />, color: '#2196f3' },
                    { label: 'This Week', value: thisWeekOrders.length, icon: <TrophyIcon />, color: '#ff9800' },
                    { label: 'Total Earned', value: `₹${totalEarnings}`, icon: <RupeeIcon />, color: '#9c27b0' },
                ].map((stat, i) => (
                    <Grid size={{ xs: 6, md: 3 }} key={i}>
                        <Card elevation={0} sx={{ borderRadius: 5, border: '1px solid #f1f5f9' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(stat.color, 0.1), color: stat.color, display: 'inline-flex', mb: 2 }}>
                                    {stat.icon}
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.08em' }}>{stat.label}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5, color: '#0f172a' }}>{stat.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {orders.length === 0 ? (
                <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 8, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                    <DeliveryIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>No completed deliveries yet</Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600, mt: 1 }}>
                        Complete your first delivery to see it here!
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 5, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: alpha('#0C831F', 0.04) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>Order ID</TableCell>
                                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>Store (Pickup)</TableCell>
                                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>Delivered On</TableCell>
                                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }} align="right">Order Value</TableCell>
                                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }} align="right">Payout</TableCell>
                                <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order: any) => (
                                <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                            #{order.orderNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', fontSize: '0.8rem', fontWeight: 900 }}>
                                                {order.User?.user_name?.charAt(0)?.toUpperCase() || 'C'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.User?.user_name || 'Customer'}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <MapIcon sx={{ fontSize: 11 }} />
                                                    {typeof order.deliveryAddress === 'string'
                                                        ? order.deliveryAddress.substring(0, 30) + '...'
                                                        : (order.deliveryAddress?.address || '').substring(0, 30) + '...'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.Seller?.shop_name || 'Partner Store'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <TimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                    {new Date(order.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    {new Date(order.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" sx={{ fontWeight: 900 }}>₹{parseFloat(order.totalAmount).toFixed(0)}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" sx={{ fontWeight: 900, color: '#0C831F' }}>₹40.00</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<CheckIcon sx={{ fontSize: '14px !important' }} />}
                                            label="Delivered"
                                            size="small"
                                            sx={{ fontWeight: 900, fontSize: '0.7rem', bgcolor: alpha('#0C831F', 0.1), color: '#0C831F', border: 'none' }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
