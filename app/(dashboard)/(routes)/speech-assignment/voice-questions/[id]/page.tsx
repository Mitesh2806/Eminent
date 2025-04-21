"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mic, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const QUESTIONS = [
  {
    id: "1",
    text: "Explain the concept of React's virtual DOM and why it's important for performance.",
    category: "Web Development",
    difficulty: "medium",
  },
  {
    id: "2",
    text: "What is the difference between synchronous and asynchronous programming?",
    category: "Programming Concepts",
    difficulty: "easy",
  },
  {
    id: "3",
    text: "Explain how blockchain technology works and its main advantages.",
    category: "Blockchain",
    difficulty: "hard",
  },
];

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

interface EvaluationResult {
  isCorrect: boolean;
  feedback: string;
  corrections: string[];
}

export default function VoiceQuestionPage({ params }: { params: Promise<{ id: string }> }) {
 
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Use react-speech-recognition hook to capture the transcript
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    const foundQuestion = QUESTIONS.find((q) => q.id === id);
    if (foundQuestion) {
      setQuestion(foundQuestion as Question);
    } else {
      router.push("/voice-questions");
    }
  }, [id, router]);

  const submitAnswer = async () => {
    if (!transcript || !question) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("questionId", question.id);
      formData.append("questionText", question.text);
      formData.append("transcript", transcript);

      const response = await fetch("/api/oral-grading", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = await response.json();
      setEvaluation(data.data.evaluation);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "default";
      case "medium":
        return "secondary";
      case "hard":
        return "destructive";
      default:
        return "default";
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser does not support speech recognition.</span>;
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-[80%] py-8 mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Badge variant={getDifficultyColor(question.difficulty) as any} className="px-3 py-1">
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">{question.category}</Badge>
          </div>
          <CardTitle className="text-2xl mb-2">Question {question.id}</CardTitle>
          <CardDescription className="text-base">Answer the question below using your voice</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 py-4">
          <Alert className="p-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <AlertTitle className="mb-2">Question</AlertTitle>
            <AlertDescription className="mt-2 text-lg">{question.text}</AlertDescription>
          </Alert>

          <div className="rounded-md bg-slate-50 p-6">
            <div className="flex flex-col items-center justify-center space-y-5">
              <textarea
                className="w-full p-4 rounded-md border border-slate-200"
                value={transcript}
                placeholder="Your transcribed answer appears here..."
                readOnly
                rows={6}
              />
              <div className="flex gap-4 mt-2">
                {!listening && (
                  <Button onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'en-US' })} size="lg" className="py-2 px-4">
                    <Mic className="mr-2 h-5 w-5" /> Start Listening
                  </Button>
                )}
                {listening && (
                  <Button variant="destructive" onClick={SpeechRecognition.stopListening} size="lg" className="py-2 px-4">
                    <RefreshCw className="mr-2 h-5 w-5" /> Stop Listening
                  </Button>
                )}
                <Button variant="outline" onClick={resetTranscript} className="py-2 px-4">
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset Transcript
                </Button>
              </div>
              <Button onClick={submitAnswer} disabled={isSubmitting || !transcript} className="py-2 px-6 mt-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                  </>
                ) : (
                  <>Submit Answer</>
                )}
              </Button>
            </div>
          </div>

          {evaluation && (
            <div className="space-y-4 mt-6">
              <Separator className="my-4" />
              <h3 className="text-lg font-medium mb-3">Evaluation Results</h3>
              <div className="flex items-center mb-4">
                <div className="mr-3">
                  {evaluation.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <div className="text-lg font-medium">
                  {evaluation.isCorrect ? "Correct Answer" : "Needs Improvement"}
                </div>
              </div>
              <div className="p-5 rounded-md bg-slate-50">
                <h4 className="font-medium mb-3">Feedback:</h4>
                <p className="mb-3">{evaluation.feedback}</p>
                {evaluation.corrections.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Suggestions for Improvement:</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      {evaluation.corrections.map((correction, i) => (
                        <li key={i}>{correction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between p-6">
          <Button variant="outline" onClick={() => router.push("/voice-questions")} className="px-4 py-2">
            Back to Questions
          </Button>
          {evaluation && parseInt(question.id) < QUESTIONS.length && (
            <Button onClick={() => router.push(`/voice-questions/${parseInt(question.id) + 1}`)} className="px-4 py-2">
              Next Question
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}