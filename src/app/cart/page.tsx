'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  quantity: number;
  price: string;
  itemTotal: string;
  Product: {
    productName: string;
    images: string[];
  };
  Seller: {
    shop_name: string;
  };
}

export default function CartPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[]; subtotal: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await api.get('/cart');
        setCart(response.data);
      } catch (err) {
        console.error('Failed to fetch cart', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [token, router]);

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await api.put('/cart/update', { cartItemId, quantity: newQuantity });
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      alert('Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await api.post('/cart/remove', { cartItemId }); // Assuming POST/DELETE based on backend
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    try {
      // Mocking delivery address for now
      await api.post('/orders/place', {
        deliveryAddress: { street: 'Main St', city: 'Surat' },
        latitude: 21.1702,
        longitude: 72.8311
      });
      alert('Order placed successfully! Check your orders.');
      router.push('/');
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-slate-500">Loading your cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 font-medium">Add some items to get started!</p>
        <button 
          onClick={() => router.push('/')}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100"
        >
          Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Shopping Cart</h1>
        
        {cart.items.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex gap-6 items-center shadow-sm">
            <div className="size-24 bg-slate-50 rounded-2xl overflow-hidden p-2 flex-shrink-0">
              <img 
                src={item.Product.images?.[0] || 'https://placehold.co/200x200/f8fafc/059669?text=Item'} 
                className="w-full h-full object-contain"
                alt={item.Product.productName}
              />
            </div>
            
            <div className="flex-grow">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{item.Seller.shop_name}</p>
              <h3 className="font-bold text-slate-800 text-lg">{item.Product.productName}</h3>
              <p className="text-slate-400 font-bold text-sm">₹{item.price} each</p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-4 bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="size-8 bg-white rounded-lg flex items-center justify-center font-bold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  -
                </button>
                <span className="font-black text-slate-700 w-6 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="size-8 bg-white rounded-lg flex items-center justify-center font-bold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  +
                </button>
              </div>
              <span className="font-black text-xl text-slate-900">₹{item.itemTotal}</span>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Remove Item
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-24">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Summary</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-slate-500 font-bold">
              <span>Subtotal</span>
              <span>₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-bold">
              <span>Delivery Fee</span>
              <span className="text-emerald-600 underline">Free</span>
            </div>
            <div className="h-[1px] bg-slate-100 my-4"></div>
            <div className="flex justify-between text-2xl font-black text-slate-900">
              <span>Total</span>
              <span>₹{cart.subtotal}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-lg shadow-2xl hover:bg-slate-800 hover:scale-[1.02] transition-all"
          >
            Checkout with Flash
          </button>
          
          <div className="mt-8 flex items-center gap-3 justify-center text-slate-400">
            <span className="text-sm font-bold">Secure Checkout</span>
            <div className="size-2 bg-slate-200 rounded-full"></div>
            <span className="text-sm font-bold">Multi-Seller Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
