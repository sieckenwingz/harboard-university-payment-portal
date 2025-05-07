import { getEnumKeyByValue } from "../helpers/EnumHelpers";

export enum Semester {
    FIRST = 'FIRST',
    SECOND = 'SECOND',
    SUMMER = 'SUMMER'
}

export enum AcademicYear {
    YEAR_2023_2024 = '2023 - 2024',
    YEAR_2024_2025 = '2024 - 2025',
    YEAR_2025_2026 = '2025 - 2026',
}

export function parseAcademicYear(value: string): AcademicYear {
    const year = (Object.values(AcademicYear) as string[]).includes(value) ? value as AcademicYear : undefined;
    if (year) {
        return year;
    }
    throw Error
}

export function parseSemester(value: string): Semester {
    if (value in Semester) {
        return Semester[value as keyof typeof Semester]
    }
    throw Error;
}

export class Period {
    id: number;
    createdAt: Date;
    year: AcademicYear;
    semester: Semester;
  
    constructor(data: Record<string, any>) {
        this.id = data.id;
        this.createdAt = new Date(data.created_at);
        this.year = parseAcademicYear(data.year);
        this.semester = parseSemester(data.semester);
      }
  }