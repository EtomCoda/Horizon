import { X } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';
import { Semester } from '../types';
import { calculateCGPA, calculateSemesterGPA, getTotalCredits } from '../utils/gpaCalculations';

interface CgpaMismatchGuideProps {
  semesters: Semester[];
  gradePoints: Record<string, number>;
  onClose: () => void;
}

const CgpaMismatchGuide = ({ semesters, gradePoints, onClose }: CgpaMismatchGuideProps) => {
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);
  const appCgpa = calculateCGPA(semesters, gradePoints);
  const appUnits = getTotalCredits(semesters);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cgpa-guide-title"
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3
            id="cgpa-guide-title"
            className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white"
          >
            
            CGPA doesn't match your portal?
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div
          className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700 dark:text-gray-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">CGPA in this app</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{appCgpa.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total units in this app</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{appUnits}</p>
            </div>
          </div>

          <ol className="list-decimal pl-5 space-y-3">
            <li>
              Compare each semester's GPA below with the GPA on your portal. The semester where they don't match is
              where the mistake is.
              {semesters.length > 0 && (
                <ul className="mt-2 space-y-1 pl-4 list-disc">
                  {semesters.map((sem) => (
                    <li key={sem.id}>
                      <span className="font-medium text-gray-900 dark:text-white">{sem.name}</span>:{' '}
                      {calculateSemesterGPA(sem.courses, gradePoints).toFixed(2)} GPA,{' '}
                      {sem.courses.reduce((s, c) => s + c.creditHours, 0)} units
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              In that semester, check the higher-credit courses' grades first. A wrong grade on a 3-unit course
              moves your GPA more than on a 1 or 2 unit one. Then count the courses to spot a missing or extra one.
            </li>
            <li>
              Compare your total units above with your portal's total. If the portal shows more, a course is
              probably missing here. If it shows fewer, a course here may be duplicated, entered with too many
              units, or one your portal doesn't count toward CGPA (e.g. some GST or pass/fail courses). If the totals
              match, the problem is a wrong grade somewhere.
            </li>
          </ol>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-blue-800 dark:text-blue-300">
            Also double-check that the grading scale selected on your dashboard matches your school's, and that
            resits/carryovers are entered the same way your portal counts them.
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            To fix a course, close this guide and edit it on its semester card.
          </p>

          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Still stuck after checking all of the above? Email{' '}
            <a href="mailto:support@yourhorizon.me" className="text-blue-600 dark:text-blue-400">
              support@yourhorizon.me
            </a>{' '}
            and we'll help you track it down.
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default CgpaMismatchGuide;
