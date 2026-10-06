import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  Ban,
} from 'lucide-react';
import { formatCurrency, formatDate, generateInvoiceNumber } from '../../utils/formatters';
import { createSale, cancelSale } from '../../firebase/services';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { Sale, Customer, Product, BusinessSettings, SaleItem } from '../../types';

interface SalesPageProps {
  sales: Sale[];
  customers: Customer[];
  products: Product[];
  settings: BusinessSettings;
  onOpenNewCustomer: () => void;
  selectedSaleForInvoice: Sale | null;
  setSelectedSaleForInvoice: (s: Sale | null) => void;
}

export const SalesPage: React.FC<SalesPageProps> = ({
  sales,
  customers,
  products,
  settings,
  onOpenNewCustomer,
  selectedSaleForInvoice,
  setSelectedSaleForInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer returned goods');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // New Sale Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [manualCustomerName, setManualCustomerName] = useState<string>('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState<SaleItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      sku: products[0]?.sku || '',
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 0,
      subtotal: products[0]?.sellingPrice || 0,
    },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [useGst, setUseGst] = useState<boolean>(settings.gstEnabled || false);
  const [gstPercent, setGstPercent] = useState<number>(settings.defaultGstPercent || 18);
  const [advanceToUse, setAdvanceToUse] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('Cash');
  const [notes, setNotes] = useState<string>('');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerAdvanceAvailable = selectedCustomer?.advanceBalance || 0;

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const gstAmount = useGst ? Math.round((afterDiscount * gstPercent) / 100) : 0;
  const grandTotal = afterDiscount + gstAmount;
  const netPayable = Math.max(0, grandTotal - advanceToUse);
  const remainingUdhaari = Math.max(0, netPayable - paidAmount);

  // Line item change helper
  const handleItemProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newItems = [...lineItems];
    newItems[index] = {
      ...newItems[index],
      productId,
      productName: prod.name,
      sku: prod.sku,
      unitPrice: prod.sellingPrice,
      subtotal: newItems[index].quantity * prod.sellingPrice,
      serialNumber: prod.serialNumber || '',
    };
    setLineItems(newItems);
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    const newItems = [...lineItems];
    const safeQty = Math.max(1, qty);
    newItems[index] = {
      ...newItems[index],
      quantity: safeQty,
      subtotal: safeQty * newItems[index].unitPrice,
    };
    setLineItems(newItems);
  };

  const handleItemPriceChange = (index: number, price: number) => {
    const newItems = [...lineItems];
    newItems[index] = {
      ...newItems[index],
      unitPrice: price,
      subtotal: newItems[index].quantity * price,
    };
    setLineItems(newItems);
  };

  const addLineItem = () => {
    const firstProd = products[0];
    setLineItems([
      ...lineItems,
      {
        productId: firstProd?.id || '',
        productName: firstProd?.name || '',
        sku: firstProd?.sku || '',
        quantity: 1,
        unitPrice: firstProd?.sellingPrice || 0,
        subtotal: firstProd?.sellingPrice || 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Open Sale Modal and initialize
  const handleOpenNewSale = () => {
    if (products.length === 0) {
      showToast('Please add products to your inventory before creating a sale.', 'error');
      return;
    }
    const firstProd = products[0];
    setLineItems([
      {
        productId: firstProd.id,
        productName: firstProd.name,
        sku: firstProd.sku,
        quantity: 1,
        unitPrice: firstProd.sellingPrice,
        subtotal: firstProd.sellingPrice,
      },
    ]);
    setSelectedCustomerId(customers[0]?.id || '');
    setManualCustomerName('');
    setManualCustomerPhone('');
    setDiscount(0);
    setAdvanceToUse(0);
    setPaidAmount(firstProd.sellingPrice);
    setPaymentMethod('Cash');
    setNotes('');
    setIsNewSaleModalOpen(true);
  };

  // Submit Sale
  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      showToast('Please add at least one item to the sale.', 'error');
      return;
    }

    const customerName = selectedCustomer ? selectedCustomer.name : manualCustomerName.trim();
    const customerPhone = selectedCustomer ? selectedCustomer.phone : manualCustomerPhone.trim();

    if (!customerName) {
      showToast('Customer name is required for billing.', 'error');
      return;
    }

    // Check stock availability unless negative stock allowed
    if (!settings.allowNegativeStock) {
      for (const item of lineItems) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && prod.currentStock < item.quantity) {
          showToast(
            `Insufficient stock for "${prod.name}". Available: ${prod.currentStock}, requested: ${item.quantity}.`,
            'error'
          );
          return;
        }
      }
    }

    setLoading(true);
    try {
      const invoiceNumber = generateInvoiceNumber(settings.invoicePrefix || 'HGS-');
      await createSale({
        invoiceNumber,
        customerId: selectedCustomerId || '',
        customerName,
        customerPhone,
        customerAddress: selectedCustomer?.address || '',
        saleDate,
        items: lineItems,
        subtotal,
        discount,
        gstPercent: useGst ? gstPercent : 0,
        gstAmount,
        total: grandTotal,
        advanceUsed: advanceToUse,
        paidAmount,
        remainingAmount: remainingUdhaari,
        paymentMethod: remainingUdhaari > 0 && paidAmount === 0 ? 'Udhaari' : paymentMethod,
        notes,
        status: 'Completed',
      });

      showToast(`Sale Invoice #${invoiceNumber} generated successfully.`);
      setIsNewSaleModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to create sale.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Void/Cancel sale
  const handleConfirmCancelSale = async () => {
    if (!saleToCancel) return;
    setLoading(true);
    try {
      await cancelSale(saleToCancel, cancelReason);
      showToast(`Invoice #${saleToCancel.invoiceNumber} cancelled. Stock and ledger restored.`);
      setSaleToCancel(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to cancel sale.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.invoiceNumber?.toLowerCase().includes(q) ||
      s.customerName?.toLowerCase().includes(q) ||
      s.customerPhone?.includes(q)
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
          <h2 className="text-lg font-bold text-gray-900">Sales Invoices & Billing</h2>
          <p className="text-xs text-gray-500">
            Create customer invoices, track paid & udhaari balances, and print receipts.
          </p>
        </div>

        <button
          onClick={handleOpenNewSale}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Sale / Invoice</span>
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
            placeholder="Search by invoice #, customer name or phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-gray-500 shrink-0">
          Total Invoices: <strong className="text-gray-800">{sales.length}</strong>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="text-center py-16 p-4">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700">No sales recorded yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Create your first sale to generate an itemized invoice, adjust stock, and manage customer
              udhaari.
            </p>
            <button
              onClick={handleOpenNewSale}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              New Sale
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3 text-center">Items</th>
                  <th className="py-3 px-3 text-right">Total Bill</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Udhaari</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.map((s) => (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      s.status === 'Cancelled' ? 'bg-gray-50/70 opacity-60' : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {s.invoiceNumber}
                    </td>
                    <td className="py-3 px-3 text-gray-500">{formatDate(s.saleDate)}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-gray-900 block">{s.customerName}</span>
                      {s.customerPhone && (
                        <span className="text-[10px] text-gray-400">{s.customerPhone}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-gray-700">
                      {s.items?.length || 1}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">
                      {formatCurrency(s.total)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                      {formatCurrency(s.paidAmount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {s.remainingAmount > 0 ? (
                        <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {formatCurrency(s.remainingAmount)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Paid in Full</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedSaleForInvoice(s)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Invoice</span>
                        </button>
                        {s.status !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              setSaleToCancel(s);
                              setCancelReason('Customer returned goods');
                            }}
                            className="p-1 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                            title="Void / Cancel Sale"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create New Sale Modal */}
      <Modal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        title="Create Customer Sale & Billing Invoice"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
          {/* Customer Selection Row */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">Customer Details</span>
              <button
                type="button"
                onClick={onOpenNewCustomer}
                className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                + Register New Customer
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-gray-600 mb-1">
                  Select Existing Customer (or enter walk-in below)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Walk-in / One-time Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - Udhaari Due: {formatCurrency(c.outstandingBalance)}
                      {c.advanceBalance > 0 ? ` | Advance: ${formatCurrency(c.advanceBalance)}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Sale Date</label>
                <input
                  type="date"
                  required
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {!selectedCustomerId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-200">
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">
                    Walk-in Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={!selectedCustomerId}
                    value={manualCustomerName}
                    onChange={(e) => setManualCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">Customer Phone</label>
                  <input
                    type="tel"
                    value={manualCustomerPhone}
                    onChange={(e) => setManualCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">Items to Sell (Inventory)</span>
              <button
                type="button"
                onClick={addLineItem}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-md font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white">
              {lineItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                return (
                  <div key={idx} className="p-3 flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemProductChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.brand}) - In Stock: {p.currentStock} {p.unit}
                          </option>
                        ))}
                      </select>
                      {prod && (
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Available Stock: {prod.currentStock} {prod.unit}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="w-20">
                        <label className="text-[9px] text-gray-400 block sm:hidden">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQtyChange(idx, Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-center"
                        />
                      </div>

                      <div className="w-24">
                        <label className="text-[9px] text-gray-400 block sm:hidden">Rate</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemPriceChange(idx, Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-right font-medium"
                        />
                      </div>

                      <div className="w-28 text-right font-extrabold text-sm text-gray-900 pr-1">
                        {formatCurrency(item.subtotal)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        disabled={lineItems.length === 1}
                        className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discounts, Taxes, and Customer Advance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-3">
              {/* Optional GST */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useGst}
                      onChange={(e) => setUseGst(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Add GST to Invoice (Optional)</span>
                  </label>
                  {useGst && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="28"
                        value={gstPercent}
                        onChange={(e) => setGstPercent(Number(e.target.value))}
                        className="w-12 px-1.5 py-0.5 border border-gray-300 rounded text-center text-xs font-bold"
                      />
                      <span>%</span>
                    </div>
                  )}
                </div>
                {useGst && (
                  <p className="text-[10px] text-gray-500">
                    CGST ({gstPercent / 2}%) + SGST ({gstPercent / 2}%) = {formatCurrency(gstAmount)}
                  </p>
                )}
              </div>

              {/* Customer Advance Adjustment if available */}
              {customerAdvanceAvailable > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <span className="font-bold text-blue-900 block">
                    Customer Advance Available: {formatCurrency(customerAdvanceAvailable)}
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-[11px] text-blue-800 font-medium">Use from Advance:</label>
                    <input
                      type="number"
                      min="0"
                      max={Math.min(customerAdvanceAvailable, grandTotal)}
                      value={advanceToUse}
                      onChange={(e) => setAdvanceToUse(Number(e.target.value))}
                      className="w-28 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-bold text-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAdvanceToUse(Math.min(customerAdvanceAvailable, grandTotal))
                      }
                      className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-semibold cursor-pointer"
                    >
                      Max
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-gray-700 mb-1">Invoice Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Warranty remarks, serial number notes, transport info..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Total Calculations Card */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-white border border-gray-300 rounded text-right text-xs font-semibold"
                />
              </div>

              {useGst && (
                <div className="flex justify-between text-gray-600">
                  <span>GST ({gstPercent}%):</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(gstAmount)}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-gray-900">
                <span>Grand Total:</span>
                <span className="text-base text-emerald-900">{formatCurrency(grandTotal)}</span>
              </div>

              {advanceToUse > 0 && (
                <div className="flex justify-between text-blue-700 font-medium">
                  <span>Advance Deducted:</span>
                  <span>- {formatCurrency(advanceToUse)}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-gray-800">Paid Now (₹):</label>
                  <input
                    type="number"
                    min="0"
                    max={netPayable}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-28 px-2 py-1 bg-white border border-gray-300 rounded text-right text-sm font-extrabold text-emerald-800"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-gray-600">Payment Mode:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (GPay, PhonePe)</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Udhaari">Full Udhaari</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex justify-between items-center text-amber-950 font-bold">
                  <span>Remaining Udhaari (Due):</span>
                  <span className="text-sm font-extrabold">{formatCurrency(remainingUdhaari)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsNewSaleModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing Sale...' : 'Save & Generate Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice Modal */}
      {selectedSaleForInvoice && (
        <Modal
          isOpen={!!selectedSaleForInvoice}
          onClose={() => setSelectedSaleForInvoice(null)}
          title={`Invoice: ${selectedSaleForInvoice.invoiceNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Printable Container */}
            <div id="printable-invoice" className="p-6 bg-white border border-gray-300 rounded-xl space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    {settings.businessName || 'Hafiz G Silai Machine'}
                  </h1>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {settings.address || 'Bhatti Chowk, Rajnagar, Madhubani, Bihar, India'}
                  </p>
                  <p className="text-gray-500 text-xs">Phone: {settings.phone}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-xs uppercase tracking-wider rounded">
                    Retail Invoice
                  </span>
                  <p className="font-mono font-bold text-gray-900 mt-2 text-sm">
                    {selectedSaleForInvoice.invoiceNumber}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Date: {formatDate(selectedSaleForInvoice.saleDate)}
                  </p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Billed To
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {selectedSaleForInvoice.customerName}
                  </span>
                  {selectedSaleForInvoice.customerPhone && (
                    <span className="text-gray-600 block">
                      Phone: {selectedSaleForInvoice.customerPhone}
                    </span>
                  )}
                  {selectedSaleForInvoice.customerAddress && (
                    <span className="text-gray-500 block">
                      {selectedSaleForInvoice.customerAddress}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Payment Mode
                  </span>
                  <span className="font-bold text-gray-800">
                    {selectedSaleForInvoice.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Rate</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedSaleForInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-gray-900">
                        {item.productName}
                        {item.serialNumber && (
                          <span className="text-[10px] text-gray-400 block font-mono">
                            S/N: {item.serialNumber}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="p-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2.5 text-right font-bold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculations Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedSaleForInvoice.subtotal)}</span>
                  </div>
                  {selectedSaleForInvoice.discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Discount:</span>
                      <span>- {formatCurrency(selectedSaleForInvoice.discount)}</span>
                    </div>
                  )}
                  {selectedSaleForInvoice.gstAmount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>GST ({selectedSaleForInvoice.gstPercent}%):</span>
                      <span>{formatCurrency(selectedSaleForInvoice.gstAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-1 flex justify-between font-bold text-gray-900 text-sm">
                    <span>Total Bill:</span>
                    <span>{formatCurrency(selectedSaleForInvoice.total)}</span>
                  </div>
                  {selectedSaleForInvoice.advanceUsed > 0 && (
                    <div className="flex justify-between text-blue-700">
                      <span>Advance Adjusted:</span>
                      <span>- {formatCurrency(selectedSaleForInvoice.advanceUsed)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Amount Paid:</span>
                    <span>{formatCurrency(selectedSaleForInvoice.paidAmount)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-1 flex justify-between font-extrabold text-sm text-red-700">
                    <span>Balance Due (Udhaari):</span>
                    <span>{formatCurrency(selectedSaleForInvoice.remainingAmount)}</span>
                  </div>
                </div>
              </div>

              {selectedSaleForInvoice.notes && (
                <div className="pt-2 border-t border-gray-200 text-gray-600">
                  <span className="font-semibold block text-gray-700">Notes:</span>
                  <p>{selectedSaleForInvoice.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-[10px] text-gray-400">
                <p>Thank you for choosing Hafiz G Silai Machine, Rajnagar!</p>
                <div className="text-right">Authorized Signatory</div>
              </div>
            </div>

            {/* Print and Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedSaleForInvoice(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice / Save PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Sale Confirmation */}
      <Modal
        isOpen={!!saleToCancel}
        onClose={() => setSaleToCancel(null)}
        title={`Void / Cancel Sale: ${saleToCancel?.invoiceNumber}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-600">
            Cancelling this sale will automatically restore all sold items to current product stock
            and reverse the customer's balance.
          </p>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Reason for Cancellation</label>
            <input
              type="text"
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer returned machine, mistake in entry"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setSaleToCancel(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Abort
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirmCancelSale}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Reversing...' : 'Confirm Void / Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
