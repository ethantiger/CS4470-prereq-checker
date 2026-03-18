import { Student, Course } from "@/types";

export const mockStudents: Student[] = [
  {
    id: 251000000 + Math.floor(Math.random() * 1000000),
    name: 'No Courses Example',
    courses: []
  },
  {
    id: 251000000 + Math.floor(Math.random() * 1000000),
    name: 'Success Example',
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
    name: 'Failed Course Example',
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
  },
  {
    id: 251000000 + Math.floor(Math.random() * 1000000),
    name: 'Transfer Student Example',
    courses: [
      {
        code: 'COMPSCI 1027',
        campus: 'TRANSFER',
        title: '',
        units: 0.5,
        grade: 'CR'
      },
      {
        code: 'COMPSCI 1020',
        campus: '',
        title: '',
        units: 0.5,
        grade: 'PAS'
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
        grade: 'CR'
      }
    ]
  },
  {
    id: 251000000 + Math.floor(Math.random() * 1000000),
    name: 'Antireq Example',
    courses: [
      {
        code: 'MATH 2151',
        campus: '',
        title: '',
        units: 0.5,
        grade: 80
      },
    ]
  },
  {
    id: 251000000 + Math.floor(Math.random() * 1000000),
    name: 'OR Credits Example',
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
    ]
  },
]