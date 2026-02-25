// @/data/coursesDB.ts
import coursesData from '@/data/courses.json';
import { Requirement } from '@/prereq checker/prereqTypes';

// Define the shape of a single course from your JSON
export type CourseInfo = {
  prereqs: Requirement | null; // Note the null here, since your JSON uses null for no prereqs
  antireqs: string[];
};

// Cast the imported JSON into a generic Record (dictionary)
// This tells TypeScript: "Assume any string key will return a CourseInfo object or undefined"
export const coursesDB = coursesData.courses as Record<string, CourseInfo>;