'use client';

import React, { useEffect, useState, use } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Divider,
    Stack,
    Grid,
    Button,
    CircularProgress,
} from '@mui/material';
import {
    Print as PrintIcon,
    Download as DownloadIcon,
    ArrowBack as BackIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    items: {
        name: string;
        shopName: string;
        quantity: number;
        price: string;
        total: string;
    }[];
    subtotal: string;
    deliveryFee: string;
    totalAmount: string;
    paymentMethod: string;
    paymentStatus: string;
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await api.get(`/orders/${id}/invoice`);
                setInvoice(res.data);
            } catch (err) {
                console.error('Failed to fetch invoice', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        if (!invoice) return;

        const doc = new jsPDF();
        
        // Brand Header
        doc.setFontSize(22);
        doc.setTextColor(12, 131, 31); // #0C831F
        doc.text('FLASHBASKET', 20, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('Premium Express Delivery', 20, 32);

        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text('INVOICE', 190, 25, { align: 'right' });
        doc.setFontSize(10);
        doc.text(`#${invoice.invoiceNumber}`, 190, 32, { align: 'right' });

        doc.line(20, 40, 190, 40);

        // Billed To
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('BILLED TO', 20, 50);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(invoice.customer.name, 20, 58);
        doc.setFontSize(10);
        doc.text(invoice.customer.email, 20, 64);
        doc.text(invoice.customer.phone, 20, 70);
        doc.text(invoice.customer.address, 20, 76, { maxWidth: 80 });

        // Details
        doc.setTextColor(100, 116, 139);
        doc.text('INVOICE DETAILS', 190, 50, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 190, 58, { align: 'right' });
        doc.text(`Payment: ${invoice.paymentMethod.toUpperCase()}`, 190, 64, { align: 'right' });
        doc.text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 190, 70, { align: 'right' });

        // Table
        autoTable(doc, {
            startY: 90,
            head: [['Item Description', 'Shop', 'Price', 'Qty', 'Total']],
            body: invoice.items.map(item => [
                item.name, 
                item.shopName, 
                `INR ${item.price}`, 
                item.quantity, 
                `INR ${item.total}`
            ]),
            headStyles: { fillColor: [15, 23, 42] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;

        // Totals
        doc.text('Subtotal:', 140, finalY);
        doc.text(`INR ${invoice.subtotal}`, 190, finalY, { align: 'right' });
        doc.text('Delivery Fee:', 140, finalY + 6);
        doc.text(`+ INR ${invoice.deliveryFee}`, 190, finalY + 6, { align: 'right' });
        
        doc.setFontSize(14);
        doc.text('Total:', 140, finalY + 15);
        doc.text(`INR ${invoice.totalAmount}`, 190, finalY + 15, { align: 'right' });

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('This is a computer generated invoice.', 105, 285, { align: 'center' });

        doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
            <CircularProgress color="primary" />
        </Box>
    );

    if (!invoice) return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>Invoice Not Found</Typography>
            <Button startIcon={<BackIcon />} onClick={() => router.back()}>Go Back</Button>
        </Container>
    );

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            {/* Actions (Hidden on Print) */}
            <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 4, display: 'print:none' }}>
                <Button startIcon={<BackIcon />} onClick={() => router.back()} sx={{ fontWeight: 800 }}>
                    Back to Orders
                </Button>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ borderRadius: 4, fontWeight: 900 }}>
                        Print Invoice
                    </Button>
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadPDF} sx={{ borderRadius: 4, fontWeight: 900 }}>
                        Download PDF
                    </Button>
                </Stack>
            </Stack>

            <Paper elevation={0} sx={{ 
                p: { xs: 4, md: 8 }, 
                borderRadius: 4, 
                border: '1px solid #f1f5f9',
                boxShadow: '0 20px 60px rgba(0,0,0,0.03)',
                "@media print": {
                    border: 'none',
                    boxShadow: 'none',
                    p: 0,
                    m: 0
                }
            }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 1000, color: '#0C831F', mb: 1, letterSpacing: '-0.05em' }}>
                            FLASH<span style={{ color: '#0f172a' }}>BASKET</span>
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            Premium Express Delivery
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>INVOICE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>#{invoice.invoiceNumber}</Typography>
                    </Box>
                </Stack>

                <Divider sx={{ mb: 6 }} />

                {/* Details */}
                <Grid container spacing={4} sx={{ mb: 8 }}>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary', mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Billed To</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>{invoice.customer.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{invoice.customer.email}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{invoice.customer.phone}</Typography>
                        <Typography variant="body2" sx={{ mt: 2, fontWeight: 700, maxWidth: 300 }}>{invoice.customer.address}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary', mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Invoice Details</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>Date: <span style={{ color: '#64748b' }}>{new Date(invoice.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, mt: 1 }}>Payment Method: <span style={{ color: '#64748b', textTransform: 'uppercase' }}>{invoice.paymentMethod}</span></Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, mt: 1 }}>Status: <span style={{ color: '#0C831F' }}>{invoice.paymentStatus.toUpperCase()}</span></Typography>
                    </Grid>
                </Grid>

                {/* Items Table */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', pb: 2, borderBottom: '2px solid #f1f5f9' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Item Description</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, textAlign: 'center' }}>Price</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, textAlign: 'center' }}>Qty</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, textAlign: 'right' }}>Total</Typography>
                    </Box>
                    {invoice.items.map((item, i) => (
                        <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', py: 2.5, borderBottom: '1px solid #f8fafc' }}>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.name}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Sold by: {item.shopName}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'center', color: 'text.secondary' }}>₹{item.price}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'center', color: 'text.secondary' }}>{item.quantity}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 900, textAlign: 'right' }}>₹{item.total}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Totals */}
                <Box sx={{ ml: 'auto', maxWidth: 300 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Subtotal</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{invoice.subtotal}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Delivery Fee</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>+ ₹{invoice.deliveryFee}</Typography>
                        </Stack>
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>Total</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 1000, color: 'primary.main' }}>₹{invoice.totalAmount}</Typography>
                        </Stack>
                    </Stack>
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 10, pt: 4, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        This is a computer generated invoice. No signature required.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
