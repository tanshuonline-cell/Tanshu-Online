# Digital Seva application form — requirements and source register

This specification applies only to the isolated Digital Seva feature. It does not authorise changes to the homepage, other tools, the customer-facing Terms & Conditions, Refund Policy, production deployment, or any production database.

## Form identity and applicant separation

- Every request has one submitting party type: DIRECT_CUSTOMER, CYBER_CAFE, CSC_CENTER, or INDEPENDENT_AGENT.
- Every request records the actual applicant/customer separately from the person or centre submitting the request.
- For an intermediary, the form asks whether the request is for the operator personally or for another customer before proceeding.
- The submitting party's name, mobile number and email are mandatory.
- For Cyber Cafe and CSC, centre name and full centre address are mandatory.
- For an Agent, agent name/mobile/email are mandatory; agency/business name and address are collected where applicable.
- If the intermediary is applying for themselves, applicant contact details may be copied from the operator profile but remain separately represented in the saved request.
- Direct customers are both submitting party and applicant; no intermediary profile is shown.

## Service-specific data and document checklist

- The form uses the exact service ID selected from the existing catalogue.
- Correction services ask the customer to select the exact fields being corrected. Dependent document options are then shown.
- A document tick means "I have this document available"; it is not an official determination that the document will be accepted.
- Each service checklist includes an "Other supporting document" option and a field to name it.
- Before a live application is submitted, the operator must verify the document against the current official route and the source document's legibility, name, date and other relevant particulars.
- The service schema covers all 35 service IDs in the current catalogue, including PAN Photo/Signature, Website Services and Hindi/English PDF Text Editing.
- The API allowlist must include every current service ID; otherwise a valid catalogue selection can be rejected by the server.

## Official source register (checked 7 November 2026)

### PAN
- Income Tax Department PAN page: https://www.incometaxindia.gov.in/en/pan
- PAN CR-01 individual correction form and guidelines: https://www.incometaxindia.gov.in/documents/d/guest/pan-cr-01-individual
- Order specifying PAN correction forms/procedure from 1 April 2026: https://www.incometaxindia.gov.in/documents/d/guest/order-for-specifying-procedure-for-pan-correction-pdf
- The current individual correction form is PAN CR-01. It includes tick boxes for the exact correction fields, supporting proof categories (identity, address, DOB, other change proof and PAN copy), Aadhaar except exempt categories, mobile/email, father and mother details, and parent-name selection. The form instructions specify PAN copy (or FIR copy if lost), current photo/signature instructions for the paper form, and mandatory mobile/email.
- The Income Tax Department's Rule 158 table distinguishes which documents are PoI, PoA and DOB proof. Aadhaar is not DOB proof in that table. The form must not imply that any one document automatically proves every category.
- Name/father-name change evidence depends on the exact nature of correction and current provider procedure. The checklist must show the document the applicant actually has, then require staff verification; it must not promise acceptance based on an old provider list.

### Aadhaar
- UIDAI current acceptable documents PDF: https://www.uidai.gov.in/images/commdoc/List_of_Supporting_Document_for_Aadhaar_Enrolment_and_Update.pdf
- UIDAI Aadhaar (Enrolment and Update) Regulations, updated 10 May 2026: https://uidai.gov.in/images/Aadhaar_Enrolment_and_Update_First_Amendment_Regulations_2026_pdf.pdf
- UIDAI enrolment/update landing page: https://www.uidai.gov.in/en/enrolment-and-updates
- The current acceptable-documents list separates enrolment from update and separates PoI, PoA, PoR and DOB. A document must be accepted for the specific proof category; the list is not interchangeable.
- The current list includes (among others) voter ID/e-voter ID verifiable online, ration/PDS photo/e-ration card, passport, driving licence, domicile certificate, certain service/pensioner identity cards, school/university records, selected bank/post-office records, and specified bills/agreements. Age, validity and other conditions apply.
- UIDAI states that C/O is part of the address field and is optional; the supporting address document is in the applicant's name and need not contain the name of the person entered in C/O.
- Mobile/email and biometric/photo updates follow different routes from document-based name/address/DOB updates. Do not ask for a proof document where UIDAI says none is required for that selected update.
- For HoF address update, collect the HoF relationship and consent/authentication details required by the current regulations. Do not treat any family member as automatically eligible.

