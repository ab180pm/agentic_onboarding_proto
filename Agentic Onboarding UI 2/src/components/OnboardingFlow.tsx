import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Users, ArrowRight, Check } from 'lucide-react';

type Step = {
  id: number;
  question: string;
  options?: { label: string; value: string; icon?: React.ReactNode }[];
  type: 'choice' | 'text' | 'multi-select';
};

const steps: Step[] = [
  {
    id: 1,
    question: "What brings you to Figma Make today?",
    type: 'choice',
    options: [
      { label: 'Build a web app', value: 'webapp', icon: <Zap className="w-5 h-5" /> },
      { label: 'Prototype an idea', value: 'prototype', icon: <Sparkles className="w-5 h-5" /> },
      { label: 'Create for a team', value: 'team', icon: <Users className="w-5 h-5" /> },
    ]
  },
  {
    id: 2,
    question: "What type of project are you working on?",
    type: 'choice',
    options: [
      { label: 'Personal project', value: 'personal' },
      { label: 'Client work', value: 'client' },
      { label: 'Company/Startup', value: 'company' },
      { label: 'Just exploring', value: 'exploring' },
    ]
  },
  {
    id: 3,
    question: "Which features are most important to you?",
    type: 'multi-select',
    options: [
      { label: 'AI-powered generation', value: 'ai' },
      { label: 'Real-time collaboration', value: 'collab' },
      { label: 'Database integration', value: 'database' },
      { label: 'Custom components', value: 'components' },
      { label: 'Responsive design', value: 'responsive' },
    ]
  },
];

interface OnboardingFlowProps {
  onComplete: (answers: Record<number, string | string[]>) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showTyping, setShowTyping] = useState(true);

  const step = steps[currentStep];

  useEffect(() => {
    setShowTyping(true);
    const timer = setTimeout(() => setShowTyping(false), 800);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleChoice = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(newAnswers);
      }
    }, 300);
  };

  const handleMultiSelect = (value: string) => {
    const newSelected = selectedOptions.includes(value)
      ? selectedOptions.filter(v => v !== value)
      : [...selectedOptions, value];
    setSelectedOptions(newSelected);
  };

  const handleMultiSelectContinue = () => {
    const newAnswers = { ...answers, [step.id]: selectedOptions };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedOptions([]);
      } else {
        onComplete(newAnswers);
      }
    }, 300);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <motion.h1
                className="mb-2 relative inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {step.question}
                {showTyping && (
                  <motion.span
                    className="inline-block w-1 h-8 bg-black ml-1 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </motion.h1>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {step.type === 'choice' && step.options?.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChoice(option.value)}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-left hover:border-black transition-all flex items-center gap-4 group"
                >
                  {option.icon && (
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                      {option.icon}
                    </div>
                  )}
                  <span className="flex-1">{option.label}</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                </motion.button>
              ))}

              {step.type === 'multi-select' && (
                <>
                  {step.options?.map((option, index) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMultiSelect(option.value)}
                      className={`w-full p-4 border-2 rounded-2xl text-left transition-all flex items-center gap-4 ${
                        selectedOptions.includes(option.value)
                          ? 'bg-black text-white border-black'
                          : 'bg-white border-gray-200 hover:border-black'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                          selectedOptions.includes(option.value)
                            ? 'bg-white border-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedOptions.includes(option.value) && (
                          <Check className="w-4 h-4 text-black" />
                        )}
                      </div>
                      <span className="flex-1">{option.label}</span>
                    </motion.button>
                  ))}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selectedOptions.length > 0 ? 1 : 0.5 }}
                    disabled={selectedOptions.length === 0}
                    onClick={handleMultiSelectContinue}
                    className="w-full p-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 mt-6 flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip Button */}
        {currentStep < steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => onComplete(answers)}
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              Skip onboarding
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}