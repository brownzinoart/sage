'use client'

import { useState, useEffect } from 'react'
import { Leaf, BookOpen } from 'lucide-react'
import LoadingScreen from './components/ui/LoadingScreen'
import ResearchOverlay from './components/chat/ResearchOverlay'
import { EducationalResources, EducationalSummary } from '@/types'

// THC-focused rotating prompts for Premo Cannabis
const promptExamples = {
  new: [
    "What's the difference between indica and sativa?",
    "I'm new to cannabis - where should I start?", 
    "How much THC should a beginner try?",
    "What are terpenes and why do they matter?",
    "Is THC legal in New Jersey?",
    "What's the difference between flower and concentrates?"
  ],
  casual: [
    "I can't sleep, what strain helps?",
    "What's best for stress relief?",
    "I need something for chronic pain",
    "What helps with social anxiety?",
    "Something energizing for daytime?",
    "Best products for creativity?"
  ],
  experienced: [
    "Looking for high-THC concentrates",
    "What live resin do you have?",
    "Any exotic strains available?",
    "Best terp profiles for euphoria?",
    "What's your strongest indica?",
    "Any limited drops this week?"
  ],
  general: [
    "I can't sleep...",
    "What helps with pain?",
    "Something for anxiety?",
    "Best for relaxation?",
    "Help with focus?",
    "What's good for beginners?"
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

// Premo Cannabis THC Products
const premoProducts = {
  sleep: [
    {
      id: 1,
      name: "Purple Punch",
      description: "22.5% THC Indica. Sweet grape and blueberry notes for deep relaxation.",
      price: "$55",
      category: "Flower",
      thc: "22.5%",
      strain: "Indica"
    },
    {
      id: 2,
      name: "Wedding Cake Live Resin",
      description: "78.5% THC concentrate. Premium indica extract for maximum relief.",
      price: "$70",
      category: "Concentrates",
      thc: "78.5%",
      strain: "Indica"
    },
    {
      id: 3,
      name: "Nighttime THC Gummies",
      description: "10mg THC + 5mg CBN per gummy. Extended release for all-night relief.",
      price: "$30",
      category: "Edibles",
      thc: "100mg pack"
    }
  ],
  energy: [
    {
      id: 4,
      name: "Sour Diesel",
      description: "24.8% THC Sativa. Energizing diesel aroma for creative productivity.",
      price: "$60",
      category: "Flower",
      thc: "24.8%",
      strain: "Sativa"
    },
    {
      id: 5,
      name: "Blue Dream Cartridge",
      description: "85.3% THC distillate. Balanced hybrid for smooth, uplifting effects.",
      price: "$45",
      category: "Vapes",
      thc: "85.3%",
      strain: "Hybrid"
    }
  ],
  beginner: [
    {
      id: 6,
      name: "GSC Pre-Roll Pack",
      description: "21.2% THC. Pack of 5 mini joints, 0.5g each. Perfect for sharing.",
      price: "$35",
      category: "Pre-rolls",
      thc: "21.2%",
      strain: "Hybrid"
    },
    {
      id: 7,
      name: "Watermelon Gummies",
      description: "5mg THC microdose. 20 pieces for controlled, gentle effects.",
      price: "$25",
      category: "Edibles",
      thc: "100mg pack"
    }
  ]
}

export default function SageAppPremo() {
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
  const [demoProducts, setDemoProducts] = useState(premoProducts.beginner)
  const [ageVerified, setAgeVerified] = useState(false)

  // Age verification check
  useEffect(() => {
    const verified = localStorage.getItem('age_verified_premo')
    if (verified === 'true') {
      setAgeVerified(true)
    }
  }, [])

  // Initialize particles
  useEffect(() => {
    const particleData = Array.from({ length: 12 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${3 + Math.random() * 2}s`
    }))
    setParticles(particleData)
  }, [])

  // Get current prompts
  const getCurrentPrompts = () => {
    if (selectedExperience && promptExamples[selectedExperience as keyof typeof promptExamples]) {
      return promptExamples[selectedExperience as keyof typeof promptExamples]
    }
    return promptExamples.general
  }

  const getCurrentPlaceholder = () => {
    const prompts = getCurrentPrompts()
    return prompts[currentPromptIndex] || prompts[0]
  }

  // Rotate prompts
  useEffect(() => {
    if (!hasSearched) {
      const interval = setInterval(() => {
        setCurrentPromptIndex((prev) => {
          const prompts = getCurrentPrompts()
          return (prev + 1) % prompts.length
        })
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedExperience, hasSearched])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setHasSearched(true)
    
    // Simulate AI processing with THC product matching
    setTimeout(() => {
      const query = searchQuery.toLowerCase()
      let products = premoProducts.beginner
      let response = ''
      let educationalContent = null
      
      if (query.includes('sleep') || query.includes('insomnia')) {
        products = premoProducts.sleep
        response = "For better sleep, indica strains with higher THC and CBN content work best. The sedating terpenes like myrcene and linalool enhance the relaxing effects."
        educationalContent = {
          research_sources: [
            {
              title: "Cannabis and Sleep: Clinical Studies",
              url: "https://pubmed.ncbi.nlm.nih.gov/cannabis-sleep",
              credibility_score: 0.95,
              summary: "THC has been shown to decrease sleep latency and increase deep sleep phases."
            },
            {
              title: "Indica vs Sativa for Sleep Disorders",
              url: "https://leafly.com/indica-sleep",
              credibility_score: 0.8,
              summary: "Indica strains typically contain higher myrcene levels, promoting sedation."
            }
          ],
          key_compounds: {
            "THC": "Reduces REM sleep, increases deep sleep",
            "CBN": "Sedating cannabinoid formed from aged THC",
            "Myrcene": "Terpene with sedating, muscle-relaxing properties"
          }
        }
      } else if (query.includes('energy') || query.includes('focus')) {
        products = premoProducts.energy
        response = "Sativa strains provide energizing, cerebral effects perfect for daytime use. The uplifting terpenes like limonene and pinene enhance focus and creativity."
        educationalContent = {
          research_sources: [
            {
              title: "Sativa Strains and Cognitive Function",
              url: "https://journals.com/sativa-cognition",
              credibility_score: 0.85,
              summary: "Sativa-dominant strains may enhance divergent thinking and creativity."
            }
          ],
          key_compounds: {
            "Limonene": "Mood-elevating, stress-relieving terpene",
            "Pinene": "Alertness-promoting, memory-enhancing terpene"
          }
        }
      } else if (query.includes('beginner') || query.includes('first') || query.includes('new')) {
        products = premoProducts.beginner
        response = "For beginners, start with lower THC products (15-20%) or microdosed edibles. The key is 'start low and go slow' to find your optimal dose."
        educationalContent = {
          research_sources: [
            {
              title: "Cannabis Dosing Guidelines for New Users",
              url: "https://norml.org/dosing-guide",
              credibility_score: 0.9,
              summary: "New users should start with 2.5-5mg THC for edibles, one puff for inhalables."
            }
          ],
          key_compounds: {
            "THC": "Start with products under 20% THC",
            "CBD": "Can help counteract THC anxiety"
          }
        }
      } else {
        response = "Based on your needs, here are some recommended products from our premium selection at Premo Cannabis."
      }
      
      setExplanation(response)
      setDemoProducts(products)
      if (educationalContent) {
        setEducationalResources(educationalContent as any)
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Age Gate Component
  if (!ageVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900">
        <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Leaf className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Age Verification Required</h2>
            <p className="text-gray-600">Premo Cannabis • Keyport, NJ</p>
            <p className="text-sm text-gray-500 mt-2">You must be 21+ to enter</p>
          </div>
          
          <button
            onClick={() => {
              localStorage.setItem('age_verified_premo', 'true')
              setAgeVerified(true)
            }}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all"
          >
            I am 21 or older
          </button>
          
          <button
            onClick={() => window.location.href = 'https://www.google.com'}
            className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            I am under 21
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-6">
            By entering, you agree to comply with NJ cannabis laws.
          </p>
        </div>
      </div>
    )
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
      
      {/* Loading Screen */}
      {isLoading && <LoadingScreen searchQuery={searchQuery} />}
      
      {/* Research Overlay */}
      {researchOverlayOpen && educationalResources && (
        <ResearchOverlay 
          isOpen={researchOverlayOpen}
          onClose={() => setResearchOverlayOpen(false)}
          resources={educationalResources}
          searchQuery={searchQuery}
        />
      )}
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              animation: `float ${particle.duration} ease-in-out infinite`,
              animationDelay: particle.delay
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sage AI</h1>
              <p className="text-xs text-emerald-300">Powered by Premo Cannabis • Keyport, NJ</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">📍 2 E Front St</p>
            <p className="text-xs text-emerald-300">21+ Recreational</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 py-12 max-w-7xl mx-auto">
        {!hasSearched ? (
          // Landing view
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Find Your Perfect Cannabis Match
            </h1>
            <p className="text-xl text-white/70 mb-12">
              AI-powered recommendations from Premo's premium THC selection
            </p>

            {/* Experience Selection */}
            <div className="mb-10">
              <p className="text-white/60 mb-4">Tell us about your experience:</p>
              <div className="flex justify-center gap-4">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedExperience(level.id)}
                    className={`px-6 py-4 rounded-xl border-2 transition-all ${
                      selectedExperience === level.id
                        ? 'border-emerald-400 bg-emerald-400/20 text-white'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                    }`}
                  >
                    <div className="text-2xl mb-2">{level.icon}</div>
                    <div className="font-semibold">{level.label}</div>
                    <div className="text-xs opacity-70">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={getCurrentPlaceholder()}
                  className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-3 rounded-full hover:from-emerald-600 hover:to-green-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Results view
          <div>
            {/* Compact search bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90">{explanation}</p>
                  {educationalResources && (
                    <button
                      onClick={() => setResearchOverlayOpen(true)}
                      className="mt-3 inline-flex items-center space-x-2 text-emerald-400 hover:text-emerald-300"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">View Research Sources</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoProducts.map((product) => (
                <div key={product.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-white">{product.name}</h3>
                      <p className="text-sm text-emerald-400">{product.category}</p>
                    </div>
                    {product.thc && (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                        {product.thc}
                      </span>
                    )}
                  </div>
                  
                  {product.strain && (
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mb-3 ${
                      product.strain === 'Indica' ? 'bg-purple-500/20 text-purple-300' :
                      product.strain === 'Sativa' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {product.strain}
                    </span>
                  )}
                  
                  <p className="text-sm text-white/70 mb-4">{product.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xl font-bold text-white">{product.price}</span>
                    <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance Note */}
            <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-300">
                <strong>NJ Law:</strong> Max purchase: 1oz flower, 5g concentrates, 1000mg edibles per day. Valid ID required.
              </p>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}