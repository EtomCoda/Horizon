import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { GradingScaleType, GRADING_SCALES } from '../utils/gradePoints';
import { ChevronRight, GraduationCap, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '../hooks/useModalA11y';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userName?: string;
}

export default function OnboardingWizard({ isOpen, onClose, onComplete, userName }: OnboardingWizardProps) {
  const { gradingScale, setGradingScale } = useSettings();
  const [step, setStep] = useState(1);
  const dialogRef = useModalA11y<HTMLDivElement>(onClose, isOpen);

  if (!isOpen) return null;

  const nextStep = () => setStep(s => s + 1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-wizard-title"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 w-full">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: '33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 1 && (
              <div className="space-y-6 text-center py-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">👋</span>
                </div>
                <div>
                  <h2 id="onboarding-wizard-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to Horizon{userName ? `, ${userName}` : ''}!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Your personal academic companion. Let's get you set up to track, forecast, and achieve your GPA goals.
                  </p>
                </div>
                <button
                  onClick={nextStep}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all"
                >
                  Let's Get Started
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 id="onboarding-wizard-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Check your Grading System
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    Accuracy is key. Which grading scale does your institution use?
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-3 mb-4">
                    <GraduationCap className="w-6 h-6 text-blue-500" />
                    <label htmlFor="onboarding-grading-scale" className="text-sm font-medium text-gray-900 dark:text-white">
                      Select Grading Scale
                    </label>
                  </div>

                  <select
                    id="onboarding-grading-scale"
                    value={gradingScale}
                    onChange={(e) => setGradingScale(e.target.value as GradingScaleType)}
                    className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-shadow"
                  >
                    <option value="DEFAULT">Default 5.0 Scale (A=5, B=4...)</option>
                    <option value="DEFAULT_WITH_E">Default 5.0 Scale with E (A=5... E=1)</option>
                    <option value="NUC_REFORM_4_0">NUC 4.0 Reform Scale (A=4, B=3...)</option>
                    <option value="STRICT_PRIVATE_5_0">Strict Private Uni Scale (A=5, B=4...) </option>
                    <option value="US_STANDARD_4_0">US / International Standard 4.0</option>
                  </select>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Preview</p>
                     <div className="grid grid-cols-5 gap-2 text-center">
                        {GRADING_SCALES[gradingScale].slice(0, 5).map(g => (
                          <div key={g.grade} className="bg-white dark:bg-gray-800 rounded p-2 shadow-sm border border-gray-200 dark:border-gray-600">
                            <div className="font-bold text-gray-800 dark:text-white">{g.grade}</div>
                            <div className="text-xs text-gray-500">{g.points}</div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
                >
                  Looks Good, Continue
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-center py-4">
                <div className="bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 id="onboarding-wizard-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    You're All Set!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    The only thing left is to add your first semester. You can type it in manually or upload a screenshot.
                  </p>
                </div>
                
                <button
                  onClick={onComplete}
                  className="w-full py-4 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  Add First Semester
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
