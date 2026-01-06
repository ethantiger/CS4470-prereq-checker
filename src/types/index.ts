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

export interface Prereq {
  requirements: Requirement[];
  credits: number;
}

export interface Requirement {
  course: string;
  grade: number;
}

export interface CourseData {
  prereqs: Prereq[];
  antireqs: string[];
}

export interface CoursesDatabase {
  [course: string]: CourseData;
}