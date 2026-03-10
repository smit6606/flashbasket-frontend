'use client';

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Stack, Card,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function SellerSubcategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState('');
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
        if (!name.trim() || !categoryId) return;

        setLoading(true);
        try {
            await api.post('/categories/subcategory', { name, categoryId: parseInt(categoryId) });
            toast.success('Subcategory added successfully');
            setName('');
            fetchCategories(); // Refresh the list
        } catch (err: any) {
            toast.error(err.message || 'Failed to add subcategory');
        } finally {
            setLoading(false);
        }
    };

    // Flatten logic for table
    const allSubcategories = categories.flatMap(cat =>
        (cat.SubCategories || []).map((sub: any) => ({
            ...sub,
            categoryName: cat.name
        }))
    );

    return (
        <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Manage Subcategories</Typography>

            <Card sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Add New Subcategory</Typography>
                <form onSubmit={handleCreate}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            select
                            label="Parent Category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            sx={{ minWidth: 200 }}
                        >
                            <MenuItem value="" disabled>Select Category</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Subcategory Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !categoryId}
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
                            <TableCell sx={{ fontWeight: 800 }}>Parent Category</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Subcategory Name</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allSubcategories.map((sub, index) => (
                            <TableRow key={index}>
                                <TableCell>{sub.id}</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{sub.categoryName}</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>{sub.name}</TableCell>
                                <TableCell>{sub.status}</TableCell>
                            </TableRow>
                        ))}
                        {allSubcategories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No subcategories found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
