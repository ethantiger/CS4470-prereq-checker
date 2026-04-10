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
  grade: number | 'CR' | 'PAS' | null;
}

export enum JoinType {
    AND = 'AND',
    OR = 'OR',
    COURSE = 'COURSE'
}

export interface CoursePrereq {
    type: JoinType.COURSE;
    name: string;
    minGrade: number;
}

export interface PrereqGroup {
    type: JoinType.AND | JoinType.OR;
    requirements: PrereqItem[];
}

export interface PrereqGroupWithCredits {
  type: JoinType.OR,
  requirements: CoursePrereq[],
  credits: number
}

export type PrereqItem = PrereqGroup | PrereqGroupWithCredits | CoursePrereq;

export interface CourseData {
  credits: number | null;
  prereqs: PrereqItem;
  antireqs: string[];
  specialConditions?: string[];
}

export interface CoursesDatabase {
  [course: string]: CourseData;
}

export interface AddCourse { // ADDED!!!!!!!

}