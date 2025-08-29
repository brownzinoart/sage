'use client'

import { useState } from 'react'
import { Shield, ChevronDown } from 'lucide-react'
import { PrivacyLevel, PrivacyLevelNames } from '@/types'

interface PrivacyToggleProps {
  level: number
  onChange: (level: number) => void
}

export default function PrivacyToggle({ level, onChange }: PrivacyToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  const privacyLevels = [
    {
      level: PrivacyLevel.ANONYMOUS,
      name: PrivacyLevelNames[PrivacyLevel.ANONYMOUS],
      description: 'No data stored, basic search only',
      color: 'text-neutral-600'
    },
    {
      level: PrivacyLevel.SESSION,
      name: PrivacyLevelNames[PrivacyLevel.SESSION],
      description: 'Temporary memory for this session',
      color: 'text-blue-600'
    },
    {
      level: PrivacyLevel.LOCAL,
      name: PrivacyLevelNames[PrivacyLevel.LOCAL],
      description: 'Saved to your device only',
      color: 'text-green-600'
    },
    {
      level: PrivacyLevel.ACCOUNT,
      name: PrivacyLevelNames[PrivacyLevel.ACCOUNT],
      description: 'Full personalization with account',
      color: 'text-primary-600'
    }
  ]

  const currentLevel = privacyLevels.find(l => l.level === level) || privacyLevels[0]

  const getPrivacyIcon = (level: number) => {
    const opacity = level * 0.25
    return (
      <Shield 
        className="w-4 h-4" 
        style={{ opacity: Math.max(0.3, opacity) }}
        fill={level >= 3 ? 'currentColor' : 'none'}
      />
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-sm"
      >
        <div className={currentLevel.color}>
          {getPrivacyIcon(level)}
        </div>
        <span className="text-neutral-700 font-medium">
          Privacy: {currentLevel.name.split(' ')[0]}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-2xl shadow-lg z-20 p-2">
            <div className="p-3 border-b border-neutral-100">
              <h3 className="font-medium text-neutral-800 font-heading mb-1">
                Privacy Settings
              </h3>
              <p className="text-xs text-neutral-500">
                Choose how much data you'd like to share for a personalized experience
              </p>
            </div>
            
            <div className="space-y-1 p-2">
              {privacyLevels.map((privacyLevel) => (
                <button
                  key={privacyLevel.level}
                  onClick={() => {
                    onChange(privacyLevel.level)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    level === privacyLevel.level 
                      ? 'bg-primary-50 border border-primary-200' 
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${privacyLevel.color}`}>
                      {getPrivacyIcon(privacyLevel.level)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-neutral-800">
                          Level {privacyLevel.level}
                        </span>
                        <span className="text-sm text-neutral-500">
                          {privacyLevel.name}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {privacyLevel.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 leading-relaxed">
                You can change this setting anytime. Higher levels provide more personalized recommendations.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}