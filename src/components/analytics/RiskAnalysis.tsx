import React, { useMemo } from 'react';
import { Semester } from '../../types';
import { getGradePoints, GradingScaleType } from '../../utils/gradePoints';
import { AlertTriangle, TrendingDown, Clock, Zap } from 'lucide-react';

interface RiskAnalysisProps {
  semesters: Semester[];
  gradingScale: string;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ semesters, gradingScale }) => {
  const scale = gradingScale as GradingScaleType;
  const gradePoints = getGradePoints(scale);

  // Helper to get grade point for a course
  const getPoint = (grade: string) => gradePoints[grade] || 0;

  // 1. High Credit Load Risk
  // Check if performance drops significantly in courses with credit > 3
  const creditLoadRisk = useMemo(() => {
    let heavyCredits = 0;
    let heavyPoints = 0;
    let lightCredits = 0;
    let lightPoints = 0;

    semesters.forEach(s => {
      s.courses.forEach(c => {
        const p = getPoint(c.grade);
        if (c.creditHours >= 4) {
          heavyPoints += p * c.creditHours;
          heavyCredits += c.creditHours;
        } else {
          lightPoints += p * c.creditHours;
          lightCredits += c.creditHours;
        }
      });
    });

    if (heavyCredits === 0 || lightCredits === 0) return null;

    const heavyGPA = heavyPoints / heavyCredits;
    const lightGPA = lightPoints / lightCredits;

    // Report risk if heavy courses are > 1.0 GPA points lower than light courses
    if (lightGPA - heavyGPA > 0.7) {
      return {
        type: 'heavy_load',
        diff: lightGPA - heavyGPA,
        heavyGPA,
        lightGPA
      };
    }
    return null;
  }, [semesters, gradePoints]);

  // 2. Semester Fatigue (Second Semester Syndrome)
  const semesterFatigueRisk = useMemo(() => {
    let firstSemPoints = 0, firstSemCredits = 0;
    let secondSemPoints = 0, secondSemCredits = 0;

    semesters.forEach(s => {
      // Strict Mode: Only use structured data. No assumptions.
      // If we don't know for a fact it's Sem 1 or 2, we skip this semester for comparison logic.
      if (!s.semester_number) return;

      const isFirst = s.semester_number === 1;
      const isSecond = s.semester_number === 2;
      
      const totalP = s.courses.reduce((acc, c) => acc + (getPoint(c.grade) * c.creditHours), 0);
      const totalC = s.courses.reduce((acc, c) => acc + c.creditHours, 0);

      if (isFirst) {
        firstSemPoints += totalP;
        firstSemCredits += totalC;
      } else if (isSecond) {
        secondSemPoints += totalP;
        secondSemCredits += totalC;
      }
    });

    if (firstSemCredits === 0 || secondSemCredits === 0) return null;

    const firstGPA = firstSemPoints / firstSemCredits;
    const secondGPA = secondSemPoints / secondSemCredits;

    if (firstGPA - secondGPA > 0.5) {
      return {
        type: 'semester_fatigue',
        diff: firstGPA - secondGPA,
        firstGPA,
        secondGPA
      };
    }
    return null;
  }, [semesters, gradePoints]);

  // 3. Subject Specific Weakness
  const subjectRisks = useMemo(() => {
    const subjects: Record<string, { points: number; credits: number; grades: string[] }> = {};

    semesters.forEach(s => {
      s.courses.forEach(c => {
         const match = c.name.match(/^([a-zA-Z]+)/);
         if (match) {
             const subject = match[1].toUpperCase();
             if (!subjects[subject]) subjects[subject] = { points: 0, credits: 0, grades: [] };
             subjects[subject].points += getPoint(c.grade) * c.creditHours;
             subjects[subject].credits += c.creditHours;
             subjects[subject].grades.push(c.grade);
         }
      });
    });

    const risks = Object.entries(subjects).map(([subject, data]) => {
        const gpa = data.points / data.credits;
        // Risk if GPA is low (< 2.5 ~ C average) AND they have taken at least 2 courses
        if (gpa < 2.5 && data.grades.length >= 2) {
            return { subject, gpa, count: data.grades.length };
        }
        return null;
    }).filter(r => r !== null); // Removing unnecessary sort for now, assume filtering is enough

    return risks as { subject: string; gpa: number; count: number }[];
  }, [semesters, gradePoints]);


  if (!creditLoadRisk && !semesterFatigueRisk && subjectRisks.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Risk Pattern Analysis</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We detected recurring patterns that negatively affect your GPA.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Heavy Load Risk */}
            {creditLoadRisk && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-5">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                        <TrendingDown className="w-5 h-5 text-yellow-600" /> Heavy Course Fatigue
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        You perform significantly lower in <b>4+ unit courses</b> compared to smaller ones.
                    </p>
                    <div className="flex items-center justify-between text-xs mb-3">
                         <span className="text-gray-500">Light Course GPA:</span>
                         <span className="font-bold text-green-600">{creditLoadRisk.lightGPA.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-4">
                         <span className="text-gray-500">Heavy Course GPA:</span>
                         <span className="font-bold text-red-500">{creditLoadRisk.heavyGPA.toFixed(2)}</span>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-3 rounded text-xs text-gray-600 dark:text-gray-400 italic border-l-2 border-yellow-500">
                        "Prioritize heavyweight courses. They carry 2x the GPA impact but receive your lowest grades."
                    </div>
                </div>
            )}

            {/* 2. Semester Fatigue */}
            {semesterFatigueRisk && (
                 <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-lg p-5">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-orange-600" /> Second Semester Slump
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Your GPA consistently drops by <b>{semesterFatigueRisk.diff.toFixed(2)} points</b> in the second semester.
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mb-4 overflow-hidden flex">
                        <div className="bg-green-500 h-full" style={{ width: '50%' }}></div>
                        <div className="bg-orange-500 h-full" style={{ width: '50%', opacity: 0.6 }}></div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded text-xs text-gray-600 dark:text-gray-400 italic border-l-2 border-orange-500">
                        "This is likely due to burnout. Consider reducing your load by 2-3 units in 2nd semesters."
                    </div>
                </div>
            )}

            {/* 3. Subject Risks */}
            {subjectRisks.map(risk => (
                 <div key={risk.subject} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-5">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-red-600" /> {risk.subject} Difficulty
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        You have taken {risk.count} {risk.subject} courses and struggle to maintain a C average.
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="text-2xl font-bold text-red-600">{risk.gpa.toFixed(1)}</div>
                        <div className="text-xs text-red-400 font-medium">AVG GPA</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded text-xs text-gray-600 dark:text-gray-400 italic border-l-2 border-red-500">
                        "Consider study groups or extra tutorials specifically for {risk.subject} modules."
                    </div>
                </div>
            ))}

        </div>
    </div>
  );
};

export default RiskAnalysis;
