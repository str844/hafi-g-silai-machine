/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout, type AdminSection } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ProductsPage as PublicProductsPage } from './pages/public/ProductsPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';

// Admin Pages
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProductsPage as AdminProductsPage } from './pages/admin/ProductsPage';
import { PurchasesPage } from './pages/admin/PurchasesPage';
import { SuppliersPage } from './pages/admin/SuppliersPage';
import { SalesPage } from './pages/admin/SalesPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { RepairsPage } from './pages/admin/RepairsPage';
import { ExpensesPage } from './pages/admin/ExpensesPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { GoogleWorkspacePage } from './pages/admin/GoogleWorkspacePage';

// Firebase Subscriptions & Seeder
import {
  DEFAULT_SETTINGS,
  subscribeBusinessSettings,
  subscribeProducts,
  subscribeBrands,
  subscribeSuppliers,
  subscribeSupplierPayments,
  subscribePurchases,
  subscribeCustomers,
  subscribeCustomerPayments,
  subscribeSales,
  subscribeRepairs,
  subscribeRepairPayments,
  subscribeExpenses,
  seedInitialShopData,
} from './firebase/services';

import type {
  BusinessSettings,
  Product,
  Brand,
  Supplier,
  SupplierPayment,
  Purchase,
  Customer,
  CustomerPayment,
  Sale,
  Repair,
  RepairPayment,
  Expense,
} from './types';

