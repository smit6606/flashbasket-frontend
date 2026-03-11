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
  Avatar,
  Rating,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ChevronRight as RightIcon,
  LocalOffer as TagIcon,
  AccessTime as TimeIcon,
  Storefront as StoreIcon,
  ShoppingBag as LogoIcon,
  FlashOn as FlashIcon,
  CheckCircleOutline as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  MyLocation as LocationIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import ProductCard from '@/components/mui/ProductCard';
import Link from 'next/link';

interface Product {
  id: number;
  productName: string;
  price: string;
  stock: number;
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
  const [expanded, setExpanded] = useState<number | false>(false);

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
    <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 5 }, pb: 8 }}>
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

      {/* Near You Discovery Section */}
      <Box sx={{ mb: 12 }}>
        <Paper elevation={0} sx={{ 
          p: { xs: 4, md: 6 }, 
          borderRadius: 8, 
          bgcolor: alpha('#E8F5E9', 0.5), 
          border: '1px solid #C8E6C9',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 4,
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0C831F', mb: 1 }}>Hungry for <span style={{ color: '#0f172a' }}>Local Freshness?</span></Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700 }}>Enable location to discover verified neighborhood stores delivering in minutes.</Typography>
          </Box>
          <Button 
            variant="contained" 
            component={Link}
            href="/sellers"
            startIcon={<LocationIcon />}
            sx={{ 
              borderRadius: 4, 
              px: 4, 
              py: 1.5, 
              fontWeight: 900,
              bgcolor: '#0C831F',
              boxShadow: '0 10px 20px rgba(12, 131, 31, 0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            Detect My Location
          </Button>
        </Paper>
      </Box>

      {/* Categories Grid */}
      <Box sx={{ mb: 12 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>Quick <span style={{ color: '#0C831F' }}>Categories</span></Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700, mt: 1 }}>Explore our wide range of fresh collections</Typography>
          </Box>
          <Button component={Link} href="/categories" endIcon={<RightIcon />} sx={{ fontWeight: 900, color: 'primary.main' }}>View All</Button>
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

      {/* Customer Reviews Section */}
      <Box sx={{ mb: 12 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', textAlign: 'center' }}>
          See What Our Customers <span style={{ color: '#0C831F' }}>Are Saying</span>
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mb: 6, textAlign: 'center' }}>
          Real feedback from verified shoppers
        </Typography>
        <Grid container spacing={4}>
          {[
            { name: "Rahul Sharma", text: "Unbelievably fast delivery. Tomatoes were fresh as promised. The app is so smooth. Will definitely be ordering my groceries from here every day!", rating: 5, avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
            { name: "Priya Desai", text: "Great variety of local shops. It feels like buying directly from the market. Love the 11 minutes delivery promise. Saves me so much time in the mornings.", rating: 5, avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
            { name: "Amit Singh", text: "The premium membership is an absolute steal! Free delivery pays for itself in less than a week. Highly recommended for people who order frequently.", rating: 5, avatar: "https://randomuser.me/api/portraits/men/45.jpg" }
          ].map((review, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                <Avatar src={review.avatar} alt={review.name} sx={{ width: 72, height: 72, mx: 'auto', mb: 2, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
                <Rating value={review.rating} readOnly sx={{ mb: 2, color: '#FFD700' }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'slate.800', fontStyle: 'italic', mb: 2 }}>
                  "{review.text}"
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                  {review.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Premium Membership Section */}
      <Box sx={{ mb: 12 }}>
        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 8, bgcolor: '#0f172a', color: 'white', overflow: 'hidden', position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: '-20%', right: '-10%', width: 300, height: 300, bgcolor: 'primary.main', filter: 'blur(100px)', opacity: 0.3, borderRadius: '50%' }} />
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                The Affordable <span style={{ color: '#FFD700' }}>Unfair Advantage</span>
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, mb: 4 }}>
                Join FlashPremium and never pay delivery fees again. Plus, get priority support and exclusive discounts.
              </Typography>
              <Stack spacing={2} sx={{ mb: 4 }}>
                {['Unlimited Free Delivery', 'Faster Delivery Priority', 'Exclusive Member Discounts', '24/7 Priority Support'].map((benefit, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckIcon sx={{ color: '#10b981' }} />
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{benefit}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button variant="contained" sx={{ bgcolor: '#FFD700', color: '#0f172a', fontWeight: 900, px: 5, py: 1.5, borderRadius: 3, '&:hover': { bgcolor: '#facc15' } }}>
                Join FlashPremium - ₹299/mo
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, textAlign: 'center' }}>Plan Comparison</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800 }}>Feature</Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800 }}>Free</Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 900 }}>Premium</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}><Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} /></Grid>
                  
                  {/* Rows */}
                  <Grid size={{ xs: 4 }}><Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>Delivery Fee</Typography></Grid>
                  <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}><Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>₹25</Typography></Grid>
                  <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}><Typography variant="body2" sx={{ fontWeight: 900, color: '#10b981' }}>FREE</Typography></Grid>

                  <Grid size={{ xs: 4 }}><Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>Priority Support</Typography></Grid>
                  <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}><Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>No</Typography></Grid>
                  <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}><Typography variant="body2" sx={{ fontWeight: 900, color: '#10b981' }}>Yes</Typography></Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ mb: 12 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 6, textAlign: 'center', letterSpacing: '-0.02em' }}>
          Frequently Asked <span style={{ color: '#0C831F' }}>Questions</span>
        </Typography>
        <Box sx={{ width: '100%' }}>
          {[
            { q: "How long does delivery take?", a: "We guarantee delivery within 11 minutes for our primary zones. Deliveries outside these zones may take up to 25 minutes depending on distance and traffic." },
            { q: "How can I track my order?", a: "Once your order is confirmed, you will see a live tracking screen on your app and receive SMS updates at each step." },
            { q: "Can I cancel my order?", a: "You can cancel your order within 60 seconds of placing it. Once it enters the 'Preparing' phase, cancellation is not possible." },
            { q: "What payment methods are supported?", a: "We support Credit/Debit Cards, UPI, NetBanking, and Cash on Delivery (COD)." },
          ].map((faq, i) => (
            <Accordion 
              key={i} 
              expanded={expanded === i}
              onChange={(_, isExpanded) => setExpanded(isExpanded ? i : false)}
              elevation={0} 
              sx={{ mb: 2, borderRadius: 3, border: '1px solid #f1f5f9', '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.75rem' }}/>} sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', md: '1.2rem' } }}>{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 3, md: 4 }, pb: { xs: 3, md: 4 }, pt: 0 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.6 }}>{faq.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>


    </Box>
    </Container>
  );
}
