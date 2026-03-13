'use client';

import React from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Divider,
    Stack,
    Grid,
} from '@mui/material';
import {
    CheckCircleOutline as CheckIcon,
    ShoppingBasket as ShoppingBasketIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export default function OrderSuccessPage() {
    return (
        <Container maxWidth="md" sx={{ py: 10 }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, md: 8 },
                    textAlign: 'center',
                    borderRadius: '32px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                    bgcolor: 'white',
                }}
            >
                <Box
                    sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#ecfdf5',
                        color: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 4,
                        boxShadow: '0 0 0 10px rgba(16, 185, 129, 0.1)',
                    }}
                >
                    <CheckIcon sx={{ fontSize: 60 }} />
                </Box>
                
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'slate.900', mb: 2 }}>
                    Order Placed Successfully!
                </Typography>
                
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600, mb: 6, px: { md: 6 } }}>
                    Your lightning-fast delivery is being prepared. Our delivery partner will pick it up shortly!
                </Typography>

                <Paper elevation={0} sx={{ bgcolor: '#f8fafc', p: 4, borderRadius: '16px', mb: 6, textAlign: 'left' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                        What happens next?
                    </Typography>
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <ShoppingBasketIcon color="primary" />
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 800, color: 'slate.900' }}>Order Processing</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>The seller is packing your items securely.</Typography>
                            </Box>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <ReceiptIcon color="primary" />
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 800, color: 'slate.900' }}>Out for Delivery</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Within 11 minutes, a driver will bring it right to your door.</Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>

                <Grid container spacing={3} justifyContent="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Button
                            component={Link}
                            href="/orders"
                            variant="outlined"
                            fullWidth
                            size="large"
                            sx={{
                                py: 2,
                                fontWeight: 800,
                                borderRadius: '16px',
                                color: 'slate.900',
                                borderColor: 'slate.200',
                                '&:hover': { borderColor: 'slate.900', bgcolor: 'slate.50' }
                            }}
                        >
                            View My Orders
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Button
                            component={Link}
                            href="/"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{
                                py: 2,
                                fontWeight: 800,
                                borderRadius: '16px',
                                bgcolor: 'primary.main',
                                color: 'white',
                                boxShadow: '0 8px 20px rgba(12, 131, 31, 0.2)',
                                '&:hover': { bgcolor: 'primary.dark' }
                            }}
                        >
                            Continue Shopping
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
