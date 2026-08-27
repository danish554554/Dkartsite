import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, X, Percent, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minSpend: '0'
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminCoupons();
      if (res.success) setCoupons(res.data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      const res = await api.deleteAdminCoupon(id);
      if (res.success) {
        addToast('Coupon deleted.', 'info');
        loadCoupons();
      }
    } catch (err) {
      addToast('Failed to delete coupon.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      addToast('Please provide both promo code and discount value.', 'error');
      return;
    }
    try {
      const res = await api.createAdminCoupon(formData);
      if (res.success) {
        addToast('Coupon created successfully!', 'success');
        setIsModalOpen(false);
        setFormData({ code: '', discountType: 'percentage', discountValue: '', minSpend: '0' });
        loadCoupons();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create coupon.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dkart-charcoal tracking-tight">
            Discounts & Coupons ({coupons.length})
          </h1>
          <p className="text-xs text-gray-500">
            Create promotional voucher codes and seasonal marketing discounts
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl text-xs font-bold shadow-dkart flex items-center gap-1.5 transition active:scale-95"
        >
          <Plus size={16} />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-dkart-blue flex items-center justify-center font-bold">
                  <Tag size={16} />
                </div>
                <span className="font-mono font-black text-sm text-dkart-charcoal">{c.code}</span>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Discount:</span>
                <span className="font-bold text-dkart-orange">
                  {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `Rs. ${c.discount_value} OFF`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Minimum Spend:</span>
                <span className="font-semibold">{c.min_spend > 0 ? formatPrice(c.min_spend) : 'No Minimum'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-dkart-charcoal">Create Discount Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-dkart-charcoal">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. FLASH20, EIDSPECIAL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 border rounded-xl bg-gray-50 uppercase font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-dkart-charcoal">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 font-bold"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed Amount (Rs. OFF)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-dkart-charcoal">Discount Value *</label>
                  <input
                    type="number"
                    placeholder="e.g. 10 or 500"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dkart-charcoal">Minimum Cart Value (Rs.)</label>
                <input
                  type="number"
                  placeholder="0 for any cart size"
                  value={formData.minSpend}
                  onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-dkart-blue text-white rounded-xl font-bold shadow-dkart"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
