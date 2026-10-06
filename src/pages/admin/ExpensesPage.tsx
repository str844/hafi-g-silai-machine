import React, { useState } from 'react';
import { DollarSign, Plus, Search, Calendar, Trash2, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { addExpense, deleteExpense } from '../../firebase/services';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { Expense, ExpenseCategory } from '../../types';

interface ExpensesPageProps {
  expenses: Expense[];
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ expenses }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const categories: ExpenseCategory[] = [
    'Shop',
    'Transport',
    'Electricity',
    'Salary',
    'Repair tools',
    'Miscellaneous',
    'Other',
  ];

  const initialForm = {
    title: '',
    category: 'Shop' as ExpenseCategory,
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash' as Expense['paymentMethod'],
    notes: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount <= 0) {
      showToast('Please enter an expense title and valid amount.', 'error');
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        ...formData,
        amount: Number(formData.amount),
      });
      showToast(`Expense "${formData.title}" of ${formatCurrency(formData.amount)} added.`);
      setIsAddModalOpen(false);
      setFormData(initialForm);
    } catch (err: any) {
      showToast(err?.message || 'Failed to add expense.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setLoading(true);
    try {
      await deleteExpense(expenseToDelete.id);
      showToast(`Expense "${expenseToDelete.title}" deleted.`);
      setExpenseToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete expense.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.notes?.toLowerCase().includes(q);
    }
    return true;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-800 text-white border border-emerald-700'
              : 'bg-red-800 text-white border border-red-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Shop Operating Expenses</h2>
          <p className="text-xs text-gray-500">
            Log electricity, freight, repair tools, rent, and miscellaneous workshop expenses.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialForm);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Summary KPI & Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Total Filtered Expenses</span>
          <span className="text-2xl font-extrabold text-gray-900">
            {formatCurrency(totalFilteredAmount)}
          </span>
          <span className="text-[11px] text-gray-400 block mt-0.5">
            {filteredExpenses.length} entries
          </span>
        </div>

        <div className="sm:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-center space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expense description..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 p-4">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700">No expenses recorded yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Keep track of daily expenditures like shop rent, electric bills, and transport costs.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              Add Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Expense Title</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 text-gray-500">{formatDate(exp.expenseDate)}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">{exp.title}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{exp.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-red-700 text-sm">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-3 text-gray-500 truncate max-w-xs">{exp.notes || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Business Expense"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Expense Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Shop monthly electricity bill or Freight for Singer shipment"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-red-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Expense Date</label>
              <input
                type="date"
                required
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank">Bank</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Paid to electricity department"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!expenseToDelete}
        title="Delete Expense Record?"
        message={`Are you sure you want to delete expense "${expenseToDelete?.title}" of ${formatCurrency(
          expenseToDelete?.amount
        )}?`}
        confirmText="Delete Expense"
        isDestructive={true}
        isLoading={loading}
        onConfirm={handleDeleteExpense}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
