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
import { motion, AnimatePresence } from 'framer-motion';
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
import { toast } from 'react-toastify';
import LoadingButton from '@/components/mui/LoadingButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { normalizePhoneForBackend, isValidPhone } from '@/lib/phoneUtils';

export default function RegisterPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') router.replace('/admin');
      else if (user.role === 'seller') router.replace('/seller');
      else if (user.role === 'delivery') router.replace('/delivery');
      else router.replace('/');
    }
  }, [user, authLoading, router]);

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

    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
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
      phone: normalizePhoneForBackend(formData.phone),
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
      setLoading(true);
      await api.post('/auth/register', payload);
      toast.success(`Registration successful! Please login to continue.`);
      router.push('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg, { toastId: 'register-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    // For phone number field, allow only digits and limit to 10
    if (name === 'phone') {
      value = value.replace(/[^\d]/g, '').slice(0, 10);
    }

    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 2, md: 8 }, 
      display: 'flex', 
      flexGrow: 1, 
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <Grid container component="main" sx={{ 
        width: '100%', 
        minHeight: { xs: 'auto', md: '75vh' }, 
        borderRadius: { xs: '16px', md: '24px' }, 
        overflow: 'hidden', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)', 
        border: '1px solid #f1f5f9' 
      }}>
      <Grid
        size={{ xs: 0, sm: 4, md: 6 }}
        component={motion.div}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
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
          </motion.div>

          {/* Toasts handle feedback, removed static alert for cleaner UI */}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', mb: 1, display: 'block' }}>ACCOUNT TYPE</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                  id="reg-user_name"
                  label="Username"
                  name="user_name"
                  autoComplete="username"
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
                  id="reg-phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', borderRight: '1px solid #e2e8f0', pr: 1.5 }}>
                            +91
                          </Typography>
                        </Stack>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  id="reg-email"
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
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
                    id="reg-name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
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
                  id="reg-password"
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={loading}
                  loadingText="Creating Account..."
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 900,
                    fontSize: '1rem',
                    bgcolor: 'primary.main',
                    boxShadow: '0 8px 16px rgba(12, 131, 31, 0.2)',
                  }}
                >
                  Create Account
                </LoadingButton>
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
    </Container>
  );
}
