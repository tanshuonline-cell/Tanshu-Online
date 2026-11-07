# Digital Seva Refund Policy Review
**Repository scope:** `feature/digital-seva-booking-system-2026` / Preview only  
**Review date:** 7 November 2026  
**Status:** Research baseline; service-wise fee verification and legal sign-off remain launch gates.

## 1. Core policy decisions

1. Keep Government Fee and TANSHU ONLINE Application/Service Fee as separate line items on every service detail, quote, booking summary and payment screen.
2. Never label every Government Fee as non-refundable by default. Show the official department/provider's current cancellation/refund rule for the exact service route. If not verified, display: "Please confirm the current official portal fee and refund rule before payment" and do not invent a value.
3. Do not apply a blanket "no refund after work starts" clause. Any fee retained must reflect work actually performed and remain subject to applicable consumer law and the agreed service description.
4. If TANSHU ONLINE does not submit an application due to its own technical/system/process failure, assess a refund of the unearned TANSHU service charge and any government amount not paid to the department or recoverable from it.
5. The proposed 7-calendar-day target and 15-calendar-day outer limit are a TANSHU service commitment, not a government processing guarantee. Customer-caused pauses (missing documents/clarification) and government authority processing after successful submission must be recorded separately and explained.
6. Record affirmative, unticked-by-default consent for Terms and Conditions and Refund Policy separately, with policy version and timestamp. Do not treat a pre-ticked checkbox as consent.
7. Keep complaint/grievance handling separate from the voluntary 7–15 day service target. If the E-Commerce Rules apply, acknowledge complaints within 48 hours and redress within one month.
8. Keep this work on the Digital Seva Preview branch. No production merge, production deployment, fee collection, refunds, or D1 migration is authorised by this document.

## 2. Official-source findings (reviewed 7 November 2026)

### Aadhaar / UIDAI
UIDAI's current published charge page lists Aadhaar enrolment as free; demographic update separately at a centre as ₹75; biometric update generally at ₹125, with age/first-update exceptions; and PoI/PoA document update at a centre as ₹75. Online myAadhaar PoI/PoA document update is listed as free until 14 June 2027. UIDAI also lists a ₹40 Aadhaar search/download/colour print service in the referenced centre-charge schedule. These are UIDAI charges, not TANSHU service fees. Check the exact update type, route, age exception and current schedule immediately before quoting.
Official source: https://www.uidai.gov.in/en/aadhaar-seva-kendra

### PAN
The Income Tax Department's PAN page currently describes a charge of ₹91 excluding GST (₹107 including GST) for an Indian communication address on the described application route, and says Instant e-PAN through the Income Tax e-filing portal is free for eligible applicants. Protean's current PAN service pages show different amounts depending on paperless/physical-document mode, whether a physical card is requested, domestic/foreign dispatch, and whether the request is a new/correction/reprint route. Therefore do not hard-code one universal PAN fee. Fetch the current quote from the exact official provider route at the time of application.
Official sources:
- https://www.incometaxindia.gov.in/en/tax-services/apply-for-pan
- https://tinpan.proteantech.in/services/pan/form-form_93-form_94.html
- https://dev.protean-tinpan.com/services/pan/correction.html

### Voter ID / ECI
ECI identifies Form 6 for new registration and Form 8 for correction, shifting residence, replacement EPIC and PwD marking. ECI's FAQ says Form 6 is available free of cost. The reviewed current official pages did not establish a single current fee/refund rule for every Form 8 / replacement EPIC route. Do not show a blanket ₹25 replacement fee or a blanket non-refundable statement without checking the current official route and applicable instruction.
Official sources:
- https://www.eci.gov.in/faq/en/how-to-register/
- https://www.eci.gov.in/faq/2/9
- https://voters.eci.gov.in/

### Bihar RTPS / ServicePlus certificates
The Bihar ServicePlus portal says fees may apply to some services and that applicable fees are paid to the Service Provider Department through the Bihar Finance Department's OGRAS gateway. The portal also describes email/SMS delivery and status updates when valid contact details are supplied. The reviewed portal landing page does not establish one fixed amount or one universal refund rule for all caste, income, residence, NCL, EWS and other certificates. The amount and cancellation/refund terms must be checked for the exact department, service level and application route before payment.
Official source: https://serviceonline.bihar.gov.in/

### Ration card, schemes and other state/department forms
The current service catalogue spans state- and scheme-dependent processes. A universal government fee or refund statement cannot be verified from the catalogue alone. The responsible department's live application page and fee schedule must be checked for the selected state, scheme and route. Where no government fee is charged, display ₹0 only after verifying the exact route; do not infer it from the category name.

### PDF / document / typing services
For services performed solely by TANSHU ONLINE (PDF compression, merge/split, image compression, signature resizing, scan cleanup and typing/formatting), there is ordinarily no government fee for the file-processing work itself. Display Government Fee as "Not applicable" only where the job is solely a private file-processing task. If the output is later submitted to a government portal, any portal fee is a separate charge and must be shown independently.

