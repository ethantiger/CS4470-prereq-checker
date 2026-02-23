import { useEffect, useState } from 'react';
import { CoursesDatabase } from '../types';
import CourseTable from '../components/CourseTable';
import StudentTable from 'CS4470-prereq-checker/src/components/StudentTable';
import AddCourse from '@/components/AddCourse';

// AUTHOR: Tyler Larson

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


  const addExampleCourse = async () => {
    await window.database.addCourse('Computer Science 4470', {
      prereqs: [
        {
          requirements: [
            {
              course: 'Computer Science 3307',
              grade: 60
            }
          ],
          credits: 0.5
        },
        {
          requirements: [
            {
              course: 'Computer Science 3305',
              grade: 60
            },
            {
              course: 'Computer Science 3331',
              grade: 60
            },
            {
              course: 'Computer Science 3340',
              grade: 60
            },
            {
              course: 'Computer Science 3342',
              grade: 60
            },
            {
              course: 'Computer Science 3350',
              grade: 60
            }
          ],
          credits: 1.5
        }
      ],
      antireqs: ['Computer Science 3380', 'Computer Science 4460', 'Computer Science 4480', 'Computer Science 4490', 'Software Engineering 4453']
    });
    await loadCourses();
  };

  const handleCourseAdded = async () => {
    await loadCourses();           // refresh state from DB
    setIsAddingCourse(false);      // go back to table
  };


  return (
    
    <div style={{ padding: '40px' }}>

      <div style={{ marginBottom: '2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <button disabled={isAddingCourse}// ADDED HERE ASWELL!!
          //onClick={addNewCourse}
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
            opacity: isAddingCourse ? 0.7 : 1
          }}
        >
          Add New Course
        </button>


        <button disabled={isAddingCourse}
          onClick={addExampleCourse}
          style={{
            padding: '0.75em 1.5em',
            background: isAddingCourse ? '#cbd5e1' : '#3b82f6',
            color: isAddingCourse ? '#64748b' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isAddingCourse ? 'not-allowed' : 'pointer',
            fontSize: '1em',
            fontWeight: 600,
            opacity: isAddingCourse ? 0.7 : 1
          }}
        >
          Add Example Course
        </button>
        
      </div>
      

      {isAddingCourse ? (
        <AddCourse courses={courses} onCancel={() => setIsAddingCourse(false)} onAdded={handleCourseAdded}/>
      ) : (
        <CourseTable courses={courses} />
      )}

      

      
    </div>
  );
}