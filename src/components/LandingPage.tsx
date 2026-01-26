
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, BarChart2, Calculator, TrendingUp, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden transition-colors">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/horizon.webp" alt="Horizon Logo" width="40" height="40" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                Horizon
              </span>
            </div>
            <Link
              to={user ? "/dashboard" : "/auth" + location.search}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all transform hover:scale-105 shadow-md flex items-center gap-2 text-sm"
            >
              {user ? (
                <>Dashboard <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 animate-fade-in-down">
            Master Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">
              Academic Journey
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
            Track your GPA, simulate future grades, and get personalized insights to stay one step ahead.
          </p>
          <div className="flex justify-center gap-4 animate-fade-in-up delay-200">
            <Link
              to={"/auth" + location.search}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Abstract shapes/blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="py-24 bg-white dark:bg-gray-800/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to succeed</h2>
            <p className="text-gray-600 dark:text-gray-400">Powerful tools designed for students, by students.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 group">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Effortless Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Easily input and manage your semesters, courses, and grades. Keep your entire academic history organized in one place.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 group">
              <div className="bg-green-100 dark:bg-green-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calculator className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What-If Calculator</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Experiment with hypothetical grades. See exactly what you need to score to hit your target CGPA.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 group">
              <div className="bg-cyan-100 dark:bg-cyan-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Deep Insights</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Unlock detailed analytics. View GPA trends, analyze subject performance, and visualize grade distributions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust/Footer Section */}
      <div className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Secure & Private</span>
             </div>
             <div className="h-4 w-px bg-gray-700 hidden md:block"></div>
             <div className="flex gap-4 text-sm text-gray-400">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <a href="mailto:support@yourhorizon.me" className="hover:text-white transition-colors">Support</a>
             </div>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Horizon by EtomCoda. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
