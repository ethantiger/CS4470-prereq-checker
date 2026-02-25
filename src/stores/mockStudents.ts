import { Student, Course } from "@/types";

export const mockStudents: Student[] = [
  {
    id: 251000000 + Math.floor(Math.random() * 1000000),
    name: 'John Freshman',
    courses: []
  },
  {
    id: 251000000 + Math.floor(Math.random() * 1000000),
    name: 'John Sophomore',
    courses: [
      {
        code: 'COMPSCI 1027',
        campus: '',
        title: '',
        units: 0.5,
        grade: 80
      },
      {
        code: 'COMPSCI 1020',
        campus: '',
        title: '',
        units: 0.5,
        grade: 80
      },
      {
        code: 'CALCULUS 1000',
        campus: '',
        title: '',
        units: 0.5,
        grade: 80
      },
      {
        code: 'CALCULUS 1500',
        campus: '',
        title: '',
        units: 0.5,
        grade: 80
      }
    ]
  },
  {
    id: 251000000 + Math.floor(Math.random() * 1000000),
    name: 'John Failure',
    courses: [
      {
        code: 'COMPSCI 1027',
        campus: '',
        title: '',
        units: 0.5,
        grade: 80
      },
      {
        code: 'COMPSCI 1020',
        campus: '',
        title: '',
        units: 0.5,
        grade: 50
      },
      {
        code: 'CALCULUS 1000',
        campus: '',
        title: '',
        units: 0.5,
        grade: 80
      },
      {
        code: 'CALCULUS 1500',
        campus: '',
        title: '',
        units: 0.5,
        grade: 80
      }
    ]
  }
]