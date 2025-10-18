'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Users, Image, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user/auth state
    if (user !== undefined) setLoading(false);
    // If not logged in and not on login page, redirect to login
    if (!user && !loading && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, router, pathname, loading]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not logged in and on login page, show children (login form)
  if (!user && pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not logged in and not on login page, show nothing (redirecting)
  if (!user) {
    return null;
  }

  const menuItems = [
    { path: '/admin/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/banners', icon: Image, label: 'Banners' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden fixed h-full z-40`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">ticklewala Admin</h1>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg mb-2 transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
            }}
            className="flex items-center px-4 py-3 rounded-lg mb-2 text-gray-300 hover:bg-gray-800 hover:text-white transition w-full mt-8"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" target="_blank" className="text-sm text-gray-600 hover:text-gray-900">
              View Store
            </Link>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
