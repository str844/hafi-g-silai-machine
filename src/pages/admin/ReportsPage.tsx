import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Truck,
  Package,
  Wrench,
  Download,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { formatCurrency, formatDate, getWhatsAppUrl } from '../../utils/formatters';
import type {
  Sale,
  Purchase,
  Expense,
  Customer,
  Supplier,
  Product,
  Repair,
  BusinessSettings,
} from '../../types';

interface ReportsPageProps {
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  repairs: Repair[];
  settings: BusinessSettings;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  sales,
  purchases,
  expenses,
  customers,
  suppliers,
  products,
  repairs,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<
    'sales' | 'purchases' | 'expenses' | 'customers' | 'suppliers' | 'stock' | 'repairs'
  >('sales');

  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.slice(0, 7);

  // Sales aggregates
  const validSales = sales.filter((s) => s.status !== 'Cancelled');
  const totalSalesRevenue = validSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalSalesCollected = validSales.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalSalesUdhaari = validSales.reduce((sum, s) => sum + (s.remainingAmount || 0), 0);

  const todaySalesTotal = validSales
    .filter((s) => s.saleDate?.startsWith(todayStr) || s.createdAt?.startsWith(todayStr))
    .reduce((sum, s) => sum + (s.total || 0), 0);

  const monthSalesTotal = validSales
    .filter((s) => s.saleDate?.startsWith(thisMonthStr) || s.createdAt?.startsWith(thisMonthStr))
    .reduce((sum, s) => sum + (s.total || 0), 0);

