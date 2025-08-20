'use client'

import { Product } from '@/types'
import { Star, Award, ShieldCheck } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">No products to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getCannabinoidInfo = () => {
    const cannabinoids = []
    if (product.cbd_mg) cannabinoids.push(`CBD: ${product.cbd_mg}mg`)
    if (product.cbg_mg) cannabinoids.push(`CBG: ${product.cbg_mg}mg`)
    if (product.cbn_mg) cannabinoids.push(`CBN: ${product.cbn_mg}mg`)
    if (product.cbc_mg) cannabinoids.push(`CBC: ${product.cbc_mg}mg`)
    if (product.thca_percentage) cannabinoids.push(`THCA: ${product.thca_percentage}%`)
    return cannabinoids
  }

  const getProductTypeColor = (type: string) => {
    const colors = {
      'tincture': 'bg-primary-100 text-primary-700',
      'capsule': 'bg-accent-sky text-blue-700',
      'topical': 'bg-accent-peach text-orange-700',
      'edible': 'bg-accent-sand text-yellow-700',
      'flower': 'bg-accent-lavender text-purple-700',
      'beverage': 'bg-accent-rose text-pink-700'
    }
    return colors[type as keyof typeof colors] || 'bg-neutral-100 text-neutral-700'
  }

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-6 zen-hover transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-neutral-800 font-heading text-lg">
              {product.name}
            </h3>
            {product.lab_tested && (
              <ShieldCheck className="w-4 h-4 text-primary-500" title="Lab Tested" />
            )}
          </div>
          <p className="text-sm text-neutral-500 mb-2">{product.brand}</p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getProductTypeColor(product.product_type)}`}>
              {product.product_type}
            </span>
            {product.match_score && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-current" />
                <span className="text-xs text-neutral-500">
                  {Math.round(product.match_score)}% match
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-neutral-800 font-heading">
            {formatPrice(product.price)}
          </div>
          {!product.in_stock && (
            <span className="text-sm text-red-500">Out of Stock</span>
          )}
        </div>
      </div>

      {product.description && (
        <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Cannabinoid Info */}
      {getCannabinoidInfo().length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Cannabinoids</h4>
          <div className="flex flex-wrap gap-2">
            {getCannabinoidInfo().map((info, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md"
              >
                {info}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Effects */}
      {product.effects.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Effects</h4>
          <div className="flex flex-wrap gap-2">
            {product.effects.slice(0, 4).map((effect) => (
              <span
                key={effect}
                className="px-2 py-1 bg-accent-lavender text-purple-700 text-xs rounded-md"
              >
                {effect}
              </span>
            ))}
            {product.effects.length > 4 && (
              <span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-xs rounded-md">
                +{product.effects.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-xl hover:bg-primary-600 transition-colors text-sm font-medium">
          Learn More
        </button>
        <button 
          className="px-4 py-2 border border-primary-200 text-primary-700 rounded-xl hover:bg-primary-50 transition-colors text-sm font-medium"
          disabled={!product.in_stock}
        >
          {product.in_stock ? 'Add to Cart' : 'Notify Me'}
        </button>
      </div>

      {/* Lab Report Link */}
      {product.lab_report_url && (
        <div className="pt-3 border-t border-neutral-100 mt-4">
          <a
            href={product.lab_report_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <Award className="w-3 h-3" />
            View Lab Report
          </a>
        </div>
      )}
    </div>
  )
}