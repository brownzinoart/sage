'use client'

import { useState } from 'react'
import { Leaf } from 'lucide-react'
import LoadingScreen from './ui/LoadingScreen'
// Typography components will be implemented in next phase

const examplePrompts = [
  "what is thca?",
  "whats best for a cookout?", 
  "i cant sleep!",
  "what are NC's regulations?"
]

const experienceLevels = [
  {
    id: 'new',
    label: 'New',
    description: 'First time with hemp products',
    icon: '🌱'
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Some experience, want guidance',
    icon: '🌿'
  },
  {
    id: 'experienced',
    label: 'Experienced',
    description: 'Know what works, want options',
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
  const [demoProducts, setDemoProducts] = useState([
    {
      id: 1,
      name: "Night Time CBD Gummies",
      description: "5mg CBD + 2mg CBN per gummy. Infused with lavender for peaceful sleep.",
      price: "$28",
      category: "Sleep"
    },
    {
      id: 2, 
      name: "Calm Tincture",
      description: "Full spectrum CBD oil with chamomile. Start with 0.5ml under tongue.",
      price: "$45",
      category: "Tinctures"
    },
    {
      id: 3,
      name: "Dream Tea Blend", 
      description: "Hemp flower tea with passionflower and lemon balm. Caffeine-free.",
      price: "$18",
      category: "Tea"
    }
  ])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    console.log('Starting search with query:', searchQuery)
    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sage/ask`
      console.log('Making request to:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          experience_level: selectedExperience || 'casual'
        }),
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data)
        setExplanation(data.explanation)
        setDemoProducts(data.products)
      } else {
        console.error('API response not OK:', response.status)
        setExplanation('For sleep support, CBD and CBN work together to promote relaxation. Look for products with calming terpenes like myrcene and linalool for the most restful experience.')
      }
    } catch (error) {
      console.error('Error calling Sage API:', error)
      setExplanation('For sleep support, CBD and CBN work together to promote relaxation. Look for products with calming terpenes like myrcene and linalool for the most restful experience.')
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
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${3 + Math.random() * 2}s`
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
                  <h1 className="text-8xl font-light text-white tracking-wider mb-2 group-hover:text-emerald-300 transition-all duration-500" 
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        letterSpacing: '0.15em',
                        textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(255,255,255,0.1)'
                      }}>
                    Sage
                  </h1>
                  
                  {/* Powered by directly under logo */}
                  <div className="mb-6">
                    <p className="text-lg text-slate-200 font-medium"
                       style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>
                      Powered by <span className="text-emerald-300 font-semibold">Green Valley Hemp</span>
                    </p>
                  </div>
                  
                  {/* Magical sparkles around the logo */}
                  <div className="logo-particle absolute -top-4 -left-4 w-3 h-3 bg-emerald-400 rounded-full opacity-60 group-hover:animate-ping"></div>
                  <div className="logo-particle absolute -top-2 -right-8 w-2 h-2 bg-orange-400 rounded-full opacity-50 group-hover:animate-ping" style={{animationDelay: '0.2s'}}></div>
                  <div className="logo-particle absolute -bottom-6 left-8 w-2 h-2 bg-emerald-300 rounded-full opacity-70 group-hover:animate-ping" style={{animationDelay: '0.4s'}}></div>
                  <div className="logo-particle absolute -bottom-4 -right-2 w-1 h-1 bg-orange-300 rounded-full opacity-60 group-hover:animate-ping" style={{animationDelay: '0.6s'}}></div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-3xl text-slate-100 font-light tracking-widest group-hover:text-emerald-300 transition-all duration-500" 
                     style={{textShadow: '0 2px 6px rgba(0,0,0,0.4)'}}>
                    Your AI Hemp Guide
                  </p>
                  <p className="text-xl text-slate-200 font-light" 
                     style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                    ✨ Personalized • Private • Instant
                  </p>
                </div>
              </div>

              {/* Confidence builders */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center space-y-2 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <p className="text-sm font-medium text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>AI-Powered</p>
                  <p className="text-xs text-slate-200" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>Smart recommendations</p>
                </div>
                <div className="text-center space-y-2 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <p className="text-sm font-medium text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>100% Private</p>
                  <p className="text-xs text-slate-200" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>Your questions stay safe</p>
                </div>
                <div className="text-center space-y-2 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <p className="text-sm font-medium text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>Instant Help</p>
                  <p className="text-xs text-slate-200" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>Available 24/7</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-light text-slate-800 tracking-wide">Sage is thinking...</h1>
            </div>
          )}
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
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/20 to-emerald-50/30 rounded-3xl blur-xl transform scale-110 group-hover:scale-105 transition-transform duration-500"></div>
              
              {/* Main input card with texture */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/50 group-hover:shadow-emerald-500/20 transition-all duration-500"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 50%, rgba(16,185,129,0.05) 100%)'
                   }}>
                
                <div className="space-y-8">
                  {!hasSearched && (
                    <div className="text-center space-y-6">
                      <div className="relative inline-block">
                        <p className="text-2xl text-slate-800 font-light relative z-10" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
                          What's on your mind today?
                        </p>
                        {/* Kinetic underline effect */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                      </div>
                      <p className="text-sm text-slate-600 opacity-90" style={{textShadow: '0 1px 2px rgba(0,0,0,0.2)'}}>
                        Your AI hemp guide is ready to help ✨
                      </p>
                      
                      {/* Magical experience level selector */}
                      <div className="flex justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-500">
                        {experienceLevels.map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setSelectedExperience(level.id)}
                            className={`group/level relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                              selectedExperience === level.id
                                ? 'bg-emerald-100/80 text-emerald-700 shadow-lg scale-105'
                                : 'bg-white/40 text-slate-600 hover:bg-white/60 hover:scale-105'
                            }`}
                          >
                            <span className="relative z-10">{level.icon} {level.label}</span>
                            {selectedExperience === level.id && (
                              <div className="absolute inset-0 bg-emerald-200/50 rounded-full animate-pulse"></div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      {selectedExperience && (
                        <p className="text-xs text-emerald-600/80 animate-fade-in">
                          Perfect! Sage will tailor responses for your {experienceLevels.find(l => l.id === selectedExperience)?.description.toLowerCase()} 🎯
                        </p>
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
                        placeholder={hasSearched ? "Ask anything else..." : "I can't sleep... I'm stressed... What helps with pain?"}
                        className="w-full bg-transparent text-2xl text-slate-800 placeholder-slate-400/50 focus:outline-none font-light text-center py-6 px-4 transition-all duration-300"
                      />
                      
                      {/* Animated underline that responds to typing */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-full transition-all duration-500 w-0 group-focus-within/input:w-3/4 opacity-0 group-focus-within/input:opacity-100"></div>
                      
                      {/* Floating character count for engagement */}
                      {searchQuery.length > 0 && (
                        <div className="absolute -bottom-8 right-4 text-xs text-emerald-600/60 animate-fade-in">
                          {searchQuery.length} characters • Keep going! 💫
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim() || isLoading}
                      className="group/btn relative px-16 py-5 text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-full disabled:opacity-50 transition-all duration-500 font-medium text-lg shadow-2xl hover:shadow-emerald-500/40 transform hover:scale-105 disabled:transform-none overflow-hidden"
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
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Private & secure</span>
                        <div className="w-1 h-1 bg-slate-300 rounded-full mx-2"></div>
                        <span>No judgment</span>
                        <div className="w-1 h-1 bg-slate-300 rounded-full mx-2"></div>
                        <span>Expert knowledge</span>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-xs text-slate-400 italic">
                        Join thousands who've found their perfect hemp solution 🌱
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sage's Response */}
        {hasSearched && explanation && (
          <div className="mb-16 animate-slide-up">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl shadow-black/10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg text-slate-700 leading-relaxed font-medium mb-4">
                      {explanation}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Sage's insight for you</span>
                      </div>
                      <button 
                        onClick={() => setShowDetailedEducation(!showDetailedEducation)}
                        className="text-sm text-emerald-700 hover:text-emerald-800 font-medium px-3 py-1 rounded-lg hover:bg-emerald-50 transition-all duration-200"
                      >
                        {showDetailedEducation ? 'Show less' : 'Learn more'}
                      </button>
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

        {/* Products */}
        {hasSearched && (
          <div className="space-y-8 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="text-center">
              <h3 className="text-2xl font-light text-slate-800 mb-3">
                Thoughtfully selected for you
              </h3>
              <p className="text-slate-500">Based on our conversation, here's what I recommend</p>
            </div>
            
            <div className="grid gap-6">
              {demoProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="group bg-white/85 backdrop-blur-md border border-white/30 rounded-2xl p-6 hover:shadow-xl hover:shadow-black/15 transition-all duration-500 hover:border-emerald-200 hover:bg-white/95 transform hover:-translate-y-1"
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <div className="flex gap-6">
                    <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                      <Leaf className="w-8 h-8 text-emerald-600" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xl font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors">
                          {product.name}
                        </h4>
                        <div className="text-right">
                          <span className="text-xl font-bold text-emerald-700">{product.price}</span>
                          <p className="text-xs text-slate-500">{product.category}</p>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 leading-relaxed">
                        {product.description}
                      </p>
                      
                      {product.potency && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="font-medium">Potency:</span> {product.potency}
                        </div>
                      )}
                      
                      {product.why_recommended && (
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-4 border-l-4 border-blue-400 mb-3">
                          <div className="flex items-start gap-2">
                            <span className="text-blue-600 text-lg">💡</span>
                            <div>
                              <p className="text-sm font-medium text-blue-800 mb-1">Why this matches your search</p>
                              <p className="text-sm text-blue-700">{product.why_recommended}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {product.usage_tip && (
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-lg p-4 border-l-4 border-emerald-400">
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-600 text-lg">🌿</span>
                            <div>
                              <p className="text-sm font-medium text-emerald-800 mb-1">Sage's guidance</p>
                              <p className="text-sm text-emerald-700">{product.usage_tip}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-slate-500">Lab tested & NC compliant</span>
                        </div>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                          Learn more
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-8">
              <p className="text-slate-500 text-sm italic">
                Questions about any of these? Just ask - I'm here to help guide your wellness journey.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}