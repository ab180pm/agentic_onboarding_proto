import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ChatInterface } from './components/ChatInterface';

function LandingPageWrapper() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/survey');
  };

  return <LandingPage onLogin={handleLogin} />;
}

function SurveyWrapper() {
  const navigate = useNavigate();
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});

  const handleOnboardingComplete = (answers: Record<number, string | string[]>) => {
    setUserAnswers(answers);
    // Store answers in sessionStorage for use in setup
    sessionStorage.setItem('surveyAnswers', JSON.stringify(answers));
    navigate('/setup');
  };

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
}

function SetupWrapper() {
  const savedAnswers = sessionStorage.getItem('surveyAnswers');
  const userAnswers = savedAnswers ? JSON.parse(savedAnswers) : {};

  return <ChatInterface userAnswers={userAnswers} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/survey" element={<SurveyWrapper />} />
          <Route path="/setup" element={<SetupWrapper />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
