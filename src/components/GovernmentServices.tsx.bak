import React, { useState } from 'react';
import { ExternalLink, Clock, ShieldCheck, ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';
import { GOVERNMENT_SERVICES } from '../data/servicesData';
import { GovernmentService } from '../types';

import aadhaarImg from '../assets/images/srv_aadhaar_card_1793213335581.jpg';
import panImg from '../assets/images/srv_pan_card_1793213337829.jpg';
import voterImg from '../assets/images/srv_voter_id_evm_1793213338449.jpg';
import dlImg from '../assets/images/srv_driving_license_1793213339233.jpg';
import passportImg from '../assets/images/srv_passport_travel_1793213340053.jpg';
import edistrictImg from '../assets/images/srv_edistrict_portal_1793213339753.jpg';

export const GovernmentServices: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(GOVERNMENT_SERVICES[0].id);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getServiceImage = (id: string) => {
    switch (id) {
      case 'aadhaar-services':
        return aadhaarImg;
      case 'pan-card-services':
        return panImg;
      case 'voter-services':
        return voterImg;
      case 'parivahan-services':
        return dlImg;
      case 'passport-seva':
        return passportImg;
      case 'edistrict-certificates':
        return edistrictImg;
      default:
        return aadhaarImg;
    }
  };

  return (
    <section id="services" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              Public Service Information Directory
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Government Services
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-lg">
            Verified step-by-step application walkthroughs, document requirements, fee schedules, and direct official portal redirects for major Indian citizen services.
          </p>
        </div>

        {/* Services Accordion Cards Grid */}
        <div className="space-y-3.5">
          {GOVERNMENT_SERVICES.map((srv) => {
            const isExpanded = expandedId === srv.id;
            return (
              <div
                key={srv.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:border-blue-200 transition-all duration-200"
              >
                {/* Horizontal compact header row */}
                <div
                  onClick={() => toggleExpand(srv.id)}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none bg-white hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Left: Compact Thumbnail + Middle: Info & Title */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Compact Image: 120-150px wide and 65-80px high on desktop, mobile scaled */}
                    <div className="w-24 sm:w-[136px] md:w-[145px] h-16 sm:h-[72px] md:h-[76px] shrink-0 rounded-lg overflow-hidden border border-slate-200/90 bg-slate-100 shadow-2xs relative">
                      <img
                        src={getServiceImage(srv.id)}
                        alt={srv.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Middle: Category, Processing time, fee, and service title */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-500">
                        <span className="text-blue-700 font-bold">{srv.category}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" /> {srv.processingTime}
                        </span>
                        <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                        <span className="text-emerald-700 font-medium">Fee: {srv.estimatedFee}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight line-clamp-1 sm:line-clamp-none">
                        {srv.title}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Official Portal button and dropdown arrow */}
                  <div className="flex items-center justify-end sm:justify-start gap-2.5 sm:gap-3 shrink-0 self-end sm:self-center">
                    <a
                      href={srv.officialPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 rounded-lg text-xs font-semibold transition-colors border border-blue-200/60 shadow-2xs"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-slate-50/30 space-y-5 animate-fadeIn text-xs">
                    <p className="text-slate-600 leading-relaxed">{srv.summary}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Eligibility & Required Documents */}
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px] text-blue-900">
                            Eligibility Criteria
                          </h4>
                          <ul className="space-y-1.5 text-slate-600">
                            {srv.eligibility.map((el, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">·</span>
                                <span>{el}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px] text-blue-900">
                            Required Documents
                          </h4>
                          <ul className="space-y-1.5 text-slate-600">
                            {srv.requiredDocuments.map((doc, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Step-by-Step Procedure */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px] text-blue-900">
                            Step-by-Step Application Procedure
                          </h4>
                          <ol className="space-y-2.5 text-slate-600">
                            {srv.steps.map((st, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                                  {i + 1}
                                </span>
                                <span>{st}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          {srv.trackUrl && (
                            <a
                              href={srv.trackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                            >
                              <span>Track Existing Application</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <a
                            href={srv.officialPortal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs ml-auto"
                          >
                            Proceed to {srv.officialPortalName}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
