export type ApplicantCorrection = {
  id: string;
  label: string;
  hindi: string;
  description?: string;
  descriptionHindi?: string;
};

export type ServiceDocumentOption = {
  id: string;
  label: string;
  hindi: string;
  purpose: string;
  purposeHindi: string;
  required?: boolean;
};

export const CORRECTION_OPTIONS: Record<string, ApplicantCorrection[]> = {
  "pan-correction": [
    { id: "name", label: "Applicant name", hindi: "आवेदक का नाम" },
    { id: "father-name", label: "Father's name", hindi: "पिता का नाम" },
    { id: "mother-name", label: "Mother's name", hindi: "माता का नाम" },
    { id: "date-of-birth", label: "Date of birth", hindi: "जन्मतिथि" },
    { id: "gender", label: "Gender", hindi: "लिंग" },
    { id: "address", label: "Communication address", hindi: "पत्राचार का पता" },
    { id: "other", label: "Other permitted correction", hindi: "अन्य अनुमत सुधार" }
  ],
  "pan-photo-signature": [
    { id: "photo", label: "Photograph", hindi: "फोटो" },
    { id: "signature", label: "Signature", hindi: "हस्ताक्षर" }
  ],
  "aadhaar-address-doc": [
    { id: "address", label: "Address", hindi: "पता" },
    { id: "care-of", label: "C/O in address", hindi: "पते में C/O नाम" }
  ],
  "aadhaar-address-hof": [
    { id: "address", label: "Address through Head of Family", hindi: "परिवार के मुखिया के माध्यम से पता" }
  ],
  "aadhaar-co": [
    { id: "care-of", label: "C/O field in address", hindi: "पते में C/O फ़ील्ड" },
    { id: "address", label: "Other address details", hindi: "पते का अन्य विवरण" }
  ],
  "voter-correction": [
    { id: "name", label: "Name", hindi: "नाम" },
    { id: "gender", label: "Gender", hindi: "लिंग" },
    { id: "date-of-birth", label: "Date of birth / Age", hindi: "जन्मतिथि / आयु" },
    { id: "relation-type", label: "Relation type", hindi: "रिश्ते का प्रकार" },
    { id: "relation-name", label: "Relative's name", hindi: "रिश्तेदार का नाम" },
    { id: "address", label: "Address", hindi: "पता" },
    { id: "mobile", label: "Mobile number", hindi: "मोबाइल नंबर" },
    { id: "photo", label: "Photograph", hindi: "फोटो" }
  ],
  "ration-update": [
    { id: "add-member", label: "Add a family member", hindi: "परिवार के सदस्य का नाम जोड़ें" },
    { id: "remove-member", label: "Remove a family member", hindi: "परिवार के सदस्य का नाम हटाएँ" },
    { id: "member-correction", label: "Correct a member's details", hindi: "सदस्य का विवरण सुधारें" },
    { id: "head-change", label: "Change family head", hindi: "परिवार के मुखिया में बदलाव" },
    { id: "address", label: "Address correction", hindi: "पते में सुधार" },
    { id: "other", label: "Other permitted update", hindi: "अन्य अनुमत अपडेट" }
  ],
  "certificate-correction": [
    { id: "name", label: "Name", hindi: "नाम" },
    { id: "father-name", label: "Father's name", hindi: "पिता का नाम" },
    { id: "mother-name", label: "Mother's name", hindi: "माता का नाम" },
    { id: "date-of-birth", label: "Date of birth", hindi: "जन्मतिथि" },
    { id: "address", label: "Address", hindi: "पता" },
    { id: "category", label: "Category / caste details", hindi: "श्रेणी / जाति का विवरण" },
    { id: "other", label: "Other correction", hindi: "अन्य सुधार" }
  ]
};

const doc = (id: string, label: string, hindi: string, purpose: string, purposeHindi: string, required = false): ServiceDocumentOption =>
  ({ id, label, hindi, purpose, purposeHindi, required });

const COMMON_IDENTITY = [
  doc("aadhaar", "Aadhaar card / e-Aadhaar", "आधार कार्ड / ई-आधार", "Identity and/or address proof only where the selected official route accepts it.", "पहचान/पते का प्रमाण — केवल जहाँ चुना गया आधिकारिक माध्यम इसे स्वीकार करता हो।"),
  doc("voter-id", "Voter ID / e-EPIC", "वोटर आईडी / ई-EPIC", "Use only for the proof category accepted by the selected authority.", "केवल संबंधित विभाग द्वारा स्वीकार्य प्रमाण श्रेणी में।"),
  doc("passport", "Indian passport", "भारतीय पासपोर्ट", "Identity, address or date-of-birth proof where the rules permit.", "नियमों के अनुसार पहचान, पता या जन्मतिथि प्रमाण।"),
  doc("driving-licence", "Driving licence", "ड्राइविंग लाइसेंस", "Use only for the proof category accepted by the selected authority.", "केवल संबंधित विभाग द्वारा स्वीकार्य प्रमाण श्रेणी में।"),
  doc("birth-certificate", "Birth certificate", "जन्म प्रमाण पत्र", "Date-of-birth proof where accepted.", "जहाँ स्वीकार्य हो वहाँ जन्मतिथि का प्रमाण।"),
  doc("school-certificate", "Class 10 / 12 certificate or marksheet", "10वीं / 12वीं का प्रमाणपत्र या मार्कशीट", "Date-of-birth proof where accepted and the date is printed.", "जहाँ स्वीकार्य हो और जन्मतिथि अंकित हो वहाँ जन्मतिथि प्रमाण।"),
  doc("residence-certificate", "Residence / domicile certificate", "निवास / मूल निवास प्रमाणपत्र", "Address proof only where the selected route accepts it.", "पते का प्रमाण — केवल जहाँ चुना गया माध्यम स्वीकार करे।"),
  doc("other-proof", "Other supporting document", "अन्य सहायक दस्तावेज़", "Enter the exact document name; acceptance must be checked against the official route.", "दस्तावेज़ का सही नाम लिखें; स्वीकार्यता आधिकारिक माध्यम से जाँची जाएगी।")
];

