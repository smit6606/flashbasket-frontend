'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Paper,
  alpha,
} from '@mui/material';
import {
  ShoppingCartOutlined as CartIcon,
  ArrowBack as BackIcon,
  ShoppingBag as BagIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MuiCartItem from '@/components/mui/MuiCartItem';
import MuiCartSummary from '@/components/mui/MuiCartSummary';
import { toast } from 'react-toastify';

interface CartItemType {
  id: number;
  quantity: number;
  price: string;
  itemTotal: string;
  Product: {
    productName: string;
    images: string[];
  };
  Seller: {
    shop_name: string;
  };
}

export default function CartPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItemType[]; subtotal: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await api.get('/cart');
        setCart(response.data);
      } catch (err) {
        console.error('Failed to fetch cart', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [token, router]);

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await api.put('/cart/update', { cartItemId, quantity: newQuantity });
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await api.post('/cart/remove', { cartItemId });
      const response = await api.get('/cart');
      setCart(response.data);
      toast.info('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 15, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: 8, borderRadius: 8, border: '2px dashed #e2e8f0', bgcolor: 'transparent' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
            <Box sx={{ position: 'absolute', inset: -20, bgcolor: alpha('#0C831F', 0.05), borderRadius: '50%', zIndex: 0 }} />
            <CartIcon sx={{ fontSize: 80, color: 'primary.main', position: 'relative', zIndex: 1 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Cart is empty</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mb: 6, px: 4 }}>
            It's a bit lonely here. Add some fresh products and fill it with joy!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/')}
            startIcon={<BagIcon />}
            sx={{ px: 6, py: 1.5, borderRadius: 3, fontWeight: 900 }}
          >
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 900 }}>Your Cart</Typography>
        <Box sx={{ px: 2, py: 0.5, bgcolor: '#f1f5f9', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary' }}>{cart.items.length} ITEMS</Typography>
        </Box>
      </Stack>

      <Grid container spacing={8}>
        {/* Cart Items */}
        <Grid size={{ xs: 12, md: 7.5 }}>
          <Stack spacing={3}>
            {cart.items.map((item) => (
              <MuiCartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </Stack>

          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push('/')}
            sx={{ mt: 5, fontWeight: 800, color: 'text.secondary' }}
          >
            Continue Shopping
          </Button>
        </Grid>

        {/* Summary */}
        <Grid size={{ xs: 12, md: 4.5 }}>
          <MuiCartSummary
            subtotal={cart.subtotal}
            onCheckout={handleCheckout}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

