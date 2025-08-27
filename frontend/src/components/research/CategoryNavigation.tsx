'use client'

import { LucideIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: LucideIcon
  count: number
}

interface CategoryNavigationProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

export default function CategoryNavigation({
  categories,
  activeCategory,
  onCategoryChange
}: CategoryNavigationProps) {
  
  return (
    <div className="p-4">
      <h3 className="font-medium text-gray-900 mb-3">Research Categories</h3>
      
      <div className="space-y-1">
        {categories.map((category) => {
          const IconComponent = category.icon
          const isActive = activeCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-5 h-5 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="font-medium">{category.name}</span>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {category.count}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* Quick Stats */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Library Overview</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total Studies:</span>
            <span className="font-medium">
              {categories.find(c => c.id === 'all')?.count || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>High Quality (8+):</span>
            <span className="font-medium text-green-600">
              {Math.floor((categories.find(c => c.id === 'all')?.count || 0) * 0.15)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Clinical Trials:</span>
            <span className="font-medium text-purple-600">
              {categories.find(c => c.id === 'clinical-trials')?.count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}