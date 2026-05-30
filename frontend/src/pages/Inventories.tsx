import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, FolderOpen, Tag, Calendar, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Inventory } from '../types';
import { getInventories, createInventory, updateInventory, deleteInventory } from '../api';

export default function Inventories() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const data = await getInventories();
      setInventories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const handleCreate = async () => {
    const name = window.prompt('Enter inventory name:');
    if (!name) return;
    const description = window.prompt('Enter inventory description (optional):') || undefined;
    
    try {
      await createInventory(name, description);
      fetchInventories();
    } catch (err: any) {
      alert(err.message || 'Failed to create inventory');
    }
  };

  const handleEdit = async (e: React.MouseEvent, inv: Inventory) => {
    e.preventDefault();
    e.stopPropagation();
    
    const name = window.prompt('Enter new name:', inv.name);
    if (!name) return;
    const description = window.prompt('Enter new description:', inv.description || '') || undefined;
    
    try {
      await updateInventory(inv.id, name, description);
      fetchInventories();
    } catch (err: any) {
      alert(err.message || 'Failed to update inventory');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this inventory?')) return;
    
    try {
      await deleteInventory(id);
      fetchInventories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete inventory');
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Inventories</h2>
          <p className="text-slate-400">Manage your inventory locations</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-cyan-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Inventory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventories.map((inventory) => (
          <Link
            key={inventory.id}
            to={`/app/inventories/${inventory.id}`}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:shadow-xl hover:shadow-slate-800/50 transition-shadow duration-200 group relative block"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEdit(e, inventory)}
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleDelete(e, inventory.id)}
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm mr-20">
                <Calendar className="w-4 h-4" />
                <span>{new Date(inventory.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors pr-20">
              {inventory.name}
            </h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{inventory.description}</p>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-400">
                  <span className="text-white font-medium">{inventory.category_count}</span> categories
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-400">
                  <span className="text-white font-medium">{inventory.item_count}</span> items
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
