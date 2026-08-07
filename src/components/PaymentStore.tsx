import { Rocket, BookOpen, Crown, X } from 'lucide-react';
import { PaystackButton } from 'react-paystack';
import { paymentService } from '../services/database';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PaymentStoreProps {
    onClose?: () => void;
}

const PaymentStore = ({ onClose }: PaymentStoreProps) => {
    const { user } = useAuth();
    
    const handlePaymentSuccess = (reference: any, plan: string, amount: number) => {
            const loadingToast = toast.loading("Verifying payment...");
            paymentService.verifyTransaction(reference.reference, plan, amount)
                .then((data) => {
                    toast.dismiss(loadingToast);
                    if (data.success) {
                        toast.success(`Success! ${data.creditsAdded} Credits added.`);
                        if (onClose) onClose();
                        setTimeout(() => window.location.reload(), 1500); 
                    }
                })
                .catch((err) => {
                    toast.dismiss(loadingToast);
                    console.error("Verification Error:", err);
                    toast.error(err.message || "Payment verification failed.");
                });
    };

    const baseConfig = {
        email: user?.email || '',
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl mx-auto">
            <div className="text-center mb-10 relative">
                {onClose && (
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute -top-4 -right-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                )}
                <h2 id="payment-store-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                     Top Up Your Credits
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                    Invest in your academic success. Credits never expire and work across all your devices.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative">
                {/* Card A: The Quick Pass */}
                <div className="border border-white dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col items-center text-center bg-white dark:bg-gray-800">
                     <div className="bg-gray-200 dark:bg-gray-600 p-4 rounded-full mb-4">
                        <Rocket className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Quick Pass</h3>
                     <p className="text-gray-500 text-sm mb-4">Perfect for one full semester</p>
                     
                     <div className="mb-6">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">₦500</span>
                     </div>

                     <div className="bg-white dark:bg-gray-800 rounded-lg py-2 px-6 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm w-full">
                         <span className="font-bold text-xl text-blue-600 dark:text-blue-400">50</span>
                         <span className="text-gray-400 text-sm ml-2">Credits</span>
                     </div>

                     <PaystackButton 
                        {...baseConfig}
                        amount={500 * 100}
                        text="Get 50 Credits →"
                        onSuccess={(ref: any) => handlePaymentSuccess(ref, 'Quick Pass', 500)}
                        onClose={() => toast('Just ₦500 for a whole semester! 💭', { duration: 4000 })}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-colors mt-auto"
                     />
                </div>

                {/* Card B: The Dean's List (Best Value - Center/Gold) */}
                <div className="border-2 border-yellow-400 dark:border-yellow-600 rounded-2xl p-6 shadow-xl transform md:-translate-y-4 flex flex-col items-center text-center bg-white dark:bg-gray-800 relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                         BEST VALUE
                     </div>

                     <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full mb-4">
                        <Crown className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Dean's List</h3>
                     <p className="text-gray-500 text-sm mb-4">Enough for your entire degree</p>
                     
                     <div className="mb-6">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">₦2,000</span>
                        <span className="text-gray-400 text-sm ml-1 line-through">₦3,000</span>
                     </div>

                     <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg py-3 px-6 mb-6 border border-yellow-100 dark:border-yellow-700/50 shadow-sm w-full">
                         <span className="font-bold text-xl text-yellow-600 dark:text-yellow-400">300</span>
                         <span className="text-gray-400 text-sm ml-2">Credits</span>
                         <div className="text-xs text-yellow-600 font-medium mt-1">Saves 50%</div>
                     </div>

                     <PaystackButton 
                         {...baseConfig}
                         amount={2000 * 100}
                         text="Claim 300 Credits →"
                         onSuccess={(ref: any) => handlePaymentSuccess(ref, "Dean's List", 2000)}
                         onClose={() => toast('You were so close to saving 50%! 🏆', { duration: 4000 })}
                         className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-md transition-all transform hover:scale-105 mt-auto"
                     />
                </div>

                {/* Card C: The Scholar Bundle (Standard - Blue Outline) */}
                <div className="border border-blue-200 dark:border-blue-800 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col items-center text-center bg-white dark:bg-gray-800 relative">
                     <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                         MOST POPULAR
                     </div>
                     
                     <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                        <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Scholar Bundle</h3>
                     <p className="text-gray-500 text-sm mb-4">Cover the full year + Bonus</p>
                     
                     <div className="mb-6">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">₦1,000</span>
                     </div>

                     <div className="bg-white dark:bg-gray-800 rounded-lg py-2 px-6 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm w-full">
                         <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">120</span>
                         <span className="text-gray-400 text-sm ml-2">Credits</span>
                         <div className="text-xs text-green-600 font-medium mt-1">+20 Free Credits</div>
                     </div>

                     <PaystackButton 
                         {...baseConfig}
                         amount={1000 * 100}
                         text="Get 120 Credits →"
                         onSuccess={(ref: any) => handlePaymentSuccess(ref, 'Scholar Bundle', 1000)}
                         onClose={() => toast('You can get +20 bonus right now! 🔥', { duration: 4000 })}
                         className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all mt-auto"
                     />
                </div>
            </div>
            
            <div className="mt-8 text-center">
                 <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">SSL Secured Payment</span>
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Instant Activation</span>
                 </p>
                 <p className="text-xs text-gray-400 mt-2">
                    Payments securely processed by Paystack
                 </p>
            </div>
        </div>
    );
};

export default PaymentStore;
