import { parseStatus, Status } from "./Status";

export class Payment {
    id: number;
    createdAt: Date;
    amount: number;
    refNo: string;
    paymentDate: Date;
    status: Status;
    checkedBy: number;
    statusLastChangedAt: Date;
    studentFeeId: number;
    receiptPath: string;
  
    constructor(data: Record<string, any>) {
        this.id = data.id;
        this.createdAt = new Date(data.created_at);
        this.amount = data.amount;
        this.refNo = data.ref_number;
        this.paymentDate = new Date(data.payment_date);
        this.status = parseStatus(data.status);
        this.checkedBy = data.checked_by;
        this.statusLastChangedAt = new Date(data.status_last_changed_at);
        this.studentFeeId = data.student_fee_id;
        this.receiptPath = data.receipt_path;
      }
  }