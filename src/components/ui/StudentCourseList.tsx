import { Student } from "@/types";

export default function StudentCourseList({ student }: { student: Student }) {
  return (
    <table style={{ width: '100%', background: '#f9f9f9', margin: '0.5em 0' }}>
      <thead>
        <tr>
          <th>Code</th>
          <th>Title</th>
          <th>Campus</th>
          <th>Units</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>
        {student.courses.map((course: any) => (
          <tr key={course.code}>
            <td>{course.code}</td>
            <td>{course.title}</td>
            <td>{course.campus}</td>
            <td>{course.units}</td>
            <td>{course.grade ?? 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}