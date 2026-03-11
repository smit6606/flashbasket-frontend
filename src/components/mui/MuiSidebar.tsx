'use client';

import React from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar,
    Stack,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Storefront as StoreIcon,
    Assessment as AnalyticsIcon,
    Inventory as InventoryIcon,
    ShoppingCart as OrdersIcon,
    Category as CategoryIcon,
    Settings as SettingsIcon,
    Map as DeliveryIcon,
    AccountBalanceWallet as EarningsIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const DRAWER_WIDTH = 280;

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

export default function MuiSidebar({ mobileOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const role = user?.role || 'guest';

    const menuItems = {
        admin: [
            { name: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
            { name: 'Manage Orders', path: '/admin/orders', icon: <OrdersIcon /> },
            { name: 'Manage Users', path: '/admin/users', icon: <PeopleIcon /> },
            { name: 'Store Requests', path: '/admin/sellers', icon: <StoreIcon /> },
            { name: 'Categories', path: '/admin/categories', icon: <CategoryIcon /> },
            { name: 'Global Analytics', path: '/admin/analytics', icon: <AnalyticsIcon /> },
            { name: 'System Settings', path: '/admin/settings', icon: <SettingsIcon /> },
        ],
        seller: [
            { name: 'Market Overview', path: '/seller', icon: <DashboardIcon /> },
            { name: 'Categories', path: '/seller/categories', icon: <CategoryIcon /> },
            { name: 'Subcategories', path: '/seller/subcategories', icon: <CategoryIcon /> },
            { name: 'My Catalog', path: '/seller/products', icon: <InventoryIcon /> },
            { name: 'Live Orders', path: '/seller/orders', icon: <OrdersIcon /> },
            { name: 'Sales Insights', path: '/seller/analytics', icon: <AnalyticsIcon /> },
            { name: 'Store Account', path: '/seller/profile', icon: <SettingsIcon /> },
        ],
        delivery: [
            { name: 'Driver Dashboard', path: '/delivery', icon: <DeliveryIcon /> },
            { name: 'Active Deliveries', path: '/delivery/trips', icon: <OrdersIcon /> },
            { name: 'Earning Ledger', path: '/delivery/earnings', icon: <EarningsIcon /> },
        ],
        user: [
            { name: 'Overview', path: '/user/dashboard', icon: <DashboardIcon /> },
            { name: 'Order History', path: '/orders', icon: <OrdersIcon /> },
            { name: 'Edit Profile', path: '/user/profile', icon: <SettingsIcon /> },
        ]
    };

    const links = menuItems[role as keyof typeof menuItems] || menuItems.admin;

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1e293b', color: 'white' }}>
            {/* Sidebar Header */}
            <Box
                component={Link}
                href="/"
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    height: 80,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    textDecoration: 'none',
                    '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.02)'
                    }
                }}
            >
                <Box
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        fontSize: '1.2rem',
                        fontWeight: 900,
                        boxShadow: '0 4px 12px rgba(12, 131, 31, 0.4)',
                    }}
                >
                    F
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem', tracking: '-0.02em', color: 'white' }}>
                        FlashHQ
                    </Typography>
                    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, lineHeight: 1, fontSize: '0.65rem' }}>
                        {role.toUpperCase()} PANEL
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Links */}
            <Box sx={{ flexGrow: 1, py: 4, px: 2 }}>
                <Typography variant="caption" sx={{ px: 2, color: 'slate.400', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2, display: 'block' }}>
                    Menu
                </Typography>
                <List sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
                    {links.map((link) => {
                        const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
                        return (
                            <ListItem key={link.name} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    href={link.path}
                                    onClick={onClose}
                                    sx={{
                                        borderRadius: 3,
                                        mb: 0.5,
                                        bgcolor: isActive ? 'primary.main' : 'transparent',
                                        '&:hover': {
                                            bgcolor: isActive ? 'primary.main' : 'rgba(255,255,255,0.05)',
                                        },
                                        color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40, fontSize: '1.2rem' }}>
                                        {link.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={link.name}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 800 : 600,
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Sidebar Footer (User Info) */}
            <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(15, 23, 42, 0.4)' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.dark', fontWeight: 800, fontSize: '0.9rem' }}>
                        {user?.user_name?.charAt(0).toUpperCase() || 'A'}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: 'white' }}>
                            {user?.user_name || 'Admin'}
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block' }}>
                            {user?.email || 'admin@flashbasket.com'}
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', lg: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', lg: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}