### Election Commission of India
- Form 6: https://voters.eci.gov.in/formspdf/Form_6_English.pdf
- Form 6 guidelines: https://voters.eci.gov.in/guidelines/Form-6_en.pdf
- Form 8: https://voters.eci.gov.in/formspdf/Form_8_English.pdf
- Form 8 guidelines: https://voters.eci.gov.in/guidelines/Form-8_en.pdf
- Form 8 permits correction of up to four particulars and requires self-attested documentary proof supporting the claim. It lists the correction categories and requires a recent unsigned photograph only when a photo change is requested.
- Form 6 uses the specified age-proof and ordinary-residence proof lists; if none of the listed age documents is available, the applicant may need additional declaration/verification. Do not make a generic "any ID works" claim.

### Bihar ServicePlus / RTPS
- Bihar ServicePlus: https://serviceonline.bihar.gov.in/
- Caste certificate RO-level application form: https://serviceonline.bihar.gov.in/renderApplicationForm.do?serviceId=4650013
- Residence certificate RO-level application form: https://serviceonline.bihar.gov.in/renderApplicationForm.do?serviceId=4630012
- Income certificate RO-level service details: https://serviceonline.bihar.gov.in/getServiceDesc.html?StateID=10&backButtonUrl=viewAllServiceList.html&serviceId=4640013
- The live Bihar forms show different checklists for income, caste and residence. Examples include Form-XVII self-affidavit and income records for income; Form-II/III/V affidavits and ancestor revenue records for caste; and Form-XIV affidavit plus residence evidence for residence. Level, general/tatkal route and the current portal form can change the exact checklist.
- For SDO/DM level, the higher-level service may require the lower-level certificate or additional documents. Do not show the RO checklist as universal for every level.
- The form must ask which level/service route is intended where the catalogue fee/service allows CO/SDO/DM choice.

### Other services
- Ration-card new/update requirements must be tied to the live Bihar PDS route and the exact operation (new family, member addition/deletion, correction, address change). Keep "other document" and staff verification until the current department-specific checklist is verified.
- Government scheme eligibility and general online forms are scheme/form-specific; do not show one universal document list.
- PDF, image, typing, website and print services collect only the source files, instructions and project/print details needed for that task.

## Document upload and privacy gate

The existing Terms & Conditions already say sensitive documents must not be collected until the applicable privacy notice, access controls and retention/deletion period are shown. The existing Preview also says not to upload sensitive documents. Do not change either existing policy text without the user's explicit approval.

Therefore:
- Document availability checkboxes and service-specific fields may be previewed.
- Actual sensitive-file transfer must remain disabled until a private R2 bucket/binding, authenticated admin-only retrieval, size/type validation, malware-scanning/operational handling, a clear privacy notice and a user-approved retention/deletion period are configured.
- Never store uploaded identity documents in public assets or expose permanent public URLs.
- Never collect OTPs, passwords, PINs or full Aadhaar/PAN numbers in the form.
- The Preview must clearly state when upload is not enabled; never imply that a file has been securely received if it has not.

## Data integrity and rollout gates

- Preserve the current page's visual design and typography.
- Preserve the existing Terms & Conditions and Refund Policy components and their version/audit handling.
- Save operator and applicant identities separately, plus the selected service, correction selections and selected-document checklist.
- Validate all required data again on the server; browser validation alone is insufficient.
- Extend the dedicated Preview D1 only through a prepared migration. Do not apply it to any database without explicit approval.
- Keep PR #15 draft, do not merge, and do not deploy Production without explicit approval.
