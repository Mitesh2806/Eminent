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
  

  
  try {
    // Get module details
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select(`
        id,
        title,
        description,
        subjects:subject_id (
          id,
          title,
          user_id
        )
      `)
      .eq('id', moduleId)
      .single();
    
    if (moduleError || !module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    
    // Format response
    return NextResponse.json({
      id: module.id,
      title: module.title,
      // @ts-ignore
      subjectId: module.subjects.id,
            // @ts-ignore
      subjectTitle: module.subjects.title
    });
    
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 });
  }
}