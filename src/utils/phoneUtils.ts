/**
 * Phone and WhatsApp utility functions for Indian mobile numbers
 */

export const sanitizeWhatsAppNumber = (phone: string | undefined | null): string => {
  if (!phone) return '';
  // Remove all non-digits (spaces, dashes, parens, plus, etc.)
  let digits = phone.replace(/[^0-9]/g, '');
  
  // If starts with 091 and length >= 13 (e.g. 0919829011223)
  if (digits.startsWith('091') && digits.length >= 13) {
    digits = digits.slice(3);
  }

  // If starts with 910 and length >= 13 (e.g. 9109829011223)
  if (digits.startsWith('910') && digits.length >= 13) {
    digits = digits.slice(3);
  }

  // If starts with 0 and length is 11 (e.g. 09876543210), remove leading 0
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  // If 10 digits (standard Indian mobile e.g. 9829011223), prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  
  // If 12 digits and starts with 91 (already formatted e.g. 919829011223)
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  // If more than 12 digits, extract last 10 digits and prepend 91
  if (digits.length > 12) {
    const last10 = digits.slice(-10);
    return `91${last10}`;
  }
  
  return digits;
};

export const getClean10DigitPhone = (phone: string | undefined | null): string => {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
};

export const isValidIndianPhone = (phone: string | undefined | null): boolean => {
  const clean10 = getClean10DigitPhone(phone);
  // Valid Indian mobile numbers are 10 digits and typically start with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(clean10);
};

export const getWhatsAppUrl = (phone: string, message: string): string => {
  const cleanNumber = sanitizeWhatsAppNumber(phone);
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
};

export const getWhatsAppWaMeUrl = (phone: string, message: string): string => {
  const cleanNumber = sanitizeWhatsAppNumber(phone);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

export const getSMSUrl = (phone: string, message: string): string => {
  const clean10 = getClean10DigitPhone(phone);
  const targetNumber = clean10 ? `+91${clean10}` : phone;
  return `sms:${targetNumber}?body=${encodeURIComponent(message)}`;
};

/**
 * Direct WhatsApp Dispatcher:
 * Uses an anchor element click to guarantee it bypasses browser popup blockers
 * and directly launches the WhatsApp App on mobile or WhatsApp Web on desktop.
 */
export const openWhatsAppDirect = (phone: string, message: string): boolean => {
  const cleanNumber = sanitizeWhatsAppNumber(phone);
  if (!cleanNumber || cleanNumber.length < 10) return false;

  const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
  
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    window.open(url, '_blank');
    return true;
  }
};

/**
 * Direct SMS Dispatcher:
 * Launches the native SMS messaging app with phone & receipt text prefilled
 */
export const openSMSDirect = (phone: string, message: string): boolean => {
  const clean10 = getClean10DigitPhone(phone);
  if (!clean10) return false;

  const target = `+91${clean10}`;
  const url = `sms:${target}?body=${encodeURIComponent(message)}`;
  
  try {
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch {
    window.location.href = url;
    return true;
  }
};

/**
 * 1-Click Copy Receipt to Clipboard
 */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
};

export const formatDisplayPhone = (phone: string | undefined | null): string => {
  if (!phone) return '';
  const clean10 = getClean10DigitPhone(phone);
  if (clean10.length === 10) {
    return `+91 ${clean10.slice(0, 5)} ${clean10.slice(5)}`;
  }
  return phone;
};

