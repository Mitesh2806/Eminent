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
    // Get subject details
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, title, description')
      .eq('id', subjectId)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Return subject data
    return NextResponse.json({
      id: subject.id,
      title: subject.title,
      description: subject.description
    });

  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json({ error: 'Failed to fetch subject' }, { status: 500 });
  }
}