/**
 * Premo Cannabis Demo Integration
 * Frontend customizations for Premo-branded Sage experience
 */

import React from 'react'
import { Product, DemoConfig } from '@/types'

// Premo Cannabis branding configuration
export const premoConfig: DemoConfig = {
  dispensary: {
    name: "Premo Cannabis",
    website: "https://premocannabis.co",
    branding: {
      primaryColor: "#000000",
      accentColor: "#6262F5", 
      textPrimary: "#080808",
      textSecondary: "#626875",
      logo: "/demos/premo/logo.png",
      theme: "dark"
    },
    location: {
      city: "Seattle",
      state: "Washington",
      legalStatus: "recreational-medical"
    }
  },
  sage: {
    greeting: "Hi! I'm your Premo Cannabis AI budtender.",
    personality: "knowledgeable, sophisticated, premium-focused",
    specialties: ["premium flower", "concentrates", "artisan brands"],
    voice: "professional yet approachable"
  }
}

// Premo-specific product categories with enhanced descriptions
export const premoCategories = [
  {
    id: "flower",
    name: "Premium Flower",
    description: "Hand-selected, top-shelf cannabis flower from Washington's finest growers",
    icon: "🌸",
    featured: true
  },
  {
    id: "concentrates", 
    name: "Concentrates",
    description: "Lab-tested rosin, live resin, and distillate from award-winning extractors",
    icon: "💎",
    featured: true
  },
  {
    id: "edibles",
    name: "Edibles",
    description: "Precisely dosed gummies, chocolates, and beverages for every experience level",
    icon: "🍭",
    featured: false
  },
  {
    id: "pre-rolls",
    name: "Pre-Rolls",
    description: "Expertly rolled joints and infused pre-rolls ready to enjoy",
    icon: "🚬", 
    featured: false
  },
  {
    id: "vaporizers",
    name: "Vaporizers", 
    description: "Premium vape cartridges and disposables with pure, clean effects",
    icon: "💨",
    featured: false
  },
  {
    id: "tinctures",
    name: "Tinctures",
    description: "Precise dosing with fast-acting sublingual tinctures",
    icon: "🧴",
    featured: false
  }
]

// Premo-themed Sage App Component
export const PremoSageApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Premo Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/demos/premo/logo.png" 
                alt="Premo Cannabis"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Premo Cannabis</h1>
                <p className="text-sm text-purple-300">AI-Powered Product Discovery</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>📍 Seattle, WA</span>
              <span>•</span> 
              <span>✅ Licensed Retailer</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Sage Interface with Premo Styling */}
      <main className="relative">
        <PremoSageInterface />
      </main>

      {/* Premo Footer */}
      <footer className="bg-black/60 border-t border-purple-500/20 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2024 Premo Cannabis. Licensed Cannabis Retailer in Washington State.</p>
          <p className="mt-2">AI recommendations powered by Sage • Always consume responsibly</p>
        </div>
      </footer>
    </div>
  )
}

// Premo-customized Sage Chat Interface  
const PremoSageInterface: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Premo Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-white">Premo's AI Budtender</h2>
            <p className="text-purple-300">Personalized recommendations from our full menu</p>
          </div>
        </div>
        
        {/* Premo Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">200+</div>
            <div className="text-sm text-purple-300">Premium Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-sm text-purple-300">Curated Brands</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-sm text-purple-300">AI Assistance</div>
          </div>
        </div>
      </div>

      {/* Premo Product Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {premoCategories.filter(cat => cat.featured).map(category => (
          <button
            key={category.id}
            className="bg-gray-800/50 hover:bg-purple-800/30 border border-purple-500/30 rounded-xl p-6 text-left transition-all duration-300 group"
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <h3 className="text-white font-semibold mb-1">{category.name}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{category.description}</p>
          </button>
        ))}
      </div>

      {/* Premo Chat Interface */}
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            Ask me anything about our products
          </h3>
          <p className="text-gray-300">
            I know everything about Premo's inventory, pricing, and effects
          </p>
        </div>
        
        {/* Sample Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {[
            "What's your strongest indica flower?",
            "Show me edibles under $25",
            "Any new concentrates this week?", 
            "Best strains for creativity?"
          ].map(question => (
            <button
              key={question}
              className="text-left p-3 bg-purple-900/20 hover:bg-purple-800/30 rounded-lg text-purple-200 text-sm transition-colors"
            >
              "{question}"
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ask about strains, effects, pricing, or anything else..."
            className="flex-1 bg-gray-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
          />
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Ask Sage
          </button>
        </div>
      </div>
    </div>
  )
}

// Premo Product Display Components
export const PremoProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="bg-gray-800/50 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-400/40 transition-all duration-300">
      {/* Product Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 relative">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {product.category === 'flower' ? '🌸' : 
             product.category === 'edibles' ? '🍭' :
             product.category === 'concentrates' ? '💎' : '🌿'}
          </div>
        )}
        
        {/* In Stock Badge */}
        {product.in_stock && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            In Stock
          </div>
        )}
        
        {/* Price */}
        <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1 rounded-full font-semibold">
          {product.price}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white leading-tight">{product.name}</h3>
          {product.rating && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-400">★</span>
              <span className="text-gray-300">{product.rating}</span>
            </div>
          )}
        </div>
        
        {/* Brand */}
        {product.brand && (
          <p className="text-purple-300 text-sm mb-2">{product.brand}</p>
        )}
        
        {/* Cannabinoids */}
        <div className="flex gap-4 mb-3">
          {product.thc_percentage && (
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{product.thc_percentage}%</div>
              <div className="text-xs text-gray-400">THC</div>
            </div>
          )}
          {product.cbd_percentage && (
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{product.cbd_percentage}%</div>
              <div className="text-xs text-gray-400">CBD</div>
            </div>
          )}
        </div>
        
        {/* Description */}
        {product.description && (
          <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {/* Action Button */}
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors">
          Learn More
        </button>
      </div>
    </div>
  )
}

// Premo-specific Sage responses
export const premoSagePersonality = {
  greeting: "Welcome to Premo Cannabis! I'm your AI budtender, ready to help you find the perfect products from our premium selection.",
  
  productRecommendations: (category: string) => {
    const categoryMap = {
      flower: "Our flower selection features top-shelf strains from Washington's premier cultivators. I can help you find the perfect strain based on your desired effects and experience level.",
      concentrates: "Premo's concentrate collection includes award-winning rosin, live resin, and distillates. These products offer potent, clean effects for experienced users.",
      edibles: "Our edible selection ranges from 2.5mg microdoses to 100mg high-potency options. All products are lab-tested for consistent dosing and quality."
    }
    return categoryMap[category] || `Let me tell you about our ${category} selection at Premo Cannabis.`
  },
  
  locationContext: "As a licensed retailer in Washington State, we follow all regulations and can provide products for both recreational and medical use. We're located in Seattle with convenient pickup options.",
  
  complianceReminder: "Please remember to consume responsibly and keep all cannabis products away from children and pets. You must be 21+ for recreational use or have a valid medical recommendation."
}

export default PremoSageApp