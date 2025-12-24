
import { useState } from 'react';

import './Prereq.css';
import UploadFile from '@/components/UploadFile';
import StudentTable from '@/components/StudentTable';

export default function Prereq() {
  const [students, setStudents] = useState<any[]>([]);
  
  return (
    <div className="prereq-container">
      {students.length === 0 ? (
        <UploadFile setStudents={setStudents}/>
      ) : (
        <StudentTable students={students} />
      )}
    </div>
  );
}