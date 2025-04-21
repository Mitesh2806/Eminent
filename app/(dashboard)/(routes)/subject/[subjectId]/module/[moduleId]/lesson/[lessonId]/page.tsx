'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { use } from 'react';
interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface LessonData {
  id: string;
  title: string;
  content: string;
}

export default  function LessonPage({
  params,
}: {
  params: Promise<{ subjectId: string; moduleId: string; lessonId: string }>;
}) {
  const { subjectId, moduleId, lessonId } = use(params);

  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'content' | 'simplify' | 'quiz'>('content');
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [simplifiedContent, setSimplifiedContent] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      setIsLoading(true);
      try {
        // Fetch lesson content
        const contentRes = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}/content`);
        if (!contentRes.ok) throw new Error('Failed to fetch lesson content');
        const contentData = await contentRes.json();
        setLessonData(contentData);
        
        // Fetch navigation info (next/prev lessons)
        const navRes = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}/navigation`);
        if (navRes.ok) {
          const navData = await navRes.json();
          setNextLessonId(navData.nextLessonId);
          setPrevLessonId(navData.prevLessonId);
        }
        
      } catch (error) {
        console.error('Error fetching lesson data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLessonData();
  }, [lessonId, moduleId]);
  
  useEffect(() => {
    // Reset quiz state when activeTab changes
    if (activeTab === 'quiz') {
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setQuizCompleted(false);
      setScore(0);
      
      // Fetch quiz questions
      const fetchQuizQuestions = async () => {
        try {
          const quizRes = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}/quiz`);
          if (!quizRes.ok) throw new Error('Failed to fetch quiz');
          const quizData = await quizRes.json();
          setQuizQuestions(quizData);
        } catch (error) {
          console.error('Error fetching quiz:', error);
        }
      };
      
      fetchQuizQuestions();
    } else if (activeTab === 'simplify' && !simplifiedContent) {
      // Fetch simplified content if not loaded yet
      const fetchSimplifiedContent = async () => {
        try {
          const res = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}/content?mode=simplify`);
          if (!res.ok) throw new Error('Failed to fetch simplified content');
          const data = await res.json();
          setSimplifiedContent(data.content);
        } catch (error) {
          console.error('Error fetching simplified content:', error);
        }
      };
      
      fetchSimplifiedContent();
    }
  }, [activeTab, lessonId, moduleId, simplifiedContent]);
  
  const markLessonAsCompleted = async () => {
    try {
      await fetch(`/api/modules/${moduleId}/lessons/${lessonId}/complete`, {
        method: 'POST'
      });
      goToNextLesson();
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  };
  
  const handleOptionSelect = (optionId: string) => {
    if (!isAnswerChecked) {
      setSelectedOption(optionId);
    }
  };
  
  const checkAnswer = () => {
    if (!selectedOption || isAnswerChecked) return;
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const selectedOptionData = currentQuestion.options.find(option => option.id === selectedOption);
    
    const correct = selectedOptionData?.isCorrect || false;
    setIsAnswerCorrect(correct);
    setIsAnswerChecked(true);
    
    if (correct) {
      setScore(prevScore => prevScore + 1);
    }
    
    setShowNextButton(true);
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setShowNextButton(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      
      // If score is high enough (e.g., 60% or more), mark lesson as completed
      const passingScore = Math.ceil(quizQuestions.length * 0.6);
      if (score >= passingScore) {
        markLessonAsCompleted();
      }
    }
  };
  
  const goToNextLesson = () => {
    if (nextLessonId) {
      router.push(`/subject/${subjectId}/module/${moduleId}/lesson/${nextLessonId}`);
    } else {
      // If there's no next lesson, go back to the module page
      router.push(`/subject/${subjectId}/module/${moduleId}`);
    }
  };
  
  const goToPreviousLesson = () => {
    if (prevLessonId) {
      router.push(`/subject/${subjectId}/module/${moduleId}/lesson/${prevLessonId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading lesson content...</div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Lesson not found</h1>
          <p className="mt-4">The lesson you're looking for doesn't exist or you don't have access to it.</p>
          <Link href={`/subject/${subjectId}/module/${moduleId}`} className="mt-6 inline-block text-blue-600 hover:underline">
            Return to Module
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 flex justify-between">
          <Link 
            href={`/subject/${subjectId}/module/${moduleId}`} 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Link>
          
          {/* Lesson navigation buttons */}
          <div className="flex space-x-4">
            {prevLessonId && (
              <button 
                onClick={goToPreviousLesson}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Previous Lesson
              </button>
            )}
            
            {nextLessonId && (
              <button 
                onClick={goToNextLesson}
                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm flex items-center"
              >
                Next Lesson
                <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            )}
          </div>
        </div>
        
        {/* Lesson header */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h1 className="text-2xl font-bold">{lessonData.title}</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 ${activeTab === 'content' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('content')}
          >
            Lesson Content
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'simplify' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('simplify')}
          >
            Simplified
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'quiz' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('quiz')}
          >
            Quiz
          </button>
        </div>
        
        {/* Content display */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'content' && (
            <div 
              className="prose max-w-full"
              dangerouslySetInnerHTML={{ __html: lessonData.content }}
            />
          )}
          
          {activeTab === 'simplify' && (
            <>
              {simplifiedContent ? (
                <div 
                  className="prose max-w-full"
                  dangerouslySetInnerHTML={{ __html: simplifiedContent }}
                />
              ) : (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-lg">Generating simplified content...</div>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'quiz' && (
            <div>
              {quizQuestions.length > 0 ? (
                quizCompleted ? (
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
                    <p className="text-lg mb-6">
                      Your score: {score} out of {quizQuestions.length} ({Math.round((score / quizQuestions.length) * 100)}%)
                    </p>
                    
                    {score >= Math.ceil(quizQuestions.length * 0.6) ? (
                      <div className="mb-6">
                        <div className="inline-block p-3 bg-green-100 text-green-800 rounded-full mb-4">
                          <Check className="h-8 w-8" />
                        </div>
                        <p className="text-green-700 font-medium">
                          Well done! You've passed the quiz.
                        </p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className="inline-block p-3 bg-orange-100 text-orange-800 rounded-full mb-4">
                          <X className="h-8 w-8" />
                        </div>
                        <p className="text-orange-700 font-medium">
                          You might want to review the material and try again.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-center space-x-4 mt-6">
                      <button
                        onClick={() => {
                          setCurrentQuestionIndex(0);
                          setSelectedOption(null);
                          setIsAnswerChecked(false);
                          setQuizCompleted(false);
                          setScore(0);
                          setShowNextButton(false);
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Retry Quiz
                      </button>
                      
                      <button
                        onClick={goToNextLesson}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        {nextLessonId ? 'Go to Next Lesson' : 'Back to Module'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-8">
                      <div className="flex justify-between mb-4">
                        <span className="text-sm text-gray-500">
                          Question {currentQuestionIndex + 1} of {quizQuestions.length}
                        </span>
                        <span className="text-sm text-gray-500">
                          Score: {score}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-medium mb-6">
                        {quizQuestions[currentQuestionIndex].question}
                      </h3>
                      
                      <div className="space-y-3">
                        {quizQuestions[currentQuestionIndex].options.map((option) => (
                          <div
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            className={`p-4 rounded-lg border cursor-pointer ${
                              selectedOption === option.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${
                              isAnswerChecked && selectedOption === option.id
                                ? option.isCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-red-500 bg-red-50'
                                : ''
                            } ${
                              isAnswerChecked && option.isCorrect
                                ? 'border-green-500 bg-green-50'
                                : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <div className="flex-1">{option.text}</div>
                              {isAnswerChecked && option.isCorrect && (
                                <Check className="h-5 w-5 text-green-600" />
                              )}
                              {isAnswerChecked && !option.isCorrect && selectedOption === option.id && (
                                <X className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      {!isAnswerChecked ? (
                        <button
                          onClick={checkAnswer}
                          disabled={!selectedOption}
                          className={`px-4 py-2 rounded ${
                            selectedOption
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Check Answer
                        </button>
                      ) : (
                        <div className="text-lg font-medium">
                          {isAnswerCorrect ? (
                            <span className="text-green-600">Correct!</span>
                          ) : (
                            <span className="text-red-600">Incorrect!</span>
                          )}
                        </div>
                      )}
                      
                      {showNextButton && (
                        <button
                          onClick={goToNextQuestion}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-lg">Loading quiz questions...</div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Completion button - only show at bottom of content pages */}
        {(activeTab === 'content' || activeTab === 'simplify') && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={markLessonAsCompleted}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Mark as Completed & Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}