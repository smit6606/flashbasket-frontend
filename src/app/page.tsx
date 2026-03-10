'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Product {
  id: number;
  productName: string;
  price: string;
  images: string[];
  unit: string;
  Seller: {
    shop_name: string;
  };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Fresh Groceries <br />
            <span className="text-secondary">Delivered in Minutes</span>
          </h1>
          <p className="text-emerald-50 text-xl mb-10 opacity-90 max-w-lg">
            Shop from your favorite local stores with a single checkout. Fast, fresh, and lightning-speed delivery to your doorstep.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform">
              Shop Now
            </button>
            <button className="px-8 py-4 bg-emerald-800/30 backdrop-blur-md text-white border border-emerald-500/30 font-bold rounded-2xl hover:bg-emerald-800/50 transition-all">
              See Near You
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Featured Products</h2>
            <p className="text-slate-500 mt-1 font-medium">Handpicked from stores near you</p>
          </div>
          <button className="text-emerald-600 font-bold hover:underline">View All</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-3xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
                <div className="bg-slate-50 rounded-2xl h-48 mb-4 overflow-hidden relative">
                  <img 
                    src={product.images && product.images[0] ? product.images[0] : 'https://placehold.co/400x400/f8fafc/059669?text=FlashBasket'} 
                    alt={product.productName}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-6"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 shadow-sm">
                    {product.unit}
                  </div>
                </div>

                <div className="px-2">
                  <p className="text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wider">{product.Seller?.shop_name || 'Nearby Shop'}</p>
                  <h3 className="font-bold text-slate-800 line-clamp-1 mb-1">{product.productName}</h3>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-black text-slate-900">₹{product.price}</span>
                    <button className="size-10 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center hover:bg-emerald-700 hover:scale-110 transition-all">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm">
          <div className="size-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">🚀</div>
          <div>
            <h4 className="font-extrabold text-slate-900">Fast Delivery</h4>
            <p className="text-slate-500 text-sm">Within 15-20 minutes</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm">
          <div className="size-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl">🥦</div>
          <div>
            <h4 className="font-extrabold text-slate-900">Fresh Items</h4>
            <p className="text-slate-500 text-sm">Directly from sellers</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm">
          <div className="size-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl">🏷️</div>
          <div>
            <h4 className="font-extrabold text-slate-900">Best Prices</h4>
            <p className="text-slate-500 text-sm">Competitive local rates</p>
          </div>
        </div>
      </section>
    </div>
  );
}
