import { Organization } from "./Organization";
import { Period } from "./Period";

// Define enums for type safety
export enum LiabilityType {
  SCHOOL_FEE = 'School Fee',
  MEMBERSHIP_FEE = 'Membership Fee',
  FEE = 'Fee',  // Fallback
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
  YEAR_2024_2025 = '2024 - 2025',
  NA = ''
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
      try {
        // Check if data is valid
        if (!data) {
          throw new Error('Invalid data provided to Fee constructor');
        }
        
        this.id = data.id ?? 0;
        this.createdAt = new Date(data.created_at);
        this.amount = data.amount;
        this.deadline = data.payment_date ? new Date(data.payment_date) : null;
        this.name = data.liab_name;
        this.organizationId = typeof data['organization_id'] === 'number' ? data['organization_id'] : new Organization(data['organization_id']);;
        this.periodId = data.periodId instanceof Map ? data.periodId['id'] : data.periodId;
        this.type = Object.values(LiabilityType).find(v => v === data.liab_type) as LiabilityType | LiabilityType.FEE;
        this.academicYear = Object.values(AcademicYear).find(v => v === data.acad_year) as AcademicYear | AcademicYear.NA;
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
        this.type = LiabilityType.FEE;
        this.academicYear = AcademicYear.NA;
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