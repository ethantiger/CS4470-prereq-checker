import { useState, Fragment } from 'react';
import { CoursesDatabase, Prereq } from '@/types';
import './CourseTable.css';

interface CourseTableProps {
  courses: CoursesDatabase;
}

export default function CourseTable({ courses }: CourseTableProps) {
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});

  const toggleRow = (courseCode: string) => {
    setOpenRows((prev) => ({ ...prev, [courseCode]: !prev[courseCode] }));
  };

  const renderPrereq = (prereq: Prereq, index: number) => {
    if (prereq.type === 'single') {
      return (
        <tr key={index}>
          <td>Single</td>
          <td>{prereq.course}</td>
          <td>{prereq.grade}</td>
          <td>-</td>
        </tr>
      );
    } else {
      return (
        <tr key={index}>
          <td>Group</td>
          <td>{prereq.courses.join(', ')}</td>
          <td>{prereq.grade}</td>
          <td>{prereq.credits} units</td>
        </tr>
      );
    }
  };

  const courseEntries = Object.entries(courses);

  if (courseEntries.length === 0) {
    return (
      <div className="table-card">
        <p style={{ padding: '2em', textAlign: 'center', color: '#64748b' }}>
          No courses in database. Click "Add Example Course" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>Course Code</th>
            <th>Prerequisites</th>
            <th>Anti-requisites</th>
          </tr>
        </thead>
        <tbody>
          {courseEntries.map(([courseCode, courseData]) => (
            <Fragment key={courseCode}>
              <tr>
                <td>
                  <button
                    onClick={() => toggleRow(courseCode)}
                    aria-label={openRows[courseCode] ? 'Hide details' : 'Show details'}
                    style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2em' }}
                  >
                    {openRows[courseCode] ? '▼' : '▶'}
                  </button>
                </td>
                <td><strong>{courseCode}</strong></td>
                <td>{courseData.prereqs.length} requirement(s)</td>
                <td>{courseData.antireqs.length > 0 ? courseData.antireqs.join(', ') : 'None'}</td>
              </tr>
              {openRows[courseCode] && (
                <tr>
                  <td colSpan={4}>
                    {courseData.prereqs.length > 0 ? (
                      <div style={{ padding: '0.5em' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '0.5em', color: '#475569' }}>Prerequisites:</h4>
                        <table style={{ width: '100%', background: '#f9f9f9', margin: '0.5em 0' }}>
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Course(s)</th>
                              <th>Min Grade</th>
                              <th>Credits</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courseData.prereqs.map((prereq, index) => renderPrereq(prereq, index))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '1em', color: '#64748b' }}>
                        No prerequisites defined
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
