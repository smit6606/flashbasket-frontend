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
  Skeleton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useCart } from '@/context/CartContext';
import { GridSkeleton } from '@/components/mui/SkeletonLoaders';
import LoadingButton from '@/components/mui/LoadingButton';

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
  const { user, token, loading: authLoading } = useAuth();
  const { cartItems, refreshCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [cartLoading, setCartLoading] = useState(true);
  const [cartData, setCartData] = useState<{ 
    items: any[]; 
    itemTotal: string;
    handlingFee: string;
    deliveryFee: string;
    totalAmount: string;
    totalSavings: string;
    promoDiscount?: string;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for hydration!

    if (!token) {
        setCartLoading(false);
        return;
    }

    const fetchCart = async () => {
      try {
        const response = await api.get(`/cart?t=${Date.now()}`);
        setCartData(response.data);
      } catch (err) {
        console.error('Failed to fetch cart', err);
      } finally {
        setCartLoading(false);
      }
    };
    fetchCart();
  }, [token, authLoading]);

  const handleUpdateQuantity = async (cartItemId: number, productId: number, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity, cartItemId);
      if (token) {
          const response = await api.get('/cart');
          setCartData(response.data);
      }
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (cartItemId: number, productId: number) => {
    try {
      await removeFromCart(productId, cartItemId);
      if (token) {
          const response = await api.get(`/cart?t=${Date.now()}`);
          setCartData(response.data);
      }
      toast.info('Item Removed');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (authLoading || cartLoading) return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 4 }} />
        <Grid container spacing={8}>
            <Grid size={{ xs: 12, md: 7.5 }}>
                <GridSkeleton count={2} type="order" />
            </Grid>
            <Grid size={{ xs: 12, md: 4.5 }}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
            </Grid>
        </Grid>
    </Container>
  );

  // Requirement: If not logged in, show Login Access Section
  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ py: 15, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ 
            p: 8, 
            borderRadius: '32px', 
            border: '1px solid #e2e8f0', 
            bgcolor: '#fff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: alpha('#0C831F', 0.1), 
              borderRadius: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 4
          }}>
            <CartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.02em' }}>
            Login to access your cart
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mb: 6, lineHeight: 1.6 }}>
            Please login to view and manage your cart items. We'll keep your fresh picks safe!
          </Typography>
          <LoadingButton
            variant="contained"
            size="large"
            fullWidth
            onClick={() => router.push('/login?callbackUrl=/cart')}
            sx={{ 
                py: 2, 
                borderRadius: '16px', 
                fontWeight: 900, 
                fontSize: '1.1rem',
                boxShadow: '0 12px 24px rgba(12, 131, 31, 0.2)'
            }}
          >
            Login to Continue
          </LoadingButton>
          <Button
            variant="text"
            onClick={() => router.push('/products')}
            sx={{ mt: 3, fontWeight: 800, color: 'text.secondary', textTransform: 'none' }}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  // Requirement: If logged in but empty
  if (!cartData || cartData.items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 15, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: 8, borderRadius: 4, border: '2px dashed #e2e8f0', bgcolor: 'transparent' }}>
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
            onClick={() => router.push('/products')}
            startIcon={<BagIcon />}
            sx={{ px: 6, py: 1.5, borderRadius: 1.5, fontWeight: 900 }}
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
          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary' }}>{cartData.items.length} ITEMS</Typography>
        </Box>
      </Stack>

      <Grid container spacing={8}>
        {/* Cart Items */}
        <Grid size={{ xs: 12, md: 7.5 }}>
          <Stack spacing={3}>
            <AnimatePresence mode="popLayout">
              {cartData.items.map((item: any) => (
                <MuiCartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(id: number, qty: number) => handleUpdateQuantity(id, item.productId, qty)}
                  onRemove={(id: number) => handleRemoveItem(id, item.productId)}
                />
              ))}
            </AnimatePresence>
          </Stack>

          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push('/products')}
            sx={{ mt: 5, fontWeight: 800, color: 'text.secondary' }}
          >
            Continue Shopping
          </Button>
        </Grid>

        {/* Summary */}
        <Grid size={{ xs: 12, md: 4.5 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MuiCartSummary
              itemTotal={cartData.itemTotal}
              handlingFee={cartData.handlingFee}
              deliveryFee={cartData.deliveryFee}
              totalAmount={cartData.totalAmount}
              totalSavings={cartData.totalSavings}
              promoDiscount={cartData.promoDiscount}
              onCheckout={handleCheckout}
              disabled={cartData.items.some(item => !item.isAvailable)}
            />
            {cartData.items.some(item => !item.isAvailable) && (
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 800, mt: 2, display: 'block', textAlign: 'center' }}>
                Remove unavailable items to proceed with checkout
              </Typography>
            )}
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}

