import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, Circle, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  userAnswers: Record<number, string | string[]>;
}

type Message = {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
};

type OnboardingStep = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Create your first project',
    description: 'Start by describing what you want to build',
    completed: false,
  },
  {
    id: 2,
    title: 'Import from Figma',
    description: 'Connect your Figma designs to generate code',
    completed: false,
  },
  {
    id: 3,
    title: 'Customize your app',
    description: 'Edit components and styling to match your vision',
    completed: false,
  },
  {
    id: 4,
    title: 'Preview and deploy',
    description: 'Test your app and share it with the world',
    completed: false,
  },
];

export function ChatInterface({ userAnswers }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [steps, setSteps] = useState(onboardingSteps);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial welcome message
    const timer1 = setTimeout(() => {
      addBotMessage("Welcome! 👋 I'm your Figma Make assistant.");
    }, 500);

    const timer2 = setTimeout(() => {
      addBotMessage("Based on your responses, I've created a personalized onboarding guide for you. Let me walk you through the key steps to get started:");
    }, 1500);

    const timer3 = setTimeout(() => {
      addBotMessage("Here's your onboarding checklist. Feel free to ask me anything about these steps, or just say 'continue' to get started!");
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const addBotMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
    }, 800);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    const userInput = inputValue.toLowerCase();
    setInputValue('');

    // Simple response logic
    setTimeout(() => {
      if (userInput.includes('continue') || userInput.includes('start')) {
        addBotMessage("Great! Let's start with the first step. Try creating your first project by describing what you want to build. For example: 'Create a landing page for a coffee shop'");
      } else if (userInput.includes('figma')) {
        addBotMessage("To import from Figma, you'll need to connect your Figma account. Once connected, you can select any frame and we'll generate the code automatically!");
      } else if (userInput.includes('help')) {
        addBotMessage("I'm here to help! You can ask me about any of the onboarding steps, or just tell me what you want to build and I'll guide you through it.");
      } else {
        addBotMessage("That's a great question! Each step in the onboarding checklist is designed to help you get the most out of Figma Make. Would you like to start with step 1?");
      }
    }, 1000);
  };

  const handleStepClick = (stepId: number) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Onboarding Steps */}
      <div className="w-80 border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2>Onboarding Guide</h2>
          </div>
          <p className="text-sm text-gray-600">
            Complete these steps to get started
          </p>
        </div>

        <div className="space-y-3 flex-1">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 3.5 + index * 0.1 }}
            >
              <button
                onClick={() => handleStepClick(step.id)}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  step.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm mb-1">{step.title}</div>
                    <div className="text-xs text-gray-600">
                      {step.description}
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Progress</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{
                  width: `${(steps.filter((s) => s.completed).length / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm">
              {steps.filter((s) => s.completed).length}/{steps.length}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-6">
          <h1>Getting Started</h1>
          <p className="text-gray-600 text-sm mt-1">
            Ask me anything about Figma Make
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="w-full px-4 py-3 pr-12 rounded-full border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Tip: Try asking about specific features or say &apos;continue&apos; to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
