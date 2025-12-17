// View mode types
export type ViewMode = 'fullscreen' | 'module' | 'minimized';

// App search result type
export type AppSearchResult = {
  id: string;
  name: string;
  developer: string;
  icon: string;
  bundleId?: string;
  packageName?: string;
  store: 'ios' | 'android';
};

// Platform info for production registration
export type PlatformInfo = {
  platform: 'ios' | 'android' | 'web';
  appName?: string;
  bundleId?: string;
  packageName?: string;
  webUrl?: string;
  storeUrl?: string;
};

// Deeplink Dashboard Data Types
export type DeeplinkDashboardData = {
  uriScheme: string;
  // iOS specific
  appId?: string;
  // Android specific
  sha256Fingerprints?: string[];
};

// Channel Integration Types
export type ChannelStep = {
  id: 'channel' | 'cost' | 'skan';
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  required: boolean;
};

export type ChannelIntegrationState = {
  channel: string;
  steps: ChannelStep[];
  currentStep: 'channel' | 'cost' | 'skan';
};

// Event Taxonomy Types
export type StandardEvent = {
  id: string;
  name: string;
  description: string;
  category: 'lifecycle' | 'engagement' | 'ecommerce';
  isAutomatic?: boolean;
};

export type EventProperty = {
  name: string;
  type: 'string' | 'number' | 'boolean';
  isSemantic: boolean;
};

export type EventConfig = {
  eventId: string;
  eventName: string;
  isStandard: boolean;
  properties: EventProperty[];
};

// GitHub Automation Types
export type GitHubRepo = {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
};

export type GitHubAutomationState = {
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
export type TrackingLink = {
  id: string;
  name: string;
  channel: string;
  url: string;
  shortUrl: string;
  createdAt: Date;
};

// Deeplink Test Types
export type DeeplinkTestScenario = {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
};

// Data Verification Types
export type DataVerifyMetrics = {
  eventsReceived: number;
  lastEventTime: Date | null;
  attributionVerified: boolean;
  deeplinkVerified: boolean;
};

export type CompletionData = {
  appName: string;
  platforms: string[];
  framework: string;
  channels: string[];
};

// Message type definitions
export type MessageContent =
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
  | { type: 'category-navigation' };

export type Message = {
  id: string;
  role: 'bot' | 'user';
  content: MessageContent[];
  timestamp: Date;
};

export type ChatRoom = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

export type OnboardingStep = {
  id: string;
  phase: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  category: 'sdk' | 'deeplink' | 'integration' | 'event-taxonomy';
};

export type AppInfo = {
  appName: string;
  storeUrl: string;
  bundleId: string;
  packageName: string;
  webUrl?: string;
  timezone?: string;
  currency?: string;
};

// Registered app with its own setup progress
export type RegisteredApp = {
  id: string;
  appInfo: AppInfo;
  platforms: string[];
  environment: 'dev' | 'production';
  steps: OnboardingStep[];
  currentPhase: number;
  framework: string;
  channels: string[];
  isExpanded: boolean;
  messages: Message[];
};

// Setup step type
export type SetupStep =
  | 'environment'
  | 'platforms'
  | 'app-registration'
  | 'timezone-currency'
  | 'framework'
  | 'sdk-install'
  | 'sdk-init'
  | 'deeplink'
  | 'event-taxonomy'
  | 'channel'
  | 'complete';

// Setup state type
export type SetupState = {
  step: SetupStep;
  selectedEnvironment: 'dev' | 'production' | null;
  selectedPlatforms: string[];
  appInfo: AppInfo;
  currentPlatformIndex: number;
  platformInfos: PlatformInfo[];
};

// Deeplink state type
export type DeeplinkState = {
  currentPlatformIndex: number;
  platforms: string[];
  iosData?: {
    bundleId: string;
    teamId: string;
    uriScheme: string;
  };
  androidData?: {
    packageName: string;
    sha256Fingerprints: string[];
    uriScheme: string;
  };
  dashboardCompleted: {
    ios: boolean;
    android: boolean;
  };
  sdkSetupCompleted: {
    ios: boolean;
    android: boolean;
  };
};

// Helper functions
export const createAppSteps = (platforms: string[] = []): OnboardingStep[] => {
  const steps: OnboardingStep[] = [
    { id: 'sdk-install', phase: 2, title: 'SDK Installation', description: 'Install SDK packages', status: 'pending', category: 'sdk' },
  ];

  if (platforms.includes('web')) {
    steps.push({ id: 'web-sdk-install', phase: 2, title: 'Web SDK Installation', description: 'Install Web SDK', status: 'pending', category: 'sdk' });
  }

  steps.push(
    { id: 'sdk-init', phase: 2, title: 'SDK Initialization', description: 'Add SDK code to your app', status: 'pending', category: 'sdk' },
    { id: 'sdk-test', phase: 2, title: 'SDK Test', description: 'Test SDK integration', status: 'pending', category: 'sdk' },
    { id: 'deeplink', phase: 2, title: 'Deep Link Setup', description: 'Configure deep links', status: 'pending', category: 'deeplink' },
    { id: 'tracking-link', phase: 4, title: 'Tracking Link', description: 'Create tracking links', status: 'pending', category: 'deeplink' },
    { id: 'deeplink-test', phase: 5, title: 'Deep Link Test', description: 'Test deep link functionality', status: 'pending', category: 'deeplink' },
    { id: 'event-taxonomy', phase: 3, title: 'Event Taxonomy', description: 'Define events to track', status: 'pending', category: 'event-taxonomy' },
    { id: 'channel-select', phase: 4, title: 'Channel Selection', description: 'Select ad platforms', status: 'pending', category: 'integration' },
    { id: 'channel-integration', phase: 4, title: 'Channel Integration', description: 'Connect to ad platforms', status: 'pending', category: 'integration' },
    { id: 'cost-integration', phase: 4, title: 'Cost Integration', description: 'Enable cost data import', status: 'pending', category: 'integration' },
    { id: 'skan-integration', phase: 4, title: 'SKAN Integration', description: 'iOS attribution setup', status: 'pending', category: 'integration' },
    { id: 'attribution-test', phase: 5, title: 'Attribution Test', description: 'Verify attribution setup', status: 'pending', category: 'integration' },
    { id: 'data-verify', phase: 5, title: 'Data Verification', description: 'Confirm data collection', status: 'pending', category: 'integration' },
  );

  return steps;
};

export const createDevAppSteps = (platforms: string[] = []): OnboardingStep[] => {
  const steps: OnboardingStep[] = [
    { id: 'sdk-install', phase: 2, title: 'SDK Installation', description: 'Install SDK packages', status: 'pending', category: 'sdk' },
  ];

  if (platforms.includes('web')) {
    steps.push({ id: 'web-sdk-install', phase: 2, title: 'Web SDK Installation', description: 'Install Web SDK', status: 'pending', category: 'sdk' });
  }

  steps.push(
    { id: 'sdk-init', phase: 2, title: 'SDK Initialization', description: 'Add SDK code to your app', status: 'pending', category: 'sdk' },
    { id: 'sdk-test', phase: 2, title: 'SDK Test', description: 'Test SDK integration', status: 'pending', category: 'sdk' },
    { id: 'deeplink', phase: 2, title: 'Deep Link Setup', description: 'Configure deep links', status: 'pending', category: 'deeplink' },
  );

  return steps;
};
