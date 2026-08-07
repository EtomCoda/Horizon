import { useState } from 'react';
import { X, AlertTriangle, Trash2, Settings as SettingsIcon, GraduationCap, MessageSquare, PlayCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { GradingScaleType, GRADING_SCALES } from '../utils/gradePoints';
import DeleteAccountModal from './DeleteAccountModal';
import { useModalA11y } from '../hooks/useModalA11y';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { gradingScale, setGradingScale } = useSettings();
  const [activeTab, setActiveTab] = useState<'general' | 'account'>('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);

  const handleReplayTutorial = () => {
    if (user) {
        localStorage.removeItem(`hasSeenTour_${user.id}`);
        onClose();
        navigate('/dashboard', { state: { startTour: true } });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          tabIndex={-1}
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl transform transition-all animate-scale-in flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 id="settings-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'account'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50 dark:bg-red-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Account
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {activeTab === 'general' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                    Grading Scale
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Select the grading system used by your institution. This affects all GPA calculations.
                      </p>
                      <select
                          value={gradingScale}
                          onChange={(e) => setGradingScale(e.target.value as GradingScaleType)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                      >
                          <option value="DEFAULT">Default 5.0 Scale (A=5, B=4...)</option>
                          <option value="DEFAULT_WITH_E">Default 5.0 Scale with E (A=5... E=1)</option>
                          <option value="NUC_REFORM_4_0">NUC 4.0 Reform Scale (A=4, B=3...)</option>
                          <option value="STRICT_PRIVATE_5_0">Strict Private Uni Scale (A=5, B=4...) </option>
                          <option value="US_STANDARD_4_0">US / International Standard 4.0</option>
                      </select>

                      <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                              Breakdown
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                              {GRADING_SCALES[gradingScale].map((g) => (
                                  <div key={g.grade} className="flex justify-between text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">{g.grade} ({g.range}%)</span>
                                      <span className="font-mono text-gray-500 dark:text-gray-400">{g.points} pts</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                    Help & Support
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 space-y-1">
                      <button
                          onClick={handleReplayTutorial}
                          className="w-full flex items-center justify-between p-3 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-colors group text-left"
                      >
                          <div className="flex items-center gap-3">
                               <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                                   <PlayCircle className="w-4 h-4" />
                               </div>
                               <div>
                                   <p className="text-sm font-medium text-gray-900 dark:text-white">Replay Tutorial</p>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">Restart the guided tour of the application</p>
                               </div>
                          </div>
                      </button>
                      
                      <Link
                          to="/feedback"
                          onClick={onClose}
                          className="w-full flex items-center justify-between p-3 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-colors group text-left"
                      >
                          <div className="flex items-center gap-3">
                               <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                                   <MessageSquare className="w-4 h-4" />
                               </div>
                               <div>
                                   <p className="text-sm font-medium text-gray-900 dark:text-white">Send Feedback</p>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">Report bugs or suggest new features</p>
                               </div>
                          </div>
                      </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-6 flex flex-col items-center text-center">
                    <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-full mb-3">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-red-900 dark:text-white mb-2">Delete Account</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mb-6">
                        Permanently remove your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md transition-all font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteAccountModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onSuccess={onClose}
      />
    </>
  );
}
