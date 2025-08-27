'use client'

import { useState, useMemo } from 'react'
import { 
  BookOpen, 
  Filter, 
  Search, 
  SortDesc, 
  Grid3X3,
  List,
  Download,
  Bookmark,
  TrendingUp,
  Award,
  Calendar,
  Users,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { EducationalResources, EducationalSummary, ResearchPaper } from '@/types'
import FilterPanel from './FilterPanel'
import StudyCard from './StudyCard'
import CategoryNavigation from './CategoryNavigation'
import FeaturedStudies from './FeaturedStudies'
import ExportManager from './ExportManager'
import ResearchCollections from './ResearchCollections'

interface ResearchLibraryProps {
  educational_resources?: EducationalResources
  educational_summary?: EducationalSummary
  userQuery?: string
  isOpen: boolean
  onClose: () => void
  embedded?: boolean
}

interface FilterState {
  category: string
  studyType: string[]
  yearRange: [number, number]
  credibilityScore: [number, number]
  searchTerm: string
  sortBy: 'relevance' | 'date' | 'credibility' | 'citations'
}

export default function ResearchLibrary({
  educational_resources,
  educational_summary,
  userQuery,
  isOpen,
  onClose,
  embedded = false
}: ResearchLibraryProps) {
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showCollections, setShowCollections] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [savedStudies, setSavedStudies] = useState<string[]>([])
  
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    studyType: [],
    yearRange: [2020, 2025],
    credibilityScore: [6, 10],
    searchTerm: '',
    sortBy: 'relevance'
  })

  const papers = educational_resources?.research_studies?.papers || []
  const studiesPerPage = 10

  // Category definitions based on research capacity analysis
  const categories = [
    { id: 'all', name: 'All Studies', icon: BookOpen, count: papers.length },
    { id: 'sleep', name: 'Sleep & Rest', icon: TrendingUp, count: 0 },
    { id: 'anxiety', name: 'Anxiety & Mood', icon: Users, count: 0 },
    { id: 'pain', name: 'Pain Management', icon: Award, count: 0 },
    { id: 'inflammation', name: 'Inflammation', icon: TrendingUp, count: 0 },
    { id: 'clinical-trials', name: 'Clinical Trials', icon: Award, count: 0 },
    { id: 'reviews', name: 'Reviews & Meta-Analyses', icon: BookOpen, count: 0 }
  ]

  // Filter and sort papers
  const filteredAndSortedPapers = useMemo(() => {
    let filtered = [...papers]

    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(paper => {
        const title = paper.title.toLowerCase()
        const abstract = paper.abstract.toLowerCase()
        
        switch (filters.category) {
          case 'sleep':
            return title.includes('sleep') || abstract.includes('sleep') || 
                   title.includes('insomnia') || abstract.includes('insomnia')
          case 'anxiety':
            return title.includes('anxiety') || abstract.includes('anxiety') ||
                   title.includes('stress') || abstract.includes('stress')
          case 'pain':
            return title.includes('pain') || abstract.includes('pain') ||
                   title.includes('analgesia') || abstract.includes('analgesia')
          case 'inflammation':
            return title.includes('inflammation') || abstract.includes('inflammation') ||
                   title.includes('inflammatory') || abstract.includes('inflammatory')
          case 'clinical-trials':
            return paper.study_type.includes('clinical') || paper.study_type.includes('trial')
          case 'reviews':
            return paper.study_type.includes('review') || paper.study_type.includes('meta-analysis')
          default:
            return true
        }
      })
    }

    // Apply study type filter
    if (filters.studyType.length > 0) {
      filtered = filtered.filter(paper =>
        filters.studyType.some(type => paper.study_type.toLowerCase().includes(type.toLowerCase()))
      )
    }

    // Apply credibility score filter
    filtered = filtered.filter(paper =>
      paper.credibility_score >= filters.credibilityScore[0] &&
      paper.credibility_score <= filters.credibilityScore[1]
    )

    // Apply year range filter
    filtered = filtered.filter(paper =>
      paper.year >= filters.yearRange[0] &&
      paper.year <= filters.yearRange[1]
    )

    // Sort papers
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return b.year - a.year
        case 'credibility':
          return b.credibility_score - a.credibility_score
        case 'citations':
          return b.year - a.year  // Sort by year instead of citations
        case 'relevance':
        default:
          return b.credibility_score - a.credibility_score  // Sort by credibility instead
      }
    })

    return filtered
  }, [papers, filters])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPapers.length / studiesPerPage)
  const paginatedPapers = filteredAndSortedPapers.slice(
    (currentPage - 1) * studiesPerPage,
    currentPage * studiesPerPage
  )

  const handleSaveStudy = (paperId: string) => {
    setSavedStudies(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    )
  }

  const handleExportStudies = () => {
    setShowExportModal(true)
  }

  const handleCollectionSelect = (collection: any) => {
    setShowCollections(false)
    setShowMobileSidebar(false)
  }

  const handleApplyFilter = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  if (!isOpen) return null

  const containerClasses = embedded 
    ? "h-full flex flex-col"
    : "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"

  const modalClasses = embedded
    ? "h-full flex flex-col"
    : "bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full h-full sm:max-w-7xl sm:h-[90vh] flex flex-col border border-gray-200"

  return (
    <div className={containerClasses}>
      <div className={modalClasses}>
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Research Library</h2>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  {filteredAndSortedPapers.length} studies for: "{userQuery || 'Hemp & Wellness'}"
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors sm:hidden"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleExportStudies}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Export Results"
                >
                  <Download className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${
                    showFilters 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  title="Toggle Filters"
                >
                  <Filter className="w-5 h-5" />
                </button>
                
                <div className="flex border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`p-2 ${activeView === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`p-2 ${activeView === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-green-600">{filteredAndSortedPapers.length}</div>
              <div className="text-xs text-green-700">Studies Found</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {educational_resources?.source_credibility?.average_credibility?.toFixed(1) || 'N/A'}
              </div>
              <div className="text-xs text-blue-700">Avg Quality</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-purple-600">
                {savedStudies.length}
              </div>
              <div className="text-xs text-purple-700">Saved</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-orange-600">
                {educational_summary?.evidence_strength === 'strong' ? 'Strong' :
                 educational_summary?.evidence_strength === 'moderate' ? 'Moderate' : 'Limited'}
              </div>
              <div className="text-xs text-orange-700">Evidence</div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Desktop Sidebar */}
          <div className="hidden sm:flex w-80 border-r border-gray-200 flex flex-col">
            {showCollections ? (
              <ResearchCollections
                papers={papers}
                onCollectionSelect={handleCollectionSelect}
                onApplyFilter={handleApplyFilter}
              />
            ) : (
              <>
                <CategoryNavigation
                  categories={categories}
                  activeCategory={filters.category}
                  onCategoryChange={(category) => {
                    setFilters(prev => ({ ...prev, category }))
                    setCurrentPage(1)
                  }}
                />
                
                {showFilters && (
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                      setFilters(prev => ({ ...prev, ...newFilters }))
                      setCurrentPage(1)
                    }}
                    studyTypes={['clinical-trial', 'review', 'meta-analysis', 'observational', 'case-study']}
                  />
                )}
              </>
            )}
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <div className="fixed inset-0 bg-black/50 z-10 sm:hidden" onClick={() => setShowMobileSidebar(false)}>
              <div className="bg-white w-80 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Menu</h3>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Mobile Quick Actions */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        handleExportStudies()
                        setShowMobileSidebar(false)
                      }}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Export</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowCollections(true)
                        setShowMobileSidebar(false)
                      }}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">Collections</span>
                    </button>
                  </div>
                  
                  <div className="mt-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg ${
                        showFilters ? 'bg-blue-50 text-blue-700' : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      <span className="text-sm">Filters</span>
                    </button>
                  </div>
                </div>

                {showCollections ? (
                  <ResearchCollections
                    papers={papers}
                    onCollectionSelect={handleCollectionSelect}
                    onApplyFilter={handleApplyFilter}
                  />
                ) : (
                  <>
                    <CategoryNavigation
                      categories={categories}
                      activeCategory={filters.category}
                      onCategoryChange={(category) => {
                        setFilters(prev => ({ ...prev, category }))
                        setCurrentPage(1)
                        setShowMobileSidebar(false)
                      }}
                    />
                    
                    {showFilters && (
                      <FilterPanel
                        filters={filters}
                        onFiltersChange={(newFilters) => {
                          setFilters(prev => ({ ...prev, ...newFilters }))
                          setCurrentPage(1)
                        }}
                        studyTypes={['clinical-trial', 'review', 'meta-analysis', 'observational', 'case-study']}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Search & Sort Bar */}
            <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search within results..."
                  className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="flex-1 sm:flex-none border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="date">Sort by Date</option>
                  <option value="credibility">Sort by Quality</option>
                  <option value="citations">Sort by Citations</option>
                </select>

                {/* Mobile View Toggle */}
                <div className="flex border border-gray-200 rounded-lg sm:hidden">
                  <button
                    onClick={() => setActiveView('list')}
                    className={`p-2 ${activeView === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`p-2 ${activeView === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Studies */}
            <FeaturedStudies
              papers={filteredAndSortedPapers.slice(0, 3)}
              onSaveStudy={handleSaveStudy}
              savedStudies={savedStudies}
            />

            {/* Studies List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <div className="mb-4 text-xs sm:text-sm text-gray-600">
                Showing {((currentPage - 1) * studiesPerPage) + 1}-{Math.min(currentPage * studiesPerPage, filteredAndSortedPapers.length)} of {filteredAndSortedPapers.length} studies
              </div>
              
              <div className={`grid gap-3 sm:gap-4 ${
                activeView === 'grid' 
                  ? 'grid-cols-1 lg:grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {paginatedPapers.map((paper, idx) => (
                  <StudyCard
                    key={`${paper.doi || paper.title}-${idx}`}
                    paper={paper}
                    viewMode={activeView}
                    isSaved={savedStudies.includes(paper.doi || paper.title)}
                    onSave={() => handleSaveStudy(paper.doi || paper.title)}
                    searchTerm={filters.searchTerm}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 text-sm rounded-lg ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Manager Modal */}
        <ExportManager
          papers={filteredAndSortedPapers}
          savedStudies={savedStudies}
          userQuery={userQuery}
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
      </div>
    </div>
  )
}