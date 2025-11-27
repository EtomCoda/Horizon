import { Analytics } from "@vercel/analytics/react";
import { useState } from "react";
import { Home, Calculator, Moon, Sun, LogOut, MessageSquare } from "lucide-react";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import WhatIfCalculator from "./components/WhatIfCalculator";
import Suggestions from "./components/Suggestions";
import UpdatePasswordPage from "./components/UpdatePasswordPage";

type Tab = "dashboard" | "calculator" | "suggestions";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [calculatorCGPA, setCalculatorCGPA] = useState(0);
  const [calculatorCredits, setCalculatorCredits] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, signOut } = useAuth();
  const year = new Date().getFullYear();

  if (window.location.pathname === '/update-password') {
    return <UpdatePasswordPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
      <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img src="/horizon.png" alt="Horizon Logo" className="w-16 h-16 object-contain" />
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
                Horizon
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                Hey, {user.user_metadata.username}!
              </span>
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
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === "dashboard"
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === "calculator"
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="hidden sm:inline">What-If Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === "suggestions"
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">Suggestions</span>
          </button>
        </div>

        <div className="transition-all">
          {activeTab === "dashboard" ? (
            <Dashboard
              onValuesChange={(cgpa, credits) => {
                setCalculatorCGPA(cgpa);
                setCalculatorCredits(credits);
              }}
            />
          ) : activeTab === "calculator" ? (
            <WhatIfCalculator
              initialCGPA={calculatorCGPA}
              initialCredits={calculatorCredits}
            />
          ) : (
            <Suggestions />
          )}
        </div>
      </div>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center sm:text-left">
            Horizon - Stay one step ahead.
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {year} EtomCoda
          </p>
        </div>
      </footer>
    </div>
  );
}

import { SettingsProvider } from "./contexts/SettingsContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
