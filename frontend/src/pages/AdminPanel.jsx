import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Shield, Package, Plus, Edit, RefreshCw, Layers, X } from 'lucide-react';

export const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form states for Product
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState(0);
  const [prodCategory, setProdCategory] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodIsActive, setProdIsActive] = useState(true);

  // Queries
  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await apiClient.get('/products/');
      return res.data.results;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/products/categories/');
      if (res.data && 'results' in res.data) return res.data.results;
      return res.data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/');
      return res.data.results;
    },
  });

  // Product Create/Update Mutation
  const productMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingProduct) {
        return apiClient.put(`/products/${editingProduct.id}/`, payload);
      }
      return apiClient.post('/products/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductModalOpen(false);
      resetProductForm();
    },
  });

  // Stock Direct Update Mutation
  const stockMutation = useMutation({
    mutationFn: async ({ id, stock_quantity }) => {
      return apiClient.post(`/products/${id}/stock/`, { stock_quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsStockModalOpen(false);
    },
  });

  // Category Create Mutation
  const categoryMutation = useMutation({
    mutationFn: async (name) => {
      return apiClient.post('/products/categories/', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
    },
  });

  // Order Status Update Mutation
  const orderStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return apiClient.patch(`/orders/${id}/status/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const openAddProduct = () => {
    resetProductForm();
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProduct = (p) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDesc(p.description || '');
    setProdPrice(p.price);
    setProdStock(p.stock_quantity);
    setProdCategory(p.category);
    setProdImageUrl(p.image_url || '');
    setProdIsActive(p.is_active);
    setIsProductModalOpen(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdStock(0);
    setProdCategory('');
    setProdImageUrl('');
    setProdIsActive(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!prodCategory) return;
    productMutation.mutate({
      name: prodName,
      description: prodDesc,
      price: prodPrice,
      stock_quantity: prodStock,
      category: prodCategory,
      image_url: prodImageUrl || null,
      is_active: prodIsActive,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            Admin Operations Panel
          </h1>
          <p className="text-slate-400 text-sm">Manage product catalogue, categories, stock, and orders</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 space-x-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'products' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'categories' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'orders' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Orders
          </button>
        </div>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Catalogue Products ({products?.length || 0})</h2>
            <button
              onClick={openAddProduct}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-sky-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-xs font-bold uppercase text-slate-400 border-b border-slate-800">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {products?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-semibold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <span>{p.name}</span>
                        <span className="block text-[11px] text-slate-500 line-clamp-1">{p.description}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{p.category_detail?.name || 'None'}</td>
                    <td className="p-4 font-bold text-white">${p.price}</td>
                    <td className="p-4">
                      <span className={`font-bold ${p.stock_quantity === 0 ? 'text-rose-400' : p.stock_quantity < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditProduct(p)}
                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStockProduct(p);
                          setNewStockVal(p.stock_quantity);
                          setIsStockModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Direct stock update"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Product Categories ({categories?.length || 0})</h2>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-sky-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories?.map((cat) => (
              <div key={cat.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{cat.name}</h3>
                  <span className="text-xs text-slate-500">{cat.slug}</span>
                </div>
                <Layers className="w-6 h-6 text-sky-400/50" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">System Orders ({orders?.length || 0})</h2>
          <div className="space-y-4">
            {orders?.map((ord) => (
              <div key={ord.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-base">Order #{ord.id}</span>
                    <span className="text-xs text-slate-400">Customer: <strong className="text-sky-300">{ord.customer_username}</strong></span>
                  </div>
                  <span className="text-xs text-slate-500">Placed: {new Date(ord.created_at).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <span className="font-black text-lg text-white">${ord.total_price}</span>

                  <select
                    value={ord.status}
                    onChange={(e) => orderStatusMutation.mutate({ id: ord.id, status: e.target.value })}
                    className="bg-slate-950 border border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled (Restock)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
                <select
                  required
                  value={prodCategory}
                  onChange={(e) => setProdCategory(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                >
                  <option value="">Select Category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  placeholder="https://cloudinary.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={prodIsActive}
                  onChange={(e) => setProdIsActive(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-0"
                />
                <label htmlFor="isActiveCheck" className="text-slate-300 font-medium">Is Active (Soft Delete Toggle)</label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all"
              >
                {editingProduct ? 'Save Product Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Direct Stock Update Modal */}
      {isStockModalOpen && selectedStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Direct Stock Update</h3>
              <button onClick={() => setIsStockModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Updating stock for <strong className="text-white">{selectedStockProduct.name}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">New Quantity</label>
              <input
                type="number"
                min="0"
                value={newStockVal}
                onChange={(e) => setNewStockVal(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-lg font-bold outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={() =>
                stockMutation.mutate({ id: selectedStockProduct.id, stock_quantity: newStockVal })
              }
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all"
            >
              Update Stock
            </button>
          </div>
        </div>
      )}

      {/* Category Create Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Add Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Electronics"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={() => {
                if (newCategoryName) categoryMutation.mutate(newCategoryName);
              }}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all"
            >
              Create Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
