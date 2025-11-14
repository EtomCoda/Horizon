import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock } from 'lucide-react';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully! You can now sign in with your new password.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <img src="/horizon.png" alt="Horizon logo" className="w-32 h-32 object-contain shadow-xl rounded-xl" />
        </div>
        <p className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Reset Your Password
        </p>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Enter your new password below.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-400 text-sm">{message}</p>
          </div>
        )}

        {!message && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors mt-6"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        {message && (
            <div className="mt-6 text-center">
                <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Back to Sign In
                </a>
            </div>
        )}
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
