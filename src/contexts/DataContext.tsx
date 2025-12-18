import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Semester, GoalData, Course } from '../types';
import { semesterService, courseService, goalService } from '../services/database';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface DataContextType {
  semesters: Semester[];
  goal: GoalData | null;
  loading: boolean;
  addSemester: (name: string, scannedCourses: Partial<Course>[]) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  updateSemester: (updatedSemester: Semester) => Promise<void>;
  saveGoal: (targetCGPA: number) => Promise<void>;
  // Add course handlers here if needed later
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const semestersData = await semesterService.getAll(user.id);
        if (semestersData.length > 0) {
          const semesterIds = semestersData.map(s => s.id);
          const allCourses = await courseService.getAllBySemesterIds(semesterIds);
          semestersData.forEach(semester => {
            semester.courses = allCourses.filter(c => c.semesterId === semester.id);
          });
        }
        setSemesters(semestersData);
        const goalData = await goalService.get(user.id);
        setGoal(goalData);
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error loading data:', error);
        toast.error('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const addSemester = async (name: string, scannedCourses: Partial<Course>[]) => {
    if (!user) return;
    try {
      const newSemester = await semesterService.create(user.id, name);
      if (scannedCourses.length > 0) {
        for (const course of scannedCourses) {
          if (course.name && course.creditHours && course.grade) {
            await courseService.create(newSemester.id, {
              name: course.name,
              creditHours: course.creditHours,
              grade: course.grade,
            });
          }
        }
        const updatedCourses = await courseService.getBySemesterId(newSemester.id);
        newSemester.courses = updatedCourses;
      }
      setSemesters(prev => [...prev, newSemester]);
      if (scannedCourses.length > 0) {
        toast.success(`Successfully imported ${scannedCourses.length} courses!`);
      } else {
        toast.success('Semester added successfully');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error adding semester:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add semester');
      throw error; // Re-throw to be caught in the component
    }
  };

  const deleteSemester = async (id: string) => {
    try {
      await semesterService.delete(id);
      setSemesters(prev => prev.filter(s => s.id !== id));
      toast.success('Semester deleted successfully');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting semester:', error);
      toast.error('Failed to delete semester');
    }
  };

  const updateSemester = async (updatedSemester: Semester) => {
    const oldSemesters = semesters;
    setSemesters(prev => prev.map(s => s.id === updatedSemester.id ? updatedSemester : s));
    try {
      await semesterService.update(updatedSemester.id, updatedSemester.name);
      toast.success('Semester updated successfully');
    } catch (error) {
      toast.error(`Could not update semester name: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (import.meta.env.DEV) console.error('Error updating semester:', error);
      setSemesters(oldSemesters);
    }
  };

  const saveGoal = async (targetCGPA: number) => {
    if (!user) return;
    try {
      await goalService.upsert(user.id, targetCGPA);
      setGoal({ targetCGPA });
      toast.success('Goal updated successfully');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const value = {
    semesters,
    goal,
    loading,
    addSemester,
    deleteSemester,
    updateSemester,
    saveGoal,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
