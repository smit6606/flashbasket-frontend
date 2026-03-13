'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Skeleton,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { NavigateNext as NextIcon } from '@mui/icons-material';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get('/categories?limit=100');
        setCategories(res.data.items || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryImage = (name: string) => {
    const lookupName = name.toLowerCase();
    
    const staticImages: { [key: string]: string } = {
        'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300',
        'beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=300',
        'elect': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=300',
        'home': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300',
        'kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300',
        'toy': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&q=80&w=300',
        'snack': 'https://images.unsplash.com/photo-1599490659223-23df624860b0?auto=format&fit=crop&q=80&w=300',
        'dairy': 'https://images.unsplash.com/photo-1550583724-1277f3134183?auto=format&fit=crop&q=80&w=300',
        'fruit': 'https://images.unsplash.com/photo-1610832958506-aa563384269d?auto=format&fit=crop&q=80&w=300',
        'veg': 'https://images.unsplash.com/photo-1610832958506-aa563384269d?auto=format&fit=crop&q=80&w=300',
        'bike': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=300',
        'car': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300',
        'shoe': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300'
    };

    for (const key in staticImages) {
        if (lookupName.includes(key)) return staticImages[key];
    }
    
    // Fallback to dynamic image search
    return `https://loremflickr.com/300/300/${encodeURIComponent(lookupName.split(' ')[0])}`;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl">

        <Box sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: '#1e293b' }}>
            Shop by <span style={{ color: '#0C831F' }}>Category</span>
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Discover wide range of products across all categories
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {loading ? (
            [...Array(12)].map((_, i) => (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={i}>
                <Skeleton variant="rounded" height={180} sx={{ borderRadius: 1.5 }} />
              </Grid>
            ))
          ) : (
            categories.map((cat) => (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={cat.id}>
                <Card 
                  component={Link} 
                  href={`/categories/${cat.id}`}
                  sx={{ 
                    textAlign: 'center', 
                    bgcolor: 'white',
                    textDecoration: 'none',
                    borderRadius: 5,
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    overflow: 'hidden',
                    display: 'block',
                    position: 'relative',
                    '&:hover': { 
                      transform: 'translateY(-14px)', 
                      boxShadow: '0 35px 70px -15px rgba(12, 131, 31, 0.18)', 
                      borderColor: '#0C831F',
                      zIndex: 10,
                      '& .cat-img': { transform: 'scale(1.2)' },
                      '& .cat-label-text': { color: '#0C831F' },
                      '& .active-indicator': { width: '60px' }
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 200, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white',
                      p: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      className="cat-img"
                      src={getCategoryImage(cat.name)} 
                      alt={cat.name}
                      style={{ 
                        width: '85%', 
                        height: '85%', 
                        objectFit: 'contain',
                        transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    />
                  </Box>
                  <Box className="cat-label" sx={{ p: 2.5, bgcolor: 'white', borderTop: '1px solid #f1f5f9', position: 'relative', transition: 'all 0.3s' }}>
                    <Typography 
                      className="cat-label-text"
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 900, 
                        color: '#1e293b', 
                        letterSpacing: '-0.01em',
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
                        height: 4, 
                        width: 0, 
                        bgcolor: '#0C831F', 
                        borderRadius: '4px 4px 0 0',
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
                      }} 
                    />
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}
