'use client'

import { Star, Award, TrendingUp, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import { ResearchPaper } from '@/types'

interface FeaturedStudiesProps {
  papers: ResearchPaper[]
  onSaveStudy: (paperId: string) => void
  savedStudies: string[]
}

export default function FeaturedStudies({
  papers,
  onSaveStudy,
  savedStudies
}: FeaturedStudiesProps) {
  
  if (!papers.length) return null

  const getFeaturedReason = (paper: ResearchPaper, index: number) => {
    if (paper.credibility_score >= 8) return { icon: Award, text: 'Gold Standard Study', color: 'text-green-600' }
    if (paper.citation_count && paper.citation_count > 100) return { icon: TrendingUp, text: 'Highly Cited', color: 'text-blue-600' }
    if (paper.study_type.toLowerCase().includes('clinical')) return { icon: Star, text: 'Clinical Trial', color: 'text-purple-600' }
    return { icon: Star, text: 'Top Result', color: 'text-orange-600' }
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Featured Studies</h3>
        <span className="text-sm text-gray-600">Top research for your query</span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {papers.map((paper, index) => {
          const featuredReason = getFeaturedReason(paper, index)
          const IconComponent = featuredReason.icon
          const paperId = paper.doi || paper.title
          const isSaved = savedStudies.includes(paperId)
          
          return (
            <div key={paperId} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${featuredReason.color}`} />
                  <span className={`text-xs font-medium ${featuredReason.color}`}>
                    {featuredReason.text}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSaveStudy(paperId)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View full study"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              
              {/* Title */}
              <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
                {paper.title}
              </h4>
              
              {/* Meta */}
              <div className="text-xs text-gray-600 mb-2">
                {paper.authors.slice(0, 2).join(', ')}
                {paper.authors.length > 2 && ' et al.'} • {paper.year}
              </div>
              
              {/* Quality Score */}
              <div className="flex items-center justify-between">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  paper.credibility_score >= 8 ? 'bg-green-100 text-green-800' :
                  paper.credibility_score >= 6 ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  Quality: {paper.credibility_score.toFixed(1)}/10
                </div>
                
                {paper.citation_count && (
                  <div className="text-xs text-gray-500">
                    {paper.citation_count} citations
                  </div>
                )}
              </div>
              
              {/* Abstract Preview */}
              <p className="text-xs text-gray-700 mt-2 line-clamp-2">
                {paper.abstract}
              </p>
            </div>
          )
        })}
      </div>
      
      {papers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No featured studies available yet</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}