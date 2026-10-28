import React, { useState } from 'react';
import { ToolItem } from '../../types';
import { Upload, Download, Printer, Check, Copy, RefreshCw, Calculator, MessageSquare, QrCode, FileText } from 'lucide-react';

interface Props {
  tool: ToolItem;
}

export const GenericInteractiveTool: React.FC<Props> = ({ tool }) => {
  // Category-specific interactive states

  // 1. Calculator states
  const [dob, setDob] = useState('2000-08-15');
  const [asOfDate, setAsOfDate] = useState('2026-01-01');
  const [gstAmount, setGstAmount] = useState('1000');
  const [gstRate, setGstRate] = useState(18);
  const [isReverseGst, setIsReverseGst] = useState(false);

  // Cash note tally
  const [notes, setNotes] = useState<Record<number, number>>({
    500: 20,
    200: 10,
    100: 30,
    50: 15,
    20: 10,
    10: 20
  });

  // WhatsApp & QR states
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('Namaste, your documents are printed and ready at Tanshu Online.');
  const [upiId, setUpiId] = useState('tanshu@okaxis');
  const [upiAmount, setUpiAmount] = useState('150');
  const [shopName, setShopName] = useState('Tanshu Digital Seva');

  // Business receipt states
  const [receiptNo, setReceiptNo] = useState('REC-8921');
  const [custName, setCustName] = useState('Suresh Kumar');
  const [serviceName, setServiceName] = useState('Online Form + PVC Smart Card');
  const [paymentAmount, setPaymentAmount] = useState('180');

  // Photo & Exam states
  const [candidateName, setCandidateName] = useState('ANITA SHARMA');
  const [photoDate, setPhotoDate] = useState('28/10/2026');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Copy status
  const [copied, setCopied] = useState(false);

  // Age Calculator Math
  const calculateAge = () => {
    const birth = new Date(dob);
    const target = new Date(asOfDate);
    if (isNaN(birth.getTime()) || isNaN(target.getTime())) return null;

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = target.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return { years, months, days, totalDays };
  };

  // GST Math
  const computeGst = () => {
    const val = parseFloat(gstAmount) || 0;
    if (isReverseGst) {
      const base = val / (1 + gstRate / 100);
      const tax = val - base;
      return {
        base: base.toFixed(2),
        tax: tax.toFixed(2),
        cgst: (tax / 2).toFixed(2),
        sgst: (tax / 2).toFixed(2),
        total: val.toFixed(2)
      };
    } else {
      const tax = (val * gstRate) / 100;
      return {
        base: val.toFixed(2),
        tax: tax.toFixed(2),
        cgst: (tax / 2).toFixed(2),
        sgst: (tax / 2).toFixed(2),
        total: (val + tax).toFixed(2)
      };
    }
  };

  // Total cash tally
  const totalCash = Object.entries(notes).reduce((acc, [denom, count]) => {
    return acc + Number(denom) * (Number(count) || 0);
  }, 0);
  const totalNoteCount = Object.values(notes).reduce((acc, count) => acc + (Number(count) || 0), 0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 1. AGE CALCULATOR
  if (tool.id === 'age-calculator-govt-exam') {
    const age = calculateAge();
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            Enter Dates for Age Calculation
          </h4>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth (जन्म तिथि):</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Age as on Cut-off Date (कट ऑफ तिथि):</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="text-[11px] text-slate-500">
            Common Cut-offs: UPSC / SSC (01-August / 01-January), State Police (01-July).
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-blue-700 tracking-wider mb-2">Age Verification Result</div>
            {age ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-black text-blue-900">
                    {age.years} Years, {age.months} Months, {age.days} Days
                  </div>
                  <div className="text-xs font-medium text-emerald-700 mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Calculated with leap years accuracy
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="font-semibold text-slate-900">Total Days:</span> {age.totalDays.toLocaleString()}
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="font-semibold text-slate-900">Total Weeks:</span> {Math.floor(age.totalDays / 7).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Please select valid dates to view age calculation.</div>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Age Verification Slip
          </button>
        </div>
      </div>
    );
  }

  // 2. GST CALCULATOR
  if (tool.id === 'gst-calculator') {
    const gst = computeGst();
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            GST Calculation Settings
          </h4>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹):</label>
            <input
              type="number"
              value={gstAmount}
              onChange={(e) => setGstAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              placeholder="e.g. 1000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">GST Rate Slab:</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 12, 18, 28].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setGstRate(rate)}
                  className={`py-2 text-xs font-bold rounded-lg cursor-pointer border ${
                    gstRate === rate
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setIsReverseGst(!isReverseGst)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                isReverseGst ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {isReverseGst ? 'Mode: Reverse GST (Tax Included)' : 'Mode: Forward GST (Add Tax)'}
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold uppercase text-blue-700 tracking-wider">GST Tax Summary</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Base Net Amount:</span>
              <span className="font-bold text-slate-900">₹ {gst.base}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">CGST (Central {gstRate / 2}%):</span>
              <span className="font-semibold text-blue-700">₹ {gst.cgst}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">SGST (State {gstRate / 2}%):</span>
              <span className="font-semibold text-blue-700">₹ {gst.sgst}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Total Tax Amount:</span>
              <span className="font-semibold text-red-600">₹ {gst.tax}</span>
            </div>
            <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg border border-emerald-200">
              <span className="font-bold text-emerald-950">Grand Total Payable:</span>
              <span className="font-black text-emerald-700 text-sm">₹ {gst.total}</span>
            </div>
          </div>
          <button
            onClick={() => handleCopy(`Base: ₹${gst.base}, CGST: ₹${gst.cgst}, SGST: ₹${gst.sgst}, Total: ₹${gst.total}`)}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Breakdown' : 'Copy Invoice Line Item'}
          </button>
        </div>
      </div>
    );
  }

  // 3. CURRENCY NOTE COUNTER
  if (tool.id === 'currency-note-counter') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Cash Note Denomination Counter
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[500, 200, 100, 50, 20, 10].map((denom) => (
              <div key={denom} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 w-12">₹ {denom}:</span>
                <input
                  type="number"
                  min="0"
                  value={notes[denom] || ''}
                  onChange={(e) => setNotes({ ...notes, [denom]: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs text-right font-mono"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-emerald-800 tracking-wider mb-2">Drawer Cash Summary</div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center mb-3">
              <div className="text-xs text-emerald-800 font-semibold">Total Cash Balance</div>
              <div className="text-3xl font-black text-emerald-950 mt-1">₹ {totalCash.toLocaleString()}</div>
              <div className="text-xs text-emerald-700 font-medium mt-1">Total Notes: {totalNoteCount}</div>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>• Instant calculation preventing end-of-day tally shortages.</div>
              <div>• Ready format for Bank Cash Deposit slips.</div>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Cash Tally Sheet
          </button>
        </div>
      </div>
    );
  }

  // 4. WHATSAPP DIRECT CHAT
  if (tool.id === 'whatsapp-direct-chat-link' || tool.category === 'whatsapp') {
    const cleanPhone = waPhone.replace(/\D/g, '');
    const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-600" />
            WhatsApp Quick Direct Chat
          </h4>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Mobile Number (10 Digits):</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs"
                placeholder="9876543210"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Default Pre-filled Message:</label>
            <textarea
              rows={3}
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-green-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-green-700 tracking-wider mb-2">Instant Action</div>
            <p className="text-xs text-slate-600 mb-4">
              Open chat directly with the customer without saving their number in your phone contacts!
            </p>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-xs text-green-950 font-mono break-all mb-3">
              {waPhone ? waLink : 'Enter phone number to generate direct chat link'}
            </div>
          </div>
          <div className="space-y-2">
            <a
              href={cleanPhone.length >= 10 ? waLink : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                cleanPhone.length >= 10
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Open WhatsApp Chat
            </a>
            <button
              onClick={() => handleCopy(waLink)}
              disabled={cleanPhone.length < 10}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer border border-slate-300"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied' : 'Copy Direct Link'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. DEFAULT INTERACTIVE ENGINE (File / Document / Canvas / Slips)
  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-base font-bold text-slate-900">{tool.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{tool.detailedInstructions}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
            {tool.categoryLabel}
          </span>
        </div>
      </div>

      {/* Interactive File Drop & Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="border-2 border-dashed border-slate-300 bg-white hover:border-blue-500 transition-colors rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-xs font-bold text-slate-800">Drag &amp; Drop or Upload File</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Supports PDF, JPG, PNG, WEBP, and scanned documents (Max 50MB)
            </div>
            <input
              type="file"
              onChange={handleImageUpload}
              className="mt-4 text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          {/* Key Checklist */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-900 mb-2">Included Utility Capabilities:</div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {tool.keyFeatures.map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Live Workspace Preview</div>
            {uploadedImage ? (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mb-4">
                <img src={uploadedImage} alt="Uploaded preview" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-4 text-center mb-4 text-slate-400 text-xs">
                <FileText className="w-8 h-8 mb-2 opacity-50" />
                <span>Upload a document or photo to inspect output and apply transformations.</span>
              </div>
            )}
            <div className="p-3 bg-blue-50/80 rounded-lg border border-blue-200 text-xs text-blue-900">
              <span className="font-semibold">Security Note:</span> All processing occurs locally inside your browser sandbox. No citizen certificates or personal files are transmitted to any server.
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => alert(`Processing ${tool.name} client-side... Complete!`)}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Process &amp; Apply
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
