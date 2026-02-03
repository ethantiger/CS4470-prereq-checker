import { useEffect, useState } from 'react';
import { CourseData } from '../types';
import CourseTable from '../components/CourseTable';

export default function Database() {
  const [courses, setCourses] = useState<Record<string, CourseData>>({});


  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await window.database.getAllCourses();
    setCourses(data);
  };


  return (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          style={{
            padding: '0.75em 1.5em',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: 600
          }}
        >
          Add Example Course
        </button>
      </div>
      <CourseTable courses={courses} />
    </div>
  );
}