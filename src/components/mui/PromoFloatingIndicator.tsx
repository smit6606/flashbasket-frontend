'use client';

import React from 'react';
import { Box, Typography, LinearProgress, IconButton, Paper, Stack } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Close as CloseIcon, Celebration as CelebrateIcon, LocalOffer as OfferIcon } from '@mui/icons-material';
import { useCart } from '@/context/CartContext';
import { alpha } from '@mui/material/styles';

export default function PromoFloatingIndicator() {
    const { cartData, cartCount } = useCart();
    const [isVisible, setIsVisible] = React.useState(false);
    const [isThinking, setIsThinking] = React.useState(false); // For smooth progress updates
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const prevCartCount = React.useRef(cartCount);

    // Trigger visibility when cart changes
    React.useEffect(() => {
        if (cartCount > prevCartCount.current) {
            showBanner();
        }
        prevCartCount.current = cartCount;
    }, [cartCount]);

    // Also trigger if item total changes (e.g. quantity update)
    const itemTotal = parseFloat(cartData?.itemTotal || '0');
    const prevItemTotal = React.useRef(itemTotal);
    
    React.useEffect(() => {
        if (itemTotal !== prevItemTotal.current && prevItemTotal.current > 0) {
            showBanner();
        }
        prevItemTotal.current = itemTotal;
    }, [itemTotal]);

    const showBanner = () => {
        setIsVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 20000); // 20 seconds
    };

    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (!cartData || !cartData.items || cartData.items.length === 0) return null;

    const threshold = 1000;
    const discountAmount = 50;
    const progress = Math.min((itemTotal / threshold) * 100, 100);
    const remaining = Math.max(0, threshold - itemTotal);

    const isUnlocked = itemTotal >= threshold;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                    exit={{ opacity: 0, y: 100, scale: 0.9, x: 20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    style={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        zIndex: 2000,
                        width: '340px',
                    }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            p: 2.5,
                            borderRadius: '24px',
                            background: isUnlocked 
                                ? 'linear-gradient(135deg, #0C831F 0%, #10b981 100%)'
                                : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        {/* Decorative Background Icon */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: -20, 
                            right: -20, 
                            opacity: 0.1, 
                            transform: 'rotate(-20deg)',
                            pointerEvents: 'none'
                        }}>
                            <OfferIcon sx={{ fontSize: 120 }} />
                        </Box>

                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{ 
                                        p: 1, 
                                        bgcolor: 'rgba(255,255,255,0.2)', 
                                        borderRadius: '12px',
                                        display: 'flex',
                                        animation: isUnlocked ? 'pulse 2s infinite' : 'none',
                                        '@keyframes pulse': {
                                            '0%': { transform: 'scale(1)' },
                                            '50%': { transform: 'scale(1.1)' },
                                            '100%': { transform: 'scale(1)' },
                                        }
                                    }}>
                                        {isUnlocked ? <CelebrateIcon sx={{ fontSize: 22 }} /> : <OfferIcon sx={{ fontSize: 22 }} />}
                                    </Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                                        {isUnlocked ? 'Offer Unlocked!' : 'Flash Promotion'}
                                    </Typography>
                                </Stack>
                                <IconButton 
                                    size="small" 
                                    onClick={() => setIsVisible(false)}
                                    sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Stack>

                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.3, fontSize: '0.95rem' }}>
                                    {isUnlocked 
                                        ? `🎉 Congratulations! Extra ₹${discountAmount} OFF applied!`
                                        : `Add ₹${remaining.toFixed(0)} more to unlock ₹${discountAmount} OFF`}
                                </Typography>
                                
                                <Box sx={{ position: 'relative', height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', overflow: 'hidden', mb: 1 }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        style={{
                                            position: 'absolute',
                                            height: '100%',
                                            background: isUnlocked ? '#fff' : '#0C831F',
                                            borderRadius: 4,
                                            boxShadow: isUnlocked ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                                        }}
                                    />
                                </Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: alpha('#fff', 0.6), fontWeight: 700 }}>
                                    ₹{itemTotal.toFixed(0)} / ₹{threshold}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: alpha('#fff', 0.6), fontWeight: 700 }}>
                                        {progress.toFixed(0)}%
                                    </Typography>
                                </Stack>
                            </Box>

                            <Box sx={{ 
                                bgcolor: isUnlocked ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)', 
                                p: 1.5, 
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isUnlocked 
                                        ? '✅ Discount precisely applied at checkout'
                                        : `🚀 Almost there! Just a few more items...`}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
