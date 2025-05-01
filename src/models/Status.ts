export enum Status{
    UNPAID = "Unpaid",
    PAID = "Paid",
    UNDER_REVIEW = "Under Review",
    REJECTED = "Rejected",
}

export function parseStatus(value: string): Status | undefined {
    if (value in Status) {
        return Status[value as keyof typeof Status]
    }
    return undefined
}