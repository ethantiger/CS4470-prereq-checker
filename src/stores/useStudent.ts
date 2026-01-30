import { Student } from '@/types';
import { create } from 'zustand';

interface StudentStoreActions {
  addStudent: (student: Student) => void;
  loadStudents: () => Promise<void>;
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
      addStudent: async (student) => {
        const { students } = get();
        set({ students: students ? [...students, student] : [student] });
        
        // Persist to database
        try {
          await window.studentDatabase.addStudent(student);
        } catch (error) {
          console.error('Failed to save student to database:', error);
        }
      },
      loadStudents: async () => {
        try {
          const students = await window.studentDatabase.getAllStudents();
          set({ students: students || [] });
        } catch (error) {
          console.error('Failed to load students from database:', error);
        }
      },
      clearStudents: async () => {
        set({ students: [] });
        try {
          await window.studentDatabase.clearAllStudents();
        } catch (error) {
          console.error('Failed to clear students from database:', error);
        }
      },
      deleteStudent: async (studentId: number) => {
        const { students } = get();
        set({ students: students.filter(s => s.id !== studentId) });
        try {
          await window.studentDatabase.deleteStudent(studentId);
        } catch (error) {
          console.error('Failed to delete student from database:', error);
        }
      },
    }
  }),
);

export const useStudents = () => useStudentStore((state) => state.students);
export const useStudentActions = () => useStudentStore((state) => state.actions);