import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Check, Sparkles, Lightbulb, CheckCircle2, Circle, Send } from 'lucide-react';

interface RightSidebarAgentProps {
  onComplete: (answers: Record<number, string | string[]>) => void;
}

const surveySteps = [
  {
    id: 1,
    question: "앱의 주요 카테고리는?",
    type: 'choice' as const,
    options: [
      { label: '게임', value: 'game', emoji: '🎮' },
      { label: '커머스', value: 'commerce', emoji: '🛍️' },
      { label: '금융', value: 'finance', emoji: '💰' },
      { label: '생산성', value: 'productivity', emoji: '📊' },
      { label: '소셜', value: 'social', emoji: '💬' },
    ]
  },
  {
    id: 2,
    question: "팀 규모는 어떻게 되시나요?",
    type: 'choice' as const,
    options: [
      { label: '1-5명 (스타트업)', value: 'small', emoji: '👤' },
      { label: '6-20명 (성장 중)', value: 'medium', emoji: '👥' },
      { label: '21-50명', value: 'large', emoji: '👨‍👩‍👧‍👦' },
      { label: '50명 이상 (기업)', value: 'enterprise', emoji: '🏢' },
    ]
  },
  {
    id: 3,
    question: "관심있는 Airbridge 기능은?",
    type: 'multi-select' as const,
    options: [
      { label: 'Attribution', value: 'attribution', emoji: '🎯' },
      { label: 'Analytics', value: 'analytics', emoji: '📈' },
      { label: 'Fraud Prevention', value: 'fraud', emoji: '🛡️' },
      { label: 'Deep Linking', value: 'deeplink', emoji: '🔗' },
      { label: 'ROI Optimization', value: 'roi', emoji: '💎' },
    ]
  },
];

const setupSteps = [
  {
    id: 1,
    title: 'SDK 통합',
    description: 'iOS/Android SDK를 앱에 추가하세요',
    completed: false,
  },
  {
    id: 2,
    title: '딥링크 설정',
    description: 'Universal Links와 App Links를 구성하세요',
    completed: false,
  },
  {
    id: 3,
    title: '이벤트 트래킹',
    description: '주요 전환 이벤트를 설정하세요',
    completed: false,
  },
  {
    id: 4,
    title: '캠페인 연동',
    description: '광고 플랫폼을 연결하세요',
    completed: false,
  },
];

type Message = {
  id: string;
  type: 'bot' | 'user';
  content: string;
};

export function RightSidebarAgent({ onComplete }: RightSidebarAgentProps) {
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

  useEffect(() => {
    if (mode === 'setup' && messages.length === 0) {
      setTimeout(() => addBotMessage("안녕하세요! 👋 Airbridge 셋업 어시스턴트입니다."), 500);
      setTimeout(() => addBotMessage("4단계만 완료하면 바로 시작하실 수 있어요. 각 단계별로 도움이 필요하시면 언제든 물어보세요!"), 1500);
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
        addBotMessage("SDK 설치 가이드: https://help.airbridge.io/sdk 에서 상세한 문서를 확인하실 수 있습니다!");
      } else if (userInput.includes('딥링크') || userInput.includes('deeplink')) {
        addBotMessage("딥링크 설정은 iOS는 Associated Domains, Android는 App Links를 사용합니다. 단계별 가이드를 따라하시면 쉽게 설정할 수 있어요.");
      } else if (userInput.includes('이벤트')) {
        addBotMessage("Sign Up, Purchase, Add to Cart 같은 주요 전환 이벤트를 먼저 설정해보세요. 코드 한 줄이면 트래킹이 시작됩니다!");
      } else if (userInput.includes('캠페인')) {
        addBotMessage("Google Ads, Facebook Ads 등 주요 광고 플랫폼과 자동으로 연동됩니다. 대시보드에서 쉽게 설정할 수 있어요.");
      } else {
        addBotMessage("궁금하신 점을 말씀해주시면 도와드리겠습니다. 각 체크리스트 항목을 클릭해서 상세 가이드도 확인해보세요!");
      }
    }, 800);
  };

  const handleStepClick = (stepId: number) => {
    setSteps(prev =>
      prev.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
    );
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl flex flex-col z-50 border-l border-gray-200"
    >
      {/* Header */}
      <div className="shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base">Airbridge Assistant</h2>
              <p className="text-xs text-gray-500">
                {mode === 'survey' ? "Let's set up your account" : '셋업 가이드'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onComplete(answers)}
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'survey' && (
          <>
            {/* Step Indicators */}
            <div className="flex items-center gap-2">
              {surveySteps.map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    idx <= currentStep ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Step {currentStep + 1} of {surveySteps.length}</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {Math.round(((currentStep + 1) / surveySteps.length) * 100)}% Complete
              </span>
            </div>
          </>
        )}

        {mode === 'setup' && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">진행률</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {steps.filter(s => s.completed).length}/{steps.length} 완료
            </span>
          </div>
        )}
      </div>

      {mode === 'survey' ? (
        <>
          {/* Survey Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Question */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Question {currentStep + 1}
                  </div>
                  <h3 className="text-base">{step.question}</h3>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {step.type === 'choice' && step.options?.map((option, index) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChoice(option.value)}
                      className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 border border-gray-200 hover:border-purple-300 rounded-xl text-left transition-all flex items-center gap-3 group"
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="flex-1 text-sm">{option.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </motion.button>
                  ))}

                  {step.type === 'multi-select' && (
                    <>
                      {step.options?.map((option, index) => (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMultiSelect(option.value)}
                          className={`w-full p-4 border rounded-xl text-left transition-all flex items-center gap-3 ${
                            selectedOptions.includes(option.value)
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500'
                              : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                              selectedOptions.includes(option.value)
                                ? 'bg-white border-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedOptions.includes(option.value) && (
                              <Check className="w-4 h-4 text-purple-500" />
                            )}
                          </div>
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="flex-1 text-sm">{option.label}</span>
                        </motion.button>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="shrink-0 p-6 border-t border-gray-200 bg-gray-50">
            {step.type === 'multi-select' && (
              <button
                disabled={selectedOptions.length === 0}
                onClick={handleMultiSelectContinue}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-sm"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => onComplete(answers)}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip setup
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Setup Mode */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Checklist */}
            <div className="p-6 border-b border-gray-200 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-3">셋업 체크리스트</div>
              <div className="space-y-2">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStepClick(s.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all border ${
                      s.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {s.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm mb-0.5">{s.title}</div>
                        <div className="text-xs text-gray-600">{s.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                        msg.type === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-xl px-3 py-2">
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
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="질문을 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-300"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
