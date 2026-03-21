'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Container,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthSplitScreenProps {
  initialMode: 'login' | 'register';
}

export default function AuthSplitScreen({ initialMode }: AuthSplitScreenProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') router.replace('/admin');
      else if (user.role === 'seller') router.replace('/seller');
      else if (user.role === 'delivery') router.replace('/delivery');
      else router.replace('/');
    }
  }, [user, authLoading, router]);

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    window.history.replaceState(null, '', `/${newMode}`);
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
        {/* Left Side: Static Image/Branding */}
        <Grid
          size={{ xs: 0, sm: 4, md: 6 }}
          component={motion.div}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            position: 'relative',
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
              Welcome to FlashBasket
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, opacity: 0.9 }}>
              Order from local shops and get it delivered in 11 minutes.
            </Typography>
          </Box>
        </Grid>

        {/* Right Side: Dynamic Form Section */}
        <Grid size={{ xs: 12, sm: 8, md: 6 }} component={Paper} elevation={0} square sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box
            sx={{
              my: { xs: 4, md: 8 },
              mx: { xs: 3, md: 10 },
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <LoginForm key="login" onToggle={toggleMode} />
              ) : (
                <RegisterForm key="register" onToggle={toggleMode} />
              )}
            </AnimatePresence>
          </Box>

          <Box sx={{ mt: 'auto', p: 4, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              © {new Date().getFullYear()} FlashBasket. Precision Delivery Network.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
