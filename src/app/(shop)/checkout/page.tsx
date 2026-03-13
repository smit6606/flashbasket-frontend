'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Typography,
    Grid,
    TextField,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Divider,
    Stack,
    Avatar,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    alpha,
    CircularProgress,
} from '@mui/material';
import {
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    CheckCircle as ReviewIcon,
    DeleteOutline as RemoveIcon,
    ChevronLeft as BackIcon,
    ShoppingBag as BagIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StripePayment from '@/components/StripePayment';
import UpiQrPayment from '@/components/UpiQrPayment';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-toastify';
import { QrCode as QrIcon } from '@mui/icons-material';

interface CartItem {
    id: number;
    quantity: number;
    itemTotal: string;
    Product: {
        productName: string;
        images?: string[];
    };
    Seller: {
        shop_name: string;
    };
}

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

export default function CheckoutPage() {
    const { token, loading: authLoading } = useAuth();
    const { refreshCart } = useCart();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [cart, setCart] = useState<{ items: CartItem[]; subtotal: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [showUpiQR, setShowUpiQR] = useState(false);
    const [upiDetails, setUpiDetails] = useState<{ amount: number; groupId: string } | null>(null);

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
    });

    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod' | 'upi'>('cod');
    const deliveryFee = 25;

    useEffect(() => {
        if (authLoading) return;

        if (!token) {
            router.push('/login');
            return;
        }

        const fetchCart = async () => {
            try {
                const response = await api.get('/cart');
                setCart(response.data);
            } catch (err) {
                console.error('Failed to fetch cart', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [token, router]);

    const calculateTotal = () => {
        if (!cart) return 0;
        return parseFloat(cart.subtotal) + deliveryFee;
    };

    const handleNext = () => {
        if (activeStep === 0) {
            if (!address.street || !address.city || !address.state || !address.zip) {
                toast.error('Please fill all address fields');
                return;
            }
        }
        setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handlePlaceOrder = async () => {
        setPlacingOrder(true);
        try {
            const fullAddress = `${address.street}, ${address.city}, ${address.state} - ${address.zip}`;
            const response = await api.post('/orders/create', {
                deliveryAddress: fullAddress,
                paymentMethod,
                totalAmount: calculateTotal(),
                latitude: 21.1702,
                longitude: 72.8311
            });

            if (paymentMethod === 'stripe' && response.data?.clientSecret) {
                setClientSecret(response.data.clientSecret);
                return;
            }

            if (paymentMethod === 'upi' && response.data?.groupId) {
                setUpiDetails({ amount: calculateTotal(), groupId: response.data.groupId });
                setShowUpiQR(true);
                return;
            }

            toast.success('Order Confirmed');
            await refreshCart();
            router.push('/order-success');
        } catch (err: any) {
            toast.error(err.message || 'Failed to place order.');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress />
        </Box>
    );

    if (!cart || cart.items.length === 0) {
        router.push('/cart');
        return null;
    }

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Shipping Address & Location</Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Paper elevation={0} sx={{ height: 300, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #f1f5f9', position: 'relative' }}>
                                {/* Use Google Maps API here */}
                                <Box sx={{ width: '100%', height: '100%', bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Stack alignItems="center" spacing={1} sx={{ opacity: 0.5 }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', mb: 1 }}>
                                            <span style={{ fontSize: 24 }}>📍</span>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>Loading Google Maps...</Typography>
                                    </Stack>
                                </Box>
                                {/* Nearby drivers overlay */}
                                <Box sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: 'white', px: 2, py: 1, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#0C831F' }}>🟢 4 Drivers Nearby</Typography>
                                </Box>
                            </Paper>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1, display: 'block' }}>
                                Drag pin to exact location or use "Locate Me".
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                required
                                fullWidth
                                label="Street Address"
                                value={address.street}
                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                placeholder="123 Shopping Lane, Near Main Tower"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                required
                                fullWidth
                                label="City"
                                value={address.city}
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                                required
                                fullWidth
                                label="State"
                                value={address.state}
                                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                                required
                                fullWidth
                                label="ZIP Code"
                                value={address.zip}
                                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Payment Method</Typography>
                        <FormControl component="fieldset">
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'cod')}
                            >
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 3,
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                borderColor: paymentMethod === 'stripe' ? 'primary.main' : 'divider',
                                                bgcolor: paymentMethod === 'stripe' ? alpha('#0C831F', 0.05) : 'transparent',
                                            }}
                                            onClick={() => setPaymentMethod('stripe')}
                                        >
                                            <FormControlLabel
                                                value="stripe"
                                                control={<Radio />}
                                                label={
                                                    <Box sx={{ ml: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Stripe Card</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Secure credit/debit card payment</Typography>
                                                    </Box>
                                                }
                                                sx={{ m: 0 }}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 3,
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                borderColor: paymentMethod === 'upi' ? 'primary.main' : 'divider',
                                                bgcolor: paymentMethod === 'upi' ? alpha('#0C831F', 0.05) : 'transparent',
                                            }}
                                            onClick={() => setPaymentMethod('upi')}
                                        >
                                            <FormControlLabel
                                                value="upi"
                                                control={<Radio />}
                                                label={
                                                    <Box sx={{ ml: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>UPI Payment (QR Code)</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Scan and pay instantly from any UPI app</Typography>
                                                    </Box>
                                                }
                                                sx={{ m: 0 }}
                                            />
                                        </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 3,
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                borderColor: paymentMethod === 'cod' ? 'primary.main' : 'divider',
                                                bgcolor: paymentMethod === 'cod' ? alpha('#0C831F', 0.05) : 'transparent',
                                            }}
                                            onClick={() => setPaymentMethod('cod')}
                                        >
                                            <FormControlLabel
                                                value="cod"
                                                control={<Radio />}
                                                label={
                                                    <Box sx={{ ml: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Cash on Delivery</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Pay in cash upon delivery</Typography>
                                                    </Box>
                                                }
                                                sx={{ m: 0 }}
                                            />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </RadioGroup>
                        </FormControl>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Review Order</Typography>
                        <Paper variant="outlined" sx={{ p: 4, borderRadius: 1.5, bgcolor: '#f8fafc', mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1 }}>Shipping To</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{address.street}, {address.city}, {address.state} - {address.zip}</Typography>
                            <Button size="small" sx={{ mt: 1 }} onClick={() => setActiveStep(0)}>Change Address</Button>
                        </Paper>
                        <Paper variant="outlined" sx={{ p: 4, borderRadius: 1.5, bgcolor: '#f8fafc' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1 }}>Payment Method</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                {paymentMethod === 'stripe' ? 'Stripe Secure Payment' : paymentMethod === 'upi' ? 'UPI Payment (QR Scan)' : 'Cash on Delivery'}
                            </Typography>
                            <Button size="small" sx={{ mt: 1 }} onClick={() => setActiveStep(1)}>Change Method</Button>
                        </Paper>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 6, textAlign: 'center' }}>
                Checkout Center
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 8, display: { xs: 'none', sm: 'flex' } }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel
                            StepIconProps={{ sx: { fontSize: '1.25rem' } }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '0.7rem', md: '0.9rem' } }}>{label}</Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Mobile simplified step display */}
            <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 4, textAlign: 'center' }}>
                <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
                </Typography>
            </Box>

            <Grid container spacing={6}>
                {/* Left: Content */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
                        {renderStepContent(activeStep)}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
                            <Button
                                disabled={activeStep === 0 || !!clientSecret || showUpiQR}
                                onClick={handleBack}
                                startIcon={<BackIcon />}
                                sx={{ ml: 1, fontWeight: 800, minWidth: { xs: 'auto', md: 100 } }}
                            >
                                {activeStep === 0 ? '' : 'Back'}
                            </Button>
                            <Box>
                                {activeStep === steps.length - 1 ? (
                                    clientSecret ? (
                                        <StripePayment clientSecret={clientSecret} />
                                    ) : showUpiQR && upiDetails ? (
                                        <UpiQrPayment amount={upiDetails.amount} groupId={upiDetails.groupId} />
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={handlePlaceOrder}
                                            disabled={placingOrder}
                                            sx={{
                                                px: 5, py: 1.5,
                                                fontWeight: 900,
                                                borderRadius: 1,
                                                boxShadow: '0 8px 24px rgba(12, 131, 31, 0.2)'
                                            }}
                                        >
                                            {placingOrder ? (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <CircularProgress size={20} color="inherit" />
                                                    <Typography variant="body2" sx={{ fontWeight: 900 }}>Placing Order...</Typography>
                                                </Stack>
                                            ) : (paymentMethod === 'stripe' || paymentMethod === 'upi' ? 'Proceed to Payment' : 'Confirm Order')}
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ px: { xs: 4, md: 8 }, py: 1.5, fontWeight: 900, borderRadius: 1 }}
                                    >
                                        {activeStep === 1 ? 'Review Order' : 'Next Step'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right: Summary */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 1.5, bgcolor: '#1e293b', color: 'white', position: 'sticky', top: 100 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <BagIcon /> Order Summary
                        </Typography>

                        <List disablePadding sx={{ mb: 4, maxHeight: 300, overflowY: 'auto' }}>
                            {cart?.items?.map((item) => (
                                <ListItem key={item.id} sx={{ py: 2, px: 0 }}>
                                    <ListItemAvatar>
                                        <Avatar
                                            variant="rounded"
                                            src={item.Product.images?.[0] || ''}
                                            sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.1)' }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.Product.productName}</Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                                                {item.Seller.shop_name} • Qty {item.quantity}
                                            </Typography>
                                        }
                                    />
                                    <Typography variant="body2" sx={{ fontWeight: 900 }}>₹{item.itemTotal}</Typography>
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                        <Stack spacing={2} sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Subtotal</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{cart?.subtotal || '0.00'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Delivery Fee</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>₹{deliveryFee}.00</Typography>
                            </Box>
                        </Stack>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase' }}>Total Amount</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900 }}>₹{calculateTotal().toFixed(2)}</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900 }}>FLASH SPEED SHIPPING</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
