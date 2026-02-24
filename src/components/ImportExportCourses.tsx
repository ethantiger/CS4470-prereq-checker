import { ChangeEvent, useRef } from "react";

export default function ImportExportCourses({ onImport }: { onImport: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  // Export courses.json from DB
  const handleExport = async () => {
    const data = await window.database.getAllCourses();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    if (downloadRef.current) {
      downloadRef.current.href = url;
      downloadRef.current.download = 'courses.json';
      downloadRef.current.click();
      URL.revokeObjectURL(url);
    }
  };

  // Import courses.json to DB
  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      await window.database.importCourses(json);
      onImport();
      alert('Courses imported successfully!');
    } catch (err) {
      alert('Invalid JSON file.');
    }
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', gap: '1em', marginBottom: '2em' }}>
      <label style={{ display: 'inline-block' }}>
        <input
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleImport}
          ref={fileInputRef}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '0.75em 1.5em',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: 600
          }}
        >
          Import Courses JSON
        </button>
      </label>
      <button
        onClick={handleExport}
        style={{
          padding: '0.75em 1.5em',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1em',
          fontWeight: 600
        }}
      >
        Export Courses JSON
      </button>
      <a ref={downloadRef} style={{ display: 'none' }}>Download</a>
    </div>
  );
}