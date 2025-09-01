'use client'

import { BookOpen, Eye, ShoppingBag, ArrowRight, Brain, Compass, Zap } from 'lucide-react'

interface JourneySelectorProps {
  onSelect: (journey: 'learn' | 'explore' | 'shop') => void
}

export default function JourneySelector({ onSelect }: JourneySelectorProps) {
  const journeys = [
    {
      id: 'learn' as const,
      title: 'I want to LEARN',
      subtitle: 'Education first',
      description: 'Start with the fundamentals of hemp and cannabinoids',
      icon: <Brain className="w-8 h-8" />,
      gradient: 'from-electric-purple to-electric-blue',
      examples: ['What is CBD?', 'How do dosages work?', 'Safety guidelines']
    },
    {
      id: 'explore' as const,
      title: 'I want to EXPLORE',
      subtitle: 'Browse & discover',
      description: 'See what\'s available and learn about different options',
      icon: <Compass className="w-8 h-8" />,
      gradient: 'from-electric-blue to-electric-teal',
      examples: ['Product categories', 'Different effects', 'Price ranges']
    },
    {
      id: 'shop' as const,
      title: 'I know what I NEED',
      subtitle: 'Ready to purchase',
      description: 'Find specific products for your wellness goals',
      icon: <Zap className="w-8 h-8" />,
      gradient: 'from-electric-orange to-electric-pink',
      examples: ['Sleep products', 'Pain relief', 'Energy & focus']
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {journeys.map((journey, index) => (
        <div
          key={journey.id}
          className="group cursor-pointer animate-scale-up"
          style={{animationDelay: `${index * 0.2}s`}}
          onClick={() => onSelect(journey.id)}
        >
          <div className="glass-dark rounded-3xl p-8 hover:bg-white/5 transition-all duration-300 group-hover:scale-105 border border-transparent group-hover:border-white/10">
            {/* Icon & Title */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${journey.gradient} rounded-2xl mb-4 group-hover:scale-110 transition-transform neon-glow`}>
                <div className="text-white">
                  {journey.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-500 transition-colors">
                {journey.title}
              </h3>
              
              <p className={`text-lg font-semibold bg-gradient-to-r ${journey.gradient} bg-clip-text text-transparent mb-3`}>
                {journey.subtitle}
              </p>
              
              <p className="text-dark-400 leading-relaxed">
                {journey.description}
              </p>
            </div>

            {/* Examples */}
            <div className="mb-6">
              <p className="text-dark-500 text-sm font-medium mb-3">You'll discover:</p>
              <ul className="space-y-2">
                {journey.examples.map((example, idx) => (
                  <li key={idx} className="flex items-center text-dark-300 text-sm">
                    <div className={`w-2 h-2 bg-gradient-to-r ${journey.gradient} rounded-full mr-3 flex-shrink-0`}></div>
                    {example}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-center text-dark-400 group-hover:text-primary-500 transition-colors">
              <span className="font-medium mr-2">Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}