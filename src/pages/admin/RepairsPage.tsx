import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  CreditCard,
  MessageCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import { formatCurrency, formatDate, generateRepairId, getWhatsAppUrl } from '../../utils/formatters';
import {
  createRepair,
  updateRepair,
  deleteRepair,
  recordRepairPayment,
} from '../../firebase/services';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { Repair, RepairPayment, RepairStatus, BusinessSettings } from '../../types';

interface RepairsPageProps {
  repairs: Repair[];
  repairPayments: RepairPayment[];
  settings: BusinessSettings;
  selectedRepairForDetail: Repair | null;
  setSelectedRepairForDetail: (r: Repair | null) => void;
  isNewRepairModalOpen: boolean;
  setIsNewRepairModalOpen: (open: boolean) => void;
}

export const RepairsPage: React.FC<RepairsPageProps> = ({
  repairs,
  repairPayments,
  settings,
  selectedRepairForDetail,
  setSelectedRepairForDetail,
  isNewRepairModalOpen,
  setIsNewRepairModalOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<Repair | null>(null);
  const [repairToDelete, setRepairToDelete] = useState<Repair | null>(null);
  const [repairToPrint, setRepairToPrint] = useState<Repair | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const statuses: RepairStatus[] = [
    'Received',
    'Checking',
    'Repairing',
    'Waiting for Parts',
    'Ready',
    'Delivered',
    'Cancelled',
  ];

  // Intake Form State
  const initialForm = {
    repairId: generateRepairId(),
    customerName: '',
    customerPhone: '',
    machineType: 'Umbrella Sewing Machine',
    brand: 'Singer',
    model: 'Deluxe',
    serialNumber: '',
    problemDescription: '',
    accessoriesReceived: 'Machine Head, Bobbin Case',
    estimatedCost: 350,
    advancePayment: 0,
    receivedDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Received' as RepairStatus,
    technicianNotes: '',
    finalNotes: '',
  };

  const [formData, setFormData] = useState(initialForm);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<RepairPayment['paymentMethod']>('Cash');
  const [paymentType, setPaymentType] = useState<RepairPayment['paymentType']>('Final');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const handleOpenNew = () => {
    setFormData({
      ...initialForm,
      repairId: generateRepairId(),
      receivedDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsNewRepairModalOpen(true);
  };

  const handleCreateRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.problemDescription.trim()) {
      showToast('Please provide customer name, phone, and problem description.', 'error');
      return;
    }

    const remaining = Math.max(0, formData.estimatedCost - formData.advancePayment);

    setLoading(true);
    try {
      await createRepair({
        ...formData,
        remainingAmount: remaining,
        finalPayment: 0,
      });

      showToast(`Repair Ticket #${formData.repairId} created.`);
      setIsNewRepairModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to create repair ticket.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (repairId: string, newStatus: RepairStatus) => {
    try {
      await updateRepair(repairId, {
        status: newStatus,
        deliveredDate: newStatus === 'Delivered' ? new Date().toISOString().split('T')[0] : undefined,
      });
      showToast(`Status updated to "${newStatus}".`);
      if (selectedRepairForDetail && selectedRepairForDetail.id === repairId) {
        setSelectedRepairForDetail({
          ...selectedRepairForDetail,
          status: newStatus,
        });
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status.', 'error');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPaymentModalOpen || paymentAmount <= 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }

    setLoading(true);
    try {
      await recordRepairPayment(
        isPaymentModalOpen.id,
        isPaymentModalOpen.repairId,
        isPaymentModalOpen.customerName,
        paymentAmount,
        paymentDate,
        paymentMethod,
        paymentType,
        paymentNotes
      );

      showToast(`Payment of ${formatCurrency(paymentAmount)} recorded for Repair #${isPaymentModalOpen.repairId}.`);
      setIsPaymentModalOpen(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to record repair payment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepair = async () => {
    if (!repairToDelete) return;
    setLoading(true);
    try {
      await deleteRepair(repairToDelete.id);
      showToast(`Repair #${repairToDelete.repairId} deleted.`);
      setRepairToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete repair.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRepairs = repairs.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.repairId?.toLowerCase().includes(q) ||
        r.customerName?.toLowerCase().includes(q) ||
        r.customerPhone?.includes(q) ||
        r.serialNumber?.toLowerCase().includes(q) ||
        r.brand?.toLowerCase().includes(q)
      );
    }
    return true;
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
          <h2 className="text-lg font-bold text-gray-900">Machine Repairs & Workshop Tickets</h2>
          <p className="text-xs text-gray-500">
            Intake machine repairs, log advance payments, update technician status, and print job receipts.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Intake New Machine Repair</span>
        </button>
      </div>

      {/* Search and Status Pills */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Repair ID (e.g. REP-1001), Customer, Phone, or Serial #..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-semibold text-gray-500 mr-1">Status:</span>
          {['All', ...statuses].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Repairs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredRepairs.length === 0 ? (
          <div className="text-center py-16 p-4">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700">No repair jobs found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              When a customer drops off a sewing machine for servicing, click "Intake New Machine
              Repair".
            </p>
            <button
              onClick={handleOpenNew}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              Intake Repair
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Repair ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Machine & Problem</th>
                  <th className="py-3 px-3">Dates</th>
                  <th className="py-3 px-3">Current Status</th>
                  <th className="py-3 px-3 text-right">Est. Cost</th>
                  <th className="py-3 px-3 text-right">Remaining Due</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRepairs.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{r.repairId}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-900 block">{r.customerName}</span>
                      <span className="text-[10px] text-gray-500">{r.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <span className="font-semibold text-gray-800 block">
                        {r.brand} {r.machineType}
                      </span>
                      <p className="text-[11px] text-gray-500 truncate">{r.problemDescription}</p>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-gray-500">
                      <div>Rec: {formatDate(r.receivedDate)}</div>
                      {r.expectedDeliveryDate && <div>Exp: {formatDate(r.expectedDeliveryDate)}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={r.status}
                        onChange={(e) => handleUpdateStatus(r.id, e.target.value as RepairStatus)}
                        className={`text-[11px] font-bold px-2 py-1 rounded border border-gray-300 cursor-pointer ${
                          r.status === 'Ready'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : r.status === 'Delivered'
                            ? 'bg-gray-100 text-gray-700'
                            : r.status === 'Repairing'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-700">
                      {formatCurrency(r.estimatedCost)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {r.remainingAmount > 0 ? (
                        <span className="font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                          {formatCurrency(r.remainingAmount)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Cleared</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {r.remainingAmount > 0 && (
                          <button
                            onClick={() => {
                              setIsPaymentModalOpen(r);
                              setPaymentAmount(r.remainingAmount);
                              setPaymentType(r.status === 'Ready' || r.status === 'Delivered' ? 'Final' : 'Additional');
                              setPaymentDate(new Date().toISOString().split('T')[0]);
                              setPaymentMethod('Cash');
                              setPaymentNotes('');
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            title="Collect Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Collect</span>
                          </button>
                        )}
                        <button
                          onClick={() => setRepairToPrint(r)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                          title="Print Job Sheet / Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedRepairForDetail(r)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                          title="Manage Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

      {/* Intake New Repair Modal */}
      <Modal
        isOpen={isNewRepairModalOpen}
        onClose={() => setIsNewRepairModalOpen(false)}
        title="Intake Machine Repair & Service Job"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateRepair} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center text-blue-900 font-bold">
            <span>Repair Job Ticket ID:</span>
            <span className="font-mono text-sm">{formData.repairId}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. Mohd Rashid"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Customer Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Machine Type</label>
              <input
                type="text"
                required
                value={formData.machineType}
                onChange={(e) => setFormData({ ...formData, machineType: e.target.value })}
                placeholder="Domestic, Umbrella, Industrial Lockstitch"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Machine Brand</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Usha, Singer, Merrit, Juki"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Model / Serial #</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g. SN-89102"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Problem Description / Stitch Fault <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.problemDescription}
              onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
              placeholder="e.g. Breaking thread continuously, needle hitting shuttle race, heavy noise in motor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Accessories Received with Machine</label>
            <input
              type="text"
              value={formData.accessoriesReceived}
              onChange={(e) => setFormData({ ...formData, accessoriesReceived: e.target.value })}
              placeholder="e.g. Machine head only, foot pedal, bobbin case, motor belt"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Estimated Cost (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Advance Received (₹)</label>
              <input
                type="number"
                min="0"
                max={formData.estimatedCost}
                value={formData.advancePayment}
                onChange={(e) => setFormData({ ...formData, advancePayment: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Received Date</label>
              <input
                type="date"
                required
                value={formData.receivedDate}
                onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Expected Delivery</label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsNewRepairModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Logging Ticket...' : 'Confirm Machine Intake'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Collect Repair Payment Modal */}
      <Modal
        isOpen={!!isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(null)}
        title={`Collect Repair Payment: ${isPaymentModalOpen?.repairId}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
            <div>
              <span className="text-gray-500 block">Customer:</span>
              <span className="font-bold text-gray-900">{isPaymentModalOpen?.customerName}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block">Remaining Due:</span>
              <span className="font-extrabold text-base text-red-700">
                {formatCurrency(isPaymentModalOpen?.remainingAmount || 0)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Payment Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Final">Final Delivery Payment</option>
                <option value="Additional">Additional Part Payment</option>
                <option value="Advance">Advance Payment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Notes / Receipt Remarks</label>
            <input
              type="text"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="e.g. Paid in full upon testing and delivery"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
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
              {loading ? 'Recording...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Job Sheet / Receipt Modal */}
      {repairToPrint && (
        <Modal
          isOpen={!!repairToPrint}
          onClose={() => setRepairToPrint(null)}
          title={`Repair Receipt: ${repairToPrint.repairId}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-6 bg-white border border-gray-300 rounded-xl space-y-4">
              <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    {settings.businessName || 'Hafiz G Silai Machine'}
                  </h3>
                  <p className="text-gray-500 text-[11px]">
                    Bhatti Chowk, Rajnagar, Madhubani • Tel: {settings.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm bg-blue-50 text-blue-900 px-2 py-0.5 rounded">
                    {repairToPrint.repairId}
                  </span>
                  <p className="text-gray-400 text-[10px] mt-1">
                    Date: {formatDate(repairToPrint.receivedDate)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-lg border">
                <div>
                  <span className="text-gray-400 text-[10px] block">Customer</span>
                  <span className="font-bold text-gray-900">{repairToPrint.customerName}</span>
                  <span className="text-gray-600 block">{repairToPrint.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Machine Info</span>
                  <span className="font-semibold text-gray-900">
                    {repairToPrint.brand} ({repairToPrint.machineType})
                  </span>
                  {repairToPrint.serialNumber && (
                    <span className="text-gray-500 block font-mono">S/N: {repairToPrint.serialNumber}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-gray-700">Problem Reported:</span>
                <p className="text-gray-700 p-2 bg-gray-50 rounded border">
                  {repairToPrint.problemDescription}
                </p>
              </div>

              {repairToPrint.accessoriesReceived && (
                <div className="space-y-1">
                  <span className="font-semibold text-gray-700">Accessories Received:</span>
                  <p className="text-gray-700">{repairToPrint.accessoriesReceived}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-sm font-bold">
                <div>
                  <span className="text-gray-500 block text-xs">Estimated Cost:</span>
                  <span>{formatCurrency(repairToPrint.estimatedCost)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Advance Paid:</span>
                  <span className="text-emerald-700">{formatCurrency(repairToPrint.advancePayment)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Remaining Balance:</span>
                  <span className="text-red-700">{formatCurrency(repairToPrint.remainingAmount)}</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-gray-400 border-t">
                Please retain this receipt and present it when picking up your repaired sewing machine.
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRepairToPrint(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Job Receipt</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manage Details Modal */}
      {selectedRepairForDetail && (
        <Modal
          isOpen={!!selectedRepairForDetail}
          onClose={() => setSelectedRepairForDetail(null)}
          title={`Manage Repair Ticket: ${selectedRepairForDetail.repairId}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-sm">
                  {selectedRepairForDetail.customerName}
                </span>
                <a
                  href={`tel:${selectedRepairForDetail.customerPhone}`}
                  className="text-emerald-700 font-semibold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedRepairForDetail.customerPhone}</span>
                </a>
              </div>
              <p className="text-gray-600">
                Machine: {selectedRepairForDetail.brand} {selectedRepairForDetail.machineType} (
                {selectedRepairForDetail.model})
              </p>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Technician Notes</label>
              <textarea
                rows={2}
                defaultValue={selectedRepairForDetail.technicianNotes || ''}
                onBlur={(e) =>
                  updateRepair(selectedRepairForDetail.id, { technicianNotes: e.target.value })
                }
                placeholder="Parts replaced (e.g. Shuttle race, needle bar), timing tuned..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
              <span className="text-[10px] text-gray-400">Auto-saves on clicking away</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <button
                type="button"
                onClick={() => setRepairToDelete(selectedRepairForDetail)}
                className="text-red-600 hover:underline cursor-pointer"
              >
                Delete Ticket
              </button>
              <button
                type="button"
                onClick={() => setSelectedRepairForDetail(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!repairToDelete}
        title="Delete Repair Ticket?"
        message={`Are you sure you want to delete repair ticket "${repairToDelete?.repairId}"?`}
        confirmText="Delete Repair"
        isDestructive={true}
        isLoading={loading}
        onConfirm={handleDeleteRepair}
        onCancel={() => setRepairToDelete(null)}
      />
    </div>
  );
};