function MainApp() {
  const { user, loading: authLoading } = useAuth();

  // Navigation State
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [publicPage, setPublicPage] = useState<string>('home');
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');

  // Live Data State
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [repairPayments, setRepairPayments] = useState<RepairPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Inter-modal / detail state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null);
  const [selectedRepairForDetail, setSelectedRepairForDetail] = useState<Repair | null>(null);
  const [isNewRepairModalOpen, setIsNewRepairModalOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Listen for Google Maps quota exceeded events
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Subscribe to live Firestore collections
  useEffect(() => {
    const unsubSettings = subscribeBusinessSettings(setSettings);
    const unsubProducts = subscribeProducts(setProducts);
    const unsubBrands = subscribeBrands(setBrands);
    const unsubSuppliers = subscribeSuppliers(setSuppliers);
    const unsubSupplierPayments = subscribeSupplierPayments(setSupplierPayments);
    const unsubPurchases = subscribePurchases(setPurchases);
    const unsubCustomers = subscribeCustomers(setCustomers);
    const unsubCustomerPayments = subscribeCustomerPayments(setCustomerPayments);
    const unsubSales = subscribeSales(setSales);
    const unsubRepairs = subscribeRepairs(setRepairs);
    const unsubRepairPayments = subscribeRepairPayments(setRepairPayments);
    const unsubExpenses = subscribeExpenses(setExpenses);

    return () => {
      unsubSettings();
      unsubProducts();
      unsubBrands();
      unsubSuppliers();
      unsubSupplierPayments();
      unsubPurchases();
      unsubCustomers();
      unsubCustomerPayments();
      unsubSales();
      unsubRepairs();
      unsubRepairPayments();
      unsubExpenses();
    };
  }, []);

  // Auto-seed sample catalog once if database is completely fresh
  useEffect(() => {
    const timer = setTimeout(() => {
      if (products.length === 0 && brands.length === 0) {
        seedInitialShopData().catch(console.error);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [products.length, brands.length]);

  // Handler for quick actions from sidebar/dashboard
  const handleQuickAction = (action: string) => {
    if (action === 'new-sale') {
      setAdminSection('sales');
    } else if (action === 'new-repair') {
      setAdminSection('repairs');
      setIsNewRepairModalOpen(true);
    }
  };

  // If in admin mode but not authenticated, render Login Page
  if (viewMode === 'admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Connecting to Hafiz G Silai Machine Management...</span>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <LoginPage
          settings={settings}
          onBackToPublic={() => setViewMode('public')}
        />
      );
    }

    // Authenticated Admin Portal
    return (
      <AdminLayout
        currentSection={adminSection}
        setCurrentSection={setAdminSection}
        onExitToPublic={() => setViewMode('public')}
        settings={settings}
        onQuickAction={handleQuickAction}
      >
        {adminSection === 'dashboard' && (
          <DashboardPage
            products={products}
            customers={customers}
            suppliers={suppliers}
            sales={sales}
            repairs={repairs}
            expenses={expenses}
            settings={settings}
            onNavigateSection={(sec) => setAdminSection(sec)}
            onViewSaleInvoice={(sale) => setSelectedSaleForInvoice(sale)}
            onViewRepairDetail={(rep) => setSelectedRepairForDetail(rep)}
            onOpenNewSale={() => setAdminSection('sales')}
            onOpenNewRepair={() => {
              setAdminSection('repairs');
              setIsNewRepairModalOpen(true);
            }}
          />
        )}

        {adminSection === 'products' && (
          <AdminProductsPage products={products} brands={brands} />
        )}

        {adminSection === 'purchases' && (
          <PurchasesPage
            purchases={purchases}
            suppliers={suppliers}
            products={products}
            onOpenNewSupplier={() => setAdminSection('suppliers')}
          />
        )}

        {adminSection === 'suppliers' && (
          <SuppliersPage
            suppliers={suppliers}
            supplierPayments={supplierPayments}
            purchases={purchases}
          />
        )}

        {adminSection === 'sales' && (
          <SalesPage
            sales={sales}
            customers={customers}
            products={products}
            settings={settings}
            onOpenNewCustomer={() => setAdminSection('customers')}
            selectedSaleForInvoice={selectedSaleForInvoice}
            setSelectedSaleForInvoice={setSelectedSaleForInvoice}
          />
        )}

        {adminSection === 'customers' && (
          <CustomersPage
            customers={customers}
            customerPayments={customerPayments}
            sales={sales}
            repairs={repairs}
            settings={settings}
          />
        )}

        {adminSection === 'repairs' && (
          <RepairsPage
            repairs={repairs}
            repairPayments={repairPayments}
            settings={settings}
            selectedRepairForDetail={selectedRepairForDetail}
            setSelectedRepairForDetail={setSelectedRepairForDetail}
            isNewRepairModalOpen={isNewRepairModalOpen}
            setIsNewRepairModalOpen={setIsNewRepairModalOpen}
          />
        )}

        {adminSection === 'expenses' && <ExpensesPage expenses={expenses} />}

        {adminSection === 'reports' && (
          <ReportsPage
            sales={sales}
            purchases={purchases}
            expenses={expenses}
            customers={customers}
            suppliers={suppliers}
            products={products}
            repairs={repairs}
            settings={settings}
          />
        )}

        {adminSection === 'workspace' && (
          <GoogleWorkspacePage
            products={products}
            customers={customers}
            suppliers={suppliers}
            sales={sales}
            repairs={repairs}
            expenses={expenses}
            settings={settings}
          />
        )}

        {adminSection === 'settings' && (
          <SettingsPage
            settings={settings}
            onRefreshData={() => {
              // triggers re-read via live listeners
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // Public Store Website
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-gray-900">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar
        settings={settings}
        activePage={publicPage}
        setActivePage={setPublicPage}
        onOpenAdmin={() => setViewMode('admin')}
      />

      <main className="flex-1">
        {publicPage === 'home' && (
          <HomePage
            settings={settings}
            products={products}
            onNavigate={(page) => {
              setPublicPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              setPublicPage('products');
            }}
          />
        )}

        {publicPage === 'products' && (
          <PublicProductsPage
            settings={settings}
            products={products}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
          />
        )}

        {publicPage === 'services' && <ServicesPage settings={settings} />}

        {publicPage === 'about' && <AboutPage settings={settings} />}

        {publicPage === 'contact' && <ContactPage settings={settings} />}
      </main>

      <Footer
        settings={settings}
        setActivePage={setPublicPage}
        onOpenAdmin={() => setViewMode('admin')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
