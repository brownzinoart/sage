'use client'

import { Leaf } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export default function LoadingScreen({ 
  message = "Connecting with Sage...", 
  fullScreen = false 
}: LoadingScreenProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 border border-white/30 shadow-2xl shadow-black/20">
          <LoadingContent message={message} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16">
      <LoadingContent message={message} />
    </div>
  )
}

function LoadingContent({ message }: { message: string }) {
  return (
    <div className="text-center space-y-6">
      {/* Animated Logo */}
      <div className="relative inline-flex items-center justify-center">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 w-24 h-24 bg-emerald-500/20 rounded-full animate-ping"></div>
        {/* Middle pulse ring */}
        <div className="absolute inset-0 w-20 h-20 bg-emerald-500/30 rounded-full animate-pulse delay-150"></div>
        {/* Inner spinning ring */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
        {/* Logo container */}
        <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
          <Leaf className="w-6 h-6 text-white animate-bounce" />
        </div>
      </div>

      {/* Loading message */}
      <div className="space-y-2">
        <p className="text-lg font-medium text-slate-700">
          {message}
        </p>
        
        {/* Animated dots */}
        <div className="flex justify-center items-center space-x-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          I'm analyzing your question and finding the best hemp wellness guidance for you
        </p>
      </div>

      {/* Progress bar animation */}
      <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}