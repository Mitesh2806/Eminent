import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Add more logging for debugging
const setupGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing from environment variables');
    throw new Error('GEMINI_API_KEY is not configured');
  }
  
  console.log('Initializing Gemini API with key length:', apiKey.length);
  return new GoogleGenerativeAI(apiKey);
};

// Initialize outside of the request handler to avoid reinitializing on every request
let genAI: GoogleGenerativeAI;
try {
  genAI = setupGenAI();
} catch (error) {
  console.error('Failed to initialize Gemini API:', error);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ moduleId: string, lessonId: string }> }
) {
  // Await the params to get their values
  const params = await context.params;
  const lessonId = params.lessonId;
  const moduleId = params.moduleId;
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'content';

  // Initialize Supabase client
  const supabase = createRouteHandlerClient({ cookies });

  // Fetch the lesson
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      content,
      simplified_content,
      modules:module_id (
        id,
        title,
        subjects:subject_id (
          id,
          title
        )
      )
    `)
    .eq('id', lessonId)
    .single();

  if (lessonError) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Record user progress (mark as viewed)
  await supabase
    .from('user_progress')
    .upsert({
      lesson_id: lessonId,
      is_completed: false,
      last_accessed: new Date().toISOString()
    }, { onConflict: 'user_id, lesson_id' });

  // Check if the content needs to be generated
  const contentField = mode === 'content' ? 'content' : 'simplified_content';
  if (lesson[contentField]) {
    // Content already exists, return it
    return NextResponse.json({
      id: lessonId,
      title: lesson.title,
      content: lesson[contentField]
    });
  }

  // Generate content using Gemini API
  try {
    // Verify the API is initialized
    if (!genAI) {
      genAI = setupGenAI();
    }
    
    // Get the lesson topic from its title
    const lessonTopic = lesson.title;
    console.log(`Generating ${mode} for lesson: "${lessonTopic}"`);

    let promptText = '';
    if (mode === 'content') {
      promptText = `Create a detailed lesson about "${lessonTopic}". Include an introduction, 
      main concepts, examples, and a conclusion. Format using HTML with proper headings, 
      paragraphs, and styling elements like <h1>, <h2>, <p>, <ul>, etc.`;
    } else {
      promptText = `Explain "${lessonTopic}" in simple, easy-to-understand terms. 
      Use straightforward language and basic examples. Format using HTML with proper 
      headings, paragraphs, and styling.`;
    }

    console.log('Attempting to connect to Gemini API...');
    
    // Create a new model instance for this request
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      // Add API configuration options if needed
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });
    
    console.log('Making API request to generate content...');
    
    // Implement timeout for the API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API request timed out after 50 seconds')), 50000);
    });
    
    // Make API request with timeout
    const result = await Promise.race([
      model.generateContent(promptText),
      timeoutPromise
    ]) as any; // Type assertion to handle the race result
    
    console.log('Received response from Gemini API');
    
    // Safely extract text from the response
    const contentHtml = result.response.text ? 
      (typeof result.response.text === 'function' ? await result.response.text() : result.response.text) : 
      JSON.stringify(result.response);

    console.log(`Generated content length: ${contentHtml.length} characters`);

    // Update the lesson with the generated content
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ [contentField]: contentHtml })
      .eq('id', lessonId);
      
    if (updateError) {
      console.error('Error updating lesson with generated content:', updateError);
      throw new Error('Failed to save generated content');
    }

    // Return the generated content
    return NextResponse.json({
      id: lessonId,
      title: lesson.title,
      content: contentHtml
    });
  } catch (error) {
    console.error('Error generating lesson content:', error);
    
    // Detailed error information
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error stack:', error.stack);
    }
    
    // Fallback content generation
    if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
      console.log('API connection failed. Generating fallback content...');
      
      // Generate simple fallback content
      const fallbackContent = `
        <h1>${lesson.title}</h1>
        <p>We're currently experiencing issues with our content generation system. 
        Please check back later for the complete lesson content.</p>
        <p>In the meantime, you can explore other lessons or modules.</p>
      `;
      
      // Save the fallback content
      await supabase
        .from('lessons')
        .update({ [contentField]: fallbackContent })
        .eq('id', lessonId);
        
      return NextResponse.json({
        id: lessonId,
        title: lesson.title,
        content: fallbackContent,
        notice: 'Using fallback content due to content generation issues'
      });
    }
    
    return NextResponse.json(
      { error: `Failed to generate lesson content: ${errorMessage}` },
      { status: 500 }
    );
  }
}