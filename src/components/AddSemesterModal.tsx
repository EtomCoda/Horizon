import { useState } from 'react';
import { X, Loader2, Shield } from 'lucide-react';

interface AddSemesterModalProps {
  onClose: () => void;
  onAdd: (name: string) => Promise<void> | void;
  submissionError?: string | null;
}

const AddSemesterModal = ({ onClose, onAdd, submissionError }: AddSemesterModalProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Semester name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(name.trim());
    } catch (err) {
      // Error handling is mostly done by parent via submissionError,
      // but we catch here to ensure finally block runs and spinner stops if parent doesn't close modal
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Semester Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., First Semester 2024, Second Semester 2025"
              maxLength={30}
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
