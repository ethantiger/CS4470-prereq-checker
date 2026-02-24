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
  const [editingCourseCode, setEditingCourseCode] = useState<string | null>(null);


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
    setEditingCourseCode(null);    // clear edit mode
  };

  const handleEdit = (courseCode: string) => {
    setEditingCourseCode(courseCode);
    setIsAddingCourse(false);
  };

  const handleCancelEdit = () => {
    setEditingCourseCode(null);
  };

  const disableButton = isAddingCourse || editingCourseCode !== null;

  return (
    
    <div style={{ padding: '40px' }}>

      <div style={{ marginBottom: '2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1em' }}>
        <button
          disabled={disableButton}
          onClick={() => setIsAddingCourse(true)}
          style={{
            padding: '0.75em 1.5em',
            background: disableButton ? '#cbd5e1' : '#3b82f6',
            color: disableButton ? '#64748b' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: disableButton ? 'not-allowed' : 'pointer',
            fontSize: '1em',
            fontWeight: 600,
            opacity: disableButton ? 0.7 : 1,
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
      ) : editingCourseCode ? (
        <AddCourse 
          courses={courses} 
          onCancel={handleCancelEdit} 
          onAdded={handleCourseAdded}
          editMode={true}
          courseCode={editingCourseCode}
          courseData={courses[editingCourseCode]}
        />
      ) : (
        <CourseTable courses={courses} onEdit={handleEdit} />
      )}

    </div>
  );
}