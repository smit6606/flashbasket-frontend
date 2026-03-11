'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, alpha } from '@mui/material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users');
                setUsers(response.data);
            } catch (error) {
                toast.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.dark' }}>Manage Users</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>All registered customers on the platform.</Typography>
            </Box>
            <TableContainer component={Card} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha('#0C831F', 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Phone</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell sx={{ fontWeight: 800 }}>{user.id}</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{user.user_name}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{user.email}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{user.phone}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
