// app/(dashboard)/(routes)/lecture-transcript/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: string;
  points: number;
}

interface QuizData {
  questions: QuizQuestion[];
}

interface LectureCard {
  id: string;
  title: string;
  description: string;
  transcript: string;
  image: string;
}

export default function LectureTranscriptPage() {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentStep, setCurrentStep] = useState<'cards' | 'transcript' | 'quiz' | 'results'>('cards');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [selectedLecture, setSelectedLecture] = useState<LectureCard | null>(null);

  const lectureCards: LectureCard[] = [
    {
      id: 'machine-learning-intro',
      title: 'Introduction to Machine Learning',
      description: 'Understand the basics of Machine Learning and its applications',
      image: '/machinelearning.jpg',
      transcript: MACHINE_LEARNING_TRANSCRIPT
    },
{ id: 'react-hooks', title: 'Introduction to React Hooks', description: 'Learn the fundamentals of React Hooks and how they can simplify your components', image: '/react-hooks.jpg', transcript: REACT_HOOKS_TRANSCRIPT }, 
    {
      id: 'inorganic-chemistry',
      title: 'Basics of Inorganic Chemistry',
      description: 'Explore the fundamental concepts of Inorganic Chemistry',
      image: '/inorganic-chem.jpg',
      transcript: INORGANIC_CHEMISTRY_TRANSCRIPT
    }
  ];

  // Generate quiz from the transcript
  const generateQuiz = async () => {
    if (!selectedLecture) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/lecture-transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: selectedLecture.transcript }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }
      
      const data = await response.json();
      setQuiz(data.quiz);
      setCurrentStep('quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectLecture = (lecture: LectureCard) => {
    setSelectedLecture(lecture);
    setCurrentStep('transcript');
  };

  const selectAnswer = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    
    let totalScore = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        totalScore += question.points;
      }
    });
    
    setScore(totalScore);
    setCurrentStep('results');
  };

  // Reset the quiz
  const resetQuiz = () => {
    setAnswers({});
    setScore(0);
    setCurrentStep('cards');
    setQuiz(null);
    setSelectedLecture(null);
  };

  // Go back to lecture cards
  const backToLectures = () => {
    setCurrentStep('cards');
    setSelectedLecture(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Interactive Lecture Quizzes</h1>
      
      {currentStep === 'cards' && (
        <div>
          <p className="text-center text-gray-600 mb-8">Select a lecture to review and test your knowledge</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lectureCards.map((lecture) => (
              <div 
                key={lecture.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => selectLecture(lecture)}
              >
                <img 
                  src={lecture.image} 
                  alt={lecture.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{lecture.title}</h3>
                  <p className="text-gray-600 mb-4">{lecture.description}</p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {currentStep === 'transcript' && selectedLecture && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{selectedLecture.title}</h2>
            <button
              onClick={backToLectures}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to lectures
            </button>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg mb-6 max-h-96 overflow-y-auto whitespace-pre-line text-sm border border-gray-200">
            {selectedLecture.transcript}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={generateQuiz}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200 font-medium flex items-center"
            >
              {loading ? 'Generating Quiz...' : 'Generate Quiz'} 
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'quiz' && quiz && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Quiz: {selectedLecture?.title}</h2>
            <div className="text-sm text-gray-500">20 Questions | 100 Points Total</div>
          </div>
          
          {quiz.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="mb-8 p-5 border border-gray-100 rounded-lg bg-gray-50"
            >
              <h3 className="text-lg font-medium mb-4">
                <span className="text-blue-600 font-bold mr-2">{questionIndex + 1}.</span> {question.question}
              </h3>
              <div className="grid gap-3">
                {Object.entries(question.options).map(([key, value]) => (
                  <div 
                    key={key} 
                    className={`p-3 rounded-lg cursor-pointer border ${
                      answers[questionIndex] === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => selectAnswer(questionIndex, key)}
                  >
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={key}
                        checked={answers[questionIndex] === key}
                        onChange={() => {}}
                        className="mt-1 mr-3"
                      />
                      <span>
                        <span className="font-medium">{key.toUpperCase()})</span> {value}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep('transcript')}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Transcript
            </button>
            <button
              onClick={calculateScore}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={Object.keys(answers).length < quiz.questions.length}
            >
              Submit Answers
            </button>
          </div>
        </div>
      )}

      {currentStep === 'results' && quiz && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Quiz Results</h2>
          
          <div className="text-center mb-8 p-6 bg-gray-50 rounded-xl">
            <div className="text-6xl font-bold mb-2 text-blue-600">{score}/100</div>
            <div className="text-xl font-medium">
              {score >= 90 ? '🎉 Outstanding!' : 
               score >= 80 ? '🌟 Excellent!' : 
               score >= 70 ? '👍 Good job!' : 
               score >= 60 ? '🙂 Not bad!' : 
               '📚 Keep studying!'}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-medium mb-4">Question Review</h3>
            {quiz.questions.map((question, questionIndex) => (
              <div 
                key={questionIndex}
                className={`mb-6 p-4 rounded-lg ${
                  answers[questionIndex] === question.correctAnswer 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <h4 className="font-medium">
                  <span className="font-bold mr-2">{questionIndex + 1}.</span> {question.question}
                </h4>
                <div className="mt-3 ml-6">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div 
                      key={key}
                      className={`my-1 ${
                        key === question.correctAnswer 
                          ? 'text-green-700 font-medium' 
                          : answers[questionIndex] === key && key !== question.correctAnswer 
                            ? 'text-red-700 line-through' 
                            : ''
                      }`}
                    >
                      {key.toUpperCase()}) {value} 
                      {key === question.correctAnswer && ' ✓'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setCurrentStep('quiz')}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Review Questions
            </button>
            <button
              onClick={resetQuiz}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Hardcoded transcript for React Hooks
const REACT_HOOKS_TRANSCRIPT = `
Introduction to React Hooks

Today, we're going to explore React Hooks, one of the most significant additions to React in recent years. React Hooks were introduced in React 16.8 as a way to use state and other React features without writing a class.

Let's start with the useState Hook. This is the most basic Hook and allows you to add state to functional components. Before Hooks, you needed to write a class component to manage state. Now, with the useState Hook, you can do this in functional components.

The syntax for useState is straightforward. You call it with an initial state value and it returns an array with two elements: the current state value and a function to update it. Through array destructuring, you can assign names to these elements.

For example:
const [count, setCount] = useState(0);

Here, count is the state variable and setCount is the function to update it. The argument 0 is the initial state value.

Next, let's look at the useEffect Hook. This Hook lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes, but unified into a single API.

The useEffect Hook takes two arguments: a function that contains the side-effect logic, and optionally, an array of dependencies. The function runs after every render by default, but you can control when it runs by specifying dependencies.

For example:
useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]);

This effect will run whenever the count value changes.

The useContext Hook is another important one. It lets you subscribe to React context without introducing nesting. Context provides a way to pass data through the component tree without having to pass props down manually at every level.

Another powerful Hook is useReducer. This is an alternative to useState and is preferable when you have complex state logic that involves multiple sub-values or when the next state depends on the previous one.

The useCallback Hook returns a memoized version of the callback that only changes if one of the dependencies has changed. This is useful when passing callbacks to optimized child components that rely on reference equality to prevent unnecessary renders.

The useMemo Hook is similar to useCallback but for any value type, not just functions. It will only recompute the memoized value when one of the dependencies has changed.

Custom Hooks are also a powerful feature. They let you extract component logic into reusable functions. A custom Hook is a JavaScript function whose name starts with "use" and that may call other Hooks.

For example:
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return width;
}

Rules of Hooks:
1. Only call Hooks at the top level of your components or custom Hooks.
2. Don't call Hooks inside loops, conditions, or nested functions.
3. Only call Hooks from React function components or custom Hooks.

Hooks have dramatically changed how we write React components. They encourage a more functional programming style and make it easier to reuse stateful logic between components without complex patterns like render props or higher-order components.

In conclusion, Hooks are a powerful addition to React that simplify your components and make it easier to reuse code. By understanding and leveraging Hooks effectively, you can write more maintainable and efficient React applications.
`;

const MACHINE_LEARNING_TRANSCRIPT = `
Introduction to Machine Learning
Machine Learning (ML) is a subset of artificial intelligence (AI) that focuses on building systems that learn from data and improve their performance over time without being explicitly programmed. It has a wide range of applications, from image and speech recognition to predictive analytics and autonomous systems.
Key Concepts:
1. Supervised Learning: Involves training a model on labeled data, where the input-output pairs are known. Common algorithms include linear regression, logistic regression, and support vector machines.
2. Unsupervised Learning: Involves training a model on unlabeled data, where the goal is to find hidden patterns or structures. Common algorithms include k-means clustering and principal component analysis (PCA).
3. Reinforcement Learning: Involves training a model to make a sequence of decisions by rewarding it for good decisions and penalizing it for bad ones. Common algorithms include Q-learning and deep reinforcement learning.
Important Techniques:
1. Feature Engineering: The process of selecting, modifying, and creating features (input variables) to improve the performance of a machine learning model.
2. Model Evaluation: Techniques such as cross-validation, confusion matrix, and ROC curves are used to evaluate the performance of a machine learning model.
3. Hyperparameter Tuning: The process of optimizing the hyperparameters (settings) of a machine learning algorithm to improve its performance.
Machine Learning Workflow:
1. Data Collection: Gathering relevant data from various sources.
2. Data Preprocessing: Cleaning and transforming the data to make it suitable for modeling.
3. Model Training: Using algorithms to train a model on the preprocessed data.
4. Model Evaluation: Assessing the performance of the model using evaluation metrics.
5. Model Deployment: Integrating the trained model into a production environment to make predictions on new data.
Machine Learning Libraries and Tools:
1. Scikit-learn: A popular Python library for machine learning that provides simple and efficient tools for data mining and data analysis.
2. TensorFlow: An open-source library developed by Google for deep learning and machine learning applications.
3. PyTorch: An open-source machine learning library developed by Facebook's AI Research lab, known for its flexibility and ease of use.
In conclusion, Machine Learning is a powerful tool that enables computers to learn from data and make intelligent decisions. By understanding the key concepts, techniques, and workflow, you can start building your own machine learning models and applications.
`;
// Hardcoded transcript for Inorganic Chemistry
const INORGANIC_CHEMISTRY_TRANSCRIPT = `
Basics of Inorganic Chemistry
Inorganic Chemistry is the branch of chemistry that deals with the properties and behavior of inorganic compounds, which include metals, minerals, and organometallic compounds. It is a vast field that covers a wide range of substances and reactions.
Key Concepts:
1. Periodic Table: The periodic table organizes elements based on their atomic number, electron configurations, and recurring chemical properties. It is a fundamental tool in inorganic chemistry.
2. Chemical Bonding: Inorganic compounds are formed through various types of chemical bonds, including ionic, covalent, and metallic bonds.
3. Coordination Chemistry: The study of coordination compounds, which consist of a central metal atom or ion bonded to surrounding ligands (molecules or ions).
Important Topics:
1. Transition Metals: Elements found in the d-block of the periodic table, known for their ability to form complex compounds and exhibit variable oxidation states.
2. Main Group Elements: Elements in the s- and p-blocks of the periodic table, including alkali metals, alkaline earth metals, halogens, and noble gases.
3. Acid-Base Chemistry: The study of acids and bases, their reactions, and their role in various chemical processes.
Inorganic Reactions:
1. Redox Reactions: Reactions involving the transfer of electrons between species, resulting in changes in oxidation states.
2. Precipitation Reactions: Reactions that result in the formation of an insoluble solid (precipitate) from two aqueous solutions.
3. Complexation Reactions: Reactions that involve the formation of complex compounds through the coordination of ligands to a central metal atom or ion.
Applications of Inorganic Chemistry:
1. Catalysis: Inorganic compounds, particularly transition metals, are widely used as catalysts in industrial processes to increase the rate of chemical reactions.
2. Materials Science: Inorganic chemistry plays a crucial role in the development of new materials, including ceramics, semiconductors, and superconductors.
3. Environmental Chemistry: Inorganic chemistry is essential for understanding and addressing environmental issues, such as pollution and the treatment of wastewater.
In conclusion, Inorganic Chemistry is a diverse and dynamic field that encompasses the study of a wide range of compounds and reactions. By understanding the key concepts and topics, you can gain a deeper appreciation for the role of inorganic chemistry in science and industry.
`;