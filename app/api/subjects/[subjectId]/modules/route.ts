import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subjectId: string }> }
) {
  // Await the params to get their values
  const params = await context.params;
  const subjectId = params.subjectId;


  // Initialize Supabase client
  const supabase = createRouteHandlerClient({ cookies });
  

  
  try {
    // Verify subject exists and belongs to user
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, user_id')
      .eq('id', subjectId)
      .single();
    
    if (subjectError || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    
    // Get modules for this subject
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, description, order_number')
      .eq('subject_id', subjectId)
      .order('order_number', { ascending: true });
    
    if (modulesError) {
      throw modulesError;
    }
    
    // For each module, count lessons and estimate duration
    const enhancedModules = await Promise.all(modules.map(async (module) => {
      const { count: lessonCount, error: countError } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('module_id', module.id);
      
      if (countError) {
        console.error('Error counting lessons:', countError);
      }
      
      // Estimate 15 minutes per lesson
      const count = lessonCount || 0;
      const totalMinutes = count * 15;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      return {
        id: module.id,
        title: module.title,
        description: module.description,
        lessonCount: count,
        duration
      };
    }));
    
    return NextResponse.json(enhancedModules);
    
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
  }
}