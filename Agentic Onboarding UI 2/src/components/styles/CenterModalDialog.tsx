import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Check, Sparkles, CheckCircle2, Circle, Send } from 'lucide-react';

interface CenterModalDialogProps {
  onComplete: (answers: Record<number, string | string[]>) => void;
}

const surveySteps = [
  {
    id: 1,
    question: "Airbridge에 오신 것을 환영합니다!",
    subtitle: "먼저 귀사의 비즈니스 모델을 알려주세요",
    type: 'choice' as const,
    options: [
      { label: 'B2C 앱 서비스', value: 'b2c', desc: '일반 소비자 대상 모바일 앱', icon: '📱' },
      { label: 'B2B SaaS', value: 'b2b', desc: '기업 대상 솔루션', icon: '💼' },
      { label: '게임', value: 'game', desc: '모바일/웹 게임 서비스', icon: '🎮' },
      { label: '커머스', value: 'ecommerce', desc: '온라인 쇼핑몰', icon: '🛍️' },
    ]
  },
  {
    id: 2,
    question: "어떤 플랫폼을 사용하시나요?",
    subtitle: "운영 중인 플랫폼을 모두 선택해주세요",
    type: 'multi-select' as const,
    options: [
      { label: 'iOS App', value: 'ios', icon: '🍎' },
      { label: 'Android App', value: 'android', icon: '🤖' },
      { label: 'Web', value: 'web', icon: '🌐' },
      { label: 'Unity', value: 'unity', icon: '🎯' },
    ]
  },
  {
    id: 3,
    question: "주요 KPI는 무엇인가요?",
    subtitle: "가장 중요하게 추적하고 싶은 지표를 선택해주세요",
    type: 'choice' as const,
    options: [
      { label: 'Install & Registration', value: 'install', desc: '신규 유저 획득', icon: '📥' },
      { label: 'Purchase & Revenue', value: 'revenue', desc: '매출 및 전환', icon: '💰' },
      { label: 'Engagement & Retention', value: 'engagement', desc: '유저 참여도', icon: '❤️' },
      { label: 'LTV & ROAS', value: 'ltv', desc: '생애 가치 및 광고 ROI', icon: '📊' },
    ]
  },
];

const setupSteps = [
  {
    id: 1,
    title: 'SDK 설치 및 초기화',
    description: 'Airbridge SDK를 프로젝트에 추가하세요',
    completed: false,
  },
  {
    id: 2,
    title: '앱 정보 등록',
    description: '스토어 URL과 앱 아이콘을 등록하세요',
    completed: false,
  },
  {
    id: 3,
    title: '이벤트 설정',
    description: '추적할 커스텀 이벤트를 정의하세요',
    completed: false,
  },
  {
    id: 4,
    title: '테스트 & 검증',
    description: '테스트 이벤트를 발생시켜 확인하세요',
    completed: false,
  },
];

type Message = {
  id: string;
  type: 'bot' | 'user';
  content: string;
};

