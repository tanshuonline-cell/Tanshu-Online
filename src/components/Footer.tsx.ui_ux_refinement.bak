import React from 'react';
import { ExternalLink, ShieldCheck, Mail, Heart } from 'lucide-react';

interface Props {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm relative overflow-hidden">
                <span>T</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                  <span className="flex-1 bg-amber-500" />
                  <span className="flex-1 bg-white" />
                  <span className="flex-1 bg-emerald-600" />
                </div>
              </div>
              <span className="text-base font-extrabold tracking-tight text-white">
                TANSHU <span className="text-blue-500">ONLINE</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              India's premier digital public utilities portal and cyber cafe toolkit. High-precision photo cropping, CR80 ID printing, and authentic public information.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Contact: tanshuonline@gmail.com</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Portal Directory</h4>
            <ul className="space-y-2">
              {[
                { id: 'home', label: 'Home' },
                { id: 'all-tools', label: 'All 18 Tools' },
                { id: 'services', label: 'Government Services' },
                { id: 'schemes', label: 'Government Schemes' },
                { id: 'videos', label: 'Latest Videos' },
                { id: 'about', label: 'About Us' }
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Key Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Featured Utilities</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Passport Size Photo Maker (3.5×4.5 cm)</li>
              <li>Auto Document Cropper & Deskew</li>
              <li>PDF to PVC Card CR80 Cropper</li>
              <li>ID Card Front-Back Print Layout</li>
              <li>GST / Non-GST Invoice Maker</li>
              <li>New Ration Card Portal Directory</li>
              <li>Indian Postal PIN Code Finder</li>
            </ul>
          </div>

          {/* Col 4: Important Official Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Official Govt Portals</h4>
            <ul className="space-y-2">
              {[
                { name: 'UIDAI myAadhaar', url: 'https://myaadhaar.uidai.gov.in' },
                { name: 'ECI Voters Portal', url: 'https://voters.eci.gov.in' },
                { name: 'Sarathi Parivahan (DL/RC)', url: 'https://parivahan.gov.in' },
                { name: 'Protean TIN-NSDL (PAN)', url: 'https://www.onlineservices.nsdl.com' },
                { name: 'Passport Seva Portal', url: 'https://www.passportindia.gov.in' },
                { name: 'NFSA Food Security', url: 'https://nfsa.gov.in' },
                { name: 'National Portal of India', url: 'https://india.gov.in' }
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-500 space-y-3">
          <p className="leading-relaxed">
            <strong className="text-slate-400">Legal Disclaimer:</strong> TANSHU ONLINE is an independent digital tool and public service reference platform. TANSHU ONLINE does not represent, partner with, or act as an official agency of the Government of India or any state administration. All official logos, government department trademarks, and portal names belong to their respective statutory authorities.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              © {new Date().getFullYear()} TANSHU ONLINE. All rights reserved. 100% Client-Side Privacy Guaranteed.
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>Empowering Digital India with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
