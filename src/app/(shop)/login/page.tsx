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
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  ShoppingBag as LogoIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
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

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      login(response.data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 }, display: 'flex', flexGrow: 1 }}>
      <Grid container component="main" sx={{ width: '100%', minHeight: '75vh', borderRadius: 6, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
      {/* Left Side: Image/Branding */}
      <Grid
        size={{ xs: 0, sm: 4, md: 6 }}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          backgroundImage: 'url(/login_side_background_1773142649985.png)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 8,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(12, 131, 31, 0.4)',
            backdropFilter: 'blur(2px)',
          }
        }}
      >
        <Box sx={{ zIndex: 1, color: 'white', textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            Freshness. Fast.
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, opacity: 0.9 }}>
            Order from local shops and get it delivered in 11 minutes.
          </Typography>
        </Box>
      </Grid>

      {/* Right Side: Login Form */}
      <Grid size={{ xs: 12, sm: 8, md: 6 }} component={Paper} elevation={0} square sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box
          sx={{
            my: 8,
            mx: { xs: 4, md: 10 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                px: 1,
                py: 1,
                borderRadius: 2,
                display: 'flex',
              }}
            >
              <LogoIcon fontSize="medium" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', tracking: '-0.02em' }}>
              FlashBasket
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, tracking: '-0.02em' }}>
            Welcome back
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mb: 4 }}>
            Please enter your details to sign in
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 3, fontWeight: 700 }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Stack spacing={3}>
              <TextField
                select
                label="Account Type"
                name="role"
                value={formData.role}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="user">Customer</MenuItem>
                <MenuItem value="seller">Seller / Merchant</MenuItem>
                <MenuItem value="delivery">Delivery Partner</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>

              <TextField
                required
                fullWidth
                label="Email or Phone Number"
                name="identifier"
                autoComplete="email"
                autoFocus
                value={formData.identifier}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Forgot Password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 4,
                mb: 2,
                py: 2,
                bgcolor: 'primary.main',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: 4,
                boxShadow: '0 8px 16px rgba(12, 131, 31, 0.2)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Link href="/register" style={{ color: '#0C831F', fontWeight: 800, textDecoration: 'none' }}>
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 'auto', p: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            © {new Date().getFullYear()} FlashBasket Technologies. All rights reserved.
          </Typography>
        </Box>
      </Grid>
      </Grid>
    </Container>
  );
}
