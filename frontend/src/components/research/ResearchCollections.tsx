'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Moon, 
  Heart, 
  Zap, 
  Shield, 
  Brain,
  Leaf,
  FlaskConical,
  Users,
  Calendar,
  ChevronRight,
  Star
} from 'lucide-react'
import { ResearchPaper } from '@/types'

interface Collection {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  studyCount: number
  featured: boolean
  keywords: string[]
  conditions: string[]
}

interface ResearchCollectionsProps {
  papers: ResearchPaper[]
  onCollectionSelect: (collection: Collection) => void
  onApplyFilter: (filter: any) => void
}

export default function ResearchCollections({
  papers,
  onCollectionSelect,
  onApplyFilter
}: ResearchCollectionsProps) {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)

  // Define curated collections based on research capacity analysis
  const collections: Collection[] = [
    {
      id: 'sleep-disorders',
      name: 'Sleep & Rest',
      description: 'CBD, CBN, and hemp compounds for sleep disorders and insomnia',
      icon: Moon,
      color: 'from-indigo-500 to-purple-600',
      studyCount: 1500,
      featured: true,
      keywords: ['sleep', 'insomnia', 'cbn', 'melatonin', 'circadian'],
      conditions: ['insomnia', 'sleep disorders', 'sleep quality']
    },
    {
      id: 'anxiety-mood',
      name: 'Anxiety & Mood',
      description: 'Research on cannabinoids for anxiety, stress, and mood disorders',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      studyCount: 2800,
      featured: true,
      keywords: ['anxiety', 'stress', 'depression', 'mood', 'gaba'],
      conditions: ['anxiety disorders', 'depression', 'ptsd', 'social anxiety']
    },
    {
      id: 'pain-management',
      name: 'Pain Management',
      description: 'Chronic pain, inflammation, and analgesic research',
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      studyCount: 3200,
      featured: true,
      keywords: ['pain', 'analgesia', 'chronic pain', 'neuropathic', 'arthritis'],
      conditions: ['chronic pain', 'arthritis', 'neuropathic pain', 'fibromyalgia']
    },
    {
      id: 'inflammation',
      name: 'Inflammation Research',
      description: 'Anti-inflammatory properties and immune system modulation',
      icon: Shield,
      color: 'from-green-500 to-emerald-600',
      studyCount: 2500,
      featured: true,
      keywords: ['inflammation', 'cytokines', 'immune', 'autoimmune', 'inflammatory'],
      conditions: ['inflammatory bowel disease', 'rheumatoid arthritis', 'multiple sclerosis']
    },
    {
      id: 'neuroprotection',
      name: 'Brain Health',
      description: 'Neuroprotective effects and cognitive health research',
      icon: Brain,
      color: 'from-blue-500 to-cyan-600',
      studyCount: 1800,
      featured: false,
      keywords: ['neuroprotective', 'alzheimer', 'parkinson', 'cognitive', 'brain'],
      conditions: ['alzheimers disease', 'parkinsons disease', 'epilepsy', 'dementia']
    },
    {
      id: 'epilepsy-seizures',
      name: 'Epilepsy & Seizures',
      description: 'CBD research for epilepsy, seizures, and neurological disorders',
      icon: Leaf,
      color: 'from-teal-500 to-green-600',
      studyCount: 1800,
      featured: false,
      keywords: ['epilepsy', 'seizure', 'dravet', 'lennox-gastaut', 'anticonvulsant'],
      conditions: ['epilepsy', 'dravet syndrome', 'lennox-gastaut syndrome']
    },
    {
      id: 'clinical-trials',
      name: 'Clinical Trials',
      description: 'Human clinical trials and FDA-approved studies',
      icon: FlaskConical,
      color: 'from-purple-500 to-violet-600',
      studyCount: 563,
      featured: false,
      keywords: ['clinical trial', 'phase', 'randomized', 'placebo', 'human'],
      conditions: ['various conditions', 'clinical research']
    },
    {
      id: 'cancer-research',
      name: 'Cancer Research',
      description: 'Anticancer properties and supportive care research',
      icon: Users,
      color: 'from-red-500 to-pink-600',
      studyCount: 900,
      featured: false,
      keywords: ['cancer', 'tumor', 'oncology', 'chemotherapy', 'palliative'],
      conditions: ['various cancers', 'chemotherapy side effects', 'cancer pain']
    }
  ]

  // Filter papers for a specific collection
  const getCollectionPapers = (collection: Collection) => {
    return papers.filter(paper => {
      const title = paper.title.toLowerCase()
      const abstract = paper.abstract.toLowerCase()
      
      return collection.keywords.some(keyword => 
        title.includes(keyword.toLowerCase()) || 
        abstract.includes(keyword.toLowerCase())
      )
    })
  }

  const handleCollectionClick = (collection: Collection) => {
    setSelectedCollection(collection.id)
    
    // Apply filter to show only papers from this collection
    const collectionFilter = {
      category: collection.id,
      searchTerm: collection.keywords[0] // Use primary keyword as search term
    }
    
    onApplyFilter(collectionFilter)
    onCollectionSelect(collection)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Research Collections</h2>
        <p className="text-gray-600">Curated studies organized by condition and compound</p>
      </div>

      {/* Featured Collections */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Featured Collections
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {collections.filter(c => c.featured).map((collection) => {
            const IconComponent = collection.icon
            const collectionPapers = getCollectionPapers(collection)
            const isSelected = selectedCollection === collection.id
            
            return (
              <button
                key={collection.id}
                onClick={() => handleCollectionClick(collection)}
                className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${collection.color}`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {collectionPapers.length}
                    </div>
                    <div className="text-xs text-gray-500">studies</div>
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-1">{collection.name}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {collection.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {collection.keywords.slice(0, 3).map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* All Collections */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">All Collections</h3>
        
        <div className="grid gap-3">
          {collections.map((collection) => {
            const IconComponent = collection.icon
            const collectionPapers = getCollectionPapers(collection)
            const isSelected = selectedCollection === collection.id
            
            return (
              <button
                key={collection.id}
                onClick={() => handleCollectionClick(collection)}
                className={`flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${collection.color} flex-shrink-0`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{collection.name}</h4>
                    {collection.featured && (
                      <Star className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{collection.description}</p>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-gray-900">{collectionPapers.length}</div>
                  <div className="text-xs text-gray-500">studies</div>
                </div>
                
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-2">Collection Overview</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {collections.filter(c => c.featured).length}
            </div>
            <div className="text-xs text-gray-600">Featured</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {collections.reduce((sum, c) => sum + getCollectionPapers(c).length, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Studies</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {collections.length}
            </div>
            <div className="text-xs text-gray-600">Collections</div>
          </div>
        </div>
      </div>
    </div>
  )
}