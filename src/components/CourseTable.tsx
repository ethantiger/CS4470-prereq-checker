import { useState, Fragment } from 'react';
import { 
  IconCaretRightFilled, 
  IconCaretDownFilled, 
  IconEdit, 
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconArrowsSort, 
} from '@tabler/icons-react';
import { CoursesDatabase } from '@/types';
import './CourseTable.css';
import CourseData from './ui/CourseData';

interface CourseTableProps {
  courses: CoursesDatabase;
  onEdit: (courseCode: string) => void;
}

export default function CourseTable({ courses, onEdit }: CourseTableProps) {
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; courseCode: string | null }>({
    show: false,
    courseCode: null,
  });
  const [search, setSearch] = useState('');

  // Sorting state
  type SortKey = 'courseCode' | 'weight';
  type SortDir = 'asc' | 'desc';
  const [sortKey, setSortKey] = useState<SortKey>('courseCode');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const compare = (a: string | number, b: string | number) => {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  };

  const toggleRow = (courseCode: string) => {
    setOpenRows((prev) => ({ ...prev, [courseCode]: !prev[courseCode] }));
  };

  const handleDeleteClick = (courseCode: string) => {
    setDeleteModal({ show: true, courseCode });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.courseCode) {
      await window.database.deleteCourse(deleteModal.courseCode);
      setDeleteModal({ show: false, courseCode: null });
      window.location.reload();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, courseCode: null });
  };

  const courseEntries = Object.entries(courses);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCourseEntries = courseEntries.filter(([courseCode, courseData]) => {
    if (normalizedSearch === '') return true;

    if (courseCode.toLowerCase().includes(normalizedSearch)) return true;

    if (courseData.antireqs?.some((a) => a.toLowerCase().includes(normalizedSearch))) return true;

    const prereqText = JSON.stringify(courseData.prereqs ?? '').toLowerCase();
    if (prereqText.includes(normalizedSearch)) return true;

    return false;
  });

  // ✅ Apply sorting AFTER filtering
  const sortedCourseEntries = [...filteredCourseEntries].sort(([codeA, dataA], [codeB, dataB]) => {
    const aVal = sortKey === 'courseCode' ? codeA : (dataA.credits ?? -Infinity);
    const bVal = sortKey === 'courseCode' ? codeB : (dataB.credits ?? -Infinity);

    const result = compare(aVal, bVal);
    return sortDir === 'asc' ? result : -result;
  });

  const sortIconFor = (key: SortKey) => {
    if (sortKey !== key) return <IconArrowsSort size={16} />;
    return sortDir === 'asc' ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />;
  };

  if (courseEntries.length === 0) {
    return (
      <div className="table-card">
        <p style={{ padding: '2em', textAlign: 'center', color: '#64748b' }}>
          No courses in database. Click "Add Example Course" to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3
              style={{
                margin: '0 0 1em 0',
                color: '#1e293b',
                fontSize: '1.25em',
                fontWeight: 600,
              }}
            >
              Delete Course
            </h3>
            <p style={{ margin: '0 0 1.5em 0', color: '#475569', lineHeight: 1.6 }}>
              Are you sure you want to delete <strong>{deleteModal.courseCode}</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
              <button className="modal-button modal-button-cancel" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="modal-button modal-button-delete" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search box above table */}
      <div className="form-field">
        <input
          id="search"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card">
        {/* deals with search results */}
        {filteredCourseEntries.length !== 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}></th>

                {/* ✅ Clickable sortable headers */}
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                    <span>Course Code</span>

                    <button
                      type="button"
                      className="expand-button"
                      onClick={() => toggleSort('courseCode')}
                      aria-label="Sort by course code"
                    >
                      {sortIconFor('courseCode')}
                    </button>
                  </div>
                </th>

                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                    <span>Weight</span>

                    <button
                      type="button"
                      className="expand-button"
                      onClick={() => toggleSort('weight')}
                      aria-label="Sort by weight"
                    >
                      {sortIconFor('weight')}
                    </button>
                  </div>
                </th>

                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedCourseEntries.map(([courseCode, courseData]) => (
                <Fragment key={courseCode}>
                  <tr className="course-row">
                    <td>
                      <button
                        onClick={() => toggleRow(courseCode)}
                        aria-label={openRows[courseCode] ? 'Hide details' : 'Show details'}
                        className="expand-button"
                      >
                        {openRows[courseCode] ? <IconCaretDownFilled /> : <IconCaretRightFilled />}
                      </button>
                    </td>

                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{courseCode}</td>

                    <td>
                      {courseData.credits ? (
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>{courseData.credits}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>N/A</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.5em' }}>
                        <button
                          className="action-button edit-button"
                          onClick={() => onEdit(courseCode)}
                          aria-label={`Edit ${courseCode}`}
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDeleteClick(courseCode)}
                          aria-label={`Delete ${courseCode}`}
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {openRows[courseCode] && (
                    <tr className="expanded-row">
                      <td colSpan={4}>
                        <CourseData courseData={courseData} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: '2em', textAlign: 'center', color: '#64748b' }}>
            {search.trim()
              ? 'No courses match your search.'
              : 'No courses in database. Click "Add Example Course" to get started.'}
          </p>
        )}
      </div>
    </>
  );
}