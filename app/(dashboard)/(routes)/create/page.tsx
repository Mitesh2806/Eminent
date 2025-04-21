'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components/heading';
import { LucideTestTube2 } from 'lucide-react';
import { PreviousCourses } from '@/components/previous-course';
import ModuleCacheService from '@/lib/module-cache';

// Helper function to store course in localStorage
const storeCourse = (courseData: any) => {
  try {
    const existingCourses = localStorage.getItem('createdCourses');
    const courses = existingCourses ? JSON.parse(existingCourses) : [];
    
    // Add the new course
    courses.push({
      id: courseData.subjectId,
      title: courseData.courseTopic,
      createdAt: Date.now(),
      moduleCount: courseData.moduleCount || 0,
      totalLessons: courseData.totalLessons || 0,
      estimatedDuration: courseData.estimatedDuration || '30m'
    });
    
    // Store back to localStorage
    localStorage.setItem('createdCourses', JSON.stringify(courses));
  } catch (error) {
    console.error('Error storing course data:', error);
  }
};

export default function CreateCoursePage() {
  const [courseTopic, setCourseTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Generating, 3: Complete
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  // Suggested topics from the UI
  const suggestedTopics = [
    'Project Management',
    'Circuits and Systems',
    'Electromagnetic Field Theory',
    'Financial Literacy',
    'Power Devices and Circuits',
    'Cellular Networks'
  ];

  const selectTopic = (topic: string) => {
    setCourseTopic(topic);
  };

  const generateCourse = async () => {
    if (!courseTopic) return;
    
    setIsLoading(true);
    setStep(2);
    
    try {
      // Set up a progress tracker
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 1000);
      
      // Call our API to create the course
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseTopic }),
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create course');
      }
      
      const data = await response.json();
      
      // Store the created course in localStorage
      storeCourse({
        subjectId: data.subjectId,
        courseTopic,
        moduleCount: data.moduleCount || 3,
        totalLessons: data.totalLessons || 12,
        estimatedDuration: data.estimatedDuration || '2h 30m'
      });
      
      // Now cache the entire course structure and content
      // Iterate through modules and fetch their data
      if (data.modules && Array.isArray(data.modules)) {
        // We'll fetch module data one by one and cache them
        for (const moduleData of data.modules) {
          try {
            // First, fetch all lessons for this module
            const lessons = await fetchModuleLessons(moduleData.id);
            
            // Cache the complete module data
            ModuleCacheService.storeModule({
              id: moduleData.id,
              title: moduleData.title,
              description: moduleData.description || '',
              subjectId: data.subjectId,
              subjectTitle: courseTopic,
              lessonCount: lessons.length,
              duration: moduleData.duration || '30m',
              lessons: lessons
            });
          } catch (error) {
            console.error(`Error caching module ${moduleData.id}:`, error);
          }
        }
      }
      
      setProgress(100);
      setStep(3);
      
      // Redirect to the created subject page
      setTimeout(() => {
        router.push(`/subject/${data.subjectId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error generating course:', error);
      alert('Failed to generate course. Please try again.');
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fetch module lessons
  const fetchModuleLessons = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/lessons`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      
      const lessons = await response.json();
      
      // For each lesson, fetch its content and quiz
      const lessonDataPromises = lessons.map(async (lesson: any) => {
        try {
          // Fetch lesson content
          const contentRes = await fetch(`/api/modules/${moduleId}/lessons/${lesson.id}/content`);
          const contentData = await contentRes.json();
          
          // Fetch quiz questions
          let quizData = [];
          try {
            const quizRes = await fetch(`/api/modules/${moduleId}/lessons/${lesson.id}/quiz`);
            if (quizRes.ok) {
              quizData = await quizRes.json();
            }
          } catch (e) {
            console.error(`Error fetching quiz for lesson ${lesson.id}:`, e);
          }
          
          // Return the complete lesson data
          return {
            id: lesson.id,
            title: lesson.title,
            content: contentData.content || '',
            isCompleted: lesson.isCompleted || false,
            quiz: quizData
          };
        } catch (error) {
          console.error(`Error fetching data for lesson ${lesson.id}:`, error);
          // Return basic lesson data even if we couldn't fetch details
          return {
            id: lesson.id,
            title: lesson.title,
            content: '',
            isCompleted: false,
            quiz: []
          };
        }
      });
      
      return Promise.all(lessonDataPromises);
    } catch (error) {
      console.error(`Error fetching lessons for module ${moduleId}:`, error);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Heading
        title="Create Course"
        description="Create a new course on any topic you like"
        icon={LucideTestTube2}
        iconColor="text-blue-500"
        bgColor="bg-blue-800"
      />
      <div className="max-w-3xl mx-auto">
        
        {step === 1 && (
          <>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search any topic to create a custom course..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={courseTopic}
                  onChange={(e) => setCourseTopic(e.target.value)}
                />
              </div>
              
              <button 
                onClick={generateCourse}
                disabled={!courseTopic || isLoading}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Create Course
              </button>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Suggested Topics:</h2>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => selectTopic(topic)}
                    className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Add the Previous Courses component */}
            <PreviousCourses />
          </>
        )}
        
        {step === 2 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-2xl font-semibold mb-4">Generating Your Course</h2>
            <p className="mb-6">Creating a comprehensive course on <strong>{courseTopic}</strong></p>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="text-gray-500">
              {progress < 30 ? 'Creating course outline...' : 
               progress < 60 ? 'Generating modules...' : 
               progress < 90 ? 'Creating lessons...' : 
               'Finalizing your course...'}
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Course Created!</h2>
            <p className="mb-6">Your course on <strong>{courseTopic}</strong> is ready to explore</p>
            <p className="text-gray-500">Redirecting you to your new course...</p>
          </div>
        )}
      </div>
    </div>
  );
}