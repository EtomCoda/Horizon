import { Outlet, NavLink, useLocation, Navigate, Link } from 'react-router-dom';
import { Home, Calculator, Moon, Sun, LogOut, BarChart2, Coins, Users, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { getMotivationalGreeting } from '../utils/greetings';
import { useState } from 'react';
import InviteModal from './InviteModal';
import SettingsModal from './SettingsModal';
import InsufficientFundsModal from './InsufficientFundsModal';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [greeting] = useState(getMotivationalGreeting());
  const year = new Date().getFullYear();
  const location = useLocation();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const { credits } = useData();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
      <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img src="/horizon.png" alt="Horizon Logo" width="64" height="64" loading="lazy" className="w-16 h-16 object-contain" />
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 hidden sm:block">
                Horizon
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                title="Buy Credits"
              >
                <Coins className="w-4 h-4" />
                <span>{credits}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-blue-800" />
                ) : (
                  <Sun className="w-5 h-5 text-green-200" />
                )}
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        <div className="mb-8 animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hello, <span className="text-blue-600 dark:text-blue-400">{user?.user_metadata.username}</span>! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {greeting}
            </p>
          </div>
          <button
              id="invite-btn"
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Invite & Earn</span>
          </button>
        </div>
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <NavLink
            to="/dashboard"
            className={({ isActive: isNavLinkActive }) => `flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              isNavLinkActive || (location.pathname === '/')
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink
            to="/calculator"
            className={({ isActive }) => `flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              isActive
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="hidden sm:inline">What-If Calculator</span>
          </NavLink>
                  <NavLink
                    to="/analytics"
                    className={({ isActive }) => `flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <BarChart2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Analytics</span>
                  </NavLink>
                </div>

                <div className="transition-all">
                  <Outlet />
                </div>
              </div>

              <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center sm:text-left">
                    Horizon - Stay one step ahead.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-4">
                        <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          Privacy
                        </Link>
                        <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          Terms
                        </Link>
                        <a href="mailto:support@yourhorizon.me" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          Support
                        </a>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      © {year} Horizon by EtomCoda. All rights reserved.
                    </p>
                  </div>
                </div>
              </footer>

              {isInviteModalOpen && (
                <InviteModal onClose={() => setIsInviteModalOpen(false)} />
              )}
              {isSettingsOpen && (
                <SettingsModal onClose={() => setIsSettingsOpen(false)} />
              )}
              {isPaymentOpen && (
                <InsufficientFundsModal 
                  onClose={() => setIsPaymentOpen(false)} 
                  neededCredits={0}
                  currentCredits={credits}
                />
              )}
            </div>
          );
        }
