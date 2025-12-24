import { useState, useEffect } from 'react';
import {  useAuth } from "../contexts/AuthContext";

import { supabase } from "../lib/supabase";

const Suggestions = () => {
  const [subject, setSubject] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const { user } = useAuth();
  const username = user ? user.user_metadata.username : ' ';
  const email = user ? user.email : ' ';

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
        const { error } = await supabase.functions.invoke('send-suggestion-ack', {
            body: {
                email: email,
                name: username,
                subject: subject,
                suggestion: suggestion,
            },
        });

        if (error) {
            console.error('Error invoking edge function:', error);
            throw new Error(error.message || 'Failed to submit suggestion');
        }

        setSubmitStatus('success');
        setSubject('');
        setSuggestion('');
        setCooldown(60); // Start 60s cooldown
    } catch (err) {
        console.error('Submission error:', err);
        setSubmitStatus('error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Suggestions & Feedback
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Have an idea for a new feature or an improvement? I'd love to hear it!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
          required
        />
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="Enter your suggestion here..."
          className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting || cooldown > 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors mt-6"
        >
          {isSubmitting ? 'Submitting...' : cooldown > 0 ? `Submit again in ${cooldown}s` : 'Submit Suggestion'}
        </button>
      </form>

      {submitStatus === 'success' && (
        <p className="mt-4 text-green-600 dark:text-green-400">
          Thank you for your suggestion!
        </p>
      )}
      {submitStatus === 'error' && (
        <p className="mt-4 text-red-600 dark:text-red-400">
          Something went wrong. Please try again later.
        </p>
      )}
    </div>
  );
};

export default Suggestions;
