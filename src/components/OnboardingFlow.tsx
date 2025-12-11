import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';

type Step = {
  id: number;
  question: string;
  subtitle?: string;
  options?: { label: string; value: string; icon?: React.ReactNode; description?: string }[];
  type: 'choice' | 'text' | 'multi-select';
  conditionalOn?: { stepId: number; values: string[] };
};

const steps: Step[] = [
  {
    id: 1,
    question: "What is your organization name?",
    subtitle: "Enter your company or team name",
    type: 'text',
  },
  {
    id: 2,
    question: "Have you used an MMP before?",
    subtitle: "Mobile Measurement Partner experience",
    type: 'choice',
    options: [
      { label: 'Yes', value: 'yes', description: 'I have experience with an MMP' },
      { label: 'No', value: 'no', description: 'This is my first time using an MMP' },
    ]
  },
  {
    id: 3,
    question: "Which MMP did you use?",
    subtitle: "Select the MMP you have experience with",
    type: 'choice',
    conditionalOn: { stepId: 2, values: ['yes'] },
    options: [
      { label: 'AppsFlyer', value: 'appsflyer' },
      { label: 'Adjust', value: 'adjust' },
      { label: 'Singular', value: 'singular' },
      { label: 'Branch', value: 'branch' },
      { label: 'Others', value: 'others' },
    ]
  },
  {
    id: 4,
    question: "Which MMP did you use?",
    subtitle: "Please specify the MMP name",
    type: 'text',
    conditionalOn: { stepId: 3, values: ['others'] },
  },
  {
    id: 5,
    question: "How do you plan to use Airbridge?",
    subtitle: "Select your primary goal",
    type: 'choice',
    options: [
      { label: 'Deep Linking', value: 'deeplink', description: 'Seamless user routing across platforms' },
      { label: 'Accurate & Unbiased Attribution', value: 'attribution', description: 'Measure true ad performance without bias' },
      { label: 'Granular Data Reports', value: 'granular-reports', description: 'Campaign to creative level insights' },
      { label: 'Automated Multichannel Reporting', value: 'adops', description: 'Unified AdOps across all channels' },
      { label: 'Unified Web & App Analytics', value: 'unified-analytics', description: 'Cross-platform data analysis' },
      { label: 'Ad Spend Optimization', value: 'optimization', description: 'Optimize spend by channel & campaign' },
    ]
  },
  {
    id: 6,
    question: "Do you have any ad channels in use?",
    subtitle: "Select channels to integrate (you can add more later)",
    type: 'multi-select',
    options: [
      { label: 'Meta Ads (Facebook/Instagram)', value: 'meta' },
      { label: 'Google Ads', value: 'google' },
      { label: 'Apple Search Ads', value: 'apple' },
      { label: 'TikTok For Business', value: 'tiktok' },
      { label: 'Other / None yet', value: 'other' },
    ]
  },
];

