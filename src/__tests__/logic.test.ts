import { todo } from 'node:test';
import { normalizeCourseCode, evaluateRequirement, checkCourse } from '../prereq checker/logic';
import { Student, PrereqItem, CoursesDatabase, JoinType, Course } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStudent(courses: { code: string; grade: number | 'CR' | 'PAS' }[]): Student {
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
    expect(normalizeCourseCode('compsci1234')).toBe('COMPSCI1234');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeCourseCode('  COMPSCI 1234  ')).toBe('COMPSCI 1234');
  });

  it('strips trailing letter suffix after a digit', () => {
    // e.g. "COMPSCI1234A" → "COMPSCI1234"
    expect(normalizeCourseCode('COMPSCI1234A')).toBe('COMPSCI1234');
    expect(normalizeCourseCode('MATH2155B')).toBe('MATH2155');
  });

  it('does not strip letters that are part of the department prefix', () => {
    // "COMPSCI1234" – no trailing letter to strip
    expect(normalizeCourseCode('COMPSCI1234')).toBe('COMPSCI1234');
  });

  it('returns an empty string for an empty input', () => {
    expect(normalizeCourseCode('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// evaluateRequirement – COURSE type
// ---------------------------------------------------------------------------

describe('evaluateRequirement – COURSE', () => {
  const req: PrereqItem = { type: JoinType.COURSE, name: 'COMPSCI1025', minGrade: 60 };

  it('passes when the student has the course with a sufficient grade', () => {
    const student = makeStudent([{ code: 'COMPSCI1025', grade: 75 }]);
    const result = evaluateRequirement(req, student, {});
    expect(result.passed).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('fails when the student has the course but grade is too low', () => {
    const student = makeStudent([{ code: 'COMPSCI1025', grade: 55 }]);
    const result = evaluateRequirement(req, student, {});
    expect(result.passed).toBe(false);
    expect(result.missing[0]).toContain('COMPSCI1025');
    expect(result.missing[0]).toContain('60%');
  });

  it('fails when the student has never taken the course', () => {
    const student = makeStudent([]);
    const result = evaluateRequirement(req, student, {});
    expect(result.passed).toBe(false);
    expect(result.missing).toContain('COMPSCI1025');
  });

  // it('uses the best grade across multiple attempts', () => {
  //   const student = makeStudent([
  //     { code: 'CS1234', grade: 45 },
  //     { code: 'CS1234', grade: 70 },
  //   ]);
  //   const result = evaluateRequirement(req, student);
  //   expect(result.passed).toBe(true);
  // });

  todo('users most recent attempt rather than best grade across multiple attempts');

  it('normalizes course codes when matching', () => {
    // Student transcript may have suffix "A" on the code
    const student = makeStudent([{ code: 'COMPSCI1025A', grade: 80 }]);
    const result = evaluateRequirement(req, student, {});
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
      { type: JoinType.COURSE, name: 'COMPSCI2210', minGrade: 60 },
      { type: JoinType.COURSE, name: 'COMPSCI2211', minGrade: 60 },
    ],
  };

  it('passes when ALL courses are satisfied', () => {
    const student = makeStudent([
      { code: 'COMPSCI2210', grade: 75 },
      { code: 'COMPSCI2211', grade: 70 },
    ]);
    expect(evaluateRequirement(req, student, {}).passed).toBe(true);
  });

  it('fails when one course is missing', () => {
    const student = makeStudent([{ code: 'COMPSCI2210', grade: 75 }]);
    const result = evaluateRequirement(req, student, {});
    expect(result.passed).toBe(false);
    expect(result.missing).toContain('COMPSCI2211');
  });

  it('fails when both courses are missing and reports both', () => {
    const student = makeStudent([]);
    const result = evaluateRequirement(req, student, {});
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
      { type: JoinType.COURSE, name: 'COMPSCI1027', minGrade: 60 },
      { type: JoinType.COURSE, name: 'COMPSCI1037', minGrade: 60 },
      { type: JoinType.COURSE, name: 'COMPSCI2101', minGrade: 60 },
    ],
  };

  it('passes when at least one course is satisfied', () => {
    const student = makeStudent([{ code: 'COMPSCI2101', grade: 80 }]);
    expect(evaluateRequirement(req, student, {}).passed).toBe(true);
  });

  it('fails when neither course is satisfied', () => {
    const student = makeStudent([]);
    const result = evaluateRequirement(req, student, {});
    expect(result.passed).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it('passes even when one course grade is too low but the other satisfies', () => {
    const student = makeStudent([
      { code: 'COMPSCI1027', grade: 40 },
      { code: 'COMPSCI2101', grade: 75 },
    ]);
    expect(evaluateRequirement(req, student, {}).passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkCourse
// ---------------------------------------------------------------------------

describe('checkCourse', () => {
  const db: CoursesDatabase = {
    COMPSCI2214: {
      credits: 0.5,
      prereqs: {
        type: JoinType.AND,
        requirements: [
          { 
            type: JoinType.OR,
            requirements: [
              { type: JoinType.COURSE, name: 'COMPSCI1027', minGrade: 65 },
              { type: JoinType.COURSE, name: 'COMPSCI1037', minGrade: 65 },
              { type: JoinType.COURSE, name: 'COMPSCI2121', minGrade: 65 },
              { type: JoinType.COURSE, name: 'DH2221', minGrade: 65 },
            ]
          },
          { type: JoinType.COURSE, name: 'COMPSCI1020', minGrade: 60 },
          {
            type: JoinType.OR,
            credits: 1.0,
            requirements: [
              { type: JoinType.COURSE, name: 'APPLMATH1201', minGrade: 60 },
              { type: JoinType.COURSE, name: 'CALCULUS1000', minGrade: 60 },
              { type: JoinType.COURSE, name: 'CALCULUS1301', minGrade: 60 },
              { type: JoinType.COURSE, name: 'CALCULUS1500', minGrade: 60 },
              { type: JoinType.COURSE, name: 'CALCULUS1501', minGrade: 60 },
              { type: JoinType.COURSE, name: 'MATH1600', minGrade: 60 },
            ]
          }
        ]
      },
      antireqs: ['MATH2151', 'MATH2155'],
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
    const student = makeStudent([{ code: 'COMPSCI1027', grade: 80 }, { code: 'COMPSCI1020', grade: 70 }, { code: 'CALCULUS1500', grade: 90 }, { code: 'CALCULUS1000', grade: 85}]);
    const result = checkCourse('COMPSCI2214', student, db);
    expect(result.passed).toBe(true);
    expect(result.reason).toBe('Prerequisites satisfied');
    expect(result.flags).toBeNull();
  });

  it('fails when the student is missing a prerequisite', () => {
    const student = makeStudent([]);
    const result = checkCourse('COMPSCI2214', student, db);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Missing');
  });

  it('fails when the student has taken a prerequisite but with too low a grade', () => {
    const student = makeStudent([{ code: 'COMPSCI1027', grade: 50 }, { code: 'COMPSCI1020', grade: 70 }, { code: 'CALCULUS1500', grade: 90 }, { code: 'CALCULUS1000', grade: 85 }]);
    const result = checkCourse('COMPSCI2214', student, db);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('COMPSCI1027');
    expect(result.reason).toContain('65%');
    expect(result.reason).toContain('50%');
  });

  it('returns passed=true for a course not in the DB', () => {
    const student = makeStudent([]);
    const result = checkCourse('COMPSCI9999', student, db);
    expect(result.passed).toBe(true);
  });

  it('correctly reports multiple missing prereqs', () => {
    const student = makeStudent([{ code: 'COMPSCI1027', grade: 50 }, { code: 'CALCULUS1500', grade: 90 }]);
    const result = checkCourse('COMPSCI2214', student, db);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('COMPSCI1020');
  });

  it('flags courses passed with CR/PAS', () => {
    const student = makeStudent([{ code: 'COMPSCI1027', grade: 'CR' }, { code: 'COMPSCI1020', grade: 70 }, { code: 'CALCULUS1500', grade: 'PAS' }, { code: 'CALCULUS1000', grade: 'PAS' }]);
    const result = checkCourse('COMPSCI2214', student, db);
    expect(result.passed).toBe(true);
    expect(result.flags).toContain('COMPSCI1027 passed with CR/PAS');
    expect(result.flags).toContain('CALCULUS1500 passed with CR/PAS');
  });

  it('handles antirequisites properly', () => {
    const student = makeStudent([{ code: 'MATH2151', grade: 70 }]);
    const result = checkCourse('COMPSCI2214', student, db);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('antirequisite');
  });

  it('fails if not enough credits are earned from the OR group', () => {
    const student = makeStudent([{ code: 'COMPSCI1027', grade: 80 }, { code: 'COMPSCI1020', grade: 70 }, { code: 'CALCULUS1500', grade: 90 },]);
    const result = checkCourse('COMPSCI2214', student, db);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Requires at least 1 credits from');
  });

  todo('handles special cases like Program Status');
});
