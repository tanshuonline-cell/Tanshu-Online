import { CONFIRMED_TOOLS } from '../data/toolsData';
import { GOVERNMENT_SERVICES } from '../data/servicesData';
import { GOVERNMENT_SCHEMES } from '../data/schemesData';
import { LATEST_VIDEOS } from '../data/videosData';
import { ToolItem, GovernmentService, GovernmentScheme, VideoGuide } from '../types';

export interface SearchResultItem {
  id: string;
  type: 'tool' | 'service' | 'scheme' | 'video';
  typeLabelEn: string;
  typeLabelHi: string;
  title: string;
  hindiTitle?: string;
  subtitle: string;
  jurisdiction?: 'central' | 'bihar';
  tags: string[];
  rawItem: ToolItem | GovernmentService | GovernmentScheme | VideoGuide;
  originalData?: ToolItem | GovernmentService | GovernmentScheme | VideoGuide;
  score?: number;
}

// Bidirectional synonyms & transliterations dictionary
const BIDIRECTIONAL_MAP: Record<string, string[]> = {
  // Voter
  'voter': ['voter', 'epic', 'matdata', 'मतदाता', 'पहचान पत्र', 'वोटर', 'वोटर कार्ड', 'nvsp', 'eci', 'election'],
  'वोटर': ['voter', 'epic', 'matdata', 'मतदाता', 'पहचान पत्र', 'वोटर कार्ड'],
  'मतदाता': ['voter', 'epic', 'matdata', 'पहचान पत्र', 'वोटर'],
  'sudhar': ['correction', 'update', 'सुधार', 'बदलाव', 'change'],
  'सुधार': ['correction', 'update', 'sudhar', 'बदलाव', 'change'],
  'badalna': ['update', 'change', 'sudhar', 'सुधार', 'बदलना', 'correction'],
  'बदलना': ['update', 'change', 'sudhar', 'सुधार', 'badalna'],
  
  // Aadhaar
  'aadhaar': ['aadhaar', 'aadhar', 'adhar', 'uidai', 'आधार', 'आधार कार्ड', 'पहचान'],
  'aadhar': ['aadhaar', 'uidai', 'आधार', 'आधार कार्ड'],
  'आधार': ['aadhaar', 'aadhar', 'adhar', 'uidai', 'आधार कार्ड'],
  'address': ['address', 'पता', 'एड्रेस', 'niwas', 'residence'],
  'एड्रेस': ['address', 'पता', 'address update'],
  'पता': ['address', 'एड्रेस', 'residence'],
  'update': ['update', 'अपडेट', 'sudhar', 'सुधार', 'correction', 'change'],
  'अपडेट': ['update', 'सुधार', 'sudhar', 'correction'],

  // PAN
  'pan': ['pan', 'pancard', 'पैन', 'पैन कार्ड', 'nsdl', 'utiitsl', 'income tax'],
  'पैन': ['pan', 'pancard', 'पैन कार्ड', 'nsdl', 'utiitsl'],
  'पैनकार्ड': ['pan', 'pancard', 'पैन'],

  // Card
  'card': ['card', 'कार्ड', 'patra', 'पत्र'],
  'कार्ड': ['card'],

  // Certificate / Praman Patra
  'certificate': ['certificate', 'प्रमाण पत्र', 'praman patra', 'patra'],
  'प्रमाण': ['certificate', 'praman', 'patra'],
  'पत्र': ['certificate', 'patra', 'card'],

  // Caste / Jati
  'caste': ['caste', 'jati', 'jaati', 'जाति', 'जाति प्रमाण पत्र', 'rtps', 'obc', 'ebc', 'sc', 'st'],
  'jati': ['caste', 'jaati', 'जाति', 'जाति प्रमाण पत्र'],
  'jaati': ['caste', 'jati', 'जाति', 'जाति प्रमाण पत्र'],
  'जाति': ['caste', 'jati', 'jaati', 'जाति प्रमाण पत्र', 'rtps'],

  // Income / Aay
  'income': ['income', 'aay', 'आय', 'आय प्रमाण पत्र', 'salary'],
  'aay': ['income', 'आय', 'आय प्रमाण पत्र'],
  'आय': ['income', 'aay', 'आय प्रमाण पत्र', 'rtps'],

  // Residence / Niwas
  'residence': ['residence', 'domicile', 'niwas', 'aawasiye', 'निवास', 'निवास प्रमाण पत्र', 'आवासीय'],
  'niwas': ['residence', 'domicile', 'निवास', 'आवासीय', 'निवास प्रमाण पत्र'],
  'domicile': ['residence', 'niwas', 'निवास', 'आवासीय'],
  'निवास': ['residence', 'domicile', 'niwas', 'आवासीय', 'निवास प्रमाण पत्र', 'rtps'],
  'आवासीय': ['residence', 'niwas', 'निवास', 'domicile'],

  // Land & Mutation
  'mutation': ['mutation', 'dakhil', 'kharij', 'दाखिल खारिज', 'दाखिल', 'bihar bhumi', 'land', 'जमीन'],
  'dakhil': ['mutation', 'dakhil kharij', 'दाखिल खारिज', 'दाखिल'],
  'kharij': ['mutation', 'dakhil kharij', 'दाखिल खारिज'],
  'दाखिल': ['mutation', 'dakhil kharij', 'दाखिल खारिज', 'bihar bhumi'],
  'खारिज': ['mutation', 'dakhil kharij', 'दाखिल खारिज'],
  'jamabandi': ['jamabandi', 'khatian', 'khata', 'जमाबंदी', 'खतियान', 'खाता', 'खेसरा', 'bihar bhumi'],
  'जमाबंदी': ['jamabandi', 'khatian', 'khata', 'bihar bhumi'],
  'lpc': ['lpc', 'land possession', 'भू स्वामित्व', 'एलपीसी'],
  'एलपीसी': ['lpc', 'land possession', 'भू स्वामित्व'],
  'जमीन': ['land', 'bhumi', 'भूमि', 'mutation', 'jamabandi'],

  // Ration
  'ration': ['ration', 'rashan', 'राशन', 'राशन कार्ड', 'खाद्य', 'epds'],
  'rashan': ['ration', 'राशन', 'राशन कार्ड', 'epds'],
  'राशन': ['ration', 'rashan', 'राशन कार्ड', 'epds', 'खाद्य'],

  // Driving / Transport
  'driving': ['driving', 'license', 'dl', 'parivahan', 'ड्राइविंग', 'लाइसेंस', 'sarathi'],
  'license': ['driving', 'dl', 'लाइसेंस', 'parivahan', 'ड्राइविंग लाइसेंस'],
  'ड्राइविंग': ['driving', 'license', 'dl', 'parivahan', 'ड्राइविंग लाइसेंस'],
  'लाइसेंस': ['driving', 'license', 'dl', 'parivahan'],

  // Passport
  'passport': ['passport', 'पासपोर्ट', 'passport seva', 'tatkal'],
  'पासपोर्ट': ['passport', 'passport seva'],

  // Kisan
  'kisan': ['kisan', 'farmer', 'किसान', 'pm kisan', 'agriculture', 'krishi'],
  'किसान': ['kisan', 'farmer', 'pm kisan', 'agriculture', 'krishi'],
  'farmer': ['kisan', 'किसान', 'agriculture'],
  'diesel': ['diesel', 'डीजल', 'anudan', 'अनुदान', 'subsidy'],
  'डीजल': ['diesel', 'anudan', 'अनुदान'],
  'अनुदान': ['subsidy', 'anudan', 'diesel', 'krishi'],

  // Health / Ayushman
  'ayushman': ['ayushman', 'pmjay', 'golden card', 'आयुष्मान', 'आयुष्मान भारत', 'health', '5 lakh'],
  'आयुष्मान': ['ayushman', 'pmjay', 'golden card', 'आयुष्मान भारत', 'स्वास्थ्य'],

  // Housing / Awas
  'awas': ['awas', 'housing', 'आवास', 'pm awas', 'ghar', 'makan'],
  'आवास': ['awas', 'housing', 'pm awas', 'घर', 'मकान'],

  // Vishwakarma
  'vishwakarma': ['vishwakarma', 'विश्वकर्मा', 'artisan', 'karigar', 'toolkit'],
  'विश्वकर्मा': ['vishwakarma', 'artisan', 'karigar'],

  // E-Shram
  'eshram': ['eshram', 'e-shram', 'ई श्रम', 'ई-श्रम', 'shramik', 'मजदूर', 'worker'],
  'श्रम': ['eshram', 'e-shram', 'ई श्रम', 'shramik'],

  // Sukanya
  'sukanya': ['sukanya', 'samriddhi', 'सुकन्या', 'सुकन्या समृद्धि', 'बेटी', 'girl'],
  'सुकन्या': ['sukanya', 'samriddhi', 'सुकन्या समृद्धि'],

  // Bihar Schemes
  'udyami': ['udyami', 'उद्यमी', 'उद्यमी योजना', '10 lakh', 'industry', 'उद्योग'],
  'उद्यमी': ['udyami', 'उद्यमी योजना', '10 lakh loan', 'industry'],
  'credit': ['credit card', 'क्रेडिट कार्ड', 'student', 'शिक्षा लोन', 'bscc'],
  'क्रेडिट': ['credit card', 'student credit card', 'bscc'],
  'kanya': ['kanya', 'कन्या', 'utthan', 'उत्थान', 'कन्या उत्थान', 'scholarship'],
  'कन्या': ['kanya', 'utthan', 'कन्या उत्थान', 'scholarship'],

  // Photo & Print
  'photo': ['photo', 'passport photo', 'फोटो', 'picture', 'image'],
  'फोटो': ['photo', 'passport photo'],
  'pdf': ['pdf', 'पीडीएफ', 'compress', 'merge', 'convert'],
  'पीडीएफ': ['pdf', 'compress'],
  'pvc': ['pvc', 'card', 'पीवीसी', 'id card', 'print', 'कार्ड'],
  'पीवीसी': ['pvc', 'id card', 'card print'],
  'invoice': ['invoice', 'bill', 'बिल', 'इनवॉइस', 'receipt'],
  'बिल': ['invoice', 'bill', 'receipt'],
  'typing': ['typing', 'hindi typing', 'टाइपिंग', 'हिंदी टाइपिंग', 'unicode', 'kruti dev'],
  'टाइपिंग': ['typing', 'hindi typing']
};

