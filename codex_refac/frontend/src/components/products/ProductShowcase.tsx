'use client'

import { Product } from '@/types'
import { Star, ShieldCheck, Award, ArrowRight, Zap, Heart } from 'lucide-react'

interface ProductShowcaseProps {
  products: Product[]
}

export default function ProductShowcase({ products }: ProductShowcaseProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getCannabinoidInfo = () => {
    const cannabinoids = []
    if (product.cbd_mg) cannabinoids.push({ name: 'CBD', amount: product.cbd_mg, unit: 'mg' })
    if (product.cbg_mg) cannabinoids.push({ name: 'CBG', amount: product.cbg_mg, unit: 'mg' })
    if (product.cbn_mg) cannabinoids.push({ name: 'CBN', amount: product.cbn_mg, unit: 'mg' })
    if (product.cbc_mg) cannabinoids.push({ name: 'CBC', amount: product.cbc_mg, unit: 'mg' })
    if (product.thca_percentage) cannabinoids.push({ name: 'THCA', amount: product.thca_percentage, unit: '%' })
    return cannabinoids
  }

  const getProductTypeGradient = (type: string) => {
    const gradients = {
      'tincture': 'from-primary-500 to-electric-teal',
      'capsule': 'from-electric-blue to-electric-purple',
      'topical': 'from-electric-orange to-electric-pink',
      'edible': 'from-electric-lime to-primary-500',
      'flower': 'from-electric-purple to-electric-pink',
      'beverage': 'from-electric-blue to-electric-teal'
    }
    return gradients[type as keyof typeof gradients] || 'from-primary-500 to-electric-purple'
  }

  const getWhyRecommended = (product: Product) => {
    if (product.effects.includes('sleep')) {
      return "Perfect for nighttime routine based on your sleep interest"
    } else if (product.effects.includes('anxiety')) {
      return "Calming effects align with stress management needs"
    } else if (product.effects.includes('pain-relief')) {
      return "Anti-inflammatory properties for targeted relief"
    } else if (product.effects.includes('energy')) {
      return "Energizing effects for daytime focus and productivity"
    }
    return "Well-balanced formula suitable for your wellness goals"
  }

  return (
    <div 
      className="glass-dark rounded-3xl p-8 hover:bg-white/5 transition-all duration-500 group animate-slide-up"
      style={{animationDelay: `${index * 0.2}s`}}
    >
      {/* Header with Type Badge */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${getProductTypeGradient(product.product_type)} rounded-full text-white text-sm font-medium mb-4`}>
            <Zap className="w-4 h-4 mr-2" />
            {product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1)}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-500 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-dark-400 text-lg font-medium mb-4">{product.brand}</p>
          
          {product.match_score && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-electric-lime fill-current" />
                <span className="text-electric-lime font-semibold text-lg">
                  {Math.round(product.match_score)}% match
                </span>
              </div>
              <span className="text-dark-500">•</span>
              <span className="text-dark-400 text-sm">Based on your needs</span>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-white gradient-text mb-2">
            {formatPrice(product.price)}
          </div>
          {product.lab_tested && (
            <div className="flex items-center gap-1 text-primary-500">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm">Lab Tested</span>
            </div>
          )}
        </div>
      </div>

      {/* Why We Recommend This */}
      <div className="mb-6 p-4 bg-electric-purple/10 rounded-2xl border border-electric-purple/20">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-electric-purple" />
          <span className="text-electric-purple font-semibold">Why we recommend this</span>
        </div>
        <p className="text-dark-300 leading-relaxed">
          {getWhyRecommended(product)}
        </p>
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-dark-300 leading-relaxed mb-6">
          {product.description}
        </p>
      )}

      {/* Cannabinoid Profile */}
      {getCannabinoidInfo().length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Active Compounds</h4>
          <div className="grid grid-cols-2 gap-3">
            {getCannabinoidInfo().map((cannabinoid, idx) => (
              <div key={idx} className="bg-dark-200/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-primary-500">
                  {cannabinoid.amount}{cannabinoid.unit}
                </div>
                <div className="text-dark-400 text-sm font-medium">
                  {cannabinoid.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Effects */}
      {product.effects.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Expected Effects</h4>
          <div className="flex flex-wrap gap-2">
            {product.effects.slice(0, 4).map((effect) => (
              <span
                key={effect}
                className="px-3 py-2 bg-gradient-to-r from-electric-purple/20 to-electric-blue/20 text-electric-purple border border-electric-purple/30 text-sm rounded-full font-medium"
              >
                {effect}
              </span>
            ))}
            {product.effects.length > 4 && (
              <span className="px-3 py-2 bg-dark-200/50 text-dark-400 text-sm rounded-full">
                +{product.effects.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className={`flex-1 bg-gradient-to-r ${getProductTypeGradient(product.product_type)} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all neon-glow disabled:opacity-50`}>
          {product.in_stock ? 'Add to Cart' : 'Notify When Available'}
        </button>
        <button className="px-6 py-4 border-2 border-primary-500 text-primary-500 rounded-2xl font-semibold hover:bg-primary-500 hover:text-white transition-all">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Lab Report Link */}
      {product.lab_report_url && (
        <div className="mt-6 pt-6 border-t border-dark-200">
          <a
            href={product.lab_report_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium"
          >
            <Award className="w-4 h-4" />
            View Third-Party Lab Results
          </a>
        </div>
      )}
    </div>
  )
}