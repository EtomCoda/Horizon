import { X, Lock, Rocket, Users } from 'lucide-react';
import { useState } from 'react';
import PaymentStore from './PaymentStore';
import InviteModal from './InviteModal';

interface InsufficientFundsModalProps {
    onClose: () => void;
    neededCredits: number;
    currentCredits: number;
}

const InsufficientFundsModal = ({ onClose, neededCredits, currentCredits }: InsufficientFundsModalProps) => {
    const [showPayment, setShowPayment] = useState(neededCredits === 0);
    const [showInvite, setShowInvite] = useState(false);

    if (showPayment) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto" onClick={() => neededCredits === 0 && onClose()}>
                 <div className="relative w-full max-w-4xl my-auto" onClick={e => e.stopPropagation()}>
                     <button 
                         onClick={() => neededCredits === 0 ? onClose() : setShowPayment(false)}
                         className="absolute -top-10 right-0 text-white hover:text-gray-200 z-50"
                     >
                         <X className="w-8 h-8" />
                     </button>
                     <PaymentStore onClose={() => neededCredits === 0 ? onClose() : setShowPayment(false)} />
                 </div>
            </div>
        );
    }

    if (showInvite) {
        return <InviteModal onClose={() => setShowInvite(false)} />;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700/50">
                    <div className="bg-red-50 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            {neededCredits === 0 ? 'Top Up Your Credits' : neededCredits === 15 ? 'Your Quick Upload is Ready' : 'Your Analysis is Ready'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-sm mx-auto">
            {neededCredits === 0
                ? <span>Stock up on credits to unlock premium features like <b>Detailed Analytics</b> and <b>Instant Uploads</b>.</span>
                : neededCredits === 15 
                    ? <span>You need <span className="font-bold text-gray-900 dark:text-white">15 Credits</span> to upload and scan this result, but you only have <span className="text-red-500 font-bold">{currentCredits}</span>.</span>
                    : <span>This analytics report requires <span className="font-bold text-gray-900 dark:text-white">30 Credits</span>, but you currently have <span className="text-red-500 font-bold">{currentCredits}</span>.</span>
            }
          </p>
                </div>

                {/* Actions */}
                <div className="p-6 grid gap-4">
                    {/* Primary Action: Buy Credits */}
                     <button
                        onClick={() => setShowPayment(true)}
                        className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Rocket className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold">Get 50 Credits</span>
                                <span className="text-xs text-blue-100">Instant Access (₦500)</span>
                            </div>
                        </div>
                        <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded">FASTEST</span>
                    </button>

                    {/* Secondary Action: Refer Friends (Free) */}
                    <button
                        onClick={() => setShowInvite(true)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold">Refer Friends</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Earn +30 Credits for free</span>
                            </div>
                        </div>
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium mt-2"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsufficientFundsModal;
