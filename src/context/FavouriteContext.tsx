'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface FavouriteContextType {
    favouriteIds: number[];
    isFavourite: (productId: number) => boolean;
    toggleFavourite: (productId: number) => Promise<void>;
    refreshFavourites: () => Promise<void>;
}

const FavouriteContext = createContext<FavouriteContextType | undefined>(undefined);

export const FavouriteProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [favouriteIds, setFavouriteIds] = useState<number[]>([]);

    const refreshFavourites = useCallback(async () => {
        if (!user) {
            setFavouriteIds([]);
            return;
        }
        try {
            const response = await api.get('/user/favourites/my');
            const ids = response.data.map((fav: any) => fav.productId);
            setFavouriteIds(ids);
        } catch (error) {
            console.error('Failed to fetch favourites', error);
        }
    }, [user]);

    const isFavourite = useCallback((productId: number) => {
        return favouriteIds.includes(productId);
    }, [favouriteIds]);

    const toggleFavourite = async (productId: number) => {
        if (!user) {
            toast.info('Please login to add favourites');
            return;
        }
        try {
            const response = await api.post('/user/favourites/toggle', { productId });
            if (response.data.isFavourite) {
                setFavouriteIds(prev => [...prev, productId]);
            } else {
                setFavouriteIds(prev => prev.filter(id => id !== productId));
            }
        } catch (error) {
            console.error('Failed to update favourites', error);
        }
    };

    useEffect(() => {
        refreshFavourites();
    }, [refreshFavourites]);

    return (
        <FavouriteContext.Provider value={{ favouriteIds, isFavourite, toggleFavourite, refreshFavourites }}>
            {children}
        </FavouriteContext.Provider>
    );
};

export const useFavourites = () => {
    const context = useContext(FavouriteContext);
    if (!context) {
        throw new Error('useFavourites must be used within a FavouriteProvider');
    }
    return context;
};
