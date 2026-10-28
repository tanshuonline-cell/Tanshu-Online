import React from 'react';
import { ShieldCheck, Cpu, Lock, CheckCircle, Users, Award, FileSpreadsheet } from 'lucide-react';
import cscImg from '../assets/images/cyber_services_center_1793209558824.jpg';
import cardImg from '../assets/images/card_print_utilities_1793209558484.jpg';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Story Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
              About TANSHU ONLINE
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Built for India’s Digital Kiosks, Cyber Cafes & Every Citizen.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every day, hundreds of thousands of citizens visit Common Service Centers (CSC) and cyber cafes across India for passport photos, exam form submissions, PVC Aadhaar prints, and government certificates. Operators face daily hurdles with uneven mobile photos, skewed WhatsApp documents, and complex print margins.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>TANSHU ONLINE</strong> was created to eliminate this friction. We engineer high-speed, zero-install browser tools that run directly on your existing hardware—whether an Epson L805 photo printer, a basic desktop computer, or a smartphone.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <span className="text-xl font-bold font-mono text-blue-700 block">18</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5">Confirmed Utilities</span>
                <span className="text-[11px] text-slate-500">Phase 1 Release</span>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <span className="text-xl font-bold font-mono text-emerald-700 block">100%</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5">Private & Client-Side</span>
                <span className="text-[11px] text-slate-500">Zero Server Uploads</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
              <img
                src={cscImg}
                alt="Common Service Center operator assisting rural citizen with digital paperwork"
                className="w-full h-auto object-cover max-h-[440px]"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/85 to-transparent text-white text-xs">
                <span className="font-semibold text-amber-300 block">Ground-Level Empowerment</span>
                <span className="text-slate-200 text-[11px]">Enabling village entrepreneurs to deliver fast, error-free citizen services.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">100% In-Browser Privacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your sensitive Aadhaar files, passport portraits, and documents never leave your computer. All cropping, filtering, and PDF generations execute within your local web browser canvas.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Hardware & Paper Sizing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calibrated to exact millimeter dimensions (ISO CR80 85.6 × 53.98 mm, 4×6 inch photo sheets, legal stamp papers) eliminating paper waste and repeated test prints.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Authentic Public Guidance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clear, step-by-step guidance for government schemes and services, verified with official portal links and direct departmental portals.
            </p>
          </div>
        </div>

        {/* Independent Advisory Notice Callout */}
        <div className="p-6 bg-slate-100/70 border border-slate-300 rounded-xl space-y-2 text-xs text-slate-700">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            Independent Platform Transparency Declaration
          </h4>
          <p className="leading-relaxed">
            TANSHU ONLINE is an independent digital tool platform and public information aggregator created to simplify technical printing and document preparation workflows. TANSHU ONLINE is <strong>NOT</strong> affiliated with UIDAI, the Election Commission of India, the Income Tax Department, the Ministry of Road Transport and Highways, or any other central/state government department.
          </p>
          <p className="leading-relaxed text-slate-500">
            We do not collect government application fees, grant official identity documents, or act as an intermediary for government approvals. Official services must always be submitted on authorized governmental websites (.gov.in / .nic.in).
          </p>
        </div>
      </div>
    </section>
  );
};
