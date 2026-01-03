// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { CoursesDatabase, CourseData } from './types';

contextBridge.exposeInMainWorld('database', {
  getAllCourses: () => ipcRenderer.invoke('db:getAllCourses'),
  getCourse: (courseCode: string) => ipcRenderer.invoke('db:getCourse', courseCode),
  addCourse: (courseCode: string, courseData: CourseData) => 
    ipcRenderer.invoke('db:addCourse', courseCode, courseData),
  updateCourse: (courseCode: string, courseData: CourseData) => 
    ipcRenderer.invoke('db:updateCourse', courseCode, courseData),
  deleteCourse: (courseCode: string) => ipcRenderer.invoke('db:deleteCourse', courseCode),
  importCourses: (courses: CoursesDatabase) => ipcRenderer.invoke('db:importCourses', courses),
});
