'use client'

import Card from '../ui/Card'

interface PremoProduct {
  id: string
  name: string
  category: string
  type: 'indica' | 'sativa' | 'hybrid' | 'cbd'
  thc: number
  cbd: number
  price: number
  image?: string
  description: string
  effects: string[]
  terpenes?: string[]
  inStock: boolean
}

interface PremoProductCardProps {
  product: PremoProduct
}

export default function PremoProductCard({ product }: PremoProductCardProps) {
  const typeColors = {
    indica: 'bg-purple-500',
    sativa: 'bg-green-500',
    hybrid: 'bg-orange-500',
    cbd: 'bg-blue-500'
  }

  const typeLabels = {
    indica: 'Indica',
    sativa: 'Sativa', 
    hybrid: 'Hybrid',
    cbd: 'CBD'
  }

  return (
    <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur">
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-20">
              {product.category === 'flower' ? '🌿' :
               product.category === 'edibles' ? '🍬' :
               product.category === 'vapes' ? '💨' :
               product.category === 'concentrates' ? '💎' : '📦'}
            </div>
          </div>
        )}
        
        {/* Type Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-white text-xs font-bold ${typeColors[product.type]}`}>
          {typeLabels[product.type]}
        </div>

        {/* Stock Badge */}
        {!product.inStock && (
          <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Name and Price */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 flex-1">{product.name}</h3>
          <span className="text-xl font-bold text-emerald-600">${product.price}</span>
        </div>

        {/* THC/CBD Content */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-500">THC:</span>
            <span className="text-sm font-bold text-gray-900">
              {product.category === 'edibles' ? `${product.thc}mg` : `${product.thc}%`}
            </span>
          </div>
          {product.cbd > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-500">CBD:</span>
              <span className="text-sm font-bold text-gray-900">
                {product.category === 'edibles' ? `${product.cbd}mg` : `${product.cbd}%`}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        {/* Effects */}
        <div className="flex flex-wrap gap-1">
          {product.effects.slice(0, 3).map((effect, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full"
            >
              {effect}
            </span>
          ))}
        </div>

        {/* Terpenes (if available) */}
        {product.terpenes && product.terpenes.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Terpenes:</p>
            <div className="flex flex-wrap gap-1">
              {product.terpenes.map((terpene, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full"
                >
                  {terpene}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="pt-3">
          <button 
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              product.inStock 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!product.inStock}
          >
            {product.inStock ? 'View at Premo' : 'Out of Stock'}
          </button>
        </div>

        {/* Premo Location Info */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Available at Premo Cannabis
          </p>
          <p className="text-xs text-gray-400">
            2 E Front St, Keyport, NJ
          </p>
        </div>
      </div>
    </Card>
  )
}