import React from 'react';
import { MapPin, Phone, MessageCircle, Mail, Shield } from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/formatters';
import type { BusinessSettings } from '../../types';

interface FooterProps {
  settings: BusinessSettings;
  setActivePage: (page: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  setActivePage,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {settings.businessName || 'Hafiz G Silai Machine'}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {settings.tagline ||
                'Quality sewing machines, genuine spare parts, tailoring accessories and expert repair & service support in Rajnagar, Madhubani.'}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    setActivePage('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('products');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Products Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Machine Repairs & Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  About Our Shop
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Contact & Directions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Our Specializations
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>• Domestic & Umbrella Sewing Machines</li>
              <li>• Industrial High-Speed Lockstitch Units</li>
              <li>• Genuine Replacement Spare Parts</li>
              <li>• Tailoring Motors, Stands & Tables</li>
              <li>• Precision Machine Servicing & Tune-ups</li>
              <li>• Needles, Bobbins & Lubrication Oil</li>
            </ul>
          </div>

          {/* Col 4: Store Location & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Shop Location
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.address || 'Bhatti Chowk, Rajnagar, Madhubani, Bihar, India'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex items-center gap-2">
                  <a href="tel:+917870493385" className="hover:text-white transition-colors">
                    7870493385
                  </a>
                  <span>/</span>
                  <a href="tel:+917488473065" className="hover:text-white transition-colors">
                    7488473065
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/917870493385"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition-colors"
                >
                  WhatsApp: 7870493385
                </a>
              </div>
              {settings.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{settings.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Hafiz G Silai Machine. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Bhatti Chowk, Rajnagar, Madhubani</span>
            <span>•</span>
            <button
              onClick={onOpenAdmin}
              className="text-gray-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Shop Admin System</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
