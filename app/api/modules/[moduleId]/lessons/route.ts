import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ moduleId: string, lessonId: string }> }
) {
  // Await the params to get their values
  const params = await context.params;
  const lessonId = params.lessonId;
  const moduleId = params.moduleId;

  // Initialize Supabase client
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get user ID from session
 
  
  try {
    // Get module to verify it exists and belongs to the user
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id, subjects:subject_id(user_id)')
      .eq('id', moduleId)
      .single();
    
    if (moduleError || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    
  
    
    // Get lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        order_number
      `)
      .eq('module_id', moduleId)
      .order('order_number', { ascending: true });
    
    if (lessonsError) {
      throw lessonsError;
    }
    
    // Get completion status for each lesson
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('lesson_id, is_completed')
      .in('lesson_id', lessons.map(l => l.id));
    
    if (progressError) {
      throw progressError;
    }
    
    // Map progress data to lessons
    const progressMap = new Map();
    progress?.forEach(p => progressMap.set(p.lesson_id, p.is_completed));
    
    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      isCompleted: progressMap.get(lesson.id) || false
    }));
    
    return NextResponse.json(formattedLessons);
    
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}