import { CoursesDatabase, CourseData, Student } from './index';

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
    studentDatabase: {
      getAllStudents: () => Promise<Student[]>;
      getStudent: (studentId: number) => Promise<Student | null>;
      addStudent: (student: Student) => Promise<void>;
      updateStudent: (studentId: number, student: Student) => Promise<void>;
      deleteStudent: (studentId: number) => Promise<void>;
      importStudents: (students: Student[]) => Promise<void>;
      clearAllStudents: () => Promise<void>;
    };
  }
}

export {};
