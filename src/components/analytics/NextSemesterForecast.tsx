import React, { useMemo } from 'react';
import { Semester} from '../../types';
import { getGradePoints, getMaxCGPA, GradingScaleType } from '../../utils/gradePoints';
import { calculateCGPA, getTotalCredits } from '../../utils/gpaCalculations';
import { Calculator, ArrowRight, Target } from 'lucide-react';

interface NextSemesterForecastProps {
  semesters: Semester[];
  gradingScale: string;
}

const NextSemesterForecast: React.FC<NextSemesterForecastProps> = ({ semesters, gradingScale }) => {
  const scale = gradingScale as GradingScaleType;
  const gradePoints = getGradePoints(scale);
  const maxCGPA = getMaxCGPA(scale);

  const currentCGPA = useMemo(() => calculateCGPA(semesters, gradePoints), [semesters, gradePoints]);
  const currentCredits = useMemo(() => getTotalCredits(semesters), [semesters]);

  // Determine standard load (assume 20 if no history, or average of existing) as DEFAULT ONLY
  const defaultLoad = useMemo(() => {
    const activeSemesters = semesters.filter(s => s.courses.length > 0);
    if (activeSemesters.length === 0) return 20;
    const totalCreditsHistory = activeSemesters.reduce((sum, s) => {
        return sum + s.courses.reduce((cSum, c) => cSum + c.creditHours, 0);
    }, 0);
    const avg = totalCreditsHistory / activeSemesters.length;
    return Math.round(avg / 5) * 5 || 20; 
  }, [semesters]);

  const [predictedCredits, setPredictedCredits] = React.useState(defaultLoad);

  // Update effect if defaultLoad changes (e.g. data load) and user hasn't touched it? 
  // For simplicity, let's trust the initial state, but maybe reset if data changes drastically.
  // Actually, standard useState init is fine.

  const scenarios = useMemo(() => {
    // Scenarios: "Maintain" (Current GPA), "Improve" (Targeting say +0.2 boost or max possible), "Goal Track"
    
    const calculateNewCGPA = (nextSemGPA: number) => {
        const currentPoints = currentCGPA * currentCredits;
        const nextPoints = nextSemGPA * predictedCredits;
        return (currentPoints + nextPoints) / (currentCredits + predictedCredits);
    };

    const maxGeneric = maxCGPA; // 5.0 or 4.0
    const realisticBestProps = maxGeneric * 0.9; // 4.5 or 3.6 - often "First Class" boundary

    return [
        {
            label: 'Consistency',
            gpa: currentCGPA,
            result: calculateNewCGPA(currentCGPA),
            color: 'bg-gray-100 dark:bg-gray-700',
            text: 'text-gray-600 dark:text-gray-300'
        },
        {
            label: 'Strong Finish',
            gpa: realisticBestProps, 
            result: calculateNewCGPA(realisticBestProps),
            color: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-600 dark:text-blue-400'
        },
        {
            label: 'Perfect Semester',
            gpa: maxGeneric,
            result: calculateNewCGPA(maxGeneric),
            color: 'bg-green-50 dark:bg-green-900/20',
            text: 'text-green-600 dark:text-green-400'
        }
    ];
  }, [currentCGPA, currentCredits, predictedCredits, maxCGPA]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Next Semester Forecast</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        See how next semester affects your total CGPA.
                    </p>
                </div>
            </div>

            {/* Interactive Slider Control */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center gap-4 border border-gray-200 dark:border-gray-600">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Projected Load:
                </span>
                <div className="flex items-center gap-3">
                    <input 
                        type="range" 
                        min="10" 
                        max="30" 
                        step="1"
                        value={predictedCredits}
                        onChange={(e) => setPredictedCredits(parseInt(e.target.value))}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-blue-600"
                    />
                    <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[3rem]">
                        {predictedCredits} Unit{predictedCredits !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario, idx) => (
                <div key={idx} className={`p-4 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all ${scenario.color}`}>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${scenario.text}`}>
                            {scenario.label}
                        </span>
                        {idx === 2 && <Target className="w-4 h-4 text-green-500" />}
                    </div>
                    
                    <div className="mb-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">If you get</div>
                        <div className={`text-2xl font-bold ${scenario.text}`}>{scenario.gpa.toFixed(2)} GPA</div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                        <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="mt-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Your New CGPA</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {scenario.result.toFixed(2)}
                        </div>
                        <div className={`text-xs font-bold mt-1 ${scenario.result > currentCGPA ? 'text-green-500' : 'text-gray-400'}`}>
                            {scenario.result > currentCGPA ? `+${(scenario.result - currentCGPA).toFixed(2)}` : 'No Change'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default NextSemesterForecast;
