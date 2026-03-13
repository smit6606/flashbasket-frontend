'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Box, 
    Stepper, 
    Step, 
    StepLabel, 
    Typography, 
    Paper, 
    alpha, 
    Divider, 
    CircularProgress, 
    Button,
    Stack,
    Card,
    Grid,
    Skeleton,
    Chip,
    Dialog
} from '@mui/material';
import { 
    CheckCircle as CheckIcon, 
    ShoppingBag as OrderIcon,
    Description as InvoiceIcon,
    LocalShipping as DeliveryIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';

import { toast } from 'react-toastify';

interface Order {
    id: number;
    orderNumber: string;
    totalAmount: string;
    status: string;
    createdAt: string;
    deliveryAddress: string;
    deliveryOtp?: string;
    Products: {
        productName: string;
        OrderItem: {
            quantity: number;
            price: string;
        };
    }[];
}

export default function OrdersPage() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const steps = [
        { label: 'Placed', status: ['pending'] },
        { label: 'Preparing', status: ['preparing'] },
        { label: 'Logistics', status: ['awaiting-assignment', 'assigned', 'accepted-by-partner', 'ready-to-ship'] },
        { label: 'Shipped', status: ['shipped'] },
        { label: 'In Transit', status: ['out-for-delivery'] },
        { label: 'Arrived', status: ['arrived'] },
        { label: 'Completed', status: ['delivered', 'completed'] }
    ];

    const getActiveStep = (status: string) => {
        if (status === 'cancelled') return -1;
        const index = steps.findIndex(s => s.status.includes(status));
        if (index !== -1) return index;
        return 0;
    };

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }

        if (user && user.role !== 'user') {
            router.push(`/${user.role}`);
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/user');
                setOrders(response.data);
            } catch (err) {
                console.error('Failed to fetch orders', err);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'user') {
            fetchOrders();
        }
    }, [token, user, router]);

    const handleCancelClick = (id: number) => {
        setSelectedOrderId(id);
        setCancelDialogOpen(true);
    };

    const confirmCancel = async () => {
        if (!selectedOrderId) return;
        setCancelling(true);
        try {
            await api.patch(`/orders/${selectedOrderId}/status`, { status: 'cancelled' });
            const response = await api.get('/orders/user');
            setOrders(response.data);
            toast.success('Order cancelled successfully');
            setCancelDialogOpen(false);
        } catch (err) {
            toast.error('Failed to cancel order');
        } finally {
            setCancelling(false);
            setSelectedOrderId(null);
        }
    };

    const getPaymentLabel = (method: string) => {
        switch (method?.toLowerCase()) {
            case 'cod': return 'Cash on Delivery';
            case 'stripe': return 'Stripe Payment';
            case 'upi': return 'UPI Payment';
            default: return method || 'Not Specified';
        }
    };

    if (loading) return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Skeleton variant="text" width={300} height={60} sx={{ mb: 1, borderRadius: 2 }} />
            <Skeleton variant="text" width={200} height={30} sx={{ mb: 6, borderRadius: 2 }} />
            <Stack spacing={4}>
                {[1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={350} sx={{ borderRadius: 8 }} />
                ))}
            </Stack>
        </Box>
    );

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 8 }}>
                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.04em', mb: 1 }}>My Purchase</Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 600 }}>Tracking your fresh deliveries in real-time</Typography>
            </Box>

            {orders.length === 0 ? (
                <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 10, bgcolor: alpha('#0C831F', 0.03), border: '2px dashed #e2e8f0' }}>
                    <OrderIcon sx={{ fontSize: 60, color: '#0C831F', mb: 3 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary', mb: 4 }}>You haven't placed any orders yet.</Typography>
                    <Button 
                        variant="contained" 
                        component={Link} 
                        href="/"
                        sx={{ bgcolor: '#0C831F', fontWeight: 900, px: 6, py: 2, borderRadius: 5 }}
                    >
                        Start Shopping
                    </Button>
                </Paper>
            ) : (
                <Stack spacing={6}>
                    {orders.map((order) => {
                        const activeStep = getActiveStep(order.status);
                        const isCancelled = order.status === 'cancelled';
                        const isCompleted = order.status === 'completed' || order.status === 'delivered';

                        return (
                            <Card key={order.id} elevation={0} sx={{ borderRadius: 8, border: '1px solid #f1f5f9', overflow: 'hidden', transition: 'all 0.3s', '&:hover': { boxShadow: '0 20px 60px rgba(0,0,0,0.04)' } }}>
                                <Box sx={{ p: 4, bgcolor: isCancelled ? '#1e293b' : '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order ID</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>#{order.orderNumber}</Typography>
                                        <Chip 
                                            icon={isCompleted ? <CheckIcon fontSize="small"/> : isCancelled ? undefined : <TimeIcon fontSize="small"/>}
                                            label={isCompleted ? "Delivered" : isCancelled ? "Cancelled" : "In Progress"} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: isCompleted ? alpha('#10b981', 0.2) : isCancelled ? alpha('#ef4444', 0.2) : alpha('#f59e0b', 0.2), 
                                                color: isCompleted ? '#34d399' : isCancelled ? '#f87171' : '#fbbf24', 
                                                fontWeight: 900, 
                                                px: 1 
                                            }} 
                                        />
                                    </Box>
                                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                        <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Amount</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{order.totalAmount}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 6 }}>
                                    {!isCancelled ? (
                                        <Box sx={{ overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
                                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2, minWidth: 600 }}>
                                                {steps.map((step, index) => (
                                                    <Step key={step.label}>
                                                        <StepLabel
                                                            StepIconProps={{
                                                                sx: { 
                                                                    fontSize: index <= activeStep ? '2rem' : '1.5rem',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    '&.Mui-active': { color: '#0C831F', filter: 'drop-shadow(0 0 8px rgba(12, 131, 31, 0.4))' },
                                                                    '&.Mui-completed': { color: '#0C831F' }
                                                                }
                                                            }}
                                                        >
                                                            <Typography variant="caption" sx={{ fontWeight: index <= activeStep ? 900 : 700, color: index <= activeStep ? 'text.primary' : 'text.disabled', display: 'block' }}>
                                                                {step.label}
                                                            </Typography>
                                                        </StepLabel>
                                                    </Step>
                                                ))}
                                            </Stepper>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', mb: 6, p: 4, bgcolor: alpha('#ef5350', 0.1), borderRadius: 4 }}>
                                            <Typography variant="h6" sx={{ color: '#ef5350', fontWeight: 900 }}>ORDER CANCELLED</Typography>
                                        </Box>
                                    )}

                                    <Divider sx={{ mb: 4 }} />

                                    <Grid container spacing={4}>
                                        <Grid size={{ xs: 12, md: 7 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, color: 'text.secondary' }}>ITEMS ORDERED</Typography>
                                            <Stack spacing={2}>
                                                {order.Products?.map((prod: any, i) => (
                                                    <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 4 }}>
                                                        {prod.productImage && (
                                                            <Box 
                                                                component="img" 
                                                                src={prod.productImage} 
                                                                sx={{ width: 50, height: 50, borderRadius: 2, objectFit: 'cover' }} 
                                                            />
                                                        )}
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{prod.productName}</Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                                Seller: {prod.sellerName || 'FlashBasket Seller'} | x{prod.OrderItem.quantity}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 900 }}>₹{prod.OrderItem.price}</Typography>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 5 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, color: 'text.secondary' }}>ORDER INFO</Typography>
                                            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f1f5f9', borderRadius: 4 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 900, display: 'block', mb: 1 }}>PAYMENT METHOD</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                                                    {getPaymentLabel((order as any).paymentMethod)}
                                                </Typography>

                                                <Typography variant="caption" sx={{ fontWeight: 900, display: 'block', mb: 1 }}>ORDER DATE</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</Typography>

                                                <Typography variant="caption" sx={{ fontWeight: 900, display: 'block', mb: 1 }}>ADDRESS</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.6, mb: 2 }}>
                                                    {typeof order.deliveryAddress === 'string' 
                                                        ? order.deliveryAddress 
                                                        : (order.deliveryAddress as any)?.address || JSON.stringify(order.deliveryAddress)}
                                                </Typography>
                                                
                                                {order.status === 'arrived' && order.deliveryOtp && (
                                                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, textAlign: 'center', border: '1px solid #e2e8f0', mt: 2 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>DELIVERY OTP</Typography>
                                                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0C831F', letterSpacing: '0.2em' }}>{order.deliveryOtp}</Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>Share this code with the driver</Typography>
                                                    </Box>
                                                )}
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Button 
                                            variant="outlined" 
                                            startIcon={<InvoiceIcon />} 
                                            disabled={!isCompleted}
                                            component={Link}
                                            href={`/orders/invoice/${order.id}`}
                                            sx={{ 
                                                borderRadius: 3, 
                                                fontWeight: 900, 
                                                border: 2, 
                                                px: 3, 
                                                textDecoration: 'none',
                                                '&:hover': { border: 2 },
                                                '&.Mui-disabled': { border: '2px solid rgba(0,0,0,0.1)' }
                                            }}
                                        >
                                            Invoice
                                        </Button>
                                        
                                        {!isCompleted && !isCancelled && (order.status === 'pending' || order.status === 'preparing') && (
                                            <Button 
                                                variant="text" 
                                                color="error" 
                                                onClick={() => handleCancelClick(order.id)}
                                                sx={{ fontWeight: 900 }}
                                            >
                                                Cancel Order
                                            </Button>
                                        )}
                                        {isCompleted && (
                                            <Typography variant="caption" sx={{ color: '#0C831F', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CheckIcon fontSize="small" /> ✔ Delivered Successfully | Order Completed
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Card>
                        );
                    })}
                </Stack>
            )}

            {/* Confirmation Dialog */}
            <Dialog 
                open={cancelDialogOpen} 
                onClose={() => !cancelling && setCancelDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 4, p: 2, maxWidth: 400 } }}
            >
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, px: 2, pt: 2 }}>Confirm Cancellation</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, px: 2, mb: 4 }}>
                    Are you sure you want to cancel this order? This action cannot be undone.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, px: 2, pb: 2 }}>
                    <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => setCancelDialogOpen(false)}
                        disabled={cancelling}
                        sx={{ borderRadius: 3, fontWeight: 900, py: 1.5 }}
                    >
                        Keep Order
                    </Button>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        color="error" 
                        onClick={confirmCancel}
                        disabled={cancelling}
                        sx={{ borderRadius: 3, fontWeight: 900, py: 1.5 }}
                    >
                        {cancelling ? <CircularProgress size={24} color="inherit" /> : 'Confirm Cancel'}
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
}
