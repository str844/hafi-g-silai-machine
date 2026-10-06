import React from 'react';
import { MapPin, Phone, MessageCircle, Mail, Navigation, Clock } from 'lucide-react';
import { GoogleShopMap } from '../../components/common/GoogleShopMap';
import type { BusinessSettings } from '../../types';

interface ContactPageProps {
  settings: BusinessSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const directionsUrl = settings.googleMapsUrl || 'https://share.google/UsmUAsmxJWu4JPMyA';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Contact Us</h1>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          Visit our shop in Rajnagar or reach out via WhatsApp and phone for product queries,
          machine orders, and repairs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Shop Details
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              {settings.businessName || 'Hafiz G Silai Machine'}
            </h2>
          </div>

          <div className="space-y-5 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 block">Address</span>
                <p className="text-gray-600 leading-relaxed mt-0.5">
                  {settings.address || 'Bhatti Chowk, Rajnagar, Madhubani, Bihar, India'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-gray-900 block">Phone Numbers</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <a
                    href="tel:+917870493385"
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    +91 7870493385
                  </a>
                  <span className="text-gray-300">|</span>
                  <a
                    href="tel:+917488473065"
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    +91 7488473065
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 block">WhatsApp Number</span>
                <a
                  href="https://wa.me/917870493385"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline font-medium block mt-0.5"
                >
                  7870493385
                </a>
              </div>
            </div>

            {settings.email && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block">Email</span>
                  <p className="text-gray-600 mt-0.5">{settings.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 block">Shop Hours</span>
                <p className="text-gray-600 mt-0.5">Monday – Saturday: 9:00 AM – 8:00 PM</p>
                <p className="text-gray-500 text-xs mt-0.5">Sunday: 10:00 AM – 4:00 PM</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/917870493385"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>WhatsApp</span>
            </a>

            <a
              href="tel:+917870493385"
              className="flex-1 py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-center flex items-center justify-center gap-2 transition-colors border border-emerald-200"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

        {/* Directions & Location Map Display */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Interactive Location Map</h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Google Map
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our shop is centrally located at <strong>Bhatti Chowk</strong> in Rajnagar, Madhubani.
            Easily accessible from all tailoring centers, market roads, and surrounding villages.
          </p>

          <GoogleShopMap height="320px" showCard={false} />

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Need machine repair pickup or large delivery?</span>
            <p>
              Please call or message us before bringing heavy industrial sewing machines or stands so
              our technician is on-site to assist immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
