import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// GET: Fetch quiz questions
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
  
  // Fetch the lesson and check if it has quiz content
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      quiz_content,
      modules:module_id (
        id,
        title
      )
    `)
    .eq('id', lessonId)
    .single();
  
  if (lessonError) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }
  
  // If quiz already exists, return it
  if (lesson.quiz_content) {
    return NextResponse.json(lesson.quiz_content);
  }
  
  // Generate quiz using Gemini API
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const lessonTopic = `${lesson.title}`;
    
    const promptText = `Create a quiz with 5 multiple-choice questions about "${lessonTopic}".
      Each question should have exactly 4 options with one correct answer.
      Format the response as a valid JSON array like this:
      [
        {
          "id": "q1",
          "question": "What is X?",
          "options": [
            {"id": "a", "text": "Option A", "isCorrect": false},
            {"id": "b", "text": "Option B", "isCorrect": true},
            {"id": "c", "text": "Option C", "isCorrect": false},
            {"id": "d", "text": "Option D", "isCorrect": false}
          ]
        }
      ]`;
    
    const result = await model.generateContent(promptText);
    const quizJsonText = result.response.text();
    
    // Parse the JSON (remove code block notation if present)
    let quizJson = quizJsonText.replace(/```json|```/g, '').trim();
    const quizQuestions = JSON.parse(quizJson);
    
    // Save the quiz to the database
    await supabase
      .from('lessons')
      .update({ quiz_content: quizQuestions })
      .eq('id', lessonId);
    
    return NextResponse.json(quizQuestions);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz content' },
      { status: 500 }
    );
  }
}

// POST: Evaluate quiz answers
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ moduleId: string, lessonId: string }> }
) {
  const params = await context.params;
  const lessonId = params.lessonId;
  const moduleId = params.moduleId;
  
  // Get submitted answers from request body
  const submittedAnswers = await request.json();
  
  // Initialize Supabase client
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Fetch the quiz content to compare with submitted answers
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('quiz_content')
      .eq('id', lessonId)
      .single();
    
    if (lessonError) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    
    const quizQuestions = lesson.quiz_content;
    
    if (!quizQuestions) {
      return NextResponse.json({ error: 'Quiz not found for this lesson' }, { status: 404 });
    }
    
    // Evaluate each answer
    const results = Object.entries(submittedAnswers).map(([questionId, selectedOptionId]) => {
      const question = quizQuestions.find((q: any) => q.id === questionId);
      
      if (!question) {
        return { 
          questionId, 
          correct: false, 
          message: 'Question not found' 
        };
      }
      
      const selectedOption = question.options.find((o: any) => o.id === selectedOptionId);
      const correctOption = question.options.find((o: any) => o.isCorrect);
      
      return {
        questionId,
        question: question.question,
        selected: selectedOptionId,
        correct: selectedOption?.isCorrect || false,
        correctOption: correctOption?.id,
        correctText: correctOption?.text
      };
    });
    
    // Calculate overall score
    const correctCount = results.filter(r => r.correct).length;
    const totalQuestions = quizQuestions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    
    // If score is good enough, mark lesson as completed
    if (score >= 70) {
      await supabase
        .from('user_progress')
        .upsert({
          lesson_id: lessonId,
          is_completed: true,
          last_accessed: new Date().toISOString(),
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id, lesson_id' });
    }
    
    return NextResponse.json({
      score,
      correctCount,
      totalQuestions,
      passed: score >= 70,
      results
    });
  } catch (error) {
    console.error('Error evaluating quiz:', error);
    return NextResponse.json({ error: 'Failed to evaluate quiz' }, { status: 500 });
  }
}