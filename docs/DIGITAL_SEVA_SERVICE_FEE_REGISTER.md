# Digital Seva — Service-wise Fee & Refund Register

**Preview branch:** `feature/digital-seva-booking-system-2026`  
**Review date:** 7 November 2026  
**Purpose:** Customer-facing disclosure and launch control. This is not authority to collect money.

## Rules applied to every service

- Show the Government / Department / Provider fee separately from the TANSHU ONLINE service fee.
- Show taxes and payment-provider charges separately if they apply.
- Do not mark an official fee non-refundable unless the current rule for the exact service and route says so.
- The TANSHU ONLINE service fee is currently **not configured** for every catalogue item. Do not invent or collect a price. A written quote must define the work/deliverable before payment.
- Where the official amount or refund rule is route-dependent or not verified, show a live-quote warning and do not accept payment until the official portal/receipt is checked.
- Source review date is not a guarantee that the amount remains current. Re-check the official portal immediately before quoting.

## Service-wise register

| Service ID | Service | Government fee shown in Preview | Official refund status | TANSHU fee |
|---|---|---|---|---|
| pan-new | New PAN | Route quote required. Income Tax Department describes ₹107 incl. GST for its listed Indian-address route; other providers/modes/card/dispatch differ; eligible Instant e-PAN is free. | Exact provider route rule required | Not configured |
| pan-correction | PAN correction | Live provider quote; depends on paperless/physical mode, card and dispatch | Exact provider rule required | Not configured |
| aadhaar-address-doc | Aadhaar address update with document | UIDAI demographic update ₹75 separately; free with biometric update. Separate PoI/PoA document-only concession is free online until 14 June 2027; do not confuse these services. | Exact transaction/appointment rule; check receipt | Not configured |
| aadhaar-address-hof | Aadhaar HoF address update | ₹75 demographic update when separate; free with biometric update; confirm exact HoF online flow | Exact transaction/appointment rule | Not configured |
| aadhaar-co | Aadhaar C/O address detail | ₹75 demographic address update when separate; free with biometric update; exact route check | Exact transaction/appointment rule | Not configured |
| aadhaar-mobile | Aadhaar mobile update | ₹75 demographic update when separate; free with biometric update; confirm app/centre route | Exact transaction/appointment rule | Not configured |
| aadhaar-email | Aadhaar email update | ₹75 demographic update when separate; free with biometric update. UIDAI app waiver from 1 July–31 December 2026 must be checked for availability. | Exact transaction/appointment rule | Not configured |
| aadhaar-lost | Lost Aadhaar / UID retrieval | Online retrieval: check official flow; optional centre search/print quoted separately | No government fee refund if free; separate centre charge follows its rule | Not configured |
| aadhaar-download | e-Aadhaar download | Official online e-Aadhaar download is free; optional centre search/colour print is separate (UIDAI schedule lists ₹40) | No refund on free download; separate print/service follows its rule | Not configured |
| certificate-income | Income certificate | Bihar ServicePlus / OGRAS live quote; service and CO/SDO/DM level dependent | Department/transaction rule not yet verified | Not configured |
| certificate-caste | Caste certificate | Bihar ServicePlus / OGRAS live quote; service and CO/SDO/DM level dependent | Department/transaction rule not yet verified | Not configured |
| certificate-residence | Residence certificate | Bihar ServicePlus / OGRAS live quote; service and CO/SDO/DM level dependent | Department/transaction rule not yet verified | Not configured |
| certificate-correction | Certificate correction | Issuing-authority live quote; certificate type dependent | Issuing-authority rule not yet verified | Not configured |
| voter-new | New Voter registration | ₹0 for ECI Form 6 new registration | No official fee collected on this route | Not configured |
| voter-correction | Voter correction / replacement | Form 8 request type must be checked. Lost EPIC replacement: ECI FAQ lists ₹25 with police complaint; fee waived for loss beyond elector control (e.g. flood/fire/natural disaster). Do not apply ₹25 to every correction. | Exact Form 8 route required | Not configured |
| ration-new | New ration card | Bihar EPDS / department live quote; verify current route | Department rule not yet verified | Not configured |
| ration-update | Ration member/detail update | Bihar EPDS / department live quote; verify exact change type | Department rule not yet verified | Not configured |
| scheme-check | Scheme eligibility | Identify exact scheme; many may be free, but do not assume | Scheme-specific rule required | Not configured |
| online-form | Online form filling | Exact department/portal live quote | Exact portal rule required | Not configured |
| pdf-compress | PDF compress | Not applicable for private file processing | No government fee for the file work itself | Not configured |
| pdf-merge | PDF merge | Not applicable for private file processing | No government fee for the file work itself | Not configured |
| pdf-split | PDF split | Not applicable for private file processing | No government fee for the file work itself | Not configured |
| pdf-jpg | Photo/JPG to PDF | Not applicable for private file processing | No government fee for the file work itself | Not configured |
| pdf-word | PDF to Word | Not applicable for private file processing | No government fee for the file work itself | Not configured |
| pdf-edit | PDF edit/page organiser | Not applicable for private file processing | No government fee for the file work itself | Not configured |
| image-compress | Image/photo compress | Not applicable for private file processing | No government fee for the file work itself | Not configured |
| signature-resize | Signature resize | Not applicable for private file processing | No government fee for the file work itself | Not configured |
| scan-clean | Document scan/cleanup | Not applicable for private file processing | No government fee for the file work itself | Not configured |
| typing-format | Hindi/English typing & formatting | Not applicable for private typing work | No government fee for the typing work itself | Not configured |

