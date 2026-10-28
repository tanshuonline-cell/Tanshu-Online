import { GovernmentScheme } from '../types';

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    targetBeneficiaries: 'Small and marginal landholding farmer families across India',
    financialBenefit: '₹6,000 per year transferred in three equal installments of ₹2,000 directly via DBT',
    summary: 'Central sector initiative providing income support to all landholding farmers to supplement financial requirements for procuring agricultural inputs and domestic needs.',
    eligibility: [
      'Farmer families holding cultivable land in their names in state revenue records',
      'Exclusions: Institutional landholders, serving/retired government employees, income tax payees, doctors, engineers, lawyers'
    ],
    documentsRequired: [
      'Aadhaar Card (Mandatory for biometric/OTP e-KYC)',
      'Land Ownership Record (Khatauni / Jamabandi / RoR)',
      'Aadhaar-seeded Active Bank Account with NPCI mapping',
      'Valid Mobile Number linked with Aadhaar'
    ],
    howToApply: [
      'Visit the official PM-KISAN portal (pmkisan.gov.in).',
      'Go to "Farmers Corner" and select "New Farmer Registration".',
      'Choose Rural Farmer Registration or Urban Farmer Registration.',
      'Enter Aadhaar number and registered mobile number, then select your State.',
      'Authenticate with Aadhaar OTP and enter District, Sub-District, Block, and Village.',
      'Input land details: Survey/Khata number, Khasra number, land transfer date, and area in hectares.',
      'Upload copy of land registry document and submit for State Revenue Officer approval.'
    ],
    officialPortal: 'https://pmkisan.gov.in'
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)',
    hindiName: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
    ministry: 'National Health Authority (NHA), MoHFW',
    targetBeneficiaries: 'Over 55 crore vulnerable citizens covering bottom 40% of population + all senior citizens aged 70+',
    financialBenefit: '₹5,00,000 free cashless secondary and tertiary hospitalization cover per family per year',
    summary: 'The world’s largest public health assurance scheme, providing secondary and tertiary care hospitalization across public and empaneled private hospitals nationwide with no pre-existing disease exclusion.',
    eligibility: [
      'Households identified under SECC 2011 deprivation criteria (D1 to D7) and active NFSA Ration Card holders',
      'Recently expanded: ALL senior citizens aged 70 years and above, irrespective of economic status, receive a dedicated ₹5 Lakh top-up cover'
    ],
    documentsRequired: [
      'Aadhaar Card with mobile OTP capability',
      'Ration Card / NFSA Ration Card / Family ID (PPP/Jan Aadhaar)',
      'Age proof verifying 70+ years (for senior citizen category)'
    ],
    howToApply: [
      'Visit the Ayushman Beneficiary Portal (beneficiary.nha.gov.in).',
      'Select "Beneficiary" login and enter your mobile number for OTP.',
      'Search beneficiary status by State, Scheme (PMJAY), and identifier (Aadhaar or Family ID).',
      'If family record is listed, click "e-KYC" next to your name.',
      'Authenticate with Aadhaar OTP, capture live webcam photo, and submit.',
      'Once verified by District Implementation Unit (DIU), download your official Ayushman Golden Card.'
    ],
    officialPortal: 'https://beneficiary.nha.gov.in'
  },
  {
    id: 'pm-awas-yojana',
    name: 'Pradhan Mantri Awas Yojana (PMAY-Gramin & Urban 2.0)',
    hindiName: 'प्रधानमंत्री आवास योजना (ग्रामीण एवं शहरी)',
    ministry: 'Ministry of Housing and Urban Affairs & Ministry of Rural Development',
    targetBeneficiaries: 'Houseless families and those living in kutcha or dilapidated houses',
    financialBenefit: '₹1.20 Lakh (Plains) to ₹1.30 Lakh (Hilly/NE states) grant in PMAY-G + Interest Subsidy up to ₹1.80 Lakh in Urban',
    summary: 'Flagship initiative aiming to provide permanent pucca houses equipped with basic amenities (hygienic cooking space, electricity connection under Saubhagya, tap water under Jal Jeevan Mission, and toilet under Swachh Bharat).',
    eligibility: [
      'Beneficiary family must not own a pucca house anywhere in India',
      'Annual household income within EWS (up to ₹3 Lakh) or LIG (₹3 to ₹6 Lakh) brackets'
    ],
    documentsRequired: [
      'Aadhaar Card of all adult family members',
      'Bank Account Passbook with Aadhaar linkage',
      'MGNREGA Job Card number (for 90-95 days unskilled labor component)',
      'Consent letter and land title or certificate of land allotment'
    ],
    howToApply: [
      'For PMAY-G: Beneficiaries are identified from SECC list and validated by Gram Sabha.',
      'Contact your local Gram Panchayat / Block Development Officer (BDO) or CSC Kendra.',
      'For PMAY-Urban 2.0: Visit the official pmaymis.gov.in portal and click "Citizen Assessment".',
      'Enter Aadhaar number and verify name format against official database.',
      'Fill family income, present residential address, and bank account details.',
      'Submit the assessment and track via your Assessment ID.'
    ],
    officialPortal: 'https://pmaymis.gov.in'
  },
  {
    id: 'pm-vishwakarma',
    name: 'PM Vishwakarma Scheme',
    hindiName: 'पीएम विश्वकर्मा योजना',
    ministry: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
    targetBeneficiaries: 'Traditional artisans and craftspeople across 18 traditional trades (carpenters, blacksmiths, goldsmiths, potters, cobblers, tailors, etc.)',
    financialBenefit: 'Collateral-free enterprise loans up to ₹3 Lakh at concessional 5% interest + ₹15,000 modern toolkit e-voucher + ₹500/day training stipend',
    summary: 'Holistic support mechanism recognizing traditional artisans as Vishwakarma, providing formal digital ID, skill upgrade training, financial credit, and market linkages.',
    eligibility: [
      'An artisan or craftsperson working with hands and tools in one of the 18 eligible trades',
      'Minimum age 18 years on the date of registration',
      'Limited to one member per family with no active loans under PMEGP or PM Mudra'
    ],
    documentsRequired: [
      'Aadhaar Card and Mobile number',
      'Bank Account details (account number, IFSC code)',
      'Ration Card / Family Composition Certificate',
      'Active trade proof or verification by Gram Panchayat / Urban Local Body'
    ],
    howToApply: [
      'Artisans can register at nearest CSC Kendra or via official portal (pmvishwakarma.gov.in).',
      'Complete Aadhaar biometric authentication at the CSC counter.',
      'Select your trade from the 18 eligible traditional crafts.',
      'Fill bank account and family details for stipend and credit eligibility.',
      'Stage 1 Gram Panchayat / ULB verification is conducted, followed by District Committee screening.',
      'Receive official PM Vishwakarma Certificate & Digital ID card.'
    ],
    officialPortal: 'https://pmvishwakarma.gov.in'
  },
  {
    id: 'e-shram-card',
    name: 'e-Shram Portal (National Database of Unorganized Workers)',
    hindiName: 'ई-श्रम कार्ड (असंगठित कर्मकार पंजीयन)',
    ministry: 'Ministry of Labour and Employment',
    targetBeneficiaries: 'Unorganized workers aged 16-59 (construction workers, migrant labor, street vendors, domestic workers, gig workers)',
    financialBenefit: 'Universal 12-digit UAN card, ₹2 Lakh accidental death/permanent disability cover, and priority access to social security welfare',
    summary: 'Centralized registry facilitating seamless portability of national social security benefits, emergency livelihood assistance, and direct welfare transfers to unorganized sector workers.',
    eligibility: [
      'Any unorganized worker aged between 16 and 59 years',
      'Must NOT be a member of EPFO (Provident Fund) or ESIC (Employees State Insurance)',
      'Must NOT be an income tax payee'
    ],
    documentsRequired: [
      'Aadhaar Card with linked mobile number',
      'Active Bank Account details (Account Number, Bank Name, IFSC)',
      'Educational and occupational trade declaration'
    ],
    howToApply: [
      'Visit eshram.gov.in and click "Register on e-Shram".',
      'Enter Aadhaar linked mobile number and captcha.',
      'Enter the OTP sent to mobile and complete Aadhaar e-KYC.',
      'Fill in personal details, nominee details, current address, and primary occupation.',
      'Enter bank account information where welfare benefits will be credited.',
      'Review the preview summary and download your 12-digit Universal Account Number (UAN) e-Shram card.'
    ],
    officialPortal: 'https://eshram.gov.in'
  },
  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana (Beti Bachao Beti Padhao)',
    hindiName: 'सुकन्या समृद्धि योजना',
    ministry: 'Ministry of Finance & Department of Posts',
    targetBeneficiaries: 'Parents or legal guardians of girl children aged below 10 years',
    financialBenefit: 'High sovereign-backed compound interest (currently 8.2% p.a.) with Triple Tax Exemption (EEE) under Section 80C',
    summary: 'Small-savings government initiative aimed at securing education and marriage expenses for girl children through disciplined, tax-exempt long-term savings.',
    eligibility: [
      'Account can be opened by parents/guardians for a girl child from her birth until age 10',
      'Maximum two accounts per family (with exception for twins/triplets)'
    ],
    documentsRequired: [
      'Birth Certificate of the girl child issued by municipal authority',
      'Aadhaar Card and PAN of the parent/guardian',
      'Proof of residence (Electricity bill, Aadhaar, Passport)',
      'Passport size photographs of parent and child'
    ],
    howToApply: [
      'Collect Form SSA-1 from any Post Office branch or authorized commercial bank (SBI, PNB, BoB, etc.).',
      'Fill applicant details: Girl child name, birth date, guardian name, initial deposit amount (minimum ₹250).',
      'Attach copy of child birth certificate and guardian KYC documents.',
      'Submit form with initial cash or cheque deposit at counter.',
      'Receive your physical Sukanya Samriddhi Passbook with account number.'
    ],
    officialPortal: 'https://www.indiapost.gov.in'
  }
];
