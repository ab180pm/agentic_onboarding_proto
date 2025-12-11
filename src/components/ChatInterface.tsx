import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, CheckCircle2, Circle, Sparkles, Copy, Check, ExternalLink,
  Smartphone, Code, Tv, AlertCircle, ChevronRight, ChevronDown, Loader2, Plus, Lightbulb,
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
  { id: 'sdk-install', phase: 2, title: 'SDK Installation', description: 'Install packages and initialize', status: 'pending' },
  { id: 'sdk-init', phase: 2, title: 'SDK Initialization', description: 'Add SDK code to your app', status: 'pending' },
  { id: 'deeplink', phase: 2, title: 'Deep Link Setup', description: 'Configure deep links (optional)', status: 'pending' },
  { id: 'sdk-verify', phase: 2, title: 'SDK Verification', description: 'Verify event reception', status: 'pending' },
  { id: 'channel-connect', phase: 3, title: 'Ad Channel Integration', description: 'Connect ad platforms', status: 'pending' },
];

// SDK Install Choice Component
function SdkInstallChoice({ onSelect }: { onSelect: (choice: 'self' | 'share') => void }) {
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
function SdkGuideShare({ appName, platforms, framework, onCopy, onComplete }: {
  appName: string;
  platforms: string[];
  framework?: string;
  onCopy: () => void;
  onComplete: () => void;
}) {
  const [copied, setCopied] = useState(false);

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
    <div className="bg-gray-100 rounded-xl overflow-hidden mt-4 border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-200 border-b border-gray-300">
        <span className="text-sm text-gray-600">{title}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm text-gray-800 overflow-x-auto bg-gray-50">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Environment Select Component
function EnvironmentSelect({ onSelect }: { onSelect: (env: 'dev' | 'production') => void }) {
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
function AppNameInput({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

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
  onNotFound
}: {
  results: AppSearchResult[];
  query: string;
  onSelect: (app: AppSearchResult) => void;
  onNotFound: () => void;
}) {
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
function PlatformSelect({ onSelect }: { onSelect: (platforms: string[]) => void }) {
  const platforms = [
    { id: 'ios', label: 'iOS', description: 'iPhone & iPad apps', icon: <Smartphone className="w-8 h-8" /> },
    { id: 'android', label: 'Android', description: 'Google Play apps', icon: <Smartphone className="w-8 h-8" /> },
    { id: 'web', label: 'Web', description: 'Web applications', icon: <Tv className="w-8 h-8" /> },
  ];

  const handleSelect = (id: string) => {
    onSelect([id]);
  };

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
function PlatformMultiSelect({ onSelect }: { onSelect: (platforms: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const platforms = [
    { id: 'ios', label: 'iOS', description: 'App Store', icon: <Smartphone className="w-8 h-8" /> },
    { id: 'android', label: 'Android', description: 'Play Store', icon: <Smartphone className="w-8 h-8" /> },
    { id: 'web', label: 'Web', description: 'Web App', icon: <Tv className="w-8 h-8" /> },
  ];

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

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
function DevAppNameInput({ onSubmit }: { onSubmit: (name: string) => void }) {
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
  onUrlSubmit
}: {
  platform: 'ios' | 'android' | 'web';
  platformIndex: number;
  totalPlatforms: number;
  onSearch: (query: string) => void;
  onUrlSubmit: (url: string) => void;
}) {
  const [mode, setMode] = useState<'choice' | 'search' | 'url'>('choice');
  const [searchQuery, setSearchQuery] = useState('');
  const [url, setUrl] = useState('');

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
  onEdit
}: {
  timezone: string;
  currency: string;
  onConfirm: () => void;
  onEdit: () => void;
}) {
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
function TimezoneCurrencyInput({ onSubmit }: { onSubmit: (timezone: string, currency: string) => void }) {
  const [timezone, setTimezone] = useState('');
  const [currency, setCurrency] = useState('');

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
function AppInfoForm({ onSubmit, platforms }: { onSubmit: (info: AppInfo) => void; platforms: string[] }) {
  const [info, setInfo] = useState<AppInfo>({ appName: '', storeUrl: '', bundleId: '', packageName: '' });

  const handleSubmit = () => {
    if (info.appName) {
      onSubmit(info);
    }
  };

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
  appName, bundleId, packageName, onConfirm
}: {
  appName: string; bundleId: string; packageName: string; onConfirm: (status: string) => void
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [detected, setDetected] = useState(false);

  // Simulate auto-detection of app registration
  useEffect(() => {
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
  }, [onConfirm]);

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
function FrameworkSelect({ onSelect }: { onSelect: (framework: string) => void }) {
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
function SDKInitCode({ appName, appToken, onConfirm }: { appName: string; appToken: string; onConfirm: (status: string) => void }) {
  const [copied, setCopied] = useState(false);

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

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
          <span className="text-sm text-gray-400">App.js or index.js</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
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
function DeeplinkChoice({ onSelect }: { onSelect: (choice: string) => void }) {
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
function SDKVerify({ onConfirm }: { onConfirm: (status: string) => void }) {
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
function ChannelSelect({ onSelect }: { onSelect: (channels: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

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

// Token Display Component
function TokenDisplay({ tokens, onContinue }: { tokens: { appSdkToken: string; webSdkToken: string; apiToken: string }; onContinue: () => void }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
function SingleSelect({ options, onSelect }: { options: { label: string; value: string; description?: string }[]; onSelect: (value: string) => void }) {
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
      updateAppStepStatus(currentAppId, 'channel-connect', 'completed');
      setRegisteredApps(prev => prev.map(app =>
        app.id === currentAppId ? { ...app, channels } : app
      ));
    }

    setTimeout(() => {
      addBotMessage([
        { type: 'text', text: '🎊 **Congratulations!** All setup is complete!\n\n📋 Here\'s a summary of your configuration:' },
        {
          type: 'completion-summary',
          data: {
            appName: setupState.appInfo?.appName || 'MyApp',
            platforms: setupState.platforms,
            framework: setupState.framework,
            channels,
          }
        },
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

  // Parse markdown bold (**text**) to React elements
  const parseMarkdownBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Message rendering
  const renderMessageContent = (content: MessageContent) => {
    switch (content.type) {
      case 'text':
        return <p className="text-sm leading-relaxed whitespace-pre-line">{parseMarkdownBold(content.text)}</p>;

      case 'environment-select':
        return <EnvironmentSelect onSelect={handleEnvironmentSelect} />;

      case 'platform-select':
        return <PlatformSelect onSelect={handlePlatformSelect} />;

      case 'platform-multi-select':
        return <PlatformMultiSelect onSelect={handlePlatformMultiSelect} />;

      case 'app-name-input':
        return <AppNameInput onSubmit={handleAppNameSubmit} />;

      case 'app-name-input-dev':
        return <DevAppNameInput onSubmit={handleDevAppNameSubmit} />;

      case 'platform-registration':
        return (
          <PlatformRegistration
            platform={content.platform}
            platformIndex={content.platformIndex}
            totalPlatforms={content.totalPlatforms}
            onSearch={(query) => handlePlatformSearch(query, content.platform as 'ios' | 'android')}
            onUrlSubmit={(url) => handlePlatformUrlSubmit(url, content.platform)}
          />
        );

      case 'timezone-currency-confirm':
        return (
          <TimezoneCurrencyConfirm
            timezone={content.timezone}
            currency={content.currency}
            onConfirm={handleTimezoneCurrencyConfirm}
            onEdit={handleTimezoneCurrencyEdit}
          />
        );

      case 'timezone-currency-input':
        return <TimezoneCurrencyInput onSubmit={handleTimezoneCurrencySubmit} />;

      case 'app-search-loading':
        return <AppSearchLoading query={content.query} />;

      case 'app-search-results':
        return (
          <AppSearchResults
            results={content.results}
            query={content.query}
            onSelect={content.platform ? handleProductionAppSelect : handleAppSelect}
            onNotFound={handleAppNotFound}
          />
        );

      case 'app-info-form':
        return <AppInfoForm onSubmit={handleAppInfoSubmit} platforms={setupState.platforms} />;

      case 'dashboard-action':
        return (
          <DashboardAction
            appName={content.appName}
            bundleId={content.bundleId}
            packageName={content.packageName}
            onConfirm={handleDashboardConfirm}
          />
        );

      case 'sdk-install-choice':
        return <SdkInstallChoice onSelect={handleSdkInstallChoice} />;

      case 'sdk-guide-share':
        return (
          <SdkGuideShare
            appName={content.appName}
            platforms={content.platforms}
            framework={content.framework}
            onCopy={() => {}}
            onComplete={handleSdkGuideShareComplete}
          />
        );

      case 'framework-select':
        return <FrameworkSelect onSelect={handleFrameworkSelect} />;

      case 'code-block':
        return <CodeBlock title={content.title} code={content.code} language={content.language} />;

      case 'sdk-init-code':
        return <SDKInitCode appName={content.appName} appToken={content.appToken} onConfirm={handleSDKInitConfirm} />;

      case 'deeplink-choice':
        return <DeeplinkChoice onSelect={handleDeeplinkChoice} />;

      case 'sdk-verify':
        return <SDKVerify onConfirm={handleSDKVerifyConfirm} />;

      case 'channel-select':
        return <ChannelSelect onSelect={handleChannelSelect} />;

      case 'completion-summary':
        return <CompletionSummary data={content.data} />;

      case 'single-select':
        return <SingleSelect options={content.options} onSelect={handleSingleSelect} />;

      case 'token-display':
        return <TokenDisplay tokens={content.tokens} onContinue={handleTokenDisplayContinue} />;

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

  // View mode toggle buttons
  const ViewModeControls = () => (
    <div className="flex items-center gap-2 p-2 bg-white rounded-xl shadow-lg border border-gray-200">
      <button
        onClick={() => setViewMode('fullscreen')}
        className={`p-3 rounded-lg transition-colors ${viewMode === 'fullscreen' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Full Screen"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
      <button
        onClick={() => setViewMode('module')}
        className={`p-3 rounded-lg transition-colors ${viewMode === 'module' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Module View"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
      <button
        onClick={() => setViewMode('minimized')}
        className={`p-3 rounded-lg transition-colors ${viewMode === 'minimized' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Minimize"
      >
        <Minimize2 className="w-5 h-5" />
      </button>
    </div>
  );

  // Main chat content - defined as JSX element to prevent remounting on state changes
  const chatContent = (
    <div className={`flex bg-gray-50 ${
      viewMode === 'fullscreen'
        ? 'h-screen'
        : 'h-[600px] rounded-xl shadow-2xl border border-gray-200'
    }`} style={viewMode !== 'fullscreen' ? { height: '720px', maxHeight: '85vh' } : undefined}>
      {/* Sidebar */}
      <div
        className="bg-white border-r border-gray-200 p-6 flex flex-col overflow-hidden flex-shrink-0"
        style={{ width: viewMode === 'fullscreen' ? '320px' : '288px', minWidth: viewMode === 'fullscreen' ? '320px' : '288px', maxWidth: viewMode === 'fullscreen' ? '320px' : '288px' }}
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">Setup Guide</h2>
            </div>
            {viewMode !== 'fullscreen' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('fullscreen')}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title="Full Screen"
                >
                  <Maximize2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setViewMode('minimized')}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
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

                      {/* Phase 3: Channel Integration - Hidden for Dev mode */}
                      {app.environment !== 'dev' && (
                        <div>
                          <div className={`text-sm font-medium mb-3 truncate ${app.currentPhase >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                            Phase 3: Channel Integration
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
          <h1 className="font-semibold text-lg">Airbridge Setup</h1>
          <p className="text-gray-600 text-sm mt-1">
            Airbridge Onboarding Manager is here to help
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map(message => (
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
                        {renderMessageContent(content)}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
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

  // Fullscreen mode - render with view mode controls
  return (
    <div className="relative">
      {/* View Mode Controls - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ViewModeControls />
      </div>
      {chatContent}
    </div>
  );
}