## 3. Consumer protection and payment handling

### Consumer Protection (E-Commerce) Rules, 2020
The official Rules apply broadly to goods/services bought or sold over digital/electronic networks, subject to the Rules' scope and exceptions. Among other requirements, the Rules require a grievance officer mechanism; acknowledgement of a consumer complaint within 48 hours and redress within one month; affirmative consumer consent (not pre-ticked); and accepted refunds within a reasonable period or the applicable legally prescribed period. Cancellation charges must not be imposed asymmetrically in the manner prohibited by the Rules.
Official Gazette copy: https://consumeraffairs.nic.in/sites/default/files/E%20commerce%20rules_0.pdf

### Failed UPI merchant payments
RBI's failed-transaction framework provides an auto-reversal timeline of T+5 days for a UPI payment to a merchant where the payer is debited but the merchant does not receive confirmation, with compensation for delay beyond the prescribed period. This payment-system reversal is different from a discretionary service refund and must not be replaced by the site's 7–15 day policy.
Official RBI circular: https://rbi.org.in/commonman/Upload/English/Notification/PDFs/CIRCULAR677EC931A7A65E4D99AA957D8E85BC0A2A.PDF

## 4. Recommended customer-facing wording principles

- Show the exact Government Fee, TANSHU ONLINE Service Fee, any taxes/provider charges, and total separately before payment.
- Beside a Government Fee, show one of: "Non-refundable under the official department/provider rule" (only with a verified source for that exact route); "Refund subject to official department/provider rule"; or "Not applicable".
- Beside the TANSHU Service Fee, explain what work it covers. Do not state it is automatically forfeited merely because processing started. Assess the completed portion, service failure, cancellation timing and applicable law.
- Define the 7-day target and 15-day maximum as TANSHU's own service-resolution commitment. Explain when the clock starts, how customer-caused pauses are handled, and what happens if the service is not completed due to TANSHU's own failure.
- Distinguish successful submission/acknowledgement from the government's later approval, rejection or issuance decision. Do not promise approval or government turnaround.
- Make both policy links readable before payment and require separate affirmative checkboxes. Store the policy version and acceptance timestamp.
- Provide a complaint/reference number and a visible support/grievance contact process.

## 5. Service-by-service launch verification register

| Catalogue service(s) | Government fee treatment | Refund verification still required |
|---|---|---|
| pan-new, pan-correction | Route/mode/physical-card dependent; no universal amount | Verify exact Protean/UTIITSL/Instant e-PAN route and cancellation/refund terms |
| aadhaar-address-doc, aadhaar-address-hof, aadhaar-co, aadhaar-mobile, aadhaar-email | UIDAI fee depends on update type, channel, age and current concessions | Verify exact UIDAI-supported route and eligibility before quote |
| aadhaar-lost, aadhaar-download | Do not assume a fee; distinguish free online retrieval/download from any centre print/service charge | Verify exact service channel and any print/provider charge |
| certificate-income, certificate-caste, certificate-residence, certificate-correction | Bihar ServicePlus says fees may apply; OGRAS pays the department | Verify service, CO/SDO/DM level and current OGRAS amount/refund terms |
| voter-new, voter-correction | Form 6 is free; Form 8 route-specific; no blanket fee claim | Verify current ECI instructions for exact request and replacement route |
| ration-new, ration-update | State and route dependent | Verify Bihar department portal and current service-specific fee/refund |
| scheme-check, online-form | Scheme/department dependent; may be free or paid | Verify exact scheme/application portal before displaying a fee |
| pdf-compress, pdf-merge, pdf-split, pdf-jpg, pdf-word, pdf-edit | No government fee for private file-processing itself | Define TANSHU service scope, completion point and fair cancellation/refund terms |
| image-compress, signature-resize, scan-clean, typing-format | No government fee for private file-processing itself | Define TANSHU service scope, completion point and fair cancellation/refund terms |

## 6. Open launch gates (must be completed before accepting payments)

- [ ] Verify the exact fee and cancellation/refund rule for every service route, not just the broad category.
- [ ] Configure fee values with a source URL, checked date, route/mode and last-reviewed date; expire or re-check stale values.
- [ ] Decide and publish the business legal name, business address, customer-care contact and grievance officer contact required for the applicable business model.
- [ ] Finalise a fair service-fee cancellation/refund matrix with Indian consumer-law review.
- [ ] Define the 7-day start event, customer-pause rules, 15-day escalation and refund initiation workflow.
- [ ] Record policy version, affirmative consent and timestamp in the Preview database after the required migration is reviewed and applied.
- [ ] Keep payment gateway integration disabled until the above items and test cases are complete.

## 7. Explicitly out of scope

This review does not authorise a Production change, public policy publication, live payment collection, issuing refunds, applying D1 migrations, or collecting real Aadhaar/PAN/customer documents.