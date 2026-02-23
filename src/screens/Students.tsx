// UI Component
import { useStudents } from '@/stores/useStudent';
import { checkCourse } from '@/prereq checker/logic';

export default function Students() {
  const students = useStudents();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Students & Prereq Check</h1>

      {(!students || students.length === 0) ? (
        <p>No students loaded.</p>
      ) : (
        students.map((student, index) => (
          <div key={index} style={{ marginBottom: '2em', borderBottom: '1px solid #ddd', paddingBottom: '1em' }}>
            <h2>{student.name || `Student ${index + 1}`}</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ padding: '8px' }}>Target Course</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {student.courses.map((course, i) => {
                  const result = checkCourse(course.code, student);

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}><strong>{course.code}</strong></td>
                      <td style={{ padding: '8px' }}>
                        {result.passed ? (
                          <span style={{ color: 'green' }}>✅ {result.reason}</span>
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