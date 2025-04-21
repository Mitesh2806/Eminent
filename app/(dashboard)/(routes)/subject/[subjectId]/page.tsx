'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { useCachedFetch } from '@/lib/use-cached-data';

interface Module {
  id: string;
  title: string;
  description: string;
  lessonCount: number;
  duration: string;
}

interface Subject {
  id: string;
  title: string;
  description: string;
}

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const router = useRouter();
  
  // Use cached fetch for subject data (cache for 10 minutes)
  const { 
    data: subject, 
    loading: subjectLoading, 
    error: subjectError 
  } = useCachedFetch<Subject>(`/api/subjects/${subjectId}`, undefined, 10 * 60 * 1000);
  
  // Use cached fetch for modules data (cache for 5 minutes)
  const { 
    data: modules, 
    loading: modulesLoading, 
    error: modulesError 
  } = useCachedFetch<Module[]>(`/api/subjects/${subjectId}/modules`);
  
  const isLoading = subjectLoading || modulesLoading;
  const hasError = subjectError || modulesError;

  const navigateToModule = (moduleId: string) => {
    router.push(`/subject/${subjectId}/module/${moduleId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading course content...</div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Error loading course</h1>
          <p className="mt-4">There was a problem loading the course content. Please try again later.</p>
          <Link href="/dashboard" className="mt-6 inline-block text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Course not found</h1>
          <p className="mt-4">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard" className="mt-6 inline-block text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = (modules || []).reduce((sum, module) => sum + module.lessonCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back navigation */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Link>
        
        {/* Subject header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{subject.title}</h1>
          <p className="text-gray-600 mb-4">{subject.description}</p>
          
          {/* Subject metadata */}
          <div className="flex items-center text-sm text-gray-500 mt-4">
            <div className="flex items-center mr-6">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>{totalLessons} Lessons</span>
            </div>
            {modules && modules.length > 0 && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {modules.reduce((total, module) => {
                    const duration = module.duration;
                    const hours = duration.includes('h') ? parseInt(duration.split('h')[0]) : 0;
                    const minutes = duration.includes('m') ? 
                      parseInt(duration.includes('h') ? duration.split('h')[1].replace('m', '').trim() : duration.replace('m', '')) : 0;
                    return total + (hours * 60) + minutes;
                  }, 0)} minutes
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Modules list */}
        <div className="space-y-4">
          {modules && modules.map((module) => (
            <div 
              key={module.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigateToModule(module.id)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
                <p className="text-gray-600 mb-4">{module.description}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <div className="flex items-center mr-4">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{module.lessonCount} Lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{module.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}