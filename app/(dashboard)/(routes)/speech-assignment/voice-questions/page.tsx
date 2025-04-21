// app/voice-questions/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Book, ArrowRight, Loader2 } from "lucide-react";

// Hardcoded questions - same as in the API route
const QUESTIONS = [
  {
    id: "1",
    text: "Explain the concept of React's virtual DOM and why it's important for performance.",
    category: "Web Development",
    difficulty: "medium"
  },
  {
    id: "2",
    text: "What is the difference between synchronous and asynchronous programming?",
    category: "Programming Concepts",
    difficulty: "easy"
  },
  {
    id: "3",
    text: "Explain how blockchain technology works and its main advantages. Also state the difference between proof-of-work and proof-of-stake.",
    category: "Blockchain",
    difficulty: "hard"
  }
];

export default function VoiceQuestionsPage() {
  const [questions, setQuestions] = useState(QUESTIONS);
  const [loading, setLoading] = useState(false);

  // This function would normally fetch questions from the API
  // But we're using hardcoded questions for now
  const loadQuestions = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setQuestions(QUESTIONS);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

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

  return (
    <div className="container py-8 max-w-[80%] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Voice Questions</h1>
          <p className="text-slate-500 mt-1">
            Answer these questions using your voice to test your knowledge
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {questions.map((question) => (
            <Card key={question.id} className="flex flex-col h-full">
              <CardHeader className="p-6 pb-3">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant={getDifficultyColor(question.difficulty) as any} className="px-3 py-1">
                    {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">{question.category}</Badge>
                </div>
                <CardTitle className="line-clamp-2 mt-2">Question {question.id}</CardTitle>
                <CardDescription className="line-clamp-3 mt-2">{question.text}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-6 pt-2">
                <div className="flex items-center text-sm text-slate-500 p-1 mt-2">
                  <Mic className="mr-2 h-4 w-4" />
                  <span>Voice Response Required</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-2">
                <Link href={`voice-questions/${question.id}`} className="w-full">
                  <Button className="w-full py-2">
                    Answer Question <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}