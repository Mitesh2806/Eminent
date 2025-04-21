// app/api/lecture-transcription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { transcript } = await request.json();
    
    // Use the provided transcript or default to React Hooks transcript
    const textToUse = transcript || REACT_HOOKS_TRANSCRIPT;
    
    // Generate a quiz using Gemini
    const quiz = await generateQuiz(textToUse);
    
    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}

async function generateQuiz(transcript: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `
    Based on the following lecture transcript, generate a quiz with 20 multiple-choice questions.
    
    Each question should:
    - Have 4 possible answers (a, b, c, d) with only one correct answer
    - Be worth 5 points each (total 100 points)
    - Test understanding of key concepts from the lecture
    - Have varying difficulty levels
    - Be engaging and interesting
    
    Return the result as a valid JSON object with this structure:
    {
      "questions": [
        {
          "question": "The question text",
          "options": {
            "a": "First option",
            "b": "Second option",
            "c": "Third option",
            "d": "Fourth option"
          },
          "correctAnswer": "a", // The correct option letter
          "points": 5
        },
        // ...more questions
      ]
    }
    
    Transcript: ${transcript}
  `;

  const result = await model.generateContent(prompt);
  const textResult = result.response.text();
  
  // Extract JSON from response
  try {
    const jsonStart = textResult.indexOf('{');
    const jsonEnd = textResult.lastIndexOf('}') + 1;
    const jsonString = textResult.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing quiz JSON:', error);
    throw new Error('Failed to parse quiz data');
  }
}

// Default transcript for React Hooks (only used if no transcript is provided)
const REACT_HOOKS_TRANSCRIPT = `
Introduction to React Hooks

Today, we're going to explore React Hooks, one of the most significant additions to React in recent years. React Hooks were introduced in React 16.8 as a way to use state and other React features without writing a class.

// Rest of the transcript is the same as before
`;