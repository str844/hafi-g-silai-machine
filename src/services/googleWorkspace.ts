import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import type { Product, Customer, Supplier, Sale, Repair, Expense, BusinessSettings } from '../types';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

// In-memory token cache (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export function getCachedToken(): string | null {
  return cachedAccessToken;
}

export function setCachedToken(token: string | null) {
  cachedAccessToken = token;
}

/**
 * Initiates client-side Google OAuth popup requesting Google Drive and Google Sheets scopes.
 */
export async function authenticateGoogleWorkspace(): Promise<{ user: User; accessToken: string }> {
  const provider = new GoogleAuthProvider();
  for (const scope of WORKSPACE_SCOPES) {
    provider.addScope(scope);
  }
  provider.setCustomParameters({
    prompt: 'consent',
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error('Failed to retrieve Google Workspace access token. Please grant permissions.');
  }

  cachedAccessToken = credential.accessToken;
  return { user: result.user, accessToken: cachedAccessToken };
}

/**
 * Ensures a valid access token is available.
 */
export async function requireAccessToken(): Promise<string> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  const { accessToken } = await authenticateGoogleWorkspace();
  return accessToken;
}

/* -------------------------------------------------------------
 * GOOGLE DRIVE FUNCTIONS
 * ----------------------------------------------------------- */

export interface DriveBackupFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  webViewLink?: string;
}

/**
 * Backs up all shop data into a JSON file stored in Google Drive.
 */
export async function backupShopDataToGoogleDrive(snapshot: {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  repairs: Repair[];
  expenses: Expense[];
  settings: BusinessSettings;
}): Promise<{ fileId: string; fileName: string; webViewLink?: string }> {
  const token = await requireAccessToken();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Hafiz_G_Silai_Backup_${dateStr}.json`;

  const payload = {
    businessName: 'Hafiz G Silai Machine',
    location: 'Bhatti Chowk, Rajnagar, Madhubani, Bihar',
    exportedAt: new Date().toISOString(),
    version: '1.0',
    data: snapshot,
  };

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Hafiz G Silai Machine full shop database backup',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(payload, null, 2) +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive upload failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    fileId: result.id,
    fileName: result.name,
    webViewLink: result.webViewLink,
  };
}

/**
 * Lists backups in Google Drive created for this shop.
 */
export async function listShopBackupsFromDrive(): Promise<DriveBackupFile[]> {
  const token = await requireAccessToken();
  const query = "name contains 'Hafiz_G_Silai' and trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,size,createdTime,webViewLink)&orderBy=createdTime desc&pageSize=30`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list Google Drive files: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Deletes a file from Google Drive (Mandatory user confirmation must precede this call).
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = await requireAccessToken();
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.ok;
}

/* -------------------------------------------------------------
 * GOOGLE SHEETS FUNCTIONS
 * ----------------------------------------------------------- */

export interface ExportSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  rowCount: number;
}

/**
 * Exports Sales Register to a new Google Spreadsheet.
 */
export async function exportSalesToGoogleSheet(
  sales: Sale[],
  customers: Customer[]
): Promise<ExportSheetResult> {
  const token = await requireAccessToken();
  const dateFormatted = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
  const title = `Hafiz G Silai Machine - Sales Register (${dateFormatted})`;

  // 1. Create spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Sales Register',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${createRes.status} - ${err}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Prepare rows
  const headerRow = [
    'Invoice Number',
    'Date',
    'Customer Name',
    'Customer Phone',
    'Payment Mode',
    'Total Amount (₹)',
    'Paid / Advance (₹)',
    'Due / Udhaari (₹)',
    'Status',
    'Items Summary',
  ];

  const customerMap = new Map(customers.map((c) => [c.id, c]));

  const dataRows = sales.map((s) => {
    const cust = customerMap.get(s.customerId);
    const custName = cust ? cust.name : s.customerName || 'Walk-in Customer';
    const custPhone = cust ? cust.phone : s.customerPhone || '';
    const itemsSummary = s.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ');

    return [
      s.invoiceNumber || s.id.slice(0, 8),
      s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-IN') : '',
      custName,
      custPhone,
      s.paymentMethod,
      s.total,
      s.paidAmount,
      s.remainingAmount,
      s.status,
      itemsSummary,
    ];
  });

  const allValues = [headerRow, ...dataRows];

  // 3. Write data
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sales%20Register!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Sales Register!A1',
        majorDimension: 'ROWS',
        values: allValues,
      }),
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.text();
    throw new Error(`Failed to write sales rows to Google Sheet: ${appendRes.status} - ${err}`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    rowCount: dataRows.length,
  };
}

/**
 * Exports Product Inventory & Stock to a new Google Spreadsheet.
 */
export async function exportInventoryToGoogleSheet(products: Product[]): Promise<ExportSheetResult> {
  const token = await requireAccessToken();
  const dateFormatted = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
  const title = `Hafiz G Silai Machine - Product Inventory (${dateFormatted})`;

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: {
            title: 'Inventory',
            gridProperties: { frozenRowCount: 1 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create inventory sheet: ${createRes.status} - ${err}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  const headerRow = [
    'SKU',
    'Product Name',
    'Category',
    'Brand',
    'Model',
    'Purchase Price (₹)',
    'Selling Price (₹)',
    'Current Stock',
    'Total Stock Value (₹)',
    'Status',
  ];

  const dataRows = products.map((p) => [
    p.sku || '',
    p.name,
    p.category,
    p.brand,
    p.model || '',
    p.purchasePrice,
    p.sellingPrice,
    p.currentStock,
    p.currentStock * p.sellingPrice,
    p.status,
  ]);

  const allValues = [headerRow, ...dataRows];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Inventory!A1',
        majorDimension: 'ROWS',
        values: allValues,
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    rowCount: dataRows.length,
  };
}

/**
 * Exports Customer Ledger and Udhaari balances to a new Google Spreadsheet.
 */
export async function exportCustomerLedgerToGoogleSheet(
  customers: Customer[]
): Promise<ExportSheetResult> {
  const token = await requireAccessToken();
  const dateFormatted = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
  const title = `Hafiz G Silai Machine - Customer Udhaari Ledger (${dateFormatted})`;

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: {
            title: 'Udhaari Ledger',
            gridProperties: { frozenRowCount: 1 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create ledger sheet: ${createRes.status} - ${err}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  const headerRow = [
    'Customer Name',
    'Phone',
    'Address / Village',
    'Total Purchases (₹)',
    'Total Paid (₹)',
    'Pending Udhaari / Due (₹)',
    'Advance Balance (₹)',
    'Status',
  ];

  const dataRows = customers.map((c) => [
    c.name,
    c.phone,
    c.address || '',
    c.totalPurchases || 0,
    c.totalPaid || 0,
    c.outstandingBalance || 0,
    c.advanceBalance || 0,
    (c.outstandingBalance || 0) > 0 ? 'Pending Udhaari' : 'Clear',
  ]);

  const allValues = [headerRow, ...dataRows];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Udhaari%20Ledger!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Udhaari Ledger!A1',
        majorDimension: 'ROWS',
        values: allValues,
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    rowCount: dataRows.length,
  };
}
