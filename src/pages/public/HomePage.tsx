import React, { useState } from 'react';
import {
  MessageCircle,
  ShoppingBag,
  Wrench,
  CheckCircle,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Navigation,
} from 'lucide-react';
import { formatCurrency, getWhatsAppUrl } from '../../utils/formatters';
import { GoogleShopMap } from '../../components/common/GoogleShopMap';
import type { BusinessSettings, Product } from '../../types';

interface HomePageProps {
  settings: BusinessSettings;
  products: Product[];
  onNavigate: (page: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  products,
  onNavigate,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Sewing Machines', 'Spare Parts', 'Accessories'];

  const filteredProducts = products
    .filter((p) => p.status === 'Active')
    .filter((p) => (selectedCategory === 'All' ? true : p.category === selectedCategory))
    .slice(0, 6);

  const whatsappMessage =
    'Hello Hafiz G Silai Machine, I would like to inquire about your sewing machines and services.';

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
        {/* Background subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-200 text-xs sm:text-sm font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{settings.address || 'Bhatti Chowk, Rajnagar, Madhubani, Bihar'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {settings.businessName || 'Hafiz G Silai Machine'}
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/90 max-w-3xl mx-auto leading-relaxed">
            {settings.tagline ||
              'Quality sewing machines, spare parts, accessories and reliable repair & service support.'}
          </p>

          <p className="text-xs sm:text-sm text-emerald-300/80 font-medium">
            Your Trusted Sewing Machine Partner in Rajnagar, Madhubani
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="https://wa.me/917870493385"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 text-base"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Contact on WhatsApp</span>
            </a>

            <button
              onClick={() => onNavigate('products')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-xs transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>View Products</span>
            </button>
          </div>
        </div>
      </section>

      {/* Highlights 4-box banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Machine Sales</h4>
              <p className="text-[11px] text-gray-500">Domestic & Industrial</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Repair & Service</h4>
              <p className="text-[11px] text-gray-500">Expert diagnosis</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Spare Parts</h4>
              <p className="text-[11px] text-gray-500">Shuttles, needles & feet</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Accessories</h4>
              <p className="text-[11px] text-gray-500">Motors, stands & bobbins</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-md uppercase tracking-wider">
              About Our Business
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Hafiz G Silai Machine
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {settings.aboutText ||
                'Hafiz G Silai Machine is located at Bhatti Chowk, Rajnagar, Madhubani, Bihar. We provide new sewing machines, genuine spare parts, tailoring accessories, and prompt machine servicing for home sewers, tailoring boutiques, and garment workshops.'}
            </p>

            <div className="space-y-2 pt-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Genuine sewing machines from leading brands</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complete spare parts for domestic, umbrella, and industrial models</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reliable repair, timing adjustment, and regular maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct in-person consultation and guidance at our shop</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="text-emerald-700 hover:text-emerald-800 font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Read more about us</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
                alt="Hafiz G Silai Machine Shop"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-emerald-900 text-white p-4 rounded-xl shadow-lg border border-emerald-700 hidden sm:block">
              <div className="text-xs text-emerald-300 font-medium">Shop Location</div>
              <div className="text-sm font-bold">Bhatti Chowk, Rajnagar</div>
              <div className="text-xs text-emerald-200">Madhubani, Bihar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Shop Inventory
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Products & Parts
            </h2>
            <p className="text-sm text-gray-500">
              Explore sewing machines, authentic spare parts, and essential tailoring equipment.
            </p>
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            No products available in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
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
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-gray-800 rounded-md shadow-xs">
                      {product.brand}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md shadow-xs ${
                        product.currentStock > 0
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {product.currentStock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 mt-0.5">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-400 block">Price</span>
                      <span className="text-lg font-extrabold text-emerald-800">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-emerald-600 group-hover:underline flex items-center gap-1">
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Services Overview */}
      <section className="bg-gray-50 py-12 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Services We Provide
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Comprehensive support for tailoring shops, master tailors, and household machine owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Sewing Machine Sales</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Brand new domestic, tailor umbrella, and direct-drive industrial lockstitch machines with official warranty and setup.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Repair & Servicing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Expert timing correction, shuttle race tuning, needle bar alignment, motor fitting, and full overhaul of sluggish machines.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Genuine Spare Parts</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Authentic shuttle assemblies, tension springs, bobbins, cases, feed dogs, pressure feet, and oil bottles in stock.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('services')}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Explore All Services
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Google Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Store Location
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              Visit Our Shop in Rajnagar, Madhubani
            </h3>
            <p className="text-sm text-gray-500">
              Centrally located at Bhatti Chowk. Click the interactive map for driving directions and navigation.
            </p>
          </div>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=26.4172,86.0825"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </a>
        </div>

        <GoogleShopMap height="360px" />
      </section>

      {/* Store Location & WhatsApp Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-emerald-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Visit Us In Person</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have Questions or Need Machine Repair?
            </h3>
            <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
              Visit our shop at Bhatti Chowk, Rajnagar, Madhubani or message us directly on WhatsApp for machine prices, spare parts, and repair status.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="https://wa.me/917870493385"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>WhatsApp Us</span>
            </a>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <a
                href="tel:+917870493385"
                className="w-full sm:w-auto px-4 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>7870493385</span>
              </a>
              <a
                href="tel:+917488473065"
                className="w-full sm:w-auto px-4 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>7488473065</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
