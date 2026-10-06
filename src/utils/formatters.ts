export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getWhatsAppUrl(phone: string = '7870493385', text?: string): string {
  const cleanPhone = (phone || '7870493385').replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone || '917870493385';
  if (text && text.trim()) {
    const encodedText = encodeURIComponent(text.trim());
    return `https://wa.me/${targetPhone}?text=${encodedText}`;
  }
  return `https://wa.me/${targetPhone}`;
}

export function generateInvoiceNumber(prefix: string = 'HGS-'): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}${year}${month}${day}-${randomSuffix}`;
}

export function generateRepairId(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `REP-${randomSuffix}`;
}
