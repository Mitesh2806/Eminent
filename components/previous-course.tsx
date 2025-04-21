import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { courseService, Course } from '../lib/course-storage';

export const PreviousCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = () => {
      setIsLoading(true);
      try {
        const storedCourses = courseService.getCourses();
        setCourses(storedCourses);
      } catch (error) {
        console.error('Error fetching stored courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
    
    // Set up event listener for storage changes
    const handleStorageChange = () => {
      fetchCourses();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for when we update storage from within the same window
    window.addEventListener('courseUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseUpdated', handleStorageChange);
    };
  }, []);

  const navigateToCourse = (subjectId: string) => {
    router.push(`/subject/${subjectId}`);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-24 bg-gray-200 rounded mb-3"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Your Courses</h2>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">You haven't created any courses yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Your Courses</h2>
      <div className="space-y-4">
        {courses.map((course) => (
          <div 
            key={course.id}
            onClick={() => navigateToCourse(course.id)}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="font-medium text-lg">{course.title}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <div className="flex items-center mr-4">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{course.totalLessons} Lessons</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.estimatedDuration}</span>
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
};