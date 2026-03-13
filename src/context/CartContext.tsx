'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartItem {
    id?: number; // DB ID (optional for guest)
    productId: number;
    quantity: number;
    price: string;
    productName?: string; // For guest storage
    images?: string[];    // For guest storage
}

interface CartContextType {
    cartCount: number;
    cartItems: CartItem[];
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

    const refreshCart = useCallback(async () => {
        if (!user) {
            // Load Guest Cart
            const guest = localStorage.getItem('guestCart');
            if (guest) {
                const items = JSON.parse(guest);
                setCartItems(items);
                setCartCount(items.reduce((sum: number, i: any) => sum + i.quantity, 0));
            } else {
                setCartItems([]);
                setCartCount(0);
            }
            return;
        }
        try {
            const response = await api.get(`/cart?t=${Date.now()}`);
            const items = response.data?.items?.map((i: any) => ({
                id: i.id,
                productId: i.productId,
                quantity: i.quantity,
                price: i.price,
                productName: i.Product?.productName,
                images: i.Product?.images
            })) || [];
            const total = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
            setCartItems(items);
            setCartCount(total);
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
                    quantity: quantity,
                    price: product.discountPrice || product.price,
                    productName: product.productName,
                    images: product.images
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
            quantity: quantity,
            price: product.discountPrice || product.price
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
                            quantity: item.quantity,
                            price: item.price
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
