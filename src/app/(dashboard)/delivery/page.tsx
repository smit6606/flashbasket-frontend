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
    Switch,
    Divider,
    LinearProgress,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    LocalShippingOutlined as DeliveryIcon,
    AccountBalanceWalletOutlined as EarningsIcon,
    TwoWheelerOutlined as MotoIcon,
    ListAltOutlined as TaskIcon,
    MyLocationOutlined as LocationIcon,
    NotificationsActiveOutlined as AlertIcon,
    Phone as PhoneIcon,
    DoneAll as DeliveredIcon,
    CallMade as OutIcon,
    VpnKey as KeyIcon,
    CheckCircleOutline as AcceptIcon,
    Refresh as ResendIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function DeliveryDashboard() {
    const [isOnDuty, setIsOnDuty] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
    const [enteredOtp, setEnteredOtp] = useState('');
    const [resending, setResending] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/partner');
            setOrders(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch partner orders', err);
            const msg = err.response?.data?.message || err.message || 'Failed to load orders';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: number, status: string, additionalData: any = {}) => {
        try {
            const response = await api.patch(`/orders/${id}/status`, { status, ...additionalData });
            toast.success(`Success: Order is now ${status.replace(/-/g, ' ')}`);
            fetchData();
            if (status === 'delivered') {
                setOtpDialogOpen(false);
                setEnteredOtp('');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Update failed';
            toast.error(msg);
        }
    };

    const handleArrivedClick = (orderId: number) => {
        updateStatus(orderId, 'arrived');
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
        if (activeOrderId) {
            updateStatus(activeOrderId, 'delivered', { otp: enteredOtp });
        }
    };

    const handleResendOtp = async () => {
        if (!activeOrderId) return;
        try {
            setResending(true);
            await api.post(`/orders/${activeOrderId}/resend-otp`, {});
            toast.info('New 6-digit OTP sent to customer');
        } catch (err: any) {
             toast.error(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    const stats = [
        { label: 'Active Deliveries', value: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length.toString(), icon: <TaskIcon />, color: '#2196f3', bgcolor: alpha('#2196f3', 0.1) },
        { label: "Today's Fare", value: '₹' + (orders.filter(o => o.status === 'completed').length * 40).toString(), icon: <EarningsIcon />, color: '#0C831F', bgcolor: alpha('#0C831F', 0.1) },
        { label: "Performance", value: '4.95', icon: <MotoIcon />, color: '#ff9800', bgcolor: alpha('#ff9800', 0.1) },
    ];

    if (loading) return <Box sx={{ p: 4 }}><LinearProgress /></Box>;

    return (
        <Box sx={{ p: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Driver Hub</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                        Flash Fleet Monitoring & Trips
                    </Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 1, px: 3, borderRadius: 10, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: isOnDuty ? '#0C831F' : 'text.disabled' }}>
                        {isOnDuty ? 'On-Duty' : 'Off-Duty'}
                    </Typography>
                    <Switch checked={isOnDuty} onChange={() => setIsOnDuty(!isOnDuty)} color="success" />
                </Paper>
            </Stack>

            <Grid container spacing={4} sx={{ mb: 6 }}>
                {stats.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid #f1f5f9' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ p: 2, borderRadius: 5, bgcolor: card.bgcolor, color: card.color, display: 'inline-flex', mb: 3 }}>
                                    {card.icon}
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>{card.label}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>{card.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4 }}>New Delivery Requests</Typography>
            
            <Grid container spacing={4}>
                {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 8, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                            <AlertIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>No active requests at the moment</Typography>
                        </Paper>
                    </Grid>
                ) : orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map((order) => (
                    <Grid size={{ xs: 12 }} key={order.id}>
                        <Card elevation={0} sx={{ borderRadius: 8, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                            <Box sx={{ p: 3, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                   <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>ORDER NUMBER</Typography>
                                   <Typography variant="h6" sx={{ fontWeight: 900 }}>{order.orderNumber}</Typography>
                                </Box>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {order.status === 'assigned' && (
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            startIcon={<AcceptIcon />}
                                            onClick={() => updateStatus(order.id, 'accepted-by-partner')}
                                            sx={{ fontWeight: 900, borderRadius: 4, bgcolor: '#0C831F' }}
                                        >
                                            Accept Request
                                        </Button>
                                    )}
                                    {order.status === 'shipped' && (
                                        <Button 
                                            variant="contained" 
                                            color="warning" 
                                            startIcon={<OutIcon />}
                                            onClick={() => updateStatus(order.id, 'out-for-delivery')}
                                            sx={{ fontWeight: 900, borderRadius: 4 }}
                                        >
                                            In Transit
                                        </Button>
                                    )}
                                    {order.status === 'out-for-delivery' && (
                                        <Button 
                                            variant="contained" 
                                            color="secondary" 
                                            startIcon={<LocationIcon />}
                                            onClick={() => handleArrivedClick(order.id)}
                                            sx={{ fontWeight: 900, borderRadius: 4, bgcolor: '#1e293b' }}
                                        >
                                            Arrived At Location
                                        </Button>
                                    )}
                                    {order.status === 'arrived' && (
                                        <Button 
                                            variant="contained" 
                                            color="success" 
                                            startIcon={<DeliveredIcon />}
                                            onClick={() => handleDeliverClick(order.id)}
                                            sx={{ fontWeight: 900, borderRadius: 4 }}
                                        >
                                            Verify & Deliver
                                        </Button>
                                    )}
                                    <Chip 
                                        label={order.status.replace(/-/g, ' ').toUpperCase()} 
                                        sx={{ fontWeight: 900, bgcolor: 'white', border: '1px solid #e2e8f0' }} 
                                    />
                                </Stack>
                            </Box>
                            <CardContent sx={{ p: 4 }}>
                                <Grid container spacing={4}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, display: 'block' }}>STORE (PICKUP)</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 900 }}>{order.Seller?.shop_name || 'N/A'}</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{order.Seller?.address}</Typography>
                                        <Button size="small" startIcon={<PhoneIcon />} sx={{ mt: 1, fontWeight: 800 }}>{order.Seller?.phone}</Button>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'secondary.main', mb: 1, display: 'block' }}>CUSTOMER (DROP)</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 900 }}>{order.User?.user_name || 'Customer'}</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{order.deliveryAddress}</Typography>
                                        <Button size="small" startIcon={<PhoneIcon />} sx={{ mt: 1, fontWeight: 800 }}>{order.User?.phone}</Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* OTP VERIFICATION DIALOG */}
            <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)} PaperProps={{ sx: { borderRadius: 6, p: 2 } }}>
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <KeyIcon color="primary" /> OTP Verification
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, fontWeight: 600, color: 'text.secondary' }}>
                        Enter the 6-digit verification code sent to the customer's registered email.
                    </Typography>
                    <TextField
                        fullWidth
                        label="6-Digit OTP"
                        variant="outlined"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        inputProps={{ maxLength: 6, style: { fontSize: '2rem', textAlign: 'center', fontWeight: 800, letterSpacing: '0.5em' } }}
                        autoFocus
                        placeholder="000000"
                    />
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                         <Button 
                            startIcon={<ResendIcon />} 
                            disabled={resending}
                            onClick={handleResendOtp}
                            sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                         >
                            {resending ? 'Sending...' : 'Resend OTP to Customer'}
                         </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOtpDialogOpen(false)} sx={{ fontWeight: 900, color: 'text.secondary' }}>Cancel</Button>
                    <Button 
                        onClick={handleVerifyOtp} 
                        variant="contained" 
                        sx={{ borderRadius: 3, px: 4, fontWeight: 900 }}
                    >
                        Verify & Complete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
