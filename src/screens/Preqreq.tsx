import { useEffect, useState } from 'react';
import './Prereq.css';
import UploadFile from '@/components/UploadFile';
import StudentTable from '@/components/StudentTable';
import { useStudents } from '@/stores/useStudent';
import RunCheck from '@/components/RunCheck';
import { CoursesDatabase } from '@/types';

export default function Prereq() {
  const students = useStudents();
  const [course, setCourse] = useState('');
  const [courses, setCourses] = useState<CoursesDatabase>({});

  useEffect(() => {
      loadCourses();
    }, []);
  
  const loadCourses = async () => {
    const data = await window.database.getAllCourses();
    setCourses(data);
  };

  return (
    <div className="prereq-container">
      {students.length === 0 ? (
        <UploadFile />
      ) : (
        <>
          <RunCheck setCourse={setCourse} courses={courses}/>
          <StudentTable courses={courses} />
        </>
      )}
    </div>
  );
}