import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useModalA11y } from '../hooks/useModalA11y';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose, onSuccess }: DeleteAccountModalProps) {
  const { deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const dialogRef = useModalA11y<HTMLDivElement>(onClose, isOpen);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmDelete !== 'DELETE') {
        return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted successfully',{duration: 3000});
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-modal-title"
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all animate-scale-in border border-red-100 dark:border-red-900/50"
      >

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-red-50/50 dark:bg-red-900/10">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
               <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="delete-account-modal-title" className="text-lg font-bold text-red-900 dark:text-red-100">Delete Account?</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <p>
                    This action is <span className="font-bold text-red-600 dark:text-red-400">permanent</span> and cannot be undone.
                </p>
                <p>
                    You will permanently lose all your:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1 text-gray-500 dark:text-gray-400">
                    <li>Semester records and courses</li>
                    <li>GPA history and goals</li>
                    <li>Account settings</li>
                </ul>
            </div>

            <div className="pt-2">
                <label htmlFor="delete-account-confirm" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    To confirm, type "DELETE" below
                </label>
                <input
                    id="delete-account-confirm"
                    type="text"
                    value={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.value)}
                    className="block w-full rounded-lg border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-white placeholder-red-300 dark:placeholder-red-800 focus:border-red-500 focus:ring-red-500 sm:text-sm p-3 transition-colors outline-none"
                    placeholder="DELETE"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting || confirmDelete !== 'DELETE'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all ${
                        isDeleting || confirmDelete !== 'DELETE'
                            ? 'bg-red-300 dark:bg-red-900/50 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                    }`}
                >
                    {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                    Delete Account
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
