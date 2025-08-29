import React from 'react';
import { Leaf, Droplets, Flask, Package, Info } from 'lucide-react';

interface THCProductProps {
  product: {
    name: string;
    brand: string;
    category: string;
    strain_type: string;
    thc_percentage?: number;
    thc_mg?: number;
    cbd_percentage?: number;
    cbd_mg?: number;
    price: number;
    weight_grams?: number;
    unit_count?: number;
    description: string;
    effects: string[];
    terpenes: Record<string, number>;
    dominant_terpene?: string;
    lab_tested: boolean;
    in_stock: boolean;
  };
  onAddToCart?: (product: any) => void;
}

const THCProductCard: React.FC<THCProductProps> = ({ product, onAddToCart }) => {
  const getCategoryIcon = () => {
    switch (product.category) {
      case 'flower':
        return <Leaf className="w-5 h-5" />;
      case 'edibles':
        return <Package className="w-5 h-5" />;
      case 'vapes':
      case 'concentrates':
        return <Droplets className="w-5 h-5" />;
      default:
        return <Flask className="w-5 h-5" />;
    }
  };

  const getStrainColor = () => {
    switch (product.strain_type) {
      case 'indica':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sativa':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'hybrid':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTHC = () => {
    if (product.thc_percentage) {
      return `${product.thc_percentage}% THC`;
    } else if (product.thc_mg) {
      return `${product.thc_mg}mg THC`;
    }
    return 'THC info N/A';
  };

  const formatSize = () => {
    if (product.weight_grams) {
      return `${product.weight_grams}g`;
    } else if (product.unit_count) {
      return `${product.unit_count} units`;
    }
    return '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 ${!product.in_stock ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-50 rounded-lg">
            {getCategoryIcon()}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.brand}</p>
          </div>
        </div>
        
        {product.lab_tested && (
          <div className="flex items-center space-x-1 text-green-600">
            <Flask className="w-4 h-4" />
            <span className="text-xs">Lab Tested</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStrainColor()}`}>
          {product.strain_type}
        </span>
        <span className="text-sm font-semibold text-gray-700">
          {formatTHC()}
        </span>
        {product.cbd_percentage && (
          <span className="text-sm text-gray-600">
            | {product.cbd_percentage}% CBD
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {product.description}
      </p>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-700 mb-2">Effects:</p>
        <div className="flex flex-wrap gap-1">
          {product.effects.slice(0, 4).map((effect, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              {effect}
            </span>
          ))}
        </div>
      </div>

      {product.dominant_terpene && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700">
            Dominant Terpene: <span className="text-green-600">{product.dominant_terpene}</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            ${product.price}
          </p>
          {formatSize() && (
            <p className="text-xs text-gray-600">{formatSize()}</p>
          )}
        </div>
        
        <button
          onClick={() => onAddToCart?.(product)}
          disabled={!product.in_stock}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            product.in_stock
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>

      {!product.in_stock && (
        <div className="mt-3 flex items-center space-x-1 text-amber-600">
          <Info className="w-4 h-4" />
          <span className="text-xs">Check back soon for availability</span>
        </div>
      )}
    </div>
  );
};

export default THCProductCard;