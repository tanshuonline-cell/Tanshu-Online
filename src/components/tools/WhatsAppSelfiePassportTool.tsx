import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { TANSHU_PROFILE_PHOTO } from '../Header';
import {
  ArrowLeft, Camera, Check, Crop, Download, Eraser, FileImage, FlipHorizontal,
  ImagePlus, Info, Layers3, RotateCcw, RotateCw, ScanFace,
  ShieldCheck, SlidersHorizontal, Sparkles, UploadCloud, WandSparkles,
  X, ZoomIn, ZoomOut, Maximize2, Minimize2, Undo2, Redo2, Trash2, Merge
} from 'lucide-react';

type StudioTool = 'crop' | 'face' | 'straighten' | 'background' | 'signature' | 'print';

const WORKFLOW_STEPS = [
  { label: 'Upload Selfie', detail: 'Choose a customer photo', icon: Camera },
  { label: 'Crop & Face', detail: 'Frame the face correctly', icon: ScanFace },
  { label: 'Straighten', detail: 'Correct photo alignment', icon: RotateCw },
  { label: 'Background', detail: 'Prepare a clean backdrop', icon: Sparkles },
  { label: 'Print & Export', detail: 'Prepare final photo output', icon: Download },
];

const TOOL_ITEMS: { id: StudioTool; label: string; short: string; icon: typeof Crop }[] = [
  { id: 'crop', label: 'Crop & Position', short: 'CROP', icon: Crop },
  { id: 'face', label: 'Face Alignment', short: 'FACE', icon: ScanFace },
  { id: 'straighten', label: 'Straighten', short: 'ALIGN', icon: SlidersHorizontal },
  { id: 'background', label: 'BG Remove', short: 'BG', icon: Eraser },
  { id: 'signature', label: 'Signature Studio', short: 'SIGN', icon: FileImage },
  { id: 'print', label: 'Photo Size & Print', short: 'PRINT', icon: FileImage },
];

const PHOTO_SIZE_GROUPS = [
  { label: 'Common India print sizes', options: [
    { value: '35x45', label: 'Passport / General Form · 35 × 45 mm', width: 35, height: 45 },
    { value: '25x35', label: 'PAN Card Print · 25 × 35 mm', width: 25, height: 35 },
    { value: 'voter35x45', label: 'Voter ID / Form · 35 × 45 mm', width: 35, height: 45 },
    { value: 'dl35x45', label: 'Driving Licence · 35 × 45 mm', width: 35, height: 45 },
    { value: 'exam35x45', label: 'Exam Form Common · 35 × 45 mm', width: 35, height: 45 },
    { value: '25x30', label: 'Stamp Photo · 25 × 30 mm', width: 25, height: 30 },
  ]},
  { label: 'Visa & consular sizes', options: [
    { value: '2x2', label: 'Visa Photo · 2 × 2 inch (50.8 × 50.8 mm)', width: 50.8, height: 50.8 },
    { value: '51x51', label: 'OCI Photo · 51 × 51 mm', width: 51, height: 51 },
    { value: '35x35', label: 'Passport / Consular Square · 35 × 35 mm', width: 35, height: 35 },
    { value: 'pcc35x35', label: 'PCC / Birth Certificate · 35 × 35 mm', width: 35, height: 35 },
    { value: 'frro35x35', label: 'FRRO / Consular Form · 35 × 35 mm', width: 35, height: 35 },
  ]},
];
const ALL_PHOTO_SIZES = PHOTO_SIZE_GROUPS.flatMap(group => group.options);
const toolDescriptions: Record<StudioTool, { title: string; description: string }> = {
  crop: { title: 'Crop & Position', description: 'Set the photo frame and position the customer’s face accurately.' },
  face: { title: 'Free AI Face Alignment', description: 'Detect one face on this device, measure eye-line tilt and gently straighten the original photo.' },
  straighten: { title: 'Straighten & Rotate', description: 'Correct a tilted selfie before preparing the passport photo.' },
  background: { title: 'Background Studio', description: 'Remove the original backdrop and apply a clean studio colour.' },
  signature: { title: 'Signature Studio', description: 'Clean, position, resize and rotate the customer signature.' },
  print: { title: 'Photo Size & Print', description: 'Choose a standard photo size and prepare print sheets.' },
};

const STUDIO_BACKUP_DB='tanshu-whatsapp-studio-backup';
const openStudioBackupDb=()=>new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open(STUDIO_BACKUP_DB,1);request.onupgradeneeded=()=>request.result.createObjectStore('sessions');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
const writeStudioBackup=async(value:unknown)=>{const db=await openStudioBackupDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('sessions','readwrite');tx.objectStore('sessions').put(value,'current-session');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();};
const readStudioBackup=async()=>{const db=await openStudioBackupDb();const value=await new Promise<any>((resolve,reject)=>{const request=db.transaction('sessions','readonly').objectStore('sessions').get('current-session');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});db.close();return value;};

const NumericStepper: React.FC<{label:string;value:number;min:number;max:number;step:number;unit?:string;compact?:boolean;onChange:(value:number)=>void}> = ({label,value,min,max,step,unit='mm',compact=false,onChange}) => {
  const normalize=(next:number)=>step===1?Math.round(next):Number(next.toFixed(3));
  const adjust=(amount:number)=>onChange(normalize(Math.max(min,Math.min(max,value+amount))));
  return <div className={compact?'flex min-w-0 items-center gap-1.5':'min-w-0'}><label className={compact?'shrink-0 text-[9px] font-bold text-[#AAB8C0]':'mb-1 block text-[9px] font-bold text-[#D4DCE1]'}>{label}</label><div className="flex h-8 min-w-0 items-center overflow-hidden rounded-lg border border-[#46535C] bg-[#171D22]">
    <button type="button" aria-label={label+' decrease'} onClick={()=>adjust(-step)} className="h-full w-7 shrink-0 text-sm font-bold text-[#C3CDD3] hover:bg-white/10">−</button>
    <input aria-label={label} type="number" min={min} max={max} step={step} value={value} onChange={event=>{const next=event.target.value;if(next!=='')onChange(normalize(Math.max(min,Math.min(max,Number(next)))));}} onWheel={event=>{event.preventDefault();event.stopPropagation();adjust(event.deltaY<0?step:-step);}} className="h-full min-w-0 w-full bg-transparent px-1 text-center text-[10px] font-bold tabular-nums text-white outline-none"/>
    <span className="shrink-0 text-[8px] text-[#829099]">{unit}</span><button type="button" aria-label={label+' increase'} onClick={()=>adjust(step)} className="h-full w-7 shrink-0 text-sm font-bold text-[#C3CDD3] hover:bg-white/10">+</button>
  </div></div>;
};

export const WhatsAppSelfiePassportTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processedPhotoUrl, setProcessedPhotoUrl] = useState('');
  const [activeTool, setActiveTool] = useState<StudioTool>('crop');
  const [photoSize, setPhotoSize] = useState('35x45');
  const [customPhotoWidthMm, setCustomPhotoWidthMm] = useState(35);
  const [customPhotoHeightMm, setCustomPhotoHeightMm] = useState(45);
  const [sourceDimensions, setSourceDimensions] = useState<{width:number;height:number}|null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [inputMode, setInputMode] = useState<'selfie' | 'existing' | 'whatsapp'>('selfie');
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureUrl, setSignatureUrl] = useState('');
  const [sheetSize, setSheetSize] = useState('A4');
  const [customSheetWidthMm, setCustomSheetWidthMm] = useState(210);
  const [customSheetHeightMm, setCustomSheetHeightMm] = useState(297);
  const [sheetZoom, setSheetZoom] = useState(100);
  const [signatureVisible, setSignatureVisible] = useState(true);
  const [signatureProcessedUrl, setSignatureProcessedUrl] = useState('');
  const [signaturePosition, setSignaturePosition] = useState({ x: 66, y: 84 });
  const [signatureScale, setSignatureScale] = useState(1);
  const [signatureRotation, setSignatureRotation] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundStatus, setBackgroundStatus] = useState('');
  const [photoCount, setPhotoCount] = useState(8);
  const [horizontalMarginMm, setHorizontalMarginMm] = useState(3);
  const [verticalMarginMm, setVerticalMarginMm] = useState(3);
  const [horizontalGapMm, setHorizontalGapMm] = useState(2);
  const [verticalGapMm, setVerticalGapMm] = useState(2);
  const [photoPositions, setPhotoPositions] = useState<Record<number,{x:number;y:number}>>({});
  const [photoScales, setPhotoScales] = useState<Record<number,number>>({});
  const [photoImages, setPhotoImages] = useState<Record<number,string>>({});
  const [photoDimensions, setPhotoDimensions] = useState<Record<number,{width:number;height:number}>>({});
  const [selectedSheetPhotos, setSelectedSheetPhotos] = useState<number[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [resizeMode, setResizeMode] = useState(false);
  const [photoClipboard, setPhotoClipboard] = useState<{position:{x:number;y:number};scale:number;image?:string;dimensions?:{width:number;height:number}}|null>(null);
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidthMm, setBorderWidthMm] = useState(0.3);
  const [mergedPhotoUrl, setMergedPhotoUrl] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const selectedPhotoPreset = ALL_PHOTO_SIZES.find(item => item.value === photoSize);
  const photoWidthMm = photoSize === 'custom' ? customPhotoWidthMm : (selectedPhotoPreset?.width ?? 35);
  const photoHeightMm = photoSize === 'custom' ? customPhotoHeightMm : (selectedPhotoPreset?.height ?? 45);
  const cropAspectRatio = photoSize === 'custom' ? null : photoWidthMm / photoHeightMm;
  const paperDimensions: Record<string,{width:number;height:number;label:string}> = {
    single:{width:photoWidthMm+horizontalMarginMm*2,height:photoHeightMm+verticalMarginMm*2,label:'Single Photo'},
    '3.5x5':{width:88.9,height:127,label:'3.5 × 5'},
    '4x6':{width:101.6,height:152.4,label:'4 × 6'},
    '4x8':{width:101.6,height:203.2,label:'4 × 8'},
    '5x7':{width:127,height:177.8,label:'5 × 7'},
    '6x8':{width:152.4,height:203.2,label:'6 × 8'},
    '8x10':{width:203.2,height:254,label:'8 × 10'},
    A6:{width:105,height:148,label:'A6'}, A5:{width:148,height:210,label:'A5'},
    A4:{width:210,height:297,label:'A4'}, A3:{width:297,height:420,label:'A3'},
    Letter:{width:215.9,height:279.4,label:'Letter'}, Legal:{width:215.9,height:355.6,label:'Legal'},
    custom:{width:customSheetWidthMm,height:customSheetHeightMm,label:'Custom'}
  };
  const sheetWidthMm = paperDimensions[sheetSize]?.width ?? 210;
  const sheetHeightMm = paperDimensions[sheetSize]?.height ?? 297;
  const sheetColumns = Math.max(1, Math.floor((sheetWidthMm - horizontalMarginMm * 2 + horizontalGapMm) / (photoWidthMm + horizontalGapMm)));
  const sheetRows = Math.max(1, Math.floor((sheetHeightMm - verticalMarginMm * 2 + verticalGapMm) / (photoHeightMm + verticalGapMm)));
  const sheetCapacity = sheetColumns * sheetRows;
  const sheetPreviewScale = 2;
  const visiblePhotoCount = Math.min(photoCount, sheetCapacity);
  const segmenterRef = useRef<any>(null);
  const signatureDragRef = useRef<{x:number;y:number;left:number;top:number}|null>(null);
  const sheetPhotoDragRef = useRef<{index:number;startX:number;startY:number;initialX:number;initialY:number;scale:number}|null>(null);
  const sheetPhotoResizeRef = useRef<{index:number;startX:number;startY:number;initialScale:number;previewScale:number;cornerX:number;cornerY:number}|null>(null);
  const replacePhotoInputRef = useRef<HTMLInputElement>(null);
  const cropViewportRef = useRef<HTMLDivElement>(null);
  const cropDrawRef = useRef<{mode:'draw'|'move'|'resize';startX:number;startY:number;bounds:DOMRect;initialRect:{x:number;y:number;w:number;h:number};anchorX:number;anchorY:number;cornerX:number;cornerY:number}|null>(null);
  const photoPanRef = useRef<{startX:number;startY:number;offsetX:number;offsetY:number}|null>(null);
  const photoResizeRef = useRef<{startX:number;startY:number;initialScale:number;cornerX:number;cornerY:number;bounds:DOMRect}|null>(null);
  const [isCropping,setIsCropping] = useState(false);
  const [cropRect,setCropRect] = useState({x:0,y:0,w:100,h:100});
  const [cropHasSelection,setCropHasSelection] = useState(false);
  const [photoOffset,setPhotoOffset] = useState({x:0,y:0});
  const [photoScale,setPhotoScale] = useState(1);
  const [faceStatus,setFaceStatus] = useState<'idle'|'loading'|'aligned'|'no-face'|'multiple'|'error'>('idle');
  const [faceMessage,setFaceMessage] = useState('Choose a photo, then run face alignment. Processing stays in this browser.');
  const [detectedTilt,setDetectedTilt] = useState<number | null>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const faceAppliedCorrectionRef = useRef(0);
  const backupReadyRef=useRef(false);
  const historyReadyRef=useRef(false);
  const historyRef=useRef<{past:any[];future:any[];current:any;skip:boolean}>({past:[],future:[],current:null,skip:false});
  const [historyVersion,setHistoryVersion]=useState(0);
  const [isFullscreen,setIsFullscreen]=useState(false);
  const [exportModalOpen,setExportModalOpen]=useState(false);
  const [exportTarget,setExportTarget]=useState<'photo'|'sheet'>('photo');
  const [exportQuality,setExportQuality]=useState<'standard'|'high'|'very-high'|'ultra'>('high');
  const [export20KbTarget,setExport20KbTarget]=useState(false);
  const [exportBusy,setExportBusy]=useState(false);
  const [backupStatus,setBackupStatus]=useState('Preparing local backup…');
  const backupTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const backupSnapshotRef=useRef<any>(null);
  backupSnapshotRef.current={version:2,selectedFile,signatureFile,processedPhotoUrl,mergedPhotoUrl,signatureProcessedUrl,state:{photoSize,customPhotoWidthMm,customPhotoHeightMm,sheetSize,customSheetWidthMm,customSheetHeightMm,photoCount,horizontalMarginMm,verticalMarginMm,horizontalGapMm,verticalGapMm,photoPositions,photoScales,photoImages,photoDimensions,rotation,zoom,flipped,activeTool,backgroundColor,backgroundStatus,faceStatus,faceMessage,detectedTilt,showGuides,isCropping,signatureVisible,signaturePosition,signatureScale,signatureRotation,sheetZoom,photoOffset,photoScale,cropRect,cropHasSelection,borderEnabled,borderColor,borderWidthMm,inputMode}};
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    return () => { faceLandmarkerRef.current?.close?.(); faceLandmarkerRef.current = null; segmenterRef.current?.close?.(); segmenterRef.current = null; };
  }, []);

  useEffect(() => {
    if (!signatureFile) { setSignatureUrl(''); return; }
    const url = URL.createObjectURL(signatureFile);
    setSignatureUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [signatureFile]);

  useEffect(()=>{let active=true;readStudioBackup().then(backup=>{if(!active)return;if(backup?.version===1||backup?.version===2){if(backup.selectedFile)setSelectedFile(backup.selectedFile);if(backup.signatureFile)setSignatureFile(backup.signatureFile);if(backup.processedPhotoUrl)setProcessedPhotoUrl(backup.processedPhotoUrl);if(backup.mergedPhotoUrl)setMergedPhotoUrl(backup.mergedPhotoUrl);if(backup.signatureProcessedUrl)setSignatureProcessedUrl(backup.signatureProcessedUrl);const v=backup.state||{};if(v.photoSize)setPhotoSize(v.photoSize);if(v.customPhotoWidthMm!==undefined)setCustomPhotoWidthMm(v.customPhotoWidthMm);if(v.customPhotoHeightMm!==undefined)setCustomPhotoHeightMm(v.customPhotoHeightMm);if(v.sheetSize)setSheetSize(v.sheetSize);if(v.customSheetWidthMm!==undefined)setCustomSheetWidthMm(v.customSheetWidthMm);if(v.customSheetHeightMm!==undefined)setCustomSheetHeightMm(v.customSheetHeightMm);if(v.photoCount!==undefined)setPhotoCount(v.photoCount);if(v.horizontalMarginMm!==undefined)setHorizontalMarginMm(v.horizontalMarginMm);if(v.verticalMarginMm!==undefined)setVerticalMarginMm(v.verticalMarginMm);if(v.horizontalGapMm!==undefined)setHorizontalGapMm(v.horizontalGapMm);if(v.verticalGapMm!==undefined)setVerticalGapMm(v.verticalGapMm);if(v.photoPositions)setPhotoPositions(v.photoPositions);if(v.photoScales)setPhotoScales(v.photoScales);if(v.photoImages)setPhotoImages(v.photoImages);if(v.photoDimensions)setPhotoDimensions(v.photoDimensions);if(v.rotation!==undefined)setRotation(v.rotation);if(v.zoom!==undefined)setZoom(v.zoom);if(v.flipped!==undefined)setFlipped(v.flipped);if(v.activeTool)setActiveTool(v.activeTool);if(v.backgroundColor)setBackgroundColor(v.backgroundColor);if(v.backgroundStatus!==undefined)setBackgroundStatus(v.backgroundStatus);if(v.faceStatus)setFaceStatus(v.faceStatus);if(v.faceMessage)setFaceMessage(v.faceMessage);if(v.detectedTilt!==undefined)setDetectedTilt(v.detectedTilt);if(v.showGuides!==undefined)setShowGuides(v.showGuides);if(v.isCropping!==undefined)setIsCropping(v.isCropping);if(v.signatureVisible!==undefined)setSignatureVisible(v.signatureVisible);if(v.signaturePosition)setSignaturePosition(v.signaturePosition);if(v.signatureScale!==undefined)setSignatureScale(v.signatureScale);if(v.signatureRotation!==undefined)setSignatureRotation(v.signatureRotation);if(v.sheetZoom!==undefined)setSheetZoom(v.sheetZoom);if(v.photoOffset)setPhotoOffset(v.photoOffset);if(v.photoScale!==undefined)setPhotoScale(v.photoScale);if(v.cropRect)setCropRect(v.cropRect);if(v.cropHasSelection!==undefined)setCropHasSelection(v.cropHasSelection);if(v.borderEnabled!==undefined)setBorderEnabled(v.borderEnabled);if(v.borderColor)setBorderColor(v.borderColor);if(v.borderWidthMm!==undefined)setBorderWidthMm(v.borderWidthMm);if(v.inputMode)setInputMode(v.inputMode);setBackupStatus('Previous session restored');}else setBackupStatus('Local backup ready');backupReadyRef.current=true;}).catch(error=>{console.warn('Studio backup restore failed:',error);if(active){backupReadyRef.current=true;setBackupStatus('Local backup unavailable');}});return()=>{active=false;};},[]);

  useEffect(()=>{if(!backupReadyRef.current)return;if(backupTimerRef.current)clearTimeout(backupTimerRef.current);backupTimerRef.current=setTimeout(()=>{const backup=backupSnapshotRef.current;if(!backup)return;writeStudioBackup(backup).then(()=>setBackupStatus('Changes backed up on this device')).catch(error=>{console.warn('Studio backup save failed:',error);setBackupStatus('Backup storage unavailable or full');});},250);return()=>{if(backupTimerRef.current)clearTimeout(backupTimerRef.current);};},[selectedFile,signatureFile,processedPhotoUrl,mergedPhotoUrl,signatureProcessedUrl,photoSize,customPhotoWidthMm,customPhotoHeightMm,sheetSize,customSheetWidthMm,customSheetHeightMm,photoCount,horizontalMarginMm,verticalMarginMm,horizontalGapMm,verticalGapMm,photoPositions,photoScales,photoImages,photoDimensions,rotation,zoom,flipped,activeTool,backgroundColor,backgroundStatus,faceStatus,faceMessage,detectedTilt,showGuides,isCropping,signatureVisible,signaturePosition,signatureScale,signatureRotation,sheetZoom,photoOffset,photoScale,cropRect,cropHasSelection,borderEnabled,borderColor,borderWidthMm,inputMode]);
  useEffect(()=>{const flushBackup=()=>{if(!backupReadyRef.current||!backupSnapshotRef.current)return;if(backupTimerRef.current){clearTimeout(backupTimerRef.current);backupTimerRef.current=null;}void writeStudioBackup(backupSnapshotRef.current).catch(error=>console.warn('Studio backup flush failed:',error));};const handleVisibilityChange=()=>{if(document.visibilityState==='hidden')flushBackup();};window.addEventListener('pagehide',flushBackup);document.addEventListener('visibilitychange',handleVisibilityChange);return()=>{window.removeEventListener('pagehide',flushBackup);document.removeEventListener('visibilitychange',handleVisibilityChange);flushBackup();};},[]);

  const makeHistorySnapshot=()=>({selectedFile,signatureFile,processedPhotoUrl,mergedPhotoUrl,signatureProcessedUrl,activeTool,photoSize,customPhotoWidthMm,customPhotoHeightMm,sheetSize,customSheetWidthMm,customSheetHeightMm,photoCount,horizontalMarginMm,verticalMarginMm,horizontalGapMm,verticalGapMm,photoPositions,photoScales,photoImages,photoDimensions,rotation,zoom,flipped,photoOffset,photoScale,signatureVisible,signaturePosition,signatureScale,signatureRotation});
  const historySnapshotKey=(v:any)=>JSON.stringify({...v,selectedFile:v.selectedFile?{name:v.selectedFile.name,size:v.selectedFile.size,lastModified:v.selectedFile.lastModified}:null,signatureFile:v.signatureFile?{name:v.signatureFile.name,size:v.signatureFile.size,lastModified:v.signatureFile.lastModified}:null,photoImages:Object.fromEntries(Object.entries(v.photoImages||{}).map(([index,url]:[string,any])=>[index,typeof url==='string'?url.length+':'+url.slice(0,40):''])),processedPhotoUrl:undefined,mergedPhotoUrl:undefined,signatureProcessedUrl:undefined});
  useEffect(()=>{if(!backupReadyRef.current)return;const snapshot=makeHistorySnapshot(),previous=historyRef.current.current;if(!historyReadyRef.current){historyRef.current.current=snapshot;historyReadyRef.current=true;return;}if(historyRef.current.skip){historyRef.current.current=snapshot;historyRef.current.skip=false;setHistoryVersion(v=>v+1);return;}if(!previous||historySnapshotKey(snapshot)!==historySnapshotKey(previous)||snapshot.selectedFile!==previous.selectedFile||snapshot.signatureFile!==previous.signatureFile||snapshot.processedPhotoUrl!==previous.processedPhotoUrl||snapshot.mergedPhotoUrl!==previous.mergedPhotoUrl||snapshot.signatureProcessedUrl!==previous.signatureProcessedUrl){historyRef.current.past=[...historyRef.current.past,previous].slice(-12);historyRef.current.future=[];historyRef.current.current=snapshot;setHistoryVersion(v=>v+1);}},[selectedFile,signatureFile,processedPhotoUrl,mergedPhotoUrl,signatureProcessedUrl,activeTool,photoSize,customPhotoWidthMm,customPhotoHeightMm,sheetSize,customSheetWidthMm,customSheetHeightMm,photoCount,horizontalMarginMm,verticalMarginMm,horizontalGapMm,verticalGapMm,photoPositions,photoScales,photoImages,photoDimensions,rotation,zoom,flipped,photoOffset,photoScale,signatureVisible,signaturePosition,signatureScale,signatureRotation,backupStatus]);
  useEffect(()=>{const sync=()=>setIsFullscreen(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',sync);return()=>document.removeEventListener('fullscreenchange',sync);},[]);

  const handleSignatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) { setSignatureFile(file); setSignatureProcessedUrl(''); setMergedPhotoUrl(''); setSignaturePosition({x:66,y:84}); setSignatureScale(1); setSignatureRotation(0); setSignatureVisible(true); }
    event.target.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setSourceDimensions(null);
    setProcessedPhotoUrl('');
    setMergedPhotoUrl('');
    setSignatureVisible(true);
    setBackgroundStatus('');
    setZoom(100);
    setRotation(0);
    setFlipped(false);
    setCropRect({x:0,y:0,w:100,h:100});
    setCropHasSelection(false);
    setPhotoOffset({x:0,y:0});
    setPhotoScale(1);
    setIsCropping(false);
    setFaceStatus('idle');
    setFaceMessage('Photo changed. Run face alignment again.');
    setDetectedTilt(null);
    faceAppliedCorrectionRef.current = 0;
    event.target.value = '';
  };

  const resetPreview = () => {
    setPhotoCount(8);setPhotoPositions({});setPhotoScales({});setPhotoImages({});setPhotoDimensions({});setSelectedSheetPhotos([]);setPhotoClipboard(null);setDeleteMode(false);setResizeMode(false);
    setProcessedPhotoUrl('');
    setMergedPhotoUrl('');
    setBackgroundStatus('');
    setFaceStatus('idle');
    setFaceMessage('Choose a photo, then run face alignment. Processing stays in this browser.');
    setDetectedTilt(null);
    setZoom(100); setRotation(0); setFlipped(false);
    faceAppliedCorrectionRef.current = 0;
    setCropRect({x:0,y:0,w:100,h:100}); setCropHasSelection(false); setPhotoOffset({x:0,y:0}); setPhotoScale(1); setIsCropping(false);
  };
  const startPhotoPan=(event:React.PointerEvent<HTMLImageElement>)=>{
    if(isCropping||activeTool!=='crop')return;
    event.preventDefault();
    photoPanRef.current={startX:event.clientX,startY:event.clientY,offsetX:photoOffset.x,offsetY:photoOffset.y};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const makeAspectCropRect=(anchorX:number,anchorY:number,pointerX:number,pointerY:number,bounds:DOMRect,ratio:number)=>{
    const ratioInPercent=ratio*bounds.height/bounds.width;
    const directionX=pointerX>=anchorX?1:-1,directionY=pointerY>=anchorY?1:-1;
    let width=Math.abs(pointerX-anchorX),height=Math.abs(pointerY-anchorY);
    if(width>height*ratioInPercent)width=height*ratioInPercent;else height=width/ratioInPercent;
    const maxWidth=directionX>0?100-anchorX:anchorX,maxHeight=directionY>0?100-anchorY:anchorY;
    const scale=Math.min(1,maxWidth/Math.max(width,0.001),maxHeight/Math.max(height,0.001));
    width*=scale;height*=scale;
    return {x:directionX>0?anchorX:anchorX-width,y:directionY>0?anchorY:anchorY-height,w:width,h:height};
  };
  const startCropDraw=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(!isCropping||activeTool!=='crop')return;
    const bounds=event.currentTarget.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
    event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);
    const px=Math.max(0,Math.min(100,(event.clientX-bounds.left)/bounds.width*100));
    const py=Math.max(0,Math.min(100,(event.clientY-bounds.top)/bounds.height*100));
    const valid=cropHasSelection&&cropRect.w>2&&cropRect.h>2;
    const inside=valid&&px>=cropRect.x&&px<=cropRect.x+cropRect.w&&py>=cropRect.y&&py<=cropRect.y+cropRect.h;
    let mode:'draw'|'move'|'resize'='draw',cornerX=0,cornerY=0,anchorX=0,anchorY=0;
    const corners=[{id:'tl',x:cropRect.x,y:cropRect.y,cx:1,cy:1},{id:'tr',x:cropRect.x+cropRect.w,y:cropRect.y,cx:-1,cy:1},{id:'bl',x:cropRect.x,y:cropRect.y+cropRect.h,cx:1,cy:-1},{id:'br',x:cropRect.x+cropRect.w,y:cropRect.y+cropRect.h,cx:-1,cy:-1}];
    const handle=(event.target as HTMLElement).closest('[data-crop-handle]')?.getAttribute('data-crop-handle');
    const hit=valid&&handle?corners.find(point=>point.id===handle):undefined;
    if(hit){mode='resize';cornerX=hit.cx;cornerY=hit.cy;anchorX=hit.x+(hit.cx===1?cropRect.w:-cropRect.w);anchorY=hit.y+(hit.cy===1?cropRect.h:-cropRect.h);}
    else if(inside)mode='move';
    cropDrawRef.current={mode,startX:px,startY:py,bounds,initialRect:{...cropRect},anchorX,anchorY,cornerX,cornerY};
    if(mode==='draw')setCropRect({x:px,y:py,w:0,h:0});
  };
  const startPhotoResize=(event:React.PointerEvent<HTMLSpanElement>,cornerX:number,cornerY:number)=>{
    if(isCropping||activeTool!=='crop'||!cropHasSelection)return;
    event.preventDefault();event.stopPropagation();
    const bounds=cropViewportRef.current?.getBoundingClientRect();if(!bounds)return;
    photoResizeRef.current={startX:event.clientX,startY:event.clientY,initialScale:photoScale,cornerX,cornerY,bounds};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleCropPointerMove=(event:React.PointerEvent<HTMLDivElement>)=>{
    const resize=photoResizeRef.current;
    if(resize){
      const dx=(event.clientX-resize.startX)*resize.cornerX;
      const dy=(event.clientY-resize.startY)*resize.cornerY;
      const change=(dx+dy)/(Math.max(resize.bounds.width,resize.bounds.height)*1.15);
      setPhotoScale(Math.max(0.25,Math.min(3,resize.initialScale+change)));
      return;
    }
    const pan=photoPanRef.current;
    if(pan){
      setPhotoOffset({x:pan.offsetX+event.clientX-pan.startX,y:pan.offsetY+event.clientY-pan.startY});
      return;
    }
    const draw=cropDrawRef.current;
    if(!draw)return;
    const px=Math.max(0,Math.min(100,(event.clientX-draw.bounds.left)/draw.bounds.width*100));
    const py=Math.max(0,Math.min(100,(event.clientY-draw.bounds.top)/draw.bounds.height*100));
    if(draw.mode==='draw'){
      setCropRect(cropAspectRatio?makeAspectCropRect(draw.startX,draw.startY,px,py,draw.bounds,cropAspectRatio):{x:Math.min(draw.startX,px),y:Math.min(draw.startY,py),w:Math.abs(px-draw.startX),h:Math.abs(py-draw.startY)});
    }else if(draw.mode==='move'){
      const x=Math.max(0,Math.min(100-draw.initialRect.w,draw.initialRect.x+px-draw.startX));
      const y=Math.max(0,Math.min(100-draw.initialRect.h,draw.initialRect.y+py-draw.startY));
      setCropRect({...draw.initialRect,x,y});
    }else{
      if(cropAspectRatio)setCropRect(makeAspectCropRect(draw.anchorX,draw.anchorY,px,py,draw.bounds,cropAspectRatio));
      else{const x=Math.min(draw.anchorX,px),y=Math.min(draw.anchorY,py);setCropRect({x,y,w:Math.abs(px-draw.anchorX),h:Math.abs(py-draw.anchorY)});}
    }
  };
  const endCropDrag=()=>{
    photoResizeRef.current=null;
    photoPanRef.current=null;
    const draw=cropDrawRef.current;
    if(draw){
      cropDrawRef.current=null;
      if(draw.mode==='draw'){
        if(cropRect.w<1||cropRect.h<1){
          setCropRect({x:0,y:0,w:100,h:100});
          setCropHasSelection(false);
        }else{
          setCropHasSelection(true);
        }
      }
    }
  };

  const applyCropSelection=async()=>{
    if(!cropHasSelection||cropRect.w<1||cropRect.h<1){setIsCropping(false);return;}
    const sourceUrl=mergedPhotoUrl||processedPhotoUrl||previewUrl;if(!sourceUrl){setIsCropping(false);return;}
    try{
      const image=await loadStudioImage(sourceUrl);
      const sx=Math.max(0,Math.round(cropRect.x/100*image.naturalWidth)),sy=Math.max(0,Math.round(cropRect.y/100*image.naturalHeight));
      const sw=Math.max(1,Math.min(image.naturalWidth-sx,Math.round(cropRect.w/100*image.naturalWidth)));
      const sh=Math.max(1,Math.min(image.naturalHeight-sy,Math.round(cropRect.h/100*image.naturalHeight)));
      const canvas=document.createElement('canvas');canvas.width=sw;canvas.height=sh;
      const context=canvas.getContext('2d');if(!context)throw new Error('Could not create crop canvas.');
      context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
      setProcessedPhotoUrl(canvas.toDataURL('image/jpeg',0.94));setMergedPhotoUrl('');
      if(photoSize==='custom')setCustomPhotoHeightMm(Number((customPhotoWidthMm/(sw/sh)).toFixed(2)));
      setZoom(100);setRotation(0);setFlipped(false);setPhotoOffset({x:0,y:0});setPhotoScale(1);
      setCropRect({x:0,y:0,w:100,h:100});setCropHasSelection(false);setIsCropping(false);
      setFaceMessage('Crop applied. The selected framing is now used for preview and print export.');
    }catch(error){console.error('Photo crop failed:',error);setFaceMessage('Could not apply this crop. Please try again.');setIsCropping(false);}
  };

  const applyHistorySnapshot=(v:any)=>{historyRef.current.skip=true;setSelectedFile(v.selectedFile);setSignatureFile(v.signatureFile);setProcessedPhotoUrl(v.processedPhotoUrl);setMergedPhotoUrl(v.mergedPhotoUrl);setSignatureProcessedUrl(v.signatureProcessedUrl);setActiveTool(v.activeTool);setPhotoSize(v.photoSize);setCustomPhotoWidthMm(v.customPhotoWidthMm);setCustomPhotoHeightMm(v.customPhotoHeightMm);setSheetSize(v.sheetSize);setCustomSheetWidthMm(v.customSheetWidthMm);setCustomSheetHeightMm(v.customSheetHeightMm);setPhotoCount(v.photoCount);setHorizontalMarginMm(v.horizontalMarginMm);setVerticalMarginMm(v.verticalMarginMm);setHorizontalGapMm(v.horizontalGapMm);setVerticalGapMm(v.verticalGapMm);setPhotoPositions(v.photoPositions);setPhotoScales(v.photoScales||{});setPhotoImages(v.photoImages||{});setPhotoDimensions(v.photoDimensions||{});setRotation(v.rotation);setZoom(v.zoom);setFlipped(v.flipped);setPhotoOffset(v.photoOffset);setPhotoScale(v.photoScale);setSignatureVisible(v.signatureVisible);setSignaturePosition(v.signaturePosition);setSignatureScale(v.signatureScale);setSignatureRotation(v.signatureRotation);};
  const undoStudio=()=>{const h=historyRef.current;if(!h.past.length)return;h.future=[h.current,...h.future].slice(0,12);h.current=h.past.pop()!;applyHistorySnapshot(h.current);setHistoryVersion(v=>v+1);};
  const redoStudio=()=>{const h=historyRef.current;if(!h.future.length)return;h.past=[...h.past,h.current].slice(-12);h.current=h.future.shift()!;applyHistorySnapshot(h.current);setHistoryVersion(v=>v+1);};
  const toggleStudioFullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('main')?.requestFullscreen?.();}catch(error){console.warn('Fullscreen unavailable:',error);}};
  const smartArrangePhotos=()=>{if(photoCount<1){setFaceMessage('Add at least one photo before using Smart Arrange.');return;}const gap=2,width=sheetWidthMm,height=sheetHeightMm,topMargin=3;if(photoWidthMm>width||photoHeightMm+topMargin>height){setFaceMessage('This photo size is larger than the selected sheet. Choose a larger sheet or smaller photo size.');return;}const columns=Math.max(1,Math.floor((width+gap)/(photoWidthMm+gap)));const rowsFit=Math.max(1,Math.floor((height-topMargin+gap)/(photoHeightMm+gap)));const count=Math.min(photoCount,columns*rowsFit),longestRow=Math.min(columns,count),usedWidth=longestRow*photoWidthMm+(longestRow-1)*gap,leftMargin=Math.max(0,(width-usedWidth)/2),arranged:Record<number,{x:number;y:number}>={};for(let index=0;index<count;index++){const row=Math.floor(index/columns),column=index%columns,rowCount=Math.min(columns,count-row*columns),rowWidth=rowCount*photoWidthMm+(rowCount-1)*gap,rowLeft=Math.max(0,(width-rowWidth)/2);arranged[index]={x:rowLeft+column*(photoWidthMm+gap),y:topMargin+row*(photoHeightMm+gap)};}setHorizontalMarginMm(leftMargin);setVerticalMarginMm(topMargin);setHorizontalGapMm(gap);setVerticalGapMm(gap);setPhotoCount(count);setPhotoScales({});setPhotoPositions(arranged);setFaceMessage('Smart Arrange complete. Photos start at the top margin with balanced left and right spacing; the remaining lower sheet area stays free.');};
  const shrinkAllPhotos=()=>{const scale=0.9,margin=3,gap=2,width=sheetWidthMm,height=sheetHeightMm,sw=photoWidthMm*scale,sh=photoHeightMm*scale;const columns=Math.max(1,Math.floor((width-margin*2+gap)/(sw+gap))),rowsFit=Math.max(1,Math.floor((height-margin*2+gap)/(sh+gap))),count=Math.min(photoCount,columns*rowsFit),positions:Record<number,{x:number;y:number}>={},scales:Record<number,number>={};for(let index=0;index<count;index++){const row=Math.floor(index/columns),col=index%columns;positions[index]={x:margin+col*(sw+gap),y:margin+row*(sh+gap)};scales[index]=scale;}setHorizontalMarginMm(margin);setVerticalMarginMm(margin);setHorizontalGapMm(gap);setVerticalGapMm(gap);setPhotoCount(count);setPhotoScales(scales);setPhotoPositions(positions);setFaceMessage('All photos reduced to 90% and arranged from the top of the sheet.');};

  const getSheetPhotoScale = (index:number) => photoScales[index] ?? 1;
  const getSheetPhotoDimensions = (index:number) => photoDimensions[index] ?? ({width:photoWidthMm,height:photoHeightMm});
  const getSheetPhotoPosition = (index:number) => photoPositions[index] ?? ({
    x: horizontalMarginMm + (index % sheetColumns) * (photoWidthMm + horizontalGapMm),
    y: verticalMarginMm + Math.floor(index / sheetColumns) * (photoHeightMm + verticalGapMm),
  });
  const startSheetPhotoDrag=(event:React.PointerEvent<HTMLDivElement>,index:number)=>{
    if((event.target as HTMLElement).closest('[data-photo-action]'))return;
    event.preventDefault();event.stopPropagation();
    let dragIndex=index;
    if(event.shiftKey||event.altKey){
      if(photoCount>=sheetCapacity){setFaceMessage('This sheet is full. Delete a photo or choose a larger sheet before duplicating.');return;}
      dragIndex=photoCount;const originalPosition=getSheetPhotoPosition(index);
      setPhotoCount(current=>Math.min(sheetCapacity,current+1));setPhotoPositions(current=>({...current,[dragIndex]:{...originalPosition}}));
      setPhotoScales(current=>({...current,[dragIndex]:getSheetPhotoScale(index)}));
      setPhotoImages(current=>photoImages[index]?({...current,[dragIndex]:photoImages[index]}):current);
      setPhotoDimensions(current=>photoDimensions[index]?({...current,[dragIndex]:{...photoDimensions[index]}}):current);
      setSelectedSheetPhotos([dragIndex]);
    }else if(!selectedSheetPhotos.includes(index)){setSelectedSheetPhotos([index]);}
    const position=getSheetPhotoPosition(index);
    sheetPhotoDragRef.current={index:dragIndex,startX:event.clientX,startY:event.clientY,initialX:position.x,initialY:position.y,scale:sheetPreviewScale*sheetZoom/100};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveSheetPhotoDrag=(event:React.PointerEvent<HTMLDivElement>)=>{
    const resize=sheetPhotoResizeRef.current;if(resize){const dx=(event.clientX-resize.startX)*resize.cornerX,dy=(event.clientY-resize.startY)*resize.cornerY,delta=(dx+dy)/(Math.max(1,resize.previewScale)*150);setPhotoScales(current=>({...current,[resize.index]:Math.max(0.3,Math.min(1.5,resize.initialScale+delta))}));return;}
    const drag=sheetPhotoDragRef.current;if(!drag)return;
    const dimensions=getSheetPhotoDimensions(drag.index),scale=getSheetPhotoScale(drag.index);
    setPhotoPositions(current=>({...current,[drag.index]:{
      x:Math.max(0,Math.min(sheetWidthMm-3-dimensions.width*scale,drag.initialX+(event.clientX-drag.startX)/drag.scale)),
      y:Math.max(0,Math.min(sheetHeightMm-3-dimensions.height*scale,drag.initialY+(event.clientY-drag.startY)/drag.scale)),
    }}));
  };
  const compactSheetPhotos=(removedIndices:number[],replacement?:{index:number;image:string;position:{x:number;y:number};dimensions:{width:number;height:number}})=>{
    const removed=new Set(removedIndices),nextPositions:Record<number,{x:number;y:number}>={},nextScales:Record<number,number>={},nextImages:Record<number,string>={},nextDimensions:Record<number,{width:number;height:number}>={},nextSelection:number[]=[];let nextIndex=0;
    for(let oldIndex=0;oldIndex<visiblePhotoCount;oldIndex++){
      if(removed.has(oldIndex)&&replacement?.index!==oldIndex)continue;
      if(replacement&&oldIndex===replacement.index){nextPositions[nextIndex]=replacement.position;nextScales[nextIndex]=1;nextImages[nextIndex]=replacement.image;nextDimensions[nextIndex]=replacement.dimensions;nextSelection.push(nextIndex);nextIndex++;continue;}
      nextPositions[nextIndex]=getSheetPhotoPosition(oldIndex);if(photoScales[oldIndex]!==undefined)nextScales[nextIndex]=photoScales[oldIndex];if(photoImages[oldIndex])nextImages[nextIndex]=photoImages[oldIndex];if(photoDimensions[oldIndex])nextDimensions[nextIndex]=photoDimensions[oldIndex];if(selectedSheetPhotos.includes(oldIndex)&&!removed.has(oldIndex))nextSelection.push(nextIndex);nextIndex++;
    }
    setPhotoCount(nextIndex);setPhotoPositions(nextPositions);setPhotoScales(nextScales);setPhotoImages(nextImages);setPhotoDimensions(nextDimensions);setSelectedSheetPhotos(nextSelection);
  };
  const deleteSheetPhoto=(index:number)=>{compactSheetPhotos([index]);setFaceMessage('Selected photo removed from this print sheet.');};
  const deleteAllSheetPhotos=()=>{if(!window.confirm('Delete every photo from the current print sheet? This will not delete the uploaded original photo.'))return;setPhotoCount(0);setPhotoPositions({});setPhotoScales({});setPhotoImages({});setPhotoDimensions({});setSelectedSheetPhotos([]);setPhotoClipboard(null);setFaceMessage('All photos were removed from the current sheet. Your uploaded original photo is safe.');};
  const selectAllSheetPhotos=()=>setSelectedSheetPhotos(Array.from({length:visiblePhotoCount},(_,index)=>index));
  const toggleSheetPhotoSelection=(index:number)=>setSelectedSheetPhotos(current=>current.includes(index)?current.filter(item=>item!==index):[...current,index]);
  const copySelectedSheetPhoto=()=>{const index=selectedSheetPhotos[0];if(index===undefined)return;setPhotoClipboard({position:getSheetPhotoPosition(index),scale:getSheetPhotoScale(index),image:photoImages[index],dimensions:photoDimensions[index]});setFaceMessage('Photo copied. Press Ctrl + V to paste a duplicate.');};
  const pasteSheetPhoto=()=>{if(!photoClipboard)return;if(photoCount>=sheetCapacity){setFaceMessage('This sheet is full. Choose a larger sheet or delete a photo before pasting.');return;}const index=photoCount,dimensions=photoClipboard.dimensions||{width:photoWidthMm,height:photoHeightMm},scale=photoClipboard.scale,position={x:Math.max(0,Math.min(sheetWidthMm-3-dimensions.width*scale,photoClipboard.position.x+3)),y:Math.max(0,Math.min(sheetHeightMm-3-dimensions.height*scale,photoClipboard.position.y+3))};setPhotoCount(current=>Math.min(sheetCapacity,current+1));setPhotoPositions(current=>({...current,[index]:position}));setPhotoScales(current=>({...current,[index]:photoClipboard.scale}));setPhotoImages(current=>photoClipboard.image?({...current,[index]:photoClipboard.image!}):current);setPhotoDimensions(current=>photoClipboard.dimensions?({...current,[index]:photoClipboard.dimensions!}):current);setSelectedSheetPhotos([index]);setFaceMessage('Copied photo pasted onto the current sheet.');};
  const mergeSelectedSheetPhotos=async(requestedIndices?:number[])=>{
    const indices=(requestedIndices||selectedSheetPhotos).filter(index=>index>=0&&index<visiblePhotoCount).sort((a,b)=>a-b);if(indices.length<2){setFaceMessage('Select at least two photos, then choose Merge.');return;}if(isMerging)return;setIsMerging(true);
    try{
      const dpi=300/25.4,items=await Promise.all(indices.map(async index=>{const source=photoImages[index]||mergedPhotoUrl||processedPhotoUrl||previewUrl;if(!source)throw new Error('A selected photo is missing.');const image=await loadStudioImage(source),position=getSheetPhotoPosition(index),dimensions=getSheetPhotoDimensions(index),scale=getSheetPhotoScale(index);return {index,image,position,width:dimensions.width*scale,height:dimensions.height*scale};}));
      const minX=Math.min(...items.map(item=>item.position.x)),minY=Math.min(...items.map(item=>item.position.y)),maxX=Math.max(...items.map(item=>item.position.x+item.width)),maxY=Math.max(...items.map(item=>item.position.y+item.height));
      const mergedWidth=Math.max(1,Math.round((maxX-minX)*dpi)),mergedHeight=Math.max(1,Math.round((maxY-minY)*dpi)),canvas=document.createElement('canvas');canvas.width=mergedWidth;canvas.height=mergedHeight;
      const context=canvas.getContext('2d');if(!context)throw new Error('Could not create the merge canvas.');context.clearRect(0,0,mergedWidth,mergedHeight);context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
      const signature=signatureUrl&&signatureVisible&&!mergedPhotoUrl?await loadStudioImage(signatureProcessedUrl||signatureUrl):null;
      for(const item of items){
        const x=Math.round((item.position.x-minX)*dpi),y=Math.round((item.position.y-minY)*dpi),w=Math.max(1,Math.round(item.width*dpi)),h=Math.max(1,Math.round(item.height*dpi)),sourceRatio=item.image.naturalWidth/item.image.naturalHeight,targetRatio=w/h;let sx=0,sy=0,sw=item.image.naturalWidth,sh=item.image.naturalHeight;
        if(sourceRatio>targetRatio){sw=item.image.naturalHeight*targetRatio;sx=(item.image.naturalWidth-sw)/2;}else{sh=item.image.naturalWidth/targetRatio;sy=(item.image.naturalHeight-sh)/2;}
        context.drawImage(item.image,sx,sy,sw,sh,x,y,w,h);
        if(borderEnabled){context.save();context.strokeStyle=borderColor;context.lineWidth=Math.max(1,borderWidthMm*dpi);context.strokeRect(x,y,w,h);context.restore();}
        if(signature&&!photoImages[item.index]){const maxW=w*0.36*signatureScale,maxH=h*0.14*signatureScale,fit=Math.min(maxW/signature.naturalWidth,maxH/signature.naturalHeight),sigW=signature.naturalWidth*fit,sigH=signature.naturalHeight*fit;context.save();context.translate(x+w*signaturePosition.x/100,y+h*signaturePosition.y/100);context.rotate(signatureRotation*Math.PI/180);context.drawImage(signature,-sigW/2,-sigH/2,sigW,sigH);context.restore();}
      }
      const merged=canvas.toDataURL('image/png'),first=indices[0];compactSheetPhotos(indices.slice(1),{index:first,image:merged,position:{x:minX,y:minY},dimensions:{width:maxX-minX,height:maxY-minY}});setFaceMessage(`Merged ${indices.length} selected photos into one movable composite. Their relative positions and spacing are preserved.`);
    }catch(error){console.error('Selected photo merge failed:',error);setFaceMessage('Could not merge the selected photos. Please try again.');}finally{setIsMerging(false);}
  };
  useEffect(()=>{
    const handleStudioShortcut=(event:KeyboardEvent)=>{
      if(activeTool!=='print'||!selectedFile||(event.target as HTMLElement)?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
      if(!(event.ctrlKey||event.metaKey))return;const key=event.key.toLowerCase();if(!['c','v','t'].includes(key))return;event.preventDefault();event.stopPropagation();
      if(key==='c')copySelectedSheetPhoto();if(key==='v')pasteSheetPhoto();
      if(key==='t'){if(selectedSheetPhotos.length){setResizeMode(value=>!value);setFaceMessage(resizeMode?'Photo resize shortcut mode OFF.':'Photo resize shortcut mode ON. Drag a corner handle to resize the selected photo.');}else setFaceMessage('Select a photo first, then press Ctrl + T to activate resize mode.');}
    };
    window.addEventListener('keydown',handleStudioShortcut);return()=>window.removeEventListener('keydown',handleStudioShortcut);
  },[activeTool,selectedFile,selectedSheetPhotos,photoClipboard,photoCount,sheetCapacity,resizeMode,photoPositions,photoScales,photoImages,photoDimensions,photoWidthMm,photoHeightMm,sheetWidthMm,sheetHeightMm]);
  const startSheetPhotoResize=(event:React.PointerEvent<HTMLSpanElement>,index:number,cornerX:number,cornerY:number)=>{event.preventDefault();event.stopPropagation();sheetPhotoResizeRef.current={index,startX:event.clientX,startY:event.clientY,initialScale:getSheetPhotoScale(index),previewScale:sheetPreviewScale*sheetZoom/100,cornerX,cornerY};event.currentTarget.parentElement?.setPointerCapture(event.pointerId);};
  const endSheetPhotoDrag=()=>{sheetPhotoDragRef.current=null;sheetPhotoResizeRef.current=null;};

  const loadStudioImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load this image.'));
    image.src = src;
  });

  const removePhotoBackground = async () => {
    const sourceUrl = processedPhotoUrl || previewUrl;
    if (!sourceUrl || backgroundStatus === 'Removing background…' || backgroundStatus === 'Loading free background model…') return;
    setBackgroundStatus('Loading free background model…');
    try {
      if (!segmenterRef.current) {
        const moduleUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/+esm';
        const visionTasks = await import(/* @vite-ignore */ moduleUrl);
        const vision = await visionTasks.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');
        const segmenterOptions = {
          runningMode: 'IMAGE' as const,
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        };
        try {
          segmenterRef.current = await visionTasks.ImageSegmenter.createFromOptions(vision, {
            ...segmenterOptions,
            baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite', delegate: 'GPU' },
          });
        } catch {
          segmenterRef.current = await visionTasks.ImageSegmenter.createFromOptions(vision, {
            ...segmenterOptions,
            baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite', delegate: 'CPU' },
          });
        }
      }
      setBackgroundStatus('Removing background…');
      const image = await loadStudioImage(sourceUrl);
      const result = segmenterRef.current.segment(image);
      const mask = result?.confidenceMasks?.[0];
      if (!mask) throw new Error('No person mask was returned.');
      const maskData = mask.getAsFloat32Array();
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = mask.width; maskCanvas.height = mask.height;
      const maskContext = maskCanvas.getContext('2d');
      if (!maskContext) throw new Error('Could not prepare the mask.');
      const maskPixels = maskContext.createImageData(mask.width, mask.height);
      for (let i=0;i<maskData.length;i+=1) {
        const alpha=Math.max(0,Math.min(255,Math.round((maskData[i]-0.18)/0.64*255)));
        const p=i*4; maskPixels.data[p]=255;maskPixels.data[p+1]=255;maskPixels.data[p+2]=255;maskPixels.data[p+3]=alpha;
      }
      maskContext.putImageData(maskPixels,0,0);
      const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const context=canvas.getContext('2d');if(!context)throw new Error('Could not create photo canvas.');
      context.fillStyle=backgroundColor;context.fillRect(0,0,canvas.width,canvas.height);
      context.drawImage(image,0,0,canvas.width,canvas.height);
      context.globalCompositeOperation='destination-in';context.filter='blur(1.2px)';context.drawImage(maskCanvas,0,0,canvas.width,canvas.height);
      context.filter='none';context.globalCompositeOperation='destination-over';context.fillStyle=backgroundColor;context.fillRect(0,0,canvas.width,canvas.height);
      setProcessedPhotoUrl(canvas.toDataURL('image/png'));setMergedPhotoUrl('');setSignatureVisible(true);
      setBackgroundStatus('Background removed successfully.');
    } catch(error) {
      console.error('Photo background removal failed:',error);
      setBackgroundStatus('Could not remove background. Check your internet connection and try again.');
    }
  };

  const applySignatureBackgroundRemoval = async () => {
    if(!signatureUrl)return;
    try {
      const image=await loadStudioImage(signatureUrl);const canvas=document.createElement('canvas');
      canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const context=canvas.getContext('2d');if(!context)throw new Error('No signature canvas.');
      context.drawImage(image,0,0);const frame=context.getImageData(0,0,canvas.width,canvas.height);
      for(let i=0;i<frame.data.length;i+=4){
        const r=frame.data[i],g=frame.data[i+1],b=frame.data[i+2],brightness=(r+g+b)/3,spread=Math.max(r,g,b)-Math.min(r,g,b);
        if(brightness>218&&spread<48)frame.data[i+3]=0;
        else if(brightness>185&&spread<55)frame.data[i+3]=Math.round(frame.data[i+3]*(255-brightness)/70);
      }
      context.putImageData(frame,0,0);
      let minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1;
      for(let y=0;y<canvas.height;y+=1)for(let x=0;x<canvas.width;x+=1){
        if(frame.data[(y*canvas.width+x)*4+3]>24){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
      }
      if(maxX>=minX&&maxY>=minY){
        const pad=8,left=Math.max(0,minX-pad),top=Math.max(0,minY-pad),right=Math.min(canvas.width,maxX+pad+1),bottom=Math.min(canvas.height,maxY+pad+1);
        const trimmed=document.createElement('canvas');trimmed.width=right-left;trimmed.height=bottom-top;
        const trimmedContext=trimmed.getContext('2d');if(!trimmedContext)throw new Error('Could not trim signature edges.');
        trimmedContext.drawImage(canvas,left,top,trimmed.width,trimmed.height,0,0,trimmed.width,trimmed.height);
        setSignatureProcessedUrl(trimmed.toDataURL('image/png'));
      }else{setSignatureProcessedUrl(canvas.toDataURL('image/png'));}
      setMergedPhotoUrl('');setSignatureVisible(true);
    } catch(error){console.error('Signature background removal failed:',error);}
  };

  const mergeSignatureIntoPhoto = async () => {
    const sourceUrl=processedPhotoUrl||previewUrl,signatureSource=signatureProcessedUrl||signatureUrl;
    if(!sourceUrl||!signatureSource||isMerging)return;setIsMerging(true);
    try {
      const photo=await loadStudioImage(sourceUrl),signature=await loadStudioImage(signatureSource);
      const canvas=document.createElement('canvas');canvas.width=photo.naturalWidth;canvas.height=photo.naturalHeight;
      const context=canvas.getContext('2d');if(!context)throw new Error('No merge canvas.');
      context.drawImage(photo,0,0);
      const maxWidth=canvas.width*0.36*signatureScale,maxHeight=canvas.height*0.14*signatureScale;
      const fit=Math.min(maxWidth/signature.naturalWidth,maxHeight/signature.naturalHeight),w=signature.naturalWidth*fit,h=signature.naturalHeight*fit;
      context.save();context.translate(canvas.width*signaturePosition.x/100,canvas.height*signaturePosition.y/100);
      context.rotate(signatureRotation*Math.PI/180);context.drawImage(signature,-w/2,-h/2,w,h);context.restore();
      const merged=canvas.toDataURL('image/png');setMergedPhotoUrl(merged);setSignatureVisible(false);
      setBackgroundStatus('Signature merged into the photo.');
    }catch(error){console.error('Signature merge failed:',error);setBackgroundStatus('Could not merge the signature. Please try again.');}
    finally{setIsMerging(false);}
  };

  const handleSignaturePointerDown=(event:React.PointerEvent<HTMLImageElement>)=>{
    event.preventDefault();event.stopPropagation();
    signatureDragRef.current={x:event.clientX,y:event.clientY,left:signaturePosition.x,top:signaturePosition.y};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleSignaturePointerMove=(event:React.PointerEvent<HTMLImageElement>)=>{
    const drag=signatureDragRef.current;if(!drag||!cropViewportRef.current)return;
    const bounds=cropViewportRef.current.getBoundingClientRect();
    setSignaturePosition({x:Math.max(8,Math.min(92,drag.left+(event.clientX-drag.x)/bounds.width*100)),y:Math.max(8,Math.min(92,drag.top+(event.clientY-drag.y)/bounds.height*100))});setMergedPhotoUrl('');setSignatureVisible(true);
  };
  const handleSignaturePointerUp=()=>{signatureDragRef.current=null;};

  const createPassportPhoto = (image: HTMLImageElement, landmarks: Array<{x:number;y:number;z?:number}>, correctionDegrees: number) => {
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    const radians = correctionDegrees * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const rotatedWidth = Math.ceil(Math.abs(sourceWidth * cos) + Math.abs(sourceHeight * sin));
    const rotatedHeight = Math.ceil(Math.abs(sourceWidth * sin) + Math.abs(sourceHeight * cos));
    const rotatedCanvas = document.createElement('canvas');
    rotatedCanvas.width = rotatedWidth;
    rotatedCanvas.height = rotatedHeight;
    const rotatedContext = rotatedCanvas.getContext('2d');
    if (!rotatedContext) throw new Error('Canvas is unavailable in this browser.');
    rotatedContext.fillStyle = '#ffffff';
    rotatedContext.fillRect(0, 0, rotatedWidth, rotatedHeight);
    rotatedContext.translate(rotatedWidth / 2, rotatedHeight / 2);
    rotatedContext.rotate(radians);
    rotatedContext.drawImage(image, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);

    const points = landmarks.map(point => {
      const dx = point.x * sourceWidth - sourceWidth / 2;
      const dy = point.y * sourceHeight - sourceHeight / 2;
      return {
        x: cos * dx - sin * dy + rotatedWidth / 2,
        y: sin * dx + cos * dy + rotatedHeight / 2,
      };
    });
    const minX = Math.min(...points.map(point => point.x));
    const maxX = Math.max(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxY = Math.max(...points.map(point => point.y));
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;
    if (!Number.isFinite(faceHeight) || faceHeight < 24 || faceWidth < 18) {
      throw new Error('The detected face is too small for reliable passport framing.');
    }

    const aspectRatio = photoWidthMm / photoHeightMm;
    const cropHeight = faceHeight / 0.66;
    const cropWidth = cropHeight * aspectRatio;
    const centerX = (minX + maxX) / 2;
    const requestedX = centerX - cropWidth / 2;
    const requestedY = minY - faceHeight * 0.28;
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = Math.max(1, Math.round(cropWidth));
    cropCanvas.height = Math.max(1, Math.round(cropHeight));
    const cropContext = cropCanvas.getContext('2d');
    if (!cropContext) throw new Error('Could not create the passport crop.');
    cropContext.fillStyle = '#ffffff';
    cropContext.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
    cropContext.drawImage(rotatedCanvas, -requestedX, -requestedY);

    const outputWidth = Math.max(1,Math.round(photoWidthMm*300/25.4));
    const outputHeight = Math.max(1,Math.round(photoHeightMm*300/25.4));
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;
    const outputContext = outputCanvas.getContext('2d');
    if (!outputContext) throw new Error('Could not create the passport photo preview.');
    outputContext.fillStyle = '#ffffff';
    outputContext.fillRect(0, 0, outputWidth, outputHeight);
    outputContext.imageSmoothingEnabled = true;
    outputContext.imageSmoothingQuality = 'high';
    outputContext.drawImage(cropCanvas, 0, 0, cropCanvas.width, cropCanvas.height, 0, 0, outputWidth, outputHeight);
    return outputCanvas.toDataURL('image/jpeg', 0.94);
  };

  const runFreeFaceAlignment = async () => {
    if (!previewUrl || faceStatus === 'loading') return;
    setFaceStatus('loading');
    setFaceMessage('Loading the free face model on this device. The first load may take a little longer.');
    try {
      if (!faceLandmarkerRef.current) {
        const mediaPipeModuleUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/+esm';
        const visionTasks = await import(/* @vite-ignore */ mediaPipeModuleUrl);
        const vision = await visionTasks.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
        );
        const options = {
          runningMode: 'IMAGE' as const,
          numFaces: 2,
          minFaceDetectionConfidence: 0.55,
          minFacePresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
          outputFaceBlendshapes: false,
        };
        try {
          faceLandmarkerRef.current = await visionTasks.FaceLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'GPU',
            },
          });
        } catch {
          faceLandmarkerRef.current = await visionTasks.FaceLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'CPU',
            },
          });
        }
      }
      const image = new Image();
      image.decoding = 'async';
      image.src = previewUrl;
      await image.decode();
      const result = faceLandmarkerRef.current.detect(image);
      const faces = result?.faceLandmarks ?? [];
      if (faces.length === 0) {
        setFaceStatus('no-face');
        setFaceMessage('No clear face was detected. Try a front-facing, well-lit photo with the full face visible. Your original photo is unchanged.');
        setDetectedTilt(null);
        return;
      }
      if (faces.length > 1) {
        setFaceStatus('multiple');
        setFaceMessage('More than one face was detected. Please use a photo with only one person for passport framing.');
        setDetectedTilt(null);
        return;
      }
      const landmarks = faces[0];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      if (!leftEye || !rightEye || !Number.isFinite(leftEye.x) || !Number.isFinite(rightEye.x)) {
        throw new Error('Face landmarks were incomplete.');
      }
      const eyeLineTilt = Math.atan2(
        (rightEye.y - leftEye.y) * image.naturalHeight,
        (rightEye.x - leftEye.x) * image.naturalWidth
      ) * (180 / Math.PI);
      if (!Number.isFinite(eyeLineTilt)) throw new Error('Could not measure eye-line angle.');
      setDetectedTilt(eyeLineTilt);
      const correction = Math.max(-15, Math.min(15, -eyeLineTilt));
      const passportPhoto = createPassportPhoto(image, landmarks, correction);
      setProcessedPhotoUrl(passportPhoto);
      faceAppliedCorrectionRef.current = 0;
      setRotation(0);
      setZoom(100);
      setPhotoOffset({x:0,y:0});
      setPhotoScale(1);
      setCropRect({x:0,y:0,w:100,h:100});
      setCropHasSelection(false);
      setFaceStatus('aligned');
      setFaceMessage('Passport photo created. Review the framing, then open Print to arrange copies on A4 or 4 × 6. The file is sized for a 300-DPI print workflow; your original upload remains unchanged.');
      setActiveTool('face');
      setIsCropping(false);
    } catch (error) {
      console.error('Free face alignment failed:', error);
      setFaceStatus('error');
      setFaceMessage('Face alignment could not start. Check your internet connection for the first model download, then try again. The original photo remains unchanged.');
    }
  };

  const EXPORT_DPI:Record<'standard'|'high'|'very-high'|'ultra',number>={standard:200,high:300,'very-high':360,ultra:450};
  const EXPORT_JPEG_QUALITY:Record<'standard'|'high'|'very-high'|'ultra',number>={standard:0.84,high:0.93,'very-high':0.97,ultra:0.99};
  const openExportOptions=(target:'photo'|'sheet')=>{setExportTarget(target);setExportModalOpen(true);setExport20KbTarget(false);};
  const canvasToBlob=(canvas:HTMLCanvasElement,type:string,quality?:number)=>new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The browser could not create this export file.')),type,quality));
  const loadExportImage=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Could not load a photo for export.'));image.src=src;});
  const createExportCanvas=async(target:'photo'|'sheet',dpi:number)=>{
    const widthMm=target==='photo'?photoWidthMm:sheetWidthMm,heightMm=target==='photo'?photoHeightMm:sheetHeightMm;
    const pixelWidth=Math.max(1,Math.round(widthMm*dpi/25.4)),pixelHeight=Math.max(1,Math.round(heightMm*dpi/25.4));
    if(pixelWidth*pixelHeight>26000000)throw new Error('This paper size at the selected Ultra resolution is too large for this browser. Choose Very High or High quality.');
    const canvas=document.createElement('canvas');canvas.width=pixelWidth;canvas.height=pixelHeight;
    const context=canvas.getContext('2d');if(!context)throw new Error('Could not prepare the export canvas.');
    context.fillStyle='#ffffff';context.fillRect(0,0,pixelWidth,pixelHeight);context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
    if(target==='photo'){
      const source=mergedPhotoUrl||processedPhotoUrl||previewUrl;if(!source)throw new Error('Upload a photo before exporting.');
      const photo=await loadExportImage(source),ratio=photo.naturalWidth/photo.naturalHeight,targetRatio=pixelWidth/pixelHeight;
      let sx=0,sy=0,sw=photo.naturalWidth,sh=photo.naturalHeight;
      if(ratio>targetRatio){sw=photo.naturalHeight*targetRatio;sx=(photo.naturalWidth-sw)/2;}else{sh=photo.naturalWidth/targetRatio;sy=(photo.naturalHeight-sh)/2;}
      context.save();context.translate(pixelWidth/2,pixelHeight/2);context.rotate(rotation*Math.PI/180);context.scale(flipped?-1:1,1);
      context.drawImage(photo,sx,sy,sw,sh,-pixelWidth/2,-pixelHeight/2,pixelWidth,pixelHeight);context.restore();
      const signature=signatureUrl&&signatureVisible&&!mergedPhotoUrl?await loadExportImage(signatureProcessedUrl||signatureUrl):null;
      if(signature){const maxW=pixelWidth*0.36*signatureScale,maxH=pixelHeight*0.14*signatureScale,fit=Math.min(maxW/signature.naturalWidth,maxH/signature.naturalHeight),sigW=signature.naturalWidth*fit,sigH=signature.naturalHeight*fit;context.save();context.translate(pixelWidth*signaturePosition.x/100,pixelHeight*signaturePosition.y/100);context.rotate(signatureRotation*Math.PI/180);context.drawImage(signature,-sigW/2,-sigH/2,sigW,sigH);context.restore();}
    }else{
      const signature=signatureUrl&&signatureVisible&&!mergedPhotoUrl?await loadExportImage(signatureProcessedUrl||signatureUrl):null;
      for(let index=0;index<visiblePhotoCount;index++){
        const source=photoImages[index]||mergedPhotoUrl||processedPhotoUrl||previewUrl;if(!source)continue;
        const photo=await loadExportImage(source),dimensions=getSheetPhotoDimensions(index),itemScale=getSheetPhotoScale(index),drawWidth=Math.max(1,Math.round(dimensions.width*dpi/25.4)),drawHeight=Math.max(1,Math.round(dimensions.height*dpi/25.4)),sourceRatio=photo.naturalWidth/photo.naturalHeight,targetRatio=drawWidth/drawHeight;
        let sx=0,sy=0,sw=photo.naturalWidth,sh=photo.naturalHeight;if(sourceRatio>targetRatio){sw=photo.naturalHeight*targetRatio;sx=(photo.naturalWidth-sw)/2;}else{sh=photo.naturalWidth/targetRatio;sy=(photo.naturalHeight-sh)/2;}
        const sized=document.createElement('canvas');sized.width=drawWidth;sized.height=drawHeight;const sizedContext=sized.getContext('2d');if(!sizedContext)throw new Error('Could not size a selected photo.');sizedContext.imageSmoothingEnabled=true;sizedContext.imageSmoothingQuality='high';sizedContext.drawImage(photo,sx,sy,sw,sh,0,0,drawWidth,drawHeight);
        const position=getSheetPhotoPosition(index),x=Math.round(position.x*dpi/25.4),y=Math.round(position.y*dpi/25.4),scaledWidth=Math.round(drawWidth*itemScale),scaledHeight=Math.round(drawHeight*itemScale);
        context.drawImage(sized,x,y,scaledWidth,scaledHeight);
        if(borderEnabled){context.save();context.strokeStyle=borderColor;context.lineWidth=Math.max(1,borderWidthMm*dpi/25.4);context.strokeRect(x,y,scaledWidth,scaledHeight);context.restore();}
        if(signature&&!photoImages[index]){const maxW=scaledWidth*0.36*signatureScale,maxH=scaledHeight*0.14*signatureScale,fit=Math.min(maxW/signature.naturalWidth,maxH/signature.naturalHeight),sigW=signature.naturalWidth*fit,sigH=signature.naturalHeight*fit;context.save();context.translate(x+scaledWidth*signaturePosition.x/100,y+scaledHeight*signaturePosition.y/100);context.rotate(signatureRotation*Math.PI/180);context.drawImage(signature,-sigW/2,-sigH/2,sigW,sigH);context.restore();}
      }
    }
    return {canvas,widthMm,heightMm,dpi};
  };
  const createJpegBlob=async(canvas:HTMLCanvasElement,quality:number,target20Kb:boolean)=>{
    if(!target20Kb)return canvasToBlob(canvas,'image/jpeg',quality);
    const targetBytes=20*1024;let low=0.25,high=quality,best:Blob|null=null;
    const lowest=await canvasToBlob(canvas,'image/jpeg',low);
    if(lowest.size>targetBytes)return lowest;
    best=lowest;
    for(let attempt=0;attempt<9;attempt++){const mid=(low+high)/2,candidate=await canvasToBlob(canvas,'image/jpeg',mid);if(candidate.size<=targetBytes){best=candidate;low=mid;}else high=mid;}
    return best;
  };
  const saveBlob=(blob:Blob,fileName:string)=>{const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=fileName;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),30000);};
  const runExport=async(format:'pdf'|'jpg'|'png'|'print')=>{
    if(!selectedFile||exportBusy)return;
    const printWindow=format==='print'?window.open('','_blank'):null;
    setExportBusy(true);
    try{
      const dpi=EXPORT_DPI[exportQuality],result=await createExportCanvas(exportTarget,dpi),canvas=result.canvas,widthMm=result.widthMm,heightMm=result.heightMm;
      const baseName=exportTarget==='photo'?'tanshu-passport-photo':'tanshu-'+sheetSize+'-passport-photo-sheet';
      if(format==='png'){
        const blob=await canvasToBlob(canvas,'image/png');saveBlob(blob,baseName+'.png');
      }else if(format==='jpg'){
        const blob=await createJpegBlob(canvas,EXPORT_JPEG_QUALITY[exportQuality],exportTarget==='photo'&&export20KbTarget);
        saveBlob(blob,baseName+'.jpg');
        if(exportTarget==='photo'&&export20KbTarget&&blob.size>20*1024)setFaceMessage('20 KB target could not be reached without more aggressive quality loss. The clearest safe result was downloaded instead.');
        else if(exportTarget==='photo'&&export20KbTarget)setFaceMessage('JPG exported near the 20 KB target using the best quality that fits.');
      }else if(format==='pdf'){
        const jpeg=await canvasToBlob(canvas,'image/jpeg',EXPORT_JPEG_QUALITY[exportQuality]),dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not prepare the PDF image.'));reader.readAsDataURL(jpeg);});
        const pdf=new jsPDF({orientation:widthMm>=heightMm?'landscape':'portrait',unit:'mm',format:[widthMm,heightMm],compress:true});
        pdf.addImage(dataUrl,'JPEG',0,0,widthMm,heightMm,undefined,'MEDIUM');pdf.setProperties({title:baseName,subject:'Print-ready photo sheet at '+dpi+' DPI',creator:'TANSHU ONLINE Photo Studio'});
        saveBlob(pdf.output('blob'),baseName+'.pdf');
      }else{
        if(!printWindow)setFaceMessage('Allow pop-ups for this site, then press Print again to open the printer dialog.');
        else{
          const printImage=await canvasToBlob(canvas,'image/jpeg',EXPORT_JPEG_QUALITY[exportQuality]),printUrl=URL.createObjectURL(printImage);
          printWindow.document.open();
          printWindow.document.write('<!doctype html><html><head><title>Print · '+baseName+'</title><style>@page{size:'+widthMm+'mm '+heightMm+'mm;margin:0}html,body{margin:0;padding:0;width:'+widthMm+'mm;height:'+heightMm+'mm;background:#fff}img{display:block;width:'+widthMm+'mm;height:'+heightMm+'mm;object-fit:fill}</style></head><body><img id="print-image" src="'+printUrl+'" alt="Print-ready photo"></body></html>');
          printWindow.document.close();
          const printImageElement=printWindow.document.getElementById('print-image') as HTMLImageElement|null;
          if(printImageElement){printImageElement.onload=()=>{printWindow.focus();printWindow.print();};printImageElement.onerror=()=>{setFaceMessage('The print preview could not load. Please download the PDF instead.');};}
          printWindow.onafterprint=()=>{URL.revokeObjectURL(printUrl);printWindow.close();};
          setFaceMessage('Print dialog opened. Select Actual Size / 100%, the matching paper size and High / Best printer quality.');
        }
      }
      setExportModalOpen(false);
    }catch(error){console.error('Photo export failed:',error);setFaceMessage(error instanceof Error?error.message:'The export could not be created. Please try again.');}
    finally{setExportBusy(false);}
  };

  const removeSelectedPhoto = () => {
    setSelectedFile(null);
    resetPreview();
  };

  return (
    <main className="relative flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-[#111518] text-[#E8EDF1]">
      <header className="relative z-30 h-[68px] min-h-[68px] shrink-0 border-b border-white/10 bg-[#171C20]/95 backdrop-blur-xl">
        <div className="flex min-h-[68px] flex-nowrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Back to TANSHU ONLINE" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#D6DEE5] transition hover:bg-white/10">
              <ArrowLeft size={17} />
            </a>
            <img src={TANSHU_PROFILE_PHOTO} alt="TANSHU ONLINE" className="h-10 w-10 rounded-full border-2 border-emerald-300/80 object-cover object-center shadow-lg shadow-emerald-950/40" />
            <div>
              
              <h1 className="shrink-0 whitespace-nowrap text-sm font-extrabold tracking-wide text-white sm:text-base">TANSHU ONLINE · WHATSAPP SELFIE PHOTO STUDIO</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 sm:inline-flex">
              <ShieldCheck size={13} /> Browser-side preview
            </span>
            <button type="button" onClick={toggleStudioFullscreen} title={isFullscreen?'Exit full screen':'Enter full screen'} aria-label={isFullscreen?'Exit full screen':'Enter full screen'} className="rounded-lg border border-white/10 p-2 text-[#C8D1D9] transition hover:bg-white/5">{isFullscreen?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button>
            <button type="button" onClick={resetPreview} disabled={!selectedFile} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#C8D1D9] transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">Reset</button>
            <button type="button" disabled={!mergedPhotoUrl && !processedPhotoUrl && !previewUrl} onClick={() => openExportOptions("photo")} title="Download the processed passport photo" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/30 disabled:cursor-not-allowed disabled:opacity-40">
              <Download size={14} /> Export Photo
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 overflow-hidden px-2 sm:px-3">
        <section onPointerDown={event=>{const target=event.target as HTMLElement;if(isCropping&&cropViewportRef.current&&!cropViewportRef.current.contains(target)&&!target.closest('button'))setIsCropping(false);}} className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#343D44] bg-[#1A2025] shadow-2xl shadow-black/30">
          <div onWheel={event=>{event.preventDefault();event.currentTarget.scrollLeft+=event.deltaY;}} className="relative z-20 flex min-h-[58px] shrink-0 flex-nowrap items-center justify-between gap-3 overflow-x-auto border-b border-[#343D44] bg-[#20272D] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300"><Layers3 size={16}/></span>
              <div><p className="text-xs font-bold text-white">Studio Workspace</p><p className="text-[10px] text-[#8F9BA5]">Upload · Edit · Preview · Print</p></div>
            </div>
            <div data-history-version={historyVersion} className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={undoStudio} disabled={!historyRef.current.past.length} title="Undo last studio change" className="inline-flex items-center gap-1 rounded-lg border border-[#3A444C] px-2 py-2 text-[9px] font-bold text-[#C8D1D9] disabled:opacity-30"><Undo2 size={13}/> Undo</button>
              <button type="button" onClick={redoStudio} disabled={!historyRef.current.future.length} title="Redo studio change" className="inline-flex items-center gap-1 rounded-lg border border-[#3A444C] px-2 py-2 text-[9px] font-bold text-[#C8D1D9] disabled:opacity-30"><Redo2 size={13}/> Redo</button>
            </div>
            <div className="flex shrink-0 flex-1 flex-nowrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="mr-1 text-[9px] font-extrabold uppercase tracking-wider text-[#82949B]">Choose Photo</span>
              {([{id:'selfie',title:'Selfie Photo'},{id:'existing',title:'Existing Photo'},{id:'whatsapp',title:'WhatsApp Print'}] as const).map(mode => <button key={mode.id} type="button" onClick={() => setInputMode(mode.id)} aria-pressed={inputMode===mode.id} className={inputMode===mode.id?'rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-2.5 py-2 text-[10px] font-bold text-emerald-200 ring-1 ring-emerald-400/20 transition':'rounded-lg border border-[#3A444C] bg-[#1B2227] px-2.5 py-2 text-[10px] font-semibold text-[#AAB5BD] transition hover:bg-white/5 hover:text-white'}>{mode.title}</button>)}
            </div>
            <button type="button" onClick={() => { setActiveTool('background'); setIsCropping(false); }} disabled={!selectedFile} className="rounded-lg border border-emerald-400/35 bg-emerald-400/10 px-3 py-2 text-[10px] font-extrabold text-emerald-200 disabled:opacity-40"><Eraser size={13} className="mr-1 inline"/>BG Remove</button>
            <button type="button" onClick={() => { setActiveTool('signature'); setIsCropping(false); }} disabled={!selectedFile} className="rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-bold text-[#C8D1D9] disabled:opacity-40">Add Signature</button>
            {activeTool==='crop'&&<div className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-400/20 bg-emerald-400/[.05] px-2 py-1"><label className="text-[9px] font-bold text-[#AAB8C0]">CROP SIZE</label><select value={photoSize} onChange={event=>{setPhotoSize(event.target.value);setPhotoPositions({});setCropRect({x:0,y:0,w:100,h:100});setCropHasSelection(false);setIsCropping(false);}} className="h-8 max-w-[210px] rounded border border-[#46535C] bg-[#171D22] px-2 text-[9px] font-bold text-white">{PHOTO_SIZE_GROUPS.map(group=><optgroup key={group.label} label={group.label}>{group.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</optgroup>)}<option value="custom">Custom Size · Free Crop</option></select></div>}
            {activeTool==='print'&&<div className="flex shrink-0 items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[.05] px-2 py-1">
               <button type="button" onClick={smartArrangePhotos} disabled={!selectedFile} title="Arrange photos from the top print-safe margin" className="rounded-md bg-emerald-500 px-2.5 py-2 text-[9px] font-extrabold text-white disabled:opacity-40"><WandSparkles size={12} className="mr-1 inline"/>SMART ARRANGE</button><button type="button" onClick={selectAllSheetPhotos} disabled={!visiblePhotoCount} title="Select every photo on this sheet" className="rounded-md border border-sky-300/35 px-2 py-2 text-[9px] font-bold text-sky-100 disabled:opacity-40">SELECT ALL</button><button type="button" onClick={()=>mergeSelectedSheetPhotos(Array.from({length:visiblePhotoCount},(_,index)=>index))} disabled={visiblePhotoCount<2||isMerging} title="Merge every photo on this sheet" className="rounded-md border border-violet-300/40 px-2 py-2 text-[9px] font-bold text-violet-100 disabled:opacity-40">MERGE ALL</button><button type="button" onClick={mergeSelectedSheetPhotos} disabled={selectedSheetPhotos.length<2||isMerging} title="Merge selected photos into one movable composite" className="rounded-md border border-violet-300/40 bg-violet-300/10 px-2 py-2 text-[9px] font-bold text-violet-100 disabled:opacity-40"><Merge size={12} className="mr-1 inline"/>{isMerging?'MERGING…':`MERGE ${selectedSheetPhotos.length||''}`}</button><button type="button" onClick={deleteAllSheetPhotos} disabled={!visiblePhotoCount} title="Delete all photos from this sheet" className="rounded-md border border-rose-400/35 px-2 py-2 text-[9px] font-bold text-rose-200 disabled:opacity-40">DELETE ALL</button><button type="button" onClick={shrinkAllPhotos} disabled={!selectedFile} title="Reduce all photos to 90%" className="rounded-md border border-sky-300/40 bg-sky-300/10 px-2 py-2 text-[9px] font-extrabold text-sky-100 disabled:opacity-40">ALL −10%</button>
              <div className="flex shrink-0 items-center gap-1.5"><label className="text-[9px] font-bold text-[#AAB8C0]">SHEET</label><select value={sheetSize} onChange={event=>{setSheetSize(event.target.value);setPhotoPositions({});}} className="h-8 max-w-[150px] rounded border border-[#46535C] bg-[#171D22] px-2 text-[9px] font-bold text-white"><optgroup label="Common photo paper"><option value="single">Single Photo</option><option value="3.5x5">3.5 × 5 Sheet</option><option value="4x6">4 × 6 Sheet</option><option value="4x8">4 × 8 Sheet</option><option value="5x7">5 × 7 Sheet</option><option value="6x8">6 × 8 Sheet</option><option value="8x10">8 × 10 Sheet</option></optgroup><optgroup label="Standard paper"><option value="A6">A6 Sheet</option><option value="A5">A5 Sheet</option><option value="A4">A4 Sheet</option><option value="A3">A3 Sheet</option><option value="Letter">Letter Sheet</option><option value="Legal">Legal Sheet</option></optgroup><option value="custom">Custom Paper Size</option></select></div>
            </div>}
            <div className="flex shrink-0 items-center gap-2 text-[10px] text-[#9BA7B0]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>{backupStatus}<span className="mx-1 text-[#4D5962]">|</span>{selectedFile ? 'Photo loaded locally' : 'Waiting for photo'}</div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[76px_minmax(0,1fr)_310px]">
            <nav aria-label="Studio tools" className="flex min-h-0 flex-col gap-1 overflow-y-auto overflow-x-hidden border-r border-[#343D44] bg-[#171D22] p-2 lg:p-3">
              {TOOL_ITEMS.map((tool) => {
                const Icon = tool.icon;
                const active = activeTool === tool.id;
                return (
                  <button key={tool.id} type="button" onClick={() => { setActiveTool(tool.id); if(tool.id !== 'crop') setIsCropping(false); }} title={tool.label} aria-pressed={active} className={active ? 'group flex min-w-[66px] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 px-2 py-3 text-emerald-300 ring-1 ring-emerald-400/25 lg:min-w-0 lg:flex-none' : 'group flex min-w-[66px] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-[#87939D] transition hover:bg-white/5 hover:text-white lg:min-w-0 lg:flex-none'}>
                    <Icon size={19}/><span className="text-[9px] font-bold leading-tight">{tool.short}</span>
                    {active && <span className="hidden h-1 w-4 rounded-full bg-emerald-400 lg:block"/>}
                  </button>
                );
              })}
              <div className="hidden flex-1 lg:block"/>
              <div className="hidden rounded-xl border border-white/5 bg-white/[.03] p-2 text-center lg:block"><ShieldCheck size={17} className="mx-auto text-emerald-400"/><p className="mt-1 text-[8px] font-semibold text-[#87939D]">LOCAL</p></div>
            </nav>

            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#12171B] overscroll-contain">
              <div className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#303941] bg-[#12171B]/95 px-4 py-3 backdrop-blur">
                <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8C9AA4]">Live photo canvas</p><p className="mt-0.5 text-xs font-semibold text-[#E3E8EC]">{selectedFile ? 'Photo loaded · Ready to edit' : 'Your photo preview will appear here'}</p></div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {selectedFile && <>
                    <input ref={replacePhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                    <button type="button" onClick={() => replacePhotoInputRef.current?.click()} className="rounded-lg border border-emerald-400/30 px-2.5 py-2 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-400/10">Replace Photo</button>
                    <button type="button" onClick={removeSelectedPhoto} className="rounded-lg border border-rose-400/25 px-2.5 py-2 text-[10px] font-semibold text-rose-300 transition hover:bg-rose-400/10">Remove</button>
                  </>}
                  {activeTool==='print' ? <div className="min-w-0 max-w-[150px]"><NumericStepper compact label="SHEET ZOOM" value={sheetZoom} min={50} max={250} step={5} unit="%" onChange={setSheetZoom}/></div> : <><button type="button" onClick={() => setZoom(value => Math.max(50, value - 10))} disabled={!selectedFile} aria-label="Zoom out" className="rounded-lg border border-[#3A444C] p-2 text-[#AEB8C0] hover:bg-white/5 disabled:opacity-30"><ZoomOut size={14}/></button><span className="w-10 text-center text-[10px] font-bold tabular-nums text-[#C8D1D9]">{zoom}%</span><button type="button" onClick={() => setZoom(value => Math.min(180, value + 10))} disabled={!selectedFile} aria-label="Zoom in" className="rounded-lg border border-[#3A444C] p-2 text-[#AEB8C0] hover:bg-white/5 disabled:opacity-30"><ZoomIn size={14}/></button></>}
                  {selectedFile&&activeTool==='crop'&&<button type="button" onClick={()=>{if(isCropping)void applyCropSelection();else{setCropRect({x:0,y:0,w:100,h:100});setCropHasSelection(false);setIsCropping(true);}}} className={isCropping?'ml-1 rounded-lg border border-emerald-300/40 bg-emerald-400/15 px-2.5 py-2 text-[10px] font-bold text-emerald-200':'ml-1 rounded-lg border border-[#3A444C] px-2.5 py-2 text-[10px] font-semibold text-[#AEB8C0] hover:bg-white/5'}>{isCropping?'Done · Apply Crop':'Crop'}</button>}
                  {selectedFile&&activeTool==='face'&&<button type="button" onClick={runFreeFaceAlignment} disabled={faceStatus==='loading'} className="ml-1 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-[10px] font-bold text-emerald-200 disabled:opacity-50">{faceStatus==='loading'?'Loading model…':'Detect & Straighten'}</button>}
                  <button type="button" onClick={() => setShowGuides(value => !value)} disabled={!selectedFile} className={showGuides ? 'ml-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-2 text-[10px] font-semibold text-emerald-300 disabled:opacity-30' : 'ml-1 rounded-lg border border-[#3A444C] px-2.5 py-2 text-[10px] font-semibold text-[#AEB8C0] disabled:opacity-30'}>Guides</button>{activeTool==='print'&&<><div className="flex min-w-0 items-center gap-1.5"><label htmlFor="sheet-photo-count" className="shrink-0 text-[9px] font-bold text-[#AAB8C0]">PHOTO COUNT</label><input id="sheet-photo-count" aria-label="Photo count" type="number" inputMode="numeric" min={0} max={sheetCapacity} step={1} value={visiblePhotoCount} onChange={event=>{const raw=event.target.value;if(raw===""){setPhotoCount(0);return;}const next=Number.parseInt(raw,10);if(Number.isFinite(next))setPhotoCount(Math.max(0,Math.min(sheetCapacity,next)));}} onWheel={event=>{event.preventDefault();event.stopPropagation();setPhotoCount(current=>Math.max(0,Math.min(sheetCapacity,current+(event.deltaY<0?1:-1))));}} className="h-8 w-[64px] rounded-lg border border-[#46535C] bg-[#171D22] px-1 text-center text-[10px] font-bold tabular-nums text-white outline-none focus:border-emerald-400"/></div><button type="button" onClick={()=>setDeleteMode(value=>!value)} title={deleteMode?'Turn Delete Mode off':'Turn Delete Mode on'} aria-label={deleteMode?'Turn Delete Mode off':'Turn Delete Mode on'} aria-pressed={deleteMode} className={deleteMode?'rounded-lg border border-rose-400/50 bg-rose-500/15 p-2 text-rose-300 shadow-sm':'rounded-lg border border-[#46535C] p-2 text-rose-300 transition hover:bg-rose-500/10'}><Trash2 size={14}/></button><button type="button" onClick={selectAllSheetPhotos} disabled={!visiblePhotoCount} className="ml-1 rounded-lg border border-sky-300/35 px-2.5 py-2 text-[10px] font-semibold text-sky-100 disabled:opacity-30">Select All</button><button type="button" onClick={mergeSelectedSheetPhotos} disabled={selectedSheetPhotos.length<2||isMerging} className="rounded-lg border border-violet-300/40 bg-violet-300/10 px-2.5 py-2 text-[10px] font-bold text-violet-100 disabled:opacity-30">Merge {selectedSheetPhotos.length||''}</button><button type="button" onClick={deleteAllSheetPhotos} disabled={!visiblePhotoCount} className="rounded-lg border border-rose-400/35 px-2.5 py-2 text-[10px] font-semibold text-rose-200 disabled:opacity-30">Delete All</button><span className="text-[9px] text-[#9BA7B0]">{selectedSheetPhotos.length} selected{resizeMode?' · RESIZE MODE':''}</span></>}
                </div>
              </div>

              <div onWheel={(event) => { if (activeTool !== 'print' && selectedFile && (event.ctrlKey || event.metaKey)) { event.preventDefault(); const delta = event.deltaY < 0 ? 5 : -5; setZoom(value => Math.max(50, Math.min(250, value + delta))); } }} className={'relative flex min-h-0 flex-1 overflow-auto p-4 sm:p-6 '+(activeTool==='print'?'items-start justify-start':'items-center justify-center')} style={{backgroundImage:'radial-gradient(#34414a 1px, transparent 1px)',backgroundSize:'18px 18px'}}>
                {!selectedFile ? (
                  <label className="group flex min-h-[390px] w-full max-w-[580px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#4B6260] bg-[#1A2527]/90 px-6 py-10 text-center transition hover:border-emerald-400 hover:bg-[#1D2B2B]">
                    <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300 shadow-xl shadow-black/20 transition group-hover:scale-105"><UploadCloud size={35}/></span>
                    <span className="text-lg font-extrabold text-white sm:text-xl">{inputMode === 'selfie' ? 'Upload Customer Selfie' : inputMode === 'existing' ? 'Upload Existing Photo' : 'Upload WhatsApp Photo'}</span>
                    <span className="mt-2 max-w-sm text-xs leading-6 text-[#9EADB4] sm:text-sm">{inputMode === 'selfie' ? 'Choose a customer selfie for guided face positioning.' : inputMode === 'existing' ? 'Choose an older passport photo or low-resolution image.' : 'Choose a tilted or photographed passport print received on WhatsApp.'}</span>
                    <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/50 transition group-hover:-translate-y-0.5"><ImagePlus size={16}/> Choose Photo</span>
                    <span className="mt-4 text-[10px] text-[#73828A]">JPG · PNG · WEBP · Image files</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange}/>
                  </label>
                ) : (
                  activeTool === 'print' ? (
                    <div className="flex min-h-full min-w-full w-max items-start justify-start p-5">
                      <div onWheel={(event)=>{event.preventDefault();event.stopPropagation();const delta=event.deltaY<0?5:-5;setSheetZoom(value=>Math.max(50,Math.min(250,value+delta)));}} className="relative mx-0 my-0 shrink-0 overflow-hidden rounded-sm bg-white shadow-2xl" style={{width:Math.round(sheetWidthMm*sheetPreviewScale*sheetZoom/100)+'px',height:Math.round(sheetHeightMm*sheetPreviewScale*sheetZoom/100)+'px'}}>
                        {Array.from({length:visiblePhotoCount},(_,index)=>{
                          const position=getSheetPhotoPosition(index),itemScale=photoScales[index]??1,previewUnit=sheetPreviewScale*sheetZoom/100;
                          const dimensions=getSheetPhotoDimensions(index),isSelected=selectedSheetPhotos.includes(index);
                          return <div key={index} data-photo-index={index} onPointerDown={event=>startSheetPhotoDrag(event,index)} onPointerMove={moveSheetPhotoDrag} onPointerUp={endSheetPhotoDrag} onPointerCancel={endSheetPhotoDrag} onWheel={event=>{if(!isSelected)return;event.preventDefault();event.stopPropagation();setPhotoScales(current=>({...current,[index]:Math.max(0.3,Math.min(1.5,(current[index]??1)+(event.deltaY<0?0.05:-0.05)))}));}} className={'absolute cursor-move touch-none overflow-visible bg-slate-100 shadow-sm '+(isSelected?(resizeMode?'ring-2 ring-amber-400':'ring-2 ring-sky-500'):'')} style={{left:position.x*previewUnit+'px',top:position.y*previewUnit+'px',width:dimensions.width*itemScale*previewUnit+'px',height:dimensions.height*itemScale*previewUnit+'px',border:borderEnabled?Math.max(1,borderWidthMm*previewUnit*itemScale)+'px solid '+borderColor:'none'}}>
                            <img src={photoImages[index]||mergedPhotoUrl||processedPhotoUrl||previewUrl} alt={'Photo '+(index+1)} draggable={false} className="pointer-events-none h-full w-full object-cover" style={{transform:'rotate('+rotation+'deg) scale('+zoom/100+') scaleX('+(flipped?-1:1)+')'}}/>
                            <button type="button" data-photo-action="select" onPointerDown={event=>{event.preventDefault();event.stopPropagation();}} onClick={()=>toggleSheetPhotoSelection(index)} title={isSelected?'Deselect photo':'Select photo for merge'} aria-label={isSelected?'Deselect photo '+(index+1):'Select photo '+(index+1)} className={'absolute -left-2 -top-2 z-40 flex h-5 w-5 items-center justify-center rounded border shadow '+(isSelected?'border-sky-700 bg-sky-600 text-white':'border-slate-500 bg-white text-slate-600')}>{isSelected?<Check size={12}/>:<span className="h-2.5 w-2.5 rounded-sm border border-slate-400"/>}</button>
                            {deleteMode&&<button type="button" data-photo-action="delete" onPointerDown={event=>{event.preventDefault();event.stopPropagation();}} onClick={()=>deleteSheetPhoto(index)} title="Delete this photo" aria-label="Delete this photo" className="group absolute -right-2 -top-2 z-40 flex h-5 w-5 items-center justify-center rounded-full border border-rose-700 bg-rose-600 text-white shadow transition hover:bg-rose-500"><Trash2 size={11} className="origin-top transition-transform duration-150 group-hover:-rotate-12"/><span className="absolute left-[5px] top-[3px] h-[2px] w-[9px] origin-right rounded bg-white transition-transform duration-150 group-hover:-rotate-45"/></button>}
                            <span onPointerDown={event=>startSheetPhotoResize(event,index,-1,-1)} className={'absolute -left-2.5 -top-2.5 z-30 h-5 w-5 cursor-nwse-resize touch-none rounded-full border-2 bg-white shadow-md '+(resizeMode&&isSelected?'border-amber-500 ring-2 ring-amber-300/60':'border-sky-700')} title="Drag corner to resize"/>
                            <span onPointerDown={event=>startSheetPhotoResize(event,index,1,-1)} className={'absolute -right-2.5 -top-2.5 z-30 h-5 w-5 cursor-nesw-resize touch-none rounded-full border-2 bg-white shadow-md '+(resizeMode&&isSelected?'border-amber-500 ring-2 ring-amber-300/60':'border-sky-700')} title="Drag corner to resize"/>
                            <span onPointerDown={event=>startSheetPhotoResize(event,index,-1,1)} className={'absolute -left-2.5 -bottom-2.5 z-30 h-5 w-5 cursor-nesw-resize touch-none rounded-full border-2 bg-white shadow-md '+(resizeMode&&isSelected?'border-amber-500 ring-2 ring-amber-300/60':'border-sky-700')} title="Drag corner to resize"/>
                            <span onPointerDown={event=>startSheetPhotoResize(event,index,1,1)} className={'absolute -right-2.5 -bottom-2.5 z-30 h-5 w-5 cursor-nwse-resize touch-none rounded-full border-2 bg-white shadow-md '+(resizeMode&&isSelected?'border-amber-500 ring-2 ring-amber-300/60':'border-sky-700')} title="Drag corner to resize"/>
                            {!photoImages[index]&&!mergedPhotoUrl&&signatureUrl&&signatureVisible&&<img src={signatureProcessedUrl||signatureUrl} alt="" draggable={false} className="pointer-events-none absolute object-contain" style={{left:signaturePosition.x+'%',top:signaturePosition.y+'%',width:(36*signatureScale)+'%',transform:'translate(-50%,-50%) rotate('+signatureRotation+'deg)'}}/>}
                          </div>;
                        })}
                        <span className="pointer-events-none absolute bottom-2 right-3 text-[8px] font-semibold text-slate-400">{sheetSize} · DRAG PHOTOS TO ARRANGE · {sheetZoom}%</span>
                      </div>
                    </div>
                  ) : (
                  <div className="relative flex h-full min-h-[420px] w-full items-center justify-center">
                    <div ref={cropViewportRef} onPointerDown={startCropDraw} onPointerMove={handleCropPointerMove} onPointerUp={endCropDrag} onPointerCancel={endCropDrag} className={'relative flex max-h-[calc(100vh-150px)] max-w-[min(100%,480px)] items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-[#E7E8E6] '+(isCropping?'cursor-crosshair p-0':'p-2 shadow-2xl shadow-black/50')} style={isCropping&&sourceDimensions?{aspectRatio:sourceDimensions.width+' / '+sourceDimensions.height,width:'min(100%, 480px)',height:'auto',maxHeight:'min(76vh, 720px)',touchAction:'none'}:{aspectRatio:photoWidthMm+' / '+photoHeightMm,height:'min(76vh, 720px)',touchAction:'none'}}>
                      <img src={mergedPhotoUrl || processedPhotoUrl || previewUrl} alt="Customer passport photo preview" draggable={false} onLoad={event=>setSourceDimensions({width:event.currentTarget.naturalWidth,height:event.currentTarget.naturalHeight})} onPointerDown={startPhotoPan} className={'h-full w-full select-none object-contain '+(isCropping?'pointer-events-none':'cursor-grab active:cursor-grabbing')} style={{transform:isCropping?'none':'translate('+photoOffset.x+'px, '+photoOffset.y+'px) rotate('+rotation+'deg) scale('+zoom/100+') scaleX('+(flipped?-1:1)+') scale('+photoScale+')',clipPath:(!isCropping&&(cropRect.x!==0||cropRect.y!==0||cropRect.w!==100||cropRect.h!==100))?'inset('+cropRect.y+'% '+(100-cropRect.x-cropRect.w)+'% '+(100-cropRect.y-cropRect.h)+'% '+cropRect.x+'%)':undefined}}/>
                      {showGuides&&!isCropping&&<div className="pointer-events-none absolute inset-[9%] rounded-md border border-dashed border-emerald-600/70"><div className="absolute left-1/2 top-0 h-full border-l border-dashed border-emerald-600/35"/><div className="absolute left-0 top-1/3 w-full border-t border-dashed border-emerald-600/35"/><div className="absolute left-0 top-2/3 w-full border-t border-dashed border-emerald-600/35"/></div>}
                      {!isCropping&&activeTool==='crop'&&cropHasSelection&&<div className="pointer-events-none absolute z-10 border-2 border-sky-500" style={{left:cropRect.x+'%',top:cropRect.y+'%',width:cropRect.w+'%',height:cropRect.h+'%',transform:'scale('+photoScale+')',transformOrigin:'center'}}><span onPointerDown={event=>startPhotoResize(event,-1,-1)} className="pointer-events-auto absolute -left-2.5 -top-2.5 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-sky-600 bg-white shadow-md"/><span onPointerDown={event=>startPhotoResize(event,1,-1)} className="pointer-events-auto absolute -right-2.5 -top-2.5 h-5 w-5 cursor-nesw-resize rounded-full border-2 border-sky-600 bg-white shadow-md"/><span onPointerDown={event=>startPhotoResize(event,-1,1)} className="pointer-events-auto absolute -bottom-2.5 -left-2.5 h-5 w-5 cursor-nesw-resize rounded-full border-2 border-sky-600 bg-white shadow-md"/><span onPointerDown={event=>startPhotoResize(event,1,1)} className="pointer-events-auto absolute -bottom-2.5 -right-2.5 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-sky-600 bg-white shadow-md"/></div>}
                      {isCropping&&activeTool==='crop'&&cropRect.w>0&&cropRect.h>0&&<div className="pointer-events-none absolute rounded-sm border-2 border-rose-600 shadow-[0_0_0_9999px_rgba(0,0,0,0.48)]" style={{left:cropRect.x+'%',top:cropRect.y+'%',width:cropRect.w+'%',height:cropRect.h+'%'}}><span data-crop-handle="tl" className="pointer-events-auto absolute -left-2 -top-2 z-10 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-rose-600 bg-white shadow-md"/><span data-crop-handle="tr" className="pointer-events-auto absolute -right-2 -top-2 z-10 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-rose-600 bg-white shadow-md"/><span data-crop-handle="bl" className="pointer-events-auto absolute -bottom-2 -left-2 z-10 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-rose-600 bg-white shadow-md"/><span data-crop-handle="br" className="pointer-events-auto absolute -bottom-2 -right-2 z-10 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-rose-600 bg-white shadow-md"/></div>}
                      {isCropping&&<span className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/80 px-3 py-1.5 text-[9px] font-bold text-white">DRAG TO DRAW · INSIDE TO MOVE · CORNERS TO RESIZE · DONE TO APPLY</span>}
                      {!mergedPhotoUrl && signatureUrl && signatureVisible && <img src={signatureProcessedUrl || signatureUrl} alt="Signature overlay preview" draggable={false} onPointerDown={handleSignaturePointerDown} onPointerMove={handleSignaturePointerMove} onPointerUp={handleSignaturePointerUp} onPointerCancel={handleSignaturePointerUp} className="absolute z-20 max-h-[25%] max-w-[65%] cursor-move touch-none object-contain drop-shadow" style={{left:signaturePosition.x+'%',top:signaturePosition.y+'%',width:(36*signatureScale)+'%',transform:'translate(-50%,-50%) rotate('+signatureRotation+'deg)'}} />}
                      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-[9px] font-bold tracking-wide text-white">PREVIEW ONLY</span>
                    </div>
                  </div>
                  )
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#303941] bg-[#1A2025] px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] text-[#8E9AA3]"><Info size={13}/>{selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2)+' MB · Local preview' : 'Upload a selfie to begin'}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setRotation(value => (value - 90 + 360) % 360)} disabled={!selectedFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-semibold text-[#C1CAD1] hover:bg-white/5 disabled:opacity-30"><RotateCcw size={13}/> Rotate left</button>
                  <button type="button" onClick={() => setRotation(value => (value + 90) % 360)} disabled={!selectedFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-semibold text-[#C1CAD1] hover:bg-white/5 disabled:opacity-30"><RotateCw size={13}/> Rotate right</button>
                  <button type="button" onClick={() => setFlipped(value => !value)} disabled={!selectedFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-semibold text-[#C1CAD1] hover:bg-white/5 disabled:opacity-30"><FlipHorizontal size={13}/> Flip</button>
                </div>
              </div>
            </section>

            <aside className="hidden min-h-0 overflow-y-auto border-l border-[#343D44] bg-[#1B2126] overscroll-contain lg:block">
              <div className="border-b border-[#343D44] px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-emerald-300">Tool settings</p>
                <h3 className="mt-1 text-base font-extrabold text-white">{toolDescriptions[activeTool].title}</h3>
                <p className="mt-1 text-[10px] leading-5 text-[#94A1AA]">{toolDescriptions[activeTool].description}</p>
              </div>

              <div className="space-y-4 p-4">
                {activeTool==='print'&&<div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.05] p-3">
                  <p className="mb-3 text-[10px] font-bold tracking-wide text-emerald-200">ADVANCED PRINT SETTINGS</p>
                  {sheetSize==='custom'&&<div className="mb-3 grid grid-cols-2 gap-2"><NumericStepper label="PAPER WIDTH" value={customSheetWidthMm} min={50} max={500} step={1} onChange={setCustomSheetWidthMm}/><NumericStepper label="PAPER HEIGHT" value={customSheetHeightMm} min={50} max={700} step={1} onChange={setCustomSheetHeightMm}/></div>}
                  <p className="mb-3 text-[8px] leading-4 text-[#83919A]">Adjust spacing precisely. Drag each photo on the sheet to place it anywhere; the downloaded sheet follows the same positions.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <NumericStepper label="HORIZONTAL MARGIN" value={horizontalMarginMm} min={0} max={250} step={0.5} onChange={setHorizontalMarginMm}/>
                    <NumericStepper label="VERTICAL MARGIN" value={verticalMarginMm} min={0} max={250} step={0.5} onChange={setVerticalMarginMm}/>
                    <NumericStepper label="HORIZONTAL GAP" value={horizontalGapMm} min={0} max={20} step={0.5} onChange={setHorizontalGapMm}/>
                    <NumericStepper label="VERTICAL GAP" value={verticalGapMm} min={0} max={20} step={0.5} onChange={setVerticalGapMm}/>
                  </div>
                  <button type="button" onClick={()=>setBorderEnabled(value=>!value)} className="mt-3 flex w-full items-center justify-between rounded-lg border border-[#46535C] px-3 py-2 text-[9px] font-semibold text-[#C3CDD3]"><span>Photo border</span><span className="text-emerald-200">{borderEnabled?'ON':'OFF'}</span></button>
                  {borderEnabled&&<><label className="mt-2 block text-[9px] font-bold text-[#D4DCE1]">BORDER COLOUR</label><input type="color" value={borderColor} onChange={event=>setBorderColor(event.target.value)} className="mt-1 h-8 w-full rounded border border-[#46535C] bg-[#171D22] p-1"/><NumericStepper label="BORDER WIDTH" value={borderWidthMm} min={0.1} max={2} step={0.1} onChange={setBorderWidthMm}/></>}
                  <button type="button" onClick={smartArrangePhotos} disabled={!selectedFile} className="mt-3 w-full rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-[9px] font-bold text-emerald-200 disabled:opacity-40">Smart Arrange · Start From Top</button>
                  <button type="button" onClick={shrinkAllPhotos} disabled={!selectedFile} className="mt-2 w-full rounded-lg border border-sky-300/30 bg-sky-300/10 px-3 py-2 text-[9px] font-bold text-sky-100 disabled:opacity-40">Reduce All Photos · 10%</button><button type="button" onClick={()=>setPhotoPositions({})} className="mt-2 w-full rounded-lg border border-[#46535C] px-3 py-2 text-[9px] font-bold text-[#C3CDD3]">Reset photo positions to grid</button>
                  <button type="button" onClick={()=>openExportOptions("sheet")} disabled={!selectedFile} className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2.5 text-[10px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">Export / Print {paperDimensions[sheetSize]?.label ?? 'Custom'} Sheet</button>
                  <p className="mt-2 text-[8px] leading-4 text-[#83919A]">Click a photo to select it. Ctrl + C copies, Ctrl + V pastes, Ctrl + T highlights resize handles; Shift / Alt + drag duplicates. Select All, Merge All or Delete All are available above. Smart Arrange starts at the top margin. Print at Actual Size / 100%.</p>
                </div>}

                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold tracking-wide text-[#D4DCE1]">PHOTO INPUT</span><span className={selectedFile ? 'rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300' : 'rounded-full bg-white/5 px-2 py-1 text-[9px] font-bold text-[#87939D]'}>{selectedFile ? 'LOADED' : 'EMPTY'}</span></div>
                  {selectedFile ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-11 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#313B42]"><img src={previewUrl} alt="" className="h-full w-full object-cover"/></div>
                      <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-white">{selectedFile.name}</p><p className="mt-1 text-[9px] text-[#8F9CA5]">{(selectedFile.size / 1024).toFixed(0)} KB</p></div>
                      <button type="button" onClick={() => { setSelectedFile(null); resetPreview(); }} aria-label="Remove uploaded selfie" className="rounded-lg p-2 text-[#A9B3BA] hover:bg-rose-500/10 hover:text-rose-300"><X size={15}/></button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#52615F] px-3 py-3 text-[10px] font-bold text-emerald-300 transition hover:bg-emerald-400/5"><ImagePlus size={14}/> Select customer selfie<input type="file" accept="image/*" className="sr-only" onChange={handleFileChange}/></label>
                  )}
                </div>

                {activeTool==='crop'&&<div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <label className="mb-2 block text-[10px] font-bold tracking-wide text-[#D4DCE1]" htmlFor="passport-photo-size">CROP / PASSPORT PHOTO SIZE</label>
                  <select id="passport-photo-size" value={photoSize} onChange={event=>{setPhotoSize(event.target.value);setPhotoPositions({});setCropRect({x:0,y:0,w:100,h:100});setCropHasSelection(false);setIsCropping(false);setFaceMessage('Crop size updated. Start Crop to draw a frame with this exact aspect ratio.');}} className="h-10 w-full rounded-lg border border-[#46535C] bg-[#171D22] px-3 text-xs font-semibold text-white outline-none focus:border-emerald-400">
                    {PHOTO_SIZE_GROUPS.map(group=><optgroup key={group.label} label={group.label}>{group.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</optgroup>)}
                    <option value="custom">Custom Size · Free Crop</option>
                  </select>
                  {photoSize==='custom'&&<div className="mt-3 grid grid-cols-2 gap-2"><NumericStepper label="CUSTOM WIDTH" value={customPhotoWidthMm} min={5} max={100} step={0.5} onChange={setCustomPhotoWidthMm}/><NumericStepper label="CUSTOM HEIGHT" value={customPhotoHeightMm} min={5} max={150} step={0.5} onChange={setCustomPhotoHeightMm}/></div>}
                  <p className="mt-2 text-[9px] leading-4 text-[#83919A]">Preset crop frames keep the exact selected ratio. Custom Size allows freeform cropping. Print output uses the selected millimetre dimensions at 300 DPI.</p>
                </div>}

                {activeTool === 'background' ? (
                  <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.06] p-3">
                    <div className="mb-2 flex items-center gap-2 text-emerald-200"><Eraser size={15}/><span className="text-[10px] font-extrabold uppercase tracking-wide">Photo background remover</span></div>
                    <p className="text-[10px] leading-5 text-[#C1CDD2]">Free browser-side person segmentation. The first use downloads the model; no paid API or server photo upload.</p>
                    <label className="mt-3 block text-[9px] font-bold text-[#D4DCE1]">BACKGROUND COLOUR</label>
                    <div className="mt-2 grid grid-cols-4 gap-2">{[{name:'White',value:'#ffffff'},{name:'Blue',value:'#4f8bc9'},{name:'Red',value:'#c83d42'},{name:'Light Grey',value:'#e7e7e7'}].map(item=><button key={item.value} type="button" onClick={()=>setBackgroundColor(item.value)} className={'rounded-lg border p-2 text-[9px] font-bold '+(backgroundColor===item.value?'border-emerald-300 ring-1 ring-emerald-300/50':'border-[#46535C]')}><span className="mx-auto mb-1 block h-6 w-full rounded" style={{background:item.value}}/>{item.name}</button>)}</div>
                    <label className="mt-3 block text-[9px] font-bold text-[#D4DCE1]">CUSTOM COLOUR</label><input type="color" value={backgroundColor} onChange={event=>setBackgroundColor(event.target.value)} className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-[#46535C] bg-[#171D22] p-1"/>
                    <button type="button" onClick={removePhotoBackground} disabled={!selectedFile||backgroundStatus==='Removing background…'||backgroundStatus==='Loading free background model…'} className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2.5 text-[10px] font-extrabold text-white disabled:opacity-40">{backgroundStatus==='Removing background…'?'Removing…':'Remove Background & Apply Colour'}</button>
                    {backgroundStatus&&<p className="mt-2 text-[9px] leading-4 text-emerald-200">{backgroundStatus}</p>}
                    <p className="mt-2 text-[8px] leading-4 text-[#83919A]">Best results: clear person outline, good lighting and a visible head/shoulder boundary.</p>
                  </div>
                ) : activeTool === 'signature' ? (
                  <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.06] p-3">
                    <div className="mb-2 flex items-center gap-2 text-emerald-200"><FileImage size={15}/><span className="text-[10px] font-extrabold uppercase tracking-wide">Signature editor</span></div>
                    {signatureFile ? <div className="mb-3 flex items-center gap-2"><img src={signatureProcessedUrl||signatureUrl} alt="Signature preview" className="h-12 w-20 rounded bg-white object-contain p-1"/><span className="min-w-0 flex-1 truncate text-[9px] text-[#C8D1D9]">{signatureFile.name}</span><button type="button" onClick={()=>{setSignatureFile(null);setSignatureProcessedUrl('');setMergedPhotoUrl('');}} className="rounded p-1 text-rose-300"><X size={14}/></button></div> : <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#52615F] px-3 py-3 text-[10px] font-bold text-emerald-300"><ImagePlus size={14}/> Add Signature<input type="file" accept="image/*" className="sr-only" onChange={handleSignatureChange}/></label>}
                    <button type="button" disabled={!signatureUrl} onClick={applySignatureBackgroundRemoval} className="w-full rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2.5 text-[10px] font-extrabold text-emerald-200 disabled:opacity-40">Remove Signature Background</button>
                    <p className="mt-2 text-[8px] leading-4 text-[#83919A]">Works best with a dark signature on a plain white or light background.</p>
                    <div className="mt-3 flex items-center justify-between"><label className="text-[9px] font-bold text-[#D4DCE1]">SIGNATURE SIZE</label><span className="text-[9px] text-emerald-200">{Math.round(signatureScale*100)}%</span></div><input type="range" min="40" max="180" value={Math.round(signatureScale*100)} onChange={event=>{setSignatureScale(Number(event.target.value)/100);setMergedPhotoUrl('');setSignatureVisible(true);}} className="mt-2 w-full accent-emerald-400"/>
                    <div className="mt-3 flex gap-2"><button type="button" onClick={()=>{setSignatureRotation(value=>value-5);setMergedPhotoUrl('');setSignatureVisible(true);}} className="flex-1 rounded-lg border border-[#46535C] px-2 py-2 text-[9px] font-bold text-[#D4DCE1]">Rotate −5°</button><button type="button" onClick={()=>{setSignatureRotation(value=>value+5);setMergedPhotoUrl('');setSignatureVisible(true);}} className="flex-1 rounded-lg border border-[#46535C] px-2 py-2 text-[9px] font-bold text-[#D4DCE1]">Rotate +5°</button></div>
                    <button type="button" disabled={!signatureUrl} onClick={()=>setSignatureVisible(value=>!value)} className="mt-3 w-full rounded-lg border border-[#46535C] px-3 py-2 text-[9px] font-semibold text-[#C3CDD3] disabled:opacity-40">{signatureVisible?'Hide signature':'Show signature'} on photo</button>
                    <button type="button" disabled={!signatureUrl||!selectedFile||isMerging} onClick={mergeSignatureIntoPhoto} className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2.5 text-[10px] font-extrabold text-white disabled:opacity-40">{isMerging?'Merging…':'Done · Merge Signature'}</button>
                    <button type="button" disabled={!selectedFile || (Boolean(signatureFile) && !mergedPhotoUrl)} onClick={()=>setActiveTool('print')} className="mt-2 w-full rounded-lg border border-sky-300/30 bg-sky-300/10 px-3 py-2.5 text-[10px] font-extrabold text-sky-100 disabled:opacity-40">Save & Next · A4 / 4 × 6 Sheet</button>
                    <button type="button" disabled={!selectedFile} onClick={()=>{setSignatureVisible(false);setActiveTool('print');}} className="mt-2 w-full rounded-lg border border-[#46535C] px-3 py-2 text-[9px] font-semibold text-[#C3CDD3]">Continue without signature</button>
                    {backgroundStatus&&<p className="mt-2 text-[9px] leading-4 text-emerald-200">{backgroundStatus}</p>}
                  </div>
                ) : activeTool === 'crop' ? (
                  <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                    <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold text-[#D4DCE1]">PHOTO ZOOM</span><span className="text-[10px] font-bold tabular-nums text-emerald-300">{zoom}%</span></div>
                    <input aria-label="Preview zoom" type="range" min="50" max="180" step="5" value={zoom} onChange={event => setZoom(Number(event.target.value))} className="w-full accent-emerald-400"/>
                    <div className="mt-2 flex justify-between text-[9px] text-[#829099]"><span>50%</span><span>100%</span><span>180%</span></div>
                    <button type="button" onClick={() => setShowGuides(value => !value)} className="mt-3 flex w-full items-center justify-between rounded-lg border border-[#46535C] px-3 py-2 text-[10px] font-semibold text-[#C3CDD3]"><span>Composition guides</span><span className={showGuides ? 'text-emerald-300' : 'text-[#7E8A93]'}>{showGuides ? 'ON' : 'OFF'}</span></button>
                    <button type="button" onClick={()=>setPhotoOffset({x:0,y:0})} className="mt-2 w-full rounded-lg border border-[#46535C] px-3 py-2 text-[10px] font-semibold text-[#C3CDD3] hover:bg-white/5">Center photo position</button>
                  </div>
                ) : activeTool === 'face' ? (
                  <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.06] p-3">
                    <div className="mb-2 flex items-center gap-2 text-emerald-200"><ScanFace size={15}/><span className="text-[10px] font-extrabold uppercase tracking-wide">Free on-device face check</span></div>
                    <p className="text-[10px] leading-5 text-[#C1CDD2]">Detects one face and measures the eye-line angle. This free on-device tool does not yet reconstruct a side-facing face into a true frontal view.</p>
                    <button type="button" onClick={runFreeFaceAlignment} disabled={!selectedFile || faceStatus==='loading'} className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2.5 text-[10px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">{faceStatus==='loading'?'Loading free model…':'Run free face alignment'}</button>
                    <div className="mt-3 rounded-lg border border-sky-300/20 bg-sky-300/[.06] p-3">
                      <p className="text-[10px] font-bold text-sky-100">Need help making this photo more front-facing?</p>
                      <p className="mt-1 text-[9px] leading-4 text-[#AAB8C0]">Open ChatGPT, upload this same photo there, and ask it to prepare a passport-style result. Your photo is not transferred automatically.</p>
                      <button type="button" onClick={() => {
                        const prompt = "You are a professional passport and visa photo preparation assistant. Edit the photograph I upload into one clean, realistic, professional passport-style photograph suitable for document-photo review. Preserve the same person's identity, facial structure, natural features, skin tone and age. Never replace the face or beautify it into a different person. Correct genuine camera tilt, eye-line tilt and perspective only when clearly supported by the image. Center the head and shoulders, use a plain pure-white background, natural even lighting, realistic color and clear detail. Improve an old, dim or mildly blurry image conservatively without inventing details. Keep the full face visible and proportions natural. Do not add text, logos, borders, watermarks or decorative effects. If the face is strongly turned sideways, partly hidden, blurred beyond recovery, or unsuitable for reliable correction, do not fabricate a frontal face or hidden features; explain that a new front-facing photo is needed. Return one edited image for review. Important: this is a passport-style preparation, not a guarantee of compliance with every country's official photo rules.";
                        const chatUrl = 'https://chatgpt.com/?q=' + encodeURIComponent(prompt);
                        const chatTab = window.open(chatUrl, '_blank', 'noopener,noreferrer');
                        setFaceMessage(chatTab
                          ? 'ChatGPT opened with the prepared instruction. Attach the customer photo there and press Send.'
                          : 'Allow pop-ups for this site, then open chatgpt.com and attach the customer photo.');
                      }} className="mt-3 w-full rounded-lg border border-sky-300/30 bg-sky-300/10 px-3 py-2.5 text-[10px] font-extrabold text-sky-100">Open ChatGPT with ready prompt</button>
                    </div>
                    <div className="mt-3 rounded-lg border border-white/10 bg-black/15 p-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-200">{faceStatus==='loading'?'PROCESSING':faceStatus==='aligned'?'FACE DETECTED & STRAIGHTENED':faceStatus==='no-face'?'FACE NOT DETECTED':faceStatus==='multiple'?'MULTIPLE FACES':faceStatus==='error'?'MODEL UNAVAILABLE':'READY'}</p>
                      <p className="mt-1 text-[9px] leading-4 text-[#AAB8C0]">{faceMessage}</p>
                      {detectedTilt!==null&&<p className="mt-2 text-[9px] font-semibold tabular-nums text-emerald-200">Measured eye-line tilt: {detectedTilt.toFixed(1)}°</p>}
                    </div>
                    {processedPhotoUrl && <div className="mt-3 space-y-2"><div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-2.5"><p className="text-[9px] font-extrabold text-emerald-200">INDIAN PASSPORT PHOTO READY</p><p className="mt-1 text-[9px] text-[#C1CDD2]">{photoSize==='35x45'?'35 × 45 mm':photoSize==='35x35'?'35 × 35 mm':'2 × 2 inch'} · White canvas · 300-DPI pixel dimensions</p></div><button type="button" onClick={()=>setActiveTool('print')} className="w-full rounded-lg border border-emerald-300/35 bg-emerald-400/10 px-3 py-2.5 text-[10px] font-extrabold text-emerald-200">Open Print Sheet</button></div>}
    <p className="mt-3 text-[8px] leading-4 text-[#83919A]">First use downloads the model and WASM files. Processing runs locally; no API key, account, payment or photo upload is used. Strong side-angle selfies cannot be turned into a true front-facing face by this tool.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.06] p-3">
                    <div className="flex items-center gap-2 text-emerald-200"><Sparkles size={15}/><span className="text-[10px] font-extrabold uppercase tracking-wide">Print layout workspace</span></div>
                    <p className="mt-2 text-[10px] leading-5 text-[#C1CDD2]">Choose a paper size and photo count. Use the mouse wheel over the paper to zoom the sheet; click a photo first to select it before using the wheel to resize that photo. Outside the paper, scroll normally. Print at 100% / Actual Size.</p>
                  </div>
                )}

                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <p className="mb-3 text-[10px] font-bold tracking-wide text-[#D4DCE1]">SIGNATURE ON PHOTO</p>
                  {signatureFile ? <div className="flex items-center gap-2"><img src={signatureUrl} alt="Signature" className="h-10 w-16 rounded bg-white object-contain p-1"/><span className="min-w-0 flex-1 truncate text-[9px] text-[#C8D1D9]">{signatureFile.name}</span><button type="button" onClick={() => { setSignatureFile(null); setSignatureProcessedUrl(''); setMergedPhotoUrl(''); }} className="rounded p-1 text-rose-300" aria-label="Remove signature"><X size={14}/></button></div> : <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#52615F] px-3 py-3 text-[10px] font-bold text-emerald-300 hover:bg-emerald-400/5"><ImagePlus size={14}/> Add signature image<input type="file" accept="image/*" className="sr-only" onChange={handleSignatureChange}/></label>}
                  <button type="button" disabled={!signatureFile} onClick={() => setSignatureVisible(value => !value)} className="mt-2 flex w-full items-center justify-between rounded-lg border border-[#46535C] px-3 py-2 text-[9px] font-semibold text-[#C3CDD3] disabled:opacity-40"><span>Show signature on preview</span><span className="text-emerald-300">{signatureVisible ? 'ON' : 'OFF'}</span></button>
                  <p className="mt-2 text-[8px] leading-4 text-[#83919A]">Drag the signature on the photo. Use Signature Studio for background cleanup, size, rotation and Merge.</p>
                  <button type="button" onClick={()=>setActiveTool('signature')} className="mt-2 w-full rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-[9px] font-bold text-emerald-200">Open Signature Studio</button>
                </div>



                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <p className="mb-3 text-[10px] font-bold tracking-wide text-[#D4DCE1]">WORKFLOW</p>
                  <div className="space-y-3">
                    {WORKFLOW_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const active = index === 0;
                      return <div key={step.label} className="flex items-center gap-2.5">
                        <span className={active ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20' : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#303940] text-[#83919A]'}><Icon size={15}/></span>
                        <div className="min-w-0 flex-1"><p className={active ? 'text-[10px] font-bold text-emerald-300' : 'text-[10px] font-bold text-[#B4BEC5]'}>{step.label}</p><p className="text-[9px] text-[#7F8C95]">{step.detail}</p></div>
                        {active && <Check size={13} className="text-emerald-300"/>}
                      </div>;
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-sky-300/15 bg-sky-300/[.05] p-3">
                  <div className="flex items-center gap-2 text-sky-200"><ShieldCheck size={14}/><span className="text-[10px] font-bold">Privacy-first preview</span></div>
                  <p className="mt-1.5 text-[9px] leading-4 text-[#94A3AD]">The selected image is previewed locally in this browser. This screen does not upload it to a server.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

      </div>

      {exportModalOpen&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="export-dialog-title">
        <div className="w-full max-w-lg rounded-2xl border border-[#46535C] bg-[#20282E] p-4 shadow-2xl sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-emerald-300">TANSHU ONLINE · EXPORT STUDIO</p><h2 id="export-dialog-title" className="mt-1 text-lg font-extrabold text-white">{exportTarget==='photo'?'Export Passport Photo':'Export Print Sheet'}</h2><p className="mt-1 text-[10px] leading-5 text-[#AAB8C0]">Choose output format and print quality. Physical dimensions stay at Actual Size / 100%.</p></div><button type="button" onClick={()=>setExportModalOpen(false)} aria-label="Close export options" className="rounded-lg border border-white/10 p-2 text-[#C8D1D9] hover:bg-white/5"><X size={16}/></button></div>
          <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/[.06] p-3">
            <label className="mb-2 block text-[10px] font-bold text-emerald-100">PRINT / EXPORT QUALITY</label>
            <select value={exportQuality} onChange={event=>setExportQuality(event.target.value as typeof exportQuality)} className="h-10 w-full rounded-lg border border-[#46535C] bg-[#171D22] px-3 text-xs font-bold text-white outline-none focus:border-emerald-400">
              <option value="standard">Standard · 200 DPI · Smaller file</option><option value="high">High Quality · 300 DPI · Recommended</option><option value="very-high">Very High · 360 DPI · Extra detail</option><option value="ultra">Ultra · 450 DPI · Largest output</option>
            </select>
            <p className="mt-2 text-[9px] leading-4 text-[#AAB8C0]">Higher DPI creates a larger output file; it cannot restore detail missing from the original photo.</p>
            {exportTarget==='photo'&&<label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-[#46535C] px-3 py-2.5 text-[10px] font-semibold text-[#D4DCE1]"><input type="checkbox" checked={export20KbTarget} onChange={event=>setExport20KbTarget(event.target.checked)} className="accent-emerald-400"/> JPG target: approximately 20 KB (best possible clarity)</label>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" disabled={exportBusy} onClick={()=>runExport('pdf')} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-3 text-xs font-extrabold text-emerald-100 hover:bg-emerald-400/15 disabled:opacity-40"><FileImage size={16}/> Download PDF</button>
            <button type="button" disabled={exportBusy} onClick={()=>runExport('jpg')} className="flex items-center justify-center gap-2 rounded-xl border border-[#52616A] bg-[#29343B] px-3 py-3 text-xs font-extrabold text-white hover:bg-[#34424B] disabled:opacity-40"><Download size={16}/> Download JPG</button>
            <button type="button" disabled={exportBusy} onClick={()=>runExport('png')} className="flex items-center justify-center gap-2 rounded-xl border border-[#52616A] bg-[#29343B] px-3 py-3 text-xs font-extrabold text-white hover:bg-[#34424B] disabled:opacity-40"><Download size={16}/> Download PNG</button>
            <button type="button" disabled={exportBusy} onClick={()=>runExport('print')} className="flex items-center justify-center gap-2 rounded-xl border border-sky-300/30 bg-sky-300/10 px-3 py-3 text-xs font-extrabold text-sky-100 hover:bg-sky-300/15 disabled:opacity-40"><FileImage size={16}/> Print</button>
          </div>
          {exportBusy&&<p className="mt-3 text-center text-[10px] font-semibold text-emerald-200">Preparing high-quality output…</p>}
          <p className="mt-3 text-[9px] leading-4 text-[#87969F]">Print tip: select the matching paper size, disable “Fit to page” and choose Actual Size / 100%. Set printer quality to High or Best in the printer driver.</p>
          <button type="button" onClick={()=>setExportModalOpen(false)} disabled={exportBusy} className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-[10px] font-semibold text-[#BFC9D0] hover:bg-white/5">Cancel</button>
        </div>
      </div>}
    </main>
  );
};