import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Calendar, CheckCircle2, AlertTriangle, Eye, Truck } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { createPurchase } from '../../firebase/services';
import { Modal } from '../../components/common/Modal';
import type { Purchase, Supplier, Product } from '../../types';

interface PurchasesPageProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  products: Product[];
  onOpenNewSupplier: () => void;
}

export const PurchasesPage: React.FC<PurchasesPageProps> = ({
  purchases,
  suppliers,
  products,
  onOpenNewSupplier,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const initialForm = {
    purchaseNumber: `PUR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
    supplierId: suppliers[0]?.id || '',
    purchaseDate: new Date().toISOString().split('T')[0],
    productId: products[0]?.id || '',
    quantity: 1,
    purchasePrice: products[0]?.purchasePrice || 0,
    paidAmount: 0,
    notes: '',
  };

  const [formData, setFormData] = useState(initialForm);

  // Auto-fill purchase price when product changes
  const handleProductChange = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    setFormData((prev) => ({
      ...prev,
      productId: prodId,
      purchasePrice: prod?.purchasePrice || prev.purchasePrice,
    }));
  };

  const totalAmount = Math.max(0, formData.quantity * formData.purchasePrice);
  const remainingAmount = Math.max(0, totalAmount - formData.paidAmount);
  const paymentStatus: 'Paid' | 'Partial' | 'Unpaid' =
    remainingAmount === 0 ? 'Paid' : formData.paidAmount > 0 ? 'Partial' : 'Unpaid';

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) {
      showToast('Please select a supplier.', 'error');
      return;
    }
    if (!formData.productId) {
      showToast('Please select a product.', 'error');
      return;
    }
    if (formData.quantity <= 0 || formData.purchasePrice <= 0) {
      showToast('Quantity and purchase price must be greater than zero.', 'error');
      return;
    }

    const sup = suppliers.find((s) => s.id === formData.supplierId);
    const prod = products.find((p) => p.id === formData.productId);

    setLoading(true);
    try {
      await createPurchase({
        purchaseNumber: formData.purchaseNumber,
        supplierId: formData.supplierId,
        supplierName: sup?.name || 'Unknown Supplier',
        purchaseDate: formData.purchaseDate,
        productId: formData.productId,
        productName: prod?.name || 'Unknown Product',
        quantity: Number(formData.quantity),
        purchasePrice: Number(formData.purchasePrice),
        totalAmount,
        paidAmount: Number(formData.paidAmount),
        remainingAmount,
        paymentStatus,
        notes: formData.notes,
      });

      showToast(`Purchase #${formData.purchaseNumber} recorded. Stock increased.`);
      setIsAddModalOpen(false);
      setFormData({
        ...initialForm,
        purchaseNumber: `PUR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      });
    } catch (err: any) {
      showToast(err?.message || 'Failed to record purchase.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.purchaseNumber?.toLowerCase().includes(q) ||
      p.supplierName?.toLowerCase().includes(q) ||
      p.productName?.toLowerCase().includes(q)
    );
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
          <h2 className="text-lg font-bold text-gray-900">Purchases & Inward Stock</h2>
          <p className="text-xs text-gray-500">
            Record supplier orders. Items automatically increment inventory stock.
          </p>
        </div>

        <button
          onClick={() => {
            if (suppliers.length === 0) {
              showToast('Please add at least one supplier first.', 'error');
              onOpenNewSupplier();
              return;
            }
            if (products.length === 0) {
              showToast('Please add at least one product first.', 'error');
              return;
            }
            setFormData({
              ...initialForm,
              supplierId: suppliers[0]?.id || '',
              productId: products[0]?.id || '',
              purchasePrice: products[0]?.purchasePrice || 0,
            });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Purchase</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by purchase #, supplier name or product..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-gray-500 shrink-0">
          Total: <strong className="text-gray-800">{purchases.length}</strong> purchases
        </div>
      </div>

      {/* Purchases List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-16 p-4">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700">No purchases recorded yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              When you buy machines, motors, or spare parts from wholesalers, record them here to
              keep stock and supplier accounts accurate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Purchase #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Product Received</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Balance</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {pur.purchaseNumber}
                    </td>
                    <td className="py-3 px-3 text-gray-500">{formatDate(pur.purchaseDate)}</td>
                    <td className="py-3 px-3 font-semibold text-gray-800">{pur.supplierName}</td>
                    <td className="py-3 px-3 font-medium text-gray-900 truncate max-w-xs">
                      {pur.productName}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-800">
                      +{pur.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">
                      {formatCurrency(pur.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-medium">
                      {formatCurrency(pur.paidAmount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {pur.remainingAmount > 0 ? (
                        <span className="text-red-700 font-bold">
                          {formatCurrency(pur.remainingAmount)}
                        </span>
                      ) : (
                        <span className="text-gray-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pur.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pur.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {pur.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedPurchase(pur)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Purchase Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Inward Inventory Purchase"
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePurchase} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Purchase / Bill #</label>
              <input
                type="text"
                required
                value={formData.purchaseNumber}
                onChange={(e) => setFormData({ ...formData, purchaseNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Purchase Date</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-gray-700">
                Supplier <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={onOpenNewSupplier}
                className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                + New Supplier
              </button>
            </div>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.phone}) - Outstanding: {formatCurrency(s.outstandingBalance)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Select Product <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.brand}] (Current Stock: {p.currentStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Quantity Received <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Purchase Price per Unit (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Automatic calculations display */}
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 grid grid-cols-3 gap-2">
            <div>
              <span className="text-gray-500 block">Total Amount:</span>
              <span className="text-sm font-extrabold text-gray-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Payment Status:</span>
              <span className="font-bold text-emerald-800">{paymentStatus}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Remaining Balance:</span>
              <span className="text-sm font-bold text-red-700">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Immediate Amount Paid to Supplier (₹)
            </label>
            <input
              type="number"
              min="0"
              max={totalAmount}
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Leave 0 if full udhaari. If remaining &gt; 0, it will be added to supplier's
              outstanding balance.
            </p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Notes / Bill Reference</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Supplier invoice reference, transport details..."
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Confirm & Increment Stock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Purchase Details Modal */}
      {selectedPurchase && (
        <Modal
          isOpen={!!selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
          title={`Purchase Order: ${selectedPurchase.purchaseNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 block">Supplier</span>
                <span className="font-bold text-gray-900">{selectedPurchase.supplierName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Purchase Date</span>
                <span className="font-semibold text-gray-900">{formatDate(selectedPurchase.purchaseDate)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block">Product</span>
                <span className="font-bold text-emerald-900">{selectedPurchase.productName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 bg-white border border-gray-200 rounded-xl">
              <div>
                <span className="text-gray-500 block">Quantity</span>
                <span className="font-extrabold text-sm">{selectedPurchase.quantity}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Unit Cost</span>
                <span className="font-bold">{formatCurrency(selectedPurchase.purchasePrice)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Total</span>
                <span className="font-extrabold text-sm text-gray-900">
                  {formatCurrency(selectedPurchase.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Paid</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(selectedPurchase.paidAmount)}
                </span>
              </div>
            </div>

            {selectedPurchase.remainingAmount > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex justify-between items-center text-red-900">
                <span className="font-medium">Remaining Outstanding Owed:</span>
                <span className="font-extrabold text-base">
                  {formatCurrency(selectedPurchase.remainingAmount)}
                </span>
              </div>
            )}

            {selectedPurchase.notes && (
              <div>
                <span className="text-gray-500 block">Notes:</span>
                <p className="text-gray-700 mt-0.5">{selectedPurchase.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
