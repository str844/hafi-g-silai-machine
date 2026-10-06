import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import type {
  Product,
  Brand,
  StockAdjustment,
  Supplier,
  SupplierPayment,
  Purchase,
  Customer,
  CustomerPayment,
  Sale,
  Repair,
  RepairPayment,
  Expense,
  BusinessSettings,
} from '../types';

export const DEFAULT_SETTINGS: BusinessSettings = {
  id: 'default',
  businessName: 'Hafiz G Silai Machine',
  tagline: 'Quality sewing machines, spare parts, accessories and reliable repair & service support.',
  address: 'Bhatti Chowk, Rajnagar, Madhubani, Bihar, India',
  phone: '7870493385',
  alternatePhone: '7488473065',
  whatsapp: '7870493385',
  googleMapsUrl: 'https://share.google/UsmUAsmxJWu4JPMyA',
  email: 'hafizgsilaimachine@gmail.com',
  aboutText: 'Hafiz G Silai Machine is a trusted sewing machine shop in Rajnagar, Madhubani. We provide all varieties of domestic and industrial sewing machines, genuine spare parts, tailoring accessories, and specialized repair and maintenance services.',
  invoicePrefix: 'HGS-',
  gstEnabled: false,
  defaultGstPercent: 18,
  allowNegativeStock: false,
  lowStockThreshold: 3,
  updatedAt: new Date().toISOString(),
};

