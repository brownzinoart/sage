'use client'

import { useState, useCallback } from 'react'
import { Message, Product, ChatRequest, ChatResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface UseChatProps {
  privacyLevel?: number
}

export function useChat({ privacyLevel = 1 }: UseChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState<string>('')

  const sendMessage = useCallback(async (text: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    // Store the query
    setLastQuery(text)
    setIsLoading(true)

    try {
      const chatRequest: ChatRequest = {
        text,
        session_id: sessionId || undefined,
        privacy_level: privacyLevel
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: ChatResponse = await response.json()

      // Update session ID if new
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id)
      }

      // Create assistant message with educational content
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
        educational_resources: data.educational_resources,
        educational_summary: data.educational_summary
      }
      
      setMessages(prev => [...prev, assistantMessage])

      // Store products
      if (data.products && data.products.length > 0) {
        setProducts(data.products)
      }

    } catch (error) {
      console.error('Chat error:', error)
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, privacyLevel])

  const clearResults = useCallback(() => {
    setMessages([])
    setProducts([])
    setSessionId(null)
    setLastQuery('')
  }, [])

  return {
    messages,
    products,
    sendMessage,
    isLoading,
    sessionId,
    lastQuery,
    clearResults
  }
}