'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, user, router]);

  if (loading) return <div>Loading Admin Stats...</div>;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 font-display">Global Dashboard</h1>
          <p className="text-slate-500 font-medium">Monitoring FlashBasket ecosystem performance</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-bold text-sm">
          ADMIN ACCOUNT
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="bg-blue-50" />
        <StatCard title="Total Sellers" value={stats.totalSellers} icon="🏪" color="bg-amber-50" />
        <StatCard title="Total Orders" value={stats.orders?.totalOrders || 0} icon="📦" color="bg-purple-50" />
        <StatCard title="Total Sales" value={`₹${stats.orders?.totalSales || 0}`} icon="💰" color="bg-emerald-50" />
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-10 rounded-[2.5rem] text-white flex justify-between items-center">
        <div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Total platform profit</p>
          <h2 className="text-5xl font-black">₹{stats.orders?.totalCommission || 0}</h2>
          <p className="text-emerald-400 font-bold mt-2">10% Platform Commission</p>
        </div>
        <div className="text-8xl opacity-10">📉</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-bold text-xl mb-6 flex justify-between">
            System Quick Actions
            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest self-center">Updated Just Now</span>
          </h3>
          <div className="space-y-4">
            <ActionButton label="Manage All Sellers" />
            <ActionButton label="View Payment History" />
            <ActionButton label="System Logs" />
            <ActionButton label="Bulk Notify Users" />
          </div>
        </div>
        
        <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-100">
          <h3 className="font-bold text-xl mb-4">Marketplace Health</h3>
          <p className="opacity-80 mb-6 font-medium">Everything is running smoothly. 100% server uptime documented in the last 24 hours.</p>
          <div className="flex gap-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex-grow h-12 bg-white/20 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className={`p-8 rounded-[2rem] ${color} shadow-sm border border-black/5`}>
      <div className="text-3xl mb-4">{icon}</div>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-900">{value}</h4>
    </div>
  );
}

function ActionButton({ label }: any) {
  return (
    <button className="w-full text-left px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
      {label}
    </button>
  );
}
