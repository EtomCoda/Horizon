import React, { useMemo } from 'react';
import { Target, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { getMaxCGPA, GradingScaleType } from '../../utils/gradePoints';
import { calculateCGPA, getTotalCredits } from '../../utils/gpaCalculations';
import { Semester, GoalData } from '../../types';
import { getGradePoints } from '../../utils/gradePoints';

interface GoalGapAnalysisProps {
  semesters: Semester[];
  gradingScale: string;
  goal: GoalData | null;
}

const GoalGapAnalysis: React.FC<GoalGapAnalysisProps> = ({ semesters, gradingScale, goal }) => {
  const scale = gradingScale as GradingScaleType;
  const maxCGPA = getMaxCGPA(scale);
  const gradePoints = getGradePoints(scale);
  
  const currentCGPA = useMemo(() => calculateCGPA(semesters, gradePoints), [semesters, gradePoints]);
  const currentCredits = useMemo(() => getTotalCredits(semesters), [semesters]);

  // Determine Target class/goal
  const targetData = useMemo(() => {
    // If user has a set goal, use it
    if (goal?.targetCGPA) {
        return { target: goal.targetCGPA, label: 'Your Goal' };
    }

    // Auto-detect next milestone
    if (maxCGPA === 5) {
        if (currentCGPA < 1.5) return { target: 1.5, label: 'Third Class' };
        if (currentCGPA < 2.4) return { target: 2.4, label: 'Second Class Lower' };
        if (currentCGPA < 3.5) return { target: 3.5, label: 'Second Class Upper' };
        if (currentCGPA < 4.5) return { target: 4.5, label: 'First Class' };
        return { target: 5.0, label: 'Perfect Score' };
    } else {
        // Assume 4.0 scale roughly
        if (currentCGPA < 2.5) return { target: 2.5, label: 'Lower Division' };
        if (currentCGPA < 3.0) return { target: 3.0, label: 'Upper Division' };
        if (currentCGPA < 3.5) return { target: 3.5, label: 'First Class' };
        return { target: 4.0, label: 'Perfect Score' };
    }
  }, [goal, currentCGPA, maxCGPA]);

  const analysis = useMemo(() => {
    if (currentCGPA >= targetData.target) {
        return { status: 'achieved', msg: "You have currently reached this milestone!" };
    }

    // Calculate Credits of 'A' (Max Points) needed to reach target
    // Formula: C_future = (Target * C_curr - P_curr) / (MaxCGPA - Target)
    
    // Safety check: if Target >= MaxCGPA (and we are below it), it's impossible unless MaxCGPA > Target technically (asymptotic).
    // If Target == MaxCGPA, you can never reach it if you are below it and stick to weighted average.
    // e.g. Current 4.9. Target 5.0. Need infinite 5.0s.
    // So we cap target slightly below Max if it equals Max? Or just say "Impossible"
    
    if (targetData.target >= maxCGPA) {
        return { status: 'impossible', msg: "Mathematically impossible to reach perfect CGPA given current deductions." };
    }

    // Calculate Average Credit Load (to handle fluctuating loads)
    // Filter out semesters with 0 credits to avoid skewing average with empty shells
    const activeSemesters = semesters.filter(s => {
        const semesterCredits = s.courses.reduce((sum, c) => sum + c.creditHours, 0);
        return semesterCredits > 0;
    });

    const totalHistoricalCredits = activeSemesters.reduce((sum, s) => {
        return sum + s.courses.reduce((cSum, c) => cSum + c.creditHours, 0);
    }, 0);

    // Default to 20 if no history, otherwise use actual average
    const averageLoad = activeSemesters.length > 0 
        ? Math.round(totalHistoricalCredits / activeSemesters.length) 
        : 20;

    const currentPoints = currentCGPA * currentCredits;
    const numerator = (targetData.target * currentCredits) - currentPoints;
    const denominator = maxCGPA - targetData.target;
    
    if (denominator <= 0) return { status: 'impossible', msg: "Target is unreachable." };

    const creditsNeeded = numerator / denominator;
    
    // Result
    if (creditsNeeded <= 0) return { status: 'achieved', msg: "You are consistent." };
    
    // Use the user's actual average load for the timeline prediction
    const semestersNeeded = Math.ceil(creditsNeeded / averageLoad);

    return { 
        status: 'pending', 
        creditsNeeded: Math.ceil(creditsNeeded),
        semestersNeeded,
        averageLoad // Pass this back to display context
    };

  }, [currentCGPA, currentCredits, targetData, maxCGPA, semesters]);

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
        {/* ... headers ... */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="w-32 h-32" />
        </div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                     <h3 className="text-blue-100 font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-2">
                         <TrendingUp className="w-4 h-4" /> Goal Gap Analysis
                     </h3>
                     <h2 className="text-3xl font-bold">{targetData.label}</h2>
                     <div className="flex items-baseline gap-2 mt-1">
                         <span className="text-4xl font-extrabold">{targetData.target.toFixed(2)}</span>
                         <span className="text-blue-200">Target GPA</span>
                     </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-blue-200">Current Gap</div>
                    <div className="text-2xl font-bold text-white">
                        {(targetData.target - currentCGPA).toFixed(2)}
                    </div>
                </div>
            </div>

            {analysis.status === 'achieved' && (
                <div className="bg-white/10 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                    <div>
                        <p className="font-bold text-lg">Goal Achieved!</p>
                        <p className="text-sm text-blue-100">You are currently sitting at {currentCGPA.toFixed(2)}. Keep it up!</p>
                    </div>
                </div>
            )}

            {analysis.status === 'impossible' && (
                 <div className="bg-white/10 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm">
                    <XCircle className="w-8 h-8 text-red-400" />
                    <div>
                        <p className="font-bold text-lg">Mathematically Unreachable</p>
                        <p className="text-sm text-blue-100">
                             Given your current credits, it is mathematically impossible to reach {targetData.target} even with straight As. 
                             Consider setting a slightly lower target.
                        </p>
                    </div>
                </div>
            )}

            {analysis.status === 'pending' && analysis.creditsNeeded && (
                <div className="space-y-4">
                     <p className="text-blue-100 text-lg">
                         To reach this goal, you need to maintain a <b>Perfect {maxCGPA.toFixed(1)} GPA</b> for:
                     </p>
                     
                     <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
                             <div className="text-4xl font-bold mb-1">{analysis.creditsNeeded}</div>
                             <div className="text-xs text-blue-200 uppercase tracking-wide">More Credits</div>
                         </div>
                         <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
                             <div className="text-4xl font-bold mb-1">~{analysis.semestersNeeded}</div>
                             <div className="text-xs text-blue-200 uppercase tracking-wide">Semesters</div>
                         </div>
                     </div>
                     
                     <p className="text-xs text-center text-blue-300 italic px-4">
                         *Trajectory based on your historical average of <b>{analysis.averageLoad} units</b> per semester.
                         {analysis.averageLoad < 15 && " (You take fewer courses than average, so recovery takes longer)."}
                     </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default GoalGapAnalysis;
