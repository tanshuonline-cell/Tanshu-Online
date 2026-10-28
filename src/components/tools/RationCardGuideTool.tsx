import React, { useState } from 'react';
import { ExternalLink, CheckSquare, Square, FileText, ChevronRight, ShieldCheck } from 'lucide-react';

const STATE_PDS_PORTALS = [
  { state: 'National NFSA Portal', url: 'https://nfsa.gov.in', dept: 'Department of Food and Public Distribution, Govt of India' },
  { state: 'Uttar Pradesh', url: 'https://fcs.up.gov.in', dept: 'Food & Civil Supplies Department UP' },
  { state: 'Bihar', url: 'http://epds.bihar.gov.in', dept: 'Food & Consumer Protection Department Bihar' },
  { state: 'West Bengal', url: 'https://food.wb.gov.in', dept: 'Food & Supplies Department WB' },
  { state: 'Maharashtra', url: 'https://mahaepos.gov.in', dept: 'Food, Civil Supplies and Consumer Protection Maharashtra' },
  { state: 'Rajasthan', url: 'https://food.rajasthan.gov.in', dept: 'Food and Civil Supplies Department Rajasthan' },
  { state: 'Madhya Pradesh', url: 'https://rationmitra.nic.in', dept: 'Directorate of Food, Civil Supplies MP' },
  { state: 'Delhi (NCT)', url: 'https://nfs.delhigovt.nic.in', dept: 'Department of Food Supplies and Consumer Affairs Delhi' },
  { state: 'Gujarat', url: 'https://dcs-dof.gujarat.gov.in', dept: 'Food, Civil Supplies and Consumer Affairs Gujarat' },
  { state: 'Tamil Nadu', url: 'https://www.tnpds.gov.in', dept: 'Tamil Nadu Public Distribution System (TNPDS)' },
  { state: 'Karnataka', url: 'https://ahara.kar.nic.in', dept: 'Food, Civil Supplies and Consumer Affairs Karnataka' },
  { state: 'Telangana', url: 'https://epds.telangana.gov.in', dept: 'Consumer Affairs, Food and Civil Supplies Telangana' },
  { state: 'Andhra Pradesh', url: 'https://epdsap.ap.gov.in', dept: 'Civil Supplies Department Andhra Pradesh' },
  { state: 'Haryana', url: 'https://saralharyana.gov.in', dept: 'Food, Civil Supplies & Consumer Affairs Haryana (Antyodaya Saral)' },
  { state: 'Punjab', url: 'https://foodsupplies.punjab.gov.in', dept: 'Department of Food, Civil Supplies & Consumer Affairs Punjab' },
  { state: 'Odisha', url: 'http://www.foododisha.in', dept: 'Food Supplies & Consumer Welfare Department Odisha' },
  { state: 'Jharkhand', url: 'https://aahar.jharkhand.gov.in', dept: 'Food, Public Distribution & Consumer Affairs Jharkhand' },
  { state: 'Assam', url: 'https://fcsca.assam.gov.in', dept: 'Food, Civil Supplies & Consumer Affairs Assam' },
  { state: 'Chhattisgarh', url: 'https://khadya.cg.nic.in', dept: 'Department of Food, Civil Supplies and Consumer Protection CG' }
];

export const RationCardGuideTool: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('National NFSA Portal');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const docs = [
    'Aadhaar card of all family members to be enrolled (Mandatory)',
    'Head of family (preferably senior female member) passport photo',
    'Bank passbook copy of head of family with IFSC code',
    'Current residential proof (Electricity bill, Voter ID, or Sarpanch/Ward certificate)',
    'Income certificate issued by Tehsildar or revenue authority (< ₹1.5 - 2 Lakh/yr)',
    'Gas connection booklet / consumer number (for subsidy segregation)',
    'Birth certificate for children under 5 years of age without Aadhaar'
  ];

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  const currentPortal = STATE_PDS_PORTALS.find((p) => p.state === selectedState) || STATE_PDS_PORTALS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* State Selector & Official Link */}
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. Select Your State / Union Territory</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-blue-600"
          >
            {STATE_PDS_PORTALS.map((p) => (
              <option key={p.state} value={p.state}>{p.state}</option>
            ))}
          </select>
        </div>

        {/* Official Portal Card */}
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Government PDS Portal</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">{currentPortal.state}</h4>
          <p className="text-xs text-slate-600">{currentPortal.dept}</p>
          <a
            href={currentPortal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Open {currentPortal.state} Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Ration Card Categories</label>
          <div className="text-xs space-y-2">
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-amber-700 block">AAY (Antyodaya Anna Yojana) - Yellow Card</span>
              <span className="text-[11px] text-slate-500">Poorest of the poor families. Entitled to 35 kg food grains per family per month.</span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-blue-700 block">PHH (Priority Household) - Pink / Green Card</span>
              <span className="text-[11px] text-slate-500">Beneficiaries with income below threshold. Entitled to 5 kg food grains per person per month.</span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-700 block">APL / Non-NFSA (Above Poverty Line) - White Card</span>
              <span className="text-[11px] text-slate-500">Identity and address proof card for families without subsidized food grains.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist & Steps */}
      <div className="lg:col-span-7 space-y-6">
        {/* Document Checklist */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">2. Mandatory Document Checklist</h4>
            <span className="text-xs text-blue-600 font-medium">
              {Object.values(checkedDocs).filter(Boolean).length} of {docs.length} Ready
            </span>
          </div>

          <div className="space-y-2.5">
            {docs.map((doc) => {
              const isChecked = !!checkedDocs[doc];
              return (
                <div
                  key={doc}
                  onClick={() => toggleDoc(doc)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isChecked ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900' : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <button className="mt-0.5 text-blue-600">
                    {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </button>
                  <span className={isChecked ? 'font-medium' : ''}>{doc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Procedure */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">3. Application Steps (Online & Offline)</h4>
          <ol className="space-y-3 text-xs text-slate-700">
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
              <div>
                <span className="font-bold text-slate-900 block">Register on State e-District / PDS Portal</span>
                Create citizen profile using Aadhaar number and OTP verification on your state food department portal.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
              <div>
                <span className="font-bold text-slate-900 block">Add Family Member Details</span>
                Input full name, gender, age, relation, and Aadhaar number for each family member to receive grain quotas.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
              <div>
                <span className="font-bold text-slate-900 block">Upload Scanned Proofs</span>
                Use the TANSHU Auto Document Cropper to ensure files are under 200KB before uploading income & address certificates.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
              <div>
                <span className="font-bold text-slate-900 block">Field Inquiry by Supply Inspector</span>
                The local Food Supply Officer (FSO) or Area Lekhpal verifies the household physical residence within 15–30 days before issuing the digital ration card number.
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
