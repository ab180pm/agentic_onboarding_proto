import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Check, Sparkles, ChevronLeft } from 'lucide-react';

interface LeftSlidePanelProps {
  onComplete: (answers: Record<number, string | string[]>) => void;
}

const steps = [
  {
    id: 1,
    question: "앱 출시 단계를 알려주세요",
    subtitle: "현재 진행 상황을 선택해주세요",
    type: 'choice' as const,
    options: [
      { label: '개발 단계', value: 'dev', desc: '아직 개발 중입니다', gradient: 'from-blue-400 to-blue-600' },
      { label: '테스트 단계', value: 'test', desc: '내부 테스트를 진행 중입니다', gradient: 'from-cyan-400 to-cyan-600' },
      { label: '소프트 런칭', value: 'soft', desc: '일부 지역에 출시했습니다', gradient: 'from-teal-400 to-teal-600' },
      { label: '정식 출시', value: 'launch', desc: '이미 출시되어 운영 중입니다', gradient: 'from-green-400 to-green-600' },
    ]
  },
  {
    id: 2,
    question: "주요 관심사를 선택하세요",
    subtitle: "가장 궁금하거나 개선하고 싶은 부분",
    type: 'multi-select' as const,
    options: [
      { label: '마케팅 채널 최적화', value: 'channel', gradient: 'from-purple-400 to-purple-600' },
      { label: '유저 리텐션 개선', value: 'retention', gradient: 'from-pink-400 to-pink-600' },
      { label: '광고비 절감', value: 'cost', gradient: 'from-red-400 to-red-600' },
      { label: '전환율 향상', value: 'conversion', gradient: 'from-orange-400 to-orange-600' },
      { label: 'LTV 증대', value: 'ltv', gradient: 'from-amber-400 to-amber-600' },
    ]
  },
  {
    id: 3,
    question: "팀 구성을 알려주세요",
    subtitle: "협업하게 될 팀원 수를 선택해주세요",
    type: 'choice' as const,
    options: [
      { label: '혼자 사용', value: 'solo', desc: '개인 프로젝트', gradient: 'from-indigo-400 to-indigo-600' },
      { label: '2-5명', value: 'small', desc: '작은 팀', gradient: 'from-violet-400 to-violet-600' },
      { label: '6-15명', value: 'medium', desc: '중간 규모 팀', gradient: 'from-purple-400 to-purple-600' },
      { label: '16명 이상', value: 'large', desc: '큰 조직', gradient: 'from-fuchsia-400 to-fuchsia-600' },
    ]
  },
];

export function LeftSlidePanel({ onComplete }: LeftSlidePanelProps) {
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
    }, 400);
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

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedOptions([]);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onComplete(answers)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 via-teal-400 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className="p-8 pb-6 bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl mb-1">Airbridge 시작하기</h2>
                  <p className="text-sm text-gray-600">
                    몇 가지 질문으로 맞춤 설정을 완료하세요
                  </p>
                </div>
              </div>
              <button
                onClick={() => onComplete(answers)}
                className="hover:bg-white/60 p-2 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {steps.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex items-center"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        idx === currentStep
                          ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg scale-110'
                          : idx < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      {idx < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm">{idx + 1}</span>
                      )}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-12 h-1 mx-2 rounded-full ${
                        idx < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl text-sm text-gray-700">
                {progress.toFixed(0)}% 완료
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 text-green-700 rounded-full text-sm">
                  질문 {currentStep + 1} / {steps.length}
                </div>
                <h1 className="mb-2">{step.question}</h1>
                <p className="text-gray-600 text-lg">{step.subtitle}</p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {step.type === 'choice' && step.options?.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChoice(option.value)}
                    className="w-full group relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className={`relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 rounded-2xl transition-all`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 text-left">
                          <h3 className="mb-1">{option.label}</h3>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                        <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center ml-4 group-hover:scale-110 transition-transform shadow-lg`}>
                          <ArrowRight className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}

                {step.type === 'multi-select' && (
                  <>
                    {step.options?.map((option, index) => (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMultiSelect(option.value)}
                        className={`w-full p-5 border-2 rounded-2xl transition-all flex items-center gap-4 ${
                          selectedOptions.includes(option.value)
                            ? `bg-gradient-to-r ${option.gradient} text-white border-transparent shadow-xl`
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                            selectedOptions.includes(option.value)
                              ? 'bg-white border-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedOptions.includes(option.value) && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <span className="flex-1 text-left">{option.label}</span>
                      </motion.button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-8 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전</span>
              </button>
            )}
            
            {step.type === 'multi-select' && (
              <button
                disabled={selectedOptions.length === 0}
                onClick={handleMultiSelectContinue}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                <span>계속하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {step.type === 'choice' && currentStep === 0 && (
              <button
                onClick={() => onComplete(answers)}
                className="ml-auto text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                나중에 하기
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
