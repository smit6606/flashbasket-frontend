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
import { toast } from 'react-toastify';

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
    const { token } = useAuth();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [cart, setCart] = useState<{ items: CartItem[]; subtotal: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
    });

    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('cod');
    const deliveryFee = 25;

    useEffect(() => {
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
            await api.post('/orders/create', {
                deliveryAddress: fullAddress,
                paymentMethod,
                totalAmount: calculateTotal(),
                latitude: 21.1702,
                longitude: 72.8311
            });
            toast.success('Order placed successfully!');
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
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Shipping Address</Typography>
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
                                                borderRadius: 4,
                                                cursor: 'pointer',
                                                borderColor: paymentMethod === 'stripe' ? 'primary.main' : 'divider',
                                                bgcolor: paymentMethod === 'stripe' ? 'primary.light' : 'transparent',
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
                                                borderRadius: 4,
                                                cursor: 'pointer',
                                                borderColor: paymentMethod === 'cod' ? 'primary.main' : 'divider',
                                                bgcolor: paymentMethod === 'cod' ? 'primary.light' : 'transparent',
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
                        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1 }}>Shipping To</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{address.street}, {address.city}, {address.state} - {address.zip}</Typography>
                            <Button size="small" sx={{ mt: 1 }} onClick={() => setActiveStep(0)}>Change Address</Button>
                        </Paper>
                        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1 }}>Payment Method</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{paymentMethod === 'stripe' ? 'Stripe Secure Payment' : 'Cash on Delivery'}</Typography>
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

            <Stepper activeStep={activeStep} sx={{ mb: 8, display: { xs: 'none', md: 'flex' } }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel
                            StepIconProps={{ sx: { fontSize: '1.5rem' } }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{label}</Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Grid container spacing={6}>
                {/* Left: Content */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                        {renderStepContent(activeStep)}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                startIcon={<BackIcon />}
                                sx={{ ml: 1, fontWeight: 800 }}
                            >
                                Back
                            </Button>
                            <Box>
                                {activeStep === steps.length - 1 ? (
                                    paymentMethod === 'stripe' ? (
                                        <StripePayment amount={calculateTotal()} />
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={handlePlaceOrder}
                                            disabled={placingOrder}
                                            sx={{
                                                px: 5, py: 1.5,
                                                fontWeight: 900,
                                                borderRadius: 3,
                                                boxShadow: '0 8px 24px rgba(12, 131, 31, 0.2)'
                                            }}
                                        >
                                            {placingOrder ? <CircularProgress size={24} color="inherit" /> : 'Confirm Order'}
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ px: 8, py: 1.5, fontWeight: 900, borderRadius: 3 }}
                                    >
                                        Next Step
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right: Summary */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 6, bgcolor: '#1e293b', color: 'white', position: 'sticky', top: 100 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <BagIcon /> Order Summary
                        </Typography>

                        <List disablePadding sx={{ mb: 4, maxHeight: 300, overflowY: 'auto' }}>
                            {cart.items.map((item) => (
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
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{cart.subtotal}</Typography>
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
