// This file defines the structure of prerequisite rules

export type Requirement =
  | AndRequirement
  | OrRequirement
  | CourseRequirement
  | RegistrationRequirement
  | StatusRequirement;

// AND condition: all requirements must be true
export interface AndRequirement {
  type: "AND";
  requirements: Requirement[];
}

// OR condition: at least one requirement must be true
export interface OrRequirement {
  type: "OR";
  requirements: Requirement[];
}

// Course requirement: must have completed a course
export interface CourseRequirement {
  type: "COURSE";
  name: string;       // course code or name
  minGrade?: number;  // optional minimum grade
}

// Program requirement: must be registered in a program
export interface RegistrationRequirement {
  type: "REGISTRATION";
  program: string;
}

// Status requirement: must have a certain academic status
export interface StatusRequirement {
  type: "STATUS";
  name: string;
}
