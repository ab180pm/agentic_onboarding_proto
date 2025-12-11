import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';

interface TermsAgreementProps {
  onComplete: () => void;
  onGoBack: () => void;
}

interface TermsState {
  termsOfService: boolean;
  personalInfo: boolean;
  marketingInfo: boolean;
  newsletter: boolean;
}

interface ExpandedState {
  termsOfService: boolean;
  personalInfo: boolean;
  marketingInfo: boolean;
}

const termsContent = {
  termsOfService: `By using Airbridge services, you agree to be bound by these Terms of Service. Airbridge provides mobile measurement and deep linking solutions to help businesses track and optimize their marketing campaigns.

Key points:
• You must be at least 18 years old to use our services
• You are responsible for maintaining the security of your account
• You agree not to misuse our services or help others do so
• We may modify these terms at any time with notice
• Airbridge reserves the right to suspend accounts that violate these terms`,

  personalInfo: `We collect and use personal information to provide and improve our services.

Information we collect:
• Account information (name, email, company)
• Usage data and analytics
• Device information and IP addresses
• Cookies and similar technologies

How we use your information:
• To provide and maintain our services
• To communicate with you about your account
• To improve and personalize your experience
• To comply with legal obligations

Your rights:
• Access and correct your personal data
• Request deletion of your data
• Opt-out of marketing communications`,

  marketingInfo: `By agreeing to this option, you consent to receive personalized marketing communications from Airbridge.

This includes:
• Product updates and new feature announcements
• Industry insights and best practices
• Case studies and success stories
• Promotional offers and event invitations

You can unsubscribe at any time through the link in our emails or by contacting support.`
};

export function TermsAgreement({ onComplete, onGoBack }: TermsAgreementProps) {
  const [termsState, setTermsState] = useState<TermsState>({
    termsOfService: false,
    personalInfo: false,
    marketingInfo: false,
    newsletter: false,
  });

  const [expandedState, setExpandedState] = useState<ExpandedState>({
    termsOfService: false,
    personalInfo: false,
    marketingInfo: false,
  });

  const handleCheckboxChange = (id: keyof TermsState) => {
    setTermsState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExpandToggle = (id: keyof ExpandedState) => {
    setExpandedState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allChecked = Object.values(termsState).every(v => v);

  const handleAcceptAll = () => {
    const newValue = !allChecked;
    setTermsState({
      termsOfService: newValue,
      personalInfo: newValue,
      marketingInfo: newValue,
      newsletter: newValue,
    });
  };

  const isFormValid = termsState.termsOfService && termsState.personalInfo;

  const handleContinue = () => {
    sessionStorage.setItem('termsAgreement', JSON.stringify({
      agreedAt: new Date().toISOString(),
      marketingConsent: termsState.marketingInfo,
      newsletterConsent: termsState.newsletter
    }));
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Go Back Link */}
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go back</span>
          </button>

          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Sign up now and explore all features for free.
          </h1>

          {/* Terms Section */}
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-gray-800">
              Terms of Service and Privacy Policy
            </h2>

            <Separator className="bg-gray-200" />

            {/* Terms of Service */}
            <Collapsible
              open={expandedState.termsOfService}
              onOpenChange={() => handleExpandToggle('termsOfService')}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={termsState.termsOfService}
                  onCheckedChange={() => handleCheckboxChange('termsOfService')}
                />
                <div className="flex-1 flex items-center justify-between">
                  <label className="text-sm text-gray-700 cursor-pointer flex items-center gap-1">
                    <span>Terms of Service</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <CollapsibleTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-gray-400 transition-transform duration-200",
                          expandedState.termsOfService && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent>
                <div className="mt-3 ml-7 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-line">
                  {termsContent.termsOfService}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Collection and Use of Personal Information */}
            <Collapsible
              open={expandedState.personalInfo}
              onOpenChange={() => handleExpandToggle('personalInfo')}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={termsState.personalInfo}
                  onCheckedChange={() => handleCheckboxChange('personalInfo')}
                />
                <div className="flex-1 flex items-center justify-between">
                  <label className="text-sm text-gray-700 cursor-pointer flex items-center gap-1">
                    <span>Collection and Use of Personal Information</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <CollapsibleTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-gray-400 transition-transform duration-200",
                          expandedState.personalInfo && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent>
                <div className="mt-3 ml-7 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-line">
                  {termsContent.personalInfo}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Marketing Information */}
            <Collapsible
              open={expandedState.marketingInfo}
              onOpenChange={() => handleExpandToggle('marketingInfo')}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={termsState.marketingInfo}
                  onCheckedChange={() => handleCheckboxChange('marketingInfo')}
                />
                <div className="flex-1 flex items-center justify-between">
                  <label className="text-sm text-gray-700 cursor-pointer">
                    For providing information on Airbridge's products and services, and delivering personalized ads
                  </label>
                  <CollapsibleTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-gray-400 transition-transform duration-200",
                          expandedState.marketingInfo && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent>
                <div className="mt-3 ml-7 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-line">
                  {termsContent.marketingInfo}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Newsletter */}
            <div className="flex items-start gap-3">
              <Checkbox
                checked={termsState.newsletter}
                onCheckedChange={() => handleCheckboxChange('newsletter')}
              />
              <label className="text-sm text-gray-700 cursor-pointer">
                I want to receive the latest news and updates from Airbridge.
              </label>
            </div>

            <Separator className="bg-gray-200" />

            {/* Accept All */}
            <div className="flex items-start gap-3">
              <Checkbox
                checked={allChecked}
                onCheckedChange={handleAcceptAll}
              />
              <label className="text-sm font-medium text-gray-900 cursor-pointer">
                I accept and agree to all the above.
              </label>
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8">
            <button
              onClick={handleContinue}
              disabled={!isFormValid}
              className={cn(
                "w-full py-4 text-base font-semibold rounded-xl transition-all",
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
