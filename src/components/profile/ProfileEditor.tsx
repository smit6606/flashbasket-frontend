'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    Avatar,
    Stack,
    Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function ProfileEditor() {
    const { user, setUser } = useAuth() as any;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_name: '',
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                user_name: user.user_name || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/profile', formData);
            if (res.success) {
                const updatedUser = { ...user, ...formData };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Your profile has been updated!');
            }
        } catch (err: any) {
            toast.error(err.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 6 }}>
                <Avatar 
                    sx={{ 
                        width: 100, 
                        height: 100, 
                        fontSize: '3rem', 
                        bgcolor: 'primary.main', 
                        fontWeight: 900,
                        boxShadow: '0 20px 40px rgba(12, 131, 31, 0.2)'
                    }}
                >
                    {formData.user_name.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-0.02em' }}>Profile Settings</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>Update your identity and contact information</Typography>
                </Box>
            </Stack>

            <Card elevation={0} sx={{ borderRadius: 8, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.03)' }}>
                <CardContent sx={{ p: 6 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Username</Typography>
                                <TextField
                                    fullWidth
                                    name="user_name"
                                    value={formData.user_name}
                                    disabled
                                    variant="outlined"
                                    InputProps={{ sx: { borderRadius: 4, bgcolor: '#f8fafc' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name</Typography>
                                <TextField
                                    fullWidth
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    InputProps={{ sx: { borderRadius: 4 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email Address</Typography>
                                <TextField
                                    fullWidth
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    InputProps={{ sx: { borderRadius: 4 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mobile Number</Typography>
                                <TextField
                                    fullWidth
                                    name="phone"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    InputProps={{ sx: { borderRadius: 4 } }}
                                />
                            </Grid>
                            
                            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <Divider sx={{ mb: 4, opacity: 0.5 }} />
                                <Stack direction="row" spacing={2} justifyContent="flex-end">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        startIcon={!loading && <SaveIcon />}
                                        sx={{ 
                                            px: 6, 
                                            py: 1.5, 
                                            fontWeight: 900, 
                                            borderRadius: 4,
                                            bgcolor: '#0f172a',
                                            '&:hover': { bgcolor: '#1e293b' }
                                        }}
                                    >
                                        {loading ? 'Saving Changes...' : 'Save Settings'}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