  // Purchases aggregates
  const totalPurchasesCost = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalPurchasesPaid = purchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const totalPurchasesPending = purchases.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);

  // Expenses aggregates
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
  });

  // Customer Udhaari
  const customersWithDues = customers
    .filter((c) => (c.outstandingBalance || 0) > 0)
    .sort((a, b) => (b.outstandingBalance || 0) - (a.outstandingBalance || 0));
  const totalCustomerUdhaari = customersWithDues.reduce(
    (sum, c) => sum + (c.outstandingBalance || 0),
    0
  );

  // Supplier Dues
  const suppliersWithDues = suppliers
    .filter((s) => (s.outstandingBalance || 0) > 0)
    .sort((a, b) => (b.outstandingBalance || 0) - (a.outstandingBalance || 0));
  const totalSupplierDue = suppliersWithDues.reduce(
    (sum, s) => sum + (s.outstandingBalance || 0),
    0
  );

  // Stock Report
  const totalStockItemsCount = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);
  const totalStockPurchaseValuation = products.reduce(
    (sum, p) => sum + (p.currentStock || 0) * (p.purchasePrice || 0),
    0
  );
  const totalStockSalesValuation = products.reduce(
    (sum, p) => sum + (p.currentStock || 0) * (p.sellingPrice || 0),
    0
  );
  const lowStockItems = products.filter(
    (p) => p.status === 'Active' && p.currentStock <= p.minStock
  );

  // Repairs Report
  const activeRepairsCount = repairs.filter(
    (r) => r.status !== 'Delivered' && r.status !== 'Cancelled'
  ).length;
  const completedRepairsCount = repairs.filter((r) => r.status === 'Delivered').length;
  const pendingRepairDues = repairs.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);

  const tabs = [
    { id: 'sales', label: 'Sales Report', icon: TrendingUp },
    { id: 'purchases', label: 'Purchases Report', icon: ShoppingBag },
    { id: 'expenses', label: 'Expenses Report', icon: DollarSign },
    { id: 'customers', label: 'Customer Udhaari', icon: Users },
    { id: 'suppliers', label: 'Supplier Dues', icon: Truck },
    { id: 'stock', label: 'Stock Valuation', icon: Package },
    { id: 'repairs', label: 'Repairs Report', icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Business Reports & Ledgers</h2>
          <p className="text-xs text-gray-500">
            Real-time analytics for sales, inward purchases, expenditures, customer credit, and
            stock value.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Print / Export Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Sales Report */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Today's Sales</span>
              <span className="text-xl font-extrabold text-emerald-800">
                {formatCurrency(todaySalesTotal)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">This Month's Sales</span>
              <span className="text-xl font-extrabold text-emerald-800">
                {formatCurrency(monthSalesTotal)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Total Sales Revenue</span>
              <span className="text-xl font-extrabold text-gray-900">
                {formatCurrency(totalSalesRevenue)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Total Unpaid (Udhaari)</span>
              <span className="text-xl font-extrabold text-amber-800">
                {formatCurrency(totalSalesUdhaari)}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">All Completed Invoices Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Invoice #</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Mode</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                    <th className="p-2.5 text-right">Total</th>
                    <th className="p-2.5 text-right">Paid</th>
                    <th className="p-2.5 text-right">Due (Udhaari)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {validSales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-400">
                        No sales data available.
                      </td>
                    </tr>
                  ) : (
                    validSales.map((s) => (
                      <tr key={s.id}>
                        <td className="p-2.5 text-gray-500">{formatDate(s.saleDate)}</td>
                        <td className="p-2.5 font-mono font-medium">{s.invoiceNumber}</td>
                        <td className="p-2.5 font-medium">{s.customerName}</td>
                        <td className="p-2.5">{s.paymentMethod}</td>
                        <td className="p-2.5 text-right">{formatCurrency(s.subtotal)}</td>
                        <td className="p-2.5 text-right font-bold">{formatCurrency(s.total)}</td>
                        <td className="p-2.5 text-right text-emerald-700 font-semibold">
                          {formatCurrency(s.paidAmount)}
                        </td>
                        <td className="p-2.5 text-right text-amber-800 font-bold">
                          {formatCurrency(s.remainingAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Purchases Report */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Total Purchases</span>
              <span className="text-xl font-extrabold text-gray-900">
                {formatCurrency(totalPurchasesCost)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Amount Paid to Suppliers</span>
              <span className="text-xl font-extrabold text-emerald-800">
                {formatCurrency(totalPurchasesPaid)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Supplier Outstanding Owed</span>
              <span className="text-xl font-extrabold text-red-700">
                {formatCurrency(totalPurchasesPending)}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">Purchase Inward History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Purchase #</th>
                    <th className="p-2.5">Supplier</th>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Total</th>
                    <th className="p-2.5 text-right">Paid</th>
                    <th className="p-2.5 text-right">Remaining Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-400">
                        No purchase records available.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2.5 text-gray-500">{formatDate(p.purchaseDate)}</td>
                        <td className="p-2.5 font-mono">{p.purchaseNumber}</td>
                        <td className="p-2.5 font-semibold text-gray-800">{p.supplierName}</td>
                        <td className="p-2.5">{p.productName}</td>
                        <td className="p-2.5 text-center font-bold">+{p.quantity}</td>
                        <td className="p-2.5 text-right font-bold">{formatCurrency(p.totalAmount)}</td>
                        <td className="p-2.5 text-right text-emerald-700">{formatCurrency(p.paidAmount)}</td>
                        <td className="p-2.5 text-right text-red-700 font-bold">
                          {formatCurrency(p.remainingAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Expenses Report */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <span className="text-xs text-gray-500 block">Total Expenses Incurred</span>
            <span className="text-2xl font-extrabold text-red-700">
              {formatCurrency(totalExpensesAmount)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Expenses by Category</h3>
              <div className="divide-y divide-gray-100">
                {Object.entries(expenseByCategory).length === 0 ? (
                  <p className="text-gray-400 text-xs py-3 text-center">No expenses recorded yet.</p>
                ) : (
                  Object.entries(expenseByCategory).map(([cat, amt]) => {
                    const pct = totalExpensesAmount > 0 ? Math.round((amt / totalExpensesAmount) * 100) : 0;
                    return (
                      <div key={cat} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-gray-800">{cat}</span>
                          <span className="text-[10px] text-gray-400 block">{pct}% of total</span>
                        </div>
                        <span className="font-bold text-gray-900">{formatCurrency(amt)}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Expense Log */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Expense Transactions</h3>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {expenses.map((e) => (
                  <div key={e.id} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{e.title}</span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(e.expenseDate)} • {e.category} ({e.paymentMethod})
                      </span>
                    </div>
                    <span className="font-bold text-red-700">{formatCurrency(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Customer Outstanding (Udhaari) */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">
                Total Market Credit / Udhaari Owed to Shop
              </span>
              <span className="text-2xl font-extrabold text-amber-900">
                {formatCurrency(totalCustomerUdhaari)}
              </span>
              <p className="text-xs text-amber-700 mt-1">
                {customersWithDues.length} customers have outstanding balances.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Address</th>
                  <th className="p-3 text-right">Total Purchases</th>
                  <th className="p-3 text-right">Total Paid</th>
                  <th className="p-3 text-right">Pending Udhaari</th>
                  <th className="p-3 text-center">Reminder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customersWithDues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-400">
                      Great news! There is no pending customer udhaari on record.
                    </td>
                  </tr>
                ) : (
                  customersWithDues.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{c.name}</td>
                      <td className="p-3 text-gray-600">{c.phone}</td>
                      <td className="p-3 text-gray-500 truncate max-w-xs">{c.address || '-'}</td>
                      <td className="p-3 text-right">{formatCurrency(c.totalPurchases || 0)}</td>
                      <td className="p-3 text-right text-emerald-700">{formatCurrency(c.totalPaid || 0)}</td>
                      <td className="p-3 text-right font-extrabold text-amber-900 text-sm">
                        {formatCurrency(c.outstandingBalance)}
                      </td>
                      <td className="p-3 text-center">
                        <a
                          href={getWhatsAppUrl(
                            c.phone,
                            `Hello ${c.name}, gentle reminder from Hafiz G Silai Machine, Rajnagar. Your current pending bill balance is ${formatCurrency(
                              c.outstandingBalance
                            )}. Thank you!`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-md text-[11px] font-semibold transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 fill-current" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Supplier Outstanding */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="bg-red-50 p-5 rounded-xl border border-red-200">
            <span className="text-xs text-red-800 font-bold uppercase tracking-wider block">
              Total Amount Shop Owes to Suppliers
            </span>
            <span className="text-2xl font-extrabold text-red-900">
              {formatCurrency(totalSupplierDue)}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Address</th>
                  <th className="p-3 text-right">Total Purchases</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Shop Owes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliersWithDues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400">
                      All supplier accounts are cleared!
                    </td>
                  </tr>
                ) : (
                  suppliersWithDues.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3 font-bold text-gray-900">{s.name}</td>
                      <td className="p-3 text-gray-600">{s.phone}</td>
                      <td className="p-3 text-gray-500">{s.address || '-'}</td>
                      <td className="p-3 text-right">{formatCurrency(s.totalPurchases || 0)}</td>
                      <td className="p-3 text-right text-emerald-700">{formatCurrency(s.totalPaid || 0)}</td>
                      <td className="p-3 text-right font-extrabold text-red-700 text-sm">
                        {formatCurrency(s.outstandingBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Stock Report & Valuation */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Total Units in Stock</span>
              <span className="text-2xl font-extrabold text-gray-900">{totalStockItemsCount}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Inventory Purchase Cost</span>
              <span className="text-xl font-extrabold text-blue-900">
                {formatCurrency(totalStockPurchaseValuation)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Inventory Retail Sales Value</span>
              <span className="text-xl font-extrabold text-emerald-800">
                {formatCurrency(totalStockSalesValuation)}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">Inventory Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Product Name</th>
                    <th className="p-2.5">Brand</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-center">Stock</th>
                    <th className="p-2.5 text-right">Cost Price</th>
                    <th className="p-2.5 text-right">Selling Price</th>
                    <th className="p-2.5 text-right">Stock Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const valuation = (p.currentStock || 0) * (p.sellingPrice || 0);
                    return (
                      <tr key={p.id}>
                        <td className="p-2.5 font-bold text-gray-900">{p.name}</td>
                        <td className="p-2.5">{p.brand}</td>
                        <td className="p-2.5">{p.category}</td>
                        <td className="p-2.5 text-center font-extrabold">
                          {p.currentStock} {p.unit}
                        </td>
                        <td className="p-2.5 text-right">{formatCurrency(p.purchasePrice)}</td>
                        <td className="p-2.5 text-right text-emerald-800">{formatCurrency(p.sellingPrice)}</td>
                        <td className="p-2.5 text-right font-bold text-gray-900">
                          {formatCurrency(valuation)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Repairs Report */}
      {activeTab === 'repairs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Active Workshop Repairs</span>
              <span className="text-2xl font-extrabold text-blue-700">{activeRepairsCount}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Delivered Repairs</span>
              <span className="text-2xl font-extrabold text-emerald-700">
                {completedRepairsCount}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Pending Repair Payments</span>
              <span className="text-2xl font-extrabold text-red-700">
                {formatCurrency(pendingRepairDues)}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">All Machine Repairs Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Repair ID</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Machine</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Est. Cost</th>
                    <th className="p-2.5 text-right">Advance</th>
                    <th className="p-2.5 text-right">Pending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {repairs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-400">
                        No repair records found.
                      </td>
                    </tr>
                  ) : (
                    repairs.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2.5 font-mono font-bold text-blue-900">{r.repairId}</td>
                        <td className="p-2.5 font-medium">{r.customerName}</td>
                        <td className="p-2.5">
                          {r.brand} {r.machineType}
                        </td>
                        <td className="p-2.5 font-semibold">{r.status}</td>
                        <td className="p-2.5 text-right font-medium">{formatCurrency(r.estimatedCost)}</td>
                        <td className="p-2.5 text-right text-emerald-700">{formatCurrency(r.advancePayment)}</td>
                        <td className="p-2.5 text-right font-bold text-red-700">
                          {formatCurrency(r.remainingAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
