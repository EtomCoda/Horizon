export type Grade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E' | 'F';

export interface Course {
  id: string;
  name: string;
  creditHours: number;
  grade: Grade;
  semesterId?: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
  gpa: number;
}

export interface GoalData {
  targetCGPA: number;
}

export interface HypotheticalCourse {
  id: string;
  name: string;
  creditHours: number | string;
  grade: Grade;
}

export interface WhatIfData {
  currentCGPA: number;
  currentCredits: number;
  hypotheticalCourses: HypotheticalCourse[];
}
