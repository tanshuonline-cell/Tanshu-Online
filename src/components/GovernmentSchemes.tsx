import React, { useState } from 'react';
import { ExternalLink, Award, CheckCircle, ChevronRight, IndianRupee } from 'lucide-react';
import { GOVERNMENT_SCHEMES } from '../data/schemesData';
import { GovernmentScheme } from '../types';

import kisanImg from '../assets/images/scheme_pm_kisan_1793213628614.jpg';
import ayushmanImg from '../assets/images/scheme_ayushman_bharat_1793213629585.jpg';
import awasImg from '../assets/images/scheme_pm_awas_1793213630372.jpg';
import vishwakarmaImg from '../assets/images/scheme_pm_vishwakarma_1793213630511.jpg';
import eshramImg from '../assets/images/scheme_eshram_worker_1793213631564.jpg';
import sukanyaImg from '../assets/images/scheme_sukanya_samriddhi_1793213631693.jpg';

export const GovernmentSchemes: React.FC = () => {
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

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
              National Welfare Initiatives
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Government Schemes
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-lg">
            Direct DBT financial benefits, healthcare coverage, and housing subsidies with complete eligibility checks and enrollment guides.
          </p>
        </div>

        {/* Schemes Bento-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GOVERNMENT_SCHEMES.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Upper Area with Title info + Compact Thumbnail */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    {/* Ministry Header */}
                    <div className="text-[11px] font-semibold text-blue-700 mb-1 line-clamp-1 uppercase tracking-wider">
                      {scheme.ministry}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug mb-1">
                      {scheme.name}
                    </h3>

                    {scheme.hindiName && (
                      <div className="text-xs text-slate-500 font-medium line-clamp-1">
                        {scheme.hindiName}
                      </div>
                    )}
                  </div>

                  {/* Compact Thumbnail: 90-120px wide and 55-75px high on desktop */}
                  <div className="w-20 sm:w-24 md:w-28 h-14 sm:h-16 md:h-[68px] shrink-0 rounded-lg overflow-hidden border border-slate-200/90 bg-slate-100 shadow-2xs">
                    <img
                      src={getSchemeImage(scheme.id)}
                      alt={scheme.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Financial Benefit Callout */}
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 mb-3 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-blue-700 block">
                    Direct Financial Benefit
                  </span>
                  <p className="font-semibold text-slate-900">{scheme.financialBenefit}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                  {scheme.summary}
                </p>

                {/* Target Beneficiaries */}
                <div className="text-xs text-slate-500 mb-4 pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Target Group:</span>{' '}
                  <span className="line-clamp-1">{scheme.targetBeneficiaries}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedScheme(scheme)}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer text-center"
                >
                  View Eligibility & Apply
                </button>
                <a
                  href={scheme.officialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Official Portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
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
                      {selectedScheme.ministry}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">{selectedScheme.name}</h3>
                    {selectedScheme.hindiName && (
                      <div className="text-xs text-slate-500 mt-0.5">{selectedScheme.hindiName}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 text-lg font-bold shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] block">
                    Financial Assistance / Grant
                  </span>
                  <p className="font-bold text-sm text-emerald-950">{selectedScheme.financialBenefit}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px] text-blue-900">
                    Scheme Overview
                  </h4>
                  <p className="leading-relaxed text-slate-600">{selectedScheme.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px] text-blue-900">
                      Who is Eligible?
                    </h4>
                    <ul className="space-y-1.5 text-slate-600">
                      {selectedScheme.eligibility.map((el, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">·</span>
                          <span>{el}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px] text-blue-900">
                      Mandatory Documents
                    </h4>
                    <ul className="space-y-1.5 text-slate-600">
                      {selectedScheme.documentsRequired.map((doc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px] text-blue-900">
                    How to Apply Step-by-Step
                  </h4>
                  <ol className="space-y-2 text-slate-600">
                    {selectedScheme.howToApply.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={selectedScheme.officialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Apply on Official Portal</span>
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
