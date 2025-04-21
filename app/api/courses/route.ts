import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { courseTopic } = await request.json();
    
    if (!courseTopic) {
      return NextResponse.json({ error: 'Course topic is required' }, { status: 400 });
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const subjectPrompt = `Create a concise description for a course on "${courseTopic}". 
      The description should be engaging and highlight the key benefits of the course.`;
    
    const subjectResult = await model.generateContent(subjectPrompt);
    const subjectDescription = await subjectResult.response.text();
    
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .insert({
        title: courseTopic,
        description: subjectDescription,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (subjectError) {
      console.error('Error creating subject:', subjectError);
      return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }
    
    const subjectId = subjectData.id;
    
    const modulesPrompt = `Create 4-5 modules for a course on "${courseTopic}". 
      For each module, provide a title and brief description. 
      Format the response as a JSON array like this:
      [
        {"title": "Module 1 Title", "description": "Description of module 1"},
        {"title": "Module 2 Title", "description": "Description of module 2"}
      ]`;
    
    const modulesResult = await model.generateContent(modulesPrompt);
    const modulesText = await modulesResult.response.text();
    
    const modules = JSON.parse(modulesText.replace(/```json|```/g, ''));
    let totalLessons = 0;
    
    // Track module IDs for local storage
    const moduleIds = [];
    
    for (let i = 0; i < modules.length; i++) {
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .insert({
          subject_id: subjectId,
          title: modules[i].title,
          description: modules[i].description,
          order_number: i + 1
        })
        .select('id')
        .single();
      
      if (moduleError) {
        console.error('Error creating module:', moduleError);
        continue;
      }
      
      moduleIds.push(moduleData.id);
      
      const lessonsPrompt = `Create 3-5 lessons for a module titled "${modules[i].title}" in a course about "${courseTopic}".
        Provide only the lesson titles as a JSON array like this:
        ["Lesson 1 Title", "Lesson 2 Title", "Lesson 3 Title"]`;
      
      const lessonsResult = await model.generateContent(lessonsPrompt);
      const lessonsText = await lessonsResult.response.text();
      
      const lessons = JSON.parse(lessonsText.replace(/```json|```/g, ''));
      totalLessons += lessons.length;
      
      for (let j = 0; j < lessons.length; j++) {
        const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            module_id: moduleData.id,
            title: lessons[j],
            order_number: j + 1
          });
        
        if (lessonError) {
          console.error('Error creating lesson:', lessonError);
        }
      }
    }
    
    // Store in localStorage via an API header
    // This will be picked up by a client-side interceptor
    const estimatedMinutes = totalLessons * 15;
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    const estimatedDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    const courseData = {
      id: subjectId,
      title: courseTopic,
      createdAt: Date.now(),
      moduleCount: modules.length,
      totalLessons: totalLessons,
      estimatedDuration: estimatedDuration,
      modules: moduleIds
    };
    
    return NextResponse.json({ 
      success: true, 
      subjectId: subjectId,
      courseData: courseData // Include course data to be stored client-side
    });
    
  } catch (error) {
    console.error('Error generating course:', error);
    return NextResponse.json({ error: 'Failed to generate course' }, { status: 500 });
  }
}