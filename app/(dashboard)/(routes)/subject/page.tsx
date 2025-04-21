'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import ModuleCacheService from '@/lib/module-cache';

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
  const [subject, setSubject] = useState<Subject | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    const fetchSubjectData = async () => {
      setIsLoading(true);
      
      try {
        // First, try to get modules from cache
        let cachedModules: Module[] = [];
        let foundInCache = false;
        
        // Get all created courses from localStorage
        const createdCoursesStr = localStorage.getItem('createdCourses');
        if (createdCoursesStr) {
          const createdCourses = JSON.parse(createdCoursesStr);
          const currentCourse = createdCourses.find((c: any) => c.id === subjectId);
          
          if (currentCourse) {
            // Try to find cached modules for this subject
            let moduleList: Module[] = [];
            
            // Attempt to get all modules from cache
            const moduleIds: string[] = [];
            
            // Check ModuleCache for any modules with matching subjectId
            const moduleCache = localStorage.getItem(ModuleCacheService['CACHE_KEY']);
            if (moduleCache) {
              try {
                const cache = JSON.parse(moduleCache);
                
                for (const key in cache) {
                  if (cache[key]?.data?.subjectId === subjectId) {
                    const moduleData = cache[key].data;
                    moduleList.push({
                      id: moduleData.id,
                      title: moduleData.title,
                      description: moduleData.description,
                      lessonCount: moduleData.lessons.length,
                      duration: moduleData.duration
                    });
                    moduleIds.push(moduleData.id);
                  }
                }
                
                if (moduleList.length > 0) {
                  // We found cached modules
                  cachedModules = moduleList;
                  foundInCache = true;
                  
                  // Also set the subject info
                  setSubject({
                    id: subjectId,
                    title: currentCourse.title,
                    description: `An in-depth course about ${currentCourse.title}`
                  });
                }
              } catch (error) {
                console.error('Error parsing module cache:', error);
              }
            }
          }
        }
        
        if (foundInCache) {
          setModules(cachedModules);
          setIsFromCache(true);
          setIsLoading(false);
          return;
        }
        
        // If not found in cache, fall back to API
        setIsFromCache(false);
        
        // Fetch subject details
        const subjectRes = await fetch(`/api/subjects/${subjectId}`);
        if (!subjectRes.ok) throw new Error('Failed to fetch subject');
        const subjectData = await subjectRes.json();
        setSubject(subjectData);

        // Fetch modules for this subject
        const modulesRes = await fetch(`/api/subjects/${subjectId}/modules`);
        if (!modulesRes.ok) throw new Error('Failed to fetch modules');
        const modulesData = await modulesRes.json();
        setModules(modulesData);
        
      } catch (error) {
        console.error('Error fetching subject data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectData();
    
    // Clean up expired modules when component mounts
    ModuleCacheService.cleanupCache();
  }, [subjectId]);

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

  const totalLessons = modules.reduce((sum, module) => sum + module.lessonCount, 0);

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
            {modules.length > 0 && (
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
          
          {isFromCache && (
            <div className="mt-3 text-xs text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Loaded from cache
            </div>
          )}
        </div>
        
        {/* Modules list */}
        <div className="space-y-4">
          {modules.map((module) => (
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