'use client';

import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Badge,
    Tooltip,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    alpha,
    Button,
} from '@mui/material';
import {
    Menu as MenuIcon,
    NotificationsNone as BellIcon,
    Search as SearchIcon,
    HelpOutline as HelpIcon,
    Launch as LaunchIcon,
    Settings as SettingsIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MuiBackButton from './MuiBackButton';

const DRAWER_WIDTH = 280;

interface TopBarProps {
    onMenuClick: () => void;
}

export default function MuiTopBar({ onMenuClick }: TopBarProps) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        router.push('/login');
    };

    const handleProfile = () => {
        handleClose();
        const role = user?.role || 'user';
        router.push(`/${role}/profile`);
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
                ml: { lg: `${DRAWER_WIDTH}px)` },
                bgcolor: 'white',
                borderBottom: '1px solid #f1f5f9',
                boxShadow: 'none',
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar sx={{ minHeight: 80, px: { xs: 2, md: 4 } }}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { lg: 'none' }, color: 'text.primary' }}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                        variant="h6" 
                        component={Link}
                        href="/"
                        sx={{ 
                            fontWeight: 900, 
                            color: 'primary.main', 
                            display: { xs: 'none', md: 'block' },
                            textDecoration: 'none',
                            '&:hover': { opacity: 0.8 }
                        }}
                    >
                        FlashBasket
                    </Typography>
                    <Box sx={{ 
                        flexGrow: 1, 
                        maxWidth: 600,
                        px: 2, 
                        py: 0.5, 
                        bgcolor: '#f8fafc', 
                        borderRadius: '14px', 
                        border: '1px solid #f1f5f9', 
                        display: { xs: 'none', md: 'flex' }, 
                        alignItems: 'center', 
                        gap: 1.5,
                        transition: 'all 0.3s',
                        '&:hover': { bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                    }}>
                        <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Search your marketplace...</Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ px: 1, border: '1px solid #e2e8f0', borderRadius: 1.5, color: 'text.secondary', fontSize: '0.65rem', fontWeight: 700 }}>Ctrl</Typography>
                            <Typography variant="caption" sx={{ px: 1, border: '1px solid #e2e8f0', borderRadius: 1.5, color: 'text.secondary', fontSize: '0.65rem', fontWeight: 700 }}>K</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
                    <IconButton sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.secondary' }}>
                        <SearchIcon fontSize="small" />
                    </IconButton>

                    <Tooltip title="View Public Website">
                        <IconButton component={Link} href="/" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha('#0C831F', 0.05) } }}>
                            <LaunchIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <IconButton sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'flex' } }}>
                        <Badge badgeContent={4} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16, fontWeight: 900 } }}>
                            <BellIcon fontSize="small" />
                        </Badge>
                    </IconButton>

                    <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: { xs: 0.5, sm: 1 }, display: { xs: 'none', sm: 'block' } }} />

                    <Box 
                        onClick={handleClick}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5, 
                            cursor: 'pointer', 
                            p: 0.5, 
                            pr: { xs: 0.5, sm: 2 }, 
                            borderRadius: '16px', 
                            bgcolor: { xs: 'transparent', sm: alpha('#0f172a', 0.03) }, 
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: alpha('#0f172a', 0.06) } 
                        }}
                    >
                        <Avatar 
                            src={user?.profileImage}
                            sx={{ 
                                width: { xs: 32, sm: 36 }, 
                                height: { xs: 32, sm: 36 }, 
                                bgcolor: 'primary.main', 
                                fontSize: '0.9rem', 
                                fontWeight: 900,
                                boxShadow: '0 4px 12px rgba(12, 131, 31, 0.2)'
                            }}
                        >
                            {user?.user_name?.charAt(0).toUpperCase() || 'A'}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                            <Typography variant="body2" sx={{ fontWeight: 900, color: '#1e293b', lineHeight: 1, mb: 0.3 }}>
                                {user?.user_name || 'Administrator'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#0C831F', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                {user?.role || 'Admin'}
                            </Typography>
                        </Box>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                                mt: 1.5,
                                minWidth: 200,
                                borderRadius: '16px',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                    >
                        <MenuItem onClick={handleProfile}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            Profile Settings
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            Account Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>

                </Box>
            </Toolbar>
        </AppBar>
    );
}
