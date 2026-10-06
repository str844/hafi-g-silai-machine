import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Trash2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

const PRESET_IMAGES = [
  {
    name: 'Domestic Machine',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Industrial Lockstitch',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tailor Umbrella Stand',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Spare Parts & Shuttles',
    url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Needles & Bobbins',
    url: 'https://images.unsplash.com/photo-1617058866504-d4b684cb03a7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Machine Motor & Pedal',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Product Image',
}) => {
  const [mode, setMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to standard resolution to keep payload light
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 640;
        const MAX_HEIGHT = 640;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onChange(dataUrl);
        }
        setProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-2 group max-w-sm">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover rounded-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/400x300?text=No+Image';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-lg opacity-90 hover:opacity-100 shadow transition-opacity cursor-pointer"
            title="Remove image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Tab buttons */}
          <div className="flex gap-2 border-b border-gray-200 pb-2 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                mode === 'upload' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setMode('presets')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                mode === 'presets' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Choose Preset
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                mode === 'url' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Image Link
            </button>
          </div>

          {mode === 'upload' && (
            <label className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-emerald-50/20">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                {processing ? 'Processing image...' : 'Click to upload image'}
              </span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={processing}
                className="hidden"
              />
            </label>
          )}

          {mode === 'presets' && (
            <div className="grid grid-cols-3 gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-600 text-left cursor-pointer transition-all hover:shadow-xs"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-1.5 bg-white text-[11px] font-medium text-gray-700 truncate">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          )}

          {mode === 'url' && (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/machine-photo.jpg"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Set
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
