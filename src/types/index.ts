export interface Student {
  id: number;
  name: string;
  courses: Course[];
}

export interface Course {
  code: string;
  campus: string;
  title: string;
  units: number | null;
  grade: number | null;
}