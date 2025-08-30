'use client'

import { useState, useEffect } from 'react'
import { Leaf, BookOpen } from 'lucide-react'
import LoadingScreen from './ui/LoadingScreen'
import ResearchOverlay from './chat/ResearchOverlay'
import { EducationalResources, EducationalSummary } from '@/types'
// Typography components will be implemented in next phase

// Experience-based rotating prompts
const promptExamples = {
  new: [
    "What's the best indica for beginners?",
    "I'm new to cannabis - help me choose a strain", 
    "Difference between indica and sativa?",
    "Low-THC strains for first-time users?",
    "What are terpenes and how do they affect me?",
    "First-time dispensary visit - what should I know?"
  ],
  casual: [
    "What indica strains help with sleep?",
    "Best hybrid for anxiety relief?",
    "Energizing sativa recommendations?",
    "Good strains for social situations?",
    "Best daytime cannabis products?",
    "Weekend relaxation strain suggestions?"
  ],
  experienced: [
    "Highest THC flower available?",
    "Any 25%+ THC indica strains?",
    "Live resin and rosin concentrates?",
    "Premium vape cartridge options?",
    "Strongest edibles in stock?",
    "Exclusive or rare strain drops?"
  ],
  general: [
    "Cannabis for sleep problems...",
    "What strains help with anxiety?",
    "Best cannabis for pain relief?",
    "Strains for deep relaxation?",
    "Cannabis for focus and creativity?",
    "What's popular at the dispensary?"
  ]
}

const experienceLevels = [
  {
    id: 'new',
    label: 'New',
    description: 'First time with cannabis',
    icon: '🌱'
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Some experience, exploring options',
    icon: '🌿'
  },
  {
    id: 'experienced',
    label: 'Experienced',
    description: 'Cannabis connoisseur',
    icon: '🧠'
  }
]

