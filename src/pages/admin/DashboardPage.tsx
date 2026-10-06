import React from 'react';
import {
  Package,
  AlertTriangle,
  Users,
  DollarSign,
  TrendingUp,
  Wrench,
  Receipt,
  Truck,
  ArrowRight,
  PlusCircle,
  Eye,
  Cloud,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type {
  Product,
  Customer,
  Supplier,
  Sale,
  Repair,
  Expense,
  BusinessSettings,
} from '../../types';
import type { AdminSection } from '../../components/layout/AdminLayout';

interface DashboardPageProps {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  repairs: Repair[];
  expenses: Expense[];
  settings: BusinessSettings;
  onNavigateSection: (section: AdminSection) => void;
  onViewSaleInvoice: (sale: Sale) => void;
  onViewRepairDetail: (repair: Repair) => void;
  onOpenNewSale: () => void;
  onOpenNewRepair: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products,
  customers,
  suppliers,
  sales,
  repairs,
  expenses,
  settings,
  onNavigateSection,
  onViewSaleInvoice,
  onViewRepairDetail,
  onOpenNewSale,
  onOpenNewRepair,
}) => {
  const todayDateStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayDateStr.slice(0, 7); // YYYY-MM

  // 1. Total Products
  const totalProductsCount = products.length;

  // 2. Low Stock Products
  const lowStockThreshold = settings.lowStockThreshold || 3;
  const lowStockProducts = products.filter(
    (p) => p.status === 'Active' && p.currentStock <= (p.minStock || lowStockThreshold)
  );

  // 3. Total Customers
  const totalCustomersCount = customers.length;

  // 4. Pending Customer Payments (Udhaari)
  const pendingCustomerPayments = customers.reduce(
    (sum, c) => sum + (c.outstandingBalance || 0),
    0
  );

  // 5. Supplier Outstanding
  const supplierOutstandingTotal = suppliers.reduce(
    (sum, s) => sum + (s.outstandingBalance || 0),
    0
  );

  // 6. Today's Sales
  const todaySales = sales
    .filter((s) => s.status !== 'Cancelled' && (s.saleDate?.startsWith(todayDateStr) || s.createdAt?.startsWith(todayDateStr)))
    .reduce((sum, s) => sum + (s.total || 0), 0);

  // 7. This Month's Sales
  const monthSales = sales
    .filter((s) => s.status !== 'Cancelled' && (s.saleDate?.startsWith(currentMonthStr) || s.createdAt?.startsWith(currentMonthStr)))
    .reduce((sum, s) => sum + (s.total || 0), 0);

  // 8. Today's Expenses
  const todayExpensesTotal = expenses
    .filter((e) => e.expenseDate?.startsWith(todayDateStr) || e.createdAt?.startsWith(todayDateStr))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // 9. Active Repairs (not delivered and not cancelled)
  const activeRepairs = repairs.filter(
    (r) => r.status !== 'Delivered' && r.status !== 'Cancelled'
  );

  // Recent 5 sales
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  // Recent 5 repairs
  const recentRepairs = [...repairs]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold">Good Day, Hafiz G Silai Machine</h2>
          <p className="text-xs text-emerald-200">
            Real-time business status for Bhatti Chowk, Rajnagar
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenNewSale}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Sale / Bill</span>
          </button>
          <button
            onClick={onOpenNewRepair}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-white/20"
          >
            <Wrench className="w-4 h-4" />
            <span>Intake Repair</span>
          </button>
          <button
            onClick={() => onNavigateSection('workspace')}
            className="px-3.5 py-2 bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-500/30"
          >
            <Cloud className="w-4 h-4 text-emerald-300" />
            <span>Drive & Sheets</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Today's Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
            {formatCurrency(todaySales)}
          </div>
          <div className="text-[11px] text-gray-400">
            Month: <span className="font-semibold text-gray-700">{formatCurrency(monthSales)}</span>
          </div>
        </div>

        {/* Customer Udhaari (Pending Payments) */}
        <div
          onClick={() => onNavigateSection('customers')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Customer Udhaari</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-700">
            {formatCurrency(pendingCustomerPayments)}
          </div>
          <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
            <span>View customer balances</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Supplier Outstanding */}
        <div
          onClick={() => onNavigateSection('suppliers')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1 cursor-pointer hover:border-red-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Supplier Outstanding</span>
            <Truck className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-red-700">
            {formatCurrency(supplierOutstandingTotal)}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <span>Shop owes to suppliers</span>
          </div>
        </div>

        {/* Active Repairs */}
        <div
          onClick={() => onNavigateSection('repairs')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1 cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Active Repairs</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-700">
            {activeRepairs.length}
          </div>
          <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
            <span>Machines in service</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Total Products */}
        <div
          onClick={() => onNavigateSection('products')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total Products</span>
            <Package className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {totalProductsCount}
          </div>
          <div className="text-[11px] text-gray-400">Inventory items</div>
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={() => onNavigateSection('products')}
          className={`p-4 rounded-xl border shadow-xs space-y-1 cursor-pointer transition-colors ${
            lowStockProducts.length > 0
              ? 'bg-amber-50/50 border-amber-300 hover:bg-amber-50'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Low Stock Items</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                lowStockProducts.length > 0 ? 'text-amber-600' : 'text-gray-400'
              }`}
            />
          </div>
          <div
            className={`text-xl sm:text-2xl font-extrabold ${
              lowStockProducts.length > 0 ? 'text-amber-800' : 'text-gray-900'
            }`}
          >
            {lowStockProducts.length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            {lowStockProducts.length > 0 ? 'Reorder needed' : 'All stocks healthy'}
          </div>
        </div>

        {/* Total Customers */}
        <div
          onClick={() => onNavigateSection('customers')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1 cursor-pointer hover:border-gray-300"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {totalCustomersCount}
          </div>
          <div className="text-[11px] text-gray-400">Registered profiles</div>
        </div>

        {/* Today's Expenses */}
        <div
          onClick={() => onNavigateSection('expenses')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1 cursor-pointer hover:border-gray-300"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Today's Expenses</span>
            <DollarSign className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {formatCurrency(todayExpensesTotal)}
          </div>
          <div className="text-[11px] text-gray-400">Shop operational costs</div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Stock Alert ({lowStockProducts.length} items need replenishment)</span>
            </div>
            <button
              onClick={() => onNavigateSection('products')}
              className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
            >
              View Products & Stock →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {lowStockProducts.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-white p-2.5 rounded-lg border border-amber-200 text-xs flex justify-between items-center"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-gray-800 block truncate">{item.name}</span>
                  <span className="text-gray-400 text-[10px]">{item.brand}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">
                    {item.currentStock} {item.unit} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Columns: Recent Sales and Recent Repairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">Recent Sales</h3>
            </div>
            <button
              onClick={() => onNavigateSection('sales')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              View All Sales →
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentSales.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                No sales recorded yet. Click "New Sale" to create the first invoice.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right">Udhaari</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-emerald-800">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-900 truncate max-w-[120px]">
                        {sale.customerName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {sale.remainingAmount > 0 ? (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                            {formatCurrency(sale.remainingAmount)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Paid</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onViewSaleInvoice(sale)}
                          className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Repairs Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">Recent Machine Repairs</h3>
            </div>
            <button
              onClick={() => onNavigateSection('repairs')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
            >
              View All Repairs →
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentRepairs.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                No repair records yet. Click "Intake Repair" when a customer brings a machine.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-4">Repair ID</th>
                    <th className="py-2.5 px-3">Customer / Machine</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Est. Cost</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {recentRepairs.map((rep) => (
                    <tr key={rep.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-blue-800">
                        {rep.repairId}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-gray-900 block truncate max-w-[130px]">
                          {rep.customerName}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {rep.brand} {rep.machineType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            rep.status === 'Ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rep.status === 'Delivered'
                              ? 'bg-gray-100 text-gray-700'
                              : rep.status === 'Repairing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                        {formatCurrency(rep.estimatedCost)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onViewRepairDetail(rep)}
                          className="p-1 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                          title="Manage Repair"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
