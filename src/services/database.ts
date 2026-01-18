import { supabase } from '../lib/supabase';
import { Semester, Course } from '../types';

export const semesterService = {
  async getAll(userId: string): Promise<Semester[]> {
    const { data, error } = await supabase
      .from('semesters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(sem => ({
      id: sem.id,
      name: sem.name,
      courses: [],
      gpa: 0,
    }));
  },

  async create(userId: string, name: string): Promise<Semester> {
    const { data, error, status, statusText } = await supabase
      .from('semesters')
      .insert([{ user_id: userId, name }])
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message} (code: ${error.code})`);
    }

    if (!data) {
      throw new Error(`Failed to create semester. No data returned from Supabase. Status: ${status} - ${statusText}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      courses: [],
      gpa: 0,
    };
  },

  async update(id: string, name: string): Promise<void> {
    const { data, error } = await supabase
      .from('semesters')
      .update({ name })
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(`Supabase error: ${error.message} (code: ${error.code})`);
    }

    if (!data || data.length === 0) {
      throw new Error("Update failed: The semester was not found or you don't have permission to edit it.");
    }
  },

  async delete(id: string): Promise<void> {
    // First delete all courses in this semester
    const { error: coursesError } = await supabase
      .from('courses')
      .delete()
      .eq('semester_id', id);

    if (coursesError) throw coursesError;

    // Then delete the semester
    const { error, count } = await supabase
      .from('semesters')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Supabase delete semester error:', error);
      }
      throw error;
    }
    
    if (count === 0) {
      console.warn('Semester delete returned 0 rows affected. ID might be wrong or RLS blocked it.');
    }
  },
};

export const courseService = {
  async getBySemesterId(semesterId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('semester_id', semesterId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(course => ({
      id: course.id,
      name: course.name,
      creditHours: course.credit_hours,
      grade: course.grade,
    }));
  },

  async getAllBySemesterIds(semesterIds: string[]): Promise<Course[]> {
    if (semesterIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .in('semester_id', semesterIds)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Return courses with their semester_id attached so we can group them later
    return (data || []).map(course => ({
      id: course.id,
      name: course.name,
      creditHours: course.credit_hours,
      grade: course.grade,
      semesterId: course.semester_id // We'll need to add this optional property to the Course type or handle it locally
    }));
  },

  async create(semesterId: string, course: Omit<Course, 'id'>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert([{
        semester_id: semesterId,
        name: course.name,
        credit_hours: course.creditHours,
        grade: course.grade,
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      creditHours: data.credit_hours,
      grade: data.grade,
    };
  },

  async update(id: string, course: Partial<Course>): Promise<void> {
    const updateData: Record<string, any> = {};
    if (course.name) updateData.name = course.name;
    if (course.creditHours !== undefined) updateData.credit_hours = course.creditHours;
    if (course.grade) updateData.grade = course.grade;

    const { error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const goalService = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? { targetCGPA: data.target_cgpa } : null;
  },

  async upsert(userId: string, targetCGPA: number): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .upsert({
        user_id: userId,
        target_cgpa: targetCGPA,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) throw error;
  },

  async delete(userId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};

export const profileService = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async update(userId: string, updates: { grading_scale?: string }) {
    // First try to update an existing row
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (!updateError && data && data.length > 0) {
      return;
    }

    // If update failed (likely no row), try upsert
    // Note: This might fail if RLS prevents INSERT.
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      if (import.meta.env.DEV) {
        console.error('Profile update failed:', upsertError);
      }
      // We don't throw here to prevent blocking the UI
      // The local state will still update
    }
  },

  async deductCredits(amount: number): Promise<number> {
    const { data, error } = await supabase
      .rpc('deduct_credits', { amount_val: amount });

    if (error) throw error;
    return data as number; // Returns new balance
  },

  async unlockAnalytics(): Promise<void> {
    const { error } = await supabase
      .rpc('unlock_analytics');

    if (error) throw error;
  },

  async getReferralStats(): Promise<{ count: number; cap_reached: boolean }> {
      const { data, error } = await supabase
        .rpc('get_referral_stats');

      if (error) {
          console.error("Referral stats error:", error);
          return { count: 0, cap_reached: false };
      }
      return data as { count: number; cap_reached: boolean };
  },
};
