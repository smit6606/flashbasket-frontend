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
    InputAdornment,
    Avatar,
    Stack,
    Divider,
    IconButton,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from '@mui/material';
import { 
    Save as SaveIcon, 
    PhotoCamera as CameraIcon,
    Lock as LockIcon,
    Security as SecurityIcon,
    ArrowBack as BackIcon,
    LocationOn as LocationIcon,
    Home as HomeIcon,
    NavigateNext as NextIcon
} from '@mui/icons-material';
import { Breadcrumbs, Link as MuiLink } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { normalizePhoneForBackend, isValidPhone } from '@/lib/phoneUtils';
import GoogleMapPicker from '@/components/GoogleMapPicker';

export default function ProfileEditor() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [openPassModal, setOpenPassModal] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        shop_name: '',
        owner_name: '',
        user_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        vehicleNumber: '',
        latitude: '',
        longitude: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                shop_name: user.shop_name || '',
                owner_name: user.owner_name || '',
                user_name: user.user_name || '',
                email: user.email || '',
                phone: user.phone ? user.phone.replace('+91', '') : '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                country: user.country || '',
                pincode: user.pincode || '',
                vehicleNumber: user.vehicleNumber || '',
                latitude: user.latitude || '',
                longitude: user.longitude || '',
            });
            setImagePreview(user.profileImage || null);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        if (name === 'phone') {
            value = value.replace(/[^\d]/g, '').slice(0, 10);
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleLocationSelect = (data: { lat: number; lng: number; address: string }) => {
        const zipMatch = data.address.match(/\b\d{6}\b/);
        const parts = data.address.split(',');
        const cityCandidate = parts.length > 2 ? parts[parts.length - 3].trim() : '';
        
        setFormData(prev => ({
            ...prev,
            latitude: data.lat.toString(),
            longitude: data.lng.toString(),
            address: data.address || prev.address,
            city: cityCandidate || prev.city,
            pincode: zipMatch ? zipMatch[0] : prev.pincode
        }));
        
        toast.info("Location synchronized! Address details pre-filled.", {
            icon: <span>📍</span>,
            toastId: 'profile-loc'
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Format validation
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error('Only JPG, PNG and WEBP formats are allowed');
                return;
            }
            // Size validation (2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size must be less than 2MB');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (readEvent) => {
                setImagePreview(readEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                let value = (formData as any)[key];
                
                if (key === 'phone') {
                    if (!isValidPhone(value)) {
                        throw new Error('Please enter a valid 10-digit phone number');
                    }
                    value = normalizePhoneForBackend(value);
                }

                if (value !== undefined && value !== null) {
                    // Skip empty strings for coordinates to avoid backend decimal errors
                    if ((key === 'latitude' || key === 'longitude') && value === '') {
                        return;
                    }
                    data.append(key, value);
                }
            });

            if (imageFile) {
                data.append('profileImage', imageFile);
            }

            await api.patch('/auth/profile-update', data);
            await refreshUser();
            toast.success('Profile Updated Successfully!');
            setImageFile(null);
            // Stay on page — do NOT redirect to home. Just refresh user data.
        } catch (err: any) {
            toast.error(err.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setPassLoading(true);
        try {
            await api.patch('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password Updated');
            setOpenPassModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            toast.error(err.message || 'Password update failed');
        } finally {
            setPassLoading(false);
        }
    };

    const isSeller = user?.role === 'seller';
    const isDelivery = user?.role === 'delivery';

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>


            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em' }}>
                    Profile <span style={{ color: '#0C831F' }}>Settings</span>
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>
                    Standardized account management for the FlashBasket platform.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Side: Avatar & Core Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ 
                        borderRadius: 8, 
                        border: '1px solid #e2e8f0', 
                        overflow: 'hidden', 
                        bgcolor: '#f8fafc',
                        position: 'sticky',
                        top: 24
                    }}>
                        <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                <Avatar 
                                    src={imagePreview || undefined}
                                    sx={{ 
                                        width: 150, 
                                        height: 150, 
                                        fontSize: '4rem', 
                                        bgcolor: 'primary.main', 
                                        fontWeight: 900,
                                        boxShadow: '0 25px 50px -12px rgba(12, 131, 31, 0.25)',
                                        border: '6px solid white'
                                    }}
                                >
                                    {formData.name?.charAt(0).toUpperCase() || formData.user_name?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                                <IconButton
                                    component="label"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 5,
                                        right: 5,
                                        bgcolor: '#0f172a',
                                        color: 'white',
                                        '&:hover': { bgcolor: '#1e293b' },
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                                    <CameraIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, color: '#1e293b' }}>
                                {isSeller ? formData.shop_name : formData.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
                                {user?.role} Account
                            </Typography>

                            <Divider sx={{ mb: 3 }} />

                            <Stack spacing={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<SecurityIcon />}
                                    onClick={() => setOpenPassModal(true)}
                                    sx={{ 
                                        borderRadius: 1, 
                                        py: 1.5, 
                                        fontWeight: 800,
                                        borderColor: '#e2e8f0',
                                        color: '#475569',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' }
                                    }}
                                >
                                    Change Password
                                </Button>
                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                                    Email cannot be changed after registration for security reasons.
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Side: Form Fields */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card elevation={0} sx={{ borderRadius: 8, border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.04)' }}>
                        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={5}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 8, height: 24, bgcolor: '#0C831F', borderRadius: 4 }} />
                                            General Information
                                        </Typography>
                                        <Grid container spacing={3}>
                                            {isSeller ? (
                                                <>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <TextField fullWidth id="profile-shop_name" label="Shop Name" name="shop_name" autoComplete="organization" value={formData.shop_name} onChange={handleChange} required InputProps={{ sx: { borderRadius: 4 } }} />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <TextField fullWidth id="profile-owner_name" label="Owner Name" name="owner_name" autoComplete="name" value={formData.owner_name} onChange={handleChange} required InputProps={{ sx: { borderRadius: 4 } }} />
                                                    </Grid>
                                                </>
                                            ) : (
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField fullWidth id="profile-name" label="Full Name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required InputProps={{ sx: { borderRadius: 4 } }} />
                                                </Grid>
                                            )}
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth id="profile-user_name" label="Username" name="user_name" autoComplete="username" value={formData.user_name} disabled InputProps={{ sx: { borderRadius: 4, bgcolor: '#f8fafc' } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth id="profile-email" label="Email Address" type="email" name="email" autoComplete="email" value={formData.email} disabled InputProps={{ sx: { borderRadius: 4, bgcolor: '#f8fafc' } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField 
                                                    fullWidth 
                                                    id="profile-phone" 
                                                    label="Phone Number" 
                                                    name="phone" 
                                                    autoComplete="tel" 
                                                    value={formData.phone} 
                                                    onChange={handleChange} 
                                                    required 
                                                    placeholder="9876543210"
                                                    InputProps={{ 
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', borderRight: '1px solid #e2e8f0', pr: 1.5, mr: 1 }}>
                                                                    +91
                                                                </Typography>
                                                            </InputAdornment>
                                                        ),
                                                        sx: { borderRadius: 4 } 
                                                    }} 
                                                />
                                            </Grid>
                                            {isDelivery && (
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField fullWidth label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} required InputProps={{ sx: { borderRadius: 4 } }} />
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 8, height: 24, bgcolor: '#3b82f6', borderRadius: 4 }} />
                                            Address & Location
                                        </Typography>
                                        
                                        <Box sx={{ mb: 4, borderRadius: 5, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                            <GoogleMapPicker 
                                                onLocationSelect={handleLocationSelect} 
                                                initialLocation={
                                                    formData.latitude && formData.longitude 
                                                        ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } 
                                                        : undefined
                                                }
                                            />
                                        </Box>

                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField fullWidth label="Street Address" name="address" value={formData.address} onChange={handleChange} multiline rows={2} InputProps={{ sx: { borderRadius: 4 } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} InputProps={{ sx: { borderRadius: 4 } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange} InputProps={{ sx: { borderRadius: 4 } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="Zip / Pincode" name="pincode" value={formData.pincode} onChange={handleChange} InputProps={{ sx: { borderRadius: 4 } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="Country" name="country" value={formData.country} onChange={handleChange} InputProps={{ sx: { borderRadius: 4 } }} />
                                            </Grid>

                                        </Grid>
                                    </Box>

                                    {(isSeller || isDelivery) && (
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 8, height: 24, bgcolor: '#eab308', borderRadius: 4 }} />
                                            Geospatial Location
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 3 }}>
                                            Required for nearby discovery. Automatically detect or enter coordinates manually.
                                        </Typography>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <TextField fullWidth label="Latitude" name="latitude" value={(formData as any).latitude || ''} onChange={handleChange} InputProps={{ sx: { borderRadius: 4 } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <TextField fullWidth label="Longitude" name="longitude" value={(formData as any).longitude || ''} onChange={handleChange} InputProps={{ sx: { borderRadius: 4 } }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <Button 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    color="secondary"
                                                    startIcon={<LocationIcon />}
                                                    onClick={() => {
                                                        if (navigator.geolocation) {
                                                            navigator.geolocation.getCurrentPosition((pos) => {
                                                                setFormData({
                                                                    ...formData,
                                                                    latitude: pos.coords.latitude.toString(),
                                                                    longitude: pos.coords.longitude.toString()
                                                                } as any);
                                                                toast.success('Current location detected!');
                                                            });
                                                        }
                                                    }}
                                                    sx={{ height: '56px', borderRadius: 4, fontWeight: 900 }}
                                                >
                                                    Detect Location
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    )}

                                    <Divider />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                        sx={{ 
                                            py: 2, 
                                            fontWeight: 900, 
                                            borderRadius: 1, 
                                            bgcolor: '#0f172a',
                                            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
                                            '&:hover': { bgcolor: '#1e293b' }
                                        }}
                                    >
                                        {loading ? 'Saving Changes...' : 'Update My Profile'}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Change Password Modal */}
            <Dialog 
                open={openPassModal} 
                onClose={() => setOpenPassModal(false)}
                PaperProps={{ sx: { borderRadius: 1.5, width: '100%', maxWidth: 450, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>Change Password</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 4 }}>
                        Ensure your account stays secure by using a strong, unique password.
                    </Typography>
                    <Stack spacing={3}>
                        <TextField 
                            fullWidth 
                            id="change-currentPassword"
                            type="password" 
                            label="Current Password" 
                            name="currentPassword"
                            autoComplete="current-password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            InputProps={{ sx: { borderRadius: 4 } }} 
                        />
                        <TextField 
                            fullWidth 
                            id="change-newPassword"
                            type="password" 
                            label="New Password" 
                            name="newPassword"
                            autoComplete="new-password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            InputProps={{ sx: { borderRadius: 4 } }} 
                        />
                        <TextField 
                            fullWidth 
                            id="change-confirmPassword"
                            type="password" 
                            label="Confirm New Password" 
                            name="confirmPassword"
                            autoComplete="new-password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            InputProps={{ sx: { borderRadius: 4 } }} 
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpenPassModal(false)} sx={{ fontWeight: 800, color: 'text.secondary' }}>Cancel</Button>
                    <Button 
                        onClick={handleUpdatePassword}
                        variant="contained"
                        disabled={passLoading}
                        sx={{ 
                            borderRadius: 1, 
                            fontWeight: 900, 
                            px: 4,
                            bgcolor: '#0f172a',
                            '&:hover': { bgcolor: '#1e293b' }
                        }}
                    >
                        {passLoading ? 'Updating...' : 'Set New Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
