import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package, ChevronRight, Home, Layers, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Category, Inventory } from '../types';
import { getCategories, getInventory, createCategory, updateCategory, deleteCategory } from '../api';

export default function InventoryDetail() {
  const { invId } = useParams<{ invId: string }>();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!invId) return;
    try {
      setLoading(true);
      const [invData, catsData] = await Promise.all([
        getInventory(invId),
        getCategories(invId)
      ]);
      setInventory(invData);
      setCategories(catsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [invId]);

  const handleCreate = async () => {
    if (!invId) return;
    const name = window.prompt('Enter category name:');
    if (!name) return;
    const description = window.prompt('Enter category description (optional):') || undefined;
    
    try {
      await createCategory(invId, name, description);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleEdit = async (e: React.MouseEvent, cat: Category) => {
    e.preventDefault();
    e.stopPropagation();
    if (!invId) return;
    
    const name = window.prompt('Enter new name:', cat.name);
    if (!name) return;
    const description = window.prompt('Enter new description:', cat.description || '') || undefined;
    
    try {
      await updateCategory(invId, cat.id, name, description);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update category');
    }
  };

  const handleDelete = async (e: React.MouseEvent, catId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!invId) return;
    
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await deleteCategory(invId, catId);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        {error}
      </div>
    );
  }

  const inventoryName = inventory?.name || 'Unknown Inventory';

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
        <Link
          to="/app"
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <Link
          to="/app/inventories"
          className="text-slate-400 hover:text-white transition-colors"
        >
          Inventories
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-blue-400">{inventoryName}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{inventoryName}</h2>
          <p className="text-slate-400">Select a category to view items</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-cyan-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/app/inventories/${invId}/${category.id}`}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:shadow-xl hover:shadow-slate-800/50 transition-shadow duration-200 group relative block"
          >
            <div className="absolute top-4 right-12 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={(e) => handleEdit(e, category)}
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleDelete(e, category.id)}
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 pr-16">
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-slate-400 text-sm mb-3">{category.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-400">
                      <span className="text-white font-medium">{category.item_count}</span> items
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors mt-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
