# TANSHU ONLINE — Digital Public Tools & Citizen Services Portal

TANSHU ONLINE is a modern, responsive, and privacy-first digital platform built from scratch for cyber cafes, Common Service Centers (CSC / VLEs), students, and citizens across India.

It integrates high-precision client-side document processing, biometric photo generation, CR80 plastic card print layouts, an interactive GST invoice generator, verified Indian government service application walkthroughs, public welfare schemes guides, and video masterclasses.

---

## 🚀 Key Highlights & Architectural Features

1. **100% Client-Side In-Browser Privacy**:
   - All photo cropping, biometric retouching, CR80 ID formatting, and PDF generating tools process image canvases purely on the user's local device.
   - Sensitive citizen records, Aadhaar numbers, and portrait photographs are **never** transmitted to or stored on any remote cloud database.

2. **Hardware-Calibrated Print Presets**:
   - Calibrated for Epson L805 / L850, Canon Pixma, and standard desktop color printers.
   - Exact millimeter measurements: Standard CR80 ISO ID size (85.60 × 53.98 mm), 4×6 inch photo paper (8 photos), A4 paper (32 photos / 5 batch ID cards), and Indian legal non-judicial stamp papers (3.5" top clearance).

3. **Confirmed Production Tool Directory (Phase 1)**:
   - Includes exactly the **18 confirmed tools**:
     1. Passport Size Photo Maker
     2. Auto Document Cropper
     3. Document Scanner & Image Rectifier
     4. PDF to PVC Card Auto Cropper
     5. ID Card Front-Back Print Layout Maker
     6. Invoice Generator (GST & Non-GST with dynamic UPI QR payment)
     7. New Ration Card (State PDS portals directory & eligibility guide)
     8. Perspective Correction Tool (Interactive 4-point quad warping)
     9. AI Selfie Passport Photo Maker
     10. WhatsApp Photo Print & Alignment
     11. AI Face Cleaner (Compliant biometric shadow & lighting tuner)
     12. Watermark Remover (Stamp & background bleed isolator)
     13. Govt ID Card Print (Aadhaar, PAN, Voter, Driving License presets)
     14. PVC Cover Print (Thermal pouch sleeve insert generator)
     15. PIN Code Finder (Interactive Postal Circles search engine)
     16. Multiple ID Cards Print (Batch A4 multi-card paper saver)
     17. Affidavit Print Maker (Standard E-Stamp margin clearance formatter)
     18. PDF Page Organizer (Visual reorder, rotation & deletion)
   - *Roadmap Notice*: Represents Phase 1 of the planned 114-tool ecosystem. The remaining 96 tools will be introduced in subsequent roadmap releases without misleading placeholders.

4. **Public Service & Schemes Directory**:
   - Step-by-step verified procedures, eligibility criteria, required document checklists, statutory fees, and direct official portal redirects (`.gov.in` / `.nic.in`) for:
     - Aadhaar Services (myAadhaar UIDAI)
     - PAN Card Services (Protean / UTIITSL / e-Filing)
     - Voter ID Registration & Correction (ECI Voters Portal)
     - Driving License & Vehicle RC (Sarathi Parivahan)
     - Passport Seva Online Portal (MEA)
     - State e-District & Revenue Certificates
     - PM-KISAN, Ayushman Bharat PM-JAY, PMAY, PM Vishwakarma, e-Shram, and Sukanya Samriddhi Yojana.

5. **Legal & Transparency Statement**:
   - TANSHU ONLINE is an independent digital tool and public reference portal. It is **not** affiliated with, authorized by, or endorsed by UIDAI, the Election Commission of India, or any government ministry.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons
- **PDF Generation**: jsPDF (with high-res 300 DPI canvas rendering)
- **Backend Architecture**: Node.js, Express, Vite dev middleware (`server.ts`)
- **Typography**: Plus Jakarta Sans, JetBrains Mono

---

## 💻 Local Setup & Development Instructions

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 2. Installation
Clone the repository and install all project dependencies:
```bash
npm install
```

### 3. Running Development Server
Start the development server with hot reload:
```bash
npm run dev
```
The application will be accessible at: `http://localhost:3000`

### 4. Compiling & Production Build
To create an optimized production build:
```bash
npm run build
```
To run the production server:
```bash
npm start
```

---

## 🔐 Configuration & External Services

- **Payment Processing**: The Invoice Generator automatically renders universal Indian UPI QR codes (`upi://pay?pa=...`) for instant contactless customer checkout. To connect direct payment gateways (e.g. Razorpay, Cashfree, or PhonePe PG), add your API keys to `.env`.
- **Government Portals**: All government service links direct users safely to verified `.gov.in` domains with explicit external navigation indicators.
