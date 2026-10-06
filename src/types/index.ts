export type ProductCategory = 'Sewing Machines' | 'Spare Parts' | 'Accessories';

export type ProductStatus = 'Active' | 'Inactive';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  brand: string;
  model: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  unit: string; // e.g. 'Pcs', 'Set', 'Box', 'Meter'
  status: ProductStatus;
  imageUrl?: string;
  // Sewing machine specific fields
  serialNumber?: string;
  warrantyPeriod?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  // Spare part specific fields
  partNumber?: string;
  compatibleModels?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  adjustmentType: 'Add' | 'Subtract' | 'Set';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  totalPurchases: number;
  totalPaid: number;
  outstandingBalance: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank' | 'Cheque' | 'Other';
  notes?: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  totalPurchases: number;
  totalPaid: number;
  outstandingBalance: number; // Udhaari owed to shop
  advanceBalance: number; // Customer advance deposit available
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  saleId?: string;
  type: 'Udhaari Payment' | 'Advance';
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank' | 'Cheque' | 'Other';
  purpose?: string;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  serialNumber?: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  saleDate: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
  advanceUsed: number;
  paidAmount: number;
  remainingAmount: number; // Udhaari
  paymentMethod: 'Cash' | 'UPI' | 'Bank' | 'Cheque' | 'Udhaari';
  notes?: string;
  status: 'Completed' | 'Cancelled';
  createdAt: string;
}

export type RepairStatus =
  | 'Received'
  | 'Checking'
  | 'Repairing'
  | 'Waiting for Parts'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled';

export interface Repair {
  id: string;
  repairId: string; // e.g. 'REP-1001'
  customerId?: string;
  customerName: string;
  customerPhone: string;
  machineType: string; // e.g. Umbrella, Domestic, Industrial, Overlock
  brand: string;
  model: string;
  serialNumber?: string;
  problemDescription: string;
  accessoriesReceived?: string; // e.g. Pedal, Case, Bobbin, Motor
  estimatedCost: number;
  advancePayment: number;
  remainingAmount: number;
  finalPayment: number;
  receivedDate: string;
  expectedDeliveryDate?: string;
  deliveredDate?: string;
  status: RepairStatus;
  technicianNotes?: string;
  finalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RepairPayment {
  id: string;
  repairId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank' | 'Cheque' | 'Other';
  paymentType: 'Advance' | 'Additional' | 'Final';
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Shop'
  | 'Transport'
  | 'Electricity'
  | 'Salary'
  | 'Repair tools'
  | 'Miscellaneous'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank' | 'Other';
  notes?: string;
  createdAt: string;
}

export interface BusinessSettings {
  id: string;
  businessName: string;
  tagline: string;
  address: string;
  phone: string;
  alternatePhone?: string;
  whatsapp: string;
  googleMapsUrl?: string;
  email: string;
  aboutText: string;
  invoicePrefix: string;
  gstEnabled: boolean;
  defaultGstPercent: number;
  allowNegativeStock: boolean;
  lowStockThreshold: number;
  updatedAt: string;
}
