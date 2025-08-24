'use client'

import { useState, useRef, useEffect } from 'react'
import { Message, PrivacyLevelNames } from '@/types'
import { Send, Shield, BookOpen } from 'lucide-react'
import LoadingScreen from '../ui/LoadingScreen'
import ResearchOverlay from './ResearchOverlay'

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (text: string) => void
  isLoading: boolean
  privacyLevel: number
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  privacyLevel
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [researchOverlayOpen, setResearchOverlayOpen] = useState(false)
  const [selectedMessageResearch, setSelectedMessageResearch] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion)
  }

  const handleOpenResearch = (message: Message) => {
    setSelectedMessageResearch(message)
    setResearchOverlayOpen(true)
  }

  // Get the user query that corresponds to the selected research
  const getUserQueryForResearch = () => {
    if (!selectedMessageResearch) return undefined
    
    // Find the index of the selected assistant message
    const messageIndex = messages.findIndex(m => m.id === selectedMessageResearch.id)
    
    // Look for the previous user message
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i].content
      }
    }
    
    return undefined
  }

  const handleCloseResearch = () => {
    setResearchOverlayOpen(false)
    setSelectedMessageResearch(null)
  }

  // Get latest suggestions from bot messages
  const latestSuggestions = messages
    .filter(m => m.role === 'assistant' && m.suggestions)
    .slice(-1)[0]?.suggestions || []

  return (
    <div className="flex flex-col h-full">
      {/* Privacy indicator */}
      <div className="px-4 py-3 bg-primary-50 border-b border-primary-100">
        <div className="flex items-center text-sm text-primary-700">
          <Shield className="w-4 h-4 mr-2" />
          Privacy Level {privacyLevel}: {PrivacyLevelNames[privacyLevel as keyof typeof PrivacyLevelNames]}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 zen-scroll">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌿</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-700 mb-2 font-heading">
              Hi! I'm your hemp guide
            </h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto leading-relaxed">
              I can help you find the perfect products for your needs. What brings you here today?
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <button
                onClick={() => handleSuggestionClick("I'm new to hemp products")}
                className="w-full text-left p-3 bg-gradient-to-r from-accent-lavender to-accent-sky rounded-xl hover:shadow-md transition-all text-sm"
              >
                <span className="font-medium text-neutral-700">🌱 New to hemp?</span>
                <span className="text-xs text-neutral-500 block mt-1">
                  I'll guide you through the basics
                </span>
              </button>
              <button
                onClick={() => handleSuggestionClick("I need help with sleep")}
                className="w-full text-left p-3 bg-gradient-to-r from-accent-peach to-accent-sand rounded-xl hover:shadow-md transition-all text-sm"
              >
                <span className="font-medium text-neutral-700">😴 Specific need?</span>
                <span className="text-xs text-neutral-500 block mt-1">
                  Tell me what you're looking for
                </span>
              </button>
              <button
                onClick={() => handleSuggestionClick("Just browsing products")}
                className="w-full text-left p-3 bg-gradient-to-r from-accent-rose to-accent-lavender rounded-xl hover:shadow-md transition-all text-sm"
              >
                <span className="font-medium text-neutral-700">👀 Just browsing?</span>
                <span className="text-xs text-neutral-500 block mt-1">
                  Explore our thoughtful selection
                </span>
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              message.role === 'user' 
                ? 'bg-primary-50 text-neutral-800 rounded-br-sm ml-auto' 
                : 'bg-white text-neutral-800 rounded-bl-sm border border-neutral-100 shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Research Resources Button for Assistant Messages */}
              {message.role === 'assistant' && (message.educational_resources || message.educational_summary) && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <button
                    onClick={() => handleOpenResearch(message)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors group"
                  >
                    <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>View Research Insights</span>
                  </button>
                  <p className="text-xs text-neutral-500 mt-1">
                    Evidence-based information from academic sources
                  </p>
                </div>
              )}
              
              {message.role === 'assistant' && message.timestamp && (
                <div className="text-xs text-neutral-400 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-neutral-100 rounded-2xl rounded-bl-sm p-6 shadow-sm max-w-sm">
              <LoadingScreen message="Thinking..." fullScreen={false} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {latestSuggestions.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t border-neutral-100">
          <div className="flex flex-wrap gap-2">
            {latestSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-neutral-100">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about hemp products..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[48px]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Research Overlay */}
      <ResearchOverlay
        isOpen={researchOverlayOpen}
        onClose={handleCloseResearch}
        educational_resources={selectedMessageResearch?.educational_resources}
        educational_summary={selectedMessageResearch?.educational_summary}
        userQuery={getUserQueryForResearch()}
      />
    </div>
  )
}