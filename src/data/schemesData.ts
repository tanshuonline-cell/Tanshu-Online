import { GovernmentScheme } from '../types';

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    "id": "pm-kisan",
    "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    "hindiName": "प्रधानमंत्री किसान सम्मान निधि",
    "ministry": "Ministry of Agriculture & Farmers Welfare",
    "hindiMinistry": "कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार",
    "targetBeneficiaries": "Small and marginal landholding farmer families across India",
    "hindiTargetBeneficiaries": "पूरे भारत में छोटे और सीमांत भूमिधारक किसान परिवार",
    "financialBenefit": "₹6,000 per year transferred in three equal installments of ₹2,000 directly via DBT",
    "hindiFinancialBenefit": "प्रति वर्ष ₹6,000 की वित्तीय सहायता, ₹2,000 की तीन समान किस्तों में सीधे बैंक खाते में (DBT द्वारा)",
    "summary": "Central sector initiative providing income support to all landholding farmers to supplement financial requirements for procuring agricultural inputs and domestic needs.",
    "hindiSummary": "किसानों को कृषि आदानों (बीज, खाद) और घरेलू आवश्यकताओं को पूरा करने के लिए निश्चित आय सहायता प्रदान करने वाली केंद्रीय क्षेत्र की प्रमुख योजना।",
    "eligibility": [
      "Farmer families holding cultivable land in their names in state revenue records",
      "Exclusions: Institutional landholders, serving/retired government employees, income tax payees, doctors, engineers, lawyers"
    ],
    "hindiEligibility": [
      "जिन किसान परिवारों के नाम राज्य के राजस्व अभिलेखों में कृषि योग्य भूमि दर्ज है",
      "अपवर्जन: संस्थागत भू-स्वामी, सेवारत/सेवानिवृत्त सरकारी कर्मचारी, आयकर दाता, डॉक्टर, इंजीनियर, वकील आदि"
    ],
    "documentsRequired": [
      "Aadhaar Card (Mandatory for biometric/OTP e-KYC)",
      "Land Ownership Record (Khatauni / Jamabandi / RoR)",
      "Aadhaar-seeded Active Bank Account with NPCI mapping",
      "Valid Mobile Number linked with Aadhaar"
    ],
    "hindiDocumentsRequired": [
      "आधार कार्ड (बायोमेट्रिक/ओटीपी e-KYC हेतु अनिवार्य)",
      "जमीन के स्वामित्व का अभिलेख (खतौनी / जमाबंदी / खतियान नकल)",
      "आधार से जुड़ा और NPCI से मैप किया हुआ सक्रिय बैंक खाता",
      "आधार से लिंक वैध मोबाइल नंबर"
    ],
    "howToApply": [
      "Visit the official PM-KISAN portal (pmkisan.gov.in).",
      "Go to \"Farmers Corner\" and select \"New Farmer Registration\".",
      "Choose Rural Farmer Registration or Urban Farmer Registration.",
      "Enter Aadhaar number and registered mobile number, then select your State.",
      "Authenticate with Aadhaar OTP and enter District, Sub-District, Block, and Village.",
      "Input land details: Survey/Khata number, Khasra number, land transfer date, and area in hectares.",
      "Upload copy of land registry document and submit for State Revenue Officer approval."
    ],
    "hindiHowToApply": [
      "आधिकारिक पीएम-किसान पोर्टल (pmkisan.gov.in) पर जाएँ।",
      "\"Farmers Corner\" में जाकर \"New Farmer Registration\" चुनें।",
      "ग्रामीण किसान पंजीकरण (Rural) या शहरी किसान पंजीकरण (Urban) का चयन करें।",
      "आधार नंबर और मोबाइल नंबर दर्ज करें तथा अपना राज्य चुनें।",
      "आधार ओटीपी सत्यापन करें और जिला, उप-जिला, ब्लॉक व गांव का चयन करें।",
      "जमीन का ब्योरा दर्ज करें: सर्वे/खाता संख्या, खसरा संख्या, भूमि हस्तांतरण तिथि और हेक्टेयर में रकबा।",
      "जमीन के दस्तावेज की प्रति अपलोड करें और राज्य राजस्व सत्यापन हेतु सबमिट करें।"
    ],
    "officialPortal": "https://pmkisan.gov.in"
  },
  {
    "id": "ayushman-bharat",
    "name": "Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)",
    "hindiName": "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना",
    "ministry": "National Health Authority (NHA), MoHFW",
    "hindiMinistry": "राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA), स्वास्थ्य एवं परिवार कल्याण मंत्रालय",
    "targetBeneficiaries": "Over 55 crore vulnerable citizens covering bottom 40% of population + all senior citizens aged 70+",
    "hindiTargetBeneficiaries": "देश के 55 करोड़ से अधिक कमजोर नागरिक (निचले 40% परिवार) + 70 वर्ष व उससे अधिक आयु के सभी वरिष्ठ नागरिक",
    "financialBenefit": "₹5,00,000 free cashless secondary and tertiary hospitalization cover per family per year",
    "hindiFinancialBenefit": "प्रति वर्ष प्रति परिवार ₹5,00,000 का निःशुल्क कैशलेस द्वितीयक एवं तृतीयक अस्पताल उपचार कवर",
    "summary": "The world’s largest public health assurance scheme, providing secondary and tertiary care hospitalization across public and empaneled private hospitals nationwide with no pre-existing disease exclusion.",
    "hindiSummary": "विश्व की सबसे बड़ी सार्वजनिक स्वास्थ्य बीमा योजना, जो बिना किसी पूर्व बीमारी भेदभाव के देश भर के सभी सरकारी और सूचीबद्ध निजी अस्पतालों में कैशलेस इलाज की सुविधा देती है।",
    "eligibility": [
      "Households identified under SECC 2011 deprivation criteria (D1 to D7) and active NFSA Ration Card holders",
      "Recently expanded: ALL senior citizens aged 70 years and above, irrespective of economic status, receive a dedicated ₹5 Lakh top-up cover"
    ],
    "hindiEligibility": [
      "एसईसीसी 2011 वंचना मानदंडों (D1 से D7) और सक्रिय एनएफएसए राशन कार्ड धारक परिवार",
      "नवीनतम विस्तार: आर्थिक स्थिति की परवाह किए बिना 70 वर्ष या उससे अधिक आयु के सभी वरिष्ठ नागरिकों को ₹5 लाख का समर्पित टॉप-अप स्वास्थ्य कवर"
    ],
    "documentsRequired": [
      "Aadhaar Card with mobile OTP capability",
      "Ration Card / NFSA Ration Card / Family ID (PPP/Jan Aadhaar)",
      "Age proof verifying 70+ years (for senior citizen category)"
    ],
    "hindiDocumentsRequired": [
      "मोबाइल ओटीपी युक्त आधार कार्ड",
      "राशन कार्ड / एनएफएसए राशन कार्ड / परिवार आईडी",
      "वरिष्ठ नागरिक श्रेणी हेतु 70+ वर्ष प्रमाणित करने वाला आयु प्रमाण पत्र"
    ],
    "howToApply": [
      "Visit the Ayushman Beneficiary Portal (beneficiary.nha.gov.in).",
      "Select \"Beneficiary\" login and enter your mobile number for OTP.",
      "Search beneficiary status by State, Scheme (PMJAY), and identifier (Aadhaar or Family ID).",
      "If family record is listed, click \"e-KYC\" next to your name.",
      "Authenticate with Aadhaar OTP, capture live webcam photo, and submit.",
      "Once verified by District Implementation Unit (DIU), download your official Ayushman Golden Card."
    ],
    "hindiHowToApply": [
      "आयुष्मान लाभार्थी पोर्टल (beneficiary.nha.gov.in) पर जाएँ।",
      "\"Beneficiary\" लॉगिन चुनें और ओटीपी के लिए अपना मोबाइल नंबर दर्ज करें।",
      "राज्य, योजना (PMJAY), और पहचानकर्ता (आधार या राशन कार्ड) द्वारा लाभार्थी स्थिति खोजें।",
      "यदि परिवार का नाम सूचीबद्ध है, तो अपने नाम के आगे \"e-KYC\" पर क्लिक करें।",
      "आधार ओटीपी से प्रमाणीकरण करें, लाइव वेबकैम फोटो लें और सबमिट करें।",
      "जिला कार्यान्वयन इकाई द्वारा सत्यापन के बाद अपना आधिकारिक आयुष्मान गोल्डन कार्ड डाउनलोड करें।"
    ],
    "officialPortal": "https://beneficiary.nha.gov.in"
  },
  {
    "id": "pm-awas-yojana",
    "name": "Pradhan Mantri Awas Yojana (PMAY-Gramin & Urban 2.0)",
    "hindiName": "प्रधानमंत्री आवास योजना (ग्रामीण एवं शहरी)",
    "ministry": "Ministry of Housing and Urban Affairs & Ministry of Rural Development",
    "hindiMinistry": "आवास एवं शहरी कार्य मंत्रालय तथा ग्रामीण विकास मंत्रालय, भारत सरकार",
    "targetBeneficiaries": "Houseless families and those living in kutcha or dilapidated houses",
    "hindiTargetBeneficiaries": "बेघर परिवार और कच्चे अथवा जीर्ण-शीर्ण मकानों में रहने वाले पात्र नागरिक",
    "financialBenefit": "₹1.20 Lakh (Plains) to ₹1.30 Lakh (Hilly/NE states) grant in PMAY-G + Interest Subsidy up to ₹1.80 Lakh in Urban",
    "hindiFinancialBenefit": "PMAY-G में ₹1.20 लाख (मैदानी) से ₹1.30 लाख (पहाड़ी/पूर्वोत्तर) का प्रत्यक्ष अनुदान + PMAY-शहरी में ₹1.80 लाख तक की ब्याज सब्सिडी",
    "summary": "Flagship initiative aiming to provide permanent pucca houses equipped with basic amenities (hygienic cooking space, electricity connection under Saubhagya, tap water under Jal Jeevan Mission, and toilet under Swachh Bharat).",
    "hindiSummary": "बुनियादी सुविधाओं (रसोई घर, सौभाग्य योजना से बिजली, जल जीवन मिशन से नल का जल, और स्वच्छ भारत से शौचालय) से युक्त पक्के मकान उपलब्ध कराने का राष्ट्रीय मिशन।",
    "eligibility": [
      "Beneficiary family must not own a pucca house anywhere in India",
      "Annual household income within EWS (up to ₹3 Lakh) or LIG (₹3 to ₹6 Lakh) brackets"
    ],
    "hindiEligibility": [
      "लाभार्थी परिवार के पास भारत में कहीं भी अपना कोई पक्का मकान नहीं होना चाहिए",
      "पारिवारिक वार्षिक आय ईडब्ल्यूएस (₹3 लाख तक) या एलआईजी (₹3 से ₹6 लाख) सीमा के भीतर हो"
    ],
    "documentsRequired": [
      "Aadhaar Card of all adult family members",
      "Bank Account Passbook with Aadhaar linkage",
      "MGNREGA Job Card number (for 90-95 days unskilled labor component)",
      "Consent letter and land title or certificate of land allotment"
    ],
    "hindiDocumentsRequired": [
      "परिवार के सभी वयस्क सदस्यों के आधार कार्ड",
      "आधार से जुड़ा बैंक खाता पासबुक",
      "मनरेगा जॉब कार्ड नंबर (90-95 दिनों की अकुशल मजदूरी सहायता हेतु)",
      "जमीन का स्वामित्व दस्तावेज या भूमि आवंटन प्रमाण पत्र"
    ],
    "howToApply": [
      "For PMAY-G: Beneficiaries are identified from SECC list and validated by Gram Sabha.",
      "Contact your local Gram Panchayat / Block Development Officer (BDO) or CSC Kendra.",
      "For PMAY-Urban 2.0: Visit the official pmaymis.gov.in portal and click \"Citizen Assessment\".",
      "Enter Aadhaar number and verify name format against official database.",
      "Fill family income, present residential address, and bank account details.",
      "Submit the assessment and track via your Assessment ID."
    ],
    "hindiHowToApply": [
      "ग्रामीण (PMAY-G) हेतु: लाभार्थी चयन एसईसीसी सूची और ग्राम सभा अनुमोदन द्वारा होता है।",
      "अपनी स्थानीय ग्राम पंचायत / प्रखंड विकास पदाधिकारी (BDO) अथवा सीएससी केंद्र से संपर्क करें।",
      "शहरी (PMAY-Urban) हेतु: आधिकारिक pmaymis.gov.in पोर्टल पर जाएँ और \"Citizen Assessment\" चुनें।",
      "आधार संख्या दर्ज करें और सरकारी डेटाबेस से नाम का सत्यापन करें।",
      "परिवार की आय, वर्तमान पता और बैंक खाते का विवरण भरें।",
      "आवेदन जमा करें और मूल्यांकन आईडी (Assessment ID) से प्रगति ट्रैक करें।"
    ],
    "officialPortal": "https://pmaymis.gov.in"
  },
  {
    "id": "pm-vishwakarma",
    "name": "PM Vishwakarma Scheme",
    "hindiName": "पीएम विश्वकर्मा योजना",
    "ministry": "Ministry of Micro, Small and Medium Enterprises (MSME)",
    "hindiMinistry": "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय (MSME), भारत सरकार",
    "targetBeneficiaries": "Traditional artisans and craftspeople across 18 traditional trades (carpenters, blacksmiths, goldsmiths, potters, cobblers, tailors, etc.)",
    "hindiTargetBeneficiaries": "18 पारंपरिक व्यवसायों से जुड़े शिल्पकार और दस्तकार (बढ़ई, लोहार, सुनार, कुम्हार, मोची, दर्जी, राजमिस्त्री आदि)",
    "financialBenefit": "Collateral-free enterprise loans up to ₹3 Lakh at concessional 5% interest + ₹15,000 modern toolkit e-voucher + ₹500/day training stipend",
    "hindiFinancialBenefit": "बिना किसी गारंटी के 5% रियायती ब्याज पर ₹3 लाख तक का व्यवसाय ऋण + ₹15,000 का आधुनिक टूलकिट ई-वाउचर + प्रशिक्षण के दौरान ₹500 प्रतिदिन स्टाइपेंड",
    "summary": "Holistic support mechanism recognizing traditional artisans as Vishwakarma, providing formal digital ID, skill upgrade training, financial credit, and market linkages.",
    "hindiSummary": "पारंपरिक कारीगरों को विश्वकर्मा के रूप में आधिकारिक पहचान, डिजिटल आईडी, आधुनिक कौशल प्रशिक्षण, टूलकिट और रियायती ऋण देकर सशक्त बनाने की समग्र योजना।",
    "eligibility": [
      "An artisan or craftsperson working with hands and tools in one of the 18 eligible trades",
      "Minimum age 18 years on the date of registration",
      "Limited to one member per family with no active loans under PMEGP or PM Mudra"
    ],
    "hindiEligibility": [
      "18 पात्र पारंपरिक व्यवसायों में से किसी एक में हाथों और औजारों से कार्य करने वाला कारीगर",
      "पंजीकरण की तिथि पर न्यूनतम आयु 18 वर्ष पूरी होनी चाहिए",
      "प्रति परिवार एक सदस्य को लाभ, तथा पीएमईजीपी या मुद्रा योजना में कोई सक्रिय ऋण न हो"
    ],
    "documentsRequired": [
      "Aadhaar Card and Mobile number",
      "Bank Account details (account number, IFSC code)",
      "Ration Card / Family Composition Certificate",
      "Active trade proof or verification by Gram Panchayat / Urban Local Body"
    ],
    "hindiDocumentsRequired": [
      "आधार कार्ड और आधार से जुड़ा मोबाइल नंबर",
      "बैंक खाता विवरण (खाता संख्या, आईएफएससी कोड)",
      "राशन कार्ड / परिवार विवरण प्रमाण पत्र",
      "पारंपरिक कार्य का प्रमाण अथवा ग्राम पंचायत/शहरी निकाय द्वारा अनुशंसा"
    ],
    "howToApply": [
      "Artisans can register at nearest CSC Kendra or via official portal (pmvishwakarma.gov.in).",
      "Complete Aadhaar biometric authentication at the CSC counter.",
      "Select your trade from the 18 eligible traditional crafts.",
      "Fill bank account and family details for stipend and credit eligibility.",
      "Stage 1 Gram Panchayat / ULB verification is conducted, followed by District Committee screening.",
      "Receive official PM Vishwakarma Certificate & Digital ID card."
    ],
    "hindiHowToApply": [
      "नजदीकी सीएससी (CSC) केंद्र पर जाएँ अथवा आधिकारिक पोर्टल (pmvishwakarma.gov.in) पर जाएँ।",
      "सीएससी काउंटर पर आधार बायोमेट्रिक प्रमाणीकरण पूरा करें।",
      "18 पात्र पारंपरिक शिल्पों में से अपना व्यवसाय चुनें।",
      "स्टाइपेंड और ऋण लाभ हेतु बैंक खाता और परिवार का विवरण भरें।",
      "ग्राम पंचायत/शहरी निकाय द्वारा प्रथम चरण का सत्यापन, जिसके बाद जिला समिति की जांच होती है।",
      "सत्यापन के उपरांत आधिकारिक पीएम विश्वकर्मा प्रमाण पत्र और डिजिटल आईडी कार्ड प्राप्त करें।"
    ],
    "officialPortal": "https://pmvishwakarma.gov.in"
  },
  {
    "id": "e-shram-card",
    "name": "e-Shram Portal (National Database of Unorganized Workers)",
    "hindiName": "ई-श्रम कार्ड (असंगठित कर्मकार पंजीयन)",
    "ministry": "Ministry of Labour and Employment",
    "hindiMinistry": "श्रम एवं रोजगार मंत्रालय, भारत सरकार",
    "targetBeneficiaries": "Unorganized workers aged 16-59 (construction workers, migrant labor, street vendors, domestic workers, gig workers)",
    "hindiTargetBeneficiaries": "16 से 59 वर्ष की आयु के असंगठित क्षेत्र के कामगार (निर्माण श्रमिक, प्रवासी मजदूर, रेहड़ी-पटरी विक्रेता, घरेलू कामगार, गिग वर्कर्स आदि)",
    "financialBenefit": "Universal 12-digit UAN card, ₹2 Lakh accidental death/permanent disability cover, and priority access to social security welfare",
    "hindiFinancialBenefit": "सार्वभौमिक 12-अंकीय यूएएन (UAN) कार्ड, दुर्घटना में मृत्यु या स्थायी विकलांगता पर ₹2,00,000 का बीमा कवर, और सभी सामाजिक सुरक्षा योजनाओं में प्राथमिकता",
    "summary": "Centralized registry facilitating seamless portability of national social security benefits, emergency livelihood assistance, and direct welfare transfers to unorganized sector workers.",
    "hindiSummary": "असंगठित क्षेत्र के कामगारों को राष्ट्रीय सामाजिक सुरक्षा योजनाओं का सीधा लाभ पहुंचाने और आपातकालीन आजीविका सहायता प्रदान करने हेतु केंद्रीकृत डिजिटल डेटाबेस।",
    "eligibility": [
      "Any unorganized worker aged between 16 and 59 years",
      "Must NOT be a member of EPFO (Provident Fund) or ESIC (Employees State Insurance)",
      "Must NOT be an income tax payee"
    ],
    "hindiEligibility": [
      "16 से 59 वर्ष की आयु का कोई भी असंगठित क्षेत्र का कामगार",
      "ईपीएफओ (EPFO) अथवा ईएसआईसी (ESIC) का सदस्य नहीं होना चाहिए",
      "आयकर (Income Tax) दाता नहीं होना चाहिए"
    ],
    "documentsRequired": [
      "Aadhaar Card with linked mobile number",
      "Active Bank Account details (Account Number, Bank Name, IFSC)",
      "Educational and occupational trade declaration"
    ],
    "hindiDocumentsRequired": [
      "आधार कार्ड और उससे लिंक सक्रिय मोबाइल नंबर",
      "सक्रिय बैंक खाता विवरण (खाता संख्या, बैंक नाम, आईएफएससी)",
      "शैक्षणिक योग्यता एवं प्राथमिक कार्य/कौशल की स्व-घोषणा"
    ],
    "howToApply": [
      "Visit eshram.gov.in and click \"Register on e-Shram\".",
      "Enter Aadhaar linked mobile number and captcha.",
      "Enter the OTP sent to mobile and complete Aadhaar e-KYC.",
      "Fill in personal details, nominee details, current address, and primary occupation.",
      "Enter bank account information where welfare benefits will be credited.",
      "Review the preview summary and download your 12-digit Universal Account Number (UAN) e-Shram card."
    ],
    "hindiHowToApply": [
      "eshram.gov.in पोर्टल पर जाएँ और \"Register on e-Shram\" पर क्लिक करें।",
      "आधार से लिंक मोबाइल नंबर और सुरक्षा कैप्चा दर्ज करें।",
      "मोबाइल पर प्राप्त ओटीपी दर्ज करें और आधार ई-केवाईसी पूरा करें।",
      "व्यक्तिगत विवरण, नामांकित व्यक्ति (Nominee), वर्तमान पता और प्राथमिक पेशा भरें।",
      "बैंक खाते का विवरण दर्ज करें जहाँ सरकारी सहायता राशि भेजी जा सके।",
      "विवरण की समीक्षा करें और अपना 12 अंकों का यूनिवर्सल अकाउंट नंबर (UAN) ई-श्रम कार्ड डाउनलोड करें।"
    ],
    "officialPortal": "https://eshram.gov.in"
  },
  {
    "id": "sukanya-samriddhi",
    "name": "Sukanya Samriddhi Yojana (Beti Bachao Beti Padhao)",
    "hindiName": "सुकन्या समृद्धि योजना",
    "ministry": "Ministry of Finance & Department of Posts",
    "hindiMinistry": "वित्त मंत्रालय एवं डाक विभाग, भारत सरकार",
    "targetBeneficiaries": "Parents or legal guardians of girl children aged below 10 years",
    "hindiTargetBeneficiaries": "10 वर्ष से कम आयु की बालिकाओं के माता-पिता अथवा कानूनी अभिभावक",
    "financialBenefit": "High sovereign-backed compound interest (currently 8.2% p.a.) with Triple Tax Exemption (EEE) under Section 80C",
    "hindiFinancialBenefit": "सरकार द्वारा समर्थित उच्च चक्रवृद्धि ब्याज (वर्तमान में 8.2% वार्षिक) और धारा 80C के तहत तिहरी कर छूट (EEE)",
    "summary": "Small-savings government initiative aimed at securing education and marriage expenses for girl children through disciplined, tax-exempt long-term savings.",
    "hindiSummary": "बालिकाओं की उच्च शिक्षा और विवाह के खर्चों को सुरक्षित करने के लिए शुरू की गई सुरक्षित, कर-मुक्त दीर्घकालिक लघु बचत योजना।",
    "eligibility": [
      "Account can be opened by parents/guardians for a girl child from her birth until age 10",
      "Maximum two accounts per family (with exception for twins/triplets)"
    ],
    "hindiEligibility": [
      "बालिका के जन्म से लेकर 10 वर्ष की आयु पूरी होने तक खाता खोला जा सकता है",
      "एक परिवार में अधिकतम दो बालिकाओं के लिए खाता (जुड़वां/तिड़वां बच्चियों के मामले में अपवाद)"
    ],
    "documentsRequired": [
      "Birth Certificate of the girl child issued by municipal authority",
      "Aadhaar Card and PAN of the parent/guardian",
      "Proof of residence (Electricity bill, Aadhaar, Passport)",
      "Passport size photographs of parent and child"
    ],
    "hindiDocumentsRequired": [
      "नगर निगम/पंचायत द्वारा जारी बालिका का जन्म प्रमाण पत्र",
      "माता-पिता/अभिभावक का आधार कार्ड और पैन कार्ड",
      "निवास का प्रमाण (बिजली बिल, आधार, पासपोर्ट आदि)",
      "अभिभावक और बच्ची की पासपोर्ट साइज फोटो"
    ],
    "howToApply": [
      "Collect Form SSA-1 from any Post Office branch or authorized commercial bank (SBI, PNB, BoB, etc.).",
      "Fill applicant details: Girl child name, birth date, guardian name, initial deposit amount (minimum ₹250).",
      "Attach copy of child birth certificate and guardian KYC documents.",
      "Submit form with initial cash or cheque deposit at counter.",
      "Receive your physical Sukanya Samriddhi Passbook with account number."
    ],
    "hindiHowToApply": [
      "किसी भी डाकघर शाखा अथवा अधिकृत बैंक (SBI, PNB, BoB आदि) से फॉर्म SSA-1 प्राप्त करें।",
      "विवरण भरें: बच्ची का नाम, जन्म तिथि, अभिभावक का नाम, और प्रारंभिक जमा राशि (न्यूनतम ₹250)।",
      "बच्ची के जन्म प्रमाण पत्र और अभिभावक के केवाईसी दस्तावेजों की प्रति संलग्न करें।",
      "काउंटर पर फॉर्म के साथ नकद अथवा चेक द्वारा प्रारंभिक राशि जमा करें।",
      "खाता संख्या युक्त अपनी भौतिक सुकन्या समृद्धि पासबुक प्राप्त करें।"
    ],
    "officialPortal": "https://www.indiapost.gov.in"
  },
  {
    "id": "mukhyamantri-udyami-yojana",
    "name": "Mukhyamantri Udyami Yojana (SC/ST/EBC/Mahila/Yuva)",
    "hindiName": "मुख्यमंत्री उद्यमी योजना (बिहार सरकार)",
    "ministry": "Department of Industries (उद्योग विभाग), Government of Bihar",
    "hindiMinistry": "उद्योग विभाग, बिहार सरकार",
    "targetBeneficiaries": "Unemployed youth and women entrepreneurs (18-50 years) residing in Bihar for setting up micro/small industrial enterprises",
    "hindiTargetBeneficiaries": "बिहार के बेरोजगार युवा एवं महिला उद्यमी (18-50 वर्ष) जो नया सूक्ष्म/लघु उद्योग स्थापित करना चाहते हैं",
    "financialBenefit": "Up to ₹10,00,000 Total Project Assistance: ₹5,00,000 non-refundable grant (50% subsidy) + ₹5,00,000 loan (0% interest for SC/ST/EBC/Women; 1% for Yuva/BC) repayable in 84 monthly installments",
    "hindiFinancialBenefit": "कुल ₹10,00,000 की परियोजना सहायता: ₹5,00,000 का अनुदान (50% सब्सिडी) + ₹5,00,000 का ऋण (SC/ST/EBC/महिलाओं हेतु 0% ब्याज; युवा/BC हेतु मात्र 1% ब्याज) 84 किस्तों में प्रतिदेय",
    "summary": "Flagship entrepreneurship scheme under Saat Nischay-2 (Yuva Shakti - Bihar Ki Pragati) supporting new manufacturing and service enterprise units across 50+ approved project categories with modern machinery capital.",
    "hindiSummary": "सात निश्चय-2 (युवा शक्ति - बिहार की प्रगति) के अंतर्गत 50 से अधिक अनुमोदित विनिर्माण व सेवा इकाइयों की स्थापना हेतु आधुनिक मशीनरी और कार्यशील पूंजी प्रदान करने वाली प्रमुख उद्यमिता योजना।",
    "eligibility": [
      "Permanent resident of Bihar aged between 18 and 50 years on application date",
      "Minimum educational qualification: 10+2 / Intermediate, ITI, Polytechnic Diploma, or equivalent graduation",
      "Enterprise must be registered as a Proprietorship firm with an active Current Account in enterprise name",
      "No previous loan default under PMEGP or Central/State government schemes"
    ],
    "hindiEligibility": [
      "आवेदन की तिथि पर 18 से 50 वर्ष की आयु का बिहार का स्थायी निवासी",
      "न्यूनतम शैक्षणिक योग्यता: 10+2 / इंटरमीडिएट, आईटीआई, पॉलिटेक्निक डिप्लोमा अथवा समकक्ष स्नातक",
      "इकाई प्रोप्राइटरशिप के रूप में निबंधित होनी चाहिए और इकाई के नाम से चालू खाता (Current Account) खुला होना चाहिए",
      "पीएमईजीपी या अन्य सरकारी ऋण योजनाओं में कोई पूर्व ऋण डिफ़ॉल्ट न हो"
    ],
    "documentsRequired": [
      "Aadhaar Card and PAN Card of applicant",
      "Matriculation (10th) certificate for proof of date of birth",
      "Intermediate (12th) / ITI / Polytechnic / Graduation passing certificate and marksheet",
      "Caste Certificate issued by Revenue Officer (for SC, ST, EBC categories)",
      "Permanent Residence / Domicile Certificate issued by RTPS Bihar",
      "Current Account statement and cancelled cheque in the enterprise name",
      "GSTIN and Udyam Aadhar Registration (required upon final selection)"
    ],
    "hindiDocumentsRequired": [
      "आवेदक का आधार कार्ड और पैन कार्ड",
      "जन्म तिथि प्रमाण हेतु 10वीं का प्रमाण पत्र (मैट्रिकुलेशन)",
      "इंटरमीडिएट (12वीं) / आईटीआई / पॉलिटेक्निक / स्नातक का अंकपत्र व प्रमाण पत्र",
      "राजस्व अधिकारी द्वारा जारी जाति प्रमाण पत्र (SC, ST, EBC श्रेणी हेतु)",
      "बिहार का स्थायी निवास / मूल निवास प्रमाण पत्र",
      "संस्थान के नाम से चालू खाता का विवरण और रद्द चेक (Cancelled Cheque)",
      "अंतिम चयन पर जीएसटी एवं उद्यम आधार पंजीकरण"
    ],
    "howToApply": [
      "Visit the official portal (udyami.bihar.gov.in) when the Department of Industries notifies the annual application window.",
      "Click \"पंजीकरण\" (Register) and enter your Aadhaar Number, choose Category (SC/ST, EBC, Mahila, Yuva), and verify mobile OTP.",
      "Log in with received credentials and fill applicant personal particulars and enterprise details.",
      "Select project category from 50+ approved trades (e.g. Food Processing, Readymade Garments, Wooden Furniture, Plastic Molding, Fabrication).",
      "Upload scanned PDFs of educational certificates, caste certificate, residence certificate, and cancelled cheque.",
      "Submit the application to receive your unique Registration Acknowledgement Number.",
      "Beneficiaries are shortlisted through computerized lottery scrutiny followed by 2-week mandatory training."
    ],
    "hindiHowToApply": [
      "उद्योग विभाग द्वारा आवेदन विंडो खोलने पर आधिकारिक पोर्टल (udyami.bihar.gov.in) पर जाएँ।",
      "\"पंजीकरण\" पर क्लिक करें, आधार नंबर डालें, वर्ग (SC/ST, EBC, महिला, युवा) चुनें और ओटीपी से सत्यापित करें।",
      "प्राप्त क्रेडेंशियल से लॉगिन कर व्यक्तिगत एवं प्रस्तावित उद्योग की जानकारी भरें।",
      "50+ अनुमोदित शिल्पों में से अपना प्रोजेक्ट चुनें (जैसे खाद्य प्रसंस्करण, रेडीमेड गारमेंट्स, फर्नीचर, प्लास्टिक मोल्डिंग आदि)।",
      "शैक्षणिक प्रमाण पत्र, जाति प्रमाण पत्र, निवास प्रमाण पत्र और बैंक चेक की पीडीएफ स्कैन कॉपी अपलोड करें।",
      "आवेदन सबमिट करें और अपना विशिष्ट पंजीकरण पावती नंबर सुरक्षित रखें।",
      "कंप्यूटरीकृत लॉटरी जांच के बाद चयनित लाभार्थियों को 2 सप्ताह का अनिवार्य प्रशिक्षण दिया जाता है।"
    ],
    "officialPortal": "https://udyami.bihar.gov.in",
    "jurisdiction": "bihar",
    "category": "employment"
  },
  {
    "id": "mukhyamantri-kanya-utthan-yojana",
    "name": "Mukhyamantri Kanya Utthan Yojana (Medhasoft Graduation & Inter Protsahan)",
    "hindiName": "मुख्यमंत्री कन्या उत्थान योजना",
    "ministry": "Social Welfare Department & Education Department, Government of Bihar",
    "hindiMinistry": "समाज कल्याण विभाग एवं शिक्षा विभाग, बिहार सरकार",
    "targetBeneficiaries": "Girl children and female students in Bihar from birth through graduate degree completion",
    "hindiTargetBeneficiaries": "बिहार की कन्याएं और छात्राएं — जन्म से लेकर स्नातक डिग्री पूरी करने तक",
    "financialBenefit": "₹50,000 one-time direct DBT upon graduation (from recognized Bihar universities) + ₹25,000 for unmarried 12th pass girls + ₹10,000 for 10th 1st division (Cumulative benefits up to ₹54,100 from birth)",
    "hindiFinancialBenefit": "स्नातक उत्तीर्ण पर ₹50,000 एकमुश्त डायरेक्ट DBT + अविवाहित 12वीं उत्तीर्ण पर ₹25,000 + 10वीं प्रथम श्रेणी पर ₹10,000 (जन्म से स्नातक तक कुल ₹54,100 के संचयी लाभ)",
    "summary": "Holistic state initiative under Saat Nischay (Sashakt Mahila - Saksham Mahila) eliminating female infanticide, promoting girl child higher education, and ending child marriage through direct bank transfers.",
    "hindiSummary": "सात निश्चय (सशक्त महिला - सक्षम महिला) के तहत कन्या भ्रूण हत्या रोकने, बाल विवाह पर रोक लगाने और बालिकाओं को उच्च शिक्षा के लिए प्रोत्साहित करने वाली क्रांतिकारी योजना।",
    "eligibility": [
      "Girl student must be a permanent resident of Bihar",
      "For Graduation Pass benefit (₹50,000): Student must have passed degree from a university recognized by UGC and Bihar State Government",
      "For 12th / Inter Pass benefit (₹25,000): Girl student must be unmarried on the date of result publication",
      "Bank account must be in beneficiary’s own name in a Bihar-based branch and seeded with Aadhaar (NPCI mapped)"
    ],
    "hindiEligibility": [
      "छात्रा बिहार राज्य की स्थायी निवासी होनी चाहिए",
      "स्नातक प्रोत्साहन (₹50,000) हेतु: यूजीसी और बिहार सरकार से मान्यता प्राप्त विश्वविद्यालय से डिग्री उत्तीर्ण हो",
      "इंटरमीडिएट (₹25,000) हेतु: परिणाम जारी होने की तिथि पर छात्रा का अविवाहित होना अनिवार्य है",
      "बैंक खाता बिहार स्थित बैंक शाखा में छात्रा के अपने नाम पर और आधार से डीबीटी-सक्षम (NPCI मैप्ड) होना चाहिए"
    ],
    "documentsRequired": [
      "Aadhaar Card of the female student",
      "Graduation / 12th Admit Card, Registration Slip, and Final Marksheet",
      "Permanent Residence Certificate (निवास प्रमाण पत्र) issued by RTPS Bihar",
      "Bank Passbook first page (showing IFSC, Account No, and Student Name)",
      "Active mobile number and valid email address"
    ],
    "hindiDocumentsRequired": [
      "छात्रा का आधार कार्ड",
      "स्नातक / 12वीं का प्रवेश पत्र (Admit Card), रजिस्ट्रेशन स्लिप और अंतिम मार्कशीट",
      "आरटीपीएस बिहार द्वारा जारी स्थायी निवास प्रमाण पत्र",
      "बैंक पासबुक का पहला पृष्ठ (IFSC, खाता संख्या और छात्रा का नाम स्पष्ट दिखे)",
      "सक्रिय मोबाइल नंबर और वैध ईमेल आईडी"
    ],
    "howToApply": [
      "Visit Medhasoft portal (medhasoft.bih.nic.in) and select \"Mukhyamantri Kanya Utthan Yojana (Graduation / Inter)\".",
      "Click \"Student Registration\" and accept student declarations.",
      "Enter University Name, Registration/Roll Number, and Final Marksheet Mark/CGPA to verify institutional record.",
      "Verify student Aadhaar number, name as per Aadhaar, and date of birth.",
      "Enter active bank account details (must be a branch located inside Bihar).",
      "Receive login User ID and Password via SMS following initial server verification.",
      "Log in, verify application details, and finalize submission for direct DBT disbursement into your bank account."
    ],
    "hindiHowToApply": [
      "मेधासॉफ्ट पोर्टल (medhasoft.bih.nic.in) पर जाएँ और \"मुख्यमंत्री कन्या उत्थान योजना\" चुनें।",
      "\"Student Registration\" पर क्लिक करें और दिशा-निर्देश स्वीकार करें।",
      "विश्वविद्यालय का नाम, रजिस्ट्रेशन/रोल नंबर और मार्कशीट का प्राप्तांक दर्ज कर सत्यापन करें।",
      "छात्रा का आधार नंबर, आधार में दर्ज नाम और जन्म तिथि का मिलान करें।",
      "बिहार स्थित सक्रिय बैंक खाते का विवरण भरें।",
      "सर्वर सत्यापन के उपरांत एसएमएस से यूजर आईडी और पासवर्ड प्राप्त करें।",
      "लॉगिन कर विवरण की पुष्टि करें और बैंक खाते में सीधे डीबीटी भुगतान हेतु आवेदन को फाइनलाइज करें।"
    ],
    "officialPortal": "https://medhasoft.bih.nic.in",
    "jurisdiction": "bihar",
    "category": "women"
  },
  {
    "id": "bihar-student-credit-card-yojana",
    "name": "Bihar Student Credit Card Yojana (BSCCY - MNSSBY Education Loan)",
    "hindiName": "बिहार स्टूडेंट क्रेडिट कार्ड योजना (MNSSBY)",
    "ministry": "Education Department & Planning & Development Department, Government of Bihar",
    "hindiMinistry": "शिक्षा विभाग तथा योजना एवं विकास विभाग, बिहार सरकार",
    "targetBeneficiaries": "12th pass Bihar youth pursuing approved technical, professional, or general higher education courses",
    "hindiTargetBeneficiaries": "तकनीकी, व्यावसायिक अथवा सामान्य उच्च शिक्षा पाठ्यक्रमों में नामांकित 12वीं उत्तीर्ण बिहार के युवा",
    "financialBenefit": "Collateral-free, guarantor-free education loan up to ₹4,00,000 at 1% simple interest for girls, transgender, and divyang students (4% simple interest for boys) with complete moratorium during course + 1 year",
    "hindiFinancialBenefit": "बिना किसी बंधक (Collateral) और बिना गारंटर के ₹4,00,000 तक का शिक्षा ऋण — छात्राओं, दिव्यांगों व थर्ड जेंडर हेतु मात्र 1% साधारण ब्याज पर (छात्रों हेतु 4% ब्याज), पूरे कोर्स + 1 वर्ष तक कोई ब्याज/किस्त नहीं",
    "summary": "Flagship education finance scheme under Saat Nischay (Aarthik Hal, Yuvaon Ko Bal) ensuring that financial constraints never prevent Bihar students from pursuing B.Tech, MBBS, BBA, BCA, GNM, B.Sc Nursing, and 40+ professional courses.",
    "hindiSummary": "सात निश्चय (आर्थिक हल, युवाओं को बल) के अंतर्गत आर्थिक तंगी के कारण उच्च शिक्षा से वंचित न होने देने का संकल्प, जो बी.टेक, एमबीबीएस, बीबीए, बीसीए, नर्सिंग सहित 40+ पाठ्यक्रमों हेतु ऋण उपलब्ध कराता है।",
    "eligibility": [
      "Resident of Bihar who has passed Intermediate (12th) from Bihar School Examination Board (BSEB) or recognized CBSE/ICSE schools located in Bihar",
      "Enrolled or admitted in higher education institutions recognized by NAAC, NIRF, or Bihar State Higher Education Council",
      "Age not exceeding 25 years on the date of application (up to 30 years for post-graduate courses)",
      "Parent or legal guardian acts as co-borrower"
    ],
    "hindiEligibility": [
      "बिहार का मूल निवासी जिसने बिहार बोर्ड (BSEB) अथवा बिहार में स्थित मान्यता प्राप्त सीबीएसई/आईसीएसई से 12वीं उत्तीर्ण की हो",
      "एनएएसी (NAAC), एनआईआरएफ (NIRF) अथवा राज्य उच्चतर शिक्षा परिषद से अनुमोदित संस्थान में नामांकित हो",
      "आवेदन की तिथि पर सामान्यतः 25 वर्ष से कम आयु (स्नातकोत्तर पाठ्यक्रमों हेतु 30 वर्ष तक)",
      "माता-पिता अथवा अभिभावक सह-आवेदक (Co-borrower) के रूप में अनिवार्य"
    ],
    "documentsRequired": [
      "10th and 12th Marksheets, Passing Certificates, and Admit Cards",
      "College/Institute Admission Offer Letter and authorized official Course Fee Schedule",
      "Aadhaar Card of Student and Co-applicant (Father/Mother/Guardian)",
      "PAN Card of Student and Co-applicant",
      "Permanent Residence Certificate issued by RTPS Bihar",
      "Bank Passbook of Student (showing 6-month transaction history)",
      "Two recent passport-size color photographs of student and co-applicant"
    ],
    "hindiDocumentsRequired": [
      "10वीं और 12वीं की अंकतालिका, उत्तीर्ण प्रमाण पत्र और प्रवेश पत्र",
      "संस्थान का नामांकन पत्र (Admission Letter) और आधिकारिक कोर्स फीस संरचना",
      "छात्र और सह-आवेदक (माता/पिता/अभिभावक) का आधार कार्ड",
      "छात्र और सह-आवेदक का पैन कार्ड (PAN Card)",
      "आरटीपीएस बिहार द्वारा जारी स्थायी निवास प्रमाण पत्र",
      "छात्र का 6 माह का बैंक खाता विवरण (पासबुक प्रति)",
      "छात्र और अभिभावक की दो-दो पासपोर्ट साइज रंगीन फोटो"
    ],
    "howToApply": [
      "Open the MNSSBY portal (7nishchay-yuvaupmission.bihar.gov.in) and click \"New Applicant Registration\".",
      "Verify mobile number and email ID with OTP and choose \"Bihar Student Credit Card\" scheme.",
      "Fill in applicant academic history, co-applicant details, and course/fee information.",
      "Select a convenient appointment date and time for document scrutiny at your local District Registration and Counselling Centre (DRCC).",
      "Print the generated PDF application receipt and DRCC counter token.",
      "Visit DRCC with original and 2 sets of self-attested photocopies on the scheduled appointment date for biometric verification.",
      "Upon field and institutional verification, loan agreement is executed and tuition fees are disbursed directly to college."
    ],
    "hindiHowToApply": [
      "एमएनएसएसबीवाई पोर्टल (7nishchay-yuvaupmission.bihar.gov.in) पर जाएँ और \"New Applicant Registration\" चुनें।",
      "ओटीपी से मोबाइल व ईमेल सत्यापित करें और \"बिहार स्टूडेंट क्रेडिट कार्ड\" योजना का चयन करें।",
      "शैक्षणिक इतिहास, सह-आवेदक अभिभावक का विवरण और कॉलेज फीस का ब्योरा दर्ज करें।",
      "अपने जिले के डीआरसीसी (DRCC) केंद्र पर भौतिक दस्तावेज जांच हेतु सुविधाजनक समय और तिथि बुक करें।",
      "आवेदन पावती और डीआरसीसी टोकन स्लिप का प्रिंट लें।",
      "निर्धारित तिथि पर मूल दस्तावेजों और 2 सेट स्व-हस्ताक्षरित प्रतियों के साथ डीआरसीसी केंद्र जाकर बायोमेट्रिक सत्यापन कराएं।",
      "सत्यापन के बाद ऋण अनुबंध निष्पादित होता है और फीस सीधे कॉलेज के खाते में भेजी जाती है।"
    ],
    "officialPortal": "https://www.7nishchay-yuvaupmission.bihar.gov.in",
    "jurisdiction": "bihar",
    "category": "youth"
  },
  {
    "id": "kushal-yuva-program-kyp",
    "name": "Kushal Yuva Program (KYP Skill Training - Saat Nischay)",
    "hindiName": "कुशल युवा कार्यक्रम (KYP)",
    "ministry": "Bihar Skill Development Mission (BSDM), Department of Labour Resources, Govt of Bihar",
    "hindiMinistry": "बिहार कौशल विकास मिशन (BSDM), श्रम संसाधन विभाग, बिहार सरकार",
    "targetBeneficiaries": "Youth aged 15-28 years (with age relaxation for SC/ST/OBC/Divyang) who have passed 10th or 12th class",
    "hindiTargetBeneficiaries": "15 से 28 वर्ष के युवा (SC/ST/OBC/दिव्यांग हेतु आयु छूट) जिन्होंने 10वीं या 12वीं कक्षा उत्तीर्ण की हो",
    "financialBenefit": "240 Hours 100% Free Skill Training covering Computer Literacy (BS-CIT), English/Hindi Communication (BS-CLS), and Soft Skills (BS-CSS) with state certification and refund of ₹1,000 security deposit upon passing",
    "hindiFinancialBenefit": "240 घंटे का 100% निःशुल्क प्रशिक्षण: कंप्यूटर साक्षरता (BS-CIT), संवाद कौशल (BS-CLS) और व्यवहार कौशल (BS-CSS) राज्य प्रमाण पत्र के साथ, तथा कोर्स पूरा होने पर ₹1,000 प्रतिभूति राशि की पूरी वापसी",
    "summary": "Skill enhancement mission under Saat Nischay bridging the employability gap for Bihar youth through state-of-the-art interactive digital classrooms across every block in Bihar.",
    "hindiSummary": "सात निश्चय के तहत बिहार के प्रत्येक प्रखंड में स्थापित आधुनिक डिजिटल कक्षाओं के माध्यम से युवाओं के रोजगार कौशल और आत्मविश्वास को बढ़ाने का राज्यव्यापी मिशन।",
    "eligibility": [
      "Resident of Bihar aged 15 to 28 years (General), up to 31 years (BC/EBC), up to 33 years (SC/ST/Divyang)",
      "Minimum educational qualification: 10th standard pass from a recognized board",
      "Should not be currently enrolled in regular college during training class timings"
    ],
    "hindiEligibility": [
      "बिहार का स्थायी निवासी जिसकी आयु 15 से 28 वर्ष हो (सामान्य), 31 वर्ष तक (BC/EBC), 33 वर्ष तक (SC/ST/दिव्यांग)",
      "मान्यता प्राप्त बोर्ड से न्यूनतम 10वीं (मैट्रिक) उत्तीर्ण",
      "प्रशिक्षण कक्षाओं के समय किसी नियमित कॉलेज में अध्ययनरत नहीं होना चाहिए"
    ],
    "documentsRequired": [
      "10th (Matriculation) Marksheet and Passing Certificate",
      "Aadhaar Card of the applicant",
      "Permanent Residence Certificate (निवास प्रमाण पत्र)",
      "Active Bank Account details (Passbook copy) for security deposit refund",
      "Two passport-size color photographs"
    ],
    "hindiDocumentsRequired": [
      "10वीं (मैट्रिक) की अंकतालिका एवं उत्तीर्ण प्रमाण पत्र",
      "आवेदक का आधार कार्ड",
      "स्थायी निवास प्रमाण पत्र (RTPS द्वारा जारी)",
      "सुरक्षा राशि वापसी हेतु सक्रिय बैंक खाता विवरण (पासबुक प्रति)",
      "दो पासपोर्ट साइज रंगीन फोटो"
    ],
    "howToApply": [
      "Register online at 7nishchay-yuvaupmission.bihar.gov.in and select \"Kushal Yuva Program (KYP)\".",
      "Fill in personal bio-data, educational details, and home address.",
      "Book a verification appointment at your district DRCC.",
      "Visit DRCC with original documents for biometric capture and document validation.",
      "Obtain DRCC endorsement slip and visit your nearest block KYP Skill Center.",
      "Deposit ₹1,000 refundable security caution money (returned to student bank account upon completing 240 hours course and passing examination)."
    ],
    "hindiHowToApply": [
      "7nishchay-yuvaupmission.bihar.gov.in पर ऑनलाइन पंजीकरण करें और \"Kushal Yuva Program\" चुनें।",
      "व्यक्तिगत बायोडाटा, शैक्षणिक योग्यता और घर का पता दर्ज करें।",
      "जिले के डीआरसीसी केंद्र पर सत्यापन के लिए स्लॉट बुक करें।",
      "मूल दस्तावेजों के साथ डीआरसीसी जाकर बायोमेट्रिक उपस्थिति और कागजात सत्यापित कराएं।",
      "डीआरसीसी पावती रसीद लेकर अपने नजदीकी प्रखंड केवाईपी कौशल केंद्र पर संपर्क करें।",
      "₹1,000 की वापसी योग्य जमानत राशि जमा करें (जो 240 घंटे का प्रशिक्षण पूरा करने और परीक्षा उत्तीर्ण करने पर सीधे बैंक खाते में वापस आ जाती है)।"
    ],
    "officialPortal": "https://skillmissionbihar.org",
    "jurisdiction": "bihar",
    "category": "youth"
  },
  {
    "id": "swayam-sahayata-bhatta-yojana",
    "name": "Mukhyamantri Swayam Sahayata Bhatta Yojana (MNSSBY Allowance)",
    "hindiName": "मुख्यमंत्री स्वयं सहायता भत्ता योजना",
    "ministry": "Planning & Development Department, Government of Bihar",
    "hindiMinistry": "योजना एवं विकास विभाग, बिहार सरकार",
    "targetBeneficiaries": "Unemployed youth aged 20-25 years who have passed 12th class and are actively looking for employment",
    "hindiTargetBeneficiaries": "12वीं उत्तीर्ण 20 से 25 वर्ष के बेरोजगार युवा जो रोजगार की तलाश में सक्रिय हैं",
    "financialBenefit": "₹1,000 per month direct bank transfer for a maximum duration of 24 months (2 years / Total ₹24,000) along with mandatory free KYP computer and language training",
    "hindiFinancialBenefit": "अधिकतम 2 वर्ष (24 माह) तक ₹1,000 प्रति माह सीधे बैंक खाते में (कुल ₹24,000) तथा साथ में अनिवार्य निःशुल्क केवाईपी कंप्यूटर प्रशिक्षण",
    "summary": "Social security and livelihood support scheme under Saat Nischay supporting educated unemployed youth with financial assistance during their competitive exam preparation and job search.",
    "hindiSummary": "सात निश्चय के तहत शिक्षित बेरोजगार युवाओं को प्रतियोगी परीक्षाओं की तैयारी और नौकरी की तलाश के दौरान आर्थिक संबल प्रदान करने वाली सामाजिक सुरक्षा योजना।",
    "eligibility": [
      "Resident citizen of Bihar aged between 20 and 25 years",
      "Must have passed 12th / Intermediate and NOT be pursuing higher regular education",
      "Should be actively seeking employment and not engaged in any private or public salaried employment",
      "Must not be availing benefits under Student Credit Card scheme or any other state scholarship"
    ],
    "hindiEligibility": [
      "बिहार का मूल निवासी जिसकी आयु 20 से 25 वर्ष के बीच हो",
      "12वीं (इंटरमीडिएट) उत्तीर्ण हो और उच्चतर नियमित शिक्षा ग्रहण न कर रहा हो",
      "रोजगार की तलाश में हो और किसी सरकारी या निजी वेतनभोगी पद पर कार्यरत न हो",
      "स्टूडेंट क्रेडिट कार्ड योजना या अन्य किसी राज्य छात्रवृत्ति का लाभ न ले रहा हो"
    ],
    "documentsRequired": [
      "12th / Intermediate Passing Certificate and Marksheet",
      "10th Certificate (proof of date of birth)",
      "Permanent Residence Certificate of Bihar",
      "Aadhaar Card and Active Bank Account Passbook (Aadhaar-seeded)",
      "Self-declaration certifying non-enrollment in higher studies and unemployment status"
    ],
    "hindiDocumentsRequired": [
      "12वीं (इंटरमीडिएट) का उत्तीर्ण प्रमाण पत्र और अंकतालिका",
      "10वीं का प्रमाण पत्र (जन्म तिथि के साक्ष्य हेतु)",
      "बिहार का स्थायी निवास प्रमाण पत्र",
      "आधार कार्ड और आधार से जुड़ा सक्रिय बैंक खाता पासबुक",
      "बेरोजगार होने और उच्च शिक्षा में नामांकित न होने का स्व-घोषणा पत्र"
    ],
    "howToApply": [
      "Register on the MNSSBY portal (7nishchay-yuvaupmission.bihar.gov.in).",
      "Fill in application for \"Mukhyamantri Swayam Sahayata Bhatta Yojana (SHSY)\".",
      "Schedule an appointment slot at your District Registration and Counselling Centre (DRCC).",
      "Visit DRCC with original certificates for biometric verification and counter approval.",
      "Enroll in the mandatory 240-hour KYP training at your designated block center.",
      "Monthly ₹1,000 allowance is transferred directly into your Aadhaar-linked bank account on successful verification."
    ],
    "hindiHowToApply": [
      "एमएनएसएसबीवाई पोर्टल (7nishchay-yuvaupmission.bihar.gov.in) पर पंजीकरण करें।",
      "\"मुख्यमंत्री स्वयं सहायता भत्ता योजना (SHSY)\" के आवेदन पत्र को भरें।",
      "अपने जिले के डीआरसीसी (DRCC) केंद्र का सत्यापन स्लॉट चुनें।",
      "मूल प्रमाण पत्रों के साथ डीआरसीसी केंद्र जाकर बायोमेट्रिक सत्यापन पूरा कराएं।",
      "प्रखंड कौशल केंद्र पर 240 घंटे के अनिवार्य केवाईपी प्रशिक्षण में दाखिला लें।",
      "सत्यापन के उपरांत प्रति माह ₹1,000 का भत्ता सीधे आपके आधार-लिंक्ड बैंक खाते में भेजा जाता है।"
    ],
    "officialPortal": "https://www.7nishchay-yuvaupmission.bihar.gov.in",
    "jurisdiction": "bihar",
    "category": "employment"
  }
];
