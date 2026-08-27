import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isFeatured: true
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await api.uploadImage(file);
      if (res.success) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
        addToast('Category image uploaded.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Image upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.deleteAdminCategory(id);
      if (res.success) {
        addToast('Category deleted.', 'info');
        loadCategories();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete category.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('Category name is required.', 'error');
      return;
    }

    try {
      const res = await api.createAdminCategory(formData);
      if (res.success) {
        addToast('Category created successfully!', 'success');
        setIsModalOpen(false);
        setFormData({ name: '', description: '', imageUrl: '', isFeatured: true });
        loadCategories();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create category.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dkart-charcoal tracking-tight">
            Category Management ({categories.length})
          </h1>
          <p className="text-xs text-gray-500">
            Organize products into high-level collections for seamless navigation
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl text-xs font-bold shadow-dkart flex items-center gap-1.5 transition active:scale-95"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'}
                alt=""
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Slug: {cat.slug}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-dkart-charcoal">{cat.name}</h3>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{cat.description || 'No description'}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-dkart-charcoal">Create New Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-dkart-charcoal">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Smartwatches, Hair Styling..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dkart-charcoal">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief tagline or description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-dkart-charcoal">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                />
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-gray-400">Or upload from device:</span>
                  <label className="cursor-pointer text-[11px] font-bold text-dkart-blue hover:underline">
                    Browse File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploading && <span className="text-[11px] text-orange-500">Uploading...</span>}
                </div>
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
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
