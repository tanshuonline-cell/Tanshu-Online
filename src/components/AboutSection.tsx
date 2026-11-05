import React from 'react';
import { ShieldCheck, Cpu, Lock, CheckCircle, Users, Award, FileSpreadsheet } from 'lucide-react';
import cscImg from '../assets/images/cyber_services_center_1793209558824.jpg';
import cardImg from '../assets/images/card_print_utilities_1793209558484.jpg';
import { useLanguage } from '../context/LanguageContext';

export const AboutSection: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section id="about" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Story Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {t('about.kicker', 'About TANSHU ONLINE')}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t('about.title', 'Built for India’s Digital Kiosks, Cyber Cafes & Every Citizen.')}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t('about.intro', 'Every day, citizens visit CSCs and cyber cafes for digital services and document printing.')}
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>TANSHU ONLINE</strong> {t('about.story', 'was created to simplify this work with fast browser tools.')}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <span className="text-xl font-bold font-mono text-blue-700 block">18</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5">{t('about.utilities', 'Available Utilities')}</span>
                <span className="text-[11px] text-slate-500">{t('about.release', 'Current Release')}</span>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <span className="text-xl font-bold font-mono text-emerald-700 block">100%</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5">{t('about.private', 'Private & Client-Side')}</span>
                <span className="text-[11px] text-slate-500">{t('about.zeroUpload', 'No Server Uploads')}</span>
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
                <span className="font-semibold text-amber-300 block">{t('about.empowerment', 'Digital Empowerment')}</span>
                <span className="text-slate-200 text-[11px]">{t('about.empowermentDesc', 'Helping local entrepreneurs deliver reliable citizen services.')}</span>
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
            <h3 className="text-sm font-bold text-slate-900">{t('about.privacyTitle', '100% In-Browser Privacy')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('about.privacyDesc', 'Your documents stay on your device and are processed in your browser.')}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('about.sizingTitle', 'Hardware & Paper Sizing')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('about.sizingDesc', 'Tools support practical print sizes and help reduce paper waste.')}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('about.guidanceTitle', 'Reliable Public Guidance')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('about.guidanceDesc', 'Step-by-step information with links to official portals.')}
            </p>
          </div>
        </div>

        {/* Independent Advisory Notice Callout */}
        <div className="p-6 bg-slate-100/70 border border-slate-300 rounded-xl space-y-2 text-xs text-slate-700">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            {t('about.transparencyTitle', 'Independent Platform Transparency Declaration')}
          </h4>
          <p className="leading-relaxed">
            {t('about.disclaimer', 'TANSHU ONLINE is an independent platform and is not affiliated with any government department.')}
          </p>
          <p className="leading-relaxed text-slate-500">
            {t('about.disclaimer2', 'We do not collect government fees or issue official documents. Use authorized government websites for official services.')}
          </p>
        </div>
      </div>
    </section>
  );
};
