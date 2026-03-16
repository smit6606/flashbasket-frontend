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
    itemTotal: string;
    handlingFee: string;
    deliveryFee: string;
    totalAmount: string;
    totalSavings: string;
    promoDiscount?: string;
    onCheckout: () => void;
}

export default function MuiCartSummary({ 
    itemTotal, 
    handlingFee, 
    deliveryFee, 
    totalAmount, 
    totalSavings, 
    promoDiscount = '0.00',
    onCheckout 
}: MuiCartSummaryProps) {
    const savingsNum = parseFloat(totalSavings);
    const promoNum = parseFloat(promoDiscount);
    const productSavings = Math.max(0, savingsNum - promoNum);

    return (
        <Box sx={{ position: 'sticky', top: 100 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Bill summary</Typography>

                <Stack spacing={2.5} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Item Total</Typography>
                        <Stack direction="row" spacing={1}>
                            {savingsNum > 0 && <Typography variant="body2" sx={{ textDecoration: 'line-through', opacity: 0.5, fontWeight: 700 }}>₹{(Number(itemTotal) + savingsNum).toFixed(0)}</Typography>}
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{itemTotal}</Typography>
                        </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Handling Fee</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{handlingFee}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Delivery Fee</Typography>
                        {Number(deliveryFee) === 0 ? (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 900, color: '#0C831F' }}>FREE</Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{deliveryFee}</Typography>
                        )}
                    </Box>
                    {promoNum > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0C831F' }}>Promo Discount</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0C831F' }}>-₹{promoDiscount}</Typography>
                        </Box>
                    )}
                </Stack>

                <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>To Pay</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{totalAmount}</Typography>
                </Box>

                {savingsNum > 0 && (
                    <Box sx={{ 
                        bgcolor: alpha('#0C831F', 0.08), 
                        p: 2.5, 
                        borderRadius: 3, 
                        mb: 3, 
                        border: `1px solid ${alpha('#0C831F', 0.2)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ 
                            position: 'absolute', 
                            right: -10, 
                            top: -10, 
                            opacity: 0.1, 
                            transform: 'rotate(20deg)',
                            pointerEvents: 'none'
                        }}>
                            <VerifiedIcon sx={{ fontSize: 60, color: '#0C831F' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#0C831F', fontWeight: 900, lineHeight: 1.4 }}>
                            🎉 Awesome! You're saving ₹{totalSavings} on this order
                        </Typography>
                    </Box>
                )}

                <Button
                    fullWidth
                    variant="contained"
                    onClick={onCheckout}
                    size="large"
                    endIcon={<ArrowIcon />}
                    sx={{
                        py: 2.5,
                        borderRadius: 3,
                        fontWeight: 900,
                        fontSize: '1rem',
                        justifyContent: 'space-between',
                        px: 4,
                        bgcolor: '#0C831F',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: '0 8px 24px rgba(12, 131, 31, 0.2)',
                        '&:hover': {
                            bgcolor: '#096e1a',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 30px rgba(12, 131, 31, 0.3)',
                        }
                    }}
                >
                    Checkout Now
                </Button>
            </Paper>

            {savingsNum > 0 && (
                <Paper elevation={0} sx={{ mt: 3, p: 4, borderRadius: 3, border: '1px solid #f1f5f9', bgcolor: 'white' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 3 }}>Savings on this order</Typography>
                    
                    <Stack spacing={2}>
                        {productSavings > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Product Discounts</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 900, color: '#0C831F' }}>-₹{productSavings.toFixed(0)}</Typography>
                            </Box>
                        )}
                        {promoNum > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Special Offer</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 900, color: '#0C831F' }}>-₹{promoNum.toFixed(0)}</Typography>
                            </Box>
                        )}
                        {Number(deliveryFee) === 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Delivery</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 900, color: '#0C831F' }}>FREE</Typography>
                            </Box>
                        )}
                        
                        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Total Savings</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0C831F' }}>₹{totalSavings}</Typography>
                        </Box>
                    </Stack>
                </Paper>
            )}

            <Box sx={{ 
                mt: 3, 
                p: 3, 
                borderRadius: 3, 
                bgcolor: alpha('#0C831F', 0.04), 
                border: '1px solid', 
                borderColor: alpha('#0C831F', 0.1),
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <Box sx={{ 
                    p: 1.2, 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    borderRadius: '12px', 
                    display: 'flex',
                    boxShadow: '0 4px 12px rgba(12, 131, 31, 0.2)'
                }}>
                    <VerifiedIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, fontSize: '0.8rem', color: 'text.primary' }}>Safe & Secure Payments</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>PCI DSS Compliant Transaction</Typography>
                </Box>
            </Box>
        </Box>
    );
}
