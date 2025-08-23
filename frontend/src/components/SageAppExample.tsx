'use client'

import { useState } from 'react'
import { Leaf } from 'lucide-react'
import { 
  Container, 
  Display, 
  Heading, 
  Body, 
  Button, 
  Input, 
  Card, 
  CardContent,
  LoadingScreen 
} from '@/components/ui'

/**
 * Example refactor of SageApp using the new design system
 * 
 * Key improvements:
 * 1. Typography - Semantic components instead of inline styles
 * 2. Layout - Proper Container usage, no fixed viewport issues
 * 3. Styling - Design system classes instead of ad-hoc styles
 * 4. Accessibility - Proper focus management and keyboard support
 * 5. Performance - Optimized animations and reduced complexity
 */

const examplePrompts = [
  "what is thca?",
  "whats best for a cookout?", 
  "i cant sleep!",
  "what are NC's regulations?"
]

export default function SageAppExample() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setHasSearched(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setExplanation('For sleep support, CBD and CBN work together to promote relaxation. Look for products with calming terpenes like myrcene and linalool for the most restful experience.')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-surface-tertiary">
      {/* Background - Simplified without fixed positioning issues */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url('/zen-background.jpg')`,
          filter: 'brightness(1.1) contrast(0.85) saturate(0.7)',
        }}
      />
      
      {/* Overlay for better text contrast */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/40 via-sage-50/30 to-white/20 -z-10" />

      {/* Loading overlay */}
      {isLoading && (
        <LoadingScreen 
          message="Sage is analyzing your question..." 
          fullScreen={true}
        />
      )}

      {/* Main Content */}
      <Container size="lg">
        <div className="flex flex-col justify-center min-h-screen py-12">
          
          {/* Hero Section */}
          <div className={`text-center ${hasSearched ? 'mb-12' : 'mb-24'} transition-all duration-500`}>
            {!hasSearched ? (
              <div className="space-y-12 animate-fade-in">
                {/* Logo */}
                <div className="space-y-6">
                  <Display size="xl" className="text-sage-800 tracking-wider">
                    Sage
                  </Display>
                  
                  <Body size="lg" color="secondary">
                    Powered by <span className="text-sage-600 font-semibold">Green Valley Hemp</span>
                  </Body>
                  
                  <div className="space-y-2">
                    <Heading level={2} size="xl" className="text-sage-800 font-light tracking-wide">
                      Your AI Hemp Guide
                    </Heading>
                    <Body size="lg" color="tertiary">
                      ✨ Personalized • Private • Instant
                    </Body>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                  {[
                    { icon: '🧠', label: 'AI-Powered', desc: 'Smart recommendations' },
                    { icon: '🔒', label: '100% Private', desc: 'Your questions stay safe' },
                    { icon: '⚡', label: 'Instant Help', desc: 'Available 24/7' }
                  ].map((item, index) => (
                    <div key={index} className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-500 rounded-full flex items-center justify-center mx-auto shadow-md hover:scale-110 transition-transform duration-300">
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <Body size="sm" className="font-medium">{item.label}</Body>
                      <Body size="sm" color="tertiary">{item.desc}</Body>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center shadow-md animate-gentle-bounce">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <Heading level={1} size="lg" className="text-sage-800">Sage is thinking...</Heading>
              </div>
            )}
          </div>

          {/* Input Section */}
          <Card variant="elevated" className="max-w-2xl mx-auto mb-12">
            <CardContent className="space-y-6">
              {!hasSearched && (
                <div className="text-center space-y-4">
                  <Heading level={3} size="md" className="text-sage-800">
                    What's on your mind today?
                  </Heading>
                  <Body color="secondary">
                    Your AI hemp guide is ready to help ✨
                  </Body>
                </div>
              )}
              
              <div className="space-y-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={hasSearched ? "Ask anything else..." : "I can't sleep... I'm stressed... What helps with pain?"}
                  className="text-center text-lg py-4"
                />
                
                <div className="flex justify-center">
                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isLoading}
                    loading={isLoading}
                    size="lg"
                    className="px-12"
                  >
                    {isLoading ? 'Sage is thinking...' : 'Ask Sage'}
                  </Button>
                </div>

                {!hasSearched && (
                  <div className="text-center space-y-2 opacity-60">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-success rounded-full animate-gentle-bounce" />
                      <Body size="sm" color="tertiary">Private & secure • No judgment • Expert knowledge</Body>
                      <div className="w-2 h-2 bg-sage-400 rounded-full animate-gentle-bounce" />
                    </div>
                    <Body size="sm" color="disabled" className="italic">
                      Join thousands who've found their perfect hemp solution 🌱
                    </Body>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Section */}
          {hasSearched && explanation && (
            <Card hover className="max-w-3xl mx-auto animate-slide-up">
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center shadow-md">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <Body size="lg" className="leading-relaxed">
                      {explanation}
                    </Body>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-sage-500 rounded-full animate-gentle-bounce" />
                      <Body size="sm" color="secondary" className="font-medium">
                        Sage's insight for you
                      </Body>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </Container>
    </div>
  )
}