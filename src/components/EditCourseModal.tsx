import { useState } from 'react';
import { X } from 'lucide-react';
import { Grade, Course } from '../types';
import { GRADING_SCALES } from '../utils/gradePoints';
import { useSettings } from '../contexts/SettingsContext';

interface EditCourseModalProps {
  course: Course;
  onClose: () => void;
  onSave: (course: Course) => void;
}

const EditCourseModal = ({ course, onClose, onSave }: EditCourseModalProps) => {
  const { gradingScale } = useSettings();
  const [name, setName] = useState(course.name);
  const [creditHours, setCreditHours] = useState(course.creditHours.toString());
  const [grade, setGrade] = useState<Grade>(course.grade);
  const [errors, setErrors] = useState<{ name?: string; creditHours?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; creditHours?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Course name is required';
    }

    const credits = parseFloat(creditHours);
    if (!creditHours || isNaN(credits) || credits <= 0 || credits > 6) {
      newErrors.creditHours = 'Please enter credit hours between 0 and 6';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...course,
      name: name.trim(),
      creditHours: credits,
      grade,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Course</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: undefined });
              }}
              placeholder="e.g., Introduction to Artificial Intelligence"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Credit Hours
            </label>
            <input
              type="number"
              value={creditHours}
              onChange={(e) => {
                setCreditHours(e.target.value);
                setErrors({ ...errors, creditHours: undefined });
              }}
              placeholder="e.g., 3"
              min="0"
              max="6"
              step="0.5"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
            {errors.creditHours && <p className="text-red-500 text-sm mt-1">{errors.creditHours}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grade
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as Grade)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            >
              {GRADING_SCALES[gradingScale].map((g) => (
                <option key={g.grade} value={g.grade}>
                  {g.grade} ({g.range})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;
