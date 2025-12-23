import { IconFileUpload } from '@tabler/icons-react';
import { useState } from 'react';
import './Prereq.css';

export default function Prereq() {
  const [students, setStudents] = useState<any[]>([]);

  const handleFileUpload = () => {
    console.log('Hello World!');
    alert('Hello World!');
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
          <button
            onClick={handleFileUpload}
            className="prereq-upload-btn"
          >
            <span><IconFileUpload size={24}/></span>Upload File
          </button>
        </div>
      ) : (
        <div className="prereq-table-card">
          <table className="prereq-table">
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th>Student ID</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Table rows will go here when students are loaded */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}