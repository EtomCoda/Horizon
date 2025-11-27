import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Course } from '../types';
import { getGradePoints } from '../utils/gradePoints';
import { useSettings } from '../contexts/SettingsContext';
import EditCourseModal from './EditCourseModal';
import ConfirmationModal from './ConfirmationModal';

interface CourseItemProps {
  course: Course;
  onDelete: (id: string) => void;
  onUpdate: (course: Course) => void;
}

const CourseItem = ({ course, onDelete, onUpdate }: CourseItemProps) => {
  const { gradingScale } = useSettings();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const gradePoints = getGradePoints(gradingScale);
  const gradePoint = gradePoints[course.grade] || 0;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    onDelete(course.id);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <>
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors gap-4 cursor-pointer"
        onClick={() => setIsEditOpen(true)}
      >
        <div className="flex-1">
          <h5 className="font-medium text-gray-900 dark:text-white">{course.name}</h5>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span>{course.creditHours} credit{course.creditHours !== 1 ? 's' : ''}</span>
            <span className="hidden sm:inline">•</span>
            <span>Grade: {course.grade}</span>
            <span className="hidden sm:inline">•</span>
            <span>Points: {gradePoint.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleDeleteClick}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete course"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditOpen && (
        <EditCourseModal
          course={course}
          onClose={() => setIsEditOpen(false)}
          onSave={onUpdate}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete Course: "${course.name}"`}
        message="Are you sure you want to delete this course? This action cannot be undone."
      />
    </>
  );
};

export default CourseItem;
