import { IconFileUpload } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import { extractInfo } from '../helpers/parseFile';
import './Prereq.css';

export default function Prereq() {
  const [students, setStudents] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    console.log('File selected:', file.name);

    try {
      const studentInfo = await extractInfo(file);
      console.log('Extracted courses:', studentInfo);
      
      // For now, just set a demo student to show the table
      setStudents((students) => [...students, studentInfo]);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Error parsing PDF file: ' + error);
    }
  };

  return (
    <div className="prereq-container">
      {students.length === 0 ? (
        <div className="prereq-upload-card">
          <div className="prereq-upload-icon">📁</div>
          <h2 className="prereq-upload-header">No Students Loaded</h2>
          <p className="prereq-upload-desc">
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
            className="prereq-upload-btn"
          >
            <span><IconFileUpload size={24}/></span>Upload File
          </button>
        </div>
      ) : (
        <div className="prereq-table-card">
          <table className="prereq-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.id}</td>
                  <td>{student.name || 'N/A'}</td>
                  <td>{student.courses.length} courses loaded</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}