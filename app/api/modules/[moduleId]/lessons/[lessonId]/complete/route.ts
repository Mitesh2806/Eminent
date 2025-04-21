
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ moduleId: string, lessonId: string }> }
) {
  const params = await context.params;
  const lessonId = params.lessonId;
  const moduleId = params.moduleId;
  
  // Initialize Supabase client
  const supabase = createRouteHandlerClient({ cookies });
  
  // Update user progress
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      lesson_id: lessonId,
      is_completed: true,
      last_accessed: new Date().toISOString(),
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id, lesson_id' });
  
  if (error) {
    console.error('Error marking lesson as complete:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}