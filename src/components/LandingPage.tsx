import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Zap, Globe, Code, Palette, BarChart3, Target, LineChart, Shield, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

const mockAccounts = [
  {
    name: 'Airbridge Product Division',
    email: 'product@ab180.co',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=APD&backgroundColor=4f46e5',
  },
  {
    name: '이승현',
    email: 'soen234@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LSH&backgroundColor=ec4899',
  },
];

export function LandingPage({ onLogin }: LandingPageProps) {
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginSuggestion, setShowLoginSuggestion] = useState(true);

  const handleGoogleLogin = () => {
    setShowAccountPicker(true);
  };

  const handleAccountSelect = (email: string) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Attribution',
      description: '정확한 어트리뷰션으로 마케팅 성과를 측정하세요',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analytics',
      description: '실시간 데이터로 사용자 행동을 분석합니다',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Fraud Prevention',
      description: 'AI 기반 부정 트래픽 탐지 및 차단',
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: 'Deep Linking',
      description: '끊김없는 사용자 경험을 제공하세요',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'ROI Optimization',
      description: '광고 성과를 극대화하고 ROI를 향상시킵니다',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Login Suggestion Module */}
      <AnimatePresence>
        {showLoginSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-30 w-80"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowLoginSuggestion(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm mb-1">Airbridge에 오신 것을 환영합니다</div>
                    <p className="text-xs text-gray-600">
                      Google 계정으로 빠르게 시작하세요
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowLoginSuggestion(false);
                    handleGoogleLogin();
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm">Google로 계속하기</span>
                </button>

                <div className="mt-3 flex items-center justify-center gap-2">
                  {mockAccounts.slice(0, 2).map((account, index) => (
                    <img
                      key={index}
                      src={account.avatar}
                      alt={account.name}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    />
                  ))}
                  <span className="text-xs text-gray-500">
                    이미 2명의 팀원이 사용중
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  무료로 시작하고 언제든지 업그레이드하세요
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl">Airbridge</span>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="px-4 py-2 text-sm border-2 border-gray-300 rounded-full hover:border-black transition-colors"
          >
            회원 가입
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-6 text-5xl lg:text-6xl">
              모바일 성장을 위한 <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                통합 측정 솔루션
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              정확한 어트리뷰션과 실시간 분석으로
              <br />
              모바일 마케팅 성과를 극대화하세요.
            </p>

            {/* Google Sign In Button */}
            <div className="space-y-4 max-w-md">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoggingIn ? '로그인 중...' : 'Google 계정으로 로그인'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  가입이나 로그인을 하기 위해 계속 버튼을 클릭하면 Airbridge의{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    사용자약관
                  </a>
                  ,{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    개인정보 처리방침
                  </a>
                  ,{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    쿠키정책
                  </a>
                  에 동의하게 됩니다.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
              <div className="space-y-6">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Campaign Performance</div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +24.5%
                  </div>
                </div>
                
                {/* Chart Area */}
                <div className="h-32 flex items-end gap-2">
                  {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    />
                  ))}
                </div>
                
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                  {[
                    { label: 'Installs', value: '12.4K' },
                    { label: 'CTR', value: '3.2%' },
                    { label: 'ROI', value: '240%' },
                  ].map((metric, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs text-gray-600 mb-1">{metric.label}</div>
                      <div className="text-sm">{metric.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <motion.div
                className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨ Real-time
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24"
        >
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Account Picker Modal */}
      <AnimatePresence>
        {showAccountPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => !isLoggingIn && setShowAccountPicker(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm">Google 계정으로 Airbridge에 로그인</div>
                    </div>
                  </div>
                  <button
                    onClick={() => !isLoggingIn && setShowAccountPicker(false)}
                    disabled={isLoggingIn}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Account List */}
                <div className="p-4">
                  <div className="text-sm mb-3 text-gray-600">계정 선택</div>
                  <div className="space-y-2">
                    {mockAccounts.map((account, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        onClick={() => handleAccountSelect(account.email)}
                        disabled={isLoggingIn}
                        className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all flex items-center gap-4 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img
                          src={account.avatar}
                          alt={account.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="text-sm">{account.name}</div>
                          <div className="text-xs text-gray-600">{account.email}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAccountSelect('new@example.com')}
                    disabled={isLoggingIn}
                    className="w-full mt-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm text-blue-600">다른 계정 사용</div>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-600">
                    계속하려면 Google에서 귀하의 이름, 이메일 주소, 언어 환경설정, 프로필 사진을
                    Airbridge와(과) 공유합니다.
                  </p>
                </div>

                {isLoggingIn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/95 flex items-center justify-center backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <motion.div
                        className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <p className="text-sm text-gray-600">로그인 중...</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}