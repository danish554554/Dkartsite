import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Truck,
  LogOut,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatPrice } from '../utils/helpers';

export default function AccountPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const res = await api.getUserOrders();
        if (res.success) setOrders(res.orders);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Profile Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-dkart-blue text-white flex items-center justify-center text-2xl font-black shadow-dkart">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-dkart-charcoal">
                  {user.name}
                </h1>
                {isAdmin && (
                  <span className="bg-dkart-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{user.email} • {user.phone || 'No phone set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2.5 bg-dkart-blue-light text-dkart-blue rounded-xl text-xs font-bold hover:bg-dkart-blue hover:text-white transition"
              >
                Go to Admin Portal
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition flex items-center gap-1.5"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Orders History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-dkart-charcoal flex items-center gap-2">
              <Package size={20} className="text-dkart-blue" />
              <span>My Orders ({orders.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 animate-pulse">
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Package size={30} />
              </div>
              <h3 className="text-base font-bold text-dkart-charcoal">No past orders yet</h3>
              <p className="text-xs text-gray-500">
                You haven't placed any orders with this account yet.
              </p>
              <Link
                to="/shop"
                className="inline-block px-5 py-2.5 bg-dkart-blue text-white rounded-xl text-xs font-bold shadow-dkart"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4"
                >
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase">Order ID</span>
                      <h3 className="text-base font-black text-dkart-charcoal">{order.id}</h3>
                      <p className="text-[11px] text-gray-400">Placed on: {order.created_at}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                          order.order_status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.order_status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-dkart-blue'
                        }`}
                      >
                        {order.order_status}
                      </span>
                      <Link
                        to={`/track-order?orderId=${order.id}`}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-dkart-charcoal text-xs font-bold rounded-xl transition flex items-center gap-1"
                      >
                        <Truck size={13} />
                        <span>Track</span>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80'}
                            alt=""
                            className="w-12 h-12 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-dkart-charcoal">{item.title}</p>
                            <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-dkart-charcoal">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order footer total */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400">Payment: </span>
                      <span className="font-bold uppercase text-gray-700">{order.payment_method}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 mr-2">Total Amount:</span>
                      <span className="text-base font-black text-dkart-blue">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
