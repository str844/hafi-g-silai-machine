import React from 'react';
import { MapPin, Phone, MessageCircle, CheckCircle, Shield, ShoppingBag, Wrench, HeartHandshake } from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/formatters';
import type { BusinessSettings } from '../../types';

interface AboutPageProps {
  settings: BusinessSettings;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-md uppercase tracking-wider">
          About Hafiz G Silai Machine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Your Local Sewing Machine Specialist
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Providing sewing machines, authentic spare parts, tailoring accessories, and dependable
          servicing directly from our shop in Rajnagar, Madhubani.
        </p>
      </div>

      {/* Main Story Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="prose text-gray-700 max-w-none space-y-4 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to <strong className="text-gray-900">{settings.businessName}</strong>. Located
            prominently at <strong>Bhatti Chowk, Rajnagar, Madhubani, Bihar</strong>, we serve local
            tailors, garment artisans, boutique owners, and household customers with high quality
            sewing machines and related equipment.
          </p>

          <p>
            {settings.aboutText ||
              'A sewing machine is an essential machine for households and tailoring livelihoods. We understand how critical reliable stitch quality, smooth operation, and easy access to spare parts are. Our goal is to ensure you get the right machine for your workload and have ongoing support for maintenance, spare parts, and servicing.'}
          </p>

          <p>
            Whether you are looking to purchase a new domestic machine, a tailor deluxe umbrella
            machine with wooden table and cast iron stand, or high-speed industrial lockstitch
            equipment, we provide genuine products with warranty and initial testing.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-gray-900 text-sm">Genuine Products</h4>
            <p className="text-xs text-gray-600">
              Direct supply of authentic sewing machines and genuine manufacturer spare parts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-gray-900 text-sm">Practical Servicing</h4>
            <p className="text-xs text-gray-600">
              Hands-on diagnosis, timing correction, and repairs done right at our local shop.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-gray-900 text-sm">Customer Guidance</h4>
            <p className="text-xs text-gray-600">
              Clear advice on needle sizes, thread tensions, and machine maintenance.
            </p>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Visit Us At Our Shop</h3>
        <div className="space-y-2 text-sm text-emerald-100">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Address:</strong> {settings.address || 'Bhatti Chowk, Rajnagar, Madhubani, Bihar, India'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Phone:</strong> 7870493385
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <a
            href="https://wa.me/917870493385"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp Us</span>
          </a>
          <a
            href="tel:+917870493385"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Call Us
          </a>
        </div>
      </div>
    </div>
  );
};