export default function SageApp() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedExperience, setSelectedExperience] = useState('')
  const [showDetailedEducation, setShowDetailedEducation] = useState(false)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [educationalResources, setEducationalResources] = useState<EducationalResources | null>(null)
  const [educationalSummary, setEducationalSummary] = useState<EducationalSummary | null>(null)
  const [researchOverlayOpen, setResearchOverlayOpen] = useState(false)
  const [particles, setParticles] = useState<Array<{left: string, top: string, delay: string, duration: string}>>([])

  // Initialize particles on client side only
  useEffect(() => {
    const particleData = Array.from({ length: 12 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${3 + Math.random() * 2}s`
    }))
    setParticles(particleData)
    
    // Suppress browser extension errors in console
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.toString?.().includes('browser extension') || 
          args[0]?.toString?.().includes('content.1.bundle.js')) {
        return; // Ignore browser extension errors
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError; // Restore on unmount
    };
  }, [])

  // Debug: Log loading state changes
  useEffect(() => {
    console.log('Loading state changed:', isLoading)
  }, [isLoading])

  // Safety: Reset loading state on mount
  useEffect(() => {
    setIsLoading(false)
  }, [])
  const [demoProducts, setDemoProducts] = useState<any[]>([])

  // Get current prompt examples based on experience level
  const getCurrentPrompts = () => {
    if (selectedExperience && promptExamples[selectedExperience as keyof typeof promptExamples]) {
      return promptExamples[selectedExperience as keyof typeof promptExamples]
    }
    return promptExamples.general
  }

  // Get current placeholder text
  const getCurrentPlaceholder = () => {
    const prompts = getCurrentPrompts()
    return prompts[currentPromptIndex] || prompts[0]
  }

  // Rotate prompts every 3 seconds when not searching and not focused
  useEffect(() => {
    if (!hasSearched) {
      const interval = setInterval(() => {
        setCurrentPromptIndex((prev) => {
          const prompts = getCurrentPrompts()
          return (prev + 1) % prompts.length
        })
      }, 3000) // Rotate every 3 seconds

      return () => clearInterval(interval)
    }
  }, [selectedExperience, hasSearched])

  // Reset prompt index when experience level changes
  useEffect(() => {
    setCurrentPromptIndex(0)
  }, [selectedExperience])

  // Function to fetch products directly from backend
  const fetchBackendProducts = async (query: string) => {
    try {
      console.log('Fetching products from backend for:', query)
      const response = await fetch('http://localhost:8000/api/v1/products/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 5
        }),
      })
      
      if (response.ok) {
        const products = await response.json()
        console.log('Backend products:', products)
        // Transform backend products to match expected format
        const transformedProducts = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          brand: product.brand || 'ZenLeaf',
          description: product.description,
          price: `$${product.price}`,
          category: product.strain_type ? product.strain_type.charAt(0).toUpperCase() + product.strain_type.slice(1) : 'Cannabis',
          thc_percentage: product.thc_percentage,
          cbd_percentage: product.cbd_percentage,
          dominant_terpene: product.dominant_terpene,
          effects: product.effects,
          terpenes: product.terpenes,
          lab_tested: product.lab_tested,
          lab_report_url: product.lab_report_url,
          match_score: product.match_score,
          strain_type: product.strain_type,
          product_type: product.product_type,
          batch_number: product.batch_number,
          harvest_date: product.harvest_date
        }))
        setDemoProducts(transformedProducts)
      } else {
        console.error('Backend products API failed:', response.status)
        // Fallback to all products if search fails
        const allProductsResponse = await fetch('http://localhost:8000/api/v1/products/')
        if (allProductsResponse.ok) {
          const allProducts = await allProductsResponse.json()
          const transformedProducts = allProducts.slice(0, 3).map((product: any) => ({
            id: product.id,
            name: product.name,
            brand: product.brand || 'ZenLeaf',
            description: product.description,
            price: `$${product.price}`,
            category: product.strain_type ? product.strain_type.charAt(0).toUpperCase() + product.strain_type.slice(1) : 'Cannabis',
            thc_percentage: product.thc_percentage,
            cbd_percentage: product.cbd_percentage,
            dominant_terpene: product.dominant_terpene,
            effects: product.effects,
            terpenes: product.terpenes,
            lab_tested: product.lab_tested,
            lab_report_url: product.lab_report_url,
            strain_type: product.strain_type,
            product_type: product.product_type,
            batch_number: product.batch_number,
            harvest_date: product.harvest_date
          }))
          setDemoProducts(transformedProducts)
        }
      }
    } catch (error) {
      console.error('Error fetching backend products:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    console.log('Starting search with query:', searchQuery)
    setIsLoading(true)
    setHasSearched(true)
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Search timeout - resetting loading state')
      setIsLoading(false)
    }, 15000) // 15 second timeout
    
    try {
      // Check if in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
      const backendUrl = 'http://localhost:8000/api/v1/sage/ask'
      
      let apiUrl = isDevelopment ? '/api/sage' : '/.netlify/functions/sage'
      let requestBody = { 
        query: searchQuery,
        experience_level: selectedExperience || 'casual'
      }
      
      // Try to use backend API in development if available
      if (isDevelopment) {
        try {
          const healthCheck = await fetch('http://localhost:8000/health', { 
            method: 'GET',
            signal: AbortSignal.timeout(2000) // 2 second timeout
          })
          if (healthCheck.ok) {
            apiUrl = backendUrl
            console.log('Using backend API for development')
          } else {
            console.log('Backend not available, using Next.js API route')
          }
        } catch {
          console.log('Backend not available, using Next.js API route')
        }
      }
      
      console.log('Making request to:', apiUrl)
      
      if (!apiUrl || apiUrl.includes('undefined')) {
        throw new Error('API URL is not configured properly')
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data)
        console.log('Full explanation text:', data.explanation)
        
        // Use the Gemini-generated explanation (now that API is working properly)
        setExplanation(data.explanation || `I can help you find the perfect cannabis strain for your needs. Let me search our ZenLeaf selection.`)
        
        // Always fetch our NJ cannabis products regardless of Sage response
        await fetchBackendProducts(searchQuery)
        
        if (data.educational_resources) {
          setEducationalResources(data.educational_resources)
        }
        if (data.educational_summary) {
          setEducationalSummary(data.educational_summary)
        }
        
        // Scroll to top when recommendations appear
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        console.error('API response not OK:', response.status)
        setExplanation('I can help you find the perfect cannabis strain for your needs. Let me search our available products.')
        // Fetch products directly from backend when Sage API fails
        await fetchBackendProducts(searchQuery)
        // Scroll to top for fallback response too
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      console.error('Error calling Sage API:', error)
      setExplanation('I can help you find the perfect cannabis strain for your needs. Let me search our available products.')
      // Fetch products directly from backend when error occurs
      await fetchBackendProducts(searchQuery)
      // Scroll to top for error fallback too
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
      console.log('Search completed, loading state reset')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
         style={{
           background: `
             radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.12) 0%, transparent 40%),
             radial-gradient(circle at 75% 25%, rgba(251, 146, 60, 0.1) 0%, transparent 40%),
             radial-gradient(circle at 50% 75%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
             radial-gradient(circle at 20% 60%, rgba(236, 72, 153, 0.06) 0%, transparent 35%),
             linear-gradient(135deg, 
               rgba(30, 41, 59, 0.95) 0%,
               rgba(51, 65, 85, 0.92) 25%,
               rgba(71, 85, 105, 0.88) 50%,
               rgba(51, 65, 85, 0.92) 75%,
               rgba(30, 41, 59, 0.95) 100%
             )
           `,
         }}>
      
      {/* Fun abstract floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs with gentle movement */}
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 rounded-full blur-2xl animate-pulse" 
             style={{animation: 'float 6s ease-in-out infinite'}}>
        </div>
        <div className="absolute top-1/3 right-1/5 w-24 h-24 bg-gradient-to-br from-orange-400/25 to-orange-600/15 rounded-full blur-xl animate-pulse" 
             style={{animation: 'float 8s ease-in-out infinite reverse', animationDelay: '2s'}}>
        </div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-600/10 rounded-full blur-xl animate-pulse" 
             style={{animation: 'float 7s ease-in-out infinite', animationDelay: '4s'}}>
        </div>
        
        {/* Medium floating shapes */}
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-pink-400/25 to-pink-600/15 rounded-full blur-lg" 
             style={{animation: 'drift 12s linear infinite'}}>
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-blue-600/10 rounded-full blur-lg" 
             style={{animation: 'drift 15s linear infinite reverse', animationDelay: '3s'}}>
        </div>
        
        {/* Small sparkly particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'bg-emerald-400/30' : 
              i % 3 === 1 ? 'bg-orange-400/25' : 'bg-purple-400/20'
            }`}
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 6}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
        
        {/* Gentle geometric shapes */}
        <div className="absolute top-1/6 right-1/6 w-6 h-6 bg-emerald-300/20 transform rotate-45" 
             style={{animation: 'gentleRotate 20s linear infinite'}}>
        </div>
        <div className="absolute bottom-1/6 left-1/4 w-4 h-4 bg-orange-300/25 rounded-full" 
             style={{animation: 'float 9s ease-in-out infinite', animationDelay: '1s'}}>
        </div>
        <div className="absolute top-3/4 right-1/2 w-5 h-5 bg-purple-300/20 transform rotate-12" 
             style={{animation: 'gentleRotate 25s linear infinite reverse'}}>
        </div>
      </div>
      
      {/* Subtle noise texture for lo-fi feel */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <LoadingScreen 
          message="Sage is analyzing your question..." 
          fullScreen={true}
          onCancel={() => {
            console.log('User cancelled search')
            setIsLoading(false)
          }}
        />
      )}
      
      {/* Main content container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
        
        {/* Magical hero section */}
        <div className={`text-center ${hasSearched ? 'mb-16' : 'mb-32'} transition-all duration-1000 ease-out`}>
          {!hasSearched ? (
            <div className="space-y-16 animate-fade-in">
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse"
                    style={{
                      left: particle.left,
                      top: particle.top,
                      animationDelay: particle.delay,
                      animationDuration: particle.duration
                    }}
                  />
                ))}
              </div>
              
              {/* Interactive Sage wordmark */}
              <div className="space-y-8 group cursor-pointer" onClick={() => {
                // Add a little delight when they click the logo
                const elements = document.querySelectorAll('.logo-particle');
                elements.forEach((el, i) => {
                  setTimeout(() => {
                    el.classList.add('animate-bounce');
                    setTimeout(() => el.classList.remove('animate-bounce'), 600);
                  }, i * 100);
                });
              }}>
                <div className="relative">
                  <h1 className="text-8xl font-display font-semibold text-white tracking-wide mb-2 group-hover:text-emerald-300 transition-all duration-500" 
                      style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        letterSpacing: '0.08em',
                        textShadow: '0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(255,255,255,0.15)'
                      }}>
                    Sage
                  </h1>
                  
                  {/* Powered by directly under logo */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-3">
                      <img 
                        src="/images/zen-leaf-philadelphia-logo.png" 
                        alt="ZenLeaf" 
                        className="h-8 w-auto filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                      />
                      <p className="text-lg text-slate-200 font-medium"
                         style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>
                        Powered by ZenLeaf
                      </p>
                    </div>
                    <p className="text-sm text-slate-300 mt-2">
                      🌿 Premium Cannabis Dispensary • Legal Cannabis • Philadelphia Area
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      21+ Adult Use • Medical & Recreational • Premium Cannabis Products
                    </p>
                  </div>
                  
                  {/* Magical sparkles around the logo */}
                  <div className="logo-particle absolute -top-4 -left-4 w-3 h-3 bg-emerald-400 rounded-full opacity-60 group-hover:animate-ping"></div>
                  <div className="logo-particle absolute -top-2 -right-8 w-2 h-2 bg-orange-400 rounded-full opacity-50 group-hover:animate-ping" style={{animationDelay: '0.2s'}}></div>
                  <div className="logo-particle absolute -bottom-6 left-8 w-2 h-2 bg-emerald-300 rounded-full opacity-70 group-hover:animate-ping" style={{animationDelay: '0.4s'}}></div>
                  <div className="logo-particle absolute -bottom-4 -right-2 w-1 h-1 bg-orange-300 rounded-full opacity-60 group-hover:animate-ping" style={{animationDelay: '0.6s'}}></div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-3xl text-slate-100 font-medium tracking-wide group-hover:text-emerald-300 transition-all duration-500" 
                     style={{
                       fontFamily: 'var(--font-poppins), system-ui, sans-serif',
                       textShadow: '0 2px 6px rgba(0,0,0,0.4)'
                     }}>
                    Your AI Cannabis Guide for NJ
                  </p>
                  <p className="text-xl text-slate-200 font-medium" 
                     style={{
                       fontFamily: 'var(--font-poppins), system-ui, sans-serif',
                       textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                     }}>
                    ✨ THC & CBD • NJ Legal • Expert Guidance
                  </p>
                </div>
              </div>

              {/* Confidence builders */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center space-y-2 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🌿</span>
                  </div>
                  <p className="text-sm font-semibold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>Premium Cannabis</p>
                  <p className="text-xs font-medium text-slate-200" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>Indica • Sativa • Hybrid</p>
                </div>
                <div className="text-center space-y-2 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <p className="text-sm font-semibold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>Legal Cannabis</p>
                  <p className="text-xs font-medium text-slate-200" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>21+ Adult Use</p>
                </div>
                <div className="text-center space-y-2 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <p className="text-sm font-semibold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>Expert Guidance</p>
                  <p className="text-xs font-medium text-slate-200" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>Cannabis education</p>
                </div>
              </div>
            </div>
          ) : hasSearched && !isLoading ? (
            // Show minimal header after search is complete
            <div className="flex items-center gap-3 justify-center opacity-80">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-light text-white tracking-wide" style={{textShadow: '0 1px 3px rgba(0,0,0,0.4)'}}>
                Sage's Recommendations
              </h1>
            </div>
          ) : null}
        </div>

        {/* Magical input section with 2025 trends */}
        <div className="mb-20">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              {/* Floating magical orbs around input */}
              <div className="absolute -inset-8 pointer-events-none">
                <div className="absolute top-0 left-4 w-4 h-4 bg-emerald-400/40 rounded-full animate-pulse blur-sm"></div>
                <div className="absolute top-8 right-8 w-3 h-3 bg-orange-400/40 rounded-full animate-pulse blur-sm" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-4 left-12 w-2 h-2 bg-emerald-300/40 rounded-full animate-pulse blur-sm" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-12 right-4 w-3 h-3 bg-orange-300/40 rounded-full animate-pulse blur-sm" style={{animationDelay: '0.5s'}}></div>
              </div>

              {/* Progressive blur background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-emerald-500/5 to-emerald-300/8 rounded-3xl blur-xl transform scale-110 group-hover:scale-105 transition-transform duration-500"></div>
              
              {/* Main input card with glassmorphism */}
              <div className="relative backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/20 border border-white/10 group-hover:shadow-emerald-500/30 transition-all duration-500"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.12) 50%, rgba(16,185,129,0.08) 100%)'
                   }}>
                
                <div className="space-y-8">
                  {!hasSearched && (
                    <div className="text-center space-y-6">
                      <div className="relative inline-block">
                        <p className="text-2xl text-white font-semibold relative z-10" style={{
                          fontFamily: 'var(--font-poppins), system-ui, sans-serif',
                          textShadow: '0 2px 6px rgba(0,0,0,0.4)'
                        }}>
                          What's on your mind today?
                        </p>
                        {/* Kinetic underline effect */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                      </div>
                      <p className="text-sm text-slate-200 font-medium opacity-90" style={{
                        fontFamily: 'var(--font-poppins), system-ui, sans-serif',
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                      }}>
                        Your AI cannabis guide is ready to help ✨
                      </p>
                      
                      {/* Magical experience level selector */}
                      <div className="flex justify-center gap-3 opacity-80 hover:opacity-100 transition-opacity duration-500">
                        {experienceLevels.map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setSelectedExperience(level.id)}
                            className={`group/level relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                              selectedExperience === level.id
                                ? 'bg-emerald-400/20 text-emerald-200 shadow-lg scale-105 border border-emerald-300/30'
                                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:scale-105 border border-white/20'
                            }`}
                          >
                            <span className="relative z-10">{level.icon} {level.label}</span>
                            {selectedExperience === level.id && (
                              <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-pulse"></div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      {/* Cannabis Strain Type Quick Filters */}
                      {hasSearched && (
                        <div className="mt-6 animate-fade-in">
                          <p className="text-xs text-slate-300 mb-3 text-center">Filter by strain type:</p>
                          <div className="flex justify-center gap-2">
                            {['indica', 'sativa', 'hybrid'].map((strainType) => (
                              <button
                                key={strainType}
                                type="button"
                                onClick={() => fetchBackendProducts(strainType)}
                                className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-slate-300 hover:bg-emerald-400/20 hover:text-emerald-200 transition-all duration-200 border border-white/20 hover:border-emerald-300/30"
                              >
                                {strainType.charAt(0).toUpperCase() + strainType.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedExperience && (
                        <div className="animate-fade-in space-y-2">
                          <p className="text-xs text-emerald-300/90">
                            Perfect! Sage will tailor THC recommendations for your {experienceLevels.find(l => l.id === selectedExperience)?.description.toLowerCase()} 🎯
                          </p>
                          <p className="text-xs text-slate-400/70 italic">
                            Get personalized strain and product suggestions from ZenLeaf ✨
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="relative">
                    <div className="relative group/input">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          // Add micro-interaction feedback
                          if (e.target.value.length > 0) {
                            e.target.parentElement?.classList.add('has-content');
                          } else {
                            e.target.parentElement?.classList.remove('has-content');
                          }
                        }}
                        onKeyPress={handleKeyPress}
                        onFocus={(e) => {
                          // Magical focus effect
                          e.target.parentElement?.classList.add('focused');
                        }}
                        onBlur={(e) => {
                          e.target.parentElement?.classList.remove('focused');
                        }}
                        placeholder={hasSearched ? "Ask anything else..." : getCurrentPlaceholder()}
                        className="w-full bg-transparent text-2xl text-white placeholder-slate-300/60 focus:outline-none font-light text-center py-6 px-4 transition-all duration-500"
                      />
                      
                      {/* Animated underline that responds to typing */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-full transition-all duration-500 w-0 group-focus-within/input:w-3/4 opacity-0 group-focus-within/input:opacity-100"></div>
                      
                      {/* Floating character count for engagement */}
                      {searchQuery.length > 0 && (
                        <div className="absolute -bottom-8 right-4 text-xs text-emerald-300/70 animate-fade-in">
                          {searchQuery.length} characters • Keep going! 💫
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim() || isLoading}
                      className="group/btn relative px-16 py-5 text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-full disabled:opacity-50 transition-all duration-500 font-semibold text-lg shadow-2xl hover:shadow-emerald-500/40 transform hover:scale-105 disabled:transform-none overflow-hidden"
                      style={{
                        backgroundSize: '200% 100%',
                        animation: !isLoading && searchQuery.trim() ? 'gradient-shift 3s ease-in-out infinite' : 'none'
                      }}
                    >
                      {/* Magical shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover/btn:animate-pulse"></div>
                      
                      <span className="relative z-10 flex items-center gap-3">
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sage is thinking...
                          </>
                        ) : (
                          <>
                            Ask Sage
                            <span className="text-lg group-hover/btn:animate-bounce">✨</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Confidence boost for hesitant users */}
                  {!hasSearched && (
                    <div className="text-center space-y-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Private & secure</span>
                        <div className="w-1 h-1 bg-slate-400 rounded-full mx-2"></div>
                        <span>No judgment</span>
                        <div className="w-1 h-1 bg-slate-400 rounded-full mx-2"></div>
                        <span>Expert knowledge</span>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-xs text-slate-400 italic">
                        Join thousands of cannabis customers who trust ZenLeaf 🌿
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sage's Response - Enhanced Visual Section */}
        {hasSearched && explanation && (
          <div className="mb-24 animate-slide-up">
            {/* Section Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-full border border-emerald-400/30">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-light text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                  Sage's Personalized Analysis
                </h2>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-white/95 to-emerald-50/95 backdrop-blur-md border border-emerald-200/50 rounded-3xl p-10 shadow-2xl shadow-emerald-900/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="space-y-4 text-slate-700">
                      {(() => {
                        console.log('All sections:', explanation.split('\n\n').map(s => s.substring(0, 50)));
                        return null;
                      })()}
                      {explanation.split('\n\n').map((section, idx, allSections) => {
                        // Skip pathway detail sections that come after the header
                        if (idx > 0 && section.trim().startsWith('**') && 
                            !section.trim().startsWith('📚') && 
                            !section.trim().startsWith('🔬') && 
                            !section.trim().startsWith('💡') && 
                            !section.trim().startsWith('⚠️')) {
                          // Check if there's a pathway header in the previous 3 sections
                          for (let i = Math.max(0, idx - 3); i < idx; i++) {
                            if (allSections[i] && (allSections[i].trim().startsWith('🎯 **Your') || allSections[i].trim().startsWith('🎯 **Pathways'))) {
                              console.log('Skipping pathway section at index', idx);
                              return null; // Skip this section, it's part of pathways
                            }
                          }
                        }
                        
                        // Natural language intro at the top
                        if (idx === 0 && !section.trim().startsWith('📚') && !section.trim().startsWith('🔬') && !section.trim().startsWith('💡') && !section.trim().startsWith('⚠️') && !section.trim().startsWith('🎯')) {
                          return (
                            <div key={idx} className="text-lg leading-relaxed text-slate-700 mb-6">
                              {section}
                            </div>
                          )
                        }
                        
                        // New pathway options section  
                        if (section.trim().startsWith('🎯 **Your') || section.trim().startsWith('🎯 **Pathways')) {
                          // Extract just the title from the first part
                          const titleMatch = section.match(/🎯 \*\*([^*]+)\*\*/);
                          const title = titleMatch ? titleMatch[1].trim() : 'Your Options';
                          
                          console.log('Full pathway section:', section);
                          console.log('Section length:', section.length);
                          
                          // The pathways appear to be in the NEXT sections after this header
                          // Let's collect them from subsequent sections
                          const pathways: Array<{title: string, details: string[]}> = [];
                          
                          // Look at the next few sections for pathway content
                          for (let nextIdx = idx + 1; nextIdx < allSections.length && nextIdx <= idx + 3; nextIdx++) {
                            const nextSection = allSections[nextIdx];
                            console.log(`Checking section ${nextIdx} for pathways:`, nextSection?.substring(0, 80));
                            
                            if (nextSection && nextSection.trim().startsWith('**') && 
                                !nextSection.trim().startsWith('📚') && 
                                !nextSection.trim().startsWith('🔬') && 
                                !nextSection.trim().startsWith('💡') && 
                                !nextSection.trim().startsWith('⚠️')) {
                              
                              // This is a pathway section
                              const lines = nextSection.split('\n');
                              const pathwayTitle = lines[0];
                              const pathwayDetails = lines.slice(1).filter(line => line.trim());
                              
                              pathways.push({
                                title: pathwayTitle,
                                details: pathwayDetails
                              });
                              
                              console.log('Added pathway:', pathwayTitle);
                            }
                          }
                          
                          console.log('Parsed pathways:', pathways);
                          
                          return (
                            <div key={idx} className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 rounded-xl p-6 border border-emerald-200 shadow-lg shadow-emerald-100/50">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                                  <span className="text-xl">🎯</span>
                                </div>
                                <h3 className="font-bold text-emerald-900 text-xl">{title}</h3>
                              </div>
                              <div className="grid gap-4">
                                {pathways.map((pathway, pathIdx) => (
                                  <div key={pathIdx} className="group hover:scale-[1.02] transition-transform duration-200">
                                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-l-4 border-emerald-400 shadow-md hover:shadow-lg transition-shadow">
                                      <div className="font-semibold text-emerald-800 text-lg mb-2">
                                        {pathway.title.replace(/\*\*/g, '')}
                                      </div>
                                      <div className="text-sm text-slate-700 space-y-1 pl-2">
                                        {pathway.details.map((detail, detailIdx) => (
                                          <div key={detailIdx} className="flex items-start">
                                            {detail.startsWith('•') ? (
                                              <span className="text-emerald-500 mr-2">{detail.substring(0, 1)}</span>
                                            ) : null}
                                            <span>{detail.startsWith('•') ? detail.substring(1).trim() : detail}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        }
                        
                        if (section.trim().startsWith('🌿 **Quick Answer**')) {
                          // Skip this section - we don't want the Quick Answer card
                          return null
                        }
                        
                        if (section.trim().startsWith('📚 **Key Benefits**')) {
                          return (
                            <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-md">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow">
                                  <span className="text-lg">📚</span>
                                </div>
                                <h3 className="font-bold text-blue-900 text-lg">Key Benefits</h3>
                              </div>
                              <div className="text-blue-800 space-y-2 pl-2">
                                {section.split('\n').slice(1).map((line, lineIdx) => 
                                  line.trim().startsWith('•') ? (
                                    <div key={lineIdx} className="flex items-start gap-2">
                                      <span className="text-blue-500 mt-1">•</span>
                                      <span className="text-sm">{line.replace('•', '').trim()}</span>
                                    </div>
                                  ) : null
                                )}
                              </div>
                            </div>
                          )
                        }
                        
                        if (section.trim().startsWith('🔬 **Research Insights**')) {
                          return (
                            <div key={idx} className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-200 shadow-md">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-start gap-2">
                                  <span className="text-xl">🔬</span>
                                  <h3 className="font-bold text-purple-800 text-lg">Research Insights</h3>
                                </div>
                                {educationalResources?.research_studies?.papers?.length && (
                                  <button
                                    onClick={() => setResearchOverlayOpen(true)}
                                    className="text-xs text-purple-600 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded-full transition-colors"
                                  >
                                    View {educationalResources.research_studies.papers.length} Studies
                                  </button>
                                )}
                              </div>
                              <div className="text-purple-700 space-y-1">
                                {section.split('\n').slice(1).map((line, lineIdx) => 
                                  line.trim().startsWith('•') ? (
                                    <div key={lineIdx} className="flex items-start gap-2">
                                      <span className="text-purple-600 mt-1">•</span>
                                      <span>{line.replace('•', '').trim()}</span>
                                    </div>
                                  ) : null
                                )}
                              </div>
                            </div>
                          )
                        }
                        
                        if (section.trim().startsWith('💡 **How to Use**')) {
                          return (
                            <div key={idx} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="text-xl">💡</span>
                                <h3 className="font-bold text-orange-800 text-lg">How to Use</h3>
                              </div>
                              <div className="text-orange-700 space-y-1">
                                {section.split('\n').slice(1).map((line, lineIdx) => 
                                  line.trim().startsWith('•') ? (
                                    <div key={lineIdx} className="flex items-start gap-2">
                                      <span className="text-orange-600 mt-1">•</span>
                                      <span>{line.replace('•', '').trim()}</span>
                                    </div>
                                  ) : null
                                )}
                              </div>
                            </div>
                          )
                        }
                        
                        if (section.trim().startsWith('⚠️ **Important Notes**')) {
                          return (
                            <div key={idx} className="bg-red-50 rounded-lg p-4 border border-red-200">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="text-xl">⚠️</span>
                                <h3 className="font-bold text-red-800 text-lg">Important Notes</h3>
                              </div>
                              <div className="text-red-700 space-y-1">
                                {section.split('\n').slice(1).map((line, lineIdx) => 
                                  line.trim().startsWith('•') ? (
                                    <div key={lineIdx} className="flex items-start gap-2">
                                      <span className="text-red-600 mt-1">•</span>
                                      <span>{line.replace('•', '').trim()}</span>
                                    </div>
                                  ) : null
                                )}
                              </div>
                            </div>
                          )
                        }
                        
                        return null
                      })}
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Sage's insight for you</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {explanation && (
                          <button 
                            onClick={() => setResearchOverlayOpen(true)}
                            className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
                          >
                            <BookOpen className="w-4 h-4" />
                            Research Insights
                          </button>
                        )}
                        <button 
                          onClick={() => setShowDetailedEducation(!showDetailedEducation)}
                          className="text-sm text-emerald-700 hover:text-emerald-800 font-medium px-3 py-1 rounded-lg hover:bg-emerald-50 transition-all duration-200"
                        >
                          {showDetailedEducation ? 'Show less' : 'Learn more'}
                        </button>
                      </div>
                    </div>
                    
                    {showDetailedEducation && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-300 animate-slide-up">
                        <h4 className="text-sm font-semibold text-emerald-800 mb-2">Deep dive into the science:</h4>
                        <p className="text-sm text-emerald-700 leading-relaxed">
                          Your endocannabinoid system has receptors throughout your body that help regulate sleep, mood, and stress. CBD works by supporting this natural system without causing psychoactive effects. CBN is particularly effective for sleep because it has a stronger affinity for the CB1 receptors in your brain that control sleep cycles. The combination creates a synergistic effect that's more effective than either compound alone.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Divider */}
        {hasSearched && (
          <div className="my-16 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-emerald-400/50"></div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-emerald-400/60 rounded-full"></div>
                <div className="w-2 h-2 bg-emerald-500/60 rounded-full"></div>
                <div className="w-2 h-2 bg-emerald-400/60 rounded-full"></div>
              </div>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-emerald-400/50"></div>
            </div>
          </div>
        )}

        {/* Products Section - Clearly Separated */}
        {hasSearched && (
          <div className="space-y-8 animate-scale-in" style={{animationDelay: '0.2s'}}>
            {/* Products Header with Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-sm rounded-full border border-orange-400/30 mb-4">
                <span className="text-lg">🌿</span>
                <span className="text-sm font-medium text-orange-300">ZenLeaf Cannabis Products</span>
              </div>
              <h3 className="text-2xl font-light text-white mb-3" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                Available at ZenLeaf Dispensary - Philadelphia Area
              </h3>
              <p className="text-slate-200" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>THC & CBD products matching your needs - Visit us or order online</p>
            </div>
            
            <div className="grid gap-8">
              {demoProducts.map((product, index) => {
                // Enhanced product visuals and category mapping
                const getProductVisual = (category: string, name: string) => {
                  const visuals = {
                    'Sleep': { 
                      gradient: 'from-indigo-400 via-purple-400 to-indigo-500', 
                      icon: '🌙', 
                      bgColor: 'from-indigo-50 to-purple-50',
                      accentColor: 'indigo',
                      pattern: '🌟✨💫'
                    },
                    'Tinctures': { 
                      gradient: 'from-emerald-400 via-teal-400 to-emerald-500', 
                      icon: '💧', 
                      bgColor: 'from-emerald-50 to-teal-50',
                      accentColor: 'emerald',
                      pattern: '🌿🍃💚'
                    },
                    'Tea': { 
                      gradient: 'from-amber-400 via-orange-400 to-amber-500', 
                      icon: '🫖', 
                      bgColor: 'from-amber-50 to-orange-50',
                      accentColor: 'amber',
                      pattern: '🌸🍵☕'
                    },
                    'Gummies': { 
                      gradient: 'from-pink-400 via-rose-400 to-pink-500', 
                      icon: '🍬', 
                      bgColor: 'from-pink-50 to-rose-50',
                      accentColor: 'pink',
                      pattern: '🍓🍯🌈'
                    },
                    'default': { 
                      gradient: 'from-emerald-400 via-green-400 to-emerald-500', 
                      icon: '🌿', 
                      bgColor: 'from-emerald-50 to-green-50',
                      accentColor: 'emerald',
                      pattern: '🌱🍃💚'
                    }
                  }
                  return visuals[category as keyof typeof visuals] || visuals.default
                }

                const visual = getProductVisual(product.category, product.name)
                const accentColors = {
                  indigo: 'text-indigo-600 bg-indigo-100 border-indigo-200',
                  emerald: 'text-emerald-600 bg-emerald-100 border-emerald-200',
                  amber: 'text-amber-600 bg-amber-100 border-amber-200',
                  pink: 'text-pink-600 bg-pink-100 border-pink-200'
                }

                return (
                  <div 
                    key={product.id} 
                    className="group bg-white/90 backdrop-blur-md border border-white/40 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-black/20 transition-all duration-700 hover:border-white/60 hover:bg-white/95 transform hover:-translate-y-2 hover:scale-[1.02]"
                    style={{animationDelay: `${0.15 * index}s`}}
                  >
                    {/* Header with enhanced visual */}
                    <div className={`bg-gradient-to-r ${visual.bgColor} p-6 pb-4`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`relative w-16 h-16 bg-gradient-to-br ${visual.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-2xl">{visual.icon}</span>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                              <span className="text-xs font-bold text-gray-700">#{index + 1}</span>
                            </div>
                          </div>
                          <div>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${accentColors[visual.accentColor as keyof typeof accentColors]} border mb-2`}>
                              <span>{visual.icon}</span>
                              {product.category}
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                              {product.name}
                            </h4>
                            {/* THC Potency Indicator */}
                            {(product as any).thc_percentage && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                  (product as any).thc_percentage >= 20 
                                    ? 'bg-red-100 text-red-800 border border-red-200' 
                                    : (product as any).thc_percentage >= 15 
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                                    : 'bg-green-100 text-green-800 border border-green-200'
                                }`}>
                                  {(product as any).thc_percentage}% THC
                                </span>
                                <span className="text-xs text-gray-600">
                                  {(product as any).thc_percentage >= 20 ? 'High Potency' 
                                   : (product as any).thc_percentage >= 15 ? 'Medium Potency' 
                                   : 'Mild Potency'}
                                </span>
                              </div>
                            )}
                            {/* Strain Type Badge */}
                            {(product as any).strain_type && (
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  (product as any).strain_type === 'indica' 
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                    : (product as any).strain_type === 'sativa'
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                  {(product as any).strain_type.charAt(0).toUpperCase() + (product as any).strain_type.slice(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-800 block">{product.price}</span>
                          <span className="text-sm text-gray-600">
                            per item
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Enhanced product details */}
                    <div className="p-6 space-y-4">
                      {/* Main description with better formatting */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600">ℹ️</span>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Product Details</h5>
                            <p className="text-gray-700 leading-relaxed">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cannabinoid Profile - Disabled for build */}
                      {false && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-green-600">🧬</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-green-800 mb-3">Cannabinoid Profile</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {(product as any).cbd_mg && (product as any).cbd_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">CBD</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).cbd_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).thc_mg && (product as any).thc_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">THC</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).thc_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).delta_8_thc_mg && (product as any).delta_8_thc_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">Delta-8</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).delta_8_thc_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).delta_9_thc_mg && (product as any).delta_9_thc_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">Delta-9</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).delta_9_thc_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).delta_10_thc_mg && (product as any).delta_10_thc_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">Delta-10</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).delta_10_thc_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).hhc_mg && (product as any).hhc_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">HHC</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).hhc_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).thcp_mg && (product as any).thcp_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">THCP</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).thcp_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).thcv_mg && (product as any).thcv_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">THCV</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).thcv_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).cbg_mg && (product as any).cbg_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">CBG</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).cbg_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).cbn_mg && (product as any).cbn_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">CBN</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).cbn_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).cbc_mg && (product as any).cbc_mg > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">CBC</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).cbc_mg}mg</span>
                                  </div>
                                )}
                                {(product as any).thca_percentage && (product as any).thca_percentage > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-700">THCA</span>
                                    <span className="text-sm text-green-800 font-bold">{(product as any).thca_percentage}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Terpene Profile */}
                      {(product as any).terpenes && Object.keys((product as any).terpenes).length > 0 && (
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-orange-600">🌸</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-orange-800 mb-3">Terpene Profile</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries((product as any).terpenes).map(([terpene, amount]) => (
                                  <div key={terpene} className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-orange-700 capitalize">{terpene.replace('_', ' ')}</span>
                                    <span className="text-sm text-orange-800 font-bold">{amount as number}mg</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Effects & Benefits */}
                      {(product as any).effects && (product as any).effects.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-600">✨</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-purple-800 mb-3">Effects & Benefits</h5>
                              <div className="flex flex-wrap gap-2">
                                {(product as any).effects.map((effect: string, idx: number) => (
                                  <span 
                                    key={idx}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                                  >
                                    {effect.replace('-', ' ').replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced specs and features */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-green-600">✅</span>
                            <span className="text-xs font-semibold text-green-800">LAB TESTED</span>
                          </div>
                          <p className="text-xs text-green-700">
                            {(product as any).lab_tested ? 'Third-party verified' : 'Quality assured'}
                          </p>
                          {(product as any).lab_report_url && (
                            <a 
                              href={(product as any).lab_report_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:text-green-800 underline"
                            >
                              View COA
                            </a>
                          )}
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-600">📊</span>
                            <span className="text-xs font-semibold text-blue-800">RESEARCH</span>
                          </div>
                          <p className="text-xs text-blue-700">
                            {educationalResources?.research_studies?.papers?.length 
                              ? `${educationalResources.research_studies.papers.length} studies found`
                              : 'Evidence-based'}
                          </p>
                        </div>
                      </div>

                      {/* User connection - Why it fits their search */}
                      {(product as any).why_recommended ? (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-600">🎯</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-purple-800 mb-2">Perfect Match for \"{searchQuery}\"</h5>
                              <p className="text-sm text-purple-700 leading-relaxed">{(product as any).why_recommended}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-600">🎯</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-purple-800 mb-2">Why This Works for You</h5>
                              <p className="text-sm text-purple-700 leading-relaxed">
                                {product.category === 'Sleep' ? `Ideal for your search about better rest and relaxation. The combination of CBD and CBN specifically targets sleep receptors for natural, restorative sleep without grogginess.` :
                                 product.category === 'Tinctures' ? `Perfect for precise dosing and fast-acting relief. Tinctures offer the most control over your experience, letting you find your optimal amount quickly.` :
                                 `This ${product.category.toLowerCase()} option provides a gentle, approachable way to experience cannabis benefits with consistent, reliable effects.`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sage's usage guidance */}
                      {(product as any).usage_tip && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-emerald-600">🌿</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-emerald-800 mb-2">Sage's Pro Tips</h5>
                              <p className="text-sm text-emerald-700 leading-relaxed">{(product as any).usage_tip}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced action area */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-600">NJ Legal</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-600">THC Tested</span>
                          </div>
                        </div>
                        <a 
                          href="https://zenleaf.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-block px-6 py-3 bg-gradient-to-r ${visual.gradient} text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-semibold transform hover:scale-105 hover:-translate-y-0.5`}>
                          <span className="flex items-center gap-2">
                            Shop ZenLeaf
                            <span>🌿</span>
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Enhanced call-to-action section */}
            <div className="text-center pt-8 space-y-6">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/40">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-2xl">💬</span>
                  <h3 className="text-lg font-semibold text-slate-800">Still have questions?</h3>
                </div>
                <p className="text-slate-600 mb-4">
                  I'm here to help you find the perfect cannabis strain for your needs.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
                    onClick={() => setSearchQuery('Tell me more about dosing')}
                  >
                    💊 Dosing Questions
                  </button>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105"
                    onClick={() => setSearchQuery('How do these work together?')}
                  >
                    🔗 Product Combinations
                  </button>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
                    onClick={() => setResearchOverlayOpen(true)}
                  >
                    📚 Research & Safety
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-xs">NJ State Licensed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    <span className="text-xs">THC & CBD Products</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                    <span className="text-xs">21+ Adult Use</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-emerald-400/30">
                  <p className="text-sm text-emerald-300 font-medium">
                    🏪 Visit ZenLeaf Dispensary - Philadelphia Area • Premium Cannabis
                  </p>
                  <p className="text-xs text-slate-400 mt-1 text-center">
                    Mon-Sat: 9AM-10PM | Sun: 10AM-9PM | 
                    <a href="https://zenleaf.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline ml-1">zenleaf.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Research Overlay */}
      <ResearchOverlay
        isOpen={researchOverlayOpen}
        onClose={() => setResearchOverlayOpen(false)}
        educational_resources={educationalResources || undefined}
        educational_summary={educationalSummary || undefined}
        userQuery={searchQuery}
      />
    </div>
  )
}