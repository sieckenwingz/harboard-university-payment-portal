import { Organization } from "./Organization";
import { Period } from "./Period";

// Define enums for type safety
export enum LiabilityType {
  SCHOOL_FEE = 'School Fee',
  MEMBERSHIP_FEE = 'Membership Fee'
}

export enum LiabilityName {
  // School Fees
  TUITION_FEE = 'Tuition Fee',
  LABORATORY_FEE = 'Laboratory Fee',
  LIBRARY_FEE = 'Library Fee',
  TECHNOLOGY_FEE = 'Technology Fee',
  ATHLETIC_FEE = 'Athletic Fee',
  
  // Membership Fees
  STUDENT_COUNCIL = 'Student Council',
  ENGINEERING_SOCIETY = 'Engineering Society',
  BUSINESS_CLUB = 'Business Club',
  ARTS_CLUB = 'Arts Club',
  MEDICAL_SOCIETY = 'Medical Society'
}

export enum AcademicYear {
  YEAR_2023_2024 = '2023 - 2024',
  YEAR_2024_2025 = '2024 - 2025'
}

export class Fee {
    id: number;
    createdAt: Date;
    amount: number;
    deadline: Date | null;
    name: string;
    type: LiabilityType;
    academicYear: AcademicYear;
    organizationId: number | Organization;
    periodId: number | Period;
    collectorName: string;
    accountNumber: string;
    qrCode: string | null;
  
    constructor(data: Record<string, any>) {
        this.id = data.id;
        this.createdAt = new Date(data.created_at);
        this.amount = data.amount;
        this.deadline = data.deadline ? new Date(data.deadline) : null;
        this.name = data.liab_name || data.name;
        this.type = data.liab_type || LiabilityType.SCHOOL_FEE;
        this.academicYear = data.acad_year || AcademicYear.YEAR_2024_2025;
        this.organizationId = data.organization_id instanceof Map ? data.organization_id['id'] : data.organization_id;
        this.periodId = data.period_id instanceof Map ? data.period_id['id'] : data.period_id;
        this.collectorName = data.collector_name || '';
        this.accountNumber = data.account_number ? data.account_number.toString() : '';
        this.qrCode = data.qr_code || null;
      }
      
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
            liab_type: this.type,
            acad_year: this.academicYear,
            organization_id: typeof this.organizationId === 'object' ? this.organizationId.id : this.organizationId,
            period_id: typeof this.periodId === 'object' ? this.periodId.id : this.periodId,
            collector_name: this.collectorName,
            account_number: this.accountNumber,
            qr_code: this.qrCode
        };
    }
}