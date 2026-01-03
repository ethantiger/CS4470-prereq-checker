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

// Database types for course prerequisites
export interface SinglePrereq {
  type: 'single';
  course: string;
  grade: string;
}

export interface GroupPrereq {
  type: 'group';
  courses: string[];
  grade: string;
  credits: number;
}

export type Prereq = SinglePrereq | GroupPrereq;

export interface CourseData {
  prereqs: Prereq[];
  antireqs: string[];
}

export interface CoursesDatabase {
  [course: string]: CourseData;
}