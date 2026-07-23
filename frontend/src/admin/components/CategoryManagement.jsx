import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export const CategoryManagement = ({ categories, categoryMutation, updateCategoryMutation, deleteCategoryMutation }) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setErrorMessage(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setErrorMessage(null);
    setIsCategoryModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName) return;

    if (editingCategory) {
      updateCategoryMutation.mutate(
        { id: editingCategory.id, name: categoryName },
        {
          onSuccess: () => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
            setCategoryName('');
            toast.create({
              title: "Category Updated",
              description: `Renamed to "${categoryName}"`,
              type: "success",
            });
          },
          onError: (err) => {
            const msg = err?.response?.data?.detail || 'Failed to update category.';
            setErrorMessage(msg);
            toast.create({
              title: "Update Failed",
              description: msg,
              type: "error",
            });
          },
        }
      );
    } else {
      categoryMutation.mutate(categoryName, {
        onSuccess: () => {
          setIsCategoryModalOpen(false);
          setCategoryName('');
          toast.create({
            title: "Category Created",
            description: `Added "${categoryName}"`,
            type: "success",
          });
        },
        onError: (err) => {
          const msg = err?.response?.data?.detail || 'Failed to create category.';
          setErrorMessage(msg);
          toast.create({
            title: "Creation Failed",
            description: msg,
            type: "error",
          });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteConfirmCategory) return;

    deleteCategoryMutation.mutate(deleteConfirmCategory.id, {
      onSuccess: () => {
        toast.create({
          title: "Category Deleted",
          description: `Deleted "${deleteConfirmCategory.name}"`,
          type: "success",
        });
        setDeleteConfirmCategory(null);
        setErrorMessage(null);
      },
      onError: (err) => {
        const msg = err?.response?.status === 409 || err?.response?.data?.detail
          ? "Cannot delete category because active products are assigned to it."
          : "Failed to delete category.";
        setErrorMessage(msg);
        toast.create({
          title: "Delete Failed",
          description: msg,
          type: "error",
        });
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header & Create */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Category Management</h2>
          <p className="text-xs text-muted-foreground">
            Create, update, or remove product categories ({categories?.length || 0} active)
          </p>
        </div>
        <Button onClick={openAddCategory} className="gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories?.map((cat) => (
          <Card key={cat.id} className="p-4 flex flex-col justify-between space-y-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base">{cat.name}</h3>
                <span className="text-xs text-muted-foreground font-mono">{cat.slug}</span>
              </div>
              <Layers className="w-5 h-5 text-primary/60" />
            </div>

            <div className="flex justify-end gap-1 border-t pt-2">
              <Button size="icon" variant="ghost" onClick={() => openEditCategory(cat)} title="Edit category">
                <Edit className="w-4 h-4 text-blue-600" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setErrorMessage(null);
                  setDeleteConfirmCategory(cat);
                }}
                title="Delete category"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full p-6 rounded-2xl border bg-background space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <Button size="icon" variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Category Name</label>
                <Input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Electronics, Accessories"
                />
              </div>

              <Button type="submit" className="w-full py-3">
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full p-6 rounded-2xl border bg-background space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Delete Category</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete category <strong className="text-foreground">{deleteConfirmCategory.name}</strong>?
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirmCategory(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
