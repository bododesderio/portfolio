# Bodo Desderio — personal archive redesign

The implemented direction is a substantial personal portfolio: an introduction to Bodo on Home, a detailed biography and history on About, and dedicated archives for work, writing, and photographs. The homepage offers a snippet of every part of that life. It does not use a product pitch or sales funnel.

This supersedes the earlier “Quiet confidence” product-style proposal. The application source is the working implementation; the screenshots in this folder show it with the existing seeded CMS content. Production content has not been overwritten or deployed.

## Benchmarks

All references were considered together; none is the primary template. Their content models and useful interactions inform an original visual design.

| Reference | Relevant observation | Applied here |
| --- | --- | --- |
| [Gwern](https://gwern.net/) and [its design notes](https://gwern.net/design) | A deep, interconnected archive with a contents index, search, and reader controls. | Section navigation, global search, reader preferences, meaningful links between biography, work, and writing. The logo and layout are original. |
| [Maggie Appleton](https://maggieappleton.com/) and [About](https://maggieappleton.com/about) | Personal context, career history, interests, and different kinds of writing have room to coexist. | A visual profile panel, separate content archives, and detailed personal history. |
| [Derek Sivers](https://sive.rs/) and [About](https://sive.rs/about) | A short introduction leads into extensive personal history, projects, writing, and other interests. | Homepage snippets and a chronological About page. Its sparse UI was not used as a layout reference. |
| [Patrick Collison](https://patrickcollison.com/) | A personal site can cover a broad range of ideas and activities. | Content breadth, without using its structure or appearance. |
| [Steph Ango](https://stephango.com/) | A readable, dated writing archive and direct access to personal context. | Article dates, restrained reading layouts, and durable links. |

## What is implemented

- **Home:** personal introduction, portrait and quick facts, history preview, work/ventures, community, personal interests, recent writing, photographs, mentions, and social links.
- **About:** full biography, chronological life history, experience, community participation, values, interests, photographs, and external contributions. Personal details come from existing CMS content; no birthday, awards, or personal achievements were invented.
- **Work:** visible projects with status filters, project detail pages, dates, tools, body copy, relevant images, and related work. The URL remains `/projects`.
- **Writing:** server-side search, category filtering, pagination, dated article rows, focused article pages, and one optional newsletter form. The URL remains `/blog`.
- **Gallery:** category filters and a native dialog viewer with next/previous controls, arrow-key support, Escape, and focus restoration.
- **Contact:** email and social links, a simple contact form, personal as well as professional subject choices, and the existing booking link where configured.
- **Supporting pages:** capabilities, privacy, terms, and full search results share the same visual language.

## Search and reading controls

The header search button and `Ctrl/⌘ K` open a native search dialog. Enter also opens a shareable `/search?q=...` results page. Search covers public biography fields, published writing, and visible projects, with bounded query length and result counts. Draft posts, hidden projects, messages, subscribers, credentials, and settings are outside the search queries. The endpoint is read-only and rate-limited using the existing Redis helper.

Search shows a loading state, empty results, and service errors. Its snippets are rendered as text. The shared implementation is `lib/data/public-search.ts`, used by both `/api/search` and the full search page.

Reading settings offer:

- Light, dark, or automatic appearance, through the existing theme provider.
- Small (15px), standard (17px), or large (19px) reading text.
- Standard or wide reading width.
- Reset to the default preferences.

Text/width preferences are stored locally on the reader's device and scoped to the public site. The controls use native dialogs for focus isolation and Escape handling. The admin remains a separate visual environment.

## Identity

The **BD folio** is a custom vector monogram combining Bodo’s initials with an open book and bookplate corner marks. It suggests an ongoing personal archive. It does not reproduce another site's emblem.

[Open the identity sheet](identity.html) to inspect:

- Primary and reversed monograms.
- Horizontal wordmark and circular archive seal.
- SVG favicon, ICO fallback, and Apple touch icon.
- Seven custom line icons: biography, work, writing, community, photographs, mentions, and interests.

Production assets are in `public/identity/`. The inline component masters are `components/personal/BrandMark.tsx` and `PersonalIcon.tsx`. The default public font is the installed **Inter Variable**, named consistently with its font-face declaration. The palette uses warm paper, charcoal/forest, muted green links, fine rules, and a restrained brass accent; the dark palette is defined separately.

## Existing CMS content

The redesign uses existing records and requires no database schema change:

| Content | Source |
| --- | --- |
| Name, role, portrait | Home `hero.*` |
| Introductory biography | Home `about.paragraph_1…3` |
| Full biography, roles | Home `bio.body`, `bio.roles` |
| Interests | About `interests.body` when supplied; otherwise the existing personal-interests paragraph is separated from the biography. The full paragraph remains available on About. |
| Timeline, values, mission | About `story.items`, `values.items`, `mission.statement` |
| Work, writing, gallery, mentions | Existing Project, BlogPost, GalleryItem/Media, and PressItem records |
| Contact, social profiles, résumé, navigation | Existing site settings |

The public navigation parser now validates saved JSON, filters unsafe destinations, removes duplicate destinations, and preserves custom labels/visibility. Legacy default labels “Projects” and “Blog” display as “Work” and “Writing.” The admin navigation defaults match those labels. Editorial JSON lists tolerate malformed entries rather than breaking the public page.

## Additional corrections made during implementation

- Hardened shared, inline, and middleware admin guards to require a concrete user ID and email. Configuration-error objects are rejected before handlers or secret reads. Regression tests cover malformed sessions and valid admin access.
- Repaired the uppercase `.JPG` image failure. Those public image paths entered the middleware while lowercase image paths were skipped; the image optimizer's internal request had no user agent and was rejected by the bot filter. The exemption is limited to image files under `/images/` and `/uploads/`. Regression tests confirm that admin paths still require authentication.
- Retained the named-Person ProfilePage fix and actual JSON-LD script. Removed an unnecessary nonce on the non-executable JSON-LD block that generated a development hydration warning; executable theme/framework scripts retain the nonce policy.
- Removed the public page transition and the automatic public loading boundary. The latter left JavaScript-disabled browsers on a skeleton because completing the streamed boundary required JavaScript. Public content now waits for server reads before rendering. The admin retains its loading UI.
- Removed global copy/context-menu interception and imperative AxiomUI input replacements, restoring ordinary browser/editor behavior.
- Public metadata uses one title template, and project/article metadata applies the same publication/visibility conditions as the page body.
- Homepage data reads execute concurrently with bounded projections, and featured work comes from Projects rather than GalleryItems.

## Validation and limits

The check artifacts are stored beside this document in [verification.json](verification.json). Repository validation includes TypeScript, ESLint, 194 unit/API tests, and a successful production build. The scratch database was initialized using all nine committed migrations. Thirty browser page checks cover the public pages at desktop/mobile widths, narrower 320px and 768px layouts, and selected dark layouts. Nine interaction checks cover search, reader preferences, gallery navigation, content filters, and the contact UI. Five additional admin screen checks include both mounted rich-text editors. Focused production checks found no console errors on Home, About, or Search, confirmed the CSP remained present, and verified that the profile remains visible with JavaScript disabled. The contact POST is intercepted during that UI check so it does not send mail.

An additional database-backed check inserted a draft article and hidden project with a unique search sentinel, confirmed that public search returned no matches, and removed the fixtures. All test records and services are isolated from production.

This work does not claim to close every baseline audit finding. Dependency updates, session-policy changes, durable campaign delivery, production backup restoration, and Search Console validation remain separate work. Deploy the completed code and run Google's live URL/Rich Results validation before marking the original Search Console issue resolved.
