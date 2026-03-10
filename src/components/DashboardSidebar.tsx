'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const role = user?.role || 'admin';

    const menuItems = {
        admin: [
            { name: 'Dashboard Layout', path: '/admin', icon: '📊' },
            { name: 'Users Center', path: '/admin/users', icon: '👥' },
            { name: 'Seller Stores', path: '/admin/sellers', icon: '🏪' },
            { name: 'Network Analytics', path: '/admin/analytics', icon: '📈' },
        ],
        seller: [
            { name: 'Store Dashboard', path: '/seller', icon: '🏪' },
            { name: 'My Products', path: '/seller/products', icon: '📦' },
            { name: 'Active Orders', path: '/seller/orders', icon: '🛒' },
            { name: 'Store Analytics', path: '/seller/analytics', icon: '💸' },
        ],
        delivery: [
            { name: 'Driver Hub', path: '/delivery', icon: '🚚' },
            { name: 'Active Trips', path: '/delivery/trips', icon: '🗺️' },
            { name: 'Earnings', path: '/delivery/earnings', icon: '💰' },
        ]
    };

    const links = menuItems[role as keyof typeof menuItems] || menuItems.admin;

    return (
        <aside className="w-[280px] bg-[#1e293b] text-white flex flex-col min-h-screen border-r border-slate-800 shadow-2xl relative z-10 hidden md:flex">
            <div className="p-6 h-[80px] flex gap-3 items-center border-b border-slate-700/50 bg-[#0f172a]/20">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-emerald-500/30 shadow-lg">
                    F
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-white leading-tight">FlashHQ</h1>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{role} Panel</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-8 space-y-1.5 custom-scrollbar">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Navigation</p>

                {links.map((link) => {
                    const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
                    return (
                        <Link key={link.name} href={link.path}>
                            <div
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-bold'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                                    }`}
                            >
                                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{link.icon}</span>
                                <span className="text-sm">{link.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="p-6 border-t border-slate-700/50 bg-[#0f172a]/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@flashbasket.com'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
