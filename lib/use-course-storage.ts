import { useState, useEffect } from 'react';
import { courseService, Course, ModuleData, LessonData } from './course-storage';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = () => {
      setLoading(true);
      const storedCourses = courseService.getCourses();
      setCourses(storedCourses);
      setLoading(false);
    };

    loadCourses();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadCourses();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('courseUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseUpdated', handleStorageChange);
    };
  }, []);

  return { courses, loading };
}

export function useCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) {
      setCourse(null);
      setLoading(false);
      return;
    }

    const loadCourse = () => {
      setLoading(true);
      const storedCourse = courseService.getCourse(courseId);
      setCourse(storedCourse);
      setLoading(false);
    };

    loadCourse();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadCourse();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('courseUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseUpdated', handleStorageChange);
    };
  }, [courseId]);

  return { course, loading };
}

export function useModule(moduleId: string) {
  const [module, setModule] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId) {
      setModule(null);
      setLoading(false);
      return;
    }

    const loadModule = () => {
      setLoading(true);
      const storedModule = courseService.getModule(moduleId);
      setModule(storedModule);
      setLoading(false);
    };

    loadModule();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadModule();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('courseUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseUpdated', handleStorageChange);
    };
  }, [moduleId]);

  return { module, loading };
}

export function useLesson(lessonId: string) {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) {
      setLesson(null);
      setLoading(false);
      return;
    }

    const loadLesson = () => {
      setLoading(true);
      const storedLesson = courseService.getLesson(lessonId);
      setLesson(storedLesson);
      setLoading(false);
    };

    loadLesson();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadLesson();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('courseUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseUpdated', handleStorageChange);
    };
  }, [lessonId]);

  const markComplete = (completed: boolean = true) => {
    courseService.markLessonCompleted(lessonId, completed);
  };

  return { lesson, loading, markComplete };
}