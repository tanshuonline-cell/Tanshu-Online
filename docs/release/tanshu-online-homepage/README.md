# TANSHU ONLINE Homepage — Release Pack

> Purpose: one place to find, review, test, and later release the homepage changes. This file is a handoff/index; it does not itself deploy or publish anything.

## 1. Protected working snapshot

- Repository: tanshuonline-cell/Tanshu-Online
- Working branch: homepage-reference-preview
- Reference commit confirmed: [f20e2d2](https://github.com/tanshuonline-cell/Tanshu-Online/commit/f20e2d2ed70690eabe41eedaf40d37e50cac9140) — footer Digital Center link points to the known working Digital Seva page.
- Preview deployment: [https://9737a860.tanshu-online.pages.dev/](https://9737a860.tanshu-online.pages.dev/)
- Known working Digital Seva destination: [https://52868321.tanshu-online.pages.dev/digital-seva](https://52868321.tanshu-online.pages.dev/digital-seva)
- Production branch: main — not changed by this release pack.
- Tanshu Studio branch: feature/tanshu-studio — out of scope and untouched.

Keep homepage work on homepage-reference-preview until the owner explicitly approves production release. Do not merge the archive branch wholesale; it contains many unrelated commits.

## 2. Homepage change categories

### A. Digital Center / Digital Seva entry points
- Added a dedicated DigitalCenterBanner component.
- Banner is placed in src/App.tsx after CategoryNavigationSection and before the Video Learning Center.
- Banner includes the animated gold rotating border, Tanshu identity/profile image, English/Hindi explanatory copy, and a Digital Seva CTA.
- Header desktop and mobile navigation include the Tanshu Digital Center entry.
- Footer includes a Tanshu Digital Center link.
- Header, banner and footer point to the known working destination above (absolute URL), rather than the missing same-origin /digital-seva route.

### B. Featured Tools ordering and selection
The featured set is configured in src/components/FeaturedTools.tsx and tool metadata in src/data/toolsData.ts:
1. Advanced Passport Photo Studio
2. Multi-Printer Auto Print (PDF-to-PVC Card Auto Cropper)
3. Photo & Signature Resizer
4. PDF OCR & Text Extractor (Hindi & English)
5. Auto Document Cropper
6. Document Scanner & Image Rectifier
7. ID Card Front-Back Print Layout Maker
8. Invoice Generator

The PDF OCR tool is marked featured in the tool data. The Featured Tools component limits the displayed selection to eight and includes its preview image handling and a Digital Center shortcut.

### C. Navigation and page composition
- Header desktop/mobile navigation updated for the Digital Center destination.
- Main page inserts the large Digital Center banner in the intended position after category browsing.
- Footer navigation includes the Digital Center destination.
- Existing tools, service, scheme, video and about sections remain part of the homepage.

### D. Visual design and interaction
- Animated conic-gradient/gold border on the Digital Center banner.
- Motion reduction is respected through prefers-reduced-motion.
- Banner surface and CTA both lead to the Digital Seva destination.
- Existing responsive header/mobile navigation retained with the added entry.

## 3. Code map

| Area | File | Responsibility |
|---|---|---|
| Homepage composition | src/App.tsx | Banner import and placement |
| Digital Center banner | src/components/DigitalCenterBanner.tsx | Animated banner, copy, CTA, destination |
| Header | src/components/Header.tsx | Desktop/mobile Digital Center links |
| Footer | src/components/Footer.tsx | Footer Digital Center link |
| Featured tools | src/components/FeaturedTools.tsx | Featured ordering, eight-item display, shortcut |
| Tool metadata | src/data/toolsData.ts | Featured flag for PDF OCR |

## 4. Important routing finding — do not overlook

The homepage preview branch is based on main and does not contain the full Digital Seva page route implementation. A relative link to /digital-seva on the homepage preview therefore resolves to the homepage fallback, not the Digital Seva service catalogue.

The separately deployed destination https://52868321.tanshu-online.pages.dev/digital-seva was checked and returns the actual Digital Seva Center page. Keep the absolute destination until the Digital Seva route and its complete dependency tree are deliberately ported and tested in this app. Do not claim the preview's same-origin /digital-seva route works.

Original historical source for the earlier banner and route implementation:
- [Archived App.tsx banner source](https://github.com/tanshuonline-cell/Tanshu-Online/blob/archive/digital-seva-website-services-2026-11-08/src/App.tsx#L503)
- Historical branch: archive/digital-seva-website-services-2026-11-08
This is a reference only, not an instruction to merge that branch.

## 5. Preview and acceptance checklist

Before asking for final approval, manually test on desktop and mobile:
- [ ] Homepage loads without console/runtime errors.
- [ ] Header Digital Center link opens the known working Digital Seva page.
- [ ] Category cards and existing navigation still work.
- [ ] Large animated Digital Center banner appears directly after Browse by Government Category.
- [ ] Banner animation runs and reduced-motion preference is respected.
- [ ] Banner surface and CTA both open the correct Digital Seva destination.
- [ ] Video Learning Center remains below the banner.
- [ ] All eight Featured Tools appear in the intended order and each opens the correct tool.
- [ ] Footer Digital Center link opens the same destination.
- [ ] Responsive layout checked at phone, tablet and desktop widths.
- [ ] No accidental changes to unrelated pages, tool functionality, payments, forms or Tanshu Studio.
- [ ] Confirm the deployed Cloudflare Pages build corresponds to the intended Git commit before sharing it as the accepted preview.

Latest known preview deployment URL: [9737a860 preview](https://9737a860.tanshu-online.pages.dev/). A successful homepage fetch showed the homepage sections and the Digital Center link. The preview's own /digital-seva path was separately checked and still returned the homepage, so use the absolute external Digital Seva destination.

## 6. Production release procedure (approval required)

1. Get explicit owner approval of the preview and the exact release scope.
2. Compare homepage-reference-preview against the current main; review every changed file and confirm no unrelated changes.
3. Re-run build, lint/type checks and the acceptance checklist.
4. Confirm Cloudflare Pages production project/branch settings and deployment commit.
5. Merge only the reviewed homepage changes into main (prefer a reviewed PR); do not merge the historical archive branch.
6. Verify production homepage, all navigation, all eight tools and all Digital Center links after deployment.
7. Keep the preview branch and this release pack as the audit/rollback reference. If production fails, revert the release commit/PR rather than improvising edits on production.

**No production merge, production deployment, DNS change, or Tanshu Studio change is authorized by this document.**

## 7. Google Search / SEO launch checks

A code release cannot guarantee Google indexing or ranking. Before/after production launch, verify:
- page title and meta description are accurate and unique;
- canonical URL points to the intended production homepage;
- robots directives allow indexing where intended;
- sitemap contains the canonical homepage and is submitted in Google Search Console;
- important internal links are crawlable;
- no preview/staging URL is exposed as the canonical URL or submitted as production;
- mobile usability, HTTPS, page performance and structured data (if present) are checked;
- Search Console URL Inspection is used to request indexing after the production URL is live.

## 8. Change history and source of truth

This release pack documents the homepage preview work. The Git branch and its commit history remain the source of truth for the actual code. Do not copy code from old chat messages or manually recreate changes when the branch is available.

When making an approved future change, update this file's code map, category list, preview URL/commit reference, and acceptance checklist in the same branch.