
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart, PieChart, TrendingUp, BookOpen, Award, AlertCircle, Info, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { getGradePoints, getMaxCGPA } from '../utils/gradePoints';

const Analytics = () => {
  const { semesters, analyticsExpiresAt, unlockAnalytics, credits } = useData();
  const { gradingScale } = useSettings();
  const gradePoints = getGradePoints(gradingScale);

  const navigate = useNavigate();
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Flatten all courses into a single array
  const allCourses = useMemo(() => 
    semesters.flatMap(s => s.courses || []), 
    [semesters]
  );
  
  // 1. Grade Distribution (Pie Chart Logic)
  const gradeDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    allCourses.forEach(c => {
      distribution[c.grade] = (distribution[c.grade] || 0) + 1;
    });
    return Object.entries(distribution)
      .sort((a, b) => b[1] - a[1]); // Sort by frequency
  }, [allCourses]);

  // 2. Best & Worst Courses
  const sortedByScore = useMemo(() => {
    return [...allCourses].sort((a, b) => {
      const scoreA = gradePoints[a.grade as keyof typeof gradePoints];
      const scoreB = gradePoints[b.grade as keyof typeof gradePoints];
      return scoreB - scoreA;
    });
  }, [allCourses, gradePoints]);

  const bestCourse = sortedByScore[0];
  const worstCourse = sortedByScore[sortedByScore.length - 1];

  // 3. Subject Performance (Group by Prefix)
  const subjectPerformance = useMemo(() => {
    const subjects: Record<string, { totalPoints: number; totalCredits: number; count: number }> = {};
    
    allCourses.forEach(c => {
      // Extract prefix (e.g., "MTH" from "MTH101" or "MTH 101")
      const match = c.name.match(/^([a-zA-Z]+)/);
      if (match) {
        const subject = match[1].toUpperCase();
        const points = gradePoints[c.grade as keyof typeof gradePoints] || 0;
        
        if (!subjects[subject]) {
          subjects[subject] = { totalPoints: 0, totalCredits: 0, count: 0 };
        }
        subjects[subject].totalPoints += points * c.creditHours;
        subjects[subject].totalCredits += c.creditHours;
        subjects[subject].count += 1;
      }
    });

    return Object.entries(subjects)
      .map(([subject, data]) => ({
        subject,
        avgGPA: data.totalPoints / data.totalCredits,
        count: data.count
      }))
      .filter(s => s.count >= 2) // Only show subjects with at least 2 courses to be meaningful
      .sort((a, b) => b.avgGPA - a.avgGPA);
  }, [allCourses, gradePoints]);

  // 4. Semester Performance Trends
  const maxCGPA = useMemo(() => getMaxCGPA(gradingScale), [gradingScale]);

  const semesterTrends = useMemo(() => {
      return semesters.map(s => {
          let totalPoints = 0;
          let totalCredits = 0;
          s.courses.forEach(c => {
               const points = gradePoints[c.grade as keyof typeof gradePoints] || 0;
               totalPoints += points * c.creditHours;
               totalCredits += c.creditHours;
          });
          return {
              name: s.name,
              gpa: totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0,
              credits: totalCredits
          };
      });
  }, [semesters, gradePoints]);

  const isAnalyticsUnlocked = useMemo(() => {
    if (!analyticsExpiresAt) return false;
    return new Date(analyticsExpiresAt) > new Date();
  }, [analyticsExpiresAt]);

  if (allCourses.length === 0) {
    return (
        <div 
            onClick={() => navigate('/dashboard', { state: { openAddSemester: true } })}
            className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
        >
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <BarChart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Data Available</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Click here to add your first semester and courses on the dashboard to unlock detailed analytics.
            </p>
        </div>
    );
  }

  const handleUnlock = async () => {
      if (credits < 30) {
          toast.error(`Insufficient credits. You need 30 credits but have ${credits}.`);
          return;
      }
      setIsUnlocking(true);
      try {
          await unlockAnalytics();
          toast.success("Analytics Unlocked!");
      } catch (e: any) {
          toast.error(e.message || "Failed to unlock");
      } finally {
          setIsUnlocking(false);
      }
  };

  if (!isAnalyticsUnlocked) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full mb-6 relative">
                  <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                      <Lock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Unlock Premium Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mb-8 text-lg">
                  Gain deep insights into your academic performance, track GPA trends, identifying strengths, and visualize grade distributions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full mb-8 text-left">
                   <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                       <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                           <TrendingUp className="w-4 h-4 text-blue-500"/> Performance Trends
                       </h4>
                       <p className="text-sm text-gray-500 dark:text-gray-400">Track your CGPA evolution semester over semester.</p>
                   </div>
                   <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                       <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                           <PieChart className="w-4 h-4 text-green-500"/> Points Breakdown
                       </h4>
                       <p className="text-sm text-gray-500 dark:text-gray-400">See exactly where your grades are coming from.</p>
                   </div>
              </div>

              <button 
                onClick={handleUnlock}
                disabled={isUnlocking}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2 text-lg"
              >
                 {isUnlocking ? 'Unlocking...' : (
                   <>
                     Unlock Semester Pass
                     <span className="bg-blue-500/30 text-md px-2 py-0.5 rounded-full border border-blue-400/30 font-semibold">
                       30 🪙
                     </span>
                   </>
                 )}
              </button>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Valid for <b>4 months</b> from purchase.
              </p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Deep dive into your academic strengths and patterns
            </p>
          </div>
        </div>

        <div className="space-y-6">
             {/* Trend Analysis Chart */}
             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-[400px] shadow-sm border border-gray-100 dark:border-gray-700 relative">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> GPA Trend
                    </h3>
                    <div className="group relative">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Visualizes your GPA performance trend across all your semesters.
                        </div>
                    </div>
                </div>
                
                <ResponsiveContainer width="100%" height="85%" minWidth={0}>
                    <AreaChart
                        data={semesterTrends}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-20" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis 
                            domain={[0, maxCGPA]} 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                borderRadius: '8px', 
                                border: 'none', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                            }}
                            cursor={{ stroke: '#3B82F6', strokeWidth: 1 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="gpa" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorGpa)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#2563EB' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Performance Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-500" /> Best Performance
                        </h3>
                         <div className="group relative">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                             <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Your highest scoring course based on grade points and credit unit weight.
                            </div>
                        </div>
                    </div>
                    {bestCourse ? (
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{bestCourse.name}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    Grade: {bestCourse.grade}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{bestCourse.creditHours} Credits</span>
                            </div>
                        </div>
                    ) : <p className="text-gray-500">N/A</p>}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative">
                     <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" /> Area for Improvement
                        </h3>
                        <div className="group relative">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                             <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Your lowest grade. Consider retaking this module if possible, or aim for top grades in future high-credit courses to offset the impact.
                            </div>
                        </div>
                    </div>
                    {worstCourse ? (
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{worstCourse.name}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                    Grade: {worstCourse.grade}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{worstCourse.creditHours} Credits</span>
                            </div>
                        </div>
                    ) : <p className="text-gray-500">N/A</p>}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" /> Subject Performance
                </h3>
                <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Shows average performance in subjects where you have taken 2 or more courses (e.g. MTH101, MTH201).
                    </div>
                </div>
            </div>
            {subjectPerformance.length > 0 ? (
                <div className="space-y-4">
                    {subjectPerformance.map((dept) => (
                        <div key={dept.subject} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-xs">
                                    {dept.subject.slice(0, 3)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{dept.subject}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{dept.count} courses</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white">{dept.avgGPA.toFixed(2)} GPA</p>
                                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                     <div 
                                        className="h-full bg-blue-500 rounded-full" 
                                        style={{ width: `${(dept.avgGPA / 5.0) * 100}%` }}
                                     ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Not enough data. Subject analytics appear when you have 2+ courses with the same prefix (e.g., MTH101, MTH102).
                </p>
            )}
        </div>

        {/* Grade Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-500" /> Grade Distribution
                </h3>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        A breakdown of all the grades you have received across all semesters.
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {gradeDistribution.map(([grade, count]) => (
                    <div key={grade} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg flex items-center justify-between">
                        <span className="font-bold text-2xl text-gray-700 dark:text-white">{grade}</span>
                        <div className="text-right">
                             <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400">Courses</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6">
                 <p className="text-xs text-gray-400 text-center">
                    Total Courses: {allCourses.length}
                 </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
