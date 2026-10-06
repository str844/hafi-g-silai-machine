import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Receipt,
  Users,
  Wrench,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  PlusCircle,
  Cloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { BusinessSettings } from '../../types';

export type AdminSection =
  | 'dashboard'
  | 'products'
  | 'purchases'
  | 'suppliers'
  | 'sales'
  | 'customers'
  | 'repairs'
  | 'expenses'
  | 'reports'
  | 'workspace'
  | 'settings';

interface AdminLayoutProps {
  currentSection: AdminSection;
  setCurrentSection: (section: AdminSection) => void;
  onExitToPublic: () => void;
  settings: BusinessSettings;
  children: React.ReactNode;
  onQuickAction?: (action: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  setCurrentSection,
  onExitToPublic,
  settings,
  children,
  onQuickAction,
}) => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as AdminSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as AdminSection, label: 'Products & Stock', icon: Package },
    { id: 'purchases' as AdminSection, label: 'Purchases', icon: ShoppingBag },
    { id: 'suppliers' as AdminSection, label: 'Suppliers', icon: Truck },
    { id: 'sales' as AdminSection, label: 'Sales & Invoices', icon: Receipt },
    { id: 'customers' as AdminSection, label: 'Customers', icon: Users },
    { id: 'repairs' as AdminSection, label: 'Repairs & Service', icon: Wrench },
    { id: 'expenses' as AdminSection, label: 'Expenses', icon: DollarSign },
    { id: 'reports' as AdminSection, label: 'Reports', icon: BarChart3 },
    { id: 'workspace' as AdminSection, label: 'Drive & Sheets', icon: Cloud },
    { id: 'settings' as AdminSection, label: 'Settings', icon: Settings },
  ];

  const handleSelectSection = (section: AdminSection) => {
    setCurrentSection(section);
    setMobileSidebarOpen(false);
  };

  const currentItemTitle = menuItems.find((item) => item.id === currentSection)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              H
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white tracking-tight truncate">
                {settings.businessName || 'Hafiz G Silai Machine'}
              </h2>
              <span className="text-[11px] text-emerald-400 font-medium block">
                Admin Management
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectSection(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick action helper & Bottom profile */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {onQuickAction && (
            <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-slate-800">
              <button
                type="button"
                onClick={() => onQuickAction('new-sale')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-700/60 hover:bg-emerald-700 text-white rounded text-xs font-medium cursor-pointer transition-colors"
                title="Create New Sale"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Sale</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickAction('new-repair')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-indigo-700/60 hover:bg-indigo-700 text-white rounded text-xs font-medium cursor-pointer transition-colors"
                title="Intake Machine Repair"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Repair</span>
              </button>
            </div>
          )}

          <div className="px-2 py-1">
            <p className="text-[11px] text-slate-400 truncate">Logged in as:</p>
            <p className="text-xs font-medium text-slate-200 truncate">
              {user?.email || 'Shop Owner'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onExitToPublic}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Website</span>
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center justify-center p-2 text-xs font-medium text-red-400 hover:text-red-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <span className="font-bold text-sm truncate max-w-[170px]">
              {settings.businessName || 'Hafiz G Silai'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExitToPublic}
            className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Site</span>
          </button>
          <button
            onClick={() => logout()}
            className="p-1.5 text-red-400 hover:bg-slate-800 rounded"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-slate-900 text-slate-200 h-full flex flex-col z-10 p-4 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white font-bold">
                  H
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Hafiz G Silai Machine</h3>
                  <span className="text-[11px] text-emerald-400">Admin Control</span>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 px-1 truncate">
                User: {user?.email || 'Owner'}
              </div>
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  logout();
                }}
                className="w-full py-2 bg-red-950/50 hover:bg-red-900/60 text-red-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Top desktop header bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentItemTitle}</h1>
            <p className="text-xs text-gray-500">
              Hafiz G Silai Machine • Bhatti Chowk, Rajnagar, Madhubani
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database Connected
            </span>
            <button
              onClick={onExitToPublic}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Store</span>
            </button>
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto pb-16">{children}</main>
      </div>
    </div>
  );
};
