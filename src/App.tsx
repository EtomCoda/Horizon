import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";

import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import AnalyticsPage from "./components/Analytics";
import FeedbackPage from "./components/FeedbackPage";
import UpdatePasswordPage from "./components/UpdatePasswordPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CalculatorPage from "./components/CalculatorPage";
import LandingPage from "./components/LandingPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
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
