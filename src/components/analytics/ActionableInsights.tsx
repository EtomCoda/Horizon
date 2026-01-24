import React, { useMemo } from 'react';
import { Course, Semester } from '../../types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getGradePoints, getMaxCGPA, GradingScaleType } from '../../utils/gradePoints';

interface ActionableInsightsProps {
  semesters: Semester[];
  gradingScale: string;
}

const ActionableInsights: React.FC<ActionableInsightsProps> = ({ semesters, gradingScale }) => {
  const scale = gradingScale as GradingScaleType;
  const gradePoints = getGradePoints(scale);
  const maxCGPA = getMaxCGPA(scale);

  // 1. Find Failed Courses
  const failedCourses = useMemo(() => {
    const failed: { course: Course; semester: Semester }[] = [];
    semesters.forEach(sem => {
      sem.courses.forEach(c => {
        // Assuming 'F' or 'E' is a fail, or grade point < 1.0 depending on system.
        // For simplicity, let's look for 'F' or 'E'.
        if (['F', 'E'].includes(c.grade)) {
            // Check if it has been passed later? 
            // The prompt implies we list strictly failed courses that might need attention.
            // But if they retook it and passed, is it still "actionable"?
            // "You failed MTH101". If MTH101 is passed in a later semester, we might filter it out.
            // For now, let's list all F's because they still impact the CGPA.
            failed.push({ course: c, semester: sem });
        }
      });
    });
    return failed;
  }, [semesters]);

  // Check if course was retaken and passed later
  // This requires course codes to match (e.g. "MTH101" == "MTH 101"). Normalizing needed.
  const activeFails = useMemo(() => {
      const passedCourseNames = new Set<string>();
      semesters.forEach(sem => {
          sem.courses.forEach(c => {
               if (!['F', 'E'].includes(c.grade)) {
                   passedCourseNames.add(c.name.trim().toUpperCase().replace(/\s+/g, ''));
               }
          });
      });

      return failedCourses.filter(f => {
          const name = f.course.name.trim().toUpperCase().replace(/\s+/g, '');
          // If pass exists, it's not an "active" retry need, but still an offset need.
          // User prompt: "List failed courses... Priority ranking...".
          // If I passed it later, I don't need to retake it. I just have the scar.
          return !passedCourseNames.has(name);
      });
  }, [failedCourses, semesters]);


  const calculateOffsetNeeds = (failedCourse: Course) => {
      // Logic: How many credits of 'A' (max points) needed to bring the average of (Fail + X) to say 3.5 (Second Class Upper bounds often)?
      // Or simply "Masking the F".
      // Let's use a "Buffer Recovery" target. 
      // Failed 3 units (0 pts). Total 3 units. GPA 0.
      // Target GPA for this cluster: 4.0 (B average).
      // (0 + 5X) / (3 + X) = 4.0
      // 5X = 12 + 4X  => X = 12.
      
      // Let's make the target dynamic based on MaxCGPA.
      // If Max is 5, Target 4.0. If Max 4, Target 3.0.
      const targetForCluster = maxCGPA * 0.8; // Aim for 80% performance
      const pointsPerA = gradePoints['A'] || maxCGPA;
      
      // Formula: (0 + A*X) / (C + X) = T
      // AX = TC + TX
      // X(A - T) = TC
      // X = TC / (A - T)
      
      const failedCredits = failedCourse.creditHours;
      const creditsNeeded = (failedCredits * targetForCluster) / (pointsPerA - targetForCluster);
      
      return Math.ceil(creditsNeeded);
  };
  
  const getNextRetakeOpportunity = (sem: Semester) => {
      if (sem.level && sem.semester_number) {
          const nextLevel = sem.level + 100;
          return `${nextLevel} Level - ${sem.semester_number === 1 ? '1st' : '2nd'} Semester`;
      }
      return "Next Academic Session";
  };

  if (activeFails.length === 0) return null;

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Action Required
            </h3>
            <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">
                {activeFails.length} Failed Courses
            </span>
       </div>
       
       <div className="grid gap-4">
           {activeFails.map(({ course, semester }, idx) => {
               const offsetCredits = calculateOffsetNeeds(course);
               const nextOpportunity = getNextRetakeOpportunity(semester);
               
               return (
                   <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-5 border-l-4 border-red-500 shadow-sm">
                       <div className="flex justify-between items-start mb-4">
                           <div>
                               <h4 className="font-bold text-lg text-gray-900 dark:text-white">{course.name}</h4>
                               <p className="text-sm text-red-500 font-medium">{course.creditHours} Credits • {course.grade} Grade</p>
                           </div>
                           <div className="text-right">
                               <span className="inline-block bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded border border-red-100 dark:border-red-900/30">
                                   Failed in {semester.name}
                               </span>
                           </div>
                       </div>
                       
                       <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                           <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                               <RefreshCw className="w-4 h-4 text-blue-500" /> Recovery Plan
                           </h5>
                           
                           <div className="space-y-4">
                               {/* Step 1: Immediate Offset */}
                               <div className="flex gap-3 relative pb-4 border-l-2 border-green-200 dark:border-green-900/50 pl-4 ml-2">
                                   <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                                   <div>
                                       <h6 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Step 1: Immediate Damage Control</h6>
                                       <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-2">
                                           The 'F' is currently lowering your GPA. Neutralize this impact in your <b>current other courses</b>:
                                       </p>
                                       <div className="bg-white dark:bg-gray-800 p-2 rounded border border-green-100 dark:border-green-900/30 inline-block">
                                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                                Target: <span className="font-bold">{offsetCredits} Credits</span> of 'A' Grades
                                            </p>
                                       </div>
                                       <p className="text-[10px] text-gray-400 mt-1 italic">
                                           (approx. {Math.ceil(offsetCredits/3)} courses)
                                       </p>
                                   </div>
                               </div>

                               {/* Step 2: Future Retake */}
                               <div className="flex gap-3 relative pl-4 ml-2 border-l-2 border-transparent">
                                   <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800"></span>
                                   <div>
                                        <h6 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Step 2: The Retake</h6>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            Register for this course again in:
                                        </p>
                                        <div className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-1">
                                            {nextOpportunity}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-2">
                                            *Note: Retaking will average your grade, not replace it. Aim for an 'A' to maximize recovery.
                                        </p>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
               );
           })}
       </div>
    </div>
  );
};

export default ActionableInsights;
