'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
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
    Divider,
    useMediaQuery,
} from '@mui/material';
import {
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon,
    Room as RoomIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Menu as MenuIcon,
    Close as CloseIcon,
    AccountCircle,
} from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import MuiBackButton from './MuiBackButton';
import MobileNavbarDrawer from './MobileNavbarDrawer';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    '&:hover': {
        backgroundColor: '#e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    },
    marginRight: theme.spacing(1),
    marginLeft: 0,
    width: '100%',
    transition: theme.transitions.create(['background-color', 'box-shadow', 'width']),
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
        padding: theme.spacing(1.2, 1.2, 1.2, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        fontWeight: 600,
        fontSize: '0.9rem',
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
    const { cartCount } = useCart();
    const router = useRouter();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    // Responsive Breakpoints
    const isBelow1359 = useMediaQuery('(max-width:1359px)');
    const isBelow1024 = useMediaQuery('(max-width:1024px)');
    const isBelow900 = useMediaQuery('(max-width:900px)');
    const isBelow768 = useMediaQuery('(max-width:768px)');
    const isBelow425 = useMediaQuery('(max-width:425px)');
    const isBelow375 = useMediaQuery('(max-width:375px)');
    const isBelow320 = useMediaQuery('(max-width:320px)');

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            if (query.trim()) {
                router.push(`/products?search=${encodeURIComponent(query.trim())}`);
            } else {
                router.push('/products');
            }
        }, 500),
        [router]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            debouncedSearch.cancel();
            if (searchQuery.trim()) {
                router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            } else {
                router.push('/products');
            }
        }
    };

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

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setIsDrawerOpen(open);
    };

    return (
        <>
            <HideOnScroll>
                <AppBar 
                    position="sticky" 
                    elevation={0}
                    sx={{ 
                        zIndex: 1201, 
                        bgcolor: 'rgba(255, 255, 255, 0.95)', 
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 4px 30px rgba(0,0,0,0.03)'
                    }}
                >
                    <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2 } }}>
                        <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 80 }, gap: { xs: 0.5, sm: 1.5, md: 2 }, justifyContent: 'space-between' }}>
                            {/* Logo Container */}
                            <Box
                                component={Link}
                                href="/"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textDecoration: 'none',
                                    gap: 1.5,
                                    flexShrink: 0,
                                    mr: { xs: 1, md: 4 }
                                }}
                            >
                                <img 
                                    src="/logo.png" 
                                    alt="FlashBasket Logo" 
                                    style={{ width: isBelow320 ? 32 : 40, height: isBelow320 ? 32 : 40, objectFit: 'contain' }} 
                                />
                                {!isBelow320 && (
                                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', whiteSpace: 'nowrap', fontSize: isBelow425 ? '1.1rem' : '1.5rem' }}>
                                    FlashBasket
                                </Typography>
                            )}
                        </Box>

                        {/* Search Bar - Responsive Width */}
                        {(!isBelow768 || showMobileSearch) && (
                            <Box sx={{ 
                                flexGrow: 1, 
                                display: 'flex', 
                                justifyContent: 'center',
                                position: isBelow768 ? (showMobileSearch ? 'absolute' : 'relative') : 'relative',
                                left: isBelow768 ? 0 : 'auto',
                                right: isBelow768 ? 0 : 'auto',
                                px: isBelow768 ? 2 : 0,
                                bgcolor: isBelow768 ? 'white' : 'transparent',
                                zIndex: 110,
                                height: '100%',
                                alignItems: 'center',
                                transition: 'all 0.3s ease'
                            }}>
                                <Search sx={{ 
                                    maxWidth: isBelow1024 ? (isBelow900 ? '400px' : '500px') : (isBelow1359 ? '600px' : '800px'),
                                    width: { xs: '100%', sm: 'auto' }
                                }}>
                                    <SearchIconWrapper>
                                        <SearchIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                                    </SearchIconWrapper>
                                    <StyledInputBase
                                        placeholder="Search products..."
                                        inputProps={{ 'aria-label': 'search' }}
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleSearchKeyDown}
                                        autoFocus={showMobileSearch}
                                    />
                                    {isBelow768 && showMobileSearch && (
                                        <IconButton size="small" onClick={() => setShowMobileSearch(false)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Search>
                            </Box>
                        )}

                        {/* Actions Container */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5, md: 2 }, flexShrink: 0 }}>
                            {/* Search Icon for mobile screens */}
                            {isBelow768 && !isBelow425 && (
                                <IconButton onClick={() => setShowMobileSearch(!showMobileSearch)} sx={{ color: 'text.secondary' }}>
                                    {showMobileSearch ? <CloseIcon /> : <SearchIcon />}
                                </IconButton>
                            )}

                                {!user ? (
                                    <>
                                        {!isBelow425 && (
                                            <Button 
                                                component={Link} 
                                                href="/login" 
                                                sx={{ 
                                                    color: 'text.primary', 
                                                    fontWeight: 800,
                                                    fontSize: isBelow900 ? '0.85rem' : '1rem',
                                                    minWidth: 'auto',
                                                    px: { xs: 1, md: 2 }
                                                }}
                                            >
                                                Login
                                            </Button>
                                        )}
                                        {!isBelow900 && (
                                            <Button
                                                component={Link}
                                                href="/register"
                                                variant="contained"
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    fontWeight: 900,
                                                    px: 3,
                                                    borderRadius: 2,
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Sign Up
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {!isBelow900 && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap' }}>
                                                    {user.user_name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    Buyer
                                                </Typography>
                                            </Box>
                                        )}
                                        {!isBelow425 && (
                                            <Tooltip title="Profile">
                                                <IconButton onClick={handleMenu} sx={{ p: 0.5 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                                                        {user.user_name?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
                                            PaperProps={{
                                                sx: { mt: 1.5, minWidth: 200, borderRadius: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }
                                            }}
                                        >
                                            <MenuItem onClick={() => { handleClose(); router.push('/user/profile'); }}>Profile</MenuItem>
                                            <MenuItem onClick={() => { handleClose(); router.push('/user/favourites'); }}>Favourites</MenuItem>
                                            <MenuItem onClick={() => { handleClose(); router.push('/orders'); }}>Orders</MenuItem>
                                            <Divider />
                                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 700 }}>Logout</MenuItem>
                                        </Menu>
                                    </>
                                )}

                                {/* Cart - Simplified on mobile */}
                                <Button
                                    component={Link}
                                    href="/cart"
                                    variant={isBelow768 ? "text" : "contained"}
                                    startIcon={
                                        <Badge badgeContent={cartCount} color="error">
                                            <ShoppingCartIcon sx={{ 
                                                fontSize: isBelow768 ? '1.75rem' : 'inherit',
                                                color: isBelow768 ? 'primary.main' : 'inherit'
                                            }} />
                                        </Badge>
                                    }
                                    sx={{
                                        bgcolor: isBelow768 ? 'transparent' : 'primary.main',
                                        color: isBelow768 ? 'primary.main' : 'white',
                                        fontWeight: 900,
                                        borderRadius: 2,
                                        px: isBelow768 ? 1 : (isBelow900 ? 2 : 4),
                                        py: isBelow900 ? 1 : 1.5,
                                        minWidth: 'auto',
                                        fontSize: isBelow900 ? '0.85rem' : '1rem',
                                        boxShadow: isBelow768 ? 'none' : '0 8px 16px rgba(12, 131, 31, 0.2)',
                                        '&:hover': { 
                                            bgcolor: isBelow768 ? alpha('#0C831F', 0.05) : 'primary.dark',
                                            boxShadow: isBelow768 ? 'none' : '0 12px 20px rgba(12, 131, 31, 0.3)'
                                        },
                                        whiteSpace: 'nowrap',
                                        '& .MuiButton-startIcon': {
                                            margin: isBelow768 ? 0 : '0 8px 0 -4px',
                                            mr: isBelow768 ? 0 : 1
                                        }
                                    }}
                                >
                                    {!isBelow768 && 'My Cart'}
                                </Button>

                                {/* Mobile Hamburger Menu Icon */}
                                {isBelow425 && (
                                    <IconButton 
                                        onClick={() => setIsDrawerOpen(!isDrawerOpen)} 
                                        sx={{ 
                                            color: 'primary.main', 
                                            bgcolor: alpha(theme.palette.primary.main, 0.08), 
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } 
                                        }}
                                    >
                                        {isDrawerOpen ? <CloseIcon /> : <MenuIcon />}
                                    </IconButton>
                                )}
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>
            </HideOnScroll>

            {/* Mobile Sidebar / Drawer - Moved outside HideOnScroll to fix JSX error */}
            <MobileNavbarDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user}
                cartCount={cartCount}
                onProductsClick={() => { router.push('/products'); setIsDrawerOpen(false); }}
            />
        </>
    );
}
