# CV corrections and shared responsive appearance

The owner’s `/Data/Documents/My Resume.pdf` is the primary source for this update. The public transcription is in `prisma/data/cv-profile.json`. The raw document and its reference contacts are not copied into the repository. The public résumé PDF is a refreshed summary with city-level location, the owner’s existing public contact details, and no private reference contacts or street address.

## Corrected facts

- FIMAT: Electrical Engineering certificate, March 2019–December 2020.
- IUEA: Computer Science diploma, August 2021.
- KIU: Computer Science bachelor’s programme, August 2023.
- Udemy: Advanced SEO Engineering, March–December 2025.
- ALX: Professional Foundations certificate, undated.
- Kakebe: volunteer junior developer, December 2021–October 2023; Software Engineer & SEO Specialist, November 2023–present.
- Parler Foundation: Founder & Executive Director, 2023–present.
- A Better Life International: Social Media Manager, June 2024–present.
- Transform Open Arena: Board Member, May 2023–present.
- African Youth Congress, Uganda Chapter: President, 2023–2024.
- Volunteering: Derowaa, Kakebe, Global Education Innovators, and Journey International.

The isolated August dates are displayed as given: no start/completion date or graduation claim is inferred. The previous invented 2018 university chapter is removed. Rooibok is retained as the existing, owner-confirmed venture, with no invented founding year. Thirteen dated timeline entries, five education records, six roles, four volunteer records, ten skills, languages and interests are now represented. These sections are editable in the existing CMS and searchable.

The targeted `scripts/sync-cv-profile.cjs --apply` updates these public content fields and city, without replacing work, writing, messages, subscribers, media or credentials. The normal seed calls the same synchronizer so a fresh seed does not restore the old timeline. Production seeding remains disabled. The pre-update database and uploads were backed up at `/opt/myportfolio-backups/20261116T182019Z-cv`; gzip integrity was verified and the previous app image retained.

## Appearance and reference

Goodname Finance’s local admin portal supplied the reference for compact page headers, semantic colour pairs, responsive shell, folding navigation and fullscreen controls. Its financial features and data are not imported. The portfolio keeps its own identity, content search, biography contents, reading settings, editors, media/gallery, newsletter, inbox, SEO and integrations.

One root preference provider and one set of light/dark surface tokens now serve public pages, login and authenticated admin. Explicit browser choices persist across navigation and tabs; admin entry no longer overwrites a public choice. Device theme mode remains available. The existing configured brand colour applies consistently to both areas, using darker/lighter variants for readable text and controls.

Default body size is 14px, Small is 12px and Large is 16px. Page titles are capped near 26px at the default, story/record headings are about 14–17px, and typography follows the shared size setting. Width controls apply to both areas. Touch-focused inputs stay at least 16px to avoid mobile browser auto-zoom. All content remains scrollable and wrapping; short-height contents panels and mobile dialogs do not lose controls outside the viewport.

## Verification

- [Responsive matrix](verification.json): 180 public/admin route and viewport checks in Chromium, Firefox and WebKit, widths 240–3840px, plus short landscape windows. No failures.
- [Interaction checks](interaction-verification.json): cross-tab preferences, automatic device theme, native fullscreen, qualification search, Escape, and WebKit iPhone touch emulation at 3× pixel density.
- TypeScript, ESLint and 210 unit/API tests pass.
- The WebKit test runtime used a missing libevent library extracted into `/tmp`; no host packages or application dependencies were installed. The development CSP upgrade directive was corrected for the HTTP loopback server; HTTPS production retains transport upgrading.
- Production build and live MCP checks are recorded after deployment.
