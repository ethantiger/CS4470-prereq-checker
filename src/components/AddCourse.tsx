import { useState, useRef } from 'react';
import './AddCourse.css';
import { CoursesDatabase } from 'CS4470-prereq-checker/src/types';

// AUTHOR: Tyler Larson
// This component is for adding a new course to the database. It includes fields for course code, name, department, weight, antirequisites, and prerequisites. The prerequisite section allows for complex logic with multiple groups of courses joined by AND/OR.

interface AddCourseProps {
    courses: CoursesDatabase;
    onCancel: () => void;
    onAdded: () => void;
}

type JoinType = 'AND' | 'OR';

interface PrereqGroup {
  courses: string[];        // course codes in this group (each is a select)
  join: JoinType | null;    // AND/OR applies to all courses in the group
}

interface PrereqGroupsState {
  groups: PrereqGroup[];    // list of groups
  join: JoinType | null;    // AND/OR applies between groups
}

/*interface PrereqItem {
    course: string;
    joinWithNext?: JoinType;
}*/


export default function AddCourse({ courses, onCancel, onAdded }: AddCourseProps) {
    const [courseCode, setCourseCode] = useState('');
    const [weight, setWeight] = useState<number | ''>('');
    const [courseName, setCourseName] = useState('');
    const [department, setDepartment] = useState('');
    const [antireqInput, setAntireqInput] = useState('');
    const [antireqs, setAntireqs] = useState<string[]>([]);
    //const [selectedPrereq, setSelectedPrereq] = useState('');
    const [error, setError] = useState<string | null>(null);
    const courseCodeRef = useRef<HTMLInputElement>(null);
    //const [prereqItems, setPrereqItems] = useState<PrereqItem[]>([{ course: '' }]);
    //const getDisplayText = (value: string) => (value === '' ? 'Select…' : value);
    const [prereqState, setPrereqState] = useState<PrereqGroupsState>({
        groups: [],
        join: null
    });


            

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


    const prereqOptions = Object.keys(courses)
        .filter(code => code !== courseCode) // don't allow self
        .sort();

    
    // For adding the course to the database (called when "Add" button is clicked)
    const handleAdd = async () => {
        const code = courseCode.trim();
        if (!code) {
            setError('Course Code is required.');

            // refocus on next tick to avoid focus glitches
            setTimeout(() => courseCodeRef.current?.focus(), 0);
            return;
        }

        setError(null);
        await window.database.addCourse(code, { prereqs: [], antireqs });
        onAdded(); // or onCancel() if that's your flow
    };





    const setFirstPrereqCourse = (course: string) => {
        setPrereqState(prev => {
            if (prev.groups.length === 0) {
                return { ...prev, groups: [{ courses: course ? [course] : [''], join: null }] };
            }

            const groups = [...prev.groups];
            const g0 = { ...groups[0] };
            const nextCourses = [...g0.courses];

            if (nextCourses.length === 0) nextCourses.push(course);
            else nextCourses[0] = course;

            g0.courses = nextCourses;
            groups[0] = g0;

            return { ...prev, groups };
        });
    };

    const updateGroupCourse = (groupIndex: number, courseIndex: number, value: string) => {
        setPrereqState(prev => {
            const groups = [...prev.groups];
            const g = { ...groups[groupIndex] };
            const nextCourses = [...g.courses];

            nextCourses[courseIndex] = value;
            g.courses = nextCourses;

            const realCount = nextCourses.filter(c => c.trim() !== '').length;
            if (realCount <= 1) g.join = null;

            groups[groupIndex] = g;
            return { ...prev, groups };
        });
    };

    const setGroupJoin = (groupIndex: number, join: JoinType) => {
        setPrereqState(prev => {
            const groups = [...prev.groups];
            const g = { ...groups[groupIndex] };

            g.join = join;

            groups[groupIndex] = g;
            return { ...prev, groups };
        });
    };

    const addCourseToGroup = (groupIndex: number) => {
        setPrereqState(prev => {
            const groups = [...prev.groups];
            const g = { ...groups[groupIndex] };

            g.courses = [...g.courses, '']; // add a new empty select

            groups[groupIndex] = g;
            return { ...prev, groups };
        });
    };


    const removeGroupCourse = (groupIndex: number, courseIndex: number) => {
        setPrereqState(prev => {
            const groups = [...prev.groups];
            const g = { ...groups[groupIndex] };

            const nextCourses = [...g.courses];
            nextCourses.splice(courseIndex, 1);

            const normalizedCourses = nextCourses.length === 0 ? [''] : nextCourses;

            const realCount = normalizedCourses.filter(c => c.trim() !== '').length;
            const nextJoin = realCount <= 1 ? null : g.join;

            g.courses = normalizedCourses;
            g.join = nextJoin;

            groups[groupIndex] = g;
            return { ...prev, groups };
        });
    };

    const addNewGroup = () => {
        setPrereqState(prev => ({
            ...prev,
            groups: [...prev.groups, { courses: [''], join: null }]
        }));
    };

    const removeGroup = (groupIndex: number) => {
        setPrereqState(prev => {
            const groups = [...prev.groups];
            groups.splice(groupIndex, 1);

            const nextJoin = groups.length <= 1 ? null : prev.join;

            return { ...prev, groups, join: nextJoin };
        });
    };

    const setGroupsJoin = (join: JoinType) => {
        setPrereqState(prev => ({ ...prev, join }));
    };


    /*const updatePrereq = (index: number, value: string) => {
        setPrereqItems(prev => {
            const updated = [...prev];
            updated[index].course = value;
            return updated;
        });
    };

    const addJoin = (index: number, type: JoinType) => {
        setPrereqItems(prev => {
            const updated = [...prev];
            updated[index].joinWithNext = type;
            updated.splice(index + 1, 0, { course: '' });
            return updated;
        });
    };

    const removePrereq = (index: number) => {
        setPrereqItems(prev => {
            const updated = [...prev];

            // If removing a middle/right item, clear the join on the item before it
            // because that join was connecting to the removed item.
            if (index > 0) {
            updated[index - 1] = { ...updated[index - 1], joinWithNext: undefined };
            }

            // Remove the item itself (this also removes its own joinWithNext)
            updated.splice(index, 1);

            // Keep at least one empty row
            if (updated.length === 0) return [{ course: '' }];

            // The last item should never have a joinWithNext
            updated[updated.length - 1] = { ...updated[updated.length - 1], joinWithNext: undefined };

            return updated;
        });
    };*/








    return (
        <div className="table-card">
            <div style={{ padding: '16px' }}>
                <h1 style={{ margin: 0, color: '#475569' }}>
                Add Course
                </h1>

                <br></br>
                <hr></hr>
                <br></br>



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
                        />

                        {error && (
                            <div style={{ marginTop: '0.5em', color: '#b91c1c', fontWeight: 600 }}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Course Name */}
                    <div className="form-field">
                        <label htmlFor="course-name">Course Name</label>
                        <input
                            id="course-name"
                            type="text"
                            placeholder="(e.g., Software Architecture)"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                        />
                    </div>

                    {/* Department */}           {/* add select??? */}
                    <div className="form-field">
                        <label htmlFor="department">Department</label>
                        <input
                            id="department"
                            type="text"
                            placeholder="(e.g., Computer Science)"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
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
                </div>



                {/* ---- ANTIREQS ---- */}

                <br></br>
                <h2 style={{ color: '#475569' }}>Antirequisites</h2>


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
                    <label htmlFor="antireq-search">Add Anti-req</label>      {/* old =  <label htmlFor="antireqs" style={{ display: 'block' }}>Add Anti-req</label>*/}


                    <div style={{ display: 'flex', gap: '0.75em', alignItems: 'center' }}>

                        <input
                            id="antireq-search"
                            type="text"
                            placeholder="Type to search (e.g., COMPSCI 1026)"
                            value={antireqInput}
                            onChange={(e) => setAntireqInput(e.target.value)}
                            style={{ padding: '0.5em', width: '200px' }}
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

                <br></br>
                <h2 style={{ color: '#475569' }}>Prerequisites</h2>

                <label>Select Prerequisites</label>

                {/* If no groups exist yet, show one select that creates Group 1 */}
                {prereqState.groups.length === 0 ? (
                    <div style={{ marginTop: '0.5em' }}>
                        <select
                            value=""
                            onChange={(e) => setFirstPrereqCourse(e.target.value)}
                            style={{ padding: '0.5em', width: 'auto' }}>

                            <option value="">Select...</option>
                            
                            {prereqOptions.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>

                    </div>
                ) : (
                    <div style={{ marginTop: '0.5em', marginBottom: '0.5em', display: 'flex', flexDirection: 'column', gap: '1em' }}>

                        {/* Render each group */}
                        {prereqState.groups.map((group, gi) => (
                            <div>
                                {gi > 0 && gi < prereqState.groups.length && prereqState.join && <span style={{ fontWeight: 500 }}>{prereqState.join}</span>}

                                <div
                                    key={gi}
                                    style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                                        
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75em', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.25em' }}>(</span>

                                        {group.courses.map((c, ci) => (
                                            <div key={ci} style={{ display: 'flex', gap: '0.35em', alignItems: 'center' }}>

                                                {group.courses.length > 1 && (
                                                    <button type="button" className="remove_course_btn" onClick={() => removeGroupCourse(gi, ci)}>×</button>
                                                )}
                                                
                                                <select
                                                    value={c}
                                                    onChange={(e) => updateGroupCourse(gi, ci, e.target.value)}
                                                    style={{ padding: '0.5em', width: 'auto' }}
                                                    >

                                                    <option value="">Select...</option>
                                                    {prereqOptions.map((code) => (
                                                        <option key={code} value={code}>
                                                            {code}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Show the group's join if exists */}
                                                {group.join && <span style={{ fontWeight: 700 }}>{group.join}</span>}
                                                
                                            </div>
                                        ))}

                                        <span style={{ fontSize: '1.25em' }}>)</span>

                                    </div>

                                    {/* Add/remove group controls */}
                                    <div style={{ marginTop: '0.75em', display: 'flex', gap: '0.75em' }}>
                                        {/*<button type="button" className="secondary-btn" onClick={addNewGroup}>+ Add new group</button>*/}

                                        {prereqState.groups.length > 1 && (
                                            <button type="button" className="remove_group_btn" onClick={() => removeGroup(gi)}>Remove group</button>
                                        )}


                                        {/* Course-join buttons: show whenever there are 2+ courses */}
                                        {group.courses.length > 1 && (
                                            <div style={{ display: 'flex', background: '#3b82f6', borderRadius: '8px', color: 'white' }}>
                                                <button
                                                type="button"
                                                className="secondary-btn"
                                                onClick={() => setGroupJoin(gi, 'AND')}
                                                >
                                                and
                                                </button>
                                                <button
                                                type="button"
                                                className="secondary-btn"
                                                onClick={() => setGroupJoin(gi, 'OR')}
                                                >
                                                or
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={() => addCourseToGroup(gi)}
                                            >
                                            + Add course
                                        </button>

                                    </div>
                                </div>
                            </div>
                        ))}


                        {/* GROUP JOIN selector (only if 2+ groups) */}
                        {prereqState.groups.length > 1 && (
                            <div style={{ display: 'flex', gap: '0.75em', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#475569' }}>Groups join:</span>

                                <div style={{ display: 'flex', background: '#3b82f6', borderRadius: '8px', color: 'white' }}>
                                    <button type="button" className="secondary-btn" onClick={() => setGroupsJoin('AND')}>and</button>
                                    <button type="button" className="secondary-btn" onClick={() => setGroupsJoin('OR')}>or</button>
                                </div>
                            </div>
                        )}


                        <div style={{ display: 'flex', gap: '0.75em' }}>
                            <button type="button" className="secondary-btn" onClick={addNewGroup}>+ Add new group</button>
                        </div>

                    </div>
                )}



                {/* ---- BACK & SAVE BUTTONS ---- */}

                <div style={{ marginTop: '2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    <button className="primary-btn" onClick={handleAdd}>Add</button>
                    <span style={{ padding: '0 0.25em' }}>|</span>
                    <button onClick={onCancel} className="primary-btn">Cancel</button>

                </div>
            </div>
        </div>
    );
}

