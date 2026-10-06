import React, { useState, useEffect } from 'react';
import {
  Cloud,
  FileSpreadsheet,
  HardDrive,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import {
  authenticateGoogleWorkspace,
  backupShopDataToGoogleDrive,
  listShopBackupsFromDrive,
  deleteDriveFile,
  exportSalesToGoogleSheet,
  exportInventoryToGoogleSheet,
  exportCustomerLedgerToGoogleSheet,
  getCachedToken,
  type DriveBackupFile,
  type ExportSheetResult,
} from '../../services/googleWorkspace';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { Product, Customer, Supplier, Sale, Repair, Expense, BusinessSettings } from '../../types';

interface GoogleWorkspacePageProps {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  repairs: Repair[];
  expenses: Expense[];
  settings: BusinessSettings;
}

export const GoogleWorkspacePage: React.FC<GoogleWorkspacePageProps> = ({
  products,
  customers,
  suppliers,
  sales,
  repairs,
  expenses,
  settings,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [backups, setBackups] = useState<DriveBackupFile[]>([]);
  const [exportedSheets, setExportedSheets] = useState<ExportSheetResult[]>([]);

  // Action loaders & messages
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Destructive confirmation state
  const [fileToDelete, setFileToDelete] = useState<DriveBackupFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (getCachedToken()) {
      setIsConnected(true);
      fetchBackups();
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setStatusMessage(null);
    try {
      await authenticateGoogleWorkspace();
      setIsConnected(true);
      setStatusMessage({
        type: 'success',
        text: 'Successfully connected Google Drive and Google Sheets!',
      });
      fetchBackups();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Google Workspace authentication failed',
      });
    } finally {
      setConnecting(false);
    }
  };

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const files = await listShopBackupsFromDrive();
      setBackups(files);
    } catch (err) {
      console.warn('Could not load drive backups:', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleBackupToDrive = async () => {
    setIsBackingUp(true);
    setStatusMessage(null);
    try {
      const res = await backupShopDataToGoogleDrive({
        products,
        customers,
        suppliers,
        sales,
        repairs,
        expenses,
        settings,
      });
      setStatusMessage({
        type: 'success',
        text: `Shop database successfully backed up to Google Drive: ${res.fileName}`,
      });
      fetchBackups();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Backup to Google Drive failed',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExportSales = async () => {
    setExportingType('sales');
    setStatusMessage(null);
    try {
      const res = await exportSalesToGoogleSheet(sales, customers);
      setExportedSheets((prev) => [res, ...prev.filter((s) => s.spreadsheetId !== res.spreadsheetId)]);
      setStatusMessage({
        type: 'success',
        text: `Exported ${res.rowCount} sales records to Google Sheets: "${res.title}"`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Export to Google Sheets failed',
      });
    } finally {
      setExportingType(null);
    }
  };

  const handleExportInventory = async () => {
    setExportingType('inventory');
    setStatusMessage(null);
    try {
      const res = await exportInventoryToGoogleSheet(products);
      setExportedSheets((prev) => [res, ...prev.filter((s) => s.spreadsheetId !== res.spreadsheetId)]);
      setStatusMessage({
        type: 'success',
        text: `Exported ${res.rowCount} products to Google Sheets: "${res.title}"`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Export to Google Sheets failed',
      });
    } finally {
      setExportingType(null);
    }
  };

  const handleExportLedger = async () => {
    setExportingType('ledger');
    setStatusMessage(null);
    try {
      const res = await exportCustomerLedgerToGoogleSheet(customers);
      setExportedSheets((prev) => [res, ...prev.filter((s) => s.spreadsheetId !== res.spreadsheetId)]);
      setStatusMessage({
        type: 'success',
        text: `Exported ${res.rowCount} customer balances to Google Sheets: "${res.title}"`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Export to Google Sheets failed',
      });
    } finally {
      setExportingType(null);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setBackups((prev) => prev.filter((b) => b.id !== fileToDelete.id));
      setStatusMessage({
        type: 'success',
        text: `File "${fileToDelete.name}" was removed from Google Drive.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete file from Google Drive',
      });
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Integration Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Cloud className="w-4 h-4" />
              <span>Google Workspace Integration</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Google Drive & Google Sheets Hub</h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl leading-relaxed">
              Securely store shop backups in Google Drive and export real-time sales registers, inventory,
              and customer ledgers directly to Google Sheets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2 bg-emerald-700/80 px-4 py-2 rounded-xl border border-emerald-500/30 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Connected to Google Workspace</span>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 hover:bg-slate-100 font-semibold text-xs rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{connecting ? 'Authorizing...' : 'Connect Google Workspace'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Google Drive Storage</h3>
                  <p className="text-xs text-gray-500">Automated full shop backups & cloud vault</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                Drive v3 API
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Create an immutable snapshot of all products, sales invoices, repair jobs, customer dues,
              and supplier accounts directly into your personal Google Drive folder.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>Total Shop Products:</span>
                <span className="font-bold text-gray-900">{products.length} items</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Sales Recorded:</span>
                <span className="font-bold text-gray-900">{sales.length} invoices</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Customer Ledger Accounts:</span>
                <span className="font-bold text-gray-900">{customers.length} customers</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Repair / Service Records:</span>
                <span className="font-bold text-gray-900">{repairs.length} jobs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleBackupToDrive}
              disabled={isBackingUp}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isBackingUp ? 'animate-bounce' : ''}`} />
              <span>{isBackingUp ? 'Uploading to Drive...' : 'Backup Full Database to Drive'}</span>
            </button>
            <button
              onClick={fetchBackups}
              disabled={loadingBackups}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold text-xs rounded-xl transition"
              title="Refresh files"
            >
              <RefreshCw className={`w-4 h-4 ${loadingBackups ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Google Sheets Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Google Sheets Ledgers</h3>
                  <p className="text-xs text-gray-500">Live spreadsheet reports & exports</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Sheets v4 API
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Export your sales records, current sewing machine stock, and customer udhaari dues into
              professionally formatted Google Sheets with one click.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button
                onClick={handleExportSales}
                disabled={exportingType !== null}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition group"
              >
                <div className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 mb-1">
                  Sales Register
                </div>
                <div className="text-[11px] text-gray-500">
                  {exportingType === 'sales' ? 'Exporting...' : 'Export sales & invoices'}
                </div>
              </button>

              <button
                onClick={handleExportInventory}
                disabled={exportingType !== null}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition group"
              >
                <div className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 mb-1">
                  Inventory Stock
                </div>
                <div className="text-[11px] text-gray-500">
                  {exportingType === 'inventory' ? 'Exporting...' : 'Export stock valuation'}
                </div>
              </button>

              <button
                onClick={handleExportLedger}
                disabled={exportingType !== null}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition group"
              >
                <div className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 mb-1">
                  Udhaari Ledger
                </div>
                <div className="text-[11px] text-gray-500">
                  {exportingType === 'ledger' ? 'Exporting...' : 'Export pending dues'}
                </div>
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Spreadsheets are saved in your Google Account with full read/write access.</span>
          </div>
        </div>
      </div>

      {/* Exported Spreadsheets Recent List */}
      {exportedSheets.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Recently Created Google Sheets</span>
            </h3>
            <span className="text-xs text-gray-500">{exportedSheets.length} sheets created</span>
          </div>

          <div className="divide-y divide-slate-100">
            {exportedSheets.map((sheet) => (
              <div
                key={sheet.spreadsheetId}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{sheet.title}</h4>
                    <span className="text-[11px] text-gray-500">{sheet.rowCount} rows populated</span>
                  </div>
                </div>
                <a
                  href={sheet.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <span>Open in Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google Drive Backups List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span>Google Drive Backup Files</span>
          </h3>
          <span className="text-xs text-gray-500">
            {backups.length > 0 ? `${backups.length} backup snapshots` : 'No backups found yet'}
          </span>
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <HardDrive className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">No Google Drive backups yet</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Click &quot;Backup Full Database to Drive&quot; above to create your first cloud backup.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{backup.name}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                      <span>Created: {new Date(backup.createdTime).toLocaleString('en-IN')}</span>
                      {backup.size && <span>Size: {(Number(backup.size) / 1024).toFixed(1)} KB</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {backup.webViewLink && (
                    <a
                      href={backup.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-semibold rounded-lg transition"
                    >
                      <span>View in Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setFileToDelete(backup)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete backup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory User Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Google Drive Backup?"
          message={`Are you sure you want to delete "${fileToDelete.name}" from your Google Drive? This action cannot be undone.`}
          confirmText="Yes, Delete File"
          cancelText="Cancel"
          isDestructive={true}
          isLoading={isDeleting}
          onConfirm={confirmDeleteFile}
          onCancel={() => setFileToDelete(null)}
        />
      )}
    </div>
  );
};
