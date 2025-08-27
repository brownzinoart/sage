'use client'

import { useState } from 'react'
import { 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck,
  Calendar,
  Users,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Share2,
  Eye
} from 'lucide-react'
import { ResearchPaper } from '@/types'

interface StudyCardProps {
  paper: ResearchPaper
  viewMode: 'grid' | 'list'
  isSaved: boolean
  onSave: () => void
  searchTerm: string
}

export default function StudyCard({
  paper,
  viewMode,
  isSaved,
  onSave,
  searchTerm
}: StudyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)

  // Highlight search terms in text
  const highlightText = (text: string, term: string) => {
    if (!term) return text
    
    const regex = new RegExp(`(${term})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  // Get credibility color and label
  const getCredibilityInfo = (score: number) => {
    if (score >= 8) return { color: 'text-green-600 bg-green-50 border-green-200', label: 'Gold Standard', icon: '🥇' }
    if (score >= 6) return { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'High Quality', icon: '🥈' }
    if (score >= 4) return { color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Moderate', icon: '🥉' }
    return { color: 'text-gray-600 bg-gray-50 border-gray-200', label: 'Limited', icon: '📄' }
  }

  // Get study type styling
  const getStudyTypeStyle = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('clinical') || lowerType.includes('trial'))
      return 'bg-purple-100 text-purple-800 border-purple-200'
    if (lowerType.includes('review') || lowerType.includes('meta'))
      return 'bg-green-100 text-green-800 border-green-200'
    if (lowerType.includes('observational'))
      return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Format study type for display
  const formatStudyType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const credibilityInfo = getCredibilityInfo(paper.credibility_score)
  const studyTypeStyle = getStudyTypeStyle(paper.study_type)

  const handleCopyCitation = async () => {
    const citation = `${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ' et al.' : ''}. ${paper.title}. ${paper.journal}. ${paper.year}.${paper.doi ? ` DOI: ${paper.doi}` : ''}`
    
    try {
      await navigator.clipboard.writeText(citation)
      setShowCopiedTooltip(true)
      setTimeout(() => setShowCopiedTooltip(false), 2000)
    } catch (err) {
      console.error('Failed to copy citation:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share && paper.url) {
      try {
        await navigator.share({
          title: paper.title,
          text: `Research study: ${paper.title}`,
          url: paper.url
        })
      } catch (err) {
        handleCopyCitation()
      }
    } else {
      handleCopyCitation()
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
        <div className="flex items-start gap-4">
          
          {/* Quality Badge */}
          <div className="flex-shrink-0 pt-1">
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${credibilityInfo.color}`}>
              <span className="mr-1">{credibilityInfo.icon}</span>
              {paper.credibility_score.toFixed(1)}/10
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {highlightText(paper.title, searchTerm)}
              </h3>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={onSave}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title={isSaved ? 'Remove from saved' : 'Save study'}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
                
                {paper.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View full study"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Authors and Journal */}
            <div className="text-xs text-gray-600 mb-2">
              <span className="font-medium">
                {paper.authors.slice(0, 3).join(', ')}
                {paper.authors.length > 3 && ' et al.'}
              </span>
              {' • '}
              <span>{paper.journal}</span>
              {' • '}
              <span>{paper.year}</span>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs border ${studyTypeStyle}`}>
                {formatStudyType(paper.study_type)}
              </span>
              <span className="text-xs text-gray-500">{paper.source}</span>
            </div>

            {/* Abstract Preview */}
            <p className="text-sm text-gray-700 line-clamp-2">
              {highlightText(paper.abstract, searchTerm)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-white relative overflow-hidden">
      
      {/* Quality Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        paper.credibility_score >= 8 ? 'bg-green-500' :
        paper.credibility_score >= 6 ? 'bg-blue-500' :
        paper.credibility_score >= 4 ? 'bg-orange-500' : 'bg-gray-500'
      }`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${credibilityInfo.color}`}>
            <span className="mr-1">{credibilityInfo.icon}</span>
            {paper.credibility_score.toFixed(1)}/10
          </div>
          <span className="text-xs text-gray-500">{credibilityInfo.label}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={handleCopyCitation}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Copy citation"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            {showCopiedTooltip && (
              <div className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Copied!
              </div>
            )}
          </div>
          
          <button
            onClick={onSave}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title={isSaved ? 'Remove from saved' : 'Save study'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-blue-600" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
          
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="View full study"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-base leading-tight mb-3 line-clamp-2">
        {highlightText(paper.title, searchTerm)}
      </h3>

      {/* Meta Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-medium">
            {paper.authors.slice(0, 2).join(', ')}
            {paper.authors.length > 2 && ` +${paper.authors.length - 2} more`}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{paper.journal} • {paper.year}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded text-xs border ${studyTypeStyle}`}>
            {formatStudyType(paper.study_type)}
          </span>
          <span className="text-xs text-gray-500">{paper.source}</span>
        </div>
      </div>

      {/* Study Info */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{paper.year}</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-gray-400" />
          <span>Score: {paper.credibility_score.toFixed(1)}/10</span>
        </div>
      </div>

      {/* Abstract */}
      <div className="mb-4">
        <p className={`text-sm text-gray-700 leading-relaxed ${
          isExpanded ? '' : 'line-clamp-3'
        }`}>
          {highlightText(paper.abstract, searchTerm)}
        </p>
        
        {paper.abstract.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Read more
              </>
            )}
          </button>
        )}
      </div>

    </div>
  )
}