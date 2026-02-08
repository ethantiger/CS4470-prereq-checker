import { CoursesDatabase, CourseData } from './index';

declare global {
  interface Window {
    database: {
      getAllCourses: () => Promise<CoursesDatabase>;
      getCourse: (courseCode: string) => Promise<CourseData | null>;
      addCourse: (courseCode: string, courseData: CourseData) => Promise<void>;
      updateCourse: (courseCode: string, courseData: CourseData) => Promise<void>;
      deleteCourse: (courseCode: string) => Promise<void>;
      importCourses: (courses: CoursesDatabase) => Promise<void>;
    };
  }
}

export {};
