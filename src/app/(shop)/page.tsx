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
import { motion, AnimatePresence } from 'framer-motion';
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
  FiberManualRecord as DotIcon,
  ChevronLeft as LeftIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRef } from 'react';
import ProductCard from '@/components/mui/ProductCard';
import PromoBanner from '@/components/mui/PromoBanner';
import { useCart } from '@/context/CartContext';
import { AddShoppingCart as CartAddIcon, ShoppingBag as BagIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GridSkeleton } from '@/components/mui/SkeletonLoaders';
import LoadingButton from '@/components/mui/LoadingButton';

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

const GalleryProductCard = ({ product }: { product: any }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addToCart(product, 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 5,
        overflow: 'hidden',
        aspectRatio: '1/1',
        border: '1px solid #f1f5f9',
        bgcolor: 'white',
        cursor: 'pointer',
        '&:hover .hover-overlay': { opacity: 1 },
        '&:hover .hover-content': { transform: 'translateY(0)', opacity: 1 },
        '&:hover img': { transform: 'scale(1.15)' },
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        transition: 'all 0.4s ease'
      }}
      onClick={() => router.push(`/products/${product.id}`)}
    >
      <img
        src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
        alt={product.productName}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)',
        }}
      />
      
      {/* Premium Gradient Overlay */}
      <Box
        className="hover-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
          opacity: 0,
          transition: 'opacity 0.5s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />

      {/* Interaction Content */}
      <Box
        className="hover-content"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: 0,
          transform: 'translateY(20px)',
          transition: 'all 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
          pointerEvents: 'none',
          '& > *': { pointerEvents: 'auto' }
        }}
      >
        <LoadingButton
          variant="contained"
          size="medium"
          onClick={handleAddToCart}
          loading={isAdding}
          loadingText="Adding..."
          startIcon={!isAdding ? <CartAddIcon /> : null}
          sx={{
            borderRadius: '50px',
            px: 4,
            py: 1.2,
            fontWeight: 900,
            bgcolor: 'white',
            color: 'primary.main',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'white',
              transform: 'scale(1.05)',
            },
            '&:active': { transform: 'scale(0.95)' },
            textTransform: 'none',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s ease'
          }}
        >
          Add to Cart
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newlyAddedProducts, setNewlyAddedProducts] = useState<Product[]>([]);
  const [ourProducts, setOurProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; icon: string; image: string }[]>([]);
  const [loading, setLoading] = useState({ trending: true, newly: true, cat: true, our: true });
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  // Refs and Matchers
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const isBelow1059 = useMediaQuery('(max-width:1059px)');
  const isBelow973 = useMediaQuery('(max-width:973px)');
  const isBelow900 = useMediaQuery('(max-width:900px)');
  const isBelow425 = useMediaQuery('(max-width:425px)');
  const isBelow375 = useMediaQuery('(max-width:375px)');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/products?trending=true&limit=20');
        setTrendingProducts(res.data.items || []);
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({ ...prev, trending: false })); }
    };

    const fetchNewlyAdded = async () => {
      try {
        const res = await api.get('/products?section=newly-added&limit=5');
        setNewlyAddedProducts(res.data.items || []);
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({ ...prev, newly: false })); }
    };

    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories?limit=50');
        setCategories(res.data.items || []);
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({ ...prev, cat: false })); }
    };

    const fetchOurProducts = async () => {
      try {
        const res = await api.get('/products?limit=10&sortBy=id&sortOrder=DESC');
        setOurProducts(res.data.items || []);
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({ ...prev, our: false })); }
    };

    fetchTrending();
    fetchNewlyAdded();
    fetchCategories();
    fetchOurProducts();
  }, []);

  const handleScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 600;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Dynamic image logic removed, using database static images

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 0 }}>
      {/* Hero Section - Layered & Modern */}
      <Box
        sx={{
          pt: { xs: 4, md: 8 },
          pb: { xs: 8, md: 12 },
          bgcolor: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }} textAlign={{ xs: 'center', md: 'left' }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <Chip
                    label="11-MINUTE DELIVERY"
                    color="primary"
                    icon={<FlashIcon sx={{ fontSize: '1rem !important' }} />}
                    sx={{
                      fontWeight: 900,
                      px: 1,
                      height: 32,
                      borderRadius: 1.5,
                      boxShadow: '0 4px 12px rgba(12, 131, 31, 0.2)',
                      fontSize: isBelow1059 ? '0.75rem' : '0.8125rem',
                      mb: { xs: 1, md: 0 }
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', sm: '3.5rem', lg: '4.5rem' }, lineHeight: 1 }}>
                    Get anything in <br />
                    <span style={{ color: '#0C831F' }}>Flash speed.</span>
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: 500, fontWeight: 600, lineHeight: 1.6 }}>
                    Order fresh groceries, daily essentials, and pharmacy items from your favorite local shops.
                  </Typography>
                </motion.div>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: isBelow375 ? '100%' : 'auto' }}>
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      href="/products"
                      className="btn-premium"
                      sx={{
                        borderRadius: '16px',
                        px: isBelow1059 ? 4 : 6,
                        py: 2,
                        fontWeight: 900,
                        boxShadow: '0 12px 24px rgba(12, 131, 31, 0.2)',
                        fontSize: isBelow1059 ? '0.9rem' : '1.1rem',
                        whiteSpace: 'nowrap',
                        width: '100%'
                      }}
                    >
                      Start Shopping
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: isBelow375 ? '100%' : 'auto' }}>
                    <Button
                      variant="outlined"
                      size="large"
                      component={Link}
                      href="/sellers"
                      startIcon={<LocationIcon />}
                      className="hover-lift"
                      sx={{
                        py: 2,
                        px: isBelow1059 ? 3 : 5,
                        borderRadius: 1.5,
                        fontSize: isBelow1059 ? '0.9rem' : '1.1rem',
                        borderColor: '#e2e8f0',
                        color: 'text.primary',
                        '&:hover': { bgcolor: 'primary.light' },
                        whiteSpace: 'nowrap',
                        width: '100%'
                      }}
                    >
                      Stores Near Me
                    </Button>
                  </motion.div>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: 'relative' }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                  style={{ position: 'relative' }}
                >
                  <Box sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 2,
                    bgcolor: '#f1f5f9',
                    mx: 'auto',
                    maxWidth: { xs: '100%', sm: '80%', md: '100%' }
                  }}>
                    <img
                      src="/flashbasket_hero_banner_1773312465652.png"
                      alt="Lightning Fast Delivery"
                      style={{ width: '100%', height: isBelow900 ? '250px' : 'auto', display: 'block', objectFit: 'cover' }}
                    />
                  </Box>
                </motion.div>
                {/* Decorative floating badges */}
                <Paper
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    p: 3,
                    borderRadius: 2.5,
                    zIndex: 3,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    display: { xs: 'none', lg: 'block' }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                      <CheckIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>Order Delivered!</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>9 mins ago to Mumbai Central</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust Bar */}
      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={3}>
          {[
            { title: 'Free Delivery', sub: 'On orders over ₹99', icon: <TagIcon />, color: '#E8F5E9' },
            { title: 'Local Freshness', sub: 'Daily curated picks', icon: <FlashIcon />, color: '#FFF3E0' },
            { title: 'Multi-Shop Cart', sub: 'One order, many sellers', icon: <StoreIcon />, color: '#E3F2FD' },
          ].map((item, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  bgcolor: 'white',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <Avatar sx={{ bgcolor: item.color, color: 'text.primary', width: 60, height: 60, borderRadius: 1.5 }}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { sx: { fontSize: 30, color: item.color === '#E8F5E9' ? '#0C831F' : 'inherit' } })}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontSize: isBelow973 ? '1rem' : '1.2rem', whiteSpace: 'nowrap' }}>{item.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: isBelow973 ? '0.75rem' : '0.875rem' }}>{item.sub}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ mt: 10 }}>
        
        {/* Promotional Offer Banner */}
        <Box sx={{ mb: 10 }}>
          <PromoBanner />
        </Box>

        {/* Categories Section */}
        <Box id="categories" sx={{ mb: 12 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: isBelow375 ? '1.75rem' : 'inherit' }}>Shop by <span style={{ color: '#0C831F' }}>Category</span></Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1, fontSize: isBelow375 ? '0.85rem' : '1rem' }}>Fresh options for your every need</Typography>
            </Box>
            {!isBelow425 && (
              <Button component={Link} href="/categories" sx={{ fontWeight: 900, color: 'primary.main' }}>View All</Button>
            )}
          </Stack>

          <Box sx={{ position: 'relative' }}>
            {/* Scroll Navigation Arrows */}
            {!isBelow425 && categories.length > 0 && (
              <>
                <IconButton
                  onClick={() => scrollCategories('left')}
                  disabled={!canScrollLeft}
                  sx={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 20,
                    bgcolor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#f8fafc' },
                    '&.Mui-disabled': { opacity: 0, pointerEvents: 'none' }
                  }}
                >
                  <LeftIcon />
                </IconButton>
                <IconButton
                  onClick={() => scrollCategories('right')}
                  disabled={!canScrollRight}
                  sx={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 20,
                    bgcolor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#f8fafc' },
                    '&.Mui-disabled': { opacity: 0, pointerEvents: 'none' }
                  }}
                >
                  <RightIcon />
                </IconButton>
              </>
            )}

            <Box
              ref={categoryScrollRef}
              onScroll={handleScroll}
              sx={{
                display: 'flex',
                gap: 3,
                overflowX: 'auto',
                pb: 4,
                pt: 2.5,
                px: { xs: 2, md: 1 },
                mx: { xs: -2, md: -1 },
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                scrollBehavior: 'smooth'
              }}
            >
              {loading.cat ? (
                <Stack direction="row" spacing={3}>
                  <GridSkeleton count={8} type="category" />
                </Stack>
              ) : (
                categories.map((cat, index) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                  >
                    <Box sx={{ minWidth: { xs: 140, md: 180 }, flexShrink: 0 }}>
                      <Card
                        component={Link}
                        href={`/categories/${cat.id}`}
                        sx={{
                          textAlign: 'center',
                          bgcolor: 'white',
                          textDecoration: 'none',
                          borderRadius: 4,
                          border: '1px solid #f1f5f9',
                          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          display: 'block',
                          overflow: 'hidden',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-12px)',
                            boxShadow: '0 30px 60px -15px rgba(12, 131, 31, 0.15)',
                            borderColor: '#0C831F',
                            zIndex: 10,
                            '& .cat-img': { transform: 'scale(1.18)' },
                            '& .cat-label-text': { color: '#0C831F' },
                            '& .active-indicator': { width: '40px' }
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: 140,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'white',
                            p: 1.5,
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            className="cat-img"
                            src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'}
                            alt={cat.name}
                            style={{
                              width: '85%',
                              height: '85%',
                              objectFit: 'contain',
                              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          />
                        </Box>
                        <Box className="cat-label" sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #f1f5f9', position: 'relative', transition: 'all 0.3s' }}>
                          <Typography
                            className="cat-label-text"
                            variant="subtitle2"
                            sx={{
                              fontWeight: 900,
                              color: '#1e293b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              transition: 'color 0.3s ease'
                            }}
                          >
                            {cat.name}
                          </Typography>
                          <Box
                            className="active-indicator"
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              height: 3,
                              width: 0,
                              bgcolor: '#0C831F',
                              borderRadius: '3px 3px 0 0',
                              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          />
                        </Box>
                      </Card>
                    </Box>
                  </motion.div>
                ))
              )}
            </Box>
          </Box>

          {isBelow425 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button component={Link} href="/categories" variant="outlined" sx={{ fontWeight: 900, color: 'primary.main', borderRadius: 2, px: 4 }}>View All</Button>
            </Box>
          )}
        </Box>

        {/* Newly Added Section */}
        <Box id="newly-added" sx={{ mb: 12 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: isBelow375 ? '1.75rem' : 'inherit' }}>Newly <span style={{ color: '#0C831F' }}>Added</span></Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1, fontSize: isBelow375 ? '0.85rem' : '1rem' }}>Fresh arrivals just for you</Typography>
            </Box>
            <Button component={Link} href="/products" sx={{ fontWeight: 900, color: 'primary.main' }}>View All</Button>
          </Stack>

          <Grid container spacing={3}>
            {loading.newly ? (
              <GridSkeleton count={isBelow900 ? 5 : 5} type="product" />
            ) : (
              newlyAddedProducts.slice(0, 5).map((product, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Trending Now Section */}
        <Box id="trending" sx={{ mb: 12 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: isBelow375 ? '1.75rem' : 'inherit' }}>Trending <span style={{ color: '#0C831F' }}>Now</span></Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1, fontSize: isBelow375 ? '0.85rem' : '1rem' }}>Top rated items based on community feedback</Typography>
            </Box>
            <Button component={Link} href="/products" sx={{ fontWeight: 900, color: 'primary.main' }}>View All</Button>
          </Stack>

          <Grid container spacing={3}>
            {loading.trending ? (
              <GridSkeleton count={isBelow900 ? 5 : 5} type="product" />
            ) : (
              trendingProducts.slice(0, 5).map((product, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Our Products Section */}
        <Box id="products" sx={{ mb: 12 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: isBelow375 ? '1.75rem' : 'inherit' }}>Our <span style={{ color: '#0C831F' }}>Products</span></Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1, fontSize: isBelow375 ? '0.85rem' : '1rem' }}>Explore our wide range of quality products</Typography>
            </Box>
            <Button component={Link} href="/products" sx={{ fontWeight: 900, color: 'primary.main' }}>View All</Button>
          </Stack>

          <Grid container spacing={2}>
            {loading.our ? (
              <GridSkeleton count={isBelow900 ? 5 : 10} type="product" />
            ) : (
              ourProducts.map((product, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 5) * 0.1 }}
                  >
                    <GalleryProductCard product={product} />
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Premium Banner */}
        <Paper
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 5,
            bgcolor: '#0f172a',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            mb: 12
          }}
        >
          <Box sx={{ position: 'absolute', top: '-10%', right: '-10%', width: 400, height: 400, bgcolor: 'primary.main', opacity: 0.2, filter: 'blur(100px)', borderRadius: '50%' }} />
          <Grid container spacing={isBelow900 ? 4 : 6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }} textAlign={{ xs: 'center', md: 'left' }}>
                <Typography variant="h2" sx={{ mb: 0, fontSize: { xs: '2rem', sm: '2.5rem', md: '3.75rem' } }}>
                  Flash <span style={{ color: '#FFD700' }}>Premium</span>
                </Typography>
                <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, maxWidth: 500, fontWeight: 600 }}>
                  Join the ultimate shopping circle. Get zero delivery fees, priority support and member-only pricing.
                </Typography>
                <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: '#10b981' }} />
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>Free Delivery</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: '#10b981' }} />
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>Priority Slot</Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#FFD700',
                    color: '#0f172a',
                    py: 2,
                    px: { xs: 4, sm: 6 },
                    borderRadius: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    '&:hover': { bgcolor: '#facc15' },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Subscribe for ₹299/year
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h6" sx={{ color: '#FFD700', mb: 3 }}>MOST POPULAR PLAN</Typography>
                <Stack spacing={2}>
                  {[
                    { label: 'Standard Order', val: '₹40 Delivery' },
                    { label: 'Flash Premium', val: 'FREE Delivery', highlight: true },
                    { label: 'Order Limit', val: 'Unlimited' },
                    { label: 'Support', val: '24/7 Priority' },
                  ].map((row, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', pb: i < 3 ? 2 : 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{row.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900, color: row.highlight ? '#10b981' : 'white' }}>{row.val}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* FAQs */}
        <Box sx={{ mb: 12 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', mb: isBelow425 ? 4 : 8, fontSize: isBelow425 ? '1.75rem' : 'inherit' }}>
            Got <span style={{ color: '#0C831F' }}>Questions?</span>
          </Typography>

          {isBelow425 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { id: 'faq1', q: 'Is there a minimum order value?', a: 'No, but orders above ₹99 get free delivery with Flash Premium.' },
                { id: 'faq2', q: 'How long does 11-min delivery take?', a: 'Actually, our average delivery time is just 9 minutes in most zones!' },
                { id: 'faq3', q: 'Can I order from multiple stores?', a: 'Yes! That\'s our specialty. One checkout, multiple shop collections.' },
                { id: 'faq4', q: 'How do I track my order?', a: 'You can watch our "Flash Rider" live on the map after order confirmation.' },
              ].map((faq, i) => (
                <Accordion
                  key={faq.id}
                  expanded={expandedFaq === faq.id}
                  onChange={handleFaqChange(faq.id)}
                  elevation={0}
                  sx={{
                    borderRadius: '12px !important',
                    mb: 1,
                    border: '1px solid #f1f5f9',
                    '&:before': { display: 'none' },
                    overflow: 'hidden',
                    boxShadow: expandedFaq === faq.id ? '0 10px 30px -10px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.3s'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                    sx={{ px: 2, py: 1 }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {faq.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pt: 0, pb: 3 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.6 }}>
                      {faq.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {[
                { q: 'Is there a minimum order value?', a: 'No, but orders above ₹99 get free delivery with Flash Premium.' },
                { q: 'How long does 11-min delivery take?', a: 'Actually, our average delivery time is just 9 minutes in most zones!' },
                { q: 'Can I order from multiple stores?', a: 'Yes! That\'s our specialty. One checkout, multiple shop collections.' },
                { q: 'How do I track my order?', a: 'You can watch our "Flash Rider" live on the map after order confirmation.' },
              ].map((faq, i) => (
                <Grid size={{ xs: 12, md: 6 }} key={i}>
                  <Paper sx={{ p: 4, height: '100%', borderRadius: 2.5, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <DotIcon sx={{ color: 'primary.main', fontSize: 13 }} /> {faq.q}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.6 }}>{faq.a}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

      </Container>
    </Box>
  );
}
