import { Organization } from "./Organization";
import { Period } from "./Period";

export class Fee {
    id: number;
    createdAt: Date;
    amount: number;
    deadline: Date | null;
    name: string;
    organizationId: number | Organization;
    periodId: number | Period;
  
    constructor(data: Record<string, any>) {
        this.id = data.id;
        this.createdAt = new Date(data.created_at);
        this.amount = data.amount;
        this.deadline = data.payment_date ? new Date(data.payment_date) : null;
        this.name = data.name;
        this.organizationId = data.organizationId instanceof Map ? data.organizationId['id'] : data.organizationId;
        this.periodId = data.periodId instanceof Map ? data.periodId['id'] : data.periodId;
      }
  }