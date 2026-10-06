import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  MessageCircle,
  CreditCard,
  History,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  Wrench,
} from 'lucide-react';
import { formatCurrency, formatDate, getWhatsAppUrl } from '../../utils/formatters';
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  recordCustomerPayment,
} from '../../firebase/services';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { Customer, CustomerPayment, Sale, Repair, BusinessSettings } from '../../types';

interface CustomersPageProps {
  customers: Customer[];
  customerPayments: CustomerPayment[];
  sales: Sale[];
  repairs: Repair[];
  settings: BusinessSettings;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers,
  customerPayments,
  sales,
  repairs,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<Customer | null>(null);
  const [paymentType, setPaymentType] = useState<'Udhaari Payment' | 'Advance'>('Udhaari Payment');
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Customer Form
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash' as CustomerPayment['paymentMethod'],
    purpose: '',
    notes: '',
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setCustomerForm({ name: '', phone: '', address: '', notes: '' });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      phone: c.phone,
      address: c.address || '',
      notes: c.notes || '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      showToast('Please enter customer name and phone number.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerForm);
        showToast(`Customer "${customerForm.name}" updated.`);
      } else {
        await addCustomer(customerForm);
        showToast(`Customer "${customerForm.name}" registered successfully.`);
      }
      setIsAddEditModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save customer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setLoading(true);
    try {
      await deleteCustomer(customerToDelete.id);
      showToast(`Customer "${customerToDelete.name}" removed.`);
      setCustomerToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete customer.', 'error');
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
      await recordCustomerPayment(
        isPaymentModalOpen.id,
        isPaymentModalOpen.name,
        paymentType,
        Number(paymentForm.amount),
        paymentForm.paymentDate,
        paymentForm.paymentMethod,
        paymentForm.notes,
        paymentForm.purpose
      );

      showToast(
        `${paymentType === 'Advance' ? 'Advance deposit' : 'Udhaari payment'} of ${formatCurrency(
          paymentForm.amount
        )} recorded for ${isPaymentModalOpen.name}.`
      );
      setIsPaymentModalOpen(null);
      setPaymentForm({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        purpose: '',
        notes: '',
      });
    } catch (err: any) {
      showToast(err?.message || 'Failed to process payment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address?.toLowerCase().includes(q);
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
          <h2 className="text-lg font-bold text-gray-900">Customer Profiles & Udhaari Ledger</h2>
          <p className="text-xs text-gray-500">
            Track customer balances, credit (udhaari), advance deposits, and purchase history.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
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
            placeholder="Search customers by name, phone or village/area..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-gray-500 shrink-0">
          Total Customers: <strong className="text-gray-800">{customers.length}</strong>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 p-4">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700">No customers found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Register regular tailors and retail buyers to maintain ledgers and send WhatsApp balance
              reminders.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              Add First Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Phone & Address</th>
                  <th className="py-3 px-3 text-right">Total Purchases</th>
                  <th className="py-3 px-3 text-right">Pending Udhaari</th>
                  <th className="py-3 px-3 text-right">Advance Balance</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{c.name}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{c.phone}</span>
                      </div>
                      {c.address && (
                        <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                          {c.address}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-700">
                      {formatCurrency(c.totalPurchases || 0)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {c.outstandingBalance > 0 ? (
                        <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {formatCurrency(c.outstandingBalance)}
                        </span>
                      ) : (
                        <span className="text-gray-400">₹0 (Clear)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {c.advanceBalance > 0 ? (
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {formatCurrency(c.advanceBalance)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Record Payment Button */}
                        <button
                          onClick={() => {
                            setIsPaymentModalOpen(c);
                            setPaymentType('Udhaari Payment');
                            setPaymentForm({
                              amount: c.outstandingBalance > 0 ? c.outstandingBalance : 0,
                              paymentDate: new Date().toISOString().split('T')[0],
                              paymentMethod: 'Cash',
                              purpose: '',
                              notes: '',
                            });
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Record Udhaari Payment"
                        >
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Pay Udhaari</span>
                        </button>

                        {/* Record Advance Button */}
                        <button
                          onClick={() => {
                            setIsPaymentModalOpen(c);
                            setPaymentType('Advance');
                            setPaymentForm({
                              amount: 0,
                              paymentDate: new Date().toISOString().split('T')[0],
                              paymentMethod: 'Cash',
                              purpose: 'Advance for sewing machine',
                              notes: '',
                            });
                          }}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Record Advance Deposit"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Advance</span>
                        </button>

                        {/* WhatsApp Balance Reminder */}
                        {c.outstandingBalance > 0 && (
                          <a
                            href={getWhatsAppUrl(
                              c.phone,
                              `Hello ${c.name}, this is a gentle reminder from Hafiz G Silai Machine, Rajnagar. You have a pending balance of ${formatCurrency(
                                c.outstandingBalance
                              )}. Kindly clear it when convenient. Thank you!`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Send WhatsApp Balance Reminder"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          </a>
                        )}

                        <button
                          onClick={() => setCustomerToView(c)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                          title="View Full Ledger"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(c)}
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

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Register New Customer'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Customer Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customerForm.name}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              placeholder="e.g. Master Abdul or Sunita Devi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Mobile Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={customerForm.phone}
              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Village / Ward / Address</label>
            <textarea
              rows={2}
              value={customerForm.address}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
              placeholder="e.g. Ward 4, Rajnagar or Madhubani market"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={customerForm.notes}
              onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
              placeholder="Boutique owner, tailor, family friend..."
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
              {loading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment or Advance Modal */}
      <Modal
        isOpen={!!isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(null)}
        title={
          paymentType === 'Advance'
            ? `Record Advance Payment from: ${isPaymentModalOpen?.name}`
            : `Record Udhaari Payment from: ${isPaymentModalOpen?.name}`
        }
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          {/* Toggle Type */}
          <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPaymentType('Udhaari Payment')}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                paymentType === 'Udhaari Payment'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Udhaari (Clear Due)
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('Advance')}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                paymentType === 'Advance'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Advance Deposit
            </button>
          </div>

          {paymentType === 'Udhaari Payment' && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-amber-900">
              <span>Current Outstanding Due:</span>
              <span className="font-extrabold text-base">
                {formatCurrency(isPaymentModalOpen?.outstandingBalance || 0)}
              </span>
            </div>
          )}

          {paymentType === 'Advance' && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center text-blue-900">
              <span>Existing Advance Balance:</span>
              <span className="font-extrabold text-base">
                {formatCurrency(isPaymentModalOpen?.advanceBalance || 0)}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Amount Received (₹) <span className="text-red-500">*</span>
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
                  paymentMethod: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {paymentType === 'Advance' && (
            <div>
              <label className="block font-medium text-gray-700 mb-1">Advance Purpose</label>
              <input
                type="text"
                value={paymentForm.purpose}
                onChange={(e) => setPaymentForm({ ...paymentForm, purpose: e.target.value })}
                placeholder="e.g. Advance booking for Singer Umbrella Machine Set"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-gray-700 mb-1">Notes / Transaction Reference</label>
            <input
              type="text"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              placeholder="e.g. Cash received by shop owner"
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
              {loading ? 'Recording...' : 'Save Payment Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Full Profile / Ledger Modal */}
      {customerToView && (
        <Modal
          isOpen={!!customerToView}
          onClose={() => setCustomerToView(null)}
          title={`Customer Ledger: ${customerToView.name}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500 block">Total Purchases</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(customerToView.totalPurchases || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Total Paid</span>
                <span className="text-sm font-bold text-emerald-700">
                  {formatCurrency(customerToView.totalPaid || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Udhaari Due</span>
                <span className="text-sm font-extrabold text-amber-800">
                  {formatCurrency(customerToView.outstandingBalance || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Advance Balance</span>
                <span className="text-sm font-bold text-blue-700">
                  {formatCurrency(customerToView.advanceBalance || 0)}
                </span>
              </div>
            </div>

            {/* Sales Invoices History */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-800">Sales Invoices</h4>
              {sales.filter((s) => s.customerId === customerToView.id).length === 0 ? (
                <p className="text-gray-400 py-3 text-center border rounded-lg">
                  No sales recorded for this customer yet.
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Invoice #</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-right">Paid</th>
                        <th className="p-2 text-right">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sales
                        .filter((s) => s.customerId === customerToView.id)
                        .map((s) => (
                          <tr key={s.id}>
                            <td className="p-2 text-gray-500">{formatDate(s.saleDate)}</td>
                            <td className="p-2 font-mono font-medium">{s.invoiceNumber}</td>
                            <td className="p-2 text-right font-bold">{formatCurrency(s.total)}</td>
                            <td className="p-2 text-right text-emerald-700 font-medium">{formatCurrency(s.paidAmount)}</td>
                            <td className="p-2 text-right text-amber-800 font-bold">{formatCurrency(s.remainingAmount)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-800">Udhaari Payments & Advances Log</h4>
              {customerPayments.filter((p) => p.customerId === customerToView.id).length === 0 ? (
                <p className="text-gray-400 py-3 text-center border rounded-lg">
                  No direct payments or advances recorded yet.
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Mode</th>
                        <th className="p-2">Notes</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customerPayments
                        .filter((p) => p.customerId === customerToView.id)
                        .map((pay) => (
                          <tr key={pay.id}>
                            <td className="p-2 text-gray-500">{formatDate(pay.paymentDate)}</td>
                            <td className="p-2">
                              <span
                                className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
                                  pay.type === 'Advance'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {pay.type}
                              </span>
                            </td>
                            <td className="p-2">{pay.paymentMethod}</td>
                            <td className="p-2 text-gray-600 truncate max-w-[150px]">{pay.notes || pay.purpose || '-'}</td>
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

            {/* Repair History */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-800">Machine Repair History</h4>
              {repairs.filter(
                (r) =>
                  r.customerId === customerToView.id ||
                  r.customerPhone === customerToView.phone ||
                  r.customerName.toLowerCase() === customerToView.name.toLowerCase()
              ).length === 0 ? (
                <p className="text-gray-400 py-3 text-center border rounded-lg">
                  No repair jobs on record for this customer.
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                      <tr>
                        <th className="p-2">Repair ID</th>
                        <th className="p-2">Machine / Model</th>
                        <th className="p-2">Status</th>
                        <th className="p-2 text-right">Est. Cost</th>
                        <th className="p-2 text-right">Remaining Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {repairs
                        .filter(
                          (r) =>
                            r.customerId === customerToView.id ||
                            r.customerPhone === customerToView.phone ||
                            r.customerName.toLowerCase() === customerToView.name.toLowerCase()
                        )
                        .map((r) => (
                          <tr key={r.id}>
                            <td className="p-2 font-mono font-medium text-blue-800">{r.repairId}</td>
                            <td className="p-2">
                              {r.brand} {r.machineType} {r.model ? `(${r.model})` : ''}
                            </td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100">
                                {r.status}
                              </span>
                            </td>
                            <td className="p-2 text-right font-medium">{formatCurrency(r.estimatedCost)}</td>
                            <td className="p-2 text-right text-red-700 font-bold">{formatCurrency(r.remainingAmount)}</td>
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
        isOpen={!!customerToDelete}
        title="Delete Customer Profile?"
        message={`Are you sure you want to delete customer "${customerToDelete?.name}"?`}
        confirmText="Delete Customer"
        isDestructive={true}
        isLoading={loading}
        onConfirm={handleDeleteCustomer}
        onCancel={() => setCustomerToDelete(null)}
      />
    </div>
  );
};
