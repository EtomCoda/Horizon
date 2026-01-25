import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";

// Critical path components - loaded immediately
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";

// Lazy load non-critical components for code splitting
const Dashboard = lazy(() => import("./components/Dashboard"));
const AnalyticsPage = lazy(() => import("./components/Analytics"));
const FeedbackPage = lazy(() => import("./components/FeedbackPage"));
const UpdatePasswordPage = lazy(() => import("./components/UpdatePasswordPage"));
const Layout = lazy(() => import("./components/Layout"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const CalculatorPage = lazy(() => import("./components/CalculatorPage"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));

// Lazy load analytics tracker (non-critical)
const PageViewTracker = lazy(() => import("./components/PageViewTracker"));

// Lightweight loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Non-blocking page view tracker */}
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <AuthProvider>
          <SettingsProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Critical routes - LandingPage and AuthPage are not lazy */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Lazy loaded routes */}
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/calculator" element={<CalculatorPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
      <Analytics />
      <SpeedInsights/>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
