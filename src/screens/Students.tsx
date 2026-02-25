import { useState } from 'react';
import { useStudents } from '@/stores/useStudent';
import { checkCourse } from '@/prereq checker/logic';

export default function Students() {
  const students = useStudents();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleStudent = (index: number) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ color: '#111827', marginBottom: '30px', fontSize: '2rem', fontWeight: '700' }}>
        Students
      </h1>

      {(!students || students.length === 0) ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db', color: '#6b7280' }}>
          <p>No students loaded.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {students.map((student, index) => {
            const courseResults = student.courses.map(course => ({
              course,
              result: checkCourse(course.code, student)
            }));

            const allPassed = courseResults.every(cr => cr.result.passed);
            const isExpanded = !!expanded[index];

            return (
              <div 
                key={index} 
                style={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  transition: 'box-shadow 0.2s ease'
                }}
              >
                {/* Clickable Header */}
                <div 
                  onClick={() => toggleStudent(index)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '20px 24px', 
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: isExpanded ? '#f9fafb' : '#ffffff',
                    borderBottom: isExpanded ? '1px solid #e5e7eb' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Rotating Arrow */}
                    <span style={{ 
                      color: '#9ca3af', 
                      fontSize: '0.9em',
                      display: 'inline-block',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      ▶
                    </span>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                      {student.name || `Student ${index + 1}`}
                    </h2>
                  </div>
                  
                  {/* Status Indicator */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '6px 12px', 
                    borderRadius: '9999px',
                    backgroundColor: allPassed ? '#ecfdf5' : '#fffbeb',
                    border: `1px solid ${allPassed ? '#a7f3d0' : '#fde68a'}`
                  }}>
                    <span style={{ fontSize: '1.1em' }}>{allPassed ? '✅' : '⚠️'}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: allPassed ? '#065f46' : '#92400e' }}>
                      {allPassed ? 'All Clear' : 'Action Required'}
                    </span>
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div style={{ padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 24px', fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Course
                          </th>
                          <th style={{ padding: '12px 24px', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseResults.map(({ course, result }, i) => (
                          <tr key={i} style={{ borderBottom: i === courseResults.length - 1 ? 'none' : '1px solid #f3f4f6' }}>
                            <td style={{ padding: '16px 24px', color: '#374151', fontWeight: '500' }}>
                              {course.code}
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              {result.passed ? (
                                <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  ✅ <span style={{ fontSize: '0.9em' }}>{result.reason || 'Cleared'}</span>
                                </span>
                              ) : (
                                <span style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  ❌ <span style={{ fontSize: '0.9em', fontWeight: '500' }}>{result.reason}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}