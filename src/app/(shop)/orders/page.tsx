'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
    id: number;
    orderNumber: string;
    totalAmount: string;
    status: string;
    createdAt: string;
    OrderSellers: {
        sellerId: number;
        amount: string;
        status: string;
        Seller: {
            shop_name: string;
        };
    }[];
}

export default function OrdersPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/user'); // Check backend route
                setOrders(response.data);
            } catch (err) {
                console.error('Failed to fetch orders', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token, router]);

    if (loading) return <div className="text-center py-20 font-bold text-slate-500">Fetching your orders...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-slate-900 mb-12">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold mb-6">You haven't placed any orders yet.</p>
                    <Link href="/" className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 italic transition-all hover:scale-105 inline-block">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                                    <h3 className="text-xl font-black">#{order.orderNumber}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Placed On</p>
                                    <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    {order.OrderSellers.map((os, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{os.Seller.shop_name}</p>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">{os.status}</p>
                                            </div>
                                            <span className="font-black text-slate-900">₹{os.amount}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                    <div>
                                        <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Paid</p>
                                        <p className="text-3xl font-black text-slate-900">₹{order.totalAmount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
