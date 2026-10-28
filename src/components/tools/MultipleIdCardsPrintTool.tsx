import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, Printer, Plus, Trash2, Grid } from 'lucide-react';

interface CardSlot {
  id: string;
  front: string | null;
  back: string | null;
  name: string;
}

export const MultipleIdCardsPrintTool: React.FC = () => {
  const [cards, setCards] = useState<CardSlot[]>([
    { id: '1', front: null, back: null, name: 'Card 1 (Aadhaar / Voter)' },
    { id: '2', front: null, back: null, name: 'Card 2 (Driving License)' }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleAddCard = () => {
    if (cards.length >= 5) return;
    setCards([
      ...cards,
      { id: Date.now().toString(), front: null, back: null, name: `Card ${cards.length + 1}` }
    ]);
  };

  const handleRemoveCard = (id: string) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((c) => c.id !== id));
  };

  const handleImageUpload = (id: string, side: 'front' | 'back', file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [side]: ev.target?.result as string } : c))
      );
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // A4 at 300 DPI: 2480 × 3508 px
    canvas.width = 2480;
    canvas.height = 3508;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // CR80 dimensions: 1011 × 638 px
    const cardW = 1011;
    const cardH = 638;
    const gapX = 120;
    const gapY = 80;

    const startX = (canvas.width - (cardW * 2 + gapX)) / 2;
    const startY = 120;

    cards.forEach((card, idx) => {
      const y = startY + idx * (cardH + gapY);

      // Draw Front slot
      const drawSide = (imgSrc: string | null, x: number, sideLabel: string) => {
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(x, y, cardW, cardH);

        if (imgSrc) {
          const img = new Image();
          img.src = imgSrc;
          ctx.drawImage(img, x, y, cardW, cardH);
        } else {
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cardW, cardH);

          ctx.fillStyle = '#94A3B8';
          ctx.font = 'bold 28px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${card.name} - ${sideLabel}`, x + cardW / 2, y + cardH / 2);
        }

        // Cutting guides
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(x - 5, y - 5, cardW + 10, cardH + 10);
        ctx.setLineDash([]);
      };

      drawSide(card.front, startX, 'Front');
      drawSide(card.back, startX + cardW + gapX, 'Back');
    });
  }, [cards]);

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const imgData = canvasRef.current.toDataURL('image/jpeg', 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    doc.save('tanshu_multiple_id_cards_A4.pdf');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Batch Card Manager</h4>
            <p className="text-[11px] text-slate-500">Up to 5 cards per A4 page</p>
          </div>
          {cards.length < 5 && (
            <button
              onClick={handleAddCard}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Card ({cards.length}/5)
            </button>
          )}
        </div>

        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
          {cards.map((c, i) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">{c.name}</span>
                {cards.length > 1 && (
                  <button onClick={() => handleRemoveCard(c.id)} className="text-slate-400 hover:text-red-500 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="border border-dashed border-slate-300 rounded p-2 text-center cursor-pointer hover:border-blue-500 bg-slate-50/50 block">
                  <span className="block text-slate-600 font-medium truncate">{c.front ? '✓ Front Loaded' : '+ Upload Front'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(c.id, 'front', e.target.files[0])}
                  />
                </label>
                <label className="border border-dashed border-slate-300 rounded p-2 text-center cursor-pointer hover:border-blue-500 bg-slate-50/50 block">
                  <span className="block text-slate-600 font-medium truncate">{c.back ? '✓ Back Loaded' : '+ Upload Back'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(c.id, 'back', e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download A4 Print PDF (Batch Mode)
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">A4 Paper Batch Layout ({cards.length} Cards)</span>
          <span className="font-mono">Saves 60% Photo Paper</span>
        </div>

        <div className="w-full overflow-auto bg-slate-200/80 p-4 rounded-xl border border-slate-300 flex justify-center items-center max-h-[580px]">
          <canvas
            ref={canvasRef}
            className="max-h-[520px] w-auto shadow-md bg-white rounded"
            style={{ maxWidth: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};
