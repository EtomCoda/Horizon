import { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, BookOpen, Settings, Info } from 'lucide-react';
import { Semester, GoalData } from '../types';
import { calculateCGPA, getTotalCredits } from '../utils/gpaCalculations';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { getGradePoints, GradingScaleType, GRADING_SCALES } from '../utils/gradePoints';
import { semesterService, courseService, goalService } from '../services/database';
import SemesterCard from './SemesterCard';
import GoalCard from './GoalCard';
import AddSemesterModal from './AddSemesterModal';

interface DashboardProps {
  onValuesChange?: (cgpa: number, credits: number) => void;
}

const Dashboard = ({ onValuesChange }: DashboardProps) => {
  const { user } = useAuth();
  const { gradingScale, setGradingScale } = useSettings();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const semestedData = await semesterService.getAll(user.id);
        for (const semester of semestedData) {
          semester.courses = await courseService.getBySemesterId(semester.id);
        }
        setSemesters(semestedData);
        const goalData = await goalService.get(user.id);
        setGoal(goalData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const gradePoints = getGradePoints(gradingScale);
  const cgpa = calculateCGPA(semesters, gradePoints);
  const totalCredits = getTotalCredits(semesters);

  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(cgpa, totalCredits);
    }
  }, [cgpa, totalCredits, onValuesChange]);

  const handleAddSemester = async (name: string) => {
    if (!user) return;
    try {
      setAddError(null);
      const newSemester = await semesterService.create(user.id, name);
      setSemesters([...semesters, newSemester]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding semester:', error);
      setAddError(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const handleDeleteSemester = async (id: string) => {
    try {
      await semesterService.delete(id);
      setSemesters(semesters.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting semester:', error);
    }
  };

  const handleUpdateSemester = async (updatedSemester: Semester) => {
    const oldSemesters = semesters;
    setSemesters(semesters.map(s => s.id === updatedSemester.id ? updatedSemester : s));

    try {
      await semesterService.update(updatedSemester.id, updatedSemester.name);
    } catch (error) {
      alert(`Error: Could not update semester name. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
      console.error('Error updating semester:', error);
      setSemesters(oldSemesters);
    }
  };

  const handleSaveGoal = async (targetCGPA: number) => {
    if (!user) return;
    try {
      await goalService.upsert(user.id, targetCGPA);
      setGoal({ targetCGPA });
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grading System</h3>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Select your preferred grading scale. This will update all GPA calculations across the application.
            </p>
            <div className="relative group inline-block">
              <div className="flex items-center gap-2 cursor-help text-blue-600 dark:text-blue-400 text-sm font-medium">
                <Info className="w-4 h-4" />
                <span>View Scale Details</span>
              </div>
              <div className="absolute left-0 bottom-full mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-xl">
                <p className="font-bold mb-2 border-b border-gray-700 pb-1">
                  {gradingScale.replace(/_/g, ' ')}
                </p>
                <div className="space-y-1">
                  {GRADING_SCALES[gradingScale].map((g) => (
                    <div key={g.grade} className="flex justify-between">
                      <span>{g.grade} ({g.range})</span>
                      <span className="font-mono">{g.points} pts</span>
                    </div>
                  ))}
                </div>
                <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                  <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                </svg>
              </div>
            </div>
          </div>
          <select
            value={gradingScale}
            onChange={(e) => setGradingScale(e.target.value as GradingScaleType)}
            className="block w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          >
            <option value="DEFAULT">Default 5.0 Scale</option>
            <option value="DEFAULT_WITH_E">Default 5.0 Scale with E</option>
            <option value="NUC_REFORM_4_0">NUC 4.0 Reform Scale </option>
            <option value="STRICT_PRIVATE_5_0">Strict Private Uni Scale </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Current CGPA</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {cgpa.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Credits</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalCredits}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-[rgb(34,149,197)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Semesters</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {semesters.length}
              </p>
            </div>
            <div className="bg-[rgb(34,149,197)]/20 p-3 rounded-lg">
              <Target className="w-6 h-6 text-[rgb(34,149,197)]" />
            </div>
          </div>
        </div>
      </div>

      {goal && (
        <GoalCard
          currentCGPA={cgpa}
          targetCGPA={goal.targetCGPA}
          onUpdateGoal={handleSaveGoal}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Semesters</h2>
        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setAddError(null);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Semester</span>
        </button>
      </div>

      {semesters.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No semesters yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start tracking your academic progress by adding your first semester
          </p>
          <button
            onClick={() => {
            setIsAddModalOpen(true);
            setAddError(null);
          }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors animate-pulse"
          >
            Add Your First Semester
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {semesters.map((semester) => (
            <SemesterCard
              key={semester.id}
              semester={semester}
              onDelete={handleDeleteSemester}
              onUpdate={handleUpdateSemester}
            />
          ))}
        </div>
      )}

      {!goal && semesters.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-md p-6 border border-blue-200 dark:border-gray-600">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Set Your Goal
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Track your progress by setting a target CGPA goal
              </p>
              <button
                onClick={() => handleSaveGoal(3.5)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Set Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddSemesterModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddSemester}
          submissionError={addError}
        />
      )}
    </div>
  );
};

export default Dashboard;

