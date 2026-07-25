import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import {
  Package,
  Plus,
  Edit,
  RefreshCw,
  Trash2,
  Search,
  X,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { uploadProductImage } from '@/utils/imageUpload';
import { getErrorMessage } from '@/utils/errorHandler';
import { toast } from '@/components/ui/toast';

export const ProductManagement = ({ products, categories, productMutation, stockMutation, deleteProductMutation }) => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Upload Status States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Form states for Product
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState(0);
  const [prodCategory, setProdCategory] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodIsActive, setProdIsActive] = useState(true);

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
    setUploadError(null);
    setUploadSuccess(false);
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
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!prodCategory) return;
    const payload = {
      name: prodName,
      description: prodDesc,
      price: prodPrice,
      stock_quantity: prodStock,
      category: prodCategory,
      image_url: prodImageUrl || null,
      is_active: prodIsActive,
    };
    if (editingProduct) {
      payload.id = editingProduct.id;
    }
    productMutation.mutate(payload, {
      onSuccess: () => {
        setIsProductModalOpen(false);
        resetProductForm();
        toast.create({
          title: editingProduct ? "Product Updated" : "Product Created",
          description: `Successfully saved "${prodName}"`,
          type: "success",
        });
      },
      onError: (err) => {
        toast.create({
          title: "Save Failed",
          description: getErrorMessage(err, "Could not save product."),
          type: "error",
        });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmProduct) return;
    deleteProductMutation.mutate(deleteConfirmProduct.id, {
      onSuccess: () => {
        toast.create({
          title: "Product Deleted",
          description: `Deleted "${deleteConfirmProduct.name}"`,
          type: "success",
        });
        setDeleteConfirmProduct(null);
      },
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce max 1MB limit
    const MAX_SIZE = 1 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds strict 1 MB limit.`);
      setUploadSuccess(false);
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const url = await uploadProductImage(file);
      setProdImageUrl(url);
      setUploadSuccess(true);
    } catch (err) {
      setUploadError(err.message || 'Image upload failed.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const filteredProducts = products?.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !categoryFilter || p.category === Number(categoryFilter);
    const matchesStock =
      stockFilter === 'all'
        ? true
        : stockFilter === 'low_stock'
        ? (p.stock_quantity > 0 && p.stock_quantity < 5) || p.is_low_stock
        : stockFilter === 'out_of_stock'
        ? p.stock_quantity === 0 || p.is_out_of_stock
        : true;
    return matchesSearch && matchesCategory && matchesStock;
  }) || [];

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const lowStockTotal = products?.filter((p) => (p.stock_quantity > 0 && p.stock_quantity < 5) || p.is_low_stock).length || 0;
  const outOfStockTotal = products?.filter((p) => p.stock_quantity === 0 || p.is_out_of_stock).length || 0;

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Product Catalogue Management</h2>
          <p className="text-xs text-muted-foreground">
            Manage items, upload product images (max 1MB limit), and adjust stock ({filteredProducts.length} matching items)
          </p>
        </div>
        <Button onClick={openAddProduct} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Filter, Stock Chips and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-background border text-xs font-semibold rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full sm:w-48"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-primary" /> Stock Filter:
          </span>
          <Button
            size="sm"
            variant={stockFilter === 'all' ? 'default' : 'outline'}
            onClick={() => {
              setStockFilter('all');
              setPage(1);
            }}
            className="h-8 rounded-xl text-xs font-bold gap-1.5"
          >
            All Products ({products?.length || 0})
          </Button>

          <Button
            size="sm"
            variant={stockFilter === 'low_stock' ? 'default' : 'outline'}
            onClick={() => {
              setStockFilter('low_stock');
              setPage(1);
            }}
            className={`h-8 rounded-xl text-xs font-bold gap-1.5 ${
              stockFilter === 'low_stock'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Low Stock Only ({lowStockTotal})
          </Button>

          <Button
            size="sm"
            variant={stockFilter === 'out_of_stock' ? 'default' : 'outline'}
            onClick={() => {
              setStockFilter('out_of_stock');
              setPage(1);
            }}
            className={`h-8 rounded-xl text-xs font-bold gap-1.5 ${
              stockFilter === 'out_of_stock'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Out of Stock Only ({outOfStockTotal})
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found matching active filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted border flex items-center justify-center flex-shrink-0">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{p.category_detail?.name || 'None'}</TableCell>
                    <TableCell className="font-bold">₹{p.price}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.stock_quantity === 0 ? 'destructive' : p.stock_quantity < 5 ? 'outline' : 'secondary'}
                        className={p.stock_quantity < 5 && p.stock_quantity > 0 ? 'border-amber-500 text-amber-600 dark:text-amber-400' : ''}
                      >
                        {p.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? 'default' : 'outline'}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditProduct(p)} title="Edit product">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedStockProduct(p);
                          setNewStockVal(p.stock_quantity);
                          setIsStockModalOpen(true);
                        }}
                        title="Direct stock update"
                      >
                        <RefreshCw className="w-4 h-4 text-amber-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteConfirmProduct(p)}
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Interactive Pagination Bar */}
      {totalPages > 1 && (
        <Pagination className="pt-2">
          <PaginationContent className="bg-card border p-1.5 rounded-2xl shadow-xs flex items-center justify-center gap-1 transition-colors">
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl text-xs font-bold gap-1 px-3"
              >
                <ChevronLeft className="w-4 h-4 text-primary" /> Prev
              </Button>
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <Button
                  variant={currentPage === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
                >
                  {pageNum}
                </Button>
              </PaginationItem>
            ))}

            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl text-xs font-bold gap-1 px-3"
              >
                Next <ChevronRight className="w-4 h-4 text-primary" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-[92vw] sm:max-w-lg p-6 rounded-2xl border bg-background space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <Button size="icon" variant="ghost" onClick={() => setIsProductModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Product Name</label>
                <Input required value={prodName} onChange={(e) => setProdName(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Description</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-background border rounded-md px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary h-20 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Price (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Stock Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Category</label>
                <select
                  required
                  value={prodCategory}
                  onChange={(e) => setProdCategory(Number(e.target.value))}
                  className="w-full bg-background border rounded-md px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary text-sm"
                >
                  <option value="">Select Category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Image Upload Input (Max 1MB limit) */}
              <div className="space-y-2 border-t pt-3">
                <label className="block text-xs font-bold uppercase text-primary flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4" /> Upload Product Image (Max 1MB)
                </label>

                <div className="border-2 border-dashed rounded-xl p-3 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="productImageFileInput"
                    disabled={isUploadingImage}
                  />
                  <label
                    htmlFor="productImageFileInput"
                    className="cursor-pointer text-xs flex flex-col items-center gap-1 text-muted-foreground"
                  >
                    <UploadCloud className="w-6 h-6 text-primary" />
                    <span>{isUploadingImage ? 'Uploading image...' : 'Click to select image file (Max 1MB limit)'}</span>
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {uploadError}
                  </p>
                )}

                {uploadSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Image uploaded successfully! URL saved.
                  </p>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Image URL String (Saved to DB)
                  </label>
                  <Input
                    type="url"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={prodIsActive}
                  onChange={(e) => setProdIsActive(e.target.checked)}
                  className="rounded accent-primary"
                />
                <label htmlFor="isActiveCheck" className="font-medium">
                  Is Active (Soft Delete Toggle)
                </label>
              </div>

              <Button type="submit" className="w-full py-3" disabled={isUploadingImage}>
                {editingProduct ? 'Save Product Changes' : 'Create Product'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Direct Stock Update Modal */}
      {isStockModalOpen && selectedStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full p-6 rounded-2xl border bg-background space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Direct Stock Update</h3>
              <Button size="icon" variant="ghost" onClick={() => setIsStockModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Updating stock for <strong className="text-foreground">{selectedStockProduct.name}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1">New Quantity</label>
              <Input
                type="number"
                min="0"
                value={newStockVal}
                onChange={(e) => setNewStockVal(parseInt(e.target.value) || 0)}
                className="text-lg font-bold"
              />
            </div>

            <Button
              className="w-full py-3"
              onClick={() => {
                stockMutation.mutate(
                  { id: selectedStockProduct.id, stock_quantity: newStockVal },
                  { onSuccess: () => setIsStockModalOpen(false) }
                );
              }}
            >
              Update Stock
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full p-6 rounded-2xl border bg-background space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Delete Product</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">{deleteConfirmProduct.name}</strong>?
              If this product has existing orders, it will be safely soft-deleted (`is_active=false`).
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirmProduct(null)}>
                Cancel
              </Button>

              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
