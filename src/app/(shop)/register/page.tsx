'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  Stack,
  alpha,
  Divider,
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  ShoppingBag as LogoIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Storefront as StoreIcon,
  LocationOn as AddressIcon,
  DeliveryDining as DeliveryIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    user_name: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    shop_name: '',
    owner_name: '',
    address: '',
    vehicleType: 'bike',
    vehicleNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (['user', 'delivery'].includes(role)) {
      if (!formData.name.trim() || formData.name.length < 3) {
        newErrors.name = 'Full name must be at least 3 characters';
        isValid = false;
      }
    }

    if (!formData.user_name.trim() || formData.user_name.length < 4) {
      newErrors.user_name = 'Username must be at least 4 characters';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters';
      isValid = false;
    }

    if (role === 'seller') {
      if (!formData.shop_name.trim()) {
        newErrors.shop_name = 'Shop name is required';
        isValid = false;
      }
      if (!formData.owner_name.trim()) {
        newErrors.owner_name = 'Owner name is required';
        isValid = false;
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Shop address is required';
        isValid = false;
      }
    }

    if (role === 'delivery') {
      if (!formData.vehicleNumber.trim()) {
        newErrors.vehicleNumber = 'Vehicle number is required';
        isValid = false;
      }
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    // Construct precise payload based on role to match backend models
    const payload: any = {
      role,
      user_name: formData.user_name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    };

    if (role === 'user') {
      payload.name = formData.name;
    } else if (role === 'seller') {
      payload.shop_name = formData.shop_name;
      payload.owner_name = formData.owner_name;
      payload.address = formData.address;
    } else if (role === 'delivery') {
      payload.name = formData.name;
      payload.vehicleType = formData.vehicleType;
      payload.vehicleNumber = formData.vehicleNumber;
    }

    try {
      await api.post('/auth/register', payload);
      const loginRes = await api.post('/auth/login', {
        identifier: formData.email,
        password: formData.password,
        role: role
      });
      login(loginRes.data);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  return (
    <Grid container component="main" sx={{ minHeight: '100vh', mt: -8, mb: -5, ml: -5, width: 'calc(100% + 40px)' }}>
      <Grid
        size={{ xs: 0, sm: 4, md: 6 }}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: 'linear-gradient(rgba(12, 131, 31, 0.8), rgba(12, 131, 31, 0.8)), url(/login_side_background_1773142649985.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          p: 8,
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>Join the Evolution</Typography>
        <Typography variant="h5" sx={{ fontWeight: 600, maxWidth: 500, opacity: 0.9 }}>
          Deliver freshness to your neighborhood or grow your business as a Flash Merchant.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 8, md: 6 }} component={Paper} elevation={0} square sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#fdfdfd' }}>
        <Container maxWidth="sm" sx={{ my: 'auto', py: 8 }}>
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 2, display: 'flex' }}>
                <LogoIcon />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>FlashBasket</Typography>
            </Stack>

            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Create Account</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Start your journey with India's fastest delivery network
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', mb: 1, display: 'block' }}>ACCOUNT TYPE</Typography>
                <Stack direction="row" spacing={2}>
                  {['user', 'seller', 'delivery'].map((r) => (
                    <Button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setError('');
                        setFieldErrors({});
                      }}
                      variant={role === r ? 'contained' : 'outlined'}
                      fullWidth
                      sx={{
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 900,
                        textTransform: 'capitalize',
                        bgcolor: role === r ? 'primary.main' : 'transparent',
                        color: role === r ? 'white' : 'text.secondary',
                        borderColor: role === r ? 'primary.main' : '#e2e8f0',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: role === r ? 'primary.dark' : alpha('#0C831F', 0.05)
                        }
                      }}
                    >
                      {r}
                    </Button>
                  ))}
                </Stack>
              </Grid>

              {/* Shared Base Fields */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Username"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  error={!!fieldErrors.user_name}
                  helperText={fieldErrors.user_name}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment>,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment>,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment>,
                  }}
                />
              </Grid>

              {/* USER Fields */}
              {role === 'user' && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    required
                    label="Full Name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                  />
                </Grid>
              )}

              {/* SELLER Fields */}
              {role === 'seller' && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', px: 2 }}>SHOP DETAILS</Typography>
                    </Divider>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Shop Name"
                      name="shop_name"
                      placeholder="e.g. Madhav Fresh Mart"
                      value={formData.shop_name}
                      onChange={handleChange}
                      error={!!fieldErrors.shop_name}
                      helperText={fieldErrors.shop_name}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><StoreIcon fontSize="small" /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Owner Name"
                      name="owner_name"
                      placeholder="Enter shop owner name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      error={!!fieldErrors.owner_name}
                      helperText={fieldErrors.owner_name}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={2}
                      label="Shop Address"
                      name="address"
                      placeholder="Enter complete shop location"
                      value={formData.address}
                      onChange={handleChange}
                      error={!!fieldErrors.address}
                      helperText={fieldErrors.address}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><AddressIcon fontSize="small" /></InputAdornment>,
                      }}
                    />
                  </Grid>
                </>
              )}

              {/* DELIVERY Fields */}
              {role === 'delivery' && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!fieldErrors.name}
                      helperText={fieldErrors.name}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', px: 2 }}>VEHICLE DETAILS</Typography>
                    </Divider>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Vehicle Type"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                    >
                      <MenuItem value="bike">Bike</MenuItem>
                      <MenuItem value="scooter">Scooter</MenuItem>
                      <MenuItem value="bicycle">Bicycle</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required
                      label="Vehicle Number"
                      name="vehicleNumber"
                      placeholder="e.g. GJ 05 XX 1234"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      error={!!fieldErrors.vehicleNumber}
                      helperText={fieldErrors.vehicleNumber}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><DeliveryIcon fontSize="small" /></InputAdornment>,
                      }}
                    />
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 2,
                    mt: 2,
                    borderRadius: 4,
                    fontWeight: 900,
                    fontSize: '1rem',
                    boxShadow: '0 8px 24px rgba(12, 131, 31, 0.2)'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#0C831F', fontWeight: 900, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Container>

        <Box sx={{ p: 4, mt: 'auto', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            © {new Date().getFullYear()} FlashBasket. Precision Delivery Network.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
