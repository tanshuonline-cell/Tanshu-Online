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
  },
  {
    id: 'rtps-residence-certificate',
    title: 'RTPS Bihar: Residence / Domicile Certificate (निवास प्रमाण पत्र)',
    category: 'State Governance & Revenue',
    jurisdiction: 'bihar',
    serviceType: 'revenue',
    summary: 'Apply online for Residential Domicile Certificate at Revenue Officer (RO), Sub-Divisional Officer (SDO), or District Magistrate (DM) level via ServicePlus Bihar.',
    officialPortal: 'https://serviceonline.bihar.gov.in',
    officialPortalName: 'ServicePlus Bihar (RTPS Portal)',
    processingTime: '10 working days (Statutory)',
    estimatedFee: 'Free (₹0 government statutory fee)',
    eligibility: [
      'Permanent resident of Bihar or residing continuously in the state',
      'Valid mobile number for OTP authentication and status SMS'
    ],
    requiredDocuments: [
      'Applicant self-photograph',
      'Proof of Identity & Address (Aadhaar Card, Voter ID, Ration Card, or Passport)',
      'Self-Declaration Form (स्व-घोषणा पत्र generated during form filling)'
    ],
    steps: [
      'Visit the official ServicePlus Bihar portal (serviceonline.bihar.gov.in).',
      'Navigate to "लोक सेवाओं का अधिकार की सेवाएं" -> "सामान्य प्रशासन विभाग" -> "आवासीय प्रमाण-पत्र का निर्गमन".',
      'Select jurisdiction level: Revenue Officer (अंचल स्तर / RO), SDO (अनुमंडल स्तर), or DM (जिला स्तर).',
      'Choose Gender, fill applicant full name in English & Hindi, father/husband name, and mother name.',
      'Select District, Sub-Division, Block, Gram Panchayat/Ward, and Village/Mohalla.',
      'Upload applicant photo and choose supporting ID proof (Aadhaar Card recommended).',
      'Verify details on the preview screen and submit to receive your Application Reference Number.'
    ],
    trackUrl: 'https://serviceonline.bihar.gov.in'
  },
  {
    id: 'rtps-caste-certificate',
    title: 'RTPS Bihar: Caste Certificate (जाति प्रमाण पत्र - SC/ST/EBC/BC/Gen)',
    category: 'State Governance & Revenue',
    jurisdiction: 'bihar',
    serviceType: 'revenue',
    summary: 'Obtain statutory Caste Certificate verifying Scheduled Caste, Scheduled Tribe, Extremely Backward Class (EBC), Backward Class (BC), or General category status for reservations.',
    officialPortal: 'https://serviceonline.bihar.gov.in',
    officialPortalName: 'ServicePlus Bihar (RTPS Portal)',
    processingTime: '10 working days (Statutory)',
    estimatedFee: 'Free (₹0 government statutory fee)',
    eligibility: [
      'Permanent resident citizen belonging to notified communities in Bihar',
      'Caste recorded in official Bihar state gazette notifications'
    ],
    requiredDocuments: [
      'Aadhaar Card or other government photo identity card',
      'Family Khatiyan / Land record or old Caste Certificate of father/paternal lineage',
      'Self-declaration of caste community'
    ],
    steps: [
      'Visit serviceonline.bihar.gov.in and click "सामान्य प्रशासन विभाग" -> "जाति प्रमाण-पत्र का निर्गमन".',
      'Select issuing authority level (RO level for initial issue, SDO/DM for state/central recruitment).',
      'Enter applicant details in English and Hindi, along with permanent and present address.',
      'Select Category (अनु० जाति / अनु० जनजाति / अत्यंत पिछड़ा वर्ग / पिछड़ा वर्ग / गैर-आरक्षित) and specific Caste name.',
      'Upload recent photograph and attach Aadhaar or family Khatiyan document.',
      'Submit the application and download the RTPS acknowledgement slip containing delivery date.'
    ],
    trackUrl: 'https://serviceonline.bihar.gov.in'
  },
  {
    id: 'rtps-income-certificate',
    title: 'RTPS Bihar: Income Certificate (आय प्रमाण पत्र)',
    category: 'State Governance & Revenue',
    jurisdiction: 'bihar',
    serviceType: 'revenue',
    summary: 'Official assessment of annual family income from agricultural, business, salary, and other vocations for government welfare schemes and fee concessions.',
    officialPortal: 'https://serviceonline.bihar.gov.in',
    officialPortalName: 'ServicePlus Bihar (RTPS Portal)',
    processingTime: '10 working days (Statutory)',
    estimatedFee: 'Free (₹0 government statutory fee)',
    eligibility: [
      'Resident families of Bihar requiring official income assessment',
      'Valid self-declaration of all sources of family revenue'
    ],
    requiredDocuments: [
      'Aadhaar Card of the applicant',
      'Salary slip / Form 16 (for salaried persons) OR Land revenue receipt (for farming families)',
      'Self-declaration of annual earnings from Government, Business, Agriculture, and Other sources'
    ],
    steps: [
      'Access serviceonline.bihar.gov.in and select "आय प्रमाण-पत्र का निर्गमन".',
      'Choose level of issuance (Revenue Officer level is standard for educational admissions).',
      'Fill in applicant personal particulars and geographic block/panchayat details.',
      'Enter specific income breakdown: Income from Agriculture, Business, Profession, and Other sources.',
      'Enter purpose of application (e.g. Higher Education, Scholarship, General).',
      'Upload identity document and submit to generate the 16-character Application Reference ID.'
    ],
    trackUrl: 'https://serviceonline.bihar.gov.in'
  },
  {
    id: 'rtps-ncl-certificate',
    title: 'RTPS Bihar: Non-Creamy Layer Certificate (क्रीमीलेयर रहित प्रमाण पत्र - OBC/EBC)',
    category: 'State Governance & Revenue',
    jurisdiction: 'bihar',
    serviceType: 'revenue',
    summary: 'Statutory certification for Backward Class (BC) and Extremely Backward Class (EBC) candidates proving family income is under the ₹8 Lakh creamy layer ceiling.',
    officialPortal: 'https://serviceonline.bihar.gov.in',
    officialPortalName: 'ServicePlus Bihar (RTPS Portal)',
    processingTime: '21 working days (Statutory)',
    estimatedFee: 'Free (₹0 government statutory fee)',
    eligibility: [
      'Belonging to BC or EBC categories in Bihar state list',
      'Annual parental/family income strictly below ₹8 Lakhs as per creamy layer guidelines'
    ],
    requiredDocuments: [
      'Valid Residence Certificate, Caste Certificate, and Income Certificate (all three issued within 1 year)',
      'Form X-A / Form VIII-B (क्रीमीलेयर रहित स्व-घोषणा पत्र)',
      'Aadhaar Card and Land receipt/salary proof'
    ],
    steps: [
      'Ensure you already hold valid Residence, Caste, and Income certificates issued by RTPS.',
      'Visit serviceonline.bihar.gov.in and select "क्रीमीलेयर रहित प्रमाण-पत्र का निर्गमन (बिहार सरकार के प्रयोजनार्थ)".',
      'Select whether already possessing prior revenue officer certificates.',
      'Fill in applicant occupation, parents’ job classification, and agricultural land holdings.',
      'Upload the signed Form X-A self-declaration and attach the three prerequisite certificates.',
      'Review and submit to generate the tracking slip.'
    ],
    trackUrl: 'https://serviceonline.bihar.gov.in'
  },
  {
    id: 'rtps-ews-certificate',
    title: 'RTPS Bihar: EWS Certificate (आर्थिक रूप से कमजोर वर्ग प्रमाण पत्र)',
    category: 'State Governance & Revenue',
    jurisdiction: 'bihar',
    serviceType: 'revenue',
    summary: '10% reservation certificate for economically weaker citizens of unreserved (General) category in government jobs and educational institutions.',
    officialPortal: 'https://serviceonline.bihar.gov.in',
    officialPortalName: 'ServicePlus Bihar (RTPS Portal)',
    processingTime: '21 working days (Statutory)',
    estimatedFee: 'Free (₹0 government statutory fee)',
    eligibility: [
      'Person belonging to General category not covered under SC, ST, or OBC/EBC reservations',
      'Gross annual family income strictly below ₹8 Lakhs from all sources',
      'Family must not own 5 acres of agricultural land or 1000 sq ft residential flat or 100 sq yard plot in notified municipalities'
    ],
    requiredDocuments: [
      'Aadhaar Card / Voter ID Card',
      'Valid Income Certificate and Residence Certificate',
      'Family land possession proof or Khatiyan (if requested during Anchal inquiry)',
      'Self-declaration of assets'
    ],
    steps: [
      'Open serviceonline.bihar.gov.in and click "आर्थिक रूप से कमजोर वर्ग (EWS) के लिए आय एवं परिसंपत्ति प्रमाण-पत्र का निर्गमन".',
      'Select issuing office (Revenue Officer level for state exams).',
      'Fill candidate bio-data, caste name (e.g. Brahmin, Rajput, Bhumihar, Kayastha, Syed, Sheikh, Pathan).',
      'Declare total family income and residential asset details.',
      'Upload self-attested photo and identity proof.',
      'Submit form and retain the Application Number for status monitoring.'
    ],
    trackUrl: 'https://serviceonline.bihar.gov.in'
  },
  {
    id: 'bihar-bhumi-mutation',
    title: 'Bihar Bhumi: Online Dakhil Kharij (दाखिल-खारिज / Mutation Application)',
    category: 'Land & Property Revenue',
    jurisdiction: 'bihar',
    serviceType: 'land',
    summary: 'Transfer legal title of purchased, gifted, or inherited land in government Register-II records to obtain mutated Jamabandi in applicant’s name.',
    officialPortal: 'https://biharbhumi.bihar.gov.in',
    officialPortalName: 'Bihar Bhumi Portal (Revenue & Land Reforms Dept)',
    processingTime: '35 working days (uncontested) / 75 working days (with objection)',
    estimatedFee: 'Free (₹0 application fee)',
    eligibility: [
      'Buyer, donee, or legal heir holding registered sale deed (केवाला) or partition deed in Bihar',
      'Land situated within notified revenue circles of Bihar'
    ],
    requiredDocuments: [
      'Registered Sale Deed / Kewala (रजिस्टर्ड केवाला प्रति)',
      'Previous Jamabandi / Up-to-date Lagan receipt of previous owner',
      'Succession / Legal Heir Certificate (in case of inheritance)',
      'Applicant Aadhaar Card and mobile number'
    ],
    steps: [
      'Visit the official Bihar Bhumi portal (biharbhumi.bihar.gov.in) and register citizen account.',
      'Click "ऑनलाइन दाखिल-खारिज आवेदन करें" and select your District and Anchal.',
      'Click "नया आवेदन करें" and enter Buyer (Applicant) and Seller (Deed Holder) details.',
      'Fill Deed details: Deed Number, Registration Date, Amount, and Registry Office name.',
      'Enter Plot particulars: Halka, Mauza, Khata No., Plot/Khasra No., Area in Acre/Decimal, and Boundary (चौहद्दी).',
      'Combine deed document and self-declaration into a single PDF (under 2MB) and upload.',
      'Submit to generate Case Number (वाद संख्या) for tracking through Circle Officer and Karamchari scrutiny.'
    ],
    trackUrl: 'https://biharbhumi.bihar.gov.in'
  },
  {
    id: 'bihar-bhumi-jamabandi',
    title: 'Bihar Bhumi: Jamabandi Panji & RoR View (जमाबंदी पंजी प्रति / खतियान नकल)',
    category: 'Land & Property Revenue',
    jurisdiction: 'bihar',
    serviceType: 'land',
    summary: 'Inspect digitized Register-II records to verify land ownership, Khata-Khasra numbers, Raiyat name, area, and existing dispute status.',
    officialPortal: 'https://biharbhumi.bihar.gov.in',
    officialPortalName: 'Bihar Bhumi Portal (Register-II / Jamabandi)',
    processingTime: 'Instant digital inspection & print',
    estimatedFee: 'Free (₹0 online view)',
    eligibility: [
      'Open public record accessible to all landowners, buyers, and legal advocates in Bihar'
    ],
    requiredDocuments: [
      'No physical documents needed; requires Anchal, Halka, Mauza, and Khata/Plot number or Raiyat Name'
    ],
    steps: [
      'Visit biharbhumi.bihar.gov.in and click "जमाबंदी पंजी देखें".',
      'Select your District on the interactive Bihar state map.',
      'Select Anchal and click "Proceed", then choose Halka Name and Mauza Name.',
      'Search by: Khata Number, Plot Number, Raiyat Name, or Bhag Vartman / Prishth Vartman.',
      'Click "Search" to display matching land record records in the table.',
      'Click the eye icon next to your record to view, verify boundaries, and print the official Jamabandi summary.'
    ],
    trackUrl: 'https://biharbhumi.bihar.gov.in'
  },
  {
    id: 'bihar-bhumi-lpc',
    title: 'Bihar Bhumi: Land Possession Certificate (LPC / भू-स्वामित्व प्रमाण पत्र)',
    category: 'Land & Property Revenue',
    jurisdiction: 'bihar',
    serviceType: 'land',
    summary: 'Official certificate certifying peaceful continuous possession over registered land, required by commercial banks for Kisan Credit Card (KCC) and agricultural crop loans.',
    officialPortal: 'https://biharbhumi.bihar.gov.in',
    officialPortalName: 'Bihar Bhumi Portal (LPC Service)',
    processingTime: '10 to 15 working days',
    estimatedFee: 'Free (₹0 online application fee)',
    eligibility: [
      'Landowner whose name is recorded in active digital Jamabandi with no arrears of land rent',
      'Physical possession verified by local Revenue Karamchari'
    ],
    requiredDocuments: [
      'Up-to-date Land Rent Receipt (अप-टू-डेट लगान रसीद संख्या)',
      'Self-Declaration Form in prescribed format',
      'Applicant Aadhaar Card and active mobile number'
    ],
    steps: [
      'Open biharbhumi.bihar.gov.in and log in to citizen services.',
      'Click "ऑनलाइन एलपीसी आवेदन करें" and locate your active Jamabandi record.',
      'Click "Apply for LPC" next to your verified Jamabandi entry.',
      'Fill applicant particulars and state the purpose of LPC (e.g. Bank Loan, Court, Border dispute).',
      'Upload prescribed self-declaration form signed by the applicant.',
      'Submit the request to generate the LPC Application Number for Circle Inspector (CI) verification.'
    ],
    trackUrl: 'https://biharbhumi.bihar.gov.in'
  },
  {
    id: 'bihar-bhumi-lagan',
    title: 'Bihar Bhumi: Online Bhu-Lagaan Payment (ऑनलाइन भू-लगान भुगतान)',
    category: 'Land & Property Revenue',
    jurisdiction: 'bihar',
    serviceType: 'land',
    summary: 'Pay annual agricultural and residential land tax online via net banking or UPI and generate an official government e-rent receipt.',
    officialPortal: 'https://biharbhumi.bihar.gov.in',
    officialPortalName: 'Bihar Bhumi Portal (e-Lagan Payment)',
    processingTime: 'Instant receipt generation',
    estimatedFee: 'Annual land revenue assessment per acre (statutory tax)',
    eligibility: [
      'Any Raiyat holding a registered Jamabandi in Bihar revenue records'
    ],
    requiredDocuments: [
      'Bhag Vartman (भाग वर्तमान) and Prishth Sankhya Vartman (पृष्ठ संख्या वर्तमान)',
      'Net Banking, Debit Card, or UPI payment method'
    ],
    steps: [
      'Visit biharbhumi.bihar.gov.in and click "भू-लगान".',
      'Select "ऑनलाइन भुगतान करें".',
      'Select District, Anchal, Halka, and Mauza.',
      'Enter Bhag Vartman and Prishth Sankhya Vartman (found from Jamabandi search).',
      'Solve security captcha and click "खोजें" to view total pending arrears and current financial year dues.',
      'Enter remitter name and mobile number, agree to terms, and click "भुगतान करें".',
      'Complete payment on Bihar e-Grass payment gateway to instantly download your government rent receipt.'
    ],
    trackUrl: 'https://biharbhumi.bihar.gov.in'
  },
  {
    id: 'bihar-epds-ration-card',
    title: 'Bihar Ration Card: New Application & Member Management (EPDS Bihar)',
    category: 'Food & Civil Supplies',
    jurisdiction: 'bihar',
    serviceType: 'welfare',
    summary: 'Apply online for Priority Household (PHH) or Antyodaya (AAY) Ration Card, add new family members, or surrender cards under National Food Security Act.',
    officialPortal: 'http://epds.bihar.gov.in',
    officialPortalName: 'EPDS Bihar (Food & Consumer Protection Dept)',
    processingTime: '30 to 45 working days',
    estimatedFee: 'Free (₹0 government statutory fee)',
    eligibility: [
      'Economically weaker families residing in Bihar without an existing active ration card anywhere in India',
      'Must satisfy NFSA exclusion criteria (no four-wheeler, no government employee in family)'
    ],
    requiredDocuments: [
      'Combined joint family group photograph',
      'Aadhaar Card copies of all declared family members',
      'Bank passbook of female head of family (mandatory for DBT subsidies)',
      'Residential proof and income self-declaration'
    ],
    steps: [
      'Access the EPDS Bihar RCMS portal (epds.bihar.gov.in) and click "Apply for Online Ration Card".',
      'Register with head of family mobile number and complete OTP verification.',
      'Fill in applicant details, rural/urban classification, block, panchayat, and residential address.',
      'Add each family member name, relation, age, and individual 12-digit Aadhaar number.',
      'Answer statutory exclusion questionnaires regarding vehicle ownership, income tax, and land size.',
      'Upload combined family photo, Aadhaar scans, and bank passbook first page.',
      'Submit the application and download the acknowledgement slip for Sub-Divisional Officer (SDO) field verification.'
    ],
    trackUrl: 'http://epds.bihar.gov.in'
  },
  {
    id: 'bihar-student-credit-card-service',
    title: 'Bihar Student Credit Card: Portal Application & DRCC Booking (MNSSBY)',
    category: 'Education & Student Services',
    jurisdiction: 'bihar',
    serviceType: 'welfare',
    summary: 'Step-by-step assistance for online registration, fee invoice upload, and District Registration and Counselling Centre (DRCC) slot booking for education loans.',
    officialPortal: 'https://www.7nishchay-yuvaupmission.bihar.gov.in',
    officialPortalName: 'MNSSBY Portal (Govt of Bihar)',
    processingTime: '30 to 45 working days following DRCC verification',
    estimatedFee: 'Free (₹0 application fee)',
    eligibility: [
      '12th pass students from recognized Bihar educational boards admitted to approved degree/diploma courses',
      'Age under 25 years for Undergraduate courses; under 30 years for Post-graduate courses'
    ],
    requiredDocuments: [
      '10th and 12th Marksheets & Certificates',
      'College Admission Letter with official Course Fee Structure',
      'Aadhaar Card and PAN Card of Student and Co-borrower (Parent/Guardian)',
      'Passport size photos and Bank Passbook (6-month statement)'
    ],
    steps: [
      'Register as a new user on the MNSSBY portal (7nishchay-yuvaupmission.bihar.gov.in).',
      'Verify mobile and email via OTP, then log in and select "Bihar Student Credit Card (BSCC)".',
      'Enter personal bio-data, 10th/12th school records, and co-applicant parent details.',
      'Enter admitted College/University name, course details, and total course fee schedule.',
      'Select appointment date and time for physical document verification at your district DRCC.',
      'Download the filled Application Form and visit DRCC with original documents on your scheduled date.'
    ],
    trackUrl: 'https://www.7nishchay-yuvaupmission.bihar.gov.in'
  },
  {
    id: 'bihar-nal-jal-grievance',
    title: 'Har Ghar Nal Ka Jal: Connection Grievance & Maintenance (PHED Bihar)',
    category: 'Public Utilities & Water',
    jurisdiction: 'bihar',
    serviceType: 'utility',
    summary: 'File formal complaints and service requests for damaged water taps, motor pump breakdowns, pipeline leakages, and new household tap connections under Saat Nischay.',
    officialPortal: 'https://lokshikayat.bihar.gov.in',
    officialPortalName: 'Bihar Lok Shikayat & PHED Portal',
    processingTime: '7 to 15 working days for grievance redressal',
    estimatedFee: 'Free (₹0 complaint registration)',
    eligibility: [
      'Any resident household or ward member in Bihar experiencing piped water supply disruptions or awaiting tap connection'
    ],
    requiredDocuments: [
      'Ward Number, Panchayat, Block, and District details',
      'Description of pipeline/motor fault and photo (optional)',
      'Applicant mobile number for grievance tracking'
    ],
    steps: [
      'Visit the Bihar Public Grievance portal (lokshikayat.bihar.gov.in) or call the toll-free PHED helpline (1800-345-6450).',
      'Select "नया परिवाद दर्ज करें" (File New Grievance).',
      'Enter mobile number, receive OTP, and enter citizen contact details.',
      'Select Department: "लोक स्वास्थ्य अभियंत्रण विभाग" (PHED) or "पंचायती राज विभाग".',
      'State grievance details: Motor pump malfunction, dry pipeline, or household tap repair needed.',
      'Submit the complaint to receive a unique Grievance Tracking Number (परिवाद संख्या) with statutory resolution time under Bihar Public Grievance Redressal Act.'
    ],
    trackUrl: 'https://lokshikayat.bihar.gov.in'
  }
];
