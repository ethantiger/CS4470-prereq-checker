import { contextBridge, ipcRenderer } from "electron";
import { CourseData } from "./types";

contextBridge.exposeInMainWorld("database", {
  getAllCourses: (): Promise<Record<string, CourseData>> =>
    ipcRenderer.invoke("db:getAllCourses"),

  getCourse: (courseCode: string): Promise<CourseData | null> =>
    ipcRenderer.invoke("db:getCourse", courseCode),

  addCourse: (courseCode: string, courseData: CourseData): Promise<void> =>
    ipcRenderer.invoke("db:addCourse", courseCode, courseData),

  updateCourse: (courseCode: string, courseData: CourseData): Promise<void> =>
    ipcRenderer.invoke("db:updateCourse", courseCode, courseData),

  deleteCourse: (courseCode: string): Promise<void> =>
    ipcRenderer.invoke("db:deleteCourse", courseCode),

  importCourses: (courses: Record<string, CourseData>): Promise<void> =>
    ipcRenderer.invoke("db:importCourses", courses),
});
