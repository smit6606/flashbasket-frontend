'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { CheckCircle as CheckIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface UpiQrPaymentProps {
    amount: number;
    groupId: string;
    onSuccess?: () => void;
}

export default function UpiQrPayment({ amount, groupId, onSuccess }: UpiQrPaymentProps) {
    const router = useRouter();
    const upiId = "8320436638@pthdfc";
    const merchantName = "FlashBasket Store";
    
    // UPI format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=CURRENCY&tn=NOTE
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + groupId)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(upiId);
        toast.info("UPI ID copied to clipboard!");
    };

    const handleFinish = () => {
        toast.success("Payment submitted! Our team will verify and update your order soon.");
        if (onSuccess) {
            onSuccess();
        } else {
            router.push('/order-success');
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', textAlign: 'center', bgcolor: '#f8fafc' }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Scan to Pay with UPI</Typography>
            
            <Box sx={{ 
                p: 3, 
                bgcolor: 'white', 
                borderRadius: 4, 
                display: 'inline-block', 
                mb: 3,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
            }}>
                <QRCodeSVG 
                    value={upiUri} 
                    size={200}
                    level="H"
                    includeMargin={true}
                />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                ₹{amount.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 4 }}>
                Amount is auto-configured in the QR
            </Typography>

            <Stack spacing={2} sx={{ maxWidth: 300, mx: 'auto' }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 3,
                    border: '1px solid #e2e8f0'
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{upiId}</Typography>
                    <Button size="small" startIcon={<CopyIcon />} onClick={handleCopy} sx={{ minWidth: 0, fontWeight: 900 }}>Copy</Button>
                </Box>

                <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={handleFinish} 
                    startIcon={<CheckIcon />}
                    sx={{ 
                        py: 2, 
                        borderRadius: 3, 
                        fontWeight: 900,
                        bgcolor: '#0C831F',
                        '&:hover': { bgcolor: '#096618' }
                    }}
                >
                    I Have Paid
                </Button>
            </Stack>

            <Typography variant="caption" sx={{ display: 'block', mt: 4, color: 'text.secondary', fontWeight: 700 }}>
                Scan this QR code using any UPI app like GPay, PhonePe, or Paytm.
            </Typography>
        </Paper>
    );
}
