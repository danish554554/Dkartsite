import React, { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, DollarSign, Mail, Phone, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await api.getAdminCustomers();
        if (res.success) setCustomers(res.data);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dkart-charcoal tracking-tight">
          Registered Customers ({customers.length})
        </h1>
        <p className="text-xs text-gray-500">
          Customer accounts, purchase history, and lifetime spending
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by customer name, email, or phone..."
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
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Orders Placed</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition">
                  <td className="p-3.5 font-bold text-dkart-charcoal">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-dkart-blue text-white flex items-center justify-center font-bold text-xs">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-gray-600">
                    <div>{c.email}</div>
                    <div className="text-[11px] text-gray-400">{c.phone || 'No phone'}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-blue-50 text-dkart-blue px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                      {c.total_orders} orders
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-dkart-charcoal">
                    {formatPrice(c.total_spent)}
                  </td>
                  <td className="p-3.5 text-gray-400">{c.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
