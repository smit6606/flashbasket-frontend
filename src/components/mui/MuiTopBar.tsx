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
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
                        Dashboard
                    </Typography>
                    <Box sx={{ px: 2, py: 0.5, bgcolor: 'slate.50', borderRadius: 2, border: '1px solid #f1f5f9', display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                        <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Quick Search...</Typography>
                        <Typography variant="caption" sx={{ ml: 2, px: 1, border: '1px solid #e2e8f0', borderRadius: 1, color: 'text.secondary', fontSize: '0.65rem' }}>Ctrl + K</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="View Public Website">
                        <IconButton component={Link} href="/" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}>
                            <LaunchIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <IconButton sx={{ color: 'text.secondary' }}>
                        <HelpIcon fontSize="small" />
                    </IconButton>

                    <IconButton sx={{ color: 'text.secondary' }}>
                        <Badge badgeContent={4} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                            <BellIcon fontSize="small" />
                        </Badge>
                    </IconButton>

                    <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 1 }} />

                    <Box 
                        onClick={handleClick}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'slate.50' } }}
                    >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 800 }}>
                            {user?.user_name?.charAt(0).toUpperCase() || 'A'}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                                {user?.user_name || 'Administrator'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Online
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
                                borderRadius: 3,
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
