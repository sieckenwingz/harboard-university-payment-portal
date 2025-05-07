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
    collectorName: string;
    accountNumber: string;
    qrCode: string | null;
  
    constructor(data: Record<string, any>) {
      try {
        // Check if data is valid
        if (!data) {
          throw new Error('Invalid data provided to Fee constructor');
        }
        
        this.id = data.id ?? 0;
        this.createdAt = new Date(data.created_at);
        this.amount = data.amount;
        this.deadline = data.deadline ? new Date(data.deadline) : null;
        this.name = data.name;
        this.organizationId = typeof data['organization_id'] === 'number' ? data['organization_id'] : new Organization(data['organization_id']);
        this.periodId = typeof data.period_id === 'number' ? data.period_id : new Period(data.period_id);
        this.collectorName = data.collector_name;
        this.accountNumber = data.account_number;
        this.qrCode = data.qr_code;

      } catch (error) {
        console.error('Error constructing Fee object:', error);
        // Set default values for required fields
        this.id = 0;
        this.createdAt = new Date();
        this.amount = 0;
        this.deadline = null;
        this.name = 'Error Fee';
        this.organizationId = -1;
        this.periodId = -1;
        this.collectorName = '';
        this.accountNumber = '';
        this.qrCode = null;
      }
    }
      
    // TODO: Move to a single utils function to prevent duplicate code
    // Helper method to format amount for display
    get formattedAmount(): string {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(this.amount / 100); // assuming amount is stored in cents
    }
    
    // Helper method to format deadline for display
    get formattedDeadline(): string {
        if (!this.deadline) return 'No deadline';
        return this.deadline.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Convert to object suitable for API calls
    toApiObject(): Record<string, any> {
        return {
            id: this.id,
            amount: this.amount,
            deadline: this.deadline?.toISOString(),
            liab_name: this.name,
            organization_id: typeof this.organizationId === 'object' ? this.organizationId.id : this.organizationId,
            period_id: typeof this.periodId === 'object' ? this.periodId.id : this.periodId,
            collector_name: this.collectorName,
            account_number: this.accountNumber,
            qr_code: this.qrCode
        };
    }
}