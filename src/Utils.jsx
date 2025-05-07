import { parseStatus, Status } from "./models/Status";
import { camelCase } from 'lodash';

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
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatAmount = (amount, minimumFractionDigits) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: minimumFractionDigits ?? 0 }).format(amount/100);
};

export const toCamelCase = (obj) => {
  const result = {};
  Object.keys(obj).forEach(key => {
    result[camelCase(key)] = obj[key];
  });
  return result;
};