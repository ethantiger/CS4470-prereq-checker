import coursesData from "@/data/courses.json";

export type PrereqNode =
  | {
      type: "AND" | "OR";
      requirements: PrereqNode[];
    }
  | {
      type: "COURSE";
      name: string;
      minGrade?: number;
    }
  | {
      type: "REGISTRATION";
      program: string;
    }
  | {
      type: "STATUS";
      name: string;
    };


export interface Course {
    credits: number;
     prereqs: PrereqNode | [];
     antireqs: string[];
}

export class CoursesDatabase {
  private courses: Record<string, Course>;

  constructor() {
    this.courses = coursesData.courses;
  }

  getAllCourses() {
    return this.courses;
  }

  getCourse(code: string): Course | null {
    return this.courses[code] ?? null;
  }
}

export const coursesDB = new CoursesDatabase();