function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build index once in memory
function buildSearchIndex(): SearchResultItem[] {
  const index: SearchResultItem[] = [];

  // 1. All 89 Tools
  CONFIRMED_TOOLS.forEach((tool) => {
    index.push({
      id: tool.id,
      type: 'tool',
      typeLabelEn: 'Tool',
      typeLabelHi: 'डिजिटल टूल',
      title: tool.name,
      subtitle: tool.description,
      tags: [
        tool.category,
        tool.categoryLabel,
        ...tool.keyFeatures,
        'tool',
        'टूल'
      ],
      rawItem: tool
    });
  });

  // 2. All 18 Government Services (Central + Bihar)
  GOVERNMENT_SERVICES.forEach((srv) => {
    // Add targeted bilingual keywords for services
    const extraKeywords: string[] = [];
    if (srv.id === 'voter-services') {
      extraKeywords.push('voter', 'voter id', 'वोटर', 'वोटर कार्ड', 'मतदाता पहचान पत्र', 'epic', 'voter card sudhar', 'वोटर कार्ड सुधार');
    } else if (srv.id === 'aadhaar-services') {
      extraKeywords.push('aadhaar', 'aadhar', 'आधार', 'आधार कार्ड', 'address update', 'एड्रेस अपडेट', 'आधार एड्रेस अपडेट', 'aadhar address badalna');
    } else if (srv.id === 'pan-card-services') {
      extraKeywords.push('pan', 'pan card', 'पैन', 'पैन कार्ड', 'nsdl', 'utiitsl', 'income tax');
    } else if (srv.id === 'rtps-caste-certificate') {
      extraKeywords.push('caste', 'caste certificate', 'jati', 'jaati', 'जाति', 'जाति प्रमाण पत्र', 'jaati certificate');
    } else if (srv.id === 'rtps-income-certificate') {
      extraKeywords.push('income', 'income certificate', 'aay', 'आय', 'आय प्रमाण पत्र', 'aay certificate');
    } else if (srv.id === 'rtps-residence-certificate') {
      extraKeywords.push('residence', 'domicile', 'niwas', 'निवास', 'निवास प्रमाण पत्र', 'aawasiye', 'niwas certificate');
    } else if (srv.id === 'bihar-bhumi-mutation') {
      extraKeywords.push('mutation', 'dakhil kharij', 'दाखिल खारिज', 'दाखिल', 'bihar bhumi', 'land');
    } else if (srv.id === 'bihar-bhumi-jamabandi') {
      extraKeywords.push('jamabandi', 'जमाबंदी', 'khatian', 'khata', 'खाता खेसरा');
    } else if (srv.id === 'bihar-epds-ration-card') {
      extraKeywords.push('ration', 'ration card', 'rashan', 'राशन', 'राशन कार्ड', 'epds');
    } else if (srv.id === 'parivahan-services') {
      extraKeywords.push('driving', 'driving license', 'dl', 'लाइसेंस', 'ड्राइविंग लाइसेंस', 'parivahan');
    } else if (srv.id === 'passport-seva') {
      extraKeywords.push('passport', 'पासपोर्ट', 'passport seva');
    }

    index.push({
      id: srv.id,
      type: 'service',
      typeLabelEn: srv.jurisdiction === 'bihar' ? 'Bihar Service' : 'Central Service',
      typeLabelHi: srv.jurisdiction === 'bihar' ? 'बिहार सेवा' : 'केंद्रीय सेवा',
      title: srv.title,
      subtitle: srv.summary,
      jurisdiction: srv.jurisdiction || 'central',
      tags: [
        srv.category,
        srv.officialPortalName,
        srv.jurisdiction === 'bihar' ? 'bihar' : 'central',
        srv.jurisdiction === 'bihar' ? 'बिहार' : 'केंद्र',
        'service',
        'सरकारी सेवा',
        ...srv.eligibility,
        ...srv.requiredDocuments,
        ...extraKeywords
      ],
      rawItem: srv
    });
  });

  // 3. All 11 Government Schemes (Central + Bihar)
  GOVERNMENT_SCHEMES.forEach((sch) => {
    const extraKeywords: string[] = [];
    if (sch.id === 'pm-kisan') {
      extraKeywords.push('pm kisan', 'kisan', 'किसान', 'पीएम किसान', 'kisan samman nidhi', '6000');
    } else if (sch.id === 'ayushman-bharat') {
      extraKeywords.push('ayushman', 'pmjay', 'आयुष्मान', 'आयुष्मान भारत', 'golden card', '5 lakh treatment');
    } else if (sch.id === 'pm-awas-yojana') {
      extraKeywords.push('pm awas', 'awas', 'आवास', 'पीएम आवास', 'housing', 'makan');
    } else if (sch.id === 'pm-vishwakarma') {
      extraKeywords.push('pm vishwakarma', 'vishwakarma', 'विश्वकर्मा', 'karigar', 'artisan', 'toolkit');
    } else if (sch.id === 'e-shram-card') {
      extraKeywords.push('e shram', 'eshram', 'ई श्रम', 'ई-श्रम', 'shramik card');
    } else if (sch.id === 'sukanya-samriddhi') {
      extraKeywords.push('sukanya', 'sukanya samriddhi', 'सुकन्या', 'सुकन्या समृद्धि', 'girl child');
    } else if (sch.id === 'mukhyamantri-udyami-yojana') {
      extraKeywords.push('udyami', 'mukhyamantri udyami', 'उद्यमी', 'उद्यमी योजना', '10 lakh loan', 'subsidy');
    } else if (sch.id === 'bihar-student-credit-card-yojana') {
      extraKeywords.push('student credit card', 'bscc', 'स्टूडेंट क्रेडिट कार्ड', 'education loan');
    } else if (sch.id === 'mukhyamantri-kanya-utthan-yojana') {
      extraKeywords.push('kanya utthan', 'कन्या उत्थान', 'graduate kanya', '50000 scholarship');
    }

    index.push({
      id: sch.id,
      type: 'scheme',
      typeLabelEn: sch.jurisdiction === 'bihar' ? 'Bihar Scheme' : 'Central Scheme',
      typeLabelHi: sch.jurisdiction === 'bihar' ? 'बिहार योजना' : 'केंद्रीय योजना',
      title: sch.name,
      hindiTitle: sch.hindiName,
      subtitle: sch.financialBenefit,
      jurisdiction: sch.jurisdiction || 'central',
      tags: [
        sch.ministry,
        sch.targetBeneficiaries,
        sch.jurisdiction === 'bihar' ? 'bihar' : 'central',
        sch.jurisdiction === 'bihar' ? 'बिहार' : 'केंद्र',
        'scheme',
        'योजना',
        'subsidy',
        'सब्सिडी',
        sch.financialBenefit,
        ...extraKeywords
      ],
      rawItem: sch
    });
  });

  // 4. Video Guides
  LATEST_VIDEOS.forEach((vid) => {
    index.push({
      id: vid.id,
      type: 'video',
      typeLabelEn: 'Video Guide',
      typeLabelHi: 'वीडियो ट्यूटोरियल',
      title: vid.title,
      subtitle: vid.description,
      tags: [
        vid.category,
        vid.instructor,
        ...vid.topics,
        'video',
        'tutorial',
        'वीडियो',
        'गाइड'
      ],
      rawItem: vid
    });
  });

  return index;
}

