'use client';

import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    Stack, 
    Divider, 
    Paper,
    LinearProgress
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { api } from '@/lib/api';

export default function EarningsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/partner');
                setOrders(response.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalEarnings = deliveredOrders.length * 40;

    if (loading) return <Box sx={{ p: 4 }}><LinearProgress /></Box>;

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>Earning Ledger</Typography>
            
            <Card sx={{ bgcolor: '#0C831F', color: 'white', borderRadius: 6, mb: 6 }}>
                <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 4 }}>
                        <WalletIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, opacity: 0.8 }}>Total Balance</Typography>
                        <Typography variant="h2" sx={{ fontWeight: 900 }}>₹{totalEarnings}</Typography>
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>Recent Payouts</Typography>
            <Stack spacing={2}>
                {deliveredOrders.length === 0 ? (
                    <Typography color="text.secondary">No earnings recorded yet.</Typography>
                ) : deliveredOrders.map((order) => (
                    <Paper key={order.id} sx={{ p: 3, borderRadius: 4, border: '1px solid #f1f5f9' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 800 }}>Trip #{order.orderNumber}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Completed on {new Date(order.updatedAt).toLocaleDateString()}</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0C831F' }}>+₹40.00</Typography>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
}
