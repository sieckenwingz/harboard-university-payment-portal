import { getEnumKeyByValue } from "../helpers/EnumHelpers"

export enum Status{
    UNPAID = "Unpaid",
    PAID = "Paid",
    UNDER_REVIEW = "Under Review",
    REJECTED = "Rejected",
}

export function parseStatus(value: string): Status {
    if (value in Status) {
        return Status[value as keyof typeof Status]
    }
    throw Error;
}

export function statusToJson(value: Status): String | undefined {
    return getEnumKeyByValue(Status, value);
}

export const getStatus = (fee) => {
    const payment_id = fee['payment_id'];
    if (payment_id == null) {
      return Status.UNPAID;
    }
    return parseStatus(payment_id['status']);
  };