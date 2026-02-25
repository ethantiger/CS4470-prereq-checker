import { normalizeCourseCode, evaluateRequirement, checkCourse } from '../prereq checker/logic';
import { Student, PrereqItem, CoursesDatabase, JoinType } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStudent(courses: { code: string; grade: number }[]): Student {
  return {
    id: 1,
    name: 'Test Student',
    courses: courses.map(c => ({
      code: c.code,
      campus: 'UW',
      title: '',
      units: 0.5,
      grade: c.grade,
    })),
  };
}

// ---------------------------------------------------------------------------
// normalizeCourseCode
// ---------------------------------------------------------------------------

describe('normalizeCourseCode', () => {
  it('uppercases the code', () => {
    expect(normalizeCourseCode('cs1234')).toBe('CS1234');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeCourseCode('  CS 1234  ')).toBe('CS 1234');
  });

  it('strips trailing letter suffix after a digit', () => {
    // e.g. "CS1234A" → "CS1234"
    expect(normalizeCourseCode('CS1234A')).toBe('CS1234');
    expect(normalizeCourseCode('MATH2155B')).toBe('MATH2155');
  });

  it('does not strip letters that are part of the department prefix', () => {
    // "CS1234" – no trailing letter to strip
    expect(normalizeCourseCode('CS1234')).toBe('CS1234');
  });

  it('returns an empty string for an empty input', () => {
    expect(normalizeCourseCode('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// evaluateRequirement – COURSE type
// ---------------------------------------------------------------------------

describe('evaluateRequirement – COURSE', () => {
  const req: PrereqItem = { type: JoinType.COURSE, name: 'CS1234', minGrade: 60 };

  it('passes when the student has the course with a sufficient grade', () => {
    const student = makeStudent([{ code: 'CS1234', grade: 75 }]);
    const result = evaluateRequirement(req, student);
    expect(result.passed).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('fails when the student has the course but grade is too low', () => {
    const student = makeStudent([{ code: 'CS1234', grade: 55 }]);
    const result = evaluateRequirement(req, student);
    expect(result.passed).toBe(false);
    expect(result.missing[0]).toContain('CS1234');
    expect(result.missing[0]).toContain('60%');
  });

  it('fails when the student has never taken the course', () => {
    const student = makeStudent([]);
    const result = evaluateRequirement(req, student);
    expect(result.passed).toBe(false);
    expect(result.missing).toContain('CS1234');
  });

  it('uses the best grade across multiple attempts', () => {
    const student = makeStudent([
      { code: 'CS1234', grade: 45 },
      { code: 'CS1234', grade: 70 },
    ]);
    const result = evaluateRequirement(req, student);
    expect(result.passed).toBe(true);
  });

  it('normalizes course codes when matching', () => {
    // Student transcript may have suffix "A" on the code
    const student = makeStudent([{ code: 'CS1234A', grade: 80 }]);
    const result = evaluateRequirement(req, student);
    expect(result.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluateRequirement – AND type
// ---------------------------------------------------------------------------

describe('evaluateRequirement – AND', () => {
  const req: PrereqItem = {
    type: JoinType.AND,
    requirements: [
      { type: JoinType.COURSE, name: 'CS1234', minGrade: 60 },
      { type: JoinType.COURSE, name: 'MATH1234', minGrade: 60 },
    ],
  };

  it('passes when ALL courses are satisfied', () => {
    const student = makeStudent([
      { code: 'CS1234', grade: 75 },
      { code: 'MATH1234', grade: 70 },
    ]);
    expect(evaluateRequirement(req, student).passed).toBe(true);
  });

  it('fails when one course is missing', () => {
    const student = makeStudent([{ code: 'CS1234', grade: 75 }]);
    const result = evaluateRequirement(req, student);
    expect(result.passed).toBe(false);
    expect(result.missing).toContain('MATH1234');
  });

  it('fails when both courses are missing and reports both', () => {
    const student = makeStudent([]);
    const result = evaluateRequirement(req, student);
    expect(result.passed).toBe(false);
    expect(result.missing).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// evaluateRequirement – OR type
// ---------------------------------------------------------------------------

describe('evaluateRequirement – OR', () => {
  const req: PrereqItem = {
    type: JoinType.OR,
    requirements: [
      { type: JoinType.COURSE, name: 'CS1234', minGrade: 60 },
      { type: JoinType.COURSE, name: 'CS2345', minGrade: 60 },
    ],
  };

  it('passes when at least one course is satisfied', () => {
    const student = makeStudent([{ code: 'CS2345', grade: 80 }]);
    expect(evaluateRequirement(req, student).passed).toBe(true);
  });

  it('fails when neither course is satisfied', () => {
    const student = makeStudent([]);
    const result = evaluateRequirement(req, student);
    expect(result.passed).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it('passes even when one course grade is too low but the other satisfies', () => {
    const student = makeStudent([
      { code: 'CS1234', grade: 40 },
      { code: 'CS2345', grade: 75 },
    ]);
    expect(evaluateRequirement(req, student).passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkCourse
// ---------------------------------------------------------------------------

describe('checkCourse', () => {
  const db: CoursesDatabase = {
    CS3456: {
      credits: 0.5,
      prereqs: { type: JoinType.COURSE, name: 'CS1234', minGrade: 60 },
      antireqs: [],
    },
    CS4567: {
      credits: 0.5,
      prereqs: {
        type: JoinType.AND,
        requirements: [
          { type: JoinType.COURSE, name: 'CS1234', minGrade: 60 },
          { type: JoinType.COURSE, name: 'CS2345', minGrade: 60 },
        ],
      },
      antireqs: [],
    },
  };

  it('passes when the student meets all prerequisites', () => {
    const student = makeStudent([{ code: 'CS1234', grade: 80 }]);
    const result = checkCourse('CS3456', student, db);
    expect(result.passed).toBe(true);
  });

  it('fails when the student is missing a prerequisite', () => {
    const student = makeStudent([]);
    const result = checkCourse('CS3456', student, db);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Missing');
  });

  it('returns passed=true for a course not in the DB', () => {
    const student = makeStudent([]);
    const result = checkCourse('CS9999', student, db);
    expect(result.passed).toBe(true);
  });

  it('correctly reports multiple missing prereqs', () => {
    const student = makeStudent([]);
    const result = checkCourse('CS4567', student, db);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('CS1234');
    expect(result.reason).toContain('CS2345');
  });
});
