import { Organization } from "./Organization";
import { Period } from "./Period";
import { Student } from "./Student";

export class StudentPeriod {
    id: number;
    createdAt: Date;
    studentId: number | Student;
    organizationId: number | Organization;
    periodId: number | Period;
  
    constructor(data: Record<string, any>) {
        this.id = data.id;
        this.createdAt = new Date(data.created_at);
        this.studentId = typeof data.student_id === 'number' ? data.student_id : new Student(data.student_id)
        this.organizationId = typeof data.organization_id === 'number' ? data.organization_id : new Organization(data.organization_id)
        this.periodId = typeof data.period_id === 'number' ? data.period_id : new Period(data.period_id)
      }
  }