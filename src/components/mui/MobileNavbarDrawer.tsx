'use client';

import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Badge,
    alpha,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    ShoppingCart as ShoppingCartIcon,
    Search as SearchIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Dashboard as DashboardIcon,
    Favorite as FavoriteIcon,
    ListAlt as OrderIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface MobileNavbarDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    cartCount: number;
    onProductsClick: () => void;
}

export default function MobileNavbarDrawer({
    isOpen,
    onClose,
    user,
    cartCount,
    onProductsClick
}: MobileNavbarDrawerProps) {
    const theme = useTheme();
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <Drawer
            anchor="right"
            open={isOpen}
            onClose={onClose}
            PaperProps={{
                sx: { 
                    width: { xs: '85%', sm: 280 }, 
                    maxWidth: 320,
                    borderRadius: '20px 0 0 20px', 
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    FlashBasket
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            
            <List sx={{ pt: 0, flexGrow: 1 }}>
                {!user ? (
                    <>
                        <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemButton 
                                component={Link} 
                                href="/login" 
                                onClick={onClose} 
                                sx={{ borderRadius: 2 }}
                            >
                                <ListItemIcon><LoginIcon color="primary" /></ListItemIcon>
                                <ListItemText primary="Login" primaryTypographyProps={{ fontWeight: 800 }} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemButton 
                                component={Link} 
                                href="/register" 
                                onClick={onClose} 
                                sx={{ 
                                    borderRadius: 2, 
                                    color: 'primary.main' 
                                }}
                            >
                                <ListItemIcon><RegisterIcon color="primary" /></ListItemIcon>
                                <ListItemText primary="Sign Up" primaryTypographyProps={{ fontWeight: 900 }} />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : (
                    <>
                        <ListItem disablePadding sx={{ mb: 1 }}>
                            <Box sx={{ px: 2, py: 1, width: '100%' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Welcome,
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                    {user.user_name}
                                </Typography>
                            </Box>
                        </ListItem>
                        <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemButton component={Link} href={user.role === 'user' ? '/user/profile' : `/${user.role}/profile`} onClick={onClose} sx={{ borderRadius: 2 }}>
                                <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                                <ListItemText primary="My Profile" primaryTypographyProps={{ fontWeight: 800 }} />
                            </ListItemButton>
                        </ListItem>
                        
                        {user.role === 'user' ? (
                            <>
                                <ListItem disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton component={Link} href="/user/orders" onClick={onClose} sx={{ borderRadius: 2 }}>
                                        <ListItemIcon><OrderIcon color="primary" /></ListItemIcon>
                                        <ListItemText primary="My Orders" primaryTypographyProps={{ fontWeight: 800 }} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton component={Link} href="/user/favourites" onClick={onClose} sx={{ borderRadius: 2 }}>
                                        <ListItemIcon><FavoriteIcon color="primary" /></ListItemIcon>
                                        <ListItemText primary="My Favourites" primaryTypographyProps={{ fontWeight: 800 }} />
                                    </ListItemButton>
                                </ListItem>
                            </>
                        ) : (
                            <ListItem disablePadding sx={{ mb: 1 }}>
                                <ListItemButton component={Link} href={`/${user.role}`} onClick={onClose} sx={{ borderRadius: 2 }}>
                                    <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 800 }} />
                                </ListItemButton>
                            </ListItem>
                        )}
                    </>
                )}

                <Divider sx={{ my: 2 }} />
                
                <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton component={Link} href="/cart" onClick={onClose} sx={{ borderRadius: 2 }}>
                        <ListItemIcon>
                            <Badge badgeContent={cartCount} color="error">
                                <ShoppingCartIcon color="primary" />
                            </Badge>
                        </ListItemIcon>
                        <ListItemText primary="My Cart" primaryTypographyProps={{ fontWeight: 800 }} />
                    </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton onClick={onProductsClick} sx={{ borderRadius: 2 }}>
                        <ListItemIcon><SearchIcon color="primary" /></ListItemIcon>
                        <ListItemText primary="Browse Products" primaryTypographyProps={{ fontWeight: 800 }} />
                    </ListItemButton>
                </ListItem>

                {user && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
                                <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                                <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 800 }} />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>

            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    © 2026 FlashBasket
                </Typography>
            </Box>
        </Drawer>
    );
}
