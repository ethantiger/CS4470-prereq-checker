import { useState, useRef, useEffect } from 'react';
import { useImmer } from 'use-immer';
import './AddCourse.css';
import { CoursesDatabase, PrereqItem, JoinType, CoursePrereq, PrereqGroup, CourseData } from '@/types';

// AUTHOR: Tyler Larson
// This component is for adding a new course to the database. It includes fields for course code, name, department, weight, antirequisites, and prerequisites. The prerequisite section allows for complex logic with multiple groups of courses joined by AND/OR.

interface AddCourseProps {
    courses: CoursesDatabase;
    onCancel: () => void;
    onAdded: () => void;
    editMode?: boolean;
    courseCode?: string;
    courseData?: CourseData;
}



export default function AddCourse({ courses, onCancel, onAdded, editMode = false, courseCode: initialCourseCode = '', courseData: initialCourseData }: AddCourseProps) {
    const [courseCode, setCourseCode] = useState(initialCourseCode);
    const [weight, setWeight] = useState<number | ''>(initialCourseData?.credits || '');
    const [courseName, setCourseName] = useState('');
    const [department, setDepartment] = useState('');
    const [antireqInput, setAntireqInput] = useState('');
    const [antireqs, setAntireqs] = useState<string[]>(initialCourseData?.antireqs || []);
    const [error, setError] = useState<string | null>(null);
    const courseCodeRef = useRef<HTMLInputElement>(null);
    const [prereqs, updatePrereqs] = useImmer<PrereqItem>(initialCourseData?.prereqs || null);
    const [courseInputs, setCourseInputs] = useState<{ [key: string]: string }>({});
    const [activeCourseInput, setActiveCourseInput] = useState<string | null>(null);

    useEffect(() => {
        console.log(prereqs)
    }, [prereqs])

    // Helper to navigate to the correct nested object using the path
    const getNestedItem = (draft: PrereqItem, path: number[]): PrereqItem => {
        let current = draft;
        for (const index of path) {
            if ('requirements' in current) {
                current = current.requirements[index];
            }
        }
        return current;
    };

    const renderPrereqItem = (item: PrereqItem, depth: number = 0, path: number[] = []): JSX.Element => {
        // Handle CoursePrereq type
        if (item.type === JoinType.COURSE) {
            const pathKey = path.join('-');
            const inputValue = courseInputs[pathKey] !== undefined ? courseInputs[pathKey] : item.name || '';
            const isActive = activeCourseInput === pathKey;
            
            // Filter courses for autocomplete
            const filteredCourses = Object.keys(courses)
                .filter(code => code !== courseCode) // don't allow self
                .filter(code => code.toLowerCase().includes(inputValue.toLowerCase()))
                .sort();
            
            return (
                <div style={{ 
                    marginLeft: `${depth * 1.5}em`,
                    marginTop: depth > 0 ? '0.5em' : '0.75em',
                    borderLeft: depth > 0 ? '3px solid #cbd5e1' : 'none',
                    paddingLeft: depth > 0 ? '1em' : '0',
                    paddingTop: depth > 0 ? '0.5em' : '0',
                    paddingBottom: depth > 0 ? '0.5em' : '0'
                }}>
                    <div style={{ marginBottom: '0.75em', paddingLeft: '0.5em', display: 'flex', alignItems: 'flex-start', gap: '0.75em' }}>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '0.25em', color: '#64748b', fontWeight: 600 }}>Course</label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setCourseInputs(prev => ({ ...prev, [pathKey]: newValue }));
                                    updatePrereqs(draft => {
                                        const target = getNestedItem(draft, path) as CoursePrereq;
                                        target.name = newValue;
                                    });
                                }}
                                onFocus={() => setActiveCourseInput(pathKey)}
                                onBlur={() => setTimeout(() => setActiveCourseInput(null), 200)}
                                placeholder="Type to search..."
                                style={{ 
                                    padding: '0.5em 0.6em', 
                                    width: '200px', 
                                    fontSize: '0.9em',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '6px',
                                    background: 'white',
                                    transition: 'all 0.15s ease'
                                }}
                            />
                            
                            {/* Autocomplete dropdown */}
                            {isActive && inputValue.trim() !== '' && filteredCourses.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    width: '200px',
                                    marginTop: '0.25em',
                                    background: 'white',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    zIndex: 10,
                                    maxHeight: '180px',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                }}>
                                    {filteredCourses.slice(0, 10).map((code) => (
                                        <button
                                            key={code}
                                            type="button"
                                            onClick={() => {
                                                setCourseInputs(prev => ({ ...prev, [pathKey]: code }));
                                                updatePrereqs(draft => {
                                                    const target = getNestedItem(draft, path) as CoursePrereq;
                                                    target.name = code;
                                                });
                                                setActiveCourseInput(null);
                                            }}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '0.6em 0.75em',
                                                border: 'none',
                                                background: 'white',
                                                cursor: 'pointer',
                                                transition: 'background 0.1s ease',
                                                color: '#1e293b',
                                                fontSize: '0.95em'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#eef2ff'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            {code}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '0.25em', color: '#64748b', fontWeight: 600 }}>Min Grade (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.minGrade || 60}
                                onChange={(e) => updatePrereqs(draft => {
                                    const target = getNestedItem(draft, path) as CoursePrereq;
                                    target.minGrade = Number(e.target.value);
                                })}
                                style={{ 
                                    padding: '0.5em 0.6em', 
                                    width: '80px', 
                                    fontSize: '0.9em',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '6px',
                                    transition: 'all 0.15s ease'
                                }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        // Handle PrereqGroup type (AND/OR)
        return renderPrereqGroup(item, depth, path);
    };

    const renderPrereqGroup = (group: PrereqGroup, depth: number = 0, path: number[] = []): JSX.Element => {
        const indentSize = depth * 1.5;
        const isNested = depth > 0;
        
        return (
            <div style={{ 
                marginLeft: `${indentSize}em`,
                marginTop: isNested ? '0.5em' : '0.75em',
                borderLeft: isNested ? '3px solid #cbd5e1' : 'none',
                paddingLeft: isNested ? '1em' : '0',
                paddingTop: isNested ? '0.5em' : '0',
                paddingBottom: isNested ? '0.5em' : '0'
            }}>
                {/* Type Selector */}
                <div style={{ marginBottom: '0.75em', display: 'flex', alignItems: 'center', gap: '0.75em' }}>
                    <div>
                        <select
                            value={group.type}
                            onChange={(e) => updatePrereqs(draft => {
                                // Can't change type of PrereqGroup, only show AND/OR
                                const target = getNestedItem(draft, path) as PrereqGroup;
                                target.type = e.target.value as JoinType.AND | JoinType.OR;
                            })}
                            style={{ 
                                padding: '0.4em 0.6em', 
                                width: 'auto', 
                                fontSize: '0.9em',
                                fontWeight: 600,
                                border: '2px solid #3b82f6',
                                borderRadius: '6px',
                                background: 'white',
                                color: '#3b82f6'
                            }}>
                            <option value={JoinType.AND}>AND</option>
                            <option value={JoinType.OR}>OR</option>
                        </select>
                    </div>
                    {group.type === JoinType.OR && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '0.25em', color: '#64748b', fontWeight: 600 }}>Credits Required</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={group.credits || ''}
                                placeholder="Optional"
                                onChange={(e) => updatePrereqs(draft => {
                                    const target = getNestedItem(draft, path) as PrereqGroup;
                                    target.credits = e.target.value ? Number(e.target.value) : undefined;
                                })}
                                style={{ 
                                    padding: '0.5em 0.6em', 
                                    width: '100px', 
                                    fontSize: '0.9em',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '6px',
                                    transition: 'all 0.15s ease'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* AND/OR Type - Multiple Requirements */}
                {(
                    <div style={{ marginBottom: '0.75em' }}>
                        {/* Requirements List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em', marginBottom: '0.75em' }}>
                            {group.requirements.map((r, ri) => (
                                <div key={ri}>
                                    {/* Operator between requirements */}
                                    {ri > 0 && (
                                        <div style={{ 
                                            marginLeft: `${(depth + 1) * 1.5}em`,
                                            marginBottom: '0.5em',
                                            color: '#3b82f6',
                                            fontWeight: 700,
                                            fontSize: '0.85em'
                                        }}>
                                            {group.type}
                                        </div>
                                    )}
                                    
                                    {/* Requirement Item */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}>
                                        {group.requirements.length > 0 && (
                                            <button 
                                                type="button" 
                                                className="remove_course_btn" 
                                                onClick={() => updatePrereqs(draft => {
                                                    const target = getNestedItem(draft, path) as PrereqGroup;
                                                    target.requirements.splice(ri, 1);
                                                })} 
                                                style={{ 
                                                    padding: '0.2em 0.4em', 
                                                    fontSize: '0.9em',
                                                    marginTop: '0.3em'
                                                }}>
                                                ×
                                            </button>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            {renderPrereqItem(r, depth + 1, [...path, ri])}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Requirement Buttons */}
                        <div style={{ paddingLeft: `${(depth + 1) * 1.5}em`, display: 'flex', gap: '0.5em' }}>
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => updatePrereqs(draft => {
                                    const target = getNestedItem(draft, path) as PrereqGroup;
                                    target.requirements.push({
                                        type: JoinType.COURSE,
                                        name: '',
                                        minGrade: 60
                                    });
                                })}
                                style={{ fontSize: '0.85em', padding: '0.4em 0.8em' }}>
                                + Course
                            </button>
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => updatePrereqs(draft => {
                                    const target = getNestedItem(draft, path) as PrereqGroup;
                                    target.requirements.push({
                                        type: JoinType.AND,
                                        requirements: []
                                    });
                                })}
                                style={{ fontSize: '0.85em', padding: '0.4em 0.8em' }}>
                                + Group
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };         

    // adds an antireq to the list
    const addAntireq = () => {
        const value = antireqInput.trim();
        if (!value) return;

        // prevent adding self as antireq
        if (value === courseCode) {
            setAntireqInput('');
            return;
        }

        // prevent duplicates (case-insensitive)
        if (antireqs.some(a => a.toLowerCase() === value.toLowerCase())) {
            setAntireqInput('');
            return;
        }

        setAntireqs(prev => [...prev, value]);
        setAntireqInput('');
    };



    const removeAntireq = (antireq: string) => {
        setAntireqs(prev => prev.filter(a => a !== antireq));
    }

    
    // LOAD COURSES FROM DB 
    const filteredAntireqOptions = Object.keys(courses)
        .filter(code => code !== courseCode) // don’t allow self
        .filter(code => !antireqs.includes(code)) // hide already added
        .filter(code => code.toLowerCase().includes(antireqInput.toLowerCase()))
        .sort();

    const allCoursesHaveName = (item: PrereqItem): boolean => {
        if (item.type === JoinType.COURSE) {
            return !!item.name;
        } else {
            return item.requirements.every(allCoursesHaveName);
        }
    };
    
    // For adding the course to the database (called when "Add" button is clicked)
    const handleAdd = async () => {
        const code = courseCode.trim().toUpperCase();
        if (!code) {
            setError('Course Code is required.');
            return;
        }

        if (!editMode && courses[code]) {
            setError('Course code already exists in the database.');
            return;
        }

        if (weight !== '' && (isNaN(Number(weight)) || Number(weight) < 0)) {
            setError('Weight must be a non-negative number.');
            return;
        }

        if (weight === '') {
            setError('Weight is required. Please enter a value of 0 or greater.');
            return;
        }

        if (prereqs && !allCoursesHaveName(prereqs)) {
            setError('All prerequisite courses must have a valid course code.');
            return;
        }

        setError(null);
        
        if (editMode) {
            // Update existing course
            await window.database.updateCourse(initialCourseCode, { prereqs, antireqs, credits: weight });
        } else {
            // Add new course
            await window.database.addCourse(code, { prereqs, antireqs, credits: weight });
        }
        
        onAdded();
    };

    return (
        <div className="table-card">
            <div style={{ padding: '16px' }}>
                <h1 style={{ margin: 0, color: '#1e293b', fontSize: '1.75em', fontWeight: 700 }}>
                {editMode ? 'Edit Course' : 'Add Course'}
                </h1>

                <hr style={{ 
                    margin: '1.25em 0', 
                    border: 'none', 
                    borderTop: '2px solid #e2e8f0' 
                }} />



                {/* ---- BASIC INFO FIELDS ---- */}

                <div className="form-row">

                    {/* Course Code */}
                    <div className="form-field">
                        <label htmlFor="course-code">Course Code</label>
                        <input
                            ref={courseCodeRef}
                            id="course-code"
                            type="text"
                            placeholder="(e.g., COMPSCI 1027)"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            disabled={editMode}
                            style={editMode ? { background: '#f1f5f9', cursor: 'not-allowed' } : {}}
                        />
                    </div>

                    {/* Weight */}
                    <div className="form-field">
                        <label htmlFor="weight">Weight</label>
                        <input
                            id="weight"
                            type="number"
                            step="0.5"
                            placeholder="(e.g., 0.5)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                    </div>

                    {/* Course Name */}
                    <div className="form-field">
                        <label htmlFor="course-name">Course Name (optional)</label>
                        <input
                            id="course-name"
                            type="text"
                            placeholder="(e.g., Software Architecture)"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                        />
                    </div>

                    {/* Department */}
                    <div className="form-field">
                        <label htmlFor="department">Department (optional)</label>
                        <input
                            id="department"
                            type="text"
                            placeholder="(e.g., Computer Science)"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>
                </div>



                {/* ---- ANTIREQS ---- */}

                <hr style={{ 
                    margin: '1.5em 0', 
                    border: 'none', 
                    borderTop: '2px solid #e2e8f0' 
                }} />
                <h2 style={{ color: '#475569', fontSize: '1.25em', fontWeight: 600, marginBottom: '0.5em' }}>Antirequisites</h2>


                {/* Chips list (only show when there are antireqs) */}
                {antireqs.length > 0 && (
                    <div className="chip-container">
                        {antireqs.map((a) => (
                        <span key={a} className="chip">
                            {a}
                            <button
                                type="button"
                                onClick={() => removeAntireq(a)}
                                aria-label={`Remove ${a}`}
                                className="chip-remove"
                                >
                            ×
                            </button>
                        </span>
                        ))}
                    </div>
                )}

                {/* Input add button side-by-side */}    
                <div className="form-field" style={{ position: 'relative' }}>     {/* <input id="antireqs" type="text" placeholder="(e.g., COMPSCI 1026)" value={antireqInput} onChange={(e) => setAntireqInput(e.target.value)}/> */}
                    <label htmlFor="antireq-search" style={{ display: 'block', marginBottom: '0.5em' }}>Add Anti-req</label>      {/* old =  <label htmlFor="antireqs" style={{ display: 'block' }}>Add Anti-req</label>*/}


                    <div style={{ display: 'flex', gap: '0.75em', alignItems: 'center' }}>

                        <input
                            id="antireq-search"
                            type="text"
                            placeholder="Type to search (e.g., COMPSCI 1026)"
                            value={antireqInput}
                            onChange={(e) => setAntireqInput(e.target.value)}
                            style={{ 
                                padding: '0.6em 0.75em', 
                                width: '300px',
                                fontSize: '0.95em',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                transition: 'all 0.15s ease'
                            }}
                        />

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={addAntireq}
                            disabled={!antireqInput.trim()}
                            style={{ height: 'fit-content' }}
                            >
                            add
                        </button>

                    </div>


                    {/* Dropdown suggestions */}
                    {antireqInput.trim() !== '' && filteredAntireqOptions.length > 0 && (
                        <div className="autocomplete-dropdown">

                            {filteredAntireqOptions.slice(0, 10).map((code) => (
                                <button
                                    key={code}
                                    type="button"
                                    onClick={() => setAntireqInput(code)}
                                    className="autocomplete-option"
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                    )}
                </div>


                {/* ---- PREREQS ---- */}
                                                    {/* NEED TO ADD FIELD FOR MIN GRADE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
                                    {/* also need to add funcitonality for things like "1.0 credits from theres courses..."!!!!!!!! */}

                <hr style={{ 
                    margin: '1.5em 0', 
                    border: 'none', 
                    borderTop: '2px solid #e2e8f0' 
                }} />
                <h2 style={{ color: '#475569', fontSize: '1.25em', fontWeight: 600, marginBottom: '0.5em' }}>Prerequisites</h2>

                <label style={{ display: 'block', marginBottom: '0.75em', fontSize: '0.95em', color: '#64748b' }}>Select Prerequisites</label>

                {/* If no prereqs exist */}
                {!prereqs ? (
                    <div style={{ display: 'flex', gap: '0.5em' }}>
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => updatePrereqs({
                                    type: JoinType.COURSE,
                                    name: '',
                                    minGrade: 60
                            })}
                            style={{ fontSize: '0.85em', padding: '0.4em 0.8em' }}>
                            + Course
                        </button>
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => updatePrereqs({
                                type: JoinType.AND,
                                requirements: []
                            })}
                            style={{ fontSize: '0.85em', padding: '0.4em 0.8em' }}>
                            + Group
                        </button>
                    </div>
                ) : (
                    <>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}>
                        <button 
                            type="button" 
                            className="remove_course_btn" 
                            onClick={() => updatePrereqs(null)} 
                            style={{ 
                                padding: '0.2em 0.4em', 
                                fontSize: '0.9em',
                                marginTop: '0.3em'
                            }}>
                            ×
                        </button>
                        {renderPrereqItem(prereqs, 0)}
                    </div>
                    
                    </>
                )}
                    
                {/* ---- BACK & SAVE BUTTONS ---- */}

                <hr style={{ 
                    margin: '1.5em 0', 
                    border: 'none', 
                    borderTop: '2px solid #e2e8f0' 
                }} />

                {error && (
                    <div style={{ 
                        padding: '1em 1.25em',
                        marginBottom: '1.5em',
                        background: '#fef2f2',
                        border: '2px solid #fecaca',
                        borderRadius: '8px',
                        color: '#991b1b',
                        fontSize: '0.95em',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75em'
                    }}>
                        <span style={{ fontSize: '1.2em' }}>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1em', alignItems: 'center' }}>

                    <button className="primary-btn" onClick={handleAdd}>{editMode ? 'Save Changes' : 'Add'}</button>
                    <button onClick={onCancel} className="primary-btn" style={{ background: '#64748b' }}>Cancel</button>

                </div>
            </div>
        </div>
    );
}

