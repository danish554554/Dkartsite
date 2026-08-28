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
  ChevronDown,
  Printer,
  MessageSquare,
  Package,
  ArrowRight,
  DollarSign,
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  User,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPrintOrder, setSelectedPrintOrder] = useState(null);

  const { addToast } = useToast();

  const STATUSES = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOrders({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search ? search : undefined
      });
      if (res.success) setOrders(res.data || []);
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
        addToast(`Order #${orderId} moved to ${newStatus}.`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
      }
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard!`, 'success');
  };

  // Trigger Print for Packing Slip
  const handlePrintSlip = (order) => {
    setSelectedPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Calculate Metrics
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => ['Pending', 'Confirmed'].includes(o.order_status)).length;
  const inTransitCount = orders.filter((o) => ['Processing', 'Shipped'].includes(o.order_status)).length;
  const deliveredCount = orders.filter((o) => o.order_status === 'Delivered').length;
  const totalCodValue = orders
    .filter((o) => o.order_status !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Helper for Stepper Progress
  const getStepProgress = (status) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Confirmed':
        return 2;
      case 'Processing':
        return 3;
      case 'Shipped':
        return 4;
      case 'Delivered':
        return 5;
      case 'Cancelled':
        return 0;
      default:
        return 2;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER & REFRESH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-dkart-blue/10 text-dkart-blue font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Shopify Operations Hub
            </span>
            <span className="text-xs text-gray-400">• Real-Time Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight mt-1">
            Order Fulfillment & Courier Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Process, pack, and dispatch nationwide Cash on Delivery parcels via Leopard & TCS Express
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-700 shadow-2xs hover:shadow transition flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-blue-50 text-dkart-blue rounded-xl">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-dkart-charcoal">{totalOrdersCount}</div>
          <p className="text-[11px] text-gray-400 font-medium">All incoming customer orders</p>
        </div>

        {/* Awaiting Fulfillment */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-card space-y-2 bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Action</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{pendingCount}</div>
          <p className="text-[11px] text-amber-600/90 font-semibold">Requires address confirmation & packing</p>
        </div>

        {/* In-Transit / Dispatched */}
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-card space-y-2 bg-gradient-to-br from-white to-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-dkart-blue uppercase tracking-wider">With Courier</span>
            <div className="p-2 bg-blue-100 text-dkart-blue rounded-xl">
              <Truck size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-dkart-blue">{inTransitCount}</div>
          <p className="text-[11px] text-blue-600/90 font-semibold">Dispatched via TCS / Leopard Express</p>
        </div>

        {/* Total COD Amount */}
        <div className="bg-white p-5 rounded-3xl border border-orange-200/80 shadow-card space-y-2 bg-gradient-to-br from-white to-orange-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-dkart-orange uppercase tracking-wider">COD To Collect</span>
            <div className="p-2 bg-orange-100 text-dkart-orange rounded-xl">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-dkart-orange">
            {formatPrice(totalCodValue)}
          </div>
          <p className="text-[11px] text-orange-700/90 font-semibold">Total receivables upon delivery</p>
        </div>
      </div>

      {/* 3. ADVANCED SEARCH & SEGMENT TABS */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order # (DK-...), Customer Name, Phone 03..., or City..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-dkart-blue transition font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-2xl text-xs font-bold shadow-dkart transition active:scale-98"
            >
              Search
            </button>
          </form>

          {/* Quick Stats Summary Badge */}
          <div className="text-xs text-gray-500 font-semibold whitespace-nowrap hidden sm:block">
            Showing <strong className="text-dkart-charcoal">{orders.length}</strong> orders
          </div>
        </div>

        {/* Status Filter Segment Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-gray-100 pt-3">
          {STATUSES.map((st) => {
            const count = st === 'All' ? orders.length : orders.filter((o) => o.order_status === st).length;
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-dkart-blue text-white shadow-md shadow-dkart-blue/20 scale-102'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ORDERS LIST CONTAINER */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-200/80 shadow-xs space-y-4">
            <div className="w-10 h-10 border-3 border-dkart-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-400">Fetching order fulfillment records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <Package size={28} />
            </div>
            <h3 className="text-base font-bold text-dkart-charcoal">No Orders Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              There are no orders matching the filter "{statusFilter}". When a customer orders, it will appear here instantly.
            </p>
          </div>
        ) : (
          orders.map((ord) => {
            const step = getStepProgress(ord.order_status);
            const address = ord.shipping_address || {};
            const cleanPhone = (ord.customer_phone || '').replace(/[^0-9]/g, '');
            const waPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone;
            const waMessage = `Assalam-o-Alaikum ${ord.customer_name},\nThis is Dkart.pk regarding your order #${ord.id}.\nTotal Amount (Cash on Delivery): Rs. ${Number(ord.total_amount).toLocaleString()}\nDelivery Address: ${address.streetAddress || address.street_address || ''}, ${address.city || ''}, ${address.province || ''}.\n\nPlease confirm if your address is correct so we can dispatch your parcel today via TCS.`;

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
              >
                {/* CARD HEADER */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/50 border-b border-gray-200/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Order ID, Time, Badges */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-xl">
                        <span className="text-xs font-black text-dkart-blue">#{ord.id}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(ord.id, 'Order ID')}
                          className="text-dkart-blue hover:opacity-75 transition p-0.5"
                          title="Copy Order ID"
                        >
                          <Copy size={12} />
                        </button>
                      </div>

                      <span className="text-xs text-gray-400 font-medium">
                        • {new Date(ord.created_at).toLocaleString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>

                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                        💵 COD (Unpaid)
                      </span>

                      {ord.tracking_number && (
                        <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-xl border border-emerald-200/70 flex items-center gap-1">
                          <Truck size={12} />
                          <span>{ord.tracking_number}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                      <span>Customer:</span>
                      <strong className="text-dkart-charcoal font-bold">{ord.customer_name}</strong>
                      <span className="text-gray-400">({ord.customer_phone})</span>
                    </div>
                  </div>

                  {/* Right: COD Total Amount & Quick Status Selector */}
                  <div className="flex items-center justify-between lg:justify-end gap-5">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        COD Payable Total
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-dkart-orange">
                        {formatPrice(ord.total_amount)}
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Fulfillment Status
                      </label>
                      <select
                        value={ord.order_status}
                        onChange={(e) =>
                          handleStatusChange(ord.id, e.target.value, ord.tracking_number)
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-black border transition cursor-pointer focus:outline-none shadow-2xs ${
                          ord.order_status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ord.order_status === 'Shipped'
                            ? 'bg-blue-50 text-dkart-blue border-blue-300'
                            : ord.order_status === 'Processing'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : ord.order_status === 'Confirmed'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : ord.order_status === 'Cancelled'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
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
                </div>

                {/* 5-STEP VISUAL ORDER PROCESSING TIMELINE */}
                {ord.order_status !== 'Cancelled' ? (
                  <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-2">
                      <span className="uppercase tracking-wider text-dkart-blue font-extrabold flex items-center gap-1.5">
                        <Sparkles size={12} />
                        Order Processing Progress
                      </span>
                      <span>
                        Stage <strong>{step} of 4</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      {/* Step 1: Placed */}
                      <div className={`p-2 rounded-xl border text-[11px] font-bold ${
                        step >= 1 ? 'bg-blue-50 border-blue-200 text-dkart-blue' : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          {step > 1 ? <Check size={12} className="text-emerald-600" /> : <span>1.</span>}
                          <span>Order Placed</span>
                        </div>
                      </div>

                      {/* Step 2: Confirmed */}
                      <div className={`p-2 rounded-xl border text-[11px] font-bold ${
                        step >= 2 ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          {step > 2 ? <Check size={12} className="text-emerald-600" /> : <span>2.</span>}
                          <span>Confirmed & Packed</span>
                        </div>
                      </div>

                      {/* Step 3: Dispatched */}
                      <div className={`p-2 rounded-xl border text-[11px] font-bold ${
                        step >= 4 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          {step > 4 ? <Check size={12} className="text-emerald-600" /> : <span>3.</span>}
                          <span>Dispatched (TCS)</span>
                        </div>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className={`p-2 rounded-xl border text-[11px] font-bold ${
                        step >= 5 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          {step >= 5 && <Check size={12} className="text-emerald-600" />}
                          <span>Delivered & Paid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-2.5 bg-red-50 text-red-700 text-xs font-bold border-b border-red-100 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>This order has been Cancelled / Returned.</span>
                  </div>
                )}

                {/* CARD BODY: CUSTOMER DETAILS, ITEMS & ACTIONS */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT: Shipping Destination & Customer Card (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-dkart-blue flex items-center gap-1">
                          <MapPin size={13} className="text-dkart-orange" />
                          Delivery Destination
                        </span>
                        <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-gray-200 text-gray-600">
                          {address.province || 'Pakistan'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-dkart-charcoal text-sm">
                          {ord.customer_name}
                        </p>
                        <p className="text-gray-600 leading-relaxed font-medium">
                          {address.streetAddress || address.street_address || 'House / Street'},{' '}
                          {address.area ? `${address.area}, ` : ''}
                          <strong className="text-dkart-charcoal font-bold">{address.city || 'City'}</strong>
                        </p>
                        <p className="text-gray-500 font-semibold pt-1">
                          Phone: <a href={`tel:${ord.customer_phone}`} className="text-dkart-blue hover:underline">{ord.customer_phone}</a>
                        </p>
                        {ord.customer_email && (
                          <p className="text-gray-500 text-[11px]">
                            Email: <span className="text-gray-700">{ord.customer_email}</span>
                          </p>
                        )}
                        {ord.notes && (
                          <div className="p-2 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 italic mt-2">
                            <strong>Note:</strong> "{ord.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Ordered Line Items & Breakdown (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-dkart-blue flex items-center gap-1">
                          <Package size={13} className="text-dkart-blue" />
                          Ordered Items ({ord.items?.length || 0})
                        </span>
                        <span className="text-[11px] font-bold text-gray-500">
                          Price Breakdown
                        </span>
                      </div>

                      <div className="divide-y divide-gray-200/60 space-y-2">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="pt-2 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.image ? (item.image.startsWith('http') ? item.image : item.image) : '/uploads/hair-dryer-brush-3-in-1-main.webp'}
                                alt=""
                                className="w-11 h-11 rounded-xl object-cover border border-gray-200 bg-white flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-dkart-charcoal truncate">{item.title}</p>
                                <p className="text-[11px] text-gray-500">
                                  {item.variant_name ? `Variant: ${item.variant_name} • ` : ''}
                                  Qty: <strong className="text-dkart-blue font-bold">{item.quantity}</strong>
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-dkart-charcoal whitespace-nowrap">
                              {formatPrice(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Breakdown */}
                      <div className="pt-3 border-t border-gray-200/80 space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-800">{formatPrice(ord.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping Fee (Nationwide)</span>
                          <span className="font-semibold text-emerald-700">
                            {ord.shipping_fee > 0 ? formatPrice(ord.shipping_fee) : 'FREE'}
                          </span>
                        </div>
                        {ord.discount_amount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Coupon Discount</span>
                            <span className="font-bold">- {formatPrice(ord.discount_amount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-black text-dkart-charcoal pt-1.5 border-t border-gray-200">
                          <span>Total COD Payable</span>
                          <span className="text-dkart-orange font-black text-base">{formatPrice(ord.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER: ACTION TOOLBAR (Shopify Style) */}
                <div className="px-5 sm:px-6 py-3.5 bg-gray-50 border-t border-gray-200/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Print Packing Slip */}
                    <button
                      type="button"
                      onClick={() => handlePrintSlip(ord)}
                      className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-700 transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer size={14} className="text-dkart-blue" />
                      <span>Print Dispatch Flyer Label</span>
                    </button>

                    {/* WhatsApp Customer */}
                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <MessageSquare size={14} />
                      <span>WhatsApp Customer ({ord.customer_phone})</span>
                    </a>
                  </div>

                  {/* Advance Quick Stepper Buttons */}
                  <div className="flex items-center gap-2">
                    {ord.order_status === 'Pending' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'Confirmed', ord.tracking_number)}
                        className="px-4 py-2 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl text-xs font-bold shadow-dkart transition"
                      >
                        ✓ Confirm & Pack Order
                      </button>
                    )}
                    {ord.order_status === 'Confirmed' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'Shipped', ord.tracking_number)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1"
                      >
                        <Truck size={14} />
                        <span>Dispatch via TCS / Leopard</span>
                      </button>
                    )}
                    {ord.order_status === 'Shipped' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'Delivered', ord.tracking_number)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} />
                        <span>Mark as Delivered & Paid</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. PRINTABLE THERMAL PACKING SLIP (Hidden from Screen, Visible on Print) */}
      {selectedPrintOrder && (
        <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-8 print:z-[9999]">
          <div className="max-w-md mx-auto border-2 border-black p-5 text-black font-mono space-y-4">
            <div className="text-center border-b-2 border-black pb-3">
              <h2 className="text-xl font-black">DKART.PK DISPATCH FLYER</h2>
              <p className="text-xs">Cash on Delivery Courier Manifest</p>
              <p className="text-lg font-black mt-1">ORDER #{selectedPrintOrder.id}</p>
              <p className="text-xs">Tracking: {selectedPrintOrder.tracking_number}</p>
            </div>

            <div className="border-b-2 border-black pb-3 space-y-1 text-sm">
              <p className="font-bold uppercase">RECIPIENT / DELIVERY TO:</p>
              <p className="font-black text-base">{selectedPrintOrder.customer_name}</p>
              <p className="font-black text-base">{selectedPrintOrder.customer_phone}</p>
              <p>
                {selectedPrintOrder.shipping_address?.streetAddress || selectedPrintOrder.shipping_address?.street_address},{' '}
                {selectedPrintOrder.shipping_address?.area ? `${selectedPrintOrder.shipping_address.area}, ` : ''}
                <strong>{selectedPrintOrder.shipping_address?.city}</strong>, {selectedPrintOrder.shipping_address?.province}
              </p>
            </div>

            <div className="border-b-2 border-black pb-3 space-y-1 text-xs">
              <p className="font-bold uppercase">ITEMS ENCLOSED:</p>
              {selectedPrintOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.quantity}x {item.title} ({item.variant_name || 'Standard'})</span>
                  <span className="font-bold">Rs. {Number(item.subtotal).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="p-3 border-2 border-black bg-gray-100 text-center space-y-1">
              <p className="text-xs font-bold uppercase">AMOUNT TO COLLECT (COD):</p>
              <p className="text-2xl font-black">Rs. {Number(selectedPrintOrder.total_amount).toLocaleString()}</p>
            </div>

            <div className="text-center text-[10px] pt-2">
              <p>Helpline / WhatsApp: 0342-5097760 • Dkart Official Store</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
