import { useRef } from "react";
import { IconFileUpload } from '@tabler/icons-react';

import { extractInfo } from '@/helpers/parseFile';
import './UploadFile.css';
import { Student } from "../types";

export default function UploadFile({ setStudents }: { setStudents: React.Dispatch<React.SetStateAction<Student[]>> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    console.log('File selected:', file.name);

    try {
      const studentInfo = await extractInfo(file);
      console.log('Extracted courses:', studentInfo);
      setStudents((students) => [...students, studentInfo]);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Error parsing PDF file: ' + error);
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