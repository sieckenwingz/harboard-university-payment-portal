import { Fee } from "./Fee";
import { Payment } from "./Payment";
import { Status } from "./Status";
import { Student } from "./Student";

export class StudentFee {
    id: number;
    createdAt: Date;
    studentId: string | Student;
    feeId: number | Fee;
    paymentId: number | Payment | null;
    status: Status | undefined;
  
    constructor(data: Record<string, any>) {
        this.id = data.id;
        this.createdAt = new Date(data.created_at);
        this.studentId = typeof data.student_id === 'string' ? data.student_id : new Student(data.student_id);
        this.feeId = typeof data['fee_id'] === 'number' ? data['fee_id'] : new Fee(data['fee_id']);
        this.paymentId = data['payment_id'] ? typeof data['payment_id'] === 'number' ? data['payment_id'] : new Payment(data['payment_id']) : null;

        this.status = this.paymentId == null ? Status.UNPAID : this.paymentId instanceof Payment ? this.paymentId.status : undefined;
      }
  }