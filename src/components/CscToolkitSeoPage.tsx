import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { ToolItem } from '../types';
import { UniversalToolModal } from './tools/UniversalToolModal';

type ToolkitEntry = {
  slug: string; title: string; hindi: string; summary: string; summaryHi: string;
  description: string; descriptionHi: string; features: string[]; featuresHi: string[];
  keywords: string; launchPath?: string; toolId?: string;
};

export const CSC_TOOLKIT_ENTRIES: ToolkitEntry[] = [
  { slug:'instant-passport-photo-studio', title:'Instant Passport Photo Studio', hindi:'इंस्टेंट पासपोर्ट फोटो स्टूडियो', summary:'Create passport-size photos with smart crop, photo adjustment, signature editing and print-ready sheets.', summaryHi:'स्मार्ट क्रॉप, फोटो एडजस्टमेंट, सिग्नेचर एडिटिंग और प्रिंट शीट के साथ पासपोर्ट साइज फोटो तैयार करें।', description:'Prepare common Indian passport and application photo sizes, adjust the crop, edit a signature and arrange photos on 4×6 or A4 print sheets.', descriptionHi:'आम पासपोर्ट और आवेदन फोटो साइज चुनें, क्रॉप ठीक करें, सिग्नेचर एडिट करें और 4×6 या A4 प्रिंट शीट तैयार करें।', features:['Passport and application photo presets','Smart crop and photo adjustments','Signature editing and placement','4×6 and A4 print-sheet layouts'], featuresHi:['पासपोर्ट और आवेदन फोटो प्रीसेट','स्मार्ट क्रॉप और फोटो एडजस्टमेंट','सिग्नेचर एडिट और प्लेसमेंट','4×6 और A4 प्रिंट शीट'], keywords:'passport photo maker, passport size photo online, 4x6 passport photo print, पासपोर्ट फोटो मेकर', launchPath:'/advanced-photo-studio-preview' },
  { slug:'instant-pvc-card-maker', title:'Instant PVC Card Maker', hindi:'इंस्टेंट PVC कार्ड मेकर', summary:'Prepare front-and-back ID card layouts with crop controls and print setup for PVC card work.', summaryHi:'PVC कार्ड के काम के लिए फ्रंट-बैक ID कार्ड लेआउट, क्रॉप कंट्रोल और प्रिंट सेटअप तैयार करें।', description:'Use the dedicated PVC card workspace to arrange front and back card sides, set the print layout and prepare a sheet for printing.', descriptionHi:'फ्रंट और बैक कार्ड साइड व्यवस्थित करें, प्रिंट लेआउट सेट करें और प्रिंटिंग के लिए शीट तैयार करें।', features:['Front and back card arrangement','Smart crop and alignment','A4 print-sheet setup','Dedicated PVC card workspace'], featuresHi:['फ्रंट और बैक कार्ड सेटिंग','स्मार्ट क्रॉप और अलाइनमेंट','A4 प्रिंट शीट सेटअप','अलग PVC कार्ड वर्कस्पेस'], keywords:'PVC card maker, PVC ID card print layout, PVC card front back, पीवीसी कार्ड मेकर', launchPath:'/id-pvc-studio/premium-desktop-preview.html' },
  { slug:'whatsapp-selfie-to-passport-photo', title:'WhatsApp Selfie to Passport Photo', hindi:'WhatsApp सेल्फी से पासपोर्ट फोटो', summary:'Turn a customer selfie into a passport-style photo with guided crop, face alignment and print tools.', summaryHi:'गाइडेड क्रॉप, फेस अलाइनमेंट और प्रिंट टूल्स से ग्राहक की सेल्फी को पासपोर्ट स्टाइल फोटो में बदलें।', description:'Open the selfie studio to upload a photo, position the face, straighten the image, adjust the background and prepare print output.', descriptionHi:'सेल्फी स्टूडियो में फोटो अपलोड करें, चेहरा सही जगह रखें, फोटो सीधी करें, बैकग्राउंड एडजस्ट करें और प्रिंट तैयार करें।', features:['Guided selfie crop and face alignment','Straighten and photo adjustments','Background and signature tools','Photo-size and print options'], featuresHi:['गाइडेड सेल्फी क्रॉप और फेस अलाइनमेंट','फोटो सीधी करना और एडजस्टमेंट','बैकग्राउंड और सिग्नेचर टूल','फोटो साइज और प्रिंट विकल्प'], keywords:'selfie to passport photo, WhatsApp passport photo maker, mobile passport photo, सेल्फी पासपोर्ट फोटो', launchPath:'/whatsapp-selfie-passport-photo' },
  { slug:'instant-multi-customer-photo-maker', title:'Instant Multi Customer Photo Maker', hindi:'इंस्टेंट मल्टी कस्टमर फोटो मेकर', summary:'Prepare multiple customers’ photos in one workspace with batch editing and print-ready layouts.', summaryHi:'एक ही वर्कस्पेस में कई ग्राहकों की फोटो एडिट करें और बैच प्रिंट लेआउट तैयार करें।', description:'Add multiple customer photos, crop and adjust each image, place signatures where needed and prepare organized print sheets.', descriptionHi:'कई ग्राहकों की फोटो जोड़ें, हर फोटो को क्रॉप और एडजस्ट करें, जरूरत पर सिग्नेचर लगाएं और प्रिंट शीट तैयार करें।', features:['Multiple customer photo uploads','Individual crop and photo editing','Batch preparation in one workspace','Print-ready sheet layouts'], featuresHi:['कई ग्राहकों की फोटो अपलोड','अलग-अलग क्रॉप और फोटो एडिटिंग','एक वर्कस्पेस में बैच तैयारी','प्रिंट के लिए तैयार शीट लेआउट'], keywords:'multiple passport photo maker, bulk photo printing, batch passport photo, मल्टी कस्टमर फोटो मेकर', launchPath:'/instant-multi-customer-photo-maker' },
  { slug:'photo-signature-resizer', title:'Photo & Signature Resizer', hindi:'फोटो और सिग्नेचर रिसाइज़र', summary:'Resize application photos and signatures to required dimensions and KB limits with preview and downloads.', summaryHi:'आवेदन के फोटो और सिग्नेचर को जरूरी साइज और KB लिमिट में रिसाइज करें, प्रीव्यू देखें और डाउनलोड करें।', description:'Choose separate photo and signature dimensions, set a target file size, preview the result and export JPG or PNG files. Always check the official form requirements before submitting.', descriptionHi:'फोटो और सिग्नेचर का अलग-अलग साइज चुनें, KB लिमिट सेट करें, प्रीव्यू देखें और JPG या PNG डाउनलोड करें। आवेदन से पहले आधिकारिक फॉर्म की शर्तें जरूर जांचें।', features:['Separate photo and signature sizing','Target KB and dimension controls','JPG and PNG output','Preview and download options'], featuresHi:['फोटो और सिग्नेचर का अलग साइज','KB और डायमेंशन कंट्रोल','JPG और PNG आउटपुट','प्रीव्यू और डाउनलोड'], keywords:'photo resize in KB, signature resizer, 20KB 50KB photo resize, फोटो साइज KB में', toolId:'photo-signature-resizer' },
  { slug:'auto-document-cropper', title:'Auto Document Cropper', hindi:'ऑटो डॉक्यूमेंट क्रॉपर', summary:'Detect document edges, crop and straighten photographed documents, then download PNG or PDF.', summaryHi:'डॉक्यूमेंट के किनारे पहचानें, फोटो को ऑटो क्रॉप और सीधा करें, फिर PNG या PDF डाउनलोड करें।', description:'Upload a document photo, detect its edges, fine-tune the crop corners and correct orientation before exporting.', descriptionHi:'डॉक्यूमेंट की फोटो अपलोड करें, किनारे पहचानें, क्रॉप कॉर्नर ठीक करें और डाउनलोड से पहले दिशा सही करें।', features:['Automatic document-edge detection','Crop and straighten controls','Manual corner fine-tuning','PNG and PDF downloads'], featuresHi:['ऑटो डॉक्यूमेंट एज डिटेक्शन','क्रॉप और स्ट्रेटन कंट्रोल','कॉर्नर मैन्युअल ठीक करें','PNG और PDF डाउनलोड'], keywords:'auto document cropper, document crop online, document scanner crop, डॉक्यूमेंट क्रॉपर', toolId:'auto-document-cropper' },
  { slug:'photo-background-remover', title:'Photo Background Remover', hindi:'फोटो बैकग्राउंड रिमूवर', summary:'Remove a photo background and export a transparent or custom-colour image.', summaryHi:'फोटो का बैकग्राउंड हटाएं और ट्रांसपेरेंट या मनपसंद रंग वाली इमेज डाउनलोड करें।', description:'Upload a portrait, process the background in the photo workspace, choose a transparent or solid-colour result and export the image.', descriptionHi:'पोर्ट्रेट फोटो अपलोड करें, बैकग्राउंड प्रोसेस करें, ट्रांसपेरेंट या सॉलिड कलर चुनें और इमेज डाउनलोड करें।', features:['Photo background removal','Transparent PNG output','Custom background colour','Crop and image export controls'], featuresHi:['फोटो बैकग्राउंड हटाना','ट्रांसपेरेंट PNG आउटपुट','मनपसंद बैकग्राउंड रंग','क्रॉप और इमेज एक्सपोर्ट कंट्रोल'], keywords:'photo background remover, remove image background, transparent PNG maker, फोटो बैकग्राउंड हटाएं', toolId:'photo-background-remover' },
];

