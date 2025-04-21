// lib/moduleCache.ts

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectTitle: string;
  lessonCount: number;
  duration: string;
  lessons: LessonData[];
}

export interface LessonData {
  id: string;
  title: string;
  content: string;
  simplifiedContent?: string;
  isCompleted: boolean;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

class ModuleCacheService {
  private static CACHE_KEY = 'module_cache';
  private static MODULES_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Store a complete module with all its data
  static storeModule(moduleData: ModuleData): void {
    try {
      const cache = this.getCache();
      cache[moduleData.id] = {
        data: moduleData,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error storing module in cache:', error);
    }
  }

  // Get a module by ID
  static getModule(moduleId: string): ModuleData | null {
    try {
      const cache = this.getCache();
      const cachedModule = cache[moduleId];
      
      if (!cachedModule) return null;
      
      // Check if the cache is still valid
      if (this.isExpired(cachedModule.timestamp)) {
        this.removeModule(moduleId);
        return null;
      }
      
      return cachedModule.data;
    } catch (error) {
      console.error('Error retrieving module from cache:', error);
      return null;
    }
  }

  // Get a specific lesson from a module
  static getLesson(moduleId: string, lessonId: string): LessonData | null {
    const moduleData = this.getModule(moduleId);
    if (!moduleData) return null;
    
    return moduleData.lessons.find(lesson => lesson.id === lessonId) || null;
  }

  // Update lesson completion status
  static updateLessonStatus(moduleId: string, lessonId: string, isCompleted: boolean): void {
    try {
      const moduleData = this.getModule(moduleId);
      if (!moduleData) return;
      
      const lessonIndex = moduleData.lessons.findIndex(lesson => lesson.id === lessonId);
      if (lessonIndex === -1) return;
      
      moduleData.lessons[lessonIndex].isCompleted = isCompleted;
      this.storeModule(moduleData);
    } catch (error) {
      console.error('Error updating lesson status in cache:', error);
    }
  }

  // Store simplified content for a lesson
  static storeSimplifiedContent(moduleId: string, lessonId: string, content: string): void {
    try {
      const moduleData = this.getModule(moduleId);
      if (!moduleData) return;
      
      const lessonIndex = moduleData.lessons.findIndex(lesson => lesson.id === lessonId);
      if (lessonIndex === -1) return;
      
      moduleData.lessons[lessonIndex].simplifiedContent = content;
      this.storeModule(moduleData);
    } catch (error) {
      console.error('Error storing simplified content in cache:', error);
    }
  }

  // Remove a module from cache
  static removeModule(moduleId: string): void {
    try {
      const cache = this.getCache();
      delete cache[moduleId];
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error removing module from cache:', error);
    }
  }

  // Clear expired modules
  static cleanupCache(): void {
    try {
      const cache = this.getCache();
      let hasChanges = false;
      
      Object.keys(cache).forEach(moduleId => {
        if (this.isExpired(cache[moduleId].timestamp)) {
          delete cache[moduleId];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      console.error('Error cleaning up module cache:', error);
    }
  }

  // Helper to get the current cache
  private static getCache(): Record<string, { data: ModuleData, timestamp: number }> {
    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY);
      return cacheData ? JSON.parse(cacheData) : {};
    } catch (error) {
      console.error('Error parsing cache data:', error);
      return {};
    }
  }

  // Check if a cached item has expired
  private static isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.MODULES_EXPIRY;
  }
}

export default ModuleCacheService;