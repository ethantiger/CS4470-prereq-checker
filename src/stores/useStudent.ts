import { Student } from '@/types';
import { create } from 'zustand';

interface StudentStoreActions {
  addStudent: (student: Student) => void;
  clearStudents: () => void;
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
        set({ students: students ? [...students, student] : [student] });
      },
      clearStudents: () => set({ students: null }),
    }
  }),
);

export const useStudents = () => useStudentStore((state) => state.students);
export const useStudentActions = () => useStudentStore((state) => state.actions);