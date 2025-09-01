'use client'

import { useState, useEffect } from 'react'
import { X, BookOpen, Shield, AlertTriangle, Scale, Microscope, Star, ExternalLink, ChevronDown, ChevronUp, Search, CheckCircle, Clock, TrendingUp, Activity, ArrowLeft, Filter } from 'lucide-react'
import { EducationalResources, EducationalSummary, ResearchPaper } from '@/types'
import ResearchLibrary from '../research/ResearchLibrary'
import { fetchResearch, fetchDosage, fetchInteractions } from '@/hooks/useResearch'

interface ResearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  educational_resources?: EducationalResources
  educational_summary?: EducationalSummary
  userQuery?: string
}

export default function ResearchOverlay({
  isOpen,
  onClose,
  educational_resources,
  educational_summary,
  userQuery
}: ResearchOverlayProps) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [expandedPaper, setExpandedPaper] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'how-works' | 'safety' | 'fit' | 'legal' | 'research'>('how-works')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localResources, setLocalResources] = useState<EducationalResources | undefined>(undefined)
  const [dosageResult, setDosageResult] = useState<any | null>(null)
  const [interactionResult, setInteractionResult] = useState<any | null>(null)

  const educationalTabs = {
    'how-works': {
      title: 'How It Works',
      shortTitle: 'How It Works',
      icon: Microscope,
      color: 'blue',
      description: 'Hemp compounds interact with your body\'s endocannabinoid system, a network of receptors that help maintain balance. CBD, CBN, and terpenes each have unique properties that may support wellness in different ways.',
      sections: [
        {
          title: 'The Endocannabinoid System',
          content: `Your body has a complex network called the endocannabinoid system (ECS) that helps maintain balance. This system includes:

• **CB1 receptors** - Found mainly in the brain and central nervous system
• **CB2 receptors** - Located primarily in immune cells and peripheral tissues
• **Endocannabinoids** - Natural compounds your body produces
• **Enzymes** - Break down cannabinoids after they've done their job

The ECS regulates sleep, mood, appetite, pain response, and immune function.`
        },
        {
          title: 'Major Cannabinoids',
          content: `Different hemp compounds interact with your ECS in unique ways:

• **CBD (Cannabidiol)** - Non-psychoactive, may support calm and focus
• **CBN (Cannabinol)** - Known for potential sleep-promoting properties
• **CBG (Cannabigerol)** - The "mother cannabinoid," may support focus
• **CBC (Cannabichromene)** - May work synergistically with other cannabinoids

Each compound has different effects and works better in combination.`
        },
        {
          title: 'Terpene Profiles',
          content: `Terpenes are aromatic compounds that influence effects:

• **Myrcene** - Relaxing, sedating effects
• **Limonene** - Uplifting, mood-supporting
• **Pinene** - May support alertness and memory
• **Linalool** - Calming, similar to lavender
• **Caryophyllene** - May support pain relief

The combination of cannabinoids and terpenes creates the "entourage effect."`
        }
      ]
    },
    'safety': {
      title: 'Safety',
      shortTitle: 'Safety',
      icon: Shield,
      color: 'emerald',
      description: 'Hemp products should be third-party tested for purity and potency. Start with small amounts and consult healthcare providers, especially if you take medications.',
      sections: [
        {
          title: 'Third-Party Testing',
          content: `Quality hemp products should always be tested for:

• **Potency** - Verify cannabinoid content matches labels
• **Pesticides** - Ensure no harmful chemicals were used
• **Heavy metals** - Test for lead, mercury, cadmium, arsenic
• **Residual solvents** - Check for extraction chemical residues
• **Microbials** - Screen for bacteria, yeast, mold, E. coli

Always look for current Certificates of Analysis (COAs) from independent labs.`
        },
        {
          title: 'Starting Safely',
          content: `Follow the "start low, go slow" approach:

• **Begin with low doses** - 2.5-5mg for beginners
• **Wait 2 hours** - Effects can take time to appear
• **Track your response** - Keep a journal of doses and effects
• **Be consistent** - Use same products and timing
• **Consult healthcare providers** - Especially if taking medications

Everyone's endocannabinoid system is different.`
        },
        {
          title: 'Drug Interactions',
          content: `Hemp products may interact with certain medications:

• **Blood thinners** - CBD may increase bleeding risk
• **Seizure medications** - Dosing adjustments may be needed
• **Heart medications** - Monitor blood pressure changes
• **Sedatives** - Increased drowsiness possible

Always inform your doctor about hemp product use before procedures or new medications.`
        }
      ]
    },
    'fit': {
      title: 'Find Your Fit',
      shortTitle: 'Fit',
      icon: Star,
      color: 'purple',
      description: 'Everyone\'s endocannabinoid system is unique. What works for others may not work for you. Track your experience and adjust accordingly.',
      sections: [
        {
          title: 'Product Selection Guide',
          content: `Choose products based on your goals:

**For Sleep:**
• CBN-dominant products
• Full-spectrum with myrcene terpenes
• Edibles for longer-lasting effects

**For Daily Wellness:**
• Broad-spectrum CBD
• Balanced terpene profiles
• Consistent daily dosing

**For Occasional Stress:**
• Fast-acting tinctures
• Linalool and limonene terpenes
• As-needed usage`
        },
        {
          title: 'Delivery Methods',
          content: `Different methods provide different experiences:

• **Tinctures/Oils** - Fast absorption, precise dosing (15-45 min onset)
• **Edibles/Gummies** - Longer effects, easier dosing (30-90 min onset)
• **Capsules** - Consistent dosing, no taste (45-90 min onset)
• **Topicals** - Localized effects, no systemic absorption
• **Vapes** - Fastest onset but shortest duration (1-5 min onset)

Consider your lifestyle and preferences when choosing.`
        },
        {
          title: 'Timing & Routine',
          content: `Optimize your hemp routine:

**Morning:** Lower doses for focus and calm energy
**Afternoon:** Moderate doses for stress management
**Evening:** Higher doses for relaxation and sleep preparation

**With food:** May improve absorption and reduce stomach upset
**Consistency:** Same time daily helps your body adjust
**Tracking:** Note effects, timing, and any lifestyle factors`
        }
      ]
    },
    'legal': {
      title: 'Legal',
      shortTitle: 'Legal',
      icon: Scale,
      color: 'orange',
      description: 'Hemp-derived products with less than 0.3% THC are federally legal in the US. However, state laws vary, so check your local regulations.',
      sections: [
        {
          title: 'Federal vs State Laws',
          content: `Navigate the complex legal landscape:

**Federal Level (2018 Farm Bill):**
• Hemp with <0.3% THC is legal
• Must be grown by licensed farmers
• Interstate commerce is allowed

**State Level Variations:**
• Some states have stricter THC limits
• Different licensing requirements
• Varying retail regulations
• Some prohibit certain product types

Always check your local laws before purchasing.`
        },
        {
          title: 'Travel Considerations',
          content: `Hemp product travel guidelines:

**Domestic Travel:**
• TSA allows hemp products with <0.3% THC
• Carry original packaging and COAs
• Some states prohibit possession despite federal law

**International Travel:**
• Many countries prohibit all cannabis products
• Even legal hemp products may be confiscated
• Check destination country laws thoroughly
• Consider not traveling with hemp products internationally`
        },
        {
          title: 'Workplace Policies',
          content: `Hemp products and employment:

**Drug Testing:**
• Full-spectrum products may show THC traces
• Broad-spectrum and isolate products safer for testing
• No guarantee any product won't trigger positive results

**Company Policies:**
• Some employers prohibit all cannabis products
• Federal contractors often have stricter rules
• Check your employee handbook
• Consult HR if uncertain about policies`
        }
      ]
    },
    'research': {
      title: 'Research',
      shortTitle: 'Research',
      icon: BookOpen,
      color: 'indigo',
      description: 'Explore scientific studies and research papers related to hemp and cannabinoids.',
      sections: []
    }
  }

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
        {/* Query-Focused Header */}
        <div className="p-6 border-b border-gray-200/50 flex-shrink-0">
          {/* Query Display */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Question</h2>
                <p className="text-blue-700 font-medium bg-blue-50 px-3 py-2 rounded-lg">
                  "{userQuery || 'Research insights'}"
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Research Actions */}
          {activeTab === 'research' && (
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    if (!userQuery) return
                    try {
                      setError(null); setLoading(true)
                      const data = await fetchResearch(userQuery, 10)
                      // Map to ResearchLibrary shape
                      const rr = data?.research_results
                      const mapped: EducationalResources = {
                        research_studies: {
                          papers: rr?.papers || [],
                          summary: rr?.summary || {},
                          quality_analysis: rr?.quality_analysis || {},
                          total_found: rr?.total_found || (rr?.papers?.length || 0),
                        },
                        source_credibility: {
                          total_papers: rr?.papers?.length || 0,
                          average_credibility: rr?.summary?.average_credibility_score || 0,
                          high_credibility_count: rr?.summary?.high_credibility_count || 0,
                          source_distribution: {},
                          credibility_level: 'n/a'
                        }
                      } as any
                      setLocalResources(mapped)
                    } catch (e: any) {
                      setError(e?.message || 'Failed to fetch research')
                    } finally { setLoading(false) }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Refresh Research
                </button>
                <button
                  onClick={async () => {
                    try {
                      setError(null); setLoading(true)
                      const res = await fetchDosage('CBD', 'sleep', 'curious')
                      setDosageResult(res)
                    } catch (e: any) {
                      setError(e?.message || 'Failed to get dosage')
                    } finally { setLoading(false) }
                  }}
                  className="px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                >
                  Dosage Finder
                </button>
                <button
                  onClick={async () => {
                    try {
                      setError(null); setLoading(true)
                      const res = await fetchInteractions(['CBD'])
                      setInteractionResult(res)
                    } catch (e: any) {
                      setError(e?.message || 'Failed to check interactions')
                    } finally { setLoading(false) }
                  }}
                  className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                >
                  Interactions Check
                </button>
                {loading && <span className="text-sm text-gray-600">Loading…</span>}
                {error && <span className="text-sm text-red-600">{error}</span>}
              </div>

              {(dosageResult || interactionResult) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dosageResult && (
                    <div className="p-3 border rounded-lg bg-emerald-50">
                      <div className="font-semibold text-emerald-700 mb-1">Dosage Guidelines</div>
                      <pre className="text-xs text-emerald-900 whitespace-pre-wrap">{JSON.stringify(dosageResult, null, 2)}</pre>
                    </div>
                  )}
                  {interactionResult && (
                    <div className="p-3 border rounded-lg bg-orange-50">
                      <div className="font-semibold text-orange-700 mb-1">Interactions</div>
                      <pre className="text-xs text-orange-900 whitespace-pre-wrap">{JSON.stringify(interactionResult, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          {educational_resources?.research_studies?.papers && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {educational_resources.research_studies.total_found || educational_resources.research_studies.papers.length}
                  </div>
                  <div className="text-sm text-green-700">Studies Found</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {educational_resources.source_credibility?.average_credibility?.toFixed(1) || 'N/A'}/10
                  </div>
                  <div className="text-sm text-blue-700">Avg Quality</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {educational_summary?.evidence_strength === 'strong' ? 'Strong' :
                     educational_summary?.evidence_strength === 'moderate' ? 'Moderate' : 'Limited'}
                  </div>
                  <div className="text-sm text-purple-700">Evidence</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200/50 px-6 flex-shrink-0 overflow-x-auto">
          {Object.entries(educationalTabs).map(([tabKey, tab]) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tabKey
            
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`} />
                <span>{tab.shortTitle}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'research' ? (
          <div className="flex-1 overflow-hidden">
            <ResearchLibrary
              educational_resources={localResources || educational_resources}
              educational_summary={educational_summary}
              userQuery={userQuery}
              isOpen={true}
              onClose={() => setActiveTab('how-works')}
              embedded={true}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8">
            {(() => {
              const tab = educationalTabs[activeTab]
              const IconComponent = tab.icon
              const colorClasses = {
                blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' },
                emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: 'text-emerald-600' },
                purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', icon: 'text-purple-600' },
                orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', icon: 'text-orange-600' },
                indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', icon: 'text-indigo-600' }
              }
              const colors = colorClasses[tab.color as keyof typeof colorClasses]
              
              return (
                <div>
                  {/* Tab Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 ${colors.bg} rounded-lg ${colors.border} border`}>
                      <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{tab.title}</h2>
                      <p className="text-gray-600 text-sm">{tab.description}</p>
                    </div>
                  </div>

                  {/* Content sections */}
                  <div className="space-y-6">
                    {tab.sections.map((section, idx) => (
                      <div key={idx} className={`${colors.bg} rounded-xl p-6 ${colors.border} border`}>
                        <h3 className={`text-lg font-semibold ${colors.text} mb-4`}>{section.title}</h3>
                        <div className={`${colors.text.replace('900', '800')} text-sm leading-relaxed whitespace-pre-line`}>
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Explore Research Button */}
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setActiveTab('research')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <Filter className="w-5 h-5" />
                      <span className="font-medium">Explore Related Research</span>
                    </button>
                    <p className="text-xs text-gray-600 mt-2">
                      Find studies related to {tab.title.toLowerCase()}
                    </p>
                  </div>
                  
                  {/* Educational disclaimer */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 text-center">
                      💡 This information is for educational purposes only and is not intended as medical advice. Consult with healthcare professionals for personalized guidance.
                    </p>
                  </div>
                </div>
              )
            })()} 
          </div>
        )}

        {hasResources && activeTab !== 'research' && (
          <>
            {/* Decision Dashboard */}
            <div className="p-6 border-b border-gray-200/50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* EFFICACY Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Efficacy</h3>
                  </div>
                  
                  {educational_summary?.key_findings && educational_summary.key_findings.length > 0 ? (
                    <div className="space-y-3">
                      {educational_summary.key_findings.slice(0, 2).map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-green-800 leading-relaxed">{finding}</p>
                        </div>
                      ))}
                      
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-700">Evidence Strength</span>
                          <span className="text-sm font-bold text-green-800 capitalize">
                            {educational_summary.evidence_strength || 'Moderate'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-green-700">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">Research supports potential benefits</p>
                    </div>
                  )}
                </div>

                {/* SAFETY Card */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-orange-900">Safety</h3>
                  </div>
                  
                  {educational_resources?.safety_information ? (
                    <div className="space-y-3">
                      {educational_resources.safety_information.general_warnings?.slice(0, 2).map((warning, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
                          <p className="text-sm text-orange-800 leading-relaxed">{warning}</p>
                        </div>
                      ))}
                      
                      <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-orange-700">Safety Status</span>
                          <span className="text-sm font-bold text-orange-800">
                            Generally Well-Tolerated
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-orange-700">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-sm">Generally considered safe</p>
                      <p className="text-xs text-orange-600 mt-1">Consult healthcare provider</p>
                    </div>
                  )}
                </div>

                {/* DOSING Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">Optimal Use</h3>
                  </div>
                  
                  {educational_resources?.dosage_guidelines?.recommendation ? (
                    <div className="space-y-3">
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {educational_resources.dosage_guidelines.recommendation}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-center">
                          <div className="text-sm font-bold text-blue-600">Start</div>
                          <div className="text-xs text-blue-700">Low dose</div>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg text-center">
                          <div className="text-sm font-bold text-blue-600">Effect</div>
                          <div className="text-xs text-blue-700">30-90 min</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-blue-700">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm">Start low, go slow</p>
                      <p className="text-xs text-blue-600 mt-1">Individual response varies</p>
                    </div>
                  )}
                </div>
                
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex border-b border-gray-200/50 px-6 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveSection('insights')
                }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeSection === 'insights'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Key Insights
              </button>
              {(educational_resources?.research_studies?.papers?.length || 0) > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveSection('research')
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeSection === 'research'
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
                    setActiveSection('dosage')
                  }}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeSection === 'dosage'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dosage
                </button>
              )}
            </div>

            {/* Dynamic Content Sections */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeSection === 'insights' && educational_summary && (
                <div className="space-y-6">
                  {educational_summary.key_findings && educational_summary.key_findings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Research Findings</h3>
                      <div className="space-y-3">
                        {educational_summary.key_findings.map((finding, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-green-800">{finding}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {educational_summary.research_gaps && educational_summary.research_gaps.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Gaps</h3>
                      <div className="space-y-3">
                        {educational_summary.research_gaps.map((gap, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-yellow-800">{gap}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'research' && educational_resources?.research_studies?.papers && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Research Studies ({educational_resources.research_studies.papers.length})
                  </h3>
                  
                  {educational_resources.research_studies.papers.map((paper: ResearchPaper, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-md font-semibold text-gray-900 leading-tight">
                            {paper.title}
                          </h4>
                          {paper.credibility_score && (
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getCredibilityColor(paper.credibility_score)} bg-opacity-10`}>
                              {paper.credibility_score}/10
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {paper.authors} • {paper.journal} • {paper.year}
                        </p>
                        
                        {paper.abstract && (
                          <div>
                            <button
                              onClick={() => setExpandedPaper(expandedPaper === idx ? null : idx)}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {expandedPaper === idx ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Hide Abstract
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Show Abstract
                                </>
                              )}
                            </button>
                            
                            {expandedPaper === idx && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {paper.abstract}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {paper.url && (
                          <div className="mt-3">
                            <a
                              href={paper.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                              View Study
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'dosage' && educational_resources?.dosage_guidelines && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dosage Recommendations</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-blue-800">
                        {educational_resources.dosage_guidelines.recommendation}
                      </p>
                    </div>
                  </div>
                  
                  {educational_resources.dosage_guidelines.safety_considerations && educational_resources.dosage_guidelines.safety_considerations.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Safety Considerations</h4>
                      <div className="space-y-2">
                        {educational_resources.dosage_guidelines.safety_considerations.map((consideration, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700">{consideration}</p>
                          </div>
                        ))}
                      </div>
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
