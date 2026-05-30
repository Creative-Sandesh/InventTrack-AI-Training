import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Home, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Item, ItemStatus, Inventory, Category } from '../types';
import { getItems, getInventory, getCategories, createItem, updateItem, deleteItem } from '../api';

const statusColors: Record<ItemStatus, string> = {
  'in-stock': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'low-stock': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'out-of-stock': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusLabels: Record<ItemStatus, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
};

export default function CategoryDetail() {
  const { invId, catId } = useParams<{ invId: string; catId: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!invId || !catId) return;
    try {
      setLoading(true);
      const [itemsData, invData, catsData] = await Promise.all([
        getItems({ cat_id: catId }),
        getInventory(invId),
        getCategories(invId),
      ]);
      setItems(itemsData);
      setInventory(invData);
      const cat = catsData.find(c => c.id === catId);
      if (cat) setCategory(cat);
    } catch (err: any) {
      setError(err.message || 'Failed to load category details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [invId, catId]);

  const handleCreate = async () => {
    if (!catId) return;
    const name = window.prompt('Enter item name:');
    if (!name) return;
    const sku = window.prompt('Enter item SKU:');
    if (!sku) return;
    const quantityStr = window.prompt('Enter quantity:', '0');
    const priceStr = window.prompt('Enter price:', '0.00');
    
    try {
      await createItem({
        name,
        sku,
        category_id: catId,
        quantity: parseInt(quantityStr || '0', 10),
        price: parseFloat(priceStr || '0'),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create item');
    }
  };

  const handleEdit = async (item: Item) => {
    const name = window.prompt('Enter new name:', item.name);
    if (!name) return;
    const quantityStr = window.prompt('Enter new quantity:', item.quantity.toString());
    const priceStr = window.prompt('Enter new price:', item.price.toString());
    
    try {
      await updateItem(item.id, {
        name,
        quantity: parseInt(quantityStr || '0', 10),
        price: parseFloat(priceStr || '0'),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(itemId);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
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
  const categoryName = category?.name || 'Unknown Category';

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
        <Link
          to={`/app/inventories/${invId}`}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {inventoryName}
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-blue-400">{categoryName}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{categoryName}</h2>
          <p className="text-slate-400">
            {items.length} items in this category
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-cyan-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Item</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {item.min_stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-medium">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    ${item.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {item.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(item.last_updated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-slate-500">
                    No items in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
