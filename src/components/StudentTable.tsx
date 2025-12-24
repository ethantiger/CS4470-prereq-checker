import { useState, Fragment } from 'react';

import { useStudents } from '@/stores/useStudent';
import { Student } from 'src/types';

export default function StudentTable() {
  const [openRows, setOpenRows] = useState<{ [key: number]: boolean }>({});
  const students = useStudents();

  const toggleRow = (index: number) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="prereq-table-card">
      <table className="prereq-table">
        <thead>
          <tr>
            <th></th>
            <th>Student ID</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <Fragment key={student.id}>
              <tr>
                <td>
                  <button
                    onClick={() => toggleRow(index)}
                    aria-label={openRows[index] ? 'Hide courses' : 'Show courses'}
                    style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2em' }}
                  >
                    {openRows[index] ? '▼' : '▶'}
                  </button>
                </td>
                <td>{student.id}</td>
                <td>{student.name || 'N/A'}</td>
                <td>{student.courses.length} courses loaded</td>
              </tr>
              {openRows[index] && (
                <tr>
                  <td colSpan={4}>
                    <table style={{ width: '100%', background: '#f9f9f9', margin: '0.5em 0' }}>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Title</th>
                          <th>Units</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.courses.map((course: any) => (
                          <tr key={course.code}>
                            <td>{course.code}</td>
                            <td>{course.title}</td>
                            <td>{course.units}</td>
                            <td>{course.grade ?? 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}