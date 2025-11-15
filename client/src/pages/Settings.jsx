import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Volume2, 
  Moon, 
  Sun,
  Bell,
  User,
  Shield,
  Palette
} from 'lucide-react';
import PageTemplate from '../components/PageTemplate.jsx';
import PageHeader from '../components/PageHeader.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';
import GlassCard from '../components/GlassCard.jsx';
import Button from '../components/Button.jsx';
import MotionContainer from '../components/MotionContainer.jsx';

export default function Settings() {
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState('concise');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);

  const settingsSections = [
    {
      title: 'Language & Tone',
      icon: Globe,
      settings: [
        {
          label: 'Language',
          value: language,
          onChange: setLanguage,
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'Hindi' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' }
          ]
        },
        {
          label: 'Response Tone',
          value: tone,
          onChange: setTone,
          type: 'select',
          options: [
            { value: 'concise', label: 'Concise' },
            { value: 'detailed', label: 'Detailed' },
            { value: 'friendly', label: 'Friendly' },
            { value: 'formal', label: 'Formal' }
          ]
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          label: 'Theme',
          value: theme,
          onChange: setTheme,
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto' }
          ]
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          label: 'Enable Notifications',
          value: notifications,
          onChange: setNotifications,
          type: 'toggle'
        }
      ]
    }
  ];

  return (
    <PageTemplate>
      <PageHeader
        title="Settings"
        subtitle="Customize your AI Study Buddy experience"
        icon={SettingsIcon}
      />

      <MotionContainer className="space-y-6" stagger={0.1}>
        {settingsSections.map((section, sectionIndex) => (
          <AnimatedCard key={sectionIndex} delay={sectionIndex * 0.1} className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.settings.map((setting, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.1 + index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      {setting.label}
                    </label>
                    {setting.type === 'select' ? (
                      <select
                        value={setting.value}
                        onChange={(e) => setting.onChange(e.target.value)}
                        className="mt-2 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium"
                      >
                        {setting.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : setting.type === 'toggle' ? (
                      <div className="mt-2">
                        <button
                          onClick={() => setting.onChange(!setting.value)}
                          className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${setting.value ? 'bg-indigo-600' : 'bg-gray-300'}
                          `}
                        >
                          <span
                            className={`
                              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                              ${setting.value ? 'translate-x-6' : 'translate-x-1'}
                            `}
                          />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>
        ))}

        {/* Account Section */}
        <AnimatedCard delay={0.3} className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Account</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-semibold text-gray-700 mb-1">Email</div>
              <div className="text-gray-600">user@example.com</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-semibold text-gray-700 mb-1">Member Since</div>
              <div className="text-gray-600">January 2024</div>
            </div>
          </div>
        </AnimatedCard>

        {/* Privacy Section */}
        <AnimatedCard delay={0.4} className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Privacy & Security</h3>
          </div>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Privacy Policy
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Terms of Service
            </Button>
          </div>
        </AnimatedCard>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button size="lg" className="w-full">
            Save Changes
          </Button>
        </motion.div>
      </MotionContainer>
    </PageTemplate>
  );
}
