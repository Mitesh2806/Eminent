'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import { use } from 'react';
import { useCachedFetch, clearCache } from '@/lib/use-cached-data';

interface Lesson {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface Module {
  id: string;
  title: string;
  subjectId: string;
  subjectTitle: string;
}

export default function ModulePage({
  params,
}: {
  params: Promise<{ subjectId: string; moduleId: string }>;
}) {
  const { subjectId, moduleId } = use(params);
  const router = useRouter();

  const { 
    data: module, 
    loading: moduleLoading, 
    error: moduleError 
  } = useCachedFetch<Module>(`/api/modules/${moduleId}`, undefined, 10 * 60 * 1000);
  
  const { 
    data: lessons, 
    loading: lessonsLoading, 
    error: lessonsError,
    refresh: refreshLessons
  } = useCachedFetch<Lesson[]>(`/api/modules/${moduleId}/lessons`, undefined, 5 * 60 * 1000);
  
  const isLoading = moduleLoading || lessonsLoading;
  const hasError = moduleError || lessonsError;

  useEffect(() => {
    const handleLessonCompleted = () => {
      clearCache(`/api/modules/${moduleId}/lessons`);
      refreshLessons();
    };
    
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, [moduleId, refreshLessons]);

  const navigateToLesson = (lessonId: string) => {
    router.push(`/subject/${subjectId}/module/${moduleId}/lesson/${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading module content...</div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Error loading module</h1>
          <p className="mt-4">There was a problem loading the module content. Please try again later.</p>
          <Link href="/dashboard" className="mt-6 inline-block text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Module not found</h1>
          <p className="mt-4">The module you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard" className="mt-6 inline-block text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const completedLessons = lessons ? lessons.filter(lesson => lesson.isCompleted).length : 0;
  const progressPercentage = lessons && lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back navigation */}
        <Link 
          href={`/subject/${subjectId}`} 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {module.subjectTitle}
        </Link>
        
        {/* Module header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{module.title}</h1>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{completedLessons} of {lessons ? lessons.length : 0} lessons completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Lessons list */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {lessons && lessons.map((lesson) => (
              <div 
                key={lesson.id}
                onClick={() => navigateToLesson(lesson.id)}
                className="p-4 hover:bg-gray-50 cursor-pointer flex items-center"
              >
                {lesson.isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                )}
                <span className={`${lesson.isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                  {lesson.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}