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
            { name: 'Dashboard', path: '/admin', icon: '📊', exact: true },
            { name: 'Orders', path: '/admin/orders', icon: '🛒' },
            { name: 'Users', path: '/admin/users', icon: '👥' },
            { name: 'Sellers', path: '/admin/sellers', icon: '🏪' },
            { name: 'Delivery Drivers', path: '/admin/delivery', icon: '🚚' },
            { name: 'Categories', path: '/admin/categories', icon: '📁' },
            { name: 'Products', path: '/admin/products', icon: '📦' },
            { name: 'Reports', path: '/admin/analytics', icon: '📈' },
            { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
        ],
        seller: [
            { name: 'Dashboard', path: '/seller', icon: '🏠', exact: true },
            { name: 'Live Orders', path: '/seller/orders', icon: '🛒' },
            { name: 'Past Orders', path: '/seller/history', icon: '📜' },
            { name: 'My Catalog', path: '/seller/products', icon: '📦' },
            { name: 'Sales Insights', path: '/seller/analytics', icon: '📊' },
            { name: 'Store Account', path: '/seller/account', icon: '👤' },
        ],
        delivery: [
            { name: 'Dashboard', path: '/delivery', icon: '🚚', exact: true },
            { name: 'Active Trips', path: '/delivery/trips', icon: '🏍️' },
            { name: 'Past Orders', path: '/delivery/history', icon: '📜' },
            { name: 'Earnings', path: '/delivery/earnings', icon: '💰' },
            { name: 'Account', path: '/delivery/profile', icon: '👤' },
        ]
    };

    const links = menuItems[role as keyof typeof menuItems] || menuItems.admin;

    // root-level paths need exact match to avoid mis-highlighting Dashboard
    // when subroutes are active (e.g. /delivery/history matching /delivery)
    const rootPaths = ['/admin', '/seller', '/delivery'];

    const isActivePath = (linkPath: string, exact?: boolean) => {
        if (exact || rootPaths.includes(linkPath)) {
            return pathname === linkPath;
        }
        return pathname === linkPath || pathname.startsWith(`${linkPath}/`);
    };

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
                    const isActive = isActivePath(link.path, (link as any).exact);
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
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-base">
                        {user?.user_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user?.user_name || user?.email || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate capitalize">{user?.role || 'driver'} · {user?.email || ''}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
