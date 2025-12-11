import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ChatInterface } from './components/ChatInterface';
import { OnboardingStyleSelector, OnboardingStyle } from './components/OnboardingStyleSelector';
import { AirbridgeBackground } from './components/AirbridgeBackground';
import { BottomRightPopup } from './components/styles/BottomRightPopup';
import { RightSidebarAgent } from './components/styles/RightSidebarAgent';
import { CenterModalDialog } from './components/styles/CenterModalDialog';
import { TopBannerWizard } from './components/styles/TopBannerWizard';
import { LeftSlidePanel } from './components/styles/LeftSlidePanel';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedStyle, setSelectedStyle] = useState<OnboardingStyle | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleOnboardingComplete = (answers: Record<number, string | string[]>) => {
    setUserAnswers(answers);
    setIsOnboardingComplete(true);
  };

  const handleStyleSelect = (style: OnboardingStyle) => {
    setSelectedStyle(style);
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} />;
  }

  if (!isOnboardingComplete) {
    // Show style selector first
    if (!selectedStyle) {
      return <OnboardingStyleSelector onSelect={handleStyleSelect} />;
    }

    // Show selected onboarding style with background
    return (
      <div className="relative min-h-screen">
        <AirbridgeBackground />
        
        {selectedStyle === 'bottom-right-popup' && (
          <BottomRightPopup onComplete={handleOnboardingComplete} />
        )}
        
        {selectedStyle === 'right-sidebar' && (
          <RightSidebarAgent onComplete={handleOnboardingComplete} />
        )}
        
        {selectedStyle === 'center-modal' && (
          <CenterModalDialog onComplete={handleOnboardingComplete} />
        )}
        
        {selectedStyle === 'top-banner' && (
          <TopBannerWizard onComplete={handleOnboardingComplete} />
        )}
        
        {selectedStyle === 'left-panel' && (
          <LeftSlidePanel onComplete={handleOnboardingComplete} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ChatInterface userAnswers={userAnswers} />
    </div>
  );
}