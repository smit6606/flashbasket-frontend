'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Seller {
    id: number;
    shop_name: string;
    shop_description: string;
    shop_image: string;
    latitude: number;
    longitude: number;
}

export default function SellersPage() {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                const response = await api.get('/sellers');
                setSellers(response.data);
            } catch (err) {
                console.error('Failed to fetch sellers', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSellers();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-slate-100 rounded-[2.5rem] h-64 animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header className="mb-12">
                <h1 className="text-5xl font-extrabold text-slate-900 mb-4">Nearby Sellers</h1>
                <p className="text-slate-500 text-lg max-w-2xl">Discover local shops providing the fastest delivery in your area.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sellers.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold">No sellers found near you yet.</p>
                    </div>
                ) : (
                    sellers.map((seller) => (
                        <Link
                            href={`/sellers/${seller.id}`}
                            key={seller.id}
                            className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500"
                        >
                            <div className="bg-slate-50 rounded-3xl h-48 mb-6 overflow-hidden relative">
                                <img
                                    src={seller.shop_image || 'https://placehold.co/600x400/f8fafc/059669?text=FlashBasket+Store'}
                                    alt={seller.shop_name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm">
                                    <span className="text-emerald-600 font-bold text-sm">Verified</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{seller.shop_name}</h3>
                                <p className="text-slate-500 line-clamp-2 text-sm mb-6 leading-relaxed">
                                    {seller.shop_description || 'High-quality local products delivered right to your doorstep.'}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shop Now</span>
                                    <div className="size-10 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:translate-x-1 transition-all">
                                        →
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
