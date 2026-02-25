import { useState, Fragment } from 'react';
import {
  IconCaretRightFilled,
  IconCaretDownFilled,
  IconChevronUp,
  IconChevronDown,
  IconArrowsSort,
} from '@tabler/icons-react';
import { useStudents } from '@/stores/useStudent';
import './StudentTable.css';
import { CoursesDatabase } from '@/types';

type SortKey = 'id' | 'name';
type SortDir = 'asc' | 'desc';

export default function StudentTable({course, courses}: {course: string, courses: CoursesDatabase}) {
  // ✅ Use student.id as the key (stable across search/sort)
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});
  const [search, setSearch] = useState('');

  // ✅ Sorting
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const students = useStudents();

  const toggleRow = (studentId: string | number) => {
    const key = String(studentId);
    setOpenRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredStudents = students.filter((student) => {
    if (normalizedSearch === '') return true;

    const idText = String(student.id).toLowerCase();
    const nameText = (student.name ?? '').toLowerCase();

    return idText.includes(normalizedSearch) || nameText.includes(normalizedSearch);
  });

  const compare = (a: string | number, b: string | number) => {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  };

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aVal = sortKey === 'id' ? a.id : (a.name ?? '');
    const bVal = sortKey === 'id' ? b.id : (b.name ?? '');
    const result = compare(aVal, bVal);
    return sortDir === 'asc' ? result : -result;
  });

  const sortIconFor = (key: SortKey) => {
    if (sortKey !== key) return <IconArrowsSort size={16} />;
    return sortDir === 'asc' ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />;
  };

  return (
    <>
      {/* Search box above table */}
      <div className="form-field">
        <input
          id="search"
          type="text"
          placeholder="Search by Student ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card">
        {sortedStudents.length !== 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th></th>

                {/* Student ID header + sort button (only icon is clickable) */}
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                    <span>Student ID</span>
                    <button
                      type="button"
                      className="expand-button"
                      onClick={() => toggleSort('id')}
                      aria-label="Sort by Student ID"
                      title="Sort by Student ID"
                    >
                      {sortIconFor('id')}
                    </button>
                  </div>
                </th>

                {/* Name header + sort button */}
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                    <span>Name</span>
                    <button
                      type="button"
                      className="expand-button"
                      onClick={() => toggleSort('name')}
                      aria-label="Sort by Name"
                      title="Sort by Name"
                    >
                      {sortIconFor('name')}
                    </button>
                  </div>
                </th>

                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {sortedStudents.map((student) => {
                const rowKey = String(student.id);
                return (
                  <Fragment key={student.id}>
                    <tr>
                      <td>
                        <button
                          onClick={() => toggleRow(student.id)}
                          aria-label={openRows[rowKey] ? 'Hide courses' : 'Show courses'}
                          className="expand-button"
                        >
                          {openRows[rowKey] ? <IconCaretDownFilled /> : <IconCaretRightFilled />}
                        </button>
                      </td>
                      <td>{student.id}</td>
                      <td>{student.name || 'N/A'}</td>
                      <td>{student.courses.length} courses loaded</td>
                    </tr>

                    {openRows[rowKey] && (
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
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: '2em', textAlign: 'center', color: '#64748b' }}>
            {search.trim() ? 'No students match your search.' : 'No students loaded.'}
          </p>
        )}
      </div>
    </>
  );
}