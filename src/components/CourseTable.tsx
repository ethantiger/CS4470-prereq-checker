import { useState, Fragment } from 'react';
import { IconCaretRightFilled, IconCaretDownFilled } from '@tabler/icons-react';
import { CoursesDatabase, PrereqItem, JoinType, CoursePrereq, PrereqGroup } from '@/types';
import './CourseTable.css';

interface CourseTableProps {
  courses: CoursesDatabase;
}

export default function CourseTable({ courses }: CourseTableProps) {
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});

  const toggleRow = (courseCode: string) => {
    setOpenRows((prev) => ({ ...prev, [courseCode]: !prev[courseCode] }));
  };

  const renderPrereqItem = (item: PrereqItem, depth: number = 0): JSX.Element => {
    if (!item) return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>None</span>;

    // Handle CoursePrereq type
    if (item.type === JoinType.COURSE) {
      const courseItem = item as CoursePrereq;
      return (
        <div style={{ 
          marginLeft: `${depth * 1.5}em`,
          marginTop: depth > 0 ? '0.5em' : '0',
          paddingLeft: depth > 0 ? '1em' : '0',
          borderLeft: depth > 0 ? '3px solid #e2e8f0' : 'none'
        }}>
          <span style={{ 
            padding: '0.25em 0.6em',
            background: '#eef2ff',
            border: '2px solid #dbeafe',
            borderRadius: '6px',
            fontSize: '0.9em',
            fontWeight: 500,
            color: '#1e293b',
            display: 'inline-block'
          }}>
            {courseItem.name}
            {courseItem.minGrade > 0 && (
              <span style={{ color: '#64748b', marginLeft: '0.5em' }}>
                ({courseItem.minGrade}%+)
              </span>
            )}
          </span>
        </div>
      );
    }

    // Handle PrereqGroup type (AND/OR)
    const group = item as PrereqGroup;
    return (
      <div style={{ 
        marginLeft: `${depth * 1.5}em`,
        marginTop: depth > 0 ? '0.5em' : '0',
        paddingLeft: depth > 0 ? '1em' : '0',
        borderLeft: depth > 0 ? '3px solid #e2e8f0' : 'none'
      }}>
        <div style={{ 
          display: 'inline-block',
          padding: '0.25em 0.5em',
          background: 'white',
          border: '2px solid #3b82f6',
          borderRadius: '6px',
          color: '#3b82f6',
          fontWeight: 600,
          fontSize: '0.85em',
          marginBottom: '0.5em'
        }}>
          {group.type}
          {group.credits && (
            <span style={{ marginLeft: '0.5em', color: '#64748b', fontWeight: 500 }}>
              ({group.credits} credits)
            </span>
          )}
        </div>
        
        {group.requirements.map((req, idx) => (
          <div key={idx}>
            {idx > 0 && (
              <div style={{ 
                marginLeft: `${(depth + 1) * 1.5}em`,
                color: '#3b82f6',
                fontWeight: 600,
                fontSize: '0.8em',
                margin: '0.25em 0'
              }}>
                {group.type}
              </div>
            )}
            {renderPrereqItem(req, depth + 1)}
          </div>
        ))}
      </div>
    );
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
            <th style={{ width: '50px' }}></th>
            <th>Course Code</th>
            <th>Antirequisites</th>
          </tr>
        </thead>
        <tbody>
          {courseEntries.map(([courseCode, courseData]) => (
            <Fragment key={courseCode}>
              <tr className="course-row">
                <td>
                  <button
                    onClick={() => toggleRow(courseCode)}
                    aria-label={openRows[courseCode] ? 'Hide details' : 'Show details'}
                    className="expand-button"
                  >
                    {openRows[courseCode] ? <IconCaretDownFilled /> : <IconCaretRightFilled />}
                  </button>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{courseCode}</td>
                <td>
                  {courseData.antireqs.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4em' }}>
                      {courseData.antireqs.map((antireq) => (
                        <span key={antireq} className="antireq-chip">
                          {antireq}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>None</span>
                  )}
                </td>
              </tr>
              {openRows[courseCode] && (
                <tr className="expanded-row">
                  <td colSpan={3}>
                    <div className="expanded-content">
                      <h4 style={{ 
                        margin: '0 0 1em 0', 
                        color: '#475569',
                        fontSize: '1.1em',
                        fontWeight: 600,
                        borderBottom: '2px solid #e2e8f0',
                        paddingBottom: '0.5em'
                      }}>
                        Prerequisites
                      </h4>
                      <div style={{ paddingLeft: '0.5em' }}>
                        {courseData.prereqs ? (
                          renderPrereqItem(courseData.prereqs)
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            No prerequisites defined
                          </span>
                        )}
                      </div>
                    </div>
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
