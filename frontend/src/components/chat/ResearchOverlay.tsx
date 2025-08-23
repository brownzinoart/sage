'use client'

import { useState, useEffect } from 'react'
import { X, BookOpen, Shield, AlertTriangle, Scale, Microscope, Star, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { EducationalResources, EducationalSummary, ResearchPaper } from '@/types'

interface ResearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  educational_resources?: EducationalResources
  educational_summary?: EducationalSummary
}

export default function ResearchOverlay({
  isOpen,
  onClose,
  educational_resources,
  educational_summary
}: ResearchOverlayProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedPaper, setExpandedPaper] = useState<number | null>(null)

  if (!isOpen) return null

  const hasResources = educational_resources && (
    educational_resources.research_studies?.papers?.length ||
    educational_resources.dosage_guidelines ||
    educational_resources.safety_information ||
    educational_resources.legal_status ||
    educational_resources.mechanism_of_action
  )

  const getCredibilityColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    if (score >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getEvidenceStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600 bg-green-50 border-green-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Research Insights</h2>
              <p className="text-sm text-gray-600">Evidence-based information from academic sources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!hasResources ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="text-center mb-6">
              <div className="p-4 bg-emerald-100 rounded-lg w-fit mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hemp & Wellness Education</h3>
              <p className="text-gray-600">Learn about the science behind hemp compounds and how they work</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Microscope className="w-6 h-6 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">How Hemp Works</h4>
                </div>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Hemp compounds interact with your body's endocannabinoid system, a network of receptors that help maintain balance. CBD, CBN, and terpenes each have unique properties that may support wellness in different ways.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  <h4 className="font-semibold text-emerald-900">Safety & Quality</h4>
                </div>
                <p className="text-emerald-800 text-sm leading-relaxed">
                  Hemp products should be third-party tested for purity and potency. Start with small amounts and consult healthcare providers, especially if you take medications.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Finding Your Fit</h4>
                </div>
                <p className="text-purple-800 text-sm leading-relaxed">
                  Everyone's endocannabinoid system is unique. What works for others may not work for you. Track your experience and adjust accordingly.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <Scale className="w-6 h-6 text-orange-600" />
                  <h4 className="font-semibold text-orange-900">Legal & Compliance</h4>
                </div>
                <p className="text-orange-800 text-sm leading-relaxed">
                  Hemp-derived products with less than 0.3% THC are federally legal in the US. However, state laws vary, so check your local regulations.
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                💡 This information is for educational purposes only and is not intended as medical advice. Consult with healthcare professionals for personalized guidance.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200/50 px-6 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveTab('overview')
                }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              {(educational_resources?.research_studies?.papers?.length || 0) > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveTab('research')
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'research'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Research Studies {educational_resources?.research_studies?.papers?.length || 0}
                </button>
              )}
              {educational_resources?.dosage_guidelines && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveTab('dosage')
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'dosage'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dosage
                </button>
              )}
              {educational_resources?.safety_information && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveTab('safety')
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'safety'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Safety
                </button>
              )}
              {educational_resources?.legal_status && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveTab('legal')
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'legal'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Legal Status
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {educational_summary && (
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/50">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Research Summary</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {educational_summary.compounds_researched?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Compounds</div>
                        </div>
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className={`text-2xl font-bold capitalize ${getEvidenceStrengthColor(educational_summary.evidence_strength).split(' ')[0]}`}>
                            {educational_summary.evidence_strength}
                          </div>
                          <div className="text-sm text-gray-600">Evidence</div>
                        </div>
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 capitalize">
                            {educational_summary.confidence_level}
                          </div>
                          <div className="text-sm text-gray-600">Confidence</div>
                        </div>
                      </div>

                      {educational_summary.key_findings?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-blue-900 mb-2">Key Findings</h4>
                          <ul className="space-y-1">
                            {educational_summary.key_findings.map((finding, idx) => (
                              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                <Star className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {educational_summary.research_gaps?.length > 0 && (
                        <div>
                          <h4 className="font-medium text-blue-900 mb-2">Research Limitations</h4>
                          <ul className="space-y-1">
                            {educational_summary.research_gaps.map((gap, idx) => (
                              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {educational_resources?.mechanism_of_action && (
                    <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-200/50">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Microscope className="w-5 h-5" />
                        How It Works
                      </h3>
                      <div className="text-purple-800 mb-2">
                        <strong>{educational_resources.mechanism_of_action.compound}</strong> for{' '}
                        <strong>{educational_resources.mechanism_of_action.condition}</strong>
                      </div>
                      <p className="text-purple-700 mb-2">
                        {educational_resources.mechanism_of_action.explanation}
                      </p>
                      <div className="text-sm text-purple-600">
                        <strong>Primary Pathway:</strong> {educational_resources.mechanism_of_action.pathway}
                      </div>
                    </div>
                  )}

                  {educational_resources?.source_credibility && (
                    <div className="bg-green-50/50 rounded-xl p-4 border border-green-200/50">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Source Quality</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {educational_resources.source_credibility.average_credibility.toFixed(1)}/10
                          </div>
                          <div className="text-sm text-green-700">Average Quality Score</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {educational_resources.source_credibility.high_credibility_count}
                          </div>
                          <div className="text-sm text-green-700">High-Quality Studies</div>
                        </div>
                      </div>
                      <div className="text-sm text-green-700 mt-2">
                        {educational_resources.source_credibility.credibility_level}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Research Studies Tab */}
              {activeTab === 'research' && educational_resources?.research_studies?.papers && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Research Papers</h3>
                    <div className="text-sm text-gray-600">
                      {educational_resources.research_studies.papers.length} of {educational_resources.research_studies.total_found} papers
                    </div>
                  </div>
                  
                  {educational_resources.research_studies.papers.map((paper: ResearchPaper, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 mr-4">
                          {paper.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getCredibilityColor(paper.credibility_score)}`}>
                            {paper.credibility_score.toFixed(1)}/10
                          </span>
                          {paper.url && (
                            <a
                              href={paper.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{paper.authors.slice(0, 3).join(', ')}</span>
                        {paper.authors.length > 3 && ' et al.'} • {paper.journal} ({paper.year})
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {paper.study_type.replace('-', ' ')}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {paper.source}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700">
                        {expandedPaper === idx ? (
                          <div>
                            <p className="mb-2">{paper.abstract}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedPaper(null)
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <ChevronUp className="w-3 h-3" /> Show less
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="mb-2">{paper.abstract.slice(0, 200)}...</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedPaper(idx)
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <ChevronDown className="w-3 h-3" /> Read more
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dosage Tab */}
              {activeTab === 'dosage' && educational_resources?.dosage_guidelines && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dosage Guidelines</h3>
                  
                  {educational_resources.dosage_guidelines.recommendation && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Clinical Recommendation</h4>
                      <p className="text-blue-800">{educational_resources.dosage_guidelines.recommendation}</p>
                    </div>
                  )}
                  
                  {educational_resources.dosage_guidelines.safety_considerations?.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-2">Safety Considerations</h4>
                      <ul className="space-y-1">
                        {educational_resources.dosage_guidelines.safety_considerations.map((consideration, idx) => (
                          <li key={idx} className="text-yellow-800 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {consideration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Safety Tab */}
              {activeTab === 'safety' && educational_resources?.safety_information && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Safety Information
                  </h3>
                  
                  {educational_resources.safety_information.recommendation && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h4 className="font-medium text-red-900 mb-2">Safety Recommendation</h4>
                      <p className="text-red-800">{educational_resources.safety_information.recommendation}</p>
                    </div>
                  )}
                  
                  {educational_resources.safety_information.general_warnings?.length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h4 className="font-medium text-orange-900 mb-2">General Warnings</h4>
                      <ul className="space-y-2">
                        {educational_resources.safety_information.general_warnings.map((warning, idx) => (
                          <li key={idx} className="text-orange-800 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Legal Status Tab */}
              {activeTab === 'legal' && educational_resources?.legal_status && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    Legal Status
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {educational_resources.legal_status.federal_status && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3">Federal Status</h4>
                        <div className="space-y-3">
                          {Object.entries(educational_resources.legal_status.federal_status).map(([key, value]) => (
                            <div key={key}>
                              <div className="font-medium text-blue-800 capitalize text-sm mb-1">
                                {key.replace(/_/g, ' ')}
                              </div>
                              <div className="text-blue-700 text-sm pl-2 border-l-2 border-blue-200">
                                {typeof value === 'object' ? (
                                  <div className="space-y-1">
                                    {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                                      <div key={subKey}>
                                        <span className="font-medium capitalize">{subKey.replace(/_/g, ' ')}: </span>
                                        <span>{String(subValue)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  String(value)
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {educational_resources.legal_status.state_status && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-medium text-green-900 mb-3">State Status</h4>
                        <div className="space-y-3">
                          {Object.entries(educational_resources.legal_status.state_status).map(([key, value]) => (
                            <div key={key}>
                              <div className="font-medium text-green-800 capitalize text-sm mb-1">
                                {key.replace(/_/g, ' ')}
                              </div>
                              <div className="text-green-700 text-sm pl-2 border-l-2 border-green-200">
                                {typeof value === 'object' ? (
                                  <div className="space-y-1">
                                    {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                                      <div key={subKey}>
                                        <span className="font-medium capitalize">{subKey.replace(/_/g, ' ')}: </span>
                                        <span>{String(subValue)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  String(value)
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {educational_resources.legal_status.compliance_notes?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Compliance Notes</h4>
                      <ul className="space-y-1">
                        {educational_resources.legal_status.compliance_notes.map((note, idx) => (
                          <li key={idx} className="text-gray-700 text-sm">{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}