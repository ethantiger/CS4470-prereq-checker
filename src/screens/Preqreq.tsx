import { IconFileUpload } from '@tabler/icons-react';
import { useState, useRef, Fragment } from 'react';
import { extractInfo } from '../helpers/parseFile';
import './Prereq.css';


export default function Prereq() {
  const [students, setStudents] = useState<any[]>([]);
  const [openRows, setOpenRows] = useState<{ [key: number]: boolean }>({});
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

  const toggleRow = (index: number) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
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
                <th></th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <Fragment key={student.id}>
                  <tr>
                    <td>
                      <button
                        onClick={() => toggleRow(index)}
                        aria-label={openRows[index] ? 'Hide courses' : 'Show courses'}
                        style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2em' }}
                      >
                        {openRows[index] ? '▼' : '▶'}
                      </button>
                    </td>
                    <td>{student.id}</td>
                    <td>{student.name || 'N/A'}</td>
                    <td>{student.courses.length} courses loaded</td>
                  </tr>
                  {openRows[index] && (
                    <tr>
                      <td colSpan={4}>
                        <table style={{ width: '100%', background: '#f9f9f9', margin: '0.5em 0' }}>
                          <thead>
                            <tr>
                              <th>Code</th>
                              <th>Title</th>
                              <th>Units</th>
                              <th>Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.courses.map((course: any) => (
                              <tr key={course.code}>
                                <td>{course.code}</td>
                                <td>{course.title}</td>
                                <td>{course.units}</td>
                                <td>{course.grade ?? 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}