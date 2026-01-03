import { useEffect, useState } from 'react';
import { CoursesDatabase } from '../types';

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
    <div>
      <h1>Database Screen</h1>
      <button onClick={addExampleCourse}>Add Example Course</button>
      <pre>{JSON.stringify(courses, null, 2)}</pre>
    </div>
  );
}