'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Button, alpha } from '@mui/material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AdminSellers() {
    const [sellers, setSellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/sellers');
            setSellers(response.data);
        } catch (error) {
            toast.error('Failed to load sellers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await api.patch(`/admin/seller/${id}/status`, { status });
            toast.success(`Seller status updated to ${status}`);
            fetchSellers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    }

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.dark' }}>Manage Sellers</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>Approve or suspend store operations.</Typography>
            </Box>
            <TableContainer component={Card} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha('#0C831F', 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Shop Name</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Owner</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sellers.map((seller) => (
                            <TableRow key={seller.id}>
                                <TableCell sx={{ fontWeight: 800 }}>{seller.shop_name}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{seller.user_name} ({seller.email})</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={seller.status.toUpperCase()} 
                                        size="small" 
                                        color={seller.status === 'active' ? 'success' : seller.status === 'suspended' ? 'error' : 'warning'}
                                        sx={{ fontWeight: 800, borderRadius: 2 }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    {seller.status !== 'active' && (
                                        <Button size="small" variant="contained" color="success" onClick={() => handleStatusUpdate(seller.id, 'active')} sx={{ mr: 1, fontWeight: 800, borderRadius: 2 }}>
                                            Approve
                                        </Button>
                                    )}
                                    {seller.status !== 'suspended' && (
                                        <Button size="small" variant="contained" color="error" onClick={() => handleStatusUpdate(seller.id, 'suspended')} sx={{ fontWeight: 800, borderRadius: 2 }}>
                                            Suspend
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