export function CenterModalDialog({ onComplete }: CenterModalDialogProps) {
  const [mode, setMode] = useState<'survey' | 'setup'>('survey');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [steps, setSteps] = useState(setupSteps);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const step = surveySteps[currentStep];
  const progress = mode === 'survey' 
    ? ((currentStep + 1) / surveySteps.length) * 100
    : (steps.filter(s => s.completed).length / steps.length) * 100;

  useEffect(() => {
    if (mode === 'setup' && messages.length === 0) {
      setTimeout(() => addBotMessage("🎉 설정이 거의 완료되었습니다!"), 500);
      setTimeout(() => addBotMessage("이제 4단계만 완료하면 Airbridge를 사용하실 수 있어요. 각 단계를 클릭해서 자세한 가이드를 확인하세요!"), 1500);
    }
  }, [mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChoice = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentStep < surveySteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setMode('setup');
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
      if (currentStep < surveySteps.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedOptions([]);
      } else {
        setMode('setup');
      }
    }, 300);
  };

  const addBotMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content,
      }]);
      setIsTyping(false);
    }, 600);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
    }]);
    
    const userInput = inputValue.toLowerCase();
    setInputValue('');

    setTimeout(() => {
      if (userInput.includes('sdk')) {
        addBotMessage("SDK 설치는 CocoaPods(iOS) 또는 Gradle(Android)을 통해 진행합니다. 자세한 가이드: https://help.airbridge.io/sdk");
      } else if (userInput.includes('앱 정보') || userInput.includes('등록')) {
        addBotMessage("대시보드 > 앱 설정에서 앱스토어/플레이스토어 URL과 앱 아이콘을 등록하시면 됩니다.");
      } else if (userInput.includes('이벤트')) {
        addBotMessage("이벤트는 'Sign Up', 'Purchase', 'View Product' 등 비즈니스에 중요한 액션을 트래킹합니다. SDK 메서드로 간단히 전송할 수 있어요.");
      } else if (userInput.includes('테스트')) {
        addBotMessage("개발 환경에서 이벤트를 발생시키면 대시보드의 '실시간 로그'에서 즉시 확인하실 수 있습니다!");
      } else {
        addBotMessage("무엇이든 물어보세요! 각 체크리스트 항목을 완료하면서 진행하시면 됩니다.");
      }
    }, 800);
  };

  const handleStepClick = (stepId: number) => {
    setSteps(prev =>
      prev.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header with Progress */}
        <div className="relative shrink-0">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Header Content */}
          <div className="p-8 pb-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: mode === 'survey' ? 360 : 0 }}
                  transition={{ duration: 2, repeat: mode === 'survey' ? Infinity : 0, ease: 'linear' }}
                  className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl">
                    {mode === 'survey' ? 'Airbridge Setup' : 'Setup Guide'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {mode === 'survey' 
                      ? `Step ${currentStep + 1} of ${surveySteps.length}`
                      : `${steps.filter(s => s.completed).length}/${steps.length} 완료`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => onComplete(answers)}
                className="hover:bg-white/60 p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Dots */}
            {mode === 'survey' && (
              <div className="flex items-center gap-2">
                {surveySteps.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep
                        ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500'
                        : idx < currentStep
                        ? 'w-2 bg-indigo-500'
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {mode === 'survey' ? (
          /* Survey Content */
          <div className="p-8 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {/* Question */}
                <div className="mb-8 text-center">
                  <h1 className="mb-2">{step.question}</h1>
                  <p className="text-gray-600">{step.subtitle}</p>
                </div>

                {/* Options */}
                <div className={`${step.type === 'choice' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}`}>
                  {step.type === 'choice' && step.options?.map((option, index) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChoice(option.value)}
                      className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 border-2 border-gray-200 hover:border-indigo-300 rounded-2xl text-left transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 text-6xl opacity-10 -mr-4 -mt-2">
                        {option.icon}
                      </div>
                      <div className="relative z-10">
                        <div className="text-3xl mb-3">{option.icon}</div>
                        <h3 className="mb-1 text-base">{option.label}</h3>
                        <p className="text-sm text-gray-500">{option.desc}</p>
                        <div className="mt-4 flex items-center gap-2 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs">Select</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </motion.button>
                  ))}

                  {step.type === 'multi-select' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {step.options?.map((option, index) => (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleMultiSelect(option.value)}
                            className={`p-5 border-2 rounded-2xl transition-all relative overflow-hidden ${
                              selectedOptions.includes(option.value)
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-lg'
                                : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <div className="absolute top-2 right-2">
                              <div
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                                  selectedOptions.includes(option.value)
                                    ? 'bg-white border-white'
                                    : 'border-gray-300'
                                }`}
                              >
                                {selectedOptions.includes(option.value) && (
                                  <Check className="w-4 h-4 text-indigo-600" />
                                )}
                              </div>
                            </div>
                            <div className="text-3xl mb-2">{option.icon}</div>
                            <div className="text-sm">{option.label}</div>
                          </motion.button>
                        ))}
                      </div>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        disabled={selectedOptions.length === 0}
                        onClick={handleMultiSelectContinue}
                        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-xl transition-all disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          /* Setup Mode */
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Checklist */}
            <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
              <h3 className="text-sm mb-4">셋업 체크리스트</h3>
              <div className="space-y-3">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStepClick(s.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      s.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {s.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm mb-1">{s.title}</div>
                        <div className="text-xs text-gray-600">{s.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Chat */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                          msg.type === 'user'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="p-6 border-t border-gray-200 shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="질문을 입력하세요..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-300"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:bg-gray-300"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {mode === 'survey' && (
          <div className="px-8 pb-8 text-center shrink-0">
            <button
              onClick={() => onComplete(answers)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip setup for now
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
