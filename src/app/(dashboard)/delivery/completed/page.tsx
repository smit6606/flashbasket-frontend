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
    CircularProgress,
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

export default function CompletedDeliveries() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/orders/partner');
                const completed = (response.data || []).filter(
                    (o: any) => o.status === 'Completed' || o.status === 'Delivered'
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
    
    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress color="success" /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b' }}>Completed Deliveries</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>
                    Review your fulfillment history and track your total earnings.
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                {[
                    { label: 'Total Finished', value: orders.length, icon: <DeliveryIcon />, color: '#0C831F' },
                    { label: 'Done Today', value: todayOrders.length, icon: <CheckIcon />, color: '#2196f3' },
                    { label: 'Total Revenue', value: `₹${totalEarnings}`, icon: <RupeeIcon />, color: '#9c27b0' },
                ].map((stat, i) => (
                    <Grid size={{ xs: 12, md: 4 }} key={i}>
                        <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(stat.color, 0.1), color: stat.color, display: 'inline-flex', mb: 2 }}>
                                    {stat.icon}
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase' }}>{stat.label}</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5 }}>{stat.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {orders.length === 0 ? (
                <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 8, bgcolor: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                    <TrophyIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.2, mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary' }}>No Success Stories Yet</Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600, mt: 1 }}>Complete your first trip to see your records here.</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: alpha('#0C831F', 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 900 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 900 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 900 }}>Seller</TableCell>
                                <TableCell sx={{ fontWeight: 900 }}>Fulfillment Date</TableCell>
                                <TableCell sx={{ fontWeight: 900 }} align="right">Commission</TableCell>
                                <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>#{order.orderNumber}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.User?.user_name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{order.city}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.Seller?.shop_name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(order.updatedAt).toLocaleDateString()}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" sx={{ fontWeight: 900, color: '#0C831F' }}>₹40.00</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={order.status.toUpperCase()} 
                                            size="small" 
                                            sx={{ fontWeight: 900, bgcolor: alpha('#0C831F', 0.1), color: '#0C831F', borderRadius: 2 }} 
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
