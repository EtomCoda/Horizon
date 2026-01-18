import { useState } from 'react';
import { X, Copy, Check, Users, Gift, Share2, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useData } from '../contexts/DataContext';

interface InviteModalProps {
  onClose: () => void;
}

const InviteModal = ({ onClose }: InviteModalProps) => {
  const { referralCode, referralCount } = useData();
  const [copied, setCopied] = useState(false);
  
  const MAX_REFERRALS = 10;
  const isMaxed = referralCount >= MAX_REFERRALS;

  // Generate link only if code exists
  const inviteLink = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode}`
    : window.location.origin;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareData = {
    title: 'Join me on ' + (import.meta.env.VITE_APP_NAME || 'Horizon'),
    text: 'Track your GPA and predict your grades! Use my link to get +30 Credits.',
    url: inviteLink,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
             handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-br from-blue-700 to-cyan-600 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full shadow-lg relative z-10">
                {isMaxed ? <Trophy className="w-10 h-10 text-yellow-300" /> : <Gift className="w-10 h-10 text-white" />}
            </div>
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 text-center">
            {isMaxed ? (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                         🎉 Max Level Reached!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Congratulations! You’ve hit the lifetime limit of <b>10 referrals</b> and earned over <b>300 Free Credits</b>.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 mb-6">
                         <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                            You are a Super User!
                         </p>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Invite Friends, Get Credits
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Share your link. You <b>both</b> get <span className="font-bold text-blue-600 dark:text-blue-400">+30 Credits</span> when they upload a result!
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            <span>Referral Level</span>
                            <span>{referralCount}/{MAX_REFERRALS} Friends</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                             <div 
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                                style={{ width: `${(referralCount / MAX_REFERRALS) * 100}%` }}
                             ></div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                            Limited to your first 10 successful invites.
                        </p>
                    </div>

                    {/* Link Box */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                            <code className="flex-1 text-sm font-mono text-gray-600 dark:text-gray-300 truncate text-left">
                                {inviteLink}
                            </code>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2.5 rounded-lg font-medium transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy Link'}
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>
                </>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <Users className="w-3 h-3" />
                <span>Credits are applied when your friend <b>uploads their first semester</b>.</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
