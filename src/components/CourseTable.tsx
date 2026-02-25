import { useState, Fragment } from 'react';
import { IconCaretRightFilled, IconCaretDownFilled, IconEdit, IconTrash } from '@tabler/icons-react';
import { CoursesDatabase, PrereqItem, JoinType, CoursePrereq, PrereqGroup } from '@/types';
import './CourseTable.css';

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

  const renderPrereqItem = (item: PrereqItem, depth: number = 0): JSX.Element => {
    if (!item) return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>None</span>;

    if (item.type === JoinType.COURSE) {
      const courseItem = item as CoursePrereq;
      return (
        <div
          style={{
            marginLeft: `${depth * 1.5}em`,
            marginTop: depth > 0 ? '0.5em' : '0',
            paddingLeft: depth > 0 ? '1em' : '0',
            borderLeft: depth > 0 ? '3px solid #e2e8f0' : 'none',
          }}
        >
          <span
            style={{
              padding: '0.25em 0.6em',
              background: '#eef2ff',
              border: '2px solid #dbeafe',
              borderRadius: '6px',
              fontSize: '0.9em',
              fontWeight: 500,
              color: '#1e293b',
              display: 'inline-block',
            }}
          >
            {courseItem.name}
            {courseItem.minGrade > 0 && (
              <span style={{ color: '#64748b', marginLeft: '0.5em' }}>
                ({courseItem.minGrade}%+)
              </span>
            )}
          </span>
        </div>
      );
    }

    const group = item as PrereqGroup;
    return (
      <div
        style={{
          marginLeft: `${depth * 1.5}em`,
          marginTop: depth > 0 ? '0.5em' : '0',
          paddingLeft: depth > 0 ? '1em' : '0',
          borderLeft: depth > 0 ? '3px solid #e2e8f0' : 'none',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '0.25em 0.5em',
            background: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            color: '#3b82f6',
            fontWeight: 600,
            fontSize: '0.85em',
            marginBottom: '0.5em',
          }}
        >
          {group.type}
          {group.credits && (
            <span style={{ marginLeft: '0.5em', color: '#64748b', fontWeight: 500 }}>
              ({group.credits} credits)
            </span>
          )}
        </div>

        {group.requirements.map((req, idx) => (
          <div key={idx}>
            {idx > 0 && (
              <div
                style={{
                  marginLeft: `${(depth + 1) * 1.5}em`,
                  color: '#3b82f6',
                  fontWeight: 600,
                  fontSize: '0.8em',
                  margin: '0.25em 0',
                }}
              >
                {group.type}
              </div>
            )}
            {renderPrereqItem(req, depth + 1)}
          </div>
        ))}
      </div>
    );
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
                      {sortKey === 'courseCode' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
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
                      {sortKey === 'weight' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
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
                        <div className="expanded-content">
                          <h4
                            style={{
                              margin: '0 0 1em 0',
                              color: '#475569',
                              fontSize: '1.1em',
                              fontWeight: 600,
                              borderBottom: '2px solid #e2e8f0',
                              paddingBottom: '0.5em',
                            }}
                          >
                            Prerequisites
                          </h4>

                          <div style={{ paddingLeft: '0.5em', marginBottom: '1.5em' }}>
                            {courseData.prereqs ? (
                              renderPrereqItem(courseData.prereqs)
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                No prerequisites defined
                              </span>
                            )}
                          </div>

                          <h4
                            style={{
                              margin: '0 0 1em 0',
                              color: '#475569',
                              fontSize: '1.1em',
                              fontWeight: 600,
                              borderBottom: '2px solid #e2e8f0',
                              paddingBottom: '0.5em',
                            }}
                          >
                            Antirequisites
                          </h4>

                          <div style={{ paddingLeft: '0.5em' }}>
                            {courseData.antireqs.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em' }}>
                                {courseData.antireqs.map((antireq) => (
                                  <span key={antireq} className="antireq-chip">
                                    {antireq}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                No antirequisites defined
                              </span>
                            )}
                          </div>
                        </div>
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