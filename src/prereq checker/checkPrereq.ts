import { Requirement } from '@/prereq checker/prereqTypes';
import { Student } from '@/types';

export function checkRequirement(req: Requirement, student: Student): boolean {
  switch (req.type) {
    case "AND":
      return req.requirements.every(r => checkRequirement(r, student));

    case "OR":
      return req.requirements.some(r => checkRequirement(r, student));

    case "COURSE": {
      const course = student.courses.find(
        c => c.code === req.name || c.title === req.name
      );
      if (!course) return false;
      if (req.minGrade !== undefined && course.grade < req.minGrade) return false;
      return true;
    }

    /*
    case "REGISTRATION":
      return student.program === req.program;

    case "STATUS":
      return student.status?.includes(req.name) ?? false;
    */
    default:
      return false;
  }
}
