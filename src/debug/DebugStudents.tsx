import { useStudents } from '@/stores/useStudent';
import { useEffect } from 'react';

export default function DebugStudents() {
  const students = useStudents();

  useEffect(() => {
    console.log("Students list:", students);
    console.log("hello");
  }, [students]);

  return (
    <div>
      Open Console
    </div>
  );
}
