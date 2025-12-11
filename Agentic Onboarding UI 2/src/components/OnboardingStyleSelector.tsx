import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, PanelRight, Maximize2, PanelBottomOpen, PanelLeft, Sparkles } from 'lucide-react';

export type OnboardingStyle = 
  | 'bottom-right-popup'
  | 'right-sidebar'
  | 'center-modal'
  | 'top-banner'
  | 'left-panel';

interface OnboardingStyleSelectorProps {
  onSelect: (style: OnboardingStyle) => void;
}

const styles = [
  {
    id: 'bottom-right-popup' as OnboardingStyle,
    title: 'Bottom-Right Module',
    description: 'Floating chat widget in the bottom-right corner, inspired by Intercom & Drift',
    icon: <MessageSquare className="w-6 h-6" />,
    preview: '💬',
    color: 'from-blue-500 to-cyan-500',
    features: ['Non-intrusive', 'Easy to minimize', 'Familiar pattern']
  },
  {
    id: 'right-sidebar' as OnboardingStyle,
    title: 'Right Sidebar Agent',
    description: 'Fixed sidebar on the right, like GitHub Copilot or IDE assistants',
    icon: <PanelRight className="w-6 h-6" />,
    preview: '▐',
    color: 'from-purple-500 to-pink-500',
    features: ['Always visible', 'Side-by-side workflow', 'Professional']
  },
  {
    id: 'center-modal' as OnboardingStyle,
    title: 'Centered Modal Dialog',
    description: 'Large centered modal with backdrop, for focused onboarding experience',
    icon: <Maximize2 className="w-6 h-6" />,
    preview: '⬜',
    color: 'from-indigo-500 to-purple-500',
    features: ['Full attention', 'Rich content', 'Immersive']
  },
  {
    id: 'top-banner' as OnboardingStyle,
    title: 'Top Banner Wizard',
    description: 'Expanding banner from the top with step-by-step guidance',
    icon: <PanelBottomOpen className="w-6 h-6" />,
    preview: '▬',
    color: 'from-orange-500 to-red-500',
    features: ['Contextual', 'Step progress', 'Compact']
  },
  {
    id: 'left-panel' as OnboardingStyle,
    title: 'Left Slide Panel',
    description: 'Wide sliding panel from the left, elegant and spacious',
    icon: <PanelLeft className="w-6 h-6" />,
    preview: '▌',
    color: 'from-green-500 to-teal-500',
    features: ['Spacious layout', 'Smooth animation', 'Modern']
  }
];

export function OnboardingStyleSelector({ onSelect }: OnboardingStyleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Choose Your Onboarding Experience</span>
          </div>
          <h1 className="mb-4">Select Your Preferred Setup Style</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We've created 5 different onboarding experiences. Choose the one that best fits your workflow and preferences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {styles.map((style, index) => (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(style.id)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden text-left hover:shadow-xl transition-all border-2 border-transparent hover:border-gray-200"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${style.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 text-6xl opacity-20 -mr-4 -mt-2">
                  {style.preview}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                    {style.icon}
                  </div>
                  <h3 className="mb-1">{style.title}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  {style.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {style.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <div className={`bg-gradient-to-r ${style.color} text-white px-4 py-2 rounded-lg text-sm text-center`}>
                  Try this style →
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Don't worry, you can always change this later in settings
          </p>
        </motion.div>
      </div>
    </div>
  );
}
