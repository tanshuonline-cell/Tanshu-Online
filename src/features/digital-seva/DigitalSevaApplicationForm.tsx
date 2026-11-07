import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { SevaService } from './serviceCatalog';
import { CORRECTION_OPTIONS, getServiceDocumentOptions } from './serviceApplicationSchema';
import BookingPolicyConsent, { TERMS_POLICY_VERSION, REFUND_POLICY_VERSION } from './BookingPolicyConsent';

type RequesterType = 'DIRECT_CUSTOMER' | 'CYBER_CAFE' | 'CSC_CENTER' | 'INDEPENDENT_AGENT';
type ApplicationFor = 'SELF' | 'CUSTOMER';
interface Contact { name: string; phone: string; email: string; }
interface Props { service: SevaService; language: 'en' | 'hi'; onSubmitted: (reference: string) => void; }
const emptyContact = (): Contact => ({ name: '', phone: '', email: '' });
const phoneValid = (v: string) => /^\d{10}$/.test(v.replace(/\D/g, ''));
const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

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
  const [otherDocumentName, setOtherDocumentName] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [serviceOptions, setServiceOptions] = useState<Record<string, string>>({});
  const [bookingConsent, setBookingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [refundAccepted, setRefundAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
  const setField = (key: string, value: string) => setFieldValues((old) => ({ ...old, [key]: value }));
  const setOption = (key: string, value: string) => setServiceOptions((old) => ({ ...old, [key]: value }));
  const changeCorrection = (id: string, checked: boolean) => {
    const next = checked ? [...corrections, id] : corrections.filter((value) => value !== id);
    setCorrections(next);
    const validDocuments = new Set(getServiceDocumentOptions(service.id, next).map((item) => item.id));
    setSelectedDocuments((old) => old.filter((value) => value === 'other' || validDocuments.has(value)));
  };

  const validateStep = () => {
    if (step === 0 && !requesterType) return hi ? 'कृपया आवेदन करने की श्रेणी चुनें।' : 'Please select who is submitting this request.';
    if (step === 1) {
      if (intermediary && (operator.name.trim().length < 2 || !phoneValid(operator.phone) || !emailValid(operator.email)))
        return hi ? 'संचालक/एजेंट का सही नाम, 10 अंकों का मोबाइल और ईमेल भरें।' : 'Enter the operator/agent name, valid 10-digit mobile and email.';
      if (intermediary && ['CYBER_CAFE', 'CSC_CENTER'].includes(requesterType) && (!centerName.trim() || !centerAddress.trim()))
        return hi ? 'सेंटर का नाम और पूरा पता भरना अनिवार्य है।' : 'Centre name and full address are required.';
      if (requesterType === 'INDEPENDENT_AGENT' && !agencyName.trim())
        return hi ? 'एजेंट/व्यवसाय का नाम भरें।' : 'Enter the agent/business name.';
      if (applicant.name.trim().length < 2 || !phoneValid(applicant.phone) || !emailValid(applicant.email))
        return hi ? 'आवेदक का सही नाम, 10 अंकों का मोबाइल और ईमेल भरें।' : 'Enter the applicant name, valid 10-digit mobile and email.';
    }
    if (step === 2) {
      if (correctionsForService.length && corrections.length === 0)
        return hi ? 'कृपया बताएं कि किस विवरण में सुधार चाहिए।' : 'Select at least one detail that needs correction.';
      if (service.id === 'voter-correction' && corrections.length > 4)
        return hi ? 'Form 8 में अधिकतम चार विवरणों का सुधार चुना जा सकता है।' : 'Form 8 allows a maximum of four correction entries.';
      if (taskDetails.trim().length < 5) return hi ? 'काम का पूरा विवरण लिखें।' : 'Describe the requested work.';
      if (['certificate-income', 'certificate-caste', 'certificate-residence'].includes(service.id) && !serviceOptions.level)
        return hi ? 'कृपया प्रमाणपत्र का स्तर चुनें।' : 'Select the certificate level.';
      if (service.id === 'scheme-check' && !serviceOptions.schemeName?.trim()) return hi ? 'योजना का नाम भरें।' : 'Enter the scheme name.';
      if (service.id === 'online-form' && !serviceOptions.formName?.trim()) return hi ? 'फॉर्म / भर्ती का नाम भरें।' : 'Enter the form / recruitment name.';
      if (service.id === 'website-services' && !serviceOptions.websiteScope) return hi ? 'वेबसाइट सेवा का प्रकार चुनें।' : 'Choose the website service scope.';
      if (service.id === 'ration-update' && !serviceOptions.rationAction) return hi ? 'राशन कार्ड बदलाव का प्रकार चुनें।' : 'Choose the ration-card update type.';
    }
    if (step === 3 && (!bookingConsent || !termsAccepted || !refundAccepted))
      return hi ? 'तीनों सहमतियाँ अलग-अलग स्वीकार करें।' : 'Please provide all three separate confirmations.';
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
        consent: bookingConsent, termsAccepted, termsPolicyVersion: TERMS_POLICY_VERSION,
        refundPolicyAccepted: refundAccepted, refundPolicyVersion: REFUND_POLICY_VERSION,
        idempotencyKey: window.crypto.randomUUID()
      };
      const response = await fetch('/api/digital-seva/bookings', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.bookingReference) throw new Error(data.error || 'Booking could not be saved. Please try again later.');
      onSubmitted(String(data.bookingReference));
    } catch (e: any) {
      setError(e?.message || (hi ? 'नेटवर्क समस्या। दोबारा कोशिश करें।' : 'Network error. Please try again.'));
    } finally { setSubmitting(false); }
  };

  const textInput = (key: string, label: string, labelHi: string) => (
    <label key={key}>{hi ? labelHi : label}<input value={fieldValues[key] || ''} onChange={(e) => setField(key, e.target.value)} /></label>
  );
  const selectInput = (key: string, label: string, labelHi: string, opts: { value: string; label: string; hi: string }[]) => (
    <label key={key}>{hi ? labelHi : label}<select value={serviceOptions[key] || ''} onChange={(e) => setOption(key, e.target.value)}><option value="">{hi ? 'चुनें' : 'Select'}</option>{opts.map((o) => <option key={o.value} value={o.value}>{hi ? o.hi : o.label}</option>)}</select></label>
  );

  const renderServiceFields = () => (
    <>
      {service.id === 'pan-new' && <div className="ds-application-field-grid">
        {textInput('panApplicantName', 'Full name exactly as per Aadhaar', 'आधार के अनुसार पूरा नाम')}
        {textInput('panFatherName', "Father's full name", 'पिता का पूरा नाम')}
        {textInput('panMotherName', "Mother's full name", 'माता का पूरा नाम')}
        {textInput('panDob', 'Date of birth (DD/MM/YYYY)', 'जन्मतिथि (DD/MM/YYYY)')}
        {selectInput('panParentPrint', 'Parent name to print on PAN', 'PAN पर किसका नाम छपे', [
          { value: 'FATHER', label: 'Father', hi: 'पिता' }, { value: 'MOTHER', label: 'Mother', hi: 'माता' }
        ])}
        {textInput('panAddress', 'Communication address', 'पत्राचार का पता')}
      </div>}
      {service.id === 'aadhaar-mobile' && textInput('newMobile', 'New mobile number (do not enter OTP)', 'नया मोबाइल नंबर (OTP न लिखें)')}
      {service.id === 'aadhaar-email' && textInput('newEmail', 'New email address', 'नई ईमेल आईडी')}
      {service.id === 'certificate-income' && <div className="ds-application-field-grid">
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
        {corrections.map((id) => {
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
      {service.id === 'aadhaar-address-hof' && <div className="ds-application-field-grid">
        {selectInput('hofRelation', 'Relation to Head of Family', 'परिवार के मुखिया से संबंध', [
          { value: 'PARENT', label: 'Parent', hi: 'माता / पिता' }, { value: 'SPOUSE', label: 'Spouse', hi: 'पति / पत्नी' },
          { value: 'CHILD', label: 'Child / ward', hi: 'बच्चा / आश्रित' }, { value: 'SIBLING', label: 'Sibling', hi: 'भाई / बहन' },
          { value: 'GUARDIAN', label: 'Legal guardian', hi: 'कानूनी अभिभावक' }
        ])}
        {textInput('hofName', 'Head of Family name', 'परिवार के मुखिया का नाम')}
      </div>}
      {service.id === 'aadhaar-co' && <div className="ds-application-field-grid">
        {textInput('currentCo', 'Current C/O text', 'मौजूदा C/O नाम')}
        {textInput('requestedCo', 'Requested C/O text (leave blank to remove)', 'नया C/O नाम (हटाने के लिए खाली छोड़ें)')}
      </div>}
      {service.id === 'ration-update' && <div className="ds-application-field-grid">
        {selectInput('rationAction', 'What needs to change?', 'क्या बदलाव करवाना है?', [
          { value: 'ADD_MEMBER', label: 'Add member', hi: 'सदस्य जोड़ना' }, { value: 'REMOVE_MEMBER', label: 'Remove member', hi: 'सदस्य हटाना' },
          { value: 'CORRECT_MEMBER', label: 'Correct member details', hi: 'सदस्य का विवरण सुधारना' },
          { value: 'ADDRESS', label: 'Address change', hi: 'पता बदलना' }, { value: 'OTHER', label: 'Other', hi: 'अन्य' }
        ])}
        {textInput('memberName', 'Affected member name', 'प्रभावित सदस्य का नाम')}
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
      <label className="ds-application-wide">{hi ? 'काम का पूरा विवरण / निर्देश' : 'Exact work / instructions'}
        <textarea value={taskDetails} onChange={(e) => setTaskDetails(e.target.value)} rows={3} required placeholder={hi ? 'क्या काम करवाना है और कौन-सा विवरण सही होना चाहिए...' : 'What work is requested and what details should be correct...'} />
      </label>
    </>
  );

  return <form className="ds-booking-form ds-application-form" onSubmit={submit}>
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
        {requesterOptions.map((o) => <button type="button" key={o.value} className={requesterType === o.value ? 'selected' : ''} onClick={() => { setRequesterType(o.value as RequesterType); setApplicationFor('SELF'); setError(''); }}>
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
          <label>{hi ? 'पूरा नाम *' : 'Full name *'}<input value={operator.name} onChange={(e) => updateOperator('name', e.target.value)} required /></label>
          <label>{hi ? 'मोबाइल नंबर *' : 'Mobile number *'}<input inputMode="numeric" value={operator.phone} onChange={(e) => updateOperator('phone', e.target.value)} required /></label>
          <label>{hi ? 'ईमेल आईडी *' : 'Email address *'}<input type="email" value={operator.email} onChange={(e) => updateOperator('email', e.target.value)} required /></label>
          {['CYBER_CAFE', 'CSC_CENTER'].includes(requesterType) && <>
            <label>{hi ? 'सेंटर का नाम *' : 'Centre name *'}<input value={centerName} onChange={(e) => setCenterName(e.target.value)} required /></label>
            <label className="ds-application-wide">{hi ? 'सेंटर का पूरा पता *' : 'Full centre address *'}<textarea value={centerAddress} onChange={(e) => setCenterAddress(e.target.value)} rows={2} required /></label>
          </>}
          {requesterType === 'INDEPENDENT_AGENT' && <>
            <label>{hi ? 'एजेंसी / व्यवसाय का नाम *' : 'Agency / business name *'}<input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required /></label>
            <label className="ds-application-wide">{hi ? 'व्यवसाय का पता (वैकल्पिक)' : 'Business address (optional)'}<textarea value={agencyAddress} onChange={(e) => setAgencyAddress(e.target.value)} rows={2} /></label>
          </>}
        </div>
      </div>}
      <div className="ds-application-profile">
        <div className="ds-application-profile-heading"><h4>{hi ? 'वास्तविक आवेदक / ग्राहक' : 'Actual applicant / customer'}</h4>
          {intermediary && <button type="button" className="ds-application-copy" onClick={() => setApplicant({ ...operator })} disabled={!isOwnWork}>{hi ? 'संचालक की जानकारी कॉपी करें' : 'Copy operator details'}</button>}
        </div>
        <div className="ds-application-field-grid">
          <label>{hi ? 'पूरा नाम *' : 'Full name *'}<input value={applicant.name} onChange={(e) => updateContact(setApplicant, 'name', e.target.value)} required /></label>
          <label>{hi ? 'मोबाइल नंबर *' : 'Mobile number *'}<input inputMode="numeric" value={applicant.phone} onChange={(e) => updateContact(setApplicant, 'phone', e.target.value)} required /></label>
          <label>{hi ? 'ईमेल आईडी *' : 'Email address *'}<input type="email" value={applicant.email} onChange={(e) => updateContact(setApplicant, 'email', e.target.value)} required /></label>
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
              <input type="checkbox" checked={selectedDocuments.includes(item.id)} onChange={(e) => setSelectedDocuments((old) => e.target.checked ? [...old, item.id] : old.filter((x) => x !== item.id))} />
              <span><strong>{hi ? item.hindi : item.label}{item.required ? ' *' : ''}</strong><small>{hi ? item.purposeHindi : item.purpose}</small></span>
            </label>
            {selectedDocuments.includes(item.id) && <label className="ds-application-file-disabled">{hi ? 'फाइल अपलोड (सुरक्षित अपलोड चालू होने पर)' : 'File upload (available after secure storage setup)'}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled /></label>}
          </div>)}
          <label className="ds-application-doc-option"><input type="checkbox" checked={selectedDocuments.includes('other')} onChange={(e) => setSelectedDocuments((old) => e.target.checked ? [...old, 'other'] : old.filter((x) => x !== 'other'))} /><span><strong>{hi ? 'अन्य दस्तावेज़' : 'Other document'}</strong><small>{hi ? 'सूची में नहीं है तो उसका नाम लिखें।' : 'If it is not listed, enter its exact name.'}</small></span></label>
        </div>
        {selectedDocuments.includes('other') && <label className="ds-application-wide">{hi ? 'अन्य दस्तावेज़ का नाम' : 'Name of other document'}<input value={otherDocumentName} onChange={(e) => setOtherDocumentName(e.target.value)} required /></label>}
        <div className="ds-application-upload-notice"><ShieldCheck size={18} /><span>{hi ? 'सुरक्षित दस्तावेज़ अपलोड इस Preview में अभी चालू नहीं है। यहाँ Aadhaar/PAN या कोई निजी दस्तावेज़ अपलोड न करें। अभी केवल उपलब्ध दस्तावेज़ों की सूची दर्ज होगी।' : 'Secure document upload is not enabled in this Preview. Do not upload Aadhaar/PAN or other private documents here. This step records only the documents you have available.'}</span></div>
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
      <div className="ds-booking-privacy"><ShieldCheck size={18} /><span>{hi ? 'नाम, मोबाइल और ईमेल अनिवार्य हैं। OTP, पासवर्ड, PIN या पूरा Aadhaar/PAN नंबर न लिखें। यह सहायता अनुरोध है, सरकारी आवेदन जमा होने का प्रमाण नहीं।' : 'Name, mobile and email are required. Do not enter OTPs, passwords, PINs or full Aadhaar/PAN numbers. This is an assistance request, not proof that a government application has been filed.'}</span></div>
      <BookingPolicyConsent language={language} termsAccepted={termsAccepted} refundAccepted={refundAccepted} onTermsChange={setTermsAccepted} onRefundChange={setRefundAccepted} />
      <label className="ds-booking-consent"><input type="checkbox" checked={bookingConsent} onChange={(e) => setBookingConsent(e.target.checked)} required /><span>{hi ? 'मैं सहमत हूँ कि TANSHU ONLINE इस सेवा अनुरोध के बारे में मुझसे संपर्क कर सकता है। मैं समझता/समझती हूँ कि यह स्वतंत्र सहायता सेवा है, सरकारी विभाग नहीं।' : 'I agree that TANSHU ONLINE may contact me about this service request. I understand this is an independent assistance service, not a government department.'}</span></label>
    </section>}

    {error && <p className="ds-booking-error" role="alert">{error}</p>}
    <div className="ds-application-nav">
      {step > 0 && <button type="button" className="ds-application-back" onClick={() => { setError(''); setStep((n) => n - 1); }} disabled={submitting}><ArrowLeft size={15} /> {hi ? 'पीछे' : 'Back'}</button>}
      <span>{hi ? 'चरण ' + (step + 1) + ' / 4' : 'Step ' + (step + 1) + ' of 4'}</span>
      {step < 3 ? <button type="button" className="ds-modal-book" onClick={next}>{hi ? 'आगे बढ़ें' : 'Continue'} <ArrowRight size={16} /></button> :
        <button className="ds-modal-book" type="submit" disabled={submitting || !bookingConsent || !termsAccepted || !refundAccepted}>{submitting ? (hi ? 'जमा हो रहा है…' : 'Submitting…') : (hi ? 'बुकिंग अनुरोध जमा करें' : 'Submit booking request')} <ArrowRight size={16} /></button>}
    </div>
  </form>;
}
