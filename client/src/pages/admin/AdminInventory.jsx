import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Check, Search } from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminInventory();
      if (res.success) setItems(res.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockChange = async (id, newQty) => {
    try {
      setUpdatingId(id);
      const res = await api.updateAdminInventory(id, newQty);
      if (res.success) {
        addToast('Stock level updated.', 'success');
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, stock_quantity: Number(newQty) } : item))
        );
      }
    } catch (err) {
      addToast('Failed to update stock.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dkart-charcoal tracking-tight">
          Stock & Inventory Management
        </h1>
        <p className="text-xs text-gray-500">
          Monitor warehouse stock counts and update product inventory in real time
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Filter inventory by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-dkart-charcoal focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-100">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5 text-right">Quick Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=80'}
                        alt=""
                        className="w-10 h-10 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-dkart-charcoal max-w-xs truncate">{item.title}</p>
                        <span className="text-[10px] text-gray-400">SKU: {item.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-gray-600">{item.category_name}</td>
                  <td className="p-3.5 font-bold text-dkart-charcoal">{formatPrice(item.sale_price || item.price)}</td>
                  <td className="p-3.5">
                    {item.stock_quantity <= 10 ? (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        <AlertTriangle size={11} /> Low Stock ({item.stock_quantity})
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        In Stock ({item.stock_quantity})
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        defaultValue={item.stock_quantity}
                        id={`stock-${item.id}`}
                        className="w-20 p-1.5 border border-gray-200 rounded-lg text-center font-bold text-xs bg-gray-50"
                      />
                      <button
                        onClick={() => {
                          const val = document.getElementById(`stock-${item.id}`).value;
                          handleStockChange(item.id, val);
                        }}
                        disabled={updatingId === item.id}
                        className="px-3 py-1.5 bg-dkart-blue text-white rounded-lg text-xs font-bold hover:bg-dkart-blue-hover transition"
                      >
                        {updatingId === item.id ? '...' : 'Save'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
