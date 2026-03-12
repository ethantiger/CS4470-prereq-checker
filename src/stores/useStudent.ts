import { Student } from '@/types';
import { create } from 'zustand';
import { mockStudents } from './mockStudents';

interface StudentStoreActions {
  addStudent: (student: Student) => void;
  addStudents: (students: Student[]) => void;
  clearStudents: () => void;
  deleteStudent: (studentId: number) => void;
}

interface StudentState {
  students: Student[];
  actions: StudentStoreActions;
}

const useStudentStore = create<StudentState>()(
  (set, get) => ({
    students: [],
    actions: {
      addStudent: (student) => {
        const { students } = get();
        set({ students: [...students, student] });
      },
      addStudents: (newStudents) => {
        const { students } = get();
        set({ students: [...students, ...newStudents] });
      },
      clearStudents: () => {
        set({ students: [] });
      },
      deleteStudent: (studentId: number) => {
        const { students } = get();
        set({ students: students.filter(s => s.id !== studentId) });
      },
    }
  }),
);

export const useStudents = () => useStudentStore((state) => state.students);
export const useStudentActions = () => useStudentStore((state) => state.actions);