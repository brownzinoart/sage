'use client'

import { useState, useCallback } from 'react'
import { Message, Product, ChatRequest, ChatResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

      // Store response data (no chat messages, just data)
      if (data.products && data.products.length > 0) {
        setProducts(data.products)
      }

    } catch (error) {
      console.error('Search error:', error)
      // Just log the error, no chat messages needed
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, privacyLevel])

  const clearResults = useCallback(() => {
    setProducts([])
    setSessionId(null)
    setLastQuery('')
  }, [])

  return {
    products,
    sendMessage,
    isLoading,
    sessionId,
    lastQuery,
    clearResults
  }
}