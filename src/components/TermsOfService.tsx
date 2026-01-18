import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
             </div>
             <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          
          <div className="prose dark:prose-invert max-w-none space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              Last updated: January 19, 2026
            </p>

            <section>
              <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing, creating an account, or using the Horizon web application ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you are prohibited from using the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Nature of the Service</h2>
              <p>
                Horizon is an educational technology tool designed to assist students with academic planning, GPA calculation, and forecasting.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                 <li><strong>Not an Official Record:</strong> Horizon is a third-party tool and is not affiliated with Pan-Atlantic University (PAU) or any other educational institution. The calculations provided are estimates based on the data you provide. They do not replace your official university transcript or student portal.</li>
                 <li><strong>Accuracy:</strong> While we strive for precision, Horizon is not liable for discrepancies between our calculations and your official school records.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. Virtual Credits & Payments</h2>
              <p>The Service operates on a virtual economy using "Horizon Credits."</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>No Monetary Value:</strong> Credits are a virtual utility token used solely to unlock features within the app. They have no real-world cash value, cannot be withdrawn, and cannot be transferred to other users.</li>
                <li><strong>Purchases:</strong> Credit packs are purchased via our secure payment processor, Paystack. By initiating a transaction, you confirm that you are authorized to use the payment method selected.</li>
                <li><strong>No Refunds:</strong> All purchases of Credit packs and "Semester Unlocks" are final. We do not offer refunds for unused credits or partial use of services, except where strictly required by applicable Nigerian consumer protection laws.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. The Referral Program</h2>
              <p>Horizon rewards users for inviting genuine new users to the platform. To maintain the integrity of our economy, the following rules apply:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>The Reward Trigger:</strong> You earn referral credits only when your referred friend successfully completes their first Transcript Upload. No credits are awarded for mere sign-ups.</li>
                <li><strong>Fair Use:</strong> Self-referrals (creating multiple accounts to earn credits) are strictly prohibited.</li>
                <li><strong>Right to Revoke:</strong> Horizon reserves the right to withhold rewards, revoke credits, or ban accounts if our fraud detection systems identify bot activity, script abuse, or suspicious referral patterns.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">5. Intellectual Property & File Handling</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Your Data:</strong> You retain all rights to the academic data you upload. You warrant that you have the right to upload any documents submitted to the Service.</li>
                <li><strong>Our License:</strong> You grant Horizon a temporary, limited license to process your uploaded files solely for the purpose of generating your analytics report.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Limitation of Liability</h2>
              <p>To the maximum extent permitted by Nigerian law:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Horizon shall not be liable for any indirect, incidental, or consequential damages, including loss of data, academic errors, or reliance on projected grades.</li>
                <li>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that the Service will be uninterrupted or error-free.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account immediately, without prior notice, if you breach these Terms (e.g., attempting to hack the credit system or misuse the API).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
