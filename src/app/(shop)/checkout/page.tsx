'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    CheckCircle as ReviewIcon,
    DeleteOutline as RemoveIcon,
    ChevronLeft as BackIcon,
    ShoppingBag as BagIcon,
    Add as AddIcon,
    LocationOn as LocationIcon,
    HighlightOff as HighlightOffIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StripePayment from '@/components/StripePayment';
import UpiQrPayment from '@/components/UpiQrPayment';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-toastify';
import GoogleMapPicker from '@/components/GoogleMapPicker';

interface CartItem {
    id: number;
    quantity: number;
    price: string;
    itemTotal: string;
    Product: {
        id: number;
        productName: string;
        images?: string[];
        price: string;
    };
    Seller: {
        id: number;
        shop_name: string;
    };
}

interface Cart {
    items: CartItem[];
    subtotal: string;
}

const steps = ['Delivery Address', 'Payment', 'Review Order'];

export default function CheckoutPage() {
    const { token, loading: authLoading } = useAuth();
    const { refreshCart } = useCart();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [showUpiQR, setShowUpiQR] = useState(false);
    const [upiDetails, setUpiDetails] = useState<{ amount: number; groupId: string } | null>(null);
    const isPlacing = useRef(false);
    const theme = useTheme();
    const isBelow768 = useMediaQuery(theme.breakpoints.down('md'));
    const isBelow425 = useMediaQuery('(max-width:425px)');

    const [location, setLocation] = useState({ lat: 21.1702, lng: 72.8311 });
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        houseNumber: '',
        area: '',
        landmark: '',
        city: 'Surat',
        state: 'Gujarat',
        zip: '395001',
        addressType: 'Home' as 'Home' | 'Work' | 'Other'
    });

    const handleLocationSelect = (data: { lat: number; lng: number; address: string }) => {
        setLocation({ lat: data.lat, lng: data.lng });
        if (data.address) {
            setAddressForm(prev => ({
                ...prev,
                area: data.address
            }));
        }
    };

    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod' | 'upi'>('cod');
    const deliveryFee = 25;

    useEffect(() => {
        if (authLoading) return;

        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [cartRes, addrRes] = await Promise.all([
                    api.get('/cart'),
                    api.get('/addresses/all')
                ]);
                setCart(cartRes.data);
                setAddresses(addrRes.data || []);
                const defaultAddr = addrRes.data?.find((a: any) => a.isDefault);
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            } catch (err) {
                console.error('Failed to fetch checkout data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, router, authLoading]);

    const calculateSubtotal = () => cart ? parseFloat(cart.subtotal) : 0;
    const calculateDiscount = () => appliedCoupon ? parseFloat(appliedCoupon.discountAmount) : 0;
    const calculateTotal = () => calculateSubtotal() - calculateDiscount() + deliveryFee;

    const validateAddressForm = () => {
        const newErrors: Record<string, string> = {};
        if (!addressForm.fullName) newErrors.fullName = 'Full name is required';
        if (!addressForm.phone || addressForm.phone.length < 10) newErrors.phone = 'Valid phone number is required';
        if (!addressForm.houseNumber) newErrors.houseNumber = 'House/Flat number is required';
        if (!addressForm.area) newErrors.area = 'Area/Street is required';
        if (!addressForm.zip) newErrors.zip = 'Pincode is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAddress = async () => {
        if (!validateAddressForm()) return;
        
        try {
            const res = await api.post('/addresses/add', {
                ...addressForm,
                pincode: addressForm.zip,
                latitude: location.lat,
                longitude: location.lng
            });
            setAddresses(prev => [...prev, res.data]);
            setSelectedAddressId(res.data.id);
            setShowAddressForm(false);
            setErrors({});
            toast.success('Address saved');
        } catch (err: any) {
            toast.error(err.message || 'Failed to save address');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        try {
            const res = await api.post('/coupons/validate', {
                code: couponCode,
                orderValue: calculateSubtotal()
            });
            setAppliedCoupon(res.data);
            setErrors(prev => {
                const n = { ...prev };
                delete n.coupon;
                return n;
            });
        } catch (err: any) {
            setErrors(prev => ({ ...prev, coupon: err.message }));
            setAppliedCoupon(null);
        }
    };

    const handleNext = () => {
        if (activeStep === 0) {
            if (!selectedAddressId) {
                setErrors({ address: 'Please select a delivery address' });
                return;
            }
            setErrors({});
        }
        setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handlePlaceOrder = async () => {
        if (isPlacing.current) return;
        if (!cart || cart.items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        const selectedAddr = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddr) {
            toast.error('Please select an address');
            return;
        }

        setPlacingOrder(true);
        isPlacing.current = true;
        try {
            const fullAddress = `${selectedAddr.fullName}, ${selectedAddr.houseNumber}, ${selectedAddr.area}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}. Phone: ${selectedAddr.phone}`;
            const response = await api.post('/orders/create', {
                deliveryAddress: fullAddress,
                paymentMethod,
                totalAmount: calculateTotal(),
                latitude: selectedAddr.latitude,
                longitude: selectedAddr.longitude,
                couponId: appliedCoupon?.id,
                discountAmount: calculateDiscount()
            });

            if (paymentMethod === 'stripe' && response.data?.clientSecret) {
                setClientSecret(response.data.clientSecret);
                return;
            }

            if ( paymentMethod === 'upi' && response.data?.groupId) {
                setUpiDetails({ amount: calculateTotal(), groupId: response.data.groupId });
                setShowUpiQR(true);
                return;
            }

            toast.success('Order Confirmed');
            refreshCart().catch(console.error);
            router.push('/order-success');
        } catch (err: any) {
            toast.error(err.message || 'Failed to place order.');
            isPlacing.current = false;
            setPlacingOrder(false);
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        {!showAddressForm ? (
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Where should we deliver?</Typography>
                                <Grid container spacing={2}>
                                    {addresses.map((addr) => (
                                        <Grid size={{ xs: 12, sm: 6 }} key={addr.id}>
                                            <Paper
                                                variant="outlined"
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    borderColor: selectedAddressId === addr.id ? 'primary.main' : '#e2e8f0',
                                                    bgcolor: selectedAddressId === addr.id ? alpha('#0C831F', 0.05) : 'white',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha('#0C831F', 0.02) }
                                                }}
                                            >
                                                {selectedAddressId === addr.id && (
                                                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                                                        <ReviewIcon color="primary" sx={{ fontSize: 20 }} />
                                                    </Box>
                                                )}
                                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                    <Box sx={{ mt: 0.5, p: 1, bgcolor: '#f1f5f9', borderRadius: 2, color: 'text.secondary' }}>
                                                        <LocationIcon fontSize="small" />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{addr.addressType}</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {addr.houseNumber}, {addr.area}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.disabled' }}>{addr.phone}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                    ))}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Paper
                                            variant="outlined"
                                            onClick={() => setShowAddressForm(true)}
                                            sx={{
                                                p: 2,
                                                height: '100%',
                                                borderRadius: 4,
                                                borderStyle: 'dashed',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textAlign: 'center',
                                                color: 'primary.main',
                                                '&:hover': { bgcolor: alpha('#0C831F', 0.05) }
                                            }}
                                        >
                                            <AddIcon sx={{ mb: 1 }} />
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Add New Address</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                                {errors.address && (
                                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700, mt: 2, display: 'block' }}>
                                        ⚠ {errors.address}
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <Box>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4 }}>
                                    <IconButton onClick={() => setShowAddressForm(false)} size="small" sx={{ bgcolor: '#f1f5f9' }}>
                                        <BackIcon fontSize="small" />
                                    </IconButton>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Add a New Delivery Address</Typography>
                                </Stack>

                                <Paper elevation={0} sx={{ borderRadius: 5, overflow: 'hidden', border: '1px solid #f1f5f9', mb: 4 }}>
                                    <GoogleMapPicker onLocationSelect={handleLocationSelect} />
                                </Paper>

                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            value={addressForm.fullName}
                                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                            error={!!errors.fullName}
                                            helperText={errors.fullName}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            value={addressForm.phone}
                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                            error={!!errors.phone}
                                            helperText={errors.phone}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="House / Flat / Building No."
                                            value={addressForm.houseNumber}
                                            onChange={(e) => setAddressForm({ ...addressForm, houseNumber: e.target.value })}
                                            error={!!errors.houseNumber}
                                            helperText={errors.houseNumber}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Area / Sector / Locality"
                                            value={addressForm.area}
                                            onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                                            error={!!errors.area}
                                            helperText={errors.area}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Pincode"
                                            value={addressForm.zip}
                                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                            error={!!errors.zip}
                                            helperText={errors.zip}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Stack direction="row" spacing={2}>
                                            <Button 
                                                variant={addressForm.addressType === 'Home' ? 'contained' : 'outlined'} 
                                                onClick={() => setAddressForm({...addressForm, addressType: 'Home'})}
                                                sx={{ borderRadius: 2, fontWeight: 800 }}
                                            >Home</Button>
                                            <Button 
                                                variant={addressForm.addressType === 'Work' ? 'contained' : 'outlined'} 
                                                onClick={() => setAddressForm({...addressForm, addressType: 'Work'})}
                                                sx={{ borderRadius: 2, fontWeight: 800 }}
                                            >Work</Button>
                                            <Button 
                                                variant={addressForm.addressType === 'Other' ? 'contained' : 'outlined'} 
                                                onClick={() => setAddressForm({...addressForm, addressType: 'Other'})}
                                                sx={{ borderRadius: 2, fontWeight: 800 }}
                                            >Other</Button>
                                        </Stack>
                                    </Grid>
                                </Grid>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleSaveAddress}
                                    sx={{ mt: 5, py: 2, borderRadius: 2, fontWeight: 900 }}
                                >
                                    Save Address and Continue
                                </Button>
                            </Box>
                        )}
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <FormControl component="fieldset">
                            <FormLabel component="legend" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>Select Payment Method</FormLabel>
                            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                                <Stack spacing={2}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 1,
                                            borderRadius: 2,
                                            borderColor: paymentMethod === 'cod' ? 'primary.main' : '#e2e8f0',
                                            bgcolor: paymentMethod === 'cod' ? alpha('#0C831F', 0.05) : 'white'
                                        }}
                                    >
                                        <FormControlLabel value="cod" control={<Radio />} label={
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Cash on Delivery</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Pay when you receive the package</Typography>
                                            </Box>
                                        } sx={{ width: '100%', m: 0, px: 2 }} />
                                    </Paper>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 1,
                                            borderRadius: 2,
                                            borderColor: paymentMethod === 'stripe' ? 'primary.main' : '#e2e8f0',
                                            bgcolor: paymentMethod === 'stripe' ? alpha('#0C831F', 0.05) : 'white'
                                        }}
                                    >
                                        <FormControlLabel value="stripe" control={<Radio />} label={
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Card Payment</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Secure online payment via Stripe</Typography>
                                            </Box>
                                        } sx={{ width: '100%', m: 0, px: 2 }} />
                                    </Paper>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 1,
                                            borderRadius: 2,
                                            borderColor: paymentMethod === 'upi' ? 'primary.main' : '#e2e8f0',
                                            bgcolor: paymentMethod === 'upi' ? alpha('#0C831F', 0.05) : 'white'
                                        }}
                                    >
                                        <FormControlLabel value="upi" control={<Radio />} label={
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>UPI / QR Code</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Scan & Pay instantly</Typography>
                                            </Box>
                                        } sx={{ width: '100%', m: 0, px: 2 }} />
                                    </Paper>
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <ReviewIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Ready to Flash!</Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mb: 4 }}>
                            Your items are waiting to be delivered in minutes.
                        </Typography>
                   
                        {paymentMethod === 'stripe' && clientSecret && (
                            <Box sx={{ mt: 4, p: 3, border: '1px solid #e2e8f0', borderRadius: 4 }}>
                                <StripePayment 
                                    clientSecret={clientSecret} 
                                    onSuccess={() => {
                                        refreshCart().catch(console.error);
                                        router.push('/order-success');
                                    }} 
                                />
                            </Box>
                        )}

                        {showUpiQR && upiDetails && (
                            <Box sx={{ mt: 4, p: 3, border: '1px solid #e2e8f0', borderRadius: 4 }}>
                                <UpiQrPayment 
                                    amount={upiDetails.amount} 
                                    groupId={upiDetails.groupId}
                                    onSuccess={() => {
                                        refreshCart().catch(console.error);
                                        router.push('/order-success');
                                    }} 
                                />
                            </Box>
                        )}
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress />
        </Box>
    );

    if (!cart || (cart.items.length === 0 && !isPlacing.current)) {
        router.push('/cart');
        return null;
    }

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 10 }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', py: 4, mb: 6 }}>
                <Container maxWidth="xl">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton component={Link} href="/cart">
                            <BackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                                Secure <span style={{ color: '#0C831F' }}>Checkout</span>
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                {cart.items.length} items • 9 mins estimated delivery
                            </Typography>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="xl">
                <Grid container spacing={6}>
                    {/* Left: Steps */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 1.5, border: '1px solid #e2e8f0', mb: 4 }}>
                            <Stepper activeStep={activeStep} sx={{ mb: 8 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel sx={{ 
                                            '& .MuiStepLabel-label': { 
                                                fontWeight: 800, 
                                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                                display: { xs: 'none', sm: 'inline' } 
                                            },
                                            '& .MuiStepIcon-root': { fontSize: { xs: 24, sm: 28 } }
                                        }}>
                                            {label}
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {renderStepContent(activeStep)}

                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', mt: 6, gap: 2 }}>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    fullWidth={isBelow425}
                                    sx={{ px: 4, py: 1.5, fontWeight: 800 }}
                                    startIcon={<BackIcon />}
                                >
                                    Back
                                </Button>
                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        onClick={handlePlaceOrder}
                                        disabled={placingOrder}
                                        fullWidth={isBelow425}
                                        sx={{ px: { xs: 4, sm: 8 }, py: 1.5, fontWeight: 900, borderRadius: 1.5 }}
                                    >
                                        {placingOrder ? <CircularProgress size={24} color="inherit" /> : `Place Order (₹${calculateTotal().toFixed(2)})`}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        disabled={showAddressForm}
                                        fullWidth={isBelow425}
                                        sx={{ px: { xs: 4, sm: 8 }, py: 1.5, fontWeight: 900, borderRadius: 1.5 }}
                                    >
                                        Next Step
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right: Summary */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 1.5, bgcolor: '#1e293b', color: 'white', position: 'sticky', top: 100 }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <BagIcon /> Order Summary
                            </Typography>

                            <List disablePadding sx={{ mb: 4, maxHeight: 300, overflowY: 'auto', px: 1 }}>
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
                                                    Qty {item.quantity} • ₹{item.price}
                                                </Typography>
                                            }
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 900, pr: 1 }}>₹{item.itemTotal}</Typography>
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                            {/* Coupon Section */}
                            <Box sx={{ mb: 4, mt: 3 }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                    Promo Code
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <TextField 
                                        size="small" 
                                        placeholder="Enter Coupon"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        fullWidth
                                        sx={{ 
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                borderRadius: 2,
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
                                            }
                                        }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        onClick={handleApplyCoupon}
                                        sx={{ borderRadius: 2, fontWeight: 900, minWidth: 80 }}
                                    >
                                        Apply
                                    </Button>
                                </Stack>
                                {errors.coupon && (
                                    <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 700, mt: 1, display: 'block' }}>
                                        {errors.coupon}
                                    </Typography>
                                )}
                                {appliedCoupon && (
                                    <Box sx={{ mt: 1.5, p: 1, px: 2, bgcolor: alpha('#10b981', 0.1), borderRadius: 2, border: '1px dashed #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 900 }}>
                                            CODE: {appliedCoupon.code} (₹{appliedCoupon.discountAmount} OFF)
                                        </Typography>
                                        <IconButton size="small" onClick={() => setAppliedCoupon(null)} sx={{ color: '#10b981' }}>
                                            <HighlightOffIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>

                            <Stack spacing={2} sx={{ py: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Subtotal</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{calculateSubtotal().toFixed(2)}</Typography>
                                </Box>
                                {calculateDiscount() > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700 }}>Discount (Coupon)</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>-₹{calculateDiscount().toFixed(2)}</Typography>
                                    </Box>
                                )}
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
        </Box>
    );
}
