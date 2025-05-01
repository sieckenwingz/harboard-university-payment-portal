import { parseStatus, Status } from "./models/Status";

export const getStatus = (fee) => {
  const payment_id = fee['payment_id'];
  if (payment_id == null) {
    return Status.UNPAID;
  }
  return parseStatus(payment_id['status']);
};

/**
 * Use to format date in the format 'MM/DD/YYYY'
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'MM/DD/YYYY';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (e) {
    return dateString; // Fallback to original format
  }
  };