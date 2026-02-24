import { useEffect, useState } from 'react';
import { CoursesDatabase } from '../types';
import CourseTable from '../components/CourseTable';
import AddCourse from '@/components/AddCourse';

// AUTHOR: Tyler Larson
import ImportExportCourses from '@/components/ImportExportCourses';
import { IconPlus } from '@tabler/icons-react';


export default function Database() {
  const [courses, setCourses] = useState<CoursesDatabase>({});
  const [isAddingCourse, setIsAddingCourse] = useState(false);


  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await window.database.getAllCourses();
    setCourses(data);
  };

  const handleCourseAdded = async () => {
    await loadCourses();           // refresh state from DB
    setIsAddingCourse(false);      // go back to table
  };

  return (
    
    <div style={{ padding: '40px' }}>

      <div style={{ marginBottom: '2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1em' }}>
        <button
          disabled={isAddingCourse}
          onClick={() => setIsAddingCourse(true)}
          style={{
            padding: '0.75em 1.5em',
            background: isAddingCourse ? '#cbd5e1' : '#3b82f6',
            color: isAddingCourse ? '#64748b' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isAddingCourse ? 'not-allowed' : 'pointer',
            fontSize: '1em',
            fontWeight: 600,
            opacity: isAddingCourse ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconPlus style={{verticalAlign: 'middle' }} />
          Add Course
        </button>
        <ImportExportCourses onImport={loadCourses} />
      </div>

      

      {isAddingCourse ? (
        <AddCourse courses={courses} onCancel={() => setIsAddingCourse(false)} onAdded={handleCourseAdded}/>
      ) : (
        <CourseTable courses={courses} />
      )}

    </div>
  );
}