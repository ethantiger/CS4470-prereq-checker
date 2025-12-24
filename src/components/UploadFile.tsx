import { useRef } from "react";
import { IconFileUpload } from '@tabler/icons-react';

import { useStudentActions } from "@/stores/useStudent";
import { extractInfo } from '@/helpers/parseFile';
import './UploadFile.css';

export default function UploadFile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addStudent } = useStudentActions();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const studentInfo = await extractInfo(file);
        console.log('Extracted courses:', studentInfo);
        addStudent(studentInfo);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        alert('Error parsing PDF file: ' + error);
      }
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