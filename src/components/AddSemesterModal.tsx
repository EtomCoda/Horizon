import { useState } from 'react';
import { X, Loader2, Shield } from 'lucide-react';

interface AddSemesterModalProps {
  onClose: () => void;
  onAdd: (name: string, level?: number, semesterNumber?: number) => Promise<void> | void;
  submissionError?: string | null;
}

const AddSemesterModal = ({ onClose, onAdd, submissionError }: AddSemesterModalProps) => {
  const [level, setLevel] = useState<number>(100);
  const [term, setTerm] = useState<number>(1);
  const [name, setName] = useState('100 Level - 1st Semester');
  const [isManualName, setIsManualName] = useState(false);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    if (!isManualName) {
      setName(`${newLevel} Level - ${term === 1 ? '1st' : '2nd'} Semester`);
    }
  };

  const handleTermChange = (newTerm: number) => {
    setTerm(newTerm);
    if (!isManualName) {
      setName(`${level} Level - ${newTerm === 1 ? '1st' : '2nd'} Semester`);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setIsManualName(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Semester name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass level and term as structured data
      await onAdd(name.trim(), level, term);
    } catch (err) {
      // Error handling by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Semester</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => handleLevelChange(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
                >
                  {[100, 200, 300, 400, 500, 600, 700].map(l => (
                    <option key={l} value={l}>{l} Level</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Semester
                </label>
                <select
                  value={term}
                  onChange={(e) => handleTermChange(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
                >
                  <option value={1}>1st Semester</option>
                  <option value={2}>2nd Semester</option>
                </select>
             </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Semester Name
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., First Semester 2024"
              maxLength={40}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {submissionError && <p className="text-red-500 text-sm mt-1">{submissionError}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
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
                'Add Semester'
              )}
            </button>
          </div>
          
          <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3" />
            Your data is private and stored securely.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AddSemesterModal;