// ========================
// BUSINESS SETTINGS
// ========================
export async function getBusinessSettings(): Promise<BusinessSettings> {
  const path = 'businessSettings/default';
  try {
    const docRef = doc(db, 'businessSettings', 'default');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as BusinessSettings;
    } else {
      // Initialize with default
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeBusinessSettings(onUpdate: (settings: BusinessSettings) => void) {
  const path = 'businessSettings/default';
  const docRef = doc(db, 'businessSettings', 'default');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ id: snapshot.id, ...snapshot.data() } as BusinessSettings);
      } else {
        onUpdate(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<void> {
  const path = 'businessSettings/default';
  try {
    const docRef = doc(db, 'businessSettings', 'default');
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ========================
// BRANDS
// ========================
export async function getBrands(): Promise<Brand[]> {
  const path = 'brands';
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Brand));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeBrands(onUpdate: (brands: Brand[]) => void) {
  const path = 'brands';
  const q = query(collection(db, path), orderBy('name', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Brand));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addBrand(name: string, category: string = 'General', description: string = ''): Promise<string> {
  const path = 'brands';
  try {
    const docRef = await addDoc(collection(db, path), {
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteBrand(brandId: string): Promise<void> {
  const path = `brands/${brandId}`;
  try {
    await deleteDoc(doc(db, 'brands', brandId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ========================
// PRODUCTS & STOCK
// ========================
export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  const path = 'products';
  const q = query(collection(db, path), orderBy('name', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribePublicProducts(onUpdate: (products: Product[]) => void) {
  const path = 'products';
  const q = query(collection(db, path), where('status', '==', 'Active'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function getProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  const path = 'products';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
  const path = `products/${productId}`;
  try {
    await updateDoc(doc(db, 'products', productId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Adjust Stock manually
export async function adjustStock(
  productId: string,
  productName: string,
  adjustmentType: 'Add' | 'Subtract' | 'Set',
  quantity: number,
  reason: string
): Promise<void> {
  const productPath = `products/${productId}`;
  const adjustmentPath = 'stockAdjustments';
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      throw new Error('Product not found');
    }
    const currentStock = (productSnap.data().currentStock as number) || 0;
    let newStock = currentStock;

    if (adjustmentType === 'Add') {
      newStock = currentStock + quantity;
    } else if (adjustmentType === 'Subtract') {
      newStock = Math.max(0, currentStock - quantity);
    } else if (adjustmentType === 'Set') {
      newStock = quantity;
    }

    await updateDoc(productRef, {
      currentStock: newStock,
      updatedAt: new Date().toISOString(),
    });

    await addDoc(collection(db, adjustmentPath), {
      productId,
      productName,
      adjustmentType,
      quantity,
      previousStock: currentStock,
      newStock,
      reason: reason || 'Manual stock adjustment',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, productPath);
  }
}

export function subscribeStockAdjustments(onUpdate: (adjustments: StockAdjustment[]) => void) {
  const path = 'stockAdjustments';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StockAdjustment));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ========================
// SUPPLIERS & PURCHASES
// ========================
export function subscribeSuppliers(onUpdate: (suppliers: Supplier[]) => void) {
  const path = 'suppliers';
  const q = query(collection(db, path), orderBy('name', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Supplier));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases' | 'totalPaid' | 'outstandingBalance'>): Promise<string> {
  const path = 'suppliers';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...supplierData,
      totalPurchases: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSupplier(supplierId: string, updates: Partial<Supplier>): Promise<void> {
  const path = `suppliers/${supplierId}`;
  try {
    await updateDoc(doc(db, 'suppliers', supplierId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSupplier(supplierId: string): Promise<void> {
  const path = `suppliers/${supplierId}`;
  try {
    await deleteDoc(doc(db, 'suppliers', supplierId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribePurchases(onUpdate: (purchases: Purchase[]) => void) {
  const path = 'purchases';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Purchase));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Record purchase: Automatically increments product stock and updates supplier ledger
export async function createPurchase(purchaseData: Omit<Purchase, 'id' | 'createdAt'>): Promise<string> {
  const path = 'purchases';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...purchaseData,
      createdAt: new Date().toISOString(),
    });

    // 1. Automatically increase product stock
    if (purchaseData.productId) {
      const productRef = doc(db, 'products', purchaseData.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const curStock = (productSnap.data().currentStock as number) || 0;
        await updateDoc(productRef, {
          currentStock: curStock + purchaseData.quantity,
          purchasePrice: purchaseData.purchasePrice,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 2. Automatically update supplier balances
    if (purchaseData.supplierId) {
      const supplierRef = doc(db, 'suppliers', purchaseData.supplierId);
      const supplierSnap = await getDoc(supplierRef);
      if (supplierSnap.exists()) {
        const supData = supplierSnap.data();
        const curTotalPurchases = (supData.totalPurchases as number) || 0;
        const curTotalPaid = (supData.totalPaid as number) || 0;
        const curOutstanding = (supData.outstandingBalance as number) || 0;

        await updateDoc(supplierRef, {
          totalPurchases: curTotalPurchases + purchaseData.totalAmount,
          totalPaid: curTotalPaid + purchaseData.paidAmount,
          outstandingBalance: curOutstanding + purchaseData.remainingAmount,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 3. If paidAmount > 0, log a supplier payment entry
    if (purchaseData.paidAmount > 0 && purchaseData.supplierId) {
      await addDoc(collection(db, 'supplierPayments'), {
        supplierId: purchaseData.supplierId,
        supplierName: purchaseData.supplierName,
        purchaseId: docRef.id,
        amount: purchaseData.paidAmount,
        paymentDate: purchaseData.purchaseDate || new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        notes: `Initial payment for purchase #${purchaseData.purchaseNumber}`,
        createdAt: new Date().toISOString(),
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Supplier payments
export function subscribeSupplierPayments(onUpdate: (payments: SupplierPayment[]) => void) {
  const path = 'supplierPayments';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SupplierPayment));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function recordSupplierPayment(
  supplierId: string,
  supplierName: string,
  amount: number,
  paymentDate: string,
  paymentMethod: SupplierPayment['paymentMethod'],
  notes?: string
): Promise<string> {
  const path = 'supplierPayments';
  try {
    const docRef = await addDoc(collection(db, path), {
      supplierId,
      supplierName,
      amount,
      paymentDate,
      paymentMethod,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    });

    // Reduce supplier outstanding balance and increase totalPaid
    const supRef = doc(db, 'suppliers', supplierId);
    const supSnap = await getDoc(supRef);
    if (supSnap.exists()) {
      const supData = supSnap.data();
      const currentPaid = (supData.totalPaid as number) || 0;
      const currentOutstanding = (supData.outstandingBalance as number) || 0;
      await updateDoc(supRef, {
        totalPaid: currentPaid + amount,
        outstandingBalance: Math.max(0, currentOutstanding - amount),
        updatedAt: new Date().toISOString(),
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ========================
// CUSTOMERS & PAYMENTS & ADVANCES
// ========================
export function subscribeCustomers(onUpdate: (customers: Customer[]) => void) {
  const path = 'customers';
  const q = query(collection(db, path), orderBy('name', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalPaid' | 'outstandingBalance' | 'advanceBalance'>): Promise<string> {
  const path = 'customers';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...customerData,
      totalPurchases: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      advanceBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCustomer(customerId: string, updates: Partial<Customer>): Promise<void> {
  const path = `customers/${customerId}`;
  try {
    await updateDoc(doc(db, 'customers', customerId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const path = `customers/${customerId}`;
  try {
    await deleteDoc(doc(db, 'customers', customerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeCustomerPayments(onUpdate: (payments: CustomerPayment[]) => void) {
  const path = 'customerPayments';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CustomerPayment));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Record Udhaari payment or Customer Advance
export async function recordCustomerPayment(
  customerId: string,
  customerName: string,
  type: 'Udhaari Payment' | 'Advance',
  amount: number,
  paymentDate: string,
  paymentMethod: CustomerPayment['paymentMethod'],
  notes?: string,
  purpose?: string
): Promise<string> {
  const path = 'customerPayments';
  try {
    const docRef = await addDoc(collection(db, path), {
      customerId,
      customerName,
      type,
      amount,
      paymentDate,
      paymentMethod,
      notes: notes || '',
      purpose: purpose || '',
      createdAt: new Date().toISOString(),
    });

    const custRef = doc(db, 'customers', customerId);
    const custSnap = await getDoc(custRef);
    if (custSnap.exists()) {
      const cData = custSnap.data();
      const currentPaid = (cData.totalPaid as number) || 0;
      const currentOutstanding = (cData.outstandingBalance as number) || 0;
      const currentAdvance = (cData.advanceBalance as number) || 0;

      if (type === 'Udhaari Payment') {
        await updateDoc(custRef, {
          totalPaid: currentPaid + amount,
          outstandingBalance: Math.max(0, currentOutstanding - amount),
          updatedAt: new Date().toISOString(),
        });
      } else if (type === 'Advance') {
        await updateDoc(custRef, {
          advanceBalance: currentAdvance + amount,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ========================
// SALES & INVOICES
// ========================
export function subscribeSales(onUpdate: (sales: Sale[]) => void) {
  const path = 'sales';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Sale));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Create sale: Automatically decreases product stock, adjusts advance if used, updates customer udhaari
export async function createSale(saleData: Omit<Sale, 'id' | 'createdAt'>): Promise<string> {
  const path = 'sales';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...saleData,
      createdAt: new Date().toISOString(),
    });

    // 1. Decrease product stock for each sold item
    for (const item of saleData.items) {
      if (item.productId) {
        const prodRef = doc(db, 'products', item.productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const curStock = (prodSnap.data().currentStock as number) || 0;
          await updateDoc(prodRef, {
            currentStock: curStock - item.quantity,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    // 2. Update customer record
    if (saleData.customerId) {
      const custRef = doc(db, 'customers', saleData.customerId);
      const custSnap = await getDoc(custRef);
      if (custSnap.exists()) {
        const cData = custSnap.data();
        const curPurchases = (cData.totalPurchases as number) || 0;
        const curPaid = (cData.totalPaid as number) || 0;
        const curOutstanding = (cData.outstandingBalance as number) || 0;
        const curAdvance = (cData.advanceBalance as number) || 0;

        await updateDoc(custRef, {
          totalPurchases: curPurchases + saleData.total,
          totalPaid: curPaid + saleData.paidAmount,
          outstandingBalance: curOutstanding + saleData.remainingAmount,
          advanceBalance: Math.max(0, curAdvance - (saleData.advanceUsed || 0)),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 3. If immediate payment was made, record it
    if (saleData.paidAmount > 0 && saleData.customerId) {
      await addDoc(collection(db, 'customerPayments'), {
        customerId: saleData.customerId,
        customerName: saleData.customerName,
        saleId: docRef.id,
        type: 'Udhaari Payment',
        amount: saleData.paidAmount,
        paymentDate: saleData.saleDate,
        paymentMethod: saleData.paymentMethod === 'Udhaari' ? 'Cash' : saleData.paymentMethod,
        notes: `Paid at invoice #${saleData.invoiceNumber}`,
        createdAt: new Date().toISOString(),
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Void/Cancel a sale: Restores stock and reverses customer balance
export async function cancelSale(sale: Sale, reason: string): Promise<void> {
  const path = `sales/${sale.id}`;
  try {
    await updateDoc(doc(db, 'sales', sale.id), {
      status: 'Cancelled',
      notes: `${sale.notes ? sale.notes + ' | ' : ''}Cancelled: ${reason}`,
    });

    // 1. Restore product stock
    for (const item of sale.items) {
      if (item.productId) {
        const prodRef = doc(db, 'products', item.productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const curStock = (prodSnap.data().currentStock as number) || 0;
          await updateDoc(prodRef, {
            currentStock: curStock + item.quantity,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    // 2. Reverse customer balances
    if (sale.customerId) {
      const custRef = doc(db, 'customers', sale.customerId);
      const custSnap = await getDoc(custRef);
      if (custSnap.exists()) {
        const cData = custSnap.data();
        const curPurchases = (cData.totalPurchases as number) || 0;
        const curPaid = (cData.totalPaid as number) || 0;
        const curOutstanding = (cData.outstandingBalance as number) || 0;
        const curAdvance = (cData.advanceBalance as number) || 0;

        await updateDoc(custRef, {
          totalPurchases: Math.max(0, curPurchases - sale.total),
          totalPaid: Math.max(0, curPaid - sale.paidAmount),
          outstandingBalance: Math.max(0, curOutstanding - sale.remainingAmount),
          advanceBalance: curAdvance + (sale.advanceUsed || 0),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ========================
// REPAIRS & SERVICE
// ========================
export function subscribeRepairs(onUpdate: (repairs: Repair[]) => void) {
  const path = 'repairs';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Repair));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createRepair(repairData: Omit<Repair, 'id' | 'createdAt'>): Promise<string> {
  const path = 'repairs';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...repairData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // If advance payment was made at intake, log payment
    if (repairData.advancePayment > 0) {
      await addDoc(collection(db, 'repairPayments'), {
        repairId: repairData.repairId,
        customerName: repairData.customerName,
        amount: repairData.advancePayment,
        paymentDate: repairData.receivedDate,
        paymentMethod: 'Cash',
        paymentType: 'Advance',
        notes: `Advance for repair ${repairData.repairId}`,
        createdAt: new Date().toISOString(),
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateRepair(repairId: string, updates: Partial<Repair>): Promise<void> {
  const path = `repairs/${repairId}`;
  try {
    await updateDoc(doc(db, 'repairs', repairId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteRepair(repairId: string): Promise<void> {
  const path = `repairs/${repairId}`;
  try {
    await deleteDoc(doc(db, 'repairs', repairId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeRepairPayments(onUpdate: (payments: RepairPayment[]) => void) {
  const path = 'repairPayments';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RepairPayment));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function recordRepairPayment(
  repairDocId: string,
  repairId: string,
  customerName: string,
  amount: number,
  paymentDate: string,
  paymentMethod: RepairPayment['paymentMethod'],
  paymentType: RepairPayment['paymentType'],
  notes?: string
): Promise<string> {
  const path = 'repairPayments';
  try {
    const docRef = await addDoc(collection(db, path), {
      repairId,
      customerName,
      amount,
      paymentDate,
      paymentMethod,
      paymentType,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    });

    // Update remainingAmount on repair document
    const repairRef = doc(db, 'repairs', repairDocId);
    const repairSnap = await getDoc(repairRef);
    if (repairSnap.exists()) {
      const rData = repairSnap.data();
      const currentRemaining = (rData.remainingAmount as number) || 0;
      const currentFinal = (rData.finalPayment as number) || 0;
      const newRemaining = Math.max(0, currentRemaining - amount);

      await updateDoc(repairRef, {
        remainingAmount: newRemaining,
        finalPayment: paymentType === 'Final' ? amount : currentFinal + amount,
        updatedAt: new Date().toISOString(),
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ========================
// EXPENSES
// ========================
export function subscribeExpenses(onUpdate: (expenses: Expense[]) => void) {
  const path = 'expenses';
  const q = query(collection(db, path), orderBy('expenseDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function addExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<string> {
  const path = 'expenses';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...expenseData,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const path = `expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ========================
// INITIAL SEEDING HELPER
// ========================
export async function seedInitialShopData(): Promise<{ brandsAdded: number; productsAdded: number }> {
  // Check if brands exist
  const existingBrands = await getBrands();
  let brandsAdded = 0;
  let productsAdded = 0;

  if (existingBrands.length === 0) {
    const defaultBrands = [
      { name: 'Usha', category: 'Machines & Parts', description: 'Domestic & umbrella sewing machines' },
      { name: 'Singer', category: 'Machines & Parts', description: 'Heritage sewing machines and heavy duty units' },
      { name: 'Merrit', category: 'Machines & Parts', description: 'Traditional domestic sewing machines' },
      { name: 'Brother', category: 'Machines', description: 'Electronic and modern sewing machines' },
      { name: 'Juki', category: 'Industrial', description: 'High-speed industrial lockstitch machines' },
      { name: 'Jack', category: 'Industrial', description: 'Direct drive industrial computerized machines' },
      { name: 'Organ Needles', category: 'Needles', description: 'Quality sewing machine needles (DBx1, DPx5, HAx1)' },
      { name: 'Moon Threads', category: 'Threads', description: 'High tenacity sewing threads' },
      { name: 'Koban', category: 'Rotary Hooks', description: 'Precision rotary hooks and shuttles' },
      { name: 'Golden Eagle', category: 'Spare Parts', description: 'Presser feet, feed dogs, needle plates' },
      { name: 'Towa', category: 'Accessories', description: 'Bobbin tension gauges and bobbins' },
      { name: 'Yamato', category: 'Spare Parts', description: 'Overlock machine loopers and cutters' },
      { name: 'Silver Star', category: 'Pressing', description: 'Industrial steam irons and accessories' },
      { name: 'Hirose Hook', category: 'Rotary Hooks', description: 'Japanese precision rotary hooks' },
      { name: 'Pegasus', category: 'Industrial', description: 'Specialized chainstitch and interlock' },
    ];

    for (const b of defaultBrands) {
      await addBrand(b.name, b.category, b.description);
      brandsAdded++;
    }
  }

  // Check if products exist
  const existingProducts = await getProducts();
  if (existingProducts.length === 0) {
    const initialProducts: Omit<Product, 'id' | 'createdAt'>[] = [
      {
        name: 'Usha Anand Domestic Sewing Machine (Head Only)',
        sku: 'USHA-ANAND-01',
        category: 'Sewing Machines',
        brand: 'Usha',
        model: 'Anand DLX',
        description: 'Traditional cast iron domestic sewing machine suitable for daily household sewing and tailoring work.',
        purchasePrice: 3800,
        sellingPrice: 4600,
        currentStock: 8,
        minStock: 2,
        unit: 'Pcs',
        status: 'Active',
        serialNumber: 'USH-AN-2026-081',
        warrantyPeriod: '1 Year Manufacturer Warranty',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Singer Tailor Deluxe Umbrella Machine (Full Set with Stand & Table)',
        sku: 'SNG-UMB-SET',
        category: 'Sewing Machines',
        brand: 'Singer',
        model: 'Tailor Deluxe Umbrella',
        description: 'Heavy duty umbrella model sewing machine with wooden table and cast iron stand for boutique & master tailoring.',
        purchasePrice: 7200,
        sellingPrice: 8800,
        currentStock: 5,
        minStock: 2,
        unit: 'Set',
        status: 'Active',
        serialNumber: 'SNG-TD-5042',
        warrantyPeriod: '2 Years Service Warranty',
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Jack F4 Direct Drive Industrial Lockstitch Machine',
        sku: 'JACK-F4-DIR',
        category: 'Sewing Machines',
        brand: 'Jack',
        model: 'F4 Power Saver',
        description: 'Energy-saving direct drive industrial lockstitch machine with built-in LED needle light and speed control panel.',
        purchasePrice: 19500,
        sellingPrice: 23500,
        currentStock: 3,
        minStock: 1,
        unit: 'Set',
        status: 'Active',
        serialNumber: 'JK-F4-98124',
        warrantyPeriod: '3 Years Motor & Electronic Warranty',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Shuttle Race Assembly for Domestic & Umbrella Machines',
        sku: 'PART-SHT-RACE',
        category: 'Spare Parts',
        brand: 'Golden Eagle',
        model: 'Universal Domestic/Umbrella',
        description: 'Hardened steel complete shuttle race body and driver for smooth stitching without thread breakage.',
        purchasePrice: 120,
        sellingPrice: 220,
        currentStock: 25,
        minStock: 5,
        unit: 'Pcs',
        status: 'Active',
        partNumber: 'SR-DOM-01',
        compatibleModels: 'Usha, Singer, Merrit Domestic & Umbrella Models',
        imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Organ Needles HAx1 (Size 14/90, 16/100, 18/110) - Box of 10 Packets',
        sku: 'ORG-HA1-MIX',
        category: 'Spare Parts',
        brand: 'Organ Needles',
        model: 'HAx1 Domestic',
        description: 'Genuine Japanese Organ domestic sewing machine needles suitable for cotton, polyester, and denim fabrics.',
        purchasePrice: 180,
        sellingPrice: 280,
        currentStock: 40,
        minStock: 10,
        unit: 'Box',
        status: 'Active',
        partNumber: 'ORG-HA1-16',
        compatibleModels: 'All domestic & umbrella sewing machines',
        imageUrl: 'https://images.unsplash.com/photo-1617058866504-d4b684cb03a7?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Heavy Duty Sewing Machine Motor with Speed Foot Pedal (1/12 HP)',
        sku: 'ACC-MOT-PED',
        category: 'Accessories',
        brand: 'Singer',
        model: 'Copper Wound 8000 RPM',
        description: 'Copper winding electric motor attachment for manual sewing machines, includes variable speed foot controller and belt.',
        purchasePrice: 650,
        sellingPrice: 950,
        currentStock: 12,
        minStock: 3,
        unit: 'Set',
        status: 'Active',
        compatibleModels: 'Usha, Singer, Merrit, Rita and standard umbrella machines',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Stainless Steel Bobbin & Heavy Bobbin Case Set',
        sku: 'ACC-BOB-SET',
        category: 'Accessories',
        brand: 'Towa',
        model: 'Standard Umbrella',
        description: 'Pack of 5 high polish steel bobbins with 1 spring tension umbrella bobbin case.',
        purchasePrice: 90,
        sellingPrice: 160,
        currentStock: 35,
        minStock: 8,
        unit: 'Set',
        status: 'Active',
        compatibleModels: 'Domestic & Umbrella machines',
        imageUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
      },
    ];

    for (const p of initialProducts) {
      await addProduct(p);
      productsAdded++;
    }
  }

  return { brandsAdded, productsAdded };
}
