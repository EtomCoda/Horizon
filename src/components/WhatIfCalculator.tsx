import { useState } from 'react';
import { Plus, Trash2, Calculator, RotateCcw, Info } from 'lucide-react';
import { HypotheticalCourse, Grade } from '../types';
import { GRADING_SCALES, getGradePoints } from '../utils/gradePoints';
import { calculateProjectedCGPA } from '../utils/gpaCalculations';
import { useSettings } from '../contexts/SettingsContext';

interface WhatIfCalculatorProps {
  initialCGPA?: number;
  initialCredits?: number;
}

const WhatIfCalculator = ({ initialCGPA = 0, initialCredits = 0 }: WhatIfCalculatorProps) => {
  const { gradingScale } = useSettings();
  const [currentCGPA, setCurrentCGPA] = useState(initialCGPA > 0 ? initialCGPA.toFixed(2) : '');
  const [currentCredits, setCurrentCredits] = useState(initialCredits > 0 ? initialCredits.toString() : '');
  const [courses, setCourses] = useState<HypotheticalCourse[]>([]);
  const [errors, setErrors] = useState<{ cgpa?: string; credits?: string }>({});

  const gradePoints = getGradePoints(gradingScale);

  const addCourse = () => {
    const newCourse: HypotheticalCourse = {
      id: crypto.randomUUID(),
      name: '',
      creditHours: 3,
      grade: 'A',
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof HypotheticalCourse, value: string | number | Grade) => {
    setCourses(courses.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const resetCalculator = () => {
    setCurrentCGPA('');
    setCurrentCredits('');
    setCourses([]);
    setErrors({});
  };

  const validateInputs = () => {
    setErrors({});
    const newErrors: { cgpa?: string; credits?: string } = {};
    const cgpa = parseFloat(currentCGPA);
    const credits = parseFloat(currentCredits);

    if (!currentCGPA || isNaN(cgpa) || cgpa < 0 || cgpa > 5.0) {
      newErrors.cgpa = 'Please enter a valid CGPA between 0.0 and 5.0';
    }

    if (!currentCredits || isNaN(credits) || credits < 0) {
      newErrors.credits = 'Please enter valid credit hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const projectedCGPA =
    currentCGPA && currentCredits && !errors.cgpa && !errors.credits
      ? calculateProjectedCGPA(
          parseFloat(currentCGPA),
          parseFloat(currentCredits),
          courses,
          gradePoints
        )
      : null;

  const newCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);
  const totalCreditsAfter = currentCredits ? parseFloat(currentCredits) + newCredits : newCredits;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What-If Calculator</h2>
              <div className="relative group">
                <Info className="w-5 h-5 text-gray-400 dark:text-gray-500 cursor-help" />
                <div className="absolute bottom-full mb-2 w-72 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  This tool helps you predict your future CGPA. Enter your current CGPA and credits, then add hypothetical courses and grades to see the potential outcome.
                  <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Predict your future CGPA by adding hypothetical courses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current CGPA
            </label>
            <input
              type="number"
              value={currentCGPA}
              onChange={(e) => {
                setCurrentCGPA(e.target.value);
                setErrors({ ...errors, cgpa: undefined });
              }}
              onBlur={validateInputs}
              placeholder="e.g., 3.5"
              min="0"
              max="5.0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
            {errors.cgpa && <p className="text-red-500 text-sm mt-1">{errors.cgpa}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Completed Credits
            </label>
            <input
              type="number"
              value={currentCredits}
              onChange={(e) => {
                setCurrentCredits(e.target.value);
                setErrors({ ...errors, credits: undefined });
              }}
              onBlur={validateInputs}
              placeholder="e.g., 60"
              min="0"
              step="0.5"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
            {errors.credits && <p className="text-red-500 text-sm mt-1">{errors.credits}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hypothetical Courses</h3>
          <div className="flex gap-2">
            {courses.length > 0 && (
              <button
                onClick={resetCalculator}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
            <button
              onClick={addCourse}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Course</span>
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-3">No hypothetical courses added yet</p>
            <button
              onClick={addCourse}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm transition-colors"
            >
              Add your first course to see projections
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, index) => (
              <div key={course.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    placeholder="Course name (optional)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all"
                  />
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Remove course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Credit Hours
                    </label>
                    <input
                      type="number"
                      value={course.creditHours}
                      onChange={(e) => updateCourse(course.id, 'creditHours', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Expected Grade
                    </label>
                    <select
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, 'grade', e.target.value as Grade)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all"
                    >
                      {GRADING_SCALES[gradingScale].map((g) => (
                        <option key={g.grade} value={g.grade}>
                          {g.grade} ({g.range}) - {g.points.toFixed(2)} pts
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {projectedCGPA !== null && (
        <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-md p-6 border-2 border-blue-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projected Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Current CGPA</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {parseFloat(currentCGPA).toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Projected CGPA</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {projectedCGPA.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {projectedCGPA > parseFloat(currentCGPA) ? '↑' : projectedCGPA < parseFloat(currentCGPA) ? '↓' : '='}{' '}
                {Math.abs(projectedCGPA - parseFloat(currentCGPA)).toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCreditsAfter.toFixed(1)}
              </p>
              {newCredits > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  +{newCredits.toFixed(1)} new credits
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfCalculator;
