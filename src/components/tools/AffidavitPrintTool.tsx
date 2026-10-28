import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Printer, Download, ScrollText, Check, FileCheck } from 'lucide-react';

export const AffidavitPrintTool: React.FC = () => {
  const [templateType, setTemplateType] = useState<'name-change' | 'gap-cert' | 'address-proof' | 'income-declaration'>('gap-cert');
  const [topMarginInch, setTopMarginInch] = useState<number>(3.5);
  const [applicantName, setApplicantName] = useState<string>('Suresh Sharma');
  const [fatherName, setFatherName] = useState<string>('Late Rajesh Sharma');
  const [age, setAge] = useState<string>('22');
  const [address, setAddress] = useState<string>('H.No. 45, Street No. 3, Shivaji Nagar, Jaipur, Rajasthan');
  const [gapYears, setGapYears] = useState<string>('2 (2024 to 2026)');
  const [reason, setReason] = useState<string>('Preparation for Competitive Examinations (UPSC / State PSC)');
  const [place, setPlace] = useState<string>('Jaipur');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'legal' // Standard Indian legal stamp paper size: 8.5 x 14 inches
    });

    // Start text after top margin
    let y = topMarginInch + 0.3;

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('BEFORE THE NOTARY PUBLIC / EXECUTIVE MAGISTRATE', 4.25, y, { align: 'center' });
    y += 0.35;

    doc.setFontSize(13);
    const title = templateType === 'gap-cert' 
      ? 'AFFIDAVIT FOR GAP PERIOD'
      : templateType === 'name-change'
      ? 'AFFIDAVIT FOR CHANGE OF NAME'
      : templateType === 'address-proof'
      ? 'AFFIDAVIT FOR ADDRESS VERIFICATION'
      : 'SELF DECLARATION AFFIDAVIT FOR FAMILY INCOME';

    doc.text(title, 4.25, y, { align: 'center' });
    y += 0.4;

    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const intro = `I, ${applicantName}, Son/Daughter of ${fatherName}, aged about ${age} years, resident of ${address}, do hereby solemnly affirm and state on oath as under:`;
    
    const splitIntro = doc.splitTextToSize(intro, 6.5);
    doc.text(splitIntro, 1.0, y);
    y += splitIntro.length * 0.22 + 0.2;

    const points: string[] = [];
    if (templateType === 'gap-cert') {
      points.push(`1. That I am a bona fide citizen of India and currently applying for admission / employment.`);
      points.push(`2. That after completing my previous education, there has been a gap period of ${gapYears} years.`);
      points.push(`3. That during this gap period, I was engaged in ${reason} and was not involved in any unlawful, criminal, or anti-social activities.`);
      points.push(`4. That there is no criminal case or police FIR pending against me in any court of law in India.`);
    } else if (templateType === 'name-change') {
      points.push(`1. That my original name recorded in educational documents was ${applicantName}.`);
      points.push(`2. That for all future purposes and official records, I have officially changed and adopted the name ${applicantName} Sharma.`);
      points.push(`3. That I declare that ${applicantName} and ${applicantName} Sharma refer to one and the same person.`);
    } else {
      points.push(`1. That I have been continuously residing at the aforementioned residential address for the past 5 years.`);
      points.push(`2. That my total family gross annual income from all sources does not exceed ₹1,80,000/- (Rupees One Lakh Eighty Thousand Only).`);
      points.push(`3. That this affidavit is executed in support of my application for public welfare schemes.`);
    }

    points.forEach((p) => {
      const splitP = doc.splitTextToSize(p, 6.5);
      doc.text(splitP, 1.0, y);
      y += splitP.length * 0.22 + 0.15;
    });

    // Verification clause
    y += 0.25;
    doc.setFont('times', 'bold');
    doc.text('VERIFICATION:', 1.0, y);
    y += 0.22;
    doc.setFont('times', 'normal');
    const verif = `Verified at ${place} on this ${new Date().toLocaleDateString('en-GB')} that the contents of above affidavit are true and correct to the best of my knowledge and belief and nothing material has been concealed therein.`;
    const splitVerif = doc.splitTextToSize(verif, 6.5);
    doc.text(splitVerif, 1.0, y);
    y += splitVerif.length * 0.22 + 0.6;

    // Signature blocks
    doc.setFont('times', 'bold');
    doc.text('DEPONENT', 7.5, y, { align: 'right' });
    y += 0.8;
    doc.text('Identified by Me:', 1.0, y);
    doc.text('BEFORE ME (NOTARY PUBLIC)', 7.5, y, { align: 'right' });

    doc.save(`tanshu_affidavit_${templateType}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. Affidavit Template</label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as any)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="gap-cert">Student Gap Year Certificate Affidavit</option>
            <option value="name-change">Change of Name / Alias Declaration</option>
            <option value="address-proof">Address Declaration & Residence Proof</option>
            <option value="income-declaration">Family Income Self-Declaration</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">2. E-Stamp Top Clearance Margin</label>
            <span className="text-xs font-mono font-bold text-blue-700">{topMarginInch} Inches</span>
          </div>
          <input
            type="range"
            min="2.5"
            max="5.0"
            step="0.5"
            value={topMarginInch}
            onChange={(e) => setTopMarginInch(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Leaves exact space on top of non-judicial e-stamp paper for barcode, serial number, and government revenue header.
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div>
            <label className="text-xs text-slate-600 block mb-1">Applicant / Deponent Name</label>
            <input
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 block mb-1">Father's / Husband's Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Age (Years)</label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-1">Permanent Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>

          {templateType === 'gap-cert' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1">Gap Duration</label>
                <input
                  type="text"
                  value={gapYears}
                  onChange={(e) => setGapYears(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Gap Reason / Activity</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Legal Print PDF
          </button>
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Direct Print on Stamp Paper
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Legal Sheet Preview (Legal 8.5" × 14")</span>
          <span className="font-mono text-amber-700">Top {topMarginInch}" Cleared for Stamp Header</span>
        </div>

        <div className="w-full bg-white border border-slate-300 rounded-lg p-8 shadow-sm font-serif text-slate-900 text-xs leading-relaxed max-w-xl">
          {/* Top Stamp Clearance Placeholder */}
          <div
            style={{ height: `${topMarginInch * 48}px` }}
            className="border-2 border-dashed border-amber-300 bg-amber-50/50 rounded flex flex-col items-center justify-center text-amber-800 mb-6"
          >
            <span className="font-bold text-xs uppercase tracking-wider">Reserved for Non-Judicial E-Stamp / Stamp Paper</span>
            <span className="text-[10px] text-amber-700 mt-1">Leaves blank space so printed text will not overlap the official stamp</span>
          </div>

          <div className="text-center font-bold text-sm mb-4">
            BEFORE THE NOTARY PUBLIC / EXECUTIVE MAGISTRATE
          </div>
          <div className="text-center font-bold text-xs mb-4 text-blue-900 underline underline-offset-4">
            {templateType === 'gap-cert' && 'AFFIDAVIT FOR GAP PERIOD'}
            {templateType === 'name-change' && 'AFFIDAVIT FOR CHANGE OF NAME'}
            {templateType === 'address-proof' && 'AFFIDAVIT FOR ADDRESS VERIFICATION'}
            {templateType === 'income-declaration' && 'AFFIDAVIT FOR FAMILY INCOME'}
          </div>

          <p className="mb-3">
            I, <span className="font-bold">{applicantName}</span>, Son/Daughter of <span className="font-bold">{fatherName}</span>, aged about {age} years, resident of {address}, do hereby solemnly affirm and state on oath as under:
          </p>

          <ol className="list-decimal pl-5 space-y-2 mb-6">
            <li>That I am a permanent and law-abiding citizen of India.</li>
            {templateType === 'gap-cert' && (
              <>
                <li>That after completing my previous education, there has been a gap period of {gapYears}.</li>
                <li>That during this gap period, I was engaged in {reason} and was not involved in any criminal offenses.</li>
              </>
            )}
            {templateType === 'name-change' && (
              <>
                <li>That my previous name was recorded as {applicantName} in all previous certificates.</li>
                <li>That I have adopted the name {applicantName} Sharma for all official, bank, and government records.</li>
              </>
            )}
            <li>That no criminal or disqualifying case is registered or pending against me in any police station or court.</li>
          </ol>

          <div className="font-bold mb-1">VERIFICATION:</div>
          <p className="text-[11px] text-slate-700 mb-8">
            Verified at {place} on this date that the contents of the above affidavit are true and correct to the best of my knowledge and belief.
          </p>

          <div className="flex justify-between items-end pt-6 border-t border-slate-200">
            <div className="text-[11px]">
              <div className="font-bold">DEPONENT</div>
              <div className="text-slate-500 mt-1">Signature of Applicant</div>
            </div>
            <div className="text-right text-[11px]">
              <div className="font-bold">NOTARY PUBLIC</div>
              <div className="text-slate-500 mt-1">Seal & Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
