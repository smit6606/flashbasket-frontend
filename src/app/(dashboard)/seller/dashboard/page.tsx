'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Stack,
    alpha,
    Skeleton,
    IconButton,
} from '@mui/material';
import {
    TrendingUp as RevenueIcon,
    ShoppingCart as OrdersIcon,
    LocalShipping as DeliveryIcon,
    Inventory as ProductsIcon,
    Add as AddIcon,
    Download as DownloadIcon,
    MoreVert as MoreIcon,
    ArrowForward as ArrowIcon,
    WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/seller/dashboard');
                setStats(response.data.stats || response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Revenue', value: `₹${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: <RevenueIcon />, color: '#0C831F', bgcolor: alpha('#0C831F', 0.1) },
        { label: 'Store Orders', value: stats?.totalOrders || 0, icon: <OrdersIcon />, color: '#2196f3', bgcolor: alpha('#2196f3', 0.1) },
        { label: 'Active Tasks', value: stats?.activeOrders || 0, icon: <DeliveryIcon />, color: '#ff9800', bgcolor: alpha('#ff9800', 0.1) },
        { label: 'Live Products', value: stats?.totalProducts || 0, icon: <ProductsIcon />, color: '#9c27b0', bgcolor: alpha('#9c27b0', 0.1) },
    ];

    if (loading) return (
        <Box sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 6 }}>
                <Box>
                    <Skeleton width={300} height={60} />
                    <Skeleton width={200} height={20} />
                </Box>
                <Stack direction="row" spacing={2}>
                    <Skeleton width={120} height={50} />
                    <Skeleton width={120} height={50} />
                </Stack>
            </Stack>
            <Grid container spacing={4}>
                {[...Array(4)].map((_, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 6 }} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    return (
        <Box sx={{ p: 1 }}>
            {stats?.sellerStatus === 'Suspended' && (
                <Card elevation={0} sx={{ mb: 4, borderRadius: 6, bgcolor: alpha('#ef4444', 0.05), border: '1px solid', borderColor: alpha('#ef4444', 0.2) }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1, borderRadius: 3, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', display: 'flex' }}>
                                <WarningIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#ef4444' }}>Account Suspended</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Your account has been suspended by the administrator. Operations are restricted. Contact support for assistance.</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            )}
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={3} sx={{ mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Store Dashboard</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                        Tracking your business in real-time
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        sx={{ px: 3, py: 1.2, borderRadius: 3, fontWeight: 800, color: 'text.secondary', borderColor: '#e2e8f0' }}
                    >
                        Report
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/seller/catalog/add')}
                        disabled={stats?.sellerStatus === 'Suspended'}
                        sx={{ px: 3, py: 1.2, borderRadius: 3, fontWeight: 900, boxShadow: '0 8px 20px rgba(12, 131, 31, 0.2)' }}
                    >
                        Add Product
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={4} sx={{ mb: 6 }}>
                {statCards.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card elevation={0} sx={{ p: 1, borderRadius: 6, border: '1px solid #f1f5f9', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' } }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: card.bgcolor, color: card.color, display: 'flex' }}>
                                        {card.icon}
                                    </Box>
                                    <IconButton size="small"><MoreIcon fontSize="small" /></IconButton>
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>{card.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card elevation={0} sx={{ p: 2, borderRadius: 8, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900 }}>Sales Performance</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" sx={{ fontWeight: 800, borderRadius: 2 }}>Daily</Button>
                                    <Button size="small" variant="contained" sx={{ fontWeight: 800, borderRadius: 2 }}>Weekly</Button>
                                </Stack>
                            </Stack>
                            <Box sx={{ height: 350, width: '100%', mt: 2 }}>
                                <LineChart
                                    xAxis={[{ data: [1, 2, 3, 5, 8, 10, 12, 15, 18, 20] }]}
                                    series={[
                                        {
                                            data: [2, 5.5, 2, 8.5, 1.5, 5, 1, 4, 3, 8],
                                            color: '#0C831F',
                                            area: true,
                                        },
                                    ]}
                                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={4}>
                        <Card elevation={0} sx={{ p: 4, borderRadius: 8, bgcolor: 'primary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.2 }}>Boost Your Sales with Ads!</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 4, opacity: 0.9 }}>Get your products featured on the home page and reach thousands of customers.</Typography>
                                <Button
                                    variant="contained"
                                    endIcon={<ArrowIcon />}
                                    sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 900, borderRadius: 3, px: 3, '&:hover': { bgcolor: alpha('#ffffff', 0.9) } }}
                                >
                                    Learn More
                                </Button>
                            </Box>
                            <Box sx={{ position: 'absolute', right: -20, bottom: -20, width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
                        </Card>

                        <Card elevation={0} sx={{ p: 1, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Recent Activity</Typography>
                                <Stack spacing={3}>
                                    {[...Array(3)].map((_, i) => (
                                        <Stack key={i} direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>New order received #1234{i}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>2 mins ago</Typography>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                                <Button fullWidth variant="text" sx={{ mt: 3, fontWeight: 900, textTransform: 'none' }}>View All Activity</Button>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}

