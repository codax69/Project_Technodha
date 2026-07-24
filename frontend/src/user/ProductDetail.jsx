import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useCart } from '../context/CartContext';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Package,
  ShoppingCart,
  Check,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Truck,
  Minus,
  Plus,
  Star,
  Sparkles,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Fetch Single Product
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product-detail', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} - Technodha`;
    }
  }, [product]);

  // Fetch Related Products
  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: async () => {
      const res = await apiClient.get('/products/?page=1');
      const list = res.data?.results || [];
      return list.filter((p) => p.id !== parseInt(id, 10)).slice(0, 4);
    },
    enabled: !!product,
  });

  const getMrp = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return null;
    return (num * 1.25).toFixed(2);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setIsAdded(true);
    toast.create({
      title: "Item Added to Cart",
      description: `Added ${quantity} × "${product.name}" to your cart!`,
      type: "success",
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-6 w-32 rounded-xl bg-cream-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="h-96 rounded-3xl bg-cream-200" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-xl bg-cream-200" />
            <Skeleton className="h-6 w-1/4 rounded-xl bg-cream-200" />
            <Skeleton className="h-24 w-full rounded-2xl bg-cream-200" />
            <Skeleton className="h-12 w-full rounded-2xl bg-cream-200" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-coral-50 text-coral-600 rounded-3xl flex items-center justify-center mx-auto border border-coral-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-charcoal-900">Product Not Found</h2>
          <p className="text-xs text-charcoal-700">
            The hardware item you are looking for may have been removed or does not exist.
          </p>
        </div>
        <Button onClick={() => navigate('/products')} className="rounded-2xl px-6 gap-2 font-bold bg-coral-500 hover:bg-coral-600 text-cream-100">
          <ArrowLeft className="w-4 h-4" /> Return to Catalogue
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity === 0 || !product.is_orderable;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-700 dark:text-neutral-300 hover:text-coral-500 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalogue
      </button>

      {/* Main Product Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: High-Res Image Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-4 rounded-3xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md overflow-hidden relative group">
            <div className="relative h-80 sm:h-96 rounded-2xl bg-cream-200/50 dark:bg-neutral-800/60 flex items-center justify-center overflow-hidden border border-cream-200 dark:border-neutral-800">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <Package className="w-24 h-24 text-charcoal-700/30 dark:text-neutral-500" />
              )}

              <div className="absolute top-4 right-4">
                {isOutOfStock ? (
                  <Badge variant="destructive" className="font-bold text-xs px-3 py-1">Sold Out</Badge>
                ) : isLowStock ? (
                  <Badge variant="outline" className="border-coral-500 text-coral-600 dark:text-coral-400 bg-coral-50 dark:bg-coral-950/40 font-bold text-xs px-3 py-1">
                    Only {product.stock_quantity} left in stock!
                  </Badge>
                ) : (
                  <Badge className="bg-coral-500 text-cream-100 font-bold text-xs px-3 py-1">
                    In Stock ({product.stock_quantity} available)
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Product Info & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-black uppercase text-coral-500 border-coral-100 dark:border-coral-900/40 bg-coral-50 dark:bg-coral-950/40">
                {product.category_detail?.name || 'Hardware'}
              </Badge>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.9 (48 reviews)
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-charcoal-900 dark:text-neutral-100 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-black text-coral-500 dark:text-white">₹{product.price}</span>
              <span className="text-base text-charcoal-700/60 dark:text-neutral-500 line-through">MRP ₹{getMrp(product.price)}</span>
              <Badge className="bg-coral-50 dark:bg-coral-950/40 text-coral-600 dark:text-coral-400 border-coral-100 dark:border-coral-900/40 font-extrabold text-xs">
                20% OFF
              </Badge>
              <span className="text-xs text-charcoal-700 dark:text-neutral-400 font-medium">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Stock Level Progress Indicator */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-cream-200/40 dark:bg-neutral-800/60 border border-cream-200 dark:border-neutral-800">
            <div className="flex justify-between text-xs font-bold text-charcoal-900 dark:text-neutral-100">
              <span>Inventory Stock Status</span>
              <span className="text-coral-500">{product.stock_quantity} units remaining</span>
            </div>
            <Progress value={Math.min(100, Math.max(10, (product.stock_quantity / 30) * 100))} className="h-2 rounded-full" />
          </div>

          <div className="border-t border-b border-cream-200 dark:border-neutral-800 py-4 space-y-2">
            <h3 className="text-xs font-extrabold uppercase text-charcoal-900 dark:text-neutral-100 tracking-wider">Description</h3>
            <p className="text-charcoal-700 dark:text-neutral-300 text-sm leading-relaxed">
              {product.description || 'Verified authentic inventory product from Technodha catalog.'}
            </p>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-1">
              <Zap className="w-5 h-5 text-coral-500 mx-auto" />
              <p className="text-[11px] font-bold text-charcoal-900 dark:text-neutral-100">Atomic Stock Lock</p>
            </div>
            <div className="p-3 rounded-2xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-coral-500 mx-auto" />
              <p className="text-[11px] font-bold text-charcoal-900 dark:text-neutral-100">100% Genuine</p>
            </div>
            <div className="p-3 rounded-2xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-1">
              <Truck className="w-5 h-5 text-coral-500 mx-auto" />
              <p className="text-[11px] font-bold text-charcoal-900 dark:text-neutral-100">Express Delivery</p>
            </div>
          </div>

          {/* Quantity Stepper & Actions */}
          {isOutOfStock ? (
            <div className="pt-2">
              <Button disabled size="lg" className="w-full rounded-2xl font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed">
                Sold Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-charcoal-900 dark:text-neutral-100">Select Quantity:</span>
                <div className="flex items-center gap-2 border border-cream-200 dark:border-neutral-700 rounded-2xl p-1 bg-white dark:bg-neutral-900">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-xl text-charcoal-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800"
                    onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-10 text-center text-base font-black text-charcoal-900 dark:text-neutral-100">{quantity}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-xl text-charcoal-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800"
                    onClick={() => setQuantity((q) => Math.min(q + 1, product.stock_quantity))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className={`rounded-2xl font-bold gap-2 shadow-md ${
                    isAdded ? 'bg-coral-600 text-cream-100' : 'bg-coral-500 hover:bg-coral-600 text-cream-100'
                  }`}
                >
                  {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {isAdded ? 'Added to Cart' : `Add to Cart (₹${(parseFloat(product.price) * quantity).toFixed(2)})`}
                </Button>

                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  variant="outline"
                  className="rounded-2xl font-bold border-cream-200 dark:border-neutral-700 text-charcoal-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 hover:bg-cream-200/50 dark:hover:bg-neutral-800 shadow-xs"
                >
                  Buy Now Instant
                </Button>
              </div>
            </div>
          )}

          {/* Shadcn Accordion for Hardware Specs & Support Info */}
          <div className="pt-4 border-t border-cream-200 dark:border-neutral-800">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="specs" className="border-cream-200 dark:border-neutral-800">
                <AccordionTrigger className="text-xs font-bold text-charcoal-900 dark:text-neutral-100 py-3">
                  Technical Specifications & Overview
                </AccordionTrigger>
                <AccordionContent className="text-xs text-charcoal-700 dark:text-neutral-400 space-y-1.5">
                  <p>• Category: {product.category_detail?.name || 'Hardware'}</p>
                  <p>• Model ID: TH-{product.id}-TECH</p>
                  <p>• Condition: Brand New Factory Sealed</p>
                  <p>• Warranty: 1-Year Official Manufacturer Warranty</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping" className="border-cream-200 dark:border-neutral-800">
                <AccordionTrigger className="text-xs font-bold text-charcoal-900 dark:text-neutral-100 py-3">
                  Shipping & Return Policy
                </AccordionTrigger>
                <AccordionContent className="text-xs text-charcoal-700 dark:text-neutral-400 space-y-1.5">
                  <p>• Same-day dispatch for orders placed before 2 PM.</p>
                  <p>• Atomic database locks guarantee immediate stock assignment.</p>
                  <p>• 7-Day hassle-free replacement policy.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="space-y-6 border-t border-cream-200 dark:border-neutral-800 pt-10">
          <div className="flex justify-between items-end">
            <div>
              <Badge variant="outline" className="text-[10px] font-black uppercase text-coral-500 border-coral-100 dark:border-coral-900/40 bg-coral-50 dark:bg-coral-950/40 mb-1">
                More Like This
              </Badge>
              <h2 className="text-2xl font-black text-charcoal-900 dark:text-neutral-100">Related Products</h2>
            </div>
            <Link to="/products" className="text-xs font-bold text-coral-500 hover:underline flex items-center gap-1">
              Explore All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <Card
                key={rel.id}
                onClick={() => navigate(`/products/${rel.id}`)}
                className="p-4 rounded-2xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-coral-500 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="h-40 rounded-xl bg-cream-200/50 dark:bg-neutral-800/60 flex items-center justify-center border border-cream-200 dark:border-neutral-800 overflow-hidden">
                    {rel.image_url ? (
                      <img src={rel.image_url} alt={rel.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="w-12 h-12 text-charcoal-700/40 dark:text-neutral-500" />
                    )}
                  </div>
                  <div className="pt-3 space-y-1">
                    <h3 className="font-bold text-sm text-charcoal-900 dark:text-neutral-100 group-hover:text-coral-500 transition-colors line-clamp-1">
                      {rel.name}
                    </h3>
                    <p className="text-xs text-charcoal-700 dark:text-neutral-400 line-clamp-1">{rel.description}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-cream-200 dark:border-neutral-800 pt-2">
                  <span className="font-black text-charcoal-900 dark:text-neutral-100 text-sm">₹{rel.price}</span>
                  <span className="text-xs font-bold text-coral-500">View Details →</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
