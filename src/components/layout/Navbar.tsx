import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Menu, X, Shield } from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/formatters';
import type { BusinessSettings } from '../../types';

interface NavbarProps {
  settings: BusinessSettings;
  activePage: string;
  setActivePage: (page: string) => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activePage,
  setActivePage,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* Top information bar */}
      <div className="bg-emerald-950 text-white text-xs py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-emerald-200">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{settings.address || 'Bhatti Chowk, Rajnagar, Madhubani, Bihar'}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <a
                href="tel:+917870493385"
                className="text-emerald-100 hover:text-white transition-colors"
              >
                7870493385
              </a>
              <span className="text-emerald-600">/</span>
              <a
                href="tel:+917488473065"
                className="text-emerald-100 hover:text-white transition-colors"
              >
                7488473065
              </a>
            </div>
            <span className="text-emerald-700">|</span>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors cursor-pointer font-medium"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:bg-emerald-700 transition-colors">
            H
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gray-900 block leading-tight">
              {settings.businessName || 'Hafiz G Silai Machine'}
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              Sales, Spare Parts & Machine Service
            </span>
          </div>
        </div>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                activePage === link.id
                  ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-1'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNavClick('contact')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-medium transition cursor-pointer"
            title="View Store on Google Maps"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Map</span>
          </button>
          <a
            href="https://wa.me/917870493385"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="https://wa.me/917870493385"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-emerald-600 text-white rounded-lg"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activePage === link.id
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Admin Management Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
