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
    CircularProgress,
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
    'Accepted-By-Partner': { label: 'Waiting for Pickup', color: '#8b5cf6', bgcolor: alpha('#8b5cf6', 0.1) },
    'Shipped': { label: 'Shipped', color: '#2196f3', bgcolor: alpha('#2196f3', 0.1) },
    'Out-for-Delivery': { label: 'Out for Delivery', color: '#ff9800', bgcolor: alpha('#ff9800', 0.1) },
    'Arrived': { label: 'Arrived at Customer', color: '#9c27b0', bgcolor: alpha('#9c27b0', 0.1) },
};

const ACTIVE_STATUSES = ['Assigned', 'Accepted-By-Partner', 'Shipped', 'Out-for-Delivery', 'Arrived'];

export default function ActiveDeliveriesPage() {
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
            // Active trips: status in active list
            const active = (response.data || []).filter(
                (o: any) => ACTIVE_STATUSES.includes(o.status)
            );
            setTrips(active);
        } catch (err: any) {
            toast.error('Failed to load active deliveries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

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
            if (status === 'Delivered') {
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
        if (activeOrderId) updateStatus(activeOrderId, 'Delivered', { otp: enteredOtp });
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

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress color="primary" /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b' }}>Active Deliveries</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>
                    Monitor and fulfill your current delivery commitments.
                </Typography>
            </Box>

            {trips.length === 0 ? (
                <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 8, bgcolor: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                    <AlertIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.2, mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary' }}>No Active Deliveries</Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600, mt: 1 }}>
                        Check for available orders in the Marketplace to start working.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    {trips.map((order) => {
                        const statusInfo = STATUS_FLOW[order.status] || { label: order.status, color: '#64748b', bgcolor: '#f1f5f9' };
                        return (
                            <Grid size={{ xs: 12 }} key={order.id}>
                                <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { boxShadow: '0 10px 40px rgba(0,0,0,0.06)' } }}>
                                    <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Mission</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 900 }}>#{order.orderNumber}</Typography>
                                        </Box>
                                        <Chip 
                                            label={statusInfo.label.toUpperCase()} 
                                            sx={{ fontWeight: 900, bgcolor: statusInfo.bgcolor, color: statusInfo.color, borderRadius: 2 }} 
                                        />
                                    </Box>

                                    <CardContent sx={{ p: 4 }}>
                                        <Grid container spacing={4}>
                                            <Grid size={{ xs: 12, md: 5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#0C831F' }}>📦 PICKUP FROM</Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, mt: 1 }}>{order.Seller?.shop_name || 'Partner Store'}</Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{order.Seller?.address}</Typography>
                                                <Button 
                                                    size="small" 
                                                    startIcon={<PhoneIcon />} 
                                                    href={`tel:${order.Seller?.phone}`}
                                                    sx={{ mt: 1, fontWeight: 800, color: '#0C831F', bgcolor: alpha('#0C831F', 0.05), borderRadius: 2 }}
                                                >
                                                    {formatPhoneForDisplay(order.Seller?.phone)}
                                                </Button>
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <OutIcon sx={{ color: 'text.disabled', fontSize: 30, opacity: 0.3 }} />
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#2196f3' }}>📍 DROP-OFF AT</Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, mt: 1 }}>{order.User?.user_name || 'Customer'}</Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    {typeof order.deliveryAddress === 'string' ? order.deliveryAddress : order.deliveryAddress?.address}
                                                </Typography>
                                                <Button 
                                                    size="small" 
                                                    startIcon={<PhoneIcon />} 
                                                    href={`tel:${order.User?.phone}`}
                                                    sx={{ mt: 1, fontWeight: 800, color: '#2196f3', bgcolor: alpha('#2196f3', 0.05), borderRadius: 2 }}
                                                >
                                                    {formatPhoneForDisplay(order.User?.phone)}
                                                </Button>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 4 }} />

                                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                                            {order.status === 'Accepted-By-Partner' && (
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.disabled', alignSelf: 'center' }}>
                                                    Waiting for Seller to hand over the package...
                                                </Typography>
                                            )}
                                            {order.status === 'Shipped' && (
                                                <LoadingButton
                                                    variant="contained"
                                                    onClick={() => updateStatus(order.id, 'Out-for-Delivery')}
                                                    loading={actionLoading[order.id]}
                                                    sx={{ borderRadius: 3, fontWeight: 900, bgcolor: '#ff9800' }}
                                                >
                                                    Start Transit
                                                </LoadingButton>
                                            )}
                                            {order.status === 'Out-for-Delivery' && (
                                                <LoadingButton
                                                    variant="contained"
                                                    onClick={() => updateStatus(order.id, 'Arrived')}
                                                    loading={actionLoading[order.id]}
                                                    sx={{ borderRadius: 3, fontWeight: 900, bgcolor: '#1e293b' }}
                                                >
                                                    Mark as Arrived
                                                </LoadingButton>
                                            )}
                                            {order.status === 'Arrived' && (
                                                <LoadingButton
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => handleDeliverClick(order.id)}
                                                    loading={actionLoading[order.id]}
                                                    sx={{ borderRadius: 3, fontWeight: 900, bgcolor: '#0C831F' }}
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

            <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)} PaperProps={{ sx: { borderRadius: 6, p: 2, maxWidth: 420, width: '100%' } }}>
                <DialogTitle sx={{ fontWeight: 900, textAlign: 'center' }}>OTP Verification</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, fontWeight: 600, color: 'text.secondary' }}>
                        Enter the 6-digit code provided by the customer.
                    </Typography>
                    <TextField
                        fullWidth
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        inputProps={{ maxLength: 6, style: { fontSize: '2.5rem', textAlign: 'center', fontWeight: 900, letterSpacing: '0.4em' } }}
                        placeholder="000000"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                    />
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button startIcon={<ResendIcon />} disabled={resending} onClick={handleResendOtp} sx={{ fontWeight: 700 }}>
                            {resending ? 'Sending...' : 'Resend OTP'}
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOtpDialogOpen(false)} sx={{ fontWeight: 800, color: 'text.secondary' }}>Cancel</Button>
                    <LoadingButton
                        onClick={handleVerifyOtp}
                        variant="contained"
                        loading={actionLoading[activeOrderId || 0]}
                        sx={{ borderRadius: 3, fontWeight: 900, bgcolor: '#0C831F', px: 4 }}
                    >
                        Confirm Delivery
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
