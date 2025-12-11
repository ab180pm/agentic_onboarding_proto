import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, CheckCircle2, Circle, Sparkles, Copy, Check, ExternalLink,
  Smartphone, Code, Tv, AlertCircle, ChevronRight, ChevronDown, ChevronLeft, Loader2, Plus, Lightbulb,
  Maximize2, Minimize2, MessageCircle, X, Share2, MessageSquare
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
  | { type: 'platform-select'; platforms: string[] }
  | { type: 'platform-multi-select' }
  | { type: 'app-name-input' }
  | { type: 'app-name-input-dev' }
  | { type: 'platform-registration'; platform: 'ios' | 'android' | 'web'; platformIndex: number; totalPlatforms: number }
  | { type: 'store-url-input'; platform: 'ios' | 'android' }
  | { type: 'web-url-input' }
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
  | { type: 'sdk-verify' }
  | { type: 'channel-select' }
  | { type: 'channel-integration'; channel: string; step: number }
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
  | { type: 'event-taxonomy-intro' }
  | { type: 'standard-event-select' }
  | { type: 'custom-event-input' }
  | { type: 'event-property-config'; eventName: string }
  | { type: 'event-verify' }
  | { type: 'event-taxonomy-summary'; events: EventConfig[] }
  | { type: 'completion-summary'; data: CompletionData }
  | { type: 'single-select'; options: { label: string; value: string; description?: string }[] }
  | { type: 'confirm-select'; options: { label: string; value: string }[] }
  | { type: 'token-display'; tokens: { appSdkToken: string; webSdkToken: string; apiToken: string } }
  | { type: 'dev-completion-summary'; appName: string }
  | { type: 'sdk-install-choice' }
  | { type: 'sdk-guide-share'; appName: string; platforms: string[]; framework?: string };

type Message = {
  id: string;
  role: 'bot' | 'user';
  content: MessageContent[];
  timestamp: Date;
};

type OnboardingStep = {
  id: string;
  phase: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
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
};

const createAppSteps = (): OnboardingStep[] => [
  // Phase 2: SDK Installation
  { id: 'sdk-install', phase: 2, title: 'SDK Installation', description: 'Install packages and initialize', status: 'pending' },
  { id: 'sdk-init', phase: 2, title: 'SDK Initialization', description: 'Add SDK code to your app', status: 'pending' },
  { id: 'deeplink', phase: 2, title: 'Deep Link Setup', description: 'Configure deep links (optional)', status: 'pending' },
  { id: 'sdk-verify', phase: 2, title: 'SDK Verification', description: 'Verify event reception', status: 'pending' },
  // Phase 3: Event Taxonomy
  { id: 'event-taxonomy', phase: 3, title: 'Event Taxonomy', description: 'Define events to track', status: 'pending' },
  // Phase 4: Ad Channel Integration
  { id: 'channel-select', phase: 4, title: 'Channel Selection', description: 'Select ad platforms', status: 'pending' },
  { id: 'channel-integration', phase: 4, title: 'Channel Integration', description: 'Connect to ad platforms', status: 'pending' },
  { id: 'cost-integration', phase: 4, title: 'Cost Integration', description: 'Enable cost data import', status: 'pending' },
  { id: 'skan-integration', phase: 4, title: 'SKAN Integration', description: 'iOS attribution setup', status: 'pending' },
];

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
            <div className="text-sm text-gray-500">Recommended for first-time setup. Test SDK integration quickly.</div>
          </div>
          <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Recommended</div>
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

