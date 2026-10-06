import React, { useState } from 'react';
import { Truck, Plus, Search, Phone, MapPin, DollarSign, CheckCircle2, AlertTriangle, Eye, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  addSupplier,
  updateSupplier,
  deleteSupplier,
  recordSupplierPayment,
} from '../../firebase/services';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { Supplier, SupplierPayment, Purchase } from '../../types';

interface SuppliersPageProps {
  suppliers: Supplier[];
  supplierPayments: SupplierPayment[];
  purchases: Purchase[];
}

export const SuppliersPage: React.FC<SuppliersPageProps> = ({
  suppliers,
  supplierPayments,
  purchases,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<Supplier | null>(null);
  const [supplierToView, setSupplierToView] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash' as SupplierPayment['paymentMethod'],
    notes: '',
  });

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setSupplierForm({ name: '', phone: '', address: '', notes: '' });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierForm({
      name: sup.name,
      phone: sup.phone,
      address: sup.address || '',
      notes: sup.notes || '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim() || !supplierForm.phone.trim()) {
      showToast('Please provide supplier name and phone number.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierForm);
        showToast(`Supplier "${supplierForm.name}" updated.`);
      } else {
        await addSupplier(supplierForm);
        showToast(`Supplier "${supplierForm.name}" added successfully.`);
      }
      setIsAddEditModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save supplier.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    setLoading(true);
    try {
      await deleteSupplier(supplierToDelete.id);
      showToast(`Supplier "${supplierToDelete.name}" deleted.`);
      setSupplierToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete supplier.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPaymentModalOpen || paymentForm.amount <= 0) {
      showToast('Please enter a valid payment amount.', 'error');
      return;
    }

    setLoading(true);
    try {
      await recordSupplierPayment(
        isPaymentModalOpen.id,
        isPaymentModalOpen.name,
        Number(paymentForm.amount),
        paymentForm.paymentDate,
        paymentForm.paymentMethod,
        paymentForm.notes
      );
      showToast(`Payment of ${formatCurrency(paymentForm.amount)} recorded for ${isPaymentModalOpen.name}.`);
      setIsPaymentModalOpen(null);
      setPaymentForm({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        notes: '',
      });
    } catch (err: any) {
      showToast(err?.message || 'Failed to record supplier payment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.address?.toLowerCase().includes(q);
  });

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
          <h2 className="text-lg font-bold text-gray-900">Supplier Directory & Ledger</h2>
          <p className="text-xs text-gray-500">
            Track machine wholesalers, parts distributors, purchase history, and outstanding dues.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers by name, phone or location..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-gray-500 shrink-0">
          Total Suppliers: <strong className="text-gray-800">{suppliers.length}</strong>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 p-4">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700">No suppliers found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Add your machine agencies and spare part vendors to record purchases and track payments.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              Add First Supplier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-3">Phone & Address</th>
                  <th className="py-3 px-3 text-right">Total Purchases</th>
                  <th className="py-3 px-3 text-right">Total Paid</th>
                  <th className="py-3 px-3 text-right">Outstanding Due</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{sup.name}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{sup.phone}</span>
                      </div>
                      {sup.address && (
                        <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                          {sup.address}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-700">
                      {formatCurrency(sup.totalPurchases || 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-700">
                      {formatCurrency(sup.totalPaid || 0)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {sup.outstandingBalance > 0 ? (
                        <span className="font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                          {formatCurrency(sup.outstandingBalance)}
                        </span>
                      ) : (
                        <span className="text-gray-400">₹0 (Clear)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setIsPaymentModalOpen(sup);
                            setPaymentForm({
                              amount: sup.outstandingBalance > 0 ? sup.outstandingBalance : 0,
                              paymentDate: new Date().toISOString().split('T')[0],
                              paymentMethod: 'Cash',
                              notes: '',
                            });
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay</span>
                        </button>
                        <button
                          onClick={() => setSupplierToView(sup)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                          title="View Ledger"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(sup)}
                          className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded cursor-pointer"
                          title="Edit"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Add New Supplier'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Supplier / Agency Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={supplierForm.name}
              onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
              placeholder="e.g. Madhubani Sewing Agencies or Patna Machinery Depot"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={supplierForm.phone}
              onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Office / Warehouse Address</label>
            <textarea
              rows={2}
              value={supplierForm.address}
              onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
              placeholder="City, State, market address..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Notes / Terms</label>
            <input
              type="text"
              value={supplierForm.notes}
              onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
              placeholder="Payment terms, bank details, contact person..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment to Supplier Modal */}
      <Modal
        isOpen={!!isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(null)}
        title={`Record Payment to Supplier: ${isPaymentModalOpen?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
            <div>
              <span className="text-gray-500 block">Current Outstanding Balance:</span>
              <span className="text-base font-extrabold text-red-700">
                {formatCurrency(isPaymentModalOpen?.outstandingBalance || 0)}
              </span>
            </div>
          </div>

          {paymentForm.amount > (isPaymentModalOpen?.outstandingBalance || 0) && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Notice: The payment amount is greater than the recorded outstanding balance.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Amount Paid (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  paymentMethod: e.target.value as SupplierPayment['paymentMethod'],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI (PhonePe, GPay, Paytm)</option>
              <option value="Bank">Bank Transfer / NEFT</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Notes / Transaction Reference</label>
            <input
              type="text"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              placeholder="e.g. UTR #, Cheque #, Cash voucher"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Supplier Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Profile / Ledger Modal */}
      {supplierToView && (
        <Modal
          isOpen={!!supplierToView}
          onClose={() => setSupplierToView(null)}
          title={`Supplier Ledger: ${supplierToView.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Quick KPI stats */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500 block">Total Purchases:</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(supplierToView.totalPurchases || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Total Paid:</span>
                <span className="text-sm font-bold text-emerald-700">
                  {formatCurrency(supplierToView.totalPaid || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Outstanding Due:</span>
                <span className="text-sm font-extrabold text-red-700">
                  {formatCurrency(supplierToView.outstandingBalance || 0)}
                </span>
              </div>
            </div>

            {/* Purchases History */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-800">Recent Purchases from this Supplier</h4>
              {purchases.filter((p) => p.supplierId === supplierToView.id).length === 0 ? (
                <p className="text-gray-400 py-3 text-center border rounded-lg">
                  No purchases recorded yet.
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Purchase #</th>
                        <th className="p-2">Product</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-right">Paid</th>
                        <th className="p-2 text-right">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {purchases
                        .filter((p) => p.supplierId === supplierToView.id)
                        .map((p) => (
                          <tr key={p.id}>
                            <td className="p-2 text-gray-500">{formatDate(p.purchaseDate)}</td>
                            <td className="p-2 font-mono">{p.purchaseNumber}</td>
                            <td className="p-2 truncate max-w-[140px]">{p.productName}</td>
                            <td className="p-2 text-right font-medium">{formatCurrency(p.totalAmount)}</td>
                            <td className="p-2 text-right text-emerald-700">{formatCurrency(p.paidAmount)}</td>
                            <td className="p-2 text-right text-red-700 font-bold">{formatCurrency(p.remainingAmount)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-800">Payment History</h4>
              {supplierPayments.filter((p) => p.supplierId === supplierToView.id).length === 0 ? (
                <p className="text-gray-400 py-3 text-center border rounded-lg">
                  No payment vouchers logged yet.
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                      <tr>
                        <th className="p-2">Payment Date</th>
                        <th className="p-2">Method</th>
                        <th className="p-2">Notes</th>
                        <th className="p-2 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {supplierPayments
                        .filter((p) => p.supplierId === supplierToView.id)
                        .map((pay) => (
                          <tr key={pay.id}>
                            <td className="p-2 text-gray-500">{formatDate(pay.paymentDate)}</td>
                            <td className="p-2 font-semibold text-gray-800">{pay.paymentMethod}</td>
                            <td className="p-2 text-gray-600 truncate max-w-[150px]">{pay.notes || '-'}</td>
                            <td className="p-2 text-right font-bold text-emerald-800">
                              {formatCurrency(pay.amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!supplierToDelete}
        title="Delete Supplier Record?"
        message={`Are you sure you want to delete supplier "${supplierToDelete?.name}"?`}
        confirmText="Delete Supplier"
        isDestructive={true}
        isLoading={loading}
        onConfirm={handleDeleteSupplier}
        onCancel={() => setSupplierToDelete(null)}
      />
    </div>
  );
};
