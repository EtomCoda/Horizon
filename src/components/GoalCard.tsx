import { useState } from 'react';
import { Target, TrendingUp, Info } from 'lucide-react';

interface GoalCardProps {
  currentCGPA: number;
  targetCGPA: number;
  onUpdateGoal: (targetCGPA: number) => void;
}

const GoalCard = ({ currentCGPA, targetCGPA, onUpdateGoal }: GoalCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(targetCGPA.toString());
  const [error, setError] = useState('');

  const difference = targetCGPA - currentCGPA;
  const progress = targetCGPA > 0 ? Math.min((currentCGPA / targetCGPA) * 100, 100) : 0;

  const handleSave = () => {
    const target = parseFloat(newTarget);
    if (isNaN(target) || target < 0 || target > 5.0) {
      setError('Please enter a valid CGPA between 0.0 and 5.0');
      return;
    }
    onUpdateGoal(target);
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-md p-6 border-2 border-blue-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">My Goal</h3>
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                <div className="absolute bottom-full mb-2 w-64 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Set a target CGPA to track your progress over time. This helps you stay focused on your academic objectives.
                  <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your target CGPA</p>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setIsEditing(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Edit Target CGPA
            </label>
            <input
              type="number"
              value={newTarget}
              onChange={(e) => {
                setNewTarget(e.target.value);
                setError('');
              }}
              min="0"
              max="5.0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all mb-2"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewTarget(targetCGPA.toString());
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Current CGPA</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentCGPA.toFixed(2)}</p>
            </div>
            <div 
              className="bg-white dark:bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Target CGPA</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{targetCGPA.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Difference</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {difference >= 0 ? '+' : ''}{difference.toFixed(2)}
                </p>
                {difference < 0 && <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{progress.toFixed(2)}%</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentCGPA >= targetCGPA ? (
              <p className="text-green-600 dark:text-green-400 text-sm mt-2 font-medium">
                Congratulations! You've reached your goal!
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                Keep working towards your goal of {targetCGPA.toFixed(2)}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GoalCard;
