export class Student {
    id: string;
    createdAt: Date;
    firstName: string;
    lastName: string;
    srCode: string;
  
    constructor(data: Record<string, any>) {
        this.id = data.id;
        this.createdAt = new Date(data.created_at);
        this.firstName = data.first_name;
        this.lastName = data.last_name;
        this.srCode = data.sr_code;
    }

    getFullName(): string {
        return this.firstName + ' ' + this.lastName;
    }
}