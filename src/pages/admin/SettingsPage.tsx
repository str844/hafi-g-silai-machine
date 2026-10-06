import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building,
  Receipt,
  Package,
  Database,
  Sparkles,
  MapPin,
  Navigation,
} from 'lucide-react';
import { updateBusinessSettings, seedInitialShopData } from '../../firebase/services';
import { GoogleShopMap, SHOP_COORDINATES } from '../../components/common/GoogleShopMap';
import type { BusinessSettings } from '../../types';

interface SettingsPageProps {
  settings: BusinessSettings;
  onRefreshData?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onRefreshData }) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBusinessSettings(formData);
      showToast('Business settings saved successfully.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await seedInitialShopData();
      showToast(
        `Catalog initialized: ${res.brandsAdded} brands & ${res.productsAdded} starter products added.`
      );
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to seed sample catalog.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
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
      <div>
        <h2 className="text-lg font-bold text-gray-900">Shop Settings & Configuration</h2>
        <p className="text-xs text-gray-500">
          Update business profile, contact numbers, billing options, and inventory rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Store & Contact Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Shop Physical Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Phone Number (Calls) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Alternate Phone Number
              </label>
              <input
                type="tel"
                value={formData.alternatePhone || ''}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                placeholder="e.g. 7488473065"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">About Business (Public Website)</label>
            <textarea
              rows={3}
              value={formData.aboutText}
              onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Section: Google Maps Storefront Location */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Google Maps Storefront Location</span>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${SHOP_COORDINATES.lat},${SHOP_COORDINATES.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition"
            >
              <Navigation className="w-3 h-3" />
              <span>Test Route on Maps</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-gray-500 block mb-0.5">Physical Store Geolocation</span>
              <div className="font-mono text-gray-800 font-bold">
                {SHOP_COORDINATES.lat}° N, {SHOP_COORDINATES.lng}° E
              </div>
              <span className="text-[11px] text-gray-500 block mt-1">
                Bhatti Chowk, Rajnagar, Madhubani, Bihar
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-gray-500 block mb-0.5">Google Maps Platform SDK</span>
              <div className="font-semibold text-emerald-700">@vis.gl/react-google-maps</div>
              <span className="text-[11px] text-gray-500 block mt-1">
                Integrated with AdvancedMarker and interactive Directions
              </span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200">
            <GoogleShopMap height="260px" />
          </div>
        </div>

        {/* Section 2: Invoice & Tax Settings */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Invoice & Tax (GST) Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Invoice Number Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                placeholder="e.g. HGS-"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="font-semibold text-gray-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.gstEnabled}
                  onChange={(e) => setFormData({ ...formData, gstEnabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Enable GST calculations on sales invoices (OFF by default)</span>
              </label>
              <p className="text-[11px] text-gray-500 mt-1">
                If enabled, invoices will calculate CGST and SGST using the default rate below.
              </p>
            </div>
          </div>

          {formData.gstEnabled && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 w-48">
              <label className="block font-medium text-gray-700 mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                value={formData.defaultGstPercent}
                onChange={(e) =>
                  setFormData({ ...formData, defaultGstPercent: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-center"
              />
            </div>
          )}
        </div>

        {/* Section 3: Stock Settings */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Stock & Inventory Rules</span>
          </div>

          <div className="space-y-3">
            <label className="font-semibold text-gray-800 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowNegativeStock}
                onChange={(e) => setFormData({ ...formData, allowNegativeStock: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Allow negative stock (Permits selling even when stock is 0)</span>
            </label>
            <p className="text-[11px] text-gray-500">
              Disabled by default. When disabled, the system will prevent billing more units than
              recorded in inventory.
            </p>

            <div className="w-48 pt-2">
              <label className="block font-medium text-gray-700 mb-1">
                Low Stock Threshold (Units)
              </label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold"
              />
              <span className="text-[10px] text-gray-400">
                Products at or below this count trigger low-stock alerts.
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Database Seeding Utility */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Starter Catalog & Brand Initializer</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Need standard brands (Usha, Singer, Merrit, Juki, Jack, Organ Needles, Towa) and initial
          products seeded to your shop catalog? Click below to populate realistic sewing machines,
          spare parts, and accessories into Firestore.
        </p>
        <button
          type="button"
          disabled={seeding}
          onClick={handleSeedData}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{seeding ? 'Initializing...' : 'Initialize Starter Catalog & Brands'}</span>
        </button>
      </div>
    </div>
  );
};
