export class Period {
    id: number;
    createdAt: Date;
    year: string;
    semester: string;
  
    constructor(data: Record<string, any>) {
        this.id = data.id;
        this.createdAt = new Date(data.created_at);
        this.year = data.year;
        this.semester = data.semester;
      }
  }