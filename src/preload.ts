// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { CoursesDatabase, CourseData, Student } from './types';

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

contextBridge.exposeInMainWorld('studentDatabase', {
  getAllStudents: () => ipcRenderer.invoke('students:getAll'),
  getStudent: (studentId: number) => ipcRenderer.invoke('students:get', studentId),
  addStudent: (student: Student) => ipcRenderer.invoke('students:add', student),
  updateStudent: (studentId: number, student: Student) => 
    ipcRenderer.invoke('students:update', studentId, student),
  deleteStudent: (studentId: number) => ipcRenderer.invoke('students:delete', studentId),
  importStudents: (students: Student[]) => ipcRenderer.invoke('students:import', students),
  clearAllStudents: () => ipcRenderer.invoke('students:clear'),
});
