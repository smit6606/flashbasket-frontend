'use client';

import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    InputBase,
    Badge,
    Container,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    useScrollTrigger,
    Slide,
} from '@mui/material';
import {
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon,
    Room as RoomIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Menu as MenuIcon,
    AccountCircle,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    '&:hover': {
        backgroundColor: '#e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    transition: theme.transitions.create(['background-color', 'box-shadow']),
    border: '1px solid transparent',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'text.primary',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1.5, 1.5, 1.5, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '60ch',
        },
        fontWeight: 600,
        fontSize: '0.95rem',
        color: '#334155',
        '&::placeholder': {
            color: '#94a3b8',
            opacity: 1,
        }
    },
}));

function HideOnScroll(props: { children: React.ReactElement }) {
    const { children } = props;
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

export default function MuiNavbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        router.push('/login');
    };

    return (
        <HideOnScroll>
            <AppBar 
                position="sticky" 
                elevation={0}
                sx={{ 
                    zIndex: 1201, 
                    bgcolor: 'rgba(255, 255, 255, 0.85)', 
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 4px 30px rgba(0,0,0,0.03)'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 70, md: 80 } }}>
                        {/* Logo */}
                        <Typography
                            variant="h6"
                            noWrap
                            component={Link}
                            href="/"
                            sx={{
                                mr: 4,
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: 900,
                                color: 'primary.main',
                                textDecoration: 'none',
                                gap: 1.5,
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
                                }}
                            >
                                F
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', display: { xs: 'none', md: 'block' } }}>
                                FlashBasket
                            </Typography>
                        </Typography>

                        {/* Location Selector */}
                        {user && (
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', cursor: 'pointer', mr: 2 }}>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', lineHeight: 1, fontSize: '0.65rem' }}>
                                    Delivery in 11 mins
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                        Surat, Gujarat
                                    </Typography>
                                    <ArrowDownIcon sx={{ fontSize: 16 }} />
                                </Box>
                            </Box>
                        )}

                        {/* Search */}
                        {user ? (
                            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                                <Search>
                                    <SearchIconWrapper>
                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                    </SearchIconWrapper>
                                    <StyledInputBase
                                        placeholder="Search for 'groceries', 'electronics'..."
                                        inputProps={{ 'aria-label': 'search' }}
                                    />
                                </Search>
                            </Box>
                        ) : (
                            <Box sx={{ flexGrow: 1 }} />
                        )}

                        {/* Actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {!user ? (
                                <>
                                    <Button component={Link} href="/login" sx={{ color: 'text.primary', fontWeight: 700 }}>
                                        Login
                                    </Button>
                                    <Button
                                        component={Link}
                                        href="/register"
                                        variant="contained"
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            fontWeight: 800,
                                            px: 3,
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                            {user.user_name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            Level 1 Buyer
                                        </Typography>
                                    </Box>
                                    <Tooltip title="Profile Settings">
                                        <IconButton onClick={handleMenu} sx={{ p: 0.5, border: '2px solid', borderColor: 'divider' }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '1rem', fontWeight: 700 }}>
                                                {user.user_name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                        PaperProps={{
                                            sx: {
                                                mt: 1.5,
                                                minWidth: 180,
                                                borderRadius: 3,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                            }
                                        }}
                                    >
                                        <MenuItem onClick={() => { handleClose(); router.push('/user/profile'); }} sx={{ fontWeight: 600 }}>Profile Settings</MenuItem>
                                        <MenuItem onClick={() => { handleClose(); router.push('/orders'); }} sx={{ fontWeight: 600 }}>My Orders</MenuItem>
                                        {user.role === 'admin' && <MenuItem onClick={() => { handleClose(); router.push('/admin'); }} sx={{ fontWeight: 600, color: 'primary.main' }}>Admin Panel</MenuItem>}
                                        {user.role === 'seller' && <MenuItem onClick={() => { handleClose(); router.push('/seller'); }} sx={{ fontWeight: 600, color: 'primary.main' }}>Seller Panel</MenuItem>}
                                        <MenuItem onClick={handleLogout} sx={{ fontWeight: 600, color: 'error.main' }}>Logout</MenuItem>
                                    </Menu>
                                </>
                            )}

                            <Button
                                component={Link}
                                href="/cart"
                                variant="contained"
                                startIcon={<ShoppingCartIcon />}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    fontWeight: 800,
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    display: { xs: 'none', sm: 'flex' }
                                }}
                            >
                                My Cart
                            </Button>

                            <IconButton component={Link} href="/cart" sx={{ display: { xs: 'flex', sm: 'none' }, color: 'primary.main' }}>
                                <Badge badgeContent={0} color="error">
                                    <ShoppingCartIcon />
                                </Badge>
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </HideOnScroll>
    );
}
