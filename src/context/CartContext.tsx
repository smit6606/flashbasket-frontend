'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartItem {
    id?: number; 
    productId: number;
    sellerId: number;
    quantity: number;
    price?: string;      // Discounted price at purchase
    discountPercent?: number;
    productName?: string;
    images?: string[];
}

interface CartContextType {
    cartCount: number;
    cartItems: CartItem[];
    cartData: any;
    refreshCart: () => Promise<void>;
    getItemFromCart: (productId: number) => CartItem | undefined;
    addToCart: (product: any, quantity: number) => Promise<void>;
    updateQuantity: (productId: number, newQuantity: number, cartItemId?: number) => Promise<void>;
    removeFromCart: (productId: number, cartItemId?: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartData, setCartData] = useState<any>(null);

    const refreshCart = useCallback(async () => {
        if (!user) {
            // Load Guest Cart
            const guest = localStorage.getItem('guestCart');
            if (guest) {
                try {
                    const localItems = JSON.parse(guest);
                    if (localItems.length === 0) {
                        setCartItems([]);
                        setCartCount(0);
                        setCartData(null);
                        return;
                    }

                    // Fetch actual product details for these IDs
                    const ids = localItems.map((i: any) => i.productId).join(',');
                    const response = await api.get(`/products?id=${ids}&limit=50`);
                    const products = response.data?.items || [];

                    let guestItemTotal = 0;
                    const enrichedItems = localItems.map((li: any) => {
                        const p = products.find((prod: any) => prod.id === li.productId);
                        const price = parseFloat(p?.finalPrice || p?.price || '0');
                        guestItemTotal += price * li.quantity;
                        return {
                            ...li,
                            productName: p?.productName || 'Unknown Product',
                            images: p?.images || [],
                            price: price.toFixed(2),
                            discountPercent: p?.discountPercent || 0
                        };
                    });

                    setCartItems(enrichedItems);
                    setCartCount(enrichedItems.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0));
                    setCartData({
                        items: enrichedItems,
                        itemTotal: guestItemTotal.toFixed(2)
                    });
                } catch (err) {
                    console.error('Guest cart refresh failed', err);
                }
            } else {
                setCartItems([]);
                setCartCount(0);
                setCartData(null);
            }
            return;
        }
        try {
            const response = await api.get(`/cart?t=${Date.now()}`);
            const data = response.data;
            const items = data?.items?.map((i: any) => {
                const p = i.Product;
                return {
                    id: i.id,
                    productId: i.productId,
                    sellerId: i.sellerId,
                    quantity: i.quantity,
                    price: i.price,
                    discountPercent: i.discountPercent,
                    productName: p?.productName,
                    images: p?.images
                };
            }) || [];
            const total = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
            setCartItems(items);
            setCartCount(total);
            setCartData(data);
        } catch (error) {
            console.error('FAILED TO REFRESH CART:', error);
        }
    }, [user]);

    const addToCart = async (product: any, quantity: number) => {
        if (!user) {
            // Guest Logic
            const guest = localStorage.getItem('guestCart');
            let items = guest ? JSON.parse(guest) : [];
            const existing = items.find((i: any) => i.productId === product.id);
            if (existing) {
                existing.quantity += quantity;
            } else {
                items.push({
                    productId: product.id,
                    sellerId: product.Seller?.id || product.sellerId,
                    quantity: quantity
                });
            }
            localStorage.setItem('guestCart', JSON.stringify(items));
            await refreshCart();
            return;
        }

        // Authenticated Logic
        await api.post('/cart/add', {
            productId: product.id,
            sellerId: product.Seller?.id || product.sellerId,
            quantity: quantity
        });
        await refreshCart();
    };

    const updateQuantity = async (productId: number, newQuantity: number, cartItemId?: number) => {
        if (!user) {
            let items = JSON.parse(localStorage.getItem('guestCart') || '[]');
            if (newQuantity <= 0) {
                items = items.filter((i: any) => i.productId !== productId);
            } else {
                const item = items.find((i: any) => i.productId === productId);
                if (item) item.quantity = newQuantity;
            }
            localStorage.setItem('guestCart', JSON.stringify(items));
            await refreshCart();
            return;
        }

        if (newQuantity <= 0) {
            await api.delete('/cart/remove', { cartItemId });
        } else {
            await api.put('/cart/update', { cartItemId, quantity: newQuantity });
        }
        await refreshCart();
    };

    const removeFromCart = async (productId: number, cartItemId?: number) => {
        if (!user) {
            let items = JSON.parse(localStorage.getItem('guestCart') || '[]');
            items = items.filter((i: any) => i.productId !== productId);
            localStorage.setItem('guestCart', JSON.stringify(items));
            await refreshCart();
            return;
        }
        await api.delete('/cart/remove', { cartItemId });
        await refreshCart();
    };

    const getItemFromCart = useCallback((productId: number) => {
        return cartItems.find(item => item.productId === productId);
    }, [cartItems]);

    useEffect(() => {
        const mergeCarts = async () => {
            if (!user) return;
            const guest = localStorage.getItem('guestCart');
            if (guest) {
                try {
                    const items = JSON.parse(guest);
                    // Add items one by one (or you could implement a bulk API if needed)
                    for (const item of items) {
                        await api.post('/cart/add', {
                            productId: item.productId,
                            sellerId: item.sellerId,
                            quantity: item.quantity
                        });
                    }
                    localStorage.removeItem('guestCart');
                    await refreshCart();
                } catch (err) {
                    console.error('Failed to merge guest cart', err);
                }
            }
        };

        refreshCart();
        mergeCarts();
    }, [user, refreshCart]);

    return (
        <CartContext.Provider value={{ 
            cartCount, 
            cartItems, 
            cartData,
            refreshCart, 
            getItemFromCart, 
            addToCart, 
            updateQuantity, 
            removeFromCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
