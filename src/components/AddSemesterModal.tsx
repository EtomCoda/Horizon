import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Shield, Upload, FileText, FileImage, AlertCircle } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';

interface AddSemesterModalProps {
  onClose: () => void;
  onAdd: (name: string, level?: number, semesterNumber?: number) => Promise<void> | void;
  submissionError?: string | null;
  onScanComplete?: (file: File) => void;
  showUploadOption?: boolean;
}

const AddSemesterModal = ({ 
  onClose, 
  onAdd, 
  submissionError,
  onScanComplete,
  showUploadOption = false 
}: AddSemesterModalProps) => {
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);
  const [level, setLevel] = useState<number>(100);
  const [term, setTerm] = useState<number>(1);
  const [name, setName] = useState('100 Level - 1st Semester');
  const [isManualName, setIsManualName] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
    } catch {
      // Error handling by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    setError('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScanClick = () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
      return;
    }
    if (onScanComplete) {
      onScanComplete(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-semester-modal-title"
        tabIndex={-1}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full transition-all duration-300 ${showUploadOption ? 'max-w-4xl' : 'max-w-md'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 id="add-semester-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">Add Your Results</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className={`p-6 ${showUploadOption ? 'grid grid-cols-1 md:grid-cols-5 gap-8' : ''}`}>
          {/* Manual Entry Form — secondary path */}
          <div className={showUploadOption ? 'md:col-span-2 md:border-r md:border-gray-200 dark:md:border-gray-700 md:pr-8' : ''}>
             {showUploadOption && (
               <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                   <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                 </div>
                 <h4 className="text-base font-medium text-gray-600 dark:text-gray-300">Enter Manually</h4>
               </div>
             )}

             <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label htmlFor="add-semester-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level
                    </label>
                    <select
                      id="add-semester-level"
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
                    <label htmlFor="add-semester-term" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester
                    </label>
                    <select
                      id="add-semester-term"
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
                <label htmlFor="add-semester-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Semester Name
                </label>
                <input
                  id="add-semester-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g., First Semester 2024"
                  maxLength={40}
                  aria-invalid={!!(error || submissionError)}
                  aria-describedby={error || submissionError ? 'add-semester-name-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                {error && <div id="add-semester-name-error" className="flex items-center gap-1.5 mt-2 text-red-500 text-sm"><AlertCircle className="w-4 h-4"/>{error}</div>}
                {submissionError && (
                  <div id="add-semester-name-error" className="flex items-center gap-1.5 mt-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {submissionError}
                  </div>
                )}
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
            </form>
          </div>

          {/* Upload Option (Integrated) — primary path */}
          {showUploadOption && onScanComplete && (
            <div className="md:col-span-3 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                   <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                 </div>
                 <h4 className="text-lg font-bold text-gray-900 dark:text-white">Upload Result</h4>
              </div>

              {selectedFile && previewUrl ? (
                <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4 min-h-[220px] bg-gray-50 dark:bg-gray-900/30">
                  <img
                    src={previewUrl}
                    alt="Preview of the uploaded result screenshot, ready to scan"
                    className="w-full h-full max-h-[320px] object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                  >
                    Choose Different Image
                  </button>
                  <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div
                  className={`flex-1 border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center mb-4 min-h-[220px]
                      ${dragActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-blue-300 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                      }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <FileImage className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {dragActive ? 'Drop image here' : 'Drop your screenshot here'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-[240px] mx-auto">
                      Click to browse or drag and drop your result screenshot.<br /> Courses fill in automatically
                  </p>
                  <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                  />

                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}

               <button
                  type="button"
                  onClick={handleScanClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md"
                >
                  <span>{selectedFile ? 'Scan & Import' : 'Choose Image'}</span>
                  {selectedFile && (
                    <span className="bg-blue-500/30 text-xs px-2 py-0.5 rounded-full border border-blue-400/30 font-semibold">
                      15 🪙
                    </span>
                  )}
               </button>

               <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                    <strong>Tip:</strong> Ensure the course codes and grades are clearly visible.
                  </p>
               </div>
            </div>
          )}
        </div>

        {!showUploadOption && (
          <div className="pb-6">
             <p className="text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" />
              Your data is private and stored securely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddSemesterModal;
