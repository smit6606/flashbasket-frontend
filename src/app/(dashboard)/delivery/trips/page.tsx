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
    LinearProgress,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    NotificationsActiveOutlined as AlertIcon,
    Phone as PhoneIcon,
    DoneAll as DeliveredIcon,
    CallMade as OutIcon,
    VpnKey as KeyIcon,
    MyLocationOutlined as LocationIcon,
    Refresh as ResendIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import LoadingButton from '@/components/mui/LoadingButton';
import { formatPhoneForDisplay } from '@/lib/phoneUtils';

const STATUS_FLOW: Record<string, { label: string; color: string; bgcolor: string }> = {
    'accepted-by-partner': { label: 'Waiting to Ship', color: '#0C831F', bgcolor: alpha('#0C831F', 0.1) },
    'shipped': { label: 'Shipped', color: '#2196f3', bgcolor: alpha('#2196f3', 0.1) },
    'out-for-delivery': { label: 'Out for Delivery', color: '#ff9800', bgcolor: alpha('#ff9800', 0.1) },
    'arrived': { label: 'Arrived at Customer', color: '#9c27b0', bgcolor: alpha('#9c27b0', 0.1) },
};

export default function ActiveTripsPage() {
    const socket = useSocket();
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
    const [enteredOtp, setEnteredOtp] = useState('');
    const [resending, setResending] = useState(false);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/partner');
            // Active trips: accepted but NOT yet completed/cancelled
            const active = (response.data || []).filter(
                (o: any) => !['completed', 'delivered', 'cancelled'].includes(o.status)
            );
            setTrips(active);
        } catch (err: any) {
            toast.error('Failed to load active trips');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    // Real-time: refresh when order status changes
    useEffect(() => {
        if (!socket) return;
        socket.on('order_update', fetchTrips);
        return () => { socket.off('order_update', fetchTrips); };
    }, [socket]);

    const updateStatus = async (id: number, status: string, additionalData: any = {}) => {
        try {
            setActionLoading(prev => ({ ...prev, [id]: true }));
            await api.patch(`/orders/${id}/status`, { status, ...additionalData });
            toast.success(`Order is now: ${status.replace(/-/g, ' ')}`);
            fetchTrips();
            if (status === 'delivered') {
                setOtpDialogOpen(false);
                setEnteredOtp('');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Update failed');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleDeliverClick = (orderId: number) => {
        setActiveOrderId(orderId);
        setOtpDialogOpen(true);
    };

    const handleVerifyOtp = () => {
        if (!enteredOtp || enteredOtp.length !== 6) {
            toast.error('Please enter the 6-digit delivery OTP');
            return;
        }
        if (activeOrderId) updateStatus(activeOrderId, 'delivered', { otp: enteredOtp });
    };

    const handleResendOtp = async () => {
        if (!activeOrderId) return;
        try {
            setResending(true);
            await api.post(`/orders/${activeOrderId}/resend-otp`, {});
            toast.info('New OTP sent to customer');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    if (loading) return <Box sx={{ p: 4 }}><LinearProgress color="success" sx={{ borderRadius: 4 }} /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>
                    Active Trips
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mt: 0.5 }}>
                    Orders you have accepted — manage and complete your deliveries
                </Typography>
            </Box>

            {trips.length === 0 ? (
                <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 8, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                    <AlertIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>No active trips right now</Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600, mt: 1 }}>
                        Head to the Dashboard to accept available orders
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    {trips.map((order) => {
                        const statusInfo = STATUS_FLOW[order.status] || { label: order.status, color: '#64748b', bgcolor: '#f1f5f9' };
                        return (
                            <Grid size={{ xs: 12 }} key={order.id}>
                                <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.2s', '&:hover': { boxShadow: '0 10px 40px rgba(0,0,0,0.06)' } }}>
                                    {/* Card Header */}
                                    <Box sx={{ p: 3, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderBottom: '1px solid #f1f5f9' }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>TRIP IN PROGRESS</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>#{order.orderNumber}</Typography>
                                        </Box>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Chip
                                                label={statusInfo.label}
                                                size="small"
                                                sx={{ fontWeight: 900, bgcolor: statusInfo.bgcolor, color: statusInfo.color, border: 'none', borderRadius: 2 }}
                                            />
                                        </Stack>
                                    </Box>

                                    <CardContent sx={{ p: 4 }}>
                                        <Grid container spacing={4}>
                                            {/* Pickup Info */}
                                            <Grid size={{ xs: 12, md: 5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#0C831F', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
                                                    📦 PICKUP: SELLER STORE
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 900, mb: 0.5 }}>{order.Seller?.shop_name || 'N/A'}</Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>{order.Seller?.address}</Typography>
                                                <Button size="small" startIcon={<PhoneIcon />} href={`tel:${order.Seller?.phone}`}
                                                    sx={{ fontWeight: 800, color: '#0C831F', bgcolor: alpha('#0C831F', 0.06), borderRadius: 3, px: 2, textDecoration: 'none', fontSize: '0.8rem' }}>
                                                    {formatPhoneForDisplay(order.Seller?.phone)}
                                                </Button>
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Box sx={{ width: 2, height: 40, bgcolor: '#e2e8f0', mx: 'auto', mb: 1 }} />
                                                    <OutIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                                    <Box sx={{ width: 2, height: 40, bgcolor: '#e2e8f0', mx: 'auto', mt: 1 }} />
                                                </Box>
                                            </Grid>

                                            {/* Drop-off Info */}
                                            <Grid size={{ xs: 12, md: 5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#2196f3', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
                                                    📍 DROP-OFF: CUSTOMER
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 900, mb: 0.5 }}>{order.User?.user_name || 'Customer'}</Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                                                    {typeof order.deliveryAddress === 'string'
                                                        ? order.deliveryAddress
                                                        : order.deliveryAddress?.address || JSON.stringify(order.deliveryAddress)}
                                                </Typography>
                                                <Button size="small" startIcon={<PhoneIcon />} href={`tel:${order.User?.phone}`}
                                                    sx={{ fontWeight: 800, color: '#2196f3', bgcolor: alpha('#2196f3', 0.06), borderRadius: 3, px: 2, textDecoration: 'none', fontSize: '0.8rem' }}>
                                                    {formatPhoneForDisplay(order.User?.phone)}
                                                </Button>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 3 }} />

                                        {/* Action Buttons */}
                                        <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
                                            {order.status === 'accepted-by-partner' && (
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0C831F', alignSelf: 'center' }}>
                                                    ✓ Accepted — waiting for seller to ship
                                                </Typography>
                                            )}
                                            {order.status === 'shipped' && (
                                                <LoadingButton
                                                    variant="contained"
                                                    startIcon={<OutIcon />}
                                                    onClick={() => updateStatus(order.id, 'out-for-delivery')}
                                                    loading={actionLoading[order.id]}
                                                    loadingText="Starting..."
                                                    sx={{ fontWeight: 900, borderRadius: 3, bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
                                                >
                                                    Start Transit
                                                </LoadingButton>
                                            )}
                                            {order.status === 'out-for-delivery' && (
                                                <LoadingButton
                                                    variant="contained"
                                                    startIcon={<LocationIcon />}
                                                    onClick={() => updateStatus(order.id, 'arrived')}
                                                    loading={actionLoading[order.id]}
                                                    loadingText="Arriving..."
                                                    sx={{ fontWeight: 900, borderRadius: 3, bgcolor: '#1e293b' }}
                                                >
                                                    Arrived at Customer
                                                </LoadingButton>
                                            )}
                                            {order.status === 'arrived' && (
                                                <LoadingButton
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<DeliveredIcon />}
                                                    onClick={() => handleDeliverClick(order.id)}
                                                    loading={actionLoading[order.id]}
                                                    sx={{ fontWeight: 900, borderRadius: 3, bgcolor: '#0C831F', px: 4 }}
                                                >
                                                    Verify OTP & Complete
                                                </LoadingButton>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* OTP Verification Dialog */}
            <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)} PaperProps={{ sx: { borderRadius: 6, p: 2, maxWidth: 420, width: '100%' } }}>
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <KeyIcon color="primary" /> OTP Verification
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, fontWeight: 600, color: 'text.secondary' }}>
                        Ask the customer for the 6-digit OTP sent to their registered email.
                    </Typography>
                    <TextField
                        fullWidth
                        label="6-Digit OTP"
                        variant="outlined"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        inputProps={{ maxLength: 6, style: { fontSize: '2rem', textAlign: 'center', fontWeight: 800, letterSpacing: '0.5em' } }}
                        autoFocus
                        placeholder="000000"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button startIcon={<ResendIcon />} disabled={resending} onClick={handleResendOtp} sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                            {resending ? 'Sending...' : 'Resend OTP to Customer'}
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOtpDialogOpen(false)} sx={{ fontWeight: 900, color: 'text.secondary', borderRadius: 3 }}>Cancel</Button>
                    <LoadingButton
                        onClick={handleVerifyOtp}
                        variant="contained"
                        loading={actionLoading[activeOrderId || 0]}
                        loadingText="Verifying..."
                        sx={{ borderRadius: 3, px: 4, fontWeight: 900, bgcolor: '#0C831F' }}
                    >
                        Verify & Complete Delivery
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