export const SERVICE_DOCUMENTS: Record<string, ServiceDocumentOption[]> = {
  "pan-new": [
    doc("aadhaar", "Aadhaar (mandatory except exempt categories)", "आधार (छूट वाली श्रेणी को छोड़कर अनिवार्य)", "PAN 2026 rules require Aadhaar except exempt categories; identity/address use is subject to the current rule.", "PAN 2026 नियमों के अनुसार छूट वाली श्रेणी छोड़कर आधार आवश्यक है।", true),
    doc("passport", "Indian passport", "भारतीय पासपोर्ट", "Accepted identity, address and date-of-birth proof.", "पहचान, पता और जन्मतिथि प्रमाण।"),
    doc("driving-licence", "Driving licence", "ड्राइविंग लाइसेंस", "Accepted identity, address and date-of-birth proof.", "पहचान, पता और जन्मतिथि प्रमाण।"),
    doc("voter-id", "Voter ID", "वोटर आईडी", "Accepted identity, address and date-of-birth proof.", "पहचान, पता और जन्मतिथि प्रमाण।"),
    doc("ration-photo", "Ration card with applicant photograph", "आवेदक की फोटो वाला राशन कार्ड", "Identity proof only; not address or DOB proof in the current PAN table.", "वर्तमान PAN सूची में केवल पहचान प्रमाण; पता या जन्मतिथि प्रमाण नहीं।"),
    doc("birth-certificate", "Birth certificate", "जन्म प्रमाण पत्र", "Date-of-birth proof.", "जन्मतिथि प्रमाण।"),
    doc("school-certificate", "Recognised board matriculation certificate / marksheet", "मान्यता प्राप्त बोर्ड की मैट्रिक प्रमाणपत्र / मार्कशीट", "Date-of-birth proof.", "जन्मतिथि प्रमाण।"),
    doc("photo", "Recent colour photograph (4.5 × 3.5 cm)", "हाल की रंगीन फोटो (4.5 × 3.5 सेमी)", "Paper Form 93 instructions specify recent photographs; provider's digital route may have different upload specifications.", "पेपर Form 93 में हाल की फोटो बताई गई है; डिजिटल माध्यम में प्रदाता के अलग निर्देश हो सकते हैं।", true),
    doc("signature", "Applicant signature / thumb impression", "आवेदक के हस्ताक्षर / अंगूठे का निशान", "As required by the selected paper or digital route.", "चुने गए पेपर या डिजिटल माध्यम के अनुसार।", true)
  ],
  "pan-correction": [
    doc("existing-pan", "Existing PAN card / PAN allotment letter", "मौजूदा PAN कार्ड / PAN आवंटन पत्र", "PAN CR-01 asks for PAN copy; if lost, the form guideline says FIR copy.", "PAN CR-01 में PAN की कॉपी माँगी गई है; खो जाने पर निर्देश में FIR कॉपी बताई गई है।", true),
    doc("aadhaar", "Aadhaar (mandatory except exempt categories)", "आधार (छूट वाली श्रेणी को छोड़कर अनिवार्य)", "Quote Aadhaar except exempt categories.", "छूट वाली श्रेणी छोड़कर आधार देना आवश्यक है।", true),
    ...COMMON_IDENTITY,
    doc("gazette", "Gazette notification / official name-change proof", "राजपत्र अधिसूचना / आधिकारिक नाम परिवर्तन प्रमाण", "May be needed for a material name change; exact proof depends on the correction and provider.", "बड़े नाम परिवर्तन में आवश्यक हो सकता है; सही प्रमाण सुधार और प्रदाता पर निर्भर है।"),
    doc("father-proof", "Document supporting the corrected father's name", "सुधारे गए पिता के नाम का समर्थन करने वाला दस्तावेज़", "Select a document that actually shows the requested correct particulars; PAN provider may request additional evidence.", "ऐसा दस्तावेज़ चुनें जिसमें सही विवरण स्पष्ट हो; PAN प्रदाता अतिरिक्त प्रमाण माँग सकता है।"),
    doc("mother-proof", "Document supporting the corrected mother's name", "सुधारे गए माता के नाम का समर्थन करने वाला दस्तावेज़", "Select a document that actually shows the requested correct particulars; PAN provider may request additional evidence.", "ऐसा दस्तावेज़ चुनें जिसमें सही विवरण स्पष्ट हो; PAN प्रदाता अतिरिक्त प्रमाण माँग सकता है।"),
    doc("electricity", "Electricity bill (not older than 3 months)", "बिजली बिल (3 महीने से पुराना नहीं)", "Proof of address under Rule 158 where the current PAN route accepts it.", "Rule 158 के अनुसार पता प्रमाण, जहाँ वर्तमान PAN माध्यम स्वीकार करे।"),
    doc("water-bill", "Water bill (not older than 3 months)", "पानी का बिल (3 महीने से पुराना नहीं)", "Proof of address under Rule 158 where accepted.", "Rule 158 के अनुसार पता प्रमाण, जहाँ स्वीकार हो।"),
    doc("phone-bill", "Landline / broadband bill (not older than 3 months)", "लैंडलाइन / ब्रॉडबैंड बिल (3 महीने से पुराना नहीं)", "Proof of address under Rule 158 where accepted.", "Rule 158 के अनुसार पता प्रमाण, जहाँ स्वीकार हो।"),
    doc("gas-bill", "Gas connection card / book / piped gas bill (not older than 3 months)", "गैस कनेक्शन कार्ड / बुक / पाइप गैस बिल (3 महीने से पुराना नहीं)", "Proof of address under Rule 158 where accepted.", "Rule 158 के अनुसार पता प्रमाण, जहाँ स्वीकार हो।"),
    doc("bank-statement", "Bank account statement (not older than 3 months)", "बैंक खाता स्टेटमेंट (3 महीने से पुराना नहीं)", "Proof of address under Rule 158, subject to the listed conditions.", "Rule 158 के अनुसार पता प्रमाण, सूची की शर्तों के अधीन।"),
    doc("post-office", "Post-office passbook with applicant address", "आवेदक के पते वाली पोस्ट ऑफिस पासबुक", "Proof of address under Rule 158 where accepted.", "Rule 158 के अनुसार पता प्रमाण, जहाँ स्वीकार हो।"),
    doc("property-record", "Property registration document / latest property tax assessment", "प्रॉपर्टी रजिस्ट्रेशन दस्तावेज़ / नवीनतम प्रॉपर्टी टैक्स आकलन", "Proof of address under Rule 158 where accepted.", "Rule 158 के अनुसार पता प्रमाण, जहाँ स्वीकार हो।"),
    doc("accommodation-letter", "Government accommodation allotment letter (not older than 3 years)", "सरकारी आवास आवंटन पत्र (3 वर्ष से पुराना नहीं)", "Proof of address under Rule 158 where accepted.", "Rule 158 के अनुसार पता प्रमाण, जहाँ स्वीकार हो।"),
    doc("government-id", "Government / PSU photo identity card", "सरकारी / PSU फोटो पहचान पत्र", "Proof of identity; category-specific use applies.", "पहचान प्रमाण; श्रेणी के अनुसार उपयोग लागू होगा।"),
    doc("pension-order", "Pension payment order", "पेंशन भुगतान आदेश", "Date-of-birth proof where the current PAN table accepts it.", "वर्तमान PAN सूची में जहाँ स्वीकार हो वहाँ जन्मतिथि प्रमाण।"),
    doc("marriage-certificate", "Marriage certificate issued by Registrar of Marriages", "विवाह रजिस्ट्रार द्वारा जारी विवाह प्रमाणपत्र", "Date-of-birth proof in the current PAN table; additional change proof may be required.", "वर्तमान PAN सूची में जन्मतिथि प्रमाण; अतिरिक्त सुधार प्रमाण माँगा जा सकता है।"),
    doc("magistrate-affidavit", "Magistrate-sworn affidavit stating date of birth", "जन्मतिथि बताने वाला मजिस्ट्रेट के समक्ष शपथपत्र", "Date-of-birth proof under Rule 158 where accepted.", "Rule 158 के अनुसार जन्मतिथि प्रमाण, जहाँ स्वीकार हो।")
  ],
  "pan-photo-signature": [
    doc("existing-pan", "Existing PAN card / PAN allotment letter", "मौजूदा PAN कार्ड / PAN आवंटन पत्र", "PAN CR-01 supporting PAN copy.", "PAN CR-01 के अनुसार PAN की कॉपी।", true),
    doc("aadhaar", "Aadhaar (mandatory except exempt categories)", "आधार (छूट वाली श्रेणी को छोड़कर अनिवार्य)", "Quote Aadhaar except exempt categories.", "छूट वाली श्रेणी छोड़कर आधार देना आवश्यक है।", true),
    doc("photo", "New recent colour photograph", "नई हाल की रंगीन फोटो", "Use the current provider's image size, format and file-size rules.", "वर्तमान प्रदाता के फोटो आकार, फॉर्मेट और फ़ाइल-साइज नियम लागू होंगे।"),
    doc("signature", "New signature image", "नया हस्ताक्षर", "Use the current provider's image size, format and file-size rules.", "वर्तमान प्रदाता के आकार, फॉर्मेट और फ़ाइल-साइज नियम लागू होंगे।"),
    doc("change-proof", "Other proof requested by PAN provider", "PAN प्रदाता द्वारा माँगा गया अन्य प्रमाण", "The provider may require supporting proof for the requested change.", "माँगे गए बदलाव के लिए प्रदाता सहायक प्रमाण माँग सकता है।")
  ],
  "aadhaar-address-doc": [
    doc("aadhaar", "Aadhaar number / current Aadhaar", "आधार नंबर / मौजूदा आधार", "Do not type the full Aadhaar number in this Preview form.", "इस Preview फॉर्म में पूरा आधार नंबर न लिखें।", true),
    doc("passport", "Valid Indian passport", "वैध भारतीय पासपोर्ट", "UIDAI List IV includes this as PoI and PoA.", "UIDAI List IV में पहचान और पते के प्रमाण के रूप में।"),
    doc("voter-id", "Voter ID / e-Voter ID verifiable online", "ऑनलाइन सत्यापित वोटर आईडी / ई-वोटर आईडी", "UIDAI List IV includes it as PoI and PoA.", "UIDAI List IV में पहचान और पते के प्रमाण के रूप में।"),
    doc("ration-card", "Ration / PDS photograph card or e-Ration card", "राशन / PDS फोटो कार्ड या ई-राशन कार्ड", "UIDAI List IV includes it as PoI and PoA.", "UIDAI List IV में पहचान और पते के प्रमाण के रूप में।"),
    doc("domicile", "State domicile certificate", "राज्य का मूल निवास प्रमाणपत्र", "UIDAI List IV includes it as PoI and PoA.", "UIDAI List IV में पहचान और पते के प्रमाण के रूप में।"),
    doc("electricity", "Electricity bill (not older than 3 months)", "बिजली बिल (3 महीने से पुराना नहीं)", "UIDAI List IV PoA category.", "UIDAI List IV की पता प्रमाण श्रेणी।"),
    doc("water-bill", "Water bill (not older than 3 months)", "पानी का बिल (3 महीने से पुराना नहीं)", "UIDAI List IV PoA category.", "UIDAI List IV की पता प्रमाण श्रेणी।"),
    doc("phone-bill", "Landline / post-paid mobile / broadband bill (not older than 3 months)", "लैंडलाइन / पोस्टपेड मोबाइल / ब्रॉडबैंड बिल (3 महीने से पुराना नहीं)", "UIDAI List IV PoA category.", "UIDAI List IV की पता प्रमाण श्रेणी।"),
    doc("bank-statement", "Bank / post-office statement (not older than 3 months)", "बैंक / पोस्ट ऑफिस स्टेटमेंट (3 महीने से पुराना नहीं)", "Must meet the current UIDAI List IV conditions, including bank stamp/signature where specified.", "UIDAI List IV की मौजूदा शर्तें, जहाँ लागू हों बैंक की मुहर/हस्ताक्षर सहित।"),
    doc("rent-agreement", "Registered sale / gift / rent / lease / leave-and-licence agreement", "रजिस्टर्ड बिक्री / गिफ्ट / किराया / लीज़ एग्रीमेंट", "UIDAI List IV PoA category; confirm the exact current document conditions.", "UIDAI List IV की पता प्रमाण श्रेणी; दस्तावेज़ की वर्तमान शर्तें जाँचें।"),
    doc("property-tax", "Property tax receipt (not older than 1 year)", "प्रॉपर्टी टैक्स रसीद (1 वर्ष से पुरानी नहीं)", "UIDAI List IV PoA category.", "UIDAI List IV की पता प्रमाण श्रेणी।"),
    doc("service-id", "Government / PSU / statutory-body service photo ID", "सरकारी / PSU / वैधानिक निकाय का सेवा फोटो पहचान पत्र", "UIDAI List IV accepts specified service photo IDs for PoI and PoA.", "UIDAI List IV में निर्दिष्ट सेवा फोटो पहचान पत्र स्वीकार हैं।"),
    doc("pensioner-id", "Pensioner / Freedom Fighter photo ID or Pension Payment Order", "पेंशनर / स्वतंत्रता सेनानी फोटो आईडी या पेंशन भुगतान आदेश", "UIDAI List IV accepts specified cards/orders for the proof categories shown in the list.", "UIDAI List IV में सूचीबद्ध प्रमाण श्रेणियों के लिए निर्दिष्ट कार्ड/आदेश स्वीकार हैं।"),
    doc("kisan-passbook", "Kisan photo passbook", "किसान फोटो पासबुक", "UIDAI List IV includes it for identity and address proof.", "UIDAI List IV में पहचान और पता प्रमाण के रूप में।"),
    doc("health-card", "CGHS / ECHS / ESIC / Medi-Claim card", "CGHS / ECHS / ESIC / मेडिक्लेम कार्ड", "UIDAI List IV accepts specified government/PSU health cards for identity proof.", "UIDAI List IV में निर्दिष्ट सरकारी/PSU स्वास्थ्य कार्ड पहचान प्रमाण के रूप में।"),
    doc("mgnrega", "MGNREGA / NREGS job card", "मनरेगा / NREGS जॉब कार्ड", "UIDAI List IV includes it for specified proof categories.", "UIDAI List IV में निर्दिष्ट प्रमाण श्रेणियों के लिए।"),
    doc("education-record", "Recognised school / university marksheet or certificate", "मान्यता प्राप्त स्कूल / विश्वविद्यालय की मार्कशीट या प्रमाणपत्र", "UIDAI List IV includes education records for specified identity / relationship / DOB categories.", "UIDAI List IV में शिक्षा रिकॉर्ड निर्दिष्ट पहचान / संबंध / जन्मतिथि श्रेणियों के लिए।"),
    doc("bank-passbook", "Bank / post-office passbook with required stamp and photograph", "आवश्यक मुहर और फोटो वाली बैंक / पोस्ट ऑफिस पासबुक", "Must meet the exact UIDAI List IV stamp/signature conditions.", "UIDAI List IV की मुहर/हस्ताक्षर संबंधी शर्तें पूरी होनी चाहिए।"),
    doc("marriage-certificate", "Government-issued marriage certificate", "सरकार द्वारा जारी विवाह प्रमाणपत्र", "UIDAI List IV accepts it for specified identity, address and relationship categories.", "UIDAI List IV में निर्दिष्ट पहचान, पता और संबंध श्रेणियों के लिए।"),
    doc("divorce-decree", "Family-court divorce decree", "परिवार न्यायालय का तलाक आदेश", "UIDAI List IV includes it for specified identity changes.", "UIDAI List IV में निर्दिष्ट पहचान बदलाव के लिए।"),
    doc("caste-certificate", "SC / ST / OBC certificate issued by Central or State Government", "केंद्र / राज्य सरकार द्वारा जारी SC / ST / OBC प्रमाणपत्र", "UIDAI List IV accepts it for specified proof categories.", "UIDAI List IV में निर्दिष्ट प्रमाण श्रेणियों के लिए।"),
    doc("uidai-standard-certificate", "UIDAI standard-format certificate from an authorised officer", "अधिकृत अधिकारी का UIDAI मानक प्रारूप प्रमाणपत्र", "Only the issuing authorities and conditions listed by UIDAI are accepted.", "केवल UIDAI द्वारा सूचीबद्ध जारीकर्ता और शर्तें मान्य हैं।"),
    doc("panchayat-address-certificate", "UIDAI standard-format certificate from village panchayat authority", "ग्राम पंचायत प्राधिकारी का UIDAI मानक प्रारूप प्रमाणपत्र", "Address proof only for the authorised rural-area issuer and format.", "केवल अधिकृत ग्रामीण जारीकर्ता और प्रारूप का पता प्रमाण।"),
    doc("other-proof", "Other UIDAI-listed Proof of Address", "UIDAI सूची का अन्य पता प्रमाण", "Enter the exact document name and verify it in the current UIDAI list.", "सही नाम लिखें और वर्तमान UIDAI सूची में सत्यापित करें।")
  ],
  "aadhaar-address-hof": [
    doc("applicant-aadhaar", "Applicant's Aadhaar", "आवेदक का आधार", "Do not type the full Aadhaar number in this Preview form.", "इस Preview फॉर्म में पूरा आधार नंबर न लिखें।", true),
    doc("hof-aadhaar", "Head of Family's Aadhaar", "परिवार के मुखिया का आधार", "HoF must meet UIDAI's relationship and age conditions.", "HoF को UIDAI की रिश्ते और आयु संबंधी शर्तें पूरी करनी होंगी।", true),
    doc("relationship-proof", "UIDAI-accepted Proof of Relationship", "UIDAI द्वारा स्वीकार्य संबंध प्रमाण", "Must contain the applicant's and HoF's names where required.", "जहाँ आवश्यक हो, आवेदक और HoF दोनों के नाम होने चाहिए।", true),
    doc("hof-consent", "HoF consent / authentication", "HoF की सहमति / प्रमाणीकरण", "HoF must complete the required consent/authentication step directly.", "HoF को आवश्यक सहमति/प्रमाणीकरण स्वयं पूरा करना होगा।", true)
  ],
  "aadhaar-co": [
    doc("aadhaar", "Current Aadhaar", "मौजूदा आधार", "C/O is part of the address field; do not enter full Aadhaar number here.", "C/O पते का हिस्सा है; यहाँ पूरा आधार नंबर न लिखें।", true),
    doc("address-proof", "UIDAI-accepted Proof of Address in applicant's name", "आवेदक के नाम का UIDAI-स्वीकृत पता प्रमाण", "The document need not contain the name of the person written in C/O; C/O is optional.", "दस्तावेज़ में C/O में लिखे व्यक्ति का नाम होना जरूरी नहीं; C/O वैकल्पिक है।", true)
  ],
  "aadhaar-mobile": [doc("aadhaar", "Current Aadhaar", "मौजूदा आधार", "Do not enter the full Aadhaar number or OTP here.", "यहाँ पूरा आधार नंबर या OTP न लिखें।", true)],
  "aadhaar-email": [doc("aadhaar", "Current Aadhaar", "मौजूदा आधार", "Do not enter the full Aadhaar number or OTP here.", "यहाँ पूरा आधार नंबर या OTP न लिखें।", true)],
  "aadhaar-lost": [doc("identity-details", "Name as recorded in Aadhaar", "आधार में दर्ज नाम", "Registered mobile/email access may be needed; customer enters OTP directly.", "रजिस्टर्ड मोबाइल/ईमेल की पहुँच जरूरी हो सकती है; OTP ग्राहक स्वयं दर्ज करेगा।", true)],
  "aadhaar-download": [doc("registered-mobile", "Access to registered mobile for OTP", "OTP के लिए रजिस्टर्ड मोबाइल की पहुँच", "Customer enters OTP directly on the official UIDAI portal.", "ग्राहक आधिकारिक UIDAI पोर्टल पर OTP स्वयं दर्ज करेगा।", true)],
  "certificate-income": [
    doc("identity", "Applicant identity proof", "आवेदक का पहचान प्रमाण", "Bihar ServicePlus lists an identification document.", "बिहार ServicePlus में पहचान दस्तावेज़ सूचीबद्ध है।", true),
    doc("self-affidavit", "Form-XVII self-affidavit", "Form-XVII स्व-शपथ-पत्र", "Listed in Bihar ServicePlus income-certificate enclosure checklist.", "बिहार ServicePlus की आय प्रमाणपत्र सूची में।"),
    doc("salary-pension", "Salary slip / pension slip", "वेतन पर्ची / पेंशन पर्ची", "Where applicable to the applicant's income source.", "आवेदक की आय के स्रोत के अनुसार।"),
    doc("itr", "Income-tax return", "आयकर रिटर्न", "Where available and relevant.", "जहाँ उपलब्ध और लागू हो।"),
    doc("other-income", "Other income supporting record", "आय का अन्य सहायक रिकॉर्ड", "Describe the exact record; authority may ask for additional evidence.", "रिकॉर्ड का सही नाम लिखें; अधिकारी अतिरिक्त प्रमाण माँग सकता है।")
  ],
  "certificate-caste": [
    doc("identity", "Applicant identity proof", "आवेदक का पहचान प्रमाण", "Select a document from the applicable Bihar ServicePlus list.", "बिहार ServicePlus की लागू सूची से दस्तावेज़ चुनें।", true),
    doc("form-ii", "Form-II self-affidavit", "Form-II स्व-शपथ-पत्र", "Listed in Bihar ServicePlus caste-certificate checklist.", "बिहार ServicePlus की जाति प्रमाणपत्र सूची में।"),
    doc("form-iii", "Form-III self-affidavit", "Form-III स्व-शपथ-पत्र", "Listed in Bihar ServicePlus caste-certificate checklist.", "बिहार ServicePlus की जाति प्रमाणपत्र सूची में।"),
    doc("form-v", "Form-V self-affidavit", "Form-V स्व-शपथ-पत्र", "Listed in Bihar ServicePlus caste-certificate checklist.", "बिहार ServicePlus की जाति प्रमाणपत्र सूची में।"),
    doc("khatiyan", "Ancestor's revenue record / Khatiyan", "पूर्वज का राजस्व रिकॉर्ड / खतियान", "Bihar ServicePlus lists revenue records as caste evidence.", "बिहार ServicePlus जाति प्रमाण के रूप में राजस्व रिकॉर्ड सूचीबद्ध करता है।"),
    doc("gift-deed", "Gift deed / land document / land-allotment record", "दानपत्र / भूमि दस्तावेज़ / भूमि आवंटन रिकॉर्ड", "Select the relevant record of the applicant's father/ancestor.", "आवेदक के पिता/पूर्वज का संबंधित रिकॉर्ड चुनें।"),
    doc("field-verification", "Request for field verification if revenue records are unavailable", "राजस्व रिकॉर्ड न होने पर स्थल जाँच का अनुरोध", "Bihar ServicePlus form includes this route.", "बिहार ServicePlus फॉर्म में यह विकल्प है।")
  ],
  "certificate-residence": [
    doc("identity", "Applicant identity proof", "आवेदक का पहचान प्रमाण", "Select a currently accepted Bihar ServicePlus identity document.", "बिहार ServicePlus में वर्तमान में स्वीकार्य पहचान दस्तावेज़।", true),
    doc("form-xiv", "Form-XIV self-affidavit", "Form-XIV स्व-शपथ-पत्र", "Listed in Bihar ServicePlus residence-certificate checklist.", "बिहार ServicePlus की निवास प्रमाणपत्र सूची में।"),
    doc("ration-card", "Ration card", "राशन कार्ड", "Bihar ServicePlus residence evidence list.", "बिहार ServicePlus की निवास प्रमाण सूची में।"),
    doc("voter-id", "Voter ID", "वोटर आईडी", "Bihar ServicePlus residence evidence list.", "बिहार ServicePlus की निवास प्रमाण सूची में।"),
    doc("electricity", "Electricity bill", "बिजली बिल", "Bihar ServicePlus residence evidence list.", "बिहार ServicePlus की निवास प्रमाण सूची में।"),
    doc("phone-bill", "Telephone bill", "टेलीफोन बिल", "Bihar ServicePlus residence evidence list.", "बिहार ServicePlus की निवास प्रमाण सूची में।"),
    doc("land-record", "Khatiyan / gift deed / other land revenue record", "खतियान / दानपत्र / अन्य भूमि राजस्व रिकॉर्ड", "Select the applicant's or parent's/ancestor's relevant record as asked by the form.", "फॉर्म के अनुसार आवेदक या माता-पिता/पूर्वज का संबंधित रिकॉर्ड।")
  ],
  "certificate-correction": [
    doc("existing-certificate", "Existing certificate", "मौजूदा प्रमाणपत्र", "The issuing authority must correct its own record.", "मूल जारीकर्ता विभाग ही अपने रिकॉर्ड में सुधार करेगा।", true),
    doc("correct-proof", "Proof showing the correct detail", "सही विवरण दिखाने वाला प्रमाण", "Choose the source record that supports the exact requested correction.", "जिस मूल रिकॉर्ड से माँगा गया सुधार सिद्ध होता हो।", true),
    doc("application-copy", "Previous application / acknowledgement, if available", "पुराना आवेदन / पावती, यदि उपलब्ध हो", "Helps identify the issuing record.", "जारी रिकॉर्ड पहचानने में मदद करता है।")
  ],
  "voter-new": [
    doc("age-proof", "Age proof: birth certificate / Aadhaar / PAN / driving licence / Class X-XII certificate / passport", "आयु प्रमाण: जन्म प्रमाणपत्र / आधार / PAN / ड्राइविंग लाइसेंस / 10वीं-12वीं प्रमाणपत्र / पासपोर्ट", "Form 6 lists these age-proof options; self-attested copy.", "Form 6 में ये आयु प्रमाण विकल्प हैं; स्व-प्रमाणित प्रति।", true),
    doc("address-proof", "Ordinary residence proof (as listed in Form 6)", "सामान्य निवास का प्रमाण (Form 6 की सूची अनुसार)", "Use the applicant/parent/spouse document allowed by the form.", "फॉर्म के अनुसार आवेदक/माता-पिता/जीवनसाथी का अनुमत दस्तावेज़।", true),
    doc("photo", "Recent unsigned colour photograph (4.5 × 3.5 cm, white background)", "हाल की बिना हस्ताक्षर वाली रंगीन फोटो (4.5 × 3.5 सेमी, सफेद बैकग्राउंड)", "As specified in Form 6.", "Form 6 के अनुसार।", true)
  ],
  "voter-correction": [
    doc("epic", "Existing EPIC / Voter ID details", "मौजूदा EPIC / वोटर आईडी विवरण", "Form 8 is for an enrolled elector.", "Form 8 पहले से पंजीकृत मतदाता के लिए है।", true),
    doc("correction-proof", "Self-attested proof for each selected correction", "हर चुने गए सुधार का स्व-प्रमाणित प्रमाण", "Form 8 requires documentary proof supporting the claim.", "Form 8 में दावे के समर्थन में दस्तावेज़ आवश्यक है।", true),
    doc("address-proof", "Address proof for shifting / address correction", "पता बदलने / पता सुधार का प्रमाण", "Use one of the current Form 8 accepted documents.", "Form 8 की वर्तमान स्वीकार्य सूची में से एक।"),
    doc("photo", "Recent unsigned colour photograph (4.5 × 3.5 cm, white background)", "हाल की बिना हस्ताक्षर वाली रंगीन फोटो (4.5 × 3.5 सेमी, सफेद बैकग्राउंड)", "Required when the applicant requests a photo change.", "फोटो बदलने का अनुरोध होने पर।")
  ],
  "ration-new": [
    doc("family-details", "Details of all family members", "परिवार के सभी सदस्यों का विवरण", "Exact fields depend on the active Bihar PDS application route.", "वर्तमान बिहार PDS आवेदन माध्यम के अनुसार विवरण।", true),
    doc("identity", "Identity documents of family members", "परिवार के सदस्यों के पहचान दस्तावेज़", "Select documents requested by the live department form.", "वर्तमान विभागीय फॉर्म द्वारा माँगे गए दस्तावेज़ चुनें।", true),
    doc("address-proof", "Family address / residence proof", "परिवार के पते / निवास का प्रमाण", "Exact accepted list depends on the current Bihar PDS route.", "स्वीकार्य सूची वर्तमान बिहार PDS माध्यम पर निर्भर है।", true),
    doc("income-eligibility", "Income / eligibility record, if requested", "आय / पात्रता रिकॉर्ड, यदि माँगा जाए", "Do not assume this is required for every applicant.", "हर आवेदक के लिए इसे अनिवार्य न मानें।"),
    doc("photo", "Family / member photographs, if requested", "परिवार / सदस्य की फोटो, यदि माँगी जाए", "Only where the active portal asks for it.", "केवल जहाँ सक्रिय पोर्टल माँगे।")
  ],
  "ration-update": [
    doc("existing-ration", "Existing ration card", "मौजूदा राशन कार्ड", "Required to identify the current family record.", "मौजूदा परिवार रिकॉर्ड पहचानने के लिए।", true),
    doc("member-id", "Identity proof of affected member(s)", "प्रभावित सदस्य(ों) का पहचान प्रमाण", "For addition/correction, as required by the live PDS form.", "नाम जोड़ने/सुधार के लिए वर्तमान PDS फॉर्म अनुसार।"),
    doc("relationship", "Relationship / birth / marriage proof, where relevant", "संबंध / जन्म / विवाह प्रमाण, जहाँ लागू हो", "Depends on whether a member is added, removed or corrected.", "सदस्य जोड़ने, हटाने या सुधारने के अनुसार।"),
    doc("address-proof", "Address proof for address change", "पता बदलने का प्रमाण", "Only for address correction.", "केवल पता सुधार के लिए।"),
    doc("death-certificate", "Death certificate, if removing a deceased member", "मृत सदस्य हटाने पर मृत्यु प्रमाणपत्र", "Only where applicable.", "केवल जहाँ लागू हो।")
  ],
  "scheme-check": [
    doc("scheme-details", "Selected scheme name and applicant profile details", "चुनी गई योजना और आवेदक की प्रोफ़ाइल", "A scheme-specific checklist will be prepared after selecting the exact scheme.", "सटीक योजना चुनने के बाद अलग दस्तावेज़ सूची बनेगी।", true),
    doc("scheme-proof", "Scheme-specific proof documents", "योजना के अनुसार प्रमाण दस्तावेज़", "Do not upload or assume a universal document list.", "सभी योजनाओं के लिए एक जैसी सूची न मानें।")
  ],
  "online-form": [
    doc("form-notice", "Official form / notification / advertisement", "आधिकारिक फॉर्म / अधिसूचना / विज्ञापन", "Needed to identify the correct form and its current checklist.", "सही फॉर्म और उसकी वर्तमान सूची पहचानने के लिए।", true),
    doc("form-documents", "Documents listed in the selected official form", "चुने गए आधिकारिक फॉर्म में बताए दस्तावेज़", "The list is determined by the exact form, not a generic checklist.", "सूची सटीक फॉर्म से तय होगी, सामान्य सूची से नहीं।")
  ],
  "website-services": [
    doc("project-brief", "Website purpose, business/project description and page content", "वेबसाइट का उद्देश्य, व्यवसाय/प्रोजेक्ट विवरण और पेज सामग्री", "A written scope is needed before quoting.", "कोटेशन से पहले लिखित कार्य-सीमा चाहिए।"),
    doc("brand-assets", "Logo, brand colours, images and reference links, if available", "लोगो, ब्रांड रंग, फोटो और संदर्भ लिंक, यदि उपलब्ध हों", "Only upload assets you own or are authorised to use.", "केवल अपने या उपयोग की अनुमति वाले संसाधन दें।")
  ],
  "pdf-text-edit": [
    doc("source-pdf", "Original customer-owned PDF", "ग्राहक की मूल PDF", "Provide exact page number and exact replacement text; lawful corrections only.", "सटीक पेज और नया टेक्स्ट दें; केवल वैध सुधार।", true),
    doc("correction-instructions", "Written correction instructions / source proof", "लिखित सुधार निर्देश / मूल प्रमाण", "No falsification or misleading alteration of official, education or financial records.", "सरकारी, शैक्षणिक या वित्तीय रिकॉर्ड में भ्रामक बदलाव नहीं।", true)
  ],
  "pdf-compress": [doc("source-pdf", "PDF file", "PDF फ़ाइल", "Choose target size if the receiving portal specifies one.", "यदि पोर्टल ने सीमा दी है तो लक्ष्य साइज बताएँ।", true)],
  "pdf-merge": [doc("source-pdfs", "All PDF files to combine", "जोड़ने वाली सभी PDF फ़ाइलें", "Specify the desired order.", "पेज/फ़ाइल का क्रम बताएँ।", true)],
  "pdf-split": [doc("source-pdf", "Original PDF", "मूल PDF", "Specify page numbers or ranges.", "पेज नंबर या रेंज बताएँ।", true)],
  "pdf-jpg": [doc("source-images", "JPG / PNG / WebP images", "JPG / PNG / WebP फोटो", "Specify page size and image order.", "पेज साइज और फोटो का क्रम बताएँ।", true)],
  "pdf-word": [doc("source-pdf", "Original PDF", "मूल PDF", "Text extraction and layout accuracy depend on source quality.", "टेक्स्ट और लेआउट की सटीकता मूल फ़ाइल पर निर्भर है।", true)],
  "pdf-edit": [doc("source-pdf", "Customer-owned PDF", "ग्राहक की अपनी PDF", "Provide exact instructions for reorder, rotate, delete or annotate.", "पेज क्रम, घुमाने, हटाने या नोट जोड़ने के स्पष्ट निर्देश दें।", true)],
  "image-compress": [doc("source-image", "Original JPG / PNG / WebP image", "मूल JPG / PNG / WebP फोटो", "Specify target KB and dimensions, if any.", "लक्ष्य KB और आयाम बताएँ, यदि हों।", true)],
  "signature-resize": [doc("source-signature", "Clear signature image", "साफ हस्ताक्षर की फोटो", "Specify target KB and dimensions from the form/portal.", "फॉर्म/पोर्टल के अनुसार लक्ष्य KB और आयाम बताएँ।", true)],
  "scan-clean": [doc("source-scan", "Original scan / document photo", "मूल स्कैन / दस्तावेज़ की फोटो", "Only crop, align and improve readability; do not change facts.", "केवल क्रॉप, सीधा और स्पष्ट करें; तथ्य न बदलें।", true)],
  "typing-format": [doc("source-content", "Text / handwritten content / source file", "टेक्स्ट / हस्तलिखित सामग्री / मूल फ़ाइल", "Specify language, output format and page size.", "भाषा, आउटपुट फॉर्मेट और पेज साइज बताएँ।", true)],
  "aadhaar-pvc-assistance": [doc("uidai-access", "Access to official UIDAI portal and registered mobile", "आधिकारिक UIDAI पोर्टल और रजिस्टर्ड मोबाइल की पहुँच", "Customer must enter OTP and place the order themselves.", "ग्राहक OTP स्वयं दर्ज करेगा और ऑर्डर स्वयं करेगा।", true)],
  "bw-print": [doc("print-file", "PDF / document to print", "प्रिंट करने की PDF / दस्तावेज़", "Confirm page range, copies and paper.", "पेज रेंज, कॉपी और पेपर की पुष्टि करें।", true)],
  "colour-print": [doc("print-file", "PDF / image to print", "प्रिंट करने की PDF / फोटो", "Confirm page range, copies and paper type.", "पेज रेंज, कॉपी और पेपर की पुष्टि करें।", true)]
};

