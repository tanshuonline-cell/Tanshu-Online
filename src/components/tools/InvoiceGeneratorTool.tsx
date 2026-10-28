import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Plus, Trash2, Printer, Download, Receipt, Building, User, IndianRupee } from 'lucide-react';
import { InvoiceData, InvoiceItem } from '../../types';

// Convert number to Indian currency words
function numberToIndianWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = Math.floor(num)) === 0) return 'Zero Rupees Only';
  
  const inWords = (n: number): string => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  };

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remaining = num;

  let result = '';
  if (crore > 0) result += inWords(crore) + 'Crore ';
  if (lakh > 0) result += inWords(lakh) + 'Lakh ';
  if (thousand > 0) result += inWords(thousand) + 'Thousand ';
  if (remaining > 0) result += inWords(remaining);

  return result.trim() + ' Rupees Only';
}

export const InvoiceGeneratorTool: React.FC = () => {
  const [data, setData] = useState<InvoiceData>({
    invoiceNumber: `TSO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    businessName: 'TANSHU DIGITAL SEVA & CYBER KENDRA',
    businessGstin: '07AABCT1234Q1Z5',
    businessAddress: 'Main Market Road, Near SBI Bank, Ward No. 4',
    businessPhone: '+91 98765 43210',
    businessEmail: 'tanshuonline@gmail.com',
    customerName: 'Ramesh Kumar',
    customerPhone: '+91 98111 22334',
    customerAddress: 'Village Post Rampur, District Sadar',
    customerGstin: '',
    items: [
      { id: '1', description: 'PVC Smart ID Card Printing (CR80 Both Sides)', quantity: 2, unitPrice: 70, gstRate: 18 },
      { id: '2', description: 'Passport Size Photos (Sheet of 8 Pcs on Glossy Paper)', quantity: 1, unitPrice: 50, gstRate: 0 },
      { id: '3', description: 'Online Govt Form Submission & e-KYC Verification', quantity: 1, unitPrice: 100, gstRate: 18 },
      { id: '4', description: 'Document Scanning & Color Printout', quantity: 4, unitPrice: 10, gstRate: 18 }
    ],
    notes: 'Thank you for choosing TANSHU Digital Seva! Keep this invoice for any service warranty.',
    terms: 'Computer generated bill. No physical signature required. All digital submissions are subject to government verification guidelines.',
    paymentMode: 'UPI',
    upiId: 'tanshuonline@upi'
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    
    data.items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const tax = (lineTotal * item.gstRate) / 100;
      subtotal += lineTotal;
      totalTax += tax;
    });

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const grandTotal = Math.round(subtotal + totalTax);

    return { subtotal, totalTax, cgst, sgst, grandTotal };
  };

  const { subtotal, totalTax, cgst, sgst, grandTotal } = calculateTotals();

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: 'New Digital Service',
      quantity: 1,
      unitPrice: 50,
      gstRate: 18
    };
    setData({ ...data, items: [...data.items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    if (data.items.length <= 1) return;
    setData({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setData({
      ...data,
      items: data.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Clean professional header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138); // Deep Navy
    doc.text(data.businessName || 'INVOICE', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(data.businessAddress, 14, 26);
    doc.text(`Phone: ${data.businessPhone} | Email: ${data.businessEmail}`, 14, 31);
    if (data.businessGstin) {
      doc.text(`GSTIN: ${data.businessGstin}`, 14, 36);
    }

    // Invoice meta on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('TAX INVOICE', 196, 20, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Invoice No: ${data.invoiceNumber}`, 196, 26, { align: 'right' });
    doc.text(`Date: ${data.invoiceDate}`, 196, 31, { align: 'right' });
    doc.text(`Payment: ${data.paymentMode}`, 196, 36, { align: 'right' });

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    // Bill To
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('BILLED TO:', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Name: ${data.customerName}`, 14, 56);
    doc.text(`Phone: ${data.customerPhone}`, 14, 61);
    doc.text(`Address: ${data.customerAddress}`, 14, 66);
    if (data.customerGstin) doc.text(`GSTIN: ${data.customerGstin}`, 14, 71);

    // Table Header
    let y = 80;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('SL', 16, y + 5.5);
    doc.text('DESCRIPTION OF GOODS / SERVICES', 26, y + 5.5);
    doc.text('QTY', 125, y + 5.5, { align: 'right' });
    doc.text('RATE (Rs)', 150, y + 5.5, { align: 'right' });
    doc.text('AMOUNT (Rs)', 194, y + 5.5, { align: 'right' });

    // Table Rows
    y += 9;
    doc.setFont('helvetica', 'normal');
    data.items.forEach((item, index) => {
      const lineTotal = item.quantity * item.unitPrice;
      doc.text(`${index + 1}`, 16, y + 4);
      doc.text(item.description, 26, y + 4);
      doc.text(`${item.quantity}`, 125, y + 4, { align: 'right' });
      doc.text(item.unitPrice.toFixed(2), 150, y + 4, { align: 'right' });
      doc.text(lineTotal.toFixed(2), 194, y + 4, { align: 'right' });
      
      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 7, 196, y + 7);
      y += 8;
    });

    // Totals Block
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, 150, y, { align: 'right' });
    doc.text(`Rs ${subtotal.toFixed(2)}`, 194, y, { align: 'right' });
    y += 6;

    if (totalTax > 0) {
      doc.text(`CGST (Tax):`, 150, y, { align: 'right' });
      doc.text(`Rs ${cgst.toFixed(2)}`, 194, y, { align: 'right' });
      y += 6;
      doc.text(`SGST (Tax):`, 150, y, { align: 'right' });
      doc.text(`Rs ${sgst.toFixed(2)}`, 194, y, { align: 'right' });
      y += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.setFillColor(238, 242, 255);
    doc.rect(120, y - 2, 76, 9, 'F');
    doc.text(`Grand Total:`, 150, y + 4.5, { align: 'right' });
    doc.text(`Rs ${grandTotal.toFixed(2)}`, 194, y + 4.5, { align: 'right' });

    // Amount in words
    y += 15;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Amount in Words: ${numberToIndianWords(grandTotal)}`, 14, y);

    // Bank / UPI details
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment UPI VPA: ${data.upiId}`, 14, y);
    doc.text(`Terms: ${data.terms}`, 14, y + 6);

    doc.save(`invoice_${data.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'edit' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Invoice Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bill Preview & Print
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Bill
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shop Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" /> Kiosk / Shop Details
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1">Business Name</label>
                <input
                  type="text"
                  value={data.businessName}
                  onChange={(e) => setData({ ...data, businessName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={data.businessPhone}
                    onChange={(e) => setData({ ...data, businessPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={data.businessGstin}
                    onChange={(e) => setData({ ...data, businessGstin: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Shop Address</label>
                <input
                  type="text"
                  value={data.businessAddress}
                  onChange={(e) => setData({ ...data, businessAddress: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">UPI ID (For QR Code Payments)</label>
                <input
                  type="text"
                  value={data.upiId}
                  onChange={(e) => setData({ ...data, upiId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Customer & Invoice Meta */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Customer & Invoice Info
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={data.invoiceNumber}
                    onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={data.invoiceDate}
                    onChange={(e) => setData({ ...data, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={data.customerName}
                    onChange={(e) => setData({ ...data, customerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={data.customerPhone}
                    onChange={(e) => setData({ ...data, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Customer Location / Address</label>
                <input
                  type="text"
                  value={data.customerAddress}
                  onChange={(e) => setData({ ...data, customerAddress: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Payment Method</label>
                <select
                  value={data.paymentMode}
                  onChange={(e) => setData({ ...data, paymentMode: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" /> Services & Products Billed
              </h4>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Service
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3">Service / Item Description</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-24 text-center">GST %</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                    <th className="py-2.5 px-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-slate-200 rounded focus:border-blue-600"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 text-center bg-transparent border border-slate-200 rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1 text-right bg-transparent border border-slate-200 rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(item.id, 'gstRate', Number(e.target.value))}
                          className="w-full px-2 py-1 text-center bg-transparent border border-slate-200 rounded text-xs"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                        ₹{(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="flex flex-wrap items-center justify-end gap-6 pt-4 border-t border-slate-100 text-xs">
              <div className="text-slate-600">Subtotal: <span className="font-mono font-medium text-slate-900">₹{subtotal.toFixed(2)}</span></div>
              <div className="text-slate-600">Total GST: <span className="font-mono font-medium text-slate-900">₹{totalTax.toFixed(2)}</span></div>
              <div className="text-slate-900 font-bold text-sm">Grand Total: <span className="font-mono text-blue-700">₹{grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      ) : (
        /* Printable Bill View */
        <div ref={printAreaRef} className="max-w-3xl mx-auto bg-white border border-slate-300 rounded-lg p-8 shadow-sm text-slate-800">
          {/* Top Brand Banner */}
          <div className="flex justify-between items-start border-b-2 border-blue-900 pb-5">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-amber-600 block mb-1">Official Cash Memo / Invoice</span>
              <h2 className="text-xl font-bold text-blue-900">{data.businessName}</h2>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">{data.businessAddress}</p>
              <div className="flex gap-4 text-xs text-slate-500 mt-1">
                <span>Phone: {data.businessPhone}</span>
                {data.businessGstin && <span>GSTIN: {data.businessGstin}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-slate-500">Invoice Number</div>
              <div className="text-sm font-mono font-bold text-slate-900">{data.invoiceNumber}</div>
              <div className="text-xs text-slate-500 mt-1">Date: <span className="font-medium text-slate-700">{data.invoiceDate}</span></div>
              <div className="text-xs text-slate-500">Payment: <span className="font-medium text-emerald-700">{data.paymentMode}</span></div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-6 my-5 text-xs">
            <div>
              <span className="font-semibold text-slate-900 block mb-1">Customer Details:</span>
              <p className="font-medium text-slate-800">{data.customerName}</p>
              <p className="text-slate-600">{data.customerAddress}</p>
              <p className="text-slate-600">Contact: {data.customerPhone}</p>
            </div>
            <div className="flex flex-col items-end justify-center">
              {data.upiId && (
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=upi://pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.businessName)}&am=${grandTotal}&cu=INR`}
                    alt="UPI Payment QR"
                    className="w-16 h-16 rounded border"
                  />
                  <div className="text-left text-[11px]">
                    <span className="font-bold text-slate-800 block">Scan & Pay via UPI</span>
                    <span className="font-mono text-slate-600 block text-[10px]">{data.upiId}</span>
                    <span className="font-semibold text-emerald-700 text-xs mt-0.5 block">Amount: ₹{grandTotal}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs text-left my-4 border-collapse">
            <thead>
              <tr className="border-y border-slate-300 bg-slate-100 text-slate-700 font-semibold">
                <th className="py-2 px-2 w-10 text-center">#</th>
                <th className="py-2 px-3">Service / Item</th>
                <th className="py-2 px-2 text-center w-16">Qty</th>
                <th className="py-2 px-2 text-right w-24">Rate (₹)</th>
                <th className="py-2 px-2 text-center w-16">GST</th>
                <th className="py-2 px-3 text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-2 px-2 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-3 font-medium text-slate-800">{item.description}</td>
                  <td className="py-2 px-2 text-center font-mono">{item.quantity}</td>
                  <td className="py-2 px-2 text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center text-slate-600">{item.gstRate}%</td>
                  <td className="py-2 px-3 text-right font-mono font-medium">{(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation Bottom Strip */}
          <div className="flex justify-between items-start pt-4 border-t border-slate-300 text-xs">
            <div className="max-w-xs space-y-1">
              <p className="font-semibold text-slate-700">Amount in Words:</p>
              <p className="text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                {numberToIndianWords(grandTotal)}
              </p>
              <p className="text-[10px] text-slate-500 pt-2">{data.terms}</p>
            </div>

            <div className="w-64 space-y-1.5 text-right font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {totalTax > 0 && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST:</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST:</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm font-bold text-blue-900 pt-2 border-t border-slate-300">
                <span>Total Payable:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signature Stamp Footer */}
          <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Customer Acknowledgement</p>
              <div className="h-10"></div>
              <p className="border-t border-dashed border-slate-300 pt-1 text-[11px]">Sign / Thumb Impression</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700">For {data.businessName}</p>
              <div className="h-10 flex items-center justify-end">
                <span className="text-[10px] text-blue-700 border border-blue-600 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">Digitally Verified</span>
              </div>
              <p className="border-t border-dashed border-slate-300 pt-1 text-[11px]">Authorized Signatory</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
