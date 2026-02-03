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

export interface CourseData {
  credits: number;
  prereqs: PrereqNode | [];
  antireqs: string[];
}

export interface CoursesFile {
  program: string;
  courses: Record<string, CourseData>;
}
