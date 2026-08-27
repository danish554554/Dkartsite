import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  ArrowUpRight,
  Truck,
  Plus
} from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await api.getAdminAnalytics();
        if (res.success) setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = analytics || {
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    lowStockProducts: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: []
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time business performance for Dkart Store (dkart.pk)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl text-xs font-bold shadow-dkart flex items-center gap-1.5 transition"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 bg-white border border-gray-200 text-dkart-charcoal hover:border-dkart-blue rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Truck size={16} />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Gross Sales */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-dkart-blue flex items-center justify-center font-black text-sm">
              Rs
            </div>
          </div>
          <p className="text-2xl font-black text-dkart-charcoal tracking-tight">
            {formatPrice(stats.totalSales)}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold">Online & COD confirmed</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShoppingCart size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-dkart-charcoal tracking-tight">
            {stats.totalOrders}
          </p>
          <span className="text-[11px] text-gray-500 font-medium">Nationwide customer orders</span>
        </div>

        {/* Pending Shipments */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Pending Delivery</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-dkart-orange flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-dkart-orange tracking-tight">
            {stats.pendingOrders}
          </p>
          <span className="text-[11px] text-orange-600 font-bold">Requires courier booking</span>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 tracking-tight">
            {stats.lowStockProducts}
          </p>
          <Link to="/admin/inventory" className="text-[11px] text-red-500 font-bold hover:underline">
            Manage inventory →
          </Link>
        </div>
      </div>

      {/* Grid: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-bold text-dkart-charcoal">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-dkart-blue hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                <tr>
                  <th className="p-2.5">Order</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Total</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders?.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-2.5 font-bold text-dkart-blue">{ord.id}</td>
                    <td className="p-2.5 font-medium text-gray-700">
                      {ord.customer_name}
                      <span className="block text-[10px] text-gray-400">{ord.customer_phone}</span>
                    </td>
                    <td className="p-2.5 font-black text-dkart-charcoal">
                      {formatPrice(ord.total_amount)}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.order_status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.order_status === 'Processing' || ord.order_status === 'Confirmed'
                            ? 'bg-blue-100 text-dkart-blue'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-bold text-dkart-charcoal">Top Sellers & Stock</h3>
            <Link to="/admin/products" className="text-xs font-bold text-dkart-blue hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {stats.topProducts?.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={prod.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-dkart-charcoal truncate max-w-[170px]">{prod.title}</p>
                    <p className="text-[11px] text-emerald-600 font-bold">{prod.units_sold} units sold</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-dkart-charcoal">{formatPrice(prod.sale_price || prod.price)}</p>
                  <p className="text-[10px] text-gray-400">{prod.stock_quantity} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