## Official source directory

- UIDAI charges / service rules: https://www.uidai.gov.in/en/aadhaar-seva-kendra
- UIDAI email-app waiver memorandum (1 July–31 December 2026): https://uidai.gov.in/images/OM_dated_18-06-2026.pdf
- UIDAI e-Aadhaar and service information: https://uidai.gov.in/hi/my-aadhaar
- Income Tax Department PAN: https://www.incometaxindia.gov.in/en/tax-services/apply-for-pan
- Protean PAN provider: https://tinpan.proteantech.in/services/pan/form-form_93-form_94.html
- ECI Form 6 / new registration: https://www.eci.gov.in/faq/en/how-to-register/
- ECI FAQ including replacement EPIC: https://www.eci.gov.in/faq/2/9
- Voters' Service Portal: https://voters.eci.gov.in/
- Bihar RTPS / ServicePlus: https://serviceonline.bihar.gov.in/
- Bihar EPDS: https://epds.bihar.gov.in/
- Government scheme directory: https://www.india.gov.in/my-government/schemes

## Consent and audit

Booking requires three separate affirmative actions:
1. Contact permission (existing booking consent).
2. Terms & Conditions acceptance.
3. Refund Policy acceptance.

Terms and Refund checkboxes are unticked by default. The API validates both booleans and exact policy-version identifiers, and stores a separate server timestamp and policy version for each. Admin displays the recorded acceptance versions. Migration `0004_digital_seva_policy_consents.sql` is prepared but **not applied** to D1.

## Launch blockers

- [ ] Set TANSHU ONLINE service prices and define exact deliverables for all 29 services.
- [ ] Verify official fee and refund/cancellation rule for every exact government route, including state, service level, provider, applicant eligibility and payment mode.
- [ ] Add a source URL and last-verified date to any live fee quote; expire/recheck stale quotes.
- [ ] Publish verified legal business name, address, customer-care contact and grievance officer details.
- [ ] Finalise privacy notice, secure document collection, access control, retention/deletion and complaint workflow.
- [ ] Apply migration 0004 to the dedicated Preview D1 only after approval; never to Production.
- [ ] Test unticked consent rejection, accepted-consent persistence, admin audit display, duplicate submissions, email validation and mobile layout.
- [ ] Complete legal review and all Preview tests before enabling Cashfree/live payment.

**Payment collection remains disabled. Production merge/deployment remains unauthorised.**
