'use client'

import { useState } from 'react'
import { Leaf } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-slate-50/50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative max-w-3xl mx-auto px-8 py-20">
        
        {/* Logo - Always visible, smaller when searched */}
        <div className={`text-center ${hasSearched ? 'mb-12' : 'mb-24'} transition-all duration-700 ease-out`}>
          <div className={`relative inline-flex items-center justify-center mb-8 ${hasSearched ? 'w-16 h-16' : 'w-24 h-24'} transition-all duration-700 ease-out`}>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full p-4 shadow-lg shadow-emerald-500/25">
              <Leaf className={`text-white ${hasSearched ? 'w-8 h-8' : 'w-12 h-12'} transition-all duration-700 ease-out`} />
            </div>
          </div>
          
          <h1 className={`font-light text-slate-800 tracking-tight transition-all duration-700 ease-out ${hasSearched ? 'text-3xl mb-4' : 'text-6xl mb-6'}`} style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
            Sage
          </h1>
          
          {!hasSearched && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <p className="text-2xl text-slate-600 font-light">
                  Your wise guide to hemp wellness
                </p>
                <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Ask me anything about CBD, hemp products, or natural wellness. I'm here to help you find what works for you.
                </p>
              </div>
              
              {/* Experience Level Selector */}
              <div className="max-w-2xl mx-auto">
                <p className="text-slate-600 mb-4 font-medium text-center">
                  Help me tailor my guidance for you:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => {
                        console.log('Experience level clicked:', level.id);
                        setSelectedExperience(level.id);
                      }}
                      className={`relative z-10 p-4 text-center border-2 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer touch-manipulation ${
                        selectedExperience === level.id
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20'
                          : 'border-slate-200 bg-white/60 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{level.icon}</div>
                      <div className="text-sm font-semibold text-slate-800 mb-1">{level.label}</div>
                      <div className="text-xs text-slate-500">{level.description}</div>
                    </button>
                  ))}
                </div>
                {selectedExperience && (
                  <p className="text-center text-sm text-emerald-700 mt-3 animate-fade-in">
                    Perfect! I'll adjust my responses for your experience level.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-8 shadow-xl shadow-emerald-500/10">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What brings you to Sage today?"
                  className="flex-1 bg-transparent text-xl text-slate-800 placeholder-slate-400 focus:outline-none font-light"
                />
              </div>
              
              {!hasSearched && (
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isLoading}
                  className="mt-6 w-full px-8 py-4 text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Connecting with Sage...
                    </div>
                  ) : (
                    'Ask Sage'
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Example prompts */}
          {!hasSearched && (
            <div className="mt-12 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
              <p className="text-slate-500 mb-6 text-lg font-medium">
                Not sure where to start? Try one of these:
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(prompt)}
                    className="group p-4 text-left bg-white/60 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:bg-emerald-500 transition-colors"></div>
                      <span className="text-slate-700 font-medium group-hover:text-emerald-800 transition-colors">
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="mt-8 text-sm text-slate-400 italic">
                Each question helps me understand how to best support your wellness journey
              </p>
            </div>
          )}
        </div>

        {/* Sage's Response */}
        {hasSearched && explanation && (
          <div className="mb-16 animate-slide-up">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-8 shadow-xl">
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
                  className="group bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 hover:border-emerald-200 hover:bg-white/95 transform hover:-translate-y-1"
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