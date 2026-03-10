'use client';

import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Divider,
    Stack,
    Button,
    alpha,
} from '@mui/material';
import {
    ChevronRight as ArrowIcon,
    Shield as ShieldIcon,
    VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';

interface MuiCartSummaryProps {
    subtotal: string;
    onCheckout: () => void;
}

export default function MuiCartSummary({ subtotal, onCheckout }: MuiCartSummaryProps) {
    const deliveryCharge = 0;
    const handlingFee = 4;
    const total = Number(subtotal) + deliveryCharge + handlingFee;

    return (
        <Box sx={{ position: 'sticky', top: 100 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Billing Summary</Typography>

                <Stack spacing={2.5} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Subtotal</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{subtotal}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Delivery Fee</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ textDecoration: 'line-through', opacity: 0.5, fontWeight: 700 }}>₹30</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>FREE</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Handling Fee</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{handlingFee}</Typography>
                    </Box>
                </Stack>

                <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>To Pay</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>₹{total}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900 }}>INSTANT SAVINGS: ₹30</Typography>
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={onCheckout}
                    size="large"
                    endIcon={<ArrowIcon />}
                    sx={{
                        py: 2.5,
                        borderRadius: 4,
                        fontWeight: 900,
                        fontSize: '1rem',
                        justifyContent: 'space-between',
                        px: 4,
                        boxShadow: '0 8px 24px rgba(12, 131, 31, 0.2)',
                        '&:hover': {
                            boxShadow: '0 12px 30px rgba(12, 131, 31, 0.3)',
                        }
                    }}
                >
                    Checkout Now
                </Button>
            </Paper>

            <Box sx={{ mt: 3, p: 3, borderRadius: 5, bgcolor: alpha('#0C831F', 0.04), border: '1px solid', borderColor: alpha('#0C831F', 0.1) }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'white', borderRadius: 2, display: 'flex' }}>
                        <VerifiedIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, fontSize: '0.8rem' }}>Safe & Secure Payments</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>PCI DSS Compliant Transaction</Typography>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
