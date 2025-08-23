'use client'

import { Leaf } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
  onCancel?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

export default function LoadingScreen({ 
  message = "Connecting with Sage...", 
  fullScreen = false,
  onCancel,
  theme = 'auto'
}: LoadingScreenProps) {
  // Auto-detect theme based on context
  const effectiveTheme = theme === 'auto' 
    ? (fullScreen ? 'light' : 'light') // Both contexts currently use light backgrounds
    : theme
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 border border-white/30 shadow-2xl shadow-black/20">
          <LoadingContent message={message} onCancel={onCancel} theme={effectiveTheme} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16">
      <LoadingContent message={message} onCancel={onCancel} theme={effectiveTheme} />
    </div>
  )
}

function LoadingContent({ message, onCancel, theme }: { message: string; onCancel?: () => void; theme: 'light' | 'dark' }) {
  const isLight = theme === 'light'
  return (
    <div className="text-center space-y-6">
      {/* Simplified Animated Logo */}
      <div className="relative inline-flex items-center justify-center w-16 h-16">
        {/* Single subtle pulse ring */}
        <div className="absolute inset-0 w-16 h-16 bg-emerald-500/20 rounded-full animate-pulse"></div>
        {/* Logo container */}
        <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
          <Leaf className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Loading message */}
      <div className="space-y-2">
        <p className={`text-lg font-medium ${isLight 
            ? 'text-slate-700' 
            : 'text-white'
          }`}
          style={isLight ? {} : {textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}
        >
          {message}
        </p>
        
        {/* Simplified animated dots */}
        <div className="flex justify-center items-center space-x-1">
          <div className={`w-1.5 h-1.5 ${isLight ? 'bg-emerald-500' : 'bg-emerald-400'} rounded-full animate-pulse ${isLight ? '' : 'shadow-lg'}`}></div>
          <div className={`w-1.5 h-1.5 ${isLight ? 'bg-emerald-500' : 'bg-emerald-400'} rounded-full animate-pulse delay-300 ${isLight ? '' : 'shadow-lg'}`}></div>
          <div className={`w-1.5 h-1.5 ${isLight ? 'bg-emerald-500' : 'bg-emerald-400'} rounded-full animate-pulse delay-700 ${isLight ? '' : 'shadow-lg'}`}></div>
        </div>

        {/* Subtitle */}
        <p className={`text-sm max-w-xs mx-auto ${isLight 
            ? 'text-slate-500' 
            : 'text-slate-200'
          }`}
          style={isLight ? {} : {textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}
        >
          I'm analyzing your question and finding the best hemp wellness guidance for you
        </p>
      </div>

      {/* Simplified progress indicator */}
      <div className={`w-32 h-0.5 rounded-full overflow-hidden ${isLight 
          ? 'bg-slate-200 shadow-inner' 
          : 'bg-white/20 shadow-inner'
        }`}>
        <div className={`h-full w-2/3 ${isLight ? 'bg-emerald-500' : 'bg-emerald-400'} rounded-full animate-pulse ${isLight ? '' : 'shadow-lg'}`}></div>
      </div>

      {/* Cancel button for emergency exits */}
      {onCancel && (
        <button
          onClick={onCancel}
          className={`mt-4 px-4 py-2 text-sm underline transition-colors ${isLight
              ? 'text-slate-600 hover:text-slate-800'
              : 'text-slate-300 hover:text-white'
            }`}
          style={isLight ? {} : {textShadow: '0 1px 2px rgba(0,0,0,0.4)'}}
        >
          Cancel search
        </button>
      )}
    </div>
  )
}