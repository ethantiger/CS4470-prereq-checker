import { useState } from 'react';
import { CoursesDatabase } from '@/types';

export default function RunCheck({ setCourse, courses }: { setCourse: (course: string) => void, courses: CoursesDatabase }) {
  const [inputValue, setInputValue] = useState('');

  const handleSetCourse = () => {
    if (inputValue.trim()) {
      setCourse(inputValue.trim());
    }
  };

  const filteredCourses = Object.keys(courses)
    .filter(code => code.toLowerCase().includes(inputValue.toLowerCase()))
    .sort();

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column', 
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: '2rem'
    }}>
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        width: '100%',
        maxWidth: '500px',
        padding: '0 1rem'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
          placeholder="Enter course code..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
        />
        
        {/* Autocomplete dropdown */}
        {inputValue.trim() !== '' && filteredCourses.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '200px',
            marginTop: '0.25em',
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            zIndex: 10,
            maxHeight: '180px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            {filteredCourses.slice(0, 10).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                    setInputValue(code);
                }}
                style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.6em 0.75em',
                    border: 'none',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                    color: '#1e293b',
                    fontSize: '0.95em'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#eef2ff'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                {code}
              </button>
            ))}
            </div>
        )}
        <button
          onClick={handleSetCourse}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Run Check
        </button>
      </div>
    </div>
  )
}