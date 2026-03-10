'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Skeleton,
  alpha,
  Paper,
  IconButton,
  Card,
  Chip,
} from '@mui/material';
import {
  ChevronRight as RightIcon,
  LocalOffer as TagIcon,
  AccessTime as TimeIcon,
  Storefront as StoreIcon,
  ShoppingBag as LogoIcon,
  FlashOn as FlashIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import ProductCard from '@/components/mui/ProductCard';
import Link from 'next/link';

interface Product {
  id: number;
  productName: string;
  price: string;
  images: string[];
  unit: string;
  Seller: {
    id: number;
    shop_name: string;
  };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Vegetables', icon: '🥕', color: '#E8F5E9' },
    { name: 'Fruits', icon: '🍎', color: '#FFF3E0' },
    { name: 'Dairy & Bread', icon: '🍞', color: '#E3F2FD' },
    { name: 'Snacks', icon: '🍪', color: '#FCE4EC' },
    { name: 'Beverages', icon: '🥤', color: '#F3E5F5' },
    { name: 'Meat', icon: '🥩', color: '#EFEBE9' },
    { name: 'Cleaning', icon: '🧴', color: '#F1F8E9' },
    { name: 'Pharmacy', icon: '⚕️', color: '#FFEBEE' },
  ];

  return (
    <Box sx={{ py: 1 }}>
      {/* Hero / Banner Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 10,
          borderRadius: 10,
          overflow: 'hidden',
          bgcolor: '#0C831F',
          backgroundImage: 'linear-gradient(135deg, #0C831F 0%, #064e3b 100%)',
          position: 'relative',
          minHeight: { xs: 350, md: 500 },
          display: 'flex',
          alignItems: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Abstract shapes for premium feel */}
        <Box sx={{ position: 'absolute', right: '-10%', top: '-20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', left: '20%', bottom: '-10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={4} alignItems="flex-start">
                <Chip
                  icon={<FlashIcon sx={{ color: '#FFD700 !important', fontSize: 16 }} />}
                  label="DELIVERED IN 11 MINUTES"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontWeight: 900,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    px: 1
                  }}
                />

                <Typography variant="h1" sx={{
                  color: 'white',
                  fontSize: { xs: '2.5rem', md: '4.5rem' },
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: '-0.03em'
                }}>
                  Fresh items <br /> directly from <br /> <span style={{ color: '#FFD700' }}>Local Shops.</span>
                </Typography>

                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, maxWidth: 500 }}>
                  Why wait for hours? Get your groceries, essentials and more delivered from your favorite neighborhood stores in minutes.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/categories/Vegetables"
                  sx={{
                    bgcolor: 'white',
                    color: '#0C831F',
                    fontWeight: 900,
                    px: 6,
                    py: 2.5,
                    fontSize: '1.1rem',
                    borderRadius: 5,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s'
                  }}
                >
                  Start Shopping
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 0, md: 5 }} sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
              <Box sx={{
                width: '120%',
                height: 500,
                borderRadius: 10,
                overflow: 'hidden',
                transform: 'rotate(2deg)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                border: '8px solid white'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
                  alt="FlashBasket Fresh"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Categories Grid */}
      <Box sx={{ mb: 12 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Quick <span style={{ color: '#0C831F' }}>Categories</span></Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700, mt: 1 }}>Explore our wide range of fresh collections</Typography>
          </Box>
          <Button endIcon={<RightIcon />} sx={{ fontWeight: 900, color: 'primary.main' }}>View All</Button>
        </Stack>

        <Grid container spacing={4}>
          {categories.map((cat, i) => (
            <Grid size={{ xs: 3, sm: 2, md: 1.5 }} key={i}>
              <Box
                component={Link}
                href={`/categories/${cat.name}`}
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    '& .cat-icon': { transform: 'translateY(-8px) scale(1.05)', boxShadow: `0 20px 30px ${alpha(cat.color, 0.4)}` }
                  }
                }}
              >
                <Box
                  className="cat-icon"
                  sx={{
                    width: '100%',
                    aspectRatio: '1/1',
                    bgcolor: cat.color,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '2rem', md: '3rem' },
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid transparent',
                    boxShadow: '0 8px 15px rgba(0,0,0,0.03)'
                  }}
                >
                  {cat.icon}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', textAlign: 'center', fontSize: '0.85rem' }}>
                  {cat.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Products */}
      <Box sx={{ mb: 12 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Flash <span style={{ color: '#0C831F' }}>Bestsellers</span></Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700, mt: 1 }}>Highest rated items by our community</Typography>
          </Box>
          <Button component={Link} href="/products" endIcon={<RightIcon />} sx={{ fontWeight: 900 }}>See All Products</Button>
        </Stack>

        <Grid container spacing={4}>
          {loading ? (
            [...Array(10)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} key={i}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 8 }} />
              </Grid>
            ))
          ) : (
            products.slice(0, 10).map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.4 }} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Trust & Support Section */}
      <Paper elevation={0} sx={{
        p: { xs: 4, md: 8 },
        borderRadius: 10,
        bgcolor: '#f8fafc',
        border: '1px solid #f1f5f9',
        mb: 6
      }}>
        <Grid container spacing={6}>
          {[
            { title: 'Superfast Delivery', desc: 'Get your items in 11 minutes at your doorstep.', icon: <TimeIcon sx={{ fontSize: 30 }} />, color: '#0C831F' },
            { title: 'Neighborhood Shops', desc: 'Supporting your local vendors and merchants.', icon: <StoreIcon sx={{ fontSize: 30 }} />, color: '#2196f3' },
            { title: 'Best Prices', desc: 'We ensure you get the best deals and offers.', icon: <TagIcon sx={{ fontSize: 30 }} />, color: '#ff9800' },
            { title: 'Quality Check', desc: 'Every item is handpicked and quality verified.', icon: <LogoIcon sx={{ fontSize: 30 }} />, color: '#9c27b0' },
          ].map((feature, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Stack spacing={2} alignItems="flex-start">
                <Box sx={{
                  p: 2,
                  borderRadius: 4,
                  bgcolor: alpha(feature.color, 0.1),
                  color: feature.color,
                  display: 'flex'
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>{feature.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.6 }}>{feature.desc}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
