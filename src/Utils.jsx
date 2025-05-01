import { parseStatus, Status } from "./models/Status";

export const getStatus = (fee) => {
  const payment_id = fee['payment_id'];
  if (payment_id == null) {
    return Status.UNPAID;
  }
  return parseStatus(payment_id['status']);
};