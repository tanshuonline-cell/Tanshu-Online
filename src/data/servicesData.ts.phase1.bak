import { GovernmentService } from '../types';

export const GOVERNMENT_SERVICES: GovernmentService[] = [
  {
    id: 'aadhaar-services',
    title: 'Aadhaar Card Services (UIDAI)',
    category: 'Identity & Biometrics',
    summary: 'Download electronic Aadhaar (e-Aadhaar), update address online, verify Aadhaar number, check mobile/email link, and order durable PVC Aadhaar card directly from UIDAI.',
    officialPortal: 'https://myaadhaar.uidai.gov.in',
    officialPortalName: 'myAadhaar Portal (UIDAI)',
    processingTime: 'Instant download / 5-7 working days for PVC delivery',
    estimatedFee: 'Free for e-Aadhaar / ₹50 for PVC Card delivery',
    eligibility: [
      'All Indian citizens, NRIs, and resident foreign nationals residing in India',
      'Valid registered mobile number for OTP authentication'
    ],
    requiredDocuments: [
      'Proof of Identity (POI) e.g., PAN, Voter ID, Passport',
      'Proof of Address (POA) e.g., Electricity Bill, Ration Card, Bank Passbook',
      'Head of Family (HOF) consent for address update without proof'
    ],
    steps: [
      'Visit the official UIDAI myAadhaar portal (myaadhaar.uidai.gov.in).',
      'Click "Login" using your 12-digit Aadhaar Number and Captcha code.',
      'Enter the one-time password (OTP) received on your registered mobile number.',
      'Select your required service: Download e-Aadhaar, Order Aadhaar PVC Card, or Update Address.',
      'For Address Update: Upload color scan of supporting document or enter HOF Aadhaar details.',
      'Submit the request and save the Service Request Number (SRN) for tracking.'
    ],
    trackUrl: 'https://myaadhaar.uidai.gov.in/check-aadhaar-status'
  },
  {
    id: 'pan-card-services',
    title: 'PAN Card Services (Protean / UTIITSL / e-Filing)',
    category: 'Taxation & Financial ID',
    summary: 'Apply for fresh Permanent Account Number (Form 49A), get instant paperless e-PAN within 10 minutes via Aadhaar e-KYC, link PAN with Aadhaar, or correct personal details.',
    officialPortal: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
    officialPortalName: 'Protean TIN-NSDL Portal & Income Tax e-Filing',
    processingTime: 'Instant (e-PAN) / 10-15 business days for physical card delivery',
    estimatedFee: 'Instant e-PAN: Free / Physical Card: ₹107 (India) or ₹1,017 (Abroad)',
    eligibility: [
      'Any individual, business, Hindu Undivided Family (HUF), or trust in India',
      'For instant e-PAN: Must have Aadhaar linked with mobile number and no prior PAN allotted'
    ],
    requiredDocuments: [
      'Aadhaar Card (serves as POI, POA, and Date of Birth proof)',
      'Digital signature and passport photo (if applying via standard physical dispatch)'
    ],
    steps: [
      'Choose method: Instant e-PAN via Income Tax Portal or Physical PAN via Protean/UTIITSL.',
      'Fill Form 49A with full name, father name, date of birth, and communication address.',
      'Select whether physical PAN card is required or only electronic e-PAN.',
      'Authenticate using Aadhaar biometric/OTP e-KYC or upload scanned signature & photo.',
      'Pay online processing fee (₹107) and download the 15-digit Acknowledgement Slip.'
    ],
    trackUrl: 'https://tin.tin.nsdl.com/pantan/StatusTrack.html'
  },
  {
    id: 'voter-services',
    title: 'Voter ID Card Services (ECI Voters Portal)',
    category: 'Electoral Services',
    summary: 'Enroll as a new voter (Form 6), apply for shifting or correction of voter card details (Form 8), download digital e-EPIC card, or check your name in the electoral roll.',
    officialPortal: 'https://voters.eci.gov.in',
    officialPortalName: 'Election Commission of India (ECI) Voters Portal',
    processingTime: '15 to 30 days following BLO field verification',
    estimatedFee: '100% Free of Cost',
    eligibility: [
      'Indian citizen who has attained 18 years of age on qualifying dates (Jan 1, Apr 1, Jul 1, Oct 1)',
      'Ordinarily resident in the constituency where registration is sought'
    ],
    requiredDocuments: [
      'Age Proof (Birth Certificate, 10th Marksheet, Aadhaar, PAN, or Passport)',
      'Current Residence Proof (Electricity Bill, Water Bill, Aadhaar, Gas Connection)',
      'One recent passport size color photograph with white background'
    ],
    steps: [
      'Register on the ECI portal (voters.eci.gov.in) with mobile number and password.',
      'Select Form 6 for New Registration of General Elector.',
      'Fill in Assembly Constituency, personal name, father/husband name, and address.',
      'Upload photo, age proof, and address proof documents.',
      'Submit the declaration and download the reference tracking acknowledgement.',
      'The local Booth Level Officer (BLO) conducts physical verification before EPIC generation.'
    ],
    trackUrl: 'https://voters.eci.gov.in/track-application-status'
  },
  {
    id: 'parivahan-services',
    title: 'Driving License & Parivahan Seva (MoRTH)',
    category: 'Transport & Driving',
    summary: 'Apply for Learner License (LL) with contactless online computer test from home, book Driving License (DL) slot, renew driving license, apply for international permit, or check RC details.',
    officialPortal: 'https://parivahan.gov.in/parivahan/',
    officialPortalName: 'Ministry of Road Transport & Highways (Parivahan)',
    processingTime: 'Instant LL approval after online exam / DL after practical test',
    estimatedFee: 'Learner License: ₹150 - ₹200 / Driving License: ₹200 - ₹300',
    eligibility: [
      'Age 16+ for gearless two-wheeler (<50cc with parental consent)',
      'Age 18+ for Light Motor Vehicle (Car/Motorcycle with gear)',
      'Age 20+ for Transport/Commercial vehicle license'
    ],
    requiredDocuments: [
      'Proof of Age and Identity (Aadhaar, School Certificate, Passport)',
      'Proof of Current Address (Aadhaar, Voter ID, Utility Bill)',
      'Self-Declaration Medical Form 1 or Medical Certificate Form 1A (for 40+ or transport)'
    ],
    steps: [
      'Visit Sarathi Parivahan portal and select your respective State.',
      'Click "Apply for Learner License" and complete Aadhaar authentication.',
      'Fill in applicant details, vehicle class (MCWG / LMV), and submit Form 1 medical declaration.',
      'Upload applicant signature and pay prescribed application fees online.',
      'Complete online Road Safety tutorial and take the computer-based LL test from home.',
      'Download your digital Learner License upon passing test.'
    ],
    trackUrl: 'https://sarathi.parivahan.gov.in/sarathiservice/applViewStatus.do'
  },
  {
    id: 'passport-seva',
    title: 'Passport Seva Online Portal (MEA)',
    category: 'Travel & Citizenship',
    summary: 'Apply for fresh ordinary Indian passport, reissue expired passport, apply for Police Clearance Certificate (PCC), check appointment availability at PSK/POPSK, and calculate fees.',
    officialPortal: 'https://www.passportindia.gov.in',
    officialPortalName: 'Consular, Passport & Visa Division, MEA',
    processingTime: 'Normal: 15-30 days / Tatkaal: 1-3 business days',
    estimatedFee: 'Standard 36 pages (Normal): ₹1,500 / Tatkaal: ₹3,500',
    eligibility: [
      'Indian citizens by birth, descent, registration, or naturalization',
      'No pending criminal summons or prohibited travel orders'
    ],
    requiredDocuments: [
      'Proof of Date of Birth (Birth Certificate, 10th Certificate, Aadhaar)',
      'Proof of Present Address (Aadhaar, Bank Passbook, Voter ID, Utility Bill)',
      'Non-ECR Proof (Matriculation 10th pass certificate or higher degree)'
    ],
    steps: [
      'Register on the Passport Seva Online Portal (passportindia.gov.in).',
      'Click "Apply for Fresh Passport/Reissue of Passport" and fill Form online.',
      'Carefully enter non-ECR status (ensures no emigration check required for travel).',
      'Pay application fee via SBI e-Pay and schedule appointment at nearest PSK / POPSK.',
      'Print Application Receipt containing the Application Reference Number (ARN).',
      'Visit PSK with original documents for biometric capture, followed by local police verification.'
    ],
    trackUrl: 'https://www.passportindia.gov.in/AppOnlineProject/statusTracker/trackStatusInpNew'
  },
  {
    id: 'edistrict-certificates',
    title: 'State e-District & Revenue Certificates',
    category: 'State Governance & Revenue',
    summary: 'Access state-level single window portals for Income Certificates, Caste / Category (SC/ST/OBC/EWS) Certificates, Domicile/Residence, Character, and Revenue documents.',
    officialPortal: 'https://services.india.gov.in',
    officialPortalName: 'National Services Portal & State e-District Portals',
    processingTime: '7 to 21 working days depending on Tehsildar/Revenue inquiry',
    estimatedFee: '₹15 to ₹50 government statutory fee',
    eligibility: [
      'Resident citizen of the concerned state/union territory',
      'Eligible income threshold (e.g. < ₹8 Lakhs for OBC Non-Creamy Layer / EWS)'
    ],
    requiredDocuments: [
      'Aadhaar Card and Jan Aadhaar / Parivar Pehchan Patra (where applicable)',
      'Self-Declaration Affidavit / Notarized Income Declaration',
      'Land records (Khata/Khasra), salary slip, or Patwari/Lekhpal inspection report',
      'Old Caste Certificate of father/family members (for caste verification)'
    ],
    steps: [
      'Identify your state e-District portal (e.g. edistrict.up.gov.in, edistrict.delhigovt.nic.in, aaplesarkar.mahaonline.gov.in).',
      'Create citizen account with mobile number and Aadhaar e-KYC.',
      'Select certificate category (Income / Caste / Domicile / EWS).',
      'Fill applicant details, family occupation, annual earnings, and ancestral residence.',
      'Upload self-declaration form, photo, and identity documents.',
      'Pay online processing fee and note down the Application Number for status monitoring.'
    ]
  }
];
