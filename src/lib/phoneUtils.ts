
/**
 * Normalizes a phone number to +91XXXXXXXXXX format for backend
 * @param phone - Raw phone input
 * @returns Normalized string
 */
export const normalizePhoneForBackend = (phone: string): string => {
  if (!phone) return "";
  
  // Remove non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // If 10 digits, add +91
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // If 12 digits starting with 91, add +
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }

  // If already matches +91XXXXXXXXXX
  if (cleaned.length === 13 && cleaned.startsWith("+91")) {
    return cleaned;
  }

  return cleaned;
};

/**
 * Formats a phone number for display: +91 98765 43210
 * @param phone - Normalized phone from backend (+91XXXXXXXXXX)
 * @returns Formatted string
 */
export const formatPhoneForDisplay = (phone: string | null): string => {
  if (!phone) return "N/A";
  
  // Return normalized format without extra spaces for professional consistency
  return normalizePhoneForBackend(phone);
};

/**
 * Validates if a phone input is a valid 10-digit number (optionally with +91)
 */
export const isValidPhone = (phone: string): boolean => {
  const normalized = normalizePhoneForBackend(phone);
  return /^\+91\d{10}$/.test(normalized);
};
