import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { TermsAgreement } from './components/TermsAgreement';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Layout } from './components/layout/Layout';
import { OnboardingManager } from './components/onboarding/OnboardingManager';
import { FloatingChat } from './components/chat/FloatingChat';
import { OnboardingProvider } from './components/context/OnboardingContext';
import { ChatProvider } from './components/context/ChatContext';

function LandingPageWrapper() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/terms');
  };

  return <LandingPage onLogin={handleLogin} />;
}

function TermsWrapper() {
  const navigate = useNavigate();

  return (
    <TermsAgreement
      onComplete={() => navigate('/survey')}
      onGoBack={() => navigate('/')}
    />
  );
}

function SurveyWrapper() {
  const navigate = useNavigate();

  const handleOnboardingComplete = (answers: Record<number, string | string[]>) => {
    // Store answers in sessionStorage for use in setup
    sessionStorage.setItem('surveyAnswers', JSON.stringify(answers));
    navigate('/setup');
  };

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
}

function SetupWrapper() {
  const savedAnswers = sessionStorage.getItem('surveyAnswers');
  const userAnswers = savedAnswers ? JSON.parse(savedAnswers) : {};

  return (
    <OnboardingProvider>
      <ChatProvider>
        <Layout currentPage="onboarding">
          <OnboardingManager userAnswers={userAnswers} />
        </Layout>
        <FloatingChat />
      </ChatProvider>
    </OnboardingProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/terms" element={<TermsWrapper />} />
          <Route path="/survey" element={<SurveyWrapper />} />
          <Route path="/setup" element={<SetupWrapper />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
