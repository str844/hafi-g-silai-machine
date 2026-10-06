import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';

// Coordinates for Hafiz G Silai Machine at Bhatti Chowk, Rajnagar, Madhubani, Bihar
export const SHOP_COORDINATES = {
  lat: 26.4172,
  lng: 86.0825,
};

// Official Google Maps listing provided by shop owner
export const SHOP_GOOGLE_MAPS_URL = 'https://share.google/UsmUAsmxJWu4JPMyA';

interface GoogleShopMapProps {
  height?: string;
  zoom?: number;
  showCard?: boolean;
}

export const GoogleShopMap: React.FC<GoogleShopMapProps> = ({
  height = '420px',
  zoom = 16,
  showCard = true,
}) => {
  const [infoOpen, setInfoOpen] = useState(true);
  const [hasMapError, setHasMapError] = useState(false);

  // ONLY use official environment variable VITE_GOOGLE_MAPS_API_KEY (avoid using Firebase auth key)
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // Listen for Google Maps auth or activation failures
  useEffect(() => {
    const handleAuthFailure = () => setHasMapError(true);
    window.addEventListener('gmp-auth-failure', handleAuthFailure);
    return () => window.removeEventListener('gmp-auth-failure', handleAuthFailure);
  }, []);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=Hafi+g+silai+machine,+rajnagar`;
  const viewMapUrl = SHOP_GOOGLE_MAPS_URL;
  const embedMapUrl = `https://maps.google.com/maps?q=Hafi+g+silai+machine+rajnagar&hl=en&z=${zoom}&output=embed`;

  // If no activated JavaScript API key is provided or if authentication failed,
  // render the seamless Google Maps Embed with interactive controls
  if (!apiKey || hasMapError) {
    return (
      <div
        style={{ height }}
        className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 flex flex-col"
      >
        <iframe
          title="Hafiz G Silai Machine Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedMapUrl}
          className="w-full h-full flex-1"
        />

        {showCard && (
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg border border-slate-200/80 max-w-xs hidden sm:block">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs mb-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hafiz G Silai Machine</span>
            </div>
            <div className="text-[11px] text-gray-600 mb-2.5">
              Bhatti Chowk, Rajnagar, Madhubani, Bihar
            </div>
            <div className="flex items-center gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm transition"
              >
                <Navigation className="w-3 h-3" />
                Get Directions
              </a>
              <a
                href={viewMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-slate-100 hover:bg-slate-200 rounded transition"
              >
                <ExternalLink className="w-3 h-3" />
                Open App
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  // When a valid VITE_GOOGLE_MAPS_API_KEY is configured, render official @vis.gl/react-google-maps
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <div style={{ height, width: '100%' }}>
        <APIProvider apiKey={apiKey} onError={() => setHasMapError(true)}>
          <Map
            defaultCenter={SHOP_COORDINATES}
            defaultZoom={zoom}
            mapId="DEMO_MAP_ID"
            gestureHandling="cooperative"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <AdvancedMarker
              position={SHOP_COORDINATES}
              onClick={() => setInfoOpen(true)}
              title="Hafiz G Silai Machine"
            >
              <Pin
                background="#059669"
                borderColor="#064e3b"
                glyphColor="#ffffff"
                scale={1.2}
              />
            </AdvancedMarker>

            {infoOpen && (
              <InfoWindow
                position={SHOP_COORDINATES}
                onCloseClick={() => setInfoOpen(false)}
                maxWidth={320}
              >
                <div className="p-2 text-gray-900 font-sans">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm mb-1">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Hafiz G Silai Machine</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                    Bhatti Chowk, Rajnagar, Madhubani, Bihar 847235
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                    >
                      <Navigation className="w-3 h-3" />
                      Directions
                    </a>
                    <a
                      href="tel:+917870493385"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold"
                    >
                      <Phone className="w-3 h-3" />
                      7870493385
                    </a>
                    <a
                      href="tel:+917488473065"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold"
                    >
                      <Phone className="w-3 h-3" />
                      7488473065
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {showCard && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg border border-slate-200/80 max-w-xs hidden sm:block">
          <div className="text-xs font-bold text-gray-900 mb-0.5">Shop Location</div>
          <div className="text-[11px] text-gray-600 mb-2.5">
            Bhatti Chowk, Rajnagar, Madhubani, Bihar
          </div>
          <div className="flex items-center gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm transition"
            >
              <Navigation className="w-3 h-3" />
              Get Route / ETA
            </a>
            <a
              href={viewMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-slate-100 hover:bg-slate-200 rounded transition"
            >
              <ExternalLink className="w-3 h-3" />
              Full Map
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
