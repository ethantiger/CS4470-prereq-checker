import { useRef } from "react";
import { IconFileUpload } from '@tabler/icons-react';

import { useStudentActions } from "@/stores/useStudent";
import { extractInfo } from '@/helpers/parseFile';
import './UploadFile.css';

export default function UploadFile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addStudent, clearStudents } = useStudentActions();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      alert('No file selected. Please choose a PDF file to upload.');
      return;
    }

    clearStudents();

    try {
      const studentInfo = await extractInfo(file);
      
      for (const student of studentInfo) {
        addStudent(student);
      }
      console.log(`Added ${studentInfo.length} students from PDF pages`);

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="upload-card">
      <div className="upload-icon">📁</div>
      <h2 className="upload-header">No Students Loaded</h2>
      <p className="upload-desc">
        Upload a file to get started with the prerequisites checker
      </p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        multiple
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="upload-btn"
      >
        <span><IconFileUpload size={24}/></span>Upload File
      </button>
    </div>
  )
}