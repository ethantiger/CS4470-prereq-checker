import React, { useState } from 'react';
import { coursesDB } from '@/data/coursesDB';

function PrereqRenderer({ req }: { req: any }) {
  if (!req) return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>None</span>;

  if (req.type === "COURSE") {
    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px', 
        backgroundColor: '#f3f4f6', 
        padding: '4px 10px', 
        borderRadius: '6px', 
        fontSize: '0.9rem', 
        color: '#374151',
        border: '1px solid #e5e7eb',
        whiteSpace: 'nowrap'
      }}>
        <strong style={{ color: '#111827' }}>{req.name}</strong>
        {req.minGrade && (
          <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>
            ≥{req.minGrade}%
          </span>
        )}
      </span>
    );
  }

  if (req.type === "AND") {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        {req.requirements.map((r: any, i: number) => (
          <React.Fragment key={i}>
            <PrereqRenderer req={r} />
            {i < req.requirements.length - 1 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563', letterSpacing: '0.05em' }}>
                AND
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (req.type === "OR") {
    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '8px 12px', 
        backgroundColor: '#fcfdfd', 
        border: '1px dashed #cbd5e1', 
        borderRadius: '8px' 
      }}>
        {req.requirements.map((r: any, i: number) => (
          <React.Fragment key={i}>
            <PrereqRenderer req={r} />
            {i < req.requirements.length - 1 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.05em' }}>
                OR
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return <span>Unknown Requirement</span>;
}

//The Main Page Component
export default function Database() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = Object.entries(coursesDB).filter(([courseCode]) => 
    courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ color: '#111827', fontSize: '2.5rem', fontWeight: '800', margin: '0 0 10px 0' }}>
            Course Catalog
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '1.1rem' }}>
            Browse {Object.keys(coursesDB).length} courses and their requirements.
          </p>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <input 
            type="text" 
            placeholder="Search course code (e.g., 1027)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#9ca3af' }}>
            🔍
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {filteredCourses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
            No courses found matching "{searchTerm}"
          </div>
        ) : (
          filteredCourses.map(([courseCode, courseData]) => {
            const antireqs = courseData.antireqs || [];

            return (
              <div 
                key={courseCode} 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ 
                    backgroundColor: '#eff6ff', 
                    color: '#1d4ed8', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    fontWeight: 'bold', 
                    fontSize: '1.2rem',
                    letterSpacing: '0.05em'
                  }}>
                    {courseCode}
                  </span>
                </div>

                <div style={{ flexGrow: 1, marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', margin: '0 0 12px 0', letterSpacing: '0.05em' }}>
                    Prerequisites
                  </h3>
                  
                  <PrereqRenderer req={courseData.prereqs} />
                  
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', margin: '0 0 12px 0', letterSpacing: '0.05em' }}>
                    Anti-requisites
                  </h3>
                  {antireqs.length === 0 ? (
                    <div style={{ color: '#9ca3af', fontSize: '0.95rem', fontStyle: 'italic' }}>None</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {antireqs.map((anti: string) => (
                        <span 
                          key={anti} 
                          style={{ 
                            backgroundColor: '#fee2e2', 
                            color: '#991b1b', 
                            padding: '4px 10px', 
                            borderRadius: '9999px',
                            fontSize: '0.8rem', 
                            fontWeight: '600' 
                          }}
                        >
                          {anti}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}