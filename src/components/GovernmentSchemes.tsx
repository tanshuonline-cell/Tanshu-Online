import React, { useState, useEffect } from 'react';
import { ExternalLink, Award, CheckCircle, ChevronRight, IndianRupee } from 'lucide-react';
import { GOVERNMENT_SCHEMES } from '../data/schemesData';
import { GovernmentScheme } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { BilingualText, BilingualHeading, BilingualList, BilingualSteps } from './common/BilingualContent';

import kisanImg from '../assets/images/scheme_pm_kisan_1793213628614.jpg';
import ayushmanImg from '../assets/images/scheme_ayushman_bharat_1793213629585.jpg';
import awasImg from '../assets/images/scheme_pm_awas_1793213630372.jpg';
import vishwakarmaImg from '../assets/images/scheme_pm_vishwakarma_1793213630511.jpg';
import eshramImg from '../assets/images/scheme_eshram_worker_1793213631564.jpg';
import sukanyaImg from '../assets/images/scheme_sukanya_samriddhi_1793213631693.jpg';

interface Props {
  selectedSchemeModal?: GovernmentScheme | null;
  onCloseModal?: () => void;
}

export const GovernmentSchemes: React.FC<Props> = ({ selectedSchemeModal, onCloseModal }) => {
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const { t, isHindi } = useLanguage();

  useEffect(() => {
    if (selectedSchemeModal) {
      setSelectedScheme(selectedSchemeModal);
      const element = document.getElementById(`scheme-${selectedSchemeModal.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedSchemeModal]);

  const handleClose = () => {
    setSelectedScheme(null);
    if (onCloseModal) onCloseModal();
  };

  const getSchemeImage = (id: string) => {
    switch (id) {
      case 'pm-kisan':
        return kisanImg;
      case 'ayushman-bharat':
        return ayushmanImg;
      case 'pm-awas-yojana':
        return awasImg;
      case 'pm-vishwakarma':
        return vishwakarmaImg;
      case 'e-shram-card':
        return eshramImg;
      case 'sukanya-samriddhi':
        return sukanyaImg;
      default:
        return kisanImg;
    }
  };

  return (
    <section id="schemes" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              {t('schemes.kicker', 'National Welfare Initiatives')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('schemes.title', 'Government Schemes')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-lg">
            {t(
              'schemes.desc',
              'Direct DBT financial benefits, healthcare coverage, and housing subsidies with complete eligibility checks and enrollment guides.'
            )}
          </p>
        </div>

        {/* Schemes Bento-Grid — Four Cards Per Row on Wide Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {GOVERNMENT_SCHEMES.map((scheme) => {
            const primaryName = isHindi && scheme.hindiName ? scheme.hindiName : scheme.name;
            const secondaryName = isHindi ? scheme.name : scheme.hindiName;
            const primaryMinistry = isHindi && scheme.hindiMinistry ? scheme.hindiMinistry : scheme.ministry;
            const secondaryMinistry = isHindi ? scheme.ministry : scheme.hindiMinistry;

            return (
              <div
                key={scheme.id}
                id={`scheme-${scheme.id}`}
                className="bg-gradient-to-b from-[#F0FDF4]/30 via-white to-slate-50/50 border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-xs hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-300 ease-out flex flex-col justify-between group select-none"
              >
                <div>
                  {/* Upper Area with Title info + Compact Thumbnail */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      {/* Ministry Header */}
                      <div className="text-[10px] sm:text-[11px] font-bold text-blue-700 mb-0.5 line-clamp-1 uppercase tracking-wider">
                        {primaryMinistry}
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug mb-0.5 group-hover:text-emerald-700 transition-colors">
                        {primaryName}
                      </h3>

                      {secondaryName && secondaryName !== primaryName && (
                        <div className="text-xs text-slate-500 font-semibold line-clamp-1">
                          {secondaryName}
                        </div>
                      )}
                    </div>

                    {/* Compact Thumbnail */}
                    <div className="w-18 sm:w-20 md:w-22 h-13 sm:h-14 md:h-15 shrink-0 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-100 shadow-2xs">
                      <img
                        src={getSchemeImage(scheme.id)}
                        alt={scheme.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Financial Benefit Callout */}
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-xs text-emerald-950 mb-3 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 block">
                      {isHindi ? 'सीधा वित्तीय लाभ (Financial Benefit)' : 'Direct Financial Benefit'}
                    </span>
                    <BilingualText
                      en={scheme.financialBenefit}
                      hi={scheme.hindiFinancialBenefit}
                      isHindi={isHindi}
                      primaryClassName="font-bold text-slate-900 line-clamp-2 text-xs"
                      secondaryClassName="text-emerald-800/80 font-medium line-clamp-1 text-[11px]"
                    />
                  </div>

                  {/* Bilingual Summary */}
                  <div className="mb-3">
                    <BilingualText
                      en={scheme.summary}
                      hi={scheme.hindiSummary}
                      isHindi={isHindi}
                      primaryClassName="text-xs text-slate-700 line-clamp-2 leading-relaxed"
                      secondaryClassName="text-[11px] text-slate-500 line-clamp-1 leading-relaxed mt-0.5"
                    />
                  </div>

                  {/* Target Beneficiaries */}
                  <div className="text-[11px] text-slate-500 mb-3 pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">
                      {isHindi ? 'लक्षित लाभार्थी:' : 'Target Group:'}
                    </span>{' '}
                    <BilingualText
                      en={scheme.targetBeneficiaries}
                      hi={scheme.hindiTargetBeneficiaries}
                      isHindi={isHindi}
                      primaryClassName="text-slate-700 line-clamp-1 inline font-medium"
                      secondaryClassName="text-slate-500 text-[10px] line-clamp-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer text-center shadow-2xs"
                  >
                    {isHindi ? 'पात्रता एवं आवेदन देखें' : 'View Eligibility & Apply'}
                  </button>
                  <a
                    href={scheme.officialPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="Official Portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Detailed Scheme Walkthrough */}
        {selectedScheme && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-start gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-20 sm:w-24 md:w-28 h-14 sm:h-16 md:h-[68px] shrink-0 rounded-lg overflow-hidden border border-slate-200/90 shadow-2xs">
                    <img
                      src={getSchemeImage(selectedScheme.id)}
                      alt={selectedScheme.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-blue-700 block mb-1">
                      {isHindi && selectedScheme.hindiMinistry ? selectedScheme.hindiMinistry : selectedScheme.ministry}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">
                      {isHindi && selectedScheme.hindiName ? selectedScheme.hindiName : selectedScheme.name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {isHindi ? selectedScheme.name : selectedScheme.hindiName}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-700 p-1 text-lg font-bold shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
                {/* Financial Assistance / Grant */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 shadow-2xs">
                  <BilingualHeading
                    en="Financial Assistance / Benefit"
                    hi="वित्तीय सहायता / लाभ राशि"
                    isHindi={isHindi}
                    className="mb-1"
                  />
                  <BilingualText
                    en={selectedScheme.financialBenefit}
                    hi={selectedScheme.hindiFinancialBenefit}
                    isHindi={isHindi}
                    primaryClassName="font-bold text-sm sm:text-base text-emerald-950 leading-snug"
                    secondaryClassName="text-xs text-emerald-800 font-medium leading-relaxed mt-1 pt-1 border-t border-emerald-200/60"
                  />
                </div>

                {/* Scheme Overview */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <BilingualHeading
                    en="Scheme Overview"
                    hi="योजना का विवरण एवं उद्देश्य"
                    isHindi={isHindi}
                    className="mb-2"
                  />
                  <BilingualText
                    en={selectedScheme.summary}
                    hi={selectedScheme.hindiSummary}
                    isHindi={isHindi}
                    primaryClassName="text-slate-800 font-medium leading-relaxed text-xs sm:text-sm"
                    secondaryClassName="text-slate-500 font-normal leading-relaxed text-xs mt-1.5 pt-1.5 border-t border-slate-200/60"
                  />
                </div>

                {/* Eligibility & Mandatory Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <BilingualHeading
                      en="Who is Eligible?"
                      hi="योजना की पात्रता शर्तें"
                      isHindi={isHindi}
                      className="mb-3"
                    />
                    <BilingualList
                      enItems={selectedScheme.eligibility}
                      hiItems={selectedScheme.hindiEligibility}
                      isHindi={isHindi}
                      icon="dot"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <BilingualHeading
                      en="Mandatory Documents"
                      hi="अनिवार्य दस्तावेज सूची"
                      isHindi={isHindi}
                      className="mb-3"
                    />
                    <BilingualList
                      enItems={selectedScheme.documentsRequired}
                      hiItems={selectedScheme.hindiDocumentsRequired}
                      isHindi={isHindi}
                      icon="check"
                    />
                  </div>
                </div>

                {/* Step-by-Step Procedure */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <BilingualHeading
                    en="How to Apply Step-by-Step"
                    hi="आवेदन प्रक्रिया (चरणबद्ध विवरण)"
                    isHindi={isHindi}
                    className="mb-3.5"
                  />
                  <BilingualSteps
                    enSteps={selectedScheme.howToApply}
                    hiSteps={selectedScheme.hindiHowToApply}
                    isHindi={isHindi}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  {isHindi ? 'बंद करें (Close)' : 'Close'}
                </button>
                <a
                  href={selectedScheme.officialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>{isHindi ? 'आधिकारिक पोर्टल पर आवेदन करें' : 'Apply on Official Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
