import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useCart } from '../context/CartContext';
import {
  Search,
  ShoppingCart,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  Plus,
  Minus,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const ProductCatalogue = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);

  const getMrp = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return null;
    return (num * 1.25).toFixed(2);
  };

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

  const getOrderingParam = (sort) => {
    if (sort === 'price-low') return 'price';
    if (sort === 'price-high') return '-price';
    if (sort === 'name') return 'name';
    return '-created_at';
  };

  const ITEMS_PER_PAGE = 10;

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['products', search, selectedCategory, page, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category__slug', selectedCategory);
      if (sortBy) params.append('ordering', getOrderingParam(sortBy));
      const offset = (page - 1) * ITEMS_PER_PAGE;
      params.append('limit', ITEMS_PER_PAGE.toString());
      params.append('offset', offset.toString());
      params.append('page', page.toString());
      const res = await apiClient.get(`/products/?${params.toString()}`);
      return res.data;
    },
  });

  const handleAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    toast.create({
      title: "Item Added",
      description: `Added ${qty}x "${product.name}" to your cart!`,
      type: "success",
    });

    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const products = productsData?.results || [];

  const totalPages = productsData?.count ? Math.ceil(productsData.count / ITEMS_PER_PAGE) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner (Theme Palette) */}
      <div className="relative p-8 rounded-3xl overflow-hidden border border-cream-200 dark:border-neutral-800 bg-gradient-to-r from-coral-50 via-cream-200/40 to-cream-100 dark:from-neutral-900 dark:via-neutral-900/80 dark:to-neutral-900 text-charcoal-900 dark:text-neutral-100 shadow-xs transition-colors">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-coral-100/50 dark:bg-coral-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-neutral-800 text-coral-500 border border-coral-100 dark:border-neutral-700 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-coral-500" /> Official Inventory Catalogue
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-charcoal-900 dark:text-neutral-100">
            Explore Technodha Products
          </h1>
          <p className="text-charcoal-700 dark:text-neutral-300 text-sm max-w-2xl">
            Live stock integration, verified pricing in ₹ INR, and instant transactional order execution.
          </p>
        </div>
      </div>

      {/* Category Chips Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory('');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            selectedCategory === ''
              ? 'bg-coral-500 text-cream-100 shadow-md'
              : 'bg-white dark:bg-neutral-900 border border-cream-200 dark:border-neutral-800 text-charcoal-700 dark:text-neutral-300 hover:text-charcoal-900 hover:border-coral-500'
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
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-coral-500 text-cream-100 shadow-md'
                : 'bg-white dark:bg-neutral-900 border border-cream-200 dark:border-neutral-800 text-charcoal-700 dark:text-neutral-300 hover:text-charcoal-900 hover:border-coral-500'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search & Sort Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-cream-200 dark:border-neutral-800 shadow-xs transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-coral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products by name or description..."
            className="w-full bg-cream-100 dark:bg-neutral-800 border border-cream-200 dark:border-neutral-700 focus:ring-1 focus:ring-coral-500 rounded-xl pl-10 pr-4 py-2 text-charcoal-900 dark:text-neutral-100 placeholder:text-charcoal-700/60 dark:placeholder:text-neutral-400 text-sm outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-charcoal-700 dark:text-neutral-300" />
            <span className="text-xs font-bold text-charcoal-700 dark:text-neutral-300">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-cream-100 dark:bg-neutral-800 border border-cream-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-charcoal-900 dark:text-neutral-100 text-sm outline-none cursor-pointer font-semibold"
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
            <Card key={i} className="p-4 space-y-4 rounded-2xl bg-white border border-cream-200">
              <Skeleton className="h-44 rounded-xl bg-cream-200" />
              <Skeleton className="h-5 w-3/4 bg-cream-200" />
              <Skeleton className="h-4 w-1/2 bg-cream-200" />
              <Skeleton className="h-8 w-full bg-cream-200" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-2xl bg-coral-50 border border-coral-100 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-coral-600 mx-auto" />
          <p className="text-coral-700 font-semibold">Failed to load product catalogue.</p>
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl space-y-4 border border-cream-200 bg-white shadow-xs">
          <Package className="w-12 h-12 text-charcoal-700/40 mx-auto" />
          <h3 className="text-lg font-bold text-charcoal-900">No products found</h3>
          <p className="text-charcoal-700 text-xs">Try broadening your search query or selecting a different category.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const isOutOfStock = product.stock_quantity === 0 || !product.is_orderable;
            const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 5;

            return (
              <Card
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="rounded-2xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-coral-500 transition-all flex flex-col justify-between group shadow-xs hover:shadow-xl overflow-hidden relative cursor-pointer"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-48 bg-cream-200/50 dark:bg-neutral-800/60 flex items-center justify-center overflow-hidden border-b border-cream-200 dark:border-neutral-800">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-14 h-14 text-charcoal-700/40 dark:text-neutral-500 group-hover:scale-110 transition-transform" />
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="font-bold text-[10px]">Out of Stock</Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="border-coral-500 text-coral-600 dark:text-coral-400 bg-coral-50 dark:bg-coral-950/40 font-bold text-[10px]">
                          Low Stock ({product.stock_quantity})
                        </Badge>
                      ) : (
                        <Badge className="bg-coral-500 text-cream-100 font-bold text-[10px]">
                          In Stock ({product.stock_quantity})
                        </Badge>
                      )}
                    </div>

                    {/* Quick View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                        setModalQty(1);
                      }}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 dark:bg-neutral-900/95 hover:bg-white text-charcoal-900 dark:text-neutral-100 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-bold backdrop-blur-md border border-cream-200 dark:border-neutral-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-coral-500" /> Quick View
                    </button>
                  </div>

                  {/* Card Info */}
                  <div className="p-5 space-y-1.5">
                    <span className="text-[10px] font-extrabold text-coral-500 uppercase tracking-wider">
                      {product.category_detail?.name || 'Uncategorized'}
                    </span>
                    <h3 className="font-bold text-base text-charcoal-900 dark:text-neutral-100 group-hover:text-coral-500 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-charcoal-700 dark:text-neutral-400 text-xs line-clamp-2 min-h-[32px]">
                      {product.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 flex items-center justify-between border-t border-cream-200 dark:border-neutral-800 mt-2 pt-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-charcoal-700/60 dark:text-neutral-400 line-through">MRP ₹{getMrp(product.price)}</span>
                      <span className="text-[9px] font-bold text-coral-500 bg-coral-50 dark:bg-coral-950/40 px-1 py-0.2 rounded">20% OFF</span>
                    </div>
                    <span className="text-xl font-black text-charcoal-900 dark:text-white">₹{product.price}</span>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product, 1);
                    }}
                    disabled={isOutOfStock}
                    size="sm"
                    className={`gap-1.5 rounded-xl font-bold shadow-xs ${
                      addedIds[product.id]
                        ? 'bg-coral-600 text-cream-100'
                        : 'bg-coral-500 hover:bg-coral-600 text-cream-100'
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
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Shadcn Pagination Bar */}
      {totalPages > 1 && (
        <Pagination className="pt-6">
          <PaginationContent className="bg-white dark:bg-neutral-900 border border-cream-200 dark:border-neutral-800 p-1.5 rounded-2xl shadow-xs flex items-center gap-1 transition-colors">
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="rounded-xl text-xs font-bold text-charcoal-700 dark:text-neutral-300 hover:text-coral-500 hover:bg-cream-100 dark:hover:bg-neutral-800 gap-1 px-3"
              >
                <ChevronLeft className="w-4 h-4 text-coral-500" /> Prev
              </Button>
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <Button
                  variant={page === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    page === pageNum
                      ? 'bg-coral-500 hover:bg-coral-600 text-cream-100 shadow-xs'
                      : 'text-charcoal-700 dark:text-neutral-300 hover:bg-cream-200/60 dark:hover:bg-neutral-800'
                  }`}
                >
                  {pageNum}
                </Button>
              </PaginationItem>
            ))}

            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="rounded-xl text-xs font-bold text-charcoal-700 dark:text-neutral-300 hover:text-coral-500 hover:bg-cream-100 dark:hover:bg-neutral-800 gap-1 px-3"
              >
                Next <ChevronRight className="w-4 h-4 text-coral-500" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Shadcn Dialog Quick View Modal */}
      <Dialog open={!!quickViewProduct} onOpenChange={(open) => !open && setQuickViewProduct(null)}>
        {quickViewProduct && (
          <DialogContent className="sm:max-w-xl rounded-3xl p-6 bg-white border border-cream-200 text-charcoal-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-charcoal-900">{quickViewProduct.name}</DialogTitle>
              <DialogDescription className="text-xs text-charcoal-700">
                Category: <span className="font-bold text-charcoal-900">{quickViewProduct.category_detail?.name || 'Uncategorized'}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2">
              <div className="h-56 bg-cream-200/50 rounded-2xl flex items-center justify-center overflow-hidden border border-cream-200">
                {quickViewProduct.image_url ? (
                  <img
                    src={quickViewProduct.image_url}
                    alt={quickViewProduct.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-charcoal-700/40" />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-coral-500 dark:text-white">₹{quickViewProduct.price}</span>
                    <span className="text-xs text-charcoal-700/60 dark:text-neutral-400 line-through">MRP ₹{getMrp(quickViewProduct.price)}</span>
                  </div>
                  <p className="text-xs text-charcoal-700 mt-2 leading-relaxed">
                    {quickViewProduct.description || 'High quality inventory product.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-charcoal-700">Stock Status:</span>
                  {quickViewProduct.stock_quantity === 0 ? (
                    <Badge variant="destructive" className="font-bold text-[10px]">Out of Stock</Badge>
                  ) : (
                    <Badge className="bg-coral-500 text-cream-100 font-bold text-[10px]">
                      In Stock ({quickViewProduct.stock_quantity} available)
                    </Badge>
                  )}
                </div>

                {quickViewProduct.stock_quantity > 0 && (
                  <div className="space-y-3 pt-3 border-t border-cream-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal-700">Quantity:</span>
                      <div className="flex items-center gap-2 border border-cream-200 rounded-xl p-1 bg-cream-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-lg text-charcoal-700 hover:bg-cream-200"
                          onClick={() => setModalQty((q) => Math.max(q - 1, 1))}
                          disabled={modalQty <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-bold text-charcoal-900">{modalQty}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-lg text-charcoal-700 hover:bg-cream-200"
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
                      className="w-full py-2.5 font-bold gap-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-cream-100"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add {modalQty} to Cart (₹{(parseFloat(quickViewProduct.price) * modalQty).toFixed(2)})
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        const pid = quickViewProduct.id;
                        setQuickViewProduct(null);
                        navigate(`/products/${pid}`);
                      }}
                      className="w-full py-2 font-bold gap-2 rounded-xl border-cream-200 text-charcoal-900 bg-white hover:bg-cream-200/50"
                    >
                      View Full Details Page →
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
