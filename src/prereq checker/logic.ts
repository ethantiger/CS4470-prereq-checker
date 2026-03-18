import { Student, PrereqItem, CoursesDatabase, PrereqGroupWithCredits } from '@/types';

// Helper: Strips trailing letters (A, B, F, G, etc.) from course codes
export function normalizeCourseCode(code: string): string {
  if (!code) return "";
  // Trim whitespace, uppercase, and remove trailing letters that follow a digit
  return code.trim().toUpperCase().replace(/(\d)[A-Z]+$/i, '$1');
}


//Evaluate AND/OR cases
export function evaluateRequirement(req: PrereqItem, student: Student, coursesDB: CoursesDatabase): { passed: boolean; missing: string[]; flags: string[]; } {
  switch (req.type) {
    case "AND": {
      const missing: string[] = [];
      const flags: string[] = [];
      let passed = true;
      for (const r of req.requirements) {
        const result = evaluateRequirement(r, student, coursesDB);
        flags.push(...result.flags);
        if (!result.passed) {
          passed = false;
          missing.push(...result.missing);
        }
      }
      return { passed, missing, flags };
    }

    case "OR": {
      if ('credits' in req && req.credits !== undefined) {
        let credits = 0;
        let missing = "Requires at least " + req.credits + " credits from (" + req.requirements.map(r => 'name' in r ? r.name : '').join(" OR ") + ")";
        const flags: string[] = [];
        for (const r of req.requirements) {
          const result = evaluateRequirement(r, student, coursesDB);
          flags.push(...result.flags);
          if (result.passed) {
            credits += coursesDB[r.name]?.credits || 0.5;
          }
        }
        missing += `, but only ${credits} earned`;

        return { passed: credits >= req.credits, missing: [missing], flags };
      } else {
        const results = req.requirements.map(r => evaluateRequirement(r, student, coursesDB));
        const flags = results.flatMap(res => res.flags);
        //If ANY of the OR conditions are met, it passes
        if (results.some(res => res.passed)) {
          return { passed: true, missing: [], flags };
        } 
        const allMissing = results.flatMap(res => res.missing);

        //if any of the failed courses were actually attempted
        //Adds "(Requires)" to the string
        const attemptedButFailed = allMissing.filter(missingStr => missingStr.includes("(Requires"));

        if (attemptedButFailed.length > 0) {
          //If student attempted at least one of the courses but didn't get the grade,
          //Show the courses they attempted and failed
          return { passed: false, missing: [attemptedButFailed.join(" OR ")], flags };
        }

        //If they never attempted ANY of the options, show the standard (A OR B OR C) format
        const missingOptions = results.map(res => res.missing.join(" AND ")).join(" OR ");
        return { passed: false, missing: [`(${missingOptions})`], flags };
      }
    }

    case "COURSE": {
      const normalizedReqName = normalizeCourseCode(req.name);

      //Find ALL attempts the student made at this specific course
      const attempts = student.courses.filter(c => {
        const normalizedStudentCode = normalizeCourseCode(c.code);
        const normalizedStudentTitle = c.title ? normalizeCourseCode(c.title) : "";
        
        return normalizedStudentCode === normalizedReqName || normalizedStudentTitle === normalizedReqName;
      });

      //If they never even attempted it, it's missing entirely
      if (attempts.length === 0) {
        return { passed: false, missing: [req.name], flags: [] };
      }

      if (attempts.some(a => a.grade === 'CR' || a.grade === 'PAS')) {
        return { passed: true, missing: [], flags: [`${req.name} passed with CR/PAS`] }; // They passed with CR/PAS!
      }
      //Find their highest grade across all attempts
      const bestGrade = Math.max(...attempts.map(a => (typeof a.grade === 'number' ? a.grade : 0)));
      const requiredGrade = req.minGrade !== undefined ? req.minGrade : 0; // default to 0 if no minGrade

      if (bestGrade >= requiredGrade) {
        return { passed: true, missing: [], flags: [] }; // They passed!
      } else {
        //They took it but the grade < minGrade 
        //Append the grade info directly to the missing string
        return { 
          passed: false, 
          missing: [`${req.name} (Requires ${requiredGrade}%, got ${bestGrade}%)`],
          flags: []
        };
      }
    }
    default:
      return { passed: false, missing: ["Unknown requirement"], flags: [] };
  }
}


export function checkCourse(courseCode: string, student: Student, coursesDB: CoursesDatabase) {
  const cleanTargetCode = normalizeCourseCode(courseCode);
  const courseInfo = coursesDB[cleanTargetCode];

  for (const c in student.courses) {
    const normalizedStudentCode = normalizeCourseCode(student.courses[c].code);
    if (courseInfo.antireqs.find((antireq: string) => normalizeCourseCode(antireq) === normalizedStudentCode)) {
      return { passed: false, reason: `Failed due to antirequisite: ${student.courses[c].code}` };
    }
  }

  if (!courseInfo) {
    return { passed: true, reason: `Course ${cleanTargetCode} not found in DB` };
  }
  
  if (!courseInfo.prereqs) {
    return { passed: true, reason: "" };
  }

  //Extract the boolean and missing array from the result object
  const result = evaluateRequirement(courseInfo.prereqs, student, coursesDB);
  
  return {
    passed: result.passed, 
    reason: result.passed ? "Prerequisites satisfied" : `Missing: ${result.missing.join(", ")}`,
    flags: result.flags.length > 0 ? `Flagged: ${result.flags.join(", ")}` : null
  };
}