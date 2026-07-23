import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useCart } from '../context/CartContext';
import { Search, Filter, ShoppingCart, Package, AlertCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const ProductCatalogue = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState({});

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/products/categories/');
      if (res.data && 'results' in res.data) return res.data.results;
      return res.data;
    },
  });

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['products', search, selectedCategory, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category__slug', selectedCategory);
      params.append('page', page.toString());
      const res = await apiClient.get(`/products/?${params.toString()}`);
      return res.data;
    },
  });

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const totalPages = productsData ? Math.ceil(productsData.count / 10) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative glass-card p-8 rounded-3xl overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Product Catalogue
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            Explore live stock, filter categories, and place orders directly. Non-negotiable stock protection enforced on checkout.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products by name or description..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-11 pr-4 py-2.5 text-slate-200 placeholder-slate-500 text-sm outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none transition-all w-full md:w-64"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-80 rounded-2xl animate-pulse p-4 space-y-4">
              <div className="bg-slate-800 h-40 rounded-xl" />
              <div className="bg-slate-800 h-6 w-3/4 rounded" />
              <div className="bg-slate-800 h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <p className="text-rose-300 font-semibold">Failed to load product catalogue.</p>
        </div>
      ) : productsData?.results.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl space-y-4 border border-slate-800">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No products found</h3>
          <p className="text-slate-500 text-sm">Try broadening your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsData?.results.map((product) => {
            const isOutOfStock = product.stock_quantity === 0 || !product.is_orderable;
            const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 5;

            return (
              <div
                key={product.id}
                className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-slate-700 group-hover:scale-110 transition-transform" />
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/90 text-white shadow-lg backdrop-blur-md">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-white shadow-lg backdrop-blur-md">
                          Low Stock ({product.stock_quantity} left)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/80 text-white shadow-lg backdrop-blur-md">
                          In Stock ({product.stock_quantity})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
                      {product.category_detail?.name || 'Uncategorized'}
                    </span>
                    <h3 className="font-bold text-lg text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 min-h-[32px]">
                      {product.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-xs text-slate-500 block">Price</span>
                    <span className="text-xl font-black text-white">${product.price}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-md ${
                      isOutOfStock
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
                        : addedIds[product.id]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-600 hover:bg-sky-500 text-white hover:scale-105 active:scale-95 shadow-sky-600/30'
                    }`}
                  >
                    {addedIds[product.id] ? (
                      <>
                        <Check className="w-4 h-4" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-slate-400">
            Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