interface OnboardingFlowProps {
  onComplete: (answers: Record<number, string | string[]>) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showTyping, setShowTyping] = useState(true);
  const [textInput, setTextInput] = useState('');

  // Filter steps based on conditional logic
  const getVisibleSteps = () => {
    return steps.filter(step => {
      if (!step.conditionalOn) return true;
      const { stepId, values } = step.conditionalOn;
      const answer = answers[stepId];
      if (typeof answer === 'string') {
        return values.includes(answer);
      }
      return false;
    });
  };

  const visibleSteps = getVisibleSteps();
  const step = visibleSteps[currentStepIndex];

  useEffect(() => {
    setShowTyping(true);
    setTextInput('');
    const timer = setTimeout(() => setShowTyping(false), 800);
    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  const handleChoice = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      // Recalculate visible steps with new answers
      const newVisibleSteps = steps.filter(s => {
        if (!s.conditionalOn) return true;
        const { stepId, values } = s.conditionalOn;
        const answer = newAnswers[stepId];
        if (typeof answer === 'string') {
          return values.includes(answer);
        }
        return false;
      });
      if (currentStepIndex < newVisibleSteps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        onComplete(newAnswers);
      }
    }, 300);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    const newAnswers = { ...answers, [step.id]: textInput.trim() };
    setAnswers(newAnswers);
    setTimeout(() => {
      const newVisibleSteps = steps.filter(s => {
        if (!s.conditionalOn) return true;
        const { stepId, values } = s.conditionalOn;
        const answer = newAnswers[stepId];
        if (typeof answer === 'string') {
          return values.includes(answer);
        }
        return false;
      });
      if (currentStepIndex < newVisibleSteps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        onComplete(newAnswers);
      }
    }, 300);
  };

  const handleMultiSelect = (value: string) => {
    const newSelected = selectedOptions.includes(value)
      ? selectedOptions.filter((v: string) => v !== value)
      : [...selectedOptions, value];
    setSelectedOptions(newSelected);
  };

  const handleMultiSelectContinue = () => {
    const newAnswers = { ...answers, [step.id]: selectedOptions };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentStepIndex < visibleSteps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setSelectedOptions([]);
      } else {
        onComplete(newAnswers);
      }
    }, 300);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {visibleSteps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStepIndex + 1) / visibleSteps.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step?.id || currentStepIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <motion.h1
                className="text-2xl font-semibold mb-2 relative inline-block text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {step.question}
                {showTyping && (
                  <motion.span
                    className="inline-block w-0.5 h-7 bg-blue-500 ml-1 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </motion.h1>
              {step.subtitle && (
                <motion.p
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {step.subtitle}
                </motion.p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {step.type === 'text' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                    placeholder="Type your answer..."
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                    autoFocus
                  />
                  <button
                    disabled={!textInput.trim()}
                    onClick={handleTextSubmit}
                    className="w-full p-4 rounded-2xl transition-colors mt-4 flex items-center justify-center gap-2 font-medium"
                    style={{
                      backgroundColor: textInput.trim() ? '#3b82f6' : '#e5e7eb',
                      color: textInput.trim() ? '#ffffff' : '#9ca3af',
                      cursor: !textInput.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {step.type === 'choice' && step.options?.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleChoice(option.value)}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-left hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                  {option.icon && (
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      {option.icon}
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {option.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </motion.button>
              ))}

              {step.type === 'multi-select' && (
                <>
                  {step.options?.map((option, index) => {
                    const isSelected = selectedOptions.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleMultiSelect(option.value)}
                        className="w-full p-4 border-2 rounded-2xl text-left transition-all flex items-center gap-4"
                        style={{
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
                        }}
                      >
                        {option.icon && (
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: isSelected ? '#3b82f6' : '#f3f4f6',
                              color: isSelected ? '#ffffff' : '#4b5563',
                            }}
                          >
                            {option.icon}
                          </div>
                        )}
                        <div className="flex-1">
                          <span style={{ fontWeight: 500, color: '#111827' }}>{option.label}</span>
                          {option.description && (
                            <p style={{ fontSize: '0.875rem', marginTop: '0.125rem', color: '#6b7280' }}>{option.description}</p>
                          )}
                        </div>
                        <div
                          className="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: isSelected ? '#3b82f6' : '#ffffff',
                            borderColor: isSelected ? '#3b82f6' : '#d1d5db',
                          }}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4" style={{ color: '#ffffff' }} />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                  <button
                    disabled={selectedOptions.length === 0}
                    onClick={handleMultiSelectContinue}
                    className="w-full p-4 rounded-2xl transition-colors mt-6 flex items-center justify-center gap-2 font-medium"
                    style={{
                      backgroundColor: selectedOptions.length > 0 ? '#3b82f6' : '#e5e7eb',
                      color: selectedOptions.length > 0 ? '#ffffff' : '#9ca3af',
                      cursor: selectedOptions.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip Button */}
        {currentStepIndex < visibleSteps.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => onComplete(answers)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip onboarding
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
