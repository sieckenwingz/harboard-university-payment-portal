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
      try {
        // Check if data is valid
        if (!data) {
          throw new Error('Invalid data provided to Fee constructor');
        }
        
        console.log('Constructing Fee from data:', data);
        
        this.id = data.id ?? 0;
        
        // Handle created_at field
        if (data.created_at) {
          try {
            this.createdAt = new Date(data.created_at);
          } catch (error) {
            console.error('Error parsing created_at:', error);
            this.createdAt = new Date();
          }
        } else {
          this.createdAt = new Date();
        }
        
        // Handle amount field - Convert string to number if needed
        this.amount = typeof data.amount === 'string' ? parseFloat(data.amount) : (data.amount ?? 0);
        
        // Handle deadline field - parse if string, use as is if Date, or null if invalid/missing
        if (data.deadline) {
          try {
            this.deadline = data.deadline instanceof Date ? data.deadline : new Date(data.deadline);
          } catch (error) {
            console.error('Error parsing deadline:', error);
            this.deadline = null;
          }
        } else {
          this.deadline = null;
        }
        
        // Handle naming variations in the database
        this.name = data.liab_name ?? data.name ?? 'Unknown Fee';
        
        // Handle type field with fallback
        const typeString = data.liab_type ?? data.type ?? LiabilityType.SCHOOL_FEE;
        this.type = Object.values(LiabilityType).includes(typeString as LiabilityType) 
          ? typeString as LiabilityType 
          : LiabilityType.SCHOOL_FEE;
        
        // Handle academicYear field with fallback
        const yearString = data.acad_year ?? data.academicYear ?? AcademicYear.YEAR_2024_2025;
        this.academicYear = Object.values(AcademicYear).includes(yearString as AcademicYear)
          ? yearString as AcademicYear
          : AcademicYear.YEAR_2024_2025;
        
        // Handle organization_id field - can be an object or a number
        if (data.organization_id && typeof data.organization_id === 'object' && 'id' in data.organization_id) {
          this.organizationId = data.organization_id;
        } else if (data.organizationId && typeof data.organizationId === 'object' && 'id' in data.organizationId) {
          this.organizationId = data.organizationId;
        } else {
          this.organizationId = data.organization_id ?? data.organizationId ?? 0;
        }
        
        // Handle period_id field - can be an object or a number
        if (data.period_id && typeof data.period_id === 'object' && 'id' in data.period_id) {
          this.periodId = data.period_id;
        } else if (data.periodId && typeof data.periodId === 'object' && 'id' in data.periodId) {
          this.periodId = data.periodId;
        } else {
          this.periodId = data.period_id ?? data.periodId ?? 0;
        }
        
        // Handle collector_name field
        this.collectorName = data.collector_name ?? data.collectorName ?? '';
        
        // Handle account_number field - ensure it's a string
        this.accountNumber = data.account_number 
          ? data.account_number.toString() 
          : (data.accountNumber 
            ? data.accountNumber.toString() 
            : '');
        
        // Handle qr_code field
        this.qrCode = data.qr_code ?? data.qrCode ?? null;
        
      } catch (error) {
        console.error('Error constructing Fee object:', error);
        // Set default values for required fields
        this.id = 0;
        this.createdAt = new Date();
        this.amount = 0;
        this.deadline = null;
        this.name = 'Error Fee';
        this.type = LiabilityType.SCHOOL_FEE;
        this.academicYear = AcademicYear.YEAR_2024_2025;
        this.organizationId = 0;
        this.periodId = 0;
        this.collectorName = '';
        this.accountNumber = '';
        this.qrCode = null;
      }
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