const hub = {
  slug:'csc-cyber-cafe-toolkits', title:'CSC & Cyber Cafe Toolkits', hindi:'CSC और साइबर कैफे टूलकिट',
  summary:'Essential digital service, cyber cafe and document tools — all in one place.',
  summaryHi:'डिजिटल सेवा, साइबर कैफे और दस्तावेज़ संबंधी जरूरी टूल्स — एक ही जगह।',
};

export const CscToolkitSeoPage: React.FC<{ slug: string }> = ({ slug }) => {
  const entry = CSC_TOOLKIT_ENTRIES.find(item => item.slug === slug);
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);
  const tool = useMemo(() => entry?.toolId ? CONFIRMED_TOOLS.find(item => item.id === entry.toolId) || null : null, [entry]);
  const isHub = slug === hub.slug;
  const title = isHub ? hub.title : entry?.title || hub.title;
  const launch = () => { if (tool) setActiveTool(tool); };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="/" className="text-sm font-extrabold tracking-wide text-slate-900">TANSHU ONLINE</a>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-800"><ArrowLeft className="h-4 w-4"/> Home</a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500"><a href="/" className="hover:text-rose-800">Home</a><span className="px-2">/</span><a href="/csc-cyber-cafe-toolkits" className="hover:text-rose-800">CSC &amp; Cyber Cafe Toolkits</a>{!isHub && <><span className="px-2">/</span><span>{title}</span></>}</nav>
        <section className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50 to-amber-50 p-6 shadow-sm sm:p-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-rose-800">TANSHU ONLINE · CSC &amp; CYBER CAFE TOOLS</p>
          <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-2 text-xl font-bold text-slate-700">{isHub ? hub.hindi : entry?.hindi}</p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">{isHub ? hub.summary : entry?.summary}</p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{isHub ? hub.summaryHi : entry?.summaryHi}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600"><span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-700"/> Browser-based workspace</span><span>·</span><span>Hindi + English guidance</span><span>·</span><span>CSC &amp; Cyber Cafe workflow</span></div>
        </section>
        {isHub ? (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold">Explore the 7 CSC &amp; Cyber Cafe Tools</h2>
            <p className="mt-2 text-slate-600">Choose a tool to read how it works and open its actual workspace.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{CSC_TOOLKIT_ENTRIES.map(item => <a key={item.slug} href={'/'+item.slug} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-md"><h3 className="font-extrabold text-slate-900 group-hover:text-rose-800">{item.title}</h3><p className="mt-1 text-sm font-semibold text-slate-600">{item.hindi}</p><p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-rose-800">Explore tool <ArrowUpRight className="h-4 w-4"/></span></a>)}</div>
          </section>
        ) : entry && (
          <>
            <section className="mt-9 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold">About this tool</h2><p className="mt-3 leading-7 text-slate-700">{entry.description}</p><p className="mt-2 leading-7 text-slate-600">{entry.descriptionHi}</p>
                <h2 className="mt-7 text-xl font-extrabold">Key features</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2">{entry.features.map(feature => <li key={feature} className="flex gap-2 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700"/>{feature}</li>)}</ul>
                <h3 className="mt-6 text-lg font-bold">मुख्य सुविधाएं</h3><ul className="mt-2 grid gap-2 sm:grid-cols-2">{entry.featuresHi.map(feature => <li key={feature} className="text-sm leading-6 text-slate-600">• {feature}</li>)}</ul>
              </div>
              <aside className="h-fit rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-extrabold">Open the actual tool</h2><p className="mt-2 text-sm leading-6 text-slate-600">Use the live workspace to process your photo or document. Check the required size and specifications of the destination form before submitting.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">वास्तविक टूल खोलकर अपनी फोटो या डॉक्यूमेंट तैयार करें। सबमिट करने से पहले संबंधित फॉर्म की शर्तें जांचें।</p>
                {entry.launchPath ? <a href={entry.launchPath} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-900 px-5 py-3 text-sm font-bold text-white hover:bg-rose-800">Open Studio <ArrowUpRight className="h-4 w-4"/></a> : <button onClick={launch} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-900 px-5 py-3 text-sm font-bold text-white hover:bg-rose-800">Open Tool <ArrowUpRight className="h-4 w-4"/></button>}
                <p className="mt-4 text-xs leading-5 text-slate-500">Your selected files are processed in the browser for these tools. Avoid uploading documents to a shared or public device.</p>
              </aside>
            </section>
            <section className="mt-8 rounded-2xl bg-slate-900 p-6 text-white"><h2 className="text-xl font-extrabold">More CSC &amp; Cyber Cafe tools</h2><p className="mt-2 text-sm text-slate-300">Explore the complete seven-tool toolkit.</p><a href="/csc-cyber-cafe-toolkits" className="mt-4 inline-flex items-center gap-2 font-bold text-amber-300 hover:text-amber-200">View all 7 tools <ArrowUpRight className="h-4 w-4"/></a></section>
          </>
        )}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">© TANSHU ONLINE · CSC &amp; Cyber Cafe Toolkits</footer>
      {activeTool && <UniversalToolModal tool={activeTool} onClose={() => setActiveTool(null)}/>}
    </div>
  );
};
