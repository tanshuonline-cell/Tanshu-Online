import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, ShieldCheck, ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';
import { GOVERNMENT_SERVICES } from '../data/servicesData';
import { GovernmentService } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { BilingualText, BilingualHeading, BilingualList, BilingualSteps } from './common/BilingualContent';

import aadhaarImg from '../assets/images/srv_aadhaar_card_1793213335581.jpg';
import panImg from '../assets/images/srv_pan_card_1793213337829.jpg';
import voterImg from '../assets/images/srv_voter_id_evm_1793213338449.jpg';
import dlImg from '../assets/images/srv_driving_license_1793213339233.jpg';
import passportImg from '../assets/images/srv_passport_travel_1793213340053.jpg';
import edistrictImg from '../assets/images/srv_edistrict_portal_1793213339753.jpg';

interface Props {
  selectedServiceId?: string | null;
}

export const GovernmentServices: React.FC<Props> = ({ selectedServiceId }) => {
  const [expandedId, setExpandedId] = useState<string | null>(GOVERNMENT_SERVICES[0].id);
  const { t, isHindi } = useLanguage();

  useEffect(() => {
    if (selectedServiceId) {
      setExpandedId(selectedServiceId);
      const element = document.getElementById(`service-${selectedServiceId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedServiceId]);

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
            <div className="text-xs font-bold uppercase tracking-wider text-[#C62828] mb-1">
              {t('services.kicker', 'Public Service Information Directory')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#C62828] tracking-tight">
              {t('services.title', 'Government Services')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-lg">
            {t(
              'services.desc',
              'Verified step-by-step application walkthroughs, document requirements, fee schedules, and direct official portal redirects for major Indian citizen services.'
            )}
          </p>
        </div>

        {/* Services Accordion Cards Grid */}
        <div className="space-y-3.5">
          {GOVERNMENT_SERVICES.map((srv) => {
            const isExpanded = expandedId === srv.id;
            const primaryTitle = isHindi && srv.hindiTitle ? srv.hindiTitle : srv.title;
            const secondaryTitle = isHindi ? srv.title : srv.hindiTitle;
            const primaryCat = isHindi && srv.hindiCategory ? srv.hindiCategory : srv.category;
            const primaryTime = isHindi && srv.hindiProcessingTime ? srv.hindiProcessingTime : srv.processingTime;
            const primaryFee = isHindi && srv.hindiEstimatedFee ? srv.hindiEstimatedFee : srv.estimatedFee;

            return (
              <div
                key={srv.id}
                id={`service-${srv.id}`}
                className="bg-gradient-to-b from-slate-50/60 via-white to-slate-50/30 border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:border-red-300 hover:shadow-lg transition-all duration-300"
              >
                {/* Horizontal compact header row */}
                <div
                  onClick={() => toggleExpand(srv.id)}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none bg-transparent hover:bg-slate-50/90 transition-colors group"
                >
                  {/* Left: Compact Thumbnail + Middle: Info & Title */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Compact Image */}
                    <div className="w-24 sm:w-[136px] md:w-[145px] h-16 sm:h-[72px] md:h-[76px] shrink-0 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-100 shadow-2xs relative">
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
                        <span className="text-[#C62828] font-bold">{primaryCat}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" /> {primaryTime}
                        </span>
                        <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                        <span className="text-emerald-700 font-medium">
                          {isHindi ? 'शुल्क:' : 'Fee:'} {primaryFee}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight line-clamp-1 sm:line-clamp-none group-hover:text-[#C62828] transition-colors">
                          {primaryTitle}
                        </h3>
                        {secondaryTitle && secondaryTitle !== primaryTitle && (
                          <div className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1">
                            {secondaryTitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Official Portal button and dropdown arrow */}
                  <div className="flex items-center justify-end sm:justify-start gap-2.5 sm:gap-3 shrink-0 self-end sm:self-center">
                    <a
                      href={srv.officialPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 rounded-xl text-xs font-bold transition-all border border-blue-200/70 shadow-2xs"
                    >
                      <span>{isHindi ? 'पोर्टल (Portal)' : 'Official Portal'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg bg-slate-100/60 hover:bg-blue-50 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-3 border-t border-slate-100 bg-slate-50/40 space-y-5 animate-fadeIn text-xs">
                    {/* Bilingual Summary */}
                    <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80">
                      <BilingualText
                        en={srv.summary}
                        hi={srv.hindiSummary}
                        isHindi={isHindi}
                        primaryClassName="text-slate-800 font-normal leading-relaxed text-xs sm:text-sm"
                        secondaryClassName="text-slate-500 font-normal leading-relaxed text-xs mt-1.5 pt-1.5 border-t border-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Eligibility & Required Documents */}
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                          <BilingualHeading
                            en="Eligibility Criteria"
                            hi="पात्रता एवं अनिवार्य शर्तें"
                            isHindi={isHindi}
                            className="mb-3"
                          />
                          <BilingualList
                            enItems={srv.eligibility}
                            hiItems={srv.hindiEligibility}
                            isHindi={isHindi}
                            icon="dot"
                          />
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                          <BilingualHeading
                            en="Required Documents"
                            hi="अनिवार्य दस्तावेज सूची"
                            isHindi={isHindi}
                            className="mb-3"
                          />
                          <BilingualList
                            enItems={srv.requiredDocuments}
                            hiItems={srv.hindiRequiredDocuments}
                            isHindi={isHindi}
                            icon="check"
                          />
                        </div>
                      </div>

                      {/* Step-by-Step Procedure */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div>
                          <BilingualHeading
                            en="Step-by-Step Application Procedure"
                            hi="आवेदन की चरण-दर-चरण प्रक्रिया"
                            isHindi={isHindi}
                            className="mb-3.5"
                          />
                          <BilingualSteps
                            enSteps={srv.steps}
                            hiSteps={srv.hindiSteps}
                            isHindi={isHindi}
                          />
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          {srv.trackUrl && (
                            <a
                              href={srv.trackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                            >
                              <span>{isHindi ? 'आवेदन स्थिति ट्रैक करें' : 'Track Existing Application'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <a
                            href={srv.officialPortal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs ml-auto flex items-center gap-1.5"
                          >
                            <span>
                              {isHindi
                                ? `पोर्टल पर जाएं: ${srv.hindiOfficialPortalName || srv.officialPortalName}`
                                : `Proceed to ${srv.officialPortalName}`}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5" />
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
