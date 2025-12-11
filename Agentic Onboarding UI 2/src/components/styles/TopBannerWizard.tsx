import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ChevronUp, Check, ArrowRight, Info } from 'lucide-react';

interface TopBannerWizardProps {
  onComplete: (answers: Record<number, string | string[]>) => void;
}

const steps = [
  {
    id: 1,
    question: "데이터 수집 목적을 선택하세요",
    type: 'choice' as const,
    options: [
      { label: '마케팅 성과 측정', value: 'marketing' },
      { label: '유저 행동 분석', value: 'analytics' },
      { label: '광고 사기 방지', value: 'fraud' },
      { label: '전체 기능 사용', value: 'all' },
    ]
  },
  {
    id: 2,
    question: "SDK를 설치할 준비가 되었나요?",
    type: 'choice' as const,
    options: [
      { label: '지금 바로 설치', value: 'now' },
      { label: '나중에 설치', value: 'later' },
      { label: '개발자와 상의 필요', value: 'discuss' },
    ]
  },
  {
    id: 3,
    question: "통합하고 싶은 플랫폼 선택",
    type: 'multi-select' as const,
    options: [
      { label: 'Google Analytics', value: 'ga' },
      { label: 'Amplitude', value: 'amplitude' },
      { label: 'Mixpanel', value: 'mixpanel' },
      { label: 'Adjust', value: 'adjust' },
      { label: 'AppsFlyer', value: 'appsflyer' },
    ]
  },
];

export function TopBannerWizard({ onComplete }: TopBannerWizardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

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
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 shadow-2xl"
    >
      {/* Collapsed Header */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
          >
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Info className="w-5 h-5" />
                <span className="text-sm">Complete your setup: Step {currentStep + 1} of {steps.length}</span>
                <div className="flex items-center gap-1">
                  {steps.map((s, idx) => (
                    <div
                      key={s.id}
                      className={`w-2 h-2 rounded-full ${
                        idx <= currentStep ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <span>Continue Setup</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onComplete(answers)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-white overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="h-1 bg-gray-100">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white">
                      {currentStep + 1}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Step {currentStep + 1} of {steps.length}</div>
                      <h3 className="text-sm">{step.question}</h3>
                    </div>
                  </div>

                  {/* Step Timeline */}
                  <div className="hidden lg:flex items-center gap-2">
                    {steps.map((s, idx) => (
                      <React.Fragment key={s.id}>
                        <div
                          className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                            idx === currentStep
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                              : idx < currentStep
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {idx < steps.length - 1 && (
                          <div className={`w-8 h-0.5 ${idx < currentStep ? 'bg-gray-300' : 'bg-gray-200'}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm text-gray-600"
                  >
                    <span className="hidden sm:inline">Minimize</span>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onComplete(answers)}
                    className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Options */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    {step.type === 'choice' && step.options?.map((option, index) => (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleChoice(option.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border border-gray-200 hover:border-orange-300 rounded-xl text-sm transition-all text-center group"
                      >
                        <span className="block">{option.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 mx-auto mt-1 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      </motion.button>
                    ))}

                    {step.type === 'multi-select' && (
                      <>
                        <div className="flex-1 flex items-center gap-2 flex-wrap">
                          {step.options?.map((option, index) => (
                            <motion.button
                              key={option.value}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleMultiSelect(option.value)}
                              className={`px-4 py-2 border rounded-lg text-sm transition-all flex items-center gap-2 ${
                                selectedOptions.includes(option.value)
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500'
                                  : 'bg-gray-50 hover:bg-orange-50 border-gray-200 hover:border-orange-300'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  selectedOptions.includes(option.value)
                                    ? 'bg-white border-white'
                                    : 'border-gray-300'
                                }`}
                              >
                                {selectedOptions.includes(option.value) && (
                                  <Check className="w-3 h-3 text-orange-500" />
                                )}
                              </div>
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                        <button
                          disabled={selectedOptions.length === 0}
                          onClick={handleMultiSelectContinue}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-sm flex items-center gap-2 whitespace-nowrap"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
