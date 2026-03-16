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
    Home as HomeIcon,
    Map as DeliveryIcon,
    AccountBalanceWallet as EarningsIcon,
    History as HistoryIcon,
    LocalShipping as ActiveIcon,
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
            { name: 'Public Home', path: '/', icon: <HomeIcon /> },
            { name: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
            { name: 'Orders', path: '/admin/orders', icon: <OrdersIcon /> },
            { name: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
            { name: 'Sellers', path: '/admin/sellers', icon: <StoreIcon /> },
            { name: 'Delivery Drivers', path: '/admin/delivery', icon: <ActiveIcon /> },
            { name: 'Categories', path: '/admin/categories', icon: <CategoryIcon /> },
            { name: 'Products', path: '/admin/products', icon: <InventoryIcon /> },
            { name: 'Reports', path: '/admin/analytics', icon: <AnalyticsIcon /> },
            { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
        ],
        seller: [
            { name: 'Public Home', path: '/', icon: <HomeIcon /> },
            { name: 'Dashboard', path: '/seller', icon: <DashboardIcon /> },
            { name: 'Live Orders', path: '/seller/orders', icon: <OrdersIcon /> },
            { name: 'Past Orders', path: '/seller/history', icon: <HistoryIcon /> },
            { name: 'Categories', path: '/seller/categories', icon: <CategoryIcon /> },
            { name: 'Sub Categories', path: '/seller/subcategories', icon: <CategoryIcon /> },
            { name: 'My Catalog', path: '/seller/catalog', icon: <InventoryIcon /> },
            { name: 'Sales Insights', path: '/seller/sales', icon: <AnalyticsIcon /> },
            { name: 'Store Account', path: '/seller/account', icon: <SettingsIcon /> },
        ],
        delivery: [
            { name: 'Public Home', path: '/', icon: <HomeIcon /> },
            { name: 'Driver Dashboard', path: '/delivery', icon: <DeliveryIcon /> },
            { name: 'Active Trips', path: '/delivery/trips', icon: <ActiveIcon /> },
            { name: 'Past Orders', path: '/delivery/history', icon: <HistoryIcon /> },
            { name: 'Earning Ledger', path: '/delivery/earnings', icon: <EarningsIcon /> },
            { name: 'My Account', path: '/delivery/profile', icon: <SettingsIcon /> },
        ],
        user: [
            { name: 'Public Home', path: '/', icon: <HomeIcon /> },
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
                        borderRadius: '10px',
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
                        // Logic to ensure only one tab is active
                        // Root paths like /admin, /seller, /delivery should only be active on exact match
                        // Other paths can be active if they match the start of the current pathname
                        const dashboardPaths = ['/admin', '/seller', '/delivery', '/user/dashboard', '/seller/dashboard'];
                        const isActive = dashboardPaths.includes(link.path) || link.path === '/'
                            ? pathname === link.path
                            : pathname.startsWith(link.path);

                        return (
                            <ListItem key={link.name} disablePadding sx={{ px: 1 }}>
                                <ListItemButton
                                    component={Link}
                                    href={link.path}
                                    onClick={onClose}
                                    sx={{
                                        borderRadius: '12px',
                                        mb: 0.5,
                                        py: 1.5,
                                        bgcolor: isActive ? 'primary.main' : 'transparent',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            bgcolor: isActive ? 'primary.main' : 'rgba(255,255,255,0.08)',
                                            transform: isActive ? 'none' : 'translateX(4px)',
                                        },
                                        color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                                        boxShadow: isActive ? '0 8px 20px rgba(12, 131, 31, 0.25)' : 'none',
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: 'inherit',
                                            minWidth: 42,
                                            fontSize: '1.25rem',
                                            transition: 'all 0.3s',
                                            transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                        }}
                                    >
                                        {link.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={link.name}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 900 : 600,
                                            fontSize: '0.925rem',
                                            letterSpacing: isActive ? '0.01em' : '0',
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
                    <Avatar
                        src={user?.profileImage}
                        sx={{ bgcolor: 'primary.dark', fontWeight: 800, fontSize: '0.9rem' }}
                    >
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