const SEARCH_INDEX = buildSearchIndex();

// Expand query terms using bidirectional dictionary
function expandQueryTerms(rawQuery: string): string[] {
  const normalized = normalizeText(rawQuery);
  const terms = normalized.split(' ').filter(Boolean);
  const expanded = new Set<string>(terms);

  terms.forEach((term) => {
    // Exact word synonym match
    if (BIDIRECTIONAL_MAP[term]) {
      BIDIRECTIONAL_MAP[term].forEach((syn) => expanded.add(normalizeText(syn)));
    }
    // Prefix / substring match
    Object.keys(BIDIRECTIONAL_MAP).forEach((key) => {
      if (term.includes(key) || key.includes(term)) {
        BIDIRECTIONAL_MAP[key].forEach((syn) => expanded.add(normalizeText(syn)));
      }
    });
  });

  return Array.from(expanded);
}

export function searchUniversal(query: string, maxResults: number = 8): SearchResultItem[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const cleanQuery = normalizeText(query);
  const expandedTokens = expandQueryTerms(cleanQuery);
  const rawTokens = cleanQuery.split(' ').filter(Boolean);

  const scoredResults: SearchResultItem[] = [];

  for (const item of SEARCH_INDEX) {
    let score = 0;
    const titleNorm = normalizeText(item.title);
    const hindiTitleNorm = item.hindiTitle ? normalizeText(item.hindiTitle) : '';
    const subtitleNorm = normalizeText(item.subtitle);
    const tagsCombined = normalizeText(item.tags.join(' '));

    // 1. Exact phrase match
    if (titleNorm === cleanQuery || hindiTitleNorm === cleanQuery) {
      score += 150;
    } else if (titleNorm.startsWith(cleanQuery) || hindiTitleNorm.startsWith(cleanQuery)) {
      score += 100;
    } else if (titleNorm.includes(cleanQuery) || (hindiTitleNorm && hindiTitleNorm.includes(cleanQuery))) {
      score += 80;
    } else if (tagsCombined.includes(cleanQuery)) {
      score += 70;
    }

    // 2. Token matching for original query tokens
    for (const token of rawTokens) {
      if (titleNorm.includes(token)) score += 40;
      else if (hindiTitleNorm.includes(token)) score += 40;
      else if (tagsCombined.includes(token)) score += 25;
      else if (subtitleNorm.includes(token)) score += 12;
    }

    // 3. Synonym / Expanded tokens matching
    for (const syn of expandedTokens) {
      if (!rawTokens.includes(syn)) {
        if (titleNorm.includes(syn) || hindiTitleNorm.includes(syn)) score += 30;
        else if (tagsCombined.includes(syn)) score += 20;
        else if (subtitleNorm.includes(syn)) score += 8;
      }
    }

    // High relevance boost for official public services matching citizen core intents
    if (
      cleanQuery.includes('voter') || cleanQuery.includes('वोटर') || cleanQuery.includes('matdata') ||
      cleanQuery.includes('aadhaar') || cleanQuery.includes('aadhar') || cleanQuery.includes('आधार') ||
      cleanQuery.includes('pan') || cleanQuery.includes('पैन') ||
      cleanQuery.includes('caste') || cleanQuery.includes('jati') || cleanQuery.includes('जाति') ||
      cleanQuery.includes('income') || cleanQuery.includes('aay') || cleanQuery.includes('आय') ||
      cleanQuery.includes('niwas') || cleanQuery.includes('निवास') || cleanQuery.includes('residence') ||
      cleanQuery.includes('kisan') || cleanQuery.includes('किसान') ||
      cleanQuery.includes('dakhil') || cleanQuery.includes('दाखिल') ||
      cleanQuery.includes('ration') || cleanQuery.includes('राशन')
    ) {
      if (item.type === 'service' || item.type === 'scheme') {
        score += 25;
      }
    }

    if (score > 20) {
      scoredResults.push({
        ...item,
        score
      });
    }
  }

  // Sort descending by relevance score
  scoredResults.sort((a, b) => (b.score || 0) - (a.score || 0));

  return scoredResults.slice(0, maxResults);
}
