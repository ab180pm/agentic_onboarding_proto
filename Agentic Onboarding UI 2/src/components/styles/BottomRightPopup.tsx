import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minimize2, Send, ArrowRight, Check, Sparkles, CheckCircle2, Circle } from 'lucide-react';

interface BottomRightPopupProps {
  onComplete: (answers: Record<number, string | string[]>) => void;
}

const surveySteps = [
  {
    id: 1,
    question: "어떤 마케팅 목표를 가지고 계신가요?",
    type: 'choice' as const,
    options: [
      { label: '앱 설치 증대', value: 'install' },
      { label: '유저 참여 향상', value: 'engagement' },
      { label: 'ROI 최적화', value: 'roi' },
      { label: '리타겟팅', value: 'retargeting' },
    ]
  },
  {
    id: 2,
    question: "현재 사용 중인 마케팅 채널은?",
    type: 'multi-select' as const,
    options: [
      { label: 'Google Ads', value: 'google' },
      { label: 'Facebook Ads', value: 'facebook' },
      { label: 'Apple Search Ads', value: 'apple' },
      { label: 'TikTok Ads', value: 'tiktok' },
      { label: 'Twitter Ads', value: 'twitter' },
    ]
  },
  {
    id: 3,
    question: "월 마케팅 예산 규모는?",
    type: 'choice' as const,
    options: [
      { label: '$10K 미만', value: 'small' },
      { label: '$10K - $50K', value: 'medium' },
      { label: '$50K - $100K', value: 'large' },
      { label: '$100K 이상', value: 'xlarge' },
    ]
  },
];

const setupSteps = [
  {
    id: 1,
    title: 'SDK 설치',
    description: 'iOS/Android SDK를 앱에 통합하세요',
    completed: false,
  },
  {
    id: 2,
    title: '트래킹 링크 생성',
    description: '첫 번째 마케팅 캠페인 링크를 만드세요',
    completed: false,
  },
  {
    id: 3,
    title: '이벤트 설정',
    description: '추적할 주요 이벤트를 설정하세요',
    completed: false,
  },
  {
    id: 4,
    title: '대시보드 확인',
    description: '실시간 데이터를 확인하세요',
    completed: false,
  },
];

type Message = {
  id: string;
  type: 'bot' | 'user';
  content: string;
};

export function BottomRightPopup({ onComplete }: BottomRightPopupProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<'survey' | 'setup'>('survey');
  
  // Survey state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // Setup state
  const [steps, setSteps] = useState(setupSteps);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsExpanded(true), 500);
  }, []);

  useEffect(() => {
    if (mode === 'setup' && messages.length === 0) {
      setTimeout(() => addBotMessage("환영합니다! 🎉 Airbridge 셋업을 시작하겠습니다."), 500);
      setTimeout(() => addBotMessage("왼쪽 체크리스트의 4단계를 완료하면 바로 사용하실 수 있어요. 궁금한 점이 있으시면 언제든 물어보세요!"), 1500);
    }
  }, [mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const step = surveySteps[currentStep];

  const handleChoice = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentStep < surveySteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Survey complete, move to setup
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
      if (userInput.includes('sdk') || userInput.includes('설치')) {
        addBotMessage("SDK 설치는 간단합니다! iOS는 CocoaPods로, Android는 Gradle로 설치할 수 있어요. 문서를 확인해보세요: https://help.airbridge.io");
      } else if (userInput.includes('링크') || userInput.includes('트래킹')) {
        addBotMessage("트래킹 링크는 대시보드의 '링크 관리' 메뉴에서 생성할 수 있습니다. 캠페인별로 구분해서 만들어보세요!");
      } else if (userInput.includes('이벤트')) {
        addBotMessage("주요 이벤트로는 회원가입, 구매, 장바구니 추가 등이 있어요. 비즈니스 목표에 맞게 설정하시면 됩니다.");
      } else {
        addBotMessage("좋은 질문이에요! 각 단계를 클릭하면 자세한 가이드를 확인하실 수 있습니다.");
      }
    }, 800);
  };

  const handleStepClick = (stepId: number) => {
    setSteps(prev =>
      prev.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
    );
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 100 }}
      animate={{ 
        scale: isExpanded ? 1 : 0.95, 
        opacity: 1, 
        y: 0,
        width: isExpanded ? '420px' : '80px',
        height: isExpanded ? '600px' : '80px'
      }}
      className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-50"
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>{mode === 'survey' ? 'Airbridge Setup' : 'Airbridge 가이드'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onComplete(answers)}
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {mode === 'survey' ? (
        <>
          {/* Survey Progress */}
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {surveySteps.length}</span>
              <span>{Math.round(((currentStep + 1) / surveySteps.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / surveySteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Survey Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="mb-4 pr-4 text-sm">{step.question}</h3>

                <div className="space-y-2">
                  {step.type === 'choice' && step.options?.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChoice(option.value)}
                      className="w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left text-sm transition-all"
                    >
                      {option.label}
                    </motion.button>
                  ))}

                  {step.type === 'multi-select' && (
                    <>
                      {step.options?.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMultiSelect(option.value)}
                          className={`w-full p-3 border rounded-xl text-left text-sm transition-all flex items-center gap-3 ${
                            selectedOptions.includes(option.value)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-gray-50 hover:bg-blue-50 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                              selectedOptions.includes(option.value)
                                ? 'bg-white border-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedOptions.includes(option.value) && (
                              <Check className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                          {option.label}
                        </motion.button>
                      ))}
                      <button
                        disabled={selectedOptions.length === 0}
                        onClick={handleMultiSelectContinue}
                        className="w-full p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 text-sm"
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
        </>
      ) : (
        <>
          {/* Setup Mode */}
          <div className="flex-1 flex overflow-hidden">
            {/* Checklist Sidebar */}
            <div className="w-40 border-r border-gray-100 p-3 overflow-y-auto shrink-0">
              <div className="text-xs text-gray-500 mb-2">체크리스트</div>
              <div className="space-y-2">
                {steps.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handleStepClick(s.id)}
                    className={`w-full p-2 rounded-lg text-left text-xs transition-all ${
                      s.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {s.completed ? (
                        <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{s.title}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-1">진행률</div>
                <div className="text-xs">
                  {steps.filter(s => s.completed).length}/{steps.length}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                          msg.type === 'user'
                            ? 'bg-blue-500 text-white'
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
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-100 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="질문을 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-300"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-9 h-9 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors shrink-0 disabled:bg-gray-300"
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