export function getServiceDocumentOptions(serviceId: string, selectedCorrections: string[] = []): ServiceDocumentOption[] {
  const all = SERVICE_DOCUMENTS[serviceId] || [
    doc("service-instructions", "Service-specific instructions / supporting documents", "सेवा के निर्देश / सहायक दस्तावेज़", "The exact checklist must be confirmed against the selected official route.", "सटीक सूची चुने गए आधिकारिक माध्यम से सत्यापित होगी।")
  ];
  if (!selectedCorrections.length) return all;
  const selected = new Set(selectedCorrections);
  if (serviceId === "pan-photo-signature") {
    return all.filter((item) => ["existing-pan", "aadhaar", "change-proof"].includes(item.id) ||
      (selected.has("photo") && item.id === "photo") || (selected.has("signature") && item.id === "signature"));
  }
  if (serviceId === "pan-correction") {
    const always = new Set(["existing-pan", "aadhaar"]);
    const relevant = new Set<string>();
    if (selected.has("name")) ["gazette", "passport", "voter-id", "driving-licence", "government-id", "other-proof"].forEach((x) => relevant.add(x));
    if (selected.has("father-name")) ["father-proof", "birth-certificate", "school-certificate", "other-proof"].forEach((x) => relevant.add(x));
    if (selected.has("mother-name")) ["mother-proof", "birth-certificate", "school-certificate", "other-proof"].forEach((x) => relevant.add(x));
    if (selected.has("date-of-birth")) ["birth-certificate", "school-certificate", "passport", "driving-licence", "pension-order", "marriage-certificate", "magistrate-affidavit", "other-proof"].forEach((x) => relevant.add(x));
    if (selected.has("address")) ["passport", "voter-id", "driving-licence", "residence-certificate", "electricity", "water-bill", "phone-bill", "gas-bill", "bank-statement", "post-office", "property-record", "accommodation-letter", "other-proof"].forEach((x) => relevant.add(x));
    if (selected.has("gender") || selected.has("other")) ["government-id", "other-proof"].forEach((x) => relevant.add(x));
    return all.filter((item) => always.has(item.id) || relevant.has(item.id));
  }
  if (serviceId === "voter-correction") {
    const relevant = new Set(["epic"]);
    if (selected.has("address")) relevant.add("address-proof");
    if (selected.has("photo")) relevant.add("photo");
    if (selected.some((x) => x !== "address" && x !== "photo")) relevant.add("correction-proof");
    return all.filter((item) => relevant.has(item.id));
  }
  if (serviceId === "ration-update") {
    const relevant = new Set(["existing-ration"]);
    if (selected.has("add-member") || selected.has("member-correction")) ["member-id", "relationship"].forEach((x) => relevant.add(x));
    if (selected.has("remove-member")) ["relationship", "death-certificate"].forEach((x) => relevant.add(x));
    if (selected.has("address")) relevant.add("address-proof");
    if (selected.has("other")) ["member-id", "relationship", "address-proof"].forEach((x) => relevant.add(x));
    return all.filter((item) => relevant.has(item.id));
  }
  if (serviceId === "certificate-correction") {
    return all;
  }
  return all;
}
