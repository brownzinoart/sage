'use client'

import { useState } from 'react'
import { 
  Sliders, 
  Calendar, 
  Award, 
  FileText,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'

interface FilterPanelProps {
  filters: {
    studyType: string[]
    yearRange: [number, number]
    credibilityScore: [number, number]
    searchTerm: string
    sortBy: string
  }
  onFiltersChange: (filters: any) => void
  studyTypes: string[]
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  studyTypes
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    studyType: true,
    yearRange: true,
    credibilityScore: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleStudyTypeChange = (type: string) => {
    const newTypes = filters.studyType.includes(type)
      ? filters.studyType.filter(t => t !== type)
      : [...filters.studyType, type]
    
    onFiltersChange({ studyType: newTypes })
  }

  const handleYearChange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.yearRange]
    newRange[index] = value
    onFiltersChange({ yearRange: newRange })
  }

  const handleCredibilityChange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.credibilityScore]
    newRange[index] = value
    onFiltersChange({ credibilityScore: newRange })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      studyType: [],
      yearRange: [2020, 2025],
      credibilityScore: [6, 10],
      searchTerm: ''
    })
  }

  const activeFiltersCount = 
    filters.studyType.length + 
    (filters.yearRange[0] !== 2020 || filters.yearRange[1] !== 2025 ? 1 : 0) +
    (filters.credibilityScore[0] !== 6 || filters.credibilityScore[1] !== 10 ? 1 : 0) +
    (filters.searchTerm ? 1 : 0)

  const studyTypeLabels: Record<string, string> = {
    'clinical-trial': 'Clinical Trials',
    'review': 'Systematic Reviews',
    'meta-analysis': 'Meta-Analyses',
    'observational': 'Observational Studies',
    'case-study': 'Case Studies'
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50/50">
      
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Study Type Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('studyType')}
          className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Study Type</span>
            {filters.studyType.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                {filters.studyType.length}
              </span>
            )}
          </div>
          {expandedSections.studyType ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.studyType && (
          <div className="mt-2 pl-6 space-y-2">
            {studyTypes.map(type => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.studyType.includes(type)}
                  onChange={() => handleStudyTypeChange(type)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{studyTypeLabels[type] || type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Year Range Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('yearRange')}
          className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Publication Year</span>
            <span className="text-xs text-gray-500">
              {filters.yearRange[0]} - {filters.yearRange[1]}
            </span>
          </div>
          {expandedSections.yearRange ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.yearRange && (
          <div className="mt-2 pl-6 space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">From Year</label>
              <input
                type="range"
                min="2000"
                max="2025"
                value={filters.yearRange[0]}
                onChange={(e) => handleYearChange(0, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2000</span>
                <span className="font-medium text-gray-700">{filters.yearRange[0]}</span>
                <span>2025</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">To Year</label>
              <input
                type="range"
                min="2000"
                max="2025"
                value={filters.yearRange[1]}
                onChange={(e) => handleYearChange(1, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2000</span>
                <span className="font-medium text-gray-700">{filters.yearRange[1]}</span>
                <span>2025</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Credibility Score Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('credibilityScore')}
          className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Quality Score</span>
            <span className="text-xs text-gray-500">
              {filters.credibilityScore[0]} - {filters.credibilityScore[1]}/10
            </span>
          </div>
          {expandedSections.credibilityScore ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.credibilityScore && (
          <div className="mt-2 pl-6 space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Minimum Score</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={filters.credibilityScore[0]}
                onChange={(e) => handleCredibilityChange(0, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1.0</span>
                <span className="font-medium text-gray-700">{filters.credibilityScore[0]}</span>
                <span>10.0</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Maximum Score</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={filters.credibilityScore[1]}
                onChange={(e) => handleCredibilityChange(1, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1.0</span>
                <span className="font-medium text-gray-700">{filters.credibilityScore[1]}</span>
                <span>10.0</span>
              </div>
            </div>

            {/* Quality Guidelines */}
            <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Gold Standard:</span>
                  <span className="font-medium">8.0 - 10.0</span>
                </div>
                <div className="flex justify-between">
                  <span>High Quality:</span>
                  <span className="font-medium">6.0 - 7.9</span>
                </div>
                <div className="flex justify-between">
                  <span>Moderate:</span>
                  <span className="font-medium">4.0 - 5.9</span>
                </div>
                <div className="flex justify-between">
                  <span>Limited:</span>
                  <span className="font-medium">1.0 - 3.9</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
        }

        .slider::-moz-range-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}