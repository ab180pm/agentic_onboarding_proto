import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, CheckCircle2, Circle, Sparkles, Copy, Check, ExternalLink,
  Smartphone, Code, Tv, AlertCircle, ChevronRight, ChevronDown, ChevronUp, ChevronLeft, Loader2, Plus, Lightbulb,
  Maximize2, MessageCircle, X, Share2, MessageSquare, Users, UserPlus, LayoutDashboard, Link, Bell, Globe, Mail, Monitor, Package
} from 'lucide-react';
import { AirbridgeBackground } from './AirbridgeBackground';

// View mode types
type ViewMode = 'fullscreen' | 'module' | 'minimized';

interface ChatInterfaceProps {
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
  | { type: 'react-native-sdk-install'; appName: string; appToken: string }
  | { type: 'react-native-sdk-config' }
  | { type: 'ios-att-prompt-config'; appName: string; appToken: string }
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
  | { type: 'role-capability-check' }
  | { type: 'marketer-next-steps'; appName: string }
  | { type: 'sdk-requires-developer'; appName: string }
  | { type: 'sdk-type-choice' }
  | { type: 'developer-email-invite'; appName: string }
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
  // SDK Test & Verification types
  | { type: 'sdk-test' }
  | { type: 'sdk-test-result'; passed: boolean; details: { install: boolean; init: boolean; events: boolean } }
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
  | { type: 'category-navigation' }
  // Plan Selection (Growth/Deep Link)
  | { type: 'plan-select' }
  | { type: 'plan-feature-comparison'; currentPlan: 'growth' | 'deeplink' }
  // Role-based flow
  | { type: 'role-select' }
  | { type: 'role-based-guide'; role: 'marketer' | 'developer'; context: string }
  // Mode explanation
  | { type: 'mode-explainer'; mode: 'dev' | 'production' }
  // App registration validation
  | { type: 'app-name-validation'; name: string; isValid: boolean; errors: string[] }
  | { type: 'registration-checklist'; items: RegistrationCheckItem[] }
  | { type: 'immutable-warning'; field: 'mode' | 'appName' | 'timezone' | 'currency' }
  // Onboarding phase guide
  | { type: 'phase-overview'; currentPhase: number; totalPhases: number }
  | { type: 'phase-detail'; phase: PhaseInfo }
  // Validation and testing
  | { type: 'validation-checklist'; category: 'sdk' | 'deeplink' | 'event' | 'attribution'; items: ValidationItem[] }
  | { type: 'realtime-log-guide' }
  | { type: 'test-scenario-guide'; scenarios: TestScenario[] }
  // Error handling
  | { type: 'error-recovery'; errorType: string; message: string; suggestions: string[] }
  | { type: 'setup-warning'; warningType: 'info' | 'warning' | 'error'; title: string; message: string };

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
  category: 'sdk' | 'deeplink' | 'integration' | 'event-taxonomy';
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

// Registration Check Item Types
type RegistrationCheckItem = {
  id: string;
  label: string;
  description: string;
  isValid: boolean;
  isImmutable: boolean;
  value?: string;
};

// Phase Info Types
type PhaseInfo = {
  id: number;
  title: string;
  description: string;
  steps: string[];
  estimatedDuration?: string;
  requiredFor: 'growth' | 'deeplink' | 'both';
};

// Validation Item Types
type ValidationItem = {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  errorMessage?: string;
  helpLink?: string;
};

// Test Scenario Types
type TestScenario = {
  id: string;
  name: string;
  description: string;
  steps: string[];
  expectedResult: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
};

// Plan Feature Types
type PlanFeature = {
  id: string;
  name: string;
  description: string;
  growthPlan: boolean;
  deeplinkPlan: boolean;
  category: 'attribution' | 'deeplink' | 'analytics' | 'integration';
};

// Deeplink Dashboard Data Types
type DeeplinkDashboardData = {
  uriScheme: string;
  // iOS specific
  appId?: string;
  // Android specific
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

// App Tokens type
type AppTokens = {
  appSdkToken: string;
  webSdkToken: string;
  apiToken: string;
};

// Registered app with its own setup progress
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
  tokens?: AppTokens; // SDK tokens generated at registration
};

// Production mode steps - full onboarding flow
const createAppSteps = (platforms: string[] = []): OnboardingStep[] => {
  const steps: OnboardingStep[] = [
    // SDK category
    { id: 'sdk-install', phase: 2, title: 'SDK Installation', description: 'Install SDK packages', status: 'pending', category: 'sdk' },
  ];

  // Add Web SDK Install step if web platform is selected
  if (platforms.includes('web')) {
    steps.push({ id: 'web-sdk-install', phase: 2, title: 'Web SDK Installation', description: 'Install Web SDK', status: 'pending', category: 'sdk' });
  }

  steps.push(
    { id: 'sdk-init', phase: 2, title: 'SDK Initialization', description: 'Add SDK code to your app', status: 'pending', category: 'sdk' },
    { id: 'sdk-test', phase: 2, title: 'SDK Test', description: 'Test SDK integration', status: 'pending', category: 'sdk' },
    // Deep Link category
    { id: 'deeplink', phase: 2, title: 'Deep Link Setup', description: 'Configure deep links', status: 'pending', category: 'deeplink' },
    { id: 'tracking-link', phase: 4, title: 'Tracking Link', description: 'Create tracking links', status: 'pending', category: 'deeplink' },
    { id: 'deeplink-test', phase: 5, title: 'Deep Link Test', description: 'Test deep link functionality', status: 'pending', category: 'deeplink' },
    // Event Taxonomy category
    { id: 'event-taxonomy', phase: 3, title: 'Event Taxonomy', description: 'Define events to track', status: 'pending', category: 'event-taxonomy' },
    // Integration category
    { id: 'channel-select', phase: 4, title: 'Channel Selection', description: 'Select ad platforms', status: 'pending', category: 'integration' },
    { id: 'channel-integration', phase: 4, title: 'Channel Integration', description: 'Connect to ad platforms', status: 'pending', category: 'integration' },
    { id: 'cost-integration', phase: 4, title: 'Cost Integration', description: 'Enable cost data import', status: 'pending', category: 'integration' },
    { id: 'skan-integration', phase: 4, title: 'SKAN Integration', description: 'iOS attribution setup', status: 'pending', category: 'integration' },
    { id: 'attribution-test', phase: 5, title: 'Attribution Test', description: 'Verify attribution setup', status: 'pending', category: 'integration' },
    { id: 'data-verify', phase: 5, title: 'Data Verification', description: 'Confirm data collection', status: 'pending', category: 'integration' },
  );

  return steps;
};

// Dev mode steps - simplified flow (SDK setup only)
const createDevAppSteps = (platforms: string[] = []): OnboardingStep[] => {
  const steps: OnboardingStep[] = [
    // SDK category
    { id: 'sdk-install', phase: 2, title: 'SDK Installation', description: 'Install SDK packages', status: 'pending', category: 'sdk' },
  ];

  // Add Web SDK Install step if web platform is selected
  if (platforms.includes('web')) {
    steps.push({ id: 'web-sdk-install', phase: 2, title: 'Web SDK Installation', description: 'Install Web SDK', status: 'pending', category: 'sdk' });
  }

  steps.push(
    { id: 'sdk-init', phase: 2, title: 'SDK Initialization', description: 'Add SDK code to your app', status: 'pending', category: 'sdk' },
    { id: 'sdk-test', phase: 2, title: 'SDK Test', description: 'Test SDK integration', status: 'pending', category: 'sdk' },
    // Deep Link category
    { id: 'deeplink', phase: 2, title: 'Deep Link Setup', description: 'Configure deep links', status: 'pending', category: 'deeplink' },
  );

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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Installation method selected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-3">How would you like to install the SDK?</div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">SDK installation code applied</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 shadow-sm w-full max-w-full">
      {/* Auth Info */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 mb-2">Authentication Info (Auto-configured)</div>
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
    utmParsing: true, // Recommended: Most web customers enable this
    userHash: false, // Not recommended: Avoid collecting email/phone
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Initialization options configured</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 shadow-sm">
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
        <label className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
          <div>
            <div className="text-sm font-medium text-gray-900">UTM Parsing <span className="text-xs text-blue-600 font-normal">(Recommended)</span></div>
            <div className="text-xs text-gray-500">Auto-extract UTM parameters from URL</div>
          </div>
          <input
            type="checkbox"
            checked={options.utmParsing}
            onChange={(e) => setOptions({ ...options, utmParsing: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
          <div>
            <div className="text-sm font-medium text-gray-900">User Data Hashing <span className="text-xs text-amber-600 font-normal">(Not Recommended)</span></div>
            <div className="text-xs text-amber-700">Airbridge advises against collecting email/phone data</div>
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
        <div className="text-xs text-gray-500 mb-2">Generated initialization code:</div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">User identity setup complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-1">Would you like to track logged-in users?</div>
      <div className="text-xs text-gray-500 mb-4">Set up user identity if your app has login functionality.</div>

      {/* Available Methods */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-500 mb-2">Available methods:</div>
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
        <div className="text-xs text-gray-500 mb-2">Login code example:</div>
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
        <div className="text-xs text-gray-500 mb-2">Logout code example:</div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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

// SDK Install Method Select Component (Automation vs Manual)
function SdkInstallMethodSelect({ onSelect, isCompleted = false }: {
  onSelect: (method: 'automation' | 'manual') => void;
  isCompleted?: boolean
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Installation Method</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">How would you like to install the SDK?</div>
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
    setTimeout(() => {
      setConnectState('authorizing');
      setTimeout(() => {
        setConnectState('connected');
        setTimeout(() => {
          onConnect();
        }, 1000);
      }, 1500);
    }, 1000);
  };

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#171717' }}
          >
            <GitHubIcon className="w-5 h-5" fill="#ffffff" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">GitHub Connected</div>
            <div className="text-xs text-gray-500">Repository access authorized</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
        </div>
      </div>
    );
  }

  // Connecting state - showing OAuth flow
  if (connectState !== 'idle') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: '#171717' }}
          >
            <GitHubIcon className="w-8 h-8" fill="#ffffff" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Connecting to GitHub</div>
            <div className="text-sm text-gray-500">Complete authorization in the popup window</div>
          </div>
        </div>

        {/* Connection Steps */}
        <div className="space-y-2">
          <div className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
            connectState === 'connecting' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
          }`}>
            {connectState === 'connecting' ? (
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">Opening GitHub OAuth</div>
              <div className="text-xs text-gray-500">Redirecting to github.com...</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
            connectState === 'connecting' ? 'bg-gray-50 border border-gray-100 opacity-50' :
            connectState === 'authorizing' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
          }`}>
            {connectState === 'connecting' ? (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            ) : connectState === 'authorizing' ? (
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">Waiting for Authorization</div>
              <div className="text-xs text-gray-500">Grant Airbridge read/write access to repositories</div>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
            connectState !== 'connected' ? 'bg-gray-50 border border-gray-100 opacity-50' : 'bg-green-50 border border-green-200'
          }`}>
            {connectState === 'connected' ? (
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            )}
            <div className="flex-1">
              <div className={`text-sm font-medium ${connectState === 'connected' ? 'text-green-700' : 'text-gray-700'}`}>
                {connectState === 'connected' ? 'Connected Successfully!' : 'Connection Complete'}
              </div>
              <div className={`text-xs ${connectState === 'connected' ? 'text-green-600' : 'text-gray-500'}`}>
                {connectState === 'connected' ? 'Loading your repositories...' : 'Ready to select repository'}
              </div>
            </div>
          </div>
        </div>

        {connectState !== 'connected' && (
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={() => setConnectState('idle')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel connection
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: '#171717' }}
        >
          <GitHubIcon className="w-8 h-8" fill="#ffffff" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">Connect to GitHub</div>
          <div className="text-sm text-gray-500">Authorize Airbridge to automate SDK integration</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 mb-5 border border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-3">Airbridge will be able to:</div>
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2.5 text-sm text-gray-600">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            </div>
            <span>Analyze your project structure and detect SDK requirements</span>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-gray-600">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            </div>
            <span>Create feature branches and pull requests for SDK setup</span>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-gray-600">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            </div>
            <span>Add inline comments and documentation to your code</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleConnect}
          className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl hover:opacity-90 transition-all font-medium shadow-sm"
          style={{ backgroundColor: '#171717', color: '#ffffff' }}
        >
          <GitHubIcon className="w-5 h-5" fill="#ffffff" />
          <span>Connect with GitHub</span>
        </button>
        <button
          onClick={onSkip}
          className="px-5 py-3.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
        >
          Skip
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Your code is never stored. We only create PRs in your repository.</span>
        </div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-3">
          <GitHubIcon className="w-5 h-5 text-gray-500" />
          <div>
            <div className="text-sm font-medium text-gray-500">Repository Selected</div>
            <div className="text-xs text-gray-400">Ready for SDK integration</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
        </div>
      </div>
    );
  }

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <GitHubIcon className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">Select Repository</div>
          <div className="text-sm text-gray-500">Choose where to integrate Airbridge SDK</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
          />
        </div>
      </div>

      {/* Repo List */}
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
        {filteredRepos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">No repositories found</div>
            <div className="text-xs text-gray-400 mt-1">Try a different search term</div>
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => onSelect(repo)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <GitHubIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{repo.name}</div>
                <div className="text-xs text-gray-500 truncate">{repo.fullName}</div>
              </div>
              {repo.isPrivate && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Private
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </button>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-400 text-center">
          Showing {filteredRepos.length} of {repos.length} repositories
        </div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Write Access Granted</div>
            <div className="text-xs text-gray-400">Ready to create pull requests</div>
          </div>
        </div>
      </div>
    );
  }

  const handleGrant = () => {
    setIsGranting(true);
    setTimeout(() => {
      setIsGranting(false);
      onGranted();
    }, 1500);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">Additional Permissions Required</div>
          <div className="text-sm text-gray-500">Write access needed to create PRs</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 rounded-xl p-4 mb-5">
        <div className="text-sm font-medium text-amber-800 mb-3">
          To automate SDK integration, Airbridge needs write access for:
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5 text-sm text-amber-700">
            <div className="w-5 h-5 rounded-full bg-amber-200/50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span>Creating feature branches (e.g., <code className="bg-amber-100 px-1 rounded text-xs">airbridge/sdk-setup</code>)</span>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-amber-700">
            <div className="w-5 h-5 rounded-full bg-amber-200/50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span>Opening pull requests with SDK integration code</span>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-amber-700">
            <div className="w-5 h-5 rounded-full bg-amber-200/50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <span>Adding inline comments and setup documentation</span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleGrant}
        disabled={isGranting}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-50 shadow-sm"
      >
        {isGranting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Granting permissions...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Grant Write Access</span>
          </>
        )}
      </button>

      <div className="mt-4 text-center">
        <div className="text-xs text-gray-400">
          You can revoke access anytime from GitHub Settings
        </div>
      </div>
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
      icon: '📦',
      color: 'blue',
      branch: 'airbridge/sdk-install',
      changes: [
        { file: 'package.json', action: 'Add airbridge-sdk dependency' },
        { file: 'ios/Podfile', action: 'Add AirbridgeSDK pod' },
        { file: 'android/build.gradle', action: 'Add Airbridge repository' }
      ]
    },
    'sdk-init': {
      title: 'SDK Initialization',
      description: 'Add SDK initialization code to your app entry point',
      icon: '🚀',
      color: 'purple',
      branch: 'airbridge/sdk-init',
      changes: [
        { file: 'App.tsx', action: 'Import and initialize Airbridge SDK' },
        { file: 'index.js', action: 'Configure SDK with app token' },
        { file: 'config/', action: 'Add Airbridge configuration file' }
      ]
    },
    'deeplink': {
      title: 'Deep Link Setup',
      description: 'Configure deep linking for attribution tracking',
      icon: '🔗',
      color: 'green',
      branch: 'airbridge/deeplink-setup',
      changes: [
        { file: 'Info.plist', action: 'Add URL scheme and Associated Domains' },
        { file: 'AndroidManifest.xml', action: 'Add intent filters for App Links' },
        { file: 'App.tsx', action: 'Add deep link handler callback' }
      ]
    },
    'event-tracking': {
      title: 'Event Tracking Setup',
      description: 'Implement event tracking based on your taxonomy',
      icon: '📊',
      color: 'orange',
      branch: 'airbridge/event-tracking',
      changes: [
        { file: 'analytics/', action: 'Create event tracking utilities' },
        { file: 'screens/', action: 'Add trackEvent calls to key screens' },
        { file: 'hooks/', action: 'Create useAirbridgeEvent hook' }
      ]
    }
  };

  const info = stepInfo[step];
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">{info.title} PR</div>
            <div className="text-xs text-gray-400">Pull request created</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClasses[info.color as keyof typeof colorClasses]}`}>
          <span className="text-lg">{info.icon}</span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{info.title}</div>
          <div className="text-sm text-gray-500">{info.description}</div>
        </div>
      </div>

      {/* Branch info */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 rounded-lg">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="text-xs text-gray-500">Branch:</span>
        <code className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{info.branch}</code>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 mb-5 border border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-3">Files to be modified:</div>
        <ul className="space-y-2.5">
          {info.changes.map((change, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm">
              <div className="w-5 h-5 rounded bg-gray-200/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Code className="w-3 h-3 text-gray-500" />
              </div>
              <div className="flex-1">
                <code className="text-xs font-mono text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200">{change.file}</code>
                <div className="text-xs text-gray-500 mt-0.5">{change.action}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm"
        >
          <GitHubIcon className="w-5 h-5" fill="#ffffff" />
          <span>Create Pull Request</span>
        </button>
        <button
          onClick={onSkip}
          className="px-5 py-3.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

// GitHub PR Waiting Component
function GitHubPRWaiting({ step, isCompleted = false }: {
  prUrl?: string;
  step: string;
  isCompleted?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('Analyzing codebase...');

  useEffect(() => {
    if (isCompleted) return;

    const actions = [
      'Analyzing codebase structure...',
      'Detecting project configuration...',
      'Generating SDK integration code...',
      'Creating feature branch...',
      'Preparing pull request...'
    ];

    let actionIndex = 0;
    const actionInterval = setInterval(() => {
      actionIndex = (actionIndex + 1) % actions.length;
      setCurrentAction(actions[actionIndex]);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 95));
    }, 500);

    return () => {
      clearInterval(actionInterval);
      clearInterval(progressInterval);
    };
  }, [isCompleted]);

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Pull Request Created</div>
            <div className="text-xs text-gray-400">Ready for review</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
            <GitHubIcon className="w-3.5 h-3.5 text-gray-700" />
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Creating Pull Request</div>
          <div className="text-sm text-gray-500 mt-0.5">{step.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())} integration</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current action */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">{currentAction}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center justify-between text-xs text-gray-400">
          <span>Estimated time: 30-60 seconds</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

// GitHub PR Complete Component
function GitHubPRComplete({ prUrl, prNumber, onReview, isCompleted = false }: {
  prUrl: string;
  prNumber: number;
  step: string;
  onReview: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">PR #{prNumber}</div>
            <div className="text-xs text-gray-400">Created successfully</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      {/* Success header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
            <GitHubIcon className="w-3.5 h-3.5 text-gray-700" />
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Pull Request Created!</div>
          <div className="text-sm text-green-600 mt-0.5">PR #{prNumber} is ready for review</div>
        </div>
      </div>

      {/* PR Link */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 mb-5 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
            <GitHubIcon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Pull Request URL</div>
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline font-mono text-xs truncate block"
            >
              {prUrl}
            </a>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(prUrl)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            title="Copy URL"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      <button
        onClick={onReview}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm"
      >
        <ExternalLink className="w-5 h-5" />
        <span>Review Pull Request</span>
      </button>
    </div>
  );
}

// GitHub PR Review Component
function GitHubPRReview({ prUrl, prNumber, onMerged, onContinue, isCompleted = false }: {
  prUrl: string;
  prNumber: number;
  step: string;
  onMerged: () => void;
  onContinue: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">PR #{prNumber} Review</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <GitHubIcon className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">Review PR #{prNumber}</div>
          <div className="text-sm text-gray-500">Choose how to proceed</div>
        </div>
      </div>

      <div className="space-y-3">
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3.5 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
            <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">View on GitHub</div>
            <div className="text-sm text-gray-500">Review code changes in detail</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </a>

        <button
          onClick={onMerged}
          className="w-full flex items-center gap-3.5 p-4 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50 hover:border-green-400 hover:from-green-100 hover:to-emerald-100/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">I've merged the PR</div>
            <div className="text-sm text-green-600">Continue to the next automation step</div>
          </div>
        </button>

        <button
          onClick={onContinue}
          className="w-full flex items-center gap-3.5 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Skip for now</div>
            <div className="text-sm text-gray-500">Continue without merging, review later</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// SDK Type Selection Modal Component - Asks whether to install App SDK or Web SDK first
function SdkTypeSelectionModal({
  onSelect,
  onClose,
  isOpen = true
}: {
  onSelect: (type: 'app' | 'web') => void;
  onClose?: () => void;
  isOpen?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900">Choose SDK to Install First</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">You have both mobile app and web platforms. Which SDK would you like to install first?</p>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={() => onSelect('app')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 group-hover:text-blue-600">App SDK</div>
              <div className="text-sm text-gray-500">iOS and Android mobile apps</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
          </button>

          <button
            onClick={() => onSelect('web')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 group-hover:text-blue-600">Web SDK</div>
              <div className="text-sm text-gray-500">Website and web applications</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
          </button>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">You can install the other SDK later in the onboarding process</p>
        </div>
      </div>
    </div>
  );
}

// Web SDK Package Manager Install Component - Chat module for npm/yarn/pnpm installation
function WebSdkPackageInstall({
  appName,
  webToken,
  onComplete,
  isCompleted = false
}: {
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

  const packageInstallCommands = {
    npm: 'npm install airbridge-web-sdk-loader',
    yarn: 'yarn add airbridge-web-sdk-loader',
    pnpm: 'pnpm add airbridge-web-sdk-loader',
  };

  const packageUsageCode = `import Airbridge from 'airbridge-web-sdk-loader';

Airbridge.init({
  app: '${appName}',
  webToken: '${webToken}',
});`;

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Package Manager SDK installation completed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 shadow-sm w-full max-w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Package Manager Installation</div>
          <div className="text-sm text-gray-500">Install via npm, yarn, or pnpm</div>
        </div>
      </div>

      {/* Auth Info */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-xs text-gray-500 mb-2">Your configuration (auto-filled)</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400">App Name</div>
            <div className="text-sm font-mono text-gray-900">{appName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Web Token</div>
            <div className="text-sm font-mono text-gray-900 truncate">{webToken.slice(0, 20)}...</div>
          </div>
        </div>
      </div>

      {/* Step 1: Install Package */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold">1</div>
          <span className="text-sm font-medium text-gray-700">Install Package</span>
        </div>

        {/* Package Manager Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-3">
          {(['npm', 'yarn', 'pnpm'] as const).map((pm) => (
            <button
              key={pm}
              onClick={() => setPackageManager(pm)}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all ${
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
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono">
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

      {/* Step 2: Initialize SDK */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold">2</div>
          <span className="text-sm font-medium text-gray-700">Initialize SDK</span>
        </div>

        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto">
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

      {/* Documentation Link */}
      <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
        <ExternalLink className="w-3 h-3" />
        <a
          href="https://developers.airbridge.io/docs/web-sdk"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          View full documentation
        </a>
      </div>

      {/* Complete Button */}
      <button
        onClick={onComplete}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        Installation Code Applied
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// SDK Install Choice Component
function SdkInstallChoice({ onSelect, isCompleted = false }: { onSelect: (choice: 'self' | 'share') => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Installation</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Who will install the SDK?</div>
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

// Role Capability Check Component - Asks if user can install SDK themselves
function RoleCapabilityCheck({ onSelect, isCompleted = false }: { onSelect: (canInstall: boolean) => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Setup Role</div>
        <div className="text-xs text-gray-400">Role confirmed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-2">What's your role in this setup?</div>
      <p className="text-xs text-gray-500 mb-4">This helps us guide you through the right steps.</p>
      <div className="space-y-2">
        <button
          onClick={() => onSelect(true)}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
            <Code className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">I'm a developer - I'll install the SDK myself</div>
            <div className="text-sm text-gray-500">I have codebase access and can integrate the SDK</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => onSelect(false)}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">I'm not a developer - someone else will handle SDK</div>
            <div className="text-sm text-gray-500">I'm a marketer, PM, or analyst - technical setup will be done by others</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

// Marketer Next Steps Component - Shows options for non-developers
function MarketerNextSteps({ appName, onSelect, isCompleted = false }: {
  appName: string;
  onSelect: (choice: 'invite-developer' | 'create-tracking-link' | 'explore-dashboard') => void;
  isCompleted?: boolean
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Next Steps</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">What would you like to do next?</div>
      <div className="space-y-2">
        <button
          onClick={() => onSelect('invite-developer')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
            <UserPlus className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Invite a developer</div>
            <div className="text-sm text-gray-500">Share SDK setup guide with your dev team</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => onSelect('create-tracking-link')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-blue-500 bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500 text-white">
            <Link className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">Create a tracking link</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recommended</span>
            </div>
            <div className="text-sm text-gray-500">Start building campaign links right now</div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-400" />
        </button>
      </div>
    </div>
  );
}

// SDK Requires Developer Component - Shows options when SDK installation is needed
function SdkRequiresDeveloper({ appName, onSelect, isCompleted = false }: {
  appName: string;
  onSelect: (choice: 'create-tracking-link' | 'explore-dashboard' | 'invite-developer' | 'self-install') => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Installation</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-start gap-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-amber-800">SDK Installation Requires a Developer</div>
          <div className="text-sm text-amber-700 mt-1">
            A developer with codebase access is needed to integrate the Airbridge SDK.
          </div>
        </div>
      </div>

      <div className="text-sm font-medium text-gray-700 mb-3">In the meantime, what would you like to do?</div>
      <div className="space-y-2">
        <button
          onClick={() => onSelect('create-tracking-link')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-blue-500 bg-blue-50 transition-all text-left hover:bg-blue-100"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500 text-white">
            <Link className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">Create a tracking link</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recommended</span>
            </div>
            <div className="text-sm text-gray-500">Start building campaign links right now</div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-400" />
        </button>

        <button
          onClick={() => onSelect('explore-dashboard')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100">
            <LayoutDashboard className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Explore the dashboard</div>
            <div className="text-sm text-gray-500">See what Airbridge can do with sample data</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => onSelect('invite-developer')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Invite developer(s)</div>
            <div className="text-sm text-gray-500">Send SDK setup invitation via email</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <div className="pt-2 mt-2 border-t border-gray-100">
          <button
            onClick={() => onSelect('self-install')}
            className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
              <Code className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">I can do it myself</div>
              <div className="text-sm text-gray-500">I have access to the codebase and can install the SDK</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// SDK Type Choice Component - Choose between App SDK and Web SDK
function SdkTypeChoice({ onSelect, isCompleted = false }: {
  onSelect: (type: 'app' | 'web') => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Type Selection</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Which SDK would you like to install?</div>
      <div className="space-y-2">
        <button
          onClick={() => onSelect('app')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">App SDK</div>
            <div className="text-sm text-gray-500">iOS and Android native app integration</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => onSelect('web')}
          className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Web SDK</div>
            <div className="text-sm text-gray-500">Website JavaScript integration</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

// Developer Email Invite Component - Input multiple developer emails
function DeveloperEmailInvite({ appName, onSend, onBack, isCompleted = false }: {
  appName: string;
  onSend: (emails: string[]) => void;
  onBack: () => void;
  isCompleted?: boolean;
}) {
  const [emails, setEmails] = useState<string[]>(['']);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (isCompleted || sent) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Invitations sent</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {emails.filter(e => e.trim()).length} developer(s) invited
        </div>
      </div>
    );
  }

  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validEmails = emails.filter(e => isValidEmail(e.trim()));
  const canSend = validEmails.length > 0;

  const handleSend = () => {
    if (!canSend) return;
    setSending(true);
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      setSent(true);
      onSend(validEmails);
    }, 1000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Invite Developer(s) to Set Up SDK</div>
      <p className="text-xs text-gray-500 mb-4">
        We'll send them an email with SDK setup instructions and access to the <strong>{appName}</strong> dashboard.
      </p>

      <div className="space-y-2 mb-4">
        {emails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => updateEmail(index, e.target.value)}
                placeholder="developer@company.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  email && !isValidEmail(email) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
            </div>
            {emails.length > 1 && (
              <button
                onClick={() => removeEmail(index)}
                className="p-3 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addEmail}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"
      >
        <Plus className="w-4 h-4" />
        Add another developer
      </button>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="px-4 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSend}
          disabled={!canSend || sending}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            canSend && !sending
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Invitation{validEmails.length > 1 ? 's' : ''}
              {validEmails.length > 0 && ` (${validEmails.length})`}
            </>
          )}
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Share SDK Setup Guide</div>

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

// Category Navigation Component
function CategoryNavigation({ onSelect, isCompleted = false }: {
  onSelect: (category: string) => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">What would you like to set up next?</div>
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

// Mock event data for realtime log
interface EventLogEntry {
  id: string;
  os: 'iOS' | 'Android';
  eventCategory: string;
  channel: string;
  adid: string;
  sdkVersion: string;
  action: string;
  label: string;
  datetime: Date;
}

const generateMockEvents = (): EventLogEntry[] => {
  const eventCategories = ['Install', 'Open', 'Sign-in', 'Sign-up', 'Home Screen', 'Product View', 'Add To Cart', 'Order Complete', 'Search Results'];
  const channels = ['naver.searchad', 'kakao', 'google.adwords', 'apple.searchads', 'facebook.business'];
  const adids = [
    '217320c2-804e-4ee2-9aa5-dafec68563b9',
    '03a38783-da1a-4780-b6fc-26bef1f6c86f',
    '7a6a7887-14ea-4508-a232-e6f76132fa9f',
    'b78f9071-14d4-4c81-9e7c-f6516145d6e7',
    '6cf1a858-7171-4143-8639-63c07fc4bb72'
  ];

  const events: EventLogEntry[] = [];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const os = Math.random() > 0.5 ? 'iOS' : 'Android';
    events.push({
      id: `event-${i}`,
      os,
      eventCategory: eventCategories[Math.floor(Math.random() * eventCategories.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      adid: adids[Math.floor(Math.random() * adids.length)],
      sdkVersion: os === 'iOS' ? 'M_I_v1.9.7' : 'M_A_v1.7.1',
      action: '',
      label: '',
      datetime: new Date(now.getTime() - i * 60000 * Math.random() * 5)
    });
  }

  return events.sort((a, b) => b.datetime.getTime() - a.datetime.getTime());
};

// SDK Test Component with Realtime Event Log
function SdkTest({ onRunTest, isCompleted = false }: {
  onRunTest: () => void;
  isCompleted?: boolean;
}) {
  const [isStreaming, setIsStreaming] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [hasNewEvents, setHasNewEvents] = useState(false);

  useEffect(() => {
    // Initialize with mock events
    setEvents(generateMockEvents());
  }, []);

  useEffect(() => {
    if (!isStreaming) return;

    // Add new events periodically
    const interval = setInterval(() => {
      const eventCategories = ['Open', 'Sign-in', 'Product View', 'Add To Cart', 'Home Screen'];
      const channels = ['naver.searchad', 'kakao', 'google.adwords'];
      const os = Math.random() > 0.5 ? 'iOS' : 'Android';

      const newEvent: EventLogEntry = {
        id: `event-${Date.now()}`,
        os,
        eventCategory: eventCategories[Math.floor(Math.random() * eventCategories.length)],
        channel: channels[Math.floor(Math.random() * channels.length)],
        adid: `${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 14)}`,
        sdkVersion: os === 'iOS' ? 'M_I_v1.9.7' : 'M_A_v1.7.1',
        action: '',
        label: '',
        datetime: new Date()
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      setHasNewEvents(true);
      setTimeout(() => setHasNewEvents(false), 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const filteredEvents = events.filter(event =>
    !searchQuery ||
    event.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.eventCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.adid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
  };

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">SDK Integration Test Complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl mt-4 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">App Event Real-time Logs</h2>
          <a
            href="https://help.airbridge.io/ko/guides/tracking-events-with-real-time-logs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">A</span>
            </div>
            <span className="text-xs text-gray-700">My Device ID by Airbridge</span>
          </a>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          {/* Play/Pause Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setIsStreaming(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isStreaming ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Real-time Logs
            </button>
            <button
              onClick={() => setIsStreaming(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                !isStreaming ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              Stop
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search real-time logs"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Some data may be available after a delay due to processing time.
          <br />Searchable parameters: OS, Event Category, Channel, ADID, SDK Version
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">OS</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">Event Category</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">Channel</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">ADID</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">SDK Version</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">Datetime</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event, index) => (
              <tr
                key={event.id}
                className={`border-b border-gray-100 transition-colors ${
                  index === 0 && hasNewEvents ? 'bg-blue-50' : index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                }`}
              >
                <td className="px-3 py-2.5 text-gray-700">{event.os}</td>
                <td className="px-3 py-2.5 text-gray-700">{event.eventCategory}</td>
                <td className="px-3 py-2.5 text-gray-700">{event.channel}</td>
                <td className="px-3 py-2.5 text-gray-700 font-mono text-[10px]">{event.adid}</td>
                <td className="px-3 py-2.5 text-gray-700">{event.sdkVersion}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-gray-700">{formatDate(event.datetime)}</span>
                  <span className="text-gray-400 ml-1">{formatTime(event.datetime)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-600 font-medium">Receiving live data</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              <span className="text-xs text-gray-500">Stopped</span>
            </>
          )}
        </div>
        <span className="text-xs text-gray-500">{filteredEvents.length} events</span>
      </div>

      {/* Complete Button */}
      <div className="px-5 py-4 border-t border-gray-200">
        <button
          onClick={onRunTest}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Complete Event Verification
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Link Name</label>
          <input
            type="text"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            placeholder="e.g., Summer Campaign 2024"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Link Settings</div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
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
function OnboardingComplete({ appName, onViewDashboard }: {
  appName: string;
  onViewDashboard: () => void;
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
        <div className="text-sm font-medium text-gray-700 mb-3">What's been set up:</div>
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

// Code Block Component
function CodeBlock({ title, code }: { title: string; code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden mt-4" style={{ backgroundColor: '#111827' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
        <span className="text-sm" style={{ color: '#9ca3af' }}>{title}</span>
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
  );
}

// Environment Select Component
function EnvironmentSelect({ onSelect, isCompleted = false }: { onSelect: (env: 'dev' | 'production') => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Select Environment</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-2">Select Environment</div>
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

// Plan Selector Component (Growth Plan vs Deep Link Plan)
function PlanSelector({ onSelect, isCompleted = false }: {
  onSelect: (plan: 'growth' | 'deeplink') => void;
  isCompleted?: boolean
}) {
  const [hoveredPlan, setHoveredPlan] = useState<'growth' | 'deeplink' | null>(null);

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Plan selected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-2">Select Your Plan</div>
      <div className="text-xs text-gray-500 mb-4">Choose the plan that best fits your needs</div>

      <div className="space-y-3">
        {/* Growth Plan */}
        <button
          onClick={() => onSelect('growth')}
          onMouseEnter={() => setHoveredPlan('growth')}
          onMouseLeave={() => setHoveredPlan(null)}
          className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-500 hover:bg-blue-100 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600 flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">Growth Plan</span>
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Full MMP</span>
            </div>
            <div className="text-sm text-gray-600 mb-3">Complete mobile measurement solution with attribution and analytics</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Attribution & Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deep Linking</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ad Channel Integration</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SKAN & SKAdNetwork</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reports & Raw Data Export</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
        </button>

        {/* Deep Link Plan */}
        <button
          onClick={() => onSelect('deeplink')}
          onMouseEnter={() => setHoveredPlan('deeplink')}
          onMouseLeave={() => setHoveredPlan(null)}
          className="w-full flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 flex-shrink-0">
            <Share2 className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">Deep Link Plan</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Deep Link Only</span>
            </div>
            <div className="text-sm text-gray-600 mb-3">Deep linking functionality for seamless user experience</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deep Linking</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deferred Deep Links</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tracking Links</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Circle className="w-3.5 h-3.5" />
                <span className="line-through">Attribution (Not included)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Circle className="w-3.5 h-3.5" />
                <span className="line-through">Ad Channel Integration (Not included)</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
        </button>
      </div>

      {/* Plan comparison link */}
      <div className="mt-4 text-center">
        <a href="#" className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Compare plans in detail
        </a>
      </div>
    </div>
  );
}

// Plan Feature Comparison Component
function PlanFeatureComparison({ currentPlan, onUpgrade, isCompleted = false }: {
  currentPlan: 'growth' | 'deeplink';
  onUpgrade?: () => void;
  isCompleted?: boolean;
}) {
  const features: PlanFeature[] = [
    { id: 'attribution', name: 'Attribution', description: 'Track install sources', growthPlan: true, deeplinkPlan: false, category: 'attribution' },
    { id: 'deeplink', name: 'Deep Linking', description: 'Seamless app opening', growthPlan: true, deeplinkPlan: true, category: 'deeplink' },
    { id: 'deferred', name: 'Deferred Deep Links', description: 'Deep link after install', growthPlan: true, deeplinkPlan: true, category: 'deeplink' },
    { id: 'actuals', name: 'Actuals Report', description: 'Performance metrics', growthPlan: true, deeplinkPlan: false, category: 'analytics' },
    { id: 'cohort', name: 'Cohort Analysis', description: 'User behavior over time', growthPlan: true, deeplinkPlan: false, category: 'analytics' },
    { id: 'raw', name: 'Raw Data Export', description: 'Export raw event data', growthPlan: true, deeplinkPlan: false, category: 'analytics' },
    { id: 'channel', name: 'Ad Channel Integration', description: 'Connect ad platforms', growthPlan: true, deeplinkPlan: false, category: 'integration' },
    { id: 'postback', name: 'Postback Setup', description: 'Send data to channels', growthPlan: true, deeplinkPlan: false, category: 'integration' },
    { id: 'skan', name: 'SKAdNetwork', description: 'iOS privacy attribution', growthPlan: true, deeplinkPlan: false, category: 'integration' },
  ];

  if (isCompleted) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-4">Plan Feature Comparison</div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-600">Feature</th>
              <th className="text-center py-2 font-medium text-blue-600">Growth Plan</th>
              <th className="text-center py-2 font-medium text-green-600">Deep Link Plan</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.id} className="border-b border-gray-100">
                <td className="py-2">
                  <div className="font-medium text-gray-900">{feature.name}</div>
                  <div className="text-xs text-gray-500">{feature.description}</div>
                </td>
                <td className="py-2 text-center">
                  {feature.growthPlan ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 mx-auto" />
                  )}
                </td>
                <td className="py-2 text-center">
                  {feature.deeplinkPlan ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentPlan === 'deeplink' && onUpgrade && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900">Need attribution & analytics?</div>
              <div className="text-xs text-blue-700 mt-1">Upgrade to Growth Plan to unlock full MMP capabilities</div>
              <button
                onClick={onUpgrade}
                className="mt-2 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade to Growth Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Role Selector Component (Marketer vs Developer)
function RoleSelector({ onSelect, isCompleted = false }: {
  onSelect: (role: 'marketer' | 'developer') => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Role selected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-2">What's your role?</div>
      <div className="text-xs text-gray-500 mb-4">We'll customize the onboarding experience based on your role</div>

      <div className="space-y-3">
        {/* Marketer */}
        <button
          onClick={() => onSelect('marketer')}
          className="w-full flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1">Marketer</div>
            <div className="text-sm text-gray-600 mb-2">I focus on campaign performance and analytics</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-purple-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Dashboard-focused guidance</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Channel integration walkthrough</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Shareable developer guide generated</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
        </button>

        {/* Developer */}
        <button
          onClick={() => onSelect('developer')}
          className="w-full flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100 flex-shrink-0">
            <Code className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1">Developer</div>
            <div className="text-sm text-gray-600 mb-2">I'll be implementing the SDK integration</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-orange-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Technical SDK documentation</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-orange-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Code snippets & examples</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-orange-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Debug & testing tools</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
        </button>
      </div>
    </div>
  );
}

// Role Based Guide Component
function RoleBasedGuide({ role, context, onContinue, isCompleted = false }: {
  role: 'marketer' | 'developer';
  context: string;
  onContinue: () => void;
  isCompleted?: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Guide reviewed</span>
        </div>
      </div>
    );
  }

  if (role === 'marketer') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Marketer Guide</div>
            <div className="text-xs text-gray-500">{context}</div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Dashboard Actions */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm font-medium text-purple-900 mb-2">Dashboard Actions</div>
            <div className="space-y-2 text-xs text-purple-700">
              <div className="flex items-start gap-2">
                <span className="bg-purple-200 text-purple-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
                <span>Go to Settings → App Settings in your dashboard</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-purple-200 text-purple-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
                <span>Configure the required settings as shown below</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-purple-200 text-purple-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
                <span>Share the SDK guide with your development team</span>
              </div>
            </div>
          </div>

          {/* Share with Developer */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Share with Developer</div>
            <p className="text-xs text-gray-600 mb-3">
              Send this link to your development team for SDK integration instructions:
            </p>
            <div className="flex gap-2">
              <code className="flex-1 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                https://help.airbridge.io/sdk-guide/...
              </code>
              <button
                onClick={() => copyToClipboard('https://help.airbridge.io/sdk-guide/...')}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full mt-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          Continue to Channel Integration
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Developer guide
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100">
          <Code className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Developer Guide</div>
          <div className="text-xs text-gray-500">{context}</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Technical Steps */}
        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="text-sm font-medium text-orange-900 mb-2">Implementation Steps</div>
          <div className="space-y-2 text-xs text-orange-700">
            <div className="flex items-start gap-2">
              <span className="bg-orange-200 text-orange-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
              <span>Install SDK package using your package manager</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-orange-200 text-orange-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
              <span>Initialize SDK with your app token</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-orange-200 text-orange-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
              <span>Configure deep linking handlers</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-orange-200 text-orange-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">4</span>
              <span>Implement event tracking</span>
            </div>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Documentation</div>
          <div className="space-y-2">
            <a href="#" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
              <ExternalLink className="w-3 h-3" />
              SDK Reference Documentation
            </a>
            <a href="#" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
              <ExternalLink className="w-3 h-3" />
              Deep Linking Guide
            </a>
            <a href="#" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
              <ExternalLink className="w-3 h-3" />
              Event Tracking API
            </a>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full mt-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
      >
        Start SDK Integration
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Mode Explainer Component
function ModeExplainer({ mode, onContinue, isCompleted = false }: {
  mode: 'dev' | 'production';
  onContinue: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Mode explanation reviewed</span>
        </div>
      </div>
    );
  }

  const isDev = mode === 'dev';

  return (
    <div className={`bg-white border rounded-xl p-5 mt-4 shadow-sm ${isDev ? 'border-green-200' : 'border-blue-200'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDev ? 'bg-green-100' : 'bg-blue-100'}`}>
          {isDev ? (
            <Code className="w-6 h-6 text-green-600" />
          ) : (
            <Sparkles className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <div>
          <div className="font-semibold text-gray-900">
            {isDev ? 'Development Mode' : 'Production Mode'}
          </div>
          <div className="text-xs text-gray-500">
            {isDev ? 'For testing & SDK verification' : 'For live app with real users'}
          </div>
        </div>
      </div>

      {isDev ? (
        <div className="space-y-4">
          {/* What you can do */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-900 mb-3">What you can test</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>SDK initialization & event tracking</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Deep link functionality (URI Scheme, Universal Links)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Deferred deep link testing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Real-time log monitoring</span>
              </div>
            </div>
          </div>

          {/* Limitations */}
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-amber-900">Development Mode Limitations</div>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <X className="w-3.5 h-3.5" />
                <span>Ad channel integration not available</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <X className="w-3.5 h-3.5" />
                <span>Attribution verification not possible</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <X className="w-3.5 h-3.5" />
                <span>Cost data import disabled</span>
              </div>
            </div>
          </div>

          {/* Real-time Log Tip */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700">Use Real-time Logs</div>
                <div className="text-xs text-gray-600 mt-1">
                  Go to Raw Data → App Real-time Log to verify SDK events. Note: Events appear after ~10 minutes and only the last 24 hours are available.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Full capabilities */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-3">Full Capabilities</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Real user data collection & attribution</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ad channel integration (Meta, Google, TikTok, etc.)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cost data import & ROAS analysis</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Full reporting suite (Actuals, Trend, Cohort)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Raw data export & postback configuration</span>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-amber-900">Requirements for Production</div>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <Circle className="w-3.5 h-3.5" />
                <span>App must be published on App Store / Play Store</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <Circle className="w-3.5 h-3.5" />
                <span>Store URLs must be verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <Circle className="w-3.5 h-3.5" />
                <span>iOS: ATT prompt implementation required for IDFA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onContinue}
        className={`w-full mt-4 py-3 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isDev ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        I understand, continue
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// App Name Validation Component
function AppNameValidation({ name, onSubmit, isCompleted = false }: {
  name?: string;
  onSubmit: (name: string) => void;
  isCompleted?: boolean;
}) {
  const [appName, setAppName] = useState(name || '');
  const [touched, setTouched] = useState(false);

  const validateAppName = (value: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!value) {
      errors.push('App name is required');
    } else {
      if (!/^[a-z0-9]+$/.test(value)) {
        errors.push('Only lowercase letters (a-z) and numbers (0-9) allowed');
      }
      if (value.length < 3) {
        errors.push('Minimum 3 characters required');
      }
      if (value.length > 50) {
        errors.push('Maximum 50 characters allowed');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const validation = validateAppName(appName);

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">App name validated</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-1">App Name</div>
      <div className="text-xs text-gray-500 mb-4">This will be used as a unique identifier for your app</div>

      {/* Immutable Warning */}
      <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span className="text-sm text-amber-800">App name cannot be changed after registration</span>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={appName}
          onChange={(e) => {
            setAppName(e.target.value.toLowerCase());
            setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          placeholder="myappname"
          className={`w-full rounded-lg focus:outline-none border px-4 py-3 text-gray-900 ${
            touched && !validation.isValid
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
        />
        {touched && validation.isValid && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>

      {/* Validation Rules */}
      <div className="mt-3 space-y-1">
        <div className={`flex items-center gap-2 text-xs ${
          /^[a-z0-9]*$/.test(appName) && appName.length > 0 ? 'text-green-600' : 'text-gray-500'
        }`}>
          {/^[a-z0-9]*$/.test(appName) && appName.length > 0 ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Circle className="w-3.5 h-3.5" />
          )}
          <span>Lowercase letters and numbers only</span>
        </div>
        <div className={`flex items-center gap-2 text-xs ${
          appName.length >= 3 ? 'text-green-600' : 'text-gray-500'
        }`}>
          {appName.length >= 3 ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Circle className="w-3.5 h-3.5" />
          )}
          <span>At least 3 characters</span>
        </div>
      </div>

      {/* Error Messages */}
      {touched && !validation.isValid && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {appName && validation.isValid && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Your tracking link will look like:</div>
          <code className="text-sm text-blue-600">https://abr.ge/{appName}/...</code>
        </div>
      )}

      <button
        onClick={() => validation.isValid && onSubmit(appName)}
        disabled={!validation.isValid}
        className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          validation.isValid
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        Confirm App Name
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Registration Checklist Component
function RegistrationChecklist({ items, onConfirm, isCompleted = false }: {
  items: RegistrationCheckItem[];
  onConfirm: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Registration checklist confirmed</span>
        </div>
      </div>
    );
  }

  const allValid = items.every(item => item.isValid);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-1">Registration Checklist</div>
      <div className="text-xs text-gray-500 mb-4">Please review before submitting</div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border ${
              item.isValid
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {item.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${item.isValid ? 'text-green-900' : 'text-red-900'}`}>
                    {item.label}
                  </span>
                  {item.isImmutable && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                      Cannot change later
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-0.5 ${item.isValid ? 'text-green-700' : 'text-red-700'}`}>
                  {item.description}
                </div>
                {item.value && (
                  <div className="mt-2 text-sm font-mono bg-white/50 px-2 py-1 rounded">
                    {item.value}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onConfirm}
        disabled={!allValid}
        className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          allValid
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {allValid ? 'Register App' : 'Fix issues to continue'}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Immutable Warning Component
function ImmutableWarning({ field, value, onAcknowledge, isCompleted = false }: {
  field: 'mode' | 'appName' | 'timezone' | 'currency';
  value: string;
  onAcknowledge: () => void;
  isCompleted?: boolean;
}) {
  const fieldLabels = {
    mode: 'App Mode',
    appName: 'App Name',
    timezone: 'Timezone',
    currency: 'Currency',
  };

  const fieldDescriptions = {
    mode: 'The app mode (Development/Production) determines available features and cannot be changed.',
    appName: 'The app name is used as a unique identifier and will appear in your tracking links.',
    timezone: 'All reports and data will be displayed in this timezone.',
    currency: 'All cost and revenue data will be converted to this currency.',
  };

  if (isCompleted) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium text-amber-900 mb-1">
            {fieldLabels[field]} Cannot Be Changed
          </div>
          <div className="text-sm text-amber-800 mb-3">
            {fieldDescriptions[field]}
          </div>
          <div className="p-3 bg-white/50 rounded-lg mb-3">
            <div className="text-xs text-amber-600 mb-1">Selected value:</div>
            <div className="font-medium text-amber-900">{value}</div>
          </div>
          <button
            onClick={onAcknowledge}
            className="w-full py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            I understand, continue
          </button>
        </div>
      </div>
    </div>
  );
}

// Phase Overview Component
function PhaseOverview({ currentPhase, totalPhases, phases, onPhaseClick, isCompleted = false }: {
  currentPhase: number;
  totalPhases: number;
  phases: { id: number; title: string; status: 'pending' | 'in_progress' | 'completed' }[];
  onPhaseClick?: (phaseId: number) => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-4">Onboarding Progress</div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`relative flex items-start gap-4 ${onPhaseClick ? 'cursor-pointer' : ''}`}
              onClick={() => onPhaseClick?.(phase.id)}
            >
              {/* Status Indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                phase.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : phase.status === 'in_progress'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {phase.status === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{phase.id}</span>
                )}
              </div>

              {/* Phase Info */}
              <div className={`flex-1 pb-4 ${index === phases.length - 1 ? 'pb-0' : ''}`}>
                <div className={`text-sm font-medium ${
                  phase.status === 'in_progress' ? 'text-blue-600' :
                  phase.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {phase.title}
                </div>
                {phase.status === 'in_progress' && (
                  <div className="text-xs text-blue-500 mt-0.5">Currently working on this</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Phase Detail Component
function PhaseDetail({ phase, onStart, isCompleted = false }: {
  phase: PhaseInfo;
  onStart: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Phase {phase.id} completed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100">
          <span className="text-lg font-bold text-blue-600">{phase.id}</span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{phase.title}</div>
          {phase.estimatedDuration && (
            <div className="text-xs text-gray-500">{phase.estimatedDuration}</div>
          )}
        </div>
        {phase.requiredFor !== 'both' && (
          <span className={`ml-auto text-xs px-2 py-1 rounded ${
            phase.requiredFor === 'growth'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {phase.requiredFor === 'growth' ? 'Growth Plan' : 'Deep Link Plan'}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">{phase.description}</p>

      <div className="p-4 bg-gray-50 rounded-lg mb-4">
        <div className="text-xs font-medium text-gray-700 mb-2">Steps in this phase:</div>
        <div className="space-y-2">
          {phase.steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
              <Circle className="w-3 h-3 text-gray-400" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        Start Phase {phase.id}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Validation Checklist Component (for SDK, Deeplink, Event, Attribution)
function ValidationChecklist({ category, items, onRunTest, onItemClick, isCompleted = false }: {
  category: 'sdk' | 'deeplink' | 'event' | 'attribution';
  items: ValidationItem[];
  onRunTest: () => void;
  onItemClick?: (itemId: string) => void;
  isCompleted?: boolean;
}) {
  const categoryConfig = {
    sdk: { title: 'SDK Verification', icon: Code, color: 'blue' },
    deeplink: { title: 'Deep Link Verification', icon: Share2, color: 'green' },
    event: { title: 'Event Tracking Verification', icon: Sparkles, color: 'purple' },
    attribution: { title: 'Attribution Verification', icon: CheckCircle2, color: 'orange' },
  };

  const config = categoryConfig[category];
  const Icon = config.icon;
  const allPassed = items.every(item => item.status === 'passed');
  const hasFailed = items.some(item => item.status === 'failed');
  const isChecking = items.some(item => item.status === 'checking');

  if (isCompleted && allPassed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-700">{config.title} - All checks passed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${config.color}-100`}>
          <Icon className={`w-5 h-5 text-${config.color}-600`} />
        </div>
        <div>
          <div className="font-medium text-gray-900">{config.title}</div>
          <div className="text-xs text-gray-500">
            {allPassed ? 'All checks passed' : hasFailed ? 'Some checks failed' : 'Ready to verify'}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border ${
              item.status === 'passed' ? 'bg-green-50 border-green-200' :
              item.status === 'failed' ? 'bg-red-50 border-red-200' :
              item.status === 'checking' ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200'
            } ${onItemClick ? 'cursor-pointer hover:bg-opacity-75' : ''}`}
            onClick={() => onItemClick?.(item.id)}
          >
            <div className="flex items-start gap-3">
              {item.status === 'checking' ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
              ) : item.status === 'passed' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : item.status === 'failed' ? (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  item.status === 'passed' ? 'text-green-900' :
                  item.status === 'failed' ? 'text-red-900' :
                  'text-gray-900'
                }`}>
                  {item.label}
                </div>
                <div className={`text-xs mt-0.5 ${
                  item.status === 'passed' ? 'text-green-700' :
                  item.status === 'failed' ? 'text-red-700' :
                  'text-gray-600'
                }`}>
                  {item.status === 'failed' && item.errorMessage ? item.errorMessage : item.description}
                </div>
                {item.status === 'failed' && item.helpLink && (
                  <a
                    href={item.helpLink}
                    className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View troubleshooting guide
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!allPassed && (
        <button
          onClick={onRunTest}
          disabled={isChecking}
          className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            isChecking
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              Run Verification
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Realtime Log Guide Component
function RealtimeLogGuide({ appName, onContinue, isCompleted = false }: {
  appName: string;
  onContinue: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Real-time log guide reviewed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Real-time Log Monitoring</div>
          <div className="text-xs text-gray-500">Verify your SDK events in real-time</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* How to access */}
        <div className="p-4 bg-indigo-50 rounded-lg">
          <div className="text-sm font-medium text-indigo-900 mb-2">How to access</div>
          <div className="space-y-2 text-xs text-indigo-700">
            <div className="flex items-start gap-2">
              <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
              <span>Go to Raw Data → App Real-time Log in your dashboard</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
              <span>Trigger events from your test device</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
              <span>Wait ~10 minutes for events to appear</span>
            </div>
          </div>
        </div>

        {/* What to check */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">What you can verify</div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
              <span>Platform (OS) and SDK version</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
              <span>Event category and action</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
              <span>Device identifiers (ADID, Cookie ID)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
              <span>User ID and custom attributes</span>
            </div>
          </div>
        </div>

        {/* Important notes */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <strong>Note:</strong> Events appear after ~10 minutes. Only the last 24 hours of data is available in real-time logs.
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <a
          href={`https://dashboard.airbridge.io/apps/${appName}/raw-data/app-real-time-log`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 border border-indigo-200 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open Real-time Logs
        </a>
        <button
          onClick={onContinue}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Test Scenario Guide Component
function TestScenarioGuide({ scenarios, onTest, onComplete, isCompleted = false }: {
  scenarios: TestScenario[];
  onTest: (scenarioId: string) => void;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const allPassed = scenarios.every(s => s.status === 'passed');
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  if (isCompleted && allPassed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-700">All test scenarios passed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 shadow-sm">
      <div className="text-sm font-medium text-gray-700 mb-1">Test Scenarios</div>
      <div className="text-xs text-gray-500 mb-4">Complete these tests to verify your integration</div>

      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`rounded-lg border overflow-hidden ${
              scenario.status === 'passed' ? 'border-green-200' :
              scenario.status === 'failed' ? 'border-red-200' :
              scenario.status === 'testing' ? 'border-blue-200' :
              'border-gray-200'
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 cursor-pointer ${
                scenario.status === 'passed' ? 'bg-green-50' :
                scenario.status === 'failed' ? 'bg-red-50' :
                scenario.status === 'testing' ? 'bg-blue-50' :
                'bg-gray-50'
              }`}
              onClick={() => setExpandedScenario(
                expandedScenario === scenario.id ? null : scenario.id
              )}
            >
              <div className="flex items-start gap-3">
                {scenario.status === 'testing' ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                ) : scenario.status === 'passed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : scenario.status === 'failed' ? (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{scenario.name}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{scenario.description}</div>
                </div>
                {expandedScenario === scenario.id ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedScenario === scenario.id && (
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-2">Steps:</div>
                <div className="space-y-2 mb-3">
                  {scenario.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="bg-gray-200 text-gray-700 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-blue-50 rounded text-xs text-blue-700">
                  <strong>Expected:</strong> {scenario.expectedResult}
                </div>
                {scenario.status !== 'passed' && scenario.status !== 'testing' && (
                  <button
                    onClick={() => onTest(scenario.id)}
                    className="mt-3 w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Run This Test
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {allPassed && (
        <button
          onClick={onComplete}
          className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          All Tests Passed - Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Error Recovery Component
function ErrorRecovery({ errorType, message, suggestions, onRetry, onSkip, isCompleted = false }: {
  errorType: string;
  message: string;
  suggestions: string[];
  onRetry: () => void;
  onSkip?: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 mt-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium text-red-900 mb-1">{errorType}</div>
          <div className="text-sm text-red-700 mb-3">{message}</div>

          {suggestions.length > 0 && (
            <div className="p-3 bg-white/50 rounded-lg mb-3">
              <div className="text-xs font-medium text-red-800 mb-2">Suggested solutions:</div>
              <div className="space-y-1.5">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-red-700">
                    <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="flex-1 py-2.5 border border-red-200 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Skip for Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Setup Warning Component
function SetupWarning({ warningType, title, message, onDismiss, isCompleted = false }: {
  warningType: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  onDismiss?: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return null;
  }

  const config = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Lightbulb,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900',
      textColor: 'text-amber-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-700',
    },
  };

  const c = config[warningType];
  const Icon = c.icon;

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 mt-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${c.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className={`font-medium ${c.titleColor}`}>{title}</div>
          <div className={`text-sm ${c.textColor} mt-1`}>{message}</div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`p-1 hover:bg-black/10 rounded transition-colors`}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">App Name</div>
        <div className="text-xs text-gray-400">Input completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">App Name</div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Enter your app name"
        className="w-full rounded-lg focus:outline-none border border-gray-200 text-gray-900 px-3 py-2"
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Search Results</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Select Platforms</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-2">Select Platforms</div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">App Name</div>
        <div className="text-xs text-gray-400">Input completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-2">App Name</div>
      <div className="text-xs text-gray-500 mb-3">
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
        className={`w-full rounded-lg focus:outline-none border text-gray-900 px-4 py-3 ${error ? 'border-red-500' : 'border-gray-200'}`}
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
        <div className="text-xs text-gray-500 mb-3">
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
      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Timezone & Currency</div>
        <div className="text-xs text-gray-400">Confirmation completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Timezone & Currency
      </div>
      <div className="text-xs text-gray-500 mb-3">
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

// Searchable Select Component
function SearchableSelect({
  label,
  placeholder,
  options,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchText('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs text-gray-500 block mb-2">{label}</label>
      <div
        className={`relative w-full rounded-lg border ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'} bg-white transition-all`}
      >
        <div className="flex items-center">
          <Search className="w-4 h-4 text-gray-400 ml-4" />
          <input
            type="text"
            value={isOpen ? searchText : value}
            onChange={e => {
              setSearchText(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              setSearchText('');
            }}
            placeholder={value || placeholder}
            className="w-full px-3 py-3 rounded-lg focus:outline-none text-gray-900 text-sm"
          />
          {value && !isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="mr-2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 mr-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors ${
                    value === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {value === option && <Check className="w-4 h-4 text-blue-500" />}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
            )}
          </div>
        )}
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Timezone & Currency</div>
        <div className="text-xs text-gray-400">Input completed</div>
      </div>
    );
  }

  const timezones = [
    'Asia/Seoul (KST, UTC+9)',
    'Asia/Tokyo (JST, UTC+9)',
    'Asia/Shanghai (CST, UTC+8)',
    'Asia/Singapore (SGT, UTC+8)',
    'Asia/Hong_Kong (HKT, UTC+8)',
    'Asia/Taipei (CST, UTC+8)',
    'Asia/Bangkok (ICT, UTC+7)',
    'Asia/Jakarta (WIB, UTC+7)',
    'Asia/Manila (PHT, UTC+8)',
    'Asia/Kolkata (IST, UTC+5:30)',
    'Asia/Dubai (GST, UTC+4)',
    'America/New_York (EST, UTC-5)',
    'America/Los_Angeles (PST, UTC-8)',
    'America/Chicago (CST, UTC-6)',
    'America/Denver (MST, UTC-7)',
    'America/Sao_Paulo (BRT, UTC-3)',
    'America/Mexico_City (CST, UTC-6)',
    'America/Toronto (EST, UTC-5)',
    'Europe/London (GMT, UTC+0)',
    'Europe/Paris (CET, UTC+1)',
    'Europe/Berlin (CET, UTC+1)',
    'Europe/Amsterdam (CET, UTC+1)',
    'Europe/Moscow (MSK, UTC+3)',
    'Australia/Sydney (AEDT, UTC+11)',
    'Australia/Melbourne (AEDT, UTC+11)',
    'Pacific/Auckland (NZDT, UTC+13)',
  ];

  const currencies = [
    'KRW (Korean Won)',
    'USD (US Dollar)',
    'JPY (Japanese Yen)',
    'EUR (Euro)',
    'GBP (British Pound)',
    'CNY (Chinese Yuan)',
    'TWD (Taiwan Dollar)',
    'HKD (Hong Kong Dollar)',
    'SGD (Singapore Dollar)',
    'THB (Thai Baht)',
    'IDR (Indonesian Rupiah)',
    'PHP (Philippine Peso)',
    'VND (Vietnamese Dong)',
    'MYR (Malaysian Ringgit)',
    'INR (Indian Rupee)',
    'AUD (Australian Dollar)',
    'CAD (Canadian Dollar)',
    'CHF (Swiss Franc)',
    'BRL (Brazilian Real)',
    'MXN (Mexican Peso)',
    'AED (UAE Dirham)',
    'SAR (Saudi Riyal)',
    'RUB (Russian Ruble)',
    'NZD (New Zealand Dollar)',
  ];

  const isValid = timezone && currency;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Select Timezone & Currency
      </div>
      <div className="flex items-center gap-2 mb-3 px-4 py-3 rounded-lg bg-amber-100">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span className="text-xs text-amber-800">Timezone and currency cannot be changed after registration</span>
      </div>
      <div className="space-y-4">
        <SearchableSelect
          label="Timezone"
          placeholder="Search timezone..."
          options={timezones}
          value={timezone}
          onChange={setTimezone}
        />
        <SearchableSelect
          label="Currency"
          placeholder="Search currency..."
          options={currencies}
          value={currency}
          onChange={setCurrency}
        />
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">App Information</div>
        <div className="text-xs text-gray-400">Form completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-4">App Information</div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">App Name *</label>
          <input
            type="text"
            value={info.appName}
            onChange={e => setInfo({ ...info, appName: e.target.value })}
            placeholder="MyApp"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Store URL (optional)</label>
          <input
            type="text"
            value={info.storeUrl}
            onChange={e => setInfo({ ...info, storeUrl: e.target.value })}
            placeholder="https://apps.apple.com/..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">We&apos;ll automatically fetch app info when provided</p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-3">Or enter manually</p>

          {platforms.includes('ios') && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">iOS Bundle ID</label>
              <input
                type="text"
                value={info.bundleId}
                onChange={e => setInfo({ ...info, bundleId: e.target.value })}
                placeholder="com.company.appname"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
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
          setTimeout(() => onConfirm('completed'), 800);
        }
      }, totalDelay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [onConfirm, isCompleted]);

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">App Registration Complete</span>
        </div>
      </div>
    );
  }

  const registrationSteps = [
    { label: 'Validating app info...', icon: '🔍' },
    { label: 'Creating app...', icon: '📱' },
    { label: 'Generating tokens...', icon: '🔑' },
    { label: 'Registration complete!', icon: '✅' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 min-w-[280px] max-w-full w-full">
      <div className="text-sm font-medium text-gray-900 mb-4">App Registration</div>

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
      <div className="pt-4 border-t border-gray-100">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Development Framework</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Select Development Framework</div>

      {frameworks.map(group => (
        <div key={group.category} className="mb-4 last:mb-0">
          <div className="text-xs text-gray-500 mb-2">{group.category}</div>
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

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">SDK Initialization Code</div>

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

      <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        You can find App Token in Dashboard Settings
      </p>

      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        {[
          { label: 'Done!', value: 'completed' },
          { label: 'I can\'t find App Token', value: 'help-token' },
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
  );
}

// React Native SDK Install Component
function ReactNativeSdkInstall({
  appName,
  appToken,
  onConfirm,
  isCompleted = false
}: {
  appName: string;
  appToken: string;
  onConfirm: (status: string) => void;
  isCompleted?: boolean;
}) {
  const [sdkType, setSdkType] = useState<'regular' | 'restricted'>('regular');
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const [iosLanguage, setIosLanguage] = useState<'swift' | 'objc'>('swift');
  const [androidLanguage, setAndroidLanguage] = useState<'kotlin' | 'java'>('kotlin');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Installation commands
  const npmInstallCommand = sdkType === 'regular'
    ? 'npm install airbridge-react-native-sdk'
    : 'npm install airbridge-react-native-sdk-restricted';

  const podInstallCommand = 'cd ios; pod install';

  // iOS initialization code
  const iosSwiftCode = `import AirbridgeReactNative
...
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    AirbridgeReactNative.initializeSDK(name: "${appName}", token:"${appToken}")
    ...
}`;

  const iosObjcCode = `#import <AirbridgeReactNative/AirbridgeReactNative.h>
...
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [AirbridgeReactNative initializeSDKWithName:@"${appName}" token:@"${appToken}"];
    ...
}`;

  // Android initialization code
  const androidKotlinCode = `import co.ab180.airbridge.reactnative.AirbridgeReactNative
...
override fun onCreate() {
    super.onCreate()
    AirbridgeReactNative.initializeSDK(this, "${appName}", "${appToken}")
    ...
}`;

  const androidJavaCode = `import co.ab180.airbridge.reactnative.AirbridgeReactNative;
...
@Override
public void onCreate() {
    super.onCreate();
    AirbridgeReactNative.initializeSDK(this, "${appName}", "${appToken}");
    ...
}`;

  const getCurrentInitCode = () => {
    if (platform === 'ios') {
      return iosLanguage === 'swift' ? iosSwiftCode : iosObjcCode;
    }
    return androidLanguage === 'kotlin' ? androidKotlinCode : androidJavaCode;
  };

  const getInitFilePath = () => {
    if (platform === 'ios') {
      return iosLanguage === 'swift'
        ? 'ios/YOUR_PROJECT_NAME/AppDelegate.swift'
        : 'ios/YOUR_PROJECT_NAME/AppDelegate.m';
    }
    return androidLanguage === 'kotlin'
      ? 'android/app/src/main/java/.../MainApplication.kt'
      : 'android/app/src/main/java/.../MainApplication.java';
  };

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">React Native SDK Setup Complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">React Native SDK</h2>
        </div>
        <a
          href="https://help.airbridge.io/developers/react-native-sdk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Documentation
        </a>
      </div>

      {/* Auth Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">App Name:</span>
            <span className="ml-2 font-mono text-gray-900">{appName}</span>
          </div>
          <div>
            <span className="text-gray-500">App Token:</span>
            <span className="ml-2 font-mono text-gray-900">{appToken}</span>
          </div>
        </div>
      </div>

      {/* SDK Type Selection */}
      <div className="mb-5">
        <div className="text-sm font-medium text-gray-700 mb-2">SDK Type</div>
        <div className="flex gap-2">
          <button
            onClick={() => setSdkType('regular')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              sdkType === 'regular'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Regular SDK
          </button>
          <button
            onClick={() => setSdkType('restricted')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              sdkType === 'restricted'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Restricted SDK
          </button>
        </div>
        {sdkType === 'restricted' && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Restricted SDK</strong> does not collect device IDs (GAID, IDFA) for privacy compliance.
            </p>
          </div>
        )}
      </div>

      {/* Step 1: Install Package */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">1</div>
          <span className="text-sm font-medium text-gray-700">Install Package</span>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
            <span className="text-sm" style={{ color: '#9ca3af' }}>Terminal</span>
            <button
              onClick={() => handleCopy(npmInstallCommand, 'npm')}
              className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
              style={{ color: '#9ca3af' }}
            >
              {copiedCode === 'npm' ? <Check className="w-4 h-4" style={{ color: '#4ade80' }} /> : <Copy className="w-4 h-4" />}
              {copiedCode === 'npm' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-sm overflow-x-auto" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
            <code>{npmInstallCommand}</code>
          </pre>
        </div>
      </div>

      {/* Step 2: iOS Dependencies */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">2</div>
          <span className="text-sm font-medium text-gray-700">Install iOS Dependencies</span>
        </div>
        <p className="text-xs text-gray-500 mb-2 ml-7">Android dependencies are installed automatically.</p>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
            <span className="text-sm" style={{ color: '#9ca3af' }}>Terminal</span>
            <button
              onClick={() => handleCopy(podInstallCommand, 'pod')}
              className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
              style={{ color: '#9ca3af' }}
            >
              {copiedCode === 'pod' ? <Check className="w-4 h-4" style={{ color: '#4ade80' }} /> : <Copy className="w-4 h-4" />}
              {copiedCode === 'pod' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-sm overflow-x-auto" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
            <code>{podInstallCommand}</code>
          </pre>
        </div>
      </div>

      {/* Step 3: Initialize SDK */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">3</div>
          <span className="text-sm font-medium text-gray-700">Initialize SDK</span>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-7">
          iOS and Android require separate initialization. Add the code to your native files.
        </p>

        {/* Platform Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPlatform('ios')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              platform === 'ios'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            iOS
          </button>
          <button
            onClick={() => setPlatform('android')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              platform === 'android'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Android
          </button>
        </div>

        {/* Code Block */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
            <span className="text-sm" style={{ color: '#9ca3af' }}>{getInitFilePath()}</span>
            <button
              onClick={() => handleCopy(getCurrentInitCode(), 'init')}
              className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
              style={{ color: '#9ca3af' }}
            >
              {copiedCode === 'init' ? <Check className="w-4 h-4" style={{ color: '#4ade80' }} /> : <Copy className="w-4 h-4" />}
              {copiedCode === 'init' ? 'Copied' : 'Copy'}
            </button>
          </div>
          {/* Language Tabs */}
          <div className="flex gap-2 px-4 pt-3">
            {platform === 'ios' ? (
              <>
                <button
                  onClick={() => setIosLanguage('swift')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    iosLanguage === 'swift'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Swift
                </button>
                <button
                  onClick={() => setIosLanguage('objc')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    iosLanguage === 'objc'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Objective-C
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAndroidLanguage('kotlin')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    androidLanguage === 'kotlin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Kotlin
                </button>
                <button
                  onClick={() => setAndroidLanguage('java')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    androidLanguage === 'java'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Java
                </button>
              </>
            )}
          </div>
          <pre className="p-4 text-sm overflow-x-auto" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
            <code>{getCurrentInitCode()}</code>
          </pre>
        </div>
      </div>

      {/* Token Help */}
      <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        You can find App Name and App Token in Dashboard &gt; Settings &gt; Tokens
      </p>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        {[
          { label: 'Done!', value: 'completed' },
          { label: 'I can\'t find App Token', value: 'help-token' },
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
  );
}

// React Native SDK Config Component
function ReactNativeSdkConfig({
  onComplete,
  isCompleted = false
}: {
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAllSettings, setShowAllSettings] = useState(false);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const configJson = `{
  "sdkEnabled": true,
  "logLevel": "warning",
  "autoStartTrackingEnabled": true,
  "sessionTimeoutInSecond": 300
}`;

  const fullConfigJson = `{
  "sdkEnabled": boolean,
  "logLevel": "debug" | "info" | "warning" | "error" | "fault",
  "autoStartTrackingEnabled": boolean,
  "autoDetermineTrackingAuthorizationTimeoutInSecond": number,
  "trackMetaDeferredAppLinkEnabled": boolean,
  "sessionTimeoutInSecond": number,
  "metaInstallReferrerAppID": string,
  "trackAirbridgeDeeplinkOnlyEnabled": boolean,
  "trackInSessionLifecycleEventEnabled": boolean,
  "trackingLinkCustomDomains": [string],
  "hashUserInformationEnabled": boolean,
  "sdkSignatureID": string,
  "sdkSignatureSecret": string,
  "clearEventBufferOnInitializeEnabled": boolean,
  "eventBufferCountLimit": number,
  "eventBufferSizeLimitInGibibyte": number,
  "eventTransmitIntervalInSecond": number,
  "isHandleAirbridgeDeeplinkOnly": boolean,
  "collectTCFDataEnabled": boolean,
  "trackingBlocklist": [string],
  "calculateSKAdNetworkByServerEnabled": boolean
}`;

  const settingsGuide = [
    { key: 'sdkEnabled', desc: 'SDK 비활성화 상태로 초기화', link: '#sdk-enabled' },
    { key: 'logLevel', desc: 'SDK 로그 레벨 설정', link: '#log-level' },
    { key: 'autoStartTrackingEnabled', desc: '옵트인/옵트아웃 설정', link: '#auto-start' },
    { key: 'autoDetermineTrackingAuthorizationTimeoutInSecond', desc: 'ATT 프롬프트 타임아웃', link: '#att-timeout' },
    { key: 'trackMetaDeferredAppLinkEnabled', desc: '메타 디퍼드 앱 링크', link: '#meta-deferred' },
    { key: 'sessionTimeoutInSecond', desc: '세션 타임아웃 설정', link: '#session-timeout' },
    { key: 'metaInstallReferrerAppID', desc: '메타 인스톨 리퍼러', link: '#meta-referrer' },
    { key: 'trackAirbridgeDeeplinkOnlyEnabled', desc: '에어브릿지 딥링크만 추적', link: '#airbridge-deeplink-only' },
    { key: 'hashUserInformationEnabled', desc: '유저 정보 해시화', link: '#hash-user' },
    { key: 'sdkSignatureID', desc: 'SDK 시그니처 ID', link: '#sdk-signature' },
    { key: 'sdkSignatureSecret', desc: 'SDK 시그니처 Secret', link: '#sdk-signature' },
    { key: 'trackingBlocklist', desc: '식별자 추적 제한', link: '#tracking-blocklist' },
    { key: 'calculateSKAdNetworkByServerEnabled', desc: 'SKAdNetwork 서버 계산', link: '#skan-server' },
  ];

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">SDK Configuration Complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">SDK Configuration</h2>
        </div>
        <a
          href="https://help.airbridge.io/developers/react-native-sdk#sdk-settings"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Documentation
        </a>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
        <div className="flex gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Configuration Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Create <code className="bg-blue-100 px-1 rounded">airbridge.json</code> in your React Native project root</li>
              <li>Add the configuration options you need (omit unused keys)</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Example Config */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Example Configuration</div>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
            <span className="text-sm" style={{ color: '#9ca3af' }}>airbridge.json</span>
            <button
              onClick={() => handleCopy(configJson, 'config')}
              className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
              style={{ color: '#9ca3af' }}
            >
              {copiedCode === 'config' ? <Check className="w-4 h-4" style={{ color: '#4ade80' }} /> : <Copy className="w-4 h-4" />}
              {copiedCode === 'config' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-sm overflow-x-auto" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
            <code>{configJson}</code>
          </pre>
        </div>
      </div>

      {/* All Available Options Toggle */}
      <button
        onClick={() => setShowAllSettings(!showAllSettings)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        {showAllSettings ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span>View all available options</span>
      </button>

      {showAllSettings && (
        <>
          {/* Full Config JSON */}
          <div className="mb-4">
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
              <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
                <span className="text-sm" style={{ color: '#9ca3af' }}>All Configuration Options</span>
                <button
                  onClick={() => handleCopy(fullConfigJson, 'full-config')}
                  className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
                  style={{ color: '#9ca3af' }}
                >
                  {copiedCode === 'full-config' ? <Check className="w-4 h-4" style={{ color: '#4ade80' }} /> : <Copy className="w-4 h-4" />}
                  {copiedCode === 'full-config' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-xs overflow-x-auto" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
                <code>{fullConfigJson}</code>
              </pre>
            </div>
          </div>

          {/* Settings Guide Table */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Settings Guide</div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 font-medium text-gray-700">Setting</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {settingsGuide.map((setting, index) => (
                    <tr key={setting.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">{setting.key}</code>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{setting.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Note */}
      <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Only include settings you need. Omit unused keys for cleaner configuration.
      </p>

      {/* Action Button */}
      <button
        onClick={onComplete}
        className="w-full py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Check className="w-4 h-4" />
        Configuration Complete
      </button>
    </div>
  );
}

// iOS ATT Prompt Config Component
function IosAttPromptConfig({
  appName,
  appToken,
  onComplete,
  isCompleted = false
}: {
  appName: string;
  appToken: string;
  onComplete: () => void;
  isCompleted?: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promptTiming, setPromptTiming] = useState<'launch' | 'custom'>('launch');
  const [codeLanguage, setCodeLanguage] = useState<'swift' | 'objc'>('swift');
  const [timeout, setTimeout] = useState(30);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    window.setTimeout(() => setCopiedCode(null), 2000);
  };

  // Info.plist code
  const infoPlistCode = `<key>NSUserTrackingUsageDescription</key>
<string>We use your data to provide personalized ads and improve your experience.</string>`;

  // ATT at desired time
  const attCustomSwift = `import AppTrackingTransparency
...
ATTrackingManager.requestTrackingAuthorization { _ in }`;

  const attCustomObjc = `#import <AppTrackingTransparency/AppTrackingTransparency.h>
...
[ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) {}];`;

  // ATT at launch
  const attLaunchSwift = `import UIKit
import Airbridge
import AppTrackingTransparency

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var observer: Any?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let option = AirbridgeOptionBuilder(name: "${appName}", token: "${appToken}")
            .build()
        Airbridge.initializeSDK(option: option)

        observer = NotificationCenter.default.addObserver(
            forName: UIApplication.didBecomeActiveNotification,
            object: nil,
            queue: nil
        ) { [weak self] _ in
            if #available(iOS 14, *) {
                ATTrackingManager.requestTrackingAuthorization { _ in }
            }
            if let observer = self?.observer {
                NotificationCenter.default.removeObserver(observer)
            }
        }

        return true
    }
}`;

  const attLaunchObjc = `#import <UIKit/UIKit.h>
#import <Airbridge/Airbridge.h>
#import <AppTrackingTransparency/AppTrackingTransparency.h>

@implementation AppDelegate {
    id observer;
}

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    AirbridgeOptionBuilder *builder = [[AirbridgeOptionBuilder alloc]
        initWithName:@"${appName}" token:@"${appToken}"];
    [Airbridge initializeSDKWithOption:[builder build]];

    observer = [[NSNotificationCenter defaultCenter]
        addObserverForName:UIApplicationDidBecomeActiveNotification
        object:nil queue:nil usingBlock:^(NSNotification *note) {
            if (@available(iOS 14, *)) {
                [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:
                    ^(ATTrackingManagerAuthorizationStatus status) {}];
            }
            [[NSNotificationCenter defaultCenter] removeObserver:self->observer];
        }];

    return YES;
}
@end`;

  // Timeout setting code
  const timeoutSwift = `import Airbridge
...
let option = AirbridgeOptionBuilder(name: "${appName}", token: "${appToken}")
    .setAutoDetermineTrackingAuthorizationTimeout(second: ${timeout})
    .build()
Airbridge.initializeSDK(option: option)`;

  const timeoutObjc = `#import <Airbridge/Airbridge.h>
...
AirbridgeOptionBuilder *builder = [[AirbridgeOptionBuilder alloc]
    initWithName:@"${appName}" token:@"${appToken}"];
[builder setAutoDetermineTrackingAuthorizationTimeoutWithSecond:${timeout}];
[Airbridge initializeSDKWithOption:[builder build]];`;

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">ATT Prompt Configuration Complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Configure ATT Prompt</h2>
        </div>
        <a
          href="https://help.airbridge.io/developers/ios-sdk#configure-att-prompt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Documentation
        </a>
      </div>

      {/* Warning Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Important</p>
            <p className="text-xs mt-1">
              IDFA can only be collected if users consent via the ATT prompt.
              Event collection should be delayed until the user allows tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Info.plist */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">1</div>
          <span className="text-sm font-medium text-gray-700">Add NSUserTrackingUsageDescription to Info.plist</span>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-7">
          Navigate to [YOUR_PROJECT] → [Info] → [Custom iOS Target Properties] in Xcode and add "Privacy - Tracking Usage Description".
        </p>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
            <span className="text-sm" style={{ color: '#9ca3af' }}>Info.plist</span>
            <button
              onClick={() => handleCopy(infoPlistCode, 'plist')}
              className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
              style={{ color: '#9ca3af' }}
            >
              {copiedCode === 'plist' ? <Check className="w-4 h-4" style={{ color: '#4ade80' }} /> : <Copy className="w-4 h-4" />}
              {copiedCode === 'plist' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-sm overflow-x-auto" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
            <code>{infoPlistCode}</code>
          </pre>
        </div>
      </div>

      {/* Step 2: ATT Prompt Timing */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">2</div>
          <span className="text-sm font-medium text-gray-700">Set ATT Prompt Timing</span>
        </div>

        {/* Timing Selection */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPromptTiming('launch')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              promptTiming === 'launch'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            At App Launch
          </button>
          <button
            onClick={() => setPromptTiming('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              promptTiming === 'custom'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            At Desired Time
          </button>
        </div>

        {/* Code Block */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
            <span className="text-sm" style={{ color: '#9ca3af' }}>
              {promptTiming === 'launch' ? 'AppDelegate' : 'Your View Controller'}
            </span>
            <button
              onClick={() => handleCopy(
                promptTiming === 'launch'
                  ? (codeLanguage === 'swift' ? attLaunchSwift : attLaunchObjc)
                  : (codeLanguage === 'swift' ? attCustomSwift : attCustomObjc),
                'att'
              )}
              className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
              style={{ color: '#9ca3af' }}
            >
              {copiedCode === 'att' ? <Check className="w-4 h-4" style={{ color: '#4ade80' }} /> : <Copy className="w-4 h-4" />}
              {copiedCode === 'att' ? 'Copied' : 'Copy'}
            </button>
          </div>
          {/* Language Tabs */}
          <div className="flex gap-2 px-4 pt-3">
            <button
              onClick={() => setCodeLanguage('swift')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                codeLanguage === 'swift'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Swift
            </button>
            <button
              onClick={() => setCodeLanguage('objc')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                codeLanguage === 'objc'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Objective-C
            </button>
          </div>
          <pre className="p-4 text-xs overflow-x-auto" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
            <code>
              {promptTiming === 'launch'
                ? (codeLanguage === 'swift' ? attLaunchSwift : attLaunchObjc)
                : (codeLanguage === 'swift' ? attCustomSwift : attCustomObjc)}
            </code>
          </pre>
        </div>
      </div>

      {/* Step 3: Timeout Setting */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">3</div>
          <span className="text-sm font-medium text-gray-700">Set Event Collection Delay</span>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-7">
          Delay event collection until user responds to ATT prompt. Default is 30 seconds (max 3600 seconds).
        </p>

        {/* Timeout Slider */}
        <div className="ml-7 mb-3">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="120"
              value={timeout}
              onChange={(e) => setTimeout(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="w-20 text-center">
              <span className="text-sm font-mono font-medium text-gray-900">{timeout}s</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0s</span>
            <span>30s (default)</span>
            <span>120s</span>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111827' }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1f2937' }}>
            <span className="text-sm" style={{ color: '#9ca3af' }}>SDK Initialization</span>
            <button
              onClick={() => handleCopy(codeLanguage === 'swift' ? timeoutSwift : timeoutObjc, 'timeout')}
              className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
              style={{ color: '#9ca3af' }}
            >
              {copiedCode === 'timeout' ? <Check className="w-4 h-4" style={{ color: '#4ade80' }} /> : <Copy className="w-4 h-4" />}
              {copiedCode === 'timeout' ? 'Copied' : 'Copy'}
            </button>
          </div>
          {/* Language Tabs for Timeout */}
          <div className="flex gap-2 px-4 pt-3">
            <button
              onClick={() => setCodeLanguage('swift')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                codeLanguage === 'swift'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Swift
            </button>
            <button
              onClick={() => setCodeLanguage('objc')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                codeLanguage === 'objc'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Objective-C
            </button>
          </div>
          <pre className="p-4 text-sm overflow-x-auto" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
            <code>{codeLanguage === 'swift' ? timeoutSwift : timeoutObjc}</code>
          </pre>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onComplete}
        className="w-full py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Check className="w-4 h-4" />
        ATT Configuration Complete
      </button>
    </div>
  );
}

// Deep Link Choice Component
function DeeplinkChoice({ onSelect, isCompleted = false }: { onSelect: (choice: string) => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Deep Link Setup</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Deep Link Setup</div>

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
  const [appIdPrefix, setAppIdPrefix] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const appId = appIdPrefix && bundleId ? `${appIdPrefix}.${bundleId}` : '';
  const airbrdigeHost = appName ? `${appName}.airbridge.io` : '[your_app_name].airbridge.io';
  const applinksValue = `applinks:${airbrdigeHost}`;

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">iOS Deep Link Setup Complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 w-full max-w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">iOS</h2>
        <a
          href="https://help.airbridge.io/ko/developers/ios-sdk-v4#%EC%97%90%EC%96%B4%EB%B8%8C%EB%A6%BF%EC%A7%80%EC%97%90-%EB%94%A5%EB%A7%81%ED%81%AC-%EC%A0%95%EB%B3%B4-%EB%93%B1%EB%A1%9D%ED%95%98%EA%B8%B0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <Code className="w-3.5 h-3.5" />
          Developer Guide
        </a>
      </div>

      {/* iOS URL Scheme Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium text-gray-900">iOS URL Scheme</h3>
          <span className="text-red-500 text-xs">*</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Only values specified in the iOS configuration file info.plist can be entered.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={uriScheme}
            onChange={(e) => setUriScheme(e.target.value.toLowerCase().replace(/[^a-z0-9+.-]/g, ''))}
            placeholder="Enter iOS URL scheme"
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="flex items-center px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-mono">://</span>
        </div>
      </div>

      {/* iOS App ID Section */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">iOS App ID</h3>
            <span className="text-red-500 text-xs">*</span>
          </div>
          <a
            href="https://help.airbridge.io/en/developers/ios-sdk-v4"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <Code className="w-3 h-3" />
            Developer Guide
          </a>
        </div>
        <div className="text-xs text-gray-500 mb-3 space-y-1">
          <p>A value used to verify deep links on iOS. Combine the App ID Prefix from Apple Developer Center with a period (.) and Bundle ID.</p>
          <p className="text-gray-400">Example: 1AB23CDEFG.com.your.bundleid</p>
        </div>

        {/* App ID Prefix Input */}
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1.5">App ID Prefix</label>
          <input
            type="text"
            value={appIdPrefix}
            onChange={(e) => setAppIdPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="1AB23CDEFG"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
        </div>

        {/* Generated App ID Preview */}
        {bundleId && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="text-xs text-blue-600 mb-1">Generated iOS App ID</div>
            <div className="flex items-center justify-between">
              <code className="text-sm text-blue-900 font-medium">
                {appId || `[App ID Prefix].${bundleId}`}
              </code>
              {appId && (
                <button
                  onClick={() => handleCopy(appId, 'appId')}
                  className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                >
                  {copySuccess === 'appId' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SDK Configuration Info */}
      <div className="mb-5 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 mb-2">iOS SDK Configuration Info</h3>
        <p className="text-xs text-gray-500 mb-3">
          Use the following value when adding applinks:your_app_name.airbridge.io to Xcode.
        </p>
        <button
          onClick={() => handleCopy(applinksValue, 'applinks')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group"
        >
          <code className="text-sm text-gray-700 font-medium">{applinksValue}</code>
          {copySuccess === 'applinks' ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          )}
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => onSubmit({ uriScheme: uriScheme + '://', appId })}
        disabled={!uriScheme || !appIdPrefix}
        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          uriScheme && appIdPrefix
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Save Settings
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Deep Link Android Input Component
function DeeplinkAndroidInput({
  packageName,
  appName,
  onSubmit,
  isCompleted = false
}: {
  packageName?: string;
  appName?: string;
  onSubmit: (data: { uriScheme: string; sha256Fingerprints: string[] }) => void;
  isCompleted?: boolean;
}) {
  const [uriScheme, setUriScheme] = useState('');
  const [fingerprints, setFingerprints] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showKeytoolGuide, setShowKeytoolGuide] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const airbrdigeHost = appName ? `${appName}.airbridge.io` : '[your_app_name].airbridge.io';
  const keytoolCommand = 'keytool -list -v -keystore YOUR_KEYSTORE.keystore';

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Android Deep Link Setup Complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 w-full max-w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Android</h2>
        <a
          href="https://help.airbridge.io/en/developers/android-sdk-v4"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <Code className="w-3.5 h-3.5" />
          Developer Guide
        </a>
      </div>

      {/* Warning Banner */}
      <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-medium">Important</span>
            <p className="mt-1">Production and development apps must have different Android URI schemes and sha256_cert_fingerprints to ensure proper user redirection.</p>
          </div>
        </div>
      </div>

      {/* Android URL Scheme Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium text-gray-900">Android URL Scheme</h3>
          <span className="text-red-500 text-xs">*</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Converts Airbridge deep links to scheme deep links based on the Android URI scheme. Required for App Links and URI scheme deep links.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={uriScheme}
            onChange={(e) => setUriScheme(e.target.value.toLowerCase().replace(/[^a-z0-9+.-]/g, ''))}
            placeholder="e.g., demo"
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="flex items-center px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-mono">://</span>
        </div>
        {uriScheme && (
          <p className="mt-2 text-xs text-green-600">
            Registered value: <code className="bg-green-50 px-1 rounded">{uriScheme}://</code>
          </p>
        )}
      </div>

      {/* Package Name Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium text-gray-900">Package Name</h3>
        </div>
        <div className="text-xs text-gray-500 mb-3 space-y-1">
          <p>Identifies the Android app. Required for App Links and URI scheme deep links.</p>
          <p className="text-gray-400">Example: com.your.packagename</p>
        </div>
        {packageName && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center justify-between">
              <code className="text-sm text-green-900 font-medium">{packageName}</code>
              <button
                onClick={() => handleCopy(packageName, 'package')}
                className="p-1.5 hover:bg-green-100 rounded transition-colors"
              >
                {copySuccess === 'package' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-green-600" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SHA256 Fingerprints Section */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">sha256_cert_fingerprints</h3>
            <span className="text-red-500 text-xs">*</span>
          </div>
          <a
            href="https://help.airbridge.io/en/developers/android-sdk-v4"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <Code className="w-3 h-3" />
            Developer Guide
          </a>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Used to configure App Links domain. You can enter multiple values separated by commas (,).
        </p>

        {/* Keytool Guide Toggle */}
        <button
          onClick={() => setShowKeytoolGuide(!showKeytoolGuide)}
          className="w-full mb-3 flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left"
        >
          <span className="text-xs font-medium text-gray-700">How to find SHA256 value</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showKeytoolGuide ? 'rotate-180' : ''}`} />
        </button>

        {showKeytoolGuide && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <p className="text-xs text-gray-600">Run the following command on your release keystore file:</p>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                <code>{keytoolCommand}</code>
              </pre>
              <button
                onClick={() => handleCopy(keytoolCommand, 'keytool')}
                className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                {copySuccess === 'keytool' ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600">Find the SHA256 value from the result:</p>
            <pre className="bg-gray-100 p-3 rounded-lg text-xs text-gray-700 overflow-x-auto">
{`Certificate fingerprints:
    MD5:  4C:65:04:52:F0:3F:F8:65:08:D3:71:86:FC:EF:C3:49
    SHA1: C8:BF:B7:B8:94:EA:5D:9D:38:59:FE:99:63:ED:47:B2:D9:5A:4E:CC
    SHA256: B5:EF:4D:F9:DC:95:E6:9B:F3:9A:5E:E9:D6:E0:D8:F6:7B:AB:79:C8:78:67:34:D9:A7:01:AB:6A:86:01:0E:99`}
            </pre>
            <p className="text-xs text-gray-500">The SHA256 value is the sha256_cert_fingerprints.</p>
          </div>
        )}

        <textarea
          value={fingerprints}
          onChange={(e) => setFingerprints(e.target.value)}
          placeholder="B5:EF:4D:F9:DC:95:E6:9B:F3:9A:5E:E9:D6:E0:D8:F6:7B:AB:79:C8:78:67:34:D9:A7:01:AB:6A:86:01:0E:99"
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
        />
      </div>

      {/* SDK Configuration Info */}
      <div className="mb-5 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Android SDK Configuration Info</h3>
        <p className="text-xs text-gray-500 mb-3">
          Use the following value as the host in the intent filter when adding URI mapping to AndroidManifest.xml.
        </p>
        <button
          onClick={() => handleCopy(airbrdigeHost, 'host')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group"
        >
          <code className="text-sm text-gray-700 font-medium">{airbrdigeHost}</code>
          {copySuccess === 'host' ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          )}
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => onSubmit({
          uriScheme: uriScheme + '://',
          sha256Fingerprints: fingerprints.split(',').map(f => f.trim()).filter(Boolean)
        })}
        disabled={!uriScheme || !fingerprints}
        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          uriScheme && fingerprints
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Save Settings
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Deep Link Auto-Configuration Component
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
          setTimeout(() => onComplete(), 600);
        }
      }, totalDelay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [onComplete, isCompleted]);

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">
            {platform === 'ios' ? 'iOS' : 'Android'} Deep Link Setup Complete
          </span>
        </div>
      </div>
    );
  }

  const configSteps = [
    { label: 'Validating deep link info...', icon: '🔍' },
    { label: 'Registering URI Scheme...', icon: '🔗' },
    { label: platform === 'ios' ? 'Configuring Universal Links...' : 'Configuring App Links...', icon: '⚙️' },
    { label: 'Setup complete!', icon: '✅' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4 min-w-[280px] max-w-full w-full">
      <div className="text-sm font-medium text-gray-900 mb-4">
        {platform === 'ios' ? '🍎' : '🤖'} {platform === 'ios' ? 'iOS' : 'Android'} Deep Link Auto-Configuration
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

  // ==================== iOS Setup Steps ====================
  const iosHandleDeeplinkCode = `import Airbridge
...
/** when app is opened with deeplink */

// track deeplink
Airbridge.trackDeeplink(url: url)
// handle deeplink
var isAirbridgeDeeplink = Airbridge.handleDeeplink(url: url) { url in
    // when app is opened with airbridge deeplink
    // show proper content using url (YOUR_SCHEME://...)
    handleAirbridgeDeeplink(url: url)
}
if isAirbridgeDeeplink { return }
// when app is opened with other deeplink
// use existing logic as it is`;

  const iosSceneDelegateCode = `import UIKit
import Airbridge

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    // when app is opened with airbridge deeplink
    func handleAirbridgeDeeplink(url: URL) {
        // show proper content using url (YOUR_SCHEME://...)
    }

    // when terminated app is opened with scheme deeplink or universal links
    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        Airbridge.trackDeeplink(connectionOptions: connectionOptions)
        var isAirbridgeDeeplink = Airbridge.handleDeeplink(connectionOptions: connectionOptions) { url in
            handleAirbridgeDeeplink(url: url)
        }
        if isAirbridgeDeeplink { return }
    }

    // when backgrounded app is opened with scheme deeplink
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        Airbridge.trackDeeplink(openURLContexts: openURLContexts)
        var isAirbridgeDeeplink = Airbridge.handleDeeplink(openURLContexts: openURLContexts) { url in
            handleAirbridgeDeeplink(url: url)
        }
        if isAirbridgeDeeplink { return }
    }

    // when backgrounded app is opened with universal links
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        Airbridge.trackDeeplink(userActivity: userActivity)
        var isAirbridgeDeeplink = Airbridge.handleDeeplink(userActivity: userActivity) { url in
            handleAirbridgeDeeplink(url: url)
        }
        if isAirbridgeDeeplink { return }
    }
}`;

  const iosDeferredDeeplinkCode = `let isFirstCalled = Airbridge.handleDeferredDeeplink { uri in
    // when handleDeferredDeeplink is called firstly after install
    if let uri = uri {
        // show proper content using uri (YOUR_SCHEME://...)
    }
}`;

  const iosSteps = [
    {
      id: 'step1',
      title: 'Step 1: Configure URL Types (Scheme Deep Link)',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Navigate to the following path in Xcode:
          </p>
          <div className="p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
            [YOUR_PROJECT] → [Info] → [URL Types]
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
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              ⚠️ Enter without the :// suffix
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step2',
      title: 'Step 2: Configure Associated Domains (Universal Links)',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Navigate to the following path in Xcode:
          </p>
          <div className="p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
            [YOUR_PROJECT] → [Signing & Capabilities]
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
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 If using Password AutoFill, add webcredentials domains to prevent passwords showing airbridge.io domain.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step3',
      title: 'Step 3: Handle Deep Link in App (SceneDelegate)',
      content: (
        <div className="space-y-3">
          {/* Tracking Link Structure Explanation */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-2">How Airbridge Tracking Links Work</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>When a user clicks your tracking link (e.g., https://{appName}.abr.ge/campaign):</p>
              <div className="pl-2 border-l-2 border-blue-300 ml-1 mt-2 space-y-1">
                <p>1. Airbridge detects if your app is installed</p>
                <p>2. <strong>App installed:</strong> Opens via Universal Links / App Links</p>
                <p>3. <strong>Not installed:</strong> Redirects to App Store (Deferred Deep Link)</p>
                <p>4. <strong>Final callback:</strong> <code className="px-1 py-0.5 bg-blue-100 rounded">{schemeWithoutProtocol}://path?params</code></p>
              </div>
              <p className="mt-2 font-medium">You only need to handle the scheme deeplink in your code!</p>
            </div>
          </div>

          {/* Your Responsibility Warning */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-1">Your Responsibility</p>
            <p className="text-xs text-amber-700">
              The <code className="px-1 py-0.5 bg-amber-100 rounded">handleDeeplink</code> callback provides your scheme deeplink (e.g., {schemeWithoutProtocol}://product?id=123).
              <strong> You must implement the screen navigation logic yourself:</strong>
            </p>
            <ul className="text-xs text-amber-600 mt-1 space-y-0.5 list-disc list-inside">
              <li>Parse the deeplink path and parameters</li>
              <li>Navigate to the appropriate screen in your app</li>
              <li>Handle edge cases (invalid paths, missing params)</li>
            </ul>
          </div>

          <p className="text-xs text-gray-600">
            Call <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">trackDeeplink</code> and <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">handleDeeplink</code> to collect events and route users.
          </p>
          <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg mb-2">
            <p className="text-xs text-purple-700 font-medium mb-1">Which class to use?</p>
            <ul className="text-xs text-purple-600 space-y-0.5">
              <li>• SceneDelegate + AppDelegate → Use <strong>SceneDelegate</strong></li>
              <li>• AppDelegate only → Use <strong>AppDelegate</strong></li>
              <li>• SwiftUI App → Use <strong>App</strong> struct</li>
            </ul>
          </div>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-[10px] text-green-400 overflow-x-auto max-h-64 overflow-y-auto">
              {iosSceneDelegateCode}
            </pre>
            <button
              onClick={() => handleCopy(iosSceneDelegateCode, 'scenedelegate')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'scenedelegate' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Callback scenarios:</strong>
            </p>
            <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
              <li>• App terminated + URL Scheme/Universal Links → <code>scene:willConnectTo:options:</code></li>
              <li>• App backgrounded + URL Scheme → <code>scene:openURLContexts:</code></li>
              <li>• App backgrounded + Universal Links → <code>scene:continue:</code></li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'step4',
      title: 'Step 4: Deferred Deep Link Setup',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            For users clicking tracking links before app installation, use <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">handleDeferredDeeplink</code> to route them after install.
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {iosDeferredDeeplinkCode}
            </pre>
            <button
              onClick={() => handleCopy(iosDeferredDeeplinkCode, 'deferredios')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'deferredios' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              ⚠️ If app is opened with a regular deep link, deferred deep link returns null to avoid conflicts.
            </p>
          </div>
        </div>
      )
    }
  ];

  // ==================== Android Setup Steps ====================
  const androidActivityCode = `import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class DeeplinkActivity: AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }
}`;

  const androidManifestActivityCode = `<application
    ...>

    <activity android:name=".DeeplinkActivity" />

</application>`;

  const androidUriSchemeCode = `<intent-filter>
    <action android:name="android.intent.action.VIEW" />

    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data android:scheme="${schemeWithoutProtocol}" />
</intent-filter>`;

  const androidAppLinksCode1 = `<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />

    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data android:scheme="http" android:host="${appName}.abr.ge" />
    <data android:scheme="https" android:host="${appName}.abr.ge" />
</intent-filter>`;

  const androidAppLinksCode2 = `<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />

    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data android:scheme="http" android:host="${appName}.airbridge.io" />
    <data android:scheme="https" android:host="${appName}.airbridge.io" />
</intent-filter>`;

  const androidHandleDeeplinkCode = `// when activity is opened with scheme deeplink or app links
override fun onResume() {
    super.onResume()

    // handle airbridge deeplink
    val isAirbridgeDeeplink = Airbridge.handleDeeplink(intent) {
        // when app is opened with airbridge deeplink
        // show proper content using url (YOUR_SCHEME://...)
    }
    if (isAirbridgeDeeplink) return

    // when app is opened with other deeplink
    // use existing logic as it is
}

override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
}`;

  const androidDeferredDeeplinkCode = `val isFirstCalled = Airbridge.handleDeferredDeeplink { uri ->
    // when handleDeferredDeeplink is called firstly after install
    if (uri != null) {
        // show proper content using uri (YOUR_SCHEME://...)
    }
}`;

  const androidSteps = [
    {
      id: 'step1',
      title: 'Step 1: Create DeeplinkActivity',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Create a new Activity class to handle deep links:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {androidActivityCode}
            </pre>
            <button
              onClick={() => handleCopy(androidActivityCode, 'activity')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'activity' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Add the Activity to AndroidManifest.xml:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {androidManifestActivityCode}
            </pre>
            <button
              onClick={() => handleCopy(androidManifestActivityCode, 'manifest')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'manifest' ? (
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
            Add this intent-filter to DeeplinkActivity in AndroidManifest.xml:
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
              ⚠️ Use a <strong>separate</strong> intent-filter tag. Combining all data tags in one filter may cause deep links to fail.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step3',
      title: 'Step 3: Add App Links Intent Filters',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Add these two <strong>separate</strong> intent-filters for App Links:
          </p>
          <div className="text-xs text-gray-500 mb-1">Filter 1: abr.ge domain</div>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {androidAppLinksCode1}
            </pre>
            <button
              onClick={() => handleCopy(androidAppLinksCode1, 'applinks1')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'applinks1' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-1 mt-3">Filter 2: airbridge.io domain</div>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {androidAppLinksCode2}
            </pre>
            <button
              onClick={() => handleCopy(androidAppLinksCode2, 'applinks2')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'applinks2' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              ⚠️ These must be <strong>separate</strong> intent-filter tags with android:autoVerify="true"
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step4',
      title: 'Step 4: Handle Deep Link in Activity',
      content: (
        <div className="space-y-3">
          {/* Tracking Link Structure Explanation */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-2">How Airbridge Tracking Links Work</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>When a user clicks your tracking link (e.g., https://{appName}.abr.ge/campaign):</p>
              <div className="pl-2 border-l-2 border-blue-300 ml-1 mt-2 space-y-1">
                <p>1. Airbridge detects if your app is installed</p>
                <p>2. <strong>App installed:</strong> Opens via App Links</p>
                <p>3. <strong>Not installed:</strong> Redirects to Play Store (Deferred Deep Link)</p>
                <p>4. <strong>Final callback:</strong> <code className="px-1 py-0.5 bg-blue-100 rounded">{schemeWithoutProtocol}://path?params</code></p>
              </div>
              <p className="mt-2 font-medium">You only need to handle the scheme deeplink in your code!</p>
            </div>
          </div>

          {/* Your Responsibility Warning */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-1">Your Responsibility</p>
            <p className="text-xs text-amber-700">
              The <code className="px-1 py-0.5 bg-amber-100 rounded">handleDeeplink</code> callback provides your scheme deeplink (e.g., {schemeWithoutProtocol}://product?id=123).
              <strong> You must implement the screen navigation logic yourself:</strong>
            </p>
            <ul className="text-xs text-amber-600 mt-1 space-y-0.5 list-disc list-inside">
              <li>Parse the deeplink path and parameters</li>
              <li>Navigate to the appropriate screen in your app</li>
              <li>Handle edge cases (invalid paths, missing params)</li>
            </ul>
          </div>

          <p className="text-xs text-gray-600">
            In DeeplinkActivity, use <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">Airbridge.handleDeeplink</code> to convert Airbridge deep links to scheme deep links and route users:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {androidHandleDeeplinkCode}
            </pre>
            <button
              onClick={() => handleCopy(androidHandleDeeplinkCode, 'handledeeplink')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'handledeeplink' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              <code>handleDeeplink</code> returns true for Airbridge deep links and provides the converted scheme URL via callback.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step5',
      title: 'Step 5: Deferred Deep Link Setup',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            For users clicking tracking links before app installation, use <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">handleDeferredDeeplink</code>:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {androidDeferredDeeplinkCode}
            </pre>
            <button
              onClick={() => handleCopy(androidDeferredDeeplinkCode, 'deferred')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'deferred' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Return values:</strong>
            </p>
            <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
              <li>• Returns <code>true</code> on first call after install</li>
              <li>• Returns saved deep link URI or null if none</li>
              <li>• Returns <code>false</code> if SDK not initialized or already called</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const steps = platform === 'ios' ? iosSteps : androidSteps;

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Setup Guide</div>
        <div className="text-xs text-gray-400">Setup Complete</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
      <div className="text-sm font-medium text-gray-900 mb-4">
        {platform === 'ios' ? '🍎' : '🤖'} {platform === 'ios' ? 'iOS' : 'Android'} Deep Link Setup
        <span className="ml-2 text-xs font-normal text-gray-500">({framework})</span>
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
        <p className="text-xs text-blue-700">
          After registering deep link info on Airbridge dashboard, configure your app to handle deep links.
        </p>
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
              <div>☐ Associated Domains configured (airbridge.io & abr.ge)</div>
              <div>☐ trackDeeplink & handleDeeplink implemented in delegate</div>
              <div>☐ handleDeferredDeeplink called after SDK init</div>
            </>
          ) : (
            <>
              <div>☐ DeeplinkActivity created and added to manifest</div>
              <div>☐ URI Scheme intent-filter added (separate tag)</div>
              <div>☐ App Links intent-filters added (autoVerify="true")</div>
              <div>☐ handleDeeplink implemented in onResume</div>
              <div>☐ handleDeferredDeeplink called after SDK init</div>
            </>
          )}
        </div>
      </div>

      {/* Complete Button */}
      <button
        onClick={onComplete}
        className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
      >
        Deep Link Setup Complete
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Test Preparation</div>
        <div className="text-xs text-gray-400">Ready</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Deep Link Test</div>
        <div className="text-xs text-gray-400">Test Complete</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
      <div className="text-sm font-medium text-gray-900 mb-4">🧪 Deep Link Test</div>

      {/* Test Link Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="text-xs font-medium text-blue-800 mb-2">📱 Test Links</div>
        <code className="text-xs text-blue-700 break-all block bg-white p-2 rounded">
          https://{appName}.abr.ge/test
        </code>
        <p className="text-xs text-blue-600 mt-2">
          Click the link above on your device to test each scenario.
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
          <div className="text-xs font-medium text-amber-700 mb-2">⚠️ If Test Failed, Check:</div>
          <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
            <li>Dashboard information is accurate</li>
            <li>SDK configuration is correct</li>
            <li>App signing keystore is correct (Android)</li>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Deep Link Setup Complete</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
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

// Uninstall Tracking Setup Component
function UninstallTrackingSetup({
  platform,
  onComplete,
  onSkip,
  isCompleted = false
}: {
  platform: 'ios' | 'android';
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>('step1');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Uninstall Tracking Setup</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  const iosSteps = [
    {
      id: 'step1',
      title: 'Step 1: Enable Push Notifications',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Airbridge uses silent push notifications to track app uninstalls.
            Make sure Push Notifications capability is enabled in your Xcode project.
          </p>
          <div className="p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
            [YOUR_PROJECT] → [Signing & Capabilities] → [+ Capability] → Push Notifications
          </div>
        </div>
      )
    },
    {
      id: 'step2',
      title: 'Step 2: Upload APNs Key to Airbridge',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Generate an APNs authentication key from Apple Developer Console and upload it to Airbridge Dashboard.
          </p>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Go to Apple Developer → Certificates, IDs & Profiles → Keys</li>
            <li>Create a new key with Apple Push Notifications service (APNs) enabled</li>
            <li>Download the .p8 file</li>
            <li>Upload to Airbridge: Settings → Channels & Integrations → Uninstall Tracking</li>
          </ol>
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              You'll need your Team ID and Key ID from Apple Developer Console.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step3',
      title: 'Step 3: Register Device Token',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Call <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">registerPushToken</code> in your AppDelegate:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
{`func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
) {
    Airbridge.registerPushToken(deviceToken)
}`}
            </pre>
            <button
              onClick={() => handleCopy(`func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
) {
    Airbridge.registerPushToken(deviceToken)
}`, 'iostoken')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'iostoken' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      )
    }
  ];

  const androidSteps = [
    {
      id: 'step1',
      title: 'Step 1: Add Firebase to Your Project',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Airbridge uses Firebase Cloud Messaging (FCM) to track app uninstalls.
            Make sure Firebase is configured in your project.
          </p>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Go to Firebase Console and create/select a project</li>
            <li>Add your Android app to the Firebase project</li>
            <li>Download google-services.json and add to your app module</li>
            <li>Add Firebase dependencies to build.gradle</li>
          </ol>
        </div>
      )
    },
    {
      id: 'step2',
      title: 'Step 2: Upload FCM Server Key to Airbridge',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Get your FCM Server Key and upload it to Airbridge Dashboard.
          </p>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Go to Firebase Console → Project Settings → Cloud Messaging</li>
            <li>Copy the Server key (or generate a new one)</li>
            <li>Upload to Airbridge: Settings → Channels & Integrations → Uninstall Tracking</li>
          </ol>
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              Note: Firebase Cloud Messaging API (V1) is recommended over legacy Server Key.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step3',
      title: 'Step 3: Register FCM Token',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Call <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">registerPushToken</code> when you receive the FCM token:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
{`class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Airbridge.registerPushToken(token)
    }
}`}
            </pre>
            <button
              onClick={() => handleCopy(`class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Airbridge.registerPushToken(token)
    }
}`, 'androidtoken')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'androidtoken' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      )
    }
  ];

  const steps = platform === 'ios' ? iosSteps : androidSteps;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-blue-500" />
        <div className="text-base font-medium text-gray-900">
          Uninstall Tracking Setup ({platform === 'ios' ? 'iOS' : 'Android'})
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Track when users uninstall your app to understand user retention and measure campaign effectiveness.
      </p>

      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === step.id ? null : step.id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{step.title}</span>
              {expandedSection === step.id ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSection === step.id && (
              <div className="p-3 bg-white border-t border-gray-200">
                {step.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onComplete}
          className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Complete Setup
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
}

// Hybrid App Setup Component
function HybridAppSetup({
  platform,
  appName,
  onComplete,
  onSkip,
  isCompleted = false
}: {
  platform: 'ios' | 'android';
  appName: string;
  onComplete: () => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>('step1');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Hybrid App Setup</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  const webTokenCode = platform === 'ios'
    ? `// In your WKWebView setup
let webToken = Airbridge.getWebToken()

// Inject token into WebView
let script = "window.airbridge_web_token = '\\(webToken ?? "")';"
webView.evaluateJavaScript(script)`
    : `// In your WebView setup
val webToken = Airbridge.getWebToken()

// Inject token into WebView
webView.evaluateJavascript(
    "window.airbridge_web_token = '$webToken';",
    null
)`;

  const webSdkCode = `<!-- Add to your WebView pages -->
<script>
(function(a,i,r,b,d,e,g){
  a[d]=a[d]||function(){(a[d].q=a[d].q||[]).push(arguments)};
  e=i.createElement(r);g=i.getElementsByTagName(r)[0];
  e.async=1;e.src=b;g.parentNode.insertBefore(e,g);
})(window,document,'script','//static.airbridge.io/sdk/latest/airbridge.min.js','airbridge');

// Initialize with the web token from native app
airbridge('init', {
  app: '${appName || 'YOUR_APP_NAME'}',
  webToken: window.airbridge_web_token || 'YOUR_WEB_TOKEN'
});
</script>`;

  const steps = [
    {
      id: 'step1',
      title: 'Step 1: Understanding Hybrid App Tracking',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Hybrid apps have both native code and WebViews. To track events in WebViews:
          </p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li><strong>Native SDK:</strong> Handles app lifecycle events (install, open)</li>
            <li><strong>Web SDK:</strong> Tracks events within WebViews</li>
            <li><strong>Bridge:</strong> Connects native and web to maintain user identity</li>
          </ul>
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              Event tagging in WebViews should be done using the Web SDK.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'step2',
      title: 'Step 2: Get Web Token from Native SDK',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Get the web token from the native SDK and inject it into your WebView:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
              {webTokenCode}
            </pre>
            <button
              onClick={() => handleCopy(webTokenCode, 'webtoken')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'webtoken' ? (
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
      id: 'step3',
      title: 'Step 3: Add Web SDK to WebView Pages',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Add the Airbridge Web SDK to your WebView HTML pages:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-[10px] text-green-400 overflow-x-auto max-h-48">
              {webSdkCode}
            </pre>
            <button
              onClick={() => handleCopy(webSdkCode, 'websdk')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'websdk' ? (
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
      id: 'step4',
      title: 'Step 4: Track Events in WebView',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Use the Web SDK to track events in your WebView:
          </p>
          <div className="relative">
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-green-400 overflow-x-auto">
{`// Track custom event
airbridge('trackEvent', 'purchase', {
  semantics: {
    transactionID: 'order_123',
    products: [{
      productID: 'product_456',
      price: 29.99,
      quantity: 1
    }]
  }
});`}
            </pre>
            <button
              onClick={() => handleCopy(`airbridge('trackEvent', 'purchase', {
  semantics: {
    transactionID: 'order_123',
    products: [{
      productID: 'product_456',
      price: 29.99,
      quantity: 1
    }]
  }
});`, 'trackevent')}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {copySuccess === 'trackevent' ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-purple-500" />
        <div className="text-base font-medium text-gray-900">
          Hybrid App Setup ({platform === 'ios' ? 'iOS' : 'Android'})
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Set up event tracking for WebViews in your hybrid app.
      </p>

      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === step.id ? null : step.id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{step.title}</span>
              {expandedSection === step.id ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSection === step.id && (
              <div className="p-3 bg-white border-t border-gray-200">
                {step.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onComplete}
          className="flex-1 py-2.5 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
        >
          Complete Setup
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
}

// SDK Verify Component
function SDKVerify({ onConfirm, isCompleted = false }: { onConfirm: (status: string) => void; isCompleted?: boolean }) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">SDK Verification</div>
        <div className="text-xs text-gray-400">Verification completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">SDK Verification</div>

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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Select Ad Channels to Integrate (multiple selection allowed)</div>

      {channels.map(group => (
        <div key={group.category} className="mb-4 last:mb-0">
          <div className="text-xs text-gray-500 mb-2">{group.category}</div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Channel Integration</div>
        <div className="text-xs text-gray-400">Setup started</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Selected Channels for Integration</div>

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
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500">{channelNames[channel] || channel} Progress</div>
        <div className="text-xs text-gray-400 mt-1">Viewing progress</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
    { label: 'Opening Meta login...', icon: '🔐' },
    { label: 'Authenticating Facebook account...', icon: '👤' },
    { label: 'Connecting ad account...', icon: '📊' },
    { label: 'Permission setup complete!', icon: '✅' },
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Meta Channel Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
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
                Connect your Meta account to view ad performance data in Airbridge.
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
            Having trouble connecting?
          </button>
        </>
      )}

      {step === 'connecting' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Connecting Meta account...</div>
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
          <div className="text-sm font-medium text-gray-700">Meta Integration Complete!</div>
          <div className="text-xs text-gray-500 mt-1">Ad account connected successfully.</div>
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
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Meta Cost Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📘</span>
        <div className="text-sm font-medium text-gray-700">Meta Ads - Cost Integration</div>
        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Recommended</span>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            Cost Integration allows you to see your ad spend data directly in Airbridge reports.
            This helps you calculate ROI and ROAS for your Meta campaigns.
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Setup Steps:</div>
        <ol className="text-xs text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">1.</span>
            Go to Integrations → Cost Integration in Dashboard
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">2.</span>
            Find Meta Ads and click [Enable]
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">3.</span>
            Grant additional permissions for cost data access
          </li>
        </ol>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/cost"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open Cost Integration <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
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
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Meta SKAN Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📘</span>
        <div className="text-sm font-medium text-gray-700">Meta Ads - SKAN Integration</div>
        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">iOS Required</span>
      </div>

      <div className="bg-amber-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            SKAN (SKAdNetwork) Integration is required for iOS 14.5+ attribution.
            Without this, you won't be able to track conversions from iOS users who opt-out of tracking.
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Setup Steps:</div>
        <ol className="text-xs text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">1.</span>
            Go to Integrations → SKAN Integration in Dashboard
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">2.</span>
            Find Meta Ads and configure conversion values
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">3.</span>
            Enable SKAN postback forwarding to Meta
          </li>
        </ol>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/skan"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open SKAN Integration <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
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
    { label: 'Opening Google login...', icon: '🔐' },
    { label: 'Authenticating Google account...', icon: '👤' },
    { label: 'Connecting Google Ads account...', icon: '📊' },
    { label: 'Connection complete!', icon: '✅' },
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Google Channel Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
                Connect your Google Ads account to view campaign performance in Airbridge.
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
            Having trouble connecting?
          </button>
        </>
      )}

      {step === 'connecting' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Connecting Google account...</div>
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
          <div className="text-sm font-medium text-gray-700">Google Ads Integration Complete!</div>
          <div className="text-xs text-gray-500 mt-1">Ad account connected successfully.</div>
        </div>
      )}
    </div>
  );
}

// Google Cost Integration Component - Auto-progress version
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
    { label: 'Enabling Cost Integration...', icon: '💰' },
    { label: 'Connecting Google Ads cost data...', icon: '📊' },
    { label: 'Setup complete!', icon: '✅' },
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Google Cost Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔵</span>
        <div className="text-sm font-medium text-gray-700">Google Ads - Cost Integration</div>
        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Recommended</span>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            See your Google Ads spend data directly in Airbridge. Calculate ROI and compare performance across channels.
          </div>
        </div>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/cost"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open Cost Integration <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
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
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Google SKAN Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔵</span>
        <div className="text-sm font-medium text-gray-700">Google Ads - SKAN Integration</div>
        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">iOS Required</span>
      </div>

      <div className="bg-amber-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            Required for iOS 14.5+ attribution tracking with opt-out users.
          </div>
        </div>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/skan"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open SKAN Integration <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Apple Search Ads Version</div>
        <div className="text-xs text-gray-400">Version confirmed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
    { label: 'Connecting Apple Search Ads API...', icon: '🔐' },
    { label: 'Verifying API certificate...', icon: '📜' },
    { label: 'Syncing campaign data...', icon: '📊' },
    { label: 'Connection complete!', icon: '✅' },
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Apple Channel Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
                Connect your Apple Search Ads account to view App Store search ad performance in Airbridge.
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
            Having trouble connecting?
          </button>
        </>
      )}

      {step === 'connecting' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Connecting Apple Search Ads...</div>
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
          <div className="text-sm font-medium text-gray-700">Apple Search Ads Integration Complete!</div>
          <div className="text-xs text-gray-500 mt-1">Ad account connected successfully.</div>
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
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Apple Cost Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🍎</span>
        <div className="text-sm font-medium text-gray-700">Apple Search Ads - Cost Integration</div>
        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Recommended</span>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            View your Apple Search Ads spend in Airbridge for comprehensive ROI analysis.
          </div>
        </div>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/cost"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open Cost Integration <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
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
    { label: 'Opening TikTok login...', icon: '🔐' },
    { label: 'Authenticating TikTok account...', icon: '👤' },
    { label: 'Connecting ad account...', icon: '📊' },
    { label: 'Connection complete!', icon: '✅' },
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">TikTok Channel Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
                <p className="font-medium mb-1">Notes:</p>
                <ul className="space-y-1">
                  <li>• Pangle performance requires "Sub-Publisher" GroupBy in reports</li>
                  <li>• Data may be missing when EPC is enabled</li>
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
            Having trouble connecting?
          </button>
        </>
      )}

      {step === 'connecting' && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Connecting TikTok account...</div>
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
          <div className="text-sm font-medium text-gray-700">TikTok Integration Complete!</div>
          <div className="text-xs text-gray-500 mt-1">Ad account connected successfully.</div>
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
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">TikTok Cost Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎵</span>
        <div className="text-sm font-medium text-gray-700">TikTok For Business - Cost Integration</div>
        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded">Recommended</span>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            View your TikTok ad spend in Airbridge to analyze campaign ROI.
          </div>
        </div>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/cost"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open Cost Integration <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
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
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">TikTok SKAN Integration</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎵</span>
        <div className="text-sm font-medium text-gray-700">TikTok For Business - SKAN Integration</div>
        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">iOS Required</span>
      </div>

      <div className="bg-amber-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            Required for iOS 14.5+ attribution with TikTok campaigns.
          </div>
        </div>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/skan"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open SKAN Integration <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500">{channelNames[channel]} Setup</div>
        <div className="text-xs text-gray-400 mt-1">Completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Select Standard Events to Track</div>

      {standardEvents.map(group => (
        <div key={group.category} className="mb-4 last:mb-0">
          <div className="text-xs text-gray-500 mb-2">{group.category}</div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select
            value={newEventCategory}
            onChange={e => setNewEventCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm bg-white"
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
          <div className="text-xs text-gray-500 mb-2">Added Events ({events.length})</div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <div className="text-sm font-medium text-gray-700">Verify Event Tracking</div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Test your events:</div>
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
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 mb-3"
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Event Taxonomy Summary</div>
        <div className="text-xs text-gray-400">Setup completed</div>
      </div>
    );
  }

  const standardEvents = events.filter(e => e.isStandard);
  const customEvents = events.filter(e => !e.isStandard);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-purple-600">
        <CheckCircle2 className="w-6 h-6" />
        Event Taxonomy Complete!
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-2">Standard Events ({standardEvents.length})</div>
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
            <div className="text-xs text-gray-500 mb-2">Custom Events ({customEvents.length})</div>
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
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
      >
        Continue to Ad Channel Integration <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Dev Completion Summary Component
function DevCompletionSummary({ appName }: { appName: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
        <div className="text-sm font-medium text-gray-700 mb-3">What's Next?</div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-3 text-sm rounded-lg transition-colors bg-blue-500 text-white hover:bg-blue-600">
            View Test Events
          </button>
          <button className="flex-1 py-2 px-3 text-sm rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200">
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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
        <div className="text-sm font-medium text-gray-700 mb-3">Next Steps</div>
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Options</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
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

// Main ChatInterface Component
export function ChatInterface({ userAnswers }: ChatInterfaceProps) {
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

  // Category collapse state for sidebar (per app)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, Set<string>>>({});

  const toggleCategoryCollapse = (appId: string, category: string) => {
    setCollapsedCategories(prev => {
      const appCategories = prev[appId] || new Set();
      const newCategories = new Set(appCategories);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return { ...prev, [appId]: newCategories };
    });
  };

  const isCategoryCollapsed = (appId: string, category: string) => {
    return collapsedCategories[appId]?.has(category) || false;
  };

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
    plan: '' as 'growth' | 'deeplink' | '', // Plan type: Growth Plan or Deep Link Plan
    role: '' as 'marketer' | 'developer' | '', // User role for customized guidance
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
      content: [{ type: 'text', text: '👋 Hello! This is the Airbridge Q&A bot.\nAsk me anything about SDK installation, deep links, attribution, and more.' }],
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

    // Show timezone/currency confirmation (IP-based recommendation)
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✨ Your app **"${appName}"** is almost ready!\n\n🌍 Let me confirm your regional settings:` },
        { type: 'timezone-currency-confirm', timezone: 'Asia/Seoul (KST, UTC+9)', currency: 'KRW (Korean Won)' },
      ]);
    }, 300);
  };

  // Platform multi-select handler (Production)
  const handlePlatformMultiSelect = (platforms: string[]) => {
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

    // Generate mock tokens
    const generateToken = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const tokens: AppTokens = {
      appSdkToken: generateToken(),
      webSdkToken: generateToken(),
      apiToken: generateToken(),
    };

    const newAppId = Date.now().toString();
    const newApp: RegisteredApp = {
      id: newAppId,
      appInfo: setupState.appInfo,
      platforms: setupState.environment === 'dev' ? ['dev'] : setupState.platforms,
      environment: setupState.environment as 'dev' | 'production',
      steps: setupState.environment === 'dev' ? createDevAppSteps(setupState.platforms) : createAppSteps(setupState.platforms),
      currentPhase: 1, // Stay in Phase 1 until role is confirmed
      framework: '',
      channels: [],
      isExpanded: true,
      messages: [...messages], // Save current messages to the app
      tokens, // Save tokens for later use
    };

    setRegisteredApps(prev => [
      ...prev.map(app => ({ ...app, isExpanded: false })),
      newApp
    ]);
    setCurrentAppId(newAppId);
    setIsAddingApp(false);
    setCurrentPhase(1);

    // Show role capability check instead of token display
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `Your app **"${setupState.appInfo.appName}"** has been registered successfully!\n\nBefore we proceed, let me understand your role to provide the right guidance.` },
        { type: 'role-capability-check' },
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
        { type: 'text', text: `✅ Great! I've found your app **"${app.name}"**.\n\n📝 Now, please register your app on the Airbridge dashboard:\n\n1️⃣ Click the button below to open the dashboard\n2️⃣ Click **[Add Your App]**\n3️⃣ The app information has been pre-filled for you` },
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
        { type: 'text', text: '👍 No problem!\n\nYou can **manually enter** your app information.\n\nPlease fill in the details below:' },
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
        { type: 'text', text: '✨ Perfect!\n\n📝 Now, please register your app on the Airbridge dashboard:\n\n1️⃣ Click the button below to open the dashboard\n2️⃣ Click **[Add Your App]**\n3️⃣ Enter the information below\n\nLet me know when you\'re done!' },
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

    // Generate mock tokens
    const generateToken = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const tokens: AppTokens = {
      appSdkToken: generateToken(),
      webSdkToken: generateToken(),
      apiToken: generateToken(),
    };

    // Create new registered app
    const newAppId = Date.now().toString();
    const newApp: RegisteredApp = {
      id: newAppId,
      appInfo: setupState.appInfo,
      platforms: setupState.platforms,
      environment: setupState.environment as 'dev' | 'production',
      steps: setupState.environment === 'dev' ? createDevAppSteps(setupState.platforms) : createAppSteps(setupState.platforms),
      currentPhase: 1, // Stay in Phase 1 until role is confirmed
      framework: '',
      channels: [],
      isExpanded: true,
      messages: [...messages], // Save current messages to the app
      tokens, // Save tokens for later use
    };

    // Collapse other apps and add new one
    setRegisteredApps(prev => [
      ...prev.map(app => ({ ...app, isExpanded: false })),
      newApp
    ]);
    setCurrentAppId(newAppId);
    setIsAddingApp(false);
    setCurrentPhase(1);

    // Show role capability check instead of sdk-install-choice
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `Your app **"${setupState.appInfo.appName}"** has been registered successfully!\n\nBefore we proceed, let me understand your role to provide the right guidance.` },
        { type: 'role-capability-check' },
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

    // Move to SDK initialization
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '✅ **Web SDK installed!**\n\nNow let\'s continue with the SDK initialization for your other platforms.' },
      ]);
      updateAppStepStatus(app.id, 'sdk-init', 'in_progress');
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

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '✅ **Web SDK Installation Complete!**\n\nNow let\'s proceed with SDK setup for other platforms.' },
      ]);
      updateAppStepStatus(app.id, 'sdk-init', 'in_progress');
    }, 300);
  };

  // Web SDK User Identity Skip handler
  const handleWebSdkUserIdentitySkip = () => {
    const app = currentApp;
    if (!app) return;

    addUserMessage('Skipped user identity setup');
    updateAppStepStatus(app.id, 'web-sdk-install', 'completed');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '✅ **Web SDK Installation Complete!**\n\nNow let\'s proceed with SDK setup for other platforms.' },
      ]);
      updateAppStepStatus(app.id, 'sdk-init', 'in_progress');
    }, 300);
  };

  // Framework select handler
  const handleFrameworkSelect = (framework: string) => {
    setSetupState(prev => ({ ...prev, framework }));
    if (currentAppId) {
      setRegisteredApps(prev => prev.map(app =>
        app.id === currentAppId ? { ...app, framework } : app
      ));
    }
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
      updateAppStepStatus(currentAppId, 'sdk-install', 'completed');

      // Check if web platform is selected - if so, go to web-sdk-install first
      const app = registeredApps.find(a => a.id === currentAppId);
      if (app?.platforms.includes('web')) {
        updateAppStepStatus(currentAppId, 'web-sdk-install', 'in_progress');
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
        return;
      }

      updateAppStepStatus(currentAppId, 'sdk-init', 'in_progress');
    }

    if (framework === 'react-native') {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '⚛️ You\'re using **React Native**!\n\nFollow the steps below to install and initialize the SDK.\n💡 I\'ve already filled in the App Name and App Token for you!' },
          { type: 'react-native-sdk-install', appName: setupState.appInfo?.appName?.toLowerCase().replace(/\s/g, '') || 'myapp', appToken: 'abc123token' },
        ]);
      }, 300);
    } else {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `📦 Please check the **${frameworkLabels[framework]}** SDK installation guide:` },
          { type: 'sdk-init-code', appName: setupState.appInfo?.appName?.toLowerCase().replace(/\s/g, '') || 'myapp', appToken: 'abc123token' },
        ]);
      }, 300);
    }
  };

  // SDK init confirm handler
  const handleSDKInitConfirm = (status: string) => {
    addUserMessage(status === 'completed' ? 'Done!' : 'Need help with App Token');

    if (status === 'completed') {
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
    } else {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '🔍 You can find **App Token** in:\n\n**Airbridge Dashboard → Settings → Tokens**\n\nWould you like to open the dashboard to check?' },
          { type: 'single-select', options: [
            { label: 'Found it!', value: 'found' },
            { label: 'Still can\'t find it', value: 'still-lost' },
          ]},
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
        { type: 'text', text: '📋 iOS information has been saved!\n\nNow please complete the setup in the Airbridge dashboard.' },
        { type: 'deeplink-dashboard-guide', platform: 'ios', data: { uriScheme: data.uriScheme, appId: data.appId } },
      ]);
    }, 300);
  };

  // Deeplink Android submit handler
  const handleDeeplinkAndroidSubmit = (data: { uriScheme: string; sha256Fingerprints: string[] }) => {
    setDeeplinkState(prev => ({ ...prev, androidData: data, currentPlatform: 'android' }));
    addUserMessage(`Android setup: ${data.uriScheme}`);

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '📋 Android information has been saved!\n\nNow please complete the setup in the Airbridge dashboard.' },
        { type: 'deeplink-dashboard-guide', platform: 'android', data: { uriScheme: data.uriScheme, sha256Fingerprints: data.sha256Fingerprints } },
      ]);
    }, 300);
  };

  // Deeplink Dashboard complete handler
  const handleDeeplinkDashboardComplete = (platform: 'ios' | 'android') => {
    addUserMessage(`${platform === 'ios' ? 'iOS' : 'Android'} dashboard setup complete`);

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
        { type: 'text', text: '🧪 Starting deep link test.\n\nClick the Test button in the dashboard and test each scenario.' },
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
    addUserMessage('Continue with channel integration');

    if (currentAppId) {
      updateAppStepStatus(currentAppId, 'deeplink', 'completed');
      updateAppStepStatus(currentAppId, 'sdk-test', 'in_progress');
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '🧪 Now let\'s **test** if the SDK integration is working properly.' },
        { type: 'sdk-test' },
      ]);
    }, 300);
  };

  // Token display continue handler - proceeds directly to SDK install method select (role already confirmed)
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
        { type: 'text', text: `Now let's set up the SDK. Choose your preferred installation method:` },
        { type: 'sdk-install-method-select' },
      ]);
    }, 300);
  };

  // Role capability check handler - determines if user can install SDK
  const handleRoleCapabilityCheck = (canInstall: boolean) => {
    const app = registeredApps.find(a => a.id === currentAppId);
    const appName = app?.appInfo.appName || setupState.appInfo?.appName || 'Your App';

    if (canInstall) {
      // Developer path: show tokens first, then SDK install options
      addUserMessage("I'm a developer - I'll install the SDK myself");

      // Get tokens from registered app
      const tokens = app?.tokens || {
        appSdkToken: 'token_not_found',
        webSdkToken: 'token_not_found',
        apiToken: 'token_not_found',
      };

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `Great! Here are your API tokens. You'll need these for SDK integration.` },
          { type: 'token-display', tokens },
        ]);
      }, 300);
    } else {
      // Marketer path: show SDK requires developer options
      addUserMessage("I'm not a developer - someone else will handle SDK");
      setTimeout(() => {
        addBotMessage([
          { type: 'sdk-requires-developer', appName },
        ]);
      }, 300);
    }
  };

  // SDK Requires Developer handler - handles user's choice when SDK installation requires developer
  const handleSdkRequiresDeveloper = (choice: 'create-tracking-link' | 'explore-dashboard' | 'invite-developer' | 'self-install') => {
    const app = registeredApps.find(a => a.id === currentAppId);
    const appName = app?.appInfo.appName || setupState.appInfo?.appName || 'Your App';

    switch (choice) {
      case 'create-tracking-link':
        addUserMessage("Create a tracking link");
        if (currentAppId) {
          updateAppStepStatus(currentAppId, 'tracking-link', 'in_progress');
        }
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `**Create Your First Tracking Link**\n\nTracking links help you measure campaign performance. You can create these now while your developer works on the SDK.\n\nLet's create a tracking link for **${appName}**.` },
            { type: 'tracking-link-form', channel: 'organic' },
          ]);
        }, 300);
        break;

      case 'explore-dashboard':
        addUserMessage("Explore the dashboard");
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `**Explore Airbridge Dashboard**\n\nTake a look at what Airbridge can do! You can explore our demo app to see sample reports and features.` },
          ]);
          // Open dashboard in new tab (demo app)
          window.open('https://dashboard.airbridge.io/app/demokr', '_blank');
        }, 300);
        break;

      case 'invite-developer':
        addUserMessage("Invite developer(s)");
        setTimeout(() => {
          addBotMessage([
            { type: 'developer-email-invite', appName },
          ]);
        }, 300);
        break;

      case 'self-install':
        addUserMessage("I can do it myself");
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `Great! Let's get you set up with the Airbridge SDK.\n\nWhich SDK would you like to install?` },
            { type: 'sdk-type-choice' },
          ]);
        }, 300);
        break;
    }
  };

  // SDK Type Choice handler - handles user's choice between App SDK and Web SDK
  const handleSdkTypeChoice = (type: 'app' | 'web') => {
    const app = registeredApps.find(a => a.id === currentAppId);
    const appName = app?.appInfo.appName || setupState.appInfo?.appName || 'myapp';
    const webToken = app?.tokens?.webSdkToken || 'YOUR_WEB_SDK_TOKEN';
    const appSdkToken = app?.tokens?.appSdkToken || 'YOUR_APP_SDK_TOKEN';

    if (type === 'web') {
      addUserMessage("Web SDK");
      if (currentAppId) {
        updateAppStepStatus(currentAppId, 'sdk-integration', 'in_progress');
      }
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `**Web SDK Installation**\n\nLet's install the Airbridge Web SDK for **${appName}**.` },
          { type: 'web-sdk-install', appName, webToken },
        ]);
      }, 300);
    } else {
      addUserMessage("App SDK");
      if (currentAppId) {
        updateAppStepStatus(currentAppId, 'sdk-integration', 'in_progress');
      }
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `**App SDK Installation**\n\nLet's install the Airbridge SDK for **${appName}**.\n\nChoose your platform and framework to get started:` },
          { type: 'framework-select' },
        ]);
      }, 300);
    }
  };

  // Developer Email Invite handler - after emails are sent, show options again
  const handleDeveloperEmailInvite = (emails: string[]) => {
    const app = registeredApps.find(a => a.id === currentAppId);
    const appName = app?.appInfo.appName || setupState.appInfo?.appName || 'Your App';

    addUserMessage(`Invited ${emails.length} developer${emails.length > 1 ? 's' : ''}`);
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✅ **Invitations Sent!**\n\nWe've sent SDK setup instructions to:\n${emails.map(e => `• ${e}`).join('\n')}\n\nThey'll receive an email with everything they need to get started.` },
      ]);
      // After a short delay, show the options again
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: `While waiting for your developer to complete the SDK setup, what would you like to do?` },
          { type: 'sdk-requires-developer', appName },
        ]);
      }, 500);
    }, 300);
  };

  // Developer Email Invite back handler - go back to SDK requires developer options
  const handleDeveloperEmailInviteBack = () => {
    const app = registeredApps.find(a => a.id === currentAppId);
    const appName = app?.appInfo.appName || setupState.appInfo?.appName || 'Your App';

    setTimeout(() => {
      addBotMessage([
        { type: 'sdk-requires-developer', appName },
      ]);
    }, 100);
  };

  // Marketer next steps handler - handles marketer's choice after role check
  const handleMarketerNextStep = (choice: 'invite-developer' | 'create-tracking-link' | 'explore-dashboard') => {
    const app = registeredApps.find(a => a.id === currentAppId);
    const appName = app?.appInfo.appName || setupState.appInfo?.appName || 'Your App';

    switch (choice) {
      case 'invite-developer':
        addUserMessage("Invite a developer");
        // Get tokens from registered app
        const tokens = app?.tokens || {
          appSdkToken: 'token_not_found',
          webSdkToken: 'token_not_found',
          apiToken: 'token_not_found',
        };
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `Here's everything your developer needs to get started with SDK integration:` },
            { type: 'token-display', tokens },
            {
              type: 'sdk-guide-share',
              appName: appName,
              platforms: app?.platforms || setupState.platforms || [],
              framework: app?.framework
            },
          ]);
        }, 300);
        break;

      case 'create-tracking-link':
        addUserMessage("Create a tracking link");
        // Update step status to show tracking link creation
        if (currentAppId) {
          updateAppStepStatus(currentAppId, 'tracking-link', 'in_progress');
        }
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `**Create Your First Tracking Link**\n\nTracking links help you measure campaign performance. You can create these now while your developer works on the SDK.\n\nLet's create a tracking link for **${appName}**.` },
            { type: 'tracking-link-create' },
          ]);
        }, 300);
        break;

      case 'explore-dashboard':
        // Fallback to invite developer if someone triggers this old option
        addUserMessage("Explore the dashboard");
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `The dashboard will be more useful once the SDK is installed. In the meantime, you can:` },
            { type: 'marketer-next-steps', appName },
          ]);
        }, 300);
        break;
    }
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

  // Plan Selection handlers
  const handlePlanSelect = (plan: 'growth' | 'deeplink') => {
    addUserMessage(plan === 'growth' ? 'Growth Plan' : 'Deep Link Plan');

    setSetupState(prev => ({ ...prev, plan }));

    setTimeout(() => {
      if (plan === 'growth') {
        addBotMessage([
          { type: 'text', text: 'Great choice! **Growth Plan** gives you the complete mobile measurement solution.\n\nNow, let\'s identify your role to customize the onboarding experience.' },
          { type: 'role-select' },
        ]);
      } else {
        addBotMessage([
          { type: 'text', text: 'You\'ve selected the **Deep Link Plan**. This gives you powerful deep linking capabilities for seamless user experiences.\n\nLet\'s continue with the setup.' },
          { type: 'environment-select' },
        ]);
      }
    }, 300);
  };

  const handlePlanUpgrade = () => {
    addBotMessage([
      { type: 'text', text: 'Contact our sales team for plan upgrade information.' },
    ]);
  };

  // Role Selection handlers
  const handleRoleSelect = (role: 'marketer' | 'developer') => {
    addUserMessage(role === 'marketer' ? 'Marketer' : 'Developer');

    setSetupState(prev => ({ ...prev, role }));

    setTimeout(() => {
      if (role === 'marketer') {
        addBotMessage([
          { type: 'text', text: 'As a **Marketer**, I\'ll guide you through dashboard setup and channel integration. SDK implementation instructions will be generated for your development team.' },
          { type: 'role-based-guide', role: 'marketer', context: 'Dashboard and channel setup' },
        ]);
      } else {
        addBotMessage([
          { type: 'text', text: 'As a **Developer**, I\'ll provide you with technical SDK documentation, code snippets, and debugging tools.' },
          { type: 'role-based-guide', role: 'developer', context: 'SDK integration guide' },
        ]);
      }
    }, 300);
  };

  const handleRoleGuideComplete = () => {
    addUserMessage('Continue');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Now let\'s set up your app environment.' },
        { type: 'environment-select' },
      ]);
    }, 300);
  };

  // Mode Explainer handlers
  const handleModeExplainerComplete = () => {
    addUserMessage('I understand, continue');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Now let\'s select your platforms.' },
        { type: 'platform-multi-select' },
      ]);
    }, 300);
  };

  // App Name Validation handlers
  const handleAppNameValidationSubmit = (name: string) => {
    addUserMessage(name);

    setSetupState(prev => ({
      ...prev,
      appInfo: { ...prev.appInfo!, appName: name }
    }));

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `App name **${name}** has been validated. Remember, this cannot be changed after registration.` },
        { type: 'immutable-warning', field: 'appName' },
      ]);
    }, 300);
  };

  // Registration Checklist handlers
  const handleRegistrationChecklistConfirm = () => {
    addUserMessage('Register App');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Your app has been registered successfully! Now let\'s set up the SDK.' },
        { type: 'sdk-install-method-select' },
      ]);
    }, 300);
  };

  // Immutable Warning handlers
  const handleImmutableWarningAcknowledge = () => {
    addUserMessage('I understand, continue');

    setTimeout(() => {
      // Continue with the flow based on context
      addBotMessage([
        { type: 'text', text: 'Great! Let\'s continue with the setup.' },
        { type: 'platform-multi-select' },
      ]);
    }, 300);
  };

  // Phase handlers
  const handlePhaseClick = (phaseId: number) => {
    // Navigate to specific phase
    console.log('Phase clicked:', phaseId);
  };

  const handlePhaseStart = () => {
    addUserMessage('Start');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Let\'s begin this phase.' },
      ]);
    }, 300);
  };

  // Validation handlers
  const handleValidationRunTest = () => {
    addBotMessage([
      { type: 'text', text: 'Running verification checks...' },
    ]);
  };

  const handleValidationItemClick = (itemId: string) => {
    console.log('Validation item clicked:', itemId);
  };

  // Realtime Log Guide handlers
  const handleRealtimeLogGuideContinue = () => {
    addUserMessage('Continue');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Now let\'s proceed with the next step.' },
      ]);
    }, 300);
  };

  // Test Scenario handlers
  const handleTestScenarioRun = (scenarioId: string) => {
    console.log('Running test scenario:', scenarioId);
  };

  const handleTestScenarioComplete = () => {
    addUserMessage('Continue');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'All tests passed! Your integration is complete.' },
        { type: 'onboarding-complete' },
      ]);
    }, 300);
  };

  // Error handlers
  const handleErrorRetry = () => {
    addUserMessage('Retry');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Let\'s try again...' },
      ]);
    }, 300);
  };

  const handleErrorSkip = () => {
    addUserMessage('Skip for now');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Skipped. You can come back to this later.' },
      ]);
    }, 300);
  };

  // Warning handlers
  const handleWarningDismiss = () => {
    // Simply dismiss the warning
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
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '✅ Great! Now add the **App Token** to your code and try again:' },
          { type: 'sdk-init-code', appName: setupState.appInfo?.appName?.toLowerCase().replace(/\s/g, '') || 'myapp', appToken: 'YOUR_APP_TOKEN' },
        ]);
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
          { type: 'text', text: 'Got it, I\'ve noted your question. Please let me know if you need more information!' },
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
    // Need at least 2 messages to go back (user + bot pair)
    if (messages.length < 2) return;

    // Find the last user message index
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    // Remove messages from lastUserIndex to the end
    setMessages(prev => prev.slice(0, lastUserIndex));

    // Reset setup state based on remaining messages
    // This is a simplified approach - in production, we'd track state more carefully
  };

  // Check if we can go back (only for onboarding, not chat rooms)
  const canGoBack = !currentChatId && messages.length >= 2 && messages.some(m => m.role === 'user');

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
            { type: 'text', text: `**SDK Installation** for **${app.appInfo.appName}**\n\nWhat's your role in this setup?` },
            { type: 'role-capability-check' },
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
            { type: 'sdk-init-code', appName: app.appInfo.appName.toLowerCase().replace(/\s/g, ''), appToken: 'abc123token' },
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

      case 'role-capability-check':
        return <RoleCapabilityCheck onSelect={handleRoleCapabilityCheck} isCompleted={isCompleted} />;

      case 'marketer-next-steps':
        return <MarketerNextSteps appName={content.appName} onSelect={handleMarketerNextStep} isCompleted={isCompleted} />;

      case 'sdk-requires-developer':
        return <SdkRequiresDeveloper appName={content.appName} onSelect={handleSdkRequiresDeveloper} isCompleted={isCompleted} />;

      case 'sdk-type-choice':
        return <SdkTypeChoice onSelect={handleSdkTypeChoice} isCompleted={isCompleted} />;

      case 'developer-email-invite':
        return <DeveloperEmailInvite appName={content.appName} onSend={handleDeveloperEmailInvite} onBack={handleDeveloperEmailInviteBack} isCompleted={isCompleted} />;

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

      case 'react-native-sdk-install':
        return <ReactNativeSdkInstall appName={content.appName} appToken={content.appToken} onConfirm={handleSDKInitConfirm} isCompleted={isCompleted} />;

      case 'react-native-sdk-config':
        return <ReactNativeSdkConfig onComplete={() => handleSDKInitConfirm('completed')} isCompleted={isCompleted} />;

      case 'ios-att-prompt-config':
        return <IosAttPromptConfig appName={content.appName} appToken={content.appToken} onComplete={() => handleSDKInitConfirm('completed')} isCompleted={isCompleted} />;

      case 'deeplink-choice':
        return <DeeplinkChoice onSelect={handleDeeplinkChoice} isCompleted={isCompleted} />;

      case 'deeplink-ios-input':
        return (
          <DeeplinkIosInput
            bundleId={content.bundleId}
            appName={setupState.appInfo?.appName?.toLowerCase().replace(/\s/g, '')}
            onSubmit={handleDeeplinkIosSubmit}
            isCompleted={isCompleted}
          />
        );

      case 'deeplink-android-input':
        return (
          <DeeplinkAndroidInput
            packageName={content.packageName}
            appName={setupState.appInfo?.appName?.toLowerCase().replace(/\s/g, '')}
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
        return <DevCompletionSummary appName={content.appName} />;

      // SDK Test
      case 'sdk-test':
        return <SdkTest onRunTest={handleSdkTestComplete} isCompleted={isCompleted} />;

      // Tracking Link
      case 'tracking-link-create':
        return <TrackingLinkForm channel={content.channel || 'organic'} onCreate={handleTrackingLinkCreate} isCompleted={isCompleted} />;

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
        return <OnboardingComplete appName={currentApp?.appInfo.appName || 'App'} onViewDashboard={handleViewDashboard} />;

      // Plan Selection
      case 'plan-select':
        return <PlanSelector onSelect={handlePlanSelect} isCompleted={isCompleted} />;

      case 'plan-feature-comparison':
        return <PlanFeatureComparison currentPlan={content.currentPlan} onUpgrade={handlePlanUpgrade} isCompleted={isCompleted} />;

      // Role-based flow
      case 'role-select':
        return <RoleSelector onSelect={handleRoleSelect} isCompleted={isCompleted} />;

      case 'role-based-guide':
        return <RoleBasedGuide role={content.role} context={content.context} onContinue={handleRoleGuideComplete} isCompleted={isCompleted} />;

      // Mode explanation
      case 'mode-explainer':
        return <ModeExplainer mode={content.mode} onContinue={handleModeExplainerComplete} isCompleted={isCompleted} />;

      // App registration validation
      case 'app-name-validation':
        return <AppNameValidation name={content.name} onSubmit={handleAppNameValidationSubmit} isCompleted={isCompleted} />;

      case 'registration-checklist':
        return <RegistrationChecklist items={content.items} onConfirm={handleRegistrationChecklistConfirm} isCompleted={isCompleted} />;

      case 'immutable-warning':
        return <ImmutableWarning field={content.field} value={setupState.appInfo?.appName || ''} onAcknowledge={handleImmutableWarningAcknowledge} isCompleted={isCompleted} />;

      // Onboarding phase guide
      case 'phase-overview':
        return (
          <PhaseOverview
            currentPhase={content.currentPhase}
            totalPhases={content.totalPhases}
            phases={[
              { id: 1, title: 'App Registration', status: content.currentPhase > 1 ? 'completed' : content.currentPhase === 1 ? 'in_progress' : 'pending' },
              { id: 2, title: 'SDK Setup', status: content.currentPhase > 2 ? 'completed' : content.currentPhase === 2 ? 'in_progress' : 'pending' },
              { id: 3, title: 'Event Taxonomy', status: content.currentPhase > 3 ? 'completed' : content.currentPhase === 3 ? 'in_progress' : 'pending' },
              { id: 4, title: 'Channel Integration', status: content.currentPhase > 4 ? 'completed' : content.currentPhase === 4 ? 'in_progress' : 'pending' },
              { id: 5, title: 'Verification', status: content.currentPhase > 5 ? 'completed' : content.currentPhase === 5 ? 'in_progress' : 'pending' },
            ]}
            onPhaseClick={handlePhaseClick}
            isCompleted={isCompleted}
          />
        );

      case 'phase-detail':
        return <PhaseDetail phase={content.phase} onStart={handlePhaseStart} isCompleted={isCompleted} />;

      // Validation and testing
      case 'validation-checklist':
        return (
          <ValidationChecklist
            category={content.category}
            items={content.items}
            onRunTest={handleValidationRunTest}
            onItemClick={handleValidationItemClick}
            isCompleted={isCompleted}
          />
        );

      case 'realtime-log-guide':
        return <RealtimeLogGuide appName={currentApp?.appInfo.appName || 'myapp'} onContinue={handleRealtimeLogGuideContinue} isCompleted={isCompleted} />;

      case 'test-scenario-guide':
        return <TestScenarioGuide scenarios={content.scenarios} onTest={handleTestScenarioRun} onComplete={handleTestScenarioComplete} isCompleted={isCompleted} />;

      // Error handling
      case 'error-recovery':
        return (
          <ErrorRecovery
            errorType={content.errorType}
            message={content.message}
            suggestions={content.suggestions}
            onRetry={handleErrorRetry}
            onSkip={handleErrorSkip}
            isCompleted={isCompleted}
          />
        );

      case 'setup-warning':
        return <SetupWarning warningType={content.warningType} title={content.title} message={content.message} onDismiss={handleWarningDismiss} isCompleted={isCompleted} />;

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

  // Main chat content - defined as JSX element to prevent remounting on state changes
  const chatContent = (
    <div className={`flex bg-white overflow-visible ${
      viewMode === 'fullscreen'
        ? 'h-screen w-screen'
        : 'h-[600px] rounded-xl shadow-2xl border border-gray-200 relative'
    }`} style={viewMode !== 'fullscreen' ? { height: '720px', maxHeight: '85vh' } : undefined}>
      {/* View Mode Controls - top right corner (fullscreen only, positioned in main area) */}
      {/* Sidebar Container */}
      <div className="flex-shrink-0 relative">
        {/* Sidebar */}
        <motion.div
          className={`bg-white border-r border-gray-200 flex flex-col overflow-hidden h-full ${
            isSidebarCollapsed ? 'p-3' : 'p-6'
          }`}
          animate={{
            width: isSidebarCollapsed ? 64 : (viewMode === 'fullscreen' ? 320 : 288),
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

        {/* Tab Buttons - Expanded */}
        {!isSidebarCollapsed && (
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSidebarTab('apps')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                sidebarTab === 'apps'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Apps
            </button>
            <button
              onClick={() => setSidebarTab('chats')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                sidebarTab === 'chats'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chats
            </button>
          </div>
        )}

        {/* Tab Icons - Collapsed */}
        {isSidebarCollapsed && (
          <div className="flex flex-col gap-2 mb-4">
            <button
              onClick={() => setSidebarTab('apps')}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                sidebarTab === 'apps'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              title="Apps"
            >
              <Smartphone className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarTab('chats')}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                sidebarTab === 'chats'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              title="Chats"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4">
          {/* MY APPS Section */}
          {sidebarTab === 'apps' && (
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
                          {(['sdk', 'deeplink', 'event-taxonomy', 'integration'] as const).map((category) => {
                            const categorySteps = app.steps.filter(s => s.category === category);
                            if (categorySteps.length === 0) return null;

                            const categoryLabels = {
                              'sdk': 'SDK',
                              'deeplink': 'Deep Link',
                              'event-taxonomy': 'Event Taxonomy',
                              'integration': 'Integration',
                            };

                            const categoryCompleted = categorySteps.every(s => s.status === 'completed');
                            const categoryInProgress = categorySteps.some(s => s.status === 'in_progress');

                            const isCollapsed = isCategoryCollapsed(app.id, category);
                            const completedCount = categorySteps.filter(s => s.status === 'completed').length;

                            return (
                              <div key={category} className="mb-3">
                                <button
                                  onClick={() => toggleCategoryCollapse(app.id, category)}
                                  className={`w-full text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between hover:opacity-80 transition-opacity ${
                                    categoryCompleted ? 'text-green-600' : categoryInProgress ? 'text-blue-600' : 'text-gray-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    {categoryCompleted && <CheckCircle2 className="w-3 h-3" />}
                                    {categoryLabels[category]}
                                    <span className="text-[9px] font-normal normal-case">
                                      ({completedCount}/{categorySteps.length})
                                    </span>
                                  </div>
                                  <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                </button>
                                <AnimatePresence initial={false}>
                                  {!isCollapsed && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="overflow-hidden"
                                    >
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
                                    </motion.div>
                                  )}
                                </AnimatePresence>
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
          )}

          {/* CHATS Section */}
          {sidebarTab === 'chats' && (
          <div>
            {/* New Chat Button */}
            {isSidebarCollapsed ? (
              <button
                onClick={handleNewChat}
                className="w-full mb-2 p-2 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center"
                title="New Chat"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNewChat}
                className="w-full mb-2 p-3 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                New Chat
              </button>
            )}

            {/* Chat Rooms */}
            <div className="space-y-2">
              {chatRooms.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full rounded-xl overflow-hidden border transition-colors ${isSidebarCollapsed ? 'p-2 flex justify-center' : 'p-3'} ${
                    currentChatId === chat.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  title={isSidebarCollapsed ? chat.title : undefined}
                >
                  {isSidebarCollapsed ? (
                    <MessageCircle className={`w-5 h-5 ${currentChatId === chat.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageCircle className={`w-4 h-4 flex-shrink-0 ${currentChatId === chat.id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-sm truncate text-left flex-1 ${currentChatId === chat.id ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>{chat.title}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          )}
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
                {currentChatRoom ? currentChatRoom.title : 'Onboarding Manager'}
              </h1>
            </div>
            {/* View Mode Controls */}
            <ViewModeControls compact />
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

  // Render based on view mode
  if (viewMode === 'minimized') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <AirbridgeBackground />
        <MinimizedButton />
      </div>
    );
  }

  if (viewMode === 'module') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <AirbridgeBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="z-50 overflow-hidden"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '720px',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 48px)'
          }}
        >
          {chatContent}
        </motion.div>
      </div>
    );
  }

  // Fullscreen mode
  return chatContent;
}
