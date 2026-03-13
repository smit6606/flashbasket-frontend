'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Stack,
    Button,
    Container,
    alpha,
    CircularProgress,
    IconButton,
} from '@mui/material';
import {
    TrendingUp as SalesIcon,
    ShoppingCart as OrdersIcon,
    Payments as RevenueIcon,
    Storefront as SellersIcon,
    FileDownload as ExportIcon,
    LiveTv as LiveIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';

const AdminDashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await api.get('/admin/stats');
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress color="primary" />
            <Typography sx={{ ml: 2, fontWeight: 800 }}>Initializing Admin Intelligence...</Typography>
        </Box>
    );

    const metrics = [
        { label: 'Global Sales', value: `₹${data?.revenue?.totalSales?.toLocaleString()}`, trend: '+12.5%', icon: <SalesIcon />, color: '#0C831F' },
        { label: 'Total Orders', value: data?.revenue?.totalOrders, trend: '+5.2%', icon: <OrdersIcon />, color: '#2563eb' },
        { label: 'Market Commission', value: `₹${data?.revenue?.totalCommission?.toLocaleString()}`, trend: '+15.8%', icon: <RevenueIcon />, color: '#7c3aed' },
        { label: 'Network Sellers', value: data?.totalSellers, trend: 'Active', icon: <SellersIcon />, color: '#ea580c' },
    ];

    return (
        <Box sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                        Marketplace Intel
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', mt: 1 }}>
                        Real-time Command & Control Center
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<ExportIcon />}
                        sx={{ borderRadius: '14px', fontWeight: 800, border: '2px solid', borderColor: '#e2e8f0', color: 'text.primary', '&:hover': { border: '2px solid', borderColor: 'text.primary' } }}
                    >
                        Export Analytics
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<LiveIcon />}
                        sx={{ borderRadius: '14px', fontWeight: 900, bgcolor: '#2563eb', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)' }}
                    >
                        System Live
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={4} sx={{ mb: 6 }}>
                {metrics.map((m, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: '24px',
                                border: '1px solid #f1f5f9',
                                transition: 'all 0.3s ease-out',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.04)',
                                    borderColor: m.color,
                                }
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                                <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: alpha(m.color, 0.1), color: m.color }}>
                                    {m.icon}
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 900, px: 1.5, py: 0.5, borderRadius: '20px', bgcolor: m.trend.startsWith('+') ? '#f0fdf4' : '#f8fafc', color: m.trend.startsWith('+') ? '#166534' : 'text.secondary' }}>
                                    {m.trend}
                                </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {m.label}
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                                {m.value}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '32px', border: '1px solid #f1f5f9', height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Top Performing Sellers</Typography>
                        <Stack spacing={2}>
                            {[1, 2, 3].map(s => (
                                <Box key={s} sx={{ p: 3, borderRadius: '20px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                            S{s}
                                        </Box>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 800 }}>Premium Seller Node 00{s}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Active Status Verified</Typography>
                                        </Box>
                                    </Stack>
                                    <IconButton size="small" sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                                        <ArrowIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            borderRadius: '32px',
                            bgcolor: '#1e293b',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Launch Command</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, mb: 6, maxWidth: 350 }}>
                                Infrastructure is stable. Market modules are responding at <span style={{ color: '#4ade80' }}>⚡ flash speed</span>.
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: 'white',
                                    color: 'slate.900',
                                    fontWeight: 900,
                                    borderRadius: '16px',
                                    px: 6,
                                    py: 2,
                                    fontSize: '1.1rem',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                }}
                            >
                                Deploy Production
                            </Button>
                        </Box>
                        {/* Decorative background elements */}
                        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', filter: 'blur(40px)' }} />
                        <Box sx={{ position: 'absolute', bottom: -20, right: -20, width: 150, height: 150, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.1, filter: 'blur(30px)' }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
