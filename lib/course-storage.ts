export interface Course {
  id: string;
  title: string;
  createdAt: number;
  moduleCount: number;
  totalLessons: number;
  estimatedDuration: string;
  modules?: string[]; // Array of module IDs
  description?: string;
}

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  lessons?: string[]; // Array of lesson IDs
  subjectId: string;
}

export interface LessonData {
  id: string;
  title: string;
  moduleId: string;
  content?: string;
  simplifiedContent?: string;
  isCompleted?: boolean;
}

// Helper to dispatch storage update events
const notifyStorageUpdate = () => {
  // Dispatch a custom event that components can listen for
  window.dispatchEvent(new CustomEvent('courseUpdated'));
};

// LocalStorage implementation
export const localStorageCourseService = {
  // Store a new course
  storeCourse: (courseData: Course): void => {
    try {
      const existingCourses = localStorage.getItem('createdCourses');
      const courses: Course[] = existingCourses ? JSON.parse(existingCourses) : [];
      
      // Check if course already exists
      const existingIndex = courses.findIndex(course => course.id === courseData.id);
      
      if (existingIndex >= 0) {
        // Update existing course
        courses[existingIndex] = {
          ...courses[existingIndex],
          ...courseData,
          createdAt: courseData.createdAt || Date.now()
        };
      } else {
        // Add the new course
        courses.push({
          ...courseData,
          createdAt: courseData.createdAt || Date.now()
        });
      }
      
      // Store back to localStorage
      localStorage.setItem('createdCourses', JSON.stringify(courses));
      notifyStorageUpdate();
    } catch (error) {
      console.error('Error storing course data:', error);
    }
  },
  
  // Get all courses
  getCourses: (): Course[] => {
    try {
      const storedCourses = localStorage.getItem('createdCourses');
      if (storedCourses) {
        const parsedCourses = JSON.parse(storedCourses) as Course[];
        // Sort by most recent first
        return parsedCourses.sort((a, b) => b.createdAt - a.createdAt);
      }
    } catch (error) {
      console.error('Error fetching stored courses:', error);
    }
    return [];
  },
  
  // Get a specific course
  getCourse: (courseId: string): Course | null => {
    try {
      const courses = localStorageCourseService.getCourses();
      return courses.find(course => course.id === courseId) || null;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  },
  
  // Store module data
  storeModule: (moduleData: ModuleData): void => {
    try {
      const key = `module_${moduleData.id}`;
      localStorage.setItem(key, JSON.stringify(moduleData));
      notifyStorageUpdate();
    } catch (error) {
      console.error('Error storing module data:', error);
    }
  },
  
  // Get module data
  getModule: (moduleId: string): ModuleData | null => {
    try {
      const key = `module_${moduleId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error fetching module data:', error);
      return null;
    }
  },
  
  // Store lesson data
  storeLesson: (lessonData: LessonData): void => {
    try {
      const key = `lesson_${lessonData.id}`;
      localStorage.setItem(key, JSON.stringify(lessonData));
      notifyStorageUpdate();
    } catch (error) {
      console.error('Error storing lesson data:', error);
    }
  },
  
  // Get lesson data
  getLesson: (lessonId: string): LessonData | null => {
    try {
      const key = `lesson_${lessonId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error fetching lesson data:', error);
      return null;
    }
  },
  
  // Mark lesson as completed
  markLessonCompleted: (lessonId: string, completed: boolean = true): void => {
    try {
      const lesson = localStorageCourseService.getLesson(lessonId);
      if (lesson) {
        lesson.isCompleted = completed;
        localStorageCourseService.storeLesson(lesson);
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  },
  
  // Delete a course and all its associated modules and lessons
  deleteCourse: (courseId: string): void => {
    try {
      // Get the course data first
      const course = localStorageCourseService.getCourse(courseId);
      
      // Delete associated modules and lessons
      if (course?.modules) {
        course.modules.forEach(moduleId => {
          const mod = localStorageCourseService.getModule(moduleId);
          
          // Delete associated lessons
          if (mod?.lessons) {
            mod.lessons.forEach(lessonId => {
              localStorage.removeItem(`lesson_${lessonId}`);
            });
          }
          
          // Delete the module
          localStorage.removeItem(`module_${moduleId}`);
        });
      }
      
      // Now delete the course from the courses list
      const storedCourses = localStorage.getItem('createdCourses');
      if (storedCourses) {
        let parsedCourses = JSON.parse(storedCourses) as Course[];
        parsedCourses = parsedCourses.filter(course => course.id !== courseId);
        localStorage.setItem('createdCourses', JSON.stringify(parsedCourses));
      }
      
      notifyStorageUpdate();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  }
};

// Export default implementation (using localStorage for simplicity)
export const courseService = localStorageCourseService;