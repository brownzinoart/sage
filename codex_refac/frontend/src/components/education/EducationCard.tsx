'use client'

import { ReactNode, useState } from 'react'
import { ArrowRight, Clock, Tag } from 'lucide-react'

interface EducationCardProps {
  title: string
  content: string
  icon: ReactNode
  category: string
  readTime: string
  expanded?: boolean
}

export default function EducationCard({ 
  title, 
  content, 
  icon, 
  category, 
  readTime, 
  expanded = false 
}: EducationCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded)

  return (
    <div 
      className={`glass-dark rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer group animate-fade-in ${
        isExpanded ? 'ring-2 ring-electric-purple' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-electric-purple to-electric-blue rounded-xl flex items-center justify-center text-white">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-primary-500 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-xs text-dark-500">
                <Tag className="w-3 h-3" />
                <span>{category}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-dark-500">
                <Clock className="w-3 h-3" />
                <span>{readTime}</span>
              </div>
            </div>
          </div>
        </div>
        <ArrowRight 
          className={`w-5 h-5 text-dark-400 group-hover:text-primary-500 transition-all ${
            isExpanded ? 'rotate-90' : ''
          }`} 
        />
      </div>

      {/* Content */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-16 opacity-90'
      }`}>
        <p className="text-dark-300 leading-relaxed">
          {content}
        </p>
        
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-dark-200 animate-slide-down">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-electric-purple/20 text-electric-purple text-xs rounded-full">
                Evidence-based
              </span>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-500 text-xs rounded-full">
                NC Compliant
              </span>
            </div>
            
            <button className="w-full bg-gradient-to-r from-electric-purple to-electric-blue text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all neon-glow">
              Learn More About {title}
            </button>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="w-full bg-dark-200 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-primary-500 to-electric-purple h-1 rounded-full transition-all duration-500"
            style={{ width: isExpanded ? '100%' : '30%' }}
          ></div>
        </div>
      </div>
    </div>
  )
}