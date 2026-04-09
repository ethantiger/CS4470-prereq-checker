import './UploadFile.css';
import UploadFileButton from "./ui/UploadFileButton";

export default function UploadFile() {
  return (
    <div className="upload-card">
      <div className="upload-icon">📁</div>
      <h2 className="upload-header">No Students Loaded</h2>
      <p className="upload-desc">
        Upload a file to get started with the prerequisites checker
      </p>
      <UploadFileButton />
    </div>
  )
}