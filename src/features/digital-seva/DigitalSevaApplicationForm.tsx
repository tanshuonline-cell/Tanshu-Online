import React, { useEffect, useMemo, useRef, useState } from 'react';
import { containsForbiddenAadhaarAddressInstruction, formatEnglishTitleCase, getRequiredCorrectionFieldKeys, getRequiredServiceFieldKeys, isMeaningfulDescription, isValidAddress, isValidEmail, isValidMobile, isValidName, suggestHindiTransliteration, validateFieldByKey } from './smartValidation';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { SevaService } from './serviceCatalog';
import { CORRECTION_OPTIONS, getServiceDocumentOptions } from './serviceApplicationSchema';
import BookingPolicyConsent, { TERMS_POLICY_VERSION, REFUND_POLICY_VERSION } from './BookingPolicyConsent';
import { deleteDigitalSevaDraft, loadDigitalSevaDraft, saveDigitalSevaDraft } from './digitalSevaDraftStore';

type RequesterType = 'DIRECT_CUSTOMER' | 'CYBER_CAFE' | 'CSC_CENTER' | 'INDEPENDENT_AGENT';
type ApplicationFor = 'SELF' | 'CUSTOMER';
interface Contact { name: string; phone: string; email: string; }
interface Props { service: SevaService; language: 'en' | 'hi'; onSubmitted: (reference: string) => void; }
const emptyContact = (): Contact => ({ name: '', phone: '', email: '' });
const phoneValid = (v: string) => /^\d{10}$/.test(v.replace(/\D/g, ''));
const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const BILINGUAL_FIELD_KEYS = new Set(["docRelationName","hofName","panApplicantName","panFatherName","panMotherName","incomeFatherName","incomeMotherName","casteFatherName","casteMotherName","ancestorName","aadhaarRecordedName","requestedCo","voterRelativeName","aadhaarHouse","aadhaarVillage","aadhaarDistrict","aadhaarState","aadhaarArea","aadhaarLandmark","aadhaarPostOffice","panAddress","voterAddress","certificateDistrict","certificateSubdivision","certificateBlock","certificateLocalBody","certificateVillage","certificatePostOffice","certificatePoliceStation","residenceDistrict","residenceSubdivision","residenceBlock","residenceVillageWard","residencePostOffice","residencePoliceStation","rationDistrict","rationBlock","rationVillageWard","rationPostOffice"]);


