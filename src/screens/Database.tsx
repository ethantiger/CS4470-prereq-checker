import { useEffect, useState } from 'react';
import { CoursesDatabase } from '../types';
import CourseTable from '../components/CourseTable';

export default function Database() {
  const [courses, setCourses] = useState<CoursesDatabase>({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await window.database.getAllCourses();
    setCourses(data);
  };

  const addExampleCourse = async () => {
    await window.database.addCourse('CS4470', {
      prereqs: [
        {
          type: 'single',
          course: 'CS2510',
          grade: 'C'
        },
        {
          type: 'group',
          courses: ['CS3000', 'CS3500'],
          grade: 'C-',
          credits: 4
        }
      ],
      antireqs: ['CS4471']
    });
    await loadCourses();
  };

  return (
    <div style={{ padding: '40px' }}>
      {/* <div style={{ marginBottom: '2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={addExampleCourse}
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
      </div> */}
      <CourseTable courses={courses} />
    </div>
  );
}