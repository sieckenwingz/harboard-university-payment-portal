export class Organization {
    id: number;
    createdAt: Date;
    name: string;
  
    constructor(data: Record<string, any>) {
        this.id = data.id;
        this.createdAt = new Date(data.created_at);
        this.name = data.name;
      }
  }