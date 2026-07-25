import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useCart } from '../context/CartContext';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  Package,
  ShoppingCart,
  Check,
  Search,
  ChevronRight,
  TrendingUp,
  Star,
  Flame,
  ThumbsUp,
  SlidersHorizontal,
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Categories
  const { data: categories, isLoading: isCatLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/products/categories/');
      if (res.data && 'results' in res.data) return res.data.results;
      return res.data;
    },
  });

  // Fetch Products for Sections
  const { data: allProducts, isLoading: isProdLoading } = useQuery({
    queryKey: ['home-products'],
    queryFn: async () => {
      const res = await apiClient.get('/products/?is_active=true&page=1');
      return res.data?.results || [];
    },
  });

  // Split Active Products into Top Selling & Suggestions
  const activeProducts = (allProducts || []).filter((p) => p.is_active !== false);
  const topSellingProducts = activeProducts.slice(0, 4);
  const suggestedProducts = activeProducts.slice(4, 8).length > 0 ? activeProducts.slice(4, 8) : activeProducts.slice(0, 4);
  const heroFeaturedProduct = activeProducts[0] || null;

  const getMrp = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return null;
    return (num * 1.25).toFixed(2);
  };

  const handleAddToCart = (e, product) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!product || product.stock_quantity === 0 || product.is_orderable === false) return;
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    toast.create({
      title: "Item Added to Cart",
      description: `Added "${product.name}" to your cart!`,
      type: "success",
    });

    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner (Fluid Height with Visual Product Images) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-coral-50 via-cream-200/50 to-cream-100 dark:from-neutral-900 dark:via-neutral-900/80 dark:to-neutral-900 text-charcoal-900 dark:text-neutral-100 min-h-[290px] sm:h-[320px] py-6 sm:py-0 rounded-3xl max-w-7xl mx-auto mt-4 border border-cream-200 dark:border-neutral-800 shadow-sm flex items-center px-6 sm:px-10 lg:px-12 transition-colors">
        {/* Background Decorative Blurs */}
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-coral-100/60 dark:bg-coral-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-coral-50 dark:bg-neutral-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Headline, Search & Actions */}
          <div className="md:col-span-7 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-white dark:bg-neutral-800 text-coral-500 border border-coral-100 dark:border-neutral-700 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-coral-500" /> 30% OFF Mega Seasonal Tech Sale
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-charcoal-900 dark:text-neutral-100 leading-tight">
              Next-Gen Tech Hardware <br />
              <span className="bg-gradient-to-r from-coral-500 via-coral-600 to-coral-700 bg-clip-text text-transparent">
                Direct to Your Door
              </span>
            </h1>

            {/* Quick Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 max-w-lg bg-white dark:bg-neutral-800 p-1.5 rounded-2xl border border-cream-200 dark:border-neutral-700 shadow-sm focus-within:border-coral-500 transition-all"
            >
              <Search className="w-4 h-4 text-coral-500 ml-2.5 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search processors, graphics cards, monitors..."
                className="w-full bg-transparent text-charcoal-900 dark:text-neutral-100 placeholder:text-charcoal-700/50 dark:placeholder:text-neutral-400 text-xs outline-none px-2 py-1 font-medium"
              />
              <Button type="submit" size="xs" className="rounded-xl px-3.5 font-bold shadow-xs bg-coral-500 hover:bg-coral-600 text-cream-100 h-8">
                Search
              </Button>
            </form>

            <div className="flex items-center gap-3 pt-1">
              <Button
                size="sm"
                className="rounded-xl gap-1.5 font-bold bg-coral-500 hover:bg-coral-600 text-cream-100 text-xs px-4 shadow-sm"
                onClick={() => navigate('/products')}
              >
                Browse Shop <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <span className="text-[11px] font-semibold text-charcoal-700 dark:text-neutral-300">✓ Free Express Shipping over ₹2,000</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Product Banner */}
          <div className="hidden md:flex md:col-span-5 relative items-center justify-center h-full">
            <div className="relative w-full max-w-[300px] h-[220px] rounded-2xl bg-white dark:bg-neutral-800 p-3 border border-cream-200 dark:border-neutral-700 shadow-md flex flex-col justify-between overflow-hidden group hover:shadow-xl transition-all">
              {heroFeaturedProduct?.image_url ? (
                <img
                  src={heroFeaturedProduct.image_url}
                  alt={heroFeaturedProduct.name || "Hero Product"}
                  loading="lazy"
                  className="w-full h-32 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-32 rounded-xl bg-cream-100 dark:bg-neutral-900 flex items-center justify-center text-coral-500">
                  <Package className="w-12 h-12" />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div>
                  <Badge variant="outline" className="text-[9px] font-extrabold uppercase text-coral-500 border-coral-100 dark:border-coral-900/40 bg-coral-50 dark:bg-coral-950/40">
                    Featured Deal
                  </Badge>
                  <p className="text-xs font-bold text-charcoal-900 dark:text-neutral-100 truncate max-w-[170px]">
                    {heroFeaturedProduct?.name || 'High Performance Gear'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-coral-500 block">₹{heroFeaturedProduct?.price || '999'}</span>
                </div>
              </div>

              {/* Floating Discount Tag */}
              <div className="absolute top-2 right-2 bg-coral-500 text-cream-100 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                30% OFF
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3.5 flex items-center gap-3 border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-coral-500 transition-all rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">Real-time Stock</h4>
              <p className="text-[10px] text-charcoal-700 dark:text-neutral-400">Atomic inventory locks</p>
            </div>
          </Card>

          <Card className="p-3.5 flex items-center gap-3 border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-coral-500 transition-all rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">Verified Hardware</h4>
              <p className="text-[10px] text-charcoal-700 dark:text-neutral-400">100% original quality</p>
            </div>
          </Card>

          <Card className="p-3.5 flex items-center gap-3 border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-coral-500 transition-all rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">Express Delivery</h4>
              <p className="text-[10px] text-charcoal-700 dark:text-neutral-400">Fast insured shipping</p>
            </div>
          </Card>

          <Card className="p-3.5 flex items-center gap-3 border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-coral-500 transition-all rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">Fair Pricing</h4>
              <p className="text-[10px] text-charcoal-700 dark:text-neutral-400">Display strictly in ₹ INR</p>
            </div>
          </Card>
        </div>

        {/* TOP SELLING SECTION */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-cream-200 dark:border-neutral-800 pb-3">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-coral-500 tracking-wider mb-1 bg-coral-50 dark:bg-coral-950/40 px-2.5 py-0.5 rounded-full border border-coral-100 dark:border-coral-900/40">
                <Flame className="w-3 h-3 text-coral-500 fill-coral-500" /> Best Sellers
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-charcoal-900 dark:text-neutral-100">
                Top Selling Products
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-coral-500 hover:underline flex items-center gap-1"
            >
              View Full Ranking <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isProdLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-4 space-y-3 rounded-2xl bg-white dark:bg-neutral-900 border border-cream-200 dark:border-neutral-800">
                  <Skeleton className="h-44 rounded-xl bg-cream-200 dark:bg-neutral-800" />
                  <Skeleton className="h-5 w-3/4 bg-cream-200 dark:bg-neutral-800" />
                  <Skeleton className="h-4 w-1/2 bg-cream-200 dark:bg-neutral-800" />
                  <Skeleton className="h-8 w-full bg-cream-200 dark:bg-neutral-800" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topSellingProducts.map((product, idx) => {
                const isOutOfStock = product.stock_quantity === 0 || product.is_orderable === false;

                return (
                  <Card
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="p-4 flex flex-col justify-between space-y-3 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 group border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-coral-500 relative overflow-hidden cursor-pointer"
                  >
                    <div>
                      {/* Top Rank Pill & Images */}
                      <div className="relative h-44 rounded-xl bg-cream-200/50 dark:bg-neutral-800/60 flex items-center justify-center border border-cream-200 dark:border-neutral-800 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-charcoal-700/40 dark:text-neutral-500" />
                        )}

                        <div className="absolute top-2.5 left-2.5 bg-charcoal-900 dark:bg-neutral-800 text-cream-100 dark:text-neutral-100 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-transparent dark:border-neutral-700">
                          <span>#{idx + 1} Best Seller</span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="font-bold text-[10px]">Sold Out</Badge>
                          ) : (
                            <Badge className="bg-coral-500 text-cream-100 font-bold text-[10px]">
                              In Stock ({product.stock_quantity})
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Info & Ratings */}
                      <div className="pt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-extrabold text-coral-500 uppercase tracking-wider">
                            {product.category_detail?.name || 'Hardware'}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>4.9 (42)</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-base text-charcoal-900 dark:text-neutral-100 line-clamp-1 group-hover:text-coral-500 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-charcoal-700 dark:text-neutral-400 line-clamp-2 min-h-[32px]">
                          {product.description || 'Top selling inventory product.'}
                        </p>
                      </div>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="flex items-center justify-between border-t border-cream-200 dark:border-neutral-800 pt-3 mt-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-charcoal-700/60 dark:text-neutral-500 line-through">
                            MRP ₹{getMrp(product.price)}
                          </span>
                          <span className="text-[9px] font-extrabold text-coral-500 bg-coral-50 dark:bg-coral-950/40 px-1 py-0.2 rounded">
                            20% OFF
                          </span>
                        </div>
                        <span className="text-lg font-black text-charcoal-900 dark:text-white">₹{product.price}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={isOutOfStock}
                        className={`gap-1.5 rounded-xl font-bold ${
                          addedIds[product.id]
                            ? 'bg-coral-600 text-cream-100'
                            : 'bg-coral-500 hover:bg-coral-600 text-cream-100'
                        }`}
                      >
                        {addedIds[product.id] ? (
                          <>
                            <Check className="w-4 h-4" /> Added
                          </>
                        ) : isOutOfStock ? (
                          'Sold Out'
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" /> Buy Now
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* SUGGESTIONS SECTION (Using Shadcn Tabs & Rich Images) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-cream-200 dark:border-neutral-800 pb-3">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-coral-500 tracking-wider mb-1 bg-coral-50 dark:bg-coral-950/40 px-2.5 py-0.5 rounded-full border border-coral-100 dark:border-coral-900/40">
                <ThumbsUp className="w-3 h-3 text-coral-500" /> Curated Picks
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-charcoal-900 dark:text-neutral-100">
                Smart Suggestions for You
              </h2>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full space-y-6">
            <TabsList className="bg-cream-200/60 dark:bg-neutral-800/60 p-1 rounded-2xl border border-cream-200 dark:border-neutral-800 w-full sm:w-auto flex-wrap h-auto">
              <TabsTrigger value="all" className="rounded-xl text-xs font-bold px-4 py-2 data-active:bg-white dark:data-active:bg-neutral-900 data-active:text-coral-500 data-active:shadow-xs">
                All Recommended
              </TabsTrigger>
              <TabsTrigger value="deals" className="rounded-xl text-xs font-bold px-4 py-2 data-active:bg-white dark:data-active:bg-neutral-900 data-active:text-coral-500 data-active:shadow-xs">
                Hot Deals
              </TabsTrigger>
              <TabsTrigger value="new" className="rounded-xl text-xs font-bold px-4 py-2 data-active:bg-white dark:data-active:bg-neutral-900 data-active:text-coral-500 data-active:shadow-xs">
                New Arrivals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedProducts.map((product) => {
                  const isOutOfStock = product.stock_quantity === 0 || product.is_orderable === false;

                  return (
                    <Card
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="p-4 flex flex-col justify-between space-y-3 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 group border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-coral-500 relative overflow-hidden cursor-pointer"
                    >
                      <div>
                        <div className="relative h-44 rounded-xl bg-cream-200/50 dark:bg-neutral-800/60 flex items-center justify-center border border-cream-200 dark:border-neutral-800 overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Package className="w-12 h-12 text-charcoal-700/40 dark:text-neutral-500" />
                          )}
                          <div className="absolute top-2.5 left-2.5">
                            <Badge variant="outline" className="text-[10px] font-extrabold uppercase text-coral-500 border-coral-100 dark:border-coral-900/40 bg-coral-50 dark:bg-coral-950/40 shadow-xs">
                              Recommended
                            </Badge>
                          </div>
                          {isOutOfStock && (
                            <div className="absolute top-2.5 right-2.5">
                              <Badge variant="destructive" className="font-bold text-[10px]">Sold Out</Badge>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 space-y-1">
                          <span className="text-[10px] font-extrabold text-coral-500 uppercase tracking-wider">
                            {product.category_detail?.name || 'Hardware'}
                          </span>
                          <h3 className="font-bold text-base text-charcoal-900 dark:text-neutral-100 line-clamp-1 group-hover:text-coral-500 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xs text-charcoal-700 dark:text-neutral-400 line-clamp-2 min-h-[32px]">
                            {product.description || 'Recommended hardware item.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-cream-200 dark:border-neutral-800 pt-3 mt-2">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-charcoal-700/60 dark:text-neutral-500 line-through">MRP ₹{getMrp(product.price)}</span>
                          </div>
                          <span className="text-lg font-black text-charcoal-900 dark:text-neutral-100">₹{product.price}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={isOutOfStock}
                          className="gap-1.5 rounded-xl font-bold bg-coral-500 hover:bg-coral-600 text-cream-100"
                        >
                          {isOutOfStock ? 'Sold Out' : <><ShoppingCart className="w-4 h-4" /> Add</>}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="deals" className="outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedProducts.slice(0, 2).map((product) => (
                  <Card key={product.id} className="p-4 flex flex-col justify-between space-y-3 rounded-2xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
                    <div className="relative h-44 rounded-xl bg-cream-200/50 dark:bg-neutral-800/60 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-12 h-12 text-charcoal-700/40 dark:text-neutral-500" />
                      )}
                      <Badge className="absolute top-2.5 left-2.5 bg-coral-500 text-cream-100 text-[10px] font-black">
                        Deal of the Day
                      </Badge>
                    </div>
                    <div className="pt-2 space-y-1">
                      <h3 className="font-bold text-base text-charcoal-900 dark:text-neutral-100 line-clamp-1">{product.name}</h3>
                      <div className="text-lg font-black text-coral-500">₹{product.price}</div>
                    </div>
                    <Button onClick={(e) => handleAddToCart(e, product)} className="w-full rounded-xl bg-coral-500 text-cream-100 font-bold">
                      Claim Deal
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="new" className="outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedProducts.slice(2, 4).map((product) => (
                  <Card key={product.id} className="p-4 flex flex-col justify-between space-y-3 rounded-2xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
                    <div className="relative h-44 rounded-xl bg-cream-200/50 dark:bg-neutral-800/60 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-12 h-12 text-charcoal-700/40 dark:text-neutral-500" />
                      )}
                      <Badge className="absolute top-2.5 left-2.5 bg-charcoal-900 dark:bg-neutral-800 text-cream-100 dark:text-neutral-100 text-[10px] font-black">
                        New Arrival
                      </Badge>
                    </div>
                    <div className="pt-2 space-y-1">
                      <h3 className="font-bold text-base text-charcoal-900 dark:text-neutral-100 line-clamp-1">{product.name}</h3>
                      <div className="text-lg font-black text-coral-500">₹{product.price}</div>
                    </div>
                    <Button onClick={(e) => handleAddToCart(e, product)} className="w-full rounded-xl bg-coral-500 text-cream-100 font-bold">
                      Add to Cart
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Categories Section */}
        <section className="space-y-4 pt-4">
          <div className="flex justify-between items-end border-b border-cream-200 dark:border-neutral-800 pb-3">
            <div>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider mb-1 text-coral-500 border-coral-100 dark:border-coral-900/40 bg-coral-50 dark:bg-coral-950/40">
                Explore Categories
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-charcoal-900 dark:text-neutral-100">
                Hardware Categories
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-coral-500 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isCatLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl bg-cream-200 dark:bg-neutral-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories?.map((cat) => (
                <Card
                  key={cat.id}
                  onClick={() => navigate(`/products?category__slug=${cat.slug}`)}
                  className="p-5 text-center space-y-2 cursor-pointer hover:border-coral-500 hover:shadow-lg transition-all rounded-2xl group border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                >
                  <div className="w-12 h-12 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-coral-500 group-hover:text-cream-100 transition-all">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-charcoal-900 dark:text-neutral-100 group-hover:text-coral-500 transition-colors">
                    {cat.name}
                  </h3>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
