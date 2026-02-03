import { Student } from '@/types';
import { coursesDB } from '@/data/coursesDB';
import { checkRequirement } from './checkPrereq';

export function checkCourse(courseCode: string, student: Student) {
  const courseInfo = (coursesDB as any)[courseCode];

  if (!courseInfo) {
    return {
      passed: true,
      reason: "Course not found in database"
    };
  }
  
  if (!courseInfo || !courseInfo.prereqs) {
    return { passed: true, reason: "No prerequisites" };
  }

  const passed = checkRequirement(courseInfo.prereqs, student);

  return {
    passed,
    reason: passed ? "Prerequisites satisfied" : "Missing prerequisites"
  };
}
