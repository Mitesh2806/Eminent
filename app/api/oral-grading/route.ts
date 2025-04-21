import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    
    const formData = await req.formData();
    const questionId = formData.get('questionId') as string;
    const questionText = formData.get('questionText') as string;
    const transcript = formData.get('transcript') as string;
    
    if (!questionId || !questionText || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields: questionId, questionText, or transcript' },
        { status: 400 }
      );
    }

    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `
    Question: "${questionText}"
    Student's Answer (transcribed): "${transcript}"
    
    Imagine you are a knowledgeable viva examiner and a dedicated teacher in the subject of the question. 
    Evaluate the student's answer critically and constructively, highlighting what is correct and what needs improvement. 
    Address the student directly, offering detailed feedback, probing questions if necessary, and clear suggestions for corrections. 
    Return your response strictly in the following JSON format:
    {
      "isCorrect": boolean,
      "feedback": "detailed feedback here",
      "corrections": ["specific correction 1", "specific correction 2"]
    }
    `;
    
    try {
      const geminiResponse = await model.generateContent(prompt);
      const geminiResult = geminiResponse.response;
      const textResult = geminiResult.text();

      // Clean up the text result by removing markdown code block delimiters
      let cleanedText = textResult.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      }
      
      let evaluationResult;
      try {
        evaluationResult = JSON.parse(cleanedText);
      } catch (e) {
        console.error('Error parsing Gemini response:', e, 'Raw text:', textResult);
        evaluationResult = {
          isCorrect: false,
          feedback: "Failed to parse evaluation response",
          corrections: ["The evaluation system encountered an error. Please try again."]
        };
      }
      // Return the evaluation result
      return NextResponse.json({
        success: true,
        data: {
          questionId,
          transcription: transcript,
          evaluation: evaluationResult
        }
      });
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      return NextResponse.json(
        { error: 'Failed to communicate with the AI evaluation service' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}