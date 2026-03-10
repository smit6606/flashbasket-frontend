'use client';

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Stack, Card,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function SellerCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            toast.error('Failed to load categories');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await api.post('/categories', { name, icon: 'CategoryIcon' });
            toast.success('Category added successfully');
            setName('');
            fetchCategories();
        } catch (err: any) {
            toast.error(err.message || 'Failed to add category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Manage Categories</Typography>

            <Card sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Add New Category</Typography>
                <form onSubmit={handleCreate}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            fullWidth
                            label="Category Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={<AddIcon />}
                            sx={{ minWidth: 150, borderRadius: 2, fontWeight: 800 }}
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </Button>
                    </Stack>
                </form>
            </Card>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Category Name</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell>{cat.id}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{cat.name}</TableCell>
                                <TableCell>{cat.status}</TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">No categories found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
