'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    alpha,
    LinearProgress,
    Divider,
    Paper,
    Avatar,
    Chip,
} from '@mui/material';
import CustomTooltip from '@/components/common/CustomTooltip';
import {
    TrendingUp as TrendingIcon,
    ShoppingBag as OrdersIcon,
    MonetizationOn as RevenueIcon,
    Inventory2 as ProductIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';

export default function SellerAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/seller/dashboard');
                setData(response.data);
            } catch (err) {
                console.error('Failed to fetch analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Box sx={{ p: 4 }}><LinearProgress /></Box>;

    const stats = [
        { label: 'Total Revenue', value: `₹${data?.stats?.totalRevenue?.toLocaleString()}`, icon: <RevenueIcon />, color: '#0C831F' },
        { label: 'Total Orders', value: data?.stats?.totalOrders, icon: <OrdersIcon />, color: '#2196f3' },
        { label: 'Active Products', value: data?.stats?.totalProducts, icon: <ProductIcon />, color: '#ff9800' },
        { label: 'Active Orders', value: data?.stats?.activeOrders, icon: <StarIcon />, color: '#9c27b0' },
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Sales Insights</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                    Deep dive into your store performance
                </Typography>
            </Box>

            <Grid container spacing={4} sx={{ mb: 6 }}>
                {stats.map((stat, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: alpha(stat.color, 0.1), color: stat.color, display: 'inline-flex', mb: 2 }}>
                                    {stat.icon}
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>{stat.label}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>{stat.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                {/* Revenue Chart Placeholder */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card elevation={0} sx={{ borderRadius: 8, border: '1px solid #f1f5f9', p: 4, height: '100%' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>Monthly Revenue</Typography>
                            <TrendingIcon sx={{ color: '#0C831F' }} />
                        </Stack>
                        <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, pt: 4 }}>
                            {data?.charts?.monthlySales?.map((m: any, i: number) => (
                                <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <CustomTooltip title={`₹${m.revenue}`} arrow>
                                        <Box sx={{ 
                                            width: '100%', 
                                            bgcolor: alpha('#0C831F', 0.8), 
                                            borderRadius: '8px 8px 0 0', 
                                            height: `${(m.revenue / (Math.max(...data.charts.monthlySales.map((x:any)=>x.revenue)) || 1)) * 200}px`,
                                            transition: 'all 0.3s'
                                        }} />
                                    </CustomTooltip>
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>{m.month}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Card>
                </Grid>

                {/* Top Products */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card elevation={0} sx={{ borderRadius: 8, border: '1px solid #f1f5f9', p: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 4 }}>Top Selling</Typography>
                        <Stack spacing={3}>
                            {data?.charts?.topProducts?.map((p: any, i: number) => (
                                <Box key={i}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{p.productName}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 900 }}>{p.totalSold} Units</Typography>
                                    </Stack>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={(p.totalSold / (data.charts.topProducts[0]?.totalSold || 1)) * 100} 
                                        sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#0C831F' } }} 
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                </Grid>

                {/* Least Selling */}
                <Grid size={{ xs: 12 }}>
                    <Card elevation={0} sx={{ borderRadius: 8, border: '1px solid #f1f5f9', p: 4, bgcolor: '#fff' }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 4 }}>Least Selling Products (Action Needed)</Typography>
                        <Grid container spacing={3}>
                            {data?.charts?.leastProducts?.map((p: any, i: number) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={i}>
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 4, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800, mb: 1, height: 40, overflow: 'hidden' }}>{p.productName}</Typography>
                                        <Chip label={`${p.totalSold} Sold`} size="small" sx={{ fontWeight: 900, bgcolor: alpha('#ef5350', 0.1), color: '#ef5350' }} />
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

