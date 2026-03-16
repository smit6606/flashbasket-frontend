'use client';

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastPosition } from 'react-toastify';
import { 
    Box, 
    Typography, 
    Stack, 
    Avatar, 
    alpha,
    IconButton
} from '@mui/material';
import { 
    ShoppingCart as OrderIcon,
    LocalShipping as DeliveryIcon,
    CheckCircle as SuccessIcon,
    NotificationsActive as AlertIcon,
    Close as CloseIcon,
    Inventory as ProductIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomNotificationProps {
    title: string;
    message: string;
    icon: React.ReactNode;
    color: string;
    closeToast?: () => void;
}

const CustomNotification = ({ title, message, icon, color, closeToast }: CustomNotificationProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 0.5,
            width: '100%',
            cursor: 'pointer',
            position: 'relative'
        }}>
            <motion.div
                animate={{ 
                    boxShadow: [
                        `0 0 0 0px ${alpha(color, 0.4)}`,
                        `0 0 0 10px ${alpha(color, 0)}`
                    ] 
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ borderRadius: '14px' }}
            >
                <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 3.5, 
                    bgcolor: alpha(color, 0.1), 
                    color: color,
                    display: 'flex',
                    boxShadow: `0 8px 16px ${alpha(color, 0.15)}`
                }}>
                    {icon}
                </Box>
            </motion.div>
            <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1e293b', fontSize: '0.9rem' }}>
                        {title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '0.65rem' }}>
                        Just now
                    </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', lineHeight: 1.3, fontSize: '0.75rem', mt: 0.2 }}>
                    {message}
                </Typography>
            </Box>
        </Box>
    </motion.div>
);

export default function NotificationManager() {
    const socket = useSocket();
    const { user } = useAuth();

    const showPremiumToast = (title: string, message: string, icon: React.ReactNode, color: string = '#0C831F') => {
        // Subtle audio feedback logic (user can place 'notification.mp3' in /public to enable)
        // const audio = new Audio('/notification.mp3'); 
        // audio.play().catch(() => {});

        toast(<CustomNotification title={title} message={message} icon={icon} color={color} />, {
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: {
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                padding: '16px',
                minWidth: '320px'
            }
        });
    };

    useEffect(() => {
        if (!socket || !user) return;

        // 1. LISTEN FOR USER-SPECIFIC ORDER UPDATES
        const userOrderChannel = `user_orders_${user.id}`;
        socket.on(userOrderChannel, (data: any) => {
            if (data.type === 'STATUS_UPDATE') {
                const status = data.status.replace(/-/g, ' ').toUpperCase();
                let icon = <OrderIcon />;
                let color = '#0C831F';

                if (data.status === 'accepted-by-partner') {
                    icon = <DeliveryIcon />;
                    color = '#8b5cf6'; // Purple for assignment
                } else if (data.status === 'preparing') {
                    icon = <ProductIcon />;
                    color = '#f59e0b';
                } else if (data.status === 'out-for-delivery') {
                    icon = <DeliveryIcon />;
                    color = '#3b82f6';
                } else if (data.status === 'delivered') {
                    icon = <SuccessIcon />;
                    color = '#0C831F';
                } else if (data.status === 'cancelled') {
                    icon = <CloseIcon />;
                    color = '#ef4444';
                }

                showPremiumToast(
                    'Order Update', 
                    `Your order is now ${status.toLowerCase()}`, 
                    icon,
                    color
                );
            }
        });

        // 2. LISTEN FOR SELLER-SPECIFIC NEW ORDERS
        if (user.role === 'seller') {
            const sellerChannel = `seller_notifications_${user.id}`;
            socket.on(sellerChannel, (data: any) => {
                showPremiumToast(
                    '⚡ New Order Received', 
                    `A customer just placed a new order. Check your dashboard.`, 
                    <AlertIcon />,
                    '#0C831F'
                );
            });
        }

        // 3. LISTEN FOR DELIVERY PARTNER BROADCASTS
        if (user.role === 'delivery') {
            socket.on('new_order_broadcast', (data: any) => {
                // Only notify if in the same city (if data.city exists)
                if (!data.city || (user.city && data.city === user.city)) {
                    showPremiumToast(
                        '📍 New Order Available', 
                        `A new delivery request is available in ${data.city || 'your area'}.`, 
                        <DeliveryIcon />,
                        '#ff9800'
                    );
                }
            });
        }

        // 4. LISTEN FOR STOCK ALERTS (Optional/Future)
        socket.on('stock_alert', (data: any) => {
            if (user.role === 'seller' && data.sellerId === user.id) {
                showPremiumToast(
                    'Stock Warning', 
                    `${data.productName} is running low on stock!`, 
                    <ProductIcon />,
                    '#f59e0b'
                );
            }
        });

        return () => {
            socket.off(userOrderChannel);
            socket.off('new_order_broadcast');
            socket.off('stock_alert');
            if (user.role === 'seller') {
                socket.off(`seller_notifications_${user.id}`);
            }
        };
    }, [socket, user]);

    return null; // This component doesn't render anything itself
}
