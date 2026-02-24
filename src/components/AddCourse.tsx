import { useState, useRef, useEffect } from 'react';
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

interface CoursePrereq {
    type: JoinType.COURSE;
    name: string;
    minGrade: number;
}

interface PrereqGroup {
    type: JoinType;
    requirements: (PrereqGroup | CoursePrereq)[];
    credits?: number;
}


export default function AddCourse({ courses, onCancel, onAdded }: AddCourseProps) {
    const [courseCode, setCourseCode] = useState('');
    const [weight, setWeight] = useState<number | ''>('');
    const [courseName, setCourseName] = useState('');
    const [department, setDepartment] = useState('');
    const [antireqInput, setAntireqInput] = useState('');
    const [antireqs, setAntireqs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const courseCodeRef = useRef<HTMLInputElement>(null);
    const [prereqs, updatePrereqs] = useImmer<PrereqGroup>(null);

    useEffect(() => {
        console.log('Prereqs updated:', prereqs);
    }, [prereqs])

    const renderPrereqGroup = (group: PrereqGroup, depth: number = 0): JSX.Element => {
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
                <div style={{ marginBottom: '0.75em', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                    <select
                        value={group.type}
                        onChange={(e) => updatePrereqs(draft => {
                            draft.type = e.target.value as JoinType;
                            draft.requirements = [];
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
                        <option value={JoinType.COURSE}>COURSE</option>
                        <option value={JoinType.AND}>AND</option>
                        <option value={JoinType.OR}>OR</option>
                    </select>
                </div>

                {/* COURSE Type - Single Course Select */}
                {group.type === JoinType.COURSE && (
                    <div style={{ marginBottom: '0.75em', paddingLeft: '0.5em' }}>
                        <select
                            value={(group.requirements[0] as CoursePrereq)?.name || ''}
                            onChange={(e) => updatePrereqs(draft => {
                                draft.requirements = [{
                                    type: JoinType.COURSE,
                                    name: e.target.value,
                                    minGrade: 0
                                }];
                            })}
                            style={{ padding: '0.4em', width: 'auto', fontSize: '0.9em' }}>
                            <option value="">Select course...</option>
                            {Object.keys(courses).sort().map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* AND/OR Type - Multiple Requirements */}
                {(group.type === JoinType.AND || group.type === JoinType.OR) && (
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
                                        {group.requirements.length > 1 && (
                                            <button 
                                                type="button" 
                                                className="remove_course_btn" 
                                                onClick={() => updatePrereqs(draft => {
                                                    draft.requirements.splice(ri, 1);
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
                                            {renderPrereqGroup(r as PrereqGroup, depth + 1)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Group Button */}
                        <div style={{ paddingLeft: `${(depth + 1) * 1.5}em` }}>
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => updatePrereqs(draft => {
                                    draft.requirements.push({
                                        type: JoinType.COURSE,
                                        requirements: []
                                    });
                                })}
                                style={{ fontSize: '0.85em', padding: '0.4em 0.8em' }}>
                                + Add Requirement
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    // // Render sub-group recursively
    // const renderSubGroup = (group: PrereqGroup, groupIndex: number, subGroupIndex: number, depth: number = 1) => {
    //     const padding = `${depth * 0.75}em`;
        
    //     return (
    //         <div key={subGroupIndex} style={{ marginLeft: padding, marginTop: '0.5em', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px' }}>
    //             {/* Sub-group Type Selector */}
    //             <div style={{ marginBottom: '0.75em' }}>
    //                 <select
    //                     value={group.subGroups[subGroupIndex].type}
    //                     onChange={(e) => setSubGroupType(groupIndex, subGroupIndex, e.target.value as JoinType)}
    //                     style={{ padding: '0.4em', width: 'auto', fontSize: '0.9em' }}>
    //                     <option value={JoinType.COURSE}>{JoinType.COURSE}</option>
    //                     <option value={JoinType.AND}>{JoinType.AND}</option>
    //                     <option value={JoinType.OR}>{JoinType.OR}</option>
    //                 </select>
    //             </div>

    //             {/* COURSE Type */}
    //             {group.subGroups[subGroupIndex].type === JoinType.COURSE && (
    //                 <div style={{ marginBottom: '0.75em' }}>
    //                     <select
    //                         value={group.subGroups[subGroupIndex].course || ''}
    //                         onChange={(e) => updateSubGroupCourse(groupIndex, subGroupIndex, e.target.value)}
    //                         style={{ padding: '0.4em', width: 'auto', fontSize: '0.9em' }}>
    //                         <option value="">Select course...</option>
    //                         {prereqOptions.map((code) => (
    //                             <option key={code} value={code}>
    //                                 {code}
    //                             </option>
    //                         ))}
    //                     </select>
    //                 </div>
    //             )}

    //             {/* AND/OR Type */}
    //             {(group.subGroups[subGroupIndex].type === JoinType.AND || group.subGroups[subGroupIndex].type === JoinType.OR) && (
    //                 <div style={{ marginBottom: '0.75em' }}>
    //                     {/* Courses */}
    //                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em', alignItems: 'center', marginBottom: '0.5em' }}>
    //                         <span style={{ fontSize: '1em' }}>(</span>
    //                         {group.subGroups[subGroupIndex].courses.map((c, ci) => (
    //                             <div key={ci} style={{ display: 'flex', gap: '0.25em', alignItems: 'center' }}>
    //                                 {group.subGroups[subGroupIndex].courses.length > 1 && (
    //                                     <button type="button" className="remove_course_btn" onClick={() => removeSubGroupCourse(groupIndex, subGroupIndex, ci)} style={{ padding: '0 4px', fontSize: '0.9em' }}>×</button>
    //                                 )}
    //                                 <select
    //                                     value={c}
    //                                     onChange={(e) => updateSubGroupCourseInList(groupIndex, subGroupIndex, ci, e.target.value)}
    //                                     style={{ padding: '0.3em', width: 'auto', fontSize: '0.85em' }}>
    //                                     <option value="">Select...</option>
    //                                     {prereqOptions.map((code) => (
    //                                         <option key={code} value={code}>
    //                                             {code}
    //                                         </option>
    //                                     ))}
    //                                 </select>
    //                                 {ci < group.subGroups[subGroupIndex].courses.length - 1 && <span style={{ fontWeight: 700, fontSize: '0.9em' }}>{group.subGroups[subGroupIndex].type}</span>}
    //                             </div>
    //                         ))}
    //                         <span style={{ fontSize: '1em' }}>)</span>
    //                     </div>

    //                     {/* Add course button */}
    //                     <button
    //                         type="button"
    //                         className="secondary-btn"
    //                         onClick={() => addCourseToSubGroup(groupIndex, subGroupIndex)}
    //                         style={{ fontSize: '0.85em', padding: '0.3em 0.6em', marginRight: '0.5em' }}>
    //                         + Course
    //                     </button>

    //                     {/* Add nested group button */}
    //                     <button
    //                         type="button"
    //                         className="secondary-btn"
    //                         onClick={() => addNestedSubGroup(groupIndex, subGroupIndex)}
    //                         style={{ fontSize: '0.85em', padding: '0.3em 0.6em' }}>
    //                         + Group
    //                     </button>

    //                     {/* Nested sub-groups */}
    //                     {group.subGroups[subGroupIndex].subGroups.length > 0 && (
    //                         <div style={{ marginTop: '0.5em' }}>
    //                             {group.subGroups[subGroupIndex].subGroups.map((nestedGroup, nestedIndex) =>
    //                                 renderSubGroup(group.subGroups[subGroupIndex], groupIndex, nestedIndex, depth + 1)
    //                             )}
    //                         </div>
    //                     )}
    //                 </div>
    //             )}

    //             {/* Remove button */}
    //             <button
    //                 type="button"
    //                 className="remove_group_btn"
    //                 onClick={() => removeNestedSubGroup(groupIndex, subGroupIndex, subGroupIndex)}
    //                 style={{ fontSize: '0.85em', padding: '0.3em 0.6em', marginTop: '0.5em' }}>
    //                 Remove
    //             </button>
    //         </div>
    //     );
    // };


            

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
                {!prereqs ? (
                    <div style={{ marginTop: '0.5em' }}>
                        <select
                            value=""
                            onChange={(e) => {
                                updatePrereqs({
                                    type: e.target.value as JoinType,
                                    requirements: []
                                });
                            }}
                            style={{ padding: '0.5em', width: 'auto' }}>

                            <option value="">Select type...</option>
                            <option value={JoinType.COURSE}>{JoinType.COURSE}</option>
                            <option value={JoinType.AND}>{JoinType.AND}</option>
                            <option value={JoinType.OR}>{JoinType.OR}</option>
                        </select>
                    </div>
                ) : (
                    renderPrereqGroup(prereqs, 0)
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

