import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  
  // Get subjects created by the user
  const { data: subjects, error } = await supabase
    .from('subjects')
    .select(`
      id,
      title,
      description,
      created_at
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }

  // Fetch additional metadata (lesson count and duration)
  const enhancedSubjects = await Promise.all(subjects.map(async (subject) => {
    // Count lessons for this subject
    const { count: lessonCount, error: countError } = await supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('module.subject_id', subject.id)
      .throwOnError();
    
    if (countError) {
      console.error('Error counting lessons:', countError);
    }
    
    // Estimate duration (15 minutes per lesson as a placeholder)
    const estimatedMinutes = (lessonCount || 0) * 15;
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    return {
      ...subject,
      lessonCount: lessonCount || 0,
      duration
    };
  }));
  
  return NextResponse.json(enhancedSubjects);
}