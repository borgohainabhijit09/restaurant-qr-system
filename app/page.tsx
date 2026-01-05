import Link from 'next/link';
import { QrCode, Users, Shield, ChefHat, TrendingUp, Smartphone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">QR Ordering System</h1>
                <p className="text-xs text-slate-500">Restaurant Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
            Modern Table Ordering
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Streamline your restaurant operations with QR-based ordering.
            Customers order, staff manages, owners monitor.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {/* Customer Card */}
          <div className="space-y-4">
            <Link href="/table/T01" className="group block">
              <div className="card h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Customer</h3>
                  <p className="text-sm text-slate-600 mb-6">
                    Scan QR code to browse menu and place orders
                  </p>
                  <div className="inline-flex items-center text-emerald-600 font-semibold group-hover:gap-2 transition-all">
                    Try Demo Table
                    <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/tables" className="block text-center">
              <div className="text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                View All Tables →
              </div>
            </Link>
          </div>

          {/* Waiter Card */}
          <Link href="/waiter/login" className="group">
            <div className="card h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Waiter</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Manage tables, update order status, and serve customers
                </p>
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                  Waiter Login
                  <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Kitchen Card */}
          <Link href="/kitchen/login" className="group">
            <div className="card h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Kitchen</h3>
                <p className="text-sm text-slate-600 mb-6">
                  View incoming orders and manage preparation status
                </p>
                <div className="inline-flex items-center text-orange-600 font-semibold group-hover:gap-2 transition-all">
                  Kitchen Login
                  <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Card */}
          <Link href="/admin/login" className="group">
            <div className="card h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Admin</h3>
                <p className="text-slate-600 mb-6">
                  Monitor all tables, manage menu, and oversee operations
                </p>
                <div className="inline-flex items-center text-purple-600 font-semibold group-hover:gap-2 transition-all">
                  Admin Login
                  <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6">
            <div className="text-3xl font-bold text-emerald-600 mb-2">10</div>
            <div className="text-slate-600">Active Tables</div>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">19</div>
            <div className="text-slate-600">Menu Items</div>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
            <div className="text-slate-600">Staff Members</div>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">Live</div>
            <div className="text-slate-600">Real-time Updates</div>
          </div>
        </div>

        {/* Product Features */}
        <div className="mt-24 mb-16 px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A comprehensive solution designed to modernize your restaurant operations from table to kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Contactless Ordering</h3>
              <p className="text-slate-600">
                Customers scan unique QR codes at their tables to browse the menu and place orders instantly without waiting.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 text-orange-600">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Kitchen Display</h3>
              <p className="text-slate-600">
                Real-time order tickets appear instantly in the kitchen. Chefs can manage status from Prep to Ready with one tap.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Control</h3>
              <p className="text-slate-600">
                Easily manage your menu items, categories, prices, and tables. Generate QR codes and monitor floor activity.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Staff Efficiency</h3>
              <p className="text-slate-600">
                Waiters get their own dashboard to view assigned tables, check active orders, and assist customers better.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real-time Insights</h3>
              <p className="text-slate-600">
                Track active tables, revenue, and order volume in real-time to make data-driven decisions for your business.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 text-pink-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Mobile Optimized</h3>
              <p className="text-slate-600">
                Fully responsive design ensuring a smooth experience for customers and staff on any smartphone or tablet.
              </p>
            </div>
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 text-sm">
          <p>Restaurant QR Ordering System MVP © 2026</p>
          <p className="mt-1">
            Owned by <a href="https://sygmiainnovative.co.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">Sygmia Innovative</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
