import React, { useState, useMemo } from 'react';
import { Search, Filter, MessageCircle, X, Shield, Wrench, CheckCircle2 } from 'lucide-react';
import { formatCurrency, getWhatsAppUrl } from '../../utils/formatters';
import type { BusinessSettings, Product } from '../../types';

interface ProductsPageProps {
  settings: BusinessSettings;
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  settings,
  products,
  selectedProduct,
  setSelectedProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');

  const categories = ['All', 'Sewing Machines', 'Spare Parts', 'Accessories'];

  // Distinct brands list
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
    return ['All', ...list.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.status === 'Active')
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchModel = p.model?.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          const matchPart = p.partNumber?.toLowerCase().includes(q);
          return matchName || matchBrand || matchModel || matchSku || matchPart;
        }
        return true;
      });
  }, [products, selectedCategory, selectedBrand, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Products & Spare Parts
        </h1>
        <p className="text-gray-600 text-sm">
          Browse our in-stock sewing machines, replacement parts, and accessories available at{' '}
          <span className="font-semibold text-gray-800">{settings.businessName}</span>, Bhatti
          Chowk, Rajnagar, Madhubani.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by machine name, brand, model or SKU..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown (mobile or quick filter) */}
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b === 'All' ? 'All Brands' : b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-500 self-center mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
          {(selectedCategory !== 'All' || selectedBrand !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedBrand('All');
                setSearchQuery('');
              }}
              className="text-xs text-red-600 hover:underline px-2 py-1 cursor-pointer self-center"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-800">{filteredProducts.length}</span>{' '}
        products
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 space-y-3">
          <p className="text-gray-500 text-base">No products match your current search and filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBrand('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col"
            >
              <div className="relative h-44 bg-gray-50 overflow-hidden">
                <img
                  src={
                    product.imageUrl ||
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/400x300?text=Silai+Machine';
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-white/95 text-[11px] font-bold text-gray-800 rounded shadow-xs">
                    {product.brand}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded shadow-xs ${
                      product.currentStock > 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {product.currentStock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mt-0.5">
                    {product.name}
                  </h3>
                  {product.model && (
                    <p className="text-xs text-gray-500 mt-0.5">Model: {product.model}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Selling Price</span>
                    <span className="text-base font-extrabold text-emerald-800">
                      {formatCurrency(product.sellingPrice)}
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/917870493385?text=${encodeURIComponent(
                      `Hello Hafiz G Silai Machine, I am interested in: ${product.name} (${product.brand}) priced at ${formatCurrency(product.sellingPrice)}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition-colors"
                    title="Enquire on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="h-64 sm:h-80 bg-gray-100 overflow-hidden">
                <img
                  src={
                    selectedProduct.imageUrl ||
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-md">
                    {selectedProduct.category}
                  </span>
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded-md">
                    Brand: {selectedProduct.brand}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${
                      selectedProduct.currentStock > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {selectedProduct.currentStock > 0
                      ? `In Stock (${selectedProduct.currentStock} ${selectedProduct.unit})`
                      : 'Out of Stock'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 pt-1">{selectedProduct.name}</h2>
                {selectedProduct.model && (
                  <p className="text-sm text-gray-500">Model: {selectedProduct.model}</p>
                )}
              </div>

              {/* Price Callout */}
              <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-medium block">Store Price</span>
                  <span className="text-2xl font-extrabold text-emerald-900">
                    {formatCurrency(selectedProduct.sellingPrice)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">/ {selectedProduct.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">SKU / Code</span>
                  <span className="text-xs font-mono font-bold text-gray-700">
                    {selectedProduct.sku || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description & Specifications
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Specific features based on category */}
              {selectedProduct.category === 'Sewing Machines' && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-3 text-xs">
                  {selectedProduct.serialNumber && (
                    <div>
                      <span className="text-gray-500 block">Machine Serial No:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedProduct.serialNumber}
                      </span>
                    </div>
                  )}
                  {selectedProduct.warrantyPeriod && (
                    <div>
                      <span className="text-gray-500 block">Warranty Period:</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        {selectedProduct.warrantyPeriod}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {selectedProduct.category === 'Spare Parts' && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-3 text-xs">
                  {selectedProduct.partNumber && (
                    <div>
                      <span className="text-gray-500 block">Part Number:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedProduct.partNumber}
                      </span>
                    </div>
                  )}
                  {selectedProduct.compatibleModels && (
                    <div className="col-span-2">
                      <span className="text-gray-500 block">Compatible Machines:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedProduct.compatibleModels}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Shop Guarantees */}
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Available for immediate pickup or delivery at our shop in Rajnagar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free installation check & initial testing before handover</span>
                </div>
              </div>

              {/* Modal CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`https://wa.me/917870493385?text=${encodeURIComponent(
                    `Hello Hafiz G Silai Machine, I want to purchase or check availability for: ${selectedProduct.name} (Price: ${formatCurrency(selectedProduct.sellingPrice)}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Inquire on WhatsApp</span>
                </a>

                <a
                  href="tel:+917870493385"
                  className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-center transition-colors"
                >
                  Call Shop
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
