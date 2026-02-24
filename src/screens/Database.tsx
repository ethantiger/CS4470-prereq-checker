import { useEffect, useState } from 'react';
import { CoursesDatabase } from '../types';
import CourseTable from '../components/CourseTable';
import ImportExportCourses from '@/components/ImportExportCourses';


export default function Database() {
  const [courses, setCourses] = useState<CoursesDatabase>({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await window.database.getAllCourses();
    setCourses(data);
  };

  return (
    <div style={{ padding: '40px' }}>
      <ImportExportCourses onImport={loadCourses} />
      <CourseTable courses={courses} />
    </div>
  );
}