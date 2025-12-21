import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, CheckCircle2, Circle, Sparkles, Copy, Check, ExternalLink,
  Smartphone, Code, Tv, AlertCircle, ChevronRight, ChevronDown, ChevronUp, ChevronLeft, Loader2, Plus, Lightbulb,
  Maximize2, MessageCircle, X, Share2, MessageSquare, BookOpen, Key, HelpCircle, Link2
} from 'lucide-react';
import { AirbridgeBackground } from '../AirbridgeBackground';

// Common UI Styles
const INPUT_STYLES = {
  base: "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all",
  error: "w-full px-4 py-3 border border-red-500 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all",
  readonly: "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50 cursor-not-allowed",
  textarea: "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-mono",
  select: "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer",
};

const BUTTON_STYLES = {
  primary: "w-full py-3 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700",
  primaryDisabled: "w-full py-3 rounded-lg font-medium transition-colors bg-gray-100 text-gray-400 cursor-not-allowed",
  primaryWithIcon: "w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700",
  primaryWithIconMb: "w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3",
  secondary: "w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600",
  purple: "w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 mb-3",
};

// Common Card Styles
const CARD_STYLES = {
  base: "bg-white border border-gray-200 rounded-xl p-5 mt-4 min-w-[280px] max-w-full w-full",
  completed: "bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60 min-w-[280px] max-w-full w-full",
};

// Common Label Styles
const LABEL_STYLES = {
  title: "text-sm font-medium text-gray-700 mb-4",           // 카드 제목
  subtitle: "text-xs text-gray-500 mb-3",                    // 부제목/설명
  field: "block text-sm font-medium text-gray-700 mb-2",     // 입력 필드 레이블
  fieldDesc: "text-xs text-gray-500 mb-2",                   // 필드 설명
};

// View mode types
type ViewMode = 'fullscreen' | 'module' | 'minimized';

interface OnboardingManagerProps {
  userAnswers: Record<number, string | string[]>;
}

// App search result type
type AppSearchResult = {
  id: string;
  name: string;
  developer: string;
  icon: string;
  bundleId?: string;
  packageName?: string;
  store: 'ios' | 'android';
};

// Platform info for production registration
type PlatformInfo = {
  platform: 'ios' | 'android' | 'web';
  appName?: string;
  bundleId?: string;
  packageName?: string;
  webUrl?: string;
  storeUrl?: string;
};

// Message type definitions
type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'environment-select' }
  | { type: 'platform-multi-select' }
  | { type: 'app-name-input' }
  | { type: 'app-name-input-dev' }
  | { type: 'platform-registration'; platform: 'ios' | 'android' | 'web'; platformIndex: number; totalPlatforms: number }
  | { type: 'app-search-loading'; query: string; platform?: 'ios' | 'android' }
  | { type: 'app-search-results'; results: AppSearchResult[]; query: string; platform?: 'ios' | 'android' }
  | { type: 'timezone-currency-confirm'; timezone: string; currency: string }
  | { type: 'timezone-currency-input' }
  | { type: 'app-info-form' }
  | { type: 'dashboard-action'; appName: string; bundleId: string; packageName: string }
  | { type: 'framework-select' }
  | { type: 'code-block'; title: string; code: string; language: string }
  | { type: 'sdk-init-code'; appName: string; appToken: string }
  | { type: 'deeplink-choice' }
  // Deep Link Setup (multi-step flow)
  | { type: 'deeplink-platform-info'; platforms: string[] }
  | { type: 'deeplink-ios-input'; bundleId?: string }
  | { type: 'deeplink-android-input'; packageName?: string }
  | { type: 'deeplink-dashboard-guide'; platform: 'ios' | 'android'; data: DeeplinkDashboardData }
  | { type: 'deeplink-sdk-setup'; platform: 'ios' | 'android'; framework: string; appName: string }
  | { type: 'deeplink-test-guide'; platforms: string[]; appName: string }
  | { type: 'deeplink-test-checklist' }
  | { type: 'deeplink-test-scenarios'; appName: string }
  | { type: 'deeplink-complete' }
  | { type: 'sdk-verify' }
  | { type: 'channel-select' }
  | { type: 'channel-integration-overview'; selectedChannels: string[] }
  | { type: 'channel-progress'; channel: string; steps: ChannelStep[]; hasIOS: boolean }
  | { type: 'meta-channel-integration' }
  | { type: 'meta-cost-integration' }
  | { type: 'meta-skan-integration' }
  | { type: 'google-channel-integration' }
  | { type: 'google-cost-integration' }
  | { type: 'google-skan-integration' }
  | { type: 'apple-version-check' }
  | { type: 'apple-channel-integration' }
  | { type: 'apple-cost-integration' }
  | { type: 'tiktok-channel-integration' }
  | { type: 'tiktok-cost-integration' }
  | { type: 'tiktok-skan-integration' }
  | { type: 'channel-completion'; channel: string }
  | { type: 'standard-event-select' }
  | { type: 'custom-event-input' }
  | { type: 'event-verify' }
  | { type: 'event-taxonomy-summary'; events: EventConfig[] }
  | { type: 'completion-summary'; data: CompletionData }
  | { type: 'single-select'; options: { label: string; value: string; description?: string }[] }
  | { type: 'confirm-select'; options: { label: string; value: string }[] }
  | { type: 'token-display'; tokens: { appSdkToken: string; webSdkToken: string; apiToken: string } }
  | { type: 'dev-completion-summary'; appName: string }
  | { type: 'sdk-install-choice' }
  | { type: 'sdk-guide-share'; appName: string; platforms: string[]; framework?: string }
  // GitHub Automation types
  | { type: 'sdk-install-method-select' }
  | { type: 'github-connect' }
  | { type: 'github-repo-select'; repos: GitHubRepo[] }
  | { type: 'github-permissions' }
  | { type: 'github-pr-confirm'; step: 'sdk-install' | 'sdk-init' | 'deeplink' | 'event-tracking' }
  | { type: 'github-pr-waiting'; prUrl?: string; step: string }
  | { type: 'github-pr-complete'; prUrl: string; prNumber: number; step: string }
  | { type: 'github-pr-review'; prUrl: string; prNumber: number; step: string }
  // Web SDK Installation (multi-step flow)
  | { type: 'web-sdk-method-select'; appName: string; webToken: string }
  | { type: 'web-sdk-install-code'; method: 'script' | 'package'; appName: string; webToken: string }
  | { type: 'web-sdk-init-options'; appName: string; webToken: string }
  | { type: 'web-sdk-user-identity' }
  // Legacy Web SDK Install (kept for backwards compatibility)
  | { type: 'web-sdk-install'; appName: string; webToken: string }
  // SDK Intent Selection (after app registration)
  | { type: 'sdk-intent-select'; platforms: string[]; framework: string }
  // iOS SDK Installation (Native only)
  | { type: 'ios-sdk-install' }
  | { type: 'ios-sdk-init'; appName: string; appToken: string }
  | { type: 'ios-deeplink-setup'; appName: string; bundleId?: string }
  // Android SDK Installation (Native only)
  | { type: 'android-sdk-install' }
  | { type: 'android-sdk-init'; appName: string; appToken: string }
  | { type: 'android-deeplink-setup'; appName: string; packageName?: string }
  // SDK Test & Verification types
  | { type: 'sdk-test' }
  | { type: 'sdk-test-result'; passed: boolean; details: { install: boolean; init: boolean; events: boolean } }
  // SDK Install Flow Confirmations (Guide-aligned)
  | { type: 'sdk-install-confirm' }
  | { type: 'sdk-init-confirm' }
  | { type: 'deeplink-setup-choice' }
  | { type: 'sdk-verification' }
  // Tracking Link types
  | { type: 'tracking-link-create'; channel: string }
  | { type: 'tracking-link-form'; channel: string }
  | { type: 'tracking-link-complete'; links: TrackingLink[] }
  // Verification types
  | { type: 'deeplink-test' }
  | { type: 'deeplink-test-result'; scenarios: DeeplinkTestScenario[] }
  | { type: 'attribution-test' }
  | { type: 'attribution-test-result'; passed: boolean }
  | { type: 'data-verify' }
  | { type: 'data-verify-result'; metrics: DataVerifyMetrics }
  | { type: 'onboarding-complete' }
  | { type: 'category-navigation' };

type Message = {
  id: string;
  role: 'bot' | 'user';
  content: MessageContent[];
  timestamp: Date;
};

type ChatRoom = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

type OnboardingStep = {
  id: string;
  phase: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  category: 'sdk' | 'web-sdk' | 'ios-sdk' | 'android-sdk' | 'deeplink' | 'integration' | 'event-taxonomy';
};

// SDK Intent Types - used after app registration to determine SDK flow
type SdkIntent = {
  webTracking?: boolean;
  installTracking?: boolean;
  deepLinkNeeded?: boolean;
  attImplemented?: boolean;  // iOS only
};

type CompletionData = {
  appName: string;
  platforms: string[];
  framework: string;
  channels: string[];
};

// Channel Integration Types
type ChannelStep = {
  id: 'channel' | 'cost' | 'skan';
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  required: boolean;
};

type ChannelIntegrationState = {
  channel: string;
  steps: ChannelStep[];
  currentStep: 'channel' | 'cost' | 'skan';
};

// Event Taxonomy Types
type StandardEvent = {
  id: string;
  name: string;
  description: string;
  category: 'lifecycle' | 'engagement' | 'ecommerce';
  isAutomatic?: boolean;
};

type EventConfig = {
  eventId: string;
  eventName: string;
  isStandard: boolean;
  properties: EventProperty[];
};

type EventProperty = {
  name: string;
  type: 'string' | 'number' | 'boolean';
  isSemantic: boolean;
};

// GitHub Automation Types
type GitHubRepo = {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
};

type GitHubAutomationState = {
  isConnected: boolean;
  selectedRepo?: GitHubRepo;
  currentStep: 'sdk-install' | 'sdk-init' | 'deeplink' | 'event-tracking' | null;
  pendingPR?: {
    url: string;
    number: number;
    step: string;
  };
};

// Tracking Link Types
type TrackingLink = {
  id: string;
  name: string;
  channel: string;
  url: string;
  shortUrl: string;
  createdAt: Date;
};

// Deeplink Test Types
type DeeplinkTestScenario = {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
};

// Deeplink Dashboard Data Types
type DeeplinkDashboardData = {
  uriScheme: string;
  // iOS specific
  appId?: string;
  // Android specific
  packageName?: string;
  sha256Fingerprints?: string[];
};

// Data Verification Types
type DataVerifyMetrics = {
  eventsReceived: number;
  lastEventTime: Date | null;
  attributionVerified: boolean;
  deeplinkVerified: boolean;
};

type AppInfo = {
  appName: string;
  storeUrl: string;
  bundleId: string;
  packageName: string;
  webUrl?: string;
  timezone?: string;
  currency?: string;
};

// Registered app with its own setup progress
type AppTokens = {
  appSdkToken: string;
  webSdkToken: string;
  apiToken: string;
};

type RegisteredApp = {
  id: string;
  appInfo: AppInfo;
  platforms: string[];
  environment: 'dev' | 'production';
  steps: OnboardingStep[];
  currentPhase: number;
  framework: string;
  channels: string[];
  isExpanded: boolean;
  messages: Message[]; // App-specific chat history
  tokens: AppTokens; // Store generated tokens for SDK setup
};

// Check if framework is cross-platform (React Native, Flutter, Expo, Unity)
const isCrossPlatformFramework = (framework: string): boolean => {
  const crossPlatformFrameworks = ['react-native', 'flutter', 'expo', 'unity'];
  return crossPlatformFrameworks.includes(framework.toLowerCase());
};

// Production mode steps - full onboarding flow
const createAppSteps = (platforms: string[] = [], framework: string = ''): OnboardingStep[] => {
  const steps: OnboardingStep[] = [];
  const isNative = !isCrossPlatformFramework(framework);
  const hasIos = platforms.includes('ios');
  const hasAndroid = platforms.includes('android');
  const hasWeb = platforms.includes('web');

  // Web SDK steps (always separate)
  if (hasWeb) {
    steps.push(
      { id: 'web-sdk-install', phase: 2, title: 'Web SDK 설치', description: 'Install Web SDK', status: 'pending', category: 'web-sdk' },
      { id: 'web-sdk-init', phase: 2, title: 'Web SDK 초기화', description: 'Initialize Web SDK', status: 'pending', category: 'web-sdk' },
    );
  }

  if (isNative) {
    // Native frameworks: separate iOS and Android SDK flows with integrated deeplink
    if (hasIos) {
      steps.push(
        { id: 'ios-sdk-install', phase: 2, title: 'iOS SDK 설치', description: 'Install iOS SDK (CocoaPods/SPM)', status: 'pending', category: 'ios-sdk' },
        { id: 'ios-sdk-init', phase: 2, title: 'iOS SDK 초기화', description: 'Initialize iOS SDK', status: 'pending', category: 'ios-sdk' },
        { id: 'ios-deeplink-setup', phase: 2, title: 'iOS 딥링크 설정', description: 'Configure iOS deep links', status: 'pending', category: 'ios-sdk' },
      );
    }
    if (hasAndroid) {
      steps.push(
        { id: 'android-sdk-install', phase: 2, title: 'Android SDK 설치', description: 'Install Android SDK (Gradle)', status: 'pending', category: 'android-sdk' },
        { id: 'android-sdk-init', phase: 2, title: 'Android SDK 초기화', description: 'Initialize Android SDK', status: 'pending', category: 'android-sdk' },
        { id: 'android-deeplink-setup', phase: 2, title: 'Android 딥링크 설정', description: 'Configure Android deep links', status: 'pending', category: 'android-sdk' },
      );
    }
  } else {
    // Cross-platform frameworks: unified SDK flow
    if (hasIos || hasAndroid) {
      steps.push(
        { id: 'sdk-install', phase: 2, title: 'SDK 설치', description: 'Install SDK packages', status: 'pending', category: 'sdk' },
        { id: 'sdk-init', phase: 2, title: 'SDK 초기화', description: 'Add SDK code to your app', status: 'pending', category: 'sdk' },
        { id: 'deeplink', phase: 2, title: '딥링크 설정', description: 'Configure deep links', status: 'pending', category: 'deeplink' },
      );
    }
  }

  // SDK Test (common for all)
  if (hasIos || hasAndroid || hasWeb) {
    steps.push({ id: 'sdk-test', phase: 2, title: 'SDK 테스트', description: 'Test SDK integration', status: 'pending', category: 'sdk' });
  }

  // Tracking Link and Deep Link Test
  if (hasIos || hasAndroid) {
    steps.push(
      { id: 'tracking-link', phase: 4, title: '트래킹 링크', description: 'Create tracking links', status: 'pending', category: 'deeplink' },
      { id: 'deeplink-test', phase: 5, title: '딥링크 테스트', description: 'Test deep link functionality', status: 'pending', category: 'deeplink' },
    );
  }

  // Event Taxonomy category
  steps.push({ id: 'event-taxonomy', phase: 3, title: '이벤트 설계', description: 'Define events to track', status: 'pending', category: 'event-taxonomy' });

  // Integration category
  steps.push(
    { id: 'channel-select', phase: 4, title: '채널 선택', description: 'Select ad platforms', status: 'pending', category: 'integration' },
    { id: 'channel-integration', phase: 4, title: '채널 연동', description: 'Connect to ad platforms', status: 'pending', category: 'integration' },
    { id: 'cost-integration', phase: 4, title: '비용 연동', description: 'Enable cost data import', status: 'pending', category: 'integration' },
  );

  if (hasIos) {
    steps.push({ id: 'skan-integration', phase: 4, title: 'SKAN 연동', description: 'iOS attribution setup', status: 'pending', category: 'integration' });
  }

  steps.push(
    { id: 'attribution-test', phase: 5, title: '어트리뷰션 테스트', description: 'Verify attribution setup', status: 'pending', category: 'integration' },
    { id: 'data-verify', phase: 5, title: '데이터 검증', description: 'Confirm data collection', status: 'pending', category: 'integration' },
  );

  return steps;
};

// Dev mode steps - simplified flow (SDK setup only)
const createDevAppSteps = (platforms: string[] = [], framework: string = ''): OnboardingStep[] => {
  const steps: OnboardingStep[] = [];
  const isNative = !isCrossPlatformFramework(framework);
  const hasIos = platforms.includes('ios');
  const hasAndroid = platforms.includes('android');
  const hasWeb = platforms.includes('web');

  // Web SDK steps (always separate)
  if (hasWeb) {
    steps.push(
      { id: 'web-sdk-install', phase: 2, title: 'Web SDK 설치', description: 'Install Web SDK', status: 'pending', category: 'web-sdk' },
      { id: 'web-sdk-init', phase: 2, title: 'Web SDK 초기화', description: 'Initialize Web SDK', status: 'pending', category: 'web-sdk' },
    );
  }

  if (isNative) {
    // Native frameworks: separate iOS and Android SDK flows with integrated deeplink
    if (hasIos) {
      steps.push(
        { id: 'ios-sdk-install', phase: 2, title: 'iOS SDK 설치', description: 'Install iOS SDK', status: 'pending', category: 'ios-sdk' },
        { id: 'ios-sdk-init', phase: 2, title: 'iOS SDK 초기화', description: 'Initialize iOS SDK', status: 'pending', category: 'ios-sdk' },
        { id: 'ios-deeplink-setup', phase: 2, title: 'iOS 딥링크 설정', description: 'Configure iOS deep links', status: 'pending', category: 'ios-sdk' },
      );
    }
    if (hasAndroid) {
      steps.push(
        { id: 'android-sdk-install', phase: 2, title: 'Android SDK 설치', description: 'Install Android SDK', status: 'pending', category: 'android-sdk' },
        { id: 'android-sdk-init', phase: 2, title: 'Android SDK 초기화', description: 'Initialize Android SDK', status: 'pending', category: 'android-sdk' },
        { id: 'android-deeplink-setup', phase: 2, title: 'Android 딥링크 설정', description: 'Configure Android deep links', status: 'pending', category: 'android-sdk' },
      );
    }
  } else {
    // Cross-platform frameworks: unified SDK flow
    if (hasIos || hasAndroid) {
      steps.push(
        { id: 'sdk-install', phase: 2, title: 'SDK 설치', description: 'Install SDK packages', status: 'pending', category: 'sdk' },
        { id: 'sdk-init', phase: 2, title: 'SDK 초기화', description: 'Add SDK code to your app', status: 'pending', category: 'sdk' },
        { id: 'deeplink', phase: 2, title: '딥링크 설정', description: 'Configure deep links', status: 'pending', category: 'deeplink' },
      );
    }
  }

  // SDK Test (common for all)
  if (hasIos || hasAndroid || hasWeb) {
    steps.push({ id: 'sdk-test', phase: 2, title: 'SDK 테스트', description: 'Test SDK integration', status: 'pending', category: 'sdk' });
  }

  return steps;
};

