import { useStudents } from '@/stores/useStudent';
import { checkCourse } from '@/prereq checker/logic';

export default function Students() {
  const students = useStudents();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Students & Prereq Check</h1>

      {students.length === 0 ? (
        <p>No students loaded.</p>
      ) : (
        students.map((student, index) => (
          <div key={index} style={{ marginBottom: '2em', borderBottom: '1px solid #ddd' }}>
            <h2>{student.name || `Student ${index + 1}`}</h2>
            <p>Program: {student.name}</p>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {student.courses.map((course, i) => {
                  const result = checkCourse(course.code, student);

                  return (
                    <tr key={i}>
                      <td>{course.code}</td>
                      <td>{course.grade}</td>
                      <td>
                        {result.passed ? (
                          <span style={{ color: 'green' }}>✅</span>
                        ) : (
                          <span style={{ color: 'red' }}>❌ {result.reason}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
