import { useRef } from "react";
import { IconFileUpload } from '@tabler/icons-react';

import { useStudentActions } from "@/stores/useStudent";
import { extractInfo } from '@/helpers/parseFile';
import './UploadFile.css';

export default function UploadFile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addStudent, clearStudents } = useStudentActions();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Clear existing students before uploading new PDF
    await clearStudents();

    for (const file of Array.from(files)) {
      try {
        const studentInfo = await extractInfo(file);
        console.log('Extracted courses:', studentInfo);
        
        // Handle both single student and array of students (multi-page PDFs)
        if (Array.isArray(studentInfo)) {
          for (const student of studentInfo) {
            addStudent(student);
          }
          console.log(`Added ${studentInfo.length} students from PDF pages`);
        } else {
          addStudent(studentInfo);
        }
      } catch (error) {
        console.error('Error parsing PDF:', error);
        
        // Provide user-friendly error messages for different scenarios
        let userMessage = 'Error parsing PDF file: ';
        const errorMsg = error instanceof Error ? error.message : String(error);
        
        if (errorMsg.includes('empty') || errorMsg.includes('corrupted')) {
          userMessage += 'The PDF appears to be empty or corrupted. Please try uploading the file again.';
        } else if (errorMsg.includes('No student data found')) {
          userMessage += 'No student information could be found in this file. The system can work with both regular and redacted transcripts.';
        } else {
          userMessage += errorMsg;
        }
        
        alert(userMessage);
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