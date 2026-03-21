'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  MenuItem,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  ShoppingBag as LogoIcon,
} from '@mui/icons-material';
import LoadingButton from '@/components/mui/LoadingButton';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalizePhoneForBackend } from '@/lib/phoneUtils';

interface LoginFormProps {
  onToggle: () => void;
}

export default function LoginForm({ onToggle }: LoginFormProps) {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams ? searchParams.get('callbackUrl') : null;

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.identifier.trim()) {
      toast.warning('Email or Phone Number is required');
      return;
    }
    if (!formData.password) {
      toast.warning('Password is required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        identifier: !formData.identifier.includes('@') && /^\d+$/.test(formData.identifier.replace(/[^\d]/g, ''))
          ? normalizePhoneForBackend(formData.identifier)
          : formData.identifier
      };
      
      const response = await api.post('/auth/login', payload);
      const { user } = response.data;
      login(response.data);
      toast.success(`Welcome back, ${user.user_name || user.name}!`);

      if (callbackUrl) {
        router.replace(callbackUrl);
      } else {
        if (user.role === 'admin') router.replace('/admin');
        else if (user.role === 'seller') router.replace('/seller');
        else if (user.role === 'delivery') router.replace('/delivery');
        else router.replace('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg, { toastId: 'login-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
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
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
            FlashBasket
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
          Welcome back
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mb: 4 }}>
          Please enter your details to sign in
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Stack spacing={3}>
            <TextField
              select
              id="login-role"
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
              id="login-identifier"
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
              id="login-password"
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

          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            loading={loading}
            loadingText="Signing In..."
            sx={{
              mt: 4,
              mb: 2,
              py: 2,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 900,
              borderRadius: '16px',
              boxShadow: '0 8px 16px rgba(12, 131, 31, 0.2)',
            }}
          >
            Sign In
          </LoadingButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Typography
                component="span"
                onClick={onToggle}
                sx={{
                  color: '#0C831F',
                  fontWeight: 800,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Create an account
              </Typography>
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}
