'use client';

import React from 'react';
import { Box, Typography, Paper, Stack, Button, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { LocalOffer as OfferIcon, ChevronRight as RightIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function PromoBanner() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
            <Paper
                elevation={0}
                sx={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: '24px',
                    p: { xs: 3, md: 5 },
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                {/* Decorative Elements */}
                <Box sx={{ 
                    position: 'absolute', 
                    top: -20, 
                    right: -20, 
                    width: 200, 
                    height: 200, 
                    borderRadius: '50%', 
                    background: 'radial-gradient(circle, rgba(12, 131, 31, 0.2) 0%, transparent 70%)',
                    zIndex: 0
                }} />
                
                <Stack spacing={2} sx={{ position: 'relative', zIndex: 1, maxWidth: '60%' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ bgcolor: '#0C831F', p: 0.5, borderRadius: 1.5, display: 'flex' }}>
                            <OfferIcon sx={{ color: 'white', fontSize: 18 }} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ color: '#0C831F', fontWeight: 900, letterSpacing: '0.1em' }}>
                            LIMITED TIME OFFER
                        </Typography>
                    </Stack>

                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 900, fontSize: { xs: '1.5rem', md: '2.5rem' }, letterSpacing: '-0.02em' }}>
                        🎉 Get <span style={{ color: '#0C831F' }}>₹50 OFF</span> on your order!
                    </Typography>

                    <Typography variant="body1" sx={{ color: alpha('#fff', 0.8), fontWeight: 600 }}>
                        Unlock special savings when you shop for products worth ₹1000 or more.
                    </Typography>

                    <Button
                        component={Link}
                        href="/products"
                        variant="contained"
                        endIcon={<RightIcon />}
                        sx={{
                            bgcolor: '#0C831F',
                            color: 'white',
                            borderRadius: '12px',
                            px: 4,
                            py: 1.5,
                            fontWeight: 900,
                            textTransform: 'none',
                            width: 'fit-content',
                            '&:hover': { bgcolor: '#096e1a' }
                        }}
                    >
                        Shop Now
                    </Button>
                </Stack>

                <Box sx={{ 
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30%',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <motion.div
                        animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1.05, 1]
                        }}
                        transition={{ 
                            duration: 5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Box sx={{ 
                            bgcolor: alpha('#0C831F', 0.1), 
                            p: 4, 
                            borderRadius: '50%',
                            border: '2px dashed #0C831F'
                        }}>
                            <Typography variant="h2" sx={{ color: '#0C831F', fontWeight: 900 }}>
                                ₹50
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 900, textAlign: 'center' }}>
                                OFF
                            </Typography>
                        </Box>
                    </motion.div>
                </Box>
            </Paper>
        </motion.div>
    );
}
