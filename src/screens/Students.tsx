import { useState, useRef, useEffect } from 'react';
import { useStudents } from '@/stores/useStudent';
import { checkCourse, normalizeCourseCode } from '@/prereq checker/logic';
import { coursesDB } from '@/data/coursesDB';

export default function Students() {
  const students = useStudents();
  
  // State for the search bar and custom dropdown
  const [searchInput, setSearchInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Clean the input as the user types
  const targetCourse = normalizeCourseCode(searchInput);
  const isValidCourse = !!coursesDB[targetCourse];
  
  const allCourseCodes = Object.keys(coursesDB);
  
  // Filter the dropdown list based on what the user types
  const filteredCourses = allCourseCodes.filter(code => 
    code.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header & Search Area */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#111827', fontSize: '2rem', fontWeight: '700', marginBottom: '16px' }}>
          Course Eligibility Checker
        </h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', maxWidth: '400px' }}>
          <label htmlFor="course-search" style={{ color: '#4b5563', fontWeight: '600', fontSize: '0.9rem' }}>
            Select a Target Course
          </label>
          
          <div style={{ position: 'relative' }}>
            <input
              id="course-search"
              type="text"
              placeholder="e.g., COMPSCI 1027"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => {
                // Small delay so the user can actually click an item before the menu closes
                setTimeout(() => setIsDropdownOpen(false), 150);
              }}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: isDropdownOpen ? '1px solid #3b82f6' : '1px solid #d1d5db',
                fontSize: '1rem',
                outline: 'none',
                width: '100%',
                boxShadow: isDropdownOpen ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease'
              }}
            />
            
            {/* The Custom Dropdown Menu */}
            {isDropdownOpen && (
              <ul style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                maxHeight: '250px',
                overflowY: 'auto',
                listStyle: 'none',
                padding: '8px 0',
                margin: 0,
                zIndex: 50
              }}>
                {filteredCourses.length === 0 ? (
                  <li style={{ padding: '10px 16px', color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center' }}>
                    No courses found
                  </li>
                ) : (
                  filteredCourses.map(code => (
                    <li 
                      key={code}
                      onClick={() => {
                        setSearchInput(code);
                        setIsDropdownOpen(false);
                      }}
                      onMouseDown={(e) => e.preventDefault()} // Prevents the input from losing focus immediately
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        color: '#374151',
                        fontSize: '0.95rem',
                        transition: 'background-color 0.1s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {code}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {(!students || students.length === 0) ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db', color: '#6b7280' }}>
          <p>No students loaded.</p>
        </div>
      ) : !searchInput ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '2.5rem' }}>🔍</span>
          <h2 style={{ color: '#334155', marginTop: '16px' }}>Search for a course</h2>
          <p style={{ color: '#64748b' }}>Select a course above to see which students are eligible to enroll.</p>
        </div>
      ) : !isValidCourse ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
          <p style={{ color: '#991b1b', fontWeight: 'bold' }}>Course "{targetCourse}" not found in database.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <h2 style={{ color: '#374151', fontSize: '1.2rem', marginBottom: '8px' }}>
            Eligibility for <span style={{ color: '#1d4ed8' }}>{targetCourse}</span>
          </h2>

          {students.map((student, index) => {
            const result = checkCourse(targetCourse, student);

            return (
              <div 
                key={index} 
                style={{ 
                  backgroundColor: '#ffffff',
                  border: `1px solid ${result.passed ? '#a7f3d0' : '#fecaca'}`, 
                  borderLeft: `6px solid ${result.passed ? '#10b981' : '#ef4444'}`,
                  borderRadius: '8px', 
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#111827', fontSize: '1.1rem' }}>
                    {student.name || `Student ${index + 1}`}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {result.passed ? (
                    <div style={{ color: '#059669', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ✅ Eligible
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                        ❌ Not Eligible
                      </span>
                      <span style={{ color: '#b91c1c', fontSize: '0.85rem', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                        {result.reason}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}