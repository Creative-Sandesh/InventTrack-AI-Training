import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  Wallet,
  FolderOpen,
  Tag,
  Loader2,
} from 'lucide-react';
import { getDashboardStats } from '../api';
import { DashboardStats } from '../types';

export default function Dashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await getDashboardStats();
        setData(stats);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  if (!data) return null;

  const stats = [
    {
      label: 'Total Items',
      value: data.total_items.toString(),
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      label: 'In Stock',
      value: data.in_stock.toString(),
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      shadowColor: 'shadow-emerald-500/20',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Low Stock',
      value: data.low_stock.toString(),
      icon: AlertTriangle,
      color: 'from-amber-500 to-amber-600',
      shadowColor: 'shadow-amber-500/20',
      textColor: 'text-amber-400',
    },
    {
      label: 'Out of Stock',
      value: data.out_of_stock.toString(),
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      shadowColor: 'shadow-red-500/20',
      textColor: 'text-red-400',
    },
    {
      label: 'Total Value',
      value: `$${data.total_value.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      label: 'Total Cost',
      value: `$${data.total_cost.toFixed(2)}`,
      icon: Wallet,
      color: 'from-slate-500 to-slate-600',
      shadowColor: 'shadow-slate-500/20',
    },
    {
      label: 'Inventories',
      value: data.inventory_count.toString(),
      icon: FolderOpen,
      color: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/20',
    },
    {
      label: 'Categories',
      value: data.category_count.toString(),
      icon: Tag,
      color: 'from-cyan-500 to-blue-500',
      shadowColor: 'shadow-cyan-500/20',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to InvenTrack</h2>
        <p className="text-slate-400">Here's an overview of your inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:shadow-xl hover:shadow-slate-800/50 transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadowColor}`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold ${stat.textColor || 'text-white'}`}>
                {stat.value}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
