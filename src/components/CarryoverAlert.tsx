
import React, { useState } from 'react';
import { AlertCircle, ChevronRight, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course } from '../types';

interface CarryoverAlertProps {
  carryovers: { course: Course; semesterName: string }[];
}

const CarryoverAlert: React.FC<CarryoverAlertProps> = ({ carryovers }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (carryovers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="overflow-hidden bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-xl shadow-sm transition-all duration-300">
          {/* Header / Collapsed View */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Academic Notice
                  <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Action Required
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You have {carryovers.length} {carryovers.length === 1 ? 'carryover' : 'carryovers'} that need attention.
                </p>
              </div>
            </div>
            
            <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              {isExpanded ? (
                <>Hide Details <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>View Details <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Unresolved carryovers can delay graduation. We recommend retaking these courses in upcoming semesters when your credit load allows.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {carryovers.map((item, index) => (
                      <div
                        key={`${item.course.id}-${index}`}
                        className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-lg border border-gray-200 dark:border-gray-700/50"
                      >
                        <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {item.course.name}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                            {item.semesterName}
                            <ChevronRight className="w-2 h-2 opacity-30" />
                            <span className="font-bold text-amber-600 dark:text-amber-400">Grade: {item.course.grade}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 w-fit px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800/30">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Tip: Settle lower-level courses first to lighten your final year workload.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CarryoverAlert;
