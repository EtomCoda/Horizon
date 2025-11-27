import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { profileService } from '../services/database';
import { GradingScaleType, GRADING_SCALES } from '../utils/gradePoints';

interface SettingsContextType {
  gradingScale: GradingScaleType;
  setGradingScale: (scale: GradingScaleType) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [gradingScale, setGradingScaleState] = useState<GradingScaleType>('DEFAULT');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await profileService.get(user.id);
        if (profile?.grading_scale && Object.keys(GRADING_SCALES).includes(profile.grading_scale)) {
          setGradingScaleState(profile.grading_scale as GradingScaleType);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const setGradingScale = async (scale: GradingScaleType) => {
    setGradingScaleState(scale);
    if (user) {
      try {
        await profileService.update(user.id, { grading_scale: scale });
      } catch (error) {
        console.error('Error updating settings:', error);
        // Optionally revert state on error
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ gradingScale, setGradingScale, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
