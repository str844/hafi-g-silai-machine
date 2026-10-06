import React from 'react';
import {
  ShoppingBag,
  Wrench,
  Layers,
  Cpu,
  Headphones,
  CheckCircle,
  MessageCircle,
  Phone,
  Clock,
  Settings as SettingsIcon,
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/formatters';
import type { BusinessSettings } from '../../types';

interface ServicesPageProps {
  settings: BusinessSettings;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ settings }) => {
  const repairInquiryMessage =
    'Hello Hafiz G Silai Machine, I have a sewing machine that needs repair or servicing. Could you please provide guidance?';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-md uppercase tracking-wider">
          Complete Machine Solutions
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Our Services & Workshop Support
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          From domestic hand machines to heavy-duty tailoring units and computerized industrial
          models, Hafiz G Silai Machine provides complete sales, replacement parts, and precision
          repairs.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service 1: Machine Sales */}
        <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Sewing Machine Sales</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            We supply brand-new sewing machines suited for home makers, boutique tailoring, fashion
            students, and industrial garment production.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Domestic Sewing Machines (Standard cast iron body)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Umbrella Model Heavy Duty Tailoring Machines</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Industrial High-Speed Single Needle Lockstitch</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct drive power-saving servo motor machines</span>
            </li>
          </ul>
        </div>

        {/* Service 2: Repair & Maintenance */}
        <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Machine Repair & Servicing</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our workshop in Rajnagar handles comprehensive troubleshooting, timing repair, and
            general overhauls for all machine brands.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Fixing thread breakage, missed stitches, and needle breaking</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Shuttle race timing and rotary hook synchronizing</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Tension balance tuning & fabric puckering resolution</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Electric motor fitting, belt alignment, and speed pedal repair</span>
            </li>
          </ul>
        </div>

        {/* Service 3: Spare Parts */}
        <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Genuine Spare Parts</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Never compromise machine longevity with low-grade components. We stock authentic replacement
            parts for all popular models.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Shuttle races, shuttle drivers, and bobbin cases</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Needle bars, connecting rods, and cam followers</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Thread tension discs, check springs, and take-up levers</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Feed dogs, needle plates, and presser feet</span>
            </li>
          </ul>
        </div>

        {/* Service 4: Accessories & Support */}
        <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Headphones className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Accessories & Customer Support</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Equip your workspace with the right accessories and receive straightforward advice on
            choosing the ideal machine for your requirements.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Sewing machine oil, lubrication cans, and maintenance kits</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Tailoring machine stands, wooden extension tables, and covers</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Specialized presser feet (zipper, hemming, gathering, piping)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Organ, Singer & Usha needles in all domestic & industrial gauges</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Repair Workflow Step-by-Step */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-2xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Our Repair Process</h2>
          <p className="text-sm text-slate-300">
            How we handle your machine with care from intake to delivery at our shop:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-2">
            <div className="text-emerald-400 font-extrabold text-2xl">01</div>
            <h4 className="font-bold text-white text-base">Intake & Inspection</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We log your machine, record accessories received (pedal, case, motor), and understand
              the exact stitching issue.
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-2">
            <div className="text-emerald-400 font-extrabold text-2xl">02</div>
            <h4 className="font-bold text-white text-base">Cost Estimation</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We provide a transparent cost estimate before proceeding. Any advance payment is
              formally recorded in our system.
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-2">
            <div className="text-emerald-400 font-extrabold text-2xl">03</div>
            <h4 className="font-bold text-white text-base">Precision Repair</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our technician inspects the internal gears, adjusts timing, replaces worn parts, and
              cleans and lubricates the mechanism.
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-2">
            <div className="text-emerald-400 font-extrabold text-2xl">04</div>
            <h4 className="font-bold text-white text-base">Stitch Testing & Delivery</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We run stitch samples on multiple fabric weights. You test the machine yourself before
              handover and final payment.
            </p>
          </div>
        </div>
      </div>

      {/* Direct Contact Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-emerald-950">
            Need to bring a machine for service?
          </h3>
          <p className="text-sm text-emerald-800">
            Contact us on WhatsApp or call our shop in Rajnagar for instant availability and advice.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="https://wa.me/917870493385"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href="tel:+917870493385"
            className="px-5 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call Shop</span>
          </a>
        </div>
      </div>
    </div>
  );
};
