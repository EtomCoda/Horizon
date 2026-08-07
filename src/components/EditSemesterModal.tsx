import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';

interface EditSemesterModalProps {
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

const EditSemesterModal = ({ currentName, onClose, onSave }: EditSemesterModalProps) => {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Semester name is required');
      return;
    }

    onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-semester-modal-title"
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 id="edit-semester-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">Edit Semester</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="edit-semester-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Semester Name
            </label>
            <input
              id="edit-semester-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Fall 2024, Spring 2025"
              aria-invalid={!!error}
              aria-describedby={error ? 'edit-semester-name-error' : undefined}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
            {error && (
              <p id="edit-semester-name-error" className="flex items-center gap-1.5 text-red-500 text-sm mt-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3">
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

export default EditSemesterModal;
