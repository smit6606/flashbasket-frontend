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
  Skeleton,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  PeopleAlt as UsersIcon,
  Storefront as SellersIcon,
  ShoppingBag as OrdersIcon,
  MonetizationOn as SalesIcon,
  ArrowForward as ArrowIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  MonitorHeart as HealthIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, user, router]);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <UsersIcon />, color: '#2196f3', bgcolor: alpha('#2196f3', 0.1) },
    { label: 'Total Sellers', value: stats?.totalSellers || 0, icon: <SellersIcon />, color: '#ff9800', bgcolor: alpha('#ff9800', 0.1) },
    { label: 'Total Orders', value: stats?.revenue?.totalOrders || 0, icon: <OrdersIcon />, color: '#9c27b0', bgcolor: alpha('#9c27b0', 0.1) },
    { label: 'Gross Sales', value: `₹${(stats?.revenue?.totalSales || 0).toLocaleString()}`, icon: <SalesIcon />, color: '#0C831F', bgcolor: alpha('#0C831F', 0.1) },
  ];

  if (loading) return (
    <Box sx={{ p: 4 }}>
      <Skeleton width={400} height={80} sx={{ mb: 6 }} />
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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Global Dashboard</Typography>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
            Monitoring FlashBasket ecosystem performance
          </Typography>
        </Box>
        <Chip
          label="ADMIN ACCOUNT"
          sx={{ fontWeight: 900, bgcolor: alpha('#0C831F', 0.1), color: '#0C831F', borderRadius: 2 }}
        />
      </Stack>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {statCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: card.bgcolor, color: card.color, display: 'inline-flex', mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={0} sx={{ p: 6, borderRadius: 10, bgcolor: '#1e293b', color: 'white', mb: 6, position: 'relative', overflow: 'hidden' }}>
        <Grid container alignItems="center" spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Platform Revenue (10% Commission)</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, mt: 1, mb: 1 }}>₹{(stats?.revenue?.totalCommission || 0).toLocaleString()}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>Platform Health: Stable & Scaling</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'right' }}>
            <SalesIcon sx={{ fontSize: 120, opacity: 0.05, position: 'absolute', right: -20, bottom: -20 }} />
            <Button variant="contained" sx={{ px: 4, py: 1.5, borderRadius: 4, fontWeight: 900 }}>Financial Audit</Button>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card elevation={0} sx={{ p: 1, borderRadius: 8, border: '1px solid #f1f5f9' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Quick Actions</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Updated Real-time</Typography>
              </Stack>
              <Stack spacing={2}>
                {['Manage All Sellers', 'View Payment History', 'System Logs', 'Bulk Notify Users'].map((label) => (
                  <Button
                    key={label}
                    fullWidth
                    variant="outlined"
                    endIcon={<ArrowIcon />}
                    sx={{
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      px: 3,
                      py: 2,
                      borderRadius: 4,
                      fontWeight: 800,
                      color: 'text.primary',
                      borderColor: '#f1f5f9',
                      '&:hover': { bgcolor: '#0f172a', color: 'white', borderColor: '#0f172a' }
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card elevation={0} sx={{ p: 4, borderRadius: 8, bgcolor: 'primary.main', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <HealthIcon />
              <Typography variant="h5" sx={{ fontWeight: 900 }}>Marketplace Integrity</Typography>
            </Stack>
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 4, opacity: 0.8 }}>Ecosystem status is optimal. All safety protocols and vendor verifications are active across 12 zones.</Typography>

            <Box sx={{ mt: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: '0.1em' }}>Server Uptime (24h)</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mb: 3 }}>
                {[...Array(20)].map((_, i) => (
                  <Box key={i} sx={{ flexGrow: 1, height: 40, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
                ))}
              </Stack>
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 900, borderRadius: 4, py: 2, '&:hover': { bgcolor: alpha('#ffffff', 0.9) } }}
              >
                View Infrastructure
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
