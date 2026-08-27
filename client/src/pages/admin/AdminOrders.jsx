import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { addToast } = useToast();

  const STATUSES = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOrders({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search ? search : undefined
      });
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId, newStatus, currentTracking) => {
    try {
      const res = await api.updateAdminOrderStatus(orderId, {
        status: newStatus,
        trackingNumber: currentTracking
      });
      if (res.success) {
        addToast(`Order ${orderId} marked as ${newStatus}.`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
      }
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dkart-charcoal tracking-tight">
            Order Fulfillment & Courier Dispatch ({orders.length})
          </h1>
          <p className="text-xs text-gray-500">
            Process incoming Cash on Delivery and online Pakistani customer orders
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-dkart-blue"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-dkart-blue text-white rounded-xl text-xs font-bold shadow-dkart"
          >
            Search
          </button>
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-dkart-blue text-white shadow-dkart'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse text-xs">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            No orders found matching the selected criteria.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-dkart-blue">{ord.id}</span>
                      <span className="text-xs text-gray-400">• {ord.created_at}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-gray-100 text-gray-700">
                        {ord.payment_method}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-dkart-charcoal">
                      {ord.customer_name}{' '}
                      <span className="text-gray-500 font-normal">({ord.customer_phone})</span>
                    </p>
                  </div>

                  {/* Status Dropdown & Total */}
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <span className="text-[11px] text-gray-400 block">Total Amount</span>
                      <span className="text-sm font-black text-dkart-charcoal">
                        {formatPrice(ord.total_amount)}
                      </span>
                    </div>

                    <select
                      value={ord.order_status}
                      onChange={(e) =>
                        handleStatusChange(ord.id, e.target.value, ord.tracking_number)
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        ord.order_status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ord.order_status === 'Cancelled'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-blue-50 text-dkart-blue border-blue-200'
                      }`}
                    >
                      {STATUSES.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address & Items Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div>
                    <span className="font-bold text-gray-400 text-[10px] uppercase">
                      Shipping Destination
                    </span>
                    <p className="text-gray-700 font-medium mt-0.5">
                      {ord.shipping_address?.streetAddress || ord.shipping_address?.street_address},{' '}
                      {ord.shipping_address?.area ? `${ord.shipping_address.area}, ` : ''}
                      {ord.shipping_address?.city}, {ord.shipping_address?.province}
                    </p>
                    {ord.notes && (
                      <p className="text-[11px] text-amber-700 italic mt-1">Note: "{ord.notes}"</p>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-gray-400 text-[10px] uppercase">
                      Ordered Line Items
                    </span>
                    <div className="space-y-1 mt-0.5">
                      {ord.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-gray-700">
                          <span className="truncate max-w-[200px]">
                            {item.quantity}x {item.title}
                          </span>
                          <span className="font-semibold">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
