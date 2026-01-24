import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Target, TrendingUp, BookOpen, Settings, Info, Upload, Rocket } from 'lucide-react';
import { calculateCGPA, getTotalCredits } from '../utils/gpaCalculations';
import { useSettings } from '../contexts/SettingsContext';
import { getGradePoints, GradingScaleType, GRADING_SCALES, getMaxCGPA } from '../utils/gradePoints';
import { useData } from '../contexts/DataContext';
import SemesterCard from './SemesterCard';
import GoalCard from './GoalCard';
import AddSemesterModal from './AddSemesterModal';
import ScanResultsModal from './ScanResultsModal';
import { Course } from '../types';
import toast from 'react-hot-toast';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { gradingScale, setGradingScale } = useSettings();
  const {
    semesters,
    goal,
    loading,
    addSemester,
    deleteSemester,
    updateSemester,
    saveGoal,
    credits,
  } = useData();
  const { user } = useAuth();
  const location = useLocation();
  // ... existing hooks ...
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scannedCourses, setScannedCourses] = useState<Partial<Course>[]>([]);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.openAddSemester) {
      setIsAddModalOpen(true);
      window.history.replaceState({}, document.title);
    }
    // New check for tour replay
    if (location.state?.startTour) {
       // Clear the state so it doesn't loop
       window.history.replaceState({}, document.title);
       setTimeout(() => startTour(), 500);
    }
  }, [location]);

  // New User Welcome Logic
  useEffect(() => {
    // Check if new user
    if (!loading && user) {
        const createdAt = new Date(user.created_at || '');
        const now = new Date();
        const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
        
        const welcomeKey = `hasSeenWelcome_${user.id}`;
        const hasSeenWelcome = localStorage.getItem(welcomeKey);

        // Only show if account is fresh (e.g. created in last 3 mins) and not seen yet
        if (!hasSeenWelcome && diffInSeconds < 180) {
            let message = '';
            
            // Determine which bonus they got based on current balance
            // Base is 25. 
            // Referral is +30 => 55.
            // Promo is 120.
            // Promo + Referral = 150.
            if (credits >= 150) {
                message = "Double win! You got the Early Bird Promo (+120) AND Referral Bonus (+30)!";
            } else if (credits >= 120) {
                 message = "You're an Early Bird! Enjoy +120 Credits on us.";
            } else if (credits >= 55) {
                 message = "Your referral bonus (+30 Credits) has been applied!";
            } else {
                 return; // No special bonus, don't show toast
            }

            toast.custom((t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                         <Rocket className="h-10 w-10 text-blue-500" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Welcome aboard!
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ), { duration: 6000 });
              localStorage.setItem(welcomeKey, 'true');
        }
    }
  }, [loading, user, credits]);

  // Driver.js Tour Logic
  const startTour = () => {
    if (!user) return;
    
    // Close the toast if it exists basically
    toast.dismiss('tour-offer-toast');

    const driverObj = driver({
      showProgress: true,
      allowClose: true, // Allow them to click out if they change their mind
      steps: [
        { element: '#add-semester-btn', popover: { title: 'Add Semester', description: 'Start by manually adding your grades for a semester.' } },
        { element: '#upload-results-btn', popover: { title: 'Upload Your Result', description: 'Or scan a screenshot of your portal! Costs 15 Credits per scan.' } },
        { element: '#invite-btn', popover: { title: 'Get More Credits', description: 'Invite friends to earn +30 Credits each. Use credits for more scans and premium analytics.' } },
        { element: '#nav-credits', popover: { title: 'Your Balance', description: `You currently have ${credits} credits available for use.` } },
      ]
    });
    driverObj.drive();
    localStorage.setItem(`hasSeenTour_${user.id}`, 'true');
  };

  useEffect(() => {
     // Check if we need to offer the tour
     const tourKey = user ? `hasSeenTour_${user.id}` : null;
     
     if (!loading && user && semesters.length === 0 && tourKey && !localStorage.getItem(tourKey)) {
        // Instead of auto-starting, show a toast offer
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 p-4 flex flex-col gap-3`}>
                <div className="flex items-start gap-3">
                     <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                     </div>
                     <div>
                         <p className="font-medium text-gray-900 dark:text-white">New here?</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400">Would you like a quick tour of the features?</p>
                     </div>
                </div>
                <div className="flex gap-2 justify-end">
                     <button 
                        onClick={() => {
                            toast.dismiss(t.id);
                            localStorage.setItem(tourKey, 'skipped'); // Mark as seen/skipped so it doesn't nag
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                     >
                        No thanks
                     </button>
                     <button 
                        onClick={() => {
                             startTour();
                        }}
                        className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                     >
                        Start Tour
                     </button>
                </div>
            </div>
        ), { id: 'tour-offer-toast', duration: 10000 }); // Longer duration, give them time to decide
     }
  }, [loading, user, semesters]);


  const gradePoints = getGradePoints(gradingScale);
  const cgpa = calculateCGPA(semesters, gradePoints);
  const totalCredits = getTotalCredits(semesters);

  const handleAddSemester = async (name: string, level?: number, semesterNumber?: number) => {
    try {
      setAddError(null);
      await addSemester(name, scannedCourses, level, semesterNumber);
      setIsAddModalOpen(false);
      setScannedCourses([]); // Clear scanned courses
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'An unknown error occurred.');
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
            <option value="US_STANDARD_4_0">US / International Standard 4.0</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        {/* Removed "Available Credits" Card */}
      </div>

      

      {goal && (
        <GoalCard
          currentCGPA={cgpa}
          targetCGPA={goal.targetCGPA}
          maxCGPA={getMaxCGPA(gradingScale)}
          onUpdateGoal={saveGoal}
        />
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Semesters</h2>
        <div className="flex items-center gap-2"> 
            <button
            id="add-semester-btn"
            onClick={() => {
                setIsAddModalOpen(true);
                setAddError(null);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md text-sm"
            >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Semester</span>
            </button>
            <button
            id="upload-results-btn"
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md text-sm"
            >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Results</span>
            </button>
        </div>
      </div>

      {semesters.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No semesters yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start tracking your academic progress by adding your first semester or uploading your results
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
              onDelete={deleteSemester}
              onUpdate={updateSemester}
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
                onClick={() => saveGoal(3.5)}
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
          onClose={() => {
            setIsAddModalOpen(false);
            setScannedCourses([]); // Clear if cancelled
          }}
          onAdd={handleAddSemester}
          submissionError={addError}
        />
      )}

      {isScanModalOpen && (
        <ScanResultsModal
          onClose={() => setIsScanModalOpen(false)}
          onScanComplete={(courses) => {
            setScannedCourses(courses);
            setIsScanModalOpen(false);
            setIsAddModalOpen(true); // Open add semester modal to confirm name
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

