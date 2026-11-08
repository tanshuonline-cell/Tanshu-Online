# PVC Card Studio — Development Workspace

> Status: development / preview only. Not production-ready. Do not merge into `main` or expose as an official service until the release checklist is approved.

## Scope boundary

This workspace is limited to `public/id-pvc-studio/` and PVC Studio-specific assets/configuration. Do not modify the Digital Seva Center, site homepage, navigation, unrelated services, authentication, or other site features as part of this project.

Current branch: `feature/pvc-studio-precision-only-2026-11-09`

Preview entry point:
- `/id-pvc-studio/premium-desktop-preview.html`

## Product goal

Prepare a complete desktop-first PVC card editing and A4 print-preparation workspace. The current work is a prototype foundation; features listed below must not be described as production-verified until their acceptance tests pass.

## Feature inventory and readiness

| Area | Intended capability | Current status |
|---|---|---|
| Document library | 20 India Catalog entries across identity/government, health/welfare, labour/agriculture/property, education/other | Catalog list and profile selection implemented; non-verified dimensions remain editable / indicative |
| Import | JPG, PNG, WEBP and PDF; multiple files/pages | Basic browser upload and PDF.js page rasterization present |
| Crop | Detect card quadrilateral, perspective correction, manual crop fallback | OpenCV prototype present; needs diverse-photo testing and failure handling |
| OCR | English + Hindi text extraction and document hints | Tesseract prototype present; OCR quality and language asset loading need testing |
| Front/back | Suggest side, let operator override, pair front/back | Keyword heuristic + manual side/pair controls; not reliable classification yet |
| A4 layout | Exact mm positions, copies, gap, portrait/landscape, multiple sheets | Copy-count auto-arrange and basic A4 pagination added; mixed-size and duplex alignment still need validation |
| Editing | Select, drag, duplicate, zoom, shift, fit/cover, remove | Basic controls present; usability and bounds checks pending |\n| Print options | Copies (mouse wheel), gap in mm, original / 3 mm rounded corners, orientation, optional mirror | Controls added; physical printer and corner-cut accuracy not certified |\n| Language | English / हिंदी switch | Main labels switch; full translation review still required |
| Print | A4 output, no scaling, calibration line | Prototype present; browser print and physical printer verification pending |
| Privacy | Local browser processing; no document upload to server | Intended architecture; verify all dependencies and network behavior |
| Mobile | Separate future implementation | Explicitly out of current desktop scope |

## Engineering principles

1. Keep all PVC Studio code under this directory unless a narrowly scoped shared change is separately reviewed and approved.
2. Do not add dependencies to the main application just to support the prototype.
3. Prefer browser-local processing for identity documents. Do not send user documents to third-party OCR or image APIs.
4. Treat OCR and front/back detection as suggestions. Always provide operator confirmation and manual override.
5. Never assume every issuer's card is ID-1 size. Store dimensions as editable profiles with source, version, and verification status.
6. Keep print geometry in millimetres. Convert to CSS pixels only for on-screen preview; print with physical mm units.
7. Do not auto-crop destructively. Preserve original source and allow reset/re-crop.
8. Pair front/back by an explicit pair ID, not by upload order or alternating position.
9. Keep preview and production release separate. A successful build is not a physical print certification.

## Required technical setup

- Standalone entry page: `premium-desktop-preview.html`
- PVC processing engine: `pvc-engine.js`
- India catalog and sheet settings extension: `catalog-settings.js`
- PDF rendering: PDF.js (pin a tested version; handle CDN/offline failure)
- Image processing: OpenCV.js (wait for runtime initialization; show recoverable error)
- OCR: Tesseract.js with Hindi and English language assets (pin versions and verify language loading)
- Print stylesheet: dedicated A4 pages with mm units, explicit page breaks, no UI chrome
- Test fixtures: synthetic/sample documents only; never commit real Aadhaar/PAN or other personal identity data

## Acceptance checklist before calling the setup complete

### A. Browser and import
- [ ] Preview URL opens the PVC Studio page, not the website homepage.
- [ ] JPG/PNG/WEBP single and multiple uploads work.
- [ ] Multi-page PDF imports every page in order.
- [ ] Missing CDN/network dependency produces a visible recoverable message.
- [ ] Large images/PDFs do not freeze the tab; progress and cancellation are available.

### B. Crop and OCR
- [ ] Card edge detection tested on clean scan, angled photo, shadows, busy background, low contrast, rotated image, and no-card image.
- [ ] Perspective correction preserves all four corners and correct orientation.
- [ ] Failed detection never silently crops the wrong region.
- [ ] OCR Hindi and English language packs load successfully.
- [ ] Document type is shown as a suggestion with confidence/evidence; operator can override.
- [ ] Front/back suggestion tested on representative synthetic fixtures; operator can override.
- [ ] Original image can be restored after crop.

### C. Pairing and layout
- [ ] Explicitly pair front and back images for each card.
- [ ] Unpaired sides are flagged before duplex export.
- [ ] Mixed card sizes are laid out independently, not using the first card's size for all.
- [ ] A4 margins, gaps, row/column count and overflow are calculated in mm.
- [ ] Additional pages are created without overlap or clipping.
- [ ] Duplex back-side alignment/mirroring behavior is configurable and tested for the selected printer.

### D. Print scale
- [ ] Print page uses A4 210 × 297 mm CSS physical dimensions.
- [ ] Print dialog instructions specify A4, 100% / Actual size, and disable Fit to page.
- [ ] Calibration line measures 100.0 mm on paper (record actual measured result and printer model).
- [ ] A known-size test card is measured on paper in both axes.
- [ ] Front/back registration is measured physically; acceptable tolerance is documented.
- [ ] Browser print preview and at least one real printer are tested.

