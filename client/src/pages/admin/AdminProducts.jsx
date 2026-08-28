import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Star,
  Layers,
  DollarSign,
  Boxes,
  ListPlus,
  Sliders
} from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../utils/imageCompressor';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // general | media | pricing | variants | specs
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { addToast } = useToast();

  // Multi-image URL input
  const [newImageUrl, setNewImageUrl] = useState('');

  // Form Data State
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    categoryId: '',
    price: '',
    salePrice: '',
    stockQuantity: '50',
    badge: 'New Arrival',
    sku: '',
    images: [], // array of { url, is_primary }
    variants: [], // array of { variant_type, variant_name, price_modifier, stock_quantity }
    keyFeatures: [''],
    specs: [{ key: '', value: '' }]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getAdminProducts(),
        api.getCategories()
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Modal for New Product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setActiveTab('general');
    setFormData({
      title: '',
      tagline: '',
      description: '',
      categoryId: categories[0]?.id || '',
      price: '',
      salePrice: '',
      stockQuantity: '50',
      badge: 'New Arrival',
      sku: `DK-${Math.floor(1000 + Math.random() * 9000)}`,
      images: [],
      variants: [
        { variant_type: 'color', variant_name: 'Default', price_modifier: 0, stock_quantity: 50 }
      ],
      keyFeatures: ['Official Brand Warranty', 'Fast Nationwide Courier Delivery'],
      specs: [
        { key: 'Condition', value: '100% Brand New' },
        { key: 'Warranty', value: '7-Day Replacement Guarantee' }
      ]
    });
    setIsModalOpen(true);
  };

  // Open Modal to Edit Product
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setActiveTab('general');

    // Build images array
    const imgs = (p.images && p.images.length > 0)
      ? p.images.map((im, idx) => ({
          url: im.url,
          is_primary: im.is_primary === 1 || idx === 0
        }))
      : p.primary_image
      ? [{ url: p.primary_image, is_primary: true }]
      : [];

    // Build variants array
    const vars = (p.variants && p.variants.length > 0)
      ? p.variants
      : [{ variant_type: 'color', variant_name: 'Default', price_modifier: 0, stock_quantity: p.stock_quantity }];

    // Build specs array
    const specsArray = p.specs && typeof p.specs === 'object' && Object.keys(p.specs).length > 0
      ? Object.entries(p.specs).map(([key, value]) => ({ key, value }))
      : [{ key: 'Condition', value: '100% Brand New' }];

    setFormData({
      title: p.title,
      tagline: p.tagline || '',
      description: p.description || '',
      categoryId: p.category_id || (categories[0]?.id || ''),
      price: p.price,
      salePrice: p.sale_price || '',
      stockQuantity: p.stock_quantity,
      badge: p.badge || '',
      sku: p.sku || `DK-${Math.floor(1000 + Math.random() * 9000)}`,
      images: imgs,
      variants: vars,
      keyFeatures: p.key_features && p.key_features.length > 0 ? p.key_features : ['Official Brand Warranty'],
      specs: specsArray
    });
    setIsModalOpen(true);
  };

  // Multiple File Upload Handler
  const handleMultipleFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const compressedFiles = await Promise.all(
        Array.from(files).map((file) => compressImage(file, 1000, 0.82))
      );
      const res = await api.uploadMultipleImages(compressedFiles);
      if (res.success && res.files) {
        const uploadedImages = res.files.map((f, i) => ({
          url: f.url,
          is_primary: formData.images.length === 0 && i === 0
        }));

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedImages]
        }));
        addToast(`${res.files.length} images compressed (<100KB) & uploaded!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to upload images.', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        { url: newImageUrl.trim(), is_primary: prev.images.length === 0 }
      ]
    }));
    setNewImageUrl('');
  };

  // Set Primary Image
  const handleSetPrimary = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    }));
  };

  // Remove Image
  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      // Ensure at least one primary remains if images exist
      if (updated.length > 0 && !updated.some((im) => im.is_primary)) {
        updated[0].is_primary = true;
      }
      return { ...prev, images: updated };
    });
  };

  // Add Variant
  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { variant_type: 'color', variant_name: 'New Option', price_modifier: 0, stock_quantity: 20 }
      ]
    }));
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await api.deleteAdminProduct(id);
      if (res.success) {
        addToast('Product deleted.', 'info');
        loadData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Clear All Demo Products
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all products? This will leave your store completely fresh so you can add real products manually.')) return;
    try {
      setLoading(true);
      const res = await api.clearAllProducts();
      if (res.success) {
        addToast('All demo products cleared! You can now add your real products.', 'success');
        loadData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to clear products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.description) {
      addToast('Please fill all required fields in General Info.', 'error');
      setActiveTab('general');
      return;
    }

    if (formData.images.length === 0) {
      addToast('Please add at least one product image.', 'error');
      setActiveTab('media');
      return;
    }

    try {
      // Build specs object from key-value pairs
      const specsObj = {};
      formData.specs.forEach((s) => {
        if (s.key && s.value) specsObj[s.key] = s.value;
      });

      const payload = {
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        stockQuantity: Number(formData.stockQuantity),
        badge: formData.badge,
        sku: formData.sku,
        images: formData.images,
        variants: formData.variants,
        keyFeatures: formData.keyFeatures.filter((f) => f && f.trim()),
        specs: specsObj
      };

      if (editingProduct) {
        await api.updateAdminProduct(editingProduct.id, payload);
        addToast('Product updated successfully with all images and variants!', 'success');
      } else {
        await api.createAdminProduct(payload);
        addToast('Product created successfully with all images!', 'success');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to save product.', 'error');
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCat =
      categoryFilter === 'All' || p.category_id === Number(categoryFilter);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dkart-charcoal tracking-tight">
            Product Catalog & Inventory ({products.length})
          </h1>
          <p className="text-xs text-gray-500">
            Create, edit, upload multiple high-res product photos, and configure variants
          </p>
        </div>

        <div className="flex items-center gap-2">
          {products.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              title="Clear all demo products"
            >
              <Trash2 size={15} />
              <span>Clear Demo Products</span>
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl text-xs font-bold shadow-dkart flex items-center gap-2 transition active:scale-95"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, SKU, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-dkart-blue"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse text-xs">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            No products found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-100">
                <tr>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Pricing</th>
                  <th className="p-4">Photos</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Badge</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primary_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-dkart-charcoal max-w-xs truncate">{p.title}</p>
                          <span className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-600">{p.category_name}</td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-black text-dkart-charcoal">
                          {formatPrice(p.sale_price || p.price)}
                        </span>
                        {p.sale_price && (
                          <span className="block text-[10px] text-gray-400 line-through">
                            {formatPrice(p.price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-dkart-blue px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        <ImageIcon size={11} /> {p.images?.length || 1} photos
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock_quantity <= 10
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td className="p-4">
                      {p.badge ? (
                        <span className="bg-orange-50 text-dkart-orange border border-orange-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                          {p.badge}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 text-gray-400 hover:text-dkart-blue hover:bg-blue-50 rounded-xl transition"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PROFESSIONAL MULTI-TAB PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-black text-dkart-charcoal">
                  {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Add New Product to Dkart Catalog'}
                </h3>
                <p className="text-xs text-gray-500">Configure catalog information, multiple gallery photos, and variations</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-gray-100 bg-gray-50/60 overflow-x-auto no-scrollbar">
              {[
                { id: 'general', label: '1. General Info', icon: <Package size={14} /> },
                {
                  id: 'media',
                  label: `2. Gallery Photos (${formData.images.length})`,
                  icon: <ImageIcon size={14} />
                },
                { id: 'pricing', label: '3. Pricing & Stock', icon: <DollarSign size={14} /> },
                {
                  id: 'variants',
                  label: `4. Variants (${formData.variants.length})`,
                  icon: <Sliders size={14} />
                },
                { id: 'specs', label: '5. Highlights & Specs', icon: <ListPlus size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-dkart-blue text-dkart-blue bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* TAB 1: GENERAL INFO */}
              {activeTab === 'general' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="font-bold text-dkart-charcoal">Product Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dkart Titan Pro 1.43 AMOLED Smartwatch"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-dkart-blue text-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-dkart-charcoal">Category *</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-dkart-blue text-xs font-semibold"
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-dkart-charcoal">Promo Badge Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Hot Deal, Bestseller, New Arrival, 50% OFF"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-dkart-blue text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-dkart-charcoal">Tagline / Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Bluetooth Calling & Health Tracking with 7-Day Battery"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-dkart-blue text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-dkart-charcoal">Detailed Description *</label>
                    <textarea
                      rows={4}
                      placeholder="Comprehensive product benefits, craftsmanship, and specifications..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-dkart-blue text-xs leading-relaxed"
                      required
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: MULTIPLE IMAGES MANAGEMENT */}
              {activeTab === 'media' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Upload Box */}
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50/70 text-center space-y-3 hover:border-dkart-blue transition">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-dkart-blue flex items-center justify-center mx-auto">
                      <Upload size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-dkart-charcoal">
                        Upload Multiple Product Photos
                      </h4>
                      <p className="text-xs text-gray-400">
                        Select multiple images from your computer (JPG, PNG, WEBP up to 10MB each)
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-dkart-blue text-white rounded-xl font-bold cursor-pointer hover:bg-dkart-blue-hover shadow-dkart transition">
                      <span>Choose Files (Multiple)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMultipleFiles}
                        className="hidden"
                      />
                    </label>
                    {uploadingImages && (
                      <p className="text-xs text-dkart-orange font-bold animate-pulse">
                        Uploading and compressing images...
                      </p>
                    )}
                  </div>

                  {/* Or Add Via URL */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                    <span className="font-bold text-gray-700 block">Or Add Image by Direct URL:</span>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-dkart-blue text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* Gallery Preview Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-dkart-charcoal">
                        Current Product Photos ({formData.images.length})
                      </h4>
                      <span className="text-[11px] text-gray-400">
                        Click "Set as Primary" on the photo you want as main cover
                      </span>
                    </div>

                    {formData.images.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-400">
                        No images added yet. Upload files above or enter image URLs.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {formData.images.map((img, idx) => (
                          <div
                            key={idx}
                            className={`relative group rounded-2xl overflow-hidden border-2 transition ${
                              img.is_primary
                                ? 'border-dkart-blue shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="aspect-square bg-gray-100">
                              <img
                                src={img.url}
                                alt={`Product ${idx}`}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Badges */}
                            {img.is_primary && (
                              <div className="absolute top-2 left-2 bg-dkart-blue text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                                <Star size={10} className="fill-white" /> Primary Cover
                              </div>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="self-end p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                                title="Remove photo"
                              >
                                <Trash2 size={13} />
                              </button>

                              {!img.is_primary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimary(idx)}
                                  className="w-full py-1.5 bg-white text-dkart-charcoal font-bold rounded-lg text-[10px] hover:bg-gray-100 transition"
                                >
                                  Set as Primary
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & INVENTORY */}
              {activeTab === 'pricing' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-dkart-charcoal">Regular Retail Price (Rs.) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 5999"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-dkart-charcoal">Discounted Sale Price (Rs.)</label>
                      <input
                        type="number"
                        placeholder="e.g. 3999 (Leave empty if no discount)"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold text-dkart-orange"
                      />
                    </div>
                  </div>

                  {formData.price && formData.salePrice && Number(formData.salePrice) < Number(formData.price) && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center justify-between">
                      <span>Calculated Customer Savings:</span>
                      <span className="text-sm">
                        {Math.round(((formData.price - formData.salePrice) / formData.price) * 100)}% OFF (Save Rs. {formData.price - formData.salePrice})
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="font-bold text-dkart-charcoal">Stock Quantity in Warehouse *</label>
                      <input
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-dkart-charcoal">SKU / Product Code</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VARIANTS BUILDER */}
              {activeTab === 'variants' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-dkart-charcoal">Product Variations</h4>
                      <p className="text-xs text-gray-400">Offer colors, editions, or sizes with custom prices and stock</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-dkart-charcoal rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Variant
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.variants.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-3"
                      >
                        <select
                          value={v.variant_type}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              variants: prev.variants.map((item, i) =>
                                i === idx ? { ...item, variant_type: val } : item
                              )
                            }));
                          }}
                          className="p-2 border border-gray-200 rounded-xl bg-white text-xs font-bold"
                        >
                          <option value="color">Color</option>
                          <option value="edition">Edition</option>
                          <option value="size">Size</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Option Name (e.g. Midnight Black, Titanium)"
                          value={v.variant_name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              variants: prev.variants.map((item, i) =>
                                i === idx ? { ...item, variant_name: val } : item
                              )
                            }));
                          }}
                          className="flex-1 p-2 border border-gray-200 rounded-xl bg-white text-xs"
                        />

                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">+Rs.</span>
                          <input
                            type="number"
                            placeholder="Price modifier"
                            value={v.price_modifier}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                variants: prev.variants.map((item, i) =>
                                  i === idx ? { ...item, price_modifier: Number(val) } : item
                                )
                              }));
                            }}
                            className="w-20 p-2 border border-gray-200 rounded-xl bg-white text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Stock:</span>
                          <input
                            type="number"
                            value={v.stock_quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                variants: prev.variants.map((item, i) =>
                                  i === idx ? { ...item, stock_quantity: Number(val) } : item
                                )
                              }));
                            }}
                            className="w-16 p-2 border border-gray-200 rounded-xl bg-white text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: HIGHLIGHTS & SPECS */}
              {activeTab === 'specs' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Key Highlights */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-dkart-charcoal">Key Feature Highlights</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            keyFeatures: [...prev.keyFeatures, '']
                          }))
                        }
                        className="text-xs font-bold text-dkart-blue hover:underline"
                      >
                        + Add Bullet Point
                      </button>
                    </div>

                    {formData.keyFeatures.map((feat, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. IP68 Water Resistance up to 50 meters"
                          value={feat}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              keyFeatures: prev.keyFeatures.map((f, i) => (i === idx ? val : f))
                            }));
                          }}
                          className="flex-1 p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              keyFeatures: prev.keyFeatures.filter((_, i) => i !== idx)
                            }))
                          }
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Technical Specs Key-Value */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-dkart-charcoal">Technical Specifications</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            specs: [...prev.specs, { key: '', value: '' }]
                          }))
                        }
                        className="text-xs font-bold text-dkart-blue hover:underline"
                      >
                        + Add Specification
                      </button>
                    </div>

                    {formData.specs.map((s, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Feature (e.g. Battery)"
                          value={s.key}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              specs: prev.specs.map((item, i) =>
                                i === idx ? { ...item, key: val } : item
                              )
                            }));
                          }}
                          className="w-1/3 p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 400mAh, 7 Days Standby)"
                          value={s.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              specs: prev.specs.map((item, i) =>
                                i === idx ? { ...item, value: val } : item
                              )
                            }));
                          }}
                          className="flex-1 p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              specs: prev.specs.filter((_, i) => i !== idx)
                            }))
                          }
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Sticky Action Bar */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>

                <div className="flex gap-2">
                  {activeTab !== 'general' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['general', 'media', 'pricing', 'variants', 'specs'];
                        const curr = tabs.indexOf(activeTab);
                        if (curr > 0) setActiveTab(tabs[curr - 1]);
                      }}
                      className="px-4 py-2.5 border border-gray-200 rounded-xl font-bold hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                  )}
                  {activeTab !== 'specs' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['general', 'media', 'pricing', 'variants', 'specs'];
                        const curr = tabs.indexOf(activeTab);
                        if (curr < tabs.length - 1) setActiveTab(tabs[curr + 1]);
                      }}
                      className="px-5 py-2.5 bg-dkart-charcoal text-white rounded-xl font-bold hover:bg-black transition"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-dkart-blue text-white rounded-xl font-black shadow-dkart hover:bg-dkart-blue-hover transition"
                    >
                      {editingProduct ? 'Save & Update Product' : 'Publish Product to Store'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
