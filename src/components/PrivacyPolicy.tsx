import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
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
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
             </div>
             <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          
          <div className="prose dark:prose-invert max-w-none space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              Last updated: January 19, 2026
            </p>

            <section>
              <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
              <p>
                Horizon ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information in compliance with the <strong>Nigeria Data Protection Regulation (NDPR)</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>
              <p>We collect only the data necessary to provide our academic analytics service:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Personal Information:</strong> Name and email address (collected during sign-up).</li>
                <li><strong>Academic Data:</strong> Course codes, grades, and units that are extracted from your transcripts or manually entered.</li>
                <li><strong>Financial Data:</strong> We do <strong>not</strong> store your debit/credit card information. All payments are processed by <strong>Paystack</strong>. We only store a transaction reference ID to track your credit purchases.</li>
                <li><strong>Usage Data:</strong> We collect anonymous data about how you interact with the application (e.g., which features you use most) to help us improve the user experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. How We Handle Your Uploads (The "Process & Discard" Policy)</h2>
              <p>We take a privacy-first approach to document handling:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Temporary Processing:</strong> When you upload a transcript (PDF/Image), it is processed in real-time to extract the relevant data (grades and courses).</li>
                <li><strong>Immediate Deletion of Files:</strong> Once the data is extracted, the <strong>raw file</strong> is permanently deleted from our servers. We do not archive or view your original transcript files.</li>
                <li><strong>Data Persistence:</strong> The <em>extracted</em> data (e.g., "MTH101: A") is stored securely in your user profile so you can view your dashboard and run forecasts without re-uploading every time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. How We Use Your Information</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>To calculate your CGPA and provide "Semester Analytics."</li>
                <li>To maintain your Credit Balance and Transaction History.</li>
                <li>To communicate important service updates (e.g., maintenance alerts).</li>
                <li>To analyze platform usage trends and identify areas for improvement.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3">5. Third-Party Services</h2>
              <p>We share data with trusted third-party providers solely for operational purposes:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Google Gemini (AI):</strong> Used to process and extract text from transcript documents. Data sent is for processing only and is not used to train their public models.</li>
                <li><strong>Paystack:</strong> Used to process payments securely.</li>
                <li><strong>Supabase:</strong> Used for secure database hosting and authentication.</li>
                <li><strong>PostHog:</strong> Used for product analytics to understand how users interact with our application.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Your Rights (NDPR)</h2>
              <p>Under the Nigeria Data Protection Regulation, you have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Rectification:</strong> Correct any inaccurate data in your profile.</li>
                <li><strong>Deletion (Right to be Forgotten):</strong> You may delete your account at any time via the Settings menu. This will permanently erase your personal profile and all associated academic data from our database.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Data Security</h2>
              <p>
                We implement industry-standard security measures (including SSL encryption and Row Level Security) to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Contact Us</h2>
              <p>
                If you have questions regarding this Privacy Policy or wish to exercise your data rights, please contact us at: <strong>support@yourhorizon.me</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
