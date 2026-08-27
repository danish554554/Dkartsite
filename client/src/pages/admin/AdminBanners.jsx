import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, X, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'SPECIAL OFFER',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    imageUrl: '',
    position: 'hero'
  });

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminBanners();
      if (res.success) setBanners(res.data);
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner from homepage?')) return;
    try {
      const res = await api.deleteAdminBanner(id);
      if (res.success) {
        addToast('Banner removed.', 'info');
        loadBanners();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete banner', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      addToast('Title and Image URL are required.', 'error');
      return;
    }
    try {
      const res = await api.createAdminBanner(formData);
      if (res.success) {
        addToast('Banner published to homepage!', 'success');
        setIsModalOpen(false);
        setFormData({
          title: '',
          subtitle: '',
          badge: 'SPECIAL OFFER',
          ctaText: 'Shop Now',
          ctaLink: '/shop',
          imageUrl: '',
          position: 'hero'
        });
        loadBanners();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create banner', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dkart-charcoal tracking-tight">
            Homepage Banners & Promotions ({banners.length})
          </h1>
          <p className="text-xs text-gray-500">
            Control the hero carousel and promotional campaigns on dkart.pk
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl text-xs font-bold shadow-dkart flex items-center gap-1.5 transition active:scale-95"
        >
          <Plus size={16} />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
              <img src={b.image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-black/80 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {b.position}
                </span>
                {b.badge && (
                  <span className="bg-dkart-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {b.badge}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 space-y-2">
              <h3 className="text-base font-bold text-dkart-charcoal">{b.title}</h3>
              {b.subtitle && <p className="text-xs text-gray-500 line-clamp-2">{b.subtitle}</p>}
              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <span className="font-semibold text-dkart-blue">
                  CTA: {b.cta_text} → {b.cta_link}
                </span>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-dkart-charcoal">Add Homepage Banner</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-dkart-charcoal">Headline Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Dkart Titan Ultra Smartwatch Launch"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dkart-charcoal">Subtitle / Offer Details</label>
                <input
                  type="text"
                  placeholder="Flat 35% OFF with Cash on Delivery across Pakistan"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-dkart-charcoal">Badge Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-dkart-charcoal">Banner Type</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 font-semibold"
                  >
                    <option value="hero">Hero Main Slider</option>
                    <option value="promo">Promotional Strip</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-dkart-charcoal">Button CTA Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-dkart-charcoal">Button Link</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dkart-charcoal">Banner Image URL *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                  required
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
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
