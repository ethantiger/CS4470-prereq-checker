
import './Prereq.css';
import UploadFile from '@/components/UploadFile';
import StudentTable from '@/components/StudentTable';
import { useStudents } from '@/stores/useStudent';

export default function Prereq() {
  const students = useStudents();
  return (
    <div className="prereq-container">
      {students.length === 0 ? (
        <UploadFile />
      ) : (
        <StudentTable />
      )}
    </div>
  );
}