### E. Release safety
- [ ] No changes outside PVC Studio scope.
- [ ] No real identity documents or personal data in repository/test fixtures.
- [ ] Dependency versions, licenses, network requirements and offline behavior documented.
- [ ] Keyboard/mouse workflow, errors and accessibility reviewed.
- [ ] Build/lint/browser test evidence recorded.
- [ ] Explicit user approval before any merge to main or public launch.

## Print calibration procedure

1. Print the calibration sheet on A4 with Scale = 100% / Actual size.
2. Disable Fit/Shrink to printable area and browser headers/footers.
3. Measure the 100 mm line with a reliable ruler/caliper and record the result.
4. Measure a test rectangle in both width and height.
5. Repeat for front/back registration and record printer driver settings.
6. Do not compensate by silently distorting card images; document printer-specific offsets separately.

## Known prototype limitations

- OCR document/side detection is heuristic and can produce false positives.
- OpenCV quadrilateral detection is not yet robust against all lighting, glare, shadows, rotation and background conditions.
- Current layout logic needs validation for mixed dimensions, explicit front/back pairing, multi-page duplex output and page overflow.
- A calibration graphic alone does not prove actual-size printing.
- Current prototype has not yet passed browser end-to-end tests or a physical printer test.\n- The new India Catalog and print controls are code-level additions only; the complete UI translation, mixed-size packing, duplex back-side registration, and physical corner cutting still require testing.

## Development log

Record each change here with date, commit, files touched, tests run, and known limitations. Keep commits PVC-only.


## 2026-11-09 implementation update

- Rebuilt the standalone preview so it loads the catalog and engine as separate PVC-only scripts; removed the previous competing inline editor implementation.
- Replaced the engine's cross-script lexical-variable assumptions with an explicit `window.PVC_STUDIO_STATE` API.
- Added English/Hindi catalog labels, profile search, editable dimensions, PDF page rasterization, image import, manual front/back pairing, OCR hints, optional edge-based crop, crop reset, copies, mm gap, orientation, corner style and back-side mirroring.
- Reworked A4 packing to place mixed-size card groups using millimetre measurements and to keep each explicit front/back pair at the same sheet coordinates. Each requested copy gets a distinct pair ID.
- Added print sheets with separate front/back pages and a 100 mm calibration line.
- JavaScript syntax validation passed for `catalog-settings.js` and `pvc-engine.js` after the update.

### Validation still outstanding — do not mark complete

- No real browser end-to-end run has been completed in this environment. PDF import, OpenCV initialization/crop, Tesseract Hindi+English OCR, print preview, duplex ordering and mixed-size overflow remain pending browser verification.
- No printer model is connected here. The 100 mm line, card dimensions, printer feed direction, duplex flip edge and front/back registration must be measured on the user's actual printer.
- Auto-crop is a best-effort edge detector; it must be reviewed manually. OCR only produces suggestions. The original uploaded image is retained in page memory and can be restored with Reset crop.
- The preview must remain development-only. Do not merge to `main` or deploy publicly without explicit approval.


## 2026-11-09 — Original-page crop workflow implementation

### Implemented in the development branch

- Replaced the previous direct-to-card upload interface with a staged workflow: original document page → manual crop → PVC/Normal output → A4 sheet.
- PDF uploads are rasterized page-by-page for editing while retaining each PDF page's physical dimensions from its page box (points converted to mm). No card auto-crop is applied during import.
- Raster image uploads preserve their full pixel canvas and aspect ratio. Since ordinary image files often do not carry reliable print-size metadata, their initial physical dimensions use the browser's 96-DPI CSS convention; the operator can edit source width/height in mm before cropping.
- Added a manual rectangular crop selector on the original page. Front and Back are cropped independently and saved as separate outputs.
- Added an editable Pair ID so front/back crops from separate source pages/files can be assigned to the same physical card.
- Added PVC and Normal Print modes. PVC mode uses the selected profile/custom dimensions and optional 3 mm visual corner radius. Normal mode keeps the crop aspect ratio and uses the entered physical width.
- Added A4 portrait/landscape packing, copies, mm gap, separate front/back print pages, optional back mirroring, and a 100 mm calibration page.
- Set an explicit PDF.js worker URL for the pinned PDF.js CDN version.

### Important behavior and limitations

- This is an initial implementation of the requested workflow, not a completed/certified print application.
- A PDF page's dimensions are read from its PDF page box; an uploaded image's true paper/photo size cannot reliably be inferred from pixels alone. Set the source width and height manually when the physical size matters (e.g. 4×6 inch photo).
- The crop selector is rectangular and manual. It does not yet provide perspective correction, polygon selection, zoom/pan, crop handles, undo history, or keyboard precision controls.
- The Normal Print mode preserves crop aspect ratio and uses the entered width to calculate height; it is not a full page-layout reproduction tool for arbitrary source pages.
- Pair ID must match exactly for separate front/back source pages. The UI starts each source page with its own Card number; edit it to the same ID to pair two different pages.
- A4 packing, page overflow, front/back registration, print order, browser rendering, CDN availability and physical printer scaling have not yet been tested end-to-end.
- Normal/PVC print preview and actual printer output must be reviewed. Browser print dialog must use A4 and Actual Size / 100%, with Fit to page disabled.
- No production merge or public release is authorized by this implementation.