// Platform Select Component - Single choice with large buttons
function PlatformSelect({ onSelect, isCompleted = false }: { onSelect: (platforms: string[]) => void; isCompleted?: boolean }) {
  const platforms = [
    { id: 'ios', label: 'iOS', description: 'iPhone & iPad apps', icon: <Smartphone className="w-8 h-8" /> },
    { id: 'android', label: 'Android', description: 'Google Play apps', icon: <Smartphone className="w-8 h-8" /> },
    { id: 'web', label: 'Web', description: 'Web applications', icon: <Tv className="w-8 h-8" /> },
  ];

  const handleSelect = (id: string) => {
    onSelect([id]);
  };

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Select Platform</div>
        <div className="text-xs text-gray-400">Selection completed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-2">Select Platform</div>
      <div className="text-xs text-gray-500 mb-4">
        Apps are registered one platform at a time. You can add more platforms later.
      </div>
      <div className="grid grid-cols-3 gap-3">
        {platforms.map(platform => (
          <button
            key={platform.id}
            onClick={() => handleSelect(platform.id)}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white transition-all hover:border-blue-500 hover:bg-blue-50 min-h-[120px]"
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-2 bg-gray-100 text-gray-700">
              {platform.icon}
            </div>
            <span className="font-semibold text-gray-900 text-sm">{platform.label}</span>
            <span className="text-[0.625rem] text-gray-400 mt-1">{platform.description}</span>
          </button>
        ))}
      </div>
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-2">
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

// Dashboard Action Component
function DashboardAction({
  appName, bundleId, packageName, onConfirm, isCompleted = false
}: {
  appName: string; bundleId: string; packageName: string; onConfirm: (status: string) => void; isCompleted?: boolean
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [detected, setDetected] = useState(false);

  // Simulate auto-detection of app registration
  useEffect(() => {
    if (isCompleted) return;
    const checkInterval = setInterval(() => {
      // In real implementation, this would call an API to check registration status
      // For demo, we simulate detection after 5 seconds
    }, 2000);

    const detectionTimer = setTimeout(() => {
      setChecking(false);
      setDetected(true);
      clearInterval(checkInterval);
      // Auto-proceed after detection
      setTimeout(() => {
        onConfirm('completed');
      }, 1500);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(detectionTimer);
    };
  }, [onConfirm, isCompleted]);

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Dashboard Action</div>
        <div className="text-xs text-gray-400">Action completed</div>
      </div>
    );
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <a
        href="https://dashboard.airbridge.io"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-lg font-medium transition-colors mb-4 bg-blue-500 text-white hover:bg-blue-600"
      >
        <ExternalLink className="w-4 h-4" />
        Open Airbridge Dashboard
      </a>

      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">Information to Copy</div>

        <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
          <div>
            <span className="text-xs text-gray-500">App Name</span>
            <div className="font-medium">{appName || '-'}</div>
          </div>
          {appName && <CopyButton text={appName} field="appName" />}
        </div>

        {bundleId && (
          <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
            <div>
              <span className="text-xs text-gray-500">Bundle ID</span>
              <div className="font-mono text-sm">{bundleId}</div>
            </div>
            <CopyButton text={bundleId} field="bundleId" />
          </div>
        )}

        {packageName && (
          <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
            <div>
              <span className="text-xs text-gray-500">Package Name</span>
              <div className="font-mono text-sm">{packageName}</div>
            </div>
            <CopyButton text={packageName} field="packageName" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        {checking && !detected && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for app registration...</span>
          </div>
        )}
        {detected && (
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
            <span>App registration detected! Proceeding to next step...</span>
          </div>
        )}
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
  const [step, setStep] = useState<'input' | 'connect' | 'done'>('input');

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
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Step 2: Connect with Facebook</div>
            <ol className="text-xs text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-medium">1.</span>
                Open Airbridge Dashboard and navigate to Integrations → Ad Channels
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-medium">2.</span>
                Find Meta Ads and click [Connect] button
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-medium">3.</span>
                Login with your Facebook account
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-medium">4.</span>
                Select your ad account and grant permissions
              </li>
            </ol>
          </div>

          <a
            href="https://dashboard.airbridge.io/integrations/channels"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
          >
            Open Airbridge Dashboard <ExternalLink className="w-4 h-4" />
          </a>

          <div className="flex gap-2">
            <button
              onClick={onComplete}
              className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
            >
              Done
            </button>
            <button
              onClick={() => onHelp('meta-permission')}
              className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              I need help
            </button>
          </div>
        </>
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

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Setup Steps:</div>
        <ol className="text-xs text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">1.</span>
            Open Airbridge Dashboard → Integrations → Ad Channels
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">2.</span>
            Find Google Ads and click [Connect]
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">3.</span>
            Sign in with your Google account
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">4.</span>
            Select your Google Ads account
          </li>
        </ol>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/channels"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open Airbridge Dashboard <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={() => onHelp('google-permission')}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          I need help
        </button>
      </div>
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

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Setup Steps:</div>
        <ol className="text-xs text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">1.</span>
            Open Airbridge Dashboard → Integrations → Ad Channels
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">2.</span>
            Find Apple Search Ads and click [Connect]
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">3.</span>
            Upload your Apple Search Ads API certificate
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">4.</span>
            Enter your Org ID and select campaigns
          </li>
        </ol>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/channels"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open Airbridge Dashboard <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={() => onHelp('apple-api')}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          I need help
        </button>
      </div>
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

      <div className="bg-amber-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="space-y-1">
              <li>• Pangle performance requires "Sub-Publisher" GroupBy in reports</li>
              <li>• EPC (Extended Privacy Control) may cause under-counting</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Setup Steps:</div>
        <ol className="text-xs text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">1.</span>
            Open Airbridge Dashboard → Integrations → Ad Channels
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">2.</span>
            Find TikTok For Business and click [Connect]
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">3.</span>
            Login with your TikTok For Business account
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-medium">4.</span>
            Select your ad account
          </li>
        </ol>
      </div>

      <a
        href="https://dashboard.airbridge.io/integrations/channels"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 mb-3"
      >
        Open Airbridge Dashboard <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          Done
        </button>
        <button
          onClick={() => onHelp('tiktok-permission')}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          I need help
        </button>
      </div>
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

// Event Taxonomy Intro Component
function EventTaxonomyIntro({
  onStart,
  isCompleted = false
}: {
  onStart: () => void;
  isCompleted?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Event Taxonomy</div>
        <div className="text-xs text-gray-400">Introduction viewed</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <div className="text-sm font-medium text-gray-700">Event Taxonomy Setup</div>
      </div>

      <div className="space-y-4 mb-4">
        <p className="text-sm text-gray-600">
          Events are the foundation of your analytics. They help you understand user behavior and measure campaign effectiveness.
        </p>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-800 mb-2">Two types of events:</div>
          <div className="space-y-2 text-xs text-purple-700">
            <div className="flex items-start gap-2">
              <span className="font-medium">Standard Events:</span>
              <span>Pre-defined events like Install, Sign Up, Purchase. Recognized by ad platforms for optimization.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">Custom Events:</span>
              <span>Events specific to your app's unique features and user flows.</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium">Tip:</p>
              <p>Start with Standard Events. They're automatically recognized by ad platforms like Meta and Google for campaign optimization.</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
      >
        Configure Events <ChevronRight className="w-4 h-4" />
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

// Event Property Config Component
function EventPropertyConfig({
  eventName,
  onComplete,
  onSkip,
  isCompleted = false
}: {
  eventName: string;
  onComplete: (properties: EventProperty[]) => void;
  onSkip: () => void;
  isCompleted?: boolean;
}) {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const semanticProperties = [
    { id: 'value', name: 'Value', type: 'number', description: 'Monetary value of the event' },
    { id: 'currency', name: 'Currency', type: 'string', description: 'Currency code (e.g., USD, KRW)' },
    { id: 'products', name: 'Products', type: 'string', description: 'Product information array' },
    { id: 'quantity', name: 'Quantity', type: 'number', description: 'Number of items' },
    { id: 'transactionId', name: 'Transaction ID', type: 'string', description: 'Unique transaction identifier' },
  ];

  if (isCompleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 opacity-60">
        <div className="text-sm font-medium text-gray-500 mb-2">Event Properties: {eventName}</div>
        <div className="text-xs text-gray-400">Configuration completed</div>
      </div>
    );
  }

  const toggle = (id: string) => {
    setSelectedProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    const properties: EventProperty[] = selectedProperties.map(id => {
      const prop = semanticProperties.find(p => p.id === id)!;
      return {
        name: prop.name,
        type: prop.type as 'string' | 'number' | 'boolean',
        isSemantic: true,
      };
    });
    onComplete(properties);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">
        Configure Properties for "{eventName}"
      </div>

      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            Semantic attributes are recognized by Airbridge and ad platforms for advanced analytics and optimization.
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-2">Semantic Attributes</div>
      <div className="space-y-2 mb-4">
        {semanticProperties.map(prop => {
          const isSelected = selectedProperties.includes(prop.id);
          return (
            <button
              key={prop.id}
              onClick={() => toggle(prop.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'bg-purple-500 border-purple-500' : 'bg-white border-gray-300'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{prop.name}</span>
                  <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">{prop.type}</span>
                </div>
                <div className="text-xs text-gray-500">{prop.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleComplete}
          className="flex-1 py-3 rounded-lg font-medium transition-colors bg-purple-500 text-white hover:bg-purple-600"
        >
          Continue
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Skip properties
        </button>
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

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '➕ Let\'s add another app!\n\nWhich environment would you like to set up?' },
        { type: 'environment-select' },
      ]);
    }, 300);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 600);
  };

  // Update the last bot message (replace content)
  const updateLastBotMessage = (content: MessageContent[]) => {
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
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: [{ type: 'text', text }],
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Initial welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '👋 Hello! I\'m your Airbridge Onboarding Manager.' },
      ]);
    }, 300);

    const timer2 = setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'I\'ll guide you through:\n\n📱 App Registration\n🔧 SDK Installation\n📊 Ad Channel Integration' },
      ]);
    }, 1200);

    const timer3 = setTimeout(() => {
      setCurrentPhase(1);
      addBotMessage([
        { type: 'text', text: '🚀 Let\'s start by setting up your app.\n\nWhich environment would you like to set up?\n\n💡 If this is your first time, we recommend **Development** for quick testing.' },
        { type: 'environment-select' },
      ]);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
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
    const newAppId = Date.now().toString();
    const newApp: RegisteredApp = {
      id: newAppId,
      appInfo: setupState.appInfo,
      platforms: setupState.environment === 'dev' ? ['dev'] : setupState.platforms,
      environment: setupState.environment as 'dev' | 'production',
      steps: createAppSteps(),
      currentPhase: 1, // Stay in Phase 1 until token display is confirmed
      framework: '',
      channels: [],
      isExpanded: true,
    };

    setRegisteredApps(prev => [
      ...prev.map(app => ({ ...app, isExpanded: false })),
      newApp
    ]);
    setCurrentAppId(newAppId);
    setIsAddingApp(false);
    setCurrentPhase(1);

    // Generate mock tokens
    const generateToken = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const tokens = {
      appSdkToken: generateToken(),
      webSdkToken: generateToken(),
      apiToken: generateToken(),
    };

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `🎉 Your app **"${setupState.appInfo.appName}"** has been registered!` },
        { type: 'token-display', tokens },
      ]);
    }, 300);
  };

  // Legacy platform select handler (for backward compatibility)
  const handlePlatformSelect = (platforms: string[]) => {
    setSetupState(prev => ({ ...prev, platforms }));
    const platformLabel = platforms[0] === 'ios' ? 'iOS' : platforms[0] === 'android' ? 'Android' : 'Web';
    addUserMessage(platformLabel);

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: `✅ **${platformLabel}**! Great choice.\n\n📝 What's the name of your app?` },
        { type: 'app-name-input' },
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
    // Create new registered app
    const newAppId = Date.now().toString();
    const newApp: RegisteredApp = {
      id: newAppId,
      appInfo: setupState.appInfo,
      platforms: setupState.platforms,
      environment: setupState.environment as 'dev' | 'production',
      steps: createAppSteps(),
      currentPhase: 2,
      framework: '',
      channels: [],
      isExpanded: true,
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
          { type: 'text', text: '👨‍💻 Great! Let\'s set up the SDK together.\n\nFirst, select your development framework:' },
          { type: 'framework-select' },
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

  // SDK Guide Share completion handler
  const handleSdkGuideShareComplete = () => {
    addUserMessage("I've sent the guide to my developer");

    // Mark SDK steps as waiting for developer
    if (currentAppId) {
      // Keep sdk-install as in_progress to indicate waiting
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '✅ Perfect! I\'ll wait for your developer to complete the SDK setup.\n\n💡 **What happens next:**\n• Your developer will install the SDK\n• Once done, they\'ll verify the integration\n• You can track progress in the sidebar\n\nIn the meantime, would you like to set up **Ad Channel Integration**? This can be done in parallel!' },
        {
          type: 'confirm-select',
          options: [
            { label: 'Set up Ad Channels now', value: 'setup-channels' },
            { label: 'Wait for SDK completion', value: 'wait' },
          ]
        },
      ]);
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
      updateAppStepStatus(currentAppId, 'sdk-init', 'in_progress');
    }

    if (framework === 'react-native') {
      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '⚛️ You\'re using **React Native**!\n\n📦 Here are the SDK installation commands.\nPlease run them in your terminal:' },
          { type: 'code-block', title: 'Step 1: Install package', code: 'npm install airbridge-react-native-sdk', language: 'bash' },
          { type: 'code-block', title: 'Step 2: iOS setup', code: 'cd ios && pod install', language: 'bash' },
        ]);
      }, 300);

      setTimeout(() => {
        addBotMessage([
          { type: 'text', text: '👍 Great progress!\n\n⚙️ Now let\'s **initialize the SDK**.\n\nAdd the code below to your app entry point (App.js or index.js).\n💡 I\'ve already filled in the App Name and App Token for you!' },
          { type: 'sdk-init-code', appName: setupState.appInfo?.appName?.toLowerCase().replace(/\s/g, '') || 'myapp', appToken: 'abc123token' },
        ]);
      }, 1500);
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
    addUserMessage(choice === 'now' ? 'Set up now' : 'Later');
    if (currentAppId) {
      updateAppStepStatus(currentAppId, 'deeplink', 'completed');
      updateAppStepStatus(currentAppId, 'sdk-verify', 'in_progress');
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '✅ SDK setup is complete!\n\n🔍 Let\'s **verify** it\'s working properly.\n\nRun your app and click the button below to check **Real-time Logs**.\n\n💡 If you see **\'Install\'** or **\'Open\'** events, you\'re all set!' },
        { type: 'sdk-verify' },
      ]);
    }, 300);
  };

  // Token display continue handler - proceeds to SDK setup
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
        { type: 'text', text: '📱 **SDK Installation**\n\nThe SDK needs to be installed by a developer. Who will handle this?' },
        { type: 'sdk-install-choice' },
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
          updateAppStepStatus(currentAppId, 'channel-connect', 'completed');
        }
        addBotMessage([
          { type: 'text', text: '🎊 **Congratulations!** All setup is complete!\n\n📋 Here\'s a summary of your configuration:' },
          {
            type: 'completion-summary',
            data: {
              appName: setupState.appInfo?.appName || 'MyApp',
              platforms: setupState.platforms,
              framework: setupState.framework,
              channels: selectedChannels,
            }
          },
        ]);
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
  const handleEventTaxonomyStart = () => {
    addUserMessage('Configure Events');
    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'Let\'s configure the events you want to track.\n\nFirst, select the **Standard Events** relevant to your app:' },
        { type: 'standard-event-select' },
      ]);
    }, 300);
  };

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

  const handleEventPropertyComplete = (eventName: string, properties: EventProperty[]) => {
    setConfiguredEvents(prev =>
      prev.map(e => e.eventName === eventName ? { ...e, properties } : e)
    );
    addUserMessage('Properties configured');
  };

  const handleEventPropertySkip = (eventName: string) => {
    addUserMessage('Skip properties');
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
    addUserMessage(inputValue);
    setInputValue('');

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: 'I\'ve noted your message. Would you like to continue with the current step?' },
      ]);
    }, 500);
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

  // Check if we can go back
  const canGoBack = messages.length >= 2 && messages.some(m => m.role === 'user');

  // Step order for prerequisite checking
  const stepOrder = ['sdk-install', 'sdk-init', 'deeplink', 'sdk-verify', 'channel-connect'];

  // Check if a step can be started (prerequisite steps completed)
  const canStartStep = (app: RegisteredApp, stepId: string): boolean => {
    const stepIndex = stepOrder.indexOf(stepId);

    // First step can always be started
    if (stepIndex === 0) return true;

    // Check if all previous steps are completed
    for (let i = 0; i < stepIndex; i++) {
      const prevStepId = stepOrder[i];
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

    // Set current app as active
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
        setTimeout(() => {
          addBotMessage([
            { type: 'text', text: `📊 **Ad Channel Integration** for **${app.appInfo.appName}**\n\nConnect your ad platforms to track attribution.\n\nWhich channels would you like to integrate?` },
            { type: 'channel-select' },
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

      case 'platform-select':
        return <PlatformSelect onSelect={handlePlatformSelect} isCompleted={isCompleted} />;

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

      case 'deeplink-choice':
        return <DeeplinkChoice onSelect={handleDeeplinkChoice} isCompleted={isCompleted} />;

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

      case 'event-taxonomy-intro':
        return (
          <EventTaxonomyIntro
            onStart={handleEventTaxonomyStart}
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

      case 'event-property-config':
        return (
          <EventPropertyConfig
            eventName={content.eventName}
            onComplete={(properties) => handleEventPropertyComplete(content.eventName, properties)}
            onSkip={() => handleEventPropertySkip(content.eventName)}
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
    <div className={`flex bg-gray-50 ${
      viewMode === 'fullscreen'
        ? 'h-screen w-screen'
        : 'h-[600px] rounded-xl shadow-2xl border border-gray-200 relative'
    }`} style={viewMode !== 'fullscreen' ? { height: '720px', maxHeight: '85vh' } : undefined}>
      {/* View Mode Controls - top right corner (fullscreen only, positioned in main area) */}
      {/* Sidebar */}
      <div
        className="bg-white border-r border-gray-200 p-6 flex flex-col overflow-hidden flex-shrink-0"
        style={{ width: viewMode === 'fullscreen' ? '320px' : '288px', minWidth: viewMode === 'fullscreen' ? '320px' : '288px', maxWidth: viewMode === 'fullscreen' ? '320px' : '288px' }}
      >
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold">Setup Guide</h2>
          </div>
          <p className="text-sm text-gray-600">
            Complete your Airbridge setup
          </p>
        </div>

        {/* Phase 1: App Registration */}
        <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-xs font-medium ${currentPhase >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                Phase 1: App Registration
              </div>
              {registeredApps.length > 0 && (
                <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800">
                  {registeredApps.length} app{registeredApps.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Current app registration in progress */}
            {isAddingApp && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-blue-700">
                      {setupState.appInfo.appName || 'New App'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      Registering...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Another App button - show when not currently adding and has registered apps */}
            {!isAddingApp && registeredApps.length > 0 && (
              <button
                onClick={handleAddAnotherApp}
                className="w-full p-3 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add Another App
              </button>
            )}
          </div>

          {/* Registered Apps with their Phase 2,3 */}
          {registeredApps.map((app) => (
            <div key={app.id} className="border border-gray-200 rounded-xl overflow-hidden max-w-full">
              {/* App Header - clickable to toggle */}
              <button
                onClick={() => toggleAppExpansion(app.id)}
                className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-gray-900 truncate">{app.appInfo.appName}</div>
                  <div className="text-xs text-gray-500">
                    {app.platforms.map(p => p === 'ios' ? 'iOS' : p === 'android' ? 'Android' : 'Web').join(', ')} • {app.environment === 'dev' ? 'Dev' : 'Prod'}
                  </div>
                </div>
                {app.isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Collapsible Phase 2,3 content */}
              <AnimatePresence>
                {app.isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-4 space-y-4 border-t border-gray-100 min-w-0">
                      {/* Phase 2: SDK Installation */}
                      <div className="min-w-0">
                        <div className={`text-sm font-medium mb-3 truncate ${app.currentPhase >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                          Phase 2: SDK Installation
                        </div>
                        <div className="space-y-2">
                          {app.steps.filter(s => s.phase === 2).map((step) => {
                            const isDisabled = !canStartStep(app, step.id) && step.status === 'pending';
                            return (
                              <button
                                key={step.id}
                                onClick={() => !isDisabled && handleStepClick(app.id, step)}
                                disabled={isDisabled}
                                className={`w-full p-3 rounded-xl transition-all text-sm text-left ${
                                  isDisabled
                                    ? 'bg-gray-50 border border-gray-100 opacity-50 cursor-not-allowed'
                                    : step.status === 'completed'
                                    ? 'bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer hover:shadow-md'
                                    : step.status === 'in_progress'
                                    ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer hover:shadow-md'
                                    : 'bg-gray-50 border border-gray-100 hover:bg-gray-100 cursor-pointer hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {step.status === 'completed' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                  ) : step.status === 'in_progress' ? (
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                                  ) : (
                                    <Circle className={`w-5 h-5 flex-shrink-0 ${isDisabled ? 'text-gray-200' : 'text-gray-300'}`} />
                                  )}
                                  <span className={`flex-1 truncate ${
                                    isDisabled ? 'text-gray-400' :
                                    step.status === 'completed' ? 'text-green-700' :
                                    step.status === 'in_progress' ? 'text-blue-700' : 'text-gray-500'
                                  }`}>
                                    {step.title}
                                  </span>
                                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                                    isDisabled ? 'text-gray-200' :
                                    step.status === 'completed' ? 'text-green-400' :
                                    step.status === 'in_progress' ? 'text-blue-400' : 'text-gray-300'
                                  }`} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Phase 3: Event Taxonomy - Hidden for Dev mode */}
                      {app.environment !== 'dev' && app.steps.filter(s => s.phase === 3).length > 0 && (
                        <div>
                          <div className={`text-sm font-medium mb-3 truncate ${app.currentPhase >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                            Phase 3: Event Taxonomy
                          </div>
                          <div className="space-y-2">
                            {app.steps.filter(s => s.phase === 3).map((step) => {
                              const isDisabled = !canStartStep(app, step.id) && step.status === 'pending';
                              return (
                                <button
                                  key={step.id}
                                  onClick={() => !isDisabled && handleStepClick(app.id, step)}
                                  disabled={isDisabled}
                                  className={`w-full p-3 rounded-xl transition-all text-sm text-left ${
                                    isDisabled
                                      ? 'bg-gray-50 border border-gray-100 opacity-50 cursor-not-allowed'
                                      : step.status === 'completed'
                                      ? 'bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer hover:shadow-md'
                                      : step.status === 'in_progress'
                                      ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer hover:shadow-md'
                                      : 'bg-gray-50 border border-gray-100 hover:bg-gray-100 cursor-pointer hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {step.status === 'completed' ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    ) : step.status === 'in_progress' ? (
                                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                                    ) : (
                                      <Circle className={`w-5 h-5 flex-shrink-0 ${isDisabled ? 'text-gray-200' : 'text-gray-300'}`} />
                                    )}
                                    <span className={`flex-1 truncate ${
                                      isDisabled ? 'text-gray-400' :
                                      step.status === 'completed' ? 'text-green-700' :
                                      step.status === 'in_progress' ? 'text-blue-700' : 'text-gray-500'
                                    }`}>
                                      {step.title}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                                      isDisabled ? 'text-gray-200' :
                                      step.status === 'completed' ? 'text-green-400' :
                                      step.status === 'in_progress' ? 'text-blue-400' : 'text-gray-300'
                                    }`} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Phase 4: Ad Channel Integration - Hidden for Dev mode */}
                      {app.environment !== 'dev' && app.steps.filter(s => s.phase === 4).length > 0 && (
                        <div>
                          <div className={`text-sm font-medium mb-3 truncate ${app.currentPhase >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
                            Phase 4: Ad Channel Integration
                          </div>
                          <div className="space-y-2">
                            {app.steps.filter(s => s.phase === 4).map((step) => {
                              const isDisabled = !canStartStep(app, step.id) && step.status === 'pending';
                              return (
                                <button
                                  key={step.id}
                                  onClick={() => !isDisabled && handleStepClick(app.id, step)}
                                  disabled={isDisabled}
                                  className={`w-full p-3 rounded-xl transition-all text-sm text-left ${
                                    isDisabled
                                      ? 'bg-gray-50 border border-gray-100 opacity-50 cursor-not-allowed'
                                      : step.status === 'completed'
                                      ? 'bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer hover:shadow-md'
                                      : step.status === 'in_progress'
                                      ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer hover:shadow-md'
                                      : 'bg-gray-50 border border-gray-100 hover:bg-gray-100 cursor-pointer hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {step.status === 'completed' ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    ) : step.status === 'in_progress' ? (
                                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                                    ) : (
                                      <Circle className={`w-5 h-5 flex-shrink-0 ${isDisabled ? 'text-gray-200' : 'text-gray-300'}`} />
                                    )}
                                    <span className={`flex-1 truncate ${
                                      isDisabled ? 'text-gray-400' :
                                      step.status === 'completed' ? 'text-green-700' :
                                      step.status === 'in_progress' ? 'text-blue-700' : 'text-gray-500'
                                    }`}>
                                      {step.title}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                                      isDisabled ? 'text-gray-200' :
                                      step.status === 'completed' ? 'text-green-400' :
                                      step.status === 'in_progress' ? 'text-blue-400' : 'text-gray-300'
                                    }`} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Overall Progress</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-medium">
              {completedSteps}/{totalSteps || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {canGoBack && (
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 text-gray-500 hover:text-gray-700"
                title="Go back to previous step"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>
            )}
            <div className="flex-1">
              <h1 className="font-semibold text-lg">Airbridge Setup</h1>
              <p className="text-gray-600 text-sm mt-1">
                Airbridge Onboarding Manager is here to help
              </p>
            </div>
            {/* View Mode Controls */}
            <div className="self-start">
              <ViewModeControls compact />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((message, messageIndex) => {
                // Find the last bot message index
                const lastBotMessageIndex = messages.map((m, i) => m.role === 'bot' ? i : -1).filter(i => i !== -1).pop() ?? -1;
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
