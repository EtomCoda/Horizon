import { useState } from 'react';
import { X, Plus, Trash2, Loader2, ListChecks } from 'lucide-react';
import { Grade, Course } from '../types';
import { GRADING_SCALES } from '../utils/gradePoints';
import { useSettings } from '../contexts/SettingsContext';

interface CourseRow {
  key: number;
  name: string;
  creditHours: string;
  grade: Grade;
}

interface BulkAddCoursesModalProps {
  semesterName: string;
  onClose: () => void;
  onAdd: (courses: Omit<Course, 'id'>[]) => Promise<void> | void;
}

let rowKeySeq = 0;
const createRow = (): CourseRow => ({ key: rowKeySeq++, name: '', creditHours: '', grade: 'A' });

const BulkAddCoursesModal = ({ semesterName, onClose, onAdd }: BulkAddCoursesModalProps) => {
  const { gradingScale } = useSettings();
  const [rows, setRows] = useState<CourseRow[]>([createRow(), createRow(), createRow()]);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRow = (key: number, patch: Partial<CourseRow>) => {
    setRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));
    if (rowErrors[key]) {
      setRowErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const addRow = () => setRows(prev => [...prev, createRow()]);

  const removeRow = (key: number) => {
    setRows(prev => (prev.length > 1 ? prev.filter(r => r.key !== key) : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filled = rows.filter(r => r.name.trim() || r.creditHours.trim());
    if (filled.length === 0) {
      onClose();
      return;
    }

    const errors: Record<number, string> = {};
    const validCourses: Omit<Course, 'id'>[] = [];

    filled.forEach(row => {
      const credits = parseFloat(row.creditHours);
      if (!row.name.trim()) {
        errors[row.key] = 'Course name is required';
        return;
      }
      if (!row.creditHours || isNaN(credits) || credits <= 0 || credits > 6) {
        errors[row.key] = 'Credit hours must be between 0 and 6';
        return;
      }
      validCourses.push({ name: row.name.trim(), creditHours: credits, grade: row.grade });
    });

    if (Object.keys(errors).length > 0) {
      setRowErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(validCourses);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Courses</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">for {semesterName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            {/* Column headers, desktop only */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_120px_140px_40px] gap-3 px-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course Name</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</span>
              <span />
            </div>

            {rows.map((row, index) => (
              <div key={row.key} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_140px_40px] gap-3 items-start bg-gray-50 dark:bg-gray-900/30 sm:bg-transparent dark:sm:bg-transparent p-3 sm:p-0 rounded-lg">
                <div>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(row.key, { name: e.target.value })}
                    placeholder={`Course ${index + 1} name`}
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={row.creditHours}
                    onChange={(e) => updateRow(row.key, { creditHours: e.target.value })}
                    placeholder="Credits"
                    min="0"
                    max="6"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all text-sm"
                  />
                </div>
                <div>
                  <select
                    value={row.grade}
                    onChange={(e) => updateRow(row.key, { grade: e.target.value as Grade })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all text-sm cursor-pointer"
                  >
                    {GRADING_SCALES[gradingScale].map((g) => (
                      <option key={g.grade} value={g.grade}>{g.grade}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  disabled={rows.length === 1}
                  className="justify-self-end sm:justify-self-auto p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                  title="Remove row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {rowErrors[row.key] && (
                  <p className="sm:col-span-4 text-red-500 text-xs -mt-1">{rowErrors[row.key]}</p>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Another Course
            </button>
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              I'll Do This Later
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Courses'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkAddCoursesModal;
