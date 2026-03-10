"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const AdminDashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await api.get('/admin/stats');
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    if (loading) return <div className="p-8 text-center font-medium">Initializing Admin Suite...</div>;

    const metrics = [
        { label: 'Global Sales', value: `₹${data?.revenue?.totalSales?.toLocaleString()}`, trend: '+12%', icon: '📈' },
        { label: 'Total Orders', value: data?.revenue?.totalOrders, trend: '+5%', icon: '📥' },
        { label: 'Admin Commission', value: `₹${data?.revenue?.totalCommission?.toLocaleString()}`, trend: '+15%', icon: '💎' },
        { label: 'Network Sellers', value: data?.totalSellers, trend: 'Active', icon: '🏪' },
    ];

    return (
        <div className="p-10 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Marketplace Intel</h1>
                <div className="flex gap-4">
                    <button className="bg-white px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 shadow-sm">Export Report</button>
                    <button className="bg-blue-600 px-4 py-2 rounded-lg font-semibold text-white shadow-lg shadow-blue-200">System Live</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform cursor-default">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-3xl">{m.icon}</span>
                            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full">{m.trend}</span>
                        </div>
                        <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{m.label}</div>
                        <div className="text-3xl font-black text-slate-900">{m.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Seller Distribution</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="font-bold text-slate-700">Premium Shop {s}</span>
                                <span className="text-slate-400 text-sm font-medium">Verifying...</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-indigo-900 p-10 rounded-3xl shadow-2xl shadow-indigo-200 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4">Launch Command Center</h3>
                        <p className="text-indigo-200 mb-8 max-w-xs">All modules are active. Deploy to production via the infrastructure panel.</p>
                        <button className="bg-white text-indigo-900 font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-950/20">Go Live</button>
                    </div>
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
