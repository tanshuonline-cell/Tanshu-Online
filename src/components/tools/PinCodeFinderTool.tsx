import React, { useState } from 'react';
import { Search, MapPin, Building2, Check, Copy } from 'lucide-react';
import { PINCODE_DATABASE } from '../../data/pincodeData';
import { PinCodeEntry } from '../../types';

export const PinCodeFinderTool: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filtered = PINCODE_DATABASE.filter((entry) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      entry.pincode.includes(q) ||
      entry.officeName.toLowerCase().includes(q) ||
      entry.district.toLowerCase().includes(q) ||
      entry.state.toLowerCase().includes(q)
    );
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by 6-digit PIN code, post office name, district, or state..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <span>Showing {filtered.length} verified postal branches</span>
        <span className="font-mono">India Post Circle Network</span>
      </div>

      {/* Results Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-1">
        {filtered.map((item) => (
          <div
            key={item.pincode + item.officeName}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-400 transition-colors space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-lg font-mono font-bold text-blue-700 tracking-wider">
                  {item.pincode}
                </span>
                <h4 className="text-xs font-semibold text-slate-900 mt-0.5">{item.officeName}</h4>
              </div>
              <button
                onClick={() => handleCopy(item.pincode)}
                className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors"
                title="Copy PIN Code"
              >
                {copiedCode === item.pincode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">District:</span>
                <span className="font-medium text-slate-700">{item.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">State:</span>
                <span className="font-medium text-slate-700">{item.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Office Type:</span>
                <span className="font-mono text-[11px] text-slate-700">
                  {item.officeType === 'HO' ? 'Head Office (HO)' : 'Sub Office (SO)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Status:</span>
                <span className="text-emerald-700 font-medium text-[11px]">{item.deliveryStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
