import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  RegisteredApp,
  Message,
  MessageContent,
  SetupState,
  DeeplinkState,
  AppInfo,
  PlatformInfo,
  OnboardingStep,
  createAppSteps,
  createDevAppSteps,
} from '../shared/types';

interface OnboardingContextType {
  // Apps state
  registeredApps: RegisteredApp[];
  currentAppId: string | null;
  isAddingApp: boolean;

  // Setup state
  setupState: SetupState;
  deeplinkState: DeeplinkState;

  // Messages for current context
  messages: Message[];

  // Actions
  setCurrentAppId: (appId: string | null) => void;
  setIsAddingApp: (isAdding: boolean) => void;
  addApp: (app: RegisteredApp) => void;
  updateApp: (appId: string, updates: Partial<RegisteredApp>) => void;
  updateAppStepStatus: (appId: string, stepId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  setSetupState: React.Dispatch<React.SetStateAction<SetupState>>;
  setDeeplinkState: React.Dispatch<React.SetStateAction<DeeplinkState>>;
  addMessage: (message: Message) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

  // Current app helper
  currentApp: RegisteredApp | undefined;

  // Reset
  resetSetup: () => void;
}

const initialSetupState: SetupState = {
  step: 'environment',
  selectedEnvironment: null,
  selectedPlatforms: [],
  appInfo: {
    appName: '',
    storeUrl: '',
    bundleId: '',
    packageName: '',
    webUrl: '',
    timezone: 'Asia/Seoul',
    currency: 'KRW',
  },
  currentPlatformIndex: 0,
  platformInfos: [],
};

const initialDeeplinkState: DeeplinkState = {
  currentPlatformIndex: 0,
  platforms: [],
  dashboardCompleted: { ios: false, android: false },
  sdkSetupCompleted: { ios: false, android: false },
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [registeredApps, setRegisteredApps] = useState<RegisteredApp[]>([]);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [isAddingApp, setIsAddingApp] = useState(true);
  const [setupState, setSetupState] = useState<SetupState>(initialSetupState);
  const [deeplinkState, setDeeplinkState] = useState<DeeplinkState>(initialDeeplinkState);
  const [messages, setMessages] = useState<Message[]>([]);

  const currentApp = registeredApps.find(app => app.id === currentAppId);

  const addApp = (app: RegisteredApp) => {
    setRegisteredApps(prev => [...prev, app]);
  };

  const updateApp = (appId: string, updates: Partial<RegisteredApp>) => {
    setRegisteredApps(prev =>
      prev.map(app => (app.id === appId ? { ...app, ...updates } : app))
    );
  };

  const updateAppStepStatus = (
    appId: string,
    stepId: string,
    status: 'pending' | 'in_progress' | 'completed'
  ) => {
    setRegisteredApps(prev =>
      prev.map(app => {
        if (app.id !== appId) return app;
        return {
          ...app,
          steps: app.steps.map(step =>
            step.id === stepId ? { ...step, status } : step
          ),
        };
      })
    );
  };

  const addMessage = (message: Message) => {
    if (currentAppId) {
      // Add to app-specific messages
      setRegisteredApps(prev =>
        prev.map(app => {
          if (app.id !== currentAppId) return app;
          return { ...app, messages: [...app.messages, message] };
        })
      );
    } else {
      // Add to global messages (new app registration)
      setMessages(prev => [...prev, message]);
    }
  };

  const resetSetup = () => {
    setSetupState(initialSetupState);
    setDeeplinkState(initialDeeplinkState);
    setMessages([]);
    setIsAddingApp(true);
    setCurrentAppId(null);
  };

  return (
    <OnboardingContext.Provider
      value={{
        registeredApps,
        currentAppId,
        isAddingApp,
        setupState,
        deeplinkState,
        messages,
        currentApp,
        setCurrentAppId,
        setIsAddingApp,
        addApp,
        updateApp,
        updateAppStepStatus,
        setSetupState,
        setDeeplinkState,
        addMessage,
        setMessages,
        resetSetup,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
