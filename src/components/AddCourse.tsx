import { useState, useRef } from 'react';
import { useImmer } from 'use-immer';
import './AddCourse.css';
import { CoursesDatabase } from '@/types';

// AUTHOR: Tyler Larson
// This component is for adding a new course to the database. It includes fields for course code, name, department, weight, antirequisites, and prerequisites. The prerequisite section allows for complex logic with multiple groups of courses joined by AND/OR.

interface AddCourseProps {
    courses: CoursesDatabase;
    onCancel: () => void;
    onAdded: () => void;
}

enum JoinType {
    AND = 'AND',
    OR = 'OR',
    COURSE = 'COURSE'
}

interface PrereqGroup {
  type: JoinType;           // COURSE, AND, or OR
  course?: string;          // single course (for COURSE type)
  courses: string[];        // course codes in this group (for AND/OR)
  subGroups: PrereqGroup[]; // nested groups for AND/OR
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
    const [error, setError] = useState<string | null>(null);
    const courseCodeRef = useRef<HTMLInputElement>(null);
    const [prereqState, setPrereqState] = useImmer<PrereqGroupsState>({
        groups: [],
        join: null
    });

    // Render sub-group recursively
    const renderSubGroup = (group: PrereqGroup, groupIndex: number, subGroupIndex: number, depth: number = 1) => {
        const padding = `${depth * 0.75}em`;
        
        return (
            <div key={subGroupIndex} style={{ marginLeft: padding, marginTop: '0.5em', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px' }}>
                {/* Sub-group Type Selector */}
                <div style={{ marginBottom: '0.75em' }}>
                    <select
                        value={group.subGroups[subGroupIndex].type}
                        onChange={(e) => setSubGroupType(groupIndex, subGroupIndex, e.target.value as JoinType)}
                        style={{ padding: '0.4em', width: 'auto', fontSize: '0.9em' }}>
                        <option value={JoinType.COURSE}>{JoinType.COURSE}</option>
                        <option value={JoinType.AND}>{JoinType.AND}</option>
                        <option value={JoinType.OR}>{JoinType.OR}</option>
                    </select>
                </div>

                {/* COURSE Type */}
                {group.subGroups[subGroupIndex].type === JoinType.COURSE && (
                    <div style={{ marginBottom: '0.75em' }}>
                        <select
                            value={group.subGroups[subGroupIndex].course || ''}
                            onChange={(e) => updateSubGroupCourse(groupIndex, subGroupIndex, e.target.value)}
                            style={{ padding: '0.4em', width: 'auto', fontSize: '0.9em' }}>
                            <option value="">Select course...</option>
                            {prereqOptions.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* AND/OR Type */}
                {(group.subGroups[subGroupIndex].type === JoinType.AND || group.subGroups[subGroupIndex].type === JoinType.OR) && (
                    <div style={{ marginBottom: '0.75em' }}>
                        {/* Courses */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em', alignItems: 'center', marginBottom: '0.5em' }}>
                            <span style={{ fontSize: '1em' }}>(</span>
                            {group.subGroups[subGroupIndex].courses.map((c, ci) => (
                                <div key={ci} style={{ display: 'flex', gap: '0.25em', alignItems: 'center' }}>
                                    {group.subGroups[subGroupIndex].courses.length > 1 && (
                                        <button type="button" className="remove_course_btn" onClick={() => removeSubGroupCourse(groupIndex, subGroupIndex, ci)} style={{ padding: '0 4px', fontSize: '0.9em' }}>×</button>
                                    )}
                                    <select
                                        value={c}
                                        onChange={(e) => updateSubGroupCourseInList(groupIndex, subGroupIndex, ci, e.target.value)}
                                        style={{ padding: '0.3em', width: 'auto', fontSize: '0.85em' }}>
                                        <option value="">Select...</option>
                                        {prereqOptions.map((code) => (
                                            <option key={code} value={code}>
                                                {code}
                                            </option>
                                        ))}
                                    </select>
                                    {ci < group.subGroups[subGroupIndex].courses.length - 1 && <span style={{ fontWeight: 700, fontSize: '0.9em' }}>{group.subGroups[subGroupIndex].type}</span>}
                                </div>
                            ))}
                            <span style={{ fontSize: '1em' }}>)</span>
                        </div>

                        {/* Add course button */}
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => addCourseToSubGroup(groupIndex, subGroupIndex)}
                            style={{ fontSize: '0.85em', padding: '0.3em 0.6em', marginRight: '0.5em' }}>
                            + Course
                        </button>

                        {/* Add nested group button */}
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => addNestedSubGroup(groupIndex, subGroupIndex)}
                            style={{ fontSize: '0.85em', padding: '0.3em 0.6em' }}>
                            + Group
                        </button>

                        {/* Nested sub-groups */}
                        {group.subGroups[subGroupIndex].subGroups.length > 0 && (
                            <div style={{ marginTop: '0.5em' }}>
                                {group.subGroups[subGroupIndex].subGroups.map((nestedGroup, nestedIndex) =>
                                    renderSubGroup(group.subGroups[subGroupIndex], groupIndex, nestedIndex, depth + 1)
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Remove button */}
                <button
                    type="button"
                    className="remove_group_btn"
                    onClick={() => removeNestedSubGroup(groupIndex, subGroupIndex, subGroupIndex)}
                    style={{ fontSize: '0.85em', padding: '0.3em 0.6em', marginTop: '0.5em' }}>
                    Remove
                </button>
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
        setPrereqState(draft => {
            if (draft.groups.length === 0) {
                draft.groups.push({ type: JoinType.COURSE, course, courses: [], subGroups: [] });
            } else {
                draft.groups[0].course = course;
            }
        });
    };

    const setGroupType = (groupIndex: number, type: JoinType) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].type = type;
            if (type === JoinType.COURSE) {
                draft.groups[groupIndex].courses = [];
                draft.groups[groupIndex].subGroups = [];
            } else {
                draft.groups[groupIndex].course = undefined;
            }
        });
    };

    const updateGroupCourse = (groupIndex: number, value: string) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].course = value;
        });
    };

    const updateGroupCourseInList = (groupIndex: number, courseIndex: number, value: string) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].courses[courseIndex] = value;
        });
    };

    const setGroupJoin = (groupIndex: number, join: JoinType) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].courses = draft.groups[groupIndex].courses.filter(c => c.trim() !== '');
            if (draft.groups[groupIndex].courses.length <= 1) {
                draft.groups[groupIndex].courses = [''];
            }
        });
    };

    const addCourseToGroup = (groupIndex: number) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].courses.push('');
        });
    };

    const removeGroupCourse = (groupIndex: number, courseIndex: number) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].courses.splice(courseIndex, 1);
            if (draft.groups[groupIndex].courses.length === 0) {
                draft.groups[groupIndex].courses.push('');
            }
        });
    };

    const addSubGroup = (groupIndex: number) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].subGroups.push({ type: JoinType.COURSE, course: '', courses: [], subGroups: [] });
        });
    };

    const removeSubGroup = (groupIndex: number, subGroupIndex: number) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].subGroups.splice(subGroupIndex, 1);
        });
    };

    const setSubGroupType = (groupIndex: number, subGroupIndex: number, type: JoinType) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].subGroups[subGroupIndex].type = type;
            if (type === JoinType.COURSE) {
                draft.groups[groupIndex].subGroups[subGroupIndex].courses = [];
                draft.groups[groupIndex].subGroups[subGroupIndex].subGroups = [];
            } else {
                draft.groups[groupIndex].subGroups[subGroupIndex].course = undefined;
            }
        });
    };

    const updateSubGroupCourse = (groupIndex: number, subGroupIndex: number, value: string) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].subGroups[subGroupIndex].course = value;
        });
    };

    const updateSubGroupCourseInList = (groupIndex: number, subGroupIndex: number, courseIndex: number, value: string) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].subGroups[subGroupIndex].courses[courseIndex] = value;
        });
    };

    const addCourseToSubGroup = (groupIndex: number, subGroupIndex: number) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].subGroups[subGroupIndex].courses.push('');
        });
    };

    const removeSubGroupCourse = (groupIndex: number, subGroupIndex: number, courseIndex: number) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].subGroups[subGroupIndex].courses.splice(courseIndex, 1);
            if (draft.groups[groupIndex].subGroups[subGroupIndex].courses.length === 0) {
                draft.groups[groupIndex].subGroups[subGroupIndex].courses.push('');
            }
        });
    };

    const addNestedSubGroup = (groupIndex: number, subGroupIndex: number) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].subGroups[subGroupIndex].subGroups.push({ type: JoinType.COURSE, course: '', courses: [], subGroups: [] });
        });
    };

    const removeNestedSubGroup = (groupIndex: number, subGroupIndex: number, nestedIndex: number) => {
        setPrereqState(draft => {
            draft.groups[groupIndex].subGroups[subGroupIndex].subGroups.splice(nestedIndex, 1);
        });
    };

    const addNewGroup = () => {
        setPrereqState(draft => {
            draft.groups.push({ type: JoinType.COURSE, course: '', courses: [], subGroups: [] });
        });
    };

    const removeGroup = (groupIndex: number) => {
        setPrereqState(draft => {
            draft.groups.splice(groupIndex, 1);
            if (draft.groups.length <= 1) {
                draft.join = null;
            }
        });
    };

    const setGroupsJoin = (join: JoinType) => {
        setPrereqState(draft => {
            draft.join = join;
        });
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
                            onChange={(e) => {
                                const type = e.target.value as JoinType;
                                if (type) setFirstPrereqCourse(type);
                            }}
                            style={{ padding: '0.5em', width: 'auto' }}>

                            <option value="">Select type...</option>
                            <option value={JoinType.COURSE}>{JoinType.COURSE}</option>
                            <option value={JoinType.AND}>{JoinType.AND}</option>
                            <option value={JoinType.OR}>{JoinType.OR}</option>
                        </select>
                    </div>
                ) : (
                    <div style={{ marginTop: '0.5em', marginBottom: '0.5em', display: 'flex', flexDirection: 'column', gap: '1em' }}>

                        {/* Render each group */}
                        {prereqState.groups.map((group, gi) => (
                            <div key={gi}>
                                {gi > 0 && gi < prereqState.groups.length && prereqState.join && <span style={{ fontWeight: 500 }}>{prereqState.join}</span>}

                                <div
                                    style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                                    
                                    {/* Group Type Selector */}
                                    <div style={{ marginBottom: '1em' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 500 }}>Group Type:</label>
                                        <select
                                            value={group.type}
                                            onChange={(e) => setGroupType(gi, e.target.value as JoinType)}
                                            style={{ padding: '0.5em', width: 'auto' }}>
                                            <option value={JoinType.COURSE}>{JoinType.COURSE}</option>
                                            <option value={JoinType.AND}>{JoinType.AND}</option>
                                            <option value={JoinType.OR}>{JoinType.OR}</option>
                                        </select>
                                    </div>

                                    {/* COURSE Type - Single Course Select */}
                                    {group.type === JoinType.COURSE && (
                                        <div style={{ marginBottom: '1em' }}>
                                            <select
                                                value={group.course || ''}
                                                onChange={(e) => updateGroupCourse(gi, e.target.value)}
                                                style={{ padding: '0.5em', width: 'auto' }}>
                                                <option value="">Select course...</option>
                                                {prereqOptions.map((code) => (
                                                    <option key={code} value={code}>
                                                        {code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* AND/OR Type - Multiple Courses and Sub-groups */}
                                    {(group.type === JoinType.AND || group.type === JoinType.OR) && (
                                        <div style={{ marginBottom: '1em' }}>
                                            {/* Courses */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75em', alignItems: 'center', marginBottom: '0.75em' }}>
                                                <span style={{ fontSize: '1.25em' }}>(</span>

                                                {group.courses.map((c, ci) => (
                                                    <div key={ci} style={{ display: 'flex', gap: '0.35em', alignItems: 'center' }}>

                                                        {group.courses.length > 1 && (
                                                            <button type="button" className="remove_course_btn" onClick={() => removeGroupCourse(gi, ci)}>×</button>
                                                        )}
                                                        
                                                        <select
                                                            value={c}
                                                            onChange={(e) => updateGroupCourseInList(gi, ci, e.target.value)}
                                                            style={{ padding: '0.5em', width: 'auto' }}>
                                                            <option value="">Select...</option>
                                                            {prereqOptions.map((code) => (
                                                                <option key={code} value={code}>
                                                                    {code}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {/* Show the group's join type between courses */}
                                                        {ci < group.courses.length - 1 && <span style={{ fontWeight: 700 }}>{group.type}</span>}
                                                        
                                                    </div>
                                                ))}

                                                <span style={{ fontSize: '1.25em' }}>)</span>

                                            </div>

                                            {/* Add course button */}
                                            <div style={{ marginBottom: '0.75em' }}>
                                                <button
                                                    type="button"
                                                    className="secondary-btn"
                                                    onClick={() => addCourseToGroup(gi)}
                                                    style={{ marginRight: '0.5em' }}>
                                                    + Add course
                                                </button>

                                                {/* Add sub-group button */}
                                                <button
                                                    type="button"
                                                    className="secondary-btn"
                                                    onClick={() => addSubGroup(gi)}>
                                                    + Add group
                                                </button>
                                            </div>

                                            {/* Render sub-groups */}
                                            {group.subGroups.length > 0 && (
                                                <div style={{ marginTop: '0.75em', paddingLeft: '0.75em', borderLeft: '2px solid #cbd5e1' }}>
                                                    {group.subGroups.map((subGroup, sgi) => (
                                                        <div key={sgi} style={{ marginBottom: '0.5em' }}>
                                                            {sgi > 0 && <span style={{ fontWeight: 700, fontSize: '0.9em', marginRight: '0.5em' }}>{group.type}</span>}
                                                            {renderSubGroup(group, gi, sgi)}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Remove group button */}
                                    {prereqState.groups.length > 1 && (
                                        <div style={{ marginTop: '0.75em' }}>
                                            <button type="button" className="remove_group_btn" onClick={() => removeGroup(gi)}>Remove group</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}


                        {/* GROUP JOIN selector (only if 2+ groups) */}
                        {prereqState.groups.length > 1 && (
                            <div style={{ display: 'flex', gap: '0.75em', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#475569' }}>Groups join:</span>

                                <div style={{ display: 'flex', background: '#3b82f6', borderRadius: '8px', color: 'white' }}>
                                    <button type="button" className="secondary-btn" onClick={() => setGroupsJoin(JoinType.AND)}>and</button>
                                    <button type="button" className="secondary-btn" onClick={() => setGroupsJoin(JoinType.OR)}>or</button>
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