export default function DigitalSevaApplicationForm({ service, language, onSubmitted }: Props) {
  const hi = language === 'hi';
  const [step, setStep] = useState(0);
  const [requesterType, setRequesterType] = useState<RequesterType | ''>('');
  const [applicationFor, setApplicationFor] = useState<ApplicationFor>('SELF');
  const [operator, setOperator] = useState<Contact>(emptyContact());
  const [centerName, setCenterName] = useState('');
  const [centerAddress, setCenterAddress] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agencyAddress, setAgencyAddress] = useState('');
  const [applicant, setApplicant] = useState<Contact>(emptyContact());
  const [corrections, setCorrections] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [documentFiles, setDocumentFiles] = useState<Record<string, File>>({});
  const [otherDocumentName, setOtherDocumentName] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [serviceOptions, setServiceOptions] = useState<Record<string, string>>({});
  const [bookingConsent, setBookingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);
  const [refundAccepted, setRefundAccepted] = useState(false);
  const [refundAcceptedAt, setRefundAcceptedAt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftReady, setDraftReady] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const draftStateRef = useRef<Record<string, unknown>>({});
  const completedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const manuallyEditedHindiFieldsRef = useRef<Set<string>>(new Set());
  useEffect(() => { const key = Object.keys(fieldErrors)[0]; if (!key) return; const target = formRef.current?.querySelector<HTMLElement>(`[data-validation-key="${key}"]`); if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.focus({ preventScroll: true }); } }, [fieldErrors]);

  useEffect(() => {
    let active = true;
    completedRef.current = false;
    setDraftReady(false);
    setDraftRestored(false);
    loadDigitalSevaDraft(service.id).then((saved) => {
      if (!active) return;
      if (saved?.data) {
        const d = saved.data as any;
        setStep(Number.isInteger(d.step) ? d.step : 0);
        setRequesterType(d.requesterType || '');
        setApplicationFor(d.applicationFor || 'SELF');
        setOperator(d.operator || emptyContact());
        setCenterName(d.centerName || '');
        setCenterAddress(d.centerAddress || '');
        setAgencyName(d.agencyName || '');
        setAgencyAddress(d.agencyAddress || '');
        setApplicant(d.applicant || emptyContact());
        setCorrections(Array.isArray(d.corrections) ? d.corrections : []);
        setSelectedDocuments(Array.isArray(d.selectedDocuments) ? d.selectedDocuments : []);
        setDocumentFiles(d.documentFiles || {});
        setOtherDocumentName(d.otherDocumentName || '');
        setTaskDetails(d.taskDetails || '');
        setFieldValues(d.fieldValues || {});
        manuallyEditedHindiFieldsRef.current = new Set(Array.isArray(d.manualHindiFields) ? d.manualHindiFields : []);
        setServiceOptions(d.serviceOptions || {});
        setBookingConsent(Boolean(d.bookingConsent));
        setTermsAccepted(Boolean(d.termsAccepted));
        setTermsAcceptedAt(typeof d.termsAcceptedAt === 'string' ? d.termsAcceptedAt : null);
        setRefundAccepted(Boolean(d.refundAccepted));
        setRefundAcceptedAt(typeof d.refundAcceptedAt === 'string' ? d.refundAcceptedAt : null);
        setDraftRestored(true);
      }
      setDraftReady(true);
    }).catch(() => {
      if (active) setDraftReady(true);
    });
    return () => { active = false; };
  }, [service.id]);

  useEffect(() => {
    if (!draftReady || completedRef.current) return;
    const data = {
      step, requesterType, applicationFor, operator, centerName, centerAddress,
      agencyName, agencyAddress, applicant, corrections, selectedDocuments,
      documentFiles, otherDocumentName, taskDetails, fieldValues, serviceOptions,
      manualHindiFields: Array.from(manuallyEditedHindiFieldsRef.current), bookingConsent, termsAccepted, termsAcceptedAt, refundAccepted, refundAcceptedAt
    };
    draftStateRef.current = data;
    const persist = () => {
      if (!completedRef.current) void saveDigitalSevaDraft(service.id, draftStateRef.current).catch(() => {});
    };
    const timer = window.setTimeout(persist, 300);
    const onPageHide = () => persist();
    const onVisibilityChange = () => { if (document.visibilityState === 'hidden') persist(); };
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [service.id, draftReady, step, requesterType, applicationFor, operator, centerName, centerAddress, agencyName, agencyAddress, applicant, corrections, selectedDocuments, documentFiles, otherDocumentName, taskDetails, fieldValues, serviceOptions, bookingConsent, termsAccepted, termsAcceptedAt, refundAccepted, refundAcceptedAt]);

  useEffect(() => () => {
    if (!completedRef.current && Object.keys(draftStateRef.current).length) {
      void saveDigitalSevaDraft(service.id, draftStateRef.current).catch(() => {});
    }
  }, [service.id]);

  const correctionsForService = CORRECTION_OPTIONS[service.id] || [];
  const documents = useMemo(() => getServiceDocumentOptions(service.id, corrections)
    .filter((item) => item.id !== 'previous-certificate' || ['SDO', 'DM'].includes(serviceOptions.level)),
    [service.id, corrections, serviceOptions.level]);
  const intermediary = requesterType !== '' && requesterType !== 'DIRECT_CUSTOMER';
  const isOwnWork = !intermediary || applicationFor === 'SELF';
  const requesterOptions = [
    { value: 'DIRECT_CUSTOMER', label: 'Direct Customer', hi: 'सीधे ग्राहक' },
    { value: 'CYBER_CAFE', label: 'Cyber Cafe Operator', hi: 'साइबर कैफे संचालक' },
    { value: 'CSC_CENTER', label: 'CSC Center Operator', hi: 'CSC सेंटर संचालक' },
    { value: 'INDEPENDENT_AGENT', label: 'Independent Agent', hi: 'स्वतंत्र एजेंट' }
  ];
  const updateContact = (setter: React.Dispatch<React.SetStateAction<Contact>>, key: keyof Contact, value: string) =>
    setter((old) => ({ ...old, [key]: value }));
  const updateOperator = (key: keyof Contact, value: string) => {
    updateContact(setOperator, key, value);
    if (applicationFor === 'SELF') updateContact(setApplicant, key, value);
  };
  const changeApplicationFor = (value: ApplicationFor) => {
    setApplicationFor(value);
    setApplicant(value === 'SELF' ? { ...operator } : emptyContact());
  };
  const clearFieldError = (key: string) => { setError(''); setFieldErrors((old) => { if (!old[key]) return old; const next = { ...old }; delete next[key]; return next; }); };
  const setField = (key: string, value: string) => { setFieldValues((old) => ({ ...old, [key]: value })); clearFieldError(key); };
  const setBilingualEnglish = (key: string, value: string) => {
    setField(key, value);
    if (!manuallyEditedHindiFieldsRef.current.has(key)) setField(`${key}Hindi`, suggestHindiTransliteration(value));
  };
  const setBilingualHindi = (key: string, value: string) => {
    if (value.trim()) manuallyEditedHindiFieldsRef.current.add(key);
    else manuallyEditedHindiFieldsRef.current.delete(key);
    setField(`${key}Hindi`, value);
  };
  const setOption = (key: string, value: string) => { setServiceOptions((old) => ({ ...old, [key]: value })); clearFieldError(key); };
  const formatFieldOnBlur = (key: string, value: string) => {
    const normalizedKey = key.toLowerCase();
    const shouldFormat = /(name|address|house|area|landmark|district|subdivision|block|village|town|city|postoffice|policestation|localbody|ward|occupation|profession|purpose|scheme)/.test(normalizedKey);
    if (!shouldFormat) return value;
    return normalizedKey === 'familymembernames'
      ? value.split(/\r?\n/).map((line) => formatEnglishTitleCase(line)).join('\n')
      : formatEnglishTitleCase(value);
  };
  const startNewApplication = async () => {
    completedRef.current = true;
    try { await deleteDigitalSevaDraft(service.id); } catch { /* continue with a fresh in-memory form */ }
    setStep(0);
    setRequesterType('');
    setApplicationFor('SELF');
    setOperator(emptyContact());
    setCenterName('');
    setCenterAddress('');
    setAgencyName('');
    setAgencyAddress('');
    setApplicant(emptyContact());
    setCorrections([]);
    setSelectedDocuments([]);
    setDocumentFiles({});
    setOtherDocumentName('');
    setTaskDetails('');
    setFieldValues({});
    manuallyEditedHindiFieldsRef.current.clear();
    setServiceOptions({});
    setBookingConsent(false);
    setTermsAccepted(false);
    setTermsAcceptedAt(null);
    setRefundAccepted(false);
    setRefundAcceptedAt(null);
    setError('');
    setFieldErrors({});
    setDraftRestored(false);
    draftStateRef.current = {};
    completedRef.current = false;
  };

  const changeCorrection = (id: string, checked: boolean) => {
    const next = checked ? [...corrections, id] : corrections.filter((value) => value !== id);
    setCorrections(next);
    const validDocuments = new Set(getServiceDocumentOptions(service.id, next).map((item) => item.id));
    setSelectedDocuments((old) => old.filter((value) => value === 'other' || validDocuments.has(value)));
    setDocumentFiles((old) => Object.fromEntries(Object.entries(old).filter(([key]) => key === 'other' || validDocuments.has(key))));
  };

  const validateStep = () => {
    setFieldErrors({});
    const reject = (key: string, message: string) => { setFieldErrors({ [key]: message }); setError(message); return message; };
    const requiredMessages: Record<string, string> = {
      existingPanNumber: 'मौजूदा PAN नंबर भरें।', aadhaarNumber: '12 अंकों का Aadhaar नंबर भरें।', hofAadhaarNumber: 'परिवार के मुखिया का 12 अंकों का Aadhaar नंबर भरें।', panApplicantName: 'आवेदक का सही नाम भरें।', panDob: 'जन्मतिथि भरें।', panAddress: 'पत्राचार का पूरा पता भरें।',
      newMobile: 'नया मोबाइल नंबर भरें।', newEmail: 'नई ईमेल आईडी भरें।', incomeFatherName: 'पिता का नाम भरें।',
      casteFatherName: 'पिता का नाम भरें।', casteCategory: 'श्रेणी / जाति भरें।', casteName: 'जाति का नाम भरें।',
      certificateDistrict: 'जिला भरें।', certificateSubdivision: 'अनुमंडल भरें।', certificateBlock: 'प्रखंड भरें।', certificateVillage: 'गाँव / मोहल्ला भरें।', certificatePin: '6 अंकों का PIN कोड भरें।',
      aadhaarHouse: 'मकान / बिल्डिंग / अपार्टमेंट का विवरण भरें।', aadhaarVillage: 'गाँव / कस्बा / शहर भरें।', aadhaarDistrict: 'जिला भरें।', aadhaarState: 'राज्य भरें।', aadhaarPin: 'सही 6 अंकों का PIN कोड भरें।', aadhaarArea: 'एरिया / लोकैलिटी / सेक्टर भरें।', certificatePurpose: 'प्रमाणपत्र का उद्देश्य भरें।', residenceDistrict: 'जिला भरें।', residenceSubdivision: 'अनुमंडल भरें।', residenceBlock: 'प्रखंड भरें।', residenceVillageWard: 'गाँव / मोहल्ला / वार्ड भरें।', residencePin: '6 अंकों का PIN कोड भरें।',
      voterDob: 'जन्मतिथि भरें।', voterAddress: 'निवास का पूरा पता भरें।', voterRelativeName: 'रिश्तेदार का नाम भरें।',
      familyMemberCount: 'परिवार के सदस्यों की संख्या भरें।', familyMemberNames: 'परिवार के सदस्यों के नाम भरें।', rationDistrict: 'जिला भरें।', rationBlock: 'प्रखंड भरें।', rationVillageWard: 'गाँव / वार्ड / मोहल्ला भरें।', rationPin: '6 अंकों का PIN कोड भरें।',
      hofRelation: 'परिवार के मुखिया से संबंध चुनें।', hofName: 'मुखिया का नाम भरें।', currentCo: 'मौजूदा C/O विवरण भरें।',
      certificateNumber: 'प्रमाणपत्र संख्या भरें।', issuingOffice: 'जारी करने वाला कार्यालय भरें।', issueDate: 'जारी करने की तारीख भरें।',
      schemeName: 'योजना का नाम भरें।', formName: 'फॉर्म / भर्ती का नाम भरें।', websiteScope: 'वेबसाइट सेवा का प्रकार चुनें।', rationAction: 'राशन कार्ड बदलाव का प्रकार चुनें।'
    };
    const valueOf = (key: string) => fieldValues[key] ?? serviceOptions[key] ?? '';
    if (step === 0 && !requesterType) return reject('requesterType', 'कृपया आवेदन करने की श्रेणी चुनें।');
    if (step === 1) {
      if (intermediary) {
        if (!isValidName(operator.name)) return reject('operator.name', 'संचालक / एजेंट का सही नाम लिखें। हिंदी और अंग्रेज़ी दोनों स्वीकार हैं।');
        if (!isValidMobile(operator.phone)) return reject('operator.phone', 'संचालक का 10 अंकों का सही भारतीय मोबाइल नंबर लिखें।');
        if (!isValidEmail(operator.email)) return reject('operator.email', 'संचालक की सही ईमेल आईडी लिखें।');
      }
      if (intermediary && ['CYBER_CAFE', 'CSC_CENTER'].includes(requesterType)) {
        if (centerName.trim().length < 2) return reject('centerName', 'सेंटर का नाम भरें।');
        if (!isValidAddress(centerAddress)) return reject('centerAddress', 'सेंटर का पूरा पता लिखें।');
      }
      if (requesterType === 'INDEPENDENT_AGENT' && agencyName.trim().length < 2) return reject('agencyName', 'एजेंट / व्यवसाय का नाम भरें।');
      if (requesterType === 'INDEPENDENT_AGENT' && agencyAddress.trim() && !isValidAddress(agencyAddress)) return reject('agencyAddress', 'व्यवसाय का पूरा पता सही लिखें।');
      if (!isValidName(applicant.name)) return reject('applicant.name', 'आवेदक का सही नाम लिखें। हिंदी और अंग्रेज़ी दोनों स्वीकार हैं।');
      if (!isValidMobile(applicant.phone)) return reject('applicant.phone', 'आवेदक का 10 अंकों का सही भारतीय मोबाइल नंबर लिखें।');
      if (!isValidEmail(applicant.email)) return reject('applicant.email', 'आवेदक की सही ईमेल आईडी लिखें।');
    }
    if (step === 2) {
      if (correctionsForService.length && corrections.length === 0) return reject('corrections', 'कृपया बताएं कि किस विवरण में सुधार चाहिए।');
      if (service.id === 'voter-correction' && corrections.length > 4) return reject('corrections', 'Form 8 में अधिकतम चार सुधार चुनें।');
      if (['aadhaar-address-doc', 'aadhaar-address-hof', 'aadhaar-co'].includes(service.id) && (containsForbiddenAadhaarAddressInstruction(taskDetails) || Object.values(fieldValues).some(containsForbiddenAadhaarAddressInstruction) || Object.values(serviceOptions).some(containsForbiddenAadhaarAddressInstruction))) return reject('taskDetails', 'यह निर्देशात्मक वाक्य एड्रेस या आवेदन विवरण में स्वीकार नहीं है। कृपया केवल वास्तविक और सही जानकारी लिखें।');
      const correctionKeys = getRequiredCorrectionFieldKeys(corrections.filter((id) => !(['aadhaar-address-doc', 'aadhaar-address-hof'].includes(service.id) && id === 'address')));
      for (const key of correctionKeys) {
        if (!String(fieldValues[key] || '').trim()) return reject(key, key.endsWith('-current') ? 'मौजूदा विवरण भरें।' : 'सही नया विवरण भरें।');
      }
      if (!isMeaningfulDescription(taskDetails)) return reject('taskDetails', 'काम का स्पष्ट विवरण कम-से-कम 10 अक्षरों में, जैसे “PAN correction” या “नाम में सुधार”, लिखें।');
      if (selectedDocuments.includes('other') && otherDocumentName.trim().length < 2) return reject('otherDocumentName', 'अन्य दस्तावेज़ का नाम लिखें।');
      const attachedFiles = Object.values(documentFiles);
      if (attachedFiles.length > 8) return reject('documentFiles', 'एक बार में अधिकतम 8 दस्तावेज़ अपलोड करें।');
      if (attachedFiles.some((file) => file.size > 5 * 1024 * 1024)) return reject('documentFiles', 'हर दस्तावेज़ 5 MB या उससे कम होना चाहिए।');
      if (attachedFiles.reduce((sum, file) => sum + file.size, 0) > 20 * 1024 * 1024) return reject('documentFiles', 'सभी दस्तावेज़ों का कुल आकार 20 MB से अधिक नहीं होना चाहिए।');
      if (attachedFiles.some((file) => file.type && !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type))) return reject('documentFiles', 'केवल PDF, JPG और PNG फ़ाइल अपलोड करें।');

      for (const key of getRequiredServiceFieldKeys(service.id, serviceOptions)) {
        if (!String(valueOf(key)).trim()) return reject(key, requiredMessages[key] || 'यह जानकारी भरना अनिवार्य है।');
      }
      for (const [key, value] of Object.entries(fieldValues)) { const issue = validateFieldByKey(key, value); if (issue) return reject(key, issue); }
      for (const [key, value] of Object.entries(serviceOptions)) { const issue = validateFieldByKey(key, value); if (issue) return reject(key, issue); }
    }
    if (step === 3 && !bookingConsent) return reject('bookingConsent', 'संपर्क की सहमति स्वीकार करें।');
    if (step === 3 && !termsAccepted) return reject('termsAccepted', 'Terms & Conditions स्वीकार करें।');
    if (step === 3 && !refundAccepted) return reject('refundAccepted', 'Refund Policy की सहमति अलग से स्वीकार करें।');
    return '';
  };
  const next = () => {
    const message = validateStep();
    if (message) { setError(message); return; }
    setError('');
    setStep((n) => Math.min(3, n + 1));
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validateStep();
    if (message) { setError(message); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        serviceId: service.id, requesterType, applicationFor: isOwnWork ? 'SELF' : 'CUSTOMER',
        operator: intermediary ? {
          ...operator,
          centerName: ['CYBER_CAFE', 'CSC_CENTER'].includes(requesterType) ? centerName.trim() : null,
          centerAddress: ['CYBER_CAFE', 'CSC_CENTER'].includes(requesterType) ? centerAddress.trim() : null,
          agencyName: requesterType === 'INDEPENDENT_AGENT' ? agencyName.trim() : null,
          agencyAddress: requesterType === 'INDEPENDENT_AGENT' ? agencyAddress.trim() : null
        } : null,
        applicant, customerName: applicant.name.trim(), customerPhone: applicant.phone.replace(/\D/g, ''),
        customerEmail: applicant.email.trim(), corrections, fieldValues, serviceOptions,
        selectedDocuments, otherDocumentName: otherDocumentName.trim(), taskDetails: taskDetails.trim(),
        consent: bookingConsent, termsAccepted, termsAcceptedAt, termsPolicyVersion: TERMS_POLICY_VERSION,
        refundPolicyAccepted: refundAccepted, refundAcceptedAt, refundPolicyVersion: REFUND_POLICY_VERSION,
        idempotencyKey: window.crypto.randomUUID()
      };
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      const filesToUpload = Object.entries(documentFiles).filter(([documentType, file]) => selectedDocuments.includes(documentType) && file);
      formData.append('documentTypes', JSON.stringify(filesToUpload.map(([documentType]) => documentType)));
      filesToUpload.forEach(([, file]) => formData.append('documentFile', file, file.name));
      const response = await fetch('/api/digital-seva/bookings', {
        method: 'POST', credentials: 'same-origin', body: formData
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.bookingReference) throw new Error(data.error || 'Booking could not be saved. Please try again later.');
      completedRef.current = true;
      await deleteDigitalSevaDraft(service.id);
      onSubmitted(String(data.bookingReference));
    } catch (e: any) {
      setError(e?.message || (hi ? 'नेटवर्क समस्या। दोबारा कोशिश करें।' : 'Network error. Please try again.'));
    } finally { setSubmitting(false); }
  };

  const textInput = (key: string, label: string, labelHi: string) => {
    const bilingual = BILINGUAL_FIELD_KEYS.has(key) || /^(address|father-name|mother-name|relation-name)(-current|-correct)$/i.test(key);
    const isPin = /pin$/i.test(key);
    const isAadhaar = /aadhaarNumber/i.test(key);
    const isPan = /PanNumber/i.test(key);
    const englishValue = fieldValues[key] || '';
    const englishControl = key === 'familyMemberNames'
      ? <textarea data-validation-key={key} aria-invalid={Boolean(fieldErrors[key])} value={englishValue} onChange={(e) => setField(key, e.target.value)} onBlur={(e) => setField(key, formatFieldOnBlur(key, e.target.value))} rows={3} />
      : <input className={isPin ? 'ds-pin-input' : undefined} data-validation-key={key} aria-invalid={Boolean(fieldErrors[key])} inputMode={isPin || isAadhaar ? 'numeric' : undefined} maxLength={isPin ? 6 : isAadhaar ? 12 : isPan ? 10 : undefined} value={englishValue} onChange={(e) => setField(key, isPin || isAadhaar ? e.target.value.replace(/\D/g, '').slice(0, isPin ? 6 : 12) : isPan ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) : e.target.value)} onBlur={(e) => bilingual ? setBilingualEnglish(key, formatFieldOnBlur(key, e.target.value)) : setField(key, formatFieldOnBlur(key, e.target.value))} />;
    if (!bilingual) return <label key={key} className={fieldErrors[key] ? 'ds-field-invalid' : ''}>{hi ? labelHi : label}{englishControl}{fieldErrors[key] && <small className="ds-field-error" role="alert">{fieldErrors[key]}</small>}</label>;
    return <div key={key} className="ds-bilingual-pair">
      <label className={fieldErrors[key] ? 'ds-field-invalid' : ''}><span>English — {label}</span><input data-validation-key={key} aria-invalid={Boolean(fieldErrors[key])} value={englishValue} onChange={(e) => setBilingualEnglish(key, e.target.value)} onBlur={(e) => setBilingualEnglish(key, formatFieldOnBlur(key, e.target.value))} />{fieldErrors[key] && <small className="ds-field-error" role="alert">{fieldErrors[key]}</small>}</label>
      <label><span>हिंदी — {labelHi}</span><input data-validation-key={`${key}Hindi`} value={fieldValues[`${key}Hindi`] || ''} onChange={(e) => setBilingualHindi(key, e.target.value)} /></label>
    </div>;
  };
  const selectInput = (key: string, label: string, labelHi: string, opts: { value: string; label: string; hi: string }[]) => (
    <label key={key} className={fieldErrors[key] ? 'ds-field-invalid' : ''}>{hi ? labelHi : label}<select data-validation-key={key} aria-invalid={Boolean(fieldErrors[key])} value={serviceOptions[key] || ''} onChange={(e) => setOption(key, e.target.value)}><option value="">{hi ? 'चुनें' : 'Select'}</option>{opts.map((o) => <option key={o.value} value={o.value}>{hi ? o.hi : o.label}</option>)}</select>{fieldErrors[key] && <small className="ds-field-error" role="alert">{fieldErrors[key]}</small>}</label>
  );

  const renderServiceFields = () => (
    <>
      {service.id === 'pan-new' && <div className="ds-application-field-grid">
        {textInput('aadhaarNumber', 'Aadhaar number (12 digits)', 'आधार नंबर (12 अंक)')}
        {textInput('panApplicantName', 'Full name exactly as per Aadhaar', 'आधार के अनुसार पूरा नाम')}
        {textInput('panFatherName', "Father's full name", 'पिता का पूरा नाम')}
        {textInput('panMotherName', "Mother's full name", 'माता का पूरा नाम')}
        {textInput('panDob', 'Date of birth (DD/MM/YYYY)', 'जन्मतिथि (DD/MM/YYYY)')}
        {selectInput('panParentPrint', 'Parent name to print on PAN', 'PAN पर किसका नाम छपे', [
          { value: 'FATHER', label: 'Father', hi: 'पिता' }, { value: 'MOTHER', label: 'Mother', hi: 'माता' }
        ])}
        {textInput('panAddress', 'Communication address', 'पत्राचार का पता')}
      </div>}
      {['pan-correction', 'pan-photo-signature'].includes(service.id) && <div className="ds-application-field-grid">
        {textInput('existingPanNumber', 'Existing PAN number', 'मौजूदा PAN नंबर')}
        {textInput('aadhaarNumber', 'Aadhaar number (if applicable)', 'आधार नंबर (यदि लागू हो)')}
      </div>}
      {['aadhaar-address-doc', 'aadhaar-address-hof', 'aadhaar-co', 'aadhaar-mobile', 'aadhaar-email', 'aadhaar-download', 'aadhaar-pvc-assistance'].includes(service.id) && textInput('aadhaarNumber', 'Aadhaar number (12 digits)', 'आधार नंबर (12 अंक)')}
      {service.id === 'aadhaar-mobile' && textInput('newMobile', 'New mobile number (do not enter OTP)', 'नया मोबाइल नंबर (OTP न लिखें)')}
      {service.id === 'aadhaar-email' && textInput('newEmail', 'New email address', 'नई ईमेल आईडी')}
      {service.id === 'certificate-income' && <div className="ds-application-field-grid">
        {textInput('incomeFatherName', "Father's full name", 'पिता का पूरा नाम')}
        {textInput('incomeMotherName', "Mother's full name", 'माता का पूरा नाम')}
        {textInput('incomeApplicantOccupation', 'Applicant occupation / income source', 'आवेदक का पेशा / आय का स्रोत')}
        {textInput('incomeGovernment', 'Income from government service', 'सरकारी सेवा से आय')}
        {textInput('incomeAgriculture', 'Income from agriculture', 'कृषि से आय')}
        {textInput('incomeBusiness', 'Income from business', 'व्यवसाय से आय')}
        {textInput('incomeOther', 'Income from other sources', 'अन्य स्रोतों से आय')}
        {textInput('incomeAmount', 'Total annual income', 'कुल वार्षिक आय')}
        {textInput('incomePurpose', 'Purpose of certificate', 'प्रमाणपत्र का उद्देश्य')}
      </div>}
      {service.id === 'certificate-caste' && <div className="ds-application-field-grid">
        {textInput('casteFatherName', "Father's full name", 'पिता का पूरा नाम')}
        {textInput('casteMotherName', "Mother's full name", 'माता का पूरा नाम')}
        {textInput('casteProfession', 'Applicant profession', 'आवेदक का पेशा')}
        {textInput('casteCategory', 'Category / caste', 'श्रेणी / जाति')}
        {textInput('casteName', 'Caste name', 'जाति का नाम')}
        {textInput('casteSubcategory', 'Sub-caste (if applicable)', 'उपजाति (यदि लागू हो)')}
        {textInput('ancestorName', "Father's / ancestor's name in revenue record", 'राजस्व रिकॉर्ड में पिता / पूर्वज का नाम')}
      </div>}
      {['certificate-income', 'certificate-caste'].includes(service.id) && <div className="ds-application-field-grid">
        {textInput('certificateDistrict', 'District', 'जिला')}
        {textInput('certificateSubdivision', 'Sub-division', 'अनुमंडल')}
        {textInput('certificateBlock', 'Block', 'प्रखंड')}
        {textInput('certificateLocalBody', 'Panchayat / Municipality / Ward', 'पंचायत / नगर निकाय / वार्ड')}
        {textInput('certificateVillage', 'Village / Mohalla', 'गाँव / मोहल्ला')}
        {textInput('certificatePostOffice', 'Post office', 'डाकघर')}
        {textInput('certificatePoliceStation', 'Police station', 'थाना')}
        {textInput('certificatePin', 'PIN code', 'पिन कोड')}
      </div>}
      {service.id === 'certificate-residence' && <div className="ds-application-field-grid">
        {selectInput('residenceType', 'Residence type', 'निवास का प्रकार', [
          { value: 'PERMANENT', label: 'Permanent', hi: 'स्थायी' }, { value: 'TEMPORARY', label: 'Temporary', hi: 'अस्थायी' }
        ])}
        {textInput('certificatePurpose', 'Purpose of certificate', 'प्रमाणपत्र का उद्देश्य')}
        {textInput('residenceDistrict', 'District', 'जिला')}
        {textInput('residenceSubdivision', 'Sub-division', 'अनुमंडल')}
        {textInput('residenceBlock', 'Block', 'प्रखंड')}
        {textInput('residenceVillageWard', 'Village / Mohalla / Ward', 'गाँव / मोहल्ला / वार्ड')}
        {textInput('residencePostOffice', 'Post office', 'डाकघर')}
        {textInput('residencePoliceStation', 'Police station', 'थाना')}
        {textInput('residencePin', 'PIN code', 'पिन कोड')}
      </div>}
      {service.id === 'voter-correction' && textInput('epicNumber', 'Existing EPIC number (if available)', 'मौजूदा EPIC नंबर (यदि उपलब्ध हो)')}
      {service.id === 'voter-new' && <div className="ds-application-field-grid">
        {textInput('voterDob', 'Date of birth (DD/MM/YYYY)', 'जन्मतिथि (DD/MM/YYYY)')}
        {textInput('voterAddress', 'Ordinary residence address', 'सामान्य निवास का पता')}
        {textInput('voterRelativeName', "Father's / mother's / spouse's name", 'पिता / माता / पति-पत्नी का नाम')}
      </div>}
      {service.id === 'ration-new' && <div className="ds-application-field-grid">
        {textInput('familyMemberCount', 'Number of family members', 'परिवार के सदस्यों की संख्या')}
        {textInput('familyMemberNames', 'Family members names (one per line)', 'परिवार के सदस्यों के नाम (एक पंक्ति में एक)')}
        {textInput('rationDistrict', 'District', 'जिला')}
        {textInput('rationBlock', 'Block', 'प्रखंड')}
        {textInput('rationVillageWard', 'Village / Ward / Mohalla', 'गाँव / वार्ड / मोहल्ला')}
        {textInput('rationPostOffice', 'Post office', 'डाकघर')}
        {textInput('rationPin', 'PIN code', 'पिन कोड')}
      </div>}
      {service.id === 'aadhaar-lost' && textInput('aadhaarRecordedName', 'Name as recorded in Aadhaar (no Aadhaar number)', 'आधार में दर्ज नाम (आधार नंबर नहीं)')}
      {correctionsForService.length > 0 && <div className="ds-application-field-grid">
        {corrections.filter((id) => !(['aadhaar-address-doc', 'aadhaar-address-hof'].includes(service.id) && id === 'address')).map((id) => {
          const item = correctionsForService.find((x) => x.id === id);
          if (!item) return null;
          return <div className="ds-application-correction-fields" key={id}>
            <strong>{hi ? item.hindi : item.label}</strong>
            {textInput(id + '-current', 'Current detail', 'मौजूदा विवरण')}
            {textInput(id + '-correct', 'Correct detail', 'सही विवरण')}
          </div>;
        })}
      </div>}
      {['certificate-income', 'certificate-caste', 'certificate-residence'].includes(service.id) && <div className="ds-application-field-grid">
        {selectInput('level', 'Certificate level', 'प्रमाणपत्र का स्तर', [
          { value: 'CO', label: 'CO / Revenue Officer', hi: 'CO / राजस्व अधिकारी' },
          { value: 'SDO', label: 'SDO', hi: 'SDO' }, { value: 'DM', label: 'DM', hi: 'DM' }
        ])}
        {selectInput('applicationType', 'Application type', 'आवेदन का प्रकार', [
          { value: 'GENERAL', label: 'General', hi: 'सामान्य' }, { value: 'TATKAL', label: 'Tatkal (if available)', hi: 'तत्काल (यदि उपलब्ध हो)' }
        ])}
      </div>}
      {service.id === 'aadhaar-address-doc' && <div className="ds-application-field-grid">
        {textInput('docRelationName', "Father's name (enter the correct name only)", 'पिता का नाम (केवल सही नाम भरें)')}
      </div>}
      {service.id === 'aadhaar-address-hof' && <div className="ds-application-field-grid">
        {selectInput('hofRelation', 'Eligible relation to Head of Family', 'परिवार के मुखिया से संबंध चुनें', [
          { value: 'FATHER', label: 'Father', hi: 'पिता' }, { value: 'MOTHER', label: 'Mother', hi: 'माता' },
          { value: 'GUARDIAN', label: 'Legal guardian', hi: 'कानूनी अभिभावक' }, { value: 'SPOUSE', label: 'Spouse', hi: 'पति / पत्नी' },
          { value: 'CHILD', label: 'Child / ward', hi: 'बच्चा / आश्रित' }, { value: 'SIBLING', label: 'Sibling', hi: 'भाई / बहन' }
        ])}
        {textInput('hofName', 'Head of Family full name', 'परिवार के मुखिया का पूरा नाम')}
        {textInput('hofAadhaarNumber', 'Head of Family Aadhaar number (12 digits)', 'परिवार के मुखिया का आधार नंबर (12 अंक)')}
      </div>}
      {service.id === 'aadhaar-address-doc' && <div className="ds-address-choice-panel">
        <h4>{hi ? 'पते का विकल्प चुनें' : 'Choose address option'}</h4>
        <div className="ds-address-choice-options" role="radiogroup" aria-label={hi ? 'पता चुनें' : 'Choose address'}>
          <label className="ds-address-choice-option">
            <input type="radio" name="addressChoice" value="NEW" checked={serviceOptions.addressChoice === 'NEW'} onChange={() => setOption('addressChoice', 'NEW')} />
            <span>{hi ? 'नया पता (New Address)' : 'New Address'}</span>
          </label>
          <label className="ds-address-choice-option">
            <input type="radio" name="addressChoice" value="OLD" checked={serviceOptions.addressChoice === 'OLD'} onChange={() => setOption('addressChoice', 'OLD')} />
            <span>{hi ? 'पुराना पता (Old Address)' : 'Old Address'}</span>
          </label>
          <details className="ds-address-choice-info">
            <summary aria-label={hi ? 'पते के विकल्प की जानकारी' : 'Address choice information'} title={hi ? 'जानकारी' : 'More information'}>i</summary>
            <p>{hi
              ? 'पते में गाँव/शहर, PIN कोड, एरिया, मकान नंबर या कोई भी छोटा बदलाव करना हो, तो New Address चुनें। यदि ऑनलाइन दिख रहा मौजूदा पता बिना बदलाव रखना है, तो Old Address चुनें।'
              : 'Select New Address if even a small detail—such as village/city, PIN code, area or house number—needs to change. Select Old Address to keep the address currently shown online exactly as it is.'}</p>
          </details>
        </div>
      </div>}
      {(['aadhaar-address-hof'].includes(service.id) || (service.id === 'aadhaar-address-doc' && serviceOptions.addressChoice === 'NEW')) && <div className="ds-application-profile ds-address-profile">
        <h4>{hi ? 'जिस नए पते को अपडेट करवाना है, उसकी जानकारी भरें' : 'Enter the details of the new address you want updated'}</h4>
        <div className="ds-address-form-grid">
          {textInput('aadhaarHouse', 'House / Building / Apartment', 'मकान / बिल्डिंग / अपार्टमेंट')}
          {textInput('aadhaarVillage', 'Village / Town / City', 'गाँव / कस्बा / शहर')}
          {textInput('aadhaarDistrict', 'District', 'जिला')}
          {textInput('aadhaarState', 'State', 'राज्य')}
          {textInput('aadhaarPin', '6-digit PIN code', '6 अंकों का PIN कोड')}
          {textInput('aadhaarArea', 'Area / Locality / Sector', 'एरिया / लोकैलिटी / सेक्टर')}
          {textInput('aadhaarLandmark', 'Landmark (optional)', 'लैंडमार्क (वैकल्पिक)')}
          {textInput('aadhaarPostOffice', 'Post Office (if applicable)', 'डाकघर (यदि लागू हो)')}
        </div>
        <div className="ds-application-upload-notice" role="note">
          <span>{hi
            ? 'हर जानकारी उसके सामने दिए बॉक्स में अलग-अलग भरें। PIN कोड सही भरें; UIDAI पोर्टल पर PIN के अनुसार जिला और राज्य की पुष्टि करें। Village / Town / City और Post Office के लिए पोर्टल पर उपलब्ध आधिकारिक विकल्प ही चुनें; उन्हें मनमाने ढंग से न बदलें।'
            : 'Enter each detail in its own field. Use the correct PIN code and verify the district and state against it on the UIDAI portal. Select Village / Town / City and Post Office only from the official options available on the portal; do not manually alter those options.'}</span>
        </div>
      </div>}
      {service.id === 'aadhaar-co' && <div className="ds-application-field-grid">
        {selectInput('coRelation', 'Relation of the person named in C/O', 'C/O में नामित व्यक्ति से संबंध', [
          { value: 'FATHER', label: 'Father', hi: 'पिता' }, { value: 'MOTHER', label: 'Mother', hi: 'माता' },
          { value: 'HUSBAND', label: 'Husband', hi: 'पति' }, { value: 'WIFE', label: 'Wife', hi: 'पत्नी' },
          { value: 'UNCLE', label: 'Uncle (Chacha)', hi: 'चाचा' }, { value: 'MATERNAL_UNCLE', label: 'Maternal uncle (Mama)', hi: 'मामा' },
          { value: 'MAUSA', label: 'Mausa', hi: 'मौसा' }, { value: 'OTHER', label: 'Other relation', hi: 'अन्य रिश्ता' }
        ])}
        {textInput('requestedCo', "Person's name for C/O", 'C/O में जोड़े जाने वाले व्यक्ति का नाम')}
        <small>{hi ? 'UIDAI के वर्तमान प्रारूप में C/O वैकल्पिक है; अन्य पुराने prefix विकल्प यहाँ नहीं दिखाए जाएँगे।' : 'C/O is optional in the current UIDAI format; legacy prefix options are not shown here.'}</small>
      </div>}
      {service.id === 'ration-update' && <div className="ds-application-field-grid">
        {selectInput('rationAction', 'What needs to change?', 'क्या बदलाव करवाना है?', [
          { value: 'ADD_MEMBER', label: 'Add member', hi: 'सदस्य जोड़ना' }, { value: 'REMOVE_MEMBER', label: 'Remove member', hi: 'सदस्य हटाना' },
          { value: 'CORRECT_MEMBER', label: 'Correct member details', hi: 'सदस्य का विवरण सुधारना' },
          { value: 'ADDRESS', label: 'Address change', hi: 'पता बदलना' }, { value: 'OTHER', label: 'Other', hi: 'अन्य' }
        ])}
        {textInput('memberName', 'Affected member name', 'प्रभावित सदस्य का नाम')}
        {textInput('memberRelation', 'Relationship to family head', 'परिवार के मुखिया से संबंध')}
        {textInput('memberDob', 'Member date of birth (if relevant)', 'सदस्य की जन्मतिथि (यदि लागू हो)')}
      </div>}
      {service.id === 'certificate-correction' && <div className="ds-application-field-grid">
        {textInput('certificateNumber', 'Existing certificate number', 'मौजूदा प्रमाणपत्र संख्या')}
        {textInput('issuingOffice', 'Issuing office / authority', 'जारी करने वाला कार्यालय / प्राधिकरण')}
        {textInput('issueDate', 'Issue date', 'जारी करने की तारीख')}
      </div>}
      {service.id === 'scheme-check' && textInput('schemeName', 'Scheme name', 'योजना का नाम')}
      {service.id === 'online-form' && <div className="ds-application-field-grid">
        {textInput('formName', 'Form / recruitment / scheme name', 'फॉर्म / भर्ती / योजना का नाम')}
        {textInput('formLink', 'Official notification link (if available)', 'आधिकारिक अधिसूचना लिंक (यदि हो)')}
      </div>}
      {service.id === 'website-services' && <div className="ds-application-field-grid">
        {selectInput('websiteScope', 'Website service', 'वेबसाइट सेवा', [
          { value: 'DESIGN_ONLY', label: 'Website design only', hi: 'केवल वेबसाइट डिज़ाइन' },
          { value: 'COMPLETE_SETUP', label: 'Complete setup and launch', hi: 'पूरा सेटअप और लॉन्च' }
        ])}
        {selectInput('hosting', 'Hosting preference', 'होस्टिंग की पसंद', [
          { value: 'FREE', label: 'Free', hi: 'फ्री' }, { value: 'PAID', label: 'Paid', hi: 'पेड' }, { value: 'ADVICE', label: 'Need advice', hi: 'सलाह चाहिए' }
        ])}
        {selectInput('domain', 'Domain preference', 'डोमेन की पसंद', [
          { value: 'FREE_SUBDOMAIN', label: 'Free subdomain', hi: 'फ्री सबडोमेन' },
          { value: 'CUSTOM_DOMAIN', label: 'Paid custom domain', hi: 'पेड कस्टम डोमेन' }, { value: 'ADVICE', label: 'Need advice', hi: 'सलाह चाहिए' }
        ])}
      </div>}
      {service.id.startsWith('pdf-') && <div className="ds-application-field-grid">
        {textInput('pageRange', 'Page number / range', 'पेज नंबर / रेंज')}
        {textInput('targetSize', 'Target size / output format', 'लक्ष्य साइज / आउटपुट फॉर्मेट')}
      </div>}
      {['image-compress', 'signature-resize'].includes(service.id) && textInput('targetSize', 'Target KB / dimensions', 'लक्ष्य KB / आयाम')}
      {service.id === 'typing-format' && <div className="ds-application-field-grid">
        {selectInput('language', 'Typing language', 'टाइपिंग की भाषा', [
          { value: 'HINDI', label: 'Hindi', hi: 'हिंदी' }, { value: 'ENGLISH', label: 'English', hi: 'अंग्रेज़ी' },
          { value: 'BOTH', label: 'Hindi + English', hi: 'हिंदी + अंग्रेज़ी' }
        ])}
        {selectInput('outputFormat', 'Output format', 'आउटपुट फॉर्मेट', [
          { value: 'PDF', label: 'PDF', hi: 'PDF' }, { value: 'DOCX', label: 'Word (DOCX)', hi: 'Word (DOCX)' },
          { value: 'PRINT', label: 'Print copy', hi: 'प्रिंट कॉपी' }
        ])}
      </div>}
      {['bw-print', 'colour-print'].includes(service.id) && <div className="ds-application-field-grid">
        {textInput('pageRange', 'Page range', 'पेज रेंज')}{textInput('copies', 'Number of copies', 'कितनी कॉपी')}
        {selectInput('paper', 'Paper type', 'पेपर का प्रकार', [
          { value: 'A4', label: 'A4 normal paper', hi: 'A4 सामान्य पेपर' }, { value: 'PHOTO', label: 'Photo paper', hi: 'फोटो पेपर' },
          { value: 'OTHER', label: 'Other / confirm later', hi: 'अन्य / बाद में पुष्टि' }
        ])}
      </div>}
      <label className={`ds-application-wide ${fieldErrors.taskDetails ? 'ds-field-invalid' : ''}`}>{hi ? 'काम का पूरा विवरण / निर्देश' : 'Exact work / instructions'}
        <textarea data-validation-key="taskDetails" aria-invalid={Boolean(fieldErrors.taskDetails)} value={taskDetails} onChange={(e) => { setTaskDetails(e.target.value); clearFieldError('taskDetails'); }} rows={3} required placeholder={hi ? 'क्या काम करवाना है और कौन-सा विवरण सही होना चाहिए...' : 'What work is requested and what details should be correct...'} />
        {fieldErrors.taskDetails && <small className="ds-field-error" role="alert">{fieldErrors.taskDetails}</small>}
      </label>
    </>
  );

  if (!draftReady) return <div className="ds-application-upload-notice" role="status">{hi ? 'आपका सुरक्षित किया गया फॉर्म खोला जा रहा है…' : 'Restoring your saved application…'}</div>;

  return <form ref={formRef} className="ds-booking-form ds-application-form" onSubmit={submit} noValidate>
    {draftRestored && <div className="ds-application-upload-notice" role="status">
      <span>{hi ? 'आपका पिछला अधूरा फॉर्म इसी ब्राउज़र में वापस खुला है। आप जानकारी बदल सकते हैं। यदि यह नया ग्राहक है, तो नया आवेदन शुरू करें।' : 'Your previous unfinished application has been restored on this device. You can edit any details.'}</span>
      <button type="button" className="ds-application-copy" onClick={startNewApplication}>{hi ? 'नया आवेदन शुरू करें' : 'Start a new application'}</button>
    </div>}
    <div className="ds-application-progress">
      {['Submitting party', 'Contacts', 'Work & documents', 'Review & consent'].map((label, i) =>
        <div key={label} className={step === i ? 'active' : step > i ? 'complete' : ''}>
          <span>{step > i ? <CheckCircle2 size={14} /> : i + 1}</span><small>{hi ? ['कौन आवेदन कर रहा है', 'संपर्क जानकारी', 'काम और दस्तावेज़', 'जाँच और सहमति'][i] : label}</small>
        </div>)}
    </div>

    {step === 0 && <section className="ds-application-step">
      <span className="ds-kicker">{hi ? 'चरण 1' : 'STEP 1'}</span>
      <h3>{hi ? 'आप किस रूप में आवेदन कर रहे हैं?' : 'Who is submitting this request?'}</h3>
      <div className="ds-application-role-grid">
        {requesterOptions.map((o) => <button type="button" data-validation-key="requesterType" key={o.value} className={requesterType === o.value ? 'selected' : ''} onClick={() => { setRequesterType(o.value as RequesterType); setApplicationFor('SELF'); setError(''); }}>
          <strong>{hi ? o.hi : o.label}</strong><small>{o.value === 'DIRECT_CUSTOMER' ? (hi ? 'अपना काम सीधे करवाएँ' : 'Request your own service directly') : (hi ? 'अपना या किसी ग्राहक का काम' : 'Submit for yourself or a customer')}</small>
        </button>)}
      </div>
      {intermediary && <div className="ds-application-choice">
        <strong>{hi ? 'आप किसका काम करवाना चाहते हैं?' : 'Whose work are you arranging?'}</strong>
        <label><input type="radio" name="applicationFor" checked={applicationFor === 'SELF'} onChange={() => setApplicationFor('SELF')} /> {hi ? 'अपना काम' : 'My own work'}</label>
        <label><input type="radio" name="applicationFor" checked={applicationFor === 'CUSTOMER'} onChange={() => changeApplicationFor('CUSTOMER')} /> {hi ? 'किसी दूसरे ग्राहक का काम' : 'Another customer’s work'}</label>
      </div>}
    </section>}

    {step === 1 && <section className="ds-application-step">
      <span className="ds-kicker">{hi ? 'चरण 2' : 'STEP 2'}</span><h3>{hi ? 'संचालक और वास्तविक आवेदक की जानकारी' : 'Submitter and actual applicant details'}</h3>
      {intermediary && <div className="ds-application-profile">
        <h4>{hi ? 'संचालक / एजेंट की जानकारी' : 'Operator / agent details'}</h4>
        <div className="ds-application-field-grid">
          <label className={fieldErrors['operator.name'] ? 'ds-field-invalid' : ''}>{hi ? 'पूरा नाम *' : 'Full name *'}<input data-validation-key="operator.name" aria-invalid={Boolean(fieldErrors['operator.name'])} value={operator.name} onChange={(e) => { updateOperator('name', e.target.value); clearFieldError('operator.name'); }} onBlur={(e) => updateOperator('name', formatEnglishTitleCase(e.target.value))} required />{fieldErrors['operator.name'] && <small className="ds-field-error">{fieldErrors['operator.name']}</small>}</label>
          <label className={fieldErrors['operator.phone'] ? 'ds-field-invalid' : ''}>{hi ? 'मोबाइल नंबर *' : 'Mobile number *'}<input data-validation-key="operator.phone" aria-invalid={Boolean(fieldErrors['operator.phone'])} inputMode="numeric" value={operator.phone} onChange={(e) => { updateOperator('phone', e.target.value); clearFieldError('operator.phone'); }} required />{fieldErrors['operator.phone'] && <small className="ds-field-error">{fieldErrors['operator.phone']}</small>}</label>
          <label className={fieldErrors['operator.email'] ? 'ds-field-invalid' : ''}>{hi ? 'ईमेल आईडी *' : 'Email address *'}<input data-validation-key="operator.email" aria-invalid={Boolean(fieldErrors['operator.email'])} type="email" value={operator.email} onChange={(e) => { updateOperator('email', e.target.value); clearFieldError('operator.email'); }} required />{fieldErrors['operator.email'] && <small className="ds-field-error">{fieldErrors['operator.email']}</small>}</label>
          {['CYBER_CAFE', 'CSC_CENTER'].includes(requesterType) && <>
            <label className={fieldErrors.centerName ? 'ds-field-invalid' : ''}>{hi ? 'सेंटर का नाम *' : 'Centre name *'}<input data-validation-key="centerName" value={centerName} onChange={(e) => { setCenterName(e.target.value); clearFieldError('centerName'); }} onBlur={(e) => setCenterName(formatEnglishTitleCase(e.target.value))} required />{fieldErrors.centerName && <small className="ds-field-error">{fieldErrors.centerName}</small>}</label>
            <label className={`ds-application-wide ${fieldErrors.centerAddress ? 'ds-field-invalid' : ''}`}>{hi ? 'सेंटर का पूरा पता *' : 'Full centre address *'}<textarea data-validation-key="centerAddress" value={centerAddress} onChange={(e) => { setCenterAddress(e.target.value); clearFieldError('centerAddress'); }} onBlur={(e) => setCenterAddress(formatEnglishTitleCase(e.target.value))} rows={2} required />{fieldErrors.centerAddress && <small className="ds-field-error">{fieldErrors.centerAddress}</small>}</label>
          </>}
          {requesterType === 'INDEPENDENT_AGENT' && <>
            <label className={fieldErrors.agencyName ? 'ds-field-invalid' : ''}>{hi ? 'एजेंसी / व्यवसाय का नाम *' : 'Agency / business name *'}<input data-validation-key="agencyName" value={agencyName} onChange={(e) => { setAgencyName(e.target.value); clearFieldError('agencyName'); }} onBlur={(e) => setAgencyName(formatEnglishTitleCase(e.target.value))} required />{fieldErrors.agencyName && <small className="ds-field-error">{fieldErrors.agencyName}</small>}</label>
            <label className={`ds-application-wide ${fieldErrors.agencyAddress ? 'ds-field-invalid' : ''}`}>{hi ? 'व्यवसाय का पता (वैकल्पिक)' : 'Business address (optional)'}<textarea data-validation-key="agencyAddress" value={agencyAddress} onChange={(e) => { setAgencyAddress(e.target.value); clearFieldError('agencyAddress'); }} onBlur={(e) => setAgencyAddress(formatEnglishTitleCase(e.target.value))} rows={2} />{fieldErrors.agencyAddress && <small className="ds-field-error">{fieldErrors.agencyAddress}</small>}</label>
          </>}
        </div>
      </div>}
      <div className="ds-application-profile">
        <div className="ds-application-profile-heading"><h4>{hi ? 'वास्तविक आवेदक / ग्राहक' : 'Actual applicant / customer'}</h4>
          {intermediary && <button type="button" className="ds-application-copy" onClick={() => setApplicant({ ...operator })} disabled={!isOwnWork}>{hi ? 'संचालक की जानकारी कॉपी करें' : 'Copy operator details'}</button>}
        </div>
        <div className="ds-application-field-grid">
          <label className={fieldErrors['applicant.name'] ? 'ds-field-invalid' : ''}>{hi ? 'पूरा नाम *' : 'Full name *'}<input data-validation-key="applicant.name" aria-invalid={Boolean(fieldErrors['applicant.name'])} value={applicant.name} onChange={(e) => { updateContact(setApplicant, 'name', e.target.value); clearFieldError('applicant.name'); }} onBlur={(e) => updateContact(setApplicant, 'name', formatEnglishTitleCase(e.target.value))} required />{fieldErrors['applicant.name'] && <small className="ds-field-error">{fieldErrors['applicant.name']}</small>}</label>
          <label className={fieldErrors['applicant.phone'] ? 'ds-field-invalid' : ''}>{hi ? 'मोबाइल नंबर *' : 'Mobile number *'}<input data-validation-key="applicant.phone" aria-invalid={Boolean(fieldErrors['applicant.phone'])} inputMode="numeric" value={applicant.phone} onChange={(e) => { updateContact(setApplicant, 'phone', e.target.value); clearFieldError('applicant.phone'); }} required />{fieldErrors['applicant.phone'] && <small className="ds-field-error">{fieldErrors['applicant.phone']}</small>}</label>
          <label className={fieldErrors['applicant.email'] ? 'ds-field-invalid' : ''}>{hi ? 'ईमेल आईडी *' : 'Email address *'}<input data-validation-key="applicant.email" aria-invalid={Boolean(fieldErrors['applicant.email'])} type="email" value={applicant.email} onChange={(e) => { updateContact(setApplicant, 'email', e.target.value); clearFieldError('applicant.email'); }} required />{fieldErrors['applicant.email'] && <small className="ds-field-error">{fieldErrors['applicant.email']}</small>}</label>
        </div>
        {isOwnWork && intermediary && <p className="ds-application-note">{hi ? 'अपना काम चुनने पर संचालक की जानकारी कॉपी करें, ताकि दोनों रिकॉर्ड सही रहें।' : 'For your own work, copy the operator details so both records are retained separately.'}</p>}
      </div>
    </section>}

    {step === 2 && <section className="ds-application-step">
      <span className="ds-kicker">{hi ? 'चरण 3' : 'STEP 3'}</span><h3>{hi ? 'काम का विवरण और उपलब्ध दस्तावेज़' : 'Work details and available documents'}</h3>
      {correctionsForService.length > 0 && <div className="ds-application-profile">
        <h4>{hi ? 'किस विवरण में सुधार करवाना है?' : 'Which details need correction?'}</h4>
        <p>{hi ? 'एक या एक से अधिक विकल्प चुनें। उसी के अनुसार दस्तावेज़ों की सूची बदलेगी।' : 'Select one or more options. The document checklist will update to match your selections.'}</p>
        <div className="ds-application-doc-list">
          {correctionsForService.map((option) => <label key={option.id} className="ds-application-doc-option">
            <input type="checkbox" checked={corrections.includes(option.id)} disabled={!corrections.includes(option.id) && service.id === 'voter-correction' && corrections.length >= 4} onChange={(e) => changeCorrection(option.id, e.target.checked)} />
            <span><strong>{hi ? option.hindi : option.label}</strong></span>
          </label>)}
        </div>
      </div>}
      {renderServiceFields()}
      <div className="ds-application-profile">
        <h4>{hi ? 'आपके पास कौन-कौन से दस्तावेज़ उपलब्ध हैं?' : 'Which documents do you currently have?'}</h4>
        <p>{hi ? 'सिर्फ वही विकल्प टिक करें जो वास्तव में आपके पास हैं। अंतिम स्वीकार्यता विभाग के नियमों से जाँची जाएगी।' : 'Tick only documents you actually have. Final acceptance is checked against the current official rules.'}</p>
        <div className="ds-application-doc-list">
          {documents.map((item) => <div key={item.id} className="ds-application-doc-row">
            <label className="ds-application-doc-option">
              <input type="checkbox" checked={selectedDocuments.includes(item.id)} onChange={(e) => {
                const checked = e.target.checked;
                setSelectedDocuments((old) => checked ? [...old, item.id] : old.filter((x) => x !== item.id));
                if (!checked) setDocumentFiles((old) => { const next = { ...old }; delete next[item.id]; return next; });
              }} />
              <span><strong>{hi ? item.hindi : item.label}{item.required ? ' *' : ''}</strong><small>{hi ? item.purposeHindi : item.purpose}</small></span>
            </label>
            {selectedDocuments.includes(item.id) && <label className="ds-application-file-upload">{hi ? 'फ़ाइल चुनें (वैकल्पिक)' : 'Choose file (optional)'}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(e) => {
                const file = e.target.files?.[0];
                setDocumentFiles((old) => { const next = { ...old }; if (file) next[item.id] = file; else delete next[item.id]; return next; });
                clearFieldError('documentFiles');
              }} />
              {documentFiles[item.id] && <small>{documentFiles[item.id].name} · {(documentFiles[item.id].size / 1024 / 1024).toFixed(2)} MB</small>}
            </label>}
          </div>)}
          <label className="ds-application-doc-option"><input type="checkbox" checked={selectedDocuments.includes('other')} onChange={(e) => {
            const checked = e.target.checked;
            setSelectedDocuments((old) => checked ? [...old, 'other'] : old.filter((x) => x !== 'other'));
            if (!checked) setDocumentFiles((old) => { const next = { ...old }; delete next.other; return next; });
          }} /><span><strong>{hi ? 'अन्य दस्तावेज़' : 'Other document'}</strong><small>{hi ? 'सूची में नहीं है तो उसका नाम लिखें।' : 'If it is not listed, enter its exact name.'}</small></span></label>
        </div>
        {selectedDocuments.includes('other') && <label className={fieldErrors.otherDocumentName ? "ds-application-wide ds-field-invalid" : "ds-application-wide"}>{hi ? 'अन्य दस्तावेज़ का नाम' : 'Name of other document'}<input aria-invalid={Boolean(fieldErrors.otherDocumentName)} data-validation-key="otherDocumentName" value={otherDocumentName} onChange={(e) => { setOtherDocumentName(e.target.value); clearFieldError("otherDocumentName"); }} required /></label>}
        {selectedDocuments.includes('other') && <label className="ds-application-file-upload">{hi ? 'अन्य दस्तावेज़ की फ़ाइल (वैकल्पिक)' : 'Other document file (optional)'}<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(e) => { const file = e.target.files?.[0]; setDocumentFiles((old) => { const next = { ...old }; if (file) next.other = file; else delete next.other; return next; }); clearFieldError('documentFiles'); }} />{documentFiles.other && <small>{documentFiles.other.name} · {(documentFiles.other.size / 1024 / 1024).toFixed(2)} MB</small>}</label>}
        <div className="ds-application-upload-notice"><ShieldCheck size={18} /><span>{hi ? 'फॉर्म की जानकारी और चुनी गई फ़ाइलें इस ब्राउज़र में अधिकतम 7 दिनों तक सेव रहेंगी। यदि इसी सेवा के लिए इस ब्राउज़र पर नया ग्राहक आवेदन कर रहा है, तो इस सेवा का पुराना ड्राफ्ट हटाने के लिए नया आवेदन शुरू करें। फ़ाइलें Submit करने पर ही निजी Preview स्टोरेज में अपलोड होंगी। PDF, JPG या PNG स्वीकार हैं; हर फ़ाइल अधिकतम 5 MB और कुल 20 MB तक।' : 'Your form progress is saved in this browser for up to 7 days, including selected files. If another customer is using this same service on this browser, choose Start a new application to clear the saved draft for this service. Files are uploaded to private Preview storage only when you submit. PDF, JPG and PNG only; up to 5 MB per file and 20 MB total. Uploading is optional.'}</span></div>
      </div>
    </section>}

    {step === 3 && <section className="ds-application-step">
      <span className="ds-kicker">{hi ? 'चरण 4' : 'STEP 4'}</span><h3>{hi ? 'आवेदन की जाँच और सहमति' : 'Review and confirmations'}</h3>
      <div className="ds-application-review">
        <div><small>{hi ? 'सेवा' : 'Service'}</small><strong>{hi ? service.hindi : service.name}</strong></div>
        <div><small>{hi ? 'आवेदन करने वाला' : 'Submitting party'}</small><strong>{requesterOptions.find((x) => x.value === requesterType)?.[hi ? 'hi' : 'label']}</strong></div>
        {intermediary && <div><small>{hi ? 'संचालक / एजेंट' : 'Operator / agent'}</small><strong>{operator.name} · {operator.phone} · {operator.email}</strong></div>}
        <div><small>{hi ? 'वास्तविक आवेदक' : 'Actual applicant'}</small><strong>{applicant.name} · {applicant.phone} · {applicant.email}</strong></div>
        <div><small>{hi ? 'चुने गए सुधार' : 'Selected corrections'}</small><strong>{corrections.map((id) => correctionsForService.find((x) => x.id === id)?.[hi ? 'hindi' : 'label'] || id).join(', ') || (hi ? 'लागू नहीं' : 'Not applicable')}</strong></div>
        <div><small>{hi ? 'उपलब्ध दस्तावेज़' : 'Available documents'}</small><strong>{selectedDocuments.map((id) => documents.find((x) => x.id === id)?.[hi ? 'hindi' : 'label'] || (id === 'other' ? otherDocumentName : id)).join(', ') || (hi ? 'कोई दस्तावेज़ नहीं चुना' : 'None selected')}</strong></div>
        <div><small>{hi ? 'काम के निर्देश' : 'Work instructions'}</small><strong>{taskDetails}</strong></div>
      </div>
      <div className="ds-booking-privacy"><ShieldCheck size={18} /><span>{hi ? 'नाम, मोबाइल और ईमेल अनिवार्य हैं। यह सहायता अनुरोध है, सरकारी आवेदन जमा होने का प्रमाण नहीं।' : 'Name, mobile and email are required. This is an assistance request, not proof that a government application has been filed.'}</span></div>
      <BookingPolicyConsent language={language} termsAccepted={termsAccepted} refundAccepted={refundAccepted} onTermsChange={(value) => { setTermsAccepted(value); setTermsAcceptedAt(value ? new Date().toISOString() : null); clearFieldError("termsAccepted"); }} onRefundChange={(value) => { setRefundAccepted(value); setRefundAcceptedAt(value ? new Date().toISOString() : null); clearFieldError("refundAccepted"); }} termsError={fieldErrors.termsAccepted} refundError={fieldErrors.refundAccepted} />
      <label className={fieldErrors.bookingConsent ? "ds-booking-consent ds-field-invalid" : "ds-booking-consent"}><input data-validation-key="bookingConsent" aria-invalid={Boolean(fieldErrors.bookingConsent)} type="checkbox" checked={bookingConsent} onChange={(e) => { setBookingConsent(e.target.checked); clearFieldError("bookingConsent"); }} required /><span>{hi ? 'मैं सहमत हूँ कि TANSHU ONLINE इस सेवा अनुरोध के बारे में मुझसे संपर्क कर सकता है। मैं समझता/समझती हूँ कि यह स्वतंत्र सहायता सेवा है, सरकारी विभाग नहीं।' : 'I agree that TANSHU ONLINE may contact me about this service request. I understand this is an independent assistance service, not a government department.'}</span></label>
    </section>}

    {error && <p className="ds-booking-error" role="alert">{error}</p>}
    <div className="ds-application-nav">
      {step > 0 && <button type="button" className="ds-application-back" onClick={() => { setError(''); setStep((n) => n - 1); }} disabled={submitting}><ArrowLeft size={15} /> {hi ? 'पीछे' : 'Back'}</button>}
      <span>{hi ? 'चरण ' + (step + 1) + ' / 4' : 'Step ' + (step + 1) + ' of 4'}</span>
      {step < 3 ? <button type="button" className="ds-modal-book" onClick={next}>{hi ? 'आगे बढ़ें' : 'Continue'} <ArrowRight size={16} /></button> :
        <button className="ds-modal-book" type="submit" disabled={submitting}>{submitting ? (hi ? 'जमा हो रहा है…' : 'Submitting…') : (hi ? 'बुकिंग अनुरोध जमा करें' : 'Submit booking request')} <ArrowRight size={16} /></button>}
    </div>
  </form>;
}
