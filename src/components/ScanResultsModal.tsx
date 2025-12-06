import { useState, useRef } from 'react';
import { Upload, X, Loader2, FileImage, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Course } from '../types';

interface ScanResultsModalProps {
  onClose: () => void;
  onScanComplete: (courses: Partial<Course>[]) => void;
}

const ScanResultsModal = ({ onClose, onScanComplete }: ScanResultsModalProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setError(null);

    try {
      if (selectedImage.size > 4 * 1024 * 1024) {
        throw new Error('Image too large. Please use an image under 4MB.');
      }

      // Convert file to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      // Call Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('image-parse-gemini', {
        body: { image: base64Image },
      });

      if (functionError) {
        if (import.meta.env.DEV) {
          console.error('Edge Function Error Details:', functionError);
        }
        // Try to extract a meaningful message if possible
        const message = functionError.context?.json?.error || functionError.message || 'Failed to process image';
        throw new Error(message);
      }

      if (!data || !Array.isArray(data.courses)) {
        throw new Error('Invalid response from scanner');
      }

      if (data.courses.length === 0) {
        throw new Error('No courses found in the image. Please try a clearer image.');
      }

      onScanComplete(data.courses);
      onClose();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Scan failed:', err);
      }
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Upload Results
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {!selectedImage ? (
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-2">
                Click to upload a screenshot of your result
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG up to 4MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={previewUrl!} alt="Preview" className="w-full h-48 object-cover" />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleScan}
              disabled={!selectedImage || isScanning}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Scan & Import'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanResultsModal;
