import { Grade } from '../types';

export type GradingScaleType = 'DEFAULT' |'DEFAULT_WITH_E' | 'NUC_REFORM_4_0' | 'STRICT_PRIVATE_5_0';

export interface GradeDefinition {
  grade: Grade;
  points: number;
  range: string;
}

export const GRADING_SCALES: Record<GradingScaleType, GradeDefinition[]> = {
  DEFAULT: [
    { grade: 'A', points: 5.0, range: '70-100' },
    { grade: 'B', points: 4.0, range: '60-69' },
    { grade: 'C', points: 3.0, range: '50-59' },
    { grade: 'D', points: 2.0, range: '45-49' },
    { grade: 'F', points: 0.0, range: '0-44' },
  ],
  DEFAULT_WITH_E: [
    { grade: 'A', points: 5.0, range: '70-100' },
    { grade: 'B', points: 4.0, range: '60-69' },
    { grade: 'C', points: 3.0, range: '50-59' },
    { grade: 'D', points: 2.0, range: '45-49' },
    { grade: 'E', points: 1.0, range: '40-44' },
    { grade: 'F', points: 0.0, range: '0-39' },
  ],
  NUC_REFORM_4_0: [
    { grade: 'A', points: 4.0, range: '70-100' },
    { grade: 'B', points: 3.0, range: '60-69' },
    { grade: 'C', points: 2.0, range: '50-59' },
    { grade: 'D', points: 1.0, range: '45-49' },
    { grade: 'F', points: 0.0, range: '0-44' },
  ],
  STRICT_PRIVATE_5_0: [
    { grade: 'A', points: 5.0, range: '75-100' },
    { grade: 'B', points: 4.0, range: '65-74' },
    { grade: 'C', points: 3.0, range: '50-64' },
    { grade: 'D', points: 2.0, range: '45-49' },
    { grade: 'E', points: 1.0, range: '40-44' },
    { grade: 'F', points: 0.0, range: '0-39' },
  ],
};

// Helper to get points map for a specific scale
export const getGradePoints = (scale: GradingScaleType): Record<string, number> => {
  return GRADING_SCALES[scale].reduce((acc, curr) => {
    acc[curr.grade] = curr.points;
    return acc;
  }, {} as Record<string, number>);
};

// Helper to get grades list for a specific scale
export const getGrades = (scale: GradingScaleType): Grade[] => {
  return GRADING_SCALES[scale].map(g => g.grade);
};

// Default export for backward compatibility (pointing to DEFAULT as it was the original)
export const GRADE_POINTS = getGradePoints('DEFAULT');
export const GRADES = getGrades('DEFAULT');
