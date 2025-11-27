import { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp, Plus, BookOpen } from 'lucide-react';
import { Semester, Course } from '../types';
import { calculateSemesterGPA } from '../utils/gpaCalculations';
import { courseService } from '../services/database';
import { useSettings } from '../contexts/SettingsContext';
import { getGradePoints } from '../utils/gradePoints';
import CourseItem from './CourseItem';
import AddCourseModal from './AddCourseModal';
import EditSemesterModal from './EditSemesterModal';
import ConfirmationModal from './ConfirmationModal';

interface SemesterCardProps {
  semester: Semester;
  onDelete: (id: string) => void;
  onUpdate: (semester: Semester) => void;
}

const SemesterCard = ({ semester, onDelete, onUpdate }: SemesterCardProps) => {
  const { gradingScale } = useSettings();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [courses, setCourses] = useState(semester.courses);

  const gradePoints = getGradePoints(gradingScale);
  const gpa = calculateSemesterGPA(courses, gradePoints);
  const totalCredits = courses.reduce((sum, course) => sum + course.creditHours, 0);

  const handleAddCourse = async (course: Omit<Course, 'id'>) => {
    try {
      const newCourse = await courseService.create(semester.id, course);
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      const updatedSemester = {
        ...semester,
        courses: updatedCourses,
        gpa: calculateSemesterGPA(updatedCourses, gradePoints),
      };
      onUpdate(updatedSemester);
      setIsAddCourseOpen(false);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await courseService.delete(courseId);
      const updatedCourses = courses.filter(c => c.id !== courseId);
      setCourses(updatedCourses);
      const updatedSemester = {
        ...semester,
        courses: updatedCourses,
        gpa: calculateSemesterGPA(updatedCourses, gradePoints),
      };
      onUpdate(updatedSemester);
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      await courseService.update(updatedCourse.id, updatedCourse);
      const updatedCourses = courses.map(c =>
        c.id === updatedCourse.id ? updatedCourse : c
      );
      setCourses(updatedCourses);
      const updatedSemester = {
        ...semester,
        courses: updatedCourses,
        gpa: calculateSemesterGPA(updatedCourses, gradePoints),
      };
      onUpdate(updatedSemester);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleUpdateSemesterName = (newName: string) => {
    onUpdate({ ...semester, name: newName, courses });
    setIsEditOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    onDelete(semester.id);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 group cursor-pointer"
              onClick={() => setIsEditOpen(true)}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {semester.name}
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  GPA: {gpa.toFixed(2)}
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  {totalCredits} Credits
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleDeleteClick}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete semester"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click from triggering
                  setIsExpanded(!isExpanded)}
                }
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Courses</h4>
                <button
                  onClick={() => setIsAddCourseOpen(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              </div>

              {courses.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                  <div className="bg-gray-100 dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">No courses yet</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add your first course to this semester.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {courses.map((course) => (
                    <CourseItem
                      key={course.id}
                      course={course}
                      onDelete={handleDeleteCourse}
                      onUpdate={handleUpdateCourse}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isAddCourseOpen && (
        <AddCourseModal
          onClose={() => setIsAddCourseOpen(false)}
          onAdd={handleAddCourse}
        />
      )}

      {isEditOpen && (
        <EditSemesterModal
          currentName={semester.name}
          onClose={() => setIsEditOpen(false)}
          onSave={handleUpdateSemesterName}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete Semester: "${semester.name}"`}
        message="Are you sure you want to delete this semester and all its courses? This action cannot be undone."
      />
    </>
  );
};

export default SemesterCard;
