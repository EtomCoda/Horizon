import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Target, TrendingUp, BookOpen, Settings, Info, Rocket } from 'lucide-react';
import { calculateCGPA, getTotalCredits } from '../utils/gpaCalculations';
import { useSettings } from '../contexts/SettingsContext';
import { getGradePoints, GradingScaleType, GRADING_SCALES, getMaxCGPA, isFailingGrade } from '../utils/gradePoints';
import { useData } from '../contexts/DataContext';
import SemesterCard from './SemesterCard';
import CarryoverAlert from './CarryoverAlert';
import GoalCard from './GoalCard';
import AddSemesterModal from './AddSemesterModal';
import BulkAddCoursesModal from './BulkAddCoursesModal';
import InsufficientFundsModal from './InsufficientFundsModal';
import { Course, Semester } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import OnboardingWizard from './OnboardingWizard';
import FeatureSpotlight from './FeatureSpotlight';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { gradingScale, setGradingScale } = useSettings();
  const {
    semesters,
    goal,
    loading,
    addSemester,
    addCourses,
    deleteSemester,
    updateSemester,
    saveGoal,
    credits,
  } = useData();
  const { user } = useAuth();
  const location = useLocation();
  // ... existing hooks ...
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
       setTimeout(() => setIsOnboardingOpen(true), 500);
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

  // Onboarding Logic
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
     // Check if we need to show onboarding
     const onboardingKey = user ? `hasSeenOnboarding_${user.id}` : null;
     
     if (!loading && user && semesters.length === 0 && onboardingKey && !localStorage.getItem(onboardingKey)) {
        setIsOnboardingOpen(true);
     }
  }, [loading, user, semesters]);

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    if (user) {
        localStorage.setItem(`hasSeenOnboarding_${user.id}`, 'true');
    }
    // Launch the add semester flow immediately
    setIsAddModalOpen(true);
    // Ensure we are in a state where upload option is visible if it's the first time
    setScannedCourses([]);
  };

  //Updates--
  // "What's New" spotlight: 
  // tells existing users that Add Semester
  // now includes the upload option inline.
  const [showUploadSpotlight, setShowUploadSpotlight] = useState(false);

  useEffect(() => {
    const spotlightKey = user ? `hasSeenUploadConsolidationSpotlight_${user.id}` : null;

    if (!loading && user && semesters.length > 0 && spotlightKey && !localStorage.getItem(spotlightKey)) {
      setShowUploadSpotlight(true);
    }
  }, [loading, user, semesters]);

  const dismissUploadSpotlight = () => {
    setShowUploadSpotlight(false);
    if (user) {
      localStorage.setItem(`hasSeenUploadConsolidationSpotlight_${user.id}`, 'true');
    }
  };


  const gradePoints = getGradePoints(gradingScale);
  const cgpa = calculateCGPA(semesters, gradePoints);
  const totalCredits = getTotalCredits(semesters);

  // Identify unresolved carryovers (failed courses that haven't been retaken and passed)
  const passedCourseNames = new Set<string>();
  semesters.forEach(sem => {
    (sem.courses || []).forEach(c => {
      if (!isFailingGrade(c.grade, gradingScale)) {
        passedCourseNames.add(c.name.trim().toUpperCase().replace(/\s+/g, ''));
      }
    });
  });

  const carryovers = semesters.flatMap(semester =>
    (semester.courses || [])
      .filter(course => isFailingGrade(course.grade, gradingScale))
      .filter(failedCourse => {
        const normalizedName = failedCourse.name.trim().toUpperCase().replace(/\s+/g, '');
        return !passedCourseNames.has(normalizedName);
      })
      .map(course => ({ course, semesterName: semester.name }))
  );

  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const { deductCredits } = useData();

  const handleFileUpload = async (file: File) => {
      if (credits < 15) {
          setShowInsufficientFunds(true);
          return;
      }

      setIsProcessingImage(true);
      const toastId = toast.loading('Processing your result...');

      try {
          // Convert file to base64
          const base64Image = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
          });

          // Call Supabase Edge Function
          const { data, error: functionError } = await supabase.functions.invoke('image-parse-gemini', {
              body: { image: base64Image },
          });

          if (functionError) {
              const message = functionError.context?.json?.error || functionError.message || 'Failed to process image';
              throw new Error(message);
          }

          if (!data || !Array.isArray(data.courses) || data.courses.length === 0) {
              throw new Error('No courses found in the image. Please try a clearer image.');
          }

          await deductCredits(15);
          setScannedCourses(data.courses);
          toast.success('Courses extracted successfully!', { id: toastId });
          
          // The modal is already open, but we want to switch the view to "Manual" so they can see the results
          // We can achieve this by ensuring the 'showUploadOption' prop evaluates to false effectively
          // But since 'scannedCourses' is now populated, the conditional `scannedCourses.length === 0` will update automatically
          
      } catch (err) {
          console.error('Scan failed:', err);
          toast.error(err instanceof Error ? err.message : 'Failed to process image', { id: toastId });
      } finally {
          setIsProcessingImage(false);
      }
  };

  const [pendingSemester, setPendingSemester] = useState<Semester | null>(null);

  const handleAddSemester = async (name: string, level?: number, semesterNumber?: number) => {
    try {
      setAddError(null);
      const wasManualEntry = scannedCourses.length === 0;
      const newSemester = await addSemester(name, scannedCourses, level, semesterNumber);
      setIsAddModalOpen(false);
      setScannedCourses([]); // Clear scanned courses
      if (wasManualEntry) {
        // Keep the flow going: let the user fill in courses right away instead of leaving an empty semester.
        setPendingSemester(newSemester);
      }
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const handleBulkAddCourses = async (courses: Omit<Course, 'id'>[]) => {
    if (!pendingSemester) return;
    try {
      if (courses.length > 0) {
        await addCourses(pendingSemester.id, courses);
      }
      setPendingSemester(null);
    } catch {
      // addCourses already surfaces a toast; keep the modal open so the user can retry.
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
      <OnboardingWizard 
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)} // Allow dismissal
        onComplete={handleOnboardingComplete}
        userName={user?.user_metadata?.full_name?.split(' ')[0]} // First name attempt
      />

      <CarryoverAlert carryovers={carryovers} />

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
            id="grading-scale-select"
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
        <div className="relative flex items-center gap-2">
            {showUploadSpotlight && (
              <FeatureSpotlight
                title="Upload results, right from here"
                description={`Add Semester now includes the AI upload option too.\nDrop a screenshot of your result and skip typing it in.`}
                onDismiss={dismissUploadSpotlight}
              />
            )}
            <button
            id="add-semester-btn"
            onClick={() => {
                setIsAddModalOpen(true);
                setAddError(null);
                dismissUploadSpotlight();
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md text-sm"
            >
            <Plus className="w-4 h-4" />
            Add Semester
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
          onScanComplete={handleFileUpload}
          showUploadOption={scannedCourses.length === 0 && !isProcessingImage}
        />
      )}

      {pendingSemester && (
        <BulkAddCoursesModal
          semesterName={pendingSemester.name}
          onClose={() => setPendingSemester(null)}
          onAdd={handleBulkAddCourses}
        />
      )}

      {showInsufficientFunds && (
        <div className="fixed inset-0 z-[60]"> 
            <InsufficientFundsModal 
                onClose={() => setShowInsufficientFunds(false)}
                neededCredits={15}
                currentCredits={credits}
            />
        </div>
      )}
    </div>
  );
};

export default Dashboard;

