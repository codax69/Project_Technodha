import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useCart } from '../context/CartContext';
import {
  Search,
  Filter,
  ShoppingCart,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  X,
  Plus,
  Minus,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export const ProductCatalogue = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

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

  const handleAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    showToast(`Added ${qty}x "${product.name}" to your cart!`);

    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sort products client-side for immediate responsive sorting
  const rawProducts = productsData?.results || [];
  const sortedProducts = [...rawProducts].sort((a, b) => {
    if (sortBy === 'price-low') return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === 'price-high') return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // Default newest
  });

  const totalPages = productsData ? Math.ceil(productsData.count / 10) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative p-8 rounded-3xl overflow-hidden border bg-card shadow-xs">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" /> Official Inventory Catalogue
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Explore Technodha Products
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Live stock integration, verified pricing in ₹, and instant transactional order execution.
          </p>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory('');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            selectedCategory === ''
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-card border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="w-3.5 h-3.5" /> All Categories
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-card border text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products by name or description..."
            className="w-full bg-background border focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground text-sm outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-background border rounded-xl px-3 py-2 text-foreground text-sm outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl animate-pulse p-4 space-y-4 bg-card border">
              <div className="bg-muted h-40 rounded-xl" />
              <div className="bg-muted h-6 w-3/4 rounded" />
              <div className="bg-muted h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <p className="text-destructive font-semibold">Failed to load product catalogue.</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl space-y-4 border bg-card shadow-xs">
          <Package className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="text-muted-foreground text-sm">Try broadening your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => {
            const isOutOfStock = product.stock_quantity === 0 || !product.is_orderable;
            const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 5;

            return (
              <div
                key={product.id}
                className="rounded-2xl border bg-card hover:border-primary/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md overflow-hidden relative"
              >
                <div>
                  {/* Product Image Container */}
                  <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-14 h-14 text-muted-foreground/50 group-hover:scale-110 transition-transform" />
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                      {isOutOfStock ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-background/90">
                          Low Stock ({product.stock_quantity})
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">
                          In Stock ({product.stock_quantity})
                        </Badge>
                      )}
                    </div>

                    {/* Quick View Button Overlay */}
                    <button
                      onClick={() => {
                        setQuickViewProduct(product);
                        setModalQty(1);
                      }}
                      className="absolute bottom-3 right-3 p-2 bg-background/90 hover:bg-background text-foreground rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-semibold"
                      title="Quick View"
                    >
                      <Eye className="w-3.5 h-3.5" /> Quick View
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      {product.category_detail?.name || 'Uncategorized'}
                    </span>
                    <h3
                      onClick={() => {
                        setQuickViewProduct(product);
                        setModalQty(1);
                      }}
                      className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                    >
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-xs line-clamp-2 min-h-[32px]">
                      {product.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Card Footer / Actions */}
                <div className="p-5 pt-0 flex items-center justify-between border-t mt-2 pt-4">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Price</span>
                    <span className="text-xl font-black text-foreground">₹{product.price}</span>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product, 1)}
                    disabled={isOutOfStock}
                    size="sm"
                    className={`gap-1.5 shadow-xs ${
                      addedIds[product.id] ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                    }`}
                  >
                    {addedIds[product.id] ? (
                      <>
                        <Check className="w-4 h-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        {isOutOfStock ? 'Unavailable' : 'Add'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-semibold text-muted-foreground">
            Page <span className="text-foreground font-bold">{page}</span> of{' '}
            <span className="text-foreground font-bold">{totalPages}</span>
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="max-w-2xl w-full p-6 rounded-3xl border bg-background space-y-6 shadow-2xl relative overflow-hidden">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Product Large Image */}
              <div className="h-64 sm:h-72 bg-muted rounded-2xl flex items-center justify-center overflow-hidden border">
                {quickViewProduct.image_url ? (
                  <img
                    src={quickViewProduct.image_url}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-20 h-20 text-muted-foreground/40" />
                )}
              </div>

              {/* Product Specs & Details */}
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {quickViewProduct.category_detail?.name || 'Uncategorized'}
                  </Badge>
                  <h2 className="text-2xl font-bold tracking-tight">{quickViewProduct.name}</h2>
                  <div className="text-2xl font-black text-primary mt-1">₹{quickViewProduct.price}</div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {quickViewProduct.description || 'High quality inventory product.'}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-semibold text-muted-foreground">Inventory Status:</span>
                  {quickViewProduct.stock_quantity === 0 ? (
                    <Badge variant="destructive">Out of Stock</Badge>
                  ) : (
                    <Badge className="bg-emerald-600">
                      In Stock ({quickViewProduct.stock_quantity} available)
                    </Badge>
                  )}
                </div>

                {/* Quantity Counter & Add Action */}
                {quickViewProduct.stock_quantity > 0 && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Select Quantity:</span>
                      <div className="flex items-center gap-2 border rounded-xl p-1 bg-muted/40">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setModalQty((q) => Math.max(q - 1, 1))}
                          disabled={modalQty <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-bold">{modalQty}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setModalQty((q) => Math.min(q + 1, quickViewProduct.stock_quantity))}
                          disabled={modalQty >= quickViewProduct.stock_quantity}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        handleAddToCart(quickViewProduct, modalQty);
                        setQuickViewProduct(null);
                      }}
                      className="w-full py-3 gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add {modalQty} to Cart (₹{(parseFloat(quickViewProduct.price) * modalQty).toFixed(2)})
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
