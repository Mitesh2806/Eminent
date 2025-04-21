import { courseService } from './course-storage';

export async function generateCourse(courseTopic: string) {
  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseTopic }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate course');
    }
    
    // Store course data in localStorage
    if (data.courseData) {
      courseService.storeCourse(data.courseData);
    }
    
    return data;
  } catch (error) {
    console.error('Error in generateCourse:', error);
    throw error;
  }
}

export async function fetchModules(subjectId: string) {
  try {
    // Check if we have this course in local storage
    const courses = courseService.getCourses();
    const targetCourse = courses.find(course => course.id === subjectId);
    
    // Always fetch from API for consistency
    const response = await fetch(`/api/subjects/${subjectId}/modules`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch modules');
    }
    
    // You can use the local storage data for fallback if needed
    
    return data;
  } catch (error) {
    console.error('Error in fetchModules:', error);
    throw error;
  }
}

export async function fetchLessons(moduleId: string) {
  try {
    const response = await fetch(`/api/modules/${moduleId}/lessons`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch lessons');
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchLessons:', error);
    throw error;
  }
}

export async function fetchLessonContent(moduleId: string, lessonId: string, mode = 'content') {
  try {
    const response = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}/content?mode=${mode}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch lesson content');
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchLessonContent:', error);
    throw error;
  }
}

export async function markLessonComplete(moduleId: string, lessonId: string) {
  try {
    const response = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}/complete`, {
      method: 'POST',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to mark lesson as complete');
    }
    
    return data;
  } catch (error) {
    console.error('Error in markLessonComplete:', error);
    throw error;
  }
}

export async function fetchQuiz(moduleId: string, lessonId: string) {
  try {
    const response = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}/quiz`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch quiz');
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchQuiz:', error);
    throw error;
  }
}

export async function submitQuizAnswers(moduleId: string, lessonId: string, answers: Record<string, string>) {
  try {
    const response = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answers),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit quiz answers');
    }
    
    return data;
  } catch (error) {
    console.error('Error in submitQuizAnswers:', error);
    throw error;
  }
}