// GitHub Icon Component
function GitHubIcon({ className, fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

// Web SDK Method Select Component (Step 1)
function WebSdkMethodSelect({ onSelect, isCompleted = false }: {
  onSelect: (method: 'script' | 'package') => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Installation method selected</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      <div className={LABEL_STYLES.title}>How would you like to install the SDK?</div>
      <div className="space-y-2">
        <button
          onClick={() => onSelect('script')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-100">
            <Code className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Script Tag (Direct HTML)</div>
            <div className="text-sm text-gray-500">Quick and easy - Recommended for standard websites</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => onSelect('package')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
            <Tv className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Package Manager (npm/yarn/pnpm)</div>
            <div className="text-sm text-gray-500">Recommended for React, Vue, and other build-based projects</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

// Web SDK Install Code Component (Step 2-3)
function WebSdkInstallCode({ method, appName, webToken, onComplete, isCompleted = false }: {
  method: 'script' | 'package';
  appName: string;
  webToken: string;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [packageManager, setPackageManager] = useState<'npm' | 'yarn' | 'pnpm'>('npm');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const browserCode = `<script>
(function(a_,i_,r_,_b,_r,_i,_d,_g,_e){if(!a_[_b]){var n=function(){var c=i_.createElement(r_);c.onerror=function(){h.queue.filter(function(a){return 0<=_d.indexOf(a[0])}).forEach(function(a){a=a[1];a=a[a.length-1];"function"===typeof a&&a("error occur when load airbridge")})};c.async=1;c.src=_r;"complete"===i_.readyState?i_.head.appendChild(c):a_.addEventListener("load",function k(){a_.removeEventListener("load",k);i_.head.appendChild(c)})},h={queue:[],get isSDKEnabled(){return!1}};_i.concat(_d).forEach(function(c){var a=c.split("."),k=a.pop();a.reduce(function(p,q){return p[q]=p[q]||{}},h)[k]=function(){h.queue.push([c,arguments])}});a_[_b]=h;"undefined"!==typeof i_.documentMode&&(_r=_r.replace(/^https:/,""));0<_g?(_b=new (a_.XDomainRequest||a_.XMLHttpRequest),_i=function(){},_b.open("GET",_r),_b.timeout=_g,_b.onload=function(){n()},_b.onerror=_i,_b.onprogress=_i,_b.ontimeout=_i,_b.send()):n()}})(window,document,"script","airbridge","https://static.airbridge.io/sdk/latest/airbridge.min.js","init startTracking stopTracking openBanner setBanner setDownload setDownloads openDeeplink setDeeplinks sendWeb setUserAgent setMobileAppData setUserID clearUserID setUserEmail clearUserEmail setUserPhone clearUserPhone setUserAttribute removeUserAttribute clearUserAttributes setUserAlias removeUserAlias clearUserAlias clearUser setUserId setUserAttributes addUserAlias setDeviceAlias removeDeviceAlias clearDeviceAlias setDeviceIFV setDeviceIFA setDeviceGAID events.send events.signIn events.signUp events.signOut events.purchased events.addedToCart events.productDetailsViewEvent events.homeViewEvent events.productListViewEvent events.searchResultViewEvent".split(" "),["events.wait","fetchResource","createTouchpoint","createTrackingLink"],0);

airbridge.init({
    app: '${appName}',
    webToken: '${webToken}',
})
</script>`;

  const packageInstallCommands = {
    npm: 'npm install airbridge-web-sdk-loader',
    yarn: 'yarn add airbridge-web-sdk-loader',
    pnpm: 'pnpm i airbridge-web-sdk-loader',
  };

  const packageUsageCode = `import airbridge from 'airbridge-web-sdk-loader'

airbridge.init({
    app: '${appName}',
    webToken: '${webToken}',
})`;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">SDK installation code applied</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      {/* Auth Info */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className={LABEL_STYLES.fieldDesc}>Authentication Info (Auto-configured)</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400">App Name</div>
            <div className="text-sm font-mono text-gray-900">{appName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Web Token</div>
            <div className="text-sm font-mono text-gray-900 truncate">{webToken}</div>
          </div>
        </div>
      </div>

      {method === 'script' ? (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Add this script to the HTML <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> section:
          </div>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-48">
              <code>{browserCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(browserCode, 'browser')}
              className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {copiedCode === 'browser' ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Package Manager Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['npm', 'yarn', 'pnpm'] as const).map((pm) => (
              <button
                key={pm}
                onClick={() => setPackageManager(pm)}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                  packageManager === pm
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {pm}
              </button>
            ))}
          </div>

          {/* Install Command */}
          <div>
            <div className="text-sm text-gray-600 mb-2">1. Install package:</div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm">
                <code>{packageInstallCommands[packageManager]}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(packageInstallCommands[packageManager], 'install')}
                className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                {copiedCode === 'install' ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Usage Code */}
          <div>
            <div className="text-sm text-gray-600 mb-2">2. Initialize SDK:</div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                <code>{packageUsageCode}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(packageUsageCode, 'usage')}
                className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                {copiedCode === 'usage' ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onComplete}
        className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        Installation Code Applied
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Web SDK Init Options Component (Step 4)
function WebSdkInitOptions({ appName, webToken, onComplete, onSkip, isCompleted = false }: {
  appName: string;
  webToken: string;
  onComplete: (options: Record<string, boolean | number | string>) => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [options, setOptions] = useState({
    autoStartTrackingEnabled: true,
    utmParsing: false,
    userHash: true,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const generateInitCode = () => {
    const optionEntries = Object.entries(options)
      .filter(([_, value]) => value !== false)
      .map(([key, value]) => `    ${key}: ${typeof value === 'string' ? `'${value}'` : value},`)
      .join('\n');

    return `airbridge.init({
    app: '${appName}',
    webToken: '${webToken}',
${optionEntries}
})`;
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Initialization options configured</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      <div className="text-sm font-medium text-gray-700 mb-1">Additional Initialization Options</div>
      <div className="text-xs text-gray-500 mb-4">Configure options as needed. Default values are recommended.</div>

      {/* Basic Options */}
      <div className="space-y-3 mb-4">
        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <div>
            <div className="text-sm font-medium text-gray-900">Auto Tracking</div>
            <div className="text-xs text-gray-500">Automatically collect pageviews</div>
          </div>
          <input
            type="checkbox"
            checked={options.autoStartTrackingEnabled}
            onChange={(e) => setOptions({ ...options, autoStartTrackingEnabled: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <div>
            <div className="text-sm font-medium text-gray-900">UTM Parsing</div>
            <div className="text-xs text-gray-500">Auto-extract UTM parameters from URL</div>
          </div>
          <input
            type="checkbox"
            checked={options.utmParsing}
            onChange={(e) => setOptions({ ...options, utmParsing: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <div>
            <div className="text-sm font-medium text-gray-900">User Data Hashing</div>
            <div className="text-xs text-gray-500">SHA-256 hash email and phone number</div>
          </div>
          <input
            type="checkbox"
            checked={options.userHash}
            onChange={(e) => setOptions({ ...options, userHash: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        View Advanced Options
      </button>

      {showAdvanced && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 text-left">
                <th className="pb-2">Option</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr><td className="py-1 font-mono">cookieWindow</td><td>number</td><td>Cookie expiration (days)</td></tr>
              <tr><td className="py-1 font-mono">cookieWindowInMinutes</td><td>number</td><td>Cookie expiration (minutes)</td></tr>
              <tr><td className="py-1 font-mono">shareCookieSubdomain</td><td>boolean</td><td>Share cookie across subdomains</td></tr>
              <tr><td className="py-1 font-mono">defaultChannel</td><td>string</td><td>Default channel name</td></tr>
              <tr><td className="py-1 font-mono">collectMolocoCookieID</td><td>boolean</td><td>Collect Moloco cookie ID</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Generated Code Preview */}
      <div className="mb-4">
        <div className={LABEL_STYLES.fieldDesc}>Generated initialization code:</div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
            <code>{generateInitCode()}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(generateInitCode())}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSkip}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Use Default
        </button>
        <button
          onClick={() => onComplete(options)}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Apply Options
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Web SDK User Identity Component (Step 5)
function WebSdkUserIdentity({ onComplete, onSkip, isCompleted = false }: {
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const loginCode = `// Set user identity on login
airbridge.setUserID('user_12345');
airbridge.setUserEmail('user@example.com');
airbridge.setUserPhone('821012341234');
airbridge.setUserAttribute('membership', 'gold');`;

  const logoutCode = `// Clear user info on logout
airbridge.clearUser();`;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">User identity setup complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      <div className="text-sm font-medium text-gray-700 mb-1">Would you like to track logged-in users?</div>
      <div className="text-xs text-gray-500 mb-4">Set up user identity if your app has login functionality.</div>

      {/* Available Methods */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className={LABEL_STYLES.fieldDesc}>Available methods:</div>
        <table className="w-full text-xs">
          <tbody className="text-gray-700">
            <tr><td className="py-1 font-mono text-blue-600">setUserID(id)</td><td>Set user ID</td></tr>
            <tr><td className="py-1 font-mono text-blue-600">setUserEmail(email)</td><td>Set email</td></tr>
            <tr><td className="py-1 font-mono text-blue-600">setUserPhone(phone)</td><td>Set phone number</td></tr>
            <tr><td className="py-1 font-mono text-blue-600">setUserAttribute(key, value)</td><td>Set custom attribute</td></tr>
            <tr><td className="py-1 font-mono text-blue-600">setUserAlias(key, value)</td><td>Set user alias</td></tr>
          </tbody>
        </table>
      </div>

      {/* Login Code */}
      <div className="mb-3">
        <div className={LABEL_STYLES.fieldDesc}>Login code example:</div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
            <code>{loginCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(loginCode, 'login')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'login' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Logout Code */}
      <div className="mb-4">
        <div className={LABEL_STYLES.fieldDesc}>Logout code example:</div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
            <code>{logoutCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(logoutCode, 'logout')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'logout' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSkip}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          No Login Feature
        </button>
        <button
          onClick={onComplete}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Setup Complete
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Legacy Web SDK Install Component (keeping for backwards compatibility)
function WebSdkInstall({ appName, webToken, onComplete, isCompleted = false }: {
  appName: string;
  webToken: string;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Web SDK Installation Complete</span>
        </div>
      </div>
    );
  }

  return (
    <WebSdkMethodSelect onSelect={() => onComplete()} isCompleted={false} />
  );
}

// ===== iOS SDK Components (Native Only) =====

// iOS SDK Install Component
function IosSdkInstall({ onComplete, isCompleted = false }: {
  onComplete: (method: 'cocoapods' | 'spm') => void;
  isCompleted?: boolean;
}) {
  const [method, setMethod] = useState<'cocoapods' | 'spm' | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const cocoapodsCode = `# Podfile
pod 'AirBridge'`;

  const spmUrl = 'https://github.com/AirBridge/AirBridge-iOS-SDK';

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">iOS SDK 설치 완료</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      <div className={LABEL_STYLES.title}>iOS SDK 설치 방법을 선택하세요</div>

      <div className="space-y-3">
        {/* CocoaPods Option */}
        <button
          onClick={() => setMethod('cocoapods')}
          className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
            method === 'cocoapods'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100">
            <Code className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">CocoaPods</div>
            <div className="text-sm text-gray-500">가장 많이 사용되는 방법 (권장)</div>
          </div>
          {method === 'cocoapods' && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
        </button>

        {/* SPM Option */}
        <button
          onClick={() => setMethod('spm')}
          className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
            method === 'spm'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
            <Smartphone className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Swift Package Manager</div>
            <div className="text-sm text-gray-500">Xcode 내장 패키지 관리자</div>
          </div>
          {method === 'spm' && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
        </button>
      </div>

      {/* Show installation code based on selection */}
      {method === 'cocoapods' && (
        <div className="mt-4">
          <div className={LABEL_STYLES.fieldDesc}>Podfile에 추가:</div>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
              <code>{cocoapodsCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(cocoapodsCode, 'cocoapods')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'cocoapods' ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-300" />
              )}
            </button>
          </div>
          <div className="mt-2">
            <div className={LABEL_STYLES.fieldDesc}>설치 실행:</div>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
              <code>pod install</code>
            </pre>
          </div>
        </div>
      )}

      {method === 'spm' && (
        <div className="mt-4">
          <div className={LABEL_STYLES.fieldDesc}>Xcode에서 다음 URL 추가:</div>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
              <code>{spmUrl}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(spmUrl, 'spm')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'spm' ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-300" />
              )}
            </button>
          </div>
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
            <p className="font-medium mb-1">SPM 설치 방법:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Xcode → File → Add Package Dependencies</li>
              <li>위 URL을 입력</li>
              <li>"Add Package" 클릭</li>
            </ol>
          </div>
        </div>
      )}

      {method && (
        <div className="mt-6">
          <button
            onClick={() => onComplete(method)}
            className={BUTTON_STYLES.primary}
          >
            설치 완료 →
          </button>
        </div>
      )}
    </div>
  );
}

// iOS SDK Init Component
function IosSdkInit({ appName, appToken, onComplete, isCompleted = false }: {
  appName: string;
  appToken: string;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const appDelegateCode = `import AirBridge

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        AirBridge.getInstance("${appToken}", appName: "${appName}", withLaunchOptions: launchOptions)

        return true
    }
}`;

  const attCode = `// Info.plist에 추가
<key>NSUserTrackingUsageDescription</key>
<string>앱 사용 경험 개선을 위해 광고 식별자를 수집합니다.</string>`;

  const attRequestCode = `import AppTrackingTransparency

// ATT 권한 요청 (viewDidAppear에서 호출)
ATTrackingManager.requestTrackingAuthorization { status in
    switch status {
    case .authorized:
        print("ATT authorized")
    case .denied, .restricted, .notDetermined:
        print("ATT not authorized")
    @unknown default:
        break
    }
}`;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">iOS SDK 초기화 완료</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      <div className={LABEL_STYLES.title}>iOS SDK 초기화</div>

      {/* Token Info */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-gray-400">App Name</div>
            <div className="font-mono text-gray-900">{appName}</div>
          </div>
          <div>
            <div className="text-gray-400">App Token</div>
            <div className="font-mono text-gray-900 truncate">{appToken}</div>
          </div>
        </div>
      </div>

      {/* AppDelegate Code */}
      <div className="mb-4">
        <div className={LABEL_STYLES.fieldDesc}>AppDelegate.swift에 추가:</div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto max-h-48 overflow-y-auto">
            <code>{appDelegateCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(appDelegateCode, 'appdelegate')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'appdelegate' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* ATT Section */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div className="text-sm font-medium text-amber-800">ATT (App Tracking Transparency)</div>
        </div>
        <p className="text-xs text-amber-700 mb-3">
          iOS 14.5+ 에서는 IDFA 수집을 위해 ATT 권한 요청이 필요합니다.
        </p>

        <div className="space-y-2">
          <div className={LABEL_STYLES.fieldDesc}>Info.plist:</div>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-2 rounded-lg text-xs overflow-x-auto">
              <code>{attCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(attCode, 'att-plist')}
              className="absolute top-1 right-1 p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'att-plist' ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-300" />
              )}
            </button>
          </div>

          <div className={LABEL_STYLES.fieldDesc}>ATT 요청 코드:</div>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-2 rounded-lg text-xs overflow-x-auto max-h-32 overflow-y-auto">
              <code>{attRequestCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(attRequestCode, 'att-request')}
              className="absolute top-1 right-1 p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'att-request' ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className={BUTTON_STYLES.primary}
      >
        초기화 완료 →
      </button>
    </div>
  );
}

// iOS Deep Link Setup Component
function IosDeeplinkSetup({ appName, bundleId, onComplete, isCompleted = false }: {
  appName: string;
  bundleId?: string;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [teamId, setTeamId] = useState('YOUR_TEAM_ID');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const associatedDomainsCode = `// Xcode → Target → Signing & Capabilities → Associated Domains

applinks:${appName}.airbridge.io
applinks:${appName}.abr.ge`;

  const urlSchemeCode = `// Info.plist
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>${appName}</string>
        </array>
    </dict>
</array>`;

  const handleDeeplinkCode = `// SceneDelegate.swift 또는 AppDelegate.swift

// Universal Link 처리
func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    AirBridge.deeplink().handleUniversalLink(userActivity.webpageURL) { url in
        // 딥링크 URL 처리
        print("Deeplink URL: \\(url)")
    }
}

// URL Scheme 처리
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    if let url = URLContexts.first?.url {
        AirBridge.deeplink().handleURLSchemeDeeplink(url) { url in
            // 딥링크 URL 처리
            print("URL Scheme: \\(url)")
        }
    }
}`;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">iOS 딥링크 설정 완료</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      <div className={LABEL_STYLES.title}>iOS 딥링크 설정</div>

      {/* Step 1: Associated Domains */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</div>
          <span className="text-sm font-medium text-gray-900">Associated Domains 설정</span>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
            <code>{associatedDomainsCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(associatedDomainsCode, 'associated')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'associated' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Step 2: URL Scheme */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</div>
          <span className="text-sm font-medium text-gray-900">URL Scheme 설정</span>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
            <code>{urlSchemeCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(urlSchemeCode, 'urlscheme')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'urlscheme' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Step 3: Handle Deeplink */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</div>
          <span className="text-sm font-medium text-gray-900">딥링크 핸들링 코드</span>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto max-h-48 overflow-y-auto">
            <code>{handleDeeplinkCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(handleDeeplinkCode, 'handle')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'handle' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Team ID Input */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm font-medium text-blue-800">Team ID 입력</div>
        </div>
        <p className="text-xs text-blue-700 mb-2">
          Apple Developer 계정의 Team ID를 입력해주세요. 입력하시면 자동으로 등록됩니다.
        </p>
        <input
          type="text"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          placeholder="예: ABCD1234EF"
          className={INPUT_STYLES.base}
        />
      </div>

      <button
        onClick={onComplete}
        className={BUTTON_STYLES.primary}
      >
        딥링크 설정 완료 →
      </button>
    </div>
  );
}

// ===== Android SDK Components (Native Only) =====

// Android SDK Install Component
function AndroidSdkInstall({ onComplete, isCompleted = false }: {
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const gradleCode = `// build.gradle (app level)
dependencies {
    implementation 'io.airbridge:sdk-android:2.+'
}`;

  const settingsGradleCode = `// settings.gradle (Project Settings)
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://sdk-download.airbridge.io/maven' }
    }
}`;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Android SDK 설치 완료</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      <div className={LABEL_STYLES.title}>Android SDK 설치</div>

      {/* Step 1: Add Repository */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">1</div>
          <span className="text-sm font-medium text-gray-900">Maven Repository 추가</span>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
            <code>{settingsGradleCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(settingsGradleCode, 'settings')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'settings' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Add Dependency */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">2</div>
          <span className="text-sm font-medium text-gray-900">SDK 의존성 추가</span>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
            <code>{gradleCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(gradleCode, 'gradle')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'gradle' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Sync Note */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-800 text-sm">
          <Lightbulb className="w-4 h-4" />
          <span>Gradle Sync를 실행해주세요</span>
        </div>
      </div>

      <button
        onClick={onComplete}
        className={BUTTON_STYLES.primary}
      >
        설치 완료 →
      </button>
    </div>
  );
}

// Android SDK Init Component
function AndroidSdkInit({ appName, appToken, onComplete, isCompleted = false }: {
  appName: string;
  appToken: string;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const applicationCode = `import co.ab180.airbridge.Airbridge
import co.ab180.airbridge.AirbridgeConfig

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        val config = AirbridgeConfig.Builder("${appName}", "${appToken}")
            .build()
        Airbridge.init(this, config)
    }
}`;

  const manifestApplicationCode = `<!-- AndroidManifest.xml -->
<application
    android:name=".MyApplication"
    ... >
    ...
</application>`;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Android SDK 초기화 완료</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      <div className={LABEL_STYLES.title}>Android SDK 초기화</div>

      {/* Token Info */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-gray-400">App Name</div>
            <div className="font-mono text-gray-900">{appName}</div>
          </div>
          <div>
            <div className="text-gray-400">App Token</div>
            <div className="font-mono text-gray-900 truncate">{appToken}</div>
          </div>
        </div>
      </div>

      {/* Step 1: Create Application Class */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">1</div>
          <span className="text-sm font-medium text-gray-900">Application 클래스 생성</span>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto max-h-48 overflow-y-auto">
            <code>{applicationCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(applicationCode, 'application')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'application' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Update Manifest */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">2</div>
          <span className="text-sm font-medium text-gray-900">AndroidManifest.xml 업데이트</span>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
            <code>{manifestApplicationCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(manifestApplicationCode, 'manifest')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'manifest' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      <button
        onClick={onComplete}
        className={BUTTON_STYLES.primary}
      >
        초기화 완료 →
      </button>
    </div>
  );
}

// Android Deep Link Setup Component
function AndroidDeeplinkSetup({ appName, packageName, onComplete, isCompleted = false }: {
  appName: string;
  packageName?: string;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sha256, setSha256] = useState('');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const intentFilterCode = `<!-- AndroidManifest.xml -->
<activity android:name=".MainActivity">
    <!-- URL Scheme -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="${appName}" />
    </intent-filter>

    <!-- App Links -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="${appName}.airbridge.io" />
        <data android:scheme="https" android:host="${appName}.abr.ge" />
    </intent-filter>
</activity>`;

  const handleDeeplinkCode = `// MainActivity.kt
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // 딥링크 핸들링
    Airbridge.handleDeeplink(intent) { uri ->
        // 딥링크 URL 처리
        Log.d("Deeplink", "URI: $uri")
    }
}

override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)

    Airbridge.handleDeeplink(intent) { uri ->
        Log.d("Deeplink", "New Intent URI: $uri")
    }
}`;

  const getSha256Command = `# Debug 키 SHA256 가져오기
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release 키 SHA256 가져오기
keytool -list -v -keystore your-release-key.keystore -alias your-alias`;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Android 딥링크 설정 완료</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_STYLES.base} shadow-sm`}>
      <div className={LABEL_STYLES.title}>Android 딥링크 설정</div>

      {/* Step 1: Intent Filters */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">1</div>
          <span className="text-sm font-medium text-gray-900">Intent Filter 설정</span>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto max-h-56 overflow-y-auto">
            <code>{intentFilterCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(intentFilterCode, 'intent')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'intent' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Handle Deeplink */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">2</div>
          <span className="text-sm font-medium text-gray-900">딥링크 핸들링 코드</span>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto max-h-48 overflow-y-auto">
            <code>{handleDeeplinkCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(handleDeeplinkCode, 'handle')}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'handle' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Step 3: SHA256 Fingerprint */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-2 mb-2">
          <Key className="w-4 h-4 text-green-600 mt-0.5" />
          <div className="text-sm font-medium text-green-800">SHA256 Fingerprint 입력</div>
        </div>
        <p className="text-xs text-green-700 mb-2">
          App Links 검증을 위한 SHA256 fingerprint를 입력해주세요. 자동으로 등록됩니다.
        </p>
        <div className="relative mb-2">
          <pre className="bg-gray-900 text-gray-100 p-2 rounded-lg text-xs overflow-x-auto">
            <code>{getSha256Command}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(getSha256Command, 'sha256cmd')}
            className="absolute top-1 right-1 p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copiedCode === 'sha256cmd' ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-300" />
            )}
          </button>
        </div>
        <input
          type="text"
          value={sha256}
          onChange={(e) => setSha256(e.target.value)}
          placeholder="SHA256 fingerprint 입력 (예: XX:XX:XX:...)"
          className={INPUT_STYLES.base}
        />
      </div>

      <button
        onClick={onComplete}
        className={BUTTON_STYLES.primary}
      >
        딥링크 설정 완료 →
      </button>
    </div>
  );
}

// SDK Install Method Select Component (Automation vs Manual)
function SdkInstallMethodSelect({ onSelect, isCompleted = false }: {
  onSelect: (method: 'automation' | 'manual') => void;
  isCompleted?: boolean
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Installation Method</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>How would you like to install the SDK?</div>
      <div className="space-y-3">
        {/* Automation Option */}
        <button
          onClick={() => onSelect('automation')}
          className="w-full flex items-start gap-3 p-4 rounded-lg border-2 border-blue-200 bg-blue-50 hover:border-blue-500 hover:bg-blue-100 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600 flex-shrink-0">
            <GitHubIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">GitHub Automation</span>
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Recommended</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">Connect your GitHub repository and let us handle the SDK setup automatically</div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Automatic SDK installation via PR</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Event taxonomy setup & debugging included</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deep link configuration automated</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Review PRs before merging</span>
              </div>
            </div>
          </div>
        </button>

        {/* Manual Option */}
        <button
          onClick={() => onSelect('manual')}
          className="w-full flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
            <Code className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">Manual Installation</div>
            <div className="text-sm text-gray-500 mt-1">Follow step-by-step instructions to integrate the SDK yourself</div>
            <div className="mt-2 text-xs text-gray-400">
              Best for: Custom setups, monorepos, or restricted GitHub access
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// GitHub Connect Component
function GitHubConnect({ onConnect, onSkip, isCompleted = false }: {
  onConnect: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [connectState, setConnectState] = useState<'idle' | 'connecting' | 'authorizing' | 'connected'>('idle');

  const handleConnect = () => {
    setConnectState('connecting');
    // Simulate OAuth popup opening
    setTimeout(() => {
      setConnectState('authorizing');
      // Simulate authorization completing
      setTimeout(() => {
        setConnectState('connected');
        // Trigger the parent callback after showing success
        setTimeout(() => {
          onConnect();
        }, 1000);
      }, 1500);
    }, 1000);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#171717' }}
          >
            <GitHubIcon className="w-5 h-5" fill="#ffffff" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">GitHub Connected</div>
            <div className="text-xs text-gray-500">@airbridge-user</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
        </div>
      </div>
    );
  }

  // Connecting state - showing OAuth flow
  if (connectState !== 'idle') {
    return (
      <div className={CARD_STYLES.base}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#171717' }}
          >
            <GitHubIcon className="w-7 h-7" fill="#ffffff" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Connecting to GitHub</div>
            <div className="text-sm text-gray-500">Please complete authorization in the popup window</div>
          </div>
        </div>

        {/* Connection Steps */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            {connectState === 'connecting' ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">Opening GitHub authorization</div>
              <div className="text-xs text-gray-500">Redirecting to github.com...</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${connectState === 'connecting' ? 'bg-gray-50 opacity-50' : 'bg-gray-50'}`}>
            {connectState === 'connecting' ? (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            ) : connectState === 'authorizing' ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">Waiting for authorization</div>
              <div className="text-xs text-gray-500">Grant Airbridge access to your repositories</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${connectState !== 'connected' ? 'bg-gray-50 opacity-50' : 'bg-green-50 border border-green-200'}`}>
            {connectState === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            )}
            <div className="flex-1">
              <div className={`text-sm font-medium ${connectState === 'connected' ? 'text-green-700' : 'text-gray-700'}`}>
                {connectState === 'connected' ? 'Successfully connected!' : 'Connection complete'}
              </div>
              <div className={`text-xs ${connectState === 'connected' ? 'text-green-600' : 'text-gray-500'}`}>
                {connectState === 'connected' ? 'Fetching your repositories...' : 'Ready to select repository'}
              </div>
            </div>
          </div>
        </div>

        {connectState !== 'connected' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setConnectState('idle')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#171717' }}
        >
          <GitHubIcon className="w-7 h-7" fill="#ffffff" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Connect GitHub</div>
          <div className="text-sm text-gray-500">Authorize Airbridge to access your repository</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className={LABEL_STYLES.field}>What we'll be able to do:</div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Read repository contents to analyze your project structure</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Create branches and pull requests for SDK integration</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Add comments to PRs with setup instructions</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleConnect}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
          style={{ backgroundColor: '#171717', color: '#ffffff' }}
        >
          <GitHubIcon className="w-5 h-5" fill="#ffffff" />
          <span>Connect with GitHub</span>
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

// GitHub Repo Select Component
function GitHubRepoSelect({ repos, onSelect, isCompleted = false }: {
  repos: GitHubRepo[];
  onSelect: (repo: GitHubRepo) => void;
  isCompleted?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Repository Selection</div>
        <div className="text-xs text-gray-400">Repository selected</div>
      </div>
    );
  }

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>Select your repository</div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={INPUT_STYLES.base}
        />
      </div>

      {/* Repo List */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredRepos.map((repo) => (
          <button
            key={repo.id}
            onClick={() => onSelect(repo)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <GitHubIcon className="w-5 h-5 text-gray-700 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{repo.name}</div>
              <div className="text-xs text-gray-500 truncate">{repo.fullName}</div>
            </div>
            {repo.isPrivate && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Private</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// GitHub Permissions Component
function GitHubPermissions({ onGranted, isCompleted = false }: {
  onGranted: () => void;
  isCompleted?: boolean;
}) {
  const [isGranting, setIsGranting] = useState(false);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Permissions</div>
        <div className="text-xs text-gray-400">Permissions granted</div>
      </div>
    );
  }

  const handleGrant = () => {
    setIsGranting(true);
    // Simulate permission granting
    setTimeout(() => {
      setIsGranting(false);
      onGranted();
    }, 1500);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        <div className="font-medium text-gray-900">Additional Permissions Required</div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="text-sm text-amber-800">
          To create pull requests, we need write access to your repository. This permission is only used for:
        </div>
        <ul className="mt-2 space-y-1 text-sm text-amber-700">
          <li>• Creating feature branches for SDK integration</li>
          <li>• Opening pull requests with SDK code changes</li>
          <li>• Adding review comments and documentation</li>
        </ul>
      </div>

      <button
        onClick={handleGrant}
        disabled={isGranting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
      >
        {isGranting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Granting permissions...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Grant Write Access</span>
          </>
        )}
      </button>
    </div>
  );
}

// GitHub PR Confirm Component
function GitHubPRConfirm({ step, onConfirm, onSkip, isCompleted = false }: {
  step: 'sdk-install' | 'sdk-init' | 'deeplink' | 'event-tracking';
  onConfirm: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const stepInfo = {
    'sdk-install': {
      title: 'SDK Installation',
      description: 'Install Airbridge SDK packages and configure dependencies',
      changes: [
        'Add Airbridge SDK to package.json / Podfile / build.gradle',
        'Configure build settings for your platform',
        'Set up required native modules'
      ]
    },
    'sdk-init': {
      title: 'SDK Initialization',
      description: 'Add SDK initialization code to your app entry point',
      changes: [
        'Import Airbridge SDK in your main app file',
        'Initialize SDK with your app token',
        'Configure SDK options (logging, etc.)'
      ]
    },
    'deeplink': {
      title: 'Deep Link Setup',
      description: 'Configure deep linking for attribution tracking',
      changes: [
        'Add URL scheme configuration',
        'Set up Universal Links / App Links',
        'Add deep link handling code'
      ]
    },
    'event-tracking': {
      title: 'Event Tracking Setup',
      description: 'Implement event tracking based on your taxonomy',
      changes: [
        'Add event tracking code for selected events',
        'Configure event properties and attributes',
        'Set up automatic event collection'
      ]
    }
  };

  const info = stepInfo[step];

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">{info.title} PR</div>
        <div className="text-xs text-gray-400">PR created</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
          <GitHubIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{info.title} PR</div>
          <div className="text-sm text-gray-500">{info.description}</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className={LABEL_STYLES.field}>Changes to be made:</div>
        <ul className="space-y-2">
          {info.changes.map((change, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <Code className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{change}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Create PR</span>
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Skip this step
        </button>
      </div>
    </div>
  );
}

// GitHub PR Waiting Component
function GitHubPRWaiting({ prUrl, step, isCompleted = false }: {
  prUrl?: string;
  step: string;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Creating PR</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
            <GitHubIcon className="w-3 h-3 text-gray-700" />
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">Creating Pull Request...</div>
          <div className="text-sm text-gray-500 mt-1">
            Analyzing your codebase and generating changes for {step}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>This usually takes 30-60 seconds</span>
        </div>
      </div>
    </div>
  );
}

// GitHub PR Complete Component
function GitHubPRComplete({ prUrl, prNumber, step, onReview, isCompleted = false }: {
  prUrl: string;
  prNumber: number;
  step: string;
  onReview: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">PR #{prNumber}</div>
        <div className="text-xs text-gray-400">Created successfully</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Pull Request Created!</div>
          <div className="text-sm text-gray-500">PR #{prNumber} is ready for review</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <GitHubIcon className="w-4 h-4 text-gray-600" />
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-mono text-xs truncate"
          >
            {prUrl}
          </a>
        </div>
      </div>

      <button
        onClick={onReview}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <ExternalLink className="w-5 h-5" />
        <span>Review Pull Request</span>
      </button>
    </div>
  );
}

// GitHub PR Review Component
function GitHubPRReview({ prUrl, prNumber, step, onMerged, onContinue, isCompleted = false }: {
  prUrl: string;
  prNumber: number;
  step: string;
  onMerged: () => void;
  onContinue: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">PR Review</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>What would you like to do?</div>

      <div className="space-y-3">
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <ExternalLink className="w-5 h-5 text-gray-600" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">View PR on GitHub</div>
            <div className="text-sm text-gray-500">Review the changes in detail</div>
          </div>
        </a>

        <button
          onClick={onMerged}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50 hover:border-green-500 hover:bg-green-100 transition-all text-left"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">I've merged the PR</div>
            <div className="text-sm text-gray-500">Continue to the next step</div>
          </div>
        </button>

        <button
          onClick={onContinue}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Continue without merging</div>
            <div className="text-sm text-gray-500">I'll merge later, proceed with next automation</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// SDK Install Choice Component
function SdkInstallChoice({ onSelect, isCompleted = false }: { onSelect: (choice: 'self' | 'share') => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Installation</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>Who will install the SDK?</div>
      <div className="space-y-2">
        <button
          onClick={() => onSelect('self')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
            <Code className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">I'll install it myself</div>
            <div className="text-sm text-gray-500">I'm a developer and will integrate the SDK directly</div>
          </div>
        </button>
        <button
          onClick={() => onSelect('share')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
            <Share2 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Send guide to developer</div>
            <div className="text-sm text-gray-500">I'm a marketer and need to share the setup guide with my dev team</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// SDK Guide Share Component
function SdkGuideShare({ appName, platforms, framework, onCopy, onComplete, isCompleted = false }: {
  appName: string;
  platforms: string[];
  framework?: string;
  onCopy: () => void;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Guide Share</div>
        <div className="text-xs text-gray-400">Guide shared</div>
      </div>
    );
  }

  const guideText = `
Airbridge SDK Setup Guide for "${appName}"

App: ${appName}
Platforms: ${platforms.join(', ')}
${framework ? `Framework: ${framework}` : ''}

Setup Steps:
1. Install the Airbridge SDK package
2. Initialize the SDK in your app entry point
3. Configure deep links (optional)
4. Verify SDK integration

Documentation: https://developers.airbridge.io/docs/sdk-installation

Dashboard: https://dashboard.airbridge.io/app/${appName.toLowerCase().replace(/\s/g, '')}/setup

Please complete the SDK installation and let me know when it's done!
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(guideText);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>Share SDK Setup Guide</div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700 whitespace-pre-line font-mono">
        {guideText}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        <a
          href={`slack://channel?team=&id=`}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors bg-purple-500 text-white hover:bg-purple-600"
          onClick={handleCopy}
        >
          <MessageSquare className="w-4 h-4" />
          Open Slack
        </a>
      </div>

      <button
        onClick={onComplete}
        className="w-full mt-3 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        I've sent the guide to my developer
      </button>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500 mb-2">While waiting for your developer:</div>
        <a
          href="/app/demokr"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
        >
          <Sparkles className="w-4 h-4" />
          Explore Demo App
        </a>
        <p className="text-xs text-gray-400 mt-2 text-center">
          See how Airbridge works with sample data
        </p>
      </div>
    </div>
  );
}

// SDK Install Confirm Component - "설치 완료하셨나요?" confirmation
function SdkInstallConfirm({ onConfirm, isCompleted = false }: {
  onConfirm: (status: 'done' | 'error') => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500">SDK 설치 완료</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="text-sm font-medium text-gray-900 mb-3">설치 완료하셨나요?</div>
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm('done')}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
        >
          <Check className="w-4 h-4" />
          네, 다음 단계로!
        </button>
        <button
          onClick={() => onConfirm('error')}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <AlertCircle className="w-4 h-4" />
          에러가 발생했어요
        </button>
      </div>
    </div>
  );
}

// SDK Init Confirm Component - "추가 완료!" confirmation
function SdkInitConfirm({ onConfirm, isCompleted = false }: {
  onConfirm: (status: 'done' | 'token-help') => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500">SDK 초기화 완료</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm('done')}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
        >
          <Check className="w-4 h-4" />
          추가 완료!
        </button>
        <button
          onClick={() => onConfirm('token-help')}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <HelpCircle className="w-4 h-4" />
          App Token을 모르겠어요
        </button>
      </div>
    </div>
  );
}

// Deeplink Setup Choice Component - "지금 설정" / "나중에 설정" choice
function DeeplinkSetupChoice({ onSelect, isCompleted = false }: {
  onSelect: (choice: 'now' | 'later') => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500">딥링크 설정 선택 완료</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 flex-shrink-0">
            <Link2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">딥링크 설정</h4>
            <p className="text-sm text-gray-600 mb-4">
              딥링크를 사용하면 광고 클릭 시 앱 내 특정 화면으로 바로 이동할 수 있어요.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onSelect('now')}
                className="w-full flex items-center justify-between py-3 px-4 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
              >
                <span>지금 설정할게요</span>
                <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full">권장</span>
              </button>
              <button
                onClick={() => onSelect('later')}
                className="w-full py-3 px-4 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                나중에 설정할게요 (채널 연동 먼저)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              예시: 상품 광고 클릭 → 해당 상품 페이지로 이동
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SDK Verification with Real-time Logs Checklist
function SdkVerification({ onResult, isCompleted = false }: {
  onResult: (result: 'success' | 'fail' | 'unsure') => void;
  isCompleted?: boolean;
}) {
  const [checklist, setChecklist] = useState({
    install: false,
    open: false,
  });

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500">SDK 검증 완료</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          SDK 검증
        </h4>

        <a
          href="#"
          className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-lg font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          <ExternalLink className="w-4 h-4" />
          Real-time Logs 열기
        </a>

        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-gray-700">확인할 이벤트:</p>
          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checklist.install}
              onChange={(e) => setChecklist(prev => ({ ...prev, install: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className={`text-sm ${checklist.install ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
              Install 이벤트
            </span>
            {checklist.install && <Check className="w-4 h-4 text-green-500" />}
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checklist.open}
              onChange={(e) => setChecklist(prev => ({ ...prev, open: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className={`text-sm ${checklist.open ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
              Open 이벤트
            </span>
            {checklist.open && <Check className="w-4 h-4 text-green-500" />}
          </label>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">이벤트가 보이시나요?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onResult('success')}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600 text-sm"
            >
              네, 보여요!
            </button>
            <button
              onClick={() => onResult('fail')}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200 text-sm"
            >
              아니요, 안 보여요
            </button>
            <button
              onClick={() => onResult('unsure')}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
            >
              잘 모르겠어요
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Navigation Component
function CategoryNavigation({ onSelect, isCompleted = false }: {
  onSelect: (category: string) => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500">Category selected</div>
      </div>
    );
  }

  const categories = [
    { id: 'deeplink', label: 'Deep Link', icon: '🔗', description: 'Set up deep links and tracking links' },
    { id: 'event-taxonomy', label: 'Event Taxonomy', icon: '📊', description: 'Define events to track in your app' },
    { id: 'integration', label: 'Integration', icon: '📡', description: 'Connect ad platforms and channels' },
  ];

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>What would you like to set up next?</div>
      <div className="space-y-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="text-xl">{cat.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">{cat.label}</div>
              <div className="text-xs text-gray-500">{cat.description}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

// SDK Test Component
function SdkTest({ onRunTest, isCompleted = false }: {
  onRunTest: () => void;
  isCompleted?: boolean;
}) {
  const [testState, setTestState] = useState<'idle' | 'testing' | 'complete'>('idle');
  const [testResults, setTestResults] = useState({
    install: false,
    init: false,
    events: false
  });

  const handleRunTest = () => {
    setTestState('testing');
    // Simulate test progression
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, install: true }));
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, init: true }));
        setTimeout(() => {
          setTestResults(prev => ({ ...prev, events: true }));
          setTestState('complete');
          setTimeout(() => onRunTest(), 1000);
        }, 800);
      }, 800);
    }, 800);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">SDK Test Passed</span>
        </div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Code className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">SDK Integration Test</div>
          <div className="text-sm text-gray-500">Verify your SDK is properly integrated</div>
        </div>
      </div>

      {testState === 'idle' && (
        <>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className={LABEL_STYLES.field}>This test will verify:</div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-gray-400" />
                <span>SDK package is installed correctly</span>
              </li>
              <li className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-gray-400" />
                <span>SDK initialization is successful</span>
              </li>
              <li className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-gray-400" />
                <span>Events are being sent to Airbridge</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleRunTest}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Run SDK Test
          </button>
        </>
      )}

      {testState !== 'idle' && (
        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${testResults.install ? 'bg-green-50' : 'bg-gray-50'}`}>
            {!testResults.install && testState === 'testing' ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : testResults.install ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">SDK Installation</div>
              <div className="text-xs text-gray-500">Checking package installation...</div>
            </div>
            {testResults.install && <span className="text-xs text-green-600 font-medium">Passed</span>}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${testResults.init ? 'bg-green-50' : testResults.install ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
            {testResults.install && !testResults.init && testState === 'testing' ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : testResults.init ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">SDK Initialization</div>
              <div className="text-xs text-gray-500">Verifying SDK startup...</div>
            </div>
            {testResults.init && <span className="text-xs text-green-600 font-medium">Passed</span>}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${testResults.events ? 'bg-green-50' : testResults.init ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
            {testResults.init && !testResults.events && testState === 'testing' ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : testResults.events ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">Event Tracking</div>
              <div className="text-xs text-gray-500">Checking event transmission...</div>
            </div>
            {testResults.events && <span className="text-xs text-green-600 font-medium">Passed</span>}
          </div>

          {testState === 'complete' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle2 className="w-5 h-5" />
                All tests passed! Your SDK is properly integrated.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Tracking Link Form Component
function TrackingLinkForm({ channel, onCreate, isCompleted = false }: {
  channel: string;
  onCreate: (link: TrackingLink) => void;
  isCompleted?: boolean;
}) {
  const [linkName, setLinkName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Tracking Link Created</span>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    if (!linkName.trim()) return;
    setIsCreating(true);
    setTimeout(() => {
      const newLink: TrackingLink = {
        id: Date.now().toString(),
        name: linkName,
        channel,
        url: `https://abr.ge/${linkName.toLowerCase().replace(/\s/g, '-')}`,
        shortUrl: `https://abr.ge/a1b2c3`,
        createdAt: new Date()
      };
      onCreate(newLink);
      setIsCreating(false);
    }, 1000);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Create Tracking Link</div>
          <div className="text-sm text-gray-500">For {channel} campaign tracking</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={LABEL_STYLES.field}>Link Name</label>
          <input
            type="text"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            placeholder="e.g., Summer Campaign 2024"
            className={INPUT_STYLES.base}
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className={LABEL_STYLES.field}>Link Settings</div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Channel</span>
              <span className="font-medium">{channel}</span>
            </div>
            <div className="flex justify-between">
              <span>Deep Link</span>
              <span className="font-medium text-green-600">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span>Fallback URL</span>
              <span className="font-medium">App Store / Play Store</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!linkName.trim() || isCreating}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Tracking Link'
          )}
        </button>
      </div>
    </div>
  );
}

// Tracking Link Complete Component
function TrackingLinkComplete({ links, onContinue, isCompleted = false }: {
  links: TrackingLink[];
  onContinue: () => void;
  isCompleted?: boolean;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500">Tracking Links: {links.length} created</div>
      </div>
    );
  }

  const handleCopy = (link: TrackingLink) => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Tracking Links Created</div>
          <div className="text-sm text-gray-500">{links.length} link(s) ready to use</div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {links.map((link) => (
          <div key={link.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{link.name}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{link.channel}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={link.shortUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"
              />
              <button
                onClick={() => handleCopy(link)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copiedId === link.id ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Continue to Verification
      </button>
    </div>
  );
}

// Deep Link Test Component
function DeeplinkTest({ onComplete, isCompleted = false }: {
  onComplete: (scenarios: DeeplinkTestScenario[]) => void;
  isCompleted?: boolean;
}) {
  const [scenarios, setScenarios] = useState<DeeplinkTestScenario[]>([
    { id: '1', name: 'App Installed - Direct Open', description: 'Deep link opens app directly', status: 'pending' },
    { id: '2', name: 'App Not Installed - Store Fallback', description: 'Redirects to app store', status: 'pending' },
    { id: '3', name: 'Deferred Deep Link', description: 'Deep link works after install', status: 'pending' }
  ]);
  const [testState, setTestState] = useState<'idle' | 'testing' | 'complete'>('idle');

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Deep Link Test Completed</span>
        </div>
      </div>
    );
  }

  const handleRunTest = () => {
    setTestState('testing');
    let index = 0;
    const interval = setInterval(() => {
      if (index < scenarios.length) {
        setScenarios(prev => prev.map((s, i) =>
          i === index ? { ...s, status: 'testing' } : s
        ));
        setTimeout(() => {
          setScenarios(prev => prev.map((s, i) =>
            i === index ? { ...s, status: 'passed' } : s
          ));
        }, 800);
        index++;
      } else {
        clearInterval(interval);
        setTestState('complete');
        setTimeout(() => {
          onComplete(scenarios.map(s => ({ ...s, status: 'passed' })));
        }, 500);
      }
    }, 1200);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Deep Link Test</div>
          <div className="text-sm text-gray-500">Verify deep link functionality</div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className={`flex items-center gap-3 p-3 rounded-lg ${
            scenario.status === 'passed' ? 'bg-green-50' :
            scenario.status === 'testing' ? 'bg-blue-50' : 'bg-gray-50'
          }`}>
            {scenario.status === 'testing' ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : scenario.status === 'passed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">{scenario.name}</div>
              <div className="text-xs text-gray-500">{scenario.description}</div>
            </div>
            {scenario.status === 'passed' && (
              <span className="text-xs text-green-600 font-medium">Passed</span>
            )}
          </div>
        ))}
      </div>

      {testState === 'idle' && (
        <button
          onClick={handleRunTest}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Run Deep Link Test
        </button>
      )}

      {testState === 'complete' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <CheckCircle2 className="w-5 h-5" />
            All deep link scenarios passed!
          </div>
        </div>
      )}
    </div>
  );
}

// Attribution Test Component
function AttributionTest({ onComplete, isCompleted = false }: {
  onComplete: (passed: boolean) => void;
  isCompleted?: boolean;
}) {
  const [testState, setTestState] = useState<'idle' | 'testing' | 'complete'>('idle');
  const [steps, setSteps] = useState([
    { id: '1', name: 'Click Tracking Link', status: 'pending' },
    { id: '2', name: 'Install/Open App', status: 'pending' },
    { id: '3', name: 'Verify Attribution', status: 'pending' }
  ]);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Attribution Test Passed</span>
        </div>
      </div>
    );
  }

  const handleRunTest = () => {
    setTestState('testing');
    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        setSteps(prev => prev.map((s, i) => ({
          ...s,
          status: i === index ? 'testing' : i < index ? 'passed' : 'pending'
        })));
        setTimeout(() => {
          setSteps(prev => prev.map((s, i) => ({
            ...s,
            status: i <= index ? 'passed' : 'pending'
          })));
        }, 600);
        index++;
      } else {
        clearInterval(interval);
        setTestState('complete');
        setTimeout(() => onComplete(true), 500);
      }
    }, 1000);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Attribution Test</div>
          <div className="text-sm text-gray-500">Verify attribution is working correctly</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-sm text-gray-600">
          This test simulates a user journey from ad click to app install to verify attribution tracking.
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg ${
            step.status === 'passed' ? 'bg-green-50' :
            step.status === 'testing' ? 'bg-orange-50' : 'bg-gray-50'
          }`}>
            {step.status === 'testing' ? (
              <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
            ) : step.status === 'passed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                {index + 1}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">{step.name}</span>
            {step.status === 'passed' && (
              <span className="ml-auto text-xs text-green-600 font-medium">Done</span>
            )}
          </div>
        ))}
      </div>

      {testState === 'idle' && (
        <button
          onClick={handleRunTest}
          className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          Run Attribution Test
        </button>
      )}

      {testState === 'complete' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <CheckCircle2 className="w-5 h-5" />
            Attribution is working correctly!
          </div>
        </div>
      )}
    </div>
  );
}

// Data Verification Component
function DataVerify({ onComplete, isCompleted = false }: {
  onComplete: (metrics: DataVerifyMetrics) => void;
  isCompleted?: boolean;
}) {
  const [verifyState, setVerifyState] = useState<'idle' | 'verifying' | 'complete'>('idle');
  const [metrics, setMetrics] = useState<DataVerifyMetrics>({
    eventsReceived: 0,
    lastEventTime: null,
    attributionVerified: false,
    deeplinkVerified: false
  });

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Data Verification Complete</span>
        </div>
      </div>
    );
  }

  const handleVerify = () => {
    setVerifyState('verifying');
    // Simulate data verification
    setTimeout(() => {
      setMetrics({
        eventsReceived: 127,
        lastEventTime: new Date(),
        attributionVerified: true,
        deeplinkVerified: true
      });
      setVerifyState('complete');
      setTimeout(() => {
        onComplete({
          eventsReceived: 127,
          lastEventTime: new Date(),
          attributionVerified: true,
          deeplinkVerified: true
        });
      }, 1000);
    }, 2000);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Data Verification</div>
          <div className="text-sm text-gray-500">Confirm data is being collected correctly</div>
        </div>
      </div>

      {verifyState === 'idle' && (
        <>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600">
              This will verify that events are being received in Airbridge and check:
            </div>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-gray-400" />
                Real-time event logs
              </li>
              <li className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-gray-400" />
                Attribution data
              </li>
              <li className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-gray-400" />
                Deep link tracking
              </li>
            </ul>
          </div>

          <button
            onClick={handleVerify}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Verify Data Collection
          </button>
        </>
      )}

      {verifyState === 'verifying' && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <div className="text-sm text-gray-600">Checking Real-time Logs and Reports...</div>
        </div>
      )}

      {verifyState === 'complete' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-700">{metrics.eventsReceived}</div>
              <div className="text-xs text-emerald-600">Events Received</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-700">
                {metrics.lastEventTime ? 'Just now' : '-'}
              </div>
              <div className="text-xs text-emerald-600">Last Event</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Attribution Verified</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Deep Link Verified</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              All data verification checks passed!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Onboarding Complete Component
function OnboardingComplete({ appName, onViewDashboard, onAddAnotherApp }: {
  appName: string;
  onViewDashboard: () => void;
  onAddAnotherApp?: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mt-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Onboarding Complete!</h3>
        <p className="text-gray-600">
          Congratulations! Your app "{appName}" is now fully set up with Airbridge.
        </p>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className={LABEL_STYLES.title}>What's been set up:</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>SDK Integration</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Deep Link Configuration</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Event Tracking</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Ad Channel Integration</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Attribution & Data Verification</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onViewDashboard}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Dashboard
        </button>
        <button
          onClick={onAddAnotherApp}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Another App
        </button>
        <a
          href="https://help.airbridge.io"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          Explore Advanced Features
        </a>
      </div>
    </div>
  );
}

// Language icons and colors for code blocks
const LANGUAGE_CONFIG: Record<string, { icon: string; color: string; bgColor: string; label: string }> = {
  'kotlin': { icon: 'K', color: '#A97BFF', bgColor: 'rgba(169, 123, 255, 0.15)', label: 'Kotlin' },
  'java': { icon: 'J', color: '#ED8B00', bgColor: 'rgba(237, 139, 0, 0.15)', label: 'Java' },
  'swift': { icon: 'S', color: '#FA7343', bgColor: 'rgba(250, 115, 67, 0.15)', label: 'Swift' },
  'typescript': { icon: 'TS', color: '#3178C6', bgColor: 'rgba(49, 120, 198, 0.15)', label: 'TypeScript' },
  'javascript': { icon: 'JS', color: '#F7DF1E', bgColor: 'rgba(247, 223, 30, 0.15)', label: 'JavaScript' },
  'dart': { icon: 'D', color: '#0175C2', bgColor: 'rgba(1, 117, 194, 0.15)', label: 'Dart' },
  'csharp': { icon: 'C#', color: '#68217A', bgColor: 'rgba(104, 33, 122, 0.15)', label: 'C#' },
  'bash': { icon: '$', color: '#4EAA25', bgColor: 'rgba(78, 170, 37, 0.15)', label: 'Terminal' },
  'shell': { icon: '$', color: '#4EAA25', bgColor: 'rgba(78, 170, 37, 0.15)', label: 'Shell' },
  'yaml': { icon: 'Y', color: '#CB171E', bgColor: 'rgba(203, 23, 30, 0.15)', label: 'YAML' },
  'json': { icon: '{ }', color: '#000000', bgColor: 'rgba(0, 0, 0, 0.15)', label: 'JSON' },
  'xml': { icon: '<>', color: '#E44D26', bgColor: 'rgba(228, 77, 38, 0.15)', label: 'XML' },
  'gradle': { icon: 'G', color: '#02303A', bgColor: 'rgba(2, 48, 58, 0.15)', label: 'Gradle' },
  'ruby': { icon: 'R', color: '#CC342D', bgColor: 'rgba(204, 52, 45, 0.15)', label: 'Ruby' },
  'default': { icon: '#', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.15)', label: 'Code' },
};

// Simple syntax highlighting for code
function highlightCode(code: string, language: string): React.ReactNode[] {
  const lines = code.split('\n');

  return lines.map((line, lineIndex) => {
    // Keywords by language
    const keywords: Record<string, string[]> = {
      kotlin: ['import', 'class', 'fun', 'override', 'val', 'var', 'private', 'public', 'internal', 'protected', 'this', 'super', 'return', 'if', 'else', 'when', 'for', 'while', 'true', 'false', 'null', 'companion', 'object', 'data', 'sealed', 'open', 'abstract', 'interface', 'enum'],
      java: ['import', 'class', 'public', 'private', 'protected', 'void', 'static', 'final', 'new', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'null', 'this', 'super', 'extends', 'implements', 'interface', 'abstract', 'package'],
      swift: ['import', 'class', 'struct', 'func', 'override', 'var', 'let', 'private', 'public', 'internal', 'fileprivate', 'self', 'return', 'if', 'else', 'guard', 'for', 'while', 'true', 'false', 'nil', 'init', 'deinit', 'enum', 'protocol', 'extension', 'static', 'lazy', 'weak', 'unowned'],
      typescript: ['import', 'export', 'from', 'class', 'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'null', 'undefined', 'this', 'new', 'async', 'await', 'interface', 'type', 'extends', 'implements'],
      javascript: ['import', 'export', 'from', 'class', 'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'null', 'undefined', 'this', 'new', 'async', 'await'],
      dart: ['import', 'class', 'void', 'var', 'final', 'const', 'static', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'null', 'this', 'super', 'async', 'await', 'Future', 'Widget', 'State', 'override', 'required'],
      csharp: ['using', 'namespace', 'class', 'public', 'private', 'protected', 'void', 'static', 'new', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'null', 'this', 'base', 'override', 'virtual', 'abstract', 'interface'],
    };

    const langKeywords = keywords[language] || [];

    // Split line into tokens and highlight
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      // Check for comments
      if (remaining.startsWith('//') || remaining.startsWith('#')) {
        tokens.push(<span key={key++} style={{ color: '#6B7280' }}>{remaining}</span>);
        break;
      }

      // Check for strings (double quotes)
      const doubleQuoteMatch = remaining.match(/^"([^"\\]|\\.)*"/);
      if (doubleQuoteMatch) {
        tokens.push(<span key={key++} style={{ color: '#A5D6A7' }}>{doubleQuoteMatch[0]}</span>);
        remaining = remaining.slice(doubleQuoteMatch[0].length);
        continue;
      }

      // Check for strings (single quotes)
      const singleQuoteMatch = remaining.match(/^'([^'\\]|\\.)*'/);
      if (singleQuoteMatch) {
        tokens.push(<span key={key++} style={{ color: '#A5D6A7' }}>{singleQuoteMatch[0]}</span>);
        remaining = remaining.slice(singleQuoteMatch[0].length);
        continue;
      }

      // Check for template literals
      const templateMatch = remaining.match(/^`([^`\\]|\\.)*`/);
      if (templateMatch) {
        tokens.push(<span key={key++} style={{ color: '#A5D6A7' }}>{templateMatch[0]}</span>);
        remaining = remaining.slice(templateMatch[0].length);
        continue;
      }

      // Check for keywords
      let foundKeyword = false;
      for (const kw of langKeywords) {
        const kwRegex = new RegExp(`^\\b${kw}\\b`);
        if (kwRegex.test(remaining)) {
          tokens.push(<span key={key++} style={{ color: '#C792EA' }}>{kw}</span>);
          remaining = remaining.slice(kw.length);
          foundKeyword = true;
          break;
        }
      }
      if (foundKeyword) continue;

      // Check for function calls
      const funcMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (funcMatch) {
        tokens.push(<span key={key++} style={{ color: '#82AAFF' }}>{funcMatch[1]}</span>);
        remaining = remaining.slice(funcMatch[1].length);
        continue;
      }

      // Check for numbers
      const numMatch = remaining.match(/^\d+(\.\d+)?/);
      if (numMatch) {
        tokens.push(<span key={key++} style={{ color: '#F78C6C' }}>{numMatch[0]}</span>);
        remaining = remaining.slice(numMatch[0].length);
        continue;
      }

      // Check for class names (PascalCase)
      const classMatch = remaining.match(/^[A-Z][a-zA-Z0-9_]*/);
      if (classMatch) {
        tokens.push(<span key={key++} style={{ color: '#FFCB6B' }}>{classMatch[0]}</span>);
        remaining = remaining.slice(classMatch[0].length);
        continue;
      }

      // Default: take one character
      tokens.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIndex} className="table-row">
        <span className="table-cell pr-4 text-right select-none" style={{ color: '#4B5563', minWidth: '2.5rem' }}>
          {lineIndex + 1}
        </span>
        <span className="table-cell">{tokens}</span>
      </div>
    );
  });
}

// Code Block Component
function CodeBlock({ title, code, language }: { title: string; code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['default'];
  const lines = code.split('\n');
  const shouldCollapse = lines.length > 15;
  const displayCode = shouldCollapse && !isExpanded ? lines.slice(0, 12).join('\n') : code;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden mt-4 shadow-lg" style={{
      background: 'linear-gradient(180deg, #1E1E2E 0%, #181825 100%)',
      border: '1px solid #313244'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{
        background: 'linear-gradient(90deg, #1E1E2E 0%, #242435 100%)',
        borderBottom: '1px solid #313244'
      }}>
        <div className="flex items-center gap-3">
          {/* Window controls */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F38BA8' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FAB387' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A6E3A1' }} />
          </div>

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#CDD6F4' }}>{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language badge */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
            style={{
              backgroundColor: langConfig.bgColor,
              color: langConfig.color,
            }}
          >
            <span className="font-bold" style={{ fontSize: '10px' }}>{langConfig.icon}</span>
            <span>{langConfig.label}</span>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: copied ? 'rgba(166, 227, 161, 0.15)' : 'rgba(205, 214, 244, 0.1)',
              color: copied ? '#A6E3A1' : '#CDD6F4',
            }}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="relative">
        <pre
          className="p-4 text-[13px] leading-relaxed overflow-x-auto font-mono"
          style={{
            backgroundColor: 'transparent',
            color: '#CDD6F4',
            tabSize: 2,
          }}
        >
          <code className="table w-full">
            {highlightCode(displayCode, language)}
          </code>
        </pre>

        {/* Expand/Collapse overlay */}
        {shouldCollapse && !isExpanded && (
          <div
            className="absolute bottom-0 left-0 right-0 h-20 flex items-end justify-center pb-3"
            style={{
              background: 'linear-gradient(to bottom, transparent, #181825 70%)',
            }}
          >
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: 'rgba(137, 180, 250, 0.15)',
                color: '#89B4FA',
                border: '1px solid rgba(137, 180, 250, 0.3)',
              }}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Show {lines.length - 12} more lines</span>
            </button>
          </div>
        )}

        {shouldCollapse && isExpanded && (
          <div className="flex justify-center py-2" style={{ backgroundColor: '#181825' }}>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: 'rgba(137, 180, 250, 0.15)',
                color: '#89B4FA',
                border: '1px solid rgba(137, 180, 250, 0.3)',
              }}
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show less</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Environment Select Component
function EnvironmentSelect({ onSelect, isCompleted = false }: { onSelect: (env: 'dev' | 'production') => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Select Environment</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.field}>Select Environment</div>
      <div className="flex items-center gap-2 mb-3 px-4 py-3 rounded-lg bg-amber-100">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span className="text-sm text-amber-800">Environment cannot be changed after registration</span>
      </div>
      <div className="space-y-2">
        <button
          onClick={() => onSelect('dev')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
            <Code className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Development</div>
            <div className="text-sm text-gray-500">For first-time setup. Test SDK integration quickly.</div>
          </div>
        </button>
        <button
          onClick={() => onSelect('production')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Production</div>
            <div className="text-sm text-gray-500">For live apps. Requires app store review & deployment.</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// App Name Input Component
function AppNameInput({ onSubmit, isCompleted = false }: { onSubmit: (name: string) => void; isCompleted?: boolean }) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">App Name</div>
        <div className="text-xs text-gray-400">Input completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>App Name</div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Enter your app name"
        className={INPUT_STYLES.base}
        autoFocus
      />
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${name.trim() ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Search <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// App Search Loading Component
function AppSearchLoading({ query }: { query: string }) {
  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <div>
          <div className="text-sm font-medium text-gray-900">
            Searching for "{query}"
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Looking in App Store and Google Play...
          </div>
        </div>
      </div>
    </div>
  );
}

// App Search Results Component
function AppSearchResults({
  results,
  query,
  onSelect,
  onNotFound,
  isCompleted = false
}: {
  results: AppSearchResult[];
  query: string;
  onSelect: (app: AppSearchResult) => void;
  onNotFound: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Search Results</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>
        Search results for "{query}"
      </div>

      <div className="space-y-2">
        {results.map(app => (
          <button
            key={app.id}
            onClick={() => onSelect(app)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white transition-all text-left hover:border-blue-500 hover:bg-blue-50"
          >
            <img
              src={app.icon}
              alt={app.name}
              className="w-14 h-14 rounded-xl bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">{app.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {app.developer}
              </div>
              <div className="text-[0.625rem] text-gray-400 mt-1 font-mono">
                {app.store === 'ios' ? app.bundleId : app.packageName}
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${app.store === 'ios' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-800'}`}
            >
              {app.store === 'ios' ? 'iOS' : 'Android'}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onNotFound}
        className="w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        My app is not listed
      </button>
    </div>
  );
}

// Platform Multi-Select Component (for Production)
function PlatformMultiSelect({ onSelect, isCompleted = false }: { onSelect: (platforms: string[]) => void; isCompleted?: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);

  const platforms = [
    { id: 'ios', label: 'iOS', description: 'App Store', icon: <Smartphone className="w-8 h-8" /> },
    { id: 'android', label: 'Android', description: 'Play Store', icon: <Smartphone className="w-8 h-8" /> },
    { id: 'web', label: 'Web', description: 'Web App', icon: <Tv className="w-8 h-8" /> },
  ];

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Select Platforms</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.field}>Select Platforms</div>
      <div className="text-xs text-gray-500 mb-4">
        Select all platforms for your app. They will be registered as a single app.
      </div>
      <div className="grid grid-cols-3 gap-3">
        {platforms.map(platform => {
          const isSelected = selected.includes(platform.id);
          return (
            <button
              key={platform.id}
              onClick={() => toggle(platform.id)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all min-h-[120px] ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-5 h-5 text-blue-500" />
                </div>
              )}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-2 ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {platform.icon}
              </div>
              <span className="font-semibold text-gray-900 text-sm">{platform.label}</span>
              <span className="text-[0.625rem] text-gray-400 mt-1">{platform.description}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => selected.length > 0 && onSelect(selected)}
        disabled={selected.length === 0}
        className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${selected.length > 0 ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Dev App Name Input Component
function DevAppNameInput({ onSubmit, isCompleted = false }: { onSubmit: (name: string) => void; isCompleted?: boolean }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Validate: only lowercase letters and numbers
  const validateAppName = (value: string) => {
    if (!value) return '';
    if (!/^[a-z0-9]*$/.test(value)) {
      return 'Only lowercase letters and numbers are allowed';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setError(validateAppName(value));
  };

  const isValid = name.trim() && !error;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">App Name</div>
        <div className="text-xs text-gray-400">Input completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.field}>App Name</div>
      <div className={LABEL_STYLES.subtitle}>
        Enter a name for your development app (lowercase letters and numbers only)
      </div>
      <div className="flex items-center gap-2 mb-3 px-4 py-3 rounded-lg bg-amber-100">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span className="text-xs text-amber-800">App name cannot be changed after registration</span>
      </div>
      <input
        type="text"
        value={name}
        onChange={handleChange}
        onKeyDown={e => e.key === 'Enter' && isValid && onSubmit(name.trim())}
        placeholder="myappdev"
        className={error ? INPUT_STYLES.error : INPUT_STYLES.base}
        autoFocus
      />
      {error && (
        <div className="mt-2 text-xs text-red-500">{error}</div>
      )}
      <button
        onClick={() => isValid && onSubmit(name.trim())}
        disabled={!isValid}
        className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${isValid ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Platform Registration Component (for each platform in Production)
function PlatformRegistration({
  platform,
  platformIndex,
  totalPlatforms,
  onSearch,
  onUrlSubmit,
  isCompleted = false
}: {
  platform: 'ios' | 'android' | 'web';
  platformIndex: number;
  totalPlatforms: number;
  onSearch: (query: string) => void;
  onUrlSubmit: (url: string) => void;
  isCompleted?: boolean;
}) {
  const [mode, setMode] = useState<'choice' | 'search' | 'url'>('choice');
  const [searchQuery, setSearchQuery] = useState('');
  const [url, setUrl] = useState('');

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Platform Registration</div>
        <div className="text-xs text-gray-400">Registration completed</div>
      </div>
    );
  }

  const platformLabels = {
    ios: { name: 'iOS', store: 'App Store', urlPlaceholder: 'https://apps.apple.com/app/...' },
    android: { name: 'Android', store: 'Play Store', urlPlaceholder: 'https://play.google.com/store/apps/details?id=...' },
    web: { name: 'Web', store: 'Website', urlPlaceholder: 'https://your-app.com' },
  };

  const info = platformLabels[platform];

  if (platform === 'web') {
    return (
      <div className={CARD_STYLES.base}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-gray-700">
              {info.name} Registration
            </div>
            <div className="text-xs text-gray-500">
              Platform {platformIndex + 1} of {totalPlatforms}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
            <Tv className="w-5 h-5 text-gray-700" />
          </div>
        </div>
        <div className={LABEL_STYLES.subtitle}>
          Enter your website URL
        </div>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && url.trim() && onUrlSubmit(url.trim())}
          placeholder={info.urlPlaceholder}
          className="w-full rounded-lg focus:outline-none border border-gray-200 text-gray-900 px-4 py-3"
          autoFocus
        />
        <button
          onClick={() => url.trim() && onUrlSubmit(url.trim())}
          disabled={!url.trim()}
          className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${url.trim() ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (mode === 'choice') {
    return (
      <div className={CARD_STYLES.base}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-gray-700">
              {info.name} Registration
            </div>
            <div className="text-xs text-gray-500">
              Platform {platformIndex + 1} of {totalPlatforms}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
            <Smartphone className="w-5 h-5 text-gray-700" />
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-4">
          How would you like to register your {info.name} app?
        </div>
        <div className="space-y-2">
          <button
            onClick={() => setMode('search')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white transition-all text-left hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Search {info.store}</div>
              <div className="text-xs text-gray-500">Find your app by name</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setMode('url')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white transition-all text-left hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
              <ExternalLink className="w-5 h-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Enter {info.store} URL</div>
              <div className="text-xs text-gray-500">Paste your app's store URL</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'search') {
    return (
      <div className={CARD_STYLES.base}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-gray-700">
              Search {info.store}
            </div>
            <div className="text-xs text-gray-500">
              Platform {platformIndex + 1} of {totalPlatforms}
            </div>
          </div>
          <button
            onClick={() => setMode('choice')}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && onSearch(searchQuery.trim())}
          placeholder="Enter app name..."
          className="w-full rounded-lg focus:outline-none border border-gray-200 text-gray-900 px-4 py-3"
          autoFocus
        />
        <button
          onClick={() => searchQuery.trim() && onSearch(searchQuery.trim())}
          disabled={!searchQuery.trim()}
          className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${searchQuery.trim() ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Search <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // URL mode
  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium text-gray-700">
            Enter {info.store} URL
          </div>
          <div className="text-xs text-gray-500">
            Platform {platformIndex + 1} of {totalPlatforms}
          </div>
        </div>
        <button
          onClick={() => setMode('choice')}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Back
        </button>
      </div>
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && url.trim() && onUrlSubmit(url.trim())}
        placeholder={info.urlPlaceholder}
        className="w-full rounded-lg focus:outline-none border border-gray-200 text-gray-900 px-4 py-3"
        autoFocus
      />
      <button
        onClick={() => url.trim() && onUrlSubmit(url.trim())}
        disabled={!url.trim()}
        className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${url.trim() ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Timezone & Currency Confirm Component
function TimezoneCurrencyConfirm({
  timezone,
  currency,
  onConfirm,
  onEdit,
  isCompleted = false
}: {
  timezone: string;
  currency: string;
  onConfirm: () => void;
  onEdit: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Timezone & Currency</div>
        <div className="text-xs text-gray-400">Confirmation completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.field}>
        Timezone & Currency
      </div>
      <div className={LABEL_STYLES.subtitle}>
        Based on your location, we've detected the following settings:
      </div>
      <div className="flex items-center gap-2 mb-3 px-4 py-3 rounded-lg bg-amber-100">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span className="text-xs text-amber-800">Timezone and currency cannot be changed after registration</span>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
          <div>
            <div className="text-xs text-gray-500 mb-1">Timezone</div>
            <div className="font-medium text-gray-900 text-[0.9375rem]">{timezone}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
          <div>
            <div className="text-xs text-gray-500 mb-1">Currency</div>
            <div className="font-medium text-gray-900 text-[0.9375rem]">{currency}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
        >
          Confirm
        </button>
        <button
          onClick={onEdit}
          className="py-4 px-4 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// Timezone & Currency Input Component
function TimezoneCurrencyInput({ onSubmit, isCompleted = false }: { onSubmit: (timezone: string, currency: string) => void; isCompleted?: boolean }) {
  const [timezone, setTimezone] = useState('');
  const [currency, setCurrency] = useState('');

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Timezone & Currency</div>
        <div className="text-xs text-gray-400">Input completed</div>
      </div>
    );
  }

  const timezones = [
    'Asia/Seoul (KST, UTC+9)',
    'Asia/Tokyo (JST, UTC+9)',
    'America/New_York (EST, UTC-5)',
    'America/Los_Angeles (PST, UTC-8)',
    'Europe/London (GMT, UTC+0)',
    'Europe/Paris (CET, UTC+1)',
  ];

  const currencies = [
    'KRW (Korean Won)',
    'USD (US Dollar)',
    'JPY (Japanese Yen)',
    'EUR (Euro)',
    'GBP (British Pound)',
    'CNY (Chinese Yuan)',
  ];

  const isValid = timezone && currency;

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.field}>
        Select Timezone & Currency
      </div>
      <div className="flex items-center gap-2 mb-3 px-4 py-3 rounded-lg bg-amber-100">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span className="text-xs text-amber-800">Timezone and currency cannot be changed after registration</span>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="w-full rounded-lg focus:outline-none border border-gray-200 text-gray-900 px-4 py-3"
          >
            <option value="">Select timezone...</option>
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-2">
            Currency
          </label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="w-full rounded-lg focus:outline-none border border-gray-200 text-gray-900 px-4 py-3"
          >
            <option value="">Select currency...</option>
            {currencies.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={() => isValid && onSubmit(timezone, currency)}
        disabled={!isValid}
        className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${isValid ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// App Info Form Component
function AppInfoForm({ onSubmit, platforms, isCompleted = false }: { onSubmit: (info: AppInfo) => void; platforms: string[]; isCompleted?: boolean }) {
  const [info, setInfo] = useState<AppInfo>({ appName: '', storeUrl: '', bundleId: '', packageName: '' });

  const handleSubmit = () => {
    if (info.appName) {
      onSubmit(info);
    }
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">App Information</div>
        <div className="text-xs text-gray-400">Form completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>App Information</div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">App Name *</label>
          <input
            type="text"
            value={info.appName}
            onChange={e => setInfo({ ...info, appName: e.target.value })}
            placeholder="MyApp"
            className={INPUT_STYLES.base}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Store URL (optional)</label>
          <input
            type="text"
            value={info.storeUrl}
            onChange={e => setInfo({ ...info, storeUrl: e.target.value })}
            placeholder="https://apps.apple.com/..."
            className={INPUT_STYLES.base}
          />
          <p className="text-xs text-gray-500 mt-1">We&apos;ll automatically fetch app info when provided</p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className={LABEL_STYLES.subtitle}>Or enter manually</p>

          {platforms.includes('ios') && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">iOS Bundle ID</label>
              <input
                type="text"
                value={info.bundleId}
                onChange={e => setInfo({ ...info, bundleId: e.target.value })}
                placeholder="com.company.appname"
                className={INPUT_STYLES.base}
              />
            </div>
          )}

          {platforms.includes('android') && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Android Package Name</label>
              <input
                type="text"
                value={info.packageName}
                onChange={e => setInfo({ ...info, packageName: e.target.value })}
                placeholder="com.company.appname"
                className={INPUT_STYLES.base}
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!info.appName}
        className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${info.appName ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// App Registration Component (Auto-registration in Chat UI)
function DashboardAction({
  appName, bundleId, packageName, onConfirm, isCompleted = false
}: {
  appName: string; bundleId: string; packageName: string; onConfirm: (status: string) => void; isCompleted?: boolean
}) {
  const [registrationStep, setRegistrationStep] = useState(0);
  const [isRegistering, setIsRegistering] = useState(true);

  // Auto-registration simulation
  useEffect(() => {
    if (isCompleted) return;

    const steps = [
      { delay: 800, step: 1 },   // Validating app info
      { delay: 1200, step: 2 },  // Creating app
      { delay: 800, step: 3 },   // Generating tokens
      { delay: 600, step: 4 },   // Complete
    ];

    let timeouts: NodeJS.Timeout[] = [];
    let totalDelay = 0;

    steps.forEach(({ delay, step }) => {
      totalDelay += delay;
      const timeout = setTimeout(() => {
        setRegistrationStep(step);
        if (step === 4) {
          setIsRegistering(false);
          setTimeout(() => onConfirm('completed'), 800);
        }
      }, totalDelay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [onConfirm, isCompleted]);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">앱 등록 완료</span>
        </div>
      </div>
    );
  }

  const registrationSteps = [
    { label: '앱 정보 검증 중...', icon: '🔍' },
    { label: '앱 생성 중...', icon: '📱' },
    { label: '토큰 생성 중...', icon: '🔑' },
    { label: '등록 완료!', icon: '✅' },
  ];

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>앱 등록</div>

      {/* App Info Summary */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2 mb-4">
        <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
          <div>
            <span className="text-xs text-gray-500">App Name</span>
            <div className="font-medium">{appName || '-'}</div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>

        {bundleId && (
          <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
            <div>
              <span className="text-xs text-gray-500">Bundle ID (iOS)</span>
              <div className="font-mono text-sm">{bundleId}</div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
        )}

        {packageName && (
          <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
            <div>
              <span className="text-xs text-gray-500">Package Name (Android)</span>
              <div className="font-mono text-sm">{packageName}</div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
        )}
      </div>

      {/* Registration Progress */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="space-y-2">
          {registrationSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 text-sm transition-all ${
                registrationStep > index
                  ? 'text-green-600'
                  : registrationStep === index
                  ? 'text-blue-600'
                  : 'text-gray-300'
              }`}
            >
              {registrationStep > index ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : registrationStep === index ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300" />
              )}
              <span>{step.icon} {step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Framework Select Component
function FrameworkSelect({ onSelect, isCompleted = false }: { onSelect: (framework: string) => void; isCompleted?: boolean }) {
  const frameworks = [
    { category: 'Native', items: [
      { id: 'ios-native', label: 'iOS (Swift/Objective-C)' },
      { id: 'android-native', label: 'Android (Kotlin/Java)' },
    ]},
    { category: 'Cross-Platform', items: [
      { id: 'react-native', label: 'React Native' },
      { id: 'flutter', label: 'Flutter' },
      { id: 'unity', label: 'Unity' },
      { id: 'expo', label: 'Expo' },
    ]},
  ];

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Development Framework</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>Select Development Framework</div>

      {frameworks.map(group => (
        <div key={group.category} className="mb-4 last:mb-0">
          <div className={LABEL_STYLES.fieldDesc}>{group.category}</div>
          <div className="space-y-2">
            {group.items.map(item => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <Code className="w-5 h-5 text-gray-400" />
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// SDK Init Code Component
function SDKInitCode({ appName, appToken, onConfirm, isCompleted = false }: { appName: string; appToken: string; onConfirm: (status: string) => void; isCompleted?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState<string | null>(null);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Initialization</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  const code = `import Airbridge from 'airbridge-react-native-sdk';

Airbridge.init({
  appName: '${appName}',
  appToken: '${appToken}',
});`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTokenCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setTokenCopied(field);
    setTimeout(() => setTokenCopied(null), 2000);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>SDK Initialization Code</div>

      {/* Token Info Card - Show tokens directly */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
          <Key className="w-4 h-4" />
          Your App Credentials
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
            <div>
              <div className="text-xs text-gray-500">App Name</div>
              <div className="text-sm font-mono font-medium text-gray-900">{appName}</div>
            </div>
            <button
              onClick={() => handleTokenCopy(appName, 'appName')}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {tokenCopied === 'appName' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
          <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
            <div>
              <div className="text-xs text-gray-500">App Token</div>
              <div className="text-sm font-mono font-medium text-gray-900">{appToken}</div>
            </div>
            <button
              onClick={() => handleTokenCopy(appToken, 'appToken')}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {tokenCopied === 'appToken' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
        <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
          <span className="text-sm" style={{ color: '#9ca3af' }}>App.js or index.js</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
            style={{ color: '#9ca3af' }}
          >
            {copied ? <Check className="w-4 h-4" style={{ color: '#4ade80' }} /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 text-sm overflow-x-auto" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
          <code>{code}</code>
        </pre>
      </div>

      <div className="mt-4">
        <button
          onClick={() => onConfirm('completed')}
          className={BUTTON_STYLES.primary}
        >
          Done - I've added the code
        </button>
      </div>
    </div>
  );
}

// Deep Link Choice Component
function DeeplinkChoice({ onSelect, isCompleted = false }: { onSelect: (choice: string) => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Deep Link Setup</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>Deep Link Setup</div>

      <div className="space-y-2">
        {[
          { label: 'Set up now (Recommended)', value: 'now', recommended: true },
          { label: 'Set up later (proceed to channel integration)', value: 'later' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
              option.recommended
                ? 'border-blue-200 bg-blue-50 hover:border-blue-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Circle className="w-5 h-5 text-gray-400" />
            <span className="text-sm">{option.label}</span>
            {option.recommended && (
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-500 text-white">Recommended</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-500 font-medium mb-1">What is Deep Link?</div>
        <p className="text-xs text-gray-600">
          A feature that directs users to a specific screen in your app after clicking an ad.
          <br />Example: Product ad click → Product detail page
        </p>
      </div>
    </div>
  );
}

// Deep Link iOS Input Component
function DeeplinkIosInput({
  bundleId,
  appName,
  onSubmit,
  isCompleted = false
}: {
  bundleId?: string;
  appName?: string;
  onSubmit: (data: { uriScheme: string; appId: string }) => void;
  isCompleted?: boolean;
}) {
  const [uriScheme, setUriScheme] = useState('');
  const [appId, setAppId] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const sdkConfigValue = appName ? `applinks:${appName.toLowerCase().replace(/\s/g, '')}.airbridge.io` : 'applinks:yourapp.airbridge.io';

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-1">iOS 딥링크 설정</div>
        <div className="text-xs text-gray-400">설정 완료</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-900">iOS 딥링크 설정</div>
            <div className="text-sm text-gray-500">iOS 앱의 딥링크 정보를 입력하세요</div>
          </div>
        </div>
        <a
          href="https://help.airbridge.io/ko/guides/retargeting-with-deep-links"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          가이드
        </a>
      </div>

      <div className="space-y-4">
        {/* iOS URL Scheme */}
        <div>
          <label className={LABEL_STYLES.field}>
            iOS URL 스킴 <span className="text-red-500">*</span>
          </label>
          <p className={LABEL_STYLES.fieldDesc}>
            iOS 설정 파일인 info.plist에서 지정하는 값만 입력할 수 있습니다.
          </p>
          <input
            type="text"
            value={uriScheme}
            onChange={(e) => setUriScheme(e.target.value.toLowerCase().replace(/[^a-z0-9+.-]/g, ''))}
            placeholder="예: myapp"
            className={INPUT_STYLES.base}
          />
        </div>

        {/* iOS App ID */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700">
              iOS 앱 ID <span className="text-red-500">*</span>
            </label>
            <a
              href="https://help.airbridge.io/ko/developers/ios-sdk-v4#%EC%97%90%EC%96%B4%EB%B8%8C%EB%A6%BF%EC%A7%80%EC%97%90-%EB%94%A5%EB%A7%81%ED%81%AC-%EC%A0%95%EB%B3%B4-%EB%93%B1%EB%A1%9D%ED%95%98%EA%B8%B0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <Code className="w-3 h-3" />
              개발자 가이드
            </a>
          </div>
          <p className={LABEL_STYLES.fieldDesc}>
            App ID Prefix와 Bundle ID를 마침표(.)로 조합하여 입력하세요.
            <span className="block text-gray-400 mt-0.5">예: 1AB23CDEFG.com.your.bundleid</span>
          </p>
          <input
            type="text"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="예: 1AB23CDEFG.com.example.app"
            className={INPUT_STYLES.base}
          />
        </div>

        {/* iOS SDK 설정 필요 정보 */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <label className="block text-sm font-medium text-blue-900 mb-2">
            iOS SDK 설정 필요 정보
          </label>
          <p className="text-xs text-blue-700 mb-3">
            Xcode에서 Associated Domains 설정 시 아래 값을 사용하세요.
          </p>
          <button
            onClick={() => handleCopy(sdkConfigValue, 'sdkConfig')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-900 hover:bg-blue-50 transition-colors"
          >
            <code className="font-mono text-sm">{sdkConfigValue}</code>
            {copySuccess === 'sdkConfig' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-blue-500" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => onSubmit({ uriScheme: uriScheme, appId })}
        disabled={!uriScheme || !appId}
        className={`w-full mt-6 ${uriScheme && appId ? BUTTON_STYLES.primary : BUTTON_STYLES.primaryDisabled}`}
      >
        저장하고 계속하기
      </button>
    </div>
  );
}

// Deep Link Android Input Component
function DeeplinkAndroidInput({
  packageName: initialPackageName,
  appName,
  onSubmit,
  isCompleted = false
}: {
  packageName?: string;
  appName?: string;
  onSubmit: (data: { uriScheme: string; packageName: string; sha256Fingerprints: string[] }) => void;
  isCompleted?: boolean;
}) {
  const [uriScheme, setUriScheme] = useState('');
  const [packageName, setPackageName] = useState(initialPackageName || '');
  const [fingerprints, setFingerprints] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const sdkConfigValue = appName ? `${appName.toLowerCase().replace(/\s/g, '')}.airbridge.io` : 'yourapp.airbridge.io';

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-1">Android 딥링크 설정</div>
        <div className="text-xs text-gray-400">설정 완료</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.341l1.624-2.817c.091-.158.039-.358-.117-.449a.325.325 0 0 0-.445.118l-1.646 2.856c-1.247-.569-2.644-.889-4.139-.889-1.495 0-2.893.32-4.139.889l-1.646-2.856a.325.325 0 0 0-.445-.118c-.156.091-.208.291-.117.449l1.624 2.817c-2.607 1.271-4.297 3.716-4.297 6.559h18.04c0-2.843-1.69-5.288-4.297-6.559zM7.699 18.859c-.396 0-.717-.322-.717-.719s.321-.719.717-.719c.396 0 .718.322.718.719s-.322.719-.718.719zm8.602 0c-.396 0-.717-.322-.717-.719s.321-.719.717-.719c.396 0 .718.322.718.719s-.322.719-.718.719zM5.246 9.054l-1.573-2.734a.325.325 0 0 1 .118-.445c.156-.091.357-.039.448.118l1.594 2.763c1.326-.604 2.817-.943 4.367-.943s3.041.339 4.367.943l1.594-2.763a.325.325 0 0 1 .448-.118c.156.091.208.291.118.445l-1.573 2.734c2.754 1.422 4.63 4.262 4.63 7.546H.616c0-3.284 1.876-6.124 4.63-7.546z"/>
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-900">Android 딥링크 설정</div>
            <div className="text-sm text-gray-500">Android 앱의 딥링크 정보를 입력하세요</div>
          </div>
        </div>
        <a
          href="https://help.airbridge.io/ko/guides/retargeting-with-deep-links"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          가이드
        </a>
      </div>

      <div className="space-y-4">
        {/* Android URL Scheme */}
        <div>
          <label className={LABEL_STYLES.field}>
            Android URL 스킴 <span className="text-red-500">*</span>
          </label>
          <p className={LABEL_STYLES.fieldDesc}>
            AndroidManifest.xml에서 지정한 URL 스킴을 입력하세요.
          </p>
          <input
            type="text"
            value={uriScheme}
            onChange={(e) => setUriScheme(e.target.value.toLowerCase().replace(/[^a-z0-9+.-]/g, ''))}
            placeholder="예: myapp"
            className={INPUT_STYLES.base}
          />
        </div>

        {/* Android Package Name */}
        <div>
          <label className={LABEL_STYLES.field}>
            패키지 이름 <span className="text-red-500">*</span>
          </label>
          <p className={LABEL_STYLES.fieldDesc}>
            Google Play 스토어 URL의 'id=' 이후 값입니다.
            <span className="block text-gray-400 mt-0.5">예: com.your.packagename</span>
          </p>
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="예: com.example.app"
            className={INPUT_STYLES.base}
          />
        </div>

        {/* SHA256 Fingerprints */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700">
              SHA256 인증서 지문 <span className="text-red-500">*</span>
            </label>
            <a
              href="https://help.airbridge.io/ko/developers/android-sdk-v4#%EC%97%90%EC%96%B4%EB%B8%8C%EB%A6%BF%EC%A7%80%EC%97%90-%EB%94%A5%EB%A7%81%ED%81%AC-%EC%A0%95%EB%B3%B4-%EB%93%B1%EB%A1%9D%ED%95%98%EA%B8%B0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <Code className="w-3 h-3" />
              가이드
            </a>
          </div>
          <p className={LABEL_STYLES.fieldDesc}>
            딥링크 검증에 사용됩니다. 여러 값은 쉼표(,)로 구분하세요.
          </p>
          <textarea
            value={fingerprints}
            onChange={(e) => setFingerprints(e.target.value)}
            placeholder="예: 12:3A:B4:56:C7:89:..."
            rows={2}
            className={INPUT_STYLES.textarea}
          />
        </div>

        {/* Android SDK 설정 필요 정보 */}
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
          <label className="block text-sm font-medium text-green-900 mb-2">
            Android SDK 설정 필요 정보
          </label>
          <p className="text-xs text-green-700 mb-3">
            AndroidManifest.xml의 인텐트 필터에서 host로 사용하세요.
          </p>
          <button
            onClick={() => handleCopy(sdkConfigValue, 'sdkConfig')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-green-200 rounded-lg text-sm text-gray-900 hover:bg-green-50 transition-colors"
          >
            <code className="font-mono text-sm">{sdkConfigValue}</code>
            {copySuccess === 'sdkConfig' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-green-600" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => onSubmit({
          uriScheme: uriScheme,
          packageName: packageName,
          sha256Fingerprints: fingerprints.split(',').map(f => f.trim()).filter(Boolean)
        })}
        disabled={!uriScheme || !packageName || !fingerprints}
        className={`w-full mt-6 ${uriScheme && packageName && fingerprints ? BUTTON_STYLES.primary : BUTTON_STYLES.primaryDisabled}`}
      >
        저장하고 계속하기
      </button>
    </div>
  );
}

// Deep Link Auto-Configuration Component (Chat UI에서 자동 등록)
function DeeplinkDashboardGuide({
  platform,
  data,
  appName,
  onComplete,
  isCompleted = false
}: {
  platform: 'ios' | 'android';
  data: DeeplinkDashboardData;
  appName: string;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [configStep, setConfigStep] = useState(0);
  const [isConfiguring, setIsConfiguring] = useState(true);

  // Auto-configuration simulation
  useEffect(() => {
    if (isCompleted) return;

    const steps = [
      { delay: 600, step: 1 },   // Validating deep link info
      { delay: 800, step: 2 },   // Registering URI Scheme
      { delay: 600, step: 3 },   // Configuring App Links/Universal Links
      { delay: 500, step: 4 },   // Complete
    ];

    let timeouts: NodeJS.Timeout[] = [];
    let totalDelay = 0;

    steps.forEach(({ delay, step }) => {
      totalDelay += delay;
      const timeout = setTimeout(() => {
        setConfigStep(step);
        if (step === 4) {
          setIsConfiguring(false);
          setTimeout(() => onComplete(), 600);
        }
      }, totalDelay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [onComplete, isCompleted]);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">
            {platform === 'ios' ? 'iOS' : 'Android'} 딥링크 설정 완료
          </span>
        </div>
      </div>
    );
  }

  const configSteps = [
    { label: '딥링크 정보 검증 중...', icon: '🔍' },
    { label: 'URI Scheme 등록 중...', icon: '🔗' },
    { label: platform === 'ios' ? 'Universal Links 설정 중...' : 'App Links 설정 중...', icon: '⚙️' },
    { label: '설정 완료!', icon: '✅' },
  ];

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>
        {platform === 'ios' ? '🍎' : '🤖'} {platform === 'ios' ? 'iOS' : 'Android'} 딥링크 자동 설정
      </div>

      {/* Configuration Summary */}
      <div className="space-y-3 mb-4">
        {/* URI Scheme */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">
              {platform === 'ios' ? 'iOS' : 'Android'} URI Scheme
            </span>
            {configStep >= 2 ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
          <code className="text-sm text-gray-900">{data.uriScheme}</code>
        </div>

        {/* iOS App ID */}
        {platform === 'ios' && data.appId && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">iOS App ID</span>
              {configStep >= 3 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : configStep >= 1 ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300" />
              )}
            </div>
            <code className="text-sm text-gray-900">{data.appId}</code>
          </div>
        )}

        {/* Android Package Name */}
        {platform === 'android' && data.packageName && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Package Name</span>
              {configStep >= 3 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : configStep >= 1 ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300" />
              )}
            </div>
            <code className="text-sm text-gray-900">{data.packageName}</code>
          </div>
        )}

        {/* Android SHA256 Fingerprints */}
        {platform === 'android' && data.sha256Fingerprints && data.sha256Fingerprints.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">SHA256 Fingerprints</span>
              {configStep >= 3 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : configStep >= 1 ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300" />
              )}
            </div>
            <code className="text-xs text-gray-900 break-all">
              {data.sha256Fingerprints.join(', ')}
            </code>
          </div>
        )}
      </div>

      {/* Configuration Progress */}
      <div className="pt-4 border-t border-gray-100">
        <div className="space-y-2">
          {configSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 text-sm transition-all ${
                configStep > index
                  ? 'text-green-600'
                  : configStep === index
                  ? 'text-blue-600'
                  : 'text-gray-300'
              }`}
            >
              {configStep > index ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : configStep === index ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300" />
              )}
              <span>{step.icon} {step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Deep Link SDK Setup Component
function DeeplinkSdkSetup({
  platform,
  framework,
  appName,
  uriScheme,
  onComplete,
  isCompleted = false
}: {
  platform: 'ios' | 'android';
  framework: string;
  appName: string;
  uriScheme: string;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('step1');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const schemeWithoutProtocol = uriScheme.replace('://', '');

  // iOS Setup Steps
  const iosSteps = [
    {
      id: 'step1',
      title: 'Step 1: Configure URL Types',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Navigate to the following path in Xcode:
          </p>
          <div className="p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
            [Project] → [Info] → [URL Types]
          </div>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Click the + button</li>
            <li>Enter in the URL Schemes field:</li>
          </ol>
          <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
            <code className="flex-1 text-xs text-green-400">{schemeWithoutProtocol}</code>
            <button
              onClick={() => handleCopy(schemeWithoutProtocol, 'scheme')}
              className="p-1 hover:bg-gray-700 rounded"
            >
              {copySuccess === 'scheme' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-xs text-amber-600">
            ⚠️ Enter without the :// suffix
          </p>
        </div>
      )
    },
    {
      id: 'step2',
      title: 'Step 2: Configure Associated Domains',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Navigate to the following path in Xcode:
          </p>
          <div className="p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
            [Project] → [Signing & Capabilities]
          </div>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Click + Capability</li>
            <li>Add Associated Domains</li>
            <li>Add the following domains:</li>
          </ol>
          <div className="space-y-2">
            {[
              `applinks:${appName}.airbridge.io`,
              `applinks:${appName}.abr.ge`
            ].map((domain, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                <code className="flex-1 text-xs text-green-400">{domain}</code>
                <button
                  onClick={() => handleCopy(domain, `domain${i}`)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  {copySuccess === `domain${i}` ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  // Android Setup Steps
  const androidAppLinksCode = `<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data android:scheme="http" android:host="${appName}.abr.ge" />
    <data android:scheme="https" android:host="${appName}.abr.ge" />
</intent-filter>`;

  const androidUriSchemeCode = `<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data android:scheme="${schemeWithoutProtocol}" />
</intent-filter>`;

  const androidSteps = [
    {
      id: 'step1',
      title: 'Step 1: Add App Links Intent Filter',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Add this to MainActivity in AndroidManifest.xml:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {androidAppLinksCode}
            </pre>
            <button
              onClick={() => handleCopy(androidAppLinksCode, 'applinks')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'applinks' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'step2',
      title: 'Step 2: Add URI Scheme Intent Filter',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Add as a <span className="text-red-500 font-medium">separate</span> intent-filter tag:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {androidUriSchemeCode}
            </pre>
            <button
              onClick={() => handleCopy(androidUriSchemeCode, 'urischeme')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'urischeme' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              ⚠️ Important: Always use separate intent-filter tags!
            </p>
          </div>
        </div>
      )
    }
  ];

  const steps = platform === 'ios' ? iosSteps : androidSteps;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Setup Guide</div>
        <div className="text-xs text-gray-400">Setup Complete</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="text-sm font-medium text-gray-900 mb-4">
        {platform === 'ios' ? '🍎' : '🤖'} {platform === 'ios' ? 'iOS' : 'Android'} SDK Setup
        <span className="ml-2 text-xs font-normal text-gray-500">({framework})</span>
      </div>

      {/* Steps Accordion */}
      <div className="space-y-2 mb-4">
        {steps.map((step) => (
          <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === step.id ? null : step.id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{step.title}</span>
              {expandedSection === step.id ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSection === step.id && (
              <div className="p-3 border-t border-gray-200">
                {step.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
        <div className="text-xs font-medium text-blue-700 mb-2">✅ Verification Checklist</div>
        <div className="space-y-1 text-xs text-blue-600">
          {platform === 'ios' ? (
            <>
              <div>☐ URL scheme entered in URL Types</div>
              <div>☐ Domains added to Associated Domains</div>
            </>
          ) : (
            <>
              <div>☐ autoVerify="true" set in App Links intent-filter</div>
              <div>☐ URI Scheme intent-filter added separately</div>
            </>
          )}
        </div>
      </div>

      {/* Complete Button */}
      <button
        onClick={onComplete}
        className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
      >
        SDK Setup Complete
      </button>
    </div>
  );
}

// Deep Link Test Checklist Component
function DeeplinkTestChecklist({
  onReady,
  isCompleted = false
}: {
  onReady: () => void;
  isCompleted?: boolean;
}) {
  const [checks, setChecks] = useState({
    device: false,
    appInstalled: false,
    browser: false,
    network: false
  });

  const allChecked = Object.values(checks).every(Boolean);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Test Preparation</div>
        <div className="text-xs text-gray-400">Ready</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="text-sm font-medium text-gray-900 mb-4">📋 Pre-Test Checklist</div>

      <div className="space-y-3 mb-4">
        {[
          { id: 'device', label: 'Test device ready (physical device recommended)' },
          { id: 'appInstalled', label: 'App installed and launched at least once' },
          { id: 'browser', label: 'Default browser set to Chrome (Android) or Safari (iOS)' },
          { id: 'network', label: 'Stable network connection' }
        ].map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <input
              type="checkbox"
              checked={checks[item.id as keyof typeof checks]}
              onChange={(e) => setChecks(prev => ({ ...prev, [item.id]: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={onReady}
        disabled={!allChecked}
        className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
          allChecked
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Start Test
      </button>
    </div>
  );
}

// Deep Link Test Scenarios Component
function DeeplinkTestScenarios({
  appName,
  platforms,
  onComplete,
  isCompleted = false
}: {
  appName: string;
  platforms: string[];
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'passed' | 'failed'>>({
    '1-1': 'pending',
    '1-2': 'pending',
    '2': 'pending'
  });

  const scenarios = [
    {
      id: '1-1',
      name: 'Scenario 1-1',
      appState: 'Installed',
      description: 'URI Scheme Deep Link Test'
    },
    {
      id: '1-2',
      name: 'Scenario 1-2',
      appState: 'Installed',
      description: platforms.includes('ios') ? 'Universal Links Test' : 'App Links Test'
    },
    {
      id: '2',
      name: 'Scenario 2',
      appState: 'Not Installed',
      description: 'Deferred Deep Linking Test'
    }
  ];

  const handleResult = (scenarioId: string, result: 'passed' | 'failed') => {
    setTestResults(prev => ({ ...prev, [scenarioId]: result }));
  };

  const allTested = Object.values(testResults).every(r => r !== 'pending');

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Deep Link Test</div>
        <div className="text-xs text-gray-400">Test Complete</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="text-sm font-medium text-gray-900 mb-4">🧪 Deep Link Test</div>

      {/* Test Link Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="text-xs font-medium text-blue-800 mb-2">📱 테스트 링크</div>
        <code className="text-xs text-blue-700 break-all block bg-white p-2 rounded">
          https://{appName}.abr.ge/test
        </code>
        <p className="text-xs text-blue-600 mt-2">
          위 링크를 디바이스에서 클릭하여 각 시나리오를 테스트하세요.
        </p>
      </div>

      {/* Test Scenarios */}
      <div className="space-y-3 mb-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`p-3 border rounded-lg ${
              testResults[scenario.id] === 'passed'
                ? 'border-green-200 bg-green-50'
                : testResults[scenario.id] === 'failed'
                ? 'border-red-200 bg-red-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-900">{scenario.name}</span>
                <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                  App {scenario.appState}
                </span>
              </div>
              {testResults[scenario.id] !== 'pending' && (
                <span className={`text-xs font-medium ${
                  testResults[scenario.id] === 'passed' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {testResults[scenario.id] === 'passed' ? '✓ Passed' : '✗ Failed'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-2">{scenario.description}</p>

            {testResults[scenario.id] === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleResult(scenario.id, 'passed')}
                  className="flex-1 py-1.5 text-xs font-medium text-green-600 bg-green-100 rounded hover:bg-green-200 transition-colors"
                >
                  Pass
                </button>
                <button
                  onClick={() => handleResult(scenario.id, 'failed')}
                  className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 transition-colors"
                >
                  Fail
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Help for Failed Tests */}
      {Object.values(testResults).some(r => r === 'failed') && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <div className="text-xs font-medium text-amber-700 mb-2">⚠️ 테스트 실패 시 확인사항:</div>
          <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
            <li>딥링크 설정 정보가 정확한지 확인</li>
            <li>SDK 설정이 올바른지 확인</li>
            <li>앱 서명 키스토어가 올바른지 확인 (Android)</li>
          </ul>
        </div>
      )}

      {/* Complete Button */}
      <button
        onClick={onComplete}
        disabled={!allTested}
        className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
          allTested
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Complete Test
      </button>
    </div>
  );
}

// Deep Link Complete Component
function DeeplinkComplete({
  onCreateTrackingLink,
  onContinue,
  isCompleted = false
}: {
  onCreateTrackingLink: () => void;
  onContinue: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Deep Link Setup Complete</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">🎉</div>
        <div className="text-lg font-medium text-gray-900">Deep Link Setup Complete!</div>
        <p className="text-sm text-gray-500 mt-1">
          You can now apply deep links to your tracking links
        </p>
      </div>

      {/* Stopover Airpage Info */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
        <div className="text-xs font-medium text-blue-700 mb-2">💡 Stopover Airpage Option Guide</div>
        <div className="text-xs text-blue-600 space-y-1">
          <div><strong>UA Campaigns:</strong> Recommended to disable (unnecessary popups may reduce conversion)</div>
          <div><strong>Retargeting:</strong> Recommended to enable (ensures accurate deep link routing on iOS)</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onCreateTrackingLink}
          className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Create Tracking Link
        </button>
        <button
          onClick={onContinue}
          className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Continue to Channel Integration
        </button>
      </div>
    </div>
  );
}

// SDK Verify Component
function SDKVerify({ onConfirm, isCompleted = false }: { onConfirm: (status: string) => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Verification</div>
        <div className="text-xs text-gray-400">Verification completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>SDK Verification</div>

      <a
        href="https://dashboard.airbridge.io/logs"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors mb-4"
      >
        <ExternalLink className="w-4 h-4" />
        Open Real-time Logs
      </a>

      <div className="text-sm text-gray-600 mb-3">Events to check:</div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 border-2 border-gray-300 rounded" />
          <span>Install event</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 border-2 border-gray-300 rounded" />
          <span>Open event</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="text-sm text-gray-600 mb-3">Do you see the events?</div>
        <div className="space-y-2">
          {[
            { label: 'Yes, I see them!', value: 'yes' },
            { label: 'No, I don\'t see them', value: 'no' },
            { label: 'I\'m not sure', value: 'unsure' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => onConfirm(option.value)}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <Circle className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Channel Select Component
function ChannelSelect({ onSelect, isCompleted = false }: { onSelect: (channels: string[]) => void; isCompleted?: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Ad Channel Selection</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  const channels = [
    { category: 'SAN (Self-Attributing Networks)', items: [
      { id: 'meta', label: 'Meta Ads (Facebook/Instagram)' },
      { id: 'google', label: 'Google Ads' },
      { id: 'apple', label: 'Apple Search Ads' },
      { id: 'tiktok', label: 'TikTok For Business' },
    ]},
    { category: 'Other Channels', items: [
      { id: 'criteo', label: 'Criteo' },
      { id: 'unity', label: 'Unity Ads' },
      { id: 'applovin', label: 'AppLovin' },
    ]},
  ];

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter((c: string) => c !== id) : [...prev, id]);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>Select Ad Channels to Integrate (multiple selection allowed)</div>

      {channels.map(group => (
        <div key={group.category} className="mb-4 last:mb-0">
          <div className={LABEL_STYLES.fieldDesc}>{group.category}</div>
          <div className="space-y-2">
            {group.items.map(item => {
              const isSelected = selected.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-gray-900">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={() => selected.length > 0 && onSelect(selected)}
        disabled={selected.length === 0}
        className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${selected.length > 0 ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Channel Integration Overview Component
function ChannelIntegrationOverview({
  selectedChannels,
  onStart,
  isCompleted = false
}: {
  selectedChannels: string[];
  onStart: () => void;
  isCompleted?: boolean
}) {
  const channelInfo: Record<string, { name: string; icon: string; color: string }> = {
    meta: { name: 'Meta Ads', icon: '📘', color: 'bg-blue-100 text-blue-800' },
    google: { name: 'Google Ads', icon: '🔵', color: 'bg-red-100 text-red-800' },
    apple: { name: 'Apple Search Ads', icon: '🍎', color: 'bg-gray-100 text-gray-800' },
    tiktok: { name: 'TikTok For Business', icon: '🎵', color: 'bg-pink-100 text-pink-800' },
    criteo: { name: 'Criteo', icon: '🟠', color: 'bg-orange-100 text-orange-800' },
    unity: { name: 'Unity Ads', icon: '🎮', color: 'bg-purple-100 text-purple-800' },
    applovin: { name: 'AppLovin', icon: '📱', color: 'bg-green-100 text-green-800' },
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Channel Integration</div>
        <div className="text-xs text-gray-400">Setup started</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>Selected Channels for Integration</div>

      <div className="space-y-2 mb-4">
        {selectedChannels.map((channelId, index) => {
          const info = channelInfo[channelId] || { name: channelId, icon: '📺', color: 'bg-gray-100 text-gray-800' };
          return (
            <div key={channelId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">{info.icon}</span>
              <span className="flex-1 text-sm font-medium text-gray-900">{info.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${info.color}`}>
                {index === 0 ? 'Starting' : `#${index + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Each channel has 3 integration steps:</p>
            <ul className="space-y-0.5">
              <li>1. Channel Integration (Required) - Attribution setup</li>
              <li>2. Cost Integration (Recommended) - Ad spend data</li>
              <li>3. SKAN Integration (iOS Required) - iOS 14.5+ support</li>
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className={BUTTON_STYLES.secondary}
      >
        Start Integration <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Channel Progress Component
function ChannelProgress({
  channel,
  steps,
  hasIOS,
  currentStep,
  isCompleted = false
}: {
  channel: string;
  steps: ChannelStep[];
  hasIOS: boolean;
  currentStep: 'channel' | 'cost' | 'skan';
  isCompleted?: boolean;
}) {
  const channelNames: Record<string, string> = {
    meta: 'Meta Ads',
    google: 'Google Ads',
    apple: 'Apple Search Ads',
    tiktok: 'TikTok For Business',
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = hasIOS ? 3 : 2;
  const progress = (completedSteps / totalSteps) * 100;

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500">{channelNames[channel] || channel} Progress</div>
        <div className="text-xs text-gray-400 mt-1">Viewing progress</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">{channelNames[channel] || channel} Integration</div>
        <span className="text-xs text-gray-500">{completedSteps}/{totalSteps} completed</span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step) => {
          if (step.id === 'skan' && !hasIOS) return null;

          const isActive = step.id === currentStep;
          const statusStyles = {
            completed: 'bg-green-100 border-green-300',
            in_progress: 'bg-blue-100 border-blue-300',
            pending: 'bg-gray-50 border-gray-200',
            skipped: 'bg-gray-50 border-gray-200 opacity-50',
          };

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${statusStyles[step.status]} ${isActive ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step.status === 'completed' ? 'bg-green-500' :
                step.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                {step.status === 'completed' ? (
                  <Check className="w-4 h-4 text-white" />
                ) : step.status === 'in_progress' ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{step.label}</div>
                <div className="text-xs text-gray-500">
                  {step.required ? 'Required' : 'Recommended'}
                  {step.id === 'skan' && ' for iOS'}
                </div>
              </div>
              {step.status === 'skipped' && (
                <span className="text-xs text-gray-400">Skipped</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Meta Channel Integration Component
function MetaChannelIntegration({
  onComplete,
  onHelp,
  isCompleted = false
}: {
  onComplete: () => void;
  onHelp: (issue: string) => void;
  isCompleted?: boolean;
}) {
  const [metaAppId, setMetaAppId] = useState('');
  const [step, setStep] = useState<'input' | 'connect' | 'connecting' | 'done'>('input');
  const [connectStep, setConnectStep] = useState(0);

  const connectSteps = [
    { label: 'Meta 로그인 창 열기...', icon: '🔐' },
    { label: 'Facebook 계정 인증 중...', icon: '👤' },
    { label: '광고 계정 연결 중...', icon: '📊' },
    { label: '권한 설정 완료!', icon: '✅' },
  ];

  const startOAuthSimulation = () => {
    setStep('connecting');
    setConnectStep(0);

    const timeouts = [
      setTimeout(() => setConnectStep(1), 800),
      setTimeout(() => setConnectStep(2), 1600),
      setTimeout(() => setConnectStep(3), 2400),
      setTimeout(() => {
        setConnectStep(4);
        setStep('done');
        setTimeout(() => onComplete(), 500);
      }, 3200),
    ];

    return () => timeouts.forEach(clearTimeout);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Meta Channel Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📘</span>
        <div className="text-sm font-medium text-gray-700">Meta Ads - Channel Integration</div>
      </div>

      {step === 'input' && (
        <>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Meta App ID</label>
            <input
              type="text"
              value={metaAppId}
              onChange={e => setMetaAppId(e.target.value)}
              placeholder="Enter your Meta App ID"
              className={INPUT_STYLES.base}
            />
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              Find your Meta App ID <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={() => metaAppId && setStep('connect')}
            disabled={!metaAppId}
            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${metaAppId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {step === 'connect' && (
        <>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                Meta 계정과 연동하면 광고 성과 데이터를 Airbridge에서 확인할 수 있습니다.
                아래 버튼을 클릭하면 Meta OAuth 인증이 시작됩니다.
              </div>
            </div>
          </div>

          <button
            onClick={startOAuthSimulation}
            className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#166FE5] mb-3"
          >
            <span>f</span> Connect with Meta
          </button>

          <button
            onClick={() => onHelp('meta-permission')}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
          >
            연동에 문제가 있나요?
          </button>
        </>
      )}

      {step === 'connecting' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Meta 계정 연동 중...</div>
          {connectSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                connectStep > idx ? 'bg-green-100' : connectStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {connectStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                connectStep > idx ? 'text-green-600' : connectStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {connectStep === idx && idx < 3 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">Meta 연동 완료!</div>
          <div className="text-xs text-gray-500 mt-1">광고 계정이 성공적으로 연결되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// Meta Cost Integration Component
function MetaCostIntegration({
  onComplete,
  onSkip,
  isCompleted = false
}: {
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'enabling' | 'done'>('intro');
  const [enableStep, setEnableStep] = useState(0);

  const enableSteps = [
    { label: 'Cost Integration 활성화 중...', icon: '💰' },
    { label: '광고 비용 데이터 권한 요청 중...', icon: '📊' },
    { label: '설정 완료!', icon: '✅' },
  ];

  const startEnabling = () => {
    setStep('enabling');
    setEnableStep(0);

    setTimeout(() => setEnableStep(1), 600);
    setTimeout(() => setEnableStep(2), 1200);
    setTimeout(() => {
      setEnableStep(3);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 1800);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Meta Cost Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📘</span>
        <div className="text-sm font-medium text-gray-700">Meta Ads - Cost Integration</div>
        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Recommended</span>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                Cost Integration을 활성화하면 광고 비용 데이터를 Airbridge 리포트에서 직접 확인할 수 있습니다.
                ROI와 ROAS 계산에 활용됩니다.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startEnabling}
              className="flex-1 py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              Enable Cost Integration
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          </div>
        </>
      )}

      {step === 'enabling' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Cost Integration 설정 중...</div>
          {enableSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                enableStep > idx ? 'bg-green-100' : enableStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {enableStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                enableStep > idx ? 'text-green-600' : enableStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {enableStep === idx && idx < 2 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">Cost Integration 완료!</div>
          <div className="text-xs text-gray-500 mt-1">광고 비용 데이터가 연동되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// Meta SKAN Integration Component
function MetaSkanIntegration({
  onComplete,
  onSkip,
  isCompleted = false
}: {
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'configuring' | 'done'>('intro');
  const [configStep, setConfigStep] = useState(0);

  const configSteps = [
    { label: 'SKAN 설정 확인 중...', icon: '📋' },
    { label: 'Conversion Value 설정 중...', icon: '🔢' },
    { label: 'Meta Postback 연결 중...', icon: '🔗' },
    { label: '설정 완료!', icon: '✅' },
  ];

  const startConfiguring = () => {
    setStep('configuring');
    setConfigStep(0);

    setTimeout(() => setConfigStep(1), 600);
    setTimeout(() => setConfigStep(2), 1200);
    setTimeout(() => setConfigStep(3), 1800);
    setTimeout(() => {
      setConfigStep(4);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 2400);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Meta SKAN Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📘</span>
        <div className="text-sm font-medium text-gray-700">Meta Ads - SKAN Integration</div>
        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">iOS Required</span>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-amber-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                SKAN (SKAdNetwork)은 iOS 14.5+ 사용자 어트리뷰션에 필수입니다.
                이 설정 없이는 추적 거부 사용자의 전환을 측정할 수 없습니다.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startConfiguring}
              className="flex-1 py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              Configure SKAN
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          </div>
        </>
      )}

      {step === 'configuring' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">SKAN 설정 중...</div>
          {configSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                configStep > idx ? 'bg-green-100' : configStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {configStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                configStep > idx ? 'text-green-600' : configStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {configStep === idx && idx < 3 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">SKAN 설정 완료!</div>
          <div className="text-xs text-gray-500 mt-1">iOS 어트리뷰션이 활성화되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// Google Channel Integration Component
function GoogleChannelIntegration({
  onComplete,
  onHelp,
  isCompleted = false
}: {
  onComplete: () => void;
  onHelp: (issue: string) => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'connecting' | 'done'>('intro');
  const [connectStep, setConnectStep] = useState(0);

  const connectSteps = [
    { label: 'Google 로그인 창 열기...', icon: '🔐' },
    { label: 'Google 계정 인증 중...', icon: '👤' },
    { label: 'Google Ads 계정 연결 중...', icon: '📊' },
    { label: '연결 완료!', icon: '✅' },
  ];

  const startOAuthSimulation = () => {
    setStep('connecting');
    setConnectStep(0);

    setTimeout(() => setConnectStep(1), 800);
    setTimeout(() => setConnectStep(2), 1600);
    setTimeout(() => setConnectStep(3), 2400);
    setTimeout(() => {
      setConnectStep(4);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 3200);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Google Channel Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔵</span>
        <div className="text-sm font-medium text-gray-700">Google Ads - Channel Integration</div>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                Google Ads 계정과 연동하면 광고 캠페인 성과를 Airbridge에서 확인할 수 있습니다.
              </div>
            </div>
          </div>

          <button
            onClick={startOAuthSimulation}
            className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connect with Google
          </button>

          <button
            onClick={() => onHelp('google-permission')}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
          >
            연동에 문제가 있나요?
          </button>
        </>
      )}

      {step === 'connecting' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Google 계정 연동 중...</div>
          {connectSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                connectStep > idx ? 'bg-green-100' : connectStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {connectStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                connectStep > idx ? 'text-green-600' : connectStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {connectStep === idx && idx < 3 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">Google Ads 연동 완료!</div>
          <div className="text-xs text-gray-500 mt-1">광고 계정이 성공적으로 연결되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// Google Cost Integration Component
function GoogleCostIntegration({
  onComplete,
  onSkip,
  isCompleted = false
}: {
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'enabling' | 'done'>('intro');
  const [enableStep, setEnableStep] = useState(0);

  const enableSteps = [
    { label: 'Cost Integration 활성화 중...', icon: '💰' },
    { label: 'Google Ads 비용 데이터 연결 중...', icon: '📊' },
    { label: '설정 완료!', icon: '✅' },
  ];

  const startEnabling = () => {
    setStep('enabling');
    setEnableStep(0);

    setTimeout(() => setEnableStep(1), 600);
    setTimeout(() => setEnableStep(2), 1200);
    setTimeout(() => {
      setEnableStep(3);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 1800);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Google Cost Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔵</span>
        <div className="text-sm font-medium text-gray-700">Google Ads - Cost Integration</div>
        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Recommended</span>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                Google Ads 비용 데이터를 Airbridge에서 직접 확인하고 ROI를 계산할 수 있습니다.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startEnabling}
              className="flex-1 py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              Enable Cost Integration
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          </div>
        </>
      )}

      {step === 'enabling' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Cost Integration 설정 중...</div>
          {enableSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                enableStep > idx ? 'bg-green-100' : enableStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {enableStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                enableStep > idx ? 'text-green-600' : enableStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {enableStep === idx && idx < 2 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">Cost Integration 완료!</div>
          <div className="text-xs text-gray-500 mt-1">Google Ads 비용 데이터가 연동되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// Google SKAN Integration Component
function GoogleSkanIntegration({
  onComplete,
  onSkip,
  isCompleted = false
}: {
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'configuring' | 'done'>('intro');
  const [configStep, setConfigStep] = useState(0);

  const configSteps = [
    { label: 'SKAN 설정 확인 중...', icon: '📋' },
    { label: 'Conversion Value 설정 중...', icon: '🔢' },
    { label: 'Google Postback 연결 중...', icon: '🔗' },
    { label: '설정 완료!', icon: '✅' },
  ];

  const startConfiguring = () => {
    setStep('configuring');
    setConfigStep(0);

    setTimeout(() => setConfigStep(1), 600);
    setTimeout(() => setConfigStep(2), 1200);
    setTimeout(() => setConfigStep(3), 1800);
    setTimeout(() => {
      setConfigStep(4);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 2400);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Google SKAN Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔵</span>
        <div className="text-sm font-medium text-gray-700">Google Ads - SKAN Integration</div>
        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">iOS Required</span>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-amber-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                iOS 14.5+ 추적 거부 사용자의 어트리뷰션 측정에 필요합니다.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startConfiguring}
              className="flex-1 py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              Configure SKAN
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          </div>
        </>
      )}

      {step === 'configuring' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">SKAN 설정 중...</div>
          {configSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                configStep > idx ? 'bg-green-100' : configStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {configStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                configStep > idx ? 'text-green-600' : configStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {configStep === idx && idx < 3 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">SKAN 설정 완료!</div>
          <div className="text-xs text-gray-500 mt-1">Google Ads iOS 어트리뷰션이 활성화되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// Apple Version Check Component
function AppleVersionCheck({
  onAdvanced,
  onBasic,
  onHelp,
  isCompleted = false
}: {
  onAdvanced: () => void;
  onBasic: () => void;
  onHelp: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Apple Search Ads Version</div>
        <div className="text-xs text-gray-400">Version confirmed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🍎</span>
        <div className="text-sm font-medium text-gray-700">Apple Search Ads - Version Check</div>
      </div>

      <div className="bg-amber-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium">Important: Airbridge only supports Apple Search Ads Advanced.</p>
            <p className="mt-1">Basic version does not provide the API needed for integration.</p>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">Which version of Apple Search Ads are you using?</div>

      <div className="space-y-2">
        <button
          onClick={onAdvanced}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Advanced</div>
            <div className="text-xs text-gray-500">Campaign Management API available. Supported by Airbridge.</div>
          </div>
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Supported</span>
        </button>

        <button
          onClick={onBasic}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Basic</div>
            <div className="text-xs text-gray-500">No API access. Cannot integrate with Airbridge.</div>
          </div>
          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">Not Supported</span>
        </button>
      </div>

      <button
        onClick={onHelp}
        className="w-full mt-3 py-2 rounded-lg font-medium transition-colors text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        I'm not sure which version I have
      </button>
    </div>
  );
}

// Apple Channel Integration Component
function AppleChannelIntegration({
  onComplete,
  onHelp,
  isCompleted = false
}: {
  onComplete: () => void;
  onHelp: (issue: string) => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'connecting' | 'done'>('intro');
  const [connectStep, setConnectStep] = useState(0);

  const connectSteps = [
    { label: 'Apple Search Ads API 연결 중...', icon: '🔐' },
    { label: 'API 인증서 확인 중...', icon: '📜' },
    { label: '캠페인 데이터 동기화 중...', icon: '📊' },
    { label: '연결 완료!', icon: '✅' },
  ];

  const startOAuthSimulation = () => {
    setStep('connecting');
    setConnectStep(0);

    setTimeout(() => setConnectStep(1), 800);
    setTimeout(() => setConnectStep(2), 1600);
    setTimeout(() => setConnectStep(3), 2400);
    setTimeout(() => {
      setConnectStep(4);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 3200);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Apple Channel Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🍎</span>
        <div className="text-sm font-medium text-gray-700">Apple Search Ads - Channel Integration</div>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                Apple Search Ads 계정과 연동하면 앱스토어 검색 광고 성과를 Airbridge에서 확인할 수 있습니다.
              </div>
            </div>
          </div>

          <button
            onClick={startOAuthSimulation}
            className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 mb-3"
          >
            <span>🍎</span> Connect with Apple Search Ads
          </button>

          <button
            onClick={() => onHelp('apple-api')}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
          >
            연동에 문제가 있나요?
          </button>
        </>
      )}

      {step === 'connecting' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Apple Search Ads 연동 중...</div>
          {connectSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                connectStep > idx ? 'bg-green-100' : connectStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {connectStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                connectStep > idx ? 'text-green-600' : connectStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {connectStep === idx && idx < 3 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">Apple Search Ads 연동 완료!</div>
          <div className="text-xs text-gray-500 mt-1">광고 계정이 성공적으로 연결되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// Apple Cost Integration Component
function AppleCostIntegration({
  onComplete,
  onSkip,
  isCompleted = false
}: {
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'enabling' | 'done'>('intro');
  const [enableStep, setEnableStep] = useState(0);

  const enableSteps = [
    { label: 'Cost Integration 활성화 중...', icon: '💰' },
    { label: 'Apple Search Ads 비용 데이터 연결 중...', icon: '📊' },
    { label: '설정 완료!', icon: '✅' },
  ];

  const startEnabling = () => {
    setStep('enabling');
    setEnableStep(0);

    setTimeout(() => setEnableStep(1), 600);
    setTimeout(() => setEnableStep(2), 1200);
    setTimeout(() => {
      setEnableStep(3);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 1800);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Apple Cost Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🍎</span>
        <div className="text-sm font-medium text-gray-700">Apple Search Ads - Cost Integration</div>
        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Recommended</span>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                Apple Search Ads 비용 데이터를 Airbridge에서 확인하고 ROI를 분석할 수 있습니다.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startEnabling}
              className="flex-1 py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              Enable Cost Integration
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          </div>
        </>
      )}

      {step === 'enabling' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Cost Integration 설정 중...</div>
          {enableSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                enableStep > idx ? 'bg-green-100' : enableStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {enableStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                enableStep > idx ? 'text-green-600' : enableStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {enableStep === idx && idx < 2 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">Cost Integration 완료!</div>
          <div className="text-xs text-gray-500 mt-1">Apple Search Ads 비용 데이터가 연동되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// TikTok Channel Integration Component
function TikTokChannelIntegration({
  onComplete,
  onHelp,
  isCompleted = false
}: {
  onComplete: () => void;
  onHelp: (issue: string) => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'connecting' | 'done'>('intro');
  const [connectStep, setConnectStep] = useState(0);

  const connectSteps = [
    { label: 'TikTok 로그인 창 열기...', icon: '🔐' },
    { label: 'TikTok 계정 인증 중...', icon: '👤' },
    { label: '광고 계정 연결 중...', icon: '📊' },
    { label: '연결 완료!', icon: '✅' },
  ];

  const startOAuthSimulation = () => {
    setStep('connecting');
    setConnectStep(0);

    setTimeout(() => setConnectStep(1), 800);
    setTimeout(() => setConnectStep(2), 1600);
    setTimeout(() => setConnectStep(3), 2400);
    setTimeout(() => {
      setConnectStep(4);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 3200);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">TikTok Channel Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎵</span>
        <div className="text-sm font-medium text-gray-700">TikTok For Business - Channel Integration</div>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-amber-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">참고 사항:</p>
                <ul className="space-y-1">
                  <li>• Pangle 성과는 리포트에서 "Sub-Publisher" GroupBy 필요</li>
                  <li>• EPC 활성화 시 데이터 누락 가능</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={startOAuthSimulation}
            className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 mb-3"
          >
            <span>🎵</span> Connect with TikTok
          </button>

          <button
            onClick={() => onHelp('tiktok-permission')}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
          >
            연동에 문제가 있나요?
          </button>
        </>
      )}

      {step === 'connecting' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">TikTok 계정 연동 중...</div>
          {connectSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                connectStep > idx ? 'bg-green-100' : connectStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {connectStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                connectStep > idx ? 'text-green-600' : connectStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {connectStep === idx && idx < 3 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">TikTok 연동 완료!</div>
          <div className="text-xs text-gray-500 mt-1">광고 계정이 성공적으로 연결되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// TikTok Cost Integration Component
function TikTokCostIntegration({
  onComplete,
  onSkip,
  isCompleted = false
}: {
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'enabling' | 'done'>('intro');
  const [enableStep, setEnableStep] = useState(0);

  const enableSteps = [
    { label: 'Cost Integration 활성화 중...', icon: '💰' },
    { label: 'TikTok 비용 데이터 연결 중...', icon: '📊' },
    { label: '설정 완료!', icon: '✅' },
  ];

  const startEnabling = () => {
    setStep('enabling');
    setEnableStep(0);

    setTimeout(() => setEnableStep(1), 600);
    setTimeout(() => setEnableStep(2), 1200);
    setTimeout(() => {
      setEnableStep(3);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 1800);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">TikTok Cost Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎵</span>
        <div className="text-sm font-medium text-gray-700">TikTok For Business - Cost Integration</div>
        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Recommended</span>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                TikTok 광고 비용 데이터를 Airbridge에서 확인하고 캠페인 ROI를 분석할 수 있습니다.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startEnabling}
              className="flex-1 py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              Enable Cost Integration
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          </div>
        </>
      )}

      {step === 'enabling' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Cost Integration 설정 중...</div>
          {enableSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                enableStep > idx ? 'bg-green-100' : enableStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {enableStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                enableStep > idx ? 'text-green-600' : enableStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {enableStep === idx && idx < 2 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">Cost Integration 완료!</div>
          <div className="text-xs text-gray-500 mt-1">TikTok 비용 데이터가 연동되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// TikTok SKAN Integration Component
function TikTokSkanIntegration({
  onComplete,
  onSkip,
  isCompleted = false
}: {
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [step, setStep] = useState<'intro' | 'configuring' | 'done'>('intro');
  const [configStep, setConfigStep] = useState(0);

  const configSteps = [
    { label: 'SKAN 설정 확인 중...', icon: '📋' },
    { label: 'Conversion Value 설정 중...', icon: '🔢' },
    { label: 'TikTok Postback 연결 중...', icon: '🔗' },
    { label: '설정 완료!', icon: '✅' },
  ];

  const startConfiguring = () => {
    setStep('configuring');
    setConfigStep(0);

    setTimeout(() => setConfigStep(1), 600);
    setTimeout(() => setConfigStep(2), 1200);
    setTimeout(() => setConfigStep(3), 1800);
    setTimeout(() => {
      setConfigStep(4);
      setStep('done');
      setTimeout(() => onComplete(), 500);
    }, 2400);
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">TikTok SKAN Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎵</span>
        <div className="text-sm font-medium text-gray-700">TikTok For Business - SKAN Integration</div>
        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">iOS Required</span>
      </div>

      {step === 'intro' && (
        <>
          <div className="bg-amber-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                TikTok 캠페인의 iOS 14.5+ 어트리뷰션에 필요합니다.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startConfiguring}
              className="flex-1 py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              Configure SKAN
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          </div>
        </>
      )}

      {step === 'configuring' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">SKAN 설정 중...</div>
          {configSteps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                configStep > idx ? 'bg-green-100' : configStep === idx ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {configStep > idx ? '✓' : s.icon}
              </div>
              <span className={`text-sm ${
                configStep > idx ? 'text-green-600' : configStep === idx ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {configStep === idx && idx < 3 && (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">SKAN 설정 완료!</div>
          <div className="text-xs text-gray-500 mt-1">TikTok iOS 어트리뷰션이 활성화되었습니다.</div>
        </div>
      )}
    </div>
  );
}

// Channel Completion Component
function ChannelCompletion({
  channel,
  onNext,
  isLastChannel,
  isCompleted = false
}: {
  channel: string;
  onNext: () => void;
  isLastChannel: boolean;
  isCompleted?: boolean;
}) {
  const channelNames: Record<string, string> = {
    meta: 'Meta Ads',
    google: 'Google Ads',
    apple: 'Apple Search Ads',
    tiktok: 'TikTok For Business',
  };

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500">{channelNames[channel]} Setup</div>
        <div className="text-xs text-gray-400 mt-1">Completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-emerald-600">
        <CheckCircle2 className="w-6 h-6" />
        {channelNames[channel] || channel} Integration Complete!
      </div>

      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700">
          You've successfully set up {channelNames[channel] || channel}. Attribution data will start appearing in your reports soon.
        </p>
      </div>

      <button
        onClick={onNext}
        className={BUTTON_STYLES.secondary}
      >
        {isLastChannel ? 'Complete Setup' : 'Continue to Next Channel'} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Token Display Component
function TokenDisplay({ tokens, onContinue, isCompleted = false }: { tokens: { appSdkToken: string; webSdkToken: string; apiToken: string }; onContinue: () => void; isCompleted?: boolean }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">API Tokens</div>
        <div className="text-xs text-gray-400">Token confirmation completed</div>
      </div>
    );
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const TokenRow = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className="text-base font-mono text-gray-800 truncate">{value}</div>
      </div>
      <button
        onClick={() => copyToClipboard(value, field)}
        className={`ml-4 p-3 rounded-lg transition-colors flex-shrink-0 ${copiedField === field ? 'bg-green-100' : 'bg-gray-100'}`}
      >
        {copiedField === field ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Copy className="w-5 h-5 text-gray-500" />
        )}
      </button>
    </div>
  );

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-emerald-600">
        <CheckCircle2 className="w-6 h-6" />
        App Registration Complete!
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Your app has been registered. Here are your API tokens:
      </p>

      <div className="space-y-3">
        <TokenRow label="App SDK Token" value={tokens.appSdkToken} field="appSdk" />
        <TokenRow label="Web SDK Token" value={tokens.webSdkToken} field="webSdk" />
        <TokenRow label="API Token" value={tokens.apiToken} field="api" />
      </div>

      <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-lg bg-amber-100">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span className="text-xs text-amber-800">Please store these tokens securely. They provide access to your app data.</span>
      </div>

      <button
        onClick={onContinue}
        className="w-full mt-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
      >
        Continue to SDK Setup <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Standard Event Select Component
function StandardEventSelect({
  onSelect,
  isCompleted = false
}: {
  onSelect: (events: string[]) => void;
  isCompleted?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(['install', 'open']);

  const standardEvents = [
    { category: 'Lifecycle (Auto-tracked)', items: [
      { id: 'install', name: 'Install', description: 'App installation', auto: true },
      { id: 'open', name: 'Open', description: 'App open/launch', auto: true },
    ]},
    { category: 'User Authentication', items: [
      { id: 'signup', name: 'Sign Up', description: 'Account registration' },
      { id: 'signin', name: 'Sign In', description: 'User login' },
    ]},
    { category: 'E-commerce', items: [
      { id: 'view_product', name: 'View Product', description: 'Product page view' },
      { id: 'add_to_cart', name: 'Add to Cart', description: 'Item added to cart' },
      { id: 'purchase', name: 'Purchase', description: 'Completed purchase' },
    ]},
    { category: 'Engagement', items: [
      { id: 'view_content', name: 'View Content', description: 'Content viewed' },
      { id: 'search', name: 'Search', description: 'Search performed' },
      { id: 'share', name: 'Share', description: 'Content shared' },
    ]},
  ];

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Standard Events</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  const toggle = (id: string, auto?: boolean) => {
    if (auto) return;
    setSelected(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className={LABEL_STYLES.title}>Select Standard Events to Track</div>

      {standardEvents.map(group => (
        <div key={group.category} className="mb-4 last:mb-0">
          <div className={LABEL_STYLES.fieldDesc}>{group.category}</div>
          <div className="space-y-2">
            {group.items.map(item => {
              const isSelected = selected.includes(item.id);
              const isAuto = 'auto' in item && item.auto;
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id, isAuto)}
                  disabled={isAuto}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  } ${isAuto ? 'opacity-75 cursor-default' : 'hover:border-purple-300'}`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-purple-500 border-purple-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{item.name}</span>
                      {isAuto && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded">Auto</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={() => onSelect(selected)}
        className="w-full mt-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Custom Event Input Component
function CustomEventInput({
  onAdd,
  onSkip,
  isCompleted = false
}: {
  onAdd: (events: { name: string; category: string }[]) => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [events, setEvents] = useState<{ name: string; category: string }[]>([]);
  const [newEventName, setNewEventName] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('engagement');

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Custom Events</div>
        <div className="text-xs text-gray-400">Configuration completed</div>
      </div>
    );
  }

  const addEvent = () => {
    if (newEventName.trim()) {
      setEvents([...events, { name: newEventName.trim(), category: newEventCategory }]);
      setNewEventName('');
    }
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-5 h-5 text-purple-500" />
        <div className="text-sm font-medium text-gray-700">Add Custom Events (Optional)</div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            Custom events are specific to your app. Examples: "Tutorial Completed", "Subscription Started", "Level Up"
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Event Name</label>
          <input
            type="text"
            value={newEventName}
            onChange={e => setNewEventName(e.target.value)}
            placeholder="e.g., tutorial_completed"
            className={INPUT_STYLES.base}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select
            value={newEventCategory}
            onChange={e => setNewEventCategory(e.target.value)}
            className={INPUT_STYLES.select}
          >
            <option value="engagement">Engagement</option>
            <option value="conversion">Conversion</option>
            <option value="retention">Retention</option>
            <option value="monetization">Monetization</option>
          </select>
        </div>

        <button
          onClick={addEvent}
          disabled={!newEventName.trim()}
          className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
            newEventName.trim()
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {events.length > 0 && (
        <div className="mb-4">
          <div className={LABEL_STYLES.fieldDesc}>Added Events ({events.length})</div>
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-900">{event.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({event.category})</span>
                </div>
                <button
                  onClick={() => removeEvent(index)}
                  className="p-1 hover:bg-purple-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onAdd(events)}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-purple-500 text-white hover:bg-purple-600"
        >
          {events.length > 0 ? 'Continue' : 'Skip Custom Events'}
        </button>
        {events.length === 0 && (
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

// Event Verify Component
function EventVerify({
  onVerified,
  onSkip,
  isCompleted = false
}: {
  onVerified: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [verifying, setVerifying] = useState(false);

  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Event Verification</div>
        <div className="text-xs text-gray-400">Verification completed</div>
      </div>
    );
  }

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      onVerified();
    }, 2000);
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <div className="text-sm font-medium text-gray-700">Verify Event Tracking</div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className={LABEL_STYLES.field}>Test your events:</div>
        <ol className="text-xs text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-medium">1.</span>
            Open your app on a test device
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-medium">2.</span>
            Trigger the events you've configured
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-medium">3.</span>
            Check Real-time Logs in Airbridge Dashboard
          </li>
        </ol>
      </div>

      <a
        href="https://dashboard.airbridge.io/raw-data/app-real-time-log"
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON_STYLES.purple}
      >
        Open Real-time Logs <ExternalLink className="w-4 h-4" />
      </a>

      <div className="bg-amber-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            Events may take up to 10 minutes to appear in Real-time Logs.
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2"
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
            </>
          ) : (
            'Events are showing!'
          )}
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          I'll verify later
        </button>
      </div>
    </div>
  );
}

// Event Taxonomy Summary Component
function EventTaxonomySummary({
  events,
  onContinue,
  isCompleted = false
}: {
  events: EventConfig[];
  onContinue: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Event Taxonomy Summary</div>
        <div className="text-xs text-gray-400">Setup completed</div>
      </div>
    );
  }

  const standardEvents = events.filter(e => e.isStandard);
  const customEvents = events.filter(e => !e.isStandard);

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-purple-600">
        <CheckCircle2 className="w-6 h-6" />
        Event Taxonomy Complete!
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <div className={LABEL_STYLES.fieldDesc}>Standard Events ({standardEvents.length})</div>
          <div className="flex flex-wrap gap-2">
            {standardEvents.map(event => (
              <span key={event.eventId} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg">
                {event.eventName}
              </span>
            ))}
          </div>
        </div>

        {customEvents.length > 0 && (
          <div>
            <div className={LABEL_STYLES.fieldDesc}>Custom Events ({customEvents.length})</div>
            <div className="flex flex-wrap gap-2">
              {customEvents.map(event => (
                <span key={event.eventId} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
                  {event.eventName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-green-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-green-800">
            Your events are configured. Now let's connect your ad channels to start measuring campaign performance.
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className={BUTTON_STYLES.secondary}
      >
        Continue to Ad Channel Integration <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Dev Completion Summary Component
function DevCompletionSummary({ appName, onViewTestEvents, onAddProductionApp }: {
  appName: string;
  onViewTestEvents?: () => void;
  onAddProductionApp?: () => void;
}) {
  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-emerald-600">
        <CheckCircle2 className="w-6 h-6" />
        Development Setup Complete!
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>{appName}</strong> has been successfully set up for development testing.
          </p>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p>✅ SDK integration verified</p>
          <p>✅ Events are being tracked correctly</p>
        </div>

        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-blue-50">
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
          <span className="text-xs text-blue-800">
            Ad channel integrations are available in Production apps. When you're ready to go live, register a new Production app.
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className={LABEL_STYLES.title}>What's Next?</div>
        <div className="flex gap-2">
          <button
            onClick={onViewTestEvents}
            className="flex-1 py-2 px-3 text-sm rounded-lg transition-colors bg-blue-500 text-white hover:bg-blue-600"
          >
            View Test Events
          </button>
          <button
            onClick={onAddProductionApp}
            className="flex-1 py-2 px-3 text-sm rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Add Production App
          </button>
        </div>
      </div>
    </div>
  );
}

// Completion Summary Component
function CompletionSummary({ data }: { data: CompletionData }) {
  const channelLabels: Record<string, string> = {
    meta: 'Meta Ads',
    google: 'Google Ads',
    apple: 'Apple Search Ads',
    tiktok: 'TikTok',
  };

  return (
    <div className={CARD_STYLES.base}>
      <div className="flex items-center gap-2 text-lg font-semibold text-green-600 mb-4">
        <CheckCircle2 className="w-6 h-6" />
        Airbridge Setup Complete!
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">App Information</div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div>App Name: {data.appName}</div>
            <div>Platforms: {data.platforms.join(', ')}</div>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">SDK</div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div>Framework: {data.framework}</div>
            <div>Version: v4.x (Latest)</div>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Connected Ad Channels</div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            {data.channels.map(ch => (
              <div key={ch} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {channelLabels[ch] || ch}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className={LABEL_STYLES.title}>Next Steps</div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-3 text-sm rounded-lg transition-colors bg-blue-500 text-white hover:bg-blue-600">
            Create Tracking Link
          </button>
          <button className="flex-1 py-2 px-3 text-sm rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}

// Single Select Component
function SingleSelect({ options, onSelect, isCompleted = false }: { options: { label: string; value: string; description?: string }[]; onSelect: (value: string) => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <div className="text-sm font-medium text-gray-500 mb-2">Options</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      <div className="space-y-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <Circle className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-sm">{option.label}</span>
              {option.description && (
                <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Main OnboardingManager Component
export function OnboardingManager({ userAnswers }: OnboardingManagerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('fullscreen');

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sidebar tab state
  const [sidebarTab, setSidebarTab] = useState<'apps' | 'chats'>('apps');

  // Chat rooms state (for Q&A chats)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Registered apps state
  const [registeredApps, setRegisteredApps] = useState<RegisteredApp[]>([]);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [isAddingApp, setIsAddingApp] = useState(true); // true when in app registration flow

  // Setup state for current app being configured
  const [setupState, setSetupState] = useState({
    environment: '' as 'dev' | 'production' | '',
    platforms: [] as string[],
    currentPlatformIndex: 0, // For production: track which platform we're registering
    platformInfos: [] as PlatformInfo[], // Store info for each platform
    appInfo: { appName: '', storeUrl: '', bundleId: '', packageName: '', webUrl: '', timezone: '', currency: '' } as AppInfo,
    framework: '',
    channels: [] as string[],
  });

  // Deeplink setup state
  const [deeplinkState, setDeeplinkState] = useState<{
    iosData?: { uriScheme: string; appId: string };
    androidData?: { uriScheme: string; sha256Fingerprints: string[] };
    currentPlatform?: 'ios' | 'android';
    completedPlatforms: string[];
  }>({
    completedPlatforms: []
  });

  // Get current app
  const currentApp = registeredApps.find(app => app.id === currentAppId);

  // Toggle app expansion
  const toggleAppExpansion = (appId: string) => {
    setRegisteredApps(prev => prev.map(app =>
      app.id === appId ? { ...app, isExpanded: !app.isExpanded } : app
    ));
  };

  // Update step status for current app
  const updateAppStepStatus = (appId: string, stepId: string, status: 'pending' | 'in_progress' | 'completed') => {
    setRegisteredApps(prev => prev.map(app =>
      app.id === appId
        ? { ...app, steps: app.steps.map(s => s.id === stepId ? { ...s, status } : s) }
        : app
    ));
  };

  // Get current chat room
  const currentChatRoom = currentChatId ? chatRooms.find(c => c.id === currentChatId) : null;

  // Get messages to display (priority: chat room > registered app > new app registration)
  const currentMessages = currentChatRoom
    ? currentChatRoom.messages
    : currentApp
      ? currentApp.messages
      : messages;

  // Create new chat room
  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const welcomeMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'bot',
      content: [{ type: 'text', text: '👋 안녕하세요! Airbridge Q&A 봇입니다.\nSDK 설치, 딥링크, 어트리뷰션 등 궁금한 것을 물어보세요.' }],
      timestamp: new Date(),
    };
    const newChatRoom: ChatRoom = {
      id: newChatId,
      title: 'New Chat',
      messages: [welcomeMessage],
      createdAt: new Date(),
    };
    setChatRooms(prev => [newChatRoom, ...prev]);
    setCurrentChatId(newChatId);
  };

  // Select chat room
  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  // Go back to onboarding (deselect chat)
  const handleBackToOnboarding = () => {
    setCurrentChatId(null);
  };

  // Add message to current chat room
  const addChatMessage = (content: MessageContent[], role: 'bot' | 'user') => {
    if (!currentChatId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
    };

    setChatRooms(prev => prev.map(room => {
      if (room.id !== currentChatId) return room;

      const updatedMessages = [...room.messages, newMessage];

      // Auto-generate title from first user message
      let title = room.title;
      if (role === 'user' && room.title === 'New Chat') {
        const textContent = content.find(c => c.type === 'text');
        if (textContent && textContent.type === 'text') {
          title = textContent.text.slice(0, 20) + (textContent.text.length > 20 ? '...' : '');
        }
      }

      return { ...room, messages: updatedMessages, title };
    }));
  };

  // Start adding another app
  const handleAddAnotherApp = () => {
    setIsAddingApp(true);
    setCurrentAppId(null);
    setSetupState({
      environment: '' as 'dev' | 'production' | '',
      platforms: [] as string[],
      currentPlatformIndex: 0,
      platformInfos: [] as PlatformInfo[],
      appInfo: { appName: '', storeUrl: '', bundleId: '', packageName: '', webUrl: '', timezone: '', currency: '' } as AppInfo,
      framework: '',
      channels: [] as string[],
    });
    setCurrentPhase(1);

    // Set initial message directly to avoid closure issues
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: 'bot',
      content: [
        { type: 'text', text: '➕ Let\'s add another app!\n\nWhich environment would you like to set up?' },
        { type: 'environment-select' },
      ],
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Scroll to bottom when view mode changes
  useEffect(() => {
    // Small delay to allow layout to update
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [viewMode]);

  const addBotMessage = (content: MessageContent[]) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content,
        timestamp: new Date(),
      };

      // If viewing a registered app, update that app's messages
      if (currentAppId) {
        setRegisteredApps(prev => prev.map(app =>
          app.id === currentAppId
            ? { ...app, messages: [...app.messages, newMessage] }
            : app
        ));
      } else {
        // New app registration - update messages state
        setMessages(prev => [...prev, newMessage]);
      }
      setIsTyping(false);
    }, 600);
  };

  // Add bot message to a specific app by ID (avoids closure issues)
  const addBotMessageToApp = (appId: string, content: MessageContent[]) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content,
        timestamp: new Date(),
      };

      setRegisteredApps(prev => prev.map(app =>
        app.id === appId
          ? { ...app, messages: [...app.messages, newMessage] }
          : app
      ));
      setIsTyping(false);
    }, 600);
  };

  // Update the last bot message (replace content)
  const updateLastBotMessage = (content: MessageContent[]) => {
    if (currentAppId) {
      setRegisteredApps(prev => prev.map(app => {
        if (app.id !== currentAppId) return app;
        const lastBotIndex = app.messages.map(m => m.role).lastIndexOf('bot');
        if (lastBotIndex === -1) return app;
        const updated = [...app.messages];
        updated[lastBotIndex] = { ...updated[lastBotIndex], content };
        return { ...app, messages: updated };
      }));
    } else {
      setMessages(prev => {
        const lastBotIndex = prev.map(m => m.role).lastIndexOf('bot');
        if (lastBotIndex === -1) return prev;
        const updated = [...prev];
        updated[lastBotIndex] = {
          ...updated[lastBotIndex],
          content,
        };
        return updated;
      });
    }
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: [{ type: 'text', text }],
      timestamp: new Date(),
    };

    // If viewing a registered app, update that app's messages
    if (currentAppId) {
      setRegisteredApps(prev => prev.map(app =>
        app.id === currentAppId
          ? { ...app, messages: [...app.messages, newMessage] }
          : app
      ));
    } else {
      // New app registration - update messages state
      setMessages(prev => [...prev, newMessage]);
    }
  };

  // Get user's goal from survey (question 7)
  const getUserGoalInfo = () => {
    const goal = userAnswers[7] as string;
    const goalMap: Record<string, { label: string; emoji: string; description: string; steps: string[] }> = {
      'deeplink': {
        label: 'Deep Linking',
        emoji: '🔗',
        description: 'Route users directly to specific screens in your app after clicking ads',
        steps: ['App Registration', 'SDK Installation', 'Deep Link Setup', 'Tracking Link Creation']
      },
      'attribution': {
        label: 'Accurate & Unbiased Attribution',
        emoji: '🎯',
        description: 'Measure true ad performance without bias',
        steps: ['App Registration', 'SDK Installation', 'Ad Channel Integration', 'Event Setup']
      },
      'granular-reports': {
        label: 'Granular Data Reports',
        emoji: '📊',
        description: 'Get insights from campaign to creative level',
        steps: ['App Registration', 'SDK Installation', 'Ad Channel Integration', 'Event Taxonomy Setup']
      },
      'adops': {
        label: 'Automated Multichannel Reporting',
        emoji: '⚡',
        description: 'Unified AdOps management across all channels',
        steps: ['App Registration', 'SDK Installation', 'Ad Channel Integration', 'Cost Data Integration']
      },
      'unified-analytics': {
        label: 'Unified Web & App Analytics',
        emoji: '📱',
        description: 'Cross-platform data analysis',
        steps: ['App Registration', 'SDK Installation (App + Web)', 'Event Setup']
      },
      'optimization': {
        label: 'Ad Spend Optimization',
        emoji: '💰',
        description: 'Optimize spend by channel & campaign',
        steps: ['App Registration', 'SDK Installation', 'Ad Channel Integration', 'Cost Data Integration']
      }
    };
    return goalMap[goal] || null;
  };

  // Get user's selected channels from survey (question 8)
  const getUserChannels = () => {
    const channels = userAnswers[8] as string[];
    if (!channels || channels.length === 0) return null;

    const channelMap: Record<string, string> = {
      'meta': 'Meta Ads',
      'google': 'Google Ads',
      'apple': 'Apple Search Ads',
      'tiktok': 'TikTok For Business',
      'other': 'Other Channels'
    };

    return channels.map(c => channelMap[c] || c);
  };

  // Initial welcome message with personalized content based on survey
  useEffect(() => {
    const goalInfo = getUserGoalInfo();
    const channels = getUserChannels();

    const timer = setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '👋 Welcome! I\'m your Airbridge Onboarding Manager.' },
      ]);
    }, 300);

    const timer2 = setTimeout(() => {
      if (goalInfo) {
        // Show personalized goal message
        const channelText = channels && channels.length > 0
          ? `\n\n📢 **Channels to integrate:** ${channels.join(', ')}`
          : '';

        addBotMessage([
          { type: 'text', text: `${goalInfo.emoji} You've selected **${goalInfo.label}**!\n\n> ${goalInfo.description}${channelText}` },
        ]);
      } else {
        addBotMessage([
          { type: 'text', text: 'Let\'s get started with Airbridge for your app marketing!' },
        ]);
      }
    }, 1200);

    const timer3 = setTimeout(() => {
      if (goalInfo) {
        // Show required setup steps
        const stepsText = goalInfo.steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
        addBotMessage([
          { type: 'text', text: `🛠️ **Required Setup Steps:**\n\n${stepsText}\n\nI'll guide you through each step!` },
        ]);
      } else {
        addBotMessage([
          { type: 'text', text: 'Here\'s what we\'ll set up together:\n\n📱 App Registration\n🔧 SDK Installation\n📊 Ad Channel Integration' },
        ]);
      }
    }, 2200);

    const timer4 = setTimeout(() => {
      setCurrentPhase(1);
      addBotMessage([
        { type: 'text', text: '🚀 Let\'s start with **App Registration**.\n\nWhich environment would you like to set up?' },
        { type: 'environment-select' },
      ]);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Environment select handler
  const handleEnvironmentSelect = (env: 'dev' | 'production') => {
    setSetupState(prev => ({ ...prev, environment: env }));
    addUserMessage(env === 'dev' ? 'Development' : 'Production');

    setTimeout(() => {
      if (env === 'dev') {
        // Dev: Go directly to app name input
        addBotMessage([
          { type: 'text', text: '✅ Great choice! Development is perfect for quick testing.\n\n📝 What would you like to name your app?' },
          { type: 'app-name-input-dev' },
        ]);
      } else {
        // Production: Ask for platforms (multi-select)
        addBotMessage([
          { type: 'text', text: '✅ Production it is!\n\nYou can register multiple platforms as a **single app**.\n\n📱 Which platforms does your app support?' },
          { type: 'platform-multi-select' },
        ]);
      }
    }, 300);
  };

  // Dev app name handler
  const handleDevAppNameSubmit = (appName: string) => {
    setSetupState(prev => ({
      ...prev,
      appInfo: { ...prev.appInfo, appName }
    }));
    addUserMessage(appName);

    // Show platform selection for Dev mode (needed for SDK/Deeplink setup)
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✨ Great name! **"${appName}"**\n\n📱 Which platforms will you be testing?` },
        { type: 'platform-multi-select' },
      ]);
    }, 300);
  };

  // Dev platform select handler (after app name)
  const handleDevPlatformSelect = (platforms: string[]) => {
    setSetupState(prev => ({ ...prev, platforms }));
    const platformLabels = platforms.map(p => p === 'ios' ? 'iOS' : p === 'android' ? 'Android' : 'Web').join(', ');
    addUserMessage(platformLabels);

    // Show timezone/currency confirmation (IP-based recommendation)
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✅ Got it! You'll be testing on **${platformLabels}**.\n\n🌍 Let me confirm your regional settings:` },
        { type: 'timezone-currency-confirm', timezone: 'Asia/Seoul (KST, UTC+9)', currency: 'KRW (Korean Won)' },
      ]);
    }, 300);
  };

  // Platform multi-select handler (handles both Dev and Production)
  const handlePlatformMultiSelect = (platforms: string[]) => {
    // Check if we're in Dev mode
    if (setupState.environment === 'dev') {
      // Dev mode: go directly to timezone/currency after platform selection
      handleDevPlatformSelect(platforms);
      return;
    }

    // Production mode: continue with platform registration flow
    setSetupState(prev => ({ ...prev, platforms, currentPlatformIndex: 0, platformInfos: [] }));
    const platformLabels = platforms.map(p => p === 'ios' ? 'iOS' : p === 'android' ? 'Android' : 'Web').join(', ');
    addUserMessage(platformLabels);

    // Start registration for first platform
    const firstPlatform = platforms[0] as 'ios' | 'android' | 'web';
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `📋 Let's register your app for **${platforms.length} platform${platforms.length > 1 ? 's' : ''}**.\n\nWe'll go through each one step by step.` },
        { type: 'platform-registration', platform: firstPlatform, platformIndex: 0, totalPlatforms: platforms.length },
      ]);
    }, 300);
  };

  // Platform search handler (Production)
  const handlePlatformSearch = (query: string, platform: 'ios' | 'android') => {
    addUserMessage(`Search: ${query}`);

    // Show loading
    setTimeout(() => {
      addBotMessage([
        { type: 'app-search-loading', query, platform },
      ]);
    }, 300);

    // Simulate search results
    setTimeout(() => {
      const mockResults: AppSearchResult[] = [
        {
          id: `${platform}-1`,
          name: query,
          developer: 'Your Company Inc.',
          icon: 'https://placehold.co/120x120/3b82f6/ffffff?text=' + query.charAt(0).toUpperCase(),
          bundleId: platform === 'ios' ? 'com.yourcompany.' + query.toLowerCase().replace(/\s/g, '') : undefined,
          packageName: platform === 'android' ? 'com.yourcompany.' + query.toLowerCase().replace(/\s/g, '') : undefined,
          store: platform,
        },
        {
          id: `${platform}-2`,
          name: query + ' Pro',
          developer: 'Another Developer',
          icon: 'https://placehold.co/120x120/10b981/ffffff?text=' + query.charAt(0).toUpperCase(),
          bundleId: platform === 'ios' ? 'com.another.' + query.toLowerCase().replace(/\s/g, '') + 'pro' : undefined,
          packageName: platform === 'android' ? 'com.another.' + query.toLowerCase().replace(/\s/g, '') + 'lite' : undefined,
          store: platform,
        },
      ];

      // Replace loading message with results
      updateLastBotMessage([
        { type: 'text', text: `🔍 Found some results for **"${query}"**:` },
        { type: 'app-search-results', results: mockResults, query, platform },
      ]);
    }, 2000);
  };

  // Platform URL submit handler (Production)
  const handlePlatformUrlSubmit = (url: string, platform: 'ios' | 'android' | 'web') => {
    addUserMessage(url);

    // Create platform info from URL
    const platformInfo: PlatformInfo = {
      platform,
      storeUrl: platform !== 'web' ? url : undefined,
      webUrl: platform === 'web' ? url : undefined,
      appName: 'App from URL', // Would be fetched from URL in real implementation
      bundleId: platform === 'ios' ? 'com.parsed.fromurl' : undefined,
      packageName: platform === 'android' ? 'com.parsed.fromurl' : undefined,
    };

    proceedToNextPlatformOrFinish(platformInfo);
  };

  // App selection from search results (Production)
  const handleProductionAppSelect = (app: AppSearchResult) => {
    addUserMessage(`Selected: ${app.name}`);

    const platformInfo: PlatformInfo = {
      platform: app.store,
      appName: app.name,
      bundleId: app.bundleId,
      packageName: app.packageName,
    };

    proceedToNextPlatformOrFinish(platformInfo);
  };

  // Helper to proceed to next platform or finish registration
  const proceedToNextPlatformOrFinish = (platformInfo: PlatformInfo) => {
    const newPlatformInfos = [...setupState.platformInfos, platformInfo];
    const nextIndex = setupState.currentPlatformIndex + 1;

    if (nextIndex < setupState.platforms.length) {
      // More platforms to register
      setSetupState(prev => ({
        ...prev,
        platformInfos: newPlatformInfos,
        currentPlatformIndex: nextIndex,
      }));

      const nextPlatform = setupState.platforms[nextIndex] as 'ios' | 'android' | 'web';
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `✅ Done! Now let's register your **${nextPlatform === 'ios' ? 'iOS' : nextPlatform === 'android' ? 'Android' : 'Web'}** app.` },
          { type: 'platform-registration', platform: nextPlatform, platformIndex: nextIndex, totalPlatforms: setupState.platforms.length },
        ]);
      }, 300);
    } else {
      // All platforms registered, ask for timezone/currency
      setSetupState(prev => ({
        ...prev,
        platformInfos: newPlatformInfos,
        appInfo: {
          ...prev.appInfo,
          appName: platformInfo.appName || 'My App',
          bundleId: newPlatformInfos.find(p => p.bundleId)?.bundleId || '',
          packageName: newPlatformInfos.find(p => p.packageName)?.packageName || '',
          webUrl: newPlatformInfos.find(p => p.webUrl)?.webUrl || '',
        },
      }));

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '🎉 Excellent! All platforms registered.\n\n🌍 Let me confirm your regional settings:' },
          { type: 'timezone-currency-confirm', timezone: 'Asia/Seoul (KST, UTC+9)', currency: 'KRW (Korean Won)' },
        ]);
      }, 300);
    }
  };

  // Timezone/Currency confirm handler
  const handleTimezoneCurrencyConfirm = () => {
    setSetupState(prev => ({
      ...prev,
      appInfo: {
        ...prev.appInfo,
        timezone: 'Asia/Seoul (KST, UTC+9)',
        currency: 'KRW (Korean Won)',
      },
    }));
    addUserMessage('Settings confirmed');
    completeAppRegistration();
  };

  // Timezone/Currency edit handler
  const handleTimezoneCurrencyEdit = () => {
    addUserMessage('I need to change these');
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '👍 No problem! Please select your preferred settings:' },
        { type: 'timezone-currency-input' },
      ]);
    }, 300);
  };

  // Timezone/Currency manual input handler
  const handleTimezoneCurrencySubmit = (timezone: string, currency: string) => {
    setSetupState(prev => ({
      ...prev,
      appInfo: {
        ...prev.appInfo,
        timezone,
        currency,
      },
    }));
    addUserMessage(`${timezone}, ${currency}`);
    completeAppRegistration();
  };

  // Complete app registration and move to SDK setup
  const completeAppRegistration = () => {
    // Guard: prevent duplicate app creation
    if (!isAddingApp) {
      console.log('[completeAppRegistration] Skipped - app already created');
      return;
    }

    const newAppId = Date.now().toString();
    // Capture app name now to avoid closure issues with setTimeout
    const appName = setupState.appInfo.appName;

    // Generate tokens first so they can be stored in the app
    const generateToken = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const tokens: AppTokens = {
      appSdkToken: generateToken(),
      webSdkToken: generateToken(),
      apiToken: generateToken(),
    };

    const newApp: RegisteredApp = {
      id: newAppId,
      appInfo: setupState.appInfo,
      platforms: setupState.platforms, // Use actual platforms for both Dev and Production
      environment: setupState.environment as 'dev' | 'production',
      steps: setupState.environment === 'dev' ? createDevAppSteps(setupState.platforms) : createAppSteps(setupState.platforms),
      currentPhase: 1, // Stay in Phase 1 until token display is confirmed
      framework: '',
      channels: [],
      isExpanded: true,
      messages: [...messages], // Save current messages to the app
      tokens, // Store generated tokens for SDK setup
    };

    setRegisteredApps(prev => [
      ...prev.map(app => ({ ...app, isExpanded: false })),
      newApp
    ]);
    setCurrentAppId(newAppId);
    setIsAddingApp(false);
    setCurrentPhase(1);

    // Use addBotMessageToApp with captured appId to avoid closure issues
    setTimeout(() => {
      addBotMessageToApp(newAppId, [
        { type: 'text', text: `🎉 Your app **"${appName}"** has been registered!` },
        { type: 'token-display', tokens },
      ]);
    }, 300);
  };

  // App name submit handler - now triggers search
  const handleAppNameSubmit = (appName: string) => {
    addUserMessage(appName);

    // Show loading state
    setTimeout(() => {
      addBotMessage([
        { type: 'app-search-loading', query: appName },
      ]);
    }, 300);

    // Simulate search delay, then show results
    setTimeout(() => {
      // Generate mock search results based on platforms
      const mockResults: AppSearchResult[] = [];

      if (setupState.platforms.includes('ios')) {
        mockResults.push(
          {
            id: 'ios-1',
            name: appName,
            developer: 'Your Company Inc.',
            icon: 'https://placehold.co/120x120/3b82f6/ffffff?text=' + appName.charAt(0).toUpperCase(),
            bundleId: 'com.yourcompany.' + appName.toLowerCase().replace(/\s/g, ''),
            store: 'ios',
          },
          {
            id: 'ios-2',
            name: appName + ' Pro',
            developer: 'Another Developer',
            icon: 'https://placehold.co/120x120/10b981/ffffff?text=' + appName.charAt(0).toUpperCase(),
            bundleId: 'com.another.' + appName.toLowerCase().replace(/\s/g, '') + 'pro',
            store: 'ios',
          }
        );
      }

      if (setupState.platforms.includes('android')) {
        mockResults.push(
          {
            id: 'android-1',
            name: appName,
            developer: 'Your Company Inc.',
            icon: 'https://placehold.co/120x120/3b82f6/ffffff?text=' + appName.charAt(0).toUpperCase(),
            packageName: 'com.yourcompany.' + appName.toLowerCase().replace(/\s/g, ''),
            store: 'android',
          },
          {
            id: 'android-2',
            name: appName + ' Lite',
            developer: 'Different Studio',
            icon: 'https://placehold.co/120x120/f59e0b/ffffff?text=' + appName.charAt(0).toUpperCase(),
            packageName: 'com.different.' + appName.toLowerCase().replace(/\s/g, '') + 'lite',
            store: 'android',
          }
        );
      }

      addBotMessage([
        { type: 'text', text: `🔍 Found some apps matching **"${appName}"**.\n\nPlease select your app:` },
        { type: 'app-search-results', results: mockResults, query: appName },
      ]);
    }, 2000);
  };

  // App selection from search results
  const handleAppSelect = (app: AppSearchResult) => {
    const appInfo: AppInfo = {
      appName: app.name,
      storeUrl: '',
      bundleId: app.bundleId || '',
      packageName: app.packageName || '',
    };
    setSetupState(prev => ({ ...prev, appInfo }));
    addUserMessage(`Selected: ${app.name} (${app.store === 'ios' ? 'iOS' : 'Android'})`);

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✅ 앱을 찾았습니다: **"${app.name}"**\n\n📝 Airbridge에 앱을 등록합니다...` },
        {
          type: 'dashboard-action',
          appName: app.name,
          bundleId: app.bundleId || '',
          packageName: app.packageName || '',
        },
      ]);
    }, 300);
  };

  // Handle "My app is not listed"
  const handleAppNotFound = () => {
    addUserMessage('My app is not listed');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '👍 직접 앱 정보를 입력해주세요.' },
        { type: 'app-info-form' },
      ]);
    }, 300);
  };

  // App info submit handler (legacy - keeping for compatibility)
  const handleAppInfoSubmit = (info: AppInfo) => {
    setSetupState(prev => ({ ...prev, appInfo: info }));
    addUserMessage(`App name: ${info.appName}`);

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '✨ 완벽해요!\n\n📝 Airbridge에 앱을 등록합니다...' },
        {
          type: 'dashboard-action',
          appName: info.appName,
          bundleId: info.bundleId || 'com.company.' + info.appName.toLowerCase().replace(/\s/g, ''),
          packageName: info.packageName || 'com.company.' + info.appName.toLowerCase().replace(/\s/g, ''),
        },
      ]);
    }, 300);
  };

  // Dashboard confirm handler - auto-detected
  const handleDashboardConfirm = (status: string) => {
    // Guard: prevent duplicate app creation
    if (!isAddingApp) {
      console.log('[handleDashboardConfirm] Skipped - app already created');
      return;
    }

    // Create new registered app
    const newAppId = Date.now().toString();
    const newApp: RegisteredApp = {
      id: newAppId,
      appInfo: setupState.appInfo,
      platforms: setupState.platforms,
      environment: setupState.environment as 'dev' | 'production',
      steps: setupState.environment === 'dev' ? createDevAppSteps(setupState.platforms) : createAppSteps(setupState.platforms),
      currentPhase: 2,
      framework: '',
      channels: [],
      isExpanded: true,
      messages: [...messages], // Save current messages to the app
    };

    // Collapse other apps and add new one
    setRegisteredApps(prev => [
      ...prev.map(app => ({ ...app, isExpanded: false })),
      newApp
    ]);
    setCurrentAppId(newAppId);
    setIsAddingApp(false);
    setCurrentPhase(2);

    // Set first step as in_progress
    setTimeout(() => {
      updateAppStepStatus(newAppId, 'sdk-install', 'in_progress');
    }, 100);

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✅ I've detected your app registration for **"${setupState.appInfo.appName}"**. Great job!\n\n🔧 Now let's proceed with **SDK installation**.\n\nThe SDK needs to be installed by a developer. Who will handle this?` },
        { type: 'sdk-install-choice' },
      ]);
    }, 300);
  };

  // SDK Install Choice handler
  const handleSdkInstallChoice = (choice: 'self' | 'share') => {
    if (choice === 'self') {
      addUserMessage("I'll install it myself");
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '👨‍💻 Great! Let\'s set up the SDK.\n\nWe offer two installation methods:' },
          { type: 'sdk-install-method-select' },
        ]);
      }, 300);
    } else {
      addUserMessage('Send guide to developer');
      const app = registeredApps.find(a => a.id === currentAppId);
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '📤 No problem! Here\'s a setup guide you can share with your development team.\n\nCopy the guide below and send it via Slack or email:' },
          {
            type: 'sdk-guide-share',
            appName: app?.appInfo.appName || setupState.appInfo?.appName || 'Your App',
            platforms: app?.platforms || setupState.platforms || [],
            framework: app?.framework
          },
        ]);
      }, 300);
    }
  };

  // SDK Install Method handler (Automation vs Manual)
  const handleSdkInstallMethodSelect = (method: 'automation' | 'manual') => {
    if (method === 'automation') {
      addUserMessage('GitHub Automation');
      setIsAutomationMode(true);
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '🚀 Excellent choice! GitHub Automation will handle:\n\n• **SDK Installation** - Package dependencies and build config\n• **SDK Initialization** - Entry point setup with your tokens\n• **Deep Link Config** - URL schemes and universal links\n• **Event Taxonomy** - Event tracking code and debugging\n\nLet\'s connect your GitHub repository to get started.' },
          { type: 'github-connect' },
        ]);
      }, 300);
    } else {
      addUserMessage('Manual Installation');
      setIsAutomationMode(false);
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '👨‍💻 No problem! I\'ll guide you through the manual setup.\n\nFirst, select your development framework:' },
          { type: 'framework-select' },
        ]);
      }, 300);
    }
  };

  // GitHub Connect handler
  const handleGitHubConnect = () => {
    addUserMessage('Connect with GitHub');

    // Simulate GitHub OAuth flow
    setTimeout(() => {
      // Show loading then repo selection
      addBotMessage([
        { type: 'text', text: '✅ GitHub connected successfully!\n\nNow select the repository where your app code lives:' },
        {
          type: 'github-repo-select',
          repos: [
            { id: '1', name: 'my-awesome-app', fullName: 'mycompany/my-awesome-app', owner: 'mycompany', defaultBranch: 'main', isPrivate: true },
            { id: '2', name: 'mobile-app-ios', fullName: 'mycompany/mobile-app-ios', owner: 'mycompany', defaultBranch: 'develop', isPrivate: true },
            { id: '3', name: 'android-app', fullName: 'mycompany/android-app', owner: 'mycompany', defaultBranch: 'main', isPrivate: false },
            { id: '4', name: 'react-native-app', fullName: 'mycompany/react-native-app', owner: 'mycompany', defaultBranch: 'main', isPrivate: true },
          ]
        },
      ]);
    }, 1000);
  };

  // GitHub Skip handler
  const handleGitHubSkip = () => {
    addUserMessage('Skip GitHub connection');
    setIsAutomationMode(false);
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'No problem! Let\'s proceed with manual installation.\n\nSelect your development framework:' },
        { type: 'framework-select' },
      ]);
    }, 300);
  };

  // GitHub Repo Select handler
  const handleGitHubRepoSelect = (repo: GitHubRepo) => {
    addUserMessage(`Selected: ${repo.fullName}`);
    setGitHubState(prev => ({
      ...prev,
      isConnected: true,
      selectedRepo: repo,
    }));

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `📁 Repository **${repo.fullName}** selected.\n\nTo create pull requests, we need write access to your repository:` },
        { type: 'github-permissions' },
      ]);
    }, 300);
  };

  // GitHub Permissions handler
  const handleGitHubPermissionsGranted = () => {
    addUserMessage('Permissions granted');
    setGitHubState(prev => ({
      ...prev,
      currentStep: 'sdk-install',
    }));

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '✅ Perfect! All permissions are set.\n\nLet\'s start with the first automation step - **SDK Installation**.\n\nShall I create a pull request for SDK installation?' },
        { type: 'github-pr-confirm', step: 'sdk-install' },
      ]);
    }, 300);
  };

  // GitHub PR Confirm handler
  const handleGitHubPRConfirm = (step: 'sdk-install' | 'sdk-init' | 'deeplink' | 'event-tracking') => {
    const stepNames: Record<string, string> = {
      'sdk-install': 'SDK Installation',
      'sdk-init': 'SDK Initialization',
      'deeplink': 'Deep Link Setup',
      'event-tracking': 'Event Tracking',
    };

    addUserMessage(`Create ${stepNames[step]} PR`);

    // Show waiting state
    setTimeout(() => {
      addBotMessage([
        { type: 'github-pr-waiting', step: stepNames[step] },
      ]);
    }, 300);

    // Simulate PR creation (webhook response)
    const prNumber = Math.floor(Math.random() * 100) + 1;
    const prUrl = `https://github.com/${gitHubState.selectedRepo?.fullName || 'mycompany/my-app'}/pull/${prNumber}`;

    setTimeout(() => {
      setGitHubState(prev => ({
        ...prev,
        pendingPR: { url: prUrl, number: prNumber, step },
      }));

      addBotMessage([
        { type: 'github-pr-complete', prUrl, prNumber, step: stepNames[step] },
      ]);
    }, 3000);
  };

  // GitHub PR Skip handler
  const handleGitHubPRSkip = (step: 'sdk-install' | 'sdk-init' | 'deeplink' | 'event-tracking') => {
    const nextStep = getNextAutomationStep(step);
    addUserMessage('Skip this step');

    if (nextStep) {
      const stepNames: Record<string, string> = {
        'sdk-install': 'SDK Installation',
        'sdk-init': 'SDK Initialization',
        'deeplink': 'Deep Link Setup',
        'event-tracking': 'Event Tracking',
      };

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `Skipped. Let's proceed with **${stepNames[nextStep]}**.` },
          { type: 'github-pr-confirm', step: nextStep },
        ]);
      }, 300);
    } else {
      handleAutomationComplete();
    }
  };

  // Get next automation step
  const getNextAutomationStep = (currentStep: string): 'sdk-install' | 'sdk-init' | 'deeplink' | 'event-tracking' | null => {
    const steps = ['sdk-install', 'sdk-init', 'deeplink', 'event-tracking'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      return steps[currentIndex + 1] as 'sdk-install' | 'sdk-init' | 'deeplink' | 'event-tracking';
    }
    return null;
  };

  // GitHub PR Review handler
  const handleGitHubPRReview = () => {
    const pr = gitHubState.pendingPR;
    if (!pr) return;

    addBotMessage([
      { type: 'text', text: `Would you like to review PR #${pr.number}?` },
      { type: 'github-pr-review', prUrl: pr.url, prNumber: pr.number, step: pr.step },
    ]);
  };

  // GitHub PR Merged handler
  const handleGitHubPRMerged = () => {
    addUserMessage("I've merged the PR");
    const currentStep = gitHubState.currentStep;

    // Update sidebar step status
    if (currentAppId && currentStep) {
      const stepIdMap: Record<string, string> = {
        'sdk-install': 'sdk-install',
        'sdk-init': 'sdk-init',
        'deeplink': 'deeplink',
        'event-tracking': 'event-taxonomy',
      };
      updateAppStepStatus(currentAppId, stepIdMap[currentStep], 'completed');
    }

    const nextStep = getNextAutomationStep(currentStep || 'sdk-install');

    if (nextStep) {
      setGitHubState(prev => ({
        ...prev,
        currentStep: nextStep,
        pendingPR: undefined,
      }));

      const stepNames: Record<string, string> = {
        'sdk-install': 'SDK Installation',
        'sdk-init': 'SDK Initialization',
        'deeplink': 'Deep Link Setup',
        'event-tracking': 'Event Tracking',
      };

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `✅ Great! ${stepNames[currentStep || 'sdk-install']} is complete.\n\nLet\'s continue with **${stepNames[nextStep]}**.` },
          { type: 'github-pr-confirm', step: nextStep },
        ]);
      }, 300);
    } else {
      handleAutomationComplete();
    }
  };

  // GitHub PR Continue (without merging)
  const handleGitHubPRContinue = () => {
    addUserMessage('Continue without merging');
    const nextStep = getNextAutomationStep(gitHubState.currentStep || 'sdk-install');

    if (nextStep) {
      setGitHubState(prev => ({
        ...prev,
        currentStep: nextStep,
        pendingPR: undefined,
      }));

      const stepNames: Record<string, string> = {
        'sdk-install': 'SDK Installation',
        'sdk-init': 'SDK Initialization',
        'deeplink': 'Deep Link Setup',
        'event-tracking': 'Event Tracking',
      };

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `Got it! You can merge the previous PR later.\n\nLet\'s proceed with **${stepNames[nextStep]}**.` },
          { type: 'github-pr-confirm', step: nextStep },
        ]);
      }, 300);
    } else {
      handleAutomationComplete();
    }
  };

  // Automation Complete handler
  const handleAutomationComplete = () => {
    // Mark all SDK steps as completed
    if (currentAppId) {
      updateAppStepStatus(currentAppId, 'sdk-install', 'completed');
      updateAppStepStatus(currentAppId, 'sdk-init', 'completed');
      updateAppStepStatus(currentAppId, 'deeplink', 'completed');
      updateAppStepStatus(currentAppId, 'sdk-verify', 'completed');
      updateAppStepStatus(currentAppId, 'event-taxonomy', 'completed');
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '🎉 **GitHub Automation Complete!**\n\nAll SDK setup steps have been automated:\n• SDK Installation\n• SDK Initialization\n• Deep Link Configuration\n• Event Tracking Setup\n\nYour PRs are ready for review and merge.\n\nNow let\'s set up **Ad Channel Integration** to start tracking your marketing campaigns!' },
        { type: 'channel-select' },
      ]);
    }, 300);
  };

  // SDK Guide Share completion handler
  const handleSdkGuideShareComplete = () => {
    addUserMessage("I've sent the guide to my developer");

    // Mark SDK steps as waiting for developer
    if (currentAppId) {
      // Keep sdk-install as in_progress to indicate waiting
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '✅ Perfect! I\'ll wait for your developer to complete the SDK setup.\n\n💡 **What happens next:**\n• Your developer will install the SDK\n• Once done, they\'ll verify the integration\n• You can track progress in the sidebar\n\nIn the meantime, you can work on other setup steps. Each category can be set up independently!' },
        { type: 'category-navigation' },
      ]);
    }, 300);
  };

  // Category Navigation handler
  const handleCategoryNavigation = (category: string) => {
    const app = currentApp;
    if (!app || !currentAppId) return;

    const categoryLabels: Record<string, string> = {
      'web-sdk': 'Web SDK',
      'ios-sdk': 'iOS SDK',
      'android-sdk': 'Android SDK',
      'sdk': 'SDK',
      'deeplink': 'Deep Link',
      'event-taxonomy': 'Event Taxonomy',
      'integration': 'Integration',
    };

    addUserMessage(`Set up ${categoryLabels[category] || category}`);

    // Find the first step in the selected category
    const categorySteps = app.steps.filter(s => s.category === category);
    const firstStep = categorySteps[0];

    if (firstStep) {
      // Mark first step as in_progress
      updateAppStepStatus(currentAppId, firstStep.id, 'in_progress');

      setTimeout(() => {
        // Navigate to the appropriate step
        switch (firstStep.id) {
          case 'deeplink':
            addBotMessage([
              { type: 'text', text: `🔗 **Deep Link Setup** for **${app.appInfo.appName}**\n\nDeep links direct users to specific screens in your app after clicking ads.\n\nWould you like to set it up now?` },
              { type: 'deeplink-choice' },
            ]);
            break;
          case 'event-taxonomy':
            addBotMessage([
              { type: 'text', text: `📊 **Event Taxonomy** for **${app.appInfo.appName}**\n\nLet's set up the events you want to track in your app.` },
              { type: 'standard-event-select' },
            ]);
            break;
          case 'channel-select':
            addBotMessage([
              { type: 'text', text: `📡 **Ad Channel Integration** for **${app.appInfo.appName}**\n\nConnect your ad platforms to track attribution.\n\nWhich channels would you like to integrate?` },
              { type: 'channel-select' },
            ]);
            break;
          default:
            addBotMessage([
              { type: 'text', text: `Let's continue with **${firstStep.title}** for **${app.appInfo.appName}**.` },
            ]);
        }
      }, 300);
    }
  };

  // Web SDK Install Complete handler (legacy - used by old WebSdkInstall component)
  const handleWebSdkInstallComplete = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('Web SDK installation complete');
    updateAppStepStatus(app.id, 'web-sdk-install', 'completed');

    // Check if there are mobile platforms to set up
    const hasMobilePlatforms = app.platforms.includes('ios') || app.platforms.includes('android');

    setTimeout(() => {
      if (hasMobilePlatforms) {
        addBotMessage([
          { type: 'text', text: '✅ **Web SDK installed!**\n\nNow let\'s set up the SDK for your mobile platforms.\n\nSelect your development framework:' },
          { type: 'framework-select' },
        ]);
        updateAppStepStatus(app.id, 'sdk-init', 'in_progress');
      } else {
        // Web only - proceed to deeplink
        addBotMessage([
          { type: 'text', text: '✅ **Web SDK installed!**\n\n🔗 Now let\'s set up **deep links** to direct users from ads to specific pages in your app.\n\nWould you like to set it up now?' },
          { type: 'deeplink-choice' },
        ]);
        updateAppStepStatus(app.id, 'sdk-init', 'completed');
        updateAppStepStatus(app.id, 'deeplink', 'in_progress');
      }
    }, 300);
  };

  // Web SDK Method Select handler (Step 1)
  const handleWebSdkMethodSelect = (method: 'script' | 'package', appName: string, webToken: string) => {
    const methodLabel = method === 'script' ? 'Script Tag' : 'Package Manager';
    addUserMessage(`Selected ${methodLabel} method`);

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `📦 Proceeding with **${methodLabel}** installation.\n\nPlease check the authentication info and installation code below.` },
        { type: 'web-sdk-install-code', method, appName, webToken },
      ]);
    }, 300);
  };

  // Web SDK Install Code Complete handler (Step 2-3)
  const handleWebSdkInstallCodeComplete = (appName: string, webToken: string) => {
    addUserMessage('Installation code applied');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '⚙️ **Initialization Options** (Optional)\n\nSelect options to auto-generate the code.' },
        { type: 'web-sdk-init-options', appName, webToken },
      ]);
    }, 300);
  };

  // Web SDK Init Options Complete handler (Step 4)
  const handleWebSdkInitOptionsComplete = (options: Record<string, boolean | number | string>) => {
    addUserMessage('Initialization options configured');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '👤 **User Identity Setup** (Optional)\n\nLinking user info on login enables more accurate analytics.' },
        { type: 'web-sdk-user-identity' },
      ]);
    }, 300);
  };

  // Web SDK Init Options Skip handler
  const handleWebSdkInitOptionsSkip = () => {
    addUserMessage('Proceeding with default settings');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '👤 **User Identity Setup** (Optional)\n\nLinking user info on login enables more accurate analytics.' },
        { type: 'web-sdk-user-identity' },
      ]);
    }, 300);
  };

  // Web SDK User Identity Complete handler (Step 5)
  const handleWebSdkUserIdentityComplete = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('User identity setup complete');
    updateAppStepStatus(app.id, 'web-sdk-install', 'completed');

    // Check if there are mobile platforms to set up
    const hasMobilePlatforms = app.platforms.includes('ios') || app.platforms.includes('android');

    setTimeout(() => {
      if (hasMobilePlatforms) {
        addBotMessage([
          { type: 'text', text: '✅ **Web SDK Installation Complete!**\n\nNow let\'s set up the SDK for your mobile platforms.\n\nSelect your development framework:' },
          { type: 'framework-select' },
        ]);
        updateAppStepStatus(app.id, 'sdk-init', 'in_progress');
      } else {
        // Web only - proceed to deeplink
        addBotMessage([
          { type: 'text', text: '✅ **Web SDK Installation Complete!**\n\n🔗 Now let\'s set up **deep links** to direct users from ads to specific pages in your app.\n\nWould you like to set it up now?' },
          { type: 'deeplink-choice' },
        ]);
        updateAppStepStatus(app.id, 'sdk-init', 'completed');
        updateAppStepStatus(app.id, 'deeplink', 'in_progress');
      }
    }, 300);
  };

  // Web SDK User Identity Skip handler
  const handleWebSdkUserIdentitySkip = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('Skipped user identity setup');
    updateAppStepStatus(app.id, 'web-sdk-install', 'completed');

    // Check if there are mobile platforms to set up
    const hasMobilePlatforms = app.platforms.includes('ios') || app.platforms.includes('android');

    setTimeout(() => {
      if (hasMobilePlatforms) {
        addBotMessage([
          { type: 'text', text: '✅ **Web SDK Installation Complete!**\n\nNow let\'s set up the SDK for your mobile platforms.\n\nSelect your development framework:' },
          { type: 'framework-select' },
        ]);
        updateAppStepStatus(app.id, 'sdk-init', 'in_progress');
      } else {
        // Web only - proceed to deeplink
        addBotMessage([
          { type: 'text', text: '✅ **Web SDK Installation Complete!**\n\n🔗 Now let\'s set up **deep links** to direct users from ads to specific pages in your app.\n\nWould you like to set it up now?' },
          { type: 'deeplink-choice' },
        ]);
        updateAppStepStatus(app.id, 'sdk-init', 'completed');
        updateAppStepStatus(app.id, 'deeplink', 'in_progress');
      }
    }, 300);
  };

  // ===== iOS SDK Handlers (Native Only) =====

  // iOS SDK Install Complete handler
  const handleIosSdkInstallComplete = (method: 'cocoapods' | 'spm') => {
    const app = currentApp;
    if (!app) return;

    const methodLabel = method === 'cocoapods' ? 'CocoaPods' : 'Swift Package Manager';
    addUserMessage(`${methodLabel}로 iOS SDK 설치 완료`);
    updateAppStepStatus(app.id, 'ios-sdk-install', 'completed');
    updateAppStepStatus(app.id, 'ios-sdk-init', 'in_progress');

    const appName = app.appInfo.appName.toLowerCase().replace(/\s/g, '');
    const appToken = app.tokens.appSdkToken;

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✅ iOS SDK 설치 완료!\n\n이제 SDK를 초기화해보겠습니다.` },
        { type: 'ios-sdk-init', appName, appToken },
      ]);
    }, 300);
  };

  // iOS SDK Init Complete handler
  const handleIosSdkInitComplete = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('iOS SDK 초기화 완료');
    updateAppStepStatus(app.id, 'ios-sdk-init', 'completed');
    updateAppStepStatus(app.id, 'ios-deeplink-setup', 'in_progress');

    const appName = app.appInfo.appName.toLowerCase().replace(/\s/g, '');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✅ iOS SDK 초기화 완료!\n\n이제 딥링크를 설정해보겠습니다.` },
        { type: 'ios-deeplink-setup', appName, bundleId: app.appInfo.bundleId },
      ]);
    }, 300);
  };

  // iOS Deep Link Setup Complete handler
  const handleIosDeeplinkSetupComplete = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('iOS 딥링크 설정 완료');
    updateAppStepStatus(app.id, 'ios-deeplink-setup', 'completed');

    // Check if Android SDK needs to be set up
    if (app.platforms.includes('android') && app.framework === 'android-native') {
      // Need to set up Android too
      updateAppStepStatus(app.id, 'android-sdk-install', 'in_progress');
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `✅ iOS SDK 설정 완료!\n\n이제 Android SDK를 설정해보겠습니다.` },
          { type: 'android-sdk-install' },
        ]);
      }, 300);
    } else {
      // iOS only or both platforms with same native framework - proceed to SDK test
      updateAppStepStatus(app.id, 'sdk-test', 'in_progress');
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `🎉 **iOS SDK 설정 완료!**\n\n이제 SDK 연동을 테스트해보겠습니다.` },
          { type: 'sdk-test' },
        ]);
      }, 300);
    }
  };

  // ===== Android SDK Handlers (Native Only) =====

  // Android SDK Install Complete handler
  const handleAndroidSdkInstallComplete = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('Android SDK 설치 완료');
    updateAppStepStatus(app.id, 'android-sdk-install', 'completed');
    updateAppStepStatus(app.id, 'android-sdk-init', 'in_progress');

    const appName = app.appInfo.appName.toLowerCase().replace(/\s/g, '');
    const appToken = app.tokens.appSdkToken;

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✅ Android SDK 설치 완료!\n\n이제 SDK를 초기화해보겠습니다.` },
        { type: 'android-sdk-init', appName, appToken },
      ]);
    }, 300);
  };

  // Android SDK Init Complete handler
  const handleAndroidSdkInitComplete = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('Android SDK 초기화 완료');
    updateAppStepStatus(app.id, 'android-sdk-init', 'completed');
    updateAppStepStatus(app.id, 'android-deeplink-setup', 'in_progress');

    const appName = app.appInfo.appName.toLowerCase().replace(/\s/g, '');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✅ Android SDK 초기화 완료!\n\n이제 딥링크를 설정해보겠습니다.` },
        { type: 'android-deeplink-setup', appName, packageName: app.appInfo.packageName },
      ]);
    }, 300);
  };

  // Android Deep Link Setup Complete handler
  const handleAndroidDeeplinkSetupComplete = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('Android 딥링크 설정 완료');
    updateAppStepStatus(app.id, 'android-deeplink-setup', 'completed');

    // Proceed to SDK test
    updateAppStepStatus(app.id, 'sdk-test', 'in_progress');
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `🎉 **Android SDK 설정 완료!**\n\n이제 SDK 연동을 테스트해보겠습니다.` },
        { type: 'sdk-test' },
      ]);
    }, 300);
  };

  // Framework select handler
  const handleFrameworkSelect = (framework: string) => {
    setSetupState(prev => ({ ...prev, framework }));

    const frameworkLabels: Record<string, string> = {
      'react-native': 'React Native',
      'flutter': 'Flutter',
      'ios-native': 'iOS Native',
      'android-native': 'Android Native',
      'unity': 'Unity',
      'expo': 'Expo',
    };
    addUserMessage(frameworkLabels[framework] || framework);

    if (currentAppId) {
      const app = registeredApps.find(a => a.id === currentAppId);
      const platforms = app?.platforms || [];

      // Regenerate steps based on framework selection
      const newSteps = app?.environment === 'dev'
        ? createDevAppSteps(platforms, framework)
        : createAppSteps(platforms, framework);

      setRegisteredApps(prev => prev.map(a =>
        a.id === currentAppId ? { ...a, framework, steps: newSteps } : a
      ));

      // Native framework: start with platform-specific SDK installation (priority over web)
      const isNativeFramework = framework === 'ios-native' || framework === 'android-native';

      if (isNativeFramework) {
        if (framework === 'ios-native') {
          updateAppStepStatus(currentAppId, 'ios-sdk-install', 'in_progress');
          setTimeout(() => {
            addBotMessage([
              { type: 'text', text: `🍎 **iOS SDK 설치**\n\n먼저 iOS SDK를 설치하겠습니다.` },
              { type: 'ios-sdk-install' },
            ]);
          }, 300);
        } else if (framework === 'android-native') {
          updateAppStepStatus(currentAppId, 'android-sdk-install', 'in_progress');
          setTimeout(() => {
            addBotMessage([
              { type: 'text', text: `🤖 **Android SDK 설치**\n\n먼저 Android SDK를 설치하겠습니다.` },
              { type: 'android-sdk-install' },
            ]);
          }, 300);
        }
        return;
      }

      // Web-only platform: go to web-sdk-install
      // (For cross-platform frameworks with web, Web SDK will be handled separately)
      const hasOnlyWeb = platforms.length === 1 && platforms.includes('web');
      if (hasOnlyWeb) {
        updateAppStepStatus(currentAppId, 'web-sdk-install', 'in_progress');
        const webAppName = app?.appInfo.appName.toLowerCase().replace(/\s/g, '') || 'myapp';
        const webToken = app?.tokens.webSdkToken || 'web-token';
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `🌐 **Web SDK 설치** - **${app?.appInfo.appName}**\n\nWeb SDK를 설치하겠습니다. 설치 방법을 선택해주세요.` },
            { type: 'web-sdk-method-select', appName: webAppName, webToken },
          ]);
        }, 300);
        return;
      }

      // Cross-platform framework: use unified SDK flow
      updateAppStepStatus(currentAppId, 'sdk-install', 'completed');
      updateAppStepStatus(currentAppId, 'sdk-init', 'in_progress');
    }

    // Get current app tokens
    const appTokenValue = currentApp?.tokens.appSdkToken || 'YOUR_APP_TOKEN';
    const appNameValue = currentApp?.appInfo.appName?.toLowerCase().replace(/\s/g, '') || setupState.appInfo?.appName?.toLowerCase().replace(/\s/g, '') || 'myapp';

    // Cross-platform frameworks: Show SDK install code + sdk-install-confirm
    if (framework === 'react-native') {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '⚛️ **React Native SDK 설치**\n\n📦 터미널에서 아래 명령어를 실행해 주세요:' },
          { type: 'code-block', title: 'Step 1: 패키지 설치', code: 'npm install airbridge-react-native-sdk', language: 'bash' },
          { type: 'code-block', title: 'Step 2: iOS 추가 설정', code: 'cd ios && pod install', language: 'bash' },
          { type: 'sdk-install-confirm' },
        ]);
      }, 300);
    } else if (framework === 'flutter') {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '💙 **Flutter SDK 설치**\n\n📦 아래 내용을 `pubspec.yaml`에 추가하고 설치해 주세요:' },
          { type: 'code-block', title: 'pubspec.yaml', code: `dependencies:
  airbridge_flutter_sdk: ^3.0.0`, language: 'yaml' },
          { type: 'code-block', title: '설치', code: 'flutter pub get', language: 'bash' },
          { type: 'sdk-install-confirm' },
        ]);
      }, 300);
    } else if (framework === 'unity') {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '🎮 **Unity SDK 설치**\n\n📦 아래 방법 중 하나로 SDK를 설치해 주세요:\n\n1. Unity Package Manager에서 최신 Airbridge Unity SDK 다운로드\n2. 또는 `.unitypackage` 파일 임포트' },
          { type: 'sdk-install-confirm' },
        ]);
      }, 300);
    } else if (framework === 'expo') {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '📱 **Expo SDK 설치**\n\n📦 아래 명령어를 실행해 주세요:' },
          { type: 'code-block', title: '패키지 설치', code: 'npx expo install airbridge-react-native-sdk', language: 'bash' },
          { type: 'code-block', title: 'app.json 설정', code: `{
  "expo": {
    "plugins": [
      [
        "airbridge-react-native-sdk",
        {
          "appName": "${appNameValue}",
          "appToken": "${appTokenValue}"
        }
      ]
    ]
  }
}`, language: 'json' },
          { type: 'code-block', title: '앱 재빌드', code: 'npx expo prebuild --clean && npx expo run:ios', language: 'bash' },
          { type: 'sdk-install-confirm' },
        ]);
      }, 300);
    } else {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `📦 **${frameworkLabels[framework] || framework}** SDK 설치 가이드를 확인해 주세요.` },
          { type: 'sdk-install-confirm' },
        ]);
      }, 300);
    }
  };

  // SDK init confirm handler
  const handleSDKInitConfirm = (status: string) => {
    addUserMessage('Done!');

    if (currentAppId) {
      updateAppStepStatus(currentAppId, 'sdk-init', 'completed');
      updateAppStepStatus(currentAppId, 'deeplink', 'in_progress');
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '🏁 Almost there!\n\n🔗 **Deep link setup** is needed.\n\nWith deep links, you can direct users from ad clicks to specific screens in your app.\n\nWould you like to set it up?' },
        { type: 'deeplink-choice' },
      ]);
    }, 300);
  };

  // New Guide-aligned handlers for SDK Install Flow

  // SDK Install Confirm handler (Guide 2-2)
  const handleNewSdkInstallConfirm = (status: 'done' | 'error') => {
    if (status === 'done') {
      addUserMessage('설치 완료!');

      if (currentAppId) {
        updateAppStepStatus(currentAppId, 'sdk-install', 'completed');
        updateAppStepStatus(currentAppId, 'sdk-init', 'in_progress');
      }

      const appTokenValue = currentApp?.tokens.appSdkToken || 'YOUR_APP_TOKEN';
      const appNameValue = currentApp?.appInfo.appName?.toLowerCase().replace(/\s/g, '') || 'myapp';
      const framework = setupState.framework;

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '👍 잘 진행되고 있어요!\n\n⚙️ 이제 SDK를 **초기화**하겠습니다.\n\n아래 코드를 앱 진입점에 추가해 주세요.\nApp Name과 App Token은 이미 채워놨어요!' },
          { type: 'sdk-init-code', appName: appNameValue, appToken: appTokenValue },
          { type: 'sdk-init-confirm' },
        ]);
      }, 300);
    } else {
      addUserMessage('에러가 발생했어요');
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '🔧 에러가 발생했군요.\n\n아래 상황을 선택해 주세요:' },
          { type: 'single-select', options: [
            { label: '앱이 크래시나요', value: 'crash' },
            { label: '빌드 에러가 발생해요', value: 'build-error' },
            { label: '다시 시도할게요', value: 'retry' },
          ]},
        ]);
      }, 300);
    }
  };

  // SDK Init Confirm handler (Guide 2-3)
  const handleNewSdkInitConfirm = (status: 'done' | 'token-help') => {
    if (status === 'done') {
      addUserMessage('추가 완료!');

      if (currentAppId) {
        updateAppStepStatus(currentAppId, 'sdk-init', 'completed');
      }

      // Check if it's web-only (no deeplink needed)
      const platforms = currentApp?.platforms || setupState.platforms || [];
      const hasOnlyWeb = platforms.length === 1 && platforms.includes('web');

      if (hasOnlyWeb) {
        // Skip deeplink for web-only, go directly to verification
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: '🎉 SDK 설정이 완료되었어요!\n\n이제 제대로 동작하는지 확인해볼게요.\n앱을 실행하고, Real-time Logs에서 이벤트를 확인해 주세요.' },
            { type: 'sdk-verification' },
          ]);
        }, 300);
      } else {
        // Show deeplink setup choice
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: '🏁 거의 다 왔어요!\n\n딥링크 설정이 필요해요.\n딥링크를 사용하면 광고 클릭 시 앱 내 특정 화면으로 바로 이동할 수 있어요.' },
            { type: 'deeplink-setup-choice' },
          ]);
        }, 300);
      }
    } else {
      addUserMessage('App Token을 모르겠어요');
      setTimeout(() => {
        const appTokenValue = currentApp?.tokens.appSdkToken || 'YOUR_APP_TOKEN';
        addBotMessage([
          { type: 'text', text: `💡 App Token은 앱 등록 시 생성된 토큰이에요.\n\n**당신의 App Token:**\n\`${appTokenValue}\`\n\n위 토큰을 SDK 초기화 코드에 입력해 주세요.` },
        ]);
      }, 300);
    }
  };

  // Deeplink Setup Choice handler (Guide 2-4)
  const handleDeeplinkSetupChoice = (choice: 'now' | 'later') => {
    addUserMessage(choice === 'now' ? '지금 설정할게요' : '나중에 설정할게요');

    if (choice === 'later') {
      // Skip deeplink, go to verification
      if (currentAppId) {
        updateAppStepStatus(currentAppId, 'deeplink', 'completed');
        updateAppStepStatus(currentAppId, 'sdk-verify', 'in_progress');
      }

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '✅ 딥링크 설정은 나중에 할게요.\n\n🧪 이제 SDK 통합이 제대로 작동하는지 **확인**해볼게요.\n앱을 실행하고, Real-time Logs에서 이벤트를 확인해 주세요.' },
          { type: 'sdk-verification' },
        ]);
      }, 300);
    } else {
      // Start deeplink setup - same as existing handleDeeplinkChoice 'now' logic
      if (currentAppId) {
        updateAppStepStatus(currentAppId, 'deeplink', 'in_progress');
      }

      const platforms = currentApp?.platforms || setupState.platforms || [];
      const hasIos = platforms.includes('ios');
      const hasAndroid = platforms.includes('android');

      setDeeplinkState({ completedPlatforms: [] });

      setTimeout(() => {
        if (hasIos) {
          addBotMessage([
            { type: 'text', text: '🔗 **딥링크 설정을 시작할게요!**\n\n먼저 iOS 딥링크에 필요한 정보를 입력해 주세요.' },
            { type: 'deeplink-ios-input', bundleId: currentApp?.appInfo.bundleId || setupState.appInfo?.bundleId },
          ]);
        } else if (hasAndroid) {
          addBotMessage([
            { type: 'text', text: '🔗 **딥링크 설정을 시작할게요!**\n\nAndroid 딥링크에 필요한 정보를 입력해 주세요.' },
            { type: 'deeplink-android-input', packageName: currentApp?.appInfo.packageName || setupState.appInfo?.packageName },
          ]);
        }
      }, 300);
    }
  };

  // SDK Verification Result handler (Guide 2-5)
  const handleNewSdkVerificationResult = (result: 'success' | 'fail' | 'unsure') => {
    if (result === 'success') {
      addUserMessage('이벤트가 보여요!');

      const currentAppData = registeredApps.find(app => app.id === currentAppId);
      const isDevMode = currentAppData?.environment === 'dev';

      if (isDevMode) {
        // Dev mode: Show completion
        if (currentAppId) {
          updateAppStepStatus(currentAppId, 'sdk-verify', 'completed');
          setRegisteredApps(prev => prev.map(app =>
            app.id === currentAppId ? { ...app, currentPhase: 3 } : app
          ));
        }

        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: '🎉 **Development 설정 완료!**' },
            { type: 'dev-completion-summary', appName: setupState.appInfo?.appName || currentApp?.appInfo.appName || 'Your App' },
          ]);
        }, 300);
      } else {
        // Production mode: Continue to channel integration
        if (currentAppId) {
          updateAppStepStatus(currentAppId, 'sdk-verify', 'completed');
          updateAppStepStatus(currentAppId, 'channel-connect', 'in_progress');
          setRegisteredApps(prev => prev.map(app =>
            app.id === currentAppId ? { ...app, currentPhase: 3 } : app
          ));
        }
        setCurrentPhase(3);

        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: '🎉 SDK 설정 완료!\n\n📊 이제 **광고 채널 연동**을 진행할게요.\n\n어떤 광고 플랫폼을 연결하시겠어요?\n(복수 선택 가능)' },
            { type: 'channel-select' },
          ]);
        }, 300);
      }
    } else if (result === 'fail') {
      addUserMessage('이벤트가 안 보여요');
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '🤔 이벤트가 안 보이시는군요.\n\n몇 가지 확인해볼게요:\n\n1️⃣ 앱이 **Debug 모드**로 실행 중인가요?\n2️⃣ **네트워크 연결**은 정상인가요?\n3️⃣ **App Token**이 올바른가요?\n\n아래에서 상황을 선택해 주세요:' },
          { type: 'single-select', options: [
            { label: '앱이 크래시나요', value: 'crash' },
            { label: '앱은 되는데 이벤트만 안 보여요', value: 'no-event' },
            { label: '다시 확인해볼게요', value: 'retry' },
          ]},
        ]);
      }, 300);
    } else {
      addUserMessage('잘 모르겠어요');
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '🔍 Real-time Logs에서 확인하는 방법을 알려드릴게요.\n\n1. 앱을 실행한 후 **10분 정도** 기다려주세요\n2. Real-time Logs에서 **Install** 또는 **Open** 이벤트를 찾아주세요\n3. 이벤트가 보이면 성공이에요!\n\n다시 확인해보시겠어요?' },
          { type: 'sdk-verification' },
        ]);
      }, 300);
    }
  };

  // Deep link choice handler
  const handleDeeplinkChoice = (choice: string) => {
    addUserMessage(choice === 'now' ? 'Set up now' : 'Set up later');

    if (choice === 'later') {
      // Skip deeplink setup
      if (currentAppId) {
        updateAppStepStatus(currentAppId, 'deeplink', 'completed');
        updateAppStepStatus(currentAppId, 'sdk-test', 'in_progress');
      }

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '✅ Deep link setup will be done later.\n\n🧪 Now let\'s **test** if the SDK integration is working properly.' },
          { type: 'sdk-test' },
        ]);
      }, 300);
      return;
    }

    // Start deeplink setup flow - determine which platforms need setup
    const platforms = currentApp?.platforms || setupState.platforms || [];
    const hasIos = platforms.includes('ios');
    const hasAndroid = platforms.includes('android');

    // Reset deeplink state
    setDeeplinkState({ completedPlatforms: [] });

    setTimeout(() => {
      if (hasIos) {
        // Start with iOS
        addBotMessage([
          { type: 'text', text: '🔗 **Let\'s start deep link setup!**\n\nFirst, please enter the required information for iOS deep links.' },
          { type: 'deeplink-ios-input', bundleId: currentApp?.appInfo.bundleId || setupState.appInfo.bundleId },
        ]);
      } else if (hasAndroid) {
        // Start with Android
        addBotMessage([
          { type: 'text', text: '🔗 **Let\'s start deep link setup!**\n\nFirst, please enter the required information for Android deep links.' },
          { type: 'deeplink-android-input', packageName: currentApp?.appInfo.packageName || setupState.appInfo.packageName },
        ]);
      } else {
        // No mobile platforms, skip deeplink
        if (currentAppId) {
          updateAppStepStatus(currentAppId, 'deeplink', 'completed');
          updateAppStepStatus(currentAppId, 'sdk-test', 'in_progress');
        }
        addBotMessage([
          { type: 'text', text: '📱 Deep links are only used on mobile platforms (iOS/Android).\n\n🧪 Proceeding to SDK testing.' },
          { type: 'sdk-test' },
        ]);
      }
    }, 300);
  };

  // Deeplink iOS submit handler
  const handleDeeplinkIosSubmit = (data: { uriScheme: string; appId: string }) => {
    setDeeplinkState(prev => ({ ...prev, iosData: data, currentPlatform: 'ios' }));
    addUserMessage(`iOS setup: ${data.uriScheme}`);

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '📋 iOS 딥링크 정보를 등록합니다...' },
        { type: 'deeplink-dashboard-guide', platform: 'ios', data: { uriScheme: data.uriScheme, appId: data.appId } },
      ]);
    }, 300);
  };

  // Deeplink Android submit handler
  const handleDeeplinkAndroidSubmit = (data: { uriScheme: string; packageName: string; sha256Fingerprints: string[] }) => {
    setDeeplinkState(prev => ({ ...prev, androidData: data, currentPlatform: 'android' }));
    addUserMessage(`Android setup: ${data.uriScheme}`);

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '📋 Android 딥링크 정보를 등록합니다...' },
        { type: 'deeplink-dashboard-guide', platform: 'android', data: { uriScheme: data.uriScheme, packageName: data.packageName, sha256Fingerprints: data.sha256Fingerprints } },
      ]);
    }, 300);
  };

  // Deeplink Dashboard complete handler
  const handleDeeplinkDashboardComplete = (platform: 'ios' | 'android') => {
    addUserMessage(`${platform === 'ios' ? 'iOS' : 'Android'} 딥링크 설정 완료`);

    const appName = currentApp?.appInfo.appName.toLowerCase().replace(/\s/g, '') || 'myapp';
    const framework = currentApp?.framework || setupState.framework || 'Native';
    const uriScheme = platform === 'ios'
      ? deeplinkState.iosData?.uriScheme || 'myapp://'
      : deeplinkState.androidData?.uriScheme || 'myapp://';

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `⚙️ Now please add deep link configuration to the ${platform === 'ios' ? 'iOS' : 'Android'} SDK.` },
        { type: 'deeplink-sdk-setup', platform, framework, appName },
      ]);
    }, 300);
  };

  // Deeplink SDK setup complete handler
  const handleDeeplinkSdkSetupComplete = (platform: 'ios' | 'android') => {
    const updatedCompletedPlatforms = [...deeplinkState.completedPlatforms, platform];
    setDeeplinkState(prev => ({ ...prev, completedPlatforms: updatedCompletedPlatforms }));
    addUserMessage(`${platform === 'ios' ? 'iOS' : 'Android'} SDK setup complete`);

    const platforms = currentApp?.platforms || setupState.platforms || [];
    const hasIos = platforms.includes('ios');
    const hasAndroid = platforms.includes('android');

    // Check if we need to set up the other platform
    if (platform === 'ios' && hasAndroid && !updatedCompletedPlatforms.includes('android')) {
      // iOS done, now do Android
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '✅ iOS deep link setup complete!\n\nNow let\'s set up Android deep links.' },
          { type: 'deeplink-android-input', packageName: currentApp?.appInfo.packageName || setupState.appInfo.packageName },
        ]);
      }, 300);
    } else if (platform === 'android' && hasIos && !updatedCompletedPlatforms.includes('ios')) {
      // Android done, now do iOS
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '✅ Android deep link setup complete!\n\nNow let\'s set up iOS deep links.' },
          { type: 'deeplink-ios-input', bundleId: currentApp?.appInfo.bundleId || setupState.appInfo.bundleId },
        ]);
      }, 300);
    } else {
      // All platforms done, proceed to test
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '🧪 Deep link setup is complete for all platforms!\n\nNow let\'s test if the deep links are working properly.' },
          { type: 'deeplink-test-checklist' },
        ]);
      }, 300);
    }
  };

  // Deeplink test ready handler
  const handleDeeplinkTestReady = () => {
    addUserMessage('Test preparation complete');

    const appName = currentApp?.appInfo.appName.toLowerCase().replace(/\s/g, '') || 'myapp';

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '🧪 딥링크 테스트를 시작합니다.\n\n아래 시나리오별로 테스트를 진행해주세요.' },
        { type: 'deeplink-test-scenarios', appName },
      ]);
    }, 300);
  };

  // Deeplink test complete handler
  const handleDeeplinkTestComplete = () => {
    addUserMessage('Deep link test complete');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '🎉 Deep link setup is complete!' },
        { type: 'deeplink-complete' },
      ]);
    }, 300);
  };

  // Deeplink create tracking link handler
  const handleDeeplinkCreateTrackingLink = () => {
    addUserMessage('Create tracking link');

    if (currentAppId) {
      updateAppStepStatus(currentAppId, 'deeplink', 'completed');
      updateAppStepStatus(currentAppId, 'tracking-link', 'in_progress');
    }

    const appName = currentApp?.appInfo.appName.toLowerCase().replace(/\s/g, '') || 'myapp';

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '🔗 Navigating to tracking link creation page.' },
        { type: 'tracking-link-create', channel: 'organic' },
      ]);
    }, 300);
  };

  // Deeplink continue to channel handler
  const handleDeeplinkContinue = () => {
    addUserMessage('채널 연동으로 계속하기');

    if (currentAppId) {
      updateAppStepStatus(currentAppId, 'deeplink', 'completed');
      updateAppStepStatus(currentAppId, 'sdk-test', 'in_progress');
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '🧪 이제 SDK 통합이 제대로 작동하는지 **테스트**해 보겠습니다.' },
        { type: 'sdk-test' },
      ]);
    }, 300);
  };

  // Token display continue handler - proceeds to SDK setup (directly to framework select)
  const handleTokenDisplayContinue = () => {
    setCurrentPhase(2);
    if (currentAppId) {
      updateAppStepStatus(currentAppId, 'sdk-install', 'in_progress');
      setRegisteredApps(prev => prev.map(app =>
        app.id === currentAppId ? { ...app, currentPhase: 2 } : app
      ));
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '🛠️ **SDK 설치**\n\n이제 SDK를 설치하겠습니다.\n앱 개발에 사용하신 프레임워크를 선택해 주세요.' },
        { type: 'framework-select' },
      ]);
    }, 300);
  };

  // SDK verify confirm handler
  const handleSDKVerifyConfirm = (status: string) => {
    addUserMessage(status === 'yes' ? 'Events confirmed' : status === 'no' ? 'Can\'t see them' : 'Not sure');

    if (status === 'yes') {
      // Check if current app is in Dev mode
      const currentAppData = registeredApps.find(app => app.id === currentAppId);
      const isDevMode = currentAppData?.environment === 'dev';

      if (isDevMode) {
        // Dev mode: Skip channel integration, show completion
        if (currentAppId) {
          updateAppStepStatus(currentAppId, 'sdk-verify', 'completed');
          // Mark all remaining steps as completed for Dev mode
          setRegisteredApps(prev => prev.map(app =>
            app.id === currentAppId ? { ...app, currentPhase: 3 } : app
          ));
        }

        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: '🎉 **Development setup complete!**' },
            { type: 'dev-completion-summary', appName: setupState.appInfo.appName },
          ]);
        }, 300);
      } else {
        // Production mode: Continue to channel integration
        if (currentAppId) {
          updateAppStepStatus(currentAppId, 'sdk-verify', 'completed');
          updateAppStepStatus(currentAppId, 'channel-connect', 'in_progress');
          setRegisteredApps(prev => prev.map(app =>
            app.id === currentAppId ? { ...app, currentPhase: 3 } : app
          ));
        }
        setCurrentPhase(3);

        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: '🎉 SDK setup complete!\n\n📊 Now let\'s integrate **ad channels**.\n\nWhich ad platforms do you want to connect?\n(Multiple selection allowed)' },
            { type: 'channel-select' },
          ]);
        }, 300);
      }
    } else {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '🤔 Can\'t see the events?\n\nLet me help you troubleshoot:\n\n1️⃣ Is your app running in **Debug mode**?\n2️⃣ Is your **network connection** stable?\n3️⃣ Is the **App Token** correct?\n\nPlease select your situation below:' },
          { type: 'single-select', options: [
            { label: 'My app is crashing', value: 'crash' },
            { label: 'App works but no events', value: 'no-event' },
            { label: 'Let me check again', value: 'retry' },
          ]},
        ]);
      }, 300);
    }
  };

  // Channel select handler
  const handleChannelSelect = (channels: string[]) => {
    setSetupState(prev => ({ ...prev, channels }));
    const channelLabels: Record<string, string> = {
      meta: 'Meta Ads',
      google: 'Google Ads',
      apple: 'Apple Search Ads',
      tiktok: 'TikTok',
    };
    addUserMessage(channels.map(c => channelLabels[c] || c).join(', '));

    if (currentAppId) {
      setRegisteredApps(prev => prev.map(app =>
        app.id === currentAppId ? { ...app, channels } : app
      ));
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `Great choices! You've selected ${channels.length} channel(s) for integration.\n\nLet me explain the integration process:` },
        { type: 'channel-integration-overview', selectedChannels: channels },
      ]);
    }, 300);
  };

  // Channel Integration handlers
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [channelSteps, setChannelSteps] = useState<Record<string, ChannelStep[]>>({});
  const [configuredEvents, setConfiguredEvents] = useState<EventConfig[]>([]);

  // GitHub Automation State
  const [gitHubState, setGitHubState] = useState<GitHubAutomationState>({
    isConnected: false,
    selectedRepo: undefined,
    currentStep: null,
    pendingPR: undefined,
  });
  const [isAutomationMode, setIsAutomationMode] = useState(false);

  const handleChannelIntegrationStart = (channels: string[]) => {
    setSelectedChannels(channels);
    setCurrentChannelIndex(0);
    addUserMessage('Start Integration');

    const firstChannel = channels[0];
    const hasIOS = setupState.platforms.includes('ios');

    const initialSteps: ChannelStep[] = [
      { id: 'channel', label: 'Channel Integration', status: 'in_progress', required: true },
      { id: 'cost', label: 'Cost Integration', status: 'pending', required: false },
      { id: 'skan', label: 'SKAN Integration', status: 'pending', required: hasIOS },
    ];

    setChannelSteps(prev => ({ ...prev, [firstChannel]: initialSteps }));

    setTimeout(() => {
      startChannelIntegration(firstChannel, hasIOS, initialSteps);
    }, 300);
  };

  const startChannelIntegration = (channel: string, hasIOS: boolean, steps: ChannelStep[]) => {
    const channelNames: Record<string, string> = {
      meta: 'Meta Ads',
      google: 'Google Ads',
      apple: 'Apple Search Ads',
      tiktok: 'TikTok For Business',
    };

    const messages: MessageContent[] = [
      { type: 'text', text: `Let's set up **${channelNames[channel] || channel}**!\n\nThis integration has ${hasIOS ? '3' : '2'} steps:` },
      { type: 'channel-progress', channel, steps, hasIOS },
    ];

    if (channel === 'apple') {
      messages.push({ type: 'apple-version-check' });
    } else if (channel === 'meta') {
      messages.push({ type: 'meta-channel-integration' });
    } else if (channel === 'google') {
      messages.push({ type: 'google-channel-integration' });
    } else if (channel === 'tiktok') {
      messages.push({ type: 'tiktok-channel-integration' });
    }

    addBotMessage(messages);
  };

  const handleChannelStepComplete = (channel: string, step: 'channel' | 'cost' | 'skan') => {
    addUserMessage('Done');
    const hasIOS = setupState.platforms.includes('ios');

    setChannelSteps(prev => {
      const steps = [...(prev[channel] || [])];
      const stepIndex = steps.findIndex(s => s.id === step);
      if (stepIndex !== -1) {
        steps[stepIndex] = { ...steps[stepIndex], status: 'completed' };
        const nextIndex = stepIndex + 1;
        if (nextIndex < steps.length && (steps[nextIndex].id !== 'skan' || hasIOS)) {
          steps[nextIndex] = { ...steps[nextIndex], status: 'in_progress' };
        }
      }
      return { ...prev, [channel]: steps };
    });

    setTimeout(() => {
      const nextStep = getNextStep(channel, step, hasIOS);
      if (nextStep) {
        showNextStepUI(channel, nextStep, hasIOS);
      } else {
        showChannelCompletion(channel);
      }
    }, 300);
  };

  const handleChannelStepSkip = (channel: string, step: 'channel' | 'cost' | 'skan') => {
    addUserMessage('Skip for now');
    const hasIOS = setupState.platforms.includes('ios');

    setChannelSteps(prev => {
      const steps = [...(prev[channel] || [])];
      const stepIndex = steps.findIndex(s => s.id === step);
      if (stepIndex !== -1) {
        steps[stepIndex] = { ...steps[stepIndex], status: 'skipped' };
        const nextIndex = stepIndex + 1;
        if (nextIndex < steps.length && (steps[nextIndex].id !== 'skan' || hasIOS)) {
          steps[nextIndex] = { ...steps[nextIndex], status: 'in_progress' };
        }
      }
      return { ...prev, [channel]: steps };
    });

    setTimeout(() => {
      const nextStep = getNextStep(channel, step, hasIOS);
      if (nextStep) {
        showNextStepUI(channel, nextStep, hasIOS);
      } else {
        showChannelCompletion(channel);
      }
    }, 300);
  };

  const getNextStep = (channel: string, currentStep: 'channel' | 'cost' | 'skan', hasIOS: boolean): 'cost' | 'skan' | null => {
    if (currentStep === 'channel') return 'cost';
    if (currentStep === 'cost' && hasIOS) return 'skan';
    return null;
  };

  const showNextStepUI = (channel: string, step: 'cost' | 'skan', hasIOS: boolean) => {
    const steps = channelSteps[channel] || [];
    const updatedSteps = steps.map(s => ({
      ...s,
      status: s.id === step ? 'in_progress' as const : s.status
    }));

    let content: MessageContent;
    if (step === 'cost') {
      if (channel === 'meta') content = { type: 'meta-cost-integration' };
      else if (channel === 'google') content = { type: 'google-cost-integration' };
      else if (channel === 'apple') content = { type: 'apple-cost-integration' };
      else content = { type: 'tiktok-cost-integration' };
    } else {
      if (channel === 'meta') content = { type: 'meta-skan-integration' };
      else if (channel === 'google') content = { type: 'google-skan-integration' };
      else content = { type: 'tiktok-skan-integration' };
    }

    addBotMessage([
      { type: 'text', text: step === 'cost' ? 'Great! Now let\'s set up Cost Integration:' : 'Almost done! Let\'s configure SKAN for iOS:' },
      { type: 'channel-progress', channel, steps: updatedSteps, hasIOS },
      content,
    ]);
  };

  const showChannelCompletion = (channel: string) => {
    addBotMessage([
      { type: 'channel-completion', channel },
    ]);
  };

  const handleChannelComplete = (channel: string) => {
    addUserMessage('Continue');
    const nextIndex = currentChannelIndex + 1;
    setCurrentChannelIndex(nextIndex);

    setTimeout(() => {
      if (nextIndex < selectedChannels.length) {
        const nextChannel = selectedChannels[nextIndex];
        const hasIOS = setupState.platforms.includes('ios');
        const initialSteps: ChannelStep[] = [
          { id: 'channel', label: 'Channel Integration', status: 'in_progress', required: true },
          { id: 'cost', label: 'Cost Integration', status: 'pending', required: false },
          { id: 'skan', label: 'SKAN Integration', status: 'pending', required: hasIOS },
        ];
        setChannelSteps(prev => ({ ...prev, [nextChannel]: initialSteps }));
        startChannelIntegration(nextChannel, hasIOS, initialSteps);
      } else {
        if (currentAppId) {
          updateAppStepStatus(currentAppId, 'channel-integration', 'completed');
          updateAppStepStatus(currentAppId, 'cost-integration', 'completed');
          updateAppStepStatus(currentAppId, 'skan-integration', 'completed');
        }
        // After all channels are complete, proceed to tracking link creation
        const firstChannel = selectedChannels[0] || 'Meta Ads';
        addBotMessage([
          { type: 'text', text: `**Channel integration complete!** All ${selectedChannels.length} channel(s) have been connected.\n\nNow let's create a tracking link to measure your campaign performance.` },
          { type: 'tracking-link-form', channel: firstChannel },
        ]);
        if (currentAppId) {
          updateAppStepStatus(currentAppId, 'tracking-link', 'in_progress');
        }
      }
    }, 300);
  };

  const isLastSelectedChannel = (channel: string): boolean => {
    return selectedChannels.indexOf(channel) === selectedChannels.length - 1;
  };

  const handleChannelHelp = (channel: string, issue: string) => {
    addUserMessage('I need help');
    setTimeout(() => {
      const helpMessages: Record<string, string> = {
        'meta-permission': 'For Meta Ads permission issues:\n\n1. Make sure you have **Admin** access to the ad account\n2. Check if your app is added to **Business Manager**\n3. Try disconnecting and reconnecting with a different account',
        'google-permission': 'For Google Ads permission issues:\n\n1. Verify you have **Admin** access to the Google Ads account\n2. Make sure you\'re signed in with the correct Google account',
        'apple-api': 'For Apple Search Ads API issues:\n\n1. Generate an API certificate in Apple Search Ads\n2. Download the certificate file (.pem)\n3. Upload it to Airbridge Dashboard',
        'tiktok-permission': 'For TikTok permission issues:\n\n1. Ensure you have **Admin** access to the TikTok For Business account\n2. Try reconnecting with admin credentials',
      };
      addBotMessage([
        { type: 'text', text: helpMessages[issue] || 'Please contact support for assistance with this issue.' },
        { type: 'single-select', options: [
          { label: 'Try Again', value: `retry_${channel}` },
          { label: 'Skip this channel', value: `skip_channel_${channel}` },
        ]},
      ]);
    }, 300);
  };

  const handleAppleVersionSelect = (version: 'advanced' | 'basic') => {
    addUserMessage(version === 'advanced' ? 'Advanced' : 'Basic');
    const hasIOS = setupState.platforms.includes('ios');

    setTimeout(() => {
      if (version === 'advanced') {
        addBotMessage([
          { type: 'text', text: 'Great! Let\'s set up Apple Search Ads Advanced:' },
          { type: 'apple-channel-integration' },
        ]);
      } else {
        addBotMessage([
          { type: 'text', text: '😢 Unfortunately, Apple Search Ads Basic is not supported by Airbridge.\n\nBasic version doesn\'t provide the API needed for integration. You can:\n\n• Upgrade to **Apple Search Ads Advanced**\n• Skip this channel and continue with others' },
          {
            type: 'single-select',
            options: [
              { label: 'Skip Apple Search Ads', value: 'skip_apple' },
              { label: 'I\'ll upgrade to Advanced', value: 'upgrade_apple' },
            ],
          },
        ]);
      }
    }, 300);
  };

  const handleAppleVersionHelp = () => {
    addUserMessage('I\'m not sure');
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'To check your Apple Search Ads version:\n\n1. Go to **searchads.apple.com**\n2. Log in to your account\n3. If you see "Campaign Management" with detailed options, you have **Advanced**\n4. If you see a simplified interface, you have **Basic**\n\nAlternatively, check your billing - Advanced typically has monthly spend over $10,000.' },
        { type: 'apple-version-check' },
      ]);
    }, 300);
  };

  // Event Taxonomy handlers
  const handleStandardEventSelect = (eventIds: string[]) => {
    const eventNames = eventIds.map(id => {
      const nameMap: Record<string, string> = {
        install: 'Install', open: 'Open', signup: 'Sign Up', signin: 'Sign In',
        view_product: 'View Product', add_to_cart: 'Add to Cart', purchase: 'Purchase',
        view_content: 'View Content', search: 'Search', share: 'Share',
      };
      return nameMap[id] || id;
    });

    addUserMessage(eventNames.join(', '));

    const configs: EventConfig[] = eventIds.map(id => ({
      eventId: id,
      eventName: eventNames[eventIds.indexOf(id)],
      isStandard: true,
      properties: [],
    }));
    setConfiguredEvents(configs);

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `You've selected ${eventIds.length} standard events.\n\nWould you like to add any **Custom Events** specific to your app?` },
        { type: 'custom-event-input' },
      ]);
    }, 300);
  };

  const handleCustomEventAdd = (events: { name: string; category: string }[]) => {
    if (events.length > 0) {
      addUserMessage(events.map(e => e.name).join(', '));
      const customConfigs: EventConfig[] = events.map(e => ({
        eventId: e.name.toLowerCase().replace(/\s/g, '_'),
        eventName: e.name,
        isStandard: false,
        properties: [],
      }));
      setConfiguredEvents(prev => [...prev, ...customConfigs]);
    } else {
      addUserMessage('Skip Custom Events');
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Now let\'s verify that your events are being tracked correctly:' },
        { type: 'event-verify' },
      ]);
    }, 300);
  };

  const handleCustomEventSkip = () => {
    addUserMessage('Skip for now');
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'No problem! You can add custom events later.\n\nLet\'s verify that your events are being tracked:' },
        { type: 'event-verify' },
      ]);
    }, 300);
  };

  const handleEventVerified = () => {
    addUserMessage('Events are showing!');
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Excellent! Your event tracking is working correctly.' },
        { type: 'event-taxonomy-summary', events: configuredEvents },
      ]);
    }, 300);
  };

  const handleEventVerifySkip = () => {
    addUserMessage('I\'ll verify later');
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'No problem! You can verify events anytime in the Real-time Logs.\n\nHere\'s a summary of your event configuration:' },
        { type: 'event-taxonomy-summary', events: configuredEvents },
      ]);
    }, 300);
  };

  const handleEventTaxonomyComplete = () => {
    addUserMessage('Continue to Ad Channel Integration');
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Now let\'s connect your ad channels to start measuring campaign performance!\n\nWhich ad platforms would you like to integrate?' },
        { type: 'channel-select' },
      ]);
    }, 300);
  };

  // SDK Test handler
  const handleSdkTestComplete = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('SDK test completed successfully');
    updateAppStepStatus(app.id, 'sdk-test', 'completed');

    // Check if Dev mode
    const isDevMode = app.environment === 'dev';

    if (isDevMode) {
      // Dev mode: SDK test complete = onboarding complete
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '**SDK test passed!** Your development environment is ready.\n\n🎉 **Development setup complete!**' },
          { type: 'dev-completion-summary', appName: app.appInfo.appName },
        ]);
      }, 300);
    } else {
      // Production mode: Continue to Event Taxonomy
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '**SDK test passed!** Your SDK integration is working correctly.\n\nNow let\'s set up event tracking to measure user actions in your app.' },
          { type: 'standard-event-select' },
        ]);
        updateAppStepStatus(app.id, 'event-taxonomy', 'in_progress');
      }, 300);
    }
  };

  // Tracking Link handlers
  const [trackingLinks, setTrackingLinks] = useState<TrackingLink[]>([]);

  const handleTrackingLinkCreate = (link: TrackingLink) => {
    const app = currentApp;
    if (!app) return;

    setTrackingLinks(prev => [...prev, link]);
    addUserMessage(`Created tracking link: ${link.name}`);

    setTimeout(() => {
      const updatedLinks = [...trackingLinks, link];
      addBotMessage([
        { type: 'text', text: `**Tracking link created!**\n\nYour link "${link.name}" is ready to use.` },
        { type: 'tracking-link-complete', links: updatedLinks },
      ]);
    }, 300);
  };

  const handleTrackingLinkContinue = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('Continue to Verification');
    updateAppStepStatus(app.id, 'tracking-link', 'completed');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '**Phase 5: Verification**\n\nLet\'s verify that everything is working correctly.\n\nFirst, we\'ll test your deep link configuration.' },
        { type: 'deeplink-test' },
      ]);
      updateAppStepStatus(app.id, 'deeplink-test', 'in_progress');
    }, 300);
  };

  // Attribution Test handler
  const handleAttributionTestComplete = (passed: boolean) => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('Attribution test completed');
    updateAppStepStatus(app.id, 'attribution-test', 'completed');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '**Attribution test passed!** Your attribution tracking is working correctly.\n\nFinally, let\'s verify that data is being collected properly.' },
        { type: 'data-verify' },
      ]);
      updateAppStepStatus(app.id, 'data-verify', 'in_progress');
    }, 300);
  };

  // Data Verify handler
  const handleDataVerifyComplete = (metrics: DataVerifyMetrics) => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('Data verification completed');
    updateAppStepStatus(app.id, 'data-verify', 'completed');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `**Congratulations!** Your Airbridge setup is complete.\n\nYou're now tracking ${metrics.eventsReceived} events and attribution is working correctly.` },
        { type: 'onboarding-complete' },
      ]);
    }, 300);
  };

  // View Dashboard handler
  const handleViewDashboard = () => {
    const app = currentApp;
    const appSlug = app?.appInfo.appName?.toLowerCase().replace(/\s/g, '') || 'myapp';
    window.open(`/app/${appSlug}`, '_blank');
  };

  // Dev Completion handlers
  const handleDevViewTestEvents = () => {
    const app = currentApp;
    const appSlug = app?.appInfo.appName?.toLowerCase().replace(/\s/g, '') || 'myapp';
    window.open(`/app/${appSlug}/logs`, '_blank');
  };

  const handleDevAddProductionApp = () => {
    addUserMessage('Add Production App');
    handleAddAnotherApp();
  };

  // Single select handler
  const handleSingleSelect = (value: string) => {
    addUserMessage(value);

    // Response based on situation
    if (value === 'retry') {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '👍 Sure, please check again!\n\n💡 Try completely **closing and reopening** your app.' },
          { type: 'sdk-verify' },
        ]);
      }, 300);
    } else if (value === 'found') {
      // Show sdk-init-code with actual tokens
      const appTokenValue = currentApp?.tokens.appSdkToken || 'YOUR_APP_TOKEN';
      const appNameValue = currentApp?.appInfo.appName?.toLowerCase().replace(/\s/g, '') || 'myapp';
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '✅ Great! Now add the **App Token** to your code and try again:' },
          { type: 'sdk-init-code', appName: appNameValue, appToken: appTokenValue },
        ]);
      }, 300);
    } else if (value === 'skip_apple') {
      // Skip Apple Search Ads and continue with other channels
      setTimeout(() => {
        const nextIndex = currentChannelIndex + 1;
        setCurrentChannelIndex(nextIndex);
        if (nextIndex < selectedChannels.length) {
          const nextChannel = selectedChannels[nextIndex];
          const hasIOS = setupState.platforms.includes('ios');
          const initialSteps: ChannelStep[] = [
            { id: 'channel', label: 'Channel Integration', status: 'in_progress', required: true },
            { id: 'cost', label: 'Cost Integration', status: 'pending', required: false },
            { id: 'skan', label: 'SKAN Integration', status: 'pending', required: hasIOS },
          ];
          setChannelSteps(prev => ({ ...prev, [nextChannel]: initialSteps }));
          startChannelIntegration(nextChannel, hasIOS, initialSteps);
        } else {
          addBotMessage([
            { type: 'text', text: '**Channel integration complete!** Now let\'s create a tracking link.' },
            { type: 'tracking-link-form', channel: selectedChannels[0] || 'organic' },
          ]);
          if (currentAppId) {
            updateAppStepStatus(currentAppId, 'tracking-link', 'in_progress');
          }
        }
      }, 300);
    } else if (value === 'upgrade_apple') {
      // Return to Apple Advanced integration
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: 'Great! Once you\'ve upgraded to Apple Search Ads Advanced, let\'s set it up:' },
          { type: 'apple-channel-integration' },
        ]);
      }, 300);
    } else if (value.startsWith('retry_')) {
      // Retry channel integration
      const channel = value.replace('retry_', '');
      const hasIOS = setupState.platforms.includes('ios');
      const currentSteps = channelSteps[channel] || [
        { id: 'channel', label: 'Channel Integration', status: 'in_progress', required: true },
        { id: 'cost', label: 'Cost Integration', status: 'pending', required: false },
        { id: 'skan', label: 'SKAN Integration', status: 'pending', required: hasIOS },
      ];
      setTimeout(() => {
        startChannelIntegration(channel, hasIOS, currentSteps);
      }, 300);
    } else if (value.startsWith('skip_channel_')) {
      // Skip channel and proceed to next
      const channel = value.replace('skip_channel_', '');
      const nextIndex = currentChannelIndex + 1;
      setCurrentChannelIndex(nextIndex);
      setTimeout(() => {
        if (nextIndex < selectedChannels.length) {
          const nextChannel = selectedChannels[nextIndex];
          const hasIOS = setupState.platforms.includes('ios');
          const initialSteps: ChannelStep[] = [
            { id: 'channel', label: 'Channel Integration', status: 'in_progress', required: true },
            { id: 'cost', label: 'Cost Integration', status: 'pending', required: false },
            { id: 'skan', label: 'SKAN Integration', status: 'pending', required: hasIOS },
          ];
          setChannelSteps(prev => ({ ...prev, [nextChannel]: initialSteps }));
          startChannelIntegration(nextChannel, hasIOS, initialSteps);
        } else {
          addBotMessage([
            { type: 'text', text: '**Channel integration complete!** Now let\'s create a tracking link.' },
            { type: 'tracking-link-form', channel: selectedChannels[0] || 'organic' },
          ]);
          if (currentAppId) {
            updateAppStepStatus(currentAppId, 'tracking-link', 'in_progress');
          }
        }
      }, 300);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Check if in chat room mode
    if (currentChatId) {
      // Add user message to chat room
      addChatMessage([{ type: 'text', text: inputValue }], 'user');
      setInputValue('');

      // Bot response for chat
      setTimeout(() => {
        addChatMessage([
          { type: 'text', text: '네, 질문을 확인했습니다. 더 자세한 정보가 필요하시면 말씀해 주세요!' },
        ], 'bot');
      }, 500);
    } else {
      // Onboarding mode - add to onboarding messages
      addUserMessage(inputValue);
      setInputValue('');

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: 'I\'ve noted your message. Would you like to continue with the current step?' },
        ]);
      }, 500);
    }
  };

  // Handle back navigation - removes the last bot message and user response pair
  const handleBack = () => {
    // Determine which message array to use
    const targetMessages = currentApp ? currentApp.messages : messages;

    // Need at least 2 messages to go back (user + bot pair)
    if (targetMessages.length < 2) return;

    // Find the last user message index
    let lastUserIndex = -1;
    for (let i = targetMessages.length - 1; i >= 0; i--) {
      if (targetMessages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    // Remove messages from lastUserIndex to the end
    if (currentApp && currentAppId) {
      // Update registered app's messages
      setRegisteredApps(prev => prev.map(app =>
        app.id === currentAppId
          ? { ...app, messages: app.messages.slice(0, lastUserIndex) }
          : app
      ));
    } else {
      // Update new app registration messages
      setMessages(prev => prev.slice(0, lastUserIndex));
    }

    // Reset setup state based on remaining messages
    // This is a simplified approach - in production, we'd track state more carefully
  };

  // Check if we can go back (only for onboarding, not chat rooms)
  const canGoBack = !currentChatId && currentMessages.length >= 2 && currentMessages.some(m => m.role === 'user');

  // Step order within each category for prerequisite checking
  const categoryStepOrder: Record<string, string[]> = {
    'sdk': ['sdk-install', 'web-sdk-install', 'sdk-init', 'sdk-test'],
    'deeplink': ['deeplink', 'tracking-link', 'deeplink-test'],
    'event-taxonomy': ['event-taxonomy'],
    'integration': ['channel-select', 'channel-integration', 'cost-integration', 'skan-integration', 'attribution-test', 'data-verify'],
  };

  // Check if a step can be started (only check within same category)
  const canStartStep = (app: RegisteredApp, stepId: string): boolean => {
    const step = app.steps.find(s => s.id === stepId);
    if (!step) return false;

    const categoryOrder = categoryStepOrder[step.category];
    if (!categoryOrder) return true;

    const stepIndex = categoryOrder.indexOf(stepId);

    // First step in category can always be started
    if (stepIndex <= 0) return true;

    // Check if previous step in same category is completed
    for (let i = 0; i < stepIndex; i++) {
      const prevStepId = categoryOrder[i];
      const prevStep = app.steps.find(s => s.id === prevStepId);
      // If the previous step exists and is not completed, cannot start this step
      if (prevStep && prevStep.status !== 'completed') {
        return false;
      }
    }
    return true;
  };

  // Handle step click - navigate to step guide
  const handleStepClick = (appId: string, step: OnboardingStep) => {
    const app = registeredApps.find(a => a.id === appId);
    if (!app) return;

    // Switch from chat to app view and set current app as active
    setCurrentChatId(null);
    setCurrentAppId(appId);

    // Update step to in_progress if pending
    if (step.status === 'pending') {
      updateAppStepStatus(appId, step.id, 'in_progress');
    }

    // Show appropriate guide based on step
    switch (step.id) {
      case 'sdk-install':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `📦 **SDK Installation** for **${app.appInfo.appName}**\n\nThe SDK needs to be installed by a developer. Who will handle this?` },
            { type: 'sdk-install-choice' },
          ]);
        }, 300);
        break;

      case 'web-sdk-install':
        // Generate mock web token
        const generateWebToken = () => {
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
          return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        };
        const webAppName = app.appInfo.appName.toLowerCase().replace(/\s/g, '');
        const webToken = generateWebToken();
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `🌐 **Web SDK Installation** - **${app.appInfo.appName}**\n\nLet's install the Web SDK. First, please select an installation method.` },
            { type: 'web-sdk-method-select', appName: webAppName, webToken },
          ]);
        }, 300);
        break;

      case 'sdk-init':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `⚙️ **SDK Initialization** for **${app.appInfo.appName}**\n\nAdd the initialization code to your app entry point:` },
            { type: 'sdk-init-code', appName: app.appInfo.appName.toLowerCase().replace(/\s/g, ''), appToken: app.tokens.appSdkToken },
          ]);
        }, 300);
        break;

      case 'deeplink':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `🔗 **Deep Link Setup** for **${app.appInfo.appName}**\n\nDeep links direct users to specific screens in your app after clicking ads.\n\nWould you like to set it up now?` },
            { type: 'deeplink-choice' },
          ]);
        }, 300);
        break;

      case 'sdk-verify':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `🔍 **SDK Verification** for **${app.appInfo.appName}**\n\nLet's verify your SDK is working correctly.\n\n1. Run your app\n2. Check the Real-time Logs\n3. Look for 'Install' or 'Open' events` },
            { type: 'sdk-verify' },
          ]);
        }, 300);
        break;

      case 'channel-connect':
      case 'channel-select':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `📊 **Ad Channel Integration** for **${app.appInfo.appName}**\n\nConnect your ad platforms to track attribution.\n\nWhich channels would you like to integrate?` },
            { type: 'channel-select' },
          ]);
        }, 300);
        break;

      case 'sdk-test':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `🧪 **SDK Test** for **${app.appInfo.appName}**\n\nLet's verify your SDK integration is working correctly.` },
            { type: 'sdk-test' },
          ]);
        }, 300);
        break;

      case 'event-taxonomy':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `📊 **Event Taxonomy** for **${app.appInfo.appName}**\n\nLet's set up the events you want to track in your app.` },
            { type: 'standard-event-select' },
          ]);
        }, 300);
        break;

      case 'tracking-link':
        setTimeout(() => {
          const channel = setupState.channels?.[0] || 'Meta Ads';
          addBotMessage([
            { type: 'text', text: `🔗 **Create Tracking Link** for **${app.appInfo.appName}**\n\nCreate a tracking link to measure your campaign performance.` },
            { type: 'tracking-link-form', channel },
          ]);
        }, 300);
        break;

      case 'deeplink-test':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `🔗 **Deep Link Test** for **${app.appInfo.appName}**\n\nVerify that deep links are working correctly.` },
            { type: 'deeplink-test' },
          ]);
        }, 300);
        break;

      case 'attribution-test':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `📈 **Attribution Test** for **${app.appInfo.appName}**\n\nVerify that attribution tracking is working correctly.` },
            { type: 'attribution-test' },
          ]);
        }, 300);
        break;

      case 'data-verify':
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `✅ **Data Verification** for **${app.appInfo.appName}**\n\nConfirm that data is being collected correctly.` },
            { type: 'data-verify' },
          ]);
        }, 300);
        break;

      default:
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `Let's continue with **${step.title}** for **${app.appInfo.appName}**.` },
          ]);
        }, 300);
    }
  };

  // Parse markdown bold (**text**) and inline code (`code`) to React elements
  const parseMarkdownText = (text: string) => {
    // Split by both bold (**text**) and inline code (`code`)
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#dc2626',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.875em',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Alias for backward compatibility
  const parseMarkdownBold = parseMarkdownText;

  // Message rendering
  const renderMessageContent = (content: MessageContent, isLastBotMessage: boolean) => {
    const isCompleted = !isLastBotMessage;

    switch (content.type) {
      case 'text':
        return <p className="text-sm leading-relaxed whitespace-pre-line">{parseMarkdownBold(content.text)}</p>;

      case 'environment-select':
        return <EnvironmentSelect onSelect={handleEnvironmentSelect} isCompleted={isCompleted} />;

      case 'platform-multi-select':
        return <PlatformMultiSelect onSelect={handlePlatformMultiSelect} isCompleted={isCompleted} />;

      case 'app-name-input':
        return <AppNameInput onSubmit={handleAppNameSubmit} isCompleted={isCompleted} />;

      case 'app-name-input-dev':
        return <DevAppNameInput onSubmit={handleDevAppNameSubmit} isCompleted={isCompleted} />;

      case 'platform-registration':
        return (
          <PlatformRegistration
            platform={content.platform}
            platformIndex={content.platformIndex}
            totalPlatforms={content.totalPlatforms}
            onSearch={(query) => handlePlatformSearch(query, content.platform as 'ios' | 'android')}
            onUrlSubmit={(url) => handlePlatformUrlSubmit(url, content.platform)}
            isCompleted={isCompleted}
          />
        );

      case 'timezone-currency-confirm':
        return (
          <TimezoneCurrencyConfirm
            timezone={content.timezone}
            currency={content.currency}
            onConfirm={handleTimezoneCurrencyConfirm}
            onEdit={handleTimezoneCurrencyEdit}
            isCompleted={isCompleted}
          />
        );

      case 'timezone-currency-input':
        return <TimezoneCurrencyInput onSubmit={handleTimezoneCurrencySubmit} isCompleted={isCompleted} />;

      case 'app-search-loading':
        return <AppSearchLoading query={content.query} />;

      case 'app-search-results':
        return (
          <AppSearchResults
            results={content.results}
            query={content.query}
            onSelect={content.platform ? handleProductionAppSelect : handleAppSelect}
            onNotFound={handleAppNotFound}
            isCompleted={isCompleted}
          />
        );

      case 'app-info-form':
        return <AppInfoForm onSubmit={handleAppInfoSubmit} platforms={setupState.platforms} isCompleted={isCompleted} />;

      case 'dashboard-action':
        return (
          <DashboardAction
            appName={content.appName}
            bundleId={content.bundleId}
            packageName={content.packageName}
            onConfirm={handleDashboardConfirm}
            isCompleted={isCompleted}
          />
        );

      case 'sdk-install-choice':
        return <SdkInstallChoice onSelect={handleSdkInstallChoice} isCompleted={isCompleted} />;

      case 'sdk-install-method-select':
        return <SdkInstallMethodSelect onSelect={handleSdkInstallMethodSelect} isCompleted={isCompleted} />;

      case 'github-connect':
        return <GitHubConnect onConnect={handleGitHubConnect} onSkip={handleGitHubSkip} isCompleted={isCompleted} />;

      case 'github-repo-select':
        return <GitHubRepoSelect repos={content.repos} onSelect={handleGitHubRepoSelect} isCompleted={isCompleted} />;

      case 'github-permissions':
        return <GitHubPermissions onGranted={handleGitHubPermissionsGranted} isCompleted={isCompleted} />;

      case 'github-pr-confirm':
        return (
          <GitHubPRConfirm
            step={content.step}
            onConfirm={() => handleGitHubPRConfirm(content.step)}
            onSkip={() => handleGitHubPRSkip(content.step)}
            isCompleted={isCompleted}
          />
        );

      case 'github-pr-waiting':
        return <GitHubPRWaiting prUrl={content.prUrl} step={content.step} isCompleted={isCompleted} />;

      case 'github-pr-complete':
        return (
          <GitHubPRComplete
            prUrl={content.prUrl}
            prNumber={content.prNumber}
            step={content.step}
            onReview={handleGitHubPRReview}
            isCompleted={isCompleted}
          />
        );

      case 'github-pr-review':
        return (
          <GitHubPRReview
            prUrl={content.prUrl}
            prNumber={content.prNumber}
            step={content.step}
            onMerged={handleGitHubPRMerged}
            onContinue={handleGitHubPRContinue}
            isCompleted={isCompleted}
          />
        );

      case 'web-sdk-install':
        return (
          <WebSdkInstall
            appName={content.appName}
            webToken={content.webToken}
            onComplete={handleWebSdkInstallComplete}
            isCompleted={isCompleted}
          />
        );

      case 'web-sdk-method-select':
        return (
          <WebSdkMethodSelect
            onSelect={(method) => handleWebSdkMethodSelect(method, content.appName, content.webToken)}
            isCompleted={isCompleted}
          />
        );

      case 'web-sdk-install-code':
        return (
          <WebSdkInstallCode
            method={content.method}
            appName={content.appName}
            webToken={content.webToken}
            onComplete={() => handleWebSdkInstallCodeComplete(content.appName, content.webToken)}
            isCompleted={isCompleted}
          />
        );

      case 'web-sdk-init-options':
        return (
          <WebSdkInitOptions
            appName={content.appName}
            webToken={content.webToken}
            onComplete={handleWebSdkInitOptionsComplete}
            onSkip={handleWebSdkInitOptionsSkip}
            isCompleted={isCompleted}
          />
        );

      case 'web-sdk-user-identity':
        return (
          <WebSdkUserIdentity
            onComplete={handleWebSdkUserIdentityComplete}
            onSkip={handleWebSdkUserIdentitySkip}
            isCompleted={isCompleted}
          />
        );

      // iOS SDK Components (Native Only)
      case 'ios-sdk-install':
        return (
          <IosSdkInstall
            onComplete={handleIosSdkInstallComplete}
            isCompleted={isCompleted}
          />
        );

      case 'ios-sdk-init':
        return (
          <IosSdkInit
            appName={content.appName}
            appToken={content.appToken}
            onComplete={handleIosSdkInitComplete}
            isCompleted={isCompleted}
          />
        );

      case 'ios-deeplink-setup':
        return (
          <IosDeeplinkSetup
            appName={content.appName}
            bundleId={content.bundleId}
            onComplete={handleIosDeeplinkSetupComplete}
            isCompleted={isCompleted}
          />
        );

      // Android SDK Components (Native Only)
      case 'android-sdk-install':
        return (
          <AndroidSdkInstall
            onComplete={handleAndroidSdkInstallComplete}
            isCompleted={isCompleted}
          />
        );

      case 'android-sdk-init':
        return (
          <AndroidSdkInit
            appName={content.appName}
            appToken={content.appToken}
            onComplete={handleAndroidSdkInitComplete}
            isCompleted={isCompleted}
          />
        );

      case 'android-deeplink-setup':
        return (
          <AndroidDeeplinkSetup
            appName={content.appName}
            packageName={content.packageName}
            onComplete={handleAndroidDeeplinkSetupComplete}
            isCompleted={isCompleted}
          />
        );

      case 'sdk-guide-share':
        return (
          <SdkGuideShare
            appName={content.appName}
            platforms={content.platforms}
            framework={content.framework}
            onCopy={() => {}}
            onComplete={handleSdkGuideShareComplete}
            isCompleted={isCompleted}
          />
        );

      case 'framework-select':
        return <FrameworkSelect onSelect={handleFrameworkSelect} isCompleted={isCompleted} />;

      case 'code-block':
        return <CodeBlock title={content.title} code={content.code} language={content.language} />;

      case 'sdk-init-code':
        return <SDKInitCode appName={content.appName} appToken={content.appToken} onConfirm={handleSDKInitConfirm} isCompleted={isCompleted} />;

      // New Guide-aligned SDK Install Flow render cases
      case 'sdk-install-confirm':
        return <SdkInstallConfirm onConfirm={handleNewSdkInstallConfirm} isCompleted={isCompleted} />;

      case 'sdk-init-confirm':
        return <SdkInitConfirm onConfirm={handleNewSdkInitConfirm} isCompleted={isCompleted} />;

      case 'deeplink-setup-choice':
        return <DeeplinkSetupChoice onSelect={handleDeeplinkSetupChoice} isCompleted={isCompleted} />;

      case 'sdk-verification':
        return <SdkVerification onResult={handleNewSdkVerificationResult} isCompleted={isCompleted} />;

      case 'deeplink-choice':
        return <DeeplinkChoice onSelect={handleDeeplinkChoice} isCompleted={isCompleted} />;

      case 'deeplink-ios-input':
        return (
          <DeeplinkIosInput
            bundleId={content.bundleId}
            appName={currentApp?.appInfo.appName || setupState.appInfo.appName}
            onSubmit={handleDeeplinkIosSubmit}
            isCompleted={isCompleted}
          />
        );

      case 'deeplink-android-input':
        return (
          <DeeplinkAndroidInput
            packageName={content.packageName}
            appName={currentApp?.appInfo.appName || setupState.appInfo.appName}
            onSubmit={handleDeeplinkAndroidSubmit}
            isCompleted={isCompleted}
          />
        );

      case 'deeplink-dashboard-guide':
        return (
          <DeeplinkDashboardGuide
            platform={content.platform}
            data={content.data}
            appName={currentApp?.appInfo.appName.toLowerCase().replace(/\s/g, '') || 'myapp'}
            onComplete={() => handleDeeplinkDashboardComplete(content.platform)}
            isCompleted={isCompleted}
          />
        );

      case 'deeplink-sdk-setup':
        return (
          <DeeplinkSdkSetup
            platform={content.platform}
            framework={content.framework}
            appName={content.appName}
            uriScheme={deeplinkState.iosData?.uriScheme || deeplinkState.androidData?.uriScheme || 'myapp://'}
            onComplete={() => handleDeeplinkSdkSetupComplete(content.platform)}
            isCompleted={isCompleted}
          />
        );

      case 'deeplink-test-checklist':
        return (
          <DeeplinkTestChecklist
            onReady={handleDeeplinkTestReady}
            isCompleted={isCompleted}
          />
        );

      case 'deeplink-test-scenarios':
        return (
          <DeeplinkTestScenarios
            appName={content.appName}
            platforms={currentApp?.platforms || []}
            onComplete={handleDeeplinkTestComplete}
            isCompleted={isCompleted}
          />
        );

      case 'deeplink-complete':
        return (
          <DeeplinkComplete
            onCreateTrackingLink={handleDeeplinkCreateTrackingLink}
            onContinue={handleDeeplinkContinue}
            isCompleted={isCompleted}
          />
        );

      case 'sdk-verify':
        return <SDKVerify onConfirm={handleSDKVerifyConfirm} isCompleted={isCompleted} />;

      case 'channel-select':
        return <ChannelSelect onSelect={handleChannelSelect} isCompleted={isCompleted} />;

      case 'channel-integration-overview':
        return (
          <ChannelIntegrationOverview
            selectedChannels={content.selectedChannels}
            onStart={() => handleChannelIntegrationStart(content.selectedChannels)}
            isCompleted={isCompleted}
          />
        );

      case 'channel-progress':
        return (
          <ChannelProgress
            channel={content.channel}
            steps={content.steps}
            hasIOS={content.hasIOS}
            currentStep={content.steps.find(s => s.status === 'in_progress')?.id || 'channel'}
            isCompleted={isCompleted}
          />
        );

      case 'meta-channel-integration':
        return (
          <MetaChannelIntegration
            onComplete={() => handleChannelStepComplete('meta', 'channel')}
            onHelp={(issue) => handleChannelHelp('meta', issue)}
            isCompleted={isCompleted}
          />
        );

      case 'meta-cost-integration':
        return (
          <MetaCostIntegration
            onComplete={() => handleChannelStepComplete('meta', 'cost')}
            onSkip={() => handleChannelStepSkip('meta', 'cost')}
            isCompleted={isCompleted}
          />
        );

      case 'meta-skan-integration':
        return (
          <MetaSkanIntegration
            onComplete={() => handleChannelStepComplete('meta', 'skan')}
            onSkip={() => handleChannelStepSkip('meta', 'skan')}
            isCompleted={isCompleted}
          />
        );

      case 'google-channel-integration':
        return (
          <GoogleChannelIntegration
            onComplete={() => handleChannelStepComplete('google', 'channel')}
            onHelp={(issue) => handleChannelHelp('google', issue)}
            isCompleted={isCompleted}
          />
        );

      case 'google-cost-integration':
        return (
          <GoogleCostIntegration
            onComplete={() => handleChannelStepComplete('google', 'cost')}
            onSkip={() => handleChannelStepSkip('google', 'cost')}
            isCompleted={isCompleted}
          />
        );

      case 'google-skan-integration':
        return (
          <GoogleSkanIntegration
            onComplete={() => handleChannelStepComplete('google', 'skan')}
            onSkip={() => handleChannelStepSkip('google', 'skan')}
            isCompleted={isCompleted}
          />
        );

      case 'apple-version-check':
        return (
          <AppleVersionCheck
            onAdvanced={() => handleAppleVersionSelect('advanced')}
            onBasic={() => handleAppleVersionSelect('basic')}
            onHelp={() => handleAppleVersionHelp()}
            isCompleted={isCompleted}
          />
        );

      case 'apple-channel-integration':
        return (
          <AppleChannelIntegration
            onComplete={() => handleChannelStepComplete('apple', 'channel')}
            onHelp={(issue) => handleChannelHelp('apple', issue)}
            isCompleted={isCompleted}
          />
        );

      case 'apple-cost-integration':
        return (
          <AppleCostIntegration
            onComplete={() => handleChannelStepComplete('apple', 'cost')}
            onSkip={() => handleChannelStepSkip('apple', 'cost')}
            isCompleted={isCompleted}
          />
        );

      case 'tiktok-channel-integration':
        return (
          <TikTokChannelIntegration
            onComplete={() => handleChannelStepComplete('tiktok', 'channel')}
            onHelp={(issue) => handleChannelHelp('tiktok', issue)}
            isCompleted={isCompleted}
          />
        );

      case 'tiktok-cost-integration':
        return (
          <TikTokCostIntegration
            onComplete={() => handleChannelStepComplete('tiktok', 'cost')}
            onSkip={() => handleChannelStepSkip('tiktok', 'cost')}
            isCompleted={isCompleted}
          />
        );

      case 'tiktok-skan-integration':
        return (
          <TikTokSkanIntegration
            onComplete={() => handleChannelStepComplete('tiktok', 'skan')}
            onSkip={() => handleChannelStepSkip('tiktok', 'skan')}
            isCompleted={isCompleted}
          />
        );

      case 'channel-completion':
        return (
          <ChannelCompletion
            channel={content.channel}
            onNext={() => handleChannelComplete(content.channel)}
            isLastChannel={isLastSelectedChannel(content.channel)}
            isCompleted={isCompleted}
          />
        );

      case 'standard-event-select':
        return (
          <StandardEventSelect
            onSelect={handleStandardEventSelect}
            isCompleted={isCompleted}
          />
        );

      case 'custom-event-input':
        return (
          <CustomEventInput
            onAdd={handleCustomEventAdd}
            onSkip={handleCustomEventSkip}
            isCompleted={isCompleted}
          />
        );

      case 'event-verify':
        return (
          <EventVerify
            onVerified={handleEventVerified}
            onSkip={handleEventVerifySkip}
            isCompleted={isCompleted}
          />
        );

      case 'event-taxonomy-summary':
        return (
          <EventTaxonomySummary
            events={content.events}
            onContinue={handleEventTaxonomyComplete}
            isCompleted={isCompleted}
          />
        );

      case 'completion-summary':
        return <CompletionSummary data={content.data} />;

      case 'single-select':
        return <SingleSelect options={content.options} onSelect={handleSingleSelect} isCompleted={isCompleted} />;

      case 'token-display':
        return <TokenDisplay tokens={content.tokens} onContinue={handleTokenDisplayContinue} isCompleted={isCompleted} />;

      case 'dev-completion-summary':
        return (
          <DevCompletionSummary
            appName={content.appName}
            onViewTestEvents={handleDevViewTestEvents}
            onAddProductionApp={handleDevAddProductionApp}
          />
        );

      // SDK Test
      case 'sdk-test':
        return <SdkTest onRunTest={handleSdkTestComplete} isCompleted={isCompleted} />;

      // Tracking Link
      case 'tracking-link-form':
        return <TrackingLinkForm channel={content.channel} onCreate={handleTrackingLinkCreate} isCompleted={isCompleted} />;

      case 'tracking-link-complete':
        return <TrackingLinkComplete links={content.links} onContinue={handleTrackingLinkContinue} isCompleted={isCompleted} />;

      // Verification Phase
      case 'deeplink-test':
        return <DeeplinkTest onComplete={handleDeeplinkTestComplete} isCompleted={isCompleted} />;

      case 'attribution-test':
        return <AttributionTest onComplete={handleAttributionTestComplete} isCompleted={isCompleted} />;

      case 'data-verify':
        return <DataVerify onComplete={handleDataVerifyComplete} isCompleted={isCompleted} />;

      case 'category-navigation':
        return <CategoryNavigation onSelect={handleCategoryNavigation} isCompleted={isCompleted} />;

      case 'onboarding-complete':
        return (
          <OnboardingComplete
            appName={currentApp?.appInfo.appName || 'App'}
            onViewDashboard={handleViewDashboard}
            onAddAnotherApp={() => {
              addUserMessage('Add Another App');
              handleAddAnotherApp();
            }}
          />
        );

      default:
        return null;
    }
  };

  // Calculate overall progress across all apps
  const totalSteps = registeredApps.reduce((acc, app) => acc + app.steps.length, 0);
  const completedSteps = registeredApps.reduce((acc, app) => acc + app.steps.filter(s => s.status === 'completed').length, 0);
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Minimized button component
  const MinimizedButton = () => (
    <motion.button
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      onClick={() => setViewMode('module')}
      className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        backgroundColor: '#3b82f6'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </motion.button>
  );

  // View mode toggle buttons - compact version for top-right corner
  const ViewModeControls = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center gap-1 ${compact ? 'bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-1' : 'bg-white rounded-xl shadow-lg border border-gray-200 p-2 gap-2'}`}>
      <button
        onClick={() => setViewMode('fullscreen')}
        className={`${compact ? 'p-2' : 'p-3'} rounded-lg transition-colors ${viewMode === 'fullscreen' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Full Screen"
      >
        <Maximize2 className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
      <button
        onClick={() => setViewMode('module')}
        className={`${compact ? 'p-2' : 'p-3'} rounded-lg transition-colors ${viewMode === 'module' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Module View"
      >
        <MessageCircle className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
      <button
        onClick={() => setViewMode('minimized')}
        className={`${compact ? 'p-2' : 'p-3'} rounded-lg transition-colors ${viewMode === 'minimized' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Minimize"
      >
        <X className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
    </div>
  );

  // Main content - always fullscreen within the Layout
  const chatContent = (
    <div className="flex bg-white overflow-visible h-full w-full">
      {/* Sidebar Container */}
      <div className="flex-shrink-0 relative">
        {/* Sidebar */}
        <motion.div
          className={`bg-white border-r border-gray-200 flex flex-col overflow-hidden h-full ${
            isSidebarCollapsed ? 'p-3' : 'p-6'
          }`}
          animate={{
            width: isSidebarCollapsed ? 64 : 320,
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >

        {/* Sidebar Header with Title and Collapse Button */}
        <div className={`flex items-center mb-4 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && (
            <h2 className="font-semibold text-gray-900">Airbridge AI</h2>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="relative w-7 h-7 rounded-full border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 flex items-center justify-center text-gray-500 transition-all shadow-sm before:absolute before:inset-[-5px] before:content-['']"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </button>
        </div>


        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4">
          {/* MY APPS Section */}
          <div>

            {/* Add New App Button */}
            {isSidebarCollapsed ? (
              <button
                onClick={() => { handleBackToOnboarding(); handleAddAnotherApp(); }}
                className="w-full mb-2 p-2 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center"
                title="Add New App"
              >
                <Plus className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => { handleBackToOnboarding(); handleAddAnotherApp(); }}
                className="w-full mb-2 p-3 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add New App
              </button>
            )}

            {/* Current app registration in progress */}
            {isAddingApp && (
              <button
                onClick={() => { setCurrentChatId(null); setCurrentAppId(null); }}
                className={`w-full rounded-xl mb-2 transition-colors ${isSidebarCollapsed ? 'p-2 flex items-center justify-center' : 'p-3'} ${
                  !currentChatId && !currentAppId
                    ? 'bg-blue-50 border border-blue-500'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
                title={isSidebarCollapsed ? (setupState.appInfo.appName || 'New App') : undefined}
              >
                {isSidebarCollapsed ? (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    !currentChatId && !currentAppId ? 'bg-blue-500' : 'bg-blue-50'
                  }`}>
                    <Loader2 className={`w-4 h-4 animate-spin ${!currentChatId && !currentAppId ? 'text-white' : 'text-blue-500'}`} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      !currentChatId && !currentAppId ? 'bg-blue-500' : 'bg-blue-50'
                    }`}>
                      <Loader2 className={`w-4 h-4 animate-spin ${!currentChatId && !currentAppId ? 'text-white' : 'text-blue-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`text-sm font-medium ${!currentChatId && !currentAppId ? 'text-blue-700' : 'text-gray-900'}`}>
                        {setupState.appInfo.appName || 'New App'}
                      </div>
                      <div className={`text-xs truncate ${!currentChatId && !currentAppId ? 'text-blue-500' : 'text-gray-500'}`}>Registering...</div>
                    </div>
                  </div>
                )}
              </button>
            )}

            {/* Registered Apps */}
            <div className="space-y-2">
              {registeredApps.map((app) => (
                <div key={app.id} className={`border rounded-xl overflow-hidden ${!currentChatId && currentAppId === app.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  {/* App Header */}
                  <button
                    onClick={() => { handleBackToOnboarding(); toggleAppExpansion(app.id); setCurrentAppId(app.id); }}
                    className={`w-full flex items-center transition-colors ${isSidebarCollapsed ? 'p-2 justify-center' : 'p-3 gap-2'} ${!currentChatId && currentAppId === app.id ? '' : 'hover:bg-gray-50'}`}
                    title={isSidebarCollapsed ? app.appInfo.appName : undefined}
                  >
                    <div className={`rounded-lg flex items-center justify-center w-8 h-8 ${
                      !currentChatId && currentAppId === app.id ? 'bg-blue-500' : 'bg-blue-50'
                    }`}>
                      <Smartphone className={`w-4 h-4 ${
                        !currentChatId && currentAppId === app.id ? 'text-white' : 'text-blue-500'
                      }`} />
                    </div>

                    {!isSidebarCollapsed && (
                      <>
                        <div className="flex-1 min-w-0 text-left">
                          <div className={`text-sm font-medium truncate ${
                            !currentChatId && currentAppId === app.id ? 'text-blue-700' : 'text-gray-900'
                          }`}>{app.appInfo.appName}</div>
                          <div className={`text-xs ${
                            !currentChatId && currentAppId === app.id ? 'text-blue-500' : 'text-gray-500'
                          }`}>
                            {app.platforms.map(p => p === 'ios' ? 'iOS' : p === 'android' ? 'Android' : 'Web').join(', ')} • {app.environment === 'dev' ? 'Dev' : 'Prod'}
                          </div>
                        </div>
                        {app.isExpanded ? (
                          <ChevronDown className={`w-4 h-4 ${!currentChatId && currentAppId === app.id ? 'text-blue-500' : 'text-gray-400'}`} />
                        ) : (
                          <ChevronRight className={`w-4 h-4 ${!currentChatId && currentAppId === app.id ? 'text-blue-500' : 'text-gray-400'}`} />
                        )}
                      </>
                    )}
                  </button>

                  {/* Collapsible Steps */}
                  <AnimatePresence>
                    {!isSidebarCollapsed && app.isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
                          {/* Group steps by category */}
                          {(['web-sdk', 'ios-sdk', 'android-sdk', 'sdk', 'deeplink', 'event-taxonomy', 'integration'] as const).map((category) => {
                            const categorySteps = app.steps.filter(s => s.category === category);
                            if (categorySteps.length === 0) return null;

                            const categoryLabels: Record<string, string> = {
                              'web-sdk': 'Web SDK',
                              'ios-sdk': 'iOS SDK',
                              'android-sdk': 'Android SDK',
                              'sdk': 'SDK',
                              'deeplink': 'Deep Link',
                              'event-taxonomy': 'Event Taxonomy',
                              'integration': 'Integration',
                            };

                            const categoryCompleted = categorySteps.every(s => s.status === 'completed');
                            const categoryInProgress = categorySteps.some(s => s.status === 'in_progress');

                            return (
                              <div key={category} className="mb-3">
                                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                                  categoryCompleted ? 'text-green-600' : categoryInProgress ? 'text-blue-600' : 'text-gray-400'
                                }`}>
                                  {categoryCompleted && <CheckCircle2 className="w-3 h-3" />}
                                  {categoryLabels[category]}
                                </div>
                                <div className="space-y-1">
                                  {categorySteps.map((step) => {
                                    const isDisabled = !canStartStep(app, step.id) && step.status === 'pending';
                                    return (
                                      <button
                                        key={step.id}
                                        onClick={() => !isDisabled && handleStepClick(app.id, step)}
                                        disabled={isDisabled}
                                        className={`w-full p-2 rounded-lg transition-all duration-150 text-sm text-left relative ${
                                          isDisabled
                                            ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                            : step.status === 'completed'
                                            ? 'bg-green-50 hover:bg-green-100 hover:shadow-sm'
                                            : step.status === 'in_progress'
                                            ? 'bg-blue-100 hover:bg-blue-150 shadow-sm border-l-2 border-blue-500'
                                            : 'bg-white hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-gray-200'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {step.status === 'completed' ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                          ) : step.status === 'in_progress' ? (
                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                              <Loader2 className="w-3 h-3 text-white animate-spin" />
                                            </div>
                                          ) : (
                                            <Circle className={`w-4 h-4 flex-shrink-0 ${isDisabled ? 'text-gray-200' : 'text-gray-300'}`} />
                                          )}
                                          <span className={`flex-1 truncate text-xs font-medium ${
                                            isDisabled ? 'text-gray-400' :
                                            step.status === 'completed' ? 'text-green-700' :
                                            step.status === 'in_progress' ? 'text-blue-700' : 'text-gray-600'
                                          }`}>
                                            {step.title}
                                          </span>
                                          {step.status === 'in_progress' && (
                                            <ChevronRight className="w-3 h-3 text-blue-500" />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>

      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="font-semibold text-lg">
                {currentApp ? currentApp.appInfo.appName : 'New App Setup'}
              </h1>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {currentMessages.map((message, messageIndex) => {
                // Find the last bot message index
                const lastBotMessageIndex = currentMessages.map((m, i) => m.role === 'bot' ? i : -1).filter(i => i !== -1).pop() ?? -1;
                const isLastBotMessage = message.role === 'bot' && messageIndex === lastBotMessageIndex;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div>
                      {message.content.map((content, idx) => (
                        <div
                          key={idx}
                          className={content.type === 'text' ? (message.role === 'user' ? 'rounded-2xl px-4 py-3' : 'py-1') : ''}
                          style={
                            content.type === 'text'
                              ? message.role === 'user'
                                ? { backgroundColor: '#3b82f6', color: '#ffffff' }
                                : { color: '#374151' }
                              : {}
                          }
                        >
                          {renderMessageContent(content, isLastBotMessage)}
                        </div>
                      ))}
                      {/* Back button - only on last bot message */}
                      {isLastBotMessage && canGoBack && (
                        <button
                          onClick={handleBack}
                          className="mt-3 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-6 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  key="chat-input-field"
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your question here..."
                  className="w-full px-4 py-3 pr-12 rounded-full border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: inputValue.trim() ? '#3b82f6' : '#d1d5db',
                  color: '#ffffff',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Always render fullscreen within Layout
  return chatContent;
}
