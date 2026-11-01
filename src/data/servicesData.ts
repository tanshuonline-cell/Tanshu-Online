import { GovernmentService } from '../types';

export const GOVERNMENT_SERVICES: GovernmentService[] = [
  {
    "id": "aadhaar-services",
    "title": "Aadhaar Card Services (UIDAI)",
    "hindiTitle": "आधार कार्ड सेवाएं (UIDAI)",
    "category": "Identity & Biometrics",
    "hindiCategory": "पहचान एवं बायोमेट्रिक्स",
    "summary": "Download electronic Aadhaar (e-Aadhaar), update address online, verify Aadhaar number, check mobile/email link, and order durable PVC Aadhaar card directly from UIDAI.",
    "hindiSummary": "इलेक्ट्रॉनिक आधार (e-Aadhaar) डाउनलोड करें, ऑनलाइन पता अपडेट करें, आधार संख्या सत्यापित करें, मोबाइल/ईमेल लिंक जांचें, और सीधे यूआईडीएआई (UIDAI) से टिकाऊ पीवीसी आधार कार्ड ऑर्डर करें।",
    "officialPortal": "https://myaadhaar.uidai.gov.in",
    "officialPortalName": "myAadhaar Portal (UIDAI)",
    "hindiOfficialPortalName": "माई आधार पोर्टल (UIDAI)",
    "processingTime": "Instant download / 5-7 working days for PVC delivery",
    "hindiProcessingTime": "तुरंत डाउनलोड / पीवीसी कार्ड डाक द्वारा 5-7 कार्य दिवस में",
    "estimatedFee": "Free for e-Aadhaar / ₹50 for PVC Card delivery",
    "hindiEstimatedFee": "ई-आधार निःशुल्क / पीवीसी कार्ड ऑर्डर हेतु ₹50",
    "eligibility": [
      "All Indian citizens, NRIs, and resident foreign nationals residing in India",
      "Valid registered mobile number for OTP authentication"
    ],
    "hindiEligibility": [
      "भारत में रहने वाले सभी भारतीय नागरिक, अनिवासी भारतीय (NRI), और पात्र विदेशी नागरिक",
      "ओटीपी सत्यापन के लिए आधार में पंजीकृत सक्रिय मोबाइल नंबर अनिवार्य"
    ],
    "requiredDocuments": [
      "Proof of Identity (POI) e.g., PAN, Voter ID, Passport",
      "Proof of Address (POA) e.g., Electricity Bill, Ration Card, Bank Passbook",
      "Head of Family (HOF) consent for address update without proof"
    ],
    "hindiRequiredDocuments": [
      "पहचान का प्रमाण (POI) जैसे पैन कार्ड, वोटर आईडी, पासपोर्ट",
      "पते का प्रमाण (POA) जैसे बिजली बिल, राशन कार्ड, बैंक पासबुक",
      "बिना दस्तावेजी प्रमाण के पते में सुधार हेतु परिवार के मुखिया (HOF) की सहमति"
    ],
    "steps": [
      "Visit the official UIDAI myAadhaar portal (myaadhaar.uidai.gov.in).",
      "Click \"Login\" using your 12-digit Aadhaar Number and Captcha code.",
      "Enter the one-time password (OTP) received on your registered mobile number.",
      "Select your required service: Download e-Aadhaar, Order Aadhaar PVC Card, or Update Address.",
      "For Address Update: Upload color scan of supporting document or enter HOF Aadhaar details.",
      "Submit the request and save the Service Request Number (SRN) for tracking."
    ],
    "hindiSteps": [
      "यूआईडीएआई के आधिकारिक माई आधार पोर्टल (myaadhaar.uidai.gov.in) पर जाएँ।",
      "अपना 12 अंकों का आधार नंबर और कैप्चा कोड दर्ज करके \"Login\" पर क्लिक करें।",
      "पंजीकृत मोबाइल नंबर पर प्राप्त वन-टाइम पासवर्ड (OTP) दर्ज करें।",
      "वांछित सेवा चुनें: e-Aadhaar डाउनलोड, PVC कार्ड ऑर्डर, या पता अपडेट।",
      "पता अपडेट के लिए: सहायक दस्तावेज की रंगीन कॉपी अपलोड करें अथवा परिवार के मुखिया (HOF) का विवरण दर्ज करें।",
      "आवेदन जमा करें और स्थिति ट्रैक करने हेतु सर्विस रिक्वेस्ट नंबर (SRN) सुरक्षित रखें।"
    ],
    "trackUrl": "https://myaadhaar.uidai.gov.in/check-aadhaar-status"
  },
  {
    "id": "pan-card-services",
    "title": "PAN Card Services (Protean / UTIITSL / e-Filing)",
    "hindiTitle": "पैन कार्ड सेवाएं (Protean / UTIITSL / e-Filing)",
    "category": "Taxation & Financial ID",
    "hindiCategory": "कर एवं वित्तीय पहचान",
    "summary": "Apply for fresh Permanent Account Number (Form 49A), get instant paperless e-PAN within 10 minutes via Aadhaar e-KYC, link PAN with Aadhaar, or correct personal details.",
    "hindiSummary": "नए स्थायी खाता संख्या (Form 49A) के लिए आवेदन करें, आधार ई-केवाईसी के माध्यम से 10 मिनट में तुरंत पेपरलेस ई-पैन प्राप्त करें, पैन को आधार से लिंक करें, या व्यक्तिगत विवरण में सुधार करें।",
    "officialPortal": "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
    "officialPortalName": "Protean TIN-NSDL Portal & Income Tax e-Filing",
    "hindiOfficialPortalName": "प्रोटीन TIN-NSDL पोर्टल एवं आयकर ई-फाइलिंग",
    "processingTime": "Instant (e-PAN) / 10-15 business days for physical card delivery",
    "hindiProcessingTime": "तत्काल e-PAN / भौतिक कार्ड डिलीवरी 10-15 कार्य दिवस में",
    "estimatedFee": "Instant e-PAN: Free / Physical Card: ₹107 (India) or ₹1,017 (Abroad)",
    "hindiEstimatedFee": "तत्काल e-PAN: निःशुल्क / भौतिक कार्ड: ₹107 (भारत में) अथवा ₹1,017 (विदेश में)",
    "eligibility": [
      "Any individual, business, Hindu Undivided Family (HUF), or trust in India",
      "For instant e-PAN: Must have Aadhaar linked with mobile number and no prior PAN allotted"
    ],
    "hindiEligibility": [
      "भारत में कोई भी व्यक्ति, गैर-सरकारी संस्थान, हिंदू अविभाजित परिवार (HUF), या ट्रस्ट",
      "तत्काल e-PAN हेतु: आधार से मोबाइल नंबर लिंक होना चाहिए और पहले से कोई पैन आवंटित नहीं होना चाहिए"
    ],
    "requiredDocuments": [
      "Aadhaar Card (serves as POI, POA, and Date of Birth proof)",
      "Digital signature and passport photo (if applying via standard physical dispatch)"
    ],
    "hindiRequiredDocuments": [
      "आधार कार्ड (पहचान, पता और जन्म तिथि तीनों प्रमाणों के रूप में मान्य)",
      "डिजिटल हस्ताक्षर और पासपोर्ट साइज फोटो (पारंपरिक डाक आवेदन के लिए)"
    ],
    "steps": [
      "Choose method: Instant e-PAN via Income Tax Portal or Physical PAN via Protean/UTIITSL.",
      "Fill Form 49A with full name, father name, date of birth, and communication address.",
      "Select whether physical PAN card is required or only electronic e-PAN.",
      "Authenticate using Aadhaar biometric/OTP e-KYC or upload scanned signature & photo.",
      "Pay online processing fee (₹107) and download the 15-digit Acknowledgement Slip."
    ],
    "hindiSteps": [
      "आवेदन माध्यम चुनें: आयकर पोर्टल से तत्काल e-PAN अथवा Protean/UTIITSL से भौतिक पैन कार्ड।",
      "फॉर्म 49A में पूरा नाम, पिता का नाम, जन्म तिथि और पत्राचार का पता भरें।",
      "चुनें कि केवल डिजिटल ई-पैन चाहिए या भौतिक प्लास्टिक कार्ड भी मंगवाना है।",
      "आधार ओटीपी/बायोमेट्रिक ई-केवाईसी से सत्यापित करें या फोटो व हस्ताक्षर अपलोड करें।",
      "निर्धारित ऑनलाइन शुल्क (₹107) का भुगतान करें और 15-अंकीय पावती रसीद डाउनलोड करें।"
    ],
    "trackUrl": "https://tin.tin.nsdl.com/pantan/StatusTrack.html"
  },
  {
    "id": "voter-services",
    "title": "Voter ID Card Services (ECI Voters Portal)",
    "hindiTitle": "मतदाता पहचान पत्र सेवाएं (ECI वोटर पोर्टल)",
    "category": "Electoral Services",
    "hindiCategory": "निर्वाचन सेवाएं",
    "summary": "Enroll as a new voter (Form 6), apply for shifting or correction of voter card details (Form 8), download digital e-EPIC card, or check your name in the electoral roll.",
    "hindiSummary": "नए मतदाता के रूप में पंजीकरण (प्रारूप 6), पते में बदलाव या विवरण सुधार (प्रारूप 8), डिजिटल e-EPIC कार्ड डाउनलोड, या मतदाता सूची में अपना नाम जांचें।",
    "officialPortal": "https://voters.eci.gov.in",
    "officialPortalName": "Election Commission of India (ECI) Voters Portal",
    "hindiOfficialPortalName": "भारत निर्वाचन आयोग (ECI) वोटर पोर्टल",
    "processingTime": "15 to 30 days following BLO field verification",
    "hindiProcessingTime": "बीएलओ (BLO) स्थलीय सत्यापन के बाद 15 से 30 दिन",
    "estimatedFee": "100% Free of Cost",
    "hindiEstimatedFee": "100% पूर्णतः निःशुल्क",
    "eligibility": [
      "Indian citizen who has attained 18 years of age on qualifying dates (Jan 1, Apr 1, Jul 1, Oct 1)",
      "Ordinarily resident in the constituency where registration is sought"
    ],
    "hindiEligibility": [
      "भारतीय नागरिक जिसकी आयु पात्रता तिथि (1 जनवरी, 1 अप्रैल, 1 जुलाई, 1 अक्टूबर) को 18 वर्ष पूरी हो चुकी हो",
      "संबंधित विधानसभा निर्वाचन क्षेत्र का सामान्य निवासी हो"
    ],
    "requiredDocuments": [
      "Age Proof (Birth Certificate, 10th Marksheet, Aadhaar, PAN, or Passport)",
      "Current Residence Proof (Electricity Bill, Water Bill, Aadhaar, Gas Connection)",
      "One recent passport size color photograph with white background"
    ],
    "hindiRequiredDocuments": [
      "आयु प्रमाण पत्र (जन्म प्रमाण पत्र, 10वीं मार्कशीट, आधार, पैन, या पासपोर्ट)",
      "वर्तमान निवास प्रमाण पत्र (बिजली बिल, पानी बिल, आधार, गैस कनेक्शन)",
      "सफेद पृष्ठभूमि वाली हालिया पासपोर्ट आकार की रंगीन फोटो"
    ],
    "steps": [
      "Register on the ECI portal (voters.eci.gov.in) with mobile number and password.",
      "Select Form 6 for New Registration of General Elector.",
      "Fill in Assembly Constituency, personal name, father/husband name, and address.",
      "Upload photo, age proof, and address proof documents.",
      "Submit the declaration and download the reference tracking acknowledgement.",
      "The local Booth Level Officer (BLO) conducts physical verification before EPIC generation."
    ],
    "hindiSteps": [
      "ईसीआई पोर्टल (voters.eci.gov.in) पर मोबाइल नंबर और पासवर्ड से लॉगिन करें।",
      "नए सामान्य मतदाता पंजीकरण हेतु प्रारूप 6 (Form 6) का चयन करें।",
      "विधानसभा क्षेत्र, अपना नाम, पिता/पति का नाम और स्थायी व वर्तमान पता भरें।",
      "फोटो, आयु प्रमाण और निवास प्रमाण के दस्तावेज अपलोड करें।",
      "घोषणा स्वीकार कर आवेदन जमा करें और ट्रैकिंग रेफरेंस नंबर डाउनलोड करें।",
      "स्थानीय बूथ लेवल ऑफिसर (BLO) द्वारा भौतिक सत्यापन के बाद नया वोटर कार्ड जारी किया जाता है।"
    ],
    "trackUrl": "https://voters.eci.gov.in/track-application-status"
  },
  {
    "id": "parivahan-services",
    "title": "Driving License & Parivahan Seva (MoRTH)",
    "hindiTitle": "ड्राइविंग लाइसेंस एवं परिवहन सेवा (MoRTH)",
    "category": "Transport & Driving",
    "hindiCategory": "परिवहन एवं ड्राइविंग",
    "summary": "Apply for Learner License (LL) with contactless online computer test from home, book Driving License (DL) slot, renew driving license, apply for international permit, or check RC details.",
    "hindiSummary": "घर बैठे ऑनलाइन टेस्ट देकर लर्नर लाइसेंस (LL) बनवाएं, ड्राइविंग लाइसेंस टेस्ट स्लॉट बुक करें, लाइसेंस का नवीनीकरण कराएं, अंतरराष्ट्रीय परमिट लें या वाहन आरसी विवरण जांचें।",
    "officialPortal": "https://parivahan.gov.in/parivahan/",
    "officialPortalName": "Ministry of Road Transport & Highways (Parivahan)",
    "hindiOfficialPortalName": "सड़क परिवहन एवं राजमार्ग मंत्रालय (परिवहन सेवा)",
    "processingTime": "Instant LL approval after online exam / DL after practical test",
    "hindiProcessingTime": "ऑनलाइन परीक्षा उत्तीर्ण करने पर तुरंत LL / प्रैक्टिकल टेस्ट के बाद DL",
    "estimatedFee": "Learner License: ₹150 - ₹200 / Driving License: ₹200 - ₹300",
    "hindiEstimatedFee": "लर्नर लाइसेंस: ₹150 - ₹200 / ड्राइविंग लाइसेंस: ₹200 - ₹300",
    "eligibility": [
      "Age 16+ for gearless two-wheeler (<50cc with parental consent)",
      "Age 18+ for Light Motor Vehicle (Car/Motorcycle with gear)",
      "Age 20+ for Transport/Commercial vehicle license"
    ],
    "hindiEligibility": [
      "बिना गियर वाले दोपहिया वाहन (<50cc) के लिए न्यूनतम 16 वर्ष (अभिभावक की सहमति से)",
      "लाइट मोटर व्हीकल (कार/गियर वाली बाइक) के लिए न्यूनतम 18 वर्ष",
      "परिवहन/व्यावसायिक वाहन लाइसेंस हेतु न्यूनतम 20 वर्ष"
    ],
    "requiredDocuments": [
      "Proof of Age and Identity (Aadhaar, School Certificate, Passport)",
      "Proof of Current Address (Aadhaar, Voter ID, Utility Bill)",
      "Self-Declaration Medical Form 1 or Medical Certificate Form 1A (for 40+ or transport)"
    ],
    "hindiRequiredDocuments": [
      "आयु एवं पहचान प्रमाण (आधार कार्ड, 10वीं प्रमाण पत्र, पासपोर्ट)",
      "वर्तमान निवास प्रमाण (आधार कार्ड, वोटर कार्ड, बिजली बिल)",
      "स्व-घोषणा मेडिकल फॉर्म 1 अथवा मेडिकल प्रमाण पत्र फॉर्म 1A (40+ वर्ष या व्यावसायिक लाइसेंस हेतु)"
    ],
    "steps": [
      "Visit Sarathi Parivahan portal and select your respective State.",
      "Click \"Apply for Learner License\" and complete Aadhaar authentication.",
      "Fill in applicant details, vehicle class (MCWG / LMV), and submit Form 1 medical declaration.",
      "Upload applicant signature and pay prescribed application fees online.",
      "Complete online Road Safety tutorial and take the computer-based LL test from home.",
      "Download your digital Learner License upon passing test."
    ],
    "hindiSteps": [
      "सारथी परिवहन पोर्टल पर जाकर अपने संबंधित राज्य का चयन करें।",
      "\"Apply for Learner License\" पर क्लिक करें और आधार ऑथेंटिकेशन पूरा करें।",
      "आवेदक विवरण, वाहन श्रेणी (MCWG / LMV) चुनें और फॉर्म 1 मेडिकल घोषणा पत्र भरें।",
      "आवेदक के हस्ताक्षर अपलोड करें और ऑनलाइन निर्धारित शुल्क जमा करें।",
      "ऑनलाइन सड़क सुरक्षा ट्यूटोरियल देखें और घर बैठे कंप्यूटर-आधारित एलएल परीक्षा दें।",
      "परीक्षा पास करते ही अपना डिजिटल लर्नर लाइसेंस डाउनलोड करें।"
    ],
    "trackUrl": "https://sarathi.parivahan.gov.in/sarathiservice/applViewStatus.do"
  },
  {
    "id": "passport-seva",
    "title": "Passport Seva Online Portal (MEA)",
    "hindiTitle": "पासपोर्ट सेवा ऑनलाइन पोर्टल (विदेश मंत्रालय)",
    "category": "Travel & Citizenship",
    "hindiCategory": "यात्रा एवं नागरिकता",
    "summary": "Apply for fresh ordinary Indian passport, reissue expired passport, apply for Police Clearance Certificate (PCC), check appointment availability at PSK/POPSK, and calculate fees.",
    "hindiSummary": "नए साधारण भारतीय पासपोर्ट हेतु आवेदन करें, समाप्त पासपोर्ट का नवीनीकरण कराएं, पुलिस क्लीयरेंस सर्टिफिकेट (PCC) लें, नजदीकी केंद्र पर अपॉइंटमेंट देखें और शुल्क गणना करें।",
    "officialPortal": "https://www.passportindia.gov.in",
    "officialPortalName": "Consular, Passport & Visa Division, MEA",
    "hindiOfficialPortalName": "कांसुलर, पासपोर्ट एवं वीजा प्रभाग, विदेश मंत्रालय",
    "processingTime": "Normal: 15-30 days / Tatkaal: 1-3 business days",
    "hindiProcessingTime": "सामान्य (Normal): 15-30 दिन / तत्काल (Tatkaal): 1-3 कार्य दिवस",
    "estimatedFee": "Standard 36 pages (Normal): ₹1,500 / Tatkaal: ₹3,500",
    "hindiEstimatedFee": "मानक 36 पृष्ठ (सामान्य): ₹1,500 / तत्काल: ₹3,500",
    "eligibility": [
      "Indian citizens by birth, descent, registration, or naturalization",
      "No pending criminal summons or prohibited travel orders"
    ],
    "hindiEligibility": [
      "जन्म, वंशानुक्रम, पंजीकरण या देशीयकरण द्वारा भारतीय नागरिक",
      "कोई लंबित आपराधिक वारंट या विदेश यात्रा पर कानूनी रोक न हो"
    ],
    "requiredDocuments": [
      "Proof of Date of Birth (Birth Certificate, 10th Certificate, Aadhaar)",
      "Proof of Present Address (Aadhaar, Bank Passbook, Voter ID, Utility Bill)",
      "Non-ECR Proof (Matriculation 10th pass certificate or higher degree)"
    ],
    "hindiRequiredDocuments": [
      "जन्म तिथि प्रमाण (जन्म प्रमाण पत्र, 10वीं मार्कशीट/सर्टिफिकेट, आधार)",
      "वर्तमान निवास प्रमाण (आधार कार्ड, बैंक पासबुक, वोटर आईडी, बिजली बिल)",
      "नॉन-ईसीआर (Non-ECR) प्रमाण पत्र (मैट्रिक 10वीं उत्तीर्ण या उच्चतर डिग्री)"
    ],
    "steps": [
      "Register on the Passport Seva Online Portal (passportindia.gov.in).",
      "Click \"Apply for Fresh Passport/Reissue of Passport\" and fill Form online.",
      "Carefully enter non-ECR status (ensures no emigration check required for travel).",
      "Pay application fee via SBI e-Pay and schedule appointment at nearest PSK / POPSK.",
      "Print Application Receipt containing the Application Reference Number (ARN).",
      "Visit PSK with original documents for biometric capture, followed by local police verification."
    ],
    "hindiSteps": [
      "पासपोर्ट सेवा पोर्टल (passportindia.gov.in) पर नया खाता बनाकर लॉगिन करें।",
      "\"Apply for Fresh Passport / Reissue of Passport\" चुनें और फॉर्म ऑनलाइन भरें।",
      "नॉन-ईसीआर स्थिति सावधानीपूर्वक चुनें (जिससे यात्रा के समय उत्प्रवास जांच की आवश्यकता न रहे)।",
      "एसबीआई ई-पे से ऑनलाइन शुल्क जमा करें और नजदीकी PSK/POPSK केंद्र का समय बुक करें।",
      "आवेदन संदर्भ संख्या (ARN) युक्त आवेदन रसीद प्रिंट करें।",
      "निर्धारित तिथि पर मूल दस्तावेजों के साथ केंद्र पर जाएँ, जिसके बाद स्थानीय पुलिस सत्यापन होगा।"
    ],
    "trackUrl": "https://www.passportindia.gov.in/AppOnlineProject/statusTracker/trackStatusInpNew"
  },
  {
    "id": "edistrict-certificates",
    "title": "State e-District & Revenue Certificates",
    "hindiTitle": "राज्य ई-डिस्ट्रिक्ट एवं राजस्व प्रमाण पत्र",
    "category": "State Governance & Revenue",
    "hindiCategory": "राज्य शासन एवं राजस्व",
    "summary": "Access state-level single window portals for Income Certificates, Caste / Category (SC/ST/OBC/EWS) Certificates, Domicile/Residence, Character, and Revenue documents.",
    "hindiSummary": "आय प्रमाण पत्र, जाति प्रमाण पत्र (SC/ST/OBC/EWS), निवास/मूल निवास, चरित्र प्रमाण पत्र एवं अन्य राजस्व सेवाओं हेतु राज्यों के सिंगल-विंडो पोर्टल का उपयोग करें।",
    "officialPortal": "https://services.india.gov.in",
    "officialPortalName": "National Services Portal & State e-District Portals",
    "hindiOfficialPortalName": "राष्ट्रीय सेवा पोर्टल एवं राज्य ई-डिस्ट्रिक्ट पोर्टल",
    "processingTime": "7 to 21 working days depending on Tehsildar/Revenue inquiry",
    "hindiProcessingTime": "तहसीलदार/राजस्व जांच के आधार पर 7 से 21 कार्य दिवस",
    "estimatedFee": "₹15 to ₹50 government statutory fee",
    "hindiEstimatedFee": "₹15 से ₹50 राज्य निर्धारित वैधानिक शुल्क",
    "eligibility": [
      "Resident citizen of the concerned state/union territory",
      "Eligible income threshold (e.g. < ₹8 Lakhs for OBC Non-Creamy Layer / EWS)"
    ],
    "hindiEligibility": [
      "संबंधित राज्य अथवा केंद्र शासित प्रदेश का मूल/स्थायी निवासी",
      "निर्धारित आय सीमा के अंतर्गत (जैसे ओबीसी नॉन-क्रीमीलेयर/EWS हेतु ₹8 लाख से कम)"
    ],
    "requiredDocuments": [
      "Aadhaar Card and Jan Aadhaar / Parivar Pehchan Patra (where applicable)",
      "Self-Declaration Affidavit / Notarized Income Declaration",
      "Land records (Khata/Khasra), salary slip, or Patwari/Lekhpal inspection report",
      "Old Caste Certificate of father/family members (for caste verification)"
    ],
    "hindiRequiredDocuments": [
      "आधार कार्ड एवं जन आधार / परिवार पहचान पत्र (जहाँ लागू हो)",
      "स्व-घोषणा पत्र / नोटरी द्वारा सत्यापित आय शपथ पत्र",
      "भूमि अभिलेख (खाता/खसरा), वेतन पर्ची, अथवा पटवारी/लेखपाल जांच रिपोर्ट",
      "पिता अथवा परिवार के सदस्यों का पुराना जाति प्रमाण पत्र (जाति सत्यापन हेतु)"
    ],
    "steps": [
      "Identify your state e-District portal (e.g. edistrict.up.gov.in, edistrict.delhigovt.nic.in, aaplesarkar.mahaonline.gov.in).",
      "Create citizen account with mobile number and Aadhaar e-KYC.",
      "Select certificate category (Income / Caste / Domicile / EWS).",
      "Fill applicant details, family occupation, annual earnings, and ancestral residence.",
      "Upload self-declaration form, photo, and identity documents.",
      "Pay online processing fee and note down the Application Number for status monitoring."
    ],
    "hindiSteps": [
      "अपने राज्य का ई-डिस्ट्रिक्ट पोर्टल चुनें (जैसे edistrict.up.gov.in, delhigovt, mahaonline आदि)।",
      "मोबाइल नंबर और आधार सत्यापन के साथ नागरिक खाता बनाएं।",
      "वांछित प्रमाण पत्र श्रेणी (आय / जाति / निवास / EWS) का चयन करें।",
      "आवेदक का विवरण, पारिवारिक पेशा, वार्षिक आय और पैतृक निवास दर्ज करें।",
      "स्व-घोषणा पत्र, फोटो एवं आवश्यक पहचान दस्तावेज अपलोड करें।",
      "ऑनलाइन शुल्क भुगतान करें और स्थिति जांचने हेतु आवेदन संख्या सुरक्षित रखें।"
    ]
  },
  {
    "id": "rtps-residence-certificate",
    "title": "RTPS Bihar: Residence / Domicile Certificate (निवास प्रमाण पत्र)",
    "hindiTitle": "आरटीपीएस बिहार: निवास / मूल निवास प्रमाण पत्र",
    "category": "State Governance & Revenue",
    "hindiCategory": "राज्य शासन एवं राजस्व",
    "jurisdiction": "bihar",
    "serviceType": "revenue",
    "summary": "Apply online for Residential Domicile Certificate at Revenue Officer (RO), Sub-Divisional Officer (SDO), or District Magistrate (DM) level via ServicePlus Bihar.",
    "hindiSummary": "सर्विसप्लस बिहार पोर्टल के माध्यम से अंचल स्तर (RO), अनुमंडल स्तर (SDO) अथवा जिला स्तर (DM) पर ऑनलाइन आवासीय प्रमाण पत्र के लिए आवेदन करें।",
    "officialPortal": "https://serviceonline.bihar.gov.in",
    "officialPortalName": "ServicePlus Bihar (RTPS Portal)",
    "hindiOfficialPortalName": "सर्विसप्लस बिहार (RTPS पोर्टल)",
    "processingTime": "10 working days (Statutory)",
    "hindiProcessingTime": "10 कार्य दिवस (लोक सेवा अधिकार अधिनियम के तहत वैधानिक समय)",
    "estimatedFee": "Free (₹0 government statutory fee)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 सरकारी शुल्क)",
    "eligibility": [
      "Permanent resident of Bihar or residing continuously in the state",
      "Valid mobile number for OTP authentication and status SMS"
    ],
    "hindiEligibility": [
      "बिहार राज्य का स्थायी निवासी हो अथवा राज्य में निरंतर निवास कर रहा हो",
      "ओटीपी सत्यापन और स्थिति एसएमएस हेतु सक्रिय मोबाइल नंबर"
    ],
    "requiredDocuments": [
      "Applicant self-photograph",
      "Proof of Identity & Address (Aadhaar Card, Voter ID, Ration Card, or Passport)",
      "Self-Declaration Form (स्व-घोषणा पत्र generated during form filling)"
    ],
    "hindiRequiredDocuments": [
      "आवेदक का स्व-प्रमाणित रंगीन फोटो",
      "पहचान एवं पते का प्रमाण (आधार कार्ड, वोटर कार्ड, राशन कार्ड अथवा पासपोर्ट)",
      "फॉर्म भरते समय जनरेट होने वाला स्व-घोषणा पत्र"
    ],
    "steps": [
      "Visit the official ServicePlus Bihar portal (serviceonline.bihar.gov.in).",
      "Navigate to \"लोक सेवाओं का अधिकार की सेवाएं\" -> \"सामान्य प्रशासन विभाग\" -> \"आवासीय प्रमाण-पत्र का निर्गमन\".",
      "Select jurisdiction level: Revenue Officer (अंचल स्तर / RO), SDO (अनुमंडल स्तर), or DM (जिला स्तर).",
      "Choose Gender, fill applicant full name in English & Hindi, father/husband name, and mother name.",
      "Select District, Sub-Division, Block, Gram Panchayat/Ward, and Village/Mohalla.",
      "Upload applicant photo and choose supporting ID proof (Aadhaar Card recommended).",
      "Verify details on the preview screen and submit to receive your Application Reference Number."
    ],
    "hindiSteps": [
      "सर्विसप्लस बिहार के आधिकारिक पोर्टल (serviceonline.bihar.gov.in) पर जाएँ।",
      "\"लोक सेवाओं का अधिकार की सेवाएं\" -> \"सामान्य प्रशासन विभाग\" -> \"आवासीय प्रमाण-पत्र का निर्गमन\" चुनें।",
      "निर्गमन स्तर चुनें: राजस्व अधिकारी (अंचल स्तर / RO), अनुमंडल (SDO), या जिला (DM)।",
      "लिंग चुनें, आवेदक का पूरा नाम अंग्रेजी व हिंदी में भरें, माता-पिता/पति का नाम दर्ज करें।",
      "जिला, अनुमंडल, प्रखंड, ग्राम पंचायत/नगर निकाय, और गांव/मोहल्ला का चयन करें।",
      "फोटो अपलोड करें और पहचान पत्र (आधार कार्ड अनुशंसित) संलग्न करें।",
      "विवरण जांचकर फाइनल सबमिट करें और अपनी आवेदन पावती रसीद डाउनलोड करें।"
    ],
    "trackUrl": "https://serviceonline.bihar.gov.in"
  },
  {
    "id": "rtps-caste-certificate",
    "title": "RTPS Bihar: Caste Certificate (जाति प्रमाण पत्र - SC/ST/EBC/BC/Gen)",
    "hindiTitle": "आरटीपीएस बिहार: जाति प्रमाण पत्र (SC/ST/EBC/BC/Gen)",
    "category": "State Governance & Revenue",
    "hindiCategory": "राज्य शासन एवं राजस्व",
    "jurisdiction": "bihar",
    "serviceType": "revenue",
    "summary": "Obtain statutory Caste Certificate verifying Scheduled Caste, Scheduled Tribe, Extremely Backward Class (EBC), Backward Class (BC), or General category status for reservations.",
    "hindiSummary": "सरकारी नौकरियों और शैक्षणिक संस्थानों में आरक्षण एवं छात्रवृत्ति हेतु अनुसूचित जाति, अनुसूचित जनजाति, अत्यंत पिछड़ा वर्ग, पिछड़ा वर्ग या सामान्य जाति का वैधानिक प्रमाण पत्र प्राप्त करें।",
    "officialPortal": "https://serviceonline.bihar.gov.in",
    "officialPortalName": "ServicePlus Bihar (RTPS Portal)",
    "hindiOfficialPortalName": "सर्विसप्लस बिहार (RTPS पोर्टल)",
    "processingTime": "10 working days (Statutory)",
    "hindiProcessingTime": "10 कार्य दिवस (वैधानिक)",
    "estimatedFee": "Free (₹0 government statutory fee)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 सरकारी शुल्क)",
    "eligibility": [
      "Permanent resident citizen belonging to notified communities in Bihar",
      "Caste recorded in official Bihar state gazette notifications"
    ],
    "hindiEligibility": [
      "बिहार राज्य का स्थायी निवासी जो राज्य सरकार द्वारा अधिसूचित जातियों में आता हो",
      "संबंधित जाति बिहार राज्य के आधिकारिक गजट में दर्ज होनी चाहिए"
    ],
    "requiredDocuments": [
      "Aadhaar Card or other government photo identity card",
      "Family Khatiyan / Land record or old Caste Certificate of father/paternal lineage",
      "Self-declaration of caste community"
    ],
    "hindiRequiredDocuments": [
      "आधार कार्ड अथवा अन्य सरकारी फोटोयुक्त पहचान पत्र",
      "पारिवारिक खतियान / जमीन की रसीद अथवा पिता/वंश का पुराना जाति प्रमाण पत्र",
      "जाति एवं समुदाय का स्व-घोषणा पत्र"
    ],
    "steps": [
      "Visit serviceonline.bihar.gov.in and click \"सामान्य प्रशासन विभाग\" -> \"जाति प्रमाण-पत्र का निर्गमन\".",
      "Select issuing authority level (RO level for initial issue, SDO/DM for state/central recruitment).",
      "Enter applicant details in English and Hindi, along with permanent and present address.",
      "Select Category (अनु० जाति / अनु० जनजाति / अत्यंत पिछड़ा वर्ग / पिछड़ा वर्ग / गैर-आरक्षित) and specific Caste name.",
      "Upload recent photograph and attach Aadhaar or family Khatiyan document.",
      "Submit the application and download the RTPS acknowledgement slip containing delivery date."
    ],
    "hindiSteps": [
      "serviceonline.bihar.gov.in पर जाएँ और \"जाति प्रमाण-पत्र का निर्गमन\" पर क्लिक करें।",
      "निर्गमन स्तर चुनें (प्रारंभिक आवेदन अंचल/RO स्तर पर होता है)।",
      "आवेदक का विवरण हिंदी व अंग्रेजी में भरें तथा स्थायी एवं वर्तमान पता दर्ज करें।",
      "जाति वर्ग (अनु० जाति / अनु० जनजाति / अत्यंत पिछड़ा वर्ग / पिछड़ा वर्ग / गैर-आरक्षित) व विशिष्ट जाति चुनें।",
      "हालिया पासपोर्ट साइज फोटो अपलोड करें और आधार या पारिवारिक खतियान संलग्न करें।",
      "आवेदन सबमिट करें और डिलीवरी तिथि युक्त आरटीपीएस पावती रसीद प्राप्त करें।"
    ],
    "trackUrl": "https://serviceonline.bihar.gov.in"
  },
  {
    "id": "rtps-income-certificate",
    "title": "RTPS Bihar: Income Certificate (आय प्रमाण पत्र)",
    "hindiTitle": "आरटीपीएस बिहार: आय प्रमाण पत्र",
    "category": "State Governance & Revenue",
    "hindiCategory": "राज्य शासन एवं राजस्व",
    "jurisdiction": "bihar",
    "serviceType": "revenue",
    "summary": "Official assessment of annual family income from agricultural, business, salary, and other vocations for government welfare schemes and fee concessions.",
    "hindiSummary": "सरकारी कल्याणकारी योजनाओं, छात्रवृत्ति और शुल्क रियायत हेतु कृषि, व्यवसाय, नौकरी व अन्य सभी स्रोतों से पारिवारिक वार्षिक आय का आधिकारिक प्रमाण पत्र।",
    "officialPortal": "https://serviceonline.bihar.gov.in",
    "officialPortalName": "ServicePlus Bihar (RTPS Portal)",
    "hindiOfficialPortalName": "सर्विसप्लस बिहार (RTPS पोर्टल)",
    "processingTime": "10 working days (Statutory)",
    "hindiProcessingTime": "10 कार्य दिवस (वैधानिक)",
    "estimatedFee": "Free (₹0 government statutory fee)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 सरकारी शुल्क)",
    "eligibility": [
      "Resident families of Bihar requiring official income assessment",
      "Valid self-declaration of all sources of family revenue"
    ],
    "hindiEligibility": [
      "बिहार का निवासी परिवार जिसे आय के आधिकारिक आकलन की आवश्यकता हो",
      "पारिवारिक आय के सभी वैध स्रोतों की स्व-घोषणा"
    ],
    "requiredDocuments": [
      "Aadhaar Card of the applicant",
      "Salary slip / Form 16 (for salaried persons) OR Land revenue receipt (for farming families)",
      "Self-declaration of annual earnings from Government, Business, Agriculture, and Other sources"
    ],
    "hindiRequiredDocuments": [
      "आवेदक का आधार कार्ड",
      "वेतनभोगी हेतु सैलरी स्लिप/फॉर्म 16 अथवा किसान परिवारों हेतु जमीन का लगान रसीद",
      "सरकारी सेवा, व्यवसाय, कृषि और अन्य स्रोतों से होने वाली वार्षिक आय की स्व-घोषणा"
    ],
    "steps": [
      "Access serviceonline.bihar.gov.in and select \"आय प्रमाण-पत्र का निर्गमन\".",
      "Choose level of issuance (Revenue Officer level is standard for educational admissions).",
      "Fill in applicant personal particulars and geographic block/panchayat details.",
      "Enter specific income breakdown: Income from Agriculture, Business, Profession, and Other sources.",
      "Enter purpose of application (e.g. Higher Education, Scholarship, General).",
      "Upload identity document and submit to generate the 16-character Application Reference ID."
    ],
    "hindiSteps": [
      "सर्विसप्लस बिहार पोर्टल खोलें और \"आय प्रमाण-पत्र का निर्गमन\" चुनें।",
      "निर्गमन स्तर चुनें (शैक्षणिक प्रवेश हेतु राजस्व अधिकारी / RO स्तर मानक है)।",
      "आवेदक का व्यक्तिगत विवरण, जिला, प्रखंड और पंचायत का चयन करें।",
      "आय का स्रोतवार ब्योरा भरें: कृषि से आय, व्यवसाय से आय, नौकरी से आय, और अन्य आय।",
      "आवेदन का उद्देश्य दर्ज करें (जैसे उच्च शिक्षा, छात्रवृत्ति, सामान्य आदि)।",
      "पहचान पत्र अपलोड कर फाइनल सबमिट करें और 16-अंकीय आवेदन संदर्भ संख्या प्राप्त करें।"
    ],
    "trackUrl": "https://serviceonline.bihar.gov.in"
  },
  {
    "id": "rtps-ncl-certificate",
    "title": "RTPS Bihar: Non-Creamy Layer Certificate (क्रीमीलेयर रहित प्रमाण पत्र - OBC/EBC)",
    "hindiTitle": "आरटीपीएस बिहार: क्रीमीलेयर रहित प्रमाण पत्र (OBC/EBC - NCL)",
    "category": "State Governance & Revenue",
    "hindiCategory": "राज्य शासन एवं राजस्व",
    "jurisdiction": "bihar",
    "serviceType": "revenue",
    "summary": "Statutory certification for Backward Class (BC) and Extremely Backward Class (EBC) candidates proving family income is under the ₹8 Lakh creamy layer ceiling.",
    "hindiSummary": "बिहार के पिछड़ा वर्ग (BC) और अत्यंत पिछड़ा वर्ग (EBC) के अभ्यर्थियों के लिए पारिवारिक आय ₹8 लाख की सीमा से कम होने का आधिकारिक आरक्षण प्रमाण पत्र।",
    "officialPortal": "https://serviceonline.bihar.gov.in",
    "officialPortalName": "ServicePlus Bihar (RTPS Portal)",
    "hindiOfficialPortalName": "सर्विसप्लस बिहार (RTPS पोर्टल)",
    "processingTime": "21 working days (Statutory)",
    "hindiProcessingTime": "21 कार्य दिवस (वैधानिक)",
    "estimatedFee": "Free (₹0 government statutory fee)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 सरकारी शुल्क)",
    "eligibility": [
      "Belonging to BC or EBC categories in Bihar state list",
      "Annual parental/family income strictly below ₹8 Lakhs as per creamy layer guidelines"
    ],
    "hindiEligibility": [
      "बिहार राज्य की पिछड़ा वर्ग (BC) या अत्यंत पिछड़ा वर्ग (EBC) सूची में शामिल समुदाय से हों",
      "माता-पिता/परिवार की वार्षिक आय क्रीमीलेयर नियमों के तहत ₹8 लाख से कम हो"
    ],
    "requiredDocuments": [
      "Valid Residence Certificate, Caste Certificate, and Income Certificate (all three issued within 1 year)",
      "Form X-A / Form VIII-B (क्रीमीलेयर रहित स्व-घोषणा पत्र)",
      "Aadhaar Card and Land receipt/salary proof"
    ],
    "hindiRequiredDocuments": [
      "वैध निवास प्रमाण पत्र, जाति प्रमाण पत्र और आय प्रमाण पत्र (तीनों एक वर्ष के भीतर जारी)",
      "फॉर्म X-A / फॉर्म VIII-B (क्रीमीलेयर रहित स्व-घोषणा पत्र)",
      "आधार कार्ड और जमीन की रसीद या वेतन प्रमाण"
    ],
    "steps": [
      "Ensure you already hold valid Residence, Caste, and Income certificates issued by RTPS.",
      "Visit serviceonline.bihar.gov.in and select \"क्रीमीलेयर रहित प्रमाण-पत्र का निर्गमन (बिहार सरकार के प्रयोजनार्थ)\".",
      "Select whether already possessing prior revenue officer certificates.",
      "Fill in applicant occupation, parents’ job classification, and agricultural land holdings.",
      "Upload the signed Form X-A self-declaration and attach the three prerequisite certificates.",
      "Review and submit to generate the tracking slip."
    ],
    "hindiSteps": [
      "सुनिश्चित करें कि आपके पास आरटीपीएस द्वारा जारी पूर्व निवास, जाति व आय प्रमाण पत्र उपलब्ध हैं।",
      "सर्विसप्लस पोर्टल पर \"क्रीमीलेयर रहित प्रमाण-पत्र का निर्गमन (बिहार सरकार के प्रयोजनार्थ)\" चुनें।",
      "पहले से जारी प्रमाण पत्रों का विवरण दर्ज करें।",
      "आवेदक का पेशा, माता-पिता का पद/वर्ग और कृषि भूमि का विवरण भरें।",
      "हस्ताक्षरित फॉर्म X-A स्व-घोषणा पत्र अपलोड करें और तीनों प्रमाण पत्र संलग्न करें।",
      "समीक्षा कर सबमिट करें और ट्रैकिंग स्लिप डाउनलोड करें।"
    ],
    "trackUrl": "https://serviceonline.bihar.gov.in"
  },
  {
    "id": "rtps-ews-certificate",
    "title": "RTPS Bihar: EWS Certificate (आर्थिक रूप से कमजोर वर्ग प्रमाण पत्र)",
    "hindiTitle": "आरटीपीएस बिहार: ईडब्ल्यूएस प्रमाण पत्र (आर्थिक रूप से कमजोर वर्ग)",
    "category": "State Governance & Revenue",
    "hindiCategory": "राज्य शासन एवं राजस्व",
    "jurisdiction": "bihar",
    "serviceType": "revenue",
    "summary": "10% reservation certificate for economically weaker citizens of unreserved (General) category in government jobs and educational institutions.",
    "hindiSummary": "सामान्य (अनारक्षित) वर्ग के आर्थिक रूप से कमजोर नागरिकों के लिए सरकारी नौकरियों और उच्च शिक्षण संस्थानों में 10% आरक्षण हेतु आय एवं परिसंपत्ति प्रमाण पत्र।",
    "officialPortal": "https://serviceonline.bihar.gov.in",
    "officialPortalName": "ServicePlus Bihar (RTPS Portal)",
    "hindiOfficialPortalName": "सर्विसप्लस बिहार (RTPS पोर्टल)",
    "processingTime": "21 working days (Statutory)",
    "hindiProcessingTime": "21 कार्य दिवस (वैधानिक)",
    "estimatedFee": "Free (₹0 government statutory fee)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 सरकारी शुल्क)",
    "eligibility": [
      "Person belonging to General category not covered under SC, ST, or OBC/EBC reservations",
      "Gross annual family income strictly below ₹8 Lakhs from all sources",
      "Family must not own 5 acres of agricultural land or 1000 sq ft residential flat or 100 sq yard plot in notified municipalities"
    ],
    "hindiEligibility": [
      "सामान्य वर्ग का व्यक्ति जो SC, ST, अथवा OBC/EBC आरक्षण के दायरे में न आता हो",
      "परिवार की कुल वार्षिक आय सभी स्रोतों से ₹8 लाख से कम हो",
      "परिवार के पास 5 एकड़ या अधिक कृषि भूमि, 1000 वर्ग फीट का फ्लैट या अधिसूचित क्षेत्र में 100 वर्ग गज का भूखंड न हो"
    ],
    "requiredDocuments": [
      "Aadhaar Card / Voter ID Card",
      "Valid Income Certificate and Residence Certificate",
      "Family land possession proof or Khatiyan (if requested during Anchal inquiry)",
      "Self-declaration of assets"
    ],
    "hindiRequiredDocuments": [
      "आधार कार्ड / मतदाता पहचान पत्र",
      "वैध आय प्रमाण पत्र एवं आवासीय प्रमाण पत्र",
      "पारिवारिक जमीन की रसीद अथवा खतियान (अंचल जांच के दौरान मांगने पर)",
      "परिसंपत्ति (Assets) की स्व-घोषणा"
    ],
    "steps": [
      "Open serviceonline.bihar.gov.in and click \"आर्थिक रूप से कमजोर वर्ग (EWS) के लिए आय एवं परिसंपत्ति प्रमाण-पत्र का निर्गमन\".",
      "Select issuing office (Revenue Officer level for state exams).",
      "Fill candidate bio-data, caste name (e.g. Brahmin, Rajput, Bhumihar, Kayastha, Syed, Sheikh, Pathan).",
      "Declare total family income and residential asset details.",
      "Upload self-attested photo and identity proof.",
      "Submit form and retain the Application Number for status monitoring."
    ],
    "hindiSteps": [
      "serviceonline.bihar.gov.in पर \"EWS के लिए आय एवं परिसंपत्ति प्रमाण-पत्र का निर्गमन\" पर क्लिक करें।",
      "निर्गमन कार्यालय (राज्य परीक्षाओं हेतु राजस्व अधिकारी स्तर) का चयन करें।",
      "उम्मीदवार का व्यक्तिगत विवरण और जाति (जैसे ब्राह्मण, राजपूत, भूमिहार, कायस्थ, सैयद, शेख, पठान आदि) भरें।",
      "परिवार की कुल आय और आवासीय परिसंपत्तियों की घोषणा करें।",
      "स्व-हस्ताक्षरित फोटो और पहचान पत्र अपलोड करें।",
      "फॉर्म सबमिट करें और स्थिति निगरानी हेतु आवेदन क्रमांक सुरक्षित रखें।"
    ],
    "trackUrl": "https://serviceonline.bihar.gov.in"
  },
  {
    "id": "bihar-bhumi-mutation",
    "title": "Bihar Bhumi: Online Dakhil Kharij (दाखिल-खारिज / Mutation Application)",
    "hindiTitle": "बिहार भूमि: ऑनलाइन दाखिल-खारिज (Mutation Application)",
    "category": "Land & Property Revenue",
    "hindiCategory": "भूमि एवं संपत्ति राजस्व",
    "jurisdiction": "bihar",
    "serviceType": "land",
    "summary": "Transfer legal title of purchased, gifted, or inherited land in government Register-II records to obtain mutated Jamabandi in applicant’s name.",
    "hindiSummary": "क्रय की गई, दान में मिली या पैतृक भूमि का कानूनी स्वामित्व सरकारी रजिस्टर-2 में दर्ज कराने और अपने नाम से जमाबंदी कायम करने हेतु ऑनलाइन आवेदन करें।",
    "officialPortal": "https://biharbhumi.bihar.gov.in",
    "officialPortalName": "Bihar Bhumi Portal (Revenue & Land Reforms Dept)",
    "hindiOfficialPortalName": "बिहार भूमि पोर्टल (राजस्व एवं भूमि सुधार विभाग)",
    "processingTime": "35 working days (uncontested) / 75 working days (with objection)",
    "hindiProcessingTime": "35 कार्य दिवस (अविवादित मामलों में) / 75 कार्य दिवस (आपत्ति होने पर)",
    "estimatedFee": "Free (₹0 application fee)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 आवेदन शुल्क)",
    "eligibility": [
      "Buyer, donee, or legal heir holding registered sale deed (केवाला) or partition deed in Bihar",
      "Land situated within notified revenue circles of Bihar"
    ],
    "hindiEligibility": [
      "बिहार में निबंधित केवाला (रजिस्टर्ड डीड), दानपत्र या बंटवारा दस्तावेज धारक खरीदार या वारिस",
      "भूमि बिहार के अधिसूचित राजस्व अंचल के अंतर्गत स्थित होनी चाहिए"
    ],
    "requiredDocuments": [
      "Registered Sale Deed / Kewala (रजिस्टर्ड केवाला प्रति)",
      "Previous Jamabandi / Up-to-date Lagan receipt of previous owner",
      "Succession / Legal Heir Certificate (in case of inheritance)",
      "Applicant Aadhaar Card and mobile number"
    ],
    "hindiRequiredDocuments": [
      "रजिस्टर्ड केवाला प्रति (Sale Deed)",
      "पूर्व जमाबंदी अथवा पूर्व रैयत की अद्यतन लगान रसीद",
      "वारिसाना / वंशावली प्रमाण पत्र (विरासत के मामले में)",
      "आवेदक का आधार कार्ड और मोबाइल नंबर"
    ],
    "steps": [
      "Visit the official Bihar Bhumi portal (biharbhumi.bihar.gov.in) and register citizen account.",
      "Click \"ऑनलाइन दाखिल-खारिज आवेदन करें\" and select your District and Anchal.",
      "Click \"नया आवेदन करें\" and enter Buyer (Applicant) and Seller (Deed Holder) details.",
      "Fill Deed details: Deed Number, Registration Date, Amount, and Registry Office name.",
      "Enter Plot particulars: Halka, Mauza, Khata No., Plot/Khasra No., Area in Acre/Decimal, and Boundary (चौहद्दी).",
      "Combine deed document and self-declaration into a single PDF (under 2MB) and upload.",
      "Submit to generate Case Number (वाद संख्या) for tracking through Circle Officer and Karamchari scrutiny."
    ],
    "hindiSteps": [
      "बिहार भूमि पोर्टल (biharbhumi.bihar.gov.in) पर जाकर नागरिक खाता बनाएं और लॉगिन करें।",
      "\"ऑनलाइन दाखिल-खारिज आवेदन करें\" चुनें और अपना जिला व अंचल सेलेक्ट करें।",
      "\"नया आवेदन करें\" पर क्लिक कर क्रेता (आवेदक) और विक्रेता का विवरण भरें।",
      "दस्तावेज विवरण भरें: डीड संख्या, निबंधन तिथि, राशि और रजिस्ट्री कार्यालय का नाम।",
      "जमीन का विवरण भरें: हल्का, मौजा, खाता संख्या, प्लॉट/खेसरा संख्या, रकबा और चौहद्दी।",
      "केवाला दस्तावेज और स्व-घोषणा की 2MB से कम साइज की पीडीएफ बनाकर अपलोड करें।",
      "आवेदन सबमिट कर वाद संख्या (Case Number) प्राप्त करें जिससे अंचल अधिकारी और राजस्व कर्मचारी स्तर पर जांच ट्रैक हो सके।"
    ],
    "trackUrl": "https://biharbhumi.bihar.gov.in"
  },
  {
    "id": "bihar-bhumi-jamabandi",
    "title": "Bihar Bhumi: Jamabandi Panji & RoR View (जमाबंदी पंजी प्रति / खतियान नकल)",
    "hindiTitle": "बिहार भूमि: जमाबंदी पंजी प्रति एवं खतियान नकल",
    "category": "Land & Property Revenue",
    "hindiCategory": "भूमि एवं संपत्ति राजस्व",
    "jurisdiction": "bihar",
    "serviceType": "land",
    "summary": "Inspect digitized Register-II records to verify land ownership, Khata-Khasra numbers, Raiyat name, area, and existing dispute status.",
    "hindiSummary": "भूमि के मालिकाना हक, खाता-खेसरा नंबर, रैयत के नाम, रकबा (क्षेत्रफल) और जमीन की स्थिति की पुष्टि के लिए डिजिटाइज्ड रजिस्टर-2 अभिलेखों की ऑनलाइन जांच करें।",
    "officialPortal": "https://biharbhumi.bihar.gov.in",
    "officialPortalName": "Bihar Bhumi Portal (Register-II / Jamabandi)",
    "hindiOfficialPortalName": "बिहार भूमि पोर्टल (रजिस्टर-2 / जमाबंदी)",
    "processingTime": "Instant digital inspection & print",
    "hindiProcessingTime": "तत्काल ऑनलाइन जांच एवं प्रिंट",
    "estimatedFee": "Free (₹0 online view)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 ऑनलाइन दर्शन)",
    "eligibility": [
      "Open public record accessible to all landowners, buyers, and legal advocates in Bihar"
    ],
    "hindiEligibility": [
      "सार्वजनिक खुला रिकॉर्ड जो बिहार के सभी भूस्वामियों, खरीदारों और अधिवक्ताओं के लिए उपलब्ध है"
    ],
    "requiredDocuments": [
      "No physical documents needed; requires Anchal, Halka, Mauza, and Khata/Plot number or Raiyat Name"
    ],
    "hindiRequiredDocuments": [
      "किसी भौतिक दस्तावेज की आवश्यकता नहीं; केवल अंचल, हल्का, मौजा, और खाता/खेसरा या रैयत का नाम चाहिए"
    ],
    "steps": [
      "Visit biharbhumi.bihar.gov.in and click \"जमाबंदी पंजी देखें\".",
      "Select your District on the interactive Bihar state map.",
      "Select Anchal and click \"Proceed\", then choose Halka Name and Mauza Name.",
      "Search by: Khata Number, Plot Number, Raiyat Name, or Bhag Vartman / Prishth Vartman.",
      "Click \"Search\" to display matching land record records in the table.",
      "Click the eye icon next to your record to view, verify boundaries, and print the official Jamabandi summary."
    ],
    "hindiSteps": [
      "biharbhumi.bihar.gov.in पर जाएँ और \"जमाबंदी पंजी देखें\" पर क्लिक करें।",
      "बिहार के नक्शे पर अपना जिला चुनें।",
      "अंचल सेलेक्ट करें, \"Proceed\" पर क्लिक करें, फिर हल्का और मौजा चुनें।",
      "खोज माध्यम चुनें: खाता संख्या, खेसरा संख्या, रैयत का नाम, या भाग वर्तमान/पृष्ठ संख्या।",
      "\"सर्च\" बटन दबाएं जिससे तालिका में संबंधित जमाबंदी की सूची आ जाएगी।",
      "विवरण देखने और चौहद्दी की पुष्टि के लिए आंख के आइकन (View) पर क्लिक करें और सरकारी जमाबंदी प्रिंट करें।"
    ],
    "trackUrl": "https://biharbhumi.bihar.gov.in"
  },
  {
    "id": "bihar-bhumi-lpc",
    "title": "Bihar Bhumi: Land Possession Certificate (LPC / भू-स्वामित्व प्रमाण पत्र)",
    "hindiTitle": "बिहार भूमि: भू-स्वामित्व प्रमाण पत्र (LPC / Land Possession Certificate)",
    "category": "Land & Property Revenue",
    "hindiCategory": "भूमि एवं संपत्ति राजस्व",
    "jurisdiction": "bihar",
    "serviceType": "land",
    "summary": "Official certificate certifying peaceful continuous possession over registered land, required by commercial banks for Kisan Credit Card (KCC) and agricultural crop loans.",
    "hindiSummary": "पंजीकृत भूमि पर शांतिपूर्ण और निरंतर दखल-कब्जे का आधिकारिक सरकारी प्रमाण पत्र, जो बैंकों द्वारा किसान क्रेडिट कार्ड (KCC) और कृषि ऋण स्वीकृत करने हेतु अनिवार्य है।",
    "officialPortal": "https://biharbhumi.bihar.gov.in",
    "officialPortalName": "Bihar Bhumi Portal (LPC Service)",
    "hindiOfficialPortalName": "बिहार भूमि पोर्टल (LPC सेवा)",
    "processingTime": "10 to 15 working days",
    "hindiProcessingTime": "10 से 15 कार्य दिवस",
    "estimatedFee": "Free (₹0 online application fee)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 ऑनलाइन आवेदन शुल्क)",
    "eligibility": [
      "Landowner whose name is recorded in active digital Jamabandi with no arrears of land rent",
      "Physical possession verified by local Revenue Karamchari"
    ],
    "hindiEligibility": [
      "भू-स्वामी जिसका नाम सक्रिय डिजिटल जमाबंदी में दर्ज हो और कोई भू-लगान बकाया न हो",
      "स्थानीय राजस्व कर्मचारी द्वारा भौतिक दखल-कब्जे का सत्यापन होना चाहिए"
    ],
    "requiredDocuments": [
      "Up-to-date Land Rent Receipt (अप-टू-डेट लगान रसीद संख्या)",
      "Self-Declaration Form in prescribed format",
      "Applicant Aadhaar Card and active mobile number"
    ],
    "hindiRequiredDocuments": [
      "अद्यतन (Up-to-date) ऑनलाइन लगान रसीद संख्या",
      "निर्धारित प्रारूप में स्व-घोषणा पत्र",
      "आवेदक का आधार कार्ड और सक्रिय मोबाइल नंबर"
    ],
    "steps": [
      "Open biharbhumi.bihar.gov.in and log in to citizen services.",
      "Click \"ऑनलाइन एलपीसी आवेदन करें\" and locate your active Jamabandi record.",
      "Click \"Apply for LPC\" next to your verified Jamabandi entry.",
      "Fill applicant particulars and state the purpose of LPC (e.g. Bank Loan, Court, Border dispute).",
      "Upload prescribed self-declaration form signed by the applicant.",
      "Submit the request to generate the LPC Application Number for Circle Inspector (CI) verification."
    ],
    "hindiSteps": [
      "biharbhumi.bihar.gov.in खोलकर नागरिक सेवा में लॉगिन करें।",
      "\"ऑनलाइन एलपीसी आवेदन करें\" पर क्लिक करें और अपनी सक्रिय जमाबंदी खोजें।",
      "सत्यापित जमाबंदी रिकॉर्ड के आगे \"Apply for LPC\" पर क्लिक करें।",
      "आवेदक का विवरण भरें और एलपीसी का प्रयोजन (जैसे बैंक ऋण, न्यायालय आदि) चुनें।",
      "हस्ताक्षरित स्व-घोषणा पत्र को पीडीएफ में अपलोड करें।",
      "आवेदन जमा करें और अंचल निरीक्षक (CI) जांच हेतु एलपीसी आवेदन संख्या प्राप्त करें।"
    ],
    "trackUrl": "https://biharbhumi.bihar.gov.in"
  },
  {
    "id": "bihar-bhumi-lagan",
    "title": "Bihar Bhumi: Online Bhu-Lagaan Payment (ऑनलाइन भू-लगान भुगतान)",
    "hindiTitle": "बिहार भूमि: ऑनलाइन भू-लगान भुगतान (e-Lagan Payment)",
    "category": "Land & Property Revenue",
    "hindiCategory": "भूमि एवं संपत्ति राजस्व",
    "jurisdiction": "bihar",
    "serviceType": "land",
    "summary": "Pay annual agricultural and residential land tax online via net banking or UPI and generate an official government e-rent receipt.",
    "hindiSummary": "नेट बैंकिंग, डेबिट कार्ड या यूपीआई के माध्यम से कृषि एवं आवासीय भूमि का वार्षिक लगान टैक्स ऑनलाइन जमा करें और तत्काल सरकारी ई-रसीद प्राप्त करें।",
    "officialPortal": "https://biharbhumi.bihar.gov.in",
    "officialPortalName": "Bihar Bhumi Portal (e-Lagan Payment)",
    "hindiOfficialPortalName": "बिहार भूमि पोर्टल (e-लगान भुगतान)",
    "processingTime": "Instant receipt generation",
    "hindiProcessingTime": "भुगतान के साथ तत्काल रसीद जनरेट",
    "estimatedFee": "Annual land revenue assessment per acre (statutory tax)",
    "hindiEstimatedFee": "प्रति एकड़ राज्य निर्धारित वार्षिक भू-राजस्व कर",
    "eligibility": [
      "Any Raiyat holding a registered Jamabandi in Bihar revenue records"
    ],
    "hindiEligibility": [
      "कोई भी रैयत/भूस्वामी जिसकी बिहार राजस्व अभिलेखों में पंजीकृत जमाबंदी कायम हो"
    ],
    "requiredDocuments": [
      "Bhag Vartman (भाग वर्तमान) and Prishth Sankhya Vartman (पृष्ठ संख्या वर्तमान)",
      "Net Banking, Debit Card, or UPI payment method"
    ],
    "hindiRequiredDocuments": [
      "भाग वर्तमान (Bhag Vartman) और पृष्ठ संख्या वर्तमान (Prishth Sankhya Vartman)",
      "नेट बैंकिंग, डेबिट कार्ड या यूपीआई भुगतान माध्यम"
    ],
    "steps": [
      "Visit biharbhumi.bihar.gov.in and click \"भू-लगान\".",
      "Select \"ऑनलाइन भुगतान करें\".",
      "Select District, Anchal, Halka, and Mauza.",
      "Enter Bhag Vartman and Prishth Sankhya Vartman (found from Jamabandi search).",
      "Solve security captcha and click \"खोजें\" to view total pending arrears and current financial year dues.",
      "Enter remitter name and mobile number, agree to terms, and click \"भुगतान करें\".",
      "Complete payment on Bihar e-Grass payment gateway to instantly download your government rent receipt."
    ],
    "hindiSteps": [
      "biharbhumi.bihar.gov.in पर जाएँ और \"भू-लगान\" विकल्प पर क्लिक करें।",
      "\"ऑनलाइन भुगतान करें\" का चयन करें।",
      "जिला, अंचल, हल्का और मौजा चुनें।",
      "भाग वर्तमान और पृष्ठ संख्या वर्तमान दर्ज करें (जो जमाबंदी देखने पर मिल जाती है)।",
      "सुरक्षा कैप्चा भरकर \"खोजें\" पर क्लिक करें जिससे बकाया और वर्तमान वर्ष का लगान आ जाएगा।",
      "जमाकर्ता का नाम व मोबाइल नंबर दर्ज करें और \"भुगतान करें\" पर क्लिक करें।",
      "बिहार e-Grass पेमेंट गेटवे पर भुगतान पूर्ण करें और तुरंत सरकारी लगान रसीद डाउनलोड करें।"
    ],
    "trackUrl": "https://biharbhumi.bihar.gov.in"
  },
  {
    "id": "bihar-epds-ration-card",
    "title": "Bihar Ration Card: New Application & Member Management (EPDS Bihar)",
    "hindiTitle": "बिहार राशन कार्ड: नया आवेदन एवं सदस्य प्रबंधन (EPDS बिहार)",
    "category": "Food & Civil Supplies",
    "hindiCategory": "खाद्य एवं उपभोक्ता संरक्षण",
    "jurisdiction": "bihar",
    "serviceType": "welfare",
    "summary": "Apply online for Priority Household (PHH) or Antyodaya (AAY) Ration Card, add new family members, or surrender cards under National Food Security Act.",
    "hindiSummary": "राष्ट्रीय खाद्य सुरक्षा अधिनियम के तहत प्राथमिकता परिवार (PHH) या अंत्योदय (AAY) राशन कार्ड हेतु ऑनलाइन आवेदन करें, नए पारिवारिक सदस्यों के नाम जोड़ें या राशन कार्ड सरेंडर करें।",
    "officialPortal": "http://epds.bihar.gov.in",
    "officialPortalName": "EPDS Bihar (Food & Consumer Protection Dept)",
    "hindiOfficialPortalName": "ईपीडीएस बिहार (खाद्य एवं उपभोक्ता संरक्षण विभाग)",
    "processingTime": "30 to 45 working days",
    "hindiProcessingTime": "30 से 45 कार्य दिवस",
    "estimatedFee": "Free (₹0 government statutory fee)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 सरकारी शुल्क)",
    "eligibility": [
      "Economically weaker families residing in Bihar without an existing active ration card anywhere in India",
      "Must satisfy NFSA exclusion criteria (no four-wheeler, no government employee in family)"
    ],
    "hindiEligibility": [
      "बिहार के आर्थिक रूप से कमजोर परिवार जिनके पास भारत में कहीं भी अन्य सक्रिय राशन कार्ड न हो",
      "एनएफएसए अपवर्जन मानकों पर खरा उतरना चाहिए (परिवार में चार पहिया वाहन या सरकारी कर्मचारी न हो)"
    ],
    "requiredDocuments": [
      "Combined joint family group photograph",
      "Aadhaar Card copies of all declared family members",
      "Bank passbook of female head of family (mandatory for DBT subsidies)",
      "Residential proof and income self-declaration"
    ],
    "hindiRequiredDocuments": [
      "संयुक्त पारिवारिक समूह फोटोग्राफ (Group Photo)",
      "परिवार के सभी सदस्यों के आधार कार्ड की प्रतियां",
      "परिवार की महिला मुखिया की बैंक पासबुक (डीबीटी सब्सिडी हेतु अनिवार्य)",
      "निवास प्रमाण और आय स्व-घोषणा पत्र"
    ],
    "steps": [
      "Access the EPDS Bihar RCMS portal (epds.bihar.gov.in) and click \"Apply for Online Ration Card\".",
      "Register with head of family mobile number and complete OTP verification.",
      "Fill in applicant details, rural/urban classification, block, panchayat, and residential address.",
      "Add each family member name, relation, age, and individual 12-digit Aadhaar number.",
      "Answer statutory exclusion questionnaires regarding vehicle ownership, income tax, and land size.",
      "Upload combined family photo, Aadhaar scans, and bank passbook first page.",
      "Submit the application and download the acknowledgement slip for Sub-Divisional Officer (SDO) field verification."
    ],
    "hindiSteps": [
      "ईपीडीएस बिहार पोर्टल (epds.bihar.gov.in) पर जाकर \"Apply for Online Ration Card\" पर क्लिक करें।",
      "परिवार के मुखिया के मोबाइल नंबर से पंजीकरण कर ओटीपी सत्यापन करें।",
      "आवेदक का विवरण, ग्रामीण/शहरी क्षेत्र, प्रखंड, पंचायत और आवासीय पता भरें।",
      "परिवार के प्रत्येक सदस्य का नाम, संबंध, आयु और 12-अंकीय आधार संख्या जोड़ें।",
      "वाहन स्वामित्व, आयकर और भूमि सीमा से जुड़े वैधानिक प्रश्नों के उत्तर दें।",
      "संयुक्त पारिवारिक फोटो, आधार स्कैन और बैंक पासबुक का पहला पृष्ठ अपलोड करें।",
      "आवेदन सबमिट करें और अनुमंडल पदाधिकारी (SDO) स्थलीय जांच हेतु पावती रसीद डाउनलोड करें।"
    ],
    "trackUrl": "http://epds.bihar.gov.in"
  },
  {
    "id": "bihar-student-credit-card-service",
    "title": "Bihar Student Credit Card: Portal Application & DRCC Booking (MNSSBY)",
    "hindiTitle": "बिहार स्टूडेंट क्रेडिट कार्ड: पोर्टल आवेदन एवं डीआरसीसी बुकिंग",
    "category": "Education & Student Services",
    "hindiCategory": "शिक्षा एवं छात्र सेवाएं",
    "jurisdiction": "bihar",
    "serviceType": "welfare",
    "summary": "Step-by-step assistance for online registration, fee invoice upload, and District Registration and Counselling Centre (DRCC) slot booking for education loans.",
    "hindiSummary": "उच्च शिक्षा ऋण हेतु ऑनलाइन पंजीकरण, कॉलेज फीस कोटेशन अपलोड, और जिला निबंधन एवं परामर्श केंद्र (DRCC) पर दस्तावेज सत्यापन स्लॉट बुक करने की पूरी गाइड।",
    "officialPortal": "https://www.7nishchay-yuvaupmission.bihar.gov.in",
    "officialPortalName": "MNSSBY Portal (Govt of Bihar)",
    "hindiOfficialPortalName": "एमएनएसएसबीवाई पोर्टल (बिहार सरकार)",
    "processingTime": "30 to 45 working days following DRCC verification",
    "hindiProcessingTime": "डीआरसीसी सत्यापन के बाद 30 से 45 कार्य दिवस",
    "estimatedFee": "Free (₹0 application fee)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 आवेदन शुल्क)",
    "eligibility": [
      "12th pass students from recognized Bihar educational boards admitted to approved degree/diploma courses",
      "Age under 25 years for Undergraduate courses; under 30 years for Post-graduate courses"
    ],
    "hindiEligibility": [
      "बिहार के मान्यता प्राप्त बोर्ड से 12वीं उत्तीर्ण छात्र जो अनुमोदित डिग्री/डिप्लोमा पाठ्यक्रमों में नामांकित हों",
      "स्नातक स्तर के पाठ्यक्रमों हेतु आयु 25 वर्ष से कम; स्नातकोत्तर पाठ्यक्रमों हेतु 30 वर्ष से कम"
    ],
    "requiredDocuments": [
      "10th and 12th Marksheets & Certificates",
      "College Admission Letter with official Course Fee Structure",
      "Aadhaar Card and PAN Card of Student and Co-borrower (Parent/Guardian)",
      "Passport size photos and Bank Passbook (6-month statement)"
    ],
    "hindiRequiredDocuments": [
      "10वीं और 12वीं की अंकतालिका एवं प्रमाण पत्र",
      "कॉलेज का आधिकारिक नामांकन पत्र और कोर्स फीस संरचना (Fee Structure)",
      "छात्र और सह-आवेदक (माता/पिता/अभिभावक) के आधार कार्ड और पैन कार्ड",
      "पासपोर्ट साइज फोटो और पिछले 6 माह का बैंक खाता विवरण"
    ],
    "steps": [
      "Register as a new user on the MNSSBY portal (7nishchay-yuvaupmission.bihar.gov.in).",
      "Verify mobile and email via OTP, then log in and select \"Bihar Student Credit Card (BSCC)\".",
      "Enter personal bio-data, 10th/12th school records, and co-applicant parent details.",
      "Enter admitted College/University name, course details, and total course fee schedule.",
      "Select appointment date and time for physical document verification at your district DRCC.",
      "Download the filled Application Form and visit DRCC with original documents on your scheduled date."
    ],
    "hindiSteps": [
      "एमएनएसएसबीवाई पोर्टल (7nishchay-yuvaupmission.bihar.gov.in) पर नए उपयोगकर्ता के रूप में पंजीकरण करें।",
      "मोबाइल और ईमेल पर प्राप्त ओटीपी सत्यापित कर \"बिहार स्टूडेंट क्रेडिट कार्ड (BSCC)\" चुनें।",
      "व्यक्तिगत बायोडाटा, 10वीं/12वीं के शैक्षणिक रिकॉर्ड और अभिभावक का विवरण भरें।",
      "प्रवेशित कॉलेज/विश्वविद्यालय का नाम, कोर्स विवरण और कुल फीस अनुसूची दर्ज करें।",
      "जिले के डीआरसीसी (DRCC) केंद्र पर भौतिक सत्यापन हेतु तिथि और समय स्लॉट बुक करें।",
      "भरा हुआ आवेदन पत्र डाउनलोड करें और निर्धारित तिथि पर मूल दस्तावेजों के साथ डीआरसीसी केंद्र जाएँ।"
    ],
    "trackUrl": "https://www.7nishchay-yuvaupmission.bihar.gov.in"
  },
  {
    "id": "bihar-nal-jal-grievance",
    "title": "Har Ghar Nal Ka Jal: Connection Grievance & Maintenance (PHED Bihar)",
    "hindiTitle": "हर घर नल का जल: शिकायत निवारण एवं रख-रखाव (PHED बिहार)",
    "category": "Public Utilities & Water",
    "hindiCategory": "सार्वजनिक उपयोगिता एवं जलापूर्ति",
    "jurisdiction": "bihar",
    "serviceType": "utility",
    "summary": "File formal complaints and service requests for damaged water taps, motor pump breakdowns, pipeline leakages, and new household tap connections under Saat Nischay.",
    "hindiSummary": "सात निश्चय के तहत टूटे नल, मोटर पंप खराबी, पाइपलाइन रिसाव, या नए घरेलू कनेक्शन हेतु लोक शिकायत निवारण अधिकार के तहत ऑनलाइन शिकायत और सर्विस रिक्वेस्ट दर्ज करें।",
    "officialPortal": "https://lokshikayat.bihar.gov.in",
    "officialPortalName": "Bihar Lok Shikayat & PHED Portal",
    "hindiOfficialPortalName": "बिहार लोक शिकायत एवं पीएचईडी पोर्टल",
    "processingTime": "7 to 15 working days for grievance redressal",
    "hindiProcessingTime": "7 से 15 कार्य दिवस में शिकायत निवारण",
    "estimatedFee": "Free (₹0 complaint registration)",
    "hindiEstimatedFee": "पूर्णतः निःशुल्क (₹0 शिकायत पंजीकरण)",
    "eligibility": [
      "Any resident household or ward member in Bihar experiencing piped water supply disruptions or awaiting tap connection"
    ],
    "hindiEligibility": [
      "बिहार का कोई भी नागरिक या वार्ड सदस्य जहाँ नल-जल आपूर्ति बाधित हो या कनेक्शन की आवश्यकता हो"
    ],
    "requiredDocuments": [
      "Ward Number, Panchayat, Block, and District details",
      "Description of pipeline/motor fault and photo (optional)",
      "Applicant mobile number for grievance tracking"
    ],
    "hindiRequiredDocuments": [
      "वार्ड नंबर, पंचायत, प्रखंड और जिले का विवरण",
      "पाइपलाइन या मोटर की खराबी का विवरण (फोटो वैकल्पिक)",
      "शिकायत की स्थिति ट्रैक करने हेतु शिकायतकर्ता का मोबाइल नंबर"
    ],
    "steps": [
      "Visit the Bihar Public Grievance portal (lokshikayat.bihar.gov.in) or call the toll-free PHED helpline (1800-345-6450).",
      "Select \"नया परिवाद दर्ज करें\" (File New Grievance).",
      "Enter mobile number, receive OTP, and enter citizen contact details.",
      "Select Department: \"लोक स्वास्थ्य अभियंत्रण विभाग\" (PHED) or \"पंचायती राज विभाग\".",
      "State grievance details: Motor pump malfunction, dry pipeline, or household tap repair needed.",
      "Submit the complaint to receive a unique Grievance Tracking Number (परिवाद संख्या) with statutory resolution time under Bihar Public Grievance Redressal Act."
    ],
    "hindiSteps": [
      "बिहार लोक शिकायत पोर्टल (lokshikayat.bihar.gov.in) पर जाएँ अथवा टोल-फ्री हेल्पलाइन (1800-345-6450) पर संपर्क करें।",
      "\"नया परिवाद दर्ज करें\" का विकल्प चुनें।",
      "मोबाइल नंबर दर्ज कर ओटीपी प्राप्त करें और अपनी संपर्क जानकारी भरें।",
      "संबंधित विभाग चुनें: \"लोक स्वास्थ्य अभियंत्रण विभाग (PHED)\" अथवा \"पंचायती राज विभाग\"।",
      "समस्या का स्पष्ट विवरण दें: मोटर खराब है, पाइपलाइन टूटी है या पानी नहीं आ रहा है।",
      "शिकायत सबमिट कर परिवाद संख्या प्राप्त करें, जिसके समाधान की समय-सीमा बिहार लोक शिकायत निवारण अधिकार अधिनियम के तहत कानूनन तय है।"
    ],
    "trackUrl": "https://lokshikayat.bihar.gov.in"
  }
];
