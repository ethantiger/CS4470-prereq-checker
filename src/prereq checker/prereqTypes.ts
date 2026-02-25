export type CourseRecord = {
  code: string;
  title?: string;
  grade: number;
};

export type Student = {
  name: string;
  program?: string;
  courses: CourseRecord[];
};

export type Requirement =
  | { type: "AND"; requirements: Requirement[] }
  | { type: "OR"; requirements: Requirement[] }
  | { type: "COURSE"; name: string; minGrade?: number };